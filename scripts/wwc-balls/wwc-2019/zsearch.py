import sys,json;sys.path.insert(0,'.');from zfit import *;from seamreg import quat
name,path,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]);D=None if sys.argv[6]=='None' else float(sys.argv[6])
adx,ady=map(float,sys.argv[7:9])  # adidas (a +z face centre) pixel
g=gmap(path,R);H,W=g.shape;SP=zgeom.seam_points(math.radians(19.84),30)
ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx,cy,R,D
def sc(M):
    C=SP@M.T;X,Y=ph.project(C);fa=ph.facing(C);ok=(fa>.3)&(X>1)&(Y>1)&(X<W-2)&(Y<H-2);return sample(g,X[ok],Y[ok]).mean() if ok.sum()>100 else 0
# adidas direction fixes +z: sample rotations about it
a=Photo.cam_dir(ph,adx,ady);best=[]
z=np.array([0,0,1.])
for ang in np.radians(np.arange(0,360,1)):
    # M maps ball->cam with M@z=a: build base rotation then spin
    v=np.cross(z,a);s=np.linalg.norm(v);c=np.dot(z,a);B=rot(v/s,math.atan2(s,c)) if s>1e-9 else np.eye(3)
    M=B@rot(z,ang);best.append((sc(M),ang,M))
best=[b for b in best if min(abs(math.degrees(b[1])%90),90-abs(math.degrees(b[1])%90))<12];best.sort(key=lambda t:-t[0]);print([ (round(b[0],3),round(math.degrees(b[1]))) for b in best[:6]])
np.save(f'M_{name}.npy',best[0][2]);json.dump([cx,cy,R,D],open(f'C_{name}.json','w'))
cs,c0,v,(M,C)=fit(name,path,fix_theta=19.84)
print(name,round(cs,4),'->',round(c0,4),np.round(v[:6],4))
np.save(f'M_{name}.npy',M);json.dump(C,open(f'C_{name}.json','w'))
ph2=Photo(path,*C,M);im=(ph2.img*255).astype(np.uint8).copy();SP2=zgeom.seam_points(math.radians(19.84),60)
Cc=SP2@M.T;X,Y=ph2.project(Cc);f=ph2.facing(Cc);k=f>.05
for x,y in zip(X[k],Y[k]): cv2.circle(im,(int(x),int(y)),max(2,int(R/250)),(255,0,255),-1)
x0,y0=int(C[0]-C[2]*1.05),int(C[1]-C[2]*1.05);Image.fromarray(im).crop((x0,y0,x0+int(C[2]*2.1),y0+int(C[2]*2.1))).resize((700,700)).save(f'ovz_{name}.jpg')
