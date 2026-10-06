"""Conext19 / Telstar 18 seams as measured: each cube edge A|B is replaced by a 'Z' of great-circle arcs
corner(A+B+AxB) -> tA -> edge midpoint -> tB -> corner(A+B-AxB), tX = THETA from face centre X toward the edge."""
import numpy as np,math
FACES=[np.array(v,float) for v in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]]
def nrm(v): v=np.asarray(v,float);return v/np.linalg.norm(v,axis=-1,keepdims=True)
def zseams(theta=math.radians(20)):
    out=[]
    for i,a in enumerate(FACES):
        for j,b in enumerate(FACES):
            if j<=i or abs(np.dot(a,b))>.5: continue
            c=np.cross(a,b);c1=nrm(a+b+c);c2=nrm(a+b-c);m=nrm(a+b)
            ta=nrm(math.cos(theta)*a+math.sin(theta)*b);tb=nrm(math.cos(theta)*b+math.sin(theta)*a)
            out.append([c1,ta,m,tb,c2])
    return out
def arcpts(p,q,n=60):
    w=math.acos(np.clip(np.dot(p,q),-1,1));t=np.linspace(0,1,n)[:,None]
    return (np.sin((1-t)*w)*p+np.sin(t*w)*q)/math.sin(w)
def seam_points(theta=math.radians(20),n=60):
    pts=[]
    for z in zseams(theta):
        for k in range(4): pts.append(arcpts(z[k],z[k+1],n))
    return np.concatenate(pts)
