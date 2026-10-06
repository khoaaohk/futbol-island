import sys,json;sys.path.insert(0,'tools');from sphere import *
name,path,idx,out=sys.argv[1],sys.argv[2],int(sys.argv[3]),sys.argv[4]
cx,cy,R,D=json.load(open(f'C_{name}.json'));Ms=np.load(f'Mc_{name}.npy');M=Ms[idx] if Ms.ndim==3 else Ms
ph=Photo(path,cx,cy,R,D,M)
import math;P=np.load('seampts.npy') if len(sys.argv)<6 else np.load(sys.argv[5])
im=(ph.img*255).astype(np.uint8).copy();C=P@M.T;X,Y=ph.project(C);f=ph.facing(C)
for x,y,ff in zip(X,Y,f):
  if ff>0.05: cv2.circle(im,(int(x),int(y)),2,(255,0,255),-1)
for v,c in [((1,1,1),(255,0,0)),((1,0,0),(0,255,0)),((0,1,0),(0,0,255)),((0,0,1),(255,255,0))]:
  cc=M@nrm(np.array(v,float))
  if cc[2]>0: x,y=ph.project(cc[None]);cv2.circle(im,(int(x[0]),int(y[0])),12,c,3)
x0=int(max(0,cx-R*1.05));y0=int(max(0,cy-R*1.05));Image.fromarray(im[y0:int(cy+R*1.05),x0:int(cx+R*1.05)]).resize((600,600)).save(out)
