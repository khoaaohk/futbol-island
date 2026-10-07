// Oct 7 2026 scaling pass: the score/news feeds live in a shared store (Vercel Runtime Cache on the request context, a
// per-process Map elsewhere) that /api/cron/scores refreshes every ~5 minutes with ONE multi-competition football-data.org
// request. User routes read the store (no source fan-out while it is warm), fall back to a live fetch only once it is stale,
// and send CDN cache headers. Sources, the clock and the Runtime Cache are faked.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const clock={now:Date.parse('2026-10-07T12:00:00Z')};
class FakeDate extends Date{constructor(...a){super(...(a.length?a:[clock.now]));}static now(){return clock.now;}}
const ROOT=path.resolve(__dirname,'..');
const nextServer={NextResponse:{json:(body,init={})=>new Response(JSON.stringify(body),{status:init.status??200,headers:{'content-type':'application/json',...(init.headers??{})}})}};
function loader(fakeFetch){const cache=new Map();return function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 const req=id=>{if(id==='next/server')return nextServer;if(id.startsWith('node:')||id.startsWith('@vercel/'))return require(id);const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const ext of ['.ts','.tsx','.json',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return ext==='.json'?JSON.parse(fs.readFileSync(base+ext,'utf8')):load(base+ext);throw Error('cannot resolve '+id);};
 new Function('exports','module','require','fetch','Date',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText)(m.exports,m,req,fakeFetch,FakeDate);return m.exports;};}
const json=(body,status=200)=>({ok:status>=200&&status<300,status,headers:{get:()=>null},json:async()=>body,text:async()=>JSON.stringify(body)});
const CODES={'eng.1':'PL','esp.1':'PD','ita.1':'SA','ger.1':'BL1','fra.1':'FL1','uefa.champions':'CL','bra.1':'BSA'};
const fdMatch=(id,code,home,away)=>({id,utcDate:new Date(clock.now-2*86400000).toISOString(),status:'FINISHED',competition:{code,name:code},homeTeam:{id:id*10,shortName:home},awayTeam:{id:id*10+1,shortName:away},score:{duration:'REGULAR',fullTime:{home:2,away:1}}});
const espnEvent=league=>({events:[{id:'e-'+league,date:new Date(clock.now-86400000).toISOString(),links:[{href:'https://www.espn.com/soccer/match/_/gameId/1'}],competitions:[{status:{type:{state:'post',completed:true,shortDetail:'FT'}},competitors:[{id:'1',homeAway:'home',score:'1',team:{displayName:'Home '+league}},{id:'2',homeAway:'away',score:'0',team:{displayName:'Away '+league}}],details:[]}]}],leagues:[{name:league}]});
const rss='<rss><channel><item><title>Club completes transfer signing</title><link>https://www.bbc.co.uk/sport/football/1</link><pubDate>'+new Date(clock.now-3600000).toUTCString()+'</pubDate></item></channel></rss>';
/** Counts every outbound source request; `down` makes every source fail. */
function sources(){const s={calls:[],down:false,score:()=>s.calls.filter(u=>/football-data|espn\.com|bbci|theguardian/.test(u)),
 fetch:async url=>{s.calls.push(url);const u=new URL(url);if(s.down)return json({},503);
  if(u.hostname==='api.football-data.org'){if(u.pathname==='/v4/matches'){const codes=u.searchParams.get('competitions').split(',');return json({matches:codes.map((c,i)=>fdMatch(i+1,c,'H'+c,'A'+c))});}const one=u.pathname.match(/^\/v4\/competitions\/(\w+)\/matches$/);if(one&&u.searchParams.has('dateFrom'))return json({matches:[fdMatch(99,one[1],'H','A')]});return json({matches:[]});}
  if(u.hostname==='site.api.espn.com')return json(espnEvent(u.pathname.split('/')[5]));
  if(/bbci|theguardian/.test(u.hostname))return {...json({}),text:async()=>rss};
  if(u.hostname==='www.youtube.com')return {...json({}),text:async()=>'<feed></feed>'};
  return json({},404);}};return s;}
/** Fake Vercel Runtime Cache on the request context (what @vercel/functions' getCache() uses on Vercel). Values round-trip
 * through JSON like the real store; `reads`/`writes` count traffic. */
function installRuntimeCache(){const map=new Map(),rc={map,reads:0,writes:0,get:async k=>{rc.reads++;const v=map.get(k);return v===undefined?undefined:JSON.parse(v);},set:async(k,v,o)=>{rc.writes++;assert(o.ttl>0);map.set(k,JSON.stringify(v));}};
 globalThis[Symbol.for('@vercel/request-context')]={get:()=>({cache:rc})};process.env.VERCEL='1';return rc;}
