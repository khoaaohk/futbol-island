/**
 * Café by the Sea (Nov 24 2026, owner: "for this area here, can we add a seaside cafe like this image"): a two-storey timber café on
 * Coral Cay's sandy east point (south of the beach-soccer court, east of the Island Line's landfall curve), with a deck that steps
 * out over the water on posts, a ladder down to the sea, a moored rowboat, stone steps with potted flowers, and (owner add) a small
 * butterfly garden on the slope beside the steps. An original design in the reference's mood (no copied name or sign text).
 *
 * Football learning (AGENTS.md): Malia, the owner, talks match-day food and drink (water and carbohydrate before, fruit and sips at
 * half-time, a recovery snack after), shows today's real fixtures (the island's scores feed, the same one Imani reads), and links the
 * garden's zigzagging butterflies to a winger changing direction. The garden's monarchs are the Bug book's existing Captain Monarch
 * (bugSpecies.ts id `monarch`): netted the same way as the Stadium Park pond's dragonflies (pondBugs.ts), recorded exactly like a shift
 * catch. Sources for every fact: CAFE_SOURCES below (checked Nov 24 2026).
 *
 * Pure data and point tests only (no three.js): the 3D build (seasideCafeWorld.ts), the hover prompt (graphics/cafePrompt.ts), the
 * butterflies (graphics/cafeButterflies.ts), Town's swim rules, the map and tests/seaside-cafe.cjs read these same numbers.
 * Registers the deck's over-water part as a landable deck (walkable ground) on import, like eastPier.ts.
 */
import {registerLandableDeck} from './landableDecks';
import type {NpcDefinition} from './npcDialogues';
import type {IslandNewsFeed,IslandNewsItem} from './islandNews';
import {SUMMIT_CENTER} from './summitIsle';

export const CAFE_NAME='Café by the Sea';
/** The ground floor (x 702…712, z −102.5…−95.5), its floor (= the deck's top, y .7 over the sand), wall and upper-floor heights. The
 *  front (door, windows, awning) faces +z (south, toward the island camera); the sea is east. */
export const CAFE={x:707,z:-99,w:10,d:7,floor:.7,wallH:3.2,upperW:8.4,upperD:5.4,upperH:2.6,roofRise:1.9,front:-95.5,door:{x:704.4,w:1.3}} as const;
/** The building's walkable top (the wraparound balcony floor, world y). */
export const CAFE_BALCONY_Y=CAFE.floor+CAFE.wallH;
export type CafeBox={x:number;z:number;w:number;d:number};
/** The deck: an L round the front (south) and the sea side (east), at CAFE.floor. Front x 700…713.8, z −95.5…−88 (on the sand); east
 *  x 712…719, z −106…−95.5, stepping out over the sea on posts east of the waterline (x ≳ 713.5…716.8). Every deck point stays ≥ 53.5 m
 *  from Ray Meadow's centre (diveSpots.ts: its fade edge + DIVE_SHORE_CLEAR, tests/water-dive.cjs), so it never crowds the reef. */
export const CAFE_DECKS:readonly CafeBox[]=[{x:706.9,z:-91.75,w:13.8,d:7.5},{x:715.5,z:-100.75,w:7,d:10.5}];
/** Stone steps up to the deck's west end (x 700), two treads of .8 m (heights below), 4 m wide; a walker steps up .23 / .47 / .7. */
export const CAFE_STEPS:readonly (CafeBox&{height:number})[]=[{x:699.6,z:-91.75,w:.8,d:4,height:.47},{x:698.8,z:-91.75,w:.8,d:4,height:.23}];
/** The ladder down to the sea on the deck's east edge (a swimmer climbs out here; everywhere else the deck is a wall to a swimmer). */
export const CAFE_LADDER={x:719.35,z:-102,w:.7,d:1.1} as const;
/** The over-water part of the deck (landable: walkable ground for simulation.blocked and the landing search), ladder strip included. */
export const CAFE_WATER_DECK={x:715.85,z:-100.75,w:7.7,d:10.5} as const;// x 712…719.7, z −106…−95.5
/** Posts under the over-water deck (every ~2.6 m round its edge, plus a middle row): swim colliders with a foam ring each. */
export const CAFE_POSTS:readonly {x:number;z:number}[]=(()=>{const out:{x:number;z:number}[]=[];
 for(const z of [-105.7,-103.1,-100.5,-97.9,-95.8])out.push({x:718.7,z});
 for(const z of [-105.7,-102.6])out.push({x:716.2,z});
 out.push({x:713.6,z:-105.7});
 return out;})();
