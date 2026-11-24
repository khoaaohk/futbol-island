/**
 * The ONE train bonk (owner, Nov 24 2026: "push them out and give animation of bonk or crash and say 'need to keep heads up and
 * scan'"). Every train hit uses it: knocked off a roof at the tunnel portal (trainRoof), swept off the track by a moving train's
 * front, and running / riding into a train (a moving one's side, or a stopped one at speed on a scooter / bike / moped). The
 * trains never change speed (the shared timetable: other players ride them); the local player is thrown clear instead.
 *  - The throw: from where you were hit to a safe spot Town picks (ground beside the line, never into the tunnel; the sea only
 *    off a bridge / trestle), over THROW_S s on a little arc, a squash on impact, one back flip (none with reduced motion), a short
 *    camera shake (none with reduced motion), then the rooftop system's 'dizzy' pose for DIZZY_S s (its stars). No damage, no coins.
 *  - The line: a speech bubble over the player, mostly about scanning (AGENTS.md: teach football; a midfielder checks over the
 *    shoulder before the ball arrives), with a share of tunnel / track / splash lines. A shuffled bag per kind: no repeats until the
 *    pool is used up, never the same line twice in a row. LINE_COOLDOWN s between lines (a second hit inside it still throws you).
 *  - Tip (once per session): the safety tip after the first roof bonk. (The Scan Trainer tip is left out: the game has no deep link
 *    to /scan; the trainer is a site page only, Nov 24 2026.)
 * Pure (no three.js, no DOM): Town moves the player and draws the pose. No allocation per frame.
 */
export type BonkKind='tunnel'|'track'|'side'|'splash';
/** Throw length (s; reduced motion: a quicker slide), the dizzy pose after it (s: rooftop recovery; under ROOF_RECOVERY_TIME × 0.28,
 *  so the crash squash never flattens the rig), the line's cooldown and bubble time (s), the arc's extra height (m). */
export const THROW_S=.85,THROW_REDUCED_S=.45,DIZZY_S=1.15,LINE_COOLDOWN=4,BUBBLE_S=3.4,ARC_H=1.6,SHAKE_S=.35,SHAKE_M=.22;
/** Scanning lines (the learning point: keep your head up, check over your shoulder before the ball, or the train, arrives).
 *  No numbers: the "Xavi checked his shoulders N times" stat has no source we can cite, so it is phrased without one. */
export const SCAN_LINES:readonly string[]=[
 'Need to keep my head up and scan!',
 'Scan, scan, scan — I didn\'t scan!',
 'Head up! A good midfielder checks over the shoulder.',
 'Should\'ve looked both ways — like before receiving a pass!',
 'Pro tip: scan before the ball (or the train) arrives.',
 'Even Xavi kept checking his shoulders before getting the ball!',
 'Eyes up! Awareness wins matches.',
];
export const KIND_LINES:Readonly<Record<BonkKind,readonly string[]>>={
 tunnel:['Ouch! That hurts — won\'t do that again!','Bonk! Who put a mountain there?','Note to self: tunnels are low.','My head! The train ducked, I didn\'t.','Ow ow ow… next time I\'m buying a ticket!','Even goalkeepers duck for crossbars!'],
 track:['Whoa! Should\'ve checked the timetable!','Note to self: trains don\'t stop for me.','Ouch! The 3:10 to Coral Cay was right on time.','Like a sliding tackle — but from a train!','Next time I\'ll wait behind the yellow line.'],
 side:['Oof! That train came out of nowhere — I wasn\'t scanning!','Bonk! Trains always win the shoulder barge.','Ouch! Next time I\'ll look before I dribble across.'],
 splash:['Splash! Should\'ve checked over my shoulder!','Glug! Note to self: scan before the bridge.'],
};
export const SAFETY_TIP='Safety tip: on real trains, never ride outside — and in football, keep your head up so you see what\'s coming!';
/** The pool for a kind: its own lines and the scanning lines, about half each. */
export const bonkPool=(kind:BonkKind):readonly string[]=>[...KIND_LINES[kind],...SCAN_LINES];

