#!/usr/bin/env python3
"""Fetch freely licensed Wikimedia Commons photos of the FUTSAL players in
lib/town/positionPlayers.json (roles goleiro / fixo / ala / pivot) -- taken
while they were PLAYING (futsal or national-team kit, in a match / training /
team photo) -- and turn them into riso-print portrait masks for the cards.

Same outputs and riso stage as scripts/fetch-player-photos.py (the football
batch), so the card renders them unchanged:
  public/players/<slug>-ink.webp   dark ink: 45deg halftone + solid darkest tones
  public/players/<slug>-tone.webp  midtone ink: 15deg halftone
  lib/town/playerPhotos.futsal.json  manifest: source file, date, artist, license
Both webp files are ALPHA MASKS (RGB black, alpha = ink coverage), 320x400.

Futsal players mostly have pt / es / it / ru Wikipedia articles rather than
English ones, and many go by one nickname (Edu, Neto, Pito ...), so identity
is resolved through Wikidata, not a bare title lookup:
  1. Wikidata search (futsal-player occupation filter + label/alias search in
     en/pt/es/it/ru); a candidate must be a futsal player (P106 futsal player,
     or a futsal description) whose citizenship / sport country matches the
     country in lib/town/playerAppearance.json, and whose label or an alias
     matches the name. More than one match = ambiguous = skipped. QIDS holds
     hand-verified ids.
  2. The en/pt/es/it/ru Wikipedia summaries of that item must mention futsal;
     their infobox images join the candidates.
  3. Candidates: Wikidata P18, the player's Commons category (P373 or guesses
     such as "Category:<Name> (futsal player)") + name-matching subcategories,
     Commons files whose structured data 'depicts' (P180) the player, and a
     namespace-6 text search (identity checked per file).
  4. Keep only CC0 / PD / CC BY / CC BY-SA files that name or depict the
     player, dated inside the playing career. Score by match/training/team
     words vs ceremony/award/suit words.
  5. Face check: Apple Vision (face box, yaw, scene labels, via a tiny Swift
     helper compiled on first use) AND an OpenCV frontal-face Haar cascade
     must both find the face (so it is clearly visible and turned towards the
     camera); one dominant face only; face >= 68 px wide in the source (4:5
     crop with the face box at 42% of 320 px => <= 2x upscale) and sharp.
  6. PICKS / BLOCK / DROP hold hand-reviewed overrides from the contact sheet.

Usage (needs numpy, pillow, opencv-python-headless<5 -- 5.x drops CascadeClassifier):
  python3 scripts/fetch-player-photos-futsal.py [--cache DIR] [--sheet PNG]
        [--review DIR] [--only "Name,Name"] [--debug]

Network: only Wikipedia / Wikidata / Commons APIs + upload.wikimedia.org,
one request in flight, <= 1 request/s, 600 px thumbs, batched (50) queries, honours Retry-After, backoff on 429/5xx. Responses are cached in --cache.
"""
import argparse
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYERS_JSON = os.path.join(ROOT, 'lib/town/positionPlayers.json')
APPEARANCE_JSON = os.path.join(ROOT, 'lib/town/playerAppearance.json')
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.futsal.json')
OUT_DIR = os.path.join(ROOT, 'public/players')
UA = 'FutbolIslandPhotos/1.0'
FUTSAL_ROLES = ('goleiro', 'fixo', 'ala', 'pivot')
LANGS = ('en', 'pt', 'es', 'it', 'ru')
HOSTS = {f'{l}.wikipedia.org' for l in LANGS} | {'www.wikidata.org', 'commons.wikimedia.org',
                                                  'upload.wikimedia.org'}
W, H = 320, 400
THIS_YEAR = 2026
FUTSAL_PLAYER_Q = 'Q18515558'
COUNTRY_Q = {
    'Portugal': 'Q45', 'Spain': 'Q29', 'Brazil': 'Q155', 'Kazakhstan': 'Q232', 'Italy': 'Q38',
    'Iran': 'Q794', 'Russia': 'Q159', 'Argentina': 'Q414', 'France': 'Q142', 'Ukraine': 'Q212',
}
# Nationality words (en/es/pt/it/ru stems) for Wikidata items with no citizenship claim.
DEMONYM = {
    'Spain': r'spanish|espanol|espanhol|spagnol|испан', 'Portugal': r'portugu|portoghes|португал',
    'Brazil': r'brazil|brasil|бразил', 'Kazakhstan': r'kazakh|kazaj|cazaqu|kazak|казах',
    'Italy': r'italian|italiano|итал', 'Iran': r'iranian|irani|иран', 'Russia': r'russian|ruso|russo|росси|русск',
    'Argentina': r'argentin|аргентин', 'France': r'french|frances|francese|франц',
    'Ukraine': r'ukrain|ucran|ucrain|украин',
}
FUTSAL_WORDS = re.compile(r'futsal|futebol de salao|futbol sala|futbol de salon|calcio a (5|cinque)|'
                          r'calcettist|мини-футбол|футзал|мини-футболист|salonvoetbal', re.I)

# Hand-verified Wikidata ids (name -> Q-id) for names the automatic search
# cannot settle, and names to leave out because the intended player cannot be
# pinned down with confidence.
QIDS = {
    'Miquel Feixas': 'Q125208406',   # Miquel Feixas de Jesús, FC Barcelona futsal goalkeeper (no P27 on Wikidata)
}
SKIP = {
    'Edu': 'ambiguous: the only futsal "Edu" on Wikidata is a Brazilian/Azerbaijani player, not the Spanish goalkeeper',
}

