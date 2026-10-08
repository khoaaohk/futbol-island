#!/usr/bin/env python3
"""Pack the vending ball pictures into one lossless WebP atlas (Oct 7 2026).

Island boot used to request one PNG per ball on the machines' first pages (8 requests, ~125 KB). Now it requests one atlas:

  public/vending/products/balls-<sha256(bytes)[:12]>.webp   every public/vending/products/ball-<style>.png, lossless
  lib/graphics/vendingBallAtlas.json                       {src, w, h, rects: {<style>: [x, y, w, h]}}

Each picture keeps its exact pixels and size. It sits in its own cell with a 2 px gutter that repeats its edge pixels, so a
canvas drawImage() of a source rectangle filters at the edges exactly as it did drawing the whole PNG (clamp to edge).
lib/graphics/vendingProductArt.ts reads the JSON: the world atlas and the close-up face draw from the atlas, and an <img>
(BallPicture) gets the cell cropped once into a blob URL.

Re-run after scripts/capture-vending-products.cjs (which still writes the ball-<style>.png sources):
  python3 scripts/pack-vending-atlas.py            # writes the atlas + JSON, removes older balls-*.webp
  python3 scripts/pack-vending-atlas.py --check    # exit 1 if the atlas is missing, stale or not pixel-exact
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'public/vending/products')
JSON = os.path.join(ROOT, 'lib/graphics/vendingBallAtlas.json')
GUTTER = 2
MAX_W = 512


def sources():
    return sorted((m[1], os.path.join(DIR, f)) for f in os.listdir(DIR) if (m := re.fullmatch(r'ball-([a-z]+)\.png', f)))


def build():
    imgs = [(style, np.asarray(Image.open(p).convert('RGBA'))) for style, p in sources()]
    # shelf packing in name order: rows of cells (picture + gutter on every side), at most MAX_W wide
    rects, x, y, row_h, width = {}, 0, 0, 0, 0
    for style, a in imgs:
        h, w = a.shape[:2]
        cw, ch = w + 2 * GUTTER, h + 2 * GUTTER
        if x and x + cw > MAX_W:
            x, y, row_h = 0, y + row_h, 0
        rects[style] = [x + GUTTER, y + GUTTER, w, h]
        x += cw
        row_h = max(row_h, ch)
        width = max(width, x)
    height = y + row_h
    atlas = np.zeros((height, width, 4), np.uint8)
    for style, a in imgs:
        rx, ry, w, h = rects[style]
        cell = np.pad(a, ((GUTTER, GUTTER), (GUTTER, GUTTER), (0, 0)), mode='edge')   # edge-repeat gutter
        atlas[ry - GUTTER:ry + h + GUTTER, rx - GUTTER:rx + w + GUTTER] = cell
    buf = io.BytesIO()
    Image.fromarray(atlas, 'RGBA').save(buf, 'WEBP', lossless=True, quality=100, method=6, exact=True)
    data = buf.getvalue()
    name = f'balls-{hashlib.sha256(data).hexdigest()[:12]}.webp'
    return data, {'src': f'/vending/products/{name}', 'w': width, 'h': height, 'rects': rects}, imgs


def verify(meta, imgs):
    p = os.path.join(ROOT, 'public' + meta['src'])
    if not os.path.exists(p):
        return [f'missing {p}']
    a = np.asarray(Image.open(p).convert('RGBA'))
    bad = []
    for style, img in imgs:
        if style not in meta['rects']:
            bad.append(f'{style}: not in the atlas')
            continue
        x, y, w, h = meta['rects'][style]
        if not np.array_equal(a[y:y + h, x:x + w], img):
            bad.append(f'{style}: pixels differ from ball-{style}.png')
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    args = ap.parse_args()
    data, meta, imgs = build()
    if args.check:
        cur = json.load(open(JSON))
        bad = verify(cur, imgs)
        if sorted(cur['rects']) != sorted(meta['rects']):
            bad.append('atlas styles differ from the ball-<style>.png files; re-run scripts/pack-vending-atlas.py')
        print('\n'.join(bad) or f'ok: {len(imgs)} ball pictures, pixel-exact in {cur["src"]}')
        sys.exit(1 if bad else 0)
    with open(os.path.join(ROOT, 'public' + meta['src']), 'wb') as f:
        f.write(data)
    with open(JSON, 'w') as f:
        json.dump(meta, f, indent=1)
        f.write('\n')
    for f in os.listdir(DIR):
        if re.fullmatch(r'balls-[0-9a-f]{12}\.webp', f) and '/vending/products/' + f != meta['src']:
            os.remove(os.path.join(DIR, f))
    bad = verify(meta, imgs)
    assert not bad, bad
    before = sum(os.path.getsize(p) for _, p in sources())
    print(f'{meta["src"]}: {len(imgs)} pictures, {meta["w"]}x{meta["h"]}, {len(data):,} B (the PNGs: {before:,} B)')


if __name__ == '__main__':
    main()
