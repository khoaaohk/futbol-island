import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *;import zgeom;from bhunwrap import bh_img
def gmap(path,R):
    g=1-bh_img(path);g=cv2.GaussianBlur(g.astype(np.float32),(0,0),max(1.,R/500));return g
def fit(name,path,fix_theta=None,th0=20.):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));M0=np.load(f'M_{name}.npy');g=gmap(path,R);H,W=g.shape
    def f(v):
        th=fix_theta if fix_theta is not None else th0+v[6]
        SP=zgeom.seam_points(math.radians(th),40)
        ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx+v[3],cy+v[4],R*(1+v[5]),D
        C=SP@(rodrigues(v[:3])@M0).T;X,Y=ph.project(C);fa=ph.facing(C);ok=(fa>.3)&(X>1)&(Y>1)&(X<W-2)&(Y<H-2)
        return -sample(g,X[ok],Y[ok]).mean()
    v=np.zeros(7);st=np.array([.02,.02,.02,R*.01,R*.01,.01,2.]);c0=f(v);cs=c0
    if fix_theta is not None: st[6]=0
    while st[0]>2e-4:
        imp=False
        for i in range(7):
            if st[i]==0: continue
            for s in (st[i],-st[i]):
                v2=v.copy();v2[i]+=s;c=f(v2)
                if c<c0:c0,v,imp=c,v2,True
        if not imp: st/=2
    return cs,c0,v,(rodrigues(v[:3])@M0,[cx+v[3],cy+v[4],R*(1+v[5]),D])
if __name__=='__main__':
    name,path=sys.argv[1],sys.argv[2]
    cs,c0,v,(M,C)=fit(name,path)
    print(name,round(cs,4),'->',round(c0,4),'theta',round(20+v[6],2),np.round(v[:6],4))
    np.save(f'M_{name}.npy',M);json.dump(C,open(f'C_{name}.json','w'));json.dump({'theta':20+v[6]},open(f'theta_{name}.json','w'))
