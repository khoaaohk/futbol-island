// The Island Line, Phase 2 (Nov 23 2026; plan .claude/worktrees/_recovery-nov20/train/PLAN.md §5, §9.2): the timetable and the
// running trains. Run: node tests/train-schedule.cjs
//  1. timetable (lib/town/trainSchedule.ts, pure): 360 s lap, 14 s dwells, a train every 2:00 at every stop, ≤ 0.8 m/s², curves ≤ 8 m/s
//  2. trainAt / trainNearStop / nextTrains / the board text, the shared clock (relay offset when live, Date.now() solo)
//  3. people on the track: the train stops 4 m short (never closer), waits, then catches up (≤ 15 % faster, trimmed dwells)
//  4. crossings: lamps 8 s before the front, arms down before it arrives, up after the rear clears
//  5. wiring and heat: one train draw, one crossing draw, boards on a 1 Hz clock, the audio cues, Town and world wired
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const S=L('lib/town/trainSchedule.ts'),tt=L('lib/town/trainTrack.ts'),lc=L('lib/multiplayer/liveClock.ts'),TR=tt.TRACK;
const near=(a,b,e,m)=>assert(Math.abs(a-b)<=e,`${m}: ${a} vs ${b}`);
// 1. timetable
assert.equal(S.LAP,360);assert.equal(S.HEADWAY,120);assert.equal(S.TRAIN_STOPS.length,5);
assert.deepEqual(S.TRAIN_STOPS.map(s=>s.station.id),['west','south','summit','cay','north'],'lap order from North');
assert(S.TIMETABLE.dwell>=S.DWELL-1e-6,`dwell ${S.TIMETABLE.dwell} ≥ 14 s`);assert(S.TIMETABLE.dwell<S.DWELL+6,`dwell ${S.TIMETABLE.dwell} not padded much`);
assert(S.TIMETABLE.cruise>=S.CRUISE&&S.TIMETABLE.cruise<14,`cruise ${S.TIMETABLE.cruise}`);
{let maxA=0,maxV=0,prevX=S.lapX(0),prevV=S.lapV(0);const step=.2;
 for(let t=step;t<S.LAP;t+=step){const x=S.lapX(t),v=S.lapV(t);assert(x>=prevX-1e-3,`moves one way at ${t}`);if(Math.max(v,prevV)>1.2)maxA=Math.max(maxA,Math.abs(v-prevV)/step);/* (the last half metre into a stop is one table step) */maxV=Math.max(maxV,v);prevX=x;prevV=v;}
 assert(maxA<=S.ACCEL*1.15,`acceleration ${maxA.toFixed(2)} ≤ 0.8 m/s²`);assert(maxV<=S.TIMETABLE.cruise+.05,`top speed ${maxV}`);
 // the tight curves (south-west corner ~22 m, Coral Cay ~27 m): the front within them runs ≤ 8 m/s
 for(let t=0;t<S.LAP;t+=.5){const st=S.scheduleAt(t);if(st.s>1112&&st.s<1130)assert(st.v<=S.CURVE_SPEED+.05,`curve speed ${st.v} at s ${st.s}`);}
 near(S.lapX(S.LAP-1e-6),TR.length,.6,'one lap is the whole loop');}
for(const st of S.TRAIN_STOPS){const a=S.scheduleAt(st.arrive+.5),b=S.scheduleAt(st.arrive+7);
 assert.equal(a.at,st.index,`standing at ${st.station.id}`);near(a.v,0,1e-6,'still at a stop');near(a.s,st.s,.6,`front at ${st.station.id}`);
 near(Math.abs(((st.s-st.station.s)%TR.length+TR.length)%TR.length),S.TRAIN_LENGTH/2,1,'train centred on the platform');
 assert(b.doors>.99,'doors open mid-dwell');assert(a.doors<.01,'doors shut on arrival');
 const c=S.scheduleAt(st.depart-.3);assert(c.doors<.01,'doors shut before leaving');}
// 2. trainAt, headway, boards, clock
{const now=1764000000;for(const st of S.TRAIN_STOPS){const ts=[0,1,2].map(i=>S.trainPhase(i,now)),n=S.nextTrains(st.index,ts,3);
  assert(n[1].wait-n[0].wait<=S.HEADWAY+.01&&n[2].wait-n[1].wait<=S.HEADWAY+.01,'a train every 2:00');}
 // train i is i × 120 s ahead of train 0
 const a=S.trainAt(0,now+S.HEADWAY),b=S.trainAt(1,now);near(a.s,b.s,1e-6,'train 1 runs 2:00 ahead');
 // every train passes every stop: standing somewhere for 5 × dwell per lap
 let standing=0;for(let t=0;t<S.LAP;t+=1)if(S.trainNearStop(0,t)>=0)standing++;near(standing,5*S.TIMETABLE.dwell,6,'5 dwells a lap');
 assert.equal(S.waitText({wait:0,here:true}),'Now at the platform');assert.equal(S.waitText({wait:12,here:false}),'Arriving');
 assert.equal(S.waitText({wait:70,here:false}),'1 min');assert.equal(S.waitText({wait:200,here:false}),'3 min');
 near(S.trainClockSec(5000,1764000000000),1764000000,1e-6,'solo: Date.now()');
 lc.liveClock.map(1764000000000,0,5000);near(S.trainClockSec(5000,0),1764000000,1e-6,'live: the relay clock');
 near(S.trainClockSec(6000,0),1764000001,1e-6,'live: it keeps running');lc.liveClock.reset();assert(Number.isNaN(lc.liveClock.serverNow(1)),'reset: not live');}
