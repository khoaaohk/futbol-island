# Section picture from lesson frames, any panel grid at 1440x900 on the site's paper, rounded corners. Crops are never upscaled.
# usage: python3 -I compose3.py out.png "x,y,w,h=frame.jpg:cx,cy,cropW" ...
import sys
from PIL import Image, ImageDraw
W,H,R=1440,900,22;PAPER=(251,247,238)
out,*specs=sys.argv[1:];c=Image.new('RGB',(W,H),PAPER)
for sp in specs:
    box,src=sp.split('=');x,y,w,h=[int(v) for v in box.split(',')];p,n=src.split(':');cx,cy,cw=[float(v) for v in n.split(',')];ch=cw*h/w
    assert cw>=w,'would upscale '+sp
    im=Image.open(p).convert('RGB').crop((round(cx-cw/2),round(cy-ch/2),round(cx+cw/2),round(cy+ch/2))).resize((w,h),Image.LANCZOS)
    m=Image.new('L',(w,h),0);ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),R,fill=255);c.paste(im,(x,y),m)
c.save(out);print(out)
