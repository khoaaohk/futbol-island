/** Futbol Tennis hold-to-power (Oct 26 2026). Pure maths shared by the sim, the HUD and the tests.
 *
 * Tap a shot button = the normal shot (exactly the old behaviour). Hold it = wind up: the charge level rises
 * from 0 to 1 in TENNIS_CHARGE.full seconds and keeps going to TENNIS_CHARGE.max. Let go to strike.
 * - 0.80–1.00 is the SWEET window: full power AND a cleaner contact (the skill is letting go on time).
 * - above 1.00 is OVERHIT: the touch gets wild and the ball sails long (or, for a drop, dies in the net).
 * Each shot reads the charge its own way, as in real football-tennis:
 * - Kick: a harder, flatter drive with topspin. It skims the tape and lands deep (risk: net or long).
 * - Lob: a higher, deeper arc with more hang time (risk: long).
 * - Drop: a softer, shorter ball with backspin that dies near the net (risk: overhit, it floats long for the rival).
 * Holding the stick while you let go places the shot: left/right = side, up = deeper, down = shorter. */
export const TENNIS_CHARGE={full:.75,max:1.4,tap:.15,sweetLo:.8,sweetHi:1,soft:.45};
export type TennisPowerGrade=''|'soft'|'power'|'sweet'|'over';
/** Charge level after holding for `held` seconds (0..TENNIS_CHARGE.max). */
export const tennisChargeLevel=(held:number)=>Math.min(TENNIS_CHARGE.max,Math.max(0,held/TENNIS_CHARGE.full));
export function tennisPowerGrade(level:number):TennisPowerGrade{
 if(!(level>=TENNIS_CHARGE.tap))return '';if(level>TENNIS_CHARGE.sweetHi)return 'over';if(level>=TENNIS_CHARGE.sweetLo)return 'sweet';return level>=TENNIS_CHARGE.soft?'power':'soft';}
/** 0..1 power used by the shot shaping (0 for a tap). */
export const tennisPowerAmount=(level:number)=>level<TENNIS_CHARGE.tap?0:Math.min(1,level);
/** 0..1 how far past the sweet window the hold went. */
export const tennisOverAmount=(level:number)=>Math.max(0,Math.min(1,(level-TENNIS_CHARGE.sweetHi)/(TENNIS_CHARGE.max-TENNIS_CHARGE.sweetHi)));
/** Contact quality change: the sweet window rewards timing, overhitting punishes it. */
export function tennisPowerQuality(q:number,level:number){const g=tennisPowerGrade(level);if(g==='sweet')return Math.min(1,q+.08);if(g==='over')return Math.max(.2,q-.12-tennisOverAmount(level)*.3);return q;}
/** Which shot families a hold can shape. Aerial moves (header, scissor, trap) stay taps. */
export const tennisChargeable=(shot:string)=>shot==='auto'||shot==='drive'||shot==='lob'||shot==='drop'||shot==='flick';
/** The shaped flight of one shot. Mutated in place (no allocation in the frame loop). */
export type TennisShape={T:number;clear:number;ts:number;ty:number;tx:number};
/** Before the court clamp: depth and placement. `sign` is the shot direction along y (-1 toward the rival).
 * `depth` is the stick at release (-1 short … +1 deep). */
export function tennisShapeDepth(o:TennisShape,shot:string,level:number,depth:number,sign:number){
 const p=tennisPowerAmount(level);if(p<=0)return o;const d=Math.max(-1,Math.min(1,depth||0));
 if(shot==='drop'){const len=Math.max(.95,Math.abs(o.ty)-.6*p+d*.35);o.ty=sign*len;}
 else if(shot==='lob'||shot==='flick')o.ty+=sign*(.9*p+d*1.1);
 else o.ty+=sign*(.75*p+d*.9);
 return o;
}
/** After the clamp: height, pace and spin, then the overhit risk (it may land out or catch the tape). */
export function tennisShapeFlight(o:TennisShape,shot:string,level:number,sign:number){
 const p=tennisPowerAmount(level),over=tennisOverAmount(level);if(p<=0)return o;
 if(shot==='drop'){o.ts-=3*p;o.clear=Math.max(.06,o.clear*(1-.35*p));o.T+=.12*p;o.ty+=sign*over*2.6;} // overhit: it floats long, a sitter
 else if(shot==='lob'||shot==='flick'){o.clear+=1.15*p;o.T+=.45*p;o.ts+=1.5*p;o.ty+=sign*over*2.3;}
 else{o.T*=1-.24*p;o.clear=Math.max(.07,o.clear*(1-.42*p)-over*.08);o.ts+=7*p;o.ty+=sign*over*1.9;}
 return o;
}
/** Feet slow a little while you wind up (plant, then strike). */
export const tennisChargeFeet=(level:number)=>1-.2*Math.min(1,Math.max(0,level));
/** Short coach line for a released power shot. */
export function tennisPowerLine(shot:string,grade:TennisPowerGrade){
 if(grade==='over')return shot==='drop'?'OVERHIT DROP · it floated long. Let go sooner.':'OVERHIT! Let go as the ring turns gold.';
 if(grade==='sweet')return shot==='drop'?'SWEET DROP! Short and dying by the net.':shot==='lob'||shot==='flick'?'SWEET LOB! High, deep, lots of hang time.':'SWEET STRIKE! Flat, fast and deep.';
 if(grade==='power')return shot==='drop'?'Short drop, backspin on it.':shot==='lob'||shot==='flick'?'Deep lob. Recover to the middle.':'POWER DRIVE! Flat and fast.';
 return '';
}
/** HUD ring colour for the charge level (button ring + court meter use the same three states). */
export const tennisChargeColor=(level:number)=>level>TENNIS_CHARGE.sweetHi?'#ff6b5b':level>=TENNIS_CHARGE.sweetLo?'#ffd34d':'#7ff0e4';
