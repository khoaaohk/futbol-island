/**
 * "Site pages to Play" on /admin's Marketing and SEO tabs (Nov 20 2026): for each public section of the site, and the Coach app
 * and Scan Trainer, how many page views it had, how many of those views tapped a link to /play, how many tabs then arrived at
 * /play and how many really played. Built on the SERVER from the range's merged counters (core.ts mergeRollups: totals per id);
 * ids: lib/analytics/siteFunnelIds.ts. EXACT numbers like the rest of the Marketing tab (the owner's own signed-in admin); a
 * rate is null only when its base is 0. The home page keeps its own funnel (mk:, marketingReport.ts) and is shown as a
 * comparison row that is NOT part of the total. Pure: tests/admin-analytics-site-funnel.cjs drives it directly.
 */
import type {Merged} from './core';
import {SF_SECTIONS,SF_SINCE,sfId} from './siteFunnelIds';

export type SfRow={id:string;label:string;
 /** Page views; Play taps (at most one per view); tabs that arrived at /play; of those, sessions that began from search or an AI
  *  assistant (a lower bound); tabs that really played. */
 views:number;taps:number;reached:number;reachedSearch:number|null;played:number;
 /** taps ÷ views; played per 1,000 views. Null without views. */
 tapRate:number|null;playedPer1000:number|null};
export type SiteFunnelReport={hasData:boolean;since:string;
 /** Sorted by views (most first), then by label; every section is listed, also with zeros. */
 rows:SfRow[];total:SfRow;
 /** The home page's own funnel (mk:view / mk:play / mk:reached / mk:played), for comparison only. */
 home:SfRow};

const row=(id:string,label:string,views:number,taps:number,reached:number,reachedSearch:number|null,played:number):SfRow=>
 ({id,label,views,taps,reached,reachedSearch,played,tapRate:views?taps/views:null,playedPer1000:views?played/views*1000:null});

export function buildSiteFunnel(merged:Pick<Merged,'counts'>):SiteFunnelReport{
 const n=(id:string)=>Math.max(0,Number(merged.counts?.[id])||0);
 const rows=SF_SECTIONS.map(([s,label])=>row(s,label,n(sfId('v',s)),n(sfId('p',s)),n(sfId('r',s)),n(sfId('rs',s)),n(sfId('d',s))))
  .sort((a,b)=>b.views-a.views||(a.label<b.label?-1:1));
 const sum=(k:'views'|'taps'|'reached'|'played')=>rows.reduce((a,r)=>a+r[k],0);
 const total=row('total','All sections',sum('views'),sum('taps'),sum('reached'),rows.reduce((a,r)=>a+(r.reachedSearch||0),0),sum('played'));
 const home=row('home','Home page (its own funnel)',n('mk:view'),n('mk:play'),n('mk:reached'),null,n('mk:played'));
 return {hasData:rows.some(r=>r.views||r.taps||r.reached||r.played),since:SF_SINCE,rows,total,home};
}
