'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {count} from '@/lib/analytics/tracker';
import {place} from '@/lib/site/pitch';
import {shapeLabel,type Shape} from '@/lib/site/tools/lineup';
import {addStoppage,applyChange,buildPlan,confirmChange,planWithLate,changeBetween,clockSec,delayChange,endCurrentPeriod,fairness,fmtClock,kickOff,newGame,nextChange,nextSpots,pauseClock,
 planSeconds,playedSeconds,PRESETS,presetOf,pushUndo,resumeClock,setStatus,settingsFor,skipChange,summarySeconds,type Game,type PBlock,type Settings,type Status} from '@/lib/coach/engine';
import {cleanPlayers,decodeShare,emptyStore,encodeShare,label,loadStore,minutesCsv,newId,saveStore,toShared,type Lang,type Player,type Shared,type Store} from '@/lib/coach/store';
import {WORDS,type Words} from '@/lib/coach/words';
import c from './coach.module.css';
import {AppHeader} from '@/components/motion/AppHeader';
import TeamShare from '@/components/share/TeamShare';
import type {ShareLesson} from '@/lib/share/teamShare';
import {exitHref,noteAppEntry,screenChange,useOncePerSession,useSheet,useSwipeDown,Tick,useCountUp,type Dir} from '@/components/motion/motion';
import '@/components/motion/motion.css';
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
type Tab='home'|'team'|'lineup'|'minutes'|'subs'|'summary';
/** the bottom bar: Home and the four tools; the summary opens from Home and after a game */
const TABS:readonly Tab[]=['home','team','lineup','minutes','subs'];
const SCREENS:readonly Tab[]=[...TABS,'summary'];
/** the last tool used, for Home's "Continue" card: its own key, so the team record (fi-coach-v1) is untouched */
const LAST_KEY='fi-coach-last-tool';
/** Home's scroll when a tile leaves for another page (/board, /scan, practice plans), restored on the way back */
const HOME_Y='fi-coach-home-y';
/** Nov 22 2026 (owner: "it's confusing to know which one I'm on"): each screen is its own tool with its own title, icon and accent;
 *  the tool pages open the matching one (/coach#tool=lineup, #tool=minutes, #tool=subs). */
