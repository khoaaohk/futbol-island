// Easier controls for live matches (owner, Nov 5 2026: kids first; docs/join-live-game-design.md "Easier controls").
// Pure, allocation-free helpers the live HUD runtime (lib/town/liveJoinRuntime.ts) uses, so the tests can load them:
// which buttons show in each state, the big defence button's Tackle / Press choice by distance, push-the-stick-to-sprint
// and the tap shot's corner. Your slot is always you: nothing here switches players.
import {STICK_DEAD_ZONE,STICK_WALK_FLOOR} from './walkControl';
import {TACKLE_ASSIST} from './match/humanInputs';

export type JoinMode='pass'|'shoot'|'forward'|'call'|'tackle'|'stay'|'go'|'save'|'throw'|'kick'|'trick'|'press'|'';
/** a = the big corner button, b = the second (Shoot / Forward / Kick; on defence the small Stay), c = the small Trick. */
export type JoinModes={a:JoinMode;b:JoinMode;c:JoinMode};
export type ModeView={possession:'mine'|'team'|'opp'|'loose';keeper:boolean;hands:boolean;restart:boolean;onBall:boolean};

/** The buttons for this moment (fills and returns `out`). With the ball: Pass + Shoot in range (Forward, the through ball,
 *  out of range) + a small Trick. Defending: ONE big button, Tackle in reach / Press further (`near`), and a small Stay
 *  (hold = jockey: the "stay goal-side" lesson). A teammate has it: Call. Loose: Go!. A keeper keeps his own set. */
export function joinModes(v:ModeView,inRange:boolean,near:boolean,out:JoinModes):JoinModes{
  out.a=out.b=out.c='';
  if(v.restart&&!v.onBall)return out;
  if(v.keeper){if(v.possession==='mine'){out.a=v.hands?'throw':'pass';out.b='kick';}else out.a=v.possession==='team'?'call':'save';return out;}
  switch(v.possession){
    case 'mine':out.a='pass';out.b=inRange?'shoot':'forward';out.c='trick';break;
    case 'team':out.a='call';break;
    case 'opp':out.a=near?'tackle':'press';out.b='stay';break;
    default:out.a='go';
  }
  return out;
}

/** The big defence button: Tackle within the tackle assist's lunge reach, Press further. A small band of hysteresis so
 *  the label never flickers while the carrier hovers at the edge (sim units). */
export const TACKLE_NEAR={on:TACKLE_ASSIST.assistR,off:TACKLE_ASSIST.assistR*1.15} as const;
export function tackleNear(prev:boolean,d:number){return Number.isFinite(d)&&(prev?d<TACKLE_NEAR.off:d<TACKLE_NEAR.on);}

/** The shooting zone (Shoot shows instead of Forward): within this many sim units of the goal line (the sim pitch is 400
 *  long on every format, so a unit is ~0.28 m on 11v11 but ~0.1 m on futsal). Nov 7 2026 audit: the old fixed 120 u showed
 *  Shoot from ~33 m on 11v11 and kids took hopeless shots, so 11v11 is 85 u (~23 m); the smaller pitches keep 120 u
 *  (9v9 ~23 m, 7v7 ~17 m, futsal / beach ~12 m). */
export const SHOT_RANGE_U={'11v11':85,other:120} as const;
export function shotRangeU(format:string):number{return format==='11v11'?SHOT_RANGE_U['11v11']:SHOT_RANGE_U.other;}

/** Shoot vs Forward: the shooting zone must hold (or be gone) for `settle` real s before the button changes. */
export const RANGE_SETTLE=.2;

/** Push the stick to sprint (setting on): the RAW stick deflection (0..1 of the knob's travel) that starts the sprint
 *  (`on`, the knob pinned to the outer ring) and stops it (`off`, hysteresis: no flicker at the rim). Normal running
 *  reaches the full run pace by `runAt`, so a kid running "flat out" without pinning the knob never sprints. */
export const STICK_SPRINT={on:.95,off:.88,runAt:.85} as const;
export function stickSprint(prev:boolean,raw:number){return raw>0&&(prev?raw>=STICK_SPRINT.off:raw>=STICK_SPRINT.on);}
/** walkControl.shapeStick's effort at the `runAt` deflection: dividing the shaped stick by it reaches the full run there. */
export const RUN_EFFORT_AT=STICK_WALK_FLOOR+(1-STICK_WALK_FLOOR)*(STICK_SPRINT.runAt-STICK_DEAD_ZONE)/(1-STICK_DEAD_ZONE);
/** Shaped stick length → the live-match run effort with push-to-sprint on (capped at 1). */
export const runEffort=(len:number)=>Math.min(1,len/RUN_EFFORT_AT);

/** Superseded Nov 7 2026: the HUD's tap shot now sends no aim mark at all (the sim's own far-corner auto-aim scores far more,
 *  see liveJoinRuntime steer). Kept for the tests and any caller that wants a picked low corner.
 *  The tap shot (released before SHOT_AIM.minHoldMs): the LOW corner away from the keeper (AIM_MARKS index 2 = x -1,
 *  3 = x +1). A keeper on the middle (within `mid` units) or none: the far post from the shooter. Pure. */
