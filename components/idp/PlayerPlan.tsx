'use client';
/**
 * The player's plan (docs/idp/DESIGN.md §10, simplified Oct 10 2026). One loop: pick a goal → practise → check in.
 *   Home      my goal (growth ring, "I can…", Try it), this week's practice dots, ONE main action bottom right:
 *             Practise (or "Talk it through" when the six-week review is due, or "Pick a goal" when one was just met)
 *   Practise  one mission at a time, its island link, "I did it!" → straight to Check in
 *   Check in  how it felt (faces), an optional note (device-only words), "I'd like some help" → Save → Home
 *   Talk it through (Review.tsx) · Picking a goal (PlanBuilder.tsx) · the celebration (Celebrate.tsx)
 * Grown-up and coach tools sit behind one clear button at the bottom of Home ("For grown-ups and coaches").
 * Every screen: Back bottom left, one main action bottom right (Nav.tsx). Motion: one short entry per screen; no loops, no rAF.
 */
import {useEffect,useState} from 'react';
import {CORNERS,cornerLabel,goalById,type Corner,type IdpGoal} from '@/lib/coaches/idp';
import {CHEERS,FEELS,FEEL_IDS,SKILLS,type FeelId} from '@/lib/coaches/idp/skills';
import {doneThisWeek,goalGrowth,goalsOf,missionTarget,READY_MOMENTS,weekMissions,weekStart,type IslandSaves} from '@/lib/coaches/idp/journey';
import {addText,checkIn,daysUntil,markMission,meetGoal,needsNextGoal,removeText,reviewDue2,setStrength2,unmarkMission,type IdpState2,type IdpText,type PlanGoal} from '@/lib/coaches/idp/store';
import {openBoardPlay,boardPlays} from '@/lib/coaches/idp/board';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {CornerGlyph,Face,GrowthRing,SkillGlyph} from './Art';
import Celebrate from './Celebrate';
import PlanBuilder,{type PickMode} from './PlanBuilder';
import Review from './Review';
import {Footer,Go,Screen} from './Nav';
import {openIslandLink} from './useIdp';
import s from './Idp.module.css';

const LINK_VERB={lesson:'Watch the lesson',arcade:'Play the game',card:'See the card',story:'Watch the story'} as const;
const WHERE={home:'At home',training:'At training',island:'On the island'} as const;
const CORNER_IDS=Object.keys(CORNERS) as Corner[];
const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});

export type PlayerScreen={kind:'home'}|{kind:'practise'}|{kind:'checkin';mission?:{id:string;goalId:string}}|{kind:'review'}|{kind:'pick';mode:PickMode;changeId?:string};
export type PlayerProps={state:IdpState2;commit:(s:IdpState2)=>void;text:IdpText;commitText:(t:IdpText)=>void;saves:IslandSaves;now:number;
 onLaunch:()=>void;onGrownUps:()=>void;initial?:PlayerScreen};

export default function PlayerPlan({state,commit,text,commitText,saves,now,onLaunch,onGrownUps,initial}:PlayerProps){
 const [screen,setScreen]=useState<PlayerScreen>(initial??{kind:'home'});
 const [status,setStatus]=useState<string|null>(null);
 const [celebrate,setCelebrate]=useState<IdpGoal|null>(null);
 useEffect(()=>{countIdp('open');},[]);
 const home=(msg:string|null=null)=>{setStatus(msg);setScreen({kind:'home'});};
 const plan=state.plan;
 if(!plan)return <PlanBuilder state={state} commit={commit} mode="first" onDone={()=>home('Your plan is ready! Tap Practise to start.')}/>;
 const goals=goalsOf(plan);
 if(screen.kind==='pick')return <PlanBuilder key={screen.mode+(screen.changeId??'')} state={state} commit={commit} mode={screen.mode} changeId={screen.changeId}
  onDone={()=>home('New goal saved. Let’s practise!')} onCancel={needsNextGoal(state)&&screen.mode==='next'?undefined:()=>home()}/>;
 return <div className={s.idp} data-idp-player data-screen={screen.kind}>
  {screen.kind==='home'&&<Home state={state} commit={commit} saves={saves} now={now} status={status} onLaunch={onLaunch} onGrownUps={onGrownUps}
   go={next=>{setStatus(null);setScreen(next);}} onCelebrate={g=>{setCelebrate(g);countIdp('met');}}/>}
  {screen.kind==='practise'&&<Practise state={state} commit={commit} saves={saves} now={now} onLaunch={onLaunch} onBack={()=>home()}
   onDid={(id,goalId)=>setScreen({kind:'checkin',mission:{id,goalId}})}/>}
  {screen.kind==='checkin'&&<CheckIn state={state} commit={commit} text={text} commitText={commitText} now={now} mission={screen.mission}
   onBack={()=>home()} onSaved={()=>home(screen.mission?'Great practice! Your ring grew.':'Saved. Thanks for checking in!')}/>}
  {screen.kind==='review'&&<Review state={state} commit={commit} now={now} onBack={()=>home()}
   onDone={o=>{if(o==='keep')home('Great talk! Keep going for six more weeks.');else setScreen({kind:'pick',mode:goals.length?'change':'next',changeId:goals.length===1?goals[0].goal.id:goals.at(-1)?.goal.id});}}/>}
  {celebrate&&<Celebrate goal={celebrate} pieces={goalGrowth(plan,celebrate,saves).pieces} onDone={next=>{
   const met=meetGoal(state,celebrate.id,Date.now());commit(met);setCelebrate(null);
   if(next==='choose')setScreen({kind:'pick',mode:met.plan?.goals.length?'add':'next'});else home('It’s on your shelf of things you can do now.');
  }}/>}
 </div>;
}

