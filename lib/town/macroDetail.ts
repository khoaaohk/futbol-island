import {decalRng,FLOWER_COLORS,MACRO_CAP,STONE_COLORS,TUFT_COLORS,type MacroKind,type MacroSite,type Pt} from '../graphics/groundDecals';
import type {OpenKind,OpenScan} from './openSpaces';

/**
 * Macro detail planner (Oct 17 2026): fills the OPEN regions found by openSpaces.ts with bigger features, so a wide empty beach or
 * lawn is not flat. Pure and seeded (same spots on every device), at most MACRO_CAP (900) extra instances per island on top of the
 * small decals. Sand: low dune humps in drifts along the wind, ripple-streak rows, driftwood and larger rocks near the waterline, a tidal
 * line of seaweed strands and shell clusters at a fixed distance from the shore, the odd towel. Lawn: big grass clumps (tall tuft
 * groups), flower patches of 5-12, rock groups, worn bare-earth discs, leaf litter beside trees. Density per area rises with the size of
 * the open region (cell weight); every group base keeps a Poisson spacing and every member a 0.7 m clearance, so nothing reads as a grid.
 */
export type MacroInput={seed:number;cap?:number;scan:OpenScan;
 /** Final per-point test: right ground and not within a blocked rect (radius r is checked on four sides). */ ok:(x:number,z:number,kind:OpenKind,r:number)=>boolean;
 y:(x:number,z:number,kind:OpenKind)=>number;
 /** Waterline ring (inland side given by `inside`) used for the tidal line, driftwood and shore rocks; none = no shore layers. */ shore?:{ring:Pt[];inside:Pt};
 /** Trees and other small obstacles (leaf litter goes round them). */ trees?:{x:number;z:number}[];
 /** Radians: the drift direction of dunes and ripples. */ wind?:number};
export const MACRO_PER_CELL=6.5; // instances per full-weight 8 m cell (a big empty region), all layers together
const SAND_COL={dune:['#f8e4b6','#e0c088','#f1d8a6','#d8b87e','#fbebc2'],ripple:['#d2b076','#fdf1d3','#c9a468','#f8e7bf'],log:['#8b6b4a','#a58762','#6f563c','#b39a78'],
 weed:['#3f5a3a','#556b3b','#2f4a3a','#4b5f33'],shellPale:['#fbf0e0','#f1d9c6','#e3a898','#d9c9ae'],towel:['#e8604c','#3f86c9','#f2c94c','#44b39a','#e58ab6','#f4f4f0'],
 bare:['#8d7a5a','#7e6c4e','#9a8765'],litter:['#b9893b','#a8602f','#c9a24a','#8c5a2b','#9c7a3a']} as const;

class Occupancy{ // spatial hash: is anything within d of (x,z)?
 private m=new Map<number,Pt[]>();constructor(private c:number){}
 private k(i:number,j:number){return (i+8192)*16384+(j+8192);}
 near(x:number,z:number,d:number){const c=this.c,i0=Math.floor((x-d)/c),i1=Math.floor((x+d)/c),j0=Math.floor((z-d)/c),j1=Math.floor((z+d)/c);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const l=this.m.get(this.k(i,j));if(l)for(const p of l)if((p.x-x)**2+(p.z-z)**2<d*d)return true;}return false;}
 add(x:number,z:number){const k=this.k(Math.floor(x/this.c),Math.floor(z/this.c));let l=this.m.get(k);if(!l){l=[];this.m.set(k,l);}l.push({x,z});}
}

