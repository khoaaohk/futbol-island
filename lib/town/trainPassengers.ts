/**
 * Island Line NPC passengers (train Gameplay 3, owner Nov 24 2026): islanders riding the trains.
 *  - Who rides: each car has SEATED_SLOTS seated slots (each owns two of the car's NPC_SEATS, so two slots never share a seat) and
 *    STANDING_SLOTS strap spots. A slot's rider changes every few stops (its own 6–9 stop rhythm), so 1–2 people get off and on at
 *    a stop, walking through the platform-side doors during the dwell (off first, then on). Busier runs (a third of the laps) add
 *    1–2 standing at the straps. All of it is a pure function of (train, timetable lap, stop): every client sees roughly the same
 *    people, nothing is sent (local only).
 *  - The cast: commuters, a kid with a ball, fans in scarves, a grandparent with a bento, trainspotters... and the station islanders
 *    who board (stationNpcs.ts STATION_BOARDERS: Inês, Mo, Coach Lena, Bianca) ride along while they are away from their platform.
 *    They are talkable when you ride near them (Town's usual Talk slide-out, NpcDefinition): the station islanders keep their own
 *    talk; the others reuse the Phase 4 train / travel ↔ football fact pool (stationNpcs.ts topics, sources there).
 *  - Small reactions: a look out of the window now and then, a sway on curves (not with reduced motion), a glance toward the cab when
 *    the horn sounds.
 * Heat (AGENTS.md): ONE instanced draw for every passenger (lib/graphics/trainPassengerMesh.ts, built on first sight, no shadows);
 * only trains within SHOW_RANGE m and on screen; beyond DETAIL_RANGE (and not ridden) nobody is drawn (the windows show little at
 * that range); hot tiers cap the riders a car (tier 3: 2, the lowest tier: 1). Roster work only when a train's stop changes; per
 * frame one matrix per shown passenger. No allocation per frame.
 */
import * as T from 'three';
import {TRAIN_COUNT,TRAIN_CARS,TRAIN_STOPS,HEADWAY,LAP,DOOR_DELAY,DOOR_MOVE,type TrainState} from './trainSchedule';
import {SEAT_TABLE,NPC_SEATS,SEATS_PER_CAR,RIDER_ROOT_X,CAR_FLOOR_Y} from './trainRunning';
import {DOORS,BENCH_X,BENCH_FRONT,HALF_W,STRAP_X} from './trainCarModel';
import {STATION_NPCS,STATION_BOARDERS} from './stationNpcs';
import {SKIN_TONES,BODY_COLOURS} from './beanLooks';
import type {NpcDefinition,NpcTopic} from './npcDialogues';
import {createPassengerMesh} from '../graphics/trainPassengerMesh';

export const SEATED_SLOTS=5,STANDING_SLOTS=2,SLOTS_PER_CAR=SEATED_SLOTS+STANDING_SLOTS;
/** Draw ranges (m from the camera), talk reach (m), the per-car cap by heat tier (index: tier). */
export const SHOW_RANGE=120,DETAIL_RANGE=45,TALK_RANGE=2.4,TIER_CAP=[99,99,99,2,1] as const;
/** In the dwell (s after the train stops): the doors are open at DOORS_AT; leavers walk out OFF_FROM … +WALK_S, boarders on from
 *  ON_FROM … +WALK_S (the dwell is 14 s; the doors start closing at ~11 s). */
