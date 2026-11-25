/**
 * Summit 5s practice area (owner, Nov 24 2026): "When they enter this pitch, remove the UI for paths and settings. Add a camera
 * button at the top like the live games. Add functionality to random different cones and mannequins. Allow placing different
 * balls throughout and allow the user to just kick and play around. When they exit, go back to their normal walking state with
 * the ball. Use this as a practice area." Owner decision: the drill stays the same until Shuffle (persisted). Owner add: an
 * edit mode for every drill (drag / rotate / remove / add props, reset), remembered per drill.
 *
 * Pure rules, no three.js and no DOM, so tests/summit-practice.cjs drives them directly; the 3D side and the input are
 * lib/graphics/summitPractice.ts, the HUD components/SummitPracticeHud.tsx (via lib/town/summitPracticeStore.ts).
 *
 * Teaching: every drill is a real football practice with a one-line coaching point (AGENTS.md: everything teaches the game).
 *
 * Layouts are stored in PITCH-LOCAL metres: u along the length (+u = the east goal), v across (+v = the south touchline), so a
 * save survives the island moving the pitch. Everything is local to this device: no network (multiplayer peers only see you).
 */
import {SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_OBSTACLES,PITCH_HEIGHT,summitGoalCrossed} from './summitIsle';

export type ConeColor='orange'|'yellow'|'blue';
export const CONE_COLORS:readonly ConeColor[]=['orange','yellow','blue'];
export const CONE_HEX:Record<ConeColor,string>={orange:'#f0771f',yellow:'#f6d035',blue:'#2f74d6'};
/** One prop of a drill layout (pitch-local). A 'ball' is a ball's home spot (where it rests and resets to). */
export type PracticeProp={k:'cone';u:number;v:number;c:ConeColor}|{k:'man';u:number;v:number;yaw:number}|{k:'ball';u:number;v:number};
export type PropKind=PracticeProp['k'];
export type DrillId='slalom'|'gates'|'box'|'wall'|'cross'|'rondo';
export type Drill={id:DrillId;name:string;tip:string;props:PracticeProp[]};

/** Caps (the instanced meshes' sizes): cones, mannequins, balls. */
export const PRACTICE_LIMITS={cone:40,man:8,ball:10} as const;
/** Snap grid (m) for edited props, and the margin kept inside the pitch lines. */
export const PRACTICE_GRID=.5,PROP_MARGIN=.5;
export const PRACTICE_SAVE_KEY='fi2-summit-practice-v1';
/** Ball physics (the walking ball's island shot numbers, lib/town/walkBall.ts ISLAND_SHOT: gravity 13, floor bounce .53). */
export const PRACTICE_BALL={radius:.19,rest:.2,gravity:13,floorBounce:.5,wallBounce:.6,roll:.6,sleep:.07,
 /** Fence rail height (sides) and the ball-stop netting behind the goals (ends): a ball over them leaves the pitch. */
 railHeight:SUMMIT_FENCE.height,netHeight:4.5,
 /** Seconds a ball may stay outside the fence before it goes home, and the cone / mannequin contact radii. */
 outReset:1.2,cone:.17,man:.26,manHeight:1.75} as const;

// ---------------------------------------------------------------------------------------------------------------- geometry
const P=SUMMIT_PITCH,F=SUMMIT_FENCE;
export const HALF_U=P.length/2-PROP_MARGIN,HALF_V=P.width/2-PROP_MARGIN;
export const toWorld=(u:number,v:number)=>({x:P.x+u,z:P.z+v});
export const practiceGround=()=>PITCH_HEIGHT;
/** Inside the fence (with a hysteresis margin: + = further in). The gate gap is in the south rail, so the box is the fence's. */
export function insidePracticeFence(x:number,z:number,margin=.25){return Math.abs(x-P.x)<F.halfX-margin&&Math.abs(z-P.z)<F.halfZ-margin;}
/** Practice mode state from the player's spot: enter well inside the fence, leave once past it (no flicker on the rail). */
export function practiceZone(was:boolean,x:number,z:number){return was?insidePracticeFence(x,z,-.35):insidePracticeFence(x,z,.3);}
/** The spot just outside the south gate (where Exit puts you, facing out) in world metres. */
export function gateExit(){return {x:(F.gate.x0+F.gate.x1)/2,z:P.z+F.halfZ+1.6,yaw:0};}

