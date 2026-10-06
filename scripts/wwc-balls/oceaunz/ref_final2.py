import sys,json;sys.path.insert(0,'tools');from sphere import *
Z=np.load('oz_layers.npz');v=Z['v'].astype(np.float32);dark=cv2.GaussianBlur(v[...,1],(0,0),3);eqH,eqW=dark.shape
def refine(path,cx,cy,R,D,M0,out):
  ph=Photo(path,cx,cy,R,D);A=cv2.medianBlur((ph.img*255).astype(np.uint8),7).astype(np.float32)/255;L=A.mean(-1)
  pdk=cv2.GaussianBlur(np.clip((.38-L)/.15,0,1),(0,0),R/150)
  rng=np.random.default_rng(0);pts=[]
  while len(pts)<3000:
    x,y=rng.uniform(-1,1,2)
    if x*x+y*y<.8: pts.append((x,y,math.sqrt(1-x*x-y*y)))
  C=np.array(pts)
  def f(vv):
    p=Photo.__new__(Photo);p.cx,p.cy,p.R,p.D=cx+vv[3],cy+vv[4],R*(1+vv[5]),D
    X,Y=p.project(C);fp=sample(pdk,X,Y);M=rodrigues(vv[:3])@M0;B=C@M;Xb,Yb=dir_to_eq(B,eqW,eqH);fb=sample(dark,Xb,Yb,wrap=True)
    return -np.corrcoef(fp,fb)[0,1]
  vv=np.zeros(6);steps=np.array([.02,.02,.02,R*.01,R*.01,.01]);c0=f(vv);cs=c0
  while steps[0]>2e-4:
    imp=False
    for i in range(6):
      for s in(steps[i],-steps[i]):
        v2=vv.copy();v2[i]+=s;c=f(v2)
        if c<c0:c0,vv,imp=c,v2,True
    if not imp: steps/=2
  print(out,round(cs,3),'->',round(c0,3),np.round(vv,3))
  np.save(f'M_{out}.npy',rodrigues(vv[:3])@M0);json.dump([cx+vv[3],cy+vv[4],R*(1+vv[5]),D],open(f'C_{out}.json','w'))
