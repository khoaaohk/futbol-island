import type {FishSpecies,SpotId} from './fishCatalog';
import {fishSellValue} from '../../economy';

/**
 * B3 (docs/fishing-research.md): fish that only come out at night or at sunset, read from the island's own Day / Sunset / Night
 * setting (IslandSettings.tsx → localStorage `fi2-time-of-day`, the player's choice, never the real clock, so kids who only play
 * after school still find them).
 *
 * ECONOMY (docs/fishing-research.md §4 "B3 night fish"): a time species never ADDS weight to a spot. At its time it takes the
 * place of one resting day fish of the SAME rarity at that spot (the closest price; shared fish rest before a spot's own specials,
 * so the specials are always there to hunt), with the same internal weight. Each one is priced inside its rarity band at the
 * price of the fish it usually replaces, so a spot's mean catch does not move (tests/economy.cjs §12 asserts within ±3 % of the
 * day table at every spot, and the 3.75–4.26 band where the day table is in it).
 *
 * Real football history, the same pattern as the deep-sea creatures (deepSeaFish.ts, `link:'Football culture'`): a real, sourced
 * football fact with the sea animal as the teaching hook. Which animal is paired with which story is a TEACHING CHOICE; the facts
 * never claim the animal. Checked 15 Oct 2026 against the pages in `source` / `sources` (polite fetches, one at a time).
 * ISLAND FICTION: which spots they visit.
 */
export type TimeOfDayKey='day'|'sunset'|'night';
const W='https://en.wikipedia.org/wiki/';
export const NIGHT_FISH:FishSpecies[]=[
 {id:'stargazer',name:'Stargazer',plural:'Stargazers',rarity:'common',group:'fish',when:'night',price:4,size:[18,40],color:'#7d6b55',belly:'#ebdfc4',shape:'round',shadow:'medium',
  spots:['south-pier','west-pier','north-rocks','west-cove','causeway-gate','turtle-bank','coral-garden','farm-beach','sharks-beach'],
  club:{name:'Brazil national team',country:'Brazil',link:'Football culture',
   fact:'A stargazer hides in the sand with its eyes on top, looking up at the stars. Brazil\'s shirt has five stars above the badge: one for each World Cup they have won.',
   source:W+'Brazil_national_football_team',sources:[W+'Stargazer_(fish)']}},
 {id:'bigeye',name:'Bigeye',plural:'Bigeyes',rarity:'common',group:'fish',when:'night',price:3,size:[15,30],color:'#c4473b',belly:'#f3b9a2',shape:'round',shadow:'small',
  spots:['harbour-wall','west-pier','east-pier','coral-garden','sharks-beach','causeway-channel','summit-ledge'],
  club:{name:'Goal-line technology',country:'Brazil',link:'Football culture',
   fact:'Bigeyes have huge eyes for seeing in the dark. At the 2014 World Cup, goal-line technology was used at a World Cup for the first time: cameras watched the line for the referee.',
   source:W+'Goal-line_technology',sources:[W+'Priacanthidae']}},
 {id:'flashlight-fish',name:'Flashlight Fish',plural:'Flashlight Fish',rarity:'uncommon',group:'fish',when:'night',price:5,size:[8,14],color:'#2b3047',belly:'#a6dcff',shape:'slim',shadow:'small',
  spots:['harbour-wall','east-pier','causeway-channel'],
  club:{name:'FK Bodø/Glimt',country:'Norway',link:'Club name',
   fact:'Flashlight fish flash glowing patches under their eyes. FK Bodø/Glimt come from Bodø in Norway, just north of the Arctic Circle. "Glimt" means gleam.',
   source:W+'Bod%C3%B8/Glimt',sources:[W+'Bod%C3%B8',W+'Anomalopidae']}},
 {id:'golden-trevally',name:'Golden Trevally',plural:'Golden Trevally',rarity:'uncommon',group:'fish',when:'sunset',price:6,size:[40,90],color:'#d8b13c',belly:'#f6e8a9',shape:'round',shadow:'large',
  spots:['harbour-wall','west-cove','east-pier','causeway-channel','farm-beach','summit-ledge'],
  club:{name:'Just Fontaine',country:'France',link:'Football culture',
   fact:'A golden fish for the golden hour. At the 1958 World Cup, France\'s Just Fontaine scored 13 goals, still the most anyone has scored at one World Cup.',
   source:W+'Just_Fontaine',sources:[W+'Golden_trevally']}},
];
/**
 * Deep-sea creatures that also rise to some shore spots after dark (no new research: their facts are already verified in
 * deepSeaFish.ts). Shore visitors only; the boats keep their own table day and night.
 */
