'use client';
import {noteArcadeToday,takeTodayLaunch} from '@/lib/arcade/arcadeToday';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {PuzzleSnapshot} from '@/lib/passPuzzle/types';
import {appendStroke,createPointerFilter,filterPointer,type PointerFilter} from '@/lib/passPuzzle/drawing';
import type {PassControlMode} from '@/lib/passPuzzle/stroke';
import {ArcadeTopBar} from '../arcade/ArcadeTopBar';
import {ArcadePauseCard} from '../arcade/ArcadePauseCard';
import {Icon} from '../Icon';
import {createPuzzle,readStroke,predict,replay as replayAttempt,type Scenario,type Format,type PuzzleWorld,type PuzzleEvent,type StrokePoint,type Kick,type Prediction,type Replay} from '@/lib/passPuzzle';
import {youthScenario,usesHeading,YOUTH_PACK_BLURB} from '@/lib/passPuzzle/youth';
import {ALL_SCENARIOS,ALL_PACKS,ALL_SOLUTIONS,DAILY_TEMPLATES,EXPERT_DAILY_TEMPLATES,MAP_ORDER,routeFor,packGateOpen,pips,nextOnMap,isExpertPack,EXPERT_GATE,hardDailyDay} from '@/lib/passPuzzle/catalog';
import {EXPERT_CONCEPTS} from '@/lib/passPuzzle/expert';
import {createCinematic} from '@/lib/passPuzzle/cinematic';
// Nov 11 2026: aim anywhere in the goal (point at a spot on the net; lib/passPuzzle/aim.ts holds the scatter, keeper and coaching maths).
import {geoOf} from '@/lib/passPuzzle';
import {scatterSigma,shotPressure,heightShare,heightOf,finishFromEvents,aimWord,goalZone,AIM_LOW_Y,AIM_OVER,AIM_WIDE} from '@/lib/passPuzzle/aim';
import {scanLanes,shutLanes} from '@/lib/passPuzzle/scan';
import {coachRun} from '@/lib/passPuzzle/coach';
import {dailyPuzzle} from '@/lib/passPuzzle/daily';
// Nov 10 2026: Endless Run (the main arcade entry): puzzle after puzzle, three lives, rising difficulty (lib/passPuzzle/endless.ts).
import {endlessPuzzle,endlessSeed,startEndlessRun,stepEndless,ENDLESS_LIVES,ENDLESS_BEST_KEY,type EndlessPuzzle,type EndlessRun,type EndlessEvent} from '@/lib/passPuzzle/endless';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {puzzleStrike,puzzleTouch,puzzlePassChime,puzzleWhistle,puzzleStar,puzzleShotWhoosh,puzzleGoalRoar,puzzleCrowdOoh,puzzleCombo,puzzleStreak,puzzleSnapTick,puzzleIntercept,puzzleUiTap,puzzleSkillChime,puzzleNewBest} from '@/lib/arcade/passPuzzleAudio';
// Nov 8 2026: Pro Cup / Legend Cup tiers (own boards), the skill multiplier and cup points (lib/passPuzzle/tiers.ts).
import {TIER_SCENARIOS,TIER_PACKS,PUZZLE_TIERS,PUZZLE_TIER_IDS,tierOfPack,isTierPuzzle,boardForPuzzle,skillMultiplier,cupPoints,tierBoardScore,type SkillPart} from '@/lib/passPuzzle/tiers';
import type {BoardGame} from '@/lib/arcade/leaderboard';
import {passCallout,goalCallout,nextStreak,streakLabel,type Callout} from '@/lib/passPuzzle/combo';

import {FIRST_TIME} from '@/lib/passPuzzle/sim';
import {puzzlePencil,puzzleWoodwork,puzzleNetHigh} from '@/lib/arcade/passPuzzleAudio';
import {createPassPuzzleScene,shirtNumbersFor,type PassPuzzleScene,type FitRoom} from '@/lib/arcade/passPuzzleScene';
import {puzzleConceptWords,puzzleConceptLesson,notePuzzleFail,PRACTISE_AFTER} from '@/lib/passPuzzle/conceptLessons';
import {laneStatus,noteFor,explainSuccess,explainFail,replayCall,type PassNote,type Numbers} from '@/lib/passPuzzle/explain';
import {isCall,type Step} from '@/lib/passPuzzle/packs';
import {stopPoint,passProgress} from '@/lib/passPuzzle/feel';
import {frameCapSlot} from '@/lib/town/frameCap';
import {isSoundEnabled,getSoundVolume} from '@/lib/games/sound';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {beginArcadeRun,recordPuzzleBest} from '@/lib/arcade/arcadeWallet';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {loadIdp,goalById} from '@/lib/coaches/idp';
import arcade from './ArcadeGame3D.module.css';
import styles from './PassPuzzleGame.module.css';
import {arcadeSkin} from './skins';
import {comicRoot} from './comic';
import dynamic from 'next/dynamic';
import {beginBoardSession} from '@/lib/arcade/boardClient';
// Leaderboards (docs/arcade-leaderboards.md): the puzzle board ranks total stars. Lazy, loaded only when it is needed.
const HighScoreEntry=dynamic(()=>import('../arcade/HighScoreEntry'),{ssr:false});
const ArcadeBoards=dynamic(()=>import('../arcade/ArcadeBoards'),{ssr:false});
/** Total stars across the puzzles (the daily remix is a bonus and doesn't count toward the board). */
const boardStars=(stars:Record<string,number>)=>Object.entries(stars).reduce((n,[k,v])=>k.startsWith('daily')||isTierPuzzle(k)?n:n+v,0);// Nov 8 2026: cup puzzles score on their own cup boards

const SCENARIOS=[...ALL_SCENARIOS,...TIER_SCENARIOS],PACKS=[...ALL_PACKS,...TIER_PACKS];
/** Daily remix of a learned idea, built (and engine-checked) only when the child opens it. */
let dailyCache:ReturnType<typeof dailyPuzzle>|undefined,dailyHard=false;
/** Round 3: on Saturday and Sunday a child who has opened the Expert tier gets an expert remix (same id, same rules). */
let dailyStars=0;
const todaysDaily=()=>{const hard=hardDailyDay(new Date(),dailyStars);if(dailyCache===undefined||hard!==dailyHard){dailyHard=hard;try{dailyCache=dailyPuzzle(hard?EXPERT_DAILY_TEMPLATES:DAILY_TEMPLATES,new Date());}catch{dailyCache=null;}}return dailyCache;};
/** A seasonal look for the daily tile (CSS only): autumn, winter, spring, summer. */
const season=(d:Date)=>{const m=d.getMonth();return m>=8&&m<=10?'autumn':m===11||m<=1?'winter':m<=4?'spring':'summer';};
/** The Endless Run puzzle on the pitch (generated, so it is in no catalog): the level lookup and the coach's route read it here. */
let endlessNow:EndlessPuzzle|null=null;
const levelById=(id:string)=>SCENARIOS.find(s=>s.id===id)??(id.startsWith('endless-')?endlessNow?.scenario:todaysDaily()?.scenario.id===id?todaysDaily()!.scenario:undefined);
const routeOf=(id:string,heading:boolean):Step[]=>id.startsWith('endless-')?endlessNow?.solution??[]:routeFor(id,heading);
/** A drawn padlock for closed packs (no emoji as icons). */
const Lock=()=><svg className={styles.lock} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.6 7.2V5.1a3.4 3.4 0 0 1 6.8 0v2.1" fill="none" stroke="currentColor" strokeWidth="2.2"/><rect x="2.4" y="7" width="11.2" height="7.6" fill="currentColor"/></svg>;

/** Pass Puzzles: freeze the moment, draw the pass, watch it play out. Every level teaches one idea. */
const PROGRESS_KEY='fi2-pass-puzzles-v1';
/** heading: the child's explicit choice; undefined = the default (no heading in 7v7, US Soccer under-11 rule). */
type Progress={stars:Record<string,number>;masks?:Record<string,number>;format?:Format;heading?:boolean;
 /** Nov 8 2026: best cup points per Pro / Legend Cup puzzle (the cup boards add these up) */
 cup?:Record<string,number>;
 /** the child's own Scan choice (undefined = on in the first packs, where looking up is the lesson) */
 scan?:boolean;
 /** round 3: the replay speed the child picked (undefined = slow) */
 replay?:'slow'|'1x';
 /** Nov 11 2026: the one-time aim cue ("draw onto the net") has been shown */
 aimCue?:boolean};
type View='levels'|'brief'|'play'|'result';
/** Three mastery stars, Cut-the-Rope style skill goals (no first-try pressure): bit 1 solve, 2 the taught move, 4 the bonus. */
type Outcome={/** what the finish did (aim anywhere) */shotLine?:string;success:boolean;stars:number;mask:number;fresh:number;passes:number;bonus:boolean;move:boolean;reason?:string;attemptsLeft:number;
 /** the coach's takeaway: why the move worked, or why it didn't and what to try */
 why:string[];fix?:string;
 /** Nov 10 2026: a solve names the scenario's concept in kid words; a second fail of one concept this visit offers its lesson. */
 concept?:{name:string;line:string|null}|null;practise?:{title:string;href:string}|null;
 /** first-try solves in a row this visit (session only: never saved, never paid) */
 streak:number;
 /** Nov 8 2026: a cup puzzle's skill multiplier, its points and the cup total (undefined on classic puzzles) */
 skill?:{mult:number;parts:SkillPart[];points:number;best:number;newBest:boolean;total:number;cup:string}};
const STAR_SOLVE=1,STAR_MOVE=2,STAR_BONUS=4;const starCount=(m:number)=>(m&1)+(m>>1&1)+(m>>2&1);
const FORMATS:Format[]=['7v7','9v9','11v11'];
/** Aim anywhere: the one word for a shot that missed (the result card carries the coaching line). */
const FINISH_WORD:Partial<Record<string,string>>={post:'POST!',bar:'BAR!',over:'OVER!',wide:'WIDE!','at-keeper':'SAVED!','keeper-across':'SAVED!'};
const RUN_GRAB=2.1,BALL_GRAB=2.4,RESULT_SETTLE_MS=2900,REPLAY_SPEED=.38,HOLD_LOFT_SECONDS=1.1,MIN_STROKE_METRES=1.2;

function readProgress():Progress{try{const v=JSON.parse(localStorage.getItem(PROGRESS_KEY)??'null');if(v&&typeof v==='object'&&v.stars&&typeof v.stars==='object'){const stars:Record<string,number>={};for(const [k,n] of Object.entries(v.stars))if(typeof n==='number'&&n>=0&&n<=3)stars[k]=Math.round(n);const masks:Record<string,number>={};if(v.masks&&typeof v.masks==='object')for(const [k,n] of Object.entries(v.masks))if(typeof n==='number'&&n>=0&&n<=7)masks[k]=n|0;const cup:Record<string,number>={};if(v.cup&&typeof v.cup==='object')for(const [k,n] of Object.entries(v.cup))if(isTierPuzzle(k)&&typeof n==='number'&&n>0&&n<=100_000)cup[k]=Math.floor(n);return{stars,masks,cup,format:FORMATS.includes(v.format)?v.format:undefined,heading:typeof v.heading==='boolean'?v.heading:undefined,scan:typeof v.scan==='boolean'?v.scan:undefined,replay:v.replay==='1x'||v.replay==='slow'?v.replay:undefined};}}catch{}return{stars:{}};}
function writeProgress(p:Progress){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}catch{/* Private browsing keeps this visit's stars. */}}
/** The child's own format from their development plan when they have one; 9v9 otherwise. */
function childFormat():Format|undefined{try{const goal=loadIdp().plan?.goalId;const f=goal?goalById(goal)?.format:undefined;return f&&(FORMATS as string[]).includes(f)?f as Format:undefined;}catch{return undefined;}}
const reasonCopy:Record<string,string>={offside:'Offside! Your teammate was past the second-last defender when the ball was played. Wait for them, or pass sooner.',intercept:'A defender got to it first.',save:'The keeper read it.',out:'That one ran out of play.',rest:'The ball stopped before anyone reached it.','too-few-passes':'Right idea, but this one needs more passes first.',timeout:'Too slow! The defence got back before the finish.'};
const headingAllowed=(p:Progress,f:Format)=>p.heading??f!=='7v7';
/** The puzzle as played: direct shots allowed, and the no-heading youth version when heading is off. */
const playable=(s:Scenario,heading=true):Scenario=>{const base=heading?s:youthScenario(s);return{...base,require:{...base.require,allowDirectShot:base.require.finish==='goal'}};};
const packInfo=(pack:string)=>PACKS.find(p=>p.id===pack);
/** Packs where the Scan starts switched on until the child chooses: looking up is the lesson there. */
const SCAN_FIRST=new Set(['first-passes','see-the-space']);

