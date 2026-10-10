import {STORE_ITEMS,type StoreItem,type StoreCategory} from './store';
import {CLUB_COSTUMES,getCostume} from './costumes';
import {getIslandCostume} from './islandCostumes';
import {COIN_REWARD_ID,COSTUME_UNLOCK_ORDER} from './coinQuest';
import {CARD_ENTRIES} from './cardCollection';
import {LEGEND_PACK_CANDIDATES,legendFor,MYSTERY_PACK_OPTIONS} from '../arcade/legendPacks';
import {SPECIAL_BALL_IDS,type VendingSpecialBall} from './specialBalls';
import {cayVendingSpots,konbiniMachineSpot,ISLAND_SQUARE_KONBINI} from './vendingPlaces';
import {DRINK_MACHINE_IDS,DRINK_MACHINE_INFO,drinkSpotBeside,type DrinkMachineId} from './drinkMachines';

/**
 * Island vending machines (user, Sep 27 2026): the Store is gone; Japanese-style vending machines around the island sell
 * everything for arcade coins. Eight on the main island, then (Sep 29 2026) four more: North Beach, the causeway and two on
 * Coral Cay, each selling one new hardship pop-up book (placed from Coral Cay's anchors in lib/town/vendingPlaces.ts). Every machine stocks the full regular catalogue in rows (card packs, balls, rides, island
 * animals) plus a Specials row that only that machine sells. docs/vending-machines.md documents prices and decisions.
 */
export type VendingMachineId='plaza'|'rooftop'|'oldtown'|'clubgrounds'|'eleven'|'beach'|'pier'|'market'|'northbeach'|'causeway'|'cayplaza'|'sharks'|'caykonbini'|DrinkMachineId;
export type VendingMachine={id:VendingMachineId;name:string;place:string;x:number;z:number;y:number;yaw:number;
 /** Cabinet colour, lighter sign colour and a readable ink for the UI. */
 color:string;light:string;ink:string;specials:string[];lesson:string;
 /** Sep 29 2026: one of the two outdoor drink machines (lib/town/drinkMachines.ts): sells drinks, not the vending catalogue. */
 drinks?:true};
/** Default facing: toward the island camera (which looks along -16,-23,-33), so the glass front reads from the default view.
 * Machines set against a wall or tucked into a corner face their walk-up side instead (their own `yaw`). */
import {PLAYER_BOOKS,BOOK_PRICE,booksForMachine,type PlayerBookId} from '../books/catalog';
import {READY_BOOKS} from '../books/registry.ids.generated';
/** Shelf blurb for a pop-up book: every player book is a true story of a hardship and how they kept going. */
/** Name on the cover / shelf label. */
const bookShortName=(id:PlayerBookId)=>({cristiano:'Cristiano',ronaldo:'Ronaldo',debruyne:'De Bruyne',pele:'Pelé',kante:'Kanté'} as Partial<Record<PlayerBookId,string>>)[id]??PLAYER_BOOKS[id].player.split(' ').slice(-1)[0];
const bookBlurb=(id:PlayerBookId)=>id==='island'?'Futbol Island: an introduction to everything you can do on the island.':`${PLAYER_BOOKS[id].title}. A riso pop-up book: the true story of a hardship ${PLAYER_BOOKS[id].player} faced, and what helped.`;

