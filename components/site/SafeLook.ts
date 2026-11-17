import {SHOTS,type PromiseItem,type Trust} from './PageParts';

/**
 * The parents' guide's pictures (visual pass b5, Nov 17 2026) for app/(site)/safe-football-game-for-kids, ready for the Spanish
 * page too (components/es/pages/HubsEs.tsx, owned by another batch: wire it there with safePromises(SAFE_FACTS_ES,'es')).
 * Indexed like lib/site/safety.ts SAFE_FACTS (the Spanish list keeps the same order): free, sponsor boards, open chat, accounts,
 * cookies, personal details, grown-ups, totals. ORDER pairs the short icon cards side by side on a wide screen; every fact is
 * still shown, word for word.
 */
const LOOK:readonly Omit<PromiseItem,'title'|'text'|'alt'>[]=[
 {icon:'coin'},{icon:'noads',shot:SHOTS.boards},{icon:'nochat',shot:SHOTS.emotes},{icon:'key',shot:SHOTS.saveCode},
 {icon:'shield'},{icon:'lock'},{icon:'shield',shot:SHOTS.grownUp},{icon:'bars'},
];
const ORDER=[0,4,1,2,3,5,7,6];
const ALT={
 en:{1:'The island stadium in the game: a player on the pitch, the stands behind, and sponsor boards along the touchline.',
  2:'The emote menu in the game: a child picks a preset wave, cheer or ball trick next to an island neighbour.',
  3:'The save code screen in the game: three football words and a number keep the island, with no name or email.',
  6:'The For grown-ups check in the game: a times-table question a grown-up answers before online play is switched on.'},
 es:{1:'El estadio de la isla en el juego: un jugador en la cancha, las gradas detrás y carteles de patrocinadores junto a la línea de banda.',
  2:'El menú de gestos del juego: un niño elige un saludo, un festejo o un truco con el balón, ya preparados, junto a un vecino de la isla.',
  3:'La pantalla del código de guardado del juego: tres palabras de fútbol y un número guardan la isla, sin nombre ni correo.',
  6:'El control “For grown-ups” (para adultos) del juego: una pregunta de tablas de multiplicar que un adulto responde antes de activar el juego en línea.'},
} as const;
export function safePromises(facts:readonly {title:string;text:string}[],lang:'en'|'es'):PromiseItem[]{
 const alt:Record<number,string>=ALT[lang];
 return [...ORDER.filter(i=>i<facts.length),...facts.map((_,i)=>i).filter(i=>!ORDER.includes(i))]
  .map(i=>({...LOOK[i],title:facts[i].title,text:facts[i].text,alt:alt[i]}));
}
/** lib/site/safety.ts SAFE_TRUST in Spanish. */
export const SAFE_TRUST_ES:readonly Trust[]=[
 {icon:'coin',title:'Gratis',line:'Nada que comprar con dinero real'},
 {icon:'noads',title:'Sin anuncios emergentes',line:'Ni de video ni de rastreo'},
 {icon:'nochat',title:'Sin chat abierto',line:'Solo gestos predefinidos'},
 {icon:'key',title:'Sin cuentas',line:'Un código de guardado'},
 {icon:'kid',title:'De 7 a 12 años',line:'Y los adultos que los ayudan'},
];
