// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md; the Play / Learn card + side and position
// pick, owner decision Nov 4 2026): Town's glue between the walk, the live
// field runtime (fieldRuntime joinMatch / humanInput / humanView / leaveMatch), the on-pitch markers and the HUD
// (components/LiveJoinHud.tsx). Solo play now, but everything is keyed by a human id so the multiplayer slice adds
// remote humans without touching this flow.
// Heat: when you are not near a joinable pitch this costs one rectangle test per frame and no DOM writes; while
// joined it writes a handful of attributes only when they change, and the markers are ≤ 4 draw calls.
import * as T from 'three';
import {createJoinState,stepJoin,pickJoinTeam,pickSlot,slotName,slotOptions,defaultSlot,sideCounts,type FriendSlots,type SlotOption,LIVE_JOIN_FORMATS,JOIN_PITCH_MARGIN,joinableFormat,type SlotCandidate} from './liveJoin';
import {growFrame,GROW_IN_MS,GROW_OUT_MS} from '../ui/growFrame';
import {typingTarget} from './typingTarget';
import {LIVE_VENUES,liveFieldPoint,liveHalfX,liveHalfZ,liveWorldYaw,liveWorldX,liveWorldZ,type LiveFormat,type LiveVenue} from './venues';
import {bibColour,type BeanDress,type MatchKits} from './beanLooks';
import {createHumanView,type createFieldRuntime} from './fieldRuntime';
import {createJoinMarkers} from '../graphics/joinMarkers';
import {createKeeperMarkers} from '../graphics/keeperMarkers';
import {LONG_BALL,AIM_MARKS,SHOT_AIM,SHOT_FX,POWER_SHOT,pickAimMark} from './match/humanInputs';
import {shotMouthX} from './shotPlacement';
import {SLOW_MO,slowMoScale,punchWeight} from './slowMo';
import {matchFxLevel} from './matchFxSetting';
import {wrongOrientationQuery} from '../orientationMode';
import {joinModes,tackleNear,stickSprint,stickSprintEnabled,runEffort,RANGE_SETTLE,bufferedA,graceA,hotButton,OPEN_CALL_W,hapticTick,HAPTIC,PRESS_BUFFER,type JoinMode,type JoinModes} from './liveControls';
import {createPhraseHud} from './livePhraseHud';
import {createJoinCamera,createJoinCamFrame,joinCamFrame,replayCamFrame,createReplayCamShot,nextJoinCamAngle,isJoinCamAngle,turnStick,JOIN_CAM_LABEL,ballLookTarget,BALL_LOOK,type JoinCamPitch} from './liveJoinCamera';

export const ME='me';
type Games=ReturnType<typeof createFieldRuntime>;
/** The one-line football lessons, each shown the first time its action is used (remembered per device). */
export const JOIN_TIPS={
  join:'Bibs help you find your teammates with one quick look.',
  pass:'Look for the open player: pass to a teammate with space.',
  forward:'Pass to the player, or pass into the space where they are running.',
  shoot:'Shoot low and aim for the corners.',
  call:'Show for the ball: find a gap and call for it.',
  notOpen:'Not open: move into space so they can see you.',
  tackle:'Time your tackle: go when the ball leaves their feet.',
  stay:'Stay goal-side and don\'t dive in.',
  go:'First to the ball: sprint onto it.',
  save:'Stay on your line, dive at the shot.',
  keeper:'Tap Dive when they shoot. The stick picks a side.',
  throw:'Stick at a teammate, then Throw. Six seconds max in your hands!',
  wide:'Wide: keep space between you and your teammates.',
  trick:'Fake out the defender: a quick trick, then go past him.',
  press:'Press together: two defenders win the ball back.',
  long:'Hold Pass for a long ball over the defenders.',
  aim:'Hold Shoot and push the stick at a corner. Full charge is a power shot!',
} as const;
type Tip=keyof typeof JOIN_TIPS;
export type JoinButton='a'|'b'|'s'|'f'|'t'|'skip'|'leave'|'camera'|'play'|'start'|'back'|'dismiss'|'side-gold'|'side-blue'|'phrases'|`phrase-${number}`;
type Mode=JoinMode;
const TEAM_NAME={gold:'Yellow',blue:'Blue'} as const,TEAMS=['gold','blue'] as const;
/** The side names follow the format's bibs (beanLooks LIVE_BIB_KITS): the 9v9 plays in orange / purple, not yellow / blue. */
const TEAM_NAMES:Partial<Record<LiveFormat,{gold:string;blue:string}>>={'9v9':{gold:'Orange',blue:'Purple'},'11v11':{gold:'Cyan',blue:'Orange'},beach:{gold:'Orange',blue:'Blue'},stadium:{gold:'Red',blue:'Blue'}};// beach: BEACH_KITS' orange vs blue shirts
const teamName=(f:LiveFormat|null,t:'gold'|'blue')=>(f&&TEAM_NAMES[f]||TEAM_NAME)[t];
const TIP_KEY='fi2-join-tips-v1';
/** The camera angle (lib/town/liveJoinCamera.ts) is kept for the browser session and across joins: a player who likes
 *  Wide gets Wide again next match. sessionStorage, so a new visit starts on Broadcast. */
const CAM_KEY='fi2-join-cam-v1';
/** Full charge after this long a hold (Pass and Shoot). */
const CHARGE_MS=700;
/** --charge values, quantised so the HUD writes a cached string only when the step changes (no per-frame allocation). */
const CHARGE_STEPS=Array.from({length:21},(_,i)=>(i/20).toFixed(2));
/** The popup word of each dribbling trick (owner Nov 4 2026). */
const TRICK_WORD={stepover:'Step-over!',croqueta:'La Croqueta!',dragBack:'Drag-back!',roulette:'Spin turn!',flick:'Flick-up!'} as const;
/** Goalkeeper feel (owner Nov 5 2026): the save word (catch / parry / tipped over; a full-stretch save is "What a save!"), how long
 *  the "You're the keeper" banner stays (real s), and a big save's moment: a hit pause then a short slow motion with a small zoom
 *  (solo, not with reduced motion; a shared match keeps 1x like every slow motion). */
const SAVE_WORD=['Great catch!','Punched clear!','Tipped over!'] as const;
export const KEEPER_FX={banner:2.1,pause:.11,slow:{scale:.35,hold:.32,ease:.22,zoom:.2,zoomIn:.1}} as const;
/** Trick slow motion + zoom (owner Nov 4 2026; human-triggered, local, off with reduced motion): the match runs at
 *  `scale` for `hold` real seconds, then eases back over `ease`; the camera moves `zoom` of the way toward the player. */
// Nov 5 2026 ("make the tricks slow motion even better", lib/town/slowMo.ts): eases in over SLOW_MO.in (no snap) and out over `ease`.
const TRICK_FX={scale:.3,hold:.55,ease:.18,zoom:.36,zoomIn:.12} as const;
/** One slow-motion moment (the shared hook: `liveJoin.slowMo`, used by the Trick; a shot cinematic can call it too). */
export type JoinSlowMo={scale:number;hold:number;ease:number;zoom:number;zoomIn:number};

/** The picker's position list for the HUD's IslandSelect (components/LiveJoinHud.tsx SlotField); written only on taps. */
// One store per page on globalThis (not per module copy): after a dev hot reload Town's live runtime and the re-rendered HUD
// can hold different copies of this module, and a module-level store left the dropdown empty ("Choose", no rows).
type SlotStore={view:{options:SlotOption[];value:string};subs:Set<()=>void>};
/** Tap-and-drag on Shoot (owner Nov 4 2026): the HUD writes the drag (px from where the press started, y down) while the
 *  button holds the pointer; the runtime reads it to pick the corner. One store per page (dev hot reload, as below). */
type AimDrag={x:number;y:number;on:boolean};
export const joinAim:AimDrag=((globalThis as {__fi2JoinAim?:AimDrag}).__fi2JoinAim??={x:0,y:0,on:false});
const slotStore:SlotStore=((globalThis as {__fi2JoinSlots?:SlotStore}).__fi2JoinSlots??={view:{options:[],value:''},subs:new Set()});
export const joinSlots={get:()=>slotStore.view,subscribe(f:()=>void){slotStore.subs.add(f);return ()=>{slotStore.subs.delete(f);};}};
const publishSlots=(options:SlotOption[],value:string)=>{slotStore.view={options,value};slotStore.subs.forEach(f=>f());};

