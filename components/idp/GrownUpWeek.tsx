'use client';
/**
 * The grown-up view (docs/idp/DESIGN.md §3): this week's story in a calm, plain voice. Information first, story second:
 *   what they're working on and why → what it looks like on the pitch (a play diagram that draws on once) → what they did this
 *   week and a moment they were proud of → "Ask about…" → 10 minutes at home tonight → what to avoid → leave a cheer →
 *   the fridge card. It is shown behind the ParentGate (Coaches Centre and For grown-ups). It never ranks or scores the child,
 *   and it is also what a grown-up sees on their own phone from the fridge card's QR (WeekStory, read-only).
 */
import {useEffect,useState,type CSSProperties} from 'react';
import {goalById,type IdpGoal} from '@/lib/coaches/idp';
import {PRACTICES,PRACTICE_SAFETY} from '@/lib/grownups/practice';
import {printHtml} from '@/lib/grownups/printHtml';
import {AVOID_ALWAYS,CHEERS,CHEER_IDS,FEELS,SAY_INSTEAD,SKILLS,STICKERS,type CheerId,type FeelId,type StickerId} from '@/lib/coaches/idp/skills';
import {weekMissions,weekSummary} from '@/lib/coaches/idp/journey';
import {addCheer,addText,removeText,type IdpState2,type IdpText} from '@/lib/coaches/idp/store';
import {dayNumber,weekUrl,type WeekShare} from '@/lib/coaches/idp/share';
import {fridgeCardHtml} from '@/lib/coaches/idp/fridge';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {PlayDiagram,SkillGlyph,Sticker} from './Art';
import s from './Idp.module.css';

const v=(o:Record<string,string|number>)=>o as CSSProperties;
const longDay=(at:number)=>new Date(at).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});

/** The week as a shareable, text-free summary (the fridge card QR and /plan#p=). */
export function weekShareOf(state:IdpState2,now:number):WeekShare{
 const w=weekSummary(state,now);
 return {format:state.format,goals:(state.plan?.goals??[]).map(g=>g.goalId),missions:w.missions,checkins:w.checkins,stickers:w.proud as StickerId[],...(w.latestFeel?{feel:w.latestFeel}:{}),...(w.help?{help:true}:{}),...(state.plan?{reviewDay:dayNumber(state.plan.reviewAt)}:{})};
}