export const DOORS_AT=DOOR_DELAY+DOOR_MOVE,OFF_FROM=DOORS_AT+.3,ON_FROM=DOORS_AT+3.2,WALK_S=3.4;
const NST=TRAIN_STOPS.length;
type Prop='none'|'ball'|'scarf'|'bento'|'notebook';
const PROP_ID:Record<Prop,number>={none:0,ball:1,scarf:2,bento:3,notebook:4};
export type Passenger=NpcDefinition&{prop:Prop;kid?:boolean;shirt:string;accent:string;skinTone:number;/** a station islander who boards */boarder?:string};
// The fact pool: every station islander's two topics (Phase 4, sources in stationNpcs.ts), dealt two to each passenger.
const POOL:NpcTopic[]=STATION_NPCS.flatMap(n=>n.topics);
const deal=(i:number)=>[POOL[(i*2)%POOL.length],POOL[(i*2+7)%POOL.length]].map((t,k)=>({...t,id:`p${k}`}));
type CastRow=[name:string,role:string,character:'male'|'female',face:'warm'|'deep'|'light',prop:Prop,kid:boolean,skin:number,greeting:string,line:string];
const ROWS:CastRow[]=[
 ['Kenta','Commuter','male','light','none',false,1,'Morning! I read the match reports on this train every day. Want to hear a train and football fact?','Two more stops to work.'],
 ['Aiko','Commuter','female','warm','notebook',false,2,'I plan my week on this ride: work, training, and Saturday\'s game. Ask me something!','Notebook out, plan ready.'],
 ['Tomás','Kid with a ball','male','warm','ball',true,4,'I\'m going to the pitch! I keep my ball on my lap so it doesn\'t roll away.','One day I\'ll play in a big stadium.'],
 ['Sol','Fan in a scarf','female','deep','scarf',false,6,'Scarf on, off to the game! On match days this train is full of fans.','We sing on the way there and on the way back.'],
 ['Grandma Yuki','Grandparent with a bento','female','light','bento',false,0,'A station bento for the trip: rice, fish and a little pickle. Fancy a train fact while I eat?','Nothing tastes better than lunch on a train.'],
 ['Felix','Trainspotter','male','light','notebook',false,1,'Train FI 02, right on time! I note down every train. Want to hear a fact?','I have ridden every stop on this line.'],
 ['Nia','Student','female','deep','none',false,7,'I study on the train and watch highlights on the way home. Ask me anything!','Next stop is mine.'],
 ['Marco','Fan in a scarf','male','warm','scarf',false,3,'Away day! My team plays on the far side of the island today.','Win or lose, the trip is half the fun.'],
 ['Hana','Kid with a ball','female','light','ball',true,2,'My coach says I should juggle every day. I practise as soon as I get off!','I can do twenty keep-ups.'],
 ['Mr. Osei','Grandparent with a bento','male','deep','bento',false,6,'I have watched football for sixty years, and I always bring my lunch. Want to hear something?','Trains and football: two old friends.'],
 ['Priya','Commuter','female','warm','notebook',false,4,'I write down the scores from the weekend on my way to work. Ask me about trains and football!','The train is my quiet time.'],
 ['Leo','Fan in a scarf','male','light','scarf',true,3,'This is my first away game! Dad gave me his old scarf.','I hope we score early.'],
];
const SHIRTS=BODY_COLOURS,ACCENTS=['#c8352b','#2f5fb0','#f2c232','#2f8f5b','#7a3fb0','#e26d1f'] as const;
/** More riders of the same kinds (the type rows above give the role, prop, greeting): CAST holds SLOT_COUNT × CAST_PER_SLOT people. */
const NAMES=['Kenta','Aiko','Tomás','Sol','Grandma Yuki','Felix','Nia','Marco','Hana','Mr. Osei','Priya','Leo','Sara','Jun','Malik','Ruby','Grandpa Ike','Ines B.','Omar','Lily','Tariq','Ana','Kito','Emma',
 'Grandma Rosa','Yusuf','Mei','Dani','Zoe','Ravi','Ama','Theo','Nora','Grandpa Sam','Iris','Kwame','Lucía','Ben'] as const;
/** Every rider slot of a train (2 cars × SLOTS_PER_CAR) draws from its own CAST_PER_SLOT people (slot i: cast i, i + SLOT_COUNT, …):
 *  nobody can ride twice in one train, and a rider never changes into someone else without walking off. */
