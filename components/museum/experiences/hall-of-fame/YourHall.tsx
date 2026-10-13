'use client';
import {useCallback,useState} from 'react';
import {GRAD_TITLES} from '@/lib/endgame/graduationModel';
import type {CertificateId} from '@/lib/endgame/certificate';
import {museumSfx} from '@/lib/museum/museumSound';
import {COPY,IDEAS,PLINTHS,ferryLine,nextStep,type Plinth} from './hallData';
import type {PathProgress} from './progress';
import {hallScene} from './plinths';
import {Sized} from './Draw';
import s from './Experience.module.css';

/**
 * Your Hall (Oct 12 2026, anatomy restyle): the player's own trophy room as an isometric model. Four plinths step up on one long
 * plate (futsal → 7v7 → 9v9 → 11v11: the spaces grow); a graduated path carries a turned cup. Pick a plinth (the tabs under the
 * model, or the arrow keys) and the panel says what it holds: the certificate (opened by the host) once graduated, or what to do
 * next and the lesson count until then. "Same idea, different space" lights up where each big idea comes back in every path.
 * The ferry line closes the room in the case's own words. Static drawing, rebuilt only when the selection changes.
 */
const sfx=(c:'click'|'reveal'|'look')=>{try{museumSfx[c]();}catch{/* sound is optional */}};

export default function YourHall({earned,progress,openCert}:{earned:ReadonlySet<CertificateId>;progress:Record<string,PathProgress>;openCert:(id:CertificateId)=>void}){
 const won=useCallback((p:Plinth)=>earned.has(`grad:${p.format}`),[earned]);
 const count=PLINTHS.filter(won).length,champion=earned.has('diploma'),next=PLINTHS.findIndex(p=>!won(p));
 const ids=[...PLINTHS.map(p=>'p:'+p.format),'ferry'];
 const [sel,setSel]=useState<string>('p:'+PLINTHS[Math.max(0,next)].format),[idea,setIdea]=useState<string|null>(null);
 const selIndex=PLINTHS.findIndex(p=>'p:'+p.format===sel);
 const flags=PLINTHS.map(won).join(',');
 const build=useCallback((w:number,h:number)=>hallScene(w,h,flags.split(',').map(f=>f==='true'),selIndex),[flags,selIndex]);
 const p=PLINTHS.find(x=>'p:'+x.format===sel)??null,chosen=IDEAS.find(i=>i.id===idea)??null;
 const pr=(x:Plinth)=>progress[x.format]??{done:0,total:12,names:{}};
 const key=(e:React.KeyboardEvent)=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();const i=(ids.indexOf(sel)+d+ids.length)%ids.length;setSel(ids[i]);sfx('look');};

 return <div className={s.yours} data-hof-yours={count}>
  <div className={s.yoursHead}><p className={s.kicker}>Your Hall · {count} of 4 graduated</p><h2 className={s.h2}>Four paths, one hall</h2>
   <p className={s.muted}>Futsal, 7v7, 9v9 and 11v11: the plinths step up as the spaces grow.</p></div>
  <div className={s.hallCard}>
   <Sized className={s.hallArt} label={`Your trophy room: four plinths from futsal to 11v11, ${count} of 4 with a cup. Selected: ${p?p.name:'the ferry'}.`} build={build}/>
   <div className={s.tabs} role="tablist" aria-label="Plinths" onKeyDown={key}>
    {PLINTHS.map(x=><button key={x.format} type="button" role="tab" aria-selected={sel==='p:'+x.format} data-earned={won(x)||undefined} onClick={()=>{sfx('look');setSel('p:'+x.format);}}>
     <b>{x.name}</b><small>{won(x)?'Graduated':`${pr(x).done}/${pr(x).total} lessons`}</small></button>)}
    <button type="button" role="tab" aria-selected={sel==='ferry'} onClick={()=>{sfx('look');setSel('ferry');}}><b>Ferry</b><small>{count}/4 paths</small></button>
   </div>
  </div>
  <div className={s.yoursGrid}>
   {p?<div className={s.panel} data-hof-plinth={p.format} data-earned={won(p)||undefined}>
     <p className={s.panelHead}><b>{p.name}</b><span>{p.aSide} a side · {p.place}</span></p>
     {chosen?<p className={s.body}><b>{chosen.label}: </b>in this path, “{pr(p).names[chosen.lessons[p.format]]??chosen.lessons[p.format]}”.</p>
      :won(p)?<p className={s.body}><b>Graduated!</b> Your {GRAD_TITLES[p.format]} certificate hangs here.</p>:<p className={s.body}>{nextStep(p.name,pr(p).done,pr(p).total)}</p>}
     {won(p)?<div className={s.row}><button type="button" className={s.btn} data-hof-cert={p.format} onClick={()=>{sfx('reveal');openCert(`grad:${p.format}`);}}>Open certificate</button></div>
      :<div className={s.bar} role="img" aria-label={`${pr(p).done} of ${pr(p).total} starter lessons done`}><i style={{transform:`scaleX(${pr(p).total?pr(p).done/pr(p).total:0})`}}/><span>{pr(p).done} of {pr(p).total} lessons</span></div>}
    </div>
    :<div className={s.panel} data-hof-plinth="ferry"><p className={s.panelHead}><b>The Matchday Ferry</b><span>{count}/4 paths</span></p>
     <p className={s.body}>The ferry sails once every path is graduated: futsal, 7v7, 9v9 and 11v11.</p>
     {champion&&<div className={s.row}><button type="button" className={s.btn} onClick={()=>{sfx('reveal');openCert('diploma');}}>Open your Island Diploma</button></div>}</div>}
   <div className={s.ideas}>
    <p className={s.ideasHead}><b>{COPY.ideasTitle}</b> {chosen?chosen.why:COPY.ideasHint}</p>
    <div className={s.chips} role="group" aria-label="Big ideas">{IDEAS.map(x=><button key={x.id} type="button" className={s.chip} aria-pressed={idea===x.id} data-hof-idea={x.id} onClick={()=>{sfx('click');setIdea(idea===x.id?null:x.id);}}>{x.label}</button>)}</div>
    <p className={s.takeaway}>{COPY.takeaway}</p>
    <p className={s.ferry} data-hof-ferry={count}>{champion?COPY.champion:ferryLine(count)}{count<4&&<> {COPY.fact2}</>}</p>
   </div>
  </div>
 </div>;
}
