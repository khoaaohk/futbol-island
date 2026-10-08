#!/usr/bin/env python3
"""Pack each player's two riso masks into one file (see scripts/player_masks.py for the layout).

  python3 scripts/pack-player-masks.py                 # pack every <slug>-ink/-tone pair in public/players
  python3 scripts/pack-player-masks.py --check         # verify packed files against their pairs; exit 1 on a mismatch
  python3 scripts/pack-player-masks.py --remove-singles  # after packing, delete the separate files
                                                       # (kept for one release, Oct 7 2026: tabs opened before the deploy
                                                       # still ask for <slug>-ink.webp / -tone.webp)

The photo pipelines already write packed files through save_mask(); run this after anything that still writes pairs.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

import player_masks as PM  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', default=PM.OUT_DIR)
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--remove-singles', action='store_true')
    args = ap.parse_args()
    bad, packed, before, after = [], 0, 0, 0
    for slug in PM.pairs(args.dir):
        ink, tone = (np.asarray(Image.open(PM.single_path(args.dir, slug, l)).getchannel('A'), np.uint8) for l in PM.LAYERS)
        for l, a in (('ink', ink), ('tone', tone)):
            if a.shape != (PM.H, PM.W):
                bad.append(f'{slug}-{l}: {a.shape[1]}x{a.shape[0]}')
            elif not PM.edge_ok(a):
                print(f'warning: {slug}-{l} has ink within {PM.EDGE}px of its left/right edge (seam margin)')
        if args.check:
            if not PM.has_masks(args.dir, slug) or not (np.array_equal(PM.read_layer(args.dir, slug, 'ink'), ink)
                                                         and np.array_equal(PM.read_layer(args.dir, slug, 'tone'), tone)):
                bad.append(f'{slug}: packed file missing or different from its pair')
            continue
        PM.write_pair(args.dir, slug, ink, tone)
        assert np.array_equal(PM.read_layer(args.dir, slug, 'ink'), ink) and np.array_equal(PM.read_layer(args.dir, slug, 'tone'), tone)
        packed += 1
        before += sum(os.path.getsize(PM.single_path(args.dir, slug, l)) for l in PM.LAYERS)
        after += os.path.getsize(PM.packed_path(args.dir, slug))
        if args.remove_singles:
            for l in PM.LAYERS:
                os.remove(PM.single_path(args.dir, slug, l))
    if bad:
        print('\n'.join(bad))
        sys.exit(1)
    if args.check:
        print(f'ok: {len(PM.pairs(args.dir))} pairs match their packed files')
    else:
        print(f'packed {packed} players: {before:,} B in {2 * packed} files -> {after:,} B in {packed} files')


if __name__ == '__main__':
    main()
