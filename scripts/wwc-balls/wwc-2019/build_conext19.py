"""Conext19 (WWC 2019) print -> 6 cube-face decals (WebP).
Frame: the GLSL ball frame of wwc-2019-conext19.ts (Z-seam cube; adidas panel at +z, logo upright = +y).
Photo poses: M_<name>.npy / C_<name>.json, fitted to the seams (zfit.py) then jointly refined on the print (joint19.py).
Print model (measured): one panel artwork repeated on the six panels by D3 about (1,-1,-1); panel-centre discs: the adidas
panel's own yellow-orange disc, every other panel the plain lime disc (Stepro DE-Chile photo); marks layered on top.
usage: python3 build_conext19.py <outprefix> <facepx> [--faces] [--recolour tricolore.json]"""
import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *;import tiles
from fitlogo import place
OUT=sys.argv[1] if len(sys.argv)>1 else 'out/cx';N=int(sys.argv[2]) if len(sys.argv)>2 and sys.argv[2].isdigit() else 512
os.makedirs(os.path.dirname(OUT) or '.',exist_ok=True)
SRC={'cc28':'../refs/wwc-2019-conext19/photo-Chile-v-Colombia-20190519-28.jpg',
     'chi':'../refs/wwc-2019-conext19/photo-2019-05-30-Fussball-Frauen-Landerspiel-Deutschland-Chile-StP-1027-by-Stepro.jpg',
     'est':'../refs/wwc-2019-conext19/photo-2019-06-11-Fuball-Manner-Landerspiel-Deutschland-Estland-StP-2042-LR10-by-Stepro.jpg'}
PRI={'cc28':.2,'chi':.12,'est':0.}
def d3(a):
    a=nrm(np.array(a,float));G=[np.eye(3),rot(a,2*math.pi/3),rot(a,-2*math.pi/3)]
    E=[nrm(np.array(e,float)) for e in [(1,0,1),(1,0,-1),(0,1,1),(0,1,-1),(1,1,0),(1,-1,0)] if abs(np.dot(e,a))<1e-6]
    return G+[rot(e,math.pi) for e in E]
G=d3((1,-1,-1))
AXES=np.array([(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)],float)
LT_N,LT_H=500,.32          # adidas tile (gnomonic about +z, up +y)
ADI=np.asarray(Image.open('logos/adidas.png'))[...,3].astype(np.float32)/255
ADI_P=np.load('logos/adidas_place.npy');ADI_M=place(ADI,*ADI_P)
ADI_RED=np.load('logos/adidas_red.npy').astype(np.float32)
TXT=np.load('logos/text_mask1000.npy').astype(np.float32)
INK_MASK=cv2.dilate(((ADI_M>.3)|(ADI_RED>.5)).astype(np.uint8),np.ones((9,9),np.uint8)).astype(np.float32)
INK_MASK=np.maximum(INK_MASK,cv2.resize(cv2.dilate((TXT>.5).astype(np.uint8),np.ones((13,13),np.uint8)).astype(np.float32),(LT_N,LT_N)))
def inpaint_logo(ph):
    """Inpaint the adidas block (bars, red backing, wordmark, CONEXT19 text) in photo space so the disc shows through."""
    H,W=ph.img.shape[:2];ys,xs=np.mgrid[0:H,0:W]
    x=(xs-ph.cx)/ph.R;y=-(ys-ph.cy)/ph.R;inside=x*x+y*y<.98
    m=np.zeros((H,W),np.uint8)
    yi,xi=np.nonzero(inside)
    C=np.array([ph.cam_dir(a,b) for a,b in zip(xi[::1],yi[::1])]) if False else None
    # vectorised cam_dir
    if not ph.D: cz=np.sqrt(np.clip(1-x*x-y*y,0,1));Cc=np.stack([x,y,cz],-1)
    else:
        D=ph.D;f=ph.R*math.sqrt(D*D-1);d=np.stack([(xs-ph.cx)/f,-(ys-ph.cy)/f,-np.ones_like(x)],-1);d/=np.linalg.norm(d,axis=-1,keepdims=True)
        o=np.array([0,0,D]);b=d@o;c=D*D-1;t=-b-np.sqrt(np.clip(b*b-c,0,None));Cc=o+t[...,None]*d
    B=Cc@ph.M  # ball dirs
    X,Y,dd=tiles.tile_uv(B.reshape(-1,3),(0,0,1),LT_N,LT_H,(0,1,0));X=X.reshape(H,W);Y=Y.reshape(H,W)
    ok=inside&(B[...,2]>.6)&(X>=0)&(Y>=0)&(X<LT_N-1)&(Y<LT_N-1)
    v=np.zeros((H,W),np.float32);v[ok]=sample(INK_MASK,X[ok],Y[ok])
    m=(v>.3).astype(np.uint8)
    if m.sum()==0: return
    img8=(np.clip(ph.img,0,1)*255).astype(np.uint8);out=cv2.inpaint(img8,m,max(3,int(ph.R/60)),cv2.INPAINT_TELEA)
    ph.img=out.astype(np.float32)/255
def loadph(n):
    C=json.load(open(f'C_{n}.json'));ph=Shaded(SRC[n],*C,np.load(f'M_{n}.npy'));ph.img=deshaded_image(ph)
    ph.coef=[np.array([1.]+[0]*8)]*3;ph.white=np.ones(3);inpaint_logo(ph);return ph
