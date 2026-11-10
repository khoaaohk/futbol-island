/** Island Strikers full-time coaching copy (pure, tested in tests/striker-feedback.cjs). */
/** One coaching line at full time, from how the player passed (scan habit) and finished. */
export function scanTakeaway(v:{safe:number;risky:number;clean:number;gold:number;passes:number;tried?:number;done?:number}){
 const total=v.safe+v.risky,of=(n:number)=>n===total?(total===1?'your pass':`all ${total} of your passes`):`${n} of your ${total} passes`;
 if(total===0)return 'You kept the ball yourself. Look up before you dribble: a cyan ring means a teammate is free.';
 if(v.risky>v.safe&&v.tried&&v.done===v.tried)return `${v.tried===1?'Your pass':'Your passes'} got there, but through a blocked lane. Next time look first and pick the cyan ring.`;
 if(v.risky>v.safe)return `${of(v.risky).replace(/^./,c=>c.toUpperCase())} went into a blocked lane. Look over your shoulder before the ball arrives, then pick the cyan ring.`;
 if(v.gold>0&&v.clean>0)return `Good scanning: ${of(v.safe)} went into open lanes, and ${v.clean} clean ${v.clean===1?'strike':'strikes'}. Control beats power.`;
 if(v.passes<4)return 'Your passes went into open lanes. Now play more of them: every pass pulls a defender out of shape.';
 return `Good scanning: ${of(v.safe)} went into open lanes. Keep looking before you receive.`;}
/** Full-time pass stat in plain words: "3 of 5" or "0". */
export const passLine=(done:number,tried:number)=>tried?`${done}/${tried}`:'0';
/* "Scan first" (Nov 10 2026, arcade part 3): one in-match prompt. When the player picks a pass the match already scores as
 * risky (laneCover, the same test that counts riskyPasses) while a clearly safer Gold teammate was open (state.laneOpen, the
 * scan rings), strikerMatch stores who it was (scanMateWords / saferMate live there: strikerMatch stays import-free for its tests). The cue waits for the next dead ball (a goal pause or a set piece), so it never
 * shows during live play; never before minute one, at most SCAN_CUE_MAX a match, and only about a pass from the last few
 * seconds. Gold attack +x, so a player's left is -z. */
export const SCAN_CUE_MAX=2,SCAN_CUE_FROM=60,SCAN_CUE_FRESH=8,SCAN_CUE_SHOW=3.2;
export type ScanCue={shown:number;seen:number;dead:boolean;until:number;text:string;t:number};
export const createScanCue=():ScanCue=>({shown:0,seen:-99,dead:false,until:0,text:'',t:0});
export function resetScanCue(c:ScanCue){c.shown=0;c.seen=-99;c.dead=false;c.until=0;c.text='';c.t=0;}
/** Once per frame. Returns the cue text while it is showing, else ''. Cheap: a few compares. */
export function stepScanCue(c:ScanCue,s:{time:number;goalPause:number;setPiece:{kind:string};finished:boolean;scanMissAt:number;scanMissText:string},now:number){
 if(s.time<c.t)resetScanCue(c);c.t=s.time;// a new match: the two-a-match cap starts again
 const dead=s.goalPause>0||s.setPiece.kind!=='';
 if(dead&&!c.dead&&!s.finished&&c.shown<SCAN_CUE_MAX&&s.scanMissAt>c.seen&&s.scanMissAt>=SCAN_CUE_FROM&&s.time-s.scanMissAt<=SCAN_CUE_FRESH){
  c.seen=s.scanMissAt;c.shown++;c.until=now+SCAN_CUE_SHOW;c.text=s.scanMissText;}
 c.dead=dead;
 if(c.text&&(now>=c.until||!dead))c.text='';// live play is back: the cue goes with it
 return c.text;}