export const SLOT_COUNT=TRAIN_CARS*SLOTS_PER_CAR,CAST_PER_SLOT=3;
const BOARDER_FROM=SLOT_COUNT*CAST_PER_SLOT-STATION_BOARDERS.length;
export const CAST:readonly Passenger[]=Array.from({length:SLOT_COUNT*CAST_PER_SLOT},(_,i):Passenger=>{
 if(i>=BOARDER_FROM){const b=STATION_BOARDERS[i-BOARDER_FROM],n=STATION_NPCS.find(x=>x.id===b.id)!,bi=i-BOARDER_FROM;const prop:Prop=(['scarf','notebook','none','ball'] as const)[bi%4];
  return {...n,id:`pax-${b.id}`,x:0,z:0,prop,shirt:SHIRTS[(bi*3+2)%SHIRTS.length],accent:ACCENTS[(bi+2)%ACCENTS.length],skinTone:n.look?.skin??2,boarder:b.id};}
 const r=ROWS[(i*7)%ROWS.length],name=i<ROWS.length?ROWS[i][0]:NAMES[i%NAMES.length],row=i<ROWS.length?ROWS[i]:r,skin=(row[6]+Math.floor(i/ROWS.length)*3)%8;
 return {id:`pax-${i}`,name,role:row[1],character:row[2],face:row[3],clothing:(['classic','coast','sunset'] as const)[i%3],x:0,z:0,greeting:row[7],lines:[row[8]],topics:deal(i),prop:row[4],kid:row[5],
  skinTone:skin,shirt:SHIRTS[(i*5)%SHIRTS.length],accent:ACCENTS[i%ACCENTS.length],look:{skin},persona:`A ${row[1].toLowerCase()} riding the Island Line.`};});
// ---- the seeded roster (pure)
const hash=(...a:number[])=>{let h=2166136261>>>0;for(const v of a){h^=v&0xffff;h=Math.imul(h,16777619)>>>0;h^=v>>>16;h=Math.imul(h,16777619)>>>0;}h^=h>>>13;h=Math.imul(h,0x5bd1e995)>>>0;h^=h>>>15;return h>>>0;};
/** The lap number of train k's state st at clock `now` (s). */
export const lapOf=(k:number,now:number,t:number)=>Math.round((now+k*HEADWAY-t)/LAP);
/** Train k's "segment": lap × stops + the stops it has reached this lap, standing at a stop counting as having left it (the roster
 *  that rides on from there: the swap happens in the dwell, and leaving changes nothing). */
export function segOf(k:number,now:number,st:Pick<TrainState,'at'|'next'|'t'>){
 const d=st.at>=0?st.at+1:(TRAIN_STOPS[st.next].arrive<st.t?st.next+NST:st.next);return lapOf(k,now,st.t)*NST+d;}
export type Slot={on:boolean;cast:number;seat:number;standing:boolean};
/** Slot p of car c on train k in segment seg: who (cast index, from the slot's own people) sits in which SEAT_TABLE index, or
 *  nobody. Busy runs fill the strap spots. A station boarder rides only while `away` (else the slot's next person). */
