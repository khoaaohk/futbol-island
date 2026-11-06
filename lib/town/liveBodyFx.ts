// Goalkeeper feel + body moves, the VIEW side (owner Nov 5 2026; docs/join-live-game-design.md "Goalkeeper feel + body moves").
// The sim (lib/town/match/matchSim.ts) decides: a dive's push-off and flight, catch / parry / tip, the move a Trick plays, the
// defender it beats, the shield and the shoulder. This file turns those serials into what you see on every phone of the match:
//   - the keeper's full-stretch dive pose (choreo.dive), the save rings + glove flash (kickFx.burst) and the save sound;
//   - the move on the trickster (combos skill pose / choreo flick-up), the beaten defender's stumble + a ring at his feet;
//   - the shield and shoulder-challenge poses (combos body);
//   - momentum: a sharp cut dips the body (the rig's plant impulse) and keeps the ball tight; a full sprint runs it looser;
//   - the lean into turns and the sprint (PlayerMotion.leanBoost) for human players only.
// A friend's puppet sim gets the same serials and the shield flag from the owner's snapshot (matchNet SNAP_EVENTS + SNAP_BODY); the
// cut is read from the puppet's own positions. Reduced motion / Match effects: Light trim the rings (kickFx levels), never the
// move or the pose. Heat: one small state object per human slot (made once), no allocation per frame, nothing without humans.
import type * as T from 'three';
import type {MatchSim} from './match/matchSim';
import {HUMAN_KEEPER} from './match/matchSim';
import {TRICK_MOVES,HUMAN_BODY,type HumanInput} from './match/humanInputs';
import type {LiveVenue} from './venues';
import {liveWorldX,liveWorldZ,liveWorldYaw} from './venues';
import type {LiveBallSoundPlay} from './liveBallSound';

