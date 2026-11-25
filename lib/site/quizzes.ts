import {QUIZ_BANK,type BankQuestion,type BankQuiz,type QuizTopic} from './quizBank';
import {QUIZ_BANK_ES} from '@/lib/i18n/es/quizBank';
import {ES_QUIZ_SLUGS,hasEs,toEs} from '@/lib/i18n/esPaths';
import {RULES} from './rules';
import {TERM_PAGES} from './terms';
import {POSITIONS} from './positions';
import {FORMATIONS} from './formations';
import {SITE_EXHIBITS,exhibitPath} from './exhibits';
import {esPosition,esRule,esTerm,esFormation} from '@/lib/i18n/es/registry';
import {SITE_BOOKS,bookPath} from './books';
import {spotPic,type SpotPic} from './quizPitch';
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
/** kind 'order': `seq` lists the shown options' indices first to last; `correct` is the first step. kind 'spot': `spot.at[j]` is
 *  the target on the pitch drawing for shown option j (lib/site/quizPitch.ts). */
export type PlayQuestion={kind:BankQuestion['kind'];q:string;options:string[];correct:number;seq?:number[];spot?:SpotPic;explain:string;fact?:string;pic?:{src:string;alt:string};more:{href:string;name:string}};
export type SiteQuiz=Omit<BankQuiz,'questions'>&{path:string;enPath:string;questions:PlayQuestion[];
 /** SEO batch E: the pages the quiz tests, in question order, with how many questions each one teaches */covers:{path:string;name:string;n:number}[];
 /** SEO batch E: games and tools to practise the same ideas */practise:{path:string;name:string;line:string}[]};

const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;};
/** The right answer moves to a fixed place (true/false and "ref's call" keep their natural order). `perm[shown]` = the bank index,
 *  so a spot question's targets follow their options. An order question is turned until it is not already in the right order. */
function order(seed:string,x:BankQuestion):{options:string[];correct:number;perm:number[];seq?:number[]}{
 const n=x.options.length,idx=x.options.map((_,i)=>i);
 if(x.kind==='truefalse'||x.kind==='ref')return {options:x.options,correct:x.correct,perm:idx};
 if(x.kind==='order'){let t=hash(seed)%n;let perm=idx;for(let k=0;k<n;k++,t++){const p=idx.map(j=>(j+t)%n);if(p.some((v,j)=>v!==j)){perm=p;break;}}
  const seq=idx.map(r=>perm.indexOf(r));return {options:perm.map(k=>x.options[k]),correct:seq[0],perm,seq};}
 const wrong=idx.filter(i=>i!==x.correct),at=hash(seed)%n,perm=[...wrong];perm.splice(at,0,x.correct);
 return {options:perm.map(k=>x.options[k]),correct:at,perm};
}
/** Names of the few one-level pages a question links to (English, Spanish). */
const PAGE_NAMES:Readonly<Record<string,[string,string]>>={'/learn/soccer-positions/numbers':['Soccer positions by number','Las posiciones por número (en inglés)'],
 '/learn/soccer-age-groups':['Soccer age groups','Categorías por edad'],'/learn/soccer-ball-size-by-age':['Soccer ball size by age','Tamaño del balón por edad'],
 '/learn/soccer-field-size-by-age':['Soccer field size by age','Tamaño de la cancha por edad'],
 /* Nov 23 2026: the new quizzes' guide pages */'/learn/7v7-9v9-11v11':['7v7, 9v9 and 11v11 explained','Fútbol 7, 9 y 11'],'/learn/futsal-for-kids':['Futsal for kids','Futsal para niños'],
 '/learn/passing-and-support':['Passing and support','Pase y apoyo'],'/learn/7v7-soccer-formations':['7v7 soccer formations','Formaciones de fútbol 7'],
 '/learn/9v9-soccer-formations':['9v9 soccer formations','Formaciones de fútbol 9'],'/learn/11v11-soccer-formations':['11v11 soccer formations','Formaciones de fútbol 11'],
 '/learn/8v8-soccer-formations':['8v8 soccer formations','Formaciones de fútbol 8'],'/books':['Football pop-up books','Libros desplegables de fútbol'],
 '/learn/soccer-positions/fullback-vs-wingback':['Fullback vs wingback','Lateral vs carrilero'],'/learn/soccer-positions/striker-vs-winger':['Striker vs winger','Delantero vs extremo']};
