import sys,json;sys.path.insert(0,'.');from symtest import *;import tiles
def ph_load(name,path):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Shaded(path,cx,cy,R,D,np.load(f'M_{name}.npy'))
    c=ph.img;f=np.stack([c[...,0]-c[...,2],c[...,1]-c[...,2]],-1).astype(np.float32)
    lo=cv2.GaussianBlur(f,(0,0),ph.R/250);bp=lo-cv2.GaussianBlur(f,(0,0),ph.R/40)
    ph.img=np.concatenate([bp,bp[...,:1]*0],-1);return ph
def corr(phA,phB,g,T=(0,0,1),half=.6,n=200,minw=.4):
    P=tiles.tile_dirs(T,n,half,(0,1,0) if abs(T[1])<.9 else (0,0,1));ca,wa=phA.sample_ball(P);cb,wb=phB.sample_ball(P@g.T)
    m=(wa>minw)&(wb>minw)
    if m.sum()<4000: return None,m.sum()
    return np.mean([np.corrcoef(ca[m][:,i],cb[m][:,i])[0,1] for i in range(2)]),m.sum()
def axis(g):
  ang=math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)));ax=np.array([g[2,1]-g[1,2],g[0,2]-g[2,0],g[1,0]-g[0,1]])
  if np.linalg.norm(ax)<1e-6:
    w,v=np.linalg.eig(g);ax=np.real(v[:,np.argmin(abs(w-1))])
  return round(ang),tuple(np.round(ax/np.linalg.norm(ax),2))
TS=[(0,0,1),(1,0,1),(-1,0,1),(0,1,1),(0,-1,1),(1,1,1),(1,-1,1),(-1,1,1),(-1,-1,1),(1,0,0),(-1,0,0),(0,1,0),(0,-1,0)]
