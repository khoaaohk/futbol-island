import JsonLd from '@/components/seo/JsonLd';
import LibraryPage from '@/components/site/LibraryPage';
import {LIBRARY_HERO,LIBRARY_OG,LIBRARY_ITEMS,LIBRARY_PATH,LIBRARY_PUBLISHED,libraryCard,libraryExamples,libraryItemsFeaturedFirst,librarySection,type LibraryGroup,type LibraryLink,type LibrarySection,type LibraryWords} from '@/lib/site/library';
import {ES_FORMATIONS,ES_POSITIONS,ES_RULES,ES_TERMS} from '@/lib/i18n/es/registry';
import {ES_DRILLS,ES_PLANS} from '@/lib/i18n/es/drillsRegistry';
import {ES_LESSONS} from '@/lib/i18n/es/lessons';
import {LINEUP_PAGES_ES,PLANNER_PAGES_ES,PRINTABLES_ES} from '@/lib/i18n/es/tools';
import {TOOL_PAGES} from '@/lib/site/tools/registry';
import {LESSONS} from '@/lib/site/lessons';
import {DRILLS} from '@/lib/site/drills';
import {GAME_PAGES} from '@/lib/site/games';
import {SITE_BOOKS} from '@/lib/site/books';
import {breadcrumbLd,collectionLd} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {ES_FORMATION_SLUGS,ES_PLAN_SLUGS,ES_POSITION_SLUGS,ES_RULE_SLUGS,ES_TERM_SLUGS,hasEs,toEs} from '@/lib/i18n/esPaths';
import {esMeta} from '@/lib/i18n/es/seo';
import {EsBreadcrumbs,esCrumbs} from '@/components/es/EsParts';
import {esLd} from './GuidesEs';
import type {EsRoute} from '../routes';
/**
 * /es/library: la Biblioteca (owner, Nov 20 2026), the Spanish version of /library on the same template
 * (components/site/LibraryPage.tsx). The sections that exist in Spanish link to their /es pages, with counts of the Spanish
 * pages (lib/i18n/esPaths.ts); the game's other sections (games, videos, cards, Fishbook, museum, story books) are in English
 * for now, so they sit in one last group that says so and links to the English pages, as the Spanish footer does.
 */
const ES_COUNTS:Readonly<Record<string,number>>={'/learn/lessons':LESSONS.length,'/learn/soccer-rules':ES_RULE_SLUGS.length,'/learn/soccer-positions':ES_POSITION_SLUGS.length,
 '/learn/soccer-formations':ES_FORMATION_SLUGS.length,'/learn/soccer-terms':ES_TERM_SLUGS.length,'/learn/soccer-drills':DRILLS.length,'/learn/soccer-practice-plans':ES_PLAN_SLUGS.length,
 '/games':GAME_PAGES.length,'/books':SITE_BOOKS.length,'/tools':TOOL_PAGES.filter(t=>t.kind!=='hub'&&t.kind!=='printables'&&hasEs(t.path)).length};
