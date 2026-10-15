'use client';
import type {ReactNode} from 'react';
import * as k from '../anatomy/iso-kit';
import {at,slab,pt,onTop,seg,depth,Tint,mix,type Frame,type FPlan} from '../anatomy/bench';
import {Solid,Line,toFloor,type Item} from '../anatomy/paper-kit';

/**
 * first-international-1872 · the instrument-maker's parts (Oct 14 2026 redo). Built on the shared anatomy kit (iso-kit, bench,
 * paper-kit); everything here is placed in a bench FRAME (a along the machine, b across), so one model lies landscape on a
 * desktop card and portrait on a phone. Parts: a wooden bench top on turned feet, brass bits, a knurled knob with detents, a
 * face-up dial gauge, a slider on a ruled rail, a lever in a slotted plate, a clockwork crank, a flip scoreboard, a lead
 * playing piece and the leather ball. Pure drawing: the exhibit decides where they go and how far they are turned.
 */
export type V2=[number,number];
export const WOOD='#d8bf97',WOOD_DARK='#b8966a',BRASS='#d4b062',FELT='#b7cda3',NAVY='#2d3f78',WHITE='#f6f4ec',LEATHER='#b07a45';
export const W3=(F:Frame,a:number,b:number,z:number):k.Point3=>[...at(F,a,b),z];
export const scr=(F:Frame,P:k.Projection,a:number,b:number,z:number)=>pt(F,a,b,z,P);
export const dep=(F:Frame,P:k.Projection,a:number,b:number,z:number)=>depth(F,a,b,z,P);
/** The frame point (a, b) under a screen point, on the plane at height z. */
export function toFrame(F:Frame,P:k.Projection,sx:number,sy:number,z:number):V2{const [x,y]=toFloor(sx,sy,P,z);return [x*F.u[0]+y*F.u[1],x*F.v[0]+y*F.v[1]];}
/** Fit frame-space points [a, b, z] into a rectangle of the card. */
export function fitRect(F:Frame,pts:readonly (readonly [number,number,number])[],r:{x:number;y:number;w:number;h:number},pad:number,elevation=30):k.Projection{
 const P0=k.fitProjection(pts.map(([a,b,z])=>W3(F,a,b,z)),Math.max(40,r.w),Math.max(40,r.h),{pad,elevation});
 return {...P0,origin:[P0.origin[0]+r.x,P0.origin[1]+r.y]};
}
const f1=(n:number)=>Math.round(n*10)/10;
const mat=(o:k.Flat,e:k.Flat,d:k.Flat)=>`matrix(${(e[0]-o[0]).toFixed(3)} ${(e[1]-o[1]).toFixed(3)} ${(d[0]-o[0]).toFixed(3)} ${(d[1]-o[1]).toFixed(3)} ${o[0].toFixed(2)} ${o[1].toFixed(2)})`;
/** Lying on a top face: local x runs along frame direction `r`, local y along `d` (both unit frame vectors). */
export const deckMatrix=(F:Frame,P:k.Projection,a:number,b:number,z:number,r:V2,d:V2)=>mat(scr(F,P,a,b,z),scr(F,P,a+r[0],b+r[1],z),scr(F,P,a+d[0],b+d[1],z));
/** On a standing face: local x along frame direction `r`, local y straight down. */
export const faceMatrix=(F:Frame,P:k.Projection,a:number,b:number,z:number,r:V2)=>mat(scr(F,P,a,b,z),scr(F,P,a+r[0],b+r[1],z),scr(F,P,a,b,z-1));
/** A screen path through frame points. */
export const fpath=(F:Frame,P:k.Projection,pts:readonly (readonly [number,number,number])[],closed=false)=>k.pathOf(pts.map(([a,b,z])=>scr(F,P,a,b,z)),closed);
/** A round part's world centre. */
const C=(F:Frame,a:number,b:number)=>at(F,a,b);
export const cyl=(F:Frame,P:k.Projection,a:number,b:number,r:number,z:number,h:number,steps=32,bevel=0)=>{const [x,y]=C(F,a,b);return k.cylinder(x,y,r,z,h,P,steps,bevel);};
export const ringAt=(F:Frame,P:k.Projection,a:number,b:number,r:number,z:number,steps=40)=>{const [x,y]=C(F,a,b);return k.ring(x,y,r,z,P,steps);};
export const arcAt=(F:Frame,P:k.Projection,a:number,b:number,r:number,z:number,steps=24)=>{const [x,y]=C(F,a,b);return k.sideArc(x,y,r,z,P,steps);};
export const knurlAt=(F:Frame,P:k.Projection,a:number,b:number,r:number,z0:number,z1:number,n:number)=>{const [x,y]=C(F,a,b);return k.knurl(x,y,r,z0,z1,n,P,.3);};
/** A direction on the deck at angle θ (degrees) from `up`, turning toward `right`. */
export const dirOf=(up:V2,right:V2,deg:number):V2=>{const t=deg*Math.PI/180;return [up[0]*Math.cos(t)+right[0]*Math.sin(t),up[1]*Math.cos(t)+right[1]*Math.sin(t)];};
/** The angle (degrees) of the pointer around a centre, read on the deck plane (inverse of dirOf). */
export function angleAt(F:Frame,P:k.Projection,sx:number,sy:number,a:number,b:number,z:number,up:V2,right:V2){
 const [pa,pb]=toFrame(F,P,sx,sy,z),da=pa-a,db=pb-b;return Math.atan2(da*right[0]+db*right[1],da*up[0]+db*up[1])*180/Math.PI;}

