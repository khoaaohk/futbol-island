"""numpy port of BZ_CORE.bz_cell (2014-brazuca.ts): returns panel index and edge distance."""
import numpy as np
CUBE=np.array([[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],float)
def nrm(v): return v/np.linalg.norm(v,axis=-1,keepdims=True)
EDGES=[]
for a in range(6):
    for b in range(a+1,6):
        if abs(CUBE[a]@CUBE[b])>.5: continue
        M=nrm(CUBE[a]+CUBE[b]);N=nrm(CUBE[a]-CUBE[b]);EDGES.append((a,b,M,np.cross(M,N),N))
def smin(a,b,k):
    h=np.clip(.5+.5*(b-a)/k,0,1);return b*(1-h)+a*h-k*h*(1-h)
def bz_cell(p,A0=-.247,B0=.256,EA=.183,EB=.323,K1=.15,K2=.05):
    sh=p.shape[:-1];own=np.full(sh+(6,),9.)
    lobe=lambda a,b:(np.hypot((a-A0)/EA,(b+B0)/EB)-1)*min(EA,EB)
    for a,b,M,T,N in EDGES:
        cm=p@M;r=np.arccos(np.minimum(cm,1));t=(p-M*cm[...,None])/np.maximum(np.sqrt(np.maximum(1-cm*cm,0)),1e-4)[...,None]
        A=r*(t@T);B=r*(t@N);ok=cm>=.07
        own[...,a]=np.where(ok,np.minimum(own[...,a],lobe(A,B)),own[...,a]);own[...,b]=np.where(ok,np.minimum(own[...,b],lobe(-A,-B)),own[...,b])
    d=np.stack([p[...,0],-p[...,0],p[...,1],-p[...,1],p[...,2],-p[...,2]],-1)
    S=[]
    for x in range(6):
        oth=[y for y in range(6) if y!=x];m=d[...,oth].max(-1);lf=own[...,oth].min(-1)
        base=np.arcsin(np.clip((m-d[...,x])*.7071068,-1,1));S.append(-smin(-smin(base,own[...,x],K1),lf,K2))
    S=np.stack(S,-1);o=np.sort(S,-1);return np.argmin(S,-1),.5*(o[...,1]-o[...,0])
def seam_pts(params={},n=200000,w=.004,seed=0):
    rng=np.random.default_rng(seed);p=nrm(rng.normal(size=(n,3)));_,e=bz_cell(p,**params);return p[e<w]
