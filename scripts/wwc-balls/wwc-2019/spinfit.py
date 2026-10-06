import sys,json;sys.path.insert(0,'.');from zfit import *
def spinfit(name,path,cx,cy,R,D,adx,ady,upx,upy):
    g=gmap(path,R);H,W=g.shape;SP=zgeom.seam_points(math.radians(19.84),30)
    ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx,cy,R,D
    def sc(M):
        C=SP@M.T;X,Y=ph.project(C);fa=ph.facing(C);ok=(fa>.3)&(X>1)&(Y>1)&(X<W-2)&(Y<H-2);return sample(g,X[ok],Y[ok]).mean()
    a=ph.cam_dir(adx,ady);u=ph.cam_dir(upx,upy)-a;z=np.array([0,0,1.])
    v=np.cross(z,a);B=rot(v/np.linalg.norm(v),math.acos(np.clip(np.dot(z,a),-1,1)))
    best=None
    for t in np.radians(np.arange(0,360,.5)):
        M=B@rot(z,t);upb=M@np.array([0,1.,0])
        if np.dot(nrm(upb-a*np.dot(upb,a)),nrm(u-a*np.dot(u,a)))<math.cos(math.radians(25)): continue
        s=sc(M)
        if best is None or s>best[0]: best=(s,t,M)
    np.save(f'M_{name}.npy',best[2]);json.dump([cx,cy,R,D],open(f'C_{name}.json','w'))
    cs,c0,v,(M,C)=fit(name,path,fix_theta=19.84);np.save(f'M_{name}.npy',M);json.dump(C,open(f'C_{name}.json','w'))
    return best[0],c0
if __name__=='__main__':
    a=sys.argv;print(spinfit(a[1],a[2],*map(float,a[3:6]),None if a[6]=='None' else float(a[6]),*map(float,a[7:11])))
