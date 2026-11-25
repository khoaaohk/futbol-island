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
/** Near-camera fade (m): a passenger whose body column is this close to the camera is not drawn (hysteresis). AAA 2 (RIDE 3's
 *  open note: a strap hanger 0.8-1 m in front of the first-person eye filled the screen): wider than lib/town/trainRide.ts FADE_NEAR /
 *  FADE_FAR (0.75 / 1.1, me and Kenji), so a passenger right in front of you in the aisle steps out of the picture. */
export const PAX_FADE_NEAR=1.05,PAX_FADE_FAR=1.4;
const FADE_NEAR=PAX_FADE_NEAR,FADE_FAR=PAX_FADE_FAR;
import {DOORS,BENCH_X,BENCH_FRONT,BENCH_BACK,BENCHES,HALF_W,STRAP_X} from './trainCarModel';
import {BENCH} from '../graphics/npcSeatPose';
import {STATION_NPCS,STATION_BOARDERS} from './stationNpcs';
import {STADIUM} from './westParkLayout';
import {TRAIN_STATIONS,trackAt,leftNormal} from './trainTrack';
import {TEAM_PALETTES,npcDress,type NpcLookOverride} from './beanLooks';
import type {NpcDefinition,NpcTopic} from './npcDialogues';
import {bakeSteps,createPassengerMesh,paxPoseFor,paxExtra,paxWalk,propMask,PAX_EXTRA,PAX_PROP,PAX_POSE,PAX_STRIDE,PAX_WALK_FRAMES,PAX_GAZE_PITCH,PAX_KID_SCALE,PAX_POSES,PAX_STRAP_HAND,PAX_SEAT_BACK,type PaxBaked,type PaxLook,type PaxProp,type PassengerMesh} from '../graphics/trainPassengerMesh';

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
/** Each car's NPC seats (SEAT_TABLE indices), once. */
const OWN_SEATS=Array.from({length:TRAIN_CARS},(_,c)=>NPC_SEATS.filter(i=>SEAT_TABLE[i].car===c));
/** Slot p of car c on train k in segment seg: who (cast index, from the slot's own people) sits in which SEAT_TABLE index, or
 *  nobody. Busy runs fill the strap spots. A station boarder rides only while `away` (else the slot's next person). */
