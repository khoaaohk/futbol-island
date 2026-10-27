'use client';
import {readArcadeRecord,saveArcadeRecord} from '@/lib/arcade/arcadeRecords';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {createStrikerMatch,strikerInput,strikerStars,strikerWinner,strikerGoalStory,STRIKER_SHAPES,STRIKER_MOD_LESSONS,type StrikerShape,STRIKER_SECONDS,STRIKER_ROUNDS,STRIKER_FOCUS,STRIKER_FOCUS_GOAL,STRIKER_CHALLENGES,STRIKER_CONCEDE_LINES,STRIKER_ROUND_MODS,strikerHint,type StrikerHint,STRIKER_HEADLINES} from '@/lib/arcade/strikerMatch';
import {readStrikerStars,saveStrikerStars,starText,STRIKER_CUP,STRIKER_CUP_SECONDS,readStrikerCup,saveStrikerCup,readStrikerShape,saveStrikerShape} from '@/lib/arcade/strikerStars';
import {createStrikerAudio,type StrikerCue} from '@/lib/arcade/strikerAudio';
import {scanTakeaway,passLine} from '@/lib/arcade/strikerCoach';
import {createStrikerScene} from '@/lib/arcade/strikerScene';
import {strikerChargeCue,strikerImpact,STRIKER_MAX_HOLD} from '@/lib/arcade/strikerFeel';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {clampAnchor,stickTravel} from '@/lib/town/floatingStick';
import {shapeStick} from '@/lib/town/walkControl';
import {tapHaptic} from '@/lib/town/haptics';
import {requestLandscape} from '@/lib/orientationMode';
import {frameCapSlot} from '@/lib/town/frameCap';
import {isSoundEnabled} from '@/lib/games/sound';
import {ArcadeTopBar} from './arcade/ArcadeTopBar';
import {ArcadePauseCard,type ArcadeKey} from './arcade/ArcadePauseCard';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {creditRun,arcadeCoinTarget} from '@/lib/arcade/arcadeWallet';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {neutralLiveInput} from '@/lib/arcade/liveMatchInput';
import styles from './LiveArcadeMatch.module.css';
import dynamic from 'next/dynamic';
import {beginBoardSession} from '@/lib/arcade/boardClient';
import {strikerBoardPoints,STRIKER_POINTS} from '@/lib/arcade/leaderboard';
// Leaderboards (docs/arcade-leaderboards.md): lazy, loaded only after a match with points ends or when Leaderboard is tapped.
const HighScoreEntry=dynamic(()=>import('./arcade/HighScoreEntry'),{ssr:false});
const ArcadeBoards=dynamic(()=>import('./arcade/ArcadeBoards'),{ssr:false});

/** One line per round, kept on screen while playing: the habit this round teaches. */
const ROUND_TIPS=['','Tap Pass before receiving for a one-two.','Switch play: pass across to the far side.','Pass early. Blue presses and covers.','Rain! Short, firm passes. Pass early.','Small goals. Switch play, then pick a corner.'];
const ROUND_LESSONS=['Space is where defenders are not. A pass to a free teammate keeps the ball.','A one-two beats a press: give it, run past, get it back.','A compact block guards the middle. Moving the ball side to side stretches it.','Pressure plus cover is hard to beat. Pass before the presser arrives.','In the rain the ball skids. Firm, short, early passes keep it.','Top teams defend the middle. Switch play to find the gap, then place it.'];
const LAST_ROUND=STRIKER_ROUNDS.length;
/** Round options: hard rounds carry their modifier; a first-ever Round 1 eases Blue for the first 45 s (strikerMatch STRIKER_GENTLE). */
const roundOpts=(level:number)=>({mods:STRIKER_ROUND_MODS[level-1]??{},gentle:level===1&&(readStrikerStars()[0]??0)===0});
/** The Island Cup opens once Round 2 (its quarter-final level) has been won, i.e. Round 3 is unlocked. */
const CUP_UNLOCK_ROUND=3;
type Banner={key:number;title:string;sub:string;tone:'kickoff'|'goal'|'concede'};
/** First-timers see the three-step how-to strip on the start card; it hides once they have kicked off (owner, Oct 26 2026). */
const HOWTO_SEEN_KEY='fi-strikers-howto-seen';
/** Keyboard players see the keycaps strip over the pitch once, on their first kick-off (round 3); the pause card always shows it. */
const KEYS_SEEN_KEY='fi-strikers-keys-seen';
const KEY_LIST:readonly ArcadeKey[]=[['W A S D','move'],['Space','pass'],['K','hold, let go: shoot'],['Shift','sprint'],['Q','switch'],['L','through ball'],['Esc','pause']];
const KEYS=<ul className={styles.keys} aria-label="Keyboard controls">{KEY_LIST.map(([k,what])=><li key={k}><kbd>{k}</kbd>{what}</li>)}</ul>;
/** Shaped stick output, reused (no allocation per move). */
const shaped={x:0,z:0};