const snap=(n:number)=>Math.round(n/PRACTICE_GRID)*PRACTICE_GRID;
/** A prop's spot kept inside the pitch lines and out of the goal mouths (the goal frames stand just behind the lines). */
export function clampSpot(u:number,v:number){
 if(!Number.isFinite(u))u=0;if(!Number.isFinite(v))v=0;
 u=Math.max(-HALF_U,Math.min(HALF_U,u));v=Math.max(-HALF_V,Math.min(HALF_V,v));
 const mouth=P.goalWidth/2+.6;
 if(Math.abs(u)>P.length/2-1.2&&Math.abs(v)<mouth)u=Math.sign(u)*(P.length/2-1.2);
 return {u,v};
}

// ---------------------------------------------------------------------------------------------------------------- drills
const cone=(u:number,v:number,c:ConeColor):PracticeProp=>({k:'cone',u,v,c});
const man=(u:number,v:number,yaw:number):PracticeProp=>({k:'man',u,v,yaw});
const ball=(u:number,v:number):PracticeProp=>({k:'ball',u,v});
/** Facing yaws (atan2(x, z)): toward the west goal, the east goal, north, south. */
const W=-Math.PI/2,E=Math.PI/2,N=Math.PI,S=0;
export const DRILLS:readonly Drill[]=[
 {id:'slalom',name:'Cone slalom',tip:'Slalom: keep the ball close with small touches, and use both feet (inside and outside).',
  props:[...[-4,4].flatMap(v=>Array.from({length:7},(_,i)=>cone(-11+i*2.5,v,i%2?'yellow':'orange'))),cone(-14,-5.5,'blue'),cone(-14,-2.5,'blue'),cone(-14,2.5,'blue'),cone(-14,5.5,'blue'),
   ball(-15,-4),ball(-15,4),ball(-16,-5),ball(-16,5),ball(-15.5,0),ball(10,-6),ball(10,6),ball(12,0)]},
 {id:'gates',name:'Passing gates',tip:'Gates: pass through a gate with the inside of your foot, then follow your pass to the next gate.',
  props:[...[[-11,-6],[-5,5],[1,-3],[7,6],[11,-6],[-6,-1]].flatMap(([u,v])=>[cone(u,v-.75,'blue'),cone(u,v+.75,'blue')]),cone(-15,0,'yellow'),cone(14,0,'yellow'),
   ball(-14,-2),ball(-14,2),ball(-9,3),ball(-2,-7),ball(4,2),ball(9,0),ball(13,4),ball(0,8)]},
 {id:'box',name:'1v1 box',tip:'1v1: run at the defender, drop a shoulder, then change pace past their front foot.',
  props:[...[[-3,-5],[2,-5],[7,-5],[7,0],[7,5],[2,5],[-3,5],[-3,0]].map(([u,v])=>cone(u,v,'yellow')),cone(7,-1.5,'orange'),cone(7,1.5,'orange'),man(3,0,W),
   ball(-6,-3),ball(-6,0),ball(-6,3),ball(-7,-1.5),ball(-7,1.5),ball(-8,0)]},
 {id:'wall',name:'Free-kick wall',tip:'Wall: curl it round the end of the wall or dink it over, and aim for the corners.',
  props:[man(11,-1.2,W),man(11,-.4,W),man(11,.4,W),man(11,1.2,W),...[-6,-3,0,3,6].map(v=>cone(3,v,'orange')),
   ball(4,-5),ball(4.5,-2.5),ball(5,0),ball(4.5,2.5),ball(4,5),ball(2,-1),ball(2,1),ball(1,0)]},
 {id:'cross',name:'Crossing lane',tip:'Crossing: run the lane, look up, and whip it in between the keeper and the defenders.',
  props:[...[-6,-3,0,3,6,9,12].map(u=>cone(u,-6.5,'orange')),cone(14,-2.5,'blue'),cone(14,2.5,'blue'),cone(16.5,-2.5,'blue'),cone(16.5,2.5,'blue'),man(15,-1,N),man(14,1.5,N),
   ball(-8,-8.5),ball(-6,-8.5),ball(-4,-8.5),ball(-2,-8.5),ball(0,-8.5),ball(-7,-9.5),ball(-3,-9.5),ball(-5,-7.5)]},
 {id:'rondo',name:'Rondo square',tip:'Rondo: one or two touches, open your body to see the next pass, and keep the ball moving.',
  props:[...[[-10,-4],[-2,-4],[-2,4],[-10,4]].map(([u,v])=>cone(u,v,'blue')),...[[-6,-4],[-2,0],[-6,4],[-10,0]].map(([u,v])=>cone(u,v,'orange')),man(-6,-1,S),man(-6,1,N),
   ball(-8,-3),ball(-3,-2),ball(-4,3),ball(-9,2),ball(-6,-5.5),ball(-6,5.5),ball(5,0)]},
];
export const DRILL_IDS=DRILLS.map(d=>d.id);
export const drillById=(id:string)=>DRILLS.find(d=>d.id===id)??null;
export const cloneProps=(ps:readonly PracticeProp[]):PracticeProp[]=>ps.map(p=>({...p}));
/** A random drill different from `current` (the first visit: any). */
export function pickDrill(current:string|null,rand:()=>number=Math.random):DrillId{
 const pool=DRILL_IDS.filter(id=>id!==current);return pool[Math.min(pool.length-1,Math.floor(rand()*pool.length))];
}

