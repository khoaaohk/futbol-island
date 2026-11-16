'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {count} from '@/lib/analytics/tracker';
import {place} from '@/lib/site/pitch';
import {shapeLabel,type Shape} from '@/lib/site/tools/lineup';
import {addStoppage,applyChange,buildPlan,changeBetween,clockSec,delayChange,endCurrentPeriod,fairness,fmtClock,kickOff,newGame,nextChange,nextSpots,pauseClock,
 planSeconds,playedSeconds,PRESETS,presetOf,pushUndo,resumeClock,setStatus,settingsFor,skipChange,summarySeconds,type Game,type PBlock,type Settings,type Status} from '@/lib/coach/engine';
import {cleanPlayers,decodeShare,emptyStore,encodeShare,label,loadStore,minutesCsv,newId,saveStore,toShared,type Lang,type Player,type Shared,type Store} from '@/lib/coach/store';
import {WORDS,type Words} from '@/lib/coach/words';
import c from './coach.module.css';
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
type Tab='team'|'lineup'|'game'|'summary';
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
/* ------------------------------------------------------------------ derived plan ----------------------------------------- */
function derive(store:Store,shapes:readonly Shape[]){
 const s=store.settings,keeper=s.keeper!=='none',hereSet=new Set(store.here);
 const here=store.team.players.filter(p=>hereSet.has(p.id));
 const forms=formationsFor(s.format,shapes),form=forms.find(f=>f.slug===s.formation)??forms[0];
 const nSpots=form?.spots.length??s.onField,F=Math.min(s.onField,here.length);
 const lastSec=store.last?playedSeconds(store.last,0).played:{};
 /* fair auto order: who played least last game first, then by number */
 const auto=[...here].sort((a,b)=>(lastSec[a.id]??0)-(lastSec[b.id]??0)||a.num-b.num);
 const spots=Array.from({length:nSpots},(_,i)=>{const id=store.spots[i];return id&&hereSet.has(id)?id:'';});
 spots.forEach((id,i)=>{if(id&&spots.indexOf(id)!==i)spots[i]='';});
 const used=new Set(spots.filter(Boolean));
 const fill=(i:number,pick:Player|undefined)=>{if(pick){spots[i]=pick.id;used.add(pick.id);}};
 if(keeper&&!spots[0])fill(0,auto.find(p=>p.gk&&!used.has(p.id))??auto.find(p=>!used.has(p.id)));
 for(let i=0;i<nSpots&&used.size<F;i++)if(!spots[i])fill(i,auto.find(p=>!used.has(p.id)));
 const starters=spots.filter(Boolean),bench=auto.filter(p=>!used.has(p.id));
 const order=[...starters,...bench.map(p=>p.id)];
 const plan=buildPlan(order,s);
 const spotOf:Record<string,number>={};spots.forEach((id,i)=>{if(id)spotOf[id]=i;});
 return {here,form,forms,spots,bench,plan,spotOf,keepers:here.filter(p=>p.gk).map(p=>p.id),F};
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
const ICONS:Record<Tab,string>={team:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.4.9 2.3 2.6 2.5 5.2',
 lineup:'M4 3h16v18H4zM4 12h16M9 3v4h6V3M9 21v-4h6v4',game:'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l3 2M9 2h6',summary:'M5 20V10M12 20V4M19 20v-7'};
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
    <div key={p.id+'m'} className={c.tlMin}>{mins(seconds[p.id]??0)}</div>])}
  </div>
 </div>;
}
function Legend({w,keeper}:{w:Words;keeper:boolean}){
 return <div className={c.legend} aria-hidden="true">{keeper&&<span><i className={c.gk}/>{w.gk}</span>}<span><i className={c.def}/>{w.def}</span><span><i className={c.midC}/>{w.mid}</span><span><i className={c.fwd}/>{w.fwd}</span></div>;
}
function Fair({w,seconds,ids,skip,fixedName,step}:{w:Words;seconds:Readonly<Record<string,number>>;ids:readonly string[];skip:ReadonlySet<string>;fixedName?:string;step:number}){
 const f=fairness(seconds,ids,skip),bad=f.spread>step*60+90;/* one block, plus the odd minute a change waits for a stoppage */
 return <div className={c.fair} aria-live="polite"><div><div className={c.fairBig}>{w.fairEveryone(mins(f.min),mins(f.max))}</div>{fixedName&&<div className={c.note}>{w.keeperAll(fixedName)}</div>}</div>
  <span className={c.fairTag} data-bad={bad}>{bad?w.fairCheck:w.fairGood}</span></div>;
}
function NumberInput({value,taken,onCommit,w}:{value:number;taken:ReadonlySet<number>;onCommit:(n:number)=>void;w:Words}){
 const [draft,setDraft]=useState(String(value));
 useEffect(()=>{setDraft(String(value));},[value]);
 const n=Number(draft),valid=/^\d{1,2}$/.test(draft)&&(n===value||!taken.has(n));
 return <div><input className={`${c.input} ${c.num}`} inputMode="numeric" pattern="[0-9]*" maxLength={2} aria-label={w.number} aria-invalid={!valid} value={draft}
  onChange={e=>{const v=e.target.value.replace(/\D/g,'').slice(0,2);setDraft(v);const k=Number(v);if(/^\d{1,2}$/.test(v)&&(k===value||!taken.has(k)))onCommit(k);}}/>
  {!valid&&<p className={c.err} role="alert">{draft===''?w.numberNeeded:w.numberTaken}</p>}</div>;
}
/* ------------------------------------------------------------------ the app ---------------------------------------------- */
export default function CoachApp({shapes}:{shapes:readonly Shape[]}){
 const [store,setStore]=useState<Store>(()=>emptyStore());
 const [ready,setReady]=useState(false);
 const [tab,setTab]=useState<Tab>('team');
 const [live,setLive]=useState(false);
 const [shared,setShared]=useState<Shared|null>(null);
 const [undo,setUndo]=useState<Game[]>([]);
 const [toast,setToast]=useState<{msg:string;undo:boolean}|null>(null);
 const [now,setNow]=useState(()=>Date.now());
 const lang:Lang=store.lang??'en',w=WORDS[lang];
 const audio=useRef<AudioContext|null>(null);
 /* load once: the saved team, the language, a shared link; register the app's own service worker */
 useEffect(()=>{
  let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* storage blocked */}
  const s=loadStore(ls),q=new URLSearchParams(window.location.search).get('lang');
  if(q==='es'||q==='en')s.lang=q;else if(!s.lang)s.lang=(navigator.language||'').toLowerCase().startsWith('es')?'es':'en';
  setStore(s);
  const m=/[#&]s=([A-Za-z0-9_-]+)/.exec(window.location.hash);if(m){const d=decodeShare(m[1]);if(d)setShared(d);}
  if(s.game&&s.game.clock.status!=='done'&&s.game.clock.status!=='pre'){setLive(true);setTab('game');}
  else setTab(s.team.players.length?'game':'team');
  /* one manifest only, the coach app's (app/coach/layout.tsx swaps the site's before paint; React may add the site's back) */
  document.querySelectorAll('link[rel=manifest]').forEach((l,i)=>{if(i===0)(l as HTMLLinkElement).href='/coach/manifest.webmanifest';else l.remove();});
  setReady(true);count('ca:open');
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('/coach-sw.js',{scope:'/coach'}).catch(()=>{});
 },[]);
 useEffect(()=>{if(!ready)return;let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* blocked */}saveStore(ls,store);document.documentElement.lang=lang;},[store,ready,lang]);
 const update=useCallback((f:(s:Store)=>Store)=>setStore(s=>f(s)),[]);
 const d=useMemo(()=>derive(store,shapes),[store,shapes]);
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
  const status:Record<string,Status>={};for(const p of d.here)status[p.id]='ok';
  try{audio.current??=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();void audio.current.resume();}catch{/* no audio */}
  setUndo([]);update(s=>({...s,last:s.game?.clock.status==='done'?s.game:s.last,game:newGame(d.plan,s.settings,d.spotOf,status,Date.now())}));setLive(true);count('ca:game');
 };
 const shareLink=async(x:Shared)=>{
  const url=`${location.origin}/coach${lang==='es'?'?lang=es':''}#s=${encodeShare(x)}`;
  try{if(navigator.share){await navigator.share({title:x.team||w.plan,url});return;}}catch{/* cancelled */}
  try{await navigator.clipboard.writeText(url);setToast({msg:w.copied,undo:false});}catch{window.prompt(w.copyLink,url);}
 };
 if(shared)return <SharedView w={w} x={shared} onClose={()=>{history.replaceState(null,'',location.pathname+location.search);setShared(null);}}/>;
 const team=store.team;
 return <div className={c.app} data-reading-page="" data-coach-app="">
  <header className={c.top}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className={c.mark} src="/coach/icon.svg" alt="" width={32} height={32}/>
   <div className={c.topTitle}><b>{team.name||w.appName}</b><span>{presetOf(store.settings.format).id==='futsal'?'Futsal':store.settings.format} · {store.settings.periods} × {store.settings.periodMin} {w.min}</span></div>
   <button type="button" className={c.langBtn} lang={w.langCode} onClick={()=>update(s=>({...s,lang:lang==='es'?'en':'es'}))}>{w.lang}</button>
  </header>
  <main className={c.main} id="coach-main">
   {!ready?null:tab==='team'?<TeamTab w={w} store={store} update={update} d={d}/>
    :tab==='lineup'?<LineupTab w={w} store={store} update={update} d={d} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))}/>
    :tab==='game'?<GameTab w={w} store={store} d={d} onStart={startGame} onResume={()=>setLive(true)} onShare={()=>shareLink(toShared(team,store.settings,d.plan.blocks,planSeconds(d.plan.blocks),false,true))} goTeam={()=>setTab('team')}/>
    :<SummaryTab w={w} store={store} now={now} onShare={(names:boolean)=>{const g=store.game??store.last;if(g)shareLink(toShared(team,g.settings,g.blocks,summarySeconds(g,Date.now()),g.clock.status==='done',names));}}
      onNew={()=>{if(window.confirm(w.newGameConfirm)){update(s=>({...s,last:s.game??s.last,game:null}));setTab('game');}}}/>}
  </main>
  <nav className={c.tabs} aria-label={w.appName}>
   {(['team','lineup','game','summary'] as Tab[]).map(t=><button key={t} type="button" className={c.tab} aria-current={tab===t?'page':undefined} onClick={()=>setTab(t)}>
    <span className={c.tabDot}/><Icon d={ICONS[t]}/>{t==='team'?w.tabTeam:t==='lineup'?w.tabLineup:t==='game'?w.tabGame:w.tabSummary}</button>)}
  </nav>
  {live&&game&&<LiveGame w={w} game={game} team={team} now={now} act={act} canUndo={undo.length>0} onUndo={doUndo} keepers={d.keepers} beep={beep}
   sound={store.sound} toggleSound={()=>update(s=>({...s,sound:!s.sound}))}
   onExit={()=>{const st=game.clock.status;if(st==='done'||window.confirm(w.exitConfirm)){setLive(false);setTab(st==='done'?'summary':'game');}}}
   onSummary={()=>{setLive(false);setTab('summary');}} onSub={()=>count('ca:sub')}/>}
  {toast&&<div className={c.toast} role="status"><span>{toast.msg}</span>{toast.undo&&undo.length>0&&<button type="button" onClick={doUndo}>{w.undo}</button>}</div>}
 </div>;
}
type D=ReturnType<typeof derive>;
type Up=(f:(s:Store)=>Store)=>void;
/* ------------------------------------------------------------------ Team ------------------------------------------------- */
function TeamTab({w,store,update,d}:{w:Words;store:Store;update:Up;d:D}){
 const players=store.team.players,nums=new Set(players.map(p=>p.num)),hereSet=new Set(store.here);
 const setPlayers=(f:(ps:Player[])=>Player[],addHere:string[]=[])=>update(s=>({...s,team:{...s.team,players:cleanPlayers(f(s.team.players))},here:[...new Set([...s.here,...addHere])]}));
 const add=(n:number)=>{let num=1;while(nums.has(num)&&num<99)num++;const ids=new Set(players.map(p=>p.id)),added:Player[]=[];
  for(let k=0;k<n;k++){while(nums.has(num)||added.some(a=>a.num===num))num++;if(num>99)break;const id=newId(new Set([...ids,...added.map(a=>a.id)]),Date.now()%100000+k);added.push({id,num,name:'',gk:false});}
  setPlayers(ps=>[...ps,...added],added.map(a=>a.id));};
 const s=store.settings;
 const [quick,setQuick]=useState(12);
 return <>
  <h1 className={c.h1}>{w.tabTeam}</h1>
  <p className={c.note}>{w.privacy}</p>
  <label className={c.field} style={{marginTop:16}}>{w.teamName}<input className={c.input} value={store.team.name} placeholder={w.teamNamePh} maxLength={24} onChange={e=>{const v=e.target.value;update(x=>({...x,team:{...x.team,name:v.slice(0,24)}}));}}/></label>
  <h2 className={c.h2}>{w.format}</h2>
  <div className={c.seg} role="group" aria-label={w.format}>{PRESETS.map(p=><button key={p.id} type="button" className={c.chip} aria-pressed={s.format===p.id}
   onClick={()=>update(x=>({...x,settings:settingsFor(p),spots:[]}))}>{p.id==='futsal'?'Futsal':p.id}{p.ages&&<small>{p.ages}</small>}</button>)}</div>
  <div className={c.grid3} style={{marginTop:14}}>
   <label className={c.field}>{w.periods}<select className={c.input} value={s.periods} onChange={e=>{const v=Number(e.target.value);update(x=>({...x,settings:{...x.settings,periods:v}}));}}>{[1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></label>
   <label className={c.field}>{w.minutes}<select className={c.input} value={s.periodMin} onChange={e=>{const v=Number(e.target.value);update(x=>({...x,settings:{...x.settings,periodMin:v,subEvery:Math.min(x.settings.subEvery,v)}}));}}>{[8,10,12,15,20,25,30,35,40,45].map(n=><option key={n}>{n}</option>)}</select></label>
   <label className={c.field}>{w.subEvery}<select className={c.input} value={s.subEvery} onChange={e=>{const v=Number(e.target.value);update(x=>({...x,settings:{...x.settings,subEvery:v}}));}}>{[2,3,4,5,6,8,10,12,15].filter(n=>n<=s.periodMin).map(n=><option key={n} value={n}>{n} {w.min}</option>)}</select></label>
  </div>
  {presetOf(s.format).keeper&&<><h2 className={c.h2}>{w.keeper}</h2><div className={c.seg} role="group" aria-label={w.keeper}>
   {(['rotate','fixed'] as const).map(k=><button key={k} type="button" className={c.chip} aria-pressed={s.keeper===k} onClick={()=>update(x=>({...x,settings:{...x.settings,keeper:k}}))}>{k==='rotate'?w.keeperRotate:w.keeperFixed}</button>)}</div></>}
  <h2 className={c.h2}>{w.subStyle}</h2>
  <div className={c.seg} role="group" aria-label={w.subStyle}>{([false,true] as const).map(r=><button key={String(r)} type="button" className={c.chip} aria-pressed={s.rolling===r} onClick={()=>update(x=>({...x,settings:{...x.settings,rolling:r}}))}>{r?w.rolling:w.stoppages}</button>)}</div>
  <h2 className={c.h2}>{w.squad}</h2>
  <p className={c.note}>{w.ready(d.here.length,d.F)}</p>
  {d.here.length>0&&d.here.length<s.onField&&<p className={c.err}>{w.notEnough(s.onField)}</p>}
  {!players.length&&<div className={c.empty}><p style={{margin:'0 0 12px',fontWeight:600}}>{w.emptyTeam}</p>
   <div className={c.btnRow} style={{marginTop:0}}><label className={c.field} style={{flexDirection:'row',alignItems:'center',gap:10}}>{w.quickAdd}<select className={c.input} style={{width:84}} value={quick} onChange={e=>setQuick(Number(e.target.value))}>{Array.from({length:23},(_,i)=>i+4).map(n=><option key={n}>{n}</option>)}</select></label>
    <button type="button" className={c.btn} onClick={()=>add(quick)}>{w.startHere}</button></div></div>}
  <ul className={c.squad}>{[...players].sort((a,b)=>a.num-b.num).map(p=><li key={p.id} className={c.row}>
   <NumberInput w={w} value={p.num} taken={nums} onCommit={n=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,num:n}:x))}/>
   <input className={c.input} aria-label={`${w.nameOpt}, #${p.num}`} placeholder={w.nameOpt} value={p.name} maxLength={24} onChange={e=>{const v=e.target.value;update(x=>({...x,team:{...x.team,players:x.team.players.map(q=>q.id===p.id?{...q,name:v.slice(0,24)}:q)}}));}}/>
   <div className={c.rowTools}>
    {presetOf(s.format).keeper&&<button type="button" className={c.iconBtn} aria-pressed={p.gk} aria-label={`${w.gkMark}: #${p.num}`} title={w.gkMark} onClick={()=>setPlayers(ps=>ps.map(x=>x.id===p.id?{...x,gk:!x.gk}:x))}>{w.gk}</button>}
    <button type="button" className={c.here} aria-pressed={hereSet.has(p.id)} aria-label={`#${p.num}: ${hereSet.has(p.id)?w.here:w.away}`} onClick={()=>update(x=>({...x,here:hereSet.has(p.id)?x.here.filter(i=>i!==p.id):[...x.here,p.id]}))}>{hereSet.has(p.id)?w.here:w.away}</button>
    <button type="button" className={c.iconBtn} aria-label={`${w.remove} #${p.num}`} onClick={()=>update(x=>({...x,team:{...x.team,players:x.team.players.filter(q=>q.id!==p.id)},here:x.here.filter(i=>i!==p.id)}))}>✕</button>
   </div></li>)}</ul>
  {players.length>0&&<div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>add(1)}>{w.addPlayer}</button></div>}
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
  <div className={c.pitchWrap} style={{marginTop:16}}>
   <div className={c.pitch} role="group" aria-label={`${w.formation} ${d.form?.label??''}`}>
    <div className={c.pitchLines}/><div className={`${c.box} ${c.boxTop}`}/><div className={`${c.box} ${c.boxBottom}`}/>
    {d.form?.spots.map((sp,i)=>{const p=byId.get(d.spots[i]),r:Ref={k:'s',i};const gk=keeper&&i===0;
     return <button key={i} type="button" className={`${c.spot} ${gk?c.spotGk:''} ${p?'':c.spotEmpty}`} style={{left:`${4+sp.x*0.92}%`,top:`${4+(100-sp.y)*0.92}%`}} data-over={over===refKey(r)}
      aria-label={`${sp.label}: ${p?label(p):'—'}`} {...handlers(r,p?String(p.num):sp.label)}>
      <span className={c.disc}>{p?p.num:sp.label}</span><span className={c.spotName}>{p?.name||sp.label}</span></button>;})}
   </div>
   <div><h2 className={c.h2} style={{marginTop:4}}>{w.bench}</h2>
    <div className={c.benchRow}>{d.bench.map(p=>{const r:Ref={k:'b',id:p.id};return <button key={p.id} type="button" className={c.benchChip} aria-label={`${w.bench}: ${label(p)}`} {...handlers(r,String(p.num))}>{p.num}{p.name&&<span>{p.name}</span>}</button>;})}</div></div>
  </div>
  {keeper&&<><h2 className={c.h2}>{w.keeper}</h2><div className={c.seg} role="group" aria-label={w.keeper}>{(['rotate','fixed'] as const).map(k=><button key={k} type="button" className={c.chip} aria-pressed={store.settings.keeper===k} onClick={()=>update(s=>({...s,settings:{...s.settings,keeper:k}}))}>{k==='rotate'?w.keeperRotate:w.keeperFixed}</button>)}</div></>}
  <div className={`${c.btnRow} ${c.noPrint}`}>
   <button type="button" className={c.btn} onClick={()=>{update(s=>({...s,spots:[]}));setSel(null);}}>{w.autoFill}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onShare}>{w.share}</button>
  </div>
  {ghost&&<div className={c.ghost} style={{left:ghost.x,top:ghost.y}} aria-hidden="true"><span className={c.disc}>{ghost.text}</span></div>}
 </>;
}
/* ------------------------------------------------------------------ Game (the plan) -------------------------------------- */
function GameTab({w,store,d,onStart,onResume,onShare,goTeam}:{w:Words;store:Store;d:D;onStart:()=>void;onResume:()=>void;onShare:()=>void;goTeam:()=>void}){
 const s=store.settings,g=store.game,running=g&&g.clock.status!=='done';
 if(!d.here.length)return <><h1 className={c.h1}>{w.plan}</h1><div className={c.empty}><p style={{marginTop:0}}>{w.emptyTeam}</p><button type="button" className={c.btn} onClick={goTeam}>{w.startHere}</button></div></>;
 const sec=planSeconds(d.plan.blocks),keeper=s.keeper!=='none',fixed=s.keeper==='fixed'?d.plan.blocks[0]?.gk:null,byId=new Map(store.team.players.map(p=>[p.id,p]));
 const roles=blockRoles(d.plan.blocks,d.spotOf,d.form,keeper),rows=[...d.here].sort((a,b)=>a.num-b.num);
 const changes:{at:string;out:string[];in:string[];gk:string|null}[]=[];
 d.plan.blocks.forEach((b,k)=>{if(!k)return;const p=d.plan.blocks[k-1],ch=changeBetween(p.on,p.gk,b);if(!ch.out.length&&!ch.in.length&&ch.gkFrom===ch.gkTo)return;
  changes.push({at:b.start===0?w.periodName(b.period,s.periods):fmtClock(b.start),out:ch.out,in:ch.in,gk:ch.gkTo!==ch.gkFrom?ch.gkTo:null});});
 const nm=(id:string)=>label(byId.get(id));
 return <>
  <h1 className={c.h1}>{w.plan}</h1>
  <p className={c.note}>{w.ready(d.here.length,d.F)} · {s.periods} × {s.periodMin} {w.min}</p>
  <Fair w={w} seconds={sec} ids={d.here.map(p=>p.id)} skip={new Set(fixed?[fixed]:[])} fixedName={fixed?nm(fixed):undefined} step={s.subEvery}/>
  <Legend w={w} keeper={keeper}/>
  <TimelineRows w={w} rows={rows} blocks={d.plan.blocks} roles={roles} settings={s} seconds={sec}/>
  <h2 className={c.h2}>{w.changes}</h2>
  <ol className={c.changes}>{changes.map((x,i)=><li key={i}><time>{x.at}</time><span>{x.out.length>0&&<><span className={c.outTxt}>{w.out}</span> {x.out.map(nm).join(', ')} </>}{x.in.length>0&&<>→ <span className={c.inTxt}>{w.in}</span> {x.in.map(nm).join(', ')}</>}{x.gk&&<> · {nm(x.gk)} {w.goesInGoal}</>}</span></li>)}</ol>
  <div className={`${c.btnRow} ${c.noPrint}`}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onShare}>{w.share}</button></div>
  <div className={`${c.sticky} ${c.noPrint}`}>{running?<button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} style={{minHeight:60}} onClick={onResume}>{w.resumeGame}</button>
   :<button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} style={{minHeight:60}} onClick={onStart}>{w.startGame}</button>}</div>
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
 const [sheet,setSheet]=useState<Player|null>(null);
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
   <p className={c.wake}>{wake==='on'?w.wakeOn:w.wakeOff} · <button type="button" className={`${c.btn} ${c.btnGhost}`} style={{minHeight:40,padding:'0 12px',fontSize:14}} aria-pressed={sound} onClick={toggleSound}>{sound?w.soundOn:w.soundOff}</button></p>
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
     {nc&&(inPlay||st==='break')&&<button type="button" className={`${c.btn} ${c.done}`} onClick={()=>{onSub();act(g=>{const n=nextChange(g);return n?applyChange(g,Date.now(),n.change,n.index):g;});}}>{w.done} ✓</button>}
     {(st==='pre'||st==='break')&&<button type="button" className={`${c.btn} ${nc&&st==='break'?c.cardGhost:c.done}`} style={nc&&st==='break'?{gridColumn:'1/-1'}:undefined} onClick={()=>act(g=>kickOff(g,Date.now()))}>{st==='pre'?w.kickOff:w.kickOffNext(pName)}</button>}
     {nc&&inPlay&&<><button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>delayChange(g,60))}>{w.delay}</button>
      <button type="button" className={`${c.btn} ${c.cardGhost}`} onClick={()=>act(g=>skipChange(g,Date.now(),keepers),w.replanned)}>{w.skip}</button></>}
    </div>
   </>}
  </section>
  {sheet&&<div className={c.sheet} onClick={e=>{if(e.target===e.currentTarget)setSheet(null);}}><div className={c.sheetIn} role="dialog" aria-modal="true" aria-label={label(sheet)}>
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
function SummaryTab({w,store,now,onShare,onNew}:{w:Words;store:Store;now:number;onShare:(names:boolean)=>void;onNew:()=>void}){
 const g=store.game??store.last,[names,setNames]=useState(true);
 if(!g)return <><h1 className={c.h1}>{w.tabSummary}</h1><div className={c.empty}>{w.noGame}</div></>;
 const done=g.clock.status==='done',sec=done?playedSeconds(g,0).played:summarySeconds(g,now),kept=playedSeconds(g,0).kept;
 const ids=Object.keys(g.status),rows=store.team.players.filter(p=>ids.includes(p.id)).sort((a,b)=>a.num-b.num),max=Math.max(1,...rows.map(p=>sec[p.id]??0));
 const fixed=g.settings.keeper==='fixed'?g.blocks[0]?.gk??null:null,skip=new Set([...(fixed?[fixed]:[]),...ids.filter(p=>g.status[p]!=='ok')]);
 const csv=()=>{const blob=new Blob([minutesCsv(store.team,g,w.csvWords)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`${(store.team.name||'team').replace(/[^\w-]+/g,'-').toLowerCase()}-minutes.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);};
 return <>
  <h1 className={c.h1}>{done?w.summary:w.planned}</h1>
  <Fair w={w} seconds={sec} ids={ids} skip={skip} fixedName={fixed?label(store.team.players.find(p=>p.id===fixed)):undefined} step={g.settings.subEvery}/>
  <table className={c.sumTable}><thead><tr><th>#</th><th>{w.nameOpt.split(' (')[0]}</th><th style={{width:'34%'}}><span className="sr-only"/></th><th className={c.r}>{w.inGoal}</th><th className={c.r}>{w.min}</th></tr></thead>
   <tbody>{rows.map(p=><tr key={p.id}><td><b>{p.num}</b></td><td>{p.name}{g.status[p.id]!=='ok'?` · ${g.status[p.id]==='hurt'?w.hurt:g.status[p.id]==='left'?w.left:w.late}`:''}</td>
    <td><span className={c.sumBar} style={{width:`${(sec[p.id]??0)/max*100}%`}}/></td><td className={c.r}>{kept[p.id]?mins(kept[p.id]):''}</td><td className={c.r}><b>{mins(sec[p.id]??0)}</b></td></tr>)}</tbody></table>
  <h2 className={c.h2}>{w.plan}</h2>
  <TimelineRows w={w} rows={rows} blocks={g.blocks} settings={g.settings} seconds={sec}/>
  <div className={c.noPrint}>
   <label className={c.check}><input type="checkbox" checked={names} onChange={e=>setNames(e.target.checked)}/>{w.showNames}</label>
   <div className={c.btnRow}><button type="button" className={c.btn} onClick={csv}>{w.csv}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
    <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>onShare(names)}>{w.share}</button>
    {store.game&&<button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={onNew}>{w.newGame}</button>}</div>
  </div>
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
