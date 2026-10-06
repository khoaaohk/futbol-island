"""Register a photo to the GLSL panel geometry by its visible seam grooves."""
import sys,json;sys.path.insert(0,'/private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2019');from geom import *
def groove_map(img,R,k=None):
    L=(img.mean(-1)*255).astype(np.uint8);k=k or max(3,int(R/120)|1)
    m=cv2.medianBlur(L,k).astype(np.float32);hp=m-cv2.GaussianBlur(m,(0,0),R/90)
    g=np.clip(-hp,0,None);g=cv2.GaussianBlur(g,(0,0),R/400+.5);g=g/np.percentile(g,99)
    c=cv2.medianBlur((img*255).astype(np.uint8),k).astype(np.float32)/255;sat=c.max(-1)-c.min(-1);Lm=c.mean(-1)
    white=cv2.GaussianBlur(((sat<.12)&(Lm>.55)).astype(np.float32),(0,0),R/60)
    return g*np.clip((white-.3)/.4,0,1)
SP=S.D[S.seam];SP=SP[::max(1,len(SP)//4000)]
def score(ph,g,M):
    C=SP@M.T;X,Y=ph.project(C);f=ph.facing(C);H,W=g.shape;ok=(f>.35)&(X>1)&(Y>1)&(X<W-2)&(Y<H-2)
    if ok.sum()<200: return 0
    return sample(g,X[ok],Y[ok]).sum()/max(200,ok.sum())
def quat(q):
    w,x,y,z=q;return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def search(ph,g,trials=20000,seed=0,top=30):
    rng=np.random.default_rng(seed);Q=rng.normal(size=(trials,4));Q/=np.linalg.norm(Q,axis=1,keepdims=True)
    res=sorted(((score(ph,g,quat(q)),i) for i,q in enumerate(Q)),reverse=True)[:top]
    out=[]
    for s0,i in res:
        M0=quat(Q[i]);w=np.zeros(3);c0=s0;st=.03
        while st>3e-4:
            imp=False
            for j in range(3):
                for s in (st,-st):
                    w2=w.copy();w2[j]+=s;c=score(ph,g,rodrigues(w2)@M0)
                    if c>c0:c0,w,imp=c,w2,True
            if not imp: st/=2
        out.append((c0,rodrigues(w)@M0))
    out.sort(key=lambda t:-t[0]);return out
if __name__=='__main__':
    name,path,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]);D=None if sys.argv[6]=='None' else float(sys.argv[6])
    ph=Photo(path,cx,cy,R,D);g=groove_map(ph.img,R)
    out=search(ph,g)
    print(name,[round(o[0],3) for o in out[:8]])
    np.save(f'Mseam_{name}.npy',np.array([o[1] for o in out[:8]]));json.dump([cx,cy,R,D],open(f'C_{name}.json','w'))
    # overlay best
    ph.M=out[0][1];overlay(ph,S,f'ovs_{name}.jpg')
