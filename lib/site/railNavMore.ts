import {sectionRail,sectionRailEs,type Rail,type RailFamily,type RailGroup,type RailItem} from './railNav';
import {railId} from './railId';
import {LIBRARY_PATH} from './libraryPath';
import {toEs} from '@/lib/i18n/esPaths';
import {GAMES_HUB} from './games';
import {FORMAT_LABEL,FORMAT_ORDER} from './lessons';
import {PLANS,PLANS_HUB} from './plans';
import {ES_DRILL_HUBS} from '@/lib/i18n/es/drillsRegistry';
/**
 * Rails for the rest of the Library's page types (layout batch 3, Nov 20 2026; owner: "how are the internal page fixes coming
 * along? shouldn't they have side navs too?"). Same shape as lib/site/railNav.ts: the section hub and the Library pinned on top,
 * then the section's pages from the data, grouped as the data groups them. A set too big for one rail (lessons, cards, fish) lists
 * its groups and opens only the current page's group, so a rail stays under about 60 entries. A hub shows the same rail as its
 * pages, itself marked at the top (owner, Nov 20 2026: "soccer rules left nav is confusing. it still has the options from the main
 * library"); a big set's hub lists its groups.
 */
const LIB_EN:RailItem={href:LIBRARY_PATH,name:'Library'},LIB_ES:RailItem={href:toEs(LIBRARY_PATH),name:'Biblioteca'};
const lib=(es=false)=>es?LIB_ES:LIB_EN;
const rail=(label:string,hub:RailItem,groups:RailGroup[],es=false):Rail=>({label,up:[hub,lib(es)],groups:groups.filter(g=>g.items.length)});

/** /games/<slug>: Back to all games, then the game page's own sections. */
export function gameRail(name:string):Rail{
 return pageRail(`${name} on this page`,{href:GAMES_HUB.path,name:'All games'},[sec('what','What it is'),sec('how','How to play'),sec('teaches','What it teaches'),
  sec('tips','Tips'),sec('harder','Difficulty'),sec('parents','For parents'),sec('faq','Questions'),sec('again','Play again'),sec('more','More games'),sec('island','The whole island')]);/* Nov 24 2026: the Play again section */
}

