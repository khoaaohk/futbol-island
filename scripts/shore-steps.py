#!/usr/bin/env python3
"""Shore colour steps (Nov 25 2026): samples a gfx-budget shot along its shore probe line (<shot>.probe.json, written by
scripts/gfx-budget.cjs GFX_VIEWS=swimshore) and prints the colour every metre from dry sand to open sea plus the largest step between
neighbouring samples from the waterline to 6 m out (0.5 m apart; sRGB 0-255, the largest channel difference, each sample a 5x5 px mean so foam specks and caustic
lines do not count). Usage: python3 scripts/shore-steps.py shot.png [more.png ...]"""
import json,sys
from PIL import Image
for f in sys.argv[1:]:
    im=Image.open(f).convert('RGB');d=json.load(open(f[:-4]+'.probe.json'));k=d['dpr'];W,H=im.size;rows=[]
    for p in d['px']:
        x,y=int(p['x']*k),int(p['y']*k)
        if x<3 or y<3 or x>=W-3 or y>=H-3:continue
        px=[im.getpixel((x+i,y+j)) for i in range(-2,3) for j in range(-2,3)];rows.append((p['o'],tuple(sum(c[n] for c in px)//25 for n in range(3))))
    steps=[(max(abs(a[1][n]-b[1][n]) for n in range(3)),b[0]) for a,b in zip(rows,rows[1:])]
    m=[r for r in rows if r[0]==int(r[0]) and 0<=r[0]<=20]
    big=max([t for t in steps if -.5<=t[1]<=6] or [(0,0)])# the join: the waterline to 6 m out (the foam line, further up the sand, and sea life further out are not the join)
    print(f.split('/')[-1]+': max step %d at %+.1f m (waterline to +6 m); '%big+' '.join('%d:%02x%02x%02x'%(o,*c) for o,c in rows if o==int(o) and -2<=o<=20)+'; per-metre steps 0-20 m: '+' '.join(str(max(abs(a[1][n]-b[1][n]) for n in range(3))) for a,b in zip(m,m[1:])))
