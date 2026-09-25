const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,WeakMap,require:id=>load(path.resolve(path.dirname(file),id)+'.ts')});return m.exports;}
const {withNarration,mapNarrationTime}=load('lib/paths/riso/narration.ts');
const {resolveFrame,storyDuration}=load('lib/paths/riso/story.ts');
let drawn;
const original={id:'fixture',audio:{mode:'chapters'},chapters:[{narration:'One unchanged thought.',seconds:10,cues:[{at:0,words:'One'},{at:4,words:'thought'}],headline:{text:'Thought',at:4}},{narration:'Another.',seconds:8,cues:[]}],draw:f=>drawn=f};
const maps=[[[0,0],[4,5],[9.35,10.35],[10,11]],[[0,0],[8,7]]];
const narrated=withNarration(original,{mode:'chapters',clips:maps.map((map,i)=>({audio:`/new/${i}.m4a`,seconds:map.at(-1)[1],map}))});
assert.equal(narrated.chapters[0].narration,original.chapters[0].narration);assert.equal(narrated.chapters[0].cues[1].at,5);assert.equal(narrated.chapters[0].headline.at,5);
for(let t=0;t<=11;t+=.025){const old=mapNarrationTime(t,maps[0],true);assert.ok(Math.abs(mapNarrationTime(old,maps[0])-t)<1e-8);narrated.draw({time:t,...resolveFrame(narrated,t,0)});assert.ok(Math.abs(drawn.time-old)<1e-8);}
narrated.draw({time:11,...resolveFrame(narrated,11,0)});assert.equal(drawn.chapter,0);assert.equal(drawn.chapterTime,10,'exact outgoing seam retained');
narrated.draw({time:11,...resolveFrame(narrated,11,1)});assert.equal(drawn.chapter,1);assert.equal(drawn.chapterTime,0,'incoming frame zero retained');
const track={...original,audio:{mode:'track',src:'/old.mp3',duration:18},chapters:original.chapters.map((ch,i)=>({...ch,start:i?10:0})),visualChapters:[{start:0},{start:6,headline:{text:'Turn',at:2}}]};
const converted=withNarration(track,{mode:'track',src:'/new.m4a',duration:22,map:[[0,0],[6,8],[10,13],[18,22]]});
assert.equal(storyDuration(converted),22);assert.equal(converted.chapters[1].start,13);assert.equal(converted.visualChapters[1].start,8);assert.equal(converted.visualChapters[1].headline.at,2.5);
converted.draw({time:10.5,...resolveFrame(converted,10.5)});assert.equal(drawn.time,8);assert.equal(drawn.chapter,1);assert.equal(drawn.captionChapter,0);
converted.draw({time:8,...resolveFrame(converted,8,0)});assert.equal(drawn.chapter,0,'held outgoing track seam keeps its registration chapter');assert.equal(drawn.chapterTime,6);
converted.draw({time:8,...resolveFrame(converted,8,1)});assert.equal(drawn.chapter,1);assert.equal(drawn.chapterTime,0);
const manifest=JSON.parse(fs.readFileSync('lib/paths/riso/data/narrationOverrides.json','utf8'));
for(const [id,entry] of Object.entries(manifest)){
 const clips=entry.mode==='track'?[entry]:entry.clips;
 for(const clip of clips){assert.ok(fs.existsSync('public'+(clip.audio??clip.src)),`${id} missing audio`);for(let i=1;i<clip.map.length;i++){assert.ok(clip.map[i][0]>clip.map[i-1][0]);assert.ok(clip.map[i][1]>clip.map[i-1][1]);}assert.equal(clip.map[0][0],0);assert.equal(clip.map[0][1],0);assert.ok(Math.abs(clip.map.at(-1)[1]-(clip.seconds??clip.duration))<.001);}
}
const evidence=JSON.parse(fs.readFileSync('docs/story-production/elevenlabs-narration-2026-09-22.json','utf8'));
for(const [id,entry] of Object.entries(manifest)){for(const [i,clip] of (entry.mode==='track'?[entry]:entry.clips).entries()){const media=evidence[id].clips[i];assert.ok(media.tempo>=1&&media.tempo<=1.2);if(entry.mode==='chapters')assert.ok(Math.abs(clip.seconds-media.duration-.65)<.001,`${id}: no stale chapter padding`);}}
console.log(`PASS speech retiming, unchanged scripts, authored seam endpoints, caption/headline clock and ${Object.keys(manifest).length} installed story manifests`);
