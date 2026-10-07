// Oct 1 2026: ESPN answers HTTP 403 from Vercel, so scores for the free-tier leagues come from football-data.org v4 (server
// side, X-Auth-Token from FOOTBALL_DATA_TOKEN). ESPN stays the secondary source and the only one for WSL/MLS/J.League.
// Sources and time are mocked; the limiter runs on a virtual clock.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const NOW=Date.parse('2026-10-01T12:00:00Z'),TOKEN='test-token-abc123';
class FakeDate extends Date{constructor(...a){super(...(a.length?a:[NOW]));}static now(){return NOW;}}
function loader(fakeFetch){const cache=new Map();return function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 new Function('exports','module','require','fetch','Date',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id),fakeFetch,FakeDate);return m.exports;};}
const headers=(h={})=>({get:k=>h[k.toLowerCase()]??null});
const json=(body,status=200,h)=>({ok:status>=200&&status<300,status,headers:headers(h),json:async()=>body,text:async()=>JSON.stringify(body)});
const fdMatch=(id,utcDate,home,away,hs,as,{status='FINISHED',code='PL',duration='REGULAR',extra}={})=>({id,utcDate,status,competition:{code,name:'Premier League'},season:{startDate:'2026-08-15'},homeTeam:{id:10+id,name:home+' FC',shortName:home},awayTeam:{id:500+id,name:away+' FC',shortName:away},score:{duration,fullTime:{home:hs,away:as},...extra}});
/** football-data.org + ESPN fake. `fd` maps a path regex to a body (or a function returning a response). */
function sources({fd=[],espn=()=>json({},403)}={}){const calls=[];return {calls,fd:()=>calls.filter(c=>c.host==='api.football-data.org'),espn:()=>calls.filter(c=>c.host==='site.api.espn.com'),
 fetch:async(url,init)=>{const u=new URL(url);calls.push({url,host:u.hostname,path:u.pathname+u.search,headers:init?.headers??{}});
  if(u.hostname==='site.api.espn.com')return espn(u);
  for(const [re,body] of fd)if(re.test(u.pathname+u.search))return typeof body==='function'?body(u):json(body);
  return json({message:'not mocked'},404);}};}
