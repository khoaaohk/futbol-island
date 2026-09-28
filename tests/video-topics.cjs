const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>load(path.resolve(path.dirname(file),id+'.ts')));return m.exports;}
const {VIDEO_TOPICS,reviewedTopicClips}=load('lib/town/videoTopics.ts'),{VIDEO_NEIGHBORS}=load('lib/town/videoNeighbors.ts');
assert.equal(VIDEO_NEIGHBORS.length,10);for(const npc of VIDEO_NEIGHBORS){assert(VIDEO_TOPICS[npc.videoTopic]);assert(!npc.matchStory&&!npc.news,'no opening-time feed request');}
const now=Date.now(),iso=offset=>new Date(now+offset).toISOString(),entry={id:'abcdefghijk',channelId:VIDEO_TOPICS['espn-goals'].channel,reviewNote:'Fixture review',reviewedAt:iso(-1000),expiresAt:iso(60000),publishedAt:iso(-2000),title:'Fixture goal analysis',topics:['espn-goals']};
assert.equal(reviewedTopicClips('espn-goals',now,[entry]).length,1);
for(const patch of [{channelId:VIDEO_TOPICS['ucl-final-discussion'].channel},{topics:['espn-skills']},{reviewNote:''},{expiresAt:iso(-1)},{publishedAt:iso(-4*86400000)},{reviewedAt:iso(1000)},{id:'invalid'}])assert.equal(reviewedTopicClips('espn-goals',now,[{...entry,...patch}]).length,0);
assert.equal(reviewedTopicClips('espn-goals').length,0);assert.equal(reviewedTopicClips('unknown',now,[entry]).length,0);
assert.equal(VIDEO_TOPICS['ucl-final-discussion'].source,'CBS Sports Golazo');console.log('PASS ten unique topic desks; ESPN FC/CBS/UEFA source matching, freshness and review gate');
// Evergreen flag: freestyle skill channel skips ONLY the 14-day age limit; news topics keep it.
{const {parseClipFeed}=load('lib/town/islandClipsServer.ts'),{recentIslandClips}=load('lib/town/islandClips.ts'),{COURT_FREESTYLERS}=load('lib/town/courtFreestylers.ts');
const g=VIDEO_TOPICS['garnier-freestyle'];assert.equal(g.channel,'UCIGIk1wN10aAPHusfE7AEPA');assert.equal(g.source,'Séan Garnier');assert.equal(g.evergreen,true);
for(const [k,v] of Object.entries(VIDEO_TOPICS))if(k!=='garnier-freestyle')assert(!v.evergreen,k+' must stay fresh-only');
assert.equal(COURT_FREESTYLERS.filter(n=>n.videoTopic==='garnier-freestyle').length,1);
const old=new Date(now-200*86400000).toISOString(),row=(ch,id='abcdefghijk',date=old,title='Freestyle skills')=>`<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${ch}</yt:channelId><title>${title}</title><published>${date}</published></entry>`;
const feed=x=>'<feed>'+x+'</feed>',pub=t=>({id:VIDEO_TOPICS[t].channel,name:VIDEO_TOPICS[t].source,evergreen:VIDEO_TOPICS[t].evergreen});
assert.equal(parseClipFeed(feed(row(g.channel)),'uefa.champions',now,pub('garnier-freestyle')).length,1,'old freestyle clip kept');
assert.equal(parseClipFeed(feed(row(VIDEO_TOPICS['espn-goals'].channel)),'uefa.champions',now,pub('espn-goals')).length,0,'old news clip dropped');
for(const bad of [row('UCfakefakefakefakefakefa'),row(g.channel,'bad'),row(g.channel,undefined,undefined,''),row(g.channel,undefined,new Date(now+86400000).toISOString())])assert.equal(parseClipFeed(feed(bad),'uefa.champions',now,pub('garnier-freestyle')).length,0,'other safety checks still apply');
const clip={id:'abcdefghijk',title:'x',publishedAt:old,source:'s',views:0,league:'uefa.champions'};
assert.equal(recentIslandClips([clip],now,true).length,1);assert.equal(recentIslandClips([clip],now).length,0);assert.equal(recentIslandClips([{...clip,publishedAt:new Date(now+1000).toISOString()}],now,true).length,0);
console.log('PASS evergreen Séan Garnier freestyle topic keeps old skill clips; news topics keep the 14-day limit');}
