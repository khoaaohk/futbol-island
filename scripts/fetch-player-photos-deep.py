#!/usr/bin/env python3
"""Deep re-audit for roster players that still have no photo (Sep 26 2026).

The earlier batches (fetch-player-photos*.py) looked at the en.wikipedia infobox
image, the player's Commons category + a few subcategories and a Commons text
search, then auto-accepted only files passing strict face thresholds. This
script widens the search and puts a human review step in front of every write.
See docs/player-photos/SOURCES.md for the source evaluation.

Search order per player (all Commons / Wikidata, freely licensed only):
  1. Wikidata item: P18 image, P373 Commons category, sitelinks.
  2. Commons structured data: haswbstatement:P180=<Q-id> (files that DEPICT the
     player, many not linked from any Wikipedia).
  3. The player's Commons category tree (P373 + name guesses), depth 2, ranked
     subcategories ("<Name> with <club>", "<Name> in 2018", national-team and
     match categories inside the player's tree).
  4. Commons full-text search on the name (+ aliases).
  5. Infobox images of up to 30 other-language Wikipedias (via sitelinks).
  6. Openverse (Flickr CC BY / BY-SA / CC0 / PDM), licence re-checked on the
     Flickr page itself; Commons mirrors are preferred when the same photo is
     there.

Stages (all cached by sha1(url) in WORK/cache; re-runs cost no requests):
  --stage discover   candidates + metadata -> WORK/disc/<slug>.json
  --stage evaluate   downloads the best-scored candidates, face detect +
                     identity (SFace vs every infobox face found) + in-kit
                     scene check -> WORK/eval/<slug>.json, crops, and the
                     contact sheets WORK/review-<batch>-<n>.png
  --stage apply      writes masks + manifest entries for PICKS only (the
                     hand-reviewed allowlist below). Nothing is written to the
                     app without a PICKS entry.

Network rule (project, Sep 2026): ONE runner, never parallel. The user approved
1.5 s on Sep 26 2026, but that drew 429s, so the gap is back to 4 s for every
Wikimedia host (same gap for Openverse / Flickr). KOGL-only files are never
used (license_ok accepts CC0 / PD / CC BY / CC BY-SA only), and files still
waiting for Commons licence review are refused.
Authenticated mode (Sep 26 2026): with WIKIMEDIA_TOKEN (environment or the
gitignored .env.local; an owner-only OAuth 2.0 token, 5000 req/h) every request
to the Wikimedia API hosts (*.wikipedia.org, commons, wikidata, api.wikimedia.org)
carries `Authorization: Bearer ...` and is paced at ~1 req/s; upload.wikimedia.org
(no token) at 1 per 2 s; Openverse / Flickr never see the token. The token is
never printed, logged or cached (the cache key is the URL only). On a 429: honour Retry-After, pause at
least 5 minutes, double the gap; three 429s within an hour stop the run. 5xx
backs off 20 s doubling. Generic User-Agent, no personal contact. The throttle is shared across processes through a lock file, so
ad-hoc probes (`--probe URL`) queue behind the runner instead of adding load.
"""
import argparse
import fcntl
import hashlib
import html
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

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def _load(fn, name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, fn))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


B = _load('fetch-player-photos-backup.py', 'pp_backup')
S, LEG, FUT, WOM = B.S, B.LEG, B.FUT, B.WOM

UA = 'FutbolIslandPhotoBot/1.0 (educational kids app)'
GAP = 8.0          # anonymous: one runner, 1 request / 8 s on every Wikimedia host (1.5 s / 4 s drew 429s)
GAP_AUTH = 1.0     # with WIKIMEDIA_TOKEN (OAuth 2.0, 5000 req/h): ~1 req/s on the API hosts
GAP_UPLOAD = 8.0   # upload.wikimedia.org (never sent the token): own throttle, 1 download / 8 s
AUTH_HOST = re.compile(r'(^|\.)(wikipedia\.org|wikidata\.org)$|^(commons|api)\.wikimedia\.org$')


def _token():
    """WIKIMEDIA_TOKEN from the environment or .env.local. Never printed, logged or cached."""
    t = os.environ.get('WIKIMEDIA_TOKEN')
    if not t:
        try:
            for line in open(os.path.join(ROOT, '.env.local'), encoding='utf-8'):
                m = re.match(r'\s*WIKIMEDIA_TOKEN\s*=\s*(.+?)\s*$', line)
                if m:
                    t = m.group(1).strip().strip('"').strip("'")
        except OSError:
            pass
    return t or None


TOKEN = _token()
SKIP_FALLBACK_OFF = False   # True: always walk every fallback source
REFETCH_BIG = False         # one 960 px thumbnail per candidate (upload host is the bottleneck)
MAX_REFS = 2                # reference faces: en infobox + Wikidata P18 first
DEEP2 = False               # --deep2: every language edition, category depth 3, extra searches, no fallback skip
THROTTLE_FILE = os.path.join(tempfile.gettempdir(), 'futbol-wikimedia-throttle.lock')
OK_HOST = re.compile(r'(^|\.)(wikipedia\.org|wikimedia\.org|wikidata\.org|openverse\.org|flickr\.com|'
                     r'staticflickr\.com)$')
OTHER_LANGS = ['pt', 'es', 'it', 'fr', 'de', 'ru', 'ko', 'ja', 'nl', 'tr', 'ca', 'uk', 'pl', 'ar', 'fa', 'kk',
               'hr', 'sr', 'bg', 'ro', 'cs', 'sv', 'no', 'da', 'hu', 'el', 'he', 'id', 'eu', 'gl']
II = dict(prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=960,
          iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                              'DateTime|Categories|ImageDescription|ObjectName')

# Extra name spellings used on Commons / Flickr captions.
ALIASES = {
    'Son Heung-min': ['Heung-min Son', 'Son Heungmin', 'Heung-Min Son'], 'Kim Min-jae': ['Min-jae Kim', 'Kim Minjae'],
    'Frenkie de Jong': ['Frenkie De Jong'], 'Rafael Leão': ['Rafael Leao'], 'Arda Güler': ['Arda Guler'],
    'Kenan Yıldız': ['Kenan Yildiz'], 'Pervis Estupiñán': ['Pervis Estupinan'], 'İlkay Gündoğan': ['Ilkay Gundogan'],
    'Fermín López': ['Fermin Lopez'], 'Vozinha': ['Josimar Dias'], 'Lev Yashin': ['Lev Jasjin', 'Jaschin', 'Yachine'],
    'Kaká': ['Kaka', 'Ricardo Kaká'], 'Cafu': ['Marcos Evangelista de Morais'], 'Nílton Santos': ['Nilton Santos'],
    'Lilian Thuram': ['Thuram'], 'Hristo Stoichkov': ['Stoichkov', 'Stoitsjkov'], 'Zico': ['Arthur Antunes Coimbra'],
    'Claude Makélélé': ['Claude Makelele'], 'Juan Román Riquelme': ['Juan Roman Riquelme', 'Riquelme'],
    'Jay-Jay Okocha': ['Jay Jay Okocha', 'Augustine Okocha'], 'Eric Cantona': ['Éric Cantona'],
    'Gheorghe Hagi': ['Hagi'], 'Patri Guijarro': ['Patricia Guijarro'], 'Lindsey Heaps': ['Lindsey Horan'],
    'Ewa Pajor': [], 'Asisat Oshoala': [], 'Formiga': ['Miraildes Maciel Mota'], 'Sun Wen': [],
    'Homare Sawa': [], 'Salma Paralluelo': [], 'Marcelo': ['Marcelo Vieira'], 'Rivaldo': [],
}

