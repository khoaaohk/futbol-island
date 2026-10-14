'use client';
import {memo,useMemo} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots} from '../anatomy/draw';
import {Base,LabelPlate,Tint,at,boxPts,depth,kOf,mix,onTop,post,pt,ringTop,seg,slab,type FPlan,type Frame} from '../anatomy/bench';
import {draw,type Mesh,type V3} from './mesh';
import {buildBoot,type Boot,type BootSpec} from './boot';
import {boxMesh,discMesh} from './stage';
import {MATS,SURFACES,type Surface} from './facts';
/**
 * boots · the two bench machines that are not the turntable (Oct 12 2026), in the anatomy Paper style, plus the small material
 * swatches and the shelf thumbnails. Static parts are kit solids (bench.tsx); the boots are the turning renderer's meshes drawn
 * in the same camera, so a boot stands on the test tray or in a balance pan like any other part.
 */
const EDGE_CSS='.bt-edge{fill:none;stroke:#3a3a3c;stroke-width:.8;stroke-linecap:round;stroke-linejoin:round}.bt-edge[data-sel]{stroke:var(--accent);stroke-width:1.2}.bt-crease{fill:none;stroke:#98989a;stroke-width:.6;stroke-linecap:round}';
export const BOOT_CSS=EDGE_CSS;
const skinsOf=(b:Boot)=>new Set(b.parts.filter(p=>p.skin).map(p=>p.id));
const allMeshes=(b:Boot)=>b.parts.flatMap(p=>p.meshes),allMarks=(b:Boot)=>b.parts.flatMap(p=>p.marks);
export const hideInner=(b:Boot)=>{const s=new Set(b.parts.filter(p=>p.inner).map(p=>p.id as string));return (id:string)=>s.has(id);};

