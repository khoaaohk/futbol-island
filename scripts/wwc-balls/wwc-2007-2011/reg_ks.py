import sys,json;sys.path.insert(0,'tools');from sphere import *
from tiles import tile_dirs
p='../refs/wwc-2011-speedcell/photo-Speedcell.jpg'
M0=np.load('M_ks.npy');T0=nrm(np.array([1.,1,1]));C3=rot(T0,2*math.pi/3)
P=tile_dirs(T0,200,.75)  # big tile around the triangle
ang=np.arccos(np.clip(P@T0,-1,1));ring=(ang>.30)&(ang<.62)
ph=Photo(p,386,262,190,5,M0);ph.img=cv2.GaussianBlur(ph.img,(0,0),1.)
def f(v):
  ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R=386+v[3],262+v[4],190*(1+v[5]);ph.D=5*math.exp(v[6])
  c0,w0=ph.sample_ball(P);c1,w1=ph.sample_ball(P@C3.T);c2,w2=ph.sample_ball(P@C3.T@C3.T)
  m=ring&(w0>.25)&(w1>.25);m2=ring&(w0>.25)&(w2>.25)
  return (np.abs(c0[m]-c1[m]).mean()*m.sum()+np.abs(c0[m2]-c2[m2]).mean()*m2.sum())/(m.sum()+m2.sum())
v=np.zeros(7);steps=np.array([.02,.02,.02,3,3,.02,.2]);c0=f(v);print('start',c0)
while steps[0]>3e-4:
  imp=False
  for i in range(7):
    for s in (steps[i],-steps[i]):
      v2=v.copy();v2[i]+=s;c=f(v2)
      if c<c0:c0,v,imp=c,v2,True
  if not imp: steps/=2
f(v);print('end',c0,np.round(v,4),ph.cx,ph.cy,ph.R,ph.D)
np.save('M_ks.npy',ph.M);json.dump([ph.cx,ph.cy,ph.R,ph.D],open('C_ks.json','w'))