export const TAP_SHOT={mid:3} as const;
export function tapShotCorner(shooterX:number,keeperX:number,centre=135){
  if(Number.isFinite(keeperX)&&Math.abs(keeperX-centre)>TAP_SHOT.mid)return keeperX>centre?2:3;
  return shooterX>centre?2:3;
}

// The setting (Island settings → Live matches → Push stick to sprint, default on). One store per page (dev hot reload).
const KEY='fi2-stick-sprint-v1';
type Store={on:boolean|null;subs:Set<()=>void>};
const store:Store=((globalThis as {__fi2StickSprint?:Store}).__fi2StickSprint??={on:null,subs:new Set()});
export function stickSprintEnabled(){if(store.on===null){store.on=true;try{store.on=localStorage.getItem(KEY)!=='off';}catch{}}return store.on;}
export function setStickSprintEnabled(on:boolean){store.on=on;try{localStorage.setItem(KEY,on?'on':'off');}catch{}store.subs.forEach(f=>f());}
export function subscribeStickSprint(f:()=>void){store.subs.add(f);return ()=>{store.subs.delete(f);};}

// ---- Control feel (Nov 7 2026): input buffering, button emphasis, the charge tick. Pure + allocation-free. ----

/** Input buffering: a press up to `ms` before its button can act (Go! while the pass is still rolling in, Wait at a restart) fires as the
 *  action the button turns into (Pass / Throw / Tackle); a press or release up to `ms` after the ball got away from you
 *  (Pass → Go!: a heavy touch, a bump) still sends the Pass, which the sim keeps armed for its own INPUT_BUFFER (0.16 s) in
 *  case you get it straight back. Sim-side the frame is unchanged (multiplayer protocol untouched). */
export const PRESS_BUFFER={ms:150} as const;
const ACT_A:ReadonlySet<JoinMode>=new Set<JoinMode>(['pass','throw','tackle']);
// Call is left out: a kid calling for it must never pass the ball straight back on arrival.
const WAIT_A:ReadonlySet<JoinMode>=new Set<JoinMode>(['go','']);
/** The mode a Pass-button press made `ageMs` ago in `latched` should act as now that the button shows `cur`. */
export function bufferedA(latched:JoinMode,cur:JoinMode,ageMs:number):JoinMode{
  return WAIT_A.has(latched)&&ACT_A.has(cur)&&ageMs>=0&&ageMs<=PRESS_BUFFER.ms?cur:latched;
}
/** A press (or release) of the button while it shows `cur`, `changedMs` after it stopped showing `prev`: the action to
 *  latch. Only the ball getting away (an action → Go! / nothing) is forgiven; a new action (Tackle) always wins. */
export function graceA(prev:JoinMode,cur:JoinMode,changedMs:number):JoinMode{
  return (prev==='pass'||prev==='throw')&&(cur==='go'||cur==='')&&changedMs>=0&&changedMs<=PRESS_BUFFER.ms?prev:cur;
}

/** Contextual emphasis: which ONE button is the good idea now ('a' / 'b' / '' none). Shoot in range beats an open teammate;
 *  Pass when a teammate calls for it (MatchSim only calls when he is open); Tackle when the carrier is in reach. The others
 *  dim. The HUD writes data-hot / data-dim on the button elements, so the flipped (left-handed) layout follows on its own. */
export type HotButton='a'|'b'|'';
export function hotButton(m:JoinModes,teammateOpen:boolean):HotButton{
  if(m.b==='shoot')return 'b';
  if(m.a==='pass'&&teammateOpen)return 'a';
  if(m.a==='tackle')return 'a';
  return '';
}
/** A teammate calls for it with at least this weight (HumanView.callAW / callBW, 0..1) = "open". */
export const OPEN_CALL_W=.35;

/** Hold-to-charge tick: one short buzz (ms) as Pass or Shoot reaches full charge and as Pass turns into the long ball. */
export const HAPTIC={tickMs:12,fullMs:18} as const;
// The setting (Island settings → Live matches → Vibration, default on; the row shows only where navigator.vibrate exists:
// not on iPhone Safari). One store per page (dev hot reload).
const HKEY='fi2-match-haptics-v1';
type HStore={on:boolean|null;subs:Set<()=>void>};
const hstore:HStore=((globalThis as {__fi2MatchHaptics?:HStore}).__fi2MatchHaptics??={on:null,subs:new Set()});
/** The browser can vibrate (Android Chrome / Firefox); false on iPhone Safari, desktop Safari and on the server. */
export function hapticsSupported(){return typeof navigator!=='undefined'&&typeof (navigator as {vibrate?:unknown}).vibrate==='function';}
export function hapticsEnabled(){if(hstore.on===null){hstore.on=true;try{hstore.on=localStorage.getItem(HKEY)!=='off';}catch{}}return hstore.on;}
export function setHapticsEnabled(on:boolean){hstore.on=on;try{localStorage.setItem(HKEY,on?'on':'off');}catch{}hstore.subs.forEach(f=>f());}
export function subscribeHaptics(f:()=>void){hstore.subs.add(f);return ()=>{hstore.subs.delete(f);};}
/** One buzz when supported and switched on; never throws (a browser may refuse without a recent tap). */
export function hapticTick(ms:number=HAPTIC.tickMs){if(!hapticsSupported()||!hapticsEnabled())return;try{navigator.vibrate(ms);}catch{}}
