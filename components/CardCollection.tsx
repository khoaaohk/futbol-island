'use client';
import {memo,startTransition,useEffect,useId,useLayoutEffect,useMemo,useRef,useState} from 'react';
import type React from 'react';
import {createPortal} from 'react-dom';
import MiniCard from './MiniCard';
import {preloadPlayerPhotos} from './PlayerArt';
import {hasPlayFilm} from '@/lib/plays/riso/registry';
import {NavigationButton} from './DoneButton';
import navStyles from './DoneButton.module.css';
import BinderLeaf,{type LeafHandle} from './BinderLeaf';
import {matchesCard} from './cardSearch';
import {buildBinder,pageOf,sectionOf,sectionsOf,viewStart,type BinderPage} from './binder';
import profiles from '@/lib/town/playerProfiles.json';
import {CARD_ENTRIES,ROLE_ORDER,readCollection} from '@/lib/town/cardCollection';
import {CARD_ADDED,CARD_SPOT,cardRewardsActive,takeCardSpot} from '@/lib/town/cardRewardStore';
import {cardTier} from '@/lib/town/cardTiers';
import {TIER_TEACHING_LINE} from '@/lib/town/cardRewards';
import {CardOfferPill} from './CardOfferBadges';
import styles from './CardCollection.module.css';
/** The full card loads on demand (preloaded when the binder mounts) and is then rendered directly, not through a lazy
 * wrapper: a lazy component suspends on its first render even when its chunk is already loaded, which left the first lift
 * with an empty viewer for several frames. */
type PlayerCardView=typeof import('./PlayerCard').default;
let playerCardView:PlayerCardView|null=null;
const loadPlayerCard=()=>import('./PlayerCard').then(module=>(playerCardView=module.default));

/** Pocket cards re-render only when their own props change (a turn's page swap and its sheets' copies stay cheap). */
const PocketCard=memo(MiniCard);

type Era='current'|'allTime';
type Field='football'|'futsal';
const PROFILES=profiles as Record<string,{blurb:string;strengths:string[]}>;
const ENTRY=new Map(CARD_ENTRIES.map(entry=>[entry.name,entry]));
const FUTSAL=new Set(['goleiro','fixo','ala','pivot']);
const pad=(n:number)=>String(n).padStart(3,'0');
/** How cards are earned: neutral until the earning system is built (viewing a card never collects it). */
const EARN_COPY='Earn cards by learning: quizzes, the Ball hunt and exploring the island. Coming soon.';
/** With card rewards on: every found ball, finished chat or passed quiz lets you choose one of three new cards. */
const EARN_ACTIVE_COPY='Find a Ball hunt ball, finish a chat with an islander or pass a quiz, then choose one of three new players.';
/** Value tiers (Sep 25 2026): a greyed Icon or Elite card says when it can turn up, so the wait is explained, not hidden. */
const TIER_HINT:Record<string,string>={icon:`${TIER_TEACHING_LINE} Icon cards appear near the end of a path, and finishing a path always brings one.`,elite:'Elite cards unlock halfway along a path. Keep learning to meet them.'};
const earnCopy=(name:string)=>cardRewardsActive()?TIER_HINT[cardTier(name)]??EARN_ACTIVE_COPY:EARN_COPY;
const PLURAL:Record<string,string>={coach:'Coaches',goalkeeper:'Goalkeepers',fullback:'Full-backs',centerback:'Centre-backs',midfielder:'Midfielders',winger:'Wingers',striker:'Strikers',goleiro:'Goleiros',fixo:'Fixos',ala:'Alas',pivot:'Pivôs'};
const SHORT:Record<string,string>={coach:'Coach',goalkeeper:'Goalkeeper',fullback:'Full-back',centerback:'Centre-back',midfielder:'Midfielder',winger:'Winger',striker:'Striker',goleiro:'Goleiro',fixo:'Fixo',ala:'Ala',pivot:'Pivô'};
/** Divider tab labels that fit a phone's narrow tabs. */
const TAB_SHORT:Record<string,string>={coach:'Coaches',goalkeeper:'Keepers',fullback:'Full-backs',centerback:'Centre',midfielder:'Midfield',winger:'Wingers',striker:'Strikers',goleiro:'Goleiros',fixo:'Fixos',ala:'Alas',pivot:'Pivôs'};
/** Divider tab colours (island riso palette), one per position. */
const TAB:Record<string,string>={coach:'#e9798b',goalkeeper:'#ffd451',fullback:'#6ccdb0',centerback:'#8fb8f0',midfielder:'#f0a0d0',winger:'#f59f5b',striker:'#b9a0f0',goleiro:'#ffd451',fixo:'#6ccdb0',ala:'#f0a0d0',pivot:'#f59f5b'};
/** One line per position on what to learn from its cards (the page head's and the tab's tooltip). */
const ROLE_TIPS:Record<string,string>={
 goalkeeper:'The last line of defence: set your feet, make yourself big, and start attacks with a quick throw or pass.',
 fullback:'Defend the wide lanes, then overlap down the touchline to cross when your team has the ball.',
 centerback:'Guard the middle: win headers, block shots, and pass out calmly from the back.',
 midfielder:'The link between defence and attack: scan before the ball arrives, then keep it moving.',
 winger:'Stay wide to stretch the defence, beat your full-back, then cross or cut inside to shoot.',
 striker:'Lead the line: find space in the box, hold the ball up, and finish your chances.',
 goleiro:'The futsal keeper rolls the ball out fast and can join the attack as a fifth outfield player.',
 fixo:'The last outfield player: read passes, cover teammates, and start the rotations.',
 ala:'The wide futsal player: defend your side, then burst forward as the team rotates.',
 pivot:'The target up front: receive with your back to goal, shield the ball, and set up teammates.',
 coach:'Coaches plan how the whole team plays: turn a card over for its big idea, then try it with your team.',
};
/** The binder last opened (Football / Futsal), remembered per viewer; storage may be blocked. */
const FIELD_KEY='fi2-cards-field-v1';
const readField=():Field=>{try{return localStorage.getItem(FIELD_KEY)==='futsal'?'futsal':'football';}catch{return 'football';}};
const saveField=(field:Field)=>{try{localStorage.setItem(FIELD_KEY,field);}catch{}};
const reducedMotion=()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Ease out with a slight overshoot, then settle (the sheet lands and rests). */
/** CSS cubic-bezier(x1,y1,x2,y2) as a function (Newton steps on x, then y). */
const bezier=(x1:number,y1:number,x2:number,y2:number)=>{const f=(a:number,b:number,t:number)=>((1-3*b+3*a)*t+(3*b-6*a))*t*t+3*a*t,d=(a:number,b:number,t:number)=>3*(1-3*b+3*a)*t*t+2*(3*b-6*a)*t+3*a;
 return (x:number)=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<6;i++){const dx=f(x1,x2,t)-x,slope=d(x1,x2,t);if(Math.abs(dx)<1e-5||!slope)break;t-=dx/slope;}return f(y1,y2,Math.min(1,Math.max(0,t)));};};
/** A card flying out of its pocket: quick off the mark, landing without a long crawl. Flying back in: a gentle start, a firm landing. */
const liftOut=bezier(.2,.7,.2,1),liftBack=bezier(.45,0,.2,1);
/** One FLIP flight as linear keyframes sampled from `ease` (a smooth curve with no kink at an inner keyframe, and the same
 * transform functions in every keyframe so nothing is matrix-interpolated): from the pocket (dx, dy, sx, sy) to the
 * viewer when `toViewer`, else back. The card rises a little (arc) and tips back (tilt) mid-flight, in the stage's own perspective. */
