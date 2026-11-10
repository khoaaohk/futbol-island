/**
 * Turning the gashapon knob by hand (owner, Nov 10 2026: "allow the player to manually spin the gashapon machine as well as the
 * btn"). A pure recogniser, no DOM and no timers: components/GashaponMachineFace.tsx feeds it pointer events (one pointer, with
 * pointer capture) and turns the 3D knob to `angle` 1:1 under the finger (lib/gashapon/gashaponFace.ts gashaponFx.turn).
 *  - circular drag round the knob's centre: the unwrapped angle, clockwise on screen positive (the way the spin turns it);
 *  - a plain horizontal swipe across the knob counts too (small fingers): net dx x SWIPE_GAIN / radius, right = clockwise, as
 *    long as the finger stays within SWIPE_BAND x radius of its starting height (a circle leaves that band at once); whichever
 *    of the two has gone further is the turn;
 *  - near the centre the angle is noise, so moves inside DEAD x radius only feed the swipe;
 *  - at COMMIT (three quarters of a turn) in one go it reports 'commit' ONCE (the caller runs the same spin as the button);
 *    released earlier it reports 'spring' (the knob springs back, nothing is charged);
 *  - a second pointer is ignored; a cancelled pointer springs back.
 */
export const KNOB_COMMIT=Math.PI*1.5,KNOB_SWIPE_GAIN=2.4,KNOB_DEAD=.4,KNOB_MOVED=.25,KNOB_SWIPE_BAND=.6;
export type KnobTurn={
 /** True when this press starts the drag (false: another pointer is already turning, or the knob is locked). */
 down(id:number,x:number,y:number,cx:number,cy:number,r:number):boolean;
 /** The turn so far (radians, signed) and whether this move just committed. */
 move(id:number,x:number,y:number):{angle:number;commit:boolean}|null;
 /** Pointer up / cancel: 'commit' already happened, 'spring' back, or null (not our pointer). */
 up(id:number):'committed'|'spring'|null;
 /** The press turned the knob enough to count as a drag (the click that follows it must not spin a second time). */
 readonly moved:boolean;readonly active:boolean;readonly angle:number;
};

export function createKnobTurn():KnobTurn{
 let id:number|null=null,cx=0,cy=0,r=1,last=0,startX=0,startY=0,swipeOk=true,arc=0,committed=false,moved=false,angle=0;
 const at=(x:number,y:number)=>Math.atan2(y-cy,x-cx);
 return {
  get moved(){return moved;},get active(){return id!==null;},get angle(){return angle;},
  down(p,x,y,ox,oy,radius){if(id!==null)return false;id=p;cx=ox;cy=oy;r=Math.max(20,radius);last=at(x,y);startX=x;startY=y;swipeOk=true;arc=0;committed=false;moved=false;angle=0;return true;},
  move(p,x,y){
   if(p!==id)return null;if(committed)return {angle,commit:false};
   const out=Math.hypot(x-cx,y-cy)>r*KNOB_DEAD,a=at(x,y);
   if(out){let d=a-last;if(d>Math.PI)d-=Math.PI*2;else if(d< -Math.PI)d+=Math.PI*2;arc+=d;}
   last=a;if(Math.abs(y-startY)>r*KNOB_SWIPE_BAND)swipeOk=false;
   const swipe=swipeOk?(x-startX)*KNOB_SWIPE_GAIN/r:0;angle=Math.abs(swipe)>Math.abs(arc)?swipe:arc;
   if(Math.abs(angle)>KNOB_MOVED)moved=true;
   if(Math.abs(angle)>=KNOB_COMMIT){committed=true;return {angle,commit:true};}
   return {angle,commit:false};},
  up(p){if(p!==id)return null;id=null;const res=committed?'committed':'spring';if(!committed)angle=0;return res;},
 };
}
