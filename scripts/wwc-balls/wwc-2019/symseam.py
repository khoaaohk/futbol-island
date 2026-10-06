import sys,json;sys.path.insert(0,'tools');from sphere import *;from bhunwrap import bh_img
def load_bh(name,path):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Photo(path,cx,cy,R,D,np.load(f'M_{name}.npy'));ph.img=np.repeat(bh_img(path)[...,None],3,-1).astype(np.float32);return ph
def sym(phs,G,W=1200,minf=.4):
    Dd=eq_dirs(W,W//2);acc=np.zeros(Dd.shape[:2]);ws=np.zeros(Dd.shape[:2])
    for g in G:
        for ph in phs:
            c,w=ph.sample_ball(Dd@g.T);w=np.clip((w-minf)/(1-minf),0,1)**2;acc+=c[...,0]*w;ws+=w
    return acc/np.maximum(ws,1e-6),ws
def symtile(phs,G,T,n=700,half=1.0,ref=(0,1,0),minf=.4):
    import tiles
    P=tiles.tile_dirs(T,n,half,ref);acc=np.zeros(P.shape[:2]);ws=np.zeros(P.shape[:2])
    for g in G:
        for ph in phs:
            c,w=ph.sample_ball(P@g.T);w=np.clip((w-minf)/(1-minf),0,1)**2;acc+=c[...,0]*w;ws+=w
    return acc/np.maximum(ws,1e-6),P