const flight=(box:{dx:number;dy:number;sx:number;sy:number},toViewer:boolean,ease:(t:number)=>number,arc:number,tilt:number)=>
 Array.from({length:21},(_,k)=>{const e=ease(k/20),u=toViewer?1-e:e,rise=Math.sin(Math.PI*e);
  return {transform:`translate(${(box.dx*u).toFixed(2)}px,${(box.dy*u-arc*rise).toFixed(2)}px) scale(${(1+(box.sx-1)*u).toFixed(4)},${(1+(box.sy-1)*u).toFixed(4)}) rotateX(${(tilt*rise).toFixed(2)}deg)`};});
const settle=(t:number)=>{const c=.55,u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
/** A single page turning away off the phone's screen (it is only in view until it stands on edge, p = .5): it lifts off
 * promptly (no slow start), then slows through the visible curl, and only then speeds away off-screen. */
const inOut=(t:number)=>t<.65?.45*(1-Math.pow(1-t/.65,1.6)):.45+.55*Math.pow((t-.65)/.35,2);
/** A spread's turning sheet: a prompt lift, most of the time spent in the air where the curl shows, a soft landing. */
const spreadTurn=bezier(.35,.3,.3,1);
/** Both binders' default layouts: position by position, card number order, a new page per position, 9 pockets a page.
 * Rendering reads only from a layout (see components/binder.ts), so a saved custom layout can replace these later. */
const BINDERS={
 football:buildBinder(CARD_ENTRIES,ROLE_ORDER.filter(role=>!FUTSAL.has(role))),
 futsal:buildBinder(CARD_ENTRIES,ROLE_ORDER.filter(role=>FUTSAL.has(role))),
};
/** Test hook: while window.__fiBinderHold is true a finished turn stays on its last frame until window.__fiBinderRelease(). */
type HoldWindow=Window&{__fiBinderHold?:boolean;__fiBinderRelease?:()=>void};

/** A card lifted out of its sleeve into the full viewer; closing slides it back into the same pocket. */
type Lift={name:string;era:Era;got:boolean;from:HTMLElement;phase:'in'|'open'|'out';band?:{top:number;gap:number}};
/** One sheet in a turn: the pages on its two sides (-1 = the plain back of a sleeve), and its place in a riffle. */
type LeafPlan={front:number;back:number;hinge:'left'|'right';left:number;strips:number;z:number;delay:number;duration:number;reverse:boolean};
/** A page turn: the page the sheet(s) uncover (a copy laid over that side's resting page while it turns; none when a phone's
 * page turns back, which only covers), the sheet(s) turning, and whether a finger or pointer drives it. */
type Turn={id:number;from:number;to:number;dir:1|-1;under:{side:'left'|'right'|'single';index:number}|null;leaves:LeafPlan[];drag:boolean;settling:boolean};

/**
 * "Collect cards": a card-collector binder filling the whole Paths dialog over the island's coast art (the header and the
 * dock float over it). An open two-page spread on wide screens (rings down the spine, padded cover), a single page on
 * phones. Each page is a clear sleeve of 9 pockets (3 × 3); cards are ordered by position then number, each position
 * starts a new page and has a divider tab on the page edge. Pages turn as bending two-sided sheets (BinderLeaf): drag a
 * page and it follows the pointer, curling from where it was grabbed; release past halfway (or flick) and it completes,
 * else it falls back. The dock's arrows, the page corners and the arrow keys play the same turn; a tab riffles several
 * sheets to its section. Football and Futsal are two binders chosen in the dock. Search floats over everything and
 * never moves the binder; picking a result turns to its page and lights up the pocket. Tapping a card lifts it out of
 * its sleeve (FLIP) into the full PlayerCard over the blurred binder; an empty pocket shows its number and position.
 * Nothing here collects a card.
 *
 * Phone heat: only the open page(s) render, plus one turn's sheet slices and uncovered page: prebuilt once at rest (idle
 * time, or when a pointer reaches an arrow or a page) all but transparent, then revealed on the turn's first frame; mini
 * cards are static; the turn runs on requestAnimationFrame only while a page moves (transform and opacity only). No loop
 * runs at rest.
 */
export default function CardCollection(){
 const [owned,setOwned]=useState<string[]>([]),[field,setField]=useState<Field>('football'),[page,setPage]=useState(0),[turn,setTurn]=useState<Turn|null>(null);
 const [query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[active,setActive]=useState(0),[spot,setSpot]=useState<string|null>(null),[size,setSize]=useState({width:0,height:0});
 const [flipped,setFlipped]=useState(false),[lift,setLift]=useState<Lift|null>(null),[host,setHost]=useState<HTMLElement|null>(null),[leaving,setLeaving]=useState(false);
 const root=useRef<HTMLDivElement>(null),layer=useRef<HTMLDivElement>(null),binderRef=useRef<HTMLDivElement>(null),pagesRef=useRef<HTMLDivElement>(null),viewer=useRef<HTMLDivElement>(null),cardHost=useRef<HTMLDivElement>(null),backdrop=useRef<HTMLDivElement>(null),search=useRef<HTMLInputElement>(null),searchPanel=useRef<HTMLDivElement>(null);
 const leaves=useRef<(LeafHandle|null)[]>([]),underRef=useRef<HTMLDivElement>(null),castNear=useRef<HTMLDivElement>(null),castFar=useRef<HTMLDivElement>(null),raf=useRef<number>(),turnRef=useRef<Turn|null>(null),turnIds=useRef(0);
 const dragging=useRef<{id:number;x0:number;y0:number;grab:number;p:number;vx:number;lx:number;lt:number;started:boolean;side:'left'|'right'|'single'}|null>(null),swiped=useRef(0),sizeLock=useRef(false);
 const uid=useId().replace(/:/g,''),searchId=`${uid}-search`;
 // The one likely next turn, prebuilt while the binder rests (its sheets mounted but hidden), so a turn's first frame only
 // makes them visible. Valid only for the view and geometry it was planned from (key).
 const [prep,setPrep]=useState<(Turn&{key:string})|null>(null),prepRef=useRef(prep);
 turnRef.current=turn;sizeLock.current=searchOpen;prepRef.current=prep;
 const [PlayerCard,setPlayerCard]=useState<PlayerCardView|null>(()=>playerCardView);
 useEffect(()=>{setOwned(readCollection());setField(readField());let live=true;loadPlayerCard().then(view=>{if(live)setPlayerCard(()=>view);}).catch(()=>{});return ()=>{live=false;};},[]);
 // Card rewards (docs/card-rewards.md): a card just chosen from an offer lands in its pocket (CARD_SPOT: the position guide's
 // "See it in my binder" turns to a card the same way, without collecting it). The binder re-reads the collection,
 // opens the chosen card's binder and page, and lights its pocket (the same "Found" mark as search).
 useEffect(()=>{const land=(name:string|null)=>{if(!name)return;const entry=ENTRY.get(name);if(!entry)return;const target:Field=entry.futsal?'futsal':'football';
   setOwned(readCollection());setField(target);saveField(target);setPage(Math.max(0,pageOf(BINDERS[target].pages,name)));setSpot(name);};
  land(takeCardSpot());const added=()=>land(takeCardSpot());window.addEventListener(CARD_ADDED,added);window.addEventListener(CARD_SPOT,added);return ()=>{window.removeEventListener(CARD_ADDED,added);window.removeEventListener(CARD_SPOT,added);};},[]);
 // Everything renders at the dialog's top level (the modal body has its own padding and stacking context): the binder
 // under the floating header, the dock, search and the lifted card over it.
 useLayoutEffect(()=>{setHost(root.current?.closest('dialog')??null);},[]);
 // Sized from the stable viewport, and never while search is open (a phone keyboard must not shrink the binder).
 useLayoutEffect(()=>{const el=layer.current;if(!el)return;const measure=()=>{if(!sizeLock.current)setSize({width:Math.round(el.clientWidth),height:Math.round(el.clientHeight)});};measure();
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(el);return ()=>observer?.disconnect();},[host]);
 // Fade out with the modal: the dialog's panel plays its fade-out animation while it closes.
 useEffect(()=>{if(!host)return;const panelEl=host.querySelector<HTMLElement>(':scope > section');if(!panelEl)return;
  const check=()=>requestAnimationFrame(()=>setLeaving(/FadeOut/i.test(getComputedStyle(panelEl).animationName)));
  const observer=new MutationObserver(check);observer.observe(host,{attributes:true,attributeFilter:['class']});return ()=>observer.disconnect();},[host]);
 useEffect(()=>()=>{if(raf.current)cancelAnimationFrame(raf.current);},[]);

 const have=useMemo(()=>new Set(owned),[owned]);
 const total=CARD_ENTRIES.length,count=CARD_ENTRIES.filter(entry=>have.has(entry.name)).length;
 const pages=BINDERS[field].pages,sections=useMemo(()=>sectionsOf(pages),[pages]);
 const q=query.trim(),searching=q.length>0;
 const results=useMemo(()=>searching?CARD_ENTRIES.filter(entry=>matchesCard(q,entry.name,entry.number)).sort((a,b)=>Number(b.futsal===(field==='futsal'))-Number(a.futsal===(field==='futsal'))||a.number-b.number):[],[q,searching,field]);
 const matches=useMemo(()=>searching?new Set(results.map(entry=>entry.name)):null,[results,searching]);
 useEffect(()=>{setActive(0);},[q]);

 // ── Geometry: a spread on wide screens, one page on phones; the 3 × 3 pockets as large as the space between the
 // floating header and the dock allows (5:7 cards). Nothing here depends on search.
 const {width:W,height:H}=size,spread=W>=880&&H>=560;
 const g=useMemo(()=>{
  const head=spread?76:72,dock=spread?80:78,cover=spread?14:5,spine=spread?30:0,tab=spread?26:18,headH=26,inner=spread?12:14,gap=spread?16:22,pocketPad=spread?4:2,margin=spread?10:0;
  const availW=W-margin*2-cover*2-tab*(spread?2:1)-spine,availH=H-head-dock-cover*2;
  const byW=((spread?availW/2:availW)-inner*2-gap*2)/3,byH=((availH-inner*2-headH-gap*2)/3-pocketPad*2)/1.4+pocketPad*2;
  const pocketW=Math.max(60,Math.floor(Math.min(byW,byH,230))),cardW=pocketW-pocketPad*2,pocketH=Math.round(cardW*1.4+pocketPad*2);
  const pageW=pocketW*3+gap*2+inner*2,pageH=pocketH*3+gap*2+inner*2+headH,binderW=(spread?pageW*2+spine:pageW)+cover*2,binderH=pageH+cover*2;
  const top=Math.round(head+Math.max(0,(availH+cover*2-binderH)/2));
  return {cover,spine,tab,headH,inner,gap,pocketPad,pocketW,pocketH,cardW,pageW,pageH,binderW,binderH,top};
 },[W,H,spread]);
 const step=spread?2:1,start=viewStart(page,spread),last=viewStart(pages.length-1,spread),strips=spread?5:4;
 // Photos for the pages on show and the next spread load ahead, so a lifted card never waits for its photo.
 useEffect(()=>{preloadPlayerPhotos(pages.slice(start,start+step*2).flatMap(p=>p.slots));},[start,step,pages]);
 // A single page that reaches the screen's left edge (portrait phones): a sheet turned past p = .65 lies off-screen but for a
 // 1–6 px sliver over the binder's edge, so BinderLeaf hides it there instead of snapping that sliver away when the turn
 // settles. Where there is room beside the binder (a landscape phone) the turned sheet stays visible as before.
 const away=!spread&&(W-g.binderW-g.tab)/2+g.cover<=8?.65:undefined;
 useEffect(()=>{setPage(current=>Math.min(viewStart(current,spread),viewStart(pages.length-1,spread)));},[spread,pages.length]);

 // ── Page turns. planTurn lays out the sheets; run() animates them on requestAnimationFrame; finish() hands over to the
 // resting pages while the sheets still lie on their last frame (both stay mounted for two frames: no reflow, no snap).
 const planTurn=(from:number,to:number,drag:boolean):Turn=>{
  const dir:1|-1=to>from?1:-1,span=Math.abs(to-from)/step,inner=Math.max(0,Math.min(2,span-1));
  const via=Array.from({length:inner},(_,i)=>from+dir*step*Math.round((i+1)*(span/(inner+1))));
  const seq=[from,...via,to],m=seq.length-1,P=g.pageW,S=g.spine;
  const plan:LeafPlan[]=[];
  for(let j=0;j<m;j++){const main=j===m-1,delay=j*95,duration=main?(m>1?700:820):460,z=(dir===1||spread?(m-1-j):-(m-1-j))*.6;
   if(spread)plan.push(dir===1?{front:seq[j]+1,back:seq[j+1],hinge:'left',left:P+S,strips:main?strips:2,z,delay,duration,reverse:false}
    :{front:seq[j],back:seq[j+1]+1,hinge:'right',left:0,strips:main?strips:2,z,delay,duration,reverse:false});
   else plan.push(dir===1?{front:seq[j],back:-1,hinge:'left',left:0,strips:main?strips:2,z,delay,duration,reverse:false}
    :{front:seq[j+1],back:-1,hinge:'left',left:0,strips:main?strips:2,z,delay,duration,reverse:true});
  }
  const under:Turn['under']=spread?(dir===1?{side:'right',index:to+1}:{side:'left',index:to}):dir===1?{side:'single',index:to}:null;
  return {id:++turnIds.current,from,to,dir,under,leaves:plan,drag,settling:false};
 };
 const castShadows=(p:number,t:Turn)=>{const c=Math.min(1,Math.max(0,p)),lifted=Math.sin(Math.PI*c);
  const near=castNear.current,far=castFar.current,reveal=t.leaves[0]?.reverse?c:1-c;
  if(near){near.style.opacity=(.55*lifted*Math.pow(reveal,.35)).toFixed(3);near.style.transform=`scaleX(${Math.max(.05,Math.abs(Math.cos(Math.PI*c))).toFixed(3)})`;}
  if(far)far.style.opacity=(.4*lifted*(1-reveal)).toFixed(3);};
 const poseAll=(t:Turn,elapsed:number)=>{let done=true,mainP=0;
  t.leaves.forEach((leaf,j)=>{const q=Math.min(1,Math.max(0,(elapsed-leaf.delay)/leaf.duration));if(q<1)done=false;const e=q>=1?1:(!spread&&!leaf.reverse?inOut(q):spread&&j===t.leaves.length-1?spreadTurn(q):settle(q)),p=leaf.reverse?1-e:e;leaves.current[j]?.pose(p);if(j===t.leaves.length-1)mainP=p;});
  castShadows(mainP,t);return done;};
 const finish=(commit:boolean)=>{const t=turnRef.current;if(!t)return;
  const hold=window as HoldWindow;if(hold.__fiBinderHold){hold.__fiBinderRelease=()=>{hold.__fiBinderRelease=undefined;finish(commit);};return;}
  if(commit)setPage(t.to);setTurn({...t,settling:true});
  requestAnimationFrame(()=>requestAnimationFrame(()=>setTurn(current=>current&&current.id===t.id?null:current)));};
 // The clock starts on the first animation frame (not when the sheets mount), so the costly mount frame never eats into the
 // turn and the sheet moves from its very first frame instead of jumping ahead.
 const run=(t:Turn)=>{let t0=-1;const frame=(now:number)=>{if(turnRef.current?.id!==t.id)return;if(t0<0)t0=now;if(poseAll(t,now-t0)){raf.current=undefined;finish(true);return;}raf.current=requestAnimationFrame(frame);};raf.current=requestAnimationFrame(frame);};
 // Prebuilding: at most one turn, planned when the binder rests (idle time after a turn lands or the binder opens), when a
 // pointer or focus reaches a page arrow, and when a finger lands on a page. Nothing runs at rest once it is built.
 const prepKey=`${field}|${spread?1:0}|${g.pageW}x${g.pageH}|${start}`;
 const prepare=(delta:number)=>{if(turnRef.current||lift||!W||reducedMotion())return;const to=Math.max(0,Math.min(start+delta,last)),p=prepRef.current;
  if(to===start||(p&&p.key===prepKey&&p.to===to))return;const next={...planTurn(start,to,false),key:prepKey};prepRef.current=next;
  // A transition: the mount renders in small slices, so a tap or key press during it is never held up.
  startTransition(()=>setPrep(next));};
 /** The turn to play: the prebuilt one when it matches (same id, so its sheets stay mounted), else planned now. */
 const ready=(to:number,drag:boolean):Turn=>{const p=prepRef.current;prepRef.current=null;setPrep(null);return p&&p.key===prepKey&&p.to===to?{...p,drag}:planTurn(start,to,drag);};
 useEffect(()=>{if(prep&&prep.key!==prepKey)setPrep(null);},[prep,prepKey]);
 // The idle prebuild follows the direction of travel (the last turn's), falling back to the other way at either end of the
 // binder: after a back turn the next back turn is the likely one, and the pointer usually still rests on the arrow just
 // pressed (no new pointerenter to prebuild it). Predicting "next" there left every consecutive back turn unprebuilt, and
 // desktop Chrome then stalled one 67–133 ms frame rasterising the newly shown sheet (docs/performance-guide.md, Sep 25).
 const lastDir=useRef<1|-1>(1);
 useLayoutEffect(()=>{lastDir.current=1;},[field]);
 useEffect(()=>{if(turn||lift||!W)return;if(prepRef.current?.key===prepKey)return;const ahead=lastDir.current*step,run=()=>prepare(start+ahead>=0&&start+ahead<=last?ahead:-ahead);
  const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
  if(w.requestIdleCallback&&w.cancelIdleCallback){const id=w.requestIdleCallback(run,{timeout:1200});return ()=>w.cancelIdleCallback!(id);}
  const id=window.setTimeout(run,350);return ()=>window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[turn,lift,W,prepKey]);
 const goTo=(target:number)=>{const to=Math.max(0,Math.min(viewStart(target,spread),last));if(to===start||turn||!W)return;
  if(reducedMotion()){setPage(to);return;}setTurn(ready(to,false));};
 // Quick taps on the arrows (or arrow keys) during a planned turn are kept, not dropped: they add up and play as the next
 // turn (a riffle when several) once this one lands. A dragged turn ignores them.
 const queued=useRef(0);
 const turnBy=(delta:number)=>{if(turn){if(!turn.drag)queued.current=Math.max(0,Math.min(last,turn.to+queued.current+delta))-turn.to;return;}goTo(start+delta);};
 useEffect(()=>{if(turn||!queued.current)return;const delta=queued.current;queued.current=0;goTo(start+delta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[turn]);
 // A planned (not dragged) turn starts once its sheets are mounted, from their first frame.
 useLayoutEffect(()=>{if(!turn||turn.settling)return;lastDir.current=turn.dir;leaves.current.forEach(leaf=>leaf?.reveal());const u=underRef.current;if(u?.hasAttribute('data-prep')){u.style.opacity='';u.removeAttribute('data-prep');}
  if(turn.drag){const d=dragging.current;const leaf=turn.leaves[0];leaves.current[0]?.pose(leaf.reverse?1-(d?.p??0):(d?.p??0));castShadows(leaf.reverse?1-(d?.p??0):(d?.p??0),turn);return;}
  poseAll(turn,0);run(turn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[turn?.id]);
 // A prebuilt turn's sheets rest where its first frame will put them (nothing is written again when it starts).
 useLayoutEffect(()=>{const t=prepRef.current;if(!t||turnRef.current)return;t.leaves.forEach((leaf,j)=>leaves.current[j]?.pose(leaf.reverse?1:0));
  for(const el of [castNear.current,castFar.current])if(el){el.style.opacity='0';el.style.transform='';}},[prep?.id]);

 // Drag a page: it follows the pointer, curling from where it was grabbed; release past halfway (or flick) to turn.
 const hingeX=()=>{const r=pagesRef.current?.getBoundingClientRect();return r?r.left+(spread?g.pageW+g.spine/2:0):0;};
 const onDown=(event:React.PointerEvent)=>{if(turn||lift||event.button>0)return;const r=pagesRef.current?.getBoundingClientRect();if(!r)return;
  const side=!spread?'single':event.clientX<r.left+g.pageW+g.spine/2?'left':'right';
  dragging.current={id:event.pointerId,x0:event.clientX,y0:event.clientY,grab:event.clientX,p:0,vx:0,lx:event.clientX,lt:performance.now(),started:false,side};
  if(side!=='single')prepare(side==='left'?-step:step);};
 const onMove=(event:React.PointerEvent)=>{const d=dragging.current;if(!d||d.id!==event.pointerId)return;const dx=event.clientX-d.x0,dy=event.clientY-d.y0,now=performance.now();
  d.vx=(event.clientX-d.lx)/Math.max(1,now-d.lt);d.lx=event.clientX;d.lt=now;
  if(!d.started){if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;
   const forward=d.side==='right'||(d.side==='single'&&dx<0);if(d.side==='left'&&dx<0||d.side==='right'&&dx>0){dragging.current=null;return;}
   const to=forward?start+step:start-step;if(to<0||to>last){dragging.current=null;return;}
   d.started=true;swiped.current=now;try{(event.currentTarget as HTMLElement).setPointerCapture(d.id);}catch{}
   setTurn(ready(to,true));}
  const P=g.pageW,h=hingeX(),reach=Math.max(P*.35,Math.abs(d.grab-h));
  // Forward (and a spread's back turn): the grabbed point stays under the pointer (the sheet's edge follows it). A single
  // page's back turn comes in from the left, so it simply follows the drag distance.
  const back=d.side==='single'&&dx>0;
  d.p=back?Math.min(1,Math.max(0,dx/(P*.95))):Math.acos(Math.min(1,Math.max(-1,(d.side==='left'?h-event.clientX:event.clientX-h)/reach)))/Math.PI;
  const t=turnRef.current;if(!t||!t.drag)return;const leaf=t.leaves[0],p=leaf.reverse?1-d.p:d.p;
  if(!raf.current)raf.current=requestAnimationFrame(()=>{raf.current=undefined;leaves.current[0]?.pose(p);castShadows(p,t);});};
 const onUp=(event:React.PointerEvent)=>{const d=dragging.current;dragging.current=null;if(!d||d.id!==event.pointerId||!d.started)return;swiped.current=performance.now();
  // A finger that stopped before lifting is not a flick. A phone's single page turns about its left edge, which sits at
  // the screen edge, so the pointer can never pass the hinge (p > .5): dragging most of the way across completes it.
  const t=turnRef.current;if(!t)return;const vx=performance.now()-d.lt>120?0:d.vx,flick=d.side==='left'||(d.side==='single'&&t.dir===-1)?vx>.45:vx<-.45;
  const complete=d.p>(d.side==='single'&&t.dir===1?.4:.5)||flick,from=d.p,to=complete?1:0,leaf=t.leaves[0],duration=Math.max(220,520*Math.abs(to-from)+120),t0=performance.now();
  if(raf.current)cancelAnimationFrame(raf.current);
  const frame=(now:number)=>{if(turnRef.current?.id!==t.id)return;const q=Math.min(1,(now-t0)/duration),e=q>=1?1:settle(q),p=from+(to-from)*e,pose=leaf.reverse?1-p:p;
   leaves.current[0]?.pose(pose);castShadows(pose,t);if(q<1){raf.current=requestAnimationFrame(frame);return;}raf.current=undefined;finish(complete);};
  if(reducedMotion()){finish(complete);return;}raf.current=requestAnimationFrame(frame);};

 // ── Search floats over everything: picking a result turns to its page (switching binder if needed) and lights the pocket.
 const pick=(name:string)=>{const entry=ENTRY.get(name);if(!entry)return;const target:Field=entry.futsal?'futsal':'football';
  setSearchOpen(false);setQuery('');setSpot(name);
  const targetPages=BINDERS[target].pages,index=pageOf(targetPages,name);
  if(target!==field){setField(target);saveField(target);setPage(viewStart(Math.max(0,index),spread));return;}
  if(index>=0)goTo(index);};
 // The picked pocket stays marked (glow + the "Found" pill above the dock) and takes focus once its page is open;
 // the mark clears when the player turns away from that page, switches binder, or dismisses the pill.
 useEffect(()=>{if(!spot||turn)return;const el=binderRef.current?.querySelector<HTMLElement>(`[data-name="${CSS.escape(spot)}"] button`);if(!el)return;el.focus({preventScroll:true});},[spot,turn,page,field]);
 useEffect(()=>{if(!spot||turn)return;const at=pageOf(BINDERS[field].pages,spot);if(at<0||at<start||at>=start+step)setSpot(null);},[spot,turn,start,step,field]);
 const closeSearch=(refocus=true)=>{setSearchOpen(false);setQuery('');if(refocus)requestAnimationFrame(()=>host?.querySelector<HTMLElement>('[data-search-toggle]')?.focus());};
 const onSearchKey=(event:React.KeyboardEvent<HTMLInputElement>)=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(results.length)setActive(i=>(i+(event.key==='ArrowDown'?1:-1)+results.length)%results.length);return;}
  if(event.key==='Enter'&&results[active]){event.preventDefault();pick(results[active].name);}
 };
 useEffect(()=>{searchPanel.current?.querySelector(`#${searchId}-opt-${active}`)?.scrollIntoView({block:'nearest'});},[active,searchId]);
 // Search takes the dock's place: the dock hides and the search bar sits at the TOP of the visible area with the results directly
 // under it, down to the keyboard (iPhone, Sep 26 2026: with the bar docked above the keyboard the matches had to squeeze in above
 // it, and on iOS they didn't show at all). iOS keeps the layout viewport and only shrinks (and may offset) the visual viewport, so
 // --vvt is the visual viewport's top relative to the fixed layer and --vvh its height; the panel is capped to that band.
 // data-kb marks a keyboard (the bottom safe-area inset no longer applies). Phones: the bar covers the header row (user: "cover the
 // Back and Done buttons"), which fades out and goes inert + aria-hidden until search closes. Tablets and desktop keep the header:
 // --floor starts the panel just under it. visualViewport events only, while search is open.
 useEffect(()=>{const vv=typeof window!=='undefined'?window.visualViewport:null,el=searchPanel.current;if(!searchOpen||!vv||!el)return;
  const header=host?.querySelector<HTMLElement>(':scope > section > header')??null,phone=matchMedia('(max-width: 699px)').matches,wasInert=!!header?.inert;
  if(header&&phone){header.style.transition='opacity .18s ease-out';header.style.opacity='0';header.inert=true;header.setAttribute('aria-hidden','true');}
  // iOS may scroll the page to reveal the focused field; the binder is all fixed, so put it back (the panel follows offsetTop anyway).
  const update=()=>{if((document.scrollingElement?.scrollTop??0)>0)document.scrollingElement!.scrollTop=0;const top=layer.current?.getBoundingClientRect().top??0;
   el.style.setProperty('--vvt',`${Math.max(0,Math.round(vv.offsetTop-top))}px`);el.style.setProperty('--vvh',`${Math.round(vv.height)}px`);
   el.style.setProperty('--floor',header&&!phone?`${Math.round(header.getBoundingClientRect().bottom-top+6)}px`:'0px');
   el.toggleAttribute('data-kb',innerHeight-vv.height>120);};update();
  vv.addEventListener('resize',update);vv.addEventListener('scroll',update);
  return ()=>{vv.removeEventListener('resize',update);vv.removeEventListener('scroll',update);
   if(header&&phone){header.style.opacity='';header.inert=wasInert;header.removeAttribute('aria-hidden');window.setTimeout(()=>{header.style.transition='';},250);}};},[searchOpen,host]);

 // ── Lift: the card rises out of its pocket into the viewer (FLIP from the pocket's rect to the card's), over the blurred binder.
 const liftCard=(name:string,from:HTMLElement)=>{if(lift||turn||performance.now()-swiped.current<350)return;const entry=ENTRY.get(name);if(!entry)return;
  // Phones: the open card fills the same vertical band as the binder page it came from. Measured here, before the flight, so the
  // viewer's layout is final when the flight measures its target.
  const page=innerWidth<=600?binderRef.current?.getBoundingClientRect():undefined;
  const band=page&&page.height>0?{top:Math.round(page.top),gap:Math.max(0,Math.round(innerHeight-page.bottom))}:undefined;
  setLift({name,era:entry.era,got:have.has(name),from,phase:have.has(name)&&!reducedMotion()?'in':'open',band});};
 const cardEl=()=>{const stage=cardHost.current?.firstElementChild as HTMLElement|null;return (stage?.children[0] as HTMLElement|undefined)??null;};
 // Flip lives in the viewer's top-right header button; it drives PlayerCard's own Flip (hidden in this viewer).
 // The header Flip mirrors the card's own state after any click inside the card (Play turns a flipped card to its front).
 const syncFlip=()=>requestAnimationFrame(()=>{const own=cardHost.current?.querySelector<HTMLButtonElement>('button[aria-pressed]');if(own)setFlipped(own.getAttribute('aria-pressed')==='true');});
 const flipCard=()=>{const own=cardHost.current?.querySelector<HTMLButtonElement>('button[aria-pressed]');if(!own)return;own.click();syncFlip();};
 useEffect(()=>{if(!lift)setFlipped(false);},[lift]);
 // FLIP box: the pocket's card rect relative to the viewer card's resting rect (width and height scaled separately, so the
 // flight starts and ends exactly on the pocket card). Measured once, before the flight: no layout while it flies.
 const flipBox=(from:HTMLElement,card:HTMLElement)=>{const a=(from.firstElementChild as HTMLElement|null??from).getBoundingClientRect(),b=card.getBoundingClientRect();
  return {dx:a.left+a.width/2-(b.left+b.width/2),dy:a.top+a.height/2-(b.top+b.height/2),sx:a.width/Math.max(1,b.width),sy:a.height/Math.max(1,b.height)};};
 const flightAnims=useRef<Animation[]>([]);
 const stopFlight=()=>{for(const a of flightAnims.current){a.onfinish=null;a.cancel();}flightAnims.current=[];};
 // Lift in. The pocket keeps its card until the flight starts; the flight starts in this layout effect (before the viewer's
 // first paint) whenever PlayerCard is ready, so there is never a frame with no card, two cards or a full-strength backdrop.
 // Only if PlayerCard is still loading does it wait (the pocket card stays put meanwhile).
 useLayoutEffect(()=>{
  if(!lift||lift.phase!=='in')return;let frames=0,id=0;
  const tryStart=()=>{const card=cardEl(),v=viewer.current;if(!card||!v){if(++frames<90)id=requestAnimationFrame(tryStart);else setLift(l=>l&&{...l,phase:'open'});return;}
   const box=flipBox(lift.from,card);v.setAttribute('data-flying','');lift.from.style.visibility='hidden';
   const fade=backdrop.current?.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out',fill:'both'});
   const anim=card.animate(flight(box,true,liftOut,26,7),{duration:400,easing:'linear'});
   flightAnims.current=[anim,...(fade?[fade]:[])];
   anim.onfinish=()=>setLift(l=>l&&l.phase==='in'?{...l,phase:'open'}:l);};
  tryStart();return ()=>{cancelAnimationFrame(id);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[lift?.phase,lift?.name,PlayerCard]);
 // Landed: the pocket shows as an empty sleeve (data-lifted), and the chrome fades in, in the same frame the flight ends.
 useLayoutEffect(()=>{if(lift?.phase!=='open')return;lift.from.style.visibility='';viewer.current?.removeAttribute('data-flying');},[lift?.phase,lift?.from]);
 // Leaving mid-flight (the modal closes) never strands a hidden pocket card.
 useEffect(()=>{const from=lift?.from;return ()=>{if(from)from.style.visibility='';};},[lift?.from]);
 // Focus goes back to the pocket once the card is back and the binder is no longer inert (after the commit: a flight's
 // onfinish update can commit after the next animation frame, when the pocket was still inert and focus fell to <body>).
 const restoreFocus=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(lift)return;const el=restoreFocus.current;restoreFocus.current=null;if(el?.isConnected)el.focus({preventScroll:true});},[lift]);
 const closeLift=()=>{if(!lift||lift.phase!=='open')return;
  // Re-read the collection only once the card is back (and only re-render the binder if it changed): no binder render mid-flight.
  const done=()=>{restoreFocus.current=lift.from;flightAnims.current=[];setLift(null);const now=readCollection();setOwned(old=>old.length===now.length&&old.every((name,i)=>name===now[i])?old:now);};
  const card=lift.got?cardEl():null;
  if(reducedMotion()||!card||!lift.from.isConnected){const v=viewer.current;if(v&&!reducedMotion()){v.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).onfinish=done;}else done();return;}
  stopFlight();const box=flipBox(lift.from,card);viewer.current?.setAttribute('data-flying','');setLift({...lift,phase:'out'});
  const fade=backdrop.current?.animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-in',fill:'forwards'});
  const anim=card.animate(flight(box,false,liftBack,20,6),{duration:340,easing:'linear',fill:'forwards'});
  flightAnims.current=[anim,...(fade?[fade]:[])];anim.onfinish=done;};
 useLayoutEffect(()=>{if(lift?.phase==='open'&&reducedMotion())viewer.current?.animate([{opacity:0},{opacity:1}],{duration:160});},[lift?.phase]);

 // The lifted card covers the whole dialog: everything behind it is inert.
 useEffect(()=>{const panelEl=host?.querySelector<HTMLElement>(':scope > section');if(!panelEl)return;panelEl.inert=!!lift;return ()=>{panelEl.inert=false;};},[host,lift]);

 // Escape closes the innermost thing first (the card at once, skipping Done's check animation): card → search → (then the modal). Arrow keys turn pages.
 const onKeyDown=(event:React.KeyboardEvent)=>{
  if(event.key==='Escape'){
   const stop=()=>{event.preventDefault();event.stopPropagation();};
   if(lift){stop();closeLift();return;}
   if(searchOpen){stop();closeSearch();return;}
   return;
  }
  const target=event.target as HTMLElement;if(lift||searchOpen||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))return;
  const keys:Record<string,number>={ArrowRight:step,PageDown:step,ArrowLeft:-step,PageUp:-step};
  if(event.key in keys){event.preventDefault();turnBy(keys[event.key]);return;}
  if(event.key==='Home'){event.preventDefault();goTo(0);return;}
  if(event.key==='End'){event.preventDefault();goTo(last);return;}
  if(event.key==='/'){event.preventDefault();setSearchOpen(true);requestAnimationFrame(()=>search.current?.focus({preventScroll:true}));}
 };
 const inert=(on:boolean)=>(on?{inert:''}:{}) as Record<string,string>;
 const chooseField=(next:Field)=>{if(next===field||turn)return;setField(next);saveField(next);setPage(0);};

 const liftEntry=lift?ENTRY.get(lift.name):undefined;
 // The slots always show the resting pages: during a turn the uncovered page is a copy over its slot (Turn.under), so a
 // turn's first frame changes no slot.
 const view=spread?{left:start,right:start+1}:{single:start};
 const openRoles=[...new Set([sectionOf(sections,start)?.role,spread&&start+1<pages.length?sectionOf(sections,start+1)?.role:undefined].filter((r):r is string=>!!r))];
 const sectionGot=(role:string)=>{const s=sections.find(x=>x.role===role);return s?s.cards.filter(name=>have.has(name)).length:0;};

 // clip (a turning strip's slice of the page, page px): pockets wholly outside it (with room for their glow) stay empty
 // cells, so a turn's 2 × strips page copies carry only the cards they actually show.
 const renderPage=(index:number,side:'left'|'right'|'single',clip?:[number,number])=>{
  const p:BinderPage|undefined=pages[index];
  const shows=(i:number)=>{if(!clip)return true;const x0=g.inner+(i%3)*(g.pocketW+g.gap);return x0+g.pocketW+30>clip[0]&&x0-30<clip[1];};
  if(!p)return <div className={`${styles.page} ${styles.blankPage}`} data-side={side}><span className={styles.sleeveSheen} aria-hidden="true"/></div>;
  const section=sectionOf(sections,index),sheet=section?index-section.start:0,of=section?.pages??1;
  return <section className={styles.page} data-side={side} aria-label={`Page ${index+1}: ${PLURAL[p.role]}, sheet ${sheet+1} of ${of}`}>
   <header className={styles.pageHead} title={ROLE_TIPS[p.role]}>
    <b>{PLURAL[p.role]}</b><span>{section?`${sectionGot(p.role)} / ${section.cards.length}`:''}</span><small>{sheet+1} / {of}</small>
   </header>
   {/* Pockets are keyed by slot index: a later drag-and-drop between slots and pages (moveCard) only swaps layout slots. */}
   <ul className={styles.pockets}>
    {p.slots.map((name,i)=>{const entry=name?ENTRY.get(name):undefined,got=!!name&&have.has(name);
     if(!shows(i))return <li key={i} className={styles.pocket}/>;
     return <li key={i} data-slot={i} data-name={name??undefined} className={styles.pocket} data-match={matches&&name?(matches.has(name)?'yes':'no'):undefined} data-spot={spot&&spot===name?'':undefined} data-lifted={lift&&lift.name===name&&lift.got&&lift.phase!=='in'?'':undefined}>
      {entry&&name?(got?<button type="button" className={styles.inPocket} data-sound="slide" aria-label={`${name}, card ${entry.number}, ${entry.era==='allTime'?'legend':'star'}, ${entry.roleLabel}${hasPlayFilm(name)?', has a Play Moment':''}. Take out card`} onClick={event=>liftCard(name,event.currentTarget)}>
        <PocketCard name={name} number={entry.number} era={entry.era} got/>
       </button>
       :<button type="button" className={`${styles.inPocket} ${styles.ghost}`} aria-label={`${name}, card ${entry.number}, ${entry.roleLabel}. Not collected yet. Show details`} onClick={event=>liftCard(name,event.currentTarget)}>
        <PocketCard name={name} number={entry.number} era={entry.era} got/>
       </button>):null}
      <span className={styles.pocketSheen} aria-hidden="true"/>
     </li>;})}
   </ul>
   <span className={styles.sleeveSheen} aria-hidden="true"/>
  </section>;
 };
 const blank=<div className={`${styles.page} ${styles.blankPage}`} data-side="left"><span className={styles.sleeveSheen}/></div>;
 const vars={'--cover':`${g.cover}px`,'--spine':`${g.spine}px`,'--tab':`${g.tab}px`,'--head':`${g.headH}px`,'--inner':`${g.inner}px`,'--gap':`${g.gap}px`,'--pp':`${g.pocketPad}px`,'--pw':`${g.pocketW}px`,'--ph':`${g.pocketH}px`,'--w':`${g.cardW}px`,'--page-w':`${g.pageW}px`,'--page-h':`${g.pageH}px`,top:g.top,width:g.binderW,height:g.binderH} as React.CSSProperties;
 const shown=turn??(prep&&prep.key===prepKey?prep:null);
 // Memoized so that starting the prebuilt turn (reveal() on its first frame) re-renders none of its page copies.
 const sheets=useMemo(()=>shown?.leaves.map((leaf,j)=><BinderLeaf key={`${shown.id}-${j}`} ref={el=>{leaves.current[j]=el;}} hinge={leaf.hinge} offset={spread?g.spine/2:0} width={g.pageW} height={g.pageH} strips={leaf.strips} left={leaf.left} z={leaf.z} hidden={!turn} away={away}
   front={(a:number,b:number)=>renderPage(leaf.front,spread?(leaf.hinge==='left'?'right':'left'):'single',[a,b])} back={leaf.back>=0?(a:number,b:number)=>renderPage(leaf.back,leaf.hinge==='left'?'left':'right',[a,b]):blank}/>),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [shown?.id,g,spread,away,pages,sections,have,matches,spot,lift]);
 const under=shown?.under;
 const underCopy=useMemo(()=>under&&<div ref={underRef} className={styles.underCopy} style={turn?undefined:{opacity:.001}} data-prep={turn?undefined:''} aria-hidden="true" {...inert(true)}>{renderPage(under.index,under.side)}</div>,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [shown?.id,g,spread,pages,sections,have,matches,spot,lift]);
 const nearSide=shown?(spread?(shown.dir===1?'right':'left'):'single'):'single',farSide=shown&&spread?(shown.dir===1?'left':'right'):null;

 const binder=<div ref={layer} className={styles.layer} data-leaving={leaving||undefined} {...inert(!!lift)}>
  {W>0&&<div ref={binderRef} className={styles.binder} data-spread={spread||undefined} data-turning={turn?'':undefined} style={vars}
   role="region" aria-roledescription="binder" aria-label={`${field==='football'?'Futbol':'Futsal'} card binder. Arrow keys or drag a page to turn it`}
   onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
   <div className={styles.cover} aria-hidden="true"/>
   <div ref={pagesRef} className={styles.pages}>
    {spread?<>
     <div className={styles.slotLeft}>{renderPage(view.left!,'left')}{under?.side==='left'&&underCopy}</div>
     <div className={styles.spine} aria-hidden="true">{[0,1,2].map(i=><span key={i} className={styles.ring}/>)}</div>
     <div className={styles.slotRight}>{renderPage(view.right!,'right')}{under?.side==='right'&&underCopy}</div>
    </>:<div className={styles.slotSingle}>{renderPage(view.single!,'single')}{under?.side==='single'&&underCopy}<div className={styles.holes} aria-hidden="true">{[0,1,2].map(i=><span key={i} className={styles.ring}/>)}</div></div>}
    {/* The shadows mount with the prebuilt turn too (transparent until it plays): a turn's first frame inserts nothing, which
        would restyle the whole dialog (its :has() rules). */}
    {shown&&<>
     <div ref={castNear} className={styles.cast} data-side={nearSide} data-dir={shown.dir} aria-hidden="true"/>
     {farSide&&<div ref={castFar} className={styles.castFar} data-side={farSide} aria-hidden="true"/>}
    </>}
    {/* The turning sheets, or the prebuilt next turn's sheets (hidden) while the binder rests: same keys, so starting that
        turn never remounts them. */}
    {sheets}
   </div>
   <button type="button" className={`${styles.corner} ${styles.cornerPrev}`} aria-label="Previous page" disabled={start<=0} onPointerEnter={()=>prepare(-step)} onFocus={()=>prepare(-step)} onClick={()=>turnBy(-step)}/>
   <button type="button" className={`${styles.corner} ${styles.cornerNext}`} aria-label="Next page" disabled={start>=last} onPointerEnter={()=>prepare(step)} onFocus={()=>prepare(step)} onClick={()=>turnBy(step)}/>
   {/* Divider tabs, found from the layout: sections already passed sit on the left edge of a spread, the rest on the right. */}
   <div className={styles.tabs}>
    {sections.map((s,k)=>{const passed=spread&&s.start<=start,current=openRoles.includes(s.role);
     return <button key={s.role} type="button" className={styles.tab} data-edge={passed?'left':'right'} aria-current={current?'true':undefined} title={ROLE_TIPS[s.role]}
      style={{'--k':k,'--n':sections.length,'--tab-c':TAB[s.role]} as React.CSSProperties} aria-label={`${PLURAL[s.role]}: jump to page ${s.start+1}`} onClick={()=>goTo(s.start)}>
      <span className={styles.tabLong}>{PLURAL[s.role]}</span><span className={styles.tabShort} aria-hidden="true">{TAB_SHORT[s.role]}</span>
     </button>;})}
   </div>
  </div>}
  <p className={styles.srOnly} aria-live="polite">{pages.length?`Page ${start+1}${spread&&start+1<pages.length?` and ${start+2}`:''} of ${pages.length}, ${openRoles.map(r=>PLURAL[r]).join(' and ')}`:''}</p>
 </div>;

 // The dock: fixed to the bottom, always visible (under the lifted card): page arrows, Football / Futsal, search.
 const dock=<nav className={styles.dock} data-leaving={leaving||undefined} data-searching={searchOpen||undefined} aria-label="Binder" {...inert(!!lift||searchOpen)}>
  <button type="button" className={styles.turn} aria-label="Previous page" disabled={start<=0} onPointerEnter={()=>prepare(-step)} onFocus={()=>prepare(-step)} onClick={()=>turnBy(-step)}><Arrow dir={-1}/></button>
  <button type="button" className={styles.turn} aria-label="Next page" disabled={start>=last} onPointerEnter={()=>prepare(step)} onFocus={()=>prepare(step)} onClick={()=>turnBy(step)}><Arrow dir={1}/></button>
  <div className={styles.seg} role="group" aria-label="Choose binder">
   {(['football','futsal'] as Field[]).map(value=><button key={value} type="button" aria-pressed={field===value} onClick={()=>chooseField(value)}>{value==='football'?'Futbol':'Futsal'}</button>)}
  </div>
  {!spot&&!searchOpen&&<CardOfferPill/>}
  {spot&&!searchOpen&&<div className={styles.found} role="status"><span>Found: <b>{spot}</b></span><button type="button" aria-label={`Clear search for ${spot}`} onClick={()=>{setSpot(null);requestAnimationFrame(()=>host?.querySelector<HTMLElement>('[data-search-toggle]')?.focus());}}>×</button></div>}
  <button type="button" data-search-toggle="" className={styles.searchButton} aria-label="Search cards" aria-expanded={searchOpen} aria-controls={searchOpen?searchId:undefined}
   onClick={()=>{if(searchOpen)closeSearch();else{setSearchOpen(true);requestAnimationFrame(()=>search.current?.focus({preventScroll:true}));}}}><span className={styles.searchIcon} aria-hidden="true"/></button>
 </nav>;

 // Search: a floating bar at the top of the visible area with its results list directly below it, over everything; tapping outside
 // closes it. The binder never moves.
 const searchLayer=searchOpen&&<>
  <div className={styles.searchCatcher} aria-hidden="true" onPointerDown={()=>closeSearch(false)}/>
  <div ref={searchPanel} className={styles.searchPanel} role="dialog" aria-label="Search cards">
   <div className={styles.searchRow}>
    <label className={styles.search}>
     <span className={styles.srOnly}>Find a player</span><span className={styles.searchIcon} aria-hidden="true"/>
     <input ref={search} id={searchId} type="search" value={query} placeholder="Find a player or card No." autoComplete="off" spellCheck={false} inputMode="search" enterKeyHint="search"
      role="combobox" aria-expanded={searching} aria-controls={`${searchId}-list`} aria-activedescendant={searching&&results.length?`${searchId}-opt-${active}`:undefined} aria-autocomplete="list"
      onChange={event=>setQuery(event.target.value)} onKeyDown={onSearchKey}/>
    </label>
    {searching&&<span className={styles.count} aria-hidden="true">{results.length} {results.length===1?'match':'matches'}</span>}
    <button type="button" className={styles.clear} aria-label="Close search" onClick={()=>closeSearch()}>×</button>
   </div>
   {searching&&<ul id={`${searchId}-list`} className={styles.results} role="listbox" aria-label="Matching cards">
    {results.length?results.slice(0,40).map((entry,i)=>{const got=have.has(entry.name);
     return <li key={entry.name} id={`${searchId}-opt-${i}`} role="option" aria-selected={i===active} className={styles.result} onPointerDown={event=>event.preventDefault()} onClick={()=>pick(entry.name)} onPointerEnter={()=>setActive(i)}>
      <span className={`${styles.resultThumb} ${got?'':styles.ghost}`}><MiniCard name={entry.name} number={entry.number} era={entry.era} got compact thumb/></span>
      <span className={styles.resultText}><b>{entry.name}</b>{/* real names for every card, as on the binder's greyed cards (user, Sep 25 2026); the greyed thumb marks not collected */}{!got&&<span className={styles.srOnly}> Not collected yet.</span>}<small>No. {pad(entry.number)} · {SHORT[entry.role]} · {entry.futsal?'Futsal':'Futbol'}</small></span>
     </li>;}):<li className={styles.noResult} role="option" aria-selected="false" aria-disabled="true">No players match “{q}”. Try fewer letters, or a card number.</li>}
   </ul>}
   <p className={styles.srOnly} aria-live="polite">{searching?(results.length?`${results.length} ${results.length===1?'card matches':'cards match'}. Arrow keys choose, Enter opens its page.`:'No card matches.'):''}</p>
  </div>
 </>;

 return <div ref={root} className={styles.anchor} onKeyDown={onKeyDown}>
  {host&&createPortal(<><div className={styles.layerArt} data-leaving={leaving||undefined} aria-hidden="true"/>{binder}</>,host)}
  {host&&createPortal(dock,host)}
  {host&&searchLayer&&createPortal(searchLayer,host)}
  {host&&lift&&liftEntry&&createPortal(<div ref={viewer} className={styles.viewer} data-phase={lift.phase} data-band={lift.got&&lift.band?'':undefined} style={lift.got&&lift.band?{'--band-top':`${lift.band.top}px`,'--band-gap':`${lift.band.gap}px`} as React.CSSProperties:undefined} role="dialog" aria-modal="true" aria-label={lift.got?`${lift.name} card`:undefined} aria-labelledby={lift.got?undefined:`${uid}-back`}>
   <div ref={backdrop} className={styles.viewerBackdrop} aria-hidden="true"/>
   <div className={styles.viewerBar}>
    <NavigationButton key={lift.phase==='in'?'in':'live'/* a tap while the card is still rising resets once it lands */} back className={styles.viewerBack} onNavigate={closeLift} autoFocus/>
    {lift.got&&<button type="button" className={`${styles.viewerFlip} ${navStyles.button}`} data-navigation="done" aria-pressed={flipped} onClick={flipCard}><span className={navStyles.label}>Flip</span></button>}
   </div>
   {lift.got?<>
    <div ref={cardHost} className={styles.cardHost} onClickCapture={syncFlip}>
     {PlayerCard&&<PlayerCard name={lift.name} role={liftEntry.roleLabel.replace('Futsal ','')} era={lift.era} team="gold" format={liftEntry.futsal?'futsal':'11v11'} firstName={lift.name.split(' ')[0]} compact
      blurb={PROFILES[lift.name]?.blurb??`${lift.name} is one of the players to learn from as a ${liftEntry.roleLabel.toLowerCase()}.`} strengths={PROFILES[lift.name]?.strengths??[]} onFlipChange={setFlipped}/>}
    </div>
   </>:<>
    {/* Not collected (user, Sep 24 2026): the same card, greyed out, with how to earn it as the description. */}
    <h3 id={`${uid}-back`} className={styles.srOnly}>No. {pad(liftEntry.number)} · {SHORT[liftEntry.role]??liftEntry.roleLabel} · {lift.name}. Not collected yet.</h3>
    <div className={`${styles.cardHost} ${styles.ghostCard}`}>
     {PlayerCard&&<PlayerCard name={lift.name} role={liftEntry.roleLabel.replace('Futsal ','')} era={lift.era} team="gold" format={liftEntry.futsal?'futsal':'11v11'} firstName={lift.name.split(' ')[0]} compact
      blurb={`Not collected yet. ${earnCopy(lift.name)}`} strengths={[]}/>}
    </div>
   </>}
  </div>,host)}
 </div>;
}

function Arrow({dir}:{dir:1|-1}){return <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d={dir===1?'M7 3.5 14 10l-7 6.5':'M13 3.5 6 10l7 6.5'} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
