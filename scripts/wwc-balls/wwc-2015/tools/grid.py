import sys;from PIL import Image,ImageDraw
# grid.py in out step [x0 y0 x1 y1] [scale]
im=Image.open(sys.argv[1]).convert('RGB');st=int(sys.argv[3])
if len(sys.argv)>7: im=im.crop(tuple(int(v) for v in sys.argv[4:8]));ox,oy=int(sys.argv[4]),int(sys.argv[5])
else: ox=oy=0
sc=float(sys.argv[8]) if len(sys.argv)>8 else 1
im=im.resize((int(im.width*sc),int(im.height*sc)));d=ImageDraw.Draw(im)
for x in range((ox//st)*st,ox+int(im.width/sc)+1,st):
  X=(x-ox)*sc;d.line([(X,0),(X,im.height)],fill=(255,0,0) if x%(st*5)==0 else (255,150,150),width=1);d.text((X+2,2),str(x),fill=(255,0,0))
for y in range((oy//st)*st,oy+int(im.height/sc)+1,st):
  Y=(y-oy)*sc;d.line([(0,Y),(im.width,Y)],fill=(255,0,0) if y%(st*5)==0 else (255,150,150),width=1);d.text((2,Y+2),str(y),fill=(255,0,0))
im.save(sys.argv[2])
