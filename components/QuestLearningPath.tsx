'use client';
import dynamic from 'next/dynamic';
import {UPCOMING_STORIES,type UpcomingStory as UpcomingStoryData} from '@/lib/paths/upcomingStories';
import UpcomingStory from './UpcomingStory';
import {useEffect,useState,useRef,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {FORMAT_PATHS,FORMAT_PATH_LAUNCH,lessonEvidence,type PathLesson} from '@/lib/paths/formatPaths';
import {STORY_CARDS,STORY_KEY,readStoryProgress,type StoryId} from '@/lib/paths/stories';
import {loadOptionalStoryProgress,completeOptionalStory} from '@/lib/paths/optionalStoryProgress';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {launchLearning,endLearningPreview} from '@/lib/town/learningProgress';
import {playDock,playUndock,playSwipe} from '@/lib/games/sound';
import styles from './IslandSettings.module.css';
import ui from './FormatPaths.module.css';
import journey from './IslandJourney.module.css';
const StoryModal=dynamic(()=>import('./PathStoryModal'),{ssr:false});
const LAST_OPENED_KEY='fi2-path-last-opened-v1';
function StopIcon({kind}:{kind:string}){return <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='lock'?<><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/></>:kind==='story'?<><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/><path d="M6 9h3m6 0h3M6 13h3m6 0h3"/></>:kind==='check'?<path d="m5 12 4 4L19 6"/>:kind==='play'?<path d="m9 5 10 7-10 7z" fill="currentColor"/>:kind==='support'?<><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8 8 8 8m-5 0h5v-5"/></>:kind==='arrows'?<><path d="M4 18V6h6m-4-3 4 3-4 3M20 6v12h-6m4-3-4 3 4 3"/></>:kind==='ball'?<><circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6zM12 3v4m9 5-4-1M7 11l-4 1m3 7 3-2m6 0 3 2"/></>:<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>}</svg>;}
export default function QuestLearningPath(){
 const [upcoming,setUpcoming]=useState<UpcomingStoryData|null>(null);
 const [optionalDone,setOptionalDone]=useState<string[]>([]);
 const root=useRef<HTMLElement>(null),[host,setHost]=useState<HTMLElement|null>(null);
 const storyOrigin=useRef<{x:number;y:number;size:number;height:number;radius:string;color:string}>();
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=new Set(evidence.steps);
 const [format,setFormat]=useState('futsal'),[story,setStory]=useState<StoryId|null>(null),[storyDone,setStoryDone]=useState<StoryId[]>([]);
 // The lesson last opened per format, so the landing card resumes where the player left off.
 const [lastOpened,setLastOpened]=useState<Record<string,string>>({});
 const swipe=useRef<{x:number;y:number}|null>(null),dock=useRef<HTMLDivElement>(null),sentinel=useRef<HTMLDivElement>(null);
 // The dock is stuck when it sits at the scroller's top while the sentinel above it has scrolled away. Plays the dock/undock cue on phones only.
 useEffect(()=>{const node=sentinel.current,bar=dock.current;if(!node||!bar)return;let scroller:HTMLElement|null=node.parentElement;while(scroller&&!/auto|scroll/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;if(!scroller)return;
  let stuck:boolean|null=null,frame=0;
  const check=()=>{frame=0;const now=node.getBoundingClientRect().top<bar.getBoundingClientRect().top-2;if(stuck===null){stuck=now;bar.dataset.stuck=String(now);return;}if(now!==stuck){stuck=now;bar.dataset.stuck=String(now);if(matchMedia('(max-width:600px),(pointer:coarse)').matches)(now?playDock:playUndock)();}};
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(check);};check();scroller.addEventListener('scroll',onScroll,{passive:true});return()=>{scroller!.removeEventListener('scroll',onScroll);if(frame)cancelAnimationFrame(frame);};},[]);
 useEffect(()=>{setHost(root.current?.closest<HTMLElement>('[data-paths-host]')??null);try{const saved=localStorage.getItem('fi2-path-format-v1');if(FORMAT_PATHS.some(p=>p.format===saved))setFormat(saved!);}catch{}const read=()=>{setOptionalDone(loadOptionalStoryProgress());try{setStoryDone(readStoryProgress(JSON.parse(localStorage.getItem(STORY_KEY)??'[]')));}catch{}try{const last=JSON.parse(localStorage.getItem(LAST_OPENED_KEY)??'{}');setLastOpened(last&&typeof last==='object'?last:{});}catch{}};read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read);},[]);
 const chooseFormat=(next:string)=>{setFormat(next);try{localStorage.setItem('fi2-path-format-v1',next);}catch{}};
 const swipeStart=(e:React.TouchEvent)=>{const t=e.touches[0];swipe.current=t?{x:t.clientX,y:t.clientY}:null;};
 const swipeEnd=(e:React.TouchEvent)=>{const start=swipe.current,t=e.changedTouches[0];swipe.current=null;if(!start||!t)return;const dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)<56||Math.abs(dy)>48||Math.abs(dx)<Math.abs(dy)*1.5)return;const index=FORMAT_PATHS.findIndex(p=>p.format===format),to=FORMAT_PATHS[index+(dx<0?1:-1)];if(to){playSwipe(dx<0?1:-1);chooseFormat(to.format);}};
 useEffect(()=>{
  if(!story||!host)return;
  const previous=document.activeElement as HTMLElement|null;
  const covered=Array.from(host.children).filter(n=>!(n as HTMLElement).hasAttribute('data-story-view')) as HTMLElement[];
  covered.forEach(n=>{n.inert=true;});
  const dialog=host.closest('dialog');const back=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation();if(host.querySelector('[data-story-complete="true"]'))finishStory();else setStory(null);};
  const backdrop=(event:Event)=>{if(event.target===dialog)back(event);};
  dialog?.addEventListener('click',backdrop,true);dialog?.addEventListener('cancel',back,true);
  return()=>{covered.forEach(n=>{n.inert=false;n.style.visibility='';});dialog?.removeEventListener('click',backdrop,true);dialog?.removeEventListener('cancel',back,true);previous?.focus({preventScroll:true});};
 },[story,host]);
 const finishStory=()=>{if(story){let saved:StoryId[]=[];try{saved=readStoryProgress(JSON.parse(localStorage.getItem(STORY_KEY)??'[]'));}catch{}const done=readStoryProgress([...saved,...storyDone,story]);setStoryDone(done);try{localStorage.setItem(STORY_KEY,JSON.stringify(done));}catch{}}setStory(null);};
 const path=FORMAT_PATHS.find(p=>p.format===format)!,core=path.chapters.flatMap(c=>c.lessons);
 const status=(l:PathLesson)=>lessonEvidence(path.format,l,steps,answers);
 const completed=core.filter(l=>status(l).complete).length,next=core.find(l=>!status(l).complete);
 const finishedPaths=FORMAT_PATHS.filter(p=>p.chapters.flatMap(c=>c.lessons).every(l=>lessonEvidence(p.format,l,steps,answers).complete)).length;
 const launch=(lesson:PathLesson,replay=false)=>{endLearningPreview();const s=status(lesson);const remembered={...lastOpened,[path.format]:lesson.id};setLastOpened(remembered);try{localStorage.setItem(LAST_OPENED_KEY,JSON.stringify(remembered));}catch{}window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:path.format,lessonId:lesson.id,step:replay?0:s.step,quiz:!replay&&s.quiz,question:replay?0:s.question,nonce:Date.now()}}));};
 const openStory=(id:StoryId,node:HTMLButtonElement)=>{const rect=node.getBoundingClientRect();storyOrigin.current={x:rect.x+rect.width/2,y:rect.y+rect.height/2,size:rect.width,height:rect.height,radius:getComputedStyle(node).borderRadius,color:getComputedStyle(node).backgroundColor};setStory(id);};
 const opening=path.openingStory&&!storyDone.includes(path.openingStory)?path.openingStory:null;
 // Landing card: resume the lesson last opened if it is unfinished; otherwise the next unfinished stop; "start here" when nothing has begun.
 const lastLesson=[...core,...path.depth].find(l=>l.id===lastOpened[path.format]),resumeLesson=lastLesson&&!status(lastLesson).complete?lastLesson:next;
 const untouched=completed===0&&!lastLesson&&core.every(l=>{const s=status(l);return s.watched===0&&s.correct===0;});
 const landing=opening?{label:untouched?'Start here':'Continue',title:opening==='grit'?'Grit':STORY_CARDS.find(card=>card.id===opening)?.skill??'Story'}:resumeLesson?{label:untouched?'Start here':resumeLesson===lastLesson?'Continue where you left off':'Up next',title:resumeLesson.name}:null;
 const nodes:{lesson:PathLesson;story?:StoryId;index:number;upcoming?:UpcomingStoryData}[]=[...(path.openingStory?[{lesson:core[0],story:path.openingStory,index:-1}]:[]),...core.flatMap((lesson,i)=>[{lesson,story:undefined as StoryId|undefined,index:i},...(lesson.story?[{lesson,story:lesson.story,index:i}]:[]),...([3,7,11].includes(i)&&UPCOMING_STORIES[format]?.[[3,7,11].indexOf(i)]?[{lesson,index:i,upcoming:UPCOMING_STORIES[format][[3,7,11].indexOf(i)]}]:[])])];
 let chapterGap=0;
 const stops=nodes.map((node,index)=>{if(!node.story&&path.chapters.slice(1).some(c=>c.lessons[0].id===node.lesson.id))chapterGap+=110;return {...node,x:160+Math.sin(index*1.45)*58,y:84+index*200+chapterGap};}),height=stops[stops.length-1].y+210;
 return <section ref={root} className={`${styles.learningPath} ${journey.journey}`} aria-label="Format learning paths" onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
 <div className={`${ui.overview} ${journey.bearing} ${journey.landing}`}><span className={journey.eyebrow}>{untouched?'YOUR FIRST LANDING':'WHERE YOU LEFT OFF'}</span><h3>{path.title} Pitch</h3><strong>{completed} / {core.length} starter lessons complete</strong><progress value={completed} max={core.length} aria-label={`${path.title} starter progress`}/>{landing?<button type="button" onClick={event=>opening?openStory(opening,event.currentTarget):launch(resumeLesson!)}><span className={journey.continueLabel}>{landing.label}</span><span className={journey.continueTitle}>{landing.title}</span></button>:<p role="status">Starter path complete! Explore another format or go deeper below.</p>}</div>
 <div className={journey.sectionLabel}><span>02 / CHOOSE YOUR PATH</span><p>Four paths. One island.</p></div>
 <div ref={sentinel} aria-hidden="true"/>
 <div ref={dock} className={journey.pathDock}><div className={`${ui.tabs} ${journey.coasts}`} style={{'--format-index':FORMAT_PATHS.findIndex(p=>p.format===format)} as CSSProperties} role="group" aria-label="Choose a format"><span className={ui.tabHighlight} aria-hidden="true"/>{FORMAT_PATHS.map(p=><button key={p.format} type="button" aria-pressed={format===p.format} onClick={()=>chooseFormat(p.format)}><span className={journey.coastArt} aria-hidden="true"><i/><b>{p.format==='futsal'?'01':p.format==='7v7'?'02':p.format==='9v9'?'03':'04'}</b></span><strong>{p.title}</strong><small aria-label={`${p.chapters.flatMap(c=>c.lessons).filter(l=>lessonEvidence(p.format,l,steps,answers).complete).length} of ${p.chapters.flatMap(c=>c.lessons).length} stops`}>{p.chapters.flatMap(c=>c.lessons).filter(l=>lessonEvidence(p.format,l,steps,answers).complete).length} / {p.chapters.flatMap(c=>c.lessons).length}</small></button>)}</div></div>
 {upcoming&&host&&createPortal(<UpcomingStory key={upcoming.id} story={upcoming} onClose={completed=>{if(completed)setOptionalDone(completeOptionalStory(upcoming.id,optionalDone));setUpcoming(null);}}/>,host)}
 <div className={`${styles.questPath} ${journey.levelMap}`} style={{height}}><svg className={styles.questRoad} viewBox={`0 0 320 ${height}`} preserveAspectRatio="none" aria-hidden="true">{path.chapters.map((chapter,ci)=>{const first=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[0].id)!,last=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[chapter.lessons.length-1].id)!,y=first.y-90,h=last.y-first.y+270;return <g key={chapter.title}><path d={`M35 ${y+20} Q100 ${y-15} 170 ${y+15} Q310 ${y-5} 309 ${y+130} L305 ${y+h-110} Q330 ${y+h} 218 ${y+h} Q95 ${y+h+30} 24 ${y+h-45} Q-5 ${y+h-100} 20 ${y+h-190} L13 ${y+110} Q0 ${y+60} 35 ${y+20}Z`} fill={['#f4d57a','#8ec6a1','#f0b1cc','#edb676'][ci%4]} stroke="#fff0cc" strokeWidth="5"/><path d={`M35 ${y+30} Q15 ${y+85} 25 ${y+125} M282 ${y+h-55}q-12 24-40 25`} fill="none" stroke="#fff0cc" strokeWidth="3"/></g>;})}{stops.slice(1).map((stop,i)=>{const prev=stops[i];return <path key={i} d={`M${prev.x} ${prev.y} C${prev.x} ${prev.y+85} ${stop.x} ${stop.y-85} ${stop.x} ${stop.y}`} fill="none" stroke="#c8ceb0" strokeWidth="12" strokeLinecap="round"/>;})}</svg>
 {path.chapters.map((chapter,ci)=>{const first=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[0].id)!;return <div className={journey.chapterFlag} key={chapter.title} style={{top:first.y-90}}>{!['Meet the team and restart','Receive inside the team shape'].includes(chapter.title)&&<strong>{chapter.title}</strong>}</div>;})}
 <ol className={styles.questStops}>{stops.map(stop=>{const s=status(stop.lesson),card=stop.upcoming?{title:stop.upcoming.title,skill:stop.upcoming.theme}:stop.story?STORY_CARDS.find(c=>c.id===stop.story):undefined,done=stop.upcoming?optionalDone.includes(stop.upcoming.id):stop.story?storyDone.includes(stop.story):s.complete,locked=!stop.upcoming&&!stop.story&&!done&&s.watched===0&&s.correct===0&&!!next&&stop.index>core.indexOf(next);return <li key={stop.upcoming?.id??stop.story??stop.lesson.id} className={`${styles.questStop} ${locked?journey.lockedStop:''} ${stop.story||stop.upcoming?styles.storyStop:''} ${done?styles.questDone:!stop.story&&next?.id===stop.lesson.id?styles.questCurrent:''}`} style={{left:`${stop.x/320*100}%`,top:stop.y-32}}>
 <button type="button" disabled={locked} aria-label={card?`Story: ${card.title}${done?'. Completed, replay':''}`:`${stop.index+1}. ${stop.lesson.name}. ${locked?'Locked. Complete the previous stop to unlock':done?'Completed, replay':`${s.watched}/${stop.lesson.steps} play steps, ${s.correct}/${stop.lesson.questions} quiz answers`}`} onClick={event=>{if(stop.upcoming)setUpcoming(stop.upcoming);else if(stop.story)openStory(stop.story,event.currentTarget);else launch(stop.lesson,done);}}><StopIcon kind={locked?'lock':stop.story||stop.upcoming?'story':done?'check':s.quiz?'ball':'play'}/></button>
 <strong>{card?`Story · ${card.title}`:`${stop.index+1}. ${stop.lesson.name}`}</strong><small>{card?`${card.skill} · ${done?'Completed · Replay anytime':stop.upcoming?'1 minute · Optional':'Optional'}`:locked?'Complete the previous stop to unlock':done?'Completed · Replay anytime':null}</small>
 </li>;})}</ol></div>
 <details className={ui.depth}><summary>Go deeper · {path.depth.length} optional lessons</summary><p>Extra practice. These lessons do not hold up your starter path.</p>{path.depth.map(l=><button type="button" key={l.id} onClick={()=>launch(l,status(l).complete)}><span>{l.name}</span><small>{status(l).complete?'Completed · Replay':'Watch & try'}</small></button>)}</details>
 {(format==='futsal'||format==='7v7')&&<details className={ui.depth}><summary>Practice in a different situation</summary><p>Try the existing guided and independent challenges. Return later to practice remembering.</p>{(format==='futsal'?['support','movement'] as const:['width'] as const).map(id=><button key={id} onClick={()=>launchLearning(id,'format-path')}>{id==='support'?'Support angles':id==='movement'?'Off ball movement':'Width and timing'}</button>)}</details>}
 <div className={`${ui.future} ${journey.harbour}`}><span className={journey.eyebrow}>NEXT HORIZON / THE ACADEMY</span><h3>Your next island awaits.</h3><div className={journey.ferry} aria-hidden="true">⚑</div><strong>{finishedPaths} / 4 starter paths complete</strong><p>Complete all four paths and collect every hidden ball to prepare for the academy island. The Matchday Ferry opens in a future update.</p><small>More challenges and islands are coming later.</small></div>
 {story&&(host?createPortal(<StoryModal origin={storyOrigin.current} embedded key={story} storyId={story} onClose={()=>setStory(null)} onFinish={finishStory}/>,host):<StoryModal origin={storyOrigin.current} key={story} storyId={story} onClose={()=>setStory(null)} onFinish={finishStory}/>)}
 </section>;
}
