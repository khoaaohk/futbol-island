/**
 * Street Dash rules (Nov 17 2026, docs/arcade-aaa/streetdash-direction.md): an endless side-view run through island streets,
 * rooftops and the beach. Pure and seeded: no DOM, no clock. The shell calls advance(dt) with the frame time and the core runs fixed
 * 1/120 s steps (frame-rate independent); inputs are stamped with the core's own clock. tests/streetdash-core.cjs proves determinism,
 * frame-rate independence, the ramp, and fairness (a perfect bot runs 3,000 m on 30 seeds at every speed tier).
 * Units: metres and seconds. y is up, the street is y 0. The bean's x is its middle.
 * No allocation in a step: hazards, ground, stars, wind and events are fixed pools.
 */

export const SD={
 step:1/120,
 /** gravity, gravity while the jump is held and rising, how long a hold lifts, take-off speed */
 g:30,gHold:13,hold:.24,jumpV:9.2,
 /** fast fall (swipe down in the air) multiplies gravity */
 fastG:2.4,
 /** forgiveness: jump this long after leaving a ledge; a press this long before landing still jumps; a volley tap waits this long */
 coyote:.09,buffer:.12,volleyBuffer:.16,
 slide:.6,beanHalf:.22,beanH:1.1,slideH:.55,
 /** feet this far under a ledge still climb onto it (no hit) */
 ledge:.38,
 hearts:3,invuln:1.5,softInvuln:1,
 /** speed: gentle start, a cap the fairness proof passes (tests/streetdash-core.cjs) */
 v0:6.2,vCap:10.2,
 /** one difficulty level every 400 m; the speed cap arrives at level 6 (2,400 m) */
 levelM:400,capLevel:6,tiers:7,
 /** headwind on the beach: speed in the air is multiplied by this */
 wind:.8,
 /** the reaction window: two hazards are never closer than this in time (tests/streetdash-core.cjs) */
 react:.45,
 themeM:500,ahead:60,behind:30,
 /** volley range ahead of the bean, ball speed */
 volleyMin:1.4,volleyMax:10.5,ballSpeed:24,
 points:{star:10,crate:40,gate:60,goal:150,near:25},
 streakStep:.5,streakMax:4,
 medals:[800,2500,6000],
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of SD.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=SD.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:SD.medals[m]-score};}
export const streetdashCoins=(score:number)=>Math.floor(Math.max(0,score)/250);
export const multFor=(streak:number)=>1+SD.streakStep*Math.min(SD.streakMax,Math.max(0,streak));
export const THEMES=['street','roofs','beach'] as const;
export const themeAt=(x:number)=>Math.floor(Math.max(0,x)/SD.themeM)%3;

/** The ramp, as a function of the level (distance / 400 m, or a held tier). Every value only gets harder (tests). */
export function rampAt(L:number){
 const l=Math.max(0,L),cap=Math.min(1,l/SD.capLevel);
 return {
  speed:SD.v0+(SD.vCap-SD.v0)*cap,
  /** hardest chunk grade allowed */maxK:l<.5?0:l<1.25?1:l<2.25?2:3,
  /** pull toward the harder grades: grows to 2.4 by level 6 and keeps creeping after */bias:.4*Math.min(l,SD.capLevel)+.05*Math.max(0,l-SD.capLevel),
  /** open street between patterns, seconds */space:Math.max(.5,1.25-.125*l),
  /** 0..1: gaps get wider, banners and puddles longer */sc:cap,
 };
}
/** The speed alone (no allocation: the step calls this every 1/120 s). */
export const speedAt=(L:number)=>SD.v0+(SD.vCap-SD.v0)*Math.min(1,Math.max(0,L)/SD.capLevel);
export const levelAt=(dist:number)=>Math.max(0,dist)/SD.levelM;

export const HZ={wall:1,tackle:2,banner:3,crate:4,puddle:5,dog:6,gate:7,goal:8} as const;
export const HZ_NAME=['','wall','tackle','banner','crate','puddle','dog','gate','goal'] as const;
/** kinds a volley can hit */
export const isTarget=(k:number)=>k===HZ.crate||k===HZ.gate||k===HZ.goal;
/** kinds the bean jumps (for the near-miss bonus) */
const jumpable=(k:number)=>k===HZ.wall||k===HZ.tackle||k===HZ.crate||k===HZ.puddle||k===HZ.dog||k===HZ.gate;

export type Seg={on:boolean;x0:number;x1:number;y:number;amp:number;w:number;ph:number;theme:number;id:number};
export type Haz={on:boolean;kind:number;x:number;y:number;w:number;h:number;vx:number;trig:number;run:number;moved:number;live:boolean;
 spent:boolean;done:boolean;doneAt:number;paid:boolean;teach:number;taught:boolean;near:boolean;soft:boolean;id:number;theme:number};