# ---------------------------------------------------------------- review decisions
# PICKS: hand-reviewed allowlist from the contact sheets (WORK/review-*.png).
#   name -> (Commons file title | Flickr/Openverse id 'ov:<id>', face index in the sheet or None = best match)
# Every entry below was looked at by eye: right person, in kit, face visible.
PICKS = {
    # batch 1 (Sep 26 2026, review-legends-1.png; applied from cache, the legends script also carries these)
    'Kaká': ('Kaka of AC Milan, April 19, 2009.jpg', None),                    # Milan v Torino, 19 Apr 2009
    'Jordi Alba': ('Jordi Alba NE Revolution Inter Miami 7.9.25-047 (cropped).jpg', None),   # Inter Miami line-up
    # batch 2 (review-stars-1.png)
    'Gianluigi Donnarumma': ('Norway Italy - June 2025 B 33 - Gianluigi Donnarumma (close-up).jpg', None),  # Italy GK kit
    'Jordan Pickford': ('Jordan Pickford England v Ghana 23 June 2026-049.jpg', None),   # England GK kit, 2026 WC
    'Reece James': ('Reece James England v Ghana 23 June 2026-248.jpg', None),           # England No. 24, 2026 WC
    'Kim Min-jae': ('FC Red Bull Salzburg gegen Bayern München (2025-01-06 Testspiel) 26.jpg', None),  # Bayern warm-up
    # batch 3 (review-stars-1.png of chunk 1, evaluated from cache)
    'Cody Gakpo': ('Austria U-18 vs. Netherlands U-18 2017-03-23 (078).jpg', None),   # NL U18 warm-up top, depicts Gakpo only (Steindy)
    'Rodrigo De Paul': ('Rodrigo De Paul Argentina v Spain 19 July 2026-159.jpg', None),  # Argentina kit, 2026 WC
    # batch 4 (chunk1-review-stars-1.png)
    'Son Heung-min': ('Son Heung-min 2016.jpg', None),                  # Tottenham v CSKA, 2016, in action
    'Kaoru Mitoma': ('Kaoru Mitoma (2022).jpg', None),                  # Brighton v Espanyol pre-season 2022
    'Karim Adeyemi': ('FC RB Salzburg gegen SK Sturm Graz (24. Oktober 2021) 70.jpg', None),  # Salzburg kit, depicts Adeyemi
    'Vozinha': ('Vozinha Fifa World Cup 2026 Saudia Arabia vs Cabo Verde (cropped).jpg', None),  # Cape Verde GK kit
    'Kyle Walker': ('Kyle Walker 2021-12-07 1.jpg', None),             # Man City v Leipzig, UCL 2021
    # batch 5 (chunk2 sheets)
    'İlkay Gündoğan': ('2021-12-07 Fußball, Männer, UEFA Champions League, RB Leipzig - Manchester City FC 1DX 2686 by Stepro.jpg', None),
    'Stanley Matthews': ('Stanley Matthews 1962 (crop).jpg', None),   # striped playing shirt, 1962 (CC0, Anefo)
    'Marcelo': ('RealM-Shahter15 (7).jpg', None),                     # Real Madrid v Shakhtar, UCL 2015
    'Lilian Thuram': ('Lilian Thuram - 001.jpg', None),               # Barcelona training top on the pitch, 2008
    'Giacinto Facchetti': ('UEFA Euro 1968 Final - Italy v Yugoslavia - Ilija Petković and Giacinto Facchetti.jpg', 1),  # right: Italy
    # batch 6 (offline sheets of earlier evaluations)
    'Karim Benzema': ('Karim Benzema vs. FC Schalke 04 (16647992937).jpg', None),   # Real Madrid v Schalke, UCL 2015
    'Ryan Gravenberch': ('2022-07-30 Fußball, Männer, DFL-Supercup, RB Leipzig - FC Bayern München 1DX 3342 by Stepro (cropped).jpg', None),
    'Fermín López': ('Fermín López (cropped).jpg', None),   # re-reviewed: face clear in the crop, playing kit (stars BLOCK was for softness)
    'Zico': ('Coppa Italia 1983-84 - Triestina vs Udinese - Zico e Franco De Falco.jpg', 1),   # Udinese kit, left of De Falco
    # batch 7 (Sep 26 2026, new cards 389-400, photos3 review-legends-1.png / review-stars-1.png)
    'Ronald Koeman': ('Ronald Koeman 1983.jpg', None),                 # Netherlands shirt 1983; low SFace (young face) but named + depicts
    'Ricardo Quaresma': ('Ricardo Quaresma - Inter Mailand (1).jpg', None),   # Inter kit, 2009
    'Bastian Schweinsteiger': ('CINvCHI 2017-06-28 - Bastian Schweinsteiger (27329406048) (cropped).jpg', None),  # Chicago Fire kit
    'Wesley Sneijder': ('Wesley Sneijder (15487233555) (cropped).jpg', None),   # Netherlands training top, 2014
    'Ruud Gullit': ('GullitCruijffFeyenoord1983.jpg', None),           # Feyenoord training top 1983 (the face with dreadlocks, not Cruyff)
    'Peter Crouch': ('Crouch2.jpg', None),                             # Stoke City kit, 2012
    'Freddie Ljungberg': ('Fredrik Ljungberg 2006.jpg', None),         # Sweden kit, 2006
    'Robin van Persie': ('Van Persie (15300483040) (crop).jpg', None), # Netherlands training top, 2014
    'James Rodríguez': ('James Rodríguez (cropped).jpg', None),        # Colombia kit, 2014 World Cup
    # batch 8 (Sep 26 night, deep audit chunk1 legends sheet)
    'Rui Costa': ('Rui Costa.jpg', None),     # Benfica v Naval, 15 Sep 2007, after scoring
    'Michael Owen': ('Owen4.jpg', None),      # Stoke City at Chelsea, 22 Sep 2012
    'Lindsey Heaps': ('Lindsey Heaps USWNT vs Italy Nov 28 2025-047 (cropped).jpg', None),   # USWNT match-day jacket
    'Salma Paralluelo': ('Brann - Barça Femení CG3A6300.jpg', None),   # Barça kit, UWCL 2024
    'Alessia Russo': ('Lewes FC Women 1 Manchester Utd Women 3 FAC QF 19 03 2023-2174 (52760249433).jpg', None),  # Man Utd, 2023
    'Ewa Pajor': ("2018 Women's DFB-Pokal Final - Ewa Pajor (Wolfsburg) (cropped).jpg", None),   # Wolfsburg, cup final 2018
    'Temwa Chawinga': ('NC Courage vs KC Current (Sep 2024) 007 (cropped).jpg', None),   # KC Current pre-game bib, depicts her
    'Asisat Oshoala': ('Asisat Oshoala 2019 Champions League.jpg', None),   # Barça, UWCL final 2019
    'Homare Sawa': ('Homare Sawa 2015 (cropped).jpg', None),   # Japan kit, 2015 Women's World Cup
    'Catela': ('Encontro amistoso de fútbol sala masculino España - Hungría na Malata 44.jpg', None),   # Spain futsal kit (P18)
    'Dídac Plana': ('Encontro amistoso de fútbol sala masculino España - Hungría na Malata 84.jpg', None),  # Spain GK kit (P18)
    'Sid Belhaj': ('Sid Belhaj 2015.jpeg', None),   # KB United kit, French futsal play-off 2015 (named file)
    # retry pass (candidates 3-4)
    'Bradley Barcola': ('Bradley Barcola France v Spain 7.24.26-112 (cropped).jpg', None),   # France kit, 2026 WC (P18)
    'Pervis Estupiñán': ('Pervis Estupiñán 2015.jpg', None),   # LDU Quito kit 2015 (Agencia ANDES)
    'Nílton Santos': ('Nilton Santos 2 (1956).tif', None),     # Botafogo kit 1956 (Correio da Manhã archive, PD)
    'Juan Román Riquelme': ('Riquelme 2009.jpg', None),   # Boca Juniors training kit, 2009 (eyes lowered)
    'Patri Guijarro': ("2019-05-17 Fußball, Frauen, UEFA Women's Champions League, Olympique Lyonnais - FC Barcelona StP 0899 LR10 by Stepro (cropped).jpg", None),
    'Lucy Bronze': ("2019-05-18 Fußball, Frauen, UEFA Women's Champions League, Olympique Lyonnais - FC Barcelona StP 1015 LR10 by Stepro.jpg", None),  # Lyon kit
    'Chloe Kelly': ('Chloe Kelly Eng Women 0 Czech Rep 0 11 10 2022-317 (cropped).jpg', None),   # England match-day jacket
    'Christine Sinclair': ('Christine Sinclair 2013-05-04 Spirit - Thorns-2.jpg', None),   # Portland Thorns warm-up, pitch
    'Nadine Angerer': ('Nadine Angerer, Euro 2013.jpg', None),   # Germany GK kit, Euro 2013
    'Leonardo Bonucci': ('Leonardo Bonucci and Cesc Fàbregas Euro 2012 final.jpg', 1),   # Italy kit, Euro 2012 final (right)
    # user-chosen (Sep 27 2026): en.wikipedia lead image; Turkey kit, 2025. Auto-failed only on sharpness (21 < 40).
    'Arda Güler': ('Arda Güler 2025.jpg', None),
    # user-flagged (Sep 27 2026): every en/pt article image reviewed; Milan pre-match jacket in the stadium at
    # Salzburg v Milan (UCL, 6 Sep 2022), frontal, the Wikidata P18 image. (Lille 2018 shot is indoors; the rest are
    # small/turned action faces, a press conference or off-duty.)
    'Rafael Leão': ('LeaoFCSalzburg2022(cropped).jpg', None),
    # lead-image audit (Sep 27 2026): en.wikipedia lead, Inter away kit v Egnatia 2023; profile + soft (313 px original),
    # auto-rejected only as "small". Same call as the user's Güler pick.
    'Denzel Dumfries': ('Edison ndreca inter egnati (cropped Denzel Dumfries).jpg', None),
    # lead-image audit: Italy futsal kit on court at his 100th-cap presentation (Divisione Calcio a 5, CC BY-SA 4.0);
    # the scene classifier saw the officials' suits. Face 1 = Merlim (centre).
    'Alex Merlim': ('Alex Merlim 2021.png', 1),
    # deep2 (all language editions, category depth 3, 330 px screening)
    'Patrick Vieira': ('Patrick Vieira - Inter Mailand (1).jpg', 's0'),   # Inter kit, pre-season 16 Aug 2009
    'Clarence Seedorf': ('Seedorf 4 wikicommons.jpg', 's0'),   # AC Milan No. 10, 17 Dec 2011
    'Jamie Carragher': ('Abhisith Vejjajiva - Worawi Makudi - Jamie Carragher.jpg', 's3'),  # Liverpool kit + armband, Thailand tour 2009
    'Mia Hamm': ('Mia Hamm 1995 001 stl.jpg', 's0', 1920),   # USA No. 9 taking a corner, 1995 (photographer's own upload)
    'Cafu': ('Cafu.JPG', 's0'),                             # Brazil training jacket on the pitch, June 2006
    # approved by the user (Sep 27 2026) despite the house licence filter / in-kit rule; credit as each file page asks
    'Kenan Yıldız': ('Kenan Yıldız in the international match (March 2025) (cropped).jpg', 1),   # Turkey v Hungary, right
    'Gary Lineker': ("Prime Minister Keir Starmer hosts St George's Day Reception (54470857860) (cropped).jpg", None),
}
# User-approved licences outside CC0 / PD / CC BY / CC BY-SA, with the exact credit line the file page requires.
APPROVED_CREDIT = {
    'Kenan Yıldız': {'artist': 'mlsz.hu – Hungarian Football Federation (derivative: Danyele)',
                     'license': 'Attribution only (mlsz.hu – Hungarian Football Federation)',
                     'licenseUrl': 'https://en.mlsz.hu/imprint'},
    'Gary Lineker': {'artist': 'Lauren Hurley / No 10 Downing Street. Contains public sector information licensed under '
                               'the Open Government Licence v3.0',
                     'license': 'OGL v3.0',
                     'licenseUrl': 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'},
}
# Files seen on the sheets and rejected (wrong person, suit, blurred ...).
BLOCK = {
    'BFA 2023 -2 Heung-Min Son (cropped).jpg', 'BFA 2023 -2 Heung-Min Son.jpg',   # award ceremony, not kit
    'BFA Son Heung Min 2014.jpg', 'BFA 2015 Son Heung-min.jpeg',
    'Norway Italy - June 2025 A',  # (prefix note) Donnarumma in a white track top in the stands
    'Cody Gakpo 06042025 (1) (cropped).jpg', 'Cody Gakpo 06042025 (1).jpg',   # arrival: earbuds, looking down
    'Bradley Barcola France v Norway 26 June 26-033 (cropped).jpg',   # zipped jacket + earphones: arrival, not kit
    "Pervis Estupinan Cote D'Ivoire v Ecuador 14 June 2026-73.jpg",   # plain white jacket, no kit visible
    'Абакшин Даниил Андреевич.jpg',     # post-match interview board (press)
    'Raúl Gómez Pato, Catoira, 2020.jpg', 'Raúl Gómez Pato, Mar de Arousa, 2020.jpg',   # civilian, likely a namesake
    'João Pedro.jpg',                   # a Timor-Leste João Pedro, not the Brazil / Chelsea forward
    'FC Red Bull Salzburg gegen CF Barcelona (Testspiel 4. August 2021) 34.jpg',   # de Jong: face too soft
    'Jamie Carragher 2005.jpg',         # off-pitch event (jacket, papers)
    'Ian Rush en Terry Yorath.jpg',     # airport arrival with Yorath (suit), not playing
    'Raúl Gómez González.jpg', 'Raúl Gómez Samperio 2017.jpg',   # namesakes (a bishop, a fan)
    'Sergio COPA EUROAMERICANA (18165383332) (cropped).jpg', 'Sergio COPA EUROAMERICANA (18165383332).jpg',   # press conference (and likely the Espanyol coach namesake)
    'RafaelLeaoOff2023.png', 'RafaelLeaoOff20235.png',   # off-duty by a van (training jacket), not playing
    'Clarence Seedorf Emirates Cup 2010.jpg',   # head down, face in shadow
    'Fighter Seacraft- Motor Torpedo Boats, England, UK, 1943 D12556.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    '6-5-28 (stade de) Colombes (finale de la) coupe de France (de football), équipe du CAP (de gauche à droite devant, Georges) Ouvray, L(ucien) Laurent (Pierre) Bertrand (Marcel) Langillier (Roland) Mahieu... - btv1b53200707j.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    '(Stade) Buffalo, 14-10-28 (football) association (équipe du) C.A.P. (de gauche à droite, devant) Ouvray, L(ucien) Laurent, Bertrand, Quentier, Langillier (derrière) J(ean) Laurent, Colomb, Ganteroux, Blanc... - btv1b532048937.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    '(Stade) Buffalo, 15-3-28 (football) association, équipe du CAP (de g. à d. , debout) Blanc, Gauteroux, Fidon, Bertrand, Ottavis, Mahieu (et, accroupis) Ouvray, L. Laurent, Quentier, Langillier, J. Laurent -... - btv1b531965990.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    'Pippo Inzaghi.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    'Brocchi Inzaghi.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    'Milan Liverpool 2007.png',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    'ACMilan tifoseria.jpg',   # deep2 screen: namesake / 1920s-40s archive or suit on the bench
    'Frenkie De Jong (2025)2 (cropped).png',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Netherlands v Tunisia 2026 World Cup - 55374501166.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Netherlands v Tunisia 2026 World Cup - 55374632348.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Netherlands v Tunisia 2026 World Cup - 55374687329.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Frenkie De Jong (2025)2.png',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'East Timor-Brunei 8 October 2024 26.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'East Timor-Brunei 8 October 2024 50.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'João Pedro 11 PFC Cherno More 20250731 (3).jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Kenan Yıldız.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Marcos Evangelista de Moraes (Cafu) 01.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Lev Jascin en 1966.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Jorge Campos 1994 Jersey at MAD Paris.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Rivaldo e Juninho Pernambucano.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Alan Shearer 1998.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Alan Shearer 1998 (2).jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Kenny dalglish figurita (cropped).jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Laudrup.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Joe Cole vs Arsenal.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Man U vs Chelsea ref.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Olarticoechea saving vs england.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'EK voetbal in West Duitsland Engeland tegen Nederland 1-3, Bestanddeelnr 934-2662.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Keith and Rushie.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Guy Roux-AJ Auxerre (cropped).jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Aime Jacquet.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Filippo Inzaghi.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'A.C. Milan lifting the European Cup after winning the 2002–03 UEFA Champions League - 20030528.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'AC Milan players 2008 09.jpg',   # deep2 screen (Sep 27): not usable on review (namesake, suit/civilian, sticker, team group or collage)
    'Lev Yashin 1960d.jpg',   # in kit (1960 training) but the face is a grainy smudge on the card: drawn art reads better
    'De jong Frenkie.jpg',       # "own work" upload of what looks like an agency pitchside shot (2021-22 kit, 2024 upload,
                                 # inset face in the corner): provenance doubtful, not used
    'Joao Pedro holder Chelsea drakt 2025.jpg',   # signing photo, black T-shirt, holding the shirt
    'Lev Yashin 1966.jpg',       # Panini sticker scan
    'Frenkie De Jong (2025) (cropped).png',   # suit and tie; "unknown author"
    'Wambach boxx rampone lilly.jpg',   # Lilly holding a child, other faces in the crop
    'Фаренюк Артём Николаевич.jpg',     # post-match interview board (press), not playing
    'Christine Sinclair warming up.jpg',   # grimace, head down in the crop
    'Laurent Blanc.jpg',             # coaching at Bordeaux (cap, sunglasses), not playing
    "2019-05-17 Fußball, Frauen, UEFA Women's Champions League, Olympique Lyonnais - FC Barcelona StP 0886 LR10 by Stepro.jpg",  # face tipped up
    "Phil Neville & Lucy Bronze (Women's World Cup 2019).jpg",   # face too pixelated in the crop
    'Chloe Kelly Arsenal Ladies Vs Watford (19781588720).jpg',   # looking down, soft
    'Kenny dalglish figurita.jpg',
    'U.S. Army Sgt. Carlos Ortiz, left, and Spc. Eleanor Dunes, both cargo specialists assigned to the 390th Seaport Operations Company, based out of Ceiba, Puerto Rico, work together to plug a hole in the damage 130801-A-GT254-005.jpg',  # a different Carlos Ortiz   # sticker scan (house rule: no sticker/card scans)
    'Gheorghe Hagi.JPG',             # undated, grey-haired: veterans / legends match, not his playing era
    'Jj okocha.jpg',                 # held: "CC0, unknown author" for a 1996 press-style photo, provenance unverified
    'João Pedro 11 PFC Cherno More 20250731 (1).jpg', 'João Pedro 11 PFC Cherno More 20250731 (2).jpg',  # a different João Pedro
    'Ian Rush, Wales Team, 1988 (1).jpg',        # tracksuit off the pitch (arrival), not kit
    'Laurent Blanc 23.jpg',                      # Bordeaux staff polo: his coaching years
    'David Beckham of AC Milan, April 19, 2009.jpg',   # the matched face is not Inzaghi
    'Filippo Inzaghi 2011.jpg',                  # coat and scarf, not kit
}


# ---------------------------------------------------------------- network
class NetFail(Exception):
    pass


class Net:
    """sha1(url) response cache + one shared, cross-process throttle."""
    gap = GAP          # doubled after every 429 (never eased back automatically)
    slow = 1.0         # authenticated pacing multiplier, doubled after every 429
    clean = 0
    hits429 = []
    shown429 = False

    def __init__(self, cache, extra=()):
        self.cache = cache
        self.extra = [d for d in extra if d and os.path.isdir(d)]
        self.requests = 0
        os.makedirs(cache, exist_ok=True)

    def _cached(self, path):
        for p in [path] + [os.path.join(d, os.path.basename(path)) for d in self.extra]:
            if os.path.exists(p):
                return open(p, 'rb').read()
        return None

    @staticmethod
    def _gap(host):
        if TOKEN is None:
            return GAP_UPLOAD if host == 'upload.wikimedia.org' else Net.gap
        base = GAP_UPLOAD if host == 'upload.wikimedia.org' else GAP_AUTH if AUTH_HOST.search(host) else GAP
        return base * Net.slow

    @staticmethod
    def _lane(host):
        return 'upload' if host == 'upload.wikimedia.org' else 'api'

    @staticmethod
    def _slot(gap, lane='api'):
        with open(THROTTLE_FILE + ('' if lane == 'api' else '.' + lane), 'a+') as fh:
            fcntl.flock(fh, fcntl.LOCK_EX)
            fh.seek(0)
            try:
                last = float(fh.read().strip() or 0)
            except ValueError:
                last = 0.0
            wait = last + gap - time.time()
            if wait > 0:
                time.sleep(wait)
            fh.seek(0)
            fh.truncate()
            fh.write(repr(time.time()))
            fh.flush()
            fcntl.flock(fh, fcntl.LOCK_UN)

    def get(self, url, binary=False, cache=True):
        key = hashlib.sha1(url.encode()).hexdigest()
        path = os.path.join(self.cache, key + ('.bin' if binary else '.txt'))
        data = self._cached(path) if cache else None
        if data is not None:
            if data == b'__404__':
                return None
            return data if binary else data.decode('utf-8', 'replace')
        host = urllib.parse.urlparse(url).netloc
        assert OK_HOST.search(host), host
        delay = 20.0
        for _ in range(8):
            self._slot(self._gap(host), self._lane(host))
            self.requests += 1
            headers = {'User-Agent': UA, 'Accept-Encoding': 'identity'}
            if TOKEN and AUTH_HOST.search(host):
                headers['Authorization'] = 'Bearer ' + TOKEN      # API hosts only; never logged
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=40) as r:
                    data = r.read()
                open(path, 'wb').write(data)
                Net.clean += 1
                return data if binary else data.decode('utf-8', 'replace')
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    open(path, 'wb').write(b'__404__')
                    return None
                if e.code == 429:
                    # policy: honour Retry-After, pause >= 5 min, halve the rate; 3 x 429 in an hour -> stop
                    now = time.time()
                    hp = THROTTLE_FILE + '.429-' + self._lane(host)   # per lane, shared across processes
                    try:
                        Net.hits429 = [float(x) for x in open(hp).read().split()]
                    except (OSError, ValueError):
                        pass
                    Net.hits429 = [t for t in Net.hits429 if now - t < 3600] + [now]
                    open(hp, 'w').write(' '.join(repr(t) for t in Net.hits429))
                    Net.gap, Net.clean = min(Net.gap * 2, 16.0), 0
                    if self._lane(host) == 'api':
                        Net.slow = min(Net.slow * 2, 16.0)
                    else:
                        globals()['GAP_UPLOAD'] = min(GAP_UPLOAD * 2, 30.0)
                    if not Net.shown429:
                        Net.shown429 = True
                        try:
                            print('   429 body:', e.read()[:300], file=sys.stderr, flush=True)
                        except Exception:
                            pass
                    if len(Net.hits429) >= 3:
                        # first trip of the session: pause >= 60 min, then resume slower (9 s downloads);
                        # a second trip stops the run
                        tp = THROTTLE_FILE + '.trips-' + self._lane(host)
                        try:
                            trips = [float(x) for x in open(tp).read().split() if now - float(x) < 4 * 3600]
                        except (OSError, ValueError):
                            trips = []
                        if len(trips) >= 2:
                            # tripping every hour: stop (policy Sep 27 2026)
                            print(f'STOP: third 429 trip within 4 hours (last from {host}); stopping', flush=True)
                            raise SystemExit(3)
                        open(tp, 'w').write(' '.join(repr(x) for x in trips + [now]))
                        open(hp, 'w').write('')
                        Net.hits429 = []
                        if self._lane(host) == 'upload':
                            globals()['GAP_UPLOAD'] = min(GAP_UPLOAD * 1.5, 30.0)
                        else:
                            Net.slow = max(Net.slow, 2.0)
                        print(f'PAUSE: three HTTP 429s within an hour (last from {host}); pausing 60 min, then '
                              f'resuming at {self._gap(host):.0f} s', flush=True)
                        time.sleep(3660)
                        continue
                    ra = e.headers.get('Retry-After')
                    pause = max(300.0, float(ra) if ra and ra.isdigit() else 0)
                    print(f'   http 429 from {host}, backing off {pause:.0f}s, gap now {self._gap(host):.1f}s',
                          file=sys.stderr, flush=True)
                    time.sleep(pause)
                    continue
                if e.code >= 500:
                    print(f'   http {e.code} from {host}, backing off {delay:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(delay)
                    delay = min(delay * 2, 320)
                    continue
                print(f'   http {e.code} {url[:120]}', file=sys.stderr, flush=True)
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(delay)
                delay = min(delay * 2, 320)
        if 'upload.wikimedia.org' in host or 'flickr' in host:
            return None
        raise NetFail(url)

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


# ---------------------------------------------------------------- helpers
EXTRA_CAREER = {'Eric Cantona': (1983, 1997)}   # legends missing from fetch-player-photos.py CAREER
# Namesake traps: files must also carry one of these words (title / description / categories) to count.
REQUIRE_WORDS = {'Carlos Ortiz': ['futsal', 'futbol sala', 'fútbol sala'], 'Raúl Gómez': ['futsal', 'sala'],
                 'Sergio González': ['futsal', 'sala'], 'Edu': ['futsal'], 'Neto': ['futsal'], 'Pito': ['futsal'],
                 'Robinho': ['futsal'], 'Cardinal': ['futsal'], 'Wilde': ['futsal'], 'Higor': ['futsal'],
                 'Pauleta': ['futsal'], 'Schumacher': ['futsal'], 'Mamadou Touré': ['futsal'],   # an Ivorian minister
                 'Pablo Ramírez': ['futsal', 'sala'], 'Douglas Junior': ['futsal']}


def owner_window(name, owner):
    if name in EXTRA_CAREER:
        return EXTRA_CAREER[name]
    if owner == 'stars':
        return (2014, 2026)
    return B.window_of(name, owner)


def aliases_of(name, owner):
    out = list(S.ALIASES.get(name, [])) + list(ALIASES.get(name, [])) + list(LEG.ALIASES.get(name, []))
    if owner == 'women' and name in WOM.PLAYERS:
        out += WOM.PLAYERS[name][2]
    return [a for a in dict.fromkeys(out) if a and a != name]


def gen_files(net, **params):
    """generator query with imageinfo; returns {title: ii}."""
    out, cont = {}, {}
    for _ in range(params.pop('_pages', 2)):
        d = net.commons(**params, **II, **cont)
        S._collect(d, out)
        cont = d.get('continue') or {}
        cont.pop('continue', None)
        if not cont:
            break
    return out


def claim_vals(ent, prop):
    out = []
    for c in (ent.get('claims') or {}).get(prop, []):
        v = c.get('mainsnak', {}).get('datavalue', {}).get('value')
        if isinstance(v, dict) and v.get('id'):
            out.append(v['id'])
        elif isinstance(v, str):
            out.append(v)
    return out


SUB_BAD = S.SUBCAT_NEG + ['coach', 'manager', 'retire', 'after', 'legends', 'veteran', 'masters', 'signature']


def subcat_rank(sc, window, name_toks):
    scn = S.norm(sc)
    if any(w in scn for w in SUB_BAD):
        return None
    y = S.year_of(sc)
    if y and not (window[0] <= y <= window[1]):
        return None
    r = 0.0
    if y:
        r += 2
    if any(w in scn for w in (' with ', 'national', 'playing', 'match', 'team', ' fc', 'club', ' vs', ' v ',
                              'world cup', 'euro', 'cup', 'training', 'olympic', 'copa', 'league')):
        r += 2
    if re.search(r' by (year|season|club|team|date)', scn):
        r += 3
    if name_toks and S.has_all(name_toks, sc):
        r += 1
    return r


# ---------------------------------------------------------------- article body images
# Citizenship / sport-country Q-id -> the player's native-language Wikipedias (besides en).
COUNTRY_LANGS = {
    'Q155': ['pt'], 'Q45': ['pt'], 'Q1011': ['pt'], 'Q1007': ['pt'], 'Q29': ['es', 'ca'], 'Q414': ['es'],
    'Q96': ['es'], 'Q736': ['es'], 'Q77': ['es'], 'Q739': ['es'], 'Q298': ['es'], 'Q750': ['es'], 'Q717': ['es'],
    'Q733': ['es'], 'Q38': ['it'], 'Q142': ['fr'], 'Q183': ['de'], 'Q40': ['de'], 'Q39': ['de', 'fr', 'it'],
    'Q55': ['nl'], 'Q31': ['nl', 'fr'], 'Q884': ['ko'], 'Q17': ['ja'], 'Q34': ['sv'], 'Q43': ['tr'],
    'Q159': ['ru'], 'Q15180': ['ru'], 'Q212': ['uk', 'ru'], 'Q232': ['kk', 'ru'], 'Q794': ['fa'], 'Q219': ['bg'],
    'Q218': ['ro'], 'Q35': ['da'], 'Q148': ['zh'], 'Q36': ['pl'], 'Q224': ['hr'], 'Q20': ['no'], 'Q1028': ['fr', 'ar'],
    'Q262': ['fr', 'ar'], 'Q948': ['fr', 'ar'], 'Q1008': ['fr'], 'Q1041': ['fr'], 'Q16': ['fr'], 'Q215': ['sl'],
    'Q403': ['sr'], 'Q28': ['hu'], 'Q41': ['el'], 'Q213': ['cs'], 'Q214': ['sk'], 'Q33': ['fi'], 'Q37': ['lt'],
}
COUNTRY_NAME = {'Q155': 'Brazil', 'Q45': 'Portugal', 'Q29': 'Spain', 'Q414': 'Argentina', 'Q38': 'Italy', 'Q142': 'France',
                'Q183': 'Germany', 'Q55': 'Netherlands', 'Q145': 'England', 'Q21': 'England', 'Q22': 'Scotland',
                'Q35': 'Denmark', 'Q218': 'Romania', 'Q219': 'Bulgaria', 'Q1014': 'Liberia', 'Q1033': 'Nigeria',
                'Q96': 'Mexico', 'Q159': 'Russia', 'Q15180': 'Soviet Union', 'Q30': 'United States', 'Q148': 'China',
                'Q16': 'Canada', 'Q17': 'Japan', 'Q43': 'Turkey', 'Q232': 'Kazakhstan', 'Q212': 'Ukraine', 'Q794': 'Iran',
                'Q884': 'South Korea', 'Q1041': 'Senegal', 'Q1011': 'Cape Verde', 'Q1007': 'Guinea-Bissau',
                'Q262': 'Algeria', 'Q1028': 'Morocco', 'Q736': 'Ecuador', 'Q77': 'Uruguay', 'Q739': 'Colombia'}
SKIP_FILE = re.compile(r'\.(svg|gif|ogg|ogv|webm|oga|mp3|wav|mid|pdf|tif)$|logo|crest|badge|escudo|emblem|flag|'
                       r'bandera|bandeira|map\b|mapa|karte|signature|firma|assinatura|autograph|chart|graph|diagram|'
                       r'icon|symbol|kit[_ ]|trikot|camiseta|jersey|shirt|stadium|stadio|estadio|est[aá]dio|stade|'
                       r'arena|statue|estatua|museum|museo|trophy|trofeo|mural|plaque|stamp|banner|poster|coat[_ ]of',
                       re.I)


def body_images(net, lang, title):
    """[(file title, caption)] for every image in the article body (REST media-list, else prop=images)."""
    t = urllib.parse.quote(title.replace(' ', '_'), safe='')
    d = net.json(f'https://{lang}.wikipedia.org/api/rest_v1/page/media-list/{t}')
    out = []
    if d and isinstance(d.get('items'), list):
        for it in d['items']:
            if it.get('type') != 'image':
                continue
            f = (it.get('title') or '').split(':', 1)[-1].replace('_', ' ')
            if f and not SKIP_FILE.search(f):
                out.append((f, S.strip_html((it.get('caption') or {}).get('text', ''))))
        return out
    q = net.api(f'{lang}.wikipedia.org', action='query', prop='images', titles=title, imlimit='max', redirects=1)
    for p in q.get('query', {}).get('pages', {}).values():
        for im in p.get('images', []):
            f = im['title'].split(':', 1)[-1]
            if not SKIP_FILE.search(f):
                out.append((f, ''))
    return out


def body_langs(ident):
    langs = ['en']
    for q in ident.get('countries', []):
        langs += COUNTRY_LANGS.get(q, [])
    if ident.get('owner') == 'futsal':
        langs += ['pt', 'es', 'ru', 'it']
    sl = (ident.get('ent') or {}).get('sitelinks', {})
    if DEEP2:     # every Wikipedia language edition that has an article on the player
        langs += [k[:-4] for k in sl if re.match(r'^[a-z_]+wiki$', k) and k not in (
            'commonswiki', 'specieswiki', 'metawiki', 'wikidatawiki', 'mediawikiwiki', 'sourceswiki', 'incubatorwiki')]
    return [l for l in dict.fromkeys(langs) if f'{l}wiki' in sl or (l == 'en' and ident.get('article'))]


def body_sources(net, ident):
    """{file: (src tag, caption)} from the en + native-language article bodies."""
    sl = (ident.get('ent') or {}).get('sitelinks', {})
    out = {}
    for lang in body_langs(ident):
        title = sl.get(f'{lang}wiki') or (ident.get('article') if lang == 'en' else None)
        if not title:
            continue
        for f, cap in body_images(net, lang.replace('_', '-'), title):
            if f not in out:
                out[f] = (f'body-{lang}', cap)
            elif cap and not out[f][1]:
                out[f] = (out[f][0], cap)
    return out


# ---------------------------------------------------------------- discover
def discover_one(net, name, owner, ident, langimgs):
    qid, article, ent = ident.get('qid'), ident.get('article'), ident.get('ent') or {}
    window = owner_window(name, owner)
    als = aliases_of(name, owner)
    files = {}    # title -> dict(ii=..., src=set())

    def add(got, src, caption=''):
        for t, ii in got.items():
            if not re.search(r'\.(jpe?g|png|webp|tiff?)$', t, re.I):
                continue
            e = files.setdefault(t, {'ii': ii, 'src': []})
            if src not in e['src']:
                e['src'].append(src)
            if caption and not e.get('caption'):
                e['caption'] = caption

    # 0 + 1. every image in the article body (en + native language, with captions: FIRST source), plus
    #        Wikidata P18 and the infobox images, in one batched imageinfo pass (50 titles per call)
    body = body_sources(net, ident)
    infob = []
    for f in claim_vals(ent, 'P18'):
        infob.append((f.replace('_', ' '), 'wikidata-P18'))
    if ident.get('infobox'):
        infob.append((ident['infobox'], 'infobox-en'))
    for lang, f in langimgs:
        infob.append((f.replace('_', ' '), f'infobox-{lang}'))
    want = list(dict.fromkeys(list(body) + [f for f, _ in infob]))
    got = S.imageinfo(net, want) if want else {}       # Commons only: local (non-free) files drop out here
    for f, (src, cap) in body.items():
        if f in got:
            add({f: got[f]}, src, cap)
    for f, src in infob:
        if f in got:
            add({f: got[f]}, src)
    # a good captioned in-kit body photo already? then skip the fallbacks (fewer requests per player)
    probe = {'name': name, 'qid': qid, 'article': article, 'aliases': als, 'window': window}
    good = []
    for t, e in files.items():
        if not any(x.startswith('body-') for x in e['src']) or not e.get('caption'):
            continue
        c, _ = meta(probe, t, e, set())
        if c and c['score'] >= 6 and re.search(
                r'playing|on the ball|during|against|\bv\b|\bvs\b|match|training|warm|lining up|line-up|in action|'
                r'celebrat|jogando|jugando|contra|partido|partida|giocando|durante|spielt|joue', S.norm(c['caption'])):
            good.append(t)
    if len(good) >= 2 and not SKIP_FALLBACK_OFF and not DEEP2:
        return {'name': name, 'owner': owner, 'qid': qid, 'article': article, 'window': window, 'aliases': als,
                'cats': [], 'dep_files': [], 'files': files, 'fallbacks': 'skipped: captioned in-kit body photos',
                'good_body': good}
    # 2. depicts search
    dep_files = set()
    if qid:
        got = gen_files(net, action='query', generator='search', gsrsearch=f'haswbstatement:P180={qid}',
                        gsrnamespace=6, gsrlimit=50, _pages=3)
        add(got, 'depicts')
        dep_files = set(got)
    # 3. category tree
    cats = []
    p373 = claim_vals(ent, 'P373')
    guesses = [f'Category:{c}' for c in p373]
    if article:
        base = re.sub(r'\s*\(.*\)$', '', article)
        guesses += [f'Category:{article}', f'Category:{base} (footballer)', f'Category:{base} (futsal player)']
    guesses += [f'Category:{name}'] + [f'Category:{a}' for a in als[:2]]
    cats = S.existing_categories(net, list(dict.fromkeys(guesses))[:40])
    name_toks = S.tokens(name)
    queue = []
    budget = 60 if DEEP2 else 22
    for c in cats[:3]:
        add(S.files_with_info(net, c, max_pages=4), 'cat')
        budget -= 1
        for sc in S.members(net, c, 'subcat')[:200]:
            r = subcat_rank(sc, window, name_toks)
            if r is not None:
                queue.append((r, 1, sc))
        budget -= 1
    seen = set(cats)
    queue.sort(reverse=True)
    while queue and budget > 0:
        r, depth, sc = queue.pop(0)
        if sc in seen:
            continue
        seen.add(sc)
        add(S.files_with_info(net, sc, max_pages=2), 'subcat:' + sc.split(':', 1)[1])
        budget -= 1
        if depth < (3 if DEEP2 else 2) and (r >= 3 or DEEP2) and budget > 4:
            for ssc in S.members(net, sc, 'subcat')[:80]:
                rr = subcat_rank(ssc, window, name_toks)
                if rr is not None:
                    queue.append((rr + 0.5, depth + 1, ssc))
            budget -= 1
            queue.sort(reverse=True)
    # 4. text search
    terms = ' OR '.join(f'"{n}"' for n in [name] + als[:2])
    add(gen_files(net, action='query', generator='search', gsrsearch=terms + ' filetype:bitmap', gsrnamespace=6,
                  gsrlimit=50, _pages=2), 'search')
    if DEEP2:     # surname + club / national-team names
        sur = name.split()[-1] if len(name.split()) > 1 else name
        clubs = []
        if name in S.CLUBS:
            cur, _, nat, old = S.CLUBS[name]
            clubs += cur[:2] + old[:2] + [nat[0] + ' national']
        if owner == 'women' and name in WOM.PLAYERS:
            clubs += WOM.PLAYERS[name][3][:4]
        clubs += [COUNTRY_NAME[q] + ' national' for q in ident.get('countries', [])[:1] if q in COUNTRY_NAME]
        clubs += ['futsal'] if owner == 'futsal' else ['football match']
        for cl in list(dict.fromkeys(clubs))[:5]:
            add(gen_files(net, action='query', generator='search', gsrsearch=f'"{sur}" {cl} filetype:bitmap',
                          gsrnamespace=6, gsrlimit=50, _pages=1), 'search')
    return {'name': name, 'owner': owner, 'qid': qid, 'article': article, 'window': window, 'aliases': als,
            'cats': cats, 'dep_files': sorted(dep_files), 'files': files}


# ---------------------------------------------------------------- meta scoring
def meta(d, t, e, dep):
    name, qid = d['name'], d['qid']
    ii = e['ii']
    em = ii.get('extmetadata', {})
    val = lambda k: S.strip_html(em.get(k, {}).get('value', ''))
    lic = val('LicenseShortName')
    if not S.license_ok(lic):
        return None, 'license'
    if re.search(r'license review needed|unreviewed|licensereview', S.norm(val('Categories'))):
        return None, 'licence review pending'
    lim = 250 if DEEP2 else 400      # deep2: the face-size check at screening decides instead
    if ii.get('width', 0) < lim or ii.get('height', 0) < lim:
        return None, 'small'
    src = e['src']
    cats = val('Categories')
    cap = e.get('caption', '')
    desc = val('ImageDescription') + ' ' + val('ObjectName') + ' ' + cap
    subject = S.norm(t + ' | ' + desc)
    text = S.norm(t + ' | ' + cats + ' | ' + desc + ' | ' + ' '.join(src))
    in_tree = any(s == 'cat' or s.startswith('subcat:') for s in src)
    body = any(s.startswith('body-') for s in src)
    # a body caption naming the player (surname is enough: "Ibrahimović playing for Inter in 2007")
    cap_toks = set(S.tokens(cap))
    name_bits = [x for n in [name] + d['aliases'] for x in S.tokens(n) if len(x) >= 4]
    cap_named = bool(cap) and (any(x in cap_toks for x in name_bits) or S.has_all(S.tokens(name), cap))
    in_tree = in_tree or (body and cap_named)
    infobox = any(s.startswith('infobox') or s == 'wikidata-P18' for s in src)
    depicted = bool(qid) and qid in dep
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in S.ID_NEG) and not (qid and dep == {qid}):
        return None, 'id-neg'
    if name in REQUIRE_WORDS and not any(S.norm(w) in text for w in REQUIRE_WORDS[name]):
        return None, 'namesake guard'
    base = re.sub(r'\s*\(.*\)$', '', d.get('article') or name)
    names = [name, base] + d['aliases']
    named = any(S.has_all(S.tokens(n), subject) for n in names if S.tokens(n))
    single = len(S.tokens(name)) < 2
    if dep and qid and qid not in dep and not in_tree:
        return None, 'depicts-other'
    if not (depicted or infobox or in_tree or (named and not single)):
        return None, 'unnamed'
    if single and not (depicted or infobox or in_tree):
        return None, 'single-name, not in tree'
    raw_date = val('DateTimeOriginal')
    y = S.year_of(raw_date)
    date = None
    if y:
        m = re.search(r'(\d{4})(?:[-:/](\d\d)(?:[-:/](\d\d))?)?', raw_date)
        date = '-'.join(g for g in m.groups() if g)
    else:
        y = S.year_of(' '.join(re.findall(r'in (\d{4})', cats + ' ' + ' '.join(src)))) or S.year_of(t)
        date = str(y) if y else None
    w0, w1 = d['window']
    ty = S.year_of(t)
    if y and ty and w0 <= ty <= w1 and y > w1:
        y, date = ty, str(ty)      # a later scan / upload date: the year in the title is when it was taken
    if y and not (w0 <= y <= w1):
        return None, f'date {y} outside {w0}-{w1}'
    pos = sum(w in text for w in S.POS_WORDS)
    neg = sum(w in text for w in S.NEG_WORDS if w not in ('kremlin',))  # kremlin.ru shot WC matches too
    if (neg >= 2 and pos < 2) or (neg >= 1 and pos == 0):
        return None, 'off-pitch words'
    score = min(pos, 4) - neg * 2.0
    score += 3 if depicted else 0
    score += 1.5 if dep == {qid} else 0
    score += 1.5 if named else 0
    score += 1 if in_tree else 0
    score += 1 if infobox else 0
    score += 2 if '(cropped)' in t.lower() else 0
    score -= 2 if not y else 0
    score += 1 if (ii.get('width') or 0) >= 1500 else 0
    if body and cap_named:
        score += 2
        if re.search(r'playing|on the ball|celebrat|during|against|match|training|warm|in action|jogando|'
                     r'jugando|contra|partido|partida|giocando|durante', S.norm(cap)):
            score += 1.5
    return {'file': t, 'score': round(score, 2), 'date': date, 'year': y, 'license': lic,
            'licenseUrl': val('LicenseUrl'), 'artist': val('Artist') or 'Unknown',
            'descriptionurl': ii.get('descriptionurl', ''), 'thumburl': ii.get('thumburl') or ii.get('url'),
            'url': ii.get('url'), 'width': ii.get('width'), 'height': ii.get('height'), 'src': src,
            'text': text, 'depicted': depicted, 'named': named, 'caption': cap}, None


