'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {count} from '@/lib/analytics/tracker';
import {place} from '@/lib/site/pitch';
import {shapeLabel,type Shape} from '@/lib/site/tools/lineup';
import {addGoal,addStoppage,alertKey,applyChange,arrivalsDue,unevenNotes,playedBlocks,buildPlan,confirmChange,planWithLate,changeBetween,clockSec,delayChange,endCurrentPeriod,fairness,fmtClock,kickOff,newGame,nextChange,nextSpots,OVERDUE_SEC,pauseClock,
 planSeconds,playedSeconds,PRESETS,presetOf,pushUndo,removeGoal,replanNow,resumeClock,scoreOf,setScorer,setStatus,settingsFor,skipChange,soleKeeper,summarySeconds,tapOk,theirGoal,type Game,type MatchInfo,type PBlock,type Settings,type Status} from '@/lib/coach/engine';
import {cleanMatch,cleanPlayers,decodeShare,emptyStore,encodeShare,label,minutesCsv,newId,toShared,type Lang,type Player,type Shared,type Store} from '@/lib/coach/store';
import {WORDS,type Words} from '@/lib/coach/words';
import {APP_LANGS,LANG_NAMES,LOCALE,isAppLang,langParam,phoneLang} from '@/lib/i18n/appLangs';
import {moveSpots,parseRef,refKey,type Move,type Ref} from '@/lib/coach/lineup';
import {activeOf,addTeam,deleteTeam,isRunning,liveTeam,loadTeams,newerTeams,saveTeamsRev,storedRev,switchTeam,TEAMS_KEY,updateActive,updateTeam,type Teams} from '@/lib/coach/teams';
import {TeamButton,TeamSheet,presetSettings} from './TeamSheet';
import {LiveBar,toggleClock} from './LiveDock';
import c from './coach.module.css';
import {AppHeader,HeaderGoldBack} from '@/components/motion/AppHeader';
import {noteAppEntry,screenChange,useOncePerSession,useSheet,useSwipeDown,Tick,useCountUp,type Dir} from '@/components/motion/motion';
import '@/components/motion/motion.css';
import {ROOTS,TOOLS,ageFor,hashFor,hashNamesScreen,homeOf,isRoot,landingStack,parseHash,sameRoute,type Age,type Root,type Route,type Screen} from '@/lib/coach/route';
import PlansTool from './PlansTool';
import {GameDayTab,HOME_Y,TrainingTab,dateIn,timeIn,whenLine} from './TabPages';
import {liveLine} from './LiveDock';
import t4 from './tabs.module.css';
import {BallIcon,CheckMark,ConeIcon,CrossMark,GlobeIcon} from './GameIcons';
/**
 * The coach app (/coach, Nov 16 2026; docs/coach-app/HANDOFF.md): Team · Lineup · Game · Summary, and the live game screen.
 * One client component on purpose (a coach opens it once and lives in it). The engine is pure (lib/coach/engine.ts) and the
 * saved data is cleaned on every read (lib/coach/store.ts). Privacy: the team stays in this phone's localStorage; a shared
 * link carries the plan in the URL fragment only; the only counters are anonymous totals (app opened, game started, change
 * made) through the site's existing tracker, never a name, number or time.
 */
type Role='gk'|'def'|'mid'|'fwd';
type SpotPos={x:number;y:number;label:string;role:Role};
type Formation={slug:string;label:string;spots:SpotPos[]};
type Tab=Screen;
/** the screens drawn in <main> (the live game is an overlay over them) */
const SCREENS:readonly Screen[]=[...ROOTS,...TOOLS];
/** the last tab page shown (Game Day or Training): a bare /coach opens it again */
const TAB_KEY='fi-coach-tab';
const ROLE_CLASS:Record<Role,string>={gk:c.gk,def:c.def,mid:c.midC,fwd:c.fwd};
const SMALL:Record<string,Formation>={
 '4v4':{slug:'4v4-diamond',label:'Diamond',spots:[{x:50,y:22,label:'D',role:'def'},{x:22,y:48,label:'L',role:'mid'},{x:78,y:48,label:'R',role:'mid'},{x:50,y:76,label:'F',role:'fwd'}]},
 '5v5':{slug:'5v5-2-1-1',label:'2-1-1',spots:[{x:50,y:5,label:'GK',role:'gk'},{x:30,y:30,label:'LD',role:'def'},{x:70,y:30,label:'RD',role:'def'},{x:50,y:52,label:'M',role:'mid'},{x:50,y:76,label:'F',role:'fwd'}]},
};
function formationsFor(format:string,shapes:readonly Shape[]):Formation[]{
 if(SMALL[format])return [SMALL[format]];
 return shapes.filter(s=>s.format===format).map(s=>{const names=s.lines.map(l=>l.name),L=names.length-1;
  return {slug:s.slug,label:shapeLabel(s),spots:place(s.lines).map((p,i)=>{const li=names.indexOf(p.line);return {x:p.x,y:p.y,label:p.label,role:(i===0?'gk':L<=1?'mid':li===1?'def':li===L?'fwd':'mid') as Role};})};});
}
const mins=(s:number)=>Math.round(s/60);
const TITLE=(w:Words,t:Tab)=>t==='gameday'||t==='training'?w.titleHome:t==='plans'?w.plansTitle:t==='team'?w.titleTeam:t==='lineup'?w.titleLineup:t==='minutes'?w.titleMinutes:t==='subs'?w.titleSubs:w.titleSummary;
/* ------------------------------------------------------------------ derived plan ----------------------------------------- */
function derive(store:Store,shapes:readonly Shape[]){
 const s=store.settings,keeper=s.keeper!=='none',lateOf=store.late;
 /* here: everyone coming; ready: those here at kick-off (the lineup); late players join the plan at their expected minute */
 const isLate=(id:string)=>id in lateOf&&lateOf[id]!==0;
 const here=store.team.players.filter(p=>store.here.includes(p.id)),late=here.filter(p=>isLate(p.id)),hereSet=new Set(here.filter(p=>!isLate(p.id)).map(p=>p.id));
 const ready=here.filter(p=>hereSet.has(p.id));
 const forms=formationsFor(s.format,shapes),form=forms.find(f=>f.slug===s.formation)??forms[0];
 const nSpots=form?.spots.length??s.onField,F=Math.min(s.onField,ready.length);
 const lastSec=store.last?playedSeconds(store.last,0).played:{};
 /* fair auto order: who played least last game first, then by number */
 const auto=[...ready].sort((a,b)=>(lastSec[a.id]??0)-(lastSec[b.id]??0)||a.num-b.num);
 const spots=Array.from({length:nSpots},(_,i)=>{const id=store.spots[i];return id&&hereSet.has(id)?id:'';});
 spots.forEach((id,i)=>{if(id&&spots.indexOf(id)!==i)spots[i]='';});
 const used=new Set(spots.filter(Boolean));
 const fill=(i:number,pick:Player|undefined)=>{if(pick){spots[i]=pick.id;used.add(pick.id);}};
 if(keeper&&!spots[0])fill(0,auto.find(p=>p.gk&&!used.has(p.id))??auto.find(p=>!used.has(p.id)));
 for(let i=0;i<nSpots&&used.size<F;i++)if(!spots[i])fill(i,auto.find(p=>!used.has(p.id)));
 const starters=spots.filter(Boolean),bench=auto.filter(p=>!used.has(p.id));
 const order=[...starters,...bench.map(p=>p.id)];
 const keepers=here.filter(p=>p.gk).map(p=>p.id);
 /* startPlan: what the live game starts from (players here at kick-off); plan: the same with each late player brought in at the
    expected minute, as the live game will re-plan when they arrive (shown before the game) */
 const startPlan=buildPlan(order,s,keepers),plan=late.length?planWithLate([...order,...late.map(p=>p.id)],s,lateOf,keepers):startPlan;
 const spotOf:Record<string,number>={};spots.forEach((id,i)=>{if(id)spotOf[id]=i;});
 /* UX audit B2: a rotating keeper goes only to players marked "Can keep goal"; none or one marked is said plainly */
 const keeperNote:'none'|'one'|null=s.keeper==='rotate'&&here.length>0?keepers.length===0?'none':keepers.length===1?'one':null:null;
 return {here,ready,late,form,forms,spots,bench,plan,startPlan,spotOf,keepers,keeperNote,F};
}
/** The role of every player in every block (spots follow the players through the changes). */
function blockRoles(blocks:readonly PBlock[],start:Record<string,number>,form:Formation|undefined,keeper:boolean):Record<string,Role>[]{
 const out:Record<string,Role>[]=[];let spot={...start},prevOn:string[]=[],prevGk:string|null=null;
 blocks.forEach((b,k)=>{if(k>0)spot=nextSpots(spot,changeBetween(prevOn,prevGk,b),b.on,form?.spots.length??b.on.length,keeper);
  const r:Record<string,Role>={};for(const p of b.on)r[p]=p===b.gk?'gk':form?.spots[spot[p]]?.role??'mid';out.push(r);prevOn=b.on;prevGk=b.gk;});
 return out;
}
/* ------------------------------------------------------------------ small parts ------------------------------------------ */
const Icon=({d}:{d:string})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
const ICONS:Record<string,string>={home:'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5',subs:'M7 20V5M3.5 8.5 7 5l3.5 3.5M17 4v15M13.5 15.5 17 19l3.5-3.5',minutes:'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l3 2M9 2h6',team:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.4.9 2.3 2.6 2.5 5.2',
 lineup:'M4 3h16v18H4zM4 12h16M9 3v4h6V3M9 21v-4h6v4',summary:'M5 20V10M12 20V4M19 20v-7'};
