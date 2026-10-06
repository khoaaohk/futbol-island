import sys,json;sys.path.insert(0,'tools');from sphere import *
R='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
S={'a3':(R+'16397047065.jpg','Mg_a3.npy','C_a3g.json'),'a1':(R+'15774583044.jpg','Mg_a1.npy','C_a1g.json')}
PH={}
for k,(p,m,c) in S.items():
  cx,cy,Rr,D=json.load(open(c));PH[k]=Photo(p,cx,cy,Rr,D,np.load(m));PH[k].img=cv2.GaussianBlur(PH[k].img,(0,0),3)
D=eq_dirs(240,120);O=octa_group()
base={k:PH[k].sample_ball(D) for k in PH}
for i,g in enumerate(O):
  row=[]
  for a in PH:
    ca,wa=base[a]
    for b in PH:
      cb,wb=PH[b].sample_ball(D@g.T);m=(wa>.5)&(wb>.5)
      if a==b and i==0: continue
      if m.sum()>60: row.append((a+'-'+b,round(float(np.abs(ca[m]-cb[m]).mean()),3),int(m.sum())))
  print(i,round(math.degrees(math.acos(np.clip((np.trace(g)-1)/2,-1,1)))),row)
