#!/usr/bin/env python3
"""Backup photo sources for roster players that the Wikimedia batches left
without a photo (lib/town/cardRoster.json minus every playerPhotos*.json).

Source: Openverse (https://api.openverse.org), Wikimedia results excluded
(those were already judged by the Wikimedia batches). Every candidate must:

  * license   - CC0 / PDM / CC BY / CC BY-SA on Openverse AND confirmed on the
                image's own source page (e.g. the Flickr photo page's rel=license
                link); anything NC / ND / unconfirmed is refused.
  * identity  - every token of the player's name in the title / tags, none of the
                fan / mural / face-paint words, AND the detected face matches the
                player's Wikipedia infobox face (OpenCV SFace, stricter than the
                Commons batches). No infobox face -> no backup photo.
  * era       - the source page's "taken on" date inside the player's playing years.
  * in kit    - same checks as the stars batch: no suit / ceremony words, Apple
                Vision sees no suit, and a match / training cue or a sports scene.
  * big face  - same YuNet crop rules as the stars batch (face 42% of a 4:5 crop,
                <= 2x upscale, sharp, frontal, nobody else in the window).

An accepted photo is written into the manifest of the batch that owns the
player (stars / women / legends / futsal), with the same fields as the
Wikimedia entries plus "source" (e.g. "openverse/flickr") and "sourceName"
(e.g. "Flickr"), so the card-back credit can name the right site.

Network: run it under the shared polite throttle; responses cached by
sha1(url) in --cache; a fixed generic User-Agent, no personal information.
Needs opencv-python-headless, numpy, pillow (same venv as the stars batch).
"""
import argparse
import html
import importlib.util
import json
import os
import re
import sys
import tempfile
import time
import urllib.parse
from io import BytesIO

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def _load(fn, name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, fn))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


S = _load('fetch-player-photos-stars.py', 'pp_stars')
LEG = _load('fetch-player-photos.py', 'pp_legends')
FUT = _load('fetch-player-photos-futsal.py', 'pp_futsal')
WOM = _load('fetch-player-photos-women.py', 'pp_women')

ROSTER = os.path.join(ROOT, 'lib/town/cardRoster.json')
MANIFESTS = {
    'legends': os.path.join(ROOT, 'lib/town/playerPhotos.json'),
    'stars': os.path.join(ROOT, 'lib/town/playerPhotos.stars.json'),
    'futsal': os.path.join(ROOT, 'lib/town/playerPhotos.futsal.json'),
    'women': os.path.join(ROOT, 'lib/town/playerPhotos.women.json'),
}
OPENVERSE = 'https://api.openverse.org/v1/images/'
LICENSES = {'cc0': 'CC0 1.0', 'pdm': 'Public Domain Mark 1.0', 'by': 'CC BY', 'by-sa': 'CC BY-SA'}
ID_MIN = 0.45            # stricter than the Commons batches (0.40): titles off Commons are less reliable
SOURCE_NAMES = {'flickr': 'Flickr'}
# press / fan words the shared NEG list misses (reviewed Sep 24 2026: "Alan Shearer and me!",
# "Zlatan Ibrahimović beim Interview")
EXTRA_NEG = ['interview', ' and me', ' with me', 'meet', 'fan ']


class Net(S.Net):
    HOSTS = S.Net.HOSTS + ('pt.wikipedia.org', 'es.wikipedia.org', 'api.openverse.org', 'www.flickr.com', 'live.staticflickr.com',
                           'farm1.staticflickr.com', 'farm2.staticflickr.com', 'farm3.staticflickr.com',
                           'farm4.staticflickr.com', 'farm5.staticflickr.com', 'farm6.staticflickr.com',
                           'farm8.staticflickr.com', 'farm9.staticflickr.com', 'farm66.staticflickr.com')


def owner_of(name, data):
    if name in WOM.PLAYERS:
        return 'women'
    fut = cur = allt = False
    for role, v in data.items():
        for k in ('current', 'allTime'):
            if name in v.get(k, []):
                if role in FUT.FUTSAL_ROLES:
                    fut = True
                elif k == 'current':
                    cur = True
                else:
                    allt = True
    return 'futsal' if fut else 'stars' if cur else 'legends' if allt else None


def window_of(name, owner):
    if owner == 'women':
        return WOM.PLAYERS[name][0]
    if owner == 'futsal':
        return FUT.CAREER.get(name, (2015, 2026))
    if owner == 'legends':
        return LEG.CAREER.get(name, (LEG.CURRENT_FROM, LEG.THIS_YEAR))
    return (2018, 2026)


def resolve(net, name, owner):
    """The player's Wikipedia summary (for the reference face), per batch rules."""
    if owner == 'women':
        return WOM.resolve(net, name)
    if owner == 'legends':
        return LEG.resolve(net, name, False)[0]
    if owner == 'futsal':
        s = LEG.resolve(net, name, True)[0]
        if s:
            return s
        for lang in ('pt', 'es'):
            for t in (name, f'{name} (futsal)', f'{name} (jogador de futsal)', f'{name} (futbolista)'):
                x = FUT.wiki_summary(net, lang, t)
                if x and x.get('type') == 'standard' and 'futsal' in S.norm((x.get('description') or '') + ' ' +
                                                                             (x.get('extract') or '')):
                    return x
        return None
    return S.resolve(net, name)


