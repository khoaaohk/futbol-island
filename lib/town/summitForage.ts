/**
 * Summit Isle foraging (Oct 13 2026, user: "for the mountain island, let's have the trees have fruit on some of them for the
 * character to forage and collect … shake the tree to have it drop to pick up"). Pure rules: which of the island's trees bear
 * fruit, how much hangs on each, the day's fruiting trees, the daily cap and the save. The 3D runtime (fruit, sway, falls, pickups) is
 * lib/graphics/fruitTrees.ts; the prompt and notes are components/ForagePrompt.tsx; tests: tests/summit-forage.cjs.
 *
 * Economy (docs/economy, lib/town/market/market.ts): picked fruit goes into the shared market basket (the HUD's "fruit and
 * vegetables" count), sold at the farm stands like any produce, so the market's daily full-price allowance and the Training meter
 * still apply on top. FORAGE.dailyCap keeps it a treat, not a farm: 8 fruit ≈ 10 coins at full price since the Oct 14 2026 rebalance
 * (lib/economy.ts PRODUCE_SELL: everyday fruit 1, big island fruit 2; was ≈ 24), below a lesson or a hidden ball per minute. Nothing is ever lost: fruit shaken down but not
 * picked up goes back up its tree.
 *
 * Oct 14 2026: the orchard (lib/town/summitOrchard.ts: seven plant forms along the trail, the summit and the beaches) and eight
 * fruit kinds; each day a different ~60% of the fruit trees carry fruit (seeded by the local day and the tree), and fruit picked
 * today stays gone until tomorrow (the old 20-minute regrow clock is folded into the day). The prompt also shows riding a ground
 * ride or flying low (the runtime hops the player off or lands them first), and the hands grip the trunk (contactAt).
 *
 * Teaching (AGENTS.md): the first pick says why footballers eat fruit (carbohydrate = sprint fuel; each good's own lesson in
 * lib/town/market/goods.ts plays on each pickup).
 */
import type {IslePoint} from './summitIsle';
import type {OrchardForm,TreeRig} from './summitOrchard';
import {FORAGE_DAILY_CAP} from '../economy';

export const FORAGE_SAVE_KEY='fi2-summit-forage-v1';
export type FruitKind='mango'|'orange'|'coconut'|'banana'|'papaya'|'lime'|'guava'|'avocado';
export const FRUIT_KINDS:readonly FruitKind[]=['mango','orange','coconut','banana','papaya','lime','guava','avocado'];
export const FORAGE={
 /** The island's own round trees and coconut palms picked as fruit trees, on top of every orchard plant (lib/town/summitOrchard.ts). */
 trees:12,palms:6,
 /** Most fruit a tree carries on a day it fruits (2 or 3, seeded per day and tree). */
 perTree:3,
 /** Share of the fruit trees that carry fruit on a given day (the rest are bare until another day): exploring matters. */
 fruiting:.6,fruitingMin:.5,fruitingMax:2/3,
 /** Fruit a player can forage per local day (the shake still plays after that, with a friendly note). The number lives in
  *  lib/economy.ts FORAGE_DAILY_CAP (Oct 14 2026 rebalance; fruit now sells for 1–2 coins, so a full day is ~10 coins). */
 dailyCap:FORAGE_DAILY_CAP,
 /** The "Shake the tree" prompt shows within this many metres of the trunk on foot, riding (scooter, bike, moped) and flying low
  *  (jetpack or parachute, at most `flyHeight` m over the ground: Summit Isle's flight lift holds the jetpack ~15–21 m over its
  *  beaches and foothills, so that hover band and a parachute's glide count as "low"; the 28 m cruise over the sand does not). */
 reach:3.4,reachRide:4.6,reachFly:5.5,flyHeight:24,
 /** Hands-on: the character's chest is this far from the bark when gripping the trunk (trunk radius + this, from its axis). */
 contact:.25,
 /** Fallen fruit is picked up when the player comes this close (kids just walk over it). */
 pickup:1.5,
 /** Fruit that falls per shake. */
 dropMin:1,dropMax:3,
 /** A kicked ball that hits a fruit tree at least this fast (m/s) shakes it: 1 fruit, 2 from `ballHard` m/s. */
 ballMin:4,ballHard:9,
 /** Go this far from fallen fruit and it goes back up its tree (nothing is lost). */
 forget:30,
 /** The island's own trees picked as fruit trees stand at least this far apart (and from the orchard). */
 spacing:16,
} as const;
/** The walker's collider radius and the trunk collider's clearance (lib/town/simulation.ts walk radius and TRUNK_CLEARANCE):
 *  the character's root never enters the trunk's collider; the last few centimetres to the bark are the pose's lean. */