// ---- Home ----------------------------------------------------------------------------------------------------------------
function Home({state,commit,saves,now,status,go,onLaunch,onGrownUps,onCelebrate}:{state:IdpState2;commit:(s:IdpState2)=>void;saves:IslandSaves;now:number;status:string|null;
 go:(s:PlayerScreen)=>void;onLaunch:()=>void;onGrownUps:()=>void;onCelebrate:(g:IdpGoal)=>void}){
 const plan=state.plan!,goals=goalsOf(plan),due=reviewDue2(plan,now),waiting=needsNextGoal(state);
 const missions=weekMissions(plan,now),done=missions.filter(m=>doneThisWeek(plan,m.mission.id,m.goal.id,now)).length;
 const cheer=plan.cheers.at(-1);
 const shelf=state.history.filter(h=>h.outcome==='met').map(h=>goalById(h.goalId)).filter((g):g is IdpGoal=>!!g);
 const format=goals[0]?.goal.format??state.format;
 const main=waiting?<Go label="Pick a goal" forward data-idp-main="pick" onGo={()=>go({kind:'pick',mode:'next'})}/>
  :due?<Go label="Talk it through" forward data-idp-main="review" onGo={()=>go({kind:'review'})}/>
  :<Go label="Practise" forward data-idp-main="practise" onGo={()=>go({kind:'practise'})}/>;
 return <Screen id="idp-home" title={waiting?'Time for a new goal':goals.length>1?'My two goals':'My goal'} data-idp-home>
  {status&&<p className={s.savedNote} role="status">{status}</p>}
  {cheer&&<p className={s.cheer}><b>{cheer.from==='home'?'A cheer from home':'A cheer from your coach'}</b>{CHEERS[cheer.id]}</p>}
  {waiting&&<div className={s.card}><h4>You did it!</h4><p className={s.small}>Pick the next thing you want to get better at.</p></div>}
  {due&&!waiting&&<div className={s.card}><h4>Time to talk it through</h4><p className={s.small}>Every six weeks, look at your goal with your coach or a grown-up.</p></div>}
  {goals.map(({pg,goal})=><GoalCard key={goal.id} pg={pg} goal={goal} plan={plan} saves={saves} onLaunch={onLaunch} two={goals.length>1}
   onCelebrate={()=>onCelebrate(goal)} onChange={()=>go({kind:'pick',mode:'change',changeId:goal.id})}/>)}
  {missions.length>0&&<div className={`${s.card} ${s.weekRow}`} data-week-dots>
   <ul className={s.dots} aria-hidden="true">{missions.map((m,i)=><li key={i} data-done={i<done||undefined}>{i<done?'✓':''}</li>)}</ul>
   <p className={s.small} style={{flex:'1 1 160px',color:'var(--ink)',fontWeight:700}}>{done===0?'This week: try one practice. Any one is great.':done>=missions.length?'All this week’s practices done. Amazing!':`This week: ${done} of ${missions.length} practices done.`}</p>
  </div>}
  <ul className={`${s.card} ${s.more}`} aria-label="More">
   {!waiting&&<li><button type="button" className={s.textBtn} data-idp-checkin onClick={()=>go({kind:'checkin'})}>Tell how it’s going</button></li>}
   {!waiting&&!due&&<li><button type="button" className={s.textBtn} data-idp-review onClick={()=>go({kind:'review'})}>Talk it through<small>in {daysUntil(plan.reviewAt,now)} days</small></button></li>}
   {goals.length===1&&<li><button type="button" className={s.textBtn} data-idp-add onClick={()=>go({kind:'pick',mode:'add'})}>Add a second goal</button></li>}
   {goals.length===1&&<li><button type="button" className={s.textBtn} data-idp-change onClick={()=>go({kind:'pick',mode:'change',changeId:goals[0].goal.id})}>Change my goal</button></li>}
  </ul>
  <div className={s.card}>
   <h4 id="idp-good-at">I’m good at… <span className={s.small}>(pick one if you like)</span></h4>
   <div className={s.cornerChips} role="group" aria-labelledby="idp-good-at">{CORNER_IDS.map(c=><button key={c} type="button" className={s.cornerChip} data-corner={c} aria-pressed={plan.strength===c} onClick={()=>commit(setStrength2(state,plan.strength===c?null:c))}><CornerGlyph corner={c} size={26}/><span>{cornerLabel(format,c)}</span></button>)}</div>
   {shelf.length>0&&<><h4>Things I can do now</h4><ul className={s.shelf}>{shelf.map((g,i)=><li key={g.id+i}><span className={s.shelfBadge}><SkillGlyph skill={g.skill} size={22}/></span>{g.ican}</li>)}</ul></>}
  </div>
  <button type="button" className={`${s.ghost} ${s.grownEntry}`} data-idp-grownups onClick={onGrownUps}>For grown-ups and coaches</button>
  <Footer>{main}</Footer>
 </Screen>;
}
function GoalCard({pg,goal,plan,saves,two,onLaunch,onCelebrate,onChange}:{pg:PlanGoal;goal:IdpGoal;plan:NonNullable<IdpState2['plan']>;saves:IslandSaves;two:boolean;onLaunch:()=>void;onCelebrate:()=>void;onChange:()=>void}){
 const skill=SKILLS[goal.skill],g=goalGrowth(plan,goal,saves),ready=g.moments>=READY_MOMENTS;
 const play=pg.play?boardPlays().find(p=>p.id===pg.play):undefined;
 return <article className={s.goalCard} data-goal={goal.id}>
  <div className={s.goalTop}>
   <GrowthRing skill={goal.skill} pieces={g.pieces} grow size={104} label={`${goal.ican}: practised ${g.moments} time${g.moments===1?'':'s'} so far`}/>
   <div style={{display:'grid',gap:6,minWidth:0}}><span className={s.cornerTag} data-corner={goal.corner}>{skill.kid}</span><h4 className={s.ican}>{goal.ican}</h4></div>
  </div>
  <div className={s.tryBand}><b>Try it</b><span>{goal.tryIt}</span></div>
  {pg.cue!==undefined&&<p className={s.coachSays}><b>Coach says:</b> “{skill.cues[pg.cue]}”</p>}
  <p className={s.small}>{g.moments?`You’ve practised ${g.moments} time${g.moments===1?'':'s'}. Your ring only grows.`:'Each practice adds a piece to your ring. It only grows.'}</p>
  {(ready||pg.play||two)&&<div className={s.cardActions}>
   {ready&&<button type="button" className={s.primary} data-can-now={goal.id} onClick={onCelebrate}>I can do it now!</button>}
   {pg.play&&<button type="button" className={s.textBtn} onClick={()=>{onLaunch();openBoardPlay(pg.play!);}}>See {play?`“${play.title}”`:'my coach’s play'} on the board</button>}
   {two&&<button type="button" className={s.textBtn} data-idp-change={goal.id} onClick={onChange}>Change this goal</button>}
  </div>}
 </article>;
}