// ---------------------------------------------------------------------------------------------------------------- save
/** The persisted practice state: the drill on the pitch and the edited layouts (only drills the player changed). */
export type PracticeSave={v:1;drill:DrillId|'';layouts:Partial<Record<DrillId,PracticeProp[]>>};
export const emptyPracticeSave=():PracticeSave=>({v:1,drill:'',layouts:{}});
function cleanProp(p:unknown):PracticeProp|null{
 if(!p||typeof p!=='object')return null;const o=p as Record<string,unknown>,u=Number(o.u),v=Number(o.v);
 if(!Number.isFinite(u)||!Number.isFinite(v))return null;const s=clampSpot(u,v);
 if(o.k==='cone')return {k:'cone',u:s.u,v:s.v,c:CONE_COLORS.includes(o.c as ConeColor)?o.c as ConeColor:'orange'};
 if(o.k==='man'){const y=Number(o.yaw);return {k:'man',u:s.u,v:s.v,yaw:Number.isFinite(y)?y:0};}
 if(o.k==='ball')return {k:'ball',u:s.u,v:s.v};
 return null;
}
/** Any stored value → a valid save (bad entries dropped, caps applied). */
export function sanitizePracticeSave(raw:unknown):PracticeSave{
 const out=emptyPracticeSave();if(!raw||typeof raw!=='object')return out;const o=raw as Record<string,unknown>;
 if(typeof o.drill==='string'&&drillById(o.drill))out.drill=o.drill as DrillId;
 const ls=o.layouts;if(ls&&typeof ls==='object')for(const id of DRILL_IDS){const arr=(ls as Record<string,unknown>)[id];if(!Array.isArray(arr))continue;
  const props:PracticeProp[]=[],n={cone:0,man:0,ball:0};
  for(const p of arr.slice(0,80)){const c=cleanProp(p);if(c&&n[c.k]<PRACTICE_LIMITS[c.k]){n[c.k]++;props.push(c);}}
  out.layouts[id]=props;}
 return out;
}
/** The layout on the pitch for a save: the edited one, else the drill's default. */
export function layoutFor(save:PracticeSave,id:DrillId):PracticeProp[]{const e=save.layouts[id];return cloneProps(e??drillById(id)!.props);}
/** Enter: the saved drill (first ever visit: a random one, written to the save). */
export function enterDrill(save:PracticeSave,rand:()=>number=Math.random):{save:PracticeSave;drill:DrillId}{
 if(save.drill)return {save,drill:save.drill};const drill=pickDrill(null,rand);return {save:{...save,drill},drill};
}
/** Shuffle: another drill; the edit of the drill you leave is dropped (owner: remembered "until Reset or Shuffle-to-another"). */
export function shuffleDrill(save:PracticeSave,rand:()=>number=Math.random):{save:PracticeSave;drill:DrillId}{
 const layouts={...save.layouts};if(save.drill)delete layouts[save.drill];const drill=pickDrill(save.drill||null,rand);return {save:{v:1,drill,layouts},drill};
}
export function saveLayout(save:PracticeSave,id:DrillId,props:readonly PracticeProp[]):PracticeSave{return {...save,layouts:{...save.layouts,[id]:cloneProps(props)}};}
export function resetLayout(save:PracticeSave,id:DrillId):PracticeSave{const layouts={...save.layouts};delete layouts[id];return {...save,layouts};}

