/**
 * Fishing rules (pure: no React, no storage, no three.js) so tests can run them directly.
 * Design + economy: docs/fishing.md. Species, spots and the verified club facts: ./fishCatalog.ts.
 *
 * The catch is a timing game played live in the 3D island: cast, a fish shadow notices the float and swims over (from a
 * different direction each time, on a curved or wandering path; big or rare animals may circle the float once), it
 * nibbles 1-4 times (small bobs), then really bites (the float plunges). Tap during the bite window to hook it, then tap
 * Reel a number of times that grows with the animal (commons 2-3 ... legendary animals and sharks 10-14). Bigger animals
 * pull back if you pause. Tapping on a nibble scares the fish; tapping late lets it swim off. Nothing is ever lost.
 *
 * Kid safety: catch weights are internal only (never shown), and every phase ends on its own, so nothing loops forever.
 */
import {FISH,FISH_SPOTS,SHADOW_LENGTH,fishById,type FishId,type FishSpot,type FishRarity,type FishSpecies} from './fishCatalog';
import {distanceToShore,onIsland} from '../shoreline';
import {BOAT_AFLOAT,onBoatHull} from './deepSeaBoatData';
import {underEastPier} from '../eastPier';

/** Where the float lands: out past the shoreline in the spot's casting direction (the pier spots cast over the sand; the
 *  Deep Sea Boat casts over its own rail). */
export function castPoint(spot:FishSpot,from:{x:number;z:number}){
 const dx=spot.buoy.x-spot.x,dz=spot.buoy.z-spot.z,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
 let d=1;while(d<30&&(onIsland(from.x+ux*d,from.z+uz*d)||onBoatHull(from.x+ux*d,from.z+uz*d)||underEastPier(from.x+ux*d,from.z+uz*d)))d+=.5;
 const reach=Math.min(d+3.2,30);return {x:from.x+ux*reach,z:from.z+uz*reach,dir:{x:ux,z:uz},distance:reach};
}
/**
 * Open water for a shadow: off the island polygon (which already contains the piers, the ferry dock, the harbour wall
 * and the rock spots) and at least WATER_MARGIN metres from the shoreline, so a shadow never swims over sand or rocks.
 */
export const WATER_MARGIN=.8;
/** The East Pier's planks (eastPier.ts) are skipped like the island: floats clear them and shadows never swim under them.
 *  Things that float in open water outside the island outline (the moored matchday ferry, lib/town/world.ts, and the Deep Sea
 *  Boat, ./deepSeaBoatData.ts), plus a margin. */
const AFLOAT=[{x0:240.5,x1:251.5,z0:189,z1:209},BOAT_AFLOAT];
export const inOpenWater=(x:number,z:number)=>!onIsland(x,z)&&!underEastPier(x,z)&&!AFLOAT.some(b=>x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)&&distanceToShore(x,z)>=WATER_MARGIN;
/** Legacy single start point (kept as the last-resort fallback of planApproach): along the shore, in open water. */
export function shadowSpawn(cast:{x:number;z:number;dir:{x:number;z:number}},rand:()=>number,inWater:(x:number,z:number)=>boolean=inOpenWater){
 const sx=cast.dir.z,sz=-cast.dir.x;
 for(let k=0;k<8;k++){const across=(1.9+rand()*1.3)*(k<4?1:-1),out=.3+rand()*1.2,x=sx*across+cast.dir.x*out,z=sz*across+cast.dir.z*out;if(inWater(cast.x+x,cast.z+z)&&inWater(cast.x+x*1.2,cast.z+z*1.2))return {x,z};}
 return {x:cast.dir.x*3.5,z:cast.dir.z*3.5};
}

// ---- Approach paths: every cast, the shadow comes from a new direction on a curved, wandering line ----
export type Vec={x:number;z:number};
export type ApproachPath={points:Vec[];circles:boolean;angle:number};
/** Chance (internal, never shown) that a big or rare animal circles the float once before it nibbles. */
const CIRCLE_CHANCE:Record<FishRarity,number>={common:0,uncommon:0,rare:.6,legendary:1};
const circles=(f:FishSpecies)=>f.group==='shark'?.85:CIRCLE_CHANCE[f.rarity];
/**
 * Plan a shadow's route to the float (points relative to the float at 0,0; the last point is where its mouth meets the
 * float). A random compass angle and start distance, a sideways wander that fades as it nears the float, and (for big or
 * rare animals) one loop round the float. Every sampled point is checked against the spot's open water, so a shadow never
 * starts or swims over land, piers or rocks. Bounded work: at most 24 tries of about 60 point checks, once per shadow.
 */