export type Star={on:boolean;x:number;y:number;got:boolean;id:number};
export type Wind={on:boolean;x0:number;x1:number};
export type Bean={x:number;y:number;vy:number;ground:boolean;coyote:number;slide:number;hold:number;held:boolean;fast:boolean;slideLand:boolean;air:number;run:number};
/** mode 0 at the feet, 1 shot at a target, 2 coming back, 3 knocked loose and rolling back */
export type Ball={mode:number;t:number;dur:number;target:number;fx:number;fy:number;tx:number;ty:number};
export type DashStats={stars:number;volleys:number;goals:number;crates:number;gates:number;near:number;hits:number;falls:number;bestStreak:number;jumps:number;slides:number;chunks:number;steals:number};
export type DashEventType='jump'|'land'|'slide'|'fastfall'|'volley'|'crate'|'gate'|'goal'|'star'|'near'|'hit'|'fall'|'oops'|'teach'|'theme'|'level'|'over';
export type DashEvent={type:DashEventType;x:number;y:number;points:number;a:number;kind:number;word:string};
export type DashState={
 seed:number;daily:boolean;fix:number;rng:number;t:number;
 bean:Bean;ball:Ball;segs:Seg[];haz:Haz[];stars:Star[];winds:Wind[];
 hearts:number;score:number;bonus:number;dist:number;speed:number;level:number;theme:number;streak:number;
 /** the volley target (index into haz) while a volley is possible, else -1 */aim:number;
 invuln:number;over:boolean;hits:number;jumpBuf:number;jumpLag:number;slideBuf:number;volleyBuf:number;nearPending:number;hurtInAir:boolean;
 gen:{x:number;tut:number;last:number;ids:number;tick:number};stats:DashStats;
};

/* ---- the patterns (chunks): hand-made, scaled by speed so every one keeps its timing ---- */
type B={ground(x0:number,x1:number,y:number):void;mover(x0:number,x1:number,y:number,amp:number,w:number,ph:number):void;
 haz(kind:number,x:number,y:number,w:number,h:number,vx?:number,trig?:number,run?:number):Haz;star(x:number,y:number):void;
 arc(x:number,top:number,span:number,n:number,y0?:number):void;row(x0:number,x1:number,y:number,n:number):void;wind(x0:number,x1:number):void};
