import {cameraOf,type Projection} from '../anatomy/iso-kit';
import {mix} from '../anatomy/bench';
/**
 * boots · the turning Paper renderer (Oct 12 2026; user: "they can spin the boots around and see them", "can we see through the
 * layers of each boot"). The anatomy kit draws prisms that stand on the floor; a boot is curved and must turn a full 360° and
 * roll over to show its sole, so it is built here as small faceted meshes (boot.ts) and re-projected through the kit's own camera
 * (iso-kit `cameraOf`, azimuth 45°, elevation 30°) at the current angle. Pure: tests/museum-exp-boots.cjs renders it in Node.
 *
 *  - Paper look: every face is a solid fill in its material, shaded by facing (lit from the top left, as the kit), with no seams
 *    between faces (each face is stroked in its own fill). Hairlines only where the kit would draw them: the silhouette and open
 *    rims in `hi`, creases between faces that meet at an angle in `lo`.
 *  - Painter's order: faces (and the feature lines and dots on them) sorted back to front by depth, so a part in front hides the
 *    part behind; translucent "see-through" skins are sorted with everything else, so the inside reads correctly through them.
 *  - Nothing here loops: Experience.tsx calls `paint` only when the angle, the explode or the view changes.
 */
export type V3=[number,number,number];
export type Mat={name:string;color:string};
export type Mesh={part:string;mat:string;inner?:string;verts:V3[];faces:number[][];two?:boolean;bias?:number;edges?:Edge[];normals?:V3[];soft?:boolean;xray?:boolean;layer?:number;shadeN?:V3[];covered?:Set<number>;
 /** The footbed (drawn over everything under the foot, under everything above it, while the boot is whole). */
 floor?:boolean;
 /** Faces that lie under the footbed (studs, the plate below the foot, the welt): `true` for the whole mesh. */
 low?:Set<number>|true;
 /** A wall round the foot (the upper, the shaft, the sock collar): its back faces are the inside, seen only through the opening. */
 shell?:boolean;
 /** Two-sided only when apart or seen through (a cap whose inside is hidden by the upper while the boot is whole). */
 twoApart?:boolean};
/** A feature line on a surface (stitching, laces, fins, lamination lines) or a row of dots (eyelets, nail heads, grip dots). */
export type Mark={part:string;pts:V3[];n?:V3|null;w:number;color:string;dots?:boolean;r?:number;bias?:number;xray?:boolean;low?:boolean;
 /** The material the mark is stitched into: the thread is toned toward it, so a seam reads as stitching, not as a crack. */
 on?:string};
export type Edge={a:number;b:number;f:number;g:number;crease:boolean};

const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const len=(a:V3)=>Math.hypot(a[0],a[1],a[2])||1;
const unit=(a:V3):V3=>{const l=len(a);return [a[0]/l,a[1]/l,a[2]/l];};
/** Newell's normal of a polygon (robust for quads that are not quite flat and for degenerate corners). */
export function normalOf(p:V3[]):V3{let x=0,y=0,z=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1]);}return unit([x,y,z]);}

/** Weld coincident vertices (the heel seam, the toe tip, the closed vamp's centre line) and drop faces that collapse. */
export function weld(m:Mesh,eps=.05):Mesh{
 const key=(p:V3)=>p.map(v=>Math.round(v/eps)).join(','),map=new Map<string,number>(),verts:V3[]=[],re:number[]=[];
 m.verts.forEach(p=>{const k=key(p);let i=map.get(k);if(i==null){i=verts.length;verts.push(p);map.set(k,i);}re.push(i);});
 const faces:number[][]=[];
 for(const f of m.faces){const g:number[]=[];for(const i of f){const j=re[i];if(g[g.length-1]!==j)g.push(j);}if(g.length>1&&g[0]===g[g.length-1])g.pop();if(g.length>=3)faces.push(g);}
 return {...m,verts,faces};
}
/** Adjacency, once per mesh: each edge with its one or two faces, and whether the faces meet at a crease (> 38°). */
export function prepare(m:Mesh):Mesh{
 if(m.edges)return m;
 const normals=m.faces.map(f=>normalOf(f.map(i=>m.verts[i])));
 const map=new Map<string,Edge>();
 m.faces.forEach((f,fi)=>f.forEach((a,k)=>{const b=f[(k+1)%f.length],key=a<b?a+'_'+b:b+'_'+a,e=map.get(key);if(e){if(e.g<0)e.g=fi;}else map.set(key,{a,b,f:fi,g:-1,crease:false});}));
 const edges=[...map.values()];
 for(const e of edges)if(e.g>=0)e.crease=!m.soft&&dot(normals[e.f],normals[e.g])<Math.cos(38*Math.PI/180);
 // curved (soft) meshes shade from vertex-averaged normals, so neighbouring facets differ less (no patchwork)
 let shadeN=normals;
 if(m.soft){const vn:V3[]=m.verts.map(()=>[0,0,0]);m.faces.forEach((f,fi)=>{for(const i of f){vn[i][0]+=normals[fi][0];vn[i][1]+=normals[fi][1];vn[i][2]+=normals[fi][2];}});
  shadeN=m.faces.map((f,fi)=>{const a:V3=[0,0,0];for(const i of f){const v=unit(vn[i]);a[0]+=v[0];a[1]+=v[1];a[2]+=v[2];}const u=unit(a);return dot(u,normals[fi])>0?u:normals[fi];});}
 return {...m,edges,normals,shadeN};
}

