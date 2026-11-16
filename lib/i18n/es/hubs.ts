import {HUBS,type Hub} from '@/lib/site/hubs';
import {FORMAT_LABEL,FORMAT_ORDER,LESSONS,type SiteLesson} from '@/lib/site/lessons';
import {TEAM_SIZES} from '@/lib/site/comparisons';
import {CATEGORY_ES,CHAPTER_ES,esLesson,type EsLesson} from './lessons';
import {DEFINITION_ES,HUB_COMMON_FAQ_ES} from './safety';
import type {Faq,HubEs} from './types';
import {toEs} from '../esPaths';
/**
 * The Spanish lesson hubs (Spanish round D, Nov 16 2026): the words of lib/site/hubs.ts HUBS, with the same computed counts.
 * Groups are 1:1 with the English groups (same lessons, same order); the lessons are the Spanish records (lib/i18n/es/lessons.ts),
 * and FAQ answers that quote a lesson's concept quote the Spanish concept. Also the 7v7 vs 9v9 vs 11v11 table (TEAM_SIZES).
 */
const conceptEs=(id:string)=>{const l=esLesson(id);if(!l)throw new Error(`hub lesson ${id} is not in the lesson catalog`);return l.concept;};
const lessonsOf=(h:Hub)=>h.groups.flatMap(g=>g.lessons);
const qs=(ls:readonly SiteLesson[])=>ls.reduce((a,l)=>a+l.questions.length,0);
const andEs=(xs:readonly string[])=>xs.length>1?`${xs.slice(0,-1).join(', ')} y ${xs[xs.length-1]}`:xs[0]??'';
const fmtsEs=(ls:readonly SiteLesson[])=>andEs(FORMAT_ORDER.filter(x=>ls.some(l=>l.format===x)).map(x=>x==='futsal'?'futsal':FORMAT_LABEL[x]));
const count=(f:string)=>LESSONS.filter(l=>l.format===f).length;
const label=(f:string)=>f==='Futsal'?'futsal':f;
const catEs=(c:string)=>c==='More lessons'?'Más lecciones':(()=>{const v=CATEGORY_ES[c];if(!v)throw new Error(`Spanish category "${c}" missing`);return v;})();

