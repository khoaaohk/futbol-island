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
 *  - The look (Nov 24 2026, owner: "the npcs don't look good"): every rider is an island bean character, drawn with the islanders'
 *    own bean skin (lib/graphics/trainPassengerMesh.ts): npcDress looks (the station islanders keep their exact platform look),
 *    hair styles and colours, caps / beanies / bucket hats, island team scarves, grey-haired grandparents, kids at kid height.
 *    Seated: the island bench pose (bottom on the seat, thighs along it, lower legs down), hands on the lap or round a bento /
 *    ball / bag, a phone, a newspaper or notebook held up; standing: a hand up on the strap (a phone in the other), kids hold
 *    their ball; walking on / off with a small step bob.
 *  - Small reactions (the neck, like the islanders' gaze; not with reduced motion): a look along the car now and then, a sway on
 *    curves, a glance toward the cab when the horn sounds; a dozer keeps the head down.
 * Heat (AGENTS.md): at most 5 instanced draws for every passenger on every train (bean body, limbs, hair, hat, props; the islanders'
 * shared geometry and programs; built on first sight, no shadows); only trains within SHOW_RANGE m and on screen; beyond
 * DETAIL_RANGE (and not ridden) nobody is drawn, beyond NEAR_RANGE bodies and heads only; hot tiers cap the riders a car (tier 3:
 * 2, the lowest tier: 1). Roster work only when a train's stop changes; per frame one matrix per shown passenger; the pose rows
 * are re-uploaded only when a rider, pose or gaze changes. No allocation per frame.
 */
import * as T from 'three';
import {TRAIN_COUNT,TRAIN_CARS,TRAIN_STOPS,HEADWAY,LAP,DOOR_DELAY,DOOR_MOVE,type TrainState} from './trainSchedule';
import {SEAT_TABLE,NPC_SEATS,SEATS_PER_CAR,RIDER_ROOT_X,CAR_FLOOR_Y} from './trainRunning';
import {DOORS,BENCH_X,BENCH_FRONT,BENCH_BACK,BENCHES,HALF_W,STRAP_X} from './trainCarModel';
import {BENCH} from '../graphics/npcSeatPose';
import {STATION_NPCS,STATION_BOARDERS} from './stationNpcs';
import {TEAM_PALETTES,npcDress,type NpcLookOverride} from './beanLooks';
import type {NpcDefinition,NpcTopic} from './npcDialogues';
import {bakeSteps,createPassengerMesh,paxPoseFor,propMask,PAX_GAZE_PITCH,PAX_KID_SCALE,PAX_POSES,PAX_STRAP_HAND,PAX_SEAT_BACK,type PaxBaked,type PaxLook,type PaxProp,type PassengerMesh} from '../graphics/trainPassengerMesh';

export const SEATED_SLOTS=5,STANDING_SLOTS=2,SLOTS_PER_CAR=SEATED_SLOTS+STANDING_SLOTS;
/** Draw ranges (m from the camera), talk reach (m), the per-car cap by heat tier (index: tier). */
export const SHOW_RANGE=120,DETAIL_RANGE=45,TALK_RANGE=2.4,TIER_CAP=[99,99,99,2,1] as const;
/** From this heat tier up (hot / low) the hat draw is skipped (cost trim Nov 24; hair still draws). */
export const HAT_TIER=3;
/** In the dwell (s after the train stops): the doors are open at DOORS_AT; leavers walk out OFF_FROM … +WALK_S, boarders on from
 *  ON_FROM … +WALK_S (the dwell is 14 s; the doors start closing at ~11 s). */
export const DOORS_AT=DOOR_DELAY+DOOR_MOVE,OFF_FROM=DOORS_AT+.3,ON_FROM=DOORS_AT+3.2,WALK_S=3.4;
const NST=TRAIN_STOPS.length;
/** A rider's main prop (tests, talk) and the full list they carry (lib/graphics/trainPassengerMesh.ts PAX_PROP). */
type Prop='none'|PaxProp;
export type Passenger=NpcDefinition&{prop:Prop;props:readonly PaxProp[];kid?:boolean;/** dozing: eyes shut, head down, no look-around */doze?:boolean;
 /** the bean look the mesh draws (the islanders' npcDress + the rider's own touches) */pax:PaxLook;/** a station islander who boards */boarder?:string};
// The fact pool: every station islander's two topics (Phase 4, sources in stationNpcs.ts), dealt two to each passenger.
const POOL:NpcTopic[]=STATION_NPCS.flatMap(n=>n.topics);
const deal=(i:number)=>[POOL[(i*2)%POOL.length],POOL[(i*2+7)%POOL.length]].map((t,k)=>({...t,id:`p${k}`}));
type Age='adult'|'kid'|'elder';
type CastRow=[name:string,role:string,character:'male'|'female',face:'warm'|'deep'|'light',props:PaxProp[],age:Age,skin:number,greeting:string,line:string];
const ROWS:CastRow[]=[
 ['Kenta','Commuter','male','light',['paper'],'adult',1,'Morning! I read the match reports on this train every day. Want to hear a train and football fact?','Two more stops to work.'],
 ['Aiko','Commuter','female','warm',['notebook','bag'],'adult',2,'I plan my week on this ride: work, training, and Saturday\'s game. Ask me something!','Notebook out, plan ready.'],
 ['Tomás','Kid with a ball','male','warm',['ball'],'kid',4,'I\'m going to the pitch! I keep my ball on my lap so it doesn\'t roll away.','One day I\'ll play in a big stadium.'],
 ['Sol','Fan in a scarf','female','deep',['scarf','phone'],'adult',6,'Scarf on, off to the game! On match days this train is full of fans.','We sing on the way there and on the way back.'],
 ['Grandma Yuki','Grandparent with a bento','female','light',['bento'],'elder',0,'A station bento for the trip: rice, fish and a little pickle. Fancy a train fact while I eat?','Nothing tastes better than lunch on a train.'],
 ['Felix','Trainspotter','male','light',['notebook','camera'],'adult',1,'Train FI 02, right on time! I note down every train. Want to hear a fact?','I have ridden every stop on this line.'],
 ['Nia','Student','female','deep',['phone','bag'],'adult',7,'I study on the train and watch highlights on the way home. Ask me anything!','Next stop is mine.'],
 ['Marco','Fan in a scarf','male','warm',['scarf'],'adult',3,'Away day! My team plays on the far side of the island today.','Win or lose, the trip is half the fun.'],
 ['Hana','Kid with a ball','female','light',['ball'],'kid',2,'My coach says I should juggle every day. I practise as soon as I get off!','I can do twenty keep-ups.'],
 ['Mr. Osei','Grandparent with a bento','male','deep',['bento'],'elder',6,'I have watched football for sixty years, and I always bring my lunch. Want to hear something?','Trains and football: two old friends.'],
 ['Priya','Commuter','female','warm',['notebook'],'adult',4,'I write down the scores from the weekend on my way to work. Ask me about trains and football!','The train is my quiet time.'],
 ['Leo','Fan in a scarf','male','light',['scarf'],'kid',3,'This is my first away game! Dad gave me his old scarf.','I hope we score early.'],
];
/** More riders of the same kinds (the type rows above give the role, greeting): CAST holds SLOT_COUNT × CAST_PER_SLOT people. Names
 *  by age, so a grandparent row never gets a kid's name. */
const NAMES:Record<Age,readonly [string,'male'|'female'][]>={
 adult:[['Sara','female'],['Jun','male'],['Malik','male'],['Ruby','female'],['Omar','male'],['Lily','female'],['Tariq','male'],['Ana','female'],['Emma','female'],['Yusuf','male'],
  ['Dani','female'],['Ravi','male'],['Ama','female'],['Nora','female'],['Kwame','male'],['Lucía','female'],['Ben','male'],['Iris','female']],
 kid:[['Kito','male'],['Zoe','female'],['Theo','male'],['Mei','female'],['Sami','male']],
 elder:[['Grandma Rosa','female'],['Grandpa Ike','male'],['Grandpa Sam','male'],['Nana Efua','female']],
};
/** The extra riders' own props by kind (cycled), so two commuters or two students don't carry the same things. */
const PROP_SETS:Record<string,readonly PaxProp[][]>={
 'Commuter':[['phone'],['paper'],['phone','bag'],[],['notebook']],
 'Student':[['phone','bag'],['notebook','bag'],['phone']],
 'Fan in a scarf':[['scarf'],['scarf','phone'],['scarf','bag']],
 'Grandparent with a bento':[['bento'],['paper'],['bento']],
 'Trainspotter':[['notebook','camera'],['camera','bag'],['notebook','camera']],
 'Kid with a ball':[['ball'],['ball'],['ball','scarf']],
};
const GREY_HAIR=['#cfcac2','#e8e4dc','#a8a39a','#bdb6aa'] as const,BAG_COLOURS=['#2f5fb0','#c8352b','#2f8f5b','#e26d1f','#3a3f48','#7a3fb0','#d9a441'] as const,COVER_COLOURS=['#e26d1f','#2f8f5b','#2f5fb0','#c8352b'] as const;
/** The bean look: the islanders' own npcDress (so riders match the people on the platforms), then the rider's touches: grey hair
 *  for grandparents, a fan's shirt, scarf and hat in one island team's colours (TEAM_PALETTES), a kid's cap, a dozer's shut eyes. */
function paxLook(id:string,role:string,character:'male'|'female',face:'warm'|'deep'|'light',age:Age,props:readonly PaxProp[],i:number,override:NpcLookOverride|undefined,doze:boolean):PaxLook{
 const team=TEAM_PALETTES[i%TEAM_PALETTES.length].kit,o:NpcLookOverride={...override};
 if(age==='elder'){o.hairColor=o.hairColor??GREY_HAIR[i%GREY_HAIR.length];o.hair=o.hair??(['bun','crop','none','curls'] as const)[i%4];if(o.headwear===undefined)o.headwear=(['bucket','none','cap','none'] as const)[i%4];}
 if(age==='kid'&&o.headwear===undefined)o.headwear=(['cap','none','none'] as const)[i%3];
 if(role==='Trainspotter'&&o.headwear===undefined)o.headwear=(['bucket','cap','none'] as const)[i%3];
 if(role==='Student'&&o.headwear===undefined)o.headwear=(['beanie','headband','none','none'] as const)[i%4];
 if(role==='Commuter'&&o.headwear===undefined)o.headwear='none';
 if(o.build===undefined)o.build=age==='kid'?'regular':(['regular','tall','regular','wide','short'] as const)[i%5];
 const d=npcDress({id,role,character,face,look:o});
 const fan=props.includes('scarf');
 if(fan&&role==='Fan in a scarf'){d.outfit={...d.outfit,shirt:team.shirt,shirt2:team.shirt2};if(i%3!==2){d.look.headwear=i%3?'beanie':'cap';d.look.headwearColor=team.shirt;d.look.headwearColor2=team.shirt2;}}
 if(doze)d.look.eyes='sleepy';else if(age==='kid')d.look.eyes=i%2?'happy':'dots';
 const bag=BAG_COLOURS[(i*3)%BAG_COLOURS.length],propA=fan?team.shirt:props.includes('notebook')?COVER_COLOURS[i%COVER_COLOURS.length]:props.includes('bento')?'#c8352b':bag;
 const propB=fan?team.shirt2:props.includes('bento')?'#f2c232':'#f2eee2';
 return {look:d.look,outfit:d.outfit,kid:age==='kid',props:propMask(props),propA,propB};
}
/** Every rider slot of a train (2 cars × SLOTS_PER_CAR) draws from its own CAST_PER_SLOT people (slot i: cast i, i + SLOT_COUNT, …):
 *  nobody can ride twice in one train, and a rider never changes into someone else without walking off. */
export const SLOT_COUNT=TRAIN_CARS*SLOTS_PER_CAR,CAST_PER_SLOT=3;
const BOARDER_FROM=SLOT_COUNT*CAST_PER_SLOT-STATION_BOARDERS.length;
const used:Record<Age,number>={adult:0,kid:0,elder:0};
export const CAST:readonly Passenger[]=Array.from({length:SLOT_COUNT*CAST_PER_SLOT},(_,i):Passenger=>{
 if(i>=BOARDER_FROM){const b=STATION_BOARDERS[i-BOARDER_FROM],n=STATION_NPCS.find(x=>x.id===b.id)!,bi=i-BOARDER_FROM;const props:PaxProp[]=([['scarf'],['notebook'],['phone'],['ball']] as PaxProp[][])[bi%4];
  // a station islander keeps the exact look they have on their platform (npcDress of their definition)
  const d=npcDress(n),team=TEAM_PALETTES[(bi+2)%TEAM_PALETTES.length].kit,age:Age=n.age==='kid'?'kid':n.age==='elder'?'elder':'adult';
  const pax:PaxLook={look:d.look,outfit:d.outfit,kid:age==='kid',props:propMask(props),propA:props[0]==='scarf'?team.shirt:BAG_COLOURS[bi%BAG_COLOURS.length],propB:props[0]==='scarf'?team.shirt2:'#f2eee2'};
  return {...n,id:`pax-${b.id}`,x:0,z:0,prop:props[0],props,kid:age==='kid',pax,boarder:b.id};}
 const own=i<ROWS.length,row=own?ROWS[i]:ROWS[(i*7)%ROWS.length],age=row[5];
 let name=row[0],character=row[2];if(!own){const pool=NAMES[age],e=pool[used[age]++%pool.length];name=e[0];character=e[1];}
 const sets=PROP_SETS[row[1]],props=own?row[4]:sets[Math.floor(i/ROWS.length)%sets.length],doze=props.length===0,skin=(row[6]+Math.floor(i/ROWS.length)*3)%8;
 const look:NpcLookOverride={skin},pax=paxLook(`pax-${i}`,row[1],character,row[3],age,props,i,look,doze);
 return {id:`pax-${i}`,name,role:row[1],character,face:row[3],clothing:(['classic','coast','sunset'] as const)[i%3],x:0,z:0,greeting:row[7],lines:[row[8]],topics:deal(i),
  prop:props[0]??'none',props,kid:age==='kid',doze,pax,look,age:age==='adult'?undefined:age,persona:`A ${row[1].toLowerCase()} riding the Island Line.`};});
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
/** The strap handles along each rail (car-local z: trainCarModel's strap loops, n per bench). */
const STRAP_ZS=BENCHES.flatMap(([a,b])=>{const n=Math.max(1,Math.round((b-a)/.6));return Array.from({length:n},(_,k)=>a+(k+.5)*(b-a)/n);});
const nearestStrap=(z:number)=>STRAP_ZS.reduce((best,v)=>Math.abs(v-z)<Math.abs(best-z)?v:best,STRAP_ZS[0]);
/** The strap spot of standing slot q (0, 1) in a car: car-local x, z, facing yaw. The rider faces the bench on that side (the
 *  usual commuter stance), the strap hand (PAX_STRAP_HAND, the rig's +x hand) closing on the handle nearest the door bay. */
export function strapSpot(q:number,out:{x:number;z:number;yaw:number}){const s=q?1:-1,H=PAX_STRAP_HAND;
 out.x=s*(STRAP_X-H.z);out.z=nearestStrap(q?DOORS[2]-.95:DOORS[0]+.95)+s*H.x;out.yaw=s*Math.PI/2;return out;}
/** A seated rider's root: on the floor in front of the bench, as far from the backrest face as the island bench's (npcSeatPose
 *  BENCH: back face −.205, root +.05), so the island's seated pose fits this bench too (seat top .64 over the floor on both). */
export const SEAT_ROOT_X=BENCH_BACK-(BENCH.rootZ-BENCH.backFace);
/** Beyond NEAR_RANGE m (and not the train I ride) a passenger draws its body and head only (no limbs / props): behind a window at
 *  that range they don't read, and they are the bulk of the triangles. */
export const NEAR_RANGE=28;
const PASSES=[2,1] as const;// near trains first, then the far ones

type Run={states:readonly TrainState[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4};
type Ports={away:(id:string)=>boolean};
const MAX=TRAIN_COUNT*TRAIN_CARS*SLOTS_PER_CAR+TRAIN_COUNT*4;// everyone + a few walking off
export function createTrainPassengers(scene:T.Scene,ports:Ports){
 let parts:PassengerMesh|null=null;
 const rosters:(Roster|null)[]=Array.from({length:TRAIN_COUNT},()=>null),segs=new Float64Array(TRAIN_COUNT).fill(NaN);
 const m=new T.Matrix4(),m2=new T.Matrix4(),mi=new T.Matrix4(),cm=new T.Matrix4(),q=new T.Quaternion(),e3=new T.Euler(),p3=new T.Vector3(),s3=new T.Vector3(1,1,1),fr=new T.Frustum(),pm=new T.Matrix4(),sph=new T.Sphere();
 const strap={x:0,z:0,yaw:0},cast=CAST.map(c=>({...c}));
 // each slot's neck gaze (eased toward the reaction's target; written to the pose row only when it moved)
 const gazeP=new Float32Array(TRAIN_COUNT*SLOT_COUNT),gazeY=new Float32Array(TRAIN_COUNT*SLOT_COUNT),near=new Uint8Array(TRAIN_COUNT),dist=new Float32Array(TRAIN_COUNT);
 // the talkable passengers this frame (world spot), filled by update; nearest() reads it
 const talk:{cast:number;x:number;y:number;z:number;k:number}[]=Array.from({length:MAX},()=>({cast:-1,x:0,y:0,z:0,k:-1}));let nTalk=0,shown=0,hornK=-1,hornAt=-99,lastNow=NaN;
 // the pose bake (~90 ms) runs in idle slices from load (cost trim Nov 24), long before a train is near; if a train is needed first
 // the rest of it runs at once (the old first-sight path). No idle callback (Node tests): baked on first sight as before.
 const looks=CAST.map(c=>c.pax),baker=bakeSteps(looks);let baked:PaxBaked|null=null,idleId=0;
 const step=()=>{if(!baked){const r=baker.next();if(r.done)baked=r.value;}return baked!==null;};
 type Idle={requestIdleCallback?:(cb:(d:{timeRemaining():number})=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
 const g=globalThis as Idle;
 const slice=(d:{timeRemaining():number})=>{idleId=0;if(parts)return;while(!step()&&d.timeRemaining()>6){/* one pose per step */}if(!baked)idleId=g.requestIdleCallback!(slice,{timeout:4000});};
 if(typeof g.requestIdleCallback==='function')idleId=g.requestIdleCallback(slice,{timeout:6000});
 function build(){while(!step()){/* finish the bake now */}if(idleId)g.cancelIdleCallback?.(idleId);idleId=0;parts=createPassengerMesh(MAX,looks,baked!);scene.add(parts.group);}
 /** Instance n: car matrix × the local spot (x, z on the floor, yaw), lean (roll), the rider's bake, scale (kid, fade), gaze. */
 function put(n:number,ci:number,carM:T.Matrix4,x:number,y:number,z:number,yaw:number,roll:number,bake:number,scale:number,gp:number,gy:number){
  e3.set(0,yaw,roll,'YXZ');q.setFromEuler(e3);p3.set(x,CAR_FLOOR_Y+y,z);s3.setScalar(scale);mi.compose(p3,q,s3);m2.multiplyMatrices(carM,mi);parts!.set(n,ci,bake,m2,gp,gy);
 }
 return {
  /** Every frame (after the trains moved). ridingK: the train I ride (-1); tier: effectiveTier; reduced: prefers-reduced-motion. */
  update(run:Run|null,now:number,camera:T.Camera,ridingK:number,tier:number,reduced:boolean){
   nTalk=0;shown=0;const dt=Number.isFinite(lastNow)?Math.max(0,Math.min(.1,now-lastNow)):0;lastNow=now;
   if(!run){parts?.commit(0,0);return;}
   camera.updateMatrixWorld();pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm);
   const cx=camera.matrixWorld.elements[12],cy=camera.matrixWorld.elements[13],cz=camera.matrixWorld.elements[14],cap=TIER_CAP[Math.max(0,Math.min(4,tier))];let n=0;
   // heat gate: the ridden train always; others only on screen and within DETAIL_RANGE (else nobody shows); full detail only for the
   // ridden train and trains within NEAR_RANGE (drawn first: the limbs / props draw the first nNear instances)
   for(let k=0;k<TRAIN_COUNT&&k<run.states.length;k++){
    run.carMatrixOf(k,0,cm);const e=cm.elements;run.carMatrixOf(k,1,m);const f=m.elements;sph.center.set((e[12]+f[12])/2,(e[13]+f[13])/2,(e[14]+f[14])/2);sph.radius=14;
    const d=sph.center.distanceTo(p3.set(cx,cy,cz));dist[k]=d;near[k]=k===ridingK||(d<=Math.min(SHOW_RANGE,DETAIL_RANGE)&&fr.intersectsSphere(sph))?(k===ridingK||d<NEAR_RANGE?2:1):0;}
   let nNear=0;
   for(const pass of PASSES)for(let k=0;k<TRAIN_COUNT&&k<run.states.length;k++){if(near[k]!==pass)continue;const st=run.states[k],full=pass===2;
    const seg=segOf(k,now,st);let r=rosters[k];if(!r||segs[k]!==seg){r=rosters[k]=rosterFor(k,seg,ports.away,r??undefined);segs[k]=seg;}
    const atStop=st.at>=0,dw=atStop?(TRAIN_STOPS[st.at].depart-TRAIN_STOPS[st.at].arrive)-st.dwellLeft:-1,pside=atStop?TRAIN_STOPS[st.at].station.side:1;
    const glance=!reduced&&hornK===k&&now-hornAt<1.6;
    for(let c=0;c<TRAIN_CARS;c++){run.carMatrixOf(k,c,cm);const ce=cm.elements,roll=reduced?0:Math.max(-.12,Math.min(.12,-ce[1]*1.6)),psx=pside*(c%2?-1:1);let inCar=0;
     for(let p=0;p<SLOTS_PER_CAR;p++){const i=c*SLOTS_PER_CAR+p,gi=k*SLOT_COUNT+i,now_=r.slots[i],was=r.prev[i];
      // at a stop, the slots that change: the old rider walks off first, then the new one walks on (in the doors' open time)
      const swapping=atStop&&dw>=0&&changesAt(k,c,p,seg)&&(was.on||now_.on)&&(was.cast!==now_.cast||was.on!==now_.on);
      let who=now_,phase=-1,boarding=false;// phase: 0…1 walking (off: seat → door → out; on: out → door → seat)
      if(swapping){if(dw<ON_FROM){who=was;phase=dw<OFF_FROM?-1:Math.min(1,(dw-OFF_FROM)/WALK_S);if(phase>=1)continue;}
       else{who=now_;phase=Math.min(1,(dw-ON_FROM)/WALK_S);phase=phase>=1?-1:1-phase;boarding=phase>=0;}}
      if(!who.on||who.cast<0)continue;if(++inCar>cap)continue;if(n>=MAX)break;
      const P=CAST[who.cast],kid=!!P.kid,mask=P.pax.props;
      // the rider's resting spot: on the bench (root SEAT_ROOT_X out, facing the aisle) or at a strap (facing that bench)
      let x:number,z:number,yaw:number,seated=!who.standing,y=0;
      if(who.standing){strapSpot(p-SEATED_SLOTS,strap);x=strap.x;z=strap.z;yaw=strap.yaw;}
      else{const s=SEAT_TABLE[who.seat];x=s.side*(SEAT_ROOT_X+PAX_SEAT_BACK[P.pax.look.build]*(kid?PAX_KID_SCALE:1));z=s.z;yaw=s.side>0?-Math.PI/2:Math.PI/2;}
      let bake=paxPoseFor(mask,seated,kid,false);
      // reactions (the neck, as the islanders' gaze): a look along the car now and then (a seeded ~11 s rhythm; the body turns a
      // little too when standing), a glance toward the cab (+z of car 0) at the horn; a dozer keeps the head down
      let tp=PAX_GAZE_PITCH[bake%PAX_POSES]+(P.doze?.32:0),ty=0;
      if(!reduced&&phase<0&&!P.doze){const lk=Math.sin(now*.57+i*2.3+k*1.7);if(lk>.82){ty=.48*Math.sign(Math.sin(i*1.9+k)||1);tp-=.12;if(!seated)yaw+=.35*Math.sign(ty);}}
      if(glance&&phase<0&&!P.doze){const cabX=c%2?-1:1;ty=.5*Math.sign(-Math.sin(yaw)*cabX||1);tp=Math.min(tp,.05);}
      let fade=1;
      if(phase>=0){// walking: seat / strap → the aisle by the nearest door → that door → 1.4 m out onto the platform (fading there)
       let dz=DOORS[0];for(const dd of DOORS)if(Math.abs(dd-z)<Math.abs(dz-z))dz=dd;
       const pts=[x,z,psx*.35,dz,psx*(HALF_W-.1),dz,psx*(HALF_W+1.4),dz],seg3=Math.min(2.999,phase*3),i3=Math.floor(seg3),u=seg3-i3;
       const ax=pts[i3*2],az=pts[i3*2+1],bx=pts[i3*2+2],bz=pts[i3*2+3];x=ax+(bx-ax)*u;z=az+(bz-az)*u;yaw=Math.atan2(bx-ax,bz-az)+(boarding?Math.PI:0);seated=false;
       bake=paxPoseFor(mask,false,kid,true);tp=0;ty=0;y=reduced?0:Math.abs(Math.sin(phase*WALK_S*Math.PI*1.8))*.035;
       fade=phase>.85?Math.max(.05,(1-phase)/.15):1;}
      const ease=Math.min(1,dt*5);gazeP[gi]+=(tp-gazeP[gi])*ease;gazeY[gi]+=(ty-gazeY[gi])*ease;if(phase>=0||!dt){gazeP[gi]=tp;gazeY[gi]=ty;}
      if(!parts)build();put(n,who.cast,cm,x,y,z,yaw,roll,bake,(kid?PAX_KID_SCALE:1)*fade,gazeP[gi],gazeY[gi]);
      if(phase<0&&n<talk.length){p3.set(x,CAR_FLOOR_Y,z).applyMatrix4(cm);const t=talk[nTalk++];t.cast=who.cast;t.x=p3.x;t.y=p3.y;t.z=p3.z;t.k=k;}
      n++;if(full)nNear=n;}}}
   shown=n;parts?.commit(n,nNear,tier<HAT_TIER);
   void RIDER_ROOT_X;void BENCH_FRONT;void SEATS_PER_CAR;void BENCH_X;
  },
  /** The horn sounded on train k (a glance toward the cab). */
  horn(k:number,now:number){hornK=k;hornAt=now;},
  /** The passenger to talk to while riding train k: the nearest within TALK_RANGE of (x, z) (its NpcDefinition, at its spot). */
  nearest(k:number,x:number,z:number):NpcDefinition|null{
   if(k<0)return null;let best=-1,bd=TALK_RANGE;for(let i=0;i<nTalk;i++){const t=talk[i];if(t.k!==k)continue;const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;best=i;}}
   if(best<0)return null;const t=talk[best],def=cast[t.cast];def.x=t.x;def.z=t.z;return def;},
  /** Tests / checks: passengers drawn this frame, the roster of train k (null until it was near), the mesh parts (null until built). */
  get shown(){return shown;},roster(k:number){return rosters[k];},get parts(){return parts;},
  dispose(){if(idleId)g.cancelIdleCallback?.(idleId);idleId=0;if(!parts)baker.return(undefined as never);parts?.dispose();parts=null;},
 };
}
export type TrainPassengers=ReturnType<typeof createTrainPassengers>;
