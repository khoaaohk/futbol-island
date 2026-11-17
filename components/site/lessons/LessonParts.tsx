import {formationsIn} from '../../../lib/site/formations';
import {place,describe,type GuideFormat} from '../../../lib/site/pitch';
import PitchDiagram from '../../../lib/site/PitchDiagram';
import {chapterRanges,lessonFrames,lessonMinutes,type LessonFrameData} from '../../../lib/site/lessonFrames';
import type {SiteQuestion} from '../../../lib/site/lessons';
import type {ReactNode} from 'react';
import LessonFrame from './LessonFrame';
import site from '../../../app/(site)/site.module.css';
import s from './lesson.module.css';
/**
 * The lesson reading page's picture parts (visual pass, Nov 17 2026; audit rank 1), shared by app/(site)/learn/lessons/[slug]
 * and the Spanish components/es/pages/LessonsEs.tsx so both languages get the same page:
 *  - LearnCard: "In this lesson you learn" (the lesson's own concept text) + a key-facts strip (format, level, questions, time,
 *    path) with 16px icons drawn like the fuel bolt (components/FuelCount.tsx: gold #f2b632, brown #7a4e12 outline 1.4).
 *  - CoachChapters: the coach's steps, word for word, split into 2-3 chapters, each beside a pitch frame from the lesson's own
 *    positions (lib/site/lessonFrames.ts); a lesson without positions gets its format's shape instead (never invented tactics).
 *  - QuizCards: questions with their options as chips (A-Z, as before) and the coach's explanation behind a disclosure. The page
 *    still NEVER marks which option is right and carries no Quiz markup.
 * Server-only: no state, no effects, no client JavaScript.
 */
export type Lang='en'|'es';
const W={
 en:{learn:'In this lesson you learn',facts:'Lesson facts',format:'Format',level:'Level',questions:'Questions',time:'Time',path:'Part of',
  mins:(m:number)=>`About ${m} min`,
  legend:'Gold dots are your team, attacking up the pitch; dark dots are the other team. Dashed arrows are runs, solid arrows are the ball, and a white ring marks a player the coach points at.',
  chapters:{2:['The start','The move'],3:['The start','The move','The result']} as Record<number,string[]>,
  after:(n:number)=>`The pitch after step ${n}`,
  frame:(f:LessonFrameData,fmt:string)=>{const list=(x:string[])=>x.length>1?`${x.slice(0,-1).join(', ')} and ${x[x.length-1]}`:x[0];
   const runs=[...new Set(f.runs.filter(r=>r.team==='gold').map(r=>r.label))],opp=[...new Set(f.runs.filter(r=>r.team==='opp').map(r=>r.label))],focus=f.players.filter(p=>p.focus).map(p=>p.label);
   return [`${fmt} pitch after step ${f.step}, seen from above. Gold dots are your team attacking up the picture; dark dots are the other team.`,
    runs.length?`Your ${list(runs)} ${runs.length>1?'move':'moves'} (dashed arrows).`:'',
    opp.length?`The other team's ${list(opp)} ${opp.length>1?'move':'moves'}.`:'',
    f.holder&&f.receiver&&f.ballPath.length>1?`The ball goes from ${f.holder} to ${f.receiver} (solid arrows).`:f.ballPath.length>1?'The ball moves (solid arrows).':f.holder?`${f.holder} has the ball.`:'',
    focus.length?`The coach points at ${list(focus)} (white rings).`:''].filter(Boolean).join(' ');},
  shape:(name:string)=>`Your team's shape: ${name}`,
  explain:'Coach’s explanation'},
 es:{learn:'En esta lección aprendes',facts:'Datos de la lección',format:'Formato',level:'Nivel',questions:'Preguntas',time:'Tiempo',path:'Parte de',
  mins:(m:number)=>`Unos ${m} min`,
  legend:'Los puntos dorados son tu equipo, que ataca hacia arriba; los puntos oscuros son el otro equipo. Las flechas discontinuas son carreras, las continuas son el balón, y un anillo blanco marca al jugador que señala el entrenador.',
  chapters:{2:['El inicio','La jugada'],3:['El inicio','La jugada','El resultado']} as Record<number,string[]>,
  after:(n:number)=>`La cancha después del paso ${n}`,
  frame:(f:LessonFrameData,fmt:string)=>{const list=(x:string[])=>x.length>1?`${x.slice(0,-1).join(', ')} y ${x[x.length-1]}`:x[0];
   const runs=[...new Set(f.runs.filter(r=>r.team==='gold').map(r=>r.label))],opp=[...new Set(f.runs.filter(r=>r.team==='opp').map(r=>r.label))],focus=f.players.filter(p=>p.focus).map(p=>p.label);
   return [`Cancha de ${fmt} después del paso ${f.step}, vista desde arriba. Los puntos dorados son tu equipo, que ataca hacia arriba; los oscuros son el otro equipo.`,
    runs.length?`${runs.length>1?'Tus':'Tu'} ${list(runs)} ${runs.length>1?'se mueven':'se mueve'} (flechas discontinuas).`:'',
    opp.length?`Del otro equipo ${opp.length>1?'se mueven':'se mueve'} ${list(opp)}.`:'',
    f.holder&&f.receiver&&f.ballPath.length>1?`El balón va de ${f.holder} a ${f.receiver} (flechas continuas).`:f.ballPath.length>1?'El balón se mueve (flechas continuas).':f.holder?`${f.holder} tiene el balón.`:'',
    focus.length?`El entrenador señala a ${list(focus)} (anillos blancos).`:''].filter(Boolean).join(' ');},
  shape:(name:string)=>`La forma de tu equipo: ${name}`,
  explain:'Explicación del entrenador'},
} as const;

