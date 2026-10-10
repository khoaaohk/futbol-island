'use client';
/**
 * "Save your island" → "Your secret code" (docs/accounts-design.md §3.1; Oct 10 2026). Reusable: the first-run welcome uses it
 * right after "pick your player", Settings' "My save code" card uses it, and other pages may too (see lib/saves/client.ts).
 *
 *   <SaveCodeCreate onDone={code=>…} required onHaveCode={…} onPhase={p=>…} headless/>
 *     onDone(code)   the player finished ("I saved it"); null = "Not now" (optional mode only) or saving is down → let them play
 *     required       a code is needed before playing (user decision, Oct 9 2026): no "Not now". Saving down still never locks a
 *                    kid out: "Saving is taking a break — you can still play today" with Play (onDone(null)).
 *     onHaveCode     shows "I have a save code" under "Get my code" (the host opens <SaveCodeRestore/>)
 *     showNotNow     optional mode only: show "Not now" beside "Get my code" (default true)
 *     onPhase(p)     'checking' | 'unavailable' | 'offer' | 'code' | 'error', so a host can set its own title
 *     headless       leave the title out (the host's header shows it)
 *     onBack         (Oct 9 2026, the title screen's sheet) "Your secret code" ends in one footer row: Back left, "Print code" in the
 *                    middle, "I saved it" right. The host hides its own Back while the code shows (onPhase 'code').
 * When saving is not set up yet it says "Saving isn't ready yet — you can still play."
 */
