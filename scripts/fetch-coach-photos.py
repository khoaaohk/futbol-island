#!/usr/bin/env python3
"""Coach cards (Sep 28 2026): Wikipedia infobox data + riso portrait masks for the 50 coach cards.

Coaches are listed under the "coach" role in lib/town/positionPlayers.json. For each one this script:
  1. reads the English Wikipedia article (wikitext) through the API, batched, and pulls the manager
     infobox fields (managerclubsN / manageryearsN) -> --out/coach-infobox.json, used to check
     lib/town/playerCareers.json coach entries by hand;
  2. takes the article's lead image (pageimages) and its Commons licence (imageinfo + extmetadata);
     only CC0 / public domain / CC BY / CC BY-SA files are used (the house rule in
     docs/player-photos/SOURCES.md); a file hosted only on en.wikipedia is non-free and skipped;
  3. crops a 4:5 head-and-shoulders portrait on the detected face (YuNet, as the player batches) and
     prints it as the two riso masks (public/players/<slug>-ink.webp / -tone.webp), then writes the
     entry to lib/town/playerPhotos.coaches.json with the same fields as the player manifests.

Coach rule (differs from players): a touchline, training, press or portrait photo is fine, because a
coach works in a suit or tracksuit. Statues, murals and group photos without one clear face are not.

Politeness: one runner, the shared lock-file throttle in the temp dir (the same file the photo batches
use), one request every 8 s to any Wikimedia host; 429 / 5xx back off 30 s, doubling. Responses are cached
by sha1(url) in --cache. Generic User-Agent, no personal information.
usage: python3 scripts/fetch-coach-photos.py [--dry] [--only "Name,Name"]
"""
import argparse
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAYERS = os.path.join(ROOT, 'lib/town/positionPlayers.json')
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.coaches.json')
THROTTLE_FILE = os.path.join(tempfile.gettempdir(), 'futbol-wikimedia-throttle.lock')
UA = 'FutbolIsland/1.0'
GAP = 8.0
# Card name -> Wikipedia title (the card name is used when it is not listed).
TITLES = {
    'Luis Enrique': 'Luis Enrique (footballer)', 'Luis de la Fuente': 'Luis de la Fuente (footballer, born 1961)',
    'Zinedine Zidane (coach)': 'Zinedine Zidane', 'Vincent Kompany (coach)': 'Vincent Kompany',
    'Johan Cruyff (coach)': 'Johan Cruyff', 'Alex Ferguson': 'Alex Ferguson', 'Ruben Amorim': 'Ruben Amorim',
    'Rúben Amorim': 'Ruben Amorim', 'Mário Zagallo': 'Mário Zagallo', 'Pere Romeu': 'Pere Romeu',
}


def slot():
    with open(THROTTLE_FILE, 'a+') as fh:
        fcntl.flock(fh, fcntl.LOCK_EX)
        fh.seek(0)
        try:
            last = float(fh.read().strip() or 0)
        except ValueError:
            last = 0.0
        wait = last + GAP - time.time()
        if wait > 0:
            time.sleep(wait)
        fh.seek(0)
        fh.truncate()
        fh.write(repr(time.time()))
        fh.flush()
        fcntl.flock(fh, fcntl.LOCK_UN)


class Net:
    def __init__(self, cache):
        self.cache = cache
        self.requests = 0
        os.makedirs(cache, exist_ok=True)

    def get(self, url, binary=False):
        path = os.path.join(self.cache, hashlib.sha1(url.encode()).hexdigest() + ('.bin' if binary else '.txt'))
        if os.path.exists(path):
            data = open(path, 'rb').read()
            return None if data == b'__404__' else data if binary else data.decode('utf-8', 'replace')
        host = urllib.parse.urlparse(url).netloc
        assert re.search(r'(^|\.)(wikipedia|wikimedia)\.org$', host), host
        delay = 30.0
        for _ in range(6):
            slot()
            self.requests += 1
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                    data = r.read()
                open(path, 'wb').write(data)
                return data if binary else data.decode('utf-8', 'replace')
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    open(path, 'wb').write(b'__404__')
                    return None
                if e.code == 429 or e.code >= 500:
                    print(f'   http {e.code}, backing off {delay:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(delay)
                    delay = min(delay * 2, 600)
                    continue
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(delay)
                delay = min(delay * 2, 600)
        raise SystemExit('network kept failing: stopped (nothing half-written)')

    def api(self, host, **params):
        params['format'] = 'json'
        t = self.get(f'https://{host}/w/api.php?' + urllib.parse.urlencode(params))
        return json.loads(t) if t else {}


def strip_markup(s):
    s = re.sub(r'<ref[^>]*/>|<ref[^>]*>.*?</ref>', '', s, flags=re.S)
    s = re.sub(r'\{\{(?:flagicon|flag)[^}]*\}\}', '', s)
    s = re.sub(r'\{\{nowrap\|([^}]*)\}\}', r'\1', s)
    s = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\{\{[^}]*\}\}', '', s)
    s = re.sub(r"'''?|<[^>]+>|&nbsp;", ' ', s)
    return re.sub(r'\s+', ' ', s).strip(' ,')


def infobox_fields(text):
    out = {}
    for m in re.finditer(r'^\s*\|\s*(manager(?:clubs|years)\d+)\s*=\s*(.*)$', text, re.M):
        out[m.group(1)] = strip_markup(m.group(2))
    rows = []
    i = 1
    while f'managerclubs{i}' in out or f'manageryears{i}' in out:
        rows.append({'years': out.get(f'manageryears{i}', ''), 'team': out.get(f'managerclubs{i}', '')})
        i += 1
    return rows


