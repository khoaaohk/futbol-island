# Library "Games" section picture: four of today's arcade phone screenshots in a row on the site's sage, 1440x900 (16:10).
import sys,os
from PIL import Image,ImageDraw,ImageFilter
S='/Users/khoado/Desktop/Warp Claude Projects/futbol-island/.claude/worktrees/layout-wt/public/games/shots/'
W,H=1440,900;SAGE=(236,239,223);INK=(20,34,29)
names=sys.argv[2:] or ['kitrush-1','ballblaster-1','pinball-1','tennis-3']
c=Image.new('RGB',(W,H),SAGE)
ph=650;pw=round(ph*480/1039);bz=10;R=36;gap=(W-4*(pw+2*bz))//5
sh=Image.new('L',(W,H),0);d=ImageDraw.Draw(sh)
xs=[gap+i*(pw+2*bz+gap) for i in range(4)];y0=(H-ph-2*bz)//2
for x in xs:d.rounded_rectangle((x+6,y0+16,x+pw+2*bz+6,y0+ph+2*bz+16),R,fill=90)
c.paste(Image.new('RGB',(W,H),(196,203,180)),(0,0),sh.filter(ImageFilter.GaussianBlur(14)))
for x,n in zip(xs,names):
    ImageDraw.Draw(c).rounded_rectangle((x,y0,x+pw+2*bz,y0+ph+2*bz),R,fill=INK)
    im=Image.open(S+n+'.webp').convert('RGB').resize((pw,ph),Image.LANCZOS)
    m=Image.new('L',(pw,ph),0);ImageDraw.Draw(m).rounded_rectangle((0,0,pw-1,ph-1),R-bz,fill=255);c.paste(im,(x+bz,y0+bz),m)
out=sys.argv[1];c.save(out+'.png')
for q in (88,84,80,76,72):
    c.save(out+'.webp','WEBP',quality=q,method=6)
    if os.path.getsize(out+'.webp')<=140*1024:print(out,q,os.path.getsize(out+'.webp'),pw,ph);break