// ---------------------------------------------------------------------------------------------------------------- edits
export const countKind=(ps:readonly PracticeProp[],k:PropKind)=>{let n=0;for(const p of ps)if(p.k===k)n++;return n;};
/** Move prop i to (u, v): snapped to the 0.5 m grid, inside the pitch, out of the goal mouths. */
export function moveProp(ps:PracticeProp[],i:number,u:number,v:number){const p=ps[i];if(!p)return false;const s=clampSpot(snap(u),snap(v));p.u=s.u;p.v=s.v;return true;}
/** Tap action: a mannequin turns 45°; a cone takes the next colour; a ball has none. */
export function rotateProp(ps:PracticeProp[],i:number){const p=ps[i];if(!p)return false;
 if(p.k==='man'){p.yaw=Math.round(((p.yaw+Math.PI/4)%(Math.PI*2))*1e6)/1e6;return true;}
 if(p.k==='cone'){p.c=CONE_COLORS[(CONE_COLORS.indexOf(p.c)+1)%CONE_COLORS.length];return true;}
 return false;}
export function removeProp(ps:PracticeProp[],i:number){if(i<0||i>=ps.length)return false;ps.splice(i,1);return true;}
/** Add a prop near (u, v) on a free grid spot (≥ 0.9 m from the others); -1 when the kind is at its cap or nothing is free. */
export function addProp(ps:PracticeProp[],k:PropKind,u:number,v:number,c:ConeColor='orange'):number{
 if(countKind(ps,k)>=PRACTICE_LIMITS[k])return -1;
 const free=(a:number,b:number)=>ps.every(p=>Math.hypot(p.u-a,p.v-b)>=.9);
 for(let r=0;r<=14;r+=.5)for(let k2=0,n=r?Math.max(8,Math.round(r*8)):1;k2<n;k2++){
  const a=k2/n*Math.PI*2,s=clampSpot(snap(u+Math.cos(a)*r),snap(v+Math.sin(a)*r));
  if(free(s.u,s.v)){ps.push(k==='cone'?{k,u:s.u,v:s.v,c}:k==='man'?{k,u:s.u,v:s.v,yaw:W}:{k,u:s.u,v:s.v});return ps.length-1;}}
 return -1;
}
/** The prop nearest (u, v) within `reach` metres (-1 = none). Balls and cones are small: they get the same reach. */
export function pickProp(ps:readonly PracticeProp[],u:number,v:number,reach:number){let best=-1,bd=reach;for(let i=0;i<ps.length;i++){const d=Math.hypot(ps[i].u-u,ps[i].v-v);if(d<bd){bd=d;best=i;}}return best;}
/** Every prop of a layout inside the pitch and out of the goal mouths (tests, and a guard after edits). */
export function layoutInBounds(ps:readonly PracticeProp[]){return ps.every(p=>{const s=clampSpot(p.u,p.v);return Math.abs(s.u-p.u)<1e-9&&Math.abs(s.v-p.v)<1e-9;});}

