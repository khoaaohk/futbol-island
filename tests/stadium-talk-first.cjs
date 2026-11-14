// QA Nov 14 2026 (qa-west): the stadium coaches stand on aisles, where a seat is always nearer than the coach, so the Sit offer
// (and the HUD arbiter's hysteresis) hid "Talk to Coach …" while standing right beside them. Now the Sit offer steps aside within
// TALK_FIRST m of the talkable islander (lib/town/stadiumSit.ts sitYieldsToTalk; Town's HUD candidates). This plays a walk up each
// coach's aisle through the real arbiter (lib/ui/hudStack.ts) and the real seats (stadiumSeats.nearestSeat).
// usage: node tests/stadium-talk-first.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache=new Map();
function load(file){
 const full=path.join(root,file);if(cache.has(full))return cache.get(full);
 const m={exports:{}};cache.set(full,m.exports);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,Math,Number,Set,Map,JSON,Array,Object,Error,Symbol,
  require:id=>{if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id);for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext));}return require(id);}});
 cache.set(full,m.exports);return m.exports;
}
// The two pure lines from stadiumSit.ts (it imports three.js scenery; the rule itself is plain data).
const sitSrc=read('lib/town/stadiumSit.ts');
const TALK_FIRST=Number(/export const TALK_FIRST=([\d.]+);/.exec(sitSrc)?.[1]);
assert.ok(TALK_FIRST>1&&TALK_FIRST<3,'TALK_FIRST is a short reach');
const rule=/export const sitYieldsToTalk=\(seated:boolean,npcDistance:number\|null\)=>(.+);/.exec(sitSrc);assert.ok(rule,'sitYieldsToTalk is exported');
const sitYieldsToTalk=new Function('seated','npcDistance','TALK_FIRST','return '+rule[1]);
const town=read('components/Town.tsx');
assert.match(town,/if\(sitWant&&!sitYieldsToTalk\(stadiumSit\.seated,npc\?Math\.hypot\(npc\.x-location\.x,npc\.z-location\.z\):null\)\)cands\.push/,'Town drops the Sit candidate beside a talkable islander');

const {nearestSeat,STANDS,ROW_DEPTH,rowHeight}=load('lib/town/stadiumSeats.ts');
const {createFocusArbiter}=load('lib/ui/hudStack.ts');
const {STADIUM}=load('lib/town/westParkLayout.ts');
const ctx={ridingTruck:false,flying:false,jobActive:false,inGarden:false};
// The coaches on aisles (stadiumNpcs.ts: Mireille and Nkechi on the east stand's aisles, Gustavo on the south stand's middle one):
// walk up the aisle from the pitch side to 0.9 m short of the coach, as a child does.
const coaches=[{name:'Mireille',stand:'east',x:-157.525,z:-9},{name:'Nkechi',stand:'east',x:-160.125,z:-51},{name:'Gustavo',stand:'south',x:-205,z:31.075}];
for(const c of coaches){
 const s=STANDS.find(x=>x.id===c.stand),arb=createFocusArbiter(),ux=s.axis==='x'?s.out:0,uz=s.axis==='z'?s.out:0;
 const coachD=s.axis==='x'?(c.x-STADIUM.x)*s.out:(c.z-STADIUM.z)*s.out;let shown=null,t=0,sawSit=false;
 for(let d=s.inner-4;d<=coachD-.9+1e-6;d+=.1){t+=50;const x=s.axis==='x'?STADIUM.x+ux*d:c.x,z=s.axis==='z'?STADIUM.z+uz*d:c.z;
  const h=d<s.inner?0:rowHeight(Math.floor((d-s.inner)/ROW_DEPTH));
  const npcD=Math.hypot(c.x-x,c.z-z),cands=[];if(npcD<5.5)cands.push({kind:'talk',key:c.name,distance:npcD});
  const seat=nearestSeat(x,z,h);if(seat&&!sitYieldsToTalk(false,npcD<5.5?npcD:null,TALK_FIRST)){cands.push({kind:'enter',key:'stadium-seat',distance:Math.hypot(seat.x-x,seat.z-z)});}
  shown=arb.choose(cands,ctx,t)?.kind??null;if(shown==='enter')sawSit=true;}
 assert.ok(sawSit,`${c.name}: the aisle offers seats on the way up (the case this guards)`);
 assert.equal(shown,'talk',`${c.name}: Talk shows beside the coach`);
}
// Seated: Stand up always stays (the rule never removes the held seat); far from anyone the Sit offer is untouched.
assert.equal(sitYieldsToTalk(true,.5,TALK_FIRST),false);
assert.equal(sitYieldsToTalk(false,null,TALK_FIRST),false);
assert.equal(sitYieldsToTalk(false,TALK_FIRST+.1,TALK_FIRST),false);
assert.equal(sitYieldsToTalk(false,1,TALK_FIRST),true);
assert.ok(STADIUM.x<0);
console.log('stadium talk-first: ok');