export const WALKER_RADIUS=.32,TRUNK_CLEARANCE=.3;
/** The fruit's surface pattern in the shared fruit shader (lib/graphics/fruitTrees.ts): a stem spot, a banana's dark ends, a
 *  coconut's fibres, a mango's red blush, a papaya's green shoulders, a guava's dark crown at its base. */
export const FRUIT_PATTERN={plain:0,banana:1,coconut:2,mango:3,papaya:4,guava:5} as const;
export type FruitLook={
 /** Size in metres (a little larger than life so it reads from the follow camera ~25–40 m away). */
 r:number;
 /** The shape, in units of r (one shared low-poly mesh bent per instance in the vertex shader): half-length along the stem axis,
  *  cross-section radius, `bend` = half the arc's angle in radians (a mango's kidney curve, a banana's crescent), `taper` = the
  *  pear's narrowing toward the stem (0 round). */
 elong:number;width:number;bend:number;taper:number;pattern:number;
 color:string;
 /** Bananas: a greener yellow while hanging on the plant (yellow once picked off the ground). */
 hangColor?:string;
 tree:string;
};
/** In-world look of each fruit; `tree` names the plant in the prompt ("Shake the banana plant"). Bananas hang as hands of 4–6
 *  curved fingers up a stalk and fall as single fingers or small hands of 2–3 (lib/graphics/fruitTrees.ts BANANA). */
export const FRUIT_LOOK:Record<FruitKind,FruitLook>={
 mango:{r:.2,elong:1.28,width:.88,bend:.32,taper:.08,pattern:FRUIT_PATTERN.mango,color:'#f4b23a',tree:'mango tree'},// an oval, a little kidney-curved, a red blush
 orange:{r:.23,elong:.97,width:1,bend:0,taper:0,pattern:FRUIT_PATTERN.plain,color:'#f28526',tree:'orange tree'},
 coconut:{r:.25,elong:1.1,width:1,bend:0,taper:.06,pattern:FRUIT_PATTERN.coconut,color:'#8d5a2e',tree:'coconut palm'},// brown and fibrous
 banana:{r:.22,elong:1.1,width:.27,bend:.85,taper:0,pattern:FRUIT_PATTERN.banana,color:'#f7d940',hangColor:'#d5d544',tree:'banana plant'},// one finger
 papaya:{r:.19,elong:1.7,width:.98,bend:0,taper:.38,pattern:FRUIT_PATTERN.papaya,color:'#f0a03a',tree:'papaya tree'},// a long pear, green shoulders
 lime:{r:.15,elong:1.08,width:1,bend:0,taper:0,pattern:FRUIT_PATTERN.plain,color:'#7cc43c',tree:'lime tree'},// small and bright
 guava:{r:.19,elong:1.08,width:1,bend:0,taper:.22,pattern:FRUIT_PATTERN.guava,color:'#c9dd6e',tree:'guava tree'},// a round pear, pale yellow-green
 avocado:{r:.18,elong:1.42,width:.92,bend:0,taper:.42,pattern:FRUIT_PATTERN.plain,color:'#36541f',tree:'avocado tree'},// a dark green pear
};
export const FORAGE_TIP='Fruit is great fuel before a match! Eat it from your pocket, or sell it at a farm stand.';

