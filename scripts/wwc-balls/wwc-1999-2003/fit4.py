import sys,json;sys.path.insert(0,'.');from seamfit import *
from fvtile import TET
from unwrap import ICO as I,dir_of;I=np.array(I)
s=SeamMap('audit/wwc-2003-fevernova-map.png')
ph0=Photo('ref/mex_04.png',700,695,650,4)
ca=ph0.cam_dir(190,800);cv=ph0.cam_dir(925,470)
res=[]
for P in I:
  ang=math.degrees(math.acos(P@TET[1]))
  if ang<60 or ang>125: continue
  for roll in range(0,360,30):
    # rotation mapping ball (T1,P) to cam (ca,cv) with a twist: fit then roll about cv-ca mid? simpler: Kabsch with 2 pts then roll about cv
    ph=Photo('ref/mex_04.png',700,695,650,4);ph.fit([(190,800,TET[1]),(925,470,P)])
    M=rot(cv,math.radians(roll))@ph.M
    c,ph2=seamfit('ref/mex_04.png',700,695,650,4,M,s,blur=2)
    v=ph2.M.T@ph2.cam_dir(925,470);e=math.degrees(math.acos((I@v).max()))
    res.append((c,np.round(P,2).tolist(),roll,round(e,1),ph2))
res.sort(key=lambda t:t[0])
for t in res[:8]: print(round(t[0],4),t[1],t[2],t[3])
b=res[0][-1];np.save('M_mex_04b.npy',b.M);json.dump([b.cx,b.cy,b.R,b.D],open('C_mex_04b.json','w'));overlay(b,s,'ov_mex_04b.png')
