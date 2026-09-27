#!/usr/bin/env python3
"""Fetch freely licensed Wikimedia Commons photos of the footballers in
lib/town/positionPlayers.json -- taken while they were PLAYING (in kit, in a
match / training / team photo, dated inside their career) -- and turn them
into riso-print portrait masks for the player cards.

Outputs
  public/players/<slug>-ink.webp   dark ink: 45deg halftone + solid darkest tones
  public/players/<slug>-tone.webp  midtone ink: 15deg halftone
  lib/town/playerPhotos.json       manifest: source file, date, artist, license

Both webp files are ALPHA MASKS: RGB is plain black, alpha is ink coverage, so
the card can tint them with any riso colour. Head sits in the upper-middle and
the shoulders run off the bottom edge (cards anchor them centre-bottom).

Pipeline per player
  1. Resolve the en.wikipedia article (REST summary; disambiguations tried;
     summary must mention football / futsal).
  2. Gather candidate Commons files: the infobox image, the player's Commons
     category + name-matching subcategories ("<Name> with <club>",
     "<Name> in <year>" ...), and a namespace-6 search.
  3. Batch-fetch extmetadata; keep only CC0 / PD / CC BY / CC BY-SA files dated
     inside the player's playing career (CAREER, or the recent seasons for
     current players). Score by text cues (match, training, team photo ... vs
     ceremony, award, press, suit ...).
  4. Download small thumbs of the best few and run Apple Vision (face
     rectangles + scene classification, via a tiny Swift helper compiled on
     first use) to require a clear, reasonably frontal face and penalise
     suits/neckties while rewarding sport scenes.
  5. PICKS / BLOCK below hold hand-reviewed overrides from the contact sheets.
  6. Crop 4:5 tightly on the face, riso-process, write masks + manifest.

Usage
  python3 scripts/fetch-player-photos.py [--cache DIR] [--sheet PNG]
        [--review DIR] [--only "Name,Name"]

Network: only Wikipedia/Wikimedia APIs + upload.wikimedia.org, <= 1 req / 0.5 s,
retry with backoff on 429/5xx. Responses are cached in --cache so re-runs (for
tuning the riso stage or overrides) do not hit the network again.
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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYERS_JSON = os.path.join(ROOT, 'lib/town/positionPlayers.json')
MANIFEST = os.path.join(ROOT, 'lib/town/playerPhotos.json')
OUT_DIR = os.path.join(ROOT, 'public/players')
UA = 'FutbolIslandPhotos/1.0'
FUTSAL_ROLES = {'goleiro', 'fixo', 'ala', 'pivot'}
W, H = 320, 400
THIS_YEAR = 2026

# Hand-picked article titles for names whose plain title is a disambiguation
# page or a different person. Futsal names map to the futsal player's article.
OVERRIDES = {
    'Alisson': ['Alisson Becker'],
    'Rodri': ['Rodri (footballer, born 1996)'],
    'Vitinha': ['Vitinha (footballer, born 2000)'],
    'Marquinhos': ['Marquinhos (footballer, born 1994)', 'Marquinhos'],
    'Carlos Alberto': ['Carlos Alberto Torres'],
    'Ronaldo Nazário': ['Ronaldo (Brazilian footballer)'],
    'Luis Díaz': ['Luis Díaz (Colombian footballer)', 'Luis Díaz (footballer, born 1997)'],
    'João Neves': ['João Neves (footballer, born 2004)', 'João Neves'],
    'Nuno Mendes': ['Nuno Mendes (footballer, born 2002)', 'Nuno Mendes'],
    'Marcelo': ['Marcelo (footballer, born 1988)', 'Marcelo Vieira'],
    'Luis Suárez': ['Luis Suárez'],
    'Rivaldo': ['Rivaldo'],
    'Zico': ['Zico (footballer)', 'Zico'],
    'Kaká': ['Kaká'],
    'Raúl': ['Raúl (footballer)', 'Raúl González'],
    'Paolo Rossi': ['Paolo Rossi'],
    'Rui Costa': ['Rui Costa'],
    'Pepe': ['Pepe (footballer, born February 1983)'],
    'Lúcio': ['Lúcio (footballer, born 1978)', 'Lúcio'],
    # futsal
    'Ricardinho': ['Ricardinho (futsal player, born 1985)', 'Ricardinho (futsal player)'],
    'Falcão': ['Falcão (futsal player)'],
    'Robinho': ['Robinho (futsal player)'],
    'Pauleta': ['Pauleta (futsal player)'],
    'Ferrão': ['Ferrão (futsal player)'],
    'Higuita': ['Leo Higuita', 'Higuita (futsal player)'],
    'Neto': ['Neto (futsal player)'],
    'Gabriel': ['Gabriel (futsal player)'],
    'Schumacher': ['Schumacher (futsal player)'],
}

# Local spellings used in archive captions.
ALIASES = {
    'Johan Cruyff': ['Cruijff'], 'Lev Yashin': ['Jasjin', 'Iachine', 'Jaschin'],
    'Ferenc Puskás': ['Puskas'], 'Gerd Müller': ['Muller', 'Mueller'], 'Hristo Stoichkov': ['Stoitsjkov'],
    'Eusébio': ['Eusebio'], 'Garrincha': ['Garrincha'], 'Franz Beckenbauer': ['Beckenbauer'],
    'Sepp Maier': ['Maier'], 'Alfredo Di Stéfano': ['Di Stefano', 'Distefano'], 'Pelé': ['Pele'],
}

# Women's all-time greats are handled by a separate batch/agent.
WOMEN = {'Hope Solo', 'Nadine Angerer', 'Carli Lloyd', 'Formiga', 'Homare Sawa', 'Michelle Akers',
         'Megan Rapinoe', 'Kristine Lilly', 'Lieke Martens', 'Mia Hamm', 'Abby Wambach', 'Birgit Prinz',
         'Christine Sinclair', 'Alex Morgan', 'Sun Wen', 'Marta', 'Alexia Putellas', 'Aitana Bonmatí',
         'Sam Kerr', 'Ada Hegerberg', 'Wendie Renard', 'Lucy Bronze', 'Steffi Jones', 'Nadine Kessler'}

# Names whose only matching article is a different player than the one meant.
SKIP = {
    'Edu',  # listed as a futsal goalkeeper; 'Edu (futsal player)' is an Azerbaijani winger
}

# Playing careers (first, last season year) for retired / veteran players, so
# only photos from their playing days qualify. Current players default to the
# recent seasons (CURRENT_FROM).
CAREER = {
    # goalkeepers
    'Lev Yashin': (1950, 1971), 'Gianluigi Buffon': (1995, 2023), 'Iker Casillas': (1999, 2019),
    'Manuel Neuer': (2006, 2026), 'Oliver Kahn': (1987, 2008), 'Dino Zoff': (1961, 1983),
    'Peter Schmeichel': (1981, 2003), 'Gordon Banks': (1958, 1978), 'Edwin van der Sar': (1990, 2011),
    'Sepp Maier': (1962, 1980),
    # full-backs
    'Cafu': (1989, 2008), 'Roberto Carlos': (1991, 2015), 'Paolo Maldini': (1985, 2009),
    'Philipp Lahm': (2002, 2017), 'Javier Zanetti': (1992, 2014), 'Dani Alves': (2001, 2023),
    'Carlos Alberto': (1963, 1982), 'Ashley Cole': (1999, 2019), 'Nílton Santos': (1948, 1964),
    'Gary Neville': (1992, 2011),
    # centre-backs
    'Franz Beckenbauer': (1964, 1983), 'Franco Baresi': (1977, 1997), 'Fabio Cannavaro': (1992, 2011),
    'Alessandro Nesta': (1993, 2014), 'Sergio Ramos': (2003, 2026), 'Bobby Moore': (1958, 1978),
    'Carles Puyol': (1997, 2014), 'Rio Ferdinand': (1995, 2015), 'Daniel Passarella': (1971, 1989),
    # midfielders
    'Zinedine Zidane': (1989, 2006), 'Xavi Hernández': (1998, 2019), 'Andrés Iniesta': (2002, 2024),
    'Michel Platini': (1972, 1987), 'Andrea Pirlo': (1995, 2017), 'Steven Gerrard': (1998, 2016),
    'Paul Scholes': (1993, 2013), 'Lothar Matthäus': (1979, 2000), 'Frank Rijkaard': (1980, 1995),
    'Roy Keane': (1989, 2006),
    # wingers
    'Garrincha': (1951, 1972), 'George Best': (1963, 1984), 'Cristiano Ronaldo': (2002, 2026),
    'Lionel Messi': (2004, 2026), 'Ronaldinho': (1998, 2015), 'Ryan Giggs': (1990, 2014),
    'Stanley Matthews': (1932, 1965), 'Luís Figo': (1989, 2009), 'Arjen Robben': (2000, 2021),
    'Franck Ribéry': (2000, 2022),
    # strikers
    'Pelé': (1956, 1977), 'Ronaldo Nazário': (1993, 2011), 'Marco van Basten': (1981, 1995),
    'Gerd Müller': (1963, 1981), 'Alfredo Di Stéfano': (1945, 1966), 'Romário': (1985, 2009),
    'Gabriel Batistuta': (1988, 2005), 'Thierry Henry': (1994, 2014), 'Ruud van Nistelrooy': (1993, 2012),
    'Eusébio': (1957, 1979), 'Robert Lewandowski': (2021, 2026),
    # added legends
    'Petr Čech': (1999, 2019), 'David Seaman': (1981, 2004), 'Fabien Barthez': (1990, 2007),
    'Jorge Campos': (1988, 2004), 'Marcelo': (2005, 2025), 'Lilian Thuram': (1990, 2008),
    'Patrice Evra': (1998, 2019), 'Giacinto Facchetti': (1960, 1978), 'John Terry': (1998, 2018),
    'Jamie Carragher': (1996, 2013), 'Nemanja Vidić': (2000, 2016), 'Gerard Piqué': (2004, 2022),
    'Thiago Silva': (2002, 2026), 'Giorgio Chiellini': (2000, 2023), 'David Beckham': (1992, 2013),
    'Frank Lampard': (1995, 2016), 'Kaká': (2001, 2017), 'Luka Modrić': (2003, 2026),
    'Toni Kroos': (2007, 2024), 'Patrick Vieira': (1993, 2011), 'Bobby Charlton': (1956, 1976),
    'Diego Maradona': (1976, 1997), 'Johan Cruyff': (1964, 1984), 'Rivaldo': (1991, 2014),
    'Hristo Stoichkov': (1982, 2003), 'Pavel Nedvěd': (1991, 2009), 'Eden Hazard': (2007, 2023),
    'Wayne Rooney': (2002, 2021), 'Alan Shearer': (1988, 2006), 'Didier Drogba': (1998, 2018),
    "Samuel Eto'o": (1997, 2019), 'Zlatan Ibrahimović': (1999, 2023), 'Ferenc Puskás': (1943, 1966),
    'Luis Suárez': (2005, 2026), 'Zico': (1971, 1994),
    'Roberto Baggio': (1982, 2004), 'Francesco Totti': (1992, 2017), 'Alessandro Del Piero': (1991, 2014),
    'Dennis Bergkamp': (1986, 2006), 'Raúl': (1994, 2015), 'Andriy Shevchenko': (1994, 2012),
    'Paolo Rossi': (1973, 1987), 'George Weah': (1985, 2003), 'Kenny Dalglish': (1969, 1990),
    'Michael Laudrup': (1981, 1998), 'Gheorghe Hagi': (1982, 2001), 'Rui Costa': (1990, 2008),
    'Clarence Seedorf': (1992, 2014), 'Claude Makélélé': (1991, 2011), 'Michael Owen': (1996, 2013),
    'Gary Lineker': (1978, 1994),
    # Sep 25 2026 additions (cards 354-372; seasons from the en.wikipedia infoboxes)
    'Ivan Rakitić': (2004, 2025), 'Raphaël Varane': (2010, 2024), 'Juan Román Riquelme': (1996, 2015),
    'Jay-Jay Okocha': (1990, 2008), 'Pepe': (2001, 2024), 'Park Ji-sung': (2000, 2014), 'Gareth Bale': (2006, 2023),
    'Ángel Di María': (2005, 2026), 'Mesut Özil': (2006, 2023), 'Jordi Alba': (2006, 2025),
    'Javier Mascherano': (2003, 2020), 'Carlos Tevez': (2001, 2022), 'Sergio Agüero': (2003, 2021),
    'Mario Balotelli': (2006, 2026),
    'Vincent Kompany': (2003, 2020), 'Leonardo Bonucci': (2005, 2024), 'Cesc Fàbregas': (2003, 2023),
    'Edinson Cavani': (2005, 2026), 'Thomas Müller': (2008, 2026), 'Keylor Navas': (2005, 2026), 'Lúcio': (1997, 2020),
    # Sep 26 2026 additions (cards 389-400; seasons from the en.wikipedia infoboxes)
    'Ronald Koeman': (1980, 1997), 'Ricardo Quaresma': (2001, 2022), 'Bastian Schweinsteiger': (2002, 2019),
    'Wesley Sneijder': (2002, 2019), 'Ruud Gullit': (1979, 1998), 'Ian Rush': (1978, 2000), 'Peter Crouch': (1998, 2019),
    'Freddie Ljungberg': (1994, 2014), 'Robin van Persie': (2001, 2019), 'Laurent Blanc': (1983, 2003),
    'Filippo Inzaghi': (1991, 2012),
    # futsal all-time (approximate; generous where uncertain)
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
DEBUG = False
FACE_FRAC = 0.42             # face box width / crop width (>= 0.38 required)
PICK_FACE_MIN = 45           # px, reviewed picks only
FACE_MIN = 68                # px; 320 * FACE_FRAC / FACE_MIN <= 2x upscale
SHARP_MIN = 60.0             # Laplacian variance of the face at 128 px; below = blurry
CURRENT_FROM = 2023          # "current or most recent playing season"
CURRENT_FROM_FUTSAL = 2020   # futsal photos on Commons are far rarer

# Hand-reviewed overrides from the contact sheets.
#   PICKS: name -> exact Commons file title (without "File:") to use.
#   BLOCK: Commons file titles never to use (wrong person, suit, blurry ...).
#   DROP:  players to leave out (no usable in-kit playing photo found).
#   A pick may be (file, face) where face = 'left' / 'right' / 'top' chooses
#   which detected face is the player in a two-person photo, or a reviewed
#   face box {x, y, w, h} (fractions of the image) when detection misses it.
PICKS = {
    # Real Madrid v Eibar, 13 Jan 2004 -- Zidane (white kit, left) with Kepa
    # Zarraga. The only playing-era Commons photo of Zidane with a usable face:
    # the 2005 shot's face is 40 px and blurred, the 2006 final shots show him
    # from behind / in profile.
    # Vision misses his face at the frame edge, so the box is given by hand.
    'Zinedine Zidane': ('Kepa Zarraga-Arregi.jpg', {'x': 0.043, 'y': 0.375, 'w': 0.119, 'h': 0.0875}),
    # Sep 25 2026: Sweden line-up, 2006 World Cup (10 Jun 2006), yellow No. 10 kit.
    # Frontal, face 139 px, sharp 118. The Man Utd / PSG / Galaxy match shots are
    # small, turned or blurred faces; the June 2018 portrait is out of kit.
    'Zlatan Ibrahimović': 'Zlatan Ibrahimovic (cropped).jpg',
    # Sep 26 2026 deep audit (scripts/fetch-player-photos-deep.py), crops checked by eye:
    # Kaká in AC Milan kit v Torino, 19 Apr 2009 (Tsutomu Takasu, CC BY 2.0, Flickr-reviewed).
    'Kaká': 'Kaka of AC Milan, April 19, 2009.jpg',
    # Jordi Alba (alone in frame) in the Inter Miami line-up v New England, 9 Jul 2025 (CC BY-SA 4.0).
    'Jordi Alba': 'Jordi Alba NE Revolution Inter Miami 7.9.25-047 (cropped).jpg',
}
BLOCK = {
    'Didi pela Seleção Brasileira.jpg',   # Didi, not Nílton Santos
    'AllezZizou.jpg',   # a young fan celebrating Zidane, not Zidane
    'Zinedine zidane wcf 2006-edit.jpg', 'Zinedine zidane wcf 2006.jpg',   # seen from behind / profile
    'Maradona besa camiseta.jpg',          # shirt held over his mouth
    'Platini panini fussball.jpg', 'Platini panini calciatori.jpg',   # sticker scans with printed captions
    # Sep 24 2026 card review
    'Manchester United v FC Rostov, March 2017 (17).JPG',   # the clear face is Daley Blind, not Zlatan
    'Clarence Seedorf, Marco Yepes & Thomas Vermaelen (4866982475).jpg',   # the clear face is Yepes
    'Zarra y Matthews, Estadio, 1950-07-22 (375).jpg',   # the visible face is most likely Zarra
    'Norway Italy - June 2025 B 13.jpg',   # Donnarumma from behind, face turned away
    'Lev Yashin 1960d.jpg',                # tiny, motion-blurred face
    # Sep 24 2026 photo-runner review
    '1966–67 Serie A - AC Mantova v Inter Milan - Facchetti consoles Sarti.jpg',   # profile, face not visible
    'FC RB Salzburg v.Real Madrid (Testspiel, 7. August 2019) 23.jpg',   # Kroos seen from behind
    'Patrick Vieira - Inter Mailand (3).jpg',    # face in profile, small
    'Zico, Fundo Correio da Manhã.tif',          # face looking down / obscured
    '欧文 (2013).jpg',                            # Owen at a sponsor event with a microphone, retired
    'Man Utd vs Arsenal 2009-04-29.jpg',         # the clear face is an Arsenal player, not Rooney
    'Jamie Carragher 2005.jpg',                  # jacket, face turned down
    # Sep 25 2026 new-card review
    'NE Revolution Inter Miami 7.9.25-056 (Lionel Messi).jpg',   # the face is Messi, not Jordi Alba
    'FWC 2018 - Group D - ARG v ISL - Photo 127.jpg',            # the face is Messi, not Mascherano
    'Sergio Agüero 20180626.jpg',                                # small square source: crop leaves a blank band
    'Luis Suárez NE Revolution Inter Miami 7.9.25-025.jpg',        # the face is Suárez, not Jordi Alba
}
DROP = set()   # Sep 26 2026: Jordi Alba now has a reviewed PICK (the Sep 25 auto picks were Messi / Suárez)

LICENSE_OK = re.compile(
    r'^(cc0(\s*1\.0)?|public\s*domain.*|pd([\s-].*)?|cc[\s-]by([\s-]sa)?[\s-]\d\.\d.*)$', re.I)
LICENSE_BAD = re.compile(r'\b(nc|nd)\b|non-?commercial|no-?deriv|fair\s*use', re.I)

POS_WORDS = ['match', ' vs', ' v ', 'versus', 'training', 'game', ' cup', 'league', 'friendly', 'qualif',
             'national football team', 'football team', 'national team', 'squad', 'team photo', 'line-up',
             'lineup', 'stadium', 'world cup', 'euro 20', 'copa ', 'championship', 'derby', 'supercup',
             'super cup', 'in action', 'warm', 'kit', 'jersey', 'players of', 'futsal team', 'uefa', 'fifa',
             'liga', 'serie a', 'bundesliga', 'premier league', 'eredivisie', 'final', 'playoff',
             'goalkeeping', 'penalty', 'celebrat', 'pitch', 'wc 20', 'fc ', ' cf', 'club',
             # Dutch (Anefo), Spanish (El Grafico), German, Portuguese, Italian captions
             'tegen', 'wedstrijd', 'voetbal', 'elftal', 'interland', 'partido', 'seleccion', 'spiel',
             'landerspiel', 'nationalmannschaft', 'jogo', 'selecao', 'contra', 'partita', 'nazionale',
             'futbol', 'fussball', 'calcio', 'bestanddeelnr']
NEG_WORDS = ['ceremony', 'award', 'gala', 'press', 'conference', ' suit', 'statue', 'grave', 'museum',
             'visit', 'meeting', 'premiere', 'festival', 'signing', 'autograph', 'coach', 'manager',
             'studio', 'interview', 'mural', 'painting', 'stamp', 'wax', 'tussaud', 'ballon', 'reception',
             'president', 'minister', 'wedding', 'charity', 'legends', 'veteran', 'mayor', 'honour',
             'honor', 'unveil', 'book', 'presentation', 'sponsor', 'commercial', 'ambassador', 'celebrity',
             'event', 'concert', 'parliament', 'embassy', 'politic', 'hall of fame', 'funeral', 'exhibition',
             'draw', 'drawing', 'caricature', 'poster', 'banner', 'fans', 'supporters', 'tv ', 'television',
             'show', 'talk', 'red carpet', 'party', 'launch', 'forum', 'summit', 'debate', 'ambassador',
             'birthday', 'wax', 'selfie', 'kremlin', 'white house', 'palace', 'medal', 'honorary', 'tribute',
             'memorial', 'retire', 'farewell', 'pundit', 'commentator', 'broadcast', 'podcast', 'film',
             'movie', 'cinema', 'photocall', 'fashion', 'music', 'unicef', 'foundation', 'visita', 'entrega',
             'entrevista', 'interview', 'persconferentie', 'pressekonferenz', 'huldiging', 'receptie']
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


UNKNOWN_AUTHOR = re.compile(r'^(?:unknown(?: author)?|author unknown|неизвестен|desconocido|sconosciuto|onbekend|unbekannt)$', re.I)


def clean_artist(s):
    """Card credit from Commons' Artist field: drop the "(talk) <signature
    date>" tails and the doubled text of the Unknown-author template (its
    hidden and visible spans both survive strip_html)."""
    s = strip_html(s)
    s = re.sub(r'\s*\(\s*talk\s*\).*$', '', s)
    half = len(s) // 2
    if len(s) % 2 == 0 and s[:half] == s[half:]:
        s = s[:half]
    s = re.sub(r'^(.+?)\s+\1$', r'\1', s).strip(' ,;')
    return 'Unknown author' if not s or UNKNOWN_AUTHOR.match(s) else s


# ---------------------------------------------------------------- network
class Net:
    def __init__(self, cache):
        self.cache = cache
        self.last = 0.0
        self.requests = 0
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
        assert host in ('en.wikipedia.org', 'commons.wikimedia.org', 'upload.wikimedia.org'), host
        delay = 20.0   # 429 / 5xx: wait at least this long (doubling), even when Retry-After is shorter
        for _ in range(6):
            # upload.wikimedia.org rate-limits thumbnail renders harder: go slower there
            # the Commons API throttles anonymous clients hard (Retry-After up to
            # 10 min), so it gets the slowest pace
            gap = 4.0   # single shared runner: <= 1 req / 4 s on every Wikimedia host (project rule, Sep 2026)
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
                    pause = max(delay, float(ra) if ra and ra.isdigit() else 0)   # Retry-After, never below the backoff
                    print(f'   http {e.code}, backing off {pause:.0f}s', file=sys.stderr, flush=True)
                    time.sleep(pause)
                    delay = min(delay * 2, 300)
                    continue
                return None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                time.sleep(delay)
                delay *= 2
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


# ---------------------------------------------------------------- article
def summary(net, title):
    t = urllib.parse.quote(title.replace(' ', '_'), safe='')
    return net.json(f'https://en.wikipedia.org/api/rest_v1/page/summary/{t}')


def search_titles(net, q):
    url = ('https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=5&srsearch='
           + urllib.parse.quote(q))
    d = net.json(url) or {}
    return [r['title'] for r in d.get('query', {}).get('search', [])]


def summary_ok(s, futsal):
    if not s or s.get('type') != 'standard':
        return False
    text = norm((s.get('description') or '') + ' ' + (s.get('extract') or ''))
    if futsal:
        return 'futsal' in text
    return bool(re.search(r'footballer|association football|\bfootball\b|soccer', text)) and \
        'american football' not in text


def resolve(net, name, futsal):
    """Return (summary, method) or (None, reason)."""
    if name in SKIP:
        return None, 'skipped'
    cands = list(OVERRIDES.get(name, []))
    cands += [f'{name} (futsal player)', name] if futsal else [name, f'{name} (footballer)']
    seen = set()
    for c in cands:
        if c in seen:
            continue
        seen.add(c)
        s = summary(net, c)
        if summary_ok(s, futsal):
            return s, 'override' if c in OVERRIDES.get(name, []) else 'direct'
    # Search fallback: every name token must be in the title or in the article's
    # subject (first sentence up to " is "), so siblings/namesakes do not match.
    for t in search_titles(net, f'{name} {"futsal" if futsal else "footballer"}'):
        if t in seen:
            continue
        seen.add(t)
        s = summary(net, t)
        subject = (s or {}).get('extract', '').split(' is ')[0]
        if summary_ok(s, futsal) and has_all(tokens(name), t + ' ' + subject):
            return s, 'search'
    return None, 'not found'


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
    m = re.search(r'\b(18[5-9]\d|19\d\d|20[0-3]\d)\b', text or '')
    return int(m.group(1)) if m else None


def file_categories(net, title):
    d = net.commons(action='query', prop='categories', titles='File:' + title, clshow='!hidden', cllimit=50)
    out = []
    for p in d.get('query', {}).get('pages', {}).values():
        out += [c['title'] for c in p.get('categories', [])]
    return out


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


def player_categories(net, name, article, infobox_file):
    base = re.sub(r'\s*\(.*\)$', '', article)
    toks_name, toks_base = tokens(name), tokens(base)
    mononym = len(toks_name) < 2 and len(toks_base) < 2
    cats = []
    if infobox_file:
        for c in file_categories(net, infobox_file):
            cname = c.split(':', 1)[1]
            if (has_all(toks_name, cname) or has_all(toks_base, cname)) and \
                    not any(w in norm(cname) for w in SUBCAT_NEG) and not year_of(cname) and \
                    ' with ' not in cname and ' in ' not in cname and ' at ' not in cname:
                cats.append(c)
    guesses = [f'Category:{article}']
    # a bare-name category is only trusted when the article itself needs no
    # disambiguator (otherwise "Category:Luis Díaz" may be a namesake)
    if base == article and not mononym:
        guesses += [f'Category:{name}']
    if mononym or base != article:
        guesses += [f'Category:{base} (futsal player)', f'Category:{base} (footballer)']
    for c in existing_categories(net, [g for g in dict.fromkeys(guesses) if g not in cats]):
        cats.append(c)
    return list(dict.fromkeys(cats))


II_PARAMS = dict(prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=600,
                 iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                                     'DateTime|Categories|ImageDescription|ObjectName')


def gen_files(net, **gen):
    """One API call: generator (category members / search) + imageinfo."""
    d = net.commons(action='query', **gen, **II_PARAMS)
    out = {}
    for p in d.get('query', {}).get('pages', {}).values():
        ii = (p.get('imageinfo') or [None])[0]
        if ii and p.get('ns') == 6:
            ii['pageid'] = p.get('pageid')
            out[p['title'].split(':', 1)[1]] = ii
    return out


def gather(net, name, article, infobox_file, window, is_current, qid=None):
    """Candidate files with metadata: {title: ii}, provenance {title: src},
    depicts sets {pageid: {qid}} and the player's Commons categories.
    Uses generator queries so each list comes with its metadata in one call
    (the Commons API throttles anonymous clients hard)."""
    cats = player_categories(net, name, article, infobox_file)
    info, src = {}, {}

    def add(found, how):
        for f, ii in found.items():
            if f not in info:
                info[f], src[f] = ii, how

    if infobox_file:
        add(imageinfo(net, [infobox_file]), 'infobox')
    subcats = []
    for c in cats:
        add(gen_files(net, generator='categorymembers', gcmtitle=c, gcmtype='file', gcmlimit=50), 'category')
        for sc in members(net, c, 'subcat'):
            scn = norm(sc)
            if any(w in scn for w in SUBCAT_NEG):
                continue
            y = year_of(sc)
            if y and not (window[0] <= y <= window[1]):
                continue
            rank = 0
            if y:
                rank += 3 + ((y - window[0]) / 10 if is_current else 0)
            if any(w in scn for w in (' with ', 'national', 'playing', 'match', 'team', ' fc', 'club')):
                rank += 2
            subcats.append((rank, sc))
    for _, sc in sorted(subcats, reverse=True)[:6]:
        add(gen_files(net, generator='categorymembers', gcmtitle=sc, gcmtype='file', gcmlimit=50), 'subcat')
    dep = {}
    if qid:
        # files whose structured data says they depict him
        found = gen_files(net, generator='search', gsrnamespace=6, gsrlimit=50,
                          gsrsearch=f'haswbstatement:P180={qid}')
        for f, ii in found.items():
            dep[ii['pageid']] = {qid}
        add(found, 'depicts')
    q = f'"{article if len(tokens(name)) < 2 else name}"'
    queries = [q]
    if window[0] < 2000:
        # photo archives rich in playing-era legends: Nationaal Archief/Anefo
        # (NL, titles carry "Bestanddeelnr"), El Grafico (AR), Bundesarchiv (DE)
        surname = name.split()[-1]
        queries += [f'{surname} Bestanddeelnr', f'{surname} "El Gráfico"', f'{surname} Bundesarchiv']
    for qq in queries:
        add(gen_files(net, generator='search', gsrnamespace=6, gsrlimit=50, gsrsearch=qq), 'search')
    keep = {f: ii for f, ii in info.items() if re.search(r'\.(jpe?g|png|webp|tiff?)$', f, re.I)}
    return keep, src, dep, cats


def imageinfo(net, titles):
    out = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i:i + 40]
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
    """Structured-data 'depicts' (P180) Q-ids per Commons file page id."""
    out = {}
    ids = [i for i in pageids if i]
    for i in range(0, len(ids), 40):
        chunk = ids[i:i + 40]
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
          'boots', 'museum', 'exhibit', 'impersonator', 'mannequin', 'costume', 'allez', 'tribute',
          'memorial', 'grave', 'bust of', 'plaque', 'stamp', 'coin', 'kit on display', 'shirts']


def meta_score(name, file, src, ii, window, is_current, player_cats, qid, base, dep):
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
    # identity: the file must depict the player as its subject. Structured
    # 'depicts' wins when present; otherwise the title/description (not just
    # a category) has to name the player, and fan/mural/statue/jersey-only
    # files are refused.
    subject = norm(file + ' | ' + desc)
    if any(re.search(r'\b' + re.escape(w) + r's?\b', subject) for w in ID_NEG):
        return None
    if dep and qid and qid not in dep:
        return None
    # category-level exclusions (a fan photo is often only flagged by its categories)
    if re.search(r'supporters|\bfans\b|murals|statues|graffiti|wax figures|in art\b|popular culture|'
                 r'face paint|cosplay|children sports|memorials|monuments|banners|tifos|look-?alikes|'
                 r'football shirts|jerseys of|kits of|museum', norm(cats)):
        return None
    # archive captions (Anefo / El Grafico / Bundesarchiv) often give only the
    # surname, in the local spelling (Cruijff, Jasjin ...)
    archive = bool(re.search(r'bestanddeelnr|el ?grafico|bundesarchiv|fotothek', norm(file + ' ' + desc)))
    surnames = [t for t in tokens(name.split()[-1]) if len(t) >= 5] + [norm(a) for a in ALIASES.get(name, [])]
    by_surname = archive and any(re.search(r'\b' + re.escape(t) + r'\b', subject) for t in surnames)
    named = has_all(tokens(name), subject) or (src != 'search' and has_all(tokens(base), subject)) or by_surname
    if not ((qid and qid in dep) or named):
        return None
    if src == 'search':
        # namesakes are common (e.g. several footballers called Luis Díaz): when
        # the player has a Commons category, a search hit must be filed in it
        in_cat = any(norm(c.split(':', 1)[1]) in norm(cats) for c in player_cats)
        if player_cats and not in_cat and not by_surname:
            return None
        if not (in_cat or by_surname or has_all(tokens(name), file + ' ' + cats)):
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
    score = min(pos, 4) * 1.0 - neg * 2.5
    if src in ('category', 'subcat', 'infobox'):
        score += 1
    if is_current:
        score += (y - window[0]) * 0.6
    # several people named in a file title usually means a group/action shot
    return {'score': score, 'date': date, 'year': y, 'license': lic,
            'licenseUrl': val('LicenseUrl'), 'artist': clean_artist(val('Artist')),
            'descriptionurl': ii.get('descriptionurl', ''), 'thumburl': ii.get('thumburl') or ii.get('url'),
            'url': ii.get('url'), 'width': ii.get('width'), 'height': ii.get('height'), 'src': src,
            'text': text, 'sole': False}


def upload_url(u, width=None):
    """Keep every image fetch on upload.wikimedia.org (Commons now returns
    thumb.wikimedia.org thumb links; the same path is served by upload)."""
    if not u:
        return None
    u = u.split('?')[0].replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
    if width and '/thumb/' in u:
        u = re.sub(r'/\d+px-([^/]+)$', rf'/{width}px-\1', u)
    return u if u.startswith('https://upload.wikimedia.org/wikipedia/commons/') else None


THUMB_STEP = 500   # Wikimedia serves only standard thumb widths (..., 330, 500, 960, 1280, 1920); others -> HTTP 400


def analysis_url(c):
    return upload_url(c['thumburl'], THUMB_STEP) if c['width'] > THUMB_STEP else upload_url(c['url'])


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

    def analyse(self, paths):
        todo = [p for p in paths if p not in self.memo]
        if todo and self.bin:
            try:
                r = subprocess.run([self.bin, *todo], capture_output=True, timeout=300)
                self.memo.update(json.loads(r.stdout or b'{}'))
            except Exception:
                pass
        return {p: self.memo.get(p) for p in paths}


def label(labels, *keys):
    return max([labels.get(k, 0.0) for k in keys] + [0.0])


def vision_score(v, sole=False):
    """Return (score, face) where face is the main face box, or (None, None)."""
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
                  'team_sport', 'stadium', 'ball')
    art = label(labels, 'art', 'painting', 'drawing', 'illustration', 'sculpture', 'statue', 'document',
                'screenshot', 'poster')
    score = min(face_px, 160) / 40.0            # bigger face -> crisper portrait
    score += 4 * sport - 8 * suit - 4 * art
    if abs(f.get('yaw', 0)) > 1.2:
        return None, None                        # profile: face turned away
    if abs(f.get('yaw', 0)) > 0.6:
        score -= 5                               # three-quarter: allowed, frontal preferred
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
    order, futsal, alltime = [], {}, set()
    for role, v in data.items():
        for k in ('current', 'allTime'):
            for n in v.get(k, []):
                if k == 'allTime':
                    alltime.add(n)
                if n not in futsal:
                    order.append(n)
                    futsal[n] = role in FUTSAL_ROLES
                else:
                    futsal[n] = futsal[n] and role in FUTSAL_ROLES
    return order, futsal, alltime


def window_for(name, futsal):
    if name in CAREER:
        return CAREER[name], CAREER[name][1] >= THIS_YEAR - 1
    return (CURRENT_FROM_FUTSAL if futsal else CURRENT_FROM, THIS_YEAR), True


def choose(net, vis, name, cands, tmp):
    """Rank acceptable candidates: metadata score + Vision on small thumbs."""
    if name in PICKS:
        pf, side = PICKS[name] if isinstance(PICKS[name], tuple) else (PICKS[name], None)
        pick = [c for c in cands if c['file'] == pf]
        if pick:
            c = pick[0]
            raw = net.get(analysis_url(c), binary=True)
            p = os.path.join(tmp, hashlib.sha1(c['file'].encode()).hexdigest() + '.jpg')
            if raw:
                open(p, 'wb').write(raw)
                v = vis.analyse([p])[p]
                s, info = vision_score(v)
                if isinstance(side, dict):
                    info = {'face': dict(side, conf=1.0, yaw=0, roll=0), 'suit': 0, 'sport': 0, 'art': 0,
                            'face_px': side['h'] * (v or {}).get('h', 0)}
                elif (info is None or side) and v and v.get('faces'):
                    # reviewed pick: trust the reviewer; take the named face
                    # among the sizeable ones, else the largest
                    big = [f for f in v['faces'] if f['w'] * f['h'] > 0.2 * max(g['w'] * g['h'] for g in v['faces'])]
                    key = {'left': lambda f: f['x'], 'right': lambda f: -f['x'], 'top': lambda f: f['y']}.get(side)
                    f = min(big, key=key) if key else max(big, key=lambda f: f['w'] * f['h'])
                    info = {'face': f, 'suit': 0, 'sport': 0, 'art': 0, 'face_px': f['h'] * v['h']}
                c['vision'] = info
            return [c], 'pick'
    ranked = sorted([c for c in cands if c['file'] not in BLOCK], key=lambda c: c['score'], reverse=True)[:16]
    paths = {}
    for c in ranked:
        raw = net.get(analysis_url(c), binary=True)   # standard 500 px bucket (600 px -> HTTP 400)
        if not raw:
            continue
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
        # in-kit evidence: sport scene or match/team words in the file metadata
        elif info['sport'] < 0.1 and not any(w in c['text'] for w in POS_WORDS):
            why = 'no sport/kit evidence'
        # face must be >= FACE_MIN px wide in the full-size source: the crop
        # makes the face 42% of 320 px, so this caps upscaling at 2x
        elif info['face']['w'] * c['width'] < FACE_MIN:
            why = 'face too small'
        if why:
            if DEBUG:
                print(f'   - {c["file"]} ({c["date"]}, meta {c["score"]:.1f}): {why}', flush=True)
            continue
        ok.append((c['score'] + vs, dict(c, vision=info)))
    return [c for _, c in sorted(ok, key=lambda t: t[0], reverse=True)], 'auto'


def write_manifest(name, entry):
    """Merge one player's entry (or removal, entry=None) into the manifest on
    disk: re-read, update, atomic rename. Safe with concurrent runs/agents."""
    cur = {}
    if os.path.exists(MANIFEST):
        try:
            cur = json.load(open(MANIFEST, encoding='utf-8'))
        except json.JSONDecodeError:
            return
    if entry is None:
        if name not in cur:
            return
        cur.pop(name)
    else:
        cur[name] = entry
    order = {n: i for i, n in enumerate(load_players()[0])}
    out = {n: cur[n] for n in sorted(cur, key=lambda n: order.get(n, 1e9))}
    tmp = f'{MANIFEST}.{os.getpid()}.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, MANIFEST)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'futbol-player-photos-cache'))
    ap.add_argument('--sheet', default=os.path.join(tempfile.gettempdir(), 'riso-sheet.png'))
    ap.add_argument('--review', default='', help='dir for full-set review sheets (riso + source crops)')
    ap.add_argument('--only', default='')
    ap.add_argument('--debug', action='store_true')
    ap.add_argument('--all', action='store_true', help='every player, not just the football all-time greats')
    args = ap.parse_args()
    global DEBUG
    DEBUG = args.debug

    net = Net(args.cache)
    vis = Vision(args.cache)
    if not vis.bin:
        print('WARNING: Swift/Vision unavailable - no face check or in-kit check possible', file=sys.stderr)
    tmp = tempfile.mkdtemp(prefix='player-thumbs-')
    names, futsal, alltime = load_players()
    manifest = {}
    if os.path.exists(MANIFEST):
        manifest = json.load(open(MANIFEST, encoding='utf-8'))
    # This script's batch: the football all-time greats (current stars and
    # futsal are handled by separate batches / manifests). Zidane and Platini first.
    if not args.all:
        names = [n for n in names if n in alltime and not futsal[n] and n not in WOMEN]
    first = ['Zinedine Zidane', 'Michel Platini', 'Diego Maradona', 'Johan Cruyff', 'David Beckham',
             'Wayne Rooney']
    have = set(manifest)
    names = sorted(names, key=lambda n: (first.index(n) if n in first else len(first), n in have))
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        names = [n for n in names if n in keep]
    os.makedirs(OUT_DIR, exist_ok=True)

    report = {'accepted': [], 'not_found': [], 'rejected': {}, 'ambiguous': []}
    crops = {}
    for i, name in enumerate(names):
        tag = f'[{i+1}/{len(names)}] {name}'

        def reject(reason):
            report['rejected'].setdefault(reason, []).append(name)
            manifest.pop(name, None)
            write_manifest(name, None)
            for layer in ('ink', 'tone'):
                f = os.path.join(OUT_DIR, f'{slugify(name)}-{layer}.webp')
                if os.path.exists(f):
                    os.remove(f)
            print(f'{tag}: REJECT {reason}', flush=True)

        s, how = resolve(net, name, futsal[name])
        if not s:
            report['not_found'].append(name)
            manifest.pop(name, None)
            write_manifest(name, None)
            print(f'{tag}: NOT FOUND', flush=True)
            continue
        article = s.get('title')
        if how == 'search' or (how == 'direct' and norm(article) != norm(name)):
            report['ambiguous'].append(f'{name} -> {article} ({how})')
        if (manifest.get(name) or {}).get('source', '').startswith('wikimedia/deep-audit'):
            # reviewed by hand in scripts/fetch-player-photos-deep.py (Sep 26 2026): never re-judge or drop it here
            print(f'{tag}: KEEP deep-audit pick', flush=True)
            continue
        if name in DROP:
            reject('dropped after review (no in-kit playing photo)')
            continue
        src = (s.get('originalimage') or s.get('thumbnail') or {}).get('source')
        infobox = commons_file(src)
        window, is_current = window_for(name, futsal[name])
        qid = s.get('wikibase_item')
        info, files, dep, cats = gather(net, name, article, infobox, window, is_current, qid)
        pick_file = PICKS[name][0] if isinstance(PICKS.get(name), tuple) else PICKS.get(name)
        if pick_file and pick_file not in info:
            for f, ii in imageinfo(net, [pick_file]).items():
                info[f], files[f] = ii, 'pick'
        base = re.sub(r'\s*\(.*\)$', '', article)
        cands = []
        for f, ii in info.items():
            if files.get(f) == 'depicts':
                how = 'category'           # structured data already ties it to him
            else:
                how = files.get(f, 'search')
            m = meta_score(name, f, how, ii, window, is_current, cats, qid, base,
                           dep.get(ii.get('pageid'), set()))
            if m:
                cands.append(dict(m, file=f))
        if not cands:
            reject('no free photo dated in playing career')
            continue
        ranked, mode = choose(net, vis, name, cands, tmp)
        best = img = None
        for c in ranked[:4]:
            raw = None
            fwn = ((c.get('vision') or {}).get('face') or {}).get('w', 0.2)
            if c['width'] <= 1000:
                urls = (upload_url(c['url']),)
            else:
                # smallest standard thumb bucket that gives the face >= 80 px
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
            # hand-reviewed picks may go slightly under FACE_MIN (reported)
            if fw < (PICK_FACE_MIN if mode == 'pick' else FACE_MIN) or (mode != 'pick' and sh < SHARP_MIN):
                print(f'   skip {c["file"]}: face {fw:.0f}px sharp {sh:.0f}', flush=True)
                continue
            best, img = c, im
            break
        if not best:
            reject('no free in-kit playing photo with a clear face')
            continue
        slug = slugify(name)
        crop = portrait_crop(img, best['vision']['face'])
        crops[name] = (crop, best)
        ink, tone = riso(crop)
        save_mask(ink, os.path.join(OUT_DIR, f'{slug}-ink.webp'))
        save_mask(tone, os.path.join(OUT_DIR, f'{slug}-tone.webp'))
        manifest[name] = {
            'slug': slug,
            'article': article,
            'file': best['descriptionurl'],
            'date': best['date'],
            'artist': best['artist'],
            'license': best['license'],
            'licenseUrl': best['licenseUrl'],
        }
        report['accepted'].append(name)
        write_manifest(name, manifest[name])   # live: masks + manifest stay consistent
        print(f'{tag}: OK [{mode}] {best["file"]} ({best["date"]}, {best["license"]}, '
              f'{len(cands)} cands, face {face_px(img, best["vision"]["face"])[0]:.0f}px, '
              f'sharp {best["sharp"]:.0f})', flush=True)

    order = [n for n in load_players()[0] if n in manifest]
    # remove stale masks of players in this run that were rejected
    for n in names:
        if n not in manifest:
            for layer in ('ink', 'tone'):
                f = os.path.join(OUT_DIR, f'{slugify(n)}-{layer}.webp')
                if os.path.exists(f):
                    os.remove(f)

    acc = [n for n in order if n in manifest and n in names]
    if acc:
        sheet([riso_cell(manifest[n]['slug']) for n in acc[:24]], acc[:24], args.sheet)
    if args.review and acc:
        os.makedirs(args.review, exist_ok=True)
        per = 48
        for p in range(0, len(acc), per):
            chunk = acc[p:p + per]
            sheet([riso_cell(manifest[n]['slug']) for n in chunk], chunk,
                  os.path.join(args.review, f'riso-all-{p // per + 1}.png'), scale=0.5, cols=8)
        src = [n for n in acc if n in crops]
        for p in range(0, len(src), per):
            chunk = src[p:p + per]
            sheet([crops[n][0] for n in chunk], [f'{n} {crops[n][1]["date"]}' for n in chunk],
                  os.path.join(args.review, f'source-{p // per + 1}.png'), scale=0.5, cols=8)
    shutil.rmtree(tmp, ignore_errors=True)
    print('\nrequests', net.requests)
    print('accepted', len(report['accepted']))
    print('not found', len(report['not_found']), report['not_found'])
    for k, v in report['rejected'].items():
        print('rejected', k, len(v), v)
    print('ambiguous', report['ambiguous'])


if __name__ == '__main__':
    main()
