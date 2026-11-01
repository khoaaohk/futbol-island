// Fresh NPC chat content (Nov 1 2026; lib/town/npcFresh.ts, types in lib/town/npcFreshTypes.ts): every islander and every world
// area gets new topics, quick challenges, openers and "welcome back" lines; nothing repeats inside the book or copies existing
// dialogue, reading level stays kid-friendly, challenge answers are spread over the three slots.
// Shard mode (authoring aid): FRESH_SHARD=<file.ts> FRESH_IDS=a,b,c node tests/npc-fresh.cjs checks one shard's NPCs only.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>{if(!id.startsWith('.'))return require(id);const p=path.resolve(path.dirname(file),id);for(const e of ['.ts','.tsx','/index.ts'])if(fs.existsSync(p+e))return load(p+e);return require(p);});cache.set(file,m.exports);return m.exports;}

// ---- Every NPC id the game can open a chat with: islanders, wall-drill partners, beach volleyball players.
const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts'),{PRACTICE_NPCS}=load('lib/town/practiceNpcs.ts'),{VOLLEYBALL_NPCS}=load('lib/town/volleyballNpcs.ts');
const ALL_IDS=[...NPC_DIALOGUES.map(n=>n.id),...PRACTICE_NPCS.map(n=>n.id),...VOLLEYBALL_NPCS.map((_,i)=>'volleyball-'+i)];
assert.equal(new Set(ALL_IDS).size,ALL_IDS.length,'npc ids are unique');

// ---- Existing dialogue strings (and 8-word phrases) that fresh content must not copy.
const SOURCES=['npcDialogues','coralCayNpcs','eastPierNpcs','practiceNpcs','summitIsleNpcs','volleyballNpcs','townsfolkCast','npcOpeners','npcInterests','videoNeighbors','courtFreestylers','fishing/boatCaptains','npcThoughts'];
const existing=new Set(),seen=new WeakSet();
const collect=v=>{if(typeof v==='string'){if(v.trim().length>=12)existing.add(norm(v));}else if(v&&typeof v==='object'&&!seen.has(v)){seen.add(v);Object.values(v).forEach(collect);}};
const norm=s=>s.toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim();
for(const s of SOURCES){const f='lib/town/'+s+'.ts';if(fs.existsSync(f))collect(load(f));}
const words=s=>norm(s).replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);
const shingles=new Set();for(const s of existing){const w=words(s);for(let i=0;i+8<=w.length;i++)shingles.add(w.slice(i,i+8).join(' '));}

// ---- The book (or one shard while authoring).
const SHARD=process.env.FRESH_SHARD;
let byNpc,byArea,need;
if(SHARD){const m=load(SHARD);byNpc=Object.values(m).find(v=>v&&typeof v==='object');byArea={};need=(process.env.FRESH_IDS||'').split(',').filter(Boolean);}
else{const m=load('lib/town/npcFresh.ts');({byNpc,byArea}=m.FRESH);need=ALL_IDS;
 assert.deepEqual([...m.FRESH_AREAS].sort(),['beach','cay','pier','residential','sea','square','summit'],'world area ids');
 for(const a of m.FRESH_AREAS)assert(byArea[a],`area ${a} has a fallback pool`);
 for(const id of Object.keys(byNpc))assert(ALL_IDS.includes(id),`${id} is a real NPC id`);}
for(const id of need)assert(byNpc[id],`${id} has a fresh pool`);

