import type {NewsLeague} from './newsLeagues';
export type IslandClip={id:string;title:string;publishedAt:string;source:string;views:number;durationSeconds?:number;league:NewsLeague};
export type IslandClipFeed={items:IslandClip[];unavailable:boolean;fallback?:'channel'};

/** Recheck cached metadata at response time; never serve clips older than two weeks. */
export function recentIslandClips(items:IslandClip[],now=Date.now()):IslandClip[]{
 const seen=new Set<string>();
 return items.filter(item=>{const date=Date.parse(item.publishedAt);if(!Number.isFinite(date)||date>now||date<now-14*86400000||seen.has(item.id))return false;seen.add(item.id);return true;}).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
