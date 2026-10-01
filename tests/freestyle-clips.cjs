// Freestyle clips (Sep 30 2026): every freestyle NPC opens on its OWN clip (Henderson used to repeat on four of them),
// every clip id is in the pool, and the pool entries are well-formed. The rig trick index `freestyle` stays separate.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>load(path.resolve(path.dirname(file),id+'.ts')));return m.exports;}
const {COURT_FREESTYLERS,FREESTYLE_CLIPS,freestyleClipStart}=load('lib/town/courtFreestylers.ts');
const {CORAL_CAY_NPCS}=load('lib/town/coralCayNpcs.ts'),{EAST_PIER_NPCS}=load('lib/town/eastPierNpcs.ts');
const freestylers=[...COURT_FREESTYLERS,...CORAL_CAY_NPCS,...EAST_PIER_NPCS].filter(n=>n.freestyle!==undefined);
assert.equal(freestylers.length,7,'seven freestyle NPCs');
// Pool entries: real-looking YouTube ids, unique, with a title, a publisher line and a teaching prompt.
const ids=FREESTYLE_CLIPS.map(c=>c.id);assert.equal(new Set(ids).size,ids.length,'no duplicate clips in the pool');
for(const c of FREESTYLE_CLIPS){assert.match(c.id,/^[A-Za-z0-9_-]{11}$/,c.id);for(const k of ['title','source','prompt'])assert(typeof c[k]==='string'&&c[k].trim().length>1,`${c.id} ${k}`);assert(c.prompt.length<=160,`${c.id} prompt stays short for kids`);}
// Every freestyler has its own clip, and it is in the pool.
const first=freestylers.map(n=>{assert(n.freestyleClip,`${n.id} has a clip`);const i=freestyleClipStart(n.freestyleClip,n.freestyle);assert.equal(FREESTYLE_CLIPS[i].id,n.freestyleClip,`${n.id} clip is in the pool`);return n.freestyleClip;});
assert.equal(new Set(first).size,freestylers.length,'every freestyle NPC opens on a different clip');
// Named players in greetings/topics match the NPC's own clip.
const byId=Object.fromEntries(freestylers.map(n=>[n.id,n]));
assert.equal(byId['court-nico'].freestyleClip,'3Iq0Rtxt6K4','Teo keeps the Fagerli final');
assert.equal(byId['court-zuri'].freestyleClip,'2hvClyF2j0I','Zuri keeps Andrew Henderson');
for(const n of freestylers){const text=JSON.stringify([n.greeting,n.topics]),clip=FREESTYLE_CLIPS.find(c=>c.id===n.freestyleClip);
 if(/Henderson/.test(text))assert.match(clip.title,/Henderson/,`${n.id} mentions Henderson`);if(/Fagerli/.test(text))assert.match(clip.title,/Fagerli/,`${n.id} mentions Fagerli`);}
// Cycling ("Another freestyle clip") walks the whole pool from the NPC's own clip; unknown ids fall back safely.
for(const n of freestylers){const start=freestyleClipStart(n.freestyleClip,n.freestyle),seen=new Set();for(let k=0;k<FREESTYLE_CLIPS.length;k++)seen.add((start+k)%FREESTYLE_CLIPS.length);assert.equal(seen.size,FREESTYLE_CLIPS.length);}
assert.equal(freestyleClipStart(undefined,9),9%FREESTYLE_CLIPS.length);
// The rig trick program index is unchanged by the clip field (0-3 on the court, as before).
assert.deepEqual(COURT_FREESTYLERS.map(n=>n.freestyle),[0,1,2,3]);
console.log(`PASS ${freestylers.length} freestyle NPCs each open on a unique clip from a well-formed pool of ${FREESTYLE_CLIPS.length}`);
