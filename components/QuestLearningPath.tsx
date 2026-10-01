'use client';
import dynamic from 'next/dynamic';
import {UPCOMING_STORIES,type UpcomingStory as UpcomingStoryData} from '@/lib/paths/upcomingStories';
import UpcomingStory from './UpcomingStory';
import {useEffect,useLayoutEffect,useState,useRef,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {FORMAT_PATHS,FORMAT_PATH_LAUNCH,lessonEvidence,pathLessonLocked,type PathLesson} from '@/lib/paths/formatPaths';
import {DEFAULT_PATH_FORMAT,PATHS_IN_ORDER,PATH_FORMAT_KEY,PATH_LAST_OPENED_KEY,pathContinue,inferredPathFormat} from '@/lib/paths/pathContinue';
import {STORY_CARDS,STORY_KEY,readStoryProgress,type StoryId} from '@/lib/paths/stories';
import {earnForStory} from '@/lib/town/cardRewardTriggers';
import {loadOptionalStoryProgress,completeOptionalStory} from '@/lib/paths/optionalStoryProgress';
import {placeBetweenStops} from '@/lib/paths/betweenStops';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {ENDGAME_OPEN,openEndgame,type EndgameOpen} from '@/lib/endgame/graduationStore';
import {launchLearning,endLearningPreview} from '@/lib/town/learningProgress';
import {playDock,playUndock,playSwipe,playPathPop} from '@/lib/games/sound';
import styles from './IslandSettings.module.css';
import ui from './FormatPaths.module.css';
import journey from './IslandJourney.module.css';
const StoryModal=dynamic(()=>import('./PathStoryModal'),{ssr:false});
import pathArt from '@/lib/paths/pathArt.json';
const LAST_OPENED_KEY=PATH_LAST_OPENED_KEY;
// Chapter island inks: paper fill, a darker same-hue halftone, and a second ink printed slightly out of register.
const ISLAND_INKS=[{fill:'#f4d57a',dots:'#c9a032',echo:'#ff48b0'},{fill:'#8ec6a1',dots:'#3f8f66',echo:'#0078bf'},{fill:'#f0b1cc',dots:'#d56d9c',echo:'#0078bf'},{fill:'#edb676',dots:'#c8813a',echo:'#22366b'}];
function StopIcon({kind}:{kind:string}){return <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='lock'?<><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/></>:kind==='story'?<><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/><path d="M6 9h3m6 0h3M6 13h3m6 0h3"/></>:kind==='check'?<path d="m5 12 4 4L19 6"/>:kind==='play'?<path d="m9 5 10 7-10 7z" fill="currentColor"/>:kind==='support'?<><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8 8 8 8m-5 0h5v-5"/></>:kind==='arrows'?<><path d="M4 18V6h6m-4-3 4 3-4 3M20 6v12h-6m4-3-4 3 4 3"/></>:kind==='ball'?<><circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6zM12 3v4m9 5-4-1M7 11l-4 1m3 7 3-2m6 0 3 2"/></>:<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>}</svg>;}
export default function QuestLearningPath(){
 const [upcoming,setUpcoming]=useState<UpcomingStoryData|null>(null);
 const [optionalDone,setOptionalDone]=useState<string[]>([]);
 const root=useRef<HTMLElement>(null),[host,setHost]=useState<HTMLElement|null>(null);
 const storyOrigin=useRef<{x:number;y:number;size:number;height:number;radius:string;color:string}>();
 const evidence=useQuestEvidence(),answers=useQuizCompletions(),steps=new Set(evidence.steps);
 const [format,setFormat]=useState<string>(DEFAULT_PATH_FORMAT),[story,setStory]=useState<StoryId|null>(null),[storyDone,setStoryDone]=useState<StoryId[]>([]);
 // The lesson last opened per format, so the landing card resumes where the player left off.
 const [lastOpened,setLastOpened]=useState<Record<string,string>>({});
 const [mapScale,setMapScale]=useState(1),mapRef=useRef<HTMLDivElement>(null);
 const [artSource,setArtSource]=useState(false);
 useEffect(()=>{if(process.env.NODE_ENV!=='production')setArtSource(localStorage.getItem('fi2-path-art-source')==='true');},[]);
 const drawnLines=useRef<SVGPathElement[]>([]);
 const stopReveals=useRef<Animation[]>([]),popTimers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const stopRevealsNow=()=>{stopReveals.current.forEach(animation=>animation.cancel());stopReveals.current=[];popTimers.current.forEach(clearTimeout);popTimers.current=[];drawnLines.current.forEach(line=>{line.style.removeProperty('stroke-dasharray');line.style.removeProperty('stroke-dashoffset');});drawnLines.current=[];};
 const artWait=useRef<ReturnType<typeof setTimeout>>(),warmImages=useRef<HTMLImageElement[]>([]);
 const fade=useRef<Animation|null>(null),revealNext=useRef(false),changeId=useRef(0),suppressClickUntil=useRef(0);
 const stopPathMotion=()=>{fade.current?.cancel();fade.current=null;stopRevealsNow();revealNext.current=false;};
 const cancelWarm=()=>{clearTimeout(artWait.current);artWait.current=undefined;warmImages.current.forEach(image=>{image.src='';});warmImages.current=[];};
 useEffect(()=>{const dialog=root.current?.closest('dialog'),motion=matchMedia('(prefers-reduced-motion:reduce)');
  const cancel=()=>{changeId.current++;cancelWarm();stopPathMotion();};const hide=()=>{if(document.hidden)cancel();};const reduce=()=>{if(motion.matches)cancel();};
  dialog?.addEventListener('close',cancel);document.addEventListener('visibilitychange',hide);window.addEventListener('resize',cancel);motion.addEventListener('change',reduce);
  return()=>{cancel();dialog?.removeEventListener('close',cancel);document.removeEventListener('visibilitychange',hide);window.removeEventListener('resize',cancel);motion.removeEventListener('change',reduce);};
 },[]);
 useEffect(()=>{if(story||upcoming){changeId.current++;cancelWarm();stopPathMotion();}},[story,upcoming]);
 useEffect(()=>{mapRef.current?.querySelectorAll<HTMLImageElement>('picture img').forEach(img=>{void img.decode().catch(()=>{});});},[format]);
 useLayoutEffect(()=>{const map=mapRef.current;if(!revealNext.current||!map)return;revealNext.current=false;fade.current?.cancel();fade.current=null;stopRevealsNow();
  // Read visibility once; offscreen stops stay settled and never consume entrance animations.
  const visibleStops=Array.from(map.querySelectorAll<HTMLElement>('ol>li')).filter(stop=>{const rect=stop.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight+80;});
  const lines=Array.from(map.querySelectorAll<SVGPathElement>('[data-path-line]')).filter(line=>{const rect=line.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight+80;});
  const lengths=lines.map(line=>line.getTotalLength()),total=lengths.reduce((sum,length)=>sum+length,0);let drawn=0;
  lines.forEach((line,index)=>{const length=lengths[index];line.style.setProperty('stroke-dasharray',String(length),'important');drawnLines.current.push(line);const animation=line.animate([{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],{duration:460*length/Math.max(1,total),delay:180+460*drawn/Math.max(1,total),easing:'linear',fill:'backwards'});drawn+=length;stopReveals.current.push(animation);});
  visibleStops.forEach((stop,index)=>{const animation=stop.animate([{opacity:0,transform:'translateX(-50%) translateY(18px) scale(.94)',offset:0},{opacity:1,transform:'translateX(-50%) translateY(-2px) scale(1.025)',offset:.78},{opacity:1,transform:'translateX(-50%) translateY(0) scale(1)',offset:1}],{duration:240,delay:700+index*280,easing:'ease-out',fill:'backwards'});stopReveals.current.push(animation);popTimers.current.push(setTimeout(()=>{if(document.hidden||!stop.isConnected)return;const rect=stop.getBoundingClientRect();if(rect.bottom>0&&rect.top<window.innerHeight)playPathPop();},700+index*280));});
 },[format]);
 useEffect(()=>{const node=mapRef.current;if(!node)return;const measure=()=>setMapScale(Math.max(.5,node.clientWidth/320));measure();const ro=new ResizeObserver(measure);ro.observe(node);return()=>ro.disconnect();},[]);
 const swipe=useRef<{x:number;y:number}|null>(null),dock=useRef<HTMLDivElement>(null),sentinel=useRef<HTMLDivElement>(null);
 // Cache the boundary on layout changes; scrolling only compares scrollTop.
 useEffect(()=>{const node=sentinel.current,bar=dock.current;if(!node||!bar)return;let scroller:HTMLElement|null=node.parentElement;while(scroller&&!/auto|scroll/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;if(!scroller)return;
  const scrollRoot=scroller;let stuck:boolean|null=null,boundary=Infinity;
  const check=()=>{const now=scrollRoot.scrollTop>boundary+(stuck?-2:2);if(now===stuck)return;const initialized=stuck!==null;stuck=now;bar.dataset.stuck=String(now);if(initialized&&!document.hidden)(now?playDock:playUndock)();};
  const measure=()=>{boundary=node.getBoundingClientRect().top-scrollRoot.getBoundingClientRect().top+scrollRoot.scrollTop-parseFloat(getComputedStyle(scrollRoot).paddingTop||'0')-parseFloat(getComputedStyle(bar).top||'0');check();};
  const observer=new ResizeObserver(measure);observer.observe(scrollRoot);if(root.current)observer.observe(root.current);measure();scrollRoot.addEventListener('scroll',check,{passive:true});return()=>{observer.disconnect();scrollRoot.removeEventListener('scroll',check);};},[]);
 useEffect(()=>{setHost(root.current?.closest<HTMLElement>('[data-paths-host]')??null);try{const saved=localStorage.getItem(PATH_FORMAT_KEY);if(FORMAT_PATHS.some(p=>p.format===saved))setFormat(saved!);}catch{}const read=()=>{setOptionalDone(loadOptionalStoryProgress());try{setStoryDone(readStoryProgress(JSON.parse(localStorage.getItem(STORY_KEY)??'[]')));}catch{}try{const last=JSON.parse(localStorage.getItem(LAST_OPENED_KEY)??'{}');setLastOpened(last&&typeof last==='object'?last:{});}catch{}};read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read);},[]);
 // QA11 one-time migration: no saved tab yet (legacy saves only saved a tab on a switch, when futsal was the default) → open
 // the path that already has progress and save it, so Paths and the welcome-back card agree from now on. New players stay on 7v7.
 useEffect(()=>{try{if(localStorage.getItem(PATH_FORMAT_KEY))return;const f=inferredPathFormat(localStorage,steps,answers);if(!f)return;localStorage.setItem(PATH_FORMAT_KEY,f);setFormat(f);}catch{}
 },[evidence,answers]);
 const chooseFormat=(next:string)=>{if(story||upcoming)return;const token=++changeId.current;cancelWarm();stopPathMotion();if(next===format)return;
  const direction=PATHS_IN_ORDER.findIndex(p=>p.format===next)>PATHS_IN_ORDER.findIndex(p=>p.format===format)?1:-1;playSwipe(direction);
  const commit=()=>{if(token!==changeId.current)return;clearTimeout(artWait.current);artWait.current=undefined;warmImages.current=[];const map=mapRef.current;let scroller=map?.parentElement;while(scroller&&!/auto|scroll/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;
   if(map&&scroller&&dock.current&&map.getBoundingClientRect().top<dock.current.getBoundingClientRect().bottom){const target=map.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-dock.current.offsetHeight-parseFloat(getComputedStyle(scroller).paddingTop||'0');scroller.scrollTop=Math.max(0,target);}
   const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
   revealNext.current=!reduced;setFormat(next);try{localStorage.setItem(PATH_FORMAT_KEY,next);}catch{}};
  if(!mapRef.current||matchMedia('(prefers-reduced-motion:reduce)').matches){commit();return;}
  // Decode first when possible, but a stalled image must not lock navigation.
  const variant=matchMedia('(max-width:600px)').matches?'mobile':'desktop',assets=(pathArt as Record<string,{mobile:string;desktop:string}[]>)[next]??[];
  const ready=Promise.all(assets.map(asset=>{const image=new Image();warmImages.current.push(image);image.src=asset[variant];return image.decode().catch(()=>{});}));
  void Promise.race([ready,new Promise<void>(resolve=>{artWait.current=setTimeout(resolve,900);})]).then(async()=>{if(token!==changeId.current)return;const foreground=mapRef.current?.querySelector<HTMLElement>('[data-path-foreground]');if(foreground){const motion=foreground.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-in-out',fill:'forwards'});fade.current=motion;try{await motion.finished;}catch{return;}}commit();});
 };
 useEffect(()=>{const go=(e:Event)=>{const d=(e as CustomEvent<EndgameOpen>).detail;if(d?.target==='paths'&&d.format&&FORMAT_PATHS.some(p=>p.format===d.format))chooseRef.current(d.format);};window.addEventListener(ENDGAME_OPEN,go);return()=>window.removeEventListener(ENDGAME_OPEN,go);},[]);
 const chooseRef=useRef(chooseFormat);chooseRef.current=chooseFormat;

 const swipeStart=(e:React.TouchEvent)=>{if(story||upcoming||!root.current?.contains(e.target as Node)||e.touches.length!==1){swipe.current=null;return;}const t=e.touches[0];swipe.current={x:t.clientX,y:t.clientY};};
 const swipeEnd=(e:React.TouchEvent)=>{const start=swipe.current,t=e.changedTouches[0];swipe.current=null;if(!start||!t)return;const dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)<56||Math.abs(dy)>48||Math.abs(dx)<Math.abs(dy)*1.5)return;const index=PATHS_IN_ORDER.findIndex(p=>p.format===format),to=PATHS_IN_ORDER[index+(dx<0?1:-1)];if(to){suppressClickUntil.current=performance.now()+400;chooseFormat(to.format);}};
 useEffect(()=>{
  if(!story||!host)return;
  const previous=document.activeElement as HTMLElement|null;
  const dialog=host.closest('dialog');const back=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation();if(host.querySelector('[data-story-complete="true"]'))finishStory();else setStory(null);};
  const backdrop=(event:Event)=>{if(event.target===dialog)back(event);};
  dialog?.addEventListener('click',backdrop,true);dialog?.addEventListener('cancel',back,true);
  return()=>{dialog?.removeEventListener('click',backdrop,true);dialog?.removeEventListener('cancel',back,true);previous?.focus({preventScroll:true});};
 },[story,host]);
 const finishStory=()=>{if(story){let saved:StoryId[]=[];try{saved=readStoryProgress(JSON.parse(localStorage.getItem(STORY_KEY)??'[]'));}catch{}const done=readStoryProgress([...saved,...storyDone,story]);setStoryDone(done);try{localStorage.setItem(STORY_KEY,JSON.stringify(done));}catch{}earnForStory(story);}setStory(null);};
 const path=FORMAT_PATHS.find(p=>p.format===format)!,core=path.chapters.flatMap(c=>c.lessons);
 const status=(l:PathLesson)=>lessonEvidence(path.format,l,steps,answers);
 const completed=core.filter(l=>status(l).complete).length,next=core.find(l=>!status(l).complete);
 const finishedPaths=FORMAT_PATHS.filter(p=>p.chapters.flatMap(c=>c.lessons).every(l=>lessonEvidence(p.format,l,steps,answers).complete)).length;
 const launch=(lesson:PathLesson,replay=false)=>{endLearningPreview();const s=status(lesson);const remembered={...lastOpened,[path.format]:lesson.id};setLastOpened(remembered);try{localStorage.setItem(LAST_OPENED_KEY,JSON.stringify(remembered));}catch{}window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:path.format,lessonId:lesson.id,step:replay?0:s.step,quiz:!replay&&s.quiz,question:replay?0:s.question,nonce:Date.now()}}));};
 const openStory=(id:StoryId,node:HTMLButtonElement)=>{const rect=node.getBoundingClientRect();storyOrigin.current={x:rect.x+rect.width/2,y:rect.y+rect.height/2,size:rect.width,height:rect.height,radius:getComputedStyle(node).borderRadius,color:getComputedStyle(node).backgroundColor};setStory(id);};
 const opening=path.openingStory&&!storyDone.includes(path.openingStory)?path.openingStory:null;
 // Landing card (G-12, Sep 30 2026): Continue always targets a REQUIRED starter lesson (lib/paths/pathContinue.ts); an unwatched
 // opening story is offered beside it as an optional chip, and a finished path points at the next path.
 const target=pathContinue(path,steps,answers,lastOpened[path.format]),resumeLesson=target.kind==='lesson'?target.lesson:undefined;
 const untouched=target.kind==='lesson'&&target.label==='Start here';
 const openingTitle=opening?(opening==='grit'?'Grit':STORY_CARDS.find(card=>card.id===opening)?.skill??'Story'):null;
 const openingStoryTitle=opening?STORY_CARDS.find(card=>card.id===opening)?.title.replace(/\.$/,'')??openingTitle:null;
 const nextTitle=target.kind==='complete'&&target.next?FORMAT_PATHS.find(p=>p.format===target.next)?.title??target.next:null;
 // Optional stories sit after these lesson indexes: three stories at 3/7/11, four spread evenly across the twelve stops.
 const slots=(UPCOMING_STORIES[format]?.length??0)>=4?[2,5,8,11]:[3,7,11];
 const nodes:{lesson:PathLesson;story?:StoryId;index:number;upcoming?:UpcomingStoryData}[]=[...(path.openingStory?[{lesson:core[0],story:path.openingStory,index:-1}]:[]),...core.flatMap((lesson,i)=>[{lesson,story:undefined as StoryId|undefined,index:i},...(lesson.story?[{lesson,story:lesson.story,index:i}]:[]),...(slots.includes(i)&&UPCOMING_STORIES[format]?.[slots.indexOf(i)]?[{lesson,index:i,upcoming:UPCOMING_STORIES[format][slots.indexOf(i)]}]:[])])];
 let chapterGap=0;
 const route=({futsal:{amplitude:54,frequency:1.45,bend:85},'7v7':{amplitude:60,frequency:1.05,bend:65},'9v9':{amplitude:-58,frequency:1.25,bend:100},'11v11':{amplitude:62,frequency:.82,bend:115}} as Record<string,{amplitude:number;frequency:number;bend:number}>)[format];
 const stops=nodes.map((node,index)=>{if(!node.story&&path.chapters.slice(1).some(c=>c.lessons[0].id===node.lesson.id))chapterGap+=110;return {...node,x:160+Math.sin(index*route.frequency)*route.amplitude,y:84+index*200+chapterGap-(node.story&&node.index===-1?40:0)};});
 placeBetweenStops(stops,path.chapters.map(c=>c.lessons[c.lessons.length-1].id));
 const height=stops[stops.length-1].y+210;
 return <section ref={root} className={`${styles.learningPath} ${journey.journey}`} aria-label="Format learning paths" onTouchStart={swipeStart} onTouchEnd={swipeEnd} onTouchCancel={()=>{swipe.current=null;}} onClickCapture={e=>{if(performance.now()<suppressClickUntil.current){e.preventDefault();e.stopPropagation();}}}>
 <div className={`${ui.overview} ${journey.bearing} ${journey.landing}`}>
 <div className={journey.landingHead}><span className={journey.eyebrow}>{untouched?'YOUR FIRST LANDING':'WHERE YOU LEFT OFF'}</span><h3>{path.title} Pitch</h3></div>
 <div className={journey.landingNext}>
  <div className={journey.landingProgress}><strong>{completed} / {core.length} starter lessons complete</strong><progress value={completed} max={core.length} aria-label={`${path.title} starter progress`}/></div>
  {/* Oct 1 2026 (user): the card shows ONE step. A brand-new player starts with the path's opening story (7v7: "When the game
      feels unfair"), then lesson 1; everyone else sees only where they left off (no optional story beside it). */}
  {untouched&&opening&&openingStoryTitle?<button type="button" data-path-continue data-path-opening-story onClick={event=>openStory(opening,event.currentTarget)}><span className={journey.continueLabel}>Start here</span><span className={journey.continueTitle}>{openingStoryTitle}</span></button>
  :resumeLesson&&target.kind==='lesson'?<button type="button" data-path-continue onClick={()=>launch(resumeLesson)}><span className={journey.continueLabel}>{target.label}</span><span className={journey.continueTitle}>{target.index+1}. {resumeLesson.name}</span></button>:nextTitle?<button type="button" data-path-continue onClick={()=>{const n=target.kind==='complete'?target.next:null;if(n)chooseFormat(n);}}><span className={journey.continueLabel}>Path complete! Next path</span><span className={journey.continueTitle}>Try {nextTitle}</span></button>:<p role="status">Every starter path is complete! Go deeper below or replay any stop.</p>}
 </div></div>
 {/* Oct 1 2026 (user): the Review / Warm up card is removed from Paths. */}
 <div className={journey.sectionLabel}><span>02 / CHOOSE YOUR PATH</span><p>Four paths. One island.</p></div>
 <div ref={sentinel} className={journey.dockSentinel} aria-hidden="true"/>
 <div ref={dock} className={journey.pathDock}><div className={`${ui.tabs} ${journey.coasts}`} style={{'--format-index':PATHS_IN_ORDER.findIndex(p=>p.format===format)} as CSSProperties} role="group" aria-label="Choose a format"><span className={ui.tabHighlight} aria-hidden="true"/>{PATHS_IN_ORDER.map((p,i)=><button key={p.format} type="button" aria-pressed={format===p.format} onClick={()=>chooseFormat(p.format)}><span className={journey.coastArt} aria-hidden="true"><i/><b>{String(i+1).padStart(2,'0')}</b></span><strong>{p.title}</strong></button>)}</div></div>
 {upcoming&&host&&createPortal(<UpcomingStory key={upcoming.id} story={upcoming} onClose={completed=>{if(completed){setOptionalDone(completeOptionalStory(upcoming.id,optionalDone));earnForStory(upcoming.id);}setUpcoming(null);}}/>,host)}
 <div ref={mapRef} className={`${styles.questPath} ${journey.levelMap}`} style={{height}}>
 {/* Bounded SVGs preserve the print filters without a single multi-screen raster surface. */}
 {path.chapters.map((chapter,ci)=>{const first=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[0].id)!,last=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[chapter.lessons.length-1].id)!,y=first.y-90,h=last.y-first.y+270,ink=ISLAND_INKS[ci%4],d=`M35 ${y+20} Q100 ${y-15} 170 ${y+15} Q310 ${y-5} 309 ${y+130} L305 ${y+h-110} Q330 ${y+h} 218 ${y+h} Q95 ${y+h+30} 24 ${y+h-45} Q-5 ${y+h-100} 20 ${y+h-190} L13 ${y+110} Q0 ${y+60} 35 ${y+20}Z`;const baked=(pathArt as Record<string,{top:number;height:number;mobile:string;desktop:string}[]>)[format]?.[ci];if(!artSource&&baked&&baked.top===y-80&&baked.height===h+160)return <picture key={chapter.title} className={journey.chapterArt} style={{top:baked.top,height:baked.height}}><source media="(max-width:600px)" srcSet={baked.mobile}/><img src={baked.desktop} alt="" width="590" height={baked.height} loading="eager" decoding="async"/></picture>;return <svg key={chapter.title} className={styles.questRoad} style={{top:y-80,height:h+160}} viewBox={`0 ${y-80} 320 ${h+160}`} preserveAspectRatio="none" aria-hidden="true">
 <defs>
  <filter id={`pathTear${ci}`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency={`${.012/mapScale} .012`} numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id={`pathGrain${ci}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency={`${1.1/mapScale} 1.1`} numOctaves="2" seed="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0 .55"/></feComponentTransfer></filter>
  {ISLAND_INKS.map((ink,i)=><pattern key={i} id={`pathDots${ci}-${i}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform={`scale(${1/mapScale} 1) rotate(${[15,75,45,0][i]})`}><circle cx="3" cy="3" r="1.15" fill={ink.dots}/></pattern>)}
 </defs><g>
  <path d={d} fill={ink.echo} opacity=".38" transform={`translate(${3/mapScale} 2.5)`} filter={`url(#pathTear${ci})`}/>
  <g filter={`url(#pathTear${ci})`}><path d={d} fill={ink.fill}/><path d={d} fill={`url(#pathDots${ci}-${ci%4})`} opacity=".55"/></g>
  <clipPath id={`pathClip${ci}`}><path d={d}/></clipPath>
  <rect x="0" y={y-20} width="320" height={h+60} clipPath={`url(#pathClip${ci})`} filter={`url(#pathGrain${ci})`} fill="#22366b" opacity=".16" style={{mixBlendMode:'multiply'}}/>
  <path d={d} fill="none" stroke="#fff0cc" strokeWidth="5" strokeDasharray="34 9 58 7" strokeLinecap="round" filter={`url(#pathTear${ci})`}/>
  <path d={`M35 ${y+30} Q15 ${y+85} 25 ${y+125} M282 ${y+h-55}q-12 24-40 25`} fill="none" stroke="#fff0cc" strokeWidth="3"/></g></svg>;})}
 {Array.from({length:Math.ceil(height/512)},(_,i)=><div key={`grain${i}`} aria-hidden="true" className={journey.mapGrain} style={{top:i*512,height:Math.min(512,height-i*512),backgroundPosition:`0 ${-i*512}px`}}/>)}
 <div data-path-foreground className={journey.pathForeground}>{stops.slice(1).map((stop,i)=>{const prev=stops[i];return <svg key={i} className={styles.questRoad} style={{top:prev.y-8,height:stop.y-prev.y+16}} viewBox={`0 ${prev.y-8} 320 ${stop.y-prev.y+16}`} preserveAspectRatio="none" aria-hidden="true"><path data-path-line d={`M${prev.x} ${prev.y} C${prev.x} ${prev.y+route.bend} ${stop.x} ${stop.y-route.bend} ${stop.x} ${stop.y}`} fill="none" stroke="#c8ceb0" strokeWidth="12" strokeLinecap="round"/></svg>;})}

 {path.chapters.map((chapter,ci)=>{const first=stops.find(n=>!n.story&&!n.upcoming&&n.lesson.id===chapter.lessons[0].id)!;return <div className={journey.chapterFlag} key={chapter.title} style={{top:first.y-90}}>{!['Meet the team and restart','Receive inside the team shape','Find your unit and receive','Find your connection'].includes(chapter.title)&&<strong>{chapter.title}</strong>}</div>;})}
 <ol className={styles.questStops}>{stops.map(stop=>{const s=status(stop.lesson),card=stop.upcoming?{title:stop.upcoming.title,skill:stop.upcoming.theme}:stop.story?STORY_CARDS.find(c=>c.id===stop.story):undefined,done=stop.upcoming?optionalDone.includes(stop.upcoming.id):stop.story?storyDone.includes(stop.story):s.complete,locked=!stop.upcoming&&!stop.story&&pathLessonLocked(path,stop.lesson,steps,answers);return <li key={stop.upcoming?.id??stop.story??stop.lesson.id} className={`${styles.questStop} ${locked?journey.lockedStop:''} ${stop.story||stop.upcoming?styles.storyStop:''} ${done?styles.questDone:!stop.story&&next?.id===stop.lesson.id?styles.questCurrent:''}`} style={{left:`${stop.x/320*100}%`,top:stop.y-32}}>
 <button type="button" disabled={locked} aria-label={card?`Story: ${card.title}${done?'. Completed, replay':''}`:`${stop.index+1}. ${stop.lesson.name}. ${locked?'Locked. Complete the previous stop to unlock':done?'Completed, replay':`${s.watched}/${stop.lesson.steps} play steps, ${s.correct}/${stop.lesson.questions} quiz answers`}`} onClick={event=>{if(stop.upcoming)setUpcoming(stop.upcoming);else if(stop.story)openStory(stop.story,event.currentTarget);else launch(stop.lesson,done);}}><StopIcon kind={locked?'lock':stop.story||stop.upcoming?'story':done?'check':s.quiz?'ball':'play'}/></button>
 <strong>{card?`Story · ${card.title}`:`${stop.index+1}. ${stop.lesson.name}`}</strong><small>{card?`${card.skill} · ${done?'Completed · Replay anytime':stop.upcoming?'1 minute · Optional':'Optional'}`:locked?'Complete the previous stop to unlock':done?'Completed · Replay anytime':null}</small>
 </li>;})}</ol></div></div>
 <details className={ui.depth}><summary>Go deeper · {path.depth.length} optional lessons</summary><p>Extra practice. These lessons do not hold up your starter path.</p>{path.depth.map(l=><button type="button" key={l.id} onClick={()=>launch(l,status(l).complete)}><span>{l.name}</span><small>{status(l).complete?'Completed · Replay':'Watch & try'}</small></button>)}</details>
 {(format==='futsal'||format==='7v7')&&<details className={ui.depth}><summary>Practice in a different situation</summary><p>Try the existing guided and independent challenges. Return later to practice remembering.</p>{(format==='futsal'?['support','movement'] as const:['width'] as const).map(id=><button key={id} onClick={()=>launchLearning(id,'format-path')}>{id==='support'?'Support angles':id==='movement'?'Off ball movement':'Width and timing'}</button>)}</details>}
 {/* Lane 2 (Sep 30 2026): the harbour card is live: locked it says how to unlock; at 4/4 it boards the Matchday final. */}
 <div className={`${ui.future} ${journey.harbour}`} data-ferry-horizon={finishedPaths>=4?'open':'locked'}><span className={journey.eyebrow}>NEXT HORIZON / MATCHDAY FERRY</span><h3>{finishedPaths>=4?'The Matchday Ferry is boarding!':'Your Matchday final awaits.'}</h3><div className={journey.ferry} aria-hidden="true">⚑</div><strong>{finishedPaths} / 4 starter paths graduated</strong><p>{finishedPaths>=4?'You graduated on every pitch. Board the ferry for the coach’s exam, the trophy ceremony and your credits.':'Opening soon — finish your paths! Graduate all four starter paths (12 lessons each) and the Matchday Ferry takes you to your Matchday final.'}</p>{finishedPaths>=4?<button type="button" className={journey.harbourBoard} onClick={()=>openEndgame({target:'ferry'})}>Board the ferry</button>:<small>The Academy island comes later.</small>}</div>
 {story&&(host?createPortal(<StoryModal origin={storyOrigin.current} embedded key={story} storyId={story} onClose={()=>setStory(null)} onFinish={finishStory}/>,host):<StoryModal origin={storyOrigin.current} key={story} storyId={story} onClose={()=>setStory(null)} onFinish={finishStory}/>)}
 </section>;
}
