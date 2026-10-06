"""Rectify a printed mark from a ball photo into the decal's tangent-plane frame (inverse of the viewer's projection).
unwrap(photo, cx,cy,R, px,py, roll_deg, w,h, outW) -> PIL RGB image. (cx,cy,R): ball circle in photo px; (px,py): decal centre
in photo px; roll: text-up direction, degrees clockwise from image-up; w,h: half-sizes (sphere radii)."""
import numpy as np, math
from PIL import Image
def unwrap(img,cx,cy,R,px,py,roll,w,h,outW=1024,D=None):
    A=np.asarray(img.convert('RGB')).astype(np.float32)
    n=dir_of(cx,cy,R,px,py,D)
    t=math.radians(roll); up=np.array([math.sin(t),math.cos(t),0.])
    u=up-n*np.dot(up,n); u/=np.linalg.norm(u); r=np.cross(u,n)
    outH=int(round(outW*h/w))
    a=(np.arange(outW)+.5)/outW*2-1; b=1-(np.arange(outH)+.5)/outH*2
    a,b=np.meshgrid(a*w,b*h)
    c=np.sqrt(np.clip(1-a*a-b*b,0,1))
    P=n[None,None,:]*c[...,None]+r[None,None,:]*a[...,None]+u[None,None,:]*b[...,None]
    if D: f=R*math.sqrt(D*D-1); X=cx+f*P[...,0]/(D-P[...,2]); Y=cy-f*P[...,1]/(D-P[...,2])
    else: X=cx+R*P[...,0]; Y=cy-R*P[...,1]
    X0=np.clip(np.floor(X).astype(int),0,A.shape[1]-2); Y0=np.clip(np.floor(Y).astype(int),0,A.shape[0]-2)
    fx=(X-X0)[...,None]; fy=(Y-Y0)[...,None]
    o=A[Y0,X0]*(1-fx)*(1-fy)+A[Y0,X0+1]*fx*(1-fy)+A[Y0+1,X0]*(1-fx)*fy+A[Y0+1,X0+1]*fx*fy
    return Image.fromarray(np.clip(o,0,255).astype(np.uint8))
DEFAULT_D=[None]
def dir_of(cx,cy,R,px,py,D='def'):
    if D=='def': D=DEFAULT_D[0]
    if not D:
        x=(px-cx)/R; y=-(py-cy)/R; return np.array([x,y,math.sqrt(max(0,1-x*x-y*y))])
    f=R*math.sqrt(D*D-1); d=_norm([(px-cx)/f,-(py-cy)/f,-1.]); o=np.array([0,0,D])
    b=np.dot(o,d); c=np.dot(o,o)-1; disc=b*b-c
    t=-b-math.sqrt(max(disc,0)); return _norm(o+t*d)
def ink(img,ink_rgb,bg=None,lo=.25,hi=.75,blur=41,mode='lum'):
    """Alpha from darkness relative to the local background (median-ish via large blur of the bright pixels)."""
    from PIL import ImageFilter
    A=np.asarray(img.convert('RGB')).astype(np.float32)/255
    L=A.mean(-1)
    if mode=='lum':
        bgL=np.asarray(img.convert('L').filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)/255 if bg is None else bg
        inkL=np.mean(np.array(ink_rgb)/255)
        t=(bgL-L)/np.maximum(bgL-inkL,1e-3)
    else: # colour distance to ink vs to white
        ic=np.array(ink_rgb)/255; d_ink=np.linalg.norm(A-ic,axis=-1); d_bg=np.linalg.norm(A-np.array([.95,.95,.93]),axis=-1)
        t=d_bg/(d_ink+d_bg+1e-6)
    al=np.clip((t-lo)/(hi-lo),0,1)
    out=np.zeros(A.shape[:2]+(4,),np.uint8); out[...,:3]=ink_rgb; out[...,3]=(al*255).astype(np.uint8)
    return Image.fromarray(out,'RGBA')

PHI=(1+5**.5)/2
def _norm(v): v=np.array(v,float); return v/np.linalg.norm(v)
def _ico():
    vs=set()
    for a in [(0,1,PHI)]:
        for sx in (1,-1):
            for sy in (1,-1):
                for sz in (1,-1):
                    b=(a[0]*sx,a[1]*sy,a[2]*sz)
                    for k in range(3): vs.add(tuple(round(b[(i+k)%3],6) for i in range(3)))
    return [_norm(v) for v in sorted(vs)]
def _dod():
    vs=set()
    for sx in (1,-1):
        for sy in (1,-1):
            for sz in (1,-1):
                vs.add((sx,sy,sz))
                b=(1/PHI*sx,0,PHI*sz)
                for k in range(3): vs.add(tuple(round(b[(i+k)%3],6) for i in range(3)))
    return [_norm(v) for v in sorted(vs)]
