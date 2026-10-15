/**
 * How the deep-sea boats ride the water (Oct 15 2026, user: "add in animation for the boat, it needs a little more movement with
 * the water when fishing"). Pure maths (no three.js) so tests/fishing-fight.cjs can check the limits; ./deepSeaBoat.ts applies it
 * as ONE group transform per frame, only while the boat is near and on screen (or the player is fishing on it).
 *
 * - The swell: a slow heave with pitch and roll in quadrature, on the island's own water clock (WATER_UNIFORMS.uWaterTime, the
 *   5.6 s swell period the shore swash, the float's bob and the ocean use), so the boat rides the same rhythm as the waves and
 *   holds still whenever the water does (reduced motion, the static-ambience heat tiers).
 * - While the player fishes on it the swell grows a little, a cast rocks it (a damped spring on the roll) and a running fish
 *   leans it toward the run with a small tug.
 * - Reduced motion: a very small heave only (no tilt, no rocking).
 * - The fishing camera rides along at CAMERA_RIDE of the heave, smoothed (./fishingCamera.ts), so the view never sways.
 */
export type BoatMotion={heave:number;pitch:number;roll:number;yaw:number};
export type BoatRide={rollKick:number;rollV:number;lean:number;tug:number;mix:number};
/** Swell amplitudes (m / radians): idle in the overworld, and while fishing on the boat. */
export const BOAT_SWELL={idle:{heave:.035,pitch:.006,roll:.012},fishing:{heave:.07,pitch:.012,roll:.022},reduced:{heave:.012,pitch:0,roll:0}};
/** The cast's rock and a run's lean (radians), and the spring that settles them. */
export const CAST_ROCK=.05,RUN_LEAN=.022,RUN_TUG=.006,ROCK_SPRING=7,ROCK_DAMP=1.7;
/** The camera follows this share of the heave (and none of the tilt). */
export const CAMERA_RIDE=.3;
/** Absolute limits the motion never passes (tests): heave m, tilt radians. */
export const BOAT_LIMITS={heave:.1,tilt:.06};
const SWELL_P=5.6;
export const createBoatRide=():BoatRide=>({rollKick:0,rollV:0,lean:0,tug:0,mix:0});
/**
 * One step. `t` the shared water clock (s), `seed` a per-boat phase, `fishing` the player fishes on this boat, `lean` the
 * fight's pull (-1..1, a run) and `kick` a cast this frame. Returns the pose to apply (heave in m, angles in radians).
 */
export function stepBoatMotion(r:BoatRide,dt:number,t:number,seed:number,o:{fishing:boolean;reduced:boolean;lean?:number;kick?:boolean}):BoatMotion{
 const step=Math.max(0,Math.min(dt,.05));
 // Ease between the idle and the fishing swell (no jump when a session starts or ends).
 r.mix+=((o.fishing?1:0)-r.mix)*Math.min(1,step*1.2);
 if(o.reduced){r.rollKick=r.rollV=r.lean=r.tug=0;const a=BOAT_SWELL.reduced;return {heave:Math.sin((t/SWELL_P+seed)*Math.PI*2)*a.heave,pitch:0,roll:0,yaw:0};}
 const A=BOAT_SWELL.idle,B=BOAT_SWELL.fishing,k=r.mix,heaveA=A.heave+(B.heave-A.heave)*k,pitchA=A.pitch+(B.pitch-A.pitch)*k,rollA=A.roll+(B.roll-A.roll)*k;
 const ph=(t/SWELL_P+seed)*Math.PI*2,chop=Math.sin(ph*2.3+1.1)*.15;
 if(o.kick&&o.fishing)r.rollV+=CAST_ROCK*ROCK_SPRING*.55;
 // The cast's rock: a damped spring on the roll (settles in about two seconds).
 r.rollV+=(-ROCK_SPRING*r.rollKick-ROCK_DAMP*r.rollV)*step;r.rollKick+=r.rollV*step;
 const leanTarget=o.fishing?Math.max(-1,Math.min(1,o.lean??0)):0;r.lean+=(leanTarget*RUN_LEAN-r.lean)*Math.min(1,step*2.5);r.tug+=(leanTarget*RUN_TUG-r.tug)*Math.min(1,step*2);
 const clamp=(v:number,m:number)=>Math.max(-m,Math.min(m,v));
 return {heave:clamp(Math.sin(ph)*heaveA*(1+chop*.4),BOAT_LIMITS.heave),pitch:clamp(Math.cos(ph)*pitchA,BOAT_LIMITS.tilt),
  roll:clamp(Math.sin(ph+.9)*rollA*(1+chop)+r.rollKick+r.lean,BOAT_LIMITS.tilt),yaw:clamp(r.tug,BOAT_LIMITS.tilt)};
}
/** Has the ride settled (no rock or lean left)? Then an idle boat out of view needs no more matrix writes. */
export const boatSettled=(r:BoatRide)=>Math.abs(r.rollKick)<1e-4&&Math.abs(r.rollV)<1e-4&&Math.abs(r.lean)<1e-4&&Math.abs(r.tug)<1e-4&&r.mix<1e-3;
