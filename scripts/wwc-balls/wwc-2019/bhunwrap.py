import sys,json;sys.path.insert(0,'tools');from sphere import *
def bh_img(path,k=9,s=15):
    a=np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    L=cv2.medianBlur(a.mean(-1).astype(np.uint8),k)
    bh=cv2.morphologyEx(L,cv2.MORPH_BLACKHAT,np.ones((s,s),np.uint8)).astype(np.float32)
    return np.clip(1-bh*8/255,0,1)
def unwrap(name,path,W=1600,k=9,s=15,out=None):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Photo(path,cx,cy,R,D,np.load(f'M_{name}.npy'))
    ph.img=np.repeat(bh_img(path,k,s)[...,None],3,-1)
    Dd=eq_dirs(W,W//2);c,w=ph.sample_ball(Dd);c[w<.25]=.5
    im=Image.fromarray((c*255).astype(np.uint8));d=ImageDraw.Draw(im)
    for v in [(a,b,cc) for a in(1,-1) for b in (1,-1) for cc in (1,-1)]+[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]:
        x,y=dir_to_eq(nrm(np.array(v,float)),W,W//2);d.ellipse([x-5,y-5,x+5,y+5],outline=(255,0,0) if 0 in v else (0,160,0),width=2)
    im.save(out or f'bheq_{name}.png');return c,w
from PIL import ImageDraw
if __name__=='__main__': unwrap(sys.argv[1],sys.argv[2])
