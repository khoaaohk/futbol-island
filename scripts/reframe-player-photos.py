#!/usr/bin/env python3
"""Re-frame card portraits offline: rebuild a player's riso masks
(both halves of the packed public/players/<slug>.webp) from the photo the manifests
already name, with a per-player framing override. No network: the source
image and its Commons imageinfo must already be in the shared response cache
the fetch scripts write (--cache, keyed by sha1(url)).

Why: the fetch batches frame on the largest face Apple Vision finds. That is
wrong for group shots (the largest face is a team-mate) and some older masks
were cut from a different crop than the manifest photo. FRAMING below records
each hand-checked fix so it can be re-run.

  face  - index into the faces Vision finds, largest first (default 0), or a
          box {'x','y','w','h'} in 0..1 image units (top-left origin)
  frac  - face width / crop width (default FACE_FRAC 0.42; larger = closer)
  cy    - face centre height in the crop, from the top (default 0.40)

  python3 scripts/reframe-player-photos.py --cache <wm-cache> [--only "A,B"]
      [--out <dir>]   # preview masks somewhere else instead of public/players
"""
import argparse
import glob
import hashlib
import importlib.util
import json
import os
import re
import tempfile
import urllib.parse

import numpy as np
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
_spec = importlib.util.spec_from_file_location('pp_legends', os.path.join(HERE, 'fetch-player-photos.py'))
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)
MANIFESTS = ['playerPhotos.json', 'playerPhotos.stars.json', 'playerPhotos.futsal.json', 'playerPhotos.women.json']

# Hand-checked framing fixes (Sep 24 2026 card review). Each one was compared
# against the source photo and the old mask; see the review sheets.
FRAMING = {
    # old mask did not match the manifest photo (another crop / another face)
    'Sepp Maier': {},
    'Fabio Cannavaro': {},
    'Luís Figo': {},
    'Alexander Isak': {},
    'Eder Lima': {},
    'Falcão': {},
    'Andrés Iniesta': {},            # old crop sat on the trophy, not the face
    # face cut off, too close or too far, or off-centre
    'Ibrahima Konaté': {},
    'Ousmane Dembélé': {},
    'Viktor Gyökeres': {},
    'Marco van Basten': {},
    'Edwin van der Sar': {},
    'Dani Carvajal': {},
    'Alejandro Balde': {},
    'Alessandro Bastoni': {},
    'Cristian Romero': {},
    'Khvicha Kvaratskhelia': {},
    'Garrincha': {},
    'João Neves': {},
    'Jeremie Frimpong': {},
    'Ruud van Nistelrooy': {},
    'Daniel Passarella': {'face': 1},    # the largest face is a fan below him
    'Cole Palmer': {'frac': 0.5},        # keeps a team-mate's head out of frame
    'Tiago Marinho': {},
    'Mostafa Nazari': {},
    'Antonio Pérez': {},
    'Mellado': {},
    'Adolfo': {},
    'Sergei Sergeev': {},
    'Sergio Lozano': {},
    'Jordi Torras': {},
    'Cirilo': {},
    'João Victor': {},
    'Gabriel': {},
    'Luis Amado': {},
}


def manifests():
    out = {}
    for f in MANIFESTS:
        p = os.path.join(ROOT, 'lib/town', f)
        if os.path.exists(p):
            out.update(json.load(open(p, encoding='utf-8')))
    return out


def _walk(o, acc):
    if isinstance(o, dict):
        if 'descriptionurl' in o and 'url' in o:
            acc.append(o)
        for v in o.values():
            _walk(v, acc)
    elif isinstance(o, list):
        for v in o:
            _walk(v, acc)


def cached_imageinfo(cache):
    info = {}
    for p in glob.glob(os.path.join(cache, '*.txt')):
        try:
            d = json.load(open(p, encoding='utf-8'))
        except Exception:
            continue
        acc = []
        _walk(d, acc)
        for ii in acc:
            info.setdefault(urllib.parse.unquote(ii['descriptionurl']).replace(' ', '_'), ii)
    return info


