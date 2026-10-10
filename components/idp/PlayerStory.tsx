'use client';
/**
 * The player's plan as a story (docs/idp/DESIGN.md §2): five beats the player moves through by tapping Next/Back, the beat
 * rail, swiping, or the arrow keys. Each beat shows ONE idea with one hero motion that explains it:
 *   1 Start      where I started: my strength, the four corners, things I can already do   (pins drop in)
 *   2 My goal    the "I can…" goals: a growth ring per goal, island evidence flies in to join it  (ring grows)
 *   3 Practise   this week's missions, and the journey path that draws itself as missions are done  (path draws on)
 *   4 Feelings   picture check-ins, how trying felt over time, the proud-moments journal  (feel line draws on)
 *   5 Next       review, "I can do it now!" celebration, the next goal  (one stamp)
 * Motion: CSS keyframes that run once per beat entry (fill backwards, so nothing is "in effect" afterwards), CSS spring
 * `linear()` easings, SVG stroke draw-ons, and a spring FLIP (Web Animations) for the goal badge travelling between beats.
 * No requestAnimationFrame anywhere; at rest there are no running animations. Reduced motion: complete static beats.
 */
import {useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type ReactNode} from 'react';
import {NavigationButton} from '../DoneButton';
import {CORNERS,cornerLabel,goalById,goalsFor,showsFourCorners,type Corner,type IdpGoal} from '@/lib/coaches/idp';
import {CHEERS,FEELS,FEEL_IDS,PLACES,SKILLS,STICKERS,STICKER_IDS,type FeelId,type PlaceId,type StickerId} from '@/lib/coaches/idp/skills';
import {BEATS,READY_MOMENTS,doneThisWeek,feelLine,goalEvidence,goalGrowth,goalsOf,journeyStops,missionTarget,openingBeat,weekMissions,weekStart,type BeatId,type Evidence,type IslandSaves} from '@/lib/coaches/idp/journey';
import {addGoal,addProud,checkIn,daysUntil,markMission,meetGoal,needsNextGoal,reviewDue2,reviewPlan2,setStrength2,unmarkMission,type IdpState2,type PlanGoal,type ReviewOutcome} from '@/lib/coaches/idp/store';
import {measureFlips,playFlips,settle} from '@/lib/coaches/idp/motion';
import {openBoardPlay,boardPlays} from '@/lib/coaches/idp/board';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {CornerGlyph,Face,GrowthRing,SkillGlyph,Sticker,WhereGlyph} from './Art';
import Celebrate from './Celebrate';
import {openIslandLink} from './useIdp';
import s from './Idp.module.css';

const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const longDay=(at:number)=>new Date(at).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
const SOURCE_LABEL={me:'I chose this',together:'We chose this together',coach:'My coach’s goal'} as const;
const LINK_VERB={lesson:'Watch the lesson',arcade:'Play the game',card:'See the card',story:'Watch the story'} as const;
const CORNER_IDS=Object.keys(CORNERS) as Corner[];
const v=(o:Record<string,string|number>)=>o as CSSProperties;

export type StoryProps={state:IdpState2;commit:(s:IdpState2)=>void;saves:IslandSaves;onLaunch:()=>void;now:number;
 /** Opens the plan builder (change goals); the story itself never deletes anything. */
 onRebuild:()=>void;initialBeat?:BeatId};

