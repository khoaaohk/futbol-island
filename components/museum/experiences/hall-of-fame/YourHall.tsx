'use client';
import {useState} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots,FaceText} from '../anatomy/draw';
import {GRAD_TITLES,type GradFormat} from '@/lib/endgame/graduationModel';
import type {CertificateId} from '@/lib/endgame/certificate';
import {museumSfx} from '@/lib/museum/museumSound';
import {COPY,IDEAS,PLINTHS,ferryLine,nextStep,type Plinth} from './hallData';
import type {PathProgress} from './progress';
import {ACCENT,KID_CUP,Puck,TrophyArt,poseAt,type Box} from './scene';
import s from './Experience.module.css';

/**
 * Your shelf (Oct 12 2026, the Trophy room; it was the Hall of Fame's plinths): the cabinet's own shelf for the player. One spot
 * per path, futsal → 7v7 → 9v9 → 11v11, and one for the Island Diploma. A graduated path stands a yellow cup on its puck with
 * its certificate framed behind it (opened by the host, lib/endgame); a spot still to earn keeps its engraved label, an empty
 * puck and what to do next. Static drawing (no loop): it is redrawn only when the selection or the earned set changes.
 */
export type SpotId=GradFormat|'diploma';
export const SPOTS:readonly SpotId[]=['futsal','7v7','9v9','11v11','diploma'];
const SPACE=40,SD=40,SH=50,WALL=3;
/** Wide: one long shelf. Tall (a phone): two shelves, three spots over two. */
export function shelf(tall:boolean){
 const rows=tall?[SPOTS.slice(0,3),SPOTS.slice(3)]:[SPOTS];
 const cols=Math.max(...rows.map(r=>r.length)),EDGE_ROOM=7,W=WALL*2+cols*SPACE+EDGE_ROOM*2;
 const spot=(id:SpotId)=>{const r=rows.findIndex(x=>x.includes(id)),i=rows[r].indexOf(id),n=rows[r].length,row=rows.length-1-r;
  return {x:WALL+EDGE_ROOM+(cols-n)*SPACE/2+i*SPACE+SPACE/2,y:SD/2+3,z:10+row*(SH+3)+3,row};};
 const top=10+rows.length*(SH+3)+3;
 return {rows,W,top,spot,points:k.boxCorners({x:-4,y:-2,w:W+8,d:SD+8,r:0},-6,top+6)};
}
export function Shelf({P,tall,earned,sel,onPick}:{P:k.Projection;tall:boolean;earned:ReadonlySet<SpotId>;sel:SpotId;onPick:(id:SpotId)=>void}){
 const S=shelf(tall),W=S.W,nRows=S.rows.length;
 return <g data-hof-yours-art="">
  <path className="iso-halo" d={k.slabOf({x:0,y:0,w:W,d:SD+6,r:2},-4,S.top,P).fill}/>
  <Solid paths={k.slabOf({x:0,y:0,w:W,d:SD+6,r:1},0,10,P,4,1)} tone="mid" inner={<Line d={k.sideSeam({x:0,y:0,w:W,d:SD+6,r:1},6,P,4)} tone="faint"/>}/>
  <Solid paths={k.slabOf({x:0,y:0,w:W,d:3,r:0},10,S.top-10,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:0,y:0,w:WALL,d:SD+6,r:0},10,S.top-10,P,1)} tone="mid"/>
  {Array.from({length:nRows},(_,row)=>{const z0=10+row*(SH+3),ids=S.rows[nRows-1-row];
   return <g key={row}>
    <Solid paths={k.slabOf({x:WALL,y:3,w:W-WALL*2,d:SD+3,r:0},z0,3,P,1)} tone="mid"/>
    <Line d={Array.from({length:ids.length*2+1},(_,i)=>{const x=WALL+4+i*(W-WALL*2-8)/(ids.length*2);return k.segment([x,3,z0+4],[x,3,z0+SH-1],P);}).join('')} tone="faint"/>
    {ids.map(id=>{const p=S.spot(id),has=earned.has(id),on=sel===id,name=id==='diploma'?'DIPLOMA':id.toUpperCase();
     return <g key={id} data-spot={id} data-earned={has||undefined} data-sel={on||undefined}>
      {has?<Certificate x={p.x} y={6} z={p.z} P={P} big={id==='diploma'}/>:<EmptyFrame x={p.x} y={6} z={p.z} P={P}/>}
      <Puck x={p.x} y={p.y+2} z={p.z} r={8.5} P={P}/>
      {on&&<Line d={k.ring(p.x,p.y+2,10.4,p.z+.1,P,48)} tone="hi"/>}
      {on&&<path d={k.pathOf(k.circleRing(p.x,p.y+2,10.4,48).map(([x,y])=>k.iso([x,y,p.z+.1],P)),true)} fill="none" stroke={ACCENT} strokeWidth={2}/>}
      {has?<TrophyArt t={KID_CUP} pose={poseAt(P,p.x,p.y+2,p.z+1.6,.6)}/>:<Line d={k.ring(p.x,p.y+2,5.6,p.z+1.6,P,40)} tone="lo"/>}
      <Tag x={p.x} z={p.z} P={P} lit={has} text={name}/>
     </g>;})}
   </g>;})}
  <Solid paths={k.slabOf({x:WALL,y:3,w:W-WALL*2,d:SD+3,r:0},S.top-3,3,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:W-WALL,y:0,w:WALL,d:SD+6,r:0},10,S.top-10,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:-2,y:-2,w:W+4,d:SD+10,r:1.5},S.top,4,P,4,.8)} tone="mid"/>
  {/* hit areas over each spot (the whole bay) */}
  {SPOTS.map(id=>{const p=S.spot(id),a=k.iso([p.x-SPACE/2+2,SD+6,p.z],P),b=k.iso([p.x+SPACE/2-2,3,p.z+SH-4],P);
   return <rect key={id} x={Math.min(a[0],b[0])} y={Math.min(a[1],b[1])} width={Math.abs(b[0]-a[0])} height={Math.abs(b[1]-a[1])} fill="transparent" className={s.hit}
    data-hof-plinth={id} role="button" tabIndex={-1} aria-label={id} onClick={()=>onPick(id)}/>;})}
 </g>;
}
/** A framed certificate standing at the back of the spot: frame, paper, three rule lines for the words, the yellow seal. */
function Certificate({x,y,z,P,big}:{x:number;y:number;z:number;P:k.Projection;big:boolean}){
 const w=big?34:28,h=big?40:34,x0=x-w/2,f=y+3.4,q=(u:number,v:number)=>k.iso([x0+u,f,z+v],P);
 return <g data-cert="">
  <Solid paths={k.slabOf({x:x0+3,y:y+3.4,w:w-6,d:8,r:.6},z,1.2,P,2)} tone="mid"/>
  <Solid paths={k.slabOf({x:x0,y,w,d:3.4,r:.5},z+1.2,h,P,2,.5)} tone="hi"/>
  <path d={k.pathOf([q(3,4),q(w-3,4),q(w-3,h-2.4),q(3,h-2.4)],true)} fill="#fbfbf8" stroke="var(--anatomy-mid)" strokeWidth={.7}/>
  <path d={k.pathOf([q(4.6,5.6),q(w-4.6,5.6),q(w-4.6,h-4),q(4.6,h-4)],true)} fill="none" stroke="var(--anatomy-faint)" strokeWidth={.7}/>
  {[h-10,h-14.5,h-18].map((v,i)=><Line key={i} d={k.pathOf([q(8,v),q(w-8-i*4,v)])} tone={i?'lo':'mid'} free/>)}
  <circle cx={q(w-7.5,8.5)[0]} cy={q(w-7.5,8.5)[1]} r={Math.max(2.4,kp(P)*2.2)} fill={ACCENT} stroke="var(--anatomy-hi)" strokeWidth={.7}/>
  <Dots points={[q(1.6,1.6),q(w-1.6,1.6),q(1.6,h-.6),q(w-1.6,h-.6)]} size={.55} tone="hi"/>
 </g>;
}
const kp=(P:k.Projection)=>k.cameraOf(P).k;
/** A spot still to earn: the outline on the back panel where its certificate will stand, and the nail waiting for it. */
function EmptyFrame({x,z,P}:{x:number;y:number;z:number;P:k.Projection}){
 const q=(u:number,v:number)=>k.iso([x+u,3.1,z+v],P);
 return <g data-empty="">
  <Line d={k.pathOf([q(-14,2),q(14,2),q(14,36),q(-14,36)],true)} tone="lo"/>
  <Line d={k.pathOf([q(-11,5),q(11,5),q(11,33),q(-11,33)],true)} tone="faint"/>
  <Dots points={[q(0,39)]} size={1.1} tone="hi"/>
 </g>;
}
/** The engraved tag hanging on the shelf's front edge under a spot: its name, and a yellow dot once it's earned. */
function Tag({x,z,P,lit,text}:{x:number;z:number;P:k.Projection;lit:boolean;text:string}){
 const y=SD+6;
 return <g data-tag={text}>
  <Solid paths={k.slabOf({x:x-13,y,w:26,d:.8,r:.3},z-8.6,8,P,2)} tone="mid" lit={lit}/>
  <FaceText transform={k.sideMatrix([x-2,y+.8],z-3.1,P,'left')} size={3.6} tone="hi" anchor="middle">{text}</FaceText>
  {lit&&<circle cx={k.iso([x+9.5,y+.8,z-4.6],P)[0]} cy={k.iso([x+9.5,y+.8,z-4.6],P)[1]} r={Math.max(2,kp(P)*1.5)} fill={ACCENT} stroke="var(--anatomy-hi)" strokeWidth={.6}/>}
  <Dots points={[k.iso([x-11.4,y+.8,z-1.6],P),k.iso([x+11.4,y+.8,z-1.6],P)]} size={.5} tone="hi"/>
 </g>;
}

