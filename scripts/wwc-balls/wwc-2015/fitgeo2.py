exec(open('fitgeo.py').read())
import time
names=['A0','B0','EA','EB','K1','K2'];p0=dict(A0=-.247,B0=.256,EA=.183,EB=.323,K1=.15,K2=.05)
M0={k:np.load(f'Mg_{k}.npy') for k in TR}
def unpack(v):
    p={n:p0[n]+v[i] for i,n in enumerate(names)};Ms={k:rodrigues(v[6+3*j:9+3*j])@M0[k] for j,k in enumerate(TR)};return p,Ms
def f(v):
    p,Ms=unpack(v)
    if p['EA']<.03 or p['EB']<.03 or p['K1']<.005 or p['K2']<.005: return 9
    return cost(p,Ms)
v=np.zeros(12);steps=np.array([.03,.03,.03,.03,.03,.02]+[.02]*6);c0=f(v);t=time.time();print('start',math.degrees(c0),flush=True)
it=0
while steps.max()>.002 and it<40:
    imp=False;it+=1
    for i in range(12):
        for s in (steps[i],-steps[i]):
            v2=v.copy();v2[i]+=s;c=f(v2)
            if c<c0:c0,v,imp=c,v2,True
    if not imp: steps/=2
    print(it,round(math.degrees(c0),3),np.round(v[:6],3),round(time.time()-t),flush=True)
p,Ms=unpack(v);json.dump(p,open('geo_params.json','w'));[np.save(f'Mg_{k}.npy',M) for k,M in Ms.items()]
print('final',p)
