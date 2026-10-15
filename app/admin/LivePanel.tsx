'use client';
/**
 * "On now" slide-out (Oct 15 2026; user: "on click 3 on now, opens slide out to show all that info", "how much time they have
 * spent so far", "if they are a returning user with saved codes or not"). Opens from the "N on now" tile in the filter row and
 * slides in from the right (full width on a phone). Closes with the shared Done control (top right, the island's rule), a
 * swipe down from the top of its list, or Escape. Polls /api/admin/live every 10 s while open AND the tab is visible; stops
 * when closed or hidden. Data: lib/analytics/live.ts (supabase/migrations/20261018_analytics_live.sql); anonymous sessions only.
 * The page's pull-to-refresh ignores touches inside the panel (data-pull-ignore), so the two never fight.
 */
import {useCallback,useEffect,useRef,useState,type TouchEvent as ReactTouchEvent} from 'react';
import {DoneButton} from '@/components/DoneButton';
import {LIVE_COUNT_KEYS,LIVE_COUNT_LABEL,LIVE_MIGRATION,LIVE_OK_ROW,LIVE_WINDOWS,flagOf,fmtAgo,fmtSpent,sessionSource,sourceLabel,spotIcon,spotLabel,timeLine,
 type LiveReport,type LiveRow,type LiveWindow} from '@/lib/analytics/live';
import styles from './LivePanel.module.css';

const POLL_MS=10_000,SWIPE_CLOSE_PX=90;
const DEVICE:Record<string,string>={phone:'📱 phone',tablet:'📱 tablet',desktop:'💻 desktop'};

function Strip({label,items}:{label:string;items:{key:string;text:string;sub?:string}[]}){
 return <div className={styles.strip} role="group" aria-label={label}>
  <span className={styles.stripLabel}>{label}</span>
  <ul>{items.length?items.map(i=><li key={i.key}><b>{i.text}</b>{i.sub&&<small>{i.sub}</small>}</li>):<li className={styles.none}>—</li>}</ul>
 </div>;
}

function SessionCard({r,now,countryName}:{r:LiveRow;now:number;countryName:(c:string)=>string}){
 const chips=LIVE_COUNT_KEYS.filter(k=>r.counts[k]>0);
 const where=r.country?`${flagOf(r.country)} ${countryName(r.country)}${r.regionName?` · ${r.regionName}`:''}`:'Location unknown';
 const line=timeLine(r);
 return <li className={styles.card} data-sid={r.sid}>
  <div className={styles.cardTop}>
   <code className={styles.sid} title="Anonymous session (a salted hash, not an id)">#{r.sid}</code>
   <span className={styles.badges}>
    {r.returning!==null&&<span className={styles.badge} data-kind={r.returning?'returning':'new'}>{r.returning?'Returning':'New'}</span>}
    {r.hasCode!==null&&<span className={styles.badge} data-kind={r.hasCode?'code':'nocode'}>{r.hasCode?'Save code':'No code'}</span>}
   </span>
   <span className={styles.spent} title="Foreground time this session (hidden tabs and idle time do not count)">{fmtSpent(r.secondsActive)}</span>
  </div>
  <p className={styles.now}><span aria-hidden="true">{spotIcon(r.spot)}</span> <b>{spotLabel(r.spot)}</b>{r.previousArea&&<small> · before: {spotLabel(r.previousArea)}</small>}</p>
  {line&&<p className={styles.timeLine}>{line}</p>}
  <dl className={styles.facts}>
   <div><dt>Started</dt><dd>{fmtAgo(r.startedAt,now)}</dd></div>
   <div><dt>Last seen</dt><dd>{fmtAgo(r.lastSeen,now)}</dd></div>
   <div><dt>Device</dt><dd>{DEVICE[r.device]??r.device}</dd></div>
   <div><dt>From</dt><dd>{sourceLabel(sessionSource(r))}</dd></div>
   <div className={styles.wide}><dt>Where</dt><dd>{where}</dd></div>
   {r.deviceTodaySessions>1&&<div className={styles.wide}><dt>Same device today</dt><dd>{fmtSpent(r.deviceTodaySeconds)} over {r.deviceTodaySessions} sessions</dd></div>}
  </dl>
  {chips.length>0&&<ul className={styles.chips} aria-label="This session">{chips.map(k=><li key={k}>{r.counts[k]} {LIVE_COUNT_LABEL[k][r.counts[k]===1?0:1]}</li>)}</ul>}
 </li>;
}

