/**
 * Summit Isle foraging (Oct 13 2026, user: "for the mountain island, let's have the trees have fruit on some of them for the
 * character to forage and collect … shake the tree to have it drop to pick up"). Pure rules: which of the island's trees bear
 * fruit, how much hangs on each, the regrow clock, the daily cap and the save. The 3D runtime (fruit, sway, falls, pickups) is
 * lib/graphics/fruitTrees.ts; the prompt and notes are components/ForagePrompt.tsx; tests: tests/summit-forage.cjs.
 *
 * Economy (docs/economy, lib/town/market/market.ts): picked fruit goes into the shared market basket (the HUD's "fruit and
 * vegetables" count), sold at the farm stands like any produce, so the market's daily full-price allowance and the Training meter
 * still apply on top. FORAGE.dailyCap keeps it a treat, not a farm: 8 fruit ≈ 24 coins at full price for a few minutes of walking
 * between trees, in line with the island jobs' coins a minute (jobEconomy.ts). Nothing is ever lost: fruit shaken down but not
 * picked up goes back up its tree.
 *
 * Teaching (AGENTS.md): the first pick says why footballers eat fruit (carbohydrate = sprint fuel; each good's own lesson in
 * lib/town/market/goods.ts plays on each pickup).
 */
import type {IslePoint} from './summitIsle';

export const FORAGE_SAVE_KEY='fi2-summit-forage-v1';
export type FruitKind='mango'|'orange'|'coconut';
export const FORAGE={
 /** How many broad-leaved fruit trees and coconut palms are picked from the island's trees and palms. */
 trees:7,palms:3,
 /** Fruit on a full tree. */
 perTree:3,
 /** One fruit grows back on a tree every 20 real minutes (a picked-clean tree is full again in an hour). */
 regrowMs:20*60e3,
 /** Fruit a player can forage per local day (the shake still plays after that, with a friendly note). */
 dailyCap:8,
 /** The "Shake the tree" prompt shows within this many metres of the trunk (on foot). */
 reach:3.4,
 /** Where the character stands to push the trunk (trunk centre to feet, metres). */
 standOff:.9,
 /** Fallen fruit is picked up when the player comes this close (kids just walk over it). */
 pickup:1.5,
 /** Fruit that falls per shake. */
 dropMin:1,dropMax:3,
 /** Go this far from fallen fruit and it goes back up its tree (nothing is lost). */
 forget:30,
 /** Fruit trees stand at least this far apart (spread over the island, not one orchard). */
 spacing:22,
} as const;
/** In-world look of each fruit (radius in metres, a stretch for the long ones, its colour): a little larger than life so it reads
 *  from the follow camera ~38 m away. */
export const FRUIT_LOOK:Record<FruitKind,{r:number;stretch:[number,number,number];color:string;tree:string}>={
 mango:{r:.2,stretch:[1,1.35,1],color:'#f2a43a',tree:'mango tree'},
 orange:{r:.23,stretch:[1,1,1],color:'#f08a2c',tree:'orange tree'},
 coconut:{r:.25,stretch:[1,1.12,1],color:'#c98f3a',tree:'coconut palm'},// a golden king coconut: reads against the crown
};
export const FORAGE_TIP='Fruit is great fuel before a match! Eat it from your pocket, or sell it at a farm stand.';

