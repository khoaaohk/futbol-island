import type {Faq} from './types';
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
