'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {loadCatalog,type FieldLesson} from '@/lib/town/formatLessons';
import {isVisual,visualHint,type VisualFieldQuestion} from '@/lib/town/visualQuiz';
import {GRAD_TITLES,GRADUATION_FORMATS,markFinaleSeen,recordFinale,type GradFormat} from '@/lib/endgame/graduationModel';
import {updateGraduations,useGraduations} from '@/lib/endgame/graduationStore';
import {starterLessons} from '@/lib/endgame/graduationSync';
import {CREDITS_THANKS,DRAW_PASS_PROBLEMS,EXAM_PER_FORMAT,drawPassJudge,pickExam,targetAt,type DrawPassProblem,type ExamPick,type P} from '@/lib/endgame/finale';
import {certificateSpec} from '@/lib/endgame/certificate';
import VisualQuestion from './VisualQuestion';
import {CertificateActions,CertificateCard} from './Certificate';
import {Confetti} from './GraduationCeremony';
import styles from './Endgame.module.css';

type Step='board'|'exam'|'draw'|'trophy'|'credits';
/** The PLANNED questions (progress dots). The score uses the questions actually asked (QA11): a format with fewer eligible
 * questions, a skipped round or "Skip to the passes" after a load error all ask fewer. */
const TOTAL=GRADUATION_FORMATS.length*EXAM_PER_FORMAT+DRAW_PASS_PROBLEMS.length;
const lessonNames=(f:GradFormat)=>starterLessons(f).map(l=>l.name);

/**
 * The Matchday Ferry finale (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md). A one-off Matchday trip until the Academy
 * island exists: boarding → the coach's exam (two review questions from each format's starter lessons, via the lessons' own
 * VisualQuestion) → two draw-the-pass problems → trophy ceremony → credits listing everything learned.
 * Heat: DOM/SVG only, no canvas or WebGL; the island sleeps behind the dialog. Each round loads only its own lesson file
 * (the same cached catalog the pitches use). Motion is finite CSS (boat, confetti, trophy lift); the credits scroll by hand.
 */
export default function MatchdayFinale({onDone,onStepChange}:{onDone:()=>void;onStepChange?:(step:Step)=>void}){
 const [step,setStepState]=useState<Step>('board');
 const setStep=(s:Step)=>{setStepState(s);onStepChange?.(s);};
 const seed=useRef((Date.now()%100000)+7).current;
 const firstTry=useRef(new Set<string>()),tried=useRef(new Set<string>());
 const [score,setScore]=useState(0),[asked,setAsked]=useState(0);
 const mark=(key:string,ok:boolean)=>{if(!tried.current.has(key)){tried.current.add(key);if(ok){firstTry.current.add(key);setScore(firstTry.current.size);}}};
 // Every question asked gets a first answer before the child can move on, so `tried` is exactly the questions asked.
 const finish=()=>{const total=tried.current.size;setAsked(total);updateGraduations(r=>recordFinale(r,{firstTry:firstTry.current.size,total},Date.now()));setStep('trophy');};
 if(step==='board')return <Boarding onStart={()=>setStep('exam')}/>;
 if(step==='exam')return <Exam seed={seed} mark={mark} onDone={()=>setStep('draw')}/>;
 if(step==='draw')return <DrawRounds mark={mark} onDone={finish}/>;
 if(step==='trophy')return <Trophy score={score} total={asked} onCredits={()=>setStep('credits')}/>;
 return <Credits onDone={()=>{updateGraduations(markFinaleSeen);onDone();}}/>;
}

function Boarding({onStart}:{onStart:()=>void}){
 return <div className={styles.ceremony}>
  <div className={styles.crossing} aria-hidden="true"><svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice"><circle cx="330" cy="40" r="22" fill="#f8d651"/><path d="M0 100q50-12 100 0t100 0 100 0 100 0v70H0z" fill="#22366b" opacity=".35"/><g className={styles.boat}><path d="M120 96h120l-14 24h-92z" fill="#477c6a"/><rect x="150" y="70" width="60" height="26" fill="#fff0cf"/><rect x="146" y="66" width="68" height="6" fill="#bd7657"/><path d="M180 66V40l22 10-22 8" fill="#ff48b0"/></g><path d="M0 122q40-8 80 0t80 0 80 0 80 0 80 0v48H0z" fill="#2f8f8a"/></svg></div>
  <div className={styles.card}>
   <span className={styles.badge}>Matchday</span>
   <h3>All aboard for your Matchday final</h3>
   <p>You graduated on all four pitches. Your coach has one last test: two questions from every path you learned, then two passes to draw.</p>
   <p>Got one wrong? Your coach explains why, and you try again. Keep going and you lift the trophy!</p>
   <div className={styles.actions}><button type="button" className={styles.primary} onClick={onStart}>Start the coach’s exam</button></div>
   <p style={{fontSize:13}}>The Academy island is still being built. This trip is your Matchday, and you can ride again any time to practise.</p>
  </div>
 </div>;
}

