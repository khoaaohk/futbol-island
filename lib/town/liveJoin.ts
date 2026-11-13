// Join a live game (slice 1, Nov 4 2026; docs/join-live-game-design.md). Pure logic, no three.js, safe in tests:
// which formats can be joined, the Play flow (the pitch bar's Play → side + position → Start), team and slot assignment for N humans, and the
// replaced NPC's walk to the touchline. Teaching purpose: a kid steps onto a real 7v7 match and plays a position
// (Law 3: a substitution, the player he replaces sits out and cheers; bibs tell the teams apart at a glance).
import type {LiveFormat} from './venues';
import type {HumanTeam} from './match/humanInputs';

/** Per-format switch. Slice 1 opened the 7v7; slice 3 (Nov 4 2026) adds futsal (the Palm Coast rooftop, 3.7 m/s like the
 *  walk) and the 9v9 (4.9 m/s, sprint ~7 m/s: inside the pose relay's walk limit, MAX_SPEED_MS × 1.5 = 9.4 m/s). The
 *  11v11 (Nov 5 2026) is the ADULT-tuned format: full-size pace (run 6.9 m/s, sprint ~9.0 m/s via MatchSim.humanSprintBoost,
 *  under the relay limit), normal AI chasers; no human speed cap. The beach has its own lane. */
export const LIVE_JOIN_FORMATS:Record<LiveFormat,{enabled:boolean;maxHumansPerTeam:number;humanSpeedCap:number|null}>={
  '7v7':{enabled:true,maxHumansPerTeam:7,humanSpeedCap:null},
  'futsal':{enabled:true,maxHumansPerTeam:5,humanSpeedCap:null},
  '9v9':{enabled:true,maxHumansPerTeam:9,humanSpeedCap:null},
  '11v11':{enabled:true,maxHumansPerTeam:11,humanSpeedCap:null},// Eleven Park: adult tuning (owner Nov 5 2026)
  'beach':{enabled:true,maxHumansPerTeam:5,humanSpeedCap:null},
  'stadium':{enabled:true,maxHumansPerTeam:11,humanSpeedCap:null},// West Coast Stadium (Nov 12 2026): the big match, 11v11 rules// Sharks Beach (Nov 4 2026): Play-only bar, barefoot kits, the drawn 5.5 m goal for your shots, 4 s restarts
};
export const joinableFormat=(format:LiveFormat)=>LIVE_JOIN_FORMATS[format].enabled;

// ---------------------------------------------------------------- Play from the pitch bar (owner decisions Nov 4 2026)
// No auto-join and no separate card: the pitch lesson bar (components/FieldPathCard.tsx) reads Learn + Play on a joinable
// pitch, also while riding or flying. Play opens the side + position picker (phase 'pick'); Start joins as soon as the
// player is grounded and walking (Town lands the jetpack / dismounts the ride when Play is tapped). Stepping off the pitch
// (or something taking over: a lesson, the sea, a job…) cancels; Back / Esc dismisses.
/** Metres outside the touchline that still count as "on this pitch" (Town shows the pitch bar within the same margin). */
export const JOIN_PITCH_MARGIN=3;
export type JoinPhase='idle'|'pick'|'joined';
export type JoinState={phase:JoinPhase;/** Start was tapped; the join waits for `canJoin` (landing / dismounting). */startPending:boolean};
export type JoinSignals={
  /** Standing on (or within JOIN_PITCH_MARGIN of) a joinable pitch: the bar is there. */onPitch:boolean;
  /** Nothing else owns the player (no lesson, sea, zipline, job, truck, knockout…). Rides and flying are allowed. */canOffer:boolean;
  /** Grounded and on foot: the join itself may happen now. */canJoin:boolean;
  play:boolean;start:boolean;dismiss:boolean;leave:boolean;
};
export type JoinEvent='pick'|'cancel'|'dismiss'|'join'|'leave'|null;
export const createJoinState=():JoinState=>({phase:'idle',startPending:false});
/** Advance the Play flow one frame. Joined is left ONLY by `leave` (walking to the touchline chasing the ball is not
 *  leaving). The picker waits for Start; the join itself waits for `canJoin`. */
