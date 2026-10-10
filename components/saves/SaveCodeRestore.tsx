'use client';
/**
 * "I have a save code" (docs/accounts-design.md §3.3; Oct 10 2026): three word boxes that autocomplete with pictures after 3
 * letters, a number box with a number pad, then "Welcome back!" with the island's summary. Reusable (lib/saves/client.ts).
 *
 *   <SaveCodeRestore onDone={restored=>…} initialCode="striker-volley-corner-427" onCancel={…} headless onPhase={…}/>
 *     onDone(true)   the player tapped Play: the island is swapped and the page reloads right after this call
 *     onDone(false)  "Keep this one" (this device's island stays)
 *     onPlay(apply)  optional (Oct 9 2026, the title screen): Play hands `apply` to the host instead of applying + reloading at once; the host
 *                    runs its own transition and then calls apply() (which applies the save and reloads). Without it: unchanged.
 *     onBack         (the title screen's sheet) Back bottom left and "Load my island" bottom right on the first screen, no title
 *     onCancel       shows a "Go back" link on the first screen (not with onBack) (in required mode the host takes it back to "Get my code")
 *     required       a code is needed before playing (Oct 9 2026): "Keep this one" becomes "Keep this one, get a new code" (onCancel);
 *                    if saving is down: "Saving is taking a break — you can still play today" with Play (onDone(false))
 * Wrong, unknown and throttled codes all read "That code didn't work" (the server can't tell them apart either); after 3
 * misses a grown-up is asked to help (ParentGate), after 6 it's "Let's take a break" for 10 minutes.
 */
import {useEffect,useMemo,useRef,useState} from 'react';
import {applyRestoredSave,deviceHasProgress,restoreGate,restoreSave,savingStatus,type RestoreResult} from '@/lib/saves/client';
import {NUMBER_PICTURE,matchWord,parseCode,parseNumber,pictureFor,suggestWords} from '@/lib/saves/code';
import {summaryLine} from '@/lib/saves/summary';
import ParentGate from '../ParentGate';
import {BackButton} from '../BackButton';
import styles from './SaveCode.module.css';

export type RestorePhase='checking'|'unavailable'|'enter'|'loading'|'grownup'|'break'|'swap'|'welcome'|'newer'|'offline';
export const RESTORE_TITLES:Record<RestorePhase,string>={checking:'Type your save code',unavailable:'Type your save code',enter:'Type your save code',loading:'Type your save code',grownup:'Ask a grown-up',break:'Let’s take a break',swap:'Swap islands?',welcome:'Welcome back!',newer:'A newer island',offline:'Type your save code'};
type Ok=Extract<RestoreResult,{ok:true}>;