# Playing careers (first, last season year); current players default to
# CURRENT_WINDOW. Photos must be dated inside the window.
CAREER = {
    'Luis Amado': (1994, 2013), 'Stefano Mammarella': (2003, 2026), 'Higuita': (2006, 2026),
    'Guitta': (2005, 2026), 'Paco Sedano': (1998, 2022), 'Mostafa Nazari': (1998, 2015),
    'Sergey Zuev': (1998, 2017), 'Tiago Marinho': (2003, 2021), 'Santiago Elías': (1990, 2012),
    'Gustavo Lobo': (1990, 2012), 'Kike Boned': (1990, 2011), 'Schumacher': (1995, 2016),
    'Gabriel': (1995, 2015), 'Carlos Ortiz': (1998, 2021), 'Aicardo': (1996, 2016), 'Neto': (1998, 2020),
    'Julio García Mera': (1990, 2012), 'Marcio Forte': (1990, 2012), 'Sergei Sergeev': (2003, 2021),
    'Douglas Junior': (2010, 2026), 'Ricardinho': (2003, 2026), 'Falcão': (1994, 2018),
    'Manoel Tobias': (1988, 2012), 'Javi Rodríguez': (1995, 2013), 'Sergio Lozano': (2006, 2026),
    'Daniel Ibañes': (1995, 2013), 'Robinho': (2005, 2026), 'Alex Merlim': (2006, 2026),
    'Miguelín': (2003, 2022), 'Jordi Torras': (2000, 2018), 'Ferrão': (2008, 2026),
    'Vander Carioca': (1995, 2013), 'Wilde': (1996, 2015), 'Lenísio': (1999, 2017),
    'Konstantin Eremenko': (1987, 2009), 'Eder Lima': (2005, 2026), 'Cirilo': (1998, 2017),
    'Joel Queirós': (2000, 2021), 'Fernandão': (2000, 2020), 'Cardinal': (2003, 2026),
}
CURRENT_WINDOW = (2008, THIS_YEAR)
DEBUG = False
FACE_FRAC = 0.42             # face box width / crop width (>= 0.38 required)
FACE_MIN = 68                # px; 320 * FACE_FRAC / FACE_MIN <= 2x upscale
SHARP_MIN = 60.0             # Laplacian variance of the face at 128 px; below = blurry

# Hand-reviewed overrides from the contact sheets.
#   PICKS: name -> exact Commons file title (without "File:") to use.
#   BLOCK: Commons file titles never to use (wrong person, suit, blurry ...).
#   DROP:  name -> reason, players to leave out after review.
PICKS = {}
BLOCK = {
    'Фаренюк Артём Николаевич.jpg',   # post-match interview at a sponsor board (press)
    'Guitta in Ukhta sports complex after meeting with fans.jpg',   # polo shirt at a fan event, not kit
}
DROP = {}

LICENSE_OK = re.compile(
    r'^(cc0(\s*1\.0)?|public\s*domain.*|pd([\s-].*)?|cc[\s-]by([\s-]sa)?[\s-]\d\.\d.*)$', re.I)
LICENSE_BAD = re.compile(r'\b(nc|nd)\b|non-?commercial|no-?deriv|fair\s*use', re.I)

POS_WORDS = ['match', ' vs', ' v ', 'versus', 'training', 'game', ' cup', 'league', 'friendly', 'qualif',
             'national futsal team', 'futsal team', 'national team', 'squad', 'team photo', 'line-up',
             'lineup', 'arena', 'pavilhao', 'pabellon', 'world cup', 'euro 20', 'euro futsal', 'copa ',
             'championship', 'derby', 'supercup', 'super cup', 'supercopa', 'in action', 'warm', 'kit',
             'jersey', 'uefa', 'fifa', 'liga', 'lnfs', 'serie a', 'final', 'playoff', 'goalkeeping',
             'penalty', 'celebrat', 'fc ', ' cf', 'club', 'futsal', 'jogo', 'partido', 'partita', 'selecao',
             'seleccion', 'nazionale', 'sporting', 'benfica', 'barca', 'inter movistar', 'elpozo', 'kairat',
             'magnus', 'corinthians', 'dynamo', 'gazprom', 'sibiryak', 'tyumen', 'mini-football']
NEG_WORDS = ['ceremony', 'award', 'gala', 'press', 'conference', ' suit', 'statue', 'grave', 'museum',
             'visit', 'meeting', 'premiere', 'festival', 'signing', 'autograph', 'coach', 'manager',
             'studio', 'interview', 'mural', 'painting', 'stamp', 'wax', 'reception', 'president',
             'minister', 'wedding', 'charity', 'legends', 'veteran', 'mayor', 'honour', 'honor', 'unveil',
             'book', 'presentation', 'apresentacao', 'presentacion', 'sponsor', 'commercial', 'ambassador',
             'celebrity', 'event', 'concert', 'parliament', 'embassy', 'politic', 'hall of fame',
             'funeral', 'exhibition', 'drawing', 'caricature', 'poster', 'banner', 'fans', 'supporters',
             'tv ', 'television', 'show', 'talk', 'red carpet', 'party', 'launch', 'forum', 'summit',
             'debate', 'birthday', 'selfie', 'palace', 'medal', 'honorary', 'tribute', 'memorial',
             'retire', 'farewell', 'pundit', 'commentator', 'broadcast', 'podcast', 'film', 'movie',
             'photocall', 'fashion', 'music', 'unicef', 'foundation', 'visita', 'entrega', 'recepcao',
             'homenagem', 'homenaje', 'premio', 'premiacao', 'condecora', 'camara', 'assembleia',
             'belem', 'marcelo rebelo', 'bola de ouro', 'gala', 'entrevista']
SUBCAT_NEG = ['statue', 'art', 'signature', 'autograph', 'coach', 'manager', 'popular culture', 'caricature',
              'mural', 'award', 'event', 'legend', 'retire', 'family', 'wax', 'stamp', 'poster', 'grave',
              'honor', 'honour', 'politic', 'business', 'video', 'audio', 'logo', 'coat of arms',
              'monument', 'museum', 'wedding', 'house', 'tomb', 'funeral', 'charity', 'depiction', 'painting',
              'drawing', 'sculpture', 'bust', 'president', 'owner', 'pundit', 'commentat']

SWIFT_SRC = r'''
import Foundation
import Vision
import ImageIO
var out: [String: Any] = [:]
for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { continue }
    let fr = VNDetectFaceRectanglesRequest()
    let cl = VNClassifyImageRequest()
    try? VNImageRequestHandler(cgImage: img, options: [:]).perform([fr, cl])
    var faces: [[String: Double]] = []
    for f in fr.results ?? [] {
        let b = f.boundingBox
        faces.append(["x": b.origin.x, "y": 1 - b.origin.y - b.height, "w": b.width, "h": b.height,
                      "conf": Double(f.confidence), "yaw": f.yaw?.doubleValue ?? 0,
                      "roll": f.roll?.doubleValue ?? 0])
    }
    var labels: [String: Double] = [:]
    for c in cl.results ?? [] where c.confidence > 0.03 { labels[c.identifier] = Double(c.confidence) }
    out[path] = ["faces": faces, "labels": labels, "w": img.width, "h": img.height]
}
FileHandle.standardOutput.write(try! JSONSerialization.data(withJSONObject: out))
'''


