'use client';
import {useCallback,useEffect,useId,useLayoutEffect,useRef,useState,type PointerEvent} from 'react';
import type React from 'react';
import PlayerArt,{lookFor,photoFor,SCENERY_WAKE_EVENT} from './PlayerArt';
import {countryArt} from '@/lib/town/countryArt';
import {POSITION_PLAYERS} from '@/lib/town/playerPositions';
import CardFilmPlayer,{unlockedNarration,type CardCaption} from './CardFilmPlayer';
import {hasPlayFilm,loadPlayFilm} from '@/lib/plays/riso/registry';
import type {RisoStory} from '@/lib/paths/riso/story';
import {ALL_PLAYERS,CARD_STORAGE_KEY} from '@/lib/town/cardCollection';
import dynamic from 'next/dynamic';
import styles from './PlayerCard.module.css';
const CardHighlights=dynamic(()=>import('./CardHighlights'),{ssr:false});

const STORAGE_KEY=CARD_STORAGE_KEY;
/** The narration sentence with the current cue words marked. */
function highlight({sentence,words}:CardCaption){const at=words?sentence.toLowerCase().indexOf(words.trim().toLowerCase()):-1;if(at<0)return sentence;const end=at+words.trim().length;return <>{sentence.slice(0,at)}<mark>{sentence.slice(at,end)}</mark>{sentence.slice(end)}</>;}

/** Back-of-card tabs. The chosen tab is remembered for the session (per-viewer convenience; storage may be unavailable). */
type BackTab='strengths'|'plays'|'history';
const BACK_TABS:{id:BackTab;label:string}[]=[{id:'strengths',label:'Strengths'},{id:'plays',label:'Top Plays'},{id:'history',label:'History'}];
const TAB_KEY='fi-card-back-tab';
const readTab=():BackTab=>{try{const v=sessionStorage.getItem(TAB_KEY);return v==='plays'||v==='history'?v:'strengths';}catch{return 'strengths';}};
const saveTab=(tab:BackTab)=>{try{sessionStorage.setItem(TAB_KEY,tab);}catch{/* private mode: the tab just resets */}};
/** A club stint or national team as the back's History tab shows it ("Barcelona · 2004–2021"). */
type Stint={club:string;years:string;loan:boolean};
type History={clubs:Stint[];national:Stint|null};
/** Reads careerFor()'s result tolerantly (field names from→start, to→end, club→team/name), so the History tab keeps working as that data grows. */
function toHistory(raw:unknown):History|null{
 if(!raw||typeof raw!=='object')return null;const r=raw as Record<string,unknown>;
 const stint=(value:unknown):Stint|null=>{if(!value||typeof value!=='object')return typeof value==='string'&&value?{club:value,years:'',loan:false}:null;const s=value as Record<string,unknown>;
  const club=String(s.club??s.team??s.name??'');if(!club)return null;
  const from=s.from??s.start??s.since,to='to' in s?s.to:'end' in s?s.end:s.until;
  const years=typeof s.years==='string'?s.years:from==null?'':to==null||/^(now|present)$/i.test(String(to))?`${from}–now`:String(to)===String(from)?String(from):`${from}–${to}`;
  return {club,years,loan:!!(s.loan??s.onLoan)};};
 const list=Array.isArray(raw)?raw:Array.isArray(r.clubs)?r.clubs:Array.isArray(r.stints)?r.stints:[];
 const clubs=(list as unknown[]).map(stint).filter((s):s is Stint=>!!s);
 const national=stint(r.national??r.nationalTeam??r.country??null);
 // No sourced club history (clubs: [], source: 'missing') shows the friendly empty state, even if a national team is named.
 return clubs.length&&r.source!=='missing'?{clubs,national}:null;
}
/** The iconic-play entry (title, year, event, lesson) for the Top Plays tab. The 90 kB list loads only when that tab is opened. */
type Moment={title:string;year?:number;event?:string;lesson?:string};
let momentsCache:Promise<Record<string,Moment>>|null=null;
const loadMoments=()=>momentsCache??=import('@/lib/town/iconicPlays.json').then(m=>(m.default??m) as unknown as Record<string,Moment>).catch(error=>{momentsCache=null;throw error;});
/** Flip weight (Web Animations on the individual scale/translate properties, so they compose with the card's CSS transform and
 *  hover tilt): the card lifts and grows a little through the turn, then settles with a small overshoot; its ground shadow
 *  widens and softens while it is up. Offsets follow the flip curve (edge-on ≈ 13 %, overshoot peak ≈ 55 %). */