/** Spanish names of the museum exhibits the quizzes link to (the exhibit pages are English only). */
const EXHIBIT_ES:Readonly<Record<string,string>>={'shirts':'Números y colores','worldcup-1930':'El primer Mundial','wwc-1991':'El primer Mundial Femenino','telstar-1970':'El balón Telstar',
 'var-2018':'El árbitro de video','first-international-1872':'El primer partido internacional','laws-1863':'Las primeras reglas','copa-america-1916':'La copa de selecciones más antigua',
 'penalty-1891':'El penal','futsal-1989':'El Mundial de futsal',
 /* Nov 23 2026 */'stadiums':'Estadios del mundo','ballon-dor':'El Balón de Oro','formations-history':'Las formaciones en la historia','offside-rules':'El fuera de juego en la historia',
 'floodlights-1878':'Bajo los focos','free-kick-wall':'Los tiros libres y la barrera','keeper-hands-1912':'Las manos del portero','throw-in':'El saque de banda',
 'laced-leather':'Los balones de cuero','boots':'Los botines en la historia','ball-curve':'Cómo se curva el balón'};
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
 const b=SITE_BOOKS.find(x=>bookPath(x.slug)===path);if(b)return es?`Libro: ${b.player}`:`Pop-up book: ${b.player}`;
 throw new Error(`lib/site/quizzes.ts: no name for the learn-more page ${path}`);
}
/** A page in the quiz's language: the Spanish twin when there is one. */
export const inLang=(path:string,lang:Lang)=>lang==='es'&&hasEs(path)?toEs(path):path;
/**
 * SEO batch E (Nov 25 2026): titles written for "<topic> quiz for kids" searches, with the live question count
 * ("Offside Rule Quiz for Kids: 10 Questions + Answers"). The bank's own titles (Nov 23) stay in quizBank.ts as the fallback.
 */
const SEO_TITLE:Readonly<Record<string,readonly [string,string]>>={
 'soccer-rules-quiz':['Soccer Rules Quiz for Kids','Quiz de reglas del fútbol'],'offside-quiz':['Offside Rule Quiz for Kids','Quiz del fuera de juego'],
 'fouls-and-cards-quiz':['Fouls and Cards Quiz for Kids','Quiz de faltas y tarjetas'],'soccer-positions-quiz':['Soccer Positions Quiz for Kids','Quiz de posiciones del fútbol'],
 'soccer-positions-by-number-quiz':['Soccer Positions by Number Quiz','Quiz de dorsales y posiciones'],'penalty-kick-quiz':['Penalty Kick Quiz for Kids','Quiz del penal y la tanda'],
 'soccer-terms-quiz':['Soccer Terms Quiz for Kids','Quiz de términos del fútbol'],'futsal-rules-quiz':['Futsal Rules Quiz for Kids','Quiz de reglas del futsal'],
 '7v7-soccer-rules-quiz':['7v7 Soccer Rules Quiz for Kids','Quiz de reglas del fútbol 7'],'world-cup-quiz':['World Cup Quiz for Kids','Quiz del Mundial para niños'],
 'goalkeeper-rules-quiz':['Goalkeeper Rules Quiz for Kids','Quiz de reglas del portero'],'throw-in-quiz':['Throw-In Quiz for Kids','Quiz del saque de banda'],
 'corner-kick-and-goal-kick-quiz':['Corner Kick and Goal Kick Quiz','Quiz de córner y saque de meta'],'free-kick-quiz':['Free Kick Quiz for Kids','Quiz de tiros libres'],
 '9v9-soccer-rules-quiz':['9v9 Soccer Rules Quiz for Kids','Quiz de reglas del fútbol 9'],'soccer-field-and-ball-size-quiz':['Soccer Field and Ball Size Quiz','Quiz de tamaño de cancha y balón'],
 'soccer-formations-quiz':['Soccer Formations Quiz for Kids','Quiz de formaciones de fútbol'],'attacking-tactics-quiz':['Attacking Tactics Quiz for Kids','Quiz de táctica de ataque'],
 'defending-tactics-quiz':['Defending Tactics Quiz for Kids','Quiz de táctica de defensa'],'soccer-skills-terms-quiz':['Soccer Skills Quiz for Kids','Quiz de habilidades de fútbol'],
 'famous-soccer-players-quiz':['Famous Soccer Players Quiz for Kids','Quiz de futbolistas famosos'],'womens-world-cup-quiz':['Women’s World Cup Quiz for Kids','Quiz del Mundial Femenino']};
