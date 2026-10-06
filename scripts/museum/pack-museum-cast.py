"""Packs the museum cast stills (test-results/museum-cast/*.png, from scripts/museum/render-museum-cast.cjs) into ONE sprite
sheet: public/museum/cast.webp (2048x1024, cwebp q82 + alpha) and lib/museum/museumCast.json (pixel rects + the bottom-centre
anchor). Each still is scaled to 196 px tall; shelf packing, 4 px gutters. Usage: python3 scripts/museum/pack-museum-cast.py"""
import json, subprocess
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]; RAW = ROOT / 'test-results/museum-cast'
W, H, ROW, GAP = 2048, 1024, 196, 4
files = sorted(p for p in RAW.glob('*.png'))
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0)); frames = {}; x = y = 0
for f in sorted(files, key=lambda p: -Image.open(p).width / Image.open(p).height):
    im = Image.open(f).convert('RGBA'); w = round(im.width * ROW / im.height); im = im.resize((w, ROW), Image.LANCZOS)
    if x + w > W: x, y = 0, y + ROW + GAP
    assert y + ROW <= H, 'sheet full'
    sheet.paste(im, (x, y)); frames[f.stem] = {'x': x, 'y': y, 'w': w, 'h': ROW}; x += w + GAP
tmp = RAW / 'sheet.png'; sheet.save(tmp)
out = ROOT / 'public/museum/cast.webp'; out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['cwebp', '-quiet', '-q', '82', '-alpha_q', '90', '-m', '6', str(tmp), '-o', str(out)], check=True)
(ROOT / 'lib/museum/museumCast.json').write_text(json.dumps({'w': W, 'h': H, 'frames': dict(sorted(frames.items()))}, indent=1) + '\n')
print(f'{len(frames)} frames, {out.stat().st_size // 1024} KB')
