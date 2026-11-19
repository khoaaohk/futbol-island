/**
 * Roll It In (Nov 17 2026, docs/arcade-aaa/rollball-direction.md): you ARE the football. Pure rules and physics, no DOM, no three.js,
 * a fixed 1/120 s step and a seeded RNG (mulberry32), so a seed always deals the same run: the Daily Roll is the same for everyone.
 * The world is a set of terrain PIECES (flat blocks, ramps along z or x, half-pipes) standing in water. The ball rolls on the highest
 * piece top under it, slopes pull it downhill, every surface has its own grip and drag, steps under STEP are climbed and anything
 * taller is a wall. Leave the terrain and the ball falls; into the water costs a heart and the ball goes back to the checkpoint.
 * Levels are a chain of hand-made MODULES (MODULES below: one small puzzle each, entry at z=0, exit at z=len, both at height 0, a
 * difficulty rating and the mechanics it uses) picked by a seeded generator (levelPlan), then the goal. Each module has a scripted
 * solution (bot) that tests/rollball-core.cjs plays through this same physics, so every module is solvable by construction.
 * Puzzles are triggers and receivers on signals: plates (latch, hold, timed, stay, order, heavy), switch posts, cone stacks to knock
 * down, a key to carry to a lock; gates, bridges, lifts, water that drains and fans that blow. Chained in later modules.
 * Teaches (AGENTS.md): "Look before you roll. Plan the next touch."
 */

export const RB={
 hearts:3,r:.35,G:16,step:.26,dt:1/120,vmax:10.5,water:-1.2,
 /** points: a module cleared = modPts x level factor; a level = levelPts x level factor + secPts per whole second under par;
  *  a star = starPts; a clean level (no heart lost) multiplies the level bonus by the streak (x1.25, x1.5 ... up to x3). */
 modPts:50,levelPts:200,secPts:10,starPts:100,streakStep:.25,streakMax:3,levelStep:.1,levelMax:3,
 /** from this level on each level has a clock: par x a share that shrinks 0.04 a level from clockMul to clockMin, + clockAdd seconds.
  *  Running out costs a heart and the clock starts again (the ball goes back to the checkpoint). */
 /** levels up to this one are gentle: a fall puts the ball back close by (level 1: no heart lost) */gentle:3,
 clockFrom:4,clockMul:2.2,clockMin:1.15,clockStep:.04,clockAdd:10,
 knock:3.0,knockGlance:.6,knockFast:1.5,
 /** medal marks from the drifting-thumb bot (tests/rollball-core.cjs --bots): noise 1.0-1.4 runs score about 850-7100 (median
  *  near 2500), so bronze comes in a few tries; a steady player passes silver; gold needs a long clean streak. */
 medals:[1500,6000,20000] as readonly number[],
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of RB.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=RB.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:RB.medals[m]-score};}
export const rollballCoins=(score:number)=>Math.floor(Math.max(0,score)/300);
export const levelFactor=(level:number)=>Math.min(RB.levelMax,1+RB.levelStep*(Math.max(1,level)-1));
export const streakFactor=(streak:number)=>Math.min(RB.streakMax,1+RB.streakStep*Math.max(0,streak-1));

/** Surfaces: accel (how hard a push moves the ball), drag (how fast it slows), wall bounce. */
export type Surf='grass'|'long'|'sand'|'ice'|'mud'|'wood'|'metal'|'rubber'|'stone';
export const SURF:Record<Surf,{accel:number;drag:number;bounce:number;name:string}>={
 grass:{accel:9,drag:1.3,bounce:.35,name:'Short grass'},long:{accel:7,drag:3,bounce:.3,name:'Long grass'},sand:{accel:6.5,drag:4.2,bounce:.2,name:'Sand'},
 ice:{accel:3.2,drag:.18,bounce:.5,name:'Wet tiles'},mud:{accel:4,drag:7.5,bounce:.1,name:'Mud'},wood:{accel:10,drag:.75,bounce:.4,name:'Planks'},
 metal:{accel:8.5,drag:.45,bounce:.45,name:'Metal'},rubber:{accel:9,drag:1.3,bounce:1.15,name:'Rubber'},stone:{accel:8.5,drag:1.15,bounce:.35,name:'Stone'},
};
export type Theme=0|1|2|3;
export const THEMES=['Training pitch','Beach','Rooftops','Stadium at night'] as const;

/** A terrain piece. kind 0 flat (top a), 1 ramp along z (a at z0 -> b at z1), 2 ramp along x (a at x0 -> b at x1), 3 half-pipe across x
 *  (a at the middle, a+b at both lips), 4 smooth hill along z (a at z0 -> b at z1, level at both ends so it meets flat ground without a
 *  kink), 5 mound along z (a at both ends, a+b at the middle; a negative b is a dip), 6 smooth bank across x (a at x0 -> b at x1). dy: a moving offset (gates sink, bridges rise, lifts move). role: 0 terrain, 1 gate, 2 bridge, 3 lift. */
export type Piece={x0:number;x1:number;z0:number;z1:number;y0:number;kind:0|1|2|3|4|5|6;a:number;b:number;surf:Surf;dy:number;role:0|1|2|3;mod:number;/** physics only (the goal's frame: the view draws posts and net) */hidden?:boolean};
export type PlateKind='latch'|'hold'|'timed'|'stay'|'order'|'heavy'|'boost';
export type Plate={x:number;z:number;y:number;half:number;kind:PlateKind;sig:number;T:number;idx:number;group:number;/** boost pads: the velocity they give the ball */bx:number;bz:number;
 /** live */pressed:boolean;timer:number;lit:boolean;mod:number};
export type PostKind='cone'|'switch'|'bumper'|'lock'|'sweeper';
export type Post={x:number;z:number;y:number;r:number;kind:PostKind;sig:number;/** sweepers slide about their home (hx,hz): reach ax / az, one lap every per seconds, phase ph (0..1) */hx:number;hz:number;ax:number;az:number;per:number;ph:number;
 /** live */down:boolean;cool:number;on:boolean;vx:number;vz:number;wob:number;mod:number};
export type ObjKind='crate'|'tball';
export type Obj={kind:ObjKind;x:number;y:number;z:number;vx:number;vy:number;vz:number;r:number;mass:number;hx:number;hz:number;hy:number;mod:number;air:boolean;spin:number};
export type Pick={kind:'star'|'key';x:number;y:number;z:number;taken:boolean;mod:number};
/** Receivers: a gate / bridge / lift piece driven by signals (need: all of them on), a pool that drains, a fan that blows. */
export type Recv={kind:'gate'|'bridge'|'lift'|'drain'|'fan';piece:number;need:number[];open:number;
 /** lift: rise and period; drain / fan: the area; fan: the hover height and the push */h:number;period:number;x0:number;x1:number;z0:number;z1:number;wy:number;fz:number;mod:number};

/* ---------------- the modules ---------------- */
type Bot=(['waitm',number,number]|['go',number,number,number?]|['run',number,number]|['wait',number]|['waitr',number]|['stop',number]|['push',number,number,number]|['lift',number])[];
/** A module as authored: local coordinates (x across, z along, entry at z 0). */
export type ModuleDef={id:string;name:string;theme:Theme;rating:number;mech:string[];len:number;par:number;
 build:(m:Builder)=>void;
 /** the scripted solution the test bot plays (local coordinates; the last step rolls out of the exit). */bot:Bot;
 /** how to reach the star (optional extra steps run before the bot's first step). */starBot?:Bot};
export type Builder={
 box:(x0:number,x1:number,z0:number,z1:number,h:number,surf?:Surf)=>number;
 rampZ:(x0:number,x1:number,z0:number,z1:number,h0:number,h1:number,surf?:Surf)=>number;
 rampX:(x0:number,x1:number,z0:number,z1:number,h0:number,h1:number,surf?:Surf)=>number;
 pipe:(x0:number,x1:number,z0:number,z1:number,h:number,depth:number,surf?:Surf)=>number;
 /** smooth terrain: a hill from h0 to h1 along z, a mound (or dip, rise < 0) along z, a bank from h0 at x0 to h1 at x1 */
 hillZ:(x0:number,x1:number,z0:number,z1:number,h0:number,h1:number,surf?:Surf)=>number;
 bumpZ:(x0:number,x1:number,z0:number,z1:number,h:number,rise:number,surf?:Surf)=>number;
 bankX:(x0:number,x1:number,z0:number,z1:number,h0:number,h1:number,surf?:Surf)=>number;
 /** a gate across x0..x1 at z (0.35 deep, 1.1 tall over floor h) that opens when all `need` signals are on */
 gate:(x0:number,x1:number,z:number,need:number[],h?:number)=>number;
 bridge:(x0:number,x1:number,z0:number,z1:number,h:number,need:number[],surf?:Surf)=>number;
 lift:(x0:number,x1:number,z0:number,z1:number,rise:number,period:number,surf?:Surf)=>number;
 plate:(x:number,z:number,kind:PlateKind,sig:number,o?:{y?:number;T?:number;idx?:number;group?:number})=>number;
 post:(x:number,z:number,kind:PostKind,sig?:number,y?:number)=>number;
 obj:(kind:ObjKind,x:number,z:number,y?:number)=>number;
 star:(x:number,z:number,y?:number)=>void;key:(x:number,z:number,y?:number)=>void;
 drain:(x0:number,x1:number,z0:number,z1:number,wy:number,need:number[])=>void;
 fan:(x0:number,x1:number,z0:number,z1:number,hover:number,push:number,need:number[])=>void;
 goal:(x:number,z:number)=>void;
 /** a boost pad: the ball leaves it at (vx,vz) however it came (Nov 18 AAA pass) */
 boost:(x:number,z:number,vx:number,vz:number,y?:number)=>number;
 /** a sweeper (a keeper dummy on a rail, a crab): slides ax / az either side of (x,z), one lap every per seconds */
 sweeper:(x:number,z:number,ax:number,az:number,per:number,ph?:number,y?:number)=>number;
 /** the level being built (the goal's keeper and the sweepers' pace follow it) */level:number;
};

