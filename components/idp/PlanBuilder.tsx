'use client';
/**
 * Making the plan together (docs/idp/DESIGN.md §2.1): three short steps at a 7v7 reading level.
 *   1 "What do you love doing?"      a strength first (self-determination: competence before challenge)
 *   2 "Pick one or two things"        "I can…" goals across the four corners, with pictures
 *   3 "Who helped you choose?"        me / me and my coach / me and a grown-up (the plan is co-created, never assigned)
 */
import {useState,type CSSProperties} from 'react';
import {CORNERS,IDP_FORMATS,cornerLabel,goalsFor,type Corner} from '@/lib/coaches/idp';
import type {Format} from '@/lib/town/venues';
import {SKILLS} from '@/lib/coaches/idp/skills';
import {MAX_GOALS,startPlan,type GoalSource,type IdpState2} from '@/lib/coaches/idp/store';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {CornerGlyph,SkillGlyph} from './Art';
import s from './Idp.module.css';

const CORNER_IDS=Object.keys(CORNERS) as Corner[];
const LOVE:Record<Corner,string>={technical:'Doing tricks and skills with the ball',tactical:'Working out where to go',physical:'Running fast and never stopping',social:'Helping and talking to my team'};
const v=(o:Record<string,string|number>)=>o as CSSProperties;

export default function PlanBuilder({state,commit,onDone,onCancel}:{state:IdpState2;commit:(s:IdpState2)=>void;onDone:()=>void;onCancel?:()=>void}){
 const [step,setStep]=useState(0);
 const [format,setFormat]=useState<Format>(state.format);
 const [strength,setStrength]=useState<Corner|undefined>(state.plan?.strength);
 const [picked,setPicked]=useState<string[]>(()=>(state.plan?.goals??[]).map(g=>g.goalId).filter(id=>goalsFor(state.format).some(g=>g.id===id)));
 const goals=goalsFor(format);
 const toggle=(id:string)=>setPicked(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=MAX_GOALS?[p[1],id]:[...p,id]);
 const finish=(source:GoalSource)=>{commit(startPlan({...state,format},picked,source,Date.now(),strength));countIdp('set');onDone();};
 return <div className={s.builder} data-idp-builder data-step={step}>
  <ol className={s.builderSteps} aria-label="Make my plan">{['What I love','My goals','Who helped'].map((t,i)=><li key={t} aria-current={i===step?'step':undefined} data-done={i<step||undefined}><i>{i+1}</i>{t}</li>)}</ol>
  <div className={s.stage} key={step} data-enter="fwd">
  {step===0&&<section className={s.beat} aria-labelledby="idp-b0">
   <header className={s.beatHead}><p className={s.kicker} style={v({'--i':0})}>Let’s make your plan</p><h3 id="idp-b0" className={s.beatTitle} style={v({'--i':1})}>What do you love doing in football?</h3><p className={s.caption} style={v({'--i':2})}>Pick one. This is your strength.</p></header>
   <div className={s.loveGrid}>{CORNER_IDS.map((c,i)=><button key={c} type="button" className={s.loveTile} data-corner={c} aria-pressed={strength===c} style={v({'--i':3+i})} onClick={()=>setStrength(strength===c?undefined:c)}><CornerGlyph corner={c} size={40}/><b>{cornerLabel('7v7',c)}</b><small>{LOVE[c]}</small></button>)}</div>
   <div className={s.row}>{onCancel&&<button type="button" className={s.textBtn} onClick={onCancel}>Keep my plan</button>}<button type="button" className={s.primary} data-builder-next onClick={()=>setStep(1)}>{strength?'Next':'Not sure yet'}</button></div>
  </section>}
  {step===1&&<section className={s.beat} aria-labelledby="idp-b1">
   <header className={s.beatHead}><p className={s.kicker} style={v({'--i':0})}>Step 2 of 3</p><h3 id="idp-b1" className={s.beatTitle} style={v({'--i':1})}>Pick one or two things to get better at</h3><p className={s.caption} style={v({'--i':2})}>Each one is an “I can…” goal. Choose what you want, not what someone else is doing.</p></header>
   <div className={s.formats} role="group" aria-label="Which game do you play?">{IDP_FORMATS.map(f=><button key={f.format} type="button" className={s.chip} aria-pressed={f.format===format} onClick={()=>{setFormat(f.format);setPicked([]);}}><b>{f.label}</b></button>)}</div>
   <ul className={s.goalOptions}>{goals.map((g,i)=><li key={g.id} style={v({'--i':3+i})}><button type="button" className={s.goalOption} data-goal-option={g.id} data-corner={g.corner} aria-pressed={picked.includes(g.id)} onClick={()=>toggle(g.id)}>
    <span className={s.optGlyph}><SkillGlyph skill={g.skill} size={26}/></span><span><b>{g.ican}</b><small>{g.why}</small><em className={s.optCorner}>{cornerLabel(format,g.corner)}{strength===g.corner?' · uses your strength':''}</em></span>{picked.includes(g.id)&&<span className={s.pickTick} aria-hidden="true">✓</span>}</button></li>)}</ul>
   <p className={s.small} role="status">{picked.length===0?'Choose at least one.':picked.length===1?'One goal chosen. You can add one more, or go on.':'Two goals chosen. That’s plenty!'}</p>
   <div className={s.row}><button type="button" className={s.ghost} onClick={()=>setStep(0)}>Back</button><button type="button" className={s.primary} data-builder-next disabled={!picked.length} onClick={()=>setStep(2)}>Next</button></div>
  </section>}
  {step===2&&<section className={s.beat} aria-labelledby="idp-b2">
   <header className={s.beatHead}><p className={s.kicker} style={v({'--i':0})}>Step 3 of 3</p><h3 id="idp-b2" className={s.beatTitle} style={v({'--i':1})}>Who helped you choose?</h3><p className={s.caption} style={v({'--i':2})}>Plans work best when you make them with someone.</p></header>
   <ul className={s.chosen}>{picked.map((id,i)=>{const g=goals.find(x=>x.id===id)!;return <li key={id} style={v({'--i':3+i})}><SkillGlyph skill={g.skill} size={22}/><b>{g.ican}</b><small>{SKILLS[g.skill].kid}</small></li>;})}</ul>
   <div className={s.whoGrid}>{([['me','Just me'],['together','Me and my coach'],['together','Me and a grown-up']] as [GoalSource,string][]).map(([src,label],i)=><button key={label} type="button" className={s.whoBtn} data-who={label} style={v({'--i':5+i})} onClick={()=>finish(src)}>{label}</button>)}</div>
   <div className={s.row}><button type="button" className={s.ghost} onClick={()=>setStep(1)}>Back</button></div>
  </section>}
  </div>
 </div>;
}
