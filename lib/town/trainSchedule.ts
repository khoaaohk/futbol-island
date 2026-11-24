/**
 * The Island Line timetable (train Phase 2, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §5).
 *
 * Pure (no three.js, no DOM): three trains run one way round the loop, evenly spaced, on ONE shared timetable, so every player
 * sees the same trains at the same places with no network traffic. `trainAt(i, nowSec)` turns the clock into a position along
 * the track through a time table worked out once:
 *  - cruise CRUISE m/s, starts and stops at ACCEL m/s², CURVE_SPEED on curves tighter than CURVE_RADIUS (the whole train), a
 *    DWELL s stop at each station, one lap = LAP s (the dwells take any spare time), a train every HEADWAY s at each station;
 *  - the clock (trainClockSec): the relay's clock when connected (lib/multiplayer/liveClock.ts offset), Date.now() solo.
 *
 * Local running (createTrainRunner): each client may hold a train back for a person on the track (it stops STOP_SHORT m short,
 * never touches anyone) and then lets it catch up, running up to CATCH_UP faster and trimming dwells, so the small local
 * difference fades. A runner keeps one number per train (how many seconds it is behind the timetable).
 *
 * Phase 3 (boarding, ride camera, map dots) reads: trainAt, TRAIN_STOPS, trainNearStop, nextTrains.
 */
import {TRACK,TRACK_DS,TRAIN_STATIONS,TRAIN_CROSSINGS,wrapS,type TrainStation} from './trainTrack';
import {liveClock} from '../multiplayer/liveClock';

export const TRAIN_COUNT=3,TRAIN_CARS=2,CAR_LENGTH=12,CAR_GAP=.4,TRAIN_LENGTH=TRAIN_CARS*CAR_LENGTH+(TRAIN_CARS-1)*CAR_GAP;
export const LAP=360,HEADWAY=LAP/TRAIN_COUNT,DWELL=14,ACCEL=.8,CRUISE=12,CURVE_SPEED=8,CURVE_RADIUS=30;
/** Catch-up: up to 15 % faster while behind; dwells run at most twice as fast (never shorter than half). */
export const CATCH_UP=.15,DWELL_TRIM=2;
/** People on the track: look LOOK_AHEAD m ahead, ±LOOK_HALF m either side; stop STOP_SHORT m short at up to BRAKE m/s². */
export const LOOK_AHEAD=40,LOOK_HALF=2.5,STOP_SHORT=4,BRAKE=2;
/** Barriers: lamps from CROSSING_WARN s before the front reaches the crossing; the arms lower over CROSSING_ARM s. */
export const CROSSING_WARN=8,CROSSING_ARM=3;
/** Doors: open DOOR_DELAY s after a stop, close DOOR_DELAY s before leaving, sliding for DOOR_MOVE s. */
export const DOOR_DELAY=1.5,DOOR_MOVE=1.2;

/** Time table resolution (s) and lap-distance grid (m). */
const DT=.1,DX=.5;
const L=TRACK.length;
/** Forward lap distance from a to b (m, 0 ≤ … < L). */
export const ahead=(a:number,b:number)=>((b-a)%L+L)%L;
const wrapT=(t:number)=>((t%LAP)+LAP)%LAP;

// ---- Stops: the front stops TRAIN_LENGTH/2 past the platform centre, so the train sits in the middle of the 30 m platform.
const NORTH=TRAIN_STATIONS.find(s=>s.id==='north')!;
const S0=wrapS(NORTH.s+TRAIN_LENGTH/2);
export type TrainStop={index:number;station:TrainStation;/** front's track s at the stop */s:number;/** lap distance from North */x:number;
 /** lap time (s) the train arrives / leaves */arrive:number;depart:number};

// ---- Speed limits along the track (per row): the curve radius over ±3 rows, then the whole train must be under it.
const rowLimit=(()=>{const n=TRACK.n,out=new Float32Array(n);
 for(let i=0;i<n;i++){const a=(i-3+n)%n,b=(i+3)%n,ang=Math.acos(Math.max(-1,Math.min(1,TRACK.tx[a]*TRACK.tx[b]+TRACK.tz[a]*TRACK.tz[b]))),R=6*TRACK_DS/Math.max(ang,1e-6);out[i]=R<CURVE_RADIUS?CURVE_SPEED:Infinity;}
 return out;})();
/** The limit for the FRONT at track s: the lowest over the train's length behind it. */
function limitAt(s:number){let v=Infinity;for(let d=0;d<=TRAIN_LENGTH;d+=TRACK_DS){const i=Math.floor(wrapS(s-d)/TRACK_DS)%TRACK.n;if(rowLimit[i]<v)v=rowLimit[i];}return v;}

