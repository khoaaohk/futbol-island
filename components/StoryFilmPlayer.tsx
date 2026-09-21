'use client';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {DoneButton} from './DoneButton';
import StoryPlaybackBar from './StoryPlaybackBar';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import {getSoundVolume,isSoundEnabled} from '@/lib/games/sound';
import {acquireSheet} from '@/lib/paths/riso/sheet';
import {chapterStarts,chapterSeconds,frameFor,playbackChapters,resolveFrame,storyDuration,visualStory,type RisoStory} from '@/lib/paths/riso/story';
import styles from './StoryFilmPlayer.module.css';

type Status='ready'|'playing'|'paused'|'finished';
export type StoryOrigin={x:number;y:number;size:number;height:number;radius:string;color:string};
type Touch={x:number;y:number;at:number;seed:number};
const TOUCH_LIFE=.8,MAX_TOUCHES=6;
/** The riso story player: one canvas, one Audio, 24 fps cap, DPR ≤ 1.5, sleeps when paused / hidden / offscreen. */
export default function StoryFilmPlayer({story,onClose,onComplete,origin}:{story:RisoStory;onClose:()=>void;onComplete?:()=>void;origin?:StoryOrigin}){
 const completion=useRef(onComplete),reported=useRef(false);completion.current=onComplete;
 const canvas=useRef<HTMLCanvasElement>(null),root=useRef<HTMLDivElement>(null),audio=useRef<HTMLAudioElement|null>(null);
 const state=useRef({time:0,chapter:0,status:'ready' as Status,muted:!isSoundEnabled()||getSoundVolume()===0,audioFailed:false});
 const [status,setStatus]=useState<Status>('ready'),[chapter,setChapter]=useState(0),[clock,setClock]=useState(0),[muted,setMuted]=useState(state.current.muted),[audioFailed,setAudioFailed]=useState(false);
 const [headline,setHeadline]=useState<{id:number;text:string;leaving:boolean;wait:boolean}[]>([]),headlineId=useRef(0),[current,setCurrent]=useState({text:'',cut:false,n:0}),[caption,setCaption]=useState(0);
 const [entering,setEntering]=useState(!!origin),[exiting,setExiting]=useState(false),[offset,setOffset]=useState({x:0,y:0});
 const control=useRef({play:()=>{},pause:()=>{},seek:(_index:number)=>{},seekTime:(_time:number)=>{},redraw:()=>{}});
 const track=story.audio.mode==='track',starts=chapterStarts(story),duration=storyDuration(story);
 // Every story gets the same segmented chapter bar: single-track stories segment by their visual chapters, not their caption paragraphs.
 const segments=playbackChapters(story),segmentStarts=chapterStarts(visualStory(story));
 useLayoutEffect(()=>{const rect=root.current?.getBoundingClientRect();if(rect)setOffset({x:rect.left,y:rect.top});},[]);
 useEffect(()=>{
  const el=canvas.current,node=root.current;if(!el||!node)return;const ctx=el.getContext('2d');if(!ctx)return;
  const releaseWorld=holdVideoPlayback(),previous=document.activeElement as HTMLElement|null;
  const siblings=Array.from(node.parentElement?.children??[]).filter(child=>child!==node) as HTMLElement[],oldInert=siblings.map(child=>child.inert);siblings.forEach(child=>child.inert=true);
  node.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  const media=new Audio();audio.current=media;media.preload=track?'auto':'metadata';media.volume=getSoundVolume();media.muted=state.current.muted;
  const s=state.current;s.time=0;s.chapter=0;s.status='ready';reported.current=false;setStatus('ready');setChapter(0);setCaption(0);setClock(0);setCurrent({text:'',cut:true,n:0});let shownHeadline:string|null='',shownCaption=0,cutNext=false,headlineN=0;
  // a seek must clear the outgoing headline instantly (no drift-off), so scripted captures and scrubbing never show a stale word
  const cutHeadline=()=>{shownHeadline=null;cutNext=true;};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame=0,last=0,lastDraw=0,lastUI=0,disposed=false,width=1,height=1,dpr=1,drawnChapter=-1,visible=true,scripted=false,introTimer:ReturnType<typeof setTimeout>|undefined,burstUntil=0,lastMove=0;
  const tray={bottom:0,right:0},touches:Touch[]=[];
  const seconds=(i:number)=>chapterSeconds(story,i);
  const audioLive=()=>!s.audioFailed&&!scripted&&media.readyState>=2&&!media.ended&&(track||Boolean(story.chapters[s.chapter].audio));
  const visualTime=()=>track?(audioLive()?media.currentTime:s.time):(audioLive()?starts[s.chapter]+Math.min(media.currentTime,seconds(s.chapter)):s.time);
  const paint=(now=performance.now())=>{
   if(disposed)return;const time=visualTime(),f=resolveFrame(story,time,track?undefined:s.chapter);
   const sheet=acquireSheet(ctx,width,height,dpr,story.spec,tray);
   ctx.setTransform(1,0,0,1,0,0);
   const frame={sheet,time,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:reduced,width,height,captionChapter:f.captionChapter};
   // A story error must never leave the sheet unprinted: press() always lays paper and whatever plates were drawn.
   try{story.draw(frame);
    if(story.touch&&touches.length){const m=sheet.getTransform().inverse();for(const t of touches){const age=(now-t.at)/1000;if(age>TOUCH_LIFE)continue;const p=m.transformPoint(new DOMPoint(t.x*dpr,t.y*dpr));sheet.save();story.touch(sheet,p.x,p.y,reduced?0:age,t.seed,frame);sheet.restore();}}
    delete el.dataset.risoError;}
   catch(error){el.dataset.risoError=String((error as Error)?.message??error);if(process.env.NODE_ENV!=='production')console.error('riso story draw failed',story.id,time.toFixed(2),error);}
   sheet.press(f.chapter);
   if(track&&f.chapter!==drawnChapter&&drawnChapter>=0)seam(f.chapter);
   const headlineNow=s.status==='ready'?'':f.headline;if(headlineNow!==shownHeadline){shownHeadline=headlineNow;setCurrent({text:headlineNow,cut:cutNext,n:++headlineN});cutNext=false;}
   if(f.captionChapter!==shownCaption){shownCaption=f.captionChapter;setCaption(f.captionChapter);}
   drawnChapter=f.chapter;el.dataset.time=time.toFixed(2);el.dataset.draws=String(Number(el.dataset.draws??0)+1);
  };
  const stopFrame=()=>{if(frame)cancelAnimationFrame(frame);frame=0;last=0;};
  const failAudio=()=>{s.audioFailed=true;setAudioFailed(true);};media.addEventListener('error',failAudio);
  const loadAudio=(index:number)=>{s.audioFailed=false;setAudioFailed(false);const source=track?(story.audio.mode==='track'?story.audio.src:undefined):story.chapters[index].audio;if(source){if(media.getAttribute('src')!==source){media.src=source;media.load();}}else{media.removeAttribute('src');failAudio();}};
  const startAudio=()=>{if(disposed||document.hidden||!visible||s.status!=='playing'||media.ended||scripted)return;if(!track&&!story.chapters[s.chapter].audio)return;void media.play().catch(error=>{if(disposed||error?.name==='AbortError')return;if(error?.name==='NotAllowedError'){pause();}else failAudio();});};
  const setPhase=(next:Status)=>{s.status=next;setStatus(next);};
  const seam=(index:number)=>{setChapter(index);if(!reduced&&s.status==='playing'&&typeof navigator.vibrate==='function'){try{navigator.vibrate(8);}catch{}}};
  const finish=()=>{s.time=duration;media.pause();setPhase('finished');setClock(Math.round(duration));paint();if(!reported.current){reported.current=true;completion.current?.();}};
  const pause=()=>{if(s.status!=='playing')return;media.pause();setPhase('paused');stopFrame();paint();};
  const tick=(now:number)=>{frame=0;if(disposed||document.hidden||!visible||s.status!=='playing')return;const dt=last?Math.min(.15,(now-last)/1000):0;last=now;
   if(track){if(audioLive())s.time=media.currentTime;else s.time+=dt;if(s.time>=duration&&(s.audioFailed||media.ended||!media.getAttribute('src'))){finish();return;}}
   else{if(audioLive())s.time=starts[s.chapter]+Math.min(media.currentTime,seconds(s.chapter));else s.time+=dt;
    const next=starts[s.chapter]+seconds(s.chapter);if(s.time>=next){
     // Do not cut an unfinished narration when playback buffering runs late. Hold at exactly `next`: the forced chapter index keeps the
     // chapter, frameFor clamps chapterTime to the chapter length, and the held frame equals the next chapter's frame 0 pixel for pixel.
     if(!s.audioFailed&&story.chapters[s.chapter].audio&&!media.ended){s.time=next;}else if(s.chapter===story.chapters.length-1){finish();return;}else{s.chapter++;s.time=starts[s.chapter];seam(s.chapter);loadAudio(s.chapter);startAudio();}
    }}
   if((!reduced&&now-lastDraw>=1000/24-1)||drawnChapter!==(track?resolveFrame(story,s.time).chapter:s.chapter)){paint(now);lastDraw=now;}
   if(now-lastUI>=250){setClock(track?s.time:Math.floor(s.time));lastUI=now;}
   frame=requestAnimationFrame(tick);
  };
  const resume=()=>{if(disposed||document.hidden||!visible||s.status!=='playing')return;last=0;startAudio();if(!frame)frame=requestAnimationFrame(tick);};
  const play=()=>{if(disposed)return;if(document.hidden||!visible){setPhase('paused');return;}if(s.status==='finished'){s.time=0;s.chapter=0;setChapter(0);setClock(0);if(track)media.currentTime=0;loadAudio(0);}setPhase('playing');resume();};
  const seek=(index:number)=>{stopFrame();media.pause();cutHeadline();s.chapter=index;s.time=starts[index];setChapter(index);setClock(Math.floor(starts[index]));loadAudio(index);paint();if(s.status==='finished')setPhase('paused');if(s.status==='playing')resume();};
  const seekTime=(time:number)=>{const at=Math.max(0,Math.min(duration,time));cutHeadline();s.time=at;if(media.getAttribute('src')&&!s.audioFailed){try{media.currentTime=at;}catch{}}setClock(at);if(s.status==='finished')setPhase('paused');paint();};
  const measureTray=()=>{const bar=node.querySelector<HTMLElement>('[data-story-playback-bar]');if(!bar)return;const a=el.getBoundingClientRect(),b=bar.getBoundingClientRect();tray.bottom=Math.max(0,a.bottom-b.top);tray.right=Math.max(0,a.right-b.left);};
  const resize=()=>{const rect=el.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(window.devicePixelRatio||1,1.5);el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);measureTray();paint();};
  const observer=new ResizeObserver(()=>resize());observer.observe(el);
  const trayObserver=new MutationObserver(()=>{measureTray();});trayObserver.observe(node,{childList:true,subtree:true,characterData:true});
  loadAudio(0);resize();
  const visibility=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting);if(!visible)pause();else paint();});visibility.observe(node);
  const hide=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hide);
  const keys=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,input,a,textarea,select'))return;if(e.code==='Space'){e.preventDefault();s.status==='playing'?pause():play();}};node.addEventListener('keydown',keys);
  // Micro-interactions: touches feed story.touch; while paused a touch wakes a bounded 0.8 s burst, then the canvas sleeps again.
  const burst=(now:number)=>{frame=0;if(disposed||s.status==='playing')return;if(now>burstUntil){paint(now);return;}paint(now);frame=requestAnimationFrame(burst);};
  const addTouch=(e:PointerEvent)=>{if(!story.touch)return;const rect=el.getBoundingClientRect(),now=performance.now();touches.push({x:e.clientX-rect.left,y:e.clientY-rect.top,at:now,seed:Math.floor(now)%997});while(touches.length>MAX_TOUCHES)touches.shift();for(let i=touches.length-1;i>=0;i--)if(now-touches[i].at>TOUCH_LIFE*1000)touches.splice(i,1);
   if(s.status!=='playing'){burstUntil=reduced?now:now+TOUCH_LIFE*1000;if(!frame)frame=requestAnimationFrame(burst);}};
  const down=(e:PointerEvent)=>{if(e.button!==0&&e.pointerType==='mouse')return;try{el.setPointerCapture(e.pointerId);}catch{}addTouch(e);};
  const move=(e:PointerEvent)=>{if(!(e.buttons&1)&&e.pointerType==='mouse')return;const now=performance.now();if(now-lastMove<70)return;lastMove=now;addTouch(e);};
  el.addEventListener('pointerdown',down,{passive:true});el.addEventListener('pointermove',move,{passive:true});
  control.current={play,pause,seek,seekTime,redraw:paint};
  if(process.env.NODE_ENV!=='production'){(node as HTMLDivElement&{filmControls?:unknown}).filmControls=control.current;
   (window as Window&{__risoFrame?:unknown}).__risoFrame=(time:number)=>{stopFrame();media.pause();scripted=true;cutHeadline();if(s.status==='playing')setPhase('paused');const f=frameFor(story,time);s.time=time;s.chapter=f.chapter;setChapter(f.chapter);paint();return{...f,width,height};};}
  // Opening a story is the viewer's intent to watch. Audio-policy rejection falls back to the visible play control through startAudio().
  if(origin&&!reduced)introTimer=setTimeout(()=>{if(!document.hidden)play();},1350);else if(!document.hidden)play();
  return()=>{disposed=true;clearTimeout(introTimer);stopFrame();observer.disconnect();trayObserver.disconnect();visibility.disconnect();media.pause();media.removeEventListener('error',failAudio);media.removeAttribute('src');media.load();audio.current=null;document.removeEventListener('visibilitychange',hide);node.removeEventListener('keydown',keys);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);if(process.env.NODE_ENV!=='production')delete(window as Window&{__risoFrame?:unknown}).__risoFrame;siblings.forEach((child,i)=>child.inert=oldInert[i]);releaseWorld();previous?.focus?.({preventScroll:true});};
 // Story identity owns one timeline and one audio element for its full lifetime.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[story]);
 // Headline overlay: 1–2 words at most (resolved per frame in paint); arrives popping into register, leaves drifting off-register.
 // A leaving word drifts off-register for .2 s before the next pops (data-wait delays the pop), so two words never overprint; a cut (seek) replaces instantly.
 useEffect(()=>{setHeadline(list=>{if(current.cut)return current.text?[{id:++headlineId.current,text:current.text,leaving:false,wait:false}]:[];const live=list.find(h=>!h.leaving);if((live?.text??'')===current.text)return list;const next=list.map(h=>({...h,leaving:true}));if(current.text)next.push({id:++headlineId.current,text:current.text,leaving:false,wait:Boolean(live)});return next;});},[current]);
 const finishDismiss=()=>onClose();
 const close=()=>{control.current.pause();if(origin&&!matchMedia('(prefers-reduced-motion: reduce)').matches){setEntering(false);setExiting(true);}else finishDismiss();};
 const toggleSound=()=>{const next=!state.current.muted;state.current.muted=next;setMuted(next);if(audio.current){audio.current.muted=next;if(!next&&audio.current.volume===0)audio.current.volume=.5;}};
 const key=story.spec.inks[story.spec.order[story.spec.order.length-1]]??'#22366b',echo=story.spec.inks[story.spec.order[0]]??'#ff48b0';
 const style={'--paper':story.spec.paper,'--key':key,'--echo':echo} as CSSProperties;
 const scale=origin?Math.ceil(Math.hypot(window.innerWidth,window.innerHeight)*2/Math.min(origin.size,origin.height)):1;
 return <div ref={root} className={`${styles.film} ${entering?styles.entering:''} ${exiting?styles.exiting:''}`} style={style} data-story-view data-path-film={story.id} data-riso-story data-story-complete={status==='finished'} role="dialog" aria-modal="true" aria-label={story.title} tabIndex={-1} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),[href],input')).filter(item=>item.getClientRects().length>0),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}>
  {(entering||exiting)&&origin&&<div className={`${styles.entryCircle} ${exiting?styles.exitCircle:''}`} aria-hidden="true" onAnimationEnd={e=>{if(exiting&&(e.animationName.includes('entryExit')||e.animationName.includes('entryFade')))finishDismiss();else if(e.animationName.includes('entryFade'))setEntering(false);}} style={{left:origin.x-offset.x,top:origin.y-offset.y,width:origin.size,height:origin.height,borderRadius:origin.radius,'--entry-scale':scale} as CSSProperties}/>}
  {entering&&origin&&<div className={styles.entryButton} aria-hidden="true" style={{left:origin.x-offset.x,top:origin.y-offset.y,width:origin.size,height:origin.height,borderRadius:origin.radius,backgroundColor:origin.color}}><svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15M6 9h3m6 0h3M6 13h3m6 0h3"/></svg></div>}
  <canvas ref={canvas} className={styles.canvas} role="img" aria-label={`${story.title}: a printed ${story.theme.toLowerCase()} story`}/>
  <header className={styles.header}><h1>{story.title}</h1><DoneButton onDone={close}/></header>
  <div className={styles.label} aria-hidden="true">{headline.map(h=><h2 key={h.id} data-leaving={h.leaving||undefined} data-wait={h.wait&&!h.leaving||undefined} data-text={h.text} onAnimationEnd={e=>{if(e.animationName.includes('headlineLeave'))setHeadline(list=>list.filter(item=>item.id!==h.id));}}>{h.text}</h2>)}</div>
  <StoryPlaybackBar title={story.title} playing={status==='playing'} started={status!=='ready'} completed={status==='finished'} muted={muted} time={clock} duration={duration} caption={story.chapters[track?caption:chapter].narration} transcript={story.chapters} segments={track?segments:undefined} ageNote={story.ageNote} chapter={chapter}
   onToggle={()=>status==='playing'?control.current.pause():control.current.play()} onReplay={()=>{if(track)control.current.seekTime(0);else control.current.seek(0);control.current.play();}} onMute={toggleSound} onPause={()=>control.current.pause()} onSeekChapter={track?index=>control.current.seekTime(segmentStarts[index]):index=>control.current.seek(index)} error={audioFailed?'Narration couldn’t load. You can keep watching with captions.':undefined}/>
 </div>;
}
