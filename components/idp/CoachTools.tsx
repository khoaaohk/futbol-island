'use client';
/**
 * Coach: give a goal by QR (docs/idp/DESIGN.md §4, §10). One screen: pick a goal (or two), then "Make the QR" bottom right.
 * A cue, a Coaches Board play and "a team goal" are tucked under "More options". The QR holds catalogue ids only and the player
 * scans it on their own device to add it ("add my coach's goal"); a team sheet prints the same QR six times. The
 * Play–Practice–Play session outline for the goal follows the QR. (The review, notes and cheers live on their own grown-up
 * screens: Review.tsx and NotesScreen.) Nothing is sent anywhere: the QR is made on this device and the #fragment never
 * reaches a server.
 */
import {useEffect,useState} from 'react';
import {IDP_FORMATS,goalById,goalsFor} from '@/lib/coaches/idp';
import type {Format} from '@/lib/town/venues';
import {SKILLS} from '@/lib/coaches/idp/skills';
import {addGoal,type IdpState2} from '@/lib/coaches/idp/store';
import {coachGoalUrl,type CoachGoalShare} from '@/lib/coaches/idp/share';
import {BOARD_LINK_PLAY,boardPlays,isBoardPlayId,type BoardPlayRef} from '@/lib/coaches/idp/board';
import {escapeHtml,printDocument} from '@/lib/grownups/report';
import {printHtml} from '@/lib/grownups/printHtml';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {SkillGlyph} from './Art';
import {Footer,Screen} from './Nav';
import s from './Idp.module.css';


export function teamSheetHtml(share:CoachGoalShare,qrDataUrl:string){
 const goals=share.goals.map(id=>goalById(id)!).filter(Boolean);
 const card=`<div class="card" style="display:flex;gap:12px;align-items:center;border:2px dashed #244d40"><img src="${escapeHtml(qrDataUrl)}" width="110" height="110" alt="QR code: add my coach’s goal"><div><span class="tag">My coach’s goal</span>${goals.map(g=>`<b style="font-size:16px;margin-top:4px">“${escapeHtml(g.ican)}”</b>`).join('')}${share.cue!==undefined?`<p style="margin:4px 0">Coach says: “${escapeHtml(SKILLS[goals[0].skill].cues[share.cue])}”</p>`:''}<p class="muted" style="margin:4px 0 0">Scan on your own phone or tablet, then tap “Add to my plan”.</p></div></div>`;
 return printDocument('Coach’s goal cards',`<header><div><h1>My coach’s goal</h1><p>Futbol Island · cut along the dashed lines</p></div></header><div class="grid" style="margin-top:12px">${Array.from({length:6},()=>card).join('')}</div><footer class="muted">The QR holds the goal’s id only: no names, no team, nothing about any child. Made on this device; nothing was uploaded.</footer>`);
}

