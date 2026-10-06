import sys,json;sys.path.insert(0,'tools');from sphere import *
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
S={'a3':(R+'16397047065.jpg','Mg_a3.npy','C_a3g.json'),'a1':(R+'15774583044.jpg','Mg_a1.npy','C_a1g.json'),'fh1':('ro/fh1.jpg','Mg_fh1.npy','C_fh1g.json'),'eq1':('ro/eq1.jpg','Mg_eq1.npy','C_eq1g.json')}
PH={}
for k,(p,m,c) in S.items():
  cx,cy,Rr,D=json.load(open(c));ph=Photo(p,cx,cy,Rr,D,np.load(m));g=cv2.GaussianBlur(ph.img,(0,0),Rr/150)
  L=g.mean(-1);sat=g.max(-1)-g.min(-1);white=np.clip((L-.45)/.2,0,1)*np.clip((.25-sat)/.1,0,1)
  ph.img=np.repeat(white[...,None],3,-1).astype(np.float32);PH[k]=ph
D=eq_dirs(240,120);O=octa_group()
base={k:PH[k].sample_ball(D) for k in PH}
for i,g in enumerate(O):
  tot=0;n=0
  for a in PH:
    ca,wa=base[a]
    for b in PH:
      if a==b and i==0: continue
      cb,wb=PH[b].sample_ball(D@g.T);m=(wa>.5)&(wb>.5);tot+=np.abs(ca[m,0]-cb[m,0]).sum();n+=m.sum()
  print(i,round(math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)))),round(tot/max(n,1),3),n)
