// Jetpack edge sliding (Sep 29 2026 QA bug 1): pushing mostly along a curved Coral Cay flight edge used to move 0 m
// because stepPlayer resolved collision one axis at a time. Along-edge input must now slide several metres, outward
// input must stay blocked, nothing may end outside the flight zone, and the main island's straight edge still slides.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const {stepPlayer,flightBlocked,flightEdgeNormal}=load('lib/town/simulation.ts');

/** The last flyable point walking from (x,z) along (dx,dz): a spot touching the edge. */
function edgeFrom(x,z,dx,dz){assert(!flightBlocked(x,z),`start ${x},${z} is flyable`);let t=0;while(!flightBlocked(x+dx*(t+.05),z+dz*(t+.05)))t+=.05;return {x:x+dx*t,z:z+dz*t};}
function fly(p,input,seconds){const v={x:0,z:0},start={...p};for(let i=0;i<Math.round(seconds*60);i++){stepPlayer(p,v,{...input,sprint:false},1/60,[],'jetpack');assert(!flightBlocked(p.x,p.z),`never outside the flight zone (${p.x.toFixed(2)},${p.z.toFixed(2)})`);}return Math.hypot(p.x-start.x,p.z-start.z);}
const rot=(v,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return {x:v.x*c-v.z*s,z:v.x*s+v.z*c};};

// The QA spots: the corridor's north edge near (430,-207) and the cay's east edge near (780,-160), plus the corridor funnel.
for(const [label,x,z,dx,dz] of [['corridor north edge',430,-195,0,-1],['cay east edge',760,-160,1,0],['corridor funnel',341,-270,1,0]]){
 const e=edgeFrom(x,z,dx,dz),n=flightEdgeNormal(e.x,e.z);
 assert(n,`${label}: an edge normal is found at ${e.x.toFixed(1)},${e.z.toFixed(1)}`);
 const tangent={x:-n.z,z:n.x};
 // Mostly along the edge (15° outward), both ways.
 for(const sign of [1,-1]){const t={x:tangent.x*sign,z:tangent.z*sign},push=rot(t,0),outward15={x:push.x*Math.cos(Math.PI/12)+n.x*Math.sin(Math.PI/12),z:push.z*Math.cos(Math.PI/12)+n.z*Math.sin(Math.PI/12)};
  const moved=fly({...e},outward15,3);assert(moved>=5,`${label}: along-edge input slides (${moved.toFixed(1)} m in 3 s, ${sign>0?'one way':'the other'})`);}
 // Straight out: stays put at the edge.
 const out=fly({...e},n,3);assert(out<1.5,`${label}: outward input stays blocked (${out.toFixed(2)} m)`);
}

// Main island north edge (QA: the same along-edge input slid 61 m in 3 s before the fix): unchanged or better.
{const e=edgeFrom(0,-270,0,-1),c=Math.cos(Math.PI/12),s=Math.sin(Math.PI/12);
 const moved=fly({...e},{x:c,z:-s},3);assert(moved>=55,`main island north edge still slides (${moved.toFixed(1)} m)`);
 const n=flightEdgeNormal(e.x,e.z),held=fly({...e},n,3);assert(held<1.5,`main island north edge holds outward input (${held.toFixed(2)} m)`);}
// Main island west edge: straight outward input holds, along-edge input slides.
{const e=edgeFrom(-140,0,-1,0);
 const held=fly({...e},{x:-1,z:0},3);assert(held<.01,`west edge holds straight outward input (${held.toFixed(3)} m)`);
 const p={...e},moved=fly(p,{x:-.26,z:-.97},3);assert(moved>=55,`west edge slides (${moved.toFixed(1)} m)`);}
console.log('flight-slide: ok');