const W:Omit<LibraryWords,'groups'>&{groups:Record<'game'|'train'|'more',{title:string;line:string}>}={
 /* Nov 20 2026 (new layout SEO): like the English page, the title leads with the search ("aprende fútbol para niños"). */
 title:'Aprende fútbol para niños: lecciones, reglas y ejercicios',
 description:'Aprende fútbol gratis, para niños de 7 a 12 años: lecciones con pruebas, las reglas, las posiciones, formaciones, ejercicios y planes de práctica.',
 h1:'Aprende fútbol: la biblioteca de Futbol Island',crumb:'Biblioteca',
 lead:'Futbol Island enseña a niños de 7 a 12 años cómo funciona el fútbol: las reglas, las posiciones, cómo se ordena un equipo y cómo pasar, defender y marcar. Los padres y entrenadores tienen ejercicios, planes de práctica y herramientas para imprimir. Todo aquí es gratis.',
 play:'Juega gratis',heroAlt:'Futbol Island desde arriba: una plaza, una cancha pequeña con reja y jugadores caminando',insetAlt:'La pantalla Island paths del juego: un camino de lecciones con pestañas para 7v7, 9v9, 11v11 y Futsal',
 playTitle:'Juégalo en la isla',playLine:'Cada lección también se juega en una cancha del juego, con jugadores que se mueven y un quiz corto. Es gratis y funciona en el navegador. El juego está en inglés por ahora.',
 groups:{
  game:{title:'Aprende el juego',line:'Empieza aquí. Lecciones cortas y respuestas claras sobre cómo funciona el fútbol.'},
  train:{title:'Entrena',line:'Para entrenadores y padres. Listo para usar en la práctica o en casa.'},
  more:{title:'Más en la isla',line:'Estas secciones están en inglés por ahora. Tienen muchas imágenes y son fáciles de mirar.'}},
 items:{
  '/learn/lessons':{name:'Lecciones',alt:'Una lección del juego: dos equipos en una cancha con la frase del entrenador debajo',line:'Lecciones cortas de fútbol con un quiz. Para niños que quieren aprender el juego.',count:n=>`${n} lecciones`,more:'Cada lección muestra una idea en una cancha en tres pasos y dice lo que diría el entrenador. Hay lecciones de 7v7, 9v9, 11v11 y futsal.',cta:n=>`Ver las ${n} lecciones`},
  '/learn/soccer-rules':{name:'Reglas',alt:'Cuatro reglas en la cancha: la línea del fuera de juego, un saque de banda, un penalti y una barrera de tiro libre',line:'Fuera de juego, saques, faltas y más, con un diagrama. Para niños, padres y entrenadores nuevos.',count:n=>`${n} reglas`,more:'Cada página dice también lo que mira el árbitro y las confusiones más comunes.',cta:n=>`Ver las ${n} reglas`},
  '/learn/soccer-positions':{name:'Posiciones',alt:'La lección de futsal 3-1: conoce los puestos de la cancha, de cerca: el portero en su arco, el cierre marcado con un aro detrás del balón, un ala marcada en la banda y líneas que los unen con el pívot adelante; abajo, el cierre y el pívot otra vez',line:'Qué hace cada jugador y dónde se coloca. Para niños que buscan su lugar en el equipo.',count:n=>`${n} posiciones`,more:'Cada página muestra dónde se coloca el jugador, qué hace con y sin el balón, tres hábitos para practicar y su número de camiseta.',cta:n=>`Ver las ${n} posiciones`},
  '/learn/soccer-formations':{name:'Formaciones',alt:'Dos formas de equipo de las lecciones del juego: el 2-2 de futsal, el portero con una pareja atrás y otra adelante, cada una unida por una línea discontinua, y un equipo de 7v7 con sus dos defensas marcados delante del portero',line:'Formas de equipo para 7v7, 9v9, 11v11 y futsal, cada una con un diagrama. Para entrenadores y niños curiosos.',count:n=>`${n} formaciones`,more:'Cada página muestra quién juega dónde, los puntos fuertes y débiles de la formación y cómo se mueve cuando tu equipo tiene el balón.',cta:n=>`Ver las ${n} formaciones`},
  '/learn/soccer-terms':{name:'Términos del fútbol',alt:'Cuatro jugadas en la cancha con pases y desmarques: pared, desdoble, pase al hueco y cambio de juego',line:'Palabras del fútbol explicadas en una o dos frases. Para quien empieza a conocer el juego.',count:n=>`${n} términos`,more:'Cada palabra tiene un diagrama, cómo se hace, los errores comunes y cómo funciona en 7v7, 9v9, 11v11 y futsal.',cta:n=>`Ver los ${n} términos`},
  '/learn/soccer-age-groups':{name:'Categorías por edad',alt:'Los cuatro tamaños de partido por los que pasan los niños, 4v4, 7v7, 9v9 y 11v11, dibujados a la misma escala',line:'Qué significan U6, U8, U10 y U12 y cómo cambia el juego con la edad. Para padres.',more:'Una tabla de la temporada 2026-27 muestra cada categoría por año de nacimiento, cómo encontrar la de tu hijo y qué partido juega cada una.',cta:()=>'Abrir la tabla de categorías'},
  '/learn/soccer-drills':{name:'Ejercicios',alt:'Dos cuadrados de práctica con conos, puertas y flechas: un zigzag de conducción y pases entre puertas',line:'Ejercicios divertidos con un diagrama y puntos clave. Para entrenadores y padres.',count:n=>`${n} ejercicios`,more:'Cada uno dice también cómo hacerlo y cómo hacerlo más fácil o más difícil.',cta:n=>`Abrir los ${n} ejercicios`},
  '/learn/soccer-practice-plans':{name:'Planes de práctica',alt:'Una práctica en orden: cuatro cuadrados de práctica de izquierda a derecha, cada uno con una barra tan larga como sus minutos',line:'Prácticas completas, del calentamiento al partido final. Para entrenadores voluntarios.',count:n=>`${n} planes`,more:'Cada plan es una práctica con tiempos, el material, notas para el entrenador y qué hacer si algo no funciona. Hay planes para U6, U8, U10 y U12.',cta:n=>`Abrir los ${n} planes`},
  '/tools':{name:'Herramientas',alt:'Una hoja de alineación: una alineación de 9v9 en la cancha junto a una tabla de minutos con una fila por jugador',line:'La app del entrenador gratis, alineaciones, minutos de juego, cronómetro de partido, planes de práctica y diagramas de cancha para imprimir. Para entrenadores y familias.',count:n=>`${n} herramientas`,more:'Son gratis, sin cuenta, y los nombres de tus jugadores se quedan en tu dispositivo.',cta:()=>'Abrir las herramientas'},
  '/games':{name:'Juegos',alt:'Cuatro juegos de arcade en pantallas de teléfono: Kit Rush, Ball Blaster, Futbol Pinball y Futbol Tennis',line:'Juegos de arcade gratis sobre pases, formas de equipo y pensar rápido. Para niños.',count:n=>`${n} juegos`,more:'Cada juego tiene su página con cómo jugar en un teléfono o una computadora, las reglas y la idea de fútbol que enseña.',cta:n=>`Ver los ${n} juegos`},
  '/videos':{name:'Videos (en inglés)',alt:'Imagen de un video: un partido de 7v7 en vivo en la cancha del pueblo de Futbol Island, Gold con el balón contra Blue y el portero de rosa, con un botón de reproducir',line:'Clips cortos de los juegos, la isla y las lecciones. Para niños y padres que quieren mirar primero.',count:n=>`${n} videos`,more:'Cada clip tiene su página, así puedes ver un juego o una lección antes de jugar.',cta:n=>`Ver los ${n} videos (en inglés)`},
  '/cards':{name:'Cartas de jugadores (en inglés)',alt:'Una página del álbum con nueve cartas de jugadores en el juego',line:'Jugadores de fútbol para coleccionar, cada uno con una posición y una jugada. Para niños.',count:n=>`${n} cartas`,more:'Cada carta muestra también los puntos fuertes del jugador. Hay colecciones de delanteros, porteros, leyendas del fútbol femenino, campeones del mundo y más.',cta:n=>`Ver las ${n} cartas (en inglés)`},
  '/fish':{name:'Libro de peces (en inglés)',alt:'Un pulpo legendario pescado desde el muelle de Futbol Island, con su carta del libro de peces',line:'Todos los peces que puedes pescar en la isla y dónde viven. Para niños a los que les gusta explorar.',count:n=>`${n} peces`,more:'Hay colecciones de tiburones, de cangrejos y mariscos, y de pulpos, calamares y rayas, y una página dice qué pescar en cada lugar.',cta:()=>'Abrir el libro de peces (en inglés)'},
  '/exhibits':{name:'Museo (en inglés)',alt:'Una pieza sobre su pedestal en el museo de fútbol de Futbol Island, con su cartel',line:'Momentos de la historia del fútbol, contados de forma simple. Para niños y familias.',count:n=>`${n} piezas`,more:'Las piezas están en salas como las reglas del juego, la historia del Mundial, balones y camisetas, y leyendas, cada una con el año en que pasó.',cta:n=>`Ver las ${n} piezas (en inglés)`},
  '/books':{name:'Cuentos',alt:'Un libro de cuentos desplegable abierto',line:'Libros desplegables sobre jugadores de fútbol. Para niños a los que les gusta leer.',count:n=>`${n} cuentos`,more:'Cada libro cuenta la historia de un jugador en capítulos cortos y se puede leer en la página. Sus fuentes están al final.',cta:n=>`Leer los ${n} cuentos`}}};