// ── Painters ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Screws: a ring and a dot. */
export function screw(F:Frame,P:k.Projection,a:number,b:number,z:number,r=1.6){const [x,y]=scr(F,P,a,b,z);
 return <g><Line d={ringAt(F,P,a,b,r,z,16)} tone="lo"/><circle cx={f1(x)} cy={f1(y)} r={.9} fill="var(--anatomy-dot)" opacity={.6}/></g>;}
/** A round bar between two screen points (a cylinder seen side-on projects to a capsule), in a colour. */
export function Rod({a,b,r,color='#e9e7df'}:{a:k.Flat;b:k.Flat;r:number;color?:string}){
 const d=`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g>
  <path d={d} stroke="var(--anatomy-hi)" strokeWidth={r*2+1.6} strokeLinecap="round" fill="none"/>
  <path d={d} stroke={mix(color,'#000000',.12)} strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${f1(a[0]-nx*r*.35)} ${f1(a[1]-ny*r*.35)}L${f1(b[0]-nx*r*.35)} ${f1(b[1]-ny*r*.35)}`} stroke={mix(color,'#ffffff',.55)} strokeWidth={Math.max(.8,r*.7)} strokeLinecap="round" fill="none"/>
 </g>;
}
/** A shaded ball at a screen point (light from the upper left). */
export function Knob3({c,r,color}:{c:k.Flat;r:number;color:string}){
 return <g>
  <circle cx={f1(c[0])} cy={f1(c[1])} r={r} fill={mix(color,'#000000',.22)}/>
  <circle cx={f1(c[0]-r*.12)} cy={f1(c[1]-r*.12)} r={r*.86} fill={color}/>
  <circle cx={f1(c[0]-r*.34)} cy={f1(c[1]-r*.36)} r={r*.34} fill={mix(color,'#ffffff',.7)} opacity={.85}/>
  <circle cx={f1(c[0])} cy={f1(c[1])} r={r} className="iso-line" data-tone="hi" fill="none"/>
 </g>;
}

