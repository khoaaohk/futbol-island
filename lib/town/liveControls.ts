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

/** The tap shot (released before SHOT_AIM.minHoldMs): the LOW corner away from the keeper (AIM_MARKS index 2 = x -1,
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
