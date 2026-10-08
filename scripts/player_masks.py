"""Packed player riso masks (Oct 7 2026): one file per card portrait instead of two.

  public/players/<slug>.webp   640x400 lossless WebP, alpha only (RGB 0):
                               x   0..319  the ink mask   (dark ink: 45deg halftone + solid darkest tones)
                               x 320..639  the tone mask  (midtone ink: 15deg halftone)

Each half is exactly the old 320x400 `<slug>-ink.webp` / `<slug>-tone.webp`, same 16 alpha levels, so a card shows the
same pixels from one request instead of two. The cards pick a half with `mask-size:200% 100%` and `mask-position:0 0`
(ink) or `100% 0` (tone) on a box the size of the old `contain` rectangle (components/MiniCard.module.css,
PlayerArt.module.css, PlayerThumb.module.css). Every mask leaves at least 16 empty columns at its left and right edges, so
filtering at the seam between the halves never mixes ink into tone (checked here and by tests/image-packing.cjs).

The photo pipelines call this through their save_mask(): a path ending in `-ink.webp` / `-tone.webp` writes that half of
the packed file (atomically) instead of a separate file. Readers use read_layer(); rejects use remove().

Standalone, after any pipeline that still wrote separate files:
  python3 scripts/pack-player-masks.py            # pack every <slug>-ink/-tone pair in public/players
  python3 scripts/pack-player-masks.py --check    # verify every packed file against its pair, change nothing
"""
import os
import re

import numpy as np
from PIL import Image

W, H = 320, 400
LAYERS = ('ink', 'tone')
EDGE = 16   # empty columns kept at each side of each half (filtering margin at the seam)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public/players')
_MASK_PATH = re.compile(r'^(?P<slug>.+)-(?P<layer>ink|tone)\.webp$')


def packed_path(out_dir, slug):
    return os.path.join(out_dir, f'{slug}.webp')


def single_path(out_dir, slug, layer):
    return os.path.join(out_dir, f'{slug}-{layer}.webp')


def split_mask_path(path):
    """`.../<slug>-ink.webp` -> (dir, slug, 'ink'); anything else -> None."""
    m = _MASK_PATH.match(os.path.basename(path))
    return (os.path.dirname(path), m['slug'], m['layer']) if m else None


def _save(alpha2, path):
    """alpha2: H x 2W uint8. Lossless, alpha only, written atomically (the dev server never sees half a file)."""
    rgba = np.zeros((H, 2 * W, 4), np.uint8)
    rgba[..., 3] = alpha2
    tmp = path + '.tmp'
    Image.fromarray(rgba, 'RGBA').save(tmp, 'WEBP', lossless=True, quality=100, method=6, exact=False)
    os.replace(tmp, path)


def _load_packed(out_dir, slug):
    p = packed_path(out_dir, slug)
    if not os.path.exists(p):
        return None
    a = np.asarray(Image.open(p).getchannel('A'), np.uint8)
    assert a.shape == (H, 2 * W), f'{p}: {a.shape[1]}x{a.shape[0]}, expected {2 * W}x{H}'
    return a.copy()


def _half(layer):
    return slice(0, W) if layer == 'ink' else slice(W, 2 * W)


def write_layer(out_dir, slug, layer, alpha8):
    """Write one half (uint8 H x W alpha) of <slug>.webp, keeping the other half."""
    assert alpha8.shape == (H, W) and alpha8.dtype == np.uint8, alpha8.shape
    a = _load_packed(out_dir, slug)
    if a is None:
        a = np.zeros((H, 2 * W), np.uint8)
    a[:, _half(layer)] = alpha8
    _save(a, packed_path(out_dir, slug))


def write_pair(out_dir, slug, ink8, tone8):
    a = np.zeros((H, 2 * W), np.uint8)
    a[:, :W], a[:, W:] = ink8, tone8
    _save(a, packed_path(out_dir, slug))


def save_mask_alpha(alpha8, path):
    """For the pipelines' save_mask(): a `<slug>-ink|tone.webp` path writes into the packed file; any other path is
    written as a single 320x400 mask, as before."""
    hit = split_mask_path(path)
    if hit:
        write_layer(hit[0], hit[1], hit[2], alpha8)
        return
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., 3] = alpha8
    Image.fromarray(rgba, 'RGBA').save(path + '.tmp', 'WEBP', lossless=True, quality=100, method=6, exact=False)
    os.replace(path + '.tmp', path)


def read_layer(out_dir, slug, layer):
    """One mask as uint8 H x W alpha: from the packed file, else from a legacy single file."""
    a = _load_packed(out_dir, slug)
    if a is not None:
        return a[:, _half(layer)].copy()
    return np.asarray(Image.open(single_path(out_dir, slug, layer)).getchannel('A'), np.uint8)


def has_masks(out_dir, slug):
    return os.path.exists(packed_path(out_dir, slug))


def remove(out_dir, slug):
    """Delete a player's masks (packed and any legacy singles)."""
    for p in (packed_path(out_dir, slug), *(single_path(out_dir, slug, l) for l in LAYERS)):
        if os.path.exists(p):
            os.remove(p)


def edge_ok(alpha8):
    return not alpha8[:, :EDGE].any() and not alpha8[:, W - EDGE:].any()


def pairs(out_dir=OUT_DIR):
    """Slugs that have both legacy single files."""
    names = set(os.listdir(out_dir))
    return sorted(m['slug'] for f in names if (m := _MASK_PATH.match(f)) and m['layer'] == 'ink'
                  and f'{m["slug"]}-tone.webp' in names)