export const VENDING_YAW=Math.atan2(16,33);
export const VENDING_SIZE={w:1.3,d:.86,h:2.12} as const;
export const VENDING_MACHINES:VendingMachine[]=[
 {id:'plaza',name:'Konbini',place:'under the convenience-store canopy beside the sliding doors',...konbiniMachineSpot(ISLAND_SQUARE_KONBINI),y:0,color:'#d8342c',light:'#ffd9c9',ink:'#5a0f0b',specials:['ball:telstar','pack:legends'],lesson:'Football history lives here: the 1970 TV ball and all-time legends.'},
 {id:'rooftop',name:'Palm Coast Rooftop',place:'on the rooftop futsal court',x:11,z:-7.8,y:6,yaw:VENDING_YAW,color:'#1f9aa6',light:'#c9f5f2',ink:'#073c42',specials:['ball:futsal','pack:futsal'],lesson:'Futsal is 5-a-side on a hard court with a smaller, low-bounce ball.'},
 {id:'oldtown',name:'Old Town Ground',place:'beside the 7v7 pitch',x:11,z:-48,y:0,yaw:VENDING_YAW,color:'#3d8f4f',light:'#d7f5c9',ink:'#12391a',specials:['ball:grassroots','pack:wingers'],lesson:'7v7 plays a 2–3–1: fewer players means more touches for everyone.'},
 {id:'clubgrounds',name:'Club Grounds',place:'on the street corner by the 9v9 pitch',x:132.8,z:-69.8,y:0,yaw:-Math.PI/4,color:'#ee7d22',light:'#ffe4c2',ink:'#5a2a04',specials:['ball:hivis','pack:defenders'],lesson:'9v9 often plays a 3–2–3 with a back three that defends together.'},
 {id:'eleven',name:'Eleven Park',place:'on the 11v11 touchline',x:96,z:115,y:0,yaw:VENDING_YAW,color:'#23407e',light:'#d5e0ff',ink:'#0b1a3d',specials:['ball:eleven','pack:midfield'],lesson:'11v11 uses the full-size ball and a 4–3–3 with a midfield three.'},
 {id:'beach',name:'Beach Kitchen',place:'by the surf shop on the west beach',x:-60,z:92,y:0,yaw:VENDING_YAW,color:'#f06a9a',light:'#ffe0ec',ink:'#5a0f2c',specials:['ball:beach','pack:strikers'],lesson:'Beach soccer is 5-a-side, barefoot, on soft sand.'},
 {id:'pier',name:'Pier Cafés',place:'between the pier bakery and the coast café',x:108.5,z:183.6,y:0,yaw:0,color:'#f2f0ea',light:'#d9f3ff',ink:'#153a52',specials:['ball:retro','pack:keepers'],lesson:'Long ago, footballs were brown leather that got heavy in the rain.'},
 {id:'market',name:'High School Rooftop',place:'on the highest school roof, reached by the east-side stairs',x:135,z:8,y:17.23,yaw:0,color:'#7a4cc2',light:'#eadcff',ink:'#2a1350',specials:['ball:panna','pack:eras'],lesson:'Street football like panna teaches close control in tight spaces.'},
 // Sep 29 2026: four book machines. Each sells the regular rows plus its one pop-up book (no exclusive ball or pack: all eight
 // special balls already have a home). North Beach is on the main island; the other three follow Coral Cay's anchors.
 {id:'northbeach',name:'North Beach',place:'on the sand beside the North Beach path, just before the North Beach sign',x:73.8,z:-198.5,y:0,yaw:VENDING_YAW,color:'#e9b82a',light:'#fff1c2',ink:'#4a3503',specials:[],lesson:'Full-backs like Cafu overlap: they sprint outside their winger to give an extra pass.'},
 {id:'causeway',name:'Causeway Stop',place:'on the beach bank at the bend before the Turtle Sandbar stop',...cayVendingSpots.causeway(),y:0,color:'#5f7897',light:'#dbe7f5',ink:'#172638',specials:[],lesson:'A penalty routine: pick your spot early, take one slow breath, and don’t change your mind.'},
 {id:'cayplaza',name:'Coconut Café',place:'outside the Coconut Café on the Coral Cay boulevard',...cayVendingSpots.cafe(),y:0,color:'#7fb13c',light:'#e5f5cf',ink:'#233a0c',specials:[],lesson:'Win the ball back: watch the passer’s eyes and hips, get on your toes and step in early.'},
 // Sep 29 2026: the second Konbini's machine, on Coral Cay (regular rows only; the Telstar ball and Legends pack stay at
 // Island Square's Konbini).
 {id:'caykonbini',name:'Konbini · Coral Cay',place:'under the Coral Cay Konbini canopy beside the sliding doors, by the roundabout',...cayVendingSpots.konbini(),y:0,color:'#3f8f6c',light:'#d9f3e6',ink:'#0f3324',specials:[],lesson:'Refuel like a pro: water first, then a carb snack like a banana or rice ball after you play.'},
 {id:'sharks',name:'Sharks Beach',place:'on the sand at Sharks Beach, by the Sharks Beach court',...cayVendingSpots.sharks(),y:0,color:'#2f86d6',light:'#d3ebff',ink:'#0a2b4d',specials:[],lesson:'Strikers time their runs so they meet the ball at speed.'},
];
// Sep 29 2026: exactly two drink machines, each side by side with its Konbini's machine (placed from that machine's spot).
for(const id of DRINK_MACHINE_IDS){const info=DRINK_MACHINE_INFO[id],next=VENDING_MACHINES.find(m=>m.id===info.beside)!;
 VENDING_MACHINES.push({id,name:info.name,place:info.place,...drinkSpotBeside(next),y:next.y,color:info.color,light:info.light,ink:info.ink,specials:[],lesson:info.lesson,drinks:true});}