const seoTitle=(q:BankQuiz,lang:Lang)=>{const t=SEO_TITLE[q.slug],n=q.questions.length;if(!t)return q.title;
 return lang==='es'?`${t[1]}: ${n} preguntas y respuestas`:`${t[0]}: ${n} Questions + Answers`;};
/** SEO batch E: games and tools that practise each quiz's ideas (English paths; the Spanish twin is used when there is one). */
const G_=(s:string)=>`/games/${s}`,TL=(s:string)=>`/tools/${s}`;
const PRACTISE_PAGES:Readonly<Record<string,readonly [string,string,string,string]>>={/* path: EN name, EN line, ES name, ES line */
 [G_('soccer-passing-puzzle-game')]:['Pass Puzzles (game)','Find the pass, and spot offside','Pass Puzzles (juego)','Encuentra el pase y detecta el fuera de juego'],
 [G_('soccer-snake-game')]:['Squad Snake (game)','Build a team position by position','Squad Snake (juego)','Arma un equipo posición a posición'],
 [G_('soccer-block-puzzle-game')]:['Line Up! (game)','Keep the team’s lines and close the gaps','Line Up! (juego)','Mantén las líneas del equipo y cierra huecos'],
 [G_('soccer-free-kick-game')]:['Flick It (game)','Curl free kicks round the wall','Flick It (juego)','Curva tiros libres por encima de la barrera'],
 [G_('soccer-shooting-game')]:['Ball Blaster (game)','Pick a target and strike it cleanly','Ball Blaster (juego)','Elige un objetivo y golpea limpio'],
 [G_('air-hockey-soccer-game')]:['Air Futbol (game)','Stay between the ball and the goal, like a keeper','Air Futbol (juego)','Ponte entre el balón y el arco, como un portero'],
 [G_('soccer-pinball')]:['Futbol Pinball (game)','Wall passes, rebounds and timing','Futbol Pinball (juego)','Paredes, rebotes y el momento justo'],
 [G_('soccer-swipe-game')]:['Kit Rush (game)','Spot your team’s shirt at a glance','Kit Rush (juego)','Reconoce la camiseta de tu equipo de un vistazo'],
 [G_('soccer-tennis-game')]:['Futbol Tennis (game)','First touch and choosing the right shot','Futbol Tennis (juego)','El primer toque y elegir el golpe'],
 [G_('soccer-juggling-game')]:['Keepy-Uppy Beat (game)','A soft touch and both feet','Keepy-Uppy Beat (juego)','Un toque suave y los dos pies'],
 [G_('soccer-merge-game')]:['Trophy Drop (game)','Merge your way up to the World Cup trophy','Trophy Drop (juego)','Combina hasta llegar a la copa del Mundial'],
 [TL('soccer-lineup-builder')]:['Soccer lineup builder','Put players in a formation and print it','Creador de alineaciones','Coloca jugadores en una formación e imprímela'],
 [TL('7v7-lineup-builder')]:['7v7 lineup builder','A 7v7 lineup with the right positions','Alineación de fútbol 7','Una alineación 7v7 con sus posiciones'],
 [TL('9v9-lineup-builder')]:['9v9 lineup builder','A 9v9 lineup with the right positions','Alineación de fútbol 9','Una alineación 9v9 con sus posiciones'],
 [TL('futsal-lineup-builder')]:['Futsal lineup builder','Five players on the court, with roles','Alineación de futsal','Cinco jugadores en la cancha, con sus roles'],
 [TL('soccer-tactics-board')]:['Soccer tactics board','Draw the move and play it step by step','Pizarra táctica','Dibuja la jugada y reprodúcela paso a paso'],
 [TL('soccer-match-timer')]:['Soccer match timer','Halves set by age, with added time','Reloj de partido','Tiempos según la edad, con tiempo añadido'],
 [TL('youth-soccer-field-size-guide')]:['Youth soccer field size guide','Field, goal and penalty area sizes by format','Medidas de la cancha','Cancha, arco y área por formato'],
 [TL('soccer-field-diagrams')]:['Blank soccer field diagrams','Print a field and draw on it','Diagramas de cancha','Imprime una cancha y dibuja en ella'],
 [TL('soccer-field-diagrams/soccer-positions-and-numbers')]:['Positions and numbers chart','Shirts 1 to 11 on one printable page','Cuadro de posiciones y números','Los dorsales del 1 al 11 en una página'],
 [TL('7v7-substitution-rotation')]:['7v7 substitution rotation','Equal minutes for every player','Rotación de cambios en fútbol 7','Minutos iguales para cada jugador'],
 [TL('9v9-substitution-rotation')]:['9v9 substitution rotation','Equal minutes for every player','Rotación de cambios en fútbol 9','Minutos iguales para cada jugador'],
 [TL('soccer-juggling-challenge')]:['Juggling challenge','Levels from 5 to 100 touches','Reto de dominadas','Niveles de 5 a 100 toques'],
 [TL('soccer-scanning-trainer')]:['Scanning trainer','Practise checking your shoulder','Entrenador de escaneo','Practica mirar por encima del hombro'],
 '/books':['Football pop-up books','The stories of famous players','Libros desplegables de fútbol','Las historias de futbolistas famosos']};
