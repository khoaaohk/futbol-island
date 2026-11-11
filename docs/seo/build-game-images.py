#!/usr/bin/env python3
"""Pictures for the arcade games' search pages (lib/site/games.ts, Nov 10 2026).
Reads the builders' screenshots in docs/arcade-aaa/shots and writes public/games/*.webp (page pictures) and *-og.jpg
(1200x630 share pictures: the screenshot on the site's paper background with the game's name). Needs Pillow only.
usage: python3 docs/seo/build-game-images.py [name-prefix ...]   (from the repo root; re-run after a screenshot is re-shot;
with prefixes, e.g. `air-futbol`, only those games are rebuilt; the hub picture is always rebuilt)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
SRC, OUT = 'docs/arcade-aaa/shots', 'public/games'
PAPER, TINT, INK, SOFT, GOLD = '#fbf7ee', '#ecefdf', '#14221d', '#5b675f', '#e9c16b'
BRUSH = 'public/stories/films/assets/IslandBrush-Regular.ttf'
SANS = next(p for p in ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if os.path.exists(p))
# (source shot, output name) per game: first = main picture; og = (file, name, line)
GAMES = [
 ('kit-rush-soccer-swipe-game', ['kitrush-phone', 'kitrush-results'], ['kit-rush-soccer-swipe-game', 'kit-rush-results-football-fact'], 'Kit Rush', 'Free soccer swipe game'),
 ('squad-snake-soccer-snake-game', ['snake-phone', 'snake-fullsquad'], ['squad-snake-soccer-snake-game', 'squad-snake-full-squad-4-3-3-formation'], 'Squad Snake', 'Free soccer snake game'),
 ('breakaway-run-soccer-runner-game', ['runner-phone', 'runner-strike'], ['breakaway-run-soccer-runner-game', 'breakaway-run-goal'], 'Breakaway Run', 'Free soccer runner game'),
 ('futbol-tennis-soccer-tennis-game', ['tennis-phone', 'tennis-point'], ['futbol-tennis-soccer-tennis-game', 'futbol-tennis-point'], 'Futbol Tennis', 'Free soccer tennis game'),
 ('futbol-pinball-soccer-pinball-game', ['pinball-phone', 'pinball-goal'], ['futbol-pinball-soccer-pinball-game', 'futbol-pinball-goal'], 'Futbol Pinball', 'Free soccer pinball game'),
 ('air-futbol-air-hockey-soccer-game', ['airhockey-phone', 'airhockey-goal'], ['air-futbol-air-hockey-soccer-game', 'air-futbol-goal-bank-shot'], 'Air Futbol', 'Free air hockey soccer game'),
 ('pass-puzzles-soccer-passing-puzzle-game', ['puzzle-phone', 'puzzle-endless'], ['pass-puzzles-soccer-passing-puzzle', 'pass-puzzles-endless-run'], 'Pass Puzzles', 'Free soccer passing puzzle game'),
]
def shot(n): return Image.open(f'{SRC}/{n}.png').convert('RGB')
def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255); im = im.convert('RGBA'); im.putalpha(m); return im
def fit(d, text, path, size, width):
    while True:
        f = ImageFont.truetype(path, size)
        if d.textlength(text, font=f) <= width or size <= 24: return f
        size -= 2
def words(d, name, line, x, y, width):
    f = fit(d, name, BRUSH, 92, width); d.text((x, y), name, font=f, fill=INK)
    g = fit(d, line, SANS, 40, width); d.text((x, y + 118), line, font=g, fill=INK)
    h = ImageFont.truetype(SANS, 26); d.text((x, y + 176), 'No ads · no sign-up · futbolisland.app', font=h, fill=SOFT)
    d.rounded_rectangle([x, y + 228, x + 150, y + 238], 5, fill=GOLD)
def og(file, shots, name, line):
    c = Image.new('RGB', (1200, 630), PAPER); d = ImageDraw.Draw(c); ims = [shot(s) for s in shots]
    if ims[0].width > ims[0].height:  # a landscape game: words on top, the picture under them
        d.rounded_rectangle([40, 250, 1160, 700], 36, fill=TINT)
        f = fit(d, name, BRUSH, 84, 560); d.text((56, 30), name, font=f, fill=INK)
        d.text((58, 140), line, font=ImageFont.truetype(SANS, 38), fill=INK); d.text((58, 192), 'No ads · no sign-up · futbolisland.app', font=ImageFont.truetype(SANS, 24), fill=SOFT)
        a = rounded(ims[0].resize((800, 370), Image.LANCZOS), 22); c.paste(a, (340, 244), a)
        b = rounded(ims[1].resize((440, 203), Image.LANCZOS), 16); c.paste(b, (700, 28), b)
    else:
        d.rounded_rectangle([600, 40, 1160, 700], 36, fill=TINT)
        for i, im in enumerate(ims[:2]):
            a = rounded(im.resize((250, min(541, round(im.height * 250 / im.width))), Image.LANCZOS), 22); c.paste(a, (624 + i * 262, 64 + i * 20), a)  # 541 for a 390x844 shot; shorter shots keep their shape
        words(d, name, line, 60, 180, 500)
    c.save(f'{OUT}/{file}-og.jpg', quality=72, optimize=True, progressive=True)
ONLY = sys.argv[1:]  # e.g. `air-futbol hub`: rebuild only the games whose file name starts with one of these (and the hub picture)
for file, shots, outs, name, line in GAMES:
    if ONLY and not any(file.startswith(o) for o in ONLY): continue
    for s, o in zip(shots, outs):
        im = shot(s); w = 960 if im.width > im.height else 480
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(f'{OUT}/{o}.webp', quality=74, method=6)
    og(file, shots, name, line)
# the hub: three games side by side
c = Image.new('RGB', (1200, 630), PAPER); d = ImageDraw.Draw(c); d.rounded_rectangle([560, 40, 1170, 700], 36, fill=TINT)
for i, s in enumerate(['kitrush-phone', 'snake-fullsquad', 'puzzle-phone']):
    a = rounded(shot(s).resize((180, 390), Image.LANCZOS), 18); c.paste(a, (582 + i * 192, 120 + (i % 2) * 24), a)
words(d, 'Free soccer games', 'Seven browser games for kids', 50, 180, 480)
c.save(f'{OUT}/free-soccer-games-for-kids-og.jpg', quality=72, optimize=True, progressive=True)
tot = 0
for f in sorted(os.listdir(OUT)):
    n = os.path.getsize(f'{OUT}/{f}'); tot += n; im = Image.open(f'{OUT}/{f}'); print(f'{f} {im.width}x{im.height} {n // 1024} KB')
print('total', tot // 1024, 'KB')