# ---------------------------------------------------------------- openverse / flickr
def openverse(net, d):
    out = []
    name = d['name']
    for q in dict.fromkeys([name] + d['aliases'][:1]):
        params = dict(q=q, license='cc0,pdm,by,by-sa', excluded_source='wikimedia', page_size=20, mature='false')
        r = net.json(B.OPENVERSE + '?' + urllib.parse.urlencode(params)) or {}
        for x in r.get('results', []):
            tags = [t.get('name', '') for t in x.get('tags') or []]
            if x.get('source') != 'flickr' or x.get('license') not in B.LICENSES:
                continue
            if not B.name_tokens_ok(name, d['aliases'], x.get('title') or '', tags):
                continue
            if (x.get('width') or 0) < 500 or (x.get('height') or 0) < 500:
                continue
            out.append(x)
    return out


def flickr_candidate(net, d, x):
    page = net.get(x['foreign_landing_url'])
    if not page:
        return None, 'no page'
    lic, lic_url = B.license_on_page(page)
    if not lic or not S.license_ok(lic.replace('Public Domain Mark', 'public domain').replace('CC0 1.0', 'CC0')):
        return None, f'licence not confirmed on Flickr page ({lic})'
    title, desc, date, owner = B.flickr_page_info(page)
    tags = [t.get('name', '') for t in x.get('tags') or []]
    text = S.norm(' | '.join([x.get('title') or '', title, desc, ' '.join(tags)]))
    subject = S.norm((x.get('title') or '') + ' | ' + title + ' | ' + desc)
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in S.ID_NEG + B.EXTRA_NEG):
        return None, 'fan / other-subject words'
    y = int(date[:4]) if date else None
    w0, w1 = d['window']
    if y is None or not (w0 <= y <= w1):
        return None, f'date {date} outside {w0}-{w1}'
    pos = sum(w in text for w in S.POS_WORDS)
    neg = sum(w in text for w in S.NEG_WORDS)
    if (neg >= 2 and pos < 2) or (neg >= 1 and pos == 0):
        return None, 'off-pitch words'
    return {'file': 'ov:' + x['id'], 'score': min(pos, 4) - neg * 2, 'date': date, 'year': y, 'license': lic,
            'licenseUrl': lic_url, 'artist': owner or x.get('creator') or 'Unknown',
            'descriptionurl': x['foreign_landing_url'], 'url': x['url'], 'thumburl': x['url'],
            'width': x.get('width'), 'height': x.get('height'), 'src': ['openverse/flickr'], 'text': text,
            'title': x.get('title') or title, 'depicted': False, 'named': True}, None


