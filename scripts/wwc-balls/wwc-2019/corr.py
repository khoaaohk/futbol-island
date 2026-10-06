import sys,json;sys.path.insert(0,'.');from symtest import *;import tiles
def ph_load(name,path):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Shaded(path,cx,cy,R,D,np.load(f'M_{name}.npy'));ph.img=cv2.GaussianBlur(ph.img,(0,0),R/300);return ph
def feat(c): return np.stack([c[...,0]-c[...,2],c[...,1]-c[...,2],c.mean(-1)],-1)
def corr(phA,phB,g,T=(0,0,1),half=.8,n=300,excl=45,minw=.35):
    P=tiles.tile_dirs(T,n,half,(0,1,0) if abs(T[1])<.9 else (0,0,1));ca,wa=phA.sample_ball(P);cb,wb=phB.sample_ball(P@g.T)
    yy,xx=np.mgrid[0:n,0:n];m=(wa>minw)&(wb>minw)&(np.hypot(xx-n/2,yy-n/2)>excl)
    if m.sum()<500: return None,m.sum()
    a=feat(ca)[m];b=feat(cb)[m];return np.round([np.corrcoef(a[:,i],b[:,i])[0,1] for i in range(3)],3),m.sum()
