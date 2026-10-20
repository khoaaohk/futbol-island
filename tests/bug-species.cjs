// Summit Isle Bug squad content (Oct 20 2026, user: "make the bug squad catch DIFFERENT TYPES, 20 bugs; every bug must have a
// REAL-LIFE story about futbol ... spread the bugs across Summit Isle: up high on the mountain, along the trails, near the water;
// plus the night fireflies (8 calls) keep a real football story each"). lib/town/jobs/bugSpecies.ts, docs/bug-story-facts.md.
//  1. 20 unique species in a club: 11 starters (shirts 1-11), subs and staff; valid bands, times, rarities, moves and looks;
//  2. every bug and firefly call has 1-3 friendly real-football stories (≤ 280 chars, with a source listed in the facts doc);
//  3. homes on the real island: walkable, gentle, ≥ 12 m from colliders and job signs, ≥ 18 m apart, every band used; north of
//     the summit (hidden behind the mountain from the south-east camera) only beach homes (user, Oct 20 2026);
//  4. the rotating picker: 8-12 by heat tier, ≥ 2 per band, ≤ 1 legendary, right time of day, seeded, every bug turns up.
// usage: node tests/bug-species.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const S=load('lib/town/jobs/bugSpecies.ts'),B=load('lib/town/jobs/bugScout.ts'),C=load('lib/town/jobs/jobCatalog.ts'),SI=load('lib/town/summitIsle.ts');
const list=S.BUG_SPECIES,calls=S.FIREFLY_SET,facts=read('docs/bug-story-facts.md');
const BANDS=['high','trail','water','meadow'],uniq=a=>new Set(a).size===a.length;

// ---- 1. Twenty different bugs, one club ----
{assert.equal(list.length,20,'twenty bugs');for(const k of ['id','name','kind'])assert(uniq(list.map(b=>b[k])),`unique ${k}s`);
 const starters=list.filter(b=>b.role.group==='starter');assert.equal(starters.length,11,'a starting XI');
 same(starters.map(b=>b.role.shirt).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10,11],'shirts 1-11');
 assert(list.some(b=>b.role.group==='sub'&&/keeper/i.test(b.role.label)),'a sub keeper');
 for(const r of ['coach','referee','physio','kit man','mascot'])assert(list.some(b=>b.role.group==='staff'&&b.role.label.toLowerCase().includes(r)),`staff: ${r}`);
 assert(starters.some(b=>/goalkeeper/i.test(b.role.label))&&starters.some(b=>/captain/i.test(b.role.label))&&starters.some(b=>/striker/i.test(b.role.label)));
 const moves=new Set(['butterfly-glide','dragonfly-dart','damsel-hover','bee-hover','hop-arc','beetle-trundle','ground-dash','ant-march','inchworm-crawl','still-sway','mantis-stalk','spider-jump','moth-flutter','cicada-hop','firefly-drift']);
 for(const b of list){assert(BANDS.includes(b.band),b.id);assert(['day','sunset','both'].includes(b.when),b.id);assert(moves.has(b.move),`${b.id} move`);
  assert(b.role.lesson.length>30&&b.accent.length>15,`${b.id}: a lesson and a football accent`);
  assert(b.look.palette.length>=2&&b.look.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c))&&b.look.size>.1&&b.look.size<1&&b.look.pattern.length>20,`${b.id} look`);
  assert.equal(b.sneak,S.SNEAK[b.rarity].sneak);}
 assert(new Set(list.map(b=>b.look.body)).size>=12,'many different body plans');
 const order=['common','uncommon','rare','legendary'];for(let i=1;i<4;i++)assert(S.SNEAK[order[i]].sneak>S.SNEAK[order[i-1]].sneak,'rarer bugs need more sneaking');
 for(const r of order)assert(list.some(b=>b.rarity===r),`some ${r}`);
 assert(list.filter(b=>b.rarity==='legendary').length<=2);}