# ---------------------------------------------------------------- images / faces
def load_image(net, c, width):
    if c['file'].startswith('ov:'):
        raw = net.get(c['url'], binary=True)
        if not raw:
            return None
        try:
            return ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
        except Exception:
            return None
    return S.fetch_image(net, c, width)


def face_refs(net, faces, d):
    """Embeddings of every single-dominant face among the infobox / P18 images."""
    refs = []
    pri = lambda src: 0 if 'infobox-en' in src else 1 if 'wikidata-P18' in src else 2
    ref_files = sorted([(pri(e['src']), t) for t, e in d['files'].items()
                        if any(s.startswith('infobox') or s == 'wikidata-P18' for s in e['src'])])
    for _, t in ref_files[:MAX_REFS]:
        e = d['files'][t]
        ii = e['ii']
        img = S.fetch_image(net, {'url': ii.get('url'), 'thumburl': ii.get('thumburl'), 'width': ii.get('width', 0)},
                            960)
        if img is None:
            continue
        fs, bgr = faces.detect(img)
        fs = sorted(fs, key=lambda f: f[2] * f[3], reverse=True)
        if fs and fs[0][2] >= 40 and (len(fs) == 1 or fs[1][2] * fs[1][3] < 0.4 * fs[0][2] * fs[0][3]):
            refs.append((t, faces.embed(bgr, fs[0])))
    return refs


