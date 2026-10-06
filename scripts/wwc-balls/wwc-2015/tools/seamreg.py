import sys,json;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
def line_map(img,R):
    L=img.mean(-1).astype(np.float32);sat=img.max(-1)-img.min(-1)
    k=max(5,int(R/45))|1
    bh=cv2.morphologyEx(L,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(k,k)))
    white=((L>.55)&(sat<.18)).astype(np.uint8);white=cv2.erode(white,np.ones((k*2+1,k*2+1),np.uint8))
    bh=cv2.GaussianBlur(bh,(0,0),max(1,R/400))
    return bh,white
def score(M,ph,P,bh,white,minn=150):
    C=P@M.T;X,Y=ph.project(C);f=ph.facing(C);H,W=bh.shape
    ok=(f>.3)&(X>=0)&(Y>=0)&(X<W-1)&(Y<H-1)
    xi=X[ok].astype(int);yi=Y[ok].astype(int);w=white[yi,xi]>0
    if w.sum()<minn: return -1
    v=sample(bh,X[ok][w],Y[ok][w])
    # normalise by the white-area mean response
    return v.mean()
def rand_rots(n,seed=0):
    rng=np.random.default_rng(seed);Q=rng.normal(size=(n,4));Q/=np.linalg.norm(Q,axis=1,keepdims=True);out=[]
    for w,x,y,z in Q: out.append(np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]))
    return out
def register_seams(ph,P,trials=20000,top=20):
    bh,white=line_map(ph.img,ph.R);Ps=P[::6]
    res=[(score(M,ph,Ps,bh,white),M) for M in rand_rots(trials)]
    res.sort(key=lambda t:-t[0]);out=[]
    for s0,M0 in res[:top]:
        w=np.zeros(3);c0=score(M0,ph,P,bh,white);step=.03
        while step>3e-4:
            imp=False
            for i in range(3):
                for sg in (step,-step):
                    w2=w.copy();w2[i]+=sg;c=score(rodrigues(w2)@M0,ph,P,bh,white)
                    if c>c0:c0,w,imp=c,w2,True
            if not imp: step/=2
        out.append((c0,rodrigues(w)@M0))
    out.sort(key=lambda t:-t[0]);return out,bh,white
