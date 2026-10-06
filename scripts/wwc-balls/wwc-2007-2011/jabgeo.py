import numpy as np,math
C=np.array([(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1),(-1,-1,-1),(-1,1,1),(1,-1,1),(1,1,-1)],float)/3**.5
def scores(D,A,K): return np.stack([A*(D@c)+K if i<4 else D@c for i,c in enumerate(C)],-1)
def geo(A,K,n=1600):
  # junction: on the great circle through T0 toward the corner direction; corner of T0 lies toward -(hex centre) ... search numerically on a fine grid near T0
  lon=(np.arange(n)+.5)/n*2*np.pi-np.pi;lat=((np.arange(n//2)+.5)/(n//2)-.5)*np.pi;lo,la=np.meshgrid(lon,lat)
  D=np.stack([np.cos(la)*np.sin(lo),np.sin(la),np.cos(la)*np.cos(lo)],-1).reshape(-1,3)
  S=scores(D,A,K);o=np.sort(S,1);j=D[(o[:,-1]-o[:,-3])<.005]
  w=S.argmax(1);wt=np.cos(np.arcsin(D[:,1]));areaT=wt[w<4].sum()/4;areaH=wt[w>=4].sum()/4
  J=[]
  for p in j:
    if all(np.dot(p,q)<math.cos(.04) for q in J): J.append(p)
  J=np.array(J);T=C[0];cc=np.degrees(np.arccos(np.clip(J@T,-1,1))).min()
  A_=np.degrees(np.arccos(np.clip(J@J.T,-1,1)));np.fill_diagonal(A_,999);ss=A_.min()
  return cc,ss,areaT/areaH,len(J)
if __name__=='__main__':
  print('current',geo(2*.57735/.57735,-.85))