// ── The grip tester ────────────────────────────────────────────────────────────────────────────────────────────────────
export const RIG={base:{a:-236,b:-124,w:584,d:248,r:14} as FPlan,tray:{a:-206,b:-96,w:452,d:192,r:6} as FPlan,bootA:-36,postA:300,surfZ:8};
export const rigPoints=():[number,number,number][]=>[...boxPts(RIG.base,-20,0),[RIG.postA,0,96],[-200,0,150]];
/** The tray, the surface and its texture: mud puddles, wet blades with drops, dry blades, plastic grass with crumb, hall planks. */
export const GripStatic=memo(function GripStatic({F,P,surface}:{F:Frame;P:k.Projection;surface:Surface}){
 const T=RIG.tray,S:FPlan={a:T.a+7,b:T.b+7,w:T.w-14,d:T.d-14,r:3},z=RIG.surfZ,col=SURFACES[surface].color,tex:React.ReactNode[]=[];
 const rnd=(i:number)=>{const x=Math.sin(i*127.1+surface.length*31.7)*43758.5453;return x-Math.floor(x);};
 if(surface==='mud'){for(let i=0;i<9;i++){const a=S.a+20+rnd(i)*(S.w-40),b=S.b+18+rnd(i+40)*(S.d-36),r=10+rnd(i+80)*22;tex.push(<path key={i} d={onTop(F,k.circleRing(0,0,1,28).map(([x,y])=>[a+x*r*1.5,b+y*r] as [number,number]),z+.2,P,true)} fill={mix(col,'#000000',.28)} opacity={.55}/>);
  if(i%3===0)tex.push(<path key={'w'+i} d={onTop(F,k.circleRing(0,0,1,20).map(([x,y])=>[a+x*r*.7,b+y*r*.4] as [number,number]),z+.3,P,true)} fill="#9db3c9" opacity={.45}/>);}}
 if(surface==='wet'||surface==='dry'){const blades:string[]=[],drops:k.Flat[]=[];for(let i=0;i<260;i++){const a=S.a+6+rnd(i)*(S.w-12),b=S.b+6+rnd(i+300)*(S.d-12),h=3+rnd(i+600)*4;blades.push(seg(F,a,b,z,a+(rnd(i+900)-.5)*3,b+(rnd(i+1200)-.5)*3,z+h,P));if(surface==='wet'&&i%5===0)drops.push(pt(F,a,b,z+h,P));}
  tex.push(<path key="bl" d={blades.join('')} stroke={mix(col,'#000000',surface==='wet'?.35:.3)} strokeWidth={.9} fill="none" strokeLinecap="round"/>);if(drops.length)tex.push(<Dots key="dr" points={drops} size={1.3} tone="hi"/>);
  if(surface==='wet')tex.push(<g key="dc" fill="#7aa2d6">{drops.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={1.3}/>)}</g>);}
 if(surface==='ag'){const rows:string[]=[];for(let b=S.b+8;b<S.b+S.d-4;b+=7)rows.push(onTop(F,[[S.a+4,b],[S.a+S.w-4,b]],z+.2,P));tex.push(<path key="r" d={rows.join('')} stroke={mix(col,'#ffffff',.35)} strokeWidth={.8} fill="none"/>);
  const crumb:k.Flat[]=[];for(let i=0;i<180;i++)crumb.push(pt(F,S.a+6+rnd(i)*(S.w-12),S.b+6+rnd(i+300)*(S.d-12),z+.3,P));tex.push(<g key="c" fill="#1d1d1b" opacity={.55}>{crumb.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={.9}/>)}</g>);
  tex.push(<path key="ln" d={onTop(F,[[S.a+S.w*.62,S.b+4],[S.a+S.w*.62,S.b+S.d-4]],z+.3,P)} stroke="#f7f7f3" strokeWidth={3} fill="none"/>);}
 if(surface==='indoor'){const pl:string[]=[];for(let b=S.b+22;b<S.b+S.d;b+=22)pl.push(onTop(F,[[S.a+2,b],[S.a+S.w-2,b]],z+.2,P));for(let i=0;i<14;i++){const b=S.b+22*Math.floor(rnd(i)*8),a=S.a+20+rnd(i+50)*(S.w-40);pl.push(onTop(F,[[a,b],[a,b+22]],z+.2,P));}
  tex.push(<path key="p" d={pl.join('')} stroke={mix(col,'#000000',.3)} strokeWidth={.7} fill="none"/>);tex.push(<path key="cl" d={onTop(F,[[S.a+S.w*.62,S.b+4],[S.a+S.w*.62,S.b+S.d-4]],z+.3,P)} stroke="#c94a3a" strokeWidth={3} fill="none"/>);}
 const pz=58;
 return <g data-grip-rig="" data-surface={surface}>
  <Base F={F} p={RIG.base} P={P} z={-16} h={12}/>
  <LabelPlate F={F} a={RIG.base.a+22} b={RIG.base.b+16} w={56} d={20} z={-4} P={P}/>
  <Solid paths={slab(F,T,-4,10,P,6,1)} tone="mid"/>
  <Tint paths={slab(F,S,0,z,P,4,.4)} color={col} edge="mid"/>
  {tex}
  {/* the puller: a post with a face-up force dial on top */}
  <Solid paths={post(F,RIG.postA,0,14,-4,6,P,28,.5)} tone="mid"/>
  <Solid paths={post(F,RIG.postA,0,6,2,pz-2,P,20)} tone="mid" crease="none" inner={<Line d={[18,34].map(zz=>k.sideArc(...at(F,RIG.postA,0),6,zz,P,12)).join('')} tone="faint"/>}/>
  <Solid paths={post(F,RIG.postA,0,30,pz,9,P,64,.8)} tone="hi" inner={<Line d={k.knurl(...at(F,RIG.postA,0),30,pz+1,pz+8,80,P,.3)} tone="faint"/>}/>
  {(()=>{const [x,y]=at(F,RIG.postA,0),t=k.radialTicks(x,y,25.5,40,5,pz+9.1,[2,4],P,-150*Math.PI/180,300*Math.PI/180);return <><Line d={k.ring(x,y,27,pz+9.1,P,64)} tone="lo"/><Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/></>;})()}
 </g>;
});
/** The live part: the boot on the surface (sliding when it slips), skid marks, the cord with its spring, the dial needle. */
export function GripLive({F,P,boot,force,slide,surface,sink}:{F:Frame;P:k.Projection;boot:Boot;force:number;slide:number;surface:Surface;sink:number}){
 const ang=Math.atan2(F.u[1],F.u[0]),a0=RIG.bootA+slide,[tx,ty]=at(F,a0,0);
 const svg=useMemo(()=>draw(allMeshes(boot),allMarks(boot),P,{theta:ang,phi:0,C:[0,0,boot.C[2]],lift:RIG.surfZ-sink,T:[tx,ty,0],s:.84},{mats:MATS,hidden:hideInner(boot),skins:skinsOf(boot),assembled:()=>true}).svg,[boot,P,ang,tx,ty,sink]);
 const pz=58,hook:[number,number,number]=[a0+150,0,26],ring:[number,number,number]=[RIG.postA-30,0,pz+4];
 const stretch=Math.min(1,force/100),sx=hook[0]+(ring[0]-hook[0])*.38,sl=34+30*stretch;
 const coil:string[]=[];{const n=14;for(let i=0;i<=n;i++){const t=i/n,a=sx+sl*t,z=hook[2]+(ring[2]-hook[2])*(.38+.3*t)+(i%2?5:-5)*(i>0&&i<n?1:0);coil.push(i?`L${pt(F,a,0,z,P).join(' ')}`:`M${pt(F,a,0,z,P).join(' ')}`);}}
 const cordA=k.pathOf([pt(F,...hook,P),pt(F,sx,0,hook[2]+(ring[2]-hook[2])*.38,P)]),cordB=k.pathOf([pt(F,sx+sl,0,hook[2]+(ring[2]-hook[2])*.68,P),pt(F,...ring,P)]);
 const [cx,cy]=at(F,RIG.postA,0),ang2=-150*Math.PI/180+Math.min(1,force/100)*300*Math.PI/180,tip=k.iso([cx+Math.cos(ang2-Math.PI/2)*22*0+Math.sin(ang2)*22,cy-Math.cos(ang2)*22,pz+9.3],P),hub=k.iso([cx,cy,pz+9.3],P);
 const skid=slide>2?[-110,-60,40,96].map(da=>[-14,14].map(db=>onTop(F,[[RIG.bootA+da,db],[RIG.bootA+da+slide,db]],RIG.surfZ+.4,P)).join('')).join(''):'';
 return <g data-grip-live="" data-force={Math.round(force)} data-slide={Math.round(slide)}>
  {skid&&<path d={skid} stroke={surface==='indoor'?'#3a3a3c':'#2a1f15'} strokeWidth={1.4} opacity={.5} fill="none" strokeLinecap="round"/>}
  <g dangerouslySetInnerHTML={{__html:svg}}/>
  <path d={cordA+cordB} className="iso-line" data-tone="hi" style={{strokeWidth:1.2}}/>
  <path d={coil.join('')} fill="none" stroke="#3a3a3c" strokeWidth={1.1} strokeLinejoin="round"/>
  <Dots points={[pt(F,...hook,P),pt(F,...ring,P)]} size={1.8} tone="hi"/>
  <path d={`M${hub[0]} ${hub[1]}L${tip[0]} ${tip[1]}`} stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" data-needle={Math.round(force)}/>
  <circle cx={hub[0]} cy={hub[1]} r={2.2} fill="#3a3a3c"/>
 </g>;
}

