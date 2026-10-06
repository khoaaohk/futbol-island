import sys;sys.path.insert(0,'.');from corr2 import *
def d3(a):
    a=nrm(np.array(a,float));G=[np.eye(3),rot(a,2*math.pi/3),rot(a,-2*math.pi/3)]
    E=[nrm(np.array(e,float)) for e in [(1,0,1),(1,0,-1),(0,1,1),(0,1,-1),(1,1,0),(1,-1,0)] if abs(np.dot(e,a))<1e-6]
    return G+[rot(e,math.pi) for e in E]
CANDS={'(1,1,-1)':(1,1,-1),'(1,-1,-1)':(1,-1,-1),'(1,1,1)':(1,1,1),'(-1,1,1)':(-1,1,1)}
def selftest(ph,minw=.35):
    out={}
    for k,a in CANDS.items():
        rs=[]
        for g in d3(a)[1:]:
            best=None
            for T in TS:
                r,n=corr(ph,ph,g,T=nrm(np.array(T,float)),minw=minw)
                if r is not None and (best is None or n>best[1]): best=(r,n)
            rs.append(None if best is None else (round(best[0],2),best[1]))
        out[k]=rs
    return out