/** A lesson page: Back to all lessons, Overview, then the lesson's own sections (quiz, topic hubs and guides only where it has them). */
export function lessonRail(has:{quiz:boolean;hubs:boolean;guides:boolean},es=false):Rail{
 const t=(en:string,sp:string)=>es?sp:en;
 return pageRail(t('This lesson','Esta lección'),{href:es?toEs('/learn/lessons'):'/learn/lessons',name:t('All lessons','Todas las lecciones')},[sec('learn',t('What you learn','Lo que aprendes')),sec('coach',t('What the coach says','Lo que dice el entrenador')),
  ...(has.quiz?[sec('quiz',t('Quiz','Prueba'))]:[]),sec('siblings',t('Keep going','Sigue')),...(has.hubs?[sec('related',t('More like this','Más como esta'))]:[]),
  ...(has.guides?[sec('guides',t('Related guides','Guías relacionadas'))]:[]),sec('faq',t('Questions','Preguntas'))],es);
}
/** The lessons index: Back to the Library, Overview, then what is on the index (the clip where it has one, the topics, the four formats). */
export function lessonsIndexRail(clip:string|null,es=false):Rail{
 const w=(f:string)=>f==='futsal'?(es?'futsal':'Futsal'):FORMAT_LABEL[f as keyof typeof FORMAT_LABEL]??f;
 return hubRail(es?'Lecciones en esta página':'Lessons on this page',[{items:[...(clip?[sec(clip,es?'Míralo en el juego':'See it in the game')]:[]),sec('topics',es?'Por tema':'By topic'),sec('quizzes','Quizzes')/* SEO batch E */,
  ...FORMAT_ORDER.map(f=>sec(`fmt-${f}`,es?`Lecciones de ${w(f)}`:`${w(f)} lessons`))]}],es);
}
/** A practice plan: Back to all plans, Overview, then the plan's sections. */
export function planRail(es=false):Rail{
 const t=(en:string,sp:string)=>es?sp:en;
 return pageRail(t('This plan','Este plan'),es?{href:ES_DRILL_HUBS.plans.path,name:'Todos los planes'}:{href:PLANS_HUB.path,name:'All practice plans'},[sec('facts',t('At a glance','De un vistazo')),
  sec('clock',t('The plan','El plan')),sec('equipment',t('Equipment','Material')),sec('notes',t('Coach notes','Notas')),sec('swap',t('If it goes badly','Si sale mal')),
  sec('structure',t('How it is built','Cómo está hecho')),sec('drills',t('Drills','Ejercicios')),sec('faq',t('Questions','Preguntas')),sec('keep-reading',t('Keep reading','Sigue leyendo'))],es);
}
/** The practice plans hub: Back to the Library, Overview, the four age groups and the hub's other sections. */
export function plansHubRail(es=false):Rail{
 const t=(en:string,sp:string)=>es?sp:en;
 return hubRail(t('Practice plans on this page','Planes en esta página'),[{items:[...[...new Set(PLANS.map(p=>p.age))].map(a=>sec(a.toLowerCase(),t(`${a} plans`,`Planes ${a}`))),
  sec('structure',t('How plans are built','Cómo se hacen')),sec('length',t('How long','Cuánto dura')),sec('picture',t('The end game','El juego final')),sec('faq',t('Questions','Preguntas')),sec('keep-reading',t('Keep reading','Sigue leyendo'))]}],es);
}
/** A hub's rail mirrors the hub page (owner, Nov 20 2026: "the side nav always shows what is on the page you are looking at"): Overview
 *  (#top, the head) then the page's own cards and rows as in-page anchors, in the page's groups, with only the Library pinned on top
 *  (the hub is the page itself). Pass current="#top" to RailNav; LibraryMenuSpy lights the entry on screen and glides on a tap. */
export function hubRail(label:string,groups:RailGroup[],es=false):Rail{
 return {label,up:[lib(es)],groups:[{items:[{href:'#top',name:es?'Resumen':'Overview'}]},...groups.filter(g=>g.items.length)]};
}
/** A rail entry for a hub card or row given `ids={prefix}` (components/site/HubParts.tsx CardGrid, LinkList, DrillList). */
export const anchor=(prefix:string,path:string,name:string):RailItem=>({href:`#${railId(prefix,path)}`,name});
/** A rail entry for a section heading already on the page. */
export const sec=(id:string,name:string):RailItem=>({href:`#${id}`,name});
/** Short rail / chip labels for the topic hubs' long lesson-group titles (owner, Nov 20 2026: chip labels short; the headings on
 *  the page stay). Keyed by the full heading, English and Spanish; a title not listed is short enough already. */
