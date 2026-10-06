exec(open('fitgeo.py').read().replace("from bzgeo import *","from sgeo import *"))
import itertools
def pose_fit(P,k,J):
    o=OBS[k][1].cam_dir(*J);C=nrm(np.array([1.,1,1]));v=np.cross(C,o);s=np.linalg.norm(v);R0=rot(v/s,math.atan2(s,C@o))
    best=None
    for th in np.radians(np.arange(0,360,3)):
        M=rot(o,th)@R0;c=cost(None,{k:M},P)
        if best is None or c<best[0]: best=(c,M)
    c0,M0=best;w=np.zeros(3);step=.02
    while step>5e-4:
        imp=False
        for i in range(3):
            for sg in (step,-step):
                w2=w.copy();w2[i]+=sg;c=cost(None,{k:rodrigues(w2)@M0},P)
                if c<c0:c0,w,imp=c,w2,True
        if not imp: step/=2
    return c0,rodrigues(w)@M0
res=[]
for a in [-.3,-.25,-.2,-.15,-.1,-.05,0,.05,.1,.15,.2,.25,.3]:
    P=seam_pts(a,0.,n=300000,w=.003)
    c1,M1=pose_fit(P,'a3',(965,893));c2,M2=pose_fit(P,'a1',(898,960))
    print(a,round(math.degrees(c1),2),round(math.degrees(c2),2),flush=True);res.append((c1+c2,a,M1,M2))
res.sort(key=lambda t:t[0]);c,a,M1,M2=res[0];print('best a',a)
np.save('Ms_a3.npy',M1);np.save('Ms_a1.npy',M2);json.dump({'a':a},open('sg_params.json','w'))
