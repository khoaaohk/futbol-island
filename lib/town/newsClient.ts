import type {IslandNewsFeed,IslandNewsKind} from './islandNews';
import type {NewsLeague} from './newsLeagues';
const cache=new Map<string,{feed:IslandNewsFeed;expires:number}>(),pending=new Map<string,Promise<IslandNewsFeed>>();
export function loadIslandNews(kind:IslandNewsKind,league?:NewsLeague){
 const key=kind+':'+(league??'all'),saved=cache.get(key);if(saved&&Date.now()<saved.expires)return Promise.resolve(saved.feed);
 const existing=pending.get(key);if(existing)return existing;
 const request=fetch(`/api/island-news?kind=${kind}${league?`&league=${encodeURIComponent(league)}`:''}`).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json() as Promise<IslandNewsFeed>;}).then(feed=>{cache.set(key,{feed,expires:Date.now()+(feed.unavailable?30000:300000)});return feed;}).finally(()=>pending.delete(key));pending.set(key,request);return request;
}
/** The cached feed for this key if one is still fresh, else null. Never fetches (stadium score fans' bubbles, stadiumScoreBubbles.ts). */
export function peekIslandNews(kind:IslandNewsKind,league?:NewsLeague):IslandNewsFeed|null{
 const saved=cache.get(kind+':'+(league??'all'));return saved&&Date.now()<saved.expires?saved.feed:null;
}
