import {QUIZ_BANK,type BankQuestion,type BankQuiz,type QuizTopic} from './quizBank';
import {QUIZ_BANK_ES} from '@/lib/i18n/es/quizBank';
import {ES_QUIZ_SLUGS,hasEs,toEs} from '@/lib/i18n/esPaths';
import {RULES} from './rules';
import {TERM_PAGES} from './terms';
import {POSITIONS} from './positions';
import {FORMATIONS} from './formations';
import {SITE_EXHIBITS,exhibitPath} from './exhibits';
import {esPosition,esRule,esTerm,esFormation} from '@/lib/i18n/es/registry';
/**
 * The quiz pages and their hub (Nov 23 2026, owner approved): /learn/quizzes (Spanish /es/learn/preguntas-de-futbol, lib/i18n/
 * esPaths.ts ES_QUIZ_SLUGS) and one page per quiz. Questions are lib/site/quizBank.ts (English) and lib/i18n/es/quizBank.ts
 * (Spanish). This file adds what the pages need: a fixed per-question option order (the right answer is not always first; the
 * same order in both languages), the name and the language-right link of each "learn more" page, the topic groups, and the
 * "Test yourself" card map from guide pages to their quiz (QUIZ_FOR).
 */
export const QUIZZES_PATH='/learn/quizzes';
export const quizPath=(slug:string)=>`${QUIZZES_PATH}/${slug}`;
export type Lang='en'|'es';
/** kind 'order' (lesson pages only): `seq` lists the shown options' indices first to last; `correct` is the first step. */
export type PlayQuestion={kind:BankQuestion['kind']|'order';q:string;options:string[];correct:number;seq?:number[];explain:string;fact?:string;pic?:{src:string;alt:string};more:{href:string;name:string}};
export type SiteQuiz=Omit<BankQuiz,'questions'>&{path:string;enPath:string;questions:PlayQuestion[]};

const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
/** The right answer moves to a fixed place (true/false and "ref's call" keep their natural order). */
function order(seed:string,x:BankQuestion):{options:string[];correct:number}{
 if(x.kind==='truefalse'||x.kind==='ref')return {options:x.options,correct:x.correct};
 const right=x.options[x.correct],wrong=x.options.filter((_,i)=>i!==x.correct),at=hash(seed)%x.options.length,options=[...wrong];options.splice(at,0,right);
 return {options,correct:at};
}
/** Names of the few one-level pages a question links to (English, Spanish). */
const PAGE_NAMES:Readonly<Record<string,[string,string]>>={'/learn/soccer-positions/numbers':['Soccer positions by number','Las posiciones por número (en inglés)'],
 '/learn/soccer-age-groups':['Soccer age groups','Categorías por edad'],'/learn/soccer-ball-size-by-age':['Soccer ball size by age','Tamaño del balón por edad'],
 '/learn/soccer-field-size-by-age':['Soccer field size by age','Tamaño de la cancha por edad']};
/** Spanish names of the museum exhibits the quizzes link to (the exhibit pages are English only). */
const EXHIBIT_ES:Readonly<Record<string,string>>={'shirts':'Números y colores','worldcup-1930':'El primer Mundial','wwc-1991':'El primer Mundial Femenino','telstar-1970':'El balón Telstar',
 'var-2018':'El árbitro de video','first-international-1872':'El primer partido internacional','laws-1863':'Las primeras reglas','copa-america-1916':'La copa de selecciones más antigua',
 'penalty-1891':'El penal','futsal-1989':'El Mundial de futsal'};