export const NIGHT_VISITORS:Partial<Record<string,{when:'night'|'sunset';spots:SpotId[]}>>={
 squid:{when:'night',spots:['south-pier','harbour-wall','east-pier']},
};
/** Hint words for the Fishbook card (never odds). */
export const WHEN_LABEL:Record<'night'|'sunset',string>={night:'Comes out at night',sunset:'Comes out at sunset'};

type Swap={add:string;rest:string};
type Spec=Pick<FishSpecies,'id'|'rarity'|'price'|'spots'>&{when?:'night'|'sunset'};
/** How far (fraction) the time swaps may move a spot's mean catch price; a swap that would push it further is skipped. */
export const TIME_EV_GUARD=.02;
/**
 * The day fish that rest while the time species visit (pure; `byId` resolves a species, `dayWeights` is the spot's own table).
 * Deterministic: visitors in a fixed order; each takes one resting SHARED fish (never a spot's own special) of its rarity whose
 * price is within 1 coin (the closest first; ties: the bigger weight), and only if the spot's mean catch price stays within
 * TIME_EV_GUARD of the day table. A visitor with no such fish at the spot simply does not come there.
 */
export function timeSwaps(spotId:string,time:TimeOfDayKey,dayWeights:Record<string,number>,all:readonly Spec[],byId:(id:string)=>Spec|undefined):Swap[]{
 if(time==='day')return [];
 const visitors=all.filter(f=>f.when===time&&f.spots.includes(spotId as SpotId)).map(f=>f.id);
 for(const [id,v] of Object.entries(NIGHT_VISITORS))if(v&&v.when===time&&v.spots.includes(spotId as SpotId)&&!(id in dayWeights))visitors.push(id);
 let total=0,value=0,sell=0;for(const [id,w] of Object.entries(dayWeights)){const f=byId(id);if(f&&w>0){total+=w;value+=w*f.price;sell+=w*fishSellValue(f);}}
 const day=total?value/total:0,daySell=total?sell/total:0,used=new Set<string>(),out:Swap[]=[];
 for(const add of visitors){const a=byId(add);if(!a)continue;let best:string|null=null,score=Infinity;
  for(const [id,w] of Object.entries(dayWeights)){if(used.has(id)||!(w>0))continue;const f=byId(id);if(!f||f.rarity!==a.rarity||f.spots.length===1||Math.abs(f.price-a.price)>1)continue;
   const next=(value+w*(a.price-f.price))/total,nextSell=(sell+w*(fishSellValue(a)-fishSellValue(f)))/total;
   if(Math.abs(next-day)>day*TIME_EV_GUARD||Math.abs(nextSell-daySell)>daySell*TIME_EV_GUARD)continue;
   const s=Math.abs(f.price-a.price)*100-w*.01;if(s<score){score=s;best=id;}}
  if(best){const r=byId(best)!;used.add(best);value+=dayWeights[best]*(a.price-r.price);sell+=dayWeights[best]*(fishSellValue(a)-fishSellValue(r));out.push({add,rest:best});}}
 return out;
}
/** Apply the swaps to a weight table (a fresh object; the spot's own table is never mutated). */
export function applyTimeSwaps(weights:Record<string,number>,swaps:readonly Swap[]):Record<string,number>{
 if(!swaps.length)return weights;
 const out={...weights};for(const {add,rest} of swaps){out[add]=(out[add]??0)+(out[rest]??0);delete out[rest];}
 return out;
}
