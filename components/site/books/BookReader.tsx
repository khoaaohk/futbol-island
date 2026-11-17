'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {ReaderBook} from '@/lib/site/books';
import ChapterArt from './ChapterArt';
import r from './reader.module.css';
/**
 * The web pop-up reader (Nov 17 2026): the island book's own pages as a paper spread (picture left, words right; one column on a
 * phone), its paper action as a button that moves the drawing, and Coach Bella's narration (the island's recorded tracks,
 * public/voice/books/<id>/*.m4a, with their sentence captions). Loaded only when "Open the pop-up book" is tapped.
 * Why not the island's 3D reader (components/PlayerPopUpBook.tsx): it pulls three.js, every book's text and narration manifest
 * (the generated registry), the game's sound settings, sponsor and activity analytics and the in-game lesson check; this one is
 * the same words, actions and voice in a few kilobytes, with no WebGL and no animation loop (phone heat, AGENTS.md).
 * One <audio> element, driven by its own media events (no timers); it stops on page turn, close, and when the tab is hidden.
 */
type Cue={text:string;start:number;duration:number};
type Track={src:string;duration:number;cues:Cue[]};
export default function BookReader({book,onClose}:{book:ReaderBook;onClose:()=>void}){
 const [page,setPage]=useState(0),[dir,setDir]=useState<'next'|'prev'|'open'>('open'),[amounts,setAmounts]=useState<Record<number,number>>({});
 const [tracks,setTracks]=useState<Record<string,Track>|null>(null),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[voiceError,setVoiceError]=useState('');
 const root=useRef<HTMLDivElement>(null),closeBtn=useRef<HTMLButtonElement>(null),audio=useRef<HTMLAudioElement|null>(null),listening=useRef(false),gesture=useRef<{x:number;y:number}|null>(null);
 const pageRef=useRef(page);pageRef.current=page;
 const c=book.chapters[page],amount=amounts[page]??0,done=amount>=c.steps,last=page===book.chapters.length-1;
 const loadTracks=useCallback(async():Promise<Record<string,Track>|null>=>{
  if(tracks)return tracks;
  try{const res=await fetch(book.narration);if(!res.ok)throw new Error(String(res.status));const m=await res.json() as {pages:Record<string,Track>};setTracks(m.pages);return m.pages;}
  catch{setVoiceError('The voice could not load. The words are all here to read.');return null;}
 },[book.narration,tracks]);
 const stop=useCallback(()=>{const a=audio.current;if(a&&!a.paused)a.pause();},[]);
 const play=useCallback(async(index:number)=>{
  const all=await loadTracks(),t=all?.[book.chapters[index].id];if(!t){if(all)setVoiceError('This page has no voice yet.');return;}
  let a=audio.current;
  if(!a){a=new Audio();a.preload='none';audio.current=a;
   a.addEventListener('timeupdate',()=>setTime(a!.currentTime||0));a.addEventListener('playing',()=>{setPlaying(true);setVoiceError('');});
   a.addEventListener('pause',()=>setPlaying(false));a.addEventListener('ended',()=>{setPlaying(false);setAmounts(s=>({...s,[pageRef.current]:book.chapters[pageRef.current].steps}));});
   a.addEventListener('error',()=>{setPlaying(false);setVoiceError('The voice could not load. The words are all here to read.');});}
  if(!a.src.endsWith(t.src)){a.src=t.src;setTime(0);}
  else if(a.ended)a.currentTime=0;
  a.play().catch(()=>setPlaying(false));
 },[book.chapters,loadTracks]);
 const turn=(next:number)=>{
  if(next<0||next>=book.chapters.length||next===page)return;
  const wasListening=listening.current&&playing;stop();setTime(0);
  if(audio.current){audio.current.removeAttribute('src');audio.current.load();}
  setDir(next>page?'next':'prev');setPage(next);
  if(wasListening)void play(next);
 };
 const act=()=>setAmounts(s=>({...s,[page]:(s[page]??0)>=c.steps?0:(s[page]??0)+1}));
 const listen=()=>{if(playing){listening.current=false;stop();}else{listening.current=true;void play(page);}};
 // Open: lock the page behind, focus the close button, trap Tab, Escape closes, arrows turn; close stops the voice.
 useEffect(()=>{
  const html=document.documentElement,before=html.style.overflow;html.style.overflow='hidden';closeBtn.current?.focus({preventScroll:true});
  const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
  return()=>{html.style.overflow=before;document.removeEventListener('visibilitychange',hidden);const a=audio.current;if(a){a.pause();a.removeAttribute('src');a.load();}audio.current=null;};
 },[stop]);
 const onKey=(e:React.KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();onClose();return;}
  if(e.key==='ArrowRight'&&!(e.target instanceof HTMLButtonElement&&e.target.dataset.dot!==undefined)){e.preventDefault();turn(page+1);return;}
  if(e.key==='ArrowLeft'){e.preventDefault();turn(page-1);return;}
  if(e.key==='Tab'){const nodes=Array.from(root.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')??[]);if(!nodes.length)return;
   const first=nodes[0],lastNode=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastNode.focus();}else if(!e.shiftKey&&document.activeElement===lastNode){e.preventDefault();first.focus();}}
 };
 const cues=tracks?.[c.id]?.cues??[],cue=[...cues].reverse().find(q=>time>=q.start);
 const paragraphs=c.text.split(/\n\n+/);
 return <div ref={root} className={r.reader} role="dialog" aria-modal="true" aria-labelledby="reader-title" onKeyDown={onKey} data-book-reader={book.id} data-page={page}>
  <div className={r.bar}>
   <h2 id="reader-title" className={r.title}>{book.title}: {book.subtitle}</h2>
   <button ref={closeBtn} type="button" className={r.close} onClick={onClose} aria-label="Close the book"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/></svg></button>
  </div>
  <div className={r.stage}
   onPointerDown={e=>{if(e.isPrimary)gesture.current={x:e.clientX,y:e.clientY};}}
   onPointerUp={e=>{const g=gesture.current;gesture.current=null;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)turn(page+(dx<0?1:-1));}}>
   <article key={page} className={r.spread} data-dir={dir} aria-label={`Page ${page+1} of ${book.chapters.length}: ${c.title}`}>
    <div className={r.left}>
     <p className={r.year}>{c.year}</p>
     <button type="button" className={r.art} onClick={act} aria-label={done?`${c.response} Tap to do it again.`:c.prompt}><ChapterArt motif={c.motif} amount={amount} steps={c.steps}/></button>
    </div>
    <div className={r.right}>
     <h3 className={r.pageTitle}>{c.title}</h3>
     {paragraphs.map((p,i)=><p key={i}>{p}</p>)}
    </div>
   </article>
  </div>
  <div className={r.controls}>
   <button type="button" className={r.round} onClick={()=>turn(page-1)} disabled={page===0} aria-label="Previous page"><svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
   <button type="button" className={r.action} onClick={act} data-done={done||undefined}>{done?c.response:c.prompt}{c.steps>1&&!done?` · ${amount}/${c.steps}`:''}</button>
   <button type="button" className={r.round} onClick={()=>last?turn(0):turn(page+1)} aria-label={last?'Back to the first page':'Next page'}>{last
    ?<svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><path d="M4.5 10a5.5 5.5 0 1 0 1.8-4.1M4.5 3.5v3h3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    :<svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><path d="m7.5 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</button>
  </div>
  <div className={r.listen}>
   <button type="button" className={r.listenBtn} onClick={listen} aria-pressed={playing}>
    {playing?<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor"/></svg>
     :<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M6 3.5v13l10.5-6.5Z" fill="currentColor"/></svg>}
    {playing?'Pause':'Listen'}</button>
   <p className={r.caption} aria-live="off">{voiceError||(playing||time>0?cue?.text??'':'Coach Bella reads each page aloud.')}</p>
  </div>
  <div className={r.dots} role="group" aria-label="Pages">{book.chapters.map((ch,i)=><button key={ch.id} type="button" data-dot="" className={r.dot} aria-current={i===page?'page':undefined}
   aria-label={`Page ${i+1}: ${ch.title}`} onClick={()=>turn(i)}/>)}</div>
  <p className={r.sr} role="status">{done?c.response:''}</p>
 </div>;
}