export function planApproach(cast:{x:number;z:number;dir:Vec},rand:()=>number,species:FishSpecies,inWater:(x:number,z:number)=>boolean=inOpenWater):ApproachPath{
 const length=SHADOW_LENGTH[species.shadow],mouth=length*.5+.05,loop=rand()<circles(species);
 const wet=(pts:Vec[])=>pts.every(p=>inWater(cast.x+p.x,cast.z+p.z));
 for(let attempt=0;attempt<24;attempt++){
  const withLoop=loop&&attempt<16,angle=rand()*Math.PI*2,dist=2.1+rand()*1.5+length*.5;
  const ux=Math.sin(angle),uz=Math.cos(angle),nx=uz,nz=-ux,amp=(.3+rand()*.6)*(rand()<.5?-1:1),waves=rand()<.5?1:2;
  const radius=withLoop?Math.max(1.05,mouth+.7):mouth,pts:Vec[]=[];
  // 1. Swim in from the start to the loop radius (or straight to the mouth), wandering sideways.
  for(let i=0;i<=16;i++){const t=i/16,r=dist+(radius-dist)*t,side=amp*Math.sin(Math.PI*waves*t)*(1-t);pts.push({x:ux*r+nx*side,z:uz*r+nz*side});}
  if(withLoop){
   // 2. One full loop round the float, then 3. a short spiral in to the mouth.
   const turn=rand()<.5?1:-1,a0=Math.atan2(pts[pts.length-1].x,pts[pts.length-1].z);
   for(let i=1;i<=24;i++){const a=a0+turn*Math.PI*2*i/24;pts.push({x:Math.sin(a)*radius,z:Math.cos(a)*radius});}
   for(let i=1;i<=6;i++){const t=i/6,a=a0+turn*(Math.PI*2+Math.PI*.5*t),r=radius+(mouth-radius)*t;pts.push({x:Math.sin(a)*r,z:Math.cos(a)*r});}
  }
  if(wet(pts))return {points:pts,circles:withLoop,angle};
 }
 // Fallback: straight in from the legacy along-shore start (already checked for water).
 const p=shadowSpawn(cast,rand,inWater),d=Math.hypot(p.x,p.z)||1,pts:Vec[]=[];
 for(let i=0;i<=8;i++){const r=d+(mouth-d)*i/8;pts.push({x:p.x/d*r,z:p.z/d*r});}
 return {points:pts,circles:false,angle:Math.atan2(p.x,p.z)};
}

/** Internal weighted pick for a spot. Odds are never shown to the player. */
export function rollCatch(spot:FishSpot,rand:number):FishId{
 const weighted=(Object.entries(spot.weights) as [FishId,number][]);
 const total=weighted.reduce((a,[,w])=>a+w,0);let pick=Math.max(0,Math.min(.999999,rand))*total;
 for(const [id,w] of weighted){if(pick<w)return id;pick-=w;}
 return weighted[weighted.length-1][0];
}
/** Bigger fish are rarer; size never changes the price (fixed prices keep selling simple). */
export function rollSize(id:FishId,rand:number){const f=fishById(id)!;const r=Math.max(0,Math.min(1,rand));return Math.round((f.size[0]+(f.size[1]-f.size[0])*r**1.6)*10)/10;}

