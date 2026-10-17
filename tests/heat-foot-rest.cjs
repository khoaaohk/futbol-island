// Heat audit Oct 17 2026: a player standing still on foot rests at 20 fps after 3 s, only when nothing visible is moving.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
const {createIdleRide,IDLE_RIDE_AFTER_MS,IDLE_RIDE_FRAME_MS,IDLE_FOOT_AFTER_MS}=load('lib/town/idleRide.ts');
assert.equal(IDLE_FOOT_AFTER_MS,3000);assert.equal(IDLE_RIDE_AFTER_MS,4000);
const F=1000/30,still={x:0,y:0,z:0},cam={x:0,y:6,z:-8};
// 3 s of continuous eligibility, not before; 20 fps after.
{const r=createIdleRide();let t=0;for(;t<IDLE_FOOT_AFTER_MS-F;t+=F){r.sample(t,still,cam);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS),0,'not before 3 s');}
 for(;t<IDLE_FOOT_AFTER_MS+F*3;t+=F)r.sample(t,still,cam);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS),IDLE_RIDE_FRAME_MS,'20 fps after 3 s');
 // A townsperson starts moving (eligibility drops): the full rate returns at once and a fresh 3 s wait starts.
 assert.equal(r.interval(t+F,false),0,'ineligible: full rate');t+=F;
 assert.equal(r.interval(t+F,true,IDLE_FOOT_AFTER_MS),0,'eligible again: waits 3 s again');
 // Input restores the rate.
 r.stir(t+5000);assert.equal(r.interval(t+5000+F,true,IDLE_FOOT_AFTER_MS),0,'input wakes it');}
// Walking (travel) never rests, and the ride default stays 4 s.
{const r=createIdleRide();for(let t=0;t<9000;t+=F){r.sample(t,{x:t/1000*2,y:0,z:0},cam);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS),0,'moving player never rests');}}
{const r=createIdleRide();let t=0;for(;t<3500;t+=F)r.sample(t,still,cam);assert.equal(r.interval(t,true),0,'a ride still waits 4 s');}
// Wiring.
const town=fs.readFileSync('components/Town.tsx','utf8'),npcs=fs.readFileSync('lib/graphics/islandNpcs.ts','utf8');
for(const need of ["rideRef.current==='walk'&&!waterIdle","walkBall.state.mode==='attached'","islandNpcs.stats.moving===0","games.stats.visiblePlayers===0","streetTraffic.cars.some(","!heat.focused","!zipline.active","!fishing.focused"])assert.ok(town.includes(need),'Town gate: '+need);
assert.match(npcs,/stats\.moving=0;[\s\S]*stats\.moving\+\+/,'islandNpcs counts visibly moving townsfolk');
assert.match(npcs,/MOVING_RANGE=35/,'only townsfolk within 35 m count (farther ones already pose at 10 Hz)');
console.log('HEAT_FOOT_REST_PASS 3 s still on foot -> 20 fps; moving townsfolk/cars/ball/input/travel keep 30');