/** The wooden bench top: halo, turned feet, the slab (wood), a side seam, an inset groove, brass corner screws. Top at z = 0. */
export function benchTop(id:string,F:Frame,P:k.Projection,p:FPlan,{h=10,feet=8}={}):Item[]{
 const out:Item[]=[],z0=-h-feet,corner=[[p.a+20,p.b+20],[p.a+p.w-20,p.b+20],[p.a+20,p.b+p.d-20],[p.a+p.w-20,p.b+p.d-20]].sort((m,n)=>dep(F,P,m[0],m[1],0)-dep(F,P,n[0],n[1],0));
 out.push({k:-1e9,id:id+'-halo',n:<path className="iso-halo" d={slab(F,p,z0,h+feet,P).fill}/>});
 corner.forEach(([a,b],i)=>out.push({k:-1e8+i,id:`${id}-foot${i}`,n:<g>
  <Solid paths={cyl(F,P,a,b,7.4,z0,1.8,28)} tone="lo"/>
  <Tint paths={cyl(F,P,a,b,5,z0+1.8,feet-1.8,28)} color={WOOD_DARK} inner={<Line d={arcAt(F,P,a,b,5,z0+feet*.55)} tone="faint"/>}/></g>}));
 const g={a:p.a+6,b:p.b+6,w:p.w-12,d:p.d-12,r:Math.max(0,p.r-6)};
 out.push({k:-1e7,id:id+'-slab',n:<g>
  <Tint paths={slab(F,p,-h,h,P,8,1.6)} color={WOOD} inner={<><Line d={k.ringSeam(ringIn(F,p),-h*.42,P)} tone="faint"/>
   {[.2,.4,.62,.8].map(f=><Line key={f} d={onTop(F,[[p.a+p.w*f,p.b+4],[p.a+p.w*f+30,p.b+p.d-4]],0,P)} tone="faint"/>)}</>}/>
  <Line d={k.onTop(ringIn(F,g),0,P,true)} tone="lo"/>
  {[[p.a+10,p.b+10],[p.a+p.w-10,p.b+10],[p.a+10,p.b+p.d-10],[p.a+p.w-10,p.b+p.d-10]].map(([a,b],i)=><g key={i}>{screw(F,P,a,b,0,2.2)}</g>)}
 </g>});
 return out;
}
export const ringIn=(F:Frame,p:FPlan,steps=8)=>k.roundedPlan({x:p.a,y:p.b,w:p.w,d:p.d,r:p.r},steps).map(([a,b])=>at(F,a,b));

/** A ruler strip on the deck along frame direction `axis`, ticks hanging from its far edge. */
export function ruler(id:string,F:Frame,P:k.Projection,a0:number,b0:number,len:number,axis:'a'|'b',z=0,{d=6,step=4,every=5}={}):Item{
 const plan:FPlan=axis==='a'?{a:a0,b:b0,w:len,d,r:1}:{a:a0,b:b0,w:d,d:len,r:1},minor:string[]=[],major:string[]=[];
 for(let s=3,i=0;s<=len-3+1e-9;s+=step,i++){const L=i%every===0?d*.62:d*.34;
  const [p0,p1]=axis==='a'?[[a0+s,b0],[a0+s,b0+L]]:[[a0,b0+s],[a0+L,b0+s]];(i%every===0?major:minor).push(onTop(F,[p0 as V2,p1 as V2],z+.6,P));}
 return {k:dep(F,P,a0+(axis==='a'?len/2:d/2),b0+(axis==='b'?len/2:d/2),z),id,n:<Solid paths={slab(F,plan,z,.6,P,3)} tone="lo" crease="none">
  <Line d={minor.join('')} tone="lo"/><Line d={major.join('')} tone="mid"/></Solid>};
}

/** Engraved text lying on the deck (it reads along `r`). */
export function Engrave({F,P,a,b,z,r,d,size=4.6,children,anchor='middle',tone='mid'}:{F:Frame;P:k.Projection;a:number;b:number;z:number;r:V2;d:V2;size?:number;children:ReactNode;anchor?:'start'|'middle'|'end';tone?:k.Tone}){
 return <text className="iso-face-text" data-tone={tone} transform={deckMatrix(F,P,a,b,z,r,d)} fontSize={size} textAnchor={anchor} dominantBaseline="middle" style={{fontWeight:600}}>{children}</text>;
}

/**
 * A big knurled knob on a brass skirt, face up at (a, b): a dial ring of detent ticks round it on the deck, the knurled body,
 * a domed cap and a pointer (the dynamic part, `deg` from `up`). `marks` are the detent angles.
 */