// ---------------------------------------------------------------------------------------------------------------- balls
/** A loose practice ball (world metres). style: the ball design index into PRACTICE_BALL_STYLES (-1 = the player's own ball). */
export type PBall={x:number;y:number;z:number;vx:number;vy:number;vz:number;hx:number;hz:number;style:number;awake:boolean;out:number;spin:number};
/** Designs from the island's ball collection (lib/town/customization.ts BALL_COLORS + the vending specials). */
export const PRACTICE_BALL_STYLES=['classic','sunset','futsal','hivis','frost','beach','retro','cosmic','grassroots','panna'] as const;
export type PCone={x:number;z:number;c:ConeColor;down:number;fall:number;dx:number;dz:number};
export type PMan={x:number;z:number;yaw:number;tilt:number;tiltV:number;ax:number;az:number};
export type PracticeWorld={balls:PBall[];cones:PCone[];men:PMan[]};
/** Build the live pieces of a layout (world metres). Ball styles cycle through the collection. */
export function buildPracticeWorld(ps:readonly PracticeProp[]):PracticeWorld{
 const g=PITCH_HEIGHT,w:PracticeWorld={balls:[],cones:[],men:[]};let b=0;
 for(const p of ps){const {x,z}=toWorld(p.u,p.v);
  if(p.k==='cone')w.cones.push({x,z,c:p.c,down:0,fall:0,dx:0,dz:1});
  else if(p.k==='man')w.men.push({x,z,yaw:p.yaw,tilt:0,tiltV:0,ax:1,az:0});
  else w.balls.push({x,z,y:g+PRACTICE_BALL.rest,vx:0,vy:0,vz:0,hx:x,hz:z,style:b++%PRACTICE_BALL_STYLES.length,awake:false,out:0,spin:0});}
 return w;
}
export function resetBall(b:PBall){b.x=b.hx;b.z=b.hz;b.y=PITCH_HEIGHT+PRACTICE_BALL.rest;b.vx=b.vy=b.vz=0;b.awake=false;b.out=0;}
export function resetPracticeWorld(w:PracticeWorld){for(const b of w.balls)resetBall(b);for(const c of w.cones){c.down=0;c.fall=0;}for(const m of w.men){m.tilt=m.tiltV=0;}}
/** Knock a cone over in direction (dx, dz) (it falls over ~0.25 s; the runtime draws it). */
export function knockCone(c:PCone,dx:number,dz:number){if(c.down>0)return false;const l=Math.hypot(dx,dz)||1;c.dx=dx/l;c.dz=dz/l;c.down=1;return true;}
/** Push a mannequin: it wobbles on its spring base about the push's direction. */
export function wobbleMan(m:PMan,dx:number,dz:number,speed:number){const l=Math.hypot(dx,dz)||1;m.ax=dx/l;m.az=dz/l;m.tiltV+=Math.min(3.2,speed*.35);}

