'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {galleryOf,exhibitState,UNLOCK_WORDS,type Exhibit,type MuseumCounts} from '@/lib/endgame/museum';
import {STORIES,startStory,beginBeat,endBeat,storyTakeaway,type StoryBeat,type StoryState} from '@/lib/museum/museumStories';
import {sayLine,stopLine} from '@/lib/museum/museumVoice';
import styles from './MuseumRoom.module.css';

/**
 * The storytelling strip (Oct 4 2026; replaces the case card for story exhibits). A slim caption bar under the working
 * machine: the eyebrow, beat dots, the line being told (voiced by the coach), and ONE action, which the kid presses to
 * play the next beat (tap, pull, crank, or pick a corner). The last beat is the case's "Take it to your game" line. The case's
 * facts and sources live on a small plaque (ⓘ) that slides up from the strip: no dimmed backdrop, no focus trap, and not
 * needed to play. Locked cases show their exact "collect" line instead (unlock rules unchanged).
 */
export type StoryHooks={play:(anim:string,arg?:number)=>number;reset:()=>void;duck:(on:boolean)=>void};
const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export default function MuseumStory({exhibit,open,counts,hooks}:{exhibit:Exhibit;open:boolean;counts:MuseumCounts;hooks:StoryHooks}){
 const g=galleryOf(exhibit.gallery),story=STORIES[exhibit.id],s=exhibitState(exhibit,counts);
 const [state,setState]=useState<StoryState>(()=>startStory(exhibit.id)),[line,setLine]=useState(''),[plaque,setPlaque]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>>(),hooksRef=useRef(hooks);hooksRef.current=hooks;
 useEffect(()=>{hooksRef.current.reset();return()=>{clearTimeout(timer.current);stopLine();hooksRef.current.duck(false);};},[exhibit.id]);
 function act(arg?:number){
  const r=beginBeat(state);if(!r)return;setState(r.state);setPlaque(false);
  const text=r.beat==='takeaway'?storyTakeaway(exhibit.id):r.beat.line,animSec=r.beat==='takeaway'?0:hooks.play(r.beat.anim,arg);
  setLine(text);hooks.duck(true);const ms=Math.max(animSec*1000+200,sayLine(text));
  clearTimeout(timer.current);timer.current=setTimeout(()=>{hooks.duck(false);setState(st=>endBeat(st));},ms);
 }
 function again(){clearTimeout(timer.current);stopLine();hooks.reset();setState(startStory(exhibit.id));setLine('');}
 const style={'--g':g.art} as CSSProperties;
 if(!open)return <div className={styles.strip} style={style} data-museum-story={exhibit.id} data-locked>
  <div className={styles.stripHead}><span className={styles.eyebrow}>{g.title} · {exhibit.year}</span><b>{exhibit.title}</b></div>
  <p className={styles.lockText} data-museum-locked={exhibit.id}>{s.lockText}</p>
  <div className={styles.progress} role="progressbar" aria-label={`${UNLOCK_WORDS[g.unlock].many} collected`} aria-valuemin={0} aria-valuemax={s.need} aria-valuenow={Math.min(s.have,s.need)}><i style={{width:`${Math.min(100,s.have/Math.max(1,s.need)*100)}%`}}/></div>
  <p className={styles.small}>{s.how}</p></div>;
 const total=story.beats.length+1,next:StoryBeat|'takeaway'|null=state.done?null:state.next<story.beats.length?story.beats[state.next]:'takeaway';
 const shown=state.done?storyTakeaway(exhibit.id):line;
 return <div className={styles.strip} style={style} data-museum-story={exhibit.id} data-beat={state.next} data-playing={state.playing||undefined} data-done={state.done||undefined}>
  {plaque&&<section className={styles.plaque} aria-label={`${exhibit.title}: plaque`} data-museum-plaque={exhibit.id}>
   <ul className={styles.facts}>{exhibit.facts.map(f=><li key={f}>{f}</li>)}</ul>
   {exhibit.sources.length>0&&<p className={styles.small}>Sources: {exhibit.sources.map((src,i)=><span key={src.url}>{i>0?' · ':''}<a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a></span>)}</p>}
  </section>}
  <div className={styles.stripHead}>
   <span className={styles.eyebrow}>{g.title} · {exhibit.year}</span><b>{exhibit.title}</b>
   <span className={styles.dots} aria-label={`Part ${Math.min(state.next+1,total)} of ${total}`}>{Array.from({length:total},(_,i)=><i key={i} data-on={i<state.next||(i===state.next&&state.playing)||undefined}/>)}</span>
   <button type="button" className={styles.plaqueButton} aria-expanded={plaque} aria-label="Read the plaque: facts and sources" data-museum-plaque-toggle onClick={()=>setPlaque(v=>!v)}>i</button>
  </div>
  <p className={styles.caption} aria-live="polite" data-museum-caption>{shown?cap(shown):state.next===0?'Work the exhibit to tell its story.':''}</p>
  {state.done?<div className={styles.takeaway} data-museum-takeaway><b>Take it to your game</b><button type="button" className={styles.mint} data-museum-story-again onClick={again}>Play again</button></div>
   :next==='takeaway'?<button type="button" className={styles.gold} data-museum-story-act="takeaway" disabled={state.playing} onClick={()=>act()}>Take it to your game</button>
   :next&&next.control==='choose'?<div className={styles.row} role="group" aria-label={next.prompt}>{(next.options??[{label:'Left',arg:-1},{label:'Middle',arg:0},{label:'Right',arg:1}]).map(o=><button key={o.label} type="button" className={styles.gold} data-museum-story-act={`choose:${o.arg}`} disabled={state.playing} onClick={()=>act(o.arg)}>{o.label}</button>)}<span className={styles.small}>{next.prompt}</span></div>
   :next&&<button type="button" className={styles.gold} data-museum-story-act={next.control} disabled={state.playing} onClick={()=>act()}>{state.playing?'…':(next.control==='crank'?'⟳ ':next.control==='pull'?'⤓ ':'')+next.prompt}</button>}
 </div>;
}