const HUB_GROUP_SHORT:Readonly<Record<string,string>>={
 '7v7: Meet the team and restart':'7v7: Team and restart','7v7: Connect around pressure':'7v7: Around pressure',
 '7v7: Protect the goal together':'7v7: Protect the goal','9v9: Find your unit and receive':'9v9: Find your unit',
 '9v9: Read the spare option':'9v9: The spare option','9v9: Share the next job':'9v9: The next job',
 '11v11: Receive inside the team shape':'11v11: Team shape','11v11: Create the next opening':'11v11: Next opening',
 '11v11: Keep the team connected':'11v11: Stay connected','11v11: Restart and time the run':'11v11: Time the run',
 'The build-out line and offside in 7v7':'Build-out and offside','Goal kicks and goal clearances':'Goal kicks',
 'Throw-ins, kick-ins and dribble-ins':'Throw-ins and kick-ins','Receive, turn or give it back':'Receive and turn',
 'Wall passes and the third player':'Wall passes',
 '7v7: Conoce al equipo y reanuda el juego':'7v7: Equipo y reanudar','7v7: Conéctate para salir de la presión':'7v7: Salir de la presión',
 '7v7: Protege el arco con tu equipo':'7v7: Protege el arco','9v9: Encuentra tu línea y recibe':'9v9: Tu línea',
 '9v9: Lee la opción libre':'9v9: La opción libre','9v9: Reparte la siguiente tarea':'9v9: La siguiente tarea',
 '9v9: Reanuda y sigue a tu rival':'9v9: Reanuda y sigue','11v11: Recibe dentro de la forma del equipo':'11v11: Forma del equipo',
 '11v11: Crea el siguiente espacio':'11v11: Crea espacio','11v11: Mantén al equipo conectado':'11v11: Equipo conectado',
 '11v11: Reanuda y elige el momento de correr':'11v11: Elige el momento',
 'La línea de salida y el fuera de juego en 7v7':'Salida y fuera de juego','Saques de meta y saques de portero':'Saques de meta',
 'Saques de banda con la mano, con el pie o conduciendo':'Saques de banda','Jugadas a balón parado (futsal)':'Balón parado (futsal)',
 'Desmárcate para recibir el pase':'Desmárcate','Recibe, gira o devuélvela':'Recibe y gira','Paredes y el tercer hombre':'Paredes',
 'Conducir, regatear o pasar':'Conducir o pasar'};
export const hubGroupLabel=(title:string)=>HUB_GROUP_SHORT[title]??title;

/** A detail page's rail (owner, Nov 20 2026: "this internal page should not have the list of games. it should list what's on that
 *  page to smooth scroll down"): Back to the level above, then Overview (#top, the head) and the page's own sections in page order.
 *  Pass current="#top" to RailNav. */
export function pageRail(label:string,back:RailItem,sections:readonly RailItem[],es=false):Rail{
 return {label,up:[back],groups:[{items:[{href:'#top',name:es?'Resumen':'Overview'},...sections]}]};
}

/** The five guide families' detail pages (rule, term, drill, position, formation; EN and ES): Back to the section hub, Overview,
 *  then the page's sections. `has` names the optional sections this page has (the template's own conditions). Labels are short
 *  so the phone chip bar stays readable; the ids are the template's Section / QA / KeepReading ids. */
type L2=readonly [id:string,en:string,es:string,optional?:boolean];
const CARD_PAGE=['card-rules','what-happens-next','yellow-vs-red','cards-in-youth-soccer','card-game'];
const QUIZ:Record<RailFamily,boolean>={rules:true,terms:true,positions:true,drills:false,formations:false};
const GUIDE_SECTIONS:Record<RailFamily,readonly L2[]>={
 rules:[['card-rules','Card rules','Reglas de las tarjetas',true],['what-happens-next','What happens next','Qué pasa después',true],['yellow-vs-red','Yellow vs red','Amarilla o roja',true],
  ['cards-in-youth-soccer','In youth soccer','En el fútbol infantil',true],['diagram','Diagram','Diagrama'],['card-game','Card game','Juego de tarjetas',true],['referee','What the referee looks for','Qué mira el árbitro'],['by-country','By country','Por país',true],['mixups','Mix-ups','Confusiones'],
  ['formats','By game size','Por tamaño de juego'],['futsal-vs-soccer','Futsal vs soccer','Futsal y fútbol',true]],
 terms:[['diagram','Diagram','Diagrama'],['how','How it works','Cómo funciona'],['types','Types','Tipos',true],['mistakes','Mistakes','Errores'],['other-side','The other side','El otro lado',true],
  ['also-means','Also means','También significa',true],['formats','By game size','Por tamaño de juego']],
 drills:[['diagram','Setup','Montaje'],['facts','At a glance','De un vistazo'],['steps','How to run it','Cómo hacerlo'],['cues','Coaching points','Consignas'],['versions','Easier or harder','Más fácil o más difícil'],
  ['mistakes','Mistakes','Errores'],['game','In a game','En el partido'],['home','At home','En casa',true]],
 positions:[['where','Where they stand','Dónde se coloca'],['glance','At a glance','De un vistazo'],['with','With the ball','Con el balón'],['without','Without the ball','Sin el balón'],['habits','Habits','Hábitos'],
  ['number','Shirt number','Dorsal'],['small','Smaller games','Juegos más pequeños']],
 formations:[['diagram','Diagram','Diagrama'],['glance','At a glance','De un vistazo'],['roles','Who plays where','Quién juega dónde'],['strengths','Strengths','Puntos fuertes'],['weak','Weak spots','Puntos débiles'],
  ['moves','How it moves','Cómo se mueve'],['suits','Who it suits','A quién le va']],
};
/** `has` may include 'cards' for the yellow and red cards page's own sections; `play` is a rule page's card deck and game
 *  (lib/site/rulePlay.ts: back-pass, throw-in, handball, fouls), shown before and after the diagram. */