export function stepJoin(s:JoinState,sig:JoinSignals):JoinEvent{
  if(s.phase==='joined'){if(sig.leave){s.phase='idle';s.startPending=false;return 'leave';}return null;}
  if(s.phase==='pick'){
    if(!sig.onPitch||!sig.canOffer){s.phase='idle';s.startPending=false;return 'cancel';}
    if(sig.dismiss){s.phase='idle';s.startPending=false;return 'dismiss';}
    if(sig.start)s.startPending=true;
    if(s.startPending&&sig.canJoin){s.phase='joined';s.startPending=false;return 'join';}
    return null;
  }
  if(sig.play&&sig.onPitch&&sig.canOffer){s.phase='pick';s.startPending=false;return 'pick';}
  return null;
}

// ---------------------------------------------------------------- team + slot
/** Gold attacks sim y 8 (its own goal is at y 392), blue the other way (MatchSim atkGoalY/ownGoalY). */
export const ownGoalY=(team:HumanTeam)=>team==='gold'?392:8;
/** The team a new human joins: the one with FEWER humans; on a tie the team whose own goal is nearest the point
 *  where he stepped on (he joins the side he walked into). `prefer` (party / friends, multiplayer slice) wins whenever
 *  it does not make the teams more uneven. null when both teams are full. */
export function pickJoinTeam(counts:{gold:number;blue:number},entryY:number,maxPerTeam:number,prefer?:HumanTeam|null):HumanTeam|null{
  const open=(t:HumanTeam)=>counts[t]<maxPerTeam;
  if(!open('gold')&&!open('blue'))return null;
  if(!open('gold'))return 'blue';if(!open('blue'))return 'gold';
  if(prefer&&counts[prefer]<=counts[prefer==='gold'?'blue':'gold'])return prefer;
  if(counts.gold!==counts.blue)return counts.gold<counts.blue?'gold':'blue';
  return Math.abs(entryY-ownGoalY('gold'))<=Math.abs(entryY-ownGoalY('blue'))?'gold':'blue';
}
export type JoinRole='def'|'mid'|'fwd';
export type SlotCandidate={id:string;team:HumanTeam;isGK:boolean;x:number;y:number;role?:string};
/** What the picker sends to the engine (fieldRuntime.joinMatch): a side and a slot (or a role); slice 2 sends friends' picks the same way. */
export type JoinPick={team?:HumanTeam|null;slot?:string|null;role?:JoinRole|null};
/** The outfield roles (the keeper is picked by slot in the position dropdown: human keepers, Nov 4 2026). */
export const JOIN_ROLES:readonly JoinRole[]=['def','mid','fwd'];
export const JOIN_ROLE_NAME:Record<JoinRole,string>={def:'Defender',mid:'Midfield',fwd:'Forward'};
/** One-line position lesson (title / screen-reader description on the role button). */
export const JOIN_ROLE_TIP:Record<JoinRole,string>={def:'Defender: stay goal-side and stop their attacks.',mid:'Midfield: link defence and attack, pass and support.',fwd:'Forward: get in behind and score.'};
/** Position names from the sim's slot ids (formation tables in matchSim; blue ids carry a 'd' prefix). */
const SLOT_NAMES:Record<string,string>={gk:'Goalkeeper',lb:'Left Back',cb:'Centre Back',rb:'Right Back',lcb:'Left Centre Back',rcb:'Right Centre Back',lm:'Left Mid',cm:'Centre Mid',rm:'Right Mid',lcm:'Left Centre Mid',rcm:'Right Centre Mid',lw:'Left Wing',rw:'Right Wing',st:'Striker'};
/** Futsal's own position names (owner Nov 5 2026): fixo (the back), the two alas (the sides), the pivot (the target man up front). */
const FUTSAL_SLOT_NAMES:Record<string,string>={cb:'Fixo',lm:'Left Ala',rm:'Right Ala',st:'Pivot'};
/** Beach soccer's names (Nov 8 2026): plain kid-friendly words for its keeper + diamond of four (same slot ids as futsal). */
const BEACH_SLOT_NAMES:Record<string,string>={gk:'Keeper',cb:'Defender',lm:'Left Wing',rm:'Right Wing',st:'Striker'};
const ROLE_FALLBACK:Record<string,string>={gk:'Goalkeeper',def:'Defender',mid:'Midfield',fwd:'Forward'};
/** The dropdown name for a slot: "Left Centre Back", "Striker"… (falls back to the role). */
export function slotName(id:string,team:HumanTeam,role:string,format?:string){const k=team==='blue'&&id.startsWith('d')?id.slice(1):id;return (format==='futsal'?FUTSAL_SLOT_NAMES[k]:format==='beach'?BEACH_SLOT_NAMES[k]:undefined)??SLOT_NAMES[k]??ROLE_FALLBACK[role]??'Player';}
/** Slot order in the dropdown: keeper first, then back to front (defence, midfield, attack), left to right as the team faces. */
export const SLOT_ORDER:Record<string,number>={gk:0,def:1,mid:2,fwd:3};
/** One row of the picker's Position dropdown (components/IslandSelect option shape). */
export type SlotOption={value:string;label:string;disabled?:boolean;note?:string};
type SlotSim={ids:readonly string[];players:Record<string,{team:HumanTeam;role:string;isGK:boolean;hx:number;x:number;y:number}>;humans:{has(id:string):boolean;keys():Iterable<string>};humanKeepers:boolean};
/** Every slot of `team` for the dropdown: keeper first, then back to front, left to right; humans' slots (and the keeper
 *  while the sim refuses human keepers) disabled. Pure: tests/join-live-game.cjs checks both sides. */
