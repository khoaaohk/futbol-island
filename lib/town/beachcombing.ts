/**
 * Beachcombing (Oct 14 2026, user: "have the player find on the beach like star fish, sea shells, and other related animals to fish
 * so they can sell. stagger that throughout the mountain island and other islands"). Design: docs/beachcombing.md.
 *
 * Pure rules, no three.js and no DOM (tests/beachcombing.cjs): the finds table, the beaches (zones) and their candidate spots on the
 * sand, the daily rotation, the welfare rules, the save and the HUD bridge. Runtime (meshes, sparkles, prompt, pickup animation):
 * lib/graphics/beachFinds.ts. UI: components/BeachcombHud.tsx, components/Shellbook.tsx.
 *
 * Economy: every number a find is worth lives in BEACH_FINDS[].value (ONE table, for the economy agent). Sellable finds become
 * basket goods (lib/town/market/goods.ts BEACH_GOODS, kind 'beach'), so Rosa's stand, the daily full-price allowance and the
 * Training meter apply as for fish and fruit. A living animal's `value` is its one-off "Kind to sea life" reward instead.
 *
 * Teaching (AGENTS.md): every find has a true sea fact and a football tip (a coaching point or a Law of the Game); the welfare rule
 * ("only take empty shells") is taught on the first living animal.
 */
import {SHORE_SAND,NORTH_BEACH_UMBRELLAS,NORTH_BEACH_PATHS,onIsland,distanceToShore} from './shoreline';
import {CAY_SAND,CAY_HUTS,CAY_HUT_RADIUS,onCay,onCourtBeach,onCauseway,distanceToCayShore} from './coralCay';
import {SUMMIT_CENTER,SUMMIT_PATHS,SUMMIT_PATH_WIDTH,SUMMIT_VISUAL_DROP,SANDBAR_PATH,sandbarHalfWidth,beachPoint,summitGround,summitSlope,onSummitIsle,onSummitSandbar,distanceToSummitShore,type IslePoint} from './summitIsle';
import {FISH_SPOTS} from './fishing/fishCatalog';
import {beachFindValue} from '../economy';
import {count} from '../analytics/tracker';

export const BEACH_SAVE_KEY='fi2-beachcomb-v1';
export type BeachKind='sandy'|'rocky'|'coral';
export type BeachRarity='common'|'uncommon'|'rare'|'legendary';
/** sell: an empty shell or a thing (goes in the basket); putBack: a living animal (shown, then put back gently, small kindness
 *  reward); look: look, never touch (spiny), Shellbook only. */
export type BeachCare='sell'|'putBack'|'look';
export type BeachShape='scallop'|'spiral'|'glass'|'driftwood'|'mussel'|'crab'|'cowrie'|'sanddollar'|'starfish'|'hermit'|'conch'|'urchin'|'golden';
export type BeachFind={
 id:string;name:string;plural:string;rarity:BeachRarity;care:BeachCare;
 /** Beach types it turns up on (each zone has one type: Summit Isle's coves are rocky, Coral Cay is coral sand). */
 beaches:BeachKind[];
 /** COINS (placeholder, economy agent may retune HERE ONLY): the basket price of a sellable find at full price, or the one-off
  *  kindness reward for putting a living animal back. 0 for look-only. */
  value:number;
 /** Optional internal pick weight (overrides BEACH_RARITY_WEIGHT; never shown). */
 weight?:number;
 /** Swatch for the HUD, the stand and the 3D model. */
 color:string;
 shape:BeachShape;
 /** A true, kid-sized sea fact. */
 fact:string;
 /** The football link: a coaching point or a Law of the Game (AGENTS.md). */
 football:string;
};
/** Internal pick weights (never shown; the Shellbook shows the rarity as a word). */
export const BEACH_RARITY_WEIGHT:Record<BeachRarity,number>={common:10,uncommon:5,rare:2,legendary:.6};
export const BEACH_RARITY_LABEL:Record<BeachRarity,string>={common:'Common find',uncommon:'Uncommon find',rare:'Rare find',legendary:'Legendary find'};

/** THE table. Prices: a find is less effort than a catch, so each sits just under a fish of the same rarity (fish: 3–4 / 5–6 / 9–10 / 12).
 *  Oct 14 2026 economy pass: each row's `value` below is replaced by lib/economy.ts beachFindValue (BEACH_FIND_VALUE, by id, then by
 *  care and rarity), the game's one coin table; the literals stay as the original design notes. */