type Table={pos:Float32Array;vel:Float32Array;stops:TrainStop[];cruise:number;dwell:number;run:number};
function build():Table{
 const M=Math.ceil(L/DX),dx=L/M;
 const order=TRAIN_STATIONS.map(st=>({st,x:ahead(S0,wrapS(st.s+TRAIN_LENGTH/2))})).map(o=>({...o,x:o.x<1?L:o.x})).sort((a,b)=>a.x-b.x);
 const stopK=new Set(order.map(o=>Math.round(o.x/dx)));stopK.add(0);
 const lim=new Float32Array(M+1);for(let k=0;k<=M;k++)lim[k]=limitAt(S0+k*dx);
 const profile=(cruise:number)=>{const v=new Float32Array(M+1);for(let k=0;k<=M;k++)v[k]=stopK.has(k)?0:Math.min(cruise,lim[k]);
  for(let k=1;k<=M;k++)v[k]=Math.min(v[k],Math.sqrt(v[k-1]*v[k-1]+2*ACCEL*dx));
  for(let k=M-1;k>=0;k--)v[k]=Math.min(v[k],Math.sqrt(v[k+1]*v[k+1]+2*ACCEL*dx));
  let t=0;const tk=new Float64Array(M+1);for(let k=1;k<=M;k++){t+=2*dx/Math.max(.05,v[k-1]+v[k]);tk[k]=t;}return {v,tk,run:t};};
 // Cruise: CRUISE unless the lap (running + full dwells) would not fit, then a little faster (bisection, capped at 16 m/s).
 let cruise=CRUISE,p=profile(cruise);
 if(p.run+order.length*DWELL>LAP){let lo=CRUISE,hi=16;for(let it=0;it<30;it++){const mid=(lo+hi)/2;if(profile(mid).run+order.length*DWELL>LAP)lo=mid;else hi=mid;}cruise=hi;p=profile(cruise);}
 const dwell=(LAP-p.run)/order.length;
 // Knots (t, x): the running grid, each stop holding still for `dwell` (North's dwell closes the lap).
 const kt:number[]=[],kx:number[]=[],kv:number[]=[];let shift=0;const stops:TrainStop[]=[];
 for(let k=0;k<=M;k++){kt.push(p.tk[k]+shift);kx.push(k*dx);kv.push(p.v[k]);
  const o=order.find(q=>Math.round(q.x/dx)===k);
  if(o){const arrive=p.tk[k]+shift;shift+=dwell;kt.push(arrive+dwell);kx.push(k*dx);kv.push(0);stops.push({index:0,station:o.st,s:wrapS(S0+o.x),x:o.x%L,arrive,depart:(arrive+dwell)%LAP});}}
 stops.forEach((s,i)=>{s.index=i;});
 const N=Math.round(LAP/DT),pos=new Float32Array(N+1),vel=new Float32Array(N+1);let j=0;
 // Each grid step is constant acceleration (v0 → v1 over its time D): x = x0 + v0 τ + (v1 − v0) τ² / 2D, v = v0 + (v1 − v0) τ / D.
 for(let i=0;i<=N;i++){const t=i*DT;while(j<kt.length-2&&kt[j+1]<t)j++;const D=kt[j+1]-kt[j]||1,tau=Math.max(0,Math.min(D,t-kt[j])),v0=kv[j],v1=kv[j+1];
  pos[i]=Math.min(kx[j+1],kx[j]+v0*tau+(v1-v0)*tau*tau/(2*D));vel[i]=Math.max(0,v0+(v1-v0)*tau/D);}
 return {pos,vel,stops,cruise,dwell,run:p.run};
}
const TABLE=build();
/** The five stops in lap order (West Beach … North), each with its arrive / depart lap time. */
export const TRAIN_STOPS:readonly TrainStop[]=TABLE.stops;
export const TIMETABLE={cruise:TABLE.cruise,dwell:TABLE.dwell,run:TABLE.run,startS:S0} as const;

export type TrainState={
 /** front of the train (track s) */s:number;/** m/s */v:number;/** lap time (s) */t:number;
 /** the stop it is standing at (TRAIN_STOPS index) or -1 */at:number;/** the next stop it will reach (TRAIN_STOPS index) */next:number;
 /** s left at the stop (0 when running) */dwellLeft:number;/** doors 0 shut … 1 open */doors:number};