/** The 17 modules, four themes, rated 1-9. New mechanics come alone first (MECH_ORDER) and are combined in the high-rated ones. */
export const MODULES:readonly ModuleDef[]=[
 {id:'first-touch',name:'First Touch',theme:0,rating:1,mech:['roll','plate'],len:12,par:10,
  build:m=>{m.box(-2,2,0,3.5,0,'grass');m.bumpZ(-2,2,3.5,7.5,0,.5,'grass');m.box(-2,2,7.5,12,0,'grass');m.box(2,4,5,8,0,'grass');m.star(3.1,6.5);
   m.plate(0,8.8,'latch',0);m.gate(-2,2,10.2,[0]);},
  bot:[['go',0,8.8],['waitr',0],['go',0,12.6]],starBot:[['go',1.5,4.5],['go',3.1,6.5],['go',1,7.5]]},
 {id:'steps',name:'Up the Steps',theme:0,rating:2,mech:['steps','long'],len:16,par:14,
  build:m=>{m.box(-2.5,2.5,0,4,0,'grass');m.box(-2.5,2.5,4,5,.2,'grass');m.box(-2.5,2.5,5,6,.4,'grass');m.box(-2.5,2.5,6,11,.6,'long');m.rampZ(-1.5,1.5,11,13,.6,0,'grass');m.box(-2,2,13,16,0,'grass');
   m.plate(-1.6,9.6,'latch',0,{y:.6});m.star(2,7.2,.6);m.gate(-2,2,14,[0]);},
  bot:[['go',0,3.5],['go',-1.4,7],['go',-1.6,9.6],['go',0,10.6],['waitr',0],['go',0,16.6]],starBot:[['go',0,3.5],['go',2,7.2]]},
 {id:'cone-knock',name:'Knock the Cones',theme:0,rating:2,mech:['cone','hill'],len:16,par:18,
  build:m=>{m.box(-2.5,2.5,0,3,0,'grass');m.hillZ(-2,2,3,5,0,1.1,'grass');m.box(-2,2,5,6,1.1,'grass');m.hillZ(-2,2,6,8.5,1.1,0,'grass');m.box(-3,3,8.5,10.2,0,'grass');m.box(-3,3,10.2,13,0,'long');m.box(-2,2,13,16,0,'grass');
   m.post(-1.2,9.6,'cone',0);m.post(1.4,9.6,'cone',1);m.star(-2.4,12.4);m.gate(-2,2,13.4,[0,1]);},
  bot:[['go',0,5.5],['run',-1.2,9.6],['go',0,8],['go',0,5.5],['run',1.4,9.6],['go',0,12.6],['waitr',0],['go',0,16.6]],starBot:[['go',-2.4,12.4],['go',0,8]]},
 {id:'hold-door',name:'Hold the Door',theme:0,rating:3,mech:['crate','hold'],len:14,par:25,
  build:m=>{m.box(-3,3,0,14,0,'grass');m.obj('crate',-1.5,4);m.plate(-1.5,8,'heavy',0);m.gate(-3,3,10,[0]);m.star(2.4,1.6);},
  bot:[['push',0,-1.5,8],['go',1,9],['waitr',0],['go',0,14.6]],starBot:[['go',2.4,1.6],['go',0,1.5]]},
 {id:'stay-put',name:'Stay Put',theme:0,rating:3,mech:['mud','stay'],len:14,par:20,
  build:m=>{m.box(-3,3,0,14,0,'grass');m.box(0,3,5,9,0,'mud');m.box(-3,-1,3,6,0,'long');m.plate(1.5,7,'stay',0,{T:1.5});m.gate(-3,3,10.5,[0]);m.star(-2.4,4.5);},
  bot:[['go',1.5,7],['stop',1.8],['waitr',0],['go',0,14.6]],starBot:[['go',-2.4,4.5],['go',0,5]]},
 {id:'plank-walk',name:'Plank Walk',theme:1,rating:2,mech:['sand','plank'],len:17,par:20,
  build:m=>{m.box(-3,3,0,4,0,'sand');m.box(-.6,.6,4,10,0,'wood');m.box(2.3,2.9,4,10,0,'wood');m.box(-3,3,10,14,0,'sand');m.box(-2,2,14,17,0,'sand');
   m.star(2.6,7);m.plate(2,12.3,'latch',0);m.gate(-2,2,14.6,[0]);},
  bot:[['go',0,3.4],['go',0,10.6,3],['go',2,12.3],['go',0,13.2],['waitr',0],['go',0,17.6]],starBot:[['go',2.6,3.6],['go',2.6,9.4,2.5],['go',1,11],['go',0,10.4]]},
 {id:'quick-gate',name:'Quick Gate',theme:1,rating:4,mech:['timed','boardwalk'],len:18,par:14,
  build:m=>{m.box(-3,3,0,3,0,'wood');m.box(-3,-1.5,3,12,0,'wood');m.box(1.5,3,3,12,0,'wood');m.box(-3,3,12,14,0,'wood');m.box(-1.5,1.5,14,18,0,'sand');
   m.plate(-2.25,4.2,'timed',0,{T:4.5});m.gate(-1.5,1.5,15,[0]);m.star(2.25,6);},
  bot:[['go',-2.25,4.2],['go',-2.25,12.8,7],['go',0,14.2,6],['go',0,18.6,6]],starBot:[['go',2.25,1.6],['go',2.25,6],['go',2.25,2],['go',0,1.6]]},
 {id:'tide-switch',name:'Low Tide',theme:1,rating:4,mech:['switch','drain','dune'],len:15,par:38,
  build:m=>{m.box(-2,2,0,4,0,'sand');m.box(2,5,0,4,0,'sand');m.hillZ(3,5,4,7,0,1,'sand');m.box(3,5,7,9.5,1,'sand');m.post(4,9,'switch',0,1);
   m.hillZ(-2,2,4,5.5,0,-.8,'sand');m.box(-2,2,5.5,9.5,-.8,'sand');m.hillZ(-2,2,9.5,11,-.8,0,'sand');m.box(-2,2,11,15,0,'sand');m.drain(-2,2,4,11,-.1,[0]);m.star(0,7.5,-.8);},
  bot:[['go',3.5,2],['go',4,6.5],['run',4,9],['wait',0],['go',4,6],['go',3.2,2.5],['go',0,2.8],['go',0,7.5,3],['go',0,15.6]]},
 {id:'shell-order',name:'One, Two, Three',theme:1,rating:5,mech:['order'],len:14,par:28,
  build:m=>{m.box(-4,4,0,12,0,'sand');m.box(-2,2,12,14,0,'sand');m.plate(2.5,4.5,'order',0,{idx:0,group:0});m.plate(0,8.6,'order',0,{idx:1,group:0});m.plate(-2.6,4,'order',0,{idx:2,group:0});
   m.gate(-4,4,10.6,[0]);m.star(3.4,9.6);},
  bot:[['go',2.5,4.5],['go',.6,7],['go',0,8.6],['go',-1.6,7],['go',-2.6,4],['go',-1,8.5],['waitr',0],['go',0,14.6]],starBot:[['go',3.4,9.6],['go',1,7.6]]},
 {id:'lift-up',name:'Going Up',theme:2,rating:3,mech:['lift','roof'],len:19,par:21,
  build:m=>{m.box(-3,3,0,6,0,'stone');m.lift(-1,1,6,9,1.5,5,'metal');m.box(-3,3,9,13,1.5,'stone');m.rampZ(-1.5,1.5,13,16,1.5,0,'metal');m.box(-2,2,16,19,0,'stone');
   m.plate(2,11,'latch',0,{y:1.5});m.gate(-2,2,17,[0]);m.star(-2.3,12.3,1.5);},
  bot:[['go',0,5.2],['lift',0],['go',0,7.6],['stop',.4],['lift',1],['go',0,10.6],['go',2,11],['go',0,12.6],['go',0,16.4],['waitr',1],['go',0,19.6]]},
 {id:'jump-gap',name:'Mind the Gap',theme:2,rating:5,mech:['jump','metal'],len:21,par:13,
  build:m=>{m.box(-2,2,0,4,0,'stone');m.rampZ(-1,1,4,8,0,1,'metal');m.box(-2.5,2.5,9.6,15,.4,'stone');m.rampZ(-1.5,1.5,15,17,.4,0,'stone');m.box(-2,2,17,21,0,'stone');
   m.plate(1.5,13,'latch',0,{y:.4});m.gate(-2,2,18,[0]);m.star(0,9.2,1);},
  bot:[['go',0,1],['run',0,9.6],['go',0,12],['go',1.5,13],['go',0,14.5],['go',0,17.4],['waitr',0],['go',0,21.6]]},
 {id:'fan-street',name:'Fan Street',theme:2,rating:6,mech:['switch','fan'],len:16,par:12,
  build:m=>{m.box(-3,3,0,6,0,'stone');m.box(-2.5,2.5,11,16,0,'stone');m.post(2.5,3,'switch',0);m.fan(-1.5,1.5,6,11,.9,4,[0]);m.star(0,8.5,.5);},
  bot:[['go',1,3],['run',2.5,3],['wait',0],['go',0,4.6],['go',0,12,3.5],['go',0,16.6]]},
 {id:'key-run',name:'Key Run',theme:2,rating:6,mech:['key','lock','ice'],len:18,par:16,
  build:m=>{m.box(-3,3,0,4,0,'stone');m.box(-3,3,4,10,0,'ice');m.box(-3,3,10,15,0,'stone');m.box(-2,2,15,18,0,'stone');m.key(2.2,8.6);m.post(2.5,11.6,'lock',0);m.gate(-3,3,12.4,[0]);m.star(-2.4,8.8);},
  bot:[['go',2.2,3.5,3],['go',2.2,8.6,2.2],['go',1.2,10.8,2.2],['run',2.5,11.6],['waitr',0],['go',0,13,3],['go',0,18.6]],starBot:[['go',-2.4,3.6,3],['go',-2.4,8.8,2],['go',0,9.6,2]]},
 {id:'half-pipe',name:'Half-Pipe',theme:3,rating:6,mech:['pipe','two plates'],len:16,par:18,
  build:m=>{m.box(-2,2,0,3,0,'grass');m.pipe(-3,3,3,12,0,1.2,'metal');m.box(-5.4,-3,5,10,1.2,'stone');m.box(3,5.4,5,10,1.2,'stone');m.box(-5.7,-5.4,5,10,1.9,'stone');m.box(5.4,5.7,5,10,1.9,'stone');m.box(-2,2,12,16,0,'grass');
   m.plate(-4.1,7.5,'latch',0,{y:1.2});m.plate(4.1,7.5,'latch',1,{y:1.2});m.gate(-2,2,13,[0,1]);m.star(0,11);},
  bot:[['go',0,4.5],['go',-1.6,7.5],['run',4.2,7.5],['go',4.1,7.5,1.2],['stop',.3],['run',-4.2,7.5],['go',-4.1,7.5,1.2],['stop',.3],['go',0,8],['go',0,12.4],['waitr',0],['go',0,16.6]]},
 {id:'counterweight',name:'Counterweight',theme:3,rating:7,mech:['crate','scale','bridge'],len:16,par:25,
  build:m=>{m.box(-3,1,0,6,0,'grass');m.box(1,3,0,3,0,'grass');m.rampZ(1,3,3,6,0,1.2,'wood');m.box(1,3,6,7,1.2,'wood');m.bridge(1,3,7,10,1.2,[0],'wood');m.box(1,3,10,11,1.2,'wood');m.rampZ(1,3,11,13,1.2,0,'wood');m.box(-2,3,13,16,0,'grass');
   m.obj('crate',-.6,2.4);m.plate(-2,4.6,'heavy',0);m.star(-2.4,1);},starBot:[['go',-2.4,1],['go',0,.9]],
  bot:[['push',0,-2,4.6],['go',.3,1.5],['go',2,1.8],['waitr',0],['go',2,6.6],['go',2,10.6,4],['go',2,13.4],['go',0,16.6]]},
 {id:'night-combo',name:'Night Shift',theme:3,rating:8,mech:['crate','hold','switch','bridge','timed','bumper'],len:25,par:34,
  build:m=>{m.box(-4,4,0,8,0,'grass');m.obj('crate',-1.5,3);m.plate(-3,6.2,'heavy',0);m.gate(-4,4,8,[0]);m.box(-4,4,8.35,14,0,'grass');m.post(3.3,12.4,'switch',1);
   m.post(-1.8,11,'bumper');m.post(1,10.2,'bumper');m.bridge(-1,1,14,17,0,[1],'wood');m.box(-3,3,17,22,0,'grass');m.plate(2.4,18.6,'timed',2,{T:3.5});m.gate(-2,2,22.3,[2]);m.box(-2,2,22.65,25,0,'grass');m.star(-3.4,12.8);},
  bot:[['push',0,-3,6.2],['go',0,6.6],['waitr',0],['go',0,9.4],['go',2.2,12.4],['run',3.3,12.4],['wait',1],['go',0,13.2],['waitr',1],['go',0,17.6,3],['go',2.4,18.6],['go',0,21.4,6],['go',0,25.6,6]]},
 {id:'final-third',name:'Final Third',theme:3,rating:9,mech:['order','bridge','key','lock','fan','ice'],len:18,par:31,
  build:m=>{m.box(-4,4,0,10,0,'ice');m.box(-4,4,0,2,0,'grass');m.plate(-2.6,3.6,'order',0,{idx:0,group:0});m.plate(2.6,3.6,'order',0,{idx:1,group:0});m.plate(0,6.6,'order',0,{idx:2,group:0});
   m.bridge(4,5,7.6,8.6,0,[0],'wood');m.box(5,7,6.6,9.6,0,'grass');m.key(6,8.1);m.post(-3.2,9.2,'lock',1);m.fan(-1.5,1.5,10,14,.9,4,[1]);m.box(-2,2,14,18,0,'grass');m.star(6.4,9.1);},
  bot:[['go',-2.6,3.6,2.2],['go',0,2.4,2.2],['go',2.6,3.6,2.2],['go',1.4,5.6,2],['go',0,6.6,2],['wait',0],['go',3,8.1,2],['waitr',0],['go',6,8.1,2.5],['go',3.4,8.1,2.5],['go',-2.2,8.6,2.2],['run',-3.2,9.2],['wait',1],['go',0,8.6,2],['go',0,15,3],['go',0,18.6]]},
 /* Nov 17 polish: longer chains on real topography (three or more linked mechanisms where order matters) */
 {id:'over-the-hill',name:'Over the Hill',theme:0,rating:7,mech:['crate','heavy','bridge','hill','cone'],len:23,par:34,
  build:m=>{m.box(-3,0,0,8,0,'grass');m.box(0,3,0,2,0,'grass');m.bumpZ(0,3,2,8,0,1,'long');m.obj('crate',-1.5,2.6);m.plate(-1.5,6.4,'heavy',0);m.star(1.5,5,1);
   m.bridge(-1,1,8,11,0,[0],'wood');m.box(-3,3,11,12,0,'grass');m.hillZ(-3,3,12,14,0,1,'grass');m.box(-3,3,14,16.5,1,'grass');m.hillZ(-3,3,16.5,18.5,1,0,'grass');m.box(-3,3,18.5,23,0,'grass');
   m.post(-2.2,15.3,'cone',1,1);m.plate(2.3,19.6,'latch',2);m.gate(-3,3,21,[1,2]);},
  bot:[['push',0,-1.5,6.4],['go',-.45,5.4],['go',-.45,7.5],['waitr',0],['go',0,11.4,3],['go',-1,13.6],['go',-1.6,14.3],['run',-2.2,15.3],['go',0,16],['go',0,18.6,3],['go',2.3,19.6],['go',0,20.2],['waitr',1],['go',0,23.6]],
  starBot:[['go',1.5,1.6],['go',1.5,5,2.5],['go',1.5,7.6,2],['go',-.6,7.8]]},
 {id:'sandbar-relay',name:'Sandbar Relay',theme:1,rating:7,mech:['switch','drain','key','lock','bridge','timed'],len:22,par:44,
  build:m=>{m.box(-3,4,0,4,0,'sand');m.hillZ(2,4,4,6.5,0,.8,'sand');m.box(2,4,6.5,8.5,.8,'sand');m.post(3.2,8.1,'switch',0,.8);
   m.hillZ(-2,1,4,5.5,0,-.8,'sand');m.box(-2,1,5.5,8.5,-.8,'sand');m.hillZ(-2,1,8.5,10,-.8,0,'sand');m.drain(-2,1,4,10,-.1,[0]);m.key(-.5,7,-.8);
   m.box(-3,-2,4,10,0,'long');m.box(-3,3,10,13,0,'sand');m.post(2.4,11.6,'lock',1);m.plate(-2.3,12,'timed',2,{T:5});
   m.bridge(-1,1,13,16,0,[1],'wood');m.box(-3,3,16,22,0,'sand');m.gate(-3,3,19.6,[2]);m.star(-2.5,7.2);},
  bot:[['go',3,3],['go',3,7.2,3],['run',3.2,8.1],['wait',0],['go',3,5.5],['go',1.2,3],['waitr',0],['go',-.5,4.6,2.5],['go',-.5,7,2.5],['go',-.5,10.4,3],['go',1.4,11.4],['run',2.4,11.6],['wait',1],['waitr',1],
   ['go',-2.3,12],['go',0,13.2,6],['go',0,16.4,6],['go',0,19,6],['go',0,22.6,6]],starBot:[['go',-2.5,3.6],['go',-2.5,7.2],['go',-2.5,4],['go',0,2]]},
 {id:'chimney-run',name:'Chimney Run',theme:2,rating:8,mech:['order','lift','roof','fan','stay'],len:25,par:28,
  build:m=>{m.box(-3,3,0,5,0,'stone');m.plate(2.2,3,'order',0,{idx:0,group:0});m.lift(-1,1,5,8,1.5,5,'metal');m.box(-3,3,8,13,1.5,'stone');m.plate(-2,10.4,'order',0,{idx:1,group:0,y:1.5});m.plate(2,12,'order',0,{idx:2,group:0,y:1.5});
   m.fan(-1.5,1.5,13,18,.9,4,[0]);m.box(-3,3,18,25,0,'stone');m.plate(2,20,'stay',1,{T:1.5});m.gate(-3,3,22.4,[1]);m.star(-2.4,19.4);},
  bot:[['go',2.2,3],['go',0,4.6],['lift',0],['go',0,7.4],['stop',.4],['lift',1],['go',0,9.4],['go',-2,10.4],['go',2,12],['wait',0],['go',0,12.4],['go',0,18.6,3.5],['go',2,20],['stop',1.8],['waitr',2],['go',0,25.6]]},
 {id:'floodlit-valley',name:'Floodlit Valley',theme:3,rating:9,mech:['ball','dip','hold','bridge','bank','key','lock'],len:24,par:26,
  build:m=>{m.box(-4,4,0,4,0,'grass');m.box(-4,-1,4,10,0,'grass');m.hillZ(-1,4,4,7,0,-.6,'long');m.hillZ(-1,4,7,10,-.6,0,'long');m.obj('tball',1.5,3.4);m.plate(1.5,7,'hold',0,{y:-.6});
   m.bridge(-3,-1,10,13,0,[0],'wood');m.box(-4,4,13,20.5,0,'grass');m.bankX(1.5,4,14,18,0,1,'grass');m.box(4,5.5,14,18,1,'grass');m.key(4.7,16,1);
   m.post(-3.2,19,'lock',1);m.post(-.6,16.2,'bumper');m.gate(-4,4,20.5,[1]);m.box(-2,2,20.85,24,0,'grass');m.star(-3.4,1.2);},
  bot:[['go',1.5,1.8],['go',1.5,4.4,2.4],['go',-2.5,3.6],['go',-2,9.4],['waitr',0],['go',-2,13.6,3],['go',3,15.4],['go',4.7,16,3],['go',2,17.4],['go',-2.2,18.6],['run',-3.2,19],['wait',1],['waitr',1],['go',0,24.6]]},
 /* Nov 18 AAA pass: boost pads (speed is a tool) and sweepers (timing), alone first and then chained */
 {id:'speed-strip',name:'Speed Strip',theme:0,rating:3,mech:['boost','cone'],len:19,par:16,
  build:m=>{m.box(-2.5,2.5,0,19,0,'grass');m.box(-4.5,-2.5,9,13,0,'long');m.boost(0,3.2,0,9);m.post(0,7.6,'cone',0);m.post(-1.7,13.6,'cone',1);m.star(-3.8,11);m.gate(-2.5,2.5,16,[0,1]);},
  bot:[['go',0,1.6],['run',0,7.6],['go',1.2,9.6],['run',-1.7,13.6],['go',0,15.2],['waitr',0],['go',0,19.6]],starBot:[['go',-1.8,9.8],['go',-3.8,11],['go',-1.8,10],['go',-1.8,2]]},
 {id:'crab-walk',name:'Crab Walk',theme:1,rating:4,mech:['sweeper','plank'],len:19,par:20,
  build:m=>{m.box(-3,3,0,4,0,'sand');m.box(-1.6,1.6,4,13,0,'wood');m.box(-3,3,13,19,0,'sand');m.sweeper(0,6.4,1.15,0,3.4);m.sweeper(0,10.2,1.15,0,3.4,.5);
   m.plate(-2,15,'latch',0);m.gate(-3,3,16.6,[0]);m.star(-1.25,10.2);},
  bot:[['go',-1.1,5],['waitm',0,1.55],['go',-1.1,8.3,6],['go',1.1,8.8],['waitm',1,1.55],['go',1.1,12,6],['go',-2,15],['go',0,15.8],['waitr',0],['go',0,19.6]]},
 {id:'launch-pad',name:'Launch Pad',theme:2,rating:5,mech:['boost','jump','roof'],len:22,par:14,
  build:m=>{m.box(-2,2,0,5,0,'stone');m.boost(0,3.4,0,9.6);m.rampZ(-1,1,5,8,0,.9,'metal');m.box(-2.5,2.5,10.4,16,.3,'stone');m.rampZ(-1.5,1.5,16,18,.3,0,'stone');m.box(-2,2,18,22,0,'stone');
   m.plate(1.5,14,'latch',0,{y:.3});m.gate(-2,2,19.4,[0]);m.star(0,9.2,1.3);},
  bot:[['go',0,2.2],['run',0,12.6],['go',1.5,14],['go',0,15.4],['go',0,18.6],['waitr',0],['go',0,22.6]]},
 {id:'keeper-drill',name:'Keeper Drill',theme:3,rating:7,mech:['sweeper','boost','timed','cone'],len:25,par:22,
  build:m=>{m.box(-3,3,0,25,0,'grass');m.plate(-2,3,'timed',0,{T:5.5});m.boost(0,5.4,0,9.6);m.sweeper(0,9.5,2.4,0,3.6);m.sweeper(0,11.6,2.4,0,3.6,.5);m.post(0,16.4,'cone',1);
   m.gate(-3,3,19,[0,1]);m.star(2.5,10.55);},
  bot:[['go',-2,3],['go',0,4.2],['waitm',0,.8],['run',0,16.4],['go',0,18.2,7],['go',0,25.6,7]],starBot:[['go',2.5,8.2],['waitm',0,2.6],['go',2.5,10.8,6],['waitm',0,2.6],['go',2.5,8,6],['go',0,2]]},
];
/** The goal at the end of every level (not in the generator's pool). */
export const GOAL_MODULE:ModuleDef={id:'goal',name:'Roll It In',theme:0,rating:0,mech:['goal'],len:7,par:3,
 build:m=>{m.box(-3,3,0,7,0,'grass');m.goal(0,5.6);},bot:[['go',-1.05,3.3],['waitm',0,1.45],['go',-1.05,5.7,7]]};