// ── The camera ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The kit's camera as vectors: toward the viewer, screen right, screen up, and the Paper light (top left, a little in front). */
export function cam(P:Projection){
 const {sinA,cosA,sinE,cosE,k}=cameraOf(P);
 const V:V3=[cosA*cosE,sinA*cosE,sinE],R:V3=[sinA,-cosA,0],U:V3=[-cosA*sinE,-sinA*sinE,cosE];
 const L=unit([-.5*R[0]+.78*U[0]+.42*V[0],-.5*R[1]+.78*U[1]+.42*V[1],-.5*R[2]+.78*U[2]+.42*V[2]]);
 return {V,L,sinA,cosA,sinE,cosE,k,ox:P.origin[0],oy:P.origin[1]};
}
export type Cam=ReturnType<typeof cam>;
export const toScreen=(p:V3,c:Cam):[number,number]=>[c.ox+(p[0]*c.sinA-p[1]*c.cosA)*c.k,c.oy+((p[0]*c.cosA+p[1]*c.sinA)*c.sinE-p[2]*c.cosE)*c.k];
export const depthAt=(p:V3,c:Cam)=>(p[0]*c.cosA+p[1]*c.sinA)*c.cosE+p[2]*c.sinE;

/** The pose: turn θ about the vertical axis through C, after a roll φ about the boot's long axis (φ = 180° shows the sole). */
export type Pose={theta:number;phi:number;C:V3;lift:number;T?:V3;s?:number};
export function poseFn({theta,phi,C,lift,T=[0,0,0],s=1}:Pose){
 const ct=Math.cos(theta),st=Math.sin(theta),cp=Math.cos(phi),sp=Math.sin(phi);
 const point=(p:V3):V3=>{const x=(p[0]-C[0])*s,y=(p[1]-C[1])*s,z=(p[2]-C[2])*s;const y1=y*cp-z*sp,z1=y*sp+z*cp;return [C[0]+x*ct-y1*st+T[0],C[1]+x*st+y1*ct+T[1],C[2]*s+z1+lift+T[2]];};
 const dir=(n:V3):V3=>{const y1=n[1]*cp-n[2]*sp,z1=n[1]*sp+n[2]*cp;return [n[0]*ct-y1*st,n[0]*st+y1*ct,z1];};
 return {point,dir};
}

// ── Shading ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A material colour lit by facing: Paper's own ramp for paper-white parts (#d3d3ce → #f7f7f3), a soft ramp for colours. */
export function shade(color:string,lambert:number){
 const t=Math.max(0,Math.min(1,(lambert+.35)/1.25));
 if(color==='paper')return mix('#d3d3ce','#f9f9f5',t);
 return mix(mix(color,'#000000',.24),mix(color,'#ffffff',.12),t);
}

