import JsonLd from '@/components/seo/JsonLd';
import {DataTable,EsBreadcrumbs,esCrumbs,Section} from '@/components/es/EsParts';
import {FACTS_PATH,FAMILY_CHECKED,type CheckedFamily} from '@/lib/site/checked';
import {abs,breadcrumbLd,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {longDateEs} from '@/lib/i18n/es/ui';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';

/**
 * /es/about/how-we-check-facts (Spanish round 1, Nov 15 2026): the Spanish version of app/(site)/about/how-we-check-facts/page.tsx,
 * same sections, sources and dates (lib/site/checked.ts FAMILY_CHECKED, written with longDateEs). Source names keep their own
 * language, with the Spanish name first where one is in common use. Plain text, no links out of the site (as the English page).
 */
const H1='Cómo revisamos los datos';
const DESC='Cómo Futbol Island revisa los datos de sus guías de fútbol, tarjetas de jugadores y páginas de peces: quién las escribe, sus fuentes y reglas para niños.';
export const meta={title:'Cómo revisamos los datos · Futbol Island',desc:DESC};
const PATH=toEs(FACTS_PATH);
const CRUMBS=esCrumbs({name:'Acerca de',path:toEs('/about')},{name:H1,path:PATH});
const ROWS:[string,string,CheckedFamily][]=[
 ['Reglas de fútbol','Las Reglas de Juego de la IFAB (Laws of the Game, edición actual), las Reglas de Juego de Futsal de la FIFA 2025-26 (Futsal Laws of the Game), las normas de U.S. Soccer para partidos con menos jugadores (small-sided standards) y las reglas de juego de US Youth Soccer. Cada página de regla nombra su Regla.','rules'],
 ['Términos de fútbol','Las mismas Reglas para las palabras que son reglas. Las palabras de fútbol de todos los días solo llevan su significado sencillo, sin récords ni estadísticas.','terms'],
 ['Posiciones y formaciones','Las Reglas (número de jugadores, reglas del portero), los formatos juveniles de U.S. Soccer y las lecciones de Futbol Island que enseñan cada idea.','positions'],
 ['Ejercicios y planes de entrenamiento','La guía de U.S. Soccer Grassroots “jugar, practicar, jugar” (play-practice-play) y las normas por edad. Cada ejercicio enlaza a la lección que entrena.','drills'],
 ['Tablas de balón, cancha y edades','U.S. Soccer, US Youth Soccer, IFAB y FIFA. Cada fila de cada tabla nombra su fuente.','sizes'],
 ['Tarjetas de jugadores','Cada dato de la carrera se revisa con Wikipedia y, cuando una página oficial del club o de la federación lo confirma, también con esa página. Ningún dato sin fuente.','cards'],
 ['Páginas de peces','Dónde vive cada animal en la naturaleza y su dato curioso se revisan con las fuentes que nombra la página.','fish'],
];

export default function FactsEs(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'AboutPage',name:H1,url:abs(PATH),description:DESC,inLanguage:'es',
   isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+toEs('/'),inLanguage:'es'},publisher:PUBLISHER}}/>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>{H1}</h1>
   <p className={styles.lead} data-answer="">Cada guía de fútbol, tarjeta de jugador y página de peces de Futbol Island está escrita con palabras sencillas para niños de 7 a 12 años y los adultos que los ayudan. Antes de publicar una página, revisamos sus datos con las reglas oficiales u otra fuente con nombre, y cada página muestra la fecha de su última revisión.</p>
  </header>
  <Section id="who" title="Quién escribe las páginas">
   <p>Las páginas las escribe el equipo de Futbol Island, que hace el juego en San Diego con White Sports Ventures. El mismo equipo escribe las lecciones y las pruebas rápidas del juego, así que una página y su lección usan las mismas palabras para la misma idea.</p>
   <p>Escribimos primero para los niños: oraciones cortas, una idea a la vez, y las palabras de fútbol se explican la primera vez que aparecen. En inglés, la mayoría de las páginas dicen “soccer” para los lectores de Estados Unidos y “football” una vez cerca del inicio, porque los dos nombres son el mismo juego. En español, los dos son “fútbol”.</p>
  </Section>
  <Section id="sources" title="Con qué revisamos cada página">
   <DataTable label="Fuentes por tipo de página" head={['Páginas','Revisadas con','Última revisión']} rows={ROWS.map(([k,src,f])=>[k,src,longDateEs(FAMILY_CHECKED[f])])}/>
   <p className={styles.caption}>Los nombres de las fuentes aparecen como texto, no como enlaces, para que los niños no salgan del sitio. Los adultos pueden encontrar cada fuente por su nombre.</p>
  </Section>
  <Section id="rules" title="Nuestras reglas para los datos">
   <ul>
    <li>Ningún dato sin fuente. Si no podemos confirmar algo, lo dejamos fuera.</li>
    <li>Nada que pase de moda rápido. Las tarjetas de jugadores no dicen el club actual del jugador, y las páginas no citan récords que cambian cada temporada.</li>
    <li>El fútbol juvenil varía. Cuando las ligas ponen sus propias reglas, como la duración del partido o los cambios, la página dice “tu liga puede ser diferente” y da la norma juvenil típica de Estados Unidos.</li>
    <li>Tratamos con justicia a las personas reales: las tarjetas describen cómo jugaba un jugador, no su vida privada.</li>
   </ul>
  </Section>
  <Section id="dates" title="Qué significa “Última revisión”">
   <p>La fecha al final de una página es el día en que sus datos se revisaron por última vez con las fuentes, no el día en que se actualizó el sitio web. Cuando una tarjeta o un pez tiene su propia fecha de revisión, la página muestra esa fecha. Si no, muestra la fecha en que se revisó todo el grupo de páginas.</p>
  </Section>
  <Section id="safety" title="Palabras seguras para niños">
   <ul>
    <li>Las páginas para niños nunca mandan a los niños a otros sitios web. Los enlaces que salen de Futbol Island están detrás de un control para adultos en el juego.</li>
    <li>Seguimos las reglas de cabeceo del fútbol juvenil de Estados Unidos: nada de cabecear para jugadores de 10 años o menos, y límites para practicar cabezazos a los 11 y 12 años. Nuestros ejercicios nunca les piden a los jugadores jóvenes que cabeceen el balón.</li>
    <li>Las páginas no tienen anuncios emergentes ni de rastreo y no piden datos personales.</li>
   </ul>
  </Section>
  <Section id="mistakes" title="¿Encontraste un error?">
   <p>Avísanos: lo revisaremos con la fuente y corregiremos la página. Los adultos pueden ver quién hace el juego, y cómo contactar al equipo, en la página <a href={toEs('/about')}>Acerca de Futbol Island</a>. También puedes leer nuestra <a href="/safe-football-game-for-kids">guía de seguridad para padres</a> (en inglés).</p>
  </Section>
 </>;
}
