import sys,json
src=open('oz2.py').read().split('# ---------------------------------------------------------------- colourways')[0]
sys.argv=['oz2.py','out/v2','16'];exec(src)
D=eq_dirs(300,150);names=list(PH7)
def samp(n,Q):
  ph=PH7[n];C=Q@ph.M.T;X,Y=ph.project(C);f=ph.facing(C);H,W=ph.img.shape[:2]
  ok=(X>=0)&(Y>=0)&(X<W-1)&(Y<H-1)&~BAD7.get(n,lambda X,Y:X<-1e9)(X,Y)
  return sample(CM7[n],X,Y)[...,:2],np.where(ok,f,0)
triin=[tri_lookup(D@g.T)[0] for g in G]
for it in range(2):
  for k in names:
    ph=PH7[k];M0=ph.M.copy();cx0,cy0,R0=ph.cx,ph.cy,ph.R
    pre=[(samp(j,D@G[gi].T),gi) for j in names for gi in range(len(G)) if j!=k]
    pre=[p for p in pre if (p[0][1]>.4).mean()>.01]
    def f(v):
      ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R=cx0+v[3],cy0+v[4],R0*(1+v[5])
      ca,fa=samp(k,D);tot=0;n=0
      for (cb,fb),gi in pre:
        m=(fa>.4)&(fb>.4)&~triin[0]&~triin[gi];wgt=3. if gi==0 else 1.
        tot+=wgt*np.abs(ca[m]-cb[m]).sum();n+=wgt*m.sum()
      return tot/max(n,1)
    v=np.zeros(6);steps=np.array([.01,.01,.01,R0*.005,R0*.005,.005]);c0=f(v);cs=c0
    while steps[0]>5e-4:
      imp=False
      for i in range(6):
        for s_ in (steps[i],-steps[i]):
          v2=v.copy();v2[i]+=s_;c=f(v2)
          if c<c0:c0,v,imp=c,v2,True
      if not imp: steps/=2
    f(v);print(it,k,round(cs,4),'->',round(c0,4),np.round(v,4),flush=True)
    np.save(f'M_{k}.npy',ph.M);json.dump([ph.cx,ph.cy,ph.R,ph.D],open(f'C_{k}.json','w'))