ICO=_ico(); DOD=_dod()
def kabsch(A,B):
    """R with R@a ~ b (rows of A,B)."""
    H=np.array(A).T@np.array(B); U,S,Vt=np.linalg.svd(H); d=np.sign(np.linalg.det(Vt.T@U.T))
    D=np.diag([1,1,d]); return Vt.T@D@U.T
def solve(cx,cy,R,pts):
    """pts: list of (px,py,'P'|'H'). Returns (Rot ball->camera, residual deg, assignment)."""
    obs=[dir_of(cx,cy,R,x,y) for x,y,_ in pts]; kinds=[k for *_,k in pts]
    cand=lambda k: ICO if k=='P' else DOD
    best=(9e9,None,None)
    a0=obs[0]
    for i,c0 in enumerate(cand(kinds[0])):
        for j,c1 in enumerate(cand(kinds[1])):
            if kinds[0]==kinds[1] and i==j: continue
            if abs(np.dot(c0,c1)-np.dot(obs[0],obs[1]))>.08: continue
            Rm=kabsch([c0,c1],[obs[0],obs[1]])
            asg=[i,j]; ball=[c0,c1]
            for o,k in zip(obs[2:],kinds[2:]):
                bo=Rm.T@o; cs=cand(k); m=max(range(len(cs)),key=lambda q: np.dot(cs[q],bo)); asg.append(m); ball.append(cs[m])
            Rm=kabsch(ball,obs)
            res=np.degrees(np.mean([math.acos(min(1,np.dot(Rm@b,o))) for b,o in zip(ball,obs)]))
            if res<best[0]: best=(res,Rm,asg)
    return best[1],best[0],best[2]
def photo_to_ball(Rm,cx,cy,R,px,py): return Rm.T@dir_of(cx,cy,R,px,py)
def up_to_ball(Rm,cx,cy,R,px,py,roll):
    n=dir_of(cx,cy,R,px,py); t=math.radians(roll); up=np.array([math.sin(t),math.cos(t),0.]); u=up-n*np.dot(up,n); return Rm.T@(u/np.linalg.norm(u))
def grid(img,step=50):
    from PIL import ImageDraw
    im=img.convert('RGB').copy(); d=ImageDraw.Draw(im)
    for x in range(0,im.width,step): d.line([(x,0),(x,im.height)],fill=(255,0,0) if x%(step*4)==0 else (255,160,160),width=1)
    for y in range(0,im.height,step): d.line([(0,y),(im.width,y)],fill=(255,0,0) if y%(step*4)==0 else (255,160,160),width=1)
    return im

TRUNC_W=4.534567884457026/4.654876873532654
FACES=np.array([v*TRUNC_W for v in ICO]+list(DOD))
def frame(n0,u):
    n0=_norm(n0); u=np.array(u,float); u=u-n0*np.dot(u,n0); u/=np.linalg.norm(u); r=np.cross(u,n0); return n0,u,r
def seam_mask(n0,u,w,h,outW):
    n0,u,r=frame(n0,u); outH=int(round(outW*h/w))
    a=(np.arange(outW)+.5)/outW*2-1; b=1-(np.arange(outH)+.5)/outH*2; a,b=np.meshgrid(a*w,b*h); c=np.sqrt(np.clip(1-a*a-b*b,0,1))
    P=n0*c[...,None]+r*a[...,None]+u*b[...,None]
    s=P@FACES.T; idx=s.argmax(-1)
    m=np.zeros(idx.shape,bool); m[1:]|=idx[1:]!=idx[:-1]; m[:,1:]|=idx[:,1:]!=idx[:,:-1]
    return m,idx
def overlay(img,n0,u,w,h,col=(255,0,255)):
    m,_=seam_mask(n0,u,w,h,img.width); A=np.asarray(img.convert('RGB')).copy(); A[m]=col; return Image.fromarray(A)
P0=ICO[[i for i,v in enumerate(ICO) if v[1]>.5 and v[2]>.8][0]]
def nbr_hex(P,k=5): return sorted(DOD,key=lambda d:-np.dot(d,P))[:k]

