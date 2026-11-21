/**
 * FootGolf Island rules + physics (Nov 21 2026, docs/arcade-aaa/footgolf-direction.md). Pure, seeded, no three.js, no library:
 * tests/footgolf-core.cjs runs it in node. Fixed 1/120 s steps.
 *
 * The world: each hole is a low-poly heightfield (a grid of heights, sampled bilinearly, so the ball sits on exactly the ground the
 * view draws) with surfaces (fairway, green, rough, sand, stone, wood, water) from simple shapes, colliders (walls, fences, hedges,
 * rocks, bales, trunks) and tree canopies.
 * The ball: a size 5 football (radius 0.11 m, a hollow sphere). In the air: gravity, quadratic drag against the moving air (so wind
 * moves a high ball, not a rolling one), a Magnus force from its spin (backspin lifts, sidespin curls), spin decay. On landing: the
 * bounce is off the real slope under the ball, each surface has its own restitution and grip, and the friction impulse at the contact
 * point uses the spin (a hollow sphere: the grip limit is 2/5 of the slip), so backspin checks a chip. Rolling: gravity down the slope
 * against the surface's rolling resistance plus a speed drag (grass); the ball only stops where the grass can hold it on the slope.
 * The cup (0.265 m radius, real footgolf 53 cm): the ball drops when it is slow enough for the chord of cup it crosses; a bit
 * quicker on an edge is a lip-out that turns the ball, much quicker hops the hole; a very slow ball over the rim wobbles in.
 */

export const FG={step:1/120,R:.11,cupR:.265,g:9.81,maxKicks:8,water:0,
 /** drag k = 0.5 rho Cd A / m (rho 1.2, Cd 0.25, A pi r^2, m 0.43 kg) */drag:.0133,/** Magnus a = KM (w x v_rel) */magnus:.0045,spinDecay:.08,
 /** cup: the ball drops if speed <= chord / dropT */dropT:.2,lipX:1.65,
 scoreMax:20000,parPts:500,kickPts:200,worstPts:50,airPts:300,longPutt:8,longPuttPts:100} as const;

/* ---- surfaces ---- */
export const S={rough:0,fairway:1,green:2,sand:3,stone:4,wood:5,water:6,oob:7,tee:8} as const;
export type Surf=typeof S[keyof typeof S];
/** e: normal restitution, mu: impact friction, roll: rolling resistance (x g), lin: speed drag per second, hold: static grip on a slope */
export const SURF:readonly {name:string;e:number;mu:number;roll:number;lin:number;hold:number}[]=[
 {name:'Rough',e:.26,mu:.6,roll:.26,lin:.7,hold:.5},
 {name:'Fairway',e:.42,mu:.45,roll:.12,lin:.35,hold:.2},
 {name:'Green',e:.32,mu:.4,roll:.075,lin:.3,hold:.11},
 {name:'Sand',e:.06,mu:.9,roll:1.4,lin:2.5,hold:2},
 {name:'Stone path',e:.58,mu:.3,roll:.035,lin:.2,hold:.06},
 {name:'Bridge',e:.5,mu:.35,roll:.045,lin:.22,hold:.08},
 {name:'Water',e:0,mu:1,roll:9,lin:9,hold:9},
 {name:'Out',e:.3,mu:.6,roll:.3,lin:.7,hold:.5},
 {name:'Tee',e:.42,mu:.45,roll:.12,lin:.35,hold:.2},
];

/* ---- the four kicks ---- */
export type KickKind='long'|'chip'|'pass'|'putt';
export const KICKS:Record<KickKind,{name:string;foot:string;min:number;max:number;deg:number;back:number;top:number;line:string}>={
 long:{name:'Long kick',foot:'Laces',min:12,max:27,deg:27,back:6,top:0,line:'Laces through the middle of the ball: far and low-ish.'},
 chip:{name:'Chip',foot:'Under the ball',min:6,max:18,deg:50,back:34,top:0,line:'Stab under the ball: it pops up and stops quickly.'},
 pass:{name:'Pass',foot:'Inside of the foot',min:3,max:18,deg:3,back:0,top:8,line:'Inside of the foot: it skims along the ground.'},
 putt:{name:'Putt',foot:'Inside of the foot',min:.5,max:9,deg:0,back:0,top:0,line:'A soft inside-foot pass: the weight is everything.'},
};
export const KICK_ORDER:readonly KickKind[]=['long','chip','pass','putt'];
/** lie: what each surface takes off a kick's pace */
export const LIE:Record<number,Record<KickKind,number>>={[S.rough]:{long:.84,chip:.95,pass:.8,putt:.8},[S.sand]:{long:.55,chip:.86,pass:.5,putt:.5}};
/** curl dial -2..2 -> sidespin rad/s (positive curls right) */export const CURL_SPIN=17;
export type Shot={kind:KickKind;power:number;yaw:number;curl:number};

/* ---- holes ---- */
type Cap={p:number[];w:number};type Ell=[number,number,number,number];
export type HoleDef={id:string;name:string;par:number;place:string;lesson:string;tee:[number,number];cups:[number,number][];bounds:[number,number,number,number];
 land?:{caps?:Cap[];ells?:Ell[]};slope:[number,number];hills:[number,number,number,number][];fair:Cap[];green:{x:number;z:number;rx:number;rz:number;tx:number;tz:number};
 sand:Ell[];ponds:Ell[];rivers:Cap[];stone:Cap[];bridge?:{c:Cap;y:number};
 /** x0 z0 x1 z1 height kind (0 stone wall, 1 fence, 2 hedge, 3 rail) */walls:number[][];/** x z r h kind (0 rock, 1 bale, 2 fountain, 3 post, 4 trunk) */posts:number[][];
 /** x z size kind (0 round, 1 palm, 2 pine) */trees:number[][];wind:[number,number,number];preview:number};