export function guideRail(family:RailFamily,has:readonly string[]=[],es=false,play?:{deck:{id:string};game:{id:string}}|null):Rail{
 if(has.includes('cards'))has=[...has,...CARD_PAGE];
 const base=es?sectionRailEs(family):sectionRail(family);
 const list=GUIDE_SECTIONS[family].filter(x=>!x[3]||has.includes(x[0])).flatMap(x=>{const s=sec(x[0],es?x[2]:x[1]);
  return play&&x[0]==='diagram'?[sec(play.deck.id,es?'Paso a paso':'Card by card'),s,sec(play.game.id,es?'Pruébalo':'Try it')]:[s];});
 return pageRail(es?`${base.label}: en esta página`:`${base.label}: on this page`,base.up[0],[...list,sec('faq',es?'Preguntas':'Questions'),sec('coach-notes',es?'Notas del entrenador':'Coach notes'),
  ...(QUIZ[family]?[sec('quiz',es?'Prueba':'Quiz')]:[]),sec('keep-reading',es?'Sigue leyendo':'Keep reading')],es);
}

/** A drill guide by age or skill (/learn/soccer-drills/u8, /passing, /at-home; owner, Nov 20 2026: "all internal pages need to
 *  have side navs"): Back to all drills, Overview, then the guide's sections in page order with short labels (the headings on the
 *  page stay as they are). */
const DRILL_GUIDE_SHORT:Record<string,string>={can:'What they can do',groups:'Group sizes',avoid:'What to avoid',basics:'The basics',mistakes:'Mistakes',need:'What you need',
 order:'By age',plan:'Home practice',rules:'Rules to know',safety:'Safety',technique:'Technique',tips:'Tips for parents'};
const DRILL_GUIDE_SHORT_ES:Record<string,string>={can:'Qué pueden hacer',groups:'Grupos',avoid:'Qué evitar',basics:'Lo básico',mistakes:'Errores',need:'Qué necesitas',
 order:'Por edad',plan:'Práctica en casa',rules:'Reglas',safety:'Seguridad',technique:'Técnica',tips:'Consejos'};
export function drillGuideRail(g:{facts?:unknown;before:readonly {id:string;title:string}[];after:readonly {id:string;title:string}[];featured:string},hasPlans:boolean,es=false):Rail{
 const t=(en:string,sp:string)=>es?sp:en,short=es?DRILL_GUIDE_SHORT_ES:DRILL_GUIDE_SHORT;
 const s=(x:{id:string;title:string})=>sec(x.id,short[x.id]??x.title);
 return pageRail(t('This guide','Esta guía'),es?{href:ES_DRILL_HUBS.drills.path,name:'Todos los ejercicios'}:{href:'/learn/soccer-drills',name:'All soccer drills'},
  [...(g.facts?[sec('facts',t('At a glance','De un vistazo'))]:[]),...g.before.map(s),sec('drills',t('The drills','Los ejercicios')),sec('diagram',t('Example','Ejemplo')),...g.after.map(s),
   ...(hasPlans?[sec('plans',t('Practice plans','Planes'))]:[]),sec('faq',t('Questions','Preguntas')),sec('keep-reading',t('Keep reading','Sigue leyendo'))],es);
}