export function createLiveJoin(scene:T.Scene,games:Games,root:()=>HTMLElement|null){
  const state=createJoinState(),view=createHumanView(),markers=createJoinMarkers(scene),keeperMarks=createKeeperMarkers(scene),venues=LIVE_VENUES.filter(v=>joinableFormat(v.id));
  let format:LiveFormat|null=null,pickFormat:LiveFormat|null=null,team:'gold'|'blue'='gold',colour='#ffd23f';
  // The Play flow (owner decisions Nov 4 2026): the pitch bar's Play opens the side + position picker; Start joins once
  // the player is grounded and walking. No countdown, no auto-join.
  let pickTeam:'gold'|'blue'='gold',pickId:string|null=null,optionsKey='',playRect:DOMRect|null=null,closing=false,seenGold=-1,seenBlue=-1,lastX=0,lastZ=0,cam:T.Camera|null=null;
  let seen=new Set<string>();try{seen=new Set(JSON.parse(localStorage.getItem(TIP_KEY)??'[]'));}catch{}
  let tip='',tipT=0,lastCallOpen:boolean|null=null;
  // Beach (Nov 4 2026): the sim's toasts for me (restarts, a goal ruled out) and the games finished while I was in (full time / penalties).
  let noteSeen=-1,resultsSeen=-1;
  const BEACH_JOIN_TIP='Beach soccer: 5 a side, barefoot, no offside';
  // Buttons: touch (HUD) and keys feed one press state. A/B are edge-triggered; holds (Stay, Go, Shoot power) read `held`.
  const held={a:false,b:false,s:false},pressed={a:false,b:false,t:false,leave:false,play:false,start:false,dismiss:false};let aDownAt=0,bDownAt=0,aMode:Mode='',chargeA=-1,chargeB=-1,heldS=false;const keyPrev={a:false,b:false,k:false,l:false,p:false,esc:false};let forwardKey=false,trickKey=false,pressKey=false;
  // Easier controls (owner Nov 5 2026, lib/town/liveControls.ts): Shoot's mode latched at the press, the Shoot / Forward and
  // Tackle / Press choices (settled), the Press chase (held: run at the carrier, tackle once in reach) and the stick-edge sprint.
  // Input buffering (Nov 7 2026, liveControls.bufferedA / graceA): the Pass button's mode now and the one before it (with when
  // it changed), and a tap made while it could not act yet (Go! / Wait) waiting up to PRESS_BUFFER.ms for the pass to arrive.
  let aCurMode:Mode='',aPrevMode:Mode='',aChangedAt=0,aPend:Mode='',aPendAt=0;
  // Button emphasis (liveControls.hotButton) and the charge's haptic ticks: written / fired only on change.
  let hotShown:''|'a'|'b'|'x'='x',tickA=0,tickB=0,calmShown=false;
  let bMode:Mode='',rangeL=false,rangeT=0,nearL=false,chase=false,edgeSprint=false,edgeShown=false;const modeOut:JoinModes={a:'',b:'',c:''};
  // Trick / Press (owner Nov 4 2026): cooldown ring steps written on change; the trick's popup, slow motion and zoom.
  // Shooting (owner Nov 4 2026): the corner picked while Shoot is held (-1 = auto-aim), the aim marks' world points, the
  // power-shot ring state, and the shot's slow motion + low camera (its own track; Town's one timeScale is the min of both).
  let aimSel=-1,aiming=false,fullB=false,lastShot=-1,lastSlip=-1,shotAge=-1,shotSkip=false,shotW=0,shotFromX=0,shotFromZ=0,shotGoalX=0,shotGoalZ=0,shotGround=0;
  const aimPts=new Float32Array(15),pa=new T.Vector3(),pb=new T.Vector3(),pc=new T.Vector3(),camFwd=new T.Vector3();
  let coolT=-1,longA=false,lastTrick=-1,fxAge=-1,popT=0,timeScale=1,zoomW=0;const fx:JoinSlowMo={...TRICK_FX};
  // Kick effects (Nov 5 2026, lib/town/kickFx.ts + slowMo.ts): a clean tackle of mine nearly stops the match for a beat (solo), a hard
  // shot of mine punches the camera in with a tiny shake; the slow-motion vignette (CSS opacity, quantised steps). Local only.
  let kickSeen=-1,tackleSeen=-1,pauseT=0,shakeT=0,shakeAmp=0,punchAge=-1,punchW=0,vigStep=-1;
  // Goalkeeper feel + body moves (Nov 5 2026): the save / beat serials seen, the keeper banner's time left, a banner owed after a goal, hands last frame.
  let saveSeen=-1,beatSeen=-1,bannerT=0,bannerOwed=false,handsWas=false,keeperShown=false;
  // Camera angle (owner, Nov 4 2026): one eased controller; Town calls cameraRestore before its follow lerp and
  // cameraApply after its lookAt. Reused objects only (no per-frame allocation).
  const camCtl=createJoinCamera(),camGoal=createJoinCamFrame(),camOut=createJoinCamFrame(),camBase={x:0,y:0,z:0},stickOut={x:0,z:0};
  const camPitch:JoinCamPitch={x:0,z:0,width:1,length:1,yaw:0,ground:0};let camSaved=false,camDelta=0,stickLen=0,stepDt=1/60;
  // Broadcast ball lookahead (liveJoinCamera BALL_LOOK, 9v9 / 11v11): the eased offset now and its target (reused object).
  let lookX=0,lookZ=0;const lookT={x:0,z:0};
  // The off-screen ball cue (Nov 7 2026): its last written screen point / angle and whether it shows (written on change only).
  const ballV=new T.Vector3();let cueX=-1,cueY=-1,cueDeg=999,cueShown=false;
  // Goal replays (lib/town/goalReplay.ts; the field runtime draws it): a broadcast replay angle behind the scorer on the TV side
  // (liveJoinCamera replayCamFrame) framing the goal mouth + ball + shooter, easing in to goal + ball for the finish (repTight);
  // eased in / out by replayW; reduced motion: two held shots, cut (no easing). The REPLAY tag + Skip under the score bar, the
  // ball ring + scorer ring on the existing markers, the live GOAL! card, pop, tip and goal badge hidden and the controls faded while it plays.
  const repGoal=createJoinCamFrame(),repShot=createReplayCamShot(),repEye={x:0,y:0,z:0},repLook={x:0,y:0,z:0};let replayW=0,replaySeen=-1,replayShown=false,repTight=0,repCutTight=-1;
  try{const a=sessionStorage.getItem(CAM_KEY);if(isJoinCamAngle(a)&&a!=='broadcast'){camCtl.angle=a;camCtl.shown=a;}}catch{}
  // The wrong-orientation card's own query (lib/orientationMode.ts; the island is always the portrait mode). A live MediaQueryList: .matches is a property read.
  const sideways=typeof matchMedia==='function'?matchMedia(wrongOrientationQuery('portrait')):null;
  const dom:Record<string,HTMLElement|null>={};
  const el=(sel:string)=>{const cached=dom[sel];if(cached?.isConnected)return cached;const found=root()?.querySelector<HTMLElement>(sel)??null;dom[sel]=found;return found;};
  const set=(e:HTMLElement|null,attr:string,value:string|null)=>{if(!e)return;if(value===null){if(e.hasAttribute(attr))e.removeAttribute(attr);}else if(e.getAttribute(attr)!==value)e.setAttribute(attr,value);};
  const text=(e:HTMLElement|null,value:string)=>{if(e&&e.textContent!==value)e.textContent=value;};
  // Quick phrases (Nov 7 2026, lib/town/livePhraseHud.ts): the tray, the bubbles over heads, the AI's answers; matchLink reads `phrases`.
  const phraseHud=createPhraseHud({el,set,sound:g=>games.sound('tick',g)});
  const hide=(e:HTMLElement|null,hidden:boolean)=>{if(e&&e.hidden!==hidden)e.hidden=hidden;};
  const showTip=(k:Tip,always=false)=>{if(!always&&seen.has(k))return;seen.add(k);try{localStorage.setItem(TIP_KEY,JSON.stringify([...seen]));}catch{}tip=JOIN_TIPS[k];tipT=3.6;};
  // A raised pitch (the rooftop futsal court, elevation 6) counts only from its own level or above (flying over it is fine):
  // standing on the street under the garage roof never offers Play. Town writes the feet height (groundY) every frame.
  let feetY=0;
  const venueAt=(x:number,z:number,m=0):LiveVenue|null=>{for(const v of venues)if(Math.abs(x-v.x)<=liveHalfX(v)+m&&Math.abs(z-v.z)<=liveHalfZ(v)+m&&feetY>(v.elevation??0)-1)return v;/* half-extents by yaw: the beach court is a quarter turn */return null;};
  /** Screen words for "which goal": the attack goal projected against you on screen. */
  const attackWords=(camera:T.Camera,v:LiveVenue,t:'gold'|'blue')=>{
    // Gold attacks sim y 8: on the island pitches that is world north, which the fixed camera shows up the screen.
    const yaw=liveWorldYaw(v,0,t==='gold'?-1:1),dx=Math.sin(yaw),dz=Math.cos(yaw);
    const e=(camera as T.PerspectiveCamera).matrixWorld.elements,fx=-e[8],fz=-e[10],up=dx*fx+dz*fz;// camera forward on the ground ≈ up the screen
    return up>=0?{arrow:'▲',words:'Score in the top goal'}:{arrow:'▼',words:'Score in the bottom goal'};
  };
  const simOf=(f:LiveFormat)=>games.entries.find(e=>e.venue.id===f)?.sim??null;
  // Multiplayer slice 2 (lib/multiplayer/matchLink.ts): party friends' slots on each field (the relay's roster) and the picker's counts.
  let friendsOf:((f:LiveFormat)=>FriendSlots|null)|null=null,friendsKey='x';const counts={gold:0,blue:0};
  const api={
    /** matchLink installs: party friends' slots per field (null = no party / old relay). */
    set friends(fn:((f:LiveFormat)=>FriendSlots|null)|null){friendsOf=fn;},
    /** matchLink: the picker re-reads friends' slots (a roster changed). */
    friendsChanged(){friendsKey='';if(state.phase==='joined'&&format)api.onMatch?.({type:'others',others:othersOn(format)});},
    /** Town installs (lib/analytics/liveMatchEvents.ts liveMatch.on): join / leave transitions only, never per frame. Plain data:
     *  the format, a coarse role (gk / def / mid / fwd) and how many other humans are on the match (Nov 5 2026). */
    onMatch:null as ((e:{type:'join';format:string;role:string|null;others:number;bots?:number;humans?:number}|{type:'others';others:number}|{type:'leave';reason:'leave'|'forced';others:number}
      /* Nov 6 2026 (admin analytics): a goal while I am on (for my side or not), a goal replay shown / skipped; transitions only */
      |{type:'goal';mine:boolean}|{type:'replay';skipped?:boolean})=>void)|null,
    /** A short message in the tip line (matchLink: a friend left, the match moved to this phone...). */
    say(text:string,seconds=3.2){tip=text;tipT=seconds;},
    /** Last machine event (headless checks). */
    lastEvent:'',
    /** In a match (after the picker has shrunk back into Play and the slot is taken). */
    get joined(){return state.phase==='joined'&&format!==null;},
    /** The side + position picker is up (Play was tapped). */
    get picking(){return state.phase==='pick';},
    /** Start was tapped and the join waits for landing / dismounting. */
    get waiting(){return state.startPending;},
    /** Town installs: land the jetpack / dismount the ride (Play or Learn tapped while riding or flying). */
    ground:()=>{},
    /** Town: the player's feet height this frame (before update), for raised pitches. */
    set feet(y:number){feetY=y;},
    get pick(){return {team:pickTeam,slot:pickId};},
    /** The position dropdown (HUD onChange). */
    selectSlot(id:string){if(state.phase!=='pick')return;pickId=id;renderPick();},
    get format(){return format;},
    /** Quick phrases: the bus matchLink sends my phrase on and shows friends' phrases through (lib/town/quickPhrases.ts PhraseBus). */
    get phrases(){return phraseHud.bus;},
    /** Quick phrases (headless checks): the HUD side (tray, bubble pool, rate limit). */
    get phraseHud(){return phraseHud;},
    press(b:JoinButton,down:boolean){
      if(b==='phrases'){if(down)phraseHud.toggleTray();return;}
      if(b.startsWith('phrase-')){if(down)phraseHud.say(Number(b.slice(7)));return;}
      if(b==='s'){held.s=down;return;}
      if(b==='f'){if(down)forwardKey=true;return;}
      if(b==='t'){if(down)pressed.t=true;return;}
      if(b==='skip'){if(down&&format)skipRep(format);return;}
      if(down&&shotAge>.12)shotSkip=true;// any tap skips the shot's slow motion
      if(b==='b'&&down){joinAim.x=joinAim.y=0;joinAim.on=false;aimSel=-1;}
      if(b==='a'||b==='b'){if(down&&!held[b]){pressed[b]=true;if(b==='a'){aDownAt=performance.now();aMode=latchA(aDownAt);aPendAt=0;}else{bDownAt=performance.now();bMode=modes().b;}}held[b]=down;return;}
      if(!down)return;
      if(b==='leave'){pressed.leave=true;return;}
      if(b==='camera'){if(state.phase!=='joined'||!format)return;const a=nextJoinCamAngle(camCtl.angle);camCtl.set(a,stickLen);try{sessionStorage.setItem(CAM_KEY,a);}catch{}
        if(a==='wide'&&!seen.has('wide'))showTip('wide');else{tip=JOIN_CAM_LABEL[a];tipT=1.4;}set(el('[data-join-cam]'),'data-angle',a);return;}
      if(b==='play'){if(state.phase==='idle'){pressed.play=true;playRect=root()?.querySelector<HTMLElement>('.field-learn-card:not([hidden]) [data-join-play]')?.getBoundingClientRect()??null;api.ground();}return;}
      if(state.phase!=='pick'||!pickFormat)return;
      switch(b){
        case 'dismiss':case 'back':pressed.dismiss=true;return;
        case 'start':pressed.start=true;api.ground();return;
        case 'side-gold':case 'side-blue':pickTeam=b==='side-gold'?'gold':'blue';renderPick();return;
      }
    },
    /** Scale the joined avatar for the uniform-change pop (Town feeds characterArrival's scale; 1 = rest). */
    pop(s:number){if(state.phase==='joined'&&format)games.humanPop(format,ME,s);},
    /** World point to keep the camera / Town location on while joined (null when not joined). */
    position(out:{x:number;z:number}){if(state.phase!=='joined'||!format||!games.humanView(format,ME,view))return null;out.x=view.x;out.z=view.z;return out;},
    /** Feed the stick (world direction, |v| ≤ ~1) and keys; called from Town's movement step while joined. `sprint` is
     *  a HELD state (Shift; the HUD Sprint button arrives through press('s')); `stickRaw` = the touch stick's raw deflection
     *  for "Push stick to sprint" (liveControls STICK_SPRINT, with hysteresis), 0 for keys. */
    steer(ix:number,iz:number,keys:ReadonlySet<string>,sprint:boolean,stickRaw=0){
      if(state.phase!=='joined'||!format)return;
      const ka=keys.has(' '),kb=keys.has('j'),kk=keys.has('k'),kl=keys.has('l'),kp=keys.has('p'),ke=keys.has('escape');
      if(ka&&!keyPrev.a)api.press('a',true);if(!ka&&keyPrev.a)api.press('a',false);
      if(kb&&!keyPrev.b)api.press('b',true);if(!kb&&keyPrev.b)api.press('b',false);
      if(kk&&!keyPrev.k)forwardKey=true;if(kl&&!keyPrev.l)trickKey=true;if(kp&&!keyPrev.p)pressKey=true;if(ke&&!keyPrev.esc)pressed.leave=true;
      keyPrev.a=ka;keyPrev.b=kb;keyPrev.k=kk;keyPrev.l=kl;keyPrev.p=kp;keyPrev.esc=ke;
      games.humanView(format,ME,view);
      const mode=modes(),now=performance.now(),aDown=pressed.a,bDown=pressed.b,bUp=!held.b&&bDownAt>0,aUp=!held.a&&aDownAt>0;
      if(mode.a!==aCurMode){aPrevMode=aCurMode;aCurMode=mode.a;aChangedAt=now;}
      // Input buffering (Nov 7 2026): a press made up to PRESS_BUFFER.ms before the button could act (Go! while the pass rolls
      // in) becomes the Pass / Throw / Tackle it turns into: held, it charges from the press; already released, it fires now.
      let bufPass=false,bufTackle=false;
      if(aDownAt>0){const up=bufferedA(aMode,mode.a,now-aDownAt);if(up!==aMode){aMode=up;if(up==='tackle')bufTackle=true;}}
      if(aPendAt>0){if(now-aPendAt>PRESS_BUFFER.ms)aPendAt=0;else{const up=bufferedA(aPend,mode.a,now-aPendAt);if(up!==aPend){aPendAt=0;if(up==='tackle')bufTackle=true;else bufPass=true;}}}
      // Hold-to-charge (owner, Nov 4 2026): Shoot AND Pass strike on RELEASE; the longer the hold, the more power.
      const mb:Mode=bDownAt>0&&bMode?bMode:mode.b;// Shoot / Forward / Kick as it was when pressed (the label may settle meanwhile)
      const holdS=bUp?Math.min(1,(now-bDownAt)/CHARGE_MS):0,bHoldMs=bUp?now-bDownAt:held.b&&bDownAt>0?now-bDownAt:0;if(!held.b){bDownAt=0;bMode='';}
      const holdMs=aUp?now-aDownAt:0,holdA=aUp?Math.min(1,holdMs/CHARGE_MS):0,passNow=aUp&&(aMode==='pass'||aMode==='throw')&&(mode.a===aMode||graceA(aPrevMode,mode.a,now-aChangedAt)===aMode)||bufPass;
      // Long ball (owner Nov 4 2026): Pass held past LONG_BALL.ms lofts it; the charge grows to the full hold (a tap stays the ground pass).
      const long=passNow&&aMode==='pass'&&holdMs>=LONG_BALL.ms?Math.max(.05,Math.min(1,(holdMs-LONG_BALL.ms)/(LONG_BALL.fullMs-LONG_BALL.ms))):0;if(aUp){if(aMode==='go'||aMode===''){aPend=aMode;aPendAt=aDownAt;}aDownAt=0;aMode='';}
      const tTap=pressed.t,trick=(tTap||trickKey)&&mode.c==='trick',pressTap=aDown&&mode.a==='press',pressNow=pressTap||pressKey&&view.possession==='opp'&&!view.keeper&&!view.restart;
      // The big defence button (owner Nov 5 2026): Tackle in reach (the assisted lunge); further, Press = the press together
      // (two teammates hunt the carrier) and, held, you run at him and tackle once he is in reach. The stick still steers.
      if(pressTap)chase=true;if(!held.a||view.possession!=='opp'||view.keeper)chase=false;
      const chaseTackle=chase&&nearL;if(chaseTackle)chase=false;
      // Screen-relative in every camera angle: the stick turns with the camera (held through an angle change while pushed).
      stickLen=Math.hypot(ix,iz);turnStick(ix,iz,camCtl.control(stepDt,camDelta,stickLen),stickOut);ix=stickOut.x;iz=stickOut.z;
      const len=stickLen;let mx=len>1?ix/len:ix,mz=len>1?iz/len:iz;
      // Push the stick to sprint (setting, default on; touch stick only): the knob pinned on the outer ring sprints, and the
      // full run pace comes a little before it (liveControls STICK_SPRINT.runAt), so running flat out never sprints by accident.
      const edgeOn=stickSprintEnabled()&&stickRaw>0;edgeSprint=edgeOn&&stickSprint(edgeSprint,stickRaw);
      if(edgeOn&&len>1e-6&&len<=1){const k=runEffort(len)/len;mx*=k;mz*=k;}
      if(edgeSprint!==edgeShown){edgeShown=edgeSprint;set(el('.touch-controls .joystick'),'data-sprint',edgeSprint?'':null);}
      if(chase&&len<.3&&Number.isFinite(view.carrierX)){const dx=view.carrierX-view.x,dz=view.carrierZ-view.z,d=Math.hypot(dx,dz);if(d>1e-3){mx=dx/d;mz=dz/d;}}
      const forwardB=bUp&&(mb==='forward'||mb==='kick');// a keeper's Kick is the long (Forward) ball
      // Aimed shot: while Shoot is held past SHOT_AIM.minHoldMs the stick (or a drag on the button) picks a corner mark;
      // a quicker tap stays the auto-aimed shot. The pick is kept through the release frame.
      aiming=mb==='shoot'&&bHoldMs>=SHOT_AIM.minHoldMs&&(held.b||bUp);if(aiming&&held.b){aimSel=pickCorner(mx,mz,len);if(aimSel>=0)showTip('aim');}
      // Tap to shoot (released before SHOT_AIM.minHoldMs): NO aim mark (aimX / aimH NaN), so the sim plays its own auto-aimed
      // shot at the far corner away from the keeper. Nov 7 2026 audit: sending the tap as a picked corner aimed it at only
      // 60-74% of the goal and gave the keeper the aimed-shot reach bonus (futsal 17% vs 60% scored, beach 15% vs 34%).
      const aimMark=bUp&&mb==='shoot'&&bHoldMs>=SHOT_AIM.minHoldMs&&aimSel>=0?AIM_MARKS[aimSel]:null;if(bUp)aiming=false;
      games.humanInput(format,ME,mx,mz,{
        pass:passNow,passPower:passNow&&!long?holdA:forwardB?holdS:0,long,trick,press:pressNow,
        through:forwardKey&&view.onBall||forwardB,
        shoot:bUp&&mb==='shoot',shootPower:.7+.3*holdS,aimX:aimMark?aimMark.x:NaN,aimH:aimMark?aimMark.h:NaN,
        tackle:aDown&&mode.a==='tackle'||chaseTackle||bufTackle,
        call:aDown&&mode.a==='call',
        save:aDown&&mode.a==='save',
        jockey:held.b&&mode.b==='stay',
        sprint:sprint||held.s||held.a&&mode.a==='go'||edgeSprint||chase,
      });
      if(aDown&&mode.a in JOIN_TIPS)showTip(mode.a as Tip);if(bDown&&mode.b in JOIN_TIPS)showTip(mode.b as Tip);if(forwardKey&&view.onBall)showTip('forward');
      if(aDown&&mode.a==='pass'&&seen.has('pass'))showTip('long');if(trick)showTip('trick');if(pressNow)showTip('press');
      pressed.a=pressed.b=pressed.t=false;forwardKey=trickKey=pressKey=false;
    },
    /** Per frame from Town (after the walk step): the picker, join/leave, markers and HUD. `canOffer`: nothing else owns
     *  the player (rides and flying allowed); `canJoin`: grounded and on foot. Returns the leave point once when the
     *  player leaves (Town puts the avatar and ball there). */
    update(dt:number,time:number,x:number,z:number,canOffer:boolean,canJoin:boolean,camera:T.Camera,reduced:boolean,dressFor:(home:boolean,kits:MatchKits|undefined,keeper?:boolean)=>BeanDress,pin:(x:number,y:number,z:number,colour:string|null)=>void,forceLeave=false){
      let left:{x:number;z:number}|null=null;
      const v=state.phase==='joined'&&format?venues.find(u=>u.id===format)??null:venueAt(x,z,JOIN_PITCH_MARGIN);
      if(!v&&state.phase==='idle'){pressed.play=false;if(pickFormat){pickFormat=null;hud(false,false);}return null;}
      lastX=x;lastZ=z;cam=camera;if(dt>0)stepDt=dt;
      const byUser=pressed.leave,on=venueAt(x,z,JOIN_PITCH_MARGIN),ev=stepJoin(state,{onPitch:!!on&&(state.phase!=='pick'||!pickFormat||on.id===pickFormat)/* a teleport onto another pitch with the picker open: cancel, never a stale side + slot list */,canOffer,canJoin,play:pressed.play,start:pressed.start,dismiss:pressed.dismiss,leave:pressed.leave||forceLeave});pressed.play=pressed.start=pressed.dismiss=pressed.leave=false;
      if(ev)api.lastEvent=ev+(ev==='cancel'?(venueAt(x,z,JOIN_PITCH_MARGIN)?':busy':':stepped-off'):'');
      if(ev==='pick'&&v)openPick(v);
      if(ev==='join'&&pickFormat){const f=pickFormat,pick={team:pickTeam,slot:pickId};pickFormat=null;
        // Start: the picker shrinks back into the bar's Play first (the Join with a code close), then the slot is taken and Town's arrival plays.
        shrink(reduced,()=>{if(state.phase!=='joined')return;const slot=games.joinMatch(f,ME,x,z,dressFor,null,pick);if(!slot){api.lastEvent='join-failed';state.phase='idle';return;}format=f;games.humanView(format,ME,view);team=view.team;colour=bibColour(format,team==='gold');markers.setColour(colour);keeperMarks.setColour(colour);if(view.keeper)bannerT=KEEPER_FX.banner;if(f==='beach'&&!view.keeper){tip=BEACH_JOIN_TIP;tipT=3.6;}/* no bibs on sand: the format's own lesson */else showTip(view.keeper?'keeper':'join',false);
          api.onMatch?.({type:'join',format:f,role:view.keeper?'gk':simOf(f)?.players[slot]?.role??null,others:othersOn(f),...slotsOn(f)});});}
      if(ev==='leave'){lastTrick=-1;fxAge=-1;kickSeen=tackleSeen=-1;saveSeen=beatSeen=-1;bannerT=0;bannerOwed=false;keeperMarks.hide();if(format){api.onMatch?.({type:'leave',reason:byUser?'leave':'forced',others:othersOn(format)});left=games.leaveMatch(format,ME,{x:0,z:0});}format=null;markers.hide();pin(0,0,0,null);held.a=held.b=held.s=false;aDownAt=bDownAt=0;bMode='';aPendAt=0;chase=edgeSprint=false;if(edgeShown){edgeShown=false;set(el('.touch-controls .joystick'),'data-sprint',null);}if(cueShown){cueShown=false;set(el('[data-join-ballcue]'),'data-show',null);}hotShown='x';lookX=lookZ=0;phraseHud.frame(0,false,null,'','',null,0,camera,false,false);}
      if(ev==='cancel'||ev==='dismiss'){pickFormat=null;shrink(reduced);}
      // Friends-ready: a side filling up while the picker is open (slice 2's remote humans) re-renders the pick.
      if(state.phase==='pick'&&pickFormat){const sim=simOf(pickFormat);if(sim&&(sim.humanOn.gold!==seenGold||sim.humanOn.blue!==seenBlue||friendsKey===''))renderPick();text(el('[data-join-start]'),state.startPending?'Landing…':'Start');}
      // ---- markers + HUD ----
      if(state.phase==='joined'&&format&&games.humanView(format,ME,view)){
        const fv=venues.find(u=>u.id===format)!,y=fv.elevation??0,rep=games.replay(format),replaying=!!rep?.active;
        if(view.inShotRange!==rangeL){rangeT+=dt;if(rangeT>=RANGE_SETTLE){rangeL=view.inShotRange;rangeT=0;}}else rangeT=0;nearL=tackleNear(nearL,view.carrierD);
        if(replaying!==replayShown){replayShown=replaying;replayHud(replaying,rep?.scorer==='gold');if(replaying)api.onMatch?.({type:'replay'});}
        if(replaying&&rep){// the replay: the compass on the shooter (chevron at the goal) and, once the ball has left his feet, the Pass ring under the ball
          const b=fieldBall(format);let sx=NaN,sz=NaN;markers.forwardTarget(NaN,y,0,0);
          if(rep.shooterX>=0){const gy=rep.scorer==='gold'?10:390;sx=liveWorldX(fv,rep.shooterX,rep.shooterY);sz=liveWorldZ(fv,rep.shooterX,rep.shooterY);markers.you(sx,y,sz,Math.atan2(liveWorldX(fv,135,gy)-sx,liveWorldZ(fv,135,gy)-sz));}
          else markers.hideYou();// no shooter (a struck loose ball): no ring
          keeperMarks.hide();
          const loose=!!b&&!(Math.hypot(b.position.x-sx,b.position.z-sz)<1.8);markers.passTarget(loose?b!.position.x:NaN,y,loose?b!.position.z:0,time,reduced);// one ring at a time, never stacked
          pin(0,0,0,null);markers.callPing(0,NaN,y,0,0,time,reduced);markers.callPing(1,NaN,y,0,0,time,reduced);
        }else{
        // In goal (Nov 5 2026): the keeper's double ring, glove badge, goal-mouth glow and dive-reach arc replace the attack compass.
        if(view.keeper){markers.hideYou();keeperMarks.show(view.x,y,view.z,view.outYaw,view.reachM,keeperGoal(view),view.threat,time,reduced,dt);}else{keeperMarks.hide();markers.you(view.x,y,view.z,Math.atan2(view.goalX-view.x,view.goalZ-view.z));}
        markers.passTarget(view.onBall?view.passX:NaN,y,view.passZ,time,reduced,view.x,view.z);// + the receiver arrow along the pass
        const fwd=view.onBall&&!view.inShotRange&&view.forwardX!==view.passX;markers.forwardTarget(fwd?view.forwardX:NaN,y,view.forwardZ,Math.atan2(view.goalX-view.forwardX,view.goalZ-view.forwardZ));
        markers.callPing(0,view.callAX,y,view.callAZ,view.callAW,time,reduced);markers.callPing(1,view.callBX,y,view.callBZ,view.callBW,time,reduced);// teammates calling for it (arm up + a ping)
        pin(view.x,y,view.z,colour);}
        // The ball off screen (Nov 7 2026 audit: on 11v11 it is > 25 m from you ~11% of the time): a small ball + arrow at the screen
        // edge pointing at it, clear of the score bar and both thumbs; hidden while the ball is on screen or a replay plays. One
        // pooled element, transform + opacity only, written when its whole-pixel spot or whole-degree angle changes.
        {const bl=fieldBall(format),cue=el('[data-join-ballcue]');let show=false;
          if(bl&&cue&&!replaying){ballV.copy(bl.position).project(camera);const bh=ballV.z>1,nx=bh?-ballV.x:ballV.x,ny=bh?-ballV.y:ballV.y;show=bh||Math.abs(nx)>.97||Math.abs(ny)>.95;
            if(show){const W=innerWidth,H=innerHeight,dx=nx*W/2,dy=-ny*H/2,hx=W/2-30,up=H/2-100,down=Math.max(H*.18,H/2-250),k=Math.max(Math.abs(dx)/hx,dy<0?-dy/up:dy/down,1);
              const px=Math.round(W/2+dx/k),py=Math.round(H/2+dy/k),deg=Math.round(Math.atan2(dy,dx)*180/Math.PI);
              if(px!==cueX||py!==cueY){cueX=px;cueY=py;cue.style.transform='translate('+px+'px,'+py+'px)';}
              if(deg!==cueDeg){cueDeg=deg;cue.style.setProperty('--cue-deg',deg+'deg');}}}
          if(show!==cueShown){cueShown=show;set(cue,'data-show',show?'':null);}}
        // Quick phrases: bubbles over heads (pooled), the AI's answers, the assist caption and the tackle wind-up cue.
        phraseHud.frame(dt,!replaying,simOf(format) as never,format,games.slotOf(format,ME)??'',fv,y,camera,view.onBall,reduced||matchFxLevel()==='light');
        // A trick (owner Nov 4 2026): the popup word, and (not reduced) a short slow motion with the camera zoomed in.
        if(view.trickSerial!==lastTrick){const fresh=lastTrick>=0&&view.trickSerial>0;lastTrick=view.trickSerial;if(fresh){const pop=el('[data-join-pop]');if(pop){text(pop,TRICK_WORD[view.trickKind]);pop.removeAttribute('data-show');void pop.offsetWidth;pop.setAttribute('data-show','');}popT=.9;if(!reduced)api.slowMo(TRICK_FX);}}
        // A shot of his (owner Nov 4 2026): "Power shot!" at full charge; from the shooting zone a power or aimed shot plays
        // the slow motion with the low camera behind the shot (not with reduced motion). A slip away: "Slipped away!".
        if(view.shotSerial!==lastShot){const fresh=lastShot>=0&&view.shotSerial>0;lastShot=view.shotSerial;if(fresh){
          if(view.shotPw>=POWER_SHOT.full)popWord('Power shot!');
          if(!reduced&&view.inShotRange&&(view.shotAimed||view.shotPw>=SHOT_FX.minCharge)){shotAge=0;shotSkip=false;games.sound('slow',.7);shotFromX=view.x;shotFromZ=view.z;shotGoalX=view.goalX;shotGoalZ=view.goalZ;shotGround=y;}}}
        // A save of mine as keeper: the word; a full-stretch one also gets the hit pause + short slow motion (solo, not reduced).
        if(view.saveSerial!==saveSeen){const fresh=saveSeen>=0;saveSeen=view.saveSerial;if(fresh){popWord(view.saveBig?'What a save!':SAVE_WORD[view.saveKind]);
          if(view.saveBig&&!reduced){pauseT=KEEPER_FX.pause;shakeT=SLOW_MO.shakeT;shakeAmp=SLOW_MO.shake*.6;api.slowMo(KEEPER_FX.slow);}}}
        // A body move that beat his man: the move's word + "Got past!" and a tiny hit pause (solo, not reduced).
        if(view.beatSerial!==beatSeen){const fresh=beatSeen>=0;beatSeen=view.beatSerial;if(fresh){popWord(TRICK_WORD[view.trickKind]+' Got past!');if(!reduced)pauseT=Math.max(pauseT,SLOW_MO.hitPause);}}
        if(view.hands&&!handsWas)showTip('throw');handsWas=view.hands;
        if(view.keeper&&bannerOwed&&!replaying&&view.restart){bannerOwed=false;bannerT=KEEPER_FX.banner;}
        if(view.slipSerial!==lastSlip){const fresh=lastSlip>=0&&view.slipSerial>0;lastSlip=view.slipSerial;if(fresh)popWord('Slipped away!');}
        {const kf=games.fx(format),mine=games.slotOf(format,ME);if(kf&&mine){
          if(kickSeen>=0&&kf.kickSerial!==kickSeen&&kf.kickBy===mine&&kf.kickShot&&kf.kickPower>=.55&&!reduced){punchAge=0;shakeT=SLOW_MO.shakeT;shakeAmp=SLOW_MO.shake*kf.kickPower;}
          if(tackleSeen>=0&&kf.tackleSerial!==tackleSeen&&!reduced&&(kf.tackleBy===mine||kf.tackleFrom===mine)){if(kf.tackleClean){pauseT=SLOW_MO.hitPause;shakeT=SLOW_MO.shakeT;shakeAmp=SLOW_MO.shake*.7;}else{shakeT=SLOW_MO.shakeT*.6;shakeAmp=SLOW_MO.shake*.35;}}
          kickSeen=kf.kickSerial;tackleSeen=kf.tackleSerial;}}
        markers.aim(aiming&&view.onBall&&!replaying?aimPts:null,aimSel,camera,time,reduced);
        if(view.callOpen!==lastCallOpen){lastCallOpen=view.callOpen;if(view.callOpen===false){tip=JOIN_TIPS.notOpen;tipT=2.6;}}
        // Beach: the sim's restart toasts for my slot, and full time. A level game ends in a shoot-out the sim plays at once
        // (humans cannot take it): "Penalties!" with the result while I watch the full-time beat, then the next game kicks off.
        {const e=games.entries.find(en=>en.venue.id===format),sim=e?.sim;if(e&&sim?.isBeach){const n=sim.humanNote,k=sim.results.length;
          if(noteSeen<0)noteSeen=n.serial;else if(n.serial!==noteSeen){noteSeen=n.serial;if(n.id===e.humans.get(ME)?.slot){tip=n.text;tipT=3.2;}}
          if(resultsSeen<0)resultsSeen=k;else if(k!==resultsSeen){resultsSeen=k;const r=sim.results[k-1],s=r.pens??r,w=teamName(format,s.gold>s.blue?'gold':'blue'),hi=Math.max(s.gold,s.blue),lo=Math.min(s.gold,s.blue);
            popWord(r.pens?'Penalties!':'Full time!');tip=r.pens?(s.gold===s.blue?'Penalties! Level after extra time: five kicks each decide it. Shoot-outs are played for you'/* a friend's screen (QA round 2): the shoot-out score is the owner's only */:`Penalties! ${w} win the shoot-out ${hi}–${lo}. Shoot-outs are played for you`):`Full time: ${w} win ${hi}–${lo}. Next game kicks off soon`;tipT=3.4;}}}
      }
      else{noteSeen=resultsSeen=-1;if(replayShown){replayShown=false;replayHud(false,false);}}
      if(bannerT<=0)tipT=Math.max(0,tipT-dt);bannerT=Math.max(0,bannerT-dt);// a tip waits under the keeper banner
      if(popT>0){popT-=dt;if(popT<=0)set(el('[data-join-pop]'),'data-show',null);}
      // Trick slow motion + zoom: Town scales the field runtime's dt by timeScale and cameraApply eases the zoom.
      if(fxAge>=0&&state.phase==='joined'&&!reduced){fxAge+=dt;const out=fxAge-fx.hold,e=out<=0?0:Math.min(1,out/fx.ease),s=e*e*(3-2*e);
        timeScale=slowMoScale(fxAge,fx.scale,fx.hold,fx.ease);const zi=Math.min(1,fxAge/Math.max(.01,fx.zoomIn));zoomW=zi*zi*(3-2*zi)*(1-s);if(e>=1){fxAge=-1;timeScale=1;zoomW=0;}}
      else{fxAge=-1;timeScale=1;zoomW=0;}
      // Shot slow motion (human shots only): SHOT_FX.scale for SHOT_FX.hold real s while the ball flies, then back over
      // SHOT_FX.ease; ends early on a tap, a save / any touch, or a goal (the score bar's goal shake then plays).
      if(shotAge>=0&&state.phase==='joined'&&format&&!reduced){shotAge+=dt;const sim=simOf(format);
        if(shotAge<SHOT_FX.hold&&(shotSkip||shotAge>.15&&sim&&(sim.ball.owner!==null||sim.goalHold>0)))shotAge=SHOT_FX.hold;shotSkip=false;
        const out=shotAge-SHOT_FX.hold,e=out<=0?0:Math.min(1,out/SHOT_FX.ease),s=e*e*(3-2*e),wi=Math.min(1,shotAge/SHOT_FX.in);
        timeScale=Math.min(timeScale,slowMoScale(shotAge,SHOT_FX.scale,SHOT_FX.hold,SLOW_MO.out,SLOW_MO.freeze));shotW=wi*wi*(3-2*wi)*(1-s);if(e>=1){shotAge=-1;shotW=0;}}
      else{shotAge=-1;shotW=0;}
      // A clean tackle of mine: the hit pause; a hard shot: the camera punch + shake (cameraFx); the vignette follows the slow motion.
      const fxOn=state.phase==='joined'&&!reduced;if(!fxOn){pauseT=shakeT=0;punchAge=-1;}
      if(pauseT>0){timeScale=Math.min(timeScale,SLOW_MO.hitScale);pauseT=Math.max(0,pauseT-dt);}
      if(punchAge>=0){punchAge+=dt;punchW=punchWeight(punchAge);if(punchAge>SLOW_MO.punchIn+SLOW_MO.punchOut){punchAge=-1;punchW=0;}}else punchW=0;
      shakeT=Math.max(0,shakeT-dt);
      {const step=Math.max(0,Math.min(20,Math.round(Math.max(zoomW,shotW*.9,punchW*.45)*20)));if(step!==vigStep){vigStep=step;const vg=el('[data-join-vignette]');if(vg)vg.style.opacity=CHARGE_STEPS[step];}}
      hud(state.phase==='pick',state.phase==='joined'&&format!==null);
      return left;
    },
    /** The chosen camera angle (headless checks). */
    get cameraAngle(){return camCtl.angle;},
    /** 0..1: how far the camera is in a non-broadcast angle (headless checks). */
    get cameraWeight(){return camCtl.w;},
    /** Town, before its follow lerp: put back the follow camera's own position (cameraApply moved it). */
    cameraRestore(camera:T.Camera){if(!camSaved)return;camera.position.set(camBase.x,camBase.y,camBase.z);camSaved=false;},
    /** Town, after its fixed-direction lookAt: ease toward the chosen angle (behind / wide / close) and write it. Costs a few
     *  multiplies and one lookAt while an angle is shown; nothing at all on Broadcast once the weight is back to 0. */
    /** Trick slow motion (owner Nov 4 2026): Town multiplies the live field runtime's dt by this (1 = normal time). */
    get timeScale(){return format&&games.shared(format)?1:sideways?.matches&&state.phase==='joined'?0:timeScale;},// friends on my match: no slow motion (it would slow their game too)
    /** QA round 2 (Nov 6 2026): a phone turned sideways shows "Turn your phone upright" (components/RotateLock.tsx) and "the game waits
     *  behind it"; a solo match kept playing behind the card (the AI scored on a kid who could not see). Solo only: 0 while it shows. */
    get sideways(){return !!sideways?.matches;},
    /** The shared slow-motion hook (owner Nov 4 2026): run the joined match at `scale` for `hold` real s, ease back over
     *  `ease`, with the camera `zoom` of the way to you. Joined only; ignored with reduced motion (Town's matchMedia). */
    slowMo(o:JoinSlowMo){if(state.phase!=='joined'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;fx.scale=o.scale;fx.hold=o.hold;fx.ease=o.ease;fx.zoom=o.zoom;fx.zoomIn=o.zoomIn;fxAge=0;games.sound('slow',.8);},
    /** Kick-effect camera state (headless checks): hit pause left (s), shake left (s), camera punch 0..1, vignette step 0..20. */
    get kickCam(){return {pause:pauseT,shake:shakeT,punch:punchW,vignette:vigStep};},
    /** 0..1: the trick's camera zoom toward the player (headless checks). */
    get zoom(){return zoomW;},
    /** 0..1: the shot camera's weight; and the corner picked while Shoot is held (-1 auto) (headless checks). */
    get shotCam(){return shotW;},
    get aimMark(){return aimSel;},
    /** Town, after its fixed-direction lookAt: the chosen angle, then the trick's zoom (moves the camera along its line to
     *  the player, so the framing holds; restored by cameraRestore). No work when neither is on. */
    cameraApply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
      api.cameraAngleApply(camera,dt,reduced);
      api.cameraFx(camera,reduced);
      replayCam(camera,dt,reduced);
    },
    /** 0..1: the goal replay camera's weight (headless checks). */
    get replayCam(){return replayW;},
    /** The trick zoom and the shot camera (cameraApply). */
    cameraFx(camera:T.PerspectiveCamera,reduced:boolean){void reduced;
      if(zoomW<=0&&shotW<=0&&punchW<=0&&shakeT<=0||state.phase!=='joined'||!format||!games.humanView(format,ME,view))return;
      const p=camera.position;if(!camSaved){camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;}
      if(zoomW>0||punchW>0){const fv=venues.find(u=>u.id===format),g=(fv?.elevation??0)+1,k=fx.zoom*zoomW+SLOW_MO.punch*punchW;
        p.set(p.x+(view.x-p.x)*k,p.y+(g-p.y)*k,p.z+(view.z-p.z)*k);}
      if(shotW>0){// the shot camera: low, behind where it was struck, looking at the goal; eased by shotW
        let dx=shotGoalX-shotFromX,dz=shotGoalZ-shotFromZ;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
        const w=shotW,ex=shotFromX-dx*SHOT_FX.back-dz*SHOT_FX.side,ey=shotGround+SHOT_FX.up,ez=shotFromZ-dz*SHOT_FX.back+dx*SHOT_FX.side;
        camFwd.set(0,0,-1).applyQuaternion(camera.quaternion);const reach=Math.max(4,Math.hypot(p.x-view.x,p.y-shotGround,p.z-view.z));
        const lx=p.x+camFwd.x*reach,ly=p.y+camFwd.y*reach,lz=p.z+camFwd.z*reach;
        p.set(p.x+(ex-p.x)*w,p.y+(ey-p.y)*w,p.z+(ez-p.z)*w);
        camera.lookAt(lx+(shotGoalX-lx)*w,ly+(shotGround+1-ly)*w,lz+(shotGoalZ-lz)*w);}
      if(shakeT>0&&!reduced){const a=shakeAmp*shakeT/SLOW_MO.shakeT,t=performance.now()*.001;p.x+=Math.sin(t*73)*a;p.y+=Math.sin(t*59+1)*a*.6;p.z+=Math.cos(t*67)*a;}// tiny, decaying
    },
    cameraAngleApply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
      let goal=null;
      if(state.phase==='joined'&&format&&(camCtl.angle!=='broadcast'||camCtl.w>0)){
        const fv=venues.find(u=>u.id===format);
        if(fv&&games.humanView(format,ME,view)){
          const ay=liveWorldYaw(fv,0,team==='gold'?-1:1),ax=Math.sin(ay),az=Math.cos(ay),g=fv.elevation??0;
          camPitch.x=fv.x;camPitch.z=fv.z;camPitch.width=fv.width;camPitch.length=fv.length;camPitch.yaw=fv.yaw??0;camPitch.ground=g;
          const p=camera.position,base=Math.hypot(p.x-view.x,p.y-g,p.z-view.z);
          if(joinCamFrame(camCtl.shown,view.x,view.z,ax,az,camPitch,camera.aspect,base,camGoal))goal=camGoal;
        }
      }
      if(!goal&&camCtl.w<=0){camDelta=0;lookAhead(camera,dt,reduced);return;}// Broadcast at rest (or not joined): only the big pitches' ball lookahead
      camCtl.step(dt,reduced,goal);
      if(camCtl.w<=0){camDelta=0;return;}
      const p=camera.position;camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;
      camDelta=camCtl.blend(p.x,p.y,p.z,camOut);p.set(camOut.ex,camOut.ey,camOut.ez);camera.lookAt(camOut.lx,camOut.ly,camOut.lz);
    },
    /** Let go of every held button without firing it (QA round 2, Nov 6 2026: a tab switch / phone call / page hide while Sprint, Pass
     *  or Shoot was held never delivered the release, so sprint or the Stay jockey stayed on after resume). Town's keys are cleared by its own blur. */
    release(){held.a=held.b=held.s=false;pressed.a=pressed.b=pressed.t=false;aDownAt=bDownAt=0;aMode=bMode='';aPendAt=0;chase=false;aiming=false;joinAim.on=false;joinAim.x=joinAim.y=0;forwardKey=trickKey=pressKey=false;},
    dispose(){markers.dispose();keeperMarks.dispose();window.removeEventListener('keydown',onKey,true);window.removeEventListener('pointerdown',onTap,true);window.removeEventListener('blur',api.release);window.removeEventListener('pagehide',api.release);document.removeEventListener('visibilitychange',onHidden);},
  };
  // Keyboard: Enter on a joinable pitch = Play; in the picker Enter / Space = Start, Esc = back to the bar. A capture
  // listener so the walk's Space shot never fires behind the picker; a focused button keeps its own Enter / Space.
  function onKey(e:KeyboardEvent){
    if(shotAge>.12)shotSkip=true;// any key skips the shot's slow motion
    if(format&&state.phase==='joined'&&!e.repeat)skipRep(format);// …and a goal replay
    if(typingTarget(e.target)||e.target instanceof HTMLButtonElement&&e.key!=='Escape'||(e.target as Element|null)?.closest?.('[role=listbox]'))return;// the position list keeps its own keys
    if(state.phase==='idle'){if(e.key==='Enter'&&!e.repeat&&venueAt(lastX,lastZ,JOIN_PITCH_MARGIN)){e.preventDefault();e.stopPropagation();api.press('play',true);}return;}
    if(state.phase==='joined'){if((e.key==='c'||e.key==='C')&&!e.repeat&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();e.stopPropagation();api.press('camera',true);}return;}
    if(state.phase!=='pick'||!pickFormat)return;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();api.press('dismiss',true);return;}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)api.press('start',true);}
  }
  window.addEventListener('keydown',onKey,true);
  function onHidden(){if(document.hidden)api.release();}
  window.addEventListener('blur',api.release);window.addEventListener('pagehide',api.release);document.addEventListener('visibilitychange',onHidden);
  // A tap anywhere skips the shot's slow motion (passive; nothing else is done with it).
  function onTap(){if(shotAge>.12)shotSkip=true;if(format&&state.phase==='joined')skipRep(format);}// …and a goal replay (Skip too)
  /** The goal replay's camera (after the angle / trick / shot ones): the side view of the replayed ball. No allocation. */
  function replayCam(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
    const rep=state.phase==='joined'&&format?games.replay(format):null,on=!!rep?.active,cut=reduced||!!rep?.calm;
    replayW=on?(cut?1:Math.min(1,replayW+dt/.35)):(cut?0:Math.max(0,replayW-dt/.35));
    if(replayW<=0||!rep||!format)return;
    const fv=venues.find(u=>u.id===format),ball=fieldBall(format);if(!fv||!ball)return;
    if(on){const fresh=rep.serial!==replaySeen;replaySeen=rep.serial;
      // the finish: after the shot (half a second in at least, so the build-up is seen wide), or the last ~1.1 s
      const want=rep.age>.5&&(rep.shotT>=0&&rep.playhead>=rep.shotT||rep.dur-rep.age<1.1)?1:0;
      if(fresh)repTight=0;else repTight=cut?want:repTight+(want-repTight)*Math.min(1,dt*2.2);
      // reduced motion: a held shot, recomputed only when the framing steps (a cut); otherwise every frame, eased below
      if(!cut||fresh||want!==repCutTight){repCutTight=want;
        const gold=rep.scorer==='gold',gy=gold?10:390,ay=liveWorldYaw(fv,0,gold?-1:1),g=fv.elevation??0;
        repShot.bx=ball.position.x;repShot.by=Math.max(g+.3,ball.position.y);repShot.bz=ball.position.z;
        repShot.sx=rep.shooterX>=0?liveWorldX(fv,rep.shooterX,rep.shooterY):NaN;repShot.sz=rep.shooterX>=0?liveWorldZ(fv,rep.shooterX,rep.shooterY):NaN;
        repShot.gx=liveWorldX(fv,135,gy);repShot.gz=liveWorldZ(fv,135,gy);repShot.ax=Math.sin(ay);repShot.az=Math.cos(ay);
        repShot.goalWidth=fv.goalWidth;repShot.goalHeight=fv.goalHeight;repShot.ground=g;
        replayCamFrame(repShot,camera.aspect,cut?want:repTight,repGoal);
        const k=fresh||cut?1:1-Math.exp(-dt*3.2);
        repEye.x+=(repGoal.ex-repEye.x)*k;repEye.y+=(repGoal.ey-repEye.y)*k;repEye.z+=(repGoal.ez-repEye.z)*k;repLook.x+=(repGoal.lx-repLook.x)*k;repLook.y+=(repGoal.ly-repLook.y)*k;repLook.z+=(repGoal.lz-repLook.z)*k;}}
    const p=camera.position;if(!camSaved){camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;}
    camFwd.set(0,0,-1).applyQuaternion(camera.quaternion);const reach=Math.max(4,Math.hypot(p.x-repLook.x,p.y-repLook.y,p.z-repLook.z)),w=replayW*replayW*(3-2*replayW);
    const lx=p.x+camFwd.x*reach,ly=p.y+camFwd.y*reach,lz=p.z+camFwd.z*reach;
    p.set(p.x+(repEye.x-p.x)*w,p.y+(repEye.y-p.y)*w,p.z+(repEye.z-p.z)*w);camera.lookAt(lx+(repLook.x-lx)*w,ly+(repLook.y-ly)*w,lz+(repLook.z-lz)*w);
  }
  /** A replay starts / ends (once each): the REPLAY tag + Skip; the live goal moment's overlays off (the trick pop, the tip, the
   *  goal badge; the field's GOAL! card is hidden by the field runtime); the controls faded (CSS opacity; a tap skips); the
   *  markers in the scoring side's colour for the ball + scorer rings, my bib colour back after. */
  function replayHud(on:boolean,goldScored:boolean){
    hide(el('[data-join-replay]'),!on);set(el('[data-join-actions]'),'data-replaying',on?'':null);{const tc=root()?.querySelector<HTMLElement>('.touch-controls');if(tc){tc.style.transition=on&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'opacity .2s ease-out':'';tc.style.opacity=on?'0':'';}}
    if(on){tipT=0;popT=0;set(el('[data-join-pop]'),'data-show',null);if(format)markers.setColour(bibColour(format,goldScored));}
    else if(colour)markers.setColour(colour);
  }
  /** My goal for the keeper markers (one reused object). */
  const kGoal={x:0,z:0,yaw:0,width:0};
  function keeperGoal(v:typeof view){kGoal.x=v.ownGoalX;kGoal.z=v.ownGoalZ;kGoal.yaw=v.outYaw;kGoal.width=v.goalWidth;return kGoal;}
  /** The drawn ball of a live field (an index walk: no closure per frame). */
  /** Broadcast at rest: on 9v9 / 11v11 slide Town's follow camera toward the ball (liveJoinCamera BALL_LOOK), eased; translation
   *  only, restored by cameraRestore. `view` is this frame's (update ran first). No work on the small pitches once eased to 0. */
  function lookAhead(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
    lookT.x=lookT.z=0;
    if(!reduced&&state.phase==='joined'&&format&&(format==='11v11'||format==='9v9')&&!replayShown){const b=fieldBall(format);if(b)ballLookTarget(format,b.position.x-view.x,b.position.z-view.z,lookT,camera.aspect);}
    if(lookX===0&&lookZ===0&&lookT.x===0&&lookT.z===0)return;
    const k=reduced?1:1-Math.exp(-dt*BALL_LOOK.rate);lookX+=(lookT.x-lookX)*k;lookZ+=(lookT.z-lookZ)*k;
    if(lookT.x===0&&lookT.z===0&&Math.abs(lookX)+Math.abs(lookZ)<.02){lookX=lookZ=0;return;}
    const p=camera.position;if(!camSaved){camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;}p.x+=lookX;p.z+=lookZ;
  }
  function fieldBall(f:LiveFormat){const es=games.entries;for(let i=0;i<es.length;i++)if(es[i].venue.id===f)return es[i].ball;return null;}
  window.addEventListener('pointerdown',onTap,{capture:true,passive:true});
  function popWord(word:string){const pop=el('[data-join-pop]');if(pop){text(pop,word);pop.removeAttribute('data-show');void pop.offsetWidth;pop.setAttribute('data-show','');}popT=.9;}
  /** The aim mark the stick (world direction mx, mz, length len) or a drag on Shoot points at, judged on SCREEN against
   *  where the five marks are drawn (so "left" is the left the kid sees, in every camera angle). Fills aimPts. */
  function pickCorner(mx:number,mz:number,len:number){
    const fv=format?venues.find(u=>u.id===format):null;if(!fv||!cam)return -1;
    const gy=team==='gold'?10:390,y0=fv.elevation??0,gh=fv.goalHeight,half=shotMouthX(135+SHOT_AIM.goalHalf,fv.goalWidth)/fv.width*250;shotGround=y0;// every venue: the marks sit where the shot is drawn landing (shotPlacement maps the sim's GHALF onto the real goal mouth; using the sim's 19 here drew them ~0.3 m wide on 7v7)
    for(let i=0;i<5;i++){const m=AIM_MARKS[i],x=135+m.x*half*SHOT_AIM.inFull;aimPts[i*3]=liveWorldX(fv,x,gy);aimPts[i*3+1]=y0+gh*(m.h>=1?.76:m.h<=0?.3:.52);aimPts[i*3+2]=liveWorldZ(fv,x,gy);}
    const c=cam,asp=(c as T.PerspectiveCamera).aspect||1,P=(i:number,v:T.Vector3)=>v.set(aimPts[i*3],aimPts[i*3+1],aimPts[i*3+2]).project(c);
    P(2,pa);P(3,pb);const lx=(pb.x-pa.x)*asp,ly=pb.y-pa.y;P(0,pc);const vx=(pc.x-pa.x)*asp,vy=pc.y-pa.y;
    let sx=0,sy=0;
    if(joinAim.on&&Math.hypot(joinAim.x,joinAim.y)>=SHOT_AIM.dragPx){const d=Math.hypot(joinAim.x,joinAim.y);sx=joinAim.x/d;sy=-joinAim.y/d;}
    else if(len>.05){pa.set(view.x,y0,view.z).project(c);pb.set(view.x+mx*3,y0,view.z+mz*3).project(c);const dx=(pb.x-pa.x)*asp,dy=pb.y-pa.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,len);sx=dx/d*k;sy=dy/d*k;}
    return pickAimMark(sx,sy,lx,ly,vx,vy);
  }
  /** Play → the picker, with a one-tap default: the side with fewer humans (tie → the side you walked into) and the
   *  position of the nearest free player of that side. */
  function openPick(v:LiveVenue){
    const sim=simOf(v.id);if(!sim)return;pickFormat=v.id;
    const card=el('[data-join-card]');text(el('[data-join-venue]'),`${v.name} · ${v.id==='futsal'?'Futsal':v.id}`.toUpperCase());
    card?.style.setProperty('--bib-gold',bibColour(v.id,true));card?.style.setProperty('--bib-blue',bibColour(v.id,false));
    const at=liveFieldPoint(v,lastX,lastZ);
    const friends=friendsOf?.(v.id)??null;
    pickTeam=pickJoinTeam(friends?sideCounts(sim,friends,counts):sim.humanOn,at.y,LIVE_JOIN_FORMATS[v.id].maxHumansPerTeam)??'gold';
    const avoid=new Set<string>();if(sim.ball.owner)avoid.add(sim.ball.owner);
    const taken=new Set(sim.humans.keys());if(friends)for(const id of friends.keys())taken.add(id);
    const slot=pickSlot(Object.values(sim.players) as SlotCandidate[],pickTeam,at.x,at.y,taken,avoid),r=slot?sim.players[slot].role:'mid';
    pickId=slot;void r;optionsKey='';
    for(const t of TEAMS){text(el(`[data-join-side-name="${t}"]`),teamName(v.id,t));set(el(`[data-join-pill-${t}]`),'aria-label',teamName(v.id,t));}
    if(cam)for(const t of TEAMS){const w=attackWords(cam,v,t);set(el(`[data-join-side="${t}"]`),'title',`${teamName(v.id,t)}: ${w.words.toLowerCase()}`);}
    renderPick();
    // Grow out of the bar's Play like Join with a code (lib/ui/growFrame); reduced motion: no morph.
    const modal=el('[data-join-modal]'),dlg=el('[data-join-card]');closing=false;dlg?.getAnimations().forEach(a=>a.cancel());hide(modal,false);set(root(),'data-live-pick','');
    if(dlg&&playRect&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      dlg.animate([growFrame(playRect,dlg),growFrame(null,dlg)],{duration:GROW_IN_MS,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
      for(const c of Array.from(dlg.firstElementChild?.children??[]))c.animate([{opacity:0},{opacity:1}],{duration:Math.round(GROW_IN_MS*.6),delay:Math.round(GROW_IN_MS*.4),easing:'ease-out',fill:'backwards'});
      modal?.animate([{backgroundColor:'#193f3700'},{backgroundColor:'#193f3766'}],{duration:GROW_IN_MS,fill:'backwards'});
    }
    (el('[data-join-start]') as HTMLButtonElement|null)?.focus({preventScroll:true});
  }
  /** Back / Esc / stepping off: shrink back into the bar's Play, then hide. */
  function shrink(reduced:boolean,after?:()=>void){
    const modal=el('[data-join-modal]'),dlg=el('[data-join-card]');
    // Shrink into the bar's Play where it is now (the bar stays up under the picker), else where it was tapped.
    const live=root()?.querySelector<HTMLElement>('.field-learn-card:not([hidden]) [data-join-play]')?.getBoundingClientRect();if(live&&live.width>0)playRect=live;
    if(!dlg||!modal||modal.hidden||!playRect||reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){if(modal)hide(modal,true);after?.();return;}
    closing=true;
    for(const c of Array.from(dlg.firstElementChild?.children??[]))c.animate([{opacity:1},{opacity:0}],{duration:90,fill:'forwards'});
    modal.animate([{backgroundColor:'#193f3766'},{backgroundColor:'#193f3700'}],{duration:GROW_OUT_MS,fill:'forwards'});
    const a=dlg.animate([growFrame(null,dlg),growFrame(playRect,dlg)],{duration:GROW_OUT_MS,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    const done=()=>{if(!closing)return;closing=false;hide(modal,true);after?.();dlg.getAnimations().forEach(x=>x.cancel());modal.getAnimations().forEach(x=>x.cancel());for(const c of Array.from(dlg.firstElementChild?.children??[]))c.getAnimations().forEach(x=>x.cancel());};
    a.finished.then(done,done);
  }
  /** Side + position state: full sides disabled (maxHumansPerTeam), humans per side, positions taken by humans disabled. */
  function renderPick(){
    const sim=pickFormat?simOf(pickFormat):null;if(!sim||!pickFormat)return;
    const friends=friendsOf?.(pickFormat)??null;friendsKey='x';
    const max=LIVE_JOIN_FORMATS[pickFormat].maxHumansPerTeam,on=friends?sideCounts(sim,friends,counts):sim.humanOn;seenGold=sim.humanOn.gold;seenBlue=sim.humanOn.blue;
    if(on[pickTeam]>=max){const o=pickTeam==='gold'?'blue':'gold';if(on[o]<max)pickTeam=o;}
    for(const t of TEAMS){
      const b=el(`[data-join-side="${t}"]`) as HTMLButtonElement|null,full=on[t]>=max,n=on[t],h=el(`[data-join-humans="${t}"]`);
      if(b){if(b.disabled!==full)b.disabled=full;set(b,'aria-checked',t===pickTeam?'true':'false');}
      hide(h,n===0);text(h,full?'Full':n===1?'1 playing':`${n} playing`);
    }
    // Position dropdown: every slot of this side (keeper first, then back to front, left to right as the side faces);
    // slots held by humans are disabled. Options are rebuilt only when the side or the humans change (taps, not frames).
    // Position dropdown (taps only, never per frame): fresh rows for this side every time, and a default always selected.
    const at=venues.find(u=>u.id===pickFormat),f=at?liveFieldPoint(at,lastX,lastZ):{x:135,y:200};
    pickId=defaultSlot(sim,pickTeam,pickId,f.x,f.y,friends);optionsKey=pickTeam;
    publishSlots(slotOptions(sim,pickTeam,friends,pickFormat),pickId??'');
    set(el('[data-join-sides]'),'data-index',pickTeam==='gold'?'0':'1');
    set(el('[data-join-start]'),'aria-label',`Start: ${teamName(pickFormat,pickTeam)}, ${pickId?slotName(pickId,pickTeam,sim.players[pickId].role,pickFormat):''}`);
    hide(el('[data-join-pick-keeper]'),!(pickId&&sim.players[pickId]?.isGK));// the Goalkeeper pick explains the gloves job
  }
  /** The buttons for now (lib/town/liveControls.ts joinModes; one reused object, read at once by each caller). */
  function modes():JoinModes{return joinModes(view,rangeL,nearL,modeOut);}
  /** The Pass button's mode for a press now: a Pass pressed just after the ball got away still latches Pass (liveControls.graceA). */
  function latchA(now:number):Mode{const cur=modes().a;return cur!==aCurMode?graceA(aCurMode,cur,0):graceA(aPrevMode,cur,now-aChangedAt);}
  const LABEL:Record<Mode,string>={pass:'Pass',shoot:'Shoot',forward:'Forward',call:'Call',tackle:'Tackle',stay:'Stay',go:'Go!',save:'Dive',throw:'Throw',kick:'Kick',trick:'Trick',press:'Press','':''};
  const KEY_HINT:Record<Mode,string>={pass:'Space (hold for a long ball)',shoot:'J (hold for power)',forward:'J or K',call:'Space',tackle:'Space',stay:'J (hold)',go:'Space (hold)',save:'Space (stick picks a side)',throw:'Space (hold for power)',kick:'J or K (hold for power)',trick:'L',press:'P','':''};
  let dock=0,lastRestart=false,lastG=-1,lastB=-1;
  /** Skip a goal replay; a real skip (one was playing) is booked for the admin analytics (Nov 6 2026). */
  function skipRep(f:LiveFormat){if(games.skipReplay(f))api.onMatch?.({type:'replay',skipped:true});}
  /** The match's AI players and humans at the join (counts only, for the admin analytics). */
  function slotsOn(f:LiveFormat){const e=games.entries.find(en=>en.venue.id===f);if(!e)return {};const all=Object.keys(e.sim.players).length,h=e.humans.size;return {bots:Math.max(0,all-h),humans:h};}
  /** Other humans on a field's match right now (party friends; analytics gets the number only). */
  function othersOn(f:LiveFormat){const e=games.entries.find(en=>en.venue.id===f);return Math.max(0,(e?.humans.size??1)-1);}
  function hud(picking:boolean,joined:boolean){
    const card=el('[data-join-card]'),chip=el('[data-join-chip]'),actions=el('[data-join-actions]'),tipEl=el('[data-join-tip]'),app=root();
    hide(el('[data-join-modal]'),!picking&&!closing);set(app,'data-live-pick',picking?'':null);void card;
    hide(chip,!joined);if(!joined)lastG=lastB=-1;if(!joined&&lastRestart){lastRestart=false;chip?.removeAttribute('data-msg');}hide(actions,!joined);hide(el('[data-join-leave]'),!joined);hide(el('[data-join-cam]'),!joined);set(app,'data-live-join',joined?'':null);
    if(joined){
      if(chip&&++dock%30===1){/* dock the bar at the very top, level with the coins bar it replaces (the HUD stack's top varies), measured every ~30 frames */const st=chip.offsetParent as HTMLElement|null,w=root()?.querySelector<HTMLElement>('[data-job-wallet]');if(st&&w){const wr=w.getBoundingClientRect();if(wr.height>0){const t=Math.round(wr.top-st.getBoundingClientRect().top)+'px';if(chip.style.top!==t){chip.style.top=t;chip.style.height=Math.round(wr.height)+'px';tipEl?.style.setProperty('--tip-top',(parseInt(t,10)+Math.round(wr.height)+14)+'px');{const pe=el('[data-join-pop]');/* the pop sits outside the HUD stack (its offsetParent is the app), so measure from its own parent: in stack units it landed on the score bar (phone pass Nov 5 2026) */pe?.style.setProperty('--tip-top',Math.round(wr.bottom-(pe.offsetParent?.getBoundingClientRect().top??0)+14)+'px');}{const re=el('[data-join-replay]');re?.style.setProperty('--tip-top',Math.round(wr.bottom-(re.offsetParent?.getBoundingClientRect().top??0)+14)+'px');}{const ke=el('[data-join-keeper]');ke?.style.setProperty('--tip-top',Math.round(wr.bottom-(ke.offsetParent?.getBoundingClientRect().top??0)+14)+'px');}}}}}
      chip?.style.setProperty('--bib',colour);chip?.style.setProperty('--bib-gold',bibColour(format??'',true));chip?.style.setProperty('--bib-blue',bibColour(format??'',false));actions?.style.setProperty('--bib',colour);
      const e=games.entries.find(en=>en.venue.id===format);if(e){const g=e.sim.score.gold,b=e.sim.score.blue;text(el('[data-join-sg]'),String(g));text(el('[data-join-sb]'),String(b));
        /* a goal: the bar shakes and the scoring side's pill pops (CSS, transform/scale only; a layout read once per goal) */
        if(lastG>=0&&(g>lastG||b>lastB)&&view.keeper)bannerOwed=true;// the keeper banner again at the kick-off
        if(lastG>=0&&(g>lastG||b>lastB)&&chip){chip.removeAttribute('data-goal');void chip.offsetWidth;chip.setAttribute('data-goal',g>lastG?'gold':'blue');window.setTimeout(()=>chip.removeAttribute('data-goal'),1100);}
        if(lastG>=0&&(g>lastG||b>lastB)){api.onMatch?.({type:'goal',mine:(g>lastG?'gold':'blue')===team});phraseHud.goal();}// analytics: a transition, once per goal
        lastG=g;lastB=b;}
      
      const m=modes(),a=el('[data-join-a]'),b=el('[data-join-b]'),now=performance.now();
      // In goal: Dive, or Catch when the shot comes at his body (the same press: the sim decides catch / parry by where it meets him).
      text(el('[data-join-a-label]'),m.a==='save'&&view.catchable?'Catch':LABEL[m.a]||'Wait');set(a,'data-catch',m.a==='save'&&view.catchable?'':null);set(a,'aria-disabled',m.a?null:'true');set(a,'title',m.a?`${LABEL[m.a]} · ${KEY_HINT[m.a]}`:'Get ready for the restart');set(a,'data-mode',m.a||'wait');
      hide(b,!m.b);hide(el('[data-join-s]'),stickSprintEnabled());// push the stick to sprint (setting on): no Sprint button
      text(el('[data-join-b-label]'),LABEL[m.b]);set(b,'title',m.b?`${LABEL[m.b]} · ${KEY_HINT[m.b]}`:'');set(b,'data-mode',m.b);
      // Charge rings: quantised steps, written only when the step changes.
      const ca=held.a&&aDownAt>0&&(aMode==='pass'||aMode==='throw')&&m.a===aMode?Math.round(Math.min(1,(now-aDownAt)/CHARGE_MS)*20):0;if(ca!==chargeA){chargeA=ca;a?.style.setProperty('--charge',CHARGE_STEPS[ca]);}
      const cb=held.b&&bDownAt>0&&(m.b==='shoot'||m.b==='forward'||m.b==='kick')?Math.round(Math.min(1,(now-bDownAt)/CHARGE_MS)*20):0;if(cb!==chargeB){chargeB=cb;b?.style.setProperty('--charge',CHARGE_STEPS[cb]);}
      // Full charge on Shoot = the power shot: the ring turns flame orange and throbs (CSS, transform / opacity only).
      const fb=cb===20&&m.b==='shoot';if(fb!==fullB){fullB=fb;set(b,'data-full',fb?'':null);}
      if(held.s!==heldS){heldS=held.s;set(el('[data-join-s]'),'data-held',heldS?'':null);}
      // Long ball: past LONG_BALL.ms the Pass ring turns purple (the long ball's trail colour).
      const la=held.a&&aDownAt>0&&aMode==='pass'&&m.a==='pass'&&now-aDownAt>=LONG_BALL.ms;if(la!==longA){longA=la;set(a,'data-long',la?'':null);}
      // The charge's haptic ticks (Nov 7 2026; Vibration setting, liveControls.hapticTick: a no-op where the browser cannot
      // vibrate, e.g. iPhone Safari): one buzz as Pass turns into the long ball, one as Pass or Shoot reaches full charge.
      {const ta=ca===20?2:la?1:0,tb=cb===20?1:0;if(ta>tickA)hapticTick(ta===2?HAPTIC.fullMs:HAPTIC.tickMs);if(tb>tickB)hapticTick(HAPTIC.fullMs);tickA=ta;tickB=tb;}
      // Button emphasis (Nov 7 2026, liveControls.hotButton): the ONE good idea now (Shoot in range, Pass to a teammate calling
      // for it, Tackle in reach) gets a soft pulsing ring, the others dim. Attributes on change only; the CSS holds the ring
      // still with reduced motion or Match effects Light (data-calm). The flipped layout mirrors the buttons, so it follows.
      {const hot=view.restart||replayShown||view.keeper?'':hotButton(m,view.onBall&&Number.isFinite(view.passX)&&Math.max(view.callAW,view.callBW)>=OPEN_CALL_W);
        if(hot!==hotShown){hotShown=hot;set(a,'data-hot',hot==='a'?'':null);set(b,'data-hot',hot==='b'?'':null);set(actions,'data-focus',hot?'':null);}
        const calm=matchFxLevel()==='light';if(calm!==calmShown){calmShown=calm;set(actions,'data-calm',calm?'':null);}}
      // Trick (offense) / Press (defense): one button, its mode's colour; the cooldown ring (quantised, written on change).
      const t=el('[data-join-t]');hide(t,!m.c);
      if(m.c){text(el('[data-join-t-label]'),LABEL[m.c]);set(t,'data-mode',m.c);set(t,'title',`${LABEL[m.c]} · ${KEY_HINT[m.c]}`);
        const ct=Math.round(Math.min(1,m.c==='trick'?view.trickCd:view.pressCd)*20);if(ct!==coolT){coolT=ct;t?.style.setProperty('--cool',CHARGE_STEPS[ct]);set(t,'data-cool',ct>0?'':null);}
        set(t,'data-on',(m.c==='trick'?view.trickOn:view.pressOn)?'':null);}
      if(view.restart!==lastRestart){/* the message pushes the scores apart and fades in between them; the text stays while it fades out */
        lastRestart=view.restart;const st=el('[data-join-status]');
        if(view.restart&&st&&chip){text(st,window.innerWidth<600?'Get ready':'Restart: get ready');chip.style.setProperty('--push',Math.round(st.offsetWidth/2+6)+'px');chip.style.setProperty('--msgw',st.offsetWidth+'px');}
        if(chip){if(view.restart)chip.setAttribute('data-msg','');else chip.removeAttribute('data-msg');}
      }
    }
    hide(tipEl,!(tipT>0&&(joined||picking)&&!(joined&&bannerT>0&&!replayShown)));if(tipT>0)text(tipEl,tip);
    {const on=joined&&bannerT>0&&!replayShown;if(on!==keeperShown){keeperShown=on;set(el('[data-join-keeper]'),'data-show',on?'':null);}}// "You're the keeper" (transform / opacity only)
  }
  return api;
}
