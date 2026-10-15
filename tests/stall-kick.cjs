// A ball kicked into Rosa's fish stall (user Oct 15 2026: "add animation when kicking the ball against the fish stall"):
// the stall is a reacting prop ('stall'), 0.6 s cooldown, no mesh or material of its own, reduced motion = cue only.
// usage: node tests/stall-kick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');

(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}

const R=load('lib/graphics/propReactions.ts'),K=load('lib/town/market/stallKick.ts'),{MARKET_STAND}=load('lib/town/fishing/fishCatalog.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');

// ---- The real town: Rosa's stall is exactly one reacting prop, baked into shared island chunks (no mesh or material of its own).
{
 const scene=new T.Scene(),world=load('lib/town/world.ts').buildTown(scene),stalls=world.propSpecs.filter(s=>s.kind==='stall');
 assert.equal(stalls.length,1,'one stall prop (Rosa only; the other market stalls stay still)');
 const s=stalls[0];assert(MARKET_STAND.x>=s.min.x&&MARKET_STAND.x<=s.max.x&&MARKET_STAND.z>=s.min.z&&MARKET_STAND.z<=s.max.z,'stall bounds hold MARKET_STAND');
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(const p of s.parts){const owner=meshes.find(m=>m.geometry.getAttribute('position')===p.attribute);
  assert(owner&&owner.name.startsWith('island-chunk-'),'stall run lives in a merged island chunk');
  // Every painted piece shares a chunk with the rest of the island; the only stall-only batch is the ROSA'S MARKET sign's own
  // canvas texture, which was there before (one textured plane per sign).
  assert(owner.userData.pieces.kinds.some(k=>k!=='stall')||owner.material.map&&owner.userData.pieces.kinds.length===1,'no new stall-only draw call');}
 // Ball contact points just outside the stall's ball footprint (the obstacle the walking ball bounces off) all find the stall.
 const fp=world.obstacles.find(o=>Math.abs(o.x-230)<.01&&Math.abs(o.z-35)<.01);assert(fp,'stall footprint');
 const r=R.createPropReactions(world.propSpecs),find=(x,z)=>{const i=r.find(x,.2,z);return i>=0&&world.propSpecs[i].kind==='stall';};
 for(const [x,z] of [[fp.x-fp.w/2-.19,fp.z],[fp.x-fp.w/2-.19,fp.z+3],[fp.x,fp.z-fp.d/2-.19],[fp.x,fp.z+fp.d/2-.0+.19-.05],[fp.x+fp.w/2+.19,fp.z]])assert(find(x,z),'ball at '+x.toFixed(2)+','+z.toFixed(2)+' finds the stall');
 // Attach a fishing-world style extra mesh (world space) and check it moves with the stall.
 const extra=new T.BoxGeometry(1,.4,.2).translate(MARKET_STAND.x,4.4,MARKET_STAND.z+4.25),ea=extra.getAttribute('position');
 assert.equal(r.attach('stall',MARKET_STAND.x,MARKET_STAND.z,[{attribute:ea,start:0,count:ea.count}]),true,'attach joins the stall');
 assert.equal(r.attach('stall',0,0,[{attribute:ea,start:0,count:ea.count}]),false,'attach elsewhere is refused');
 const attr=s.parts[0].attribute,before=Float32Array.from(attr.array),extraBefore=Float32Array.from(ea.array);
 const hx=fp.x-fp.w/2-.19,hz=fp.z+1;
 assert.equal(r.hit(hx,.3,hz,1,0),null,'a soft roll does nothing');
 assert.equal(r.hit(hx,.3,hz,22,0),'stall','a shot plays the stall cue');
 assert.equal(r.attach('stall',MARKET_STAND.x,MARKET_STAND.z,[{attribute:ea,start:0,count:ea.count}]),false,'no attach while a reaction runs');
 r.update(.12,false);
 let moved=0;for(let i=0;i<attr.array.length;i++)if(attr.array[i]!==before[i]){moved++;const v=Math.floor(i/3);assert(s.parts.some(p=>p.attribute===attr&&v>=p.start&&v<p.start+p.count),'only the stall moves');}
 assert(moved>0,'the stall wobbles');assert(ea.array.some((v,i)=>v!==extraBefore[i]),'the attached sign wobbles too');
 // Top moves more than the bottom (height-weighted: the counter and post feet stay put).
 let top=0,low=0;for(const p of s.parts)if(p.attribute===attr)for(let v=p.start;v<p.start+p.count;v++){const d=Math.hypot(attr.array[v*3]-before[v*3],attr.array[v*3+2]-before[v*3+2]),y=before[v*3+1];if(y>3.3)top=Math.max(top,d);else if(y<.6)low=Math.max(low,d);}
 assert(top>.03&&top>low*4,'awning sways ('+top.toFixed(3)+' m), feet stay ('+low.toFixed(3)+' m)');
 // Cooldown 0.6 s: a second hit inside it is silent, after it plays again.
 assert.equal(R.PROP_REACTIONS.stall.cooldown,.6);
 assert.equal(r.hit(hx,.3,hz,22,0),null,'cooling down');
 for(let t=0;t<.5;t+=1/60)r.update(1/60,false);assert.equal(r.hit(hx,.3,hz,22,0),'stall','after 0.6 s it reacts again');
 // ~1 s and the buffers are back bit for bit, then idle.
 for(let i=0;i<90;i++)r.update(1/60,false);
 assert.deepEqual(Float32Array.from(attr.array),before,'stall restored exactly');assert.deepEqual(Float32Array.from(ea.array),extraBefore,'sign restored exactly');assert.equal(r.active,false);
 assert(R.PROP_REACTIONS.stall.duration<=1.05&&R.PROP_REACTIONS.stall.duration>=.9,'about one second');
 // Reduced motion: the cue only, nothing moves.
 for(let i=0;i<60;i++)r.update(1/60,false);
 const started=r.stats.started;assert.equal(r.hit(hx,.3,hz,22,0,true),'stall','reduced motion still plays the cue');r.update(.1,true);
 assert.equal(r.stats.started,started,'reduced motion starts no wobble');assert.deepEqual(Float32Array.from(attr.array),before,'reduced motion: no vertex moved');
 world.dispose();
 console.log('PASS Rosa\'s stall: one baked prop in shared chunks, wobble top-weighted, attach, 0.6 s cooldown, exact restore, reduced = cue only');
}

