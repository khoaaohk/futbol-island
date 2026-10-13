import * as T from 'three';
import {CASE_PLACES,CASE} from './museumLayout';
import {museumSfx} from './museumSound';
import {STORIES} from './museumStories';

/**
 * The hall's exhibits as abstract sculptures (Oct 10 2026, user: "more modern and clean like the World Cup balls … more of a
 * MoMA, where things are more abstract"; shared brief docs/museum-modern-style.md). Each open case is a white plinth carrying
 * ONE geometric idea in the gallery palette (ink, white, and one primary accent). The beats of each story
 * (lib/museum/museumStories.ts) move the pieces: planes slide, spheres travel, lines draw. No literal props, no characters.
 *
 *  - laws-1863      a stack of thin slabs: they fan apart (every club its own rules), align into one stack, a slab opens, a blue
 *                   square is pressed on top;
 *  - penalty-1891   a red sphere and a line: a ring of sound, the sphere moves to its spot, a black upright slides on the line,
 *                   then the sphere crosses it (left, middle or right);
 *  - cards-1970     two coloured planes, yellow and red, lying flat; they lift and float, each steps forward in turn;
 *  - backpass-1992  a black ring with a blue sphere and a block in its centre: the block catches the sphere, a bar comes down,
 *                   then the sphere glances off the block and rolls away (drag to turn the ring);
 *  - var-2018       a frame within a frame: the inner frame steps forward, quarter-turns, a red line scans, the sphere is in or out;
 *  - worldcup-1930  a ring of small black cubes round a red disc; the cubes rise and a yellow column grows from the centre;
 *  - wwc-1991       a white sphere inside a tilted red orbit; it turns, two red points travel the ring, the ring levels;
 *  - futsal-1989    a blue plate with a hairline; a large and a small sphere fall, the small one barely bounces, then rolls;
 *  - laced-leather  a balance: a brown sphere against a white one; the brown side sinks, darkens in blue rain; three sizes appear;
 *  - telstar-1970   a black plane rises behind a white sphere; it flickers black and white, splits in two and they orbit;
 *  - shirts         a row of colour fields that rise, take white number tabs and part into two teams;
 *  - hall-of-fame   three stepped blocks, a green sphere on the highest, and a line drawn forward (the path ahead).
 *
 * Heat: every moving piece across the hall is an instance of FOUR shared instanced meshes (box, sphere, cylinder, ring) on one
 * material: 4 draw calls for all twelve sculptures. Pieces that never move join the room's ONE merged mesh (`add`). Matrices are
 * rewritten only for the sculpture that is animating; `update` reports busy only while something moves, so the room's loop
 * sleeps after each beat. Reduced motion: every beat jumps to its end pose (a complete static composition).
 */
type Add=(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx?:number,ry?:number,rz?:number,s?:number)=>unknown;
export type ExhibitAnim={id:string;anim:string;t:number;dur:number;arg?:number};
/** The gallery palette (docs/museum-modern-style.md). */
export const ART={ground:'#f6f4ef',ink:'#1d1d1b',muted:'#6b6a66',hair:'#d9d6cf',red:'#e4322b',blue:'#2a5bd7',yellow:'#f2c230',green:'#1f8a5b',white:'#f7f6f2',stone:'#e6e3dc',leather:'#8a5a33'} as const;
const TOP=CASE.plinthH+.04;
const ease=(t:number)=>t<=0?0:t>=1?1:t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const clamp01=(v:number)=>v<0?0:v>1?1:v;
/** Eased progress of `u` through the window a–b. */
const seg=(u:number,a:number,b:number)=>ease(clamp01((u-a)/Math.max(.001,b-a)));
const L=(a:number,b:number,k:number)=>a+(b-a)*k;

type Kind='box'|'sphere'|'cyl'|'ring';
type Tf={x:number;y:number;z:number;rx:number;ry:number;rz:number;sx:number;sy:number;sz:number};
type Node=Tf&{parent:Node|null;rest:Tf};
type Part=Node&{kind:Kind;i:number;c:string;restC:string;shown:string};
type Anim={dur:number;run:(u:number,arg?:number)=>void;cues?:readonly (readonly [number,()=>void])[]};
type Sculpture={id:string;root:Node;nodes:Node[];parts:Part[];anims:Record<string,Anim>;height:number;step?:(dt:number)=>boolean;onReset?:()=>void};

const TF0:Tf={x:0,y:0,z:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1};
const copyTf=(t:Tf):Tf=>({x:t.x,y:t.y,z:t.z,rx:t.rx,ry:t.ry,rz:t.rz,sx:t.sx,sy:t.sy,sz:t.sz});

