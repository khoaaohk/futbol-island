import sys,json;sys.path.insert(0,'tools');from sphere import *
exec(open('ref_final2.py').read().replace("import sys,json;sys.path.insert(0,'tools');from sphere import *",""))
G=np.load('oz_G.npy');st=json.load(open('C_st.json'));Mst=np.load('M_st.npy')
q=Photo.__new__(Photo);q.cx,q.cy,q.R,q.D=st;EMB=nrm(Mst.T@q.cam_dir(650,554));C2Y=np.diag([-1.,1,-1])
name,path,cx,cy,R,D,ex,ey=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]),float(sys.argv[6]),float(sys.argv[7]),float(sys.argv[8])
p=Photo.__new__(Photo);p.cx,p.cy,p.R,p.D=cx,cy,R,D
best=None
for M0 in np.load(f'Mf_{name}.npy'):
  for g in G:
    M=M0@g
    for e in (EMB,C2Y@EMB):
      c=M@e
      if p.facing(c[None])[0]<.2: continue
      x,y=p.project(c[None]);d=math.hypot(x[0]-ex,y[0]-ey)
      if best is None or d<best[0]: best=(d,M)
print(name,'emblem miss px',round(best[0]))
refine(path,cx,cy,R,D,best[1],name)