export function slotAt(k:number,c:number,p:number,seg:number,out:Slot,away:(id:string)=>boolean=()=>true):Slot{
 const h0=hash(k,c,p,7),len=6+h0%4,off=(h0>>>4)%len,idn=Math.floor((seg+off)/len),hi=hash(k,c,p,idn,11),si=(c*SLOTS_PER_CAR+p+k*5)%SLOT_COUNT;
 out.standing=p>=SEATED_SLOTS;out.cast=-1;
 for(let m=0;m<CAST_PER_SLOT;m++){const ci=si+SLOT_COUNT*((hi+m)%CAST_PER_SLOT),b=CAST[ci].boarder;if(!b||away(b)){out.cast=ci;break;}}
 if(out.standing){const busy=hash(k,Math.floor(seg/NST),3)%3===0;out.on=busy&&(p===SEATED_SLOTS||hi%100<50);out.seat=-1;}
 else{out.on=hi%100<74;const own=NPC_SEATS.filter(i=>SEAT_TABLE[i].car===c);out.seat=own[(p*2+((hi>>>8)&1))%own.length];}
 return out;
}
/** Does slot p change rider as the train leaves the stop that starts segment seg? */
export const changesAt=(k:number,c:number,p:number,seg:number)=>{const h0=hash(k,c,p,7),len=6+h0%4,off=(h0>>>4)%len;return (seg+off)%len===0;};
export type Roster={seg:number;slots:Slot[];prev:Slot[]};
/** The whole train's roster for segment seg (and the one before: who walks off at this stop). `away(id)`: a station boarder rides
 *  only while away from their platform. */
export function rosterFor(k:number,seg:number,away:(id:string)=>boolean,out?:Roster):Roster{
 const mk=()=>Array.from({length:SLOT_COUNT},()=>({on:false,cast:-1,seat:-1,standing:false}));const r=out??{seg,slots:mk(),prev:mk()};r.seg=seg;
 for(let c=0;c<TRAIN_CARS;c++)for(let p=0;p<SLOTS_PER_CAR;p++){const i=c*SLOTS_PER_CAR+p;for(const [s,sg] of [[r.slots[i],seg],[r.prev[i],seg-1]] as const){slotAt(k,c,p,sg,s,away);if(s.cast<0)s.on=false;if(!s.on)s.cast=-1;}}
 return r;
}
/** Is SEAT_TABLE index i of train k taken by a passenger in roster r (the passengers occupy seats in the one seat table)? */
export const seatTaken=(r:Roster,i:number)=>r.slots.some(s=>s.on&&!s.standing&&s.seat===i);
/** The strap spot of standing slot q (0, 1) in a car: car-local x, z, facing yaw (across the aisle). */
export function strapSpot(q:number,out:{x:number;z:number;yaw:number}){const s=q?1:-1;out.x=-s*(STRAP_X-.28);out.z=q?DOORS[2]-.95:DOORS[0]+.95;out.yaw=s*Math.PI/2;return out;}

