import type {Rail,RailItem} from './railNav';
import {hubRail,pageRail,sec} from './railNavMore';
import {VIDEO_GROUPS,VIDEOS_PATH} from './videos';
import {toEs} from '@/lib/i18n/esPaths';
import {TOOLS_PATH} from './tools/registry';
import {PRINTABLES_HUB_PATH} from './tools/printables';
import {GALLERIES,SITE_EXHIBITS} from './exhibits';

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
export const toolsHubRail=(es=false):Rail=>hub(L(es,'Coach tools on this page','Herramientas en esta página'),[/* Nov 22 2026: two groups (owner) */
 ['training',L(es,'Training tools','Herramientas de entrenamiento')],['game-day',L(es,'Game day tools','Herramientas para el día del partido')],
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
/* the game-day and practice tools (Nov 22 2026; components/site/tools/NewToolPage.tsx): the tool, how to use it, the page's own sections, sources */
export const newToolRail=(o:{tool:string;how:string;sections:readonly Sec[]},es=false):Rail=>page(onPage(es),toolsBack(es),[['tool',o.tool],['how',o.how],...o.sections,['sources',L(es,'Sources','Fuentes')],qa(es),more(es)],es);

/* museum: /exhibits lists its 22 cases under their galleries (each case row is #ex-<id>); a case goes Back to the Museum */
export const exhibitAnchor=(id:string)=>`ex-${id}`;
export const exhibitsHubRail=():Rail=>hubRail('Museum cases on this page',GALLERIES.map(g=>({title:g.title,
 items:SITE_EXHIBITS.filter(e=>e.gallery===g.id).map(e=>sec(exhibitAnchor(e.id),e.title))})));
export const exhibitRail=(o:{story:boolean;sources:boolean}):Rail=>page('On this page',{href:'/exhibits',name:'Museum'},[['facts','The facts'],
 ...(o.story?[['story','The story'] as const]:[]),['game','Take it to your game'],...(o.sources?[['sources','Sources'] as const]:[]),
 ['more','More from the museum'],['read','Learn it on the pitch']]);

/* story books: /books lists the featured book, its shelves by region, the field guides and how the books are made; a book goes Back
   to All story books and lists its own sections */
export const regionId=(region:string)=>'r-'+region.toLowerCase().replace(/[^a-z]+/g,'-');
export const booksHubRail=(featured:boolean,regions:readonly string[]):Rail=>hub('Story books on this page',[...(featured?[['first-book','Start here'] as const]:[]),
 ...regions.map(r=>[regionId(r),r] as const),['guides','Island field guides'],['how','How the books are made']]);
export const bookRail=():Rail=>page('On this page',{href:'/books',name:'All story books'},[['read-book','Read the pop-up book'],['story','The story'],['sources','Sources'],
 ['faq','Questions'],['keep','Keep reading']]);

/* age groups and the other by-age charts (app/(site)/learn/ChartView.tsx, the Spanish ChartEsPage): Back to the Library, then the
   page's tables and sections in page order */
/* the charts' long table and section titles get short rail labels (owner, Nov 20 2026: chip labels short; the headings on the page stay) */
const CHART_SHORT:Record<string,readonly [string,string]>={chart:['The chart','La tabla'],measure:['Ball sizes','Tamaños'],pick:['Picking a ball','Elegir balón'],why:['Why smaller','Por qué más pequeño'],
 full:['Full-size field','Campo grande'],small:['Small fields','Campos pequeños'],how:['Find the age group','Buscar la categoría'],birthyear:['Birth year','Año de nacimiento'],
 formats:['Game sizes','Tamaños de juego'],fields:['Fields compared','Campos comparados']};
const short=(id:string,title:string,es:boolean)=>CHART_SHORT[id]?.[es?1:0]??title;
/** The age groups page and the two by-age charts that share its template: the age groups page is the hub (Back to the Library);
 *  the ball size and field size charts go Back to it, their real parent (the breadcrumb is Home > chart). */
export const chartRail=(o:{tables:readonly {id:string;title:string}[];fields?:string;sections:readonly {id:string;title:string}[];sub?:boolean},es=false):Rail=>{
 const list:Sec[]=[...o.tables.map(t=>[t.id,short(t.id,t.title,es)] as const),...(o.fields?[['fields',short('fields',o.fields,es)] as const]:[]),
  ...o.sections.map(x=>[x.id,short(x.id,x.title,es)] as const),qa(es),more(es)];
 return o.sub?page(L(es,'On this page','En esta página'),es?{href:'/es/learn/soccer-age-groups',name:'Categorías por edad'}:{href:'/learn/soccer-age-groups',name:'Soccer age groups'},list,es)
  :hub(L(es,'On this page','En esta página'),list,es);};

/* Fishbook and player cards: the hub lists its browse-by-group block and its own groups (fish by rarity; cards as their page groups
   them), never the 167 fish or 450 cards; a group page (/fish/sharks, /cards/strikers) goes Back to its hub and lists its groups;
   a fish or a card goes Back to its hub and lists its own sections */
const FISH_BACK:RailItem={href:'/fish',name:'Fishbook'},CARDS_BACK:RailItem={href:'/cards',name:'All player cards'};
export const fishHubRail=(groups:readonly Sec[]):Rail=>hub('Fishbook on this page',[['collections','Browse by group'],...groups]);
export const fishRail=(o:{tale:boolean;wild:boolean}):Rail=>page('On this page',FISH_BACK,[['fish-fact','Football fact'],...(o.tale?[['fish-tale','Fish tale'] as const]:[]),
 ...(o.wild?[['wild','In the wild'] as const]:[]),['fish-story','Island story'],['catch','How to catch it'],['more','More from the Fishbook']]);
export const collectionRail=(parent:'cards'|'fish',groups:readonly Sec[]):Rail=>page('On this page',parent==='fish'?FISH_BACK:CARDS_BACK,[...groups,['learn-more','Keep reading']]);
export const cardsHubRail=(roles:readonly Sec[]):Rail=>hub('Player cards on this page',[['collections','Browse by collection'],...roles,['learn-more','Keep reading']]);
export const cardRail=(o:{coach:boolean;why:boolean;career:boolean;play:boolean;learn:boolean;know:boolean}):Rail=>page('On this page',CARDS_BACK,[['facts','On the card'],
 ...(o.why?[['why','Why they matter'] as const]:[]),...(o.career?[['career',o.coach?'Coaching career':'Clubs'] as const]:[]),...(o.play?[['play','Iconic play'] as const]:[]),
 ...(o.learn?[['learn','Learn from them'] as const]:[]),...(o.know?[['know','Did you know?'] as const]:[]),['lesson','A lesson'],['more','More cards like this'],['read','Keep reading']]);
