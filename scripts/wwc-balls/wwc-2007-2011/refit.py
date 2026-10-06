import sys,itertools,json,numpy as np,math;sys.path.insert(0,'tools');from sphere import *
from jfit import junc
J=junc(2,-.95);np.save('J11b.npy',J)
cases={'dm':('../refs/speedcell/Diana-Matheson-in-2011.JPG',(190.5,362,107.5),[(193,407),(192,335),(192,292)],(1,-1,-1)),
       'ks':('../refs/wwc-2011-speedcell/photo-Speedcell.jpg',(387,258,188),[(330,212),(400,356),(418,428)],(1,1,1))}
for n,(p,(cx,cy,R),f,t) in cases.items():
  T=nrm(np.array(t,float));best=None
  for Dd in [3,3.5,4,5,6,8,None]:
    ph=Photo(p,cx,cy,R,Dd)
    for a,b in itertools.permutations(range(len(J)),2):
      if np.dot(J[a],T)<.6: continue
      r=ph.fit([(f[0][0],f[0][1],T),(f[1][0],f[1][1],J[a]),(f[2][0],f[2][1],J[b])])
      if best is None or max(r)<best[0]: best=(max(r),Dd,ph.M.copy())
  print(n,round(best[0],2),best[1]);np.save(f'M_{n}.npy',best[2]);json.dump([cx,cy,R,best[1]],open(f'C_{n}.json','w'))
