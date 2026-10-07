// Oct 1 2026: when a league has no verified completed match in the past week, the news desk returns its most recent one
// (dated) instead of "I don't have…"; with none in the whole lookback it says the league is between seasons (with the next
// match date when the source has one). The verified rule (final status, both scores) is kept. Source is mocked.
// These cases cover the ESPN source (no FOOTBALL_DATA_TOKEN); football-data.org's are in tests/news-football-data.cjs.
delete process.env.FOOTBALL_DATA_TOKEN;
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const NOW=Date.parse('2026-10-01T12:00:00Z');
class FakeDate extends Date{constructor(...a){super(...(a.length?a:[NOW]));}static now(){return NOW;}}
function loader(fakeFetch){const cache=new Map();return function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 new Function('exports','module','require','fetch','Date',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id),fakeFetch,FakeDate);return m.exports;};}
const event=(id,date,home,away,hs,as,{state='post',completed=true}={})=>({id,date,links:[{href:'https://www.espn.com/soccer/match/_/gameId/'+id}],competitions:[{status:{type:{state,completed,shortDetail:completed?'FT':'Postponed'}},competitors:[{homeAway:'home',id:'h'+id,team:{displayName:home},score:hs},{homeAway:'away',id:'a'+id,team:{displayName:away},score:as}],details:[]}]});
const respond=body=>({ok:true,status:200,json:async()=>body,text:async()=>JSON.stringify(body)});
function source(months,{calendar=[],events=[],failMonth}={}){const calls=[];return {calls,fetch:async url=>{calls.push(url);const dates=new URL(url).searchParams.get('dates');
 if(!dates)return respond({leagues:[{name:'League',calendar}],events});
 if(dates.length===6){if(dates===failMonth)return {ok:false,status:503};return respond({leagues:[{name:'League'}],events:months[dates]??[]});}
 return respond({leagues:[{name:'League'}],events:(months.days??[]).filter(e=>e.date.slice(0,10).replace(/-/g,'')===dates)});}};}
