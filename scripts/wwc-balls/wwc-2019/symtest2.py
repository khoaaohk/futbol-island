import sys,json;sys.path.insert(0,'.');from symtest import *
def cls(ph):
    c=ph.img;sat=c.max(-1)-c.min(-1);L=c.mean(-1)
    w=((sat<.18)&(L>.45)).astype(np.float32)          # white (incl grey pixels)
    b=((c[...,2]-c[...,0])>.15).astype(np.float32)     # blue
    r=((c[...,0]-c[...,2])>.25).astype(np.float32)*((c[...,0]-c[...,1])>.2)  # red/orange
    ph.img=np.stack([cv2.GaussianBlur(x,(0,0),ph.R/150) for x in (w,b,r)],-1);return ph
PH={k:cls(load(k,p)) for k,p in [('cc28','../refs/wwc-2019-conext19/photo-Chile-v-Colombia-20190519-28.jpg'),('fh1','ref/fh_1.jpg'),('est','../refs/wwc-2019-conext19/photo-2019-06-11-Fuball-Manner-Landerspiel-Deutschland-Estland-StP-2042-LR10-by-Stepro.jpg')]}
for r in test(PH,tetra_group()): print(*r)
