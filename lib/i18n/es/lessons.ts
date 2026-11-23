import {LESSONS,lessonById,lessonPath,type SiteLesson} from '@/lib/site/lessons';
import {firstSentence} from '@/lib/site/seo';
import type {LessonEs} from './types';
import {toEs} from '../esPaths';
import {LESSONS_ES_7V7} from './lessons/7v7';
import {LESSONS_ES_9V9_A} from './lessons/9v9-a';
import {LESSONS_ES_9V9_B} from './lessons/9v9-b';
import {LESSONS_ES_11V11} from './lessons/11v11';
import {LESSONS_ES_FUTSAL_A} from './lessons/futsal-a';
import {LESSONS_ES_FUTSAL_B} from './lessons/futsal-b';
/**
 * The Spanish lessons (Spanish round D, Nov 16 2026): the words of each lib/site/lessons.ts SiteLesson (title, concept, coach's
 * steps, quiz questions, options and explanations), keyed by lesson id, merged over the English record. Like the English page,
 * the Spanish one never marks the right answer: options are shown A-Z (in Spanish) and explanations carry no verdict opener.
 * The lesson data in public/lessons (the game) stays English; these are the reading pages only.
 */
export const LESSONS_ES:Readonly<Record<string,LessonEs>>={...LESSONS_ES_7V7,...LESSONS_ES_9V9_A,...LESSONS_ES_9V9_B,...LESSONS_ES_11V11,...LESSONS_ES_FUTSAL_A,...LESSONS_ES_FUTSAL_B};
/** lib/paths/formatPaths.json chapter titles, lesson categories and difficulty levels. */
export const CHAPTER_ES:Readonly<Record<string,string>>={
 'Meet the team and restart':'Conoce al equipo y reanuda el juego','Look and help':'Mira y ayuda','Connect around pressure':'Conéctate para salir de la presión',
 'Protect the goal together':'Protege el arco con tu equipo','Find your unit and receive':'Encuentra tu línea y recibe','Read the spare option':'Lee la opción libre',
 'Share the next job':'Reparte la siguiente tarea','Restart and track':'Reanuda y sigue a tu rival','Receive inside the team shape':'Recibe dentro de la forma del equipo',
 'Create the next opening':'Crea el siguiente espacio','Keep the team connected':'Mantén al equipo conectado','Restart and time the run':'Reanuda y elige el momento de correr',
 'Find your connection':'Encuentra tu conexión','Attack and protect across goal':'Ataca y protege frente al arco','When the ball changes teams':'Cuando el balón cambia de equipo',
 'Start with another option':'Empieza con otra opción'};
export const CATEGORY_ES:Readonly<Record<string,string>>={Attacking:'Ataque',Defending:'Defensa',Finishing:'Definición','Rules of the Game':'Reglas del juego',
 Transition:'Transición','Set Piece':'Jugadas a balón parado'};
