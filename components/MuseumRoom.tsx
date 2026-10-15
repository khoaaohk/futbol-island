'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {NavigationButton} from './DoneButton';
import MuseumDoorSlide from './MuseumDoorSlide';
import MuseumExhibit,{type ExhibitHooks} from './MuseumExhibit';
import EndgameDialog from './EndgameDialog';
import {Icon} from './Icon';
import styles from './MuseumRoom.module.css';
import {useModalFocus} from '@/lib/konbini/useModalFocus';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {EXHIBITS,UNLOCK_WORDS,exhibitState,galleryOf,nextExhibitToOpen,timelineOrder,type MuseumCounts} from '@/lib/endgame/museum';
import {useGraduations} from '@/lib/endgame/graduationStore';
import {certificateIds,type CertificateId} from '@/lib/endgame/certificate';
import {useMuseumCounts} from '@/lib/museum/useMuseumCounts';
import {refreshMuseumDeparture,MUSEUM_RETURN_URL} from '@/lib/museum/museumDoors';
import {museumSfx,museumClickTarget,unlockMuseumAudio,createMuseumAmbience,MUSEUM_UNLOCK_EVENTS,type MuseumAmbience} from '@/lib/museum/museumSound';
import {konbiniAudioContext} from '@/lib/konbini/konbiniSound';
import type {MuseumScene,MuseumZoomView} from '@/lib/museum/museumScene';
import {accentOf} from '@/lib/museum/museumAtlas';
import {CASE_PLACES,type MuseumPoi} from '@/lib/museum/museumLayout';
const WorldCupBalls=dynamic(()=>import('./WorldCupBalls'),{ssr:false});
import {EXPERIENCES} from './museum/experiences';
import ExperienceStage,{ExperienceAfterglow,type StageInfo} from './museum/experiences/ExperienceStage';
import {passport,recordMuseumVisit,useMuseumVisits,museumVisitsNow} from '@/lib/museum/museumVisits';
import {enterActivity} from '@/lib/analytics/tracker';
import type {ActivityId} from '@/lib/analytics/islandIds';
const GraduationCeremony=dynamic(()=>import('./GraduationCeremony'),{ssr:false,loading:()=><p role="status">Getting your certificate ready…</p>});

/**
 * The walk-in History Museum (Oct 3 2026, user: "build that out just like the Konbini and arcade. Enter that building and make
 * that interactive"). A separate document like the Konbini and the Arcade: /museum. The island is not loaded here; the scene
 * module is lazy-loaded when the page mounts, and only after the collections are read (the cases are built open or covered).
 *
 * Content and rules from lib/endgame/museum.ts: every case is free and cites its sources. Oct 14 2026 (user: "get rid of your
 * pop-up books, your player cards, your hidden balls, and your certificates … replace with other historical exhibits"): the west
 * wing's Your Collection pieces, their cards and the header's collection counts are gone; the wing holds four history galleries. Walk up to a case and
 * Look (or tap it): the camera eases onto the real case (the Konbini/vending close-up), and the card underneath holds the facts,
 * "Take it to your game", the sources and the case's hands-on exhibit. Locked cases wear a cloth cover and say exactly what to
 * collect. The museum guide at the desk tells you what opens next and walks you there.
 */
type Counts=MuseumCounts&{ready:boolean};
/** The west wing's first case (the guide's "Walk me to the west wing"): the first Firsts case that has a place on the floor. */
const WING_FIRST=EXHIBITS.find(e=>e.gallery==='firsts'&&CASE_PLACES[e.id])?.id??EXHIBITS.find(e=>e.gallery==='hall')!.id;
export default function MuseumRoom(){
 const counts=useMuseumCounts(),record=useGraduations();
 // Freeze what the cases show for this visit once the stores are read (nothing is collected inside the museum).
 useEffect(()=>{recordExploreActivity('museum');},[]);// Explore checklist: Visit the museum
 const [frozen,setFrozen]=useState<{open:Record<string,boolean>;earned:CertificateId[]}|null>(null);
 useEffect(()=>{if(frozen||!counts.ready)return;setFrozen({open:Object.fromEntries(EXHIBITS.map(e=>[e.id,exhibitState(e,counts).open])),earned:certificateIds(record)});},[frozen,counts,record]);
 return frozen?<MuseumHall counts={counts} open={frozen.open} earned={frozen.earned}/>:<main className={styles.root} aria-label="History Museum"><MuseumDoorSlide mode="arrive" ready={false}/></main>;
}

