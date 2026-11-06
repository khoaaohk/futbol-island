// Slow motion curves (owner Nov 5 2026: "make the tricks slow motion even better along with the shot slow motion";
// docs/join-live-game-design.md "Kick effects"). Pure maths, shared by liveJoinRuntime and the tests.
// A moment eases INTO its slow scale over SLOW_MO.in (no hard snap), holds, and eases back out over `out`, ending at exactly 1.
// A shot first freezes for `freeze` (1-2 frames at the strike), then eases up from still to its slow scale.
// Local only: liveJoinRuntime.timeScale is 1 on a shared match (friends' sims keep real time); camera / vignette may still play.
export const SLOW_MO={in:.12,out:.18,freeze:.035,/** a clean tackle of mine: the match nearly stops for this long */hitPause:.07,hitScale:.06,/** hard-shot camera punch */punchIn:.08,punchOut:.28,punch:.12,/** camera shake (m, s) */shake:.07,shakeT:.22} as const;
const smooth=(t:number)=>t<=0?0:t>=1?1:t*t*(3-2*t);
/** Time scale `age` real seconds into a slow-motion moment (1 = normal). */
export function slowMoScale(age:number,scale:number,hold:number,out:number=SLOW_MO.out,freeze=0){
  if(age<0)return 1;
  if(age<freeze)return 0;
  const e=(age-hold)/Math.max(.001,out);if(e>=1-1e-9)return 1;// exactly 1 (no float residue)
  const lo=freeze>0?scale*smooth((age-freeze)/SLOW_MO.in):1-(1-scale)*smooth(age/SLOW_MO.in);
  return e<=0?lo:lo+(1-lo)*smooth(e);
}
/** The moment is over (its scale is back to exactly 1). */
export const slowMoDone=(age:number,hold:number,out:number=SLOW_MO.out)=>age-hold>=out-1e-9;
/** A short there-and-back weight 0..1 (the hard-shot camera punch): up over `inS`, down over `outS`; 0 outside. */
export function punchWeight(age:number,inS:number=SLOW_MO.punchIn,outS:number=SLOW_MO.punchOut){if(age<0||age>=inS+outS)return 0;return age<inS?smooth(age/inS):1-smooth((age-inS)/outS);}
