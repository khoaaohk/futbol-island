"""1999 Icon print -> 6 cube-face RGBA decals (ink only; the shader draws the white skin, seams and stitching).
Triads: per hexagon, posterised to {navy, city accent} from the best-facing registered view (fb = original 1999 ball, studio;
r1/r3 = 2024 adidas reissue, reference only). Hexagons no view shows take their antipode's triad (icon identity at antipodes
was checked on 3 seen pairs), turned 180 deg in the frame so the triad outline lands right: INFERRED.
Marks: ICON logo, OFFICIAL MATCH BALL…1999, adidas EQUIPMENT, posterised from fb (the original)."""
import sys,json;sys.path.insert(0,'.');from geo32 import *
OUT=sys.argv[1];N=int(sys.argv[2]) if len(sys.argv)>2 else 512
V={}
for n,p in [('fb','ref/icon_fb_c.png'),('r1','ref/IW5503_b2b012_plp.png'),('r3','ref/IW5503_b2b212_pdp.png')]:
    cx,cy,R,D=json.load(open(f'C_{n}.json'));V[n]=Photo(p,cx,cy,R,D,np.load(f'M_{n}.npy'))
NAVY=np.array([26,43,110])/255
ACC={'teal':[84,183,180],'pink':[247,182,197],'orange':[206,137,32],'yellow':[225,242,133],'red':[223,47,14]}
ACC={k:np.array(v)/255 for k,v in ACC.items()}
CLASS={7:'teal',17:'teal',12:'teal',2:'teal',1:'pink',3:'pink',16:'pink',18:'pink',0:'orange',19:'orange',10:'orange',9:'orange',
       15:'orange',4:'orange',11:'yellow',8:'yellow',5:'yellow',14:'yellow',13:'red',6:'red'}
TS,TH=360,.42
def frame(h):
    P0=adj_pents(h)[0] if np.max(ICO@h)<.99 else DOD[np.argmax(DOD@h)];e1=nrm(P0-h*np.dot(P0,h));x=np.cross(e1,h);return x,e1
def tile_dirs(h):
    x,e1=frame(h);a=((np.arange(TS)+.5)/TS*2-1)*TH;A,B=np.meshgrid(a,-a);return nrm(h+x*A[...,None]+e1*B[...,None])
def tile_uv(P,h):
    x,e1=frame(h);d=P@h;g=np.maximum(d,1e-6);u=(P@x)/g;v=(P@e1)/g;return (u/TH+1)/2*TS-.5,(1-v/TH)/2*TS-.5
def kmeans3(c,m,init):
    X=c[m];cen=np.array(init,float)
    for _ in range(15):
        d=((X[:,None]-cen[None])**2).sum(-1);l=d.argmin(1)
        for k in range(3):
            if (l==k).sum()>30: cen[k]=X[l==k].mean(0)
    d=((c[...,None,:]-cen)**2).sum(-1);return d.argmin(-1),cen
