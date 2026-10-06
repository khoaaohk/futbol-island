import sys;sys.path.insert(0,'/private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2019/tools');from sphere import *
S=SeamMap('/private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/audit0/wwc-2019-conext19-map.png')
AX={tuple(np.round(c).astype(int)):i for i,c in enumerate(S.centres)}
J=np.load('/private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2019/ts_junctions.npy')
def junction(sgn): return J[np.argmax(J@nrm(np.array(sgn,float)))]
_seam_cache={}
def seam_pts(a,b):
    """seam pixels separating panels with centre axes a and b"""
    ia,ib=AX[tuple(a)],AX[tuple(b)];lab=S.label;H,W=lab.shape
    ys,xs=np.nonzero(S.seam);out=[]
    for y,x in zip(ys[::3],xs[::3]):
        nb=set(lab[max(0,y-5):y+6:2,[(x+d)%W for d in range(-5,6,2)]].ravel())
        if ia in nb and ib in nb: out.append(S.D[y,x])
    return np.array(out)
def edge_mid(a,b):
    p=seam_pts(a,b);c=nrm(np.array(a,float)+np.array(b,float))
    # the seam point closest to the (unwarped) edge midpoint direction
    return p[np.argmax(p@c)]
