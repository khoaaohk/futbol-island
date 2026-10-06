import sys,json;sys.path.insert(0,'.');from geo32 import *
V={}
for n,p in [('fb','ref/icon_fb_c.png'),('r1','ref/IW5503_b2b012_plp.png'),('r3','ref/IW5503_b2b212_pdp.png')]:
  cx,cy,R,D=json.load(open(f'C_{n}.json'));V[n]=Photo(p,cx,cy,R,D,np.load(f'M_{n}.npy'))
def tile(h,P0,S=160,half=.42,view=None):
  e1=nrm(P0-h*np.dot(P0,h));e2=np.cross(h,e1)  # right-handed seen from outside: x=e2? use x=cross(e1,h)
  x=np.cross(e1,h)
  a=((np.arange(S)+.5)/S*2-1)*half;A,B=np.meshgrid(a,-a);P=nrm(h+x*A[...,None]+e1*B[...,None])
  best=None
  for n,ph in V.items():
    if view and n!=view: continue
    c,w=ph.sample_ball(P);s=np.median(w)
    if best is None or s>best[0]: best=(s,n,c,w)
  return best