type C={v:number;sc:number;r:()=>number};
/** k: grade 0-3 (the ramp unlocks and favours higher grades), theme -1 = any backdrop. build returns the length used. */
export type Chunk={id:string;k:number;w:number;theme:number;word:string;build:(b:B,c:C)=>number};
const lead=(v:number)=>v*.4;
export const CHUNKS:readonly Chunk[]=[
 {id:'stars',k:0,w:.7,theme:-1,word:'Stars',build:(b,{v})=>{const L=v*1.4;b.ground(0,L,0);b.row(L*.15,L*.85,.55,5);return L;}},
 {id:'wall',k:0,w:1,theme:-1,word:'Low wall',build:(b,{v})=>{const x=lead(v);b.ground(0,x+.55+v*.5,0);b.haz(HZ.wall,x,0,.55,.75);b.arc(x+.27,1.9,2.6,3);return x+.55+v*.5;}},
 {id:'tackle',k:0,w:1,theme:-1,word:'Sliding tackle',build:(b,{v})=>{const x=lead(v)+5;b.ground(0,x+1+v*.4,0);b.haz(HZ.tackle,x,0,1,.5,-4,7.5,2.6);return x+1+v*.4;}},
 {id:'banner',k:0,w:1,theme:-1,word:'Banner',build:(b,{v,sc})=>{const x=lead(v),w=1.3+.6*sc;b.ground(0,x+w+v*.5,0);b.haz(HZ.banner,x,.72,w,2.6);b.row(x+.2,x+w-.2,.3,3);return x+w+v*.5;}},
 {id:'crate',k:0,w:1,theme:-1,word:'Crate',build:(b,{v})=>{const x=lead(v)+v*.4;b.ground(0,x+.9+v*.5,0);b.haz(HZ.crate,x,0,.9,.95);return x+.9+v*.5;}},
 {id:'puddle',k:0,w:.9,theme:-1,word:'Puddle',build:(b,{v,sc})=>{const x=lead(v),w=1.2+.7*sc;b.ground(0,x+w+v*.5,0);b.haz(HZ.puddle,x,0,w,.12);b.arc(x+w/2,1.6,2.4,3);return x+w+v*.5;}},
 {id:'gap',k:0,w:1,theme:-1,word:'Gap',build:(b,{v,sc})=>{const a=lead(v)+1,w=1.5+.8*sc;b.ground(0,a,0);b.arc(a+w/2,1.7,w+1,3);b.ground(a+w,a+w+v*.6,0);return a+w+v*.6;}},
 {id:'walls2',k:1,w:1,theme:-1,word:'Two walls',build:(b,{v})=>{const x=lead(v),x2=x+.55+v*1.05;b.ground(0,x2+.55+v*.5,0);b.haz(HZ.wall,x,0,.55,.75);b.haz(HZ.wall,x2,0,.55,.75);return x2+.55+v*.5;}},
 {id:'dog',k:1,w:.9,theme:-1,word:'Dog',build:(b,{v})=>{const x=lead(v)+7;b.ground(0,x+.85+v*.5,0);b.haz(HZ.dog,x,0,.85,.6,-2.6,10,30);return x+.85+v*.5;}},
 {id:'gate',k:1,w:.9,theme:-1,word:'Cone gate',build:(b,{v})=>{const x=lead(v)+v*.5;b.ground(0,x+.5+v*.5,0);b.haz(HZ.gate,x,0,.5,1.55);return x+.5+v*.5;}},
 {id:'goal',k:1,w:1.1,theme:0,word:'Street goal',build:(b,{v})=>{const x=lead(v)+v*.6,L=x+1.6+v*.5;b.ground(0,L,0);b.haz(HZ.goal,x,.15,1.6,1.15);b.row(1,x,.55,3);return L;}},
 {id:'steps',k:1,w:1.2,theme:1,word:'Roof steps',build:(b,{v,sc})=>{const a=lead(v)+.6,s=Math.max(2.4,v*.5),w=1.4+.6*sc;b.ground(0,a,0);b.ground(a,a+s,.8);b.ground(a+s,a+2*s,1.6);
  b.star(a+s*.5,1.6);b.star(a+s*1.5,2.4);const e=a+2*s+w;b.arc(a+2*s+w/2,2.6,w+1,3);b.ground(e,e+v*.6,0);return e+v*.6;}},
 {id:'chimneys',k:2,w:1,theme:1,word:'Chimney hop',build:(b,{v})=>{const a=lead(v)+.6,x1=a+1.4,x2=x1+2.6,x3=x2+1.6;b.ground(0,a,0);b.ground(x1,x2,.7);b.ground(x3,x3+v*.6,0);b.star(x1+1.3,1.5);return x3+v*.6;}},
 {id:'wallBanner',k:2,w:1,theme:-1,word:'Jump, then slide',build:(b,{v})=>{const x=lead(v),y=x+.55+v*1.15;b.ground(0,y+1.4+v*.5,0);b.haz(HZ.wall,x,0,.55,.75);b.haz(HZ.banner,y,.72,1.4,2.6);return y+1.4+v*.5;}},
 {id:'wideGap',k:2,w:.9,theme:-1,word:'Wide gap',build:(b,{v,sc})=>{const a=lead(v)+1,w=2.5+.9*sc;b.ground(0,a,0);b.arc(a+w/2,2.3,w+1,4);b.ground(a+w,a+w+v*.6,0);return a+w+v*.6;}},
 {id:'mover',k:2,w:.9,theme:-1,word:'Moving platform',build:(b,{v,r})=>{const a=lead(v)+1,w=5.6;b.ground(0,a,0);b.mover(a+1.7,a+3.9,-.15,.55,2,r()*6.283);b.star(a+2.8,1.4);b.ground(a+w,a+w+v*.6,0);return a+w+v*.6;}},
 {id:'crateGate',k:2,w:.9,theme:-1,word:'Crate and gate',build:(b,{v})=>{const x=lead(v)+v*.3,y=x+.9+v*1.25;b.ground(0,y+.5+v*.5,0);b.haz(HZ.crate,x,0,.9,.95);b.haz(HZ.gate,y,0,.5,1.55);return y+.5+v*.5;}},
 {id:'windGap',k:2,w:1.1,theme:2,word:'Sea wind',build:(b,{v,sc})=>{const a=lead(v)+1.5,w=2+.5*sc;b.wind(0,a+w+1.5);b.ground(0,a,0);b.arc(a+w/2,1.6,w+.6,3);b.ground(a+w,a+w+v*.6,0);return a+w+v*.6;}},
 {id:'tackle2',k:3,w:1,theme:-1,word:'Two tackles',build:(b,{v})=>{const x=lead(v)+5,y=x+1+v*1.15+1;b.ground(0,y+1+v*.4,0);b.haz(HZ.tackle,x,0,1,.5,-4,7.5,2.6);b.haz(HZ.tackle,y,0,1,.5,-4,7.5,2.6);return y+1+v*.4;}},
 {id:'dogPuddle',k:3,w:.9,theme:-1,word:'Puddle and dog',build:(b,{v})=>{const x=lead(v),d=x+1.4+v*1.25+6;b.ground(0,d+.85+v*.5,0);b.haz(HZ.puddle,x,0,1.4,.12);b.haz(HZ.dog,d,0,.85,.6,-2.6,10,30);return d+.85+v*.5;}},
 {id:'gapBanner',k:3,w:1,theme:-1,word:'Gap, then slide',build:(b,{v})=>{const a=lead(v)+1,w=1.8,e=a+w,y=e+v*1.05;b.ground(0,a,0);b.ground(e,y+1.3+v*.5,0);b.haz(HZ.banner,y,.72,1.3,2.6);b.row(y+.2,y+1.1,.3,2);return y+1.3+v*.5;}},
 {id:'windTackle',k:3,w:1,theme:2,word:'Wind and tackle',build:(b,{v})=>{const x=lead(v)+5,L=x+1+v*.9+2.2+v*.6;b.wind(0,L);b.ground(0,x+1+v*.9,0);b.haz(HZ.tackle,x,0,1,.5,-4,7.5,2.6);const g=x+1+v*.9;b.ground(g+2.2,L,0);b.arc(g+1.1,1.6,2.8,3);return L;}},
 {id:'goalTackle',k:3,w:1,theme:0,word:'Shoot, then jump',build:(b,{v})=>{const x=lead(v)+v*.4,y=x+1.6+v*.9+5;b.ground(0,y+1+v*.4,0);b.haz(HZ.goal,x,.15,1.6,1.15);b.haz(HZ.tackle,y,0,1,.5,-4,7.5,2.6);return y+1+v*.4;}},
];
/** The first 20 seconds: three soft lessons, one word each (a hit there costs no heart). */
const TUTORIAL:readonly {kind:number;word:string;run:number}[]=[{kind:HZ.wall,word:'JUMP!',run:30},{kind:HZ.banner,word:'SLIDE!',run:26},{kind:HZ.crate,word:'SHOOT!',run:26}];
export const TEACH_WORDS=['','JUMP!','SLIDE!','SHOOT!'] as const;