def missing_players():
    data = json.load(open(S.PLAYERS_JSON, encoding='utf-8'))
    have = set()
    for p in MANIFESTS.values():
        if os.path.exists(p):
            have |= set(json.load(open(p, encoding='utf-8')))
    roster = json.load(open(ROSTER, encoding='utf-8'))['players']
    return [(n, owner_of(n, data)) for n in roster if n not in have]


def license_on_page(page):
    """(short, url) of the licence the source page itself states, or (None, None)."""
    m = re.search(r'<a[^>]+href="(https?://creativecommons\.org/(?:licenses|publicdomain)/[a-z0-9./-]+?)(?:deed\.[a-z]+)?"'
                  r'[^>]*rel="license[^"]*"[^>]*title="([^"]+)"', page) or \
        re.search(r'<a[^>]+rel="license[^"]*"[^>]+href="(https?://creativecommons\.org/(?:licenses|publicdomain)/'
                  r'[a-z0-9./-]+?)(?:deed\.[a-z]+)?"[^>]*title="([^"]+)"', page)
    if not m:
        return None, None
    url, title = m.group(1), html.unescape(m.group(2)).strip()
    path = urllib.parse.urlparse(url).path.lower()
    if re.search(r'/(by-nc|by-nd|by-nc-sa|by-nc-nd)/', path):
        return None, None
    if not re.search(r'/(licenses/(by|by-sa)/\d\.\d|publicdomain/(zero/1\.0|mark/1\.0))/?', path):
        return None, None
    return title, url.rstrip('/') + '/'


def flickr_page_info(page):
    get = lambda pat: (re.search(pat, page, re.S) or [None, ''])[1]
    title = html.unescape(get(r'<meta property="og:title" content="([^"]*)"'))
    desc = html.unescape(get(r'<meta property="og:description" content="([^"]*)"'))
    taken = get(r'Taken on\s*([A-Z][a-z]+ \d{1,2}, \d{4})')
    date = None
    if taken:
        try:
            date = time.strftime('%Y-%m-%d', time.strptime(taken, '%B %d, %Y'))
        except ValueError:
            date = None
    owner = html.unescape(get(r'<a[^>]+class="owner-name[^"]*"[^>]*>([^<]+)</a>')).strip()
    return title, desc, date, owner


def name_tokens_ok(name, aliases, text, tags):
    t = S.norm(text)
    squashed = {re.sub(r'[^a-z0-9]', '', S.norm(g)) for g in tags}
    for n in [name] + aliases:
        toks = S.tokens(n)
        if toks and (S.has_all(toks, t) or ''.join(toks) in squashed or
                     re.sub(r'[^a-z0-9]', '', S.norm(n)) in squashed):
            return True
    return False


def openverse_candidates(net, name, aliases):
    out = {}
    for q in dict.fromkeys([name] + aliases[:1]):
        params = dict(q=q, license='cc0,pdm,by,by-sa', excluded_source='wikimedia', page_size=20, mature='false')
        d = net.json(OPENVERSE + '?' + urllib.parse.urlencode(params)) or {}
        for r in d.get('results', []):
            out.setdefault(r['id'], r)
    return list(out.values())