export const CAFE_POST_R=.17;
/** The rowboat moored off the deck's east side (a static, batched prop), its yaw and the mooring post it is tied to. */
export const CAFE_BOAT={x:722.7,z:-99.4,yaw:.28,len:3.4,beam:1.25} as const;
/** Outdoor tables on the deck (two chairs each, round top .9 m). */
/** Nov 25 2026 (owner: "add a table where you can sit and enjoy the view facing the summit"): the front deck's third table moved
 *  from (710.8, −91) to the deck's south-east corner, chairs: 0: it has the view bench (CAFE_VIEW_SEAT) instead of chairs. */
export const CAFE_TABLES:readonly {x:number;z:number;chairs:number}[]=[{x:702.8,z:-91,chairs:2},{x:706.8,z:-90.8,chairs:3},{x:712.3,z:-89,chairs:0},{x:716,z:-99.2,chairs:2},{x:716,z:-103.6,chairs:2}];
/** The view seat (Nov 25 2026): a short bench behind the corner table, facing Summit Isle across the sea (south-south-west from
 *  here: the deck's south rail is the clearest view; the east deck looks out to open sea). bench: its centre and yaw (its open side
 *  faces the summit: a rig root at yaw `yaw` faces +z rotated by yaw, like the island benches, npcSeatPose BENCH); sit: where the
 *  player's root sits (BENCH.rootZ in front of the bench centre), at the deck's height; the camera looks at `look`. */
export const CAFE_VIEW_SEAT=(()=>{const T=CAFE_TABLES[2],dx=SUMMIT_CENTER.x-T.x,dz=SUMMIT_CENTER.z-T.z,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
 const bx=T.x-.95*ux,bz=T.z-.95*uz;
 return {table:{x:T.x,z:T.z},ux,uz,yaw:Math.atan2(ux,uz),bench:{x:bx,z:bz,w:1.3},sit:{x:bx+.05*ux,z:bz+.05*uz,y:CAFE.floor},
  look:{x:SUMMIT_CENTER.x,y:7,z:SUMMIT_CENTER.z},reach:1.6,key:'cafe-view-seat'} as const;})();
/** The view seat's colliders: the table (1 m: the sitter's knees fit between it and the bench), the backrest (a strip .3 m behind it, so the way out along the bench stays clear) and the bench’s east
 *  end (by the rail). The west end stays open: the way in and out. Each one stays ≥ .32 m (the walker's radius) from the sit point. */
export function cafeViewSeatObstacles(){const V=CAFE_VIEW_SEAT,sx=Math.cos(V.yaw),sz=-Math.sin(V.yaw);// bench's long axis (+x local)
 return [{x:V.table.x,z:V.table.z,w:1,d:1},{x:V.bench.x-.6*V.ux,z:V.bench.z-.6*V.uz,w:1.3,d:.12},{x:V.bench.x+.72*sx,z:V.bench.z+.72*sz,w:.14,d:.5}];}
/** The fixtures chalkboard (an A-frame by the steps' foot, facing the beach path) and the garden sign. */
export const CAFE_CHALKBOARD={x:697.4,z:-87.2,yaw:-.35,w:1.25,h:.95} as const;
export const CAFE_GARDEN_SIGN={x:690.6,z:-85.6,yaw:.25,w:1.1,h:.55} as const;
/** The butterfly garden (owner add): beds on the slope between the steps and the palms. kind: the flower kind each bed grows. */
export type GardenBed=CafeBox&{kind:'hibiscus'|'daisy'|'climber'};
export const CAFE_GARDEN:readonly GardenBed[]=[{x:692.2,z:-96.2,w:4.2,d:3.4,kind:'hibiscus'},{x:692.8,z:-90.4,w:5,d:3,kind:'daisy'},{x:696.6,z:-92,w:1.6,d:9.6,kind:'climber'},{x:690.6,z:-87.2,w:2.6,d:2,kind:'daisy'}];
/** The garden's bounds (the butterflies wander inside; the near gate centres on it). */
export const CAFE_GARDEN_AREA={x0:689.6,x1:697.6,z0:-98.2,z1:-85.4,cx:693.6,cz:-91.8} as const;
/** Existing beach props the café moved (coralCayWorld.ts): the beach-ring palms 135 / 140 and umbrella 138 stood on its footprint. */
export const CAFE_CLEAR={x0:687.5,x1:724,z0:-108,z1:-84.5} as const;
export const inCafeClear=(x:number,z:number)=>x>=CAFE_CLEAR.x0&&x<=CAFE_CLEAR.x1&&z>=CAFE_CLEAR.z0&&z<=CAFE_CLEAR.z1;
/** Hover / tap / walk-up prompt ranges (m): hover counts within HOVER of the café's middle; the button shows within REACH. */
export const CAFE_PROMPT={reach:9,hover:48,key:'cafe-visit'} as const;
/** Map pin + label (IslandOverview.tsx, the top label layer). The label sits west of the pin, on the lawn (no other label there). */
export const CAFE_MAP={x:CAFE.x,z:CAFE.z,labelX:CAFE.x-6,labelZ:CAFE.z+15,label:'CAFÉ BY THE SEA',w:94} as const;