export function knobNode(F:Frame,P:k.Projection,a:number,b:number,R:number,deg:number,{up,right,marks,locked=false,color=BRASS}:{up:V2;right:V2;marks:readonly number[];locked?:boolean;color?:string}){
 const H=8,ticks=marks.map(m=>{const d=dirOf(up,right,m);return onTop(F,[[a+d[0]*(R+4),b+d[1]*(R+4)],[a+d[0]*(R+9),b+d[1]*(R+9)]],.4,P);});
 const minor:string[]=[];for(let m=-150;m<=150;m+=10){if(marks.some(x=>Math.abs(x-m)<4))continue;const d=dirOf(up,right,m);minor.push(onTop(F,[[a+d[0]*(R+4),b+d[1]*(R+4)],[a+d[0]*(R+6),b+d[1]*(R+6)]],.4,P));}
 const p=dirOf(up,right,deg),tip:V2=[a+p[0]*(R-2.2),b+p[1]*(R-2.2)];
 return <g>
  <Solid paths={cyl(F,P,a,b,R+10,0,.4,56)} tone="lo" crease="none"><Line d={minor.join('')} tone="lo"/><Line d={ticks.join('')} tone="hi"/></Solid>
  <Tint paths={cyl(F,P,a,b,R+2,.4,1.8,48,.4)} color={mix(color,'#000000',.08)}/>
  <Solid paths={cyl(F,P,a,b,R,2.2,H,48,.6)} tone="hi" className={locked?'dark':undefined} inner={<Line d={knurlAt(F,P,a,b,R,2.2,2.2+H,56)} tone="faint"/>}/>
  <Tint paths={cyl(F,P,a,b,R*.72,2.2+H,1.6,40,.5)} color={color}/>
  <path d={onTop(F,[[a+p[0]*2,b+p[1]*2],tip],2.2+H+1.6,P)} className="iso-line" data-tone="lit" style={{strokeWidth:2.4}}/>
  <Line d={onTop(F,[[a-p[0]*1.6,b-p[1]*1.6],[a+p[0]*1.6,b+p[1]*1.6]],2.2+H+1.6,P)} tone="hi"/>
  {(()=>{const [x,y]=scr(F,P,tip[0],tip[1],2.2+H+1.6);return <circle cx={f1(x)} cy={f1(y)} r={1.5} fill="var(--acc)"/>;})()}
 </g>;
}
export const knobTop=(R:number)=>2.2+8+1.6;

/** A face-up dial gauge (a brass-bezelled stopwatch). 12 o'clock points along `up`; the needle is at fraction `f` of a turn. */
export function dialNode(F:Frame,P:k.Projection,a:number,b:number,R:number,f:number,{up,right,zone}:{up:V2;right:V2;zone?:[number,number]}){
 const z=4,top=z+5,t:string[]=[],tm:string[]=[];
 for(let i=0;i<60;i++){const d=dirOf(up,right,i*6),big=i%5===0,ri=R-2.4-(big?3.2:1.6),ro=R-2.4;(big?tm:t).push(onTop(F,[[a+d[0]*ri,b+d[1]*ri],[a+d[0]*ro,b+d[1]*ro]],top,P));}
 const n=dirOf(up,right,f*360),tail=dirOf(up,right,f*360+180);
 const zoneD=zone?(()=>{const pts:V2[]=[];for(let s=0;s<=24;s++){const d=dirOf(up,right,(zone[0]+(zone[1]-zone[0])*s/24)*360);pts.push([a+d[0]*(R-7),b+d[1]*(R-7)]);}return onTop(F,pts,top,P);})():'';
 const [hx,hy]=scr(F,P,a,b,top+.3);
 return <g>
  <Solid paths={cyl(F,P,a,b,R+1.6,0,z,56,.4)} tone="mid"/>
  <Tint paths={cyl(F,P,a,b,R,z,5,64,.6)} color={BRASS} inner={<Line d={knurlAt(F,P,a,b,R,z+.6,z+4.4,72)} tone="faint"/>}/>
  <path d={cyl(F,P,a,b,R-1.8,top,0,64).top} fill="#fbfbf6"/>
  <Line d={ringAt(F,P,a,b,R-1.8,top,64)} tone="mid"/>
  {zone&&<path d={zoneD} fill="none" stroke="var(--acc)" strokeWidth={3} strokeLinecap="round" opacity={.55}/>}
  <Line d={t.join('')} tone="lo"/><Line d={tm.join('')} tone="hi"/>
  <path d={onTop(F,[[a+tail[0]*3,b+tail[1]*3],[a+n[0]*(R-4.6),b+n[1]*(R-4.6)]],top+.3,P)} className="iso-line" data-tone="lit" style={{strokeWidth:1.8}}/>
  <circle cx={f1(hx)} cy={f1(hy)} r={2} fill="var(--anatomy-hi)"/><circle cx={f1(hx)} cy={f1(hy)} r={.8} fill="#fbfbf6"/>
 </g>;
}

