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
import {LONG_BALL,AIM_MARKS,SHOT_AIM,SHOT_FX,POWER_SHOT,pickAimMark} from './match/humanInputs';
import {shotMouthX} from './shotPlacement';
import {createJoinCamera,createJoinCamFrame,joinCamFrame,nextJoinCamAngle,isJoinCamAngle,turnStick,JOIN_CAM_LABEL,type JoinCamPitch} from './liveJoinCamera';

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
  wide:'Wide: keep space between you and your teammates.',
  trick:'Fake out the defender: a quick trick, then go past him.',
  press:'Press together: two defenders win the ball back.',
  long:'Hold Pass for a long ball over the defenders.',
  aim:'Hold Shoot and push the stick at a corner. Full charge is a power shot!',
} as const;
type Tip=keyof typeof JOIN_TIPS;
export type JoinButton='a'|'b'|'s'|'f'|'t'|'leave'|'camera'|'play'|'start'|'back'|'dismiss'|'side-gold'|'side-blue';
type Mode='pass'|'shoot'|'forward'|'call'|'tackle'|'stay'|'go'|'save'|'throw'|'kick'|'trick'|'press'|'';
const TEAM_NAME={gold:'Yellow',blue:'Blue'} as const,TEAMS=['gold','blue'] as const;
/** The side names follow the format's bibs (beanLooks LIVE_BIB_KITS): the 9v9 plays in orange / purple, not yellow / blue. */
const TEAM_NAMES:Partial<Record<LiveFormat,{gold:string;blue:string}>>={'9v9':{gold:'Orange',blue:'Purple'},'11v11':{gold:'Cyan',blue:'Orange'},beach:{gold:'Orange',blue:'Blue'}};// beach: BEACH_KITS' orange vs blue shirts
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
const TRICK_WORD={stepover:'Step-over!',croqueta:'La Croqueta!',dragBack:'Drag-back!'} as const;
/** Trick slow motion + zoom (owner Nov 4 2026; human-triggered, local, off with reduced motion): the match runs at
 *  `scale` for `hold` real seconds, then eases back over `ease`; the camera moves `zoom` of the way toward the player. */
