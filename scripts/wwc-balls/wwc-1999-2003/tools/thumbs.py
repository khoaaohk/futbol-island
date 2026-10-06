# usage: python3 thumbs.py <width> <outdir> < titles.txt  -> downloads thumbs, writes info.json (licence, artist, url, size)
import sys,json,os,urllib.parse,subprocess,re,hashlib
F='/Users/khoado/Desktop/Warp Claude Projects/futbol-island/scripts/wwc-balls/tools/wwc-balls-fetch.py'
W=sys.argv[1];out=sys.argv[2];os.makedirs(out,exist_ok=True)
titles=[l.strip() for l in sys.stdin if l.strip()]
info={}
ip=os.path.join(out,'info.json')
if os.path.exists(ip): info=json.load(open(ip))
for i in range(0,len(titles),40):
  q='action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=%s&titles=%s'%(W,urllib.parse.quote('|'.join(titles[i:i+40])))
  d=json.loads(subprocess.check_output(['python3',F,'cache','api',q],cwd=os.path.dirname(out) or '.'))
  for p in d['query']['pages'].values():
    if 'imageinfo' not in p: continue
    ii=p['imageinfo'][0];m=ii.get('extmetadata',{})
    g=lambda k:re.sub('<[^>]+>','',m.get(k,{}).get('value',''))[:200]
    t=p['title'];fn=re.sub(r'[^A-Za-z0-9._-]+','-',t[5:])[:120]
    info[t]=dict(file=fn,url=ii['url'],thumb=ii.get('thumburl'),w=ii['width'],h=ii['height'],licence=g('LicenseShortName'),artist=g('Artist'),desc=g('ImageDescription')[:200])
for t,v in info.items():
  dst=os.path.join(out,v['file'])
  if not os.path.exists(dst) and v.get('thumb'):
    subprocess.check_call(['python3',F,os.path.join(os.path.dirname(out) or '.','cache'),'get',v['thumb'],dst])
json.dump(info,open(ip,'w'),indent=1)
for t,v in info.items(): print(v['file'],v['w'],v['h'],v['licence'],'|',v['artist'][:40])
