import sys,json;sys.path.insert(0,'tools');from sphere import *;from register import rodrigues
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
S={'a3':(R+'16397047065.jpg','Mg_a3.npy','C_a3g.json'),'a1':(R+'15774583044.jpg','Mg_a1.npy','C_a1g.json')}
def load(p,m,c):
  cx,cy,Rr,D=json.load(open(c));ph=Photo(p,cx,cy,Rr,D,np.load(m));return ph
W=360;Dd=eq_dirs(W,W//2);acc=np.zeros((W//2,W,3));ws=np.zeros((W//2,W))
for k,(p,m,c) in S.items():
  ph=load(p,m,c);ph.img=cv2.GaussianBlur(ph.img,(0,0),4);col,w=ph.sample_ball(Dd);w=np.where(w>.35,w,0)**2;acc+=col*w[...,None];ws+=w
base=acc/np.maximum(ws,1e-9)[...,None];bw=ws>0
name,path,cx,cy,Rr=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]);D=10.
ph=Photo(path,cx,cy,Rr,D);ph.img=cv2.GaussianBlur(ph.img,(0,0),Rr/100)
# camera samples
rng=np.random.default_rng(0);pts=[]
while len(pts)<1500:
  x,y=rng.uniform(-1,1,2)
  if x*x+y*y<.7: pts.append((x,y,math.sqrt(1-x*x-y*y)))
C=np.array(pts);X,Y=ph.project(C);cp=sample(ph.img,X,Y)
def feat(c): g=c.mean(-1,keepdims=True);return np.concatenate([g,(c-g)*2],-1)
fp=feat(cp);fp=(fp-fp.mean(0))/(fp.std(0)+1e-3);fb_all=feat(base);mu=fb_all[bw].mean(0);sd=fb_all[bw].std(0)+1e-3;fb_all=(fb_all-mu)/sd
def cost(M):
  B=C@M;Xb,Yb=dir_to_eq(B,W,W//2);fb=sample(fb_all,Xb,Yb,wrap=True);ok=sample(bw.astype(float),Xb,Yb,wrap=True)>.99
  if ok.sum()<300: return 9
  return np.abs(fb[ok]-fp[ok]).mean()-0.0002*ok.sum()
res=[]
for i in range(30000):
  q=rng.normal(size=4);q/=np.linalg.norm(q);w,x,y,z=q
  M=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
  res.append((cost(M),M))
res.sort(key=lambda t:t[0]);best=None
for c0,M0 in res[:10]:
  v=np.zeros(3);step=.03
  while step>3e-4:
    imp=False
    for i in range(3):
      for s in (step,-step):
        w2=v.copy();w2[i]+=s;c=cost(rodrigues(w2)@M0)
        if c<c0:c0,v,imp=c,w2,True
    if not imp: step/=2
  if best is None or c0<best[0]: best=(c0,rodrigues(v)@M0)
print(name,best[0]);np.save(f'Mg_{name}.npy',best[1]);json.dump([cx,cy,Rr,D],open(f'C_{name}g.json','w'))
