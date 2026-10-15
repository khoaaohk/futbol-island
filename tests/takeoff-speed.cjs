// Jetpack take-off speed everywhere (Oct 14 2026, user: "taking off on the mountain is slower. it should be the same speed as
// other parts of the island"). Town's take-off is replayed with the real modules (the ground from rooftopTravel, the take-off curve
// from jetpackActions, Summit Isle's cruise height and terrain lift) on a fixed 60 Hz tick drawn at 30 and 60 fps, from a standing
// start on the main island, Coral Cay and Summit Isle (the sandbar landing, the slopes, the summit plateau, the zipline tower).
// Measured relative to the ground under the player, against the height the flight then holds there ("cruise"):
//  - the time to half and to 90% of the climb is within ±10% of the main island's (it was ~3 s on the plateau, ~0.4 s at sea level);
//  - the climb follows the main island's curve (normalised by the climb), so no pop off the ground and no crawl afterwards;
//  - never under the ground, the lift's hard floor never needed, and no settling bump after the take-off;
//  - the same horizontal speed once airborne.
// The old take-off (eased to the 28 m cruise height whatever the ground) is measured too, so the metric is proven to see it.
// usage: node tests/takeoff-speed.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
const load=createLoader({three:require('three')});
const S=load('lib/town/summitIsle.ts'),J=load('lib/town/jetpackActions.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts'),{stepPlayer}=load('lib/town/simulation.ts'),{ZIP_TOWER}=load('lib/town/zipline.ts');
const L=S.SUMMIT_LANDMARKS,CRUISE=28,TICK=1/60;
const SPOTS={'main island':{x:103,z:-8},'main island (west)':{x:-50,z:100},'Coral Cay':{x:640,z:-120},'sandbar landing':L.sandbarLanding,
 'north slope':S.heightPoint(-Math.PI/2,25),'south slope':S.heightPoint(Math.PI/2,30),'summit plateau':L.pitch,'lookout':L.lookout,'zipline tower':{x:ZIP_TOWER.x+3,z:ZIP_TOWER.z}};

// Town's jetpack tick while taking off and hovering (no stick): liftJetpack, then the Summit lift on top.
function takeoff(spot,fps,{old=false,seconds=6}={}){
 const loc={...spot},roof=createRooftopTravel([],[],loc);roof.reset(loc.x,loc.z);const ground=roof.state.height,lift=S.createSummitFlightLift();
 const flight={height:ground,start:ground,time:0},ticks=[],frames=[];let acc=0,t=0;
 for(let f=0;f<fps*seconds;f++){acc+=1/fps;
  while(acc>=TICK-1e-9){acc-=TICK;t+=TICK;
   const top=old?CRUISE:flight.time<J.JETPACK_TAKEOFF_TIME?S.summitCruiseHeight(loc.x,loc.z,CRUISE):CRUISE;
   flight.time=Math.min(J.JETPACK_TAKEOFF_TIME,flight.time+TICK);flight.height=J.jetpackTakeoffHeight(flight.start,top,flight.time);
   flight.height+=old?lift.update(loc.x,loc.z,0,0,flight.height,TICK):lift.update(loc.x,loc.z,0,0,flight.height,TICK,CRUISE);
   ticks.push({t,c:flight.height-ground,g:S.summitGround(loc.x,loc.z)-ground,h:flight.height});}
  frames.push({t,c:flight.height-ground});}
 const cruise=ticks[ticks.length-1].c,when=k=>ticks.find(s=>s.c>=k*cruise)?.t??Infinity;
 return {ground,cruise,t50:when(.5),t90:when(.9),ticks,frames,floorHits:lift.floorHits};}

