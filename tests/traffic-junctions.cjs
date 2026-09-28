// Junction/corner jam regression: long simulated runs on the real island roads and a dense 3x3-node grid.
// Asserts that no two vehicle bodies (real 1.9x3.6 car / 2.1x4.5 pickup footprints) interpenetrate and that every
// car keeps moving: no stop longer than 20 s unless a walking visitor is standing in its lane.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
function fixture(roads){const modules=new Map(),ctx=new Proxy({measureText:t=>({width:t.length*20}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});function load(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);const m={exports:{}};modules.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,document:{createElement:()=>({getContext:()=>ctx})},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
 return {traffic:load('lib/graphics/streetTraffic.ts').createStreetTraffic(new T.Scene(),[],roads),overlap:load('lib/town/trafficSeparation.ts').vehicleOverlap};}
// Authored island streets (world.roads, Sep 28 2026): 25 nodes incl. nine 2-link corners.
const island=[{x:-16,z:-47,w:12,d:224,vertical:true},{x:48,z:-47,w:12,d:224,vertical:true},{x:21.5,z:65,w:133,d:12,vertical:false},{x:16,z:-118,w:64,d:12,vertical:false},{x:-45,z:-47,w:12,d:224,vertical:true},{x:1.5,z:-37.5,w:93,d:12,vertical:false},{x:124,z:-85.5,w:12,d:147,vertical:true},{x:196,z:-110,w:12,d:98,vertical:true},{x:75.5,z:-159,w:241,d:12,vertical:false},{x:160,z:-61,w:72,d:12,vertical:false},{x:88,z:76.5,w:12,d:177,vertical:true},{x:182,z:99.5,w:12,d:131,vertical:true},{x:135,z:34,w:94,d:12,vertical:false},{x:135,z:165,w:94,d:12,vertical:false},{x:86,z:-80,w:76,d:12,vertical:false},{x:86,z:-12,w:76,d:12,vertical:false}];
// Nine vehicles on a 3x3-node grid (four corners, four T-junctions, one crossroads, 34-40 m blocks): queues reach back through every box.
const dense=[{x:48,z:-46,w:12,d:68,vertical:true},{x:88,z:-46,w:12,d:68,vertical:true},{x:124,z:-46,w:12,d:68,vertical:true},{x:86,z:-80,w:76,d:12,vertical:false},{x:86,z:-46,w:76,d:12,vertical:false},{x:86,z:-12,w:76,d:12,vertical:false}];
function run(name,roads,minutes,playerAt,setup){
 const {traffic:a,overlap}=fixture(roads),N=a.cars.length,idle=Array(N).fill(0),longest=Array(N).fill(0),travel=Array(N).fill(0),prev=a.cars.map(c=>c.group.position.clone());
 const body=c=>({x:c.group.position.x,z:c.group.position.z,yaw:c.group.rotation.y,width:(c.pickup?2.1:1.9)-.2,length:(c.pickup?4.5:3.6)-.2});// vehicleOverlap pads .1 per side
 const player={x:900,y:40,z:900},interaction={vx:0,vz:0,reduced:true,onCrash(){}};setup?.(a,player,interaction);let worst=0;
 for(let tick=0;tick<minutes*3600;tick++){const visitor=playerAt?.(tick,player,a);a.update(1/60,player,interaction);
  for(let i=0;i<N;i++){const c=a.cars[i],d=c.group.position.distanceTo(prev[i]);prev[i].copy(c.group.position);travel[i]+=d;idle[i]=d<1e-6&&!(visitor&&c.group.userData.waiting&&Math.hypot(player.x-c.group.position.x,player.z-c.group.position.z)<12)?idle[i]+1/60:0;longest[i]=Math.max(longest[i],idle[i]);
   for(let j=i+1;j<N;j++){const depth=overlap(body(c),body(a.cars[j]));if(depth>worst)worst=depth;assert(depth<.02,`${name}: vehicles ${i} and ${j} interpenetrate by ${depth.toFixed(3)} m at ${(tick/60).toFixed(1)} s`);}}
 }
 console.log(name,JSON.stringify({longestStop:longest.map(v=>+v.toFixed(1)),minTravel:Math.round(Math.min(...travel)),worstOverlap:+worst.toFixed(3)}));
 assert(longest.every(t=>t<20),`${name}: a vehicle stopped ${Math.max(...longest).toFixed(1)} s (junction deadlock)`);assert(travel.every(d=>d>minutes*60),`${name}: every vehicle keeps making progress`);a.dispose();
}
run('island 30 min',island,30);
run('island jetpack overhead',island,10,(tick,p,a)=>{const n=a.nodes[Math.floor(tick/1800)%a.nodes.length];p.x=n.x+3;p.z=n.z+3;p.y=10;});
run('island visitor at corners',island,10,(tick,p,a)=>{const n=a.nodes[Math.floor(tick/600)%a.nodes.length];p.x=n.x+4;p.z=n.z+4;p.y=0;return true;});
run('dense grid 20 min',dense,20);
// Two guarded nodes 8.5 m apart share one box owner (x=48: z=-46 and z=-37.5), so neither box can hold the other hostage.
run('short link between junctions',[...island,{x:86,z:-46,w:76,d:12,vertical:false}],15);
// A player parks a pickup across a junction box and hops out: it must rejoin without anyone waiting inside the box.
run('pickup parked in junction',island,8,(tick,p,a)=>{if(tick===600)a.rider.index=-1;},(a,p,interaction)=>{const truck=a.cars[7],node=a.nodes.find(n=>n.links.length>2&&a.cars.every(c=>c===truck||Math.hypot(n.x-c.group.position.x,n.z-c.group.position.z)>12));a.touchdown(7);a.update(1/60,p,{...interaction,drive:{x:0,z:0}});truck.group.position.set(node.x+1,0,node.z-1);truck.group.rotation.y=.7;truck.freeDriven=true;});
console.log('PASS junction traffic: no interpenetration, no corner/junction deadlock, parked pickup rejoins');