const cap=(w:number,...p:number[]):Cap=>({p,w});
export const HOLES:readonly HoleDef[]=[
 {id:'jetty',name:'Lighthouse Jetty',par:3,place:'jetty',lesson:'Laces to get there, inside of the foot to finish.',tee:[0,0],cups:[[0,-53],[-2.5,-56],[2.5,-51]],bounds:[-46,-84,46,16],
  land:{caps:[cap(12,0,9,0,-46),cap(10,0,-46,1,-60)],ells:[[6,-68,8,7]]},slope:[0,.004],hills:[[4,-24,7,.9],[-5,-34,6,.5],[6,-68,6,2.6]],fair:[cap(6,0,-5,0,-44)],
  green:{x:0,z:-53,rx:8.5,rz:7.5,tx:.035,tz:.012},sand:[[-6.5,-45,3,2.2]],ponds:[],rivers:[],stone:[],walls:[],posts:[[8,-62,1.1,1,0],[-7,-15,1,.9,0]],
  trees:[[-8,-4,1,2],[8,3,.9,2]],wind:[80,1.5,3.5],preview:1},
 {id:'beach',name:'Palm Beach',par:3,place:'beach',lesson:'Sand grabs the ball: chip out, do not pass.',tee:[0,0],cups:[[4,-59],[2,-62],[6,-56]],bounds:[-44,-86,50,16],
  land:{caps:[cap(20,-3,9,-1,-70)]},slope:[.006,0],hills:[[-10,-30,9,1],[-4,-60,8,.5]],fair:[cap(6.5,-3,-5,-1,-48)],
  green:{x:4,z:-59,rx:8,rz:7.5,tx:.04,tz:0},sand:[[11,-30,6,22],[9.5,-54,3.4,2.6]],ponds:[],rivers:[],stone:[],walls:[],posts:[[-14,-46,1.2,1,0]],
  trees:[[14,-8,1,1],[15,-20,1.1,1],[16,-37,.95,1],[15.5,-50,1.05,1],[-15,-12,1,1],[-16,-28,1,1],[-12,-64,.9,1],[15,-66,1,1]],wind:[270,2,4],preview:1},
 {id:'plaza',name:'Town Plaza',par:4,place:'plaza',lesson:'Weight of pass: on stone the ball runs and runs.',tee:[0,0],cups:[[-29,-87],[-25,-90],[-32,-84]],bounds:[-62,-112,32,16],
  slope:[0,0],hills:[[-30,-87,10,.4]],fair:[cap(7,0,-5,0,-50,-27,-82)],green:{x:-29,z:-87,rx:8.5,rz:8,tx:0,tz:.03},
  sand:[[-20,-94,2.8,2.2]],ponds:[],rivers:[],stone:[cap(2,7,8,7,-46,-18,-76),cap(5.5,-11,-62,-14,-66)],
  walls:[[-8,-24,-8,-56,1.1,0],[-8,-56,-18,-56,1.1,0],[11,-40,11,-70,1.1,0],[-40,-74,-40,-98,1.1,0]],posts:[[-12,-64,2.6,1.2,2]],
  trees:[[-14,-36,1,0],[-15,-46,1.1,0],[15,-20,1,0],[16,-60,1.1,0],[-44,-60,1,0],[-20,-104,1.1,0]],wind:[180,0,1.5],preview:1},
 {id:'farm',name:'The Farm',par:4,place:'farm',lesson:'Read the ground: a hill throws the ball, a hollow keeps it.',tee:[0,0],cups:[[0,-101],[-3,-104],[3,-98]],bounds:[-48,-124,48,16],
  slope:[0,.006],hills:[[-5,-28,11,1.7],[7,-50,12,-.7],[-4,-74,10,1.5],[-26,-50,14,2.2],[24,-80,12,1.8]],fair:[cap(7.5,0,-5,2,-45,0,-90)],
  green:{x:0,z:-101,rx:9,rz:8,tx:-.03,tz:.02},sand:[[-7.5,-93,2.8,2.2]],ponds:[[18,-82,7,5]],rivers:[],stone:[],
  walls:[[-34,-63,-3.2,-63,1.1,1],[3.2,-63,34,-63,1.1,1]],posts:[[-10,-58,.9,1.2,1],[11,-36,.9,1.2,1],[-12,-82,.9,1.2,1]],
  trees:[[-16,-12,1,0],[16,-24,1.1,0],[-18,-40,1,0],[20,-60,1.2,0],[-20,-96,1,0],[17,-110,1,0]],wind:[200,1,3],preview:.6},
 {id:'boardwalk',name:'The Boardwalk',par:4,place:'boardwalk',lesson:'Pick a safe target: the bridge or the brave carry.',tee:[0,0],cups:[[6,-95],[3,-98],[9,-92]],bounds:[-50,-118,46,16],
  slope:[0,0],hills:[[16,-20,9,.8],[-20,-80,9,1]],fair:[cap(7,0,-5,-6,-32),cap(7,-8,-64,6,-88)],green:{x:6,z:-95,rx:8.5,rz:8,tx:.02,tz:-.03},
  sand:[[13,-86,2.8,2.4]],ponds:[],rivers:[cap(7.5,-70,-49,70,-47)],stone:[],bridge:{c:cap(2.4,-12,-36,-12,-61),y:.15},
  walls:[[-14.3,-38,-14.3,-60,.7,3],[-9.7,-38,-9.7,-60,.7,3]],posts:[],trees:[[18,-6,1,0],[-22,-14,1.1,0],[22,-70,1,0],[-24,-100,1,0],[24,-106,1.1,0]],wind:[110,1,3.5],preview:.6},
 {id:'museum',name:'Museum Gardens',par:3,place:'museum',lesson:'Read the green: the arrows point downhill.',tee:[0,0],cups:[[0,-57],[-3,-55],[3,-59]],bounds:[-40,-86,40,16],
  slope:[0,0],hills:[],fair:[cap(6,0,-5,0,-46)],green:{x:0,z:-57,rx:8.5,rz:7.5,tx:-.02,tz:.075},sand:[[-6,-47,2.6,2],[6.5,-50,2.6,2.2]],ponds:[],rivers:[],
  stone:[cap(1.6,-14,6,-14,-70),cap(1.6,14,6,14,-70)],walls:[[-10,-14,-10,-40,1.3,2],[10,-18,10,-42,1.3,2],[-12,-66,12,-66,1.3,2]],posts:[[0,-30,1,1.6,3]],
  trees:[[-18,-20,1,2],[18,-30,1,2],[-18,-50,1.1,2],[18,-56,1,2]],wind:[0,0,1.5],preview:.6},
 {id:'coral',name:'Coral Cay',par:3,place:'coral',lesson:'Wind moves a high ball. Backspin holds it on the green.',tee:[0,0],cups:[[2,-48],[0,-51],[4,-46]],bounds:[-40,-74,44,16],
  land:{caps:[cap(8,0,8,0,-8),cap(4,14,-10,14,-38)],ells:[[2,-49,11,10]]},slope:[0,0],hills:[[2,-49,8,.3]],fair:[cap(5,0,4,0,-5)],
  green:{x:2,z:-49,rx:8.5,rz:7.5,tx:-.03,tz:.02},sand:[[14,-24,4,14]],ponds:[],rivers:[],stone:[],walls:[],posts:[[-6,-46,1.3,1.1,0],[10,-53,1.1,1,0]],
  trees:[[-5,6,1,1],[5,7,1,1],[9,-55,.9,1]],wind:[90,3.5,5.5],preview:.35},
 {id:'summit',name:'The Summit',par:5,place:'summit',lesson:'Uphill needs more weight. Hit it past where you think.',tee:[0,0],cups:[[4,-134],[1,-137],[7,-131]],bounds:[-52,-158,52,16],
  slope:[0,-.045],hills:[[-14,-40,10,1.6],[16,-70,11,2],[-12,-100,10,1.5],[4,-118,5,.9]],fair:[cap(7,0,-5,-4,-60,4,-112)],
  green:{x:4,z:-134,rx:9,rz:8,tx:0,tz:.04},sand:[[-5,-124,2.8,2.4]],ponds:[],rivers:[],stone:[],walls:[],
  posts:[[8,-46,1.8,1.6,0],[-8,-82,2,1.8,0],[12,-96,1.5,1.4,0],[-3,-50,1.1,1,0]],trees:[[-18,-20,1,2],[18,-30,1.1,2],[-20,-66,1,2],[22,-108,1,2],[-18,-128,1.1,2],[16,-144,1,2]],wind:[180,2.5,4.5],preview:.35},
 {id:'stadium',name:'Island Stadium',par:5,place:'stadium',lesson:'All of it: plan the route, then weight the last pass.',tee:[0,0],cups:[[0,-139],[-3,-142],[3,-136]],bounds:[-52,-164,52,16],
  slope:[0,.028],hills:[[12,-40,9,1],[-14,-60,9,1.1]],fair:[cap(7.5,0,-5,6,-50,-2,-90,0,-128)],green:{x:0,z:-139,rx:9.5,rz:9,tx:.02,tz:-.02},
  sand:[[-8,-130,2.8,2.2],[8,-131,2.8,2.2]],ponds:[],rivers:[cap(5.5,-60,-104,60,-104)],stone:[cap(3,-2,-96,-2,-114)],bridge:{c:cap(3,-2,-97,-2,-111),y:.1},
  walls:[[-24,-112,-5.2,-112,1.6,0],[1.2,-112,24,-112,1.6,0],[-5.2,-97,-5.2,-111,.6,3],[1.2,-97,1.2,-111,.6,3]],posts:[[0,-122,.25,1.4,3]],
  trees:[[-18,-14,1,0],[18,-30,1,0],[-20,-80,1,0],[20,-90,1,0]],wind:[0,1.5,3.5],preview:.35},
];
export const COURSE_PAR=HOLES.reduce((a,h)=>a+h.par,0);