/** A seeded shuffle bag per kind (deterministic for tests): every line once before any repeats, never twice in a row. */
export function createBonkLines(seed=1){
 let r=seed>>>0||1;const rnd=()=>{r^=r<<13;r>>>=0;r^=r>>>17;r^=r<<5;r>>>=0;return r/4294967296;};
 const bags=new Map<BonkKind,string[]>();let last='';
 return {next(kind:BonkKind):string{
  let bag=bags.get(kind);if(!bag||!bag.length){bag=[...bonkPool(kind)];for(let i=bag.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag[bag.length-1]===last&&bag.length>1)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];bags.set(kind,bag);}
  last=bag.pop()!;return last;}};
}

export type BonkPose={/** squash 0 … 1 (impact) */squash:number;/** back flip angle (rad, body pitch; 0 with reduced motion) */flip:number;/** camera shake (m) */shake:number};
export function createTrainBonk(seed=1){
 const lines=createBonkLines(seed);
 const s={active:false,age:0,dur:THROW_S,kind:'track' as BonkKind,x0:0,y0:0,z0:0,x1:0,y1:0,z1:0,peak:0,reduced:false,
  /** facing during the throw (rad): toward where the hit came from, so the flip reads as knocked backwards */yaw:0,
  lineAt:-1e9,clock:0,tips:{safety:false},splash:false};
 const pose:BonkPose={squash:0,flip:0,shake:0};
 return {
  state:s,
  get active(){return s.active;},
  /** Start a throw from (x0, y0, z0) to the safe spot (x1, y1, z1); `yaw`: the facing (toward the train). Returns the bubble line, or
   *  null inside the line cooldown (the throw still happens). `splash`: it ends in the sea (Town hands over to the swim system). */
  start(kind:BonkKind,x0:number,y0:number,z0:number,x1:number,y1:number,z1:number,yaw:number,reduced:boolean,splash=false):string|null{
   Object.assign(s,{active:true,age:0,dur:reduced?THROW_REDUCED_S:THROW_S,kind,x0,y0,z0,x1,y1,z1,yaw,reduced,splash,peak:Math.max(y0,y1)+(reduced?.3:ARC_H)});
   if(s.clock-s.lineAt<LINE_COOLDOWN)return null;s.lineAt=s.clock;return lines.next(splash?'splash':kind);},
  /** Ages the bonk; while throwing, writes the spot (out.x, out.y, out.z). Returns 'flying', 'landed' (this step) or 'idle'. */
  step(dt:number,out:{x:number;y:number;z:number}):'flying'|'landed'|'idle'{
   s.clock+=dt;if(!s.active)return 'idle';s.age+=dt;const t=Math.min(1,s.age/s.dur),e=1-(1-t)*(1-t);
   out.x=s.x0+(s.x1-s.x0)*e;out.z=s.z0+(s.z1-s.z0)*e;
   // the arc: up to the peak and down onto y1 (a parabola through y0 at t 0, the peak at ~t 0.4, y1 at t 1)
   const a=s.peak-s.y0,b=s.peak-s.y1,tp=Math.sqrt(a)/(Math.sqrt(a)+Math.sqrt(b)||1);out.y=t<tp?s.peak-a*((tp-t)/tp)**2:s.peak-b*((t-tp)/(1-tp||1))**2;
   if(t>=1){s.active=false;return 'landed';}return 'flying';},
  /** The drawn overlay this frame (squash on impact, the flip, the camera shake). */
  pose():BonkPose{pose.squash=pose.flip=pose.shake=0;if(!s.active)return pose;const t=Math.min(1,s.age/s.dur);
   pose.squash=s.age<.14?Math.sin(s.age/.14*Math.PI)*.8:0;
   if(!s.reduced){const f=Math.min(1,Math.max(0,(t-.08)/.8));pose.flip=-Math.PI*2*f*f*(3-2*f);pose.shake=s.age<SHAKE_S?SHAKE_M*(1-s.age/SHAKE_S):0;}
   return pose;},
  /** The once-per-session tip after a landing: the safety tip after the first roof bonk. */
  tip(kind:BonkKind):string|null{if(kind==='tunnel'&&!s.tips.safety){s.tips.safety=true;return SAFETY_TIP;}return null;},
  cancel(){s.active=false;},
 };
}
export type TrainBonk=ReturnType<typeof createTrainBonk>;