/** What the HUD / markers need about the human's keeper + body moves (filled with the rest of fieldRuntime.HumanView). */
export type HumanMoveView={
  /** Bumps on each save of mine as keeper: 0 catch, 1 parry, 2 tipped over; big = at full stretch. Bumps on each dive. */
  saveSerial:number;saveKind:0|1|2;saveBig:boolean;diveSerial:number;
  /** Bumps on each body move of mine that beat a defender (the HUD's "Beat him!" + slow motion). */
  beatSerial:number;shield:boolean;shoulderSerial:number;
  /** My goal (world) + the direction out of it (yaw), its width (m); a shot coming at it, catchable at my body; threat 0..1;
   *  my dive reach (world m). Keeper only (NaN / false / 0 otherwise). */
  ownGoalX:number;ownGoalZ:number;outYaw:number;goalWidth:number;shotIn:boolean;catchable:boolean;threat:number;reachM:number;
};
export const createMoveView=():HumanMoveView=>({saveSerial:0,saveKind:0,saveBig:false,diveSerial:0,beatSerial:0,shield:false,shoulderSerial:0,ownGoalX:NaN,ownGoalZ:NaN,outYaw:0,goalWidth:0,shotIn:false,catchable:false,threat:0,reachM:0});
/** The dive reach the arc shows (sim units): the save reach at full stretch plus what a ~quarter-second dive covers. */
export function keeperReachUnits(sim:MatchSim){const H=HUMAN_KEEPER;return sim.saveReach+H.diveReach+H.diveSpeed*(H.diveBy[sim.venue.id]??1)*.25;}
/** A ball heading into `team`'s goal mouth (works on the owner's sim and on a friend's puppet): its crossing x at the keeper's line, else NaN. */
export function shotCrossing(sim:MatchSim,team:'gold'|'blue',lineY:number){
  const b=sim.ball,gy=team==='gold'?392:8,toward=Math.sign(gy-b.y),sp=Math.hypot(b.vx,b.vy);
  if(b.owner||sp<120||Math.sign(b.vy)!==toward||Math.abs(b.vy)<1)return NaN;
  const ly=(lineY-b.y)*toward>0?lineY:gy,t=(ly-b.y)/b.vy;if(!(t>0&&t<2.2))return NaN;
  const x=b.x+b.vx*t;return Math.abs(x-135)<30?x:NaN;
}
export function fillMoveView(out:HumanMoveView,sim:MatchSim,v:LiveVenue,slot:string,team:'gold'|'blue',seen:BodySeen|undefined){
  const h=sim.humans.get(slot),p=sim.players[slot];
  out.saveSerial=h?h.saveSerial:0;out.saveKind=h?h.saveKind:0;out.saveBig=!!h&&h.saveBig;out.diveSerial=h?h.diveSerial:0;
  out.beatSerial=seen?seen.beats:0;out.shield=seen?seen.shieldOn:false;out.shoulderSerial=h?h.shoulderSerial:0;
  if(!p?.isGK){out.ownGoalX=out.ownGoalZ=NaN;out.shotIn=out.catchable=false;out.threat=0;out.reachM=0;out.goalWidth=0;return;}
  const gy=team==='gold'?392:8;out.ownGoalX=liveWorldX(v,135,gy);out.ownGoalZ=liveWorldZ(v,135,gy);out.outYaw=liveWorldYaw(v,0,team==='gold'?-1:1);out.goalWidth=v.goalWidth;
  const cx=shotCrossing(sim,team,p.y);out.shotIn=cx===cx;out.catchable=out.shotIn&&Math.abs(cx-p.x)<=HUMAN_KEEPER.catchR+1;
  const o=sim.ball.owner?sim.players[sim.ball.owner]:null;
  out.threat=out.shotIn?1:o&&o.team!==team&&Math.abs(o.y-gy)<150?Math.max(0,Math.min(1,(150-Math.abs(o.y-gy))/60)):0;
  out.reachM=keeperReachUnits(sim)*v.width/250;
}
/** Per human slot: the serials already played and the momentum read. Made once per slot. */
export type BodySeen={trick:number;dive:number;save:number;shoulder:number;beats:number;shieldOn:boolean;shieldAt:number;hx:number;hy:number;cut:number;plant:boolean};
type Field={sim:MatchSim;venue:LiveVenue;choreo:{stumble(id:string):void;flick(id:string,side:-1|1):void;dive(id:string,contactIn:number,side:-1|1,height:number,facing:number):void;clock:number};
  comboView:{trick(id:string,kind:'stepover'|'croqueta'|'dragBack'|'roulette',side:-1|1,seconds:number):void;body(id:string,type:'shield'|'shoulderCharge',side:-1|1,seconds:number):void};
  effects:{kick:{burst(kind:'save'|'catch'|'beat'|'shoulder',x:number,y:number,z:number,team:'gold'|'blue',big:boolean):void}};ball:T.Object3D;rigs:Map<string,{root:T.Object3D}>};
