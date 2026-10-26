import type {PinballState} from './soccerPinball';

/* Futbol Pinball crew reactions: what the keeper and the back line DO when a
 * moment lands, so a goal, a lost ball and a save read as football emotion.
 *  - goal (you scored): the keeper slumps (head down, arms hanging) and the
 *    defenders follow one by one, each on his own beat;
 *  - drain / counter goal (you lost the ball): the defenders hop and wave an
 *    arm high ("we won it!"), the keeper punches the air;
 *  - save / parry: the keeper alone gives a short arm-up "mine!".
 *  - kick-off: while you pull the plunger the keeper gets set on his toes.
 * Pure, allocation-free, driven only by the feel layer's real-time clock. It
 * writes pose OPTIONS (celebrate / reaction / anticipate) that the shared
 * island rig already blends, plus a hop height. Gameplay never reads it. */

export type PinballCrewKind='none'|'goal'|'drain'|'save';
export type PinballCrew={kind:PinballCrewKind;age:number;serial:number};
export const PINBALL_CREW_LIFE:Record<PinballCrewKind,number>={none:0,goal:1.5,drain:1.45,save:.8};
/** Each defender's personality: reaction delay (s), hop height (world units), hop rate (Hz). */
const DELAY=[0,.1,.24,.16],HOP=[.1,.17,.24,.13],RATE=[1.7,1.9,2.3,1.6];

export function createPinballCrew():PinballCrew{return{kind:'none',age:0,serial:0};}
export function triggerPinballCrew(c:PinballCrew,kind:Exclude<PinballCrewKind,'none'>){
 // A save never interrupts a bigger moment that is still playing.
 if(kind==='save'&&(c.kind==='goal'||c.kind==='drain')&&c.age<PINBALL_CREW_LIFE[c.kind])return;
 c.kind=kind;c.age=0;c.serial++;
}
export function stepPinballCrew(c:PinballCrew,dt:number){if(c.kind==='none')return;c.age+=dt;if(c.age>=PINBALL_CREW_LIFE[c.kind]+.35){c.kind='none';c.age=0;}}
/** True while a reaction is still easing (keeps the sleeping loop awake). */
export const pinballCrewActive=(c:PinballCrew)=>c.kind!=='none';

const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/** Eased in over .18 s, out over the last .45 s of the life: never snaps. */
function envelope(t:number,life:number){return t<=0?0:smooth(t/.18)*(1-smooth((t-(life-.45))/.45));}

export type PinballCrewPose={celebrate?:number;reaction?:'dejected';reactionProgress?:number;anticipate?:number};

/** Writes actor `index`'s reaction into `pose` (0 keeper, 1..3 defenders) and
 * returns the hop height for the rig's jump argument. Call after the base pose
 * fields are set; it only raises them, so the dive/possession logic still wins. */
export function pinballCrewPose(c:PinballCrew,s:PinballState,index:number,pose:PinballCrewPose,reduced:boolean):number{
 pose.celebrate=0;pose.reaction=undefined;pose.reactionProgress=undefined;
 const keeper=index===0;
 // Kick-off: the keeper gets set as the plunger comes back.
 if(keeper&&s.phase==='ready'&&s.plunger>.05)pose.anticipate=Math.max(pose.anticipate??0,.25+.55*Math.min(1,s.plunger));
 if(c.kind==='none')return 0;
 const life=PINBALL_CREW_LIFE[c.kind],t=c.age-DELAY[index],e=envelope(t,life);
 if(e<=0)return 0;
 if(c.kind==='goal'){
  // Head down. The keeper's starts once his dive has landed.
  if(keeper&&s.keeperCommit>0)return 0;
  pose.reaction='dejected';pose.reactionProgress=Math.min(.78,.25+t/life*.55);return 0;
 }
 if(c.kind==='save'){if(!keeper)return 0;pose.celebrate=e*.9;return 0;}
 // drain: the defending side celebrates winning the ball back.
 pose.celebrate=e;
 if(reduced)return 0;
 const hop=Math.abs(Math.sin(Math.max(0,t)*Math.PI*RATE[index]));
 return hop*hop*HOP[index]*e;
}
