import sys,json;sys.path.insert(0,'.');from symtest import *;from symtest2 import cls
ref=cls(load('cc28','../refs/wwc-2019-conext19/photo-Chile-v-Colombia-20190519-28.jpg'))
D=eq_dirs(300,150);cr,wr=ref.sample_ball(D)
for name,p in [('fh1','ref/fh_1.jpg'),('est','../refs/wwc-2019-conext19/photo-2019-06-11-Fuball-Manner-Landerspiel-Deutschland-Estland-StP-2042-LR10-by-Stepro.jpg')]:
    ph=cls(load(name,p));M0=ph.M.copy();res=[]
    for k in range(4):
        g=rot([0,0,1],k*math.pi/2);ph.M=M0@g;c,w=ph.sample_ball(D);m=(w>.5)&(wr>.5);res.append((np.abs(c[m]-cr[m]).mean(),k,m.sum()))
    res.sort();print(name,[(round(a,3),k,n) for a,k,n in res])
    np.save(f'M_{name}.npy',M0@rot([0,0,1],res[0][1]*math.pi/2))