import {useEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {createSave,getLocalCode,savingStatus} from '@/lib/saves/client';
import {codeFromNormal,pictureFor} from '@/lib/saves/code';
import {BackButton} from '../BackButton';
import {NavigationButton} from '../DoneButton';
import CodeTiles from './CodeTiles';
import {WORDS} from '@/lib/saves/words';
import styles from './SaveCode.module.css';
import {startWordPick} from '@/lib/analytics/startEvents';

export type CreatePhase='checking'|'unavailable'|'offer'|'making'|'code'|'error';
export const CREATE_TITLES:Record<CreatePhase,string>={checking:'Save your island',unavailable:'Save your island',offer:'Save your island',making:'Save your island',code:'Your secret code',error:'Save your island'};
export function LockGlyph({size=26}:{size?:number}){return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>;}

/** What a save code is, in plain words (Oct 9 2026). Settings' "My save code" card shows it under its title. */
export const SAVE_CODE_WHAT='Your save code is the key to your island. Type it on any phone, tablet or computer to keep playing where you left off. Keep it secret, like a password.';
/** The shorter line shown with a brand-new code (the photo / write-it-down prompt follows it). */
// The \n is a line break on the title screen's sheet (white-space:pre-line there): "or write it down" starts line two (user).
export const SAVE_CODE_NEW='This is your island’s only key. Take a photo\nor write it down, and keep it a secret!';

/** Required mode's outage message: never lock a kid out (user decision, Oct 9 2026). */
export const SAVING_BREAK='Saving is taking a break — you can still play today.';
export default function SaveCodeCreate({onDone,showNotNow=true,required=false,onHaveCode,onPhase,headless=false,autoStart=false,onBack}:{onDone:(code:string|null)=>void;showNotNow?:boolean;required?:boolean;onHaveCode?:()=>void;onPhase?:(p:CreatePhase)=>void;headless?:boolean;autoStart?:boolean;onBack?:()=>void}){
 const [phase,setPhase]=useState<CreatePhase>('checking'),[code,setCode]=useState<string|null>(null);
 useEffect(()=>{onPhase?.(phase);},[phase,onPhase]);
 // In required mode any failure (down, busy, unreachable) is the friendly outage message; in optional mode "not set up" keeps its own.
 const make=async()=>{setPhase('making');const r=await createSave();if(r.ok){setCode(r.code);setPhase('code');}else setPhase(r.reason==='unavailable'&&!required?'unavailable':'error');};
 useEffect(()=>{let live=true;const have=getLocalCode();if(have){setCode(have);setPhase('code');return;}
  savingStatus().then(s=>{if(!live)return;if(!s.saving)setPhase('unavailable');else if(autoStart)void make();else setPhase('offer');});return()=>{live=false;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const title=(t:string)=>headless?null:<h3 className={styles.title}>{t}</h3>;
 if(phase==='checking')return <div className={styles.box} data-save-create="checking">{title('Save your island')}<p className={styles.status} role="status">Getting ready…</p></div>;
 if(phase==='unavailable')return <div className={styles.box} data-save-create="unavailable">{title('Save your island')}
  <p className={styles.copy}>Saving isn’t ready yet — you can still play.</p>
  <div className={styles.row}><button type="button" className={styles.secondary} onClick={()=>onDone(null)}>OK</button></div></div>;
 if(phase==='error')return <div className={styles.box} data-save-create="error">{title('Save your island')}
  <p className={styles.copy} role="status">{required?SAVING_BREAK:'We can’t make a code right now. You can get one later in Settings.'}</p>
  {required&&<p className={styles.small}>We’ll ask for your save code next time.</p>}
  <div className={styles.row}><button type="button" className={required?styles.primary:styles.secondary} data-saving-break={required||undefined} onClick={()=>onDone(null)}>{required?'Play':'OK'}</button></div></div>;
 if(phase==='offer'||phase==='making')return <div className={styles.box} data-save-create="offer">
  <p className={styles.eyebrow}>KEEP YOUR GAME SAFE</p>{title('Save your island')}
  <p className={styles.copy} data-save-explainer>A save code is the key to your island. Use it on another phone or tablet to keep your coins, cards and lessons.</p>
  <div className={styles.note}><LockGlyph/><span>No name or email. Just a code.</span></div>
  <div className={styles.row}><button type="button" className={styles.primary} data-get-code disabled={phase==='making'} onClick={make}>{phase==='making'?'Making your code…':'Get my code'}</button>
  {showNotNow&&!required&&<button type="button" className={styles.secondary} disabled={phase==='making'} onClick={()=>onDone(null)}>Not now</button>}
  {onHaveCode&&<button type="button" className={styles.quiet} data-have-save-code disabled={phase==='making'} onClick={onHaveCode}>I have a save code</button>}</div>
 </div>;
 return <CodeShown code={code!} onDone={()=>onDone(code)} headless={headless} onBack={onBack}/>;
}

/**
 * "Your secret code": the tiles, what a save code is, the photo/print prompts and a light "which word comes first?" check (no
 * failing). With `onBack` the buttons are one footer row (Back · Print code · I saved it).
 */
export function CodeShown({code,onDone,headless=false,doneLabel='I saved it',onBack}:{code:string;onDone:()=>void;headless?:boolean;doneLabel?:string;onBack?:()=>void}){
 const c=codeFromNormal(code);
 const [picked,setPicked]=useState<string|null>(null);
 const options=useMemo(()=>{if(!c)return [];const o=[...c.words];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;},[code]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!c)return null;
 const right=picked===c.words[0];
 // The print module and this code's QR are readied when the code shows, so Print opens the print sheet straight from the tap.
 const printMod=useRef<typeof import('@/lib/saves/printCard')|null>(null);
 useEffect(()=>{let live=true;void import('@/lib/saves/printCard').then(m=>{if(!live)return;printMod.current=m;void m.prepareCodeCard(code);});return()=>{live=false;};},[code]);
 const print=()=>{const m=printMod.current;if(m)void m.printCodeCard(code);else void import('@/lib/saves/printCard').then(x=>x.printCodeCard(code));};
 return <div className={`${styles.box} ${onBack?styles.shown:''}`} data-save-create="code">
  {!headless&&<h3 className={styles.title}>Your secret code</h3>}
  <CodeTiles code={code} hint={picked&&!right?0:-1} labelled={!!onBack}/>
  <p className={styles.copy} data-save-explainer>{SAVE_CODE_NEW}</p>
  {/* The title screen's sheet drops the "which word comes first?" check (user, Oct 9 2026); the walkthrough keeps it. */}
  {!onBack&&<div className={styles.stack}><p className={styles.small}>{picked===null?'Which word comes first?':right?'Yes! Great memory.':`It’s “${c.words[0]}”. Now you know!`}</p>
   <div className={styles.chips}>{options.map(w=><button key={w} type="button" className={styles.chip} aria-pressed={picked===w} onClick={()=>{if(picked===null)startWordPick(w===c.words[0]);setPicked(w);}}><i aria-hidden="true">{pictureFor(w)??''}</i>{w}</button>)}</div></div>}
  {onBack
   ?<div className={styles.footer} data-save-footer>
     <BackButton onBack={onBack}/>
     <span className={styles.footerCenter}><button type="button" className={styles.secondary} data-print-code onClick={print}>Print code</button></span>
     {/* Shrinks to a check like Back shrinks to its arrow (user, Oct 10 2026); keeps the dark green. */}
     <NavigationButton label={doneLabel} className={styles.savedIt} data-saved-it onNavigate={onDone} style={{'--navigation-width':'104px'} as CSSProperties}/></div>
   :<div className={styles.row}><button type="button" className={styles.secondary} data-print-code onClick={print}>Print a code card</button>
     {/* Shrinks to a check like Back shrinks to its arrow (user, Oct 10 2026); keeps the dark green. */}
     <NavigationButton label={doneLabel} className={styles.savedIt} data-saved-it onNavigate={onDone} style={{'--navigation-width':'104px'} as CSSProperties}/></div>}
 </div>;
}

/** An invisible, inert copy of the title screen's "Your secret code" layout (sample words), stacked under "Before you start" so
 *  both steps are exactly the same height and the sheet doesn't jump between them (user, Oct 10 2026). */
export function CodeGhost(){
 return <div aria-hidden="true" inert style={{visibility:'hidden',pointerEvents:'none'}} data-code-ghost>
  <CodeShown code={`${WORDS[0]}-${WORDS[1]}-${WORDS[2]}-8888`} onDone={()=>{}} headless onBack={()=>{}}/></div>;
}

/** "Before you start" in the very same frame as "Your secret code" (user, Oct 10 2026): `top` sits over an invisible copy of the
 *  labelled tiles (same height), `copy` in the explainer's place and style, and the footer row in the same spot, so nothing moves
 *  between the two steps. */
export function IntroShown({top,copy,onBack,go}:{top:ReactNode;copy:string;onBack:()=>void;go:ReactNode}){
 return <div className={`${styles.box} ${styles.shown}`} data-save-intro>
  <div className={styles.introTop}><div aria-hidden="true" inert style={{visibility:'hidden'}}><CodeTiles code={`${WORDS[0]}-${WORDS[1]}-${WORDS[2]}-8888`} labelled/></div>
   <div className={styles.introOver}>{top}</div></div>
  <p className={styles.copy} data-save-explainer>{copy}</p>
  <div className={styles.footer} data-save-footer><BackButton onBack={onBack}/>{go}</div>
 </div>;
}