// ---- icons: 16x16, pixel edges, fuel-bolt colours --------------------------------------------------------------------------
const F='#f2b632',B='#7a4e12',SW='1.4';
const Svg=({children}:{children:ReactNode})=><svg className={s.icon} viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" shapeRendering="crispEdges">{children}</svg>;
export const PitchIcon=()=><Svg><rect x="1.5" y="3" width="13" height="10" fill={F} stroke={B} strokeWidth={SW}/><path d="M8 3v10" stroke={B} strokeWidth={SW}/><rect x="6.5" y="6.5" width="3" height="3" fill="none" stroke={B} strokeWidth={SW}/></Svg>;
/** Energy bars: 1, 2 or 3 filled for Beginner, Intermediate, Advanced. */
export const LevelIcon=({n}:{n:number})=><Svg>{[0,1,2].map(i=><rect key={i} x={1.5+i*5} y={10-i*4} width="3" height={4.5+i*4} fill={i<n?F:'none'} stroke={B} strokeWidth={SW}/>)}</Svg>;
export const AskIcon=()=><Svg><path d="M2 2.5h12v8.5H7.5L4.5 14v-3H2Z" fill={F} stroke={B} strokeWidth={SW} strokeLinejoin="round"/><path d="M6.5 5.5h3v2H8v1" fill="none" stroke={B} strokeWidth={SW}/></Svg>;
export const ClockIcon=()=><Svg><circle cx="8" cy="8" r="6.3" fill={F} stroke={B} strokeWidth={SW}/><path d="M8 4.5V8h3" fill="none" stroke={B} strokeWidth={SW}/></Svg>;
export const FlagIcon=()=><Svg><path d="M3.5 15V1.5" stroke={B} strokeWidth={SW}/><path d="M3.5 2h9l-2 3 2 3h-9Z" fill={F} stroke={B} strokeWidth={SW} strokeLinejoin="round"/></Svg>;
const LEVEL:Record<string,number>={Beginner:1,Intermediate:2,Advanced:3};

