'use client';
import {useRef,useState} from 'react';
import {PRESETS,presetOf,settingsFor} from '@/lib/coach/engine';
import {MAX_TEAMS,initials,isRunning,teamColor,type Teams} from '@/lib/coach/teams';
import type {Words} from '@/lib/coach/words';
import {useSwipeDown} from '@/components/motion/motion';
import c from './coach.module.css';
/**
 * Change team (owner, Nov 22 2026): the dashboard's top-left team button opens this bottom sheet. Every team with its format and
 * squad size (the one in use checked); tap to switch; Edit opens that team's Squad screen; Delete asks in the sheet (never
 * window.confirm); "+ Add a team" is two short steps: name and format, then the squad (empty, or copied from another team).
 */
export const fmtName=(f:string)=>presetOf(f).id==='futsal'?'Futsal':f;
export function TeamBadge({name,place,small}:{name:string;place:number;small?:boolean}){
 return <span className={`${c.teamBadge} ${small?c.teamBadgeSm:''}`} style={{background:teamColor(place-1)}} aria-hidden="true">{initials(name,place)}</span>;
}
/** The header's left control on the dashboard: the team badge and a chevron. */
export function TeamButton({w,name,place,onClick}:{w:Words;name:string;place:number;onClick:()=>void}){
 return <button type="button" className={c.teamBtn} aria-label={w.changeTeam} aria-haspopup="dialog" onClick={onClick} data-coach-teams="">
  <TeamBadge name={name} place={place}/>
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </button>;
}
type View={k:'list'}|{k:'add';step:1|2}|{k:'del';id:string};
export function TeamSheet({w,teams,closing,onClose,onPick,onEdit,onDelete,onAdd}:{w:Words;teams:Teams;closing:boolean;onClose:()=>void;onPick:(id:string)=>void;onEdit:(id:string)=>void;
 onDelete:(id:string)=>void;onAdd:(x:{name:string;format:string;from?:string})=>void}){
 const [view,setView]=useState<View>({k:'list'});
 const [name,setName]=useState(''),[format,setFormat]=useState<string>(()=>teams.teams.find(t=>t.id===teams.activeId)?.settings.format??'7v7'),[from,setFrom]=useState('');
 const panel=useRef<HTMLDivElement>(null),swipe=useSwipeDown(panel,onClose);
 const withPlayers=teams.teams.filter(t=>t.team.players.length>0);
 const label=(i:number)=>teams.teams[i].team.name||w.teamN(i+1);
 const del=view.k==='del'?teams.teams.findIndex(t=>t.id===view.id):-1;
 const title=view.k==='add'?w.addTeam:view.k==='del'&&del>=0?w.deleteQ(label(del)):w.yourTeams;
 return <div className={c.sheet} data-closing={closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{if(e.key==='Escape')onClose();}}>
  <div className={`${c.sheetIn} ${c.setSheet}`} ref={panel} role="dialog" aria-modal="true" aria-labelledby="coach-teams" data-team-sheet="">
   <div className={c.sheetHead} {...swipe}><span className={c.grab} aria-hidden="true"/><p className={c.sheetTitle} id="coach-teams">{title}</p>{/* round 4G (audit C8): step 2 of a new team has one way forward (Back / Create team), no second Done */}
    {!(view.k==='add'&&view.step===2)&&<button type="button" className={c.doneBtn} onClick={onClose} autoFocus>{w.sheetDone}</button>}</div>
   <div className={c.sheetBody} key={view.k+(view.k==='add'?view.step:'')} data-view={view.k}>
    {view.k==='list'&&<>
     <ul className={c.teamList}>{teams.teams.map((t,i)=>{const cur=t.id===teams.activeId,live=isRunning(t);
      return <li key={t.id} className={c.teamRow} data-current={cur||undefined}>
       <button type="button" className={c.teamPick} aria-pressed={cur} onClick={()=>onPick(t.id)} data-team-pick={t.id}>
        <TeamBadge name={t.team.name} place={i+1}/>
        <span className={c.teamText}><b>{label(i)}</b><small>{w.fmt(presetOf(t.settings.format).id)} · {w.playersN(t.team.players.length)}{live?<> · <em className={c.liveTag}>{w.liveTag}</em></>:null}</small></span>
        {cur&&<svg className={c.teamCheck} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
       </button>
       <div className={c.teamTools}>
        <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} onClick={()=>onEdit(t.id)} aria-label={`${w.editT}: ${label(i)}`}>{w.editT}</button>
        <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} disabled={live} title={live?w.endFirst:undefined} onClick={()=>setView({k:'del',id:t.id})} aria-label={`${w.deleteT}: ${label(i)}${live?` (${w.endFirst})`:''}`}>{w.deleteT}</button>
       </div>
      </li>;})}</ul>
     {teams.teams.length<MAX_TEAMS?<button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={()=>{setName('');setFrom('');setView({k:'add',step:1});}} data-team-add="">+ {w.addTeam}</button>
      :<p className={c.note}>{w.maxTeams}</p>}
    </>}
    {view.k==='del'&&del>=0&&<div className={c.delBox} role="alertdialog" aria-label={w.deleteQ(label(del))}>
     <p className={c.note}>{w.deleteNote}</p>
     <div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnDanger}`} onClick={()=>{onDelete(view.id);setView({k:'list'});}} data-team-delete-yes="">{w.deleteT}</button>
      <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>setView({k:'list'})}>{w.cancel}</button></div>
    </div>}
    {view.k==='add'&&<>
     <p className={c.stepTag}>{w.stepN(view.step,2)}</p>
     {view.step===1?<>
      <label className={c.sec} style={{marginTop:0}}><span className={c.lbl}>{w.teamName}</span><input className={c.input} value={name} placeholder={w.teamNamePh} maxLength={24} onChange={e=>setName(e.target.value.slice(0,24))} data-team-name=""/></label>
      <div className={c.sec}><p className={c.lbl}>{w.format}</p>
       <div className={c.fmtGrid} role="group" aria-label={w.format}>{PRESETS.map(p=><button key={p.id} type="button" className={c.fmtBtn} aria-pressed={format===p.id} onClick={()=>setFormat(p.id)}><b>{w.fmt(p.id)}</b>{p.ages&&<small>{p.ages}</small>}</button>)}</div></div>
      <div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>setView({k:'list'})}>{w.cancel}</button>
       <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>setView({k:'add',step:2})} data-team-next="">{w.nextStep}</button></div>
     </>:<>
      <p className={c.lbl}>{w.squadFrom}</p>
      <div className={c.choiceList} role="radiogroup" aria-label={w.squadFrom}>
       <button type="button" role="radio" aria-checked={from===''} className={c.choice} onClick={()=>setFrom('')}>{w.startEmpty}</button>
       {withPlayers.map(t=><button key={t.id} type="button" role="radio" aria-checked={from===t.id} className={c.choice} onClick={()=>setFrom(t.id)}>
        {w.copyFrom(t.team.name||w.teamN(teams.teams.indexOf(t)+1))}<small>{w.playersN(t.team.players.length)}</small></button>)}
      </div>
      <div className={c.btnRow}><button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>setView({k:'add',step:1})}>{w.prevStep}</button>
       <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>onAdd({name:name.trim()||w.teamN(teams.teams.length+1),format,from:from||undefined})} data-team-create="">{w.createTeam}</button></div>
     </>}
    </>}
   </div>
  </div>
 </div>;
}
export const presetSettings=(format:string)=>settingsFor(presetOf(format));
