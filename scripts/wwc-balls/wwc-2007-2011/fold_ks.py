import sys,json;sys.path.insert(0,'tools');from sphere import *
cx,cy,R,D=json.load(open('C_ks.json'))
ph=Shaded('../refs/wwc-2011-speedcell/photo-Speedcell.jpg',cx,cy,R,D,np.load('M_ks.npy'))
G=tetra_group();T0=nrm(np.array([1.,1,1]))
W=1200;P=eq_dirs(W,W//2);cs=[];ss=[]
for g in G:
  Q=P@g.T;c,w=ph.sample_ball(Q);eye=(Q@T0)>math.cos(.30);cs.append(c);ss.append(np.where(eye,-9,w))
cs=np.array(cs);ss=np.array(ss);k=np.exp((ss-ss.max(0))/.02)*(ss>-5);col=(cs*k[...,None]).sum(0)/np.maximum(k.sum(0),1e-9)[...,None]
col[ss.max(0)<.1]=.5
Image.fromarray((np.clip(col,0,1)*255).astype(np.uint8)).save('fold_ks.png')