def slugify(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def norm(s):
    return unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()


def tokens(s):
    return [t for t in re.split(r'[^a-z0-9]+', norm(s)) if len(t) > 2]


def has_all(toks, text):
    t = norm(text)
    return bool(toks) and all(re.search(r'\b' + re.escape(k) + r'\b', t) for k in toks)


def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def year_of(text):
    m = re.search(r'\b(19[5-9]\d|20[0-3]\d)\b', text or '')
    return int(m.group(1)) if m else None


# ---------------------------------------------------------------- network
class NetError(Exception):
    """A request kept failing (rate limit / outage): never read as 'no result'."""


class Deferred(Exception):
    """upload.wikimedia.org asked us to wait (Retry-After): do other players' API work meanwhile."""


class Net:
    def __init__(self, cache):
        self.cache = cache
        self.last = 0.0
        self.requests = 0
        self.upload_wait_until = 0.0
        os.makedirs(cache, exist_ok=True)

    def get(self, url, binary=False):
        key = hashlib.sha1(url.encode()).hexdigest()
        path = os.path.join(self.cache, key + ('.bin' if binary else '.txt'))
        if os.path.exists(path):
            with open(path, 'rb') as f:
                data = f.read()
            if data == b'__404__':
                return None
            return data if binary else data.decode('utf-8')
        host = urllib.parse.urlparse(url).netloc
        assert host in HOSTS, host
        if host == 'upload.wikimedia.org' and time.time() < self.upload_wait_until:
            raise Deferred(url)
        delay = 4.0
        for _ in range(10):
            # <= 2 req/s overall; upload.wikimedia.org rate-limits thumbs harder
            gap = {'commons.wikimedia.org': 2.0}.get(host, 1.5)   # single shared runner: <= 1 req / 1.5-2 s
            wait = self.last + gap - time.time()
            if wait > 0:
                time.sleep(wait)
            self.last = time.time()
            self.requests += 1
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'identity'})
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    data = r.read()
                with open(path, 'wb') as f:
                    f.write(data)
                return data if binary else data.decode('utf-8')
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    with open(path, 'wb') as f:
                        f.write(b'__404__')
                    return None
                if e.code == 429 or e.code >= 500:
                    ra = e.headers.get('Retry-After')
                    pause = max(delay, float(ra) if ra and ra.isdigit() else 0)
                    if host == 'upload.wikimedia.org' and pause > 30:
                        self.upload_wait_until = time.time() + pause
                        print(f'   http {e.code} from {host}, deferring downloads {pause:.0f}s', file=sys.stderr,
                              flush=True)
                        raise Deferred(url)
                    print(f'   http {e.code} from {host}, backing off {pause:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(pause)
                    delay = min(delay * 2, 120)
                    continue
                print(f'   http {e.code} from {host}: {url[:140]}', file=sys.stderr, flush=True)
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(delay)
                delay = min(delay * 2, 120)
        raise NetError(url)

    def json(self, url):
        t = self.get(url)
        if t is None:
            return None
        try:
            return json.loads(t)
        except json.JSONDecodeError:
            return None

    def api(self, host, **params):
        params['format'] = 'json'
        return self.json(f'https://{host}/w/api.php?' + urllib.parse.urlencode(params)) or {}

    def commons(self, **params):
        return self.api('commons.wikimedia.org', **params)

    def wikidata(self, **params):
        return self.api('www.wikidata.org', **params)


# ---------------------------------------------------------------- identity
def claim_ids(ent, prop):
    out = []
    for c in (ent.get('claims') or {}).get(prop, []):
        v = c.get('mainsnak', {}).get('datavalue', {}).get('value')
        if isinstance(v, dict) and v.get('id'):
            out.append(v['id'])
        elif isinstance(v, str):
            out.append(v)
    return out


def entities(net, qids):
    out = {}
    qids = list(dict.fromkeys(qids))
    for i in range(0, len(qids), 50):
        d = net.wikidata(action='wbgetentities', ids='|'.join(qids[i:i + 50]),
                         props='claims|labels|aliases|descriptions|sitelinks')
        out.update(d.get('entities') or {})
    return out


def names_of(ent):
    out = [v['value'] for v in (ent.get('labels') or {}).values()]
    for al in (ent.get('aliases') or {}).values():
        out += [a['value'] for a in al]
    return out


def is_futsal(ent):
    if FUTSAL_PLAYER_Q in claim_ids(ent, 'P106'):
        return True
    desc = ' '.join(v['value'] for v in (ent.get('descriptions') or {}).values())
    return bool(FUTSAL_WORDS.search(norm(desc)) or FUTSAL_WORDS.search(desc))


def name_matches(name, ent):
    n = norm(name)
    for alt in names_of(ent):
        a = norm(alt)
        a0 = re.sub(r'\s*\(.*\)$', '', a)
        if a == n or a0 == n:
            return True
    # multi-word names may appear as the full legal name ("Ricardo Filipe da Silva Braga")
    return len(tokens(name)) > 1 and any(has_all(tokens(name), alt) for alt in names_of(ent))


def wiki_summary(net, lang, title):
    t = urllib.parse.quote(title.replace(' ', '_'), safe='')
    return net.json(f'https://{lang}.wikipedia.org/api/rest_v1/page/summary/{t}')


def identify(net, name, country):
    """Return (qid, entity, note) or (None, None, reason)."""
    cq = COUNTRY_Q.get(country)
    cands = []
    if name in QIDS:
        cands = [QIDS[name]]
    else:
        d = net.wikidata(action='query', list='search', srsearch=f'{name} haswbstatement:P106={FUTSAL_PLAYER_Q}',
                         srlimit=20)
        cands += [r['title'] for r in d.get('query', {}).get('search', [])]
        for lang in LANGS:
            d = net.wikidata(action='wbsearchentities', search=name, language=lang, uselang=lang, type='item',
                             limit=20)
            cands += [r['id'] for r in d.get('search', [])]
    ents = entities(net, [c for c in cands if re.match(r'^Q\d+$', c)])
    if name not in QIDS and not any(is_futsal(e) and name_matches(name, e) for e in ents.values()):
        # Wikipedia search fallback in each language: "<name> futsal"
        for lang in LANGS:
            d = net.api(f'{lang}.wikipedia.org', action='query', list='search', srsearch=f'{name} futsal',
                        srlimit=5)
            titles = [r['title'] for r in d.get('query', {}).get('search', [])]
            if titles:
                pp = net.api(f'{lang}.wikipedia.org', action='query', prop='pageprops', ppprop='wikibase_item',
                             titles='|'.join(titles), redirects=1)
                for p in pp.get('query', {}).get('pages', {}).values():
                    q = (p.get('pageprops') or {}).get('wikibase_item')
                    if q:
                        cands.append(q)
    ents = entities(net, [c for c in cands if re.match(r'^Q\d+$', c)])
    ok = []
    for q, e in ents.items():
        if name in QIDS:
            ok.append((q, e))
            continue
        if not is_futsal(e) or not name_matches(name, e):
            continue
        countries = set(claim_ids(e, 'P27')) | set(claim_ids(e, 'P1532'))
        if cq and countries and cq not in countries:
            continue
        if cq and not countries:
            desc = ' '.join(v['value'] for v in (e.get('descriptions') or {}).values())
            if not re.search(DEMONYM.get(country, r'^$'), norm(desc) + ' ' + desc.lower()):
                continue
        ok.append((q, e))
    if not ok:
        return None, None, 'no futsal player with this name and country on Wikidata'
    if len(ok) > 1:
        return None, None, 'ambiguous: ' + ', '.join(
            f'{q} {(e.get("labels", {}).get("en") or next(iter(e.get("labels", {}).values()), {})).get("value", "")}'
            for q, e in ok)
    return ok[0][0], ok[0][1], 'override' if name in QIDS else 'search'


def articles(net, ent):
    """[(lang, title, summary)] for the futsal-mentioning en/pt/es/it/ru articles."""
    out = []
    links = ent.get('sitelinks') or {}
    for lang in LANGS:
        sl = links.get(f'{lang}wiki')
        if not sl:
            continue
        s = wiki_summary(net, lang, sl['title'])
        if not s or s.get('type') != 'standard':
            continue
        text = (s.get('description') or '') + ' ' + (s.get('extract') or '')
        if FUTSAL_WORDS.search(norm(text)) or FUTSAL_WORDS.search(text.lower()):
            out.append((lang, sl['title'], s))
    return out


# ---------------------------------------------------------------- commons
def commons_file(url):
    m = re.match(r'https://upload\.wikimedia\.org/wikipedia/commons/(?:thumb/)?[0-9a-f]/[0-9a-f]{2}/([^/?#]+)',
                 url or '')
    return urllib.parse.unquote(m.group(1)).replace('_', ' ') if m else None


def license_ok(short):
    if not short or LICENSE_BAD.search(short):
        return False
    return bool(LICENSE_OK.match(short.strip()))


def members(net, cat, kind):
    d = net.commons(action='query', list='categorymembers', cmtitle=cat, cmtype=kind, cmlimit=200)
    return [m['title'] for m in d.get('query', {}).get('categorymembers', [])]


def existing_categories(net, cats):
    if not cats:
        return []
    d = net.commons(action='query', prop='categoryinfo', titles='|'.join(cats))
    out = []
    for p in d.get('query', {}).get('pages', {}).values():
        ci = p.get('categoryinfo')
        if ci and (ci.get('files', 0) or ci.get('subcats', 0)):
            out.append(p['title'])
    return out


def player_categories(net, name, ent):
    cats = [f'Category:{c}' for c in claim_ids(ent, 'P373')]
    label = (ent.get('labels', {}).get('en') or {}).get('value') or name
    guesses = [f'Category:{name} (futsal player)', f'Category:{label} (futsal player)']
    if len(tokens(name)) > 1:
        guesses += [f'Category:{name}']
    for c in existing_categories(net, [g for g in dict.fromkeys(guesses) if g not in cats]):
        cats.append(c)
    return list(dict.fromkeys(cats))


def gather(net, name, qid, ent, arts, window):
    files = {}
    for f in claim_ids(ent, 'P18'):
        files[f] = 'p18'
    for _, _, s in arts:
        f = commons_file((s.get('originalimage') or s.get('thumbnail') or {}).get('source'))
        if f:
            files.setdefault(f, 'infobox')
    cats = player_categories(net, name, ent)
    subcats = []
    for c in cats:
        for f in members(net, c, 'file'):
            files.setdefault(f.split(':', 1)[1], 'category')
        for sc in members(net, c, 'subcat'):
            scn = norm(sc)
            if any(w in scn for w in SUBCAT_NEG):
                continue
            y = year_of(sc)
            if y and not (window[0] <= y <= window[1]):
                continue
            rank = (3 if y else 0) + (2 if any(w in scn for w in (' with ', 'national', 'playing', 'match',
                                                                    'team', 'futsal', 'club')) else 0)
            subcats.append((rank, sc))
    for _, sc in sorted(subcats, reverse=True)[:10]:
        for f in members(net, sc, 'file'):
            files.setdefault(f.split(':', 1)[1], 'subcat')
    d = net.commons(action='query', list='search', srnamespace=6, srsearch=f'haswbstatement:P180={qid}',
                    srlimit=50)
    for r in d.get('query', {}).get('search', []):
        files.setdefault(r['title'].split(':', 1)[1], 'depicts')
    label = (ent.get('labels', {}).get('en') or {}).get('value') or name
    queries = [f'"{name}" futsal'] + ([f'"{label}"'] if norm(label) != norm(name) and len(tokens(label)) > 1
                                      else [])
    if len(tokens(name)) > 1:
        queries.append(f'"{name}"')
    for qq in queries:
        d = net.commons(action='query', list='search', srnamespace=6, srsearch=qq, srlimit=40)
        for r in d.get('query', {}).get('search', []):
            files.setdefault(r['title'].split(':', 1)[1], 'search')
    keep = {f: src for f, src in files.items() if re.search(r'\.(jpe?g|png|webp|tiff?)$', f, re.I)}
    return keep, cats


def imageinfo(net, titles):
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = net.commons(action='query', prop='imageinfo', titles='|'.join('File:' + t for t in chunk),
                        iiprop='extmetadata|url|size', iiurlwidth=600,
                        iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                                            'DateTime|Categories|ImageDescription|ObjectName')
        norm_map = {n['to']: n['from'] for n in d.get('query', {}).get('normalized', [])}
        for p in d.get('query', {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [None])[0]
            if ii:
                t = p['title']
                ii['pageid'] = p.get('pageid')
                out[norm_map.get(t, t).split(':', 1)[1]] = ii
    return out


def depicts(net, pageids):
    out = {}
    ids = [i for i in pageids if i]
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        d = net.commons(action='wbgetentities', ids='|'.join(f'M{x}' for x in chunk), props='claims')
        for mid, ent in (d.get('entities') or {}).items():
            st = ent.get('statements') or ent.get('claims') or {}
            qs = set()
            for claim in st.get('P180', []) if isinstance(st, dict) else []:
                v = claim.get('mainsnak', {}).get('datavalue', {}).get('value', {})
                if isinstance(v, dict) and v.get('id'):
                    qs.add(v['id'])
            out[int(mid[1:])] = qs
    return out


ID_NEG = ['fan', 'fans', 'supporter', 'face paint', 'facepaint', 'painted face', 'mural', 'statue', 'wax',
          'banner', 'fan art', 'fanart', 'look-alike', 'lookalike', 'look alike', 'crowd', 'graffiti',
          'sculpture', 'tifo', 'cosplay', 'doll', 'figurine', 'shirt of', 'jersey of', 'signed shirt',
          'replica', 'painting', 'drawing', 'caricature', 'tattoo', 'poster', 'billboard', 'sticker',
          'boots', 'museum', 'exhibit', 'impersonator', 'mannequin', 'costume', 'tribute', 'memorial',
          'grave', 'bust of', 'plaque', 'stamp', 'coin', 'kit on display', 'shirts', 'adepto', 'hincha']


def meta_score(name, labels, file, src, ii, window, player_cats, qid, dep):
    em = ii.get('extmetadata', {})
    val = lambda k: strip_html(em.get(k, {}).get('value', ''))
    lic = val('LicenseShortName')
    if not license_ok(lic):
        return None
    if ii.get('width', 0) < 300 or ii.get('height', 0) < 300:
        return None
    cats = val('Categories')
    desc = val('ImageDescription') + ' ' + val('ObjectName')
    text = norm(file + ' | ' + cats + ' | ' + desc)
    subject = norm(file + ' | ' + desc)
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in ID_NEG) and not (dep == {qid}):
        return None
    if dep and qid not in dep:
        return None                   # structured data says it depicts someone else
    in_cat = any(norm(c.split(':', 1)[1]) in norm(cats) for c in player_cats)
    named = has_all(tokens(name), subject) or any(len(tokens(l)) > 1 and has_all(tokens(l), subject)
                                                  for l in labels)
    # identity: depicts the player, or (filed in the player's own category or
    # the Wikidata/infobox image) and named in the title/description, or a
    # search hit that names the full (multi-word) name and is a futsal photo
    if qid in dep:
        pass
    elif src in ('p18', 'infobox', 'category', 'subcat'):
        if src == 'subcat' and not named:
            return None
    elif src == 'search':
        if not (named and (in_cat or (len(tokens(name)) > 1 and 'futsal' in text))):
            return None
    else:
        return None
    raw_date = val('DateTimeOriginal')
    y = year_of(raw_date)
    if y is None:
        y = year_of(' '.join(re.findall(r'in (\d{4})', cats))) or year_of(file)
        date = str(y) if y else None
    else:
        m = re.search(r'(\d{4})(?:[-:/](\d\d)(?:[-:/](\d\d))?)?', raw_date)
        date = '-'.join(g for g in m.groups() if g)
    if y is None or not (window[0] <= y <= window[1]):
        return None
    pos = sum(w in text for w in POS_WORDS)
    neg = sum(w in text for w in NEG_WORDS)
    score = min(pos, 4) * 1.0 - neg * 2.5 + (2 if qid in dep else 0)
    if src in ('category', 'subcat', 'infobox', 'p18'):
        score += 1
    return {'score': score, 'date': date, 'year': y, 'license': lic,
            'licenseUrl': val('LicenseUrl'), 'artist': val('Artist') or 'Unknown',
            'descriptionurl': ii.get('descriptionurl', ''), 'thumburl': ii.get('thumburl') or ii.get('url'),
            'url': ii.get('url'), 'width': ii.get('width'), 'height': ii.get('height'), 'src': src,
            'text': text, 'sole': dep == {qid}}


def upload_url(u, width=None):
    if not u:
        return None
    u = u.split('?')[0].replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
    if width and '/thumb/' in u:
        u = re.sub(r'/\d+px-([^/]+)$', rf'/{width}px-\1', u)
    return u if u.startswith('https://upload.wikimedia.org/wikipedia/commons/') else None


# ---------------------------------------------------------------- vision
class Vision:
    def __init__(self, cache):
        self.bin = None
        if shutil.which('swiftc'):
            src = os.path.join(cache, 'vision_faces.swift')
            exe = os.path.join(cache, 'vision_faces_' + hashlib.sha1(SWIFT_SRC.encode()).hexdigest()[:8])
            if not os.path.exists(exe):
                with open(src, 'w') as f:
                    f.write(SWIFT_SRC)
                r = subprocess.run(['swiftc', '-O', src, '-o', exe], capture_output=True)
                if r.returncode != 0:
                    exe = None
            self.bin = exe
        self.memo = {}
        self.haar = None
        if cv2 is not None:
            self.haar = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades,
                                                           'haarcascade_frontalface_default.xml'))

    def analyse(self, paths):
        todo = [p for p in paths if p not in self.memo]
        if todo and self.bin:
            try:
                r = subprocess.run([self.bin, *todo], capture_output=True, timeout=300)
                self.memo.update(json.loads(r.stdout or b'{}'))
            except Exception:
                pass
        return {p: self.memo.get(p) for p in paths}

    def frontal(self, img, face):
        """OpenCV check: a frontal Haar face overlapping the Vision face box."""
        if self.haar is None:
            return True
        iw, ih = img.size
        g = cv2.cvtColor(np.asarray(img.convert('RGB')), cv2.COLOR_RGB2GRAY)
        g = cv2.equalizeHist(g)
        fw = face['w'] * iw
        found = self.haar.detectMultiScale(g, scaleFactor=1.08, minNeighbors=5,
                                           minSize=(int(fw * 0.5), int(fw * 0.5)))
        bx = (face['x'] * iw, face['y'] * ih, (face['x'] + face['w']) * iw, (face['y'] + face['h']) * ih)
        for (x, y, w, h) in found:
            ix = max(0, min(bx[2], x + w) - max(bx[0], x))
            iy = max(0, min(bx[3], y + h) - max(bx[1], y))
            inter = ix * iy
            union = (bx[2] - bx[0]) * (bx[3] - bx[1]) + w * h - inter
            if union and inter / union > 0.25:
                return True
        return False