export default function LiveArcadeMatch({onExit}:{onExit:()=>void}){
 const host=useRef<HTMLDivElement>(null),local=useRef(neutralLiveInput()),keys=useRef(new Set<string>()),phaseRef=useRef<'ready'|'playing'|'paused'|'finished'>('ready');
 const [phase,setPhase]=useState<typeof phaseRef.current>('ready'),[view,setView]=useState({gold:0,blue:0,seconds:0,message:'Pass, move, receive.',charge:0,stamina:1,passes:0,shots:0,level:1,focus:0,focusPulse:0,own:false,spirit:0,duration:STRIKER_SECONDS,pens:'',won:-1,safe:0,risky:0,clean:0,chain:0,hint:'' as StrikerHint,tried:0,done:0}),[failed,setFailed]=useState(false);
 const [banner,setBanner]=useState<Banner|null>(null),bannerUntil=useRef(0),bannerKey=useRef(0),sfx=useRef<ReturnType<typeof createStrikerAudio>|null>(null);
 // Owner, Oct 27 2026: during play the only text is GOAL! after our goal (no sub line); every other banner is dropped.
 const showBanner=(title:string,sub:string,tone:Banner['tone'],ms=1700,keep=false)=>{if(!keep)return;bannerKey.current++;bannerUntil.current=performance.now()+ms;setBanner({key:bannerKey.current,title,sub:'',tone});};
 const [touchDevice,setTouchDevice]=useState(false),[portrait,setPortrait]=useState(false),joy=useRef<HTMLDivElement>(null),zone=useRef<HTMLDivElement>(null),joyId=useRef<number|null>(null),joyRect=useRef<DOMRect|null>(null),stickPaint=useRef({x:0,y:0,dirty:false}),stickT=useRef(36),glideTimer=useRef(0),pressed=useRef(new Map<number,HTMLElement>()),restart=useRef(()=>{});
 const [stars,setStars]=useState<number[]>([0,0,0,0,0,0]),[result,setResult]=useState<{win:boolean;habit:boolean;challenge:boolean;count:number;best:boolean}|null>(null),[assist,setAssist]=useState(false);
 const [mode,setMode]=useState<'rounds'|'cup'>('rounds'),[cupStage,setCupStage]=useState(0),[cup,setCup]=useState({trophies:0,best:0}),[shape,setShape]=useState<StrikerShape>('balanced'),[cupResult,setCupResult]=useState<''|'advance'|'won'|'out'>('');
 const modeRef=useRef<'rounds'|'cup'>('rounds'),cupRef=useRef(0),shapeRef=useRef<StrikerShape>('balanced'),setup=useRef(()=>{}),throughTimer=useRef<number|null>(null),throughCalled=useRef(false);
 const [unlocked,setUnlocked]=useState(1),cupOpen=unlocked>=CUP_UNLOCK_ROUND||cup.trophies>0||cup.best>0,chooseRound=useRef((level:number)=>{}),roundRef=useRef(1);
 const entry=useArcadeEntry('live');
 const [caption,setCaption]=useState<{key:number;text:string}|null>(null),cinemaKick=useRef(false),[moreOpen,setMoreOpen]=useState(false),[keysHint,setKeysHint]=useState(false),[optionsOpen,setOptionsOpen]=useState(false),[firstTime,setFirstTime]=useState(false);
 // Landscape exception (owner, Oct 26 2026, lib/orientationMode.ts): Strikers plays sideways on phones; leaving restores portrait-only.
 useEffect(()=>requestLandscape(),[]);
 useEffect(()=>{try{setFirstTime(!localStorage.getItem(HOWTO_SEEN_KEY));}catch{}},[]);
 const [boardScore,setBoardScore]=useState<{score:number;detail:string}|null>(null),[boardsOpen,setBoardsOpen]=useState(false);
 // Full-time outro (Oct 25 2026): the result card waits a moment so the players' win / lose / draw reactions can be seen. Tap skips.
 const [outroOn,setOutroOn]=useState(false),outroTimer=useRef<number|null>(null),endOutro=()=>{if(outroTimer.current)clearTimeout(outroTimer.current);outroTimer.current=null;setOutroOn(false);};
 const coinRun=useRef(''),coinTarget=useRef(0),coinActiveSeconds=useRef(0);
 const skipCinema=useRef(false),shootId=useRef<number|null>(null),sprintId=useRef<number|null>(null),skipReplay=useRef(false);
 const wake=useRef(()=>{}),charging=useRef(false),chargePower=useRef(0),audio=useRef<AudioContext|null>(null);
 const unlock=()=>{if(!isSoundEnabled())return;try{audio.current??=new AudioContext();void audio.current.resume();sfx.current??=createStrikerAudio();sfx.current.attach(audio.current);}catch{}};
 const startCharge=(id=-1)=>{if(shootId.current!==null)return;shootId.current=id;chargePower.current=0;charging.current=true;unlock();};
 const cancelCharge=()=>{shootId.current=null;charging.current=false;chargePower.current=0;};
 const fire=()=>{if(!charging.current)return;shootId.current=null;charging.current=false;local.current.power=chargePower.current;local.current.shoot=true;};
 const release=()=>{cancelCharge();sprintId.current=null;keys.current.clear();local.current=neutralLiveInput();releaseStick();for(const b of pressed.current.values())delete b.dataset.pressed;pressed.current.clear();};
 const changePhase=async(next:typeof phase)=>{if(next==='playing'&&(phaseRef.current==='ready'||phaseRef.current==='finished')){const id=await entry.enter();if(!id)return;if(phaseRef.current==='finished')restart.current();setBoardScore(null);beginBoardSession('live');coinRun.current=id;coinTarget.current=0;coinActiveSeconds.current=0;}const fresh=next==='playing'&&(phaseRef.current==='ready'||phaseRef.current==='finished');release();phaseRef.current=next;setPhase(next);if(next==='playing'){unlock();recordExploreActivity('arcade');if(fresh){try{localStorage.setItem(HOWTO_SEEN_KEY,'1');}catch{}setFirstTime(false);setOptionsOpen(false);setMoreOpen(false);if(!window.matchMedia('(pointer:coarse)').matches){let seen=false;try{seen=!!localStorage.getItem(KEYS_SEEN_KEY);localStorage.setItem(KEYS_SEEN_KEY,'1');}catch{}if(!seen){setKeysHint(true);window.setTimeout(()=>setKeysHint(false),8000);}}}host.current?.focus({preventScroll:true});sfx.current?.startCrowd();if(fresh){cinemaKick.current=true;sfx.current?.cue('kickoff');if(modeRef.current==='cup')showBanner(STRIKER_CUP[cupRef.current].name,STRIKER_MOD_LESSONS[STRIKER_CUP[cupRef.current].mod].split(':')[0],'kickoff');else showBanner(`Round ${roundRef.current}`,STRIKER_ROUNDS[roundRef.current-1],'kickoff');}}else sfx.current?.stopCrowd();wake.current();};
 // Pause card Restart: replay this round / cup tie from kick-off. It goes through the same paid entry as Play again; if the
 // entry is refused the match stays paused where it was.
 const restartMatch=async()=>{phaseRef.current='finished';await changePhase('playing');if(phaseRef.current==='finished')phaseRef.current='paused';};
 useEffect(()=>{setTouchDevice(window.matchMedia('(pointer:coarse)').matches);},[]);
 useEffect(()=>{
  const node=host.current;if(!node)return;const canvas=document.createElement('canvas');node.appendChild(canvas);const match=createStrikerMatch();const saved=readArcadeRecord('live');setUnlocked(Math.min(LAST_ROUND,saved.unlocked));setStars(readStrikerStars());setCup(readStrikerCup());shapeRef.current=readStrikerShape();setShape(shapeRef.current);match.state.level=Math.min(LAST_ROUND,saved.unlocked);match.configure(roundOpts(match.state.level));match.reset();// One place sets the next match: rounds use the chosen round; the cup uses the tie's level and modifier (90 s, knockout).
  setup.current=()=>{const s=match.state;s.shape=shapeRef.current;if(modeRef.current==='cup'){const tie=STRIKER_CUP[cupRef.current];s.level=tie.level;match.configure({duration:STRIKER_CUP_SECONDS,mods:tie.mods});}else{s.level=roundRef.current;match.configure(roundOpts(s.level));}match.reset();visual.stage.resetPlayers();setView(v=>({...v,level:s.level,duration:s.duration,gold:0,blue:0,seconds:0,pens:'',won:-1}));};
  chooseRound.current=(level)=>{match.state.level=level;roundRef.current=level;match.configure(roundOpts(level));match.reset();setAssist(match.state.assist&&match.state.assistLevel===level);setView(v=>({...v,level}));};roundRef.current=match.state.level;setView(v=>({...v,level:match.state.level}));let visual:ReturnType<typeof createStrikerScene>;
  try{visual=createStrikerScene(canvas,match);}catch{canvas.remove();setFailed(true);return;}
  let frame=0,last=0,slot=0,lastHud=0,disposed=false,lastEvent=0,chargeTone=0,lastFocus=0,lastNearMiss=0,lastPerfect=0,lastSpirit=0,lastSpecial=0,wasCelebrating=false,replayGoal=false,replayEnd=0,lastChain=0,hint:StrikerHint='',hintUntil=0,lastShotAt=-9,hudKey='';const input=strikerInput(),interval=1000/(visual.stage.mobile?30:60);
  // Sound comes from the Strikers synth; the shared cue keeps only its haptics (null context = no tone).
  const cue=(event:StrikerCue,power=.5)=>{sfx.current?.cue(event,power);if(event==='shot'||event==='goal'||event==='hit')arcadeFeedback(null,event);};
  const fit=()=>{visual.fit();setPortrait(visual.portrait);wake.current();};setPortrait(visual.portrait);const resize=new ResizeObserver(fit);resize.observe(node);
  restart.current=()=>{visual.stopReplay();endOutro();if(modeRef.current==='cup'){setResult(null);lastPerfect=0;lastFocus=0;lastNearMiss=match.state.nearMiss;setup.current();return;}match.configure({});match.reset(true);match.configure(roundOpts(match.state.level));match.reset();lastPerfect=0;setResult(null);setAssist(match.state.assist&&match.state.assistLevel===match.state.level);roundRef.current=match.state.level;lastFocus=0;lastNearMiss=match.state.nearMiss;visual.stage.resetPlayers();setView({gold:0,blue:0,seconds:0,message:'Pass, move, receive.',charge:0,stamina:1,passes:0,shots:0,level:match.state.level,focus:0,focusPulse:0,own:false,spirit:0,duration:match.state.duration,pens:'',won:-1,safe:0,risky:0,clean:0,chain:0,hint:'',tried:0,done:0});lastChain=0;hint='';visual.update(0);};
  const blur=()=>{release();sfx.current?.stopCrowd();if(phaseRef.current==='playing'){phaseRef.current='paused';setPhase('paused');}if(frame)cancelAnimationFrame(frame);frame=0;last=0;slot=0;};
  const hidden=()=>{if(document.hidden)blur();else wake.current();};
  const down=(event:KeyboardEvent)=>{if(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,a,button'))return;if(event.code==='Escape'){event.preventDefault();blur();return;}if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','KeyJ','KeyK','KeyL','KeyQ','KeyE','KeyR','ShiftLeft','ShiftRight','MetaLeft','MetaRight'].includes(event.code))return;event.preventDefault();if(phaseRef.current!=='playing')return;keys.current.add(event.code);unlock();if(!event.repeat){if(event.code==='Space'||event.code==='KeyJ')local.current.pass=true;if(event.code==='KeyK'||event.code==='MetaLeft'||event.code==='MetaRight')startCharge();if(event.code==='KeyL')local.current.through=true;if(event.code==='KeyQ'){local.current.switchPlayer=true;sfx.current?.cue('switch');}if(event.code==='KeyE')local.current.skill=true;if(event.code==='KeyR')local.current.call=true;}};
  const up=(event:KeyboardEvent)=>{keys.current.delete(event.code);const meta=event.code==='MetaLeft'||event.code==='MetaRight';if(meta)for(const code of [...keys.current])if(!code.startsWith('Shift'))keys.current.delete(code);if((event.code==='KeyK'||meta)&&shootId.current===-1)fire();};
  // ⌘ shoots (user, Oct 3 2026). The browser owns ⌘W/⌘Q/⌘R and a page cannot block them, so while a match is playing a
  // close or reload asks first instead of silently ending the match.
  const leave=(event:BeforeUnloadEvent)=>{if(phaseRef.current==='playing'){event.preventDefault();event.returnValue='';}};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('beforeunload',leave);window.addEventListener('blur',blur);window.addEventListener('orientationchange',release);document.addEventListener('visibilitychange',hidden);
  // Cinematic beats that follow the play (round 3, lib/arcade/strikerCinema.ts): clean through on goal (once per run, with a short
  // slow-mo), a charged shot in the attacking half (low angle; the sim's own charge slow-mo), the camera chasing a struck ball.
  // Never while the kid must defend or control a pass: both need the kid's player on the ball.
  let throughArmed=true;
  const beats=(s:typeof match.state)=>{const cin=visual.cinema;if(cin.beat==='strike')cin.follow(s.ball.x,s.ball.z);
   const me=s.players[s.selected],mine=s.ball.owner===s.selected&&!s.setPiece.kind&&s.goalPause<=0&&!s.shootout.active;if(!mine){throughArmed=true;return;}
   if(charging.current&&me.x>2){cin.trigger('charge',me.x,me.z,25,s.aim*4.5);return;}
   if(throughArmed&&me.x>9){let open=true;for(const p of s.players)if(p.team===1&&!p.keeper&&p.x>me.x-1&&Math.abs(p.z-me.z)<4.5){open=false;break;}
    if(open){throughArmed=false;if(cin.trigger('through',me.x,me.z,25,0))showBanner('Through on goal!','Hold Shoot · let go in the cyan band','kickoff',1100);}}};
  const animate=(now:number)=>{frame=0;if(disposed||document.hidden)return;const nextSlot=frameCapSlot(now,slot,interval);if(nextSlot<0){frame=requestAnimationFrame(animate);return;}slot=nextSlot;const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;const active=phaseRef.current==='playing',k=keys.current,l=local.current;
   // Instant replay after a Gold goal: the sim (and clock) wait; any action key or button skips it.
   if(active&&visual.replaying){const skip=l.pass||l.shoot||l.through||l.switchPlayer||l.skill||l.call||charging.current||skipReplay.current;skipReplay.current=false;l.shoot=l.pass=l.through=l.switchPlayer=l.skill=l.call=false;if(charging.current)cancelCharge();
    if(skip||visual.replayDone||now>replayEnd){visual.stopReplay();visual.cinema.skip();bannerUntil.current=performance.now();cue('kickoff');}visual.update(dt);visual.stage.render();frame=requestAnimationFrame(animate);return;}
   skipReplay.current=false;if(skipCinema.current){skipCinema.current=false;if(!charging.current)visual.cinema.skip();}
   // Impact hit-stop (strikerFeel): the sim holds for a few frames on a big contact; inputs stay buffered for the next step.
   if(active&&visual.holding){visual.update(dt);visual.stage.render();frame=requestAnimationFrame(animate);return;}
   if(active){const keyboardX=Number(k.has('ArrowRight')||k.has('KeyD'))-Number(k.has('ArrowLeft')||k.has('KeyA')),keyboardZ=Number(k.has('ArrowDown')||k.has('KeyS'))-Number(k.has('ArrowUp')||k.has('KeyW'));
    const axes=visual.screenAxes(keyboardX||l.mx,keyboardZ||-l.my);input.x=axes.x;input.z=axes.z;
    input.pass=l.pass;input.shoot=l.shoot;input.through=l.through;input.switchPlayer=l.switchPlayer;input.skill=!!l.skill;input.call=!!l.call;input.sprint=l.sprint||k.has('ShiftLeft')||k.has('ShiftRight');input.charge=charging.current;input.power=l.power;
    if(Math.hypot(input.x,input.z)>.1||input.pass||input.shoot||input.through||input.charge)coinActiveSeconds.current+=dt;
    const shotPower=input.power;match.state.cinemaScale=visual.cinema.timeScale;match.step(dt,input);const s=match.state,chargeCue=strikerChargeCue(chargeTone,s.charge);if(chargeCue==='band'){sfx.current?.cue('band');arcadeFeedback(null,'skill');}else if(chargeCue){sfx.current?.cue('charge',chargeCue==='over'?1:.3);if(chargeCue==='over')arcadeFeedback(null,'charge3');}chargeTone=s.charge;chargePower.current=s.charge;l.shoot=l.pass=l.through=l.switchPlayer=l.skill=l.call=false;
    // Pass chain: each completed Gold pass in the move rings a step higher (and buzzes lightly from the third).
    {const chain=s.ball.lastTeam===0?s.passChain:0;if(chain>lastChain&&chain>=2){sfx.current?.cue('chain',chain);if(chain>=3)arcadeFeedback(null,'combo');if(chain>=4&&chain%2===0)sfx.current?.cue('ole');}lastChain=chain;}
    beats(s);
    {const h=strikerHint(s);if(h){hint=h;hintUntil=now+650;}else if(now>hintUntil||s.goalPause>0||s.setPiece.kind)hint='';}
    if(s.event!==lastEvent){lastEvent=s.event;const kind=s.eventKind;
     // Commentator captions (round 3): a short pop for saves, posts, Gold tackles, interceptions and steals.
     {const line=kind==='save'?'What a save!':kind==='post'?'Off the post!':kind==='steal'?'Perfect tackle!':kind==='intercept'&&s.ball.owner>=0&&s.players[s.ball.owner].team===0?'Read it! Intercepted.':'';if(line)setCaption({key:s.event,text:line});}
     {const im=strikerImpact(kind,{clean:s.cleanStrike,special:s.teamStrike,hardShot:s.time-lastShotAt<1.2});if(kind==='shot')lastShotAt=s.time;if(im.hold>0)visual.impact(Math.min(STRIKER_MAX_HOLD,im.hold),im.kick);}
     if(kind==='goal'){{const sc=s.scorer>=0?s.players[s.scorer]:null,side=Math.sign(s.eventX)||1;visual.cinema.trigger('goal',sc?sc.x:s.eventX,sc?sc.z:s.eventZ,side*25,0);}const ours=s.ball.lastTeam===0,call=ours&&s.headline?STRIKER_HEADLINES[s.headline]:null;replayGoal=ours&&!s.shootout.active&&!visual.stage.reduced;cue(ours?'goal':'concede');if(call)sfx.current?.cue('cheer');
      // Goal call-outs (Oct 25 2026): brace, hat-trick, equaliser, go-ahead and golden goals name the football word; the replay keeps the build-up story.
      showBanner(call?call.title:ours?'GOAL!':'Blue scores',s.shootout.active?`Pens ${s.shootout.goals[0]}–${s.shootout.goals[1]}`:call?call.sub:ours?strikerGoalStory(s.goalStory,s.level):STRIKER_CONCEDE_LINES[s.concedeCause],ours?'goal':'concede',ours?1600:2600,ours);}
     else if(kind==='shot'){cue('shot',s.ball.lastTeam===0?shotPower:.5);if(s.ball.lastTeam===0&&!s.shootout.active){visual.cinema.release();visual.cinema.trigger('strike',s.ball.x,s.ball.z,25,s.ball.z);}if(s.cleanStrike)cue('perfect');}
     else if(['hit','save','post','pass','touch','tackle','board','intercept','skill','beat'].includes(kind)){cue(kind as StrikerCue);
      if(kind==='save'){const keeper=s.players.find(p=>p.keeper&&Math.sign(p.x)===Math.sign(s.eventX||s.ball.x));if(keeper)visual.cinema.trigger('save',keeper.x,keeper.z,keeper.x,keeper.z);}
      else if(kind==='intercept'&&s.ball.owner>=0&&s.players[s.ball.owner].team===0)visual.cinema.trigger('tackle',s.eventX,s.eventZ);/* a won ball only: a slide starting is not a win yet */}
     else if(kind==='steal'){cue('perfect');cue('beat');visual.cinema.trigger('tackle',s.eventX,s.eventZ);}
     // Set pieces: whistle plus a banner that names the kick and how to take it.
     else if(kind==='freekick'||kind==='penalty'||kind==='corner'){const ours=s.setPiece.team===0;cue(kind==='corner'?'kickoff':'foul');if(ours)visual.cinema.trigger('setpiece',s.ball.x,s.ball.z,25,0);
      showBanner(kind==='penalty'?'PENALTY!':kind==='corner'?'CORNER':'FREE KICK',ours?(kind==='penalty'?'Pick a corner. Low and hard.':kind==='corner'?'Q picks the post · Pass crosses · tap Shoot to head':'Curl it: hold ↑/↓ after you strike'):(kind==='penalty'?'Hold ↑ or ↓ to dive as they kick':'Hold your shape'),ours?'kickoff':'concede',2000);}
     else if(kind==='wind'){cue('call');showBanner('Gust of wind!','Short, firm passes','kickoff',1600);}
     else if(kind==='zone'){cue('spirit');showBanner('Power zone!','Run into the pink circle','kickoff',1600);}
     else if(kind==='zonegot'){cue(s.players.some(p=>p.team===0&&Math.hypot(p.x-s.eventX,p.z-s.eventZ)<2.2)?'perfect':'tackle');}
     else if(kind==='behind')cue('tackle');
     else if(kind==='call')cue('call');
     else if(kind==='bluecharge'){cue('special');showBanner('Close them down!','Blue is charging a Team Strike','concede',1500);}
     else if(kind==='golden'){cue('foul');showBanner('GOLDEN GOAL','Next goal wins','kickoff',2000);}
     else if(kind==='shootout'){cue('fulltime');showBanner('PENALTIES','Three each · Gold kicks first','kickoff',2200);}
     else if(kind==='miss'&&s.shootout.active)cue('save');}
    if(s.spiritEvent!==lastSpirit){lastSpirit=s.spiritEvent;if(s.spiritTeam===0){cue('spirit');showBanner('Team spirit full!','Charge a full shot for a Team Strike','goal',1700);}}
    if(s.special!==lastSpecial){lastSpecial=s.special;cue('special');if(s.specialTeam===0)showBanner('TEAM STRIKE!','Built from your passes','goal',1300);}
    if(s.nearMiss!==lastNearMiss){lastNearMiss=s.nearMiss;if(s.eventKind!=='post')cue('miss');}
    if(s.focus!==lastFocus){lastFocus=s.focus;cue('focus');}
    if(s.perfect!==lastPerfect){lastPerfect=s.perfect;cue('perfect');}
    // Whistle the restart after a goal celebration.
    if(wasCelebrating&&s.goalPause<=0&&!s.finished){const length=replayGoal?visual.startReplay():0;replayGoal=false;
     if(length>0){replayEnd=now+length/.7*1000+400;const story=strikerGoalStory(s.goalStory,s.level);showBanner('REPLAY',story+' · tap to skip','goal',length/.7*1000+300);}else cue('kickoff');}
    wasCelebrating=s.goalPause>0;
    sfx.current?.setCrowd(s.crowd);
   }
   visual.setFollow(active&&!match.state.finished);const outro=!active&&visual.outroing;visual.cinema.update(active||outro?dt:0);if(cinemaKick.current&&active){cinemaKick.current=false;visual.cinema.trigger('kickoff',0,0);}visual.update(active||outro?dt:0);visual.stage.render();if(stickPaint.current.dirty){stickPaint.current.dirty=false;paintJoystick(joy.current,stickPaint.current.x,stickPaint.current.y,stickT.current);}canvas.dataset.frames=String(Number(canvas.dataset.frames??0)+1);
   const s=match.state;if(active&&coinRun.current){const coins=arcadeCoinTarget('live',{goals:s.score[0],passes:s.passes[0],finished:s.finished,won:strikerWinner(s)===0,engaged:coinActiveSeconds.current>=Math.min(15,s.time*.15)});if(coins>coinTarget.current){coinTarget.current=coins;void creditRun(coinRun.current,'live',coins,'Team passing, goals and full time');}}if(s.finished&&active){const winner=strikerWinner(s);visual.cinema.skip();visual.cinema.trigger('fulltime',0,0);{const outroLength=visual.startOutro(winner);if(outroLength>0){if(outroTimer.current)clearTimeout(outroTimer.current);setOutroOn(true);outroTimer.current=window.setTimeout(()=>{outroTimer.current=null;setOutroOn(false);},outroLength*1000+150);}}
    if(modeRef.current==='cup'){const stage=cupRef.current,won=winner===0;setResult(null);if(won){setCup(saveStrikerCup(stage+1));if(stage>=2){cupRef.current=0;setCupStage(0);setCupResult('won');sfx.current?.cue('star');}else{cupRef.current=stage+1;setCupStage(stage+1);setCupResult('advance');}}else{cupRef.current=0;setCupStage(0);setCupResult('out');}}
    else{setCupResult('');const saved=saveArcadeRecord('live',s.score[0],Math.min(LAST_ROUND,s.level+(s.score[0]>s.score[1]?1:0)));setUnlocked(saved.unlocked);const earned=strikerStars(s),previous=readStrikerStars()[Math.max(1,Math.min(LAST_ROUND,s.level))-1]??0;setResult({...earned,best:earned.count>previous});setStars(saveStrikerStars(s.level,earned.count));if(earned.count)sfx.current?.cue('star');}phaseRef.current='finished';setPhase('finished');release();sfx.current?.stopCrowd();cue('fulltime');sfx.current?.cue(winner===0?'win':winner===1?'lose':'draw');{const points=strikerBoardPoints({goals:s.score[0],passes:s.passes[0],won:winner===0});if(points>0)setBoardScore({score:points,detail:`Match points: ${s.score[0]} goal${s.score[0]===1?'':'s'} × ${STRIKER_POINTS.goal} + ${s.passes[0]} pass${s.passes[0]===1?'':'es'} × ${STRIKER_POINTS.pass}${winner===0?` + ${STRIKER_POINTS.win} for the win`:''}. Passing scores too!`});}}
   if(now-lastHud>100||s.finished){const stamina=s.players[s.selected].stamina,key=`${s.score[0]}|${s.score[1]}|${Math.floor(s.time)}|${s.message}|${Math.round(s.charge*20)}|${Math.round(stamina*20)}|${s.passes[0]}|${s.shots[0]}|${s.level}|${s.focus}|${s.focusEvent}|${s.ball.owner===s.selected}|${Math.round(s.spirit[0]*20)}|${s.duration}|${s.shootout.goals[0]}|${s.shootout.goals[1]}|${s.shootout.active}|${s.shootout.winner}|${s.finished}|${s.safePasses}|${s.riskyPasses}|${s.cleanStrikes}|${lastChain}|${active?hint:''}|${s.userPasses}|${s.userPassesDone}`;
    // Heat (Oct 10 2026): the HUD re-renders only when something it shows changes (meters quantised to 5%), not 10x a second.
    if(key!==hudKey){hudKey=key;setView({gold:s.score[0],blue:s.score[1],seconds:s.time,message:s.message,charge:s.charge,stamina:s.players[s.selected].stamina,passes:s.passes[0],shots:s.shots[0],level:s.level,focus:s.focus,focusPulse:s.focusEvent,own:s.ball.owner===s.selected,spirit:s.spirit[0],duration:s.duration,pens:s.shootout.active||s.shootout.winner>=0?`Pens ${s.shootout.goals[0]}–${s.shootout.goals[1]}`:'',won:s.finished?strikerWinner(s):-1,safe:s.safePasses,risky:s.riskyPasses,clean:s.cleanStrikes,chain:lastChain,hint:active?hint:'',tried:s.userPasses,done:s.userPassesDone});}lastHud=now;if(bannerUntil.current&&now>bannerUntil.current){bannerUntil.current=0;setBanner(null);}}
   // The full-time outro keeps a few more frames after the whistle, then the loop sleeps as before.
   if(phaseRef.current==='playing'||visual.outroing)frame=requestAnimationFrame(animate);else{last=0;slot=0;}
  };wake.current=()=>{if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(animate);};wake.current();
  (window as unknown as {__fi2Live?:unknown}).__fi2Live={match,sim:match.state,scene:visual.stage.scene,camera:visual.stage.camera,renderer:visual.stage.renderer,local,phaseRef,charging,visual,getElapsed:()=>match.state.time};
  return()=>{disposed=true;if(outroTimer.current)clearTimeout(outroTimer.current);cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('beforeunload',leave);window.removeEventListener('blur',blur);window.removeEventListener('orientationchange',release);document.removeEventListener('visibilitychange',hidden);release();wake.current=()=>{};visual.stage.dispose();canvas.remove();sfx.current?.dispose();sfx.current=null;void audio.current?.close();audio.current=null;delete (window as unknown as {__fi2Live?:unknown}).__fi2Live;};
 // Refs preserve controller and match state without recreating the renderer.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // Floating stick (owner, Oct 26 2026: same behaviour as the island's, lib/town/floatingStick.ts + walkControl.ts). A press anywhere in
 // the left stick zone (~45% of the pitch) anchors the ring at the thumb; release glides it home to its faint bottom-left rest spot.
 // Heat pass 4 (audit F13) holds: the rect is read once per gesture and the knob paints on the next game frame, not per move event.
 const floatHome=()=>{const el=joy.current;if(!el?.dataset.anchored)return;delete el.dataset.anchored;delete el.dataset.active;clearTimeout(glideTimer.current);const calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;el.style.transition=calm?'none':'translate .32s cubic-bezier(.22,.8,.24,1),opacity .2s ease-out';if(!calm)el.dataset.gliding='true';el.style.translate='';glideTimer.current=window.setTimeout(()=>{el.style.transition='';delete el.dataset.gliding;},340);};
 const moveStick=(event:{pointerId:number;clientX:number;clientY:number})=>{if(event.pointerId!==joyId.current)return;const r=joyRect.current;if(!r)return;const T=stickT.current,dx=event.clientX-r.x-r.width/2,dy=event.clientY-r.y-r.height/2,k=Math.min(1,T/Math.max(1,Math.hypot(dx,dy))),px=dx*k,py=dy*k;shapeStick(px/T,py/T,shaped);local.current.mx=shaped.x;local.current.my=-shaped.z;const p=stickPaint.current;p.x=px;p.y=py;p.dirty=true;};
 const releaseStick=(event?:{pointerId:number})=>{if(event&&event.pointerId!==joyId.current)return;joyId.current=null;joyRect.current=null;stickPaint.current.dirty=false;local.current.mx=local.current.my=0;floatHome();paintJoystick(joy.current,0,0,stickT.current);};
 const stickDown=(event:PointerEvent<HTMLDivElement>)=>{if(phaseRef.current==='playing')skipReplay.current=true;host.current?.focus({preventScroll:true});
  const el=joy.current,z=event.currentTarget;if(phaseRef.current!=='playing'||joyId.current!==null||!el||event.pointerType==='mouse'&&event.button!==0)return;event.preventDefault();
  clearTimeout(glideTimer.current);el.style.transition='none';delete el.dataset.gliding;el.style.translate='';// a glide home may still be running: snap first so the rect below is the true rest spot
  const home=el.getBoundingClientRect(),r=home.width/2,zr=z.getBoundingClientRect(),cs=getComputedStyle(z),pad=(v:string)=>parseFloat(v)||0;
  const a=clampAnchor(event.clientX,event.clientY,{left:zr.left+pad(cs.paddingLeft),top:zr.top+pad(cs.paddingTop),right:zr.right-pad(cs.paddingRight),bottom:zr.bottom-pad(cs.paddingBottom)},r);
  el.style.translate=`${a.x-home.left-r}px ${a.y-home.top-r}px`;el.dataset.anchored='true';el.dataset.active='true';
  joyRect.current=new DOMRect(a.x-r,a.y-r,r*2,r*2);stickT.current=stickTravel(r*2);joyId.current=event.pointerId;try{z.setPointerCapture(event.pointerId);}catch{}moveStick(event);};
 // Pressed feedback + a light haptic for the action buttons (one pointer each, so a thumb on the stick never clears another's press).
 const actionDown=(event:PointerEvent<HTMLDivElement>)=>{const b=(event.target as Element).closest?.('button[data-action]') as HTMLButtonElement|null;if(!b||b.disabled)return;b.dataset.pressed='true';pressed.current.set(event.pointerId,b);tapHaptic();};
 const actionUp=(event:PointerEvent<HTMLDivElement>)=>{const b=pressed.current.get(event.pointerId);if(!b)return;delete b.dataset.pressed;pressed.current.delete(event.pointerId);};
 const pickMode=(next:'rounds'|'cup')=>{modeRef.current=next;setMode(next);setCupResult('');if(next==='rounds')cupRef.current=0;setCupStage(cupRef.current);setup.current();};
 const pickShape=(next:StrikerShape)=>{shapeRef.current=next;setShape(next);saveStrikerShape(next);setup.current();};
 const won=view.won>=0?view.won===0:view.gold>view.blue,draw=view.won<0&&view.gold===view.blue,tie=STRIKER_CUP[cupStage];
 const remaining=Math.max(0,view.duration-Math.floor(view.seconds)),clock=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
 // Escape on the start / full-time card leaves to the arcade (Oct 9 2026 QA, same as ArcadeGame3D); while playing it still pauses
 // and on the pause card it does nothing new. Not while a select (team shape) or field has focus.
 const exitRef=useRef(onExit);exitRef.current=onExit;
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.code!=='Escape'||(!failed&&phaseRef.current!=='ready'&&phaseRef.current!=='finished'))return;
   if(e.target instanceof HTMLElement&&e.target.closest('input,select,textarea'))return;e.preventDefault();release();exitRef.current();};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[failed]);
 return <><div className={styles.backdrop} aria-hidden="true"/><section className={styles.root} data-fullscreen-game data-phase={phase} aria-label="Island Strikers arcade match">
  <ArcadeTopBar game="live" overlay={false} onBack={()=>{release();onExit();}} versus={{gold:view.gold,blue:view.blue,clock:view.pens||clock}} paused={phase==='paused'} canPause={!(phase==='ready'||phase==='finished'||failed)} onPause={()=>changePhase(phase==='playing'?'paused':'playing')} pauseLabel="Pause" resumeLabel="Resume"/>
  <div className={styles.body}><div className={styles.stage} ref={host} tabIndex={-1} onPointerDown={()=>{host.current?.focus({preventScroll:true});if(phaseRef.current==='playing'){skipReplay.current=true;skipCinema.current=true;}else if(outroTimer.current)endOutro();}}/>
         {!touchDevice&&phase==='playing'&&<div className={styles.keysDock} aria-hidden="true">{KEYS}</div>}
         {banner&&phase==='playing'&&<div key={banner.key} className={styles.banner} data-tone={banner.tone} role="status" aria-live="polite"><strong>{banner.title}</strong><span>{banner.sub}</span></div>}
   {phase==='ready'&&!failed&&<div className={styles.overlay}><div className={`${styles.card} ${styles.start}`} data-start="" data-options={optionsOpen||undefined}>
    {/* Start card (owner, Oct 26 2026): one tap to play. Round + best stars, three goal chips, Kick off; the rest waits under Options. */}
    <small>{mode==='cup'?`ISLAND CUP · ${tie.name.toUpperCase()}`:`ROUND ${view.level} OF ${STRIKER_ROUNDS.length}${view.level>4?' · HARD':''}`}</small>
    <h2 className={styles.startTitle}>{mode==='cup'?tie.name:STRIKER_ROUNDS[view.level-1]}{mode==='rounds'&&<span className={styles.best} aria-label={`Best: ${stars[view.level-1]} of 3 stars`}>{starText(stars[view.level-1])}</span>}</h2>
    {mode==='rounds'?<ul className={styles.goals} aria-label="Star goals">{STRIKER_ROUND_MODS[view.level-1]?.rain&&<li data-mod="">Rain: the ball skids</li>}{STRIKER_ROUND_MODS[view.level-1]?.small&&<li data-mod="">Small goals</li>}<li>Win</li><li>{STRIKER_FOCUS[view.level-1]} ×{STRIKER_FOCUS_GOAL}</li><li>{STRIKER_CHALLENGES[view.level-1]}</li></ul>:<ol className={styles.bracket} aria-label="Cup run">{STRIKER_CUP.map((t,i)=><li key={t.name} data-now={i===cupStage||undefined} data-done={i<cupStage||undefined}>{t.name}</li>)}</ol>}
    {firstTime&&<ol className={styles.howTo} aria-label="How to play"><li><b>Pass</b>to a cyan ring</li><li><b>Move</b>into space</li><li><b>Shoot</b>hold, let go in the cyan band</li></ol>}
    {assist&&<p className={styles.assist} role="status">Coach eased the press for this try. Show your habit!</p>}{entry.message&&<p role="status">{entry.message}</p>}
    <button className={styles.primary} disabled={entry.pending} onClick={()=>{unlock();void changePhase('playing');}}>Kick off</button>
    <div className={styles.startRow}><button type="button" className={styles.optionsToggle} aria-expanded={optionsOpen} aria-controls="strikers-options" onClick={()=>setOptionsOpen(o=>!o)}>Options<span aria-hidden="true">{optionsOpen?'▴':'▾'}</span></button><button type="button" className={styles.boards} onClick={()=>setBoardsOpen(true)}>Leaderboard</button></div>
    <p className={styles.coins}>3 coins per match</p>
    {optionsOpen&&<div id="strikers-options" className={styles.options}>
     <div className={styles.seg} role="group" aria-label="Match type"><button type="button" aria-pressed={mode==='rounds'} onClick={()=>pickMode('rounds')}>Rounds</button><button type="button" aria-pressed={mode==='cup'} disabled={!cupOpen} onClick={()=>pickMode('cup')} data-tip={cupOpen?'Three knockout ties, 90 seconds each. Draws go to golden goal, then penalties.':'The cup starts against the Round 2 press. Win Round 2 to enter.'}>Island Cup<small>{!cupOpen?'win Round 2':cup.trophies?`${cup.trophies} ${cup.trophies===1?'trophy':'trophies'}`:'3 knockout ties'}</small></button></div>
     {mode==='rounds'?<div className={styles.seg} role="group" aria-label="Choose Strikers round">{STRIKER_ROUNDS.map((name,i)=><button type="button" key={name} aria-pressed={view.level===i+1} aria-label={`Round ${i+1}, ${name}${i+1>unlocked?', win the round before to unlock':''}`} disabled={i+1>unlocked} data-hard={i>=4||undefined} onClick={()=>chooseRound.current(i+1)}>{i+1}<small>{i+1>unlocked?'locked':starText(stars[i])}</small></button>)}</div>:<p className={styles.optNote}>{STRIKER_MOD_LESSONS[tie.mod]} {STRIKER_MOD_LESSONS.golden}</p>}
     <div className={styles.seg} role="group" aria-label="Choose team shape">{(Object.keys(STRIKER_SHAPES) as StrikerShape[]).map(k=><button type="button" key={k} aria-pressed={shape===k} onClick={()=>pickShape(k)}>{STRIKER_SHAPES[k].label}</button>)}</div>
     <p className={styles.optNote}>Team shape: {STRIKER_SHAPES[shape].lesson}</p>
    </div>}
    {!touchDevice&&KEYS}
   </div></div>}
   {/* Pause + full-time cards (round 3, Oct 26 2026): one big result line, big stars, ONE primary button, small Arcade / More /
       Leaderboard; the stats, coach line, cup bracket and match type wait under More. Desktop shows the keys as keycaps. */}
   {/* Pause: the one shared arcade pause card (docs/ARCADE_CHROME_OCT27.md). Restart starts this round / cup tie again (a new entry). */}
   {phase==='paused'&&!failed&&<ArcadePauseCard game="live" score={`Gold ${view.gold} – ${view.blue} Blue · ${clock} left`} status={entry.message||undefined} onResume={()=>{unlock();void changePhase('playing');}} onExit={()=>{release();onExit();}} onRestart={()=>{void restartMatch();}} restartDisabled={entry.pending} keys={touchDevice?undefined:KEY_LIST}/>}
   {(phase==='finished'||failed)&&!outroOn&&<div className={styles.overlay}><div className={`${styles.card} ${styles.start} ${styles.end}`} data-end={failed?'failed':phase} data-options={phase==='finished'&&moreOpen||undefined}>
    <small>{mode==='cup'?`ISLAND CUP · ${tie.name.toUpperCase()}`:`ROUND ${view.level} · ${STRIKER_ROUNDS[view.level-1]}`}</small>
    {failed?<><h2 className={styles.startTitle}>The pitch could not load</h2><p className={styles.endLine}>Go back to the Arcade and try again.</p></>
    :<><p className={styles.result} data-result={won?'win':draw?'draw':'loss'}>{won?'You win!':draw?'Draw!':'Blue wins'}</p>
     <p className={styles.endScore}>Gold {view.gold} – {view.blue} Blue{view.pens?` · ${view.pens}`:''}</p>
     {mode==='rounds'&&result&&<p className={styles.bigStars} aria-label={`Stars this match: ${result.count} of 3`}>{[result.win,result.habit,result.challenge].map((on,i)=><span key={i} data-on={on||undefined}>{on?'★':'☆'}</span>)}{result.best&&<b className={styles.newBest}>New best!</b>}</p>}
     <p className={styles.endLine}>{mode==='cup'?(cupResult==='won'?'Island Cup won! A trophy for your shelf.':cupResult==='advance'?`Through to the ${tie.name.toLowerCase()}!`:'Knocked out. Try the cup again!'):won?(view.level<LAST_ROUND?'Great game! The next team is tougher.':'Champions! You beat the Island Legends.'):draw?'So close! Win to unlock the next round.':'Good try! Pass to a free teammate and go again.'}</p></>}
    {!failed&&assist&&<p className={styles.assist} role="status">Coach eased Blue a little for this try.</p>}{entry.message&&<p role="status">{entry.message}</p>}
    {!failed&&<button className={styles.primary} disabled={entry.pending} onClick={()=>{unlock();void changePhase('playing');}}>{mode==='cup'?(cupResult==='advance'?`Play the ${tie.name.toLowerCase()}`:'Start a new cup'):won&&view.level<LAST_ROUND?'Next round':draw||!won?'Try again':'Play again'}</button>}
    <div className={styles.startRow}><button type="button" className={styles.optionsToggle} onClick={()=>{release();onExit();}}>Arcade</button>{!failed&&phase==='finished'&&<><button type="button" className={styles.optionsToggle} aria-expanded={moreOpen} aria-controls="strikers-more" onClick={()=>setMoreOpen(o=>!o)}>More<span aria-hidden="true">{moreOpen?'▴':'▾'}</span></button><button type="button" className={styles.boards} onClick={()=>setBoardsOpen(true)}>Leaderboard</button></>}</div>
    {!failed&&phase==='finished'&&moreOpen&&<div id="strikers-more" className={styles.options}>
     <ul className={styles.stats} aria-label="Match stats"><li data-done={view.tried>0&&view.done*2>=view.tried||undefined}><b>{passLine(view.done,view.tried)}</b>{view.tried?'passes reached':'passes'}</li><li><b>{view.shots}</b>{view.shots===1?'shot':'shots'}</li><li data-done={view.focus>=STRIKER_FOCUS_GOAL||undefined}><b>{Math.min(view.focus,STRIKER_FOCUS_GOAL)}/{STRIKER_FOCUS_GOAL}</b>habit</li></ul>
     <p className={styles.takeaway}><b>Coach:</b> {scanTakeaway(view)}</p>
     {result&&mode==='rounds'&&<ul className={styles.starList} aria-label="Star goals"><li data-done={result.win||undefined}>{result.win?'★':'☆'} Win the match</li><li data-done={result.habit||undefined}>{result.habit?'★':'☆'} {STRIKER_FOCUS[view.level-1]} · {STRIKER_FOCUS_GOAL}</li><li data-done={result.challenge||undefined}>{result.challenge?'★':'☆'} {STRIKER_CHALLENGES[view.level-1]}</li></ul>}
     <div className={styles.seg} role="group" aria-label="Match type"><button type="button" aria-pressed={mode==='rounds'} onClick={()=>pickMode('rounds')}>Rounds</button><button type="button" aria-pressed={mode==='cup'} disabled={!cupOpen} onClick={()=>pickMode('cup')}>Island Cup<small>{!cupOpen?'win Round 2':cup.trophies?`${cup.trophies} ${cup.trophies===1?'trophy':'trophies'}`:'3 knockout ties'}</small></button></div>
     {mode==='cup'&&<ol className={styles.bracket} aria-label="Cup run">{STRIKER_CUP.map((t,i)=><li key={t.name} data-now={i===cupStage||undefined} data-done={i<cupStage||undefined}>{t.name}</li>)}</ol>}
     <p className={styles.optNote}>{mode==='cup'?STRIKER_MOD_LESSONS[tie.mod]:ROUND_LESSONS[view.level-1]}</p>
    </div>}
   </div></div>}
  </div>
  <footer className={styles.footer}><p key={(phase==='playing'?'play:':'')+view.message}>{phase==='playing'?'':phase==='finished'&&outroOn?(won?'Full time! Gold celebrate together.':draw?'Full time! Shake hands, well played.':'Full time. Heads up, try again!'):view.message}</p><div className={styles.meters} data-charging={view.charge>0.02||undefined}><label>Sprint <meter min="0" max="1" value={view.stamina}/></label><label>Shot power <meter min="0" max="1" value={view.charge}/></label><label data-full={view.spirit>=1||undefined} data-tip="Team spirit fills from passes, habits, perfect touches and beaten tackles. Full: charge a full shot for a Team Strike.">{view.spirit>=1?'Team Strike ready':'Team spirit'} <meter min="0" max="1" value={view.spirit}/></label></div><div className={styles.touchControls} aria-label="Touch match controls"><div ref={zone} className={styles.stickZone} aria-hidden="true" onPointerDown={stickDown} onPointerMove={moveStick} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick}/><div className={`touch-controls ${styles.movement}`}><div ref={joy} className="joystick" data-floating="true" role="group" aria-label="Move player: press anywhere on the left of the pitch"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span/></div></div><div className={styles.actions} onPointerDown={actionDown} onPointerUp={actionUp} onPointerCancel={actionUp} onLostPointerCapture={actionUp}>{(['pass','through','switchPlayer'] as const).map(action=>{const skill=action==='switchPlayer'&&view.own,press=()=>{if(skill)local.current.skill=true;else local.current[action]=true;};return <button key={action} data-action={action} data-skill={skill||undefined} data-hint={action==='pass'&&(view.hint==='pass'||view.hint==='tackle')||undefined} title={action==='pass'?'Pass · Space':skill?'Skill move · E. Stick back: drag-back. Stick to a side: step-over. Neutral: roulette.':undefined} disabled={phase!=='playing'} onClick={event=>{if(event.detail===0)press();}} onPointerDown={event=>{event.preventDefault();if(action==='through'){throughCalled.current=false;if(throughTimer.current)clearTimeout(throughTimer.current);throughTimer.current=window.setTimeout(()=>{throughCalled.current=true;local.current.call=true;},320);return;}press();}} onPointerUp={action==='through'?()=>{if(throughTimer.current){clearTimeout(throughTimer.current);throughTimer.current=null;}if(!throughCalled.current)press();}:undefined} onPointerCancel={action==='through'?()=>{if(throughTimer.current)clearTimeout(throughTimer.current);throughTimer.current=null;}:undefined}>{skill?'Skill':action==='through'?<>Through<small className={styles.hold}>hold: run</small></>:({pass:'Pass / tackle',switchPlayer:'Switch'})[action]}</button>;})}<button data-action="shoot" data-hint={view.hint==='shoot'||undefined} title="Shoot · hold ⌘ (or K), release to strike. Move with the arrow keys while you charge." disabled={phase!=='playing'} onKeyDown={event=>{if((event.code==='Space'||event.code==='Enter')&&!event.repeat){event.preventDefault();startCharge();}}} onKeyUp={event=>{if(event.code==='Space'||event.code==='Enter'){event.preventDefault();if(shootId.current===-1)fire();}}} onBlur={()=>{if(shootId.current===-1)cancelCharge();}} onPointerDown={event=>{if(shootId.current!==null)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);startCharge(event.pointerId);}} onPointerUp={event=>{if(shootId.current===event.pointerId)fire();}} onPointerCancel={event=>{if(shootId.current===event.pointerId)cancelCharge();}} onLostPointerCapture={event=>{if(shootId.current===event.pointerId)cancelCharge();}}>Hold / Shoot</button><button data-action="sprint" disabled={phase!=='playing'} onPointerDown={event=>{if(sprintId.current!==null)return;event.preventDefault();sprintId.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);local.current.sprint=true;}} onPointerUp={event=>{if(sprintId.current===event.pointerId){sprintId.current=null;local.current.sprint=false;}}} onPointerCancel={event=>{if(sprintId.current===event.pointerId){sprintId.current=null;local.current.sprint=false;}}} onLostPointerCapture={event=>{if(sprintId.current===event.pointerId){sprintId.current=null;local.current.sprint=false;}}}>Sprint</button></div></div></footer>
  {boardScore&&phase==='finished'&&!outroOn&&<HighScoreEntry game="live" score={boardScore.score} detail={boardScore.detail} onClose={()=>setBoardScore(null)}/>}
  {boardsOpen&&<ArcadeBoards game="live" onClose={()=>setBoardsOpen(false)}/>}
 </section></>;
}