export function createStoryExhibits(scene:T.Scene,opts:{open:Readonly<Record<string,boolean>>;reduced:boolean;add:Add;
 /** A soft contact shadow on a plinth top (world x, z, radius x/z). */
 shadow?:(x:number,y:number,z:number,rx:number,rz:number)=>void;earned?:number}){
 const {add,reduced}=opts,built=new Set<string>(),stageTops:Record<string,number>={},sculptures:Sculpture[]=[];
 const counts:Record<Kind,number>={box:0,sphere:0,cyl:0,ring:0};

 // ---- A tiny scene graph of plain numbers (no Object3Ds): nodes nest, parts are instances of the four shared meshes ---------
 let cur:Sculpture;
 const node=(t:Partial<Tf>,parent:Node|null=cur.root):Node=>{const n={...TF0,...t,parent,rest:copyTf({...TF0,...t})} as Node;cur.nodes.push(n);return n;};
 const part=(kind:Kind,c:string,t:Partial<Tf>,parent:Node|null=cur.root):Part=>{const p={...TF0,...t,parent,kind,i:counts[kind]++,c,restC:c,shown:'',rest:copyTf({...TF0,...t})} as Part;cur.parts.push(p);return p;};
 /** Box by size (w, h, d), sphere by radius, cylinder by radius + height, ring by radius (tube scales with it). */
 const box=(c:string,w:number,h:number,d:number,t:Partial<Tf>={},parent?:Node|null)=>part('box',c,{sx:w,sy:h,sz:d,...t},parent);
 const ball=(c:string,r:number,t:Partial<Tf>={},parent?:Node|null)=>part('sphere',c,{sx:r,sy:r,sz:r,...t},parent);
 const cyl=(c:string,r:number,h:number,t:Partial<Tf>={},parent?:Node|null)=>part('cyl',c,{sx:r,sy:h,sz:r,...t},parent);
 const ring=(c:string,r:number,t:Partial<Tf>={},parent?:Node|null)=>part('ring',c,{sx:r,sy:r,sz:r,...t},parent);
 /** Start a sculpture on its plinth: (x, z) of the case, `height` of its tallest pose (for the zoom framing and its label). */
 function sculpture(id:string,height:number,make:(p:{x:number;z:number},stat:(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx?:number,ry?:number,rz?:number)=>void,shadow:(x:number,z:number,rx:number,rz?:number)=>void)=>Record<string,Anim>|null){
  if(!opts.open[id]||!STORIES[id])return;const p=CASE_PLACES[id];
  cur={id,root:null as unknown as Node,nodes:[],parts:[],anims:{},height};cur.root={...TF0,x:p.x,y:TOP,z:p.z,parent:null,rest:copyTf({...TF0,x:p.x,y:TOP,z:p.z})};cur.nodes.push(cur.root);
  const stat=(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx=0,ry=0,rz=0)=>{add(geo,p.x+x,TOP+y,p.z+z,hex,rx,ry,rz);};
  const shadow=(x:number,z:number,rx:number,rz=rx)=>opts.shadow?.(p.x+x,TOP+.002,p.z+z,rx,rz);
  const anims=make(p,stat,shadow);if(!anims)return;cur.anims=anims;built.add(id);stageTops[id]=TOP+height;sculptures.push(cur);
 }
 const {ink:K,white:W,stone:S,red:R,blue:B,yellow:Y,green:G}=ART;

 // ---- 1863 · The first Laws: a stack of thin slabs -------------------------------------------------------------------------
 sculpture('laws-1863',.52,(_p,_s,shadow)=>{shadow(0,0,.34,.26);
  const slabs=[0,1,2,3,4].map(i=>box(i===2?B:i%2?S:W,.54,.036,.38,{y:.018+i*.05,ry:(i-2)*.05}));
  const stamp=box(B,.12,.024,.12,{y:.7,sx:0,sy:0,sz:0});const spread=(i:number)=>(i%2?1:-1);
  const tight=(i:number)=>.018+i*.038;
  return {
   argue:{dur:1.6,cues:[[0,museumSfx.flapBook],[.5,museumSfx.flapBook]],run(u){slabs.forEach((s,i)=>{const k=seg(u,i*.08,.6+i*.08);s.ry=s.rest.ry+k*spread(i)*(.32+i*.07);s.x=k*spread(i)*.07;s.y=s.rest.y+k*i*.025;});}},
   merge:{dur:1.4,cues:[[.55,museumSfx.flapBook]],run(u){slabs.forEach((s,i)=>{const k=seg(u,i*.06,.7+i*.06);s.ry=L(s.rest.ry+spread(i)*(.32+i*.07),0,k);s.x=L(spread(i)*.07,0,k);s.y=L(s.rest.y+i*.025,tight(i),k);if(i===2)s.c=k>.6?W:B;});}},
   play:{dur:1.4,cues:[[.2,museumSfx.flapBook]],run(u){const s=slabs[4],k=ease(u);s.y=tight(4)+Math.sin(u*Math.PI)*.16;s.ry=k*Math.PI;s.rx=Math.sin(u*Math.PI)*-.35;}},
   stamp:{dur:1.1,cues:[[.62,museumSfx.stamp]],run(u){const k=clamp01(u/.62),top=tight(4)+.018;stamp.sx=stamp.sz=.12;stamp.sy=.024;
    stamp.y=L(.62,top+.012,k*k);if(u>.62){const b=Math.sin(clamp01((u-.62)/.38)*Math.PI)*.25;stamp.sy=.024*(1-b);stamp.sx=stamp.sz=.12*(1+b*.4);stamp.y=top+stamp.sy/2;}}},
  };});

 // ---- 1891 · The penalty kick: a sphere and a line ---------------------------------------------------------------------------
 sculpture('penalty-1891',.42,(_p,stat,shadow)=>{
  stat(new T.BoxGeometry(.8,.006,.014),0,.003,-.3,K);stat(new T.CylinderGeometry(.014,.014,.004,20),0,.002,.18,K);
  const r0=.07,keeper=box(K,.1,.24,.014,{y:0,z:-.3,sy:0});const sphere=ball(R,r0,{x:-.28,y:r0,z:.32});const sound=ring(R,.08,{x:-.28,y:r0,z:.32,rx:Math.PI/2,sx:0,sy:0,sz:0});
  let kx=0,kr=0;
  return {
   whistle:{dur:1.1,cues:[[0,museumSfx.whistle]],run(u){const r=u>=1?0:.08+ease(u)*.22;sound.x=sphere.x;sound.z=sphere.z;sound.sx=sound.sy=sound.sz=r;}},
   place:{dur:1.2,run(u){const k=ease(u);sphere.x=L(-.28,0,k);sphere.z=L(.32,.18,k);}},
   keeper:{dur:1.6,run(u){keeper.sy=.24*seg(u,0,.35);keeper.y=keeper.sy/2;keeper.x=Math.sin(seg(u,.3,1)*Math.PI*2)*.14;}},
   shoot:{dur:1.3,cues:[[0,museumSfx.kick],[.72,museumSfx.net]],run(u,arg=0){const tx=arg*.27,k=ease(clamp01(u/.8));kx=arg===0?.24:-arg*.24;kr=-Math.sign(kx)*1.05;
    sphere.x=L(0,tx,k);sphere.z=L(.18,-.36,k);sphere.y=r0+Math.sin(k*Math.PI)*(arg===0?.16:.1);
    const d=seg(u,.15,.65);keeper.x=kx*d;keeper.rz=kr*d;keeper.y=L(.12,.07,d);}},
  };});

 // ---- 1970 · Yellow and red cards: two floating coloured planes ------------------------------------------------------------
 sculpture('cards-1970',.66,(_p,_s,shadow)=>{shadow(0,0,.36,.24);
  const w=.24,h=.34,big=1.12,flat=-Math.PI/2,yl=box(Y,w,h,.008,{x:-.15,y:.005,rx:flat}),rd=box(R,w,h,.008,{x:.15,y:.005,rx:flat});
  const hover=(c:Part,k:number,side:number)=>{c.y=L(.005,.34,k);c.rx=L(flat,-.08,k);c.ry=side*.2*k;};
  const size=(c:Part,k:number)=>{c.sx=w*k;c.sy=h*k;};
  return {
   lamp:{dur:1.5,cues:[[.1,museumSfx.reveal]],run(u){hover(yl,seg(u,0,.75),1);hover(rd,seg(u,.2,1),-1);}},
   yellow:{dur:1,cues:[[0,museumSfx.card]],run(u){const k=ease(u);yl.z=.13*k;yl.ry=.2*(1-k);size(yl,L(1,big,k));rd.z=-.06*k;}},
   red:{dur:1,cues:[[0,museumSfx.card]],run(u){const k=ease(u);rd.z=L(-.06,.13,k);rd.ry=-.2*(1-k);size(rd,L(1,big,k));yl.z=L(.13,0,k);size(yl,L(big,1,k));}},
   mexico:{dur:1.6,run(u){const k=ease(u);yl.ry=k*Math.PI*2;rd.ry=k*Math.PI*2;rd.z=L(.13,.04,k);yl.z=L(0,.04,k);size(rd,L(big,1,k));}},
   crowd:{dur:1.6,cues:[[0,museumSfx.crowd]],run(u){const k=ease(u);for(const [c,s] of [[yl,1],[rd,-1]] as const){c.y=.34+.1*k;c.rz=Math.sin(u*Math.PI*3)*.12*(1-u)*s;}}},
  };});

 // ---- 1992 · The back-pass rule: a ring, a sphere and a block (drag turns the ring) ----------------------------------------
 let spin=0,turn=null as Node|null;
 sculpture('backpass-1992',.4,(_p,_s,shadow)=>{shadow(0,0,.36,.36);
  turn=node({});const R0=.3,rg=ring(K,R0,{y:.012,rx:Math.PI/2},turn);void rg;box(K,.03,.012,.03,{x:0,y:.006,z:-R0-.0},turn);
  const block=box(W,.11,.06,.11,{y:.03},turn),bar=box(K,.56,.012,.012,{y:.7,sx:0}),sp=ball(B,.04,{y:.052,z:-R0},turn);
  const onRing=(a:number)=>{sp.x=Math.sin(a)*R0;sp.z=-Math.cos(a)*R0;sp.y=.052;};
  return {
   old:{dur:2.2,cues:[[0,museumSfx.kick]],run(u){const a=seg(u,0,.55);onRing(a*Math.PI);if(u>.55){const k=seg(u,.55,.8);sp.z=L(R0,0,k);sp.x=0;}
    const lift=seg(u,.72,1);block.sy=L(.06,.2,lift);block.y=block.sy/2;if(u>.8)sp.y=block.sy+.04;}},
   lever:{dur:1.1,cues:[[.6,museumSfx.stamp]],run(u){const k=ease(u);bar.sx=.56;bar.y=L(.7,.3,k*k);const d=seg(u,.6,1);block.sy=L(.2,.06,d);block.y=block.sy/2;sp.y=block.sy+.04;sp.x=0;sp.z=0;
    if(u>.6){sp.z=L(0,R0,d);sp.y=L(.24,.052,d);}}},
   new:{dur:2.2,cues:[[0,museumSfx.kick]],run(u){const a=seg(u,0,.5);onRing(Math.PI+a*Math.PI);if(u>.5){const k=seg(u,.5,.72),b=seg(u,.72,1);sp.z=L(-R0,-.09,k)+(u>.72?-b*.12:0);sp.x=0;}}},
   feet:{dur:1.3,cues:[[.3,museumSfx.kick]],run(u){block.z=L(0,-.1,seg(u,0,.3));const k=seg(u,.3,1);sp.z=L(-.21,-.08,k);sp.x=L(0,.38,k);sp.rz=-k*9;}},
  };});

 // ---- 2018 · The video assistant referee: a frame within a frame -----------------------------------------------------------
 sculpture('var-2018',.62,(_p,stat,shadow)=>{shadow(0,-.05,.32,.12);shadow(.36,.22,.06);
  const F=.52,t=.016,cy=.32;for(const s of [-1,1]){stat(new T.BoxGeometry(F,t,t),0,cy+s*(F-t)/2,-.08,K);stat(new T.BoxGeometry(t,F,t),s*(F-t)/2,cy,-.08,K);}
  stat(new T.BoxGeometry(.1,.012,.06),0,.006,-.08,K);stat(new T.BoxGeometry(t,cy-F/2,t),0,(cy-F/2)/2,-.08,K);
  const inner=node({y:cy,z:-.06}),f=.24,bars:Part[]=[];for(const s of [-1,1]){bars.push(box(B,f,.012,.012,{y:s*(f-.012)/2},inner),box(B,.012,f,.012,{x:s*(f-.012)/2},inner));}
  const scan=box(R,.006,f-.03,.006,{sy:0},inner),pt=ball(R,.026,{x:.36,y:.026,z:.22});
  return {
   booth:{dur:1.2,cues:[[0,museumSfx.look]],run(u){const k=ease(u);inner.z=L(-.06,.1,k);inner.sx=inner.sy=inner.sz=L(1,1.15,k);}},
   checks:{dur:1.8,cues:[[0,museumSfx.tick],[.33,museumSfx.tick],[.66,museumSfx.tick]],run(u){let r=0;for(let i=0;i<3;i++)r+=seg(u,i/3,i/3+.26)*Math.PI/2;inner.rz=r;}},
   scrub:{dur:1.6,cues:[[0,museumSfx.tick]],run(u){scan.sy=(f-.03)*seg(u,0,.12);scan.x=u<.12?-.1:u<.62?L(-.1,.1,seg(u,.12,.62)):L(.1,0,seg(u,.62,1));}},
   call:{dur:1.4,cues:[[1,museumSfx.reveal]],run(u,arg=1){const k=ease(u);scan.sy=(f-.03)*(1-seg(u,0,.2));
    if(arg){pt.x=L(.36,0,k);pt.z=L(.22,.12,k);pt.y=L(.026,cy,k)+Math.sin(k*Math.PI)*.08;}else{pt.x=L(.36,.08,seg(u,0,.5));pt.y=.026+Math.sin(seg(u,0,.5)*Math.PI)*.2;pt.z=.22;if(u>.5){const d=seg(u,.5,1);pt.x=L(.08,-.36,d);pt.y=.026;}}
    if(u>=1)for(const b of bars)b.c=arg?G:K;}},
  };});

 // ---- 1930 · The first World Cup: a ring of cubes and a rising column ------------------------------------------------------
 sculpture('worldcup-1930',.62,(_p,_s,shadow)=>{shadow(0,0,.38,.38);
  const cubes=Array.from({length:13},(_,i)=>{const a=i/13*Math.PI*2;return box(K,.045,.045,.045,{x:Math.sin(a)*.32,z:Math.cos(a)*.32,ry:a,y:.008,sy:.016});});
  const disc=cyl(R,.13,.012,{y:.006,sx:0,sz:0}),col=cyl(Y,.028,.44,{y:.012,sy:0}),top=ball(Y,.05,{y:.5,sx:0,sy:0,sz:0});
  return {
   host:{dur:1.2,cues:[[0,museumSfx.flap]],run(u){const k=ease(u);disc.sx=disc.sz=.13*k;}},
   teams:{dur:1.7,run(u){cubes.forEach((c,i)=>{const k=seg(u,i*.05,i*.05+.3);c.sy=L(.016,.045,k);c.y=c.sy/2;});}},
   final:{dur:1.9,cues:[[1.25/1.9,museumSfx.crowd],[1.25/1.9,museumSfx.reveal]],run(u){const k=seg(u,0,.65);col.sy=.44*k;col.y=.012+col.sy/2;const s=seg(u,.6,.85)*.05;top.sx=top.sy=top.sz=s;top.y=.012+.44+.05;}},
  };});

 // ---- 1991 · The first Women's World Cup: a sphere in a tilted orbit -------------------------------------------------------
 sculpture('wwc-1991',.52,(_p,stat,shadow)=>{shadow(0,0,.2,.2);
  stat(new T.CylinderGeometry(.03,.05,.06,24),0,.03,0,K);stat(new T.IcosahedronGeometry(.17,4),0,.06+.17,0,W);
  const orbit=node({y:.23,rz:.38}),R1=.28;ring(R,R1,{rx:Math.PI/2},orbit);
  const pts=[0,1].map(i=>ball(R,.028,{x:Math.cos(i*Math.PI)*R1,z:Math.sin(i*Math.PI)*R1,sx:0,sy:0,sz:0},orbit));
  return {
   spin:{dur:2,cues:[[0,museumSfx.spin]],run(u){orbit.ry=ease(u)*Math.PI*2;}},
   goals:{dur:1.8,cues:[[.4,museumSfx.crowd]],run(u){pts.forEach((p,i)=>{const a=i*Math.PI+ease(u)*Math.PI*.75+i*.3*ease(u),s=.028*seg(u,i*.15,i*.15+.25);p.x=Math.cos(a)*R1;p.z=Math.sin(a)*R1;p.sx=p.sy=p.sz=s;});}},
   result:{dur:1.4,cues:[[0,museumSfx.whistle]],run(u){const k=ease(u);orbit.rz=L(.38,0,k);orbit.y=L(.23,.23,k);}},
  };});

 // ---- 1989 · Futsal's World Cup: a blue plate, a large and a small sphere --------------------------------------------------
 sculpture('futsal-1989',.6,(_p,_s,shadow)=>{shadow(0,0,.42,.28);
  const plate=box(S,.72,.016,.44,{y:.008}),line=box(W,.006,.003,.44,{y:.0175,sz:0}),base=.016;
  const big=ball(W,.066,{x:-.14,y:base+.066}),small=ball(K,.05,{x:.14,y:base+.05});
  const rod=cyl(K,.004,.3,{x:.3,z:-.16,y:.016,sy:0}),flag=box(Y,.12,.07,.004,{x:.36,z:-.16,y:.28,sx:0,sy:0});
  /** A drop from `h` with restitution `e`: height at time `t` (s) above the rest point. */
  const drop=(t:number,h:number,e:number)=>{const g=3.2;let v=Math.sqrt(2*g*h),tt=t;const first=Math.sqrt(2*h/g);if(tt<first)return h-.5*g*tt*tt;tt-=first;v*=e;for(let i=0;i<5;i++){const fl=2*v/g;if(tt<fl)return v*tt-.5*g*tt*tt;tt-=fl;v*=e;}return 0;};
  const blue=new T.Color(B),stone=new T.Color(S),tint=new T.Color();
  return {
   court:{dur:1.3,cues:[[0,museumSfx.reveal]],run(u){plate.c='#'+tint.copy(stone).lerp(blue,seg(u,0,.6)).getHexString();line.sz=.44*seg(u,.5,1);}},
   bounce:{dur:2.4,cues:[[.42,museumSfx.kick]],run(u){const up=seg(u,0,.15),t=Math.max(0,u-.15)*2.4;
    big.y=base+.066+(u<.15?up*.5:drop(t,.5,.72));small.y=base+.05+(u<.15?up*.5:drop(t,.5,.22));if(u>=1){big.y=base+.066;small.y=base+.05;}}},
   sole:{dur:1.5,run(u){const x=u<.5?L(.14,-.12,seg(u,0,.5)):L(-.12,.06,seg(u,.5,1));small.rz=-(x-.14)/.05;small.x=x;}},
   cup:{dur:1.4,cues:[[.7,museumSfx.reveal]],run(u){const k=seg(u,0,.6);rod.sy=.3*k;rod.y=base+rod.sy/2;const f=seg(u,.55,1);flag.sx=.12*f;flag.sy=.07*f;flag.x=.3+.06*f;flag.y=base+.3-.035;}},
  };});

 // ---- Before the 1960s · Laced leather balls: a balance ------------------------------------------------------------------
 sculpture('laced-leather',.46,(_p,stat,shadow)=>{shadow(0,0,.4,.16);
  stat(new T.CylinderGeometry(.004,.045,.14,24),0,.07,0,K);
  const beam=node({y:.144}),r=.075;box(K,.64,.01,.024,{},beam);const leather=ball(ART.leather,r,{x:-.26,y:.005+r},beam),modern=ball(W,r,{x:.26,y:.005+r},beam);
  const drops=[0,1,2].map(i=>box(B,.004,.09,.004,{x:-.3+i*.04,y:.6,sy:0}));
  const sizes=[.034,.044,.055].map((s,i)=>ball(W,s,{x:-.2+i*.2,y:s,z:.3,sx:0,sy:0,sz:0}));
  return {
   weigh:{dur:1.4,run(u){beam.rz=Math.sin(seg(u,0,1)*Math.PI*.5)*.15+Math.sin(u*Math.PI*3)*.03*(1-u);}},
   rain:{dur:1.9,cues:[[0,museumSfx.hush]],run(u){drops.forEach((d,i)=>{const ph=(u*2.4+i*.33)%1;d.sy=u<1?.09:0;d.y=L(.62,.32,ph);});beam.rz=L(.15,.27,seg(u,.2,1));
    leather.c='#'+new T.Color(ART.leather).lerp(new T.Color('#3e2a1c'),seg(u,.1,.9)).getHexString();}},
   size5:{dur:1.6,run(u){beam.rz=L(.27,.02,seg(u,0,.8))+Math.sin(u*Math.PI*3)*.025*(1-u);const p=Math.sin(seg(u,.1,.6)*Math.PI)*.12;modern.sx=modern.sy=modern.sz=r*(1+p);}},
   sizes:{dur:1.6,cues:[[0,museumSfx.reveal]],run(u){sizes.forEach((s,i)=>{const k=seg(u,i*.2,i*.2+.45),r0=[.034,.044,.055][i];s.sx=s.sy=s.sz=r0*k;s.y=r0;});}},
  };});

 // ---- 1970 · The Telstar TV ball: a black plane and a black-and-white pair -------------------------------------------------
 sculpture('telstar-1970',.5,(_p,_s,shadow)=>{shadow(0,.12,.22,.14);shadow(0,-.2,.24,.06);
  const hinge=node({z:-.16,rx:-Math.PI/2});box(K,.42,.32,.014,{y:.16},hinge);
  const pair=node({y:.09,z:.12}),white=ball(W,.09,{},pair),black=ball(K,.09,{sx:0,sy:0,sz:0},pair);
  return {
   tv:{dur:1.4,cues:[[.8,museumSfx.tick]],run(u){hinge.rx=L(-Math.PI/2,0,ease(u));}},
   bw:{dur:1.7,cues:[[0,museumSfx.tick],[.6,museumSfx.reveal]],run(u){const flick=u<.55?Math.floor(u*14)%2:0;white.c=flick?K:W;const k=seg(u,.55,1);black.sx=black.sy=black.sz=.09*Math.min(1,k*3);white.x=-.11*k;black.x=.11*k;}},
   spin:{dur:1.8,cues:[[0,museumSfx.spin]],run(u){pair.ry=ease(u)*Math.PI*2;}},
  };});

 // ---- 1928 · Numbers and colours: a row of colour fields -------------------------------------------------------------------
 sculpture('shirts',.46,(_p,_s,shadow)=>{shadow(0,0,.4,.1);
  // The kit wall's 1 (green), 9 (red) and 10 (blue), then yellow.
  const cols=[G,R,B,Y],xs=[-.27,-.09,.09,.27];
  const fields=cols.map((c,i)=>{const n=node({x:xs[i]});const f=box(c,.15,.34,.012,{y:.05,sy:.1},n);const tab=box(W,.05,.05,.004,{y:.27,z:.008,sx:0,sy:0,sz:0},n);return {n,f,tab};});
  /** Field `i` steps forward and its number tab grows; the one before steps back. */
  const step=(i:number,u:number)=>{const k=ease(u),a=fields[i],b=fields[i-1];a.n.z=.1*k;a.tab.sx=a.tab.sy=L(.05,.07,k);if(b){b.n.z=.1*(1-k);b.tab.sx=b.tab.sy=L(.07,.05,k);}};
  return {
   numbers:{dur:1.7,cues:[[0,museumSfx.reveal]],run(u){fields.forEach(({f,tab},i)=>{const k=seg(u,i*.1,i*.1+.5);f.sy=L(.1,.34,k);f.y=f.sy/2;const t=seg(u,.55+i*.08,.8+i*.06);tab.sx=tab.sy=.05*t;tab.sz=.004*(t>0?1:0);});}},
   open1:{dur:1,cues:[[0,museumSfx.flap]],run(u){step(0,u);}},
   open9:{dur:1,cues:[[0,museumSfx.flap]],run(u){step(1,u);}},
   open10:{dur:1,cues:[[0,museumSfx.flap]],run(u){step(2,u);}},
   colours:{dur:1.6,cues:[[0,museumSfx.flap]],run(u){const k=ease(u),to=[-.32,-.17,.17,.32];fields[2].tab.sx=fields[2].tab.sy=L(.07,.05,k);fields.forEach(({n},i)=>{n.x=L(xs[i],to[i],k);n.ry=(i<2?.35:-.35)*k;n.z=L(i===2?.1:0,.04,k);});}},
  };});

 // ---- Today · Your Hall of Fame: stepped blocks, a green sphere, a line forward ----------------------------------------------
 sculpture('hall-of-fame',.5,(_p,_s,shadow)=>{shadow(0,0,.3,.14);
  const hs=[.14,.22,.09],blocks=hs.map((_,i)=>box(i===1?W:S,.15,.04,.15,{x:(i-1)*.155,y:.02}));
  const champ=ball(G,.05,{y:.7,sx:0,sy:0,sz:0}),path=box(K,.008,.004,.34,{y:.002,z:.075,sz:0}),goal=box(G,.04,.004,.04,{y:.002,z:.43,sx:0,sz:0});
  return {
   podium:{dur:1.8,cues:[[1.4/1.8,museumSfx.reveal]],run(u){blocks.forEach((b,i)=>{const k=seg(u,[.1,0,.2][i],[.1,0,.2][i]+.5);b.sy=L(.04,hs[i],k);b.y=b.sy/2;});
    const d=seg(u,.55,.78);champ.sx=champ.sy=champ.sz=.05*(d>0?1:0);champ.y=L(.7,.22+.05,d*d);}},
   ferry:{dur:1.6,run(u){const k=seg(u,0,.8);path.sz=.34*k;path.z=.075+path.sz/2;const g=seg(u,.75,1);goal.sx=goal.sz=.04*g;}},
  };});

 // ---- The four shared instanced meshes --------------------------------------------------------------------------------------
 const mat=new T.MeshPhongMaterial({color:'#ffffff',shininess:36,specular:'#262626'});
 const geos:Record<Kind,T.BufferGeometry>={box:new T.BoxGeometry(1,1,1),sphere:new T.IcosahedronGeometry(1,3),cyl:new T.CylinderGeometry(1,1,1,24),ring:new T.TorusGeometry(1,.055,6,48)};
 const meshes={} as Record<Kind,T.InstancedMesh>;
 for(const k of Object.keys(geos) as Kind[]){const m=new T.InstancedMesh(geos[k],mat,Math.max(1,counts[k]));m.count=counts[k];m.frustumCulled=false;m.name='museum-sculpture-'+k;m.matrixAutoUpdate=false;
  m.instanceMatrix.setUsage(T.DynamicDrawUsage);meshes[k]=m;if(counts[k])scene.add(m);}
 const mA=new T.Matrix4(),mB=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sv=new T.Vector3(),col=new T.Color();
 /** A piece with any zero axis is hidden (collapsed to a point), so a half-grown line never leaves a speck. */
 const local=(t:Tf,out:T.Matrix4)=>out.compose(v.set(t.x,t.y,t.z),q.setFromEuler(e.set(t.rx,t.ry,t.rz,'YXZ')),t.sx*t.sy*t.sz===0?sv.set(1e-6,1e-6,1e-6):sv.set(t.sx,t.sy,t.sz));
 const world=(n:Node,out:T.Matrix4):T.Matrix4=>{local(n,out);for(let p=n.parent;p;p=p.parent)out.premultiply(local(p,mB));return out;};
 const dirty=new Set<Kind>();
 function write(s:Sculpture){for(const p of s.parts){world(p,mA);meshes[p.kind].setMatrixAt(p.i,mA);dirty.add(p.kind);
   if(p.shown!==p.c){p.shown=p.c;meshes[p.kind].setColorAt(p.i,col.set(p.c));}}
  for(const k of dirty){meshes[k].instanceMatrix.needsUpdate=true;if(meshes[k].instanceColor)meshes[k].instanceColor!.needsUpdate=true;}dirty.clear();}
 const restore=(s:Sculpture)=>{for(const n of s.nodes)Object.assign(n,n.rest);for(const p of s.parts){Object.assign(p,p.rest);p.c=p.restC;}s.onReset?.();};
 for(const s of sculptures)write(s);

 const byId=new Map(sculptures.map(s=>[s.id,s]));
 const backpass=byId.get('backpass-1992')??null;
 if(backpass&&turn){const tn=turn;backpass.step=dt=>{if(!spin)return false;tn.ry+=spin*dt;spin*=Math.exp(-dt*2.4);if(Math.abs(spin)<.05)spin=0;return true;};backpass.onReset=()=>{spin=0;};}
 let active:ExhibitAnim|null=null;
 /** Sound cues: `at` (0–1 of the beat) fires once when the beat's clock passes it; cues at 0 fire as the beat starts. */
 const cueRun=(a:Anim,prev:number,now:number)=>{for(const [at,fn] of a.cues??[]){const t=at*a.dur;if(prev<0?at===0:at>0&&t>prev&&t<=now)fn();}};
 function finish(){if(!active)return;const s=byId.get(active.id)!,a=s.anims[active.anim];a.run(1,active.arg);write(s);active=null;}

 return {
  /** Cases whose object is a sculpture (the scene skips their vitrine). */
  built,
  /** Each sculpture's top (world y): the zoom frames the whole piece up to here. */
  stageTops,
  has:(id:string)=>byId.has(id),
  /** Play one beat's animation; returns its length in seconds (0 with reduced motion: it jumps to the end pose). */
  play(id:string,anim:string,arg?:number){const s=byId.get(id),a=s?.anims[anim];if(!s||!a)return 0;finish();
   if(reduced){for(const [,fn] of a.cues??[]){fn();break;}a.run(1,arg);write(s);return 0;}
   active={id,anim,t:0,dur:a.dur,arg};cueRun(a,-1,0);a.run(0,arg);write(s);return a.dur;},
  /** The back-pass ring turns with a drag (radians). */
  crank(d:number){if(!backpass||!turn)return;if(reduced){turn.ry+=Math.sign(d)*Math.PI/6;}else{turn.ry+=d;spin=Math.max(-8,Math.min(8,spin+d*6));}write(backpass);},
  reset(id:string){const s=byId.get(id);if(!s)return;if(active?.id===id)active=null;restore(s);write(s);},
  /** Advance the playing beat (and the ring's coast); true while anything moves (the room's loop keeps rendering). */
  update(dt:number){let busy=false;
   if(active){const s=byId.get(active.id)!,a=s.anims[active.anim],prev=active.t;active.t=Math.min(active.dur,active.t+dt);cueRun(a,prev,active.t);
    if(active.t>=active.dur)finish();else{a.run(active.t/active.dur,active.arg);write(s);busy=true;}}
   if(backpass?.step?.(dt)){write(backpass);busy=true;}
   return busy;},
  get debug(){return {active:active?{...active}:null,sculptures:sculptures.map(s=>s.id),instances:{...counts},spin};},
  dispose(){for(const k of Object.keys(meshes) as Kind[]){scene.remove(meshes[k]);meshes[k].dispose();geos[k].dispose();}mat.dispose();},
 };
}
export type StoryExhibits=ReturnType<typeof createStoryExhibits>;
