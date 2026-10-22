import * as k from '../anatomy/iso-kit';
import {GHOST,INK,INK_MID,dot,innerAlpha,isFacing,recolor,shadeOf,shellAlpha,tones,type LabelAnchor,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';
import {PANELS,axisQ,compose,easeOut,rotate,slerp,type Quat} from './model';

/**
 * telstar-1970 · "Turn the ball" (Oct 21 2026, figure kit v2 pilot). The finished Telstar on a display cup: drag it all the way
 * round (every one of the 32 panels can be seen; "Roll it" rolls the ball over so the underside comes up), See-through fades
 * the leather shell to a ghost and shows the rubber bladder that holds the air and the valve you pump it up through, Labels
 * name the parts and light while you touch them, and the swatches recolour the 12 pentagons ("Telstar" = black).
 *
 * Truth first: 32 leather panels (12 black pentagons, 20 white hexagons) stitched together around a rubber bladder, with a
 * valve to pump it up (content.ts EXTRA.inside, with sources). No other inner layers are drawn: we only draw what we verified.
 * Parts: 32 panels (≤ ~20 facing at a time), ~6 stand paths, bladder + valve (see-through), 5 labels: ≤ ~95 SVG elements.
 */
export const R=60;
const STAND={plinthR:64,plinthH:12,cupR:26,cupH:16},CZ=STAND.plinthH+STAND.cupH+Math.sqrt(R*R-(STAND.cupR-2)**2);
export const CENTRE:V3=[0,0,CZ];
export const POINTS:V3[]=[[-STAND.plinthR,0,0],[STAND.plinthR,0,0],[0,STAND.plinthR,0],[0,-STAND.plinthR,0],[0,0,CZ+R],[R,0,CZ],[-R,0,CZ],[0,R,CZ],[0,-R,CZ]];
const BLACK={l:'#3a3a3c',m:'#262628',d:'#151517'},WHITE={l:'#fbfbf8',m:'#ecece7',d:'#d3d3ce'};
export const BLADDER='#c79a62',VALVE_PANEL=PANELS.findIndex(p=>p.kind==='hex');
/** Ball-local (the model's frame) to world (z up), a proper rotation. */
const toWorld=(v:readonly number[]):V3=>[v[2],v[0],v[1]];
/** Start with a black pentagon looking at the front view (yaw 45, pitch 30). */
const FRONT_DIR:V3=[Math.cos(Math.PI/4)*Math.cos(Math.PI/6),Math.sin(Math.PI/4)*Math.cos(Math.PI/6),Math.sin(Math.PI/6)];
const local=(w:V3):V3=>[w[1],w[2],w[0]];
function between(a:V3,b:V3):Quat{const d=dot(a,b),c:V3=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const q:Quat=[1+d,c[0],c[1],c[2]];const l=Math.hypot(...q)||1;return [q[0]/l,q[1]/l,q[2]/l,q[3]/l];}
export const START:Quat=between(PANELS[0].c as V3,local(FRONT_DIR));
const f1=(n:number)=>n.toFixed(1);

/** One panel's direction and its outline on screen (vertices past the horizon slide onto the rim). */
function panelPath(q:Quat,i:number,v:FigureView,kk:number,c:k.Flat){
 let d='M';const pts=PANELS[i].pts;
 for(let j=0;j<pts.length;j++){const w=toWorld(rotate(q,pts[j]));let s=dot(w,v.V),x=w[0],y=w[1],z=w[2];
  if(s<0){x-=s*v.V[0];y-=s*v.V[1];z-=s*v.V[2];const l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;}
  const sx=c[0]+kk*R*dot([x,y,z],v.R),sy=c[1]-kk*R*dot([x,y,z],v.U);d+=(j?'L':'')+f1(sx)+' '+f1(sy);}
 return d+'Z';}

export function makeTelstarFigure(){
 const st={q:START as Quat,from:START as Quat,to:START as Quat,u:1};
 const at=(i:number)=>toWorld(rotate(st.q,PANELS[i].c));
 const draw=(v:FigureView)=>{
  const P=v.P,kk=k.cameraOf(P).k,c=k.iso(CENTRE,P),x=v.xray,sa=shellAlpha(x),ia=innerAlpha(x);
  let s=`<defs><radialGradient id="fig-ts-round" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient></defs>`;
  // The display stand: halo, plinth, cup (iso-kit solids shade and hide back faces at any yaw).
  s+=`<path class="iso-halo" d="${k.cylinder(0,0,STAND.plinthR+4,0,1,P,40).fill}"/>`;
  s+=k.solidSvg(k.cylinder(0,0,STAND.plinthR,0,STAND.plinthH,P,48,2));
  s+=k.solidSvg(k.cylinder(0,0,STAND.cupR,STAND.plinthH,STAND.cupH,P,32,1));
  // Panels: back (seen only through the ghost) and front, each in painter's order by their facing.
  const order=PANELS.map((_,i)=>i).sort((a,b)=>dot(at(a),v.V)-dot(at(b),v.V));
  const panel=(i:number,alpha:number,inside=false)=>{const n=at(i),pent=PANELS[i].kind==='pent';
   const t=pent?(v.swatch?tones(recolor('#262628',v.swatch,true)):BLACK):WHITE;
   const fill=inside?(pent?'#8d7f70':'#e6dccb'):shadeOf(n,v.L,t);
   return `<path data-panel="${PANELS[i].kind}" d="${panelPath(st.q,i,v,kk,c)}" fill="${fill}" fill-opacity="${alpha.toFixed(3)}" stroke="${pent&&!inside?'#111':INK_MID}" stroke-width=".9" stroke-dasharray="3.2 2.2"/>`;};
  const valve=at(VALVE_PANEL),valveFacing=isFacing(valve,v.V,.02);
  const stem=()=>{const a=k.iso([CENTRE[0]+valve[0]*R*.84,CENTRE[1]+valve[1]*R*.84,CENTRE[2]+valve[2]*R*.84],P),b=k.iso([CENTRE[0]+valve[0]*R,CENTRE[1]+valve[1]*R,CENTRE[2]+valve[2]*R],P);
   return `<g opacity="${ia.toFixed(3)}" data-valve-stem><path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" stroke="#5b4a38" stroke-width="${f1(Math.max(4,kk*5))}" stroke-linecap="round"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="${f1(Math.max(2.5,kk*3.2))}" fill="#3b3128" stroke="${INK}" stroke-width=".8"/></g>`;};
  if(x>0){for(const i of order)if(dot(at(i),v.V)<.05)s+=panel(i,.55*ia,true);
   if(!valveFacing)s+=stem();
   s+=`<g opacity="${ia.toFixed(3)}" data-bladder><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R*.84*kk)}" fill="${BLADDER}" fill-opacity=".92" stroke="#7a5a32" stroke-width="1"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R*.84*kk)}" fill="url(#fig-ts-round)"/></g>`;
   if(valveFacing)s+=stem();}
  s+=`<g data-shell opacity="${x>0?Math.max(sa,GHOST+.17).toFixed(3):'1'}">`;
  for(const i of order)if(dot(at(i),v.V)>-.05)s+=panel(i,x>0?sa:1);
  if(x<1)s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R*kk)}" fill="url(#fig-ts-round)" opacity="${(1-x).toFixed(3)}"/>`;
  s+=`</g>`;
  // The valve hole on its panel, only while that panel faces you (closed ball).
  if(valveFacing&&x<.5){const p=k.iso([CENTRE[0]+valve[0]*R,CENTRE[1]+valve[1]*R,CENTRE[2]+valve[2]*R],P);s+=`<circle data-valve cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(Math.max(2.2,kk*2.6))}" fill="#3b3128" stroke="${INK}" stroke-width=".8"/>`;}
  s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R*kk)}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
  // Labels: the pentagon and hexagon nearest you, a seam on that pentagon, the valve; the bladder only when you can see it.
  let bp=-1,bh=-1,vp=-9,vh=-9;for(let i=0;i<PANELS.length;i++){const d=dot(at(i),v.V);if(PANELS[i].kind==='pent'){if(d>vp){vp=d;bp=i;}}else if(i!==VALVE_PANEL&&d>vh){vh=d;bh=i;}}
  const on=(n:V3,r=R):V3=>[CENTRE[0]+n[0]*r,CENTRE[1]+n[1]*r,CENTRE[2]+n[2]*r];
  const e0=toWorld(rotate(st.q,PANELS[bp].pts[0])),e1=toWorld(rotate(st.q,PANELS[bp].pts[1])),em=[(e0[0]+e1[0])/2,(e0[1]+e1[1])/2,(e0[2]+e1[2])/2] as V3,eml=Math.hypot(...em);
  const seam:V3=[em[0]/eml,em[1]/eml,em[2]/eml];
  const labels:LabelAnchor[]=[{id:'pentagon',text:'Black pentagon',at:on(at(bp)),normal:at(bp)},{id:'hexagon',text:'White hexagon',at:on(at(bh)),normal:at(bh)},
   {id:'seam',text:'Stitched seam',at:on(seam),normal:seam},{id:'valve',text:'Valve',at:on(valve),normal:valve,centre:CENTRE}];
  if(x>.5){const bl:V3=[v.U[0]*.5-v.R[0]*.5+v.V[0]*.7,v.U[1]*.5-v.R[1]*.5+v.V[1]*.7,v.U[2]*.5-v.R[2]*.5+v.V[2]*.7],l=Math.hypot(...bl);
   labels.push({id:'bladder',text:'Bladder',at:on([bl[0]/l,bl[1]/l,bl[2]/l],R*.84)});}
  const pr=STAND.plinthR*kk,base=k.iso([0,0,0],P);
  return {svg:s,labels,obj:{l:Math.min(c[0]-R*kk,base[0]-pr),r:Math.max(c[0]+R*kk,base[0]+pr),t:c[1]-R*kk,b:base[1]+pr*.6}};};
 const spec:FigureSpec={id:'telstar',points:POINTS,seeThrough:true,labels:true,swatches:['tomato','mustard','mint','cobalt','blush'],swatchLabel:'Telstar',draw,
  tick:dt=>{if(st.u>=1)return false;st.u=Math.min(1,st.u+dt/.7);st.q=slerp(st.from,st.to,easeOut(st.u));return st.u<1;}};
 return {spec,
  /** Roll the ball a quarter turn over (so its underside comes up); reduced motion = at once. */
  roll(reduced:boolean){st.from=st.q;st.to=compose(axisQ([1,0,0],Math.PI/2),st.q);st.u=reduced?1:0;if(reduced)st.q=st.to;},
  reset(){st.q=START;st.from=START;st.to=START;st.u=1;},
  get q(){return st.q;},
 };
}