/** A baked tree or palm on Summit Isle (lib/town/summitIsleWorld.ts SUMMIT_TREE_SITES). */
export type TreeSite={kind:'tree'|'palm';x:number;z:number;y:number;size:number;seed:number;top:{x:number;y:number;z:number}};
export type FruitTree=TreeSite&{id:string;fruit:FruitKind;stand:{x:number;z:number}};
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
/** Treeless and steep: where the character would stand to push this trunk, or null (cliff, rock, bush or another trunk). */
export function standSpot(s:{x:number;z:number;y:number},w:ForageWorld,prefer:IslePoint|null=null):{x:number;z:number}|null{
 const base=prefer?Math.atan2(prefer.z-s.z,prefer.x-s.x):0;let best:{x:number;z:number}|null=null,bestD=Infinity;
 for(let k=0;k<STAND_DIRS;k++){const a=base+(k%2?1:-1)*Math.ceil(k/2)*Math.PI*2/STAND_DIRS,x=s.x+Math.cos(a)*FORAGE.standOff,z=s.z+Math.sin(a)*FORAGE.standOff;
  if(w.blocked(x,z)||Math.abs(w.ground(x,z)-s.y)>.6||!w.walkable(x,z))continue;
  // Room to walk up to it too: a clear step a metre further out.
  const ox=s.x+Math.cos(a)*(FORAGE.standOff+1),oz=s.z+Math.sin(a)*(FORAGE.standOff+1);if(w.blocked(ox,oz)||!w.walkable(ox,oz))continue;
  const d=prefer?Math.hypot(prefer.x-x,prefer.z-z):k;if(d<bestD){bestD=d;best={x,z};}}
 return best;
}
const nearestPathPoint=(x:number,z:number,paths:ForageWorld['paths'])=>{let best:IslePoint|null=null,d=Infinity;for(const p of paths)for(const q of p){const e=Math.hypot(q.x-x,q.z-z);if(e<d){d=e;best=q;}}return {p:best,d};};
/** A straight, clear walk (walkable and free of colliders every metre: trunk colliders are ≥ 1 m across) from a to b. */
export function clearWalk(a:IslePoint,b:IslePoint,w:ForageWorld){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)));
 for(let i=1;i<n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n;if(w.blocked(x,z)||!w.walkable(x,z))return false;}return true;}
/**
 * Picks the fruit trees from the island's trees and palms. Deterministic (same island → same trees on every device). Rules:
 * broad-leaved trees on the lower slopes (base under 18 m, never on cliffs) and palms on the beach; a stand spot to push the trunk;
 * a straight clear walk to a trail within 25 m or down to the open beach (the beach rings the island and meets the sandbar), so a
 * child can always walk up to it; the follow camera has a clear view of it (not pulled in against the hillside); spread at least
 * FORAGE.spacing apart, starting from the one nearest the sandbar landing so a
 * first-time visitor meets one soon.
 */
export function pickFruitTrees(sites:readonly TreeSite[],w:ForageWorld):FruitTree[]{const g=fruitTreeSteps(sites,w);let r=g.next();while(!r.done)r=g.next();return r.value;}
/** pickFruitTrees one tree check at a time (it yields after each), so the runtime can spread the choice over a few frames. */
export function* fruitTreeSteps(sites:readonly TreeSite[],w:ForageWorld):Generator<void,FruitTree[],void>{
 // Heat: the walk and view checks are the costly part, so a tree is checked only when the spread reaches it (and only once).
 const memo=new Map<TreeSite,FruitTree|null>();
 const check=(s:TreeSite):FruitTree|null=>{
  const near=nearestPathPoint(s.x,s.z,w.paths),toPath=near.p&&near.d<25?near.p:null,beach=w.beach(s.x,s.z);
  const stand=standSpot(s,w,toPath??beach);if(!stand)return null;
  if(w.view&&w.view(stand.x,stand.z,w.ground(stand.x,stand.z))<MIN_VIEW)return null;
  const ok=!!toPath&&clearWalk(stand,toPath,w)||Math.hypot(beach.x-stand.x,beach.z-stand.z)<60&&w.walkable(beach.x,beach.z)&&clearWalk(stand,beach,w);
  return ok?{...s,id:`${s.kind}-${Math.round(s.x)}-${Math.round(s.z)}`,fruit:s.kind==='palm'?'coconut':'mango',stand}:null;};
 function* valid(s:TreeSite):Generator<void,FruitTree|null,void>{if(!memo.has(s)){memo.set(s,check(s));yield;}return memo.get(s)!;}
 const L=w.landing,dist=(a:IslePoint,b:IslePoint)=>Math.hypot(a.x-b.x,a.z-b.z);
 /** Greedy farthest-point spread over the trees that pass; `taken` (already picked) counts for the spacing too. */
 function* spread(kind:'tree'|'palm',count:number,taken:FruitTree[]=[]):Generator<void,FruitTree[],void>{
  const list=sites.filter(s=>s.kind===kind&&(kind==='palm'||s.y>=.6&&s.y<=18)),picked:FruitTree[]=[];
  if(!taken.length)for(const s of [...list].sort((a,b)=>dist(a,L)-dist(b,L))){const f=yield* valid(s);if(f){picked.push(f);break;}}
  while(picked.length<count){const all=[...taken,...picked];let got:FruitTree|null=null;
   const order=list.filter(s=>!picked.some(p=>p.x===s.x&&p.z===s.z)).map(s=>({s,d:Math.min(...all.map(p=>dist(p,s)))})).filter(o=>o.d>FORAGE.spacing).sort((a,b)=>b.d-a.d);
   for(const o of order){const f=yield* valid(o.s);if(f){got=f;break;}}
   if(!got)break;picked.push(got);}
  return picked;}
 const trees=(yield* spread('tree',FORAGE.trees)).map((t,i)=>({...t,fruit:(i%2?'orange':'mango') as FruitKind}));
 const palms=yield* spread('palm',FORAGE.palms,trees);
 return [...trees,...palms];
}