const results={};
for(const fps of [30,60]){const main=takeoff(SPOTS['main island'],fps);results[fps]={};
 for(const [name,spot] of Object.entries(SPOTS)){const r=takeoff(spot,fps);results[fps][name]=r;
  for(const k of ['t50','t90'])assert(Math.abs(r[k]-main[k])<=.1*main[k]+1e-9,`${name} @${fps} fps: ${k} ${r[k].toFixed(2)} s vs the main island's ${main[k].toFixed(2)} s (±10%)`);
  assert(r.cruise>=7,`${name}: cruises over the ground (${r.cruise.toFixed(1)} m)`);
  // The same curve as the main island, normalised by the climb: no pop off the ground, no crawl, no late bump.
  let worst=0;for(let i=0;i<r.ticks.length;i++)worst=Math.max(worst,Math.abs(r.ticks[i].c/r.cruise-main.ticks[i].c/main.cruise));
  assert(worst<.12,`${name} @${fps} fps: climbs on the main island's curve (worst ${(worst*100).toFixed(1)}% of the climb apart)`);
  let step=0,stepMain=0;for(let i=1;i<r.ticks.length;i++){step=Math.max(step,(r.ticks[i].c-r.ticks[i-1].c)/r.cruise);stepMain=Math.max(stepMain,(main.ticks[i].c-main.ticks[i-1].c)/main.cruise);}
  assert(step<=stepMain*1.2,`${name}: no pop off the ground (largest tick ${(step*100).toFixed(1)}% of the climb, main ${(stepMain*100).toFixed(1)}%)`);
  const after=r.ticks.filter(s=>s.t>J.JETPACK_TAKEOFF_TIME),hi=Math.max(...after.map(s=>s.c));
  assert(hi<=r.cruise*1.06+.3,`${name}: no settling bump after the take-off (${hi.toFixed(1)} m, cruise ${r.cruise.toFixed(1)} m)`);
  assert(r.ticks.every(s=>s.c>=-1e-9&&s.c>=s.g-1e-9),`${name}: never under the ground`);
  assert.equal(r.floorHits,0,`${name}: the lift's hard floor is never needed`);}}

// The metric sees the old take-off (eased to 28 m whatever the ground): on the plateau it took several times as long.
{const main=takeoff(SPOTS['main island'],60,{old:true}),plateau=takeoff(SPOTS['summit plateau'],60,{old:true});
 assert(plateau.t90>main.t90*2,`old take-off: plateau ${plateau.t90.toFixed(2)} s vs main ${main.t90.toFixed(2)} s`);results.old={main,plateau};}

// The same horizontal speed once airborne: one second of full stick after the take-off, from every spot.
{const speeds=Object.entries(SPOTS).map(([name,spot])=>{const p={...spot},v={x:0,z:0},dx=300-p.x,dz=0-p.z,d=Math.hypot(dx,dz);for(let i=0;i<60;i++)stepPlayer(p,v,{x:dx/d,z:dz/d,sprint:false},TICK,[],'jetpack');return [name,Math.hypot(v.x,v.z)];});
 const ref=speeds[0][1];for(const [name,s] of speeds)assert(Math.abs(s-ref)<.01*ref,`${name}: ${s.toFixed(2)} m/s, as on the main island (${ref.toFixed(2)})`);}

// Wiring: Town takes off with the shared curve to the spot's cruise height and gives the lift its cruise height.
{const town=fs.readFileSync('components/Town.tsx','utf8');
 assert(/summitCruiseHeight\(location\.x,location\.z,flight\.cruiseHeight\)/.test(town)&&/jetpackTakeoffHeight\(flight\.startHeight,top,flight\.takeoffTime,reduced\)/.test(town),'Town takes off to summitCruiseHeight on jetpackTakeoffHeight');
 assert.equal((town.match(/summitFlight\.update\([^;]*,flight\.cruiseHeight\)/g)||[]).length,2,'both lift calls pass the cruise height');}

const row=(fps,name)=>{const r=results[fps][name];return `${name} ${r.t90.toFixed(2)}s/${r.cruise.toFixed(0)}m`;};
console.log(`PASS take-off speed: time to 90% of cruise (over the ground) @60 fps — ${Object.keys(SPOTS).map(n=>row(60,n)).join(', ')}; 30 fps within ±10% too; old plateau take-off ${results.old.plateau.t90.toFixed(2)} s vs ${results.old.main.t90.toFixed(2)} s; same curve, no pop, never under the ground, same horizontal speed`);
