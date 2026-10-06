"""S-seam cube geometry: 6 panels on a cube whose 12 edges are replaced by S-curves (odd about each edge midpoint, so the
cube's 24 rotations are kept): q0(s) = a sin(2 pi u) + b sin(4 pi u), u = s/L + .5 in [0,1] along the edge."""
import numpy as np
CUBE=np.array([[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],float)
def nrm(v): return v/np.linalg.norm(v,axis=-1,keepdims=True)
EDGES=[]
for a in range(6):
    for b in range(a+1,6):
        if abs(CUBE[a]@CUBE[b])>.5: continue
        M=nrm(CUBE[a]+CUBE[b]);N=nrm(CUBE[a]-CUBE[b]);T=np.cross(N,M);EDGES.append((a,b,M,T,N))
L=np.arccos(1/3)
def seam_q(p,a,b2):
    """For each edge: along s, across q (toward panel a) and curve offset q0."""
    out=[]
    for ea,eb,M,T,N in EDGES:
        s=np.arctan2(p@T,p@M);q=np.arcsin(np.clip(p@N,-1,1));u=s/L+.5
        q0=a*np.sin(2*np.pi*u)+b2*np.sin(4*np.pi*u);out.append((ea,eb,s,q,q0))
    return out
def cell(p,a=.196,b2=0.):
    d=np.stack([p[...,0],-p[...,0],p[...,1],-p[...,1],p[...,2],-p[...,2]],-1);face=np.argmax(d,-1)
    edge=np.full(p.shape[:-1],9.)
    for ea,eb,s,q,q0 in seam_q(p,a,b2):
        dom=np.abs(s)<L/2
        # nearest-face pair for this edge: only points whose two best faces are ea,eb (or near the edge)
        near=dom&(np.abs(q)<.6)&(np.maximum(d[...,ea],d[...,eb])>=np.sort(d,-1)[...,-2]-1e-9)
        side_a=(q>q0)
        face=np.where(near&((face==ea)|(face==eb)),np.where(side_a,ea,eb),face)
        slope=np.gradient if False else None
        edge=np.where(near,np.minimum(edge,np.abs(q-q0)),edge)
    return face,edge
def seam_dist(p,a,b2):
    e=np.full(p.shape[:-1],9.)
    for ea,eb,s,q,q0 in seam_q(p,a,b2):
        dom=(np.abs(s)<L/2)&(np.abs(q)<.5);e=np.where(dom,np.minimum(e,np.abs(q-q0)),e)
    return e
def seam_pts(a=.196,b2=0.,n=400000,w=.003,seed=0):
    rng=np.random.default_rng(seed);p=nrm(rng.normal(size=(n,3)));e=seam_dist(p,a,b2);return p[e<w]
