const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>load(path.resolve(path.dirname(file),id+'.ts')));return m.exports;}
const {VIDEO_TOPICS,reviewedTopicClips}=load('lib/town/videoTopics.ts'),{VIDEO_NEIGHBORS}=load('lib/town/videoNeighbors.ts');
assert.equal(VIDEO_NEIGHBORS.length,10);for(const npc of VIDEO_NEIGHBORS){assert(VIDEO_TOPICS[npc.videoTopic]);assert(!npc.matchStory&&!npc.news,'no opening-time feed request');}
const now=Date.now(),iso=offset=>new Date(now+offset).toISOString(),entry={id:'abcdefghijk',channelId:VIDEO_TOPICS['espn-goals'].channel,reviewNote:'Fixture review',reviewedAt:iso(-1000),expiresAt:iso(60000),publishedAt:iso(-2000),title:'Fixture goal analysis',topics:['espn-goals']};
assert.equal(reviewedTopicClips('espn-goals',now,[entry]).length,1);
for(const patch of [{channelId:VIDEO_TOPICS['ucl-final-discussion'].channel},{topics:['espn-skills']},{reviewNote:''},{expiresAt:iso(-1)},{publishedAt:iso(-4*86400000)},{reviewedAt:iso(1000)},{id:'invalid'}])assert.equal(reviewedTopicClips('espn-goals',now,[{...entry,...patch}]).length,0);
assert.equal(reviewedTopicClips('espn-goals').length,0);assert.equal(reviewedTopicClips('unknown',now,[entry]).length,0);
assert.equal(VIDEO_TOPICS['ucl-final-discussion'].source,'CBS Sports Golazo');console.log('PASS ten unique topic desks; ESPN FC/CBS/UEFA source matching, freshness and review gate');