/** Step result (reused: no allocation per frame). goal: a ball crossed a goal line this step (gx, gy, gz = where). */
export type PracticeStep={goals:number;gx:number;gy:number;gz:number;moving:boolean;knocks:number;wobbles:number};
export const createPracticeStep=():PracticeStep=>({goals:0,gx:0,gy:0,gz:0,moving:false,knocks:0,wobbles:0});
const prev={x:0,z:0},cur={x:0,z:0};
/** The goal frames' boxes from SUMMIT_OBSTACLES (posts and back nets; the fence rails are handled as walls). */
export const GOAL_BOXES=SUMMIT_OBSTACLES.filter(o=>{const ax=Math.abs(o.x-P.x);return ax>P.length/2-.1&&ax<P.length/2+P.goalDepth+.5&&Math.abs(o.z-P.z)<P.goalWidth/2+.3;});
/** Collide a ball (x, z, radius r, below height) with an axis-aligned box: push out + reflect. Returns true on contact. */
function boxHit(b:PBall,o:{x:number;z:number;w:number;d:number},r:number,bounce:number){
 const cx=Math.max(o.x-o.w/2,Math.min(o.x+o.w/2,b.x)),cz=Math.max(o.z-o.d/2,Math.min(o.z+o.d/2,b.z)),dx=b.x-cx,dz=b.z-cz,d=Math.hypot(dx,dz);
 if(d>=r)return false;
 let nx:number,nz:number;if(d>1e-6){nx=dx/d;nz=dz/d;}else{const px=Math.abs(b.x-o.x)/(o.w/2+1e-6),pz=Math.abs(b.z-o.z)/(o.d/2+1e-6);if(px>pz){nx=Math.sign(b.x-o.x)||1;nz=0;}else{nx=0;nz=Math.sign(b.z-o.z)||1;}}
 b.x=cx+nx*r;b.z=cz+nz*r;const vn=b.vx*nx+b.vz*nz;if(vn<0){b.vx-=(1+bounce)*vn*nx;b.vz-=(1+bounce)*vn*nz;}return true;
}
/** Hit the cones and mannequins (shared by the loose balls and the walking ball). Returns the speed lost factor (1 = none). */
export function hitProps(w:PracticeWorld,b:{x:number;y:number;z:number;vx:number;vz:number},out:PracticeStep){
 const g=PITCH_HEIGHT,sp=Math.hypot(b.vx,b.vz);let k=1;
 if(b.y-g<.55&&sp>.6)for(const c of w.cones){if(c.down)continue;if(Math.hypot(b.x-c.x,b.z-c.z)<PRACTICE_BALL.cone+PRACTICE_BALL.radius){knockCone(c,b.vx,b.vz);out.knocks++;k*=.85;}}
 if(b.y-g<PRACTICE_BALL.manHeight)for(const m of w.men){const dx=b.x-m.x,dz=b.z-m.z,d=Math.hypot(dx,dz),r=PRACTICE_BALL.man+PRACTICE_BALL.radius;
  if(d<r&&d>1e-6){const nx=dx/d,nz=dz/d;b.x=m.x+nx*r;b.z=m.z+nz*r;const vn=b.vx*nx+b.vz*nz;if(vn<0){b.vx-=1.5*vn*nx;b.vz-=1.5*vn*nz;wobbleMan(m,-nx,-nz,-vn);out.wobbles++;}}}
 return k;
}
/**
 * One physics step for the loose balls (and the props' animation). Only awake balls move; a ball sleeps once it rests.
 * Bounces off the fence rail (sides) and the netting (ends), the goal frames and nets (SUMMIT_OBSTACLES), the mannequins and
 * each other; knocks cones over; counts goals (summitGoalCrossed); a ball over the fence goes home after a moment.
 */