/** "In this lesson you learn" + the key-facts strip. `answer` keeps the Spanish page's data-answer on the concept line. */
export function LearnCard({lang,id,concept,formatLabel,difficulty,difficultyLabel,questions,chapter,answer}:{lang:Lang;id:string;concept:string;formatLabel:string;difficulty?:string;difficultyLabel?:string;questions:number;chapter?:string;answer?:boolean}){
 const w=W[lang],m=lessonMinutes(id);
 const facts:[ReactNode,string,string][]=[[<PitchIcon key="f"/>,w.format,formatLabel]];
 if(difficulty)facts.push([<LevelIcon key="l" n={LEVEL[difficulty]??1}/>,w.level,difficultyLabel??difficulty]);
 if(questions)facts.push([<AskIcon key="q"/>,w.questions,String(questions)]);
 if(m)facts.push([<ClockIcon key="t"/>,w.time,w.mins(m)]);
 if(chapter)facts.push([<FlagIcon key="p"/>,w.path,chapter]);
 return <section className={s.learn} aria-labelledby="learn">
  <h2 className={s.learnTitle} id="learn">{w.learn}</h2>
  <p className={`${site.lead} ${s.learnLead}`} {...(answer?{'data-answer':''}:{})}>{concept}</p>
  <dl className={s.facts} aria-label={w.facts}>{facts.map(([icon,k,v])=><div key={k} className={k===w.path?s.factWide:s.fact}><dt>{icon}{k}</dt><dd>{v}</dd></div>)}</dl>
 </section>;
}

/** The coach's steps in chapters, each with its frame. Steps keep their words and their numbers (one <ol> per chapter, `start`). */
export function CoachChapters({lang,id,format,formatLabel,steps}:{lang:Lang;id:string;format:string;formatLabel:string;steps:readonly string[]}){
 const w=W[lang],ranges=chapterRanges(steps.length),frames=lessonFrames(id,steps.length),names=w.chapters[ranges.length]??[],fmt=format as GuideFormat;
 const fallback=frames?null:formationsIn(fmt)[0];
 return <div className={s.chapters} data-chapters={ranges.length} data-frames={frames?'lesson':'format'}>
  <p className={`${site.caption} ${s.legend}`}>{w.legend}</p>
  {ranges.map(([a,b],i)=>{const f=frames?.[i],hid=`ch-${i+1}`;
   return <section key={i} className={s.chapter} aria-labelledby={hid} data-chapter="">
    <h3 className={s.chapterTitle} id={hid}>{names[i]??''}</h3>
    {f?<figure className={s.frame}>
      <LessonFrame id={`lf${i+1}`} format={fmt} frame={f} label={w.frame(f,formatLabel)}/>
      <figcaption className={s.frameCap}>{w.after(f.step)}</figcaption>
     </figure>
     :i===0&&fallback?<figure className={s.frame} data-fallback="">
      <PitchDiagram id="lf-shape" format={fmt} spots={place(fallback.lines)} title={w.shape(fallback.name)} desc={lang==='en'?describe({format:fmt,what:`the ${fallback.name} shape`,lines:fallback.lines}):`Diagrama de la forma ${fallback.name} en una cancha de ${formatLabel}, vista desde arriba.`} small/>
      <figcaption className={s.frameCap}>{w.shape(fallback.name)}</figcaption>
     </figure>:null}
    <ol className={s.steps} start={a+1}>{steps.slice(a,b).map((t,j)=><li key={j}>{t}</li>)}</ol>
   </section>;})}
 </div>;
}

/** Quiz cards: question, options as chips (A-Z order from lib/site/lessons.ts), explanation behind a disclosure. No answer marks. */
export function QuizCards({lang,questions}:{lang:Lang;questions:readonly SiteQuestion[]}){
 const w=W[lang];
 return <ol className={`${site.stack} ${s.quiz}`}>{questions.map((q,i)=><li key={i} className={s.q}>
  <h3 className={s.qTitle}>{q.q}</h3>
  {q.options.length>0&&<ul className={`${site.options} ${s.chips}`}>{q.options.map((o,j)=><li key={j}>{o}</li>)}</ul>}
  {q.explain&&<details className={s.explain}><summary>{w.explain}</summary><p data-explain="">{q.explain}</p></details>}
 </li>)}</ol>;
}