// ---- Save: per tree, how many fruit are missing and since when; today's count; whether the first-pick tip was shown. ----
export type ForageSave={version:1;day:string;today:number;tip:boolean;trees:Record<string,{n:number;t:number}>};
export function localForageDay(now:number){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const emptyForage=(now:number):ForageSave=>({version:1,day:localForageDay(now),today:0,tip:false,trees:{}});
const whole=(v:unknown,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeForage(v:unknown,now:number):ForageSave{
 const o=v&&typeof v==='object'?v as Partial<ForageSave>:{},out=emptyForage(now);
 if(o.day===out.day)out.today=whole(o.today,FORAGE.dailyCap);
 out.tip=o.tip===true;
 if(o.trees&&typeof o.trees==='object')for(const [id,e] of Object.entries(o.trees as Record<string,unknown>)){
  if(!/^(tree|palm)-\d{1,4}-\d{1,4}$/.test(id)||!e||typeof e!=='object')continue;const r=e as {n?:unknown;t?:unknown};
  const n=whole(r.n,FORAGE.perTree),t=typeof r.t==='number'&&Number.isFinite(r.t)&&r.t>0?Math.min(r.t,now):0;if(n>0&&t>0)out.trees[id]={n,t};
  if(Object.keys(out.trees).length>=40)break;}
 return out;
}
/** Fruit missing from a tree right now (it regrows one every FORAGE.regrowMs). */
export function missingNow(save:ForageSave,id:string,now:number){const e=save.trees[id];if(!e)return 0;return Math.max(0,e.n-Math.floor(Math.max(0,now-e.t)/FORAGE.regrowMs));}
/** Fruit hanging on a tree right now (before any that are lying on the ground under it). */
export const hangingNow=(save:ForageSave,id:string,now:number)=>FORAGE.perTree-missingNow(save,id,now);
/** When the next fruit grows back on this tree (epoch ms), or 0 when it is full. */
export function nextRegrowAt(save:ForageSave,id:string,now:number){const e=save.trees[id];if(!e||missingNow(save,id,now)<=0)return 0;return e.t+(Math.floor(Math.max(0,now-e.t)/FORAGE.regrowMs)+1)*FORAGE.regrowMs;}
/** Fruit still allowed today. */
export const capLeft=(save:ForageSave,now:number)=>save.day===localForageDay(now)?Math.max(0,FORAGE.dailyCap-save.today):FORAGE.dailyCap;
/** One fruit picked up from this tree: the tree is one short (keeping the regrow clock's progress) and today's count goes up. */
export function recordPick(save:ForageSave,id:string,now:number):ForageSave{
 const day=localForageDay(now),today=(save.day===day?save.today:0)+1,e=save.trees[id],miss=missingNow(save,id,now);
 // Keep the partial regrow progress: the clock restarts only when the tree was full.
 const t=!e||miss===0?now:e.t+Math.floor(Math.max(0,now-e.t)/FORAGE.regrowMs)*FORAGE.regrowMs;
 return {...save,day,today,trees:{...save.trees,[id]:{n:Math.min(FORAGE.perTree,miss+1),t}}};
}
/** How many fruit one shake brings down: 1–3 (from `rand` in 0..1), never more than hang there or than today's cap allows. */
export function dropCount(rand:number,hanging:number,allowed:number){
 const want=FORAGE.dropMin+Math.min(FORAGE.dropMax-FORAGE.dropMin,Math.floor(Math.max(0,Math.min(.999,rand))*(FORAGE.dropMax-FORAGE.dropMin+1)));
 return Math.max(0,Math.min(want,hanging,allowed));
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
