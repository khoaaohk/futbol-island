#!/usr/bin/env python3
"""Riso photo portraits for the CURRENT football stars (the `current` arrays of
goalkeeper / fullback / centerback / midfielder / winger / striker in
lib/town/positionPlayers.json).

Same approach and output format as scripts/fetch-player-photos.py (Wikimedia
API, license filter, riso ink/tone alpha masks), with stricter checks:

  * identity  - the file's title/description or structured 'depicts' must name
                the player, fan/mural/statue/face-paint files are refused, AND
                the detected face must match the face in the player's Wikipedia
                infobox photo (OpenCV SFace embedding, cosine similarity).
  * in kit    - current club (dated after the transfer) or national team; text
                cues must not point at a ceremony / press / suit photo, and the
                Apple Vision scene classifier (optional) must not see a suit.
  * big face  - OpenCV YuNet face detection on the image actually cropped;
                4:5 crop, face centre 40% from the top, face box 42% of the
                crop width (>= 38% required); rejected when that needs more
                than 2x upscaling, when the face is blurred (Laplacian
                variance) or turned away (landmark yaw).
  * license   - CC0 / PD / CC BY / CC BY-SA only.

Outputs (this script only ever writes the current-star batch):
  public/players/<slug>-ink.webp, <slug>-tone.webp
  lib/town/playerPhotos.stars.json

Run with a Python that has opencv-python-headless, numpy and pillow, e.g.
  python3.12 -m venv /tmp/v && /tmp/v/bin/pip install opencv-python-headless pillow numpy
  /tmp/v/bin/python scripts/fetch-player-photos-stars.py --cache DIR --sheet sheet.png
The YuNet / SFace ONNX models are downloaded once into --models.

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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import player_masks  # noqa: E402  packed ink+tone masks, one file per player (Oct 7 2026)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYERS_JSON = os.path.join(ROOT, 'lib/town/positionPlayers.json')
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.stars.json')
OUT_DIR = os.path.join(ROOT, 'public/players')
UA = 'FutbolIslandPhotos/1.0'
ROLES = ['goalkeeper', 'fullback', 'centerback', 'midfielder', 'winger', 'striker']
W, H = 320, 400
THIS_YEAR = 2026
WINDOW_FROM = 2022           # current stars: photos from the last few seasons only
FACE_FRAC = 0.42             # face box width / crop width (>= 0.38 required)
MAX_UPSCALE = 2.0
FACE_MIN = W * FACE_FRAC / MAX_UPSCALE   # ~67 px face width in the cropped source
SHARP_MIN = 100.0            # Laplacian variance of the face at 128 px
YAW_MAX = 0.30               # |nose offset| / eye distance; above = turned away
ID_MIN = 0.40                # SFace cosine similarity to the infobox face (0.363 = OpenCV's same-person cut)
MODELS = {
    'yunet.onnx': 'https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/'
                  'face_detection_yunet_2023mar.onnx',
    'sface.onnx': 'https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/'
                  'face_recognition_sface_2021dec.onnx',
}

OVERRIDES = {
    'Alisson': ['Alisson Becker'],
    'Rodri': ['Rodri (footballer, born 1996)'],
    'Vitinha': ['Vitinha (footballer, born 2000)'],
    'Marquinhos': ['Marquinhos (footballer, born 1994)'],
    'Luis Díaz': ['Luis Díaz (footballer, born 1997)', 'Luis Díaz (Colombian footballer)'],
    'João Neves': ['João Neves (footballer, born 2004)'],
    'Nuno Mendes': ['Nuno Mendes (footballer, born 2002)'],
    'Gabriel Magalhães': ['Gabriel Magalhães'],
    'Ederson': ['Ederson (footballer, born 1993)', 'Ederson Moraes'],
    'Neymar': ['Neymar'],
    'Pedri': ['Pedri'],
    'Marta': ['Marta (footballer)'],
    'Lindsey Heaps': ['Lindsey Heaps', 'Lindsey Horan'],
    'Sophia Wilson': ['Sophia Wilson', 'Sophia Smith (soccer)'],
    'Sam Kerr': ['Sam Kerr'],
    'Khadija Shaw': ['Khadija Shaw'],
    'João Pedro': ['João Pedro (footballer, born 2001)'],
    'Casemiro': ['Casemiro'],
    'Fermín López': ['Fermín López'],
    'Raúl Jiménez': ['Raúl Jiménez'],
    'Anthony Gordon': ['Anthony Gordon (footballer)'],
    'Endrick': ['Endrick (footballer)'],
    'Vozinha': ['Vozinha', 'Vozinha (footballer)'],
    'Jonathan David': ['Jonathan David (soccer)', 'Jonathan David (footballer)'],
}

# Other names the same player is filed under on Commons.
ALIASES = {
    'Lindsey Heaps': ['Lindsey Horan'], 'Sophia Wilson': ['Sophia Smith'], 'Patri Guijarro': ['Patricia Guijarro'],
    'Mapi León': ['María Pilar León', 'Mapi Leon'], 'Son Heung-min': ['Heung-min Son'], 'Kim Min-jae': ['Min-jae Kim'],
    'Khadija Shaw': ['Bunny Shaw'], 'Andrew Robertson': ['Andy Robertson'], 'Clàudia Pina': ['Claudia Pina'],
    'Kenan Yıldız': ['Kenan Yildiz'], 'João Pedro': ['João Pedro Junqueira'], "N'Golo Kanté": ['Ngolo Kante'],
    'İlkay Gündoğan': ['Ilkay Gundogan'], 'Vozinha': ['Josimar Dias'], 'Brahim Díaz': ['Brahim Diaz'],
}

# name -> (current club keywords, (joined year, month), national-team keywords, former-club keywords)
CLUBS = {
    'Gianluigi Donnarumma': (['manchester city', 'man city'], (2025, 9), ['italy', 'italia'], ['paris', 'psg', 'milan']),
    'Thibaut Courtois': (['real madrid'], (2018, 8), ['belgium', 'belgique', 'belgie'], ['chelsea']),
    'Alisson': (['liverpool'], (2018, 7), ['brazil', 'brasil'], ['roma']),
    'David Raya': (['arsenal'], (2023, 8), ['spain', 'espana'], ['brentford']),
    'Emiliano Martínez': (['aston villa'], (2020, 9), ['argentin'], ['arsenal']),
    'Diogo Costa': (['porto'], (2019, 7), ['portugal'], []),
    'Yassine Bounou': (['al-hilal', 'al hilal', 'alhilal'], (2023, 8), ['morocco', 'maroc'], ['sevilla']),
    'Jan Oblak': (['atletico', 'atlético'], (2014, 7), ['slovenia', 'slovenija'], []),
    'Mike Maignan': (['milan'], (2021, 7), ['france'], ['lille']),
    'Gregor Kobel': (['dortmund', 'bvb'], (2021, 7), ['switzerland', 'schweiz', 'suisse', 'swiss'], ['stuttgart']),
    'Achraf Hakimi': (['paris', 'psg'], (2021, 7), ['morocco', 'maroc'], ['inter']),
    'Nuno Mendes': (['paris', 'psg'], (2021, 9), ['portugal'], ['sporting']),
    'Dani Carvajal': (['real madrid'], (2013, 7), ['spain', 'espana'], []),
    'Trent Alexander-Arnold': (['real madrid'], (2025, 6), ['england'], ['liverpool']),
    'Theo Hernández': (['al-hilal', 'al hilal', 'alhilal'], (2025, 7), ['france'], ['milan']),
    'Alphonso Davies': (['bayern'], (2019, 1), ['canada'], []),
    'Jules Koundé': (['barcelona', 'barca', 'barça'], (2022, 8), ['france'], ['sevilla']),
    'Alejandro Balde': (['barcelona', 'barca', 'barça'], (2021, 9), ['spain', 'espana'], []),
    'Jeremie Frimpong': (['liverpool'], (2025, 7), ['netherlands', 'nederland', 'holland'], ['leverkusen']),
    'Pedro Porro': (['tottenham', 'spurs'], (2023, 2), ['spain', 'espana'], ['sporting']),
    'Virgil van Dijk': (['liverpool'], (2018, 1), ['netherlands', 'nederland', 'holland'], []),
    'Rúben Dias': (['manchester city', 'man city'], (2020, 9), ['portugal'], ['benfica']),
    'Antonio Rüdiger': (['real madrid'], (2022, 7), ['germany', 'deutschland', 'dfb'], ['chelsea']),
    'William Saliba': (['arsenal'], (2022, 7), ['france'], ['marseille']),
    'Gabriel Magalhães': (['arsenal'], (2020, 9), ['brazil', 'brasil'], ['lille']),
    'Alessandro Bastoni': (['inter'], (2019, 7), ['italy', 'italia'], []),
    'Marquinhos': (['paris', 'psg'], (2013, 7), ['brazil', 'brasil'], []),
    'Pau Cubarsí': (['barcelona', 'barca', 'barça'], (2024, 1), ['spain', 'espana'], []),
    'Cristian Romero': (['tottenham', 'spurs'], (2021, 8), ['argentin'], ['atalanta']),
    'Ibrahima Konaté': (['liverpool'], (2021, 7), ['france'], ['leipzig']),
    'Pedri': (['barcelona', 'barca', 'barça'], (2020, 8), ['spain', 'espana'], []),
    'Vitinha': (['paris', 'psg'], (2022, 7), ['portugal'], ['porto']),
    'Jude Bellingham': (['real madrid'], (2023, 7), ['england'], ['dortmund']),
    'Cole Palmer': (['chelsea'], (2023, 9), ['england'], ['manchester city']),
    'Rodri': (['manchester city', 'man city'], (2019, 7), ['spain', 'espana'], []),
    'Federico Valverde': (['real madrid'], (2018, 7), ['uruguay'], []),
    'Declan Rice': (['arsenal'], (2023, 7), ['england'], ['west ham']),
    'Bruno Fernandes': (['manchester united', 'man utd', 'man united'], (2020, 2), ['portugal'], ['sporting']),
    'Florian Wirtz': (['liverpool'], (2025, 7), ['germany', 'deutschland', 'dfb'], ['leverkusen']),
    'João Neves': (['paris', 'psg'], (2024, 8), ['portugal'], ['benfica']),
    'Lamine Yamal': (['barcelona', 'barca', 'barça'], (2023, 4), ['spain', 'espana'], []),
    'Vinícius Júnior': (['real madrid'], (2018, 7), ['brazil', 'brasil'], []),
    'Mohamed Salah': (['liverpool'], (2017, 7), ['egypt'], []),
    'Raphinha': (['barcelona', 'barca', 'barça'], (2022, 7), ['brazil', 'brasil'], ['leeds']),
    'Bukayo Saka': (['arsenal'], (2018, 11), ['england'], []),
    'Khvicha Kvaratskhelia': (['paris', 'psg'], (2025, 1), ['georgia'], ['napoli']),
    'Luis Díaz': (['bayern'], (2025, 7), ['colombia'], ['liverpool', 'porto']),
    'Nico Williams': (['athletic', 'bilbao'], (2021, 4), ['spain', 'espana'], []),
    'Désiré Doué': (['paris', 'psg'], (2024, 8), ['france'], ['rennes']),
    'Michael Olise': (['bayern'], (2024, 7), ['france'], ['crystal palace']),
    'Kylian Mbappé': (['real madrid'], (2024, 7), ['france'], ['paris', 'psg']),
    'Ousmane Dembélé': (['paris', 'psg'], (2023, 8), ['france'], ['barcelona', 'barca']),
    'Erling Haaland': (['manchester city', 'man city'], (2022, 7), ['norway', 'norge'], ['dortmund']),
    'Harry Kane': (['bayern'], (2023, 8), ['england'], ['tottenham', 'spurs']),
    'Alexander Isak': (['liverpool'], (2025, 9), ['sweden', 'sverige'], ['newcastle']),
    'Lautaro Martínez': (['inter'], (2018, 7), ['argentin'], []),
    'Julián Álvarez': (['atletico', 'atlético'], (2024, 8), ['argentin'], ['manchester city', 'man city']),
    'Victor Osimhen': (['galatasaray'], (2024, 9), ['nigeria'], ['napoli']),
    'Viktor Gyökeres': (['arsenal'], (2025, 7), ['sweden', 'sverige'], ['sporting']),
    'Robert Lewandowski': (['barcelona', 'barca', 'barça'], (2022, 7), ['poland', 'polska'], ['bayern']),
    'Marc-André ter Stegen': (['barcelona', 'barca', 'barça', 'girona'], (2014, 7), ['germany', 'deutschland', 'dfb'], ['monchengladbach', 'gladbach']),
    'Ederson': (['fenerbahce', 'fenerbahçe'], (2025, 9), ['brazil', 'brasil'], ['manchester city', 'man city']),
    'Jordan Pickford': (['everton'], (2017, 7), ['england'], []),
    'Andrew Robertson': (['liverpool'], (2017, 7), ['scotland'], []),
    'Reece James': (['chelsea'], (2019, 7), ['england'], []),
    'Joško Gvardiol': (['manchester city', 'man city'], (2023, 8), ['croatia', 'hrvatska'], ['leipzig']),
    'Kim Min-jae': (['bayern'], (2023, 7), ['korea'], ['napoli', 'fenerbahce']),
    'Kevin De Bruyne': (['napoli'], (2025, 7), ['belgium', 'belgique', 'belgie'], ['manchester city', 'man city']),
    'Jamal Musiala': (['bayern'], (2019, 7), ['germany', 'deutschland', 'dfb'], []),
    'Martin Ødegaard': (['arsenal'], (2021, 8), ['norway', 'norge'], ['real madrid', 'real sociedad']),
    'Neymar': (['santos'], (2025, 1), ['brazil', 'brasil'], ['al-hilal', 'al hilal', 'paris', 'psg']),
    'Son Heung-min': (['los angeles fc', 'lafc'], (2025, 8), ['korea'], ['tottenham', 'spurs']),
    'Christian Pulisic': (['milan'], (2023, 7), ['united states', 'usmnt', 'usa'], ['chelsea']),
    'Karim Benzema': (['ittihad', 'al-hilal', 'al hilal'], (2023, 7), ['france'], ['real madrid']),
    'Antoine Griezmann': (['atletico', 'atlético'], (2021, 8), ['france'], ['barcelona', 'barca']),
    'Romelu Lukaku': (['napoli'], (2024, 8), ['belgium', 'belgique', 'belgie'], ['chelsea', 'roma', 'inter']),
    # Fox Sports "World Cup 2026 best 100" additions (cards 309-353). Clubs from the cached Wikipedia intros
    # (Sep 2026). Where the current move is recent, the club(s) before it inside the photo window also count
    # as playing kit, so "joined" is the start of the earliest listed club.
    'Moisés Caicedo': (['chelsea', 'brighton'], (2021, 2), ['ecuador'], ['beerschot', 'independiente']),
    'Antoine Semenyo': (['manchester city', 'man city', 'bournemouth'], (2023, 1), ['ghana'], ['bristol']),
    'Aurélien Tchouaméni': (['real madrid'], (2022, 7), ['france'], ['monaco', 'bordeaux']),
    'Joshua Kimmich': (['bayern'], (2015, 7), ['germany', 'deutschland', 'dfb'], ['leipzig', 'stuttgart']),
    'Bernardo Silva': (['real madrid', 'manchester city', 'man city'], (2017, 7), ['portugal'], ['monaco', 'benfica']),
    'Denzel Dumfries': (['real madrid', 'inter'], (2021, 8), ['netherlands', 'nederland', 'holland'], ['psv']),
    'Jérémy Doku': (['manchester city', 'man city', 'rennes'], (2020, 10), ['belgium', 'belgique', 'belgie'], ['anderlecht']),
    'Rayan Cherki': (['manchester city', 'man city', 'lyon', 'olympique lyonnais'], (2019, 7), ['france'], []),
    "N'Golo Kanté": (['fenerbahce', 'fenerbahçe', 'ittihad', 'chelsea'], (2016, 7), ['france'], ['leicester', 'caen']),
    'Tijjani Reijnders': (['qadsiah', 'manchester city', 'man city', 'milan'], (2023, 7), ['netherlands', 'nederland', 'holland'], ['alkmaar', 'zwolle']),
    'Bruno Guimarães': (['arsenal', 'newcastle'], (2022, 1), ['brazil', 'brasil'], ['lyon', 'athletico']),
    'Frenkie de Jong': (['barcelona', 'barca', 'barça'], (2019, 7), ['netherlands', 'nederland', 'holland'], ['ajax']),
    'Marc Cucurella': (['real madrid', 'chelsea'], (2022, 8), ['spain', 'espana'], ['brighton', 'getafe']),
    'Sadio Mané': (['nassr', 'bayern'], (2022, 7), ['senegal'], ['liverpool', 'southampton']),
    'Martín Zubimendi': (['arsenal', 'real sociedad'], (2019, 1), ['spain', 'espana'], []),
    'Enzo Fernández': (['manchester city', 'man city', 'chelsea', 'benfica'], (2022, 7), ['argentin'], ['river plate']),
    'Willian Pacho': (['paris', 'psg', 'frankfurt', 'eintracht'], (2023, 7), ['ecuador'], ['antwerp']),
    'Scott McTominay': (['napoli', 'manchester united', 'man utd', 'man united'], (2017, 5), ['scotland'], []),
    'Ryan Gravenberch': (['liverpool', 'bayern'], (2022, 7), ['netherlands', 'nederland', 'holland'], ['ajax']),
    'Fermín López': (['barcelona', 'barca', 'barça'], (2023, 7), ['spain', 'espana'], ['linares']),
    'Cody Gakpo': (['liverpool', 'psv'], (2018, 2), ['netherlands', 'nederland', 'holland'], []),
    'João Pedro': (['chelsea', 'brighton'], (2023, 7), ['brazil', 'brasil'], ['watford', 'fluminense']),
    'Ismaïla Sarr': (['crystal palace', 'marseille'], (2023, 8), ['senegal'], ['watford', 'rennes']),
    'Rafael Leão': (['galatasaray', 'milan'], (2019, 8), ['portugal'], ['lille', 'sporting']),
    'Alexis Mac Allister': (['liverpool', 'brighton'], (2020, 1), ['argentin'], ['boca', 'argentinos']),
    'Weston McKennie': (['juventus', 'leeds'], (2020, 8), ['united states', 'usmnt', 'usa'], ['schalke']),
    'Gabriel Martinelli': (['al-hilal', 'al hilal', 'alhilal', 'arsenal'], (2019, 7), ['brazil', 'brasil'], ['ituano']),
    'João Cancelo': (['barcelona', 'barca', 'barça', 'al-hilal', 'al hilal', 'alhilal'], (2023, 9), ['portugal'], ['manchester city', 'man city', 'bayern', 'juventus']),
    'Dani Olmo': (['barcelona', 'barca', 'barça', 'leipzig'], (2020, 1), ['spain', 'espana'], ['dinamo', 'zagreb']),
    'Arda Güler': (['real madrid', 'fenerbahce', 'fenerbahçe'], (2021, 1), ['turkey', 'turkiye', 'türkiye'], []),
    'Marc Guéhi': (['manchester city', 'man city', 'crystal palace'], (2021, 7), ['england'], ['swansea', 'chelsea']),
    'Fabián Ruiz': (['paris', 'psg'], (2022, 8), ['spain', 'espana'], ['napoli', 'betis']),
    'Casemiro': (['inter miami', 'manchester united', 'man utd', 'man united'], (2022, 8), ['brazil', 'brasil'], ['real madrid', 'porto']),
    'Mikel Merino': (['arsenal', 'real sociedad'], (2018, 7), ['spain', 'espana'], ['newcastle', 'dortmund', 'osasuna']),
    'Eberechi Eze': (['arsenal', 'crystal palace'], (2020, 8), ['england'], ['queens park', 'qpr']),
    'Kenan Yıldız': (['juventus'], (2022, 7), ['turkey', 'turkiye', 'türkiye'], ['bayern']),
    'Raúl Jiménez': (['fulham', 'wolves', 'wolverhampton'], (2018, 6), ['mexico', 'méxico'], ['benfica', 'atletico']),
    'Gonçalo Ramos': (['milan', 'paris', 'psg', 'benfica'], (2020, 1), ['portugal'], []),
    'Mikel Oyarzabal': (['real sociedad'], (2016, 1), ['spain', 'espana'], []),
    'Marcus Thuram': (['inter'], (2023, 7), ['france'], ['gladbach', 'monchengladbach', 'guingamp']),
    'Kaoru Mitoma': (['brighton'], (2021, 8), ['japan', 'nippon'], ['saint-gilloise', 'kawasaki']),
    'Phil Foden': (['manchester city', 'man city'], (2017, 7), ['england'], []),
    'Lisandro Martínez': (['manchester united', 'man utd', 'man united'], (2022, 7), ['argentin'], ['ajax']),
    'Bradley Barcola': (['liverpool', 'paris', 'psg', 'lyon'], (2020, 1), ['france'], []),
    'Pervis Estupiñán': (['milan', 'brighton'], (2021, 8), ['ecuador'], ['villarreal']),
    # Sep 25 2026 additions (cards 354-372; clubs from the en.wikipedia infoboxes fetched that day). Recent movers: the
    # club before the 2026 move also counts as playing kit.
    'Anthony Gordon': (['barcelona', 'barca', 'barça', 'newcastle'], (2023, 1), ['england'], ['everton']),
    'Endrick': (['real madrid', 'lyon', 'olympique lyonnais', 'palmeiras'], (2022, 10), ['brazil', 'brasil'], []),
    'Karim Adeyemi': (['barcelona', 'barca', 'barça', 'dortmund', 'bvb'], (2022, 7), ['germany', 'deutschland', 'dfb'], ['salzburg']),
    'Elliot Anderson': (['manchester city', 'man city', 'nottingham forest', 'forest'], (2024, 7), ['england'], ['newcastle']),
    'Sandro Tonali': (['tottenham', 'spurs', 'newcastle'], (2023, 7), ['italy', 'italia'], ['milan', 'brescia']),
    # Sep 25 2026 batch A/B additions (cards 373-388)
    'Rodrigo De Paul': (['inter miami', 'atletico', 'atlético'], (2021, 7), ['argentin'], ['udinese']),
    'Vozinha': (['colo-colo', 'colo colo', 'chaves', 'trencin', 'trenčín'], (2022, 1), ['cape verde', 'cabo verde'], ['ael', 'limassol']),
    'Jonathan David': (['atletico', 'atlético', 'juventus', 'lille'], (2020, 8), ['canada'], ['gent']),
    'Brahim Díaz': (['real madrid', 'milan'], (2020, 9), ['morocco', 'maroc'], ['manchester city']),
    'Olivier Giroud': (['lille', 'los angeles fc', 'lafc', 'milan'], (2021, 7), ['france'], ['chelsea', 'arsenal']),
    'Kyle Walker': (['burnley', 'milan', 'manchester city', 'man city'], (2017, 7), ['england'], ['tottenham', 'spurs']),
    'İlkay Gündoğan': (['galatasaray', 'manchester city', 'man city', 'barcelona', 'barca', 'barça'], (2016, 7), ['germany', 'deutschland', 'dfb'], ['dortmund']),
    "Nico O'Reilly": (['manchester city', 'man city'], (2023, 1), ['england'], []),
    # women's game (owned by the separate women-photo batch; listed here for reference only)
    'Hannah Hampton': (['chelsea'], (2023, 7), ['england', 'lionesses'], ['aston villa']),
    'Mary Earps': (['paris', 'psg'], (2024, 7), ['england', 'lionesses'], ['manchester united', 'man utd']),
    'Alyssa Naeher': (['chicago'], (2016, 1), ['united states', 'usa', 'uswnt'], []),
    'Lucy Bronze': (['chelsea'], (2024, 7), ['england', 'lionesses'], ['barcelona', 'barca']),
    'Wendie Renard': (['lyon', 'olympique lyonnais', 'ol lyonnes'], (2006, 7), ['france'], []),
    'Leah Williamson': (['arsenal'], (2014, 1), ['england', 'lionesses'], []),
    'Mapi León': (['barcelona', 'barca', 'barça'], (2017, 7), ['spain', 'espana'], []),
    'Aitana Bonmatí': (['barcelona', 'barca', 'barça'], (2016, 7), ['spain', 'espana'], []),
    'Alexia Putellas': (['barcelona', 'barca', 'barça'], (2012, 7), ['spain', 'espana'], []),
    'Mariona Caldentey': (['arsenal'], (2024, 7), ['spain', 'espana'], ['barcelona', 'barca']),
    'Patri Guijarro': (['barcelona', 'barca', 'barça'], (2019, 7), ['spain', 'espana'], []),
    'Lindsey Heaps': (['lyon', 'olympique lyonnais', 'denver'], (2022, 1), ['united states', 'usa', 'uswnt'], ['portland']),
    'Caroline Graham Hansen': (['barcelona', 'barca', 'barça'], (2019, 7), ['norway', 'norge'], ['wolfsburg']),
    'Salma Paralluelo': (['barcelona', 'barca', 'barça'], (2022, 7), ['spain', 'espana'], []),
    'Trinity Rodman': (['washington spirit', 'spirit'], (2021, 1), ['united states', 'usa', 'uswnt'], []),
    'Lauren James': (['chelsea'], (2021, 7), ['england', 'lionesses'], []),
    'Chloe Kelly': (['arsenal'], (2025, 1), ['england', 'lionesses'], ['manchester city', 'man city']),
    'Clàudia Pina': (['barcelona', 'barca', 'barça'], (2019, 7), ['spain', 'espana'], []),
    'Sam Kerr': (['chelsea'], (2019, 11), ['australia', 'matildas'], []),
    'Alessia Russo': (['arsenal'], (2023, 7), ['england', 'lionesses'], ['manchester united', 'man utd']),
    'Ewa Pajor': (['barcelona', 'barca', 'barça'], (2024, 7), ['poland', 'polska'], ['wolfsburg']),
    'Khadija Shaw': (['manchester city', 'man city'], (2021, 7), ['jamaica', 'reggae girlz'], []),
    'Sophia Wilson': (['portland', 'thorns'], (2020, 1), ['united states', 'usa', 'uswnt'], []),
    'Temwa Chawinga': (['kansas city', 'kc current'], (2024, 1), ['malawi'], ['wuhan']),
    'Ada Hegerberg': (['lyon', 'olympique lyonnais', 'ol lyonnes'], (2014, 7), ['norway', 'norge'], []),
    'Vivianne Miedema': (['manchester city', 'man city'], (2024, 7), ['netherlands', 'nederland', 'holland', 'oranje'], ['arsenal']),
    'Pernille Harder': (['bayern'], (2023, 7), ['denmark', 'danmark'], ['chelsea']),
    'Marta': (['orlando', 'pride'], (2017, 4), ['brazil', 'brasil'], []),
    'Barbra Banda': (['orlando', 'pride'], (2024, 3), ['zambia'], ['shanghai']),
    'Asisat Oshoala': (['bay fc'], (2024, 1), ['nigeria', 'super falcons'], ['barcelona', 'barca']),
}
MATCH_CUES = [' vs', ' v ', 'versus', 'match', 'training', 'game', 'world cup', 'league', ' cup', 'friendly',
              'qualif', 'final', 'euro 20', 'uefa', 'fifa', 'copa', 'derby', 'warm-up', 'warm up', 'olympic',
              'championship', 'nations', 'she believes', 'arnold clark', 'playoff', 'play-off']
NAT_CONTEXT = ['national', 'euro 202', 'uefa euro', 'world cup', 'nations league', 'qualif', 'friendly',
               'copa america', 'africa cup', 'afcon', ' vs', ' v ', ' - ', 'seleccion', 'selecao', 'squadra',
               'mannschaft', 'nationalmannschaft', 'team', 'olympic']

# Processing order: players with no photo yet, then audit failures, then the rest.
PRIORITY = ['Kevin De Bruyne', 'Neymar', 'Son Heung-min', 'Jamal Musiala', 'Martin Ødegaard', 'Karim Benzema',
            'Antoine Griezmann', 'Romelu Lukaku', 'Christian Pulisic', 'Andrew Robertson', 'Reece James',
            'Joško Gvardiol', 'Kim Min-jae', 'Marc-André ter Stegen', 'Ederson', 'Jordan Pickford',
            'Cole Palmer', 'Gianluigi Donnarumma', 'Jeremie Frimpong', 'Alexander Isak', 'Cristian Romero',
            'Ibrahima Konaté', 'Khvicha Kvaratskhelia', 'Désiré Doué', 'Federico Valverde', 'Thibaut Courtois',
            'Alisson', 'Emiliano Martínez', 'Mike Maignan', 'Achraf Hakimi', 'Nuno Mendes', 'Alejandro Balde',
            'João Neves', 'Rúben Dias']

# Hand-reviewed overrides from the contact sheets.
#   PICKS: name -> exact Commons file title (without "File:").
#   BLOCK: Commons file titles never to use.   DROP: players left to drawn art.
PICKS = {
    # Sep 25 2026: Italy kit, Norway v Italy (6 Jun 2025) close-up; only failed face confidence (0.85 bar) in the auto run.
    'Gianluigi Donnarumma': 'Norway Italy - June 2025 B 33 - Gianluigi Donnarumma (close-up).jpg',
    # Sep 26 2026 deep audit (scripts/fetch-player-photos-deep.py), crops checked by eye; they failed only the
    # automatic yaw / face-confidence bars here:
    'Jordan Pickford': 'Jordan Pickford England v Ghana 23 June 2026-049.jpg',        # England GK kit
    'Reece James': 'Reece James England v Ghana 23 June 2026-248.jpg',                 # England No. 24
    'Kim Min-jae': 'FC Red Bull Salzburg gegen Bayern München (2025-01-06 Testspiel) 26.jpg',  # Bayern warm-up, depicts Kim only
    'Fermín López': 'Fermín López (cropped).jpg',   # re-reviewed Sep 26: face clear enough, Spain kit (was BLOCKed as soft)
}
BLOCK = {
    'Neymar Junior Brazil V Morocco 13 June 2026-145.jpg',        # in the stands, cap + casual shirt
    'Christian Pulisic Australia v USA 19 June 2026-67 (cropped).jpg',  # plain tee + necklace, not match kit
    'Christian Pulisic Australia v USA 19 June 2026-67.jpg',
    # Fox45 review (Sep 25 2026), looked at every accepted crop:
    'Antoine Semenyo 11, Reece James 24 England v Ghana at 2026 Fifa World Cup by YantsImages 01.jpg',  # head turned up/away, arm across
    'Bradley Barcola France v Senegal 16 June 2026-398.jpg',           # towel over head + training bib, not match kit
    'Joshua Kimmich 6, Nilson Angulo 20 Ecuador v Germany at 2026 Fifa World Cup by YantsImages 03.jpg',  # head down, three-quarter
    'Kaoru Mitoma and Nils Ramming 24012026 (1).jpg',                 # black hoodie, eyes down: not in kit
    'Nikola Vlasic Rafael Leao Croatia v Portugal 2 July 2026-125.jpg',  # head bowed, face half hidden
    'Raúl Jiménez 24082024.jpg',                                      # civilian tee + bag strap, blurred, looking down
    'Ryan Gravenberch, Dominik Szoboszlai and Conor Bradley 04012026 (1).jpg',  # dark, blurred, looking down
    'Ousmane Dembele Sadio Mane France v Senegal 16 June 2026-380.jpg',  # mid-action grimace, eyes shut
    'Fermín López.jpg',                                               # same shot uncropped: looking down
    'Raúl Jiménez 06042025 (1).jpg',                                  # arrival: training top + bag strap, waving
    # Sep 25 2026 new-card review
    'Anthony Gordon England v Ghana 23 June 2026-179.jpg',            # head down, No. 8 shirt (Anderson's number): identity unsure
}
DROP = {}

LICENSE_OK = re.compile(
    r'^(cc0(\s*1\.0)?|public\s*domain.*|pd([\s-].*)?|cc[\s-]by([\s-]sa)?[\s-]\d\.\d.*)$', re.I)
LICENSE_BAD = re.compile(r'\b(nc|nd)\b|non-?commercial|no-?deriv|fair\s*use', re.I)

POS_WORDS = ['match', ' vs', ' v ', 'versus', 'training', 'game', ' cup', 'league', 'friendly', 'qualif',
             'national football team', 'football team', 'national team', 'squad', 'team photo', 'line-up',
             'lineup', 'stadium', 'world cup', 'euro 20', 'copa ', 'championship', 'derby', 'supercup',
             'super cup', 'in action', 'warm', 'kit', 'jersey', 'uefa', 'fifa', 'liga', 'serie a',
             'bundesliga', 'premier league', 'final', 'playoff', 'penalty', 'celebrat', 'pitch', 'fc ', ' cf']
NEG_WORDS = ['ceremony', 'award', 'gala', 'press', 'conference', ' suit', 'statue', 'museum', 'visit',
             'meeting', 'premiere', 'festival', 'signing', 'autograph', 'studio', 'interview', 'mural',
             'painting', 'stamp', 'wax', 'ballon', 'reception', 'president', 'minister', 'wedding', 'charity',
             'mayor', 'honour', 'honor', 'unveil', 'book', 'presentation', 'sponsor', 'commercial',
             'ambassador', 'celebrity', 'event', 'concert', 'parliament', 'embassy', 'politic', 'funeral',
             'exhibition', 'drawing', 'caricature', 'poster', 'banner', 'fans', 'supporters', 'tv ',
             'television', 'show', 'talk', 'red carpet', 'party', 'launch', 'forum', 'summit', 'birthday',
             'selfie', 'kremlin', 'white house', 'palace', 'medal', 'trophy', 'honorary', 'tribute',
             'memorial', 'film', 'movie', 'photocall', 'fashion', 'music', 'unicef', 'foundation', 'visita',
             'entrega', 'parade', 'bus', 'airport', 'turisme', 'tourism', 'catpress', 'photoshoot', 'photo shoot', 'arrival', 'hospital', 'school', 'the best fifa', 'attends',
             'secretary', 'dinner', 'lunch', 'banquet', 'dhs', 'noem', 'trump', 'vance', 'biden', 'obama', 'macron', 'king ', 'prince']
SUBCAT_NEG = ['statue', 'art', 'signature', 'autograph', 'popular culture', 'caricature', 'mural', 'award',
              'event', 'family', 'wax', 'stamp', 'poster', 'honor', 'honour', 'politic', 'business', 'video',
              'audio', 'logo', 'monument', 'museum', 'wedding', 'house', 'charity', 'depiction', 'painting',
              'drawing', 'sculpture', 'president', 'ceremony', 'trophy', 'celebration', 'parade', 'fan']
ID_NEG = ['fan', 'fans', 'supporter', 'face paint', 'facepaint', 'painted face', 'mural', 'statue', 'wax',
          'banner', 'fan art', 'fanart', 'look-alike', 'lookalike', 'look alike', 'crowd', 'graffiti',
          'sculpture', 'tifo', 'cosplay', 'doll', 'figurine', 'shirt of', 'jersey of', 'signed shirt',
          'replica', 'painting', 'drawing', 'caricature', 'tattoo', 'poster', 'billboard', 'sticker',
          'boots', 'museum', 'exhibit', 'impersonator', 'mannequin', 'costume', 'tribute', 'memorial',
          'plaque', 'stamp', 'coin', 'kit on display', 'shirts', 'screen', 'screenshot', 'tv', 'mask',
          'cardboard', 'cutout', 'cut-out', 'lego', 'figure', 'kid', 'child', 'boy', 'girl', 'young fan']

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


# ---------------------------------------------------------------- network
class NetFail(Exception):
    """An API call kept failing (rate limit): the player is retried later
    instead of being judged on incomplete data."""


class Net:
    HOSTS = ('en.wikipedia.org', 'commons.wikimedia.org', 'upload.wikimedia.org')

    def __init__(self, cache, extra=()):
        self.cache = cache
        self.extra = [d for d in extra if d and os.path.isdir(d)]   # read-only caches (same sha1(url) keys)
        self.last = 0.0
        self.requests = 0
        os.makedirs(cache, exist_ok=True)

    def get(self, url, binary=False):
        key = hashlib.sha1(url.encode()).hexdigest()
        path = os.path.join(self.cache, key + ('.bin' if binary else '.txt'))
        for p in [path] + [os.path.join(d, os.path.basename(path)) for d in self.extra]:
            if os.path.exists(p):
                data = open(p, 'rb').read()
                if data == b'__404__':
                    return None
                return data if binary else data.decode('utf-8')
        host = urllib.parse.urlparse(url).netloc
        assert host in self.HOSTS, host
        delay = 20.0   # 429 / 5xx: wait at least this long (doubling), even when Retry-After is shorter
        for _ in range(10):
            gap = 4.0   # single shared runner: <= 1 req / 4 s on every Wikimedia host (project rule, Sep 2026)
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
                    pause = max(delay, float(ra) if ra and ra.isdigit() else 0)
                    print(f'   http {e.code}, backing off {pause:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(pause)
                    delay = min(delay * 2, 300)
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
    for c in OVERRIDES.get(name, []) + [name, f'{name} (footballer)']:
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


II_PROPS = dict(prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=600,
                iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                                    'DateTime|Categories|ImageDescription|ObjectName')


def _collect(d, out):
    norm_map = {n['to']: n['from'] for n in d.get('query', {}).get('normalized', [])}
    for p in d.get('query', {}).get('pages', {}).values():
        ii = (p.get('imageinfo') or [None])[0]
        if ii:
            ii['pageid'] = p.get('pageid')
            out[norm_map.get(p['title'], p['title']).split(':', 1)[1]] = ii


def files_with_info(net, cat, max_pages=8):
    """Files of a category WITH their imageinfo, 50 per request
    (generator=categorymembers), instead of a listing plus imageinfo calls."""
    out, cont = {}, {}
    for _ in range(max_pages):
        d = net.commons(action='query', generator='categorymembers', gcmtitle=cat, gcmtype='file',
                        gcmlimit=50, **II_PROPS, **cont)
        _collect(d, out)
        cont = d.get('continue') or {}
        cont.pop('continue', None)
        if not cont:
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
    cats = []
    if infobox_file:
        for c in file_categories(net, infobox_file):
            cname = c.split(':', 1)[1]
            if (has_all(tokens(name), cname) or has_all(tokens(base), cname)) and \
                    not any(w in norm(cname) for w in SUBCAT_NEG) and not year_of(cname) and \
                    ' with ' not in cname and ' in ' not in cname and ' at ' not in cname:
                cats.append(c)
    guesses = [f'Category:{article}', f'Category:{base} (footballer)'] + [f'Category:{a}' for a in ALIASES.get(name, [])]
    if base == article and len(tokens(name)) >= 2:
        guesses.append(f'Category:{name}')
    for c in existing_categories(net, [g for g in dict.fromkeys(guesses) if g not in cats]):
        cats.append(c)
    return list(dict.fromkeys(cats))


def subcat_rank(sc, club):
    scn = norm(sc)
    if any(w in scn for w in SUBCAT_NEG):
        return None
    y = year_of(sc)
    if y and y < WINDOW_FROM:
        return None
    rank = 0.0
    if y:
        rank += 3 + (y - WINDOW_FROM) * 0.5
    cur, (jy, _), nat, old = club
    if has_word(cur, scn):
        rank += 4
    if has_word(nat, scn):
        rank += 3.5
    if has_word(old, scn) and not has_word(cur, scn):
        rank -= 6
    if any(w in scn for w in (' with ', 'national', 'playing', 'match', 'team', ' fc', 'club', ' vs', ' v ')):
        rank += 1.5
    if re.search(r' by (year|season|club|team|date)', scn):
        rank += 5          # container: descended into below
    return rank


def gather(net, name, article, infobox_file, club):
    """Candidate file title -> provenance text (category names it came from)."""
    cats = player_categories(net, name, article, infobox_file)
    files, info = {}, {}
    if infobox_file:
        files[infobox_file] = 'infobox'
    subcats = []
    for c in cats:
        got = files_with_info(net, c)
        info.update(got)
        for f in got:
            files.setdefault(f, 'category')
        for sc in members(net, c, 'subcat'):
            r = subcat_rank(sc, club)
            if r is not None:
                subcats.append((r, sc))
    seen = set()
    queue = sorted(subcats, reverse=True)[:14]
    # one more level under the best subcategories ("X with Club in 2025", matches ...)
    for r, sc in list(queue):
        if r >= 4:
            for ssc in members(net, sc, 'subcat')[:80]:
                rr = subcat_rank(ssc, club)
                if rr is not None:
                    queue.append((rr + 0.5, ssc))
    for _, sc in sorted(queue, reverse=True)[:22]:
        if sc in seen:
            continue
        seen.add(sc)
        got = files_with_info(net, sc, max_pages=4)
        info.update(got)
        for f in got:
            files.setdefault(f, 'subcat:' + sc.split(':', 1)[1])
    d = net.commons(action='query', list='search', srnamespace=6, srlimit=50,
                    srsearch=' OR '.join(f'"{n}"' for n in [name] + ALIASES.get(name, [])[:1]))
    for r in d.get('query', {}).get('search', []):
        files.setdefault(r['title'].split(':', 1)[1], 'search')
    keep = {f: src for f, src in files.items() if re.search(r'\.(jpe?g|png|webp|tiff?)$', f, re.I)}
    return keep, cats, info


def imageinfo(net, titles):
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        _collect(net.commons(action='query', titles='|'.join('File:' + t for t in chunk), **II_PROPS), out)
    return out


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


def meta_score(name, base, file, src, ii, player_cats, qid, dep, club):
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
    # identity: title / description / depicts must name the player as the subject
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in ID_NEG) and not (qid and dep == {qid}):
        return None, 'id-neg'
    if dep and qid and qid not in dep:
        return None, 'depicts-other'
    named = any(has_all(tokens(n), subject) for n in [name, base] + ALIASES.get(name, []))
    if not ((qid and qid in dep) or named):
        return None, 'unnamed'
    if src == 'search':
        in_cat = any(norm(c.split(':', 1)[1]) in norm(cats) for c in player_cats)
        if player_cats and not in_cat:
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
    if y is None or not (WINDOW_FROM <= y <= THIS_YEAR):
        return None, 'date'
    mo = int(date[5:7]) if date and len(date) >= 7 and date[5:7].isdigit() else 6
    cur, joined, nat, old = club
    in_cur = has_word(cur, text)
    in_nat = has_word(nat, text) and any(w in text for w in NAT_CONTEXT)
    in_old = has_word(old, text)
    after = (y, mo) >= joined
    # kit: current club (photo taken after the transfer) or the national team
    if not after and not in_nat:
        return None, 'before transfer'
    if in_old and not in_nat and not (in_cur and after):
        return None, 'former club'
    pos = sum(w in text for w in POS_WORDS)
    neg = sum(w in text for w in NEG_WORDS)
    if (neg >= 2 and pos < 2) or (neg >= 1 and pos == 0):
        return None, 'off-pitch'
    score = min(pos, 4) * 1.0 - neg * 2.5
    score += 2.5 if (in_cur and after) else 0
    score += 2.0 if in_nat else 0
    score += 1 if src != 'search' else 0
    score += (y - WINDOW_FROM) * 0.6
    if dep == {qid}:
        score += 1.5
    if '(cropped)' in file.lower() or 'portrait' in text:
        score += 2.0      # crops made by Commons editors are usually a tight, single-player face
    return {'score': score, 'date': date, 'year': y, 'license': lic, 'licenseUrl': val('LicenseUrl'),
            'artist': val('Artist') or 'Unknown', 'descriptionurl': ii.get('descriptionurl', ''),
            'thumburl': ii.get('thumburl') or ii.get('url'), 'url': ii.get('url'), 'width': ii.get('width'),
            'height': ii.get('height'), 'src': src, 'text': text,
            'kit': 'club' if in_cur and after else ('national' if in_nat else 'unlabelled')}, None


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
        al = self.rec.alignCrop(bgr, face)
        return self.rec.feature(al)

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
    iw, ih = img.size
    fx, fy, fw, fh = [float(v) for v in face[:4]]
    cw = fw / FACE_FRAC
    ch = cw * 1.25
    left = fx + fw / 2 - cw / 2
    top = fy + fh / 2 - 0.40 * ch
    return left, top, cw, ch


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
    # <slug>-ink|tone.webp -> that half of the packed public/players/<slug>.webp (atomic; scripts/player_masks.py)
    player_masks.save_mask_alpha(a, path)


def riso_cell(slug):
    cell = np.full((H, W, 3), (0xff, 0xf1, 0xd3), np.float32)
    for layer, col in (('tone', (0xe9, 0x79, 0x8b)), ('ink', (0x1f, 0x3d, 0x36))):
        m = player_masks.read_layer(OUT_DIR, slug, layer).astype(np.float32)[..., None] / 255.0
        cell = cell * (1 - m) + cell * (np.array(col, np.float32) / 255.0) * m
    return Image.fromarray(cell.astype(np.uint8))


def sheet(cells, labels, path, scale=0.5, cols=8):
    cw, ch = int(W * scale), int(H * scale)
    rows = (len(cells) + cols - 1) // cols
    out = Image.new('RGB', (cols * cw, rows * (ch + 22)), (0xff, 0xf1, 0xd3))
    d = ImageDraw.Draw(out)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 12)
    except Exception:
        font = None
    for i, (c, lb) in enumerate(zip(cells, labels)):
        ox, oy = (i % cols) * cw, (i // cols) * (ch + 22)
        out.paste(c.resize((cw, ch), Image.LANCZOS), (ox, oy))
        d.text((ox + 3, oy + ch + 4), lb[:30], fill=(0x1f, 0x3d, 0x36), font=font)
    out.save(path)


# ---------------------------------------------------------------- main
WOMEN = {'Hannah Hampton', 'Mary Earps', 'Alyssa Naeher', 'Lucy Bronze', 'Wendie Renard', 'Leah Williamson',
         'Mapi León', 'Aitana Bonmatí', 'Alexia Putellas', 'Mariona Caldentey', 'Patri Guijarro', 'Lindsey Heaps',
         'Caroline Graham Hansen', 'Salma Paralluelo', 'Trinity Rodman', 'Lauren James', 'Chloe Kelly',
         'Clàudia Pina', 'Sam Kerr', 'Alessia Russo', 'Ewa Pajor', 'Khadija Shaw', 'Sophia Wilson',
         'Temwa Chawinga', 'Ada Hegerberg', 'Vivianne Miedema', 'Pernille Harder', 'Marta', 'Barbra Banda',
         'Asisat Oshoala'}


def load_players():
    """The men's current stars (the women's game has its own photo batch)."""
    data = json.load(open(PLAYERS_JSON, encoding='utf-8'))
    order = []
    for r in ROLES:
        for n in data[r].get('current', []):
            if n not in order and n not in WOMEN:
                order.append(n)
    return order


def reference(net, faces, name, infobox, cands_by_file):
    """Face embedding(s) of the player from the Wikipedia infobox photo."""
    refs = []
    if not infobox:
        return refs
    c = cands_by_file.get(infobox)
    if not c:
        info = imageinfo(net, [infobox]).get(infobox)
        if not info:
            return refs
        c = {'url': info.get('url'), 'thumburl': info.get('thumburl'), 'width': info.get('width', 0)}
    img = fetch_image(net, c, 960)
    if img is None:
        return refs
    fs, bgr = faces.detect(img)
    fs = sorted(fs, key=lambda f: f[2] * f[3], reverse=True)
    if fs and (len(fs) == 1 or fs[1][2] * fs[1][3] < 0.4 * fs[0][2] * fs[0][3]):
        refs.append(faces.embed(bgr, fs[0]))
    return refs


def evaluate(net, faces, scene, c, refs, tmp, log):
    """Full check of one candidate; returns (ok, info or reason)."""
    img = fetch_image(net, c, 960)      # standard bucket (600px thumbs return HTTP 400)
    if img is None:
        return False, 'download failed'
    fs, bgr = faces.detect(img)
    if not fs:
        return False, 'no face'
    if max(f[2] for f in fs) * c['width'] / img.size[0] < FACE_MIN:
        return False, 'face too small even at full size'
    # small faces at 1280 px: re-fetch a bigger standard bucket before identifying
    top = max(f[2] for f in fs)
    if top < 120 and c['width'] > img.size[0] * 1.05:
        want = next((b for b in (1280, 1920, 3840) if top * b / img.size[0] >= 120), 3840)
        big = fetch_image(net, c, want)
        if big is not None and big.size[0] > img.size[0] * 1.1:
            fs2, bgr2 = faces.detect(big)
            if fs2:
                img, fs, bgr = big, fs2, bgr2
    # identify the player's face among those detected
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
    # nobody else's head inside the portrait window (occlusion / group shot)
    left, top, cw, ch = crop_box(img, best)
    for f in fs:
        if f is best or f[2] < 0.35 * best[2]:
            continue
        fx, fy = f[0] + f[2] / 2, f[1] + f[3] / 2
        if left - f[2] * 0.3 < fx < left + cw + f[2] * 0.3 and top < fy < top + ch:
            return False, 'another face in the portrait'
    # the photo itself must fill the portrait window (no half-blank crops)
    iw, ih = img.size
    over = max(-left, left + cw - iw, -top, top + ch - ih) / cw
    if over > 0.08:
        return False, f'face too near the photo edge ({over:.2f})'
    fw = float(best[2])
    if fw < FACE_MIN:
        return False, f'face too small ({fw:.0f}px, needs {FACE_MIN:.0f})'
    if best[14] < (0.80 if c['file'] in PICKS.values() else 0.85):   # a hand-reviewed pick may sit just under the bar
        return False, f'low face confidence {best[14]:.2f}'
    yw, eyes = yaw(best)
    if abs(yw) > YAW_MAX or eyes < 0.28:
        return False, f'face turned away (yaw {yw:.2f}, eyes {eyes:.2f})'
    sh = sharpness(img, best)
    if sh < SHARP_MIN:
        return False, f'face blurred (sharp {sh:.0f})'
    # scene check on the torso region (suit / necktie = not in kit)
    left, top, cw, ch = crop_box(img, best)
    region = img.crop((max(0, round(left - cw * 0.25)), max(0, round(top)),
                       min(img.size[0], round(left + cw * 1.25)), min(img.size[1], round(top + ch * 1.6))))
    p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
    region.save(p, quality=90)
    labels = scene.labels(p)
    suit = lab(labels, 'suit', 'necktie', 'tuxedo', 'bow_tie', 'blazer')
    art = lab(labels, 'painting', 'drawing', 'illustration', 'sculpture', 'statue', 'screenshot', 'poster')
    if suit >= 0.3 or art >= 0.5:
        return False, f'suit {suit:.2f} / art {art:.2f}'
    # playing evidence: a match / training cue in the file text, or a sports
    # scene (pitch, stadium, ball) in the whole photo
    whole = os.path.join(tmp, 'w-' + os.path.basename(p))
    img.resize((min(960, img.size[0]), round(img.size[1] * min(960, img.size[0]) / img.size[0]))).save(whole, quality=85)
    wl = scene.labels(whole)
    pitch = lab(wl, 'sport', 'soccer', 'football', 'team_sport', 'stadium', 'ball', 'grass', 'athletics',
                'sportswear', 'jersey')
    if not any(w in c['text'] for w in MATCH_CUES) and pitch < 0.15:
        return False, f'no match/training evidence (pitch {pitch:.2f})'
    return True, {'img': img, 'face': best, 'sim': bsim, 'sharp': sh, 'yaw': yw, 'fw': fw,
                  'sport': lab(labels, 'sport', 'soccer', 'football', 'jersey', 'sportswear', 'team_sport',
                               'stadium', 'ball')}


def write_manifest(manifest, allnames):
    out = {n: manifest[n] for n in allnames if n in manifest}
    tmp = MANIFEST + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, MANIFEST)
    return out


def main():
    sp = os.path.join(tempfile.gettempdir(), 'futbol-player-photos-stars')
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(sp, 'cache'), help='shared on-disk response cache (sha1(url))')
    ap.add_argument('--models', default=os.path.join(sp, 'models'))
    ap.add_argument('--sheet', default=os.path.join(sp, 'sheet.png'))
    ap.add_argument('--review', default='', help='also write a colour source-crop sheet here')
    ap.add_argument('--extra-cache', default='', help='comma-separated read-only response caches to reuse')
    ap.add_argument('--only', default='')
    ap.add_argument('--debug', action='store_true')
    ap.add_argument('--yaw', type=float, default=YAW_MAX, help='max |nose offset| / eye distance')
    ap.add_argument('--tries', type=int, default=10)
    args = ap.parse_args()
    globals()['YAW_MAX'] = args.yaw

    net = Net(args.cache, args.extra_cache.split(',') if args.extra_cache else ())
    faces = Faces(*ensure_models(args.models))
    scene = Scene(args.cache)
    tmp = tempfile.mkdtemp(prefix='star-thumbs-')
    allnames = load_players()
    names = sorted(allnames, key=lambda n: (n not in PRIORITY, PRIORITY.index(n) if n in PRIORITY else 0))
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        names = [n for n in names if n in keep]
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    dropped, crops = {}, {}
    def process(name, i, total):
        if name not in CLUBS:
            dropped[name] = 'no club data in CLUBS'
            print(f'[{i + 1}/{total}] {name}: DROP no club data', flush=True)
            return
        tag = f'[{i + 1}/{total}] {name}'
        slug = slugify(name)

        def reject(reason):
            dropped[name] = reason
            manifest.pop(name, None)
            write_manifest(manifest, allnames)
            print(f'{tag}: DROP {reason}', flush=True)

        if (manifest.get(name) or {}).get('source', '').startswith('wikimedia/deep-audit'):
            # reviewed by hand in scripts/fetch-player-photos-deep.py (Sep 26 2026): never re-judge or drop it here
            print(f'{tag}: KEEP deep-audit pick', flush=True)
            return
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
        club = CLUBS[name]
        files, cats, info = gather(net, name, article, infobox, club)
        if name in PICKS:
            files.setdefault(PICKS[name], 'pick')
        info = {f: ii for f, ii in info.items() if f in files}
        info.update(imageinfo(net, [f for f in files if f not in info][:200]))
        qid = s.get('wikibase_item')
        dep = depicts(net, [ii.get('pageid') for ii in info.values()])
        cands, why = [], {}
        for f, ii in info.items():
            m, r = meta_score(name, base, f, files.get(f, 'search'), ii, cats, qid,
                              dep.get(ii.get('pageid'), set()), club)
            if m:
                cands.append(dict(m, file=f))
            else:
                why[r] = why.get(r, 0) + 1
        by_file = {c['file']: c for c in cands}
        refs = reference(net, faces, name, infobox, by_file)
        if args.debug:
            print(f'   {len(files)} files, {len(cands)} cands, refs {len(refs)}, meta rejects {why}', flush=True)
        if not cands:
            reject(f'no free in-window photo naming the player ({len(files)} files)')
            return
        if name in PICKS:
            ranked = [c for c in cands if c['file'] == PICKS[name]]
        else:
            ranked = sorted([c for c in cands if c['file'] not in BLOCK], key=lambda c: c['score'], reverse=True)
        chosen = None
        for c in ranked[:args.tries]:
            ok, res = evaluate(net, faces, scene, c, refs, tmp, print)
            if not ok:
                if args.debug:
                    print(f'   - {c["file"]} ({c["date"]}, {c["kit"]}, meta {c["score"]:.1f}): {res}', flush=True)
                continue
            chosen = (c, res)
            break
        if not chosen:
            reject('no in-kit photo with a big, sharp, frontal face that matches the infobox')
            return
        c, res = chosen
        crop = portrait_crop(res['img'], res['face'])
        crops[name] = (crop, c)
        if args.review:
            os.makedirs(os.path.join(os.path.dirname(os.path.abspath(args.review)), 'src'), exist_ok=True)
            crop.save(os.path.join(os.path.dirname(os.path.abspath(args.review)), 'src', slug + '.jpg'), quality=88)
        ink, tone = riso(crop)
        save_mask(ink, os.path.join(OUT_DIR, f'{slug}-ink.webp'))
        save_mask(tone, os.path.join(OUT_DIR, f'{slug}-tone.webp'))
        manifest[name] = {
            'slug': slug, 'article': article, 'file': c['descriptionurl'], 'artist': c['artist'],
            'license': c['license'], 'licenseUrl': c['licenseUrl'], 'date': c['date'],
        }
        write_manifest(manifest, allnames)
        print(f'{tag}: OK {c["file"]} ({c["date"]}, {c["kit"]}, {c["license"]}, face {res["fw"]:.0f}px, '
              f'id {res["sim"]:.2f}, sharp {res["sharp"]:.0f}, yaw {res["yaw"]:.2f})', flush=True)

    queue = list(names)
    deferred = {}
    i = -1
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

    manifest = write_manifest(manifest, allnames)
    acc = list(manifest)
    if acc:
        os.makedirs(os.path.dirname(os.path.abspath(args.sheet)), exist_ok=True)
        sheet([riso_cell(manifest[n]['slug']) for n in acc], acc, args.sheet)
    if args.review and crops:
        src = [n for n in allnames if n in crops]
        sheet([crops[n][0] for n in src], [f'{n} {crops[n][1]["date"]}' for n in src], args.review)
    shutil.rmtree(tmp, ignore_errors=True)
    print('\nrequests', net.requests)
    print('accepted', len(acc), 'of', len(allnames))
    for n, r in dropped.items():
        print('dropped', n, '-', r)


if __name__ == '__main__':
    main()