const PRACTISE:Readonly<Record<string,readonly string[]>>={
 'soccer-rules-quiz':[TL('soccer-match-timer'),TL('youth-soccer-field-size-guide'),G_('soccer-free-kick-game')],
 'offside-quiz':[G_('soccer-passing-puzzle-game'),TL('soccer-tactics-board'),G_('soccer-pinball')],
 'fouls-and-cards-quiz':[G_('soccer-free-kick-game'),TL('soccer-match-timer'),G_('soccer-block-puzzle-game')],
 'soccer-positions-quiz':[G_('soccer-snake-game'),TL('soccer-lineup-builder'),TL('soccer-field-diagrams/soccer-positions-and-numbers')],
 'soccer-positions-by-number-quiz':[TL('soccer-field-diagrams/soccer-positions-and-numbers'),G_('soccer-snake-game'),TL('soccer-lineup-builder')],
 'penalty-kick-quiz':[G_('soccer-shooting-game'),G_('air-hockey-soccer-game'),G_('soccer-free-kick-game')],
 'soccer-terms-quiz':[G_('soccer-pinball'),G_('soccer-passing-puzzle-game'),TL('soccer-tactics-board')],
 'futsal-rules-quiz':[TL('futsal-lineup-builder'),TL('youth-soccer-field-size-guide'),TL('soccer-match-timer')],
 '7v7-soccer-rules-quiz':[TL('7v7-lineup-builder'),TL('7v7-substitution-rotation'),TL('youth-soccer-field-size-guide')],
 'world-cup-quiz':[G_('soccer-merge-game'),G_('soccer-swipe-game'),'/books'],
 'goalkeeper-rules-quiz':[G_('air-hockey-soccer-game'),G_('soccer-shooting-game'),TL('youth-soccer-field-size-guide')],
 'throw-in-quiz':[TL('soccer-tactics-board'),TL('soccer-field-diagrams'),G_('soccer-passing-puzzle-game')],
 'corner-kick-and-goal-kick-quiz':[G_('soccer-free-kick-game'),TL('youth-soccer-field-size-guide'),TL('soccer-tactics-board')],
 'free-kick-quiz':[G_('soccer-free-kick-game'),G_('soccer-shooting-game'),TL('soccer-tactics-board')],
 '9v9-soccer-rules-quiz':[TL('9v9-lineup-builder'),TL('9v9-substitution-rotation'),TL('youth-soccer-field-size-guide')],
 'soccer-field-and-ball-size-quiz':[TL('youth-soccer-field-size-guide'),TL('soccer-field-diagrams'),TL('soccer-match-timer')],
 'soccer-formations-quiz':[G_('soccer-snake-game'),G_('soccer-block-puzzle-game'),TL('soccer-lineup-builder'),TL('soccer-tactics-board')],
 'attacking-tactics-quiz':[G_('soccer-passing-puzzle-game'),G_('soccer-pinball'),TL('soccer-tactics-board')],
 'defending-tactics-quiz':[G_('soccer-block-puzzle-game'),G_('air-hockey-soccer-game'),TL('soccer-tactics-board')],
 'soccer-skills-terms-quiz':[G_('soccer-tennis-game'),G_('soccer-juggling-game'),TL('soccer-juggling-challenge'),TL('soccer-scanning-trainer')],
 'famous-soccer-players-quiz':['/books',G_('soccer-swipe-game'),G_('soccer-merge-game')],
 'womens-world-cup-quiz':[G_('soccer-merge-game'),'/books',G_('soccer-shooting-game')]};
