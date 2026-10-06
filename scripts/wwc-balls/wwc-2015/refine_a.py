import sys;sys.path.insert(0,'tools');from seamreg import *
name,path=sys.argv[1],sys.argv[2];cx,cy,R,D=json.load(open(f'C_{name}.json'))
M0=np.load(f'Mc_{name}.npy');M0=M0 if M0.ndim==2 else M0[0]
P=np.load('seampts.npy')
im=np.asarray(Image.open(path).convert('L')).astype(np.float32);g=cv2.GaussianBlur(im,(0,0),2.5)
bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))/255.
# distance transform to strong seam-like pixels (chamfer)
edge=(bh>.04).astype(np.uint8);dist=cv2.distanceTransform(1-edge,cv2.DIST_L2,5)
best=None
for trial in range(1):
  def f(v):
    M=rodrigues(v[:3])@M0;ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx+v[3],cy+v[4],R*(1+v[5]),None
    C=P@M.T;X,Y=ph.project(C);fc=ph.facing(C);ok=(fc>.35)
    d=sample(dist,X[ok],Y[ok]);return np.mean(np.minimum(d,15))
  v=np.zeros(6);steps=np.array([.03,.03,.03,5,5,.01]);c0=f(v);print('start',c0)
  while steps[0]>2e-4:
    imp=False
    for i in range(6):
      for sg in (steps[i],-steps[i]):
        v2=v.copy();v2[i]+=sg;c=f(v2)
        if c<c0:c0,v,imp=c,v2,True
    if not imp: steps/=2
  print('end',c0,np.round(v,3))
np.save(f'Mc_{name}.npy',rodrigues(v[:3])@M0);json.dump([cx+v[3],cy+v[4],R*(1+v[5]),None],open(f'C_{name}.json','w'))
