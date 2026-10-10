'use client';
/**
 * Coach tools (docs/idp/DESIGN.md §4), behind the ParentGate:
 *  - this player's plan on this device: goals, "asked for help" check-ins, the six-week review with its conversation guide;
 *  - a coach's note (device-only words) and a preset cheer;
 *  - "Give a goal by QR": pick a goal (or two), a cue and optionally a Coaches Board play; the QR holds catalogue ids only and
 *    the player scans it on their own device to add it ("add my coach's goal"). A team sheet prints the same QR six times;
 *  - the Play–Practice–Play session outline for the goal.
 * Nothing is sent anywhere: the QR is made on this device and the link's #fragment never reaches a server.
 */
import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {IDP_FORMATS,goalById,goalsFor} from '@/lib/coaches/idp';
import type {Format} from '@/lib/town/venues';
import {CHEERS,CHEER_IDS,FEELS,SKILLS,type CheerId} from '@/lib/coaches/idp/skills';
import {addCheer,addGoal,addText,daysUntil,removeText,reviewDue2,reviewPlan2,type IdpState2,type IdpText,type ReviewOutcome} from '@/lib/coaches/idp/store';
import {goalsOf} from '@/lib/coaches/idp/journey';
import {coachGoalUrl,type CoachGoalShare} from '@/lib/coaches/idp/share';
import {BOARD_LINK_PLAY,boardPlays,isBoardPlayId,type BoardPlayRef} from '@/lib/coaches/idp/board';
import {escapeHtml,printDocument} from '@/lib/grownups/report';
import {printHtml} from '@/lib/grownups/printHtml';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {SkillGlyph} from './Art';
import s from './Idp.module.css';

const v=(o:Record<string,string|number>)=>o as CSSProperties;
const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});

export function teamSheetHtml(share:CoachGoalShare,qrDataUrl:string){
 const goals=share.goals.map(id=>goalById(id)!).filter(Boolean);
 const card=`<div class="card" style="display:flex;gap:12px;align-items:center;border:2px dashed #244d40"><img src="${escapeHtml(qrDataUrl)}" width="110" height="110" alt="QR code: add my coach’s goal"><div><span class="tag">My coach’s goal</span>${goals.map(g=>`<b style="font-size:16px;margin-top:4px">“${escapeHtml(g.ican)}”</b>`).join('')}${share.cue!==undefined?`<p style="margin:4px 0">Coach says: “${escapeHtml(SKILLS[goals[0].skill].cues[share.cue])}”</p>`:''}<p class="muted" style="margin:4px 0 0">Scan on your own phone or tablet, then tap “Add to my plan”.</p></div></div>`;
 return printDocument('Coach’s goal cards',`<header><div><h1>My coach’s goal</h1><p>Futbol Island · cut along the dashed lines</p></div></header><div class="grid" style="margin-top:12px">${Array.from({length:6},()=>card).join('')}</div><footer class="muted">The QR holds the goal’s id only: no names, no team, nothing about any child. Made on this device; nothing was uploaded.</footer>`);
}

