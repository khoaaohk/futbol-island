import sys,json;sys.path.insert(0,'tools');from sphere import *
# reproj.py eq.png photo Cjson Mnpy out
eq=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)/255;p=sys.argv[2];cx,cy,R,D=json.load(open(sys.argv[3]));M=np.load(sys.argv[4])
img=np.asarray(Image.open(p).convert('RGB')).astype(np.float32)/255;H,W=img.shape[:2]
ys,xs=np.mgrid[0:H,0:W];ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx,cy,R,D
x=(xs-cx)/R;y=-(ys-cy)/R;r2=x*x+y*y;inside=r2<1
C=np.zeros((H,W,3));C[inside]=np.array([ph.cam_dir(a,b) for a,b in zip(xs[inside],ys[inside])]) if D else np.stack([x,y,np.sqrt(np.clip(1-r2,0,1))],-1)[inside]
B=C@M;X,Y=dir_to_eq(B,eq.shape[1],eq.shape[0]);t=sample(eq,X,Y,wrap=True)
out=img.copy();out[inside]=t[inside]
k=1.1;crop=lambda a:a[int(cy-R*k):int(cy+R*k),int(cx-R*k):int(cx+R*k)]
Image.fromarray((np.concatenate([crop(img),crop(out)],1)*255).astype(np.uint8)).save(sys.argv[5])
