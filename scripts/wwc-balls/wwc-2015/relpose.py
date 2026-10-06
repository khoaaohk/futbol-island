import sys,json;sys.path.insert(0,'tools');from sphere import *
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
cx,cy,Rr,D=json.load(open('C_a3g.json'));A=Photo(R+'16397047065.jpg',cx,cy,Rr,D,np.load('Mg_a3.npy'));A.img=cv2.GaussianBlur(A.img,(0,0),2)
c2=A.M.T@A.cam_dir(948,405);print('J2 ball dir',np.round(c2,3))
cx,cy,Rr,D=json.load(open('C_a1g.json'));B=Photo(R+'15774583044.jpg',cx,cy,Rr,D);B.img=cv2.GaussianBlur(B.img,(0,0),2)
o=B.cam_dir(797,357);v=np.cross(c2,o);s=np.linalg.norm(v);R0=rot(v/s,math.atan2(s,c2@o))
Dd=eq_dirs(300,150);ca,wa=A.sample_ball(Dd);best=None
for th in np.radians(np.arange(0,360,1)):
  B.M=rot(o,th)@R0;cb,wb=B.sample_ball(Dd);m=(wa>.4)&(wb>.4)
  if m.sum()<500: continue
  c=np.abs(ca[m]-cb[m]).mean()
  if best is None or c<best[0]: best=(c,B.M.copy(),math.degrees(th),m.sum())
print(best[0],best[2],best[3]);np.save('Mg_a1.npy',best[1])
