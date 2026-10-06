#!/usr/bin/env python3
"""Coach cards, deep search (Oct 6 2026), for coaches whose en lead image was missing or not free.

scripts/fetch-coach-photos.py only tried the en Wikipedia lead image. This one, per coach:
  1. Wikidata item (from en pageprops): P18 image, P373 Commons category, sitelinks;
  2. the lead image (pageimages, pilicense=free) of every Wikipedia edition with an article;
  3. the Commons category tree (P373 + name guesses, one level of subcategories; statues, graves,
     murals, signatures, stamps are skipped by name);
  4. Commons depicts (haswbstatement:P180=<Q>) and a full-text "<name>" file search;
  5. imageinfo for every candidate (50 titles per call): CC0 / PD / CC BY / CC BY-SA only.
`gather` writes <out>/<slug>/cands.json and a numbered contact sheet of 330 px thumbs (top N), which a
person reviews. `apply --pick "Name=File title[#face]"` fetches the 960 px thumb, crops the chosen face
with the project's portrait_crop + riso + save_mask (scripts/fetch-player-photos-stars.py), reports the
SFace similarity to the reference face (P18 / en lead) and writes lib/town/playerPhotos.coaches.json.

Coach rule (as fetch-coach-photos.py): touchline, training, press or portrait photos are fine (suits OK).

Politeness: one runner. At most 1 request per 1.5 s across all Wikimedia hosts, through the shared
lock file in the temp dir (also used by the other photo scripts). Everything is cached by sha1(url).
Retry-After is honoured; a 429 backs off >= 5 min and doubles the gap; 3 429s inside an hour stop the
run. User-Agent "FutbolIsland/1.0" only.
usage: python3 scripts/fetch-coach-photos-deep.py gather --only "A,B" [--sheet 16]
       python3 scripts/fetch-coach-photos-deep.py apply --pick "Bill Shankly=File:X.jpg#0"
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
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.coaches.json')
THROTTLE_FILE = os.path.join(tempfile.gettempdir(), 'futbol-wikimedia-throttle.lock')
UA = 'FutbolIsland/1.0'
# other-language leads: the editions most likely to hold a different free photo of these coaches
LANGS = tuple(x for x in os.environ.get('COACH_LANGS', '').split(',') if x)
TITLES = {'Mário Zagallo': 'Mário Zagallo', 'Telê Santana': 'Telê Santana', 'Alf Ramsey': 'Alf Ramsey',
          'Bob Paisley': 'Bob Paisley', 'Bill Shankly': 'Bill Shankly'}
SKIP_CAT = re.compile(r'statue|sculpt|grave|tomb|mural|signature|stamp|coin|bust|memorial|plaque|monument|'
                      r'street|banner|graffiti|caricature|drawing|painting|book|portrait art|museum', re.I)
SKIP_FILE = re.compile(r'\.(svg|gif|ogg|ogv|webm|pdf|tif?f|mp3|wav|flac)$|statue|grave|tomb|mural|signature|'
                       r'stamp|plaque|memorial|bust|sculpt|graffiti|banner|logo|crest|map', re.I)
LICENSE_OK = re.compile(r'^(cc0|public domain|pd|pdm|cc[- ]by(-sa)?([- ][0-9.]+.*)?|cc by(-sa)? [0-9.].*)$', re.I)
LICENSE_BAD = re.compile(r'\bnc\b|\bnd\b|non-?commercial|no ?deriv|fair use|non-free', re.I)


class Stop(Exception):
    pass


class Net:
    def __init__(self, cache, gap=1.5, offline=False):
        self.cache, self.gap, self.requests, self.offline = cache, gap, 0, offline
        os.makedirs(cache, exist_ok=True)
        self.log429 = os.path.join(cache, '429.json')      # persists across runs: the 3-per-hour rule
        self.hits429 = [t for t in (json.load(open(self.log429)) if os.path.exists(self.log429) else [])
                        if time.time() - t < 3600]
        if self.hits429:
            self.gap = max(self.gap, 3.0)                    # rate halved after a 429 this hour
        if len(self.hits429) >= 3 and not offline:
            raise Stop('three 429s within the last hour: not starting (use --offline for cached files only)')

    def slot(self):
        with open(THROTTLE_FILE, 'a+') as fh:
            fcntl.flock(fh, fcntl.LOCK_EX)
            fh.seek(0)
            try:
                last = float(fh.read().strip() or 0)
            except ValueError:
                last = 0.0
            wait = last + self.gap - time.time()
            if wait > 0:
                time.sleep(wait)
            fh.seek(0)
            fh.truncate()
            fh.write(repr(time.time()))
            fh.flush()
            fcntl.flock(fh, fcntl.LOCK_UN)

    def get(self, url, binary=False):
        path = os.path.join(self.cache, hashlib.sha1(url.encode()).hexdigest() + ('.bin' if binary else '.txt'))
        if os.path.exists(path):
            data = open(path, 'rb').read()
            return None if data == b'__404__' else data if binary else data.decode('utf-8', 'replace')
        if self.offline:
            return None
        host = urllib.parse.urlparse(url).netloc
        assert re.search(r'(^|\.)(wikipedia|wikimedia|wikidata)\.org$', host), host
        for attempt in range(4):
            self.slot()
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
                if e.code == 429:
                    now = time.time()
                    self.hits429 = [t for t in self.hits429 if now - t < 3600] + [now]
                    json.dump(self.hits429, open(self.log429, 'w'))
                    print(f'   429 on {host} ({len(self.hits429)} this hour)', file=sys.stderr, flush=True)
                    if len(self.hits429) >= 3:
                        raise Stop('three 429s within an hour: stopping as the house rule says')
                    ra = e.headers.get('Retry-After')
                    wait = max(300.0, float(ra) if ra and ra.isdigit() else 0.0)
                    self.gap *= 2
                    time.sleep(wait)
                    continue
                if e.code >= 500:
                    time.sleep(30 * (attempt + 1))
                    continue
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(30 * (attempt + 1))
        return None

    def api(self, host, **params):
        params['format'] = 'json'
        t = self.get(f'https://{host}/w/api.php?' + urllib.parse.urlencode(params))
        return json.loads(t) if t else {}


def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', s.replace('&nbsp;', ' ')).strip()


def license_ok(short):
    short = (short or '').strip()
    return bool(short) and not LICENSE_BAD.search(short) and bool(LICENSE_OK.match(short))


def slugify(name):
    import unicodedata
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def cat_files(net, cat, out, depth=1, budget=None):
    budget = budget if budget is not None else [12]
    if budget[0] <= 0:
        return
    budget[0] -= 1
    d = net.api('commons.wikimedia.org', action='query', list='categorymembers', cmtitle=cat, cmlimit=500,
                cmtype='file|subcat')
    for m in d.get('query', {}).get('categorymembers', []):
        t = m['title']
        if t.startswith('File:'):
            if not SKIP_FILE.search(t):
                out.setdefault(t, set()).add('cat:' + cat[9:])
        elif t.startswith('Category:') and depth > 0 and not SKIP_CAT.search(t):
            cat_files(net, t, out, depth - 1, budget)


def gather_one(net, name, args):
    title = TITLES.get(name, name)
    d = net.api('en.wikipedia.org', action='query', prop='pageprops|pageimages', ppprop='wikibase_item',
                piprop='name', redirects=1, titles=title)
    page = next(iter(d.get('query', {}).get('pages', {}).values()), {})
    qid = page.get('pageprops', {}).get('wikibase_item')
    en_lead = page.get('pageimage')
    cands = {}
    if en_lead:
        cands.setdefault('File:' + en_lead.replace('_', ' '), set()).add('en-lead')
    p18, p373, sitelinks = [], None, {}
    if qid:
        w = net.api('www.wikidata.org', action='wbgetentities', ids=qid, props='claims|sitelinks')
        ent = w.get('entities', {}).get(qid, {})
        cl = ent.get('claims', {})
        p18 = [c['mainsnak'].get('datavalue', {}).get('value') for c in cl.get('P18', [])]
        p373 = next((c['mainsnak'].get('datavalue', {}).get('value') for c in cl.get('P373', [])), None)
        sitelinks = {k[:-4]: v['title'] for k, v in ent.get('sitelinks', {}).items()
                     if k.endswith('wiki') and k not in ('commonswiki', 'specieswiki') and '_' not in k[:-4]}
        for f in p18:
            if f:
                cands.setdefault('File:' + f, set()).add('P18')
    # other-language lead images (free only)
    for lang, t in sorted(sitelinks.items()):
        if lang not in LANGS:
            continue
        dd = net.api(f'{lang}.wikipedia.org', action='query', prop='pageimages', piprop='name', pilicense='free',
                     titles=t)
        for p in dd.get('query', {}).get('pages', {}).values():
            if p.get('pageimage'):
                cands.setdefault('File:' + p['pageimage'].replace('_', ' '), set()).add('lead:' + lang)
    # category tree
    cats = [f'Category:{p373}'] if p373 else []
    cats.append(f'Category:{name}')
    for c in dict.fromkeys(cats):
        cat_files(net, c, cands, depth=1, budget=[14])
    # depicts + full-text
    searches = []
    if qid:
        searches.append(f'haswbstatement:P180={qid}')
    searches.append(f'"{name}" filetype:bitmap')
    for s in searches:
        dd = net.api('commons.wikimedia.org', action='query', list='search', srnamespace=6, srlimit=100, srsearch=s)
        for r in dd.get('query', {}).get('search', []):
            if not SKIP_FILE.search(r['title']):
                cands.setdefault(r['title'], set()).add('depicts' if s.startswith('has') else 'search')
    # imageinfo in batches of 50
    titles = list(cands)
    info = {}
    for i in range(0, len(titles), 20):   # 20: long (Cyrillic) titles overflow the URL at 50
        dd = net.api('commons.wikimedia.org', action='query', titles='|'.join(titles[i:i + 20]), prop='imageinfo',
                     iiprop='extmetadata|url|size', iiurlwidth=330,
                     iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|ImageDescription|Credit')
        norm = {n['to']: n['from'] for n in dd.get('query', {}).get('normalized', [])}
        for p in dd.get('query', {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [None])[0]
            if ii:
                info[norm.get(p['title'], p['title'])] = ii
    rows = []
    for t in titles:
        ii = info.get(t)
        if not ii:
            continue
        em = ii.get('extmetadata', {})
        v = lambda k: strip_html(em.get(k, {}).get('value', ''))
        lic = v('LicenseShortName')
        if not license_ok(lic):
            continue
        if min(ii.get('width', 0), ii.get('height', 0)) < 250:
            continue
        via = sorted(cands[t])
        score = 3 * ('P18' in via) + 2 * ('depicts' in via) + 2 * any(x.startswith('lead') for x in via) + \
            1 * any(x.startswith('cat:') for x in via) + 1 * ('en-lead' in via)
        rows.append({'title': t, 'via': via, 'license': lic, 'licenseUrl': v('LicenseUrl'), 'artist': v('Artist'),
                     'date': v('DateTimeOriginal')[:10], 'desc': v('ImageDescription')[:200],
                     'w': ii.get('width'), 'h': ii.get('height'), 'thumb': ii.get('thumburl'),
                     'page': ii.get('descriptionurl'), 'score': score})
    rows.sort(key=lambda r: -r['score'])
    return {'name': name, 'qid': qid, 'p18': p18, 'p373': p373, 'en_lead': en_lead, 'n_cands': len(cands),
            'rows': rows}


def sheet(net, res, path, n):
    from PIL import Image, ImageDraw
    rows = res['rows'][:n]
    cell = 260
    cols = 4
    im = Image.new('RGB', (cols * cell, ((len(rows) + cols - 1) // cols or 1) * (cell + 18)), 'white')
    dr = ImageDraw.Draw(im)
    for i, r in enumerate(rows):
        raw = net.get(r['thumb'], binary=True) if r['thumb'] else None
        x, y = (i % cols) * cell, (i // cols) * (cell + 18)
        dr.text((x + 4, y + cell + 2), f'{i} {r["license"][:14]} {r["date"][:4]}', fill='black')
        if not raw:
            continue
        try:
            t = Image.open(BytesIO(raw)).convert('RGB')
        except Exception:
            continue
        t.thumbnail((cell - 6, cell - 6))
        im.paste(t, (x + 3, y + 3))
    im.save(path, quality=85)


def stars():
    spec = importlib.util.spec_from_file_location('pp_stars', os.path.join(HERE, 'fetch-player-photos-stars.py'))
    S = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(S)
    return S


def save(man):
    tmp = MANIFEST + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(man.items())), fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    os.replace(tmp, MANIFEST)


def main():
    sp = os.path.join(tempfile.gettempdir(), 'futbol-coach-photos')
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['gather', 'apply'])
    ap.add_argument('--cache', default=os.path.join(sp, 'cache'))
    ap.add_argument('--models', default=os.path.join(sp, 'models'))
    ap.add_argument('--out', default=os.path.join(sp, 'deep'))
    ap.add_argument('--only', default='')
    ap.add_argument('--sheet', type=int, default=16)
    ap.add_argument('--pick', action='append', default=[], help='"Name=File:Title.jpg[#faceIndex]"')
    ap.add_argument('--write', action='store_true', help='apply: write masks + manifest (else preview crops only)')
    ap.add_argument('--offline', action='store_true', help='no network: cached responses and thumbnails only')
    args = ap.parse_args()
    net = Net(args.cache, offline=args.offline)
    os.makedirs(args.out, exist_ok=True)
    try:
        if args.mode == 'gather':
            for name in [n.strip() for n in args.only.split(',') if n.strip()]:
                res = gather_one(net, name, args)
                d = os.path.join(args.out, slugify(name))
                os.makedirs(d, exist_ok=True)
                json.dump(res, open(os.path.join(d, 'cands.json'), 'w'), ensure_ascii=False, indent=1)
                sheet(net, res, os.path.join(d, 'sheet.jpg'), args.sheet)
                print(f'{name}: {res["qid"]} P373={res["p373"]} candidates {res["n_cands"]}, free {len(res["rows"])}; '
                      f'requests {net.requests}', flush=True)
            return
        S = stars()
        from PIL import Image, ImageOps
        faces = S.Faces(*S.ensure_models(args.models))
        man = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
        for pk in args.pick:
            name, spec = pk.split('=', 1)
            ftitle, _, fidx = spec.partition('#')
            res = json.load(open(os.path.join(args.out, slugify(name), 'cands.json')))
            row = next(r for r in res['rows'] if r['title'] == ftitle)
            thumb = re.sub(r'/330px-', '/960px-', row['thumb']) if row['w'] > 960 else row['thumb']
            raw = net.get(thumb, binary=True) or net.get(row['thumb'], binary=True)   # 960 px, else the cached 330 px
            if not raw:
                print(f'{name}: {ftitle} not downloaded (offline / failed)')
                continue
            img = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
            found, bgr = faces.detect(img)
            found = sorted(found, key=lambda f: -float(f[2]) * float(f[3]))
            if not found:
                print(f'{name}: no face found in {ftitle}')
                continue
            f = found[int(fidx or 0)]
            ref_sim = None
            ref = (res['p18'] or [None])[0] or res['en_lead']
            ref_row = next((r for r in res['rows'] if r['title'].replace('_', ' ') == 'File:' + (ref or '').replace('_', ' ')), None)
            if ref_row and ref_row['title'] != ftitle:
                rraw = net.get(ref_row['thumb'], binary=True)
            if ref_row and ref_row['title'] != ftitle and rraw:
                rimg = ImageOps.exif_transpose(Image.open(BytesIO(rraw))).convert('RGB')
                rf, rbgr = faces.detect(rimg)
                if rf:
                    rf = sorted(rf, key=lambda x: -float(x[2]) * float(x[3]))[0]
                    ref_sim = faces.sim(faces.embed(bgr, f), faces.embed(rbgr, rf))
            print(f'   source {img.size[0]}x{img.size[1]}, upscale x{S.W * S.FACE_FRAC / float(f[2]):.2f}')
            crop = S.portrait_crop(img, f)
            slug = S.slugify(name)
            crop.save(os.path.join(args.out, slug, 'crop.jpg'), quality=90)
            print(f'{name}: face {float(f[2]):.0f}px of {len(found)}; SFace vs ref {ref_sim}; '
                  f'{row["license"]} / {row["artist"]} / {row["date"]}', flush=True)
            if not args.write:
                continue
            ink, tone = S.riso(crop)
            S.save_mask(ink, os.path.join(ROOT, 'public/players', f'{slug}-ink.webp'))
            S.save_mask(tone, os.path.join(ROOT, 'public/players', f'{slug}-tone.webp'))
            S.riso_cell(slug).save(os.path.join(args.out, slug, 'riso.png'))
            man[name] = {'slug': slug, 'article': TITLES.get(name, name), 'file': row['page'],
                         'artist': row['artist'] or 'Unknown', 'license': row['license'],
                         'licenseUrl': row['licenseUrl'], 'date': row['date'], 'source': 'wikimedia/deep'}
            save(man)
    except Stop as e:
        print('STOPPED:', e, flush=True)
    print('requests', net.requests)


if __name__ == '__main__':
    main()