def main():
    sp = os.path.join(tempfile.gettempdir(), 'futbol-player-photos-backup')
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(sp, 'cache'))
    ap.add_argument('--models', default=os.path.join(sp, 'models'))
    ap.add_argument('--review', default='', help='dir for source crops of accepted photos')
    ap.add_argument('--only', default='')
    ap.add_argument('--debug', action='store_true')
    ap.add_argument('--tries', type=int, default=6)
    args = ap.parse_args()

    net = Net(args.cache)
    faces = S.Faces(*S.ensure_models(args.models))
    scene = S.Scene(args.cache)
    tmp = tempfile.mkdtemp(prefix='backup-thumbs-')
    todo = missing_players()
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        todo = [t for t in todo if t[0] in keep]
    if args.review:
        os.makedirs(args.review, exist_ok=True)
    report = {'accepted': [], 'dropped': {}}

    for i, (name, owner) in enumerate(todo):
        tag = f'[{i + 1}/{len(todo)}] {name} ({owner})'

        def drop(reason):
            report['dropped'][name] = reason
            print(f'{tag}: DROP {reason}', flush=True)

        if owner is None:
            drop('not in positionPlayers.json')
            continue
        aliases = S.ALIASES.get(name, []) + (WOM.PLAYERS[name][2] if owner == 'women' else [])
        s = resolve(net, name, owner)
        if not s:
            drop('no Wikipedia article (no reference face)')
            continue
        infobox = S.commons_file((s.get('originalimage') or s.get('thumbnail') or {}).get('source'))
        refs = S.reference(net, faces, name, infobox, {})
        if not refs:
            drop('no single-face Wikipedia infobox photo to verify identity against')
            continue
        y0, y1 = window_of(name, owner)
        results = openverse_candidates(net, name, aliases)
        cands, why = [], {}
        for r in results:
            if r.get('license') not in LICENSES:
                why['license'] = why.get('license', 0) + 1
                continue
            tags = [t.get('name', '') for t in r.get('tags') or []]
            if not name_tokens_ok(name, aliases, r.get('title') or '', tags):
                why['unnamed'] = why.get('unnamed', 0) + 1
                continue
            if (r.get('width') or 0) < 500 or (r.get('height') or 0) < 500:
                why['small'] = why.get('small', 0) + 1
                continue
            cands.append(r)
        if args.debug:
            print(f'   openverse {len(results)} results, {len(cands)} named; rejects {why}', flush=True)
        chosen = None
        for r in cands[:args.tries * 2]:
            if r.get('source') != 'flickr':
                if args.debug:
                    print(f'   - {r["title"][:60]} [{r.get("source")}]: source page licence parser only for Flickr',
                          flush=True)
                continue
            page = net.get(r['foreign_landing_url'])
            if not page:
                continue
            lic, lic_url = license_on_page(page)
            if not lic or not S.license_ok(lic.replace('Public Domain Mark', 'public domain')
                                           .replace('CC0 1.0', 'CC0')):
                if args.debug:
                    print(f'   - {r["title"][:60]}: licence not confirmed on source page ({lic})', flush=True)
                continue
            title, desc, date, owner_name = flickr_page_info(page)
            tags = [t.get('name', '') for t in r.get('tags') or []]
            text = S.norm(' | '.join([r.get('title') or '', title, desc, ' '.join(tags)]))
            subject = S.norm((r.get('title') or '') + ' | ' + title + ' | ' + desc)
            if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in S.ID_NEG):
                if args.debug:
                    print(f'   - {r["title"][:60]}: fan/art/other-subject words', flush=True)
                continue
            y = int(date[:4]) if date else None
            if y is None or not (y0 <= y <= y1):
                if args.debug:
                    print(f'   - {r["title"][:60]}: date {date} outside {y0}-{y1}', flush=True)
                continue
            pos = sum(w in text for w in S.POS_WORDS)
            neg = sum(w in text for w in S.NEG_WORDS)
            if any(w in text for w in EXTRA_NEG):
                neg += 2
            if (neg >= 2 and pos < 2) or (neg >= 1 and pos == 0):
                if args.debug:
                    print(f'   - {r["title"][:60]}: off-pitch words', flush=True)
                continue
            raw = net.get(r['url'], binary=True)
            if not raw:
                continue
            try:
                img = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
            except Exception:
                continue
            c = {'file': r['id'], 'width': img.size[0], 'url': r['url'], 'thumburl': r['url'], 'text': text}
            orig_fetch = S.fetch_image
            S.fetch_image = lambda _net, _c, _w: img
            saved_min = S.ID_MIN
            S.ID_MIN = ID_MIN
            try:
                ok, res = S.evaluate(net, faces, scene, c, refs, tmp, print)
            finally:
                S.fetch_image = orig_fetch
                S.ID_MIN = saved_min
            if not ok:
                if args.debug:
                    print(f'   - {r["title"][:60]} ({date}): {res}', flush=True)
                continue
            chosen = (r, res, lic, lic_url, date, owner_name or r.get('creator') or 'Unknown')
            break
        if not chosen:
            drop('no Openverse photo passing licence + identity + in-kit + big-face checks'
                 if cands else f'no free Openverse photo naming the player ({len(results)} results)')
            continue
        r, res, lic, lic_url, date, artist = chosen
        slug = S.slugify(name)
        crop = S.portrait_crop(res['img'], res['face'])
        if args.review:
            crop.save(os.path.join(args.review, slug + '.jpg'), quality=90)
        ink, tone = S.riso(crop)
        S.save_mask(ink, os.path.join(S.OUT_DIR, f'{slug}-ink.webp'))
        S.save_mask(tone, os.path.join(S.OUT_DIR, f'{slug}-tone.webp'))
        path = MANIFESTS[owner]
        man = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        src = r.get('source') or 'openverse'
        man[name] = {
            'slug': slug, 'article': s['title'], 'file': r['foreign_landing_url'], 'artist': artist,
            'license': lic, 'licenseUrl': lic_url, 'date': date,
            'source': f'openverse/{src}', 'sourceName': SOURCE_NAMES.get(src, src.title()),
        }
        tmpf = path + '.tmp'
        with open(tmpf, 'w', encoding='utf-8') as f:
            json.dump(man, f, ensure_ascii=False, indent=2)
            f.write('\n')
        os.replace(tmpf, path)
        report['accepted'].append(name)
        print(f'{tag}: OK {r["title"][:70]} ({date}, {lic}, {r["foreign_landing_url"]}, face {res["fw"]:.0f}px, '
              f'id {res["sim"]:.2f}, sharp {res["sharp"]:.0f})', flush=True)

    print('\nrequests', net.requests)
    print('accepted', len(report['accepted']), report['accepted'])
    for n, why in report['dropped'].items():
        print('dropped', n, '-', why)


if __name__ == '__main__':
    main()