const BEACH_TABLE:readonly BeachFind[]=[
 {id:'scallop-shell',name:'Scallop shell',plural:'Scallop shells',rarity:'common',care:'sell',beaches:['sandy','coral'],value:2,color:'#f2a37e',shape:'scallop',
  fact:'A living scallop can swim by clapping its two shells together.',
  football:'Its ridges fan out from one point, like a team spreading wide to make the pitch big in attack.'},
 {id:'spiral-shell',name:'Spiral shell',plural:'Spiral shells',rarity:'common',care:'sell',beaches:['sandy','rocky'],value:2,color:'#e3c08f',shape:'spiral',
  fact:'A sea snail’s shell grows in a spiral, adding a new ring as the snail gets bigger.',
  football:'Skills grow the same way: a little practice every day adds a ring at a time.'},
 {id:'sea-glass',name:'Sea glass',plural:'Sea glass',rarity:'common',care:'sell',beaches:['sandy','rocky'],value:2,color:'#7fcfbf',shape:'glass',
  fact:'Sea glass is old glass that waves and sand have rubbed smooth and frosty over many years.',
  football:'Practice smooths your first touch the same way: repeat it and the rough edges wear away.'},
 {id:'driftwood',name:'Driftwood',plural:'Driftwood',rarity:'common',care:'sell',beaches:['sandy'],value:2,color:'#a98a68',shape:'driftwood',
  fact:'Driftwood is wood carried by the sea. It can float for months before it washes up.',
  football:'Early goals were two wooden posts with a tape across the top, before the crossbar became the rule.'},
 {id:'mussel-shell',name:'Mussel shell',plural:'Mussel shells',rarity:'common',care:'sell',beaches:['rocky'],value:2,color:'#33405e',shape:'mussel',
  fact:'Mussels hold on to rocks with strong threads, even when big waves crash over them.',
  football:'Stay close like a mussel when you mark a player at a corner: goal side and touching distance.'},
 {id:'shore-crab',name:'Shore crab',plural:'Shore crabs',rarity:'common',care:'putBack',beaches:['sandy','rocky','coral'],weight:6,value:1,color:'#d8573c',shape:'crab',
  fact:'Crabs walk sideways because their legs bend best that way.',
  football:'Defenders shuffle sideways too: stay side-on to the attacker so you can turn quickly either way.'},
 {id:'cowrie-shell',name:'Cowrie shell',plural:'Cowrie shells',rarity:'uncommon',care:'sell',beaches:['coral'],value:3,color:'#d99b62',shape:'cowrie',
  fact:'Cowries are so smooth and shiny that people once used them as money.',
  football:'Keep it smooth and simple: short, tidy passes keep the ball for your team.'},
 {id:'sand-dollar',name:'Sand dollar',plural:'Sand dollars',rarity:'uncommon',care:'sell',beaches:['sandy','coral'],value:3,color:'#efe6cf',shape:'sanddollar',
  fact:'An empty sand dollar is white with a five-petal flower on top. A living one is fuzzy and purple-brown: leave those in the sea.',
  football:'Round like a ball! A full-size (size 5) match ball must measure 68–70 cm around (Law 2).'},
 {id:'starfish',name:'Starfish',plural:'Starfish',rarity:'uncommon',care:'putBack',beaches:['sandy','coral'],value:1,color:'#ee7d45',shape:'starfish',
  fact:'A starfish has no brain and can grow back a lost arm. It needs sea water, so it goes straight back.',
  football:'Five arms, one star: a team works best when every part moves together.'},
 {id:'hermit-crab',name:'Hermit crab',plural:'Hermit crabs',rarity:'uncommon',care:'putBack',beaches:['coral','sandy'],value:1,color:'#e2733f',shape:'hermit',
  fact:'A hermit crab moves into a bigger empty shell as it grows, so empty shells are its future homes.',
  football:'Like a hermit crab trying shells, young players try different positions until one fits.'},
 {id:'conch-shell',name:'Conch shell',plural:'Conch shells',rarity:'rare',care:'sell',beaches:['coral','rocky'],value:5,color:'#f3a3a0',shape:'conch',
  fact:'Blow into the end of a big conch shell and it booms like a horn.',
  football:'Talk on the pitch as loud as a conch: call “Man on!” or “Time!” to help a teammate.'},
 {id:'sea-urchin',name:'Sea urchin',plural:'Sea urchins',rarity:'rare',care:'look',beaches:['rocky'],value:0,color:'#4f2f63',shape:'urchin',
  fact:'A sea urchin’s spines keep it safe, and they are sharp: look, but never touch.',
  football:'Spines protect an urchin; shin pads protect you. Every player must wear them (Law 4).'},
 {id:'golden-cowrie',name:'Golden cowrie',plural:'Golden cowries',rarity:'legendary',care:'sell',beaches:['coral','rocky'],value:10,color:'#f2bf3c',shape:'golden',
  fact:'The golden cowrie is one of the rarest shells. In Fiji only chiefs were allowed to wear it.',
  football:'Rare like the Golden Boot, the prize for a tournament’s top goal scorer.'},
];
export const BEACH_FINDS:readonly BeachFind[]=BEACH_TABLE.map(f=>({...f,value:beachFindValue(f)}));
export const beachFindById=(id:string)=>BEACH_FINDS.find(f=>f.id===id);
export const SELLABLE_FINDS=BEACH_FINDS.filter(f=>f.care==='sell');
export const LIVING_FINDS=BEACH_FINDS.filter(f=>f.care==='putBack');

