/**
 * The public island's holdout READING (Nov 12 2026, phase 2; docs/multiplayer/PHASE2-VERIFY.md). Built on the SERVER from the range's
 * merged daily totals, like partyReport.ts. Compares the two arms of the 10% holdout (lib/multiplayer/holdout.ts): 'on' devices start
 * with other players shown by default, 'hold' devices start as Just me. Intent to treat: a tab counts in the arm it STARTED in, even
 * if the player then switched. Pure and client-safe (the admin card imports the types only).
 *
 * OFF unless NEXT_PUBLIC_PUBLIC_HOLDOUT_READING=1 on top of the two public flags (holdoutReadingEnabled(), legal sign-off first):
 * off, it answers status 'off' and reads nothing. Exact totals (Nov 8 2026 owner ruling); a ratio is null when there is nothing to
 * divide by. Totals only: no player, device, world or session id exists in these counts.
 */
import type {Merged} from './core';
import {HOLDOUT_ARMS} from './countIds';
import {holdoutReadingEnabled} from '../multiplayer/publicFlag';

export type HoldoutArmId=typeof HOLDOUT_ARMS[number];
export type HoldoutArmRow={arm:HoldoutArmId;visits:number;returning:number;minutes:number;minutesPerVisit:number|null;returningShare:number|null};
export type HoldoutReport={status:'off'|'empty'|'ok';arms:HoldoutArmRow[];
 /** The 'hold' arm's share of visits (about 0.10 when the arms are drawn as designed). */
 holdShare:number|null};

const ARM_ID:Record<HoldoutArmId,string>={on:'mp:pub_arm_on',hold:'mp:pub_arm_hold'};
const round2=(x:number)=>Math.round(x*100)/100;

export function buildHoldout(m:Pick<Merged,'counts'>,on=holdoutReadingEnabled()):HoldoutReport{
 if(!on)return {status:'off',arms:[],holdShare:null};
 const C=m.counts;
 const arms=HOLDOUT_ARMS.map(arm=>{
  const visits=C[ARM_ID[arm]]||0,returning=C[`mp:pub_hx_${arm}_back`]||0,minutes=C[`mp:pub_hx_${arm}_min`]||0;
  return {arm,visits,returning,minutes,minutesPerVisit:visits>0?round2(minutes/visits):null,returningShare:visits>0?round2(Math.min(1,returning/visits)):null};
 });
 const all=arms.reduce((a,r)=>a+r.visits,0);
 return {status:all>0?'ok':'empty',arms,holdShare:all>0?round2(arms[1].visits/all):null};
}
