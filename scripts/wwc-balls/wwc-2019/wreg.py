import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *
from seamreg import quat
E=np.asarray(Image.open('out/cx2-eq.png').convert('RGB')).astype(np.float32)/255
sat=E.max(-1)-E.min(-1);Wt=((sat<.15)&(E.mean(-1)>.6)).astype(np.float32);Wt=cv2.GaussianBlur(Wt,(0,0),3)
EH,EW=Wt.shape
def wmask(img):
    c=cv2.GaussianBlur(img,(0,0),2);sat=c.max(-1)-c.min(-1);return ((sat<.18)&(c.mean(-1)>.5)).astype(np.float32)
def reg(path,cx,cy,R,D=None,trials=40000,name='x'):
    ph=Photo(path,cx,cy,R,D);wm=wmask(ph.img)
    rng=np.random.default_rng(0);pts=[]
    while len(pts)<1500:
        x,y=rng.uniform(-1,1,2)
        if x*x+y*y<.8: pts.append((x,y,math.sqrt(1-x*x-y*y)))
    C=np.array(pts);X,Y=ph.project(C);v=sample(wm,X,Y);v=(v-v.mean())/(v.std()+1e-6)
    def sc(M):
        B=C@M;x,y=dir_to_eq(B,EW,EH);t=sample(Wt,x,y,wrap=True);return (v*(t-t.mean())).mean()/(t.std()+1e-6)
    Q=rng.normal(size=(trials,4));Q/=np.linalg.norm(Q,axis=1,keepdims=True)
    res=sorted(((sc(quat(q)),i) for i,q in enumerate(Q[:,:])),reverse=True)[:20]
    out=[]
    for s0,i in res:
        M0=quat(Q[i]);w=np.zeros(3);c0=s0;st=.03
        while st>3e-4:
            imp=False
            for j in range(3):
                for s in (st,-st):
                    w2=w.copy();w2[j]+=s;c=sc(rodrigues(w2)@M0)
                    if c>c0:c0,w,imp=c,w2,True
            if not imp: st/=2
        out.append((c0,rodrigues(w)@M0))
    out.sort(key=lambda t:-t[0]);return out,ph
