import JsonLd from '@/components/seo/JsonLd';
import {CONTACT_EMAIL,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LEARN_HIGHLIGHTS} from '@/lib/site/learnFeatures';
import {publicWorldEnabled} from '@/lib/multiplayer/publicFlag';
import {faqLd,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';

/**
 * /es (Spanish round 1, Nov 15 2026): a reading-page version of the home tour app/(site)/page.tsx. No client islands and no
 * clips: the hero, one section per highlight (lib/site/learnFeatures.ts LEARN_HIGHLIGHTS, in Spanish), the Spanish guides, the
 * five top questions (LEARN_FAQ_TOP order, LEARN_FAQ answers in Spanish, the same public-island flag), the grown-up line, the
 * partner line and a closing Play. Two plain stills from public/learn (the English home's own shots). Game feature names stay
 * as the game shows them (it is in English for now), with the Spanish meaning in brackets.
 */
const PUB=publicWorldEnabled();
const URL_ES=SITE_URL+toEs('/');
export const meta={
 title:'Futbol Island: juego de fútbol gratis para niños',
 desc:'Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años, con lecciones y pruebas. Sin anuncios de rastreo, sin cuentas y sin chat abierto.',
};
/** The hidden-ball count, kept in step with the English "Explore" chip. */
const BALLS=LEARN_HIGHLIGHTS.find(h=>h.id==='explore')?.chips[0]?.match(/\d+/)?.[0];
type Hl={id:string;title:string;line:string;chips:readonly string[];img?:{src:string;width:number;height:number;alt:string}};
const HL:readonly Hl[]=[
 {id:'learn',title:'Aprende el juego',line:'Lecciones cortas y pruebas rápidas muestran ideas reales de fútbol en una cancha con jugadores que se mueven.',
  chips:['Rutas, lecciones y pruebas rápidas','Películas y libros de historias','Un museo de fútbol'],
  img:{src:'/learn/lesson_field.webp',width:780,height:1688,alt:'Una jugada en la cancha, mientras la tarjeta del entrenador te dice qué mirar.'}},
 {id:'explore',title:'Explora la isla',line:'Cada rincón esconde una idea de fútbol por descubrir.',
  chips:[BALLS?`${BALLS} balones escondidos por encontrar`:'Balones escondidos por encontrar','Cada balón, una minilección','Nada y bucea en el arrecife']},
 {id:'fuel',title:'Recarga energía como un futbolista',line:'La comida del Konbini (una tienda de conveniencia) recarga tu energía y te enseña consejos de alimentación.',
  chips:['Come para recargar tu energía','Primero, el agua','Consejos de fuentes reales']},
 {id:'together',title:'Juega con amigos',line:'Grupos privados con código. La misma isla, sin chat abierto, solo frases de fútbol ya preparadas.',
  chips:['Solo con código privado','Frases de fútbol, sin chat abierto','Uniformes y nombres propios'],
  img:{src:'/learn/mp_sidebyside.webp',width:792,height:844,alt:'Dos teléfonos, una isla: cada jugador ve a su amigo bailar y chocar las manos.'}},
 {id:'safe',title:'Seguro para niños',line:'Gratis, sin anuncios emergentes ni de rastreo, sin chat abierto y sin cuentas.',
  chips:['Gratis, sin anuncios de rastreo','Sin chat abierto','Un código de guardado, no una cuenta']},
];
/** lib/site/learnFeatures.ts LEARN_GROWNUP_LINE in Spanish. */
const GROWNUP_LINE='Los adultos tienen el control: primero hay un control para adultos, y en “Settings” (ajustes) se puede apagar.';
/** lib/site/safety.ts SPONSOR_BOARDS_LINE and SPONSOR_KIT_LINE in Spanish. */
const SPONSOR_BOARDS_ES='El estadio de la isla muestra carteles de patrocinadores que ayudan a que el juego siga siendo gratis. Son solo imágenes: sin enlaces, sin rastreo, y nunca les piden a los niños que compren nada. Los patrocinadores solo ven totales combinados, nunca nada sobre un niño.';
const SPONSOR_KIT_ES='Algunos uniformes y calcomanías opcionales de la “Kit Shop” (tienda de uniformes) llevan la marca de Drip FC, el club patrocinador del estadio. El jugador los elige, y solo se compran con monedas del juego ganadas en la isla, nunca con dinero real.';
/** LEARN_FAQ_TOP, in that order, with the LEARN_FAQ answers in Spanish. */
const FAQ:readonly {q:string;a:string}[]=[
 {q:'¿Futbol Island es gratis?',a:'Sí. Es gratis para jugar y no hay nada que comprar. Las monedas de la isla se ganan jugando y aprendiendo, nunca se compran con dinero real. Las donaciones a organizaciones locales sin fines de lucro son opcionales y están detrás de un control para adultos.'},
 {q:'¿Hay anuncios?',a:`No hay anuncios emergentes, en video ni de rastreo. ${SPONSOR_BOARDS_ES} ${SPONSOR_KIT_ES} El juego también usa su propio contador de visitas, sin cookies y sin analítica de terceros.`},
 {q:'¿Mi hijo o hija puede chatear con otras personas?',a:'No. No hay chat de texto libre ni chat de voz. Los isleños son parte del juego y hablan con temas ya preparados que el niño toca. “Play with friends” (jugar con amigos) usa solo frases de fútbol y gestos ya preparados.'},
 {q:'¿Mi hijo o hija necesita una cuenta?',a:'No. Cada jugador recibe en su lugar un código de guardado de tres palabras de fútbol y un número. El código se crea al azar y no lleva datos personales. Si lo escribes en otro dispositivo, se carga la misma isla.'},
 {q:'¿Pueden entrar desconocidos o los niños pueden mandarse mensajes?',a:PUB
  ?'Otros niños que juegan al mismo tiempo pueden aparecer en la isla, con un nombre que inventa el juego, y pueden saludar, festejar y jugar partidos. Nadie puede escribir mensajes ni hablar. Un niño puede ocultar o reportar a otro jugador, o tocar el botón de personas para jugar solo, y un adulto puede elegir “Friends only” (solo amigos) u “Off” (apagado) en “Settings” (ajustes). Los grupos siguen siendo privados y se entra solo con código: no hay listas de amigos. Un código acepta amigos nuevos durante 8 horas, y quien crea el grupo puede hacer un código nuevo o sacar a alguien en cualquier momento.'
  :'Los grupos son privados y se entra solo con código: no hay salas públicas, emparejamiento ni listas de amigos. Un código acepta amigos nuevos durante 8 horas, y quien crea el grupo puede hacer un código nuevo o sacar a alguien en cualquier momento. No hay chat de texto libre; los amigos usan frases de fútbol y gestos ya preparados.'},
];
const GUIDES:readonly [string,string,string][]=[
 [toEs('/learn/soccer-rules'),'Reglas del fútbol','Las Reglas de Juego explicadas para niños: fuera de juego, saques, faltas, penales y más.'],
 [toEs('/learn/soccer-terms'),'Términos del fútbol','Las palabras del fútbol, como pared, pase al hueco y presión, explicadas con sencillez.'],
 [toEs('/learn/soccer-positions'),'Posiciones del fútbol','Qué hace cada posición en la cancha, del portero al delantero centro.'],
 [toEs('/about'),'Acerca de Futbol Island','Quién hace el juego, qué enseña y cómo cuida a los niños.'],
 [toEs('/about/how-we-check-facts'),'Cómo revisamos los datos','Las fuentes que usamos y qué significa “Última revisión”.'],
];

export default function HomeEs(){
 return <>
  <JsonLd data={{'@context':'https://schema.org','@type':'WebSite','@id':URL_ES+'#website',name:SITE_NAME,url:URL_ES,inLanguage:'es',
   description:'Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años, que se juega en el navegador web.',publisher:PUBLISHER,
   potentialAction:{'@type':'SearchAction',target:{'@type':'EntryPoint',urlTemplate:URL_ES+'/learn?q={search_term_string}'},'query-input':'required name=search_term_string'}}}/>
  <JsonLd data={faqLd(FAQ)}/>

  <header className={styles.intro}>
   <h1 className={styles.title}>Aprende fútbol para niños, de forma divertida y segura</h1>
   <p className={styles.lead} data-answer="">Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años. Exploran una isla y aprenden posiciones, forma del equipo y las Reglas de Juego en 7v7, 9v9, 11v11 y futsal, una lección corta a la vez. Sin anuncios emergentes ni de rastreo, sin chat abierto y sin cuentas.</p>
   <p>Lecciones y pruebas rápidas sobre posiciones, táctica y reglas del fútbol. <b>Gratis</b>, sin anuncios de rastreo.</p>
   <a className={styles.cta} href={PLAY_PATH} data-play-cta="">Juega gratis</a>
   <p className={styles.caption}>El fútbol se llama soccer en Estados Unidos y Canadá. El juego está en inglés por ahora; estas guías están en español.</p>
  </header>

  {HL.map(h=><section key={h.id} className={styles.section} id={h.id} aria-labelledby={`${h.id}-h`}>
   <h2 className={styles.h2} id={`${h.id}-h`}>{h.title}</h2>
   <p>{h.line}</p>
   {h.img&&<figure className={styles.figure}><div className={styles.art}><img src={h.img.src} width={h.img.width} height={h.img.height} alt={h.img.alt} loading="lazy" decoding="async"/></div></figure>}
   <p className={styles.caption}>{h.chips.join(' · ')}</p>
   {h.id==='together'&&<p>{GROWNUP_LINE}</p>}
  </section>)}

  <section className={styles.section} aria-labelledby="guides-h"><h2 className={styles.h2} id="guides-h">Guías en español</h2>
   <p>Para leer antes o después de jugar, con un adulto o solo.</p>
   <ul className={styles.list}>{GUIDES.map(([href,name,line])=><li key={href}><a href={href}><span className={styles.itemTitle}>{name}</span><span className={styles.itemMeta}>{line}</span></a></li>)}</ul>
  </section>

  <section className={styles.section} aria-labelledby="faq-h"><h2 className={styles.h2} id="faq-h">Preguntas que hacen los adultos</h2>
   <ul className={styles.stack}>{FAQ.map(({q,a})=><li key={q} className={styles.card}><h3 className={styles.h3}>{q}</h3><p>{a}</p></li>)}</ul>
  </section>

  <section className={`${styles.section} ${styles.panel}`} aria-labelledby="about-h"><h2 className={styles.h2} id="about-h">Quiénes somos</h2>
   <p>Futbol Island se hace en alianza con <a href={WSV_LINKS[0].href} rel="noopener noreferrer"><b>White Sports Ventures</b></a>, fundada por Jeremiah White III, exjugador de la Selección Masculina de Estados Unidos. White Sports Ventures trabaja para que el fútbol sea más claro y más justo para las familias, los clubes y los jugadores, para que el acceso nunca dependa de saber cosas que solo conocen los de adentro.</p>
   <ul>
    <li><b>Correo:</b> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
    <li><b>Instagram:</b> <a href={WSV_LINKS[1].href} rel="noopener noreferrer">{WSV_LINKS[1].label.replace(' on Instagram','')}</a></li>
    <li><a href={toEs('/about')}>Más sobre Futbol Island</a></li>
   </ul>
  </section>

  <section className={styles.section} aria-labelledby="end-h"><h2 className={styles.h2} id="end-h">¿Todo listo para la isla?</h2>
   <p>Gratis, sin anuncios emergentes ni de rastreo y sin chat abierto.</p>
   <a className={styles.cta} href={PLAY_PATH} data-play-cta="">Juega gratis</a>
  </section>
 </>;
}
