import sys,json;from PIL import Image,ImageDraw
# compare.py out.jpg  render.png photo.png Cjson [label]   (pairs repeated)
out=sys.argv[1];args=sys.argv[2:];S=480;tiles=[]
for i in range(0,len(args),4):
  rend,photo,cj,label=args[i:i+4];cx,cy,R,D=json.load(open(cj))
  r=Image.open(rend).convert('RGB');k=1.06
  ph=Image.open(photo).convert('RGB').crop((int(cx-R*k),int(cy-R*k),int(cx+R*k),int(cy+R*k))).resize((S,S))
  rc=r.crop((int(440-420*k),int(440-420*k),int(440+420*k),int(440+420*k))).resize((S,S))
  t=Image.new('RGB',(2*S,S+24),'white');t.paste(ph,(0,24));t.paste(rc,(S,24));d=ImageDraw.Draw(t);d.text((6,5),label+'  (left: reference photo, right: render at the same pose)',fill='black');tiles.append(t)
s=Image.new('RGB',(2*S,(S+24)*len(tiles)),'white')
for i,t in enumerate(tiles): s.paste(t,(0,i*(S+24)))
s.save(out,quality=88)
