/** Island Strikers game feel (Oct 10 2026 senior game-dev pass). Pure, allocation-free helpers shared by the scene,
 * the component and tests/striker-feel.cjs: the shot gauge's zones, the charge cues, and impact hit-stop. */
import {STRIKER_CLEAN} from './strikerMatch';

/** Overhit starts here (strikerMatch.shoot adds lift above .93 of the charge). */
export const STRIKER_OVERHIT=.93;
/** Shot gauge zone for a charge fraction 0..1: the gold build-up, the cyan clean-strike band, gold again, red overhit. */
export type StrikerGaugeZone='build'|'clean'|'hard'|'over';
export function strikerGaugeZone(f:number):StrikerGaugeZone{return f>=STRIKER_OVERHIT?'over':f>=STRIKER_CLEAN[0]&&f<=STRIKER_CLEAN[1]?'clean':f>STRIKER_CLEAN[1]?'hard':'build';}

/** Charge cue between two frames: one tick as the build starts, a bright "ting" on entering the clean band (release now),
 * a warning as it tips into overhit. Replaces three identical ticks at thirds, which did not line up with the band. */
export type StrikerChargeCue=''|'build'|'band'|'over';
export const STRIKER_CHARGE_BUILD=.3;
export function strikerChargeCue(prev:number,next:number):StrikerChargeCue{
 if(next<prev||next<=0)return '';
 if(prev<STRIKER_OVERHIT&&next>=STRIKER_OVERHIT)return 'over';
 if(prev<STRIKER_CLEAN[0]&&next>=STRIKER_CLEAN[0])return 'band';
 if(prev<STRIKER_CHARGE_BUILD&&next>=STRIKER_CHARGE_BUILD)return 'build';
 return '';}

/** Impact hit-stop: a few frames where the simulation holds and the bodies freeze on the contact pose, then play resumes.
 * `hold` is seconds (kept under 0.1 s so control never feels taken away), `kick` the camera punch 0..1 (scene skips it
 * under reduced motion). Goals keep their own longer freeze (STRIKER_HIT_STOP inside the celebration). */
export type StrikerImpact={hold:number;kick:number};
const NONE:StrikerImpact={hold:0,kick:0};
const IMPACTS:Record<string,StrikerImpact>={
 clean:{hold:.06,kick:.22},special:{hold:.09,kick:.4},steal:{hold:.07,kick:.28},post:{hold:.06,kick:.3},
 save:{hold:.05,kick:.18},hit:{hold:.04,kick:.14},beat:{hold:.05,kick:.18}};
/** Event kind from the sim plus the flags that grade it. Plain shots, passes and touches stay fluid (no hold). */
export function strikerImpact(kind:string,o:{clean?:boolean;special?:boolean;hardShot?:boolean}={}):StrikerImpact{
 if(kind==='shot')return o.special?IMPACTS.special:o.clean?IMPACTS.clean:NONE;
 if(kind==='save')return o.hardShot?IMPACTS.save:NONE;
 return IMPACTS[kind]??NONE;}
export const STRIKER_MAX_HOLD=.1;
