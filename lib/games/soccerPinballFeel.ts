import {pinballDivision,plungerPull,type PinballState} from './soccerPinball';
import {COACH_TIPS,PINBALL_MODES,TRAINING_GOAL,ladderRung,flagWord,pinballModeInfo,savePinballStars,starCount,type PinballTable} from './soccerPinballTable';

/* Game-feel layer for Futbol Pinball. Pure and allocation-free per frame: it
 * diffs the simulation's monotonically increasing event counters once per
 * rendered frame and turns them into hit-stop, weighted shake, pooled score
 * pop-ups, extra sound cues and an end-of-ball summary. The physics never
 * reads anything from here except the hit-stop time scale. */

export type PinballPopupKind='score'|'goal'|'lit'|'save'|'rescue'|'warn';
export type PinballPopup={age:number;x:number;y:number;text:string;kind:PinballPopupKind;serial:number};
export const PINBALL_POPUP_LIFE=.9, PINBALL_POPUPS=4;

export type PinballFeel={
 /** Real seconds of frozen simulation left. */
 hitStop:number;
 /** 0..1 camera-shake energy; walls barely count, big hits do. */
 shake:number;
 drainFlash:number;rescueFlash:number;
 /** Neon ring pulses: table x/y of the latest big hit, serial bumps per spawn. */
 ringX:number;ringY:number;ringPower:number;ringSerial:number;
 popups:PinballPopup[];popupCursor:number;popupSerial:number;
 last:{hitId:number;score:number;wall:number;gate:number;flipper:number;keeper:number;bumper:number;join:number;phase:PinballState['phase'];lit:boolean;level:number;balls:number};
 ball:{number:number;startScore:number;goals:number;bestCombo:number;knockdowns:number};
 /** Last seen playfield feature counters (diffed like the sim's sfx). */
 table:PinballTable['sfx'];
 /** Stars saved on this device after the last full time (per division). */
 savedStars:number[];
 runBestCombo:number;
 /** Shown after a real drain until the next launch. */
 summary:string;summaryFresh:boolean;
};

export function createPinballFeel():PinballFeel{
 return{hitStop:0,shake:0,drainFlash:0,rescueFlash:0,ringX:0,ringY:0,ringPower:0,ringSerial:0,
  popups:Array.from({length:PINBALL_POPUPS},()=>({age:PINBALL_POPUP_LIFE,x:0,y:0,text:'',kind:'score' as PinballPopupKind,serial:0})),popupCursor:0,popupSerial:0,
  last:{hitId:0,score:0,wall:0,gate:0,flipper:0,keeper:0,bumper:0,join:0,phase:'ready',lit:false,level:1,balls:3},
  ball:{number:1,startScore:0,goals:0,bestCombo:0,knockdowns:0},table:{sling:0,drop:0,wallDown:0,wallUp:0,flag:0,word:0,lane:0,crest:0,skill:0,cone:0,spin:0,dugout:0,mode:0,modeDone:0,modeEnd:0,block:0,saver:0,final:0},savedStars:[0,0,0,0],runBestCombo:0,summary:'',summaryFresh:false};
}
export function resetPinballFeel(f:PinballFeel){const fresh=createPinballFeel();for(let i=0;i<f.popups.length;i++)Object.assign(f.popups[i],fresh.popups[i]);fresh.popups=f.popups;Object.assign(f,fresh);}

/** Hit-stop freezes the simulation outright for a few frames. Flipper taps
 * landed during the freeze are kept by the tap pulse (it decays in sim time),
 * so the freeze doubles as an input buffer rather than eating presses. */
export function pinballTimeScale(f:PinballFeel){return f.hitStop>0?0:1;}

export function pinballFeelActive(f:PinballFeel){if(f.hitStop>0||f.shake>.005||f.drainFlash>0||f.rescueFlash>0)return true;for(const p of f.popups)if(p.age<PINBALL_POPUP_LIFE)return true;return false;}

function popup(f:PinballFeel,x:number,y:number,text:string,kind:PinballPopupKind){
 const p=f.popups[f.popupCursor];f.popupCursor=(f.popupCursor+1)%f.popups.length;
 p.age=0;p.x=x;p.y=y;p.text=text;p.kind=kind;p.serial=++f.popupSerial;
}
function ring(f:PinballFeel,x:number,y:number,power:number){f.ringX=x;f.ringY=y;f.ringPower=power;f.ringSerial++;}
const stop=(f:PinballFeel,t:number)=>{f.hitStop=Math.max(f.hitStop,t);};
const kick=(f:PinballFeel,v:number)=>{f.shake=Math.min(1,f.shake+v);};
const plural=(n:number,word:string)=>`${n} ${word}${n===1?'':'s'}`;
export const formatPinballPoints=(n:number)=>n.toLocaleString('en-US');