export const DIFFICULTY_ES:Readonly<Record<string,string>>={Beginner:'Principiante',Intermediate:'Intermedio',Advanced:'Avanzado'};
export type EsLesson=SiteLesson&{esPath:string;chapterEs?:string;categoryEs?:string;difficultyEs?:string};
const tr=(m:Readonly<Record<string,string>>,k:string|undefined,what:string)=>{if(!k)return undefined;const v=m[k];if(!v)throw new Error(`Spanish ${what} "${k}" is missing (lib/i18n/es/lessons.ts)`);return v;};
const sortEs=(xs:readonly string[])=>[...xs].sort((a,b)=>a.localeCompare(b,'es'));
const cache=new Map<string,EsLesson>();
export function esLesson(id:string):EsLesson|null{
 const hit=cache.get(id);if(hit)return hit;
 const l=lessonById(id);if(!l)return null;const e=LESSONS_ES[id];if(!e)throw new Error(`Spanish lesson "${id}" is missing (lib/i18n/es/lessons)`);
 if(e.steps.length!==l.steps.length||e.questions.length!==l.questions.length)throw new Error(`Spanish lesson ${id}: steps/questions not 1:1 with English`);
 const x:EsLesson={...l,title:e.title,concept:e.concept,steps:[...e.steps],
  questions:l.questions.map((q,i)=>{const y=e.questions[i];if(y.options.length!==q.options.length)throw new Error(`Spanish lesson ${id} question ${i}: options not 1:1`);return {q:y.q,options:sortEs(y.options),explain:y.explain};}),
  esPath:toEs(lessonPath(id)),chapterEs:tr(CHAPTER_ES,l.chapter,'chapter'),categoryEs:tr(CATEGORY_ES,l.category,'category'),difficultyEs:tr(DIFFICULTY_ES,l.difficulty,'difficulty')};
 cache.set(id,x);return x;
}
export const ES_LESSONS=():EsLesson[]=>LESSONS.map(l=>esLesson(l.id)!);
/** "fútbol 7v7" / "futsal": how a lesson's format reads in a Spanish sentence. */
export const formatPhraseEs=(f:string)=>f==='Futsal'||f==='futsal'?'futsal':`fútbol ${f}`;
/** Page title (<= 60): the longest form that fits. */
export const lessonTitleEs=(l:{title:string;formatLabel:string})=>{const f=formatPhraseEs(l.formatLabel);
 /* Nov 23 2026 (seo-unindexed): a lesson name that already has a colon gets "·" instead of a second colon. */
 const sep=l.title.includes(':')?' · ':': ';
 return [`${l.title}${sep}lección de ${f} para niños`,`${l.title}${sep}lección de ${f}`,`${l.title} (lección de ${l.formatLabel})`,l.title].find(t=>t.length<=60)??l.title.slice(0,60);};
/** Description (70-155): the concept's first sentence, then what the page is. Nov 20 2026 (SEO leftovers): one under 120
 *  characters gets a fuller tail from the lesson's own fields (steps, quiz questions, level, topic), as lib/site/lessons.ts. */
export const lessonDescriptionEs=(l:{concept:string;formatLabel:string;steps?:readonly unknown[];questions?:readonly unknown[];difficultyEs?:string;categoryEs?:string})=>{const c=firstSentence(l.concept,120),f=formatPhraseEs(l.formatLabel);
 const d=[`${c} Lección y prueba gratis de ${f} para niños. Sin anuncios.`,`${c} Lección y prueba gratis de ${f} para niños.`,`${c} Lección gratis de ${f}.`,c].find(x=>x.length<=155&&x.length>=70)
  ??(c.length>155?c.slice(0,154).replace(/\s+\S*$/,'')+'…':`${c} Lección y prueba gratis de ${f} para niños, con las preguntas y las explicaciones del entrenador.`.slice(0,155));
 if(d.length>=120)return d;
 const s=l.steps?.length??0,q=l.questions?.length??0;
 const what=s>0&&q>0?`${c} Lección gratis de ${f} para niños con ${s} ${s===1?'paso':'pasos'} del entrenador y ${q} ${q===1?'pregunta':'preguntas'} de prueba.`:`${c} Lección y prueba gratis de ${f} para niños.`;
 const level=l.difficultyEs?` Nivel: ${l.difficultyEs.toLowerCase()}.`:'',topic=l.categoryEs?` Tema: ${l.categoryEs.toLowerCase()}.`:'';
 return [`${what}${level}${topic} Sin anuncios.`,`${what}${level} Sin anuncios.`,`${what}${topic} Sin anuncios.`,`${what} Sin anuncios.`,what,
  `${c} Lección gratis de ${f} para niños con ${s} ${s===1?'paso':'pasos'} y ${q} ${q===1?'pregunta':'preguntas'} de prueba. Sin anuncios.`].find(x=>x.length>=120&&x.length<=155)??d;};