export default function PlayerStory({state,commit,saves,onLaunch,now,onRebuild,initialBeat}:StoryProps){
 const plan=state.plan!;
 const [beat,setBeat]=useState<BeatId>(()=>initialBeat??openingBeat(state,now));
 const [dir,setDir]=useState<1|-1>(1);
 const [celebrate,setCelebrate]=useState<IdpGoal|null>(null),[pickNext,setPickNext]=useState(0);
 const root=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),flips=useRef<Map<string,DOMRect>>(new Map());
 const index=BEATS.findIndex(b=>b.id===beat);
 const goals=goalsOf(plan);
 const go=(next:BeatId)=>{if(next===beat)return;settle(stage.current);flips.current=measureFlips(root.current);setDir(BEATS.findIndex(b=>b.id===next)>index?1:-1);setBeat(next);};
 const step=(d:1|-1)=>{const n=BEATS[index+d];if(n)go(n.id);};
 // FLIP: the goal badge travels between its big place (My goal) and the small header chip (other beats).
 useLayoutEffect(()=>{playFlips(root.current,flips.current,{scale:true});flips.current=new Map();
  stage.current?.focus({preventScroll:true});root.current?.closest('[class*="body"]')?.scrollTo?.({top:0});},[beat]);
 useEffect(()=>{countIdp('open');},[]);
 // Swipe between beats (horizontal drags only; taps and vertical scrolls are left alone).
 const swipe=useRef<{x:number;y:number;id:number}|null>(null);
 const keys=(e:ReactKeyboardEvent)=>{const t=e.target as HTMLElement;if(/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}};
 const record=(next:IdpState2)=>commit(next);
 const done=(g:IdpGoal)=>{setCelebrate(g);countIdp('met');};

 return <div ref={root} className={s.story} data-idp-story data-beat={beat} onKeyDown={keys}>
  <div className={s.storyTop}>
   <div className={s.miniGoals} aria-hidden={beat==='goal'}>{beat!=='goal'&&goals.map(({goal})=><span key={goal.id} className={s.miniGoal} data-flip={'goal-'+goal.id}><span className={s.miniGlyph}><SkillGlyph skill={goal.skill} size={18}/></span><span className={s.miniText}>{goal.ican}</span></span>)}</div>
   <nav className={s.rail} aria-label="Plan story">{BEATS.map((b,i)=><button key={b.id} type="button" className={s.railStop} aria-current={b.id===beat?'step':undefined} data-done={i<index||undefined} onClick={()=>go(b.id)}><i aria-hidden="true">{i+1}</i><span>{b.label}</span></button>)}</nav>
  </div>
  <div ref={stage} className={s.stage} key={beat} data-enter={dir>0?'fwd':'back'} tabIndex={-1} aria-live="polite"
   onPointerDown={e=>{if(e.pointerType!=='mouse')swipe.current={x:e.clientX,y:e.clientY,id:e.pointerId};}}
   onPointerUp={e=>{const w=swipe.current;swipe.current=null;if(!w||w.id!==e.pointerId)return;const dx=e.clientX-w.x,dy=e.clientY-w.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)step(dx<0?1:-1);}}
   onPointerCancel={()=>{swipe.current=null;}}>
   {beat==='start'&&<StartBeat state={state} commit={record}/>}
   {beat==='goal'&&<GoalBeat state={state} saves={saves} onLaunch={onLaunch}/>}
   {beat==='practice'&&<PracticeBeat state={state} commit={record} saves={saves} onLaunch={onLaunch} now={now}/>}
   {beat==='feel'&&<FeelBeat state={state} commit={record} now={now}/>}
   {beat==='next'&&<NextBeat key={pickNext} startAdding={pickNext>0} state={state} commit={record} saves={saves} now={now} onCelebrate={done} onRebuild={onRebuild}/>}
  </div>
  <div className={s.storyNav}>
   {index>0?<NavigationButton key={'b'+beat} back label="Previous" style={{'--navigation-width':'104px'} as CSSProperties} onNavigate={()=>step(-1)}/>:<span aria-hidden="true" className={s.navSpacer}/>}
   <span className={s.navCount} aria-hidden="true">{index+1} / {BEATS.length}</span>
   {index<BEATS.length-1?<NavigationButton key={'n'+beat} label="Next" onNavigate={()=>step(1)}/>:<span aria-hidden="true" className={s.navSpacer}/>}
  </div>
  {celebrate&&<Celebrate goal={celebrate} pieces={goalGrowth(plan,celebrate,saves).pieces} onDone={next=>{
   const met=meetGoal(state,celebrate.id,Date.now());commit(met);setCelebrate(null);flips.current=new Map();
   if(next==='choose'){setPickNext(n=>n+1);setBeat('next');}
  }}/>}
 </div>;
}

/** A beat's heading: a kicker, one title, and the one-line caption that says what the picture means. */
function Head({kicker,title,caption}:{kicker:string;title:ReactNode;caption?:string}){
 return <header className={s.beatHead}><p className={s.kicker} style={v({'--i':0})}>{kicker}</p><h3 className={s.beatTitle} style={v({'--i':1})}>{title}</h3>{caption&&<p className={s.caption} style={v({'--i':2})}>{caption}</p>}</header>;
}

