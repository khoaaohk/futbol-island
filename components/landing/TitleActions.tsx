'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {BackButton} from '../BackButton';
import WaterPill from './WaterPill';
import {SPRING_EASE,flipTransform,invert} from './motion';
import styles from './Title.module.css';
import {startTitleState} from '@/lib/analytics/startEvents';

type Saves=typeof import('./saveCodeAdapter');
/** What the title screen offers. A save code is REQUIRED to play (user decision, Oct 9 2026):
 *  - 'new': Start (make a code) or "I have a save code". No Play.
 *  - 'returning': this browser already has a code → the gold pill is Play (it becomes the water loader).
 *  - 'ready': a code was just made (and seen, with the "which word comes first?" check): the sheet folds back into the gold pill,
 *    which starts loading at once.
 *  - 'restored': a restore's "Welcome back!" Play: the sheet folds into the pill, which loads; the save is applied at the end.
 *  - 'break': saving is unavailable (not set up, server down, offline) → "Saving is taking a break — you can still play today"
 *    + the gold pill. An outage never locks a kid out; it looks clearly different from the normal flow.
 *  Every Play is the water loader (WaterPill + waterLaunch.ts): water rises while the game loads, then the full-tan hand-off. */
export type TitleState='boot'|'new'|'returning'|'ready'|'restored'|'break';
type Sheet={mode:'create'|'restore';from:HTMLElement|null};

const CONFETTI=Array.from({length:18},(_,i)=>({x:Math.round(Math.cos(i*2.4)*(70+(i*37)%90)),y:Math.round(-60-((i*53)%120)),r:(i*47)%360,
 c:['#ef8fd0','#f9d55d','#78d7df','#2e9a5b','#f17732','#2953e7'][i%6],d:(i%5)*30}));
const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** FLIP an element from `from` to where it is now (or the reverse); resolves when done. Compositor-only (transform/opacity). */
function morph(el:HTMLElement,from:DOMRect,{reverse=false,duration=460}={}):Promise<void>{
 if(reduced())return Promise.resolve();
 el.style.transformOrigin='0 0';
 const to=el.getBoundingClientRect(),start={transform:flipTransform(invert(from,to)),borderRadius:'999px'},end={transform:'none',borderRadius:getComputedStyle(el).borderRadius};
 const a=el.animate(reverse?[end,start]:[start,end],{duration,easing:reverse?'cubic-bezier(.5,0,.75,0)':SPRING_EASE,fill:'both'});
 return a.finished.then(()=>{if(!reverse)a.cancel();},()=>{});
}