/* The timeline rows are built inline (a component per row would remount on every tick). */
type TimelineProps={w:Words;rows:readonly Player[];blocks:readonly PBlock[];roles?:Record<string,Role>[];settings:Settings;nowAt?:{period:number;sec:number};seconds:Readonly<Record<string,number>>};
function TimelineRows({w,rows,blocks,roles,settings,nowAt,seconds}:TimelineProps){
 const P=settings.periods,len=settings.periodMin*60;
 return <div role="img" aria-label={`${w.plan}: ${rows.map(p=>`${label(p)} ${mins(seconds[p.id]??0)} ${w.min}`).join(', ')}`}>
  <div className={c.tl} aria-hidden="true">
   <span/><div className={c.tlHead}>{Array.from({length:P},(_,i)=><span key={i}>{w.periodName(i,P)}</span>)}</div><span/>
   {rows.map(p=>[
    <div key={p.id+'n'} className={c.tlName}><b>{p.num}</b>{p.name}</div>,
    <div key={p.id+'t'} className={c.tlTrack}>{Array.from({length:P},(_,per)=><div key={per} className={c.tlPeriod}>
     {blocks.map((b,k)=>b.period===per&&b.on.includes(p.id)?<i key={k} className={`${c.tlBar} ${roles?ROLE_CLASS[roles[k]?.[p.id]??'mid']:b.gk===p.id?c.gk:c.fieldC}`} style={{left:`${b.start/len*100}%`,width:`${Math.max(0.5,(Math.min(b.end,len)-b.start)/len*100)}%`}}/>:null)}
     {nowAt&&nowAt.period===per?<i className={c.tlNow} style={{left:`${Math.min(100,nowAt.sec/len*100)}%`}}/>:null}
    </div>)}</div>,
    <div key={p.id+'m'} className={c.tlMin}><Tick value={mins(seconds[p.id]??0)}/></div>])}
  </div>
 </div>;
}
function Legend({w,keeper}:{w:Words;keeper:boolean}){
 return <div className={c.legend} aria-hidden="true">{keeper&&<span><i className={c.gk}/>{w.gk}</span>}<span><i className={c.def}/>{w.def}</span><span><i className={c.midC}/>{w.mid}</span><span><i className={c.fwd}/>{w.fwd}</span></div>;
}
function Fair({w,seconds,ids,skip,fixedName,step,verdict=true}:{w:Words;seconds:Readonly<Record<string,number>>;ids:readonly string[];skip:ReadonlySet<string>;fixedName?:string;step:number;verdict?:boolean}){
 /* uneven = a spread of more than one change interval (the planner keeps everyone there all game within one; tests/coach-app.cjs) */
 const f=fairness(seconds,ids,skip),bad=f.spread>step*60+1,lo=useCountUp(mins(f.min)),hi=useCountUp(mins(f.max));
 return <div className={c.fair} aria-live="polite"><div><div className={c.fairBig}>{w.fairEveryone(lo,hi).replace(/(\d+)–(\d+) (\S+)$/,'$1\u2060–\u2060$2\u00a0$3').replace(/ (\S+)$/,'\u00a0$1')/* round 4G (P1): the unit never sits alone on a line */}</div>{fixedName&&<div className={c.note}>{w.keeperAll(fixedName)}</div>}</div>
  {/* a parents' link never shows a verdict (UX audit B3/C2); the coach sees a neutral word */}
  {verdict&&<span className={`${c.fairTag} fi-pop`} key={String(bad)} data-bad={bad}>{bad?w.fairCheck:w.fairGood}</span>}</div>;
}
function NumberInput({value,taken,onCommit,w}:{value:number;taken:ReadonlySet<number>;onCommit:(n:number)=>void;w:Words}){
 const [draft,setDraft]=useState(String(value));
 useEffect(()=>{setDraft(String(value));},[value]);
 const n=Number(draft),valid=/^\d{1,2}$/.test(draft)&&(n===value||!taken.has(n));
 return <div><input className={`${c.input} ${c.num}`} inputMode="numeric" pattern="[0-9]*" maxLength={2} aria-label={w.number} aria-invalid={!valid} value={draft}
  onChange={e=>{const v=e.target.value.replace(/\D/g,'').slice(0,2);setDraft(v);const k=Number(v);if(/^\d{1,2}$/.test(v)&&(k===value||!taken.has(k)))onCommit(k);}}/>
  {!valid&&<p className={c.err} role="alert">{draft===''?w.numberNeeded:w.numberTaken}</p>}</div>;
}
/** A count picked with − and + (Nov 22 2026, owner: no bare native selects): one pill, the same height and fill as the chips. */
function Stepper({w,label,value,options,fmt,onChange,id}:{w:Words;label:string;value:number;options:readonly number[];fmt:(n:number)=>string;onChange:(n:number)=>void;id:string}){
 let i=options.indexOf(value);if(i<0)i=Math.max(0,options.findIndex(o=>o>value)-1);
 return <div className={c.stepRow}><span className={c.lbl} id={id}>{label}</span>
  <div className={c.stepper} role="group" aria-labelledby={id}>
   <button type="button" className={c.stepBtn} aria-label={`${label}, ${w.less}`} disabled={i<=0} onClick={()=>onChange(options[i-1])}>−</button>
   <output className={c.stepVal} aria-live="polite"><Tick value={value}/>{fmt(value).replace(String(value),'')}</output>
   <button type="button" className={c.stepBtn} aria-label={`${label}, ${w.more}`} disabled={i>=options.length-1} onClick={()=>onChange(options[i+1])}>+</button>
  </div></div>;
}
/** Where a tool leads next (the tab bar's replacement): Lineup -> Playing time -> Substitution rotation -> Start the game. */
function NextBtn({label,onClick}:{label:string;onClick:()=>void}){
 return <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnWide} ${c.nextBtn} ${c.noPrint}`} onClick={onClick} data-coach-next="">{label}<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>;
}
/** Equal segments in one track (a 2-4 option choice): the same 52 px pill as the steppers. */
function Seg<T extends string|number|boolean>({label,value,options,names,onPick}:{label:string;value:T;options:readonly T[];names:(v:T)=>ReactNode;onPick:(v:T)=>void}){
 return <div className={c.sec}><p className={c.lbl}>{label}</p><div className={c.segTrack} role="group" aria-label={label} style={{gridTemplateColumns:`repeat(${options.length},minmax(0,1fr))`}}>
  {options.map(o=><button key={String(o)} type="button" className={c.segBtn} aria-pressed={o===value} onClick={()=>onPick(o)}>{names(o)}</button>)}</div></div>;
}
/* ------------------------------------------------------------------ the app ---------------------------------------------- */
export default function CoachApp({shapes,plansVersion=''}:{shapes:readonly Shape[];plansVersion?:string}){
 /* several teams (Nov 22 2026; lib/coach/teams.ts): the screens read and write the active team's store */
 const [teams,setTeams]=useState<Teams>(()=>({v:1,activeId:'t1',teams:[{...emptyStore(),id:'t1'}]}));
 const store=activeOf(teams),place=teams.teams.indexOf(store)+1;
 const setStore=useCallback((f:Store|((s:Store)=>Store))=>setTeams(t=>updateActive(t,typeof f==='function'?f:()=>f)),[]);
 const teamSheet=useSheet<true>(),langSheet=useSheet<true>(),detailsSheet=useSheet<true>();
 const [ready,setReady]=useState(false);
 /* round 4A (Nov 22 2026): the screen lives in the URL hash (lib/coach/route.ts). Two tab pages (Game Day, Training) and the
    tools that push over them; every screen change writes history, so the phone's Back returns from a tool to its tab page, and
    from a tab page leaves the app (UX audit B1). */
 const [route,setRoute]=useState<Route>({screen:'gameday'});
 const tab=route.screen;
 const routeRef=useRef<Route>(route);routeRef.current=route;
 const [homeTab,setHomeTab]=useState<Root>('gameday');
 const [live,setLiveRaw]=useState(false);
 /* "Add your squad" from a tool: the squad screen offers the way back to that tool (UX audit C6) */
 const [returnTo,setReturnTo]=useState<Screen|null>(null);
 const [shared,setShared]=useState<Shared|null>(null);
 const [undo,setUndo]=useState<Game[]>([]);
 /* `inline`: a lineup move's Undo, drawn under the bench (round 4E: the fixed toast covered the bench chips) */
 const [toast,setToast]=useState<{msg:string;undo:boolean;action?:{label:string;run:()=>void};inline?:boolean}|null>(null);
 const [now,setNow]=useState(()=>Date.now());
 const [enter,setEnter]=useState<Dir|null>(null);
 /* the motion model (owner, Nov 22 2026): tab switches crossfade in place (120 ms) and keep each page's scroll; a tool pushes in
    (slides) and Back pops it (slides back) */
 const scrollAt=useRef<Partial<Record<string,number>>>({});
 /* fast taps (UX audit C16): one screen change at a time; a second tap within the transition is ignored */
 const busy=useRef(0);
 const depth=()=>{const st=window.history.state as {fiCoach?:number}|null;return typeof st?.fiCoach==='number'?st.fiCoach:0;};
 const url=(r:Route)=>window.location.pathname+window.location.search+hashFor(r);
 /** draw a route (no history work): the direction picks the motion */
 const lastDepth=useRef(0);
 const draw=useCallback((r:Route,dir:Dir)=>{
  const from=routeRef.current;lastDepth.current=depth();
  scrollAt.current[from.screen]=window.scrollY;
  setToast(null);/* a toast belongs to the screen it was shown on (UX audit C15) */
  const apply=()=>{setEnter(dir);setRoute(r);setLiveRaw(!!r.live);if(isRoot(r.screen)){setHomeTab(r.screen);try{window.localStorage.setItem(TAB_KEY,r.screen);}catch{/* optional */}}};
  if(from.screen===r.screen&&!!from.live===!!r.live){apply();if(dir==='forward')window.scrollTo(0,0);return;}
  screenChange(dir,apply,()=>{window.scrollTo(0,dir==='forward'?0:scrollAt.current[r.screen]??0);});
 },[]);
 /** move to a route: push (a tool over a tab page), replace (a tab switch, Next, the squad from a tool) */
 const nav=useCallback((r:Route,mode:'push'|'replace',dir?:Dir)=>{
  const t0=Date.now();if(t0-busy.current<320)return;busy.current=t0;
  const from=routeRef.current;if(sameRoute(from,r))return;
  const d0=depth();
  if(mode==='push')window.history.pushState({fiCoach:d0+1},'',url(r));else window.history.replaceState({fiCoach:d0},'',url(r));
  draw(r,dir??(mode==='push'?'forward':isRoot(r.screen)&&isRoot(from.screen)?'tab':'tab'));
 },[draw]);
 /** Back inside the app: the history entry under this one when the app made it, else the tab page this screen belongs to */
 const back=useCallback(()=>{
  const t0=Date.now();if(t0-busy.current<320)return;busy.current=t0;
  if(depth()>0){window.history.back();return;}
  const r:Route=routeRef.current.screen==='plans'&&routeRef.current.plan?{screen:'plans',age:routeRef.current.age}:{screen:homeTab};
  window.history.replaceState({fiCoach:0},'',url(r));draw(r,'back');
 },[draw,homeTab]);
 const go=(t:Tab,via:'tab'|'push'='push')=>{if(isRoot(t))nav({screen:t},'replace','tab');else nav({screen:t},via==='tab'?'replace':'push');};
 /* the phone's Back and Forward, and a hash typed or followed by a link: draw what the URL says */
 useEffect(()=>{
  const on=()=>{const r=parseHash(window.location.hash),from=routeRef.current,d=depth(),popBack=d<lastDepth.current;lastDepth.current=d;if(sameRoute(r,from))return;
   /* round 4G (audit C11): a step back in the app's own history always plays the reverse (back) transition */
   const dir:Dir=popBack||isRoot(r.screen)&&!isRoot(from.screen)||from.live&&!r.live||from.screen==='plans'&&r.screen==='plans'&&(!r.plan||!r.run&&from.run)?'back':isRoot(r.screen)&&isRoot(from.screen)?'tab':'forward';
   draw(r,dir);};
  window.addEventListener('popstate',on);window.addEventListener('hashchange',on);
  return ()=>{window.removeEventListener('popstate',on);window.removeEventListener('hashchange',on);};
 },[draw]);
 const setLive=(v:boolean)=>{if(v){if(!routeRef.current.live)nav({screen:'subs',live:true},'push');}else if(routeRef.current.live)back();};
 const lang:Lang=store.lang??'en',w=WORDS[lang];
 const audio=useRef<AudioContext|null>(null);
 /* load once: the saved team, the language, a shared link, the screen in the URL; register the app's own service worker. Once only,
    also under React's development double effects: the first run rewrites the URL and the history (a second run would lose the
    link's format and stack the history twice) */
 const booted=useRef(false);
 useEffect(()=>{
  if(booted.current)return;booted.current=true;
  let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* storage blocked */}
  /* the teams record; the first time, the single team in fi-coach-v1 becomes the first team. A game on the clock opens its team. */
  let all=loadTeams(ls);revRef.current=all.rev??0;const lv=liveTeam(all);if(lv)all=switchTeam(all,lv.id);
  const q=new URLSearchParams(window.location.search).get('lang'),l0=activeOf(all).lang;
  const lg:Lang=isAppLang(q)?q:l0??phoneLang();
  all=updateActive(all,x=>({...x,lang:lg}));
  const m=/[#&]s=([A-Za-z0-9_-]+)/.exec(window.location.hash);if(m){const d=decodeShare(m[1]);if(d)setShared(d);}
  /* the screen: the URL's; a bare /coach opens the last tab page; a game on the clock opens Match day over its tab page */
  let saved:Root='gameday';try{if(window.localStorage.getItem(TAB_KEY)==='training')saved='training';}catch{/* optional */}
  const named=hashNamesScreen(window.location.hash);let r:Route=named?parseHash(window.location.hash):{screen:saved};
  if(isRunning(activeOf(all))&&!m)r={screen:'subs',live:true};
  /* a deep link's format (UX audit C6, /tools/9v9-substitution-rotation): an empty team takes it; a team with players keeps its
     own and is offered the switch */
  let ask:string|null=null;
  if(r.format&&!isRunning(activeOf(all))){const f=r.format,a=activeOf(all);
   if(a.settings.format!==f){const other=all.teams.find(x=>x.settings.format===f&&x.team.players.length);
    if(!a.team.players.length)all=updateActive(all,x=>({...x,settings:presetSettings(f as Parameters<typeof presetSettings>[0]),spots:[]}));
    else if(other)all=switchTeam(all,other.id);else ask=f;}}
  setTeams(all);
  /* the history stack is written after Next's router has patched pushState/replaceState (its effect runs after this child's):
     an entry written before that lacks Next's __NA mark, and Back onto it made Next reload the page, which, with a game on the
     clock, reopened Match day, so Back from Match day looked dead (round 4C, Nov 22 2026) */
  if(!m){const stack=landingStack({...r,format:undefined});
   window.setTimeout(()=>stack.forEach((x,i)=>{if(i===0)window.history.replaceState({fiCoach:0},'',url(x));else window.history.pushState({fiCoach:i},'',url(x));}),0);}
  const top={...r,format:undefined};setRoute(top);setLiveRaw(!!top.live);setHomeTab(homeOf(top.screen));
  if(ask){const f=ask;const cur=activeOf(all).settings.format;setToast({msg:WORDS[lg].formatLink(WORDS[lg].fmt(f),WORDS[lg].fmt(cur)),undo:false,action:{label:WORDS[lg].useFormat(WORDS[lg].fmt(f)),run:()=>{setStore(x=>({...x,settings:presetSettings(f as Parameters<typeof presetSettings>[0]),spots:[]}));setToast(null);}}});}
  /* point every manifest link at the app's own; never remove one: React owns them, and a removed node made its next head update
     throw "Cannot read properties of null (reading 'removeChild')" (Nov 22 2026) */
  document.querySelectorAll('link[rel=manifest]').forEach(l=>{(l as HTMLLinkElement).href='/coach/manifest.webmanifest';});
  setReady(true);count('ca:open');noteAppEntry('coach');
  if(isRoot(top.screen)&&!top.live)try{const y=Number(window.sessionStorage.getItem(HOME_Y));window.sessionStorage.removeItem(HOME_Y);if(y>0)requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,y)));}catch{/* optional */}
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('/coach-sw.js',{scope:'/coach'}).catch(()=>{});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 /* two tabs (UX audit B5): every save carries a revision; another tab's newer save is taken (with a small toast) instead of being
    overwritten, and a record taken that way is not written back */
 const revRef=useRef(0),adopted=useRef<Teams|null>(null);
 const adopt=useCallback((t:Teams)=>{revRef.current=t.rev??0;setTeams(cur=>{const x={...t,activeId:t.teams.some(y=>y.id===cur.activeId)?cur.activeId:t.activeId};adopted.current=x;return x;});
  setUndo([]);setToast({msg:WORDS[activeOf(t).lang??'en'].otherTab,undo:false});},[]);
 useEffect(()=>{if(!ready)return;let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* blocked */}document.documentElement.lang=LOCALE[lang];
  if(teams===adopted.current)return;
  if(ls&&storedRev(ls)>revRef.current){const t=newerTeams(ls.getItem(TEAMS_KEY),revRef.current);if(t){adopt(t);return;}}
  const r=saveTeamsRev(ls,teams);if(r)revRef.current=r;},[teams,ready,lang,adopt]);
 useEffect(()=>{if(!ready)return;const on=(e:StorageEvent)=>{if(e.key!==TEAMS_KEY)return;const t=newerTeams(e.newValue,revRef.current);if(t)adopt(t);};
  window.addEventListener('storage',on);return ()=>window.removeEventListener('storage',on);},[ready,adopt]);
 const update=useCallback((f:(s:Store)=>Store)=>setStore(s=>f(s)),[setStore]);
 const d=useMemo(()=>derive(store,shapes),[store,shapes]);
 const game=store.game;
 /* the team whose game is on the clock (maybe not the one shown): the feature card and the mini live bar return to it */
 const liveRec=liveTeam(teams),liveOther=liveRec&&liveRec.id!==store.id?liveRec:null;
 const openLive=()=>{if(liveOther){setTeams(t=>switchTeam(t,liveOther.id));setUndo([]);}setLive(true);};
 /* the clock: 4 ticks a second on the live screen; 1 a second for the mini live bar and Game Day's live card; none without a game */
 const ticking=live?250:liveRec?1000:0;
 useEffect(()=>{if(!ticking)return;setNow(Date.now());const t=setInterval(()=>setNow(Date.now()),ticking);return ()=>clearInterval(t);},[ticking]);
 /* switch team: a quick crossfade; the undo list belongs to the team that was shown */
 const pickTeam=(id:string,then?:()=>void)=>{teamSheet.close();if(id===store.id){then?.();return;}
  screenChange('fade',()=>{setEnter('fade');setTeams(t=>switchTeam(t,id));setUndo([]);then?.();});};
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),toast.action&&!toast.inline?12000:6000);return ()=>clearTimeout(t);},[toast]);
 /* never lose a live game by accident */
 const anyLive=!!liveRec;
 useEffect(()=>{if(!anyLive)return;
  const h=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',h);return ()=>window.removeEventListener('beforeunload',h);},[anyLive]);
 const act=useCallback((f:(g:Game)=>Game,msg?:string)=>{
  setStore(s=>{if(!s.game)return s;setUndo(u=>pushUndo(u,s.game!));return {...s,game:f(s.game)};});
  if(msg)setToast({msg,undo:true});
 },[setStore]);
 const doUndo=()=>{setUndo(u=>{const prev=u[u.length-1];if(prev)setStore(s=>({...s,game:prev}));return u.slice(0,-1);});setToast(null);};
 /* the sound after a refresh or a round trip to /board (UX audit B7): the phone blocks sound and vibration until the first tap */
 const [muted,setMuted]=useState(false);
 useEffect(()=>{if(!ready||!anyLive)return;const ua=(navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation;if(ua&&!ua.hasBeenActive)setMuted(true);
  const u=()=>{setMuted(false);try{audio.current??=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();void audio.current.resume();}catch{/* no audio */}};
  window.addEventListener('pointerdown',u,{once:true});return ()=>window.removeEventListener('pointerdown',u);},[ready,anyLive]);
 /* round 4G (audit C2): one team name everywhere: a team without a name gets its default ("Team 1") once, saved, so the settings
    field, the dashboard, Match day and the score all show the same name, and the coach edits that one */
 const defName=w.teamN(place);
 useEffect(()=>{if(ready&&!store.team.name&&!shared)update(x=>x.team.name?x:{...x,team:{...x.team,name:defName}});},[ready,store.team.name,defName,update,shared]);
 const beep=(soft=false)=>{if(!store.sound)return;try{const a=audio.current;if(!a)return;for(const t of soft?[0]:[0,0.35]){const o=a.createOscillator(),g=a.createGain();o.frequency.value=soft?660:880;g.gain.setValueAtTime(0.0001,a.currentTime+t);g.gain.exponentialRampToValueAtTime(soft?0.25:0.5,a.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+t+0.25);o.connect(g).connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+0.3);}}catch{/* no audio */}};
 const startGame=()=>{
  const status:Record<string,Status>={};for(const p of d.ready)status[p.id]='ok';for(const p of d.late)status[p.id]='late';
  try{audio.current??=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();void audio.current.resume();}catch{/* no audio */}
  setUndo([]);update(s=>({...s,last:s.game?.clock.status==='done'?s.game:s.last,game:newGame(d.startPlan,s.settings,d.spotOf,status,Date.now(),cleanMatch(s.match),s.late)}));setLive(true);count('ca:game');
 };
 const shareLink=async(x:Shared,title?:string)=>{
  const url=`${location.origin}/coach${langParam(lang)}#s=${encodeShare(x)}`;
  try{if(navigator.share){await navigator.share({title:title?`${title}${x.team?' · '+x.team:''}`:x.team||w.plan,url});return;}}catch{/* cancelled */}
  try{await navigator.clipboard.writeText(url);setToast({msg:w.copied,undo:false});}catch{window.prompt(w.copyLink,url);}
 };
 if(shared)return <SharedView w={w} x={shared} onClose={()=>{history.replaceState(null,'',location.pathname+location.search);setShared(null);}}/>;
 const team=store.team,root=isRoot(tab),fmtName=w.fmt(presetOf(store.settings.format).id);
 const teamAge:Age=ageFor(store.settings.format,team.name);
 const goTeam=()=>{setReturnTo(tab);nav({screen:'team'},'replace','tab');};
 const liveCard=liveRec?.game?(()=>{const l=liveLine(w,liveRec.game!,now);return {period:l.period,clock:l.clock,change:l.change,team:liveRec.team.name||w.teamN(teams.teams.indexOf(liveRec)+1)};})():null;
 const navItem=(k:'gameday'|'training'|'lang',label:string,icon:ReactNode)=><button type="button" className={t4.navBtn} aria-current={k===tab?'page':undefined} data-nav={k}
  onClick={()=>{if(k==='lang')langSheet.open(true);else if(k!==tab)go(k,'tab');else window.scrollTo({top:0,behavior:'smooth'});}} aria-haspopup={k==='lang'?'dialog':undefined}>
  <span className={t4.navIcon} aria-hidden="true">{icon}</span>{label}</button>;
 return <div className={c.app} translate="no" data-reading-page="" data-coach-app="" data-tool={tab} data-dock={!live&&liveRec?'':undefined} data-nav={root?'':undefined}>
  {/* the shared header (components/motion/AppHeader). Tab pages: the team switcher, "Coach" and the team, Exit. Tools: Back, the
      title, nothing on the right (owner, Nov 22 2026). The language lives in the bottom nav. */}
  <AppHeader lang={lang} exit={root} exitAria={w.exitAria} exitData={{'data-coach-back':'','data-coach-exit':''}}
   left={!root?<HeaderGoldBack key={"tool"+hashFor(route)} lang={lang} onBack={back} data={{'data-coach-home':''}}/>:<TeamButton key="teams" w={w} name={team.name} place={place} onClick={()=>teamSheet.open(true)}/>}
   title={TITLE(w,tab)} sub={root?team.name||w.teamN(place):tab==='plans'?`${team.name?team.name+' · ':''}${teamAge}`:<>{team.name?`${team.name} · `:''}{fmtName} · {store.settings.periods} × {store.settings.periodMin} {w.min}</>}/>
  <main className={c.main} id="coach-main">
   {ready&&SCREENS.filter(t=>t===tab).map(t=><div key={t} className="fi-screen" data-enter={enter??undefined}>
    {t==='gameday'?<GameDayTab w={w} store={store} place={place} fmt={fmtName} coming={d.ready.length} late={d.late.length} onDetails={()=>detailsSheet.open(true)} onField={d.F} intro={false} live={liveCard} gameDone={game?.clock.status==='done'||!!store.last&&!game}
      onMatch={()=>{if(liveRec&&liveRec.game?.clock.status!=='done')openLive();else if(d.here.length)startGame();else goTeam();}}
      onTool={k=>go(k)}
      onExample={()=>update(x=>{const ps=EXAMPLE.map((n,i)=>({id:'p'+(i+1).toString(36),num:i+1,name:n,gk:i===0}));return {...x,team:{name:!x.team.name||x.team.name===w.teamN(place)?'Blue Sharks':x.team.name,players:cleanPlayers(ps)},here:ps.map(p=>p.id),late:{},spots:[]};})}/>
    :t==='training'?<TrainingTab w={w} lang={lang} version={plansVersion} age={teamAge} format={store.settings.format} intro={false} onPlans={(plan,run)=>{
      if(!plan){nav({screen:'plans'},'push');return;}
      /* a plan from Training: the list under it, so Back goes plan -> list -> Training */
      const t0=Date.now();if(t0-busy.current<320)return;busy.current=t0;
      window.history.pushState({fiCoach:depth()+1},'',url({screen:'plans'}));
      if(run)window.history.pushState({fiCoach:depth()+1},'',url({screen:'plans',plan}));
      const r:Route={screen:'plans',plan,run};window.history.pushState({fiCoach:depth()+1},'',url(r));draw(r,'forward');}}/>
    :t==='team'?<>
      <TeamTab w={w} store={store} update={update} d={d}/>
      {returnTo&&!isRoot(returnTo)&&returnTo!=='team'&&d.here.length>0&&<NextBtn label={w.backTo(TITLE(w,returnTo))} onClick={()=>{const r=returnTo;setReturnTo(null);nav({screen:r},'replace','tab');}}/>}</>
    :t==='lineup'?<LineupTab w={w} store={store} update={update} d={d} onNext={()=>go('minutes','tab')} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))} note={toast?.inline?toast:null} onMoved={(msg,undo)=>setToast({msg,undo:false,inline:true,action:{label:w.undo,run:()=>{setToast(null);undo();}}})}/>
    :t==='minutes'||t==='subs'?<GameTab view={t} w={w} store={store} d={d} onStart={startGame} onResume={()=>setLive(true)} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))} goTeam={goTeam} onNext={()=>go('subs','tab')}/>
    :t==='plans'?<PlansTool w={w} lang={lang} version={plansVersion} teamAge={teamAge} format={store.settings.format} age={route.age} plan={route.plan} run={route.run}
      onAge={a=>{const r:Route={screen:'plans',age:a};window.history.replaceState({fiCoach:depth()},'',url(r));setRoute(r);}}
      onPlan={slug=>nav({screen:'plans',plan:slug,age:route.age},'push')}
      onRun={on=>{if(on)nav({...route,run:true},'push');else back();}}/>
    :<SummaryTab w={w} store={store} now={now} onShare={(names:boolean)=>{const g=store.game??store.last;if(!g)return;const sc=scoreOf(g);
       shareLink(toShared(team,g.settings,playedBlocks(g,Date.now()),summarySeconds(g,Date.now()),g.clock.status==='done',names,{opp:g.info?.opp??'',date:g.info?.date??'',us:g.clock.status==='pre'?null:sc.us,them:g.clock.status==='pre'?null:sc.them}),w.sharedTitle);}}
      onNew={()=>{if(window.confirm(w.newGameConfirm)){update(s=>({...s,last:s.game??s.last,game:null}));go('minutes','tab');}}}/>}
   </div>)}
  </main>
  {live&&game&&<LiveGame w={w} lang={lang} game={game} team={team} now={now} act={act} canUndo={undo.length>0} onUndo={doUndo} keepers={d.keepers} beep={beep}
   sound={store.sound} toggleSound={()=>update(s=>({...s,sound:!s.sound}))}
   onExit={()=>{/* Back leaves the live screen without stopping the game: the clock is time-stamped and Game Day's card returns to it */
    if(game.clock.status==='done'){window.history.replaceState({fiCoach:depth()},'',url({screen:'summary'}));draw({screen:'summary'},'back');}else back();}}
   onSummary={()=>{window.history.replaceState({fiCoach:depth()},'',url({screen:'summary'}));draw({screen:'summary'},'back');}} onSub={()=>count('ca:sub')}/>}
  {ready&&live&&muted&&<button type="button" className={c.soundBack} onClick={()=>setMuted(false)} data-sound-back="">{w.soundBack}</button>}
  {/* the mini live bar (Nov 22 2026): a game on the clock stays one tap away from every screen */}
  {ready&&!live&&liveRec?.game&&<LiveBar w={w} game={liveRec.game} team={liveRec.team.name||w.teamN(teams.teams.indexOf(liveRec)+1)} now={now} sound={store.sound} onOpen={openLive}
   onToggle={()=>setTeams(t=>updateTeam(t,liveRec.id,x=>x.game?{...x,game:toggleClock(x.game,Date.now())}:x))}/>}
  {ready&&root&&!live&&<nav className={t4.nav} aria-label={w.appName}>
   {navItem('gameday',w.navGameDay,<BallIcon size={26}/>)}
   {navItem('training',w.navTraining,<ConeIcon size={26}/>)}
   {navItem('lang',w.navLang,<GlobeIcon size={26}/>)}
  </nav>}
  {detailsSheet.value&&<DetailsSheet w={w} lang={lang} match={cleanMatch(store.match)} closing={detailsSheet.closing} onClose={detailsSheet.close} onChange={m=>update(s=>({...s,match:m}))}/>}
  {langSheet.value&&<LangSheet w={w} lang={lang} closing={langSheet.closing} onClose={langSheet.close} onPick={l=>{update(s=>({...s,lang:l}));langSheet.close();}}/>}
  {teamSheet.value&&<TeamSheet w={w} teams={teams} closing={teamSheet.closing} onClose={teamSheet.close}
   onPick={id=>pickTeam(id)} onEdit={id=>pickTeam(id,()=>{setReturnTo(null);nav({screen:'team'},'push');})}
   onDelete={id=>{const wasActive=id===store.id;const apply=()=>{setTeams(t=>deleteTeam(t,id,Date.now()%100000));if(wasActive)setUndo([]);};if(wasActive)screenChange('fade',apply);else apply();}}
   onAdd={x=>{teamSheet.close();screenChange('fade',()=>{setEnter('fade');setTeams(t=>addTeam(t,{name:x.name,settings:presetSettings(x.format),from:x.from},Date.now()%1000000));setUndo([]);});if(!root)nav({screen:homeTab},'replace','fade');}}/>}
  {toast&&!toast.inline&&<div className={c.toast} role="status"><span>{toast.msg}</span>{toast.undo&&undo.length>0&&<button type="button" onClick={doUndo}>{w.undo}</button>}{toast.action&&<button type="button" onClick={toast.action.run}>{toast.action.label}</button>}</div>}
 </div>;
}
/** The language sheet (round 4A): opened from the bottom nav; the choice is the whole app's (saved in fi-coach-v1; /scan and /board
 *  get it as ?lang=). */