export type Look={
 /** Part → offset (already scaled by its explode amount). */
 offset?:(part:string)=>V3;
 /** Parts not drawn at all (inner parts while the boot is whole). */
 hidden?:(part:string)=>boolean;
 /** 0 solid → 1 fully see-through, for the parts that are skins. */
 xray?:number;skins?:ReadonlySet<string>;
 /** The tapped part (drawn with the accent outline; the rest dimmed a little). */
 sel?:string|null;accent?:string;
 mats:Record<string,Mat>;
 /** Parts sitting in place: their faces hidden under the next layer (`covered`) are skipped. */
 assembled?:(part:string)=>boolean;
};
/**
 * A drawn item: its depth and, while the boot is whole and solid, a pass (Oct 13 2026, user: "can see through the boots").
 * Sorting by depth alone let big faces of the upper and small faces of the studs, the floor and the caps swap places, so the
 * studs and the turntable showed through the collar, the lining-coloured inner walls poked through the outside in slivers, and the
 * toe-cap's edge stepped. Seen from above (the opening towards the viewer), the passes are: 0 everything under the footbed
 * (studs, the plate below the foot, the welt), 1 the footbed and then the inner walls (the back faces of the two-sided skins), 2 the
 * outside (by depth). Seen from below, the inside goes first and everything else is sorted by depth as before. Apart or seen
 * through, everything is one pass by depth, as before.
 */
type Item={d:number;s:string;c?:number};
const f1=(n:number)=>Math.round(n*10)/10;

/**
 * Draw the meshes and marks at a pose into a list of SVG strings, back to front. Returns the joined markup and the face count.
 * `parts` filters which parts are drawn; every face carries data-part so a tap can find its layer.
 */
