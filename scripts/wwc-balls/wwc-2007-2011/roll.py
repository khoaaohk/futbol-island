import sys;sys.path.insert(0,'tools');from sphere import *
# roll.py photo cx cy R D px py T0x T0y T0z out
p=sys.argv[1];cx,cy,R=map(float,sys.argv[2:5]);D=None if sys.argv[5]=='None' else float(sys.argv[5]);px,py=map(float,sys.argv[6:8]);T0=nrm(np.array(list(map(float,sys.argv[8:11]))));out=sys.argv[11]
s=SeamMap(sys.argv[12] if len(sys.argv)>12 else '../audit0/wwc-2011-speedcell-map.png')
ph=Photo(p,cx,cy,R,D);c=ph.cam_dir(px,py)
tiles=[]
for k,roll in enumerate(range(0,120,15)):
  # rotation taking T0 to c, then roll about c
  v=np.cross(T0,c);sa=np.linalg.norm(v);ca=np.dot(T0,c);M=rot(v,math.atan2(sa,ca)) if sa>1e-9 else np.eye(3)
  ph.M=rot(c,math.radians(roll))@M
  overlay(ph,s,'tmp.png');im=Image.open('tmp.png').crop((int(cx-R*1.1),int(cy-R*1.1),int(cx+R*1.1),int(cy+R*1.1))).resize((300,300))
  from PIL import ImageDraw;ImageDraw.Draw(im).text((4,4),str(roll),fill=(255,0,0));tiles.append(im)
  np.save(f'Mroll_{roll}.npy',ph.M)
S=Image.new('RGB',(1200,600))
for i,t in enumerate(tiles): S.paste(t,((i%4)*300,(i//4)*300))
S.save(out)