const inBox=(b:CafeBox,x:number,z:number,pad=0)=>Math.abs(x-b.x)<=b.w/2+pad&&Math.abs(z-b.z)<=b.d/2+pad;
export const onCafeDeck=(x:number,z:number)=>CAFE_DECKS.some(d=>inBox(d,x,z));
export const onCafeLadder=(x:number,z:number,pad=0)=>inBox(CAFE_LADDER,x,z,pad);
/** Swim rule: true inside a post (radius + a swimmer's .3 m). */
export function cafeSwimBlocked(x:number,z:number){
 if(x<712||x>721||z<-108||z>-94)return false;
 for(const p of CAFE_POSTS)if((x-p.x)**2+(z-p.z)**2<(CAFE_POST_R+.3)**2)return true;
 return false;
}
/** Swimmers vs the deck: its over-water footprint is not land to a swimmer (they swim under it, between the posts), except the ladder. */
export const cafeDeckSwimWall=(x:number,z:number)=>inBox(CAFE_WATER_DECK,x,z)&&!onCafeLadder(x,z,.15);
/** Walk surfaces (rooftopTravel: floors with step access) and their colliders: the two deck rectangles, the steps and the ladder strip. */
export function cafeWalkSurfaces(){
 const out:(CafeBox&{height:number;stepAccess:true})[]=[];
 for(const d of CAFE_DECKS)out.push({...d,height:CAFE.floor,stepAccess:true});
 for(const s of CAFE_STEPS)out.push({x:s.x,z:s.z,w:s.w,d:s.d,height:s.height,stepAccess:true});
 out.push({x:CAFE_LADDER.x,z:CAFE_LADDER.z,w:CAFE_LADDER.w,d:CAFE_LADDER.d,height:CAFE.floor,stepAccess:true});
 return out;
}
registerLandableDeck({id:'half-time-cafe',x:CAFE_WATER_DECK.x,z:CAFE_WATER_DECK.z,w:CAFE_WATER_DECK.w,d:CAFE_WATER_DECK.d,yaw:0,height:0,
 contains:(x,z)=>onCafeDeck(x,z)||onCafeLadder(x,z),
 // The deck is land where it stands, and nowhere else: the cay's own shore (≤ 6 m away) stays the distance for the swim range and the
 // dive zones' shore clearance (tests/water-dive.cjs), so the deck never pulls the open sea's depth or a reef's fade edge toward it.
 distance:(x,z)=>onCafeDeck(x,z)||onCafeLadder(x,z)?0:Infinity});