function Progress({done,total}:{done:number;total:number}){return <div className={styles.progressRow} aria-hidden="true">{Array.from({length:total},(_,i)=><i key={i} data-state={i<done?'done':i===done?'now':'todo'}/>)}</div>;}

function Exam({seed,mark,onDone}:{seed:number;mark:(key:string,ok:boolean)=>void;onDone:()=>void}){
 const [round,setRound]=useState(0),[index,setIndex]=useState(0),[answer,setAnswer]=useState<number|null>(null);
 const [picks,setPicks]=useState<{lesson:FieldLesson;q:VisualFieldQuestion;pick:ExamPick}[]|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const format=GRADUATION_FORMATS[round];
 useEffect(()=>{let live=true;setPicks(null);setError('');
  loadCatalog(format).then(lessons=>{if(!live)return;const starter=starterLessons(format).map(l=>l.id);
   const chosen=pickExam([{format,lessons,starter}],seed+round).map(pick=>{const lesson=lessons.find(l=>l.id===pick.lessonId)!;const q=lesson.questions[pick.index];return isVisual(q)?{lesson,q,pick}:null;}).filter((x):x is {lesson:FieldLesson;q:VisualFieldQuestion;pick:ExamPick}=>!!x);
   if(!chosen.length){if(round+1<GRADUATION_FORMATS.length)setRound(round+1);else onDone();return;}
   setPicks(chosen);setIndex(0);setAnswer(null);
   // Warm the next round's lessons while this one is answered (one file, already cached if played).
   const next=GRADUATION_FORMATS[round+1];if(next)void loadCatalog(next).catch(()=>{});
  }).catch(()=>{if(live)setError('The questions could not load. Check your connection and try again.');});
  return()=>{live=false;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[format,round,seed,attempt]);
 const done=round*EXAM_PER_FORMAT+index;
 if(error)return <div className={styles.card}><p role="alert">{error}</p><div className={styles.actions}><button type="button" className={styles.primary} onClick={()=>setAttempt(a=>a+1)}>Try again</button><button type="button" className={styles.secondary} onClick={onDone}>Skip to the passes</button></div></div>;
 if(!picks)return <div className={styles.card}><Progress done={done} total={TOTAL}/><p role="status">Your coach is picking a {GRAD_TITLES[format]} question…</p></div>;
 const current=picks[Math.min(index,picks.length-1)];
 const advance=()=>{if(index+1<picks.length){setIndex(index+1);setAnswer(null);}else if(round+1<GRADUATION_FORMATS.length){setRound(round+1);setIndex(0);setAnswer(null);}else onDone();};// bug audit B13: reset the index with the round, so the loading card's dots are not one ahead
 const {lesson,q,pick}=current,key=`${format}:${pick.lessonId}:${pick.index}`,right=answer===q.correct;
 return <div className={styles.ceremony}>
  <div className={styles.card} data-exam={key}>
   <Progress done={done} total={TOTAL}/>
   <span className={styles.eyebrow}>Round {round+1} of 4 · {GRAD_TITLES[format]} · from “{pick.lessonName}”</span>
   <p className={styles.question}>{q.q}</p>
   {answer===null&&<p className={styles.hint}>{visualHint(q)}</p>}
   <VisualQuestion key={key} lesson={lesson} q={q} answer={answer} onAnswer={i=>{setAnswer(i);mark(key,i===q.correct);}}/>
   {answer!==null&&<><p className={styles.result} role="status" data-ok={right}><strong>{right?'Correct. ':'Look again. '}</strong>{(right?q.explain:q.choiceExplanations?.[answer]??q.explain).replace(/^(Yes|Right)[,.!]\s*/,'')}</p>
    <div className={styles.actions}>{right?<button type="button" className={styles.primary} onClick={advance}>{done+1<GRADUATION_FORMATS.length*EXAM_PER_FORMAT?'Next question':'On to the passes'}</button>:<button type="button" className={styles.primary} onClick={()=>setAnswer(null)}>Try again</button>}</div></>}
  </div>
 </div>;
}

function DrawRounds({mark,onDone}:{mark:(key:string,ok:boolean)=>void;onDone:()=>void}){
 const [n,setN]=useState(0);const problem=DRAW_PASS_PROBLEMS[n];
 return <DrawPass key={problem.id} problem={problem} number={n} mark={mark} onNext={()=>{if(n+1<DRAW_PASS_PROBLEMS.length)setN(n+1);else onDone();}}/>;
}
/** Draw the pass: drag a line from the ball to a team-mate (or tap the team-mate). A defender near the line blocks it. */
function DrawPass({problem,number,mark,onNext}:{problem:DrawPassProblem;number:number;mark:(key:string,ok:boolean)=>void;onNext:()=>void}){
 const svg=useRef<SVGSVGElement>(null),[drag,setDrag]=useState<P|null>(null),[pick,setPick]=useState<number|null>(null);
 const judged=pick===null?null:drawPassJudge(problem,pick);
 const at=(e:ReactPointerEvent):P|null=>{const el=svg.current;if(!el)return null;const r=el.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*64};};
 const choose=(i:number)=>{if(judged?.ok)return;setPick(i);setDrag(null);mark(`draw:${problem.id}`,drawPassJudge(problem,i).ok);};
 const end=pick!==null&&pick>=0?problem.mates[pick]:drag;
 const done=GRADUATION_FORMATS.length*EXAM_PER_FORMAT+number;
 return <div className={styles.ceremony}><div className={styles.card} data-draw-pass={problem.id}>
  <Progress done={done} total={TOTAL}/>
  <span className={styles.eyebrow}>Draw the pass {number+1} of {DRAW_PASS_PROBLEMS.length} · {problem.concept}</span>
  <p className={styles.question}>{problem.title}</p>
  <p className={styles.hint}>{problem.prompt} Drag from the ball, or tap a team-mate.</p>
  <svg ref={svg} className={styles.drawPitch} viewBox="0 0 100 64" role="group" aria-label={`${problem.title}. Pitch with the ball, ${problem.mates.length} team-mates and ${problem.defenders.length} defenders. Attacking to the right.`}
   onPointerDown={e=>{if(judged?.ok)return;const p=at(e);if(!p)return;(e.target as Element).setPointerCapture?.(e.pointerId);setPick(null);setDrag(p);}}
   onPointerMove={e=>{if(drag){const p=at(e);if(p)setDrag(p);}}}
   onPointerUp={e=>{if(!drag)return;const p=at(e);setDrag(null);if(p){const i=targetAt(problem,p);if(i>=0)choose(i);}}}
   onPointerCancel={()=>setDrag(null)}>
   <rect x="1" y="1" width="98" height="62" fill="none" stroke="#e9f5dc" strokeWidth=".6"/><path d="M50 1v62" stroke="#e9f5dc" strokeWidth=".5"/><circle cx="50" cy="32" r="8" fill="none" stroke="#e9f5dc" strokeWidth=".5"/><rect x="84" y="18" width="15" height="28" fill="none" stroke="#e9f5dc" strokeWidth=".5"/><rect x="99" y="27" width="1" height="10" fill="#fff1d3"/>
   {end&&<line x1={problem.carrier.x} y1={problem.carrier.y} x2={end.x} y2={end.y} stroke={judged?judged.ok?'#66e69e':'#ff8c66':'#fff2b9'} strokeWidth="1.2" strokeDasharray={judged?undefined:'2 1.4'} strokeLinecap="round"/>}
   {problem.defenders.map((d,i)=><g key={i}><circle cx={d.x} cy={d.y} r="3.1" fill="#c8443c" stroke="#fff1d3" strokeWidth=".5"/><path d={`M${d.x-1.3} ${d.y-1.3}l2.6 2.6m0-2.6-2.6 2.6`} stroke="#fff1d3" strokeWidth=".6"/></g>)}
   {problem.mates.map((m,i)=><g key={m.label} role="button" tabIndex={0} aria-label={`Pass to team-mate ${m.label}`} style={{cursor:'pointer'}} onPointerDown={e=>e.stopPropagation()} onClick={()=>choose(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}}}>
    <circle cx={m.x} cy={m.y} r="6" fill="transparent"/><circle cx={m.x} cy={m.y} r="3.3" fill="#f7cb69" stroke={pick===i?(judged?.ok?'#66e69e':'#ff8c66'):'#22366b'} strokeWidth={pick===i?1.1:.6}/><text x={m.x} y={m.y+1.2} fontSize="3.4" fontWeight="800" textAnchor="middle" fill="#22366b">{m.label}</text></g>)}
   <circle cx={problem.carrier.x} cy={problem.carrier.y} r="3.3" fill="#8fc3dc" stroke="#22366b" strokeWidth=".6"/><circle cx={problem.carrier.x+2.6} cy={problem.carrier.y+2.2} r="1.3" fill="#fff" stroke="#22366b" strokeWidth=".35"/>
  </svg>
  {judged&&<p className={styles.result} role="status" data-ok={judged.ok}><strong>{judged.ok?'Great pass! ':'Look again. '}</strong>{judged.why}</p>}
  <div className={styles.actions}>{judged?.ok?<button type="button" className={styles.primary} onClick={onNext}>{number+1<DRAW_PASS_PROBLEMS.length?'Next pass':'Final whistle'}</button>:judged&&<button type="button" className={styles.secondary} onClick={()=>setPick(null)}>Try again</button>}</div>
 </div></div>;
}