export const LIBRARY_ES={title:W.title,description:W.description,h1:W.h1};
const card=(path:string)=>{const i=LIBRARY_ITEMS.find(x=>x.path===path)!,es=hasEs(path);return libraryCard(i,W.items[path],es?toEs(path):path,es?ES_COUNTS[path]:i.count);};
export function libraryGroupsEs():LibraryGroup[]{
 const more=[...libraryItemsFeaturedFirst('play'),...libraryItemsFeaturedFirst('collect')];
 return [...(['game','train'] as const).map(g=>({id:g,...W.groups[g],cards:libraryItemsFeaturedFirst(g).map(i=>card(i.path))})),{id:'more',...W.groups.more,cards:more.map(i=>card(i.path))}];
}
/** Spanish names of the example pages, by English path: a Spanish section's examples link to the Spanish pages; an English-only
 * section keeps its English examples (English pages), as its button does. */
const AGE_ES:Readonly<Record<string,string>>={chart:'La tabla de categorías',how:'Encuentra la categoría de tu hijo',formats:'Qué partido juega cada categoría',faq:'Preguntas sobre las categorías'};
function esName(en:string):string|undefined{
 const [path,hash]=en.split('#');if(hash)return AGE_ES[hash];
 const slug=path.split('/').pop()!;
 const all:{path:string;name?:string;title?:string}[]=[...ES_RULES(),...ES_TERMS(),...ES_POSITIONS(),...ES_FORMATIONS(),...ES_DRILLS(),...ES_PLANS()];
 const hit=all.find(x=>x.path===path);if(hit)return hit.name??hit.title;
 const lesson=ES_LESSONS().find(x=>`/learn/lessons/${x.id}`===path);if(lesson)return lesson.title;
 return (LINEUP_PAGES_ES[slug]??PLANNER_PAGES_ES[slug]??PRINTABLES_ES[slug])?.crumb;
}
/** Spanish labels for the English-only sections' examples (the pages stay English, as the section's button says). An example not
 * listed keeps its English name; tests/es-pages.cjs fails the page if that name has English words in it. */
