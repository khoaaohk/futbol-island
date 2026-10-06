import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *;import tiles
FACES={'+x':(1,0,0),'-x':(-1,0,0),'+y':(0,1,0),'-y':(0,-1,0),'+z':(0,0,1),'-z':(0,0,-1)}
def to_face(F):
    F=nrm(np.array(FACES.get(F,F),float));z=np.array([0,0,1.])
    if np.allclose(F,z): return np.eye(3)
    if np.allclose(F,-z): return rot([1,0,0],math.pi)
    ax=np.cross(z,F);return rot(ax,math.pi/2)
def load(name,path,mode):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Shaded(path,cx,cy,R,D,np.load(f'M_{name}.npy'));c=ph.img
    f=np.stack([c[...,0]-c[...,2],c[...,1]-c[...,2],c.mean(-1)],-1).astype(np.float32)
    if mode=='bp': f=cv2.GaussianBlur(f,(0,0),R/250)-cv2.GaussianBlur(f,(0,0),R/40)
    else: f=cv2.GaussianBlur(f,(0,0),R/150)
    ph.img=f;return ph
def faceface(ph,F1,F2,n=240,half=.85,minw=.3,excl=.18):
    P=tiles.tile_dirs((0,0,1),n,half,(0,1,0));yy,xx=np.mgrid[0:n,0:n];rr=np.hypot(xx-n/2,yy-n/2)/(n/2)*half
    out=[]
    A=to_face(F1)
    ca,wa=ph.sample_ball(P@A.T)
    for k in range(4):
        B=to_face(F2)@rot([0,0,1],k*math.pi/2)
        cb,wb=ph.sample_ball(P@B.T);m=(wa>minw)&(wb>minw)&(rr>excl)
        if m.sum()<2500: out.append(None);continue
        out.append((round(float(np.mean([np.corrcoef(ca[m][:,i],cb[m][:,i])[0,1] for i in range(3)])),2),int(m.sum())))
    return out
