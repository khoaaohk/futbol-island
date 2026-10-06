import sys,json;sys.path.insert(0,'tools');from sphere import *;from register import rodrigues
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
S={'a3':(R+'16397047065.jpg','Mg_a3.npy','C_a3g.json'),'a1':(R+'15774583044.jpg','Mg_a1.npy','C_a1g.json'),'fh1':('ro/fh1.jpg','Mg_fh1.npy','C_fh1g.json'),'eq1':('ro/eq1.jpg','Mg_eq1.npy','C_eq1g.json')}
G=np.load('D4.npy');PH={}
for k,(p,m,c) in S.items():
  cx,cy,Rr,D=json.load(open(c));ph=Photo(p,cx,cy,Rr,D,np.load(m));ph.img=cv2.GaussianBlur(ph.img,(0,0),Rr/200)
  L=ph.img.mean(-1,keepdims=True);ph.img=np.concatenate([L,(ph.img-L)*1.5],-1).astype(np.float32);PH[k]=ph
Dd=eq_dirs(300,150)
for it in range(2):
  for k in PH:
    ph=PH[k];M0=ph.M.copy();cx0,cy0,R0,D0=ph.cx,ph.cy,ph.R,ph.D;others=[j for j in PH if j!=k]
    pre={j:[PH[j].sample_ball(Dd@g.T) for g in G] for j in others}
    def f(v):
      ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R,ph.D=cx0+v[3],cy0+v[4],R0*(1+v[5]),D0*math.exp(v[6])
      ca,wa=ph.sample_ball(Dd);tot=0;n=0
      for j in others:
        for cb,wb in pre[j]:
          m=(wa>.4)&(wb>.4);tot+=np.abs(ca[m]-cb[m]).sum();n+=m.sum()
      return tot/max(n,1)
    v=np.zeros(7);steps=np.array([.01,.01,.01,R0*.005,R0*.005,.005,.1]);c0=f(v);cs=c0
    while steps[0]>3e-4:
      imp=False
      for i in range(7):
        for s in (steps[i],-steps[i]):
          v2=v.copy();v2[i]+=s;c=f(v2)
          if c<c0:c0,v,imp=c,v2,True
      if not imp: steps/=2
    f(v);print(it,k,round(cs,4),'->',round(c0,4),np.round(v,3),flush=True)
    np.save(S[k][1],ph.M);json.dump([ph.cx,ph.cy,ph.R,ph.D],open(S[k][2],'w'))
