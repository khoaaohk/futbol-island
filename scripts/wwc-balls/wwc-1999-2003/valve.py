import sys;sys.path.insert(0,'tools');sys.path.insert(0,'.')
from unwrap import unwrap
import numpy as np,math,cv2;from PIL import Image
HW=float(sys.argv[1]) if len(sys.argv)>1 else .42
img=Image.open('ref/mex_04.png');cx,cy,R=700,695,650;px,py=925,470;N=900
u=unwrap(img,cx,cy,R,px,py,0,HW,HW,N);u.save('valve_raw.png')
A=np.asarray(u).astype(float)/255;L=A.mean(-1);b=A[...,2]-A[...,0];r=A[...,0]-A[...,2]
paper=cv2.GaussianBlur(cv2.dilate(L.astype(np.float32),np.ones((15,15),np.uint8)),(0,0),5)
navy=np.clip(((paper-L)-.12)/.12,0,1)*(b>.03)
red=np.clip(((A[...,0]-A[...,1])-.2)/.12,0,1)
yy,xx=np.mgrid[0:N,0:N];rad=np.hypot(xx-N/2,yy-N/2)/(N/2)
navy*=rad<.92;red*=rad<.45
def comps(a,maxlen,fill=.08):
    lab=(a>.5).astype(np.uint8);n,cc,st,_=cv2.connectedComponentsWithStats(lab,8);k=np.zeros(n,bool)
    for i in range(1,n):
        x,y,w,h,ar=st[i]
        if 4<ar and max(w,h)<maxlen and ar>fill*w*h: k[i]=True
    keep=cv2.dilate(k[cc].astype(np.uint8),np.ones((3,3),np.uint8))>0;return a*keep
navy=comps(navy,90);red=comps(red,400,0.)
out=np.zeros((N,N,4),np.uint8)
out[...,:3]=np.where((red>navy)[...,None],np.array([217,90,150]),np.array([10,41,121]));out[...,3]=(np.maximum(navy,red)*255).astype(np.uint8)
Image.fromarray(out,'RGBA').save('valve_decal.png')
bg=Image.new('RGBA',(N,N),(237,238,235,255));bg.alpha_composite(Image.fromarray(out,'RGBA'))
Image.fromarray(np.concatenate([np.asarray(u),np.asarray(bg.convert('RGB'))],1)).resize((1000,500)).save('valve_cmp.png')