type Run={states:readonly TrainState[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4};
type Ports={away:(id:string)=>boolean};
const MAX=TRAIN_COUNT*TRAIN_CARS*SLOTS_PER_CAR+TRAIN_COUNT*4;// everyone + a few walking off
export function createTrainPassengers(scene:T.Scene,ports:Ports){
 let parts:ReturnType<typeof createPassengerMesh>|null=null;
 const rosters:(Roster|null)[]=Array.from({length:TRAIN_COUNT},()=>null),segs=new Float64Array(TRAIN_COUNT).fill(NaN);
 const m=new T.Matrix4(),mi=new T.Matrix4(),cm=new T.Matrix4(),q=new T.Quaternion(),e3=new T.Euler(),p3=new T.Vector3(),s3=new T.Vector3(1,1,1),c3=new T.Color(),fr=new T.Frustum(),pm=new T.Matrix4(),sph=new T.Sphere();
 const strap={x:0,z:0,yaw:0},cast=CAST.map(c=>({...c}));
 // the talkable passengers this frame (world spot), filled by update; nearest() reads it
 const talk:{cast:number;x:number;y:number;z:number;k:number}[]=Array.from({length:MAX},()=>({cast:-1,x:0,y:0,z:0,k:-1}));let nTalk=0,shown=0,hornK=-1,hornAt=-99;
 function build(){parts=createPassengerMesh(MAX);scene.add(parts.mesh);}
 /** Write instance n: car matrix × the local spot (x, z on the floor, yaw), lean (roll), look (yaw add), the passenger's look. */
 function put(n:number,ci:number,carM:T.Matrix4,x:number,z:number,yaw:number,roll:number,seated:boolean,armUp:boolean,fade:number){
  const P=parts!,c=CAST[ci];e3.set(0,yaw,roll,'YXZ');q.setFromEuler(e3);p3.set(x,CAR_FLOOR_Y,z);s3.setScalar(1);mi.compose(p3,q,s3);m.multiplyMatrices(carM,mi);P.mesh.setMatrixAt(n,m);
  c3.set(c.shirt).toArray(P.shirt.array as Float32Array,n*3);c3.set(SKIN_TONES[c.skinTone%SKIN_TONES.length]).toArray(P.skin.array as Float32Array,n*3);c3.set(c.accent).toArray(P.accent.array as Float32Array,n*3);
  const f=P.flags.array as Float32Array;f[n*4]=seated?1:0;f[n*4+1]=PROP_ID[c.prop];f[n*4+2]=armUp?1:0;f[n*4+3]=(c.kid?.8:1)*fade;
 }
 return {
  /** Every frame (after the trains moved). ridingK: the train I ride (-1); tier: effectiveTier; reduced: prefers-reduced-motion. */
  update(run:Run|null,now:number,camera:T.Camera,ridingK:number,tier:number,reduced:boolean){
   nTalk=0;shown=0;if(!run){if(parts)parts.mesh.visible=false;return;}
   camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
   const cx=camera.matrixWorld.elements[12],cy=camera.matrixWorld.elements[13],cz=camera.matrixWorld.elements[14],cap=TIER_CAP[Math.max(0,Math.min(4,tier))];let n=0;
   for(let k=0;k<TRAIN_COUNT&&k<run.states.length;k++){const st=run.states[k];
    // heat gate: the ridden train always; others only within SHOW_RANGE, on screen, and within DETAIL_RANGE (else nobody shows)
    run.carMatrixOf(k,0,cm);const e=cm.elements;run.carMatrixOf(k,1,m);const f=m.elements;sph.center.set((e[12]+f[12])/2,(e[13]+f[13])/2,(e[14]+f[14])/2);sph.radius=14;
    const d=sph.center.distanceTo(p3.set(cx,cy,cz));if(k!==ridingK&&(d>Math.min(SHOW_RANGE,DETAIL_RANGE)||!fr.intersectsSphere(sph)))continue;
    const seg=segOf(k,now,st);let r=rosters[k];if(!r||segs[k]!==seg){r=rosters[k]=rosterFor(k,seg,ports.away,r??undefined);segs[k]=seg;}
    const atStop=st.at>=0,dw=atStop?(TRAIN_STOPS[st.at].depart-TRAIN_STOPS[st.at].arrive)-st.dwellLeft:-1,pside=atStop?TRAIN_STOPS[st.at].station.side:1;
    const glance=!reduced&&hornK===k&&now-hornAt<1.6;
    for(let c=0;c<TRAIN_CARS;c++){run.carMatrixOf(k,c,cm);const ce=cm.elements,roll=reduced?0:Math.max(-.12,Math.min(.12,-ce[1]*1.6)),psx=pside*(c%2?-1:1);let inCar=0;
     for(let p=0;p<SLOTS_PER_CAR;p++){const i=c*SLOTS_PER_CAR+p,now_=r.slots[i],was=r.prev[i];
      // at a stop, the slots that change: the old rider walks off first, then the new one walks on (in the doors' open time)
      const swapping=atStop&&dw>=0&&changesAt(k,c,p,seg)&&(was.on||now_.on)&&(was.cast!==now_.cast||was.on!==now_.on);
      let who=now_,phase=-1,boarding=false;// phase: 0…1 walking (off: seat → door → out; on: out → door → seat)
      if(swapping){if(dw<ON_FROM){who=was;phase=dw<OFF_FROM?-1:Math.min(1,(dw-OFF_FROM)/WALK_S);if(phase>=1)continue;}
       else{who=now_;phase=Math.min(1,(dw-ON_FROM)/WALK_S);phase=phase>=1?-1:1-phase;boarding=phase>=0;}}
      if(!who.on||who.cast<0)continue;if(++inCar>cap)continue;if(n>=MAX)break;
      // the rider's resting spot: on the bench (root RIDER_ROOT_X out, the bean sits with its hips at the bench, facing the aisle) or at a strap
      let x:number,z:number,yaw:number,seated=!who.standing,arm=who.standing;
      if(who.standing){strapSpot(p-SEATED_SLOTS,strap);x=strap.x;z=strap.z;yaw=strap.yaw;}
      else{const s=SEAT_TABLE[who.seat];x=s.side*(BENCH_X-.02);z=s.z;yaw=s.side>0?-Math.PI/2:Math.PI/2;}
      // reactions: a look out of the window now and then (a seeded ~11 s rhythm), a glance toward the cab (+z) at the horn
      if(!reduced&&phase<0){const lk=Math.sin(now*.57+i*2.3+k*1.7);if(lk>.82)yaw+=(seated?.9:.4)*Math.sign(Math.sin(i*1.9+k));}
      if(glance&&phase<0)yaw+=(yaw>0?-1:1)*.5*(c%2?-1:1);
      let fade=1;
      if(phase>=0){// walking: seat / strap → the aisle by the nearest door → that door → 1.4 m out onto the platform (fading there)
       let dz=DOORS[0];for(const dd of DOORS)if(Math.abs(dd-z)<Math.abs(dz-z))dz=dd;
       const pts=[x,z,psx*.35,dz,psx*(HALF_W-.1),dz,psx*(HALF_W+1.4),dz],seg3=Math.min(2.999,phase*3),i3=Math.floor(seg3),u=seg3-i3;
       const ax=pts[i3*2],az=pts[i3*2+1],bx=pts[i3*2+2],bz=pts[i3*2+3];x=ax+(bx-ax)*u;z=az+(bz-az)*u;yaw=Math.atan2(bx-ax,bz-az)+(boarding?Math.PI:0);seated=false;arm=false;
       fade=phase>.85?Math.max(.05,(1-phase)/.15):1;}
      if(!parts)build();put(n,who.cast,cm,x,z,yaw,roll,seated,arm,fade);
      if(phase<0&&n<talk.length){p3.set(x,CAR_FLOOR_Y,z).applyMatrix4(cm);const t=talk[nTalk++];t.cast=who.cast;t.x=p3.x;t.y=p3.y;t.z=p3.z;t.k=k;}
      n++;}}}
   shown=n;if(!n){if(parts)parts.mesh.visible=false;return;}
   if(!parts)build();const P=parts!;P.mesh.count=n;P.mesh.visible=true;P.mesh.instanceMatrix.needsUpdate=true;P.shirt.needsUpdate=P.skin.needsUpdate=P.accent.needsUpdate=P.flags.needsUpdate=true;
   void RIDER_ROOT_X;void BENCH_FRONT;void SEATS_PER_CAR;
  },
  /** The horn sounded on train k (a glance toward the cab). */
  horn(k:number,now:number){hornK=k;hornAt=now;},
  /** The passenger to talk to while riding train k: the nearest within TALK_RANGE of (x, z) (its NpcDefinition, at its spot). */
  nearest(k:number,x:number,z:number):NpcDefinition|null{
   if(k<0)return null;let best=-1,bd=TALK_RANGE;for(let i=0;i<nTalk;i++){const t=talk[i];if(t.k!==k)continue;const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;best=i;}}
   if(best<0)return null;const t=talk[best],def=cast[t.cast];def.x=t.x;def.z=t.z;return def;},
  /** Tests / checks: passengers drawn this frame, the roster of train k (null until it was near). */
  get shown(){return shown;},roster(k:number){return rosters[k];},
  dispose(){parts?.dispose();parts=null;},
 };
}
export type TrainPassengers=ReturnType<typeof createTrainPassengers>;