/** Read-only week story: used inside the game and on the grown-up's own phone (/plan#p=…). */
export function WeekStory({week,reviewAt,missionTitles}:{week:WeekShare;reviewAt?:number;missionTitles?:{title:string;where:'home'|'training'|'island'}[]}){
 const goals=week.goals.map(id=>goalById(id)).filter((g):g is IdpGoal=>!!g);
 if(!goals.length)return <p className={s.small}>No goal right now. The next one is chosen together in the game.</p>;
 const first=SKILLS[goals[0].skill],home=PRACTICES.find(p=>p.id===first.home);
 const ask=goals.length>1?[SKILLS[goals[0].skill].askAbout[0],SKILLS[goals[1].skill].askAbout[0],first.askAbout[2]]:first.askAbout;
 const missions=missionTitles??goals.flatMap(g=>SKILLS[g.skill].missions.slice(0,goals.length>1?1:2).map(m=>({title:m.title,where:m.where})));
 return <div className={s.week} data-week-story>
  <section className={s.wBeat} style={v({'--i':0})}>
   <p className={s.kicker}>This week</p>
   <h3 className={s.wTitle}>Your player is working on {goals.length>1?'two things':'one thing'}</h3>
   {goals.map(g=><div key={g.id} className={s.wGoal}><span className={s.canGlyph}><SkillGlyph skill={g.skill} size={24}/></span><div><b>“{g.ican}”</b><p>{SKILLS[g.skill].grownWhy}</p></div></div>)}
  </section>
  <section className={s.wBeat} style={v({'--i':2})}>
   <h4>What it looks like on the pitch</h4>
   <PlayDiagram d={first.diagram} label={`${first.kid} on the pitch`}/>
   <p className={s.caption}>{first.diagram.caption}</p>
  </section>
  <section className={s.wBeat} style={v({'--i':3})} data-week-did>
   <h4>What they did this week</h4>
   <ul className={s.wFacts}>
    <li><b>{week.missions}</b><span>mission{week.missions===1?'':'s'} ticked off</span></li>
    <li><b>{week.checkins}</b><span>check-in{week.checkins===1?'':'s'}</span></li>
    {week.feel&&<li className={s.wFeel}><span>Last check-in: they’re {FEELS[week.feel as FeelId].grown}.</span></li>}
   </ul>
   {week.stickers.length>0&&<p className={s.wProud}><Sticker id={week.stickers.at(-1)!} size={44}/><span>A moment they were proud of: they {STICKERS[week.stickers.at(-1)!].grown}.</span></p>}
   {week.help&&<p className={s.wHelp}><b>They said they’d like some help with this.</b> That’s a brave and useful thing to say. Ask what would help, and let the coach know.</p>}
   {!week.missions&&!week.checkins&&<p className={s.small}>Nothing ticked yet this week, and that’s fine. One short, fun go is plenty.</p>}
   <p className={s.small}>These are their own ticks and feelings, to start a conversation. They aren’t a score, and there’s nothing to compare.</p>
  </section>
  <section className={s.wBeat} style={v({'--i':4})}>
   <h4>Ask about…</h4><ul className={s.ask}>{ask.map(a=><li key={a}>{a}</li>)}</ul>
   <p className={s.small}>Try “Ask about…” rather than “How did you play?”. Listen more than you talk.</p>
  </section>
  {home&&<section className={s.wBeat} style={v({'--i':5})}>
   <h4>Help tonight, in 10 minutes</h4>
   <div className={s.homeCard}><b>{home.title}</b><small>{home.setup}</small><p>{home.howTo}</p><span>Then ask: “{home.talk}”</span></div>
   {missions.length>0&&<p className={s.small}>Their missions: {missions.map(m=>m.title).join(' · ')}</p>}
   <p className={s.small}>{PRACTICE_SAFETY}</p>
  </section>}
  <section className={s.wBeat} style={v({'--i':6})}>
   <h4>Please try not to</h4><ul className={s.avoid}>{[first.avoid,...AVOID_ALWAYS].map(a=><li key={a}>{a}</li>)}</ul>
   <h4>Instead, say</h4><ul className={s.say}>{SAY_INSTEAD.map(a=><li key={a}>{a}</li>)}</ul>
  </section>
  {reviewAt?<p className={s.small}>Next review with the coach: {longDay(reviewAt)} (every six weeks).</p>:null}
 </div>;
}

