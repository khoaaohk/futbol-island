#!/usr/bin/env python3
"""Infobox-photo audit for roster players still without a photo.

For every player in lib/town/cardRoster.json that no playerPhotos*.json has:
  1. the Wikipedia lead image (prop=pageimages, 50 titles per call, any licence
     so the audit can say why a file is unusable), else Wikidata P18;
  2. its licence from Commons (batched imageinfo + extmetadata, 50 per call);
     files hosted only on en.wikipedia are non-free fair use -> not reusable;
  3. the stars-batch face / crop / scene checks (the infobox photo IS the
     reference face, so identity is given; still exactly one dominant face);
  4. in kit: match / training / team photo in kit; a clear face in civilian
     clothes is listed separately as "infobox photo, not in kit".

Accepted photos are written as riso masks + an entry in the manifest of the
batch that owns the player (same fields as the Wikimedia batches, plus
"source": "wikimedia/infobox"). The audit table goes to --audit (markdown).
Run under the shared polite throttle; cache by sha1(url); generic User-Agent.
"""
import argparse
import json
import os
import re
import tempfile
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
import importlib.util

_spec = importlib.util.spec_from_file_location('pp_backup', os.path.join(HERE, 'fetch-player-photos-backup.py'))
B = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(B)
S, LEG, FUT, WOM = B.S, B.LEG, B.FUT, B.WOM


class Net(B.Net):
    HOSTS = B.Net.HOSTS + ('www.wikidata.org',)


def wiki(net, lang, **params):
    params['format'] = 'json'
    return net.json(f'https://{lang}.wikipedia.org/w/api.php?' + urllib.parse.urlencode(params)) or {}


def pageimages(net, lang, titles):
    """title -> {'title': final title, 'file': ..., 'qid': ..., 'disambig': bool}"""
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        d = wiki(net, lang, action='query', prop='pageimages|pageprops|description', piprop='original|name',
                 pilicense='any', ppprop='wikibase_item|disambiguation', redirects=1, titles='|'.join(chunk))
        q = d.get('query', {})
        back = {}
        for n in q.get('normalized', []):
            back[n['to']] = back.get(n['from'], n['from'])
        for r in q.get('redirects', []):
            back[r['to']] = back.get(r['from'], r['from'])
        for p in q.get('pages', {}).values():
            orig = p['title']
            while orig in back:
                orig = back[orig]
            pp = p.get('pageprops', {})
            out[orig] = {'title': p['title'], 'file': p.get('pageimage'), 'qid': pp.get('wikibase_item'),
                         'missing': 'missing' in p, 'disambig': 'disambiguation' in pp,
                         'desc': p.get('description') or ''}
    return out


def wikidata_p18(net, qids):
    out = {}
    qids = [q for q in qids if q]
    for i in range(0, len(qids), 50):
        d = net.json('https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode(
            dict(action='wbgetentities', ids='|'.join(qids[i:i + 50]), props='claims', format='json'))) or {}
        for q, ent in (d.get('entities') or {}).items():
            for cl in (ent.get('claims') or {}).get('P18', []):
                v = cl.get('mainsnak', {}).get('datavalue', {}).get('value')
                if v:
                    out[q] = v
                    break
    return out


def commons_info(net, files):
    out = {}
    files = list(dict.fromkeys(f for f in files if f))
    for i in range(0, len(files), 50):
        d = net.commons(action='query', titles='|'.join('File:' + f for f in files[i:i + 50]), prop='imageinfo',
                        iiprop='extmetadata|url|size', iiurlwidth=960,
                        iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|'
                                            'Categories|ImageDescription|ObjectName')
        S._collect(d, out)
    return out


