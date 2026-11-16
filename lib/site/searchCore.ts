/**
 * The /learn search's client half (seo-extras, Nov 15 2026): types, group labels and the matcher, with NO imports, so the
 * browser bundle never pulls in the registries. The index itself is built by lib/site/searchIndex.ts at build time.
 */
export type SearchType='Rule'|'Term'|'Position'|'Formation'|'Drill'|'Plan'|'Lesson'|'Guide';
export const SEARCH_TYPES:readonly SearchType[]=['Rule','Term','Position','Formation','Drill','Plan','Lesson','Guide'];
export const SEARCH_LABEL:Record<SearchType,string>={Rule:'Rules',Term:'Soccer terms',Position:'Positions',Formation:'Formations',Drill:'Drills',Plan:'Practice plans',Lesson:'Lessons',Guide:'Guides and hubs'};
export type SearchEntry={t:SearchType;n:string;p:string;s:string;k?:string};
export const SEARCH_INDEX_PATH='/learn/search-index.json';
export const SEARCH_PATH='/learn';
/** Lower-case, no accents, letters/digits only: the same on both sides of the match. */
export const fold=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
/** Rank entries for a query: every word must appear; name hits beat keyword hits beat snippet hits; a name prefix wins most. */
export function searchEntries(index:readonly SearchEntry[],query:string,limitPerType=6):{type:SearchType;items:SearchEntry[];total:number}[]{
 const words=fold(query).split(' ').filter(Boolean);if(!words.length)return [];
 const scored:{e:SearchEntry;score:number}[]=[];
 for(const e of index){
  const n=' '+fold(e.n),k=' '+fold(e.k??''),s=' '+fold(e.s);let score=0,ok=true;
  for(const w of words){const W=' '+w;
   const sc=n.includes(W)?6:n.includes(w)?4:k.includes(W)?3:s.includes(W)?2:k.includes(w)||s.includes(w)?1:0;
   if(!sc){ok=false;break;}score+=sc;}
  if(!ok)continue;
  if(n.trim().startsWith(words.join(' ')))score+=5;if(n.trim()===words.join(' '))score+=10;
  scored.push({e,score});
 }
 scored.sort((a,b)=>b.score-a.score||a.e.n.length-b.e.n.length);
 return SEARCH_TYPES.map(type=>{const all=scored.filter(x=>x.e.t===type);return {type,items:all.slice(0,limitPerType).map(x=>x.e),total:all.length};}).filter(g=>g.total>0)
  .sort((a,b)=>(scored.findIndex(x=>x.e.t===a.type))-(scored.findIndex(x=>x.e.t===b.type)));
}