export default function TitleActions(){
 const [saves,setSaves]=useState<Saves|null>(null),[state,setState]=useState<TitleState>('boot'),[code,setCode]=useState<string|null>(null);
 const [sheet,setSheet]=useState<Sheet|null>(null),[celebrate,setCelebrate]=useState(false),[busy,setBusy]=useState(false);
 const applyRestore=useRef<(()=>void)|null>(null);
 const surface=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),backdrop=useRef<HTMLDivElement>(null),landing=useRef<HTMLDivElement>(null);
 // Start-page analytics: the returning and saving-break cards are counted when they appear (lib/analytics/startEvents.ts).
 useEffect(()=>{startTitleState(state);},[state]);
 const pendingMorph=useRef<DOMRect|null>(null),opener=useRef<HTMLElement|null>(null);
 // Boot: the save module loads at once (the only things on this screen are save actions); a stored code is the fast path.
 useEffect(()=>{let live=true;import('./saveCodeAdapter').then(m=>{if(!live)return;setSaves(m);const have=m.getLocalCode();setCode(have);setState(have?'returning':'new');
  // Warm the one status check so Start answers at once (cached by lib/saves/client).
  void m.isSavingAvailable().catch(()=>false);},()=>{if(live)setState('break');});return()=>{live=false;};},[]);
 // Open: the sheet's surface grows out of the button that opened it.
 useLayoutEffect(()=>{if(!sheet||!surface.current)return;
  const from=sheet.from?.getBoundingClientRect();if(from)void morph(surface.current,from);
  if(!reduced()){content.current?.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:280,delay:160,easing:'ease-out',fill:'backwards'});
   backdrop.current?.animate([{opacity:0},{opacity:1}],{duration:260,fill:'backwards'});}
  content.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[sheet?.mode,!!sheet]);
 // After the sheet leaves into a new state, the landing card (Play / break) pops from where the sheet was.
 useLayoutEffect(()=>{const from=pendingMorph.current;if(!from||!landing.current)return;pendingMorph.current=null;
  // A gold pill landing (ready / restored): the sheet folds into the pill itself and its label fades in as it lands, so no text is
  // ever stretched; other cards morph whole.
  const pill=state==='ready'||state==='restored'?landing.current.querySelector<HTMLElement>('[data-landing-play]'):null;
  if(pill&&!reduced())for(const c of pill.querySelectorAll(':scope>span,:scope>small'))c.animate([{opacity:0},{opacity:1}],{delay:300,duration:220,fill:'backwards'});
  void morph(pill??landing.current,from,{duration:520});},[state]);
 /** Close the sheet into `next` (shared element: the sheet shrinks into the card that replaces it). */
 const leave=useCallback(async(next:TitleState|null)=>{
  const s=surface.current;
  if(next){pendingMorph.current=s?.getBoundingClientRect()??null;setSheet(null);setState(next);return;}
  // Back: shrink into the button that opened it.
  const target=opener.current;
  if(s&&target&&!reduced()){content.current?.animate([{opacity:1},{opacity:0}],{duration:140,fill:'forwards'});backdrop.current?.animate([{opacity:1},{opacity:0}],{duration:320,fill:'forwards'});
   await morph(s,target.getBoundingClientRect(),{reverse:true,duration:300});}
  setSheet(null);target?.focus({preventScroll:true});
 },[]);
 const open=async(mode:'create'|'restore',el:HTMLElement)=>{
  if(!saves||busy)return;opener.current=el;setBusy(true);
  const ok=await saves.isSavingAvailable().catch(()=>false);setBusy(false);
  if(!ok){pendingMorph.current=el.getBoundingClientRect();setState('break');return;}
  setSheet({mode,from:el});
 };
 const created=(c:string|null)=>{
  if(!c){void leave('break');return;}
  setCode(c);setCelebrate(true);
  // The "saved" moment (stamp + riso confetti), then the sheet folds into Play.
  setTimeout(()=>{setCelebrate(false);void leave('ready');},reduced()?400:1150);
 };
 const onCreatePhase=(p:string)=>{if(p==='unavailable'||p==='error')void leave('break');};
 const onRestorePhase=(p:string)=>{if(p==='unavailable')void leave('break');};
 useEffect(()=>{if(!sheet)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();void leave(null);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[sheet,leave]);

 return <div className={styles.actions} data-title-state={state} aria-live="polite">
  {state==='new'&&<div className={styles.choices} data-enter="actions">
   <button type="button" className={styles.start} data-title-start data-track="st:start" disabled={!saves||busy} onClick={e=>void open('create',e.currentTarget)}>
    <span>Start</span><small>Get my save code</small>
   </button>
   <button type="button" className={styles.haveCode} data-title-restore data-track="st:have" disabled={!saves||busy} onClick={e=>void open('restore',e.currentTarget)}>I have a save code</button>
  </div>}
  {state==='returning'&&<div ref={landing} className={styles.choices} data-title-card="returning" data-enter="actions">
   <WaterPill card="returning" label="Play" sub={code?`Welcome back, ${code.split('-')[0]}!`:'Welcome back!'}/>
   <button type="button" className={styles.haveCode} data-track="st:other_code" onClick={e=>void open('restore',e.currentTarget)}>Use a different code</button>
  </div>}
  {state==='ready'&&<div ref={landing} className={styles.choices} data-title-card="ready">
   <WaterPill card="ready" label="Play" sub="You’re all set!" autoStart/>
  </div>}
  {state==='restored'&&<div ref={landing} className={styles.choices} data-title-card="restored">
   <WaterPill card="restored" label="Play" sub="Welcome back!" autoStart apply={()=>applyRestore.current?.()}/>
  </div>}
  {state==='break'&&<div ref={landing} className={`${styles.card} ${styles.breakCard}`} data-title-card="break" role="status">
   <span className={styles.breakChip}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg>Saving break</span>
   <h2 className={styles.cardTitle}>Saving is taking a break</h2>
   <p className={styles.cardBody}>You can still play today. We’ll ask for your save code next time.</p>
   <WaterPill card="break" label="Play"/>
  </div>}

  {sheet&&saves&&<div className={styles.sheetWrap} data-save-sheet={sheet.mode}>
   <div ref={backdrop} className={styles.backdrop} onClick={()=>void leave(null)} aria-hidden="true"/>
   <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="save-sheet-title">
    <div ref={surface} className={styles.surface}/>
    <div ref={content} className={styles.sheetContent}>
     <header className={styles.sheetHeader}>
      <BackButton onBack={()=>void leave(null)}/>
      <h2 id="save-sheet-title" tabIndex={-1}>{sheet.mode==='create'?'New island':'My save code'}</h2>
      <span className={styles.mark} aria-hidden="true"/>
     </header>
     <div className={styles.sheetBody} data-save-flow={sheet.mode}>
      {sheet.mode==='create'
       ?<saves.SaveCodeCreate onDone={created} onPhase={onCreatePhase} onHaveCode={()=>setSheet(s=>s&&{...s,mode:'restore'})}/>
       :<saves.SaveCodeRestore onDone={restored=>{if(!restored)void leave('break');}} onPhase={onRestorePhase} onCancel={()=>setSheet(s=>s&&{...s,mode:'create'})}
         onPlay={apply=>{applyRestore.current=apply;void leave('restored');}}/>}
     </div>
     {celebrate&&<div className={styles.saved} aria-live="assertive">
      <span className={styles.stamp}>Saved!</span>
      {CONFETTI.map((p,i)=><i key={i} className={styles.confetti} style={{'--x':`${p.x}px`,'--y':`${p.y}px`,'--r':`${p.r}deg`,'--c':p.c,'--d':`${p.d}ms`} as CSSProperties}/>)}
     </div>}
    </div>
   </div>
  </div>}
 </div>;
}
