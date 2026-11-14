import notes from './fishNotes.json';
import {FISH_SPOTS,MARKET_STAND,SHADOW_LABEL,type FishSpecies} from '@/lib/town/fishing/fishCatalog';
import {LURES} from '@/lib/town/fishing/lures';
import {fishPath,rarityWord,SITE_FISH} from './fish';
import type {LinkGroup,Related,SiteLink} from './related';
/**
 * Fishbook pages' own words (SEO, Nov 14 2026: Search Console listed the fish pages as "Crawled – currently not indexed").
 *  - Real animal (lib/site/fishNotes.json, keyed by fish id): where it lives in the wild and a fun fish fact, each checked on
 *    14 Nov 2026 against the source URLs beside it (Wikipedia plus a museum, aquarium, NOAA or FishBase page where one
 *    confirmed it). Kids see a plain-text credit, never a link; every URL is listed in docs/fishing-content-sources.md
 *    (scripts/gen-content-sources.cjs).
 *  - Game (template, from the game data): how to catch it on the island: where, the shadow to look for, which lure it likes,
 *    the time of day, the boat, the rarity and the market price. Island fiction, labelled as the game.
 *  - Related fish: more of the same kind of animal.
 */
export type FishNote={lives:string;fact:string;src:string[];checked:string};
export const FISH_NOTES=notes as unknown as Record<string,FishNote>;
export const fishNote=(f:Pick<FishSpecies,'id'>):FishNote|undefined=>FISH_NOTES[f.id];

const RARITY_TIP:Record<FishSpecies['rarity'],string>={
 common:'is a common catch, so most new anglers reel one in early',
 uncommon:'is a good catch: it bites less often than the common fish, so keep casting',
 rare:'is a rare catch, so patience pays: a few quiet casts in a row are normal before it bites',
 legendary:'is a legendary catch, one of the hardest animals in the Fishbook to find, so celebrate if you land one',
};
const SHADOW_TIP:Record<FishSpecies['shadow'],string>={small:'a small, quick shadow',medium:'a medium-sized shadow',large:'a large shadow',huge:'a huge shadow',giant:'a giant shadow'};
const list=(xs:string[])=>xs.length<2?xs.join(''):`${xs.slice(0,-1).join(', ')} and ${xs.at(-1)}`;
/** "How to catch it in Futbol Island": plain sentences from the game data (where, shadow, lure, time, boat, rarity, price). */
export function fishCatchTips(f:FishSpecies):string[]{
 const name=f.name.toLowerCase(),spots=FISH_SPOTS.filter(s=>f.spots.includes(s.id));
 const boats=spots.filter(s=>s.deep),shore=spots.filter(s=>!s.deep),out:string[]=[];
 if(spots.length===1)out.push(`Only one place on the island has the ${name}: ${spots[0].name}.`);
 else if(spots.length<=4)out.push(`Cast your line at ${list(spots.map(s=>s.name))} to find the ${name}.`);
 else out.push(`The ${name} swims at ${spots.length} of the island’s fishing spots${shore.length?`, from ${shore[0].name} to ${shore.at(-1)!.name}`:''}.`);
 if(boats.length&&!shore.length)out.push(`You need a deep-sea boat for this one: it lives out in open water, where bites take a little longer.`);
 else if(f.deepSea)out.push(`It is a deep-sea animal, so the deep-sea boats are the best place to try.`);
 out.push(`Before it bites, watch the water for ${SHADOW_TIP[f.shadow]} (${SHADOW_LABEL[f.shadow].toLowerCase()} in the game).`);
 const lures=LURES.filter(l=>l.favors(f));
 out.push(lures.length?`The ${list(lures.map(l=>l.name))} brings it in more often. ${lures[0].effect}`:`No lure is its favourite, so any lure works: the lure changes which kind of animal comes, never how rare it is.`);
 if(f.when==='night')out.push(`Fish at night: switch the island’s time to Night in Settings, because the ${name} only comes out after dark.`);
 if(f.when==='sunset')out.push(`Come at sunset: the ${name} only shows up when the island’s time is set to Sunset.`);
 out.push(`The ${name} ${RARITY_TIP[f.rarity]}. ${MARKET_STAND.seller} at the market stand pays up to ${f.price} coins for each one, and yours measures ${f.size[0]} to ${f.size[1]} cm.`);
 return out;
}
const GROUP_PLURAL:Record<string,string>={shellfish:'shellfish',fish:'fish',shark:'sharks',octopus:'octopuses',ray:'rays',seahorse:'seahorses',crab:'crabs',eel:'eels',lobster:'lobsters',squid:'squid'};
const fishLink=(f:FishSpecies):SiteLink=>({path:fishPath(f.id),name:f.name,meta:rarityWord(f)});
/** "Related fish": up to 4 more of the same kind of animal (for plain fish, the same shadow size too), none already linked. */
export function withRelatedFish(f:FishSpecies,r:Related):Related{
 const seen=new Set([fishPath(f.id),r.prev.path,r.next.path,...r.groups.flatMap(g=>g.links.map(l=>l.path))]);
 const pool=SITE_FISH.filter(x=>x.group===f.group&&(f.group!=='fish'||x.shadow===f.shadow)),i=pool.indexOf(f),links:SiteLink[]=[];
 for(let n=1;n<pool.length&&links.length<4;n++){const x=pool[(i+n)%pool.length];if(!seen.has(fishPath(x.id))){links.push(fishLink(x));seen.add(fishPath(x.id));}}
 if(!links.length)return r;
 const g:LinkGroup={title:f.group==='fish'?`Related fish with ${SHADOW_TIP[f.shadow].replace(/^an? /,'a ').replace(', quick','')}`:`Related fish: more ${GROUP_PLURAL[f.group]??f.group}`,links};
 return {...r,groups:[g,...r.groups]};
}