export default function CoachTools({state,commit,onBack}:{state:IdpState2;commit:(s:IdpState2)=>void;onBack:()=>void}){
 const [format,setFormat]=useState<Format>(state.format);
 const [picked,setPicked]=useState<string[]>([]),[cue,setCue]=useState<number|undefined>(),[play,setPlay]=useState(''),[team,setTeam]=useState(false);
 const [qr,setQr]=useState<{svg:string;url:string}|null>(null),[added,setAdded]=useState(false);
 const [plays,setPlays]=useState<BoardPlayRef[]>([]);
 // The rebuilt Coaches Board may announce a play to link (BOARD_LINK_PLAY) while these tools are open.
 useEffect(()=>{setPlays(boardPlays());const f=(e:Event)=>{const d=(e as CustomEvent<{id?:string;title?:string}>).detail;if(d&&isBoardPlayId(d.id)){setPlay(d.id);setPlays(boardPlays());}};window.addEventListener(BOARD_LINK_PLAY,f);return()=>window.removeEventListener(BOARD_LINK_PLAY,f);},[]);
 const options=goalsFor(format),first=picked[0]?goalById(picked[0]):undefined;
 const share:CoachGoalShare|null=picked.length?{goals:picked,...(cue!==undefined?{cue}:{}),...(isBoardPlayId(play)?{play}:{}),...(team?{team:true}:{})}:null;
 useEffect(()=>{setQr(null);setAdded(false);},[picked.join(),cue,play,team]);
 const make=async()=>{if(!share)return;const url=coachGoalUrl(window.location.origin,share);try{const {default:QR}=await import('qrcode');setQr({svg:await QR.toDataURL(url,{width:440,margin:1,errorCorrectionLevel:'M'}),url});countIdp('coachqr');}catch{setQr({svg:'',url});}};
 const printSheet=async()=>{if(!share||!qr)return;try{const {default:QR}=await import('qrcode');printHtml(teamSheetHtml(share,await QR.toDataURL(qr.url,{width:240,margin:1,errorCorrectionLevel:'M'})));}catch{}};
 return <Screen id="idp-coach" kicker="For coaches" title="Give a goal by QR" data-coach-tools>
  <section className={s.panel} data-coach-qr>
   <p className={s.small}>Pick one goal (or two). The player scans the QR on their own device and taps “Add to my plan”. The QR holds the goal’s id only: no names, no team list.</p>
   <div className={s.formatRow} role="group" aria-label="Format"><span aria-hidden="true">Format</span>{IDP_FORMATS.map(f=><button key={f.format} type="button" className={s.chip} aria-pressed={format===f.format} onClick={()=>{setFormat(f.format);setPicked([]);setCue(undefined);}}>{f.label}</button>)}</div>
   <ul className={s.goalOptions}>{options.map(g=><li key={g.id}><button type="button" className={s.goalOption} data-coach-goal={g.id} data-corner={g.corner} aria-pressed={picked.includes(g.id)} onClick={()=>setPicked(p=>p.includes(g.id)?p.filter(x=>x!==g.id):p.length>=2?[p[1],g.id]:[...p,g.id])}><span className={s.optGlyph}><SkillGlyph skill={g.skill} size={24}/></span><span><b>{g.ican}</b><small>{g.title}</small></span>{picked.includes(g.id)&&<span className={s.pickTick} aria-hidden="true">✓</span>}</button></li>)}</ul>
  </section>
  {first&&<section className={s.panel}>
   <h4>Your cue (optional)</h4>
   <div className={s.chips} role="group" aria-label="Coach cue">{SKILLS[first.skill].cues.map((c,i)=><button key={c} type="button" className={s.chip} aria-pressed={cue===i} onClick={()=>setCue(cue===i?undefined:i)}>“{c}”</button>)}</div>
   <details className={s.options}><summary>More options</summary>
    {plays.length?<label className={s.field}>Link a Coaches Board play<select className={s.select} value={play} onChange={e=>setPlay(e.target.value)}><option value="">No play</option>{plays.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    :<p className={s.small}>Plays you save on the Coaches Board can be linked here{play?` (linked: ${play})`:''}.</p>}
    <button type="button" className={s.helpToggle} aria-pressed={team} onClick={()=>setTeam(!team)}><span aria-hidden="true">{team?'✓':'+'}</span>A team goal (print one card per player)</button>
    <button type="button" className={s.ghost} style={{justifySelf:'start'}} data-add-here onClick={()=>{let next=state;for(const id of picked)next=addGoal(next,{goalId:id,source:'coach',cue,play:isBoardPlayId(play)?play:undefined},Date.now());commit(next);countIdp('coachadd');setAdded(true);}}>Add to this device’s plan instead</button>
    {added&&<p className={s.savedNote} role="status">Added to the plan on this device.</p>}
   </details>
  </section>}
  {qr&&first&&<section className={s.panel}>
   <div className={s.qrBox} data-coach-qr-code>{qr.svg?<img src={qr.svg} width={220} height={220} alt="QR code: add my coach’s goal"/>:null}<p className={s.small}>Show this to the player, or <button type="button" className={s.textBtn} onClick={printSheet}>print goal cards</button> for the team.</p><p className={s.linkText}>{qr.url}</p></div>
   <div className={s.session} data-session>
    <h4>A session for this goal: Play, Practice, Play</h4>
    <ol><li><b>Play.</b> {SKILLS[first.skill].session.play}</li><li><b>Practice.</b> {SKILLS[first.skill].session.practice}</li><li><b>Play again.</b> {SKILLS[first.skill].session.playAgain}</li></ol>
    <p className={s.small}>Praise the try, not the result. Keep everyone playing; no lines, no laps.</p>
   </div>
  </section>}
  <Footer back={onBack}><button type="button" className={s.primary} data-make-qr disabled={!share} onClick={make}>{qr?'QR ready ✓':'Make the QR'}</button></Footer>
 </Screen>;
}