// ---- 1. Where I started ----------------------------------------------------------------------------------------------------
function StartBeat({state,commit}:{state:IdpState2;commit:(s:IdpState2)=>void}){
 const plan=state.plan!,goals=goalsOf(plan),format=goals[0]?.goal.format??state.format;
 const met=state.history.filter(h=>h.outcome==='met').map(h=>goalById(h.goalId)!).filter(Boolean);
 const focus=new Set(goals.map(g=>g.goal.corner));
 return <section className={s.beat} data-beat-id="start" aria-labelledby="idp-beat-start">
  <Head kicker="Chapter 1 · Where I started" title={<span id="idp-beat-start">You started on {day(plan.setAt)}</span>} caption="Every player starts somewhere. This is your starting point, not a test."/>
  <div className={s.startMap} aria-hidden="true"><svg viewBox="0 0 320 70" className={s.startPath}><path d="M14 52 C80 52 90 18 160 22 S250 56 306 30" pathLength={1}/></svg><span className={s.pin} style={v({'--i':3})}>Start</span><span className={`${s.pin} ${s.pinNow}`} style={v({'--i':5})}>Now</span></div>
  <div className={s.panel} style={v({'--i':3})}>
   <h4>I’m good at…</h4><p className={s.small}>Pick the one you love. Strengths matter as much as goals.</p>
   <div className={s.cornerChips} role="group" aria-label="I’m good at">{CORNER_IDS.map((c,i)=><button key={c} type="button" className={s.cornerChip} data-corner={c} aria-pressed={plan.strength===c} style={v({'--i':4+i})} onClick={()=>commit(setStrength2(state,plan.strength===c?null:c))}><CornerGlyph corner={c} size={30}/><span>{cornerLabel(format,c)}</span></button>)}</div>
  </div>
  {showsFourCorners(format)&&<div className={s.panel} style={v({'--i':6})}><h4>The four corners</h4><p className={s.small}>Football has four sides. Your goals and your strength sit here.</p>
   <div className={s.corners}>{CORNER_IDS.map((c,i)=><div key={c} className={s.cornerCell} data-corner={c} data-focus={focus.has(c)||undefined} style={v({'--i':7+i})}><CornerGlyph corner={c} size={24}/><b>{cornerLabel(format,c)}</b><small>{focus.has(c)?'My goal':plan.strength===c?'My strength':' '}</small></div>)}</div></div>}
  {met.length>0&&<div className={s.panel} style={v({'--i':8})}><h4>Things I can do now</h4><ul className={s.shelf}>{met.map((g,i)=><li key={g.id+i} style={v({'--i':9+i})}><span className={s.shelfBadge}><SkillGlyph skill={g.skill} size={22}/></span>{g.ican}</li>)}</ul></div>}
 </section>;
}