/** The name of the page that teaches a question, in the quiz's language. */
export function pageName(path:string,lang:Lang):string{
 const [,fam,slug]=/^\/learn\/(soccer-rules|soccer-terms|soccer-positions|soccer-formations)\/(.+)$/.exec(path)??[];
 const es=lang==='es';
 if(fam==='soccer-rules'){const r=RULES.find(x=>x.slug===slug);if(r)return es?esRule(slug)!.name:r.name;}
 if(fam==='soccer-terms'){const t=TERM_PAGES.find(x=>x.slug===slug);if(t)return es?esTerm(slug)!.name:t.name;}
 if(fam==='soccer-positions'){const p=POSITIONS.find(x=>x.slug===slug);if(p)return es?esPosition(slug)!.name:p.name;}
 if(fam==='soccer-formations'){const f=FORMATIONS.find(x=>x.slug===slug);if(f)return es?`Formación ${esFormation(slug)!.name}`:`The ${f.name} formation`;}
 const ex=SITE_EXHIBITS.find(e=>exhibitPath(e.id)===path);if(ex){if(!es)return `Museum: ${ex.title}`;const n=EXHIBIT_ES[ex.id];if(!n)throw new Error(`lib/site/quizzes.ts: no Spanish name for the exhibit ${ex.id}`);return `Museo: ${n} (en inglés)`;}
 const n=PAGE_NAMES[path];if(n)return es?n[1]:n[0];
 throw new Error(`lib/site/quizzes.ts: no name for the learn-more page ${path}`);
}
/** A page in the quiz's language: the Spanish twin when there is one. */
export const inLang=(path:string,lang:Lang)=>lang==='es'&&hasEs(path)?toEs(path):path;
function build(q:BankQuiz,lang:Lang):SiteQuiz{
 const enPath=quizPath(q.slug);
 return {...q,enPath,path:inLang(enPath,lang),questions:q.questions.map((x,i)=>({kind:x.kind,q:x.q,...order(`${q.slug}#${i}`,x),explain:x.explain,
  ...(x.fact?{fact:x.fact}:{}),...(x.pic?{pic:x.pic}:{}),more:{href:inLang(x.more,lang),name:pageName(x.more,lang)}}))};
}
export const QUIZZES:readonly SiteQuiz[]=QUIZ_BANK.map(q=>build(q,'en'));
export const QUIZZES_ES:readonly SiteQuiz[]=QUIZ_BANK_ES.map(q=>build(q,'es'));
export const quizBySlug=(slug:string,lang:Lang='en')=>(lang==='es'?QUIZZES_ES:QUIZZES).find(q=>q.slug===slug)??null;
export const QUIZ_QUESTIONS=QUIZZES.reduce((a,q)=>a+q.questions.length,0);
for(const s of QUIZ_BANK.map(q=>q.slug))if(!ES_QUIZ_SLUGS[s])throw new Error(`lib/i18n/esPaths.ts ES_QUIZ_SLUGS: no Spanish slug for ${s}`);

/** The hub's groups, in reading order (owner brief: rules, positions, tactics/terms, history). */
export const QUIZ_TOPICS:readonly {id:QuizTopic;en:string;es:string;line:[string,string]}[]=[
 {id:'rules',en:'Rules quizzes',es:'Quizzes de reglas',line:['The Laws of the Game, offside, cards, penalties, futsal and 7v7.','Las Reglas de Juego, el fuera de juego, las tarjetas, los penales, el futsal y el 7v7.']},
 {id:'positions',en:'Positions quizzes',es:'Quizzes de posiciones',line:['Who plays where, and the classic shirt numbers.','Quién juega dónde, y los dorsales clásicos.']},
 {id:'terms',en:'Terms and tactics quizzes',es:'Quizzes de términos y táctica',line:['Football words, from nutmeg to 2v1 and the through ball.','Palabras del fútbol, del caño al 2v1 y el pase al hueco.']},
 {id:'history',en:'History quizzes',es:'Quizzes de historia',line:['World Cups and big moments, from our History Museum.','Mundiales y grandes momentos, de nuestro Museo de Historia.']}];
export const quizzesIn=(t:QuizTopic,lang:Lang='en')=>(lang==='es'?QUIZZES_ES:QUIZZES).filter(q=>q.topic===t);