export const BEACHCOMB={
 /** The prompt shows within this many metres of a find (on foot). */
 reach:2.6,
 /** Finds of one day stand at least this far apart. */
 spacing:8,
 /** Stay clear of fishing posts (their Fish prompt) by this much. */
 fishClear:6,
 /** Sparkles show on finds within this distance of the player. */
 sparkle:45,maxSparkles:12,
 /** At most this many golden cowries a day across all the islands. */
 goldenPerDay:1,
} as const;
export const BEACH_TIP='Only take empty shells! Living animals go back gently where they live.';
export const BEACH_FIRST_TIP='Beach finds go in your basket. Sell them at Rosa’s market stand, and see them all in your Shellbook.';

// ---- The beaches (zones) and their candidate spots ----
export type BeachIsland='main'|'cay'|'summit';
export type BeachZone={id:string;name:string;island:BeachIsland;kind:BeachKind;perDay:number};
/** Finds a day per beach (docs/beachcombing.md): 23 in all, Summit Isle (with its sandbar) the most. */
export const BEACH_ZONES:readonly BeachZone[]=[
 {id:'summit-beach',name:'Summit Isle beach',island:'summit',kind:'sandy',perDay:5},
 {id:'summit-coves',name:'Summit Isle coves',island:'summit',kind:'rocky',perDay:4},
 {id:'summit-sandbar',name:'Summit Sandbar',island:'summit',kind:'sandy',perDay:1},
 {id:'cay-beach',name:'Coral Cay beach',island:'cay',kind:'coral',perDay:7},
 {id:'north-beach',name:'North Beach',island:'main',kind:'sandy',perDay:4},
 {id:'south-beach',name:'South Beach',island:'main',kind:'sandy',perDay:2},
];
export const BEACH_ISLAND_NAME:Record<BeachIsland,string>={main:'Futbol Island',cay:'Coral Cay',summit:'Summit Isle'};
export type BeachCandidate={key:string;zone:string;x:number;z:number;/** visual sand height under it */y:number;/** unit direction to the sea (a living find is put back that way) */sx:number;sz:number};
/** Summit Isle's boulder coves: its three shore fishing posts stand on them (fishCatalog FISH_SPOTS, area 'summit'). */
export const SUMMIT_COVES:IslePoint[]=FISH_SPOTS.filter(s=>(s as {area?:string}).area==='summit').map(s=>({x:s.x,z:s.z}));
const COVE_RADIUS=38;
const SAND_Y=-.105;
const nearCove=(x:number,z:number,r=COVE_RADIUS)=>SUMMIT_COVES.some(c=>Math.hypot(c.x-x,c.z-z)<r);
const lerp=(a:{x:number;z:number},b:{x:number;z:number},f:number)=>({x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f});
const segDist=(x:number,z:number,a:IslePoint,b:IslePoint)=>{const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);};
const summitPathDistance=(x:number,z:number)=>{let d=Infinity;for(const p of SUMMIT_PATHS)for(let i=0;i<p.length-1;i++)d=Math.min(d,segDist(x,z,p[i],p[i+1]));return d;};
/** Tide-line fractions from the water's edge (0) to the back of the sand (1): never in the swash, never on the lawn. */
const BANDS=[.32,.5,.68];