def unwrap_cam(img,cx,cy,R,D,n,u,w,h,outW=1024):
    """Like unwrap but with the decal centre n and up u given as camera-frame vectors."""
    A=np.asarray(img.convert('RGB')).astype(np.float32)
    n,u,r=frame(n,u); outH=int(round(outW*h/w))
    a=(np.arange(outW)+.5)/outW*2-1; b=1-(np.arange(outH)+.5)/outH*2; a,b=np.meshgrid(a*w,b*h)
    c=np.sqrt(np.clip(1-a*a-b*b,0,1)); P=n*c[...,None]+r*a[...,None]+u*b[...,None]
    if D: f=R*math.sqrt(D*D-1); X=cx+f*P[...,0]/(D-P[...,2]); Y=cy-f*P[...,1]/(D-P[...,2])
    else: X=cx+R*P[...,0]; Y=cy-R*P[...,1]
    X0=np.clip(np.floor(X).astype(int),0,A.shape[1]-2); Y0=np.clip(np.floor(Y).astype(int),0,A.shape[0]-2)
    fx=(X-X0)[...,None]; fy=(Y-Y0)[...,None]
    o=A[Y0,X0]*(1-fx)*(1-fy)+A[Y0,X0+1]*fx*(1-fy)+A[Y0+1,X0]*(1-fx)*fy+A[Y0+1,X0+1]*fx*fy
    return Image.fromarray(np.clip(o,0,255).astype(np.uint8))
class Photo:
    """A calibrated photo: ball circle (cx,cy,R), camera distance D (ball radii, None = orthographic) and an anchor:
    photo pixel (px,py) with text-up roll that corresponds to ball-frame direction a_dir with up a_up."""
    def __init__(s,path,cx,cy,R,D,px,py,roll,a_dir,a_up):
        s.img=Image.open(path); s.cx,s.cy,s.R,s.D=cx,cy,R,D
        DEFAULT_D[0]=D; n=dir_of(cx,cy,R,px,py,D); t=math.radians(roll); up=np.array([math.sin(t),math.cos(t),0.])
        nc,uc,rc=frame(n,up); nb,ub,rb=frame(a_dir,a_up)
        s.M=np.stack([rc,uc,nc],1)@np.stack([rb,ub,nb],0)  # ball -> camera
        s.anchor=(nb,ub,rb)
    def map_xy(s,x,y,w,size):
        """Rectified-anchor-frame pixel (from rect.py with half-size w, size px) -> ball dir."""
        nb,ub,rb=s.anchor; a=(x/size*2-1)*w; b=(1-y/size*2)*w; c=math.sqrt(max(0,1-a*a-b*b)); return _norm(nb*c+rb*a+ub*b)
    def decal(s,dball,uball,w,h,outW=1024): return unwrap_cam(s.img,s.cx,s.cy,s.R,s.D,s.M@dball,s.M@uball,w,h,outW)
def alpha_gold(img,lo=22,hi=70):
    A=np.asarray(img.convert('RGB')).astype(np.float32); t=A[...,0]-A[...,2]; return np.clip((t-lo)/(hi-lo),0,1)
def alpha_dark(img,lo=.35,hi=.7,blur=25):
    from PIL import ImageFilter
    L=np.asarray(img.convert('L')).astype(np.float32)/255
    bg=np.asarray(img.convert('L').filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)/255
    t=1-L/np.maximum(bg,.2); return np.clip((t-lo)/(hi-lo),0,1)
def rgba(alpha,rgb,crop=True,pad=6):
    a=(np.clip(alpha,0,1)*255).astype(np.uint8); out=np.zeros(a.shape+(4,),np.uint8); out[...,:3]=rgb; out[...,3]=a
    return Image.fromarray(out,'RGBA')
def ink_colour(img,alpha):
    A=np.asarray(img.convert('RGB')).astype(np.float32); m=alpha>.9
    return tuple(int(x) for x in np.median(A[m],0)) if m.sum()>20 else (0,0,0)
def sharp(a,sig=1.2,lo=.32,hi=.68):
    from PIL import ImageFilter
    b=np.asarray(Image.fromarray((np.clip(a,0,1)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sig))).astype(np.float32)/255
    t=np.clip((b-lo)/(hi-lo),0,1); return t*t*(3-2*t)
def alpha_brownink(img,glo=25,ghi=95,hue=18):
    A=np.asarray(img.convert('RGB')).astype(np.float32)
    bg=np.percentile(A[...,1],90); t=np.clip((bg-A[...,1]-glo)/(ghi-glo),0,1)
    gate=np.clip((A[...,0]-A[...,2]-hue*.5)/hue,0,1); return t*gate
def ellmask(shape,k=.8):
    H,W=shape; y,x=np.mgrid[0:H,0:W]; return ((((x+.5)/W*2-1)/k)**2+(((y+.5)/H*2-1)/k)**2<1).astype(np.float32)
def alpha_brownink_local(img,lo=.12,hi=.38,hue=14,blur=30):
    from PIL import ImageFilter
    A=np.asarray(img.convert('RGB')).astype(np.float32)
    G=Image.fromarray(A[...,1].astype(np.uint8)); bg=np.asarray(G.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)
    t=np.clip((1-A[...,1]/np.maximum(bg,1)-lo)/(hi-lo),0,1)
    gate=np.clip((A[...,0]-A[...,2]-hue*.4)/hue,0,1); return t*gate