export function slotAt(k:number,c:number,p:number,seg:number,out:Slot,away:(id:string)=>boolean=()=>true):Slot{
 const h0=hash(k,c,p,7),len=6+h0%4,off=(h0>>>4)%len,idn=Math.floor((seg+off)/len),hi=hash(k,c,p,idn,11),si=(c*SLOTS_PER_CAR+p+k*5)%SLOT_COUNT;
 out.standing=p>=SEATED_SLOTS;out.cast=-1;
 for(let m=0;m<CAST_PER_SLOT;m++){const ci=si+SLOT_COUNT*((hi+m)%CAST_PER_SLOT),b=CAST[ci].boarder;if(!b||away(b)){out.cast=ci;break;}}
 if(out.standing){const busy=hash(k,Math.floor(seg/NST),3)%3===0;out.on=busy&&(p===SEATED_SLOTS||hi%100<50);out.seat=-1;}
 else{out.on=hi%100<74;const own=OWN_SEATS[c];out.seat=own[(p*2+((hi>>>8)&1))%own.length];}
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
/** A talkable passenger's world spot (floor under their root) this frame. */
export type TalkSpot={cast:number;x:number;y:number;z:number;k:number;standing:boolean;kid:boolean;/** their feet (seated: toward the aisle; the hover ring) */fx:number;fz:number};
const PASSES=[2,1] as const;// near trains first, then the far ones

type Run={states:readonly TrainState[];carMatrixOf(k:number,c:number,out:T.Matrix4):T.Matrix4;/** AAA 4: the platform top (world y) of the stop train k stands at, NaN running */platformTop?(k:number):number};
type Ports={away:(id:string)=>boolean};
const MAX=TRAIN_COUNT*TRAIN_CARS*SLOTS_PER_CAR+TRAIN_COUNT*4;// everyone + a few walking off
/** AAA 4 (Nov 25 2026, owner: "the way the characters move and interact in the train"): the walk on and off is a planted-foot walk
 *  (trainPassengerMesh walk cycle, its phase from the distance covered) at WALK_V m/s, eased in over WALK_ACC s, turning on the way
 *  (the yaw eases toward the path ahead, YAW_RATE /s), out through the door, a step down onto the platform and 2-3 m away
 *  (OUT_M) before fading; boarders wait beside the door (letting people off first) and walk in, turn to their seat and sit down
 *  (SIT_S s). A rider getting off stands up STAND_BEFORE s before the stop (STAND_S s, in front of their seat). */
export const WALK_V=1.3,WALK_ACC=.35,YAW_RATE=9,OUT_M=2.4,STAND_BEFORE=2.2,STAND_S=.8,SIT_S=.75,FRONT_X=.5;
/** Idles (AAA 4): the West Coast Stadium (fans wave their scarves within CHEER_RANGE m of it), the landmarks a window-gazer follows
 *  (within LOOK_RANGE m and in front of them), a chat between seat neighbours (CHAT_DZ m apart on one bench). */
export const CHEER_RANGE=150,LOOK_RANGE=70,CHAT_DZ=1;
const LANDMARKS:{x:number;z:number}[]=[{x:STADIUM.x,z:STADIUM.z},...TRAIN_STATIONS.map(st=>{const p=trackAt(st.s,{x:0,z:0,tx:1,tz:0}),n=leftNormal(p.tx,p.tz);return {x:p.x+n.x*st.side*7,z:p.z+n.z*st.side*7};})];
const ease=(u:number)=>{const v=Math.max(0,Math.min(1,u));return v*v*(3-2*v);};
/** Distance walked t s after setting off (eased in over WALK_ACC s), at speed v. */
const walked=(t:number,v:number)=>t<=0?0:t<WALK_ACC?v*t*t/(2*WALK_ACC):v*(t-WALK_ACC/2);
/** A car-local polyline (x, z pairs) and its length. */
type Path={p:Float32Array;n:number;len:number};
const mkPath=():Path=>({p:new Float32Array(12),n:0,len:0});
function pathSet(P:Path,...xz:number[]){P.n=xz.length/2;P.len=0;for(let i=0;i<xz.length;i++)P.p[i]=xz[i];for(let i=1;i<P.n;i++)P.len+=Math.hypot(P.p[i*2]-P.p[i*2-2],P.p[i*2+1]-P.p[i*2-1]);return P;}
function pathAt(P:Path,d:number,out:{x:number;z:number}){let r=Math.max(0,Math.min(P.len,d));for(let i=1;i<P.n;i++){const ax=P.p[i*2-2],az=P.p[i*2-1],bx=P.p[i*2],bz=P.p[i*2+1],l=Math.hypot(bx-ax,bz-az);
 if(r<=l||i===P.n-1){const u=l>1e-5?Math.min(1,r/l):1;out.x=ax+(bx-ax)*u;out.z=az+(bz-az)*u;return out;}r-=l;}out.x=P.p[0];out.z=P.p[1];return out;}
export function createTrainPassengers(scene:T.Scene,ports:Ports){
 let parts:PassengerMesh|null=null;
 const rosters:(Roster|null)[]=Array.from({length:TRAIN_COUNT},()=>null),segs=new Float64Array(TRAIN_COUNT).fill(NaN);
 const m=new T.Matrix4(),m2=new T.Matrix4(),mi=new T.Matrix4(),cm=new T.Matrix4(),q=new T.Quaternion(),qt=new T.Quaternion(),e3=new T.Euler(),p3=new T.Vector3(),s3=new T.Vector3(1,1,1),fr=new T.Frustum(),pm=new T.Matrix4(),sph=new T.Sphere();
 const strap={x:0,z:0,yaw:0},cast=CAST.map(c=>({...c})),pa={x:0,z:0},pb={x:0,z:0},path=mkPath();
 const G=TRAIN_COUNT*SLOT_COUNT;
 // each slot's neck gaze (eased toward the reaction's target; written to the pose row only when it moved)
 const nearHid=new Uint8Array(G),gazeP=new Float32Array(G),gazeY=new Float32Array(G),near=new Uint8Array(TRAIN_COUNT),dist=new Float32Array(TRAIN_COUNT);
 // AAA 4: per slot: the eased body yaw (NaN = snap), the idle extra (bake, eased weight); per train: speed / smoothed acceleration,
 // the seat-neighbour pairs (rebuilt with the roster), the platform drop at the stop
 const yawS=new Float32Array(G).fill(NaN),yawB=new Float32Array(G).fill(NaN),scratch:Slot={on:false,cast:-1,seat:-1,standing:false},xB=new Int16Array(G).fill(-1),xW=new Float32Array(G),pair=new Int16Array(G).fill(-1),vWas=new Float32Array(TRAIN_COUNT).fill(NaN),acc=new Float32Array(TRAIN_COUNT);
 // the talkable passengers this frame (world spot), filled by update; nearest() reads it
 const talk:TalkSpot[]=Array.from({length:MAX},()=>({cast:-1,x:0,y:0,z:0,k:-1,standing:false,kid:false,fx:0,fz:0}));let nTalk=0,
 // train-talk (Nov 24 2026, lib/town/trainPassengerTalk.ts): the passenger I'm talking to (cast, -1 none) turns toward (faceX, faceZ) and keeps their seat
 faceCast=-1,faceX=0,faceZ=0,shown=0,hornK=-1,hornAt=-99,lastNow=NaN;
 // the pose bake (~90 ms) runs in idle slices from load (cost trim Nov 24), long before a train is near; if a train is needed first
 // the rest of it runs at once (the old first-sight path). No idle callback (Node tests): baked on first sight as before.
 const looks=CAST.map(c=>c.pax),baker=bakeSteps(looks);let baked:PaxBaked|null=null,idleId=0;
 const step=()=>{if(!baked){const r=baker.next();if(r.done)baked=r.value;}return baked!==null;};
 type Idle={requestIdleCallback?:(cb:(d:{timeRemaining():number})=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
 const g=globalThis as Idle;
 const slice=(d:{timeRemaining():number})=>{idleId=0;if(parts)return;while(!step()&&d.timeRemaining()>6){/* one pose per step */}if(!baked)idleId=g.requestIdleCallback!(slice,{timeout:4000});};
 if(typeof g.requestIdleCallback==='function')idleId=g.requestIdleCallback(slice,{timeout:6000});
 function build(){while(!step()){/* finish the bake now */}if(idleId)g.cancelIdleCallback?.(idleId);idleId=0;parts=createPassengerMesh(MAX,looks,baked!);scene.add(parts.group);}
 /** Instance n: car matrix × the local spot (x, z on the floor, yaw), the car-frame tilt (lon: about the car's x, the lurch; lat:
  *  about its z, the curve sway), the rider's bake (+ a blend), scale (kid, fade), gaze. */
 function put(n:number,ci:number,carM:T.Matrix4,x:number,y:number,z:number,yaw:number,lon:number,lat:number,bake:number,scale:number,gp:number,gy:number,b2=-1,w=0){
  e3.set(lon,0,lat,'XYZ');qt.setFromEuler(e3);e3.set(0,yaw,0,'YXZ');q.setFromEuler(e3).premultiply(qt);p3.set(x,CAR_FLOOR_Y+y,z);s3.setScalar(scale);mi.compose(p3,q,s3);m2.multiplyMatrices(carM,mi);parts!.set(n,ci,bake,m2,gp,gy,b2,w);
 }
 /** The seat neighbours of train k's roster (two seated riders side by side on one bench, neither dozing): they chat now and then. */
 function pairUp(k:number,r:Roster){const o=k*SLOT_COUNT;for(let i=0;i<SLOT_COUNT;i++)pair[o+i]=-1;
  for(let i=0;i<SLOT_COUNT;i++){const a=r.slots[i];if(!a.on||a.standing||a.cast<0||CAST[a.cast].doze||pair[o+i]>=0)continue;const sa=SEAT_TABLE[a.seat];
   for(let j=i+1;j<SLOT_COUNT;j++){const b=r.slots[j];if(!b.on||b.standing||b.cast<0||CAST[b.cast].doze||pair[o+j]>=0)continue;const sb=SEAT_TABLE[b.seat];
    if(sb.car===sa.car&&sb.side===sa.side&&Math.abs(sb.z-sa.z)<CHAT_DZ){pair[o+i]=j;pair[o+j]=i;break;}}}}
 /** Ease slot gi's idle extra toward bake `tb` (−1 none) at weight tw: a different extra first eases the current one out. */
 function idleTo(gi:number,tb:number,tw:number,dt:number,rate:number){if(xB[gi]!==tb&&xW[gi]>.02){xW[gi]=Math.max(0,xW[gi]-dt*rate);return;}
  if(xB[gi]!==tb){xB[gi]=tb;xW[gi]=0;}if(tb<0){xW[gi]=0;return;}xW[gi]+=(tw-xW[gi])*Math.min(1,dt*rate);}
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
    const d=sph.center.distanceTo(p3.set(cx,cy,cz));dist[k]=d;near[k]=k===ridingK||(d<=Math.min(SHOW_RANGE,DETAIL_RANGE)&&fr.intersectsSphere(sph))?(k===ridingK||d<NEAR_RANGE?2:1):0;
    // the lurch: the train's acceleration (m/s², smoothed), from its speed this frame
    const v=run.states[k].v??0;if(dt>.008&&Number.isFinite(vWas[k]))acc[k]+=(Math.max(-1.2,Math.min(1.2,(v-vWas[k])/dt))-acc[k])*Math.min(1,dt*2.5);if(dt>.008||!Number.isFinite(vWas[k]))vWas[k]=v;}
   let nNear=0;
   for(const pass of PASSES)for(let k=0;k<TRAIN_COUNT&&k<run.states.length;k++){if(near[k]!==pass)continue;const st=run.states[k],full=pass===2;
    const seg=segOf(k,now,st);let r=rosters[k];if(!r||segs[k]!==seg){r=rosters[k]=rosterFor(k,seg,ports.away,r??undefined);segs[k]=seg;pairUp(k,r);for(let i=0;i<SLOT_COUNT;i++)yawS[k*SLOT_COUNT+i]=yawB[k*SLOT_COUNT+i]=NaN;}
    const atStop=st.at>=0,dw=atStop?(TRAIN_STOPS[st.at].depart-TRAIN_STOPS[st.at].arrive)-st.dwellLeft:-1,pside=atStop?TRAIN_STOPS[st.at].station.side:TRAIN_STOPS[st.next].station.side;
    // time to the next stop (running; s): the riders getting off there stand up STAND_BEFORE s before it
    const tA=atStop?Infinity:(((TRAIN_STOPS[st.next].arrive-st.t)%LAP)+LAP)%LAP;
    const glance=!reduced&&hornK===k&&now-hornAt<1.6;
    // AAA 4: idle blends (kids' legs, a chat's hand, a fan's scarf) only for near trains below the hot tiers (pose-row uploads)
    const anim=!reduced&&full&&tier<3,lonK=reduced?0:Math.max(-.07,Math.min(.07,-acc[k]*.03)),bob=reduced?0:Math.min(1,(st.v??0)/12);
    let stadium=false;if(anim){p3.set(0,0,0).applyMatrix4(cm);stadium=Math.hypot(p3.x-STADIUM.x,p3.z-STADIUM.z)<CHEER_RANGE+STADIUM.bowlL/2;}
    // the platform drop at the doors (car floor → platform top), at a stop
    let drop=0;if(atStop&&run.platformTop){run.carMatrixOf(k,0,cm);const top=run.platformTop(k);if(Number.isFinite(top)){p3.set(HALF_W,CAR_FLOOR_Y,0).applyMatrix4(cm);drop=Math.max(-1.2,Math.min(0,top-p3.y));}}
    for(let c=0;c<TRAIN_CARS;c++){run.carMatrixOf(k,c,cm);const ce=cm.elements,lat=reduced?0:Math.max(-.08,Math.min(.08,-ce[1]*1.2)),rev=c%2?-1:1,psx=pside*rev,lon=lonK*rev;let inCar=0;
     for(let p=0;p<SLOTS_PER_CAR;p++){const i=c*SLOTS_PER_CAR+p,gi=k*SLOT_COUNT+i,now_=r.slots[i],was=r.prev[i];
      // who shows in this slot: at a stop the old rider (walking off) and / or the new one (waiting, walking on, sitting down);
      // running, the rider (standing up before their stop if they get off there). mode: 0 resting, 1 leaving, 2 boarding
      const swapping=atStop&&dw>=0&&changesAt(k,c,p,seg)&&(was.on||now_.on)&&(was.cast!==now_.cast||was.on!==now_.on);
      const stay=swapping&&faceCast>=0&&was.on&&was.cast===faceCast&&k===ridingK;// train-talk: mid-chat they stay put (no walk off)
      let leaving=false;
      if(!atStop&&tA<STAND_BEFORE+STAND_S&&now_.on&&changesAt(k,c,p,seg+1)){const nx=slotAt(k,c,p,seg+1,scratch,ports.away);if(nx.cast<0)nx.on=false;leaving=!nx.on||nx.cast!==now_.cast;}
      for(let pass2=0;pass2<2;pass2++){
       let who:Slot,mode=0;
       if(stay){if(pass2)break;who=was;}
       else if(swapping){who=pass2?now_:was;mode=pass2?2:1;}
       else{if(pass2)break;who=now_;mode=leaving?1:0;}
       if(!who.on||who.cast<0)continue;
       const P=CAST[who.cast],kid=!!P.kid,mask=P.pax.props,sc=kid?PAX_KID_SCALE:1,ball=(mask>>PAX_PROP.ball&1)===1;
       // the resting spot: on the bench (root SEAT_ROOT_X out, facing the aisle) or at a strap (facing that bench)
       let x:number,z:number,yaw:number,seated=!who.standing,y=0,fade=1,bake:number,b2=-1,w=0,tp:number,ty=0,walking=false;
       let restX:number,restZ:number,restYaw:number,frontX:number;
       if(who.standing){strapSpot(p-SEATED_SLOTS,strap);restX=strap.x;restZ=strap.z;restYaw=strap.yaw;frontX=restX;}
       else{const s=SEAT_TABLE[who.seat];restX=s.side*(SEAT_ROOT_X+PAX_SEAT_BACK[P.pax.look.build]*sc);restZ=s.z;restYaw=s.side>0?-Math.PI/2:Math.PI/2;frontX=s.side*FRONT_X;}
       x=restX;z=restZ;yaw=restYaw;
       const restBake=paxPoseFor(mask,seated,kid,false),standBake=paxPoseFor(mask,false,kid,true);bake=restBake;
       // the door this rider uses (the nearest), and the way along the platform away from it
       let dz=DOORS[0];for(const dd of DOORS)if(Math.abs(dd-restZ)<Math.abs(dz-restZ))dz=dd;const along=(dz>=0?1:-1)*((who.cast&1)?1:.55);
       if(mode===1){// getting off: stand up before the stop (seated), then from OFF_FROM walk to the door, step down, walk away
        const tau=atStop?dw:-tA,u=seated?ease((tau+STAND_BEFORE)/STAND_S):1;
        if(seated){x=restX+(frontX-restX)*u;if(u>0){b2=standBake;w=u;}if(u>=1){bake=standBake;b2=-1;w=0;seated=false;}}
        const t=atStop?dw-OFF_FROM:-1;
        if(t>0){pathSet(path,x,z,psx*.3,dz,psx*(HALF_W-.05),dz,psx*(HALF_W+.7),dz+along*.25,psx*(HALF_W+.7+OUT_M*.8),dz+along*(.25+OUT_M*.6));
         const d=walked(t,WALK_V);if(d>=path.len)continue;walking=true;pathAt(path,d,pa);pathAt(path,d+.35,pb);x=pa.x;z=pa.z;
         if(Math.hypot(pb.x-pa.x,pb.z-pa.z)>.02)yaw=Math.atan2(pb.x-pa.x,pb.z-pa.z);
         fade=Math.min(1,(path.len-d)/.6);seated=false;
         const sw=t<.25?ease(t/.25):1;// from the standing pose into the stride
         if(full){const ph=d/(PAX_STRIDE*sc)*PAX_WALK_FRAMES,f0=Math.floor(ph);if(sw<1){bake=standBake;b2=paxWalk(f0,kid,ball);w=sw;}else{bake=paxWalk(f0,kid,ball);b2=paxWalk(f0+1,kid,ball);w=ph-f0;}}
         else bake=standBake;}}
       else if(mode===2){// getting on: waiting beside the door from the stop, from ON_FROM walking in to the seat / strap, then sitting
        pathSet(path,psx*(HALF_W+.7+OUT_M*.75),dz-along*(.4+OUT_M*.5),psx*(HALF_W+.7),dz-along*.2,psx*(HALF_W-.05),dz,psx*.3,dz,frontX,restZ);
        const t=dw-ON_FROM,d=walked(t,WALK_V);fade=Math.min(1,dw/.5);
        if(d<path.len){walking=true;pathAt(path,d,pa);pathAt(path,d+.35,pb);x=pa.x;z=pa.z;seated=false;
         yaw=Math.hypot(pb.x-pa.x,pb.z-pa.z)>.02?Math.atan2(pb.x-pa.x,pb.z-pa.z):restYaw;if(t<=0)yaw=Math.atan2(psx*HALF_W-pa.x,dz-pa.z)*.6+yaw*.4;
         const sw=t<.25?ease(t/.25):1;
         if(full&&t>0){const ph=d/(PAX_STRIDE*sc)*PAX_WALK_FRAMES,f0=Math.floor(ph);if(sw<1){bake=standBake;b2=paxWalk(f0,kid,ball);w=sw;}else{bake=paxWalk(f0,kid,ball);b2=paxWalk(f0+1,kid,ball);w=ph-f0;}}
         else bake=standBake;}
        else{// arrived: turn to the seat, then sit down (or take the strap)
         const ta=t-(path.len/WALK_V+WALK_ACC/2),u=ease((ta-.25)/(who.standing?.45:SIT_S));
         if(u<1){x=frontX+(restX-frontX)*u;bake=standBake;b2=restBake;w=u;seated=false;}}}
       // the step down onto (up from) the platform beyond the door sill
       if(walking&&drop<0){const ax=Math.abs(x)-(HALF_W-.02);if(ax>0)y=drop*ease(ax/.75)+.06*Math.sin(Math.PI*Math.min(1,ax/.75));}
       if(walking&&!full){bake=standBake;b2=-1;w=0;y+=reduced?0:Math.abs(Math.sin(now*7.5))*.03;}
       if(++inCar>cap)continue;if(n>=MAX)break;
       // reactions (the neck, as the islanders' gaze) for the resting / standing-up riders
       tp=PAX_GAZE_PITCH[bake%PAX_POSES]+(P.doze?.32:0);if(walking){tp=.04;ty=0;}
       const seed=i*2.3+k*1.7+who.cast*.61;
       if(!walking&&!reduced&&mode===0){
        const pose=restBake%PAX_POSES,mate=pair[gi]>=0&&full?pair[gi]:-1;let busy=false;
        if(P.doze){// a doze: the head sinks slowly, then a little jerk back up
         const u=(now/7.3+seed*.13)%1;tp=PAX_GAZE_PITCH[pose]+.3+(u<.86?.24*(u/.86)*(u/.86):.24*(1-(u-.86)/.14));busy=true;}
        else if(mate>=0&&Math.sin(now*.105+(Math.min(i,mate)*1.3+k))>-.25){// a chat with the seat neighbour: turns, alternating
         const ms=r.slots[mate],sm=SEAT_TABLE[ms.seat],rel0=Math.atan2(0,sm.z-z)-yaw,rel=Math.atan2(Math.sin(rel0),Math.cos(rel0));
         const speaking=((Math.floor(now/3.4+k*.7)+(i<mate?0:1))&1)===0;ty=Math.max(-.85,Math.min(.85,rel))*(speaking?.85:1);tp=Math.min(tp,.1);
         if(!speaking)tp+=.05*Math.max(0,Math.sin(now*5.2+seed));// the listener nods
         if(anim&&speaking&&pose===PAX_POSE.lap)idleTo(gi,paxExtra(PAX_EXTRA.talk,kid),.55+.3*Math.sin(now*3.3+seed),dt,4);busy=true;}
        if(anim&&seated&&(mask>>PAX_PROP.scarf&1)===1&&stadium){// a fan as the train passes the stadium: the scarf up high, waving it
         if(xB[gi]===paxExtra(PAX_EXTRA.cheerA,kid)&&xW[gi]>.97){bake=paxExtra(PAX_EXTRA.cheerA,kid);b2=paxExtra(PAX_EXTRA.cheerB,kid);w=.5+.5*Math.sin(now*6.5+seed);}
         else idleTo(gi,paxExtra(PAX_EXTRA.cheerA,kid),1,dt,3);
         ty=0;tp=-.12;busy=true;}
        else if(anim&&seated&&kid&&!P.doze&&(pose===PAX_POSE.lap||pose===PAX_POSE.hold)&&Math.sin(now*.23+seed)>-.4){// a kid swinging their legs
         idleTo(gi,paxExtra(pose===PAX_POSE.hold?PAX_EXTRA.swingHold:PAX_EXTRA.swing,kid),.5+.5*Math.sin(now*4.6+seed),dt,6);busy=true;}
        else if(!busy||xB[gi]!==paxExtra(PAX_EXTRA.talk,kid))idleTo(gi,-1,0,dt,4);
        if(!busy){
         if(pose===PAX_POSE.phone||pose===PAX_POSE.strapPhone){if(((now+seed*3)%9.5)<1.5)tp=.04;}// a phone: a glance up now and then
         else if(pose===PAX_POSE.read){const u=(now*.42+seed)%1;ty=u<.85?-.07+.14*(u/.85):.07-.14*((u-.85)/.15);}// reading along the lines
         // a window-gazer follows a landmark across the aisle (in front of them), else a look along the car now and then
         let lk=false;if(full&&pose!==PAX_POSE.read){p3.set(x,0,z).applyMatrix4(cm);const wx=p3.x,wz=p3.z;mi.copy(cm).invert();
          for(const L of LANDMARKS){const d=Math.hypot(L.x-wx,L.z-wz);if(d>LOOK_RANGE)continue;p3.set(L.x,0,L.z).applyMatrix4(mi);let rel=Math.atan2(p3.x-x,p3.z-z)-yaw;rel=Math.atan2(Math.sin(rel),Math.cos(rel));
           if(Math.abs(rel)<1.25){ty=rel*.8;tp=Math.min(tp,.02);if(!seated)yaw+=rel*.25;lk=true;break;}}}
         if(!lk&&!P.doze){const s=Math.sin(now*.57+i*2.3+k*1.7);if(s>.82){ty=.48*Math.sign(Math.sin(i*1.9+k)||1);tp-=.12;if(!seated)yaw+=.35*Math.sign(ty);}}}
        if(xB[gi]>=0&&xW[gi]>.005&&b2<0){b2=xB[gi];w=xW[gi];}}
       else if(mode!==0||walking)idleTo(gi,-1,0,dt,20);
       if(glance&&!walking&&!P.doze){const cabX=rev;ty=.5*Math.sign(-Math.sin(yaw)*cabX||1);tp=Math.min(tp,.05);}
       if(faceCast===who.cast&&k===ridingK&&!walking){// train-talk: look at me (the neck; standing, the body turns too), in the car frame
        mi.copy(cm).invert();p3.set(faceX,0,faceZ).applyMatrix4(mi);let rel=Math.atan2(p3.x-x,p3.z-z)-yaw;rel=Math.atan2(Math.sin(rel),Math.cos(rel));
        if(!seated){const b=Math.max(-1.2,Math.min(1.2,rel));yaw+=b;rel-=b;}ty=Math.max(-.9,Math.min(.9,rel));tp=Math.min(tp,.02);}
       // the body yaw eases (turning to the door, round the corner, to the seat); a new rider snaps
       const ya=mode===2?yawB:yawS;let yy=ya[gi];if(!Number.isFinite(yy)||!dt||reduced)yy=yaw;else{const dy=Math.atan2(Math.sin(yaw-yy),Math.cos(yaw-yy));yy+=dy*Math.min(1,dt*YAW_RATE);}
       ya[gi]=yy;yaw=yy;
       const ge=Math.min(1,dt*5);gazeP[gi]+=(tp-gazeP[gi])*ge;gazeY[gi]+=(ty-gazeY[gi])*ge;if(walking||!dt){gazeP[gi]=tp;gazeY[gi]=ty;}
       // a gentle bob with the car on the rail joints (running), the lurch / sway tilt (standing riders more)
       if(!walking&&bob>0)y+=bob*(.003*Math.sin(st.s*.51+i)+.0015*Math.sin(st.s*1.27+i*1.7));// ~1 Hz at line speed: a sway, never a buzz
       const tl=walking?0:seated?.4:kid?1.4:1;
       // RIDE 3: near-camera fade in the ridden train (first person walks right past them): not drawn within FADE_NEAR m of the
       // camera, back past FADE_FAR (the same rule as me and Kenji in Town)
       if(k===ridingK){p3.set(x,CAR_FLOOR_Y,z).applyMatrix4(cm);const yy2=Math.max(p3.y+.25,Math.min(p3.y+1.35,cy)),d=Math.hypot(cx-p3.x,cy-yy2,cz-p3.z),hid=nearHid[gi]?d<FADE_FAR:d<FADE_NEAR;nearHid[gi]=hid?1:0;if(hid)continue;}
       if(!parts)build();put(n,who.cast,cm,x,y,z,yaw,lon*tl,lat*(walking?.3:1),bake,sc*Math.max(.05,fade),gazeP[gi],gazeY[gi],b2,w);
       if(!walking&&mode!==2&&n<talk.length){p3.set(x,CAR_FLOOR_Y,z).applyMatrix4(cm);const t=talk[nTalk++];t.cast=who.cast;t.x=p3.x;t.y=p3.y;t.z=p3.z;t.k=k;t.standing=!seated;t.kid=kid;t.fx=t.x;t.fz=t.z;if(seated&&k===ridingK){p3.set(x*.45,CAR_FLOOR_Y,z).applyMatrix4(cm);t.fx=p3.x;t.fz=p3.z;}}
       n++;if(full)nNear=n;}}}}
   shown=n;parts?.commit(n,nNear,tier<HAT_TIER);
   void RIDER_ROOT_X;void BENCH_FRONT;void SEATS_PER_CAR;void BENCH_X;void WALK_S;
  },
  /** train-talk: the talkable spots this frame (read-only; the first `count`). */
  spots(){return {list:talk as readonly Readonly<TalkSpot>[],count:nTalk};},
  /** train-talk: the passenger's definition (its own copy, x / z kept current by the talk module). */
  def(castIndex:number):Passenger|undefined{return cast[castIndex];},
  /** train-talk: cast c (-1: nobody) turns toward the world point (x, z) and keeps their seat. */
  face(c:number,x=0,z=0){faceCast=c;faceX=x;faceZ=z;},
  /** The horn sounded on train k (a glance toward the cab). */
  horn(k:number,now:number){hornK=k;hornAt=now;},
  /** The passenger to talk to while riding train k: the nearest within TALK_RANGE of (x, z) (its NpcDefinition, at its spot). */
  nearest(k:number,x:number,z:number):NpcDefinition|null{
   if(k<0)return null;let best=-1,bd=TALK_RANGE;for(let i=0;i<nTalk;i++){const t=talk[i];if(t.k!==k)continue;const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;best=i;}}
   if(best<0)return null;const t=talk[best],def=cast[t.cast];def.x=t.x;def.z=t.z;return def;},
  /** Tests / checks: passengers drawn this frame, the roster of train k (null until it was near), the mesh parts (null until built). */
  get shown(){return shown;},roster(k:number){return rosters[k];},get parts(){return parts;},
  /** Checks only (probe-aaa4): slot i's resting spot in its car (z) and the door it walks through. */
  restZ(i:number,standing:boolean,seat:number){const z=standing?strapSpot(i%SLOTS_PER_CAR-SEATED_SLOTS,strap).z:SEAT_TABLE[seat].z;let dz=DOORS[0];for(const dd of DOORS)if(Math.abs(dd-z)<Math.abs(dz-z))dz=dd;return {z,door:dz};},
  dispose(){if(idleId)g.cancelIdleCallback?.(idleId);idleId=0;if(!parts)baker.return(undefined as never);parts?.dispose();parts=null;},
 };
}
export type TrainPassengers=ReturnType<typeof createTrainPassengers>;