/** Multiplayer slice 2: slots party friends hold on this field (the relay's roster), slot id -> the friend's name. */
export type FriendSlots=ReadonlyMap<string,{name:string;team:HumanTeam}>;
/** The note on a slot the AI holds (Nov 5 2026: the picker shows bot vs human occupancy; a friend's slot shows their name). */
export const SLOT_BOT_NOTE='Bot';
export function slotOptions(sim:SlotSim,team:HumanTeam,friends?:FriendSlots|null,format?:string):SlotOption[]{
  const ids=sim.ids.filter(id=>sim.players[id].team===team);
  ids.sort((a,b)=>{const p=sim.players[a],q=sim.players[b];return (SLOT_ORDER[p.role]??9)-(SLOT_ORDER[q.role]??9)||p.hx-q.hx;});
  return ids.map(id=>{const p=sim.players[id],friend=friends?.get(id),taken=sim.humans.has(id)||!!friend,keeperOff=p.isGK&&!sim.humanKeepers;return {value:id,label:slotName(id,team,p.role,format),disabled:taken||keeperOff,note:friend?friend.name:taken?'Taken':keeperOff?'Coming soon':SLOT_BOT_NOTE};});
}
/** The dropdown's default: the current pick when it is still open on this side, else the nearest free outfield slot. */
export function defaultSlot(sim:SlotSim,team:HumanTeam,current:string|null,entryX:number,entryY:number,friends?:FriendSlots|null):string|null{
  const p=current?sim.players[current]:undefined;
  if(p&&p.team===team&&!sim.humans.has(current!)&&!friends?.has(current!)&&(!p.isGK||sim.humanKeepers))return current;
  const taken=new Set(sim.humans.keys());if(friends)for(const id of friends.keys())taken.add(id);
  return pickSlot(Object.values(sim.players).map((q,i)=>({id:Object.keys(sim.players)[i],team:q.team,isGK:q.isGK,x:q.x,y:q.y})),team,entryX,entryY,taken);
}
/** The team a kid CHOSE on the card: his side unless it is full (then the open one); no choice → pickJoinTeam. */
export function chooseJoinTeam(counts:{gold:number;blue:number},entryY:number,maxPerTeam:number,chosen?:HumanTeam|null,prefer?:HumanTeam|null):HumanTeam|null{
  if(chosen&&counts[chosen]<maxPerTeam)return chosen;
  return pickJoinTeam(counts,entryY,maxPerTeam,prefer);
}
/** The NPC a joining human replaces: the nearest OUTFIELD player of `team` to the entry point who is not already a
 *  human (`taken`). With a picked `role` the nearest free player in that role wins (any role only when none is free).
 *  The ball carrier and the restart taker are avoided unless nobody else is left (in the role). */
export function pickSlot(players:Iterable<SlotCandidate>,team:HumanTeam,entryX:number,entryY:number,taken:ReadonlySet<string>,avoid?:ReadonlySet<string>,role?:JoinRole|null):string|null{
  let best:string|null=null,bd=Infinity;
  for(const p of players){
    if(p.team!==team||p.isGK||taken.has(p.id))continue;
    const d=Math.hypot(p.x-entryX,p.y-entryY)+(avoid?.has(p.id)?1000:0)+(role&&p.role!==role?10000:0);
    if(d<bd){bd=d;best=p.id;}
  }
  return best;
}