const BANNED=['damn','hell','stupid','dumb','hate','kill','die','ugly','fat'];
const EMOJI=/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]/u;
const sentences=s=>s.split(/(?<=[.!?])\s+/).filter(x=>x.trim()).length;
const all=new Map(),slots=[0,0,0];let topics=0,challenges=0,openers=0,returning=0,strings=0;
function str(s,where,max,{topic=false}={}){
 assert.equal(typeof s,'string',`${where} is text`);assert(s.trim().length>=4,`${where} is not empty`);assert(s.length<=max,`${where} <= ${max} chars (${s.length}): ${s}`);
 assert(!EMOJI.test(s),`${where} has no emoji`);
 for(const b of BANNED)assert(!new RegExp(`\\b${b}\\b`,'i').test(s),`${where} avoids "${b}": ${s}`);
 assert.equal(s.includes('{topic}'),topic,`${where} ${topic?'uses':'must not use'} {topic}`);
 if(topic)assert.equal(s.split('{topic}').length,2,`${where} uses {topic} once`);
 const k=norm(s);assert(!all.has(k),`${where} repeats ${all.get(k)}: ${s}`);all.set(k,where);
 assert(!existing.has(k),`${where} copies existing dialogue: ${s}`);
 const w=words(s);for(let i=0;i+8<=w.length;i++)assert(!shingles.has(w.slice(i,i+8).join(' ')),`${where} copies the existing phrase "${w.slice(i,i+8).join(' ')}"`);
 strings++;
}
function pool(p,label,min){
 assert(Array.isArray(p.topics)&&p.topics.length>=min.t,`${label} has ${min.t}+ topics`);
 assert(Array.isArray(p.challenges)&&p.challenges.length>=min.c,`${label} has ${min.c}+ challenges`);
 assert(Array.isArray(p.openers)&&p.openers.length>=min.o,`${label} has ${min.o}+ openers`);
 assert(Array.isArray(p.returning)&&p.returning.length>=min.r,`${label} has ${min.r}+ returning lines`);
 const ids=new Set();const id=(x,w)=>{assert(/^[a-z0-9-]+$/.test(x),`${w} id "${x}" is kebab-case`);assert(!ids.has(x),`${w} id "${x}" unique`);ids.add(x);};
 let follow=0;
 for(const t of p.topics){const w=`${label}/${t.id}`;id(t.id,w);str(t.question,w+' question',60);str(t.answer,w+' answer',260);assert(sentences(t.answer)<=3,`${w} answer is 1-3 sentences`);
  if(t.followUp){follow++;str(t.followUp.question,w+' followUp question',60);str(t.followUp.answer,w+' followUp answer',260);assert(sentences(t.followUp.answer)<=3,`${w} followUp is 1-3 sentences`);}}
 assert(follow*2>p.topics.length,`${label}: most topics have a follow-up`);
 const local=new Set();
 for(const c of p.challenges){const w=`${label}/${c.id}`;id(c.id,w);str(c.prompt,w+' prompt',150);
  assert(Array.isArray(c.options)&&c.options.length===3,`${w} has 3 options`);c.options.forEach((o,i)=>str(o,`${w} option ${i}`,70));
  assert.equal(new Set(c.options.map(norm)).size,3,`${w} options differ`);
  assert([0,1,2].includes(c.correct),`${w} correct index is 0, 1 or 2`);slots[c.correct]++;local.add(c.correct);
  str(c.right,w+' right',220);str(c.wrong,w+' wrong',220);}
 if(p.challenges.length>=3)assert(local.size>=2,`${label}: correct answers are not all in one slot`);
 p.openers.forEach((o,i)=>str(o,`${label} opener ${i}`,170));
 p.returning.forEach((o,i)=>str(o,`${label} returning ${i}`,150,{topic:true}));
 topics+=p.topics.length;challenges+=p.challenges.length;openers+=p.openers.length;returning+=p.returning.length;
}
for(const id of need)pool(byNpc[id],id,{t:8,c:4,o:4,r:3});
for(const [a,p] of Object.entries(byArea))pool(p,'area:'+a,{t:6,c:3,o:3,r:2});
const total=slots[0]+slots[1]+slots[2];
for(let i=0;i<3;i++)assert(slots[i]*2<=total,`correct slot ${i} is not above 50% overall (${slots[i]}/${total})`);
console.log(`PASS npc-fresh: ${need.length} NPCs, ${Object.keys(byArea).length} areas, ${topics} topics, ${challenges} challenges (slots ${slots.join('/')}), ${openers} openers, ${returning} returning, ${strings} unique strings`);