/* ---- seeded random ---- */
export function rng(seed:number){let a=seed>>>0||1;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function hashDay(day:string){let h=2166136261;for(let i=0;i<day.length;i++){h^=day.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
/** The Daily Hole: one hole a day, the same on every device (the hole, its cup, the wind, a touch of extra green tilt). */
export function footgolfDaily(day:string){const r=rng(hashDay('footgolf:'+day));const hole=Math.floor(r()*HOLES.length),cup=Math.floor(r()*3),windDir=r()*360,windK=r(),tilt=(r()-.5)*.02;return {seed:hashDay(day)||1,hole,cup,windDir,windK,tilt};}

/* ---- shape maths ---- */
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function capDist(c:Cap,x:number,z:number){let best=1e9;const p=c.p;for(let i=0;i+3<p.length;i+=2){const ax=p[i],az=p[i+1],bx=p[i+2],bz=p[i+3],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;
 const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)),ex=ax+dx*t-x,ez=az+dz*t-z,d=Math.sqrt(ex*ex+ez*ez);if(d<best)best=d;}return best-c.w;}
const ellQ=(e:Ell,x:number,z:number)=>Math.sqrt(((x-e[0])/e[2])**2+((z-e[1])/e[3])**2);
const ellDist=(e:Ell,x:number,z:number)=>(ellQ(e,x,z)-1)*Math.min(e[2],e[3]);

/* ---- one hole, built ---- */
export type Hole={def:HoleDef;ix:number;cup:[number,number];green:HoleDef['green'];wind:[number,number];x0:number;z0:number;cs:number;nx:number;nz:number;h:Float32Array;
 deckY:number;walls:Float32Array;nw:number;posts:Float32Array;np:number;trees:Float32Array;nt:number;metres:number;cupY:number;route:number[]};
export function buildHole(ix:number,o:{cup?:number;windDir?:number;windK?:number;tilt?:number;seed?:number}={}):Hole{
 const def=HOLES[ix],[bx0,bz0,bx1,bz1]=def.bounds,w=bx1-bx0,d=bz1-bz0;
 const cs=Math.max(1.5,Math.sqrt(w*d/2800)),nx=Math.ceil(w/cs),nz=Math.ceil(d/cs),g={...def.green,tz:def.green.tz+(o.tilt??0)};
 const cup=def.cups[Math.max(0,Math.min(2,o.cup??0))];
 const r=rng((o.seed??7)*31+ix);const n1=r()*6.28,n2=r()*6.28;
 const landM=(x:number,z:number)=>{const L=def.land;if(!L)return 1;let dd=1e9;for(const c of L.caps??[])dd=Math.min(dd,capDist(c,x,z));for(const e of L.ells??[])dd=Math.min(dd,ellDist(e,x,z));return 1-smooth(0,7,dd);};
 const lift=1.2-Math.min(...[[bx0,bz0],[bx1,bz0],[bx0,bz1],[bx1,bz1]].map(([x,z])=>def.slope[0]*x+def.slope[1]*z));
 const base=(x:number,z:number)=>{let y=lift+def.slope[0]*x+def.slope[1]*z;for(const [hx,hz,hr,hh] of def.hills)y+=hh*Math.exp(-((x-hx)**2+(z-hz)**2)/(hr*hr));
  let fm=0;for(const c of def.fair)fm=Math.max(fm,1-smooth(0,4,capDist(c,x,z)));y+=(Math.sin(x*.21+n1)*Math.cos(z*.17+n2)*.22+Math.sin(x*.07-z*.05+n2)*.3)*(1-fm*.75);return y;};
 const gc=base(g.x,g.z),tee=base(def.tee[0],def.tee[1]),deck=def.bridge?Math.max(base(def.bridge.c.p[0],def.bridge.c.p[1]),base(def.bridge.c.p[2],def.bridge.c.p[3]))+def.bridge.y:0;
 const height=(x:number,z:number)=>{let y=base(x,z);
  const tm=1-smooth(2.5,5,Math.hypot(x-def.tee[0],z-def.tee[1]));y+=(tee-y)*tm;
  const q=ellQ([g.x,g.z,g.rx,g.rz],x,z),gm=1-smooth(.85,1.35,q);y+=(gc+g.tx*(x-g.x)+g.tz*(z-g.z)-y)*gm;
  for(const s of def.sand){const sq=ellQ(s,x,z);if(sq<1.25)y-=.5*(1-smooth(0,1.05,sq))-.06*(1-smooth(1,1.25,sq))*(sq>1?1:0);}
  const m=landM(x,z);y=-2.4+(y+2.4)*m;
  for(const p of def.ponds){const k=1-smooth(-.5,3.5,ellDist(p,x,z));y+=(FG.water-1-y)*k;}
  for(const c of def.rivers){const k=1-smooth(-.5,3,capDist(c,x,z));y+=(FG.water-1.1-y)*k;}
  if(def.bridge&&capDist(def.bridge.c,x,z)<0)y=Math.max(y,deck-.04);
  return y;};
 const h=new Float32Array((nx+1)*(nz+1));for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)h[j*(nx+1)+i]=height(bx0+i*cs,bz0+j*cs);
 const walls=new Float32Array(def.walls.length*6);def.walls.forEach((wl,i)=>walls.set(wl,i*6));
 const posts=new Float32Array(def.posts.length*5);def.posts.forEach((p,i)=>posts.set(p,i*5));
 const trees=new Float32Array(def.trees.length*4);def.trees.forEach((t,i)=>trees.set(t,i*4));
 const route=[def.tee[0],def.tee[1]];for(const c of def.fair)for(let i=0;i<c.p.length;i+=2)if(Math.hypot(c.p[i]-route[route.length-2],c.p[i+1]-route[route.length-1])>8)route.push(c.p[i],c.p[i+1]);route.push(cup[0],cup[1]);
 let metres=0;for(let i=2;i<route.length;i+=2)metres+=Math.hypot(route[i]-route[i-2],route[i+1]-route[i-1]);
 const wd=((o.windDir??def.wind[0])*Math.PI)/180,ws=def.wind[1]+(def.wind[2]-def.wind[1])*(o.windK??.5);
 const hole:Hole={def,ix,cup:[cup[0],cup[1]],green:g,wind:[Math.sin(wd)*ws,-Math.cos(wd)*ws],x0:bx0,z0:bz0,cs,nx,nz,h,walls,nw:def.walls.length,posts,np:def.posts.length,trees,nt:def.trees.length,metres:Math.round(metres),cupY:0,route,deckY:deck};
 hole.cupY=heightAt(hole,cup[0],cup[1]);return hole;
}
/** Ground height (bilinear on the grid, the same surface the view draws). */
export function heightAt(H:Hole,x:number,z:number){const fx=Math.max(0,Math.min(H.nx-1e-4,(x-H.x0)/H.cs)),fz=Math.max(0,Math.min(H.nz-1e-4,(z-H.z0)/H.cs)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,W=H.nx+1,h=H.h;
 const a=h[j*W+i],b=h[j*W+i+1],c=h[(j+1)*W+i],d=h[(j+1)*W+i+1];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
/** Slope (dh/dx, dh/dz) into out[0], out[1]. */
export function slopeAt(H:Hole,x:number,z:number,out:Float64Array|number[]){const fx=Math.max(0,Math.min(H.nx-1e-4,(x-H.x0)/H.cs)),fz=Math.max(0,Math.min(H.nz-1e-4,(z-H.z0)/H.cs)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,W=H.nx+1,h=H.h;
 const a=h[j*W+i],b=h[j*W+i+1],c=h[(j+1)*W+i],d=h[(j+1)*W+i+1];out[0]=((b-a)*(1-v)+(d-c)*v)/H.cs;out[1]=((c-a)*(1-u)+(d-b)*u)/H.cs;}
export function surfaceAt(H:Hole,x:number,z:number):Surf{const d=H.def,[x0,z0,x1,z1]=d.bounds;if(x<x0+1||x>x1-1||z<z0+1||z>z1-1)return S.oob;
 const y=heightAt(H,x,z);if(d.bridge&&capDist(d.bridge.c,x,z)<0)return S.wood;if(y<FG.water-.02)return S.water;
 for(const s of d.sand)if(ellQ(s,x,z)<1)return S.sand;const g=H.green;if(ellQ([g.x,g.z,g.rx,g.rz],x,z)<1)return S.green;
 if(Math.hypot(x-d.tee[0],z-d.tee[1])<3)return S.tee;for(const c of d.stone)if(capDist(c,x,z)<0)return S.stone;for(const c of d.fair)if(capDist(c,x,z)<0)return S.fairway;
 if(y<FG.water+.45)return S.sand;return S.rough;}

/* ---- the ball ---- */
export type Ball={x:number;y:number;z:number;vx:number;vy:number;vz:number;wx:number;wy:number;wz:number;air:boolean;rest:boolean;t:number};
export const newBall=():Ball=>({x:0,y:0,z:0,vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,air:false,rest:true,t:0});
/** Launch from rest: speed from the kick's range x power x lie, the kick's angle, its back/top spin, the curl's sidespin. */
export function launch(b:Ball,shot:Shot,lie:Surf){const k=KICKS[shot.kind],p=Math.max(0,Math.min(1,shot.power)),m=LIE[lie]?.[shot.kind]??1;
 const sp=(k.min+(k.max-k.min)*p)*m,a=(k.deg*Math.PI)/180,fx=Math.sin(shot.yaw),fz=-Math.cos(shot.yaw),h=Math.cos(a)*sp;
 b.vx=fx*h;b.vz=fz*h;b.vy=Math.sin(a)*sp;
 // backspin about right = f x up = (-fz, 0, fx); sidespin about up (positive curl curls right: w = -s up)
 const back=k.back*(.5+.5*p)-k.top,side=shot.kind==='putt'?0:shot.curl*CURL_SPIN*(shot.kind==='pass'?.4:1);
 b.wx=-fz*back;b.wz=fx*back;b.wy=-side;b.air=shot.kind!=='putt';b.rest=false;b.t=0;if(!b.air)b.vy=0;return sp;}

const SL=[0,0],cupN={v:0,b:0};
export type StepHit={type:'land'|'bounce'|'roll'|'stop'|'water'|'oob'|'wall'|'leaves'|'cup'|'lip'|'hop'|'rim'|'plug'|'air-cup';a:number;k?:number};
/**
 * One fixed step. Returns null or the one thing that happened. `touched` tracks per-kick canopy hits (bit per tree).
 */
export function ballStep(H:Hole,b:Ball,dt:number,mem:{trees:number;over:boolean;edge:number}):StepHit|null{
 b.t+=dt;let hit:StepHit|null=null;
 if(b.air){
  const rx=b.vx-H.wind[0],rz=b.vz-H.wind[1],ry=b.vy,vr=Math.sqrt(rx*rx+ry*ry+rz*rz),kd=FG.drag*vr,km=FG.magnus;
  b.vx+=(-kd*rx+km*(b.wy*rz-b.wz*ry))*dt;b.vy+=(-FG.g-kd*ry+km*(b.wz*rx-b.wx*rz))*dt;b.vz+=(-kd*rz+km*(b.wx*ry-b.wy*rx))*dt;
  const dec=Math.exp(-FG.spinDecay*dt);b.wx*=dec;b.wy*=dec;b.wz*=dec;
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
  // trees: a canopy kills the ball once per tree a kick
  for(let i=0;i<H.nt;i++){if(mem.trees&(1<<i))continue;const t=i*4,s=H.trees[t+2],kind=H.trees[t+3],cy=heightAt(H,H.trees[t],H.trees[t+1])+(kind===1?5.4:kind===2?4.2:3.6)*s,cr=(kind===1?1.9:kind===2?1.6:2.2)*s;
   const dx=b.x-H.trees[t],dy=(b.y-cy)*(kind===2?.6:1),dz=b.z-H.trees[t+1];if(dx*dx+dy*dy+dz*dz<cr*cr){mem.trees|=1<<i;const sp=Math.hypot(b.vx,b.vy,b.vz);b.vx*=.28;b.vz*=.28;b.vy=Math.min(b.vy*.2,0)-.5;b.wx*=.2;b.wy*=.2;b.wz*=.2;hit={type:'leaves',a:sp,k:i};}}
  const gy=heightAt(H,b.x,b.z);
  // flying straight into the cup
  if(b.vy<0&&b.y-FG.R<gy+.06){const cx=b.x-H.cup[0],cz=b.z-H.cup[1];if(cx*cx+cz*cz<(FG.cupR-FG.R*.35)**2&&Math.hypot(b.vx,b.vz)<9)return {type:'air-cup',a:Math.hypot(b.vx,b.vz)};}
  if(b.y-FG.R<=gy){
   b.y=gy+FG.R;const s=surfaceAt(H,b.x,b.z);if(s===S.water)return {type:'water',a:Math.abs(b.vy)};if(s===S.oob)return {type:'oob',a:0};
   slopeAt(H,b.x,b.z,SL);const L=Math.sqrt(1+SL[0]*SL[0]+SL[1]*SL[1]),nx=-SL[0]/L,ny=1/L,nz=-SL[1]/L,P=SURF[s];
   const vn=b.vx*nx+b.vy*ny+b.vz*nz;
   if(vn<0){
    const sp=Math.hypot(b.vx,b.vy,b.vz);
    // contact point velocity: v + w x (-R n)
    const rxn=-FG.R*nx,ryn=-FG.R*ny,rzn=-FG.R*nz,cvx=b.vx+(b.wy*rzn-b.wz*ryn),cvy=b.vy+(b.wz*rxn-b.wx*rzn),cvz=b.vz+(b.wx*ryn-b.wy*rxn);
    const cn=cvx*nx+cvy*ny+cvz*nz,tx=cvx-cn*nx,ty=cvy-cn*ny,tz=cvz-cn*nz,tl=Math.hypot(tx,ty,tz);
    // normal: restitution
    b.vx-=(1+P.e)*vn*nx;b.vy-=(1+P.e)*vn*ny;b.vz-=(1+P.e)*vn*nz;
    // tangent: friction impulse, at most the grip limit (hollow sphere: 2/5 of the slip)
    if(tl>1e-6){const j=Math.min(.4,P.mu*(1+P.e)*-vn/tl),dvx=-j*tx,dvy=-j*ty,dvz=-j*tz;b.vx+=dvx;b.vy+=dvy;b.vz+=dvz;
     // dw = -(3/(2R)) n x dv
     const f=-1.5/FG.R;b.wx+=f*(ny*dvz-nz*dvy);b.wy+=f*(nz*dvx-nx*dvz);b.wz+=f*(nx*dvy-ny*dvx);}
    const out=b.vx*nx+b.vy*ny+b.vz*nz;
    if(s===S.sand&&-vn>5){b.vx*=.15;b.vz*=.15;b.vy=0;b.air=false;return {type:'plug',a:sp,k:s};}
    if(out<1.1){// settles into a roll: keep the along-ground part
     b.vx-=out*nx;b.vy-=out*ny;b.vz-=out*nz;b.vy=0;b.air=false;hit={type:'roll',a:sp,k:s};}
    else hit={type:hit?.type==='leaves'?'leaves':'bounce',a:-vn,k:s};
   }
  }
 }else if(!b.rest){
  const s0=surfaceAt(H,b.x,b.z);if(s0===S.water)return {type:'water',a:0};if(s0===S.oob)return {type:'oob',a:0};
  // a slow ball already over the hole drops (checked before the stop rule, so a dying putt never rests on the cup)
  {const cx=b.x-H.cup[0],cz=b.z-H.cup[1],d=Math.sqrt(cx*cx+cz*cz),v=Math.hypot(b.vx,b.vz);if(d<FG.cupR-FG.R*.2&&v<cupMaxSpeed(Math.min(d,FG.cupR*.95))*.5)return {type:'cup',a:v};}
  const P=SURF[s0];slopeAt(H,b.x,b.z,SL);const L2=1+SL[0]*SL[0]+SL[1]*SL[1],ax=-FG.g*SL[0]/L2,az=-FG.g*SL[1]/L2,sp=Math.hypot(b.vx,b.vz);
  const dec=P.roll*FG.g/Math.sqrt(L2)+P.lin*sp;
  if(sp>1e-5&&dec*dt<sp){b.vx+=(ax-dec*b.vx/sp)*dt;b.vz+=(az-dec*b.vz/sp)*dt;}
  else{const pull=Math.hypot(ax,az);if(pull<=P.hold*FG.g+.02){if(Math.hypot(b.x-H.cup[0],b.z-H.cup[1])<FG.cupR+FG.R*.3)return {type:'rim',a:0};b.vx=0;b.vz=0;b.rest=true;b.y=heightAt(H,b.x,b.z)+FG.R;return {type:'stop',a:0,k:s0};}b.vx=ax*dt;b.vz=az*dt;}
  const sp2=Math.hypot(b.vx,b.vz);if(sp2<.05){const pull=Math.hypot(ax,az);if(pull<=P.hold*FG.g+.02){if(Math.hypot(b.x-H.cup[0],b.z-H.cup[1])<FG.cupR+FG.R*.3)return {type:'rim',a:0};b.vx=0;b.vz=0;b.rest=true;b.y=heightAt(H,b.x,b.z)+FG.R;return {type:'stop',a:0,k:s0};}}
  b.x+=b.vx*dt;b.z+=b.vz*dt;b.y=heightAt(H,b.x,b.z)+FG.R;
  // the cup
  const cx=b.x-H.cup[0],cz=b.z-H.cup[1],d=Math.sqrt(cx*cx+cz*cz),v=Math.hypot(b.vx,b.vz);
  if(d<FG.cupR){if(!mem.over){mem.over=true;const r=cupResult(cx,cz,b.vx,b.vz);
    if(r==='drop')return {type:'cup',a:v};
    if(r==='lip'){// the rim turns it away from the middle and takes pace
     const side=Math.sign(cx*b.vz-cz*b.vx)||1,turn=side*(.5+.6*Math.min(1,v/6)),c=Math.cos(turn),sn=Math.sin(turn),nvx=(b.vx*c-b.vz*sn)*.55,nvz=(b.vx*sn+b.vz*c)*.55;b.vx=nvx;b.vz=nvz;return {type:'lip',a:v};}
    b.vy=Math.min(1.4,v*.18);b.air=true;b.vx*=.86;b.vz*=.86;return {type:'hop',a:v};}}
  else{if(mem.over&&d>FG.cupR+FG.R)mem.over=false;
   // a very slow ball hanging over the rim wobbles round it and drops
   if(d<FG.cupR+FG.R*.45&&v<.55){mem.edge+=dt;if(mem.edge>.18)return {type:'rim',a:v};}else mem.edge=0;}
  hit=hit??null;
 }
 // walls and posts (air and ground)
 if(!b.rest){const gy=heightAt(H,b.x,b.z);
  for(let i=0;i<H.nw;i++){const o=i*6,ax=H.walls[o],az=H.walls[o+1],dx=H.walls[o+2]-ax,dz=H.walls[o+3]-az,l2=dx*dx+dz*dz;const t=Math.max(0,Math.min(1,((b.x-ax)*dx+(b.z-az)*dz)/l2)),px=ax+dx*t,pz=az+dz*t;
   const top=heightAt(H,px,pz)+H.walls[o+4];if(b.y-FG.R>top)continue;const ex=b.x-px,ez=b.z-pz,dd=Math.sqrt(ex*ex+ez*ez),th=H.walls[o+5]===2?.55:.2;
   if(dd<FG.R+th&&dd>1e-6){const nx=ex/dd,nz=ez/dd,vn=b.vx*nx+b.vz*nz;if(vn<0){const kind=H.walls[o+5],e=kind===2?.12:kind===1?.35:.55;b.vx-=(1+e)*vn*nx;b.vz-=(1+e)*vn*nz;if(kind===2){b.vx*=.5;b.vz*=.5;}b.x=px+nx*(FG.R+th);b.z=pz+nz*(FG.R+th);hit={type:'wall',a:-vn,k:kind};}}}
  for(let i=0;i<H.np;i++){const o=i*5,ex=b.x-H.posts[o],ez=b.z-H.posts[o+1],rr=H.posts[o+2]+FG.R,top=heightAt(H,H.posts[o],H.posts[o+1])+H.posts[o+3];if(b.y-FG.R>top)continue;const dd=Math.sqrt(ex*ex+ez*ez);
   if(dd<rr&&dd>1e-6){const nx=ex/dd,nz=ez/dd,vn=b.vx*nx+b.vz*nz;if(vn<0){const kind=H.posts[o+4],e=kind===1?.2:kind===2?.45:.6;b.vx-=(1+e)*vn*nx;b.vz-=(1+e)*vn*nz;b.x=H.posts[o]+nx*rr;b.z=H.posts[o+1]+nz*rr;hit={type:'wall',a:-vn,k:10+kind};}}}
  void gy;}
 return hit;
}
/** The cup rule for a rolling ball entering the hole at (cx,cz) from the cup centre with velocity (vx,vz). */
export function cupResult(cx:number,cz:number,vx:number,vz:number):'drop'|'lip'|'hop'{const v=Math.hypot(vx,vz)||1e-6,b=Math.abs(cx*vz-cz*vx)/v,chord=2*Math.sqrt(Math.max(0,FG.cupR*FG.cupR-b*b)),vmax=chord/FG.dropT;
 cupN.v=vmax;cupN.b=b;if(v<=vmax)return 'drop';if(v<=vmax*FG.lipX||b>FG.cupR*.55)return v<=vmax*2.6?'lip':'hop';return 'hop';}
/** The fastest a ball can be going and still drop, for a line `b` metres off the middle (0 = dead centre). */
export const cupMaxSpeed=(b:number)=>2*Math.sqrt(Math.max(0,FG.cupR*FG.cupR-b*b))/FG.dropT;

/* ---- scoring ---- */
export const scoreName=(kicks:number,par:number)=>kicks>FG.maxKicks?'Pick up':kicks===1?'Ace!':kicks-par<=-3?'Albatross!':kicks-par===-2?'Eagle!':kicks-par===-1?'Birdie!':kicks===par?'Par':kicks-par===1?'Bogey':kicks-par===2?'Double bogey':`+${kicks-par}`;
export function holePoints(kicks:number,par:number,air:boolean,longPutt:boolean){if(kicks>FG.maxKicks)return 0;const base=Math.max(FG.worstPts,FG.parPts-FG.kickPts*(kicks-par));return base+(air?FG.airPts:0)+(longPutt?FG.longPuttPts:0);}

/* ---- the game ---- */
export type FgMode='course'|'daily'|'hole';
export type FgPhase='aim'|'fly'|'roll'|'rest'|'holed'|'splash'|'done';
export type FgStats={splash:number;oob:number;sand:number;rough:number;lip:number;putts:number;long:number;chip:number;pass:number;short:number;past:number;leaves:number;wall:number;check:number;onGreenIn:number};
export type FgResult={hole:string;ix:number;par:number;kicks:number;points:number;holed:boolean;air:boolean;longPutt:boolean;from:number;stats:FgStats};
export type FgEvent={type:'kick'|'land'|'bounce'|'roll'|'stop'|'splash'|'oob'|'wall'|'leaves'|'cup'|'lip'|'hop'|'rim'|'plug'|'pickup'|'hole'|'tee'|'over'|'check';x:number;y:number;z:number;a:number;k:number;word:string};
const zeroStats=():FgStats=>({splash:0,oob:0,sand:0,rough:0,lip:0,putts:0,long:0,chip:0,pass:0,short:0,past:0,leaves:0,wall:0,check:0,onGreenIn:0});
export type FgState={mode:FgMode;seed:number;order:number[];ix:number;hole:Hole;ball:Ball;phase:FgPhase;kicks:number;lie:Surf;from:[number,number];lastShot:Shot|null;
 total:number;results:FgResult[];stats:FgStats;restT:number;over:boolean;kickFrom:number;airIn:boolean;mem:{trees:number;over:boolean;edge:number};daily:ReturnType<typeof footgolfDaily>|null;flightMax:number;landed:boolean};
export type FootGolf=ReturnType<typeof createFootGolf>;

export function createFootGolf(o:{mode:FgMode;seed:number;hole?:number;day?:string}){
 const daily=o.mode==='daily'?footgolfDaily(o.day??'2026-01-01'):null;
 const order=o.mode==='course'?HOLES.map((_,i)=>i):[daily?daily.hole:Math.max(0,Math.min(HOLES.length-1,o.hole??0))];
 const r=rng(o.seed);
 const make=(k:number)=>{const ix=order[k];return daily?buildHole(ix,{cup:daily.cup,windDir:daily.windDir,windK:daily.windK,tilt:daily.tilt,seed:daily.seed}):buildHole(ix,{cup:Math.floor(r()*3),windK:r(),windDir:HOLES[ix].wind[0]+(r()-.5)*50,seed:o.seed});};
 const H0=make(0);
 const st:FgState={mode:o.mode,seed:o.seed,order,ix:0,hole:H0,ball:newBall(),phase:'aim',kicks:0,lie:S.tee,from:[H0.def.tee[0],H0.def.tee[1]],lastShot:null,total:0,results:[],stats:zeroStats(),restT:0,over:false,kickFrom:0,airIn:false,mem:{trees:0,over:false,edge:0},daily,flightMax:0,landed:false};
 const q:FgEvent[]=[];
 const ev=(type:FgEvent['type'],a=0,k=0,word='')=>{const b=st.ball;q.push({type,x:b.x,y:b.y,z:b.z,a,k,word});};
 const place=(x:number,z:number)=>{const b=st.ball;b.x=x;b.z=z;b.y=heightAt(st.hole,x,z)+FG.R;b.vx=b.vy=b.vz=b.wx=b.wy=b.wz=0;b.air=false;b.rest=true;st.lie=surfaceAt(st.hole,x,z);if(st.lie===S.water||st.lie===S.oob)st.lie=S.rough;};
 const startHole=()=>{const H=st.hole;place(H.def.tee[0],H.def.tee[1]);st.lie=S.tee;st.kicks=0;st.stats=zeroStats();st.phase='aim';st.from=[H.def.tee[0],H.def.tee[1]];st.lastShot=null;ev('tee',st.ix,H.ix,H.def.lesson);};
 startHole();
 const cupDist=()=>Math.hypot(st.ball.x-st.hole.cup[0],st.ball.z-st.hole.cup[1]);
 const endHole=(holed:boolean)=>{const H=st.hole,kicks=holed?st.kicks:FG.maxKicks+1,longPutt=holed&&!st.airIn&&st.kickFrom>=FG.longPutt,points=holePoints(kicks,H.def.par,holed&&st.airIn,longPutt);
  st.results.push({hole:H.def.id,ix:H.ix,par:H.def.par,kicks,points,holed,air:holed&&st.airIn,longPutt,from:Math.round(st.kickFrom*10)/10,stats:{...st.stats}});st.total+=points;st.phase='done';st.over=st.ix>=st.order.length-1;
  ev(holed?'hole':'pickup',kicks,points,scoreName(kicks,H.def.par));if(st.over)ev('over',st.total);};
 const after=()=>{// the ball came to rest: next kick, pick up, or penalty drop
  if(st.kicks>=FG.maxKicks){endHole(false);return;}st.phase='rest';st.restT=.55;};
 const penalty=(type:'splash'|'oob')=>{st.kicks++;if(type==='splash')st.stats.splash++;else st.stats.oob++;ev(type,0,0,type==='splash'?'SPLASH! +1':'OUT! +1');st.phase='splash';st.restT=1.1;};
 return{state:st,
  /** Take a kick (in the aim phase only). */
  kick(shot:Shot){if(st.phase!=='aim')return false;const b=st.ball,H=st.hole;st.from=[b.x,b.z];st.kickFrom=cupDist();st.kicks++;st.lastShot={...shot};st.airIn=false;st.mem.trees=0;st.mem.over=false;st.mem.edge=0;st.flightMax=b.y;st.landed=false;
   if(st.lie===S.sand)st.stats.sand++;else if(st.lie===S.rough)st.stats.rough++;
   if(shot.kind==='putt')st.stats.putts++;else if(shot.kind==='long')st.stats.long++;else if(shot.kind==='chip')st.stats.chip++;else st.stats.pass++;
   const sp=launch(b,shot,st.lie);st.phase=b.air?'fly':'roll';ev('kick',sp,KICK_ORDER.indexOf(shot.kind),KICKS[shot.kind].foot);void H;return true;},
  step(){const b=st.ball,H=st.hole;
   if(st.phase==='rest'||st.phase==='splash'){st.restT-=FG.step;if(st.restT<=0){if(st.phase==='splash'){place(st.from[0],st.from[1]);if(st.kicks>=FG.maxKicks){endHole(false);return;}}st.phase='aim';}return;}
   if(st.phase!=='fly'&&st.phase!=='roll')return;
   const wasAir=b.air,h=ballStep(H,b,FG.step,st.mem);if(b.y>st.flightMax)st.flightMax=b.y;
   if(h){switch(h.type){
    case 'water':penalty('splash');return;case 'oob':penalty('oob');return;
    case 'air-cup':st.airIn=true;b.x=H.cup[0];b.z=H.cup[1];b.vx=b.vy=b.vz=0;b.air=false;b.rest=true;st.phase='holed';ev('cup',h.a,1,st.kicks===1?'ACE!':'IN THE AIR!');endHole(true);return;
    case 'cup':case 'rim':b.vx=b.vy=b.vz=0;b.rest=true;b.x=H.cup[0];b.z=H.cup[1];st.phase='holed';if(h.type==='rim')ev('rim',h.a,0,'ROUND THE RIM...');ev('cup',h.a,0,'IN!');endHole(true);return;
    case 'lip':st.stats.lip++;ev('lip',h.a,0,'LIP OUT!');break;case 'hop':st.stats.lip++;ev('hop',h.a,0,'TOO QUICK!');break;
    case 'plug':st.stats.sand++;ev('plug',h.a,S.sand,'PLUGGED!');break;
    case 'leaves':st.stats.leaves++;ev('leaves',h.a,h.k??0,'LEAVES!');break;case 'wall':st.stats.wall++;ev('wall',h.a,h.k??0,'');break;
    case 'bounce':if(!st.landed){st.landed=true;ev('land',h.a,h.k??0,'');}else ev('bounce',h.a,h.k??0,'');break;
    case 'roll':{if(!st.landed){st.landed=true;ev('land',h.a,h.k??0,'');}const back=st.lastShot?.kind==='chip'&&wasAir;if(back&&Math.hypot(b.vx,b.vz)<3){st.stats.check++;ev('check',h.a,0,'CHECKED!');}ev('roll',h.a,h.k??0,'');break;}
    case 'stop':{const d=cupDist(),last=st.lastShot;if(last&&(last.kind==='putt'||last.kind==='pass')&&st.kickFrom<25&&d>.6){
      // short or past: along the line from where it was kicked
      const fx=H.cup[0]-st.from[0],fz=H.cup[1]-st.from[1],along=((b.x-st.from[0])*fx+(b.z-st.from[1])*fz)/(Math.hypot(fx,fz)||1);if(along<st.kickFrom)st.stats.short++;else st.stats.past++;}
     st.lie=surfaceAt(H,b.x,b.z);ev('stop',d,st.lie,'');after();return;}
   }}
   st.phase=b.air?'fly':'roll';
   if(b.t>40&&!b.rest){b.rest=true;st.lie=surfaceAt(H,b.x,b.z);after();}
  },
  advance(dt:number,acc={t:0}){let t=Math.min(.1,dt)+acc.t;while(t>=FG.step){this.step();t-=FG.step;}acc.t=t;},
  drain(fn:(e:FgEvent)=>void){for(let i=0;i<q.length;i++)fn(q[i]);q.length=0;},
  /** Next hole of the course. false when the round is over. */
  next(){if(st.phase!=='done'||st.over)return false;st.ix++;st.hole=make(st.ix);startHole();return true;},
  cupDist,
 };
}

/** The suggested kick for the ball's lie and distance. */
export function suggestKick(st:FgState):KickKind{const d=Math.hypot(st.ball.x-st.hole.cup[0],st.ball.z-st.hole.cup[1]);
 if(st.lie===S.green&&d<16)return 'putt';if(st.lie===S.sand)return 'chip';if(d<22&&st.lie!==S.rough)return st.lie===S.green||st.lie===S.fairway||st.lie===S.stone?'pass':'chip';if(d<34)return 'chip';if(d<46)return 'pass';return 'long';}
/** The aim the view starts with: at the cup, or at the next turn of the fairway when the cup is far or round a corner. */
export function startYaw(st:FgState){const b=st.ball,r=st.hole.route,cd=Math.hypot(b.x-st.hole.cup[0],b.z-st.hole.cup[1]);let tx=st.hole.cup[0],tz=st.hole.cup[1];
 if(cd>48){for(let i=2;i<r.length-2;i+=2){const d=Math.hypot(r[i]-b.x,r[i+1]-b.z);const toCup=Math.hypot(r[i]-st.hole.cup[0],r[i+1]-st.hole.cup[1]);if(toCup<cd-6&&d>12){tx=r[i];tz=r[i+1];break;}}}
 return Math.atan2(tx-b.x,-(tz-b.z));}
/** Power for a kick that reaches `dist` metres (flat ground estimate, used by the suggestion and the bots). */
export function powerFor(H:Hole,kind:KickKind,dist:number,lie:Surf,yaw:number,from:{x:number;z:number}){let lo=0,hi=1;for(let i=0;i<14;i++){const p=(lo+hi)/2,b=newBall();b.x=from.x;b.z=from.z;b.y=heightAt(H,b.x,b.z)+FG.R;launch(b,{kind,power:p,yaw,curl:0},lie);
  const mem={trees:-1>>>0,over:true,edge:-1e9};for(let n=0;n<4000&&!b.rest;n++){const h=ballStep(H,b,FG.step,mem);if(h&&(h.type==='water'||h.type==='oob'||h.type==='plug'))break;}
  const d=Math.hypot(b.x-from.x,b.z-from.z);if(d<dist)lo=p;else hi=p;}return (lo+hi)/2;}

/** The preview: the real physics from the ball for this shot, `frac` of the way. Writes x,y,z triples into out; returns the count. */
const PB=newBall(),PM={trees:0,over:false,edge:0};
export function predict(st:FgState,shot:Shot,out:Float32Array,frac:number,every=6){const H=st.hole,b=PB,src=st.ball;b.x=src.x;b.y=src.y;b.z=src.z;launch(b,shot,st.lie);PM.trees=0;PM.over=false;PM.edge=0;
 const max=out.length/3;let n=0,steps=0,lastHit=0;const raw=Math.min(max*every,4800);
 for(;steps<raw&&!b.rest;steps++){const h=ballStep(H,b,FG.step,PM);if(steps%every===0&&n<max){out[n*3]=b.x;out[n*3+1]=b.y;out[n*3+2]=b.z;n++;}if(h&&(h.type==='water'||h.type==='oob'||h.type==='cup'||h.type==='air-cup'||h.type==='rim')){lastHit=1;break;}}
 void lastHit;return Math.max(0,Math.min(n,Math.ceil(n*frac)));}

/* ---- the tip after a hole, from what happened ---- */
export type FgTip={title:string;line:string};
export function tipFor(r:FgResult):FgTip{const s=r.stats,d=HOLES[r.ix];
 if(s.splash+s.oob>0)return {title:'Pick a safe target',line:'A footballer plays the pass that is on. Aim for the wide part of the fairway or the bridge, then attack from there.'};
 if(s.sand>0&&s.chip===0)return {title:'Chip or drive',line:'Sand and long grass grab a ball on the floor. Chip it: under the ball, so it flies over what is in the way.'};
 if(s.lip>0)return {title:'Weight of pass',line:'Too quick at the cup and it spins out. Like a pass to a teammate’s feet: arrive gently, not hard.'};
 if(s.short>s.past&&s.short>0)return {title:'Weight of pass',line:d.slope[1]<-.02?'Uphill takes pace off. Give it more weight than you think.':'Never up, never in: a pass that stops short cannot go in. Get it to the cup.'};
 if(s.past>0&&s.putts>=2)return {title:'Read the ground',line:'Downhill the ball keeps running. Look at the arrows on the green and play it softer and higher on the slope.'};
 if(s.leaves+s.wall>1)return {title:'Read the ground',line:'Look before you kick: trees, walls and hedges stop a ball. Bend it round with the curl dial or go over with a chip.'};
 if(s.check>0)return {title:'Chip or drive',line:'Your chip checked on landing: that is backspin. A chip stops quickly; a long kick runs on.'};
 if(r.kicks<=r.par&&s.long>0)return {title:'Laces or inside of the foot',line:'Laces for distance, inside of the foot for control. You used both: that is how the pros do it.'};
 if(s.long===0&&HOLES[r.ix].par>=4)return {title:'Laces or inside of the foot',line:'On a long hole, strike through the middle of the ball with your laces to cover the ground.'};
 return {title:'Today’s lesson',line:d.lesson};}

/** Coins for a run (screen games earn, never charge): 1 per 600 points. */
export const footgolfCoins=(points:number)=>Math.floor(Math.max(0,points)/600);