const displayThemes:Record<VendingMachineId,[string,string,string]>={
 plaza:['Messi','Close control','#76bad4'],rooftop:['Falcão','Quick feet','#30a7ad'],oldtown:['Marta','Find space','#64a355'],
 clubgrounds:['Maldini','Defend together','#d48c45'],eleven:['Zidane','Scan and pass','#5c7fc3'],beach:['Ronaldinho','Creative play','#db81a5'],
 pier:['Pelé','Finishing','#b7a477'],market:['Cruyff','Move into space','#9a77bf'],
 northbeach:['Cafu','Overlap','#e0b33f'],causeway:['Nadim','Penalties','#7c93b3'],cayplaza:['Kanté','Win it back','#8dba55'],sharks:['Oshoala','Time your run','#4f98d8'],caykonbini:['Konbini','Fuel up','#5fa98a'],drinksplaza:['Drinks','Hydrate','#5d93d6'],drinkscay:['Drinks','Hydrate','#4fb0dc'],
};
/** Four pop-up books join each machine's exclusive ball and pack: six specials total. A book that isn't written yet
 * shows as a "coming soon" preview (no storyId, so it can't be bought or opened). */
const homeDisplays=VENDING_MACHINES.flatMap(m=>{
 const [,,color]=displayThemes[m.id];
 const covers=[color,'#e0735b','#4f9a74','#d9a93c'];
 return booksForMachine(m.id).map((book,i)=>{const b=PLAYER_BOOKS[book],ready=READY_BOOKS.includes(book),short=bookShortName(book);
  return {id:b.itemId,row:'special' as const,kind:'display' as const,machine:m.id,label:`${short} book`,price:BOOK_PRICE,
   blurb:ready?bookBlurb(book):`${b.title}. This pop-up book is still being written. Coming soon!`,
   ...(ready?{storyId:book}:{}),display:{shape:'book' as const,color:covers[i%covers.length],title:short}};});
});
for(const m of VENDING_MACHINES)m.specials.push(...homeDisplays.filter(i=>i.machine===m.id).map(i=>i.id));
/**
 * Pop-up books on sale (user, Sep 30 2026: "each machine should have 4 books"). Every shop machine sells exactly four, its own
 * ("home") books first; the four Coral Cay-side book machines add three themed books to their one, and the Coral Cay Konbini sells
 * a mix. All 36 sellable books appear at least once (the Futbol Island starter book is free for everyone). A book is ONE item
 * (its PLAYER_BOOKS itemId) wherever it is sold, so ownership, price and "Read" are per book: buying it at one machine owns it at
 * every machine, and existing saves keep their books unchanged (no migration needed: the ids did not change).
 */
