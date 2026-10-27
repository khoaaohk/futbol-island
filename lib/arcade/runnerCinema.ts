/**
 * Breakaway Run cinematic beats (round 3, Oct 26 2026): short, capped camera moments with a breath of slow motion.
 *
 * A beat is a small envelope: ease in (`attack`), hold, then ramp back to normal (`release`). It drives
 *  - timeScale: simulation speed, down to `slow` during the hold, smoothly back to 1 during the release;
 *  - zoom: 0..1 punch-in (the caller maps it to a FOV change of at most CINEMA.maxFov, i.e. <= 12 %);
 *  - low / lift / back: camera offsets in metres for a low hero shot, a rise, or a pull-back.
 *
 * Rules that keep it from ever being annoying or unfair:
 *  - At most one SLOW beat per CINEMA.minGap seconds (real time); a beat that arrives sooner plays its camera
 *    move only, at full speed.
 *  - Slow motion only after the input has resolved (a dodge, hurdle or goal already happened), or across a whole
 *    decision (the goal-line duel), which only ever widens the real-time window, never shrinks it.
 *  - Any player input skips the beat (ramps back to 1x within CINEMA.skipRamp).
 *  - Hard caps: slow >= .35, total beat length <= CINEMA.maxBeat.
 *  - Reduced motion: no slow motion, no zoom, no camera offsets (the beat is ignored).
 * No allocation after creation: every beat is a preset copied into fixed numeric fields.
 */
export type CinemaKind='dodge'|'hurdle'|'goal'|'duel'|'finish'|'save'|'power'|'intro'|'bigair';
type Beat={slow:number;attack:number;hold:number;release:number;zoom:number;low:number;lift:number;back:number;flare:number};
export const CINEMA={minGap:6,maxBeat:1.8,minSlow:.35,maxFov:.12,skipRamp:.12} as const;
export const CINEMA_BEATS:Record<CinemaKind,Beat>={
 // Perfect dodge / jump-over: a quick punch-in and half speed for a moment, then back to full pace.
 dodge:{slow:.45,attack:.06,hold:.3,release:.25,zoom:.55,low:0,lift:0,back:0,flare:.8},
 hurdle:{slow:.4,attack:.06,hold:.32,release:.28,zoom:.5,low:0,lift:.6,back:0,flare:.7},
 bigair:{slow:.5,attack:.08,hold:.3,release:.3,zoom:.25,low:0,lift:1.2,back:.8,flare:.6},
 // Ordinary goal: the camera pushes toward the net (no extra slow: the hit-stop already gives the breath).
 goal:{slow:1,attack:.1,hold:.35,release:.45,zoom:.7,low:0,lift:0,back:0,flare:.5},
 // Goal-line duel: low hero shot of the runner and slow motion across the whole shot decision.
 duel:{slow:.5,attack:.25,hold:.9,release:.45,zoom:1,low:1.6,lift:0,back:-1.2,flare:0},
 // Route won: a replay-style push on the net, slowed, then a long, gentle release.
 finish:{slow:.35,attack:.12,hold:.55,release:.6,zoom:.9,low:.6,lift:0,back:0,flare:1},
 save:{slow:.6,attack:.08,hold:.3,release:.35,zoom:.45,low:.3,lift:0,back:0,flare:0},
 // Power-up: no slow motion, just a speed-line flare and a small pull-back.
 power:{slow:1,attack:.05,hold:.2,release:.4,zoom:0,low:0,lift:0,back:.9,flare:1},
 // Stadium run-in at kick-off: the camera starts high and back and settles behind the runner.
 intro:{slow:1,attack:0,hold:.35,release:1.25,zoom:0,low:0,lift:3.6,back:7,flare:0},
};
const smooth=(u:number)=>u<=0?0:u>=1?1:u*u*(3-2*u);

export function createRunnerCinema(reduced:boolean){
 let kind:CinemaKind|''='',t=0,attack=0,hold=0,release=0,slow=1,zoom=0,low=0,lift=0,back=0,flare=0,clock=0,lastSlow=-99,skipAt=-1,count=0,skipped=0;
 let outScale=1,outEnv=0;
 /** Start a beat. Returns true if it played (false when reduced motion is on or a bigger beat is running). */
 function trigger(k:CinemaKind){
  if(reduced)return false;
  const b=CINEMA_BEATS[k];
  // A running duel/finish is never interrupted by smaller beats.
  if(kind&&(kind==='duel'||kind==='finish')&&k!=='finish'&&envelope()>.05)return false;
  kind=k;t=0;attack=b.attack;hold=b.hold;release=b.release;zoom=b.zoom;low=b.low;lift=b.lift;back=b.back;flare=b.flare;skipAt=-1;
  // One slow beat per minGap seconds; later beats keep their camera move but play at full speed.
  const wantsSlow=b.slow<1;slow=wantsSlow&&clock-lastSlow>=CINEMA.minGap?Math.max(CINEMA.minSlow,b.slow):1;
  if(slow<1)lastSlow=clock;
  // Hard cap on the beat length.
  const total=attack+hold+release;if(total>CINEMA.maxBeat){const k2=CINEMA.maxBeat/total;attack*=k2;hold*=k2;release*=k2;}
  count++;return true;
 }
 function envelope(){if(!kind)return 0;if(t<attack)return smooth(t/Math.max(1e-4,attack));if(t<attack+hold)return 1;
  const r=skipAt>=0?CINEMA.skipRamp:release,start=skipAt>=0?skipAt:attack+hold;return 1-smooth((t-start)/Math.max(1e-4,r));}
 /** Player input: any button or swipe skips the current beat (quick ramp back to 1x). */
 function skip(){if(!kind||skipAt>=0)return;const e=envelope();if(e<=0)return;
  // Jump straight into a short release from the current level.
  skipAt=t;attack=0;hold=0;release=CINEMA.skipRamp;skipped++;
  // Keep continuity: scale offsets by the current envelope so nothing snaps.
  zoom*=e;low*=e;lift*=e;back*=e;flare*=e;slow=1-(1-slow)*e;}
 /** Advance in REAL seconds (not slowed time). */
 function step(dt:number){clock+=dt;if(!kind){outScale=1;outEnv=0;return;}t+=dt;const e=envelope();
  outEnv=e;outScale=1-(1-slow)*e;
  const end=skipAt>=0?skipAt+CINEMA.skipRamp:attack+hold+release;if(t>=end){kind='';outScale=1;outEnv=0;}}
 function reset(){kind='';t=0;outScale=1;outEnv=0;lastSlow=-99;skipAt=-1;}
 return{trigger,skip,step,reset,
  timeScale:()=>outScale,
  /** 0..1 punch-in amount (map to FOV <= CINEMA.maxFov). */zoom:()=>zoom*outEnv,
  /** Camera offsets (m): lower for a hero shot, lift for a rise, back for a pull-back (negative = push in). */
  low:()=>low*outEnv,lift:()=>lift*outEnv,back:()=>back*outEnv,flare:()=>flare*outEnv,
  active:()=>kind!=='',kind:()=>kind,
  debug:()=>({kind,t,slow,scale:outScale,env:outEnv,count,skipped,lastSlow,clock}),
 };
}
export type RunnerCinema=ReturnType<typeof createRunnerCinema>;