function covers(q:BankQuiz,lang:Lang){const m=new Map<string,number>();for(const x of q.questions)m.set(x.more,(m.get(x.more)??0)+1);
 return [...m].map(([p,n])=>({path:inLang(p,lang),name:pageName(p,lang),n}));}
function practise(q:BankQuiz,lang:Lang){return (PRACTISE[q.slug]??[]).map(p=>{const w=PRACTISE_PAGES[p];if(!w)throw new Error(`lib/site/quizzes.ts: no name for the practise page ${p}`);
 return {path:inLang(p,lang),name:lang==='es'?w[2]:w[0],line:lang==='es'?w[3]:w[1]};});}
function build(q:BankQuiz,lang:Lang):SiteQuiz{
 const enPath=quizPath(q.slug);
 return {...q,title:seoTitle(q,lang),covers:covers(q,lang),practise:practise(q,lang),enPath,path:inLang(enPath,lang),questions:q.questions.map((x,i)=>{
  if(x.kind==='spot'&&(!x.spot||x.spot.at.length!==x.options.length))throw new Error(`${q.slug} #${i}: a spot question needs one target per option`);
  const {perm,...o}=order(`${q.slug}#${i}`,x),sp=x.spot?spotPic(x.spot):undefined;
  return {kind:x.kind,q:x.q,...o,...(sp?{spot:{...sp,at:perm.map(k=>sp.at[k])}}:{}),explain:x.explain,
   ...(x.fact?{fact:x.fact}:{}),...(x.pic?{pic:x.pic}:{}),more:{href:inLang(x.more,lang),name:pageName(x.more,lang)}};})};
}
export const QUIZZES:readonly SiteQuiz[]=QUIZ_BANK.map(q=>build(q,'en'));
export const QUIZZES_ES:readonly SiteQuiz[]=QUIZ_BANK_ES.map(q=>build(q,'es'));
export const quizBySlug=(slug:string,lang:Lang='en')=>(lang==='es'?QUIZZES_ES:QUIZZES).find(q=>q.slug===slug)??null;
export const QUIZ_QUESTIONS=QUIZZES.reduce((a,q)=>a+q.questions.length,0);
for(const s of QUIZ_BANK.map(q=>q.slug))if(!ES_QUIZ_SLUGS[s])throw new Error(`lib/i18n/esPaths.ts ES_QUIZ_SLUGS: no Spanish slug for ${s}`);