def label(labels, *keys):
    return max([labels.get(k, 0.0) for k in keys] + [0.0])


def vision_score(v, sole=False):
    if not v or not v.get('faces'):
        return None, None
    faces = sorted(v['faces'], key=lambda f: f['w'] * f['h'], reverse=True)
    f = faces[0]
    if f['conf'] < 0.5:
        return None, None
    face_px = f['h'] * v['h']
    labels = v.get('labels', {})
    suit = label(labels, 'suit', 'necktie', 'tuxedo', 'bow_tie', 'blazer')
    sport = label(labels, 'sport', 'soccer', 'football', 'athletics', 'rugby', 'jersey', 'sportswear',
                  'team_sport', 'stadium', 'ball', 'basketball', 'handball', 'volleyball')
    art = label(labels, 'art', 'painting', 'drawing', 'illustration', 'sculpture', 'statue', 'document',
                'screenshot', 'poster')
    score = min(face_px, 160) / 40.0
    score += 4 * sport - 8 * suit - 4 * art
    if abs(f.get('yaw', 0)) > 1.0:
        return None, None                        # face turned away
    if abs(f.get('yaw', 0)) > 0.6:
        score -= 5
    if len(faces) > 1 and faces[1]['w'] * faces[1]['h'] > 0.3 * f['w'] * f['h'] and not sole:
        return None, None                        # group shot: can't tell which one is the player
    return score, {'face': f, 'suit': suit, 'sport': sport, 'art': art, 'face_px': face_px}


