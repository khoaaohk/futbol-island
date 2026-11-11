// Breakaway Run scripted bot (Nov 10 2026), shared by tests/runner-endless.cjs and the scratch balance runs. Not a test on its own.
// It reads the sim state the way a player reads the road (the nearest threat in each lane, the keeper's side) and plays the four
// inputs: lane, jump, shoot, nothing else. `lapse` is the chance per second of a half-second lapse (no input), so runs end.
// `react` (seconds) is how often it re-reads the lanes (0 = every tick: a perfect reader); `nerve` (0..1) is the share of last-moment
// tackles it still jumps. The defaults are a strong player; react .3-.4 with nerve .3-.6 is a child-like one who feels the ramp.
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/** One decision for this tick. R = the runnerGame module. Returns nothing: it sets s.lane and calls runnerJump / runnerShoot. */
function botStep(R,s,st,dt){
 if(st.lapseT>0){st.lapseT-=dt;return;}
 if(st.lapse>0&&st.r()<st.lapse*dt){st.lapseT=.5;return;}
 const near=[99,99,99];
 for(const o of s.objects){if(o.passed||o.beaten||(o.kind!=='defender'&&o.kind!=='cone')||o.z>.6||o.z<-30)continue;
  const lanes=new Set([o.lane]);if(o.drift!==undefined){lanes.add(o.drift);lanes.add(o.driftEnd??o.lane);}if(o.closeTo!==undefined)lanes.add(o.closeTo);
  if(o.x!==undefined)for(const l of[-1,0,1])if(Math.abs(o.x-l*2.4)<1.5)lanes.add(l);
  for(const l of lanes)if(l>=-1&&l<=1)near[l+1]=Math.min(near[l+1],-o.z);}
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<-6&&o.z>-26);
 let want=s.lane;
 st.readT-=dt;const read=st.readT<=0;if(read)st.readT=st.react;
 if(!read)want=s.lane;else if(near[s.lane+1]<24){let best=s.lane;for(const l of[-1,0,1])if(near[l+1]>near[best+1]+3)best=l;want=best;}
 else if(goal&&s.balls>0){
  if(goal.keeper){const kx=goal.kx??0;if((goal.kout??0)>.2)want=kx>0?-1:1;else if(Math.abs(kx-s.x)<1.7)want=kx>0?-1:1;}
  else want=goal.openLane;}
 else{// Collect: the nearest football ahead in a safe lane.
  let cz=-99;for(const o of s.objects)if(o.kind==='coin'&&!o.passed&&o.z<-2&&o.z>-26&&o.z>cz&&near[o.lane+1]>26){cz=o.z;want=o.lane;}}
 if(want!==s.lane&&near[want+1]>8)s.lane=want;
 // Jump what cannot be dodged: a threat about a third of a second away in this lane, a rolling ball, a puddle.
 const tt=near[s.lane+1]/Math.max(1,s.speed),x=s.x;
 const roller=s.objects.some(o=>o.kind==='roller'&&!o.passed&&o.z>-s.speed*.3&&o.z<.5&&Math.abs((o.x??0)+(o.roll??0)*(-o.z/Math.max(1,s.speed))-x)<1.6);
 const mud=s.objects.some(o=>o.kind==='mud'&&!o.passed&&o.z>-s.speed*.25&&o.z<0&&Math.abs(x-o.lane*2.4)<1);
 const tackle=tt<.3&&Math.abs(s.x-s.lane*2.4)<1.3&&near[s.lane+1]<12;if(tackle&&!st.tackleSeen){st.tackleSeen=true;st.brave=st.r()<st.nerve;}if(!tackle)st.tackleSeen=false;
 if(!s.jumping&&(tackle&&st.brave||roller||mud))R.runnerJump(s);
 if(goal&&s.balls>0&&goal.z>-21&&goal.z<-9&&s.shotCooldown<=0){
  if(goal.keeper){if((goal.kout??0)<=.3&&Math.abs((goal.kx??0)-(s.x+R.RUNNER_STRIKE_X))>=1.6)R.runnerShoot(s);}
  else if(Math.abs(s.x-goal.openLane*2.4)<.6)R.runnerShoot(s);}
}
/** Play one run to the end (or `maxSeconds`). Returns the state and what happened along the way. `each(s,t)` is called every tick. */
function botRun(R,Mo,mode,{seed=7,lapse=.02,react=0,nerve=1,maxSeconds=3600,hz=30,each}={}){
 Mo.selectRunnerMode(mode);const s=R.createRunnerGame({seed}),st={r:rng(seed*977+13),lapse,lapseT:0,react,nerve,readT:0,tackleSeen:false,brave:true},dt=1/hz;let t=0,first=null,ended=false;const rounds=[];
 while(t<maxSeconds){botStep(R,s,st,dt);const before=s.round;R.tickRunner(s,dt);R.runnerOutro(s,dt);t+=dt;each?.(s,t);
  if(s.round!==before){const row={round:before,t,score:s.score,bonus:s.roundBonus,distance:s.distance,lives:s.lives};rounds.push(row);if(!first)first=row;}
  if(R.runnerOver(s)){ended=true;break;}}
 return{s,t,ended,rounds,first};}
module.exports={rng,botStep,botRun};
