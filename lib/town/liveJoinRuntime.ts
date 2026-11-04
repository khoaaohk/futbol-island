// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md): Town's glue between the walk, the live
// field runtime (fieldRuntime joinMatch / humanInput / humanView / leaveMatch), the on-pitch markers and the HUD
// (components/LiveJoinHud.tsx). Solo play now, but everything is keyed by a human id so the multiplayer slice adds
// remote humans without touching this flow.
// Heat: when you are not near a joinable pitch this costs one rectangle test per frame and no DOM writes; while
// joined it writes a handful of attributes only when they change, and the markers are ≤ 4 draw calls.
import * as T from 'three';
import {createJoinState,stepJoin,joinProgress,pickJoinTeam,LIVE_JOIN_FORMATS,joinableFormat,JOIN_COUNTDOWN} from './liveJoin';
import {LIVE_VENUES,liveFieldPoint,liveWorldYaw,type LiveFormat,type LiveVenue} from './venues';
import {bibColour,type BeanDress,type MatchKits} from './beanLooks';
import {createHumanView,type createFieldRuntime} from './fieldRuntime';
import {createJoinMarkers} from '../graphics/joinMarkers';

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
} as const;
type Tip=keyof typeof JOIN_TIPS;
export type JoinButton='a'|'b'|'leave'|'skip';
type Mode='pass'|'shoot'|'forward'|'call'|'tackle'|'stay'|'go'|'';
const TEAM_NAME={gold:'Yellow',blue:'Blue'} as const;
const TIP_KEY='fi-join-tips-v1';