(async()=>{
 // 1. Nothing in the past 7 days; last round on Sat 19 Sep (plus a postponed game the next day, which is not verified).
 {const src=source({'202610':[],'202609':[event('1','2026-09-19T14:00Z','Chelsea','Arsenal','1','0'),event('2','2026-09-19T11:30Z','Spurs','Villa','4','0'),event('3','2026-09-20T13:00Z','Everton','Liverpool','0','0',{completed:false}),event('4','2026-09-05T13:00Z','Old','Round','2','2')]});
  const load=loader(src.fetch),{getIslandNews}=load('lib/town/islandNewsServer.ts'),{matchStory,latestMatchStories,recentMatchStories}=load('lib/town/matchStory.ts');
  const feed=await getIslandNews('scores','eng.w.1');
  assert.equal(feed.unavailable,false);assert.equal(feed.season,undefined);assert.equal(recentMatchStories(feed.items,NOW).length,0);
  assert.deepEqual(feed.lastResults.map(i=>i.id),['1','2'],'newest verified round only, postponed and older rounds excluded');
  assert.equal(src.calls.length,9+2,'stops at the first month holding a verified result');
  assert(src.calls.slice(9).every(u=>/dates=\d{6}&limit=200$/.test(u)));
  const latest=latestMatchStories(feed.lastResults,NOW)[0],story=matchStory(latest,new FakeDate(),true);
  assert.equal(latest.publishedAt,'2026-09-19T14:00:00.000Z');assert.match(story.opener,/last match, on Sat 19 Sep: did you see Chelsea against Arsenal\?/);
  assert.equal(story.result,'It finished Chelsea 1, Arsenal 0.');
  await getIslandNews('scores','eng.w.1');assert.equal(src.calls.length,11,'cached');
  console.log('PASS no match in 7 days -> most recent older round returned with its date ('+story.opener+')');}
 // 2. No matches at all: between seasons, with the next scheduled date when the source has one.
 {const src=source({},{calendar:['2026-08-01T07:00Z','2026-10-03T07:00Z','2026-10-10T07:00Z']});const load=loader(src.fetch),{getIslandNews}=load('lib/town/islandNewsServer.ts'),{betweenSeasonsLine}=load('lib/town/matchStory.ts');
  const feed=await getIslandNews('scores','usa.1');assert.equal(feed.lastResults,undefined);assert.deepEqual(feed.season,{between:true,nextMatchAt:'2026-10-03T07:00:00.000Z'});
  assert.equal(src.calls.length,9+4+1,'4 month requests then one default scoreboard');
  const line=betweenSeasonsLine('MLS',feed.season.nextMatchAt);assert.match(line,/between seasons\. The next match is on Sat 3 Oct\./);
  assert.match(betweenSeasonsLine('MLS'),/^I can’t find any finished MLS matches right now, so the league is between seasons\. Ask me/);
  const src2=source({}),{getIslandNews:get2}=loader(src2.fetch)('lib/town/islandNewsServer.ts');assert.deepEqual((await get2('scores','usa.1')).season,{between:true});
  console.log('PASS no matches at all -> between-seasons copy ("'+line+'")');}
 // 3. Verified rule kept: a postponed "post" game or a missing score never counts as a result, here or in the lookback.
 {const {isVerifiedResult,recentMatchStories}=loader(async()=>{throw Error('no fetch');})('lib/town/matchStory.ts');
  const item=(m)=>({id:'x',title:'',url:'',source:'ESPN',detail:'',publishedAt:'2026-09-30T18:00:00Z',match:{home:'A',away:'B',homeScore:'1',awayScore:'0',state:'post',completed:true,goals:[],goalsComplete:true,...m}});
  assert(isVerifiedResult(item({}),NOW));assert(!isVerifiedResult(item({completed:false}),NOW),'postponed');assert(!isVerifiedResult(item({state:'in'}),NOW),'live');
  assert(!isVerifiedResult(item({homeScore:'–'}),NOW),'missing score');assert(!isVerifiedResult({...item({}),publishedAt:'2026-10-02T18:00:00Z'},NOW),'future');
  assert.equal(recentMatchStories([item({completed:false}),item({awayScore:''})],NOW).length,0);
  const src=source({days:[event('9','2026-09-30T18:00Z','A','B','0','0',{completed:false})],'202609':[event('8','2026-09-12T14:00Z','C','D','2','1')]});const {getIslandNews}=loader(src.fetch)('lib/town/islandNewsServer.ts');
  const feed=await getIslandNews('scores','fra.1');assert.equal(feed.items[0].match.completed,false);assert.deepEqual(feed.lastResults.map(i=>i.id),['8'],'postponed recent game triggers the lookup, verified older game returned');
  // A recent verified game means no extra requests.
  const src3=source({days:[event('7','2026-09-29T18:00Z','E','F','3','1')]}),{getIslandNews:get3}=loader(src3.fetch)('lib/town/islandNewsServer.ts');const f3=await get3('scores','ita.1');assert.equal(src3.calls.length,9);assert.equal(f3.lastResults,undefined);assert.equal(f3.season,undefined);
  console.log('PASS verified rule kept (final + completed + both scores + past kickoff); recent verified game skips the lookup');}
 // 4. A source failure in the lookup is never reported as "between seasons", and backs off (not cached for 30 minutes).
 {const src=source({},{failMonth:'202610'});const {getIslandNews,getLatestResults}=loader(src.fetch)('lib/town/islandNewsServer.ts');const feed=await getIslandNews('scores','bra.1');
  assert.equal(feed.season,undefined);assert.equal(feed.lastResults,undefined);assert.equal(src.calls.length,10,'stops at the failed month');
  assert.equal((await getLatestResults('bra.1',NOW)).complete,false);assert.equal(src.calls.length,10,'failure cached for its one-minute backoff');
  console.log('PASS lookup failure is not called off-season and is backed off');}
 // 5. The clip route finds an older match by id and falls back to curated league clips (no matching highlight).
 {const src=source({'202609':[event('5','2026-09-19T14:00Z','Chelsea','Arsenal','1','0')]});const load=loader(src.fetch),{getIslandNews}=load('lib/town/islandNewsServer.ts'),{clipMatchesResult,withCuratedFallback}=load('lib/town/islandClipsServer.ts');
  const feed=await getIslandNews('scores','eng.w.1'),item=[...feed.items,...(feed.lastResults??[])].find(i=>i.id==='5');assert(item);
  const clips=withCuratedFallback('eng.w.1',{items:[],unavailable:true},NOW);assert.equal(clips.fallback,'curated');assert(clips.items.length>=2);
  assert.equal(clips.items.filter(c=>clipMatchesResult(c,item)).length,0,'curated clips are never presented as this match');
  const highlight={id:'abcdefghijk',title:'Chelsea v Arsenal | Highlights | Barclays WSL',publishedAt:'2026-09-19T20:00:00Z',source:'Barclays WSL',views:1,league:'eng.w.1'};
  assert(clipMatchesResult(highlight,item),'an older match still matches its own highlight within 48h');
  console.log('PASS older match: clip lookup matches its own highlight, otherwise curated league clips (not from this match)');}
 // 6. Full-match live streams are not clips (their publishers block embeds: error 150 "Video unavailable").
 {const {parseClipFeed,CLIP_CHANNELS}=loader(async()=>{throw Error('no fetch');})('lib/town/islandClipsServer.ts'),ch=CLIP_CHANNELS['eng.w.1'].id;
  const entry=(id,title)=>`<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${ch}</yt:channelId><title>${title}</title><published>2026-09-30T12:00:00Z</published></entry>`;
  const xml='<feed>'+entry('aaaaaaaaaaa','LIVE: Manchester City v Arsenal | Barclays WSL 26/27')+entry('bbbbbbbbbbb','AO VIVO: TREINO')+entry('ccccccccccc','Chelsea v Arsenal | Highlights | Barclays WSL')+entry('ddddddddddd','A lively finish from Kelly')+'</feed>';
  assert.deepEqual(parseClipFeed(xml,'eng.w.1',NOW).map(c=>c.id),['ccccccccccc','ddddddddddd']);
  console.log('PASS LIVE:/AO VIVO full-match streams are excluded from league clip feeds');}
})().catch(e=>{console.error(e);process.exit(1);});
