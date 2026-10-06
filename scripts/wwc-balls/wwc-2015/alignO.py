import sys,json;sys.path.insert(0,'tools');from sphere import *
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
def ld(p,n):
  cx,cy,Rr,D=json.load(open(f'C_{n}g.json'));ph=Photo(p,cx,cy,Rr,D,np.load(f'Mg_{n}.npy'));ph.img=cv2.GaussianBlur(ph.img,(0,0),3);return ph
A=ld(R+'16397047065.jpg','a3');B=ld(sys.argv[2],sys.argv[1]);O=octa_group();D=eq_dirs(240,120);ca,wa=A.sample_ball(D);M0=B.M.copy();res=[]
for i,g in enumerate(O):
  B.M=M0@g;cb,wb=B.sample_ball(D);m=(wa>.4)&(wb>.4)
  res.append((np.abs(ca[m]-cb[m]).mean() if m.sum()>800 else 9,i,int(m.sum())))
res.sort();print(res[:4]);np.save(f'Mg_{sys.argv[1]}.npy',M0@O[res[0][1]])
