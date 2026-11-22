import type {GameId,GamePage} from '@/lib/site/games';
import kitrush from './games/kitrush.json';
import snake from './games/snake.json';
import runner from './games/runner.json';
import tennis from './games/tennis.json';
import pinball from './games/pinball.json';
import puzzle from './games/puzzle.json';
import airhockey from './games/airhockey.json';
import lineup from './games/lineup.json';
import trophydrop from './games/trophydrop.json';
import rollball from './games/rollball.json';
import ballblaster from './games/ballblaster.json';
import keepyuppy from './games/keepyuppy.json';
import popup from './games/popup.json';
import flickit from './games/flickit.json';
import footgolf from './games/footgolf.json';
/**
 * The Spanish arcade game pages (/es/games, /es/games/<slug>; Spanish round E, Nov 22 2026). One JSON file per game in
 * lib/i18n/es/games/, 1:1 with the English record in lib/site/games.ts (same keys, same array lengths; tests/es-pages.cjs).
 * The English record stays the source of truth for paths, pictures, ids and the play links; these files hold only words.
 * The games themselves (their screens and calls) are in English: the pages say so.
 */
type Pic={alt:string;caption:string};
export type GameEs={id:GameId;name:string;title:string;h1:string;description:string;lead:string;blurb:string;skill:string;
 about:string[];phone:string[];desktop:string[];rules:string[];teaches:string[];tips:string[];harder:string[];parents:string[];
 faq:{q:string;a:string}[];controls:[string,string];guides:{path:string;name:string;line:string}[];shots:Pic[];stills:Pic[];
 clip:{name:string;alt:string;caption:string}|null};
export const GAMES_ES:Readonly<Record<GameId,GameEs>>={kitrush,snake,runner,tennis,pinball,puzzle,airhockey,lineup,trophydrop,rollball,ballblaster,
 keepyuppy,popup,flickit,footgolf} as unknown as Record<GameId,GameEs>;