function Trophy({score,total,onCredits}:{score:number;total:number;onCredits:()=>void}){
 const record=useGraduations();
 const spec=useMemo(()=>certificateSpec('diploma',record,lessonNames),[record]);
 return <div className={styles.ceremony} data-finale="trophy">
  <div className={`${styles.stage}`}><Confetti/>
   <svg className={`${styles.trophy} ${styles.lift}`} viewBox="0 0 200 220" aria-hidden="true"><path d="M60 30h80v40a40 40 0 0 1-80 0z" fill="#f2bb45" stroke="#22366b" strokeWidth="5"/><path d="M60 42H36a22 22 0 0 0 26 34M140 42h24a22 22 0 0 1-26 34" fill="none" stroke="#22366b" strokeWidth="6"/><path d="M92 108h16v30H92z" fill="#f2bb45" stroke="#22366b" strokeWidth="5"/><path d="M66 140h68v22H66z" fill="#c8443c" stroke="#22366b" strokeWidth="5"/><path d="M56 162h88v18H56z" fill="#22366b"/><path d="m100 44 5 10 11 1.6-8 7.8 1.9 11-9.9-5.2-9.9 5.2 1.9-11-8-7.8 11-1.6z" fill="#fff1d3"/></svg>
   <span className={styles.badge}>Trophy ceremony</span>
   <h3>Matchday Champion!</h3>
   <p>You answered {score} of {total} right first time, and you fixed every other one yourself. That is exactly how real players learn.</p>
  </div>
  {spec&&<CertificateCard spec={spec}/>}
  <div className={styles.card} style={{marginTop:20}}>
   <span className={styles.eyebrow}>Your rewards</span>
   <ul className={styles.rewards}>
    <li><span className={styles.swatch} style={{'--c1':'#f2bb45','--c2':'#c8443c'} as CSSProperties} aria-hidden="true"/><span><b>Matchday Champion cap colours</b>Champion gold. Wear them: tap your player → Make it yours → More → Headwear colour.</span></li>
    <li><span className={styles.swatch} style={{'--c1':'#fff1d3','--c2':'#22366b'} as CSSProperties} aria-hidden="true"/><span><b>The Island Diploma</b>In your backpack’s Trophy shelf. Save, print or share it with a grown-up.</span></li>
   </ul>
   {spec&&<CertificateActions spec={spec}/>}
   <div className={styles.actions}><button type="button" className={styles.primary} onClick={onCredits}>Roll the credits</button></div>
  </div>
 </div>;
}

function Credits({onDone}:{onDone:()=>void}){
 // A scrollable credits page (no auto-roll: nothing animates, the child scrolls at their own pace).
 return <div className={styles.ceremony} data-finale="credits">
  <div className={`${styles.credits} ${styles.pop}`} tabIndex={0} aria-label="Credits: what you learned">
   <h4>Futbol Island</h4><p>{CREDITS_THANKS[0]}</p>
   <h4>Starring</h4><p>You, the player, on every pitch.</p>
   {GRADUATION_FORMATS.map(f=><section key={f}><h4>What you learned in {GRAD_TITLES[f]}</h4><ul>{lessonNames(f).map(n=><li key={n}>{n}</li>)}</ul></section>)}
   <h4>Thank you</h4>{CREDITS_THANKS.slice(1).map(t=><p key={t}>{t}</p>)}
   <p>To every coach, parent and friend who kicked a ball with you.</p>
  </div>
  <div className={styles.actions} style={{justifyContent:'center'}}><button type="button" className={styles.primary} onClick={onDone}>Back to the island</button></div>
 </div>;
}
