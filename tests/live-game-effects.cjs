const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm'),T=require('three'),cache=new Map();
const document={createElement(){return {width:0,height:0,getContext(){return {save(){},restore(){},translate(){},scale(){},clearRect(){},fillRect(){},fillText(){},createRadialGradient(){return {addColorStop(){}};},beginPath(){},moveTo(){},lineTo(){},stroke(){}};}};}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,document,Math,require:id=>id==='three'?T:load(path.resolve(path.dirname(file),id+'.ts'))});return mod.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts'),{createMatchEffects}=load('lib/town/matchEffects.ts'),{VENUES}=load('lib/town/venues.ts');
const camera=new T.PerspectiveCamera(),ballAt=new T.Vector3();
for(const [i,venue]of VENUES.entries()){const sim=new MatchSim(270+i*41,venue.id),root=new T.Group(),effects=createMatchEffects(root,venue);let maximum=0,goalSeen=false;for(let tick=0;tick<900*30&&(tick<240*30||!goalSeen);tick++){sim.step(1/30);effects.update(sim,1/30,true,false);ballAt.set(sim.ball.x,.3+sim.ball.height,sim.ball.y);effects.trail(ballAt,camera,false);maximum=Math.max(maximum,effects.stats.trailVertices);if(effects.stats.trailVertices){const line=effects.root.getObjectByName('ball-flight-trail').children.find(o=>o.isLine);const head=new T.Vector3().fromBufferAttribute(line.geometry.attributes.position,0);assert(head.distanceTo(ballAt)<1e-4,venue.id+' trail head is attached to the rendered ball');}if(effects.root.getObjectByName('goal-celebration').visible)goalSeen=true;for(const p of Object.values(sim.players))assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}assert(sim.stats.passes>0&&sim.stats.shots>0,venue.id+' actual passes and shots');assert(maximum>0,venue.id+' visible flight ribbons');assert(goalSeen,venue.id+' score-driven goal celebration');const score=sim.score.gold+sim.score.blue;assert.equal(effects.stats.goals,score);effects.update(sim,1/30,false,false);assert.equal(effects.root.visible,false);effects.dispose();console.log('LIVE_EFFECTS_PASS',venue.id,{passes:sim.stats.passes,shots:sim.stats.shots,goals:score,maximumTrailVertices:maximum});}
// Frame impacts stay at the recorded surface contact, fire once, and sleep after fading.
for(const venue of VENUES){
 const sim=new MatchSim(47,venue.id),effects=createMatchEffects(new T.Group(),venue),burst=effects.root.getObjectByName('goal-frame-impacts');
 const draw=(dt=.016,enabled=true,reduced=false)=>{effects.update(sim,dt,enabled,reduced);effects.trail(ballAt,camera,reduced);};
 for(const part of ['post','crossbar']){
  Object.assign(sim.frameContact,{serial:sim.frameContact.serial+1,part,x:venue.x+venue.goalWidth/2,y:(venue.elevation??0)+1.2,z:venue.z+venue.length/2});draw();
  const b=burst.children.find(g=>g.visible);assert(b,part+' burst appears');assert(Math.abs(b.position.y-1.2)<1e-9,'rooftop elevation removed exactly once');
  const anchor=b.position.clone();sim.ball.x+=15;draw();assert(b.position.equals(anchor),'impact stays on frame');
  const opacity=b.children[0].material.opacity;draw(0);assert.equal(b.children[0].material.opacity,opacity,'paused burst freezes');
  for(let i=0;i<30;i++)draw();assert(burst.children.every(g=>!g.visible),'burst expires without retriggering');
 }
 sim.frameContact.serial++;draw(.016,true,true);const quiet=burst.children.find(g=>g.visible);assert(quiet&&!quiet.children[1].visible,'reduced motion hides sparks');
 sim.frameContact.serial++;draw(.016,false);draw();assert(burst.children.every(g=>!g.visible),'hidden collision never replays');
 assert.equal(burst.children.length,2,'fixed burst pool');effects.dispose();
}
console.log('FRAME_IMPACT_PASS post/bar, anchored position, rooftop, pause, expiry, reduced motion and hidden lifecycle');