// ---- Session: the live catch timing ----
export type SessionPhase='ready'|'casting'|'floating'|'approach'|'nibble'|'bite'|'reeling'|'scared'|'escaped'|'caught';
export type SessionEvent='splash'|'notice'|'nibble'|'bite'|'escaped'|'scared'|'hooked'|'reel'|'reeled-in'|'cast'|'pull';
/** Reaction window after the real bite: about 0.6-1 s (shorter for rarer animals), a little longer in easy mode / reduced motion. */
export const BITE_WINDOW:Record<FishRarity,number>={common:1,uncommon:.9,rare:.8,legendary:.7};
export const EASY_BONUS=.35;
export const CAST_TIME=.7,FLEE_TIME=1.3;
export const REEL_IDLE_LIMIT=8,REEL_TAP_GAP=.12;
export const CATCH_READ_TIME=3,CATCH_TAP_QUIET=.7;
/** Reel taps needed after the hook, by rarity (sharks always reel like legendary animals). The size of the catch picks the number in the range. */
export const REEL_TAPS:Record<FishRarity,[number,number]>={common:[2,3],uncommon:[4,5],rare:[6,8],legendary:[10,14]};
export const reelRange=(f:FishSpecies):[number,number]=>f.group==='shark'?REEL_TAPS.legendary:REEL_TAPS[f.rarity];
export function reelTapsFor(f:FishSpecies,sizeCm:number){const [lo,hi]=reelRange(f),k=Math.max(0,Math.min(1,(sizeCm-f.size[0])/Math.max(1e-6,f.size[1]-f.size[0])));return lo+Math.round((hi-lo)*k);}
/**
 * Resistance: after a pause of `delay` seconds without a reel tap, bigger animals slowly pull line back (`rate` taps a
 * second). Kid-fair: commons never pull, progress never drops below zero, and the only "fail" is the same gentle escape
 * as a late tap after REEL_IDLE_LIMIT seconds of no tapping at all (nothing is lost; another fish comes).
 */
export const REEL_PULL:Record<FishRarity,{delay:number;rate:number}|null>={common:null,uncommon:{delay:1.8,rate:.7},rare:{delay:1.4,rate:1},legendary:{delay:1.1,rate:1.3}};
export const pullFor=(f:FishSpecies)=>f.group==='shark'?REEL_PULL.legendary:REEL_PULL[f.rarity];
/** Swim speed (m/s) by rarity: rarer animals are faster (sharks fastest). */
export const SWIM_SPEED:Record<FishRarity,number>={common:.9,uncommon:1,rare:1.2,legendary:1.5};
const speedOf=(f:FishSpecies)=>f.group==='shark'?1.6:SWIM_SPEED[f.rarity];
export type Shadow={x:number;z:number;heading:number;alpha:number;length:number;
 /** The planned route (relative to the float) and the index of the next point. */
 path:Vec[];next:number;circles:boolean;
 /** Open-water direction (away from the shore): scared and escaping fish flee this way, never over land. */
 out:Vec};
export type Session={phase:SessionPhase;t:number;wait:number;fish:{id:FishId;size:number}|null;shadow:Shadow|null;nibblesLeft:number;nextNibble:number;window:number;nibbles:number;dip:number;idleEscapes:number;reelTaps:number;reelTarget:number;reelIdle:number;reelCooldown:number;pulling:boolean};
/** After this many fish swim off with no tap at all, the line is reeled in (no endless cycle if a child puts the phone down). */
export const IDLE_ESCAPES=3;
export type SessionOptions={
 /** The shadow's route to the float at (0,0); the world passes planApproach with its water test. */
 approach:(rand:()=>number,species:FishSpecies)=>ApproachPath;
 /** Open-water direction at the spot (the cast direction). */
 out?:Vec;
 easy?:boolean;
};
export const createSession=():Session=>({phase:'ready',t:0,wait:0,fish:null,shadow:null,nibblesLeft:0,nextNibble:0,window:0,nibbles:0,dip:0,idleEscapes:0,reelTaps:0,reelTarget:0,reelIdle:0,reelCooldown:0,pulling:false});
const go=(s:Session,phase:SessionPhase)=>{s.phase=phase;s.t=0;};
const newWait=(s:Session,rand:()=>number,base=1.2)=>{s.wait=base+rand()*2.3;};
/** Point the shadow so that it flees away from the float and towards open water (heading+PI is the flee direction). */
function aimFlee(sh:Shadow){const d=Math.hypot(sh.x,sh.z)||1,fx=sh.x/d+sh.out.x*1.2,fz=sh.z/d+sh.out.z*1.2;sh.heading=Math.atan2(-fx,-fz);}

