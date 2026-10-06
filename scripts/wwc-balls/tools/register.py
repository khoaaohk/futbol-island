"""Register a photo to a sphere texture: find M (ball->camera) maximizing agreement. base: equirect float RGB."""
import sys;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
def feats(c):
    g=c.mean(-1,keepdims=True);return np.concatenate([g*2,c-g],-1)
def std(f,m):
    mu=f[m].mean(0);sd=f[m].std(0)+1e-3;return (f-mu)/sd
def cam_samples(ph,n=1500,rmax=.85,seed=0):
    rng=np.random.default_rng(seed);pts=[]
    while len(pts)<n:
        x,y=rng.uniform(-1,1,2)
        if x*x+y*y<rmax*rmax: pts.append((x,y,math.sqrt(1-x*x-y*y)))
    C=np.array(pts);X,Y=ph.project(C)
    col=sample(ph.img,X,Y);return C,col
def cost(M,C,fp,base,bw,bh):
    B=C@M  # ball dirs (rows) = M^T c
    X,Y=dir_to_eq(B,bw,bh);fb=sample(base,X,Y,wrap=True)
    return np.abs(fb-fp).mean()
def register(ph,base,n=1500,trials=30000,seed=1,group=None,init=None):
    bh,bw=base.shape[:2]
    C,col=cam_samples(ph,n);fp=feats(col);
    allb=feats(base);m=np.ones(base.shape[:2],bool);mu=allb.reshape(-1,allb.shape[-1]).mean(0);sd=allb.reshape(-1,allb.shape[-1]).std(0)+1e-3
    baseF=(allb-mu)/sd;fp=(fp-fp.mean(0))/(fp.std(0)+1e-3)
    rng=np.random.default_rng(seed);best=[]
    if init is None:
        Q=rng.normal(size=(trials,4));Q/=np.linalg.norm(Q,axis=1,keepdims=True)
        sub=slice(0,300)
        for q in Q:
            w,x,y,z=q;M=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
            best.append((cost(M,C[sub],fp[sub],baseF,bw,bh),M))
        best.sort(key=lambda t:t[0]);cands=[b[1] for b in best[:40]]
    else: cands=[init]
    out=[]
    for M0 in cands:
        f=lambda w:np.array([cost(rodrigues(w)@M0,C,fp,baseF,bw,bh)])
        # simple coordinate descent on rotation vector
        w=np.zeros(3);step=.05;c0=f(w)[0]
        while step>2e-4:
            imp=False
            for i in range(3):
                for s in (step,-step):
                    w2=w.copy();w2[i]+=s;c=f(w2)[0]
                    if c<c0:c0,w,imp=c,w2,True
            if not imp: step/=2
        out.append((c0,rodrigues(w)@M0))
    out.sort(key=lambda t:t[0]);return out
def resolve(ph,M,G,refs,W=512):
    """Pick g in G so that M@g aligns ph's unique marks with the reference photos (already calibrated)."""
    D=eq_dirs(W,W//2);rc=[];rw=[]
    for r in refs:
        c,w=r.sample_ball(D);rc.append(feats(c));rw.append(w)
    res=[]
    for i,g in enumerate(G):
        ph.M=M@g;c,w=ph.sample_ball(D);f=feats(c);tot=0;n=0
        for fc,ww in zip(rc,rw):
            m=(w>.3)&(ww>.3);tot+=np.abs(f[m]-fc[m]).sum();n+=m.sum()
        res.append((tot/n if n>2000 else 9e9,i,n))
    res.sort();ph.M=M@G[res[0][1]];return res
def refine_full(path,cx,cy,R,D,M0,base,n=3000,blur=150,fixD=False):
    """Coordinate descent over rotation (3), circle (cx,cy,R) and log D. Returns (cost, Photo)."""
    raw=Photo(path,cx,cy,R,D);img=cv2.GaussianBlur(raw.img,(0,0),R/blur)
    allb=feats(base);mu=allb.reshape(-1,allb.shape[-1]).mean(0);sd=allb.reshape(-1,allb.shape[-1]).std(0)+1e-3;baseF=(allb-mu)/sd
    bh,bw=base.shape[:2]
    rng=np.random.default_rng(0);pts=[]
    while len(pts)<n:
        x,y=rng.uniform(-1,1,2)
        if x*x+y*y<.8: pts.append((x,y))
    pts=np.array(pts)
    def f(v):
        M=rodrigues(v[:3])@M0;ccx,ccy,RR=cx+v[3],cy+v[4],R*(1+v[5]);DD=None if D is None else D*math.exp(v[6])
        ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=ccx,ccy,RR,DD
        # camera-sphere points from normalized disc positions (ortho approx for sampling the sphere uniformly)
        C=np.c_[pts,np.sqrt(1-(pts**2).sum(1))];X,Y=ph.project(C);fp=feats(sample(img,X,Y));fp=(fp-fp.mean(0))/(fp.std(0)+1e-3)
        B=C@M;Xb,Yb=dir_to_eq(B,bw,bh);fb=sample(baseF,Xb,Yb,wrap=True);return np.abs(fb-fp).mean()
    v=np.zeros(7);steps=np.array([.03,.03,.03,R*.01,R*.01,.01,.1]);c0=f(v)
    if D is None or fixD: steps[6]=0
    while steps.max()>1e-4*max(1,R*.01) and (steps[:3].max()>2e-4):
        imp=False
        for i in range(7):
            if steps[i]==0: continue
            for s in (steps[i],-steps[i]):
                v2=v.copy();v2[i]+=s;c=f(v2)
                if c<c0:c0,v,imp=c,v2,True
        if not imp: steps/=2
    ph=Photo(path,cx+v[3],cy+v[4],R*(1+v[5]),None if D is None else D*math.exp(v[6]),rodrigues(v[:3])@M0)
    return c0,ph
