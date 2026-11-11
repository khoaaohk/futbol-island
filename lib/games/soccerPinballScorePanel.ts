/* Futbol Pinball's score panel (Nov 10 2026, arcade comic restyle): the score is the top-bar pill, calls are comic bursts. Replaces the
 * amber dot-matrix (soccerPinballDmd.ts). This file is the pure part: which call a HUD read makes and when a new one may take the
 * panel. components/games/PinballScorePanel.tsx draws the status tab and the call bursts as DOM + CSS (components/games/skins/pinball.module.css).
 * Heat: nothing here runs on its own. The panel holds at most one call; the component clears it with one setTimeout of the call's
 * `life`, and every drawn animation is a finite CSS steps() run that ends with the call. A resting panel has no timer and no rAF. */

const clean=(text:string)=>text.toUpperCase().replace(/[×✕]/g,'x').replace(/[–—→]/g,'-').replace(/[’‘]/g,"'").replace(/[^A-Z0-9!+\-.'%x:/?> ]/g,' ').replace(/\s+/g,' ').trim();
/** A HUD word as panel lettering: capitals, plain punctuation. */
export const callWords=clean;

export type ScoreView={phase:'ready'|'playing'|'paused'|'over';score:number;clock:string;balls:number;division:string;late:boolean;waiting:boolean;message:string;streak?:string;pattern?:string;best?:number};
export type ScoreCallKind='goal'|'lost'|'over'|'text'|'kick'|'save'|'combo'|'mode'|'best';
/** `life` in seconds; `id` changes for every new call (it restarts the call's drawn animation). */
export type ScoreCall={kind:ScoreCallKind;title:string;sub:string;life:number;at:number;id:number};

/** What an in-play coaching line becomes on the panel: a short call, or null for the resting score. Pure. */
export function scoreCall(message:string):Omit<ScoreCall,'at'|'id'>|null{
 const m=message||'';let hit:RegExpMatchArray|null;
 if((hit=m.match(/(MOVE COMPLETE|CORNER FINISH|GOAL)! \+(\d+)/)))return{kind:'goal',title:hit[1]==='GOAL'?'GOAL!':hit[1],sub:'+'+hit[2],life:2.3};
 // The game-over sequence (lib/arcade/games/pinballGame.ts holds the run open while it plays).
 // Endless play: the full-time whistle is a beat inside the run (the bonus under the words; the level is on the status tab).
 if((hit=m.match(/^FULL TIME! \+(\d+) · (LEVEL \d+)/)))return{kind:'mode',title:'FULL TIME!',sub:hit[2]+' · +'+hit[1],life:2.4};
 if((hit=m.match(/^(FULL TIME|GAME OVER) · (\d+)/)))return{kind:'over',title:hit[1],sub:hit[2],life:3.2};
 if(/^RIVAL GOAL/.test(m))return{kind:'lost',title:'RIVAL GOAL',sub:'',life:1.7};
 if(/^Find your timing/.test(m))return{kind:'lost',title:'BALL LOST',sub:'',life:1.7};
 if(/^BUILD → SWITCH|^Launch power|^FINISH! /.test(m))return null;
 const head=clean(m.split(/ · |!|\. |: /)[0]);
 if(!head||head.length>30||/^[A-Z][a-z]/.test(m)&&head.length>17)return null;
 if(/^(SAVED|PARRIED|SWEEPER SAVE|CLEARED OFF THE LINE|OFF THE LINE|GREAT BLOCK|BALL SAVED)/.test(m))return{kind:'save',title:head+'!',sub:'',life:1.6};
 if(/^(MODE|2v1|CUP FINAL|DUGOUT OPEN|GOAL LIT|WALL BROKEN|STOPPAGE TIME|EXTRA BALL|BEAT THE CLOCK|G-O-A-L|TWO ON ONE|CHALLENGE DONE)/.test(m))return{kind:'mode',title:head+(/^[^·.]*!/.test(m)?'!':''),sub:'',life:2.2};
 if(/^(ON FIRE|SWITCH FEET|PERFECT)/.test(m))return{kind:'combo',title:head+(/^[^·.]*!/.test(m)?'!':''),sub:'',life:1.4};
 return{kind:'text',title:head+(/^[^·.]*!/.test(m)?'!':''),sub:'',life:head.length>17?2.4:1.3};
}

export type ScorePanelState={view:ScoreView|null;call:ScoreCall|null;bestShown:boolean;lastMessage:string;n:number};
export const createScorePanel=():ScorePanelState=>({view:null,call:null,bestShown:false,lastMessage:'',n:0});
/** The call has run its life (the component's one timeout): the panel rests on the score again. */
export function endScoreCall(s:ScorePanelState,id:number):ScorePanelState{return s.call?.id===id?{...s,call:null}:s;}

/** A new HUD read. Returns the next state (the same `call` object when nothing new plays). `now` in seconds. Pure. */
export function stepScorePanel(s:ScorePanelState,next:ScoreView,now:number):ScorePanelState{
 const fresh=next.message!==s.lastMessage,prev=s.view??next;let {call,bestShown,n}=s;
 if(next.phase==='ready'||s.view&&next.score<s.view.score){call=null;bestShown=false;}
 const take=(made:Omit<ScoreCall,'at'|'id'>)=>{call={...made,at:now,id:++n};};
 const big=(k:ScoreCallKind)=>k==='goal'||k==='lost'||k==='over';
 if(next.phase==='playing'){
  if(prev.waiting&&!next.waiting&&prev.phase==='playing')take({kind:'kick',title:'KICK OFF',sub:'',life:1.5});
  if(!next.waiting&&next.streak&&next.streak!==prev.streak&&!(call&&big(call.kind)&&call.kind!=='over'))take({kind:'combo',title:clean(next.streak),sub:'',life:1.4});
  if(!next.waiting&&next.pattern&&next.pattern!==prev.pattern&&!(call&&big(call.kind)&&call.kind!=='over'))take({kind:'mode',title:clean(next.pattern),sub:'',life:2.6});
  if(!bestShown&&(next.best??0)>0&&next.score>(next.best??0)){bestShown=true;take({kind:'best',title:'NEW BEST',sub:String(next.score),life:2.6});}}
 // A goal or a lost ball always takes the panel; small calls never interrupt one another faster than every 0.7 s (coaching lines
 // can change several times a second in a scramble) and never cover a big call or a new best.
 if(fresh&&next.phase==='playing'&&!next.waiting){const made=scoreCall(next.message),c=call as ScoreCall|null;
  if(made&&!(c&&!big(made.kind)&&(big(c.kind)||c.kind==='best'||now-c.at<.7||c.title===made.title)))take(made);}
 if(next.phase==='over')call=null;
 return{view:next,call,bestShown,lastMessage:next.message,n};
}
