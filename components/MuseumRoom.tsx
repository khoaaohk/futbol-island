'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {NavigationButton} from './DoneButton';
import MuseumDoorSlide from './MuseumDoorSlide';
import MuseumExhibit,{Certificates,type ExhibitHooks} from './MuseumExhibit';
import MuseumStory,{type StoryHooks} from './MuseumStory';
import {isStoryCase} from '@/lib/museum/museumStories';
import EndgameDialog from './EndgameDialog';
import {Icon} from './Icon';
import styles from './MuseumRoom.module.css';
import {useModalFocus} from '@/lib/konbini/useModalFocus';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {EXHIBITS,UNLOCK_WORDS,exhibitState,galleryOf,nextExhibitToOpen,timelineOrder,type MuseumCounts} from '@/lib/endgame/museum';
import {useGraduations} from '@/lib/endgame/graduationStore';
import {certificateIds,isCertificateId,type CertificateId} from '@/lib/endgame/certificate';
import {useMuseumCounts,type MuseumCollection} from '@/lib/museum/useMuseumCounts';
import {COIN_QUEST} from '@/lib/town/coinQuest';
import {refreshMuseumDeparture,MUSEUM_RETURN_URL} from '@/lib/museum/museumDoors';
import {museumSfx,museumClickTarget,unlockMuseumAudio,createMuseumAmbience,MUSEUM_UNLOCK_EVENTS,type MuseumAmbience} from '@/lib/museum/museumSound';
import {konbiniAudioContext} from '@/lib/konbini/konbiniSound';
import type {MuseumScene,MuseumZoomView} from '@/lib/museum/museumScene';
import type {MuseumPoi} from '@/lib/museum/museumLayout';
const WorldCupBalls=dynamic(()=>import('./WorldCupBalls'),{ssr:false});
import {EXPERIENCES} from './museum/experiences';
const GraduationCeremony=dynamic(()=>import('./GraduationCeremony'),{ssr:false,loading:()=><p role="status">Getting your certificate ready…</p>});

/**
 * The walk-in History Museum (Oct 3 2026, user: "build that out just like the Konbini and arcade. Enter that building and make
 * that interactive"). A separate document like the Konbini and the Arcade: /museum. The island is not loaded here; the scene
 * module is lazy-loaded when the page mounts, and only after the collections are read (the cases are built open or covered).
 *
 * Same content and unlock rules as the Sep 30 dialog (lib/endgame/museum.ts): 12 cases in 4 galleries, opened by hidden balls,
 * player cards, pop-up books and graduations; the first case is free and every case cites its sources. Walk up to a case and
 * Look (or tap it): the camera eases onto the real case (the Konbini/vending close-up), and the card underneath holds the facts,
 * "Take it to your game", the sources and the case's hands-on exhibit. Locked cases wear a cloth cover and say exactly what to
 * collect. The museum guide at the desk tells you what opens next and walks you there.
 */
type Counts=MuseumCounts&{ready:boolean;collection:MuseumCollection};
/** The header's four collection chips, in each gallery's colour. */
const COUNT_WORD={balls:'balls',cards:'cards',books:'books',graduations:'grads'} as const,COUNT_ART={balls:'#2f8f8a',cards:'#d8466f',books:'#e0a33a',graduations:'#477c6a'} as const;
export default function MuseumRoom(){
 const counts=useMuseumCounts(),record=useGraduations();
 // Freeze what the cases show for this visit once the stores are read (nothing is collected inside the museum).
 useEffect(()=>{recordExploreActivity('museum');},[]);// Explore checklist: Visit the museum
 const [frozen,setFrozen]=useState<{open:Record<string,boolean>;earned:CertificateId[];found:boolean[];cards:number;books:number}|null>(null);
 useEffect(()=>{if(frozen||!counts.ready)return;setFrozen({open:Object.fromEntries(EXHIBITS.map(e=>[e.id,exhibitState(e,counts).open])),earned:certificateIds(record),
  found:COIN_QUEST.map(spot=>counts.collection.balls.includes(spot.id)),cards:counts.cards,books:counts.books});},[frozen,counts,record]);
 return frozen?<MuseumHall counts={counts} open={frozen.open} earned={frozen.earned} scene={frozen}/>:<main className={styles.root} aria-label="History Museum"><MuseumDoorSlide mode="arrive" ready={false}/></main>;
}