/** Advance by dt seconds. Returns the events that happened this step (the world turns them into splashes, bobs and sounds). */
export function stepSession(s:Session,spot:FishSpot,dt:number,rand:()=>number,o:SessionOptions):SessionEvent[]{
 const ev:SessionEvent[]=[],step=Math.max(0,Math.min(dt,.1));s.t+=step;s.dip=Math.max(0,s.dip-step*4);s.reelCooldown=Math.max(0,s.reelCooldown-step);
 const sh=s.shadow;
 switch(s.phase){
  case 'casting':if(s.t>=CAST_TIME){go(s,'floating');newWait(s,rand);ev.push('splash');}break;
  case 'floating':if(s.t>=s.wait){
   const id=rollCatch(spot,rand()),f=fishById(id)!,route=o.approach(rand,f),p=route.points[0],q=route.points[1]??{x:0,z:0};
   s.fish={id,size:rollSize(id,rand())};
   s.shadow={x:p.x,z:p.z,heading:Math.atan2(q.x-p.x,q.z-p.z),alpha:0,length:SHADOW_LENGTH[f.shadow],path:route.points,next:1,circles:route.circles,out:o.out??{x:-p.x/(Math.hypot(p.x,p.z)||1),z:-p.z/(Math.hypot(p.x,p.z)||1)}};
   go(s,'approach');ev.push('notice');}break;
  case 'approach':if(sh&&s.fish){
   const f=fishById(s.fish.id)!;let move=speedOf(f)*step;
   sh.alpha=Math.min(1,sh.alpha+step*1.5);
   // Follow the planned route point by point; the heading is the direction of travel (nose first).
   while(move>0&&sh.next<sh.path.length){const t=sh.path[sh.next],dx=t.x-sh.x,dz=t.z-sh.z,d=Math.hypot(dx,dz);
    if(d>1e-6)sh.heading=Math.atan2(dx,dz);
    if(d<=move){sh.x=t.x;sh.z=t.z;move-=d;sh.next++;}else{sh.x+=dx/d*move;sh.z+=dz/d*move;move=0;}}
   if(sh.next>=sh.path.length){sh.heading=Math.atan2(-sh.x,-sh.z);
    s.nibblesLeft=f.rarity==='legendary'?2+Math.floor(rand()*3):1+Math.floor(rand()*4);s.nextNibble=.6;go(s,'nibble');}
  }break;
  case 'nibble':if(s.t>=s.nextNibble){
   if(s.nibblesLeft>0){s.nibblesLeft--;s.nibbles++;s.dip=1;ev.push('nibble');const leg=s.fish&&fishById(s.fish.id)!.rarity==='legendary';s.nextNibble=s.t+(leg?.45+rand()*.45:.7+rand()*.6);}
   else{const r=fishById(s.fish!.id)!.rarity;s.window=BITE_WINDOW[r]+(o.easy?EASY_BONUS:0);go(s,'bite');ev.push('bite');}
  }break;
  case 'bite':if(s.t>=s.window){s.idleEscapes++;if(sh)aimFlee(sh);go(s,'escaped');ev.push('escaped');}break;
  case 'reeling':{s.reelIdle+=step;
   const f=s.fish?fishById(s.fish.id):undefined,pull=f?pullFor(f):null;
   // Resistance: a big animal pulls line back while you pause (never below zero, never loses anything by itself).
   const pulling=!!pull&&s.reelIdle>=pull.delay&&s.reelTaps>0;
   if(pulling){s.reelTaps=Math.max(0,s.reelTaps-pull!.rate*step);if(!s.pulling)ev.push('pull');}
   s.pulling=pulling;
   if(s.reelIdle>=REEL_IDLE_LIMIT){s.idleEscapes++;s.pulling=false;if(sh)aimFlee(sh);go(s,'escaped');ev.push('escaped');}break;}
  case 'scared':case 'escaped':
   if(sh){const flee=(s.phase==='scared'?3.2:2.2)*step;sh.x+=Math.sin(sh.heading+Math.PI)*flee;sh.z+=Math.cos(sh.heading+Math.PI)*flee;sh.alpha=Math.max(0,1-s.t/FLEE_TIME);}
   if(s.t>=FLEE_TIME){s.shadow=null;s.fish=null;if(s.idleEscapes>=IDLE_ESCAPES){s.idleEscapes=0;go(s,'ready');ev.push('reeled-in');}else{go(s,'floating');newWait(s,rand,1.5);}}break;
 }
 return ev;
}
/** The one button (Reel / Space / tap on the water). */
export function tapSession(s:Session):SessionEvent|null{
 s.idleEscapes=0;
 // A burst of reel taps must never skip the catch fact. Require both time to
 // read and a short pause in tapping before an intentional new cast.
 if(s.phase==='caught'&&(s.t<CATCH_READ_TIME||s.reelCooldown>0)){s.reelCooldown=CATCH_TAP_QUIET;return null;}
 switch(s.phase){
  case 'ready':case 'caught':s.fish=s.phase==='caught'?null:s.fish;s.shadow=null;s.nibbles=0;s.reelTaps=s.reelTarget=s.reelIdle=s.reelCooldown=0;s.pulling=false;go(s,'casting');return 'cast';
  case 'floating':go(s,'ready');return 'reeled-in';
  case 'approach':case 'nibble':if(s.shadow)aimFlee(s.shadow);go(s,'scared');return 'scared';
  case 'bite':s.reelTaps=0;s.reelTarget=reelTapsFor(fishById(s.fish!.id)!,s.fish!.size);s.reelIdle=0;s.pulling=false;s.reelCooldown=REEL_TAP_GAP;go(s,'reeling');return 'reel';
  case 'reeling':if(s.reelCooldown>0)return null;s.reelTaps=Math.min(s.reelTarget,Math.floor(s.reelTaps+1+1e-9));s.reelIdle=0;s.pulling=false;s.reelCooldown=REEL_TAP_GAP;s.dip=1;
   if(s.reelTaps>=s.reelTarget){go(s,'caught');s.shadow=null;return 'hooked';}return 'reel';
  default:return null;
 }
}
/** Whole reel taps banked so far (the HUD meter moves in whole steps, so it never re-renders per frame). */
export const reelDone=(s:Session)=>Math.max(0,Math.floor(s.reelTaps+1e-9));
/** Seconds of the reaction window left while the float is under (for the HUD, never a countdown number). */
export const biteRemaining=(s:Session)=>s.phase==='bite'?Math.max(0,s.window-s.t):0;

