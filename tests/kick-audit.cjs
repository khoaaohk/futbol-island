// Kick audit (Nov 13 2026, owner: "audit the island and add animations for when kicking objects ... when kicking the gashapon
// machine, it should shake"; docs/kick-reactions-audit.md). 1) Every audited prop kind marked "react" has PropSpecs in the real
// town. 2) Each NEW reaction (gashapon machines, the stadium's lamp posts / bollards / uplights, goals and corner flags, the shuttle
// shelter, the pier shades, the fence lifebuoys, the school bike rack, the LILY POND sign) starts on a simulated ball hit, moves
// only its own vertices, and settles back to rest bit for bit; the reduced-motion version is gentler. 3) The Kick press
// (lib/town/propKick.ts) goes to a lamp / gashapon in reach ahead and strikes it once. 4) Colliders added where a ball passed
// through (stadium corner flags). usage: node tests/kick-audit.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');

(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const R=load('lib/graphics/propReactions.ts'),K=load('lib/town/propKick.ts'),{STADIUM,POND_SIGN}=load('lib/town/westParkLayout.ts');

// The audit table's "react" rows (docs/kick-reactions-audit.md): kind → the PropSpec kind it uses and a floor on the count.
const AUDIT={
 'street lamps (town, cay, pier, stadium)':['lamp',150],'traffic signals':['signal',30],'sign posts and district signs':['sign',20],
 'practice / pier poles and shades':['pole',5],'plaza and corner flags':['flag',24],'benches':['bench',40],'picnic and cafe tables':['table',20],
 'trees':['tree',100],'palms':['palm',100],'bushes':['bush',10],'planters and flower beds':['planter',30],'fences, rails and bike racks':['fence',6],
 'small nets':['net',3],'stadium goals':['goal',2],'bollards and uplights':['bollard',40],'lifebuoy stands and rings':['lifebuoy',6],
 'crates':['crate',4],'bikes':['bike',2],'lifeguard chairs and the shuttle shelter':['post',3],'the fish stall':['stall',1],'gashapon machines':['gashapon',12],
};
const world=load('lib/town/world.ts').buildTown(new T.Scene()),specs=world.propSpecs,kinds={};
for(const s of specs)kinds[s.kind]=(kinds[s.kind]??0)+1;
for(const [name,[kind,n]] of Object.entries(AUDIT)){assert(R.PROP_REACTIONS[kind],name+': a PROP_REACTIONS row');assert((kinds[kind]??0)>=n,name+': '+(kinds[kind]??0)+' '+kind+' specs < '+n);}
console.log('PASS audit: every "react" kind has PropSpecs '+JSON.stringify(kinds));

// ---- 2. The new reactions on the real town's buffers.
const cx=s=>(s.min.x+s.max.x)/2,cz=s=>(s.min.z+s.max.z)/2,near=(s,x,z,d=1)=>Math.abs(cx(s)-x)<d&&Math.abs(cz(s)-z)<d;
const inStadium=s=>Math.abs(cx(s)-STADIUM.x)<STADIUM.bowlW/2+40&&Math.abs(cz(s)-STADIUM.z)<STADIUM.bowlL/2+40;
const posts=world.stadiumLights.posts;
const NEW={
 gashapon:specs.filter(s=>s.kind==='gashapon'),
 'stadium lamp':specs.filter(s=>s.kind==='lamp'&&posts.some(p=>near(s,p.x,p.z,.3))),
 'stadium bollard / uplight':specs.filter(s=>s.kind==='bollard'&&inStadium(s)),
 'stadium goal':specs.filter(s=>s.kind==='goal'),
 'stadium corner flag':specs.filter(s=>s.kind==='flag'&&inStadium(s)&&s.max.y-s.min.y<1.7),
 'shuttle shelter':specs.filter(s=>s.kind==='post'&&near(s,72,-27,1.5)),
 'pier shade':specs.filter(s=>s.kind==='pole'&&(near(s,100,196)||near(s,200,196))),
 'fence lifebuoy':specs.filter(s=>s.kind==='lifebuoy'&&Math.abs(cz(s)-214.48)<.6),
 'bike rack':specs.filter(s=>s.kind==='fence'&&near(s,325.25-230,51+80,4)/* the school block is shifted (world.ts shift(schoolStart,-230,80)) */),
 'LILY POND sign':specs.filter(s=>s.kind==='sign'&&near(s,POND_SIGN.x,POND_SIGN.z,2)),
};
const floors={gashapon:12,'stadium lamp':10,'stadium bollard / uplight':20,'stadium goal':2,'stadium corner flag':4,'shuttle shelter':1,'pier shade':2,'fence lifebuoy':2,'bike rack':1,'LILY POND sign':1};
for(const [name,list] of Object.entries(NEW))assert(list.length>=floors[name],name+': '+list.length+' < '+floors[name]);
assert(NEW['stadium goal'].every(s=>s.parts.length>=2&&s.parts.some(p=>p.gain===.12)),'each stadium goal = its frame (shivers) + its net run (billows)');
assert(NEW['stadium lamp'].filter(s=>s.light).length>=NEW['stadium lamp'].length*.9,'stadium lamps flicker their own night pool');
// Runs lie inside their own bounds (merge offsets right) and every new prop can animate.
for(const list of Object.values(NEW))for(const s of list){const n=s.parts.reduce((a,p)=>a+p.count,0);assert(n>0&&n<=R.MAX_PROP_VERTICES,s.kind+' vertices '+n);
 for(const p of s.parts)for(let v=p.start;v<p.start+p.count;v+=7){const x=p.attribute.getX(v),z=p.attribute.getZ(v);assert(x>=s.min.x-1e-3&&x<=s.max.x+1e-3&&z>=s.min.z-1e-3&&z<=s.max.z+1e-3,s.kind+' run outside its bounds');}}

const r=R.createPropReactions(specs);
const snap=s=>s.parts.map(p=>Float32Array.from(p.attribute.array.subarray(p.start*3,(p.start+p.count)*3)));
const maxMove=(s,b)=>{let d=0;s.parts.forEach((p,k)=>{const a=p.attribute.array,o=p.start*3;for(let i=0;i<b[k].length;i+=3)d=Math.max(d,Math.hypot(a[o+i]-b[k][i],a[o+i+1]-b[k][i+1],a[o+i+2]-b[k][i+2]));});return d;};
const same=(s,b)=>s.parts.every((p,k)=>{const a=p.attribute.array,o=p.start*3;for(let i=0;i<b[k].length;i++)if(a[o+i]!==b[k][i])return false;return true;});
const settle=()=>{for(let i=0;i<90;i++)r.update(1/60,false);r.update(5,false);};
const hitPoint=s=>({x:cx(s),y:s.min.y+Math.min(1,(s.max.y-s.min.y)/2),z:cz(s)});
const report=[];
for(const [name,list] of Object.entries(NEW)){const s=list[0],q=hitPoint(s),before=snap(s);
 // A buffer shared with an untouched neighbour: snapshot the whole attribute to prove nothing else moves.
 const whole=s.parts.map(p=>Float32Array.from(p.attribute.array));
 const cue=r.hit(q.x,q.y,q.z,0,-24,false);assert(cue,name+': the ball hit finds the prop and plays a cue');
 let peak=0;for(let i=0;i<12;i++){r.update(1/60,false);peak=Math.max(peak,maxMove(s,before));}
 assert(peak>.004,name+': visibly moves ('+peak.toFixed(3)+' m)');assert(peak<.6,name+': never wild ('+peak.toFixed(3)+' m)');
 s.parts.forEach((p,k)=>{const a=p.attribute.array;for(let i=0;i<a.length;i++){const v=Math.floor(i/3);if(v>=p.start&&v<p.start+p.count)continue;
  if(a[i]!==whole[k][i]&&!specs.some(o=>o!==s&&o.parts.some(op=>op.attribute===p.attribute&&v>=op.start&&v<op.start+op.count)))assert.fail(name+': a vertex outside every prop moved');}});
 settle();assert.equal(r.active,false,name+': asleep again');assert(same(s,before),name+': back to rest bit for bit');
 // Reduced motion: the gentle version, smaller, and it also settles exactly.
 const cue2=r.hit(q.x,q.y,q.z,0,-24,true);assert.equal(cue2,cue,name+': same cue in reduced motion');
 let gentle=0;for(let i=0;i<12;i++){r.update(1/60,true);gentle=Math.max(gentle,maxMove(s,before));}
 assert(gentle<peak*(R.REDUCED_GAIN+.1)+1e-6,name+': reduced motion is gentler ('+gentle.toFixed(3)+' vs '+peak.toFixed(3)+')');
 for(let i=0;i<90;i++)r.update(1/60,true);r.update(5,true);assert(same(s,before),name+': reduced version settles exactly');
 report.push(name+' x'+list.length+' '+cue+' '+peak.toFixed(2)+'m '+Math.max(...list.map(o=>o.parts.reduce((a,p)=>a+p.count,0)))+'v');}
console.log('PASS new reactions start on a ball hit, move only their own runs, settle bit for bit; gentle in reduced motion: '+report.join(', '));

// The gashapon: the globe on top shakes more than the cabinet foot; settle() ends a shake before the open machine's swap.
{const s=NEW.gashapon[0],q=hitPoint(s),before=snap(s),h=s.max.y-s.min.y;r.hit(q.x,q.y,q.z,24,0,false);for(let i=0;i<6;i++)r.update(1/60,false);
 let low=0,high=0;s.parts.forEach((p,k)=>{const a=p.attribute.array,o=p.start*3;for(let i=0;i<before[k].length;i+=3){const d=Math.hypot(a[o+i]-before[k][i],a[o+i+2]-before[k][i+2]),y=(before[k][i+1]-s.min.y)/h;if(y<.15)low=Math.max(low,d);if(y>.7)high=Math.max(high,d);}});
 assert(high>low*1.5,'the globe shakes more than the foot ('+high.toFixed(3)+' vs '+low.toFixed(3)+')');
 assert.equal(R.PROP_REACTIONS.gashapon.cue,'rattle','capsule rattle cue');assert(R.PROP_REACTIONS.gashapon.rustle>0,'the capsules jiggle');
 r.settle();assert.equal(r.active,false);assert(same(s,before),'settle restores at once');}
// Idle: no reaction running = one counter check, nothing uploaded.
{const u=r.stats.activeUpdates,w=r.stats.vertexWrites;r.update(5,false);for(let i=0;i<200;i++)r.update(1/60,false);assert.equal(r.stats.activeUpdates,u);assert.equal(r.stats.vertexWrites,w);}
console.log('PASS gashapon: globe shakes over a planted foot, capsules jiggle, rattle cue, settle() before the swap; idle = no work');

// ---- 3. The Kick press: a lamp or a gashapon in reach ahead takes it, one strike at contact; others stay the usual shot.
{const targets=K.propKickTargets(r.specs()),tk={};for(const t of targets)tk[t.kind]=(tk[t.kind]??0)+1;
 assert((tk.lamp??0)>=150&&(tk.gashapon??0)>=12&&(tk.bollard??0)>=40,'Kick targets '+JSON.stringify(tk));
 assert(!targets.some(t=>['sign','bench','fence','table','tree','palm','flag','goal','net','stall'].includes(t.kind)),'wide/low props and the tree/flag kicks keep their own paths');
 const g=targets.find(t=>t.kind==='gashapon');const yawTo=(x,z,t)=>Math.atan2(t.x-x,t.z-z);
 const log=[];let press=null;const kick=K.createPropKick({targets,pressed:()=>press,take:()=>{log.push('take');press=null;},pose:(_p,how)=>log.push(['pose',how.lead]),strike:(t,vx,vz)=>log.push(['strike',t,vx,vz,r.hit(t.x,t.y,t.z,vx,vz,false)])});
 const at={x:g.x+g.r+1,z:g.z},inp=o=>({dt:1/60,x:at.x,z:at.z,yaw:yawTo(at.x,at.z,g),onFoot:true,canEnter:true,reduced:false,...o});
 for(let i=0;i<30;i++)kick.update(inp());assert.equal(kick.stats.searches,0,'no press: no search');
 press={};kick.update(inp({yaw:yawTo(at.x,at.z,g)+Math.PI}));assert.equal(log.length,0,'facing away: the press stays a shot');press=null;kick.update(inp());
 r.update(5,false);press={};kick.update(inp());assert.equal(log[0],'take','the press is taken');assert.equal(log[1][0],'pose');
 press={};kick.update(inp());assert.equal(log.filter(e=>e==='take').length,1,'a press mid-kick is not taken');press=null;
 for(let i=0;i<120;i++){kick.update(inp());r.update(1/60,false);}
 const strikes=log.filter(e=>e[0]==='strike');assert.equal(strikes.length,1,'one strike');assert.equal(strikes[0][1],g);assert.equal(strikes[0][4],'rattle','the gashapon shakes with its rattle');
 assert(strikes[0][2]<-10,'kicked along the boot ('+strikes[0][2].toFixed(1)+')');
 press={};kick.update(inp());assert.equal(log.filter(e=>e==='take').length,2,'ready again after the kick and its cooldown');for(let i=0;i<120;i++)kick.update(inp());
 r.update(5,false);for(let i=0;i<60;i++)r.update(1/60,false);assert.equal(r.active,false);
 const lamp=targets.find(t=>t.kind==='lamp'),st=K.propKickStance(lamp,0);assert(Math.hypot(st.root.x-lamp.x,st.root.z-lamp.z)>lamp.r+.3,'the stance is clear of the post');
 console.log('PASS Kick press: '+targets.length+' targets '+JSON.stringify(tk)+'; facing away = shot; one strike, rattle; stance clear');}

// ---- 4. Colliders: the stadium corner flags now stop a ball (thin, so walking past is unchanged).
{for(const s of NEW['stadium corner flag']){const o=world.obstacles.find(o=>Math.abs(o.x-cx(s))<.15&&Math.abs(o.z-cz(s))<.25&&o.w<=.15);assert(o,'corner flag collider at '+cx(s).toFixed(1)+','+cz(s).toFixed(1));}
 console.log('PASS corner flags have thin colliders');}
world.dispose();
})().catch(e=>{console.error(e);process.exit(1);});