function LangSheet({w,lang,closing,onClose,onPick}:{w:Words;lang:Lang;closing:boolean;onClose:()=>void;onPick:(l:Lang)=>void}){
 const panel=useRef<HTMLDivElement>(null),swipe=useSwipeDown(panel,onClose);
 return <div className={c.sheet} data-closing={closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{if(e.key==='Escape')onClose();}}>
  <div className={c.sheetIn} ref={panel} role="dialog" aria-modal="true" aria-labelledby="coach-lang" data-lang-sheet="">
   <div className={c.sheetHead} {...swipe}><span className={c.grab} aria-hidden="true"/><p className={c.sheetTitle} id="coach-lang">{w.langTitle}</p><button type="button" className={c.doneBtn} onClick={onClose}>{w.sheetDone}</button></div>
   <ul className={t4.langList}>{APP_LANGS.map(l=><li key={l}><button type="button" className={t4.langOpt} lang={LOCALE[l]} aria-pressed={l===lang} onClick={()=>onPick(l)} autoFocus={l===lang} data-lang={l}>
    {LANG_NAMES[l]}{l===lang&&<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</button></li>)}</ul>
  </div>
 </div>;
}
/** The next game's details (UX audit C17): opponent, date, kick-off, home or away. Saved as typed; copied into the game at the start. */
function DetailsSheet({w,lang,match,closing,onClose,onChange}:{w:Words;lang:Lang;match:MatchInfo;closing:boolean;onClose:()=>void;onChange:(m:MatchInfo)=>void}){
 const panel=useRef<HTMLDivElement>(null),swipe=useSwipeDown(panel,onClose),m=match,set=(x:Partial<MatchInfo>)=>onChange({...m,...x});
 return <div className={c.sheet} data-closing={closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{if(e.key==='Escape')onClose();}}>
  <div className={`${c.sheetIn} ${c.setSheet}`} ref={panel} role="dialog" aria-modal="true" aria-labelledby="coach-details" data-game-details="">
   <div className={c.sheetHead} {...swipe}><span className={c.grab} aria-hidden="true"/><p className={c.sheetTitle} id="coach-details">{w.details}</p><button type="button" className={c.doneBtn} onClick={onClose}>{w.sheetDone}</button></div>
   <div className={c.sheetBody}>
    <label className={c.sec}><span className={c.lbl}>{w.opponent}</span><input className={c.input} value={m.opp} placeholder={w.opponentPh} maxLength={24} onChange={e=>set({opp:e.target.value.slice(0,24)})} autoFocus/></label>
    <div className={c.detailsPair}>
     <label className={c.sec}><span className={c.lbl}>{w.date}</span><input className={c.input} type="date" lang={LOCALE[lang]} value={m.date} onChange={e=>set({date:e.target.value})}/>{m.date&&<small className={c.inputSay} data-date-say="">{dateIn(m.date,lang)}</small>}</label>
     <label className={c.sec}><span className={c.lbl}>{w.kickTime}</span><input className={c.input} type="time" lang={LOCALE[lang]} value={m.time} onChange={e=>set({time:e.target.value})}/>{m.time&&<small className={c.inputSay}>{timeIn(m.time,lang)}</small>}</label>
    </div>
    <Seg label={w.homeAway} value={m.home} options={['','home','away'] as const} names={h=>h==='home'?w.home:h==='away'?w.awayGame:w.notSet} onPick={h=>set({home:h})}/>
   </div>
  </div>
 </div>;
}
type D=ReturnType<typeof derive>;
const EXAMPLE=['Ava','Ben','Carlos','Dani','Eli','Fatima','Gus','Hana','Isla','Jonah','Kai','Leo'];
/** Minutes a late player can be expected at: every change interval from the first one to the last minute of the game. */
const lateMinutes=(s:Settings)=>{const out:number[]=[],end=s.periods*s.periodMin;for(let m=s.subEvery;m<end;m+=s.subEvery)out.push(m);return out;};
type Up=(f:(s:Store)=>Store)=>void;
type Attend='here'|'late'|'away';
/** Coming / Late / Not coming for one player: a late player keeps the minute already picked; late and absent players leave the lineup. */
function attend(x:Store,id:string,v:Attend):Store{
 const {[id]:was,...rest}=x.late,spots=x.spots.map(i=>i===id?'':i),here=x.here.includes(id)?x.here:[...x.here,id];
 if(v==='away')return {...x,here:x.here.filter(i=>i!==id),late:rest,spots};
 if(v==='here')return {...x,here,late:rest};
 return {...x,here,late:{...rest,[id]:id in x.late?was??null:null},spots};
}
/* ------------------------------------------------------------------ Team ------------------------------------------------- */
function TeamTab({w,store,update,d}:{w:Words;store:Store;update:Up;d:D}){
 const players=store.team.players,nums=new Set(players.map(p=>p.num)),hereSet=new Set(store.here);
 const setPlayers=(f:(ps:Player[])=>Player[],addHere:string[]=[])=>update(s=>({...s,team:{...s.team,players:cleanPlayers(f(s.team.players))},here:[...new Set([...s.here,...addHere])]}));
 const add=(n:number)=>{let num=1;while(nums.has(num)&&num<99)num++;const ids=new Set(players.map(p=>p.id)),added:Player[]=[];
  for(let k=0;k<n;k++){while(nums.has(num)||added.some(a=>a.num===num))num++;if(num>99)break;const id=newId(new Set([...ids,...added.map(a=>a.id)]),Date.now()%100000+k);added.push({id,num,name:'',gk:false});}
  setPlayers(ps=>[...ps,...added],added.map(a=>a.id));};
 const s=store.settings;
 const [quick,setQuick]=useState(12),sheet=useSheet<true>(),panel=useRef<HTMLDivElement>(null),swipe=useSwipeDown(panel,sheet.close);
 const pre=presetOf(s.format),fmt=pre.id==='futsal'?'Futsal':s.format;
 /* Nov 22 2026 redesign (owner: "simple, sleek, modern"): the squad is the screen; the game settings sit behind one summary card
    and open in a sheet. Same settings, same store (fi-coach-v1). */
 return <>
  <h1 className={c.srOnly}>{w.titleTeam}</h1>
  <p className={c.note}>{w.ready(d.ready.length,d.F,d.late.length)}</p>
  <button type="button" className={c.setCard} onClick={()=>sheet.open(true)} aria-haspopup="dialog" data-coach-settings="">
   <span className={c.setMain}><b>{store.team.name||w.teamName}</b><span>{fmt} · {s.periods} × {s.periodMin} {w.min} · {w.subEvery.toLowerCase()} {s.subEvery} {w.min}{pre.keeper?` · ${s.keeper==='fixed'?w.keeperFixed:w.keeperRotate}`:''}</span></span>
   <span className={c.setGo}>{w.gameSettings}<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
  </button>
  {sheet.value&&<div className={c.sheet} data-closing={sheet.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)sheet.close();}} onKeyDown={e=>{if(e.key==='Escape')sheet.close();}}>
   <div className={`${c.sheetIn} ${c.setSheet}`} ref={panel} role="dialog" aria-modal="true" aria-labelledby="coach-settings">
    <div className={c.sheetHead} {...swipe}><span className={c.grab} aria-hidden="true"/><p className={c.sheetTitle} id="coach-settings">{w.gameSettings}</p><button type="button" className={c.doneBtn} onClick={sheet.close} autoFocus>{w.sheetDone}</button></div>
    <div className={c.sheetBody}>
     <label className={c.sec}><span className={c.lbl}>{w.teamName}</span><input className={c.input} value={store.team.name} placeholder={w.teamNamePh} maxLength={24} onChange={e=>{const v=e.target.value;update(x=>({...x,team:{...x.team,name:v.slice(0,24)}}));}}/></label>
     <div className={c.sec}><p className={c.lbl}>{w.format}</p>
      <div className={c.fmtGrid} role="group" aria-label={w.format}>{PRESETS.map(p=><button key={p.id} type="button" className={c.fmtBtn} aria-pressed={s.format===p.id}
       onClick={()=>update(x=>({...x,settings:settingsFor(p),spots:[]}))}><b>{w.fmt(p.id)}</b>{p.ages&&<small>{p.ages}</small>}</button>)}</div></div>
     <Seg label={w.periods} value={s.periods} options={[1,2,3,4]} names={n=>n} onPick={v=>update(x=>({...x,settings:{...x.settings,periods:v}}))}/>
     <div className={c.sec}><Stepper w={w} id="cs-min" label={w.minutes} value={s.periodMin} options={[8,10,12,15,20,25,30,35,40,45]} fmt={n=>`${n} ${w.min}`} onChange={v=>update(x=>({...x,settings:{...x.settings,periodMin:v,subEvery:Math.min(x.settings.subEvery,v)}}))}/></div>
     <div className={c.secTight}><Stepper w={w} id="cs-sub" label={w.subEvery} value={s.subEvery} options={[2,3,4,5,6,8,10,12,15].filter(n=>n<=s.periodMin)} fmt={n=>`${n} ${w.min}`} onChange={v=>update(x=>({...x,settings:{...x.settings,subEvery:v}}))}/></div>
     {pre.keeper&&<Seg label={w.keeper} value={s.keeper} options={['rotate','fixed'] as const} names={k=>k==='rotate'?w.keeperRotate:w.keeperFixed} onPick={k=>update(x=>({...x,settings:{...x.settings,keeper:k}}))}/>}
     <Seg label={w.subStyle} value={s.rolling} options={[false,true] as const} names={r=>r?w.rolling:w.stoppages} onPick={r=>update(x=>({...x,settings:{...x.settings,rolling:r}}))}/>
     {/* UX audit C14: at a stoppage, the most players changed at once */}
     {!s.rolling&&<div className={c.secTight}><Stepper w={w} id="cs-swaps" label={w.maxSwaps} value={s.maxSwaps||6} options={[1,2,3,4,5,6]} fmt={n=>String(n)} onChange={v=>update(x=>({...x,settings:{...x.settings,maxSwaps:v}}))}/></div>}
    </div>
   </div>
  </div>}
  <h2 className={c.h2}>{w.playersN(players.length)}</h2>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
  {d.keeperNote&&<p className={c.note} data-keeper-note="">{d.keeperNote==='none'?w.noKeeper:w.oneKeeper(label(players.find(p=>p.id===d.keepers[0])))}</p>}
  {d.here.length>0&&d.here.length<s.onField&&<p className={c.err}>{w.notEnough(s.onField)}</p>}
  {!players.length&&<div className={`${c.empty} ${c.squadEmpty} fi-pop`}><p className={c.emptyTitle}>{w.startHere}</p><p className={c.emptyHelp}>{w.squadHelp}</p>
   <div className={c.quickRow}><Stepper w={w} id="cs-quick" label={w.playersLbl} value={quick} options={Array.from({length:23},(_,i)=>i+4)} fmt={n=>String(n)} onChange={setQuick}/>
    <button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={()=>add(quick)}>{w.addN(quick)}</button></div></div>}
  <ul className={c.squad}>{[...players].sort((a,b)=>a.num-b.num).map((p,i)=><li key={p.id} className={`${c.row} fi-in`} style={{'--i':Math.min(i,8)} as React.CSSProperties}>
   <NumberInput w={w} value={p.num} taken={nums} onCommit={n=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,num:n}:x))}/>
   <input className={c.input} aria-label={`${w.nameOpt}, #${p.num}`} placeholder={w.nameOpt} value={p.name} maxLength={24} onChange={e=>{const v=e.target.value;update(x=>({...x,team:{...x.team,players:x.team.players.map(q=>q.id===p.id?{...q,name:v.slice(0,24)}:q)}}));}}/>
   <div className={c.rowTools}>
    {presetOf(s.format).keeper&&<button type="button" className={c.iconBtn} aria-pressed={p.gk} aria-label={`${w.gkMark}: #${p.num}`} title={w.gkMark} onClick={()=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,gk:!x.gk}:x))}>{w.gk}</button>}
    <button type="button" className={c.iconBtn} aria-label={`${w.remove} #${p.num}`} onClick={()=>update(x=>({...x,team:{...x.team,players:x.team.players.filter(q=>q.id!==p.id)},here:x.here.filter(i=>i!==p.id)}))}><CrossMark/></button>
   </div>
   {/* UX audit C5: three visible choices (the old one-tap cycle hid "Late" and "Not coming") */}
   {(()=>{const at:Attend=!hereSet.has(p.id)?'away':p.id in store.late?'late':'here';
    return <div className={`${c.segTrack} ${c.attend}`} role="group" aria-label={`${w.attend}: #${p.num}${p.name?' '+p.name:''}`} data-attend={at}>
     {(['here','late','away'] as const).map(v=><button key={v} type="button" className={c.segBtn} aria-pressed={at===v} data-att={v} onClick={()=>update(x=>attend(x,p.id,v))}>{v==='here'?w.here:v==='late'?w.lateBtn:w.away}</button>)}</div>;})()}
   {hereSet.has(p.id)&&p.id in store.late&&<label className={c.lateRow}>{w.arrives}<select className={c.input} value={store.late[p.id]==null?'':String(store.late[p.id])}
    onChange={e=>{const v=e.target.value;update(x=>({...x,late:{...x.late,[p.id]:v===''?null:Number(v)}}));}}>
    <option value="">{w.arrivesUnknown}</option>{lateMinutes(s).map(m=><option key={m} value={m}>{w.minuteN(m)}</option>)}</select></label>}
  </li>)}</ul>
  {players.length>0&&<div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>add(1)}>{w.addPlayer}</button></div>}
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </>;
}
/* ------------------------------------------------------------------ Lineup ----------------------------------------------- */
/* ------------------------------------------------------------------ Lineup (round 4D: drag, drop, pop, morph) ------------ */
/* One drag controller per tab. The lineup itself is only `store.spots` (lib/coach/lineup.ts: a player is always in exactly
   one place); everything a drag draws (the lifted ghost, the flying discs, the shrinking chip) lives in a fixed layer on
   <body> and is removed on EVERY way a press can end: pointerup, pointercancel, lostpointercapture, window blur, a hidden page
   and unmount, with a timer behind each landing animation. Heat: transform/opacity only (CSS keyframes and WAAPI), no rAF
   loop; the glow pulse runs only while a finger is down. */
