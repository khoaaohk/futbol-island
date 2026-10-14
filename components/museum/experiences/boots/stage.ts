import * as k from '../anatomy/iso-kit';
import {anchorAt,type Mesh,type Pose,type V3} from './mesh';
import type {Boot,Part,PartId} from './boot';
/**
 * boots · the bench around the boot, as SVG strings for the one paint call (Oct 12 2026): the turntable (a heavy base on feet,
 * a platter with degree ticks that turn with the boot, a fixed pointer), the camera fit that never changes while the boot turns,
 * the leader-line labels, and two small meshes (a box, a disc) for the balance. Pure, so tests render it in Node.
 */
export const PLATTER=150;

/** Fit: every point the boot can reach at any turn (a cylinder round its axis, tall enough for the roll), at the current explode. */
export function fitBench(boot:Boot,off:(p:Part)=>V3,lift:number,W:number,H:number,{side=0,top=0,bottom=0,pad=18}:{side?:number;top?:number;bottom?:number;pad?:number}={}){
 let r=PLATTER,z0=-16,z1=0;
 for(const p of boot.parts){const b=p.box!,o=off(p);r=Math.max(r,b.r+Math.hypot(o[0],o[1]));z0=Math.min(z0,b.z0+o[2]+lift);z1=Math.max(z1,b.z1+o[2]+lift);}
 // the roll (sole view) swings the boot round its long axis
 const zc=boot.C[2]+lift;z0=Math.min(z0,zc-boot.Rr);z1=Math.max(z1,zc+boot.Rr*.92);
 const pts:k.Point3[]=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2;pts.push([Math.cos(a)*r,Math.sin(a)*r,z0],[Math.cos(a)*r,Math.sin(a)*r,z1]);}
 const P=k.fitProjection(pts,Math.max(60,W-side*2),Math.max(60,H-top-bottom),{pad});
 return {...P,origin:[P.origin[0]+side,P.origin[1]+top] as k.Flat};
}

/** The turntable: base (static), the platter and its ticks (they turn with θ), a pointer at the front. */
export function turntable(P:k.Projection,theta:number){
 const plan={x:-178,y:-178,w:356,d:356,r:22},out:string[]=[];
 out.push(`<path class="iso-halo" d="${k.slabOf(plan,-46,14,P).fill}"/>`);
 const feet=k.corners(plan,30).sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 for(const [x,y] of feet){out.push(k.solidSvg(k.cylinder(x,y,10,-46,3,P,28),{tone:'mid'}),k.solidSvg(k.cylinder(x,y,7.4,-43,7,P,28),{tone:'mid'}));}
 out.push(k.solidSvg(k.slabOf(plan,-36,14,P,8,1.6),{tone:'mid',inner:k.lineSvg(k.sideSeam(plan,-29,P),{tone:'faint'})}));
 out.push(k.lineSvg(k.planOutline(k.insetPlan(plan,7),-22,P),{tone:'lo'}));
 for(const [x,y] of k.corners(plan,14))out.push(k.lineSvg(k.ring(x,y,3,-22,P,16),{tone:'lo'}),k.dotsSvg([k.iso([x,y,-22],P)],{size:.7,tone:'hi'}));
 // a label plate and a ruler strip on the near edge
 const lp={x:96,y:132,w:58,d:24,r:2};out.push(k.solidSvg(k.slabOf(lp,-22,.8,P,4),{tone:'mid',inner:[.32,.52,.72].map((f,i)=>k.lineSvg(k.lineOnTop([lp.x+6,lp.y+lp.d*f],[lp.x+6+(lp.w-16)*[1,.7,.45][i],lp.y+lp.d*f],-21.2,P),{tone:'lo',free:true})).join('')}));
 const t=k.topTicks(-150,60,5,5,160,-21.4,[2.4,4.4],P);out.push(k.solidSvg(k.slabOf({x:-152,y:158,w:214,d:8,r:1},-22,.6,P,3),{tone:'lo',crease:'none',inner:k.lineSvg(t.minor,{tone:'lo'})+k.lineSvg(t.major,{tone:'mid'})}));
 // the platter: a bevelled disc on a bearing ring, a rubber mat on top, degree ticks on its rim
 out.push(k.solidSvg(k.cylinder(0,0,PLATTER*.46,-22,4,P,48),{tone:'mid'}));
 out.push(k.solidSvg(k.cylinder(0,0,PLATTER,-18,12,P,96,1.2),{tone:'mid',inner:k.lineSvg(k.knurl(0,0,PLATTER,-16.5,-8,120,P,.3),{tone:'faint'})}));
 const ticks=k.radialTicks(0,0,PLATTER-3,72,6,-6,[3,6.5],P,theta,Math.PI*2);
 out.push(k.lineSvg(ticks.minor,{tone:'lo'}),k.lineSvg(ticks.major,{tone:'mid'}));
 out.push(k.solidSvg(k.cylinder(0,0,PLATTER-14,-6,6,P,96,.6),{tone:'hi'}));
 out.push(k.lineSvg(k.ring(0,0,PLATTER-24,0,P,96),{tone:'faint'}),k.lineSvg(k.ring(0,0,PLATTER-56,0,P,72),{tone:'faint'}));
 // the zero mark on the platter (turns with it) and the fixed pointer on the base
 out.push(`<path class="iso-line" data-tone="hi" d="${k.lineOnTop([Math.cos(theta)*(PLATTER-14),Math.sin(theta)*(PLATTER-14)],[Math.cos(theta)*(PLATTER-1),Math.sin(theta)*(PLATTER-1)],-5.9,P)}" style="stroke:var(--accent);stroke-width:2"/>`);
 out.push(k.solidSvg(k.slabOf({x:PLATTER+4,y:-5,w:16,d:10,r:2},-22,6,P,3,.4),{tone:'mid'}));
 return out.join('');
}

