"""2003 WWC Fevernova: motif redrawn in its 4 inks from registered photos, folded over the tetrahedral group."""
import sys;sys.path.insert(0,'.');from fvtile import *
G=tetra_group();T0=TET[0]
NAMES=['mex','mex_02','mex_03','mex_04','mex_05']
PH={n:load(n) for n in NAMES}
INK=np.array([[237,238,235],[183,152,80],[181,31,16],[10,41,121]],float)/255  # paper, gold, red, navy
TN,TH=700,.80
def classes(ph,P):
    c,w=ph.sample_ball(P);d=((c[...,None,:]-INK)**2).sum(-1);return d,w
P0=tile_dirs(T0,TN,TH)
best_w=np.full(P0.shape[:2],-1.);votes=np.zeros(P0.shape[:2]+(4,))
for n in NAMES:
    if n=='mex_04': continue  # its pose is off by a tetrahedral turn; the four frontal views cover every motif
    ph=PH[n];ph.img=cv2.GaussianBlur(ph.img,(0,0),1.)
    for g in G:
        d,w=classes(ph,P0@g.T)
        p=np.exp(-d/.004);p/=p.sum(-1,keepdims=True)
        wt=np.clip((w-.55)/.45,0,1)**4
        votes+=p*wt[...,None]
lab=np.argmax(votes,-1);conf=votes.max(-1)/np.maximum(votes.sum(-1),1e-9)
np.save('fv_lab.npy',lab)
pal=(INK*255).astype(np.uint8);Image.fromarray(pal[lab]).save('fv_motif.png')
print('coverage',(votes.sum(-1)>0).mean())
