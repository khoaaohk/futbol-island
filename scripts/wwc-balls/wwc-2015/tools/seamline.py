import sys;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
def seam_points(mappath, step=1):
    s=SeamMap(mappath); lab=s.label.copy(); H,W=lab.shape
    src=(lab>=0).astype(np.uint8)
    d,idx=cv2.distanceTransformWithLabels(1-src,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
    ys,xs=np.nonzero(src); lut=np.zeros(idx.max()+1,int); lut[idx[ys,xs]]=lab[ys,xs]; full=lut[idx]
    b=(full!=np.roll(full,-1,1))|(full!=np.roll(full,-1,0)); b[-1,:]=False
    yy,xx=np.nonzero(b); D=s.D[yy,xx]
    # thin uniformly on the sphere
    keep=np.random.default_rng(0).random(len(D))<np.cos(np.arcsin(D[:,1]))
    return D[keep][::step], s, full
