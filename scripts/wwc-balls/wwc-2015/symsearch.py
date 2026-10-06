import sys,json;sys.path.insert(0,'tools');from sphere import *;from register import rodrigues
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
S={'a3':(R+'16397047065.jpg','Mg_a3.npy','C_a3g.json'),'a1':(R+'15774583044.jpg','Mg_a1.npy','C_a1g.json')}
PH={}
for k,(p,m,c) in S.items():
  cx,cy,Rr,D=json.load(open(c));PH[k]=Photo(p,cx,cy,Rr,D,np.load(m));PH[k].img=cv2.GaussianBlur(PH[k].img,(0,0),4)
D=eq_dirs(160,80);base={k:PH[k].sample_ball(D) for k in PH}
def cost(g):
  tot=0;n=0
  for a in PH:
    ca,wa=base[a]
    for b in PH:
      cb,wb=PH[b].sample_ball(D@g.T);m=(wa>.5)&(wb>.5);tot+=np.abs(ca[m]-cb[m]).sum();n+=m.sum()*3
  return tot/n if n>3000 else 9
rng=np.random.default_rng(1);res=[]
for i in range(6000):
  q=rng.normal(size=4);q/=np.linalg.norm(q);w,x,y,z=q
  g=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
  ang=math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)))
  if ang<25: continue
  res.append((cost(g),g))
res.sort(key=lambda t:t[0]);out=[]
for c0,g0 in res[:15]:
  v=np.zeros(3);step=.05
  while step>1e-3:
    imp=False
    for i in range(3):
      for s in (step,-step):
        w2=v.copy();w2[i]+=s;c=cost(rodrigues(w2)@g0)
        if c<c0:c0,v,imp=c,w2,True
    if not imp: step/=2
  g=rodrigues(v)@g0;ang=math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)))
  wv=np.array([g[2,1]-g[1,2],g[0,2]-g[2,0],g[1,0]-g[0,1]]);ax=wv/max(np.linalg.norm(wv),1e-9)
  if ang>179: 
    ev,evec=np.linalg.eig(g);ax=np.real(evec[:,np.argmin(np.abs(ev-1))])
  out.append((c0,ang,ax));print(round(c0,3),round(ang,1),np.round(ax,3),flush=True)