/** The note for the selected spot: what it holds and the certificate (opened by the host), or what to do next. */
export function ShelfNote({id,earned,progress,openCert}:{id:SpotId;earned:ReadonlySet<SpotId>;progress:Record<string,PathProgress>;openCert:(id:CertificateId)=>void}){
 const count=PLINTHS.filter(p=>earned.has(p.format)).length;
 if(id==='diploma')return <div data-hof-plinth-note="ferry">
  <p className={s.noteKicker}>Your shelf · the Island Diploma</p><h2 className={s.noteTitle}>The Matchday Ferry</h2>
  <p className={s.noteBody}>{earned.has('diploma')?COPY.champion:ferryLine(count)}</p>
  {earned.has('diploma')&&<button type="button" className={s.btn} onClick={()=>openCert('diploma')}>Open your Island Diploma</button>}
 </div>;
 const p=PLINTHS.find(x=>x.format===id) as Plinth,pr=progress[p.format]??{done:0,total:12,names:{}},has=earned.has(p.format);
 return <div data-hof-plinth-note={p.format} data-earned={has||undefined}>
  <p className={s.noteKicker}>Your shelf · {p.aSide} a side · {p.place}</p><h2 className={s.noteTitle}>{p.name}</h2>
  {has?<><p className={s.noteBody}><b>Graduated!</b> Your {GRAD_TITLES[p.format]} cup stands here and its certificate hangs behind it.</p>
    <button type="button" className={s.btn} data-hof-cert={p.format} onClick={()=>openCert(`grad:${p.format}`)}>Open certificate</button></>
   :<><p className={s.noteBody}>This spot is waiting for you. {nextStep(p.name,pr.done,pr.total)}</p>
    <div className={s.bar} role="img" aria-label={`${pr.done} of ${pr.total} starter lessons done`}><i style={{transform:`scaleX(${pr.total?pr.done/pr.total:0})`}}/><span>{pr.done} of {pr.total} lessons</span></div></>}
 </div>;
}