// ---- Wiring: the cue is synthesized, Town calls the splash and note only for the stall, and the splash skips reduced motion.
{
 const sound=read('lib/audio/islandSound.ts'),town=read('components/Town.tsx'),market=read('lib/town/farmersMarket.ts');
 assert(/case 'stall':tone\(/.test(sound),'stall cue synthesized in the job-cue channel');
 assert(/prop\('stall',stall\)/.test(market),'farmersMarket tags Rosa\'s stall');
 assert(/if\(propHit==='stall'\)\{if\(!reduced\)ballEffects\.splash/.test(town),'splash only on a stall hit, never in reduced motion');
 assert(/propReactions\.attach\('stall',MARKET_STAND\.x,MARKET_STAND\.z/.test(town),'fishing sign + crate attached');
 // The stall's new fish use colours already in the island palette (no new paint batch).
 const fishColors=[...market.matchAll(/'(#[0-9a-f]{6})'/g)].map(m=>m[1]).filter(c=>['#87b1ad','#678f8d','#536b65','#384443'].includes(c));
 const worldSrc=read('lib/town/world.ts');for(const c of new Set(fishColors))assert(worldSrc.includes("'"+c+"'"),c+' already in world palette');
}

// ---- The one-line note: the shooting lesson once per device, then a Rosa line at most every ROSA_LINE_GAP_S.
{
 let seen=false;const ports={seen:()=>seen,mark:()=>{seen=true;}},st={last:-Infinity,n:0};
 const a=K.stallKickNote(10,st,ports);assert.equal(a.text,K.STALL_KICK_LESSON);assert.equal(a.tip,true);
 assert.equal(K.stallKickNote(11,st,ports),null,'no chatter right after the lesson');
 const b=K.stallKickNote(10+K.ROSA_LINE_GAP_S,st,ports);assert(b&&!b.tip&&b.text.startsWith('Rosa:'));
 assert.equal(K.stallKickNote(10+K.ROSA_LINE_GAP_S+1,st,ports),null);
 const st2={last:-Infinity,n:0};assert.notEqual(K.stallKickNote(0,st2,ports).text,K.STALL_KICK_LESSON,'lesson never twice on a device');
 assert(/corner/i.test(K.STALL_KICK_LESSON),'lesson is about picking a spot');
 console.log('PASS stall note: lesson once per device, Rosa line rate-limited');
}
})().catch(e=>{console.error(e);process.exit(1);});