const RULES_GROUPS_ES=[
 {title:'La línea de salida y el fuera de juego en 7v7',line:'Dónde espera el otro equipo en un saque de meta y desde dónde empieza a contar el fuera de juego.'},
 {title:'Saques de meta y saques de portero',line:'Reanudar el juego desde el portero con más de una opción.'},
 {title:'Saques de banda con la mano, con el pie o conduciendo',line:'Reanudaciones desde la línea de banda, con las manos, con los pies o conduciendo el balón.'},
 {title:'Saques de esquina',line:'Cobrar un saque de esquina y defenderlo.'},
 {title:'Tiros libres',line:'La barrera, el tiro libre corto y dejar atrás a un compañero de seguridad.'},
];
const PASS_GROUPS_ES=[
 {title:'Desmárcate para recibir el pase',line:'Muévete para que un compañero te vea y te pueda pasar.'},
 {title:'Recibe, gira o devuélvela',line:'Mira antes de que llegue el balón y luego elige.'},
 {title:'Paredes y el tercer hombre',line:'Usa a un compañero para superar la presión.'},
 {title:'Conducir, regatear o pasar',line:'Lee al defensa antes de decidir.'},
 {title:'Cambia el juego',line:'Lleva el balón al lado donde hay espacio.'},
];
const VIDEO_ES:Readonly<Record<string,{name:string;description:string}>>={
 'passing-and-support':{name:'Rompecabezas de pase: dibuja un pase que rodee al defensa',description:'Un rompecabezas de pase de Futbol Island: el niño dibuja un pase que rodea al defensa para encontrar a un compañero en el espacio, la misma idea que las lecciones de pases y apoyo.'},
 'soccer-quiz-for-kids':{name:'Prueba de fútbol para niños: toca el mejor lugar en la cancha',description:'Una pregunta de prueba de Futbol Island: el niño responde tocando el mejor lugar para un compañero en la cancha y luego el entrenador explica la respuesta.'},
};
function words(h:Hub):HubEs{
 const ls=lessonsOf(h),n=ls.length,g=h.groups,common=HUB_COMMON_FAQ_ES,video=VIDEO_ES[h.slug];
 const one=(...faq:Faq[])=>[...faq,...common];
 switch(h.slug){
  case 'football-rules-for-kids':return {crumb:'Lecciones de reglas',blurb:`${n} lecciones sobre saques de meta, saques de banda, de esquina y tiros libres`,
   title:'Reglas del fútbol para niños: lecciones y pruebas',
   description:`Reglas del fútbol para niños: saques de meta, la línea de salida, saques de banda, de esquina y tiros libres, en ${n} lecciones gratis con prueba.`,
   h1:'Lecciones de reglas del fútbol para niños',
   lead:`${DEFINITION_ES} Estas ${n} lecciones enseñan las reanudaciones del juego: los saques de meta y la línea de salida (build-out line), los saques de banda con la mano y con el pie, los saques de esquina y los tiros libres, en ${fmtsEs(ls)}.`,
   groups:RULES_GROUPS_ES,
   faq:one({q:'¿Qué es la línea de salida en 7v7?',a:`En 7v7, en un saque de meta: ${conceptEs('learn7_buildout')}`},
    {q:'¿Puede haber fuera de juego en 7v7?',a:conceptEs('next7_offsideboundary')},
    {q:'¿Qué reanudaciones cubren las lecciones?',a:`${RULES_GROUPS_ES.map((x,i)=>`${x.title} (${g[i].lessons.length})`).join('; ')}. Cada lección termina con una prueba corta.`}),video};
  case 'soccer-quiz-for-kids':{const Q=qs(ls),groups=g.map(x=>{const f=label(x.title.replace(' quizzes',''));return {f,title:`Pruebas de ${f}`,line:`${x.lessons.length} ${x.lessons.length===1?'prueba':'pruebas'} con ${qs(x.lessons)} preguntas.`};});
   return {crumb:'Pruebas de fútbol',blurb:`${n} pruebas con ${Q} preguntas`,title:'Pruebas de fútbol para niños: preguntas gratis',
   description:`${n} pruebas gratis de fútbol para niños con ${Q} preguntas sobre posiciones, pases, defensa y reglas en 7v7, 9v9, 11v11 y futsal.`,
   h1:'Pruebas de fútbol para niños',
   lead:`${DEFINITION_ES} Cada lección termina con una prueba: ${n} pruebas y ${Q} preguntas en total, agrupadas aquí por tipo de partido. Cada una muestra su primera pregunta; abre una lección para leerlas todas.`,
   groups:groups.map(({title,line})=>({title,line})),
   faq:one({q:'¿Cuántas preguntas hay?',a:`${Q} preguntas en ${n} pruebas de lecciones: ${andEs(groups.map((x,i)=>`${g[i].lessons.length} de ${x.f}`))}.`},
    {q:'¿Cómo funciona una prueba en el juego?',a:'Cada idea se muestra en una cancha con jugadores que se mueven, la explica la voz de un entrenador paso a paso y se repasa con una prueba rápida. Una lección solo cuenta cuando todas las respuestas son correctas.'},
    {q:'¿Las páginas de las lecciones dan las respuestas?',a:'No. El sitio muestra cada pregunta con sus opciones en orden de la A a la Z y la explicación del entrenador, pero nunca marca la respuesta correcta. Los niños responden en la cancha, dentro del juego.'}),video};}
  case 'passing-and-support':return {crumb:'Pases y apoyo',blurb:`${n} lecciones para desmarcarte, hacer paredes y cambiar el juego`,
   title:'Lecciones de pases y apoyo para niños',
   description:`Cómo desmarcarte, recibir, hacer una pared y cambiar el juego: ${n} lecciones gratis de fútbol para niños, cada una con su prueba.`,
   h1:'Pases y apoyo para niños',
   lead:`${DEFINITION_ES} Estas ${n} lecciones enseñan el pase y el apoyo: desmarcarte, recibir y girar, hacer paredes, conducir el balón y cambiar el juego, en ${fmtsEs(ls)}.`,
   groups:PASS_GROUPS_ES,
   faq:one({q:'¿Cómo me desmarco para recibir un pase?',a:conceptEs('prn_7_support')},{q:'¿Cuándo debo hacer una pared?',a:conceptEs('s_onetwo')},{q:'¿Por qué cambiar el juego?',a:conceptEs('e_switch')}),video};
  case 'futsal-for-kids':{const Q=qs(ls),cats=g.map(x=>catEs(x.title.replace(' (futsal)','')));
   return {crumb:'Futsal',blurb:`${n} lecciones para la cancha de futsal`,title:'Futsal para niños: lecciones y pruebas gratis',
   description:`${n} lecciones gratis de futsal para niños: funciones en la cancha, el pívot, paredes, saques de banda, de esquina y defensa, cada una con prueba.`,
   h1:'Lecciones de futsal para niños',
   lead:`${DEFINITION_ES} Tiene ${n} lecciones de futsal con ${Q} preguntas de prueba, agrupadas aquí en ${andEs(cats.map(c=>c.toLowerCase()))}.`,
   groups:cats.map(c=>({title:`${c} (futsal)`})),
   faq:one({q:'¿Cuántas lecciones de futsal hay?',a:`${n} lecciones de futsal con ${Q} preguntas de prueba: ${andEs(cats.map((c,i)=>`${g[i].lessons.length} de ${c.toLowerCase()}`))}.`},
    {q:'¿Cuáles son las funciones en la cancha de futsal?',a:conceptEs('learnf_roles31')},
    {q:'¿Qué es un saque de banda con el pie en futsal?',a:`La reanudación del futsal desde la línea de banda. ${conceptEs('set_f_throwin')}`}),video};}
  case '7v7-9v9-11v11':{const a=count('7v7'),b=count('9v9'),c=count('11v11');
   return {crumb:'7v7, 9v9 y 11v11',blurb:`${a}, ${b} y ${c} lecciones por tamaño de equipo`,title:'Lecciones de fútbol 7v7, 9v9 y 11v11 para niños',
   description:`Lecciones de fútbol para niños según el tamaño del equipo: ${a} de 7v7, ${b} de 9v9 y ${c} de 11v11, cada una con su prueba. Gratis y sin anuncios.`,
   h1:'Lecciones de 7v7, 9v9 y 11v11',
   lead:`${DEFINITION_ES} Los niños aprenden el juego con el tamaño de equipo con el que juegan: ${a} lecciones de 7v7, ${b} de 9v9 y ${c} de 11v11, ordenadas abajo en los capítulos de cada ruta de aprendizaje.`,
   groups:g.map(x=>{const m=/^(\S+): (.*)$/.exec(x.title);if(!m)throw new Error(`hub group "${x.title}"`);
    const ch=m[2]==='more lessons'?'más lecciones':CHAPTER_ES[m[2]];if(!ch)throw new Error(`Spanish chapter "${m[2]}" missing`);return {title:`${m[1]}: ${ch}`};}),
   faq:one({q:'¿Con qué formato debe empezar mi hijo?',a:'La ruta de 7v7 va primero porque es la más sencilla.'},
    {q:'¿Qué enseña primero el 7v7?',a:conceptEs('learn7_roles')},{q:'¿Qué enseña la primera lección de 11v11?',a:conceptEs('learn11_shape')}),video};}
 }
 throw new Error(`Spanish hub "${h.slug}" is missing (lib/i18n/es/hubs.ts)`);
}
export type EsHub=Omit<Hub,'groups'|'faq'>&Omit<HubEs,'groups'|'faq'>&{enPath:string;groups:{title:string;line?:string;lessons:EsLesson[]}[];faq:Faq[]};
const cache=new Map<string,EsHub>();
export function esHub(slug:string):EsHub|null{
 const hit=cache.get(slug);if(hit)return hit;
 const h=HUBS.find(x=>x.slug===slug);if(!h)return null;const w=words(h);
 if(w.groups.length!==h.groups.length)throw new Error(`Spanish hub ${slug}: groups not 1:1 with English`);
 const x:EsHub={...h,...w,path:toEs(h.path),enPath:h.path,faq:[...w.faq],groups:h.groups.map((g,i)=>({...w.groups[i],lessons:g.lessons.map(l=>esLesson(l.id)!)}))};
 cache.set(slug,x);return x;
}
/** English paths of the five lesson hubs, in lib/site/hubs.ts HUBS order. */
export const ES_LESSON_HUB_PATHS:readonly string[]=HUBS.map(h=>h.path);
export const ES_LESSON_HUBS=()=>HUBS.map(h=>esHub(h.slug)!);
/** A link to a Spanish lesson hub from another Spanish page (lessons, index): /es path, Spanish h1 and blurb. */
export function esHubLink(enPath:string):{path:string;name:string;blurb:string}|null{
 const h=HUBS.find(x=>x.path===enPath);if(!h)return null;const e=esHub(h.slug)!;return {path:e.path,name:e.h1,blurb:e.blurb};
}

