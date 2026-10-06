"""2003 WWC Fevernova print -> 6 cube-face decals (RGBA: ink where printed, transparent elsewhere so the foam skin shows).
Motif: fv_lab_clean.npy (4 inks, voted from 4 registered views and folded over the tetrahedral group).
Marks: white glyphs on each navy core and the navy text round the valve pentagon, posterised from the registered views."""
import sys;sys.path.insert(0,'.');from fvtile import *
OUT=sys.argv[1];N=int(sys.argv[2]) if len(sys.argv)>2 else 512
G=tetra_group();T0=TET[0];TN,TH=700,.80
INK=np.array([[237,238,235],[183,152,80],[181,31,16],[10,41,121]],float)/255
NAVY=INK[3]
lab=np.load('fv_lab_clean.npy');core=cv2.dilate(np.load('fv_core.npy').astype(np.uint8),np.ones((21,21),np.uint8)).astype(np.float32)
onehot=np.stack([(lab==c).astype(np.float32) for c in range(4)],-1)
GK=[next(g for g in G if np.allclose(g@T0,TET[k])) for k in range(4)]
MARK_SRC={0:'mex_05',1:'mex_03',2:'mex',3:'mex_02'}
PH={n:load(n) for n in set(MARK_SRC.values())|{'mex_04'}}
VALVE_PENT=None
def motif(P):
    k=np.argmax(P@TET.T,-1);rgb=np.zeros(P.shape[:-1]+(3,));a=np.zeros(P.shape[:-1]);cr=np.zeros(P.shape[:-1])
    for i in range(4):
        m=k==i
        if not m.any(): continue
        Q=P[m]@GK[i]  # g^-1 P
        X,Y=tile_uv(Q,T0,TN,TH);oh=sample(onehot,X,Y);ok=(X>=0)&(Y>=0)&(X<TN-1)&(Y<TN-1)
        oh[~ok]=[1,0,0,0];rgb[m]=oh[:,1:]@INK[1:]/np.maximum(oh[:,1:].sum(-1,keepdims=True),1e-6);a[m]=oh[:,1:].sum(-1)
        cr[m]=np.where(ok,sample(core,X,Y),0)
    return rgb,a,cr,k
MOTIF_NEAR=None
def marks(P,k,cr):
    """white glyph alpha on the cores (from each core's own frontal view)."""
    al=np.zeros(P.shape[:-1])
    for i,n in MARK_SRC.items():
        m=(k==i)&(cr>.5)
        if not m.any(): continue
        c,w=PH[n].sample_ball(P[m]);L=c.mean(-1);sat=c.max(-1)-c.min(-1)
        al[m]=np.clip((L-.5)/.15,0,1)*np.clip((.32-sat)/.1,0,1)*(w>.3)
    return al
def valve_text(P):
    """navy text round the valve pentagon (mex_04, oblique view)."""
    ph=PH['mex_04'];c,w=ph.sample_ball(P);L=c.mean(-1);b=c[...,2]-c[...,0];r=c[...,0]
    d=np.arccos(np.clip(P@VALVE_PENT,-1,1))
    ink=np.clip((.62-L)/.15,0,1)*(b>.08)*(r<.45)*(w>.15)*(d<.27)*(d>.035)
    return ink
def colour_alpha(P):
    rgb,a,cr,k=motif(P)
    near=cv2.dilate((a>.05).astype(np.uint8),np.ones((15,15),np.uint8)) if a.ndim==2 else (a>.05)
    wa=marks(P,k,cr);rgb=rgb*(1-wa[...,None])+np.array([.96,.96,.96])*wa[...,None]
    va=valve_text(P)*(near==0)*(cr<.01)*(sample(cv2.dilate((lab>0).astype(np.uint8),np.ones((41,41),np.uint8)).astype(np.float32),*tile_uv(P@GK[0],T0,TN,TH)[:2])<.5 if False else 1);rgb=rgb*(1-va[...,None])+NAVY*va[...,None];a=np.maximum(a,va)
    return rgb,a
def write_faces_rgba(fn,prefix,n=512,half=HALF,overlap=.012):
    files=[]
    for i,(d,up) in enumerate(FACES):
        P,c=face_dirs(d,up,n,half);ax=int(np.argmax(np.abs(d)));sg=np.sign(d[ax])
        own=sg*P[...,ax]-np.abs(P).max(-1);share=np.clip((own+overlap)/overlap,0,1)*(c>.32)
        rgb,a=fn(P);out=np.zeros((n,n,4),np.uint8);out[...,:3]=np.clip(rgb*255+.5,0,255);out[...,3]=(np.clip(a,0,1)*share*255).astype(np.uint8)
        f=f'{prefix}-{i+1}.png';Image.fromarray(out,'RGBA').save(f,optimize=True);files.append(f)
    return files
if __name__=='__main__':
    ph=PH['mex_04'];vdir=ph.M.T@ph.cam_dir(985,452)  # the valve hole
    from unwrap import ICO as _I;_I=np.array(_I);VALVE_PENT=_I[np.argmax(_I@vdir)]
    print('valve pentagon',np.round(VALVE_PENT,3),'tet dots',np.round(TET@VALVE_PENT,2))
    print(write_faces_rgba(colour_alpha,OUT,N))
    W=1600;rgb,a=colour_alpha(eq_dirs(W,W//2));img=rgb*a[...,None]+np.array([.93,.93,.9])*(1-a[...,None])
    Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8)).save(OUT+'-eq.png')
