import * as T from 'three';
import {SoftBoxGeometry,puffBall} from '../graphics/softBox';

/**
 * Thatched hut kit (Nov 27 2026, owner shot 170 on a Coral Cay hut: "add some texture to this. feels very flat"). One look for every
 * round hut (Coral Cay huts and hut homes, Summit Isle huts): a clay drum with mottling, a darker damp base band and a shadow under the
 * eave (smooth 32-side normals, no facets); a roof of three overlapping thatch skirts on the SAME cone envelope as before (roof landing
 * and the balls on it are unchanged), each with a puffy rolled rim that droops in scallops with ragged ends, straw streaks and a shaded
 * tuck baked into per-vertex tint, and a bound top knot; a proper door (rounded-top frame, four planks, a handle, set in a dark inset);
 * one small round window. Everything is plain geometry + a linear rgb tint per vertex (`tint`), so it rides the existing paint batches
 * (Cay: userData.vertexTint) or Summit's baked pieces: 0 draws, 0 textures. `low` (Battery saver / heat tier >= 2 at build): 16 sides,
 * two skirts.
 */
export type HutPart={geo:T.BufferGeometry;color:string;tint?:Float32Array};
const hash=(a:number,b=0)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);};

function grid(cols:number,rows:{r:number;y:number}[],at:(c:number,k:number)=>{r:number;y:number},tintAt:(c:number,k:number)=>[number,number,number]){
 const pos:number[]=[],tint:number[]=[],idx:number[]=[];
 for(let k=0;k<rows.length;k++)for(let c=0;c<cols;c++){const a=c/cols*Math.PI*2,p=at(c,k);pos.push(Math.sin(a)*p.r,p.y,Math.cos(a)*p.r);tint.push(...tintAt(c,k));}
 for(let k=0;k<rows.length-1;k++)for(let c=0;c<cols;c++){const c1=(c+1)%cols,a=k*cols+c,b=k*cols+c1,d=(k+1)*cols+c,e=(k+1)*cols+c1;idx.push(a,b,e,a,e,d);}
 return {pos,tint,idx};
}
function finish(pos:number[],idx:number[]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(pos.length/3*2),2));return g;}
/** Outward winding check for a lathe built with `grid` (rows going up, columns turning from +z toward +x). */
function outward(g:{pos:number[];idx:number[]}){const i=g.idx,p=g.pos;for(let t=0;t<i.length;t+=3){const a=i[t]*3,b=i[t+1]*3,c=i[t+2]*3;
 const e1=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],e2=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]],n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
 if(n[0]*p[a]+n[2]*p[a+2]<0){const s=i[t+1];i[t+1]=i[t+2];i[t+2]=s;}}}

/** The drum: radius R, height h (from y 0), clay mottling, a damp base band, the eave's shadow at the top. */
export function hutWall(R:number,h:number,seed:number,low=false):{geo:T.BufferGeometry;tint:Float32Array}{
 const n=low?16:32,ys=[0,.32,.42,h*.45,h-.32,h];
 const g=grid(n,ys.map(y=>({r:R,y})),(c,k)=>({r:R,y:ys[k]}),(c,k)=>{const y=ys[k],a=c/n*6.283,m=.93+.07*Math.sin(a*3+seed)+.05*Math.sin(a*7+y*2.3+seed*2)+.04*(hash(c+seed,k)-.5);
  const f=y<.35?.66:y<.45?.86:y>h-.05?.7:y>h-.35?.9:1;return [m*f*1.02,m*f,m*f*.95];});
 outward(g);return {geo:finish(g.pos,g.idx),tint:new Float32Array(g.tint)};
}