// ---- the 7v7 vs 9v9 vs 11v11 table (lib/site/comparisons.ts TEAM_SIZES), rows 1:1 ------------------------------------------------
export const TEAM_SIZES_ES={title:'7v7, 9v9 y 11v11 comparados',head:['Tema','7v7','9v9','11v11'],rows:[
 ['Jugadores en la cancha','7, con el portero','9, con el portero','11, con el portero'],
 ['Categorías (EE. UU.)','U9 y U10','U11 y U12','U13 y mayores'],
 ['Tamaño de la cancha','55 a 65 yd de largo, 35 a 45 yd de ancho','70 a 80 yd de largo, 45 a 55 yd de ancho','100 a 130 yd de largo, 50 a 100 yd de ancho (las Reglas)'],
 ['Balón','Tamaño 4','Tamaño 4','Tamaño 5'],
 ['Duración del partido','2 tiempos de 25 minutos','2 tiempos de 30 minutos','2 x 35 minutos en 13U y 14U, hasta 2 x 45 de 17U a 19U'],
 ['Línea de salida (build-out line)','Sí','No','No'],
 ['Fuera de juego','Solo entre la línea de salida y la línea de meta','Desde la línea media, como en el juego completo','La Regla 11 completa'],
 ['Cabecear','No se cabecea a los 10 años o menos','Se permite en partidos desde los 11 años en US Youth Soccer, con límites en los entrenamientos; consulta a tu liga','Se permite'],
 ['Despeje de volea del portero','No se permite','Se permite','Se permite']] as readonly (readonly string[])[],
 note:'Normas típicas del fútbol juvenil en EE. UU. (estándares de juego reducido de U.S. Soccer y reglas de juego de US Youth Soccer); tu liga puede ser diferente.'};
if(TEAM_SIZES_ES.rows.length!==TEAM_SIZES.rows.length)throw new Error('TEAM_SIZES_ES: rows not 1:1 with English');