const LEAGUES=['eng.1','esp.1','jpn.1','fra.1','ita.1','ger.1','bra.1','uefa.champions','eng.w.1','usa.1'];
(async()=>{
 const warn=console.warn;console.warn=()=>{};
 process.env.FOOTBALL_DATA_TOKEN='scaling-test-token';process.env.CRON_SECRET='scaling-test-secret';
 // 1. Cron auth: Bearer CRON_SECRET only; no secret configured -> always refused.
 {const src=sources(),{GET}=loader(src.fetch)('app/api/cron/scores/route.ts');
  const call=h=>GET(new Request('https://x.test/api/cron/scores',{headers:h?{authorization:h}:{}}));
  for(const h of [undefined,'Bearer wrong','scaling-test-secret','Bearer scaling-test-secretX','bearer scaling-test-secret']){const r=await call(h);assert.equal(r.status,401,String(h));assert.equal(r.headers.get('cache-control'),'no-store');}
  delete process.env.CRON_SECRET;assert.equal((await call('Bearer undefined')).status,401,'no secret configured');assert.equal((await call('Bearer ')).status,401);process.env.CRON_SECRET='scaling-test-secret';
  assert.equal(src.calls.length,0,'refused cron calls never reach a source');
  const {isCronAuthorized}=loader(src.fetch)('lib/town/cronAuth.ts');assert.equal(isCronAuthorized('Bearer abc','abc'),true);assert.equal(isCronAuthorized('Bearer abc',''),false);
  console.log('PASS cron auth: missing/wrong/malformed bearer and unset CRON_SECRET -> 401 without touching a source');}
 // 2. Cron run: ONE football-data.org request for all seven competitions; ESPN only for J1/MLS/WSL; everything stored.
 const rc=installRuntimeCache();
 {const src=sources(),{GET}=loader(src.fetch)('app/api/cron/scores/route.ts');
  const r=await GET(new Request('https://x.test/api/cron/scores',{headers:{authorization:'Bearer scaling-test-secret'}}));assert.equal(r.status,200);const body=await r.json();
  assert.equal(body.store,'runtime');assert.equal(body.footballData,'ok');
  const fd=src.calls.filter(u=>u.includes('football-data'));assert.equal(fd.length,1,'one football-data.org request: '+fd.join(' '));
  const u=new URL(fd[0]);assert.equal(u.pathname,'/v4/matches');assert.deepEqual(u.searchParams.get('competitions').split(',').sort(),Object.values(CODES).sort());
  const espn=src.calls.filter(u=>u.includes('espn.com'));assert(espn.every(x=>/soccer\/(jpn\.1|usa\.1|eng\.w\.1)\//.test(x)),'ESPN only for the ESPN-only leagues');assert(espn.length<=3*9+3,'ESPN within one visitor\'s budget per league: '+espn.length);
  for(const l of LEAGUES)assert.equal(body.feeds['scores:'+l],'ok',l);assert.equal(body.feeds['scores:all'],'ok');assert.equal(body.feeds['transfers:all'],'ok');
  assert(rc.writes>=12);assert(![...rc.map.keys()].some(k=>!k.startsWith('futbol-island$')),'namespaced keys');
  console.log('PASS cron: 1 football-data.org request ('+u.searchParams.get('competitions')+'), '+espn.length+' ESPN requests (J1/MLS/WSL only), '+rc.writes+' feeds stored');}
 // 3. Warm store: 200 visitors on fresh instances across every league, kind and the clip match lookup -> zero score/news requests.
 {const src=sources();let instances=0;
  for(let i=0;i<20;i++){const load=loader(src.fetch);instances++;const news=load('app/api/island-news/route.ts'),clips=load('app/api/island-clips/route.ts');
   await Promise.all([...LEAGUES.map(l=>news.GET(new Request('https://x.test/api/island-news?kind=scores&league='+l))),news.GET(new Request('https://x.test/api/island-news?kind=scores')),news.GET(new Request('https://x.test/api/island-news?kind=transfers'))].map(async p=>{const r=await p;assert.equal(r.status,200);const b=await r.json();assert.equal(b.unavailable,false);assert(b.items.length>0);assert.equal(r.headers.get('cache-control'),'public, s-maxage=300, stale-while-revalidate=600');}));
   const scored=await(await news.GET(new Request('https://x.test/api/island-news?kind=scores&league=ita.1'))).json();assert(scored.items.every(it=>it.league==='ita.1'),'filtered per league');
   const r=await clips.GET(new Request('https://x.test/api/island-clips?league=ita.1&match='+scored.items[0].id));assert.equal(r.status,200);}
  assert.equal(src.score().length,0,'warm store: no score/news source requests, got '+src.score().join(' '));
  console.log('PASS warm store: '+instances+' fresh instances x 13 requests -> 0 football-data.org/ESPN/RSS requests; per-league filtering');}
 // 4. Headers: unavailable and bad requests get 30 s; nothing per-user (no Set-Cookie, no Vary on cookies).
 {delete globalThis[Symbol.for('@vercel/request-context')];delete process.env.VERCEL;const src=sources();src.down=true;const load=loader(src.fetch),news=load('app/api/island-news/route.ts'),clips=load('app/api/island-clips/route.ts');
  const bad=await news.GET(new Request('https://x.test/api/island-news?kind=nope'));assert.equal(bad.status,400);assert.equal(bad.headers.get('cache-control'),'public, s-maxage=30');
  const badLeague=await news.GET(new Request('https://x.test/api/island-news?kind=scores&league=xx'));assert.equal(badLeague.status,400);assert.equal(badLeague.headers.get('cache-control'),'public, s-maxage=30');
  const down=await news.GET(new Request('https://x.test/api/island-news?kind=scores&league=jpn.1'));assert.equal((await down.json()).unavailable,true);assert.equal(down.headers.get('cache-control'),'public, s-maxage=30');
  const badClip=await clips.GET(new Request('https://x.test/api/island-clips?league=zz'));assert.equal(badClip.status,400);assert.equal(badClip.headers.get('cache-control'),'public, s-maxage=30');
  const player=await clips.GET(new Request('https://x.test/api/island-clips?topic=no-such'));assert.equal(player.headers.get('cache-control'),'public, s-maxage=30');
  for(const r of [bad,down,badClip])assert.equal(r.headers.get('set-cookie'),null);
  for(const f of ['app/api/island-news/route.ts','app/api/island-clips/route.ts'])assert(!/cookies\(|headers\(\)|no-store/.test(fs.readFileSync(path.join(ROOT,f),'utf8')),f+' reads nothing per-user and sends no no-store');
  console.log('PASS headers: good feeds s-maxage=300 + SWR 600; unavailable feeds and 400s s-maxage=30; no cookies or per-user input');}
 // 5. Stale store: older than 15 min -> one live refetch (coalesced); live failure -> serve the stored feed up to 2 h, then "unavailable".
 {const rc2=installRuntimeCache();const src=sources(),load=loader(src.fetch),srv=load('lib/town/islandNewsServer.ts');
  await srv.refreshIslandNewsStore();const before=src.score().length;
  clock.now+=srv.STORE_FRESH_MS-60000;const fresh=loader(src.fetch)('lib/town/islandNewsServer.ts');await fresh.getIslandNews('scores','eng.1');assert.equal(src.score().length,before,'14 min old: still served from the store');
  clock.now+=2*60000;const stale=loader(src.fetch)('lib/town/islandNewsServer.ts');await Promise.all(Array.from({length:10},()=>stale.getIslandNews('scores','eng.1')));
  const live=src.score().slice(before);assert.equal(live.filter(u=>u.includes('football-data')).length,1,'stale: one coalesced live refetch: '+live.join(' '));
  // Live refetch rewrote the store: another instance is warm again.
  const after=src.score().length;await loader(src.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','eng.1');assert.equal(src.score().length,after,'live refetch re-warmed the store');
  // Sources down: a stale stored feed (16 min .. 2 h) beats "unavailable".
  src.down=true;clock.now+=srv.STORE_FRESH_MS+60000;const kept=await loader(src.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','eng.1');assert.equal(kept.unavailable,false,'stale stored feed served while sources are down');assert(kept.items.length>0);
  // A cron run while sources are down keeps the stored feeds rather than overwriting them with "unavailable".
  const writes=rc2.writes;const down=await loader(src.fetch)('lib/town/islandNewsServer.ts').refreshIslandNewsStore();assert.equal(down.footballData,'unavailable');assert.equal(rc2.writes,writes,'nothing overwritten');
  clock.now+=srv.STORE_LAST_RESORT_MS;const gone=await loader(src.fetch)('lib/town/islandNewsServer.ts').getIslandNews('scores','eng.1');assert.equal(gone.unavailable,true,'older than 2 h: honest "unavailable"');
  console.log('PASS stale store: fresh for 15 min, then one coalesced live refetch that re-warms it; stale feed kept up to 2 h when sources fail; failed cron never overwrites');}
 // 6. No Runtime Cache (local dev / tests): the per-process fallback still works and the cron reports it.
 {delete globalThis[Symbol.for('@vercel/request-context')];delete process.env.VERCEL;const src=sources(),load=loader(src.fetch);const r=await load('lib/town/islandNewsServer.ts').refreshIslandNewsStore();assert.equal(r.store,'memory');
  const n=src.score().length;await load('lib/town/islandNewsServer.ts').getIslandNews('scores','fra.1');assert.equal(src.score().length,n,'same process reads its own store');
  delete process.env.FOOTBALL_DATA_TOKEN;const noTok=await loader(sources().fetch)('lib/town/islandNewsServer.ts').refreshIslandNewsStore();assert.equal(noTok.footballData,'no-token');assert.match(noTok.feeds['scores:eng.1'],/skipped/);
  console.log('PASS local fallback: per-process store when the Runtime Cache is absent; no token -> football-data.org leagues skipped');}
 console.warn=warn;
})().catch(e=>{console.error(e);process.exit(1);});