def cached_source(cache, ii):
    """The largest cached rendition of the file (original or a thumb)."""
    urls = [L.upload_url(ii['url'])] + [L.upload_url(ii.get('thumburl'), w) for w in (1920, 1280, 960, 600, 500, 330)]
    best = None
    for u in urls:
        if not u:
            continue
        p = os.path.join(cache, hashlib.sha1(u.encode()).hexdigest() + '.bin')
        if not os.path.exists(p) or open(p, 'rb').read(7) == b'__404__':
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        except Exception:
            continue
        if best is None or im.size[0] > best.size[0]:
            best = im
    return best


def crop(img, face, frac, cy):
    iw, ih = img.size
    fx, fy, fw, fh = face['x'] * iw, face['y'] * ih, face['w'] * iw, face['h'] * ih
    cw = fw / frac
    ch = cw * 1.25
    left, top = fx + fw / 2 - cw / 2, fy + fh / 2 - cy * ch
    pad = int(max(0, -left, -top, left + cw - iw, top + ch - ih)) + 2
    if pad > 2:   # blurred edge fill, as in fetch-player-photos.py portrait_crop
        a = np.pad(np.asarray(img), ((pad, pad), (pad, pad), (0, 0)), mode='edge')
        big = Image.fromarray(a).filter(ImageFilter.GaussianBlur(max(6, pad // 6)))
        big.paste(img, (pad, pad))
        img, left, top = big, left + pad, top + pad
    return img.crop((round(left), round(top), round(left + cw), round(top + ch))).resize((L.W, L.H), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', required=True, help='shared response cache written by the fetch scripts')
    ap.add_argument('--only', default='')
    ap.add_argument('--out', default=L.OUT_DIR)
    args = ap.parse_args()
    names = [n.strip() for n in args.only.split(',') if n.strip()] or list(FRAMING)
    man, info = manifests(), cached_imageinfo(args.cache)
    vis = L.Vision(args.cache)
    os.makedirs(args.out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='reframe-')
    for name in names:
        e, fx = man.get(name), FRAMING.get(name, {})
        if not e:
            print(f'{name}: no photo in the manifests, skipped')
            continue
        ii = info.get(urllib.parse.unquote(e['file']).replace(' ', '_'))
        img = ii and cached_source(args.cache, ii)
        if img is None:
            print(f'{name}: source not in the cache, skipped')
            continue
        face = fx.get('face', 0)
        if not isinstance(face, dict):
            p = os.path.join(tmp, e['slug'] + '.jpg')
            img.save(p, quality=95)
            faces = sorted(((vis.analyse([p])[p] or {}).get('faces') or []), key=lambda f: f['w'] * f['h'], reverse=True)
            if len(faces) <= face:
                print(f'{name}: face {face} not found, skipped')
                continue
            face = faces[face]
        # the crop is 320 px wide: shrink big sources first (same result, much faster)
        s = min(1.0, 3 * L.W * fx.get('frac', L.FACE_FRAC) / max(1.0, face['w'] * img.size[0]))
        if s < 1:
            img = img.resize((round(img.size[0] * s), round(img.size[1] * s)), Image.LANCZOS)
        ink, tone = L.riso(crop(img, face, fx.get('frac', L.FACE_FRAC), fx.get('cy', 0.40)))
        for layer, a in (('ink', ink), ('tone', tone)):
            # writes that half of the packed <out>/<slug>.webp, atomically (scripts/player_masks.py)
            L.save_mask(a, os.path.join(args.out, f"{e['slug']}-{layer}.webp"))
        print(f"{name}: reframed ({img.size[0]}x{img.size[1]}, face {face['w'] * img.size[0]:.0f}px)")


if __name__ == '__main__':
    main()