/** The guide's panel: focus moves in, Escape closes, Tab stays inside. */
function GuidePanel({onClose,children}:{onClose:()=>void;children:React.ReactNode}){
 const ref=useRef<HTMLElement>(null);useModalFocus(ref,onClose);
 return <section ref={ref} tabIndex={-1} className={styles.panel} role="dialog" aria-modal="true" aria-label="Museum guide" data-museum-guide-panel>{children}</section>;
}

function MuseumHall({counts,open,earned,scene:sceneInput}:{counts:Counts;open:Record<string,boolean>;earned:CertificateId[];scene:{found:boolean[];cards:number;books:number}}){
 const canvas=useRef<HTMLCanvasElement>(null),room=useRef<MuseumScene|null>(null),joy=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),promptRef=useRef<HTMLButtonElement>(null);
 const tap=useRef<{x:number;y:number}|null>(null),drag=useRef<{x:number;t:number;v:number;moved:number}|null>(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[firstFrame,setFirstFrame]=useState(false),[near,setNear]=useState<MuseumPoi|null>(null);
 const [zoom,setZoom]=useState<MuseumZoomView|null>(null),[leaving,setLeaving]=useState(false),[walkingOut,setWalkingOut]=useState(false),[exitTry,setExitTry]=useState(0);
 const [timelineId,setTimelineId]=useState<string|null>(null);
 const [greeting,setGreeting]=useState(false),[guideOpen,setGuideOpen]=useState(false),[cert,setCert]=useState<CertificateId|null>(null);
 // The World Cup ball gallery (full screen over the hall): the ball plinth opens it; /museum?balls opens it on arrival.
 const [balls,setBalls]=useState<string|false>(false);
 // Full-screen exhibit experiences (components/museum/experiences/<id>): "Step inside" on an open case; ?exp=<id> in development.
 const [experience,setExperience]=useState<string|null>(null);
 useEffect(()=>{const q=new URLSearchParams(window.location.search);if(q.has('balls'))setBalls(q.get('balls')||'');
  const x=q.get('exp');if(x&&EXPERIENCES[x]&&process.env.NODE_ENV!=='production')setExperience(x);},[]);
 const leavingRef=useRef(false),record=useGraduations();
 const covered=guideOpen||!!cert||balls!==false||!!experience;
 const joyRect=useJoystickBounds(joy,ready&&!zoom&&!covered);

 const leave=()=>{if(leavingRef.current)return;leavingRef.current=true;ambience.current?.fadeOut(.4);setTimeout(()=>ambience.current?.dispose(),420);setWalkingOut(true);setGuideOpen(false);setCert(null);room.current?.clearInput();refreshMuseumDeparture();setLeaving(true);
  setTimeout(()=>window.location.assign(MUSEUM_RETURN_URL),matchMedia('(prefers-reduced-motion:reduce)').matches?60:520);};
 /** Look at a spot: zoom onto a case or wall; the guide opens their panel. */
 const look=(p:MuseumPoi|string)=>{const id=typeof p==='string'?p:p.id;if(id==='guide'){room.current?.greet();setGuideOpen(true);return;}if(id==='wc-balls'){setBalls('');return;}room.current?.zoomTo(id);};
 useEffect(()=>{if(!canvas.current)return;let canceled=false;const node=canvas.current;
  import('@/lib/museum/museumScene').then(({createMuseumScene})=>{if(canceled)return;try{
   const scene=createMuseumScene(node,{open,earned,found:sceneInput.found,cards:sceneInput.cards,books:sceneInput.books},{onNear:setNear,onArrive:p=>look(p),onExit:()=>leave(),onZoom:setZoom,onTimeline:setTimelineId,onFirstFrame:()=>setFirstFrame(true),onZoomArrive:()=>museumSfx.look(),
    onPrompt:(x,y,visible)=>{const b=promptRef.current;if(b){const half=(b.offsetWidth||160)/2,vw=window.innerWidth,l=`${Math.round(Math.max(half+8,Math.min(vw-half-8,x))*2)/2}px`,t=`${Math.round(y*2)/2}px`,v=visible?'visible':'hidden';if(b.style.left!==l)b.style.left=l;if(b.style.top!==t)b.style.top=t;if(b.style.visibility!==v)b.style.visibility=v;}}});
   room.current=scene;(window as unknown as {__museum?:unknown}).__museum=scene;setReady(true);}catch(err){console.error("museum scene failed",err);setFailed(true);}}).catch(()=>!canceled&&setFailed(true));
  return()=>{canceled=true;room.current?.dispose();room.current=null;delete (window as unknown as {__museum?:unknown}).__museum;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{room.current?.setCovered(covered);if(covered)stop();},[covered,ready]);
 // Audio: every trusted input unlocks the page's one AudioContext (iOS counts touchend / click). The arrival bell and the gallery
 // "shh" play as the light fades, or on the first tap within 8 s if audio is still locked.
 const arrival=useRef(0);
 // The gallery ambience (lib/museum/museumSound.ts): starts on entry once audio may play (or on the first tap), idles, stops on leave.
 const ambience=useRef<MuseumAmbience|null>(null);
 useEffect(()=>{const a=createMuseumAmbience();ambience.current=a;(window as unknown as {__museumAmbience?:unknown}).__museumAmbience=a;a.input();const vis=()=>a.visibility();document.addEventListener('visibilitychange',vis);
  return()=>{document.removeEventListener('visibilitychange',vis);a.dispose();ambience.current=null;};},[]);
 useEffect(()=>{const input=(e:Event)=>{if(!e.isTrusted)return;unlockMuseumAudio();if(!leavingRef.current)ambience.current?.input();if(arrival.current&&performance.now()-arrival.current<8000){const c=konbiniAudioContext();if(c?.state==='running'){arrival.current=0;museumSfx.bell();setTimeout(museumSfx.hush,500);}}};
  for(const t of MUSEUM_UNLOCK_EVENTS)window.addEventListener(t,input,{capture:true,passive:true});return()=>{for(const t of MUSEUM_UNLOCK_EVENTS)window.removeEventListener(t,input,{capture:true});};},[]);
 useEffect(()=>{if(!firstFrame)return;const c=konbiniAudioContext();if(c?.state==='running'){museumSfx.bell();setTimeout(museumSfx.hush,500);}else arrival.current=performance.now();
  room.current?.greet();setGreeting(true);const t=setTimeout(()=>setGreeting(false),3600);return()=>clearTimeout(t);},[firstFrame]);
 // Keyboard: Enter/E looks at the prompted spot (arrows / Escape while zoomed live in the scene).
 useEffect(()=>{if(covered)return;const key=(e:KeyboardEvent)=>{if(e.repeat||e.target instanceof HTMLButtonElement)return;if((e.code==='Enter'||e.code==='KeyE')&&!zoom&&near){e.preventDefault();look(near);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[near,zoom,covered]);

 // ---- Joystick (the Konbini/Arcade control) ----
 const stop=(e?:{pointerId:number})=>{if(e&&e.pointerId!==pointer.current)return;const id=pointer.current;pointer.current=null;joyRect.current=null;if(id!==null&&joy.current?.hasPointerCapture(id))joy.current.releasePointerCapture(id);room.current?.setStick(0,0);paintJoystick(joy.current,0,0);};
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=joyRect.current??(joyRect.current=e.currentTarget.getBoundingClientRect()),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,scale=Math.min(1,36/Math.max(1,Math.hypot(dx,dy))),x=dx*scale,y=dy*scale;room.current?.setStick(x/36,y/36);paintJoystick(joy.current,x,y);};

 const zoomedId=zoom?.id??null,exhibit=EXHIBITS.find(e=>e.id===zoomedId)??null,spinning=zoomedId==='telstar-1970'&&!!zoom?.arrived&&!!open['telstar-1970']&&!isStoryCase('telstar-1970'),cranking=zoomedId==='backpass-1992'&&!!zoom?.arrived&&!!open['backpass-1992'],storyCase=isStoryCase(zoomedId);
 const storyHooks:StoryHooks=useMemo(()=>({play:(anim,arg)=>room.current?.story.play(zoomedId??'',anim,arg)??0,reset:()=>{if(zoomedId)room.current?.story.reset(zoomedId);},duck:on=>ambience.current?.duck(on)}),[zoomedId]);
 const rain=useCallback((on:boolean)=>room.current?.setRain(on),[]);
 const hooks:ExhibitHooks=useMemo(()=>({spin:d=>room.current?.spinNudge(d),rain,certificate:id=>{if(isCertificateId(id))setCert(id);},earned}),[rain,earned]);
 const nextCase=nextExhibitToOpen(counts);

 function card(){
  if(!zoom||!zoom.arrived)return null;
  if(zoom.id==='timeline')return <div className={styles.tag} data-museum-card="timeline"><div className={styles.tagHead}><span className={styles.eyebrow}>Timeline wall</span><h2>The story of football</h2></div>
   <p>Every case in date order. Tap a year to go to its case.</p>
   <ol className={styles.years}>{timelineOrder().map(e=>{const s=exhibitState(e,counts);return <li key={e.id}><button type="button" data-museum-year={e.id} data-open={s.open} style={{'--g':galleryOf(e.gallery).art} as React.CSSProperties} aria-label={`${e.year}: ${e.title}${s.open?'':'. Locked'}`} onClick={()=>room.current?.zoomTo(e.id)}>
    <b>{e.year}</b><span>{s.open?e.title:<><i className={styles.lockIcon} aria-hidden="true"/>{e.title}</>}</span></button></li>;})}</ol></div>;
  if(zoom.id==='my-balls'){const found=COIN_QUEST.filter(spot=>counts.collection.balls.includes(spot.id));return <div className={styles.tag} data-museum-card="my-balls" style={{'--g':'#477c6a'} as React.CSSProperties}><div className={styles.tagHead}><span className={styles.eyebrow}>Your Collection</span><h2>Your hidden balls</h2></div>
   <p data-museum-found={found.length}><b>{found.length} of {COIN_QUEST.length}</b> found. Each one sits on its own peg.</p>
   <div className={styles.progress} role="progressbar" aria-label="Hidden balls found" aria-valuemin={0} aria-valuemax={COIN_QUEST.length} aria-valuenow={found.length}><i style={{width:`${found.length/COIN_QUEST.length*100}%`}}/></div>
   {found.length?<details className={styles.sources} open={found.length<=3}><summary>What your balls taught you</summary><ul className={styles.collectionList}>{found.map(spot=><li key={spot.id}><b>{spot.name}</b> {spot.teaching}</li>)}</ul></details>
    :<p className={styles.small}>{UNLOCK_WORDS.balls.how}</p>}</div>;}
  if(zoom.id==='my-cards'||zoom.id==='my-books'){const cards=zoom.id==='my-cards',items=cards?counts.collection.cards:counts.collection.books,kind=cards?'cards':'books';
   return <div className={styles.tag} data-museum-card={zoom.id} style={{'--g':'#477c6a'} as React.CSSProperties}><div className={styles.tagHead}><span className={styles.eyebrow}>Your Collection</span><h2>{cards?'Your player cards':'Your pop-up books'}</h2></div>
    <p>{cards?counts.collection.cardLesson:counts.collection.bookLesson}</p>
    <p data-museum-have={items.length}><b>{items.length} {items.length===1?UNLOCK_WORDS[kind].one:UNLOCK_WORDS[kind].many}</b>{items.length>(cards?10:18)?` (the ${cards?'table':'shelves'} show${cards?'s':''} the first ${cards?10:18})`:''}</p>
    {items.length?<ul className={styles.collectionList}>{items.map(item=><li key={item.id}><b>{item.label}</b>{item.detail?` · ${item.detail}`:''}</li>)}</ul>:<p className={styles.small}>{UNLOCK_WORDS[kind].how}</p>}</div>;}
  if(zoom.id==='hall-wall')return <div className={styles.tag} data-museum-card="hall-wall"><div className={styles.tagHead}><span className={styles.eyebrow}>Hall of Fame</span><h2>Your certificates</h2></div>
   <p>Every path you graduate hangs its certificate here.</p><Certificates earned={earned} open={id=>{if(isCertificateId(id))setCert(id);}}/></div>;
  if(!exhibit)return null;
  const g=galleryOf(exhibit.gallery),s=exhibitState(exhibit,counts),shown=open[exhibit.id]&&s.open;
  return <div className={styles.tag} data-museum-card={exhibit.id} data-open={shown} style={{'--g':g.art} as React.CSSProperties}>
   <div className={styles.tagHead}><span className={styles.eyebrow}>{g.title} · {exhibit.year}</span><h2>{exhibit.title}</h2></div>
   {shown?<>
    <ul className={styles.facts}>{exhibit.facts.map(f=><li key={f}>{f}</li>)}</ul>
    <MuseumExhibit id={exhibit.id} hooks={hooks}/>
    <p className={styles.forGame}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
    {exhibit.sources.length>0&&<details className={styles.sources}><summary>Sources</summary><ul>{exhibit.sources.map(src=><li key={src.url}><a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a></li>)}</ul></details>}
   </>:<div className={styles.locked} data-museum-locked={exhibit.id}>
    <p className={styles.lockText}>{s.lockText||'Come back out and in again to open this case.'}</p>
    <div className={styles.progress} role="progressbar" aria-label={`${UNLOCK_WORDS[g.unlock].many} collected`} aria-valuemin={0} aria-valuemax={s.need} aria-valuenow={Math.min(s.have,s.need)}><i style={{width:`${Math.min(100,s.have/Math.max(1,s.need)*100)}%`}}/></div>
    <p className={styles.small}>{s.how}</p></div>}
  </div>;
 }

 const label=zoom?`${zoom.label} · ${zoom.index+1}/${zoom.count}`:'';
 return <main onClickCapture={e=>{if(museumClickTarget(e.target))museumSfx.click();}} aria-label="History Museum" className={styles.root} data-museum-room data-ready={ready} data-zoomed={!!zoom} data-story={storyCase&&!!zoom?.arrived||undefined}>
  <header className={styles.header}>{zoom?<NavigationButton back label="Back" data-museum-back onNavigate={()=>room.current?.zoomOut()}/>:<NavigationButton label="Done" data-museum-done key={exitTry} onNavigate={()=>{if(room.current){setWalkingOut(true);room.current.leave();const n=exitTry;setTimeout(()=>{if(!leavingRef.current){setExitTry(n+1);setWalkingOut(false);}},5000);}else leave();}}/>}
   {zoom&&<span className={styles.section} data-museum-section={zoom.id} aria-live="polite">{label}</span>}
   {zoom?.arrived&&zoom.id==='timeline'&&<button type="button" className={styles.stepInside} data-museum-step-inside="timeline" onClick={()=>setExperience('timeline')}>Step inside</button>}
   {zoom?.arrived&&zoom.id!=='timeline'&&EXPERIENCES[zoom.id]&&open[zoom.id]&&<button type="button" className={styles.stepInside} data-museum-step-inside={zoom.id} onClick={()=>setExperience(zoom.id)}>Step inside</button>}
   {!zoom&&<span className={styles.counts} aria-label={`${counts.balls} hidden balls, ${counts.cards} player cards, ${counts.books} pop-up books, ${counts.graduations} graduations`}>
    {(['balls','cards','books','graduations'] as const).map(k=><span key={k} data-museum-hud={k} style={{'--g':COUNT_ART[k]} as React.CSSProperties}><b>{counts[k]}</b>{counts[k]===1?COUNT_WORD[k].slice(0,-1):COUNT_WORD[k]}</span>)}</span>}
  </header>
  <canvas ref={canvas} tabIndex={0} className={styles.canvas} aria-label="Walkable History Museum. Use WASD or arrow keys to walk, then Enter to look at a case. Tap a case to walk there and look closer."
   onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};if(spinning||cranking){drag.current={x:e.clientX,t:performance.now(),v:0,moved:0};e.currentTarget.setPointerCapture(e.pointerId);}}}
   onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,now=performance.now(),dt=Math.max(1,now-d.t);d.v=dx*.012/(dt/1000);d.x=e.clientX;d.t=now;d.moved+=Math.abs(dx);if(cranking)room.current?.story.crank(dx*.02);else room.current?.spinDrag(dx);}}
   onPointerCancel={()=>{drag.current=null;}}
   onPointerUp={e=>{const p=tap.current,d=drag.current;tap.current=null;drag.current=null;
    if(d){if(d.moved>6&&spinning)room.current?.spinRelease(performance.now()-d.t<120?d.v:0);return;}
    if(zoom&&p&&Math.abs(e.clientX-p.x)>50&&Math.abs(e.clientX-p.x)>Math.abs(e.clientY-p.y)){room.current?.zoomStep(e.clientX<p.x?1:-1);return;}
    if(!zoom&&p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12)room.current?.pick(e.clientX,e.clientY);}}/>
  {failed&&<div className={styles.error}><h2>The museum couldn’t load.</h2><button type="button" onClick={leave}>Back to the island</button></div>}
  {near&&!zoom&&!covered&&<button ref={promptRef} type="button" className={`store-enter-prompt ${styles.prompt}`} data-museum-prompt={near.id} onClick={()=>look(near)}>{near.verb} · {near.label}</button>}
  {zoom&&<>
   <button type="button" className={`${styles.arrow} ${styles.prev}`} data-museum-prev aria-label="Previous case" disabled={zoom.index<=0} onClick={()=>room.current?.zoomStep(-1)}><Icon name="back" size={22}/></button>
   <button type="button" className={`${styles.arrow} ${styles.next}`} data-museum-next aria-label="Next case" disabled={zoom.index>=zoom.count-1} onClick={()=>room.current?.zoomStep(1)}><Icon name="arrow" size={22}/></button>
   {zoom.arrived&&(storyCase&&exhibit?<MuseumStory key={zoom.id} exhibit={exhibit} open={!!open[exhibit.id]} counts={counts} hooks={storyHooks}/>:<div className={styles.card} key={zoom.id}>{card()}</div>)}
   {spinning&&<p className={styles.hint} aria-hidden="true">Drag to spin</p>}
  </>}
  {timelineId&&!zoom&&(()=>{const e=EXHIBITS.find(x=>x.id===timelineId);if(!e)return null;const s=exhibitState(e,counts);return <p key={timelineId} className={styles.yearPop} style={{'--g':galleryOf(e.gallery).art} as React.CSSProperties} data-museum-timeline={timelineId} role="status"><b>{e.year}</b>{e.title}{s.open?'':' · locked'}</p>;})()}
  {greeting&&!zoom&&<p className={styles.greeting} data-museum-greeting role="status"><b>Ada:</b> Welcome to the History Museum! Gallery voices, please. Shh!</p>}
  {guideOpen&&<div className={styles.panelWrap} onPointerDown={e=>{if(e.target===e.currentTarget)setGuideOpen(false);}}>
   <GuidePanel onClose={()=>setGuideOpen(false)}>
    <NavigationButton className={styles.close} label="Done" onNavigate={()=>setGuideOpen(false)}/>
    <h2>Ada, museum guide</h2>
    <p>Every case opens with something you collect on the island, and the west wing shows your own collection. Here’s what you have:</p>
    <ul className={styles.guideCounts}>{(['balls','cards','books','graduations'] as const).map(k=><li key={k} data-museum-count={k}><b>{counts[k]}</b> {counts[k]===1?UNLOCK_WORDS[k].one:UNLOCK_WORDS[k].many}</li>)}</ul>
    <p className={styles.small}>{EXHIBITS.filter(e=>exhibitState(e,counts).open).length} of {EXHIBITS.length} cases open.</p>
    {nextCase?<><h3>Next to open</h3><p data-museum-next-case={nextCase.id}><b>{nextCase.title}</b> ({nextCase.year}). {exhibitState(nextCase,counts).lockText}</p>
     <button type="button" className={styles.gold} data-museum-show-me onClick={()=>{setGuideOpen(false);room.current?.walkTo(nextCase.id);}}>Show me</button></>
     :<p>Every case is open. You’ve seen the whole story of football!</p>}
    <div className={styles.row}><button type="button" className={styles.mint} data-museum-guide-timeline onClick={()=>{setGuideOpen(false);room.current?.walkTo('timeline');}}>Walk me to the timeline</button>
     <button type="button" className={styles.mint} data-museum-guide-collection onClick={()=>{setGuideOpen(false);room.current?.walkTo('my-balls');}}>Your Collection wing</button></div>
   </GuidePanel></div>}
  {/* The timeline wall (Hairline line figures, components/museum/experiences/timeline): "Visit this case" closes it and walks the hall's camera to that case. */}
  {experience==='timeline'&&(()=>{const X=EXPERIENCES.timeline;return <X exhibit={timelineOrder()[0]} earned={earned} openCertificate={id=>setCert(id)} onClose={()=>{setExperience(null);canvas.current?.focus();}}
   onVisit={id=>{setExperience(null);canvas.current?.focus();requestAnimationFrame(()=>room.current?.zoomTo(id));}}/>;})()}
  {experience&&experience!=='timeline'&&(()=>{const X=EXPERIENCES[experience],e=EXHIBITS.find(x=>x.id===experience);return X&&e?<X exhibit={e} earned={earned} openCertificate={id=>setCert(id)} onClose={()=>{setExperience(null);canvas.current?.focus();}}/>:null;})()}
  {balls!==false&&<WorldCupBalls initialId={balls||undefined} onClose={()=>{setBalls(false);canvas.current?.focus();}}/>}
  <EndgameDialog open={!!cert} label="certificate" title="Certificate" onClose={()=>setCert(null)}>{cert&&<GraduationCeremony record={record} formats={[]} view={cert}/>}</EndgameDialog>
  {!zoom&&!covered&&<div className="touch-controls"><div className="joystick" data-edge="false" ref={joy} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} role="group" aria-label="Move around the museum"
   onPointerDown={e=>{if(pointer.current!==null||!ready)return;e.preventDefault();pointer.current=e.pointerId;joyRect.current=null;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/></div></div>}
  {walkingOut&&!leaving&&<span className={styles.srOnly} role="status">Walking out to the island…</span>}
  <MuseumDoorSlide mode={leaving?'leave':'arrive'} key={leaving?'leave':'arrive'} ready={firstFrame||failed}/>
 </main>;
}
