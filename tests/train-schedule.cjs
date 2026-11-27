// The Island Line, Phase 2 (Nov 23 2026; plan .claude/worktrees/_recovery-nov20/train/PLAN.md §5, §9.2): the timetable and the
// running trains. Run: node tests/train-schedule.cjs
//  1. timetable (lib/town/trainSchedule.ts, pure): 360 s lap, 14 s dwells, a train every 2:00 at every stop, ≤ 0.8 m/s² away / ≤ 1 m/s²
//     braking, jerk-limited (eased, Nov 24 polish), curves ≤ 8 m/s
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
{let maxA=0,maxB=0,maxJ=0,maxV=0,prevX=S.lapX(0),prevV=S.lapV(0),prevA=NaN;const step=.1;
 for(let t=step;t<S.LAP;t+=step){const x=S.lapX(t),v=S.lapV(t),a=(v-prevV)/step;assert(x>=prevX-1e-3,`moves one way at ${t}`);
  if(a>0)maxA=Math.max(maxA,a);else maxB=Math.max(maxB,-a);if(Number.isFinite(prevA))maxJ=Math.max(maxJ,Math.abs(a-prevA)/step);maxV=Math.max(maxV,v);prevX=x;prevV=v;prevA=a;}
 assert(maxA<=S.ACCEL*1.05,`acceleration ${maxA.toFixed(2)} ≤ 0.8 m/s²`);assert(maxB<=S.DECEL*1.05,`braking ${maxB.toFixed(2)} ≤ 1 m/s²`);assert(maxV<=S.TIMETABLE.cruise+.05,`top speed ${maxV}`);
 // Polish (Nov 24): jerk-limited, no step in the acceleration anywhere (starts, stops, curve slow-downs) — was a 0.8 m/s² jump
 // (≤ ~0.48 m/s³ from rest / into a stop; 0.86 where a short run swings straight from +0.8 to −1 m/s², still a smooth S)
 assert(maxJ<=(S.ACCEL+S.DECEL)/((2*S.EASE_H+1)*.1)*1.05,`jerk ${maxJ.toFixed(2)} ≤ 0.9 m/s³`);
 for(const st of S.TRAIN_STOPS){const a0=(S.lapV(st.depart+.4)-S.lapV(st.depart+.2))/.2,a1=(S.lapV(st.arrive-.2)-S.lapV(st.arrive-.4))/.2;
  assert(a0>=0&&a0<.25,`${st.station.id}: pulls away gently (${a0.toFixed(2)} m/s² in the first 0.4 s)`);assert(a1<=0&&a1>-.25,`${st.station.id}: settles gently (${a1.toFixed(2)})`);}
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
 assert.equal(S.waitText({wait:0,here:true}),'Boarding now');assert.equal(S.waitText({wait:12,here:false}),'Arriving');
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
 // AAA audit: the arms stay down until the rear has left the whole deck (not just its centre line), and are down before the front touches it
 const x0=S.ahead(S.TIMETABLE.startS,c.s);assert(S.lapX(c.clear)>=x0+c.width/2+S.TRAIN_LENGTH+.9,`${c.id}: rear still on the deck when the arms start up`);
 assert(S.lapX(c.reach-.3)<=x0-c.width/2+.05,`${c.id}: front on the deck before the arms are down`);
 // the front reaches the deck's near edge at `reach`
 {const d=S.ahead(S.scheduleAt(c.reach).s,tt.wrapS(c.s-c.width/2));near(Math.min(d,TR.length-d),0,1.4,'reach time (one 0.1 s table step)');}}
