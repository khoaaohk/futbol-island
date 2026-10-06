import sys,json;sys.path.insert(0,'tools');from sphere import *
# uwc.py out W  name:path:Mfile:Cfile ...
out,W=sys.argv[1],int(sys.argv[2]);rows=[]
for spec in sys.argv[3:]:
  n,p,mf,cf=spec.split(':');cx,cy,R,D=json.load(open(cf));M=np.load(mf);M=M if M.ndim==2 else M[0]
  ph=Photo(p,cx,cy,R,D,M);Dd=eq_dirs(W,W//2);c,w=ph.sample_ball(Dd);c[w<.15]=.5
  im=Image.fromarray((c*255).astype(np.uint8));from PIL import ImageDraw;d=ImageDraw.Draw(im)
  for v in [(a,b,cc) for a in(1,-1) for b in (1,-1) for cc in (1,-1)]:
    x,y=dir_to_eq(nrm(np.array(v,float)),W,W//2);d.ellipse([x-4,y-4,x+4,y+4],outline=(255,0,0))
  for v in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]:
    x,y=dir_to_eq(nrm(np.array(v,float)),W,W//2);d.ellipse([x-4,y-4,x+4,y+4],outline=(255,0,255))
  rows.append(np.asarray(im))
Image.fromarray(np.concatenate(rows,0)).save(out)