def main():
    sp = os.path.join(tempfile.gettempdir(), 'futbol-player-photos-infobox')
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(sp, 'cache'))
    ap.add_argument('--models', default=os.path.join(sp, 'models'))
    ap.add_argument('--out', default=sp, help='dir for crops + audit')
    ap.add_argument('--dry', action='store_true', help='audit only: write no masks / manifests')
    ap.add_argument('--only', default='', help='comma-separated players to process')
    ap.add_argument('--force-kit', default='', help='players whose photo was checked by eye and is in kit')
    ap.add_argument('--block', default='', help='players whose infobox photo was rejected by eye')
    args = ap.parse_args()
    os.makedirs(os.path.join(args.out, 'infobox'), exist_ok=True)
    net = Net(args.cache)
    faces = S.Faces(*S.ensure_models(args.models))
    scene = S.Scene(args.cache)
    tmp = tempfile.mkdtemp(prefix='infobox-')
    todo = B.missing_players()
    if args.only:
        keep = {n.strip() for n in args.only.split(',')}
        todo = [t for t in todo if t[0] in keep]
    force = {n.strip() for n in args.force_kit.split(',') if n.strip()}
    blocked = {n.strip() for n in args.block.split(',') if n.strip()}
    rows = []

    # 1. titles: the name itself (one batched call per 50), then the per-batch resolver for the rest
    direct = pageimages(net, 'en', [n for n, _ in todo])
    info = {}
    retry = []
    for n, owner in todo:
        p = direct.get(n)
        d = S.norm(p['desc']) if p else ''
        footballer = re.search(r'footballer|football|soccer|futsal', d) and 'american football' not in d
        if owner == 'futsal':
            footballer = footballer and 'futsal' in d
        if p and not p['missing'] and not p['disambig'] and footballer:
            info[n] = dict(p, lang='en')
        else:
            retry.append((n, owner))
    resolved = {}
    for n, owner in retry:
        s = B.resolve(net, n, owner)
        if s:
            lang = 'pt' if 'pt.wikipedia' in json.dumps(s.get('content_urls', {})) else \
                'es' if 'es.wikipedia' in json.dumps(s.get('content_urls', {})) else 'en'
            resolved[n] = (lang, s['title'], s.get('wikibase_item'))
    for lang in ('en', 'pt', 'es'):
        ts = [t for (lg, t, _) in resolved.values() if lg == lang]
        if not ts:
            continue
        got = pageimages(net, lang, ts)
        for n, (lg, t, qid) in resolved.items():
            if lg == lang and t in got:
                info[n] = dict(got[t], lang=lang, qid=got[t]['qid'] or qid)
    # Wikidata P18 when the article has no lead image
    p18 = wikidata_p18(net, [info[n]['qid'] for n, _ in todo if n in info and not info[n]['file']])
    for n, _ in todo:
        if n in info and not info[n]['file'] and info[n]['qid'] in p18:
            info[n]['file'], info[n]['via'] = p18[info[n]['qid']].replace('_', ' '), 'wikidata P18'
    files = {n: (info[n]['file'] or '').replace('_', ' ') for n, _ in todo if n in info and info[n]['file']}
    ci = commons_info(net, list(files.values()))

    accepted, civilian = [], []
    for n, owner in todo:
        row = {'name': n, 'batch': owner or '-', 'article': '', 'file': '', 'license': '', 'result': 'rejected',
               'reason': ''}
        rows.append(row)
        p = info.get(n)
        if not p:
            row['reason'] = 'no Wikipedia article found (en/pt/es) for this player'
            continue
        row['article'] = f"{p['lang']}:{p['title']}" if p['lang'] != 'en' else p['title']
        f = files.get(n)
        if not f:
            row['reason'] = 'article has no lead image and Wikidata has no P18'
            continue
        row['file'] = f + (' (Wikidata P18)' if p.get('via') else '')
        ii = ci.get(f)
        if not ii:
            row['reason'] = 'file is hosted on en.wikipedia only (non-free / fair use), not reusable'
            row['license'] = 'non-free (local)'
            continue
        em = ii.get('extmetadata', {})
        val = lambda k: S.strip_html(em.get(k, {}).get('value', ''))
        lic = val('LicenseShortName')
        row['license'] = lic or '?'
        if not S.license_ok(lic):
            row['reason'] = f'licence not accepted ({lic or "unknown"})'
            continue
        text = S.norm(f + ' | ' + val('Categories') + ' | ' + val('ImageDescription') + ' | ' + val('ObjectName'))
        raw_date = val('DateTimeOriginal')
        y = S.year_of(raw_date) or S.year_of(f)
        c = {'file': f, 'width': ii.get('width', 0), 'url': ii.get('url'), 'thumburl': ii.get('thumburl') or ii.get('url'),
             'text': text + ' | match'}          # neutral: judge the kit on the picture first
        ok, res = S.evaluate(net, faces, scene, c, [], tmp, print)
        if not ok and not res.startswith('suit'):
            row['reason'] = f'face/crop check: {res}'
            continue
        # the face passed; now the kit
        crop_img = None
        if ok:
            crop_img = S.portrait_crop(res['img'], res['face'])
        pos = sum(w in text for w in S.POS_WORDS)
        neg = sum(w in text for w in S.NEG_WORDS)
        y0, y1 = B.window_of(n, owner) if owner else (1900, 2100)
        kit_problem = None
        if not ok:
            kit_problem = f'Vision sees suit/tie ({res})'
        elif (neg >= 2 and pos < 2) or (neg >= 1 and pos == 0):
            kit_problem = 'file text says press / ceremony / event'
        else:
            # re-run the real in-kit evidence check (match cue in text or a sports scene)
            c2 = dict(c, text=text)
            ok2, res2 = S.evaluate(net, faces, scene, c2, [], tmp, print)
            if not ok2:
                kit_problem = res2
        if not kit_problem and y and not (y0 <= y <= y1):
            kit_problem = f'dated {y}, outside playing years {y0}-{y1} (retired-era)'
        if n in blocked:
            kit_problem = 'rejected after review by eye'
        if kit_problem and n in force and crop_img is not None:
            kit_problem = None          # reviewed by eye: in playing / training kit
        if kit_problem:
            row['result'] = 'infobox photo, not in kit'
            row['reason'] = kit_problem + (f' (dated {y})' if y and 'dated' not in kit_problem else '')
            if crop_img is not None:
                crop_img.save(os.path.join(args.out, 'infobox', 'civ-' + S.slugify(n) + '.jpg'), quality=88)
            civilian.append(n)
            continue
        slug = S.slugify(n)
        crop_img.save(os.path.join(args.out, 'infobox', slug + '.jpg'), quality=90)
        row['result'] = 'accepted'
        row['reason'] = f'face {res["fw"]:.0f}px, sharp {res["sharp"]:.0f}, yaw {res["yaw"]:.2f}' + \
            (f', dated {y}' if y else ', undated')
        accepted.append(n)
        if args.dry:
            continue
        ink, tone = S.riso(crop_img)
        S.save_mask(ink, os.path.join(S.OUT_DIR, f'{slug}-ink.webp'))
        S.save_mask(tone, os.path.join(S.OUT_DIR, f'{slug}-tone.webp'))
        path = B.MANIFESTS[owner]
        man = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        man[n] = {'slug': slug, 'article': row['article'], 'file': ii.get('descriptionurl', ''),
                  'artist': val('Artist') or 'Unknown', 'license': lic, 'licenseUrl': val('LicenseUrl'),
                  'date': (raw_date[:10] if raw_date else (str(y) if y else '')), 'source': 'wikimedia/infobox'}
        tmpf = path + '.tmp'
        with open(tmpf, 'w', encoding='utf-8') as fh:
            json.dump(man, fh, ensure_ascii=False, indent=2)
            fh.write('\n')
        os.replace(tmpf, path)

    json.dump(rows, open(os.path.join(args.out, 'infobox-audit.json'), 'w'), ensure_ascii=False, indent=1)
    print('requests', net.requests, 'accepted', len(accepted), 'civilian', len(civilian), 'of', len(todo))


if __name__ == '__main__':
    main()