const LIFT:Keyframe[]=[{scale:'1',translate:'0 0',offset:0},{scale:'1.04',translate:'0 -4px',offset:.16,easing:'ease-in-out'},{scale:'1.025',translate:'0 -3px',offset:.4,easing:'ease-in-out'},
 {scale:'.994',translate:'0 1px',offset:.72,easing:'ease-in-out'},{scale:'1',translate:'0 0',offset:1}];
const LIFT_SHADOW:Keyframe[]=[{opacity:.5,scale:'1 1',offset:0},{opacity:.26,scale:'1.2 1.25',offset:.16,easing:'ease-in-out'},{opacity:.34,scale:'1.1 1.1',offset:.4,easing:'ease-in-out'},
 {opacity:.55,scale:'.97 .95',offset:.72,easing:'ease-in-out'},{opacity:.5,scale:'1 1',offset:1}];
/** Layout effect in the browser (no server warning). */
const useIsoLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;

export type PlayerCardProps={name:string;role:string;era:'current'|'allTime';blurb:string;team:'gold'|'blue';format:string;firstName:string;strengths:string[];sources?:{title:string;url:string}[];compact?:boolean;onFlipChange?:(flipped:boolean)=>void};

/**
 * A collectable player card. The tilt and foil glare follow the pointer through CSS variables set on
 * pointer events only (no animation loop); reduced motion keeps the card flat and flips instantly.
 * Players with an iconic-play film get a Play button: the film is code-split and loads only when Play is
 * pressed, then plays inside the card's picture window (CardFilmPlayer) with its narration as the caption.
 * At the end it holds the last frame, then fades back to the portrait.
 */
/** One face's share of the turn light: the glare sweep and the shade. `leaving` is the face turning away (it brightens and darkens
 *  toward edge-on); the other face picks the glare up at edge-on and carries it across as it turns in. The incoming face calls
 *  onDone when its sweep (the last animation of the burst) ends. */
