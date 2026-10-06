import sys,json;sys.path.insert(0,'.');from geo32 import *
def seamfit(path,cx,cy,R,D,M0,seammap,blur=1.5,fixD=False,iters=3):
    ph=Photo(path,cx,cy,R,D,M0);L=cv2.GaussianBlur(ph.img.mean(-1),(0,0),blur)
    # local contrast: seam darker than surroundings
    bg=cv2.GaussianBlur(L,(0,0),6);Lc=L-bg
    S=seammap.D[seammap.seam];S=S[::3]
    def f(v):
        M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R=cx+v[3],cy+v[4],R*(1+v[5]);ph.D=None if D is None else D*math.exp(v[6])
        C=S@M.T;X,Y=ph.project(C);fc=ph.facing(C);m=fc>.3
        return sample(Lc,X[m],Y[m]).mean()
    v=np.zeros(7);st=np.array([.01,.01,.01,R*.01,R*.01,.01,.15]);c0=f(v)
    if D is None or fixD: st[6]=0
    while st[0]>2e-4:
        imp=False
        for i in range(7):
            if st[i]==0: continue
            for s in (st[i],-st[i]):
                v2=v.copy();v2[i]+=s;c=f(v2)
                if c<c0:c0,v,imp=c,v2,True
        if not imp: st/=2
    f(v);ph.M=rodrigues(v[:3])@M0;return c0,ph
