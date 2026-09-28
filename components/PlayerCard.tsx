'use client';
import {useCallback,useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import type React from 'react';
import PlayerArt,{lookFor,photoFor,SCENERY_WAKE_EVENT} from './PlayerArt';
import {countryArt} from '@/lib/town/countryArt';
import {POSITION_PLAYERS} from '@/lib/town/playerPositions';
import CardFilmPlayer,{unlockedNarration,type CardCaption} from './CardFilmPlayer';
import {hasPlayFilm,loadPlayFilm} from '@/lib/plays/riso/registry';
import type {RisoStory} from '@/lib/paths/riso/story';
import {ALL_PLAYERS,CARD_STORAGE_KEY,cardDisplayName,isCoachCard} from '@/lib/town/cardCollection';
import dynamic from 'next/dynamic';
import styles from './PlayerCard.module.css';
import artStyles from './PlayerArt.module.css';
const CardHighlights=dynamic(()=>import('./CardHighlights'),{ssr:false});

const STORAGE_KEY=CARD_STORAGE_KEY;
/** The narration sentence with the current cue words marked. */
/** Always the same three nodes (text, mark, text; a zero-width space keeps an empty part's text node), so a new cue or sentence only
 *  rewrites text. Inserting or removing nodes under <body> trips the page's body:has() rules into a whole-document style recalc, which
 *  used to land on the playing film at every caption change (card films, Sep 26 2026). An unused mark is hidden (data-empty). */
function highlight({sentence,words}:CardCaption){const at=words?sentence.toLowerCase().indexOf(words.trim().toLowerCase()):-1,Z='\u200b';
 if(at<0)return <>{sentence||Z}<mark data-empty="">{Z}</mark>{Z}</>;
 const end=at+words.trim().length;return <>{sentence.slice(0,at)||Z}<mark data-empty={at===end?'':undefined}>{sentence.slice(at,end)||Z}</mark>{sentence.slice(end)||Z}</>;}

/** Back-of-card tabs. The chosen tab is remembered for the session (per-viewer convenience; storage may be unavailable). */
type BackTab='strengths'|'plays'|'history';
const BACK_TABS:{id:BackTab;label:string}[]=[{id:'strengths',label:'Strengths'},{id:'plays',label:'Top Plays'},{id:'history',label:'History'}];
/** Coach cards (Sep 28 2026) keep the same three tabs, about coaching: their style, the one big idea the card teaches (with
 *  career highlights) and the teams they coached (playerCareers.json, role "coach"). */
const COACH_TAB_LABEL:Record<BackTab,string>={strengths:'Style',plays:'Big idea',history:'Teams'};
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
/** A coach card's teaching idea (lib/town/coachIdeas.json): loaded only when a coach card is turned over. */
type CoachIdea={idea:string;lesson:string;highlights:string[];sources:{title:string;url:string}[]};
let ideasCache:Promise<Record<string,CoachIdea>>|null=null;
const loadIdeas=()=>ideasCache??=import('@/lib/town/coachIdeas.json').then(m=>(m.default??m) as unknown as Record<string,CoachIdea>).catch(error=>{ideasCache=null;throw error;});
/** Flip weight (Web Animations on the individual scale/translate properties, so they compose with the card's CSS transform and
 *  hover tilt): the card lifts and grows a little through the turn, then settles with a small overshoot; its ground shadow
 *  widens and softens while it is up. Offsets follow the flip curve (edge-on ≈ 13 %, overshoot peak ≈ 55 %). */
const LIFT:Keyframe[]=[{scale:'1',translate:'0 0',offset:0},{scale:'1.04',translate:'0 -4px',offset:.16,easing:'ease-in-out'},{scale:'1.025',translate:'0 -3px',offset:.4,easing:'ease-in-out'},
 {scale:'.994',translate:'0 1px',offset:.72,easing:'ease-in-out'},{scale:'1',translate:'0 0',offset:1}];
const LIFT_SHADOW:Keyframe[]=[{opacity:.5,scale:'1 1',offset:0},{opacity:.26,scale:'1.2 1.25',offset:.16,easing:'ease-in-out'},{opacity:.34,scale:'1.1 1.1',offset:.4,easing:'ease-in-out'},
 {opacity:.55,scale:'.97 .95',offset:.72,easing:'ease-in-out'},{opacity:.5,scale:'1 1',offset:1}];
/** Layout effect in the browser (no server warning). */
const useIsoLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
/** Phones and tablets (user, Sep 24 2026: "for mobile spin the card slower when flipping"): the turn takes 0.95 s instead of 0.7 s on
 *  an ease that lingers through edge-on (≈0.5°/ms there instead of ≈0.85°/ms), so a child can see it turn. The CSS mirrors these
 *  numbers (--turn, --turn-ease and the turn-light timings on .card). Edge-on is the moment the turn light and the sparks key off. */
const PHONE_QUERY='(hover: none), (pointer: coarse)';
type Turn={ms:number;ease:[number,number,number,number];lift:Keyframe[];shadow:Keyframe[]};
const DESK_TURN:Turn={ms:700,ease:[.3,1.3,.4,1],lift:LIFT,shadow:LIFT_SHADOW};
const PHONE_TURN:Turn={ms:950,ease:[.4,.15,.25,1.1],
 lift:[{scale:'1',translate:'0 0',offset:0},{scale:'1.04',translate:'0 -4px',offset:.37,easing:'ease-in-out'},{scale:'1.025',translate:'0 -3px',offset:.62,easing:'ease-in-out'},
  {scale:'.996',translate:'0 1px',offset:.88,easing:'ease-in-out'},{scale:'1',translate:'0 0',offset:1}],
 shadow:[{opacity:.5,scale:'1 1',offset:0},{opacity:.26,scale:'1.2 1.25',offset:.37,easing:'ease-in-out'},{opacity:.34,scale:'1.1 1.1',offset:.62,easing:'ease-in-out'},
  {opacity:.55,scale:'.97 .95',offset:.88,easing:'ease-in-out'},{opacity:.5,scale:'1 1',offset:1}]};
const turnNow=()=>typeof window!=='undefined'&&window.matchMedia(PHONE_QUERY).matches?PHONE_TURN:DESK_TURN;
/** A CSS cubic-bezier as progress-at-time, sampled into a small table (built once per flip). */
function easeTable([x1,y1,x2,y2]:Turn['ease'],n=120){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
 const X=(s:number)=>((ax*s+bx)*s+cx)*s,Y=(s:number)=>((ay*s+by)*s+cy)*s,out:number[]=[];
 for(let i=0;i<=n;i++){const t=i/n;let lo=0,hi=1,s=t;for(let k=0;k<24;k++){s=(lo+hi)/2;if(X(s)<t)lo=s;else hi=s;}out.push(Y(s));}return out;}
/** Motion sparks (user, Sep 24 2026: "add the animation motion particles to show it's turning"). Tiny bright specks are shed by
 *  the two vertical edges only while they move fast (the turn from ≈85° to ≈140°, none at the start or end), each kicked ahead of
 *  its edge along the direction of travel, faster than the edge, as a short streak that slows and fades in 300–500 ms. Past
 *  edge-on "ahead" is outward, so the specks fly clear of the opening card against the backdrop instead of vanishing on the cream
 *  face: the near edge (bigger, brighter, most specks) sprays with the sweep, the far edge a few dimmer ones the other way. The emission times and
 *  positions follow the real flip curve and a 1400 px perspective. One pre-built set of SPARKS nodes per flip, Web Animations on
 *  transform and opacity only; the layer unmounts when the last speck ends. Never with reduced motion (no burst). */
const SPARKS=22,NEAR=16,PERSPECTIVE=1400;// the layer sits at translateZ(320px), scaled back (see .sparks in the CSS)
function TurnSparks({toBack,turn,onDone}:{toBack:boolean;turn:Turn;onDone:()=>void}){
 const layer=useRef<HTMLSpanElement>(null),done=useRef(onDone);done.current=onDone;
 useIsoLayoutEffect(()=>{const el=layer.current,cardEl=el?.parentElement;if(!el||!cardEl)return;
  const w=cardEl.offsetWidth,h=cardEl.offsetHeight,half=w/2+11,table=easeTable(turn.ease),dir=toBack?1:-1,slow=turn.ms/700;
  const timeAt=(g:number)=>{const i=table.findIndex(v=>v>=g);if(i<=0)return 0;const a=table[i-1],b=table[i];return (i-1+(g-a)/(b-a||1))/(table.length-1)*turn.ms;};
  const anims=Array.from(el.children as HTMLCollectionOf<HTMLElement>).map((speck,i)=>{const near=i<NEAR,r=Math.random;
   const g=.47+.32*(r()+r())/2,phi=g*Math.PI,sin=Math.sin(phi),cos=Math.cos(phi);// progress through the fast middle of the turn
   const x0=(near?-dir:dir)*half*cos,z0=(near?1:-1)*half*sin,k=PERSPECTIVE/(PERSPECTIVE-z0);// the edge where it is now
   const y=22+r()*(h-44),sx=w/2+x0*k,sy=h/2+(y-h/2)*k,go=(near?dir:-dir)*(near?1:.7);
   const reach=(near?135:70)*(w/320)*(.6+.4*sin)*(.7+r()*.6)*(slow>1?1:1.2),dy=(r()-.5)*(near?22:12),tilt=Math.atan2(dy,go*reach)*180/Math.PI;
   const size=Math.min(2.2,((near?1.5:1)+r()*.6)*Math.max(1,w/400)),life=(300+r()*200)*(slow>1?1.05:.85),glow=near?1:.55;
   speck.style.width=speck.style.height=`${size.toFixed(1)}px`;
   return speck.animate([
    {transform:`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) rotate(${tilt.toFixed(0)}deg) scaleX(${near?6:4})`,opacity:0},
    {transform:`translate(${(sx+go*reach*.12).toFixed(1)}px,${(sy+dy*.12).toFixed(1)}px) rotate(${tilt.toFixed(0)}deg) scaleX(${near?5:3})`,opacity:glow,offset:.1},
    {transform:`translate(${(sx+go*reach).toFixed(1)}px,${(sy+dy).toFixed(1)}px) rotate(${tilt.toFixed(0)}deg) scaleX(1)`,opacity:0}],
    {delay:timeAt(g),duration:life,easing:'cubic-bezier(.12,.65,.3,1)',fill:'backwards'});});
  Promise.all(anims.map(a=>a.finished)).then(()=>done.current(),()=>{});
  return ()=>{for(const a of anims)a.cancel();};},[]);
 return <span ref={layer} className={styles.sparks} aria-hidden="true">{Array.from({length:SPARKS},(_,i)=><i key={i}/>)}</span>;
}

export type PlayerCardProps={name:string;role:string;era:'current'|'allTime';blurb:string;team:'gold'|'blue';format:string;firstName:string;strengths:string[];sources?:{title:string;url:string}[];compact?:boolean;onFlipChange?:(flipped:boolean)=>void;
 /** Host-driven turn light, for a host that turns the card itself (the Pick a card unpack): each new non-zero value plays the
  *  to-front turn light once (the glare sweep on the arriving front, the edge catch light and the sparks), without flipping and
  *  without the lift (the host moves the card). Never with reduced motion. */
 glint?:number};

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
export default function PlayerCard({name,role,era,blurb,team,strengths,sources=[],compact=false,onFlipChange,glint=0}:PlayerCardProps){
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
 useEffect(()=>{if(!flipped||tab!=='plays'||moment?.name===name||isCoachCard(name))return;let live=true;
  loadMoments().then(all=>{if(live)setMoment({name,value:all[name]??null});}).catch(()=>{if(live)setMoment({name,value:null});});
  return ()=>{live=false;};},[flipped,tab,name,moment?.name]);
 const coach=isCoachCard(name),shown=cardDisplayName(name),first=shown.split(' ')[0];
 const [idea,setIdea]=useState<{name:string;value:CoachIdea|null}|null>(null);
 useEffect(()=>{if(!coach||!flipped||idea?.name===name)return;let live=true;
  loadIdeas().then(all=>{if(live)setIdea({name,value:all[name]??null});}).catch(()=>{if(live)setIdea({name,value:null});});
  return ()=>{live=false;};},[coach,flipped,name,idea?.name]);
 const coachIdea=coach&&idea?.name===name?idea.value:null,refs=[...sources,...(coachIdea?.sources??[])];
 // Turn light (one short burst per flip, not on a new player, never with reduced motion), started in the same frame as the turn
 // (layout effect): a glare band sweeps the face turning away and then the face turning in, that face shades as it turns from the
 // viewer, the thickness edge catches the light at edge-on, and the card lifts (LIFT). The burst layers unmount when their last
 // animation ends and the Web Animations finish on their own: nothing runs at rest.
 // `toBack` is the face being turned to (which face's light is leaving); `sweep` is the way the light and sparks travel. Every Flip
 // spins the same way (see Spin below), so a Flip's light always sweeps the to-back way; only a host's glint turn sweeps the other way.
 const [burst,setBurst]=useState<{id:number;toBack:boolean;sweep:boolean}|null>(null),[sparks,setSparks]=useState<{id:number;sweep:boolean;turn:Turn}|null>(null),lastFlip=useRef({name,flipped}),burstSeq=useRef(0),flippedNow=useRef(flipped);
 flippedNow.current=flipped;
 // ── Spin (user, Sep 25 2026: the flip turns the same way every time, like a coin turning over): the flip layer's angle (--spin on
 // .card, read by .flip in the CSS) grows by 180° per Flip instead of toggling 0° ⇄ 180°. Once a turn has settled (before the tilt
 // may start, which waits turnMs + 100 ms) the angle is folded back to 0° or 180° with the transition off, so it never grows and
 // never visibly jumps (360° looks the same as 0°), and the tilt keeps working from 0° / 180°. A new player or reduced motion sets
 // the face angle directly.
 const spinDeg=useRef(0),spinTimer=useRef<ReturnType<typeof setTimeout>>();
 const setSpin=(deg:number)=>{spinDeg.current=deg;card.current?.style.setProperty('--spin',`${deg}deg`);};
 useEffect(()=>()=>clearTimeout(spinTimer.current),[]);
 useIsoLayoutEffect(()=>{const last=lastFlip.current;lastFlip.current={name,flipped};
  if(last.name!==name||window.matchMedia('(prefers-reduced-motion: reduce)').matches){clearTimeout(spinTimer.current);setSpin(flipped?180:0);}
  if(last.name!==name||last.flipped===flipped)return;
  window.dispatchEvent(new Event(SCENERY_WAKE_EVENT));// the card's resting scenery wakes for the turn
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setBurst(null);return;}
  const turn=turnNow(),id=++burstSeq.current;setBurst({id,toBack:flipped,sweep:true});setSparks({id,sweep:true,turn});
  setSpin(spinDeg.current+180);clearTimeout(spinTimer.current);
  spinTimer.current=setTimeout(()=>{const f=card.current?.firstElementChild as HTMLElement|null;if(!f||spinDeg.current<360)return;
   f.style.transition='none';setSpin(spinDeg.current%360);void f.offsetWidth;f.style.transition='';},turn.ms+40);
  card.current?.animate(turn.lift,{duration:turn.ms});shadow.current?.animate(turn.shadow,{duration:turn.ms});
  showRim(turn.ms+80);},[name,flipped]);
 // A host's own turn (glint): the same burst toward the front, with no flip and no lift (the host's animation owns the card's
 // translate/scale). The rim rings come from the host's spin (below).
 useIsoLayoutEffect(()=>{if(!glint||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const turn=turnNow(),id=++burstSeq.current;setBurst({id,toBack:false,sweep:false});setSparks({id,sweep:false,turn});},[glint]);
 // The rim rings show only while the card turns (see .rim in the CSS). One timer per turn; a host's own spin of the flip layer on
 // mount (the Pick a card reveal) is caught once, from its Web Animations.
 const rimTimer=useRef<ReturnType<typeof setTimeout>>();
 const showRim=(ms:number)=>{const el=card.current;if(!el)return;el.dataset.turning='';clearTimeout(rimTimer.current);rimTimer.current=setTimeout(()=>{delete el.dataset.turning;},ms);};
 useEffect(()=>{const spins=(card.current?.firstElementChild as HTMLElement|null)?.getAnimations()??[];
  const longest=Math.max(0,...spins.map(a=>{const t=a.effect?.getComputedTiming();return Number(t?.endTime??0)-Number(a.currentTime??0);}));
  if(longest>0)showRim(longest+80);return ()=>clearTimeout(rimTimer.current);},[]);
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
 const toggleFlip=()=>{stopFilm();halt();flipAt.current=performance.now();turnMs.current=turnNow().ms;setFlipped(value=>!value);};
 // ── Hover tilt (a real mouse only: pointerType 'mouse' on a hover-capable fine pointer; touch and pen tilt by pressing and dragging,
 // see Touch tilt below; never with reduced motion or while a film is on). One spring state (rx, ry and velocities) chases the pointer's target (±14° X, ±18° Y) and is written to
 // the .flip transform once per frame by a rAF loop that runs only while the spring moves: it sleeps when it catches up (even with the
 // pointer resting on the card) and, after the pointer leaves, springs back flat and hands the card back to its CSS (data-flipped).
 // While JS writes, data-motion turns the CSS transitions off so the two never fight. Glare, art parallax and the ground shadow
 // follow the angle; the edge thickness shows at the extremes. Flip is always the CSS transition between the two faces.
 type Motion={rx:number;ry:number;vx:number;vy:number;tx:number;ty:number;mode:'rest'|'hover'|'leave';raf:number;last:number;box:DOMRect|null;glare:string};
 const motion=useRef<Motion>({rx:0,ry:0,vx:0,vy:0,tx:0,ty:0,mode:'rest',raf:0,last:0,box:null,glare:''});
 const shadow=useRef<HTMLSpanElement>(null),flipAt=useRef(0),turnMs=useRef(700);// no tilt until the turn has settled
 const flipEl=()=>card.current?.firstElementChild as HTMLElement|null;
 // The parallax planes (PlayerArt: back −16/−12 px, mid −6/−4 px, front 12/8 px at full tilt, as in its CSS) get their transform
 // written directly, and only the foils get --px/--py (for their glare layers): nothing else on the card restyles or repaints.
 const tiltTargets=()=>{const root=card.current;const planes:[HTMLElement,number,number][]=[];
  root?.querySelectorAll<HTMLElement>(`.${artStyles.layers}>.${artStyles.layer}`).forEach(p=>{const c=p.classList;
   if(c.contains(artStyles.back))planes.push([p,-16,-12]);else if(c.contains(artStyles.mid))planes.push([p,-6,-4]);else if(c.contains(artStyles.front))planes.push([p,12,8]);});
  return {planes,foils:Array.from(root?.querySelectorAll<HTMLElement>(`.${styles.foil}`)??[])};};
 const face=()=>flippedNow.current?180:0;
 const paint=(m:Motion)=>{const el=card.current,f=flipEl();if(!el||!f)return;
  f.style.transform=`rotateX(${m.rx.toFixed(2)}deg) rotateY(${m.ry.toFixed(2)}deg)`;
  const local=m.ry-180*Math.round(m.ry/180),px=Math.max(-1,Math.min(1,local/18)),py=Math.max(-1,Math.min(1,-m.rx/14)),glare=`${px.toFixed(3)} ${py.toFixed(3)}`;
  // Tilt smoothness (iPhone, Sep 25 2026): --px/--py go only on the few elements that read them (the parallax planes' box and the
  // foils), not on .card, so a frame restyles those small subtrees instead of the whole card; both only move layers by transform.
  if(glare!==m.glare){m.glare=glare;const {planes,foils}=tiltTargets();
   for(const [p,kx,ky] of planes)p.style.transform=`translate3d(${(px*kx).toFixed(2)}px,${(py*ky).toFixed(2)}px,0)`;
   for(const t of foils){t.style.setProperty('--px',px.toFixed(3));t.style.setProperty('--py',py.toFixed(3));}}
  const sh=shadow.current,rad=local*Math.PI/180;if(sh){const c=Math.cos(rad);sh.style.transform=`translate(${(Math.sin(rad)*10).toFixed(1)}%,${(m.rx*.6).toFixed(1)}%) scaleX(${(.55+.45*c).toFixed(3)})`;sh.style.opacity=(.35+.3*c).toFixed(2);}};
 /** Drops every inline write: the class transform (data-flipped) takes over exactly where the spring came to rest. */
 const halt=useCallback(()=>{unwatch.current?.();unwatch.current=null;untouch.current?.();untouch.current=null;const m=motion.current;cancelAnimationFrame(m.raf);m.raf=0;m.mode='rest';m.box=null;m.vx=m.vy=m.rx=0;m.ry=0;m.glare='';
  const el=card.current,f=flipEl();if(f)f.style.transform='';
  if(el){delete el.dataset.motion;delete el.dataset.active;const {planes,foils}=tiltTargets();for(const [p] of planes)p.style.transform='';for(const t of foils){t.style.removeProperty('--px');t.style.removeProperty('--py');}}
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
  if(!el||event.pointerType!=='mouse'||phaseNow.current!=='idle'||performance.now()-flipAt.current<turnMs.current+100)return;// never mid-flip
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
 useEffect(()=>()=>{unwatch.current?.();unwatch.current=null;untouch.current?.();untouch.current=null;},[]);
 // ── Touch tilt (user, Sep 24 2026: "add that gesture back"; tilt and parallax only, no spin, flip or momentum). A finger pressed on
 // the card that moves past TOUCH_SLOP tilts the card toward it with the hover mapping (±14° X, ±18° Y), the same spring, planes and
 // glare; pointermove only sets the target, so the one sleeping rAF spring batches the writes. The card box is cached at pointerdown.
 // Release or cancel springs back flat from rest velocity and hands the card back to its CSS. Below the slop nothing is touched, so a
 // tap reaches Flip, Play, the back tabs, highlights and links exactly as before; a click that ends a tilt is swallowed (a tilt is not
 // a press). Listeners live only for one gesture. Never with reduced motion, during a film or mid-flip. A greyed card
 // (pointer-events: none) never receives the pointerdown. touch-action (see `scrolls` below) keeps a scrollable host scrolling.
 const untouch=useRef<(()=>void)|null>(null),tiltEnd=useRef(0);
 const TOUCH_SLOP=10;
 const onDown=(event:PointerEvent<HTMLDivElement>)=>{const el=card.current;
  if(!el||event.pointerType==='mouse'||!event.isPrimary||untouch.current||phaseNow.current!=='idle'||performance.now()-flipAt.current<turnMs.current+100)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const id=event.pointerId,x0=event.clientX,y0=event.clientY,box=el.getBoundingClientRect();let tilting=false;
  const move=(e:globalThis.PointerEvent)=>{if(e.pointerId!==id)return;const m=motion.current;
   if(!tilting){if(Math.hypot(e.clientX-x0,e.clientY-y0)<TOUCH_SLOP)return;if(phaseNow.current!=='idle'){end();return;}
    tilting=true;if(m.mode==='rest'||m.mode==='leave'){if(m.mode==='rest'){m.rx=0;m.ry=face();m.vx=m.vy=0;}el.dataset.motion='';}}
   const x=Math.min(1,Math.max(0,(e.clientX-box.left)/box.width)),y=Math.min(1,Math.max(0,(e.clientY-box.top)/box.height));
   m.mode='hover';m.tx=(.5-y)*28;m.ty=face()+(x-.5)*36;el.dataset.active='true';kick();};
  const end=(e?:globalThis.PointerEvent)=>{if(e&&e.pointerId!==id)return;untouch.current?.();untouch.current=null;if(!tilting)return;
   const m=motion.current;tiltEnd.current=performance.now();
   if(m.mode==='hover'){m.mode='leave';m.tx=0;m.ty=face();m.vx=m.vy=0;delete el.dataset.active;kick();}};
  document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerup',end,{passive:true});document.addEventListener('pointercancel',end,{passive:true});
  untouch.current=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',end);document.removeEventListener('pointercancel',end);};};
 const onClickCapture=(event:React.MouseEvent)=>{if(performance.now()-tiltEnd.current<400){tiltEnd.current=0;event.preventDefault();event.stopPropagation();}};
 // Where the card's scroll area can scroll (the position guide), vertical drags keep scrolling it (touch-action: pan-y) and sideways
 // drags tilt; elsewhere (binder viewer, card reveal) the card takes every drag (pinch-zoom only). Measured on resize, no loop.
 const [scrolls,setScrolls]=useState(true);
 useEffect(()=>{const host=stage.current;if(!host||typeof ResizeObserver==='undefined')return;
  let scroller:HTMLElement|null=host.parentElement;while(scroller&&!/(auto|scroll)/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;
  const target=scroller??document.scrollingElement as HTMLElement|null;if(!target)return;
  const check=()=>setScrolls(target.scrollHeight>target.clientHeight+1);check();
  const observer=new ResizeObserver(check);observer.observe(target);for(const child of Array.from(target.children))observer.observe(child,{box:'border-box'});
  return ()=>observer.disconnect();},[]);
 // Escape while the film plays stops only the film (preventDefault on keydown means the dialog never gets a cancel).
 const onKeyDown=(event:React.KeyboardEvent)=>{if(event.key==='Escape'&&phase!=='idle'){event.preventDefault();event.stopPropagation();stopFilm();}};
 const photo=photoFor(name),number=ALL_PLAYERS.indexOf(name)+1,legend=era==='allTime',country=lookFor(name).country,[f1,f2,f3]=countryArt(country).flag;
 // The portrait is memoised (card films, Sep 26 2026): a film's caption changes re-render the card several times a sentence, and a
 // re-rendered PlayerArt remounts part of its SVG print (FigureValues' inline parts), so each caption used to trip the page's :has()
 // rules into a whole-document style recalc under the playing film (35–135 ms per caption with a 4× CPU throttle).
 const art=useMemo(()=><PlayerArt name={name} team={team} country={country} layered/>,[name,team,country]);
 const numberLabel=`No. ${String(number).padStart(3,'0')}`;
 // The card's trim carries the player's flag, so every card face is its own.
 const flagStyle={'--flag1':f1,'--flag2':f2,'--flag3':f3} as React.CSSProperties;
 return <div ref={stage} className={styles.stage} onKeyDown={onKeyDown}>
  <div ref={card} className={`${styles.card} ${legend?styles.legend:styles.star} ${team==='gold'?styles.gold:styles.blue}`} style={flagStyle} data-flipped={flipped||undefined} data-playing={phase!=='idle'&&phase!=='loading'||undefined} data-touch={scrolls?'pan':'tilt'} onPointerMove={onMove} onPointerDown={onDown} onClickCapture={onClickCapture}>
   <div className={styles.flip}>
    {/* Card thickness: three rim slices (<b>) and four side strips (<i>), static, turned with the card. They are direct children of
        .flip, in its one 3D context, and first in paint order. They used to sit in a nested preserve-3d wrapper (.edge): after the
        card resized (the reveal's sheet, a window resize) Chrome's compositor could then draw the flag-coloured rim slices over
        the showing face whatever their depth (the "solid blue back" bug; a flattened or removed wrapper cured it). */}
    <b className={styles.rim} aria-hidden="true"/><b className={styles.rim} aria-hidden="true"/><b className={styles.rim} aria-hidden="true"/>
    <i className={styles.side} aria-hidden="true"/><i className={styles.side} aria-hidden="true"/><i className={styles.side} aria-hidden="true"/><i className={styles.side} aria-hidden="true"/>
    <section className={`${styles.face} ${styles.front}`} aria-hidden={flipped}>
     <div className={styles.topline}><span className={styles.rarity}>{legend?'Legend':coach?'Coach':'Star'}</span><span className={styles.number}>{numberLabel}</span></div>
     <div className={styles.window}>{art}{film&&phase!=='idle'&&<CardFilmPlayer story={film.story} audio={film.audio} running={phase==='playing'} className={`${styles.filmCanvas} ${phase==='fading'?styles.filmFading:''}`} onEnd={filmEnded} onCaption={setCaption}/>}</div>
     <div className={styles.plate}><strong>{shown}</strong><span>{role}{country?` · ${country}`:''}</span></div>
     {film&&caption&&phase!=='idle'?<div className={`${styles.bio} ${styles.filmBio}`} aria-live="polite"><span className={styles.eraLine}>{film.story.title}</span><p>{highlight(caption)}</p></div>
     :<div className={styles.bio}><span className={styles.eraLine}>{coach?(legend?'All-time great coach':'Coaching now'):legend?'All-time great':'Current star'} · {role}</span><p>{blurb}</p></div>}
     <span className={styles.flagStripe} aria-hidden="true"/>
     <span className={styles.foil} aria-hidden="true"/>
     {burst&&<TurnLight key={burst.id} toBack={burst.sweep} leaving={burst.toBack} onDone={()=>setBurst(null)}/>}
    </section>
    <section className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
     <div className={styles.backTop}><h4>Study {first}</h4><span className={styles.number}>{numberLabel}</span></div>
     <div className={styles.backTabs} role="tablist" aria-label={`About ${shown}`} onKeyDown={onTabKey}>
      {BACK_TABS.map(t=><button key={t.id} type="button" role="tab" id={`${tabsId}-${t.id}`} aria-selected={tab===t.id} aria-controls={`${tabsId}-panel`} tabIndex={flipped&&tab===t.id?0:-1} onClick={event=>{event.stopPropagation();pickTab(t.id);}}>{coach?COACH_TAB_LABEL[t.id]:t.label}</button>)}
     </div>
     <div className={styles.backPanel} role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${tab}`} tabIndex={flipped?0:-1}>
      {tab==='strengths'?(strengths.length?<ul className={styles.backList}>{strengths.map(skill=><li key={skill}>{skill}</li>)}</ul>
       :<p className={styles.backEmpty}>Strengths for {first} are still being written. Watch how they move before the ball arrives.</p>)
      :tab==='plays'&&coach?(idea?.name!==name?<p className={styles.backEmpty}>Loading {first}’s big idea…</p>
       :coachIdea?<>
        <div className={styles.moment}>
         <span className={styles.eraLine}>Coaching idea</span>
         <strong>{coachIdea.idea}</strong>
         <p>{coachIdea.lesson}</p>
        </div>
        <h5 className={styles.clipsTitle}>Career highlights</h5>
        <ul className={styles.backList}>{coachIdea.highlights.map(item=><li key={item}>{item}</li>)}</ul>
       </>:<p className={styles.backEmpty}>{first}’s big idea isn’t on the card yet. Watch how their team moves without the ball.</p>)
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
      :history?.name!==name?<p className={styles.backEmpty}>{coach?'Loading teams coached…':'Loading club history…'}</p>
      :history.value?<ul className={styles.clubs}>
        {history.value.clubs.map((stint,i)=><li key={`${stint.club}-${i}`}><b>{stint.club}</b>{stint.years&&<span> · {stint.years}</span>}{stint.loan&&<em>Loan</em>}</li>)}
        {history.value.national&&<li className={styles.national}><b>{history.value.national.club}</b>{history.value.national.years&&<span> · {history.value.national.years}</span>}<em>National team</em></li>}
       </ul>
      :coach?<p className={styles.backEmpty}>{first}’s coaching career isn’t on the card yet.</p>
      :<p className={styles.backEmpty}>{first}’s club history isn’t on the card yet. Look for the club badge in their highlights, and check back soon.</p>}
     </div>
     {(refs.length>0||!!photo)&&<div className={styles.refs}><span className={styles.refsTitle}>{coach?'Coach':'Player'} references &amp; sources</span>{refs.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" tabIndex={flipped?0:-1} onClick={event=>event.stopPropagation()}>{source.title} ↗</a>)}{photo&&<a className={styles.credit} href={photo.file} target="_blank" rel="noopener noreferrer" tabIndex={flipped?0:-1} onClick={event=>event.stopPropagation()}>Portrait from a photo by {photo.artist} · {photo.license} · {(photo as {sourceName?:string}).sourceName??'Wikimedia Commons'} ↗</a>}</div>}
     <span className={styles.flagStripe} aria-hidden="true"/>
     {burst&&<TurnLight key={burst.id} toBack={burst.sweep} leaving={!burst.toBack} onDone={()=>setBurst(null)}/>}
    </section>
    {burst&&<span key={burst.id} className={styles.catchLight} aria-hidden="true"><i/><i/></span>}
   </div>
   <span ref={shadow} className={styles.groundShadow} aria-hidden="true"/>
   {sparks&&<TurnSparks key={sparks.id} toBack={sparks.sweep} turn={sparks.turn} onDone={()=>setSparks(s=>s?.id===sparks.id?null:s)}/>}
  </div>
  <div ref={controls} className={styles.controls} data-single={!filmReady||undefined}>
   <button type="button" className={styles.flipButton} onClick={toggleFlip} aria-pressed={flipped}>Flip</button>
   {filmReady&&<button type="button" className={styles.playButton} onClick={togglePlay} aria-label={phase==='loading'?`Loading ${name}'s iconic play`:phase==='playing'||phase==='holding'?`Stop ${name}'s iconic play`:`Play ${name}'s iconic play`} aria-busy={phase==='loading'||undefined} data-state={phase==='loading'?'loading':phase==='playing'||phase==='holding'?'stop':'play'}><span className={styles.playIcon} aria-hidden="true"/><b className={styles.playLabel}>{phase==='loading'?'Loading…':phase==='playing'||phase==='holding'?'Stop':compact?'Play':'Play Moment'}</b></button>}
  </div>
 </div>;
}
