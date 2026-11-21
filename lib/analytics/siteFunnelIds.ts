/**
 * Site pages to Play (Nov 20 2026; owner: "is building reference pages a good way to bring players?"). The Play funnel was only
 * counted for the home page (mk:view → mk:play → mk:reached → mk:played, marketingIds.ts). These ids count the same four steps
 * for every other public section of the site, and for the Coach app and Scan Trainer, on the beat's counter channel
 * (`k:{id:n}`, countIds.ts): tracker.ts → /api/visit → analytics_beats.counts → daily rollups. No new table, request, cookie or
 * database change: the id shape is the one COUNT_KEY_RE and the SQL already accept.
 *
 *   sf:v_<section>    a page of the section was shown (one per page view; a view in a tab the tracker is off in counts nothing)
 *   sf:p_<section>    a link to /play was tapped on a page of the section (once per page view)
 *   sf:r_<section>    the tab arrived at /play after such a tap, within PLAY_FRESH_MS (counted on /play by components/VisitTracker.tsx)
 *   sf:rs_<section>   the same arrival, when this tab's session began from a search engine or AI assistant (a part of sf:r_, never
 *                     added to it; a lower bound: the tracker only remembers it until the page is reloaded)
 *   sf:d_<section>    that tab then really played (the title screen's Play, or a restore, switched /play to the game), once per tab
 *
 * Privacy (a kids' game): a total per (step, section) per day and nothing else. A section is one of the fixed names below, worked
 * out in the browser from the page's path: never the page, the URL, a query, search words, an order of pages or an id of anyone.
 * On the device: three per-tab sessionStorage marks like `fi-mk-play` (they die with the tab and are never sent). Nothing is sent
 * under Do-Not-Track / GPC, to bots, in previews, in club embeds or from a staff device (the tracker is off there).
 * The home page `/` is NOT a section here: its funnel stays mk: and is not counted twice.
 * Pure, no imports of the game: countIds.ts (the allowlist), components/VisitTracker.tsx (the browser) and siteFunnelReport.ts (the admin) read it.
 */
import {PLAY_FRESH_MS} from './marketingIds';

export const SF_SINCE='2026-11-20';
/** [key, admin label]. The key is the id's last part, so letters, digits and _ only. */
export const SF_SECTIONS=[
 ['learn_rules','Learn: rules'],['learn_terms','Learn: terms'],['learn_drills','Learn: drills and practice plans'],['learn_lessons','Learn: lessons'],
 ['learn_positions','Learn: positions'],['learn_formations','Learn: formations'],['learn_other','Learn: other pages'],
 ['tools','Coach tools'],['games','Games'],['videos','Videos'],['cards','Cards'],['fish','Fish guide'],['exhibits','Exhibits'],['books','Books'],
 ['library','Library'],['about','About'],['safety','Parents’ guide (safety)'],['coach_app','Coach app'],['scan_app','Scan Trainer'],
] as const;
export type SfSection=typeof SF_SECTIONS[number][0];
/** /learn/<slug>[/…] → its group; any other /learn page (the hub included) is learn_other. */
const LEARN:Record<string,SfSection>={'football-rules-for-kids':'learn_rules','soccer-rules':'learn_rules','soccer-terms':'learn_terms',
 'soccer-drills':'learn_drills','soccer-practice-plans':'learn_drills',lessons:'learn_lessons','soccer-positions':'learn_positions',
 'soccer-formations':'learn_formations','7v7-soccer-formations':'learn_formations','9v9-soccer-formations':'learn_formations','11v11-soccer-formations':'learn_formations'};
const TOP:Record<string,SfSection>={tools:'tools',games:'games',videos:'videos',cards:'cards',fish:'fish',exhibits:'exhibits',books:'books',library:'library',
 about:'about','safe-football-game-for-kids':'safety',coach:'coach_app',scan:'scan_app'};
const own=(o:object,k:string)=>Object.prototype.hasOwnProperty.call(o,k);
/** The section a path belongs to, or null (the home page, /play, the game's rooms, /privacy, /marketing, /admin, anything unknown).
 *  Spanish pages (/es/…) count with their English section. Only the first two path parts are read; a query or hash is dropped. */
