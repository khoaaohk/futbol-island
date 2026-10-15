import {FISH,SHORE_SPOTS,SHADOW_LABEL,fishById,spotById,type AnimalGroup,type FishSpecies} from './fishCatalog';
import {hash01} from './weather';

/**
 * B4 (docs/fishing-research.md): islanders ask for a fish ("Rosa wants a Mackerel"), A Short Hike style. Three requests a day,
 * the same on every device that day (derived from the date: no timer, no server), shown on the fishing HUD and in the Fishbook.
 * Each one ends with a short football link (coaching wording, not a fact claim).
 *
 * Rewards (docs/fishing-research.md §4 "B4 requests"): a small FISH_REQUEST_COINS through the island JOBS wallet as a metered
 * `island-job:` run, so it counts against the Training meter (never learning coins, never outside the meter), plus progress
 * toward cosmetics and lures (fishingLog.ts REQUEST_UNLOCKS), and each finished request uncovers one legend's clue (C1).
 */
export type RequestKind='species'|'spot'|'shadow'|'kinds'|'group';
export type FishRequest={id:string;kind:RequestKind;who:string;text:string;
 /** species: the fish; spot: the spot; group: the animal group; shadow: 'big'; kinds: how many. */
 target:string;count:number;
 /** The spot whose legend's clue this request uncovers when done. */
 clueSpot:string;
 /** One short football link said on completion. */
 thanks:string};
export const REQUESTS_PER_DAY=3;
/** Islanders who ask (they all live on the island already: Rosa's stand, the market street, the South Pier, the club, the jetty, the boats). */
export const REQUESTERS=['Rosa','Nico','Jules','Maya','Nell','Captain Marina','Skipper Kofi'] as const;
const THANKS=[
 'Thank you! Scouts read a match the way you read the water: look first, then choose.',
 'Brilliant patience! Strikers wait for the right moment too.',
 'A keeper who stays set saves more shots. Just like you waited for that bite!',
 'Great teamwork! Every team needs different players for different jobs.',
 'You found it! Good players look up and spot the space before the ball arrives.',
];
const GROUP_WORD:Partial<Record<AnimalGroup,string>>={crab:'a crab',shark:'a shark',ray:'a ray',eel:'an eel',shellfish:'a shellfish',seahorse:'a seahorse'};
/** Species a request may ask for: daytime shore fish that are not too rare (always findable). */
const askable=(f:FishSpecies)=>!f.when&&(f.rarity==='common'||f.rarity==='uncommon')&&f.spots.some(id=>SHORE_SPOTS.some(s=>s.id===id));
const ASK_FISH=FISH.filter(askable);
const ASK_GROUPS=(Object.keys(GROUP_WORD) as AnimalGroup[]).filter(g=>FISH.some(f=>f.group===g&&!f.when&&f.spots.some(id=>SHORE_SPOTS.some(s=>s.id===id))));
const pick=<T,>(list:readonly T[],r:number)=>list[Math.min(list.length-1,Math.floor(r*list.length))];
/** The day's three requests (deterministic from the day key). */
export function requestsForDay(day:string):FishRequest[]{
 const kinds:RequestKind[]=['species','spot','shadow','kinds','group'],out:FishRequest[]=[],usedWho=new Set<string>();
 const order=[...kinds].sort((a,b)=>hash01(day+':k:'+a)-hash01(day+':k:'+b));
 for(let i=0;i<REQUESTS_PER_DAY;i++){
  const kind=order[i],r=hash01(`${day}:${i}:${kind}`),r2=hash01(`${day}:${i}:b`);
  let who=pick(REQUESTERS,hash01(`${day}:${i}:who`));for(let k=0;usedWho.has(who)&&k<REQUESTERS.length;k++)who=REQUESTERS[(REQUESTERS.indexOf(who)+1)%REQUESTERS.length];usedWho.add(who);
  const thanks=pick(THANKS,r2),id=`${day}:${i}`;let req:FishRequest;
  if(kind==='species'){const f=pick(ASK_FISH,r);const spot=f.spots.find(s=>SHORE_SPOTS.some(x=>x.id===s))!;req={id,kind,who,text:`${who} wants a ${f.name}.`,target:f.id,count:1,clueSpot:spot,thanks};}
  else if(kind==='spot'){const s=pick(SHORE_SPOTS,r);req={id,kind,who,text:`${who} would love any catch from ${s.name}.`,target:s.id,count:1,clueSpot:s.id,thanks};}
  else if(kind==='shadow'){const s=pick(SHORE_SPOTS,r);req={id,kind,who,text:`${who} wants to see a fish with a huge or giant shadow.`,target:'big',count:1,clueSpot:s.id,thanks};}
  else if(kind==='kinds'){const s=pick(SHORE_SPOTS,r);req={id,kind,who,text:`${who} wants 3 different kinds of fish today.`,target:'kinds',count:3,clueSpot:s.id,thanks};}
  else{const g=pick(ASK_GROUPS,r);const f=FISH.find(x=>x.group===g&&!x.when&&x.spots.some(id=>SHORE_SPOTS.some(s=>s.id===id)))!;req={id,kind,who,text:`${who} is looking for ${GROUP_WORD[g]}.`,target:g,count:1,clueSpot:f.spots.find(s=>SHORE_SPOTS.some(x=>x.id===s))!,thanks};}
  out.push(req);
 }
 return out;
}
/** Does this catch count toward the request? (`kindsToday`: the kinds already caught today, for the variety request.) */
export function requestProgress(req:FishRequest,c:{id:string;spot:string},kindsToday:readonly string[]):number{
 const f=fishById(c.id);if(!f)return 0;
 switch(req.kind){
  case 'species':return c.id===req.target?1:0;
  case 'spot':return c.spot===req.target?1:0;
  case 'shadow':return f.shadow==='huge'||f.shadow==='giant'?1:0;
  case 'group':return f.group===req.target?1:0;
  case 'kinds':return Math.min(req.count,new Set([...kindsToday,c.id]).size);
 }
}
/** A hint for where to look (never odds). */
export function requestHint(req:FishRequest):string{
 if(req.kind==='species'){const f=fishById(req.target);const s=f?.spots.map(id=>spotById(id)?.name).filter(Boolean)??[];return s.length?`Try ${s.slice(0,2).join(' or ')}.`:'';}
 if(req.kind==='spot')return `Fish at ${spotById(req.target)?.name??'that spot'}.`;
 if(req.kind==='shadow')return `Watch for a ${SHADOW_LABEL.huge.toLowerCase()} or a ${SHADOW_LABEL.giant.toLowerCase()}.`;
 if(req.kind==='kinds')return 'Any 3 different kinds today, at any spot.';
 return 'Different spots have different animals: check the Fishbook.';
}