function TurnLight({toBack,leaving,onDone}:{toBack:boolean;leaving:boolean;onDone?:()=>void}){
 return <span className={styles.turnLight} data-dir={toBack?'back':'front'} data-face={leaving?'out':'in'} aria-hidden="true" onAnimationEnd={event=>{if(event.target===event.currentTarget.firstChild&&!leaving)onDone?.();}}><i/><b/></span>;
}
type Phase='idle'|'loading'|'playing'|'holding'|'fading';
const HOLD_MS=600,FADE_MS=400;
export default function PlayerCard({name,role,era,blurb,team,strengths,sources=[],compact=false,onFlipChange}:PlayerCardProps){
 const card=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),controls=useRef<HTMLDivElement>(null);
 const [flipped,setFlipped]=useState(false);
 // Iconic-play film: nothing is imported until Play is pressed. idle → loading → playing → holding (last frame) → fading → idle.
 const [phase,setPhase]=useState<Phase>('idle'),[film,setFilm]=useState<{story:RisoStory;audio:HTMLAudioElement}|null>(null),[caption,setCaption]=useState<CardCaption|null>(null);
 const phaseNow=useRef<Phase>('idle'),pending=useRef<HTMLAudioElement|null>(null),loadId=useRef(0),timer=useRef<ReturnType<typeof setTimeout>>();
 phaseNow.current=phase;
 const filmReady=hasPlayFilm(name),active=phase==='loading'||phase==='playing'||phase==='holding',onFilm=phase!=='idle';
 // Viewing a card never collects it (position guides only show a position's players); cards are earned elsewhere.
 useEffect(()=>{setFlipped(false);},[name]);
 // Back tabs: remembered per session; History and Top Plays load their data only when shown on the back.
 const tabsId=useId(),[tab,setTab]=useState<BackTab>('strengths');
 useEffect(()=>{setTab(readTab());},[]);
 const pickTab=(next:BackTab,focus=false)=>{setTab(next);saveTab(next);if(focus)document.getElementById(`${tabsId}-${next}`)?.focus({preventScroll:true});};
 const onTabKey=(event:React.KeyboardEvent)=>{const i=BACK_TABS.findIndex(t=>t.id===tab),n=BACK_TABS.length;
  const to=event.key==='ArrowRight'?(i+1)%n:event.key==='ArrowLeft'?(i+n-1)%n:event.key==='Home'?0:event.key==='End'?n-1:-1;
  if(to<0)return;event.preventDefault();event.stopPropagation();pickTab(BACK_TABS[to].id,true);};
 const [history,setHistory]=useState<{name:string;value:History|null}|null>(null),[moment,setMoment]=useState<{name:string;value:Moment|null}|null>(null);
 useEffect(()=>{if(!flipped||tab!=='history'||history?.name===name)return;let live=true;
  import('@/lib/town/playerCareers').then(m=>Promise.resolve(m.careerFor(name))).then(raw=>{if(live)setHistory({name,value:toHistory(raw)});}).catch(()=>{if(live)setHistory({name,value:null});});
  return ()=>{live=false;};},[flipped,tab,name,history?.name]);
 useEffect(()=>{if(!flipped||tab!=='plays'||moment?.name===name)return;let live=true;
  loadMoments().then(all=>{if(live)setMoment({name,value:all[name]??null});}).catch(()=>{if(live)setMoment({name,value:null});});
  return ()=>{live=false;};},[flipped,tab,name,moment?.name]);
 // Turn light (one short burst per flip, not on a new player, never with reduced motion), started in the same frame as the turn
 // (layout effect): a glare band sweeps the face turning away and then the face turning in, that face shades as it turns from the
 // viewer, the thickness edge catches the light at edge-on, and the card lifts (LIFT). The burst layers unmount when their last
 // animation ends and the Web Animations finish on their own: nothing runs at rest.
 const [burst,setBurst]=useState<{id:number;toBack:boolean}|null>(null),lastFlip=useRef({name,flipped}),burstSeq=useRef(0),flippedNow=useRef(flipped);
 flippedNow.current=flipped;
 useIsoLayoutEffect(()=>{const last=lastFlip.current;lastFlip.current={name,flipped};if(last.name!==name||last.flipped===flipped)return;
  window.dispatchEvent(new Event(SCENERY_WAKE_EVENT));// the card's resting scenery wakes for the turn
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setBurst(null);return;}
  setBurst({id:++burstSeq.current,toBack:flipped});
  card.current?.animate(LIFT,{duration:700});shadow.current?.animate(LIFT_SHADOW,{duration:700});},[name,flipped]);
 // Hosts that mirror the face (the viewer's top-bar Flip) hear every change.
 const flipListener=useRef(onFlipChange);flipListener.current=onFlipChange;
 useEffect(()=>{flipListener.current?.(flipped);},[flipped]);
 const clear=()=>{clearTimeout(timer.current);timer.current=undefined;};
 const reset=useCallback(()=>{clearTimeout(timer.current);timer.current=undefined;loadId.current++;pending.current?.pause();pending.current=null;setFilm(null);setCaption(null);setPhase('idle');},[]);
 /** Stops the loop and audio at once (running=false) and fades the last frame back to the portrait. */
 const stopFilm=useCallback(()=>{const current=phaseNow.current;if(current==='idle'||current==='fading')return;
  if(current==='loading'){reset();return;}
  clearTimeout(timer.current);loadId.current++;setPhase('fading');phaseNow.current='fading';timer.current=setTimeout(reset,FADE_MS);},[reset]);
 const filmEnded=useCallback(()=>{clearTimeout(timer.current);setPhase('holding');timer.current=setTimeout(()=>{setPhase('fading');timer.current=setTimeout(reset,FADE_MS);},HOLD_MS);},[reset]);
 // A new player, or the card leaving the page, drops the film at once.
 useEffect(()=>{reset();return ()=>{clearTimeout(timer.current);pending.current?.pause();};},[name,reset]);
 useEffect(()=>{const dialog=card.current?.closest('dialog');if(!dialog)return;dialog.addEventListener('close',reset);return ()=>dialog.removeEventListener('close',reset);},[reset]);
 // While a film is on (including its fade): a hidden page stops it, and Escape (the dialog's `cancel`, when focus is outside the card) stops only
 // the film. The capture listener runs before the guide's own onCancel (a bubble listener on the same element) and stops it.
 useEffect(()=>{if(!onFilm)return;const dialog=card.current?.closest('dialog');
  const hidden=()=>{if(document.hidden)stopFilm();};document.addEventListener('visibilitychange',hidden);
  const cancel=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation();stopFilm();};dialog?.addEventListener('cancel',cancel,true);
  return ()=>{document.removeEventListener('visibilitychange',hidden);dialog?.removeEventListener('cancel',cancel,true);};},[onFilm,stopFilm]);
 // The fixed bar is centred under the card itself (the scroll area's gutter can shift the card off the screen centre).
 // Measured on resize only: no loop.
 useEffect(()=>{const host=stage.current,bar=controls.current;if(!host||!bar)return;
  const place=()=>{const box=host.getBoundingClientRect();bar.style.left=`${box.left+box.width/2}px`;};place();
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(place);observer?.observe(host);window.addEventListener('resize',place);
  return ()=>{observer?.disconnect();window.removeEventListener('resize',place);};},[]);
 const togglePlay=()=>{
  if(active){stopFilm();return;}
  clear();const id=++loadId.current;
  // Start the narration element inside the click (a user gesture) so the film's audio may autoplay once loaded.
  const media=unlockedNarration();pending.current=media;setFilm(null);setCaption(null);setFlipped(false);rest();setPhase('loading');
  loadPlayFilm(name).then(story=>{if(id!==loadId.current)return;if(!story){reset();return;}pending.current=null;setFilm({story,audio:media});setPhase('playing');})
   .catch(error=>{if(id!==loadId.current)return;console.warn('Iconic-play film failed to load',name,error);reset();});};
 const toggleFlip=()=>{stopFilm();halt();flipAt.current=performance.now();setFlipped(value=>!value);};
 // ── Hover tilt (a real mouse only: pointerType 'mouse' on a hover-capable fine pointer; never touch or pen, never with reduced motion
 // or while a film is on). One spring state (rx, ry and velocities) chases the pointer's target (±14° X, ±18° Y) and is written to
 // the .flip transform once per frame by a rAF loop that runs only while the spring moves: it sleeps when it catches up (even with the
 // pointer resting on the card) and, after the pointer leaves, springs back flat and hands the card back to its CSS (data-flipped).
 // While JS writes, data-motion turns the CSS transitions off so the two never fight. Glare, art parallax and the ground shadow
 // follow the angle; the edge thickness shows at the extremes. Flip is always the CSS transition between the two faces.
 type Motion={rx:number;ry:number;vx:number;vy:number;tx:number;ty:number;mode:'rest'|'hover'|'leave';raf:number;last:number;box:DOMRect|null;glare:string};
 const motion=useRef<Motion>({rx:0,ry:0,vx:0,vy:0,tx:0,ty:0,mode:'rest',raf:0,last:0,box:null,glare:''});
 const shadow=useRef<HTMLSpanElement>(null),flipAt=useRef(0);
 const flipEl=()=>card.current?.firstElementChild as HTMLElement|null;
 const face=()=>flippedNow.current?180:0;
 const paint=(m:Motion)=>{const el=card.current,f=flipEl();if(!el||!f)return;
  f.style.transform=`rotateX(${m.rx.toFixed(2)}deg) rotateY(${m.ry.toFixed(2)}deg)`;
  const local=m.ry-180*Math.round(m.ry/180),px=Math.max(-1,Math.min(1,local/18)),py=Math.max(-1,Math.min(1,-m.rx/14)),glare=`${px.toFixed(2)} ${py.toFixed(2)}`;
  if(glare!==m.glare){m.glare=glare;el.style.setProperty('--px',px.toFixed(2));el.style.setProperty('--py',py.toFixed(2));el.style.setProperty('--mx',`${(50+px*50).toFixed(1)}%`);el.style.setProperty('--my',`${(50+py*50).toFixed(1)}%`);}
  const sh=shadow.current,rad=local*Math.PI/180;if(sh){const c=Math.cos(rad);sh.style.transform=`translate(${(Math.sin(rad)*10).toFixed(1)}%,${(m.rx*.6).toFixed(1)}%) scaleX(${(.55+.45*c).toFixed(3)})`;sh.style.opacity=(.35+.3*c).toFixed(2);}};
 /** Drops every inline write: the class transform (data-flipped) takes over exactly where the spring came to rest. */
 const halt=useCallback(()=>{unwatch.current?.();unwatch.current=null;const m=motion.current;cancelAnimationFrame(m.raf);m.raf=0;m.mode='rest';m.box=null;m.vx=m.vy=m.rx=0;m.ry=0;m.glare='';
  const el=card.current,f=flipEl();if(f)f.style.transform='';
  if(el){delete el.dataset.motion;delete el.dataset.active;for(const v of ['--px','--py','--mx','--my'])el.style.removeProperty(v);}
  if(shadow.current){shadow.current.style.transform='';shadow.current.style.opacity='';}},[]);
 const rest=halt;
 const step=(now:number)=>{const m=motion.current;m.raf=0;const dt=Math.min(1/30,Math.max(0,(now-m.last)/1000));m.last=now;
  const spring=(pos:number,vel:number,target:number):[number,number]=>{const v=vel+(260*(target-pos)-2*Math.sqrt(260)*vel)*dt;return [pos+v*dt,v];};// critically damped, ~0.15 s
  [m.rx,m.vx]=spring(m.rx,m.vx,m.tx);[m.ry,m.vy]=spring(m.ry,m.vy,m.ty);
  const still=Math.abs(m.vx)<.3&&Math.abs(m.vy)<.3&&Math.abs(m.rx-m.tx)<.05&&Math.abs(m.ry-m.ty)<.05;
  if(still){m.rx=m.tx;m.ry=m.ty;if(m.mode==='leave'){halt();return;}paint(m);return;}// caught up: sleep
  paint(m);m.raf=requestAnimationFrame(step);};
 const kick=()=>{const m=motion.current;if(m.raf)return;m.last=performance.now();m.raf=requestAnimationFrame(step);};
 useEffect(()=>{halt();return halt;},[name,halt]);
 useEffect(()=>{const drop=()=>{motion.current.box=null;};addEventListener('scroll',drop,{capture:true,passive:true});addEventListener('resize',drop);
  return ()=>{removeEventListener('scroll',drop,{capture:true});removeEventListener('resize',drop);};},[]);
 const onMove=(event:PointerEvent<HTMLDivElement>)=>{const m=motion.current,el=card.current;
  if(!el||event.pointerType!=='mouse'||phaseNow.current!=='idle'||performance.now()-flipAt.current<800)return;// never mid-flip
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!m.box)m.box=el.getBoundingClientRect();// the card box never rotates (the tilt is on .flip), so this stays true under a tilt
  const x=Math.min(1,Math.max(0,(event.clientX-m.box.left)/m.box.width)),y=Math.min(1,Math.max(0,(event.clientY-m.box.top)/m.box.height));
  if(m.mode==='rest'){m.rx=0;m.ry=face();m.vx=m.vy=0;el.dataset.motion='';}
  m.mode='hover';m.tx=(.5-y)*28;m.ty=face()+(x-.5)*36;el.dataset.active='true';watch();kick();};
 // Leaving is judged against the card's flat box, not the tilted face (at the edges a face tips out from under a still pointer,
 // which would bounce the tilt): while hovering, one passive document listener watches for the pointer leaving that box.
 const unwatch=useRef<(()=>void)|null>(null);
 const leave=()=>{const m=motion.current;unwatch.current?.();unwatch.current=null;m.box=null;
  if(m.mode==='hover'){m.mode='leave';m.tx=0;m.ty=face();if(card.current)delete card.current.dataset.active;kick();}};
 const watch=()=>{if(unwatch.current)return;const away=(event:globalThis.PointerEvent)=>{const r=motion.current.box??card.current?.getBoundingClientRect();
   if(event.pointerType==='mouse'&&r&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))leave();};
  document.addEventListener('pointermove',away,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
  unwatch.current=()=>{document.removeEventListener('pointermove',away);document.documentElement.removeEventListener('pointerleave',leave);};};
 useEffect(()=>()=>{unwatch.current?.();unwatch.current=null;},[]);
 // Escape while the film plays stops only the film (preventDefault on keydown means the dialog never gets a cancel).
 const onKeyDown=(event:React.KeyboardEvent)=>{if(event.key==='Escape'&&phase!=='idle'){event.preventDefault();event.stopPropagation();stopFilm();}};
 const photo=photoFor(name),number=ALL_PLAYERS.indexOf(name)+1,legend=era==='allTime',country=lookFor(name).country,[f1,f2,f3]=countryArt(country).flag;
 // The card's trim carries the player's flag, so every card face is its own.
 const flagStyle={'--flag1':f1,'--flag2':f2,'--flag3':f3} as React.CSSProperties;
 return <div ref={stage} className={styles.stage} onKeyDown={onKeyDown}>
  <div ref={card} className={`${styles.card} ${legend?styles.legend:styles.star} ${team==='gold'?styles.gold:styles.blue}`} style={flagStyle} data-flipped={flipped||undefined} data-playing={phase!=='idle'&&phase!=='loading'||undefined} onPointerMove={onMove}>
   <div className={styles.flip}>
    <section className={`${styles.face} ${styles.front}`} aria-hidden={flipped}>
     <div className={styles.topline}><span className={styles.rarity}>{legend?'Legend':'Star'}</span><span className={styles.number}>No. {String(number).padStart(3,'0')}</span></div>
     <div className={styles.window}><PlayerArt name={name} team={team} country={country} layered/>{film&&phase!=='idle'&&<CardFilmPlayer story={film.story} audio={film.audio} running={phase==='playing'} className={`${styles.filmCanvas} ${phase==='fading'?styles.filmFading:''}`} onEnd={filmEnded} onCaption={setCaption}/>}</div>
     <div className={styles.plate}><strong>{name}</strong><span>{role}{country?` · ${country}`:''}</span></div>
     {film&&caption&&phase!=='idle'?<div className={`${styles.bio} ${styles.filmBio}`} aria-live="polite"><span className={styles.eraLine}>{film.story.title}</span><p>{highlight(caption)}</p></div>
     :<div className={styles.bio}><span className={styles.eraLine}>{legend?'All-time great':'Current star'} · {role}</span><p>{blurb}</p></div>}
     <span className={styles.flagStripe} aria-hidden="true"/>
     <span className={styles.foil} aria-hidden="true"/>
     {burst&&<TurnLight key={burst.id} toBack={burst.toBack} leaving={burst.toBack} onDone={()=>setBurst(null)}/>}
    </section>
    <section className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
     <div className={styles.backTop}><h4>Study {name.split(' ')[0]}</h4><span className={styles.number}>No. {String(number).padStart(3,'0')}</span></div>
     <div className={styles.backTabs} role="tablist" aria-label={`About ${name}`} onKeyDown={onTabKey}>
      {BACK_TABS.map(t=><button key={t.id} type="button" role="tab" id={`${tabsId}-${t.id}`} aria-selected={tab===t.id} aria-controls={`${tabsId}-panel`} tabIndex={flipped&&tab===t.id?0:-1} onClick={event=>{event.stopPropagation();pickTab(t.id);}}>{t.label}</button>)}
     </div>
     <div className={styles.backPanel} role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${tab}`} tabIndex={flipped?0:-1}>
      {tab==='strengths'?(strengths.length?<ul className={styles.backList}>{strengths.map(skill=><li key={skill}>{skill}</li>)}</ul>
       :<p className={styles.backEmpty}>Strengths for {name.split(' ')[0]} are still being written. Watch how they move before the ball arrives.</p>)
      :tab==='plays'?<>
       <div className={styles.moment}>
        <span className={styles.eraLine}>Play Moment</span>
        <strong>{moment?.name===name&&moment.value?moment.value.title:`${name.split(' ')[0]}’s Play Moment`}</strong>
        {moment?.name===name&&moment.value&&(moment.value.event||moment.value.year)&&<small>{[moment.value.event,moment.value.year].filter(Boolean).join(' · ')}</small>}
        {moment?.name===name&&moment.value?.lesson&&<p>{moment.value.lesson}</p>}
       </div>
       <h5 className={styles.clipsTitle}>Top plays &amp; highlights</h5>
       {flipped&&<CardHighlights player={name}/>/* fetched only while this tab shows on the back */}
      </>
      :history?.name!==name?<p className={styles.backEmpty}>Loading club history…</p>
      :history.value?<ul className={styles.clubs}>
        {history.value.clubs.map((stint,i)=><li key={`${stint.club}-${i}`}><b>{stint.club}</b>{stint.years&&<span> · {stint.years}</span>}{stint.loan&&<em>Loan</em>}</li>)}
        {history.value.national&&<li className={styles.national}><b>{history.value.national.club}</b>{history.value.national.years&&<span> · {history.value.national.years}</span>}<em>National team</em></li>}
       </ul>
      :<p className={styles.backEmpty}>{name.split(' ')[0]}’s club history isn’t on the card yet. Look for the club badge in their highlights, and check back soon.</p>}
     </div>
     {(sources.length>0||!!photo)&&<div className={styles.refs}><span className={styles.refsTitle}>Player references &amp; sources</span>{sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" tabIndex={flipped?0:-1} onClick={event=>event.stopPropagation()}>{source.title} ↗</a>)}{photo&&<a className={styles.credit} href={photo.file} target="_blank" rel="noopener noreferrer" tabIndex={flipped?0:-1} onClick={event=>event.stopPropagation()}>Portrait from a photo by {photo.artist} · {photo.license} · {(photo as {sourceName?:string}).sourceName??'Wikimedia Commons'} ↗</a>}</div>}
     <span className={styles.flagStripe} aria-hidden="true"/>
     {burst&&<TurnLight key={burst.id} toBack={burst.toBack} leaving={!burst.toBack} onDone={()=>setBurst(null)}/>}
    </section>
    {/* Card thickness: three rim slices and four side strips, static, turned with the card. */}
    <span className={styles.edge} aria-hidden="true"><b/><b/><b/><i/><i/><i/><i/></span>
    {burst&&<span key={burst.id} className={styles.catchLight} aria-hidden="true"><i/><i/></span>}
   </div>
   <span ref={shadow} className={styles.groundShadow} aria-hidden="true"/>
  </div>
  <div ref={controls} className={styles.controls} data-single={!filmReady||undefined}>
   <button type="button" className={styles.flipButton} onClick={toggleFlip} aria-pressed={flipped}>Flip</button>
   {filmReady&&<button type="button" className={styles.playButton} onClick={togglePlay} aria-label={phase==='loading'?`Loading ${name}'s iconic play`:phase==='playing'||phase==='holding'?`Stop ${name}'s iconic play`:`Play ${name}'s iconic play`} aria-busy={phase==='loading'||undefined} data-state={phase==='loading'?'loading':phase==='playing'||phase==='holding'?'stop':'play'}><span className={styles.playIcon} aria-hidden="true"/><b className={styles.playLabel}>{phase==='loading'?'Loading…':phase==='playing'||phase==='holding'?'Stop':compact?'Play':'Play Moment'}</b></button>}
  </div>
 </div>;
}
