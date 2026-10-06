import numpy as np,math
TGN=np.array([(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)],float);TGA=np.array([(0,0,1),(0,0,1),(1,0,0),(1,0,0),(0,1,0),(0,1,0)],float)
UC,R=.70,.33
def smin(a,b,k):
  h=np.clip(.5+.5*(b-a)/k,0,1);return b*(1-h)+a*h-k*h*(1-h)
def prop(P,i):
  n,a=TGN[i],TGA[i];b=np.cross(n,a)
  u=np.arctan2(P@a,P@n);v=np.arcsin(np.clip(P@b,-1,1));au=np.abs(u);u2=au*au
  w=.23468+u2*(.61905+u2*(-1.20573+u2*.51730));dw=au*(2*.61905+u2*(4*-1.20573+u2*6*.51730))
  band=np.maximum((np.abs(v)-w)/np.sqrt(1+dw*dw),au-.85);lobe=np.hypot((au-UC)*np.cos(v),v)-R
  return smin(band,lobe,.04),u,v
def nearest(P):
  best=np.full(P.shape[:-1],9.);pid=np.zeros(P.shape[:-1],int);U=np.zeros(P.shape[:-1]);V=U.copy()
  for i in range(6):
    d,u,v=prop(P,i);s=d<best;best[s]=d[s];pid[s]=i;U[s]=u[s];V[s]=v[s]
  return best,pid,U,V
