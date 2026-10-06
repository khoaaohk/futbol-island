import sys;from PIL import Image
# usage: sheet.py out.jpg H img...
out,H=sys.argv[1],int(sys.argv[2]);ims=[Image.open(f).convert('RGB') for f in sys.argv[3:]]
ims=[im.resize((max(1,int(im.width*H/im.height)),H)) for im in ims]
s=Image.new('RGB',(sum(i.width for i in ims),H),'white');x=0
for i in ims: s.paste(i,(x,0));x+=i.width
s.save(out)