/** A slider: a ruled rail along `axis` with end stops, and a carriage with a knurled grip at fraction t (0..1). */
export function sliderNodes(id:string,F:Frame,P:k.Projection,a0:number,b0:number,len:number,axis:'a'|'b',t:number):{rail:Item;carriage:Item;grip:k.Point3}{
 const along=(s:number):V2=>axis==='a'?[a0+s,b0]:[a0,b0+s],rp:FPlan=axis==='a'?{a:a0,b:b0-4,w:len,d:8,r:1.4}:{a:a0-4,b:b0,w:8,d:len,r:1.4};
 const stop=(s:number):FPlan=>axis==='a'?{a:a0+s-3,b:b0-7,w:6,d:14,r:1.2}:{a:a0-7,b:b0+s-3,w:14,d:6,r:1.2};
 const minor:string[]=[],major:string[]=[];for(let s=8,i=0;s<=len-8+1e-9;s+=(len-16)/20,i++){const [pa,pb]=along(s),L=i%5===0?3.4:1.8;
  (i%5===0?major:minor).push(axis==='a'?onTop(F,[[pa,pb+4],[pa,pb+4+L]],2.6,P):onTop(F,[[pa+4,pb],[pa+4+L,pb]],2.6,P));}
 const rail=<g>
  <Solid paths={slab(F,rp,0,2.6,P,3,.4)} tone="mid"><Line d={axis==='a'?onTop(F,[[a0+4,b0],[a0+len-4,b0]],2.6,P):onTop(F,[[a0,b0+4],[a0,b0+len-4]],2.6,P)} tone="faint"/></Solid>
  <Line d={minor.join('')} tone="lo"/><Line d={major.join('')} tone="mid"/>
  {[0,len].map(s=><Tint key={s} paths={slab(F,stop(s),0,6,P,3,.5)} color={BRASS}/>)}
 </g>;
 const s=8+(len-16)*t,[ca,cb]=along(s),cp:FPlan=axis==='a'?{a:ca-7,b:cb-8,w:14,d:16,r:2}:{a:ca-8,b:cb-7,w:16,d:14,r:2};
 const carriage=<g data-slider={id}>
  <Solid paths={slab(F,cp,2.6,4,P,4,.6)} tone="hi" inner={<Line d={k.ringSeam(ringIn(F,cp,4),4.2,P)} tone="faint"/>}>
   {(axis==='a'?[[ca-4.4,cb-5],[ca+4.4,cb-5],[ca-4.4,cb+5],[ca+4.4,cb+5]]:[[ca-5,cb-4.4],[ca+5,cb-4.4],[ca-5,cb+4.4],[ca+5,cb+4.4]]).map(([pa,pb],i)=><circle key={i} cx={f1(scr(F,P,pa,pb,6.6)[0])} cy={f1(scr(F,P,pa,pb,6.6)[1])} r={.7} fill="var(--anatomy-dot)" opacity={.6}/>)}
  </Solid>
  <Solid paths={cyl(F,P,ca,cb,2.2,6.6,4,20)} tone="mid"/>
  <Tint paths={cyl(F,P,ca,cb,5.2,10.6,5,36,.5)} color={BRASS} inner={<Line d={knurlAt(F,P,ca,cb,5.2,10.6,15.6,30)} tone="faint"/>}/>
 </g>;
 return {rail:{k:dep(F,P,...along(len/2),0)-.5,id:id+'-rail',n:rail},carriage:{k:dep(F,P,ca,cb,6),id:id+'-carriage',n:carriage},grip:[ca,cb,15.6]};
}

