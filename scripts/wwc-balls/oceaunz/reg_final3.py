import sys,json;sys.argv=[sys.argv[0]]+sys.argv[1:];sys.path.insert(0,'tools');from sphere import *
exec(open('ref_final2.py').read().split('def refine')[0].replace("import sys,json;sys.path.insert(0,'tools');from sphere import *",""))
exec('def refine'+open('ref_final2.py').read().split('def refine')[1])
G=np.load('oz_G.npy');E=np.asarray(Image.open('out/oz-eq.png').convert('L')).astype(np.float32)/255;E=cv2.GaussianBlur(E,(0,0),2)
name,path,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]);D=None if sys.argv[6]=='None' else float(sys.argv[6])
ph=Photo(path,cx,cy,R,D);A=cv2.medianBlur((ph.img*255).astype(np.uint8),5).astype(np.float32)/255;L=cv2.GaussianBlur(A.mean(-1),(0,0),R/250)
rng=np.random.default_rng(1);pts=[]
while len(pts)<3000:
  x,y=rng.uniform(-1,1,2)
  if x*x+y*y<.75: pts.append((x,y,math.sqrt(1-x*x-y*y)))
C=np.array(pts);X,Y=ph.project(C);fl=sample(L,X,Y)
Ms=np.load(f'Mf_{name}.npy') if len(sys.argv)<8 else np.load(sys.argv[7])[None]
best=None
for M0 in Ms[:6]:
  for g in G:
    M=M0@g;B=C@M;Xb,Yb=dir_to_eq(B,E.shape[1],E.shape[0]);fb=sample(E,Xb,Yb,wrap=True);c=np.corrcoef(fl,fb)[0,1]
    if best is None or c>best[0]: best=(c,M)
print(name,'lum corr',round(best[0],3))
refine(path,cx,cy,R,D,best[1],name)