// ---- 2. What I'm working on ------------------------------------------------------------------------------------------------
function GoalBeat({state,saves,onLaunch}:{state:IdpState2;saves:IslandSaves;onLaunch:()=>void}){
 const plan=state.plan!,goals=goalsOf(plan);
 if(!goals.length)return <section className={s.beat}><Head kicker="Chapter 2 · My goal" title="Time to choose a new goal" caption="Go to What’s next to pick one."/></section>;
 return <section className={s.beat} data-beat-id="goal" aria-labelledby="idp-beat-goal">
  <Head kicker="Chapter 2 · What I’m working on" title={<span id="idp-beat-goal">{goals.length>1?'My two goals':'My goal'}</span>} caption="Each ring piece is one time you practised. The ring only grows."/>
  {goals.map(({pg,goal},gi)=><GoalCard key={goal.id} pg={pg} goal={goal} plan={plan} saves={saves} onLaunch={onLaunch} order={gi}/>)}
 </section>;
}
function GoalCard({pg,goal,plan,saves,onLaunch,order}:{pg:PlanGoal;goal:IdpGoal;plan:NonNullable<IdpState2['plan']>;saves:IslandSaves;onLaunch:()=>void;order:number}){
 const skill=SKILLS[goal.skill],g=goalGrowth(plan,goal,saves),ev=goalEvidence(goal,saves);
 const play=pg.play?boardPlays().find(p=>p.id===pg.play):undefined;
 return <article className={s.goalCard} data-goal={goal.id} style={v({'--i':2+order*4})}>
  <div className={s.goalHero}>
   <div className={s.badgeWrap} data-flip={'goal-'+goal.id}><GrowthRing skill={goal.skill} pieces={g.pieces} grow label={`${goal.ican}: ${g.moments} practice moment${g.moments===1?'':'s'} so far`}/></div>
   <ul className={s.evidence} aria-label="Island practice for this goal">{ev.map((e,i)=><EvidenceChip key={e.key} e={e} i={i} onOpen={()=>openIslandLink(e.open,onLaunch,saves)}/>)}</ul>
  </div>
  <span className={s.cornerTag} data-corner={goal.corner}>{skill.kid}</span>
  <h4 className={s.ican}>{goal.ican}</h4>
  <p className={s.why}>{goal.why}</p>
  <div className={s.tryBand}><b>Try it</b><span>{goal.tryIt}</span></div>
  {pg.cue!==undefined&&<p className={s.coachSays}><b>Coach says:</b> “{skill.cues[pg.cue]}”</p>}
  {pg.play&&<button type="button" className={s.ghost} onClick={()=>{onLaunch();openBoardPlay(pg.play!);}}>See {play?`“${play.title}”`:'my coach’s play'} on the board</button>}
  <p className={s.stamp} data-source={pg.source}>{SOURCE_LABEL[pg.source]} · {day(pg.setAt)}</p>
  <p className={s.small}>{g.moments?`${g.missions} mission${g.missions===1?'':'s'}, ${g.tries} tr${g.tries===1?'y':'ies'} and ${g.lessons} island lesson${g.lessons===1?'':'s'} so far.`:'Your ring fills as you practise: missions, check-ins and island lessons.'}</p>
 </article>;
}
function EvidenceChip({e,i,onOpen}:{e:Evidence;i:number;onOpen:()=>void}){
 // Chips fly in from around the badge to their place (the "evidence joins the goal" motion).
 const angle=(i*137)%360,fx=Math.round(Math.cos(angle*Math.PI/180)*-90),fy=Math.round(Math.sin(angle*Math.PI/180)*-60);
 return <li className={s.evChip} data-kind={e.kind} data-done={e.done||undefined} style={v({'--i':4+i,'--fx':fx+'px','--fy':fy+'px'})}>
  <button type="button" onClick={onOpen} data-tip={e.done?'Explored on the island':'Open it on the island'}><span className={s.evIcon} aria-hidden="true">{e.done?'✓':e.kind==='lesson'?'▶':e.kind==='arcade'?'◆':e.kind==='card'?'▣':'✦'}</span><span><b>{e.label}</b><small>{e.detail}</small></span></button>
 </li>;
}