/** The hub's groups, in reading order (owner, Nov 23 2026: Rules, Positions, Tactics, Terms, History). */
export const QUIZ_TOPICS:readonly {id:QuizTopic;en:string;es:string;line:[string,string]}[]=[
 {id:'rules',en:'Rules quizzes',es:'Quizzes de reglas',line:['The Laws of the Game, offside, cards, penalties, futsal and 7v7.','Las Reglas de Juego, el fuera de juego, las tarjetas, los penales, el futsal y el 7v7.']},
 {id:'positions',en:'Positions quizzes',es:'Quizzes de posiciones',line:['Who plays where, and the classic shirt numbers.','Quién juega dónde, y los dorsales clásicos.']},
 {id:'tactics',en:'Tactics quizzes',es:'Quizzes de táctica',line:['Attacking and defending ideas, and the shapes teams play in.','Ideas para atacar y defender, y las formas en que juegan los equipos.']},
 {id:'terms',en:'Terms quizzes',es:'Quizzes de términos',line:['Football words, from nutmeg and hat-trick to step-over and stoppage time.','Palabras del fútbol, del caño y el triplete a la bicicleta y el tiempo añadido.']},
 {id:'history',en:'History quizzes',es:'Quizzes de historia',line:['World Cups, famous players and big moments, from our History Museum and pop-up books.','Mundiales, jugadores famosos y grandes momentos, del Museo de Historia y los libros desplegables.']}];
/** SEO batch E: who each topic's quizzes are for (the "What this quiz covers" section). */
export const QUIZ_FOR_WHO:Readonly<Record<QuizTopic,[string,string]>>={
 rules:['For kids aged 7 to 12 who play or watch soccer, and for parents and new coaches who want to check a rule before game day.','Para niños de 7 a 12 años que juegan o ven fútbol, y para familias y entrenadores nuevos que quieren repasar una regla antes del partido.'],
 positions:['For young players finding out where they play, and for coaches and parents giving out positions for the first time.','Para jugadores jóvenes que descubren dónde juegan, y para entrenadores y familias que reparten posiciones por primera vez.'],
 tactics:['For players aged 9 to 12 moving up to 7v7, 9v9 or 11v11, and for the coaches who teach them how a team attacks and defends.','Para jugadores de 9 a 12 años que pasan al fútbol 7, 9 u 11, y para los entrenadores que les enseñan a atacar y defender en equipo.'],
 terms:['For kids who hear football words at practice or on TV, and for parents who want to know what they mean.','Para niños que oyen palabras del fútbol en el entrenamiento o en la tele, y para familias que quieren saber qué significan.'],
 history:['For football fans aged 7 to 12, curious parents and classes doing a football project.','Para aficionados de 7 a 12 años, familias curiosas y clases que hacen un proyecto sobre fútbol.']};
export const quizzesIn=(t:QuizTopic,lang:Lang='en')=>(lang==='es'?QUIZZES_ES:QUIZZES).filter(q=>q.topic===t);

export const QUIZ_HUB={
 en:{title:`Soccer Quizzes for Kids: ${QUIZZES.length} Free Quizzes + Answers`/* SEO batch E, Nov 25 2026; was "Soccer Quizzes: Rules, Positions, Tactics and History" */,crumb:'Quizzes',h1:'Soccer quizzes by topic',
  desc:`${QUIZZES.length} free soccer quizzes for kids 7 to 12: rules, offside, positions, formations, tactics, terms, World Cup history and famous players. With answers.`,
  lead:`${QUIZZES.length} free soccer (football) quizzes for kids aged 7 to 12, with ${QUIZ_QUESTIONS} questions in all. Each one plays right on its page: tap an answer, see why, and get your score at the end.`},
 es:{title:`Preguntas de fútbol para niños: ${QUIZZES_ES.length} quizzes con respuestas`/* SEO batch E; was "Preguntas de fútbol para niños: quizzes gratis" */,crumb:'Quizzes',h1:'Quizzes de fútbol por tema',
  desc:`${QUIZZES_ES.length} quizzes de fútbol gratis para niños de 7 a 12 años: reglas, posiciones, formaciones, táctica, términos, historia y jugadores famosos.`,
  lead:`${QUIZZES_ES.length} quizzes de fútbol gratis para niños de 7 a 12 años, con ${QUIZ_QUESTIONS} preguntas en total. Cada uno se juega en su página: toca una respuesta, mira el porqué y recibe tu puntuación al final.`}};
