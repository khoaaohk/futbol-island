import sys,json;sys.path.insert(0,'tools');from sphere import *
from unwrap import ICO
ICO=np.array(ICO)
TET=nrm(np.array([[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],float))
def frame(T):
    P=ICO[np.argmax(ICO@T)];e1=nrm(P-T*np.dot(P,T));e2=np.cross(e1,T);return e1,e2
def tile_dirs(T,n=600,half=.75):
    e1,e2=frame(T);a=((np.arange(n)+.5)/n*2-1)*half;b=(1-(np.arange(n)+.5)/n*2)*half
    A,B=np.meshgrid(a,b);r=np.hypot(A,B);ang=np.arctan2(A,B)  # azimuthal equidistant, up = toward P(e1)
    d=np.cos(ang)[...,None]*e1+np.sin(ang)[...,None]*e2
    return T*np.cos(r)[...,None]+d*np.sin(r)[...,None]
def tile_uv(Pd,T,n=600,half=.75):
    e1,e2=frame(T);r=np.arccos(np.clip(Pd@T,-1,1));tp=Pd-T*(Pd@T)[...,None]
    ang=np.arctan2(tp@e2,tp@e1);A=r*np.sin(ang);B=r*np.cos(ang)
    return (A/half+1)/2*n-.5,(1-B/half)/2*n-.5
def load(n):
    cx,cy,R,D=json.load(open(f'C_{n}.json'));return Photo(f'ref/{n}.png',cx,cy,R,D,np.load(f'M_{n}.npy'))