export const MACHINE_BOOKS:Partial<Record<VendingMachineId,readonly PlayerBookId[]>>={
 ...Object.fromEntries(VENDING_MACHINES.filter(m=>!m.drinks&&booksForMachine(m.id).length===4).map(m=>[m.id,booksForMachine(m.id)])),
 northbeach:['cafu','bronze','davies','maldini'],          // full-backs and defenders: overlap, cover, defend together
 causeway:['nadim','modric','salah','eusebio'],            // long roads to a new home
 cayplaza:['kante','vardy','debruyne','kane'],             // told no, kept working
 sharks:['oshoala','hegerberg','kerr','drogba'],           // strikers who time their runs and keep believing
 caykonbini:['messi','marta','ronaldinho','putellas'],     // a Konbini mix of island favourites
};
export const vendingMachine=(id:string)=>VENDING_MACHINES.find(m=>m.id===id);
export function nearestVendingMachine(x:number,z:number):VendingMachine{
 // Old Store entry points open the nearest SHOP machine; drink machines are only opened in person.
 return VENDING_MACHINES.filter(m=>!m.drinks).reduce((best,m)=>Math.hypot(m.x-x,m.z-z)<Math.hypot(best.x-x,best.z-z)?m:best,VENDING_MACHINES[0]);
}

// ---- Rows and prices ------------------------------------------------------------------------------------------------------
export type VendingRowId='special'|'books'|'packs'|StoreCategory|'costume';
export const VENDING_ROWS:{id:Exclude<VendingRowId,'special'>;label:string}[]=[
 {id:'packs',label:'Card packs'},{id:'ball',label:'Balls'},{id:'scooter',label:'Scooters'},{id:'bike',label:'Bikes'},
 {id:'moped',label:'Mopeds'},{id:'jetpack',label:'Flight'},{id:'costume',label:'Island animals'},
];
/** Coin prices (docs/vending-machines.md; raised in the economy pass, docs/economy/ECONOMY_PROPOSAL.md §5.2, 28 Sep 2026).
 *  Packs keep the arcade wallet's own prices; books keep BOOK_PRICE (100, user decision). */
export const VENDING_PRICES={ball:20,specialBall:35,scooter:30,bike:40,moped:50,jetpack:70,costume:30} as const;

/** `extra`: other missing cards that may fill slots the pack's own pool cannot (set by vendingLedger.packFreshness). */
export type PackSpec={size:3|5;legends:readonly string[];regular:readonly string[];theme?:string;extra?:readonly string[]};
export type VendingItem={
 id:string;row:VendingRowId;label:string;price:number;blurb:string;
 kind:'gear'|'costume'|'pack'|'display';
 /** Home decoration artwork and placement shape. */
 storyId?:import('../books/catalog').PlayerBookId;
 display?:{shape:'book'|'frame'|'lamp'|'trophy';color:string;title:string};storeItem?:StoreItem;costume?:string;pack?:PackSpec;
 /** Set for specials: the one machine that sells it. */
 machine?:VendingMachineId;
};
const regularCurrent=CARD_ENTRIES.filter(c=>c.era==='current'&&!legendFor(c.name)).map(c=>c.name);
const byRole=(roles:string[],era:'current'|'allTime')=>CARD_ENTRIES.filter(c=>roles.includes(c.role)&&c.era===era&&!legendFor(c.name)).map(c=>c.name);
const themed=(roles:string[],theme:string):PackSpec=>({size:3,legends:byRole(roles,'allTime'),regular:byRole(roles,'current'),theme});

