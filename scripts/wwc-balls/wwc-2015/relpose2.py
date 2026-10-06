import sys,json;sys.path.insert(0,'tools');from sphere import *
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
c=lambda *v:nrm(np.array(v,float))
A=Photo(R+'16397047065.jpg',957,700,400,None);print('a3 res',np.round(A.fit([(965,893,c(1,1,1)),(948,405,c(1,1,-1))]),2))
np.save('Mg_a3.npy',A.M);json.dump([957,700,400,None],open('C_a3g.json','w'))
A.img=cv2.GaussianBlur(A.img,(0,0),2)
B=Photo(R+'15774583044.jpg',780,665,480,None);B.img=cv2.GaussianBlur(B.img,(0,0),2)
Dd=eq_dirs(300,150);ca,wa=A.sample_ball(Dd)
for c4 in [c(1,-1,-1),c(-1,1,-1),c(1,1,1)]:
  r=B.fit([(797,357,c(1,1,-1)),(898,960,c4)]);cb,wb=B.sample_ball(Dd);m=(wa>.4)&(wb>.4)
  print(np.round(c4,2),np.round(r,2),round(float(np.abs(ca[m]-cb[m]).mean()),3),m.sum())
  np.save(f'Mg_a1_{int(c4[0]>0)}{int(c4[1]>0)}{int(c4[2]>0)}.npy',B.M)
json.dump([780,665,480,None],open('C_a1g.json','w'))
