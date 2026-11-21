import type {Rail,RailItem} from './railNav';
import {hubRail,pageRail,sec} from './railNavMore';
import {VIDEO_GROUPS,VIDEOS_PATH} from './videos';
import {toEs} from '@/lib/i18n/esPaths';
import {TOOLS_PATH} from './tools/registry';
import {PRINTABLES_HUB_PATH} from './tools/printables';

/**
 * Rails for the collections and coach tools (layout batch 3, Nov 20 2026; owner: "it should list what's on that page to smooth
 * scroll down"; "there should be a back btn at the side nav to go back to the previous screen. on mobile the back btn is locked on
 * the left and everything scrolls under it"). Every rail here is Back + Overview (#top) + THAT page's own sections as in-page
 * anchors, in page order, never a list of sibling pages:
 *  - a hub (videos, coach tools, museum, story books, age groups, fishbook, player cards) goes Back to the Library and lists the
 *    groups or shelves shown on it;
 *  - a detail page goes Back to its hub and lists its own H2 sections.
 * Pass current="#top" to RailNav. Every target id is on the page and lands under the header (components/site/railTarget.module.css).
 */
export type Sec=readonly [id:string,name:string];
const items=(s:readonly Sec[]):RailItem[]=>s.map(([id,name])=>sec(id,name));
const hub=(label:string,s:readonly Sec[],es=false):Rail=>hubRail(label,[{items:items(s)}],es);
const page=(label:string,back:RailItem,s:readonly Sec[],es=false):Rail=>pageRail(label,back,items(s),es);

/* videos: /videos lists its three groups; a watch page its own sections */
export const videosHubRail=():Rail=>hub('Videos on this page',VIDEO_GROUPS.map(g=>[`g-${g.id}`,g.title] as const));
export const videoRail=(title:string,about:string):Rail=>page(`${title}: on this page`,{href:VIDEOS_PATH,name:'All videos'},
 [['about',about],['go','Where to go next'],['more','More videos']]);

/* coach tools (EN and ES): the hub lists its groups; a tool page goes Back to all coach tools (a field sheet to the field diagrams)
   and lists its sections. The interactive builders and planners sit inside reading pages, so they get the rail too; the Coach app
   (/coach) and Scan Trainer itself (/scan) are full-screen apps without one. */
const L=(es:boolean,en:string,sp:string)=>es?sp:en;
const at=(es:boolean,path:string)=>es?toEs(path):path;
const toolsBack=(es:boolean):RailItem=>({href:at(es,TOOLS_PATH),name:L(es,'All coach tools','Todas las herramientas')});
const qa=(es:boolean):Sec=>['faq',L(es,'Questions','Preguntas')],more=(es:boolean,name?:string):Sec=>['keep-reading',name??L(es,'Keep reading','Sigue leyendo')];
const onPage=(es:boolean)=>L(es,'On this page','En esta página');
export const toolsHubRail=(es=false):Rail=>hub(L(es,'Coach tools on this page','Herramientas en esta página'),[['lineups',L(es,'Lineup builders','Alineaciones')],
 ['playing-time',L(es,'Playing time','Minutos de juego')],['practice',L(es,'Practice and match day','Entrenamiento y partido')],['printables',L(es,'Printables','Para imprimir')],
 qa(es),['guides',L(es,'Guides','Guías')]],es);
export const lineupRail=(format:boolean,es=false):Rail=>page(onPage(es),toolsBack(es),[['how',L(es,'How to build it','Cómo armarla')],['about',L(es,'About lineups','Sobre las alineaciones')],
 format?['roles',L(es,'Who plays where','Quién juega dónde')]:['shapes',L(es,'Every formation','Todas las formaciones')],qa(es),more(es,L(es,'More tools','Más herramientas'))],es);
export const plannerRail=(format:boolean,es=false):Rail=>page(onPage(es),toolsBack(es),[['plan',L(es,'Your plan','Tu plan')],['about',L(es,'Why plan','Por qué planear')],
 ['why',L(es,'Equal playing time','Minutos iguales')],['lengths',L(es,'Game lengths','Duración de los partidos')],['method',L(es,'How the plan is made','Cómo se hace el plan')],
 ...(es?[]:format?[['game-day','Game day'] as const]:[['example','A worked example'],['game-day','During the game'],['uk','In the UK'],['sources','Sources'],['excel','Excel or Sheets']] as const),
 qa(es),more(es,L(es,'More tools','Más herramientas'))],es);
export const printablesHubRail=(es=false):Rail=>page(onPage(es),toolsBack(es),[['fields',L(es,'Blank fields','Canchas en blanco')],['cheat-sheets',L(es,'Formation cheat sheets','Hojas de formaciones')],
 ['positions',L(es,'Positions and numbers','Posiciones y números')],['terms',L(es,'Free to print','Gratis para imprimir')],qa(es),['related',L(es,'Tools that use them','Herramientas relacionadas')]],es);
export const printableRail=(o:{versions:boolean;compare:boolean},es=false):Rail=>page(onPage(es),{href:at(es,PRINTABLES_HUB_PATH),name:L(es,'All field diagrams','Todos los diagramas')},
 [['download',L(es,'Print or download','Imprimir o descargar')],...(o.versions?[['versions',L(es,'Every version','Todas las versiones')] as const]:[]),
  ...(o.compare?[['compare',L(es,'The formations compared','Las formaciones comparadas')] as const]:[]),['use',L(es,'How coaches use it','Cómo la usan')],more(es,L(es,'Go further','Ve más allá'))],es);
export const scanFrontRail=(es=false):Rail=>page(onPage(es),toolsBack(es),[['what',L(es,'What it is','Qué es')],['how',L(es,'How to use it','Cómo se usa')],['speed',L(es,'Speed by age','Velocidad por edad')],
 ['settings',L(es,'Settings','Ajustes')],['drills',L(es,'Drills','Ejercicios')],['tips',L(es,'Tips','Consejos')],qa(es),more(es)],es);
