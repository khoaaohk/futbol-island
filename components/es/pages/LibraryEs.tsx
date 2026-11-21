import JsonLd from '@/components/seo/JsonLd';
import LibraryPage from '@/components/site/LibraryPage';
import {LIBRARY_HERO,LIBRARY_ITEMS,LIBRARY_PATH,LIBRARY_PUBLISHED,libraryCard,libraryItemsFeaturedFirst,type LibraryGroup,type LibraryWords} from '@/lib/site/library';
import {TOOL_PAGES} from '@/lib/site/tools/registry';
import {LESSONS} from '@/lib/site/lessons';
import {DRILLS} from '@/lib/site/drills';
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
 '/tools':TOOL_PAGES.filter(t=>t.kind!=='hub'&&t.kind!=='printables'&&hasEs(t.path)).length};
const W:Omit<LibraryWords,'groups'>&{groups:Record<'game'|'train'|'more',{title:string;line:string}>}={
 title:'Biblioteca de Futbol Island: lecciones, reglas y más',
 description:'Todo lo que enseña Futbol Island en una página: lecciones de fútbol gratis, reglas, posiciones, ejercicios y planes para niños de 7 a 12 años.',
 h1:'La biblioteca de Futbol Island',crumb:'Biblioteca',
 lead:'Futbol Island enseña a niños de 7 a 12 años cómo funciona el fútbol: las reglas, las posiciones, cómo se ordena un equipo y cómo pasar, defender y marcar. Los padres y entrenadores tienen ejercicios, planes de práctica y herramientas para imprimir. Todo aquí es gratis.',
 play:'Juega gratis',heroAlt:'Futbol Island desde arriba: una plaza, una cancha pequeña con reja y jugadores caminando',insetAlt:'La pantalla Island paths del juego: un camino de lecciones con pestañas para 7v7, 9v9, 11v11 y Futsal',
 playTitle:'Juégalo en la isla',playLine:'Cada lección también se juega en una cancha del juego, con jugadores que se mueven y un quiz corto. Es gratis y funciona en el navegador. El juego está en inglés por ahora.',
 groups:{
  game:{title:'Aprende el juego',line:'Empieza aquí. Lecciones cortas y respuestas claras sobre cómo funciona el fútbol.'},
  train:{title:'Entrena',line:'Para entrenadores y padres. Listo para usar en la práctica o en casa.'},
  more:{title:'Más en la isla',line:'Estas secciones están en inglés por ahora. Tienen muchas imágenes y son fáciles de mirar.'}},
 items:{
  '/learn/lessons':{name:'Lecciones',alt:'Una lección del juego: dos equipos en una cancha con la frase del entrenador debajo',line:'Lecciones cortas de fútbol con un quiz. Para niños que quieren aprender el juego.',count:n=>`${n} lecciones`},
  '/learn/soccer-rules':{name:'Reglas',alt:'Diagrama de la regla del fuera de juego',line:'Fuera de juego, saques, faltas y más, con un diagrama. Para niños, padres y entrenadores nuevos.',count:n=>`${n} reglas`},
  '/learn/soccer-positions':{name:'Posiciones',alt:'Diagrama de las once posiciones en un 4-3-3',line:'Qué hace cada jugador y dónde se coloca. Para niños que buscan su lugar en el equipo.',count:n=>`${n} posiciones`},
  '/learn/soccer-formations':{name:'Formaciones',alt:'Diagrama de la formación 2-3-1 para 7v7',line:'Formas de equipo para 7v7, 9v9, 11v11 y futsal, cada una con un diagrama. Para entrenadores y niños curiosos.',count:n=>`${n} formaciones`},
  '/learn/soccer-terms':{name:'Términos del fútbol',alt:'Diagrama de una pared',line:'Palabras del fútbol explicadas en una o dos frases. Para quien empieza a conocer el juego.',count:n=>`${n} términos`},
  '/learn/soccer-age-groups':{name:'Categorías por edad',alt:'Tabla de las categorías de fútbol por edad',line:'Qué significan U6, U8, U10 y U12 y cómo cambia el juego con la edad. Para padres.'},
  '/learn/soccer-drills':{name:'Ejercicios',alt:'Diagrama del montaje del ejercicio Tiburones y pececitos',line:'Ejercicios divertidos con un diagrama y puntos clave. Para entrenadores y padres.',count:n=>`${n} ejercicios`},
  '/learn/soccer-practice-plans':{name:'Planes de práctica',alt:'Diagrama del montaje de un partido 3v3',line:'Prácticas completas, del calentamiento al partido final. Para entrenadores voluntarios.',count:n=>`${n} planes`},
  '/tools':{name:'Herramientas',alt:'Diagrama de una alineación de 9v9 en 3-2-3',line:'Alineaciones, minutos de juego y diagramas de cancha para imprimir. Para entrenadores.',count:n=>`${n} herramientas`},
  '/games':{name:'Juegos (en inglés)',alt:'Un partido en una cancha de neón en el arcade de Futbol Island, Gold contra Blue, visto desde arriba',line:'Juegos de arcade gratis sobre pases, formas de equipo y pensar rápido. Para niños.',count:n=>`${n} juegos`},
  '/videos':{name:'Videos (en inglés)',alt:'La plaza de Futbol Island desde arriba, con un mensaje de bienvenida en la pantalla',line:'Clips cortos de los juegos, la isla y las lecciones. Para niños y padres que quieren mirar primero.',count:n=>`${n} videos`},
  '/cards':{name:'Cartas de jugadores (en inglés)',alt:'Una imagen del clip de la colección de cartas del juego',line:'Jugadores de fútbol para coleccionar, cada uno con una posición y una jugada. Para niños.',count:n=>`${n} cartas`},
  '/fish':{name:'Libro de peces (en inglés)',alt:'Pescando desde el muelle de Futbol Island',line:'Todos los peces que puedes pescar en la isla y dónde viven. Para niños a los que les gusta explorar.',count:n=>`${n} peces`},
  '/exhibits':{name:'Museo (en inglés)',alt:'Dentro del museo de fútbol de Futbol Island',line:'Momentos de la historia del fútbol, contados de forma simple. Para niños y familias.',count:n=>`${n} piezas`},
  '/books':{name:'Cuentos (en inglés)',alt:'Un libro de cuentos desplegable abierto',line:'Libros desplegables sobre jugadores de fútbol. Para niños a los que les gusta leer.',count:n=>`${n} cuentos`}}};