/** A baked tree or palm on Summit Isle (lib/town/summitIsleWorld.ts SUMMIT_TREE_SITES): the island's own round trees and palms
 *  (no `form`) and the orchard's plants (`form`, `fruit`). `tid`: its id in the baked props' sway attribute. */
export type TreeSite={kind:'tree'|'palm';x:number;z:number;y:number;size:number;seed:number;top:{x:number;y:number;z:number};tid:number;rig:TreeRig;form?:OrchardForm;fruit?:FruitKind};
export type FruitTree=TreeSite&{id:string;fruit:FruitKind;
 /** The character's root when gripping from the preferred side (clear of every collider), and every side it can grip from. */
 stand:{x:number;z:number};sides:number[];
 /** The welcome tree (nearest the sandbar landing): it fruits every day, so a first visit always finds one. */
 welcome?:boolean};
export type ForageWorld={
 /** Walkable ground (Summit Isle's onSummitIsle: the beach and slopes gentle enough to walk). */
 walkable:(x:number,z:number)=>boolean;
 /** A collider in the way of a walker (trunks, bushes, rocks). */
 blocked:(x:number,z:number)=>boolean;
 ground:(x:number,z:number)=>number;
 paths:readonly (readonly IslePoint[])[];
 /** Where the sandbar from Coral Cay lands (the first fruit tree is the one nearest it). */
 landing:IslePoint;
 /** The open beach straight down the slope from (x, z) (Summit Isle's beachPoint on that bearing). */
 beach:(x:number,z:number)=>IslePoint;
 /** How much of the follow camera's offset stays clear of the hillside for a player standing here (summitCameraPull: 1 = the
  *  normal view). Trees where the camera would be pulled in tight against the slope are skipped: the canopy must be seen. */
 view?:(x:number,z:number,y:number)=>number;
};
/** The follow camera's offset from the player (Town's walk camera: ~17 m east, 23 m up, ~31 m south). */
export const FOLLOW_CAMERA={x:17,y:23,z:31.5} as const;
/** Fruit trees need at least this much of the camera's offset clear (the fruit and the shake are in view). */
export const MIN_VIEW=.6;
const STAND_DIRS=16;
/**
 * Gripping the trunk from bearing `a` (radians, trunk → character): the hands-on `contact` point (the chest, FORAGE.contact from
 * the bark at grip height), the character's `root` on that line but clear of the trunk's collider (base radius + clearance +
 * the walker's radius), and the `lean` the pose closes from root to contact (metres, ~0.4).
 */
export function contactAt(site:Pick<TreeSite,'x'|'z'|'rig'>,a:number){
 const g=site.rig.grip,dx=Math.cos(a),dz=Math.sin(a),reach=g.r+FORAGE.contact,minRoot=site.rig.baseR+TRUNK_CLEARANCE+WALKER_RADIUS+.04;
 const contact={x:g.x+dx*reach,z:g.z+dz*reach};let t=reach;
 for(let i=0;i<80&&Math.hypot(g.x+dx*t-site.x,g.z+dz*t-site.z)<minRoot;i++)t+=.02;
 return {contact,root:{x:g.x+dx*t,z:g.z+dz*t},lean:t-reach,face:Math.atan2(-dx,-dz)};
}
/** Where the character can grip this trunk from: every clear, walkable side (bearings), and the one nearest `prefer` (its root). */
export function standSpot(s:TreeSite,w:ForageWorld,prefer:IslePoint|null=null):{stand:{x:number;z:number};sides:number[]}|null{
 const base=prefer?Math.atan2(prefer.z-s.rig.grip.z,prefer.x-s.rig.grip.x):0;let best:{x:number;z:number}|null=null,bestD=Infinity;const sides:number[]=[];
 for(let k=0;k<STAND_DIRS;k++){const a=base+(k%2?1:-1)*Math.ceil(k/2)*Math.PI*2/STAND_DIRS,{root:{x,z}}=contactAt(s,a);
  if(w.blocked(x,z)||Math.abs(w.ground(x,z)-s.y)>.6||!w.walkable(x,z))continue;
  // Room to walk up to it too: a clear step a metre further out.
  const ox=x+Math.cos(a),oz=z+Math.sin(a);if(w.blocked(ox,oz)||!w.walkable(ox,oz))continue;
  sides.push(a);const d=prefer?Math.hypot(prefer.x-x,prefer.z-z):k;if(d<bestD){bestD=d;best={x,z};}}
 return best?{stand:best,sides}:null;
}
const nearestPathPoint=(x:number,z:number,paths:ForageWorld['paths'])=>{let best:IslePoint|null=null,d=Infinity;for(const p of paths)for(const q of p){const e=Math.hypot(q.x-x,q.z-z);if(e<d){d=e;best=q;}}return {p:best,d};};
/** A straight, clear walk (walkable and free of colliders every metre: trunk colliders are ≥ 1 m across) from a to b. */
export function clearWalk(a:IslePoint,b:IslePoint,w:ForageWorld){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)));
 for(let i=1;i<n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n;if(w.blocked(x,z)||!w.walkable(x,z))return false;}return true;}