# ---------------------------------------------------------------- imaging
def face_px(img, face):
    return face['w'] * img.size[0], face['h'] * img.size[1]


def sharpness(img, face):
    """Laplacian variance of the face region, normalised to 128 px wide."""
    iw, ih = img.size
    box = (face['x'] * iw, face['y'] * ih, (face['x'] + face['w']) * iw, (face['y'] + face['h']) * ih)
    g = img.crop(tuple(round(v) for v in box)).convert('L').resize((128, 128), Image.BILINEAR)
    a = np.asarray(g, dtype=np.float32)
    lap = a[1:-1, 1:-1] * 4 - a[:-2, 1:-1] - a[2:, 1:-1] - a[1:-1, :-2] - a[1:-1, 2:]
    return float(lap.var())


def portrait_crop(img, face):
    """4:5 crop centred on the detected face: face box = FACE_FRAC of the crop
    width, face centre 40% from the top (hair top and shoulders in frame).
    Where the box runs past the photo edge the photo is extended with a
    blurred edge fill, so the face always stays centred."""
    iw, ih = img.size
    fx, fy, fw, fh = face['x'] * iw, face['y'] * ih, face['w'] * iw, face['h'] * ih
    cw = fw / FACE_FRAC
    ch = cw * 1.25
    left = fx + fw / 2 - cw / 2
    top = fy + fh / 2 - 0.40 * ch
    pad = int(max(0, -left, -top, left + cw - iw, top + ch - ih)) + 2
    if pad > 2:
        a = np.pad(np.asarray(img), ((pad, pad), (pad, pad), (0, 0)), mode='edge')
        big = Image.fromarray(a).filter(ImageFilter.GaussianBlur(max(6, pad // 6)))
        big.paste(img, (pad, pad))
        img, left, top = big, left + pad, top + pad
    return img.crop((round(left), round(top), round(left + cw), round(top + ch))).resize((W, H), Image.LANCZOS)


def vignette():
    """Bust-shaped fade: an oval around the head and shoulders that stays open
    at the bottom edge, so the shoulders run off the card window."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    cy = H * 0.44
    rx = W * (0.40 + 0.06 * np.clip((y - cy) / (H - cy), 0, 1))
    nx = (x - W / 2) / rx
    ny = np.where(y < cy, (y - cy) / (H * 0.44), 0.0)
    d = np.sqrt(nx * nx + ny * ny)
    v = np.clip((1.0 - d) / 0.34, 0, 1)
    return v * v * (3 - 2 * v)


def screen(dark, angle_deg, cell):
    """Anti-aliased AM halftone: ink where distance to the rotated cell centre
    is under the radius implied by local darkness (0..1)."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.deg2rad(angle_deg)
    u = x * np.cos(a) + y * np.sin(a)
    v = -x * np.sin(a) + y * np.cos(a)
    fu = (u / cell) % 1.0 - 0.5
    fv = (v / cell) % 1.0 - 0.5
    dist = np.sqrt(fu * fu + fv * fv) * cell
    r = np.sqrt(np.clip(dark, 0, 1) / np.pi) * cell * 1.13   # area coverage -> radius
    return np.clip(r - dist + 0.5, 0, 1)


def riso(img):
    g = ImageOps.grayscale(img)
    g = ImageOps.autocontrast(g, cutoff=2)
    g = g.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
    L = np.asarray(g, dtype=np.float32) / 255.0
    dark = 1.0 - L
    Ls = np.asarray(g.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32) / 255.0

    # ink: shadows as a 45deg screen + solid darkest tones + local-contrast
    # lines, which keep eyes, brows and mouth readable at card size
    ink = screen(np.clip((dark - 0.42) / 0.5, 0, 1), 45, 4.0)
    solid = np.clip((0.2 - Ls) / 0.08, 0, 1)
    local = np.asarray(g.filter(ImageFilter.GaussianBlur(5)), dtype=np.float32) / 255.0
    lines = np.clip(((local - Ls) - 0.07) / 0.08, 0, 1) * np.clip((0.75 - Ls) / 0.2, 0, 1)
    ink = np.maximum(ink, np.maximum(solid, lines))

    # tone: midtones as a 15deg screen, easing off in the highlights
    tone = screen(np.clip((dark - 0.25) / 0.55, 0, 1) * 0.7, 15, 4.0)

    vig = vignette()
    return ink * vig, tone * vig


def save_mask(alpha, path):
    a = (np.clip(alpha, 0, 1) * 255).astype(np.int32)
    a = ((a + 8) // 17 * 17).clip(0, 255).astype(np.uint8)   # 16 levels: AA edges, small files
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., 3] = a
    Image.fromarray(rgba, 'RGBA').save(path, 'WEBP', lossless=True, quality=100, method=6, exact=False)


def riso_cell(slug):
    cell = np.full((H, W, 3), (0xff, 0xf1, 0xd3), np.float32)
    for layer, col in (('tone', (0xe9, 0x79, 0x8b)), ('ink', (0x1f, 0x3d, 0x36))):
        m = np.asarray(Image.open(os.path.join(OUT_DIR, f'{slug}-{layer}.webp')).getchannel('A'),
                       dtype=np.float32)[..., None] / 255.0
        cell = cell * (1 - m) + cell * (np.array(col, np.float32) / 255.0) * m   # overprint
    return Image.fromarray(cell.astype(np.uint8))


def sheet(cells, labels, path, scale=1.0, cols=6):
    cw, ch = int(W * scale), int(H * scale)
    rows = (len(cells) + cols - 1) // cols
    out = Image.new('RGB', (cols * cw, rows * (ch + 24)), (0xff, 0xf1, 0xd3))
    d = ImageDraw.Draw(out)
    try:
        from PIL import ImageFont
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
    except Exception:
        font = None
    for i, (c, lab) in enumerate(zip(cells, labels)):
        ox, oy = (i % cols) * cw, (i // cols) * (ch + 24)
        out.paste(c.resize((cw, ch), Image.LANCZOS) if scale != 1 else c, (ox, oy))
        d.text((ox + 4, oy + ch + 4), lab[:44], fill=(0x1f, 0x3d, 0x36), font=font)
    out.save(path)



# ---------------------------------------------------------------- main
def load_players():
    data = json.load(open(PLAYERS_JSON, encoding='utf-8'))
    order = []
    for role in FUTSAL_ROLES:
        for k in ('current', 'allTime'):
            for n in data.get(role, {}).get(k, []):
                if n not in order:
                    order.append(n)
    return order


THUMB_STEP = 500   # Wikimedia serves only standard thumb widths (..., 330, 500, 960, 1280, 1920); others -> HTTP 400


def analysis_url(c):
    return upload_url(c['thumburl'], THUMB_STEP) if c['width'] > THUMB_STEP else upload_url(c['url'])


def choose(net, vis, name, cands, tmp):
    """Rank acceptable candidates: metadata score + Vision/OpenCV on small thumbs."""
    if name in PICKS:
        pick = [c for c in cands if c['file'] == PICKS[name]]
        if pick:
            c = pick[0]
            raw = net.get(analysis_url(c), binary=True)
            p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
            if raw:
                open(p, 'wb').write(raw)
                s, info = vision_score(vis.analyse([p])[p], True)
                c['vision'] = info
            return [c], 'pick'
    ranked = sorted([c for c in cands if c['file'] not in BLOCK], key=lambda c: c['score'], reverse=True)[:8]
    paths = {}
    for c in ranked:
        # the same URL the final crop step tries first, so each file is fetched once
        raw = net.get(analysis_url(c), binary=True)
        if not raw:
            raise NetError(f'could not download {c["file"]}')   # never read a failed fetch as a reject
        p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
        with open(p, 'wb') as f:
            f.write(raw)
        paths[p] = c
    res = vis.analyse(list(paths))
    ok = []
    for p, c in paths.items():
        vs, info = vision_score(res.get(p), c.get('sole'))
        why = None
        if vs is None:
            why = 'no single clear face'
        elif info['suit'] >= 0.3 or info['art'] >= 0.5:
            why = f'suit {info["suit"]:.2f} / art {info["art"]:.2f}'
        elif info['sport'] < 0.1 and not any(w in c['text'] for w in POS_WORDS):
            why = 'no sport/kit evidence'
        elif info['face']['w'] * c['width'] < FACE_MIN:
            why = 'face too small'
        if why:
            if DEBUG:
                print(f'   - {c["file"]} ({c["date"]}, meta {c["score"]:.1f}): {why}', flush=True)
            continue
        ok.append((c['score'] + vs, dict(c, vision=info)))
    return [c for _, c in sorted(ok, key=lambda t: t[0], reverse=True)], 'auto'




class Drop(Exception):
    """This player keeps the drawn art; the message is the reason."""


def process(net, vis, name, country, tmp, idents, crops):
    """Resolve, pick and riso-print one player. Returns the manifest entry."""
    if name in SKIP:
        raise Drop(SKIP[name])
    qid, ent, how = identify(net, name, country)
    if not qid:
        raise Drop(how)
    arts = articles(net, ent)
    labels_ = ent.get('labels', {})
    label = (labels_.get('en') or next(iter(labels_.values()), {})).get('value', '')
    descs = ent.get('descriptions', {})
    idents[name] = {'qid': qid, 'label': label, 'how': how, 'articles': [f'{l}:{t}' for l, t, _ in arts],
                    'desc': (descs.get('en') or next(iter(descs.values()), {})).get('value', '')}
    if not arts:
        raise Drop(f'{qid} has no en/pt/es/it/ru article that mentions futsal')
    lang, title, _ = arts[0]
    article = title if lang == 'en' else f'{lang}:{title}'
    if name in DROP:
        raise Drop(DROP[name])
    window = CAREER.get(name, CURRENT_WINDOW)
    files, cats = gather(net, name, qid, ent, arts, window)
    if name in PICKS and PICKS[name] not in files:
        files[PICKS[name]] = 'p18'
    info = imageinfo(net, list(files)[:400])
    dep = depicts(net, [ii.get('pageid') for ii in info.values()])
    names = list(dict.fromkeys(names_of(ent)))
    cands = []
    for f, ii in info.items():
        m = meta_score(name, names, f, files.get(f, 'search'), ii, window, cats, qid,
                       dep.get(ii.get('pageid'), set()))
        if m:
            cands.append(dict(m, file=f))
    idents[name]['files'] = len(files)
    idents[name]['cands'] = [c['file'] for c in cands]
    if not cands:
        raise Drop(f'no free (CC0/PD/CC BY/BY-SA) photo that names or depicts the player, dated in career '
                   f'({len(files)} Commons files checked)')
    ranked, mode = choose(net, vis, name, cands, tmp)
    best = img = None
    for c in ranked[:5]:
        raw = None
        fwn = ((c.get('vision') or {}).get('face') or {}).get('w', 0.2)
        if c['width'] <= THUMB_STEP or fwn * THUMB_STEP >= 110:
            urls = (analysis_url(c),)          # already fetched for the face check
        elif c['width'] <= 1000:
            urls = (upload_url(c['url']),)
        else:
            bucket = next((b for b in (960, 1280, 1920) if fwn * min(b, c['width']) >= 100), 1920)
            urls = ((upload_url(c['thumburl'], bucket) if bucket < c['width'] else None),
                    upload_url(c['url']) if c['width'] <= 2600 else upload_url(c['thumburl'], 1920))
        for u in urls:
            raw = u and net.get(u, binary=True)
            if raw:
                break
        try:
            im = ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
        except Exception:
            continue
        face = (c.get('vision') or {}).get('face')
        if not face:
            continue
        fw, _ = face_px(im, face)
        sh = sharpness(im, face)
        c['sharp'] = sh
        fr = vis.frontal(im, face)
        if fw < FACE_MIN or (mode != 'pick' and (sh < SHARP_MIN or not fr)):
            print(f'   skip {c["file"]}: face {fw:.0f}px sharp {sh:.0f} frontal {fr}', flush=True)
            continue
        best, img = c, im
        break
    if not best:
        raise Drop(f'no in-kit photo with a big, sharp, frontal face ({len(cands)} licensed candidates)')
    slug = slugify(name)
    crop = portrait_crop(img, best['vision']['face'])
    crops[name] = (crop, best)
    ink, tone = riso(crop)
    save_mask(ink, os.path.join(OUT_DIR, f'{slug}-ink.webp'))
    save_mask(tone, os.path.join(OUT_DIR, f'{slug}-tone.webp'))
    idents[name]['picked'] = best['file']
    print(f'   {mode} {qid} {article} <- {best["file"]} ({best["date"]}, {best["license"]}, {len(cands)} cands, '
          f'face {face_px(img, best["vision"]["face"])[0]:.0f}px, sharp {best["sharp"]:.0f})', flush=True)
    return {
        'slug': slug,
        'article': article,
        'file': best['descriptionurl'],
        'artist': best['artist'],
        'license': best['license'],
        'licenseUrl': best['licenseUrl'],
        'date': best['date'],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'futbol-futsal-photos-cache'))
    ap.add_argument('--sheet', default=os.path.join(tempfile.gettempdir(), 'riso-futsal-sheet.png'))
    ap.add_argument('--review', default='', help='dir for the source-crop sheet + identities.json')
    ap.add_argument('--only', default='')
    ap.add_argument('--debug', action='store_true')
    args = ap.parse_args()
    global DEBUG
    DEBUG = args.debug

    net = Net(args.cache)
    vis = Vision(args.cache)
    if not vis.bin:
        print('WARNING: Swift/Vision unavailable - no face check or in-kit check possible', file=sys.stderr)
    if vis.haar is None:
        print('WARNING: opencv-python-headless unavailable - no frontal-face check', file=sys.stderr)
    tmp = tempfile.mkdtemp(prefix='futsal-thumbs-')
    appearance = json.load(open(APPEARANCE_JSON, encoding='utf-8'))
    names = sorted(load_players(), key=lambda n: n != 'Ricardinho')   # the priority card first
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        names = [n for n in names if n in keep]
    os.makedirs(OUT_DIR, exist_ok=True)

    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST, encoding='utf-8'))
    dropped, idents, crops = {}, {}, {}
    deferred = set()

    def write_manifest():
        # atomic, after every player, so the card picks photos up while the run goes
        order = [n for n in load_players() if n in manifest]
        tmpf = MANIFEST + '.tmp'
        with open(tmpf, 'w', encoding='utf-8') as f:
            json.dump({n: manifest[n] for n in order}, f, ensure_ascii=False, indent=2)
            f.write('\n')
        os.replace(tmpf, MANIFEST)
        return order

    queue = list(names)
    done = 0
    while queue:
        name = queue.pop(0)
        tag = f'[{done+1}/{len(names)}] {name}'
        if (manifest.get(name) or {}).get('source', '').startswith('wikimedia/deep-audit'):
            # reviewed by hand in scripts/fetch-player-photos-deep.py (Sep 26 2026): never re-judge or drop it here
            done += 1
            continue
        try:
            manifest[name] = process(net, vis, name, (appearance.get(name) or {}).get('country'), tmp,
                                     idents, crops)
            print(f'{tag}: OK', flush=True)
        except Deferred:
            # API work is cached; retry the downloads once the Retry-After window has passed
            queue.append(name)
            if all(n in deferred for n in queue):
                wait = max(0.0, net.upload_wait_until - time.time()) + 1
                print(f'   all remaining players wait on downloads: sleeping {wait:.0f}s', flush=True)
                time.sleep(wait)
                deferred.clear()
            deferred.add(name)
            continue
        except (Drop, NetError) as e:
            why = str(e) if isinstance(e, Drop) else f'network failure, rerun ({e})'
            dropped[name] = why
            if isinstance(e, Drop):
                manifest.pop(name, None)   # a network failure keeps any earlier entry
            print(f'{tag}: DROP {why}', flush=True)
        done += 1
        write_manifest()

    order = write_manifest()
    # Masks of dropped players are left in place: the legends manifest
    # (lib/town/playerPhotos.json, another batch) may still point at them.

    if order:
        os.makedirs(os.path.dirname(args.sheet) or '.', exist_ok=True)
        sheet([riso_cell(manifest[n]['slug']) for n in order], order, args.sheet, scale=0.5, cols=8)
    if args.review:
        os.makedirs(args.review, exist_ok=True)
        with open(os.path.join(args.review, 'identities.json'), 'w', encoding='utf-8') as f:
            json.dump({'identities': idents, 'dropped': dropped}, f, ensure_ascii=False, indent=1)
        src = [n for n in order if n in crops]
        if src:
            sheet([crops[n][0] for n in src], [f'{n} {crops[n][1]["date"]}' for n in src],
                  os.path.join(args.review, 'source.png'), scale=0.5, cols=8)
    shutil.rmtree(tmp, ignore_errors=True)
    print('\nrequests', net.requests)
    print('accepted', len(order))
    print('dropped', len(dropped))
    for n, r in dropped.items():
        print(f'  {n}: {r}')


if __name__ == '__main__':
    main()