def analyse(net, faces, scene, c, refs, tmp):
    img = load_image(net, c, 960)
    if img is None:
        return None, 'download failed'
    fs, bgr = faces.detect(img)
    if not fs:
        return None, 'no face'
    top = max(f[2] for f in fs)
    if REFETCH_BIG and top < 120 and (c.get('width') or 0) > img.size[0] * 1.05 and not c['file'].startswith('ov:'):
        want = next((b for b in (1280, 1920, 3840) if top * b / img.size[0] >= 120), 3840)
        big = S.fetch_image(net, c, want)
        if big is not None and big.size[0] > img.size[0] * 1.1:
            fs2, bgr2 = faces.detect(big)
            if fs2:
                img, fs, bgr = big, fs2, bgr2
    fs = sorted([f for f in fs if f[2] >= 28], key=lambda f: float(f[0]))
    if not fs:
        return None, 'faces too small'
    sims = []
    for f in fs:
        s = max((faces.sim(faces.embed(bgr, f), r) for _, r in refs), default=None)
        sims.append(s)
    if refs:
        bi = int(np.argmax([s if s is not None else -1 for s in sims]))
    else:
        bi = int(np.argmax([f[2] for f in fs]))
    best = fs[bi]
    left, topy, cw, ch = S.crop_box(img, best)
    others = 0
    for j, f in enumerate(fs):
        if j == bi or f[2] < 0.35 * best[2]:
            continue
        fx, fy = f[0] + f[2] / 2, f[1] + f[3] / 2
        if left - f[2] * 0.3 < fx < left + cw + f[2] * 0.3 and topy < fy < topy + ch:
            others += 1
    iw, ih = img.size
    over = max(-left, left + cw - iw, -topy, topy + ch - ih) / cw
    yw, eyes = S.yaw(best)
    sh = S.sharpness(img, best)
    region = img.crop((max(0, round(left - cw * 0.25)), max(0, round(topy)),
                       min(iw, round(left + cw * 1.25)), min(ih, round(topy + ch * 1.6))))
    p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
    region.save(p, quality=90)
    lb = scene.labels(p)
    whole = os.path.join(tmp, 'w-' + os.path.basename(p))
    img.resize((min(960, iw), round(ih * min(960, iw) / iw))).save(whole, quality=85)
    wl = scene.labels(whole)
    m = {
        'nfaces': len(fs), 'face': bi, 'sim': None if sims[bi] is None else round(sims[bi], 3),
        'fw': round(float(best[2])), 'conf': round(float(best[14]), 2), 'yaw': round(yw, 2), 'eyes': round(eyes, 2),
        'sharp': round(sh), 'over': round(over, 2), 'others': others,
        'suit': round(S.lab(lb, 'suit', 'necktie', 'tuxedo', 'bow_tie', 'blazer'), 2),
        'art': round(S.lab(lb, 'painting', 'drawing', 'illustration', 'sculpture', 'statue', 'screenshot',
                           'poster'), 2),
        'pitch': round(S.lab(wl, 'sport', 'soccer', 'football', 'team_sport', 'stadium', 'ball', 'grass',
                             'athletics', 'sportswear', 'jersey'), 2),
        'cue': any(w in c['text'] for w in S.MATCH_CUES),
        'boxes': [[round(float(v)) for v in f[:4]] for f in fs], 'size': [iw, ih],
    }
    strict = (m['fw'] >= S.FACE_MIN and m['conf'] >= 0.85 and abs(yw) <= S.YAW_MAX and eyes >= 0.28 and
              sh >= S.SHARP_MIN and over <= 0.08 and others == 0 and m['suit'] < 0.3 and m['art'] < 0.5 and
              (m['cue'] or m['pitch'] >= 0.15) and (m['sim'] is None or m['sim'] >= S.ID_MIN))
    relaxed = (m['fw'] >= 48 and m['conf'] >= 0.6 and abs(yw) <= 0.6 and sh >= 40 and over <= 0.2 and
               m['suit'] < 0.5 and m['art'] < 0.5 and (m['sim'] is None or m['sim'] >= 0.25))
    m['grade'] = 'strict' if strict else 'relaxed' if relaxed else 'fail'
    return (img, fs, m), None