/** Fruit for the island's own round trees picked as fruit trees (cycled, so any area has a mix). */
export const ROUND_TREE_FRUIT:readonly FruitKind[]=['mango','orange','guava','avocado','lime'];
/**
 * Picks the fruit trees: every orchard plant (lib/town/summitOrchard.ts places them by its own rules) plus FORAGE.trees of the
 * island's round trees and FORAGE.palms of its palms, spread out. Deterministic (same island → same trees on every device). Each
 * must have a side to grip it from, a straight clear walk to a trail within 25 m or down to the open beach, and a camera view of it.
 * The one nearest the sandbar landing is the welcome tree.
 */
export function pickFruitTrees(sites:readonly TreeSite[],w:ForageWorld):FruitTree[]{const g=fruitTreeSteps(sites,w);let r=g.next();while(!r.done)r=g.next();return r.value;}
/** pickFruitTrees one tree check at a time (it yields after each), so the runtime can spread the choice over a few frames. */
export function* fruitTreeSteps(sites:readonly TreeSite[],w:ForageWorld):Generator<void,FruitTree[],void>{
 // Heat: the walk and view checks are the costly part, so a tree is checked only when the spread reaches it (and only once).
 const memo=new Map<TreeSite,FruitTree|null>();let round=0;
 const check=(s:TreeSite):FruitTree|null=>{
  const near=nearestPathPoint(s.x,s.z,w.paths),toPath=near.p&&near.d<25?near.p:null,beach=w.beach(s.x,s.z);
  const spot=standSpot(s,w,toPath??beach);if(!spot)return null;const stand=spot.stand;
  if(w.view&&w.view(stand.x,stand.z,w.ground(stand.x,stand.z))<MIN_VIEW)return null;
  const ok=!!toPath&&clearWalk(stand,toPath,w)||Math.hypot(beach.x-stand.x,beach.z-stand.z)<60&&w.walkable(beach.x,beach.z)&&clearWalk(stand,beach,w);
  return ok?{...s,id:`${s.kind}-${Math.round(s.x)}-${Math.round(s.z)}`,fruit:s.fruit??(s.kind==='palm'?'coconut':'mango'),stand,sides:spot.sides}:null;};
 function* valid(s:TreeSite):Generator<void,FruitTree|null,void>{if(!memo.has(s)){memo.set(s,check(s));yield;}return memo.get(s)!;}
 const L=w.landing,dist=(a:IslePoint,b:IslePoint)=>Math.hypot(a.x-b.x,a.z-b.z);
 const orchard:FruitTree[]=[];for(const s of sites)if(s.form){const f=yield* valid(s);if(f)orchard.push(f);}
 /** Greedy farthest-point spread over the trees that pass; `taken` (already picked) counts for the spacing too. */
 function* spread(kind:'tree'|'palm',count:number,taken:FruitTree[]):Generator<void,FruitTree[],void>{
  const list=sites.filter(s=>!s.form&&s.kind===kind&&(kind==='palm'||s.y>=.6&&s.y<=36)),picked:FruitTree[]=[];
  if(!taken.length)for(const s of [...list].sort((a,b)=>dist(a,L)-dist(b,L))){const f=yield* valid(s);if(f){picked.push(f);break;}}
  while(picked.length<count){const all=[...taken,...picked];let got:FruitTree|null=null;
   const order=list.filter(s=>!picked.some(p=>p.x===s.x&&p.z===s.z)).map(s=>({s,d:all.length?Math.min(...all.map(p=>dist(p,s))):Infinity})).filter(o=>o.d>FORAGE.spacing).sort((a,b)=>b.d-a.d);
   for(const o of order){const f=yield* valid(o.s);if(f){got=f;break;}}
   if(!got)break;picked.push(got);}
  return picked;}
 const trees=(yield* spread('tree',FORAGE.trees,orchard)).map(t=>({...t,fruit:ROUND_TREE_FRUIT[round++%ROUND_TREE_FRUIT.length]}));
 // Palms keep their spacing from each other only: the beach's grass edge has orchard plants, the dune line its palms.
 const palms=yield* spread('palm',FORAGE.palms,[]);
 const all=[...orchard,...trees,...palms];
 if(all.length){let best=all[0];for(const t of all)if(dist(t,L)<dist(best,L))best=t;best.welcome=true;}
 return all;
}