/** From this level a keeper dummy slides across the goal mouth; it speeds up a little every level down to keeperMin seconds a lap. */
export const KEEPER={from:6,per:3.6,step:.08,min:2,reach:1,back:1.3} as const;
export const keeperPeriod=(level:number)=>Math.max(KEEPER.min,KEEPER.per-KEEPER.step*(level-KEEPER.from));
/** The order a run meets the mechanics (each module's main mechanic is first seen alone). */
export const MECH_ORDER=['roll','steps','cone','sand','lift','crate','mud','timed','switch','order','jump','fan','key','pipe','scale','combo','boost','sweeper'] as const;

export function rollballDailySeed(day:string){let h=0x811c9dc5;const s='rollball:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
export function mulberry(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

/** How many puzzle modules a level has and the highest rating it may use. */
export const levelSize=(level:number)=>level<=2?1:level<=5?2:level<=10?3:level<=16?4:level<=24?5:6;
/** The cap climbs one module a level: level n may use ratings up to the nth easiest module's, so each of the first 17 levels meets one new puzzle. */
export const ratingCap=(level:number)=>{const r=MODULES.map(m=>m.rating).sort((a,b)=>a-b);return r[Math.min(r.length,Math.max(1,Math.floor(level)))-1];};
/**
 * The modules of one level (indices into MODULES). A module rated at most ratingCap(level) that this run has not met yet comes first
 * and alone among new ones (one new puzzle per level); the rest are puzzles already met, the harder ones more likely.
 * `seen` is updated. Deterministic for a given rnd.
 */
export function levelPlan(rnd:()=>number,level:number,seen:Set<number>):number[]{
 const cap=ratingCap(level),n=levelSize(level),out:number[]=[];
 const fresh=MODULES.map((m,i)=>i).filter(i=>MODULES[i].rating<=cap&&!seen.has(i)).sort((a,b)=>MODULES[a].rating-MODULES[b].rating||a-b);
 if(fresh.length){const lowest=MODULES[fresh[0]].rating,pool=fresh.filter(i=>MODULES[i].rating===lowest);out.push(pool[Math.floor(rnd()*pool.length)]);}
 const floor=ratingFloor(level),old=MODULES.map((m,i)=>i).filter(i=>MODULES[i].rating<=cap&&MODULES[i].rating>=floor&&(seen.has(i))&&!out.includes(i));
 while(out.length<n&&old.length){let tot=0;for(const i of old)tot+=MODULES[i].rating;let p=rnd()*tot,k=0;for(;k<old.length-1;k++){p-=MODULES[old[k]].rating;if(p<=0)break;}out.push(old[k]);old.splice(k,1);}
 while(out.length<n){const i=Math.floor(rnd()*MODULES.length);if(MODULES[i].rating<=cap&&MODULES[i].rating>=floor)out.push(i);}
 for(const i of out)seen.add(i);
 // the new puzzle sits after one warm-up module when there is one
 if(out.length>1&&fresh.length){const f=out.shift() as number;out.splice(1,0,f);}
 return out;
}
export const clockFor=(level:number,par:number)=>Math.round(par*Math.max(RB.clockMin,RB.clockMul-RB.clockStep*(level-RB.clockFrom))+RB.clockAdd);
/** After every puzzle is met, the easy ones drop out of the mix little by little (level 15: rating 1 gone ... level 30: below 6 gone). */
export const ratingFloor=(level:number)=>Math.min(6,Math.max(1,Math.floor((level-12)/3)));
export const levelRating=(plan:readonly number[])=>plan.reduce((s,i)=>s+MODULES[i].rating,0);
export const levelPar=(plan:readonly number[])=>plan.reduce((s,i)=>s+MODULES[i].par,GOAL_MODULE.par);

/* ---------------- the world ---------------- */
export type Placed={def:ModuleDef;z:number;/** first index of its pieces, plates, posts, objs, picks, recvs and signals */p0:number;p1:number;pl0:number;pl1:number;po0:number;po1:number;o0:number;o1:number;k0:number;k1:number;r0:number;r1:number;s0:number;s1:number;goal:[number,number]|null;star:boolean};
export type World={pieces:Piece[];plates:Plate[];posts:Post[];objs:Obj[];picks:Pick[];recvs:Recv[];sig:boolean[];order:number[];mods:Placed[];len:number};

export function buildWorld(plan:readonly number[],level=1):World{
 const w:World={pieces:[],plates:[],posts:[],objs:[],picks:[],recvs:[],sig:[],order:[],mods:[],len:0};
 const defs=[...plan.map(i=>MODULES[i]),GOAL_MODULE];
 let z=0;
 defs.forEach((def,mi)=>{
  const s0=w.sig.length,P:Placed={def,z,p0:w.pieces.length,p1:0,pl0:w.plates.length,pl1:0,po0:w.posts.length,po1:0,o0:w.objs.length,o1:0,k0:w.picks.length,k1:0,r0:w.recvs.length,r1:0,s0,s1:0,goal:null,star:false};
  let maxSig=-1;const S=(i:number)=>{maxSig=Math.max(maxSig,i);return s0+i;};
  const piece=(x0:number,x1:number,z0:number,z1:number,y0:number,kind:Piece['kind'],a:number,b:number,surf:Surf,role:Piece['role']=0,dy=0)=>{w.pieces.push({x0,x1,z0:z+z0,z1:z+z1,y0,kind,a,b,surf,dy,role,mod:mi});return w.pieces.length-1;};
  const B:Builder={level,
   box:(x0,x1,z0,z1,h,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,0,h,0,surf),
   rampZ:(x0,x1,z0,z1,h0,h1,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,1,h0,h1,surf),
   rampX:(x0,x1,z0,z1,h0,h1,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,2,h0,h1,surf),
   pipe:(x0,x1,z0,z1,h,d,surf='metal')=>piece(x0,x1,z0,z1,RB.water-.6,3,h,d,surf),
   hillZ:(x0,x1,z0,z1,h0,h1,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,4,h0,h1,surf),
   bumpZ:(x0,x1,z0,z1,h,rise,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,5,h,rise,surf),
   bankX:(x0,x1,z0,z1,h0,h1,surf='grass')=>piece(x0,x1,z0,z1,RB.water-.6,6,h0,h1,surf),
   gate:(x0,x1,gz,need,h=0)=>{const p=piece(x0,x1,gz,gz+.35,h-.2,0,h+1.1,0,'metal',1);w.recvs.push({kind:'gate',piece:p,need:need.map(S),open:0,h:1.1,period:0,x0,x1,z0:z+gz,z1:z+gz+.35,wy:h,fz:0,mod:mi});return p;},
   bridge:(x0,x1,z0,z1,h,need,surf='wood')=>{const p=piece(x0,x1,z0,z1,h-.35,0,h,0,surf,2,-4);w.recvs.push({kind:'bridge',piece:p,need:need.map(S),open:0,h:4,period:0,x0,x1,z0:z+z0,z1:z+z1,wy:h,fz:0,mod:mi});return p;},
   lift:(x0,x1,z0,z1,rise,period,surf='metal')=>{const p=piece(x0,x1,z0,z1,RB.water-.6,0,0,0,surf,3);w.recvs.push({kind:'lift',piece:p,need:[],open:0,h:rise,period,x0,x1,z0:z+z0,z1:z+z1,wy:0,fz:0,mod:mi});return p;},
   plate:(x,pz,kind,sig,o={})=>{w.plates.push({x,z:z+pz,y:o.y??0,half:.62,kind,sig:S(sig),T:o.T??0,idx:o.idx??0,group:o.group??0,bx:0,bz:0,pressed:false,timer:0,lit:false,mod:mi});return w.plates.length-1;},
   post:(x,pz,kind,sig=-1,y=0)=>{w.posts.push({x,z:z+pz,y,r:kind==='bumper'?.42:kind==='cone'?.34:.3,kind,sig:sig>=0?S(sig):-1,hx:x,hz:z+pz,ax:0,az:0,per:0,ph:0,down:false,cool:0,on:false,vx:0,vz:0,wob:0,mod:mi});return w.posts.length-1;},
   boost:(x,pz,vx,vz,y=0)=>{w.plates.push({x,z:z+pz,y,half:.62,kind:'boost',sig:-1,T:0,idx:0,group:0,bx:vx,bz:vz,pressed:false,timer:0,lit:false,mod:mi});return w.plates.length-1;},
   sweeper:(x,pz,ax,az,per,ph=0,y=0)=>{w.posts.push({x,z:z+pz,y,r:.4,kind:'sweeper',sig:-1,hx:x,hz:z+pz,ax,az,per,ph,down:false,cool:0,on:false,vx:0,vz:0,wob:0,mod:mi});return w.posts.length-1;},
   obj:(kind,x,oz,y=0)=>{const r=kind==='crate'?.5:.24;w.objs.push({kind,x,y:y+r,z:z+oz,vx:0,vy:0,vz:0,r,mass:kind==='crate'?2:.6,hx:x,hz:z+oz,hy:y+r,mod:mi,air:false,spin:0});return w.objs.length-1;},
   star:(x,sz,y=0)=>{w.picks.push({kind:'star',x,y:y+.55,z:z+sz,taken:false,mod:mi});P.star=true;},
   key:(x,kz,y=0)=>{w.picks.push({kind:'key',x,y:y+.5,z:z+kz,taken:false,mod:mi});},
   drain:(x0,x1,z0,z1,wy,need)=>{w.recvs.push({kind:'drain',piece:-1,need:need.map(S),open:0,h:0,period:0,x0,x1,z0:z+z0,z1:z+z1,wy,fz:0,mod:mi});},
   fan:(x0,x1,z0,z1,hover,push,need)=>{w.recvs.push({kind:'fan',piece:-1,need:need.map(S),open:0,h:hover,period:0,x0,x1,z0:z+z0,z1:z+z1,wy:hover,fz:push,mod:mi});},
   goal:(x,gz)=>{P.goal=[x,z+gz];if(level>=KEEPER.from)w.posts.push({x,z:z+gz-KEEPER.back,y:0,r:.4,kind:'sweeper',sig:-1,hx:x,hz:z+gz-KEEPER.back,ax:KEEPER.reach,az:0,per:keeperPeriod(level),ph:0,down:false,cool:0,on:false,vx:0,vz:0,wob:0,mod:mi});
    for(const k of [piece(-1.9,-1.6,gz-.6,gz+.9,0,0,1.5,0,'metal',0),piece(1.6,1.9,gz-.6,gz+.9,0,0,1.5,0,'metal',0),piece(-1.9,1.9,gz+.9,gz+1.15,0,0,1.5,0,'metal',0)])w.pieces[k].hidden=true;},
  };
  def.build(B);
  for(let i=0;i<=maxSig;i++)w.sig.push(false);
  for(const pl of w.plates.slice(P.pl0))if(pl.kind==='order')while(w.order.length<=pl.sig)w.order.push(0);
  P.p1=w.pieces.length;P.pl1=w.plates.length;P.po1=w.posts.length;P.o1=w.objs.length;P.k1=w.picks.length;P.r1=w.recvs.length;P.s1=w.sig.length;
  w.mods.push(P);z+=def.len;
 });
 while(w.order.length<w.sig.length)w.order.push(0);
 w.len=z;return w;
}

/* ---------------- terrain queries (no allocation) ---------------- */
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
export function topAt(p:Piece,x:number,z:number){
 switch(p.kind){
  case 1:return p.a+(p.b-p.a)*clamp((z-p.z0)/(p.z1-p.z0),0,1)+p.dy;
  case 2:return p.a+(p.b-p.a)*clamp((x-p.x0)/(p.x1-p.x0),0,1)+p.dy;
  case 3:{const u=clamp((2*x-p.x0-p.x1)/(p.x1-p.x0),-1,1);return p.a+p.b*u*u+p.dy;}
  case 4:{const u=clamp((z-p.z0)/(p.z1-p.z0),0,1);return p.a+(p.b-p.a)*u*u*(3-2*u)+p.dy;}
  case 5:{const sn=Math.sin(Math.PI*clamp((z-p.z0)/(p.z1-p.z0),0,1));return p.a+p.b*sn*sn+p.dy;}
  case 6:{const u=clamp((x-p.x0)/(p.x1-p.x0),0,1);return p.a+(p.b-p.a)*u*u*(3-2*u)+p.dy;}
  default:return p.a+p.dy;
 }
}
/** The slope of a piece's top: d(top)/dx and d(top)/dz into G_OUT. */
const G_OUT={x:0,z:0};
function gradAt(p:Piece,x:number,z:number){
 G_OUT.x=0;G_OUT.z=0;
 if(p.kind===1)G_OUT.z=(p.b-p.a)/(p.z1-p.z0);
 else if(p.kind===2)G_OUT.x=(p.b-p.a)/(p.x1-p.x0);
 else if(p.kind===3){const W=p.x1-p.x0,u=clamp((2*x-p.x0-p.x1)/W,-1,1);G_OUT.x=p.b*2*u*2/W;}
 else if(p.kind===4){const L=p.z1-p.z0,u=clamp((z-p.z0)/L,0,1);G_OUT.z=(p.b-p.a)*6*u*(1-u)/L;}
 else if(p.kind===5){const L=p.z1-p.z0,u=clamp((z-p.z0)/L,0,1);G_OUT.z=p.b*Math.PI*Math.sin(2*Math.PI*u)/L;}
 else if(p.kind===6){const L=p.x1-p.x0,u=clamp((x-p.x0)/L,0,1);G_OUT.x=(p.b-p.a)*6*u*(1-u)/L;}
 return G_OUT;
}
export type Ground={h:number;piece:number};
const GR:Ground={h:-Infinity,piece:-1};
/** The highest top under (x,z) that is at most `reach` above `bottom` (search only modules lo..hi). */
export function groundAt(w:World,x:number,z:number,bottom:number,reach:number,lo:number,hi:number):Ground{
 GR.h=-Infinity;GR.piece=-1;const a=w.mods[Math.max(0,lo)].p0,b=w.mods[Math.min(w.mods.length-1,hi)].p1;
 for(let i=a;i<b;i++){const p=w.pieces[i];if(x<p.x0||x>p.x1||z<p.z0||z>p.z1)continue;const t=topAt(p,x,z);if(t<=bottom+reach&&t>=GR.h){GR.h=t;GR.piece=i;}}
 return GR;
}

/* ---------------- the game ---------------- */
export type RollEventType='plate'|'unplate'|'gate'|'star'|'key'|'lock'|'cone'|'switch'|'bump'|'wall'|'splash'|'land'|'module'|'goal'|'level'|'heart'|'over'|'order'|'wrong'|'timeout'|'push'|'respawn'|'wobble'|'boost'|'sweep'|'close';
/** a: what (index of plate / post / receiver, impact speed, level...); b: extra; x,y,z: where; points: what it scored. */
export type RollEvent={type:RollEventType;a:number;b:number;x:number;y:number;z:number;points:number};
export type RollStats={levels:number;modules:number;stars:number;starsSeen:number;falls:number;timeouts:number;perfect:number;bestStreak:number;knocks:number;time:number};
export type Ball={x:number;y:number;z:number;vx:number;vy:number;vz:number;air:boolean;surf:Surf;key:boolean;ground:number;
 /** distance rolled on the ground this step (the view turns the panels by it) */roll:number};
export type RollState={seed:number;daily:boolean;level:number;plan:number[];world:World;ball:Ball;mod:number;hearts:number;score:number;streak:number;lostThisLevel:boolean;
 levelTime:number;clock:number;clockMax:number;over:boolean;overWhy:''|'water'|'clock';t:number;stats:RollStats;
 /** the level is won and the next one is being dealt after `between` seconds */between:number;goalAt:number;
 /** a fall / time-out is playing out before the respawn */respawnIn:number;ix:number;iz:number;
 /** levels 1-3: grounded spots sampled every 0.4 s (the older one is the respawn after a fall into the water), and whether to use it */safe:{x:number;y:number;z:number;px:number;py:number;pz:number;t:number;mod:number};near:boolean};
const emptyStats=():RollStats=>({levels:0,modules:0,stars:0,starsSeen:0,falls:0,timeouts:0,perfect:0,bestStreak:0,knocks:0,time:0});

export type RollBall=ReturnType<typeof createRollBall>;
/** fixLevel / fixPlan: tests only (deal every level from one plan). */
export function createRollBall(opts:{seed:number;daily?:boolean;fixPlan?:number[]}){
 const rnd=mulberry(opts.seed),events:RollEvent[]=[],seen=new Set<number>();
 const dealPlan=(level:number)=>opts.fixPlan?[...opts.fixPlan]:levelPlan(rnd,level,seen);
 const plan0=dealPlan(1);
 const s:RollState={seed:opts.seed,daily:!!opts.daily,level:1,plan:plan0,world:buildWorld(plan0,1),ball:{x:0,y:RB.r,z:1,vx:0,vy:0,vz:0,air:false,surf:'grass',key:false,ground:-1,roll:0},mod:0,hearts:RB.hearts,score:0,streak:0,lostThisLevel:false,
  levelTime:0,clock:0,clockMax:0,over:false,overWhy:'',t:0,stats:emptyStats(),between:0,goalAt:0,respawnIn:0,ix:0,iz:0,safe:{x:0,y:RB.r,z:1,px:0,py:RB.r,pz:1,t:0,mod:-1},near:false};
 const emit=(type:RollEventType,a=0,b=0,x=s.ball.x,y=s.ball.y,z=s.ball.z,points=0)=>{events.push({type,a,b,x,y,z,points});};
 const setClock=()=>{const par=levelPar(s.plan);s.clockMax=s.level>=RB.clockFrom?clockFor(s.level,par):0;s.clock=s.clockMax;};
 setClock();s.stats.starsSeen+=s.world.mods.filter(m=>m.star).length;

 /** Put module k back as it was dealt: signals, plates, posts, objects, pickups, receivers. */
 function resetModule(k:number){const w=s.world,P=w.mods[k];
  for(let i=P.s0;i<P.s1;i++){w.sig[i]=false;w.order[i]=0;}
  for(let i=P.pl0;i<P.pl1;i++){const p=w.plates[i];p.pressed=false;p.timer=0;p.lit=false;}
  for(let i=P.po0;i<P.po1;i++){const p=w.posts[i];p.down=false;p.cool=0;p.on=false;p.wob=0;}
  for(let i=P.o0;i<P.o1;i++){const o=w.objs[i];o.x=o.hx;o.z=o.hz;o.y=o.hy;o.vx=o.vy=o.vz=0;o.air=false;}
  for(let i=P.k0;i<P.k1;i++){const p=w.picks[i];if(p.kind==='key')p.taken=false;}
  for(let i=P.r0;i<P.r1;i++){const r=w.recvs[i];r.open=0;if(r.kind==='gate')r.period=0;/* a gate's period marks its close call as cheered */if(r.piece>=0){const p=w.pieces[r.piece];p.dy=r.kind==='bridge'?-4:0;}}
  s.ball.key=false;
 }
 function spawn(){const P=s.world.mods[s.mod],b=s.ball;
  // early levels: back on the last firm spot, puzzle kept as it was
  if(s.near&&s.safe.mod===s.mod){s.near=false;b.x=s.safe.px;b.y=s.safe.py+.02;b.z=s.safe.pz;b.vx=b.vy=b.vz=0;b.air=false;b.roll=0;emit('respawn',s.mod);return;}s.near=false;
 b.x=0;b.z=P.z+1;b.y=RB.r;b.vx=b.vy=b.vz=0;b.air=false;b.roll=0;resetModule(s.mod);emit('respawn',s.mod);}
 function loseHeart(why:'water'|'clock'){
  // forgiving first minutes: a fall on levels 1-3 puts the ball back close by; on level 1 it costs no heart
  const early=why==='water'&&s.level<=RB.gentle;s.near=early&&s.safe.mod===s.mod;
  if(early&&s.level===1){s.stats.falls++;s.respawnIn=.9;return;}
  s.hearts--;s.lostThisLevel=true;s.streak=0;if(why==='water')s.stats.falls++;else s.stats.timeouts++;emit('heart',s.hearts,why==='water'?0:1);
  if(s.hearts<=0){s.over=true;s.overWhy=why;emit('over',why==='water'?0:1);return;}
  s.respawnIn=why==='water'?.9:.6;
 }
 function nextLevel(){s.safe.mod=-1;s.near=false;
  s.level++;s.plan=dealPlan(s.level);s.world=buildWorld(s.plan,s.level);s.mod=0;s.lostThisLevel=false;s.levelTime=0;setClock();
  s.stats.starsSeen+=s.world.mods.filter(m=>m.star).length;const b=s.ball;b.x=0;b.z=1;b.y=RB.r;b.vx=b.vy=b.vz=0;b.air=false;b.key=false;emit('level',s.level);
 }
 function scoreGoal(){
  const lf=levelFactor(s.level),par=levelPar(s.plan),under=Math.max(0,Math.floor(par-s.levelTime));let bonus=Math.round(RB.levelPts*lf)+under*RB.secPts;
  if(!s.lostThisLevel){s.streak++;s.stats.perfect++;s.stats.bestStreak=Math.max(s.stats.bestStreak,s.streak);bonus=Math.round(bonus*streakFactor(s.streak));}
  s.score+=bonus;s.stats.levels++;emit('goal',s.level,under,s.ball.x,s.ball.y,s.ball.z,bonus);s.between=1.6;s.goalAt=s.t;
 }

 /* ---- one fixed step ---- */
 const W=()=>s.world;
 function signalsOn(need:number[]){for(const i of need)if(!W().sig[i])return false;return true;}
 /** Push a circle (x,z,r) at height y out of every wall piece near it; returns the bounce of the last wall hit (or -1). */
 const HIT={nx:0,nz:0,surf:'grass' as Surf,hit:false,v:0};
 function walls(o:{x:number;y:number;z:number;vx:number;vz:number},r:number,lo:number,hi:number,bounceMul=1,own=-1){
  const w=W();HIT.hit=false;const a=w.mods[Math.max(0,lo)].p0,b=w.mods[Math.min(w.mods.length-1,hi)].p1,bottom=o.y-r,op=own>=0?w.pieces[own]:null;
  for(let i=a;i<b;i++){const p=w.pieces[i];
   if(o.x<p.x0-r||o.x>p.x1+r||o.z<p.z0-r||o.z>p.z1+r)continue;
   const inside=o.x>=p.x0&&o.x<=p.x1&&o.z>=p.z0&&o.z<=p.z1;if(inside)continue;
   const qx=clamp(o.x,p.x0,p.x1),qz=clamp(o.z,p.z0,p.z1),dx=o.x-qx,dz=o.z-qz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
   const t=topAt(p,qx,qz),ref=op?Math.max(bottom,topAt(op,clamp(qx,op.x0,op.x1),clamp(qz,op.z0,op.z1))):bottom;if(t<=ref+RB.step||p.y0>o.y+r)continue;// a surface that carries on (a pipe lip meeting a ledge) is no wall
   const d=Math.sqrt(d2)||1e-6,nx=dx/d,nz=dz/d,pen=r-d;o.x+=nx*pen;o.z+=nz*pen;
   const vn=o.vx*nx+o.vz*nz;if(vn<0){const e=SURF[p.surf].bounce*bounceMul;o.vx-=(1+e)*vn*nx;o.vz-=(1+e)*vn*nz;HIT.hit=true;HIT.v=-vn;HIT.nx=nx;HIT.nz=nz;HIT.surf=p.surf;}
  }
  return HIT;
 }
 function stepBall(dt:number){
  const b=s.ball,w=W(),lo=s.mod-1,hi=s.mod+1;
  // input: the stick is a push on the ground, a little steering in the air
  const g0=b.air?null:groundAt(w,b.x,b.z,b.y-RB.r,RB.step,lo,hi),gp=g0&&g0.piece>=0?w.pieces[g0.piece]:null;
  const sf=SURF[gp?gp.surf:b.surf];
  let ax=0,az=0;
  if(!b.air&&gp){b.surf=gp.surf;ax=s.ix*sf.accel;az=s.iz*sf.accel;const gr=gradAt(gp,b.x,b.z),k=RB.G*.71/(1+gr.x*gr.x+gr.z*gr.z);ax-=gr.x*k;az-=gr.z*k;}
  else{ax=s.ix*2.2;az=s.iz*2.2;}
  // fans
  let lift=0;
  for(let i=w.mods[Math.max(0,lo)].r0;i<w.mods[Math.min(w.mods.length-1,hi)].r1;i++){const r=w.recvs[i];if(r.kind!=='fan'||r.open<.5)continue;
   if(b.x>=r.x0&&b.x<=r.x1&&b.z>=r.z0&&b.z<=r.z1&&b.y<r.h+2.5){lift=RB.G+28*(r.h+RB.r-b.y)-5*b.vy;az+=r.fz;b.air=true;}}
  b.vx+=ax*dt;b.vz+=az*dt;
  const drag=b.air?.05:sf.drag;const f=Math.exp(-drag*dt);b.vx*=f;b.vz*=f;
  const sp=Math.hypot(b.vx,b.vz);if(sp>RB.vmax){b.vx*=RB.vmax/sp;b.vz*=RB.vmax/sp;}
  const ox=b.x,oz=b.z,oy=b.y;b.x+=b.vx*dt;b.z+=b.vz*dt;
  // walls
  b.ground=gp?g0!.piece:-1;const hit=walls(b,RB.r,lo,hi,1,b.ground);if(hit.hit){if(hit.surf==='rubber')emit('bump',-1,hit.v);else if(hit.v>1.4)emit('wall',-1,hit.v);}
  // posts
  for(let i=w.mods[Math.max(0,lo)].po0;i<w.mods[Math.min(w.mods.length-1,hi)].po1;i++)postHit(i,b,RB.r,1);
  // vertical
  if(b.air){
   b.vy+=(lift-RB.G)*dt;b.y+=b.vy*dt;
   const g=groundAt(w,b.x,b.z,oy-RB.r,RB.step+Math.max(0,-b.vy*dt),lo,hi);
   if(g.piece>=0&&b.y-RB.r<=g.h&&b.vy<=0){b.y=g.h+RB.r;const v=-b.vy;if(v>3.8&&lift===0){b.vy=v*.3;emit('land',v);}else{b.vy=0;b.air=false;if(v>2.2)emit('land',v);}}
  }else{
   const reach=RB.step+Math.hypot(b.x-ox,b.z-oz)*2.2;
   const g=groundAt(w,b.x,b.z,oy-RB.r,reach,lo,hi);
   if(g.piece<0){b.air=true;}
   else{const ny=g.h+RB.r,drop=oy-ny;
    if(drop>.02+Math.hypot(b.x-ox,b.z-oz)*1.4){b.air=true;}
    else{b.vy=(ny-oy)/dt;b.y=ny;}
   }
   if(b.air){b.vy=Math.min(b.vy,(b.y-oy)/dt||0);if(!Number.isFinite(b.vy))b.vy=0;}
  }
  b.roll=b.air?0:Math.hypot(b.x-ox,b.z-oz);
  // a gate closing / a lift rising under the ball lifts it
  if(!b.air){const g=groundAt(w,b.x,b.z,b.y-RB.r,3,lo,hi);if(g.piece>=0&&g.h>b.y-RB.r+.001)b.y=g.h+RB.r;}
 }
 function postHit(i:number,o:{x:number;y:number;z:number;vx:number;vz:number},r:number,who:number){
  const p=W().posts[i];if(p.down)return;const dx=o.x-p.x,dz=o.z-p.z,R=r+p.r,d2=dx*dx+dz*dz;if(d2>=R*R)return;if(o.y-r>p.y+1.2||o.y+r<p.y)return;
  const d=Math.sqrt(d2)||1e-6,nx=dx/d,nz=dz/d,vn=(o.vx-p.vx)*nx+(o.vz-p.vz)*nz;
  // forgiving: a quick glancing hit counts too (overall speed knockFast with at least knockGlance of it into the cone)
  if(p.kind==='cone'&&(-vn>=RB.knock||(-vn>=RB.knock*RB.knockGlance&&Math.hypot(o.vx,o.vz)>=RB.knock*RB.knockFast))){p.down=true;W().sig[p.sig]=true;s.stats.knocks++;emit('cone',i,-vn,p.x,p.y,p.z);o.vx*=.7;o.vz*=.7;return;}
  o.x=p.x+nx*R;o.z=p.z+nz*R;
  if(vn<0){const e=p.kind==='bumper'?1.25:p.kind==='sweeper'?.7:p.kind==='cone'?.35:.5;o.vx-=(1+e)*vn*nx;o.vz-=(1+e)*vn*nz;
   if(p.kind==='bumper'){o.vx+=nx*3;o.vz+=nz*3;emit('bump',i,-vn,p.x,p.y,p.z);}
   else if(p.kind==='sweeper'){o.vx+=nx*2.2;o.vz+=nz*2.2;if(who===1&&p.cool<=0){p.cool=.35;emit('sweep',i,-vn,p.x,p.y,p.z);}}
   // a cone hit too softly rocks and stays: b is the share of the speed it needed (the view rocks it that far, the shell says so)
   else if(p.kind==='cone'&&-vn>.5&&p.cool<=0){p.cool=.3;p.wob=Math.min(1,-vn/RB.knock);emit('wobble',i,-vn/RB.knock,p.x,p.y,p.z);}
   else if(p.kind!=='cone'&&-vn>1.4)emit('wall',i,-vn);
  }
  if(who!==1)return;
  if(p.kind==='switch'&&p.cool<=0&&-vn>.6){p.on=!p.on;W().sig[p.sig]=p.on;p.cool=.8;emit('switch',i,p.on?1:0,p.x,p.y,p.z);}
  if(p.kind==='lock'&&!p.on){if(s.ball.key){p.on=true;s.ball.key=false;W().sig[p.sig]=true;emit('lock',i,1,p.x,p.y,p.z);}else if(p.cool<=0){p.cool=1;emit('lock',i,0,p.x,p.y,p.z);}}
 }
 function stepObjs(dt:number){
  const w=W(),b=s.ball,P=w.mods[s.mod];
  for(let m=Math.max(0,s.mod-1);m<=Math.min(w.mods.length-1,s.mod+1);m++){const Q=w.mods[m];
   for(let i=Q.o0;i<Q.o1;i++){const o=w.objs[i];
    // ball against object (both circles); the heavier one moves less
    const dx=o.x-b.x,dz=o.z-b.z,R=o.r+RB.r,d2=dx*dx+dz*dz;
    if(d2<R*R&&Math.abs(o.y-b.y)<R){const d=Math.sqrt(d2)||1e-6,nx=dx/d,nz=dz/d,pen=R-d,mb=1,mo=o.mass,k=1/(mb+mo);
     b.x-=nx*pen*mo*k;b.z-=nz*pen*mo*k;o.x+=nx*pen*mb*k;o.z+=nz*pen*mb*k;
     const rel=(b.vx-o.vx)*nx+(b.vz-o.vz)*nz;if(rel>0){const e=o.kind==='crate'?.1:.6,j=(1+e)*rel/(1/mb+1/mo);b.vx-=j/mb*nx;b.vz-=j/mb*nz;o.vx+=j/mo*nx;o.vz+=j/mo*nz;if(rel>1.5)emit('push',i,rel,o.x,o.y,o.z);}}
    for(let j=i+1;j<Q.o1;j++){const q=w.objs[j],ex=q.x-o.x,ez=q.z-o.z,RR=o.r+q.r,e2=ex*ex+ez*ez;if(e2<RR*RR){const d=Math.sqrt(e2)||1e-6,nx=ex/d,nz=ez/d,pen=(RR-d)/2;o.x-=nx*pen;o.z-=nz*pen;q.x+=nx*pen;q.z+=nz*pen;}}
    // ground, slope, drag
    const g=groundAt(w,o.x,o.z,o.y-o.r,RB.step,m-1,m+1);
    if(!o.air&&g.piece>=0){const p=w.pieces[g.piece],gr=gradAt(p,o.x,o.z);if(o.kind==='tball'){o.vx-=gr.x*RB.G*.7*dt;o.vz-=gr.z*RB.G*.7*dt;}
     const fr=Math.exp(-(o.kind==='crate'?(p.surf==='ice'?.6:5.5):SURF[p.surf].drag*.8)*dt);o.vx*=fr;o.vz*=fr;}
    o.x+=o.vx*dt;o.z+=o.vz*dt;o.spin+=Math.hypot(o.vx,o.vz)*dt/o.r;walls(o,o.r,m-1,m+1,.5);
    for(let k=Q.po0;k<Q.po1;k++)postHit(k,o,o.r,0);
    const g2=groundAt(w,o.x,o.z,o.y-o.r,RB.step+.05,m-1,m+1);
    if(g2.piece<0||o.y-o.r>g2.h+.02){o.air=true;o.vy-=RB.G*dt;o.y+=o.vy*dt;if(g2.piece>=0&&o.y-o.r<=g2.h){o.y=g2.h+o.r;o.vy=0;o.air=false;}}
    else{o.y=g2.h+o.r;o.vy=0;o.air=false;}
    if(o.y<RB.water-.4){o.x=o.hx;o.z=o.hz;o.y=o.hy;o.vx=o.vy=o.vz=0;o.air=false;emit('splash',i,1,o.x,RB.water,o.z);}
   }
  }
  void P;
 }
 function stepTriggers(dt:number){
  const w=W(),b=s.ball,lo=Math.max(0,s.mod-1),hi=Math.min(w.mods.length-1,s.mod+1);
  for(let m=lo;m<=hi;m++){const Q=w.mods[m];
   for(let i=Q.pl0;i<Q.pl1;i++){const p=w.plates[i];let wgt=0;
    if(!b.air&&Math.abs(b.x-p.x)<=p.half&&Math.abs(b.z-p.z)<=p.half&&Math.abs(b.y-RB.r-p.y)<.2)wgt+=1;
    for(let k=Q.o0;k<Q.o1;k++){const o=w.objs[k];if(Math.abs(o.x-p.x)<=p.half&&Math.abs(o.z-p.z)<=p.half&&Math.abs(o.y-o.r-p.y)<.25)wgt+=o.mass;}
    const need=p.kind==='heavy'?1.5:.5,on=wgt>=need,was=p.pressed;p.pressed=on;
    if(p.kind==='boost'){if(wgt>=1&&wgt<1.5&&!b.air&&!was){b.vx=p.bx;b.vz=p.bz;emit('boost',i,Math.hypot(p.bx,p.bz),p.x,p.y,p.z);}p.lit=on;continue;}
    if(on&&!was)emit('plate',i,p.kind==='heavy'&&wgt<1.5?0:1,p.x,p.y,p.z);else if(!on&&was&&(p.kind==='hold'||p.kind==='heavy'))emit('unplate',i,0,p.x,p.y,p.z);
    switch(p.kind){
     case 'latch':if(on&&!p.lit){p.lit=true;w.sig[p.sig]=true;}break;
     case 'hold':case 'heavy':p.lit=on;w.sig[p.sig]=on;break;
     case 'timed':if(on)p.timer=p.T;else p.timer=Math.max(0,p.timer-dt);p.lit=p.timer>0;w.sig[p.sig]=p.lit;break;
     case 'stay':if(!p.lit){p.timer=on?p.timer+dt:0;if(p.timer>=p.T){p.lit=true;w.sig[p.sig]=true;emit('plate',i,2,p.x,p.y,p.z);}}break;
     case 'order':if(on&&!was&&!p.lit){const grp=p.sig;if(w.order[grp]===p.idx){p.lit=true;w.order[grp]++;let n=0;for(let k=Q.pl0;k<Q.pl1;k++)if(w.plates[k].kind==='order'&&w.plates[k].sig===grp)n++;
       emit('order',i,w.order[grp],p.x,p.y,p.z);if(w.order[grp]>=n)w.sig[grp]=true;}
      else{w.order[grp]=0;for(let k=Q.pl0;k<Q.pl1;k++)if(w.plates[k].kind==='order'&&w.plates[k].sig===grp)w.plates[k].lit=false;emit('wrong',i,0,p.x,p.y,p.z);}}break;
    }
   }
   for(let i=Q.po0;i<Q.po1;i++){const p=w.posts[i];if(p.cool>0)p.cool-=dt;if(p.wob>0)p.wob=Math.max(0,p.wob-dt*1.6);
    if(p.per>0){const a=Math.PI*2*(s.t/p.per+p.ph),sn=Math.sin(a),nx=p.hx+p.ax*sn,nz=p.hz+p.az*sn;p.vx=(nx-p.x)/dt;p.vz=(nz-p.z)/dt;p.x=nx;p.z=nz;}}
   for(let i=Q.k0;i<Q.k1;i++){const k=w.picks[i];if(k.taken)continue;const dx=b.x-k.x,dy=b.y-k.y,dz=b.z-k.z;if(dx*dx+dy*dy+dz*dz<.62*.62){k.taken=true;
     if(k.kind==='star'){s.score+=RB.starPts;s.stats.stars++;emit('star',i,0,k.x,k.y,k.z,RB.starPts);}else{b.key=true;emit('key',i,0,k.x,k.y,k.z);}}}
   for(let i=Q.r0;i<Q.r1;i++){const r=w.recvs[i];
    if(r.kind==='lift'){const per=r.period,ph=((s.t%per)+per)%per/per;// hold low 30%, rise 20%, hold high 30%, fall 20%
     const u=ph<.3?0:ph<.5?(ph-.3)/.2:ph<.8?1:1-(ph-.8)/.2,e=u*u*(3-2*u);r.open=e;w.pieces[r.piece].dy=r.h*e;continue;}
    const want=signalsOn(r.need)?1:0,was=r.open;r.open=want>r.open?Math.min(1,r.open+dt*2.6):want<r.open?Math.max(0,r.open-dt*2.6):r.open;
    if(was<1&&r.open>=1)emit('gate',i,1,(r.x0+r.x1)/2,r.wy,(r.z0+r.z1)/2);else if(was>0&&r.open<=0&&r.kind!=='fan')emit('gate',i,0,(r.x0+r.x1)/2,r.wy,(r.z0+r.z1)/2);
    if(r.kind==='gate')w.pieces[r.piece].dy=-r.h*r.open-.02*r.open;
    else if(r.kind==='bridge')w.pieces[r.piece].dy=-r.h*(1-r.open);
   }
  }
 }
 function step(){
  const dt=RB.dt;s.t+=dt;
  if(s.between>0){s.between-=dt;const b=s.ball;b.vx*=.94;b.vz*=.94;b.x+=b.vx*dt;b.z+=b.vz*dt;if(s.between<=0)nextLevel();return;}
  if(s.respawnIn>0){s.respawnIn-=dt;if(s.respawnIn<=0){s.respawnIn=0;spawn();}return;}
  s.levelTime+=dt;s.stats.time+=dt;
  if(s.clockMax>0){s.clock=Math.max(0,s.clock-dt);if(s.clock<=0){emit('timeout');loseHeart('clock');if(!s.over){s.clock=s.clockMax;}return;}}
  stepBall(dt);stepObjs(dt);stepTriggers(dt);
  const b=s.ball,w=W();
  // water: the sea below everything, and full pools
  let wet=b.y<RB.water+RB.r*.2;
  if(!wet)for(let i=w.mods[Math.max(0,s.mod-1)].r0;i<w.mods[Math.min(w.mods.length-1,s.mod+1)].r1;i++){const r=w.recvs[i];if(r.kind==='drain'&&r.open<.5&&b.x>=r.x0&&b.x<=r.x1&&b.z>=r.z0&&b.z<=r.z1&&b.y-RB.r*.3<r.wy){wet=true;break;}}
  if(wet){emit('splash',-1,0,b.x,RB.water,b.z);loseHeart('water');return;}
  if(s.level<=RB.gentle&&!b.air&&b.ground>=0&&w.pieces[b.ground].role===0&&!w.pieces[b.ground].dy&&s.t-s.safe.t>=.4){const f=s.safe;if(f.mod===s.mod){f.px=f.x;f.py=f.y;f.pz=f.z;}else{f.px=b.x;f.py=b.y;f.pz=b.z;}f.x=b.x;f.y=b.y;f.z=b.z;f.t=s.t;f.mod=s.mod;}
  // module change: the checkpoint moves to the module the ball reached (only forward)
  while(s.mod<w.mods.length-1&&b.z>w.mods[s.mod+1].z+.5&&!b.air){s.mod++;const lf=levelFactor(s.level),pts=w.mods[s.mod-1].def.id==='goal'?0:Math.round(RB.modPts*lf);s.score+=pts;s.stats.modules++;emit('module',s.mod,0,b.x,b.y,b.z,pts);}
  for(let i=w.mods[s.mod].r0;i<w.mods[s.mod].r1;i++){const r=w.recvs[i];if(r.kind!=='gate'||r.period||r.open<.2)continue;const z1=r.z1+RB.r;if(b.z>z1&&b.z-b.vz*RB.dt<=z1&&b.x>r.x0&&b.x<r.x1){let left=9;for(const pl of w.plates)if(pl.kind==='timed'&&r.need.includes(pl.sig))left=Math.min(left,pl.timer);if(left<1){r.period=1;emit('close',i,left,b.x,b.y,b.z);}}}
  const P=w.mods[s.mod];if(P.goal){const [gx,gz]=P.goal;if(Math.abs(b.x-gx)<1.5&&b.z>gz-.5&&b.z<gz+.9&&b.y<1.4)scoreGoal();}
 }
 const ACC={t:0};
 return {state:s,
  /** The stick: x right, z forward (both -1..1). */
  input(x:number,z:number){if(!Number.isFinite(x)||!Number.isFinite(z)){x=0;z=0;}const m=Math.hypot(x,z),k=m>1?1/m:1;s.ix=x*k;s.iz=z*k;},
  /** Advance by dt seconds of real time in fixed steps (at most 0.1 s). */
  tick(dt:number){if(s.over)return;ACC.t+=Math.min(.1,Math.max(0,dt));while(ACC.t>=RB.dt&&!s.over){ACC.t-=RB.dt;step();}},
  /** Start this puzzle again from its checkpoint (free: a stuck crate is never a dead end). */
  retry(){if(s.over||s.between>0||s.respawnIn>0)return;spawn();},
  /** One fixed step (tests). */
  step(){if(!s.over)step();},
  /** The ball's resting spot if it stopped now (for the HUD's "to the gate" cue): unused by rules. */
  drain(fn:(e:RollEvent)=>void){const list=events.splice(0);for(const e of list)fn(e);},
 };
}

/* ---------------- the scripted bot (tests, the attract demo) ---------------- */
/** A bot that plays one module's script through the real physics. Returns the controller: call next(state) every step, it sets the
 *  input and reports when the script is done. noise: random steering error (0 = perfect). */
export function scriptBot(def:ModuleDef,z0:number,opts:{noise?:number;rnd?:()=>number;star?:boolean}={}){
 const steps:Bot=[...(opts.star&&def.starBot?def.starBot:[]),...def.bot];let k=0,stopT=0,stuck=0,lastD=1e9;
 const rnd=opts.rnd??mulberry(1),noise=opts.noise??0;
 // a child's thumb is not exact: a slow drift that changes every 0.3-0.8 s (white noise would average out)
 let nx=0,nz=0,nt=0;const drift=()=>{nt-=RB.dt;if(nt<=0){nt=.3+rnd()*.5;const a=rnd()*Math.PI*2,m=noise*(.3+rnd()*.7);nx=Math.cos(a)*m;nz=Math.sin(a)*m;}};
 return {get index(){return k;},get done(){return k>=steps.length;},
  next(g:RollBall){const s=g.state,b=s.ball,w=s.world,P=w.mods.find(m=>m.def===def&&m.z===z0)!;if(k>=steps.length){g.input(0,1);return;}if(noise)drift();
   const st=steps[k];
   const seek=(tx:number,tz:number,speed:number,hard:boolean)=>{const dx=tx-b.x,dz=tz-b.z,d=Math.max(1e-6,Math.hypot(dx,dz));
    if(hard){let ix=dx/d,iz=dz/d;const vl=(b.vx*-iz+b.vz*ix);ix+=-(-iz)*vl*.25;iz+=-(ix)*vl*.25;g.input(ix+nx,iz+nz);return d;}
    const want=Math.min(speed,d*2.2),vx=dx/d*want,vz=dz/d*want,sf=SURF[b.surf].accel,gain=1.6/Math.max(1,sf*.25);
    g.input((vx-b.vx)*gain+nx,(vz-b.vz)*gain+nz);return d;};
   const adv=()=>{k++;stopT=0;stuck=0;lastD=1e9;};
   switch(st[0]){
    case 'go':{const d=seek(st[1],z0+st[2],st[3]??4.5,false);if(d<.45||(k===steps.length-1&&b.z>z0+st[2]-.3))adv();break;}
    case 'run':{const d=seek(st[1],z0+st[2],10,true);if(d<.72||d>lastD+.6)adv();lastD=Math.min(lastD,d);break;}
    case 'wait':{g.input(-b.vx*.4,-b.vz*.4);if(w.sig[P.s0+st[1]])adv();break;}
    case 'waitm':{g.input(-b.vx*.5,-b.vz*.5);const p=w.posts[P.po0+st[1]];if(!p||p.kind!=='sweeper'||P.po0+st[1]>=P.po1){adv();break;}const off=p.x-b.x;if(Math.abs(off)>=st[2]&&off*p.vx>0&&Math.hypot(b.vx,b.vz)<1)adv();break;}
    case 'waitr':{g.input(-b.vx*.4,-b.vz*.4);const r=w.recvs[P.r0+st[1]];if(!r||r.open>=1)adv();break;}
    case 'stop':{g.input(-b.vx*.5,-b.vz*.5);stopT+=RB.dt;if(stopT>=st[1])adv();break;}
    case 'lift':{g.input(-b.vx*.5,-b.vz*.5);const r=w.recvs.find(q=>q.kind==='lift'&&q.mod===w.mods.indexOf(P));const ok=st[1]?(r?r.open>.995:true):(r?r.open<.01&&((s.t%r.period)/r.period)<.12:true);if(ok)adv();break;}
    case 'push':{const o=w.objs[P.o0+st[1]],tx=st[2],tz=z0+st[3],ex=tx-o.x,ez=tz-o.z,ed=Math.hypot(ex,ez);
     if(ed<.18){g.input(-b.vx*.6,-b.vz*.6);stuck+=RB.dt;if(stuck>.4&&Math.hypot(o.vx,o.vz)<.2)adv();break;}
     const ux=ex/ed,uz=ez/ed,bx=o.x-ux*(o.r+RB.r+.1),bz=o.z-uz*(o.r+RB.r+.1),side=(b.x-o.x)*-uz+(b.z-o.z)*ux,behind=(b.x-o.x)*ux+(b.z-o.z)*uz;
     if(behind<-(o.r+RB.r)*.6&&Math.abs(side)<.22){seek(o.x+ux*.5,o.z+uz*.5,Math.min(2.2,.6+ed*1.4),false);}
     else{const off=behind>-o.r?(side>=0?1:-1)*(o.r+RB.r+.5):0;seek(bx+(-uz)*off,bz+ux*off,2.6,false);}
     break;}
   }
  }};
}