// ── The balance ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const BAL={base:{a:-250,b:-110,w:500,d:220,r:14} as FPlan,L:180,pivotZ:206,hang:96,panR:86,s:.38};
export const balPoints=():[number,number,number][]=>[...boxPts(BAL.base,-20,0),[-BAL.L-90,0,BAL.pivotZ+40],[BAL.L+90,0,BAL.pivotZ+40],[0,0,BAL.pivotZ+60]];
export const BalanceStatic=memo(function BalanceStatic({F,P}:{F:Frame;P:k.Projection}){
 return <g data-balance="">
  <Base F={F} p={BAL.base} P={P} z={-16} h={12}/>
  <LabelPlate F={F} a={BAL.base.a+22} b={BAL.base.b+BAL.base.d-40} w={60} d={20} z={-4} P={P}/>
  <Solid paths={slab(F,{a:-42,b:-34,w:84,d:68,r:6},-4,10,P,6,1)} tone="mid"/>
  <Solid paths={post(F,0,0,11,6,BAL.pivotZ-12,P,28)} tone="mid" crease="none" inner={<Line d={[50,110,170].map(zz=>k.sideArc(...at(F,0,0),11,zz,P,14)).join('')} tone="faint"/>}/>
 </g>;
});
/** The beam, its hangers, the two pans and what is on them: the old boot on the left, `n` modern boots on the right. */
export function BalanceLive({F,P,tilt,old,modern,n}:{F:Frame;P:k.Projection;tilt:number;old:Boot;modern:Boot;n:number}){
 const ang=Math.atan2(F.u[1],F.u[0]),ca=Math.cos(tilt),sa=Math.sin(tilt),{L,pivotZ,hang,panR,s}=BAL;
 const W=(a:number,b:number,z:number):V3=>{const [x,y]=at(F,a,b);return [x,y,z];};
 const beamAt=(a:number,dz:number,b:number):V3=>W(a*ca,b,pivotZ+a*sa+dz);
 const beam=boxMesh('beam','paper',[beamAt(-L-8,-5,-6),beamAt(L+8,-5,-6),beamAt(L+8,-5,6),beamAt(-L-8,-5,6),beamAt(-L-8,5,-6),beamAt(L+8,5,-6),beamAt(L+8,5,6),beamAt(-L-8,5,6)]);
 const pans=[-1,1].map(side=>{const ha=side*L*ca,hz=pivotZ+side*L*sa,pz=hz-hang;return {side,ha,hz,pz};});
 const items:{d:number;s:string}[]=[];const P0={theta:0,phi:0,C:[0,0,0] as V3,lift:0};
 const look={mats:MATS,hidden:hideInner(old)};
 items.push({d:depth(F,0,0,pivotZ,P),s:draw([beam],[],P,P0,look).svg});
 for(const p of pans){const [x,y]=at(F,p.ha,0);
  const pan=discMesh('pan','paper',x,y,panR,p.pz,5,48),rim=discMesh('pan','paper',x,y,panR*.18,p.pz+5,1.6,20);
  const strings=[0,1,2].map(i=>{const a=i/3*Math.PI*2+.3,r=panR-6,[ex,ey]=[x+Math.cos(a)*r,y+Math.sin(a)*r];return k.pathOf([k.iso([x,y,p.hz-4],P),k.iso([ex,ey,p.pz+5],P)]);});
  const backS=strings.filter((_,i)=>k.depthOf([x+Math.cos(i/3*Math.PI*2+.3),y+Math.sin(i/3*Math.PI*2+.3),0],P)<k.depthOf([x,y,0],P)),frontS=strings.filter(st=>!backS.includes(st));
  let boots='';
  if(p.side<0)boots=draw(allMeshes(old),allMarks(old),P,{theta:ang+.5,phi:0,C:[0,0,old.C[2]],lift:p.pz+5,T:[x,y,0],s},{...look,hidden:hideInner(old),assembled:()=>true}).svg;
  else{const list=Array.from({length:n},(_,i)=>{const off=(i-(n-1)/2)*38;const [bx,by]=at(F,p.ha-8,off);return {bx,by,d:depth(F,p.ha,off,0,P)};}).sort((a,b)=>a.d-b.d);
   boots=list.map(q=>draw(allMeshes(modern),allMarks(modern),P,{theta:ang+.35,phi:0,C:[0,0,modern.C[2]],lift:p.pz+5,T:[q.bx,q.by,0],s},{mats:MATS,hidden:hideInner(modern),assembled:()=>true}).svg).join('');}
  items.push({d:depth(F,p.ha,0,p.pz,P),s:`<g data-pan="${p.side<0?'old':'new'}"><path class="iso-line" data-tone="lo" d="${backS.join('')}"/>${draw([pan,rim],[],P,P0,look).svg}${boots}<path class="iso-line" data-tone="mid" d="${frontS.join('')}"/></g>`});
 }
 const hub=pt(F,0,0,pivotZ,P);
 const needle=k.pathOf([k.iso(W(0,-8,pivotZ),P),k.iso(W(-Math.sin(tilt)*70,-8,pivotZ-Math.cos(tilt)*70),P)]);
 return <g data-balance-live="" data-tilt={tilt.toFixed(3)}>
  <g dangerouslySetInnerHTML={{__html:items.sort((a,b)=>a.d-b.d).map(i=>i.s).join('')}}/>
  <path d={needle} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round"/>
  <circle cx={hub[0]} cy={hub[1]} r={4} fill="#f7f7f3" stroke="#3a3a3c" strokeWidth={.8}/>
 </g>;
}