SRC={};TILES={}
for i,h in enumerate(DOD):
    P=tile_dirs(h);best=None
    for n,ph in V.items():
        c,w=ph.sample_ball(P);s=np.median(w[TS//3:2*TS//3,TS//3:2*TS//3])
        if n=='fb': s+=.08  # prefer the original ball
        if best is None or s>best[0]: best=(s,n,c,w)
    s,n,c,w=best
    g=(c[...,1]>c[...,0]+.04)&(c[...,1]>c[...,2]+.04)&(c.max(-1)-c.min(-1)>.12)
    if CLASS[i]!='yellow': w=np.where(cv2.dilate(g.astype(np.uint8),np.ones((9,9),np.uint8))>0,0,w)
    if s<.42 or (w>.25).mean()<.55: continue
    c=cv2.GaussianBlur(c.astype(np.float32),(0,0),.8)
    acc_guess=ACC[CLASS[i]] if n=='fb' else np.clip(ACC[CLASS[i]]*.5+.5*np.array([.9,.85,.85]),0,1)
    lab,cen=kmeans3(c,w>.25,[[.9,.9,.88],[.15,.22,.45],acc_guess])
    ink=np.zeros((TS,TS),np.uint8);ink[lab==1]=1;ink[lab==2]=2;ink[w<.25]=255
    ink=cv2.medianBlur(ink,3)
    TILES[i]=ink;SRC[i]=(n,round(float(s),2))
GI=group_close([rot(ICO[0],2*math.pi/5),rot(nrm(ICO[0]+ICO[np.argsort(-(ICO@ICO[0]))[1]]+ICO[np.argsort(-(ICO@ICO[0]))[2]]),2*math.pi/3)])
MAPG={}
for i,h in enumerate(DOD):
    if i in TILES: continue
    j=int(np.argmax(-(DOD@h)))
    if j in TILES:
        g=next(g for g in GI if np.allclose(g@DOD[j],h) and abs(np.trace(g)+1)<1e-6)
        MAPG[i]=(j,g);SRC[i]=('antipode of %d (C2 turn)'%j,0)
print(json.dumps({str(k):v for k,v in sorted(SRC.items())}))
# canonical triad mask: ink probability over every seen triad, folded over the triad's D3 symmetry
acc=np.zeros((TS,TS));cnt=np.zeros((TS,TS));C0=(TS/2-.5,TS/2-.5)
for i,T in TILES.items():
    if SRC[i][0] not in ('fb','r1','r3'): continue
    ink=((T==1)|(T==2)).astype(np.float32);vis=(T!=255).astype(np.float32)
    for mir in (0,1):
        a_=ink[:,::-1] if mir else ink;v_=vis[:,::-1] if mir else vis
        for ang in (0,120,240):
            Rm=cv2.getRotationMatrix2D(C0,ang,1);acc+=cv2.warpAffine(a_*v_,Rm,(TS,TS));cnt+=cv2.warpAffine(v_,Rm,(TS,TS))
PROB=acc/np.maximum(cnt,1e-6);MASK=(cv2.GaussianBlur(PROB.astype(np.float32),(0,0),1.)>.5).astype(np.float32)
Image.fromarray((np.stack([PROB,PROB,MASK],-1)*255).astype(np.uint8)).save('triad_mask.png')
FW=4.534567884457026/4.654876873532654
CENT=np.vstack([ICO*FW,DOD])
def cell(P):
    k=np.argmax(P@CENT.T,-1);return k
# marks from the original (fb), on the three pentagons it shows
MARKS={}
for name,Pp in [('icon',P_ICON),('omb',P_OMB),('adidas',P_ADI)]:
    P=tile_dirs(Pp);c,w=V['fb'].sample_ball(P);c=cv2.GaussianBlur(c.astype(np.float32),(0,0),.7)
    L=c.mean(-1);paper=cv2.GaussianBlur(cv2.dilate(L,np.ones((41,41),np.uint8)),(0,0),8)
    dark=np.clip(((paper-L)-.12)/.15,0,1)
    red=np.clip(((c[...,0]-c[...,2])-.25)/.15,0,1)
    MARKS[name]=(Pp,(dark*(w>.3)).astype(np.float32),(red*(w>.3)).astype(np.float32));print('mark',name,float(dark.max()),float((dark>.3).mean()),float((red>.3).mean()))
def triad_d(P):
    d=P@ICO.T;o=np.argsort(-d,-1);P1=ICO[o[...,0]];P2=ICO[o[...,1]]
    a=np.arccos(np.clip((P*P1).sum(-1),-1,1))
    tp=P-P1*(P*P1).sum(-1,keepdims=True);t2=P2-P1*(P2*P1).sum(-1,keepdims=True)
    cphi=(tp*t2).sum(-1)/np.maximum(np.linalg.norm(tp,axis=-1)*np.linalg.norm(t2,axis=-1),1e-9);phi=np.arccos(np.clip(cphi,-1,1))
    return a-(.535+.02*np.cos(5*phi))
def colour_alpha(P):
    k=cell(P);TD=triad_d(P);rgb=np.ones(P.shape[:-1]+(3,));a=np.zeros(P.shape[:-1])
    for i,h in enumerate(DOD):
        m=k==12+i
        if not m.any(): continue
        if i in MAPG: jj,g=MAPG[i];X,Y=tile_uv(P[m]@g,DOD[jj]);T=TILES[jj]
        elif i in TILES: X,Y=tile_uv(P[m],h);T=TILES[i]
        else: continue
        xi=np.clip(np.round(X).astype(int),0,TS-1);yi=np.clip(np.round(Y).astype(int),0,TS-1)
        l=T[yi,xi];cc=np.ones((m.sum(),3));aa=np.zeros(m.sum())
        Xh,Yh=tile_uv(P[m],h);mk=sample(MASK,Xh,Yh)
        ap=np.arccos(np.clip((P[m]@ICO.T).max(-1),-1,1));c5=-np.cos(5*np.arccos(np.clip(-(TD[m]-ap+.535)/.02,-1,1))/5*5) if False else None
        tipc=-(TD[m]-ap+.535)/.02  # = cos(5 phi) from triad_d
        Q=P[m];sc=Q@CENT.T;b=CENT[12+i];sb=sc[:,12+i];e=np.full(len(Q),9.)
        for j in range(32):
            if j==12+i: continue
            e=np.minimum(e,(sb-sc[:,j])/np.linalg.norm(b-CENT[j]))
        clip=np.clip((ap-(.512+.03*np.clip((tipc+1)/2,0,1)**1.5))/.003,0,1)*np.clip((e-.028)/.004,0,1)
        cc[:]=NAVY;aa[:]=np.clip((mk-.25)/.5,0,1)*clip;sel=(l==2)&(mk>.5)&(clip>.5);cc[sel]=ACC[CLASS[i]]
        ln=np.maximum(np.clip((.0045-np.abs(ap-.468))/.0012,0,1),np.clip((.005-np.abs(ap-.491))/.0012,0,1))
        aa[:]=np.maximum(aa,ln)
        rgb[m]=cc;a[m]=aa
    for name,(Pp,dk,rd) in MARKS.items():
        pi=int(np.argmax(ICO@Pp));m=k==pi
        if not m.any(): continue
        X,Y=tile_uv(P[m],Pp);d=sample(dk,X,Y);r=sample(rd,X,Y)
        cc=rgb[m];aa=a[m];sel=d>.3;cc[sel]=NAVY;aa[sel]=np.maximum(aa[sel],np.clip(d[sel]*1.5,0,1))
        sel=r>.3;cc[sel]=ACC['red'];aa[sel]=np.maximum(aa[sel],np.clip(r[sel]*1.5,0,1));rgb[m]=cc;a[m]=aa
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
    print(write_faces_rgba(colour_alpha,OUT,N))
    W=1600;rgb,a=colour_alpha(eq_dirs(W,W//2));img=rgb*a[...,None]+np.array([.95,.95,.93])*(1-a[...,None])
    Image.fromarray((np.clip(img,0,1)*255).astype(np.uint8)).save(OUT+'-eq.png')
