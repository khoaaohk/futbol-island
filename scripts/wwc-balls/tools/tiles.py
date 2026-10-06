import sys,json;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
def frame(T,ref=(0,0,1)):
    T=nrm(np.array(T,float));r=np.array(ref,float)
    if abs(np.dot(r,T))>.95: r=np.array([1.,0,0])
    e1=nrm(np.cross(r,T));e2=np.cross(T,e1);return T,e1,e2
def tile_dirs(T,n=400,half=.45,ref=(0,0,1)):
    T,e1,e2=frame(T,ref);a=((np.arange(n)+.5)/n*2-1)*half;b=(1-(np.arange(n)+.5)/n*2)*half
    A,B=np.meshgrid(a,b);P=T+e1*A[...,None]+e2*B[...,None];return P/np.linalg.norm(P,axis=-1,keepdims=True)
def tile_uv(P,T,n=400,half=.45,ref=(0,0,1)):
    T,e1,e2=frame(T,ref);d=P@T;g=np.maximum(d,1e-6)
    u=(P@e1)/g;v=(P@e2)/g;return (u/half+1)/2*n-.5,(1-v/half)/2*n-.5,d
def load(name,path,shaded=True):
    cx,cy,R,D=json.load(open(f'C_{name}.json'));M=np.load(f'M_{name}.npy')
    return (Shaded if shaded else Photo)(path,cx,cy,R,D,M)
