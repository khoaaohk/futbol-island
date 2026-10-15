'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent as RKE,type PointerEvent as RPE} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import StepIcon from '../StepIcon';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import Slider from '../modern/Slider';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {ACCENT} from '../modern/tokens';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,ScoreCover,Seg,paper as p} from '../anatomy/PaperRoom';
import {useBox,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {axisVector,fitProjection,type Projection} from '../anatomy/iso-kit';
import {CUPS,LAST_STATE,MATCHES_1916,TEAMS,TROPHY_PARTS,YEAR0,YEAR1,clampPhi,clampYear,headStart,phiOf,playedAt,railSay,stateAt,table,type CupId,type Team,type TrophyPart} from './model';
import {render,stationPoints,yearOfX,type Anchors,type Station} from './scene';
import {BEATS,CHECKS,EXTRA,MODEL_NOTE,SOURCES} from './content';
import s from './Experience.module.css';

/**
 * copa-america-1916 · "The oldest cup for nations" (Oct 14 2026 redo; user: "more interactive with the anatomy skill … turn knobs
 * and things to make it do something … like the stadiums' breakdown"). The first South American Championship (now the Copa
 * América), Argentina, July 1916, won by Uruguay. Anatomy Paper room, one accent: blue.
 *
 * THE TOURNAMENT MACHINE (scene.ts): one bench, three stations; the camera moves between them.
 *  - THE 1916 CUP: turn the CRANK (drag round it, or the arrow keys): the eight-sided fixture drum clicks one face per detent,
 *    each face a real match. Every click plays that match: the flip-tile table's numbers flip and its rows slide into order, and
 *    a thread is pulled between the two teams' pegs on the map plate (six threads: everyone has played everyone). Tap a PEG to
 *    pick out that team's games. Turn back and the tournament runs backwards.
 *  - THE TIMELINE: slide the CARRIAGE along the year rail (drag, or the arrow keys); each continent's first cup drops into its
 *    slot when you reach its year. South America stands alone for 40 years.
 *  - THE TROPHY: LIFT IT APART (a slider, or tap the trophy): the silver cup, the three wooden levels and the winners' plaques,
 *    numbered; tap a number to read about the part.
 * Then the quick check (StepCheck) and the Ending (onComplete once).
 * Heat: one SVG string per frame from paint(); the shared loop (anatomy/paper-loop.ts) runs only while a control is used or
 * something settles (the drum to its detent, tiles flipping, rows sliding, a cup dropping, the camera moving, the trophy lifting)
 * and stops at rest. Reduced motion: every settle lands at once.
 */
type Phase='intro'|'play'|'check';
const ACC=ACCENT.blue;
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
type Drag={kind:'crank';id:number;a:number}|{kind:'carriage';id:number};
const STATIONS:{v:Station;label:string}[]=[{v:'cup',label:'1916 cup'},{v:'line',label:'Timeline'},{v:'trophy',label:'Trophy'}];
type Cam={from:Projection;to:Projection;t:number};
const rowsOf=(played:number)=>{const T=table(played),o={} as Record<Team,number>;T.forEach((r,i)=>o[r.team]=i);return o;};
const ease=(t:number)=>t<.5?2*t*t:1-(-2*t+2)**2/2;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [station,setStation]=useState<Station>('cup');
 const [cardRef,box]=useBox<HTMLDivElement>();
 const svgRef=useRef<SVGSVGElement>(null),modelRef=useRef<SVGGElement>(null),readRef=useRef<HTMLSpanElement>(null);
 const [state,setStateN]=useState(0),[year,setYear]=useState(YEAR0),[apart,setApart]=useState(0);
 const [team,setTeam]=useState<Team|null>(null),[focus,setFocus]=useState<TrophyPart|null>(null);
 const [done,setDone]=useState({cup:false,line:false,trophy:false});
 const [anchors,setAnchors]=useState<Anchors|null>(null);
 const [checked,setChecked]=useState(false),[round,setRound]=useState(0);
 const R=useRef({phi:0,phiT:0,state:0,rows:rowsOf(0),rowsT:rowsOf(0),flips:{} as Record<string,number>,year:YEAR0 as number,yearT:YEAR0 as number,
  drops:Object.fromEntries(CUPS.map(c=>[c.id,0])) as Record<CupId,number>,apart:0,apartT:0,drag:null as Drag|null,cam:null as Cam|null,station:'cup' as Station,
  team:null as Team|null,focus:null as TrophyPart|null,done:{cup:false,line:false,trophy:false}});
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const kd=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeRef.current();}};window.addEventListener('keydown',kd);return()=>window.removeEventListener('keydown',kd);},[]);

 // ── The camera: each station framed in the card; a move between stations eases ─────────────────────────────────────
 const W=box.w||1,Hh=box.h||1,wide=W>=Hh*1.05&&W>=700;
 const projFor=useCallback((st:Station|'all',apartE=0):Projection=>{
  const side=wide&&st==='trophy'?Math.min(300,W*.26)*Math.min(1,apartE*2.5):0,top=wide?36:32,bot=wide?30:26,aw=W-side-12,ah=Hh-top-bot;
  const az=wide?50:st==='line'?26:st==='cup'?18:44,el=wide?30:st==='line'?40:st==='cup'?38:34;
  const P0=fitProjection(stationPoints(st),Math.max(40,aw),Math.max(40,ah),{pad:wide?22:6,azimuth:az,elevation:el});
  return {...P0,origin:[P0.origin[0]+6,P0.origin[1]+top]};
 },[W,Hh,wide]);
 const projRef=useRef<Projection|null>(null);
 const camNow=useCallback(():Projection=>{const V=R.current,c=V.cam,target=projFor(V.station,V.apart);
  if(!c||c.t>=1){V.cam={from:target,to:target,t:1};return target;}
  const u=ease(c.t),m=(a:number,b:number)=>a+(b-a)*u;c.to=target;
  return {origin:[m(c.from.origin[0],c.to.origin[0]),m(c.from.origin[1],c.to.origin[1])],scale:m(c.from.scale,c.to.scale),azimuth:m(c.from.azimuth??45,c.to.azimuth??45),elevation:m(c.from.elevation??30,c.to.elevation??30)};
 },[projFor]);

 const markDone=useCallback((t:'cup'|'line'|'trophy')=>{const D=R.current.done;if(D[t])return;D[t]=true;setDone({...D});sfx(museumSfx.reveal);},[]);
 const paint=useCallback(()=>{
  const el=modelRef.current;if(!el||!box.w)return;const V=R.current,P=camNow();projRef.current=P;
  const cue=phase!=='play'?null:V.station==='cup'&&!V.done.cup?'crank':V.station==='line'&&!V.done.line?'carriage':null;
  const r=render(P,{phi:V.phi,state:V.state,rows:V.rows,flips:V.flips,year:V.year,drops:V.drops,apart:V.apart,focus:V.focus,team:V.team,cue});
  el.innerHTML=r.svg;
  setAnchors(a=>a&&a.crank[0]===r.anchors.crank[0]&&a.crank[1]===r.anchors.crank[1]&&a.carriage[0]===r.anchors.carriage[0]&&a.carriage[1]===r.anchors.carriage[1]&&Object.keys(a.parts).length===Object.keys(r.anchors.parts).length&&V.apart===V.apartT&&V.cam?.t===1?a:r.anchors);
  const played=playedAt(V.state);setYear(Math.round(V.year));
  const t=V.station==='cup'?(V.state>=LAST_STATE?'CHAMPIONS · URUGUAY':`MATCH ${played} OF ${MATCHES_1916.length}`):V.station==='line'?`${Math.round(V.year)} · ${CUPS.filter(c=>c.year<=Math.round(V.year)).length} OF ${CUPS.length} CUPS`:`TROPHY · ${Math.round(V.apart*100)}% APART`;
  if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;
 },[box.w,camNow,phase]);

 /** A new drum state: flip the tiles that change, slide the rows, pull or drop a thread. */
 const toState=useCallback((n:number)=>{const V=R.current;if(n===V.state)return;
  const a=table(playedAt(V.state)),b=table(playedAt(n));
  for(const t of TEAMS){const ra=a.find(x=>x.team===t)!,rb=b.find(x=>x.team===t)!,va=[ra.p,ra.w,ra.d,ra.l,ra.pts],vb=[rb.p,rb.w,rb.d,rb.l,rb.pts];
   va.forEach((v,i)=>{if(v!==vb[i])V.flips[`${t}-${i}`]=reduced?1:0;});}
  V.rowsT=rowsOf(playedAt(n));if(reduced)V.rows={...V.rowsT};
  V.state=n;setStateN(n);
  sfx(n>=LAST_STATE?museumSfx.crowd:n>0&&n<=MATCHES_1916.length?museumSfx.kick:museumSfx.tick);
  if(n>=LAST_STATE)markDone('cup');
 },[reduced,markDone]);

 const loop=usePaperLoop((dt)=>{const V=R.current;let moving=!!V.drag&&!reduced;
  if(reduced){// reduced motion: everything lands at once, one frame
   if(!V.drag)V.phi=V.phiT;V.flips={};V.rows={...V.rowsT};V.year=V.yearT;for(const c of CUPS)V.drops[c.id]=Math.round(V.year)>=c.year?1:0;
   if(V.apart!==V.apartT){V.apart=V.apartT;setApart(V.apart);}if(V.cam)V.cam.t=1;}
  if(V.drag?.kind!=='crank'&&V.phi!==V.phiT){const n=V.phi+(V.phiT-V.phi)*(1-Math.exp(-dt/.09));V.phi=Math.abs(n-V.phiT)<.002?V.phiT:n;moving=true;}
  for(const key of Object.keys(V.flips)){const f=V.flips[key];if(f<1){V.flips[key]=Math.min(1,f+dt/.38);moving=true;}else delete V.flips[key];}
  for(const t of TEAMS){const c=V.rows[t],tg=V.rowsT[t];if(c!==tg){const n=c+(tg-c)*(1-Math.exp(-dt/.12));V.rows[t]=Math.abs(n-tg)<.01?tg:n;moving=true;}}
  if(V.year!==V.yearT){const n=V.year+(V.yearT-V.year)*(1-Math.exp(-dt/.06));V.year=Math.abs(n-V.yearT)<.02?V.yearT:n;moving=true;}
  for(const c of CUPS){const want=Math.round(V.year)>=c.year?1:0,d=V.drops[c.id];
   if(want&&d<1){V.drops[c.id]=Math.min(1,d+dt/.55);moving=true;if(d===0)sfx(c.id==='copa'?museumSfx.reveal:museumSfx.stamp);}else if(!want&&d>0)V.drops[c.id]=0;}
  if(V.apart!==V.apartT){const n=V.apart+(V.apartT-V.apart)*(1-Math.exp(-dt/.2));V.apart=Math.abs(n-V.apartT)<.002?V.apartT:n;moving=true;if(V.apart===V.apartT)setApart(V.apart);}
  if(V.cam&&V.cam.t<1){V.cam.t=Math.min(1,V.cam.t+dt/.6);moving=true;}
  if(Math.round(V.year)>=YEAR1-7&&CUPS.every(c=>V.drops[c.id]>=1))markDone('line');
  if(V.apart>=.9)markDone('trophy');
  paint();
  return moving;},cardRef,reduced);
 const wake=loop.wake;
 useLayoutEffect(()=>{const V=R.current;V.cam=null;paint();},[box.w,box.h]);// a new card size: frame at once
 useLayoutEffect(()=>{paint();},[paint,phase,team,focus,state]);
 useEffect(()=>{R.current.team=team;R.current.focus=focus;},[team,focus]);

 // ── Controls ───────────────────────────────────────────────────────────────────────────────────────────────────────
 const local=(e:{clientX:number;clientY:number})=>{const r=svgRef.current?.getBoundingClientRect();return r?[e.clientX-r.left,e.clientY-r.top] as const:[0,0] as const;};
 const crankAngle=(e:{clientX:number;clientY:number})=>{const P=projRef.current;if(!P||!anchors)return 0;const [x,y]=local(e),dx=x-anchors.crank[0],dy=y-anchors.crank[1];
  const ey=axisVector(P,[0,1,0]),ez=axisVector(P,[0,0,1]),det=ey[0]*ez[1]-ey[1]*ez[0]||1;return Math.atan2((ey[0]*dy-ey[1]*dx)/det,(dx*ez[1]-dy*ez[0])/det);};
 const capture=(e:RPE<Element>)=>{try{svgRef.current?.setPointerCapture?.(e.pointerId);}catch{/* synthetic */}};
 const goStation=(st:Station)=>{const V=R.current;if(V.station===st)return;const from=projRef.current??projFor(V.station,V.apart);V.station=st;setStation(st);
  V.cam={from,to:projFor(st,V.apart),t:reduced?1:0};setFocus(null);sfx(museumSfx.flap);wake();paint();};
 const down=(kind:'crank'|'carriage'|'trophy')=>(e:RPE<Element>)=>{if(phase!=='play')return;e.preventDefault();e.stopPropagation();const V=R.current;
  if(kind==='trophy'){if(V.station!=='trophy'){goStation('trophy');return;}setApartTo(V.apartT>.5?0:1);sfx(museumSfx.reveal);return;}
  if(kind==='crank'&&V.station!=='cup'){goStation('cup');return;}
  if(kind==='carriage'&&V.station!=='line'){goStation('line');return;}
  capture(e);
  if(kind==='crank'){V.drag={kind,id:e.pointerId,a:crankAngle(e)};sfx(museumSfx.turn);}
  else{V.drag={kind,id:e.pointerId};moveCarriage(e);}
  wake();};
 const moveCarriage=(e:{clientX:number;clientY:number})=>{const P=projRef.current;if(!P)return;const [x,y]=local(e),[wx]=toFloor(x,y,P,5);
  const V=R.current;V.yearT=clampYear(Math.round(yearOfX(wx)));if(reduced)V.year=V.yearT;};
 const move=(e:RPE<SVGSVGElement>)=>{const V=R.current,d=V.drag;if(!d||d.id!==e.pointerId)return;
  if(d.kind==='crank'){const a=crankAngle(e);let st=a-d.a;while(st>Math.PI)st-=2*Math.PI;while(st<-Math.PI)st+=2*Math.PI;d.a=a;
   V.phi=clampPhi(V.phi-st);toState(stateAt(V.phi));}
  else moveCarriage(e);
  wake();};
 const up=(e:RPE<SVGSVGElement>)=>{const V=R.current,d=V.drag;if(!d||d.id!==e.pointerId)return;V.drag=null;
  if(d.kind==='crank'){V.phiT=phiOf(stateAt(V.phi));if(reduced)V.phi=V.phiT;}
  wake();};
 const step=(n:number)=>{const V=R.current;const to=Math.max(0,Math.min(LAST_STATE,V.state+n));V.phiT=phiOf(to);if(reduced)V.phi=V.phiT;toState(to);wake();};
 const keyCrank=(e:RKE)=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='Enter'||e.key===' '){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();step(-1);}};
 const keyCarriage=(e:RKE)=>{const m:Record<string,number>={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:10,PageDown:-10},V=R.current;
  if(e.key==='Home'||e.key==='End'){e.preventDefault();V.yearT=e.key==='Home'?YEAR0:YEAR1;}else if(m[e.key]){e.preventDefault();V.yearT=clampYear(Math.round(V.yearT)+m[e.key]);}else return;
  if(reduced)V.year=V.yearT;wake();};
 const keyTrophy=(e:RKE)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setApartTo(R.current.apartT>.5?0:1);}};
 const setApartTo=(x:number,easeIt=true)=>{const V=R.current;V.apartT=Math.max(0,Math.min(1,x));if(!easeIt||reduced){V.apart=V.apartT;setApart(V.apart);}if(V.apartT<.3)setFocus(null);wake();};
 const pickTeam=(t:Team)=>{setTeam(x=>x===t?null:t);sfx(museumSfx.tick);};

 const start=()=>{unlockMuseumAudio();setPhase('play');sfx(museumSfx.whistle);};
 const toCheck=()=>{setPhase('check');sfx(museumSfx.flapBook);};
 const again=()=>{const V=R.current;V.phi=V.phiT=0;V.state=0;V.rows=rowsOf(0);V.rowsT=rowsOf(0);V.flips={};V.year=V.yearT=YEAR0;CUPS.forEach(c=>V.drops[c.id]=0);V.apart=V.apartT=0;
  V.done={cup:false,line:false,trophy:false};V.station='cup';V.cam=null;setDone({...V.done});setStateN(0);setYear(YEAR0);setApart(0);setStation('cup');setTeam(null);setFocus(null);setChecked(false);setRound(n=>n+1);setPhase('play');};
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const canCheck=done.cup&&done.line&&done.trophy;
 const played=playedAt(state),last=played?MATCHES_1916[played-1]:null;
 const showParts=phase==='play'&&station==='trophy'&&apart>.3&&anchors;
 const kk=anchors?.scale??1,hitR=(r:number)=>Math.max(24,r);

 const badgeAt=useMemo(()=>{const out:Partial<Record<TrophyPart,[number,number]>>={};if(!anchors)return out;
  const list=TROPHY_PARTS.map(pt=>({id:pt.id,q:anchors.parts[pt.id]})).filter(x=>x.q) as {id:TrophyPart;q:[number,number]}[];if(!list.length)return out;
  const col=Math.min(W-(wide?Math.min(300,W*.26)+30:22),Math.max(...list.map(x=>x.q[0]))+46);let y=-1e9;
  for(const it of [...list].sort((a,b)=>a.q[1]-b.q[1])){y=Math.max(it.q[1],y+32);out[it.id]=[col,y];}return out;},[anchors,W,wide]);

 const label='A tournament machine on a bench: a fixture drum with a crank, a flip-tile league table and a map plate of South America with four team pegs; a timeline rail with a sliding carriage and six cup slots; and the Copa América trophy on its wooden base.';
 const intro=phase==='intro'&&<IntroPanel kicker={`Real history · ${exhibit.year}`} title={<>The oldest cup <em>for nations</em></>} deck={exhibit.facts[0]} beats={BEATS}/>;
 const check=phase==='check'&&<ScoreCover kicker="Quick check · the oldest cup" score="1916" unit={`first played, ${headStart()} years before the next cup for nations`}
  notes={<><p><b>The first champions.</b> {exhibit.facts[1]}</p><p>{EXTRA.name}</p></>}
  buttons={<button type="button" className={p.ghost} data-play-again onClick={again}>Back to the machine</button>}>
  <StepCheck key={round} items={CHECKS} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
   renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You cranked the 1916 cup match by match, found the oldest cup on the timeline and took the trophy apart." take={exhibit.forYourGame}/>}/>
 </ScoreCover>;

 const railPath=anchors?(()=>{const [a,b]=anchors.rail,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*26,ny=dx/l*26;
  return `M${a[0]+nx} ${a[1]+ny}L${b[0]+nx} ${b[1]+ny}L${b[0]-nx} ${b[1]-ny}L${a[0]-nx} ${a[1]-ny}Z`;})():'';
 const overlay=phase==='play'&&anchors&&<g data-hits>
  <path d={railPath} className={s.hit} data-hit="rail" onPointerDown={down('carriage')} aria-hidden="true"/>
  <circle cx={anchors.carriage[0]} cy={anchors.carriage[1]} r={hitR(12*kk)} className={s.hit} data-hit="carriage" role="slider" tabIndex={0} aria-label="The timeline carriage. Drag it along the rail, or use the arrow keys; Page Up and Page Down jump ten years."
   aria-valuemin={YEAR0} aria-valuemax={YEAR1} aria-valuenow={year} aria-valuetext={railSay(year)} onPointerDown={down('carriage')} onKeyDown={keyCarriage}/>
  <circle cx={anchors.crank[0]} cy={anchors.crank[1]} r={hitR(anchors.crankR*1.5)} className={s.hit} data-hit="crank" role="slider" tabIndex={0} aria-label="The fixture drum's crank. Drag round to turn the drum, one match a click, or use the arrow keys."
   aria-valuemin={0} aria-valuemax={LAST_STATE} aria-valuenow={state} aria-valuetext={last?`${last.date}: ${last.home} ${last.hg}, ${last.away} ${last.ag}`:'Kick-off'} onPointerDown={down('crank')} onKeyDown={keyCrank}/>
  <circle cx={anchors.drum[0]} cy={anchors.drum[1]} r={hitR(18*kk)} className={s.hit} data-hit="drum" onPointerDown={e=>{if(phase!=='play')return;e.stopPropagation();if(R.current.station!=='cup'){goStation('cup');return;}step(1);}} aria-hidden="true"/>
  {TEAMS.map(t=><circle key={t} cx={anchors.pegs[t][0]} cy={anchors.pegs[t][1]} r={hitR(7*kk)} className={s.hit} data-hit="peg" data-peg={t} role="button" tabIndex={0} aria-pressed={team===t}
   aria-label={`${t}'s peg: show ${t}'s three games`} onPointerDown={e=>{e.stopPropagation();if(phase!=='play')return;if(R.current.station!=='cup'){goStation('cup');return;}pickTeam(t);}}
   onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickTeam(t);}}}/>)}
  <circle cx={anchors.trophy[0]} cy={anchors.trophy[1]} r={hitR(24*kk)} className={s.hit} data-hit="trophy" role="button" tabIndex={0} aria-pressed={apart>.5}
   aria-label={apart>.5?'Put the trophy back together':'Lift the trophy apart'} onPointerDown={down('trophy')} onKeyDown={keyTrophy}/>
 </g>;
 const badges=showParts&&<g data-badges>{TROPHY_PARTS.map((pt,i)=>{const q=anchors.parts[pt.id],b=badgeAt[pt.id];if(!q||!b)return null;
  return <g key={pt.id} className={s.badge} data-on={focus===pt.id||undefined} data-part={pt.id} role="button" tabIndex={0} aria-label={`${i+1}: ${pt.name}`} aria-pressed={focus===pt.id}
   onPointerDown={e=>{e.stopPropagation();setFocus(f=>f===pt.id?null:pt.id);sfx(museumSfx.tick);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setFocus(f=>f===pt.id?null:pt.id);}}}>
   <path d={`M${q[0]} ${q[1]}L${b[0]-12} ${b[1]}`}/><circle cx={q[0]} cy={q[1]} r={2.4} className={s.badgeEnd}/>
   <circle cx={b[0]} cy={b[1]} r={22} className={s.badgeHit}/><circle cx={b[0]} cy={b[1]} r={12}/><text x={b[0]} y={b[1]+4.5}>{i+1}</text></g>;})}</g>;

 const say=station==='cup'?(state>=LAST_STATE?<><b>Uruguay are the first champions of South America.</b> Two wins and a draw: 5 points, one more than Argentina. {EXTRA.gradin}</>
   :last?<><b>{last.date}: {last.home} {last.hg}–{last.ag} {last.away}.</b> {last.note??''} {played===MATCHES_1916.length?'All six played: turn once more for the champions.':`Match ${played} of 6.`}{team?` Showing ${team}’s games.`:''}</>
   :<>A round robin: everyone plays everyone once. Four teams, <b>six matches</b>, 2 points a win. <b>Turn the crank</b> to play them.</>)
  :station==='line'?<>{railSay(year)}{year>=1956&&done.line?<> South America was alone for <b>{headStart()} years</b>.</>:year<1916?<> <b>Slide the carriage</b> along the years.</>:null}</>
  :focus?<><b>{TROPHY_PARTS.findIndex(x=>x.id===focus)+1} · {TROPHY_PARTS.find(x=>x.id===focus)!.name}.</b> {TROPHY_PARTS.find(x=>x.id===focus)!.line}</>
  :<>{EXTRA.trophy} <b>Lift it apart</b> to see its parts.</>;

 return <PaperRoom id="copa-america-1916" accent={ACC} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-station':station,'data-state':state,'data-played':played,'data-year':year,'data-apart':apart.toFixed(2),'data-tasks':Object.entries(done).filter(([,v])=>v).map(([k])=>k).join(' '),'data-orient':wide?'wide':'tall','data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Buenos Aires, Argentina</>}/>}
  card={<PaperCard ref={cardRef} className={`${p.card} iso ${s.card}`} fig={`Fig. ${exhibit.year}`} title={station==='cup'?'The 1916 cup':station==='line'?'Cups for nations':'The trophy'}
    hint={phase!=='play'?'The tournament machine':station==='cup'?'Turn the crank · tap a peg':station==='line'?'Slide the carriage':'Lift it apart · tap a number'} readout="MATCH 0 OF 6" readoutRef={readRef} cover={intro||check||null}>
   <div className={s.stage} data-stage>
    {box.w>0&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${Hh}`} width={W} height={Hh} role="img" aria-label={label}
     onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
     <g ref={modelRef} data-model=""/>{overlay}{badges}
    </svg>}
   </div>
   {showParts&&wide&&<div className={s.parts} data-parts data-wide><ol>{TROPHY_PARTS.map((pt,i)=><li key={pt.id}><button type="button" aria-pressed={focus===pt.id} data-part-label={pt.id} onClick={()=>setFocus(f=>f===pt.id?null:pt.id)}>
    <b><i>{i+1}</i>{pt.name}</b><span>{pt.line}</span></button></li>)}</ol></div>}
  </PaperCard>}
  dock={phase==='intro'?<StartDock label="Start the machine" line="Crank through the 1916 cup, slide along the years, lift the trophy apart." onStart={start}/>
  :phase==='play'?<>
   <div className={p.row}>
    <Seg label="Station" value={station} options={STATIONS.map(x=>({v:x.v,label:<span className={s.segIn}>{x.label}{done[x.v]&&<i aria-hidden="true"/>}</span>,aria:`${x.label}${done[x.v]?', done':''}`}))} onChange={goStation}/>
   </div>
   <p className={p.say} aria-live="polite" data-say>{say}</p>
   <div className={p.row}>
    {station==='cup'&&<><button type="button" className={`${p.ghost} ${s.go}`} data-prev-match disabled={state<=0} onClick={()=>step(-1)} aria-label="Turn back one match"><StepIcon kind="prev"/></button>
     <button type="button" className={`${p.ghost} ${s.go}`} data-next-match disabled={state>=LAST_STATE} onClick={()=>step(1)}>{state===0?'Kick off':state>=MATCHES_1916.length?'Champions':'Next match'}<StepIcon kind="next" size={18}/></button></>}
    {station==='line'&&<><button type="button" className={`${p.ghost} ${s.go}`} data-year-back onClick={()=>{R.current.yearT=clampYear(Math.round(R.current.yearT)-10);wake();}} aria-label="Back ten years"><StepIcon kind="prev10"/></button>
     <button type="button" className={`${p.ghost} ${s.go}`} data-year-on onClick={()=>{R.current.yearT=clampYear(Math.round(R.current.yearT)+10);wake();}}>Ten years on<StepIcon kind="next10" size={18}/></button></>}
    {station==='trophy'&&<Slider name="apart" label="Lift it apart" value={Math.round(apart*100)} min={0} max={100} step={1} show={`${Math.round(apart*100)}%`} onChange={x=>{setApart(x/100);setApartTo(x/100,false);}}/>}
    <span className={p.grow}/>
    {!canCheck&&station==='cup'&&done.cup&&<button type="button" className={`${p.btn} ${s.go}`} data-to-line onClick={()=>goStation('line')}>Next: the timeline<StepIcon kind="next"/></button>}
    {!canCheck&&station==='line'&&done.line&&<button type="button" className={`${p.btn} ${s.go}`} data-to-trophy onClick={()=>goStation('trophy')}>Next: the trophy<StepIcon kind="next"/></button>}
    {(canCheck||station==='trophy')&&<button type="button" className={`${p.btn} ${s.go}`} data-tone="acc" data-to-check data-museum-own-cue disabled={!canCheck} onClick={toCheck}>Quick check<StepIcon kind="next"/></button>}
   </div>
  </>:null}>
  <section className={g.section} aria-labelledby="ca-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="ca-story" className={g.h2}>Football grew on every continent</h2>
   <ol className={g.steps}>{[...exhibit.facts,EXTRA.conmebol,EXTRA.gradin,EXTRA.trophy,EXTRA.name,EXTRA.asia,EXTRA.others].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
   <ul className={s.list}>{CUPS.map(c=><li key={c.id}><b>{c.year}</b><span>{c.name}</span><span>{c.host} · won by {c.winner}</span></li>)}</ul>
   <p className={g.small}>{MODEL_NOTE}</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: four team discs joined by the six threads of a round robin, the champion in blue. */
function EndArt(){
 const pts:[number,number][]=[[20,6],[34,20],[20,34],[6,20]];
 return <svg viewBox="0 0 40 40" aria-hidden="true">{pts.flatMap((a,i)=>pts.slice(i+1).map((b,j)=><path key={i+'-'+j} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke="#1d1d1b" strokeWidth=".7"/>))}
  {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4.5" fill={i===0?ACC:'#f6f4ef'} stroke="#1d1d1b" strokeWidth=".8"/>)}</svg>;
}
