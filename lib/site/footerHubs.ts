/**
 * The footer's links (app/(site)/layout.tsx, app/es/layout.tsx), plain data with no imports. Nov 20 2026 (owner): the Library at
 * /library (lib/site/library.ts) houses these same items as cards, so the list lives here once; a link added to the footer must get
 * its card words in library.ts (it throws at build when one is missing, and tests/library.cjs checks it).
 * Nov 20 2026 (owner: "do we need these in the footer?"; decision: keep them for search, tidy them): the links stand in four short
 * labelled columns in the Library's groups and reading order (Learn the game, Train, Play and watch, Collect and explore), so the
 * footer reads as a small map of the Library instead of two loose rows. Same links, same hrefs, same names.
 */
export type FooterGroup={id:'game'|'train'|'play'|'collect';title:string;titleEs:string;links:readonly (readonly [string,string])[]};
export const FOOTER_GROUPS:readonly FooterGroup[]=[
 {id:'game',title:'Learn the game',titleEs:'Aprende el juego',links:[['/learn/lessons','Lessons'],['/learn/soccer-rules','Rules'],['/learn/soccer-positions','Positions'],
  ['/learn/soccer-formations','Formations'],['/learn/soccer-terms','Soccer terms'],['/learn/soccer-age-groups','Age groups']]},
 {id:'train',title:'Train',titleEs:'Entrena',links:[['/learn/soccer-drills','Drills'],['/learn/soccer-practice-plans','Practice plans'],['/tools','Coach tools']]},
 {id:'play',title:'Play and watch',titleEs:'Juega y mira',links:[['/games','Games'],['/videos','Videos']]},
 {id:'collect',title:'Collect and explore',titleEs:'Colecciona y explora',links:[['/cards','Player cards'],['/fish','Fishbook'],['/exhibits','Museum'],['/books','Story books']]}];
/** Every footer link in one flat list (the Library's cards are built from it). */
export const FOOTER_HUBS:readonly (readonly [string,string])[]=FOOTER_GROUPS.flatMap(g=>g.links);
/** The Spanish footer's names (the Spanish Library's card names, components/es/pages/LibraryEs.tsx, shortened). A section with no
 *  Spanish page yet links to the English one and says so. */
export const FOOTER_ES:Readonly<Record<string,string>>={'/learn/lessons':'Lecciones','/learn/soccer-rules':'Reglas','/learn/soccer-positions':'Posiciones',
 '/learn/soccer-formations':'Formaciones','/learn/soccer-terms':'Términos del fútbol','/learn/soccer-age-groups':'Categorías por edad','/learn/soccer-drills':'Ejercicios',
 '/learn/soccer-practice-plans':'Planes de práctica','/tools':'Herramientas','/games':'Juegos','/videos':'Videos','/cards':'Cartas de jugadores','/fish':'Libro de peces',
 '/exhibits':'Museo','/books':'Cuentos'};
