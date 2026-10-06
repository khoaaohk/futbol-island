import sys,json;sys.path.insert(0,'tools');from sphere import *
Z=np.load('oz_layers.npz');v=Z['v'].astype(np.float32);dark=cv2.GaussianBlur(v[...,1],(0,0),4)
la=Z['la'].astype(np.float32);G=np.load('oz_G.npy')
eqW=dark.shape[1];eqH=dark.shape[0]
def pdark(ph):
  A=cv2.medianBlur((ph.img*255).astype(np.uint8),7).astype(np.float32)/255;L=A.mean(-1)
  return cv2.GaussianBlur(np.clip((.38-L)/.15,0,1),(0,0),ph.R/120)
def run(name,path,cx,cy,R,D):
  ph=Photo(path,cx,cy,R,D);pdk=pdark(ph)
  rng=np.random.default_rng(0);pts=[]
  while len(pts)<1500:
    x,y=rng.uniform(-1,1,2)
    if x*x+y*y<.75: pts.append((x,y,math.sqrt(1-x*x-y*y)))
  C=np.array(pts);X,Y=ph.project(C);fp=sample(pdk,X,Y);fp=fp-fp.mean()
  def cost(M):
    B=C@M;Xb,Yb=dir_to_eq(B,eqW,eqH);fb=sample(dark,Xb,Yb,wrap=True);return -np.corrcoef(fp,fb)[0,1]
  Q=rng.normal(size=(20000,4));Q/=np.linalg.norm(Q,axis=1,keepdims=True);best=[]
  for q in Q:
    w,x,y,z=q;M=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    best.append((cost(M),M))
  best.sort(key=lambda t:t[0]);outs=[]
  for c0,M0 in best[:25]:
    w=np.zeros(3);st=.05;c=cost(M0)
    while st>2e-4:
      imp=False
      for i in range(3):
        for s in(st,-st):
          w2=w.copy();w2[i]+=s;cc=cost(rodrigues(w2)@M0)
          if cc<c:c,w,imp=cc,w2,True
      if not imp: st/=2
    outs.append((c,rodrigues(w)@M0))
  outs.sort(key=lambda t:t[0]);print(name,[round(o[0],3) for o in outs[:6]])
  np.save(f'Mf_{name}.npy',np.array([o[1] for o in outs[:10]]));json.dump([cx,cy,R,D],open(f'Cf_{name}.json','w'))
args=sys.argv[1:];run(args[0],args[1],*map(float,args[2:5]),None if args[5]=='None' else float(args[5]))
