import QuizPlay from '../quiz/QuizPlay';
import type {PlayQuestion} from '../../../lib/site/quizzes';
import type {SiteQuestion} from '../../../lib/site/lessons';
import q from '../quiz/quizPages.module.css';
/**
 * A lesson page's quiz (Nov 23 2026; owner: "i thought these questions were going to be interactive?"). The quiz is played in
 * place with the quiz pages' widget (components/site/quiz/QuizPlay, the only client island here; order questions are tapped
 * first to last), and, as on /learn/quizzes/*, the answer key is written out below in a closed <details>: server-rendered, so
 * every question, its options, the right answer and the coach's reason are in the HTML. The best score is kept per lesson
 * (localStorage key fi-quiz-best:lesson-<id>, this device only). "Learn more" on a miss goes to the lesson's closest guide page,
 * or to the lesson on the island when it has none.
 */
type Lang='en'|'es';
const W={en:{key:'Answer key',open:(n:number)=>`Show all ${n} questions and answers`,right:'Right answer',order:'Right order'},
 es:{key:'Respuestas',open:(n:number)=>`Ver las ${n} preguntas con sus respuestas`,right:'Respuesta correcta',order:'Orden correcto'}};
export default function LessonQuiz({lang,id,name,url,questions,more}:{lang:Lang;id:string;name:string;url:string;questions:readonly SiteQuestion[];more:{href:string;name:string}}){
 const w=W[lang],n=questions.length;
 const play:PlayQuestion[]=questions.map(x=>({kind:x.kind,q:x.q,options:x.options,correct:x.correct,...(x.seq?{seq:x.seq}:{}),explain:x.explain,more}));
 return <>
  <QuizPlay slug={`lesson-${id}`} name={name} lang={lang} questions={play} url={url}/>
  <details className={`${q.key} ${q.lessonKey}`} data-answer-key="" aria-label={w.key}>
   <summary className={q.keySum}>{w.open(n)}</summary>
   <ol className={q.keyList}>{questions.map((x,i)=><li key={i}>
    <h4 className={q.keyQ}>{x.q}</h4>
    {x.seq&&<p><b>{w.order}:</b></p>}
    {x.seq?<ol className={q.keyOpts} data-order="">{x.seq.map(j=><li key={j} data-right="">{x.options[j]}</li>)}</ol>
     :<ul className={q.keyOpts}>{x.options.map((o,j)=><li key={o} data-right={j===x.correct?'':undefined}>{o}{j===x.correct&&<b> ({w.right})</b>}</li>)}</ul>}
    <p data-explain="">{x.explain}</p>
   </li>)}</ol>
  </details>
 </>;
}
