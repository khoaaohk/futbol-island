/**
 * Fishing rules (pure: no React, no storage, no three.js) so tests can run them directly.
 * Design + economy: docs/fishing.md. Species, spots and the verified club facts: ./fishCatalog.ts.
 *
 * The catch is a timing game played live in the 3D island: cast, a fish shadow notices the float and swims over, it
 * nibbles 1-4 times (small bobs), then really bites (the float plunges). Tap during the bite window to hook it, then tap repeatedly to reel it to shore. Tapping on a
 * nibble scares the fish; tapping late lets it swim off. Either way another shadow comes along — nothing is lost.
 *
 * Kid safety: catch odds are internal only (never shown), and every phase ends on its own, so nothing loops forever.
 */
import {FISH,FISH_SPOTS,SHADOW_LENGTH,fishById,type FishId,type FishSpot,type FishRarity} from './fishCatalog';
import {onIsland} from '../shoreline';

/** Where the float lands: out past the shoreline in the spot's casting direction (the pier spots cast over the sand). */
export function castPoint(spot:FishSpot,from:{x:number;z:number}){
 const dx=spot.buoy.x-spot.x,dz=spot.buoy.z-spot.z,l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
 let d=1;while(d<30&&onIsland(from.x+ux*d,from.z+uz*d))d+=.5;
 const reach=Math.min(d+3.2,30);return {x:from.x+ux*reach,z:from.z+uz*reach,dir:{x:ux,z:uz},distance:reach};
}
/** A new shadow's start, relative to the float: along the shore on the far side from the camera, in open water. */
export function shadowSpawn(cast:{x:number;z:number;dir:{x:number;z:number}},rand:()=>number,inWater:(x:number,z:number)=>boolean=(x,z)=>!onIsland(x,z)){
 const sx=cast.dir.z,sz=-cast.dir.x;
 for(let k=0;k<8;k++){const across=(1.9+rand()*1.3)*(k<4?1:-1),out=.3+rand()*1.2,x=sx*across+cast.dir.x*out,z=sz*across+cast.dir.z*out;if(inWater(cast.x+x,cast.z+z)&&inWater(cast.x+x*1.2,cast.z+z*1.2))return {x,z};}
 return {x:cast.dir.x*3.5,z:cast.dir.z*3.5};
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
export type SessionEvent='splash'|'notice'|'nibble'|'bite'|'escaped'|'scared'|'hooked'|'reel'|'reeled-in'|'cast';
/** Reaction window after the real bite: about 0.6-1 s, a little longer for younger players (easy mode / reduced motion). */
export const BITE_WINDOW:Record<FishRarity,number>={common:1,uncommon:.9,rare:.8,legendary:.7};
export const EASY_BONUS=.35;
export const CAST_TIME=.7,FLEE_TIME=1.3;
export const REEL_IDLE_LIMIT=8,REEL_TAP_GAP=.12;
export const CATCH_READ_TIME=3,CATCH_TAP_QUIET=.7;
const REEL_TAPS={small:6,medium:8,large:10,huge:12} as const;
const SPEED:Record<FishRarity,number>={common:.9,uncommon:1,rare:1.2,legendary:1.5};
export type Shadow={x:number;z:number;heading:number;alpha:number;length:number};
export type Session={phase:SessionPhase;t:number;wait:number;fish:{id:FishId;size:number}|null;shadow:Shadow|null;nibblesLeft:number;nextNibble:number;window:number;nibbles:number;dip:number;idleEscapes:number;reelTaps:number;reelTarget:number;reelIdle:number;reelCooldown:number};
/** After this many fish swim off with no tap at all, the line is reeled in (no endless cycle if a child puts the phone down). */
export const IDLE_ESCAPES=3;
export type SessionOptions={
 /** Where a new shadow appears, relative to the float at (0,0); the world passes a point that is in the water. */
 spawn:(rand:()=>number)=>{x:number;z:number};
 easy?:boolean;
};
export const createSession=():Session=>({phase:'ready',t:0,wait:0,fish:null,shadow:null,nibblesLeft:0,nextNibble:0,window:0,nibbles:0,dip:0,idleEscapes:0,reelTaps:0,reelTarget:0,reelIdle:0,reelCooldown:0});
const go=(s:Session,phase:SessionPhase)=>{s.phase=phase;s.t=0;};
const newWait=(s:Session,rand:()=>number,base=1.2)=>{s.wait=base+rand()*2.3;};

/** Advance by dt seconds. Returns the events that happened this step (the world turns them into splashes, bobs and sounds). */
export function stepSession(s:Session,spot:FishSpot,dt:number,rand:()=>number,o:SessionOptions):SessionEvent[]{
 const ev:SessionEvent[]=[],step=Math.max(0,Math.min(dt,.1));s.t+=step;s.dip=Math.max(0,s.dip-step*4);s.reelCooldown=Math.max(0,s.reelCooldown-step);
 const sh=s.shadow;
 switch(s.phase){
  case 'casting':if(s.t>=CAST_TIME){go(s,'floating');newWait(s,rand);ev.push('splash');}break;
  case 'floating':if(s.t>=s.wait){
   const id=rollCatch(spot,rand()),p=o.spawn(rand),f=fishById(id)!;
   s.fish={id,size:rollSize(id,rand())};s.shadow={x:p.x,z:p.z,heading:Math.atan2(-p.x,-p.z),alpha:0,length:SHADOW_LENGTH[f.shadow]};
   go(s,'approach');ev.push('notice');}break;
  case 'approach':if(sh&&s.fish){
   const r=fishById(s.fish.id)!.rarity,d=Math.hypot(sh.x,sh.z),mouth=sh.length*.5+.05,move=SPEED[r]*step;
   sh.alpha=Math.min(1,sh.alpha+step*1.5);sh.heading=Math.atan2(-sh.x,-sh.z);
   if(d-move<=mouth){const k=mouth/Math.max(d,1e-6);sh.x*=k;sh.z*=k;
    s.nibblesLeft=r==='legendary'?2+Math.floor(rand()*3):1+Math.floor(rand()*4);s.nextNibble=.6;go(s,'nibble');}
   else{sh.x-=sh.x/d*move;sh.z-=sh.z/d*move;}
  }break;
  case 'nibble':if(s.t>=s.nextNibble){
   if(s.nibblesLeft>0){s.nibblesLeft--;s.nibbles++;s.dip=1;ev.push('nibble');const leg=s.fish&&fishById(s.fish.id)!.rarity==='legendary';s.nextNibble=s.t+(leg?.45+rand()*.45:.7+rand()*.6);}
   else{const r=fishById(s.fish!.id)!.rarity;s.window=BITE_WINDOW[r]+(o.easy?EASY_BONUS:0);go(s,'bite');ev.push('bite');}
  }break;
  case 'bite':if(s.t>=s.window){s.idleEscapes++;go(s,'escaped');ev.push('escaped');}break;
  case 'reeling':s.reelIdle+=step;if(s.reelIdle>=REEL_IDLE_LIMIT){s.idleEscapes++;go(s,'escaped');ev.push('escaped');}break;
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
  case 'ready':case 'caught':s.fish=s.phase==='caught'?null:s.fish;s.shadow=null;s.nibbles=0;s.reelTaps=s.reelTarget=s.reelIdle=s.reelCooldown=0;go(s,'casting');return 'cast';
  case 'floating':go(s,'ready');return 'reeled-in';
  case 'approach':case 'nibble':if(s.shadow)s.shadow.heading=Math.atan2(-s.shadow.x,-s.shadow.z);go(s,'scared');return 'scared';
  case 'bite':s.reelTaps=0;s.reelTarget=REEL_TAPS[fishById(s.fish!.id)!.shadow];s.reelIdle=0;s.reelCooldown=REEL_TAP_GAP;go(s,'reeling');return 'reel';
  case 'reeling':if(s.reelCooldown>0)return null;s.reelTaps++;s.reelIdle=0;s.reelCooldown=REEL_TAP_GAP;s.dip=1;
   if(s.reelTaps>=s.reelTarget){go(s,'caught');s.shadow=null;return 'hooked';}return 'reel';
  default:return null;
 }
}
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
export const spotsFor=(id:FishId)=>FISH_SPOTS.filter(s=>id in s.weights);