/** Thatch on the cone envelope (base radius Rb at y 0, apex at y H): overlapping skirts with puffy scalloped rims and a top knot. */
export function thatchRoof(Rb:number,H:number,seed:number,low=false):{geo:T.BufferGeometry;tint:Float32Array}{
 const n=low?16:30,cone=(t:number)=>Rb*(1-t),bands=low?[[0,.5],[.42,.93]]:[[0,.42],[.32,.7],[.6,.93]],pos:number[]=[],tint:number[]=[],idx:number[]=[];
 const add=(g:{pos:number[];tint:number[];idx:number[]})=>{outward(g);const b=pos.length/3;pos.push(...g.pos);tint.push(...g.tint);for(const i of g.idx)idx.push(b+i);};
 bands.forEach(([t0,t1],L)=>{
  const sc=L===0?n/2:n/3;// scallops round the rim
  // rows: tuck (rolled under), rim lip, shoulder (the puff), top (under the next skirt)
  const rows=[0,1,2,3];
  add(grid(n,rows.map(()=>({r:0,y:0})),(c,k)=>{const a=c/n*6.283,rag=(hash(c*1.7+seed,L)-.5),droop=(.5+.5*Math.cos(a*sc))*.13*(1-L*.25)+rag*.05;
   const t=k===0?t0+.035:k===1?t0:k===2?(t0*.6+t1*.4):t1,th=(L===0?.17:.13)*(1-t*.3);// skirt thickness: the rim's roll
   if(k===0)return {r:cone(t0)-th*.55,y:t0*H-droop+th*.5};
   if(k===1)return {r:cone(t0)+th*.35+rag*.08,y:t0*H-droop-th*.15};
   if(k===2)return {r:cone(t)+th*.85,y:t*H+th*.35};
   return {r:cone(t)+.02,y:t*H+.04};},
  (c,k)=>{const s=hash(c*3.1+seed,L*7),v=s<.2?.64:.78+.42*s/* inflate pass 2: straw streaks that read (were +-15%) */,f=k===0?.55:k===1?.92+.12*hash(c,L+3):k===2?1.06:.8;return [v*f*1.03,v*f*(.96+.06*s),v*f*(.84+.14*s)];}));
 });
 // the top knot: a bound bundle of straw over the apex
 const kn=low?8:12,prof:[number,number][]=[[.3,H*.9],[.36,H*.95],[.24,H+.05],[.16,H+.12],[.2,H+.26],[.08,H+.38],[.01,H+.42]];
 add(grid(kn,prof.map(([r,y])=>({r,y})),(c,k)=>({r:prof[k][0]*(1+.08*(hash(c+seed,k)-.5)),y:prof[k][1]}),(c,k)=>{const v=k===3?.62:k===2?.85:1.02;return [v,v*.95,v*.82];}));
 return {geo:finish(pos,idx),tint:new Float32Array(tint)};
}

/** Door set (local: centred on x 0, foot at y 0, face toward +z at z 0): dark inset, rounded-top frame, four planks, a handle. */
export function hutDoor(w=1.05,h=1.9,low=false):HutPart[]{
 const r=w/2,arch=(hw:number,hh:number)=>{const s=new T.Shape();s.moveTo(-hw,0);s.lineTo(-hw,hh-hw);s.absarc(0,hh-hw,hw,Math.PI,0,true);s.lineTo(hw,0);s.lineTo(-hw,0);return s;};
 const parts:HutPart[]=[];
 const inset=new T.ShapeGeometry(arch(r,h),low?6:10);inset.translate(0,0,-.02);parts.push({geo:inset,color:'#2a2622'});
 const ring=arch(r+.13,h+.11);ring.holes.push(new T.Path(arch(r,h).getPoints(low?6:10).reverse()));
 const frame=new T.ExtrudeGeometry(ring,{depth:.1,bevelEnabled:!low,bevelSize:.035,bevelThickness:.035,bevelSegments:1,curveSegments:low?6:10});frame.translate(0,0,-.06);parts.push({geo:frame,color:'#8a6a48'});
 const pw=w/4;for(let k=0;k<4;k++){const cx=-r+pw*(k+.5),top=h-r+Math.sqrt(Math.max(0,r*r-cx*cx))-.04,g=new SoftBoxGeometry(pw-.035,top,.06,{seg:0,puff:1});g.translate(cx,top/2,-.005);
  parts.push({geo:g,color:k%2?'#7d5a3c':'#8c6644'});}
 const handle=puffBall(.055);handle.translate(r*.55,h*.5,.06);parts.push({geo:handle,color:'#d9b25a'});
 return parts;
}
/** A small round window (local: centre at (0, y), face toward +z): a dark pane in a fat wooden ring. */
export function hutWindow(y:number,rr=.3):HutPart[]{
 const pane=new T.CircleGeometry(rr,14);pane.translate(0,y,-.01);
 const ring=new T.TorusGeometry(rr,.065,6,16);ring.translate(0,y,0);
 return [{geo:pane,color:'#2f3d3c'},{geo:ring,color:'#8a6a48'}];
}
/** Places a door / window part on the drum: turned to face direction `yaw` (atan2(dx, dz)), `out` m from the centre. */
export function onDrum(parts:HutPart[],yaw:number,out:number,y0=0){for(const p of parts){p.geo.translate(0,y0,out);p.geo.rotateY(yaw);}return parts;}
