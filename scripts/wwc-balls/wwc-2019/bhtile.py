import sys,json;sys.path.insert(0,'tools');from tiles import *;from bhunwrap import bh_img
def bhtile(name,path,T,n=600,half=.75,ref=(0,1,0),mode='bh'):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Photo(path,cx,cy,R,D,np.load(f'M_{name}.npy'))
    if mode=='bh': ph.img=np.repeat(bh_img(path)[...,None],3,-1)
    P=tile_dirs(T,n,half,ref);c,w=ph.sample_ball(P);c=c.copy();c[w<.15]=.5
    im=Image.fromarray((c*255).astype(np.uint8));d=ImageDraw.Draw(im)
    for v in [(a,b,cc) for a in(1,-1) for b in (1,-1) for cc in (1,-1)]+[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]+[(a,b,0) for a in (1,-1) for b in (1,-1)]+[(a,0,b) for a in (1,-1) for b in (1,-1)]+[(0,a,b) for a in (1,-1) for b in (1,-1)]:
        v=nrm(np.array(v,float))
        if np.dot(v,nrm(np.array(T,float)))<.3: continue
        X,Y,_=tile_uv(v[None],T,n,half,ref);d.ellipse([X[0]-5,Y[0]-5,X[0]+5,Y[0]+5],outline=(255,0,0) if (abs(v)>.99).any() else ((0,160,0) if (abs(v)>.5).all() else (0,0,255)),width=2)
    return im
from PIL import ImageDraw