// ---- 2. Real football stories ----
{assert.equal(calls.length,8,'eight firefly calls');assert(uniq(calls.map(c=>c.id))&&uniq(calls.map(c=>c.call)));
 for(const c of calls)assert(B.FIREFLY_CALLS.some(f=>f.hint.includes(`"${c.call}"`)),`the job's firefly "${c.call}" has content`);
 let n=0;for(const e of [...list,...calls]){const id=e.id;assert(e.stories.length>=1&&e.stories.length<=3,`${id}: 1-3 stories`);
  for(const s of e.stories){n++;assert(s.text.length>=60&&s.text.length<=280,`${id}: story length ${s.text.length}`);
   const sentences=s.text.split(/(?<=[.!?])\s+(?=[A-Z"'])/).length;assert(sentences>=1&&sentences<=4,`${id}: ≤ 4 sentences`);
   assert(!/\b(sting|stings|kill|squash|hurt|die|died|dead|war)\b/i.test(s.text),`${id}: friendly copy`);
   assert(/^https:\/\//.test(s.source)&&facts.includes(s.source),`${id}: source ${s.source} is listed in docs/bug-story-facts.md`);}}
 assert(n>=40,`plenty of stories (${n})`);
 for(const u of Object.values(S.BUG_STORY_SOURCES))assert(facts.includes(u),`facts doc lists ${u}`);}

// ---- 3. Homes on the real island ----
{const world=load('lib/town/world.ts').buildTown(new T.Scene()),obs=world.obstacles.filter(o=>o.x>400&&o.x<880&&o.z>-60&&o.z<320);
 const gap=(q,o)=>Math.hypot(Math.max(0,Math.abs(q.x-o.x)-o.w/2),Math.max(0,Math.abs(q.z-o.z)-o.d/2));
 assert(obs.length>100,'the real Summit obstacles');const boards=C.JOBS.map(j=>j.board);assert(boards.length>5);
 for(const [homes,ids,label] of [[S.BUG_HOMES,list.map(b=>b.id),'bug'],[S.FIREFLY_HOMES,calls.map(c=>c.id),'firefly']]){
  same([...homes.map(h=>h.id)].sort(),[...ids].sort(),`one ${label} home each`);
  for(const h of homes){const where=`${label} ${h.id} (${h.x}, ${h.z})`;
   assert(SI.onSummitIsle(h.x,h.z),`${where} on walkable Summit Isle`);assert(SI.summitSlope(h.x,h.z)<.45,`${where} gentle (${SI.summitSlope(h.x,h.z).toFixed(2)})`);
   const clear=Math.min(...obs.map(o=>gap(h,o)));assert(clear>=S.BUG_CLEARANCE,`${where} ≥ 12 m from colliders (${clear.toFixed(1)})`);
   for(const b of boards)assert(Math.hypot(b.x-h.x,b.z-h.z)>=12,`${where} ≥ 12 m from the sign at (${b.x}, ${b.z})`);
   const P=SI.SUMMIT_PITCH,F=SI.SUMMIT_FENCE;assert(!(Math.abs(h.x-P.x)<F.halfX+6&&Math.abs(h.z-P.z)<F.halfZ+6),`${where} off the Summit 5s`);
   assert(h.wander>=1&&h.wander<=6,`${where} wander ≤ 6 m`);
   for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=h.x+Math.cos(a)*h.wander,z=h.z+Math.sin(a)*h.wander;assert(SI.onSummitIsle(x,z),`${where}: the wander ring stays on walkable ground`);}
   const g=SI.summitGround(h.x,h.z),t=SI.summitTrailDistance(h.x,h.z),w=SI.distanceToSummitShore(h.x,h.z);
   const ok={high:g>=30&&t>10,trail:t<=10,water:w>=3&&w<=24&&g<30,meadow:w>24&&t>10&&g<30}[h.band];
   assert(S.bugHomeAllowed(h),`${where}: north of the line only beach homes`);
   if(h.z<S.BUG_NORTH_LINE_Z){assert.equal(h.band,'water',`${where}: only beach homes on the north end`);assert(S.onSummitSand(h.x,h.z)&&w>=3,`${where}: on the sand`);}
   for(const q of S.BUG_JOB_SPOTS)assert(Math.hypot(q.x-h.x,q.z-h.z)>=S.BUG_CLEARANCE,`${where} ≥ 12 m from the Bug squad sign / hotel at (${q.x}, ${q.z})`);assert(ok,`${where} really is in the ${h.band} band (h ${g.toFixed(1)}, trail ${t.toFixed(1)}, shore ${w.toFixed(1)})`);}
  for(let i=0;i<homes.length;i++)for(let j=i+1;j<homes.length;j++){const d=Math.hypot(homes[i].x-homes[j].x,homes[i].z-homes[j].z);assert(d>=S.BUG_MIN_SPACING,`${label} homes ${homes[i].id}/${homes[j].id} ${d.toFixed(1)} m apart`);}}
 const per=b=>S.BUG_HOMES.filter(h=>h.band===b).length;
 for(const band of BANDS)assert(per(band)>=3&&per(band)<=7,`${band}: 3-7 bugs (${per(band)})`);
 assert(per('high')+S.BUG_HOMES.filter(h=>h.band==='trail'&&SI.summitGround(h.x,h.z)>=25).length>=6,'at least six bugs up high on the mountain');
 assert(S.BUG_HOMES.filter(h=>h.z<S.BUG_NORTH_LINE_Z).length<=4,'only a few beach bugs on the hidden north end');
 // The rule itself: a north-end meadow or trail spot is refused, a north beach spot is fine, anything south is fine.
 assert(!S.bugHomeAllowed({band:'meadow',x:700,z:60})&&!S.bugHomeAllowed({band:'trail',x:682,z:56})&&S.bugHomeAllowed({band:'water',x:650,z:14})&&S.bugHomeAllowed({band:'meadow',x:602,z:196}));
 assert(Math.abs(S.BUG_NORTH_LINE_Z-(SI.TERRACE.z-SI.TERRACE.b))<1e-9,'the north line is the summit terrace\'s north edge');
 for(const b of list)assert.equal(S.bugHomeById(b.id).band,b.band,`${b.id} lives in its own band`);
 assert(new Set(S.FIREFLY_HOMES.map(h=>h.band)).size>=4,'fireflies in every band');
 const xs=S.BUG_HOMES.map(h=>h.x),zs=S.BUG_HOMES.map(h=>h.z);assert(Math.max(...xs)-Math.min(...xs)>250&&Math.max(...zs)-Math.min(...zs)>180,'spread over the whole island');}

// ---- 4. The rotating picker ----
{const seen=new Set(),sets=new Set();
 for(let seed=0;seed<300;seed++)for(const tier of [0,1,2,3,4])for(const time of ['day','sunset']){
  const p=S.pickBugsOnMap(seed,tier,time),want=S.bugMapCount(tier);assert.equal(p.length,want,`tier ${tier}: ${want} bugs`);assert(want>=8&&want<=12);
  assert(uniq(p.map(b=>b.id)),'no duplicates');assert(p.filter(b=>b.rarity==='legendary').length<=1,'≤ 1 legendary');
  for(const b of p)assert(b.when==='both'||b.when===time,`${b.id} is out at ${time}`);
  for(const band of BANDS)assert(p.filter(b=>b.band===band).length>=2,`seed ${seed}: ≥ 2 in ${band}`);
  p.forEach(b=>seen.add(b.id));if(tier===2&&time==='day')sets.add(p.map(b=>b.id).sort().join());}
 assert.equal(seen.size,20,'every bug turns up on some shift');assert(sets.size>50,`the set rotates (${sets.size} different sets)`);
 same(S.pickBugsOnMap(42,0,'day').map(b=>b.id),S.pickBugsOnMap(42,0,'day').map(b=>b.id));
 same([0,1,2,3,4].map(S.bugMapCount),[12,10,8,8,8]);
 const count=r=>{let n=0;for(let s=0;s<400;s++)n+=S.pickBugsOnMap(s,2,'day').filter(b=>b.rarity===r).length;return n/400/list.filter(b=>b.rarity===r&&b.when!=='sunset').length;};
 assert(count('common')>count('rare'),'rare bugs turn up less often than common ones');
 assert(S.bugRotationSeed(10,0)!==S.bugRotationSeed(10,1)&&S.bugRotationSeed(10,1)!==S.bugRotationSeed(11,1),'a new set each shift');}

function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
console.log('bug-species: 20 bugs, 8 firefly calls, real stories, homes and picker OK');
})().catch(e=>{console.error(e);process.exit(1);});
