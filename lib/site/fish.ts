import {FISH,FISH_SPOTS,RARITY_LABEL,type FishSpecies} from '@/lib/town/fishing/fishCatalog';
import {WHEN_LABEL} from '@/lib/town/fishing/nightFish';
/**
 * The Fishbook as plain reading pages (/fish, /fish/<id>): read-only views of lib/town/fishing/fishCatalog.ts (which already
 * merges fishSpecials, deepSeaFish and nightFish). Where an animal lives is island fiction ("Island story"); the club fact is
 * real ("Real football fact") with a plain-text source credit and no outside link, the same rule as the in-game Fishbook.
 */
export const SITE_FISH:FishSpecies[]=FISH;
const LANG:Record<string,string>={en:'',it:' (Italian)',es:' (Spanish)',pt:' (Portuguese)',fr:' (French)',nl:' (Dutch)',de:' (German)',ja:' (Japanese)',th:' (Thai)'};
/** Same credit wording as components/Fishbook.tsx: the data's `credit`, else the source's site name. */
export function fishCredit(f:FishSpecies):string{
 if(f.club.credit)return f.club.credit;
 try{const h=new URL(f.club.source).hostname.replace(/^www\./,''),w=h.match(/^([a-z]+)\.wikipedia\.org$/);return w?`Wikipedia${LANG[w[1]]??''}`:h;}catch{return 'source on file';}
}
export const rarityWord=(f:FishSpecies)=>RARITY_LABEL[f.rarity];
export const fishPlaces=(f:FishSpecies)=>FISH_SPOTS.filter(s=>f.spots.includes(s.id)).map(s=>({name:s.name,story:s.story}));
export const fishWhen=(f:FishSpecies)=>f.when?WHEN_LABEL[f.when]:null;
export const fishById=(id:string)=>SITE_FISH.find(f=>f.id===id);
export const fishPath=(id:string)=>`/fish/${id}`;
