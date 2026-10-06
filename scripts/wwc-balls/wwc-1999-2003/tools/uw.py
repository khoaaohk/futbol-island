import sys,json;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
# uw.py out W name path   (uses M_name.npy C_name.json)
out,W,name,path=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4]
cx,cy,R,D=json.load(open(f'C_{name}.json'));ph=Photo(path,cx,cy,R,D,np.load(f'M_{name}.npy'))
Dd=eq_dirs(W,W//2);c,w=ph.sample_ball(Dd);c[w<.15]=.5
im=Image.fromarray((c*255).astype(np.uint8));from PIL import ImageDraw;d=ImageDraw.Draw(im)
for v in [(a,b,cc) for a in(1,-1) for b in (1,-1) for cc in (1,-1)]:
  x,y=dir_to_eq(nrm(np.array(v,float)),W,W//2);d.text((x-10,y-5),''.join('+' if t>0 else '-' for t in v),fill=(255,0,0))
for v in [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]:
  x,y=dir_to_eq(nrm(np.array(v,float)),W,W//2);d.ellipse([x-4,y-4,x+4,y+4],outline=(255,0,255))
im.save(out)