/** Bot fill (Nov 5 2026): a human's slot goes back to the AI. `bench` null = IN PLACE (a friend leaving a shared match): the bot plays
 *  on from where he stands, in the same role and shape spot, with the ball at his feet if the human had it (no teleport, no dropped
 *  ball). A bench spot = my own exit: the ball stays on the grass where I left it and the NPC comes back on from his touchline spot.
 *  Taking a slot is the mirror: MatchSim.lockHuman keeps the player's spot, role and the ball (fieldRuntime.joinMatch places a
 *  picked slot nowhere new). */
export function handBack(sim:{ball:{owner:string|null;vx:number;vy:number};releaseHuman(id:string):void;placePlayer(id:string,x:number,y:number):void},slot:string,bench:{x:number;y:number}|null){
  if(bench&&sim.ball.owner===slot){sim.ball.owner=null;sim.ball.vx=sim.ball.vy=0;}
  sim.releaseHuman(slot);
  if(bench)sim.placePlayer(slot,bench.x,bench.y);
}

/** Humans per side for the picker: the sim's (me + friends already on my match) plus roster friends the sim does not hold yet. */
export function sideCounts(sim:{humanOn:{gold:number;blue:number};humans:{has(id:string):boolean}},friends:FriendSlots|null|undefined,out:{gold:number;blue:number}){
  out.gold=sim.humanOn.gold;out.blue=sim.humanOn.blue;
  if(friends)for(const [id,f] of friends)if(!sim.humans.has(id))out[f.team]++;
  return out;
}

// ---------------------------------------------------------------- the replaced NPC (sits out, cheers)
/** Sim units outside the touchline where a sitting-out player stands (≈ 1.4 m on the 7v7). */
export const BENCH_MARGIN=10;
/** The same spot in metres, so every pitch width gets it (sim x spans the width: 10 units are 0.74 m on the 18.5 m rooftop
 *  futsal court, 1.7 m on the 9v9): on the 3 m runoff, never at the rooftop's edge. */
export const BENCH_METRES=1.37;
/** Sim units outside the touchline for a pitch `width` metres wide (= BENCH_MARGIN on the 7v7). */
export const benchMargin=(width:number)=>BENCH_METRES/width*250;
/** Spot on the nearest long touchline for a player leaving from sim (x, y); `index` spaces several sitting-out players. */
export function touchlineSpot(x:number,y:number,index:number,out:{x:number;y:number},margin=BENCH_MARGIN){
  const side=x>=135?1:-1;out.x=135+side*(125+margin);
  out.y=Math.max(60,Math.min(340,y+index*14*(y>200?-1:1)));return out;
}
export type BenchPhase='off'|'cheer';
export type BenchWalker={id:string;phase:BenchPhase;x:number;y:number;tx:number;ty:number;age:number};
/** Sim units per second the sitting-out player walks at (≈ a jog). */
export const BENCH_SPEED=34;
/** Walk toward the touchline spot; on arrival he turns to the pitch and cheers. Returns true when the phase changes. */
export function stepBench(w:BenchWalker,dt:number):boolean{
  w.age+=dt;
  if(w.phase!=='off')return false;
  const dx=w.tx-w.x,dy=w.ty-w.y,d=Math.hypot(dx,dy),step=BENCH_SPEED*dt;
  if(d<=step||d<.5){w.x=w.tx;w.y=w.ty;w.phase='cheer';w.age=0;return true;}
  w.x+=dx/d*step;w.y+=dy/d*step;return false;
}
/** Cheer rhythm while sitting out: a 4 s cheer every 7 s (and the clock restarts on a goal), so he is not bouncing
 *  non-stop. Returns the cheer age (0..4) or -1 between cheers. */
export const CHEER_SECONDS=4;
export const cheerAge=(age:number)=>{const c=age%7;return c<CHEER_SECONDS?c:-1;};
/** Beach court (Nov 4 2026): the halfway and 9 m flags stand just outside each touchline, right where a sitting-out player would
 *  cheer: slide his spot along the line clear of the poles (`gap` sim units, ≈1.1 m). `flags`: venues.BEACH_TOUCHLINE_FLAGS_Y. */
export function clearOfFlags(y:number,flags:readonly number[],gap=12){for(const f of flags)if(Math.abs(y-f)<gap)return y>=f?f+gap:f-gap;return y;}
