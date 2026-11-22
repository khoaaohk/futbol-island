/**
 * "Game pages to Play" on /admin's Marketing and SEO tabs (Nov 22 2026): per arcade game, its page views, the Play taps on its
 * page (at most one per view), the taps on its card on the /games hub, and every launch of the game in the arcade (en:game_<id>,
 * from any door: the room, a deep link, a game page). Built on the SERVER from the range's merged counters; ids:
 * lib/analytics/gamePlayIds.ts. Exact numbers; a rate is null only when its base is 0. Pure: tests/admin-analytics-game-plays.cjs.
 */
import type {Merged} from './core';
import {GP_GAMES,GP_SINCE,gpId} from './gamePlayIds';

export type GpRow={id:string;label:string;views:number;taps:number;hubTaps:number;launches:number;
 /** taps ÷ views; null without views. */
 tapRate:number|null};
export type GamePlayReport={hasData:boolean;since:string;
 /** Sorted by page views (most first), then by label; every game is listed, also with zeros. */
 rows:GpRow[];total:GpRow};
const row=(id:string,label:string,views:number,taps:number,hubTaps:number,launches:number):GpRow=>({id,label,views,taps,hubTaps,launches,tapRate:views?taps/views:null});
export function buildGamePlays(merged:Pick<Merged,'counts'>):GamePlayReport{
 const n=(id:string)=>Math.max(0,Number(merged.counts?.[id])||0);
 const rows=GP_GAMES.map(([g,,label])=>row(g,label,n(gpId('v',g)),n(gpId('p',g)),n(gpId('h',g)),n('en:game_'+g)))
  .sort((a,b)=>b.views-a.views||(a.label<b.label?-1:1));
 const sum=(k:'views'|'taps'|'hubTaps'|'launches')=>rows.reduce((a,r)=>a+r[k],0);
 return {hasData:rows.some(r=>r.views||r.taps||r.hubTaps),since:GP_SINCE,rows,total:row('total','All games',sum('views'),sum('taps'),sum('hubTaps'),sum('launches'))};
}
