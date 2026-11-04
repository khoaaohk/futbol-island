// Off-ball runs (join a live game, slice 1, Nov 4 2026). When a teammate (human or AI) has the ball, each outfield
// player picks ONE run on his own staggered think-clock (MatchSim.brainLogic, ~2-4 Hz, never per frame): a run in
// behind, a check toward the ball, holding width, or making space (no clumping on the carrier, and peeling off a
// human so he has room). The result is an offset added to the formation target; the onside cap in computeTargets
// still applies afterwards, so a run in behind is timed level with the last defender, never offside.
// Teaching: "Pass to the player, or pass into the space where they are running."

export const RUN={Hold:0,Beyond:1,Check:2,Wide:3,Space:4} as const;
export type RunKind=typeof RUN[keyof typeof RUN];
export const RUN_NAMES=['hold','beyond','check','wide','space'] as const;

/** Tunables (sim units: the pitch is 270 x 400). */
export const RUNS={
  /** Too close to the carrier (or a human teammate): move away to at least this distance. */
  crowd:20,spaceTo:28,
  /** A teammate this far from the carrier with nobody near the ball checks toward it (offers a short option). */
  checkFrom:52,checkLen:26,supportRadius:32,
  /** Run in behind: forward length (units) and the chance per think for forwards / wide midfielders. */
  beyondLen:34,beyondChanceFwd:.55,beyondChanceMid:.28,
  /** Carrier must have this much time (nearest foe distance) for a run in behind to be worth making. */
  beyondTime:9,
  /** Wide players keep this x from the centre (touchline ≈ 125). */
  wideX:108,wideFrom:55,
  /** Never move more than this from the formation target. */
  maxOffset:40,
} as const;

/** Everything one decision reads, filled by the sim into a reused object (no allocation per think). */
export type RunContext={
  px:number;py:number;hx:number;role:'gk'|'def'|'mid'|'fwd';
  /** +1 when his team attacks toward larger y. */
  dirY:number;
  carrierX:number;carrierY:number;carrierHuman:boolean;
  /** Nearest opponent to the carrier (units): how much time the carrier has. */
  carrierTime:number;
  /** Teammates (not him, not the carrier) within supportRadius of the carrier. */
  supportNear:number;
  /** Nearest human teammate who is NOT the carrier (NaN when none). */
  humanX:number;humanY:number;
};
export const createRunContext=():RunContext=>({px:0,py:0,hx:135,role:'mid',dirY:-1,carrierX:135,carrierY:200,carrierHuman:false,carrierTime:99,supportNear:0,humanX:NaN,humanY:NaN});

/** Pick a run; writes the target offset into `out` and returns its kind. `rnd` is the sim's seeded rng value (0..1). */
export function pickOffBallRun(c:RunContext,rnd:number,out:{x:number;y:number}):RunKind{
  out.x=0;out.y=0;
  if(c.role==='gk')return RUN.Hold;
  const cdx=c.px-c.carrierX,cdy=c.py-c.carrierY,cd=Math.hypot(cdx,cdy)||1;
  // 1. Make space: never stand on the carrier's toes (or a human's); move away, a bit forward.
  const hd=Number.isNaN(c.humanX)?Infinity:Math.hypot(c.px-c.humanX,c.py-c.humanY);
  if(cd<RUNS.crowd||hd<RUNS.crowd){
    const fromX=cd<=hd?c.carrierX:c.humanX,fromY=cd<=hd?c.carrierY:c.humanY,ax=c.px-fromX,ay=c.py-fromY,a=Math.hypot(ax,ay)||1;
    const need=RUNS.spaceTo-Math.min(cd,hd);
    out.x=ax/a*need;out.y=ay/a*need+c.dirY*4;return clampOut(out,RUN.Space);
  }
  const ahead=(c.py-c.carrierY)*c.dirY; // >0: he is ahead of the ball
  // 2. Run in behind: forwards (and wide mids) ahead of a carrier who has time to look up. A human carrier gets
  //    the run more often: he needs someone to pass to.
  if(ahead>-10&&c.carrierTime>RUNS.beyondTime&&(c.role==='fwd'||c.role==='mid'&&Math.abs(c.hx-135)>45)){
    const chance=(c.role==='fwd'?RUNS.beyondChanceFwd:RUNS.beyondChanceMid)*(c.carrierHuman?1.35:1);
    if(rnd<chance){out.y=c.dirY*RUNS.beyondLen;out.x=(c.hx>=135?1:-1)*6;return clampOut(out,RUN.Beyond);}
  }
  // 3. Check to the ball: far from the carrier with nobody offering a short option.
  if(cd>RUNS.checkFrom&&c.supportNear===0&&c.role!=='def'){
    const len=Math.min(RUNS.checkLen,cd-RUNS.supportRadius);out.x=-cdx/cd*len;out.y=-cdy/cd*len;return clampOut(out,RUN.Check);
  }
  // 4. Hold width: a wide player stays near his touchline so the team keeps its triangles.
  if(Math.abs(c.hx-135)>RUNS.wideFrom&&c.role!=='def'){
    const wantX=135+(c.hx>=135?1:-1)*RUNS.wideX;out.x=(wantX-c.px)*.6;return clampOut(out,RUN.Wide);
  }
  return RUN.Hold;
}
function clampOut(out:{x:number;y:number},kind:RunKind):RunKind{
  const l=Math.hypot(out.x,out.y);if(l>RUNS.maxOffset){out.x*=RUNS.maxOffset/l;out.y*=RUNS.maxOffset/l;}return kind;
}