// ---- 3. What I've practised ------------------------------------------------------------------------------------------------
function PracticeBeat({state,commit,saves,onLaunch,now}:{state:IdpState2;commit:(s:IdpState2)=>void;saves:IslandSaves;onLaunch:()=>void;now:number}){
 const plan=state.plan!,missions=weekMissions(plan,now),stops=journeyStops(state);
 const [fresh,setFresh]=useState<string|null>(null);
 if(!plan.goals.length)return <section className={s.beat}><Head kicker="Chapter 3 · Practise" title="Choose your next goal first" caption="Then new missions arrive here."/></section>;
 const doneCount=missions.filter(m=>doneThisWeek(plan,m.mission.id,m.goal.id,now)).length;
 return <section className={s.beat} data-beat-id="practice" aria-labelledby="idp-beat-practice">
  <Head kicker="Chapter 3 · What I’ve practised" title={<span id="idp-beat-practice">This week’s missions</span>} caption="Every stop on the path is something you did. The path only grows."/>
  <JourneyPath stops={stops} fresh={fresh!==null}/>
  <p className={s.weekLine} style={v({'--i':3})}>{doneCount===0?'Pick one to start. Any one is great.':doneCount===missions.length?'All done this week. Amazing practice!':`${doneCount} done this week. Keep it fun.`}</p>
  <ul className={s.missions}>{missions.map((m,i)=>{const done=doneThisWeek(plan,m.mission.id,m.goal.id,now),target=missionTarget(m.mission,m.goal,saves);
   return <li key={m.mission.id+m.goal.id} className={s.mission} data-done={done||undefined} data-fresh={fresh===m.mission.id||undefined} data-mission={m.mission.id} style={v({'--i':4+i})}>
    <div className={s.missionHead}><span className={s.where} data-where={m.mission.where}><WhereGlyph where={m.mission.where}/>{m.mission.where==='home'?'At home':m.mission.where==='training'?'At training':'On the island'}{m.mission.minutes?` · ${m.mission.minutes} min`:''}</span>{plan.goals.length>1&&<span className={s.forGoal}><SkillGlyph skill={m.goal.skill} size={16}/>{m.skill.kid}</span>}</div>
    <h4>{m.mission.title}</h4>
    <ol>{m.mission.steps.map(t=><li key={t}>{t}</li>)}</ol>
    <div className={s.row}>
     {target&&<button type="button" className={s.ghost} onClick={()=>openIslandLink(target.open,onLaunch,saves)}>{LINK_VERB[target.kind]}<small>{target.label}</small></button>}
     {done?<><span className={s.doneStamp} aria-label="Done this week">✓ Done!</span><button type="button" className={s.textBtn} onClick={()=>commit(unmarkMission(state,m.mission.id,weekStart(now)))}>Undo</button></>
     :<button type="button" className={s.primary} data-mission-done={m.mission.id} onClick={()=>{setFresh(m.mission.id);commit(markMission(state,m.mission.id,m.goal.id,Date.now()));countIdp('mission');}}>I did it!</button>}
    </div>
   </li>;})}</ul>
  <p className={s.small}>Missions need a ball and a bit of space. Ask a grown-up to help, and stop while it’s still fun.</p>
 </section>;
}
/** The journey: a winding path that draws itself up to the newest stop. A fresh stop pops in once. */
function JourneyPath({stops,fresh}:{stops:ReturnType<typeof journeyStops>;fresh:boolean}){
 const n=Math.max(2,stops.length),W=320,H=96;
 const pts=stops.map((_,i)=>{const t=n===1?0:i/(Math.max(n,6)-1);return [16+t*(W-32),H/2+Math.sin(t*Math.PI*2.2)*26] as const;});
 const all=Array.from({length:Math.max(n,6)},(_,i)=>{const t=i/(Math.max(n,6)-1);return [16+t*(W-32),H/2+Math.sin(t*Math.PI*2.2)*26] as const;});
 const d=(p:readonly (readonly [number,number])[])=>p.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
 const done=Math.max(0,stops.length-1)/(all.length-1);
 return <figure className={s.journey} style={v({'--i':2})} data-fresh={fresh||undefined}>
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Your practice path: ${stops.length} stop${stops.length===1?'':'s'} so far`}>
   <path d={d(all)} className={s.pathAhead}/>
   <path d={d(all)} className={s.pathDone} pathLength={1} style={v({'--p':done.toFixed(3)})}/>
   {pts.map(([x,y],i)=><g key={i} className={s.stop} data-kind={stops[i].kind} data-last={i===pts.length-1||undefined} style={v({'--i':3+i})}><circle cx={x} cy={y} r={i===0?7:5.5}/>{i===0&&<text x={x} y={y+20} textAnchor="middle">Start</text>}</g>)}
   <text x={all.at(-1)![0]} y={all.at(-1)![1]+20} textAnchor="end" className={s.pathEnd}>Review</text>
  </svg>
  <figcaption>{stops.length<=1?'Your first stop is waiting.':`Stops: missions, check-ins, proud moments and talks with your coach.`}</figcaption>
 </figure>;
}

// ---- 4. How it feels -------------------------------------------------------------------------------------------------------
function FeelBeat({state,commit,now}:{state:IdpState2;commit:(s:IdpState2)=>void;now:number}){
 const plan=state.plan!,goals=goalsOf(plan);
 const [goalId,setGoalId]=useState(goals[0]?.goal.id??'');
 const [feel,setFeel]=useState<FeelId|null>(null),[where,setWhere]=useState<PlaceId|null>(null),[help,setHelp]=useState(false),[saved,setSaved]=useState(false);
 const [picking,setPicking]=useState(false);
 useEffect(()=>{if(!goals.some(g=>g.goal.id===goalId)&&goals[0])setGoalId(goals[0].goal.id);},[goals,goalId]);
 const cheers=plan.cheers.slice(-2).reverse();
 return <section className={s.beat} data-beat-id="feel" aria-labelledby="idp-beat-feel">
  <Head kicker="Chapter 4 · How it feels" title={<span id="idp-beat-feel">How did trying it feel?</span>} caption="There’s no right answer. Ups and downs mean you are stretching."/>
  {cheers.length>0&&<div className={s.cheers} style={v({'--i':2})}>{cheers.map(c=><p key={c.at} className={s.cheer}><b>{c.from==='home'?'A cheer from home':'A cheer from your coach'}</b>{CHEERS[c.id]}</p>)}</div>}
  {goals.length>0&&<div className={s.panel} style={v({'--i':3})}>
   {goals.length>1&&<div className={s.chips} role="group" aria-label="Which goal?">{goals.map(({goal})=><button key={goal.id} type="button" className={s.chip} aria-pressed={goalId===goal.id} onClick={()=>setGoalId(goal.id)}><SkillGlyph skill={goal.skill} size={18}/>{SKILLS[goal.skill].kid}</button>)}</div>}
   <div className={s.faces} role="group" aria-label="How did it feel?">{FEEL_IDS.map((f,i)=><button key={f} type="button" className={s.faceBtn} aria-pressed={feel===f} data-feel={f} style={v({'--i':4+i})} onClick={()=>{setFeel(f);setSaved(false);}}><Face feel={f} size={58}/><span>{FEELS[f].kid}</span></button>)}</div>
   {feel&&<>
    <div className={s.chips} role="group" aria-label="Where?">{(Object.keys(PLACES) as PlaceId[]).map(p=><button key={p} type="button" className={s.chip} aria-pressed={where===p} onClick={()=>setWhere(where===p?null:p)}>{PLACES[p]}</button>)}</div>
    <button type="button" className={s.helpToggle} aria-pressed={help} onClick={()=>setHelp(!help)}><span aria-hidden="true">{help?'✓':'+'}</span>I’d like some help with this</button>
    {help&&<p className={s.small}>Good idea. Tell your coach or a grown-up you trust. They’ll see it when they open your plan on this device.</p>}
    <button type="button" className={s.primary} data-checkin-save onClick={()=>{commit(checkIn(state,{goalId,feel,...(where?{where}:{}),...(help?{help:true}:{})},Date.now()));countIdp('checkin');setFeel(null);setWhere(null);setHelp(false);setSaved(true);}}>Save my check-in</button>
   </>}
   {saved&&<p className={s.savedNote} role="status">Saved. Thanks for checking in!</p>}
  </div>}
  {goals.map(({goal})=><FeelLine key={goal.id+plan.checkins.length} goal={goal} plan={plan}/>)}
  <div className={s.panel} style={v({'--i':7})}>
   <h4>Proud moments</h4><p className={s.small}>Add a sticker for something you’re proud of. No writing needed.</p>
   {plan.proud.length>0&&<ul className={s.journal} aria-label="My proud moments">{plan.proud.slice(-8).reverse().map((p,i)=><li key={p.at} style={v({'--i':8+i})}><Sticker id={p.sticker} size={48}/><span>{STICKERS[p.sticker].kid}</span><time>{day(p.at)}</time></li>)}</ul>}
   {picking?<div className={s.stickerPick} role="group" aria-label="Choose a sticker">{STICKER_IDS.map((id,i)=><button key={id} type="button" className={s.stickerBtn} data-sticker={id} style={v({'--i':i})} onClick={()=>{commit(addProud(state,id as StickerId,Date.now(),goalId||undefined));countIdp('proud');setPicking(false);}}><Sticker id={id} size={52}/><span>{STICKERS[id].kid}</span></button>)}</div>
   :<button type="button" className={s.ghost} data-add-proud onClick={()=>setPicking(true)}>Add a proud moment</button>}
  </div>
 </section>;
}
/** How trying felt over time for one goal: a line that draws on, faces at each check-in. Small multiples, one per goal. */
function FeelLine({goal,plan}:{goal:IdpGoal;plan:NonNullable<IdpState2['plan']>}){
 const pts=feelLine(plan,goal.id);
 if(!pts.length)return <p className={s.small} style={v({'--i':5})}>{SKILLS[goal.skill].kid}: your check-ins will show up here as a line.</p>;
 // Under-8s and 7v7: faces in a row, never charted as a line (RESEARCH.md §2.4: young self-ratings are conversation starters).
 const row=goal.format==='7v7';
 const W=300,H=row?40:86,x=(i:number)=>pts.length===1?W/2:18+i*(W-36)/(pts.length-1),y=(l:number)=>row?H/2:H-16-l*(H-34)/2;
 const d=pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(p.level).toFixed(1)}`).join(' ');
 const ups=pts.slice(1).filter((p,i)=>p.level>pts[i].level).length;
 return <figure className={s.feelLine} style={v({'--i':5})}>
  <figcaption><SkillGlyph skill={goal.skill} size={16}/> {SKILLS[goal.skill].kid}</figcaption>
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`How trying “${goal.ican}” felt over ${pts.length} check-in${pts.length===1?'':'s'}: from ${FEELS[pts[0].feel].kid} to ${FEELS[pts.at(-1)!.feel].kid}.`}>
   {!row&&[0,1,2].map(l=><line key={l} x1="10" x2={W-10} y1={y(l)} y2={y(l)} className={s.feelGrid}/>)}
   {pts.length>1&&!row&&<path d={d} className={s.feelPath} pathLength={1}/>}
   {pts.map((p,i)=><g key={p.at} transform={`translate(${x(i)-11} ${y(p.level)-11})`} className={s.feelDot} style={v({'--i':6+i})}><Face feel={p.feel} size={22}/></g>)}
  </svg>
  <p className={s.small}>{row?'Every face is a try. Talk about them with your coach or a grown-up.':pts.length<2?'One check-in so far. Each one adds a face.':ups?`It went up ${ups} time${ups===1?'':'s'}. Every face is a try.`:'Still tricky is normal. Keep trying, and ask for help if you want it.'}</p>
 </figure>;
}

