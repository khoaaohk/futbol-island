import sys,json;sys.path.insert(0,'tools');from sphere import *
from tiles import tile_dirs
n,p,tri=sys.argv[1],sys.argv[2],nrm(np.array(list(map(float,sys.argv[3:6]))))
cx,cy,R,D=json.load(open(f'C_{n}.json'));M0=np.load(f'M_{n}.npy');C3=rot(tri,2*math.pi/3)
P=tile_dirs(tri,200,.75);ang=np.arccos(np.clip(P@tri,-1,1));ring=(ang>.30)&(ang<.62)
ph=Photo(p,cx,cy,R,D,M0);ph.img=cv2.GaussianBlur(ph.img,(0,0),1.)
def f(v):
  ph.M=rodrigues(v)@M0;c0,w0=ph.sample_ball(P);c1,w1=ph.sample_ball(P@C3.T);c2,w2=ph.sample_ball(P@C3.T@C3.T)
  m=ring&(w0>.25)&(w1>.25);m2=ring&(w0>.25)&(w2>.25)
  return (np.abs(c0[m]-c1[m]).sum()+np.abs(c0[m2]-c2[m2]).sum())/(m.sum()+m2.sum()+1)/3
v=np.zeros(3);step=.02;c0=f(v);s0=c0
while step>2e-4:
  imp=False
  for i in range(3):
    for s in (step,-step):
      v2=v.copy();v2[i]+=s;c=f(v2)
      if c<c0:c0,v,imp=c,v2,True
  if not imp: step/=2
f(v);print(n,round(s0,4),'->',round(c0,4),'deg',round(math.degrees(np.linalg.norm(v)),2));np.save(f'M_{n}.npy',ph.M)
