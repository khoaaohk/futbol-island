import sys;sys.path.insert(0,'.');from facemap import *
SRC={'cc28':'../refs/wwc-2019-conext19/photo-Chile-v-Colombia-20190519-28.jpg','est':'../refs/wwc-2019-conext19/photo-2019-06-11-Fuball-Manner-Landerspiel-Deutschland-Estland-StP-2042-LR10-by-Stepro.jpg','fh1':'ref/fh_1.jpg'}
def xcorr(pa,pb,Fa,Fb,n=240,half=.85,minw=.3,excl=.18):
    P=tiles.tile_dirs((0,0,1),n,half,(0,1,0));yy,xx=np.mgrid[0:n,0:n];rr=np.hypot(xx-n/2,yy-n/2)/(n/2)*half
    ca,wa=pa.sample_ball(P@to_face(Fa).T);out=[]
    for k in range(4):
        cb,wb=pb.sample_ball(P@(to_face(Fb)@rot([0,0,1],k*math.pi/2)).T);m=(wa>minw)&(wb>minw)&(rr>excl)
        out.append(None if m.sum()<2500 else round(float(np.mean([np.corrcoef(ca[m][:,i],cb[m][:,i])[0,1] for i in range(3)])),2))
    return out