export const newTrainState=():TrainState=>({s:S0,v:0,t:0,at:-1,next:0,dwellLeft:0,doors:0});
/** Lap distance at lap time t (s). */
export function lapX(t:number){const f=wrapT(t)/DT,i=Math.floor(f),k=f-i;return TABLE.pos[i]+(TABLE.pos[Math.min(i+1,TABLE.pos.length-1)]-TABLE.pos[i])*k;}
export function lapV(t:number){const f=wrapT(t)/DT,i=Math.floor(f),k=f-i;return TABLE.vel[i]+(TABLE.vel[Math.min(i+1,TABLE.vel.length-1)]-TABLE.vel[i])*k;}
const inDwell=(st:TrainStop,t:number)=>wrapT(t-st.arrive)<wrapT(st.depart-st.arrive);
/** The timetable at lap time t (allocation-free with `out`). */
export function scheduleAt(t:number,out:TrainState=newTrainState()):TrainState{
 t=wrapT(t);out.t=t;out.s=wrapS(S0+lapX(t));out.v=lapV(t);out.at=-1;out.dwellLeft=0;out.doors=0;
 for(const st of TRAIN_STOPS)if(inDwell(st,t)){out.at=st.index;out.dwellLeft=wrapT(st.depart-t);const inn=TABLE.dwell-out.dwellLeft;
  out.doors=Math.max(0,Math.min(1,(inn-DOOR_DELAY)/DOOR_MOVE,(out.dwellLeft-DOOR_DELAY)/DOOR_MOVE));out.v=0;break;}
 let next=0,best=Infinity;for(const st of TRAIN_STOPS){if(st.index===out.at)continue;const w=wrapT(st.arrive-t);if(w<best){best=w;next=st.index;}}out.next=next;
 return out;
}
/** Train i's lap time at clock nowSec (train i runs i × HEADWAY s ahead of train 0). */
export const trainPhase=(i:number,nowSec:number)=>wrapT(nowSec+i*HEADWAY);
/** Where train i is on the shared timetable at clock nowSec. */
export function trainAt(i:number,nowSec:number,out?:TrainState){return scheduleAt(trainPhase(i,nowSec),out);}
/** The stop train i stands at right now (TRAIN_STOPS index), or -1 (Phase 3: "Board" shows while this is ≥ 0). */
export function trainNearStop(i:number,nowSec:number){const t=trainPhase(i,nowSec);for(const st of TRAIN_STOPS)if(inDwell(st,t))return st.index;return -1;}
/** The stop index of a station id. */
export const stopOf=(id:TrainStation['id'])=>TRAIN_STOPS.findIndex(s=>s.station.id===id);

export type NextTrain={train:number;/** s until it arrives (0: standing at the platform) */wait:number;/** standing there now */here:boolean};
/** The next `k` trains at stop `stop`, soonest first; `t` are the trains' lap times (the runner's, so a held train shows late). */
export function nextTrains(stop:number,t:ArrayLike<number>,k=2):NextTrain[]{
 const st=TRAIN_STOPS[stop],out:NextTrain[]=[];
 for(let i=0;i<t.length;i++){const here=inDwell(st,t[i]);out.push({train:i,wait:here?0:wrapT(st.arrive-t[i]),here});}
 out.sort((a,b)=>a.wait-b.wait);return out.slice(0,k);
}
/** The board line for one train: "Now at the platform", "Arriving", "1 min", "3 min". */
export function waitText(n:NextTrain){return n.here?'Now at the platform':n.wait<25?'Arriving':`${Math.max(1,Math.round(n.wait/60))} min`;}

// ---- Level crossings: lap times the front reaches each crossing and the rear clears it (+1 m).
const lapTimeAt=(x:number)=>{let lo=0,hi=TABLE.pos.length-1;while(lo<hi){const m=(lo+hi)>>1;if(TABLE.pos[m]<x)lo=m+1;else hi=m;}return lo*DT;};
// AAA audit (Nov 24 2026): timed from the deck's EDGES, not its centre line. On the 16 m causeway and the 9.6 m skewed park trail the
// rear was still on the deck (up to 7 m of it) when the lamps went out and the arms began to rise; a slow train leaving West Beach
// showed it at the park trail. Now: lamps CROSSING_WARN s before the front reaches the near edge, up once the rear is 1 m past the far one.
export const CROSSING_TIMES=TRAIN_CROSSINGS.map(c=>{const x=ahead(S0,c.s),h=c.width/2;return {id:c.id,s:c.s,width:c.width,reach:lapTimeAt(Math.max(0,x-h)),clear:lapTimeAt(Math.min(L,x+h+TRAIN_LENGTH+1))};});
/** How closed crossing ci is for one train at lap time t: lamps on, and the arms 0 up … 1 down. */
export function crossingFor(ci:number,t:number,out={lamps:false,arm:0}){
 const c=CROSSING_TIMES[ci],before=wrapT(c.reach-t),after=wrapT(t-c.reach),span=wrapT(c.clear-c.reach);
 if(before<=CROSSING_WARN){out.lamps=true;out.arm=Math.max(0,Math.min(1,(CROSSING_WARN-1-before)/CROSSING_ARM));return out;}// arms start 1 s after the lamps
 if(after<=span){out.lamps=true;out.arm=1;return out;}
 if(after<=span+CROSSING_ARM){out.lamps=false;out.arm=1-(after-span)/CROSSING_ARM;return out;}
 out.lamps=false;out.arm=0;return out;
}

