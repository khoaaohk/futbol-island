import type {Faq,SafeFactEs} from './types';
import {toEs} from '../esPaths';
import {publicWorldEnabled} from '../../multiplayer/publicFlag';
/**
 * Spanish words of lib/site/safety.ts (Spanish round D, Nov 16 2026). Same facts, same [PUBLIC-WORLD] switch: …_TODAY is today's
 * wording, …_PUBLIC the wording once other players can be seen. Never "sin chat" (say "sin chat abierto"), never "cumple COPPA",
 * "certificado" or "no recopila datos" (lib/site/safety.ts BANNED_CLAIMS, in Spanish).
 */
export const DEFINITION_ES='Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años, que se juega en el navegador.';
export const SAFE_TRUST_LINE_ES='Gratis. Sin anuncios emergentes, de video ni de rastreo, sin cuentas y sin chat abierto.';
export const HUB_COMMON_FAQ_TODAY_ES:readonly Faq[]=[
 {q:'¿Futbol Island es gratis?',a:'Sí. Futbol Island se juega gratis en el navegador, en teléfonos, tabletas y computadoras, sin nada que descargar y sin nada que comprar.'},
 {q:'¿Es seguro para niños?',a:'Sí, está hecho para niños de 7 a 12 años: sin anuncios emergentes ni de rastreo, sin cuentas y sin chat abierto. Los amigos solo pueden usar gestos predefinidos.'},
];
export const HUB_COMMON_FAQ_PUBLIC_ES:readonly Faq[]=[HUB_COMMON_FAQ_TODAY_ES[0],
 {q:'¿Es seguro para niños?',a:'Sí, está hecho para niños de 7 a 12 años: sin anuncios emergentes ni de rastreo, sin cuentas y sin chat abierto. Los demás jugadores y los amigos solo pueden usar gestos predefinidos, y un adulto puede ocultar a los demás jugadores.'}];
export const HUB_COMMON_FAQ_ES:readonly Faq[]=publicWorldEnabled()?HUB_COMMON_FAQ_PUBLIC_ES:HUB_COMMON_FAQ_TODAY_ES;

// ---- the parents' guide (/es/safe-football-game-for-kids), lib/site/safety.ts SAFE_FACTS / SAFE_FAQ 1:1 ----------------------------
export const SPONSOR_BOARDS_LINE_ES='El estadio de la isla muestra carteles de patrocinadores que ayudan a que el juego siga siendo gratis. Son solo imágenes: sin enlaces, sin rastreo, y nunca les piden a los niños que compren nada. Los patrocinadores solo ven totales combinados, nunca nada sobre un niño.';
/** lib/site/safety.ts SPONSOR_TRAIN_LINE in Spanish. */
export const SPONSOR_TRAIN_LINE_ES='Los trenes de la “Island Line” llevan decoraciones de Drip FC con frases sobre ser amables en el fútbol y una pequeña etiqueta que dice “Sponsor” (patrocinador). Son solo imágenes y palabras: sin enlaces y sin nada que comprar.';
export const SPONSOR_KIT_LINE_ES='Algunos uniformes y calcomanías opcionales de la “Kit Shop” (tienda de uniformes) llevan la marca de Drip FC, el club patrocinador del estadio. El niño los elige, y solo se compran con monedas del juego ganadas en la isla, nunca con dinero real.';
export const SAFE_FACTS_TODAY_ES:readonly SafeFactEs[]=[
 {title:'Gratis, sin anuncios emergentes ni de rastreo',text:'Futbol Island se juega gratis. No tiene anuncios emergentes, de video ni de rastreo. Las monedas de la isla se ganan jugando y aprendiendo, nunca se compran con dinero real.'},
 {title:'Carteles de patrocinadores en el estadio',text:SPONSOR_BOARDS_LINE_ES},
 {title:'Sin chat abierto',text:'No hay chat de texto libre con otros jugadores ni chat de voz. Los amigos de un grupo privado solo pueden usar gestos predefinidos, y los personajes de la isla hablan con temas predefinidos que el niño toca.'},
 {title:'Sin cuentas',text:'No hay registro. El progreso se guarda con un código de guardado hecho de palabras de fútbol y un número, creado al azar, que no lleva datos personales.'},
 {title:'Sin cookies de rastreo',text:'El juego no usa cookies de rastreo ni de publicidad, ni herramientas de análisis o de publicidad de terceros. Tiene su propio contador de visitas, que no usa cookies.'},
 {title:'Ningún dato personal de los niños',text:'El juego nunca le pide a un niño su apellido, edad, correo electrónico, foto, escuela ni ubicación. La única excepción es la función opcional “Play with friends” (jugar con amigos): se escribe un nombre de pila cuando un adulto crea un grupo o se une a uno; solo lo ve ese grupo y nunca se guarda.'},
 {title:'Los adultos tienen el control',text:'“Play with friends” (jugar con amigos) solo funciona después de una verificación de adulto, y un adulto puede apagarlo en “Settings” (ajustes). Los enlaces que salen del juego y las donaciones están detrás de la misma verificación.'},
 {title:'Solo totales anónimos',text:'El juego cuenta totales de uso anónimos, sin nombres, para funcionar y mejorar. Los patrocinadores que ayudan a pagarlo solo ven totales combinados; no se vende nada y no se comparte nada sobre ningún niño.'},
];
export const SAFE_FAQ_TODAY_ES:readonly Faq[]=[
 {q:'¿Futbol Island es seguro para niños?',a:'Futbol Island está hecho para niños de 7 a 12 años: no tiene anuncios emergentes ni de rastreo, no tiene cuentas ni chat abierto, y nunca le pide a un niño datos personales como su apellido, edad, correo electrónico, foto, escuela o ubicación.'},
 {q:'¿Hay anuncios?',a:'No hay anuncios emergentes, de video ni de rastreo. '+SPONSOR_BOARDS_LINE_ES+' '+SPONSOR_KIT_LINE_ES+' '+SPONSOR_TRAIN_LINE_ES},
 {q:'¿Mi hijo puede chatear con desconocidos?',a:'No. No hay chat de texto libre ni chat de voz. Los amigos de un grupo privado, que crea un adulto y al que se entra con un código, solo pueden usar gestos predefinidos.'},
 {q:'¿Mi hijo necesita una cuenta o un correo electrónico?',a:'No. El progreso se guarda con un código de guardado al azar que no lleva datos personales. No hay registro.'},
 {q:'¿Futbol Island recopila datos?',a:'Cuenta totales de uso anónimos, sin nombres, para hacer funcionar y mejorar el juego y para mostrar totales combinados a los patrocinadores. No usa cookies de rastreo ni herramientas de análisis o de publicidad de terceros. La política de privacidad explica qué se guarda y por cuánto tiempo.'},
 {q:'¿Qué normas de privacidad sigue?',a:'La política de privacidad dice que el juego sigue los principios de la ley de privacidad infantil en internet de EE. UU. (COPPA) y del código de diseño apropiado para la edad del Reino Unido (Age Appropriate Design Code).'},
];
/** [PUBLIC-WORLD] Same entries, same order; only the changed ones differ (as lib/site/safety.ts swap()). */
const at=<T,>(list:readonly T[],i:number,next:T):readonly T[]=>list.map((x,j)=>j===i?next:x);
export const SAFE_FACTS_PUBLIC_ES:readonly SafeFactEs[]=at(at(SAFE_FACTS_TODAY_ES,2,
 {title:'Sin chat abierto',text:'No hay chat de texto libre con otros jugadores ni chat de voz. Otros niños que juegan al mismo tiempo y los amigos de un grupo privado solo pueden usar gestos predefinidos, y los personajes de la isla hablan con temas predefinidos que el niño toca.'}),6,
 {title:'Los adultos tienen el control',text:'Otros niños que juegan al mismo tiempo se pueden ver en la isla, a menos que un adulto lo cambie: en “Settings” (ajustes), detrás de una verificación de adulto, un adulto puede elegir “Other players and friends” (otros jugadores y amigos), “Friends only” (solo amigos) u “Off” (apagado). Un niño también puede tocar el botón de personas para jugar solo. “Play with friends” (jugar con amigos) solo funciona después de una verificación de adulto. Los enlaces que salen del juego y las donaciones están detrás de la misma verificación.'});