/** A lead playing piece (built at the origin, standing on z = 0): a turned base, the body in its team colour, a collar, a head. */
export function pieceNode(P:k.Projection,color:string,edge:k.Tone='hi'){
 const kk=k.cameraOf(P).k,[hx,hy]=k.iso([0,0,15.4],P);
 return <g>
  <path className="iso-halo" style={{opacity:.32,filter:'blur(2.5px)',transform:'none'}} d={k.cylinder(0,0,5.6,0,.1,P,20).fill}/>
  <Tint paths={k.cylinder(0,0,5,0,1.8,P,28,.4)} color={mix(color,'#000000',.1)} edge={edge}/>
  <Tint paths={k.cylinder(0,0,3.4,1.8,9,P,24)} color={color} edge={edge} inner={<Line d={k.sideArc(0,0,3.4,6.4,P,16)} tone="faint"/>}/>
  <Tint paths={k.cylinder(0,0,4,10.4,1.8,P,24,.3)} color={mix(color,'#ffffff',.08)} edge={edge}/>
  <circle cx={f1(hx)} cy={f1(hy)} r={3.3*kk} fill={mix(color,'#000000',.2)}/>
  <circle cx={f1(hx-.4*kk)} cy={f1(hy-.4*kk)} r={2.85*kk} fill={color}/>
  <circle cx={f1(hx-1.1*kk)} cy={f1(hy-1.2*kk)} r={1.1*kk} fill={mix(color,'#ffffff',.6)} opacity={.8}/>
  <circle cx={f1(hx)} cy={f1(hy)} r={3.3*kk} className="iso-line" data-tone={edge} fill="none"/>
 </g>;
}
/** The 1872 leather ball, built at the origin (centre at z = r + lift): a contact shadow and a laced sphere. */
export function ballNode(P:k.Projection,r:number,lift:number){
 const kk=k.cameraOf(P).k,[cx,cy]=k.iso([0,0,r+lift],P),R=r*kk;
 return <g>
  <path className="iso-halo" style={{opacity:lift>0?.18:.3,filter:'blur(2px)',transform:`translateY(${f1(k.screenRise(lift,P))}px)`}} d={k.cylinder(0,0,r*.9,0,.1,P,20).fill}/>
  <circle cx={f1(cx)} cy={f1(cy)} r={R} fill={mix(LEATHER,'#000000',.25)}/>
  <circle cx={f1(cx-R*.12)} cy={f1(cy-R*.12)} r={R*.86} fill={LEATHER}/>
  <circle cx={f1(cx-R*.34)} cy={f1(cy-R*.36)} r={R*.32} fill={mix(LEATHER,'#ffffff',.55)} opacity={.8}/>
  <path d={`M${f1(cx-R*.9)} ${f1(cy+R*.1)}Q${f1(cx)} ${f1(cy+R*.55)} ${f1(cx+R*.9)} ${f1(cy+R*.1)}M${f1(cx-R*.05)} ${f1(cy-R*.95)}Q${f1(cx+R*.4)} ${f1(cy)} ${f1(cx-R*.05)} ${f1(cy+R*.95)}`} fill="none" stroke={mix(LEATHER,'#000000',.45)} strokeWidth={.7}/>
  <circle cx={f1(cx)} cy={f1(cy)} r={R} className="iso-line" data-tone="hi" fill="none"/>
 </g>;
}
export {Solid,Line,Tint,mix,slab,onTop,seg};
export type {Frame,FPlan,Item};
