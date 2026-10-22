import * as k from '../anatomy/iso-kit';
import {INK,byDepth,ghostSvg,innerAlpha,isFacing,shellAlpha,type Box,type LabelAnchor,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';

/**
 * var-2018 · "The review chain" (Oct 21 2026, figure kit v2 pilot). A table-top model of how one VAR review travels, no people:
 * two camera masts at a corner of the pitch → fibre cable → the video operation room (VOR) → the replay operator's desk → the
 * VAR's desk → a radio link → the referee review area: the review monitor on its stand by the touchline. Drag it all the way
 * round; See-through lifts the VOR's walls and roof to a ghost and shows the two desks; Labels name the six links; "Run a
 * review" lights them one step at a time: camera angle → replay → check → decision.
 *
 * Truth first (content.ts STATION, FIFA's "VAR at the 2018 FIFA World Cup" + the IFAB VAR protocol): the VOR was ONE central
 * room in Moscow, fed from all 12 stadiums by fibre-optic cable (the model is not to scale: it puts the room beside the
 * pitch); replay operators pick the angles; the VAR checks and talks to the referee by radio; the referee may watch the
 * replay at the review screen and always makes the final decision. Parts: ≤ ~85 SVG elements (counted in the tests).
 */
export const STEPS=[
 {id:'cameras',lit:['cameras','fibre']},
 {id:'replay',lit:['fibre','operator','room']},
 {id:'check',lit:['var','radio']},
 {id:'decision',lit:['radio','monitor']},
] as const;
export type StepId=typeof STEPS[number]['id'];
// museum-figures-2: a round plinth (the same width from every side, so the fit no longer loses a third of the card to the
// square base's diagonal) and a tighter layout inside it; the model now fills its card.
const PR=112,PH=8,Z=PH;
const VOR={x:-80,y:-66,w:96,d:72,h:44};
const MASTS:{x:number;y:number}[]=[{x:70,y:-58},{x:80,y:22}];
const RRA={x:26,y:72};
const ARC_TOP=Z+VOR.h+18+50;
/** The true extremes: the plinth rim all round, the mast tops and the top of the radio arc. */
export const POINTS:V3[]=[...Array.from({length:8},(_,i)=>[PR*Math.cos(i*Math.PI/4),PR*Math.sin(i*Math.PI/4),0] as V3),
 [MASTS[0].x,MASTS[0].y,Z+80],[MASTS[1].x,MASTS[1].y,Z+80],[(VOR.x+VOR.w-10+RRA.x)/2,(VOR.y+10+RRA.y)/2,ARC_TOP]];
const f1=(n:number)=>n.toFixed(1);
const box=(x0:number,y0:number,z0:number,x1:number,y1:number,z1:number):Box=>[[x0,y0,z0],[x1,y1,z1]];
const slab=(x:number,y:number,w:number,d:number,z:number,h:number,P:k.Projection,r=1)=>k.extrude(k.roundedPlan({x,y,w,d,r},2),z,h,P);
const ACC='var(--accent)';
/** A screen on the face of a box looking along +x or +y: drawn only while that face looks at you. */
function screenFace(cx:number,cy:number,z0:number,w:number,h:number,axis:'x'|'y',P:k.Projection,V:V3,on:boolean,alpha=1){
 const n:V3=axis==='x'?[1,0,0]:[0,1,0];if(!isFacing(n,V,.02))return '';
 const pts:V3[]=axis==='x'?[[cx,cy-w/2,z0],[cx,cy+w/2,z0],[cx,cy+w/2,z0+h],[cx,cy-w/2,z0+h]]:[[cx-w/2,cy,z0],[cx+w/2,cy,z0],[cx+w/2,cy,z0+h],[cx-w/2,cy,z0+h]];
 return `<path data-screen${on?' data-on=""':''} d="${k.pathOf(pts.map(p=>k.iso(p,P)),true)}" fill="${on?ACC:'#2b3135'}" fill-opacity="${alpha.toFixed(3)}" stroke="${INK}" stroke-width=".8"/>`;}

export function makeStation():{spec:FigureSpec}{
 const draw=(v:FigureView)=>{const P=v.P,V=v.V,on=(id:string)=>v.active.has(id),x=v.xray,ia=innerAlpha(x);
  let s=`<path class="iso-halo" d="${k.cylinder(0,0,PR+4,0,1,P,40).fill}"/>`;
  s+=k.solidSvg(k.cylinder(0,0,PR,0,PH,P,48,2));
  // Floor (always under everything): a corner of the pitch, the touchline, and the fibre cable from each mast to the room.
  s+=`<path class="iso-line" data-tone="lo" d="${k.onTop([[-98,40],[98,40]],Z,P)}${k.onTop([[60,40],[60,90]],Z,P)}${k.onTop([[-30,40],[-30,100]],Z,P)}"/>`;
  const fibre=MASTS.map(m=>k.onTop([[m.x,m.y],[m.x-30,m.y],[VOR.x+VOR.w,VOR.y+VOR.d/2]],Z+.2,P)).join('');
  s+=`<path data-fibre${on('fibre')?' data-on=""':''} d="${fibre}" fill="none" stroke="${on('fibre')?ACC:'#6f6f72'}" stroke-width="${on('fibre')?2.4:1.2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  type It={box:Box;svg:string};const items:It[]=[];
  // Camera masts: a pole and a camera body looking across the pitch (lens only when it faces you).
  for(const m of MASTS){let c=k.solidSvg(k.cylinder(m.x,m.y,2.2,Z,70,P,12),{flat:true});
   const lit=on('cameras'),head=slab(m.x-10,m.y-6,16,12,Z+70,10,P,1.5);
   c+=lit?`<g>${k.solidSvg(head,{lit:true})}</g>`:k.solidSvg(head);
   const n:V3=[-1,0,0];if(isFacing(n,V,.02)){const l=k.iso([m.x-10,m.y,Z+75],P);c+=`<circle data-lens cx="${f1(l[0])}" cy="${f1(l[1])}" r="${f1(k.cameraOf(P).k*3.4)}" fill="${lit?ACC:'#2b3135'}" stroke="${INK}" stroke-width=".8"/>`;}
   items.push({box:box(m.x-10,m.y-6,Z,m.x+6,m.y+6,Z+80),svg:c});}
  // The video operation room: walls + roof (the shell), and inside two desks with screens (replay operator, VAR).
  {const walls=slab(VOR.x,VOR.y,VOR.w,VOR.d,Z,VOR.h,P,3),sa=shellAlpha(x);let c='';
   const desk=(dx:number,id:string,screens:number)=>{const lit=on(id);let d=k.solidSvg(slab(VOR.x+dx,VOR.y+18,34,22,Z,16,P,1.5));
    for(let i=0;i<screens;i++){const sw=screens>1?9:18,sy=VOR.y+20+i*(sw+1);d+=k.solidSvg(slab(VOR.x+dx+4,sy,3,sw,Z+16,13,P,.5),{flat:true});
     d+=screenFace(VOR.x+dx+7.1,sy+sw/2,Z+18,sw-2,9,'x',P,V,lit,ia);}
    return d;};
   const inner=`<g data-inside opacity="${ia.toFixed(3)}">${desk(12,'operator',1)}${desk(58,'var',2)}</g>`;
   if(x>0){c+=ghostSvg(walls,sa)+inner;}else c+=k.solidSvg(walls,{lit:on('room')});
   // a door on the side facing the pitch, only while that wall faces you
   if(isFacing([1,0,0],V,.02)&&x<.5){
    c+=`<path class="iso-line" data-tone="mid" d="${k.pathOf([k.iso([VOR.x+VOR.w,VOR.y+VOR.d*.62,Z],P),k.iso([VOR.x+VOR.w,VOR.y+VOR.d*.62,Z+26],P),k.iso([VOR.x+VOR.w,VOR.y+VOR.d*.82,Z+26],P),k.iso([VOR.x+VOR.w,VOR.y+VOR.d*.82,Z],P)])}"/>`;}
   // the radio antenna on the roof
   c+=k.solidSvg(k.cylinder(VOR.x+VOR.w-10,VOR.y+10,1.4,Z+VOR.h,18,P,10),{flat:true});
   items.push({box:box(VOR.x,VOR.y,Z,VOR.x+VOR.w,VOR.y+VOR.d,Z+VOR.h+18),svg:c});}
  // The referee review area: a monitor on a stand by the touchline, its screen toward the pitch (-x); the back panel otherwise.
  {let c=k.solidSvg(k.cylinder(RRA.x,RRA.y,10,Z,3,P,20),{flat:true})+k.solidSvg(k.cylinder(RRA.x,RRA.y,2.4,Z+3,38,P,12),{flat:true});
   const lit=on('monitor');c+=k.solidSvg(slab(RRA.x-3,RRA.y-16,6,32,Z+38,22,P,1.5),{lit});
   const n:V3=[-1,0,0];if(isFacing(n,V,.02)){const pts:V3[]=[[RRA.x-3.1,RRA.y-13,Z+41],[RRA.x-3.1,RRA.y+13,Z+41],[RRA.x-3.1,RRA.y+13,Z+57],[RRA.x-3.1,RRA.y-13,Z+57]];
    c+=`<path data-screen${lit?' data-on=""':''} d="${k.pathOf(pts.map(p=>k.iso(p,P)),true)}" fill="${lit?ACC:'#2b3135'}" stroke="${INK}" stroke-width=".8"/>`;}
   items.push({box:box(RRA.x-10,RRA.y-16,Z,RRA.x+10,RRA.y+16,Z+60),svg:c});}
  for(const it of byDepth(items,V))s+=it.svg;
  // The radio link: from the antenna to the review area, drawn over everything (it is in the air).
  const A:V3=[VOR.x+VOR.w-10,VOR.y+10,Z+VOR.h+18],B:V3=[RRA.x,RRA.y,Z+62],arc:V3[]=[];
  for(let i=0;i<=12;i++){const t=i/12;arc.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t+50*4*t*(1-t)]);}
  s+=`<path data-radio${on('radio')?' data-on=""':''} d="${k.pathOf(arc.map(p=>k.iso(p,P)))}" fill="none" stroke="${on('radio')?ACC:'#98989a'}" stroke-width="${on('radio')?2.2:1.2}" stroke-dasharray="5 4"/>`;
  const rm=arc[6];
  const labels:LabelAnchor[]=[{id:'cameras',text:'Cameras',at:[MASTS[0].x-2,MASTS[0].y,Z+80]},{id:'room',text:'Video room',at:[VOR.x+VOR.w/2,VOR.y+VOR.d/2,Z+VOR.h]},
   {id:'radio',text:'Radio',at:rm},{id:'monitor',text:'Monitor',at:[RRA.x,RRA.y,Z+60]}];
  if(x>.5)labels.push({id:'operator',text:'Replays',at:[VOR.x+29,VOR.y+29,Z+16]},{id:'var',text:'VAR',at:[VOR.x+75,VOR.y+29,Z+16]});
  const xs:number[]=[],ys:number[]=[];for(const p of POINTS){const q=k.iso(p,P);xs.push(q[0]);ys.push(q[1]);}
  return {svg:s,labels,obj:{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}};};
 return {spec:{id:'var-station',points:POINTS,front:{yaw:30,pitch:34},pitch:[26,52],seeThrough:true,labels:true,draw}};
}
