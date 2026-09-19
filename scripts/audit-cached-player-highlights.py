import importlib.util,json,pathlib,re
spec=importlib.util.spec_from_file_location('collector','scripts/collect-player-highlights.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
p=pathlib.Path('lib/town/playerHighlightLibrary.json');old=json.loads(p.read_text());library={n:[] for n in c.PLAYERS};search=[];verified={}
for file in c.CACHE.glob('*.html'):
 s=file.read_text()
 if 'ytInitialPlayerResponse' in s:
  data=c.extract(s,'ytInitialPlayerResponse');v=data.get('videoDetails',{})
  if v.get('videoId'):verified[v['videoId']]=data
 if 'ytInitialData' in s:
  for v in c.walk(c.extract(s,'ytInitialData')):
   owner=c.txt(v.get('ownerText',{}));badges=v.get('ownerBadges',[])
   official_handle=any(r.get('navigationEndpoint',{}).get('browseEndpoint',{}).get('canonicalBaseUrl','').lower()=='/@futsalrfef' for r in v.get('ownerText',{}).get('runs',[]))
   if not official_handle and (owner not in c.PUBLISHERS or not any(b.get('metadataBadgeRenderer',{}).get('style')=='BADGE_STYLE_TYPE_VERIFIED' for b in badges)):continue
   length=c.txt(v.get('lengthText',{}));sec=0
   for part in length.split(':'):
    if not part.isdigit():sec=0;break
    sec=sec*60+int(part)
   if sec<60:continue
   runs=v.get('ownerText',{}).get('runs',[]);cid=next((r.get('navigationEndpoint',{}).get('browseEndpoint',{}).get('browseId') for r in runs),'')
   search.append({'id':v['videoId'],'title':c.txt(v.get('title',{})),'source':owner,'channelId':cid,'durationSeconds':sec,'views':int(re.sub(r'\D','',c.txt(v.get('viewCountText',{}))) or '0'),'publishedAt':'','league':'uefa.champions','metadataSource':'public-search','verifiedAt':'2026-09-16','usAvailable':None})
pathlib.Path('/tmp/fi2-official-candidates.json').write_text(json.dumps(search))
for name in c.PLAYERS:
 candidates={}
 for item in [*search,*old.get(name,[])]:
  if not c.relevant(item['title'],name):continue
  if name in c.FUTSAL and not any(word in c.norm(item['title']+' '+item['source']) for word in ['futsal','lnfs','futbol sala']):continue
  if item['id'] in verified:
   d=verified[item['id']];ps=d.get('playabilityStatus',{});micro=d.get('microformat',{}).get('playerMicroformatRenderer',{});countries=micro.get('availableCountries')
   if ps.get('status')!='OK' or ps.get('playableInEmbed') is False or countries is not None and 'US' not in countries:continue
  candidates[item['id']]=item
 library[name]=sorted(candidates.values(),key=lambda v:(v['durationSeconds']>=240,v['views']),reverse=True)[:6]
p.write_text(json.dumps(library,ensure_ascii=False,indent=2)+'\n')
print('Coverage',sum(bool(v) for v in library.values()),'/',len(library),'clips',sum(len(v) for v in library.values()),'multiple backups',sum(len(v)>=3 for v in library.values()),flush=True)
print('Missing:',[n for n,v in library.items() if not v],flush=True)