// ---- Practise ------------------------------------------------------------------------------------------------------------
function Practise({state,commit,saves,now,onLaunch,onBack,onDid}:{state:IdpState2;commit:(s:IdpState2)=>void;saves:IslandSaves;now:number;onLaunch:()=>void;onBack:()=>void;onDid:(id:string,goalId:string)=>void}){
 const plan=state.plan!,missions=weekMissions(plan,now);
 const [i,setI]=useState(()=>Math.max(0,missions.findIndex(m=>!doneThisWeek(plan,m.mission.id,m.goal.id,now))));
 const m=missions[i%Math.max(1,missions.length)];
 if(!m)return <Screen id="idp-practise" title="Practise"><p className={s.lead}>Pick a goal first.</p><Footer back={onBack}/></Screen>;
 const done=doneThisWeek(plan,m.mission.id,m.goal.id,now),target=missionTarget(m.mission,m.goal,saves);
 return <Screen key={m.mission.id+m.goal.id} id="idp-practise" kicker={`${WHERE[m.mission.where]}${m.mission.minutes?` · ${m.mission.minutes} min`:''}`} title={m.mission.title} data-idp-practise data-mission={m.mission.id}>
  <div className={`${s.card} ${s.mission}`}>
   {(plan.goals.length>1||done)&&<div className={s.row}>{plan.goals.length>1&&<span className={s.forGoal}><SkillGlyph skill={m.goal.skill} size={16}/>{m.skill.kid}</span>}{done&&<span className={s.doneTag}>✓ Done this week</span>}</div>}
   <ol className={s.steps}>{m.mission.steps.map(t=><li key={t}>{t}</li>)}</ol>
   {target&&<button type="button" className={`${s.ghost} ${s.islandLink}`} onClick={()=>openIslandLink(target.open,onLaunch,saves)}>{LINK_VERB[target.kind]}<small>{target.label}</small></button>}
  </div>
  <div className={s.card}>
   <p className={s.small}>You need a ball and a bit of space. Ask a grown-up to help, and stop while it’s still fun.</p>
   {missions.length>1&&<button type="button" className={s.textBtn} data-idp-another onClick={()=>setI(n=>n+1)}>Try a different one</button>}
  </div>
  <Footer back={onBack}><Go label="I did it!" data-mission-done={m.mission.id} onGo={()=>{commit(markMission(state,m.mission.id,m.goal.id,Date.now()));countIdp('mission');onDid(m.mission.id,m.goal.id);}}/></Footer>
 </Screen>;
}

