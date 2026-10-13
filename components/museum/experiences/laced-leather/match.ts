import {LEATHER} from './facts';
import {MODERN_G,gramsAt} from './model';
/**
 * laced-leather · "The rain match" (Oct 10 2026 interaction pass: the exhibits must be as playable as the penalty kick).
 * The pure rules of the playable moment, kept out of React so tests/museum-exp-laced-leather.cjs can check them in Node.
 *
 * A rainy Saturday, one match, eight long passes from minute 0 to minute 90. Hold Kick (or press and hold the pitch): a
 * blue marker sweeps along the metre ruler to where a DRY ball would land; let go to kick (Oct 12 2026 anatomy restyle). With the leather ball the rain soaks in pass by pass (410 g at
 * kick-off, 595 g at full time, the 2023 lab numbers), and the same kick goes shorter, so the visitor has to aim further past
 * the team-mate as the match goes on. The modern ball stays the same weight all match: replay with it to feel the difference.
 *
 * The flight is worked out, not measured: a kick hands the ball a speed v = u·(M + m_dry)/(M + m) (a foot of effective mass M
 * hitting a ball of mass m), and the carry goes with v², so a heavier ball leaves the foot slower and lands shorter. M is a
 * rounded 1 kg. Air drag and spin are left out: this is a practice game, and the page says so.
 */
export const KICKS=8;
/** Longest carry (metres) of a full-power kick with a dry ball. */
export const DMAX=36;
/** Effective foot mass (kg) in the kick model. */
export const FOOT_KG=1;
/** One full sweep of the power marker, 0 → full (ms). It sweeps back and forth until you let go, a few times at most. */
export const SWEEP_MS=1100,SWEEPS=12;
export type MatchBall='leather'|'modern';
export const MATCH_BALLS:Record<MatchBall,{label:string}>={leather:{label:'Leather ball'},modern:{label:'Modern ball'}};

/** Match minute of kick k (0-based): kick-off to full time. */
export const minuteOf=(k:number)=>Math.round(k/(KICKS-1)*90);
/** How soaked the leather ball is at kick k (0 dry at kick-off → 1 at full time, standing for the lab's 90 minutes in water). */
export const soakOf=(k:number)=>Math.max(0,Math.min(1,k/(KICKS-1)));
/** The ball's weight at kick k. */
export const gramsOf=(ball:MatchBall,k:number)=>ball==='leather'?gramsAt(soakOf(k)):MODERN_G;
/** How far a kick carries compared with the same kick on a dry leather ball (1 = the same). */
export const carryFactor=(g:number)=>{const f=(FOOT_KG+LEATHER.dry/1000)/(FOOT_KG+g/1000);return f*f;};
/** Where a kick of power p (0–1) lands, in metres. */
export const carry=(p:number,g:number)=>Math.max(0,Math.min(1,p))*DMAX*carryFactor(g);
/** Where the same kick would land with a dry ball (the power marker's reading). */
export const dryCarry=(p:number)=>Math.max(0,Math.min(1,p))*DMAX;

/** Power from the sweep: a triangle wave, 0 → 1 in SWEEP_MS, then back. */
export function powerAt(ms:number){const t=Math.max(0,ms)/SWEEP_MS,n=Math.floor(t),f=t-n;return n%2===0?f:1-f;}

/** Eight team-mates at different distances, 10–26 m (reachable with a soaked ball: 36 m × 0.78 ≈ 28 m). Never two alike in a row. */
export const TARGET_MIN=10,TARGET_MAX=26;
export function targets(rng:()=>number=Math.random):number[]{
 const out:number[]=[];
 while(out.length<KICKS){let t=Math.round((TARGET_MIN+rng()*(TARGET_MAX-TARGET_MIN))*2)/2;const prev=out[out.length-1];
  // too close to the last one: step 6 m along (wrapping inside the range), so even a stuck rng always finishes
  if(prev!=null&&Math.abs(t-prev)<4){t=prev+6>TARGET_MAX?prev-6:prev+6;}
  out.push(t);}
 return out;
}

/** Points by how far the ball lands from the team-mate's feet: 3 / 2 / 1 / 0. */
export const ZONES=[1.5,3.5,6] as const;
export function scoreKick(landed:number,target:number){
 const miss=landed-target,off=Math.abs(miss);
 const pts=off<=ZONES[0]?3:off<=ZONES[1]?2:off<=ZONES[2]?1:0;
 const say=pts===3?'On the boot!':pts===2?'Close: a step away.':pts===1?(miss<0?'Short: they had to come back for it.':'Long: they had to chase it.'):(miss<0?'Way short: it died in the mud.':'Way over their head.');
 return {pts,miss,say};
}
export const MAX_POINTS=KICKS*3;
export function verdict(score:number,ball:MatchBall='leather'){
 if(ball==='modern')return score>=14?'Every pass felt the same: the modern ball kept its weight all match. Now try the leather one!':'Same weight all match, so the same kick goes the same way. Try again, then try the leather ball.';
 if(score>=20)return 'Master of the mud: you felt the ball get heavy and kicked harder.';
 if(score>=14)return 'Good passing! The late kicks are the hard ones.';
 if(score>=8)return 'A tough day in the rain. Try aiming past your team-mate as the ball soaks up water.';
 return 'The ball won that one. Hold longer as the match goes on.';
}
