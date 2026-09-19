"""Offline authoring only: collect public official-channel highlight metadata. No API key."""
import concurrent.futures,datetime,hashlib,json,pathlib,re,time,unicodedata,urllib.parse,urllib.request,urllib.error,threading
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=pathlib.Path('/tmp/fi2-player-highlights');CACHE.mkdir(exist_ok=True)
POSITIONS=json.loads((ROOT/'lib/town/positionPlayers.json').read_text())
PLAYERS=list(dict.fromkeys(n for r in POSITIONS.values() for group in r.values() for n in group))
FUTSAL=set(n for role,r in POSITIONS.items() if role in {'goleiro','fixo','ala','pivot'} for g in r.values() for n in g)
# Exact professional publisher names, paired with verified channel badge and later channel-ID check.
PUBLISHERS={'PSG - Paris Saint-Germain','Sporting Clube de Portugal','FIGC Azzurri e Azzurre','Real Federación Española Fútbol','FC Barcelona','Real Madrid','Liverpool FC','Manchester United','Manchester City','Arsenal','Chelsea Football Club','Tottenham Hotspur','FC Bayern München','FC Bayern','Borussia Dortmund','Juventus','AC Milan','Inter','Paris Saint-Germain','SL Benfica','Sporting CP','FC Porto','FIFA','FIFA TV','FIFA World Cup','UEFA','UEFA EURO','UEFA Champions League','LALIGA','LALIGA EA SPORTS','Premier League','Bundesliga','Serie A','Ligue 1','ESPN FC','CBS Sports Golazo','FOX Soccer','NBC Sports','Sky Sports Football','Sky Sports Premier League','TNT Sports','beIN SPORTS','beIN SPORTS USA','J.LEAGUE International','Olympics','Olympics Football','The Emirates FA Cup','England','DFB','Selección Española de Fútbol (SeFutbol)','Selección Española de Fútbol','RFEF','CONMEBOL','CONMEBOL Libertadores','CBF','CBF TV','Liga Nacional de Fútbol Sala','LNFS','Futsal Liga','FutsalPlanet','UEFA Futsal','FC Barcelona Futsal','Barça Futsal','Futsal - RFEF','RFEF Futsal','Futsal RFEF','Federação Portuguesa de Futebol','FPF','Portugal','FutsalTV','PUMA','adidas','Nike Football','AFC Asian Cup','Asian Football Confederation'}
def norm(s):return re.sub('[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip()
RATE_LIMITED=threading.Event()
def fetch(url):
 p=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if p.exists():return p.read_text()
 if RATE_LIMITED.is_set():raise RuntimeError('YouTube rate limit: stop collection and retry another day')
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept-Language':'en-US,en;q=0.9'})
 try:
  with urllib.request.urlopen(req,timeout=15) as r:s=r.read(5000000).decode('utf8','replace')
 except urllib.error.HTTPError as error:
  if error.code==429:RATE_LIMITED.set()
  raise
 p.write_text(s);return s
def extract(s,key):
 m=re.search(r'(?:var\s+)?'+key+r'\s*=\s*',s)
 if not m:return {}
 try:return json.JSONDecoder().raw_decode(s[m.end():])[0]
 except:return {}
def walk(x):
 if isinstance(x,dict):
  if 'videoRenderer' in x:yield x['videoRenderer']
  for v in x.values():yield from walk(v)
 elif isinstance(x,list):
  for v in x:yield from walk(v)
def txt(x):return x.get('simpleText','') or ''.join(r.get('text','') for r in x.get('runs',[]))
def relevant(title,name):
 t=' '+norm(title)+' ';full=norm(name);last=full.split()[-1]
 names=[full]
 if last not in {'santos','silva','costa','alberto','mendes','romero','gomes','ramirez','martinez','fernandes','hernandez','souza','ferreira','neves','junior','rodrigues','gonzalez','garcia','muller','toure','lobo','mayor','jesus','gordillo'} and len(last)>=5 and sum(norm(n).split()[-1]==last for n in PLAYERS)==1:names.append(last)
 if name=='Ronaldo Nazário':names+=['ronaldo fenomeno','ronaldo nazario','r9']
 if name=='Pelé':names+=['pele']
 return any(' '+n+' ' in t for n in names) and not re.search(r'\b(interview|entrevista|entrevue|superflash|podcast|debate|transfer|reaction|reacts|full match|press conference|spits|spitting|my dream|my first|anniversary|aniversario)\b',t)
def search(name,query):
 data=extract(fetch('https://www.youtube.com/results?'+urllib.parse.urlencode({'search_query':query,'hl':'en','gl':'US'})),'ytInitialData');out=[]
 for v in walk(data):
  title=txt(v.get('title',{}));owner=txt(v.get('ownerText',{}));runs=v.get('ownerText',{}).get('runs',[])
  cid=next((r.get('navigationEndpoint',{}).get('browseEndpoint',{}).get('browseId') for r in runs),'')
  verified=any(b.get('metadataBadgeRenderer',{}).get('style')=='BADGE_STYLE_TYPE_VERIFIED' for b in v.get('ownerBadges',[]))
  if owner not in PUBLISHERS or not verified or not relevant(title,name):continue
  if name in FUTSAL and not any(word in norm(title+' '+owner) for word in ['futsal','lnfs','futbol sala']):continue
  length=txt(v.get('lengthText',{}));sec=0
  for part in length.split(':'):
   if not part.isdigit():sec=0;break
   sec=sec*60+int(part)
  if sec<60:continue
  views=int(re.sub(r'\D','',txt(v.get('viewCountText',{}))) or '0')
  out.append({'id':v['videoId'],'title':title,'source':owner,'channelId':cid,'views':views,'durationSeconds':sec})
 return out
def verify(c):
 d=extract(fetch('https://www.youtube.com/watch?v='+c['id']+'&hl=en&gl=US'),'ytInitialPlayerResponse')
 v=d.get('videoDetails',{});m=d.get('microformat',{}).get('playerMicroformatRenderer',{});p=d.get('playabilityStatus',{})
 if v.get('channelId')!=c['channelId'] or p.get('status')!='OK' or p.get('playableInEmbed') is False or v.get('isLiveContent'):return None
 countries=m.get('availableCountries')
 if countries is not None and 'US' not in countries:return None
 seconds=int(v.get('lengthSeconds','0'))
 if seconds<60:return None
 published=m.get('publishDate') or m.get('uploadDate')
 if not published:return None
 return {**c,'title':v.get('title',c['title']),'views':int(v.get('viewCount',c['views'])),'durationSeconds':seconds,'publishedAt':published,'league':'uefa.champions','verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'usAvailable':bool(countries and 'US' in countries)}
def collect(name):
 candidates={};errors=[]
 futsal=name in FUTSAL
 queries=[name+(' futsal' if futsal else '')+' best goals highlights',name+(' futsal UEFA FIFA' if futsal else ' highlights FIFA UEFA'),name+(' futsal highlights LNFS' if futsal else ' best skills goals official club')]
 for q in queries:
  try:
   for c in search(name,q):candidates[c['id']]=c
  except Exception as e:errors.append(type(e).__name__)
  if len(candidates)>=6:break
 results=[]
 for c in sorted(candidates.values(),key=lambda c:(c['durationSeconds']>=240,c['views']),reverse=True)[:8]:
  try:
   v=verify(c)
   if v:results.append(v)
  except Exception as e:errors.append(type(e).__name__)
  if len(results)>=4:break
 return name,sorted(results,key=lambda c:(c['durationSeconds']>=240,c['views']),reverse=True),errors
if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--limit',type=int);parser.add_argument('--only');args=parser.parse_args()
 names=[args.only] if args.only else PLAYERS[:args.limit]
 output=ROOT/'lib/town/playerHighlightLibrary.json';library=json.loads(output.read_text()) if output.exists() else {}
 with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
  for i,(name,clips,errors) in enumerate(pool.map(collect,names)):
   library[name]=clips or library.get(name,[]);output.write_text(json.dumps(library,ensure_ascii=False,indent=2)+'\n')
   if RATE_LIMITED.is_set():print('Rate limited: no further requests will be sent.',flush=True)
   print(f'{i+1}/{len(names)} {name}: {len(clips)} clips'+(' ['+','.join(errors)+']' if errors else ''),flush=True)
 print('Coverage',sum(bool(v) for v in library.values()),'/',len(library),'clips',sum(len(v) for v in library.values()),flush=True)