# ---------------------------------------------------------------- sheets
def font(sz):
    try:
        return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', sz)
    except Exception:
        return None


def review_cell(img, fs, m, crop, label1, label2):
    cw, ch = 176, 220
    cell = Image.new('RGB', (cw * 2 + 6, ch + 34), (255, 250, 238))
    cell.paste(crop.resize((cw, ch), Image.LANCZOS), (0, 0))
    th = img.copy()
    th.thumbnail((cw, ch))
    s = th.size[0] / img.size[0]
    dr = ImageDraw.Draw(th)
    for j, f in enumerate(fs):
        x, y, w, h = [float(v) * s for v in f[:4]]
        col = (230, 40, 60) if j == m['face'] else (40, 120, 230)
        dr.rectangle([x, y, x + w, y + h], outline=col, width=2)
        dr.text((x, max(0, y - 11)), str(j), fill=col, font=font(10))
    cell.paste(th, (cw + 6, 0))
    d = ImageDraw.Draw(cell)
    d.text((2, ch + 2), label1[:62], fill=(20, 40, 35), font=font(11))
    d.text((2, ch + 17), label2[:62], fill=(90, 60, 60), font=font(10))
    return cell


def write_sheets(cells, prefix, per=24, cols=4):
    paths = []
    for k in range(0, len(cells), per):
        chunk = cells[k:k + per]
        cw, ch = chunk[0].size
        rows = (len(chunk) + cols - 1) // cols
        out = Image.new('RGB', (cols * (cw + 8), rows * (ch + 8)), (238, 230, 214))
        for i, c in enumerate(chunk):
            out.paste(c, ((i % cols) * (cw + 8), (i // cols) * (ch + 8)))
        p = f'{prefix}-{k // per + 1}.png'
        out.save(p)
        paths.append(p)
    return paths


# ---------------------------------------------------------------- identity
def identify_all(net, todo, work):
    path = os.path.join(work, 'ident.json')
    idents = json.load(open(path)) if os.path.exists(path) else {}
    appearance = {}
    ap = os.path.join(ROOT, 'lib/town/playerAppearance.json')
    if os.path.exists(ap):
        appearance = json.load(open(ap, encoding='utf-8'))
    for name, owner in todo:
        if name in idents:
            continue
        s = None
        try:
            s = B.resolve(net, name, owner)
        except Exception as e:
            print(f'   resolve {name}: {e}', flush=True)
        qid = (s or {}).get('wikibase_item')
        # (no FUT.identify search for futsal: too many requests; the Wikipedia item + body captions carry identity)
        infobox = S.commons_file(((s or {}).get('originalimage') or (s or {}).get('thumbnail') or {}).get('source'))
        idents[name] = {'qid': qid, 'article': (s or {}).get('title'), 'infobox': infobox, 'owner': owner}
        print(f'   ident {name}: {qid} {idents[name]["article"]}', flush=True)
        json.dump(idents, open(path, 'w'), ensure_ascii=False, indent=1)
    # Wikidata entities (claims + sitelinks), 50 per call
    qids = [v['qid'] for v in idents.values() if v.get('qid')]
    ents = {}
    for i in range(0, len(qids), 50):
        d = net.wikidata(action='wbgetentities', ids='|'.join(qids[i:i + 50]), props='claims|sitelinks')
        ents.update(d.get('entities') or {})
    for v in idents.values():
        e = ents.get(v.get('qid') or '') or {}
        v['ent'] = {'claims': {k: e.get('claims', {}).get(k, []) for k in ('P18', 'P373', 'P935')},
                    'sitelinks': {k: s.get('title') for k, s in (e.get('sitelinks') or {}).items()}}
        v['countries'] = list(dict.fromkeys(claim_vals(e, 'P1532') + claim_vals(e, 'P27')))
    # other-language infobox images, 50 titles per call per language
    langimgs = {n: [] for n in idents}
    for lang in OTHER_LANGS:
        want = {}
        for n, v in idents.items():
            t = v['ent']['sitelinks'].get(f'{lang}wiki')
            if t:
                want[t] = n
        titles = list(want)
        for i in range(0, len(titles), 50):
            d = net.api(f'{lang}.wikipedia.org', action='query', prop='pageimages', piprop='name',
                        pilicense='free', titles='|'.join(titles[i:i + 50]))
            q = d.get('query', {})
            back = {x['to']: x['from'] for x in q.get('normalized', [])}
            for p in q.get('pages', {}).values():
                f = p.get('pageimage')
                t = back.get(p['title'], p['title'])
                if f and t in want:
                    langimgs[want[t]].append((lang, f))
    for n in idents:
        idents[n]['langimgs'] = langimgs.get(n, [])
    json.dump(idents, open(path, 'w'), ensure_ascii=False, indent=1)
    return idents


# ---------------------------------------------------------------- deep2 screening (small thumbnails)
SCREEN_NEG = ['portrait', 'award', 'ceremony', 'coach', 'manager', 'veteran', 'legends', 'gala', 'conference',
              'reception', 'visit', 'interview', 'premiere', 'ambassador', 'charity', 'meeting', 'unveil']
SCREEN_W = 330     # a standard thumbnail step (~20-40 KB)


def cached_image(net, c, width):
    """The image S.fetch_image would return, but only from the cache (no request)."""
    if width >= (c.get('width') or 0):
        urls = [S.upload_url(c['url'])]
    else:
        urls = [S.upload_url(c['thumburl'], width), S.upload_url(c['url']) if c['width'] <= 2600 else None]
    for u in urls:
        if not u:
            continue
        raw = net._cached(os.path.join(net.cache, hashlib.sha1(u.encode()).hexdigest() + '.bin'))
        if raw and raw != b'__404__':
            try:
                return ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert('RGB')
            except Exception:
                continue
    return None


def screen(net, work, todo, args):
    """Rank every metadata-passing candidate, fetch the top ones as 330 px thumbnails, and draw a sheet with the
    numbered faces and the face width each would have at full size. Nothing is accepted here: PICKS decide."""
    faces = S.Faces(*S.ensure_models(args.models or os.path.join(work, 'models')))
    os.makedirs(os.path.join(work, 'screen'), exist_ok=True)
    cells = {}
    for i, (name, owner) in enumerate(todo):
        slug = S.slugify(name)
        dp = os.path.join(work, 'disc2', slug + '.json')
        if not os.path.exists(dp):
            continue
        d = json.load(open(dp))
        sp = os.path.join(work, 'screen', slug + '.json')
        if os.path.exists(sp):
            res = json.load(open(sp))
        else:
            ep = os.path.join(work, 'eval', slug + '.json')
            # only files whose crop was already on a review sheet count as seen; auto-failed ones get a look now
            seen = {r['file'] for r in json.load(open(ep))['rows'] if r.get('crop')} if os.path.exists(ep) else set()
            cands, why = [], {}
            for t, e in d['files'].items():
                c, r = meta(d, t, e, set(e.get('dep', [])))
                if not c:
                    why[r.split(' ')[0]] = why.get(r.split(' ')[0], 0) + 1
                    continue
                if t in BLOCK or t in seen:
                    continue
                c['score'] -= 3 * sum(w in c['text'] for w in SCREEN_NEG)
                c['score'] += 0.5 if (c.get('width') or 0) > (c.get('height') or 0) else 0
                cands.append(c)
            cands.sort(key=lambda c: -c['score'])
            rows = []
            try:
                for c in cands[:args.tries]:
                    img = cached_image(net, c, 960) or S.fetch_image(net, c, SCREEN_W)
                    row = {k: c[k] for k in ('file', 'score', 'date', 'license', 'artist', 'caption', 'width')}
                    if img is None:
                        row['err'] = 'download failed'
                        rows.append(row)
                        continue
                    fs, _ = faces.detect(img)
                    fs = sorted([f for f in fs if f[2] >= 8], key=lambda f: float(f[0]))
                    row['boxes'] = [[round(float(v), 1) for v in f[:4]] for f in fs]
                    row['size'] = list(img.size)
                    row['full_fw'] = [round(float(f[2]) * (c.get('width') or img.size[0]) / img.size[0]) for f in fs]
                    tp = os.path.join(work, 'screen', f'{slug}__{hashlib.sha1(c["file"].encode()).hexdigest()[:10]}.jpg')
                    img.save(tp, quality=85)
                    row['thumb'] = tp
                    rows.append(row)
            except NetFail as e:
                print(f'[{i + 1}/{len(todo)}] {name}: network failure {e}', flush=True)
                continue
            res = {'name': name, 'owner': owner, 'ncands': len(cands), 'nfiles': len(d['files']),
                   'meta_rejects': why, 'rows': rows}
            json.dump(res, open(sp, 'w'), ensure_ascii=False, indent=1)
        usable = [r for r in res['rows'] if r.get('full_fw') and max(r['full_fw']) >= 60]
        print(f'[{i + 1}/{len(todo)}] {name}: {res["nfiles"]} files, {res["ncands"]} candidates, screened '
              f'{len(res["rows"])}, {len(usable)} with a face >= 60 px at full size; requests {net.requests}', flush=True)
        for r in usable:
            th = Image.open(r['thumb']).convert('RGB')
            th.thumbnail((330, 330))
            sc = th.size[0] / r['size'][0]
            dr = ImageDraw.Draw(th)
            for j, b in enumerate(r['boxes']):
                x, y, w, h = [v * sc for v in b]
                dr.rectangle([x, y, x + w, y + h], outline=(230, 40, 60), width=2)
                dr.text((x, max(0, y - 11)), f's{j}:{r["full_fw"][j]}', fill=(230, 40, 60), font=font(10))
            cell = Image.new('RGB', (336, th.size[1] + 34), (255, 250, 238))
            cell.paste(th, (0, 0))
            d2 = ImageDraw.Draw(cell)
            d2.text((2, th.size[1] + 2), f'{name} | {r["date"]} | {r["license"]}'[:60], fill=(20, 40, 35), font=font(11))
            d2.text((2, th.size[1] + 17), r['file'][:60], fill=(90, 60, 60), font=font(10))
            cells.setdefault(owner, []).append(cell)
    for o, cl in cells.items():
        H = max(c.size[1] for c in cl)
        cl = [c if c.size[1] == H else _pad(c, H) for c in cl]
        print('sheets', o, write_sheets(cl, os.path.join(work, f'screen-{o}'), per=12, cols=4), flush=True)


def _pad(c, H):
    out = Image.new('RGB', (c.size[0], H), (255, 250, 238))
    out.paste(c, (0, 0))
    return out


# ---------------------------------------------------------------- upgrades (players that already have a photo)
def ident_upgrades(net, players, work):
    path = os.path.join(work, 'ident-up.json')
    idents = json.load(open(path)) if os.path.exists(path) else {}
    todo = [(n, o, e) for n, o, e in players if n not in idents]
    by_lang = {}
    for n, o, e in todo:
        art = e.get('article') or n
        lang, title = (art.split(':', 1) if re.match(r'^[a-z]{2}:', art) else ('en', art))
        by_lang.setdefault(lang, {})[title] = n
    qids = {}
    for lang, want in by_lang.items():
        titles = list(want)
        for i in range(0, len(titles), 50):
            d = net.api(f'{lang}.wikipedia.org', action='query', prop='pageprops', ppprop='wikibase_item',
                        redirects=1, titles='|'.join(titles[i:i + 50]))
            q = d.get('query', {})
            back = {}
            for x in q.get('normalized', []) + q.get('redirects', []):
                back[x['to']] = back.get(x['from'], x['from'])
            for pg in q.get('pages', {}).values():
                t = pg['title']
                while t in back and t not in want:
                    t = back[t]
                if t in want:
                    qids[want[t]] = ((pg.get('pageprops') or {}).get('wikibase_item'), lang, pg['title'])
    ql = [v[0] for v in qids.values() if v[0]]
    ents = {}
    for i in range(0, len(ql), 50):
        d = net.wikidata(action='wbgetentities', ids='|'.join(ql[i:i + 50]), props='claims|sitelinks')
        ents.update(d.get('entities') or {})
    for n, o, e in todo:
        q, lang, title = qids.get(n, (None, 'en', e.get('article')))
        ent = ents.get(q or '') or {}
        sl = {k: s.get('title') for k, s in (ent.get('sitelinks') or {}).items()}
        if lang != 'en' and 'enwiki' not in sl:
            sl[f'{lang}wiki'] = title
        idents[n] = {'qid': q, 'article': sl.get('enwiki') or title, 'owner': o,
                     'ent': {'sitelinks': sl, 'claims': {}},
                     'countries': list(dict.fromkeys(claim_vals(ent, 'P1532') + claim_vals(ent, 'P27')))}
    json.dump(idents, open(path, 'w'), ensure_ascii=False, indent=1)
    return idents


def upgrades(net, work, args):
    """Article-body photos that may beat an EXISTING card photo: proposals only, never written."""
    faces = S.Faces(*S.ensure_models(args.models or os.path.join(work, 'models')))
    scene = S.Scene(os.path.join(work, 'cache'))
    tmp = tempfile.mkdtemp(prefix='deep-up-')
    os.makedirs(os.path.join(work, 'up'), exist_ok=True)
    players = []
    for o, pth in B.MANIFESTS.items():
        for n, e in json.load(open(pth, encoding='utf-8')).items():
            players.append((n, o, e))
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        players = [p for p in players if p[0] in keep]
    idents = ident_upgrades(net, players, work)
    cells = []
    for i, (name, owner, entry) in enumerate(players):
        slug = S.slugify(name)
        op = os.path.join(work, 'up', slug + '.json')
        if os.path.exists(op):
            res = json.load(open(op))
        else:
            cur = urllib.parse.unquote(entry.get('file', '').split('File:', 1)[-1]).replace('_', ' ')
            idn = idents.get(name, {})
            d = {'name': name, 'qid': idn.get('qid'), 'article': idn.get('article'),
                 'aliases': aliases_of(name, owner), 'window': owner_window(name, owner)}
            try:
                body = body_sources(net, idn)
                files = [f for f in body if f != cur]
                got = S.imageinfo(net, files) if files else {}
                cands = []
                for f in files:
                    if f not in got:
                        continue
                    c, why = meta(d, f, {'ii': got[f], 'src': [body[f][0]], 'caption': body[f][1]}, set())
                    if c and c['caption'] and c['score'] >= 4:
                        cands.append(c)
                cands.sort(key=lambda c: -c['score'])
                rows = []
                refs = []
                if cands and 'wikimedia.org' in entry.get('file', ''):
                    ii = S.imageinfo(net, [cur]).get(cur)
                    if ii:
                        img = S.fetch_image(net, {'url': ii.get('url'), 'thumburl': ii.get('thumburl'),
                                                  'width': ii.get('width', 0)}, 960)
                        if img is not None:
                            fs, bgr = faces.detect(img)
                            fs = sorted(fs, key=lambda f: f[2] * f[3], reverse=True)
                            if fs:
                                refs = [(cur, faces.embed(bgr, fs[0]))]
                for c in cands[:2]:
                    r, err = analyse(net, faces, scene, c, refs, tmp)
                    row = {k: c[k] for k in ('file', 'score', 'date', 'license', 'artist', 'caption', 'src')}
                    if err:
                        row['err'] = err
                    else:
                        img, fs, m = r
                        row.update(m)
                        if m['grade'] == 'strict' and (m['sim'] is None or m['sim'] >= 0.45):
                            cp = os.path.join(work, 'up', f'{slug}__{len(rows)}.jpg')
                            S.portrait_crop(img, fs[m['face']]).save(cp, quality=88)
                            row['crop'] = cp
                    rows.append(row)
            except NetFail as e:
                print(f'[up {i + 1}/{len(players)}] {name}: network failure {e}', flush=True)
                continue
            res = {'name': name, 'owner': owner, 'current': cur, 'nbody': len(body), 'ncands': len(cands),
                   'rows': rows}
            json.dump(res, open(op, 'w'), ensure_ascii=False, indent=1)
            print(f'[up {i + 1}/{len(players)}] {name}: {len(body)} body images, {len(cands)} captioned cands, '
                  f'{sum(1 for r in rows if r.get("crop"))} proposals; requests {net.requests}', flush=True)
        for k, r in enumerate(res['rows']):
            if r.get('crop') and os.path.exists(r['crop']):
                try:
                    now = S.riso_cell(slug)
                except Exception:
                    continue
                cell = Image.new('RGB', (358, 254), (255, 250, 238))
                cell.paste(now.resize((176, 220)), (0, 0))
                cell.paste(Image.open(r['crop']).resize((176, 220)), (182, 0))
                dr = ImageDraw.Draw(cell)
                dr.text((2, 222), f'{name} now | proposal #{k} sim {r.get("sim")}'[:62], fill=(20, 40, 35), font=font(11))
                dr.text((2, 237), f'{r["date"]} {r["caption"]}'[:64], fill=(90, 60, 60), font=font(10))
                cells.append(cell)
    if cells:
        print('sheets upgrades', write_sheets(cells, os.path.join(work, 'review-upgrade')), flush=True)


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', required=True)
    ap.add_argument('--extra-cache', default='')
    ap.add_argument('--models', default='')
    ap.add_argument('--stage', choices=['discover', 'evaluate', 'apply', 'probe', 'all', 'upgrades', 'screen'],
                    default='all')
    ap.add_argument('--deep2', action='store_true', help='thorough discovery into WORK/disc2 (+ stage screen)')
    ap.add_argument('--only', default='')
    ap.add_argument('--owners', default='stars,legends,women,futsal')
    ap.add_argument('--tries', type=int, default=10)
    ap.add_argument('--probe', default='', help='fetch one URL through the shared throttle (stage probe)')
    args = ap.parse_args()
    work = args.work
    for sub in ('cache', 'disc', 'eval', 'crops'):
        os.makedirs(os.path.join(work, sub), exist_ok=True)
    net = Net(os.path.join(work, 'cache'), [x for x in args.extra_cache.split(',') if x])
    if args.stage == 'probe':
        print(net.get(args.probe) or '(none)')
        return
    if args.stage == 'upgrades':
        upgrades(net, work, args)
        print('requests', net.requests)
        return
    if args.deep2:
        globals()['DEEP2'] = True
    todo = B.missing_players()
    owners = args.owners.split(',')
    order = {o: i for i, o in enumerate(owners)}
    todo = sorted([t for t in todo if t[1] in order], key=lambda t: order[t[1]])
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        todo = [t for t in todo if t[0] in keep]
    if args.stage in ('discover', 'all'):
        idents = identify_all(net, todo, work)
        for i, (name, owner) in enumerate(todo):
            slug = S.slugify(name)
            out = os.path.join(work, 'disc2' if DEEP2 else 'disc', slug + '.json')
            os.makedirs(os.path.dirname(out), exist_ok=True)
            if os.path.exists(out):
                continue
            idn = idents.get(name, {})
            try:
                d = discover_one(net, name, owner, idn, idn.get('langimgs', []))
                # depicts statements for every licence/size-plausible file (50 per call)
                pids = {}
                for t, e in d['files'].items():
                    em = e['ii'].get('extmetadata', {})
                    if S.license_ok(S.strip_html(em.get('LicenseShortName', {}).get('value', ''))):
                        pids[e['ii'].get('pageid')] = t
                dep = S.depicts(net, [p for p in pids if p][:400])
                for pid, qs in dep.items():
                    if pid in pids:
                        d['files'][pids[pid]]['dep'] = sorted(qs)
                d['openverse'] = []
                cands = [meta(d, t, e, set(e.get('dep', [])))[0] for t, e in d['files'].items()]
                if not any(c for c in cands):
                    for x in openverse(net, d)[:3]:
                        c, why = flickr_candidate(net, d, x)
                        d['openverse'].append(c or {'file': 'ov:' + x['id'], 'reject': why,
                                                    'title': x.get('title')})
            except NetFail as e:
                print(f'[{i + 1}/{len(todo)}] {name}: network failure {e}', flush=True)
                continue
            json.dump(d, open(out, 'w'), ensure_ascii=False)
            print(f'[{i + 1}/{len(todo)}] {name} ({owner}): {len(d["files"])} files, cats {len(d["cats"])}, '
                  f'depicts {len(d["dep_files"])}, requests so far {net.requests}', flush=True)
    if args.stage in ('evaluate', 'all'):
        faces = S.Faces(*S.ensure_models(args.models or os.path.join(work, 'models')))
        scene = S.Scene(os.path.join(work, 'cache'))
        tmp = tempfile.mkdtemp(prefix='deep-')
        cells = {o: [] for o in owners}
        for i, (name, owner) in enumerate(todo):
            slug = S.slugify(name)
            dp = os.path.join(work, 'disc', slug + '.json')
            if not os.path.exists(dp):
                continue
            d = json.load(open(dp))
            ep = os.path.join(work, 'eval', slug + '.json')
            if os.path.exists(ep):
                ev = json.load(open(ep))
            else:
                cands, why = [], {}
                for t, e in d['files'].items():
                    c, r = meta(d, t, e, set(e.get('dep', [])))
                    if c:
                        cands.append(c)
                    else:
                        why[r.split(' ')[0]] = why.get(r.split(' ')[0], 0) + 1
                cands += [c for c in d.get('openverse', []) if 'reject' not in c]
                cands = sorted([c for c in cands if c['file'] not in BLOCK], key=lambda c: -c['score'])
                try:
                    refs = face_refs(net, faces, d)
                    rows, good = [], 0
                    for c in cands[:args.tries]:
                        res, err = analyse(net, faces, scene, c, refs, tmp)
                        row = {k: c[k] for k in ('file', 'score', 'date', 'license', 'artist', 'src', 'depicted',
                                                 'named')}
                        if err:
                            row['err'] = err
                        else:
                            img, fs, m = res
                            row.update(m)
                            if m['grade'] != 'fail':
                                crop = S.portrait_crop(img, fs[m['face']])
                                cp = os.path.join(work, 'crops', f'{slug}__{len(rows)}.jpg')
                                crop.save(cp, quality=88)
                                row['crop'] = cp
                                good += 1 if (m['sim'] or 0) >= 0.45 or m['grade'] == 'strict' else 0
                        rows.append(row)
                        if good >= 1:
                            break
                except NetFail as e:
                    print(f'[{i + 1}/{len(todo)}] {name}: network failure {e}', flush=True)
                    continue
                ev = {'name': name, 'owner': owner, 'qid': d['qid'], 'refs': [t for t, _ in refs],
                      'ncands': len(cands), 'meta_rejects': why, 'rows': rows,
                      'openverse': d.get('openverse', [])}
                json.dump(ev, open(ep, 'w'), ensure_ascii=False, indent=1)
            graded = [r for r in ev['rows'] if r.get('crop')]
            print(f'[{i + 1}/{len(todo)}] {name}: {ev["ncands"]} cands, refs {len(ev["refs"])}, '
                  f'{sum(r.get("grade") == "strict" for r in ev["rows"])} strict, '
                  f'{sum(r.get("grade") == "relaxed" for r in ev["rows"])} relaxed; requests {net.requests}',
                  flush=True)
            for k, r in enumerate(ev['rows']):
                if not r.get('crop') or not os.path.exists(r['crop']):
                    continue
                c = next((x for x in [{'file': r['file']}]), None)
                crop = Image.open(r['crop'])
                img = None
                full = os.path.join(work, 'crops', f'{slug}__{hashlib.sha1(r["file"].encode()).hexdigest()[:10]}.full.jpg')
                if os.path.exists(full):
                    img = Image.open(full)
                else:
                    # recreate the thumbnail with boxes from cache (no network: cached)
                    dd = d['files'].get(r['file'], {}).get('ii')
                    if dd:
                        img = S.fetch_image(net, {'url': dd.get('url'), 'thumburl': dd.get('thumburl'),
                                                  'width': dd.get('width', 0)}, 960)
                    elif r['file'].startswith('ov:'):
                        oc = next((o for o in ev['openverse'] if o.get('file') == r['file']), None)
                        img = load_image(net, oc, 960) if oc else None
                    if img is None:
                        continue
                    img.thumbnail((400, 400))
                    img.save(full, quality=80)
                sx = img.size[0] / r['size'][0]
                fs = [[b[0] * sx, b[1] * sx, b[2] * sx, b[3] * sx] for b in r['boxes']]
                lab1 = f'{name} #{k} [{r["grade"]}] sim {r["sim"]} fw {r["fw"]}'
                lab2 = f'{r["date"]} yaw {r["yaw"]} sh {r["sharp"]} suit {r["suit"]} {r["file"][:34]}'
                cells[owner].append(review_cell(img, [f + [0] * 11 for f in fs], r, crop, lab1, lab2))
        for o, cl in cells.items():
            if cl:
                print('sheets', o, write_sheets(cl, os.path.join(work, f'review-{o}')), flush=True)
    if args.stage == 'screen':
        screen(net, work, todo, args)
    if args.stage == 'apply':
        faces = S.Faces(*S.ensure_models(args.models or os.path.join(work, 'models')))
        done = []
        for name, owner in todo:
            if name not in PICKS:
                continue
            f, face_idx = PICKS[name][:2]
            pick_w = PICKS[name][2] if len(PICKS[name]) > 2 else 960   # a bigger bucket for small faces in big files
            slug = S.slugify(name)
            d = json.load(open(os.path.join(work, 'disc', slug + '.json')))
            d2p = os.path.join(work, 'disc2', slug + '.json')
            if os.path.exists(d2p):          # deep2 discovery supersedes (superset of files)
                d2 = json.load(open(d2p))
                d2['files'] = {**d['files'], **d2['files']}
                d = d2
            if f.startswith('ov:'):
                c = next(o for o in d.get('openverse', []) if o.get('file') == f)
            else:
                e = d['files'].get(f)
                if not e:
                    e = {'ii': S.imageinfo(net, [f])[f], 'src': ['pick'], 'dep': []}
                c, why = meta(d, f, e, set(e.get('dep', [])))
                if not c:     # hand-reviewed: only the licence is re-checked here
                    em = e['ii'].get('extmetadata', {})
                    val = lambda k: S.strip_html(em.get(k, {}).get('value', ''))
                    assert S.license_ok(val('LicenseShortName')) or name in APPROVED_CREDIT, (name, f, why)
                    raw = val('DateTimeOriginal')
                    c = {'file': f, 'descriptionurl': e['ii'].get('descriptionurl', ''),
                         'artist': val('Artist') or 'Unknown', 'license': val('LicenseShortName'),
                         'licenseUrl': val('LicenseUrl'), 'date': raw[:10] if raw else (S.year_of(f) or ''),
                         'url': e['ii'].get('url'), 'thumburl': e['ii'].get('thumburl'),
                         'width': e['ii'].get('width')}
            evp = os.path.join(work, 'eval', slug + '.json')
            ev = json.load(open(evp)) if os.path.exists(evp) else {'rows': []}
            row = next((r for r in ev['rows'] if r['file'] == f), None)
            img = load_image(net, c, pick_w)
            fs, bgr = faces.detect(img)
            if pick_w == 960 and row and row.get('size') and row['size'][0] != img.size[0]:
                for b in (1280, 1920, 3840):
                    big = S.fetch_image(net, c, b)
                    if big is not None and big.size[0] == row['size'][0]:
                        img = big
                        fs, bgr = faces.detect(img)
                        break
            fs = sorted([x for x in fs if x[2] >= 28], key=lambda x: float(x[0]))
            if isinstance(face_idx, str) and face_idx.startswith('s'):
                # face number from the deep2 screening sheet: map its centre onto the full-size detection
                sr = next(x for x in json.load(open(os.path.join(work, 'screen', slug + '.json')))['rows']
                          if x['file'] == f)
                bx, sw = sr['boxes'][int(face_idx[1:])], sr['size'][0]
                cx, cy = (bx[0] + bx[2] / 2) / sw, (bx[1] + bx[3] / 2) / sw
                k = min(range(len(fs)), key=lambda j: (float(fs[j][0] + fs[j][2] / 2) / img.size[0] - cx) ** 2 +
                        (float(fs[j][1] + fs[j][3] / 2) / img.size[0] - cy) ** 2)
            else:
                k = face_idx if face_idx is not None else (row['face'] if row else 0)
            crop = S.portrait_crop(img, fs[k])
            crop.save(os.path.join(work, 'final-' + slug + '.jpg'), quality=90)
            ink, tone = S.riso(crop)
            S.save_mask(ink, os.path.join(S.OUT_DIR, f'{slug}-ink.webp'))
            S.save_mask(tone, os.path.join(S.OUT_DIR, f'{slug}-tone.webp'))
            path = B.MANIFESTS[owner]
            man = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}   # re-read before write
            artist = re.sub(r'\s*\(\s*talk\s*\).*$', '', c['artist']).strip() or c['artist']
            entry = {'slug': slug, 'article': d.get('article') or name, 'file': c['descriptionurl'],
                     'artist': artist, 'license': c['license'], 'licenseUrl': c['licenseUrl'],
                     'date': str(c.get('date') or '')}
            if name in APPROVED_CREDIT:
                entry.update(APPROVED_CREDIT[name])
            if f.startswith('ov:'):
                entry.update(source='openverse/flickr', sourceName='Flickr')
            else:
                entry['source'] = 'wikimedia/deep-audit'
            man[name] = entry
            tmpf = path + '.tmp'
            with open(tmpf, 'w', encoding='utf-8') as fh:
                json.dump(man, fh, ensure_ascii=False, indent=2)
                fh.write('\n')
            os.replace(tmpf, path)
            done.append(name)
            print(f'APPLIED {name} -> {owner}: {f}', flush=True)
        print('applied', len(done))
    print('requests', net.requests)


if __name__ == '__main__':
    main()