/** Every candidate spot of a zone (pure geometry, deterministic). The world checks (colliders, paths) come after: spotOk. */
export function zoneCandidates(zone:BeachZone):BeachCandidate[]{
 const out:BeachCandidate[]=[],push=(x:number,z:number,y:number,k:number,sx:number,sz:number)=>{const l=Math.hypot(sx,sz)||1;out.push({key:`${zone.id}:${k}`,zone:zone.id,x:Math.round(x*100)/100,z:Math.round(z*100)/100,y,sx:sx/l,sz:sz/l});};
 if(zone.id==='north-beach'||zone.id==='south-beach'){
  SHORE_SAND.forEach((s,i)=>{const north=s.outer.z< -195,south=s.outer.z>110&&s.outer.x<55;if(zone.id==='north-beach'?!north:!south)return;
   BANDS.forEach((f,b)=>{const p=lerp(s.outer,s.inner,f+(i%2?.04:-.04));push(p.x,p.z,SAND_Y,i*3+b,s.outer.x-s.inner.x,s.outer.z-s.inner.z);});});
 }else if(zone.id==='cay-beach'){
  CAY_SAND.forEach((s,i)=>{if(i%2)return;BANDS.forEach((f,b)=>{const p=lerp(s.outer,s.inner,f*.9);push(p.x,p.z,SAND_Y,i*3+b,s.outer.x-s.inner.x,s.outer.z-s.inner.z);});});
 }else if(zone.id==='summit-beach'||zone.id==='summit-coves'){
  const N=144;for(let k=0;k<N;k++){const a=k/N*Math.PI*2;BANDS.forEach((f,b)=>{const p=beachPoint(a,f);// a gap of one find spacing between the coves and the sandy beach, so the two zones' finds never crowd each other
   if(zone.id==='summit-coves'?!nearCove(p.x,p.z):nearCove(p.x,p.z,COVE_RADIUS+8))return;
   push(p.x,p.z,summitGround(p.x,p.z)-SUMMIT_VISUAL_DROP,k*3+b,Math.cos(a),Math.sin(a));});}
 }else if(zone.id==='summit-sandbar'){
  // The open middle of the bar only (its ends flare into Coral Cay's and the island's own beaches, which have their own finds).
  const S=SANDBAR_PATH,L=S[S.length-1].s;for(let i=1;i<S.length-1;i+=2){if(S[i].s<26||S[i].s>L-28)continue;const p=S[i],q=S[i+1],o=S[i-1],tx=q.x-o.x,tz=q.z-o.z,tl=Math.hypot(tx,tz)||1,nx=tz/tl,nz=-tx/tl;
   for(const side of [-1,1]){const d=side*Math.min(1.5,sandbarHalfWidth(p.s)*.45);push(p.x+nx*d,p.z+nz*d,-.13,i*2+(side>0?1:0),nx*side,nz*side);}}
 }
 return out;
}

/** The world the spot checks need (Town passes the real one; tests build the town and pass the same). */
export type BeachWorld={
 /** A collider (or a building, a wall) within `pad` metres. */
 blocked:(x:number,z:number,pad:number)=>boolean;
 /** A path, road, court, patio, pitch or other laid surface within `pad` metres. */
 paved:(x:number,z:number,pad:number)=>boolean;
};
/** Metres from the water's edge: a find never sits in the swash. */
const WATER_CLEAR=1.5;
/** The island-level rules every spot must pass (pure: sand only, never water, paths, courts, huts or fishing posts). */
export function onBeachSand(c:Pick<BeachCandidate,'zone'|'x'|'z'>):boolean{
 const {x,z}=c;
 if(FISH_SPOTS.some(s=>Math.hypot(s.x-x,s.z-z)<BEACHCOMB.fishClear))return false;
 switch(c.zone){
  case 'north-beach':case 'south-beach':
   if(!onIsland(x,z)||distanceToShore(x,z)<WATER_CLEAR)return false;
   if(NORTH_BEACH_UMBRELLAS.some(u=>Math.hypot(u.x-x,u.z-z)<2.6))return false;
   if(NORTH_BEACH_PATHS.some(p=>Math.abs(p.x-x)<p.w/2+1.2&&Math.abs(p.z-z)<p.d/2+1.2))return false;
   return true;
  case 'cay-beach':
   return onCay(x,z)&&distanceToCayShore(x,z)>=WATER_CLEAR&&!onCourtBeach(x,z)&&!onCauseway(x,z)&&!CAY_HUTS.some(h=>Math.hypot(h.x-x,h.z-z)<CAY_HUT_RADIUS+2);
  case 'summit-beach':case 'summit-coves':
   // The beach ring is gentle and low; a find never sits on a slope, a ledge or a trail.
   return onSummitIsle(x,z)&&distanceToSummitShore(x,z)>=WATER_CLEAR&&summitGround(x,z)<2.4&&summitSlope(x,z)<.35&&summitPathDistance(x,z)>SUMMIT_PATH_WIDTH/2+1.4&&Math.hypot(x-SUMMIT_CENTER.x,z-SUMMIT_CENTER.z)>20;
  case 'summit-sandbar':return onSummitSandbar(x,z)&&!onCay(x,z)&&!onSummitIsle(x,z);
 }
 return false;
}
export function spotOk(c:BeachCandidate,w:BeachWorld):boolean{return onBeachSand(c)&&!w.blocked(c.x,c.z,.7)&&!w.paved(c.x,c.z,1);}

