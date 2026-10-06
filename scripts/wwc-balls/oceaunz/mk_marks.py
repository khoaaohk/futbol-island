import sys;sys.path.insert(0,'tools');from tiles import *
SRC={'st':'refs/wwc-2023-oceaunz/photo-2023-07-07-Fussball-Frauen-Landerspiel-Deutschland-Sambia-1DX-6938-by-Stepro-cropped.jpg','p912':'refs/ref-only/oceaunz/ht9011_9112459.png'}
PH={k:load(k,v,False) for k,v in SRC.items()}
def tile(name,px,half,n=400):
  ph=PH[name];c0=nrm(ph.M.T@ph.cam_dir(*px));P=tile_dirs(c0,n,half);c,w=ph.sample_ball(P);return c0,c.astype(np.float32),w
out={}
# light text on the black swirl (p912 studio photo, traced to one ink)
for nm,px,half,sig,mx in [('omb',(1300,1460),.26,9,60),('oceaunz',(330,1010),.2,22,95)]:
  c0,c,w=tile('p912',px,half);L=cv2.medianBlur((c.mean(-1)*255).astype(np.uint8),3).astype(np.float32)/255
  dk=cv2.GaussianBlur((L<.42).astype(np.float32),(0,0),6)
  loc=cv2.GaussianBlur(L,(0,0),sig);t=np.clip((L-loc-.06)/.08,0,1)*(dk>.3)*(L>.38)
  pm=np.zeros((400,400),np.uint8)
  if nm=='omb': cv2.polylines(pm,[np.array([(133,-10),(150,100),(185,200),(240,300),(330,400)],np.int32)],False,1,48)
  else: cv2.rectangle(pm,(60,22),(235,400),1,-1)
  t=t*pm
  m=(t>.5).astype(np.uint8);n_,lab,st_,cen=cv2.connectedComponentsWithStats(m,8);keep=np.zeros_like(m)
  for i in range(1,n_):
    if st_[i,4]>=40 and max(st_[i,2],st_[i,3])<=mx: keep[lab==i]=1
  a=t*cv2.dilate(keep,np.ones((3,3),np.uint8));a=cv2.GaussianBlur(a.astype(np.float32),(0,0),1.1);a=np.clip((a-.35)/.3,0,1);out[nm]=(c0,half,a)
  Image.fromarray(np.concatenate([(c*255).astype(np.uint8),np.repeat((a[...,None]*255).astype(np.uint8),3,-1)],1)).save(f'mk_{nm}.png')
np.save('marks_text.npy',np.array([(k,v[0],v[1],v[2]) for k,v in out.items()],dtype=object),allow_pickle=True)
# adidas bars: fit the Commons SVG to the darkness in the Stepro photo
c0,c,w=tile('st',(628,850),.24);L=c.mean(-1)
paper=cv2.GaussianBlur(cv2.dilate(L,np.ones((31,31),np.uint8)),(0,0),5);dark=np.clip((paper-L)/.4,0,1)*(w>.2)
svg=np.asarray(Image.open('adidas_bars.png'))[...,3].astype(np.float32)/255
best=None
for sc in np.linspace(.3,1.2,31):
  for th in range(-60,61,3):
    hgt=svg.shape[0]*sc*400/400;A=cv2.getRotationMatrix2D((svg.shape[1]/2,svg.shape[0]/2),th,sc);A[0,2]+=200-svg.shape[1]/2;A[1,2]+=200-svg.shape[0]/2
    s=cv2.warpAffine(svg,A,(400,400))
    for dx in range(-120,121,10):
      for dy in range(-120,121,10):
        sh=np.roll(np.roll(s,dy,0),dx,1);v=(sh*(dark-.3)).sum()
        if best is None or v>best[0]: best=(v,sc,th,dx,dy)
v,sc,th,dx,dy=best
for it in range(2):
  for sc2 in np.linspace(sc-.03,sc+.03,7):
    for th2 in np.arange(th-3,th+3.1,1):
      A=cv2.getRotationMatrix2D((svg.shape[1]/2,svg.shape[0]/2),th2,sc2);A[0,2]+=200-svg.shape[1]/2;A[1,2]+=200-svg.shape[0]/2;s=cv2.warpAffine(svg,A,(400,400))
      for dx2 in range(dx-8,dx+9,2):
        for dy2 in range(dy-8,dy+9,2):
          sh=np.roll(np.roll(s,dy2,0),dx2,1);vv=(sh*(dark-.3)).sum()
          if vv>best[0]: best=(vv,sc2,th2,dx2,dy2)
  v,sc,th,dx,dy=best
print('adidas fit',best)
A=cv2.getRotationMatrix2D((svg.shape[1]/2,svg.shape[0]/2),th,sc);A[0,2]+=200-svg.shape[1]/2+dx;A[1,2]+=200-svg.shape[0]/2+dy
a=cv2.warpAffine(svg,A,(400,400))
np.save('mark_adidas.npy',np.array([c0,.24,a],dtype=object),allow_pickle=True)
Image.fromarray(np.concatenate([(c*255).astype(np.uint8),np.repeat((np.maximum(dark,a*.7)[...,None]*255).astype(np.uint8),3,-1)],1)).save('mk_adidas.png')