def alpha_norm(img,ch=1,lo=.3,hi=.7,win=61,blur=25,minc=25,gate=None,bgwin=21):
    """Ink alpha with locally normalised contrast: (bg-v)/(bg-ink) where bg/ink are local max/min of channel ch."""
    from PIL import ImageFilter
    A=np.asarray(img.convert('RGB')).astype(np.float32); C=A[...,ch] if ch is not None else A.mean(-1)
    G=Image.fromarray(np.clip(C,0,255).astype(np.uint8))
    bg=np.asarray(G.filter(ImageFilter.MaxFilter(bgwin|1)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)
    ik=np.asarray(G.filter(ImageFilter.MinFilter(win|1)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)
    t=(bg-C)/np.maximum(bg-ik,minc); a=np.clip((t-lo)/(hi-lo),0,1)
    if gate is not None: a=a*gate(A)
    return a
def alpha_gold_on_black(img):
    from PIL import ImageFilter
    L=img.convert('L'); Lf=np.asarray(L).astype(float); nb=np.asarray(L.filter(ImageFilter.GaussianBlur(18))).astype(float)
    spec=np.clip((Lf-100)/40,0,1)*np.clip((165-nb)/20,0,1)
    return np.maximum(alpha_gold(img)*np.clip((175-nb)/20,0,1),spec)
def despeckle(a,min_area=60,border=True,keep=None,thr=.4,max_elong=None,min_fill=0.):
    """Drop connected ink blobs that touch the image border (seams, neighbouring panels) or are tiny."""
    import cv2
    m=(a>thr).astype(np.uint8); n,lab,st,_=cv2.connectedComponentsWithStats(m,connectivity=8)
    H,W=a.shape; out=np.zeros_like(a); grow=cv2.dilate(m,np.ones((3,3),np.uint8))
    n2,lab2,_,_=cv2.connectedComponentsWithStats(grow,connectivity=8)
    good=np.zeros(n,bool)
    for i in range(1,n):
        x,y,w,h,ar=st[i]
        if ar<min_area: continue
        if border and (x<=1 or y<=1 or x+w>=W-1 or y+h>=H-1) and (ar<.22*w*h or ar<min_area*4): continue
        if max_elong and max(w,h)/max(1,min(w,h))>max_elong and ar<.15*w*h: continue
        if ar<min_fill*w*h: continue
        good[i]=True
    keepm=good[lab]
    # keep the soft edge: pixels of the dilated blob around kept cores
    k2=np.zeros(n2,bool); k2[np.unique(lab2[keepm])]=True; k2[0]=False
    return a*k2[lab2]
class PhotoR(Photo):
    """Calibrated photo from correspondences: pts=[(px,py,ball_dir),...] (>=2); Kabsch gives the ball->camera rotation."""
    def __init__(s,path,cx,cy,R,D,pts):
        s.img=Image.open(path); s.cx,s.cy,s.R,s.D=cx,cy,R,D; DEFAULT_D[0]=D
        obs=[dir_of(cx,cy,R,x,y,D) for x,y,_ in pts]; ball=[_norm(b) for *_,b in pts]
        s.M=kabsch(ball,obs)
        s.res=[float(np.degrees(math.acos(min(1,np.dot(s.M@b,o))))) for b,o in zip(ball,obs)]
        nb=ball[0]; ub=_norm(np.cross(np.cross(nb,ball[1]),nb)); s.anchor=frame(nb,ub)
def fill_holes(a,region=None,thr=.5,max_area=None):
    """Fill enclosed holes (not reachable from the border) in the ink; region=(x0,y0,x1,y1) fractions limits where."""
    import cv2
    m=(a>thr).astype(np.uint8); inv=1-m; n,lab,st,_=cv2.connectedComponentsWithStats(inv,connectivity=4)
    H,W=a.shape; out=a.copy()
    for i in range(1,n):
        x,y,w,h,ar=st[i]
        if x==0 or y==0 or x+w>=W or y+h>=H: continue
        if max_area and ar>max_area: continue
        if region is not None:
            cx,cy=(x+w/2)/W,(y+h/2)/H
            if not(region[0]<=cx<=region[2] and region[1]<=cy<=region[3]): continue
        out[lab==i]=1.
    return out
def close(a,k=5):
    import cv2
    return cv2.morphologyEx(a.astype(np.float32),cv2.MORPH_CLOSE,np.ones((k,k),np.uint8))
def close_region(a,region,k=21):
    H,W=a.shape; x0,y0,x1,y1=int(region[0]*W),int(region[1]*H),int(region[2]*W),int(region[3]*H)
    b=a.copy(); b[y0:y1,x0:x1]=np.maximum(b[y0:y1,x0:x1],close(a,k)[y0:y1,x0:x1]); return b