// ---------------------------------------------------------------------------------------------------------------------------------
// Football learning: sources (checked Nov 24 2026) and the owner.
export const CAFE_SOURCES={
 fifa:{title:'FIFA, "Nutrition for Football" (carbohydrate is the main fuel for football)',url:'https://digitalhub.fifa.com/m/1a8fd8b7a5a20f29/original/Nutrition-for-Football.pdf'},
 betterHealth:{title:'Better Health Channel (Victoria), "Sporting performance and food": a high-carbohydrate meal 3–4 h before, a snack 1–2 h before; fluids before, during and after',url:'https://www.betterhealth.vic.gov.au/health/healthyliving/sporting-performance-and-food'},
 sdaSoccer:{title:'Sports Dietitians Australia, "Food for your sport: Soccer" (carbohydrate and fluid at half-time; recovery)',url:'https://www.sportsdietitians.com.au/factsheets/food-for-your-sport/soccer/'},
 sdaRecovery:{title:'Sports Dietitians Australia, "Recovery nutrition" (carbohydrate, protein and fluids after exercise)',url:'https://www.sportsdietitians.com.au/factsheets/fuelling-recovery/recovery-nutrition/'},
 sdaKids:{title:'Sports Dietitians Australia, "Children in sport" (water is the best drink for most children’s sport)',url:'https://www.sportsdietitians.com.au/factsheets/children/children-in-sport/'},
 flight:{title:'Dudley R. (2002), "Mechanisms and implications of animal flight maneuverability", Integrative and Comparative Biology 42(1):135–140 (erratic, zigzag flight helps butterflies evade predators)',url:'https://doi.org/10.1093/icb/42.1.135'},
 monarch:{title:'USDA Forest Service, "Monarch Butterfly Biology" (milkweed makes monarchs taste bad to birds; the orange warns them)',url:'https://www.fs.usda.gov/wildflowers/pollinators/Monarch_Butterfly/biology/index.shtml'},
} as const;
export type CafeSourceId=keyof typeof CAFE_SOURCES;
/** Every fact the café tells (the NPC's topics, the garden sign, the chalkboard header) with its source. tests/seaside-cafe.cjs checks
 *  each NPC topic id appears here and each source is listed. */
export const CAFE_FACTS:readonly {id:string;fact:string;source:CafeSourceId}[]=[
 {id:'before',fact:'Carbohydrate foods are football’s main fuel; a proper meal 3–4 hours before and a small familiar snack 1–2 hours before.',source:'betterHealth'},
 {id:'fuel',fact:'Carbohydrate is the main fuel for the running in football.',source:'fifa'},
 {id:'water',fact:'Drink before, during the breaks and after a game; for most children’s sport, water is the best drink.',source:'sdaKids'},
 {id:'halftime',fact:'Half-time is a chance for fluid and a little easy carbohydrate, like fruit, for the second half.',source:'sdaSoccer'},
 {id:'recover',fact:'After the game, refuel with carbohydrate, some protein and fluids to help the body recover.',source:'sdaRecovery'},
 {id:'butterflies',fact:'Butterflies fly in erratic zigzags, which makes them harder for a bird to catch.',source:'flight'},
 {id:'monarch',fact:'Monarch caterpillars eat milkweed, which makes the butterflies taste bad to birds; their bright orange is a warning.',source:'monarch'},
];
export const CAFE_OWNER_ID='cay-malia';
/** Malia stands on the deck by the door (floor: the deck's top). Original character. */
export const CAFE_OWNER:NpcDefinition={id:CAFE_OWNER_ID,name:'Malia',role:'Café by the Sea owner',pursuit:'SERVING MATCH-DAY SNACKS',x:705.6,z:-94.4,
 floor:()=>CAFE.floor,activity:'serving',workYaw:0,character:'female',face:'warm',clothing:'sunset',
 news:'scores',newsQuestion:'What’s on the fixtures board today?',newsIntro:'Here’s my chalkboard: games being played right now and today’s fixtures. Pick one and think about how both teams fuelled up for it.',
 greeting:'Welcome to the Café by the Sea! Players stop here before and after the games on the court. Food is fuel for football. Ask me what to eat and drink on match day, or check today’s fixtures on my chalkboard.',
 topics:[
  {id:'before',question:'What should I eat before a match?',answer:'Carbohydrate foods are football’s main fuel: rice, pasta, bread, potatoes or fruit. Have a proper meal about 3 to 4 hours before you play, and a small snack you know well, like a banana or toast, 1 to 2 hours before.',
   followUp:{question:'Why carbohydrate?',answer:'Football is lots of runs, sprints and turns, and carbohydrate is the fuel your muscles use most for that. Try your match-day food at training first, so nothing is new on the day.'}},
  {id:'water',question:'Why does water matter so much?',answer:'You lose water when you sweat, even more on a hot beach. Drink before you play, take sips at every break and drink again afterwards. Don’t wait until you feel really thirsty.',
   followUp:{question:'Do I need a sports drink?',answer:'For most kids’ training and matches, water does the job. If you are not sure about anything else, ask your coach or a grown-up.'}},
  {id:'halftime',question:'What is good to have at half-time?',answer:'A few sips of water and something small and easy, like orange slices or a piece of banana. It tops up your fluid and gives a little quick carbohydrate for the second half. Half-time snacks are so important that the café in town is named after them: the Half-Time Café!',
   followUp:{question:'Why not a big meal at the break?',answer:'Your tummy would still be busy with it when you start running again, so you could feel heavy. Keep the big meal for hours before, and after the game.'}},
  {id:'recover',question:'What helps me recover after a game?',answer:'Refuel with carbohydrate, some protein and plenty to drink: a sandwich, rice and fish, or yoghurt with fruit. It helps your body recover for the next training.',
   followUp:{question:'What does the protein do?',answer:'It helps your muscles repair after all that running. Sleep and rest do the rest of the job.'}},
  {id:'butterflies',question:'Why do the butterflies in your garden zigzag?',answer:'Scientists think their erratic, zigzag flight makes them harder for a bird to catch. It works like a winger changing direction to beat a defender: a sudden change of path is hard to follow.',
   followUp:{question:'Can I catch one?',answer:'They are Captain Monarchs from the island Bug book. Stand still in the garden and one will flutter close: net it, look, learn and let it go. Their bright orange warns birds that they taste bad, because the caterpillars eat milkweed.'}},
 ]};