export default function LivePanel({open,onClose,countryName}:{open:boolean;onClose:()=>void;countryName:(c:string)=>string}){
 const [minutes,setMinutes]=useState<LiveWindow>(5),[data,setData]=useState<LiveReport|null>(null),[error,setError]=useState(''),[now,setNow]=useState(()=>Date.now());
 const [drag,setDrag]=useState(0);
 const body=useRef<HTMLDivElement>(null),done=useRef<HTMLButtonElement>(null),startY=useRef<number|null>(null),seq=useRef(0);

 const load=useCallback(async(m:number)=>{
  const id=++seq.current;
  try{
   const res=await fetch(`/api/admin/live?minutes=${m}`,{cache:'no-store'});
   if(!res.ok)throw new Error(String(res.status));
   const next=await res.json() as LiveReport;
   if(id===seq.current){setData(next);setError('');setNow(Date.now());}
  }catch{if(id===seq.current)setError('Could not load live sessions. Trying again in a moment.');}
 },[]);

 // Poll while open and visible; a hidden tab holds no timer.
 useEffect(()=>{
  if(!open)return;
  let timer:ReturnType<typeof setInterval>|null=null;
  const arm=()=>{if(timer||document.visibilityState!=='visible')return;void load(minutes);timer=setInterval(()=>void load(minutes),POLL_MS);};
  const disarm=()=>{if(timer){clearInterval(timer);timer=null;}};
  const vis=()=>document.visibilityState==='visible'?arm():disarm();
  arm();document.addEventListener('visibilitychange',vis);
  return()=>{disarm();document.removeEventListener('visibilitychange',vis);};
 },[open,minutes,load]);
 // "3 min ago" keeps moving between polls (a 1 s tick only while open and visible).
 useEffect(()=>{if(!open)return;const t=setInterval(()=>{if(document.visibilityState==='visible')setNow(Date.now());},1000);return()=>clearInterval(t);},[open]);
 useEffect(()=>{
  if(!open)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};
  document.addEventListener('keydown',key);
  const raf=requestAnimationFrame(()=>done.current?.focus({preventScroll:true}));
  return()=>{document.removeEventListener('keydown',key);cancelAnimationFrame(raf);};
 },[open,onClose]);
 useEffect(()=>{if(!open)setDrag(0);},[open]);

 // Swipe down from the top of the list (or the header) closes it.
 const onTouchStart=(e:ReactTouchEvent)=>{startY.current=(body.current?.scrollTop??0)<=0&&e.touches.length===1?e.touches[0].clientY:null;};
 const onTouchMove=(e:ReactTouchEvent)=>{if(startY.current===null)return;const dy=e.touches[0].clientY-startY.current;if(dy<=0||(body.current?.scrollTop??0)>0){setDrag(0);if(dy<0)startY.current=null;return;}setDrag(Math.min(dy*0.6,160));};
 const onTouchEnd=()=>{if(startY.current!==null&&drag>=SWIPE_CLOSE_PX*0.6)onClose();startY.current=null;setDrag(0);};

 const rows=data?.rows??[],cc=data?.byCountry??[];
 const status=data?.status;
 return <div className={styles.root} data-open={open} aria-hidden={!open} data-pull-ignore>
  <div className={styles.scrim} onClick={onClose}/>
  <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="live-title" style={drag?{transform:`translateY(${drag}px)`,transition:'none'}:undefined}
   onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
   <header className={styles.head}>
    <h2 id="live-title"><i className={styles.dot} aria-hidden="true"/>On now <span className={styles.count}>{data?status==='ok'?data.sessions:'—':'…'}</span></h2>
    {open&&<DoneButton ref={done} onDone={onClose} immediate/>}
   </header>
   <div className={styles.body} ref={body}>
    <div className={styles.windows} role="group" aria-label="Window">
     {LIVE_WINDOWS.map(w=><button key={w} type="button" aria-pressed={minutes===w} onClick={()=>{setMinutes(w);}}>{w} min</button>)}
     <span className={styles.note}>{data?.status==='ok'?`updated ${fmtAgo(data.generatedAt,now)}`:''}</span>
    </div>
    {error&&<p className={styles.error} role="alert">{error}</p>}
    {status==='needs-migration'&&<p className={styles.warn} role="status">Live sessions need one database update. In the Supabase SQL editor, paste the whole of <code>{LIVE_MIGRATION}</code> and run it; its last row must read <code>{LIVE_OK_ROW}</code>.</p>}
    {status==='not-configured'&&<p className={styles.warn} role="status">The analytics database is not configured on this server.</p>}
    {status==='ok'&&<>
     <Strip label="Where" items={(data!.byArea).map(a=>({key:a.key,text:`${spotIcon(a.key)} ${spotLabel(a.key)} ${a.n}`}))}/>
     <Strip label="Country" items={cc.map(c=>({key:c.country,text:`${flagOf(c.country)} ${c.country==='(unknown)'?'unknown':c.country} ${c.n}`,
      sub:c.regions.length?c.regions.map(r=>`${r.name} ${r.n??''}`.trim()).join(', '):undefined}))}/>
     <Strip label="Source" items={(data!.bySource).map(s=>({key:s.key,text:`${sourceLabel(s.key)} ${s.n}`}))}/>
     {rows.length?<ul className={styles.cards}>{rows.map(r=><SessionCard key={r.sid+r.startedAt} r={r} now={now} countryName={countryName}/>)}</ul>
      :<p className={styles.empty}>Nobody right now.</p>}
     <p className={styles.foot}>Anonymous sessions with anything sent in the last {data!.minutes} min. Time is foreground time; a tab reports every few minutes and when it is hidden, so the newest minutes arrive late. Location is the country and region a device connects from, never a city or an address.</p>
    </>}
    {!data&&!error&&<p className={styles.empty}>Loading…</p>}
   </div>
  </section>
 </div>;
}
