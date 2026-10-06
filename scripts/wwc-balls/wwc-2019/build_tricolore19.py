"""Tricolore 19 (WWC 2019 knockout) print -> 6 cube-face decals (WebP). Same Z-seam frame as build_conext19.py.
Ink layout: voted over the D3 panel symmetry from the two isolated balls in Commons "2019 Women's World Cup Ball.jpg"
(Liondartois, CC BY-SA 4.0), classified into the ball's three inks (white / royal blue / red); the white rectangles keep the
grey pixel marks of the shared Conext19 template (built from the CC BY-SA Conext19 photos); ink colours measured on the
adidas press photo (reference only). Marks: adidas Badge of Sport + wordmark (Commons SVG, white), 'Tricolore19 / OFFICIAL
MATCH BALL' traced into one white ink from the press photo (reference only), FIFA WWC France 2019 emblem (enwiki SVG, white)."""
import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *;import tiles
from fitlogo import place
OUT=sys.argv[1];N=int(sys.argv[2])
from build_conext19 import d3,AXES,LT_N,LT_H,ADI_P,save_faces as _sf
import build_conext19 as CX
G=d3((1,-1,-1))
PAL=np.array([[240,237,233],[22,38,140],[226,24,64]],float)/255   # white, royal blue, red (press photo k-means, brightened blue)
def loadl(n):
    C=json.load(open(f'C_{n}.json'));ph=Shaded('ref/lio_full.jpg',*C,np.load(f'M_{n}.npy'));im=deshaded_image(ph)
    im=cv2.GaussianBlur(im,(0,0),1.2);cen=np.array([[.92,.91,.91],[.26,.24,.46],[.63,.22,.34]])
    d=((im[...,None,:]-cen)**2).sum(-1);e=np.exp(-(d-d.min(-1,keepdims=True))/.01);p=e/e.sum(-1,keepdims=True)
    ph.img=p.astype(np.float32);ph.coef=[np.array([1.]+[0]*8)]*3;ph.white=np.ones(3);return ph
PH={n:loadl(n) for n in ['l1','l2']}
EXC=[((0,0,1),.27),((-1,0,0),.27)]   # logo discs: never voted from
def vote(P,temp=.03):
    vs=[];ss=[]
    for g in G:
        Q=P@g.T
        for n,ph in PH.items():
            C=Q@ph.M.T;X,Y=ph.project(C);f=ph.facing(C);H,W=ph.img.shape[:2]
            ok=(f>.3)&(X>=0)&(Y>=0)&(X<W-1)&(Y<H-1)
            for ax,r in EXC: ok&=(Q@nrm(np.array(ax,float)))<math.cos(r)
            vs.append(sample(ph.img,X,Y));ss.append(np.where(ok,f,-9.))
    ss=np.array(ss);smax=ss.max(0);k=np.exp((ss-smax)/temp)*(ss>-5)
    return (np.array(vs)*k[...,None]).sum(0)/np.maximum(k.sum(0),1e-9)[...,None],smax
def white_tex(P):
    c,s=CX.mosaic(P);L=c.mean(-1);return np.clip(L/np.percentile(L,95),0,1)   # grey pixel marks of the template
EMB=np.asarray(Image.open('logos/wwc19.png').convert('RGBA')).astype(np.float32)/255
def emblem(P,H=.46):
    d=np.array([-1.,0,0]);u=np.array([0,1.,0]);r=np.cross(u,d)
    g=np.maximum(P@d,1e-6);a=(P@r)/g;b=(P@u)/g;h,w=EMB.shape[:2];hh=H/2;ww=hh*w/h
    X=(a/ww+1)/2*w-.5;Y=(1-b/hh)/2*h-.5;ok=(P@d>.5)&(abs(a)<ww)&(abs(b)<hh)
    out=np.zeros(P.shape[:-1]);out[ok]=sample(EMB[...,3],X[ok],Y[ok]);return out
ADI=np.asarray(Image.open('logos/adidas.png'))[...,3].astype(np.float32)/255;ADI_M=place(ADI,*ADI_P)
TT=np.load('logos/tc_text1000.npy')
def colour(P):
    p,s=vote(P)
    cx,_=CX.mosaic(P);L=cx.mean(-1);sat=cx.max(-1)-cx.min(-1)
    red=np.clip((cx[...,0]-cx[...,1]-.12)/.15,0,1)*np.clip((cx[...,0]-cx[...,2]-.2)/.15,0,1)          # the Conext19 swirl's red streaks become the red ink
    white=cv2.GaussianBlur(np.clip(((.22-sat)/.08),0,1)*np.clip((L-.5)/.1,0,1),(0,0),1.)
    fi=np.argmax(P@AXES.T,-1);r=np.arccos(np.clip((P*AXES[fi]).sum(-1),-1,1));disc=np.clip((.255-r)/.03,0,1)
    white*=1-disc;red*=1-disc
    col=PAL[1]*(1-red[...,None])+PAL[2]*red[...,None];col=col*(1-white[...,None])+PAL[0]*white[...,None]
    p=np.stack([white,1-white],-1)
    wt=white_tex(P);col=col*(1-p[...,:1])+p[...,:1]*PAL[0]*(.62+.38*wt[...,None])
    X,Y,dd=tiles.tile_uv(P,(0,0,1),LT_N,LT_H,(0,1,0));ok=(dd>.8)&(X>=0)&(Y>=0)&(X<LT_N-1)&(Y<LT_N-1)
    a=np.zeros(P.shape[:-1]);a[ok]=sample(ADI_M,X[ok],Y[ok])
    X2,Y2,_=tiles.tile_uv(P,(0,0,1),1000,LT_H,(0,1,0));ok2=(dd>.8)&(X2>=0)&(Y2>=0)&(X2<999)&(Y2<999)
    a2=np.zeros(P.shape[:-1]);a2[ok2]=sample(cv2.GaussianBlur(TT,(0,0),.8),X2[ok2],Y2[ok2]);a=np.maximum(a,a2)
    a=np.maximum(a,emblem(P))
    col=col*(1-a[...,None])+PAL[0]*a[...,None]
    col[s<-5]=PAL[1];return np.clip(col,0,1)
if __name__=='__main__':
    fs=CX.save_faces(colour,OUT,n=N);print(fs,[os.path.getsize(f)//1024 for f in fs])
    W=1600;E=colour(eq_dirs(W,W//2));Image.fromarray((E*255).astype(np.uint8)).save(OUT+'-eq.png')