export const esGame=(id:GameId)=>GAMES_ES[id];
/** The part of the Spanish H1 before the game's name ("Juego de fútbol tenis"). */
export const esGameKind=(g:GameEs)=>g.h1.slice(0,g.h1.length-g.name.length-2);
export const esPlayNow='Jugar ahora: gratis, sin descargas';
export const esPlayWorks='Funciona en celular y computadora. Sin anuncios y sin registrarse. El juego está en inglés.';
export const esHowToPlay=(g:GameEs)=>`Cómo jugar: ${g.controls[0]} en el celular, o ${g.controls[1]} en la computadora.`;
/** "El fútbol se llama soccer…" line under a game page's lead (the English GAME_NAMES), with the language note. */
export const ES_GAME_NAMES='El fútbol se llama soccer en Estados Unidos y Canadá. Este juego es parte de Futbol Island, un juego gratis para aprender fútbol, para niños de 7 a 12 años. Las pantallas del juego están en inglés.';
export const ES_GAME_FOOT='Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años. El arcade es una sala de la isla; las lecciones, las pruebas y el museo enseñan el resto del juego.';
/** The /es/games hub's words. `n` is the number of listed games (lib/site/games.ts GAME_PAGES). */
export const gamesHubEs=(n:number)=>({
 crumb:'Juegos de fútbol',
 title:'Juegos de fútbol para niños gratis: arcade sin anuncios',
 h1:'Juegos de fútbol para niños gratis, en línea',
 description:`${n} juegos de fútbol gratis para niños en el celular, la tableta o una Chromebook: tiros libres, fútbol golf, malabares, pinball y puzzles. Sin anuncios.`,
 lead:`${n} juegos de arcade de Futbol Island, cada uno pensado alrededor de una idea del fútbol. Son gratis, funcionan en el navegador del celular, la tableta o la computadora, y no tienen anuncios ni cuentas. Las pantallas de los juegos están en inglés; esta página te explica cada uno en español.`,
 blurb:`${n} juegos gratis en el navegador, cada uno enseña una idea del fútbol`,
 intro:[`Estas son las ${n} máquinas del arcade de Futbol Island, un juego para aprender fútbol para niños de 7 a 12 años. Cada una toma un tipo de juego conocido (pinball, la serpiente, el hockey de aire, una carrera sin fin, un juego de disparos, un juego de ritmo con malabares, un juego de dianas, un juego de tiros libres, fútbol golf, un juego de deslizar, un juego de red, un puzzle de bloques, un juego de combinar, un puzzle de rodar y un puzzle de pases) y lo construye alrededor de algo que necesita un jugador joven, como superar una entrada o la fuerza de un pase.`,
  'Cada juego se abre desde su página y se pone más difícil cuanto más juegas; una partida dura unos minutos.'],
 pick:[['Los más fáciles de aprender','Kit Rush y Squad Snake: un dedo, sin botones.'],['Para un niño al que le encanta regatear','Breakaway Run.'],['Para alguien que piensa','Pass Puzzles, sin reloj en los primeros niveles, y Line Up!, sin reloj nunca.'],['Para unos minutos tranquilos','Trophy Drop: desliza, suelta y mira cómo se combinan.'],['Para velocidad y acción','Ball Blaster.'],['Para alguien que planea','Roll It In: tú eres el balón.'],
  ['Para dos botones','Futbol Pinball.'],['Para un dedo contra la computadora','Air Futbol, la mesa de hockey de aire.'],['Para quien quiere un reto','Futbol Tennis, con más movimientos que aprender.'],['Para un niño al que le encanta la música','Keepy-Uppy Beat.'],['Para ojos rápidos','Pop-Up Shot.']] as [string,string][],
 faq:[{q:'¿Estos juegos de fútbol son gratis de verdad?',a:`Sí. No hay nada que comprar, ni anuncios, ni cuentas. Los ${n} juegos son gratis siempre; las monedas de la isla se ganan jugando y nunca se venden.`},
  {q:'¿Los niños pueden jugar en la escuela?',a:'Sí: funcionan en el navegador de una Chromebook, una tableta o un celular, si el filtro de la escuela permite futbolisland.app.'},
  {q:'¿Para qué edades son los juegos?',a:'Para niños de 7 a 12 años. Kit Rush, Squad Snake, Futbol Pinball y Trophy Drop son los más fáciles; Futbol Tennis, Ball Blaster y los últimos Pass Puzzles son para niños más grandes.'},
  {q:'¿Los juegos enseñan fútbol de verdad?',a:'Cada uno se basa en una idea del juego real: reconocer a tu equipo, las posiciones y las formaciones, superar una entrada, el primer toque, los rebotes, las líneas de pase, mantener una línea, los toques cortos, la fuerza de un pase, elegir dónde tirar, los malabares al ritmo, levantar la vista antes de tirar, curvar un tiro libre y la fuerza de un toque.'},
  {q:'¿Los juegos están en español?',a:'No: las pantallas de los juegos están en inglés, con pocas palabras y muchos íconos, así que se pueden jugar sin leer mucho. Cada página de esta sección explica en español cómo jugar, las reglas y lo que enseña el juego.'},
  {q:'¿Necesito una cuenta o una app?',a:'No. No se descarga nada y no hay registro. El progreso se guarda en el dispositivo.'}],
 safe:[['Gratis, nada que comprar','Sin anuncios emergentes ni de rastreo. Las monedas de la isla se ganan jugando y aprendiendo, nunca con dinero real.'],
  ['Sin cuenta ni chat','Tampoco hay registro. La tabla de récords solo acepta unas pocas letras al estilo arcade.'],
  ['Nada que instalar','Los juegos funcionan en el navegador de celulares, tabletas, Chromebooks y computadoras.'],
  ['Partidas cortas','Una partida dura unos minutos y termina sola.']] as [string,string][],
});
/** A game page's guide link in Spanish: the Spanish page when there is one, else the English page marked (en inglés). */
export const esGuideLink=(l:{path:string;name:string;line:string},hasEs:(p:string)=>boolean,toEs:(p:string)=>string)=>
 hasEs(l.path)?{path:toEs(l.path),name:l.name,line:l.line}:{path:l.path,name:`${l.name} (en inglés)`,line:l.line};
export type {GamePage};
