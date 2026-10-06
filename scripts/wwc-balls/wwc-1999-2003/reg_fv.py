import sys,json;sys.path.insert(0,'tools');from register import *
base=cv2.GaussianBlur(np.load('fv_base.npy'),(0,0),3)
G=tetra_group()
name,p,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6])
best=None
for D in [None,8,5]:
  ph=Photo(p,cx,cy,R,D);ph.img=cv2.GaussianBlur(ph.img,(0,0),R/80)
  out=register(ph,base,n=1200,trials=12000)
  c,ph2=refine_full(p,cx,cy,R,D,out[0][1],base)
  print(name,D,round(c,4),ph2.cx,ph2.cy,ph2.R,ph2.D)
  if best is None or c<best[0]: best=(c,ph2)
ph2=best[1];np.save(f'M_{name}.npy',ph2.M);json.dump([ph2.cx,ph2.cy,ph2.R,ph2.D],open(f'C_{name}.json','w'))