const toolFromHash=(h:string):Tab|null=>{const m=/[#&]tool=(home|team|lineup|minutes|subs|summary)\b/.exec(h);return m?m[1] as Tab:null;};
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
const TITLE=(w:Words,t:Tab)=>t==='home'?w.titleHome:t==='team'?w.titleTeam:t==='lineup'?w.titleLineup:t==='minutes'?w.titleMinutes:t==='subs'?w.titleSubs:w.titleSummary;
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
 const startPlan=buildPlan(order,s),plan=late.length?planWithLate([...order,...late.map(p=>p.id)],s,lateOf,keepers):startPlan;
 const spotOf:Record<string,number>={};spots.forEach((id,i)=>{if(id)spotOf[id]=i;});
 return {here,ready,late,form,forms,spots,bench,plan,startPlan,spotOf,keepers,F};
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
const ICONS:Record<Tab,string>={home:'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5',subs:'M7 20V5M3.5 8.5 7 5l3.5 3.5M17 4v15M13.5 15.5 17 19l3.5-3.5',minutes:'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l3 2M9 2h6',team:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.4.9 2.3 2.6 2.5 5.2',
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
function Fair({w,seconds,ids,skip,fixedName,step}:{w:Words;seconds:Readonly<Record<string,number>>;ids:readonly string[];skip:ReadonlySet<string>;fixedName?:string;step:number}){
 /* uneven = a spread of more than one change interval (the planner keeps everyone there all game within one; tests/coach-app.cjs) */
 const f=fairness(seconds,ids,skip),bad=f.spread>step*60+1,lo=useCountUp(mins(f.min)),hi=useCountUp(mins(f.max));
 return <div className={c.fair} aria-live="polite"><div><div className={c.fairBig}>{w.fairEveryone(lo,hi)}</div>{fixedName&&<div className={c.note}>{w.keeperAll(fixedName)}</div>}</div>
  <span className={`${c.fairTag} fi-pop`} key={String(bad)} data-bad={bad}>{bad?w.fairCheck:w.fairGood}</span></div>;
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
/** Equal segments in one track (a 2-4 option choice): the same 52 px pill as the steppers. */
function Seg<T extends string|number|boolean>({label,value,options,names,onPick}:{label:string;value:T;options:readonly T[];names:(v:T)=>ReactNode;onPick:(v:T)=>void}){
 return <div className={c.sec}><p className={c.lbl}>{label}</p><div className={c.segTrack} role="group" aria-label={label} style={{gridTemplateColumns:`repeat(${options.length},minmax(0,1fr))`}}>
  {options.map(o=><button key={String(o)} type="button" className={c.segBtn} aria-pressed={o===value} onClick={()=>onPick(o)}>{names(o)}</button>)}</div></div>;
}
/* ------------------------------------------------------------------ the app ---------------------------------------------- */
export default function CoachApp({shapes,lessons}:{shapes:readonly Shape[];lessons?:readonly ShareLesson[]}){
 const [store,setStore]=useState<Store>(()=>emptyStore());
 const [ready,setReady]=useState(false);
 const [tab,setTab]=useState<Tab>('home');
 const tabRef=useRef<Tab>('home');tabRef.current=tab;
 const [lastTool,setLastTool]=useState<Tab|null>(null);
 const [live,setLiveRaw]=useState(false),liveFrom=useRef<Tab>('subs');
 /* the live screen returns to where it was opened from: Home (the Match day tile) or the plan */
 const setLive=(v:boolean)=>{if(v)liveFrom.current=tabRef.current==='home'?'home':'subs';setLiveRaw(v);};
 const [shared,setShared]=useState<Shared|null>(null);
 const [undo,setUndo]=useState<Game[]>([]);
 const [toast,setToast]=useState<{msg:string;undo:boolean}|null>(null);
 const [now,setNow]=useState(()=>Date.now());
 /* screen motion (components/motion): the direction of the last move (the CSS fallback's entrance) and the tool whose Home tile
    receives the header mark on the way back (a shared element in the View Transition) */
 const [enter,setEnter]=useState<Dir|null>(null);
 /* the motion model (owner, Nov 22 2026: "polished and smooth", like native apps): the bottom tabs swap in place with a 120 ms
    opacity crossfade and keep each screen's scroll; only Home -> a tool pushes (slides in) and Home/Back pops (slides back).
    Screens stay mounted once visited (hidden when inactive), so a tab switch never rebuilds a screen. */
 const [seen,setSeen]=useState<ReadonlySet<Tab>>(()=>new Set());
 useEffect(()=>{if(ready)setSeen(v=>v.has(tab)?v:new Set([...v,tab]));},[tab,ready]);
 const scrollAt=useRef<Partial<Record<Tab,number>>>({});
 const go=(t:Tab,via:'tab'|'push'='push')=>{if(t===tab)return;const dir:Dir=via==='tab'?'tab':t==='home'?'back':tab==='home'?'forward':'tab';
  scrollAt.current[tab]=window.scrollY;
  screenChange(dir,()=>{setEnter(dir);setSeen(v=>v.has(t)?v:new Set([...v,t]));setTab(t);},()=>{window.scrollTo(0,dir==='forward'?0:scrollAt.current[t]??0);});};
 const lang:Lang=store.lang??'en',w=WORDS[lang];
 const audio=useRef<AudioContext|null>(null);
 /* load once: the saved team, the language, a shared link; register the app's own service worker */
 useEffect(()=>{
  let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* storage blocked */}
  const s=loadStore(ls),q=new URLSearchParams(window.location.search).get('lang');
  if(q==='es'||q==='en')s.lang=q;else if(!s.lang)s.lang=(navigator.language||'').toLowerCase().startsWith('es')?'es':'en';
  setStore(s);
  const m=/[#&]s=([A-Za-z0-9_-]+)/.exec(window.location.hash);if(m){const d=decodeShare(m[1]);if(d)setShared(d);}
  const asked=toolFromHash(window.location.hash);
  if(s.game&&s.game.clock.status!=='done'&&s.game.clock.status!=='pre'){setLive(true);setTab('subs');}
  else setTab(asked??'home');
  try{const l=window.localStorage.getItem(LAST_KEY);if(l&&l!=='home'&&(TABS.includes(l as Tab)||l==='summary'))setLastTool(l as Tab);}catch{/* storage blocked */}
  /* one manifest only, the coach app's (app/coach/layout.tsx swaps the site's before paint; React may add the site's back) */
  /* point every manifest link at the app's own; never remove one: React owns them, and a removed node made its next head update
     throw "Cannot read properties of null (reading 'removeChild')" (Nov 22 2026) */
  document.querySelectorAll('link[rel=manifest]').forEach(l=>{(l as HTMLLinkElement).href='/coach/manifest.webmanifest';});
  setReady(true);count('ca:open');noteAppEntry('coach');
  if(!asked&&!(s.game&&s.game.clock.status!=='done'&&s.game.clock.status!=='pre'))try{const y=Number(window.sessionStorage.getItem(HOME_Y));window.sessionStorage.removeItem(HOME_Y);if(y>0)requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,y)));}catch{/* optional */}
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('/coach-sw.js',{scope:'/coach'}).catch(()=>{});
 },[]);
 useEffect(()=>{if(!ready)return;let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* blocked */}saveStore(ls,store);document.documentElement.lang=lang;},[store,ready,lang]);
 const update=useCallback((f:(s:Store)=>Store)=>setStore(s=>f(s)),[]);
 const d=useMemo(()=>derive(store,shapes),[store,shapes]);
 useEffect(()=>{if(!ready||tab==='home')return;setLastTool(tab);try{window.localStorage.setItem(LAST_KEY,tab);}catch{/* optional */}},[tab,ready]);
 const game=store.game;
 /* the live clock: a tick only while the live screen is open */
 useEffect(()=>{if(!live)return;const t=setInterval(()=>setNow(Date.now()),250);return ()=>clearInterval(t);},[live]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),6000);return ()=>clearTimeout(t);},[toast]);
 /* never lose a live game by accident */
 useEffect(()=>{const st=game?.clock.status;if(st!=='live'&&st!=='paused'&&st!=='break')return;
  const h=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',h);return ()=>window.removeEventListener('beforeunload',h);},[game?.clock.status]);
 const act=useCallback((f:(g:Game)=>Game,msg?:string)=>{
  setStore(s=>{if(!s.game)return s;setUndo(u=>pushUndo(u,s.game!));return {...s,game:f(s.game)};});
  if(msg)setToast({msg,undo:true});
 },[]);
 const doUndo=()=>{setUndo(u=>{const prev=u[u.length-1];if(prev)setStore(s=>({...s,game:prev}));return u.slice(0,-1);});setToast(null);};
 const beep=()=>{if(!store.sound)return;try{const a=audio.current;if(!a)return;for(const t of [0,0.35]){const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.setValueAtTime(0.0001,a.currentTime+t);g.gain.exponentialRampToValueAtTime(0.5,a.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+t+0.25);o.connect(g).connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+0.3);}}catch{/* no audio */}};
 const startGame=()=>{
  const status:Record<string,Status>={};for(const p of d.ready)status[p.id]='ok';for(const p of d.late)status[p.id]='late';
  try{audio.current??=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();void audio.current.resume();}catch{/* no audio */}
  setUndo([]);update(s=>({...s,last:s.game?.clock.status==='done'?s.game:s.last,game:newGame(d.startPlan,s.settings,d.spotOf,status,Date.now())}));setLive(true);count('ca:game');
 };
 const shareLink=async(x:Shared)=>{
  const url=`${location.origin}/coach${lang==='es'?'?lang=es':''}#s=${encodeShare(x)}`;
  try{if(navigator.share){await navigator.share({title:x.team||w.plan,url});return;}}catch{/* cancelled */}
  try{await navigator.clipboard.writeText(url);setToast({msg:w.copied,undo:false});}catch{window.prompt(w.copyLink,url);}
 };
 /* Share the game with your team (Nov 20 2026): the same block on the Team and Summary tabs; the team name is only printed. */
 const shareBlock=<TeamShare surface="coach" lang={lang} format={store.settings.format} team={store.team.name} lessons={lessons} heading/>;
 if(shared)return <SharedView w={w} x={shared} onClose={()=>{history.replaceState(null,'',location.pathname+location.search);setShared(null);}}/>;
 const team=store.team;
 return <div className={c.app} data-reading-page="" data-coach-app="" data-tool={tab}>
  {/* the shared header (components/motion/AppHeader): the title centred, the language and then Exit on the right */}
  {/* the language button only on Home (owner, Nov 22 2026); the choice is saved (fi-coach-v1) and the tools follow it */}
  <AppHeader lang={lang} exit={tab==='home'} onLang={tab==='home'?()=>update(s=>({...s,lang:lang==='es'?'en':'es'})):undefined} exitAria={lang==='es'?'Salir de la app del entrenador y volver a Futbol Island':'Exit the coach app and go back to Futbol Island'} exitData={{'data-coach-back':'','data-coach-exit':''}}
   /* the left slot stays empty (owner, Nov 22 2026): every coach screen shows the tab bar, whose Home tab is the one way home */
   title={TITLE(w,tab)} sub={tab==='home'&&team.name?team.name:<>{team.name?`${team.name} · `:''}{presetOf(store.settings.format).id==='futsal'?'Futsal':store.settings.format} · {store.settings.periods} × {store.settings.periodMin} {w.min}</>}/>
  <main className={c.main} id="coach-main">
   {ready&&SCREENS.filter(t=>seen.has(t)||t===tab).map(t=><div key={t} className="fi-screen" hidden={t!==tab} data-enter={t===tab&&enter?enter:undefined}>
    {t==='home'?<HomeTab w={w} store={store} d={d} last={lastTool} lang={lang} go={go} running={!!game&&game.clock.status!=='done'&&game.clock.status!=='pre'} onResume={()=>setLive(true)}
     onMatch={()=>{if(game&&game.clock.status!=='done')setLive(true);else if(d.here.length)startGame();else go('team');}}
     onExample={()=>update(x=>{const ps=EXAMPLE.map((n,i)=>({id:'p'+(i+1).toString(36),num:i+1,name:n,gk:i===0}));return {...x,team:{name:x.team.name||'Blue Sharks',players:cleanPlayers(ps)},here:ps.map(p=>p.id),late:{},spots:[]};})}/>
    :t==='team'?<TeamTab w={w} store={store} update={update} d={d} share={shareBlock}/>
    :t==='lineup'?<LineupTab w={w} store={store} update={update} d={d} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))}/>
    :t==='minutes'||t==='subs'?<GameTab view={t} w={w} store={store} d={d} onStart={startGame} onResume={()=>setLive(true)} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))} goTeam={()=>go('team')}/>
    :<SummaryTab w={w} store={store} now={now} share={shareBlock} onShare={(names:boolean)=>{const g=store.game??store.last;if(g)shareLink(toShared(team,g.settings,g.blocks,summarySeconds(g,Date.now()),g.clock.status==='done',names));}}
      onNew={()=>{if(window.confirm(w.newGameConfirm)){update(s=>({...s,last:s.game??s.last,game:null}));go('minutes');}}}/>}
   </div>)}
  </main>
  <nav className={c.tabs} aria-label={w.appName}>
   {/* one indicator that glides to the current tab (transform only); hidden on the summary, which has no tab */}
   <span className={c.tabInd} aria-hidden="true" data-off={TABS.includes(tab)?undefined:''} style={{transform:`translateX(calc(${Math.max(0,TABS.indexOf(tab))} * (100% + 4px)))`}}/>
   {TABS.map(t=><button key={t} type="button" className={c.tab} data-tool={t} aria-current={tab===t?'page':undefined} onClick={()=>go(t,'tab')}>
    <span className={c.tabDot}/><Icon d={ICONS[t]}/>{t==='home'?w.tabHome:t==='team'?w.tabTeam:t==='lineup'?w.tabLineup:t==='minutes'?w.tabMinutes:t==='subs'?w.tabSubs:w.tabSummary}</button>)}
  </nav>
  {live&&game&&<LiveGame w={w} game={game} team={team} now={now} act={act} canUndo={undo.length>0} onUndo={doUndo} keepers={d.keepers} beep={beep}
   sound={store.sound} toggleSound={()=>update(s=>({...s,sound:!s.sound}))}
   onExit={()=>{const st=game.clock.status;if(st==='done'||window.confirm(w.exitConfirm)){setLive(false);setTab(st==='done'?'summary':liveFrom.current);}}}
   onSummary={()=>{setLive(false);setTab('summary');}} onSub={()=>count('ca:sub')}/>}
  {toast&&<div className={c.toast} role="status"><span>{toast.msg}</span>{toast.undo&&undo.length>0&&<button type="button" onClick={doUndo}>{w.undo}</button>}</div>}
 </div>;
}
type D=ReturnType<typeof derive>;
const EXAMPLE=['Ava','Ben','Carlos','Dani','Eli','Fatima','Gus','Hana','Isla','Jonah','Kai','Leo'];
/* ------------------------------------------------------------------ Home -------------------------------------------------- */
/** Home (Nov 22 2026, owner: "a simple dashboard"): the team at a glance, Continue, and one tile per tool with its icon and accent. */
function HomeTab({w,store,d,last,lang,go,running,onResume,onMatch,onExample}:{w:Words;store:Store;d:D;last:Tab|null;lang:Lang;go:(t:Tab)=>void;running:boolean;onResume:()=>void;onMatch:()=>void;onExample:()=>void}){
 /* motion: the tiles rise in once per browser session; the team card pops in when "Try an example team" fills it */
 const intro=useOncePerSession('fi-coach-intro'),[filled,setFilled]=useState(false);
 const s=store.settings,team=store.team,has=team.players.length>0,fmt=presetOf(s.format).id==='futsal'?'Futsal':s.format;
 const tiles:{key:string;tool:string;name:string;line:string;icon:string;on?:()=>void;href?:string}[]=[
  {key:'lineup',tool:'lineup',name:w.titleLineup,line:w.lineLineup,icon:ICONS.lineup,on:()=>go('lineup')},
  {key:'minutes',tool:'minutes',name:w.titleMinutes,line:w.lineMinutes,icon:ICONS.minutes,on:()=>go('minutes')},
  {key:'subs',tool:'subs',name:w.titleSubs,line:w.lineSubs,icon:ICONS.subs,on:()=>go('subs')},
  {key:'match',tool:'match',name:w.matchDay,line:w.lineMatch,icon:'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4M9 2h6M19 6l1.5-1.5',on:onMatch},
  {key:'summary',tool:'summary',name:w.titleSummary,line:w.lineSummary,icon:ICONS.summary,on:()=>go('summary')},
  {key:'board',tool:'board',name:w.boardName,line:w.lineBoard,icon:'M4 4h16v16H4zM8 9l3 3-3 3M13 15h4',href:'/board?from=coach'},
  {key:'scan',tool:'scan',name:w.scanName,line:w.lineScan,icon:'M12 5c-5 0-8.5 4.5-9.5 7 1 2.5 4.5 7 9.5 7s8.5-4.5 9.5-7c-1-2.5-4.5-7-9.5-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',href:lang==='es'?'/scan?lang=es&from=coach':'/scan?from=coach'},
  {key:'drills',tool:'drills',name:w.drillsName,line:w.lineDrills,icon:'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',href:'/learn/soccer-practice-plans?from=coach'}];
 return <>
  <h1 className={c.srOnly}>{w.titleHome}</h1>
  {has?<section className={`${c.homeTeam} ${filled?'fi-pop':intro?'fi-in':''}`} aria-label={w.homeTeam}>
   <div><p className={c.homeTeamName}>{team.name||w.homeTeam}</p><p className={c.homeTeamMeta}>{fmt} · {s.periods} × {s.periodMin} {w.min} · {w.playersN(team.players.length)}</p>
    <p className={c.homeTeamMeta}>{w.ready(d.here.length,d.F)}</p></div>
   <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} onClick={()=>go('team')}>{w.editTeam}</button>
  </section>:<section className={`${c.homeEmpty} ${intro?'fi-in':''}`} aria-label={w.homeTeam}>
   <p className={c.homeTeamName}>{w.homeTeam}</p><p className={c.homeTeamMeta}>{w.homeEmpty}</p>
   <div className={c.homeEmptyBtns}><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>go('team')}>{w.setupTeam}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>{setFilled(true);onExample();}}>{w.tryExample}</button></div>
  </section>}
  {has&&(running||last)&&<button type="button" className={`${c.continue} ${intro?'fi-in':''}`} style={{'--i':1} as React.CSSProperties} data-tool={running?'subs':last??'home'} onClick={running?onResume:()=>go(last!)}>
   <span className={c.tileIcon} aria-hidden="true"><Icon d={ICONS[running?'subs':last!]}/></span>
   <span className={c.tileText}><small>{w.continueOn}</small><b>{running?w.resumeGame:TITLE(w,last!)}</b></span>
   <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
  <h2 className={c.h2}>{w.tools}</h2>
  <ul className={c.tiles}>{tiles.map((t,i)=>{const icon=<span className={c.tileIcon} aria-hidden="true"><Icon d={t.icon}/></span>;
   return <li key={t.key} className={intro?'fi-in':undefined} style={intro?{'--i':i+2} as React.CSSProperties:undefined}>{t.href?<a className={c.tile} data-tool={t.tool} href={t.href} onClick={()=>{try{window.sessionStorage.setItem(HOME_Y,String(window.scrollY));}catch{/* optional */}}}>
    {icon}<span className={c.tileText}><b>{t.name}</b><small>{t.line}</small></span></a>
   :<button type="button" className={c.tile} data-tool={t.tool} onClick={t.on}>{icon}<span className={c.tileText}><b>{t.name}</b><small>{t.line}</small></span></button>}</li>;})}</ul>
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </>;
}
/** Minutes a late player can be expected at: every change interval from the first one to the last minute of the game. */
const lateMinutes=(s:Settings)=>{const out:number[]=[],end=s.periods*s.periodMin;for(let m=s.subEvery;m<end;m+=s.subEvery)out.push(m);return out;};
type Up=(f:(s:Store)=>Store)=>void;
/* ------------------------------------------------------------------ Team ------------------------------------------------- */
function TeamTab({w,store,update,d,share}:{w:Words;store:Store;update:Up;d:D;share:ReactNode}){
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
  <h1 className={c.h1}>{w.titleTeam}</h1>
  <p className={c.note}>{w.ready(d.here.length,d.F)}</p>
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
       onClick={()=>update(x=>({...x,settings:settingsFor(p),spots:[]}))}><b>{p.id==='futsal'?'Futsal':p.id}</b>{p.ages&&<small>{p.ages}</small>}</button>)}</div></div>
     <Seg label={w.periods} value={s.periods} options={[1,2,3,4]} names={n=>n} onPick={v=>update(x=>({...x,settings:{...x.settings,periods:v}}))}/>
     <div className={c.sec}><Stepper w={w} id="cs-min" label={w.minutes} value={s.periodMin} options={[8,10,12,15,20,25,30,35,40,45]} fmt={n=>`${n} ${w.min}`} onChange={v=>update(x=>({...x,settings:{...x.settings,periodMin:v,subEvery:Math.min(x.settings.subEvery,v)}}))}/></div>
     <div className={c.secTight}><Stepper w={w} id="cs-sub" label={w.subEvery} value={s.subEvery} options={[2,3,4,5,6,8,10,12,15].filter(n=>n<=s.periodMin)} fmt={n=>`${n} ${w.min}`} onChange={v=>update(x=>({...x,settings:{...x.settings,subEvery:v}}))}/></div>
     {pre.keeper&&<Seg label={w.keeper} value={s.keeper} options={['rotate','fixed'] as const} names={k=>k==='rotate'?w.keeperRotate:w.keeperFixed} onPick={k=>update(x=>({...x,settings:{...x.settings,keeper:k}}))}/>}
     <Seg label={w.subStyle} value={s.rolling} options={[false,true] as const} names={r=>r?w.rolling:w.stoppages} onPick={r=>update(x=>({...x,settings:{...x.settings,rolling:r}}))}/>
    </div>
   </div>
  </div>}
  <h2 className={c.h2}>{w.squad}</h2>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
  {d.here.length>0&&d.here.length<s.onField&&<p className={c.err}>{w.notEnough(s.onField)}</p>}
  {!players.length&&<div className={`${c.empty} ${c.squadEmpty} fi-pop`}><p className={c.emptyTitle}>{w.startHere}</p><p className={c.emptyHelp}>{w.squadHelp}</p>
   <div className={c.quickRow}><Stepper w={w} id="cs-quick" label={w.playersLbl} value={quick} options={Array.from({length:23},(_,i)=>i+4)} fmt={n=>String(n)} onChange={setQuick}/>
    <button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={()=>add(quick)}>{w.addN(quick)}</button></div></div>}
  <ul className={c.squad}>{[...players].sort((a,b)=>a.num-b.num).map((p,i)=><li key={p.id} className={`${c.row} fi-in`} style={{'--i':Math.min(i,8)} as React.CSSProperties}>
   <NumberInput w={w} value={p.num} taken={nums} onCommit={n=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,num:n}:x))}/>
   <input className={c.input} aria-label={`${w.nameOpt}, #${p.num}`} placeholder={w.nameOpt} value={p.name} maxLength={24} onChange={e=>{const v=e.target.value;update(x=>({...x,team:{...x.team,players:x.team.players.map(q=>q.id===p.id?{...q,name:v.slice(0,24)}:q)}}));}}/>
   <div className={c.rowTools}>
    {presetOf(s.format).keeper&&<button type="button" className={c.iconBtn} aria-pressed={p.gk} aria-label={`${w.gkMark}: #${p.num}`} title={w.gkMark} onClick={()=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,gk:!x.gk}:x))}>{w.gk}</button>}
    {/* one tap cycles Coming -> Late -> Not coming -> Coming */}
    <button type="button" className={c.here} data-state={!hereSet.has(p.id)?'away':p.id in store.late?'late':'here'} aria-label={`#${p.num}: ${!hereSet.has(p.id)?w.away:p.id in store.late?w.lateBtn:w.here}`}
     onClick={()=>update(x=>{const {[p.id]:_drop,...rest}=x.late;void _drop;
      return !x.here.includes(p.id)?{...x,here:[...x.here,p.id],late:rest}:p.id in x.late?{...x,here:x.here.filter(i=>i!==p.id),late:rest}:{...x,late:{...x.late,[p.id]:null},spots:x.spots.map(i=>i===p.id?'':i)};})}>
     {!hereSet.has(p.id)?w.away:p.id in store.late?w.lateBtn:w.here}</button>
    <button type="button" className={c.iconBtn} aria-label={`${w.remove} #${p.num}`} onClick={()=>update(x=>({...x,team:{...x.team,players:x.team.players.filter(q=>q.id!==p.id)},here:x.here.filter(i=>i!==p.id)}))}>✕</button>
   </div>
   {hereSet.has(p.id)&&p.id in store.late&&<label className={c.lateRow}>{w.arrives}<select className={c.input} value={store.late[p.id]==null?'':String(store.late[p.id])}
    onChange={e=>{const v=e.target.value;update(x=>({...x,late:{...x.late,[p.id]:v===''?null:Number(v)}}));}}>
    <option value="">{w.arrivesUnknown}</option>{lateMinutes(s).map(m=><option key={m} value={m}>{w.minuteN(m)}</option>)}</select></label>}
  </li>)}</ul>
  {players.length>0&&<div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>add(1)}>{w.addPlayer}</button></div>}
  {share}
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </>;
}
/* ------------------------------------------------------------------ Lineup ----------------------------------------------- */
type Ref={k:'s';i:number}|{k:'b';id:string};
const refKey=(r:Ref)=>r.k==='s'?`s:${r.i}`:`b:${r.id}`;
const parseRef=(s:string|null):Ref|null=>{if(!s)return null;const [k,v]=s.split(':');return k==='s'?{k:'s',i:Number(v)}:k==='b'?{k:'b',id:v}:null;};
function LineupTab({w,store,update,d,onShare}:{w:Words;store:Store;update:Up;d:D;onShare:()=>void}){
 const byId=new Map(store.team.players.map(p=>[p.id,p])),keeper=store.settings.keeper!=='none';
 const [sel,setSel]=useState<Ref|null>(null);
 const [ghost,setGhost]=useState<{x:number;y:number;text:string}|null>(null);
 const [over,setOver]=useState<string|null>(null);
 const drag=useRef<{ref:Ref;x0:number;y0:number;moved:boolean;text:string}|null>(null);
 const swap=(a:Ref,b:Ref)=>{
  const spots=[...d.spots];if(a.k==='b'&&b.k==='b')return;
  const get=(r:Ref)=>r.k==='s'?spots[r.i]:r.id;const x=get(a),y=get(b);
  if(a.k==='s')spots[a.i]=y;if(b.k==='s')spots[b.i]=x;
  update(s=>({...s,spots}));
 };
 const tap=(r:Ref)=>{if(!sel){setSel(r);return;}if(refKey(sel)!==refKey(r))swap(sel,r);setSel(null);};
 const handlers=(r:Ref,text:string)=>({
  'data-drop':refKey(r),'data-sel':sel?refKey(sel)===refKey(r):false,
  onPointerDown:(e:React.PointerEvent<HTMLElement>)=>{drag.current={ref:r,x0:e.clientX,y0:e.clientY,moved:false,text};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}},
  onPointerMove:(e:React.PointerEvent<HTMLElement>)=>{const g=drag.current;if(!g)return;if(!g.moved&&Math.hypot(e.clientX-g.x0,e.clientY-g.y0)>8)g.moved=true;
   if(g.moved){setGhost({x:e.clientX,y:e.clientY,text:g.text});const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');setOver(el?.getAttribute('data-drop')??null);}},
  onPointerUp:(e:React.PointerEvent<HTMLElement>)=>{const g=drag.current;drag.current=null;setGhost(null);setOver(null);if(!g)return;
   if(g.moved){const to=parseRef(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]')?.getAttribute('data-drop')??null);if(to&&refKey(to)!==refKey(g.ref))swap(g.ref,to);setSel(null);}else tap(r);},
  onPointerCancel:()=>{drag.current=null;setGhost(null);setOver(null);},
  onClick:(e:React.MouseEvent)=>{if(e.detail===0)tap(r);/* keyboard: Enter or Space */},
 });
 if(!d.here.length)return <><h1 className={c.h1}>{w.tabLineup}</h1><div className={c.empty}>{w.emptyTeam}</div></>;
 return <>
  <h1 className={c.h1}>{w.tabLineup}</h1>
  <p className={c.note}>{w.dragHint}</p>
  {d.forms.length>1&&<><h2 className={c.h2}>{w.formation}</h2><div className={c.seg} role="group" aria-label={w.formation}>{d.forms.map(f=><button key={f.slug} type="button" className={c.chip} aria-pressed={d.form?.slug===f.slug} onClick={()=>update(s=>({...s,settings:{...s.settings,formation:f.slug}}))}>{f.label}</button>)}</div></>}
  <div className={c.pitchWrap}>
   <div className={c.pitch} role="group" aria-label={`${w.formation} ${d.form?.label??''}`}>
    <div className={c.pitchLines}/><div className={`${c.box} ${c.boxTop}`}/><div className={`${c.box} ${c.boxBottom}`}/>
    {d.form?.spots.map((sp,i)=>{const p=byId.get(d.spots[i]),r:Ref={k:'s',i};const gk=keeper&&i===0;
     return <button key={i} type="button" className={`${c.spot} ${gk?c.spotGk:''} ${p?'':c.spotEmpty}`} style={{left:`${4+sp.x*0.92}%`,top:`${4+(100-sp.y)*0.92}%`}} data-over={over===refKey(r)}
      aria-label={`${sp.label}: ${p?label(p):'—'}`} {...handlers(r,p?String(p.num):sp.label)}>
      <span className={`${c.disc} ${p?'fi-pop':''}`} key={p?.id??'none'}>{p?p.num:sp.label}</span><span className={c.spotName}>{p?.name||sp.label}</span></button>;})}
   </div>
   <div><h2 className={`${c.h2} ${c.benchH}`}>{w.bench}</h2>
    <div className={c.benchRow}>{d.bench.map(p=>{const r:Ref={k:'b',id:p.id};return <button key={p.id} type="button" className={`${c.benchChip} fi-pop`} aria-label={`${w.bench}: ${label(p)}`} {...handlers(r,String(p.num))}>{p.num}{p.name&&<span>{p.name}</span>}</button>;})}</div></div>
  </div>
  <div className={`${c.btnRow} ${c.noPrint}`}>
   <button type="button" className={c.btn} onClick={()=>{update(s=>({...s,spots:[]}));setSel(null);}}>{w.autoFill}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onShare}>{w.share}</button>
  </div>
  {ghost&&<div className={c.ghost} style={{left:ghost.x,top:ghost.y}} aria-hidden="true"><span className={c.disc}>{ghost.text}</span></div>}
 </>;
}
/* ------------------------------------------------------------------ Game (the plan) -------------------------------------- */
function GameTab({view,w,store,d,onStart,onResume,onShare,goTeam}:{view:'minutes'|'subs';w:Words;store:Store;d:D;onStart:()=>void;onResume:()=>void;onShare:()=>void;goTeam:()=>void}){
 const s=store.settings,g=store.game,running=g&&g.clock.status!=='done';
 if(!d.here.length)return <><h1 className={c.h1}>{view==='subs'?w.titleSubs:w.titleMinutes}</h1><div className={c.empty}><p className={c.emptyLine}>{w.emptyTeam}</p><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={goTeam}>{w.startHere}</button></div></>;
 const sec=planSeconds(d.plan.blocks),keeper=s.keeper!=='none',fixed=s.keeper==='fixed'?d.plan.blocks[0]?.gk:null,byId=new Map(store.team.players.map(p=>[p.id,p]));
 const roles=blockRoles(d.plan.blocks,d.spotOf,d.form,keeper),rows=[...d.here].sort((a,b)=>a.num-b.num);
 const changes:{at:string;out:string[];in:string[];gk:string|null}[]=[];
 d.plan.blocks.forEach((b,k)=>{if(!k)return;const p=d.plan.blocks[k-1],ch=changeBetween(p.on,p.gk,b);if(!ch.out.length&&!ch.in.length&&ch.gkFrom===ch.gkTo)return;
  changes.push({at:b.start===0?w.periodName(b.period,s.periods):fmtClock(b.start),out:ch.out,in:ch.in,gk:ch.gkTo!==ch.gkFrom?ch.gkTo:null});});
 const nm=(id:string)=>label(byId.get(id));
 return <>
  {view==='minutes'?<>
  <h1 className={c.h1}>{w.titleMinutes}</h1>
  <p className={c.note}>{w.ready(d.here.length,d.F)} · {s.periods} × {s.periodMin} {w.min}</p>
  <Fair w={w} seconds={sec} ids={d.ready.map(p=>p.id)} skip={new Set(fixed?[fixed]:[])} fixedName={fixed?nm(fixed):undefined} step={s.subEvery}/>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
  <Legend w={w} keeper={keeper}/>
  <TimelineRows w={w} rows={rows} blocks={d.plan.blocks} roles={roles} settings={s} seconds={sec}/>
  </>:<>
  {/* the substitution rotation: who starts, then one card per change, in order (the timeline lives on Playing time) */}
  <h1 className={c.h1}>{w.titleSubs}</h1>
  <p className={c.note}>{w.ready(d.here.length,d.F)} · {w.subEvery.toLowerCase()} {s.subEvery} {w.min}</p>
  {d.late.length>0&&<p className={c.note}>{w.lateNote(d.late.length)}</p>}
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
function LiveGame({w,game,team,now,act,canUndo,onUndo,onExit,onSummary,onSub,keepers,beep,sound,toggleSound}:{w:Words;game:Game;team:Store['team'];now:number;act:(f:(g:Game)=>Game,msg?:string)=>void;
 canUndo:boolean;onUndo:()=>void;onExit:()=>void;onSummary:()=>void;onSub:()=>void;keepers:readonly string[];beep:()=>void;sound:boolean;toggleSound:()=>void}){
 const s=game.settings,st=game.clock.status,inPlay=st==='live'||st==='paused',sec=inPlay?clockSec(game.clock,now):0,len=s.periodMin*60+game.clock.added;
 const byId=new Map(team.players.map(p=>[p.id,p])),{played}=playedSeconds(game,sec),nc=nextChange(game);
 const pName=w.periodName(Math.min(game.clock.period,s.periods-1),s.periods),up=st==='live'&&sec>=len;
 const due=nc&&nc.due!=null&&inPlay?nc.due-sec:null,now_=due!=null&&due<=0;
 const [wake,setWake]=useState<'on'|'off'|'none'>('off');
 const sheetS=useSheet<Player>(),sheet=sheetS.value,setSheet=(p:Player|null)=>{if(p)sheetS.open(p);else sheetS.close();},livePanel=useRef<HTMLDivElement>(null),liveSwipe=useSwipeDown(livePanel,sheetS.close);
 const alerted=useRef('');
 /* keep the screen on while the live screen is open (and again after the phone comes back) */
 useEffect(()=>{const nav=navigator as WakeLockNav;let lock:{release():Promise<void>}|null=null,gone=false;
  const req=async()=>{if(!nav.wakeLock){setWake('none');return;}try{const l=await nav.wakeLock.request('screen');lock=l;setWake('on');l.addEventListener('release',()=>{if(!gone)setWake('off');});}catch{setWake('none');}};
  void req();const vis=()=>{if(document.visibilityState==='visible')void req();};document.addEventListener('visibilitychange',vis);
  return ()=>{gone=true;document.removeEventListener('visibilitychange',vis);lock?.release().catch(()=>{});};},[]);
 /* alerts: once per planned change (and once when the period's time is up): vibrate, beep, flash */
 const key=now_?`c${nc!.index}:${game.delay}`:up?`u${game.clock.period}:${game.clock.added}`:'';
 useEffect(()=>{if(!key||alerted.current===key)return;alerted.current=key;try{navigator.vibrate?.([250,120,250,120,400]);}catch{/* none */}beep();},[key,beep]);
 const nm=(id:string)=>byId.get(id);
 const okIds=Object.keys(game.status).filter(p=>(game.status[p]??'ok')==='ok'),onSet=new Set(game.on);
 const bench=okIds.filter(p=>!onSet.has(p)).map(nm).filter((p):p is Player=>!!p).sort((a,b)=>a.num-b.num);
 const away=Object.keys(game.status).filter(p=>game.status[p]!=='ok').map(nm).filter((p):p is Player=>!!p);
 const onP=game.on.map(nm).filter((p):p is Player=>!!p).sort((a,b)=>(game.gk===b.id?1:0)-(game.gk===a.id?1:0)||a.num-b.num);
 const mark=(p:Player,x:Status)=>{setSheet(null);act(g=>setStatus(g,Date.now(),p.id,x,keepers),w.replanned);};
 const pairs=nc?Array.from({length:Math.max(nc.change.out.length,nc.change.in.length)},(_,i)=>[nc.change.out[i],nc.change.in[i]] as const):[];
 const gkNew=nc&&nc.change.gkTo!==nc.change.gkFrom?nc.change.gkTo:null;
 const Who=({p,cls,extra}:{p:Player;cls:string;extra?:string})=><button type="button" className={`${c.whoBtn} ${cls}`} onClick={()=>setSheet(p)} aria-label={`${label(p)}, ${mins(played[p.id]??0)} ${w.min}${extra?', '+extra:''}`}>
  <b>{p.num}</b><span>{p.name}{game.gk===p.id?` · ${w.gk}`:''}{extra?` · ${extra}`:''}</span><em>{mins(played[p.id]??0)}′</em></button>;
 return <div className={c.live} role="dialog" aria-modal="true" aria-label={w.tabGame}>
  <div className={c.liveTop}>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onExit}>{w.exit}</button>
   <div className={c.period}>{st==='break'?w.breakName(s.periods):st==='done'?w.over:pName}<small>{team.name||w.appName}</small></div>
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
   <p className={c.wake}>{wake==='on'?w.wakeOn:w.wakeOff} · <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} aria-pressed={sound} onClick={toggleSound}>{sound?w.soundOn:w.soundOff}</button></p>
   <div className={c.who}>
    <div className={c.whoHead}>{w.onField} · {onP.length}</div>
    <div className={c.whoList}>{onP.map(p=><Who key={p.id} p={p} cls={c.whoOn}/>)}</div>
    <div className={c.whoHead}>{w.bench} · {bench.length}</div>
    <div className={c.whoList}>{bench.map(p=><Who key={p.id} p={p} cls=""/>)}</div>
    {away.length>0&&<><div className={c.whoHead}>{w.hurt} / {w.left} / {w.late}</div>
     <div className={c.whoList}>{away.map(p=><Who key={p.id} p={p} cls={c.whoOut} extra={game.status[p.id]==='hurt'?w.hurt:game.status[p.id]==='left'?w.left:w.late}/>)}</div></>}
   </div>
   {inPlay&&!up&&<div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>act(g=>endCurrentPeriod(g,Date.now()))}>{w.endPeriod(pName)}</button></div>}
  </div>
  <section className={c.card} data-flash={now_||up} aria-live="assertive" aria-atomic="true">
   {st==='done'?<><div className={c.cardHead}><span>{w.over}</span></div><p className={c.calm}>{w.summary}</p><div className={c.cardBtns}><button type="button" className={`${c.btn} ${c.done}`} onClick={onSummary}>{w.tabSummary}</button></div></>
   :up?<><div className={c.cardHead}><span>{w.timeUp}</span><strong>{fmtClock(sec)}</strong></div><div className={c.cardBtns} style={{marginTop:12}}>
     <button type="button" className={`${c.btn} ${c.done}`} onClick={()=>act(g=>endCurrentPeriod(g,Date.now()))}>{w.endPeriod(pName)}</button>
     <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>({...g,clock:addStoppage(g.clock)}))}>{w.stoppage}</button></div></>
   :<>
    <div className={c.cardHead}><span>{nc?(now_?w.subNow:w.nextSub):w.noMoreSubs}</span>{nc&&<strong>{due==null?(st==='pre'?fmtClock(nc.block.start):w.subAtBreak):due<=0?(s.rolling?'':w.subStopped):w.subIn(fmtClock(due))}</strong>}</div>
    {nc&&<div className={c.pairs} data-many={pairs.length>2}>{pairs.map(([o,i],k)=><div key={k} className={c.pair}>
     <div className={c.pairSide}><small>{w.out}</small>{o?<><b>{nm(o)?.num}</b><span>{nm(o)?.name}</span></>:<b>—</b>}</div><span className={c.arrow} aria-hidden="true">→</span>
     <div className={c.pairSide}><small>{w.in}</small>{i?<><b>{nm(i)?.num}</b><span>{nm(i)?.name}</span></>:<b>—</b>}</div></div>)}</div>}
    {gkNew&&<p className={c.gkLine}>#{nm(gkNew)?.num} {nm(gkNew)?.name} {w.goesInGoal}</p>}
    <div className={c.cardBtns}>
     {nc&&(inPlay||st==='break')&&<button type="button" className={`${c.btn} ${c.done}`} onClick={()=>{onSub();act(g=>{const n=nextChange(g);return n?confirmChange(g,Date.now(),n.change,n.index,keepers):g;});}}>{w.done} ✓</button>}
     {(st==='pre'||st==='break')&&<button type="button" className={`${c.btn} ${nc&&st==='break'?c.cardGhost:c.done}`} style={nc&&st==='break'?{gridColumn:'1/-1'}:undefined} onClick={()=>act(g=>kickOff(g,Date.now()))}>{st==='pre'?w.kickOff:w.kickOffNext(pName)}</button>}
     {nc&&inPlay&&<><button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>delayChange(g,60))}>{w.delay}</button>
      <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>skipChange(g,Date.now(),keepers),w.replanned)}>{w.skip}</button></>}
    </div>
   </>}
  </section>
  {sheet&&<div className={c.sheet} data-closing={sheetS.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)setSheet(null);}} onKeyDown={e=>{if(e.key==='Escape')setSheet(null);}}><div className={c.sheetIn} ref={livePanel} role="dialog" aria-modal="true" aria-label={label(sheet)}>
   <div className={c.grabZone} {...liveSwipe}><span className={c.grab} aria-hidden="true"/></div>
   <p className={c.sheetTitle}>{label(sheet)} · {mins(played[sheet.id]??0)} {w.min}</p>
   {(game.status[sheet.id]??'ok')==='ok'?<>
    <button type="button" className={c.btn} onClick={()=>mark(sheet,'hurt')}>{w.hurt}</button>
    <button type="button" className={c.btn} onClick={()=>mark(sheet,'left')}>{w.left}</button>
    {!onSet.has(sheet.id)&&<button type="button" className={c.btn} onClick={()=>mark(sheet,'late')}>{w.late}</button>}
   </>:<button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>mark(sheet,'ok')}>{game.status[sheet.id]==='late'?w.arrived:w.back}</button>}
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>setSheet(null)}>✕</button>
  </div></div>}
 </div>;
}
/* ------------------------------------------------------------------ Summary ---------------------------------------------- */
function SummaryTab({w,store,now,share,onShare,onNew}:{w:Words;store:Store;now:number;share:ReactNode;onShare:(names:boolean)=>void;onNew:()=>void}){
 const g=store.game??store.last,[names,setNames]=useState(true);
 if(!g)return <><h1 className={c.h1}>{w.tabSummary}</h1><div className={c.empty}>{w.noGame}</div>{share}</>;
 const done=g.clock.status==='done',sec=done?playedSeconds(g,0).played:summarySeconds(g,now),kept=playedSeconds(g,0).kept;
 const ids=Object.keys(g.status),rows=store.team.players.filter(p=>ids.includes(p.id)).sort((a,b)=>a.num-b.num),max=Math.max(1,...rows.map(p=>sec[p.id]??0));
 const fixed=g.settings.keeper==='fixed'?g.blocks[0]?.gk??null:null,skip=new Set([...(fixed?[fixed]:[]),...ids.filter(p=>g.status[p]!=='ok'),...(g.joined??[])]);
 const csv=()=>{const blob=new Blob([minutesCsv(store.team,g,w.csvWords)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`${(store.team.name||'team').replace(/[^\w-]+/g,'-').toLowerCase()}-minutes.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);};
 return <>
  <h1 className={c.h1}>{done?w.summary:w.planned}</h1>
  <Fair w={w} seconds={sec} ids={ids} skip={skip} fixedName={fixed?label(store.team.players.find(p=>p.id===fixed)):undefined} step={g.settings.subEvery}/>
  <table className={c.sumTable}><thead><tr><th>#</th><th>{w.nameOpt.split(' (')[0]}</th><th style={{width:'34%'}}><span className="sr-only"/></th><th className={c.r}>{w.inGoal}</th><th className={c.r}>{w.min}</th></tr></thead>
   <tbody>{rows.map(p=><tr key={p.id}><td><b>{p.num}</b></td><td>{p.name}{g.status[p.id]!=='ok'?` · ${g.status[p.id]==='hurt'?w.hurt:g.status[p.id]==='left'?w.left:w.late}`:''}</td>
    <td><span className={c.sumBar} style={{width:`${(sec[p.id]??0)/max*100}%`}}/></td><td className={c.r}>{kept[p.id]?mins(kept[p.id]):''}</td><td className={c.r}><b><Tick value={mins(sec[p.id]??0)}/></b></td></tr>)}</tbody></table>
  <h2 className={c.h2}>{w.plan}</h2>
  <TimelineRows w={w} rows={rows} blocks={g.blocks} settings={g.settings} seconds={sec}/>
  <div className={c.noPrint}>
   <label className={c.check}><input type="checkbox" checked={names} onChange={e=>setNames(e.target.checked)}/>{w.showNames}</label>
   <div className={c.btnRow}><button type="button" className={c.btn} onClick={csv}>{w.csv}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>onShare(names)}>{w.share}</button>
    {store.game&&<button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onNew}>{w.newGame}</button>}</div>
  </div>
  {share}
 </>;
}
/* ------------------------------------------------------------------ a shared link (read-only) ---------------------------- */
function SharedView({w,x,onClose}:{w:Words;x:Shared;onClose:()=>void}){
 const rows:Player[]=x.players.map((p,i)=>({id:String(i),num:p.num,name:p.name,gk:false}));
 const sec:Record<string,number>={};x.seconds.forEach((v,i)=>{sec[String(i)]=v;});
 const shown=x.seconds.some(v=>v>0)?sec:planSeconds(x.blocks),fixed=x.settings.keeper==='fixed'?x.blocks[0]?.gk??null:null;
 const ids=rows.map(p=>p.id).filter(id=>(shown[id]??0)>0);
 return <div className={c.app} data-reading-page="" data-coach-app="">
  <header className={c.top}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className={c.mark} src="/coach/icon.svg" alt="" width={32} height={32}/>
   <div className={c.topTitle}><b>{x.team||w.shared}</b><span>{x.settings.format} · {x.settings.periods} × {x.settings.periodMin} {w.min}</span></div></header>
  <main className={c.main}>
   <h1 className={c.h1}>{x.done?w.summary:w.shared}</h1><p className={c.note}>{w.sharedNote}</p>
   <Fair w={w} seconds={shown} ids={ids} skip={new Set(fixed?[fixed]:[])} step={x.settings.subEvery}/>
   <TimelineRows w={w} rows={rows.filter(p=>ids.includes(p.id))} blocks={x.blocks} settings={x.settings} seconds={shown}/>
   <div className={c.btnRow}><button type="button" className={c.btn} onClick={onClose}>{w.openMine}</button><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button></div>
  </main>
 </div>;
}