const EN_ONLY_ES:Readonly<Record<string,string>>={'Three soccer arcade games played on a phone':'Tres juegos de arcade en un teléfono','Walking across Futbol Island':'Un paseo por Futbol Island',
 'Pass puzzle: a pass around the defender':'Pass Puzzles: un pase que rodea al defensa','Strikers':'Delanteros','Goalkeepers':'Porteros','Women’s football legends':'Leyendas del fútbol femenino',
 'World Cup winners':'Campeones del mundo','Sharks':'Tiburones','Crabs and shellfish':'Cangrejos y mariscos','Octopuses, squid and rays':'Pulpos, calamares y rayas','Fishing spots':'Lugares de pesca',
 'The first Laws':'Las primeras reglas','The first World Cup':'El primer Mundial','Boots through time':'Las botas a lo largo del tiempo','The Ballon d’Or':'El Balón de Oro'};
const examplesEs=(path:string):LibraryLink[]=>libraryExamples(path).map(e=>{if(!hasEs(path))return {...e,name:EN_ONLY_ES[e.name]??e.name};const n=/^\/(games|books)\//.test(e.href)?e.name/* round E: a game or player name */:esName(e.href);return n&&hasEs(e.href.split('#')[0])?{href:toEs(e.href.split('#')[0])+(e.href.includes('#')?'#'+e.href.split('#')[1]:''),name:n}:null;}).filter((e):e is LibraryLink=>!!e);
export function librarySectionsEs():LibrarySection[]{
 return LIBRARY_ITEMS.map(i=>{const es=hasEs(i.path);return librarySection(i,W.items[i.path],es?toEs(i.path):i.path,es?ES_COUNTS[i.path]:i.count,examplesEs(i.path));});
}
const PATH=toEs(LIBRARY_PATH),CRUMBS=esCrumbs({name:W.crumb,path:PATH});
export function LibraryEsPage(){
 const sections=librarySectionsEs();
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={esLd(collectionLd({name:W.h1,path:PATH,description:W.description,published:LIBRARY_PUBLISHED,modified:SITE_UPDATED.library,items:sections.map(c=>({name:c.name,path:c.href}))}))}/>
  <LibraryPage crumbs={<EsBreadcrumbs crumbs={CRUMBS}/>} h1={W.h1} lead={W.lead} play={W.play} playTitle={W.playTitle} playLine={W.playLine}
   hero={{...LIBRARY_HERO,mainAlt:W.heroAlt,insetAlt:W.insetAlt}} sections={sections} menuLabel="Secciones de la biblioteca" topLabel="Resumen" coachApp="/coach?lang=es" coachLabel="Abrir la app del entrenador" kicker="Para entrenadores y familias" exLabel="algunas para empezar"/>
 </>;
}
export const libraryEsRoute=(enPath:string):EsRoute|null=>enPath===LIBRARY_PATH?{meta:()=>esMeta(W.title,W.description,enPath,{url:LIBRARY_OG.url,alt:LIBRARY_OG.altEs}),render:()=><LibraryEsPage/>}:null;