export function siteSectionOf(pathname:unknown):SfSection|null{
 if(typeof pathname!=='string'||!pathname.startsWith('/'))return null;
 const seg=pathname.split(/[?#]/)[0].toLowerCase().split('/').filter(Boolean);
 if(seg[0]==='es')seg.shift();
 const top=seg[0]||'';
 if(top==='learn')return seg[1]&&own(LEARN,seg[1])?LEARN[seg[1]]:'learn_other';
 return own(TOP,top)?TOP[top]:null;
}
/** v view · p Play tap · r reached /play · rs reached, session began from search · d really played ("did play"). */
export const SF_STAGES=['v','p','r','rs','d'] as const;
export type SfStage=typeof SF_STAGES[number];
export const sfId=(stage:SfStage,section:SfSection)=>`sf:${stage}_${section}`;
export const SITE_FUNNEL_COUNT_IDS:readonly string[]=SF_STAGES.flatMap(st=>SF_SECTIONS.map(([s])=>sfId(st,s)));
const KEYS=new Set<string>(SF_SECTIONS.map(s=>s[0]));
export const isSfSection=(s:unknown):s is SfSection=>typeof s==='string'&&KEYS.has(s);

/** True when a link's href leads to the game's page (/play, with or without a query), on this site. Never kept or sent. */
export function isPlayHref(href:string|null|undefined,origin:string):boolean{
 if(!href)return false;
 try{const u=new URL(href,origin);return u.origin===origin&&u.pathname.replace(/\/+$/,'')==='/play';}catch{return false;}
}

/** sessionStorage mark set by a Play tap on a section's page: `<section>.<ms>` plus `.s` when the session began from search
 *  (per tab, never sent). */
export const SF_PLAY_KEY='fi-sf-play';
/** Set on /play when sf:r_ was counted: `<section>.<arrival ms>` (per tab, never sent). sf:d_ reads it. */
export const SF_REACHED_KEY='fi-sf-reached';
/** This tab's sf:d_ was counted (once per tab). */
export const SF_PLAYED_KEY='fi-sf-played';
export const playMark=(section:SfSection,nowMs:number,fromSearch:boolean)=>`${section}.${Math.round(nowMs)}${fromSearch?'.s':''}`;
function readMark(raw:string|null|undefined):{section:SfSection;at:number;search:boolean}|null{
 if(typeof raw!=='string'||raw.length>60)return null;
 const [section,at,flag]=raw.split('.');
 return isSfSection(section)&&/^[0-9]{1,16}$/.test(at||'')?{section,at:Number(at),search:flag==='s'}:null;
}
type Session=Pick<Storage,'getItem'|'removeItem'>&{setItem?:Storage['setItem']};
const fresh=(at:number,nowMs:number)=>at>0&&nowMs-at>=0&&nowMs-at<PLAY_FRESH_MS;
/** On /play (VisitTracker, after its pageview): the tab came here from a Play tap on a section's page → sf:r_<section> (and
 *  sf:rs_<section> for a search session); the arrival is remembered for sf:d_. The mark is used up either way. */
export function countSitePlayArrival(session:Session|null,nowMs:number,count:(id:string)=>void){
 try{const raw=session?.getItem(SF_PLAY_KEY);if(!raw)return;session!.removeItem(SF_PLAY_KEY);
  const m=readMark(raw);if(!m||!fresh(m.at,nowMs))return;
  count(sfId('r',m.section));if(m.search)count(sfId('rs',m.section));
  try{session!.setItem?.(SF_REACHED_KEY,playMark(m.section,nowMs,false));}catch{}}catch{}
}
/** On /play once the view is the game (VisitTracker): this tab reached /play from a section's Play tap within PLAY_FRESH_MS
 *  and has not counted yet → sf:d_<section>, once per tab (the same rule as mk:played). */
export function countSitePlayStart(session:Session|null,nowMs:number,count:(id:string)=>void){
 try{const raw=session?.getItem(SF_REACHED_KEY);if(!raw)return;session!.removeItem(SF_REACHED_KEY);
  const m=readMark(raw);if(!m||session!.getItem(SF_PLAYED_KEY))return;
  if(fresh(m.at,nowMs)){count(sfId('d',m.section));try{session!.setItem?.(SF_PLAYED_KEY,'1');}catch{}}}catch{}
}

type Target={closest?:(sel:string)=>{getAttribute(name:string):string|null}|null}|null;
export type SiteViewEnv={
 /** The page's click source (the document): one passive capture listener per page view. */
 document:{addEventListener(type:'click',fn:(e:{target:unknown})=>void,opts?:AddEventListenerOptions|boolean):void;removeEventListener(type:'click',fn:(e:{target:unknown})=>void,opts?:EventListenerOptions|boolean):void};
 origin:string;session:Pick<Storage,'setItem'>|null;now:()=>number;count:(id:string)=>void;
 /** This tab's session began from a search engine or AI assistant (tracker.ts sessionFromSearch). */
 fromSearch:()=>boolean;
};
/**
 * One page view (VisitTracker's pathname effect, tracker running): counts sf:v_<section> and listens for a tap on any link to
 * /play: sf:p_<section> once per view, and the per-tab mark the /play side reads. Returns the cleanup (the next page view, or
 * unmount); null for a page outside every section, which costs nothing. Every call counts its view: under React strict mode (dev)
 * the effect runs twice, but VisitTracker's tracker restart between the two runs drops the first run's queued counts, so one
 * view still sends exactly one sf:v_ (no time-based guard, which would drop it).
 */
export function watchSiteView(pathname:string,env:SiteViewEnv):(()=>void)|null{
 const section=siteSectionOf(pathname);
 if(!section)return null;
 env.count(sfId('v',section));
 let tapped=false;
 const onClick=(e:{target:unknown})=>{
  let href:string|null=null;
  try{href=(e.target as Target)?.closest?.('a[href]')?.getAttribute('href')??null;}catch{}
  if(!isPlayHref(href,env.origin))return;
  if(!tapped){tapped=true;env.count(sfId('p',section));}
  let s=false;try{s=env.fromSearch();}catch{}
  try{env.session?.setItem(SF_PLAY_KEY,playMark(section,env.now(),s));}catch{}
 };
 env.document.addEventListener('click',onClick,{capture:true,passive:true});
 return()=>env.document.removeEventListener('click',onClick,{capture:true});
}
