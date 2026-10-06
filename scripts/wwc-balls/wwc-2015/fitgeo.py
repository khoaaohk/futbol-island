import sys,json;sys.path.insert(0,'tools');from bzgeo import *;from sphere import Photo,rodrigues,rot
import math
TR={'a3':dict(path='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-16397047065.jpg',c=(957,700,400),
 lines=[[(965,893),(972,930),(978,960),(983,990),(987,1020),(990,1040)],
        [(965,893),(930,880),(890,866),(850,850),(815,833),(790,818)],
        [(965,893),(990,872),(1020,845),(1050,815),(1080,790),(1110,768),(1140,745)],
        [(948,405),(935,375),(925,345),(918,320)],
        [(948,405),(985,412),(1025,425),(1060,440),(1100,460),(1130,480),(1150,500)],
        [(948,405),(925,425),(890,450),(850,480),(810,510),(775,535),(740,555)]]),
 'a1':dict(path='refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-15774583044.jpg',c=(780,665,480),
 lines=[[(797,360),(775,300),(750,240),(735,200)],[(797,360),(850,370),(900,380),(960,400),(1009,413)],[(797,360),(760,400),(720,450),(698,489)],
        [(898,960),(820,935),(750,913),(690,890),(633,866)],[(898,960),(950,920),(1009,866),(1060,810),(1104,760)],[(898,960),(910,1010),(921,1066),(930,1110),(939,1160)]])}
def obs_dirs(k):
    t=TR[k];ph=Photo.__new__(Photo);ph.cx,ph.cy,ph.R=t['c'];ph.D=None
    pts=[];J=[]
    for ln in t['lines']:
        # densify
        for (x0,y0),(x1,y1) in zip(ln[:-1],ln[1:]):
            for s in np.linspace(0,1,6,endpoint=False): pts.append(ph.cam_dir(x0+(x1-x0)*s,y0+(y1-y0)*s))
        pts.append(ph.cam_dir(*ln[-1]))
    return np.array(pts),ph
OBS={k:obs_dirs(k) for k in TR}
def model(params):
    P=seam_pts(params,n=500000,w=.003);return P
def cost(params,Ms,P=None):
    P=model(params) if P is None else P;tot=[]
    for k,M in Ms.items():
        O=OBS[k][0]@M  # cam -> ball (rows: M^T o)
        d=np.arccos(np.clip(O@P.T,-1,1)).min(1);tot.append(d)
    d=np.concatenate(tot);return np.sqrt(np.mean(np.minimum(d,.1)**2))
