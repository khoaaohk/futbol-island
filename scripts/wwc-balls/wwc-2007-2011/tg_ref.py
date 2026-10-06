import sys,json;sys.path.insert(0,'tools');from sphere import *
G=tetra_group();cx,cy,R,D=json.load(open('C_tg.json'));M0=np.load('M_tg.npy')
p='ref/tg07_fl1.jpg';ph=Photo(p,cx,cy,R,D,M0);ph.img=cv2.GaussianBlur(ph.img,(0,0),1.5)
H,W=ph.img.shape[:2]
MASKS=[(335,222,625,250),(360,250,640,415),(330,430,480,540)]  # watermark, signature, +TEAMGEIST roundel
def bad(X,Y):
  m=np.zeros(X.shape,bool)
  for x0,y0,x1,y1 in MASKS: m|=(X>=x0)&(X<=x1)&(Y>=y0)&(Y<=y1)
  return m
Dd=eq_dirs(360,180)
def f(v):
  ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R=cx+v[3],cy+v[4],R*(1+v[5]);ph.D=D*math.exp(v[6])
  cs=[];ws=[]
  for g in G:
    Q=Dd@g.T;C=Q@ph.M.T;X,Y=ph.project(C);c,w=ph.sample_ball(Q);w=np.where(bad(X,Y),0,w);cs.append(c);ws.append(w)
  tot=0;n=0
  for i in range(len(G)):
    for j in range(i+1,len(G)):
      m=(ws[i]>.45)&(ws[j]>.45);tot+=np.abs(cs[i][m]-cs[j][m]).sum();n+=m.sum()
  return tot/max(n,1)/3,n
v=np.zeros(7);steps=np.array([.02,.02,.02,0,0,0,.2]);c0,n0=f(v);print('start',c0,n0)
while steps[0]>3e-4:
  imp=False
  for i in range(7):
    for s in (steps[i],-steps[i]):
      v2=v.copy();v2[i]+=s;c,n=f(v2)
      if c<c0 and n>.7*n0:c0,v,imp=c,v2,True
  if not imp: steps/=2
f(v);print('end',c0,np.round(v,3),ph.cx,ph.cy,ph.R,ph.D)
np.save('M_tg.npy',ph.M);json.dump([ph.cx,ph.cy,ph.R,ph.D],open('C_tg.json','w'))
