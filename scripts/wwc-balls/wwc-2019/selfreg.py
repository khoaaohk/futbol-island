"""Fit a photo's pose (and circle) by tetrahedral self-consistency of the print, starting from feature correspondences."""
import sys,json;sys.path.insert(0,'/private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2019/tools');from sphere import *
G=tetra_group()
def selfcost(ph,img,Dd,G=G,minf=.45):
    ph2=Photo.__new__(Photo);ph2.img=img;ph2.cx,ph2.cy,ph2.R,ph2.D,ph2.M=ph.cx,ph.cy,ph.R,ph.D,ph.M
    c0,w0=ph2.sample_ball(Dd);tot=0;n=0
    for g in G[1:]:
        c,w=ph2.sample_ball(Dd@g.T);m=(w0>minf)&(w>minf);tot+=np.abs(c0[m]-c[m]).sum();n+=m.sum()*3
    return tot/max(n,1),n
def refine(ph,blur=150,iters=1,fixD=True):
    img=cv2.GaussianBlur(ph.img,(0,0),ph.R/blur);Dd=eq_dirs(200,100)
    M0=ph.M.copy();cx0,cy0,R0=ph.cx,ph.cy,ph.R
    def f(v):
        ph.M=rodrigues(v[:3])@M0;ph.cx,ph.cy,ph.R=cx0+v[3],cy0+v[4],R0*(1+v[5]);return selfcost(ph,img,Dd)[0]
    v=np.zeros(6);steps=np.array([.03,.03,.03,R0*.01,R0*.01,.01]);c0=f(v);cs=c0
    while steps[0]>3e-4:
        imp=False
        for i in range(6):
            for s in (steps[i],-steps[i]):
                v2=v.copy();v2[i]+=s;c=f(v2)
                if c<c0:c0,v,imp=c,v2,True
        if not imp: steps/=2
    f(v);return cs,c0