export const QUIZ_HUB_FAQ={
 en:[{q:'Are these soccer quizzes free?',a:'Yes. Every quiz is free, with no account and no ads. Your best score is kept only on your own device.'},
  {q:'What ages are the quizzes for?',a:'Kids aged 7 to 12, and parents and new coaches who want a quick check. The words are short and every answer has a reason.'},
  {q:'Where do the answers come from?',a:'From the IFAB Laws of the Game, U.S. Soccer’s youth standards and the exhibits in our History Museum. Each quiz lists its sources.'},
  {q:'Are there more quizzes in the game?',a:'Yes. Every lesson in Futbol Island ends with its own quiz on the pitch.'},
  /* SEO batch E */{q:'Which soccer quiz should a beginner start with?',a:'The soccer rules quiz: game length, throw-ins, goal kicks, corners and handball. Then try the positions quiz and the offside quiz. Every question links to the page that teaches it.'}],
 es:[{q:'¿Los quizzes son gratis?',a:'Sí. Todos son gratis, sin cuenta y sin anuncios. Tu mejor puntuación se guarda solo en tu dispositivo.'},
  {q:'¿Para qué edades son?',a:'Para niños de 7 a 12 años, y para familias y entrenadores nuevos que quieren repasar. Las frases son cortas y cada respuesta tiene su porqué.'},
  {q:'¿De dónde salen las respuestas?',a:'De las Reglas de Juego de la IFAB, las normas juveniles de U.S. Soccer y las vitrinas de nuestro Museo de Historia. Cada quiz lista sus fuentes.'},
  {q:'¿Hay más preguntas en el juego?',a:'Sí. Cada lección de Futbol Island termina con su propia prueba en la cancha.'},
  {q:'¿Con qué quiz de fútbol empiezo?',a:'Con el quiz de reglas del fútbol: duración del partido, saques de banda, saques de meta, córneres y mano. Luego prueba el de posiciones y el del fuera de juego. Cada pregunta enlaza a la página que la explica.'}]};

/** "Test yourself" (owner brief): the guide pages that get one small card linking to their quiz. English paths. */
const RQ=(s:string)=>`/learn/soccer-rules/${s}`,TQ=(s:string)=>`/learn/soccer-terms/${s}`,P_=(s:string)=>`/learn/soccer-positions/${s}`;
export const QUIZ_FOR:Readonly<Record<string,string>>={
 ...Object.fromEntries(['kick-off','substitutions-and-game-length'].map(s=>[RQ(s),'soccer-rules-quiz'])),
 [RQ('offside')]:'offside-quiz',[RQ('fouls-and-free-kicks')]:'fouls-and-cards-quiz',[RQ('yellow-and-red-cards')]:'fouls-and-cards-quiz',[RQ('handball')]:'fouls-and-cards-quiz',
 [RQ('penalty-kick')]:'penalty-kick-quiz',[RQ('futsal-rules')]:'futsal-rules-quiz',[RQ('build-out-line')]:'7v7-soccer-rules-quiz',[RQ('heading-rules-for-kids')]:'9v9-soccer-rules-quiz',
 /* Nov 23 2026: the new quizzes take the pages they teach */[RQ('throw-in')]:'throw-in-quiz',[RQ('goal-kick')]:'corner-kick-and-goal-kick-quiz',[RQ('corner-kick')]:'corner-kick-and-goal-kick-quiz',
 [RQ('back-pass-rule')]:'goalkeeper-rules-quiz',[RQ('advantage')]:'free-kick-quiz',[RQ('drop-ball')]:'free-kick-quiz',
 ...Object.fromEntries(POSITIONS.map(p=>[p.path,'soccer-positions-quiz'])),[P_('goalkeeper')]:'goalkeeper-rules-quiz',
 ...Object.fromEntries(FORMATIONS.map(f=>[f.path,'soccer-formations-quiz'])),
 ...Object.fromEntries(['nutmeg','hat-trick','brace','clean-sheet','assist','own-goal','man-on','tap-in','header','volley','chip','stoppage-time','extra-time','near-post','far-post','possession'].map(s=>[TQ(s),'soccer-terms-quiz'])),
 ...Object.fromEntries(['two-v-one','through-ball','give-and-go','overlap','underlap','cutback','switching-play','width','counterattack','third-man-run','overload','support','build-up'].map(s=>[TQ(s),'attacking-tactics-quiz'])),
 ...Object.fromEntries(['pressing','cover','marking','goal-side','jockeying','clearance','low-block','high-line','offside-trap','tackle'].map(s=>[TQ(s),'defending-tactics-quiz'])),
 ...Object.fromEntries(['false-nine','box-to-box','sweeper-keeper','pivot'].map(s=>[TQ(s),'soccer-formations-quiz'])),
 ...Object.fromEntries(['step-over','dummy','shielding','first-touch','one-touch','half-volley','weak-foot','scanning','square-pass','cross','dribble'].map(s=>[TQ(s),'soccer-skills-terms-quiz'])),
 [TQ('set-piece')]:'free-kick-quiz',[TQ('free-kick-wall')]:'free-kick-quiz',[TQ('goal-area')]:'corner-kick-and-goal-kick-quiz',
 [TQ('penalty-shoot-out')]:'penalty-kick-quiz',[TQ('penalty-area')]:'penalty-kick-quiz'/* Nov 24 2026: the penalty cluster shares one quiz */,[TQ('yellow-card')]:'fouls-and-cards-quiz',[TQ('red-card')]:'fouls-and-cards-quiz'};
