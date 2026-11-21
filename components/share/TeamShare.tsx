'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {count} from '@/lib/analytics/tracker';
import {shareId,type ShareEvent,type ShareSurface} from '@/lib/analytics/shareIds';
import {printHtml} from '@/lib/grownups/printHtml';
import {gameLink,homeworkHtml,lessonsFor,shareMessage,SHARE_SHORT_LINK,SHARE_WORDS,type ShareLang,type ShareLesson} from '@/lib/share/teamShare';
import s from './teamShare.module.css';
/**
 * "Share the game with your team" (Nov 20 2026): one closed line that opens a message a coach can send to their own players'
 * families, with the device share sheet (where the browser has one), Copy message, a QR code and the printable Team homework
 * sheet. Used by the coach app (`heading`: the line is a heading there) and by the lineup, playing-time and practice-plan pages.
 *
 * Nothing leaves the device from here: the message is plain text the coach sends themself, the QR code is drawn locally by the
 * `qrcode` package (loaded only when asked for), and the counts are totals (lib/analytics/shareIds.ts). `team` is only printed.
 */
const makeQr=async(url:string,width:number)=>{const {default:QR}=await import('qrcode');return QR.toDataURL(url,{width,margin:2,errorCorrectionLevel:'M'});};
export default function TeamShare({surface,lang='en',format,team,lessons,heading=false}:{surface:ShareSurface;lang?:ShareLang;format?:string;team?:string;lessons?:readonly ShareLesson[];heading?:boolean}){
 const w=SHARE_WORDS[lang],id=useId();
 const [open,setOpen]=useState(false),[pick,setPick]=useState(''),[qr,setQr]=useState<string|null>(null),[status,setStatus]=useState(''),[canShare,setCanShare]=useState(false);
 const box=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{setCanShare(typeof navigator.share==='function');},[]);
 const list=lessonsFor(lessons,format),lesson=list.find(l=>l[1]===pick);
 const text=shareMessage({lang,surface,format,lesson});
/* the whole message shows without scrolling: browsers with field-sizing fit it themselves, the others get a row count for a phone's width */
 const rows=text.split('\n').reduce((n,l)=>n+Math.max(1,Math.ceil(l.length/30)),0);
 const tally=(e:ShareEvent)=>count(shareId(e,surface));
 const toggle=()=>{if(!open)tally('open');setOpen(!open);setStatus('');};
 const copy=async()=>{
  try{await navigator.clipboard.writeText(text);setStatus(w.copied);tally('copy');}
  catch{box.current?.focus();box.current?.select();setStatus(w.noCopy);}
 };
 const share=async()=>{
  try{await navigator.share({text});tally('sheet');}
  catch(e){if((e as {name?:string})?.name!=='AbortError')copy();}
 };
 const showQr=async()=>{
  if(qr!==null){setQr(null);return;}
  try{setQr(await makeQr(gameLink(surface,'qr'),480));tally('qr');}catch{setQr('');}
 };
 const print=async()=>{
  let code:string|null=null;try{code=await makeQr(gameLink(surface,'print'),300);}catch{/* the sheet prints with the short link only */}
  printHtml(homeworkHtml({lang,team,qr:code,tryLine:lesson?(lang==='es'?lesson[3]:lesson[2]):undefined}));tally('print');
 };
 return <div className={s.root} data-team-share={surface} lang={lang}>
  <div className={s.line}>
   {heading?<h2 className={s.title}>{w.title}</h2>:<p className={s.quiet}>{w.line}</p>}
   <button type="button" className={`${s.btn} ${s.ghost}`} aria-expanded={open} aria-controls={id} onClick={toggle}>{open?w.close:w.open}</button>
  </div>
  {open&&<div className={heading?`${s.panel} ${s.boxed}`:s.panel} id={id}>
   <p className={s.note}>{w.intro}</p>
   {list.length>0&&<label className={s.field}>{w.lesson}
    <select className={s.select} value={lesson?pick:''} onChange={e=>setPick(e.target.value)}>
     <option value="">{w.noLesson}</option>
     {list.map(l=><option key={l[1]} value={l[1]}>{lang==='es'?l[3]:l[2]}</option>)}
    </select></label>}
   <label className={s.field}>{w.message}
    <textarea ref={box} className={s.message} readOnly rows={rows} value={text} data-share-message="" onFocus={e=>e.currentTarget.select()}/></label>
   <div className={s.actions}>
    {canShare&&<button type="button" className={s.btn} data-share-sheet="" onClick={share}>{w.share}</button>}
    <button type="button" className={canShare?`${s.btn} ${s.ghost}`:s.btn} data-share-copy="" onClick={copy}>{w.copy}</button>
    <button type="button" className={`${s.btn} ${s.ghost}`} data-share-qr="" aria-expanded={qr!==null} onClick={showQr}>{qr!==null?w.qrHide:w.qr}</button>
    <button type="button" className={`${s.btn} ${s.ghost}`} data-share-print="" onClick={print}>{w.print}</button>
   </div>
   <p className={s.status} role="status" aria-live="polite">{status}</p>
   {qr!==null&&<div className={s.qr}>
    {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn on this device */}
    {qr?<img src={qr} width={240} height={240} alt={w.qrAlt} data-share-qr-img=""/>:<p className={s.note}>{w.noQr}</p>}
    <p className={s.qrText}>{qr?w.qrLine:''} <b>{SHARE_SHORT_LINK}</b></p>
   </div>}
  </div>}
 </div>;
}