type Lift={ref:Ref;key:string;pid:number;x0:number;y0:number;moved:boolean;src:HTMLElement;ghost:HTMLDivElement|null;gw:number;gh:number;offY:number;
 targets:{key:string;cx:number;cy:number;r:DOMRect;chip:boolean}[];over:string|null;cx:number;cy:number;done:boolean;canLift:boolean;off:()=>void};
type Fx={n:number;slots:Record<number,string>;hit:number|null;chipsIn:string[]};
const reduced=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}};
const buzz=(ms:number)=>{try{const ua=(navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation;if(ua&&!ua.hasBeenActive)return;navigator.vibrate?.(ms);}catch{/* no vibration */}};
const centre=(r:DOMRect)=>({x:r.left+r.width/2,y:r.top+r.height/2});
function LineupTab({w,store,update,d,onShare,onNext,onMoved,note}:{w:Words;store:Store;update:Up;d:D;onShare:()=>void;onNext:()=>void;onMoved:(msg:string,undo:()=>void)=>void;note:{msg:string;action?:{label:string;run:()=>void}}|null}){
 const byId=new Map(store.team.players.map(p=>[p.id,p])),keeper=store.settings.keeper!=='none';
 const [sel,setSel]=useState<Ref|null>(null);
 const [lifted,setLifted]=useState<string|null>(null);
 const [over,setOver]=useState<string|null>(null);
 const [fx,setFx]=useState<Fx|null>(null);
 const [layer,setLayer]=useState<HTMLDivElement|null>(null);
 const lift=useRef<Lift|null>(null),root=useRef<HTMLDivElement>(null),fxN=useRef(0),timers=useRef<number[]>([]);
 const pending=useRef<{before:string[];rects:Map<string,DOMRect>;hit:number|null;skipFly:string|null;ghost?:HTMLElement|null}|null>(null);
 const dRef=useRef(d);dRef.current=d;
 const later=(f:()=>void,ms:number)=>{const t=window.setTimeout(f,ms);timers.current.push(t);};
 /* the layer: a fixed box on <body>, so no transformed ancestor (screen transitions) can shift the ghost off the finger */
 useEffect(()=>{const el=document.createElement('div');el.className=c.dragLayer;el.setAttribute('aria-hidden','true');el.dataset.dragLayer='';document.body.appendChild(el);setLayer(el);
  const tm=timers.current;return ()=>{tm.forEach(t=>clearTimeout(t));el.remove();};},[]);
 const rectsNow=()=>{const m=new Map<string,DOMRect>();root.current?.querySelectorAll<HTMLElement>('[data-drop]').forEach(e=>{const k=e.dataset.drop!;const t=e.querySelector<HTMLElement>('[data-disc]')??e;m.set(k,t.getBoundingClientRect());});return m;};
 const numOf=(id:string)=>{const p=byId.get(id);return p?String(p.num):'';};
 const sayMove=(m:Move)=>{const n=(id:string)=>label(byId.get(id));const spot=d.form?.spots[m.to]?.label??'';
  return m.kind==='swap'?w.lineupSwap(n(m.on),n(m.off)):m.kind==='in'?w.lineupIn(n(m.on),n(m.off)):w.lineupPlace(n(m.on),spot);};
 /* every change of the lineup goes through here (drag, tap-tap, keyboard, Undo): snapshot where everything is, then commit */
 const commit=(next:string[],hit:number|null,skipFly:string|null,msg:string|null)=>{
  const before=[...dRef.current.spots];pending.current={before,rects:rectsNow(),hit,skipFly};
  update(s=>({...s,spots:next}));setSel(null);
  if(msg){buzz(12);onMoved(msg,()=>commit(before,null,null,null));}
 };
 const apply=(a:Ref,b:Ref,viaDrag:boolean)=>{const m=moveSpots(d.spots,d.bench.map(p=>p.id),a,b);if(!m)return false;
  commit(m.spots,m.to,viaDrag?m.on:null,sayMove(m));return true;};
 /* after the commit renders: numbers that changed roll, the hit spot pops with a ripple, players sent to the bench fly there
    and their chip pops in, a chip that left the bench shrinks out where it was */
 useLayoutEffect(()=>{const p=pending.current;if(!p)return;pending.current=null;p.ghost?.remove();
  const slots:Record<number,string>={},benchNow=new Set(d.bench.map(x=>x.id)),benchBefore=[...p.rects.keys()].filter(k=>k.startsWith('b:')).map(k=>k.slice(2));
  d.spots.forEach((id,i)=>{if((p.before[i]??'')!==id)slots[i]=p.before[i]?numOf(p.before[i]):(d.form?.spots[i]?.label??'');});
  const chipsIn=p.before.filter(id=>id&&benchNow.has(id));
  const n=++fxN.current;setFx({n,slots,hit:p.hit,chipsIn});later(()=>setFx(f=>f&&f.n===n?null:f),720);
  if(!layer||reduced())return;
  const now=rectsNow();
  for(const id of chipsIn){if(id===p.skipFly)continue;const from=p.rects.get(`s:${p.before.indexOf(id)}`),to=now.get(`b:${id}`);if(!from||!to)continue;
   const el=document.createElement('div');el.className=c.flyer;el.textContent=numOf(id);
   el.style.cssText=`width:${from.width}px;height:${from.height}px;left:${from.left}px;top:${from.top}px`;layer.appendChild(el);
   const a=centre(from),b=centre(to),k=Math.min(1,to.height/from.height);
   const an=el.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${(b.x-a.x)*.5}px,${(b.y-a.y)*.5-40}px) scale(1.05)`,offset:.45},{transform:`translate(${b.x-a.x}px,${b.y-a.y}px) scale(${k})`,opacity:.2}],{duration:380,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'});
   const gone=()=>el.remove();an.onfinish=gone;later(gone,600);}
  for(const id of benchBefore){if(benchNow.has(id))continue;const r=p.rects.get(`b:${id}`);if(!r)continue;
   const el=document.createElement('div');el.className=c.shrink;el.textContent=numOf(id);el.style.cssText=`width:${r.width}px;height:${r.height}px;left:${r.left}px;top:${r.top}px`;layer.appendChild(el);
   const an=el.animate([{transform:'scale(1)',opacity:.9},{transform:'scale(.2)',opacity:0}],{duration:220,easing:'cubic-bezier(.55,.06,.68,.19)',fill:'forwards'});
   const gone=()=>el.remove();an.onfinish=gone;later(gone,450);}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[d.spots]);
 const tap=(r:Ref)=>{if(!sel){if(r.k==='s'&&!d.spots[r.i])return;setSel(r);return;}if(refKey(sel)===refKey(r)){setSel(null);return;}if(!apply(sel,r,false))setSel(r.k==='s'&&!d.spots[r.i]?null:r);};
 /* ---- the drag ---- */
 const removeGhost=(L:Lift)=>{L.ghost?.remove();L.ghost=null;};
 const finish=(L:Lift)=>{if(L.done)return;L.done=true;removeGhost(L);if(lift.current===L)lift.current=null;setLifted(null);setOver(null);L.off();};
 const nearest=(L:Lift,x:number,y:number)=>{let best:string|null=null,bd=Infinity;
  for(const t of L.targets){const r=t.r,inside=x>=r.left-10&&x<=r.right+10&&y>=r.top-10&&y<=r.bottom+10,dd=Math.hypot(x-t.cx,y-t.cy),reach=Math.max(r.width,48)*0.95;
   if((inside||dd<reach)&&dd<bd){bd=dd;best=t.key;}}return best;};
 const moveGhost=(L:Lift,x:number,y:number)=>{L.cx=x;L.cy=y+L.offY;if(L.ghost)L.ghost.style.transform=`translate3d(${L.cx-L.gw/2}px,${L.cy-L.gh/2}px,0) scale(${reduced()?1:1.12})`;
  const o=nearest(L,L.cx,L.cy);if(o!==L.over){L.over=o;setOver(o);}};
 const startLift=(L:Lift)=>{L.moved=true;setSel(null);setLifted(L.key);
  /* the ghost is always a pitch disc (a bench chip lifts into the disc it will become) */
  const disc=L.src.querySelector<HTMLElement>('[data-disc]')??root.current?.querySelector<HTMLElement>('[data-disc]'),r=disc?.getBoundingClientRect();L.gw=L.gh=Math.max(r?Math.min(r.width,r.height):52,44);
  if(layer){const g=document.createElement('div');g.className=c.ghost;g.textContent=L.src.dataset.num??'';g.style.width=`${L.gw}px`;g.style.height=`${L.gh}px`;layer.appendChild(g);L.ghost=g;}
  L.targets=[];root.current?.querySelectorAll<HTMLElement>('[data-drop]').forEach(e=>{const k=e.dataset.drop!;if(k===L.key)return;const chip=k.startsWith('b:');if(chip&&L.ref.k==='b')return;
   const t=(e.querySelector<HTMLElement>('[data-disc]')??e).getBoundingClientRect();const cc=centre(t);L.targets.push({key:k,cx:cc.x,cy:cc.y,r:t,chip});});
  buzz(6);};
 const fly=(L:Lift,to:{x:number;y:number},ms:number,easing:string,then:()=>void)=>{const g=L.ghost;let ran=false;const go=()=>{if(ran)return;ran=true;then();};
  if(!g||reduced()){go();return;}
  const an=g.animate([{transform:g.style.transform},{transform:`translate3d(${to.x-L.gw/2}px,${to.y-L.gh/2}px,0) scale(1)`}],{duration:ms,easing,fill:'forwards'});an.onfinish=go;later(go,ms+180);};
 const drop=(L:Lift)=>{const to=parseRef(L.over),t=L.targets.find(x=>x.key===L.over);
  if(to&&t&&moveSpots(d.spots,d.bench.map(p=>p.id),L.ref,to)){L.done=true;L.off();setOver(null);
   /* the ghost stays over the spot until the new lineup has rendered under it (removed in the layout effect), so no frame
      shows the old number; a timer removes it whatever happens */
   fly(L,{x:t.cx,y:t.cy},150,'cubic-bezier(.22,1,.36,1)',()=>{const g=L.ghost;L.ghost=null;if(lift.current===L)lift.current=null;setLifted(null);
    if(apply(L.ref,to,true)&&pending.current)pending.current.ghost=g;else g?.remove();later(()=>g?.remove(),400);});return;}
  /* not on a spot or a chip (outside the pitch, between spots): it springs back to where it came from; nothing changes */
  const home=centre((L.src.querySelector<HTMLElement>('[data-disc]')??L.src).getBoundingClientRect());L.done=true;L.off();setOver(null);
  fly(L,home,320,'cubic-bezier(.34,1.56,.64,1)',()=>{removeGhost(L);if(lift.current===L)lift.current=null;setLifted(null);});};
 const onMove=(e:PointerEvent)=>{const L=lift.current;if(!L||e.pointerId!==L.pid)return;
  if(!L.moved){if(!L.canLift||Math.hypot(e.clientX-L.x0,e.clientY-L.y0)<7)return;startLift(L);}e.preventDefault();moveGhost(L,e.clientX,e.clientY);};
 const onUp=(e:PointerEvent)=>{const L=lift.current;if(!L||e.pointerId!==L.pid)return;
  if(!L.moved){finish(L);if(L.src.contains(e.target as Node)||document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]')===L.src)tap(L.ref);return;}
  moveGhost(L,e.clientX,e.clientY);drop(L);};
 const onCancel=()=>{const L=lift.current;if(L)finish(L);};
 /* the window listeners call the latest render's logic (fresh lineup), and each press keeps its own remover */
 const H=useRef({onMove,onUp,onCancel});H.current={onMove,onUp,onCancel};
 const attach=(L:Lift)=>{const mv=(e:PointerEvent)=>H.current.onMove(e),up=(e:PointerEvent)=>H.current.onUp(e),cn=()=>H.current.onCancel();
  const vis=()=>{if(document.visibilityState==='hidden')cn();};
  window.addEventListener('pointermove',mv,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cn);
  window.addEventListener('blur',cn);document.addEventListener('visibilitychange',vis);window.addEventListener('pagehide',cn);
  L.off=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cn);
   window.removeEventListener('blur',cn);document.removeEventListener('visibilitychange',vis);window.removeEventListener('pagehide',cn);};};
 useEffect(()=>()=>{const L=lift.current;if(L){L.done=true;L.ghost?.remove();L.off();}lift.current=null;},[]);
 const handlers=(r:Ref,num:string)=>({
  'data-drop':refKey(r),'data-num':num,'data-sel':sel?refKey(sel)===refKey(r):false,'data-lifted':lifted===refKey(r),'data-over':over===refKey(r),
  onPointerDown:(e:React.PointerEvent<HTMLElement>)=>{if(e.pointerType==='mouse'&&e.button!==0)return;if(lift.current){finish(lift.current);}
   const has=r.k==='b'||!!d.spots[r.i];
   /* an empty spot cannot be lifted: a press there is only a tap */
   const L:Lift={ref:r,key:refKey(r),pid:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,src:e.currentTarget,ghost:null,gw:52,gh:52,offY:e.pointerType==='touch'?-28:0,targets:[],over:null,cx:0,cy:0,done:false,canLift:has,off:()=>{}};
   lift.current=L;attach(L);
   if(has){try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* the window listeners still see the release */}}},
  onClick:(e:React.MouseEvent)=>{if(e.detail===0)tap(r);/* keyboard: Enter or Space */},
  onContextMenu:(e:React.MouseEvent)=>{if(lift.current?.moved)e.preventDefault();},
 });
 if(!d.here.length)return <><h1 className={c.srOnly}>{w.titleLineup}</h1><div className={c.empty}>{w.emptyTeam}</div></>;
 return <div ref={root} data-dragging={lifted?(lifted.startsWith('b:')?'bench':'spot'):undefined} className={c.lineupRoot}>
  <h1 className={c.srOnly}>{w.titleLineup}</h1>
  <p className={c.note}>{w.dragHint}</p>
  {d.forms.length>1&&<><h2 className={c.h2}>{w.formation}</h2><div className={`${c.seg} ${c.formSeg}`} role="group" aria-label={w.formation}>{d.forms.map(f=><button key={f.slug} type="button" className={c.chip} aria-pressed={d.form?.slug===f.slug} onClick={()=>update(s=>({...s,settings:{...s.settings,formation:f.slug}}))}>{f.label}</button>)}</div></>}
  <div className={c.pitchWrap}>
   <div className={c.pitch} role="group" aria-label={`${w.formation} ${d.form?.slug==='4v4-diamond'?w.diamond:d.form?.label??''}`}>
    <div className={c.pitchLines}/><div className={`${c.box} ${c.boxTop}`}/><div className={`${c.box} ${c.boxBottom}`}/>
    {d.form?.spots.map((sp,i)=>{const p=byId.get(d.spots[i]),r:Ref={k:'s',i};const gk=keeper&&i===0,m=fx?fx.slots[i]:undefined,txt=p?String(p.num):sp.label;
     return <button key={i} type="button" className={`${c.spot} ${gk?c.spotGk:''} ${p?'':c.spotEmpty}`} style={{left:`${4+sp.x*0.92}%`,top:`${4+(100-sp.y)*0.92}%`}}
      aria-label={`${sp.label}: ${p?label(p):'—'}`} {...handlers(r,txt)}>
      <span className={c.discWrap}>
       <span data-disc="" className={`${c.disc} ${m!==undefined?(fx!.hit===i?c.discHit:c.discPop):''}`} key={m!==undefined?`${p?.id??'none'}-${fx!.n}`:(p?.id??'none')}>
        {m!==undefined&&m!==txt?<><span className={c.numOut} aria-hidden="true">{m}</span><span className={c.numIn}>{txt}</span></>:txt}</span>
       {m!==undefined&&fx!.hit===i&&<span className={c.ripple} key={'r'+fx!.n} aria-hidden="true"/>}
      </span>
      <span className={c.spotName}>{p?p.name||`#${p.num}`:sp.label}</span></button>;})}
   </div>
   <div><h2 className={`${c.h2} ${c.benchH}`}>{w.bench}</h2>
    <div className={c.benchRow}>{d.bench.map(p=>{const r:Ref={k:'b',id:p.id};const pop=fx?.chipsIn.includes(p.id);
     return <button key={pop?`${p.id}-${fx!.n}`:p.id} type="button" className={`${c.benchChip} ${pop?c.chipIn:''}`} aria-label={`${w.bench}: ${label(p)}`} {...handlers(r,String(p.num))}>{p.num}{p.name&&<span>{p.name}</span>}</button>;})}</div>
    {note&&<div className={`${c.toast} ${c.toastInline}`} role="status" data-lineup-undo=""><span>{note.msg}</span>{note.action&&<button type="button" onClick={note.action.run}>{note.action.label}</button>}</div>}</div>
  </div>
  <div className={`${c.btnRow} ${c.noPrint}`}>
   <button type="button" className={c.btn} onClick={()=>commit([],null,null,null)}>{w.autoFill}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onShare}>{w.share}</button>
  </div>
  <NextBtn label={w.nextTo(w.titleMinutes)} onClick={onNext}/>
 </div>;
}
/* ------------------------------------------------------------------ Game (the plan) -------------------------------------- */
function GameTab({view,w,store,d,onStart,onResume,onShare,goTeam,onNext}:{view:'minutes'|'subs';w:Words;store:Store;d:D;onStart:()=>void;onResume:()=>void;onShare:()=>void;goTeam:()=>void;onNext:()=>void}){
 const s=store.settings,g=store.game,running=g&&g.clock.status!=='done';
 if(!d.here.length)return <><h1 className={c.srOnly}>{view==='subs'?w.titleSubs:w.titleMinutes}</h1><div className={c.empty}><p className={c.emptyLine}>{w.emptyTeam}</p><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={goTeam}>{w.startHere}</button></div></>;
 const sec=planSeconds(d.plan.blocks),keeper=s.keeper!=='none',fixed=keeper?soleKeeper(d.plan.blocks):null,byId=new Map(store.team.players.map(p=>[p.id,p]));
 const roles=blockRoles(d.plan.blocks,d.spotOf,d.form,keeper),rows=[...d.here].sort((a,b)=>a.num-b.num);
 const changes:{at:string;out:string[];in:string[];gk:string|null}[]=[];
 d.plan.blocks.forEach((b,k)=>{if(!k)return;const p=d.plan.blocks[k-1],ch=changeBetween(p.on,p.gk,b);if(!ch.out.length&&!ch.in.length&&ch.gkFrom===ch.gkTo)return;
  changes.push({at:b.start===0?w.periodName(b.period,s.periods):fmtClock(b.start),out:ch.out,in:ch.in,gk:ch.gkTo!==ch.gkFrom?ch.gkTo:null});});
 const nm=(id:string)=>label(byId.get(id));
 return <>
  {view==='minutes'?<>
  <h1 className={c.srOnly}>{w.titleMinutes}</h1>
  <p className={c.note}>{w.ready(d.ready.length,d.F,d.late.length)} · {s.periods} × {s.periodMin} {w.min}</p>
  <Fair w={w} seconds={sec} ids={d.ready.map(p=>p.id)} skip={new Set(fixed?[fixed]:[])} fixedName={fixed?nm(fixed):undefined} step={s.subEvery}/>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
  {d.keeperNote==='none'&&<p className={c.note} data-keeper-note="">{w.noKeeper}</p>}
  <Legend w={w} keeper={keeper}/>
  <TimelineRows w={w} rows={rows} blocks={d.plan.blocks} roles={roles} settings={s} seconds={sec}/>
  <NextBtn label={w.nextTo(w.titleSubs)} onClick={onNext}/>
  </>:<>
  {/* the substitution rotation: who starts, then one card per change, in order (the timeline lives on Playing time) */}
  <h1 className={c.srOnly}>{w.titleSubs}</h1>
  <p className={c.note}>{w.ready(d.ready.length,d.F,d.late.length)} · {w.subEvery.toLowerCase()} {s.subEvery} {w.min}</p>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
  {d.keeperNote&&<p className={c.note} data-keeper-note="">{d.keeperNote==='none'?w.noKeeper:w.oneKeeper(nm(d.keepers[0]))}</p>}
  <ol className={c.subList}>
   <li className={`${c.subCard} fi-in`} data-start=""><time>{w.atKick}</time><div className={c.subRows}><div className={c.subRow}><span className={c.inTxt}>{w.in}</span><span className={c.nums}>{(d.plan.blocks[0]?.on??[]).map(id=>{const p=byId.get(id);return p?<b key={id} data-gk={d.plan.blocks[0]?.gk===id?'':undefined}>{p.num}<small>{p.name}</small></b>:null;})}</span></div></div></li>
   {changes.map((x,i)=><li key={i} className={`${c.subCard} fi-in`} style={{'--i':Math.min(i+1,8)} as React.CSSProperties}><time>{x.at}</time><div className={c.subRows}>
    {x.out.length>0&&<div className={c.subRow}><span className={c.outTxt}>{w.out}</span><span className={c.nums}>{x.out.map(id=>{const p=byId.get(id);return p?<b key={id}>{p.num}<small>{p.name}</small></b>:null;})}</span></div>}
    {x.in.length>0&&<div className={c.subRow}><span className={c.inTxt}>{w.in}</span><span className={c.nums}>{x.in.map(id=>{const p=byId.get(id);return p?<b key={id} data-on="">{p.num}<small>{p.name}</small></b>:null;})}</span></div>}
    {x.gk&&<p className={c.subGk}>{nm(x.gk)} {w.goesInGoal}</p>}</div></li>)}
  </ol>
  </>}
  <div className={`${c.btnRow} ${c.noPrint}`}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onShare}>{w.share}</button></div>
  <div className={`${c.sticky} ${c.noPrint}`}>{running?<button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={onResume}>{w.resumeGame}</button>
   :<button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={onStart}>{w.startGame}</button>}</div>
 </>;
}
/* ------------------------------------------------------------------ Live game -------------------------------------------- */
type WakeLockNav=Navigator&{wakeLock?:{request(t:'screen'):Promise<{release():Promise<void>;addEventListener(t:'release',f:()=>void):void}>}};
function LiveGame({w,lang,game,team,now,act,canUndo,onUndo,onExit,onSummary,onSub,keepers,beep,sound,toggleSound}:{w:Words;lang:Lang;game:Game;team:Store['team'];now:number;act:(f:(g:Game)=>Game,msg?:string)=>void;
 canUndo:boolean;onUndo:()=>void;onExit:()=>void;onSummary:()=>void;onSub:()=>void;keepers:readonly string[];beep:(soft?:boolean)=>void;sound:boolean;toggleSound:()=>void}){
 const s=game.settings,st=game.clock.status,inPlay=st==='live'||st==='paused',sec=inPlay?clockSec(game.clock,now):0,len=s.periodMin*60+game.clock.added;
 const byId=new Map(team.players.map(p=>[p.id,p])),{played}=playedSeconds(game,sec),nc=nextChange(game),nm=(id:string)=>byId.get(id);
 const pName=w.periodName(Math.min(game.clock.period,s.periods-1),s.periods),up=st==='live'&&sec>=len;
 const due=nc&&nc.due!=null&&inPlay?nc.due-sec:null,now_=due!=null&&due<=0;
 const [wake,setWake]=useState<'on'|'off'|'none'>('off');
 const sheetS=useSheet<Player>(),sheet=sheetS.value,setSheet=(p:Player|null)=>{if(p)sheetS.open(p);else sheetS.close();},livePanel=useRef<HTMLDivElement>(null),liveSwipe=useSwipeDown(livePanel,sheetS.close);
 const alerted=useRef('');
 /* UX audit B4: Done before the change is due asks first (in-app sheet), and one tap = one change (1.5 s guard) */
 const earlyS=useSheet<true>(),goalS=useSheet<number>(),lastTap=useRef(0),quiet=useRef(0);
 const doDone=()=>{const t=Date.now();if(!tapOk(lastTap.current,t))return;lastTap.current=t;quiet.current=t;earlyS.close();onSub();
  act(g=>{const n=nextChange(g);return n?confirmChange(g,Date.now(),n.change,n.index,keepers):g;});};
 const sc=scoreOf(game),info=game.info;
 /* keep the screen on while the live screen is open (and again after the phone comes back) */
 useEffect(()=>{const nav=navigator as WakeLockNav;let lock:{release():Promise<void>}|null=null,gone=false;
  const req=async()=>{if(!nav.wakeLock){setWake('none');return;}try{const l=await nav.wakeLock.request('screen');lock=l;setWake('on');l.addEventListener('release',()=>{if(!gone)setWake('off');});}catch{setWake('none');}};
  void req();const vis=()=>{if(document.visibilityState==='visible')void req();};document.addEventListener('visibilitychange',vis);
  return ()=>{gone=true;document.removeEventListener('visibilitychange',vis);lock?.release().catch(()=>{});};},[]);
 /* alerts: once per planned change (and once when the period's time is up): vibrate, beep, flash; once more, gently, when the change
    is two minutes overdue (UX audit B3); none for a change the coach's own tap just made due */
 const key=alertKey(game,now),missed=!!nc?.missed&&inPlay,overdue=due!=null&&(due<=-OVERDUE_SEC||missed);
 /* round 4G (audit B2): a late player whose expected minute has come: one tap adds them to the plan */
 const [notYet,setNotYet]=useState<string[]>([]),arriving=arrivalsDue(game,now).filter(p=>!notYet.includes(p)).map(nm).filter((p):p is Player=>!!p)[0]??null;
 useEffect(()=>{if(!key||alerted.current===key)return;alerted.current=key;if(Date.now()-quiet.current<2000)return;const soft=key.endsWith(':late');
  try{if((navigator as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation?.hasBeenActive!==false)navigator.vibrate?.(soft?[180]:[250,120,250,120,400]);}catch{/* none */}beep(soft);},[key,beep]);
 const okIds=Object.keys(game.status).filter(p=>(game.status[p]??'ok')==='ok'),onSet=new Set(game.on);
 const bench=okIds.filter(p=>!onSet.has(p)).map(nm).filter((p):p is Player=>!!p).sort((a,b)=>a.num-b.num);
 const away=Object.keys(game.status).filter(p=>game.status[p]!=='ok').map(nm).filter((p):p is Player=>!!p);
 const onP=game.on.map(nm).filter((p):p is Player=>!!p).sort((a,b)=>(game.gk===b.id?1:0)-(game.gk===a.id?1:0)||a.num-b.num);
 const mark=(p:Player,x:Status)=>{setSheet(null);act(g=>setStatus(g,Date.now(),p.id,x,keepers),w.replanned);};
 const pairs=nc?Array.from({length:Math.max(nc.change.out.length,nc.change.in.length)},(_,i)=>[nc.change.out[i],nc.change.in[i]] as const):[];
 const gkNew=nc&&nc.change.gkTo!==nc.change.gkFrom?nc.change.gkTo:null;
 /* the panel folds while the change is far off: open on its own 30 s before (or when due), and on tap; a tap holds only for this
    change and this phase (far / soon), so the 30 s mark always opens it again */
 const foldable=!!nc&&inPlay&&!up&&due!=null,soon=due!=null&&due<=30,pinKey=`${nc?.index??-1}:${game.delay}:${soon?'s':'f'}`;
 const [pin,setPin]=useState<{k:string;open:boolean}|null>(null);
 /* landscape phone and wide screens: the panel has its own column, so it stays open (UX audit B8) */
 const [side,setSide]=useState(false);
 useEffect(()=>{const q=window.matchMedia('(orientation:landscape) and (max-height:520px), (min-width:900px)'),f=()=>setSide(q.matches);f();q.addEventListener('change',f);return ()=>q.removeEventListener('change',f);},[]);
 const open=!foldable||side||(pin&&pin.k===pinKey?pin.open:soon);
 const when=due!=null&&due>0?fmtClock(due):'';
 const Who=({p,cls,extra}:{p:Player;cls:string;extra?:string})=><button type="button" className={`${c.whoBtn} ${cls}`} onClick={()=>setSheet(p)} aria-label={`${label(p)}, ${mins(played[p.id]??0)} ${w.min}${extra?', '+extra:''}`}>
  <b>{p.num}</b><span>{p.name}{extra?` · ${extra}`:''}</span>{/* round 4G (audit C3): the GK mark never truncates; the name does */}{game.gk===p.id&&<i className={c.gkTag}>{w.gk}</i>}<em>{mins(played[p.id]??0)}′</em></button>;
 return <div className={c.live} role="dialog" aria-modal="true" aria-label={w.tabGame}>
  <div className={c.liveTop}>
   {/* the app's language (w.langCode is the OTHER language, for the toggle: it made Back read "Volver" in English) */}
   <HeaderGoldBack lang={lang} onBack={onExit} data={{'data-live-back':''}}/>
   <div className={c.period}>{st==='break'?w.breakName(s.periods):st==='done'?w.over:pName}<small>{team.name||w.appName}{info?.opp?` ${w.vs(info.opp)}`:''}</small></div>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onUndo} disabled={!canUndo} aria-disabled={!canUndo}>{w.undo}</button>
  </div>
  <div className={c.liveMid}>
   <div className={c.clockRow}>
    <div><div className={c.clock} data-up={up} role="timer" aria-label={fmtClock(sec)}>{fmtClock(sec)}</div>
     {game.clock.added>0&&<div className={c.added}>+{Math.round(game.clock.added/60)} {w.min}</div>}</div>
    {inPlay&&<div className={c.clockBtns}>
     <button type="button" className={`${c.btn} ${st==='paused'?c.btnGold:''}`} onClick={()=>act(g=>({...g,clock:st==='paused'?resumeClock(g.clock,Date.now()):pauseClock(g.clock,Date.now())}))}>{st==='paused'?w.resume:w.pause}</button>
     <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>act(g=>({...g,clock:addStoppage(g.clock)}))}>{w.stoppage}</button>
    </div>}
   </div>
   {/* the score (UX audit C17): + and − for each side; a goal for us asks who scored (optional) */}
   {st!=='pre'&&<div className={c.scoreRow} role="group" aria-label={w.score} data-score={`${sc.us}-${sc.them}`}>
    <div className={c.scoreSide}><span className={c.scoreName}>{team.name||w.us}</span><div className={c.scoreCtl}>
     <button type="button" className={`${c.btn} ${c.btnGhost} ${c.scoreBtn}`} aria-label={w.lessUs} disabled={!sc.us} onClick={()=>act(g=>removeGoal(g))}>−</button>
     <output className={c.scoreNum} aria-live="polite">{sc.us}</output>
     <button type="button" className={`${c.btn} ${c.scoreBtn}`} aria-label={w.addGoalUs} data-goal-us="" onClick={()=>{const i=sc.us;act(g=>addGoal(g));goalS.open(i);}}>+</button></div></div>
    <div className={c.scoreSide}><span className={c.scoreName}>{info?.opp||w.them}</span><div className={c.scoreCtl}>
     <button type="button" className={`${c.btn} ${c.btnGhost} ${c.scoreBtn}`} aria-label={w.lessThem} disabled={!sc.them} onClick={()=>act(g=>theirGoal(g,-1))}>−</button>
     <output className={c.scoreNum} aria-live="polite">{sc.them}</output>
     <button type="button" className={`${c.btn} ${c.scoreBtn}`} aria-label={w.addGoalThem} data-goal-them="" onClick={()=>act(g=>theirGoal(g,1))}>+</button></div></div>
   </div>}
   {(game.score?.goals??[]).some(Boolean)&&<p className={c.scorers}>{w.scorers}: {(game.score?.goals??[]).filter(Boolean).map(id=>label(nm(id))).join(', ')}</p>}
   <p className={c.wake}><span>{wake==='on'?w.wakeOn:w.wakeOff}</span><button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} aria-pressed={sound} onClick={toggleSound}>{sound?w.soundOn:w.soundOff}</button></p>
   <div className={c.who}>
    <div className={c.whoHead}>{w.onField} · {onP.length}</div>
    <div className={c.whoList}>{onP.map(p=><Who key={p.id} p={p} cls={c.whoOn}/>)}</div>
    <div className={c.whoHead}>{w.bench} · {bench.length}</div>
    <div className={c.whoList}>{bench.map(p=><Who key={p.id} p={p} cls=""/>)}</div>
    {away.length>0&&<><div className={c.whoHead}>{w.hurt} / {w.left} / {w.late}</div>
     <div className={c.whoList}>{away.map(p=>game.status[p.id]==='late'
      ?<div key={p.id} className={c.lateWho}><Who p={p} cls={c.whoOut} extra={w.late}/><button type="button" className={`${c.btn} ${c.btnGold}`} data-arrived={p.id} onClick={()=>mark(p,'ok')}>{w.arrived}</button></div>
      :<Who key={p.id} p={p} cls={c.whoOut} extra={game.status[p.id]==='hurt'?w.hurt:w.left}/>)}</div></>}
   </div>
   {inPlay&&!up&&<div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>act(g=>endCurrentPeriod(g,Date.now(),keepers))}>{w.endPeriod(pName)}</button></div>}
  </div>
  {/* the Next change panel (owner, Nov 22 2026: "fix the green bottom to have a better design"): a light card; collapsed to one
     line while the change is far off, open 30 s before it (or on tap); Off -> On in two columns of player chips; Done is the gold
     primary, "1 min later" and Skip are light. It never covers the bench for long: after Done it folds back to one line. */}
  <section className={c.card} data-flash={now_||up} data-open={open?'':undefined} aria-live="assertive" aria-atomic="true" data-next-panel="">
   {arriving&&st!=='done'&&<div className={c.arrive} data-arrive-prompt="">
    <p><b>{w.arrivedQ(label(arriving))}</b></p>
    <div className={c.cardBtns}><button type="button" className={`${c.btn} ${c.done}`} data-arrive-yes="" onClick={()=>mark(arriving,'ok')}>{w.addToPlan}</button>
     <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>setNotYet(x=>[...x,arriving.id])}>{w.notYet}</button></div></div>}
   {st==='done'?<><div className={c.cardHead}><span>{w.over}</span></div><p className={c.calm}>{w.summary}</p><div className={c.cardBtns}><button type="button" className={`${c.btn} ${c.done}`} onClick={onSummary}>{w.tabSummary}</button></div></>
   :up?<><div className={c.cardHead}><span>{w.timeUp}</span><strong>{fmtClock(sec)}</strong></div><div className={c.cardBtns} style={{marginTop:12}}>
     <button type="button" className={`${c.btn} ${c.done}`} onClick={()=>act(g=>endCurrentPeriod(g,Date.now(),keepers))}>{w.endPeriod(pName)}</button>
     <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>({...g,clock:addStoppage(g.clock)}))}>{w.stoppage}</button></div></>
   :!open&&nc?<button type="button" className={c.cardFold} aria-expanded={false} onClick={()=>setPin({k:pinKey,open:true})} data-next-toggle="">
     <span><b>{when?w.changeIn(when):w.nextSub}</b> · {w.swapsN(pairs.length)}</span>
     <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
   :<>
    <div className={c.cardHead}><span>{nc?(now_?w.subNow:w.nextSub):w.noMoreSubs}</span>
     {nc&&<strong>{due==null?(st==='pre'?fmtClock(nc.block.start):w.subAtBreak):due<=0?(s.rolling?'':w.subStopped):w.subIn(fmtClock(due))}</strong>}
     {nc&&foldable&&!side&&<button type="button" className={c.foldBtn} aria-expanded={true} aria-label={w.hideChange} onClick={()=>setPin({k:pinKey,open:false})} data-next-toggle="">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}</div>
    {nc&&pairs.length>0&&<div className={c.swapList} role="table" aria-label={w.nextSub}>
     <div className={c.swapHead} role="row"><span role="columnheader">{w.out}</span><span aria-hidden="true"/><span role="columnheader">{w.in}</span></div>
     {pairs.map(([o,i],k)=><div key={k} className={c.swapRow} role="row">
      <span role="cell" className={`${c.swapChip} ${c.swapOff}`}>{o?<><b>{nm(o)?.num}</b><span>{nm(o)?.name}</span><em className={c.swapMin} aria-label={`${mins(played[o]??0)} ${w.min}`}>{mins(played[o]??0)}′</em></>:<b>—</b>}</span>
      <span className={c.swapArrow} aria-hidden="true">→</span>
      <span role="cell" className={`${c.swapChip} ${c.swapOn}`}>{i?<><b>{nm(i)?.num}</b><span>{nm(i)?.name}</span><em className={c.swapMin} aria-label={`${mins(played[i]??0)} ${w.min}`}>{mins(played[i]??0)}′</em></>:<b>—</b>}</span></div>)}
    </div>}
    {/* round 4G (audit P9): with no change left the panel is not an empty card: the score and the minutes so far */}
    {!nc&&st!=='pre'&&(()=>{const ok=okIds.map(p=>played[p]??0),lo=Math.min(...ok),hi=Math.max(...ok);
     return <div className={c.restCard} data-rest-card=""><p className={c.restScore}><span>{team.name||w.us}</span><b>{sc.us}–{sc.them}</b><span>{info?.opp||w.opponent}</span></p>
      {ok.length>0&&<p className={c.note}>{w.fairEveryone(mins(lo),mins(hi)).replace(/(\d+)–(\d+) (\S+)$/,'$1\u2060–\u2060$2\u00a0$3').replace(/ (\S+)$/,'\u00a0$1')}</p>}</div>;})()}
    {gkNew&&<p className={c.gkLine}>#{nm(gkNew)?.num} {nm(gkNew)?.name} {w.goesInGoal}</p>}
    {nc&&overdue&&<p className={c.overdue} data-overdue="">{missed?w.missedBreak:w.overdueNote(Math.max(1,Math.round(-due!/60)))}</p>}
    <div className={c.cardBtns}>
     {nc&&(inPlay||st==='break')&&<button type="button" className={`${c.btn} ${c.done}`} data-done="" onClick={()=>{if(due!=null&&due>0&&tapOk(lastTap.current,Date.now())){earlyS.open(true);return;}doDone();}}>{w.done}<CheckMark/></button>}
     {(st==='pre'||st==='break')&&<button type="button" className={`${c.btn} ${nc&&st==='break'?c.cardGhost:c.done}`} style={nc&&st==='break'?{gridColumn:'1/-1'}:undefined} onClick={()=>act(g=>kickOff(g,Date.now()))}>{st==='pre'?w.kickOff:w.kickOffNext(pName)}</button>}
     {/* round 4G (audit C6): on an overdue change "Replan from now" sits next to Done, in the first row, always in view */}
     {nc&&inPlay&&overdue&&<button type="button" className={`${c.btn} ${c.cardGhost}`} data-replan-now="" onClick={()=>{quiet.current=Date.now();act(g=>replanNow(g,Date.now(),keepers),w.replanned);}}>{w.replanNow}</button>}
     {nc&&inPlay&&<><button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>delayChange(g,60))}>{w.delay}</button>
      <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>{quiet.current=Date.now();act(g=>skipChange(g,Date.now(),keepers),w.skipped);}}>{w.skip}</button></>}
    </div>
   </>}
  </section>
  {earlyS.value&&<div className={c.sheet} data-closing={earlyS.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)earlyS.close();}} onKeyDown={e=>{if(e.key==='Escape')earlyS.close();}}>
   <div className={c.sheetIn} role="alertdialog" aria-modal="true" aria-labelledby="coach-early" aria-describedby="coach-early-note" data-early-sheet="">
    <p className={c.sheetTitle} id="coach-early">{w.changeEarly}</p>
    <p className={c.calm} id="coach-early-note">{w.changeEarlyNote(when||fmtClock(0))}</p>
    <div className={c.cardBtns}><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={doDone} data-early-yes="">{w.changeNowBtn}</button>
     <button type="button" className={c.btn} onClick={earlyS.close} autoFocus>{w.notYet}</button></div>
   </div></div>}
  {goalS.value!=null&&<div className={c.sheet} data-closing={goalS.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)goalS.close();}} onKeyDown={e=>{if(e.key==='Escape')goalS.close();}}>
   <div className={c.sheetIn} role="dialog" aria-modal="true" aria-labelledby="coach-goal" data-goal-sheet="">
    <p className={c.sheetTitle} id="coach-goal">{w.whoScored}</p>
    <div className={c.whoList}>{onP.map(p=><button key={p.id} type="button" className={`${c.whoBtn} ${c.whoOn}`} onClick={()=>{const i=goalS.value!;act(g=>setScorer(g,i,p.id));goalS.close();}}><b>{p.num}</b><span>{p.name}</span></button>)}</div>
    <button type="button" className={c.btn} onClick={goalS.close} autoFocus>{w.notSure}</button>
   </div></div>}
  {sheet&&<div className={c.sheet} data-closing={sheetS.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)setSheet(null);}} onKeyDown={e=>{if(e.key==='Escape')setSheet(null);}}><div className={c.sheetIn} ref={livePanel} role="dialog" aria-modal="true" aria-label={label(sheet)}>
   <div className={c.grabZone} {...liveSwipe}><span className={c.grab} aria-hidden="true"/></div>
   <p className={c.sheetTitle}>{label(sheet)} · {mins(played[sheet.id]??0)} {w.min}</p>
   {(game.status[sheet.id]??'ok')==='ok'?<>
    <button type="button" className={c.btn} onClick={()=>mark(sheet,'hurt')}>{w.hurt}</button>
    <button type="button" className={c.btn} onClick={()=>mark(sheet,'left')}>{w.left}</button>
    {!onSet.has(sheet.id)&&<button type="button" className={c.btn} onClick={()=>mark(sheet,'late')}>{w.late}</button>}
   </>:<button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>mark(sheet,'ok')}>{game.status[sheet.id]==='late'?w.arrived:w.back}</button>}
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>setSheet(null)}><CrossMark/></button>
  </div></div>}
 </div>;
}
/* ------------------------------------------------------------------ Summary ---------------------------------------------- */
function SummaryTab({w,store,now,onShare,onNew}:{w:Words;store:Store;now:number;onShare:(names:boolean)=>void;onNew:()=>void}){
 const g=store.game??store.last,[names,setNames]=useState(false);/* a parents' link: initials unless the coach includes names (UX audit C2) */
 if(!g)return <><h1 className={c.srOnly}>{w.titleSummary}</h1><div className={c.empty}>{w.noGame}</div></>;
 const done=g.clock.status==='done',sec=done?playedSeconds(g,0).played:summarySeconds(g,now),kept=playedSeconds(g,0).kept;
 const ids=Object.keys(g.status),rows=store.team.players.filter(p=>ids.includes(p.id)).sort((a,b)=>a.num-b.num),max=Math.max(1,...rows.map(p=>sec[p.id]??0));
 const fixed=g.settings.keeper!=='none'?soleKeeper(g.blocks):null,skip=new Set([...(fixed?[fixed]:[]),...ids.filter(p=>g.status[p]!=='ok'),...(g.joined??[])]);
 const csv=()=>{const blob=new Blob([minutesCsv(store.team,g,w.csvWords)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`${(store.team.name||'team').replace(/[^\w-]+/g,'-').toLowerCase()}-minutes.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);};
 return <>
  <h1 className={c.h1}>{done?w.summary:w.planned}</h1>
  <GameLine w={w} lang={store.lang??'en'} info={g.info} score={g.clock.status==='pre'?null:scoreOf(g)} team={store.team.name}/>
  {(g.score?.goals??[]).some(Boolean)&&<p className={c.note}>{w.scorers}: {(g.score?.goals??[]).filter(Boolean).map(id=>label(store.team.players.find(p=>p.id===id))).join(', ')}</p>}
  <Fair w={w} seconds={sec} ids={ids} skip={skip} fixedName={fixed?label(store.team.players.find(p=>p.id===fixed)):undefined} step={g.settings.subEvery}/>
  {/* round 4G (audit C7): minutes that ended well apart say why */}
  {(()=>{const un=unevenNotes(g,sec);if(!un.length)return null;const why={hurt:w.whyHurt,left:w.whyLeft,late:w.whyLate,skip:w.whySkip,other:w.whyOther};
   return <div className={c.uneven} data-uneven=""><p className={c.lbl}>{w.unevenHead}</p><ul>{un.slice(0,5).map(u=><li key={u.p}>{w.missedMin(label(store.team.players.find(p=>p.id===u.p)),mins(u.short))} · {why[u.why]}</li>)}</ul></div>;})()}
  <table className={c.sumTable}><thead><tr><th>#</th><th>{w.nameOpt.split(' (')[0]}</th><th style={{width:'34%'}}><span className="sr-only"/></th><th className={c.r}>{w.inGoal}</th><th className={c.r}>{w.min}</th></tr></thead>
   <tbody>{rows.map(p=><tr key={p.id}><td><b>{p.num}</b></td><td>{p.name}{g.status[p.id]!=='ok'?` · ${g.status[p.id]==='hurt'?w.hurt:g.status[p.id]==='left'?w.left:w.late}`:''}</td>
    <td><span className={c.sumBar} style={{width:`${(sec[p.id]??0)/max*100}%`}}/></td><td className={c.r}>{kept[p.id]?mins(kept[p.id]):''}</td><td className={c.r}><b><Tick value={mins(sec[p.id]??0)}/></b></td></tr>)}</tbody></table>
  <h2 className={c.h2}>{w.plan}</h2>
  <TimelineRows w={w} rows={rows} blocks={playedBlocks(g,now)} settings={g.settings} seconds={sec}/>
  <div className={c.noPrint}>
   <label className={c.check}><input type="checkbox" checked={names} onChange={e=>setNames(e.target.checked)}/>{w.showNames}<span className={c.checkNote}>{names?'':w.namesNote}</span></label>
   <div className={c.btnRow}><button type="button" className={c.btn} onClick={csv}>{w.csv}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>onShare(names)}>{w.share}</button>
    {store.game&&<button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onNew}>{w.newGame}</button>}</div>
  </div>
 </>;
}
/** "Sharks 2–1 Tigers · Sat 29 Nov" (UX audit C17/C2): the game's opponent, date and score, when there are any. */
function GameLine({w,lang,info,score,team}:{w:Words;lang:Lang;info?:MatchInfo;score:{us:number;them:number}|null;team:string}){
 const when=whenLine(info,lang);if(!info?.opp&&!when&&!score)return null;
 return <p className={c.gameLine} data-game-line="">{score?<b>{team||w.us} {score.us}–{score.them} {info?.opp||w.opponent}</b>:info?.opp?<b>{w.vs(info.opp)}</b>:null}{when&&<span>{when}</span>}</p>;
}
/* ------------------------------------------------------------------ a shared link (read-only) ---------------------------- */
function SharedView({w,x,onClose}:{w:Words;x:Shared;onClose:()=>void}){
 const lang=APP_LANGS.find(l=>WORDS[l]===w)??'en';
 const rows:Player[]=x.players.map((p,i)=>({id:String(i),num:p.num,name:p.name,gk:false}));
 const sec:Record<string,number>={};x.seconds.forEach((v,i)=>{sec[String(i)]=v;});
 const shown=x.seconds.some(v=>v>0)?sec:planSeconds(x.blocks),fixed=x.settings.keeper!=='none'?soleKeeper(x.blocks):null;
 const ids=rows.map(p=>p.id).filter(id=>(shown[id]??0)>0);
 return <div className={c.app} data-reading-page="" data-coach-app="">
  {/* round 4G (audit C1): the apps' shared header; the team's name, the format */}
  <AppHeader lang={lang} exit={false} exitAria="" title={x.team||w.sharedTitle} sub={<>{w.fmt(x.settings.format)} · {x.settings.periods} × {x.settings.periodMin} {w.min}</>}/>
  <main className={c.main}>
   {/* the parents' link (UX audit C2): "Minutes played", the game's details and score, no verdict */}
   <h1 className={c.h1}>{x.info||x.done?w.sharedTitle:w.planned}</h1>
   <GameLine w={w} lang={lang} info={x.info?{opp:x.info.opp,date:x.info.date,time:'',home:''}:undefined} score={x.info&&x.info.us!=null&&x.info.them!=null?{us:x.info.us,them:x.info.them}:null} team={x.team}/>
   <Fair w={w} seconds={shown} ids={ids} skip={new Set(fixed?[fixed]:[])} step={x.settings.subEvery} verdict={false}/>
   <TimelineRows w={w} rows={rows.filter(p=>ids.includes(p.id))} blocks={x.blocks} settings={x.settings} seconds={shown}/>
   <div className={c.btnRow}><button type="button" className={c.btn} onClick={onClose}>{w.openMine}</button><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button></div>
  </main>
 </div>;
}
