// Nov 27 2026 (owner 164: "when landing, can get stuck in signs like these"): landing on a station board (any station) or the
// Summit riddle board resolves to a free spot within ~1 m, and from there the player can walk away. Run: node tests/station-sign-landing.cjs
const assert=require('node:assert/strict'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
(async()=>{
 const {L,obstacles}=await loadIslandWorld(path.join(__dirname,'..'));const sim=L('lib/town/simulation.ts'),tw=L('lib/town/trainWorld.ts'),si=L('lib/town/summitBalls.ts');
 const F=tw.STATION_SIGN_FEET;assert(F.length>=2*5*8,`every station's two boards have footprints (${F.length/2} cells)`);
 const spots=[];for(let i=0;i<F.length;i+=2)spots.push([F[i],F[i+1]]);
 if(si.RIDDLE_BOARD)spots.push([si.RIDDLE_BOARD.x,si.RIDDLE_BOARD.z]);
 let n=0;for(const [x,z] of spots)for(const r of [.34,.6]){const p={x,z};const inside=obstacles.some(o=>sim.insideObstacle(x,z,o,r));assert(inside,'the board is solid at its cells');
  assert(sim.landingSpot(p,obstacles,r),'moved');assert(Math.hypot(p.x-x,p.z-z)<=.75+r,`within ~1 m (plus the ride's radius) (${Math.hypot(p.x-x,p.z-z).toFixed(2)})`);
  assert(!obstacles.some(o=>sim.insideObstacle(p.x,p.z,o,r)),'free');
  // and it can move away: a clear 0.8 m path in some direction (colliders only)
  let away=false;for(let a=0;a<16&&!away;a++){let ok=true;for(let d=.1;d<=.8;d+=.1)if(obstacles.some(o=>sim.insideObstacle(p.x+Math.cos(a*Math.PI/8)*d,p.z+Math.sin(a*Math.PI/8)*d,o,r)))ok=false;away=ok;}assert(away,`can move away from (${p.x.toFixed(1)},${p.z.toFixed(1)}) r ${r}`);n++;}
 // a free landing stays put
 {const p={x:0,z:0};const before={...p};if(!obstacles.some(o=>sim.insideObstacle(0,0,o,.34)))assert(!sim.landingSpot(p,obstacles,.34)&&p.x===before.x);}
 console.log(`station-sign-landing: ok (${n} landings)`);
})().catch(e=>{console.error(e);process.exit(1);});