export const QUIZ_HUB={
 en:{title:'Soccer Quizzes: Rules, Positions, Terms and History',crumb:'Quizzes',h1:'Soccer quizzes by topic',
  desc:`${QUIZZES.length} free soccer quizzes for kids 7 to 12: rules, offside, cards, penalties, positions, terms, futsal, 7v7 and World Cup history. Answers included.`,
  lead:`${QUIZZES.length} free soccer (football) quizzes for kids aged 7 to 12, with ${QUIZ_QUESTIONS} questions in all. Each one plays right on its page: tap an answer, see why, and get your score at the end.`},
 es:{title:'Preguntas de fútbol para niños: quizzes gratis',crumb:'Quizzes',h1:'Quizzes de fútbol por tema',
  desc:`${QUIZZES_ES.length} quizzes de fútbol gratis para niños de 7 a 12 años: reglas, fuera de juego, tarjetas, penales, posiciones, términos, futsal e historia.`,
  lead:`${QUIZZES_ES.length} quizzes de fútbol gratis para niños de 7 a 12 años, con ${QUIZ_QUESTIONS} preguntas en total. Cada uno se juega en su página: toca una respuesta, mira el porqué y recibe tu puntuación al final.`}};
export const QUIZ_HUB_FAQ={
 en:[{q:'Are these soccer quizzes free?',a:'Yes. Every quiz is free, with no account and no ads. Your best score is kept only on your own device.'},
  {q:'What ages are the quizzes for?',a:'Kids aged 7 to 12, and parents and new coaches who want a quick check. The words are short and every answer has a reason.'},
  {q:'Where do the answers come from?',a:'From the IFAB Laws of the Game, U.S. Soccer’s youth standards and the exhibits in our History Museum. Each quiz lists its sources.'},
  {q:'Are there more quizzes in the game?',a:'Yes. Every lesson in Futbol Island ends with its own quiz on the pitch.'}],
 es:[{q:'¿Los quizzes son gratis?',a:'Sí. Todos son gratis, sin cuenta y sin anuncios. Tu mejor puntuación se guarda solo en tu dispositivo.'},
  {q:'¿Para qué edades son?',a:'Para niños de 7 a 12 años, y para familias y entrenadores nuevos que quieren repasar. Las frases son cortas y cada respuesta tiene su porqué.'},
  {q:'¿De dónde salen las respuestas?',a:'De las Reglas de Juego de la IFAB, las normas juveniles de U.S. Soccer y las vitrinas de nuestro Museo de Historia. Cada quiz lista sus fuentes.'},
  {q:'¿Hay más preguntas en el juego?',a:'Sí. Cada lección de Futbol Island termina con su propia prueba en la cancha.'}]};

/** "Test yourself" (owner brief): the guide pages that get one small card linking to their quiz. English paths. */
const RQ=(s:string)=>`/learn/soccer-rules/${s}`,TQ=(s:string)=>`/learn/soccer-terms/${s}`;
export const QUIZ_FOR:Readonly<Record<string,string>>={
 ...Object.fromEntries(['throw-in','goal-kick','corner-kick','kick-off','substitutions-and-game-length','drop-ball','advantage'].map(s=>[RQ(s),'soccer-rules-quiz'])),
 [RQ('offside')]:'offside-quiz',[RQ('fouls-and-free-kicks')]:'fouls-and-cards-quiz',[RQ('yellow-and-red-cards')]:'fouls-and-cards-quiz',[RQ('handball')]:'fouls-and-cards-quiz',[RQ('back-pass-rule')]:'fouls-and-cards-quiz',
 [RQ('penalty-kick')]:'penalty-kick-quiz',[RQ('futsal-rules')]:'futsal-rules-quiz',[RQ('build-out-line')]:'7v7-soccer-rules-quiz',[RQ('heading-rules-for-kids')]:'7v7-soccer-rules-quiz',
 ...Object.fromEntries(POSITIONS.map(p=>[p.path,'soccer-positions-quiz'])),
 ...Object.fromEntries(['nutmeg','hat-trick','brace','clean-sheet','two-v-one','through-ball','give-and-go','assist','own-goal','overlap','man-on'].map(s=>[TQ(s),'soccer-terms-quiz'])),
 [TQ('penalty-shoot-out')]:'penalty-kick-quiz',[TQ('yellow-card')]:'fouls-and-cards-quiz',[TQ('red-card')]:'fouls-and-cards-quiz'};
/** The quiz for an English guide path, in a language (null when the page has none). */
export const quizForPage=(enPath:string,lang:Lang='en')=>{const s=QUIZ_FOR[enPath];return s?quizBySlug(s,lang):null;};
