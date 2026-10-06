import sys,json,math;sys.path.insert(0,'tools');from sgeo import *;from sphere import Photo,rodrigues
exec(open('fitgeo.py').read().split("def obs_dirs")[0].split("import math")[1] if False else "")
TRL=json.load(open('traced.json'))
def sdist(p,a,b2):
    e=np.full(p.shape[:-1],9.)
    for ea,eb,M,T,N in EDGES:
        s=np.arctan2(p@T,p@M);q=np.arcsin(np.clip(p@N,-1,1));u=s/L+.5
        q0=a*np.sin(2*np.pi*u)+b2*np.sin(4*np.pi*u);sl=(a*2*np.pi*np.cos(2*np.pi*u)+b2*4*np.pi*np.cos(4*np.pi*u))/L
        d=np.abs(q-q0)/np.sqrt(1+sl*sl);dom=(np.abs(s)<L/2+.05)&(np.abs(q)<.5);e=np.where(dom,np.minimum(e,d),e)
    return e
names=list(TRL)
def unpack(v,M0):
    a,b2=v[0],v[1];out={}
    for j,k in enumerate(names):
        o=2+7*j;out[k]=(rodrigues(v[o:o+3])@M0[k],v[o+3],v[o+4],v[o+5],v[o+6])
    return a,b2,out
def resid(v,M0):
    a,b2,out=unpack(v,M0);r=[]
    for k in names:
        M,dx,dy,dr,ld=out[k];t=TRL[k];cx,cy,R=t['c'];ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R=cx+dx,cy+dy,R*(1+dr);ph.D=6*math.exp(ld) if t.get('persp') else None
        pts=[]
        for ln in t['lines']:
            for (x0,y0),(x1,y1) in zip(ln[:-1],ln[1:]):
                for s in np.linspace(0,1,4,endpoint=False): pts.append(ph.cam_dir(x0+(x1-x0)*s,y0+(y1-y0)*s))
            pts.append(ph.cam_dir(*ln[-1]))
        P=np.array(pts)@M;r.append(sdist(P,a,b2))
    return np.concatenate(r)
if __name__=='__main__':
    init=json.load(open('sg_params.json'));M0={k:np.load(f'Ms_{k}.npy') for k in names}
    v=np.zeros(2+7*len(names));v[0]=init['a'];v[1]=init.get('b2',0)
    f=lambda v:np.sqrt(np.mean(np.minimum(resid(v,M0),.08)**2))
    c0=f(v);print('start',math.degrees(c0))
    steps=np.array([.02,.02]+[.02,.02,.02,6,6,.01,.15]*len(names))
    while steps[0]>5e-4:
        imp=False
        for i in range(len(v)):
            for s in (steps[i],-steps[i]):
                w=v.copy();w[i]+=s;c=f(w)
                if c<c0:c0,v,imp=c,w,True
        if not imp: steps/=2
    a,b2,out=unpack(v,M0);print('end',math.degrees(c0),a,b2)
    for k in names:
        M,dx,dy,dr,ld=out[k];t=TRL[k];cx,cy,R=t['c'];np.save(f'Ms_{k}.npy',M)
        json.dump([cx+dx,cy+dy,R*(1+dr),6*math.exp(ld) if t.get('persp') else None],open(f'C_{k}s.json','w'))
        r=resid(v,M0);print(k,'p50/p90 deg',np.degrees(np.percentile(r,50)),np.degrees(np.percentile(r,90)))
    json.dump({'a':a,'b2':b2},open('sg_params.json','w'))