// ── Material swatches (the compare strip) ──────────────────────────────────────────────────────────────────────────────
/** A small square of the material on a plinth, with its surface: leather grain, knit rows, a moulded stud, carbon weave… */
export function Swatch({mat}:{mat:string}){
 const P=useMemo(()=>k.fitProjection([[-30,-30,-8],[30,-30,-8],[-30,30,-8],[30,30,-8],[-30,-30,14],[30,30,14]],96,74,{pad:6}),[]);
 const m=MATS[mat]??MATS.paper,col=m.color==='paper'?'#f7f7f3':m.color,plan={x:-26,y:-26,w:52,d:52,r:5};
 const grain=mat.includes('leather')||['cowhide','calf','kangaroo','leathersole','leathermid','counterleather','hardcap','softcap','leatherstud','insoleleather'].includes(mat);
 const lines:string[]=[];
 if(mat==='knit'||mat==='sock')for(let y=-22;y<=22;y+=5)lines.push(k.lineOnTop([-24,y],[24,y],6,P));
 if(mat==='carbon')for(let i=-22;i<=22;i+=6){lines.push(k.lineOnTop([i,-24],[i+6,24],6,P));}
 const dots:k.Flat[]=[];if(grain)for(let i=0;i<26;i++){const x=Math.sin(i*12.9)*22,y=Math.cos(i*7.3)*22;dots.push(k.iso([x,y,6],P));}
 if(mat==='grip')for(let x=-20;x<=20;x+=6)for(let y=-20;y<=20;y+=6)dots.push(k.iso([x,y,6],P));
 const stud=['alu','studrubber','bladetpu','metal','tpu','leatherstud'].includes(mat);
 return <svg viewBox="0 0 96 74" className="bt-swatch" aria-hidden="true">
  <path className="iso-halo" d={k.slabOf({x:-30,y:-30,w:60,d:60,r:6},-8,4,P).fill} style={{filter:'blur(4px)',opacity:.25}}/>
  <Solid paths={k.slabOf({x:-30,y:-30,w:60,d:60,r:6},-8,4,P,6,.6)} tone="lo"/>
  <Tint paths={k.slabOf(plan,-4,10,P,6,.6)} color={col} edge="mid"/>
  {lines.length>0&&<path d={lines.join('')} stroke={mix(col,'#000000',.3)} strokeWidth={.7} fill="none"/>}
  {dots.length>0&&<g fill={mix(col,'#000000',.35)}>{dots.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={.8}/>)}</g>}
  {stud&&<Tint paths={k.cylinder(0,0,9,6,9,P,24,.6)} color={col} edge="hi"/>}
 </svg>;
}

// ── Shelf thumbnails ───────────────────────────────────────────────────────────────────────────────────────────────────
/** A small, still picture of a boot (fewer facets) for the shelf and the superpower round. */
export function thumb(spec:BootSpec,w=150,h=96){
 const b=buildBoot(spec,.55),pts:k.Point3[]=[];
 for(const p of b.parts)for(const m of p.meshes)for(let i=0;i<m.verts.length;i+=7){const [x,y,z]=m.verts[i];const c=Math.cos(-.42),s=Math.sin(-.42);pts.push([x*c-y*s,x*s+y*c,z]);}
 const P=k.fitProjection(pts,w,h,{pad:6});
 return draw(allMeshes(b),allMarks(b),P,{theta:-.42,phi:0,C:[0,0,b.C[2]],lift:0},{mats:MATS,hidden:hideInner(b),skins:skinsOf(b),assembled:()=>true}).svg;
}
export type {Mesh};
export {kOf,ringTop};