if(process.env.TRAIN_PURE_ONLY){console.log("train-schedule: pure ok");process.exit(0);}
// 5. wiring and heat (source checks; the built world is checked in tests/train-track.cjs)
{const run=read('lib/town/trainRunning.ts'),world=read('lib/town/world.ts'),town=read('components/Town.tsx'),snd=read('lib/audio/islandSound.ts');
 assert((run.match(/new T\.InstancedMesh\(/g)||[]).length===2,'an InstancedMesh per train + one for all door leaves (≤ 4 draws)');
 assert(/castShadow=false/.test(run)&&!/PointLight|SpotLight|castShadow=true/.test(run),'no lights, no shadow pass for the trains');
 assert(!/onBeforeCompile|ShaderMaterial|customProgramCacheKey/.test(run)&&/createVehicleMaterial/.test(run),'no new shader code: the road traffic vehicle material');
 assert(/LOD_FAR_IN=\.10,LOD_NEAR_OUT=\.125/.test(run)&&/buildCarBox/.test(run),'one box per car only when small on screen (with hysteresis)');assert(/XING_HZ=4\b/.test(run),'crossings on a 4 Hz / event clock');
 assert(/compileAsync\(tr\.root/.test(read('components/Town.tsx')),'train programs warmed at load');
 assert(/FLIP_RANGE=45,FLIP_S=\.3,FLIP_HZ=20\b/.test(run)&&/!f\.reduced/.test(run)&&/trainFrame\.reduced=reduced/.test(town),'board flip: 0.3 s at 20 Hz on a change, near boards only, off with reduced motion');
 assert(/BOARD_HZ=1\b/.test(run),'boards on a 1 Hz clock');assert(/BELL_RANGE=60\b/.test(run)&&/ANIMATE_RANGE=80\b/.test(run)&&/HIDE_RANGE=400\b/.test(run),'bell 60 m, animate 80 m, hide 400 m');
 assert(/MACHINE_NIGHT/.test(run),'night: the shared night uniform');
 // Polish (Nov 24): headlamps brighter at night and in the tunnel through the head / tail lamp channels (no light, no shader)
 assert(/tr\.look\.lamp\.x=\(?1\+\.6\*night\+1\.4\*tr\.tun/.test(run)&&/const tunnelLamps=/.test(run),'headlamp boost: night + tunnel, eased');
 assert(/createTrainRunning/.test(world)&&/updateTrains/.test(town),'world and Town wired');
 assert(/case 'train-bell'/.test(snd)&&/case 'train-horn'/.test(snd),'bell and horn cues in the island sound kit (mute respected)');
 assert(/plate:'FI01'/.test(read('lib/town/trainLiveries.ts'))&&/emblem:true/.test(read('lib/town/trainLiveries.ts')),'headmark: our own ball emblem and FI 01 plate');}
// 6. the built trains (the real world in Node, no WebGL): one draw for every car, LOD, crossings, boards
(async()=>{const {loadIslandWorld}=require('../scripts/island-world-load.cjs');const {T,L:LW}=await loadIslandWorld(require('node:path').join(__dirname,'..'));
 const scene=new T.Scene(),w=LW('lib/town/world.ts').buildTown(scene),run=w.trainRun,R=LW('lib/town/trainRunning.ts');assert(run,'trains built');
 // Nov 26 2026 (island-sky, owner: "the train wheels are missing on one side"): +~96 tris per car (an inner face on all 8 wheels
 // + 4 axles); was <=2500, measured 2589. Same pin as train-looks2.
 assert(run.triangles<=2800,`one car is ${run.triangles} triangles (≤ 2.8k: Nov 24 visuals, real openings + the interior, Nov 26 wheel inner faces, Nov 27 a soft cushion per bench)`);
 let im=0;scene.traverse(o=>{if(o.isInstancedMesh&&/^train-/.test(o.name)){im++;assert(!o.castShadow,'no shadow');}});assert.equal(im,6,'3 trains + doors + one glass/shadow mesh (Nov 24 visuals) + the night glow (POLISH 3 trainNightGlow)');
 const cam=new T.PerspectiveCamera(50,1,1,500),player={x:0,y:0,z:0};const at=(x,y,z,lx,lz)=>{cam.position.set(x,y,z);cam.lookAt(lx,0,lz);cam.updateMatrixWorld(true);};
 // all three trains pinned at the North station (the gfx view): 6 cars in one draw
 const north=tt.TRAIN_STATIONS[0],p=tt.trackAt(north.s);run.cluster=north.s+20;at(p.x+40,25,p.z+60,p.x,p.z);player.x=p.x;player.z=p.z+30;
 run.update({dt:1/30,camera:cam,player});let d=run.drawn;assert.equal(d.cars,6,'six cars drawn');{const xe=tt.trackAt(tt.TRAIN_CROSSINGS[1].s);at(xe.x+30,20,xe.z+40,xe.x,xe.z);run.update({dt:1/30,camera:cam,player});assert(run.drawn.crossings>=1,'crossings shown near North Beach (Phase 4: a footpath crossing within 110 m)');at(p.x+40,25,p.z+60,p.x,p.z);run.update({dt:1/30,camera:cam,player});d=run.drawn;}assert(d.doors>0&&d.far<6,'near tier with doors');
 at(p.x+30,60,p.z+178,p.x,p.z);run.update({dt:1/30,camera:cam,player});assert.equal(run.drawn.far,0,'Nov 25: ~180 m off but big on screen (overview camera): full detail, not the box');
 at(p.x+40,25,p.z+340,p.x,p.z);run.update({dt:1/30,camera:cam,player});assert(run.drawn.far>0,'box tier only when tiny on screen');
 at(p.x+40,25,p.z+230,p.x,p.z);run.update({dt:1/30,camera:cam,player});assert(run.drawn.far>0,'hysteresis: stays the box just inside the switch');at(p.x+40,25,p.z+60,p.x,p.z);assert(d.boards>=1,'the North board shown');
 // looking away: nothing drawn; far away (town square, 400 m+ from every train): nothing drawn
 at(p.x+40,25,p.z+60,p.x+80,p.z+200);run.update({dt:1/30,camera:cam,player});assert.equal(run.drawn.cars,0,'off-screen: no draw');
 run.cluster=NaN;at(103,30,-20,103,-60);player.x=103;player.z=-20;for(let k=0;k<40;k++)run.update({dt:1/30,camera:cam,player});d=run.drawn;/* boards switch at 1 Hz */
 for(let i=0;i<3;i++){const q=tt.trackAt(run.states[i].s);if(Math.hypot(q.x-103,q.z+20)>R.HIDE_RANGE+20)assert(d.cars<6,'far trains hidden');}
 assert(d.boards===0,'no board work in town');
 // Owner, Nov 24 2026: trains NEVER wait. A person on the track in front of a running train (local player): the train keeps its
 // timetable exactly (no hold, no lag), honks + Kenji warns once within WARN_S s, and the car that reaches them reports a knock.
 const now=S.trainClockSec();let ti=-1;for(let i=0;i<3;i++){const x=S.trainAt(i,now),nx=S.TRAIN_STOPS[x.next];if(x.at<0&&x.v>6&&S.ahead(x.s,nx.s)>120&&S.ahead(x.s,nx.s)<2000)ti=i;}
 const st=S.trainAt(Math.max(0,ti),now);if(ti>=0){const q=tt.trackAt(st.s+24);player.x=q.x;player.z=q.z;player.y=tt.bedAt(LW('lib/town/trainLayout.ts').trainLayout().profile,st.s+24);/* standing on the bed (tunnel / Summit / trestle too) */at(q.x+20,20,q.z+20,q.x,q.z);
  let says=0,knock=null,maxLag=0;for(let k=0;k<30*4;k++){const r=run.update({dt:1/30,camera:cam,player,nowSec:now+k/30});if(r.say)says++;if(r.knock&&!knock)knock=r.knock;maxLag=Math.max(maxLag,run.runner.behind(ti));if(knock)break;}
  assert(maxLag<1e-6,`no speed change for a person on the line (lag ${maxLag})`);
  const want=S.trainAt(ti,now+0).s;assert(Number.isFinite(want));
  assert.equal(says,1,'Kenji warns once per approach');assert.equal(knock,'track','the lead car\'s front knocks the player clear');}
 // Polish (Nov 24): the platform announcement: standing on North's platform, "arriving" (with the chime) before it pulls in, "leaving" as the doors close
 {const k=S.stopOf('north'),stp=S.TRAIN_STOPS[k],c=tt.trackAt(stp.station.s),nn=tt.leftNormal(c.tx,c.tz),px=c.x+nn.x*stp.station.side*4,pz=c.z+nn.z*stp.station.side*4;
  /* a train held by the step-off block above keeps its lag (catch-up) and would pull in late: one frame with the camera far off
     the island resets every runner first (was a real-clock flake: it failed whenever the held train was the one due at North) */
  run.cluster=NaN;const t0=360*5000+stp.arrive-14,notes=[];let tArr=NaN;at(5000,30,5000,5000,4900);player.x=5000;player.z=5000;run.update({dt:1/30,camera:cam,player,nowSec:t0-1});
  player.x=px;player.z=pz;player.y=1;at(px+6,4,pz+6,c.x,c.z);
  for(let q=0;q<30*32;q++){const r=run.update({dt:1/30,camera:cam,player,nowSec:t0+q/30});if(r.note){notes.push(r.note);if(/arriving/.test(r.note))tArr=q/30;}}
  const want=`The train for ${S.TRAIN_STOPS[(k+1)%5].station.name}`;assert(notes.some(n=>n===want+' is arriving. Please stand behind the yellow line.'),`arriving caption (${notes})`);
  assert(tArr>=14-R.ANNOUNCE_S-.2&&tArr<=14-R.ANNOUNCE_S+.2,`announced ${R.ANNOUNCE_S} s before it pulls in (${tArr})`);
  assert(notes.includes(want+' is leaving.'),`leaving caption (${notes})`);assert.equal(notes.length,2,'once each');}
 w.dispose&&w.dispose();console.log('train-schedule: ok');})().catch(e=>{console.error(e);process.exit(1);});