/** Call once per rendered frame with REAL dt, after stepPinball. */
export function stepPinballFeel(f:PinballFeel,s:PinballState,dt:number,emit:(goal:boolean,cue:string)=>void){
 const L=f.last;
 f.hitStop=Math.max(0,f.hitStop-dt);
 f.shake*=Math.exp(-dt*12);if(f.shake<.003)f.shake=0;
 f.drainFlash=Math.max(0,f.drainFlash-dt*1.1);f.rescueFlash=Math.max(0,f.rescueFlash-dt*1.2);
 for(const p of f.popups)if(p.age<PINBALL_POPUP_LIFE)p.age=Math.min(PINBALL_POPUP_LIFE,p.age+dt);
 const x=s.sfx;
 if(x.wall>L.wall){if(s.phase==='playing')emit(false,'pb-wall');if(x.wallV>500)kick(f,.1);}
 if(x.gate>L.gate)emit(false,'pb-gate');
 if(x.flipper>L.flipper)kick(f,.06*Math.min(1,x.flipperV/600));
 if(x.bumper>L.bumper)kick(f,.18);
 if(x.keeper>L.keeper){kick(f,.32);if(x.keeperV>300){stop(f,.05);ring(f,s.keeper,83,.8);}}
 if(x.join>L.join)emit(false,'pb-whistle');
 // Playfield features: one voice per new event (the audio layer throttles rattles).
 {const n=s.table.sfx,o=f.table;
  if(n.sling>o.sling){emit(false,'pb-sling');kick(f,.08);}
  if(n.cone>o.cone)emit(false,'pb-cone');
  if(n.drop>o.drop&&n.wallDown===o.wallDown)emit(false,'pb-drop');
  if(n.wallDown>o.wallDown){emit(false,'pb-wallDown');stop(f,.06);kick(f,.3);}
  if(n.wallUp>o.wallUp)emit(false,'pb-whistle');
  if(n.flag>o.flag&&n.word===o.word)emit(false,'pb-flag');
  if(n.word>o.word)emit(false,'pb-word');
  if(n.lane>o.lane&&n.crest===o.crest&&n.skill===o.skill)emit(false,'pb-lane');
  if(n.crest>o.crest)emit(false,'pb-crest');
  if(n.skill>o.skill){emit(false,'pb-skill');stop(f,.05);}
  if(n.spin>o.spin)emit(false,'pb-spin');
  if(n.dugout>o.dugout)emit(false,'pb-dugout');
  if(n.mode>o.mode)emit(false,'pb-mode');
  if(n.modeDone>o.modeDone){emit(false,'pb-modeDone');stop(f,.08);kick(f,.35);}
  if(n.modeEnd>o.modeEnd&&n.final===o.final)emit(false,'pb-modeEnd');
  if(n.block>o.block){emit(false,'pb-block');stop(f,.07);kick(f,.3);}
  if(n.saver>o.saver){emit(false,'pb-saver');stop(f,.06);kick(f,.3);f.rescueFlash=1;}
  if(n.final>o.final){emit(false,'pb-final');kick(f,.4);}
  Object.assign(o,n);}
 // Score pop-ups and big-hit weight, keyed on the simulation's hit events.
 if(s.hitId!==L.hitId){
  const gained=s.score-L.score;
  if(s.phase==='goal'){
   f.ball.goals++;stop(f,.1);kick(f,.7);ring(f,s.hitX,s.hitY,1.4);
   popup(f,180,215,`${s.cue==='corner'?'CORNER':'GOAL'}! +${formatPinballPoints(s.lastGoalPoints)}`,'goal');
  }else switch(s.cue){
   case 'dazed':f.ball.knockdowns++;stop(f,.06);kick(f,.28);ring(f,s.hitX,s.hitY,1);if(gained>0)popup(f,s.hitX,s.hitY,`+${gained}`,'score');break;
   case 'block':ring(f,s.hitX,s.hitY,.7);if(gained>0)popup(f,s.hitX,s.hitY,`+${gained}`,'score');break;
   case 'save':popup(f,s.hitX,s.hitY+18,'SAVED','save');break;
   case 'attack':popup(f,s.hitX,s.hitY,'SHOT!','warn');break;
   case 'rescue':f.rescueFlash=1;popup(f,180,560,'BALL SAVED','rescue');break;
   case 'nudge':kick(f,.22);break;
   case 'strike':if(s.combination>1&&gained>0)popup(f,s.hitX,s.hitY-14,`${s.combination}× +${gained}`,'score');break;
   case 'drop':popup(f,s.hitX,s.hitY+16,`+${gained}`,'score');break;
   case 'wallDown':ring(f,180,132,1.6);popup(f,180,175,'WALL BROKEN!','lit');break;
   case 'flag':popup(f,s.hitX<180?s.hitX+40:s.hitX-40,s.hitY,flagWord(s.table.flags),'score');break;
   case 'goalWord':ring(f,180,576,1.2);popup(f,180,330,'G-O-A-L! SAVER ON','rescue');break;
   case 'lane':ring(f,s.hitX,s.hitY,.5);break;
   case 'crest':ring(f,60,80,1);popup(f,110,110,`BONUS ×${s.table.bonusX}`,'lit');break;
   case 'skill':ring(f,s.hitX,s.hitY,1.2);popup(f,150,120,'PERFECT FIRST TOUCH','goal');break;
   case 'cone':ring(f,s.hitX,s.hitY,.55);break;
   case 'dugout':ring(f,s.hitX,s.hitY,.8);break;
   case 'mode':{const m=pinballModeInfo(s.table);popup(f,180,300,m?m.name+'!':'MODE!','lit');ring(f,306,262,1.3);break;}
   case 'modeDone':ring(f,180,300,1.6);popup(f,180,300,'MODE COMPLETE +1,500','goal');break;
   case 'onetwo':ring(f,s.hitX,s.hitY,.9);popup(f,s.hitX,s.hitY,`ONE–TWO ${s.table.modeProgress}/3`,'score');break;
   case 'greatBlock':ring(f,s.hitX,s.hitY,1.3);popup(f,s.hitX,s.hitY-20,'GREAT BLOCK!','goal');break;
   case 'clear':popup(f,180,540,'OFF THE LINE!','rescue');break;
   case 'final':ring(f,180,60,2);popup(f,180,260,'CUP FINAL!','goal');break;
   case 'finalEnd':popup(f,180,260,'FULL TIME +2,000','goal');break;
  }
 }
 f.ball.bestCombo=Math.max(f.ball.bestCombo,s.combination);f.runBestCombo=Math.max(f.runBestCombo,s.combination);
 // The goal lighting up is the payoff of Build → Switch; give it a sting.
 const lit=s.phase==='playing'&&s.moveTime>0;
 if(lit&&!L.lit){emit(false,'pb-lit');ring(f,180,60,1.8);popup(f,180,250,'GOAL LIT!','lit');}
 // Phase transitions: launch, real drain, full time.
 // A "ball" is a life: goals and ball-save relaunches continue it.
 if(L.phase!=='playing'&&s.phase==='playing')f.summaryFresh=false;
 // A real drain is the only thing that spends a ball (rescues never do).
 if(s.balls<L.balls){
  f.drainFlash=1;kick(f,.25);if(s.cue!=='concede')emit(false,'pb-drain');
  const earned=s.score-f.ball.startScore;
  const t=s.table;f.summary=`Ball ${f.ball.number} · +${formatPinballPoints(earned)} · ${plural(f.ball.goals,'goal')}${t.lastBonus>0?` · bonus ${formatPinballPoints(t.lastBonus)}${t.lastBonusX>1?` (×${t.lastBonusX})`:''}`:''}${f.ball.bestCombo>1?` · best ${f.ball.bestCombo}× combo`:''}`;
  f.summaryFresh=true;f.ball.number++;f.ball.startScore=s.score;f.ball.goals=0;f.ball.bestCombo=0;f.ball.knockdowns=0;
 }
 if(L.phase!=='over'&&s.phase==='over'){emit(false,'pb-over');f.savedStars=savePinballStars(s.table.stars);}
 L.hitId=s.hitId;L.score=s.score;L.wall=x.wall;L.gate=x.gate;L.flipper=x.flipper;L.keeper=x.keeper;L.bumper=x.bumper;L.join=x.join;L.phase=s.phase;L.lit=lit;L.level=s.level;L.balls=s.balls;
}