export function streetdashDailySeed(day:string){let h=0x811c9dc5;const s='streetdash:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}

/** 90 m of street at once (60 ahead, 30 behind) never needs more than about half of these (tests/streetdash-core.cjs checks the peak). */
export const POOL={segs:40,haz:48,stars:64,winds:8,events:48};
const cp=<T extends object>(o:T):T=>({...o});
const back=<T extends object>(into:T[],from:T[])=>{for(let i=0;i<into.length;i++)Object.assign(into[i],from[i]);};

export type StreetDash=ReturnType<typeof createStreetDash>;
/** fixTier 0..6 holds the speed and the pattern mix at that level (tests, practice); no lessons then. */
export function createStreetDash(opts:{seed:number;daily?:boolean;fixTier?:number}){
 const fix=typeof opts.fixTier==='number'?Math.max(0,Math.min(SD.tiers-1,opts.fixTier)):-1;
 const S:DashState={seed:opts.seed>>>0,daily:!!opts.daily,fix,rng:(opts.seed>>>0)||1,t:0,
  bean:{x:2,y:0,vy:0,ground:true,coyote:0,slide:0,hold:0,held:false,fast:false,slideLand:false,air:0,run:0},
  ball:{mode:0,t:0,dur:0,target:-1,fx:0,fy:0,tx:0,ty:0},
  segs:Array.from({length:POOL.segs},()=>({on:false,x0:0,x1:0,y:0,amp:0,w:0,ph:0,theme:0,id:0})),
  haz:Array.from({length:POOL.haz},()=>({on:false,kind:0,x:0,y:0,w:0,h:0,vx:0,trig:0,run:0,moved:0,live:false,spent:false,done:false,doneAt:0,paid:false,teach:0,taught:false,near:false,soft:false,id:0,theme:0})),
  stars:Array.from({length:POOL.stars},()=>({on:false,x:0,y:0,got:false,id:0})),
  winds:Array.from({length:POOL.winds},()=>({on:false,x0:0,x1:0})),
  hearts:SD.hearts,score:0,bonus:0,dist:0,speed:SD.v0,level:0,theme:0,streak:0,aim:-1,invuln:0,over:false,hits:0,
  jumpBuf:0,jumpLag:0,slideBuf:0,volleyBuf:0,nearPending:0,hurtInAir:false,
  gen:{x:0,tut:fix>=0?TUTORIAL.length:0,last:-1,ids:0,tick:0},
  stats:{stars:0,volleys:0,goals:0,crates:0,gates:0,near:0,hits:0,falls:0,bestStreak:0,jumps:0,slides:0,chunks:0,steals:0}};
 const START=S.bean.x;
 /* events: a fixed ring, drained by the shell each frame */
 const ev:DashEvent[]=Array.from({length:POOL.events},()=>({type:'land' as DashEventType,x:0,y:0,points:0,a:0,kind:0,word:''}));let evN=0;
 function emit(type:DashEventType,x:number,y:number,points=0,a=0,kind=0,word=''){if(evN>=POOL.events)return;const e=ev[evN++];e.type=type;e.x=x;e.y=y;e.points=points;e.a=a;e.kind=kind;e.word=word;}
 /* inputs: a small queue stamped with the core clock */
 const Q=16,q=Array.from({length:Q},()=>({t:0,k:0,lag:0}));let qh=0,qt=0,clock=0;
 const rnd=()=>{let t=(S.rng=(S.rng+0x6d2b79f5)>>>0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
 const levelOf=(x:number)=>fix>=0?fix:levelAt(x-START);
 const topOf=(s:Seg)=>s.amp?s.y+s.amp*Math.sin(S.t*s.w+s.ph):s.y;

 /* ---- the world builder (writes into the pools at the chunk's origin) ---- */
 let ox=0,theme=0;
 function free<T extends {on:boolean}>(arr:T[]):T|null{for(let i=0;i<arr.length;i++)if(!arr[i].on)return arr[i];return null;}
 const builder:B={
  ground(x0,x1,y){if(x1-x0<=1e-6)return;const a=ox+x0,b=ox+x1;
   for(const s of S.segs)if(s.on&&!s.amp&&s.y===y&&Math.abs(s.x1-a)<1e-6){s.x1=b;return;}// the street runs on: one long segment
   const s=free(S.segs);if(!s)return;s.on=true;s.x0=a;s.x1=b;s.y=y;s.amp=0;s.w=0;s.ph=0;s.theme=theme;s.id=++S.gen.ids;},
  mover(x0,x1,y,amp,w,ph){const s=free(S.segs);if(!s)return;s.on=true;s.x0=ox+x0;s.x1=ox+x1;s.y=y;s.amp=amp;s.w=w;s.ph=ph;s.theme=theme;s.id=++S.gen.ids;},
  haz(kind,x,y,w,h,vx=0,trig=0,run=0){const z=free(S.haz)??S.haz[0];z.on=true;z.kind=kind;z.x=ox+x;z.y=y;z.w=w;z.h=h;z.vx=vx;z.trig=trig;z.run=run;z.moved=0;z.live=false;
   z.spent=false;z.done=false;z.doneAt=0;z.paid=false;z.teach=0;z.taught=false;z.near=false;z.soft=false;z.id=++S.gen.ids;z.theme=theme;return z;},
  star(x,y){const s=free(S.stars);if(!s)return;s.on=true;s.x=ox+x;s.y=y;s.got=false;s.id=++S.gen.ids;},
  arc(x,top,span,n,y0=.6){for(let i=0;i<n;i++){const f=n<2?.5:i/(n-1),u=f*2-1;builder.star(x+(f-.5)*span,y0+(top-y0)*(1-u*u));}},
  row(x0,x1,y,n){for(let i=0;i<n;i++)builder.star(x0+(n<2?.5:i/(n-1))*(x1-x0),y);},
  wind(x0,x1){const w=free(S.winds);if(!w)return;w.on=true;w.x0=ox+x0;w.x1=ox+x1;},
 };
 const ctx:C={v:SD.v0,sc:0,r:rnd};
 function chunk(){
  const G=S.gen,L=levelOf(G.x),R=rampAt(L);ox=G.x;theme=themeAt(G.x-START);ctx.v=R.speed;ctx.sc=R.sc;let len:number;
  if(G.x<START+1){len=10;builder.ground(-6,len,0);}// the start: a little street behind and ahead
  else if(G.tut<TUTORIAL.length){const T=TUTORIAL[G.tut++],v=R.speed;
   let z:Haz;if(T.kind===HZ.wall)z=builder.haz(HZ.wall,T.run,0,.55,.75);else if(T.kind===HZ.banner)z=builder.haz(HZ.banner,T.run,.72,1.4,2.6);else z=builder.haz(HZ.crate,T.run,0,.9,.95);
   z.teach=G.tut;z.soft=true;len=T.run+z.w+v*.6;builder.ground(0,len,0);
  }else{
   let total=0;const pick=(skip:number)=>{total=0;for(let i=0;i<CHUNKS.length;i++){const c=CHUNKS[i];if(i===skip||c.k>R.maxK||(c.theme>=0&&c.theme!==theme))continue;total+=c.w*(1+R.bias*c.k);}
    let r=rnd()*total;for(let i=0;i<CHUNKS.length;i++){const c=CHUNKS[i];if(i===skip||c.k>R.maxK||(c.theme>=0&&c.theme!==theme))continue;r-=c.w*(1+R.bias*c.k);if(r<=0)return i;}return 0;};
   const i=pick(G.last);G.last=i;S.stats.chunks++;len=CHUNKS[i].build(builder,ctx);
  }
  G.x+=len;const run=R.speed*R.space;ox=G.x;builder.ground(0,run,0);G.x+=run;
 }
 function generate(){const b=S.bean;let made=false;while(S.gen.x<b.x+SD.ahead){chunk();made=true;}if(!made&&(S.gen.tick++&31))return;
  for(const s of S.segs)if(s.on&&s.x1<b.x-SD.behind)s.on=false;for(const s of S.stars)if(s.on&&s.x<b.x-SD.behind)s.on=false;for(const w of S.winds)if(w.on&&w.x1<b.x-SD.behind)w.on=false;
  for(const z of S.haz)if(z.on&&z.x+z.w<b.x-SD.behind)z.on=false;}

 /* ---- rules ---- */
 function hurt(kind:number,soft:boolean,x:number,y:number){
  if(S.invuln>0)return false;S.hits++;S.hurtInAir=true;S.nearPending=0;
  const ball=S.ball;ball.mode=3;ball.t=0;ball.dur=.9;ball.target=-1;
  if(soft){S.invuln=SD.softInvuln;emit('oops',x,y,0,0,kind);return true;}
  S.hearts--;S.streak=0;S.invuln=SD.invuln;S.stats.hits++;if(kind===HZ.dog)S.stats.steals++;
  emit('hit',x,y,0,S.hearts,kind);
  if(S.hearts<=0){S.over=true;emit('over',x,y,S.score);}
  return true;
 }
 function canVolley(){const b=S.bean;return !S.over&&b.ground&&b.slide<=0&&S.ball.mode===0;}
 function findAim(){let best=-1,bd=1e9;const bx=S.bean.x;
  for(let i=0;i<S.haz.length;i++){const z=S.haz[i];if(!z.on||!isTarget(z.kind)||z.done||z.spent)continue;const d=z.x-bx;if(d<SD.volleyMin||d>SD.volleyMax)continue;if(d<bd){bd=d;best=i;}}
  return best;}
 function volley(i:number){const z=S.haz[i],b=S.bean,ball=S.ball;
  ball.mode=1;ball.t=0;ball.target=i;ball.fx=b.x+.32;ball.fy=b.y+.18;ball.tx=z.x+z.w*.5;ball.ty=z.y+z.h*.55;ball.dur=Math.max(.1,Math.hypot(ball.tx-ball.fx,ball.ty-ball.fy)/SD.ballSpeed);
  z.done=true;z.doneAt=S.t+ball.dur;S.volleyBuf=0;S.stats.volleys++;emit('volley',ball.fx,ball.fy,0,i,z.kind);}
 function startJump(){const b=S.bean,late=!b.ground;
  b.vy=SD.jumpV;b.ground=false;b.hold=SD.hold;b.slide=0;b.fast=false;b.slideLand=false;b.coyote=1;b.air=0;S.jumpBuf=0;S.hurtInAir=false;S.stats.jumps++;
  // a late jump: off the very edge (coyote time), or with a hazard about to touch (under 0.17 s away)
  let near=late?1:0;const front=b.x+SD.beanHalf;
  for(const z of S.haz){if(!z.on||!jumpable(z.kind)||z.spent||z.done)continue;const d=z.x-front;if(d>=-.05&&d<S.speed*.17){z.near=true;near=0;}}
  S.nearPending=near;emit('jump',b.x,b.y,0,late?1:0);}
 function award(points:number,x:number,y:number,type:DashEventType,kind=0){S.bonus+=points;emit(type,x,y,points,S.streak,kind);}

 function step(){
  if(S.over)return;const dt=SD.step,b=S.bean,ball=S.ball;S.t+=dt;
  // inputs stamped before this step's end
  while(qh<qt&&q[qh%Q].t<=S.t+1e-9){const e=q[qh%Q];qh++;
   if(e.k===1){b.held=true;S.jumpBuf=SD.buffer;S.jumpLag=e.lag;}else if(e.k===2)b.held=false;else if(e.k===3)S.slideBuf=SD.buffer;else if(e.k===4)S.volleyBuf=SD.volleyBuffer;}
  const L=levelOf(b.x),v=speedAt(L);S.speed=v;
  if(Math.floor(L)>Math.floor(S.level)&&fix<0)emit('level',b.x,b.y,0,Math.floor(L));S.level=L;
  const th=themeAt(b.x-START);if(th!==S.theme){S.theme=th;emit('theme',b.x,b.y,0,th);}
  // actions
  if(S.volleyBuf>0){const i=canVolley()?findAim():-1;if(i>=0)volley(i);else S.volleyBuf-=dt;}
  if(S.jumpBuf>0){if(b.ground||b.coyote<SD.coyote+Math.min(.08,S.jumpLag))startJump();else S.jumpBuf-=dt;}
  if(S.slideBuf>0){S.slideBuf=0;
   if(b.ground){b.slide=SD.slide;S.stats.slides++;emit('slide',b.x,b.y);}
   else{if(!b.fast){b.fast=true;b.hold=0;if(b.vy>-6)b.vy=-6;emit('fastfall',b.x,b.y);}b.slideLand=true;}}
  // move
  const px=b.x,py=b.y;let windy=false;
  if(!b.ground)for(const w of S.winds)if(w.on&&b.x>=w.x0&&b.x<=w.x1){windy=true;break;}
  b.x+=v*(windy?SD.wind:1)*dt;
  if(!b.ground){let g=SD.g;if(b.fast)g*=SD.fastG;else if(b.held&&b.hold>0&&b.vy>0)g=SD.gHold;
   if(b.held)b.hold-=dt;else b.hold=0;b.vy-=g*dt;b.y+=b.vy*dt;b.coyote+=dt;b.air+=dt;}
  else b.run+=v*dt;
  // a ledge face in front: climb it if the feet are nearly there, else it is a hit (and the bean is set on top)
  const front=b.x+SD.beanHalf,pfront=px+SD.beanHalf;
  for(const s of S.segs){if(!s.on||s.x0<=pfront-1e-9||s.x0>front)continue;const top=topOf(s);if(top<=b.y+.02)continue;
   let prev=false;for(const o of S.segs)if(o.on&&o!==s&&o.x1>=s.x0-1e-6&&o.x0<s.x0&&topOf(o)>=top-.02){prev=true;break;}if(prev)continue;
   if(top-b.y>SD.ledge)hurt(0,false,front,b.y);
   b.y=top;b.vy=0;if(!b.ground){b.ground=true;b.fast=false;b.air=0;}}
  // land / stay on the ground
  if(!b.ground){if(b.vy<=0){let best:Seg|null=null,bt=-1e9;
    for(const s of S.segs){if(!s.on||b.x<s.x0-.2||b.x>s.x1+.2)continue;const top=topOf(s);if(py>=top-.15&&b.y<=top&&top>bt){bt=top;best=s;}}
    if(best){const air=b.air;b.y=bt;b.vy=0;b.ground=true;b.fast=false;b.air=0;b.coyote=0;
     if(air>.12)emit('land',b.x,b.y,0,air);
     if(S.nearPending&&!S.hurtInAir){S.stats.near++;award(SD.points.near,b.x,b.y+1.4,'near');}S.nearPending=0;
     if(b.slideLand){b.slideLand=false;b.slide=SD.slide;S.stats.slides++;emit('slide',b.x,b.y);}}}}
  else{let bt=-1e9,found=false;for(const s of S.segs){if(!s.on||b.x<s.x0-.2||b.x>s.x1+.2)continue;const top=topOf(s);if(top<=b.y+.2&&top>=b.y-.25&&top>bt){bt=top;found=true;}}
   if(found)b.y=bt;else{b.ground=false;b.coyote=0;b.vy=0;b.air=0;b.hold=0;}}
  if(b.slide>0)b.slide-=dt;
  // hazards
  const h=b.slide>0?SD.slideH:SD.beanH,x0=b.x-SD.beanHalf,x1=b.x+SD.beanHalf,y0=b.y,y1=b.y+h;
  for(let i=0;i<S.haz.length;i++){const z=S.haz[i];if(!z.on)continue;
   if(z.vx!==0&&!z.spent){if(!z.live&&z.x-b.x<z.trig)z.live=true;if(z.live&&z.moved<z.run){const d=z.vx*dt;z.x+=d;z.moved-=d;}}
   if(z.teach&&!z.taught&&z.x-b.x<v*1.35){z.taught=true;emit('teach',z.x,z.y+z.h,0,z.teach,z.kind,TEACH_WORDS[z.teach]);}
   if(z.done&&!z.paid&&S.t>=z.doneAt){z.paid=true;const pts=Math.round((z.kind===HZ.goal?SD.points.goal:z.kind===HZ.gate?SD.points.gate:SD.points.crate)*multFor(S.streak));
    S.streak++;if(S.streak>S.stats.bestStreak)S.stats.bestStreak=S.streak;
    if(z.kind===HZ.goal)S.stats.goals++;else if(z.kind===HZ.gate)S.stats.gates++;else S.stats.crates++;
    award(pts,z.x+z.w/2,z.y+z.h,z.kind===HZ.goal?'goal':z.kind===HZ.gate?'gate':'crate',z.kind);}
   if(!z.spent&&!z.done&&z.kind!==HZ.goal&&S.invuln<=0){let hit:boolean;
    if(z.kind===HZ.puddle)hit=b.ground&&x1>z.x+.15&&x0<z.x+z.w-.15&&Math.abs(b.y-z.y)<.3;
    else hit=x1>z.x+.08&&x0<z.x+z.w-.08&&y1>z.y+.04&&y0<z.y+z.h-.05;
    if(hit){z.spent=true;z.near=false;hurt(z.kind,z.soft,z.x,z.y+z.h*.5);}}
   if(z.near&&z.x+z.w<x0){z.near=false;if(!z.spent){S.stats.near++;award(SD.points.near,b.x,b.y+1.4,'near',z.kind);}}
  }
  for(const s of S.stars){if(!s.on||s.got)continue;if(s.x>x0-.3&&s.x<x1+.3&&s.y>y0-.3&&s.y<y1+.3){s.got=true;S.stats.stars++;award(SD.points.star,s.x,s.y,'star');}}
  // the ball
  if(ball.mode){ball.t+=dt;if(ball.t>=ball.dur){if(ball.mode===1){ball.mode=2;ball.t=0;ball.dur=.42;ball.fx=ball.tx;ball.fy=ball.ty;}else{ball.mode=0;ball.t=0;ball.target=-1;}}}
  // a fall into a gap: a heart, then back on the next street
  if(b.y<-3){S.stats.falls++;const lost=hurt(0,false,b.x,0);if(lost)emit('fall',b.x,0,0,S.hearts);else if(S.invuln<=0)S.invuln=.5;
   let best:Seg|null=null;for(const s of S.segs)if(s.on&&!s.amp&&s.x1>b.x+1&&(!best||s.x0<best.x0))best=s;
   if(best){b.x=Math.max(b.x,best.x0+.4);b.y=best.y;}else b.y=0;b.vy=0;b.ground=true;b.fast=false;b.slide=0;b.air=0;}
  if(S.invuln>0)S.invuln=Math.max(0,S.invuln-dt);
  S.aim=canVolley()?findAim():-1;
  S.dist=b.x-START;S.score=Math.floor(S.dist)+S.bonus;
  generate();
 }
 generate();
 return {
  state:S,
  /** Runs fixed steps for dt seconds of play (the shell clamps long frames). */
  advance(dt:number){if(!(dt>0))return;clock+=dt;while(S.t+SD.step<=clock+1e-9&&!S.over)step();if(S.over)clock=S.t;},
  /** jump (down / up), slide, volley. `lag`: how long a touch was held back to tell a tap from a swipe (it stretches the ledge grace). */
  press(kind:'jump'|'release'|'slide'|'volley',lag=0){if(S.over)return;if(qt-qh>=Q)qh++;const e=q[qt%Q];qt++;e.t=clock;e.k=kind==='jump'?1:kind==='release'?2:kind==='slide'?3:4;e.lag=Math.max(0,lag);},
  /** the clock the core has reached (inputs are stamped with it) */
  get clock(){return clock;},
  drain(fn:(e:DashEvent)=>void){for(let i=0;i<evN;i++)fn(ev[i]);evN=0;},
  /** a deep copy of the run, for the bots (no pending inputs) */
  snapshot():DashState{return {...S,bean:cp(S.bean),ball:cp(S.ball),segs:S.segs.map(cp),haz:S.haz.map(cp),stars:S.stars.map(cp),winds:S.winds.map(cp),gen:cp(S.gen),stats:cp(S.stats)};},
  restore(x:DashState){const {bean,ball,segs,haz,stars,winds,gen,stats,...rest}=x;Object.assign(S,rest);Object.assign(S.bean,bean);Object.assign(S.ball,ball);Object.assign(S.gen,gen);Object.assign(S.stats,stats);
   back(S.segs,segs);back(S.haz,haz);back(S.stars,stars);back(S.winds,winds);clock=S.t;qh=qt=0;evN=0;},
  topOf,
 };
}