export type Label={id:PartId;x:number;y:number;front:boolean;name:string;n:number};
/** Where each layer's anchor is on screen (at the pose and the part's explode offset). */
export function anchors(boot:Boot,ids:readonly PartId[],off:(p:Part)=>V3,P:k.Projection,pose:Pose,names:Record<string,{name:string}>):Label[]{
 return ids.map((id,i)=>{const p=boot.parts.find(q=>q.id===id)!;const a=anchorAt(p.anchor.p,p.anchor.n,off(p),P,pose);return {id,x:a.x,y:a.y,front:a.front,name:names[id].name,n:i+1};});
}
/**
 * Leader-line labels in two columns beside the model (wide cards), or numbered dots on the parts (narrow cards). The selected
 * layer is drawn in the accent. Lines run flat from the label, turn once and end on a dot on the part.
 */
export function labelsSvg(list:Label[],W:number,H:number,sel:PartId|null,mode:'side'|'dots',top=40,bottom=40,leftTop=0){
 const out:string[]=[];
 if(mode==='dots'){for(const l of list){const on=l.id===sel;out.push(`<g data-part="${l.id}" class="bt-dot"${on?' data-sel=""':''}${l.front?'':' opacity=".55"'}><circle cx="${r1(l.x)}" cy="${r1(l.y)}" r="10.5"/><text x="${r1(l.x)}" y="${r1(l.y+4)}" text-anchor="middle">${l.n}</text></g>`);}return out.join('');}
 const cx=list.reduce((a,l)=>a+l.x,0)/(list.length||1);
 for(const side of [-1,1]){
  const col=list.filter(l=>side<0?l.x<cx:l.x>=cx).sort((a,b)=>a.y-b.y),gap=30,ys:number[]=[];
  const t0=side<0?Math.max(top,leftTop):top;col.forEach((l,i)=>{let y=Math.max(t0+12,l.y);if(i&&y<ys[i-1]+gap)y=ys[i-1]+gap;ys.push(y);});
  // push back up if the column runs off the bottom
  for(let i=col.length-1;i>=0;i--){const lim=(i===col.length-1?H-bottom-12:ys[i+1]-gap);if(ys[i]>lim)ys[i]=lim;}
  col.forEach((l,i)=>{const on=l.id===sel,y=ys[i],tw=l.name.length*7.4+18,bx=side<0?16:W-16-tw,ex=side<0?bx+tw:bx,elbow=side<0?Math.min(l.x-14,ex+30):Math.max(l.x+14,ex-30);
   out.push(`<g data-part="${l.id}" class="bt-label"${on?' data-sel=""':''}${l.front?'':' data-back=""'}>`+
    `<path d="M${r1(ex)} ${r1(y)}L${r1(elbow)} ${r1(y)}L${r1(l.x)} ${r1(l.y)}" class="bt-leader"/><circle cx="${r1(l.x)}" cy="${r1(l.y)}" r="2.6" class="bt-tip"/>`+
    `<rect x="${r1(bx)}" y="${r1(y-12)}" width="${r1(tw)}" height="24" rx="12"/><text x="${r1(bx+tw/2)}" y="${r1(y+4.5)}" text-anchor="middle">${l.name}</text></g>`);});
 }
 return out.join('');
}
const r1=(n:number)=>Math.round(n*10)/10;

// ── Small meshes (the balance) ─────────────────────────────────────────────────────────────────────────────────────────
/** A box from its eight corners (bottom four then top four, counter-clockwise from above). */
export function boxMesh(part:string,mat:string,c:V3[]):Mesh{
 return {part,mat,verts:c,faces:[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]};
}
/** A disc (a pan, a puck) standing on z0, radius r, height h. */
export function discMesh(part:string,mat:string,cx:number,cy:number,r:number,z0:number,h:number,n=40):Mesh{
 const verts:V3[]=[],faces:number[][]=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;verts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,z0]);}
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2;verts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,z0+h]);}
 for(let i=0;i<n;i++){const j=(i+1)%n;faces.push([i,j,n+j,n+i]);}
 faces.push(Array.from({length:n},(_,i)=>n+i));faces.push(Array.from({length:n},(_,i)=>n-1-i));
 return {part,mat,verts,faces};
}
