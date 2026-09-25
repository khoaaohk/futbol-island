'use client';
import {useEffect,useRef} from 'react';
import {acquireSheet} from '@/lib/paths/riso/sheet';
import {chapterSeconds,chapterStarts,cueAt,resolveFrame,storyDuration,type RisoStory} from '@/lib/paths/riso/story';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import {getSoundVolume,isSoundEnabled} from '@/lib/games/sound';

/** The caption the card shows under the name plate: the narration sentence being spoken, and the cue words inside it. */
export type CardCaption={chapter:number;sentence:string;words:string};

/** Same budget as StoryFilmPlayer (the same riso engine): 24 fps drawing, canvas DPR ≤ 1.5 (phone heat). */
const FRAME_MS=1000/24,MAX_DPR=1.5;
/** Reduced motion has no tweening: a still per chapter, so the clock is only checked a few times a second. */
const STILL_POLL_MS=200;
const TRAY={bottom:0,right:0};
const SENTENCES=/[^.!?]+[.!?]+["'’”)]*\s*|[^.!?]+$/g;

/** A few samples of silent 8-bit WAV. Playing it inside the Play click unlocks the element for the narration later (iOS). */
const SILENT=(()=>{const n=8,bytes=[...'RIFF'].map(c=>c.charCodeAt(0));const u32=(v:number)=>[v&255,v>>8&255,v>>16&255,v>>24&255],u16=(v:number)=>[v&255,v>>8&255],str=(s:string)=>[...s].map(c=>c.charCodeAt(0));
 const all=[...bytes,...u32(36+n),...str('WAVEfmt '),...u32(16),...u16(1),...u16(1),...u32(8000),...u32(8000),...u16(1),...u16(8),...str('data'),...u32(n),...Array(n).fill(128)];
 return 'data:audio/wav;base64,'+(typeof btoa==='function'?btoa(String.fromCharCode(...all)):'');})();

/** Call from the Play click (a user gesture): returns the one narration element the film will use, already unlocked for autoplay. */
export function unlockedNarration(){const media=new Audio();media.preload='auto';media.src=SILENT;try{void media.play().catch(()=>{});}catch{}return media;}

/** The spoken sentence: the one holding the current cue words, else the one at the chapter's progress. */
function sentenceFor(narration:string,words:string,progress:number){
 const list=narration.match(SENTENCES)?.map(s=>s.trim()).filter(Boolean)??[];if(!list.length)return narration;
 const w=words.trim().toLowerCase();const hit=w?list.find(s=>s.toLowerCase().includes(w)):undefined;if(hit)return hit;
 const total=list.reduce((a,s)=>a+s.length,0);let at=Math.max(0,Math.min(1,progress))*total;for(const s of list){if(at<s.length)return s;at-=s.length;}return list[list.length-1];
}

/**
 * Plays a riso film (RisoStory) inside its positioned parent, e.g. the card's picture window. It uses the riso engine
 * the way StoryFilmPlayer does (acquireSheet → story.draw → sheet.press) with one narration element: in chapters mode
 * each chapter's audio plays in turn and drives the clock, a chapter without audio runs on a clock for its `seconds`.
 * The loop exists only while `running` (rAF, drawing capped at 30 fps; reduced motion: one still per chapter on a slow
 * timer). Any stop (running=false, unmount, new story) cancels the loop and silences the audio at once; the last frame
 * stays on the canvas so the host can fade it out. At the natural end it draws the final frame and calls onEnd.
 */
export default function CardFilmPlayer({story,audio,running,className,onEnd,onCaption}:{story:RisoStory;audio:HTMLAudioElement;running:boolean;className?:string;onEnd:()=>void;onCaption:(caption:CardCaption)=>void}){
 const ref=useRef<HTMLCanvasElement>(null);
 const endRef=useRef(onEnd),captionRef=useRef(onCaption);endRef.current=onEnd;captionRef.current=onCaption;
 useEffect(()=>{
  const el=ref.current,ctx=el?.getContext('2d');if(!el||!ctx||!running)return;
  const media=audio,release=holdVideoPlayback(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track=story.audio.mode==='track',starts=chapterStarts(story),duration=storyDuration(story),lastChapter=story.chapters.length-1;
  const seconds=(i:number)=>chapterSeconds(story,i);
  const srcFor=(i:number)=>story.audio.mode==='track'?story.audio.src:story.chapters[i]?.audio;
  let painted=-1,disposed=false,raf=0,timer:ReturnType<typeof setTimeout>|undefined,last=0,lastDraw=-Infinity,chapter=0,time=0,audioFailed=false,w=1,h=1,dpr=1,drawnChapter=-1,captionKey='';
  media.muted=!isSoundEnabled()||getSoundVolume()===0;media.volume=getSoundVolume();
  const fail=()=>{audioFailed=true;};media.addEventListener('error',fail);
  // One element for the whole film; a chapter with no narration yet runs on its clock (`chapter.seconds`).
  const load=(i:number)=>{audioFailed=false;const src=track&&i>0?null:srcFor(i);if(src===null)return;
   if(src){media.src=src;media.load();void media.play().catch(error=>{if(!disposed&&error?.name!=='AbortError')audioFailed=true;});}
   else{media.pause();media.removeAttribute('src');audioFailed=true;}};
  const audioLive=()=>!audioFailed&&media.readyState>=2&&!media.ended;
  const measure=()=>{const nw=Math.max(1,el.clientWidth),nh=Math.max(1,el.clientHeight),nd=Math.min(window.devicePixelRatio||1,MAX_DPR);
   if(nw===w&&nh===h&&nd===dpr)return false;w=nw;h=nh;dpr=nd;el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);return true;};
  const paint=()=>{if(disposed)return;const f=resolveFrame(story,time,track?undefined:chapter);
   const sheet=acquireSheet(ctx,w,h,dpr,story.spec,TRAY);ctx.setTransform(1,0,0,1,0,0);
   // A film error must never leave the window blank: press() always lays paper and whatever plates were drawn.
   try{story.draw({sheet,time,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:reduced,width:w,height:h,captionChapter:f.captionChapter});delete el.dataset.risoError;}
   catch(error){el.dataset.risoError=String((error as Error)?.message??error);if(process.env.NODE_ENV!=='production')console.error('card film draw failed',story.id,time.toFixed(2),error);}
   sheet.press(f.chapter);drawnChapter=f.chapter;painted=time;el.dataset.time=time.toFixed(2);el.dataset.draws=String(Number(el.dataset.draws??0)+1);};
  const caption=()=>{const f=resolveFrame(story,time,track?undefined:chapter),c=f.captionChapter,ch=story.chapters[c];if(!ch)return;
   const local=Math.max(0,time-starts[c]),{cue}=track?cueAt(ch.cues,local):{cue:f.cue},words=cue>=0?ch.cues[cue]?.words??'':'';
   const sentence=sentenceFor(ch.narration,words,seconds(c)>0?local/seconds(c):0),key=`${c}|${sentence}|${words}`;
   if(key!==captionKey){captionKey=key;captionRef.current({chapter:c,sentence,words});}};
  const stop=()=>{disposed=true;if(raf)cancelAnimationFrame(raf);raf=0;clearTimeout(timer);timer=undefined;media.pause();};
  const finish=()=>{time=duration;chapter=lastChapter;paint();caption();stop();endRef.current();};
  /** Advances the clock like StoryFilmPlayer's chapters mode: narration time when it is live, a clock when there is none, and a chapter never cuts unfinished narration. */
  const advance=(dt:number)=>{
   if(track){if(audioLive())time=media.currentTime;else if(media.ended)time=duration;else if(audioFailed)time+=dt;if(time>=duration&&(audioFailed||media.ended)){finish();return false;}return true;}
   if(audioLive())time=starts[chapter]+Math.min(media.currentTime,seconds(chapter));else if(audioFailed)time+=dt;else if(media.ended)time=starts[chapter]+seconds(chapter);
   const next=starts[chapter]+seconds(chapter);
   if(time>=next){if(!audioFailed&&srcFor(chapter)&&!media.ended)time=next;else if(chapter===lastChapter){finish();return false;}else{chapter++;time=starts[chapter];load(chapter);}}
   return true;};
  const schedule=()=>{if(disposed)return;if(reduced)timer=setTimeout(()=>step(performance.now()),STILL_POLL_MS);else raf=requestAnimationFrame(step);};
  const step=(now:number)=>{raf=0;timer=undefined;if(disposed)return;const dt=last?Math.min(.15,(now-last)/1000):0;last=now;
   if(!advance(dt))return;caption();
   if(reduced){if(resolveFrame(story,time,track?undefined:chapter).chapter!==drawnChapter)paint();}
   // A clock that has not moved (narration buffering) redraws nothing.
   else if(now-lastDraw>=FRAME_MS-2&&time!==painted){paint();lastDraw=now;}
   schedule();};
  // Layout size (clientWidth, not the tilted/flipping bounding box). Resizing clears the bitmap: redraw the frame on show.
  const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{if(measure())paint();});resize?.observe(el);
  measure();load(0);paint();caption();lastDraw=performance.now();schedule();
  return ()=>{stop();resize?.disconnect();media.removeEventListener('error',fail);media.removeAttribute('src');media.load();release();};
 },[story,audio,running]);
 return <canvas ref={ref} className={className} data-card-film={story.id} aria-hidden="true"/>;
}
