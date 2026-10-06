import sys,json;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
TRI=[(a,b,c) for a in(1,-1) for b in(1,-1) for c in(1,-1)]
KITE=[(1,1,0),(1,-1,0),(-1,1,0),(-1,-1,0),(1,0,1),(1,0,-1),(-1,0,1),(-1,0,-1),(0,1,1),(0,1,-1),(0,-1,1),(0,-1,-1)]
def lab(v):
    return ''.join({1:'+',-1:'-',0:'0'}[int(t)] for t in v)
def snap(b):
    best=max(TRI+KITE,key=lambda v:np.dot(nrm(np.array(v,float)),b));return lab(best),round(math.degrees(math.acos(min(1,np.dot(nrm(np.array(best,float)),b)))),1)
def feats_dirs(name,feats,g=np.eye(3)):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R,ph.D=cx,cy,R,D;M=np.load(f'M_{name}.npy')@g
    return {k:(M.T@ph.cam_dir(*xy)) for k,xy in feats.items()}
