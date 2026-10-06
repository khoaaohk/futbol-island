import numpy as np,cv2,math,sys
from PIL import Image
def place(alpha,s,th,tx,ty,n=500):
    h,w=alpha.shape;A=cv2.getRotationMatrix2D((w/2,h/2),th,s);A[0,2]+=tx-w/2;A[1,2]+=ty-h/2
    return cv2.warpAffine(alpha,A,(n,n))
def fit(alpha,target,init,steps=(.02,1.,4.,4.)):
    p=np.array(init,float)
    def sc(p):
        m=place(alpha,*p);return -(m*target).sum()/np.sqrt((m*m).sum()*(target*target).sum()+1e-9)
    c0=sc(p);st=np.array(steps)
    while st[2]>.1:
        imp=False
        for i in range(4):
            for d in (st[i],-st[i]):
                q=p.copy();q[i]+=d;c=sc(q)
                if c<c0:c0,p,imp=c,q,True
        if not imp: st/=2
    return p,-c0
if __name__=='__main__':
    t=np.asarray(Image.open('logos/tile_'+sys.argv[1]+'.png').convert('RGB')).astype(np.float32)/255
    L=t.mean(-1);sat=t.max(-1)-t.min(-1);blk=((L<.28)&(sat<.25)).astype(np.float32)
    blk=cv2.morphologyEx(blk,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    a=np.asarray(Image.open('logos/adidas.png'))[...,3].astype(np.float32)/255
    best=None
    for s0 in (.36,.42,.48):
     for tx in (220,245,270):
      for ty in (150,175,200,225):
       p,c=fit(a,blk,[s0,0,tx,ty])
      if best is None or c>best[1]: best=(p,c)
    print(sys.argv[1],np.round(best[0],3),round(best[1],3))
    m=place(a,*best[0]);ov=t.copy();ov[m>.5]=ov[m>.5]*.3+np.array([0,1,1])*.7
    Image.fromarray((ov*255).astype(np.uint8)).save('logos/fit_'+sys.argv[1]+'.png');np.save('logos/fitp_'+sys.argv[1]+'.npy',best[0])
