import sys,itertools,numpy as np,math;sys.path.insert(0,'tools');from sphere import *
from jabgeo import C,scores
def junc(A,K,n=1600):
  lon=(np.arange(n)+.5)/n*2*np.pi-np.pi;lat=((np.arange(n//2)+.5)/(n//2)-.5)*np.pi;lo,la=np.meshgrid(lon,lat)
  D=np.stack([np.cos(la)*np.sin(lo),np.sin(la),np.cos(la)*np.cos(lo)],-1).reshape(-1,3);S=scores(D,A,K);o=np.sort(S,1);j=D[(o[:,-1]-o[:,-3])<.005];J=[]
  for p in j:
    if all(np.dot(p,q)<math.cos(.04) for q in J): J.append(p)
  return np.array(J)