export function createLiveJoin(scene:T.Scene,games:Games,root:()=>HTMLElement|null){
  const goalV=new T.Vector3();
  const state=createJoinState(),view=createHumanView(),markers=createJoinMarkers(scene),venues=LIVE_VENUES.filter(v=>joinableFormat(v.id));
  let format:LiveFormat|null=null,countdownFormat:LiveFormat|null=null,team:'gold'|'blue'='gold',colour='#ffd23f';
  let seen=new Set<string>();try{seen=new Set(JSON.parse(localStorage.getItem(TIP_KEY)??'[]'));}catch{}
  let tip='',tipT=0,lastCallOpen:boolean|null=null;
  // Buttons: touch (HUD) and keys feed one press state. A/B are edge-triggered; holds (Stay, Go, Shoot power) read `held`.
  const held={a:false,b:false},pressed={a:false,b:false,leave:false,skip:false};let bDownAt=0,keyPrev={a:false,b:false,k:false,esc:false},forwardKey=false;
  const dom:Record<string,HTMLElement|null>={};
  const el=(sel:string)=>{const cached=dom[sel];if(cached?.isConnected)return cached;const found=root()?.querySelector<HTMLElement>(sel)??null;dom[sel]=found;return found;};
  const set=(e:HTMLElement|null,attr:string,value:string|null)=>{if(!e)return;if(value===null){if(e.hasAttribute(attr))e.removeAttribute(attr);}else if(e.getAttribute(attr)!==value)e.setAttribute(attr,value);};
  const text=(e:HTMLElement|null,value:string)=>{if(e&&e.textContent!==value)e.textContent=value;};
  const hide=(e:HTMLElement|null,hidden:boolean)=>{if(e&&e.hidden!==hidden)e.hidden=hidden;};
  const showTip=(k:Tip,always=false)=>{if(!always&&seen.has(k))return;seen.add(k);try{localStorage.setItem(TIP_KEY,JSON.stringify([...seen]));}catch{}tip=JOIN_TIPS[k];tipT=3.6;};
  const venueAt=(x:number,z:number):LiveVenue|null=>{for(const v of venues)if(Math.abs(x-v.x)<=v.width/2&&Math.abs(z-v.z)<=v.length/2)return v;return null;};
  /** Screen words for "which goal": the attack goal projected against you on screen. */
  const attackWords=(camera:T.Camera,v:LiveVenue,t:'gold'|'blue')=>{
    // Gold attacks sim y 8: on the island pitches that is world north, which the fixed camera shows up the screen.
    const yaw=liveWorldYaw(v,0,t==='gold'?-1:1),dx=Math.sin(yaw),dz=Math.cos(yaw);
    const e=(camera as T.PerspectiveCamera).matrixWorld.elements,fx=-e[8],fz=-e[10],up=dx*fx+dz*fz;// camera forward on the ground ≈ up the screen
    return up>=0?{arrow:'▲',words:'Score in the top goal'}:{arrow:'▼',words:'Score in the bottom goal'};
  };
  const api={
    /** Last machine event (headless checks). */
    lastEvent:'',
    get joined(){return state.phase==='joined';},
    get counting(){return state.phase==='countdown';},
    get format(){return format;},
    press(b:JoinButton,down:boolean){if(b==='a'||b==='b'){if(down&&!held[b]){pressed[b]=true;if(b==='b')bDownAt=performance.now();}held[b]=down;}else if(down)pressed[b]=true;},
    /** World point to keep the camera / Town location on while joined (null when not joined). */
    position(out:{x:number;z:number}){if(state.phase!=='joined'||!format||!games.humanView(format,ME,view))return null;out.x=view.x;out.z=view.z;return out;},
    /** Feed the stick (world direction, |v| ≤ ~1) and keys; called from Town's movement step while joined. */
    steer(ix:number,iz:number,keys:ReadonlySet<string>,sprint:boolean){
      if(state.phase!=='joined'||!format)return;
      const ka=keys.has(' '),kb=keys.has('j'),kk=keys.has('k'),ke=keys.has('escape');
      if(ka&&!keyPrev.a)api.press('a',true);if(!ka&&keyPrev.a)api.press('a',false);
      if(kb&&!keyPrev.b)api.press('b',true);if(!kb&&keyPrev.b)api.press('b',false);
      if(kk&&!keyPrev.k)forwardKey=true;if(ke&&!keyPrev.esc)pressed.leave=true;
      keyPrev.a=ka;keyPrev.b=kb;keyPrev.k=kk;keyPrev.esc=ke;
      games.humanView(format,ME,view);
      const mode=modes(),aDown=pressed.a,bUp=!held.b&&bDownAt>0,bDown=pressed.b;
      const holdS=bUp?Math.min(1,(performance.now()-bDownAt)/700):0;if(bUp&&(mode.b==='shoot'||mode.b==='forward'))bDownAt=0;else if(!held.b)bDownAt=0;
      const len=Math.hypot(ix,iz),mx=len>1?ix/len:ix,mz=len>1?iz/len:iz;
      games.humanInput(format,ME,mx,mz,{
        pass:aDown&&mode.a==='pass',
        through:forwardKey&&view.onBall||bUp&&mode.b==='forward',
        shoot:bUp&&mode.b==='shoot',shootPower:.45+.55*holdS,
        tackle:aDown&&mode.a==='tackle',
        call:aDown&&mode.a==='call',
        jockey:held.b&&mode.b==='stay',
        sprint:sprint||held.a&&mode.a==='go',
      });
      if(aDown&&mode.a)showTip(mode.a as Tip);if(bDown&&mode.b)showTip(mode.b as Tip);if(forwardKey&&view.onBall)showTip('forward');
      pressed.a=pressed.b=false;forwardKey=false;
    },
    /** Per frame from Town (after the walk step): the countdown, join/leave, markers and HUD. Returns the leave point
     *  once when the player leaves (Town puts the avatar and ball there). */
    update(dt:number,time:number,x:number,z:number,eligible:boolean,camera:T.Camera,reduced:boolean,dressFor:(home:boolean,kits:MatchKits|undefined)=>BeanDress,pin:(x:number,y:number,z:number,colour:string|null)=>void,forceLeave=false){
      let left:{x:number;z:number}|null=null;
      const v=state.phase==='joined'&&format?venues.find(u=>u.id===format)??null:venueAt(x,z);
      if(!v&&state.phase==='idle'&&!state.needExit){if(countdownFormat){countdownFormat=null;hud(false,false);}return null;}
      const ev=stepJoin(state,{inField:!!venueAt(x,z),eligible,skip:pressed.skip,leave:pressed.leave||forceLeave},dt);pressed.skip=pressed.leave=false;if(ev)api.lastEvent=ev+(ev==='cancel'?(venueAt(x,z)?':ineligible':':stepped-off'):'');
      if(ev==='start'&&v){countdownFormat=v.id;const sim=games.entries.find(e=>e.venue.id===v.id)!.sim,at=liveFieldPoint(v,x,z);team=pickJoinTeam(sim.humanOn,at.y,LIVE_JOIN_FORMATS[v.id].maxHumansPerTeam)??'gold';colour=bibColour(v.id,team==='gold');
        const words=attackWords(camera,v,team);const card=el('[data-join-card]');set(card,'data-team',team);card?.style.setProperty('--bib',colour);text(el('[data-join-team]'),`You're joining ${TEAM_NAME[team]}`);text(el('[data-join-arrow]'),words.arrow);text(el('[data-join-goal]'),words.words);}
      if(ev==='join'&&countdownFormat){const slot=games.joinMatch(countdownFormat,ME,x,z,dressFor);if(!slot)api.lastEvent='join-failed';if(slot){format=countdownFormat;games.humanView(format,ME,view);team=view.team;colour=bibColour(format,team==='gold');markers.setColour(colour);showTip('join',false);}else{state.phase='idle';state.needExit=true;}}
      if(ev==='leave'){if(format){left=games.leaveMatch(format,ME,{x:0,z:0});}format=null;markers.hide();pin(0,0,0,null);held.a=held.b=false;hide(el('[data-join-badge]'),true);}
      if(ev==='cancel')countdownFormat=null;
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
        if(view.callOpen!==lastCallOpen){lastCallOpen=view.callOpen;if(view.callOpen===false){tip=JOIN_TIPS.notOpen;tipT=2.6;}}
      }
      tipT=Math.max(0,tipT-dt);
      hud(state.phase==='countdown',state.phase==='joined');
      return left;
    },
    dispose(){markers.dispose();},
  };
  function modes():{a:Mode;b:Mode}{
    if(view.restart&&!view.onBall)return {a:'',b:''};
    switch(view.possession){
      case 'mine':return {a:'pass',b:view.inShotRange?'shoot':'forward'};
      case 'team':return {a:'call',b:''};
      case 'opp':return {a:'tackle',b:'stay'};
      default:return {a:'go',b:''};
    }
  }
  const LABEL:Record<Mode,string>={pass:'Pass',shoot:'Shoot',forward:'Forward',call:'Call',tackle:'Tackle',stay:'Stay',go:'Go!','':''};
  const KEY_HINT:Record<Mode,string>={pass:'Space',shoot:'J (hold for power)',forward:'J or K',call:'Space',tackle:'Space',stay:'J (hold)',go:'Space (hold)','':''};
  function hud(counting:boolean,joined:boolean){
    const card=el('[data-join-card]'),chip=el('[data-join-chip]'),actions=el('[data-join-actions]'),tipEl=el('[data-join-tip]'),app=root();
    hide(card,!counting);
    if(counting&&card){const p=joinProgress(state);card.style.setProperty('--join-progress',p.toFixed(3));text(el('[data-join-count]'),String(Math.max(1,Math.ceil(JOIN_COUNTDOWN*(1-p)))));}
    hide(chip,!joined);hide(actions,!joined);set(app,'data-live-join',joined?'':null);
    if(joined){
      chip?.style.setProperty('--bib',colour);actions?.style.setProperty('--bib',colour);
      const e=games.entries.find(en=>en.venue.id===format);if(e)text(el('[data-join-score]'),`Yellow ${e.sim.score.gold} – ${e.sim.score.blue} Blue`);
      text(el('[data-join-you]'),`You: ${TEAM_NAME[team]} ${team==='gold'?'▲':'▼'}`);
      const m=modes(),a=el('[data-join-a]'),b=el('[data-join-b]');
      text(a,LABEL[m.a]||'Wait');set(a,'aria-disabled',m.a?null:'true');set(a,'title',m.a?`${LABEL[m.a]} · ${KEY_HINT[m.a]}`:'Get ready for the restart');set(a,'data-mode',m.a||'wait');
      hide(b,!m.b);text(b,LABEL[m.b]);set(b,'title',m.b?`${LABEL[m.b]} · ${KEY_HINT[m.b]}`:'');set(b,'data-mode',m.b);
      text(el('[data-join-status]'),view.restart?'Restart: get ready':'');
    }
    hide(tipEl,!(tipT>0&&(joined||counting)));if(tipT>0)text(tipEl,tip);
  }
  return api;
}