export function draw(meshes:readonly Mesh[],marks:readonly Mark[],P:Projection,pose:Pose,look:Look,extra:Item[]=[]):{svg:string;faces:number}{
 const c=cam(P),T=poseFn(pose),items:Item[]=[...extra];let faces=0;
 const xr=look.xray??0,dim=1,up=Math.sign(dot(T.dir([0,0,1]),c.V))||1;
 for(const m0 of meshes){
  if(look.hidden?.(m0.part))continue;if(m0.xray&&xr<.35)continue;
  const m=prepare(m0),off=look.offset?.(m.part)??[0,0,0];
  const W=m.verts.map(p=>T.point([p[0]+off[0],p[1]+off[1],p[2]+off[2]]));
  const S=W.map(p=>toScreen(p,c)),D=W.map(p=>depthAt(p,c));
  const skin=!!look.skins?.has(m.part)&&xr>0,sel=look.sel===m.part,alpha=skin?1-xr*.74:1,op=sel?1:look.sel?dim:1;
  const nW=m.normals!.map(n=>T.dir(n)),facing=nW.map(n=>dot(n,c.V)),sW=m.shadeN!.map(n=>T.dir(n));
  const whole=xr<.05&&!!look.assembled?.(m.part),cov=m.covered&&whole?m.covered:null;
  const drawn=m.faces.map((_,i)=>!cov?.has(i)&&(facing[i]>1e-4||((!!m.two||(!!m.twoApart&&!whole))&&!skin)));
  const fd=m.faces.map(f=>{let s=0;for(const i of f)s+=D[i];return s/f.length+(m.bias??0)+(m.layer??0)*1.6*up;});
  const lines:string[][]=m.faces.map(()=>[]),soft:string[][]=m.faces.map(()=>[]);
  for(const e of m.edges!){
   const seg=`M${f1(S[e.a][0])} ${f1(S[e.a][1])}L${f1(S[e.b][0])} ${f1(S[e.b][1])}`;
   if(e.g<0){if(drawn[e.f])lines[e.f].push(seg);continue;}
   const df=drawn[e.f],dg=drawn[e.g];if(!df&&!dg)continue;
   const ff=facing[e.f]>0,fg=facing[e.g]>0,on=df&&dg?(fd[e.f]>=fd[e.g]?e.f:e.g):df?e.f:e.g;
   if(ff!==fg)lines[on].push(seg);else if(e.crease)soft[on].push(seg);
  }
  const base=look.mats[m.mat]?.color??'paper',inner=look.mats[m.inner??m.mat]?.color??base;
  m.faces.forEach((f,i)=>{if(!drawn[i])return;faces++;
   const front=facing[i]>0,n=front?sW[i]:[-sW[i][0],-sW[i][1],-sW[i][2]] as V3,col=front?shade(base,dot(n,c.L)):mix(shade(inner,dot(n,c.L)),'#000000',.1);
   const pass=!whole?2:m.floor?(up>0?1:0):(m.low===true||m.low?.has(i))?(up>0?0:2):front||!m.shell?2:up>0?1.5:1;
   const d='M'+f.map(j=>f1(S[j][0])+' '+f1(S[j][1])).join('L')+'Z';
   let s=`<path data-part="${m.part}" d="${d}" fill="${col}" stroke="${col}" stroke-width=".6" stroke-linejoin="round"${alpha<1?` fill-opacity="${f1(alpha*100)/100}" stroke-opacity="${f1(alpha*60)/100}"`:''}${op<1?` opacity="${op}"`:''}/>`;
   if(lines[i].length)s+=`<path d="${lines[i].join('')}" class="bt-edge"${sel?' data-sel=""':''}${skin?` opacity="${f1((.25+.75*alpha)*100)/100}"`:op<1?` opacity="${op}"`:''}/>`;
   if(soft[i].length&&!skin)s+=`<path d="${soft[i].join('')}" class="bt-crease"${op<1?` opacity="${op}"`:''}/>`;
   items.push({d:fd[i],s,c:pass});
  });
 }
 for(const k of marks){
  if(look.hidden?.(k.part))continue;if(k.xray&&xr<.35)continue;
  const off=look.offset?.(k.part)??[0,0,0],W=k.pts.map(p=>T.point([p[0]+off[0],p[1]+off[1],p[2]+off[2]]));
  if(k.n){const n=T.dir(k.n);if(dot(n,c.V)<.04)continue;}
  // seams sort in short runs (two segments, three dots) at their own depth: a long seam sorted as one item showed in broken
  // pieces, like cracks
  const S=W.map(p=>toScreen(p,c)),D=W.map(p=>depthAt(p,c)+(k.bias??.6));
  const skin=!!look.skins?.has(k.part)&&xr>0,op=look.sel&&look.sel!==k.part?dim:1,a=(skin?1-xr*.8:1)*op,w=f1(k.w*c.k*10)/10;
  const cl=xr<.05&&look.assembled?.(k.part)&&k.low&&up>0?0:2,mat=k.on?look.mats[k.on]?.color:null;
  const color=mat&&mat!=='paper'&&k.color.startsWith('#')?mix(k.color.slice(0,7),mat,.5):k.color,o=a<1?` opacity="${f1(a*100)/100}"`:'';
  if(k.dots){const r=f1(Math.max(.5,(k.r??.6)*c.k));for(let i=0;i<S.length;i+=3){const j=Math.min(S.length,i+3);let dd=0;for(let q=i;q<j;q++)dd+=D[q];
   items.push({d:dd/(j-i),c:cl,s:`<g fill="${color}"${o}>${S.slice(i,j).map(p=>`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}"/>`).join('')}</g>`});}continue;}
  for(let i=0;i<S.length-1;i+=2){const j=Math.min(S.length-1,i+2);let dd=0;for(let q=i;q<=j;q++)dd+=D[q];
   items.push({d:dd/(j-i+1),c:cl,s:`<path data-part="${k.part}" d="M${S.slice(i,j+1).map(p=>f1(p[0])+' '+f1(p[1])).join('L')}" fill="none" stroke="${color}" stroke-width="${Math.max(.6,w)}" stroke-linecap="round" stroke-linejoin="round"${o}/>`});}
 }
 for(const it of items)if(it.c!=null&&it.c!==2)it.d+=(it.c-2)*1e5;// the passes, as one sort key
 items.sort((a,b)=>a.d-b.d);
 return {svg:items.map(i=>i.s).join(''),faces};
}

/** Where a part's anchor lands on screen at a pose (for the leader-line labels), and whether it faces the viewer. */
export function anchorAt(p:V3,n:V3|null,off:V3,P:Projection,pose:Pose){
 const c=cam(P),T=poseFn(pose),w=T.point([p[0]+off[0],p[1]+off[1],p[2]+off[2]]),[x,y]=toScreen(w,c);
 return {x,y,d:depthAt(w,c),front:n?dot(T.dir(n),c.V)>-.05:true};
}
/** Screen bounds of points at a pose (fit and tests). */
export function screenBounds(pts:V3[],P:Projection,pose:Pose){
 const c=cam(P),T=poseFn(pose);let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const p of pts){const [x,y]=toScreen(T.point(p),c);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 return {x0,x1,y0,y1};
}
export {sub,dot,unit};