export function stepPractice(w:PracticeWorld,dt:number,out:PracticeStep){
 out.goals=0;out.moving=false;out.knocks=0;out.wobbles=0;if(!(dt>0))return out;dt=Math.min(dt,1/20);
 const B=PRACTICE_BALL,g=PITCH_HEIGHT,r=B.radius;
 for(const b of w.balls){
  if(!b.awake)continue;out.moving=true;prev.x=b.x;prev.z=b.z;
  b.vy-=B.gravity*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
  const floor=g+B.rest;
  if(b.y<=floor){b.y=floor;if(b.vy<-1.2)b.vy=-b.vy*B.floorBounce;else b.vy=0;}
  if(b.y<=floor+.01){const sp=Math.hypot(b.vx,b.vz),ns=Math.max(0,sp*Math.exp(-B.roll*dt)-1.4*dt),f=sp>1e-6?ns/sp:0;b.vx*=f;b.vz*=f;}// grass: drag + rolling resistance
  b.spin=Math.hypot(b.vx,b.vz);
  // Fence and netting: bounce back unless the ball flies over (then it's out and goes home).
  const ix=F.halfX-r,iz=F.halfZ-r,dx=b.x-P.x,dz=b.z-P.z,inside=Math.abs(dx)<=F.halfX+.3&&Math.abs(dz)<=F.halfZ+.3;
  if(inside&&b.out===0){
   if(Math.abs(dx)>ix&&b.y-g<B.netHeight){b.x=P.x+Math.sign(dx)*ix;if(b.vx*dx>0)b.vx=-b.vx*B.wallBounce;}
   const gate=b.x>F.gate.x0+r&&b.x<F.gate.x1-r&&dz>0;
   if(Math.abs(dz)>iz&&b.y-g<B.railHeight&&!gate){b.z=P.z+Math.sign(dz)*iz;if(b.vz*dz>0)b.vz=-b.vz*B.wallBounce;}
  }
  if(!insidePracticeFence(b.x,b.z,-.3)){b.out+=dt;if(b.out>B.outReset||b.y<g-6){resetBall(b);continue;}}
  // Goal frames and nets (posts + back net), below the bar.
  if(b.y-g<P.goalHeight+.1)for(const o of GOAL_BOXES)boxHit(b,o,r,o.d>1?.1:.35);// the back net soaks a shot up; the posts ring
  cur.x=b.x;cur.z=b.z;if(summitGoalCrossed(prev,cur,b.y)){out.goals++;out.gx=b.x;out.gy=b.y;out.gz=b.z;}
  hitProps(w,b,out);
  if(b.y<=floor+.01&&Math.abs(b.vy)<.01&&Math.hypot(b.vx,b.vz)<B.sleep){b.vx=b.vz=b.vy=0;b.awake=false;}
 }
 // Ball to ball (equal masses: swap the normal speeds). N ≤ 10, so pairs are cheap; only pairs with a moving ball.
 const bs=w.balls;
 for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i],c=bs[j];if(!a.awake&&!c.awake)continue;
  const dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);if(d>=2*r||d<1e-6||Math.abs(a.y-c.y)>2*r)continue;
  const nx=dx/d,nz=dz/d,va=a.vx*nx+a.vz*nz,vc=c.vx*nx+c.vz*nz,push=(2*r-d)/2;a.x-=nx*push;a.z-=nz*push;c.x+=nx*push;c.z+=nz*push;
  if(va-vc>0){const dv=(va-vc)*.92;a.vx-=dv*nx;a.vz-=dv*nz;c.vx+=dv*nx;c.vz+=dv*nz;a.awake=c.awake=true;}}
 // Props: a fallen cone settles; mannequins spring back upright.
 for(const c of w.cones)if(c.down&&c.fall<1){c.fall=Math.min(1,c.fall+dt*4);out.moving=true;}
 for(const m of w.men)if(m.tilt!==0||m.tiltV!==0){m.tiltV+=(-38*m.tilt-4.2*m.tiltV)*dt;m.tilt+=m.tiltV*dt;m.tilt=Math.max(-.6,Math.min(.6,m.tilt));out.moving=true;
  if(Math.abs(m.tilt)<.002&&Math.abs(m.tiltV)<.01){m.tilt=m.tiltV=0;}}
 return out;
}
/** Give a ball a kick (it wakes). */
export function kickBall(b:PBall,vx:number,vy:number,vz:number){b.vx=vx;b.vy=vy;b.vz=vz;b.awake=true;}
/** The nearest loose ball within reach of (x, z) and low enough to touch with the feet (-1 = none). */
export function touchBall(w:PracticeWorld,x:number,z:number,reach:number){const g=PITCH_HEIGHT;let best=-1,bd=reach;
 for(let i=0;i<w.balls.length;i++){const b=w.balls[i];if(b.y-g>.7)continue;const d=Math.hypot(b.x-x,b.z-z);if(d<bd){bd=d;best=i;}}return best;}
/** Every ball inside the fence (tests): resting balls and moving ones alike. */
export const ballsInBounds=(w:PracticeWorld)=>w.balls.every(b=>insidePracticeFence(b.x,b.z,-.3));