// ---- The clock.
/** Seconds on the shared clock: the relay's (liveClock offset) when connected, else this device's Date.now(). */
export function trainClockSec(perfNow?:number,dateNow?:number){
 const p=perfNow??(typeof performance!=='undefined'?performance.now():0),srv=liveClock.serverNow(p);
 return (Number.isFinite(srv)?srv:(dateNow??Date.now()))/1000;
}

// ---- Local running: a train held for a person on the track, then catching up.
export type TrainRunner={
 /** Advance train i to clock nowSec by dt s; `stopAt` is the track s of the nearest person ahead (NaN: clear). */
 step(i:number,nowSec:number,dt:number,stopAt:number,out:TrainState):TrainState;
 /** Back on the timetable at once (a train far away or off-screen: nobody sees the jump). */
 reset(i:number):void;
 /** Seconds train i is behind the timetable. */
 behind(i:number):number;
 /** Seconds train i has been standing for a person on the track (0 when not). */
 heldFor(i:number):number;
 /** The lap times the runner last gave (for boards and crossings). */
 readonly t:Float64Array;
};
export function createTrainRunner(count=TRAIN_COUNT):TrainRunner{
 const lag=new Float64Array(count),v=new Float64Array(count),held=new Float64Array(count),t=new Float64Array(count),slow=new Uint8Array(count),fresh=new Uint8Array(count).fill(1);
 for(let i=0;i<count;i++)t[i]=trainPhase(i,0);
 const tmp=newTrainState();
 return {
  t,
  step(i,nowSec,dt,stopAt,out){
   const sched=trainPhase(i,nowSec);dt=Math.max(0,Math.min(dt,.25));
   let tau=wrapT(sched-lag[i]);scheduleAt(tau,tmp);
   if(fresh[i]){fresh[i]=0;v[i]=tmp.at>=0?0:lapV(tau);}// first step after a reset: at timetable speed
   const gap=Number.isFinite(stopAt)?ahead(tmp.s,stopAt)-STOP_SHORT:Infinity,blocked=gap<LOOK_AHEAD;
   let adv:number;// how far local time moves this step
   if(tmp.at>=0){adv=dt*(lag[i]>0?DWELL_TRIM:1);v[i]=0;// at a stop: doors, then off on time (or early when behind)
    // A person in front of a waiting train: it does not leave (time holds at the last second of the dwell).
    if(blocked&&gap<=.5&&tmp.dwellLeft<=adv+.05)adv=Math.max(0,tmp.dwellLeft-.05);}
   else{const vs=lapV(tau),rate=lag[i]>.02?1+CATCH_UP:1;let want=vs*rate;
    if(blocked){const cap=gap<=.05?0:Math.sqrt(2*BRAKE*gap);if(cap<want){want=cap;slow[i]=1;}}
    // Held back: pull away again at ACCEL (× the catch-up rate) until back at timetable speed; otherwise just the timetable.
    if(slow[i]){v[i]=Math.max(0,Math.min(want,v[i]+ACCEL*(1+CATCH_UP)*dt));if(!blocked&&v[i]>=vs-.01)slow[i]=0;}else v[i]=want;
    if(vs>.3)adv=v[i]/vs*dt;else adv=blocked&&gap<=.5?0:dt*rate;// pulling away / drawing in: time steps at the rate
    if(blocked&&adv>0){const nx=ahead(tmp.s,wrapS(S0+lapX(tau+adv)));if(nx>Math.max(0,gap)){adv=0;v[i]=0;}}}// never past the stopping point
   lag[i]=Math.max(0,lag[i]+dt-adv);tau=wrapT(sched-lag[i]);
   held[i]=blocked&&(tmp.at>=0?tmp.dwellLeft<.2:v[i]<.05)?held[i]+dt:0;
   scheduleAt(tau,out);if(out.at<0)out.v=v[i];t[i]=tau;return out;
  },
  reset(i){lag[i]=0;v[i]=0;held[i]=0;slow[i]=0;fresh[i]=1;},
  behind:i=>lag[i],
  heldFor:i=>held[i],
 };
}