/** The quiz for an English guide path, in a language (null when the page has none). */
export const quizForPage=(enPath:string,lang:Lang='en')=>{const s=QUIZ_FOR[enPath];return s?quizBySlug(s,lang):null;};

/** SEO batch E (Nov 25 2026): the quizzes each lesson hub links (English hub slugs; the Spanish hubs use the same list). */
export const HUB_QUIZZES:Readonly<Record<string,readonly string[]>>={
 'football-rules-for-kids':['soccer-rules-quiz','throw-in-quiz','corner-kick-and-goal-kick-quiz','free-kick-quiz','goalkeeper-rules-quiz','7v7-soccer-rules-quiz','9v9-soccer-rules-quiz'],
 'soccer-quiz-for-kids':['soccer-rules-quiz','offside-quiz','soccer-positions-quiz','soccer-positions-by-number-quiz','soccer-terms-quiz','world-cup-quiz','famous-soccer-players-quiz','womens-world-cup-quiz'],
 'passing-and-support':['attacking-tactics-quiz','soccer-skills-terms-quiz','soccer-terms-quiz'],
 'futsal-for-kids':['futsal-rules-quiz','soccer-formations-quiz','soccer-field-and-ball-size-quiz'],
 '7v7-9v9-11v11':['7v7-soccer-rules-quiz','9v9-soccer-rules-quiz','soccer-formations-quiz','soccer-field-and-ball-size-quiz'],
 lessons:['soccer-rules-quiz','offside-quiz','soccer-positions-quiz','attacking-tactics-quiz','defending-tactics-quiz','soccer-field-and-ball-size-quiz','throw-in-quiz']};
export const HUB_QUIZ_WORDS={en:{title:'Quizzes with answers',rail:'Quizzes',hub:'All soccer quizzes',hubLine:(n:number)=>`${n} free quizzes by topic, with answers`},
 es:{title:'Quizzes con respuestas',rail:'Quizzes',hub:'Todos los quizzes de fútbol',hubLine:(n:number)=>`${n} quizzes gratis por tema, con respuestas`}};
/** The links for a hub's quiz section (null when the hub has none). */
export function hubQuizLinks(slug:string,lang:Lang){const list=HUB_QUIZZES[slug];if(!list)return null;const w=HUB_QUIZ_WORDS[lang];
 return [...list.map(s=>{const q=quizBySlug(s,lang)!;return {path:q.path,name:q.h1,line:lang==='es'?`${q.questions.length} preguntas con respuestas`:`${q.questions.length} questions with answers`};}),
  {path:inLang(QUIZZES_PATH,lang),name:w.hub,line:w.hubLine((lang==='es'?QUIZZES_ES:QUIZZES).length)}];}
