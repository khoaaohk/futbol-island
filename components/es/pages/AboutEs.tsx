import JsonLd from '@/components/seo/JsonLd';
import {PRIVACY_CONTACT} from '@/components/privacy/PrivacyPolicy';
import {NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LESSONS} from '@/lib/site/lessons';
import {SITE_FISH} from '@/lib/site/fish';
import {SITE_CARDS} from '@/lib/site/cards';
import {SITE_EXHIBITS} from '@/lib/site/exhibits';
import {publicWorldEnabled} from '@/lib/multiplayer/publicFlag';
import {abs,breadcrumbLd,faqLd,GAME_ID,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {EsBreadcrumbs,QA,esCrumbs} from '@/components/es/EsParts';
import {IconList,PictureTiles,SHOTS,TrustTiles} from '@/components/site/PageParts';
import {SAFE_TRUST_ES} from '@/components/site/SafeLook';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';

/**
 * /es/about (Spanish round 1, Nov 15 2026): the Spanish version of app/(site)/about/page.tsx, same sections, counts and links.
 * The grown-ups words are lib/site/aboutCopy.ts GROWN_UPS in Spanish (kept here; aboutCopy stays English). The privacy lines
 * follow the English ones, including the public-island flag, and never say more than they do. Game feature names stay as the
 * game shows them (the game is in English for now), with the Spanish meaning in brackets.
 * Visual pass b5 (Nov 17 2026): the same trust tiles, picture tiles, icon list and collapsible FAQ as the English page.
 */
const PUB=publicWorldEnabled();
const G={
 whyTitle:'Por qué creamos Futbol Island',
 why:'Muchos jugadores jóvenes aprenden mejor cuando lo ven. Pero muchas cosas básicas, como dónde pararse, cuándo pasar y cómo un equipo mantiene su forma, casi nunca se enseñan en los entrenamientos del club o de la liga recreativa, donde el tiempo se va en ejercicios y partidos. Futbol Island cierra esa brecha: cada idea se muestra en la cancha, se explica y se revisa con una prueba rápida.',
 learns:'Posiciones, forma del equipo y decisiones en 7v7, 9v9, 11v11 y futsal, con lecciones cortas y pruebas rápidas, además de la historia y la cultura del fútbol en el museo.',
 privacy:PUB
  ?'Sin anuncios emergentes ni de rastreo, sin chat de texto libre, sin datos de contacto. Un código de guardado (tres palabras y un número) en lugar de una cuenta. La función “Play with friends” (jugar con amigos) le pide a un adulto que escriba un nombre de pila, que solo ven los amigos del mismo grupo y que no se guarda. Otros niños que juegan al mismo tiempo pueden verse en la isla con un nombre que inventa el juego y con saludos y festejos ya preparados; un adulto puede apagar eso en “Settings” (ajustes). El juego sí recoge datos de uso anónimos (visitas, tiempo de juego, qué lecciones y funciones se usan), solo para hacer funcionar y mejorar el juego y para mostrar a los patrocinadores totales combinados que ayudan a que siga siendo gratis. Los patrocinadores nunca reciben nada sobre un niño en particular, y no se vende nada.'
  :'Sin anuncios emergentes ni de rastreo, sin chat de texto libre, sin datos de contacto. Un código de guardado (tres palabras y un número) en lugar de una cuenta. La función “Play with friends” (jugar con amigos) le pide a un adulto que escriba un nombre de pila, que solo ven los amigos del mismo grupo y que no se guarda. El juego sí recoge datos de uso anónimos (visitas, tiempo de juego, qué lecciones y funciones se usan), solo para hacer funcionar y mejorar el juego y para mostrar a los patrocinadores totales combinados que ayudan a que siga siendo gratis. Los patrocinadores nunca reciben nada sobre un niño en particular, y no se vende nada.',
 free:'Gratis, siempre.',
 freeWhy:'Aprender el juego no debería costar dinero. El fútbol de club ya deja fuera a demasiados niños por lo que cuesta.',
 partnerTitle:'En alianza con',
 partnerLead:'Futbol Island se hace en alianza con ',
 partnerName:'White Sports Ventures',
 partnerRest:', fundada por Jeremiah White III, exjugador de la Selección Masculina de Estados Unidos. White Sports Ventures trabaja para que el fútbol sea más claro y más justo para las familias, los clubes y los jugadores, para que el acceso nunca dependa de saber cosas que solo conocen los de adentro.',
 nonprofitsTitle:'Organizaciones locales sin fines de lucro',
 nonprofitsLead:'También trabajamos con organizaciones locales sin fines de lucro que hacen crecer el fútbol en nuestra comunidad. Cada dólar donado va directo a ellas. Nos enorgullece apoyar a ',
} as const;
/** lib/site/safety.ts SPONSOR_BOARDS_LINE in Spanish. */
const SPONSOR_BOARDS_ES='El estadio de la isla muestra carteles de patrocinadores que ayudan a que el juego siga siendo gratis. Son solo imágenes: sin enlaces, sin rastreo, y nunca les piden a los niños que compren nada. Los patrocinadores solo ven totales combinados, nunca nada sobre un niño.';

const H1='Acerca de Futbol Island';
const DESC='Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años. Explora una isla y aprende posiciones, táctica, reglas e historia del fútbol con lecciones cortas y pruebas rápidas. Sin anuncios emergentes ni de rastreo, sin chat abierto, sin cuentas.';
export const meta={
 title:'Acerca de Futbol Island: fútbol gratis para niños',
 desc:'Un juego gratis para aprender fútbol, para niños de 7 a 12 años: explora una isla y aprende posiciones, táctica, reglas e historia del fútbol.',
};
const PATH=toEs('/about');
const CRUMBS=esCrumbs({name:'Acerca de',path:PATH});
const CONTACT=PRIVACY_CONTACT?`Preguntas y solicitudes sobre privacidad: ${PRIVACY_CONTACT}.`:'En la página de privacidad aparecerá una dirección de contacto para preguntas sobre privacidad. Mientras tanto, “Delete my save” (borrar mi partida) en el juego borra una partida guardada de inmediato.';
const FAQ:{q:string;a:string}[]=[
 {q:'¿Para qué edad es Futbol Island?',a:'Para niños de unos 7 a 12 años, y para los padres, cuidadores y entrenadores que los ayudan.'},
 {q:'¿Cuánto cuesta?',a:`Nada. ${G.free} No hay anuncios emergentes ni de rastreo, y las monedas de la isla se ganan jugando, nunca se compran. Las donaciones a organizaciones locales sin fines de lucro están detrás de un control para adultos.`},
 {q:'¿En qué dispositivos funciona?',a:'Se juega en el navegador web de teléfonos, tabletas y computadoras, sin descargar nada. Está hecho primero para teléfonos.'},
 {q:'¿Es privado y seguro para los niños?',a:`${G.privacy} Los enlaces que salen del sitio están detrás de un control para adultos. La política de privacidad explica exactamente qué se guarda y por cuánto tiempo.`},
 {q:'¿Cómo me pongo en contacto con el equipo?',a:CONTACT},
];
const andList=(names:readonly string[])=>names.join(', ').replace(/, ([^,]+)$/,' y $1');

export default function AboutEs(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'AboutPage',name:H1,url:abs(PATH),description:DESC,inLanguage:'es',
   about:{'@id':GAME_ID},isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+toEs('/'),inLanguage:'es'},publisher:PUBLISHER}}/>
  <JsonLd data={faqLd(FAQ)}/>
  <header className={styles.intro}>
   <EsBreadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>{H1}</h1>
   <p className={styles.lead} data-answer="">{DESC}</p>
   <a className={styles.cta} href={PLAY_PATH} data-play-cta="">Juega gratis</a>
   <p className={styles.caption}>¿Quieres ver el recorrido primero? <a href={toEs('/')}>Mira lo que hay dentro del juego</a>: cada parte y la idea de fútbol que enseña.</p>
   <p className={styles.caption}>El juego está en inglés por ahora; estas guías están en español.</p>
  </header>
  <TrustTiles items={SAFE_TRUST_ES} label="Futbol Island de un vistazo"/>

  <section className={styles.section} aria-labelledby="who"><h2 className={styles.h2} id="who">Para quién es</h2>
   <p>Para niños a los que les encanta el fútbol (soccer en Estados Unidos) y quieren entender mejor el juego: dónde pararse, cuándo pasar, cómo un equipo mantiene su forma. También es para padres, cuidadores y entrenadores que buscan una forma tranquila de que los niños aprendan las ideas del juego entre entrenamientos.</p>
  </section>

  <section className={styles.section} aria-labelledby="why"><h2 className={styles.h2} id="why">{G.whyTitle}</h2><p>{G.why}</p></section>

  <section className={styles.section} aria-labelledby="learn"><h2 className={styles.h2} id="learn">Qué enseña</h2>
   <p>{G.learns}</p>
   <PictureTiles items={[
    {href:'/learn/lessons',title:`${LESSONS.length} lecciones cortas`,line:'Posiciones y táctica en 7v7, 9v9, 11v11 y futsal. Cada una se juega en una cancha con jugadores que se mueven, un entrenador explica cada paso y una prueba rápida revisa la idea.',shot:SHOTS.lessons,alt:'Una lección del juego: una jugada se ve en la cancha y luego una prueba pregunta por qué funciona el buen desmarque.'},
    {href:'/cards',title:`${SITE_CARDS.length} tarjetas de jugadores y entrenadores`,line:'Historia de clubes y cultura del fútbol, una tarjeta a la vez, para coleccionar en un álbum.',shot:SHOTS.cards,alt:'El álbum de tarjetas del juego: se abre una tarjeta sorpresa y una tarjeta de jugador vuela al álbum.'},
    {href:'/fish',title:`${SITE_FISH.length} animales marinos`,line:'Para atrapar, cada uno ligado a un club, un equipo o una historia real de fútbol que tiene que ver con el mar. Pescar también es una lección de portero: quédate listo, no caigas en un amago y luego reacciona rápido.',shot:SHOTS.fishing,alt:'Pesca en la playa en el juego: el sedal se tensa y sale una caballa.'},
    {href:'/exhibits',title:`${SITE_EXHIBITS.length} exhibiciones del museo`,line:'La historia de la Copa Mundial, balones y uniformes, leyendas, las primeras veces del fútbol y la ciencia del juego.',shot:SHOTS.museum,alt:'El museo de fútbol del juego: una vitrina con el saque de banda y el Balón de Oro.'},
   ]}/>
   <IconList items={[
    {icon:'law',title:'Las reglas:',text:'las Reglas de Juego de la IFAB, desde el fuera de juego y el penal hasta los saques de banda y los tiros libres, en las lecciones y en el museo.'},
    {icon:'ball',title:'La búsqueda de balones escondidos:',text:'hay balones escondidos por toda la isla, y cada balón que encuentras enseña una idea de fútbol.'},
    {icon:'star',title:'La sala de juegos:',text:'cinco juegos de fútbol, una habilidad a la vez.'},
   ]}/>
  </section>

  <section className={styles.section} aria-labelledby="how"><h2 className={styles.h2} id="how">Cómo funciona</h2>
   <IconList two items={[
    {icon:'coin',title:G.free,text:G.freeWhy},
    {icon:'phone',title:'Primero para el teléfono.',text:'Funciona en el navegador web de teléfonos, tabletas y computadoras. Sin descargas y sin registrarse.'},
    {icon:'noads',title:'Sin anuncios emergentes ni de rastreo, sin chat abierto.',text:<>No hay chat de texto libre con otros jugadores ni publicidad emergente, en video o de rastreo. {SPONSOR_BOARDS_ES}</>},
    {icon:'key',title:'Códigos de guardado, no cuentas.',text:<>{G.privacy} El código no lleva datos personales.</>},
    {icon:'shield',title:'Para adultos.',text:<>La pantalla de inicio del juego tiene una página “For grown-ups” (para adultos) y la <a href="/privacy">política de privacidad</a> completa (en inglés).</>},
   ]}/>
  </section>

  <section className={styles.section} aria-labelledby="partners"><h2 className={styles.h2} id="partners">{G.partnerTitle}</h2>
   <p>{G.partnerLead}<b>{G.partnerName}</b>{G.partnerRest}</p>
   <ul>{WSV_LINKS.map(l=><li key={l.href}><a href={l.href} rel="noopener noreferrer">{l.track==='instagram'?'@jeremiahwhiteiii en Instagram':l.label}</a></li>)}</ul>
   <h3 className={styles.h3}>{G.nonprofitsTitle}</h3>
   <p>{G.nonprofitsLead}{andList(NONPROFITS.map(n=>n.name))}, todas en San Diego.</p>
   <ul>{NONPROFITS.map(n=><li key={n.name}><a href={n.href} rel="noopener noreferrer">{n.name}</a></li>)}</ul>
  </section>

  <QA id="faq" title="Preguntas que hacen los adultos" faq={FAQ}>
   <p className={styles.caption}><a href="/privacy">Lee la política de privacidad (en inglés)</a></p>
  </QA>
 </>;
}
