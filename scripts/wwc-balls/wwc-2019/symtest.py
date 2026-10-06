import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *
def load(name,path):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Shaded(path,cx,cy,R,D,np.load(f'M_{name}.npy'));ph.img=cv2.GaussianBlur(ph.img,(0,0),R/200);return ph
def test(PH,G,W=240,mask=None,minf=.55):
    D=eq_dirs(W,W//2);O=octa_group();samp={k:PH[k].sample_ball(D) for k in PH}
    rows=[]
    for i,g in enumerate(O):
        inG=any(np.abs(g-t).max()<1e-6 for t in G);tot=0;n=0
        for a in PH:
            ca,wa=samp[a]
            for b in PH:
                if a==b and np.allclose(g,np.eye(3)): continue
                cb,wb=PH[b].sample_ball(D@g.T);m=(wa>minf)&(wb>minf)
                if mask is not None: m&=mask(D)&mask(D@g.T)
                tot+=np.abs(ca[m]-cb[m]).mean(-1).sum();n+=m.sum()
        ang=math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)))
        ax=np.array([g[2,1]-g[1,2],g[0,2]-g[2,0],g[1,0]-g[0,1]]);ax=ax/np.linalg.norm(ax) if np.linalg.norm(ax)>1e-6 else ax
        rows.append((i,'G' if inG else ' ',round(ang),np.round(ax,2),round(tot/max(n,1),3),n))
    return rows
if __name__=='__main__':
    PH={'cc28':load('cc28','../refs/wwc-2019-conext19/photo-Chile-v-Colombia-20190519-28.jpg'),'fh1':load('fh1','ref/fh_1.jpg'),'est':load('est','../refs/wwc-2019-conext19/photo-2019-06-11-Fuball-Manner-Landerspiel-Deutschland-Estland-StP-2042-LR10-by-Stepro.jpg')}
    for r in test(PH,tetra_group()): print(*r)