export const LIBRARY_ES={title:W.title,description:W.description,h1:W.h1};
const card=(path:string)=>{const i=LIBRARY_ITEMS.find(x=>x.path===path)!,es=hasEs(path);return libraryCard(i,W.items[path],es?toEs(path):path,es?ES_COUNTS[path]:i.count);};
export function libraryGroupsEs():LibraryGroup[]{
 const more=[...libraryItemsFeaturedFirst('play'),...libraryItemsFeaturedFirst('collect')];
 return [...(['game','train'] as const).map(g=>({id:g,...W.groups[g],cards:libraryItemsFeaturedFirst(g).map(i=>card(i.path))})),{id:'more',...W.groups.more,cards:more.map(i=>card(i.path))}];
}
const PATH=toEs(LIBRARY_PATH),CRUMBS=esCrumbs({name:W.crumb,path:PATH});
export function LibraryEsPage(){
 const groups=libraryGroupsEs();
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={esLd(collectionLd({name:W.h1,path:PATH,description:W.description,published:LIBRARY_PUBLISHED,modified:SITE_UPDATED.library,items:groups.flatMap(g=>g.cards.map(c=>({name:c.name,path:c.href})))}))}/>
  <LibraryPage crumbs={<EsBreadcrumbs crumbs={CRUMBS}/>} h1={W.h1} lead={W.lead} play={W.play} playTitle={W.playTitle} playLine={W.playLine}
   hero={{...LIBRARY_HERO,mainAlt:W.heroAlt,insetAlt:W.insetAlt}} groups={groups}/>
 </>;
}
export const libraryEsRoute=(enPath:string):EsRoute|null=>enPath===LIBRARY_PATH?{meta:()=>esMeta(W.title,W.description,enPath),render:()=><LibraryEsPage/>}:null;
