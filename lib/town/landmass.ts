// All walkable ground: the main island (shoreline.ts), the ferry gangway and deck, and Coral Cay with its causeway and
// sandbars (coralCay.ts). Use these where "is this dry land?" should include the cay; shoreline.ts stays main-island only
// (fishing water, lamp placement, traffic nodes and the main maps' coast drawing depend on that).
import {onIsland,distanceToShore} from './shoreline';
import {onFerryBoarding} from './ferryBoarding';
import {onCayLand,distanceToCayLand} from './coralCay';
import {onLandableDeck,distanceToLandableDeck} from './landableDecks';
import './eastPier'; // The East Pier's decks count as land (registered once in eastPier.ts).
export const onLand=(x:number,z:number)=>onIsland(x,z)||onFerryBoarding(x,z)||onCayLand(x,z)||onLandableDeck(x,z);
/** 0 on land; otherwise the distance to the nearest shore of either island, causeway or sandbar. */
export function distanceToLand(x:number,z:number){
 if(onIsland(x,z)||onCayLand(x,z)||onLandableDeck(x,z))return 0;
 return Math.min(distanceToShore(x,z),distanceToCayLand(x,z),distanceToLandableDeck(x,z));
}