export default function PassPuzzleGame({onExit}:{onExit:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),sceneRef=useRef<PassPuzzleScene|null>(null),worldRef=useRef<PuzzleWorld|null>(null),replayRef=useRef<Replay|null>(null);
 const wake=useRef(()=>{}),audio=useRef<AudioContext|null>(null);
 const [controlMode,setControlMode]=useState<PassControlMode>('auto'),[power,setPower]=useState<number|null>(null),[shotHeight,setShotHeight]=useState(0);
 const controls=useRef<{mode:PassControlMode;power?:number;shotHeight?:number}>({mode:'auto',shotHeight:0}),powerSlider=useRef<HTMLInputElement>(null);
 const stroke=useRef<{filter:PointerFilter;bounds:DOMRect;holdX:number;holdY:number;id:number;points:StrokePoint[];lastMove:number;kick:Kick|null;prediction:Prediction|null;dirty:boolean;predictionAt:number;screenX:number;screenY:number;run?:number;place?:{x:number;y:number;sigma:number;risky?:boolean}|null}|null>(null);
 const coinVisit=useRef(''),coinAttempt=useRef(''),entry=useArcadeEntry('puzzle');
 const rewindPoint=useRef<PuzzleSnapshot|null>(null),rewound=useRef(false);
 const cancelDrawing=useRef(()=>{});
 /** Round 3 cinematic beats (lib/passPuzzle/cinematic.ts): slow-mo + camera lean on the strike, the arrival and the result. */
 const [cine]=useState(()=>createCinematic()),arrived=useRef(false),finishAt=useRef(0),stopShown=useRef(false),clockChip=useRef<HTMLSpanElement>(null),clockText=useRef('');
 /** Any tap during a beat skips it: back to 1x and the wide camera at once (never blocks a retry). */
 const skipCine=useRef(()=>{});
 const [packId,setPackId]=useState('first-passes');
 const attemptEvents=useRef<PuzzleEvent[]>([]),resultAt=useRef(0),settleUntil=useRef(0),viewRef=useRef<View>('levels');
 const [progress,setProgress]=useState<Progress>({stars:{}}),[format,setFormat]=useState<Format>('9v9'),progressRef=useRef(progress);progressRef.current=progress;
 const [levelId,setLevelId]=useState<string>(SCENARIOS[0]?.id??''),[view,setViewState]=useState<View>('levels');
 const [hud,setHud]=useState({attempt:1,attempts:3,passes:0,phase:'aiming' as string});
 const [boardScore,setBoardScore]=useState<number|null>(null),[boardsOpen,setBoardsOpen]=useState(false);
 /** Nov 8 2026: the board this puzzle scores on ('puzzle' stars, or a cup's points); set when a level loads. */
 const boardRef=useRef<BoardGame>('puzzle'),[boardGame,setBoardGame]=useState<BoardGame>('puzzle');
 /** Aim snap tick: the receiver and lane the drawn pass last locked onto (primitives, no allocation per move). */
 const snapReceiver=useRef(-2),snapClear=useRef(false),rootRef=useRef<HTMLDivElement>(null);
 /** Light shake (CSS transform on the canvas only): a goal or a steal. Restarted by toggling the attribute. */
 // Nov 11 2026 (owner, tablet: "the controls cover the players"): the camera fit reserves the HUD's REAL boxes. measureRoom reads the
 // control tray (bottom dock, or the side dock on wide landscape screens: --pp-dock), the top bar and the Endless chips, and re-fits
 // (eased) when they change. While the tray is hidden (a pass in flight) the last tray box at this size is kept, so nothing jumps.
 const trayRoom=useRef<{w:number;h:number;bottom:number;right:number}|null>(null),trayObserver=useRef<ResizeObserver|null>(null);
 const measureRoom=useRef((smooth:boolean)=>{const root=rootRef.current,scene=sceneRef.current,cv=canvas.current;if(!root||!scene||!cv)return;const r=cv.getBoundingClientRect();if(r.width<2||r.height<2){scene.fit();return;}
  let top=0;for(const el of root.querySelectorAll<HTMLElement>(`.${styles.topBar},[data-endless-hud],.${styles.hintDock}`)){const b=el.getBoundingClientRect();if(b.height>0&&b.top<r.top+r.height*.4)top=Math.max(top,b.bottom-r.top);}
  const tray=root.querySelector<HTMLElement>('[data-pp-tray]');let t=trayRoom.current;
  if(tray){const b=tray.getBoundingClientRect(),side=getComputedStyle(tray).getPropertyValue('--pp-dock').trim()==='side';t={w:r.width,h:r.height,bottom:side?0:Math.max(0,r.bottom-b.top),right:side?Math.max(0,r.right-b.left):0};trayRoom.current=t;root.style.setProperty('--pp-controls',`${Math.round(r.bottom-b.top+12)}px`);}
  else if(t&&(Math.abs(t.w-r.width)>1||Math.abs(t.h-r.height)>1))t=null;/* resized while hidden: the tray's next showing measures again */
  const room:FitRoom|null=t?{top:Math.round(top+10),bottom:Math.round(t.bottom+(t.bottom>0?16:18)),left:0,right:Math.round(t.right+(t.right>0?12:0))}:null;scene.fit(room,smooth);wake.current();});
 const trayRef=useCallback((el:HTMLDivElement|null)=>{trayObserver.current?.disconnect();trayObserver.current=null;if(!el||typeof ResizeObserver==='undefined')return;const o=new ResizeObserver(()=>measureRoom.current(true));o.observe(el);trayObserver.current=o;},[]);
 const shake=(kind:'goal'|'steal')=>{const el=rootRef.current;if(!el)return;el.removeAttribute('data-shake');void el.offsetWidth;el.setAttribute('data-shake',kind);};
 /** The name-entry sheet waits for the goal celebration and the stars (Oct 25: it used to cover the goal at once). */
 const [boardReady,setBoardReady]=useState(false);
 useEffect(()=>{setBoardReady(false);if(boardScore===null||view!=='result')return;const id=setTimeout(()=>setBoardReady(true),2600);return()=>clearTimeout(id);},[boardScore,view]);
 const [outcome,setOutcome]=useState<Outcome|null>(null),[replaying,setReplaying]=useState(false),[showHint,setShowHint]=useState(false),[error,setError]=useState(false);
 const loftMeter=useRef<HTMLDivElement>(null),aimPanel=useRef<HTMLDivElement>(null),kickKeeperX=useRef<number|null>(null),woodAt=useRef(0);
 /** Oct 26 simple start menu: 'home' (Play, daily, packs), one pack's puzzles, or the small settings sheet. */
 const [menu,setMenu]=useState<'home'|'pack'|'settings'|'expert'>('home');
 /** Endless Run (Nov 10 2026): the run lives in a ref (timers read it); the HUD strip, the teaching note and the full-time card are state. */
 const endless=useRef<{run:EndlessRun;puzzle:EndlessPuzzle|null;next:EndlessPuzzle|null;timer:number;clockTimer:number;deadline:number;remaining:number;serial:number}|null>(null),endlessRuns=useRef(0);
 const endlessFinish=useRef((success:boolean,move:boolean,reason?:string)=>{void success;void move;void reason;});
 const [endHud,setEndHud]=useState<{level:number;lives:number;score:number;streak:number;clock:number|null;clockKey:number;aid:'scan'|'hint'|'none'}|null>(null);
 const [endNote,setEndNote]=useState<{key:number;kind:'win'|'fail'|'skip'|'clock';title:string;line:string;gained:number;next:boolean}|null>(null);
 const [endOver,setEndOver]=useState<{score:number;solved:number;level:number;best:number;newBest:boolean;streak:number;lesson:string}|null>(null),[endBest,setEndBest]=useState(0),[wipe,setWipe]=useState(0);
 useEffect(()=>{try{setEndBest(Number(JSON.parse(localStorage.getItem(ENDLESS_BEST_KEY)??'{}').score)||0);}catch{/* no best yet */}return()=>{const e=endless.current;if(e){clearTimeout(e.timer);clearTimeout(e.clockTimer);}endless.current=null;};},[]);
 useEffect(()=>{if(!endNote||endNote.next)return;const id=setTimeout(()=>setEndNote(n=>n?.key===endNote.key?null:n),2000);return()=>clearTimeout(id);},[endNote]);
 /** Live warning while drawing: the predicted receiver would be offside. Clean pitch (owner, Oct 27 2026): no in-play text,
  *  so the lane read and the offside warning show only on the pitch (the aim's lane colour and the flagged teammate). */
 const aimWarnRef=useRef<null|'offside'>(null);
 const warn=(w:null|'offside')=>{aimWarnRef.current=w;};
 /** One note per kick of this attempt (what the release looked like), for the takeaway. */
 const notes=useRef<PassNote[]>([]),numbersRef=useRef<Numbers>({attackers:[],defenders:[],keeper:1}),formatRef=useRef<Format>('9v9'),conceptFails=useRef(new Map<string,number>());
 /** Replay commentary: the current call and the inputs it reads receivers and runs from. */
 const [replayLine,setReplayLine]=useState(''),replayInputs=useRef<{kick:Kick;calls?:{attacker:number}[]}[]>([]),replayKicks=useRef(0),replayHold=useRef(0);
 /** Hints in tiers: 1 = the words, 2 = a glowing spot on the pitch for the next pass of the coach's route. */
 const [paused,setPaused]=useState(false),pausedRef=useRef(false);
 const [spotHint,setSpotHint]=useState(false),spotHintRef=useRef(false);spotHintRef.current=spotHint;const applyHint=useRef(()=>{}),applyScan=useRef(()=>{});
 const heading=headingAllowed(progress,format),headingRef=useRef(heading);headingRef.current=heading;formatRef.current=format;
 const baseLevel=useMemo(()=>levelById(levelId)??SCENARIOS[0],[levelId]);
 /** What the child reads and plays: the youth (no-heading) version when heading is off. */
 const level=useMemo(()=>baseLevel&&!heading?youthScenario(baseLevel):baseLevel,[baseLevel,heading]);
 const numbers=useMemo(()=>level?shirtNumbersFor(level):{attackers:[],defenders:[],keeper:1},[level]);numbersRef.current=numbers;
 const packs=useMemo(()=>{const map=new Map<string,Scenario[]>();for(const s of SCENARIOS){if(!map.has(s.pack))map.set(s.pack,[]);map.get(s.pack)!.push(s);}return [...map.entries()].sort((a,b)=>(packInfo(a[0])?.order??9)-(packInfo(b[0])?.order??9));},[]);
 const setView=(v:View)=>{cancelDrawing.current();warn(null);if(v==='result')resultAt.current=performance.now();viewRef.current=v;setViewState(v);};

 useEffect(()=>{const p=readProgress();setProgress(p);setFormat(p.format??childFormat()??'9v9');
  // A "Today in the arcade" row opens today's puzzle (dailyStars first, so the same daily the menu would show).
  if(takeTodayLaunch('puzzle')){dailyStars=Object.values(p.stars).reduce((a,b)=>a+b,0);requestAnimationFrame(()=>openDaily());}},[]);
 const chooseFormat=(f:Format)=>{setFormat(f);setProgress(p=>{const next={...p,format:f};writeProgress(next);return next;});};
 const chooseHeading=(on:boolean)=>setProgress(p=>{const next={...p,heading:on};writeProgress(next);return next;});
 /** Done in the settings sheet: the shown defaults become the child's remembered choice (asked once, never again). */
 const saveSettings=()=>{setProgress(p=>{const next={...p,format,heading:headingAllowed(p,format)};writeProgress(next);return next;});setMenu('home');};

 // ── sound: short gesture-unlocked blips like the other arcade games, no sustained source ──
 const unlock=()=>{if(!isSoundEnabled()||getSoundVolume()===0)return;try{audio.current??=new AudioContext();void audio.current.resume();}catch{}};
 // Contact voices distinguish a cushioned header, blocked lane and completed combination.
 const hitStop=useRef(0),chimed=useRef(0),aimSince=useRef(0);
 /** Live combo callout ("One-two!"), keyed so each one replays its pop; cleared by a short timer. */
 const [callout,setCallout]=useState<(Callout&{key:number})|null>(null),calloutKey=useRef(0),streak=useRef(0);
 const shout=useRef((c:Callout)=>{calloutKey.current++;setCallout({...c,key:calloutKey.current});});
 useEffect(()=>{if(!callout)return;const id=setTimeout(()=>setCallout(c=>c?.key===callout.key?null:c),callout.tier>=3?2400:1700);return()=>clearTimeout(id);},[callout]);
 const handleEvent=useCallback((e:PuzzleEvent)=>{
  sceneRef.current?.onEvent(e);const ctx=audio.current;
  if(replayRef.current){const i=replayKicks.current,inputs=replayInputs.current,line=replayCall(e,numbersRef.current,k=>inputs[k]?.kick.receiver,i,(inputs[i]?.calls??[]).map(c=>c.attacker));if(e.type==='kick')replayKicks.current++;if(line)setReplayLine(line);
   // Freeze-frame on the moment that decided it, so the call can be read.
   if(['intercept','deflect','save','goal','offside'].includes(e.type))replayHold.current=performance.now()+(sceneRef.current?.stage.reduced?350:700);}
  // Contact beats: a hair of hit-stop on the strike and the goal (none with reduced motion).
  if((e.type==='kick'||e.type==='goal')&&!sceneRef.current?.stage.reduced)hitStop.current=performance.now()+(e.type==='goal'?90:45);
  if(e.type==='kick'&&!replayRef.current){arrived.current=false;cine.play('strike',e.at.x,e.at.z);kickKeeperX.current=worldRef.current?.state.keeper?.p.x??null;}
  // Post or bar: a woodwork knock and its word at the moment of the knock (a result word; the fail beat does not repeat it).
  if(e.type==='woodwork'){puzzleWoodwork(ctx,e.part==='bar');if(!replayRef.current){woodAt.current=performance.now();shout.current({text:e.part==='bar'?'BAR!':'POST!',teach:'',tier:2});}return;}
  if(e.type==='kick'){if(((replayRef.current?.world??worldRef.current)?.state.passes??0)===0)chimed.current=0;puzzleStrike(ctx,e.speed??10,e.kind??'pass');if(e.kind==='shot'){arcadeFeedback(null,'shot');puzzleShotWhoosh(ctx,e.speed??16);}return;}
  if(e.type==='receive'){puzzleTouch(ctx,e.touch);const w=replayRef.current?.world??worldRef.current;const n=w?.state.passes??0;if(n>chimed.current){puzzlePassChime(ctx,n);
    // Name the combination as it happens (live play only; replays have their own commentary).
    // Clean pitch (owner, Oct 27 2026): mid-play combos are heard, not captioned; only the result gets a word.
    if(!replayRef.current&&w&&e.attacker!=null){const c=passCallout(w.state.chain,e.attacker,n);if(c&&c.tier>=2)puzzleCombo(ctx,2);}}chimed.current=n;return;}
  if(e.type==='heavy_touch'){puzzleTouch(ctx,e.touch,true);return;}
  if(e.type==='offside'){puzzleWhistle(ctx);return;}
  if(e.type==='goal'){const w=replayRef.current?.world??worldRef.current,chain=w?.state.chain??[],passes=w?.state.passes??0;puzzleGoalRoar(ctx,passes);const top=!!w&&e.at.y>1.25&&goalZone(geoOf(w.scenario),e.at.x,e.at.y).corner;if(e.at.y>1.25)puzzleNetHigh(ctx);if(!replayRef.current)shout.current(goalCallout(passes,!!chain.at(-1)?.firstTime,top));}
  else if(e.type==='intercept'||e.type==='save'||e.type==='parry'){puzzleCrowdOoh(ctx);if(e.type==='intercept')puzzleIntercept(ctx);}
  if((e.type==='goal'||e.type==='intercept')&&!replayRef.current&&!sceneRef.current?.stage.reduced)shake(e.type==='goal'?'goal':'steal');
  const cue=e.type==='goal'?'goal':e.type==='save'||e.type==='parry'?'save':e.type==='intercept'||e.type==='deflect'?'block':'miss';
  arcadeFeedback(ctx,cue);
 },[]);

 // Aim anywhere, the one-time cue: the first time a shot is on (enough passes, within 24 m of a goal) a small sticker shows the gesture, then never again.
 const [aimCue,setAimCue]=useState(false);
 useEffect(()=>{if(view!=='play'||hud.phase!=='aiming'){setAimCue(false);return;}const w=worldRef.current;if(progressRef.current.aimCue||!w)return;const sc=w.scenario;
  if(sc.require.finish!=='goal'||w.state.passes<sc.require.minPasses||sc.pitch.length/2-w.state.ball.p.z>24)return;
  setAimCue(true);progressRef.current={...progressRef.current,aimCue:true};setProgress(p=>{const n={...p,aimCue:true};writeProgress(n);return n;});},[view,hud.phase,hud.passes,hud.attempt]);
 const syncHud=()=>{const s=worldRef.current?.state;if(!s)return;setHud(h=>h.attempt===s.attempt&&h.passes===s.passes&&h.phase===s.phase&&h.attempts===(worldRef.current?.scenario.attempts??3)?h:{attempt:s.attempt,attempts:worldRef.current!.scenario.attempts,passes:s.passes,phase:s.phase});};

 const finish=useCallback(()=>{
  const world=worldRef.current;if(!world?.state.result)return;const r=world.state.result,s=world.state,success=r.outcome==='success',sc=world.scenario,id=sc.id;
  if(success&&sc.require.finish==='reach-zone')arcadeFeedback(audio.current,'level');
  // The move = the taught route (enough passes, not the direct-shot bypass); the bonus is the mastery goal.
  const move=success&&r.passes>=sc.require.minPasses,mask=success?STAR_SOLVE|(move?STAR_MOVE:0)|(r.bonus?STAR_BONUS:0):0;
  const before=progressRef.current.masks?.[id]??0,merged=before|mask,fresh=mask&~before,stars=Math.max(starCount(merged),progressRef.current.stars[id]??0);
  // Endless Run: no stars, coins or cards per puzzle; the run scores it, shows the concept line and moves straight on.
  if(id.startsWith('endless-')&&endless.current){stroke.current=null;endlessFinish.current(success,move,r.reason);return;}
  if(success&&coinAttempt.current&&!id.startsWith('daily-'))void recordPuzzleBest(id,stars,coinAttempt.current,coinVisit.current);
  // Nov 10 2026: the daily puzzle pays LEARN_COINS.arcade the first time each day's puzzle is solved (Today in the arcade, once per day).
  if(success&&id.startsWith('daily-'))void noteArcadeToday({kind:'puzzle',id});
  // Nov 8 2026: a cup puzzle scores cup points (stars × 100 × skill) on its own cup board; the star board never sees it.
  let skill:Outcome['skill'];const cupTier=tierOfPack(sc.pack);
  if(success&&cupTier){const chain=s.chain,clock=sc.require.clock,input={stars:starCount(mask),firstTry:s.attempt===1&&!rewound.current,passes:r.passes,minPasses:sc.require.minPasses,throughBall:chain.some(c=>c.kind==='pass-space'),oneTouch:chain.filter(c=>c.firstTime).length,clock,clockLeft:clock?Math.max(0,clock-s.t):undefined};
   const m=skillMultiplier(input),points=cupPoints(input),prev=progressRef.current.cup?.[id]??0,best=Math.max(prev,points),cup={...(progressRef.current.cup??{}),[id]:best},total=tierBoardScore(cup,cupTier.id);
   skill={mult:m.mult,parts:m.parts,points,best,newBest:points>prev,total,cup:cupTier.title};
   if(points>prev){setProgress(p=>{const next={...p,cup:{...(p.cup??{}),[id]:Math.max(p.cup?.[id]??0,points)}};writeProgress(next);return next;});if(total>0){setBoardGame(cupTier.board);setBoardScore(total);}}
   m.parts.forEach((_,i)=>puzzleSkillChime(audio.current,i,1.25+i*.14));if(points>prev)puzzleNewBest(audio.current,1.4+m.parts.length*.14);}
  if(success&&fresh&&!id.startsWith('daily')&&!cupTier){setBoardGame('puzzle');const total=boardStars({...progressRef.current.stars,[id]:Math.max(progressRef.current.stars[id]??0,stars)});if(total>0)setBoardScore(total);}
  if(success){setProgress(p=>{const next={...p,stars:{...p.stars,[id]:Math.max(p.stars[id]??0,stars)},masks:{...p.masks,[id]:(p.masks?.[id]??0)|mask}};writeProgress(next);return next;});
   [STAR_SOLVE,STAR_MOVE,STAR_BONUS].filter(b=>mask&b).forEach((_,i)=>puzzleStar(audio.current,i+1,.85+i*.22));}
  // First try = attempt 1 with no rewind; a fail resets, a later-try solve keeps the streak.
  streak.current=nextStreak(streak.current,success,s.attempt===1&&!rewound.current);if(success&&streak.current>=2)puzzleStreak(audio.current,streak.current,1.05);
  let why:string[]=[],fix:string|undefined,concept:Outcome['concept']=null,practise:Outcome['practise']=null;
  try{const f=formatRef.current;if(success)concept=puzzleConceptWords(sc.concept,f);else if(notePuzzleFail(conceptFails.current,sc.concept)>=PRACTISE_AFTER)practise=puzzleConceptLesson(sc.concept,f);}catch{/* no concept line */}
  try{const nums=shirtNumbersFor(sc),f=formatRef.current,kept=notes.current.slice(0,world.inputs().length);
   if(success)why=explainSuccess(kept,sc,nums,f,2);
   else{const stop=attemptEvents.current.filter(e=>['intercept','deflect','save','parry','offside'].includes(e.type)).at(-1),x=explainFail(r.reason,stop,kept.at(-1),nums,f);if(x){why=[x.why];fix=x.fix;}}}catch{/* the generic copy stays */}
  // Aim anywhere: one line that names what the finish did (the keeper, the corner, the bar).
  let shotLine:string|undefined;try{shotLine=finishFromEvents(geoOf(sc),attemptEvents.current,kickKeeperX.current,s.flight?.aim,formatRef.current==='7v7')?.line;}catch{/* no line */}
  if(shotLine&&!success)fix=undefined;/* the line already says what to try */
  setOutcome({shotLine,success,stars:starCount(mask),mask,fresh,passes:r.passes,bonus:r.bonus,move,reason:r.reason,attemptsLeft:s.attemptsLeft,why,fix,concept,practise,streak:streak.current,skill});setView('result');stroke.current=null;
  // The failure beat: mark where the move was stopped and lean the camera in before the card lands.
  if(!stopShown.current){failStop.current=success?null:stopPoint(world,attemptEvents.current);if(failStop.current)sceneRef.current?.showStop(failStop.current.at,failStop.current.kind);}stopShown.current=false;
 },[]);
 const failStop=useRef<ReturnType<typeof stopPoint>>(null);

 /** The scan of the current aim, cached: the Scan display and the release's takeaway share one set of predictions. */
 const scanCache=useRef<{key:string;world:PuzzleWorld|null;lanes:ReturnType<typeof scanLanes>}>({key:'',world:null,lanes:[]});
 const lanesNow=(world:PuzzleWorld)=>{const s=world.state,key=`${s.attempt}:${s.chain.length}:${s.carrier}:${s.tick-Math.round(s.aimTime*120)}:${s.attackers.map(a=>a.call?`${a.call.to.x},${a.call.to.z}`:'').join('|')}`,c=scanCache.current;
  if(c.world===world&&c.key===key)return c.lanes;const lanes=scanLanes(world);scanCache.current={key,world,lanes};return lanes;};
 /** The release, remembered for the takeaway: one prediction (memoised from the aim) and a few distances. */
 const takeNote=(world:PuzzleWorld,kick:Kick):PassNote=>{const s=world.state;let p:Prediction|null=null;try{p=predict(world,kick);}catch{}
  const calls=s.attackers.map((a,i)=>a.call&&a.call.startAt==null?i:-1).filter(i=>i>=0);
  const note=noteFor(s,kick,p,calls,s.chain.length>0&&(performance.now()-aimSince.current)/1000<=FIRST_TIME);
  try{note.shut=shutLanes(lanesNow(world));}catch{/* the takeaway works without it */}return note;};
 // ── one render loop that runs only while something moves ──
 useEffect(()=>{
  const el=canvas.current;if(!el)return;let scene:PassPuzzleScene;try{scene=createPassPuzzleScene(el);sceneRef.current=scene;}catch{setError(true);return;}cine.setReduced(scene.stage.reduced);
  let cinePush=0;
  skipCine.current=()=>{cine.skip();if(cinePush>0){cinePush=0;scene.setReplayFocus(null);}if(finishAt.current){finishAt.current=0;finish();}};
  let frame=0,last=0,slot=0,disposed=false,thinkingUntil=0;const interval=1000/(scene.stage.mobile?30:60);
  const draw=(now:number)=>{frame=0;if(disposed||document.hidden)return;const next=frameCapSlot(now,slot,viewRef.current==='play'&&worldRef.current?.state.phase==='aiming'&&!stroke.current&&!cine.active?1000/15:interval);if(next<0){frame=requestAnimationFrame(draw);return;}slot=next;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
   const world=worldRef.current;if(!world){scene.render();return;}
   if(pausedRef.current){last=0;slot=0;return;}// paused: sleep until Resume wakes the loop
   let busy=false,state=world.state;const rep=replayRef.current;
   if(rep){for(const e of rep.advance(now<hitStop.current||now<replayHold.current?0:dt))handleEvent(e);state=rep.world.state;
    const key=attemptEvents.current.filter(e=>e.type!=='kick'&&e.type!=='receive').at(-1)??attemptEvents.current.at(-1);
    if(playerView.current)scene.followPlayer(state,dt);
    else if(key&&!coachReplay.current){const lead=key.t-state.t,amount=Math.max(0,Math.min(1,1-lead/1.4));scene.setReplayFocus({x:key.at.x,z:key.at.z},amount*amount*(3-2*amount));}
    busy=!rep.done||now<replayHold.current;if(rep.done&&now>=replayHold.current){replayRef.current=null;scene.setReplayRuns(false);scene.followPlayer(null,0);scene.setReplayFocus(null);setReplaying(false);state=world.state;scene.update(state,0);reshowStop();}
   }else if(finishAt.current){busy=true;if(now>=finishAt.current){finishAt.current=0;finish();}
   }else if(viewRef.current==='play'&&(state.phase==='windup'||state.phase==='flight')){world.step(now<hitStop.current?0:dt*cine.timeScale);for(const e of world.drain()){attemptEvents.current.push(e);handleEvent(e);}state=world.state;busy=true;
    // Cinematic: follow the ball along the lane, and slow down again as it reaches a teammate, a defender or the keeper.
    const f=state.flight,b=state.ball.p;if(f){cine.follow(b.x,b.z);if(!arrived.current){let near=f.receiver!=null&&!!state.attackers[f.receiver]&&Math.hypot(state.attackers[f.receiver].p.x-b.x,state.attackers[f.receiver].p.z-b.z)<3.2;
     if(!near)for(const d of state.defenders)if(d.mode==='intercept'&&Math.hypot(d.p.x-b.x,d.p.z-b.z)<2.6){near=true;break;}
     if(!near&&state.keeper&&f.kick.kind==='shot'&&Math.hypot(state.keeper.p.x-b.x,state.keeper.p.z-b.z)<4)near=true;
     if(near){arrived.current=true;cine.play('arrive',b.x,b.z);}}}
    const clock=world.scenario.require.clock,chip=clockChip.current;if(clock&&chip){const left=Math.max(0,clock-state.t),txt=left.toFixed(1);if(txt!==clockText.current){clockText.current=txt;chip.dataset.left=txt+' s';chip.dataset.low=String(left<2);}}
    if(state.phase==='aiming'){thinkingUntil=now+4000;aimSince.current=now;scene.setCalls(state,null);scene.setAim(null,state);applyHint.current();applyScan.current();syncHud();}
    if(state.phase==='success'||state.phase==='fail'){syncHud();settleUntil.current=now+900;const ok=state.phase==='success';
     // The result beat: a push-in on the scorer (goal) or on the defender who stopped it, then the card.
     if(ok){const sc=state.attackers[state.chain.at(-1)?.kicker??state.carrier]?.p??b;const high=Math.min(1,Math.max(0,(b.y-1.1)/1)),lean=.5+.3*high;/* a high finish leans the push-in up to the net, so the height of the strike reads */cine.play('goal',sc.x+(b.x-sc.x)*lean,sc.z+(b.z+1.5*high-sc.z)*lean);}
     else{cine.skip();const st=stopPoint(world,attemptEvents.current);failStop.current=st;if(st){scene.showStop(st.at,st.kind);stopShown.current=true;}const fin=finishFromEvents(geoOf(world.scenario),attemptEvents.current,kickKeeperX.current,state.flight?.aim),word=fin&&FINISH_WORD[fin.kind];if((fin?.kind==='post'||fin?.kind==='bar')&&now-woodAt.current<2600){/* POST! / BAR! is already up */}else if(word)shout.current({text:word,teach:'',tier:2});else shout.current({text:'So close!',teach:'',tier:1});}
     finishAt.current=scene.stage.reduced?now+1:now+(ok?950:750);}
   }else if(state.phase==='aiming'){
    // One-touch window: a shrinking ring around the new carrier while a first-time finish still counts.
    const left=FIRST_TIME-(now-aimSince.current)/1000,clock=viewRef.current==='play'&&state.chain.length>0&&world.scenario.bonus?.kind==='first-time'&&left>0?left/FIRST_TIME:null;
    scene.setClock(clock,state);if(clock!==null)busy=true;
    const st=stroke.current;
    if(st&&st.run!==undefined){scene.setCalls(state,{from:st.run,to:st.points.at(-1)!});busy=true;}
    else if(st){const tail=st.points.at(-1)!,held=now/1000-st.lastMove;
     if(now-st.predictionAt>=80&&(st.dirty||held>.2&&held<1.2)){st.predictionAt=now;st.dirty=false;const points=held>.02?[...st.points,{x:tail.x,z:tail.z,t:now/1000}]:st.points;try{const aim=points.length>1?readAim(points,world,st,true):null;st.kick=aim?.kick??null;st.place=aim?.place??null;st.prediction=st.kick?predict(world,st.kick):null;if(st.place&&st.kick&&st.prediction?.end==='goal')st.place.risky=riskyAim(world,st.kick,st.place);}catch{st.kick=null;st.place=null;st.prediction=null;}showAim(st,world);warn(st.prediction?.end==='offside'?'offside':null);
      const status=st.place?.risky?'tight' as const:laneStatus(st.prediction);
      // Arcade AAA pass 1: pencil scratch while the line is being drawn (one grain per preview, only while the finger moves).
      {const a=st.points.at(-2),b=st.points.at(-1);if(a&&b&&held<.12)puzzlePencil(audio.current,Math.hypot(b.x-a.x,b.z-a.z)/Math.max(.008,b.t-a.t));}
      {const r=st.kick?.receiver??-1,clear=status!=='blocked'&&status!=='offside';if(r!==snapReceiver.current||clear!==snapClear.current){if(r>=0)puzzleSnapTick(audio.current,clear);snapReceiver.current=r;snapClear.current=clear;}}
      scene.setAim({prediction:st.prediction,receiver:st.kick?.receiver,loft:st.kick?.loft??0,stroke:st.points,status:status??undefined,place:st.place??undefined},state);}
     if(controls.current.power===undefined&&st.kick&&powerSlider.current)powerSlider.current.value=String(Math.round(st.kick.power*100/5)*5);
     const loft=st.kick?.loft??0,meter=loftMeter.current;if(meter){meter.style.setProperty('--loft',String(loft));meter.dataset.active=String(controls.current.mode==='auto'&&held>.12&&!!st.kick&&!st.place);}
     if(st.dirty||held<HOLD_LOFT_SECONDS+.1)busy=true;
    }
   }
   // A short scan after input makes the defence feel attentive, then the
   // undecided puzzle sleeps instead of warming a phone indefinitely.
   if(!replayRef.current&&(cine.active||cinePush>0)){cine.update(dt);const p=cine.push;if(p>.002){scene.setReplayFocus(cine.focus,p);cinePush=p;busy=true;}else if(cinePush>0){cinePush=0;scene.setReplayFocus(null);}if(cine.active)busy=true;}
   const idleThinking=viewRef.current==='play'&&state.phase==='aiming'&&(now<thinkingUntil||!!stroke.current&&now/1000-stroke.current.lastMove<1.3);
   const animating=scene.update(state,dt,idleThinking);if(idleThinking&&!scene.stage.reduced)busy=true;
   scene.render();el.dataset.frames=String(Number(el.dataset.frames??0)+1);el.dataset.wake=`${+busy}${+animating}${+(now<settleUntil.current)}`;
   // The result card is a hard stop: a short settle for the last reactions, then no frames at all.
   const stopped=viewRef.current==='levels'||viewRef.current==='brief'||viewRef.current==='result'&&!replayRef.current&&now-resultAt.current>RESULT_SETTLE_MS;
   if(!stopped&&(busy||animating||now<settleUntil.current))frame=requestAnimationFrame(draw);else{last=0;slot=0;}
  };
  wake.current=()=>{thinkingUntil=performance.now()+4000;if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
  const visibility=()=>{if(!document.hidden)wake.current();else{cancelAnimationFrame(frame);frame=0;last=0;slot=0;}};
  const observer=new ResizeObserver(()=>{cancelDrawing.current();measureRoom.current(true);});observer.observe(el);document.addEventListener('visibilitychange',visibility);
  // ── Aim anywhere (Nov 11 2026): the finger's ray onto the goal face picks the spot. On the grass in front of the line it is the plain
  // low shot, exactly as before; on the net it is a placed shot (corner, top bins, or an honest miss over / wide). A small goal on a
  // phone aims as if it were AIM_MIN_PX tall, so a thumb can reach the top without pixel hunting. All of it runs on input only.
  const AIM_MIN_PX=64;
  type AimStroke={screenX:number;screenY:number;bounds:DOMRect;run?:number;place?:{x:number;y:number;sigma:number;risky?:boolean}|null};
  /** Would the strike still score at the edge of its scatter (toward the keeper, higher, wider)? Three more look-aheads, on input, only for a spot that scores when struck clean. */
  const riskyAim=(world:PuzzleWorld,kick:Kick,pl:{x:number;y:number;sigma:number}):boolean=>{const kx=world.state.keeper?.p.x??0,s=Math.max(.12,pl.sigma),side=Math.sign(pl.x-kx)||1;
   for(const [dx,dy] of [[-side*s,0],[0,s],[(Math.sign(pl.x)||side)*s,0]]){try{if(predict(world,{...kick,place:{x:pl.x+dx,y:Math.max(AIM_LOW_Y,pl.y+dy),ideal:true}}).end!=='goal')return true;}catch{return true;}}return false;};
  const placeFor=(st:AimStroke,world:PuzzleWorld,base:Kick):{x:number;y:number}|null=>{
   if(st.run!==undefined||base.kind==='pass-feet'||base.kind==='header')return null;
   const geo=geoOf(world.scenario),g=scene.pickGoal(st.screenX,st.screenY,st.bounds);
   if(g&&world.state.ball.p.z<geo.goalZ-1){const y=g.y*Math.min(1,g.barPx/AIM_MIN_PX);if(y>=AIM_LOW_Y&&y<=geo.barH+AIM_OVER+.8&&Math.abs(g.x)<=geo.halfGoal+AIM_WIDE+.6)return{x:g.x,y};}
   // The Shoot key's Height slider is the same placed shot without pointing (keyboard and switch access).
   if(controls.current.mode==='shoot'&&(controls.current.shotHeight??0)>0&&base.kind==='shot')return{x:base.target.x,y:heightOf(geo,controls.current.shotHeight!)};
   return null;};
  const readAim=(points:StrokePoint[],world:PuzzleWorld,st:AimStroke,ideal:boolean):{kick:Kick;place:{x:number;y:number;sigma:number}|null}=>{
   const base=readStroke(points,world,controls.current),p=placeFor(st,world,base);if(!p)return{kick:base,place:null};
   // The part of the stroke drawn up the net is aim, not power: the line is read as far as the goal line.
   const geo=geoOf(world.scenario),b=world.state.ball.p,inside=points.filter(q=>q.z<=geo.goalZ+2),tail=inside.at(-1)??points[0];
   const pts=[...inside,{x:Math.max(-geo.halfGoal,Math.min(geo.halfGoal,p.x)),z:geo.goalZ+2,t:Math.max(tail.t,points.at(-1)!.t)}];
   const kick=readStroke(pts.length>1?pts:points,world,{...controls.current,shotHeight:undefined,place:ideal?{...p,ideal:true}:p}),pl=kick.place!;
   return{kick,place:{x:pl.x,y:pl.y,sigma:scatterSigma(Math.hypot(pl.x-b.x,geo.goalZ-b.z),shotPressure(world.state.defenders,world.state.attackers[world.state.carrier].p),heightShare(geo,pl.y))}};};
  /** The aim panel: the goal face enlarged beside the finger, the keeper, the reticle and its scatter ring. Attribute writes on input; no loop. */
  const hideAim=()=>{const el=aimPanel.current;if(el)el.dataset.on='false';};
  const showAim=(st:AimStroke,world:PuzzleWorld)=>{const el=aimPanel.current,pl=st.place;if(!el)return;if(!pl){el.dataset.on='false';return;}
   const geo=geoOf(world.scenario),hg=geo.halfGoal,bar=geo.barH,k=world.state.keeper,svg=el.querySelector('svg'),q=(n:string)=>el.querySelector(`[data-aim=${n}]`);if(!svg)return;
   svg.setAttribute('viewBox',`${(-hg-1.5).toFixed(2)} ${(-bar-1.5).toFixed(2)} ${(2*hg+3).toFixed(2)} ${(bar+2).toFixed(2)}`);
   q('frame')?.setAttribute('d',`M${-hg} 0V${-bar}H${hg}V0`);q('net')?.setAttribute('d',Array.from({length:9},(_,i)=>`M${(-hg+(i+1)*hg/5).toFixed(2)} 0V${-bar}`).join('')+Array.from({length:3},(_,i)=>`M${-hg} ${(-(i+1)*bar/4).toFixed(2)}H${hg}`).join(''));
   const keeper=q('keeper') as SVGElement|null;if(keeper){keeper.style.display=k?'':'none';}
   // The panel is drawn as the camera sees the goal (pitch +x may be on the left of the screen).
   const flip=scene.toScreen(1,0,geo.goalZ).x<scene.toScreen(-1,0,geo.goalZ).x?-1:1,ax=pl.x*flip;
   if(keeper&&k)keeper.setAttribute('transform',`translate(${(Math.max(-hg-1,Math.min(hg+1,k.p.x))*flip).toFixed(2)} 0)`);
   const cy=-Math.min(bar+1.35,pl.y);q('ring')?.setAttribute('cx',ax.toFixed(2));q('ring')?.setAttribute('cy',cy.toFixed(2));q('ring')?.setAttribute('r',Math.max(.2,pl.sigma+.11).toFixed(2));q('spot')?.setAttribute('transform',`translate(${ax.toFixed(2)} ${cy.toFixed(2)})`);
   const word=aimWord(geo,pl.x,pl.y),label=q('word');if(label&&label.textContent!==word)label.textContent=word;el.dataset.miss=word==='OVER'||word==='WIDE'?'true':'false';el.dataset.risky=pl.risky?'true':'false';
   // Beside the finger like a text loupe: above it when there is room, otherwise to the side away from the screen edge.
   const r=st.bounds,W=el.offsetWidth||176,H=el.offsetHeight||96,px=st.screenX-r.left,py=st.screenY-r.top;let left=px-W/2,top=py-H-58;
   if(top<8){top=Math.max(8,Math.min(r.height-H-8,py+34));left=px>r.width/2?px-W-46:px+46;}
   el.style.left=`${Math.max(8,Math.min(r.width-W-8,left))}px`;el.style.top=`${top}px`;el.dataset.on='true';};
  // Pointer: a stroke always starts at the ball, so a small thumb never misses it.
  const down=(e:PointerEvent)=>{if(pausedRef.current)return;/* a tap during a beat only skips it (it never also fires a pass) */if(cine.active||finishAt.current){e.preventDefault();skipCine.current();return;}const world=worldRef.current;if(e.button!==0||!world||replayRef.current||viewRef.current!=='play'||world.state.phase!=='aiming'||stroke.current)return;const bounds=el.getBoundingClientRect(),p=scene.pick(e.clientX,e.clientY,bounds);if(!p)return;e.preventDefault();unlock();el.setPointerCapture(e.pointerId);const b=world.state.ball.p,t=performance.now()/1000;
   // Starting on a teammate (away from the ball) drags their run instead of a pass: movement first, then the pass.
   let run:number|undefined,best=RUN_GRAB;if(Math.hypot(p.x-b.x,p.z-b.z)>BALL_GRAB)world.state.attackers.forEach((a,i)=>{const d=Math.hypot(a.p.x-p.x,a.p.z-p.z);if(i!==world.state.carrier&&d<best){best=d;run=i;}});
   const from=run!==undefined?world.state.attackers[run].p:b;
   scene.setScan(null);stroke.current={filter:createPointerFilter(e.clientX,e.clientY,e.timeStamp),bounds,holdX:e.clientX,holdY:e.clientY,id:e.pointerId,points:[{x:from.x,z:from.z,t:t-.001},{x:p.x,z:p.z,t}],lastMove:t,kick:null,prediction:null,dirty:true,predictionAt:0,screenX:e.clientX,screenY:e.clientY,run};if(run===undefined)placeMeter(e);wake.current();};
  const sample=(e:PointerEvent,force=false)=>{const st=stroke.current;if(!st||st.id!==e.pointerId)return;
   const filtered=filterPointer(st.filter,e.clientX,e.clientY,e.timeStamp),x=force?e.clientX:filtered.x,y=force?e.clientY:filtered.y;
   if(!force&&Math.hypot(x-st.screenX,y-st.screenY)<.65)return;
   const p=scene.pick(x,y,st.bounds);if(!p||!Number.isFinite(p.x+p.z))return;
   // Coalesced samples keep their own time instead of all receiving the
   // frame's timestamp; hold duration and gesture speed stay consistent.
   const t=Math.max(st.points.at(-1)!.t,Math.min(performance.now()/1000,e.timeStamp/1000));
   if(Math.hypot(e.clientX-st.holdX,e.clientY-st.holdY)>5){st.lastMove=t;st.holdX=e.clientX;st.holdY=e.clientY;}
   appendStroke(st.points,{x:p.x,z:p.z,t});st.screenX=x;st.screenY=y;st.dirty=true;
  };
  const move=(e:PointerEvent)=>{if(stroke.current?.id!==e.pointerId)return;e.preventDefault();const samples=e.getCoalescedEvents?.()??[];for(const point of samples.slice(-8))sample(point);sample(e);placeMeter(e);wake.current();};
  const up=(e:PointerEvent)=>{const st=stroke.current,world=worldRef.current;if(!st||st.id!==e.pointerId||!world)return;warn(null);sample(e,true);stroke.current=null;hideMeter();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
   if(st.run!==undefined){const a=world.state.attackers[st.run],end=st.points.at(-1)!,len=a?Math.hypot(end.x-a.p.x,end.z-a.p.z):0;
    if(len>=1.5){if(world.callRun(st.run,{x:end.x,z:end.z}))puzzleTouch(audio.current,'feet');}else if(a?.call)world.callRun(st.run,null);/* a tap on a runner cancels their run */
    scene.setCalls(world.state,null);applyScan.current();settleUntil.current=performance.now()+300;wake.current();return;}
   const t=performance.now()/1000,tail=st.points.at(-1)!,points=[...st.points,{x:tail.x,z:tail.z,t}],length=Math.hypot(tail.x-points[0].x,tail.z-points[0].z);
   let kick:Kick|null=null;try{kick=length>=MIN_STROKE_METRES?readAim(points,world,st,false).kick:null;}catch{kick=null;}
   hideAim();scene.setAim(null,world.state);scene.setClock(null,world.state);if(kick){const snapshot=world.snapshot();
    // The frozen world still keeps the thinking time honest: it decides the first-time bonus.
    for(let left=Math.min(4,(performance.now()-aimSince.current)/1000);left>1e-4;left-=.25)world.step(Math.min(.25,left));
    const note=takeNote(world,kick);if(world.kick(kick)){rewindPoint.current=snapshot;notes.current[world.inputs().length-1]=note;syncHud();}}if(world.state.phase==='aiming'){scene.clearStroke();applyScan.current();}settleUntil.current=performance.now()+400;wake.current();};
  const cancelAll=()=>{warn(null);hideAim();const st=stroke.current;if(st?.run!==undefined&&worldRef.current)sceneRef.current?.setCalls(worldRef.current.state,null);stroke.current=null;hideMeter();if(st&&el.hasPointerCapture(st.id))el.releasePointerCapture(st.id);const w=worldRef.current;if(w)scene.setAim(null,w.state);scene.clearStroke();applyScan.current();wake.current();};
  cancelDrawing.current=cancelAll;
  const cancel=(e:PointerEvent)=>{if(stroke.current?.id===e.pointerId)cancelAll();};
  const blur=()=>cancelAll();const hidden=()=>{if(document.hidden)cancelAll();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const placeMeter=(e:PointerEvent)=>{const m=loftMeter.current,r=stroke.current?.bounds??el.getBoundingClientRect();if(m){m.style.left=`${e.clientX-r.left}px`;m.style.top=`${e.clientY-r.top}px`;}};
  const hideMeter=()=>{const m=loftMeter.current;if(m){m.dataset.active='false';m.style.setProperty('--loft','0');}};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__passPuzzle:unknown}).__passPuzzle={cine,scenarios:()=>SCENARIOS,endlessScenario:(seed:string,lvl:number)=>endlessPuzzle(seed,lvl).scenario,/* layout check (scripts/check-pass-puzzle-layout.cjs): frame a scenario with the live HUD and return the screen boxes */layout:(sc:Scenario)=>{scene.load(sc);return scene.layoutProbe();},measureRoom:(smooth=false)=>measureRoom.current(smooth),get world(){return worldRef.current;},get replay(){return replayRef.current;},scene,wake:()=>wake.current(),kick:(k:Kick)=>{const w=worldRef.current;if(!w)return false;const note=w.state.phase==='aiming'?takeNote(w,k):null;const ok=w.kick(k);if(ok&&note)notes.current[w.inputs().length-1]=note;syncHud();wake.current();return ok;},solution:(id:string)=>(id.startsWith('daily-')?todaysDaily()?.solution:routeOf(id,headingRef.current))?.filter(st=>!('call' in st)),route:(id:string)=>id.startsWith('daily-')?todaysDaily()?.solution:routeOf(id,headingRef.current),naive:(id:string)=>ALL_SOLUTIONS[id]?.naive[0],callRun:(i:number,x:number,z:number)=>{const w=worldRef.current;const ok=!!w&&w.callRun(i,{x,z});if(w)sceneRef.current?.setCalls(w.state);wake.current();return ok;},daily:()=>todaysDaily()};
  // The level list sits over the first puzzle's frozen pitch: one static frame, then sleep.
  if(SCENARIOS[0])try{const w=createPuzzle(playable(SCENARIOS[0],headingRef.current));worldRef.current=w;scene.load(SCENARIOS[0]);scene.update(w.state,0);}catch{/* the play button reports real failures */}
  wake.current();
  return()=>{disposed=true;cancelDrawing.current=()=>{};window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);scene.dispose();sceneRef.current=null;worldRef.current=null;replayRef.current=null;wake.current=()=>{};void audio.current?.close();audio.current=null;delete (window as unknown as {__passPuzzle?:unknown}).__passPuzzle;};
 },[finish,handleEvent]);

 /** Build the frozen moment for a level: the pitch shows behind the brief card. */
 const resetCine=()=>{clockText.current='';const chip=clockChip.current,cl=worldRef.current?.scenario.require.clock;if(chip&&cl){chip.dataset.left=`${cl.toFixed(1)} s`;chip.dataset.low='false';}finishAt.current=0;stopShown.current=false;arrived.current=false;cine.skip();cine.resetBudget();sceneRef.current?.setReplayFocus(null);};
 const loadLevel=(s:Scenario)=>{resetCine();setCallout(null);rewindPoint.current=null;rewound.current=false;notes.current=[];setSpotHint(false);spotHintRef.current=false;const scene=sceneRef.current;if(!scene)return;replayRef.current=null;setReplaying(false);stroke.current=null;attemptEvents.current=[];
  try{const played=playable(s,headingRef.current);const world=createPuzzle(played);worldRef.current=world;scene.load(played);scene.setTier?.(tierOfPack(s.pack)?.look??null);boardRef.current=boardForPuzzle(s.id,s.pack);scene.setAim(null,world.state);scene.setCalls(world.state,null);scene.update(world.state,0);}catch{setError(true);return;}
  setLevelId(s.id);setPackId(s.pack);setOutcome(null);setShowHint(false);syncHud();settleUntil.current=performance.now()+300;wake.current();};
 const openLevel=(s:Scenario)=>{stopEndless();loadLevel(s);setView('brief');};
 const dailyId=`daily-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
 const openDaily=()=>{const d=todaysDaily();if(d)openLevel(d.scenario);};
 const play=async()=>{unlock();const id=await entry.enter();if(!id)return;setBoardScore(null);beginBoardSession(boardRef.current);aimSince.current=performance.now();coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');recordExploreActivity('arcade');setView('play');const w=worldRef.current;if(w){sceneRef.current?.setAim(null,w.state);
  if(w.state.attempt===1&&w.state.passes===0&&w.inputs().length===0){const c=w.state.attackers[w.state.carrier]?.p;let free:{x:number;z:number}|undefined;try{free=lanesNow(w).find(l=>l.status==='clear')?.to;}catch{/* no tour stop */}
   if(c){cine.resetBudget();cine.intro(c.x,c.z,free?.x,free?.z);}}}settleUntil.current=performance.now()+1200;wake.current();};
 const retry=async()=>{aimSince.current=performance.now();const worldBefore=worldRef.current;if(!worldBefore)return;if(worldBefore.state.attemptsLeft<=0||worldBefore.state.phase==='success'){const id=await entry.enter();if(!id)return;}setCallout(null);resetCine();rewindPoint.current=null;rewound.current=false;coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');const world=worldRef.current,scene=sceneRef.current;if(!world||!scene)return;replayRef.current=null;setReplaying(false);if(!world.retry()){loadLevel(world.scenario);setView('play');return;}attemptEvents.current=[];notes.current=[];scene.resetActors();scene.update(world.state,0);scene.setAim(null,world.state);scene.setCalls(world.state,null);applyHint.current();applyScan.current();syncHud();setOutcome(null);setShowHint(true);setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const rewindPass=()=>{aimSince.current=performance.now();const world=worldRef.current,scene=sceneRef.current,snapshot=rewindPoint.current;if(!world||!scene||!snapshot||rewound.current)return;cancelDrawing.current();resetCine();replayRef.current=null;setReplaying(false);world.drain();world.restore(snapshot);rewound.current=true;rewindPoint.current=null;attemptEvents.current=attemptEvents.current.filter(e=>e.tick<snapshot.state.tick);notes.current.length=Math.min(notes.current.length,world.inputs().length);scene.resetActors();scene.setReplayFocus(null);scene.setAim(null,world.state);scene.setCalls(world.state,null);scene.update(world.state,0);applyHint.current();applyScan.current();setOutcome(null);setShowHint(true);syncHud();setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const coachReplay=useRef(false),playerView=useRef(false),[playerCam,setPlayerCam]=useState(false),[replayKind,setReplayKind]=useState<'mine'|'coach'>('mine');
 const togglePlayerView=()=>{playerView.current=!playerView.current;setPlayerCam(playerView.current);if(!playerView.current){sceneRef.current?.followPlayer(null,0);}wake.current();};
 /** The coach's route: the taught move played the way a finger would draw it, at a calmer 0.6×. */
 const watchCoach=()=>{const world=worldRef.current;if(!world)return;try{const run=coachRun(world.scenario,levelId.startsWith('daily-')?todaysDaily()?.solution??[]:routeOf(levelId,headingRef.current));if(!run.inputs.length)return;replayRef.current=replayAttempt(run.start,run.inputs,progressRef.current.replay==='1x'?1:.6);coachReplay.current=true;replayInputs.current=run.inputs;}catch{return;}startReplay();setReplayKind('coach');setReplaying(true);setView('play');wake.current();};
 const startReplay=()=>{replayKicks.current=0;replayHold.current=0;setReplayLine('');sceneRef.current?.setHint(null);sceneRef.current?.setScan(null);sceneRef.current?.setReplayRuns(true);sceneRef.current?.resetActors();};
 const watchAgain=()=>{setReplayKind('mine');coachReplay.current=false;const world=worldRef.current;if(!world)return;try{replayRef.current=replayAttempt(world.attemptStart(),world.inputs(),progressRef.current.replay==='1x'?1:REPLAY_SPEED);replayInputs.current=world.inputs();}catch{return;}startReplay();setReplaying(true);setView('play');wake.current();};
 const skipReplay=()=>{const rep=replayRef.current,world=worldRef.current;if(!rep||!world)return;replayRef.current=null;replayHold.current=0;sceneRef.current?.setReplayRuns(false);sceneRef.current?.followPlayer(null,0);sceneRef.current?.setReplayFocus(null);sceneRef.current?.update(world.state,0);setReplaying(false);setView('result');reshowStop();wake.current();};
 /** Back on the result card after a replay: the stop mark returns where the move broke down. */
 const reshowStop=()=>{const f=failStop.current;if(f&&worldRef.current?.state.result?.outcome==='fail')sceneRef.current?.showStop(f.at,f.kind);};
 /** Tier-2 hint: the next pass of the coach's route from here (and the run to call first), if the
  *  child's move still matches the route; otherwise null and the words say to start again. */
 const hintKey=useRef('');
 applyHint.current=()=>{const scene=sceneRef.current,world=worldRef.current;if(!scene)return;
  if(!spotHintRef.current||!world||world.state.phase!=='aiming'||replayRef.current){scene.setHint(null);return;}
  const s=world.state,id=world.scenario.id,route:Step[]=id.startsWith('daily-')?todaysDaily()?.solution??[]:routeOf(id,headingRef.current),done=world.inputs().length;
  let k=0,expect=world.scenario.carrier,calls:{attacker:number;to:{x:number;z:number}}[]=[];
  for(const st of route){if(isCall(st)){calls.push(st.call);continue;}
   if(k===done){if(s.carrier!==expect)break;const g=world.scenario.pitch,hg=g.goalWidth/2-.4;
    const spot=st.kind==='shot'?{x:Math.max(-hg,Math.min(hg,st.target.x)),z:g.length/2}:(st.kind==='pass-feet'||st.kind==='header')&&st.receiver!=null&&s.attackers[st.receiver]?{...s.attackers[st.receiver].p}:{...st.target};
    const run=calls.find(c=>!s.attackers[c.attacker]?.call);
    const hk=`${s.attempt}:${done}:${spot.x.toFixed(1)},${spot.z.toFixed(1)}`;if(hk!==hintKey.current){hintKey.current=hk;cine.play('hint',spot.x,spot.z);}
    scene.setHint({spot,run:run&&s.attackers[run.attacker]?{from:s.attackers[run.attacker].p,to:run.to}:undefined});return;}
   expect=st.kind==='shot'?expect:(st.receiver??expect);calls=[];k++;}
  scene.setHint(null);};
 /** "Look up": the Scan lights every simple pass on the frozen pitch (green open, amber tight, red shut). */
 const scanOn=endHud?endHud.aid==='scan'&&(progress.scan??true):progress.scan??SCAN_FIRST.has(level?.pack??''),scanRef=useRef(scanOn);scanRef.current=scanOn;
 applyScan.current=()=>{const scene=sceneRef.current,world=worldRef.current;if(!scene)return;
  if(!scanRef.current||viewRef.current!=='play'||!world||world.state.phase!=='aiming'||replayRef.current||stroke.current){scene.setScan(null);return;}
  try{scene.setScan(lanesNow(world));}catch{scene.setScan(null);}};
 const toggleScan=()=>{cancelDrawing.current();const on=!scanRef.current;scanRef.current=on;setProgress(p=>{const next={...p,scan:on};writeProgress(next);return next;});applyScan.current();settleUntil.current=performance.now()+120;wake.current();};
 useEffect(()=>{applyHint.current();applyScan.current();wake.current();},[spotHint,view,heading,scanOn]);
 /** The hint button shows the glowing spot (and the run arrow) on the pitch, then hides it: no hint words in play (owner, Oct 27 2026). */
 const cycleHint=()=>{if(!spotHint){setShowHint(true);setSpotHint(true);return;}setShowHint(false);setSpotHint(false);};
 useEffect(()=>{if(!replaying&&outcome&&view==='play'&&!replayRef.current&&worldRef.current?.state.result)setView('result');},[replaying,outcome,view]);

 const unlocked=(s:Scenario,list:Scenario[])=>{const i=list.indexOf(s);return i<=0||(progress.stars[list[i-1].id]??0)>0||(progress.stars[s.id]??0)>0;};
 const totalStars=Object.values(progress.stars).reduce((a,b)=>a+b,0);dailyStars=totalStars;
 const expertOpen=totalStars>=EXPERT_GATE,dailyIsHard=hardDailyDay(new Date(),totalStars),dailySeason=season(new Date());
 const corePacks=PACKS.filter(p=>p.tier!=='expert'&&!tierOfPack(p.id)),expertPacks=PACKS.filter(p=>p.tier==='expert');
 /** "Next puzzle" follows the pack map (not the file order), and stops at a pack that is still closed. */
 const cupList=level&&tierOfPack(level.pack)?TIER_SCENARIOS.filter(s=>s.pack===level.pack):null,cupNext=cupList&&level?cupList[cupList.indexOf(level)+1]:undefined;
 const next=level?(cupList?(cupNext?{scenario:cupNext,newPack:false}:null):nextOnMap(level.id,totalStars)):null,nextLevel=next&&'scenario' in next?next.scenario:undefined;
 /** Play = continue: the first unsolved puzzle along the pack map in an open pack (level 1 on a first run),
  *  then the first one still missing stars, so the big button never asks a question first. */
 const packOpen=(s:Scenario)=>{const p=packInfo(s.pack);return !p||packGateOpen(p,totalStars);};
 const continueLevel=MAP_ORDER.find(s=>packOpen(s)&&!(progress.stars[s.id]>0))??MAP_ORDER.find(s=>packOpen(s)&&(progress.stars[s.id]??0)<3)??MAP_ORDER[0];
 const continueNumber=continueLevel?MAP_ORDER.filter(s=>s.pack===continueLevel.pack).indexOf(continueLevel)+1:1;
 const firstRun=totalStars===0;
 const quickPlay=()=>{if(!continueLevel)return;stopEndless();loadLevel(continueLevel);void play();};
 const openPack=(id:string)=>{puzzleUiTap(audio.current);setPackId(id);setMenu('pack');};

 /** The three star goals in words, for the brief and result cards. */
 const goals=(s:Scenario)=>['Solve the puzzle',s.require.minPasses===0?'Score with a clean shot':`Use the move: ${s.require.minPasses} pass${s.require.minPasses===1?'':'es'} first`,`Bonus: ${s.bonus?.label??'Finish first time'}`];
 const star=(on:boolean,key:number)=><span key={key} className={on?styles.starOn:styles.starOff} aria-hidden="true">★</span>;
 const briefText=level?.brief[format]??'',hintText=level?.hint[format]??'';
 /** Level modifiers, shown as chips (like a level's special rules): what is different about this pitch. */
 const modifiers=(s:Scenario|undefined)=>{if(!s)return[];const m:string[]=[],w=s.weather?.wind;
  if(w)m.push(Math.abs(w.z)>=Math.abs(w.x)?(w.z<0?'Headwind: high balls hang':'Tailwind: high balls carry'):'Crosswind: high balls drift');
  if(s.weather?.wet)m.push('Wet pitch: the ball skids');if(s.require.clock)m.push(`Counter: score within ${s.require.clock} s of play`);
  if(s.defenders.some(d=>d.trap))m.push('Offside trap: the line steps up');if(s.defenders.some(d=>d.hunt))m.push('Hunter: presses every pass');
  if(s.defenders.some(d=>d.recover))m.push('Defenders sprint back');if(s.keeper?.sweeper)m.push('Keeper rushes out');return m;};
 const inPlay=view==='play'&&!replaying;
 const [nudge,setNudge]=useState(false);
 useEffect(()=>{setNudge(false);if(!inPlay||hud.phase!=='aiming'||spotHint)return;const id=setTimeout(()=>setNudge(true),hud.attempt>1?6000:14000);return()=>clearTimeout(id);},[inPlay,hud.phase,hud.attempt,hud.passes,spotHint]);
 const expertIdea=level&&isExpertPack(level.pack)?EXPERT_CONCEPTS[level.concept]:undefined;
 /** Progress toward the taught move, always on screen (the brief card is gone once play starts). */
 const progressHud=endHud?{count:String(endHud.score),label:endHud.score===1?'star':'stars',met:false}:passProgress(hud.passes,level?.require.minPasses??0);/* Endless Run: the pill is the run's score */
 // Pause (shared arcade pause card): the draw loop sleeps (no frames at all) and the pitch ignores touches until Resume.
 const setPause=(on:boolean)=>{if(on){cancelDrawing.current();}pausedRef.current=on;setPaused(on);endlessPauseClock(on);if(!on)wake.current();};
 const toPuzzles=()=>{stopEndless();cancelDrawing.current();replayRef.current=null;sceneRef.current?.setReplayFocus(null);setReplaying(false);setMenu('home');setView('levels');wake.current();};
 // Restart: this puzzle again from its first try (Pass Puzzles is free to play; the entry just opens a fresh run).
 // ── Endless Run (Nov 10 2026; rules, ramp and scoring in lib/passPuzzle/endless.ts) ──
 const endlessTimers=()=>{const e=endless.current;if(e){clearTimeout(e.timer);clearTimeout(e.clockTimer);e.timer=e.clockTimer=0;e.remaining=0;}};
 const stopEndless=()=>{endlessTimers();endless.current=null;setEndHud(null);setEndNote(null);setEndOver(null);};
 const endlessClockArm=(ms:number)=>{const e=endless.current;if(!e)return;clearTimeout(e.clockTimer);e.deadline=performance.now()+ms;e.clockTimer=window.setTimeout(endlessTimeUp,ms);};
 const endlessPauseClock=(on:boolean)=>{const e=endless.current;if(!e)return;if(on){if(e.clockTimer){clearTimeout(e.clockTimer);e.clockTimer=0;e.remaining=Math.max(300,e.deadline-performance.now());}}else if(e.remaining>0){const ms=e.remaining;e.remaining=0;endlessClockArm(ms);}};
 /** Put a run puzzle on the pitch and start play at once: no brief card, no menu. */
 const endlessServe=(p:EndlessPuzzle)=>{const e=endless.current;if(!e)return;const run=e.run;e.puzzle=p;endlessNow=p;loadLevel(p.scenario);boardRef.current='puzzle';setView('play');aimSince.current=performance.now();
  setEndHud({level:run.level,lives:run.lives,score:run.score,streak:run.streak,clock:p.clock,clockKey:++e.serial,aid:p.ramp.aid});
  clearTimeout(e.clockTimer);e.clockTimer=0;e.remaining=0;if(p.clock)endlessClockArm(p.clock*1000);
  applyHint.current();applyScan.current();settleUntil.current=performance.now()+700;wake.current();
  // The next puzzle is built (and engine-checked) while this one is being read, so the change-over never waits for it.
  e.next=null;window.setTimeout(()=>{if(endless.current===e&&e.puzzle===p&&!e.next)try{e.next=endlessPuzzle(run.seed,run.level+1);}catch{/* built on demand instead */}},150);};
 /** On to the next puzzle (or the same one again after a failed try) behind a quick comic wipe. */
 const endlessAdvance=()=>{const e=endless.current;if(!e||e.run.over)return;clearTimeout(e.timer);e.timer=0;const run=e.run;let p:EndlessPuzzle;
  try{p=e.puzzle&&e.puzzle.level===run.level?e.puzzle:e.next&&e.next.level===run.level?e.next:endlessPuzzle(run.seed,run.level);}catch{setError(true);return;}
  setEndNote(n=>n&&{...n,next:false});
  if(sceneRef.current?.stage.reduced){endlessServe(p);return;}
  setWipe(w=>w+1);e.timer=window.setTimeout(()=>{e.timer=0;if(endless.current===e)endlessServe(p);},130);};
 /** Full time: the lives are gone. The fail beat plays, then the run card and the one Pass Puzzles board. */
 const endlessOver=()=>{const e=endless.current;if(!e)return;endlessTimers();const run=e.run,last=e.puzzle?.scenario;let best=0;try{best=Number(JSON.parse(localStorage.getItem(ENDLESS_BEST_KEY)??'{}').score)||0;}catch{/* no best yet */}
  const newBest=run.score>best;if(newBest){try{localStorage.setItem(ENDLESS_BEST_KEY,JSON.stringify({score:run.score,solved:run.solved,level:run.level}));}catch{/* this visit only */}setEndBest(run.score);}
  let lesson=last?.lesson??'';try{const w=last?puzzleConceptWords(last.concept,formatRef.current):null;if(w)lesson=`The move to practise: ${w.name}.${w.line?' '+w.line:''}`;}catch{/* the puzzle's own lesson stays */}
  setEndOver({score:run.score,solved:run.solved,level:run.level,best:Math.max(best,run.score),newBest,streak:run.bestStreak,lesson});
  e.timer=window.setTimeout(()=>{e.timer=0;if(endless.current!==e)return;setEndHud(null);setEndNote(null);setView('result');if(run.score>0){setBoardGame('puzzle');setBoardScore(run.score);}if(newBest)puzzleNewBest(audio.current,.2);},sceneRef.current?.stage.reduced?300:1500);};
 /** Score one result, show its teaching line for a moment and keep the run moving. */
 const endlessResolve=(event:EndlessEvent,note:{kind:'win'|'fail'|'skip'|'clock';title:string;line:string},delay:number)=>{const e=endless.current;if(!e)return;clearTimeout(e.clockTimer);e.clockTimer=0;e.remaining=0;const step=stepEndless(e.run,event);e.run=step.run;
  setEndHud(h=>h&&{...h,lives:step.run.lives,score:step.run.score,streak:step.run.streak,clock:null});
  setEndNote({key:++e.serial,...note,gained:step.gained,next:!step.run.over});
  if(step.gained>0){for(let i=0;i<Math.min(3,step.gained);i++)puzzleStar(audio.current,i+1,.2+i*.16);if(step.run.streak>=2)puzzleStreak(audio.current,step.run.streak,.75);}
  if(step.run.over){endlessOver();return;}
  e.timer=window.setTimeout(endlessAdvance,delay);};
 endlessFinish.current=(success:boolean,move:boolean,reason?:string)=>{const e=endless.current,world=worldRef.current;if(!e||!world||e.timer||e.run.over)return;const sc=world.scenario,f=formatRef.current;
  let words:{name:string;line:string|null}|null=null;try{words=puzzleConceptWords(sc.concept,f);}catch{/* the title stands in */}
  if(success){endlessResolve({kind:'solve',move},{kind:'win',title:words?.name??sc.title,line:move?(words?.line??sc.lesson):'A clear shot. Play the passes next time for one more star.'},500);return;}
  let why='';try{const nums=shirtNumbersFor(sc),kept=notes.current.slice(0,world.inputs().length),stop=attemptEvents.current.filter(x=>['intercept','deflect','save','parry','offside'].includes(x.type)).at(-1),x=explainFail(reason,stop,kept.at(-1),nums,f);if(x)why=x.fix||x.why;}catch{/* the generic copy stays */}
  try{const line=finishFromEvents(geoOf(sc),attemptEvents.current,kickKeeperX.current,world.state.flight?.aim,f==='7v7')?.line;if(line)why=line;}catch{/* the pass copy stays */}
  endlessResolve({kind:'fail'},{kind:'fail',title:'So close!',line:why||reasonCopy[reason??'']||'Look again at who can reach the ball.'},1700);};
 const endlessSkip=()=>{const e=endless.current,w=worldRef.current;if(!e||!w||w.state.phase!=='aiming'||e.run.lives<=1||e.timer||!e.puzzle)return;cancelDrawing.current();puzzleUiTap(audio.current);let name=e.puzzle.scenario.title;try{name=puzzleConceptWords(e.puzzle.scenario.concept,formatRef.current)?.name??name;}catch{/* the title stands in */}
  endlessResolve({kind:'skip'},{kind:'skip',title:'Skipped',line:`The move was: ${name}.`},350);};
 /** The thinking clock ran out. A pass already on its way may finish; the clock only bites while the child is still deciding. */
 function endlessTimeUp(){const e=endless.current,w=worldRef.current;if(!e||!w||e.run.over||e.timer)return;e.clockTimer=0;
  if(w.state.phase!=='aiming'||viewRef.current!=='play'){if(w.state.phase==='windup'||w.state.phase==='flight')e.clockTimer=window.setTimeout(endlessTimeUp,500);return;}
  cancelDrawing.current();puzzleWhistle(audio.current);endlessResolve({kind:'fail'},{kind:'clock',title:'Time!',line:'Look up early: decide before the clock runs down.'},1300);}
 const startEndless=async()=>{unlock();const id=await entry.enter();if(!id)return;endlessTimers();setBoardScore(null);setEndOver(null);setEndNote(null);beginBoardSession('puzzle');recordExploreActivity('arcade');
  const seed=endlessSeed(new Date(),endlessRuns.current++);endless.current={run:startEndlessRun(seed),puzzle:null,next:null,timer:0,clockTimer:0,deadline:0,remaining:0,serial:0};
  try{endlessServe(endlessPuzzle(seed,1));}catch{setError(true);}};
 const restartPuzzle=async()=>{const w=worldRef.current;if(!w)return;setPause(false);if(endless.current){await startEndless();return;}replayRef.current=null;sceneRef.current?.setReplayFocus(null);setReplaying(false);loadLevel(w.scenario);await play();};
 useEffect(()=>{if(view!=='play'&&pausedRef.current){pausedRef.current=false;setPaused(false);}},[view]);
 // Escape / P pause and resume while playing, like the other arcade machines.
 useEffect(()=>{if(view!=='play')return;const key=(e:KeyboardEvent)=>{if(e.code!=='Escape'&&e.code!=='KeyP')return;if(e.defaultPrevented||boardsOpen||(e.target instanceof HTMLElement&&e.target.closest('input,select,textarea')))return;e.preventDefault();setPause(!pausedRef.current);};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[view,boardsOpen]);
 // Escape like the other machines' cards: the puzzle map leaves for the arcade, a brief goes back to the map. Not while drawing/playing,
 // and not under the board dialogs (they keep their own keys).
 const exitRef=useRef(onExit);exitRef.current=onExit;
 useEffect(()=>{if(view!=='levels'&&view!=='brief')return;const key=(e:KeyboardEvent)=>{if(e.code!=='Escape'||e.defaultPrevented||boardsOpen||boardScore!==null||(e.target instanceof HTMLElement&&e.target.closest('input,select,textarea')))return;e.preventDefault();if(view==='levels'&&menu!=='home'){setMenu('home');return;}if(view==='brief')setView('levels');else{cancelDrawing.current();exitRef.current();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[view,boardsOpen,boardScore,menu]);
 const levelTitle=(s:Scenario)=>heading||!usesHeading(s.id)?s.title:youthScenario(s).title;

 return <div className={`${arcade.game} ${styles.game} ${arcadeSkin.puzzle} ${comicRoot}`} ref={rootRef} data-game="puzzle" data-arcade-kind="pass-puzzle" data-cup={level&&tierOfPack(level.pack)?.look||undefined} data-view={view} data-shot-height={controlMode==='shoot'}>
  <canvas ref={canvas} tabIndex={0} aria-label="Pass Puzzles pitch. Draw from the ball to pass."/>
  {/* The shared arcade score bar (docs/ARCADE_CHROME_OCT27.md): the pass count toward the move; tries live on the brief / result cards. */}
  <ArcadeTopBar game="pass-puzzle" className={styles.topBar} backTitle="Back to arcade" onBack={()=>{cancelDrawing.current();onExit();}} value={view!=='levels'?progressHud.count:undefined} word={progressHud.label} live met={progressHud.met} pillHidden={view==='brief'||view==='result'} paused={paused} canPause={view==='play'} onPause={()=>setPause(!pausedRef.current)} pauseLabel="Pause puzzle" resumeLabel="Resume puzzle"/>
  {view==='play'&&!replaying&&!paused&&(!endHud||endHud.aid!=='none')&&<div className={styles.hintDock}><button className={arcade.pause} onClick={cycleHint} aria-pressed={spotHint} data-hint-level={spotHint?2:0} data-nudge={nudge||undefined} aria-label={spotHint?'Hide hint':'Show me where'} data-tip={spotHint?'Hide hint':'Hint'}><Icon name="book" size={22}/></button></div>}
  {paused&&view==='play'&&<ArcadePauseCard game="pass-puzzle" score={endHud?`${endHud.score} ${endHud.score===1?'star':'stars'} · level ${endHud.level}`:`${progressHud.count} ${progressHud.label} · try ${hud.attempt}/${hud.attempts}`} onResume={()=>setPause(false)} onExit={()=>{cancelDrawing.current();onExit();}} extra={{label:'Puzzles',onClick:()=>{setPause(false);toPuzzles();}}} onRestart={()=>{void restartPuzzle();}} restartDisabled={entry.pending}/>}
  {/* Endless Run HUD: level, lives, the thinking clock (CSS only: no frames) and Skip. The teaching note shows for a moment and never stops play. */}
  {endHud&&view==='play'&&<div className={styles.endHud} data-endless-hud data-level={endHud.level} data-lives={endHud.lives} data-score={endHud.score} data-aid={endHud.aid}>
   <span className={styles.endLevel}><small>Level</small><b>{endHud.level}</b></span>
   <span className={styles.endLives} role="img" aria-label={`${endHud.lives} of ${ENDLESS_LIVES} lives left`}>{Array.from({length:ENDLESS_LIVES},(_,i)=><i key={i} data-on={i<endHud.lives}/>)}</span>
   {endHud.clock!==null&&<span key={`clock${endHud.clockKey}`} className={styles.endClock} data-endless-clock data-paused={paused||undefined} style={{['--pp-clock' as string]:`${endHud.clock}s`}} role="timer" aria-label={`${endHud.clock} seconds to decide`}><i/></span>}
   <button type="button" className={styles.endSkip} data-endless-skip disabled={endHud.lives<=1||hud.phase!=='aiming'||!!endNote?.next} onClick={endlessSkip} aria-label="Skip this puzzle. It costs one life">Skip<small>−1</small></button>
  </div>}
  {endNote&&view==='play'&&<div key={`note${endNote.key}`} className={styles.endNote} data-endless-note={endNote.kind} role="status" aria-live="polite"><b>{endNote.title}{endNote.gained>0&&<em>+{endNote.gained} ★</em>}</b>{endNote.line&&<span>{endNote.line}</span>}{endNote.next&&<button type="button" data-endless-next onClick={endlessAdvance}>{endNote.kind==='win'||endNote.kind==='skip'?'Next':'Again'}</button>}</div>}
  {wipe>0&&<div key={`wipe${wipe}`} className={styles.wipe} aria-hidden="true"/>}
  {/* Clean pitch (owner, Oct 27 2026): no tip, hint, lesson or modifier text while playing; the start and result cards teach. */}
  {inPlay&&level?.require.clock?<span ref={clockChip} className={styles.clockChip} role="timer" aria-label="Counter clock" data-clock data-left={`${level.require.clock.toFixed(1)} s`}/>:null}
  {inPlay&&hud.phase==='aiming'&&rewindPoint.current&&!rewound.current&&<button type="button" className={styles.undo} data-undo onClick={rewindPass} aria-label="Undo the last pass (once per try)"><Icon name="reset" size={22}/><span>Undo</span></button>}
  {/* Nov 8 2026 simpler dock: one row (Scan + ball flight). Auto picks the power, so the power slider shows only in a manual mode. */}
  {inPlay&&hud.phase==='aiming'&&<div ref={trayRef} className={styles.passControls} data-pp-tray data-compact={controlMode==='auto'||undefined}>
   <div className={styles.aidRow}><button type="button" className={styles.scanToggle} hidden={!!endHud&&endHud.aid!=='scan'} aria-pressed={scanOn} onClick={toggleScan} data-scan={scanOn} aria-label={scanOn?'Hide the scan':'Scan: show which passes are open'}><Icon name="target" size={18}/>Scan</button>
   <div className={styles.passModes} role="group" aria-label="Ball flight">{(['auto','ground','lift','shoot'] as const).map(mode=><button key={mode} aria-pressed={controlMode===mode} onClick={()=>{cancelDrawing.current();controls.current.mode=mode;if(mode==='auto'){controls.current.power=undefined;setPower(null);}setControlMode(mode);}}>{mode==='auto'?'Auto':mode==='ground'?'Ground':mode==='lift'?'Lift':'Shoot'}</button>)}</div></div>
   {controlMode==='shoot'&&<label className={`${styles.powerControl} ${styles.shotHeight}`}><span>Height <b>{shotHeight===0?'Low':shotHeight===100?'Top bins':`${shotHeight}%`}</b></span><input aria-label="Shot height" aria-valuetext={shotHeight===0?'Low shot':shotHeight===100?'Top bins':`${shotHeight}% goal height`} type="range" min="0" max="100" step="5" value={shotHeight} onChange={e=>{const value=Number(e.target.value);controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" onClick={()=>{const value=shotHeight===100?0:100;controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}>{shotHeight===100?'Low':'Top bins'}</button></label>}
   {controlMode!=='auto'&&<label className={styles.powerControl}><span>Power <b>{power===null?'Auto':`${power}%`}</b></span><input ref={powerSlider} aria-label="Pass and shot power" aria-valuetext={power===null?'Automatic power from distance':`${power}% power`} type="range" min="10" max="100" step="5" defaultValue={power??60} onChange={e=>{const value=Number(e.target.value);controls.current.power=value/100;setPower(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" aria-label="Use automatic power" onClick={()=>{controls.current.power=undefined;setPower(null);if(stroke.current)stroke.current.dirty=true;wake.current();}}>Auto</button></label>}
  </div>}
  {replaying&&<><div className={styles.replayChip} role="status"><Icon name="play" size={14}/> {replayKind==='coach'?`Coach’s route · ${progress.replay==='1x'?'1':'0.6'}×`:`Replay · ${progress.replay==='1x'?'1':'0.38'}×`}{replayLine&&<span className={styles.replayCall} aria-live="polite" data-replay-call>{replayLine}</span>}<button className={styles.camToggle} aria-pressed={playerCam} onClick={togglePlayerView}>{playerCam?'Broadcast view':'Player view'}</button><button className={styles.camToggle} data-replay-speed={progress.replay??'slow'} aria-label={progress.replay==='1x'?'Replay speed: normal. Tap for slow motion':'Replay speed: slow motion. Tap for normal'} onClick={()=>{const next:'slow'|'1x'=progress.replay==='1x'?'slow':'1x';progressRef.current={...progressRef.current,replay:next};setProgress(p=>{const n={...p,replay:next};writeProgress(n);return n;});if(replayKind==='coach')watchCoach();else watchAgain();}}>{progress.replay==='1x'?'1×':'Slow'}</button></div><button className={`pixel-btn ${styles.skip}`} onClick={skipReplay}>Skip</button></>}
  {callout&&(view==='play'||view==='result')&&!replaying&&<div key={callout.key} className={styles.callout} data-tier={callout.tier} role="status" aria-live="polite" data-callout><b>{callout.text}</b></div>}
  <div ref={loftMeter} className={styles.loft} data-active="false" aria-hidden="true"><i/><span>LIFT</span></div>
  {/* Aim anywhere: the goal face beside the finger while a shot is pointed onto the net (filled in on input by showAim). */}
  <div ref={aimPanel} className={styles.aimPanel} data-aim-panel data-on="false" aria-hidden="true"><svg viewBox="-5 -4 10 6" preserveAspectRatio="xMidYMax meet"><path data-aim="net" className={styles.aimNet}/><path d="M-9 0H9" className={styles.aimGrass}/><path data-aim="frame" className={styles.aimFrame}/><g data-aim="keeper" className={styles.aimKeeper}><path d="M-.42 0v-1.05a.42.42 0 0 1 .84 0V0z"/><circle cx="0" cy="-1.62" r=".3"/><path d="M-.42-1.0-.95-1.5M.42-1.0.95-1.5"/></g><circle data-aim="ring" className={styles.aimRing} r=".3"/><g data-aim="spot" className={styles.aimSpot}><circle r=".16"/><path d="M-.42 0h.22M.2 0h.22M0-.42v.22M0 .2v.22"/></g></svg><b data-aim="word"/></div>
  {aimCue&&inPlay&&hud.phase==='aiming'&&<div className={styles.aimCue} data-aim-cue role="status"><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M8 36V8h48v28" className={styles.aimCueFrame}/><path d="M30 38C32 26 40 18 49 14" className={styles.aimCuePath}/><circle cx="50" cy="13.5" r="4.5" className={styles.aimCueSpot}/></svg><b>Draw onto the net</b></div>}

  {view==='levels'&&<div className={`${arcade.overlay} ${styles.menuOverlay}`}><section className={`${arcade.card} ${styles.levels}`} data-menu={menu}>
   {menu==='home'&&<>
    <div className={styles.menuTop}><div className={styles.menuTitle}><h3>Pass Puzzles</h3><p data-first-run={firstRun||undefined}>{firstRun?'Draw a pass to the open teammate.':`${totalStars} ★ collected`}</p></div>
     <button type="button" className={styles.chip} onClick={()=>setBoardsOpen(true)} aria-label={`Leaderboard, ${boardStars(progress.stars)} stars`} data-boards><Icon name="chart" size={20}/></button>
     <button type="button" className={styles.chip} onClick={()=>setMenu('settings')} aria-label="Settings: team size and heading" data-settings data-unset={progress.format===undefined||undefined}><Icon name="settings" size={20}/></button></div>
    {entry.message&&<p role="status" className={styles.menuNote}>{entry.message}</p>}
    {/* Nov 10 2026 (owner): the Endless Run is the main arcade entry; Play still continues the learning path below it. */}
    <button type="button" className={styles.endlessBig} data-endless disabled={entry.pending} onClick={()=>{void startEndless();}}><Icon name="play" size={28}/><span><b>Endless Run</b><small>3 lives · harder every puzzle{endBest>0?` · best ${endBest} ★`:''}</small></span></button>
    {continueLevel&&<button className={`${arcade.primary} ${styles.playBig}`} data-play disabled={entry.pending} onClick={quickPlay}><Icon name="play" size={26}/><span><b>Play</b><small>{packInfo(continueLevel.pack)?.title} · {continueNumber}. {levelTitle(continueLevel)}</small></span></button>}
    <button className={styles.daily} data-daily data-season={dailySeason} data-hard={dailyIsHard||undefined} onClick={openDaily}><Icon name="clock" size={18}/><b>Daily puzzle{dailyIsHard&&<i className={styles.hardTag}>Hard</i>}</b><em>{[0,1,2].map(n=>star(n<(progress.stars[dailyId]??0),n))}</em></button>
    {/* The pack map: each pack opens with stars earned anywhere (skill unlocks, never coins). */}
    <ol className={styles.packMap} role="group" aria-label="Puzzle packs">{corePacks.map((p,i)=>{const list=packs.find(([id])=>id===p.id)?.[1]??[],got=list.reduce((n,s)=>n+(progress.stars[s.id]??0),0),open=packGateOpen(p,totalStars);
     return <li key={p.id} data-open={open} data-done={got===list.length*3||undefined} data-current={continueLevel?.pack===p.id||undefined}><button data-pack={p.id} aria-label={`${p.title}, ${open?`${got} of ${list.length*3} stars`:`locked, needs ${p.gate} stars`}`} onClick={()=>openPack(p.id)}><b>{open?i+1:<Lock/>}</b><span>{p.title}</span><small>{open?`${got}/${list.length*3} ★`:`${p.gate} ★`}</small></button></li>;})}</ol>
    {expertPacks.length>0&&<button type="button" className={styles.expertTile} data-expert-tile data-open={expertOpen} onClick={()=>setMenu('expert')} aria-label={expertOpen?'Expert puzzles':`Expert puzzles, locked, needs ${EXPERT_GATE} stars`}><Icon name="star" size={20}/><b>Expert</b><small>{expertOpen?`${expertPacks.reduce((n,p)=>n+(packs.find(([id])=>id===p.id)?.[1]??[]).reduce((m,s)=>m+(progress.stars[s.id]??0),0),0)} ★`:<><Lock/> {EXPERT_GATE} ★</>}<i className={styles.cupHint}>+ 2 Cups</i></small></button>}
   </>}
   {menu==='expert'&&<div className={styles.pack} data-expert-sheet>
    <div className={styles.sheetHead}><button type="button" className={styles.chip} onClick={()=>setMenu('home')} aria-label="Back to all packs"><Icon name="back" size={20}/></button><h4>Expert</h4><small>{totalStars} ★</small></div>
    <p className={styles.blurb}>{expertOpen?'Hard moves for big thinkers. Hunters, traps and the clock.':`Collect ${EXPERT_GATE} ★ to open. You have ${totalStars}.`}</p>
    <ol className={styles.packMap} role="group" aria-label="Expert packs">{expertPacks.map((p,i)=>{const list=packs.find(([id])=>id===p.id)?.[1]??[],got=list.reduce((n,s)=>n+(progress.stars[s.id]??0),0),open=packGateOpen(p,totalStars);
     return <li key={p.id} data-open={open} data-done={got===list.length*3||undefined}><button data-pack={p.id} aria-label={`${p.title}, ${open?`${got} of ${list.length*3} stars`:`locked, needs ${p.gate} stars`}`} onClick={()=>openPack(p.id)}><b>{open?`E${i+1}`:<Lock/>}</b><span>{p.title}</span><small>{open?`${got}/${list.length*3} ★`:`${p.gate} ★`}</small></button></li>;})}</ol>
    {/* Nov 8 2026: the cups (own boards). One row each: title, rule, best cup points or the stars it needs. */}
    <h5 className={styles.cupHead}>Cups</h5><ol className={`${styles.packMap} ${styles.cupMap}`} role="group" aria-label="Cups">{PUZZLE_TIER_IDS.map(t=>{const c=PUZZLE_TIERS[t],open=totalStars>=c.gate,pts=tierBoardScore(progress.cup??{},t);
     return <li key={t} data-open={open} data-cup={c.look}><button data-pack={c.pack} data-cup-tile={t} aria-label={`${c.title}, ${open?`${pts} cup points. ${c.rule}`:`locked, needs ${c.gate} stars`}`} onClick={()=>openPack(c.pack)}><b>{open?(t==='pro'?'P':'L'):<Lock/>}</b><span>{c.title}<em>{c.rule}</em></span><small>{open?`${pts} pts`:`${c.gate} ★`}</small></button></li>;})}</ol>
   </div>}
   {menu==='pack'&&packs.filter(([pack])=>pack===packId).map(([pack,list])=>{const info=packInfo(pack),open=!info||packGateOpen(info,totalStars);return <div key={pack} className={styles.pack}>
    <div className={styles.sheetHead}><button type="button" className={styles.chip} onClick={()=>setMenu(info?.tier==='expert'||tierOfPack(pack)?'expert':'home')} aria-label="Back to all packs"><Icon name="back" size={20}/></button><h4>{info?.title??pack}</h4><small>{list.reduce((n,s)=>n+(progress.stars[s.id]??0),0)}/{list.length*3} ★</small></div>
    {info?.blurb&&<p className={styles.blurb}>{pack==='in-the-air'&&!heading?YOUTH_PACK_BLURB:info.blurb}</p>}{!open&&<p className={styles.gate} role="status">Earn {info!.gate-totalStars} more ★ to open this pack.</p>}<div className={styles.grid}>
    {list.map((s,i)=>{const lvl=open&&unlocked(s,list),got=progress.stars[s.id]??0,title=levelTitle(s),d=pips(s.id);return <button key={s.id} className={styles.level} disabled={!lvl} onClick={()=>openLevel(s)} data-level={s.id} aria-label={`${i+1}. ${title}${lvl?`, ${got} of 3 stars, difficulty ${d} of 3`:', locked'}`}><b>{i+1}</b><span>{title}</span><em>{[0,1,2].map(n=>star(n<got,n))}<i className={styles.pips} data-pips={d} aria-hidden="true">{'●'.repeat(d)}{'○'.repeat(3-d)}</i></em></button>;})}
   </div></div>;})}
   {menu==='settings'&&<div className={styles.settings} data-settings-sheet>
    <div className={styles.sheetHead}><button type="button" className={styles.chip} onClick={()=>setMenu('home')} aria-label="Close settings"><Icon name="back" size={20}/></button><h4>Settings</h4></div>
    {progress.format===undefined&&<p className={styles.ask} data-ask-once>How do you play? Pick once, we remember.</p>}
    <fieldset className={styles.seg} data-format-choice><legend>Team size</legend><div>{FORMATS.map(f=><button key={f} type="button" aria-pressed={format===f} onClick={()=>chooseFormat(f)}>{f}</button>)}</div><p>Changes the coach’s words, not the difficulty.</p></fieldset>
    <fieldset className={styles.seg} data-heading-choice><legend>Heading</legend><div>{[false,true].map(on=><button key={String(on)} type="button" aria-pressed={heading===on} onClick={()=>chooseHeading(on)}>{on?'Heading on':'No heading'}<small>{on?'11+':'10 & under'}</small></button>)}</div><p>US youth rule: no heading at 10 and under. Off = crosses are chested down.</p></fieldset>
    <button className={`${arcade.primary} ${styles.done}`} onClick={saveSettings}>Done</button>
   </div>}
  </section></div>}

  {view==='brief'&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay}`}><section className={arcade.card}>
   <span className={arcade.badge}>{format.toUpperCase()} BRIEF · {level.require.minPasses} PASS{level.require.minPasses===1?'':'ES'} IN THE ROUTE</span><h3>{level.title}</h3>{expertIdea&&<p className={styles.idea} data-idea><b>Big idea</b> {expertIdea}</p>}{modifiers(level).length>0&&<ul className={styles.modifiers} data-inline>{modifiers(level).map(m=><li key={m}>{m}</li>)}</ul>}<p>{briefText}</p>{tierOfPack(level.pack)&&<p className={styles.cupRule} data-cup-rule><b>{tierOfPack(level.pack)!.title}</b> First try, through balls and one-touch passes multiply your points.</p>}
   {showHint?<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>:<button className={`${arcade.exit} ${styles.briefHint}`} onClick={()=>setShowHint(true)}>Show a hint</button>}
   <ul className={styles.goals} aria-label="Star goals">{goals(level).map((g,i)=><li key={g} data-on={!!((progress.masks?.[level.id]??0)&1<<i)}>{g}</li>)}</ul>
   <p className={styles.coinNote}>Free · first solve +5 coins, +1 per new star</p>{entry.message&&<p role="status">{entry.message}</p>}<button className={`${arcade.primary} ${styles.go}`} disabled={entry.pending} onClick={play}>Start puzzle</button><button className={arcade.exit} onClick={()=>{setMenu('pack');setView('levels');}}>All puzzles</button>
   {(level.pack==='first-passes'||totalStars<6)&&<small>Drag to a teammate or open grass, then release. Curve your line to bend the pass. Hold the tip to lift it. Red rings warn of defenders.</small>}
  </section></div>}

  {view==='result'&&outcome&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay} ${outcome.success?styles.goalResult:styles.failResult}`}><section className={arcade.card}>
   <span className={arcade.badge}>{outcome.success?'PUZZLE SOLVED':outcome.attemptsLeft>0?`${outcome.attemptsLeft} ${outcome.attemptsLeft===1?'TRY':'TRIES'} LEFT`:'OUT OF TRIES'}</span>
   <h3>{outcome.success?(outcome.passes===0?'What a finish!':'That’s the move!'):<span className={styles.soClose}>So close!</span>}</h3>
   {outcome.success?<><div className={styles.stars} aria-label={`${outcome.stars} of 3 stars`}>{[0,1,2].map(n=>star(n<outcome.stars,n))}</div>
    {outcome.skill&&<div className={styles.skill} data-skill data-new-best={outcome.skill.newBest||undefined} aria-label={`${outcome.skill.points} cup points, times ${outcome.skill.mult}`}><b className={styles.mult}>×{outcome.skill.mult}</b><span className={styles.points}>{outcome.skill.points}<small> pts</small></span>{outcome.skill.newBest?<em className={styles.best}>New best!</em>:<em>Best {outcome.skill.best}</em>}
     <ul className={styles.skillParts}>{outcome.skill.parts.length?outcome.skill.parts.map(p=><li key={p.key}>{p.label} +{p.add}</li>):<li data-none>Solve it first try for ×1.5</li>}</ul><small className={styles.cupTotal}>{outcome.skill.cup}: {outcome.skill.total} pts</small></div>}
    {streakLabel(outcome.streak)&&<p className={styles.streak} data-streak={outcome.streak}><b>{streakLabel(outcome.streak)}</b> solved first try in a row</p>}
    {/* Nov 8 2026: a cup card shows the multiplier chips instead of the goal list (one less block on a phone). */}
    {!outcome.skill&&<ul className={styles.earned}>{goals(level).map((g,i)=>{const bit=1<<i;return <li key={g} data-on={!!(outcome.mask&bit)} data-new={!!(outcome.fresh&bit)||undefined}>{g}{outcome.fresh&bit?<b className={styles.newStar}> new</b>:null}</li>;})}</ul>}
    {outcome.why.length>0&&<div className={styles.why} data-why><b>Why it worked</b><ul>{outcome.why.slice(0,outcome.skill?1:2).map(w=><li key={w}>{w}</li>)}</ul>{outcome.concept&&<p className={styles.whyConcept} data-concept>You played: <strong>{outcome.concept.name}</strong>{outcome.concept.line?`. ${outcome.concept.line}`:''}</p>}</div>}
    {outcome.shotLine&&<p className={styles.shotLine} data-shot-line>{outcome.shotLine}</p>}
    <p className={styles.lesson}>{!outcome.move?'You spotted a clear shooting lane. Now try the passing move for the next star.':level.lesson}</p></>
   :<>{outcome.shotLine?<p data-why data-shot-line>{outcome.shotLine}</p>:<p data-why>{outcome.why[0]??reasonCopy[outcome.reason??'']??'Look again at who can reach the ball.'}</p>}{outcome.fix&&<p className={styles.fix}><b>Try this:</b> {outcome.fix}</p>}{outcome.practise&&<p className={styles.fix} data-practise><a className={styles.practise} href={outcome.practise.href} target="_blank" rel="noopener">Practise this: {outcome.practise.title}</a></p>}{outcome.reason==='intercept'&&!scanOn&&<p className={styles.fix} data-scan-tip><b>Look up:</b> tap Scan before you draw to see which passes are open.</p>}{/* the level's hint teaches the move, so it stays for move failures; a missed finish keeps just its specific fix */}{(!outcome.fix||outcome.reason==='intercept'||outcome.reason==='too-few-passes')&&<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>}</>}
   {outcome.success&&next&&'locked' in next&&<p className={styles.nextNote} role="status" data-next-locked>Next up: <b>{next.locked.title}</b>. Earn {next.need} more ★ to open it. Replay a puzzle for its missing stars.</p>}
   {outcome.success&&next&&'scenario' in next&&next.newPack&&<p className={styles.nextNote} data-next-pack>Pack complete! Next up: <b>{packInfo(next.scenario.pack)?.title}</b>.</p>}
   {outcome.success?(nextLevel?<button className={`${arcade.primary} ${styles.go}`} onClick={()=>openLevel(nextLevel)}>Next puzzle</button>:<button className={arcade.primary} onClick={()=>{if(next&&'locked' in next)openPack(next.locked.id);else setMenu('home');setView('levels');}}>All puzzles</button>)
    :<button className={`${arcade.primary} ${styles.go}`} disabled={entry.pending} onClick={retry}>{outcome.attemptsLeft>0?'Try again':'Start over'}</button>}
   {!outcome.success&&rewindPoint.current&&!rewound.current&&<button className={styles.rewind} onClick={rewindPass}>Rewind last pass</button>}
   <div className={`${styles.row} ${styles.quietRow}`}><button className={`pixel-btn ${styles.secondary}`} onClick={watchAgain}><Icon name="play" size={16}/> Watch again</button>{!outcome.success&&!spotHint&&outcome.attemptsLeft>0&&<button className={`pixel-btn ${styles.secondary}`} data-spot-hint onClick={()=>{setShowHint(true);setSpotHint(true);}}><Icon name="target" size={16}/> Show me where</button>}{(outcome.success||outcome.attemptsLeft===0)&&<button className={`pixel-btn ${styles.secondary}`} onClick={watchCoach}><Icon name="book" size={16}/> Coach’s route</button>}{outcome.success&&<button className={`pixel-btn ${styles.secondary}`} disabled={entry.pending} onClick={retry}><Icon name="reset" size={16}/> Replay level · free</button>}</div>
   {entry.message&&view==='result'&&<p role="status">{entry.message}</p>}<button className={arcade.exit} onClick={()=>{setMenu('home');setView('levels');}}>All puzzles</button>
  </section></div>}

  {error&&<div className={arcade.overlay}><section className={arcade.card}><span className={arcade.badge}>TAKE A BREATHER</span><h3>The pitch couldn’t load.</h3><p>Return to the arcade and try again.</p><button className={arcade.exit} onClick={onExit}>Back to arcade</button></section></div>}
  {/* Endless Run: full time (the run's own card; the authored result card below is untouched). */}
  {view==='result'&&endOver&&!outcome&&<div className={`${arcade.overlay} ${styles.lowOverlay}`}><section className={`${arcade.card} ${styles.endOver}`} data-endless-over data-new-best={endOver.newBest||undefined}>
   <span className={arcade.badge}>ENDLESS RUN · LEVEL {endOver.level}</span><h3>{endOver.newBest?'New best run!':'Full time!'}</h3>
   <div className={styles.endStats}><span><b>{endOver.score}</b><small>{endOver.score===1?'star':'stars'}</small></span><span><b>{endOver.solved}</b><small>solved</small></span><span><b>{endOver.streak}</b><small>first-try streak</small></span></div>
   {endOver.lesson&&<p className={styles.lesson}>{endOver.lesson}</p>}<small className={styles.endBestLine}>Best run: {endOver.best} ★</small>
   <button className={`${arcade.primary} ${styles.go}`} data-endless-again disabled={entry.pending} onClick={()=>{void startEndless();}}>Play again</button><button className={arcade.exit} onClick={()=>{stopEndless();setMenu('home');setView('levels');}}>All puzzles</button>
  </section></div>}
  {boardScore!==null&&boardReady&&view==='result'&&<HighScoreEntry game={boardGame} score={boardScore} detail={boardGame==='puzzle'?(endOver?'Your Endless Run, in stars. One board: your best run or your star total, whichever is higher.':'Your total stars across every puzzle.'):`Your ${PUZZLE_TIERS[boardGame==='puzpro'?'pro':'legend'].title} points: your best on each puzzle, added up.`} onClose={()=>setBoardScore(null)}/>}
  {boardsOpen&&<ArcadeBoards game="puzzle" onClose={()=>setBoardsOpen(false)}/>}
 </div>;
}
