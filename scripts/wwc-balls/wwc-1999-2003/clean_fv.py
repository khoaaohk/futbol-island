import numpy as np,cv2;from PIL import Image
lab=np.load('fv_lab.npy');H,W=lab.shape
INK=np.array([[237,238,235],[183,152,80],[181,31,16],[10,41,121]],np.uint8)
def mode_filter(l,k=5):
    best=None;cnt=None
    for c in range(4):
        m=cv2.boxFilter((l==c).astype(np.float32),-1,(k,k),normalize=False)
        if best is None: best=np.zeros_like(l);cnt=m
        else: sel=m>cnt;best[sel]=c;cnt=np.maximum(cnt,m)
    return best
lab=mode_filter(lab,5)
# outside background: white component touching the border
white=(lab==0).astype(np.uint8);n,cc=cv2.connectedComponents(white,4)
bg=np.zeros_like(white,bool)
for i in set(np.unique(np.r_[cc[0],cc[-1],cc[:,0],cc[:,-1]]))-{0}: bg|=cc==i
# drop small non-white specks outside the motif
motif=(~bg).astype(np.uint8);n2,cc2,st,_=cv2.connectedComponentsWithStats(motif,8)
big=np.argmax(st[1:,4])+1;keep=cc2==big
lab[~keep]=0
# white holes inside the motif -> nearest ink (gold highlights, mark remains)
hole=(lab==0)&keep
filled=lab.copy();known=~hole
for _ in range(60):
    if not hole.any(): break
    for c in (3,2,1):
        m=cv2.dilate((filled==c).astype(np.uint8),np.ones((3,3),np.uint8)).astype(bool)&hole
        filled[m]=c;hole&=~m
lab=filled
# the core: navy component at the centre, holes filled
navy=(lab==3).astype(np.uint8);n3,cc3=cv2.connectedComponents(navy,8);core=cc3==cc3[H//2,W//2]
inv=(~core).astype(np.uint8);n4,cc4=cv2.connectedComponents(inv,4)
outside=cc4==cc4[0,0];core_full=~outside
lab[core_full]=3
lab=mode_filter(lab,3)
np.save('fv_lab_clean.npy',lab);np.save('fv_core.npy',core_full)
Image.fromarray(INK[lab]).save('fv_motif_clean.png')