// ---- 5. What's next --------------------------------------------------------------------------------------------------------
function NextBeat({state,commit,saves,now,onCelebrate,onRebuild,startAdding=false}:{startAdding?:boolean;state:IdpState2;commit:(s:IdpState2)=>void;saves:IslandSaves;now:number;onCelebrate:(g:IdpGoal)=>void;onRebuild:()=>void}){
 const plan=state.plan!,goals=goalsOf(plan),due=reviewDue2(plan,now);
 const [notYet,setNotYet]=useState<string|null>(null),[adding,setAdding]=useState(needsNextGoal(state)||startAdding),[reviewing,setReviewing]=useState(false);
 useEffect(()=>{if(needsNextGoal(state))setAdding(true);},[state]);
 const missions=weekMissions(plan,now).filter(m=>!doneThisWeek(plan,m.mission.id,m.goal.id,now));
 const review=(o:ReviewOutcome)=>{commit(reviewPlan2(state,o,Date.now()));countIdp('review');setReviewing(false);if(o!=='keep')setAdding(true);};
 if(adding)return <section className={s.beat} data-beat-id="next" aria-labelledby="idp-beat-next">
  <Head kicker="Chapter 5 · What’s next" title={<span id="idp-beat-next">{needsNextGoal(state)?'Choose your next goal':'Add or change a goal'}</span>} caption="Pick something you want to get better at. You can have one or two."/>
  <NextGoalPicker state={state} onPick={(id,replace)=>{commit(addGoal(state,{goalId:id,source:'me'},Date.now(),replace));countIdp('goal');setAdding(false);}} onCancel={needsNextGoal(state)?undefined:()=>setAdding(false)}/>
 </section>;
 return <section className={s.beat} data-beat-id="next" aria-labelledby="idp-beat-next">
  <Head kicker="Chapter 5 · What’s next" title={<span id="idp-beat-next">{due?'Time to talk it through':missions.length?'Next up':'Great week!'}</span>} caption={due?'Every six weeks, sit down with your coach or a grown-up and look at your story together.':`Talk it through with your coach on ${longDay(plan.reviewAt)}.`}/>
  {due||reviewing?<div className={s.reviewCard} style={v({'--i':3})} data-review>
   <h4>Let’s talk it through</h4>
   <ol className={s.guide}><li><b>You first:</b> what can you do now that you couldn’t before?</li><li><b>Show me:</b> tell a time you tried your goal.</li><li><b>Coach or grown-up:</b> one moment you noticed, and one next step.</li><li><b>Decide together:</b></li></ol>
   <div className={s.row}><button type="button" className={s.primary} onClick={()=>review('keep')}>Keep going</button><button type="button" className={s.ghost} onClick={()=>review('adapt')}>Change it a little</button><button type="button" className={s.ghost} onClick={()=>review('new')}>Pick a new goal</button></div>
  </div>
  :<div className={s.reviewSoon} style={v({'--i':3})}><span className={s.daysBig}>{daysUntil(plan.reviewAt,now)}</span><span>days until you talk it through with your coach</span><button type="button" className={s.textBtn} onClick={()=>setReviewing(true)}>Talk it through now</button></div>}
  {missions[0]&&<p className={s.nextUp} style={v({'--i':4})}><WhereGlyph where={missions[0].mission.where}/> Next mission: <b>{missions[0].mission.title}</b></p>}
  {goals.map(({goal},i)=>{const ready=goalGrowth(plan,goal,saves).moments;return <div key={goal.id} className={s.canNow} style={v({'--i':5+i})}>
   <span className={s.canGlyph}><SkillGlyph skill={goal.skill} size={26}/></span><div><b>{goal.ican}</b>
   {notYet===goal.id?<p className={s.small} role="status">Nearly! Try it {READY_MOMENTS-ready} more time{READY_MOMENTS-ready===1?'':'s'} first (a mission or a check-in), then come back and show a grown-up.</p>
   :<p className={s.small}>Can you do it now in games? Show your coach or a grown-up, then celebrate.</p>}</div>
   <button type="button" className={s.primary} data-can-now={goal.id} onClick={()=>{if(ready>=READY_MOMENTS)onCelebrate(goal);else setNotYet(goal.id);}}>I can do it now!</button>
  </div>;})}
  <div className={s.row} style={v({'--i':8})}>{goals.length<2&&<button type="button" className={s.ghost} onClick={()=>setAdding(true)}>Add a second goal</button>}<button type="button" className={s.textBtn} onClick={onRebuild}>Change my plan</button></div>
 </section>;
}
function NextGoalPicker({state,onPick,onCancel}:{state:IdpState2;onPick:(id:string,replace?:string)=>void;onCancel?:()=>void}){
 const plan=state.plan!,format=state.format,current=new Set(plan.goals.map(g=>g.goalId));
 const met=new Set(state.history.filter(h=>h.outcome==='met').map(h=>h.goalId));
 const [replace,setReplace]=useState<string|undefined>(plan.goals.length>=2?plan.goals[1].goalId:undefined);
 const options=useMemo(()=>goalsFor(format).filter(g=>!current.has(g.id)).sort((a,b)=>Number(met.has(a.id))-Number(met.has(b.id))),[format,current,met]);
 return <div className={s.picker}>
  {plan.goals.length>=2&&<div className={s.panel}><h4>Swap which goal?</h4><div className={s.chips} role="group" aria-label="Swap which goal?">{plan.goals.map(g=>{const goal=goalById(g.goalId)!;return <button key={g.goalId} type="button" className={s.chip} aria-pressed={replace===g.goalId} onClick={()=>setReplace(g.goalId)}>{goal.ican}</button>;})}</div></div>}
  <ul className={s.goalOptions}>{options.map((g,i)=><li key={g.id} style={v({'--i':3+i})}><button type="button" className={s.goalOption} data-goal-option={g.id} data-corner={g.corner} onClick={()=>onPick(g.id,replace)}>
   <span className={s.optGlyph}><SkillGlyph skill={g.skill} size={26}/></span><span><b>{g.ican}</b><small>{g.why}</small>{met.has(g.id)&&<em>You did this one before</em>}</span></button></li>)}</ul>
  {onCancel&&<button type="button" className={s.textBtn} onClick={onCancel}>Keep my goals</button>}
 </div>;
}