const TRICK_FX={scale:.3,hold:.55,ease:.3,zoom:.36,zoomIn:.12} as const;
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
  const goalV=new T.Vector3();
  const state=createJoinState(),view=createHumanView(),markers=createJoinMarkers(scene),venues=LIVE_VENUES.filter(v=>joinableFormat(v.id));
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
  // Trick / Press (owner Nov 4 2026): cooldown ring steps written on change; the trick's popup, slow motion and zoom.
  // Shooting (owner Nov 4 2026): the corner picked while Shoot is held (-1 = auto-aim), the aim marks' world points, the
  // power-shot ring state, and the shot's slow motion + low camera (its own track; Town's one timeScale is the min of both).
  let aimSel=-1,aiming=false,fullB=false,lastShot=-1,lastSlip=-1,shotAge=-1,shotSkip=false,shotW=0,shotFromX=0,shotFromZ=0,shotGoalX=0,shotGoalZ=0,shotGround=0;
  const aimPts=new Float32Array(15),pa=new T.Vector3(),pb=new T.Vector3(),pc=new T.Vector3(),camFwd=new T.Vector3();
  let coolT=-1,longA=false,lastTrick=-1,fxAge=-1,popT=0,timeScale=1,zoomW=0;const fx:JoinSlowMo={...TRICK_FX};
  // Camera angle (owner, Nov 4 2026): one eased controller; Town calls cameraRestore before its follow lerp and
  // cameraApply after its lookAt. Reused objects only (no per-frame allocation).
  const camCtl=createJoinCamera(),camGoal=createJoinCamFrame(),camOut=createJoinCamFrame(),camBase={x:0,y:0,z:0},stickOut={x:0,z:0};
  const camPitch:JoinCamPitch={x:0,z:0,width:1,length:1,yaw:0,ground:0};let camSaved=false,camDelta=0,stickLen=0,stepDt=1/60;
  try{const a=sessionStorage.getItem(CAM_KEY);if(isJoinCamAngle(a)&&a!=='broadcast'){camCtl.angle=a;camCtl.shown=a;}}catch{}
  const dom:Record<string,HTMLElement|null>={};
  const el=(sel:string)=>{const cached=dom[sel];if(cached?.isConnected)return cached;const found=root()?.querySelector<HTMLElement>(sel)??null;dom[sel]=found;return found;};
  const set=(e:HTMLElement|null,attr:string,value:string|null)=>{if(!e)return;if(value===null){if(e.hasAttribute(attr))e.removeAttribute(attr);}else if(e.getAttribute(attr)!==value)e.setAttribute(attr,value);};
  const text=(e:HTMLElement|null,value:string)=>{if(e&&e.textContent!==value)e.textContent=value;};
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
    friendsChanged(){friendsKey='';},
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
    press(b:JoinButton,down:boolean){
      if(b==='s'){held.s=down;return;}
      if(b==='f'){if(down)forwardKey=true;return;}
      if(b==='t'){if(down)pressed.t=true;return;}
      if(down&&shotAge>.12)shotSkip=true;// any tap skips the shot's slow motion
      if(b==='b'&&down){joinAim.x=joinAim.y=0;joinAim.on=false;aimSel=-1;}
      if(b==='a'||b==='b'){if(down&&!held[b]){pressed[b]=true;if(b==='a'){aDownAt=performance.now();aMode=modes().a;}else bDownAt=performance.now();}held[b]=down;return;}
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
     *  a HELD state (Shift; the HUD Sprint button arrives through press('s')), never the stick's magnitude. */
    steer(ix:number,iz:number,keys:ReadonlySet<string>,sprint:boolean){
      if(state.phase!=='joined'||!format)return;
      const ka=keys.has(' '),kb=keys.has('j'),kk=keys.has('k'),kl=keys.has('l'),kp=keys.has('p'),ke=keys.has('escape');
      if(ka&&!keyPrev.a)api.press('a',true);if(!ka&&keyPrev.a)api.press('a',false);
      if(kb&&!keyPrev.b)api.press('b',true);if(!kb&&keyPrev.b)api.press('b',false);
      if(kk&&!keyPrev.k)forwardKey=true;if(kl&&!keyPrev.l)trickKey=true;if(kp&&!keyPrev.p)pressKey=true;if(ke&&!keyPrev.esc)pressed.leave=true;
      keyPrev.a=ka;keyPrev.b=kb;keyPrev.k=kk;keyPrev.l=kl;keyPrev.p=kp;keyPrev.esc=ke;
      games.humanView(format,ME,view);
      const mode=modes(),now=performance.now(),aDown=pressed.a,bDown=pressed.b,bUp=!held.b&&bDownAt>0,aUp=!held.a&&aDownAt>0;
      // Hold-to-charge (owner, Nov 4 2026): Shoot AND Pass strike on RELEASE; the longer the hold, the more power.
      const holdS=bUp?Math.min(1,(now-bDownAt)/CHARGE_MS):0,bHoldMs=bUp?now-bDownAt:held.b&&bDownAt>0?now-bDownAt:0;if(bUp&&(mode.b==='shoot'||mode.b==='forward'||mode.b==='kick'))bDownAt=0;else if(!held.b)bDownAt=0;
      const holdMs=aUp?now-aDownAt:0,holdA=aUp?Math.min(1,holdMs/CHARGE_MS):0,passNow=aUp&&(aMode==='pass'||aMode==='throw')&&mode.a===aMode;
      // Long ball (owner Nov 4 2026): Pass held past LONG_BALL.ms lofts it; the charge grows to the full hold (a tap stays the ground pass).
      const long=passNow&&aMode==='pass'&&holdMs>=LONG_BALL.ms?Math.max(.05,Math.min(1,(holdMs-LONG_BALL.ms)/(LONG_BALL.fullMs-LONG_BALL.ms))):0;if(aUp){aDownAt=0;aMode='';}
      const tTap=pressed.t,trick=(tTap||trickKey)&&mode.c==='trick',pressNow=(tTap||pressKey)&&mode.c==='press';
      // Screen-relative in every camera angle: the stick turns with the camera (held through an angle change while pushed).
      stickLen=Math.hypot(ix,iz);turnStick(ix,iz,camCtl.control(stepDt,camDelta,stickLen),stickOut);ix=stickOut.x;iz=stickOut.z;
      const len=stickLen,mx=len>1?ix/len:ix,mz=len>1?iz/len:iz;
      const forwardB=bUp&&(mode.b==='forward'||mode.b==='kick');// a keeper's Kick is the long (Forward) ball
      // Aimed shot: while Shoot is held past SHOT_AIM.minHoldMs the stick (or a drag on the button) picks a corner mark;
      // a quicker tap stays the auto-aimed shot. The pick is kept through the release frame.
      aiming=mode.b==='shoot'&&bHoldMs>=SHOT_AIM.minHoldMs&&(held.b||bUp);if(aiming&&held.b){aimSel=pickCorner(mx,mz,len);if(aimSel>=0)showTip('aim');}
      const aimMark=bUp&&mode.b==='shoot'&&bHoldMs>=SHOT_AIM.minHoldMs&&aimSel>=0?AIM_MARKS[aimSel]:null;if(bUp)aiming=false;
      games.humanInput(format,ME,mx,mz,{
        pass:passNow,passPower:passNow&&!long?holdA:forwardB?holdS:0,long,trick,press:pressNow,
        through:forwardKey&&view.onBall||forwardB,
        shoot:bUp&&mode.b==='shoot',shootPower:.7+.3*holdS,aimX:aimMark?aimMark.x:NaN,aimH:aimMark?aimMark.h:NaN,
        tackle:aDown&&mode.a==='tackle',
        call:aDown&&mode.a==='call',
        save:aDown&&mode.a==='save',
        jockey:held.b&&mode.b==='stay',
        sprint:sprint||held.s||held.a&&mode.a==='go',
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
      const on=venueAt(x,z,JOIN_PITCH_MARGIN),ev=stepJoin(state,{onPitch:!!on&&(state.phase!=='pick'||!pickFormat||on.id===pickFormat)/* a teleport onto another pitch with the picker open: cancel, never a stale side + slot list */,canOffer,canJoin,play:pressed.play,start:pressed.start,dismiss:pressed.dismiss,leave:pressed.leave||forceLeave});pressed.play=pressed.start=pressed.dismiss=pressed.leave=false;
      if(ev)api.lastEvent=ev+(ev==='cancel'?(venueAt(x,z,JOIN_PITCH_MARGIN)?':busy':':stepped-off'):'');
      if(ev==='pick'&&v)openPick(v);
      if(ev==='join'&&pickFormat){const f=pickFormat,pick={team:pickTeam,slot:pickId};pickFormat=null;
        // Start: the picker shrinks back into the bar's Play first (the Join with a code close), then the slot is taken and Town's arrival plays.
        shrink(reduced,()=>{if(state.phase!=='joined')return;const slot=games.joinMatch(f,ME,x,z,dressFor,null,pick);if(!slot){api.lastEvent='join-failed';state.phase='idle';return;}format=f;games.humanView(format,ME,view);team=view.team;colour=bibColour(format,team==='gold');markers.setColour(colour);if(f==='beach'&&!view.keeper){tip=BEACH_JOIN_TIP;tipT=3.6;}/* no bibs on sand: the format's own lesson */else showTip(view.keeper?'save':'join',false);});}
      if(ev==='leave'){lastTrick=-1;fxAge=-1;if(format){left=games.leaveMatch(format,ME,{x:0,z:0});}format=null;markers.hide();pin(0,0,0,null);held.a=held.b=held.s=false;aDownAt=bDownAt=0;hide(el('[data-join-badge]'),true);}
      if(ev==='cancel'||ev==='dismiss'){pickFormat=null;shrink(reduced);}
      // Friends-ready: a side filling up while the picker is open (slice 2's remote humans) re-renders the pick.
      if(state.phase==='pick'&&pickFormat){const sim=simOf(pickFormat);if(sim&&(sim.humanOn.gold!==seenGold||sim.humanOn.blue!==seenBlue||friendsKey===''))renderPick();text(el('[data-join-start]'),state.startPending?'Landing…':'Start');}
      // ---- markers + HUD ----
      if(state.phase==='joined'&&format&&games.humanView(format,ME,view)){
        const fv=venues.find(u=>u.id===format)!,y=fv.elevation??0;
        markers.you(view.x,y,view.z,Math.atan2(view.goalX-view.x,view.goalZ-view.z));
        markers.passTarget(view.onBall?view.passX:NaN,y,view.passZ,time,reduced);
        const fwd=view.onBall&&!view.inShotRange&&view.forwardX!==view.passX;markers.forwardTarget(fwd?view.forwardX:NaN,y,view.forwardZ,Math.atan2(view.goalX-view.forwardX,view.goalZ-view.forwardZ));
        pin(view.x,y,view.z,colour);
        // Fallback direction cue: a goal badge at the screen edge while the goal you attack is off screen.
        goalV.set(view.goalX,y+1,view.goalZ).project(camera);const behind=goalV.z>1,gx=behind?-goalV.x:goalV.x,gy=behind?-goalV.y:goalV.y,off=behind||Math.abs(gx)>.94||Math.abs(gy)>.9;
        const badge=el('[data-join-badge]');hide(badge,!off);
        if(off&&badge){const k=Math.max(Math.abs(gx)/.86,Math.abs(gy)/.74,1);badge.style.left=((gx/k+1)*50).toFixed(1)+'%';badge.style.top=((1-gy/k)*50).toFixed(1)+'%';badge.style.setProperty('--bib',colour);}
        // A trick (owner Nov 4 2026): the popup word, and (not reduced) a short slow motion with the camera zoomed in.
        if(view.trickSerial!==lastTrick){const fresh=lastTrick>=0&&view.trickSerial>0;lastTrick=view.trickSerial;if(fresh){const pop=el('[data-join-pop]');if(pop){text(pop,TRICK_WORD[view.trickKind]);pop.removeAttribute('data-show');void pop.offsetWidth;pop.setAttribute('data-show','');}popT=.9;if(!reduced)api.slowMo(TRICK_FX);}}
        // A shot of his (owner Nov 4 2026): "Power shot!" at full charge; from the shooting zone a power or aimed shot plays
        // the slow motion with the low camera behind the shot (not with reduced motion). A slip away: "Slipped away!".
        if(view.shotSerial!==lastShot){const fresh=lastShot>=0&&view.shotSerial>0;lastShot=view.shotSerial;if(fresh){
          if(view.shotPw>=POWER_SHOT.full)popWord('Power shot!');
          if(!reduced&&view.inShotRange&&(view.shotAimed||view.shotPw>=SHOT_FX.minCharge)){shotAge=0;shotSkip=false;shotFromX=view.x;shotFromZ=view.z;shotGoalX=view.goalX;shotGoalZ=view.goalZ;shotGround=y;}}}
        if(view.slipSerial!==lastSlip){const fresh=lastSlip>=0&&view.slipSerial>0;lastSlip=view.slipSerial;if(fresh)popWord('Slipped away!');}
        markers.aim(aiming&&view.onBall?aimPts:null,aimSel,camera,time,reduced);
        if(view.callOpen!==lastCallOpen){lastCallOpen=view.callOpen;if(view.callOpen===false){tip=JOIN_TIPS.notOpen;tipT=2.6;}}
        // Beach: the sim's restart toasts for my slot, and full time. A level game ends in a shoot-out the sim plays at once
        // (humans cannot take it): "Penalties!" with the result while I watch the full-time beat, then the next game kicks off.
        {const e=games.entries.find(en=>en.venue.id===format),sim=e?.sim;if(e&&sim?.isBeach){const n=sim.humanNote,k=sim.results.length;
          if(noteSeen<0)noteSeen=n.serial;else if(n.serial!==noteSeen){noteSeen=n.serial;if(n.id===e.humans.get(ME)?.slot){tip=n.text;tipT=3.2;}}
          if(resultsSeen<0)resultsSeen=k;else if(k!==resultsSeen){resultsSeen=k;const r=sim.results[k-1],s=r.pens??r,w=teamName(format,s.gold>s.blue?'gold':'blue'),hi=Math.max(s.gold,s.blue),lo=Math.min(s.gold,s.blue);
            popWord(r.pens?'Penalties!':'Full time!');tip=r.pens?`Penalties! ${w} win the shoot-out ${hi}–${lo}. Shoot-outs are played for you`:`Full time: ${w} win ${hi}–${lo}. Next game kicks off soon`;tipT=3.4;}}}
      }
      else noteSeen=resultsSeen=-1;
      tipT=Math.max(0,tipT-dt);
      if(popT>0){popT-=dt;if(popT<=0)set(el('[data-join-pop]'),'data-show',null);}
      // Trick slow motion + zoom: Town scales the field runtime's dt by timeScale and cameraApply eases the zoom.
      if(fxAge>=0&&state.phase==='joined'&&!reduced){fxAge+=dt;const out=fxAge-fx.hold,e=out<=0?0:Math.min(1,out/fx.ease),s=e*e*(3-2*e);
        timeScale=fx.scale+(1-fx.scale)*s;const zi=Math.min(1,fxAge/Math.max(.01,fx.zoomIn));zoomW=zi*zi*(3-2*zi)*(1-s);if(e>=1){fxAge=-1;timeScale=1;zoomW=0;}}
      else{fxAge=-1;timeScale=1;zoomW=0;}
      // Shot slow motion (human shots only): SHOT_FX.scale for SHOT_FX.hold real s while the ball flies, then back over
      // SHOT_FX.ease; ends early on a tap, a save / any touch, or a goal (the score bar's goal shake then plays).
      if(shotAge>=0&&state.phase==='joined'&&format&&!reduced){shotAge+=dt;const sim=simOf(format);
        if(shotAge<SHOT_FX.hold&&(shotSkip||shotAge>.15&&sim&&(sim.ball.owner!==null||sim.goalHold>0)))shotAge=SHOT_FX.hold;shotSkip=false;
        const out=shotAge-SHOT_FX.hold,e=out<=0?0:Math.min(1,out/SHOT_FX.ease),s=e*e*(3-2*e),wi=Math.min(1,shotAge/SHOT_FX.in);
        timeScale=Math.min(timeScale,SHOT_FX.scale+(1-SHOT_FX.scale)*s);shotW=wi*wi*(3-2*wi)*(1-s);if(e>=1){shotAge=-1;shotW=0;}}
      else{shotAge=-1;shotW=0;}
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
    get timeScale(){return format&&games.shared(format)?1:timeScale;},// friends on my match: no slow motion (it would slow their game too)
    /** The shared slow-motion hook (owner Nov 4 2026): run the joined match at `scale` for `hold` real s, ease back over
     *  `ease`, with the camera `zoom` of the way to you. Joined only; ignored with reduced motion (Town's matchMedia). */
    slowMo(o:JoinSlowMo){if(state.phase!=='joined'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;fx.scale=o.scale;fx.hold=o.hold;fx.ease=o.ease;fx.zoom=o.zoom;fx.zoomIn=o.zoomIn;fxAge=0;},
    /** 0..1: the trick's camera zoom toward the player (headless checks). */
    get zoom(){return zoomW;},
    /** 0..1: the shot camera's weight; and the corner picked while Shoot is held (-1 auto) (headless checks). */
    get shotCam(){return shotW;},
    get aimMark(){return aimSel;},
    /** Town, after its fixed-direction lookAt: the chosen angle, then the trick's zoom (moves the camera along its line to
     *  the player, so the framing holds; restored by cameraRestore). No work when neither is on. */
    cameraApply(camera:T.PerspectiveCamera,dt:number,reduced:boolean){
      api.cameraAngleApply(camera,dt,reduced);
      if(zoomW<=0&&shotW<=0||state.phase!=='joined'||!format||!games.humanView(format,ME,view))return;
      const p=camera.position;if(!camSaved){camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;}
      if(zoomW>0){const fv=venues.find(u=>u.id===format),g=(fv?.elevation??0)+1,k=fx.zoom*zoomW;
        p.set(p.x+(view.x-p.x)*k,p.y+(g-p.y)*k,p.z+(view.z-p.z)*k);}
      if(shotW>0){// the shot camera: low, behind where it was struck, looking at the goal; eased by shotW
        let dx=shotGoalX-shotFromX,dz=shotGoalZ-shotFromZ;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
        const w=shotW,ex=shotFromX-dx*SHOT_FX.back-dz*SHOT_FX.side,ey=shotGround+SHOT_FX.up,ez=shotFromZ-dz*SHOT_FX.back+dx*SHOT_FX.side;
        camFwd.set(0,0,-1).applyQuaternion(camera.quaternion);const reach=Math.max(4,Math.hypot(p.x-view.x,p.y-shotGround,p.z-view.z));
        const lx=p.x+camFwd.x*reach,ly=p.y+camFwd.y*reach,lz=p.z+camFwd.z*reach;
        p.set(p.x+(ex-p.x)*w,p.y+(ey-p.y)*w,p.z+(ez-p.z)*w);
        camera.lookAt(lx+(shotGoalX-lx)*w,ly+(shotGround+1-ly)*w,lz+(shotGoalZ-lz)*w);}
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
      if(!goal&&camCtl.w<=0){camDelta=0;return;}// Broadcast at rest (or not joined): no work at all
      camCtl.step(dt,reduced,goal);
      if(camCtl.w<=0){camDelta=0;return;}
      const p=camera.position;camBase.x=p.x;camBase.y=p.y;camBase.z=p.z;camSaved=true;
      camDelta=camCtl.blend(p.x,p.y,p.z,camOut);p.set(camOut.ex,camOut.ey,camOut.ez);camera.lookAt(camOut.lx,camOut.ly,camOut.lz);
    },
    dispose(){markers.dispose();window.removeEventListener('keydown',onKey,true);window.removeEventListener('pointerdown',onTap,true);},
  };
  // Keyboard: Enter on a joinable pitch = Play; in the picker Enter / Space = Start, Esc = back to the bar. A capture
  // listener so the walk's Space shot never fires behind the picker; a focused button keeps its own Enter / Space.
  function onKey(e:KeyboardEvent){
    if(shotAge>.12)shotSkip=true;// any key skips the shot's slow motion
    if(typingTarget(e.target)||e.target instanceof HTMLButtonElement&&e.key!=='Escape'||(e.target as Element|null)?.closest?.('[role=listbox]'))return;// the position list keeps its own keys
    if(state.phase==='idle'){if(e.key==='Enter'&&!e.repeat&&venueAt(lastX,lastZ,JOIN_PITCH_MARGIN)){e.preventDefault();e.stopPropagation();api.press('play',true);}return;}
    if(state.phase==='joined'){if((e.key==='c'||e.key==='C')&&!e.repeat&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();e.stopPropagation();api.press('camera',true);}return;}
    if(state.phase!=='pick'||!pickFormat)return;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();api.press('dismiss',true);return;}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)api.press('start',true);}
  }
  window.addEventListener('keydown',onKey,true);
  // A tap anywhere skips the shot's slow motion (passive; nothing else is done with it).
  function onTap(){if(shotAge>.12)shotSkip=true;}
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
  }
  function modes():{a:Mode;b:Mode;c:Mode}{
    if(view.restart&&!view.onBall)return {a:'',b:'',c:''};
    // In goal (human keeper): Save (dive, aimed at the shot) whenever the other side has it or it is loose; Throw / Kick on the ball.
    if(view.keeper)return view.possession==='mine'?{a:view.hands?'throw':'pass',b:'kick',c:''}:view.possession==='team'?{a:'call',b:'',c:''}:{a:'save',b:'',c:''};
    switch(view.possession){
      case 'mine':return {a:'pass',b:'shoot',c:'trick'};// Trick (owner Nov 4 2026): a dribbling trick
      case 'team':return {a:'call',b:'',c:''};
      case 'opp':return {a:'tackle',b:'stay',c:'press'};// Press: two teammates press the carrier together
      default:return {a:'go',b:'',c:''};
    }
  }
  const LABEL:Record<Mode,string>={pass:'Pass',shoot:'Shoot',forward:'Forward',call:'Call',tackle:'Tackle',stay:'Stay',go:'Go!',save:'Save',throw:'Throw',kick:'Kick',trick:'Trick',press:'Press','':''};
  const KEY_HINT:Record<Mode,string>={pass:'Space (hold for a long ball)',shoot:'J (hold for power)',forward:'J or K',call:'Space',tackle:'Space',stay:'J (hold)',go:'Space (hold)',save:'Space',throw:'Space (hold for power)',kick:'J or K (hold for power)',trick:'L',press:'P','':''};
  let dock=0,lastRestart=false,lastG=-1,lastB=-1;
  function hud(picking:boolean,joined:boolean){
    const card=el('[data-join-card]'),chip=el('[data-join-chip]'),actions=el('[data-join-actions]'),tipEl=el('[data-join-tip]'),app=root();
    hide(el('[data-join-modal]'),!picking&&!closing);set(app,'data-live-pick',picking?'':null);void card;
    hide(chip,!joined);if(!joined)lastG=lastB=-1;if(!joined&&lastRestart){lastRestart=false;chip?.removeAttribute('data-msg');}hide(actions,!joined);hide(el('[data-join-leave]'),!joined);hide(el('[data-join-cam]'),!joined);set(app,'data-live-join',joined?'':null);
    if(joined){
      if(chip&&++dock%30===1){/* dock the bar at the very top, level with the coins bar it replaces (the HUD stack's top varies), measured every ~30 frames */const st=chip.offsetParent as HTMLElement|null,w=root()?.querySelector<HTMLElement>('[data-job-wallet]');if(st&&w){const wr=w.getBoundingClientRect();if(wr.height>0){const t=Math.round(wr.top-st.getBoundingClientRect().top)+'px';if(chip.style.top!==t){chip.style.top=t;chip.style.height=Math.round(wr.height)+'px';tipEl?.style.setProperty('--tip-top',(parseInt(t,10)+Math.round(wr.height)+14)+'px');}}}}
      chip?.style.setProperty('--bib',colour);chip?.style.setProperty('--bib-gold',bibColour(format??'',true));chip?.style.setProperty('--bib-blue',bibColour(format??'',false));actions?.style.setProperty('--bib',colour);
      const e=games.entries.find(en=>en.venue.id===format);if(e){const g=e.sim.score.gold,b=e.sim.score.blue;text(el('[data-join-sg]'),String(g));text(el('[data-join-sb]'),String(b));
        /* a goal: the bar shakes and the scoring side's pill pops (CSS, transform/scale only; a layout read once per goal) */
        if(lastG>=0&&(g>lastG||b>lastB)&&chip){chip.removeAttribute('data-goal');void chip.offsetWidth;chip.setAttribute('data-goal',g>lastG?'gold':'blue');window.setTimeout(()=>chip.removeAttribute('data-goal'),1100);}
        lastG=g;lastB=b;}
      
      const m=modes(),a=el('[data-join-a]'),b=el('[data-join-b]'),now=performance.now();
      text(el('[data-join-a-label]'),LABEL[m.a]||'Wait');set(a,'aria-disabled',m.a?null:'true');set(a,'title',m.a?`${LABEL[m.a]} · ${KEY_HINT[m.a]}`:'Get ready for the restart');set(a,'data-mode',m.a||'wait');
      hide(b,!m.b);hide(el('[data-join-f]'),view.possession!=='mine'||view.keeper);// a keeper's long ball is B (Kick)
      text(el('[data-join-b-label]'),LABEL[m.b]);set(b,'title',m.b?`${LABEL[m.b]} · ${KEY_HINT[m.b]}`:'');set(b,'data-mode',m.b);
      // Charge rings: quantised steps, written only when the step changes.
      const ca=held.a&&aDownAt>0&&(aMode==='pass'||aMode==='throw')&&m.a===aMode?Math.round(Math.min(1,(now-aDownAt)/CHARGE_MS)*20):0;if(ca!==chargeA){chargeA=ca;a?.style.setProperty('--charge',CHARGE_STEPS[ca]);}
      const cb=held.b&&bDownAt>0&&(m.b==='shoot'||m.b==='forward'||m.b==='kick')?Math.round(Math.min(1,(now-bDownAt)/CHARGE_MS)*20):0;if(cb!==chargeB){chargeB=cb;b?.style.setProperty('--charge',CHARGE_STEPS[cb]);}
      // Full charge on Shoot = the power shot: the ring turns flame orange and throbs (CSS, transform / opacity only).
      const fb=cb===20&&m.b==='shoot';if(fb!==fullB){fullB=fb;set(b,'data-full',fb?'':null);}
      if(held.s!==heldS){heldS=held.s;set(el('[data-join-s]'),'data-held',heldS?'':null);}
      // Long ball: past LONG_BALL.ms the Pass ring turns purple (the long ball's trail colour).
      const la=held.a&&aDownAt>0&&aMode==='pass'&&m.a==='pass'&&now-aDownAt>=LONG_BALL.ms;if(la!==longA){longA=la;set(a,'data-long',la?'':null);}
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
    hide(tipEl,!(tipT>0&&(joined||picking)));if(tipT>0)text(tipEl,tip);
  }
  return api;
}
