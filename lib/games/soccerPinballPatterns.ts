import type {PinballState} from './soccerPinball';

/* Futbol Pinball: name the football pattern at the moment it happens (arcade part 3, Nov 10 2026).
 *
 * The table already counts the patterns (s.stats.wallPasses, s.stats.rebounds, s.stats.mbStarts). This watcher only
 * diffs those three counters once per frame (three integer compares, no allocation) and, when one goes up, holds a
 * short label + a five-to-eight-word "why" for the HUD's one reused pattern chip. At most one label every GAP seconds
 * of real time, so it never chatters. Reduced motion keeps the words (they teach) and drops the chip's animation in CSS.
 * Physics, scoring and stepPinball are untouched: this reads state, it never writes it.
 */

export type PinballPatternKind='wallPass'|'rebound'|'twoVOne';
export const PINBALL_PATTERNS:Record<PinballPatternKind,{label:string;why:string}>={
 wallPass:{label:'Wall pass!',why:'Pass, move, get it back.'},
 rebound:{label:'Rebound goal!',why:'Keepers spill shots. Strikers follow them in.'},
 twoVOne:{label:'2v1!',why:'Two against one: make the keeper choose.'},
};
/** Seconds a label stays up, and the minimum real-time gap between two labels. */
export const PATTERN_SHOW=2.6, PATTERN_GAP=4;

/** Endless play (Nov 10 2026): every new match (level) puts one pattern in focus, in turn, so a long run keeps teaching all three. */
export const PINBALL_FOCUS_ORDER:readonly PinballPatternKind[]=['wallPass','rebound','twoVOne'];
export const pinballMatchFocusKind=(match:number):PinballPatternKind=>PINBALL_FOCUS_ORDER[(Math.max(1,Math.floor(match))-1)%PINBALL_FOCUS_ORDER.length];
const FOCUS_LINE:Record<PinballPatternKind,string>={wallPass:'This match: the wall pass. Pass, move, get it back.',rebound:'This match: the rebound. Follow your shot in.',twoVOne:'This match: the 2v1. Make the keeper choose.'};
/** The coaching line for a new match. */
export const pinballMatchFocus=(match:number)=>FOCUS_LINE[pinballMatchFocusKind(match)];

export type PinballPatternWatch={kind:PinballPatternKind|null;shown:PinballPatternKind|null;until:number;clock:number;last:number;wall:number;reb:number;mb:number;count:number;match:number;mbBase:number};
export function createPinballPatternWatch():PinballPatternWatch{return{kind:null,shown:null,until:0,clock:0,last:-99,wall:0,reb:0,mb:0,count:0,match:1,mbBase:0};}
export function resetPinballPatternWatch(w:PinballPatternWatch){w.kind=w.shown=null;w.until=0;w.clock=0;w.last=-99;w.wall=w.reb=w.mb=0;w.match=1;w.mbBase=0;}

/** Call once per frame after stepPinball with REAL dt. Returns true on the frame a new label starts. */
export function watchPinballPatterns(w:PinballPatternWatch,s:PinballState,dt:number):boolean{
 w.clock+=dt;
 const st=s.stats;let hit:PinballPatternKind|null=null;
 // A new match names the 2v1 again on its first two breakaways (the count used to be for the whole run).
 if(s.match!==w.match){w.match=s.match;w.mbBase=s.match>1?w.mb:0;}
 // Rebound first (2v1 named only on a match's first two breakaways; Champions Night starts every ball as one): a rebound goal is the rarest and the clearest lesson; 2v1 next; the wall pass is the most common.
 if(st.rebounds>w.reb)hit='rebound';else if(st.mbStarts>w.mb&&st.mbStarts-w.mbBase<=2)hit='twoVOne';else if(st.wallPasses>w.wall)hit='wallPass';
 w.wall=st.wallPasses;w.reb=st.rebounds;w.mb=st.mbStarts;// also follows a reset back down to 0
 if(w.kind&&w.clock>=w.until)w.kind=null;
 if(!hit||w.clock-w.last<PATTERN_GAP)return false;
 w.kind=w.shown=hit;w.last=w.clock;w.until=w.clock+PATTERN_SHOW;w.count++;
 return true;
}
/** The pattern to print: the live one, else the last one (kept so the chip can fade out with its words). */
export function pinballPatternShown(w:PinballPatternWatch){const k=w.kind??w.shown;return k?PINBALL_PATTERNS[k]:null;}