// ---------------------------------------------------------------------------------------------------------------------------------
// The chalkboard: today's real fixtures from the island's scores feed (newsClient.ts loadIslandNews('scores'), cached; read once when
// the player comes near the café). Pure, so tests can feed it a sample feed.
export type ChalkLine={left:string;right:string;live:boolean};
const short=(name:string)=>name.length<=13?name:name.split(/\s+/).map(w=>w.length>4?w.slice(0,4)+'.':w).join(' ').slice(0,13);
const timeOf=(iso:string)=>{const d=new Date(iso);return Number.isFinite(d.getTime())?`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`:'';};
const sameDay=(iso:string,now:number)=>{const d=new Date(iso),n=new Date(now);return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();};
/** Up to `max` chalk lines: games in progress first (score + LIVE), then today's kick-offs (time), else the latest results. */
export function chalkFixtures(feed:IslandNewsFeed|null,now:number,max=4):{title:string;lines:ChalkLine[]}{
 if(!feed||feed.unavailable)return {title:'TODAY’S FIXTURES',lines:[]};
 const items=feed.items.filter((i):i is IslandNewsItem&{match:NonNullable<IslandNewsItem['match']>}=>!!i.match);
 const live=items.filter(i=>i.match.state==='in'),today=items.filter(i=>i.match.state==='pre'&&sameDay(i.publishedAt,now)).sort((a,b)=>a.publishedAt.localeCompare(b.publishedAt));
 const line=(i:typeof items[number]):ChalkLine=>i.match.state==='pre'?{left:`${short(i.match.home)} v ${short(i.match.away)}`,right:timeOf(i.publishedAt),live:false}
  :{left:`${short(i.match.home)} ${i.match.homeScore}-${i.match.awayScore} ${short(i.match.away)}`,right:i.match.state==='in'?'LIVE':'FT',live:i.match.state==='in'};
 const lines=[...live,...today].slice(0,max).map(line);
 if(lines.length)return {title:'TODAY’S FIXTURES',lines};
 const results=items.filter(i=>i.match.state==='post').concat((feed.lastResults??[]).filter(i=>!!i.match) as typeof items).slice(0,max).map(line);
 return {title:results.length?'LATEST RESULTS':'TODAY’S FIXTURES',lines:results};
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The garden's butterflies (graphics/cafeButterflies.ts): the Bug book's Captain Monarch. Catch rules mirror the pond's (pondBugs.ts).
export const CAFE_BUTTERFLY_ID='monarch';
/** count: desktop / phone; near: the motion gate (m from the garden's middle); flee: the scatter radius from a moving player; calmSpeed:
 *  under it the player is "still" (no scatter, and now and then one comes close: curious); net: the Net it range; away: s a netted one
 *  is gone. */
/** Owner Nov 25 2026 (shot 94: "remove the net it option for the butterflies at the cafe"): the garden's monarchs are just to look
 *  at: no Net it prompt, no catch. The Stadium Park pond's dragonflies keep theirs. Flip to true to bring it back. */
export const CAFE_NET_OPEN=false;
export const CAFE_BUTTERFLIES={count:[10,8] as const,near:40,flee:2.4,calmSpeed:1.2,curious:.4,net:3,away:40,key:'cafe-net',size:.62} as const;
export const CAFE_BUTTERFLY_WHERE='Or stand still in the flower garden at the Café by the Sea on Coral Cay: a monarch will flutter close enough to net.';