export default function CoachTools({state,commit,text,commitText,now}:{state:IdpState2;commit:(s:IdpState2)=>void;text:IdpText;commitText:(t:IdpText)=>void;now:number}){
 const plan=state.plan,goals=plan?goalsOf(plan):[];
 const [format,setFormat]=useState<Format>(state.format);
 const [picked,setPicked]=useState<string[]>([]),[cue,setCue]=useState<number|undefined>(),[play,setPlay]=useState(''),[team,setTeam]=useState(false);
 const [qr,setQr]=useState<{svg:string;url:string}|null>(null),[added,setAdded]=useState(false),[note,setNote]=useState(''),[cheered,setCheered]=useState<CheerId|null>(null),[reviewed,setReviewed]=useState<ReviewOutcome|null>(null);
 const [plays,setPlays]=useState<BoardPlayRef[]>([]);
 // The rebuilt Coaches Board may announce a play to link (BOARD_LINK_PLAY) while these tools are open.
 useEffect(()=>{setPlays(boardPlays());const f=(e:Event)=>{const d=(e as CustomEvent<{id?:string;title?:string}>).detail;if(d&&isBoardPlayId(d.id)){setPlay(d.id);setPlays(boardPlays());}};window.addEventListener(BOARD_LINK_PLAY,f);return()=>window.removeEventListener(BOARD_LINK_PLAY,f);},[]);
 const options=goalsFor(format),first=picked[0]?goalById(picked[0]):undefined;
 const share:CoachGoalShare|null=picked.length?{goals:picked,...(cue!==undefined?{cue}:{}),...(isBoardPlayId(play)?{play}:{}),...(team?{team:true}:{})}:null;
 useEffect(()=>{setQr(null);setAdded(false);},[picked.join(),cue,play,team]);
 const make=async()=>{if(!share)return;const url=coachGoalUrl(window.location.origin,share);try{const {default:QR}=await import('qrcode');setQr({svg:await QR.toDataURL(url,{width:440,margin:1,errorCorrectionLevel:'M'}),url});countIdp('coachqr');}catch{setQr({svg:'',url});}};
 const printSheet=async()=>{if(!share||!qr)return;try{const {default:QR}=await import('qrcode');printHtml(teamSheetHtml(share,await QR.toDataURL(qr.url,{width:240,margin:1,errorCorrectionLevel:'M'})));}catch{}};
 const helpAsks=useMemo(()=>(plan?.checkins??[]).filter(c=>c.help).slice(-3).reverse(),[plan]);
 const coachNotes=text.notes.filter(n=>n.kind==='coach').slice(-4).reverse();
 const due=plan?reviewDue2(plan,now):false;
 return <div className={s.coach} data-coach-tools>
  <section className={s.panel} style={v({'--i':0})}>
   <h4>This player’s plan</h4>
   {plan&&goals.length?<>
    <ul className={s.coachGoals}>{goals.map(({pg,goal})=><li key={goal.id}><SkillGlyph skill={goal.skill} size={22}/><div><b>{goal.ican}</b><small>{SKILLS[goal.skill].kid} · {pg.source==='coach'?'your goal':pg.source==='me'?'their choice':'chosen together'} · since {day(pg.setAt)}</small></div></li>)}</ul>
    {helpAsks.length>0&&<p className={s.wHelp}><b>Asked for help</b> {helpAsks.map(c=>`${day(c.at)} (${FEELS[c.feel].kid.toLowerCase()})`).join(', ')}. A good moment for a quiet word.</p>}
    <div className={s.reviewCard} data-coach-review>
     <h4>{due?'Six-week review: due now':`Six-week review in ${daysUntil(plan.reviewAt,now)} days`}</h4>
     <p className={s.small}>A light talk every six weeks keeps the goal fresh and gives time to see change. (Academies review under-11s every 12 weeks; this is friendlier and shorter.) Keep it a conversation, player first.</p>
     <ol className={s.guide}><li>Ask the player: “What can you do now that you couldn’t before?”</li><li>Ask for one example: “Tell me a time you tried it.”</li><li>Share one specific moment you saw, then one next cue.</li><li>Decide together: keep going, change it a little, or a new goal.</li></ol>
     {reviewed?<p className={s.savedNote} role="status">Review saved. Next one in six weeks.</p>
     :<div className={s.row}>{(['keep','adapt','new'] as ReviewOutcome[]).map(o=><button key={o} type="button" className={o==='keep'?s.primary:s.ghost} onClick={()=>{commit(reviewPlan2(state,o,Date.now()));countIdp('review');setReviewed(o);}}>{o==='keep'?'Keep going':o==='adapt'?'Change it a little':'New goal next'}</button>)}</div>}
    </div>
   </>:<p className={s.small}>No plan on this device yet. Make one with the player in “My plan”, or give a goal by QR below.</p>}
  </section>
  {plan&&<section className={s.panel} style={v({'--i':1})}>
   <h4>Coach’s note and a cheer</h4>
   <p className={s.small}>A dated moment you saw, and one next cue. Notes stay on this device and are never uploaded.</p>
   <form className={s.inline} onSubmit={e=>{e.preventDefault();const next=addText(text,'coach',note,Date.now(),goals[0]?.goal.id);if(next!==text){commitText(next);setNote('');}}}>
    <label htmlFor="idp-coach-note" className={s.srOnly}>Coach’s note</label><input id="idp-coach-note" value={note} maxLength={280} placeholder="Like: checked shoulder twice at the goal kick" onChange={e=>setNote(e.target.value)}/>
    <button type="submit" className={s.ghost} disabled={!note.trim()}>Save note</button></form>
   {coachNotes.length>0&&<ul className={s.notes}>{coachNotes.map(n=><li key={n.id}><time>{day(n.at)}</time><span>{n.text}</span><button type="button" aria-label="Delete note" onClick={()=>commitText(removeText(text,n.id))}>×</button></li>)}</ul>}
   <div className={s.chips} role="group" aria-label="Cheer from the coach">{CHEER_IDS.map(id=><button key={id} type="button" className={s.chip} aria-pressed={cheered===id} onClick={()=>{commit(addCheer(state,id,'coach',Date.now()));countIdp('cheer');setCheered(id);}}>{CHEERS[id]}</button>)}</div>
  </section>}
  <section className={s.panel} style={v({'--i':2})} data-coach-qr>
   <h4>Give a goal by QR</h4>
   <p className={s.small}>For one player or the whole team. The player scans it on their own device and taps “Add to my plan”. The QR holds the goal’s id only: no names, no team list, nothing stored on a server.</p>
   <div className={s.formats} role="group" aria-label="Format">{IDP_FORMATS.map(f=><button key={f.format} type="button" className={s.chip} aria-pressed={format===f.format} onClick={()=>{setFormat(f.format);setPicked([]);setCue(undefined);}}>{f.label}</button>)}</div>
   <ul className={s.goalOptions}>{options.map(g=><li key={g.id}><button type="button" className={s.goalOption} data-coach-goal={g.id} data-corner={g.corner} aria-pressed={picked.includes(g.id)} onClick={()=>setPicked(p=>p.includes(g.id)?p.filter(x=>x!==g.id):p.length>=2?[p[1],g.id]:[...p,g.id])}><span className={s.optGlyph}><SkillGlyph skill={g.skill} size={24}/></span><span><b>{g.ican}</b><small>{g.title}</small></span>{picked.includes(g.id)&&<span className={s.pickTick} aria-hidden="true">✓</span>}</button></li>)}</ul>
   {first&&<>
    <h4>Add your cue (optional)</h4>
    <div className={s.chips} role="group" aria-label="Coach cue">{SKILLS[first.skill].cues.map((c,i)=><button key={c} type="button" className={s.chip} aria-pressed={cue===i} onClick={()=>setCue(cue===i?undefined:i)}>“{c}”</button>)}</div>
    <h4>Link a play from the Coaches Board (optional)</h4>
    {plays.length?<select className={s.select} value={play} onChange={e=>setPlay(e.target.value)} aria-label="Board play"><option value="">No play</option>{plays.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>
    :<p className={s.small}>Plays you save on the Coaches Board can be linked here{play?` (linked: ${play})`:''}.</p>}
    <button type="button" className={s.helpToggle} aria-pressed={team} onClick={()=>setTeam(!team)}><span aria-hidden="true">{team?'✓':'+'}</span>A team goal (print one card per player)</button>
    <div className={s.row}><button type="button" className={s.primary} data-make-qr onClick={make}>Make the QR</button>
     {<button type="button" className={s.ghost} data-add-here onClick={()=>{let next=state;for(const id of picked)next=addGoal(next,{goalId:id,source:'coach',cue,play:isBoardPlayId(play)?play:undefined},Date.now());commit(next);countIdp('coachadd');setAdded(true);}}>Add to this device’s plan</button>}</div>
    {added&&<p className={s.savedNote} role="status">Added to the plan on this device.</p>}
    {qr&&<div className={s.qrBox} data-coach-qr-code>{qr.svg?<img src={qr.svg} width={220} height={220} alt="QR code: add my coach’s goal"/>:null}<p className={s.small}>Show this to the player, or print cards for the team. <button type="button" className={s.textBtn} onClick={printSheet}>Print goal cards</button></p><p className={s.linkText}>{qr.url}</p></div>}
    <div className={s.session} data-session>
     <h4>A session for this goal: Play, Practice, Play</h4>
     <ol><li><b>Play.</b> {SKILLS[first.skill].session.play}</li><li><b>Practice.</b> {SKILLS[first.skill].session.practice}</li><li><b>Play again.</b> {SKILLS[first.skill].session.playAgain}</li></ol>
     <p className={s.small}>Praise the try, not the result. Keep everyone playing; no lines, no laps.</p>
    </div>
   </>}
  </section>
 </div>;
}