PH={n:loadph(n) for n in SRC}
# cc28's +x panel carries a red event mark on its disc (not on the WWC ball): never sample that disc
EXCL={'cc28':[((1,0,0),.21)],'chi':[],'est':[]}
DISC_R=.25
def mosaic(P,gs=None,srcs=None,temp=.03,minf=.25):
    vs=[];ss=[]
    for g in (G if gs is None else gs):
        Q=P@g.T
        for n in (srcs or PH):
            ph=PH[n];C=Q@ph.M.T;X,Y=ph.project(C);f=ph.facing(C);H,W=ph.img.shape[:2]
            ok=(f>minf)&(X>=0)&(Y>=0)&(X<W-1)&(Y<H-1)
            for ax,r in EXCL[n]: ok&=(Q@nrm(np.array(ax,float)))<math.cos(r)
            vs.append(sample(ph.img,X,Y));ss.append(np.where(ok,f+PRI[n],-9.))
    ss=np.array(ss);smax=ss.max(0);k=np.exp((ss-smax)/temp)*(ss>-5)
    return (np.array(vs)*k[...,None]).sum(0)/np.maximum(k.sum(0),1e-9)[...,None],smax
def g_to(src,dst):
    for g in G:
        if np.allclose(g@np.array(src,float),dst): return g
def base(P):
    col,s=mosaic(P)
    fi=np.argmax(P@AXES.T,-1);r=np.arccos(np.clip((P*AXES[fi]).sum(-1),-1,1))
    wdisc=np.clip((DISC_R+.025-r)/.05,0,1)
    for k,F in enumerate(AXES):
        m=(fi==k)&(wdisc>0)
        if not m.any(): continue
        if k==4:   # adidas panel: its own (inpainted) disc, identity copy only
            c2,s2=mosaic(P[m],gs=[np.eye(3)])
        else:      # lime disc from the DE-Chile photo's +x panel, carried by the panel symmetry
            g=g_to((1,0,0),F);c2,s2=mosaic(P[m]@g,gs=[np.eye(3)],srcs=['chi'])  # P in face F -> g^T P in +x
        ok=s2>-5;cc=col[m];ww=wdisc[m][:,None]*ok[:,None];col[m]=cc*(1-ww)+c2*ww
    col[s<-5]=.5;return np.clip(col,0,1)
# ---------------------------------------------------------------- marks
EMB=np.asarray(Image.open('logos/wwc19.png').convert('RGBA')).astype(np.float32)/255
EMB_H=.48   # angular height (rad) measured on the adidas WWC press photo (reference only)
def emblem(P):
    d=np.array([0,-1.,0]);u=np.array([-1.,0,0]);r=np.cross(u,d)  # -y panel, emblem top toward -x (press photo)
    g=np.maximum(P@d,1e-6);a=(P@r)/g;b=(P@u)/g;h,w=EMB.shape[:2];hh=EMB_H/2;ww=hh*w/h
    X=(a/ww+1)/2*w-.5;Y=(1-b/hh)/2*h-.5;ok=(P@d>.5)&(abs(a)<ww)&(abs(b)<hh)
    out=np.zeros(P.shape[:-1]+(4,));out[ok]=sample(EMB,X[ok],Y[ok]);return out
def marks(P,col):
    X,Y,dd=tiles.tile_uv(P,(0,0,1),LT_N,LT_H,(0,1,0));ok=(dd>.8)&(X>=0)&(Y>=0)&(X<LT_N-1)&(Y<LT_N-1)
    red=np.zeros(P.shape[:-1]);blk=np.zeros(P.shape[:-1])
    red[ok]=sample(cv2.GaussianBlur(ADI_RED,(0,0),.6),X[ok],Y[ok]);blk[ok]=sample(ADI_M,X[ok],Y[ok])
    X2,Y2,_=tiles.tile_uv(P,(0,0,1),1000,LT_H,(0,1,0));ok2=(dd>.8)&(X2>=0)&(Y2>=0)&(X2<999)&(Y2<999)
    blk2=np.zeros(P.shape[:-1]);blk2[ok2]=sample(cv2.GaussianBlur(TXT,(0,0),.7),X2[ok2],Y2[ok2]);blk=np.maximum(blk,blk2)
    col=col*(1-red[...,None])+np.array([.86,.12,.08])*red[...,None]
    col=col*(1-blk[...,None])+np.array([.05,.04,.05])*blk[...,None]
    e=emblem(P);col=col*(1-e[...,3:])+e[...,:3]*e[...,3:]
    return col
def colour(P): return np.clip(marks(P,base(P)),0,1)
def save_faces(colfn,prefix,n=N,q=86):
    out=[]
    for f in write_faces(colfn,prefix,n=n):
        im=Image.open(f);w=f[:-4]+'.webp';im.save(w,'WEBP',quality=q,method=6);out.append(w)
    return out
if __name__=='__main__':
    if '--faces' in sys.argv:
        fs=save_faces(colour,OUT);print(fs,[os.path.getsize(f)//1024 for f in fs])
    W=1600;E=colour(eq_dirs(W,W//2));Image.fromarray((E*255).astype(np.uint8)).save(OUT+'-eq.png')