def save(man):
    tmp = MANIFEST + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(man.items())), fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    os.replace(tmp, MANIFEST)


def main():
    sp = os.path.join(tempfile.gettempdir(), 'futbol-coach-photos')
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(sp, 'cache'))
    ap.add_argument('--models', default=os.path.join(sp, 'models'))
    ap.add_argument('--out', default=sp)
    ap.add_argument('--dry', action='store_true', help='data + audit only: write no masks / manifest')
    ap.add_argument('--only', default='')
    args = ap.parse_args()
    os.makedirs(os.path.join(args.out, 'crops'), exist_ok=True)
    groups = json.load(open(PLAYERS, encoding='utf-8'))
    coach = groups.get('coach') or {}
    names = coach.get('current', []) + coach.get('allTime', [])
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        names = [n for n in names if n in keep]
    net = Net(args.cache)
    title_of = {n: TITLES.get(n, n) for n in names}

    # 1 + 2. wikitext, lead image and description: 10 titles per call (content for many pages is large)
    pages = {}
    titles = list(dict.fromkeys(title_of.values()))
    for i in range(0, len(titles), 10):
        chunk = titles[i:i + 10]
        d = net.api('en.wikipedia.org', action='query', prop='revisions|pageimages|description', rvprop='content',
                    rvslots='main', piprop='name', pilicense='any', redirects=1, titles='|'.join(chunk))
        q = d.get('query', {})
        back = {}
        for n in q.get('normalized', []) + q.get('redirects', []):
            back[n['to']] = back.get(n['from'], n['from'])
        for p in q.get('pages', {}).values():
            orig = p['title']
            while orig in back:
                orig = back[orig]
            text = ((p.get('revisions') or [{}])[0].get('slots', {}).get('main', {}).get('*', ''))
            pages[orig] = {'title': p['title'], 'missing': 'missing' in p, 'desc': p.get('description', ''),
                           'file': p.get('pageimage'), 'managed': infobox_fields(text)}
    files = [pages[t]['file'].replace('_', ' ') for t in titles if t in pages and pages[t].get('file')]
    info = {}
    for i in range(0, len(files), 40):
        d = net.api('commons.wikimedia.org', action='query', titles='|'.join('File:' + f for f in files[i:i + 40]),
                    prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=960,
                    iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal')
        for p in d.get('query', {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [None])[0]
            if ii:
                info[p['title'][5:]] = ii
    audit = {}
    for n in names:
        p = pages.get(title_of[n], {})
        f = (p.get('file') or '').replace('_', ' ')
        ii = info.get(f)
        em = (ii or {}).get('extmetadata', {})
        val = lambda k: strip_markup(em.get(k, {}).get('value', ''))
        audit[n] = {'title': p.get('title'), 'desc': p.get('desc'), 'managed': p.get('managed', []), 'file': f,
                    'license': val('LicenseShortName') if ii else ('non-free (local)' if f else ''),
                    'artist': val('Artist'), 'licenseUrl': val('LicenseUrl'), 'date': val('DateTimeOriginal')[:10],
                    'descriptionurl': (ii or {}).get('descriptionurl', ''), 'thumb': (ii or {}).get('thumburl', '')}
    json.dump(audit, open(os.path.join(args.out, 'coach-infobox.json'), 'w'), ensure_ascii=False, indent=1)
    print('infobox data for', len(audit), 'coaches; requests so far', net.requests, flush=True)
    if args.dry:
        return

    # 3. riso masks from the lead photo (free licences only)
    spec = importlib.util.spec_from_file_location('pp_stars', os.path.join(HERE, 'fetch-player-photos-stars.py'))
    S = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(S)
    from PIL import Image, ImageOps
    faces = S.Faces(*S.ensure_models(args.models))
    man = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    for n in names:
        a = audit[n]
        if n in man:
            continue
        why = None
        if not a['file']:
            why = 'no lead image'
        elif not a['thumb']:
            why = 'lead image is non-free (hosted on en.wikipedia only)'
        elif not S.license_ok(a['license']):
            why = f'licence not accepted ({a["license"]})'
        if why:
            print(f'{n}: skipped, {why}', flush=True)
            continue
        raw = net.get(a['thumb'], binary=True)
        if not raw:
            print(f'{n}: skipped, download failed', flush=True)
            continue
        img = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
        found, _ = faces.detect(img)
        found = sorted(found, key=lambda f: -float(f[2]) * float(f[3]))
        if not found:
            print(f'{n}: skipped, no face found', flush=True)
            continue
        if len(found) > 1 and float(found[1][2]) > 0.6 * float(found[0][2]):
            print(f'{n}: skipped, more than one large face', flush=True)
            continue
        crop = S.portrait_crop(img, found[0])
        slug = S.slugify(n)
        crop.save(os.path.join(args.out, 'crops', slug + '.jpg'), quality=90)
        ink, tone = S.riso(crop)
        S.save_mask(ink, os.path.join(ROOT, 'public/players', f'{slug}-ink.webp'))
        S.save_mask(tone, os.path.join(ROOT, 'public/players', f'{slug}-tone.webp'))
        man[n] = {'slug': slug, 'article': a['title'], 'file': a['descriptionurl'], 'artist': a['artist'] or 'Unknown',
                  'license': a['license'], 'licenseUrl': a['licenseUrl'], 'date': a['date'], 'source': 'wikimedia/infobox'}
        print(f'{n}: portrait from {a["file"]} ({a["license"]}, face {float(found[0][2]):.0f}px)', flush=True)
        save(man)          # after every portrait: a stopped run (rate limit) keeps what it made
    save(man)
    print('requests', net.requests, 'portraits', len(man), 'of', len(names))


if __name__ == '__main__':
    main()