export default function GrownUpWeek({state,commit,text,commitText,now,onRebuild,onEnd}:{state:IdpState2;commit:(s:IdpState2)=>void;text:IdpText;commitText:(t:IdpText)=>void;now:number;onRebuild:()=>void;onEnd:()=>void}){
 useEffect(()=>{countIdp('grown');},[]);
 const plan=state.plan;
 const [cheered,setCheered]=useState<CheerId|null>(null),[helped,setHelped]=useState(false),[note,setNote]=useState(''),[name,setName]=useState(''),[confirmEnd,setConfirmEnd]=useState(false);
 const [qr,setQr]=useState<string|null>(null);
 if(!plan)return <div className={s.week}><p className={s.lead}>There’s no plan yet. Open “My plan” together and make one: it takes two minutes, and your player chooses.</p></div>;
 const week=weekShareOf(state,now),missions=weekMissions(plan,now).map(m=>({title:m.mission.title,where:m.mission.where}));
 const url=typeof window!=='undefined'?weekUrl(window.location.origin,week):'';
 const print=async()=>{let dataUrl:string|undefined;try{const {default:QR}=await import('qrcode');dataUrl=await QR.toDataURL(url,{width:240,margin:1,errorCorrectionLevel:'M'});}catch{}
  printHtml(fridgeCardHtml(state,{firstName:name,printedAt:Date.now(),qrDataUrl:dataUrl}));countIdp('fridge');};
 const showQr=async()=>{try{const {default:QR}=await import('qrcode');setQr(await QR.toDataURL(url,{width:440,margin:1,errorCorrectionLevel:'M'}));}catch{setQr('');}};
 const homeNotes=text.notes.filter(n=>n.kind==='home').slice(-3).reverse();
 return <div className={s.grown} data-grown-view>
  <WeekStory week={week} reviewAt={plan.reviewAt} missionTitles={missions}/>
  <section className={s.panel} data-cheer>
   <h4>Leave a cheer</h4><p className={s.small}>It appears in their plan next time they open it. Pick one; no typing.</p>
   <div className={s.chips} role="group" aria-label="Cheers">{CHEER_IDS.map(id=><button key={id} type="button" className={s.chip} aria-pressed={cheered===id} onClick={()=>{commit(addCheer(state,id,'home',Date.now()));countIdp('cheer');setCheered(id);}}>{CHEERS[id]}</button>)}</div>
   {cheered&&<p className={s.savedNote} role="status">Sent to their plan on this device.</p>}
  </section>
  <section className={s.panel}>
   <h4>A note for yourself</h4><p className={s.small}>Private to this device. It is never uploaded, even with a save code.</p>
   <form className={s.inline} onSubmit={e=>{e.preventDefault();const next=addText(text,'home',note,Date.now());if(next!==text){commitText(next);setNote('');}}}>
    <label htmlFor="idp-home-note" className={s.srOnly}>Note</label><input id="idp-home-note" value={note} maxLength={280} placeholder="Like: ask about the keeper call" onChange={e=>setNote(e.target.value)}/>
    <button type="submit" className={s.ghost} disabled={!note.trim()}>Save</button></form>
   {homeNotes.length>0&&<ul className={s.notes}>{homeNotes.map(n=><li key={n.id}><time>{new Date(n.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><span>{n.text}</span><button type="button" aria-label="Delete note" onClick={()=>commitText(removeText(text,n.id))}>×</button></li>)}</ul>}
  </section>
  <section className={s.panel} data-fridge data-week-url={url.replace(/^https?:\/\/[^/]+/,'')}>
   <h4>The fridge card</h4>
   <p className={s.small}>One page for the kitchen: the goal, this week’s missions to tick, what to ask and what to avoid. Its QR opens this week’s plan on any phone, with no sign-in. The QR holds goal and mission ids only, never a name.</p>
   <div className={s.inline}><label htmlFor="idp-fridge-name" className={s.srOnly}>First name on the card (optional)</label><input id="idp-fridge-name" value={name} maxLength={24} autoComplete="off" placeholder="First name on the card (optional)" onChange={e=>setName(e.target.value)}/>
    <button type="button" className={s.primary} data-fridge-print onClick={print}>Print the fridge card</button></div>
   <p className={s.small}>The name is only used for this printout. It isn’t saved.</p>
   {qr===null?<button type="button" className={s.ghost} onClick={showQr}>Show this week’s QR</button>:qr?<div className={s.qrBox} data-week-qr><img src={qr} width={220} height={220} alt="QR code: this week’s plan"/><p className={s.small}>Scan with another phone’s camera to open this week’s plan there.</p></div>:<p className={s.small}>The QR couldn’t be made on this device. The printout still works.</p>}
  </section>
  <section className={s.panel}>
   <h4>Was this useful?</h4>
   {helped?<p className={s.savedNote} role="status">Thank you. That helps us make it better (we only count taps, nothing else).</p>:<button type="button" className={s.ghost} data-helped onClick={()=>{countIdp('helped');setHelped(true);}}>Yes, this helped</button>}
  </section>
  <section className={s.panel}>
   <h4>Change the plan</h4><p className={s.small}>Changing goals is best done together, with your player choosing.</p>
   {confirmEnd?<div className={s.confirm} role="alertdialog" aria-labelledby="idp-end-q"><p id="idp-end-q"><b>End this plan?</b> The goals move to its history. Notes stay on this device.</p><div className={s.row}><button type="button" className={s.ghost} autoFocus onClick={()=>setConfirmEnd(false)}>Keep the plan</button><button type="button" className={s.primary} onClick={()=>{setConfirmEnd(false);onEnd();}}>End plan</button></div></div>
   :<div className={s.row}><button type="button" className={s.ghost} onClick={onRebuild}>Change goals together</button><button type="button" className={s.textBtn} onClick={()=>setConfirmEnd(true)}>End plan</button></div>}
  </section>
 </div>;
}
