/**
 * Game pages to Play (Nov 22 2026; owner's SEO plan item 6, "play now"): per arcade game, how many times its search page
 * /games/<slug> was shown and how many of those views tapped its Play button, plus the taps on its card on the /games hub. With
 * the arcade's own launch count (en:game_<id>, sponsorEvents.ts) the owner reads visits → plays for each game. The section
 * funnel (sf:, siteFunnelIds.ts) only counts links to /play, so these taps (deep links /arcade?game=<id>) were not counted before.
 * Same counter channel (`k:{id:n}`, countIds.ts): tracker.ts → /api/visit → analytics_beats.counts → daily rollups; no new table,
 * request, cookie or database change (the ids have COUNT_KEY_RE's shape).
 *
 *   gp:v_<game>   the game's page was shown (one per page view)
 *   gp:p_<game>   a link that opens that game was tapped on its page (once per page view: the Play now button or the pictures)
 *   gp:h_<game>   that game's Play link was tapped on the /games hub (once per game per hub view)
 *
 * Privacy (a kids' game): a total per (step, game) per day. The game is worked out in the browser from the page's path or the
 * link's data-play attribute, both fixed values from the list below; never a URL, a query, an order of pages or an id of anyone.
 * Nothing is sent under Do-Not-Track / GPC, to bots, in previews, in club embeds or from a staff device (the tracker is off there).
 * Pure: countIds.ts (the allowlist), components/VisitTracker.tsx (the browser) and gamePlayReport.ts (the admin) read it;
 * tests/admin-analytics-game-plays.cjs checks the list matches lib/site/games.ts.
 */
export const GP_SINCE='2026-11-22';
/** [game id, page slug, admin label]: every game page (lib/site/games.ts ALL_GAME_PAGES), in the same order. */
export const GP_GAMES=[
 ['kitrush','soccer-swipe-game','Kit Rush'],['snake','soccer-snake-game','Squad Snake'],['runner','soccer-runner-game','Breakaway Run'],
 ['tennis','soccer-tennis-game','Futbol Tennis'],['pinball','soccer-pinball','Futbol Pinball'],['puzzle','soccer-passing-puzzle-game','Pass Puzzles'],
 ['airhockey','air-hockey-soccer-game','Air Futbol'],['lineup','soccer-block-puzzle-game','Line Up!'],['trophydrop','soccer-merge-game','Trophy Drop'],
 ['rollball','soccer-ball-rolling-puzzle-game','Roll It In'],['ballblaster','soccer-shooting-game','Ball Blaster'],['keepyuppy','soccer-juggling-game','Keepy-Uppy Beat'],
 ['popup','soccer-target-game','Pop-Up Shot'],['flickit','soccer-free-kick-game','Flick It'],['footgolf','soccer-golf-game','FootGolf Island'],
] as const;
export type GpGame=typeof GP_GAMES[number][0];
export const GP_STAGES=['v','p','h'] as const;
export type GpStage=typeof GP_STAGES[number];
export const gpId=(stage:GpStage,game:GpGame)=>`gp:${stage}_${game}`;
export const GAME_PLAY_COUNT_IDS:readonly string[]=GP_STAGES.flatMap(st=>GP_GAMES.map(([g])=>gpId(st,g)));
const IDS=new Set<string>(GP_GAMES.map(g=>g[0])),BY_SLUG=new Map<string,GpGame>(GP_GAMES.map(([g,s])=>[s,g]));
export const isGpGame=(x:unknown):x is GpGame=>typeof x==='string'&&IDS.has(x);
/** 'hub' for /games, the game for /games/<slug>, else null. A query or hash is dropped. */
export function gamePageOf(pathname:unknown):'hub'|GpGame|null{
 if(typeof pathname!=='string'||!pathname.startsWith('/'))return null;
 const seg=pathname.split(/[?#]/)[0].toLowerCase().split('/').filter(Boolean);
 if(seg[0]!=='games'||seg.length>2)return null;
 return seg.length===1?'hub':BY_SLUG.get(seg[1])??null;
}
/** The game a link opens: /arcade?game=<id> on this site, else null. Never kept or sent. */
export function arcadeGameOf(href:string|null|undefined,origin:string):GpGame|null{
 if(!href)return null;
 try{const u=new URL(href,origin);if(u.origin!==origin||u.pathname.replace(/\/+$/,'')!=='/arcade')return null;const g=u.searchParams.get('game');return isGpGame(g)?g:null;}catch{return null;}
}
type Target={closest?:(sel:string)=>{getAttribute(name:string):string|null}|null}|null;
export type GamePlayEnv={
 document:{addEventListener(type:'click',fn:(e:{target:unknown})=>void,opts?:AddEventListenerOptions|boolean):void;removeEventListener(type:'click',fn:(e:{target:unknown})=>void,opts?:EventListenerOptions|boolean):void};
 origin:string;count:(id:string)=>void;
};
/** One page view of /games or a game page (VisitTracker's pathname effect, tracker running): counts gp:v_<game> on a game page and
 *  listens for taps on links that open a game. Returns the cleanup; null on any other page (costs nothing). */
export function watchGamePlays(pathname:string,env:GamePlayEnv):(()=>void)|null{
 const page=gamePageOf(pathname);
 if(!page)return null;
 if(page!=='hub')env.count(gpId('v',page));
 const done=new Set<string>();
 const onClick=(e:{target:unknown})=>{
  let href:string|null=null;
  try{href=(e.target as Target)?.closest?.('a[href]')?.getAttribute('href')??null;}catch{}
  const game=arcadeGameOf(href,env.origin);if(!game)return;
  const id=page==='hub'?gpId('h',game):game===page?gpId('p',page):null;
  if(!id||done.has(id))return;done.add(id);env.count(id);
 };
 env.document.addEventListener('click',onClick,{capture:true,passive:true});
 return()=>env.document.removeEventListener('click',onClick,{capture:true});
}