const quiet=fn=>async(...a)=>{const warn=console.warn,logs=[];console.warn=(...m)=>logs.push(m.join(' '));try{return await fn(logs,...a);}finally{console.warn=warn;}};
(async()=>{
 process.env.FOOTBALL_DATA_TOKEN=TOKEN;
 // 1. Mapping: the seven free-tier competitions; WSL, MLS and J.League stay on ESPN.
 {const {FOOTBALL_DATA_CODES,footballDataWeekPath}=loader(async()=>{throw Error('no fetch');})('lib/town/footballDataServer.ts'),{NEWS_LEAGUES}=loader(async()=>{})('lib/town/newsLeagues.ts');
  assert.deepEqual(FOOTBALL_DATA_CODES,{'eng.1':'PL','esp.1':'PD','ita.1':'SA','ger.1':'BL1','fra.1':'FL1','uefa.champions':'CL','bra.1':'BSA'});
  assert.deepEqual(Object.keys(NEWS_LEAGUES).filter(l=>!FOOTBALL_DATA_CODES[l]).sort(),['eng.w.1','jpn.1','usa.1']);
  assert.equal(footballDataWeekPath(['PL'],NOW),'/competitions/PL/matches?dateFrom=2026-09-24&dateTo=2026-10-03');
  assert.equal(footballDataWeekPath(['PL','CL'],NOW),'/matches?competitions=PL,CL&dateFrom=2026-09-24&dateTo=2026-10-03');
  console.log('PASS league mapping (7 free-tier codes; eng.w.1/jpn.1/usa.1 on the secondary source) and week paths');}
 // 2. Past week: one request, verified results, live and postponed games kept but not verified, token only in the header.
 {const src=sources({fd:[[/^\/v4\/competitions\/PL\/matches\?dateFrom=2026-09-24&dateTo=2026-10-03$/,{competition:{code:'PL',name:'Premier League'},matches:[
   fdMatch(1,'2026-09-27T14:00:00Z','Chelsea','Arsenal',2,1),fdMatch(2,'2026-09-28T16:30:00Z','Spurs','Villa',null,null,{status:'POSTPONED'}),fdMatch(3,'2026-10-01T11:00:00Z','Everton','Wolves',1,0,{status:'IN_PLAY'}),
   fdMatch(4,'2026-10-02T19:00:00Z','Leeds','Burnley',null,null,{status:'TIMED'}),fdMatch(5,'2026-09-26T14:00:00Z','Brentford','Fulham',3,3,{duration:'PENALTY_SHOOTOUT',extra:{regularTime:{home:1,away:1},extraTime:{home:0,away:0}}}),fdMatch(6,'2026-09-01T14:00:00Z','Too','Old',1,1)]}]]});
  const load=loader(src.fetch),{getIslandNews}=load('lib/town/islandNewsServer.ts'),{isVerifiedResult,recentMatchStories,matchStory}=load('lib/town/matchStory.ts');
  const feed=await getIslandNews('scores','eng.1');
  assert.equal(src.calls.length,1,'one football-data.org request for the whole week');assert.equal(src.fd()[0].headers['X-Auth-Token'],TOKEN);assert(!src.calls[0].url.includes(TOKEN),'token never in a URL');
  assert(!JSON.stringify(feed).includes(TOKEN),'token never in the response');
  assert.equal(feed.unavailable,false);assert.equal(feed.attribution,'Football data provided by the Football-Data.org API');assert.equal(feed.lastResults,undefined);
  const by=Object.fromEntries(feed.items.map(i=>[i.id,i]));assert.equal(by['fd-6'],undefined,'outside the window');
  assert.equal(by['fd-1'].title,'Chelsea 2 – 1 Arsenal');assert.equal(by['fd-1'].source,'football-data.org');assert.equal(by['fd-1'].url,'');assert.equal(by['fd-1'].league,'eng.1');
  assert(isVerifiedResult(by['fd-1'],NOW));assert(!isVerifiedResult(by['fd-2'],NOW),'postponed');assert.equal(by['fd-2'].title,'Spurs vs Villa');assert.match(by['fd-2'].detail,/Postponed/);
  assert(!isVerifiedResult(by['fd-3'],NOW),'live');assert.match(by['fd-3'].detail,/LIVE/);assert.equal(feed.items[0].id,'fd-3','live first');assert(!isVerifiedResult(by['fd-4'],NOW),'scheduled');
  assert.equal(by['fd-5'].match.homeScore,'1','shoot-out goals are not added to the score');assert.match(by['fd-5'].detail,/penalties/);
  assert.deepEqual(recentMatchStories(feed.items,NOW).map(i=>i.id),['fd-1','fd-5']);
  assert.equal(matchStory(by['fd-1'],new FakeDate(),false).note,'The score is confirmed, but some scorer or minute details are unavailable.','free tier has no scorers');
  console.log('PASS past week from football-data.org: one request, FINISHED+full-time only, postponed/live/scheduled not verified, attribution, token header-only');}
 // 3. Latest-match fallback: nothing verified this week -> this season's FINISHED list, newest round only (one extra request).
 {const src=sources({fd:[[/dateFrom=/,{matches:[fdMatch(9,'2026-09-29T19:00:00Z','A','B',null,null,{status:'POSTPONED'})]}],[/status=FINISHED$/,{filters:{season:'2026'},matches:[
   fdMatch(11,'2026-09-13T14:00:00Z','Chelsea','Arsenal',1,0),fdMatch(12,'2026-09-14T16:00:00Z','Spurs','Villa',4,0),fdMatch(13,'2026-08-30T14:00:00Z','Old','Round',2,2)]}]]});
  const load=loader(src.fetch),{getIslandNews}=load('lib/town/islandNewsServer.ts'),{matchStory}=load('lib/town/matchStory.ts');const feed=await getIslandNews('scores','esp.1');
  assert.deepEqual(feed.lastResults.map(i=>i.id),['fd-12','fd-11']);assert.equal(feed.season,undefined);assert.equal(src.calls.length,2);assert.equal(src.fd()[1].path,'/v4/competitions/PD/matches?status=FINISHED');
  assert.match(matchStory(feed.lastResults[0],new FakeDate(),true).opener,/last match, on Mon 14 Sep: did you see Spurs against Villa\?/);assert.equal(feed.attribution,'Football data provided by the Football-Data.org API');
  await getIslandNews('scores','esp.1');assert.equal(src.calls.length,2,'cached');
  // A new season before its first game: last season's finished list.
  const src2=sources({fd:[[/dateFrom=/,{matches:[]}],[/status=FINISHED$/,{filters:{season:'2026'},matches:[]}],[/status=FINISHED&season=2025$/,{matches:[fdMatch(21,'2026-06-20T14:00:00Z','X','Y',0,0,{code:'BSA'})]}]]});
  const f2=await loader(src2.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','bra.1');assert.deepEqual(f2.lastResults.map(i=>i.id),['fd-21']);assert.equal(src2.calls.length,3);
  console.log('PASS latest-match fallback: one FINISHED request, newest verified round (dated), previous season when the new one has not started');}
 // 4. Between seasons: no finished match in the lookback -> one SCHEDULED request for the next date.
 {const src=sources({fd:[[/dateFrom=/,{matches:[]}],[/status=FINISHED$/,{filters:{season:'2026'},matches:[fdMatch(31,'2026-03-01T14:00:00Z','Too','Long ago',1,0)]}],[/status=SCHEDULED$/,{matches:[fdMatch(32,'2026-10-10T11:30:00Z','N','M',null,null,{status:'TIMED'}),fdMatch(33,'2026-10-04T11:30:00Z','P','Q',null,null,{status:'SCHEDULED'})]}]]});
  const feed=await loader(src.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','ger.1');
  assert.deepEqual(feed.season,{between:true,nextMatchAt:'2026-10-04T11:30:00.000Z'});assert.equal(feed.lastResults,undefined);assert.deepEqual(src.fd().map(c=>c.path.split('?')[1].split('&')[0]),['dateFrom=2026-09-24','status=FINISHED','status=SCHEDULED']);
  console.log('PASS between seasons: FINISHED then SCHEDULED, next match date, three requests at most');}
 // 5. Unsupported leagues (and football-data failures) use ESPN; if ESPN also fails: unavailable copy + curated clips.
 await quiet(async logs=>{
  const espnDay=u=>json({leagues:[{name:'MLS'}],events:u.searchParams.get('dates')?.length===8&&u.searchParams.get('dates')==='20260927'?[{id:'e1',date:'2026-09-27T23:00Z',links:[{href:'https://www.espn.com/soccer/match/_/gameId/e1'}],competitions:[{status:{type:{state:'post',completed:true,shortDetail:'FT'}},competitors:[{homeAway:'home',team:{displayName:'LA Galaxy'},score:'2'},{homeAway:'away',team:{displayName:'LAFC'},score:'2'}],details:[]}]}]:[]});
  const src=sources({espn:espnDay});const {getIslandNews}=loader(src.fetch)('lib/town/islandNewsServer.ts');const feed=await getIslandNews('scores','usa.1');
  assert.equal(src.fd().length,0,'no football-data.org request for a paid-tier league');assert.equal(src.espn().length,9);assert.equal(feed.items[0].source,'ESPN');assert.equal(feed.attribution,undefined);
  // ESPN 403 everywhere: unavailable feed, and the clip route still serves the league's curated clips.
  const dead=sources();const d=loader(dead.fetch),f2=await d('lib/town/islandNewsServer.ts').getIslandNews('scores','jpn.1');assert.equal(f2.unavailable,true);
  assert(logs.some(l=>/\[island-news\] source HTTP 403 site\.api\.espn\.com/.test(l)));
  const clips=d('lib/town/islandClipsServer.ts').withCuratedFallback('jpn.1',{items:[],unavailable:true},NOW);assert.equal(clips.fallback,'curated');assert(clips.items.length>=2);
  // Free-tier league whose football-data.org request fails (503) -> ESPN tried next -> ESPN 403 -> unavailable.
  const both=sources({fd:[[/./,()=>json({},503)]]}),f3=await loader(both.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','ita.1');
  assert.equal(both.fd().length,1);assert.equal(both.espn().length,9);assert.equal(f3.unavailable,true);assert(logs.some(l=>/source HTTP 503 api\.football-data\.org/.test(l)));
  // Week answered but the last-result lookup fails at every source: lastUnavailable (friendly copy + curated clips).
  const half=sources({fd:[[/dateFrom=/,{matches:[]}],[/status=FINISHED/,()=>json({},500)]]}),f4=await loader(half.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','fra.1');
  assert.equal(f4.unavailable,false);assert.equal(f4.lastUnavailable,true);assert.equal(f4.season,undefined,'a failure is never called between seasons');
  const {lastResultsUnavailableLine}=loader(async()=>{})('lib/town/matchStory.ts');assert.match(lastResultsUnavailableLine('Ligue 1'),/can’t check the last results right now\. Here are some favourite Ligue 1 clips/);
  const src5=fs.readFileSync('components/NpcMatchStory.tsx','utf8'),src6=fs.readFileSync('components/NpcNews.tsx','utf8');assert(/lastUnavailable\?<><p>\{lastResultsUnavailableLine\(leagueName\)\}<\/p>\{league&&<NpcClips league=\{league\}\/>\}/.test(src5));assert(/failed&&league&&kind==='scores'&&<NpcClips league=\{league\}\/>/.test(src6));assert(/Scores: \{feed\.attribution\}/.test(src6));
  // No token: logged once, ESPN used for every league.
  delete process.env.FOOTBALL_DATA_TOKEN;const none=sources({espn:espnDay}),n=loader(none.fetch)('lib/town/islandNewsServer.ts');await n.getIslandNews('scores','eng.1');await n.getIslandNews('scores','esp.1');
  assert.equal(none.fd().length,0);assert.equal(logs.filter(l=>/FOOTBALL_DATA_TOKEN is not set/.test(l)).length,1,'missing token logged once per server instance');process.env.FOOTBALL_DATA_TOKEN=TOKEN;
  console.log('PASS unsupported leagues -> ESPN; football-data failure -> ESPN -> unavailable copy + curated clips; missing token logged once');
 })();
 // 6. Rate limit: 20 NPCs asking at once share one request; never more than 10 (we use 9) per rolling minute.
 {const sent=[];let t=0;const fetchFn=async url=>{sent.push(t);return json({matches:[]},200,{'x-requests-available-minute':'5','x-requestcounter-reset':'40'});};
  const fd=loader(fetchFn)('lib/town/footballDataServer.ts');fd.footballDataClock.now=()=>t;fd.footballDataClock.sleep=async ms=>{t+=ms;};
  await Promise.all(Array.from({length:20},()=>fd.footballDataGet('/competitions/PL/matches?x=1',TOKEN)));assert.equal(sent.length,1,'in-flight request shared');
  const burst=await Promise.allSettled(Array.from({length:14},(_,i)=>fd.footballDataGet('/p'+i,TOKEN)));
  assert.equal(sent.length,9,'budget: 9 per minute');assert.equal(burst.filter(r=>r.status==='rejected').length,6,'over-budget requests rejected instead of waiting past the route');
  t=52000;const later=await Promise.allSettled(Array.from({length:4},(_,i)=>fd.footballDataGet('/q'+i,TOKEN)));
  assert(later.every(r=>r.status==='fulfilled'),'short waits are queued, not dropped');assert(t>=60000,'queued until the window frees');
  const maxInWindow=Math.max(...sent.map(s=>sent.filter(x=>x>=s&&x<s+60000).length));assert(maxInWindow<=10&&maxInWindow<=fd.FOOTBALL_DATA_PER_MINUTE,'never more than 10 per minute (got '+maxInWindow+')');
  console.log('PASS request budget: shared in-flight requests, '+maxInWindow+' max per rolling minute, FIFO queue for short waits');}
 // 7. 429: back off for X-RequestCounter-Reset seconds, no request in between, then recover; feed falls back to ESPN meanwhile.
 await quiet(async logs=>{let t=0,status=429;const sent=[];const fetchFn=async url=>{sent.push(url);if(new URL(url).hostname!=='api.football-data.org')return json({},403);return status===429?json({message:'Too many'},429,{'x-requestcounter-reset':'30'}):json({matches:[]});};
  const load=loader(fetchFn),fd=load('lib/town/footballDataServer.ts');fd.footballDataClock.now=()=>t;fd.footballDataClock.sleep=async ms=>{t+=ms;};
  await assert.rejects(fd.footballDataGet('/a',TOKEN));assert(logs.some(l=>/source HTTP 429 api\.football-data\.org; backing off 30s/.test(l)));
  status=200;t=10000;await assert.rejects(fd.footballDataGet('/b',TOKEN),/budget/);assert.equal(sent.length,1,'no request during the backoff');
  const feed=await load('lib/town/islandNewsServer.ts').getIslandNews('scores','eng.1');assert.equal(sent.filter(u=>u.includes('espn')).length,9,'ESPN tried while backing off');assert.equal(feed.unavailable,true);
  t=31000;await fd.footballDataGet('/c',TOKEN);assert.equal(sent.filter(u=>u.includes('football-data')).length,2,'recovers after the reset');
  // X-Requests-Available-Minute: 0 also pauses until the reset, without waiting for a 429.
  fd.resetFootballDataBudget();const g=loader(async()=>json({matches:[]},200,{'x-requests-available-minute':'0','x-requestcounter-reset':'50'}))('lib/town/footballDataServer.ts');g.footballDataClock.now=()=>t;
  await g.footballDataGet('/d',TOKEN);await assert.rejects(g.footballDataGet('/e',TOKEN),/budget/);
  console.log('PASS 429 backoff honours X-RequestCounter-Reset (and an exhausted X-Requests-Available-Minute), ESPN meanwhile, then recovers');
 })();
 // 8. The token never reaches the client: no client module imports the server provider, only NEXT_PUBLIC_ vars are inlined,
 // and the built client chunks contain neither the variable name nor the token value.
 {const resolve=(from,id)=>{const base=id.startsWith('@/')?path.resolve(id.slice(2)):id.startsWith('.')?path.resolve(path.dirname(from),id):null;if(!base)return null;for(const ext of ['','.ts','.tsx','/index.ts','/index.tsx'])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return base+ext;return null;};
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'||e.name.startsWith('.')?[]:walk(path.join(dir,e.name))):/\.tsx?$/.test(e.name)?[path.join(dir,e.name)]:[]);
  const clientRoots=['app','components','lib'].flatMap(walk).filter(f=>/^\s*['"]use client['"]/.test(fs.readFileSync(f,'utf8')));assert(clientRoots.length>10);
  const seen=new Set(),stack=[...clientRoots];while(stack.length){const f=stack.pop();if(seen.has(f))continue;seen.add(f);for(const m of fs.readFileSync(f,'utf8').matchAll(/(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)){const r=resolve(f,m[1]??m[2]);if(r&&!/import\s+type/.test(m[0]))stack.push(r);}}
  const leaked=[...seen].filter(f=>/footballDataServer|islandNewsServer/.test(f)||fs.readFileSync(f,'utf8').includes('FOOTBALL_DATA_TOKEN'));assert.deepEqual(leaked,[],'client graph must not reach the token');
  const users=['app','components','lib'].flatMap(walk).filter(f=>fs.readFileSync(f,'utf8').includes('FOOTBALL_DATA_TOKEN')).map(f=>path.relative('.',f));assert.deepEqual(users.sort(),['lib/town/footballDataServer.ts','lib/town/islandNewsServer.ts'],'only the server provider (and its comment in the news server) mention it');
  let token='';try{token=(fs.readFileSync('.env.local','utf8').match(/^FOOTBALL_DATA_TOKEN=(.*)$/m)?.[1]??'').trim().replace(/^['"]|['"]$/g,'');}catch{}
  const chunks=fs.existsSync('.next/static')?(function list(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(d,e.name)):/\.js$/.test(e.name)?[path.join(d,e.name)]:[]);})('.next/static'):[];
  for(const c of chunks){const text=fs.readFileSync(c,'utf8');assert(!text.includes('FOOTBALL_DATA_TOKEN'),'variable name in '+c);if(token.length>8)assert(!text.includes(token),'token value in a client chunk: '+c);}
  console.log('PASS token stays server-side: '+seen.size+' client-reachable modules clean, only server modules mention it, '+chunks.length+' built client chunks clean');}
})().catch(e=>{console.error(e);process.exit(1);});