export default function SaveCodeRestore({onDone,initialCode,onCancel,required=false,headless=false,onPhase,onPlay,onBack,submitOutside}:{onDone:(restored:boolean)=>void;initialCode?:string;onCancel?:()=>void;required?:boolean;headless?:boolean;onPhase?:(p:RestorePhase)=>void;onBack?:()=>void;submitOutside?:(s:{ready:boolean;busy:boolean})=>void;onPlay?:(apply:()=>void)=>void}){
 const init=useMemo(()=>initialCode?parseCode(initialCode):null,[initialCode]);
 const [phase,setPhase]=useState<RestorePhase>('checking');
 const [words,setWords]=useState<string[]>(init?[...init.words]:['','','']),[num,setNum]=useState(init?String(init.number):'');
 const [focus,setFocus]=useState(-1),[msg,setMsg]=useState(''),[grownup,setGrownup]=useState(false),[until,setUntil]=useState(0);
 const [found,setFound]=useState<Ok|null>(null),[offline,setOffline]=useState(false);
 const inputs=useRef<(HTMLInputElement|null)[]>([]);
 useEffect(()=>{onPhase?.(phase);},[phase,onPhase]);
 useEffect(()=>{let live=true;savingStatus().then(s=>{if(!live)return;if(!s.saving){setPhase('unavailable');return;}const g=restoreGate();if(g.kind==='break'){setUntil(g.until);setPhase('break');}else setPhase(g.kind==='grownup'?'grownup':'enter');});return()=>{live=false;};},[]);
 const matched=words.map(w=>matchWord(w));
 const number=parseNumber(num);
 const ready=matched.every(Boolean)&&number!==null;
 useEffect(()=>{submitOutside?.({ready,busy:phase==='loading'});},[ready,phase]);// eslint-disable-line react-hooks/exhaustive-deps
 const setWord=(i:number,v:string)=>{
  // A whole code pasted or typed into one box fills every box.
  const whole=parseCode(v);if(whole){setWords([...whole.words]);setNum(String(whole.number));setMsg('');return;}
  setWords(w=>w.map((x,j)=>j===i?v.toLowerCase().replace(/[^a-z]/g,'').slice(0,12):x));setMsg('');
 };
 const pick=(i:number,w:string)=>{setWords(ws=>ws.map((x,j)=>j===i?w:x));setMsg('');const next=inputs.current[i+1];if(next)next.focus();};
 const submit=async()=>{
  if(!ready||phase==='loading')return;
  setPhase('loading');setMsg('');
  const r=await restoreSave(`${matched.join('-')}-${number}`,{grownup});
  if(r.ok){setFound(r);setPhase(deviceHasProgress()?'swap':'welcome');return;}
  if(r.reason==='break'){setUntil(r.until??Date.now()+600_000);setPhase('break');return;}
  if(r.reason==='grownup'){setPhase('grownup');return;}
  if(r.reason==='unavailable'){setPhase('unavailable');return;}
  if(r.reason==='newer'){setPhase('newer');return;}
  if(r.reason==='offline'){setMsg(required?'We can’t reach the island right now. Try again, or play today and save next time.':'We can’t reach the island right now. Check the internet and try again.');setOffline(true);setPhase('enter');return;}
  setMsg('That code didn’t work. Check each word and try again.');setPhase('enter');
 };
 const play=()=>{if(!found)return;onDone(true);const apply=()=>applyRestoredSave(found);if(onPlay)onPlay(apply);else apply();};
 const title=(t:string)=>headless?null:<h3 className={styles.title}>{t}</h3>;

 if(phase==='checking')return <div className={styles.box} data-save-restore="checking">{title('Type your save code')}<p className={styles.status} role="status">Getting ready…</p></div>;
 if(phase==='unavailable')return <div className={styles.box} data-save-restore="unavailable">{title('Type your save code')}
  <p className={styles.copy}>{required?'Saving is taking a break — you can still play today.':'Saving isn’t ready yet — you can still play.'}</p>
  <div className={styles.row}><button type="button" className={required?styles.primary:styles.secondary} data-saving-break={required||undefined} onClick={()=>required?onDone(false):onCancel?onCancel():onDone(false)}>{required?'Play':'OK'}</button></div></div>;
 if(phase==='break')return <div className={styles.box} data-save-restore="break">{title('Let’s take a break')}
  <p className={styles.copy}>Let’s take a break. Ask a grown-up to help, then try again in 10 minutes.</p>
  <p className={styles.small}>You can try again after {new Date(until).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.</p>
  <div className={styles.row}><button type="button" className={styles.secondary} onClick={()=>onCancel?onCancel():onDone(false)}>OK</button></div></div>;
 if(phase==='grownup')return <div className={styles.box} data-save-restore="grownup">
  <ParentGate title="Ask a grown-up" reason="That’s a few tries. A grown-up can help check the code." onCancel={onCancel} onPass={()=>{setGrownup(true);setPhase('enter');}}/></div>;
 if(phase==='newer')return <div className={styles.box} data-save-restore="newer">{title('A newer island')}
  <p className={styles.copy}>This island was saved by a newer Futbol Island. Please refresh to get the latest island.</p>
  <div className={styles.row}><button type="button" className={styles.primary} onClick={()=>location.reload()}>Refresh</button></div></div>;
 if(phase==='swap'&&found)return <div className={styles.box} data-save-restore="swap">{title('Swap islands?')}
  <p className={styles.copy}>This device has an island too. Loading your code will swap it.</p>
  <p className={styles.summary}>Your code’s island: {summaryLine(found.summary)}</p>
  <p className={styles.small}>We keep this device’s island for 7 days. You can undo the swap in Settings.</p>
  <div className={styles.row}><button type="button" className={styles.primary} data-load-code-island onClick={()=>setPhase('welcome')}>Load my code’s island</button>
   <button type="button" className={styles.secondary} data-keep-device-island onClick={()=>required&&onCancel?onCancel():onDone(false)}>{required?'Keep this one, get a new code':'Keep this one'}</button></div></div>;
 if(phase==='welcome'&&found)return <div className={styles.box} data-save-restore="welcome">{title('Welcome back!')}
  <p className={styles.summary} data-restore-summary>🪙 {summaryLine(found.summary)}</p>
  <p className={styles.copy}>Your island is ready.</p>
  <div className={styles.row}><button type="button" className={styles.primary} data-restore-play onClick={play}>Play</button></div></div>;

 const busy=phase==='loading';
 return <form id="save-restore-form" className={styles.box} data-save-restore="enter" onSubmit={e=>{e.preventDefault();void submit();}}>
  {!onBack&&!submitOutside&&title('Type your save code')}
  <p className={styles.small} data-save-explainer>{onBack||submitOutside?'Type your save code to bring your island to this device. It’s three words and a number.':'Your save code brings your island to this device. Three words and a number.'}</p>
  <div className={styles.boxes}>
   {[0,1,2].map(i=><div key={i} className={styles.field}>
    <label htmlFor={`save-word-${i}`}>Word {i+1}{matched[i]&&<i aria-hidden="true" data-word-picture> {pictureFor(matched[i]!)}</i>}</label>
    <input id={`save-word-${i}`} ref={el=>{inputs.current[i]=el;}} className={`${styles.input} ${matched[i]?styles.good:''}`} data-save-word={i} value={words[i]} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" maxLength={40} disabled={busy}
     onFocus={()=>setFocus(i)} onChange={e=>setWord(i,e.target.value)} onBlur={()=>{const m=matchWord(words[i]);if(m&&m!==words[i])setWords(ws=>ws.map((x,j)=>j===i?m:x));}}/>
   </div>)}
   <div className={styles.field}><label htmlFor="save-number">Number{number!==null&&<i aria-hidden="true" data-word-picture> {NUMBER_PICTURE}</i>}</label>
    <input id="save-number" className={`${styles.input} ${number!==null?styles.good:''}`} data-save-number value={num} inputMode="numeric" pattern="[0-9]*" maxLength={3} autoComplete="off" enterKeyHint="go" disabled={busy}
     onFocus={()=>setFocus(3)} onChange={e=>{setNum(e.target.value.replace(/\D/g,'').slice(0,3));setMsg('');}}/></div>
  </div>
  {focus>=0&&focus<3&&<Suggestions typed={words[focus]} chosen={matched[focus]} onPick={w=>pick(focus,w)}/>}
  <p className={`${styles.status} ${msg?styles.warn:''}`} role="status" data-restore-status>{busy?'Looking for your island…':msg}</p>
  {submitOutside
   // The welcome walkthrough (Oct 9 2026): its own footer carries Back and "Load my island" (form="save-restore-form").
   ?(required&&offline?<div className={styles.row}><button type="button" className={styles.quiet} data-saving-break onClick={()=>onDone(false)}>Play today</button></div>:null)
   :onBack
   // The title screen's sheet (user, Oct 9 2026): one footer row, Back bottom left and "Load my island" bottom right; no "Go back" link.
   ?<div className={styles.footer} data-save-footer>
     <BackButton onBack={onBack}/>
     {required&&offline&&<span className={styles.footerCenter}><button type="button" className={styles.quiet} data-saving-break onClick={()=>onDone(false)}>Play today</button></span>}
     <button type="submit" className={styles.primary} data-load-island disabled={!ready||busy}>Load my island</button></div>
   :<div className={styles.row}><button type="submit" className={styles.primary} data-load-island disabled={!ready||busy}>Load my island</button>
   {onCancel&&<button type="button" className={styles.quiet} onClick={onCancel}>Go back</button>}
   {required&&offline&&<button type="button" className={styles.quiet} data-saving-break onClick={()=>onDone(false)}>Play today</button>}</div>}
 </form>;
}

function Suggestions({typed,chosen,onPick}:{typed:string;chosen:string|null;onPick:(w:string)=>void}){
 const list=suggestWords(typed,6).filter(w=>w!==chosen||typed!==w);
 if(!list.length||(chosen&&typed===chosen))return null;
 return <div className={styles.chips} role="group" aria-label="Words that match">{list.map(w=><button key={w} type="button" className={styles.chip} data-save-suggestion={w} onMouseDown={e=>e.preventDefault()} onClick={()=>onPick(w)}><i aria-hidden="true">{pictureFor(w)??''}</i>{w}</button>)}</div>;
}