// ---- Fishbook: the collection log (caught / not yet, biggest size). ----
export const FISHBOOK_STORAGE_KEY='fi2-fishbook-v1';
export type FishbookEntry={count:number;biggest:number;first:number};
export type Fishbook={version:1;species:Partial<Record<FishId,FishbookEntry>>;total:number};
export const emptyFishbook=():Fishbook=>({version:1,species:{},total:0});
const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export function sanitizeFishbook(value:unknown):Fishbook{
 const v=value&&typeof value==='object'?value as Partial<Fishbook>:{},out=emptyFishbook();
 const species=v.species&&typeof v.species==='object'?v.species as Record<string,Partial<FishbookEntry>>:{};
 for(const f of FISH){const e=species[f.id];if(!e||typeof e!=='object')continue;const count=whole(e.count,1e6);if(!count)continue;
  const big=typeof e.biggest==='number'&&Number.isFinite(e.biggest)?Math.max(0,Math.min(f.size[1],Math.round(e.biggest*10)/10)):0;
  out.species[f.id]={count,biggest:big,first:whole(e.first,9e15)};}
 out.total=Math.max(whole(v.total),Object.values(out.species).reduce((a,e)=>a+(e?.count??0),0));
 return out;
}
export type CatchRecord={book:Fishbook;isNew:boolean;isBiggest:boolean};
export function recordCatch(book:Fishbook,id:FishId,size:number,now:number):CatchRecord{
 const f=fishById(id);if(!f)return {book,isNew:false,isBiggest:false};
 const prev=book.species[id],s=Math.max(0,Math.min(f.size[1],Math.round(size*10)/10));
 const entry:FishbookEntry={count:(prev?.count??0)+1,biggest:Math.max(prev?.biggest??0,s),first:prev?.first||now};
 return {book:{...book,species:{...book.species,[id]:entry},total:book.total+1},isNew:!prev,isBiggest:!!prev&&s>prev.biggest};
}
/** Merge two saved books (two tabs): keep the larger count and biggest fish of each species. */
export function mergeFishbooks(a:Fishbook,b:Fishbook):Fishbook{
 const out=emptyFishbook();
 for(const f of FISH){const x=a.species[f.id],y=b.species[f.id];if(!x&&!y)continue;
  out.species[f.id]={count:Math.max(x?.count??0,y?.count??0),biggest:Math.max(x?.biggest??0,y?.biggest??0),first:Math.min(x?.first||Infinity,y?.first||Infinity)===Infinity?0:Math.min(x?.first||Infinity,y?.first||Infinity)};}
 out.total=Math.max(a.total,b.total,Object.values(out.species).reduce((n,e)=>n+(e?.count??0),0));
 return out;
}
export const speciesCaught=(book:Fishbook)=>FISH.filter(f=>(book.species[f.id]?.count??0)>0).length;
/** Where a not-yet-caught species can be found (a gentle exploration hint, never odds). */
export const spotsFor=(id:FishId)=>{const f=fishById(id);return f?FISH_SPOTS.filter(s=>f.spots.includes(s.id)):[];};
