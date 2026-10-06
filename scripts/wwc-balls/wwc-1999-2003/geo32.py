import sys;sys.path.insert(0,'tools')
from sphere import *
from unwrap import ICO,DOD
ICO=np.array(ICO);DOD=np.array(DOD)
def adj_pents(h): # 3 pentagons adjacent to hexagon dir h
    d=ICO@h;return ICO[np.argsort(-d)[:3]]
def adj_hexes(p): d=DOD@p;return DOD[np.argsort(-d)[:5]]
H0=DOD[np.argmax(DOD@nrm(np.array([1.,1,1])))]
def ring(p, start):
    """the 5 hexagons round pentagon p in cyclic order, starting at hexagon 'start'."""
    hs=adj_hexes(p);e1=nrm(start-p*np.dot(start,p));e2=np.cross(p,e1)
    ang=[math.atan2(np.dot(h,e2),np.dot(h,e1))%(2*math.pi) for h in hs];return hs[np.argsort(ang)]
P_ICON,P_ADI,P_OMB=adj_pents(H0)[0],adj_pents(H0)[1],adj_pents(H0)[2]
