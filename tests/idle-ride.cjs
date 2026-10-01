// Idle ride / flight frame rate (lib/town/idleRide.ts, Oct 1 2026): on a ride or the jetpack with no input and no travel
// for 4 s the island caps at 20 fps; input or real travel restores the normal rate at once; walking is never throttled.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
const {createIdleRide,IDLE_RIDE_AFTER_MS:AFTER,IDLE_RIDE_FRAME_MS:IDLE,IDLE_TRAVEL_MPS,IDLE_CLIMB_MPS}=load('lib/town/idleRide.ts');
const {frameCapSlot}=load('lib/town/frameCap.ts');
assert.equal(IDLE,1000/20);assert.equal(AFTER,4000);
const F=1000/30;
// Hover in place: a jetpack bob (±0.12 m at 1.1 Hz) and a camera that follows it. Idle after 4 s, not before.
{const r=createIdleRide();let t=0;
 const hover=t=>({x:5,y:12+.12*Math.sin(t/1000*2*Math.PI*1.1),z:-3});
 for(;t<AFTER-F;t+=F){assert.equal(r.interval(t,true),0,'not idle before 4 s');r.sample(t,hover(t),{x:5,y:hover(t).y+8,z:-15});}
 for(;t<AFTER+2000;t+=F){r.sample(t,hover(t),{x:5,y:hover(t).y+8,z:-15});}
 assert.equal(r.interval(t,true),IDLE,'a still hover is idle: 20 fps');
 // A tap wakes it at once.
 r.stir(t);assert.equal(r.interval(t+F,true),0,'input restores the normal rate');
 assert.equal(r.interval(t+AFTER+1,true),IDLE,'and it rests again 4 s later');}
// Travel keeps the full rate: drifting forward, a parachute descent, a camera pan.
for(const [label,move] of [['slow drift',t=>({p:{x:t/1000*(IDLE_TRAVEL_MPS*2),y:10,z:0},c:{x:0,y:20,z:-10}})],
  ['parachute descent',t=>({p:{x:0,y:40-t/1000*(IDLE_CLIMB_MPS*1.6),z:0},c:{x:0,y:48-t/1000*(IDLE_CLIMB_MPS*1.6),z:-10}})],
  ['camera pan',t=>({p:{x:0,y:10,z:0},c:{x:t/1000*1.2,y:20,z:-10}})]]){
 const r=createIdleRide();for(let t=0;t<AFTER*2;t+=F){const {p,c}=move(t);r.sample(t,p,c);assert.equal(r.interval(t,true),0,`${label}: never idle`);}}
// Walking is never capped, and riding again starts a fresh 4 s wait.
{const r=createIdleRide();for(let t=0;t<AFTER*2;t+=F){r.sample(t,{x:0,y:0,z:0},{x:0,y:5,z:-5});assert.equal(r.interval(t,false),0,'walking: never idle');}
 assert.equal(r.interval(AFTER*2+1,true),0,'mounting a ride starts a fresh wait');}
// A long pause between frames (menu, background) restarts the wait instead of counting as idle time.
{const r=createIdleRide();r.sample(0,{x:0,y:0,z:0},{x:0,y:0,z:0});r.sample(30000,{x:0,y:0,z:0},{x:0,y:0,z:0});assert.equal(r.interval(30001,true),0);}
// With the frame cap at 50 ms slots, 120 Hz timestamps render exactly 20 frames a second.
{let slot=0,n=0;for(let t=0;t<10000;t+=1000/120){const s=frameCapSlot(t,slot,IDLE);if(s>=0){slot=s;n++;}}assert(n>=199&&n<=201,`20 fps on 120 Hz (${n}/10 s)`);}
// Wiring: Town samples each rendered frame and caps at max(idle, heat tier) on every device.
const town=fs.readFileSync('components/Town.tsx','utf8');
assert.match(town,/const idleFrame=idleRide\.interval\(now,rideRef\.current!=='walk'\);\s*renderStats\.idleRide=idleFrame;\s*if\(idleFrame\|\|coarse\|\|heat\.cap30\)\{const slot=frameCapSlot\(now,lastRendered,Math\.max\(idleFrame,heat\.frameMs\)\)/);
assert.match(town,/idleRide\.sample\(now,player\.root\.position,camera\.position\)/);
assert.match(town,/for\(const type of \['pointerdown','pointermove','keydown','wheel'\]\)window\.addEventListener\(type,stir,\{capture:true,passive:true,signal:idleInput\.signal\}\)/);
assert.match(town,/return\(\)=>\{idleInput\.abort\(\);/);
console.log('IDLE_RIDE_PASS still hover → 20 fps after 4 s, input/travel/descent/pan restore, walking never capped, 20 fps on 120 Hz');