export function planMacroDetail(inp:MacroInput):MacroSite[]{
 const rng=decalRng(inp.seed),cap=Math.min(inp.cap??MACRO_CAP,MACRO_CAP),wind=inp.wind??.35,out:MacroSite[]=[];
 const cells=inp.scan.cells.filter(c=>c.w>0),c8=inp.scan.cell;
 const pools:Record<OpenKind,{cells:typeof cells;cum:number[];sum:number}>={sand:{cells:[],cum:[],sum:0},grass:{cells:[],cum:[],sum:0}};
 for(const c of cells){const p=pools[c.kind];p.sum+=c.w;p.cells.push(c);p.cum.push(p.sum);}
 if(!cells.length)return out;
 // Budget: per-area density follows the cell weights (K per full-weight cell), capped; the two ground kinds split the cap by their weight.
 const total=pools.sand.sum+pools.grass.sum,want:Record<OpenKind,number>={sand:0,grass:0};
 for(const k of ['sand','grass'] as OpenKind[]){const share=total?pools[k].sum/total:0;want[k]=Math.min(Math.round(pools[k].sum*MACRO_PER_CELL),Math.round(cap*(share?Math.max(.35,Math.min(.8,share)):0)));}
 if(pools.sand.sum===0)want.grass=Math.min(cap,Math.round(pools.grass.sum*MACRO_PER_CELL));if(pools.grass.sum===0)want.sand=Math.min(cap,Math.round(pools.sand.sum*MACRO_PER_CELL));
 const all=new Occupancy(1),bases=new Map<string,Occupancy>();
 const baseOcc=(k:string,d:number)=>{let o=bases.get(k);if(!o){o=new Occupancy(Math.max(2,d/2));bases.set(k,o);}return o;};
 const pickCell=(kind:OpenKind)=>{const p=pools[kind];if(!p.cells.length)return null;const t=rng()*p.sum;let lo=0,hi=p.cum.length-1;while(lo<hi){const m=(lo+hi)>>1;if(p.cum[m]<t)lo=m+1;else hi=m;}return p.cells[lo];};
 const pickIn=(kind:OpenKind)=>{const c=pickCell(kind);return c?{x:c.x+(rng()-.5)*c8,z:c.z+(rng()-.5)*c8,w:c.w}:null;};
 const ring=inp.shore?.ring,inside=inp.shore?.inside;
 const ringNormals=ring&&inside?ring.map((p,i)=>{const a=ring[(i+ring.length-1)%ring.length],b=ring[(i+1)%ring.length];let nx=b.z-a.z,nz=-(b.x-a.x);const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;if(nx*(inside.x-p.x)+nz*(inside.z-p.z)<0){nx=-nx;nz=-nz;}return {x:nx,z:nz};}):null;
 /** A point `d` m inland of a random shore point, inside an open sand cell. */
 const shorePick=(dMin:number,dMax:number)=>{if(!ring||!ringNormals)return null;const i=Math.floor(rng()*ring.length)%ring.length,d=dMin+rng()*(dMax-dMin),x=ring[i].x+ringNormals[i].x*d,z=ring[i].z+ringNormals[i].z*d;
  const c=inp.scan.cellAt(x,z);return c&&c.kind==='sand'&&c.w>0&&rng()<c.w?{x,z,w:c.w,tx:-ringNormals[i].z,tz:ringNormals[i].x}:null;};
 const yOf=(x:number,z:number,k:OpenKind)=>inp.y(x,z,k);
 const used=()=>out.length;
 const add=(k:MacroKind,kind:OpenKind,x:number,z:number,r:number,sx:number,sy:number,sz:number,col:string,lift:number,clear:number,rad:number)=>{
  if(used()>=cap||all.near(x,z,clear)||!inp.ok(x,z,kind,rad))return false;
  out.push({k,x:+x.toFixed(2),y:+(yOf(x,z,kind)+lift).toFixed(3),z:+z.toFixed(2),r:+r.toFixed(3),sx:+sx.toFixed(3),sy:+sy.toFixed(3),sz:+sz.toFixed(3),col});all.add(x,z);return true;};
 const pick=<T,>(a:readonly T[])=>a[Math.floor(rng()*a.length)%a.length];
 /** Runs a layer: `tries` base spots (Poisson-spaced by `gap`), each spawning a group; stops at the layer's quota. */
 const layer=(name:string,kind:OpenKind,quota:number,gap:number,place:(b:{x:number;z:number;w:number;tx?:number;tz?:number})=>number,src:()=>ReturnType<typeof pickIn>|ReturnType<typeof shorePick>)=>{
  const occ=baseOcc(name,gap),start=out.length;
  for(let t=0;out.length-start<quota&&used()<cap&&t<quota*30;t++){const b=src();if(!b||occ.near(b.x,b.z,gap))continue;if(place(b)>0)occ.add(b.x,b.z);}};
 const q=(kind:OpenKind,f:number)=>Math.round(want[kind]*f);
 const sandSrc=()=>pickIn('sand'),grassSrc=()=>pickIn('grass');
 const sd=(a:number,b:number)=>a+rng()*(b-a);
 const wx=Math.cos(wind),wz=Math.sin(wind);
 // ---------------- sand
 // dune drifts: 3-6 humps stepping along the wind, 1.2-3.6 m wide, never closer than 2 m to each other
 layer('dune','sand',q('sand',.27),8.5,b=>{const n=2+Math.floor(rng()*3*(.4+b.w))+(rng()<.3?1:0);let x=b.x,z=b.z,made=0;
  for(let i=0;i<n;i++){const len=sd(1.5,3)*(.8+.35*Math.sin(i/(n-1||1)*Math.PI)),wid=sd(.45,.85),h=sd(.2,.4);
   if(add('dune','sand',x,z,-wind+(rng()-.5)*.4,len,h/.35,wid,pick(SAND_COL.dune),.004,2.1,Math.max(len,wid)))made++;
   const step=sd(2.6,4.2);x+=wx*step-wz*(rng()-.5)*2.4;z+=wz*step+wx*(rng()-.5)*2.4;}
  return made;},sandSrc);
 // ripple rows: 3-6 thin crests side by side across the wind
 layer('ripple','sand',q('sand',.24),5.5,b=>{const n=3+Math.floor(rng()*4),col=pick(SAND_COL.ripple);let made=0,x=b.x,z=b.z;
  for(let i=0;i<n;i++){const len=sd(1.1,3);if(add('ripple','sand',x,z,-(wind+Math.PI/2)+(rng()-.5)*.3,len,1,sd(.13,.21),col,.014,.5,len*.5))made++;
   const s=sd(.5,.85);x+=wx*s+(rng()-.5)*.5*wz;z+=wz*s-(rng()-.5)*.5*wx;}
  return made;},sandSrc);
 // tidal line: seaweed strands (dark green flat strips) 3 m inland of the waterline, with a gently wandering offset
 layer('weed','sand',q('sand',.13),4.5,b=>{const n=2+Math.floor(rng()*3);let made=0;
  for(let i=0;i<n;i++){const ang=Math.atan2(b.tz??0,b.tx??1)+(rng()-.5)*.9,len=sd(.5,1.3);if(add('weed','sand',b.x+(rng()-.5)*1.1,b.z+(rng()-.5)*1.1,-ang,len,1,sd(.08,.16),pick(SAND_COL.weed),.016,.45,len*.5))made++;}
  return made;},()=>shorePick(2.6,3.9));
 // shell clusters on the tidal line and a bit above it
 layer('shell','sand',q('sand',.08),6,b=>{const n=3+Math.floor(rng()*3);let made=0;
  for(let i=0;i<n;i++){const s=sd(.1,.2);if(add('shell','sand',b.x+(rng()-.5)*1.2,b.z+(rng()-.5)*1.2,rng()*6.28,s,s*.45,s*1.25,pick(SAND_COL.shellPale),s*.15,.3,s))made++;}
  return made;},()=>shorePick(2.2,6.5));
 // driftwood logs near the waterline (1.4-3.2 m, a stub of a second beside some)
 layer('log','sand',q('sand',.05),13,b=>{const ang=rng()*Math.PI,len=sd(.7,1.6),th=sd(.1,.17);let made=0;
  if(add('log','sand',b.x,b.z,ang,len,th,th,pick(SAND_COL.log),th*.5,1.4,len))made++;
  if(made&&rng()<.4&&add('log','sand',b.x+Math.cos(ang)*.5+.4,b.z+Math.sin(ang)*.5+.35,ang+sd(-.7,.7),len*.45,th*.8,th*.8,pick(SAND_COL.log),th*.4,.5,len*.45))made++;
  return made;},()=>shorePick(3,11));
 // a few larger rocks near the waterline (singles and pairs)
 layer('rock','sand',q('sand',.04),14,b=>{let made=0;const n=1+(rng()<.4?1:0);
  for(let i=0;i<n;i++){const s=sd(.35,.9);if(add('rock','sand',b.x+i*sd(.6,1.2),b.z+(rng()-.5)*.9,rng()*6.28,s,s*.6,s*1.15,pick([STONE_COLORS[0],STONE_COLORS[1],STONE_COLORS[2],STONE_COLORS[1]]),s*.2,.8,s))made++;}
  return made;},()=>shorePick(2.4,12));
 // the odd towel on the open middle of a big beach (needs a weighty region)
 layer('towel','sand',Math.min(8,Math.round(pools.sand.sum/40)),22,b=>b.w>.6&&add('towel','sand',b.x,b.z,rng()*6.28,sd(1.5,1.8),1,sd(.8,1),pick(SAND_COL.towel),.02,2,1)?1:0,sandSrc);
 // ---------------- lawn
 // large grass clumps: 3-6 tall tufts (up to ~1.7 m), taller toward the middle of big regions
 layer('tuft','grass',q('grass',.3),6.5,b=>{const n=3+Math.floor(rng()*4),tall=sd(1,1.4)*(.8+.25*b.w);let made=0;
  for(let i=0;i<n;i++){const a=rng()*6.28,d=Math.sqrt(rng())*1.1,s=tall*sd(.75,1.25);if(add('tuft','grass',b.x+Math.cos(a)*d,b.z+Math.sin(a)*d,rng()*6.28,s,s*sd(.85,1.3),s,pick(TUFT_COLORS),0,.6,s*.4))made++;}
  return made;},grassSrc);
 // flower patches: 5-12 flowers within ~1.7 m, one or two dominant colours
 layer('flower','grass',q('grass',.26),11,b=>{const n=5+Math.floor(rng()*8),c1=pick(FLOWER_COLORS.slice(0,4)),c2=pick(FLOWER_COLORS.slice(0,4));let made=0;
  for(let i=0;i<n;i++){const a=rng()*6.28,d=Math.sqrt(rng())*1.7,s=sd(.2,.36);
   if(add('flower','grass',b.x+Math.cos(a)*d,b.z+Math.sin(a)*d,rng()*6.28,s,s*sd(1,1.8),s,rng()<.12?FLOWER_COLORS[4]:rng()<.65?c1:c2,.01,.35,s))made++;}
  return made;},grassSrc);
 // rock groups: 2-4 grey rocks, .25-.7 m
 layer('rock','grass',q('grass',.1),15,b=>{const n=2+Math.floor(rng()*3);let made=0;
  for(let i=0;i<n;i++){const a=rng()*6.28,d=i?sd(.5,1.3):0,s=(i?.6:1)*sd(.3,.72);if(add('rock','grass',b.x+Math.cos(a)*d,b.z+Math.sin(a)*d,rng()*6.28,s,s*.6,s*1.15,pick([STONE_COLORS[0],STONE_COLORS[1],STONE_COLORS[2],STONE_COLORS[0]]),s*.2,.45,s))made++;}
  return made;},grassSrc);
 // worn bare-earth patches: one or two overlapping flat discs, 1-2.3 m
 layer('bare','grass',q('grass',.08),17,b=>{let made=0;const n=1+(rng()<.45?1:0);
  for(let i=0;i<n;i++){const rx=sd(.5,1.15);if(add('bare','grass',b.x+i*sd(.6,1),b.z+(rng()-.5)*.8,rng()*6.28,rx,.07,rx*sd(.65,1),pick(SAND_COL.bare),.012,.3,rx))made++;}
  return made;},grassSrc);
 // leaf litter round trees (and a few loose patches): flat 0.5-1.1 m discs in autumn colours
 const trees=inp.trees??[];
 if(trees.length)layer('litter','grass',q('grass',.12),3,b=>{let made=0;const n=2+Math.floor(rng()*2);
  for(let i=0;i<n;i++){const rx=sd(.45,1.05);if(add('litter','grass',b.x+(rng()-.5)*1.6,b.z+(rng()-.5)*1.6,rng()*6.28,rx,.05,rx*sd(.6,1),pick(SAND_COL.litter),.014,.3,rx))made++;}
  return made;},()=>{const t=trees[Math.floor(rng()*trees.length)%trees.length],a=rng()*6.28,d=sd(1.6,3.8),x=t.x+Math.cos(a)*d,z=t.z+Math.sin(a)*d;return {x,z,w:1};});
 return out;
}
