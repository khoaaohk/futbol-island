import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *
from build_conext19 import d3,SRC
SRC=dict(SRC);SRC['fh1']='ref/fh_1.jpg'
G=d3((1,-1,-1))
def lp(n):
    C=json.load(open(f'C_{n}.json'));ph=Shaded(SRC[n],*C,np.load(f'M_{n}.npy'));im=deshaded_image(ph)
    f=np.stack([im[...,0]-im[...,2],im[...,1]-im[...,2],im.mean(-1)],-1);ph.img=cv2.GaussianBlur(f,(0,0),ph.R/150).astype(np.float32)
    ph.coef=[np.array([1.]+[0]*8)]*3;ph.white=np.ones(3);return ph
PH={n:lp(n) for n in SRC}
D=eq_dirs(240,120)
LOGOAX=nrm(np.array([0,0,1.]))
keep=(D@LOGOAX)<math.cos(.3)
for it in range(2):
  for k in PH:
    ph=PH[k];M0=ph.M.copy();cx0,cy0,R0=ph.cx,ph.cy,ph.R;D0=ph.D or 30.
    others=[j for j in PH if j!=k]
    pre=[]
    for j in others:
      for g in G:
        Q=D@g.T;c,w=PH[j].sample_ball(Q);ok=(w>.4)&((Q@LOGOAX)<math.cos(.3))&((Q@np.array([1.,0,0]))<math.cos(.25))
        pre.append((c,ok))
    def f(v):
      ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy=cx0+v[3],cy0+v[4];ph.D=max(1.5,D0*math.exp(v[5]))
      c,w=ph.sample_ball(D);ok0=(w>.4)&keep;tot=0;n=0
      for cb,okb in pre:
        m=ok0&okb;tot+=np.abs(c[m]-cb[m]).sum();n+=m.sum()
      return tot/max(n,1)
    v=np.zeros(6);st=np.array([.01,.01,.01,R0*.004,R0*.004,.15]);c0=f(v);cs=c0
    while st[0]>3e-4:
      imp=False
      for i in range(6):
        if st[i]==0: continue
        for s in (st[i],-st[i]):
          v2=v.copy();v2[i]+=s;c=f(v2)
          if c<c0:c0,v,imp=c,v2,True
      if not imp: st/=2
    f(v);print(it,k,round(cs,4),'->',round(c0,4),np.round(np.degrees(v[:3]),2),np.round(v[3:],2),flush=True)
    np.save(f'M_{k}.npy',ph.M);json.dump([ph.cx,ph.cy,ph.R,ph.D],open(f'C_{k}.json','w'))