// ---- Check in ------------------------------------------------------------------------------------------------------------
function CheckIn({state,commit,text,commitText,now,mission,onBack,onSaved}:{state:IdpState2;commit:(s:IdpState2)=>void;text:IdpText;commitText:(t:IdpText)=>void;now:number;
 mission?:{id:string;goalId:string};onBack:()=>void;onSaved:()=>void}){
 const plan=state.plan!,goals=goalsOf(plan);
 const [goalId,setGoalId]=useState(mission?.goalId??goals[0]?.goal.id??'');
 const [feel,setFeel]=useState<FeelId|null>(null),[help,setHelp]=useState(false),[note,setNote]=useState('');
 const mine=text.notes.filter(n=>n.kind==='player').slice(-3).reverse();
 const save=()=>{if(!feel)return;const at=Date.now();
  commit(checkIn(state,{goalId,feel,...(help?{help:true}:{})},at));countIdp('checkin');
  if(note.trim()){const next=addText(text,'player',note,at,goalId);if(next!==text){commitText(next);countIdp('note');}}
  onSaved();};
 return <Screen id="idp-checkin" kicker={mission?'Nice one!':'Check in'} title="How did it feel?" data-idp-checkin-screen>
  <div className={s.card}>
   {goals.length>1&&<div className={s.chips} role="group" aria-label="Which goal?">{goals.map(({goal})=><button key={goal.id} type="button" className={s.chip} aria-pressed={goalId===goal.id} onClick={()=>setGoalId(goal.id)}><SkillGlyph skill={goal.skill} size={18}/>{SKILLS[goal.skill].kid}</button>)}</div>}
   <div className={s.faces} role="group" aria-label="How did it feel?">{FEEL_IDS.map(f=><button key={f} type="button" className={s.faceBtn} aria-pressed={feel===f} data-feel={f} onClick={()=>setFeel(f)}><Face feel={f} size={56}/><span>{FEELS[f].kid}</span></button>)}</div>
   <p className={s.small}>There’s no right answer. Tricky means you’re stretching.</p>
  </div>
  <div className={s.card}>
   <label className={s.field} htmlFor="idp-player-note">Anything to remember? <span className={s.small}>(optional)</span>
    <textarea id="idp-player-note" value={note} maxLength={280} placeholder="Like: I looked before my pass twice!" onChange={e=>setNote(e.target.value)}/></label>
   <p className={s.small}>Your words stay on this device. They are never sent anywhere.</p>
   {mine.length>0&&<ul className={s.notes} aria-label="My notes">{mine.map(n=><li key={n.id}><time>{day(n.at)}</time><span>{n.text}</span><button type="button" aria-label="Delete note" onClick={()=>commitText(removeText(text,n.id))}>×</button></li>)}</ul>}
   <button type="button" className={s.helpToggle} aria-pressed={help} onClick={()=>setHelp(!help)}><span aria-hidden="true">{help?'✓':'+'}</span>I’d like some help with this</button>
   {help&&<p className={s.small}>Good idea. Your coach and grown-ups will see this when they open your plan on this device.</p>}
  </div>
  {mission&&<button type="button" className={`${s.textBtn} ${s.onSheet}`} data-idp-undo onClick={()=>{commit(unmarkMission(state,mission.id,weekStart(now)));onBack();}}>Oops, I didn’t do it yet</button>}
  <Footer back={onBack}><Go label="Save" disabled={!feel} data-checkin-save onGo={save}/></Footer>
 </Screen>;
}