const ballLessons:Record<VendingSpecialBall,string>={
 telstar:'At the 1970 World Cup in Mexico the official ball had 32 black and white panels, so it stood out on black-and-white TV.',
 futsal:'Futsal uses a smaller size 4 ball with a low bounce, so it stays on the court and rewards control with the sole of the foot.',
 grassroots:'Small-sided games like 7v7 give every player more touches of the ball than a full 11v11 match.',
 hivis:'In snow, fog and low winter light, leagues switch to a bright yellow ball so players and fans can follow it.',
 eleven:'Adult 11v11 matches use a size 5 ball, 68–70 cm around, the size set in the Laws of the Game.',
 beach:'Beach soccer is 5-a-side and played barefoot on sand, so the ball is soft and a little lighter.',
 retro:'Long ago, footballs were brown leather, and the old ones were laced up. They soaked up rain and got heavy.',
 panna:'Panna is street football for a nutmeg: playing the ball through an opponent’s legs. Cage games reward close control.',
};
const packLessons:Record<string,{label:string;blurb:string;spec:PackSpec}>={
 legends:{label:'All-time greats pack',blurb:'Three cards from football history, with one of the six mental-strength legends in every pack.',spec:{size:3,legends:LEGEND_PACK_CANDIDATES,regular:CARD_ENTRIES.filter(c=>c.era==='allTime'&&!legendFor(c.name)).map(c=>c.name),theme:'All-time greats'}},
 futsal:{label:'Futsal pack',blurb:'Goleiro, fixo, ala and pivô: the four futsal roles. Every pack has an all-time futsal great.',spec:themed(['goleiro','fixo','ala','pivot'],'Futsal')},
 wingers:{label:'Wingers pack',blurb:'Wide players stretch the pitch. In a 7v7 2–3–1 the wide midfielders give the team its width.',spec:themed(['winger'],'Wingers')},
 defenders:{label:'Defenders pack',blurb:'Centre-backs and full-backs. A 9v9 back three moves together to cover space.',spec:themed(['centerback','fullback'],'Defenders')},
 midfield:{label:'Midfield pack',blurb:'Midfielders link defence and attack. A 4–3–3 relies on its midfield three.',spec:themed(['midfielder'],'Midfield')},
 strikers:{label:'Strikers pack',blurb:'Finishers from every era. Strikers find space in the box and take their chances.',spec:themed(['striker'],'Strikers')},
 keepers:{label:'Goalkeepers pack',blurb:'Goalkeepers are the last defender and the first attacker when they start a move.',spec:themed(['goalkeeper'],'Goalkeepers')},
 eras:{label:'Two eras pack',blurb:'One all-time great with two of today’s players: see how the game has changed.',spec:{size:3,legends:CARD_ENTRIES.filter(c=>c.era==='allTime'&&!legendFor(c.name)&&!c.futsal).map(c=>c.name),regular:regularCurrent.filter(n=>!CARD_ENTRIES.find(c=>c.name===n)?.futsal),theme:'Two eras'}},
};