// 3. a person on the track
{const r=S.createTrainRunner(),out=S.newTrainState(),dt=1/30;let now=1000;
 // run train 0 to a point between stops at cruise, then put a person 30 m ahead of its front
 while(true){const st=S.trainAt(0,now);if(st.at<0&&st.v>S.TIMETABLE.cruise-.1)break;now+=.5;}
 r.step(0,now,dt,NaN,out);const person=tt.wrapS(out.s+30);let minGap=Infinity,horn=0;
 for(let k=0;k<30*20;k++){now+=dt;r.step(0,now,dt,person,out);const g=S.ahead(out.s,person);if(g<20)minGap=Math.min(minGap,g);}
 assert(minGap>=S.STOP_SHORT-.05,`stops ${minGap.toFixed(2)} m short (≥ 4)`);near(out.v,0,1e-6,'standing for the person');
 assert(r.heldFor(0)>5,'held long enough for "Please step off the track"');const lag=r.behind(0);assert(lag>10,`behind ${lag}`);
 void horn;
 // the person steps off: it pulls away and catches up (never more than 15 % fast), then runs on time
 let maxV=0;for(let k=0;k<30*400&&r.behind(0)>0;k++){now+=dt;r.step(0,now,dt,NaN,out);if(out.at<0)maxV=Math.max(maxV,out.v);}
 assert(maxV<=S.TIMETABLE.cruise*(1+S.CATCH_UP)+.05,`catch-up speed ${maxV}`);
 assert.equal(r.behind(0),0,'back on the timetable');near(out.s,S.trainAt(0,now).s,.05,'same place as everyone else');
 // a person stepping onto the line right in front: it stops, never moves into them
 r.reset(0);r.step(0,now,dt,NaN,out);const p2=tt.wrapS(out.s+S.STOP_SHORT+.2),s0=out.s;for(let k=0;k<60;k++){now+=dt;r.step(0,now,dt,p2,out);}
 assert(S.ahead(out.s,p2)>=S.STOP_SHORT-.3||S.ahead(s0,out.s)<.5,'no closer than the stopping point');}
// 4. crossings
for(let ci=0;ci<S.CROSSING_TIMES.length;ci++){const c=S.CROSSING_TIMES[ci];
 assert(!S.crossingFor(ci,c.reach-S.CROSSING_WARN-.5).lamps,'quiet before');assert(S.crossingFor(ci,c.reach-S.CROSSING_WARN+.2).lamps,'lamps 8 s before');
 near(S.crossingFor(ci,c.reach-.5).arm,1,1e-6,'arms down before the front arrives');near(S.crossingFor(ci,(c.reach+c.clear)/2).arm,1,1e-6,'down while it passes');
 near(S.crossingFor(ci,c.clear+S.CROSSING_ARM+.5).arm,0,1e-6,'up after the rear clears');
 // the front reaches the crossing at `reach`
 {const d=S.ahead(S.scheduleAt(c.reach).s,c.s);near(Math.min(d,TR.length-d),0,1.4,'reach time (one 0.1 s table step)');}}
if(process.env.TRAIN_PURE_ONLY){console.log("train-schedule: pure ok");process.exit(0);}
// 5. wiring and heat (source checks; the built world is checked in tests/train-track.cjs)
{const run=read('lib/town/trainRunning.ts'),world=read('lib/town/world.ts'),town=read('components/Town.tsx'),snd=read('lib/audio/islandSound.ts');
 assert((run.match(/new T\.InstancedMesh\(/g)||[]).length===1,'one InstancedMesh for every car of every train');
 assert(/castShadow=false/.test(run),'no shadow pass for the trains');
 assert(/BOARD_HZ=1\b/.test(run),'boards on a 1 Hz clock');assert(/BELL_RANGE=60\b/.test(run)&&/ANIMATE_RANGE=80\b/.test(run)&&/HIDE_RANGE=400\b/.test(run),'bell 60 m, animate 80 m, hide 400 m');
 assert(/MACHINE_NIGHT/.test(run),'night: the shared night uniform');
 assert(/createTrainRunning/.test(world)&&/updateTrains/.test(town),'world and Town wired');
 assert(/case 'train-bell'/.test(snd)&&/case 'train-horn'/.test(snd),'bell and horn cues in the island sound kit (mute respected)');
 assert(!/FI 01/.test(run)||/ball/.test(run),'headmark: our own ball emblem');}
console.log('train-schedule: ok');
