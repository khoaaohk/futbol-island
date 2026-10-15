'use client';
import {useEffect,useMemo,useReducer,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import Slider from '../modern/Slider';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {PaperRoom,PaperCard,ScoreCover,Chips,Seg,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,local,toFloor,clamp,follow} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {CHECK,CRITERIA,ERAS,GROUPS,MEN,RECORDS,SHORTLIST,SOURCES,TROPHY,TROPHY_LAYERS,TROPHY_SOURCE,VOTERS,WOMEN,eraWinners,pointsFor,tally,type Group} from './data';
import {CRANK,SEL,Scene,anchors,layoutOf,placeFromAngle,projectionFor,type Ctl,type View} from './Workshop';
import st from './Experience.module.css';

/**
 * ballon-dor · "The Ballon d’Or" (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do something",
 * "more like the stadiums"). Anatomy Paper room, ONE object: the golden ball workshop (Workshop.tsx), a long bench the camera
 * pans along, with three instruments:
 *  1. THE TROPHY on a turntable scale: turn the crank and the ball and its pyrite block spin; the scale reads 15 kg. "Take it
 *     apart" lifts the ball and the block off into labelled layers (brass ball by Mellerio dits Meller; pyrite block, every one
 *     different; 15 kg, about 100 hours by five craftspeople). The needle drops to 0 as they lift.
 *  2. THE TALLY MACHINE: pull the lever, one era a pull (1956 → 2025): the drums roll on the men's awards by position (midfield
 *     and attack 64, defenders 4, goalkeeper 1), the women's drum (since 2018) and the year; the era's plate slides out of the
 *     slot and its winners appear on the card.
 *  3. THE BALLOT DIAL: turn the place selector, the gauge reads one journalist's points (15, 12, 10, 8, 7, 5, 4, 3, 2, 1).
 *  4. Records, the quick check (StepCheck) → Ending → onComplete once; the sources.
 * Names are text only, no photos or likenesses. Heat: React draws the SVG only on a change; the shared Paper loop runs only while
 * the camera pans, the layers or needles ease or the lever/drums/plate move; 0 rAF at rest; reduced motion: instant states.
 */
type Phase='intro'|'trophy'|'tally'|'ballot'|'score';
const ACCENT='#e0a91a';
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
const GROUP_OF=Object.fromEntries(GROUPS.map(x=>[x.id,x])) as Record<Group,(typeof GROUPS)[number]>;
const QUIZ:CheckItem[]=[...CHECK.map(c=>({q:c.q,options:c.options,right:c.right,why:c.why})),
 {q:'One journalist puts a player 1st on their ballot. How many points is that?',options:['15 points','10 points','1 point'],right:0,why:'1st place gets 15 points, then 12, 10, 8, 7, 5, 4, 3, 2 and 1 for 10th.'}];
type Anim={cam:number;camT:number;explode:number;explodeT:number;pull:number;roll:number;plate:number;needle:number;needleB:number;stage:'none'|'pull'|'roll'};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [,bump]=useReducer((n:number)=>n+1,0);
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),readRef=useRef<HTMLSpanElement>(null);
 const [top,setTop]=useState(40);
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k);},[onClose]);

 const [spin,setSpin]=useState(.3),[turned,setTurned]=useState(0),[apart,setApart]=useState(0),[apartSeen,setApartSeen]=useState(false);
 const [pulls,setPulls]=useState(0),[place,setPlace]=useState(1),[placesSeen,setPlacesSeen]=useState<ReadonlySet<number>>(()=>new Set([1])),[checked,setChecked]=useState(false);
 const A=useRef<Anim>({cam:0,camT:0,explode:0,explodeT:0,pull:0,roll:1,plate:0,needle:TROPHY.kg,needleB:pointsFor(1),stage:'none'});
 const station=phase==='tally'?1:phase==='ballot'?2:0;

 const loop=usePaperLoop(dt=>{const a=A.current;let more=false;
  const step=(cur:number,tgt:number,tau:number)=>{const n=follow(cur,tgt,dt,tau,1e-3);if(n!==tgt)more=true;return n;};
  a.cam=step(a.cam,a.camT,.35);a.explode=step(a.explode,a.explodeT,.18);
  a.needle=step(a.needle,a.explode>.08?0:TROPHY.kg,.2);a.needleB=step(a.needleB,pointsFor(place),.14);
  if(a.stage==='pull'){a.pull=Math.min(1,a.pull+dt/.3);if(a.pull>=1){a.stage='roll';a.roll=0;a.plate=0;setPulls(p=>Math.min(ERAS.length,p+1));sfx(museumSfx.stamp);}more=true;}
  else if(a.stage==='roll'){a.pull=Math.max(0,a.pull-dt/.45);a.roll=Math.min(1,a.roll+dt/.55);a.plate=Math.min(1,a.plate+dt/.7);if(a.roll>=1&&a.plate>=1&&a.pull<=0)a.stage='none';else more=true;}
  bump();return more;},stageRef,reduced);
 const kick=()=>loop.wake();

 const go=(p:Phase)=>{unlockMuseumAudio();setPhase(p);const i=p==='tally'?1:p==='ballot'?2:0;A.current.camT=i;if(p!=='trophy'){A.current.explodeT=0;setApart(0);}sfx(museumSfx.flap);kick();};
 const setExplode=(v:number)=>{setApart(v);A.current.explodeT=v;if(v>.6&&!apartSeen){setApartSeen(true);sfx(museumSfx.reveal);}kick();};
 const turnTo=(a:number)=>{const d=Math.atan2(Math.sin(a-spin),Math.cos(a-spin));if(Math.abs(d)<1e-4)return;
  if(Math.floor((spin+d)/(Math.PI/4))!==Math.floor(spin/(Math.PI/4)))sfx(museumSfx.tick);setSpin(spin+d);setTurned(t=>t+Math.abs(d));};
 const pullLever=()=>{const a=A.current;if(a.stage!=='none')return;unlockMuseumAudio();if(pulls>=ERAS.length){sfx(museumSfx.look);return;}a.stage='pull';sfx(museumSfx.click);kick();};
 const resetTally=()=>{setPulls(0);A.current.plate=0;A.current.roll=1;sfx(museumSfx.flap);bump();};
 const choosePlace=(p:number)=>{if(p===place)return;setPlace(p);setPlacesSeen(x=>new Set(x).add(p));sfx(museumSfx.tick);kick();};

 // ── The camera and the controls ──
 const L=box.w?layoutOf(box.w,box.h):null,side=L?.wide&&box.w>=1140&&phase!=='intro'&&phase!=='score'?Math.min(440,box.w*.3):0;
 const P=box.w?projectionFor(box.w,box.h,A.current.cam,A.current.explode,top,28,side):null;
 useEffect(()=>{setTop(cardRef.current?.querySelector('[data-paper-note]')?noteSpace(cardRef.current,40):40);},[phase,box.w,box.h,pulls,cardRef]);
 const drag=useRef<{c:Ctl;id:number;y:number}|null>(null);
 const floorAt=(e:{clientX:number;clientY:number},z:number):[number,number]|null=>{const el=stageRef.current;if(!P||!el)return null;const [sx,sy]=local(e,el);return toFloor(sx,sy,P,z);};
 const dragTo=(c:Ctl,e:{clientX:number;clientY:number})=>{
  if(c==='crank'){const p=floorAt(e,40);if(p)turnTo(Math.atan2(p[0]-CRANK[0],p[1]-CRANK[1]));}
  else if(c==='place'){const p=floorAt(e,38);if(p)choosePlace(placeFromAngle(Math.atan2(p[0]-SEL[0],p[1]-SEL[1])));}
  else if(c==='lever'&&drag.current){const dy=e.clientY-drag.current.y;if(dy>30){drag.current=null;pullLever();}}
 };
 const onCtlDown=(c:Ctl,e:RPointerEvent<SVGElement>)=>{e.stopPropagation();unlockMuseumAudio();drag.current={c,id:e.pointerId,y:e.clientY};
  try{stageRef.current?.setPointerCapture(e.pointerId);}catch{/* fine */}if(c!=='lever')dragTo(c,e);};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;dragTo(d.c,e);};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;if(d.c==='lever')pullLever();};
 const onCtlKey=(c:Ctl,e:KeyboardEvent<SVGElement>)=>{const k=e.key,up=k==='ArrowUp'||k==='ArrowRight',dn=k==='ArrowDown'||k==='ArrowLeft';
  if(c==='lever'&&(k==='Enter'||k===' '||k==='ArrowDown')){e.preventDefault();pullLever();return;}
  if(!up&&!dn)return;e.preventDefault();const d=up?1:-1;
  if(c==='crank'){const n=spin+d*Math.PI/8;setSpin(n);setTurned(t=>t+Math.PI/8);sfx(museumSfx.tick);}
  else if(c==='place')choosePlace(clamp(place+d,1,10));};

 const a=A.current,T=tally(pulls);
 const view:View={station:a.cam,spin,explode:a.explode,pulls,pull:a.pull,roll:a.roll,plate:a.plate,place,needle:a.needle,needleB:a.needleB};
 useEffect(()=>{const t=phase==='tally'?(pulls?`${ERAS[pulls-1].label} · ${T.mf+T.df+T.gk} MEN · ${T.women} WOMEN`:'PULL THE LEVER')
  :phase==='ballot'?`PLACE ${place} · ${pointsFor(place)} POINTS`:`${Math.round(a.needle)} KG · ${Math.round(((spin*180/Math.PI)%360+360)%360)}°`;
  if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;});

 // The exploded trophy's labels.
 const showLabels=phase==='trophy'&&a.explode>.45&&P;
 const labels=useMemo(()=>{if(!showLabels||!P)return null;const an=anchors(view,P),wide=!!L?.wide,lw=wide?270:170;
  const list=TROPHY_LAYERS.map(l=>{const at=an[l.id],lines=Math.ceil(l.text.length*(wide?6.4:6)/(lw-20));
   return {...l,at,x:wide?box.w-lw-24:at[0]>box.w*.5?8:box.w-lw-8,y:at[1]-20,lw,h:(wide?34:30)+lines*(wide?17.5:15.5)};}).sort((p,q)=>p.y-q.y);
  let floor=top+4;for(const l of list){l.y=Math.max(l.y,floor);floor=l.y+l.h+6;}const over=floor-(box.h-30);if(over>0)for(const l of list)l.y-=over;return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[showLabels,P?.scale,P?.origin[0],P?.origin[1],a.explode,box.w,box.h,top,L?.wide]);

 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES,TROPHY_SOURCE].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const era=pulls?eraWinners(pulls-1):null;

 const note=phase==='trophy'?<><span className={s.tag} data-tone="acc">The trophy</span>{exhibit.facts[0]} <b>Turn the crank</b>, then <b>take it apart</b>.</>
  :phase==='tally'?(era?<div className={st.plate} data-bdo-era={ERAS[pulls-1].label}><span className={s.tag} data-tone="acc">{ERAS[pulls-1].label}</span>
    <ul>{[...era.men.map(w=>({...w,women:false})),...era.women.map(w=>({...w,women:true}))].map(w=><li key={w.year+w.name} data-g={w.group} data-women={w.women||undefined}>
     <b>{w.year}</b>{w.name}{w.group!=='mf'&&<em>{GROUP_OF[w.group].label}</em>}{w.women&&<em>Women’s</em>}</li>)}</ul>
    {ERAS[pulls-1].to>=2020&&<small>No award in 2020.</small>}</div>
   :<><span className={s.tag} data-tone="acc">The tally machine</span>Who wins it? <b>Pull the lever</b> to count the winners by position, one era at a time.</>)
  :phase==='ballot'?<><span className={s.tag} data-tone="acc">The vote</span>Since 2022, {VOTERS} journalists, one from each of the top 100 countries in the FIFA ranking, each pick a top 10 from a list of {SHORTLIST}. <b>Turn the dial</b> to see the points.</>
  :null;
 const cover=phase==='intro'?<IntroPanel kicker={<>Legends · {exhibit.year}</>} title={<>The <em>golden ball</em> workshop</>} deck={exhibit.facts[0]}
   beats={[{when:'1956',head:'The first one',text:'France Football gives it to Stanley Matthews of England.'},{when:'1995',head:'Open to more players',text:'Any player at a European club can win it. Since 2007, any player in the world.'},
    {when:'2018',head:'The women’s award',text:'Ada Hegerberg of Norway wins the first one.'},{when:'2025',head:'70 years on',text:'Ousmane Dembélé and Aitana Bonmatí win it.'}]}/>
  :phase==='score'?<ScoreCover kicker="The Ballon d’Or · 1956 to 2025" score={MEN.length+WOMEN.length} unit={`awards counted: ${MEN.length} men’s, ${WOMEN.length} women’s`}
    notes={<><ul className={st.records}>{RECORDS.map(r=><li key={r.label}><b>{r.n}</b><span>{r.label}</span></li>)}</ul><p>{exhibit.facts[4]}</p></>}
    buttons={<button type="button" className={s.ghost} data-bdo-again onClick={()=>go('trophy')}>Back to the workshop</button>}>
    <StepCheck items={QUIZ} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={o=>sfx(o?museumSfx.stamp:museumSfx.look)} onDone={()=>{setChecked(true);sfx(museumSfx.reveal);}} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You took the golden ball apart, counted every winner and worked the vote." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const stations=<Seg label="Stations" value={phase==='tally'?'tally':phase==='ballot'?'ballot':'trophy'} onChange={v=>go(v)}
  options={[{v:'trophy',label:'Trophy'},{v:'tally',label:'Tally'},{v:'ballot',label:'Vote'}]}/>;
 const dock=phase==='intro'?<StartDock label="Open the workshop" line="Spin the trophy, take it apart, pull the tally lever and work the vote." onStart={()=>{unlockMuseumAudio();sfx(museumSfx.reveal);go('trophy');}}/>
  :phase==='trophy'?<>
   <div className={s.row}>{stations}<span className={s.grow}><Slider name="apart" label="Take it apart" value={Math.round(apart*100)} min={0} max={100} onChange={v=>setExplode(v/100)} show={`${Math.round(a.needle)} kg on the scale`}/></span></div>
   <div className={s.row}><button type="button" className={s.btn} data-tone="acc" data-bdo-next="tally" disabled={!apartSeen} onClick={()=>go('tally')}>Next: count the winners</button>
    <p className={`${s.say} ${s.grow}`}>{!apartSeen?(turned<Math.PI?'Drag the crank round to spin the ball.':'Now pull the slider: take the trophy apart.'):'Made in Paris, about 100 hours of work, 15 kg.'}</p></div></>
  :phase==='tally'?<>
   <div className={s.row}>{stations}<span className={s.grow}><Chips items={[{k:'mf',label:'Att · mid',value:T.mf},{k:'df',label:'Defenders',value:T.df},{k:'gk',label:'Goalkeeper',value:T.gk},{k:'w',label:'Women’s',value:T.women}]}/></span></div>
   <div className={s.row}>
    {pulls<ERAS.length?<button type="button" className={s.btn} data-tone="acc" data-bdo-pull onClick={pullLever}>Pull the lever</button>
     :<button type="button" className={s.btn} data-tone="acc" data-bdo-next="ballot" onClick={()=>go('ballot')}>Next: the vote</button>}
    {pulls>0&&<button type="button" className={s.ghost} data-bdo-reset onClick={resetTally}>Reset</button>}
    <p className={`${s.say} ${s.grow}`}>{pulls<ERAS.length?(pulls?`Era ${pulls} of ${ERAS.length}.`:`${ERAS.length} eras to count, 1956 to 2025.`):`${T.mf} awards to midfielders and attackers, ${T.df} to defenders, ${T.gk} to a goalkeeper: Lev Yashin. Every position can be great.`}</p></div></>
  :phase==='ballot'?<>
   <div className={s.row}>{stations}<span className={s.grow}><Slider name="place" label="Place on the ballot" value={place} min={1} max={10} onChange={choosePlace} show={`${place}${place===1?'st':place===2?'nd':place===3?'rd':'th'} · ${pointsFor(place)} pts`}/></span></div>
   <ol className={st.criteria} aria-label="What the voters look for">{CRITERIA.map((c,i)=><li key={c}><i>{i+1}</i>{c}</li>)}</ol>
   <div className={s.row}><button type="button" className={s.btn} data-tone="acc" data-bdo-finish disabled={placesSeen.size<3} onClick={()=>{sfx(museumSfx.crowd);setPhase('score');}}>See the records</button>
    <p className={`${s.say} ${s.grow}`}>{placesSeen.size<3?'Turn the dial to three places.':'The player with the most points from all 100 ballots wins.'}</p></div></>
  :null;

 return <PaperRoom id="ballon-dor" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-station':station,'data-pulls':pulls,'data-place':place,'data-apart':apartSeen||undefined,'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · France Football, Paris</>}/>}
  card={<PaperCard ref={cardRef} fig={`Fig. ${exhibit.year}`} title={phase==='tally'?'The tally machine':phase==='ballot'?'The ballot dial':'The golden ball'} readoutRef={readRef} readout=""
   hint={phase==='tally'?'Pull the lever':phase==='ballot'?'Turn the place dial':'Turn the crank · take it apart'} note={note} cover={cover} data-wide-note>
   <div ref={stageRef} className={s.stage} role="application" aria-label={phase==='tally'?`The tally machine. Men’s awards to ${T.year||'now'}: ${T.mf} midfield and attack, ${T.df} defenders, ${T.gk} goalkeeper. Women’s: ${T.women}.`
    :phase==='ballot'?`The ballot dial: place ${place} gives ${pointsFor(place)} points.`:`The trophy on a turntable scale: ${Math.round(a.needle)} kg.`}
    onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    {P&&<Scene w={box.w} h={box.h} P={P} v={view} onCtlDown={onCtlDown} onCtlKey={onCtlKey}/>}
   </div>
   {labels&&<div className={st.labels} style={{opacity:Math.min(1,(a.explode-.45)*3)}}>
    <svg className={st.leaders} aria-hidden="true">{labels.map(l=><g key={l.id}><path d={`M${l.at[0]} ${l.at[1]}L${l.x+(l.x>l.at[0]?0:l.lw)} ${l.y+18}`}/><circle cx={l.at[0]} cy={l.at[1]} r={3}/></g>)}</svg>
    {labels.map(l=><div key={l.id} className={st.label} data-layer={l.id} style={{left:l.x,top:l.y,width:l.lw}}><b><i>{l.n}</i>{l.head}</b><span>{l.text}</span></div>)}</div>}
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="bdo-story">
   <p className={g.kicker}>Football’s best-known prize for one player</p>
   <h2 id="bdo-story" className={g.h2}>The golden ball</h2>
   <ol className={g.steps}>{exhibit.facts.map((t,i)=><li key={t}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{t}</p></li>)}</ol>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>Winners up to 2025. The 2026 award is presented on 26 October 2026. The workshop is a model made for this museum; the names are text only.</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

function EndArt(){
 return <svg viewBox="0 0 120 90" aria-hidden="true"><ellipse cx="60" cy="82" rx="34" ry="5" fill="rgba(29,29,27,.12)"/>
  <path d="M40 80L46 62L74 62L80 80Z" fill="#b3a37a" stroke="#1d1d1b" strokeWidth="1"/>
  <circle cx="60" cy="38" r="26" fill={ACCENT} stroke="#7a5a12" strokeWidth="1.2"/><path d="M60 26l9 6.5-3.4 10.5h-11.2L51 32.5z" fill="none" stroke="#7a5a12" strokeWidth="1.2"/></svg>;
}
