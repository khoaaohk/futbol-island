const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>load(path.resolve(path.dirname(file),id+'.ts')));return m.exports;}
const {CLIP_CHANNELS,parseClipFeed,clipMatchesResult}=load('lib/town/islandClipsServer.ts'),now=Date.parse('2026-09-16T12:00:00Z');
const entry=(title='Arsenal v Chelsea | HIGHLIGHTS',date='2026-09-15T23:00:00Z',channel=CLIP_CHANNELS['eng.1'].id,id='abcdefghijk')=>`<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${channel}</yt:channelId><title>${title}</title><published>${date}</published><media:statistics views="12345"/></entry>`;
const parse=xml=>parseClipFeed('<feed>'+xml+'</feed>','eng.1',now);
const clip=parse(entry())[0];assert.equal(clip.views,12345);assert.equal(clip.source,'Premier League');assert.equal(parse(entry('Old','2026-08-01')).length,0);assert.equal(parse(entry('Future','2027-01-01')).length,0);assert.equal(parse(entry('Unsafe',undefined,'fake')).length,0);assert.equal(parse(entry('Unsafe',undefined,undefined,'javascript:alert(1)')).length,0);assert.equal(parse(entry('Classic Arsenal v Chelsea Highlights')).length,0);assert.throws(()=>parseClipFeed('<html>blocked</html>','eng.1',now));
const match={league:'eng.1',publishedAt:'2026-09-15T18:00:00Z',match:{home:'Arsenal',away:'Chelsea',state:'post'}};
assert(clipMatchesResult(clip,match));assert(!clipMatchesResult({...clip,title:'Arsenal v Liverpool highlights'},match));assert(!clipMatchesResult({...clip,title:'Arsenal v Chelsea press conference'},match));assert(!clipMatchesResult(clip,{...match,league:'esp.1'}));assert(!clipMatchesResult(clip,{...match,publishedAt:'2026-09-12T18:00:00Z'}));assert(!clipMatchesResult(clip,{...match,match:{...match.match,state:'pre'}}));
assert(clipMatchesResult({...clip,title:'Man Utd v Chelsea | HIGHLIGHTS'},{...match,match:{...match.match,home:'Manchester United'}}));
console.log('PASS official channels, fresh publication dates, safe IDs, popular counts, exact teams/league/date and highlights-only result matching');
const {childReviewedClips}=load('lib/town/islandClipsServer.ts');
const approved={id:clip.id,channelId:CLIP_CHANNELS['eng.1'].id,reviewedAt:'2026-09-16T10:00:00Z',expiresAt:'2026-09-17T10:00:00Z',reviewNote:'Test fixture review—not a real publication approval.'};
assert.equal(childReviewedClips([clip],now).length,0,'official publisher alone never auto-approves');
assert.equal(childReviewedClips([clip],now,[approved]).length,1);
for(const altered of [{channelId:'imposter'},{reviewNote:''},{reviewedAt:'invalid'},{reviewedAt:'2026-09-17T10:00:00Z'},{expiresAt:'2026-09-16T11:00:00Z'},{expiresAt:'2026-10-01T00:00:00Z'}])assert.equal(childReviewedClips([clip],now,[{...approved,...altered}]).length,0);
assert.equal(childReviewedClips([{...clip,publishedAt:'2026-09-12T00:00:00Z'}],now,[approved]).length,0,'older than 72 hours excluded');
console.log('PASS child-facing publication gate: review required, exact source, freshness, expiration and missing/invalid approval fail closed');

const {recentIslandClips}=load('lib/town/islandClips.ts');
const at=days=>new Date(now-days*86400000).toISOString();
const samples=[{...clip,id:'old',publishedAt:at(15)},{...clip,id:'edge',publishedAt:at(14)},{...clip,id:'new',publishedAt:at(1)},{...clip,id:'future',publishedAt:at(-1)},{...clip,id:'new',publishedAt:at(1)}];
assert.deepEqual(recentIslandClips(samples,now).map(c=>c.id),['new','edge']);
assert.deepEqual(recentIslandClips(samples,now+1).map(c=>c.id),['new']);
assert.equal(parse(entry('Recent',at(13))).length,1);
assert.equal(parse(entry('Expired',at(15))).length,0);
console.log('PASS 14-day cutoff, cache expiry boundary, newest-first and backup deduplication');