export function createBodyFx(){
  const seenBy=new Map<string,BodySeen>();
  const seenOf=(slot:string,h:HumanInput)=>{let s=seenBy.get(slot);if(!s){s={trick:h.trickSerial,dive:h.diveSerial,save:h.saveSerial,shoulder:h.shoulderSerial,beats:0,shieldOn:false,shieldAt:-9,hx:0,hy:0,cut:0,plant:false};seenBy.set(slot,s);}return s;};
  const at=(e:Field,id:string,out:{x:number;z:number})=>{const r=e.rigs.get(id),p=e.sim.players[id];if(r?.root.visible){out.x=r.root.position.x;out.z=r.root.position.z;}else if(p){out.x=liveWorldX(e.venue,p.x,p.y);out.z=liveWorldZ(e.venue,p.x,p.y);}return out;};
  const pt={x:0,z:0};
  return {
    seen:(slot:string)=>seenBy.get(slot),
    /** A new trick of `slot` (fieldRuntime's trick serial check): the move on his rig and, when it beat a defender, his stumble. */
    trick(e:Field,slot:string,h:HumanInput,reduced:boolean){
      const s=seenOf(slot,h);s.trick=h.trickSerial;
      if(h.trickKind==='flick')e.choreo.flick(slot,h.trickSide);else e.comboView.trick(slot,h.trickKind,h.trickSide,TRICK_MOVES[h.trickKind].anim);
      if(h.trickBeat&&e.sim.players[h.trickBeat]){s.beats++;e.choreo.stumble(h.trickBeat);if(!reduced){at(e,h.trickBeat,pt);e.effects.kick.burst('beat',pt.x,0,pt.z,h.team,false);}}
    },
    /** Every drawn frame, per human slot: keeper dive + save, shield, shoulder, the cut. `dt` real s. */
    step(e:Field,slot:string,h:HumanInput,reduced:boolean,hear:boolean,sound:LiveBallSoundPlay|null,dt:number){
      const s=seenOf(slot,h),sim=e.sim,p=sim.players[slot];if(!p)return;
      if(h.diveSerial!==s.dive){s.dive=h.diveSerial;
        // Facing out of his goal (sim +y toward the centre): the dive side is the sign of dx × fy (choreo's own convention).
        const fy=Math.sign(200-p.y)||1;e.choreo.dive(slot,HUMAN_KEEPER.diveLag+.1,(h.diveSide*fy>=0?1:-1),.45,Math.atan2(0,fy));}
      if(h.saveSerial!==s.save){s.save=h.saveSerial;const b=e.ball.position;
        e.effects.kick.burst(h.saveKind===0?'catch':'save',b.x,b.y,b.z,h.team,h.saveBig);
        if(hear){sound?.('thud',h.saveBig?.9:.6);if(h.saveBig)sound?.('crowd',.8);}}
      // Shield: back turned to a close opponent while he has it (the owner's flag; a friend's screen: SNAP_BODY.shield).
      const mine=sim.ball.owner===slot,shield=mine&&h.shield;
      const now=e.choreo.clock;
      if(shield&&!s.shieldOn&&now-s.shieldAt>1.4){s.shieldAt=now;e.comboView.body(slot,'shield',h.trickSide,1.1);}
      s.shieldOn=shield;
      if(h.shoulderSerial!==s.shoulder){s.shoulder=h.shoulderSerial;const c=h.shoulderOn?sim.players[h.shoulderOn]:null;
        e.comboView.body(slot,'shoulderCharge',c&&(c.x-p.x)*(Math.sign(200-p.y)||1)<0?-1:1,.8);
        if(c&&sim.ball.owner===h.shoulderOn)e.choreo.stumble(h.shoulderOn!);
        if(c&&!reduced){at(e,h.shoulderOn!,pt);e.effects.kick.burst('shoulder',pt.x,0,pt.z,h.team,false);}
        if(hear)sound?.('thud',.45);}
      // Momentum: a sharp cut on the ball (heading past HUMAN_BODY.cutCos vs ~cutLag s ago) dips the body and tightens the touch.
      const sp=Math.hypot(p.vx,p.vy),lp=Math.hypot(s.hx,s.hy);s.plant=false;
      if(mine&&sp>=HUMAN_BODY.cutSpeed&&lp>=HUMAN_BODY.cutSpeed&&(p.vx*s.hx+p.vy*s.hy)/(sp*lp)<=HUMAN_BODY.cutCos&&s.cut<=0){s.cut=HUMAN_BODY.cutHold;s.plant=true;}
      const k=Math.min(1,dt/HUMAN_BODY.cutLag);s.hx+=(p.vx-s.hx)*k;s.hy+=(p.vy-s.hy)*k;s.cut=Math.max(0,s.cut-dt);
    },
    /** The rig's plant impulse this frame (one frame at the cut). */
    plant(slot:string){const s=seenBy.get(slot);return !!s&&s.plant;},
    /** Ball at a human carrier's feet (fieldRuntime's held point, world): tighter in a cut, looser at full sprint (sim u/s). */
    tighten(slot:string,held:T.Vector3,root:T.Vector3,simSpeed:number){
      const s=seenBy.get(slot);if(!s)return;
      const t=s.cut>0?s.cut/HUMAN_BODY.cutHold:0,loose=Math.max(0,Math.min(1,(simSpeed-70)/30));
      const k=1-.35*t+.22*loose*(1-t);if(k===1)return;
      held.x=root.x+(held.x-root.x)*k;held.z=root.z+(held.z-root.z)*k;
    },
    reset(){seenBy.clear();},
  };
}