/** HUD line override for the moments the feel layer owns, else null. */
export function pinballFeelMessage(f:PinballFeel,s:PinballState):string|null{
 if(!f.summaryFresh)return pinballTableMessage(s);
 if(s.phase==='lost')return `${f.summary}. ${s.cue==='concede'?'Read the wind-up next time.':'Let it reach the flipper, then strike.'}`;
 if(s.phase==='ready'&&s.plunger<=.02&&s.cue!=='rescue')return `${f.summary} · ${plural(s.balls,'ball')} left. Hold Launch!`;
 return pinballTableMessage(s);
}
const stars=(bits:number)=>'★'.repeat(starCount(bits))+'☆'.repeat(3-starCount(bits));
/** One short line for the playfield features; null leaves the base HUD copy. */
export function pinballTableMessage(s:PinballState):string|null{
 const t=s.table,m=pinballModeInfo(t);
 if(s.phase==='over'){const total=t.stars.reduce((n,b)=>n+starCount(b),0);return `Full time · ${total}/12 stars · ${t.stars.slice(0,s.level).map(stars).join(' ')}`;}
 if(s.phase==='ready'){if(s.cue==='rescue')return null;if(s.plunger>.02){const pull=plungerPull(s.plunger);return `Power ${Math.round(pull*100)}% · ${ladderRung(pull)===t.skillBand?'LET GO NOW!':'let go on the blue light for a perfect first touch'}`;}const d=t.stars[s.level-1];if(t.assist)return 'Coach: extra help this ball. The saver is on!';const div=pinballDivision(s);return `${stars(d)} ${m?`${m.name} · ${m.goal}`:t.mode==='final'?'CUP FINAL · launch!':`${div.name} · ${div.objective}`}`;}
 if(s.phase!=='playing')return null;
 if(s.cueTime>0)switch(s.cue){
  case 'sling':return 'KICKBOARD! Read the rebound: same angle out.';
  case 'drop':return `THE WALL · ${3-(t.wall[0]+t.wall[1]+t.wall[2])}/3 down. Knock them all over!`;
  case 'wallDown':return 'WALL BROKEN! The goal is lit. Shoot!';
  case 'flag':return `CORNER FLAG · ${flagWord(t.flags)} · spell G-O-A-L`;
  case 'goalWord':return 'G-O-A-L! The goal-line saver is on for this ball.';
  case 'goalWordPts':return 'G-O-A-L again! +400';
  case 'lane':return 'STAR LANE · your flippers move the lit stars.';
  case 'crest':return `ALL 3 STARS! End-of-ball bonus ×${t.bonusX}`;
  case 'skill':return 'PERFECT FIRST TOUCH! +500';
  case 'cone':return t.dugoutLit?'DUGOUT OPEN! Shoot into the dugout for a mode.':`CONE DRILL · ${t.training}/${TRAINING_GOAL} to open the dugout`;
  case 'spin':return `DRIBBLE GATE · ${t.spinCount} touches`;
  case 'dugout':return COACH_TIPS[t.holdTip];
  case 'mode':return m?`${m.name} · ${m.goal}. ${m.time}s!`:null;
  case 'onetwo':return `ONE–TWO ${t.modeProgress}/3 · kickboard, then a target`;
  case 'modeDone':return 'MODE COMPLETE! +1,500';
  case 'modeEnd':return 'Time up. Open the dugout to try the next mode.';
  case 'greatBlock':return 'GREAT BLOCK! Fast break: the goal is lit!';
  case 'clear':return 'CLEARED OFF THE LINE! The saver is used.';
  case 'final':return 'CUP FINAL! 45s · goals count double · no lost balls';
  case 'finalEnd':return 'FULL TIME in the Cup Final! +2,000';
 }
 if(t.mode==='final')return `CUP FINAL · ${Math.ceil(t.modeTime)}s · every goal counts double!`;
 if(m&&(s.cue==='scan'||s.cue==='strike'))return `${m.name} · ${m.goal}${m.need>1?` (${t.modeProgress}/${m.need})`:''} · ${Math.ceil(t.modeTime)}s`;
 if(t.hold>0)return COACH_TIPS[t.holdTip];
 return null;
}