export const SAFE_FAQ_PUBLIC_ES:readonly Faq[]=at(at(SAFE_FAQ_TODAY_ES,0,
 {q:'¿Futbol Island es seguro para niños?',a:'Futbol Island está hecho para niños de 7 a 12 años: no tiene anuncios emergentes ni de rastreo, no tiene cuentas ni chat abierto, y nunca le pide a un niño datos personales como su apellido, edad, correo electrónico, foto, escuela o ubicación. Otros niños que juegan al mismo tiempo se pueden ver en la isla, con un nombre que inventa el juego y sin forma de chatear ni de enviar mensajes, y un adulto puede apagar a los demás jugadores en “Settings” (ajustes).'}),2,
 {q:'¿Mi hijo puede chatear con desconocidos?',a:'No. No hay chat de texto libre ni chat de voz. Otros niños que juegan al mismo tiempo pueden aparecer en la isla, pero solo ven un nombre que inventa el juego, un atuendo, saludos y porras predefinidos, y un punto aproximado y sin nombre en el mapa. Un niño puede ocultar o reportar a otro jugador, o tocar el botón de personas para jugar solo, y un adulto puede apagar a los demás jugadores en “Settings” (ajustes).'});
const PUB=publicWorldEnabled();
export const SAFE_FACTS_ES:readonly SafeFactEs[]=PUB?SAFE_FACTS_PUBLIC_ES:SAFE_FACTS_TODAY_ES;
export const SAFE_FAQ_ES:readonly Faq[]=PUB?SAFE_FAQ_PUBLIC_ES:SAFE_FAQ_TODAY_ES;
/** The parents' guide page words (lib/site/hubs.ts SAFE_GUIDE). */
export const SAFE_GUIDE_ES={enPath:'/safe-football-game-for-kids',crumb:'Un juego de fútbol seguro para niños',
 title:'Juego de fútbol seguro para niños: guía para padres',
 description:'Guía para padres sobre Futbol Island, un juego gratis de fútbol para niños de 7 a 12 años: sin anuncios de rastreo, sin cuentas y sin chat abierto.',
 h1:'Un juego de fútbol seguro para niños',
 lead:(lessons:number)=>`${DEFINITION_ES} Enseña posiciones, pases, táctica y las reglas del 7v7, 9v9, 11v11 y futsal en ${lessons} lecciones cortas con pruebas. Esta guía es para padres, cuidadores y entrenadores: lo que el juego hace y lo que no hace.`} as const;
/** Link target for other Spanish pages (lessons, hubs): the Spanish parents' guide. */
export const ES_SAFE_GUIDE={path:toEs(SAFE_GUIDE_ES.enPath),name:SAFE_GUIDE_ES.h1} as const;
