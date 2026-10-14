/**
 * Football shop · Ball studio panel ids in JavaScript (Oct 12 2026). A line-for-line mirror of `layoutAt()` in
 * lib/shop/ballShader.ts, so the Draw step's "fill a panel" tool knows which panel a tap landed on (the shader then paints
 * that panel from the uFill uniform array, indexed by the same id). Pure maths, no DOM or three.js, so tests/shop-ball.cjs
 * checks it in Node, and the stage's debugPanelIds() cross-checks it against the GPU in the browser.
 *
 * Keep the constants here in step with the shader: the test reads both files and compares them.
 */
import {POLY_SETS} from '../museum/wcBalls/glsl';
import type {BallLayout} from './ball';

export type V3=readonly [number,number,number];
export type PanelHit={id:number;grp:number};
/** Panel count per layout (= the number of distinct ids, 0..n-1). */
export const PANEL_COUNT:Record<BallLayout,number>={classic32:32,panel26:26,panel14:14,propeller6:6,panel8:8,leather18:18};
export const MAX_PANELS=32;
/** Shader constants mirrored here (tests/shop-ball.cjs checks they match ballShader.ts). */
export const PROPELLER={A:.2,K:5.4414};
export const WAVE8={amp:.15,k1:3.3,k2:2.1,ph:[.5,1.3,2.2] as const};

const norm=(v:number[])=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
const trunc=POLY_SETS.find(p=>p.name==='truncIco')!;
const AXES=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const EDGES=[[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],[1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1],[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1]].map(norm);
const CORNERS=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].map(norm);
const RHOMBI_TRI=(1+Math.SQRT2)/((3+Math.SQRT2)/Math.sqrt(3));
const TOCT_HEX=2/Math.sqrt(3);
/** Weighted face normals, rounded like the shader's toFixed(6) constants. */
const weighted=(faces:number[][],w:number[])=>faces.map((v,i)=>v.map(x=>Number((x*w[i]).toFixed(6))));
const TICO=weighted(trunc.faces,trunc.weights??trunc.faces.map(()=>1));
const RHOMBI=weighted([...AXES,...EDGES,...CORNERS],[...AXES.map(()=>1),...EDGES.map(()=>1),...CORNERS.map(()=>RHOMBI_TRI)]);
const TOCT=weighted([...AXES,...CORNERS],[...AXES.map(()=>1),...CORNERS.map(()=>TOCT_HEX)]);
/** The shader's `Cell` id: the face with the biggest dot product (first one wins a tie, like `if(d>s)`). */
function cell(F:number[][],x:number,y:number,z:number){let b=0,s=-9;for(let i=0;i<F.length;i++){const d=x*F[i][0]+y*F[i][1]+z*F[i][2];if(d>s){s=d;b=i;}}return b;}
const sgn=(v:number)=>v>=0?1:-1;

/** The panel (id, colour group) under the unit direction p in ball space, exactly as the shader computes it. */
export function panelAt(layout:BallLayout,p:V3):PanelHit{
 const l=Math.hypot(p[0],p[1],p[2])||1,x=p[0]/l,y=p[1]/l,z=p[2]/l;
 switch(layout){
  case 'classic32':{const id=cell(TICO,x,y,z);return {id,grp:id<12?0:1};}
  case 'panel26':{const id=cell(RHOMBI,x,y,z);return {id,grp:id<6?0:(id<18?1:2)};}
  case 'panel14':{const id=cell(TOCT,x,y,z);return {id,grp:id<6?0:1};}
  case 'propeller6':{const ax=Math.abs(x),ay=Math.abs(y),az=Math.abs(z),sx=sgn(x),sy=sgn(y),sz=sgn(z),{A,K}=PROPELLER;
   const mxy=ax-ay-A*Math.sin(K*z)*sx*sy,myz=ay-az-A*Math.sin(K*x)*sy*sz,mzx=az-ax-A*Math.sin(K*y)*sz*sx;
   let w:number;if(mxy>0&&mzx<0)w=0;else if(myz>0&&mxy<0)w=1;else if(mzx>0&&myz<0)w=2;else w=ax>=ay&&ax>=az?0:(ay>=az?1:2);
   const sw=w===0?sx:(w===1?sy:sz);return {id:w*2+(sw>0?0:1),grp:w};}
  case 'panel8':{const {amp,k1,k2,ph}=WAVE8;
   const qx=x+amp*Math.sin(k1*y+k2*z+ph[0]),qy=y+amp*Math.sin(k1*z+k2*x+ph[1]),qz=z+amp*Math.sin(k1*x+k2*y+ph[2]);
   const gx=qx>=0?1:0,gy=qy>=0?1:0,gz=qz>=0?1:0;return {id:gx+gy*2+gz*4,grp:(gx+gy+gz)%2};}
  case 'leather18':{const ax=Math.abs(x),ay=Math.abs(y),az=Math.abs(z);
   const f=ax>=ay&&ax>=az?(x>0?0:1):(ay>=az?(y>0?2:3):(z>0?4:5));
   const s=f<2?y/ax:(f<4?z/ay:x/az);const w=2/3,k=Math.min(2,Math.max(0,Math.floor((s+1)/w)));
   return {id:f*3+k,grp:k===1?1:0};}
 }
 return {id:0,grp:0};
}