/** The guide's panel: focus moves in, Escape closes, Tab stays inside. */
function GuidePanel({onClose,children}:{onClose:()=>void;children:React.ReactNode}){
 const ref=useRef<HTMLElement>(null);useModalFocus(ref,onClose);
 return <section ref={ref} tabIndex={-1} className={styles.panel} role="dialog" aria-modal="true" aria-label="Museum guide" data-museum-guide-panel>{children}</section>;
}

function MuseumHall({counts,open,earned}:{counts:Counts;open:Record<string,boolean>;earned:CertificateId[]}){
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
 // The visit's connective tissue (Oct 9 2026): one doorway curtain for every experience (ExperienceStage), Back from an exhibit
 // you entered from the timeline returns to the timeline at that era, and the museum passport (lib/museum/museumVisits.ts)
 // stamps every exhibit you step inside.
 const visits=useMuseumVisits(),pass=passport(visits);
 const [stage,setStage]=useState<{covered:boolean;from:string|null;tlAt:string|null;note:string}>({covered:false,from:null,tlAt:null,note:''});
 const [afterglow,setAfterglow]=useState<string|null>(null);
 const rootRef=useRef<HTMLElement>(null),trigger=useRef<{el:HTMLElement|null;id:string}|null>(null),refocus=useRef<'trigger'|'canvas'|null>(null);
 /** Step inside an experience (from a case, the timeline or ?exp=). Stamps the passport. */
 const openExperience=useCallback((id:string,o:{covered?:boolean;from?:string|null;tlAt?:string|null;note?:string}={})=>{
  // Remember the control that opened it from the hall (Step inside), to hand focus back on the way out.
  if(!o.covered){const a=document.activeElement;trigger.current={el:a instanceof HTMLElement&&a!==document.body?a:null,id};}
  const fresh=recordMuseumVisit(id),p=passport(museumVisitsNow());
  const note=o.note!==undefined?o.note:id==='timeline'?`${p.seen} of ${p.total} exhibits visited`:fresh?`New stamp! ${p.seen} of ${p.total} visited`:`Visited before · ${p.seen} of ${p.total}`;
  setStage({covered:!!o.covered,from:o.from??null,tlAt:o.tlAt??null,note});setExperience(id);},[]);
 useEffect(()=>experience?enterActivity(`exhibit_${experience}` as ActivityId):undefined,[experience]);// admin analytics: time per exhibit (module variable, no render)
 useEffect(()=>{const q=new URLSearchParams(window.location.search);if(q.has('balls'))setBalls(q.get('balls')||'');
  const x=q.get('exp');if(x&&EXPERIENCES[x]&&process.env.NODE_ENV!=='production')openExperience(x);},[openExperience]);
 const leavingRef=useRef(false),record=useGraduations();
 const covered=guideOpen||!!cert||balls!==false||!!experience;
 // Modal exhibits (Oct 9 2026 QA: Tab escaped from an open exhibit into the hall 7 to 17 times in 25). While an experience is up,
 // everything else in the hall is inert (the stage itself and native <dialog>s, e.g. a certificate opened from an exhibit, stay
 // live); re-applied if the hall's children change underneath. On the way out, focus goes back to the control that opened it.
 useLayoutEffect(()=>{const root=rootRef.current;if(!root)return;
  const apply=()=>{for(const el of Array.from(root.children)){if(!(el instanceof HTMLElement))continue;
   const want=!!experience&&!el.hasAttribute('data-museum-stage')&&el.tagName!=='DIALOG';if(el.inert!==want)el.inert=want;}};
  apply();
  if(!experience){const how=refocus.current;refocus.current=null;
   if(how==='trigger'){const t=trigger.current,fall=t&&root.querySelector<HTMLElement>(`[data-museum-step-inside="${t.id}"]`);
    const el=t?.el?.isConnected&&!t.el.closest('[inert]')?t.el:fall??canvas.current;el?.focus({preventScroll:true});}
   else if(how==='canvas')canvas.current?.focus({preventScroll:true});
   if(how)trigger.current=null;return;}
  const obs=new MutationObserver(apply);obs.observe(root,{childList:true});return()=>obs.disconnect();},[experience]);
 const joyRect=useJoystickBounds(joy,ready&&!zoom&&!covered);

 // Done exits straight away (door slide, then the island), no walk to the door first (user, Oct 10 2026).
 const leave=()=>{if(leavingRef.current)return;leavingRef.current=true;ambience.current?.fadeOut(.4);setTimeout(()=>ambience.current?.dispose(),420);setWalkingOut(true);setGuideOpen(false);setCert(null);room.current?.clearInput();refreshMuseumDeparture();setLeaving(true);
  setTimeout(()=>window.location.assign(MUSEUM_RETURN_URL),matchMedia('(prefers-reduced-motion:reduce)').matches?60:520);};
 /** Look at a spot: zoom onto a case or wall; the guide opens their panel. */
 const look=(p:MuseumPoi|string)=>{const id=typeof p==='string'?p:p.id;if(id==='guide'){room.current?.greet();setGuideOpen(true);return;}if(id==='wc-balls'){setBalls('');return;}room.current?.zoomTo(id);};
 useEffect(()=>{if(!canvas.current)return;let canceled=false;const node=canvas.current;
  import('@/lib/museum/museumScene').then(({createMuseumScene})=>{if(canceled)return;try{
   const scene=createMuseumScene(node,{open},{onNear:setNear,onArrive:p=>look(p),onExit:()=>leave(),onZoom:setZoom,onTimeline:setTimelineId,onFirstFrame:()=>setFirstFrame(true),onZoomArrive:()=>museumSfx.look(),
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
 // Step inside / out of an exhibit: cross-fade the hall theme to its activity variant (the penalty-1891 cabinet gets the chiptune one).
 useEffect(()=>{ambience.current?.setExhibit(!!experience,experience==='penalty-1891');},[experience]);
 // Ada's guide panel reads like a voice-over: duck the music under it, same as the arrival bell/hush below.
 useEffect(()=>{ambience.current?.duck(guideOpen);},[guideOpen]);
 useEffect(()=>{const input=(e:Event)=>{if(!e.isTrusted)return;unlockMuseumAudio();if(!leavingRef.current)ambience.current?.input();if(arrival.current&&performance.now()-arrival.current<8000){const c=konbiniAudioContext();if(c?.state==='running'){arrival.current=0;museumSfx.bell();setTimeout(museumSfx.hush,500);}}};
  for(const t of MUSEUM_UNLOCK_EVENTS)window.addEventListener(t,input,{capture:true,passive:true});return()=>{for(const t of MUSEUM_UNLOCK_EVENTS)window.removeEventListener(t,input,{capture:true});};},[]);
 useEffect(()=>{if(!firstFrame)return;const c=konbiniAudioContext();if(c?.state==='running'){museumSfx.bell();setTimeout(museumSfx.hush,500);}else arrival.current=performance.now();
  room.current?.greet();setGreeting(true);ambience.current?.duck(true);const t=setTimeout(()=>{setGreeting(false);ambience.current?.duck(false);},3600);return()=>{clearTimeout(t);ambience.current?.duck(false);};},[firstFrame]);
 // Keyboard: Enter/E looks at the prompted spot (arrows / Escape while zoomed live in the scene).
 useEffect(()=>{if(covered)return;const key=(e:KeyboardEvent)=>{if(e.repeat||e.target instanceof HTMLButtonElement)return;if((e.code==='Enter'||e.code==='KeyE')&&!zoom&&near){e.preventDefault();look(near);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[near,zoom,covered]);

 // ---- Joystick (the Konbini/Arcade control) ----
 const stop=(e?:{pointerId:number})=>{if(e&&e.pointerId!==pointer.current)return;const id=pointer.current;pointer.current=null;joyRect.current=null;if(id!==null&&joy.current?.hasPointerCapture(id))joy.current.releasePointerCapture(id);room.current?.setStick(0,0);paintJoystick(joy.current,0,0);};
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=joyRect.current??(joyRect.current=e.currentTarget.getBoundingClientRect()),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,scale=Math.min(1,36/Math.max(1,Math.hypot(dx,dy))),x=dx*scale,y=dy*scale;room.current?.setStick(x/36,y/36);paintJoystick(joy.current,x,y);};

 // Every case opens straight onto its full card (Oct 13 2026, user: "for all the exhibits remove this info thing and btn, just have
 // the full thing at the beginning"): eyebrow, title, facts, the hands-on bit, "Take it to your game", sources, Step inside. The
 // step-through story strip (beat dots, the ⓘ plaque, the beat buttons and the coach's voiced lines) is gone. The Telstar is the
 // one sculpture you can still drag to spin.
 const zoomedId=zoom?.id??null,exhibit=EXHIBITS.find(e=>e.id===zoomedId)??null,spinning=zoomedId==='telstar-1970'&&!!zoom?.arrived&&!!open['telstar-1970'];
 const rain=useCallback((on:boolean)=>room.current?.setRain(on),[]);
 const hooks:ExhibitHooks=useMemo(()=>({spin:d=>room.current?.spinNudge(d),rain}),[rain]);
 const nextCase=nextExhibitToOpen(counts);

 function card(){
  if(!zoom||!zoom.arrived)return null;
  if(zoom.id==='timeline')return null;// the timeline wall too: just See exhibit (its year list lives inside the exhibit)
  if(zoom.id==='timeline-card')return <div className={styles.tag} data-museum-card="timeline"><div className={styles.tagHead}><span className={styles.eyebrow}>Timeline wall</span><h2>The story of football</h2></div>
   <p>Every case in date order. Tap a year to go to its case.</p>
   <ol className={styles.years}>{timelineOrder().map(e=>{const s=exhibitState(e,counts);return <li key={e.id}><button type="button" data-museum-year={e.id} data-open={s.open} style={{'--g':accentOf(e.gallery)} as React.CSSProperties} aria-label={`${e.year}: ${e.title}${s.open?'':'. Locked'}`} onClick={()=>room.current?.zoomTo(e.id)}>
    <b>{e.year}{visits.seen.includes(e.id)&&<i className={styles.yearSeen} data-museum-year-seen aria-label=" (visited)"/>}</b><span>{s.open?e.title:<><i className={styles.lockIcon} aria-hidden="true"/>{e.title}</>}</span></button></li>;})}</ol>
   <p className={styles.small} data-museum-passport={pass.seen}>{pass.seen} of {pass.total} exhibits visited. See each exhibit to collect its stamp.</p></div>;
  if(!exhibit)return null;
  const g=galleryOf(exhibit.gallery),s=exhibitState(exhibit,counts),shown=open[exhibit.id]&&s.open;
  // Open cases show no card at all, just the "See exhibit" button (Oct 14 2026, user: "remove this information in front of the
  // exhibit. it's overwhelming. only have the btn to enter"). The facts live inside the exhibit itself; locked cases still say how to open.
  if(shown&&EXPERIENCES[exhibit.id])return null;
  return <div className={styles.tag} data-museum-card={exhibit.id} data-open={shown} style={{'--g':accentOf(g.id)} as React.CSSProperties}>
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
 return <main ref={rootRef} onClickCapture={e=>{if(museumClickTarget(e.target))museumSfx.click();}} aria-label="History Museum" className={styles.root} data-museum-room data-ready={ready} data-zoomed={!!zoom}>
  <header className={styles.header}>{zoom?<NavigationButton back label="Back" data-museum-back onNavigate={()=>room.current?.zoomOut()}/>:<NavigationButton className={styles.doneRight} label="Done" data-museum-done key={exitTry} onNavigate={leave}/>}
   {zoom&&<span className={styles.section} data-museum-section={zoom.id} aria-live="polite">{label}</span>}
  </header>
  {/* See exhibit: bottom centre, the one thing to do at an open case (Oct 14 2026, user). */}
  <div className={styles.enterBar}>
   {zoom?.arrived&&zoom.id==='timeline'&&<button type="button" className={styles.stepInside} data-museum-step-inside="timeline" onClick={()=>openExperience('timeline')}>See exhibit</button>}
   {zoom?.arrived&&zoom.id!=='timeline'&&EXPERIENCES[zoom.id]&&open[zoom.id]&&<button type="button" className={styles.stepInside} data-museum-step-inside={zoom.id} data-visited={visits.seen.includes(zoom.id)||undefined} onClick={()=>openExperience(zoom.id)}>
    {visits.seen.includes(zoom.id)&&<i className={styles.stepSeen} aria-hidden="true"/>}{visits.seen.includes(zoom.id)?'See exhibit again':'See exhibit'}</button>}
  </div>
  <canvas ref={canvas} tabIndex={0} className={styles.canvas} aria-label="Walkable History Museum. Use WASD or arrow keys to walk, then Enter to look at a case. Tap a case to walk there and look closer."
   onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};if(spinning){drag.current={x:e.clientX,t:performance.now(),v:0,moved:0};e.currentTarget.setPointerCapture(e.pointerId);}}}
   onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,now=performance.now(),dt=Math.max(1,now-d.t);d.v=dx*.012/(dt/1000);d.x=e.clientX;d.t=now;d.moved+=Math.abs(dx);room.current?.spinDrag(dx);}}
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
   {zoom.arrived&&(()=>{const c=card();return c&&<div className={styles.card} key={zoom.id}>{c}</div>;})()}
   {spinning&&<p className={styles.hint} aria-hidden="true">Drag to spin</p>}
  </>}
  {timelineId&&!zoom&&(()=>{const e=EXHIBITS.find(x=>x.id===timelineId);if(!e)return null;const s=exhibitState(e,counts);return <p key={timelineId} className={styles.yearPop} style={{'--g':accentOf(e.gallery)} as React.CSSProperties} data-museum-timeline={timelineId} role="status"><b>{e.year}</b>{e.title}{s.open?'':' · locked'}</p>;})()}
  {greeting&&!zoom&&<p className={styles.greeting} data-museum-greeting role="status"><b>Ada:</b> Welcome to the History Museum! Gallery voices, please. Shh!</p>}
  {guideOpen&&<div className={styles.panelWrap} onPointerDown={e=>{if(e.target===e.currentTarget)setGuideOpen(false);}}>
   <GuidePanel onClose={()=>setGuideOpen(false)}>
    <NavigationButton className={styles.close} label="Done" onNavigate={()=>setGuideOpen(false)}/>
    <h2>Ada, museum guide</h2>
    <p>Every case tells a true story from football’s history. The main hall has the Laws, the World Cup, and balls and kits; through the west wing’s wide opening are Firsts, Rules &amp; tactics, Skills &amp; science and Legends.</p>
    <p className={styles.small}>{EXHIBITS.filter(e=>exhibitState(e,counts).open).length} of {EXHIBITS.length} cases open · {pass.seen} of {pass.total} exhibits visited{pass.all?'. You’re a Museum Explorer!':''}</p>
    {nextCase?<><h3>Next to open</h3><p data-museum-next-case={nextCase.id}><b>{nextCase.title}</b> ({nextCase.year}). {exhibitState(nextCase,counts).lockText}</p>
     <button type="button" className={styles.gold} data-museum-show-me onClick={()=>{setGuideOpen(false);room.current?.walkTo(nextCase.id);}}>Show me</button></>
     :<p>Every case is open. Tap See exhibit on any case to explore!</p>}
    <div className={styles.row}><button type="button" className={styles.mint} data-museum-guide-timeline onClick={()=>{setGuideOpen(false);room.current?.walkTo('timeline');}}>Walk me to the timeline</button>
     <button type="button" className={styles.mint} data-museum-guide-wing onClick={()=>{setGuideOpen(false);room.current?.walkTo(WING_FIRST);}}>Walk me to the west wing</button></div>
   </GuidePanel></div>}
  {/* The timeline wall (Hairline line figures, components/museum/experiences/timeline): "Visit this case" closes it and walks the hall's camera to that case. */}
  {experience&&(()=>{const X=EXPERIENCES[experience],tl=experience==='timeline',e=tl?(EXHIBITS.find(x=>x.id===stage.tlAt)??timelineOrder()[0]):EXHIBITS.find(x=>x.id===experience);if(!X||!e)return null;
   const info:StageInfo=tl?{id:'timeline',year:'1863 → Today',title:'The story of football',gallery:'The timeline',color:'#1d1d1b',note:stage.note}
    :{id:e.id,year:e.year,title:e.title,gallery:galleryOf(e.gallery).title,color:accentOf(e.gallery),note:stage.note};
   /** Out of an experience: back to the timeline when it was entered from there, otherwise the hall fades back in. */
   const closed=()=>{if(!tl&&stage.from==='timeline'){openExperience('timeline',{covered:true,from:experience,tlAt:experience,note:stage.note.startsWith('New')?stage.note:''});return;}
    refocus.current='trigger';setExperience(null);setAfterglow(info.color);};// no stamp card on the way out (user, Oct 12 2026: "simplify and get rid of this"); visits still count in the passport
   // The timeline wall (components/museum/experiences/timeline): "Find it in the hall" closes it and walks the hall's camera to
   // that case; "Step inside" opens that exhibit straight away, and its Back comes back to the timeline at that era.
   return <ExperienceStage key={experience+(stage.covered?'+c':'')} info={info} covered={stage.covered} onClose={closed}>{close=><X exhibit={e} earned={earned} openCertificate={id=>setCert(id)} onClose={close}
    onComplete={()=>{recordMuseumVisit(experience,'done');}}
    {...(tl?{onVisit:(id:string)=>{refocus.current='canvas';setExperience(null);setAfterglow(info.color);requestAnimationFrame(()=>room.current?.zoomTo(id));},
     onEnter:(id:string)=>{if(EXPERIENCES[id]&&open[id])openExperience(id,{covered:true,from:'timeline',tlAt:id});else{refocus.current='canvas';setExperience(null);requestAnimationFrame(()=>room.current?.zoomTo(id));}}}:{})}/>}</ExperienceStage>;})()}
  {afterglow&&<ExperienceAfterglow key={afterglow} color={afterglow} onDone={()=>setAfterglow(null)}/>}
  {balls!==false&&<WorldCupBalls initialId={balls||undefined} onClose={()=>{setBalls(false);canvas.current?.focus();}}/>}
  <EndgameDialog open={!!cert} label="certificate" title="Certificate" onClose={()=>setCert(null)}>{cert&&<GraduationCeremony record={record} formats={[]} view={cert}/>}</EndgameDialog>
  {!zoom&&!covered&&<div className="touch-controls"><div className="joystick" data-edge="false" ref={joy} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} role="group" aria-label="Move around the museum"
   onPointerDown={e=>{if(pointer.current!==null||!ready)return;e.preventDefault();pointer.current=e.pointerId;joyRect.current=null;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/></div></div>}
  {walkingOut&&!leaving&&<span className={styles.srOnly} role="status">Walking out to the island…</span>}
  <MuseumDoorSlide mode={leaving?'leave':'arrive'} key={leaving?'leave':'arrive'} ready={firstFrame||failed}/>
 </main>;
}