/** Below the fold: the same big ideas in every path, the takeaway and the ferry line (the case's words). */
export function Ideas({progress,earned}:{progress:Record<string,PathProgress>;earned:ReadonlySet<SpotId>}){
 const [idea,setIdea]=useState<string|null>(null),chosen=IDEAS.find(i=>i.id===idea)??null,count=PLINTHS.filter(p=>earned.has(p.format)).length;
 return <div className={s.ideas} data-hof-yours={count}>
  <p className={s.kicker}>Your shelf · {count} of 4 graduated</p>
  <h2 className={s.h2}>{COPY.ideasTitle}</h2>
  <p className={s.muted}>{chosen?chosen.why:COPY.ideasHint}</p>
  <div className={s.chips} role="group" aria-label="Big ideas">{IDEAS.map(x=><button key={x.id} type="button" className={s.chip} aria-pressed={idea===x.id} data-hof-idea={x.id}
   onClick={()=>{try{museumSfx.click();}catch{/* sound is optional */}setIdea(idea===x.id?null:x.id);}}>{x.label}</button>)}</div>
  {chosen&&<ul className={s.ideaList}>{PLINTHS.map(p=><li key={p.format}><b>{p.name}</b> “{progress[p.format]?.names[chosen.lessons[p.format]]??chosen.lessons[p.format]}”</li>)}</ul>}
  <p className={s.takeaway}>{COPY.takeaway}</p>
  <p className={s.ferry} data-hof-ferry={count}>{earned.has('diploma')?COPY.champion:ferryLine(count)}{count<4&&<> {COPY.fact2}</>}</p>
 </div>;
}
export type {Box};