// ---- The day's fruit (Oct 14 2026, user: "have the fruits respawn each day at different spots") ----
/** The game's local day key (local midnight, like the market's and the jobs' daily allowances: lib/town/jobs/jobEconomy.ts). */
export function localForageDay(now:number){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
/** A stable 0..1 number for (day, tree id, salt): FNV-1a. Same all day on every device, different tomorrow. */
export function dayHash(day:string,id:string,salt=0){let h=2166136261^salt;const s=day+'|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>15;h=Math.imul(h,2246822507);h^=h>>>13;return (h>>>0)/4294967296;}
/** How many of `n` fruit trees fruit on a day (FORAGE.fruiting, kept within fruitingMin..fruitingMax). */
export const fruitingCount=(n:number)=>n?Math.max(Math.ceil(n*FORAGE.fruitingMin),Math.min(Math.floor(n*FORAGE.fruitingMax),Math.round(n*FORAGE.fruiting))):0;
/** The trees carrying fruit today (the welcome tree always; the rest by the day's hash). */
export function fruitingToday(trees:readonly {id:string;welcome?:boolean}[],day:string):Set<string>{
 const n=fruitingCount(trees.length),out=new Set<string>();for(const t of trees)if(t.welcome)out.add(t.id);
 for(const t of [...trees].sort((a,b)=>dayHash(day,a.id)-dayHash(day,b.id))){if(out.size>=n)break;out.add(t.id);}
 return out;
}
/** Fruit a fruiting tree carries at dawn today (2 or 3). */
export const fruitToday=(day:string,id:string)=>FORAGE.perTree-(dayHash(day,id,7)<.4?1:0);

// ---- Save: per tree, fruit picked today (it stays gone until tomorrow); today's count; whether the first-pick tip was shown. ----
export type ForageSave={version:1;day:string;today:number;tip:boolean;trees:Record<string,{n:number;t:number}>};
export const emptyForage=(now:number):ForageSave=>({version:1,day:localForageDay(now),today:0,tip:false,trees:{}});
const whole=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeForage(v:unknown,now:number):ForageSave{
 const o=v&&typeof v==='object'?v as Partial<ForageSave>:{},out=emptyForage(now);
 out.tip=o.tip===true;
 // A new day: every tree's picks are forgotten (the day's fruiting trees are a fresh set).
 if(o.day!==out.day)return out;
 out.today=whole(o.today,FORAGE.dailyCap);
 if(o.trees&&typeof o.trees==='object')for(const [id,e] of Object.entries(o.trees as Record<string,unknown>)){
  if(!/^(tree|palm)--?\d{1,4}--?\d{1,4}$/.test(id)||!e||typeof e!=='object')continue;const r=e as {n?:unknown;t?:unknown};
  const n=whole(r.n,FORAGE.perTree),t=typeof r.t==='number'&&Number.isFinite(r.t)&&r.t>0?Math.min(r.t,now):0;if(n>0&&t>0)out.trees[id]={n,t};
  if(Object.keys(out.trees).length>=120)break;}
 return out;
}
/** Fruit picked from a tree today (gone until tomorrow). */
export function pickedToday(save:ForageSave,id:string,now:number){return save.day===localForageDay(now)?save.trees[id]?.n??0:0;}
/** Fruit hanging on a tree right now, given what it carried at dawn (0 on a bare day). */
export const hangingNow=(save:ForageSave,id:string,now:number,dawn:number)=>Math.max(0,dawn-pickedToday(save,id,now));
/** Fruit still allowed today. */
export const capLeft=(save:ForageSave,now:number)=>save.day===localForageDay(now)?Math.max(0,FORAGE.dailyCap-save.today):FORAGE.dailyCap;
/** One fruit picked up from this tree: one fewer hangs there until tomorrow, and today's count goes up. */
export function recordPick(save:ForageSave,id:string,now:number):ForageSave{
 const day=localForageDay(now),same=save.day===day,today=(same?save.today:0)+1,trees=same?save.trees:{},n=(trees[id]?.n??0)+1;
 return {...save,day,today,trees:{...trees,[id]:{n:Math.min(FORAGE.perTree,n),t:now}}};
}
/** How many fruit one shake brings down: 1–3 (from `rand` in 0..1), never more than hang there or than today's cap allows. */
export function dropCount(rand:number,hanging:number,allowed:number){
 const want=FORAGE.dropMin+Math.min(FORAGE.dropMax-FORAGE.dropMin,Math.floor(Math.max(0,Math.min(.999,rand))*(FORAGE.dropMax-FORAGE.dropMin+1)));
 return Math.max(0,Math.min(want,hanging,allowed));
}
/** How many a kicked ball brings down: none under FORAGE.ballMin m/s, 1, or 2 from FORAGE.ballHard (same limits as a shake). */
export function ballDropCount(speed:number,hanging:number,allowed:number){
 const want=speed<FORAGE.ballMin?0:speed>=FORAGE.ballHard?2:1;return Math.max(0,Math.min(want,hanging,allowed));
}
export function readForage(now:number,read:()=>string|null=()=>localStorage.getItem(FORAGE_SAVE_KEY)):ForageSave{try{return sanitizeForage(JSON.parse(read()??'null'),now);}catch{return emptyForage(now);}}
export function writeForage(save:ForageSave,write:(v:string)=>void=v=>localStorage.setItem(FORAGE_SAVE_KEY,v)){try{write(JSON.stringify(save));}catch{/* private mode: the fruit still goes in the basket */}}

// ---- HUD bridge (components/ForagePrompt.tsx): written only on change, never per frame. ----
export type ForageView={
 /** The prompt's words ("Shake the mango tree"). */
 label:string;
 /** A short note ("+1 Mango", the first-time tip, "basket full") and a counter that changes with each note. */
 note:string;notes:number;
 /** The note is the first-time teaching tip (shown a little longer). */
 tip:boolean;
};
const IDLE:ForageView={label:'Shake the tree',note:'',notes:0,tip:false};
let view=IDLE;const listeners=new Set<()=>void>();
export const forageStore={
 get:()=>view,server:()=>IDLE,
 set(patch:Partial<ForageView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
};
/** The prompt's tap; the runtime installs the real one while the island is up. */
export const forageActions={shake:()=>{}};
