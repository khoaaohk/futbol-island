// Curated clip fallback (Sep 30 2026): YouTube channel RSS feeds return 404, so every video-desk topic and every news
// league must still serve verified official clips (unavailable:false, fallback:'curated'), without extra feed requests.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
function loader(fakeFetch){const cache=new Map();return function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 const resolve=id=>{const base=path.resolve(path.dirname(file),id);return fs.existsSync(base+'.ts')?load(base+'.ts'):require(base.endsWith('.json')?base:base+'.json');};
 new Function('exports','module','require','fetch',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText)(m.exports,m,resolve,fakeFetch);return m.exports;};}
const scenarios={rejects:async()=>{throw Error('network down');},'404':async()=>({ok:false,status:404,text:async()=>'Not Found'})};
(async()=>{
 for(const [name,impl] of Object.entries(scenarios)){
  const calls=[],load=loader(async url=>{calls.push(url);return impl(url);});
  const {CURATED_TOPIC_CLIPS,CURATED_LEAGUE_CLIPS,EMBED_FALLBACK_CHANNELS,KNOWN_EMBED_BLOCKED,CURATED_VERIFIED_AT,EMBED_BLOCKED_CHANNELS}=load('lib/town/curatedClips.ts');
  const {VIDEO_TOPICS,getTopicClips}=load('lib/town/videoTopics.ts'),{CLIP_CHANNELS,getIslandClips}=load('lib/town/islandClipsServer.ts'),{NEWS_LEAGUES}=load('lib/town/newsLeagues.ts');
  const {recentIslandClips}=load('lib/town/islandClips.ts');
  const check=(clip,channel,name,label)=>{assert.match(clip.id,/^[A-Za-z0-9_-]{11}$/,`${label} id ${clip.id}`);
   // Same official channel, or (when that publisher blocks embedding) a listed official broadcaster credited by name.
   if(clip.channelId===channel)assert.equal(clip.source,name,`${label} ${clip.id} source`);else assert.equal(clip.source,EMBED_FALLBACK_CHANNELS[clip.channelId],`${label} ${clip.id} is from its official channel or a listed embeddable broadcaster`);
   // Oct 1 2026 embed sweep: every entry records the date it played in the muted headless embed test; blocked ids stay out.
   assert.match(clip.embedVerifiedAt??'',/^\d{4}-\d{2}-\d{2}$/,`${label} ${clip.id} embeddable verified date`);assert(clip.embedVerifiedAt>=CURATED_VERIFIED_AT&&Date.parse(clip.embedVerifiedAt)<=Date.now(),`${label} ${clip.id} embed date in range`);
   assert(!KNOWN_EMBED_BLOCKED.has(clip.id),`${label} ${clip.id} failed the embed test (error 150)`);
   assert(clip.title.trim().length>3&&clip.source.trim(),`${label} ${clip.id} title/source`);assert(Number.isFinite(Date.parse(clip.publishedAt))&&Date.parse(clip.publishedAt)<Date.now(),`${label} ${clip.id} date`);
   assert(clip.concept&&clip.concept.trim(),`${label} ${clip.id} concept tag`);assert(!/\b(fight|brawl|bet|betting|odds|casino|red card|punch)\b/i.test(clip.title),`${label} ${clip.id} kid-appropriate title`);};
  for(const topic of Object.keys(VIDEO_TOPICS)){
   const feed=await getTopicClips(topic);assert(feed.items.length>=1,`${name}: ${topic} has a clip`);assert.equal(feed.unavailable,false,`${name}: ${topic} available`);
   if(VIDEO_TOPICS[topic].featured)continue;
   assert.equal(feed.fallback,'curated',`${name}: ${topic} flagged curated`);const list=CURATED_TOPIC_CLIPS[topic];assert(list.length>=2&&list.length<=4,`${topic} has 2-4 curated clips`);
   assert.equal(new Set(list.map(c=>c.id)).size,list.length,`${topic} no duplicates`);for(const clip of list)check(clip,VIDEO_TOPICS[topic].channel,VIDEO_TOPICS[topic].source,topic);
   assert.deepEqual(feed.items.map(c=>c.id),list.map(c=>c.id).slice(0,5));
   assert.equal((await getTopicClips(topic,true)).items.length,list.length,`${topic} full list`);
  }
  for(const league of Object.keys(NEWS_LEAGUES)){
   const feed=await getIslandClips(league);assert(feed.items.length>=1,`${name}: ${league} has a clip`);assert.equal(feed.unavailable,false);assert.equal(feed.fallback,'curated');
   const list=CURATED_LEAGUE_CLIPS[league];assert(list.length>=2&&list.length<=4,`${league} has 2-4 curated clips`);assert.equal(new Set(list.map(c=>c.id)).size,list.length);
   for(const clip of list){check(clip,CLIP_CHANNELS[league].id,CLIP_CHANNELS[league].name,league);assert.equal(clip.league,league);}
   // The route keeps evergreen curated clips past the two-week news filter.
   assert.equal(recentIslandClips(feed.items,Date.now(),true).length,list.length,`${league} survives the route filter`);
  }
  // Failure backoff: one feed request per channel/league, then the cached failure serves curated clips without refetching.
  const before=calls.length;const channels=new Set(Object.values(VIDEO_TOPICS).filter(t=>!t.featured).map(t=>t.channel).filter(id=>!EMBED_BLOCKED_CHANNELS.has(id)));
  const leagues=Object.keys(NEWS_LEAGUES).filter(l=>!EMBED_BLOCKED_CHANNELS.has(CLIP_CHANNELS[l].id));assert(leagues.length<Object.keys(NEWS_LEAGUES).length&&!leagues.includes('esp.1')&&!leagues.includes('fra.1'));
  assert.equal(before,channels.size+leagues.length,`${name}: one request per embeddable channel and league, none for embed-blocked publishers`);
  assert(!calls.some(url=>[...EMBED_BLOCKED_CHANNELS].some(id=>url.endsWith(id))),`${name}: no feed request to an embed-blocked publisher`);
  await getTopicClips('uefa-pressing');await getTopicClips('espn-goals');await getIslandClips('eng.1');assert.equal(calls.length,before,`${name}: backoff makes no new request`);
  assert(calls.every(url=>/^https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=UC[\w-]{22}$/.test(url)));
 }
 console.log('PASS every video topic and news league serves 2-4 well-formed, embed-verified curated official clips when the feed rejects or 404s, with the failure backoff intact');
})().catch(e=>{console.error(e);process.exit(1);});