const gearItem=(item:StoreItem):VendingItem=>{
 const special=item.category==='ball'&&SPECIAL_BALL_IDS.has(item.option.id);
 return {id:item.id,row:special?'special':item.category,label:item.option.label,kind:'gear',storeItem:item,
  price:special?VENDING_PRICES.specialBall:VENDING_PRICES[item.category],
  blurb:special?ballLessons[item.option.id as VendingSpecialBall]:item.description};
};
const costumeItem=(id:string):VendingItem=>{
 const island=getIslandCostume(id),club=getCostume(id);
 return {id:`costume:${id}`,row:'costume',kind:'costume',costume:id,price:VENDING_PRICES.costume,label:island.name,
  blurb:club?`${island.animalLabel} costume in ${club.club} colours. Football history: ${club.name} (${club.country}).`:`${island.animalLabel} costume, the reward for finding every hidden ball on the island.`};
};
const ordered=[...CLUB_COSTUMES].sort((a,b)=>(COSTUME_UNLOCK_ORDER as readonly string[]).indexOf(a.id)-(COSTUME_UNLOCK_ORDER as readonly string[]).indexOf(b.id)).map(c=>c.id);
/** Regular catalogue: identical in every machine. */
export const VENDING_ITEMS:VendingItem[]=[
 ...MYSTERY_PACK_OPTIONS.map(o=>({id:`pack:${o.size}`,row:'packs' as const,kind:'pack' as const,price:o.price,label:`${o.size}-card mystery pack`,
  blurb:o.size===3?'One legend and two player cards, each with a football lesson.':'Five cards with at least one legend. Every legend has a mental-strength note.',
  pack:{size:o.size,legends:LEGEND_PACK_CANDIDATES,regular:regularCurrent}})),
 ...STORE_ITEMS.map(gearItem).filter(i=>i.row!=='special'),
 ...[...ordered,COIN_REWARD_ID].map(costumeItem),
];
/** Specials: each sold at exactly one machine. */
export const VENDING_SPECIALS:VendingItem[]=VENDING_MACHINES.flatMap(m=>m.specials.map(id=>{
 const display=homeDisplays.find(i=>i.id===id);if(display)return display;
 if(id.startsWith('ball:'))return {...gearItem(STORE_ITEMS.find(i=>i.id===id)!),machine:m.id};
 const key=id.slice(5),p=packLessons[key];
 return {id,row:'special' as const,kind:'pack' as const,price:MYSTERY_PACK_OPTIONS.find(o=>o.size===p.spec.size)!.price,label:p.label,blurb:p.blurb,pack:p.spec,machine:m.id};
}));
export const vendingItem=(id:string)=>VENDING_ITEMS.find(i=>i.id===id)??VENDING_SPECIALS.find(i=>i.id===id);
/** What one machine sells: its specials first, then its four pop-up books, then the regular rows. */
export function machineStock(id:VendingMachineId):{row:VendingRowId;label:string;items:VendingItem[]}[]{
 const books=(MACHINE_BOOKS[id]??[]).map(b=>VENDING_SPECIALS.find(i=>i.id===PLAYER_BOOKS[b].itemId)!).filter(Boolean);
 return [{row:'special',label:'Specials · only here',items:VENDING_SPECIALS.filter(i=>i.machine===id&&i.kind!=='display')},{row:'books',label:'Pop-up books',items:books},
  ...VENDING_ROWS.map(r=>({row:r.id,label:r.label,items:VENDING_ITEMS.filter(i=>i.row===r.id)}))];
}
/** A store-era item id (`ball:frost`, `costume:x`, `packs:legend`) → the vending item id. */
export function vendingItemFor(storeId:string|undefined):string|undefined{
 if(!storeId)return undefined;if(storeId==='packs:legend'||storeId.startsWith('packs'))return 'pack:3';
 return vendingItem(storeId)?.id;
}

/**
 * Locked hint for the machine's LED (Sep 30 2026, E2E audit: a child could page to a screen where every item said LOCKED with no
 * hint). Given the armed item's status and the statuses on the page, returns the LED message to show, or null when nothing needs
 * a hint: the armed item when it is locked, else (nothing armed) the nearest unlock when the page has locked items and nothing to
 * buy (the rest already yours). The hint comes from the unlock rules (rideUnlockHint / costumeUnlockHint): `short` fits the LED's
 * one-line message ("Locked: finish 1 more path"), the sub-line says how; `need` is paths or balls still to go.
 */
export type VendingLockStatus={kind:string;note:string;short?:string;need?:number};
export function vendingLockLed(armed:{label:string;status:VendingLockStatus}|null,page:VendingLockStatus[]):{msg:string;sub:string;tone:'warn'}|null{
 const lower=(t:string)=>t.charAt(0).toLowerCase()+t.slice(1),line=(s:VendingLockStatus)=>`Locked: ${lower(s.short??s.note)}`;
 const tip=(note:string)=>/path/i.test(note)?'Any path counts: tap Paths.':/ball/i.test(note)?'Hunt for hidden balls!':'';
 if(armed){if(armed.status.kind!=='locked')return null;return {msg:line(armed.status),sub:`${armed.label}. ${tip(armed.status.note)}`.trim(),tone:'warn'};}
 const locked=page.filter(s=>s.kind==='locked');
 if(!locked.length||page.some(s=>s.kind==='buy'||s.kind==='short'))return null;
 const next=[...locked].sort((a,b)=>(a.need??Infinity)-(b.need??Infinity))[0];
 return {msg:line(next),sub:`Nothing to buy yet. ${tip(next.note)}`.trim(),tone:'warn'};
}
