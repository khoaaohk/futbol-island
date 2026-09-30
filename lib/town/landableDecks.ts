// Landable floating decks (Sep 29 2026): a generic, cheap extension point for things like a moored boat. A registered deck
// counts as walkable ground (simulation.blocked), as land for landing searches (landmass.onLand / distanceToLand) and
// as a floor at its `height` (rooftopTravel.surface). The owner may mutate x/z/yaw/height in place each frame (sway),
// like the ferry deck; nothing here runs per frame. Each check skips a deck with a box test before any trig.
/** `contains` (optional, Sep 30 2026, East Jetty): a finer shape inside the rectangle (e.g. a curved walkway). The rectangle
 *  stays the cheap first test and the bound used by distanceToLandableDeck (a lower bound, fine for landing searches). */
export type LandableDeck={id:string;x:number;z:number;w:number;d:number;yaw:number;height:number;contains?:(x:number,z:number)=>boolean};
const decks:LandableDeck[]=[];
/** Register a deck; returns an unregister function. Registering the same id again replaces the old entry. */
export function registerLandableDeck(deck:LandableDeck){
 const old=decks.findIndex(d=>d.id===deck.id);if(old>=0)decks.splice(old,1);decks.push(deck);
 return ()=>{const i=decks.indexOf(deck);if(i>=0)decks.splice(i,1);};
}
export const landableDecks=():readonly LandableDeck[]=>decks;
/** Half-extent of a square around the deck centre that holds the deck at any yaw ((w+d)/2 ≥ half its diagonal): a cheap
 *  reject before the trig, since the East Pier decks are always registered (code review finding 13). */
const reach=(deck:LandableDeck)=>(deck.w+deck.d)/2;
/** Local coordinates in the deck's frame (yaw 0 = w along x, d along z). */
function local(deck:LandableDeck,x:number,z:number){const dx=x-deck.x,dz=z-deck.z,c=Math.cos(deck.yaw),s=Math.sin(deck.yaw);return {u:dx*c-dz*s,v:dx*s+dz*c};}
export function landableDeckAt(x:number,z:number):LandableDeck|null{
 if(!decks.length)return null;
 for(const deck of decks){const r=reach(deck);if(Math.abs(x-deck.x)>r||Math.abs(z-deck.z)>r)continue;const {u,v}=local(deck,x,z);if(Math.abs(u)<=deck.w/2&&Math.abs(v)<=deck.d/2&&(!deck.contains||deck.contains(x,z)))return deck;}
 return null;
}
export const onLandableDeck=(x:number,z:number)=>decks.length>0&&landableDeckAt(x,z)!==null;
/** Deck floor height at x/z (0 when none). */
export const landableDeckHeight=(x:number,z:number)=>{const deck=decks.length?landableDeckAt(x,z):null;return deck?deck.height:0;};
/** Distance to the nearest deck edge (Infinity when none; 0 on a deck). */
export function distanceToLandableDeck(x:number,z:number){
 let best=Infinity;for(const deck of decks){if(Math.max(Math.abs(x-deck.x),Math.abs(z-deck.z))-reach(deck)>=best)continue;const {u,v}=local(deck,x,z);best=Math.min(best,Math.hypot(Math.max(0,Math.abs(u)-deck.w/2),Math.max(0,Math.abs(v)-deck.d/2)));}return best;
}