// ---- The daily rotation (deterministic per local day: the same finds on every device, new places tomorrow) ----
/** FNV-1a 32-bit. */
export function hashString(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return h>>>0;}
/** mulberry32 from a seed: 0..1. */
export function seeded(seed:number){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function localBeachDay(now:number){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export type BeachSpot=BeachCandidate&{find:string};
/** The find on one spot today: weighted by rarity among the zone's beach type. `noGolden` when today's golden cowrie is taken. */
export function findFor(day:string,key:string,kind:BeachKind,noGolden=false):string{
 const pool=BEACH_FINDS.filter(f=>f.beaches.includes(kind)&&!(noGolden&&f.shape==='golden'));
 const w=(f:BeachFind)=>f.weight??BEACH_RARITY_WEIGHT[f.rarity],total=pool.reduce((n,f)=>n+w(f),0);let r=seeded(hashString(day+'|find|'+key))()*total;
 for(const f of pool){r-=w(f);if(r<0)return f.id;}
 return pool[pool.length-1].id;
}
/** The one zone (coral or rocky) where today's golden cowrie may turn up: at most BEACHCOMB.goldenPerDay a day over all the islands. */
export function goldenZone(day:string,zones:readonly BeachZone[]=BEACH_ZONES){const ok=zones.filter(z=>beachFindById('golden-cowrie')!.beaches.includes(z.kind));return ok.length?ok[hashString(day+'|golden')%ok.length].id:'';}
/** One zone's spots today from its valid candidates: a seeded shuffle per zone and day, kept at least BEACHCOMB.spacing apart,
 *  zone.perDay of them, each with its find. Independent per zone, so each island is built on its own when the player nears it. */
export function zoneSpots(day:string,zone:BeachZone,valid:readonly BeachCandidate[]):BeachSpot[]{
 const list=[...valid],rnd=seeded(hashString(day+'|zone|'+zone.id));
 for(let i=list.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[list[i],list[j]]=[list[j],list[i]];}
 const picked:BeachCandidate[]=[];
 for(const c of list){if(picked.length>=zone.perDay)break;if(picked.some(p=>Math.hypot(p.x-c.x,p.z-c.z)<BEACHCOMB.spacing))continue;picked.push(c);}
 let golden=goldenZone(day)===zone.id?0:BEACHCOMB.goldenPerDay;
 return picked.map(c=>{const find=findFor(day,c.key,zone.kind,golden>=BEACHCOMB.goldenPerDay);if(find==='golden-cowrie')golden++;return {...c,find};});
}
/** Every zone's spots today. */
export function spotsForDay(day:string,valid:Record<string,readonly BeachCandidate[]>,zones:readonly BeachZone[]=BEACH_ZONES):BeachSpot[]{return zones.flatMap(z=>zoneSpots(day,z,valid[z.id]??[]));}

// ---- Save: today's taken spots, the Shellbook, the tips ----
export type ShellbookEntry={found:number;putBack:number;first:string};
export type BeachSave={version:1;day:string;taken:string[];book:Record<string,ShellbookEntry>;tip:boolean;kind:boolean};
export const emptyBeach=(now:number):BeachSave=>({version:1,day:localBeachDay(now),taken:[],book:{},tip:false,kind:false});
const whole=(v:unknown,max=1e6)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const SPOT_KEY=/^[a-z-]{4,20}:\d{1,5}$/;
export function sanitizeBeach(v:unknown,now:number):BeachSave{
 const o=v&&typeof v==='object'?v as Partial<BeachSave>:{},out=emptyBeach(now);
 // Taken spots are today's only: a new day brings new finds.
 if(o.day===out.day&&Array.isArray(o.taken))out.taken=[...new Set(o.taken.filter((k):k is string=>typeof k==='string'&&SPOT_KEY.test(k)))].slice(0,80);
 if(o.book&&typeof o.book==='object')for(const [id,e] of Object.entries(o.book as Record<string,unknown>)){if(!beachFindById(id)||!e||typeof e!=='object')continue;
  const r=e as Partial<ShellbookEntry>;const found=whole(r.found);if(!found)continue;
  out.book[id]={found,putBack:Math.min(found,whole(r.putBack)),first:typeof r.first==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.first)?r.first:out.day};}
 out.tip=o.tip===true;out.kind=o.kind===true;
 return out;
}
export function readBeach(now:number,read:()=>string|null=()=>localStorage.getItem(BEACH_SAVE_KEY)):BeachSave{try{return sanitizeBeach(JSON.parse(read()??'null'),now);}catch{return emptyBeach(now);}}
export function writeBeach(s:BeachSave,write:(v:string)=>void=v=>localStorage.setItem(BEACH_SAVE_KEY,v)){try{write(JSON.stringify(s));}catch{/* private mode: the find still counts this visit */}}
/** A find taken from its spot today (picked up, put back or looked at): recorded in the Shellbook and the spot is empty till tomorrow. */
export function recordFind(s:BeachSave,spot:string,id:string,now:number):BeachSave{
 const day=localBeachDay(now),f=beachFindById(id);if(!f)return s;
 const taken=s.day===day?s.taken:[];if(taken.includes(spot))return s;
 const prev=s.book[id]??{found:0,putBack:0,first:day};
 const zone=BEACH_ZONES.find(z=>z.id===spot.split(':')[0]);if(zone)count('bc:pickup_'+zone.island);// admin analytics: a beach find picked up, by island
 return {...s,day,taken:[...taken,spot],book:{...s.book,[id]:{...prev,found:prev.found+1,putBack:prev.putBack+(f.care==='putBack'?1:0)}}};
}
export const takenToday=(s:BeachSave,now:number)=>s.day===localBeachDay(now)?s.taken:[];
export const speciesFound=(s:BeachSave)=>Object.keys(s.book).filter(id=>s.book[id].found>0).length;
/** Where a find lives, for the Shellbook (from the zones' beach types). */
export function findPlaces(f:BeachFind):string[]{const out:string[]=[];for(const z of BEACH_ZONES)if(f.beaches.includes(z.kind)&&!(z.id==='summit-sandbar'))out.push(z.name);return out;}

/** The prompt's words for a find. */
export function promptLabel(f:BeachFind){return f.care==='sell'?`Pick up the ${f.name.toLowerCase()}`:f.care==='putBack'?`Put the ${f.name.toLowerCase()} back gently`:`Look at the ${f.name.toLowerCase()}`;}
/** The note after taking a find (the tip on the first time; the welfare rule on the first living animal). */
export function findNote(f:BeachFind,o:{added:boolean;first:boolean;firstKind:boolean;coins:number}):{title:string;detail:string}{
 if(f.care==='sell'){if(!o.added)return {title:'Your basket is full!',detail:'Sell some at Rosa’s market stand, then come back for it. It will wait here today.'};
  return {title:`+1 ${f.name}`,detail:o.first?BEACH_FIRST_TIP:`${f.fact} ${f.football}`};}
 if(f.care==='putBack')return {title:`You put the ${f.name.toLowerCase()} back gently${o.coins?` · +${o.coins} coin${o.coins===1?'':'s'}`:''}`,detail:o.firstKind?`${BEACH_TIP} ${f.fact}`:`${f.fact} ${f.football}`};
 return {title:`A ${f.name.toLowerCase()}! Look, don’t touch`,detail:`${f.fact} ${f.football}`};
}

// ---- HUD bridge (components/BeachcombHud.tsx): written only on change, never per frame ----
export type BeachView={label:string;/** the latest note and a counter that changes with each */note:{title:string;detail:string;merge?:string}|null;notes:number;bookOpen:boolean};
const IDLE:BeachView={label:'Pick up the shell',note:null,notes:0,bookOpen:false};
let view=IDLE;const listeners=new Set<()=>void>();
export const beachStore={
 get:()=>view,server:()=>IDLE,
 set(patch:Partial<BeachView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 note(n:{title:string;detail:string;merge?:string}){view={...view,note:n,notes:view.notes+1};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view={...IDLE,bookOpen:view.bookOpen};listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
/** The prompt's tap; the runtime installs the real one while the island is up. */
export const beachActions={take:()=>{}};
/** Open the Shellbook from anywhere (the pocket, the stand, a note). */
export const OPEN_SHELLBOOK='fi2-open-shellbook';
