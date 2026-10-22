// Firefly lessons (Oct 21 2026; user: "when catching some of the firefly. it doesn't tie in any futbol fact or lesson"). Every firefly
// call teaches its lesson (a coaching idea) plus a real football fact that shows the call in play; repeats rotate the facts.
// usage: node tests/firefly-lessons.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const cache=new Map();class Ev{constructor(type){this.type=type;}}
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),get length(){return storage.size;},key:i=>[...storage.keys()][i]??null};
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,URL,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true,matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>null}),dispatchEvent:()=>true}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const SP=load('lib/town/jobs/bugSpecies.ts'),K=load('lib/town/jobs/bugCatch.ts'),BB=load('lib/town/jobs/bugBook.ts');
const calls=SP.FIREFLY_SET,facts=read('docs/bug-story-facts.md');
// ---- 1. Content: every call has its lesson and >= 2 sourced facts; no fact repeats another call's or a bug's ----
assert.deepEqual([...calls.map(c=>c.call)],['Man on!','Time!','Turn!','Square!','Switch!','Away!','Keeper\'s!','Mine!']);
const bugTexts=new Set(SP.BUG_SPECIES.flatMap(b=>b.stories.map(s=>s.text))),seen=new Map();
for(const c of calls){
 assert(c.idea&&c.idea.length<=110,`${c.call}: a coaching idea <= 110 chars (${c.idea?.length})`);assert(c.idea.startsWith(c.call),`${c.call}: the idea names its call`);
 assert(c.stories.length>=2&&c.stories.length<=3,`${c.call}: 2-3 facts`);
 for(const s of c.stories){assert(s.text.length>=60&&s.text.length<=280,`${c.call}: fact length ${s.text.length}`);assert(/^https:\/\//.test(s.source),`${c.call}: a source URL`);
  assert(facts.includes(s.source),`${c.call}: source listed in docs/bug-story-facts.md`);
  assert(!bugTexts.has(s.text),`${c.call}: not a bug-species story`);assert(!seen.has(s.text),`${c.call}: not also ${seen.get(s.text)}'s fact`);seen.set(s.text,c.call);}}
// The mismatched old facts are gone from the firefly set.
for(const old of [/Telstar/,/goal nets/,/30 November 1872/,/two balls|each wanted their own ball/,/cricket pads/,/two equal halves/])assert(!calls.some(c=>c.stories.some(s=>old.test(s.text))),`moved out: ${old}`);
assert(facts.includes('Coaching idea (the lesson)'),'the facts doc lists the lessons');
// ---- 2. The card data: title + idea + fact for all 8 calls, on first, repeat and dup catches; rotation by catch count ----
for(const c of calls){const texts=new Set();
 for(let n=1;n<=6;n++){const card=K.fireflyCard(c.id,n);assert(card,`${c.call}: a card`);assert.equal(card.title,c.call);assert.equal(card.idea,c.idea,'the lesson on every catch, repeats too');
  assert(card.fact.length>0&&card.source.length>0,`${c.call} catch ${n}: a fact`);texts.add(card.fact);}
 assert.equal(texts.size,c.stories.length,`${c.call}: repeats rotate through every fact`);
 assert.notEqual(K.fireflyCard(c.id,1).fact,K.fireflyCard(c.id,2).fact,`${c.call}: the 2nd catch shows a different fact`);
 assert.equal(K.fireflyCard(c.id,0).fact,c.stories[0].text,'a zero count still shows a fact');}
assert.equal(K.fireflyCard('nope',1),null);
const su=(a,n)=>K.storiesUnlocked(a,n).join(',');assert.equal(su(['a','b','c'],0),'');assert.equal(su(['a','b','c'],2),'a,b');assert.equal(su(['a','b'],9),'a,b');
// ---- 3. Wiring: registerCatch sends title + idea for every firefly catch (dup too); the card and the Bug book show them ----
{const J=read('lib/town/jobs/jobScene.ts'),I=read('components/IslandJobs.tsx'),B=read('components/BugBook.tsx'),css=read('components/IslandJobs.module.css');
 assert.match(J,/lesson=kind==='firefly'\?fireflyCard\(id,rec\.count\):null;/,'computed for every firefly catch, before the dup check matters');
 assert.match(J,/title:lesson\?\.title\?\?b\.name,idea:lesson\?\.idea\?\?'',story:lesson\?lesson\.fact:story\?\.text\?\?''/);
 assert.match(I,/\{bugCard\.idea&&<span className=\{styles\.bugIdea\} data-bug-idea><span>Coaching idea<\/span>\{bugCard\.idea\}<\/span>\}/);
 assert.match(I,/bugCard\.kind==='firefly'&&bugCard\.title\?bugCard\.title:bugCard\.name/,'the call is the card title');
 assert.match(css,/\.bugIdea\{[^}]*-webkit-line-clamp:3/,'idea: label + 2 lines');assert.match(css,/\.bugCard\[data-night\] \.bugFact\{[^}]*-webkit-line-clamp:5/,'fact: label + 4 lines (a whole fact on a phone)');
 assert.match(B,/data-bugbook-idea><span className=\{styles\.tag\}>Coaching idea<\/span>/);assert.match(B,/storiesUnlocked\(p\.stories,c\)\.map/);}
const pages=BB.BUG_BOOK_PAGES.filter(p=>p.kind==='firefly');assert.equal(pages.length,8);for(const p of pages){assert(p.idea&&p.lesson.includes('that call means'),`${p.id}: page has call meaning + idea`);}
console.log('PASS firefly lessons: 8 calls, each a coaching idea + 2 sourced facts (no duplicates), card title/idea/fact on every catch with rotation, Bug book pages');
