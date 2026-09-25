#!/usr/bin/env python3
"""Riso photo portraits for the WOMEN players of Futbol Island (current stars
and all-time legends of the women's game).

Same approach and output format as scripts/fetch-player-photos.py and
scripts/fetch-player-photos-stars.py (Wikimedia API, license filter, riso
ink/tone alpha masks), with these checks:

  * identity  - the file's title/description or structured 'depicts' must name
                the player (married names handled: Lindsey Heaps = Horan,
                Sophia Wilson = Smith); fan/mural/statue/face-paint files are
                refused, AND the detected face must match the face in her
                Wikipedia infobox photo (OpenCV SFace, cosine similarity).
  * in kit    - dated inside her playing career (legends: playing era only),
                match / training / team-photo text cues, no ceremony / press /
                suit / coaching cues; the Apple Vision scene classifier
                (optional) must not see a suit.
  * big face  - OpenCV YuNet face detection on the image actually cropped;
                4:5 crop, face centre 40% from the top, face box 42% of the
                crop width; rejected when that needs more than 2x upscaling,
                when the face is blurred (Laplacian variance) or turned away
                (landmark yaw), or when another head sits in the portrait.
  * license   - CC0 / PD / CC BY / CC BY-SA only.
  PICKS / BLOCK / DROP hold the hand-reviewed decisions from the contact sheet.

Outputs (this script only ever writes the women's batch):
  public/players/<slug>-ink.webp, <slug>-tone.webp   (alpha masks, 320x400)
  lib/town/playerPhotos.women.json                   (written after every accept)

Run with a Python that has opencv-python-headless, numpy and pillow, e.g.
  python3.12 -m venv /tmp/v && /tmp/v/bin/pip install opencv-python-headless pillow numpy
  /tmp/v/bin/python scripts/fetch-player-photos-women.py --work DIR
--work holds the response cache, the YuNet / SFace models (downloaded once),
the colour source crops and the labelled contact sheet (DIR/sheet.png).

Network: en.wikipedia.org, commons.wikimedia.org, upload.wikimedia.org (and
github.com once, for the two models); <= 2 requests/s (slower on upload),
backoff on 429/5xx; a fixed User-Agent and no personal information.
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

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.women.json')
OUT_DIR = os.path.join(ROOT, 'public/players')
UA = 'FutbolIslandPhotos/1.0'
W, H = 320, 400
THIS_YEAR = 2026
FACE_FRAC = 0.42             # face box width / crop width (>= 0.40 required)
MAX_UPSCALE = 2.0
FACE_MIN = W * FACE_FRAC / MAX_UPSCALE   # ~67 px face width in the cropped source
SHARP_MIN = 45.0             # Laplacian variance of the face at 128 px
YAW_MAX = 0.30               # |nose offset| / eye distance; above = turned away
ID_MIN = 0.40                # SFace cosine similarity to the infobox face (0.363 = OpenCV's same-person cut)
MODELS = {
    'yunet.onnx': 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/'
                  'face_detection_yunet_2023mar.onnx',
    'sface.onnx': 'https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/'
                  'face_recognition_sface_2021dec.onnx',
}

# name -> (playing career (first, last year), still playing, other names, kit keywords)
# Kit keywords are her clubs and national team; they only add score (any
# in-career club or national-team photo qualifies).
PLAYERS = {
    'Aitana Bonmatí': ((2016, 2026), True, [], ['barcelona', 'barca', 'spain', 'espana']),
    'Alexia Putellas': ((2010, 2026), True, [], ['barcelona', 'barca', 'spain', 'espana', 'levante', 'espanyol']),
    'Sam Kerr': ((2008, 2026), True, ['Samantha Kerr'], ['chelsea', 'australia', 'matildas', 'perth glory', 'chicago red stars', 'sky blue']),
    'Marta': ((2000, 2026), True, ['Marta Vieira da Silva', 'Marta Vieira'], ['brazil', 'brasil', 'orlando pride', 'umea', 'tyreso', 'rosengard', 'fc gold pride', 'western new york']),
    'Mia Hamm': ((1987, 2004), False, [], ['united states', 'usa', 'uswnt', 'washington freedom']),
    'Megan Rapinoe': ((2006, 2023), False, [], ['united states', 'usa', 'uswnt', 'reign', 'lyon', 'seattle']),
    'Mariona Caldentey': ((2012, 2026), True, [], ['arsenal', 'barcelona', 'barca', 'spain', 'espana']),
    'Patri Guijarro': ((2014, 2026), True, ['Patricia Guijarro'], ['barcelona', 'barca', 'spain', 'espana']),
    'Lindsey Heaps': ((2012, 2026), True, ['Lindsey Horan'], ['united states', 'usa', 'uswnt', 'lyon', 'thorns', 'portland', 'paris']),
    'Hannah Hampton': ((2016, 2026), True, [], ['chelsea', 'england', 'lionesses', 'aston villa', 'birmingham']),
    'Mary Earps': ((2010, 2026), True, [], ['manchester united', 'england', 'lionesses', 'paris', 'psg', 'wolfsburg']),
    'Alyssa Naeher': ((2008, 2026), True, [], ['united states', 'usa', 'uswnt', 'chicago red stars', 'boston breakers']),
    'Lucy Bronze': ((2009, 2026), True, [], ['chelsea', 'england', 'lionesses', 'barcelona', 'lyon', 'manchester city']),
    'Wendie Renard': ((2006, 2026), True, [], ['lyon', 'france', 'ol ']),
    'Leah Williamson': ((2014, 2026), True, [], ['arsenal', 'england', 'lionesses']),
    'Mapi León': ((2012, 2026), True, ['Mapi Leon', 'María Pilar León'], ['barcelona', 'barca', 'spain', 'espana', 'atletico']),
    'Caroline Graham Hansen': ((2011, 2026), True, [], ['barcelona', 'barca', 'norway', 'norge', 'wolfsburg']),
    'Salma Paralluelo': ((2019, 2026), True, [], ['barcelona', 'barca', 'spain', 'espana', 'villarreal']),
    'Trinity Rodman': ((2021, 2026), True, [], ['united states', 'usa', 'uswnt', 'washington spirit', 'spirit']),
    'Lauren James': ((2018, 2026), True, [], ['chelsea', 'england', 'lionesses', 'manchester united']),
    'Chloe Kelly': ((2015, 2026), True, [], ['arsenal', 'england', 'lionesses', 'manchester city', 'everton']),
    'Clàudia Pina': ((2017, 2026), True, ['Claudia Pina'], ['barcelona', 'barca', 'spain', 'espana', 'sevilla']),
    'Alessia Russo': ((2017, 2026), True, [], ['arsenal', 'england', 'lionesses', 'manchester united']),
    'Ewa Pajor': ((2012, 2026), True, [], ['barcelona', 'barca', 'poland', 'polska', 'wolfsburg']),
    'Khadija Shaw': ((2015, 2026), True, ['Bunny Shaw'], ['manchester city', 'jamaica', 'reggae girlz', 'bordeaux']),
    'Sophia Wilson': ((2017, 2026), True, ['Sophia Smith'], ['united states', 'usa', 'uswnt', 'thorns', 'portland']),
    'Temwa Chawinga': ((2014, 2026), True, [], ['kansas city', 'kc current', 'malawi', 'wuhan']),
    'Ada Hegerberg': ((2011, 2026), True, [], ['lyon', 'norway', 'norge', 'potsdam', 'stabaek', 'kolbotn']),
    'Vivianne Miedema': ((2011, 2026), True, [], ['manchester city', 'arsenal', 'netherlands', 'nederland', 'oranje', 'bayern']),
    'Pernille Harder': ((2008, 2026), True, [], ['bayern', 'chelsea', 'wolfsburg', 'denmark', 'danmark', 'linkoping']),
    'Barbra Banda': ((2014, 2026), True, [], ['orlando pride', 'zambia', 'shanghai', 'logrono']),
    'Asisat Oshoala': ((2013, 2026), True, [], ['barcelona', 'barca', 'nigeria', 'super falcons', 'bay fc', 'liverpool', 'arsenal', 'dalian']),
    'Abby Wambach': ((1999, 2015), False, [], ['united states', 'usa', 'uswnt', 'western new york', 'flash', 'magicjack', 'washington freedom']),
    'Birgit Prinz': ((1993, 2011), False, [], ['germany', 'deutschland', 'dfb', 'frankfurt', 'carolina courage']),
    'Christine Sinclair': ((2000, 2024), False, [], ['canada', 'thorns', 'portland', 'western new york', 'fc gold pride']),
    'Alex Morgan': ((2009, 2024), False, [], ['united states', 'usa', 'uswnt', 'orlando pride', 'san diego wave', 'thorns', 'lyon', 'tottenham']),
    'Carli Lloyd': ((2005, 2021), False, [], ['united states', 'usa', 'uswnt', 'houston dash', 'gotham', 'sky blue', 'western new york']),
    'Hope Solo': ((2000, 2016), False, [], ['united states', 'usa', 'uswnt', 'reign', 'seattle', 'magicjack', 'atlanta beat']),
    'Nadine Angerer': ((1996, 2015), False, [], ['germany', 'deutschland', 'dfb', 'frankfurt', 'brisbane roar', 'portland', 'thorns', 'turbine potsdam']),
    'Formiga': ((1994, 2021), False, ['Miraildes Maciel Mota'], ['brazil', 'brasil', 'paris', 'psg', 'sao paulo']),
    'Homare Sawa': ((1991, 2015), False, [], ['japan', 'nadeshiko', 'inac', 'kobe', 'washington freedom']),
    'Sun Wen': ((1990, 2003), False, [], ['china', 'atlanta beat']),
    'Michelle Akers': ((1985, 2000), False, [], ['united states', 'usa', 'uswnt']),
    'Kristine Lilly': ((1987, 2010), False, [], ['united states', 'usa', 'uswnt', 'boston breakers']),
    'Lieke Martens': ((2010, 2026), True, [], ['barcelona', 'barca', 'netherlands', 'nederland', 'oranje', 'paris', 'psg', 'wolfsburg', 'rosengard']),
}
# Hand-picked article titles (disambiguations / married names).
OVERRIDES = {
    'Marta': ['Marta (footballer)'],
    'Formiga': ['Formiga (footballer)'],
    'Sun Wen': ['Sun Wen'],
    'Lindsey Heaps': ['Lindsey Heaps', 'Lindsey Horan'],
    'Sophia Wilson': ['Sophia Wilson', 'Sophia Smith (soccer)'],
    'Sam Kerr': ['Sam Kerr'],
    'Khadija Shaw': ['Khadija Shaw'],
    'Mapi León': ['Mapi León'],
}
# Processing order: the user's priority list first, then the rest.
PRIORITY = ['Aitana Bonmatí', 'Alexia Putellas', 'Sam Kerr', 'Marta', 'Mia Hamm', 'Megan Rapinoe']

# Hand-reviewed overrides from the contact sheets.
#   PICKS: name -> exact Commons file title (without "File:").
#   BLOCK: Commons file titles never to use.   DROP: players left to drawn art.
PICKS = {}
BLOCK = {
    'Ogimi scores vs USA, 2012 Olympic gold medal match.jpg',   # tiny blurred face, may be Ogimi not Sawa
    '25th Laureus World Sports Awards - 240422 213931-2.jpg',   # Paralluelo at a gala, not kit
    'Lauren James Man Utd vs Lewes (cropped).jpg',             # arriving in tracksuit + backpack
    'England Lionesses Bus Celebration - The Mall, London - Tuesday 29th July 2025 11 (cropped).jpg',  # parade tee, not kit
    '2022 NWSL Championship 22 - Portland Thorns (cropped).jpg',   # team photo: the framed face is a team-mate, not Sinclair
}
DROP = {}

LICENSE_OK = re.compile(
    r'^(cc0(\s*1\.0)?|public\s*domain.*|pd([\s-].*)?|cc[\s-]by([\s-]sa)?[\s-]\d\.\d.*)$', re.I)
LICENSE_BAD = re.compile(r'\b(nc|nd)\b|non-?commercial|no-?deriv|fair\s*use', re.I)

POS_WORDS = ['match', ' vs', ' v ', 'versus', 'training', 'game', ' cup', 'league', 'friendly', 'qualif',
             'national football team', 'football team', 'national team', 'national soccer team', 'squad',
             'team photo', 'line-up', 'lineup', 'stadium', 'world cup', 'euro 20', 'copa ', 'championship',
             'derby', 'supercup', 'super cup', 'in action', 'warm', 'kit', 'jersey', 'uefa', 'fifa', 'liga',
             'nwsl', 'wsl', 'olympic', 'shebelieves', 'algarve', 'final', 'playoff', 'penalty', 'celebrat',
             'pitch', 'fc ', ' cf', 'soccer', 'football', 'futbol', 'fussball', 'women\'s', 'femeni',
             'frauen', 'feminin', 'goalkeeper', 'save', 'goal']
NEG_WORDS = ['ceremony', 'award', 'gala', 'press', 'conference', ' suit', 'statue', 'museum', 'visit',
             'meeting', 'premiere', 'festival', 'signing', 'autograph', 'studio', 'interview', 'mural',
             'painting', 'stamp', 'wax', 'ballon', 'reception', 'president', 'minister', 'wedding', 'charity',
             'mayor', 'honour', 'honor', 'unveil', 'book', 'presentation', 'sponsor', 'commercial',
             'ambassador', 'celebrity', 'event', 'concert', 'parliament', 'embassy', 'politic', 'funeral',
             'exhibition', 'drawing', 'caricature', 'poster', 'banner', 'fans', 'supporters', 'tv ',
             'television', 'talk', 'red carpet', 'party', 'launch', 'forum', 'summit', 'birthday',
             'selfie', 'kremlin', 'white house', 'palace', 'medal', 'trophy', 'honorary', 'tribute',
             'memorial', 'film', 'movie', 'photocall', 'fashion', 'music', 'unicef', 'foundation', 'visita',
             'entrega', 'parade', 'airport', 'arrival', 'hospital', 'school', 'the best fifa', 'attends',
             'secretary', 'dinner', 'lunch', 'banquet', 'coach', 'manager', 'pundit', 'commentat',
             'broadcast', 'podcast', 'retire', 'farewell', 'legends', 'hall of fame', 'rally', 'march',
             'protest', 'senate', 'congress', 'capitol', 'campaign', 'speaks', 'speech', 'panel', 'gaa',
             'clinic', 'camp for', 'book signing', 'honoree', 'induct', 'espy', 'glamour', 'vanity']
SUBCAT_NEG = ['statue', 'art', 'signature', 'autograph', 'popular culture', 'caricature', 'mural', 'award',
              'event', 'family', 'wax', 'stamp', 'poster', 'honor', 'honour', 'politic', 'business', 'video',
              'audio', 'logo', 'monument', 'museum', 'wedding', 'house', 'charity', 'depiction', 'painting',
              'drawing', 'sculpture', 'president', 'ceremony', 'trophy', 'celebration', 'parade', 'fan',
              'coach', 'manager', 'pundit', 'commentat', 'hall of fame', 'retire', 'legend']
ID_NEG = ['fan', 'fans', 'supporter', 'face paint', 'facepaint', 'painted face', 'mural', 'statue', 'wax',
          'banner', 'fan art', 'fanart', 'look-alike', 'lookalike', 'look alike', 'crowd', 'graffiti',
          'sculpture', 'tifo', 'cosplay', 'doll', 'figurine', 'shirt of', 'jersey of', 'signed shirt',
          'replica', 'painting', 'drawing', 'caricature', 'tattoo', 'poster', 'billboard', 'sticker',
          'boots', 'museum', 'exhibit', 'impersonator', 'mannequin', 'costume', 'tribute', 'memorial',
          'plaque', 'stamp', 'coin', 'kit on display', 'shirts', 'screen', 'screenshot', 'tv', 'mask',
          'cardboard', 'cutout', 'cut-out', 'lego', 'figure', 'kid', 'child', 'young fan']

SWIFT_SRC = r'''
import Foundation
import Vision
import ImageIO
var out: [String: Any] = [:]
for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { continue }
    let cl = VNClassifyImageRequest()
    try? VNImageRequestHandler(cgImage: img, options: [:]).perform([cl])
    var labels: [String: Double] = [:]
    for c in cl.results ?? [] where c.confidence > 0.03 { labels[c.identifier] = Double(c.confidence) }
    out[path] = labels
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


def has_word(words, text):
    t = norm(text)
    return any(re.search(r'(?<![a-z])' + re.escape(norm(w)), t) for w in words)


def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def names_of(name, base):
    """Every name that may identify her in a caption (married / maiden names)."""
    return [name, base] + PLAYERS[name][2]


# ---------------------------------------------------------------- network
class NetFail(Exception):
    """An API call kept failing (rate limit): the player is retried later
    instead of being judged on incomplete data."""


class Net:
    HOSTS = ('en.wikipedia.org', 'commons.wikimedia.org', 'upload.wikimedia.org')

    def __init__(self, cache):
        self.cache = cache
        self.last = 0.0
        self.requests = 0
        self.info = {}          # file title -> imageinfo gathered by generator queries
        os.makedirs(cache, exist_ok=True)

    def get(self, url, binary=False):
        key = hashlib.sha1(url.encode()).hexdigest()
        path = os.path.join(self.cache, key + ('.bin' if binary else '.txt'))
        if os.path.exists(path):
            data = open(path, 'rb').read()
            if data == b'__404__':
                return None
            return data if binary else data.decode('utf-8')
        host = urllib.parse.urlparse(url).netloc
        assert host in self.HOSTS, host
        delay = 5.0
        for _ in range(10):
            gap = {'commons.wikimedia.org': 2.0}.get(host, 1.5)   # single shared runner: <= 1 req / 1.5-2 s
            wait = self.last + gap - time.time()
            if wait > 0:
                time.sleep(wait)
            self.last = time.time()
            self.requests += 1
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'identity'})
            try:
                with urllib.request.urlopen(req, timeout=40) as r:
                    data = r.read()
                open(path, 'wb').write(data)
                return data if binary else data.decode('utf-8')
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    open(path, 'wb').write(b'__404__')
                    return None
                if e.code == 429 or e.code >= 500:
                    ra = e.headers.get('Retry-After')
                    pause = float(ra) if ra and ra.strip().isdigit() else delay   # honour Retry-After exactly
                    print(f'   http {e.code}, backing off {pause:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(pause)
                    delay = min(delay * 2, 120)
                    continue
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(delay)
                delay = min(delay * 2, 120)
        if host != 'upload.wikimedia.org':
            raise NetFail(url)
        return None

    def json(self, url):
        t = self.get(url)
        if t is None:
            return None
        try:
            return json.loads(t)
        except json.JSONDecodeError:
            return None

    def commons(self, **params):
        params['format'] = 'json'
        return self.json('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)) or {}


def ensure_models(d):
    os.makedirs(d, exist_ok=True)
    for fn, url in MODELS.items():
        p = os.path.join(d, fn)
        if not os.path.exists(p):
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                open(p, 'wb').write(r.read())
    return os.path.join(d, 'yunet.onnx'), os.path.join(d, 'sface.onnx')


# ---------------------------------------------------------------- article
def summary(net, title):
    t = urllib.parse.quote(title.replace(' ', '_'), safe='')
    return net.json(f'https://en.wikipedia.org/api/rest_v1/page/summary/{t}')


def summary_ok(s):
    if not s or s.get('type') != 'standard':
        return False
    text = norm((s.get('description') or '') + ' ' + (s.get('extract') or ''))
    return bool(re.search(r'footballer|association football|\bfootball\b|soccer', text)) and \
        'american football' not in text


def resolve(net, name):
    seen = []
    for c in OVERRIDES.get(name, []) + [name, f'{name} (footballer)', f'{name} (soccer)']:
        if c in seen:
            continue
        seen.append(c)
        s = summary(net, c)
        if summary_ok(s):
            return s
    return None


# ---------------------------------------------------------------- commons
def commons_file(url):
    m = re.match(r'https://upload\.wikimedia\.org/wikipedia/commons/(?:thumb/)?[0-9a-f]/[0-9a-f]{2}/([^/?#]+)',
                 url or '')
    return urllib.parse.unquote(m.group(1)).replace('_', ' ') if m else None


def license_ok(short):
    if not short or LICENSE_BAD.search(short):
        return False
    return bool(LICENSE_OK.match(short.strip()))


def year_of(text):
    m = re.search(r'\b(19[5-9]\d|20[0-3]\d)\b', text or '')
    return int(m.group(1)) if m else None


def file_categories(net, title):
    d = net.commons(action='query', prop='categories', titles='File:' + title, clshow='!hidden', cllimit=50)
    out = []
    for p in d.get('query', {}).get('pages', {}).values():
        out += [c['title'] for c in p.get('categories', [])]
    return out


def members(net, cat, kind):
    out, cont = [], None
    for _ in range(3):
        kw = dict(action='query', list='categorymembers', cmtitle=cat, cmtype=kind, cmlimit=500)
        if cont:
            kw['cmcontinue'] = cont
        d = net.commons(**kw)
        out += [m['title'] for m in d.get('query', {}).get('categorymembers', [])]
        cont = d.get('continue', {}).get('cmcontinue')
        if not cont:
            break
    return out


II_GEN = dict(prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=600,
              iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                                  'DateTime|Categories|ImageDescription|ObjectName')


def cat_files(net, cat):
    """Files of a category WITH their imageinfo, one generator query per 50 files."""
    out, cont = [], {}
    for _ in range(6):
        d = net.commons(action='query', generator='categorymembers', gcmtitle=cat, gcmtype='file',
                        gcmlimit=50, **II_GEN, **cont)
        for p in d.get('query', {}).get('pages', {}).values():
            t = p['title'].split(':', 1)[1]
            ii = (p.get('imageinfo') or [None])[0]
            if ii:
                ii['pageid'] = p.get('pageid')
                net.info[t] = ii
            out.append(t)
        cont = d.get('continue') or {}
        cont = {k: v for k, v in cont.items() if k != 'continue'}
        if not cont or len(out) >= 300:
            break
    return out


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


def player_categories(net, name, article, infobox_file):
    base = re.sub(r'\s*\(.*\)$', '', article)
    ids = names_of(name, base)
    cats = []
    if infobox_file:
        for c in file_categories(net, infobox_file):
            cname = c.split(':', 1)[1]
            if any(has_all(tokens(n), cname) for n in ids) and len(tokens(cname)) <= len(tokens(base)) + 2 and \
                    not any(w in norm(cname) for w in SUBCAT_NEG) and not year_of(cname) and \
                    ' with ' not in cname and ' in ' not in cname and ' at ' not in cname:
                cats.append(c)
    guesses = [f'Category:{article}', f'Category:{base} (footballer)', f'Category:{base} (soccer)']
    if base == article and len(tokens(name)) >= 2:
        guesses.append(f'Category:{name}')
        guesses += [f'Category:{a}' for a in PLAYERS[name][2] if len(tokens(a)) >= 2]
    for c in existing_categories(net, [g for g in dict.fromkeys(guesses) if g not in cats]):
        cats.append(c)
    return list(dict.fromkeys(cats))


def subcat_rank(sc, name):
    (y0, y1), active, _, kit = PLAYERS[name]
    scn = norm(sc)
    if any(w in scn for w in SUBCAT_NEG):
        return None
    y = year_of(sc)
    if y and not (y0 <= y <= y1):
        return None
    rank = 0.0
    if y:
        rank += 3 + ((y - y0) * 0.2 if active else 0)
    if has_word(kit, scn):
        rank += 3.5
    if any(w in scn for w in (' with ', 'national', 'playing', 'match', 'team', ' fc', 'club', ' vs', ' v ')):
        rank += 1.5
    if re.search(r' by (year|season|club|team|date)', scn):
        rank += 5          # container: descended into below
    return rank


def gather(net, name, article, infobox_file):
    """Candidate file title -> provenance (where it was found)."""
    base = re.sub(r'\s*\(.*\)$', '', article)
    cats = player_categories(net, name, article, infobox_file)
    files = {}
    if infobox_file:
        files[infobox_file] = 'infobox'
    subcats = []
    for c in cats:
        for f in cat_files(net, c):
            files.setdefault(f, 'category')
        for sc in members(net, c, 'subcat'):
            r = subcat_rank(sc, name)
            if r is not None:
                subcats.append((r, sc))
    seen = set()
    queue = sorted(subcats, reverse=True)[:10]
    for r, sc in list(queue):
        if r >= 4:
            for ssc in members(net, sc, 'subcat')[:60]:
                rr = subcat_rank(ssc, name)
                if rr is not None:
                    queue.append((rr + 0.5, ssc))
    for _, sc in sorted(queue, reverse=True)[:14]:
        if sc in seen:
            continue
        seen.add(sc)
        for f in cat_files(net, sc):
            files.setdefault(f, 'subcat:' + sc.split(':', 1)[1])
    queries = [n for n in dict.fromkeys([name] + PLAYERS[name][2]) if len(tokens(n)) >= 2]
    if not queries:          # mononyms (Marta, Formiga): name + football words
        queries = [f'{base} football', f'{base} futebol']
    for q in queries:
        d = net.commons(action='query', generator='search', gsrnamespace=6,
                        gsrsearch=f'"{q}"' if len(tokens(q)) >= 2 else q, gsrlimit=50, **II_GEN)
        for p in d.get('query', {}).get('pages', {}).values():
            t = p['title'].split(':', 1)[1]
            ii = (p.get('imageinfo') or [None])[0]
            if ii:
                ii['pageid'] = p.get('pageid')
                net.info[t] = ii
            files.setdefault(t, 'search')
    keep = {f: src for f, src in files.items() if re.search(r'\.(jpe?g|png|webp|tiff?)$', f, re.I)}
    return keep, cats


def imageinfo(net, titles):
    out = {}
    titles = [t for t in titles if t not in net.info]
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
                ii['pageid'] = p.get('pageid')
                out[norm_map.get(p['title'], p['title']).split(':', 1)[1]] = ii
    return out


def imageinfo_all(net, titles):
    """imageinfo for every title, reusing what generator queries already returned."""
    have = {t: net.info[t] for t in titles if t in net.info}
    have.update(imageinfo(net, titles))
    return have


def depicts(net, pageids):
    out = {}
    ids = [i for i in pageids if i]
    for i in range(0, len(ids), 50):
        d = net.commons(action='wbgetentities', ids='|'.join(f'M{x}' for x in ids[i:i + 50]), props='claims')
        for mid, ent in (d.get('entities') or {}).items():
            st = ent.get('statements') or ent.get('claims') or {}
            qs = set()
            for claim in st.get('P180', []) if isinstance(st, dict) else []:
                v = claim.get('mainsnak', {}).get('datavalue', {}).get('value', {})
                if isinstance(v, dict) and v.get('id'):
                    qs.add(v['id'])
            out[int(mid[1:])] = qs
    return out


def meta_score(name, base, file, src, ii, player_cats, qid, dep):
    (y0, y1), active, _, kit = PLAYERS[name]
    em = ii.get('extmetadata', {})
    val = lambda k: strip_html(em.get(k, {}).get('value', ''))
    lic = val('LicenseShortName')
    if not license_ok(lic):
        return None, 'license'
    if ii.get('width', 0) < 300 or ii.get('height', 0) < 300:
        return None, 'small'
    cats = val('Categories')
    desc = val('ImageDescription') + ' ' + val('ObjectName')
    srccat = src.split(':', 1)[1] if src.startswith('subcat:') else ''
    text = norm(file + ' | ' + cats + ' | ' + desc + ' | ' + srccat)
    subject = norm(file + ' | ' + desc)
    # identity: title / description / depicts must name her as the subject
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in ID_NEG) and not (qid and dep == {qid}):
        return None, 'id-neg'
    if dep and qid and qid not in dep:
        return None, 'depicts-other'
    ids = names_of(name, base)
    named = any(has_all(tokens(n), subject) for n in ids if len(tokens(n)) >= 2)
    if len(tokens(base)) < 2 and not named:
        # mononym: the bare name counts only in a file filed in her own category
        named = has_all(tokens(base), subject) and src != 'search'
    if not ((qid and qid in dep) or named):
        return None, 'unnamed'
    in_cat = any(norm(c.split(':', 1)[1]) in norm(cats) for c in player_cats)
    if src == 'search' and player_cats and not in_cat:
        return None, 'search-not-in-cat'
    raw_date = val('DateTimeOriginal')
    y = year_of(raw_date)
    date = None
    if y is not None:
        m = re.search(r'(\d{4})(?:[-:/](\d\d)(?:[-:/](\d\d))?)?', raw_date)
        date = '-'.join(g for g in m.groups() if g)
    else:
        y = year_of(' '.join(re.findall(r'in (\d{4})', cats + ' ' + srccat))) or year_of(file)
        date = str(y) if y else None
    if y is None or not (y0 <= y <= min(y1, THIS_YEAR)):
        return None, 'date'
    pos = sum(w in text for w in POS_WORDS)
    neg = sum(w in text for w in NEG_WORDS)
    in_kit = has_word(kit, text)
    if (neg >= 2 and pos < 3) or (neg >= 1 and pos == 0):
        return None, 'off-pitch'
    if pos == 0 and not in_kit:
        return None, 'no kit evidence'
    score = min(pos, 5) * 1.0 - neg * 2.5
    score += 2.0 if in_kit else 0
    score += 1 if src != 'search' else 0
    if active:
        score += (y - max(y0, y1 - 8)) * 0.4       # recent photos preferred for current players
    if dep == {qid}:
        score += 1.5
    if '(cropped)' in file.lower() or 'portrait' in text:
        score += 2.0      # crops made by Commons editors are usually a tight, single-player face
    return {'score': score, 'date': date, 'year': y, 'license': lic, 'licenseUrl': val('LicenseUrl'),
            'artist': val('Artist') or 'Unknown', 'descriptionurl': ii.get('descriptionurl', ''),
            'thumburl': ii.get('thumburl') or ii.get('url'), 'url': ii.get('url'), 'width': ii.get('width'),
            'height': ii.get('height'), 'src': src, 'text': text}, None


def upload_url(u, width=None):
    if not u:
        return None
    u = u.split('?')[0].replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
    if width and '/thumb/' in u:
        u = re.sub(r'/\d+px-([^/]+)$', rf'/{width}px-\1', u)
    return u if u.startswith('https://upload.wikimedia.org/wikipedia/commons/') else None


def fetch_image(net, c, width):
    """Image at a standard thumb bucket (or the original if it is smaller)."""
    if width >= c['width']:
        urls = [upload_url(c['url'])]
    else:
        urls = [upload_url(c['thumburl'], width), upload_url(c['url']) if c['width'] <= 2600 else None]
    for u in urls:
        raw = u and net.get(u, binary=True)
        if raw:
            try:
                return ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
            except Exception:
                continue
    return None


# ---------------------------------------------------------------- faces
class Faces:
    def __init__(self, yunet, sface):
        self.det = cv2.FaceDetectorYN.create(yunet, '', (320, 320), 0.75, 0.3, 5000)
        self.rec = cv2.FaceRecognizerSF.create(sface, '')

    def detect(self, img):
        a = cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)
        h, w = a.shape[:2]
        s = min(1.0, 1600 / max(w, h))
        if s < 1:
            a = cv2.resize(a, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA)
        self.det.setInputSize((a.shape[1], a.shape[0]))
        _, f = self.det.detect(a)
        out = []
        for row in (f if f is not None else []):
            r = row.copy()
            r[:14] /= s
            out.append(r)
        return out, cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR)

    def embed(self, bgr, face):
        return self.rec.feature(self.rec.alignCrop(bgr, face))

    def sim(self, e1, e2):
        return float(self.rec.match(e1, e2, cv2.FaceRecognizerSF_FR_COSINE))


def yaw(face):
    rex, rey, lex, ley, nx, ny = face[4:10]
    ed = max(1.0, np.hypot(lex - rex, ley - rey))
    return float((nx - (rex + lex) / 2) / ed), float(ed / face[2])


def sharpness(img, face):
    x, y, w, h = [float(v) for v in face[:4]]
    g = img.crop((round(x), round(y), round(x + w), round(y + h))).convert('L').resize((128, 128), Image.BILINEAR)
    a = np.asarray(g, dtype=np.float32)
    lap = a[1:-1, 1:-1] * 4 - a[:-2, 1:-1] - a[2:, 1:-1] - a[1:-1, :-2] - a[1:-1, 2:]
    return float(lap.var())


def crop_box(img, face):
    fx, fy, fw, fh = [float(v) for v in face[:4]]
    cw = fw / FACE_FRAC
    ch = cw * 1.25
    return fx + fw / 2 - cw / 2, fy + fh / 2 - 0.40 * ch, cw, ch


def portrait_crop(img, face):
    """4:5 crop centred on the face (face = FACE_FRAC of the width, centre 40%
    from the top); where it runs past the photo edge a blurred edge fill is used."""
    iw, ih = img.size
    left, top, cw, ch = crop_box(img, face)
    pad = int(max(0, -left, -top, left + cw - iw, top + ch - ih)) + 2
    if pad > 2:
        a = np.pad(np.asarray(img), ((pad, pad), (pad, pad), (0, 0)), mode='edge')
        big = Image.fromarray(a).filter(ImageFilter.GaussianBlur(max(6, pad // 6)))
        big.paste(img, (pad, pad))
        img, left, top = big, left + pad, top + pad
    return img.crop((round(left), round(top), round(left + cw), round(top + ch))).resize((W, H), Image.LANCZOS)


class Scene:
    """Optional Apple Vision scene classifier (suit / necktie vs sport)."""

    def __init__(self, cache):
        self.bin = None
        if shutil.which('swiftc'):
            src = os.path.join(cache, 'vision_scene.swift')
            exe = os.path.join(cache, 'vision_scene_' + hashlib.sha1(SWIFT_SRC.encode()).hexdigest()[:8])
            if not os.path.exists(exe):
                open(src, 'w').write(SWIFT_SRC)
                if subprocess.run(['swiftc', '-O', src, '-o', exe], capture_output=True).returncode != 0:
                    exe = None
            self.bin = exe

    def labels(self, path):
        if not self.bin:
            return {}
        try:
            r = subprocess.run([self.bin, path], capture_output=True, timeout=120)
            return json.loads(r.stdout or b'{}').get(path, {})
        except Exception:
            return {}


def lab(labels, *keys):
    return max([labels.get(k, 0.0) for k in keys] + [0.0])


# ---------------------------------------------------------------- riso (identical to fetch-player-photos.py)
def vignette():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    cy = H * 0.44
    rx = W * (0.40 + 0.06 * np.clip((y - cy) / (H - cy), 0, 1))
    nx = (x - W / 2) / rx
    ny = np.where(y < cy, (y - cy) / (H * 0.44), 0.0)
    d = np.sqrt(nx * nx + ny * ny)
    v = np.clip((1.0 - d) / 0.34, 0, 1)
    return v * v * (3 - 2 * v)


def screen(dark, angle_deg, cell):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.deg2rad(angle_deg)
    u = x * np.cos(a) + y * np.sin(a)
    v = -x * np.sin(a) + y * np.cos(a)
    fu = (u / cell) % 1.0 - 0.5
    fv = (v / cell) % 1.0 - 0.5
    dist = np.sqrt(fu * fu + fv * fv) * cell
    r = np.sqrt(np.clip(dark, 0, 1) / np.pi) * cell * 1.13
    return np.clip(r - dist + 0.5, 0, 1)


def riso(img):
    g = ImageOps.grayscale(img)
    g = ImageOps.autocontrast(g, cutoff=2)
    g = g.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
    L = np.asarray(g, dtype=np.float32) / 255.0
    dark = 1.0 - L
    Ls = np.asarray(g.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32) / 255.0
    ink = screen(np.clip((dark - 0.42) / 0.5, 0, 1), 45, 4.0)
    solid = np.clip((0.2 - Ls) / 0.08, 0, 1)
    local = np.asarray(g.filter(ImageFilter.GaussianBlur(5)), dtype=np.float32) / 255.0
    lines = np.clip(((local - Ls) - 0.07) / 0.08, 0, 1) * np.clip((0.75 - Ls) / 0.2, 0, 1)
    ink = np.maximum(ink, np.maximum(solid, lines))
    tone = screen(np.clip((dark - 0.25) / 0.55, 0, 1) * 0.7, 15, 4.0)
    vig = vignette()
    return ink * vig, tone * vig


def save_mask(alpha, path):
    a = (np.clip(alpha, 0, 1) * 255).astype(np.int32)
    a = ((a + 8) // 17 * 17).clip(0, 255).astype(np.uint8)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., 3] = a
    Image.fromarray(rgba, 'RGBA').save(path + '.tmp', 'WEBP', lossless=True, quality=100, method=6, exact=False)
    os.replace(path + '.tmp', path)     # atomic: the dev server never sees a half-written mask


def riso_cell(slug):
    cell = np.full((H, W, 3), (0xff, 0xf1, 0xd3), np.float32)
    for layer, col in (('tone', (0xe9, 0x79, 0x8b)), ('ink', (0x1f, 0x3d, 0x36))):
        m = np.asarray(Image.open(os.path.join(OUT_DIR, f'{slug}-{layer}.webp')).getchannel('A'),
                       dtype=np.float32)[..., None] / 255.0
        cell = cell * (1 - m) + cell * (np.array(col, np.float32) / 255.0) * m
    return Image.fromarray(cell.astype(np.uint8))


def contact_sheet(manifest, crops_dir, path, cols=4):
    """Labelled sheet: for every accepted player the colour source crop next
    to the riso print, with name, date and license under each pair."""
    names = list(manifest)
    if not names:
        return
    cw, ch, lh = W // 2, H // 2, 34
    pw = cw * 2 + 8
    rows = (len(names) + cols - 1) // cols
    out = Image.new('RGB', (cols * pw, rows * (ch + lh)), (0xff, 0xf1, 0xd3))
    d = ImageDraw.Draw(out)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 12)
    except Exception:
        font = None
    for i, n in enumerate(names):
        e = manifest[n]
        ox, oy = (i % cols) * pw, (i // cols) * (ch + lh)
        src = os.path.join(crops_dir, e['slug'] + '.jpg')
        if os.path.exists(src):
            out.paste(Image.open(src).convert('RGB').resize((cw, ch), Image.LANCZOS), (ox, oy))
        out.paste(riso_cell(e['slug']).resize((cw, ch), Image.LANCZOS), (ox + cw, oy))
        d.text((ox + 3, oy + ch + 3), n, fill=(0x1f, 0x3d, 0x36), font=font)
        d.text((ox + 3, oy + ch + 17), f'{e["date"]}  {e["license"]}', fill=(0x6a, 0x5a, 0x4a), font=font)
    out.save(path)


# ---------------------------------------------------------------- main
def reference(net, faces, infobox, cands_by_file):
    """Face embedding of the player from her Wikipedia infobox photo."""
    if not infobox:
        return []
    c = cands_by_file.get(infobox)
    if not c:
        info = imageinfo(net, [infobox]).get(infobox)
        if not info:
            return []
        c = {'url': info.get('url'), 'thumburl': info.get('thumburl'), 'width': info.get('width', 0)}
    img = fetch_image(net, c, 500)
    if img is None:
        return []
    fs, bgr = faces.detect(img)
    fs = sorted(fs, key=lambda f: f[2] * f[3], reverse=True)
    if fs and (len(fs) == 1 or fs[1][2] * fs[1][3] < 0.4 * fs[0][2] * fs[0][3]):
        return [faces.embed(bgr, fs[0])]
    return []


def evaluate(net, faces, scene, c, refs, tmp):
    """Full check of one candidate; returns (ok, info or reason)."""
    img = fetch_image(net, c, 500)       # small thumb first; a bigger one only when the face needs it
    if img is None:
        return False, 'download failed'
    fs, bgr = faces.detect(img)
    if not fs:
        return False, 'no face'
    if max(f[2] for f in fs) * c['width'] / img.size[0] < FACE_MIN:
        return False, 'face too small even at full size'
    top = max(f[2] for f in fs)
    if top < 100 and c['width'] > img.size[0] * 1.05:
        want = next((b for b in (960, 1280, 1920, 3840) if top * b / img.size[0] >= 105), 3840)
        big = fetch_image(net, c, want)
        if big is not None and big.size[0] > img.size[0] * 1.1:
            fs2, bgr2 = faces.detect(big)
            if fs2:
                img, fs, bgr = big, fs2, bgr2
    best, bsim = None, -1.0
    for f in fs:
        if f[2] < 32:
            continue
        s = max((faces.sim(faces.embed(bgr, f), r) for r in refs), default=None)
        if s is None:
            s = 0.5
        if s > bsim:
            best, bsim = f, s
    if best is None:
        return False, 'faces too small'
    if refs and bsim < ID_MIN:
        return False, f'face does not match infobox ({bsim:.2f})'
    if not refs and len([f for f in fs if f[2] > 0.5 * best[2]]) > 1:
        return False, 'several faces, no reference'
    left, top, cw, ch = crop_box(img, best)
    for f in fs:
        if f is best or f[2] < 0.35 * best[2]:
            continue
        fx, fy = f[0] + f[2] / 2, f[1] + f[3] / 2
        if left - f[2] * 0.3 < fx < left + cw + f[2] * 0.3 and top < fy < top + ch:
            return False, 'another face in the portrait'
    iw, ih = img.size
    over = max(-left, left + cw - iw, -top, top + ch - ih) / cw
    if over > 0.08:
        return False, f'face too near the photo edge ({over:.2f})'
    fw = float(best[2])
    if fw < FACE_MIN:
        return False, f'face too small ({fw:.0f}px, needs {FACE_MIN:.0f})'
    if best[14] < 0.85:
        return False, f'low face confidence {best[14]:.2f}'
    yw, eyes = yaw(best)
    if abs(yw) > YAW_MAX or eyes < 0.28:
        return False, f'face turned away (yaw {yw:.2f}, eyes {eyes:.2f})'
    sh = sharpness(img, best)
    if sh < SHARP_MIN:
        return False, f'face blurred (sharp {sh:.0f})'
    region = img.crop((max(0, round(left - cw * 0.25)), max(0, round(top)),
                       min(img.size[0], round(left + cw * 1.25)), min(img.size[1], round(top + ch * 1.6))))
    p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
    region.save(p, quality=90)
    labels = scene.labels(p)
    suit = lab(labels, 'suit', 'necktie', 'tuxedo', 'bow_tie', 'blazer')
    art = lab(labels, 'painting', 'drawing', 'illustration', 'sculpture', 'statue', 'screenshot', 'poster')
    if suit >= 0.3 or art >= 0.5:
        return False, f'suit {suit:.2f} / art {art:.2f}'
    return True, {'img': img, 'face': best, 'sim': bsim, 'sharp': sh, 'yaw': yw, 'fw': fw}


def write_manifest(manifest):
    out = {n: manifest[n] for n in PLAYERS if n in manifest}
    tmp = MANIFEST + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, MANIFEST)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', default=os.path.join(tempfile.gettempdir(), 'futbol-player-photos-women'))
    ap.add_argument('--cache', default='', help='shared response cache dir (default WORK/cache)')
    ap.add_argument('--only', default='')
    ap.add_argument('--debug', action='store_true')
    ap.add_argument('--tries', type=int, default=10)
    ap.add_argument('--sheet-only', action='store_true', help='just rebuild the contact sheet')
    args = ap.parse_args()
    crops_dir = os.path.join(args.work, 'crops')
    os.makedirs(crops_dir, exist_ok=True)
    sheet_path = os.path.join(args.work, 'sheet.png')
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    if args.sheet_only:
        contact_sheet(write_manifest(manifest), crops_dir, sheet_path)
        return

    net = Net(args.cache or os.path.join(args.work, 'cache'))
    faces = Faces(*ensure_models(args.work))
    scene = Scene(os.path.join(args.work, 'cache'))
    tmp = tempfile.mkdtemp(prefix='women-thumbs-')
    names = sorted(PLAYERS, key=lambda n: (n not in PRIORITY, PRIORITY.index(n) if n in PRIORITY else 0))
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        names = [n for n in names if n in keep]
    os.makedirs(OUT_DIR, exist_ok=True)
    dropped = {}

    def process(name, i, total):
        tag = f'[{i + 1}/{total}] {name}'
        slug = slugify(name)

        def reject(reason):
            dropped[name] = reason
            if manifest.pop(name, None) is not None:
                write_manifest(manifest)
                for layer in ('ink', 'tone'):
                    f = os.path.join(OUT_DIR, f'{slug}-{layer}.webp')
                    if os.path.exists(f):
                        os.remove(f)
            print(f'{tag}: DROP {reason}', flush=True)

        if name in DROP:
            reject(DROP[name])
            return
        s = resolve(net, name)
        if not s:
            reject('no Wikipedia article found')
            return
        article = s['title']
        base = re.sub(r'\s*\(.*\)$', '', article)
        infobox = commons_file((s.get('originalimage') or s.get('thumbnail') or {}).get('source'))
        files, cats = gather(net, name, article, infobox)
        if name in PICKS:
            files.setdefault(PICKS[name], 'pick')
        info = imageinfo_all(net, list(files)[:600])
        qid = s.get('wikibase_item')
        dep = depicts(net, [ii.get('pageid') for ii in info.values()])
        cands, why = [], {}
        for f, ii in info.items():
            m, r = meta_score(name, base, f, files.get(f, 'search'), ii, cats, qid,
                              dep.get(ii.get('pageid'), set()))
            if m:
                cands.append(dict(m, file=f))
            else:
                why[r] = why.get(r, 0) + 1
        refs = reference(net, faces, infobox, {c['file']: c for c in cands})
        if args.debug:
            print(f'   {article}: {len(files)} files, {len(cands)} cands, refs {len(refs)}, cats {cats}, '
                  f'meta rejects {why}', flush=True)
        if not cands:
            reject(f'no free in-career photo naming her ({len(files)} files)')
            return
        if name in PICKS:
            ranked = [c for c in cands if c['file'] == PICKS[name]]
        else:
            ranked = sorted([c for c in cands if c['file'] not in BLOCK], key=lambda c: c['score'], reverse=True)
        chosen = None
        for c in ranked[:args.tries]:
            ok, res = evaluate(net, faces, scene, c, refs, tmp)
            if not ok:
                if args.debug:
                    print(f'   - {c["file"]} ({c["date"]}, meta {c["score"]:.1f}): {res}', flush=True)
                continue
            chosen = (c, res)
            break
        if not chosen:
            reject('no in-kit photo with a big, sharp, frontal face that matches the infobox')
            return
        c, res = chosen
        crop = portrait_crop(res['img'], res['face'])
        crop.save(os.path.join(crops_dir, slug + '.jpg'), quality=90)
        ink, tone = riso(crop)
        save_mask(ink, os.path.join(OUT_DIR, f'{slug}-ink.webp'))
        save_mask(tone, os.path.join(OUT_DIR, f'{slug}-tone.webp'))
        manifest[name] = {
            'slug': slug, 'article': article, 'file': c['descriptionurl'], 'artist': c['artist'],
            'license': c['license'], 'licenseUrl': c['licenseUrl'], 'date': c['date'],
        }
        write_manifest(manifest)
        print(f'{tag}: OK {c["file"]} ({c["date"]}, {c["license"]}, face {res["fw"]:.0f}px, '
              f'id {res["sim"]:.2f}, sharp {res["sharp"]:.0f}, yaw {res["yaw"]:.2f})', flush=True)

    queue, deferred, i = list(names), {}, -1
    while queue:
        name = queue.pop(0)
        i += 1
        try:
            process(name, i, len(names))
        except NetFail as e:
            deferred[name] = deferred.get(name, 0) + 1
            print(f'[..] {name}: API kept failing ({e}); retry later', flush=True)
            if deferred[name] < 3:
                queue.append(name)
            else:
                dropped[name] = 'network failure'

    manifest = write_manifest(manifest)
    contact_sheet(manifest, crops_dir, sheet_path)
    shutil.rmtree(tmp, ignore_errors=True)
    print('\nrequests', net.requests)
    print('accepted', len(manifest), 'of', len(PLAYERS))
    for n, r in dropped.items():
        print('dropped', n, '-', r)


if __name__ == '__main__':
    main()
