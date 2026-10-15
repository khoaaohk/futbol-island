'use client';
import type {ReactNode} from 'react';
import {cameraOf,cylinder,iso,knurl,lineOnTop,pathOf,radialTicks,ring,sideArc,towardViewer,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
import {Line,Solid} from '../anatomy/draw';
import {toFloor} from '../anatomy/paper-kit';

/**
 * free-kick-wall · bench parts the instruments are built from (Oct 14 2026 redo, anatomy Paper theme). Pure drawing helpers on
 * the shared kit: a round bar (a cylinder seen side-on is a capsule), a coil spring between any two points, a knurled control
 * knob with its engraved scale, a lever in a slotted quadrant, and the maths that turns a pointer into a knob angle or a value
 * along a part's screen path. Every control is a real <g> with role="slider", so it takes focus and the arrow keys.
 */
const f1=(n:number)=>Math.round(n*10)/10;
/** A round bar between two screen points: an outline, the body and a highlight along the lit side. */
export function Rod({a,b,r,dark=false,lit=false,tint}:{a:Flat;b:Flat;r:number;dark?:boolean;lit?:boolean;tint?:string}){
 const d=`M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,o=nx<0?-1:1;
 return <g>
  <path d={d} stroke={lit?'var(--anatomy-lit)':dark?'#232325':'var(--anatomy-hi)'} strokeWidth={r*2+1.6} strokeLinecap="round" fill="none"/>
  <path d={d} stroke={tint??(dark?'#4d4d4f':'var(--anatomy-shade-1)')} strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${f1(a[0]-o*nx*r*.38)} ${f1(a[1]-o*ny*r*.38)}L${f1(b[0]-o*nx*r*.38)} ${f1(b[1]-o*ny*r*.38)}`} stroke={dark?'#6a6a6c':'#ffffff'} strokeWidth={Math.max(.8,r*.62)} opacity={tint?.35:.9} strokeLinecap="round" fill="none"/>
 </g>;
}
/** A coil spring between two world points (radius r, `turns` turns), as one hairline over a faint shadow line. */
export function Spring({a,b,r,turns,P,tone='hi'}:{a:Point3;b:Point3;r:number;turns:number;P:Projection;tone?:'hi'|'mid'|'lit'}){
 const ax=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...ax)||1,t=ax.map(v=>v/L);
 // two unit vectors across the axis
 const up=Math.abs(t[2])<.9?[0,0,1]:[1,0,0];
 let u=[t[1]*up[2]-t[2]*up[1],t[2]*up[0]-t[0]*up[2],t[0]*up[1]-t[1]*up[0]];const ul=Math.hypot(...u)||1;u=u.map(v=>v/ul);
 const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
 const n=Math.max(8,Math.round(turns*14)),pts:Flat[]=[];
 for(let i=0;i<=n;i++){const s=i/n,ang=s*turns*Math.PI*2,c=Math.cos(ang)*r,sn=Math.sin(ang)*r;
  pts.push(iso([a[0]+ax[0]*s+u[0]*c+v[0]*sn,a[1]+ax[1]*s+u[1]*c+v[1]*sn,a[2]+ax[2]*s+u[2]*c+v[2]*sn],P));}
 const d=pathOf(pts);
 return <g><path d={d} fill="none" stroke="var(--anatomy-shade-0)" strokeWidth={2.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
  <Line d={d} tone={tone}/></g>;
}
/** The engraved scale's middle points straight away from the viewer; a knob turns `span` degrees either side of it. */
export const awayAngle=(P:Projection)=>{const [vx,vy]=towardViewer(P);return Math.atan2(-vx,vy);};
/** The world direction (on a top face) of angle `a` in radialTicks' convention: (sin a, −cos a). */
const dirOf=(a:number):[number,number]=>[Math.sin(a),-Math.cos(a)];
export type KnobSpec={x:number;y:number;z:number;R:number;span?:number};
/** A knob's pointer angle for a value 0–1. */
export const knobAngle=(k:KnobSpec,P:Projection,v:number)=>{const span=(k.span??270)*Math.PI/180;return awayAngle(P)-span/2+span*Math.max(0,Math.min(1,v));};
/** Pointer (in the SVG's own pixels) → the knob's value 0–1, from the angle on the knob's top face. */
export function knobValue(k:KnobSpec,P:Projection,sx:number,sy:number){
 const [wx,wy]=toFloor(sx,sy,P,k.z+7.6),a=Math.atan2(wx-k.x,-(wy-k.y)),span=(k.span??270)*Math.PI/180;
 let rel=a-awayAngle(P);rel=Math.atan2(Math.sin(rel),Math.cos(rel));// −π…π from the middle of the scale
 return Math.max(0,Math.min(1,(rel+span/2)/span));
}
/** A knurled control knob on a top face at z: a collar, the knurled cap, an engraved scale round it, the pointer line. */
export function Knob({k,P,value,steps=10,active=false,children}:{k:KnobSpec;P:Projection;value:number;steps?:number;active?:boolean;children?:ReactNode}){
 const {x,y,z,R}=k,span=(k.span??270)*Math.PI/180,a0=awayAngle(P)-span/2,sc=radialTicks(x,y,R+6.4,steps*2,2,z,[1.6,3.2],P,a0,span);
 const a=knobAngle(k,P,value),[dx,dy]=dirOf(a),top=z+1.8+5.8,tip=iso([x+dx*(R-1.4),y+dy*(R-1.4),top],P),c=iso([x,y,top],P);
 return <g data-knob>
  <Line d={sc.minor} tone="lo"/><Line d={sc.major} tone="hi"/>
  {active&&<path d={ring(x,y,R+8.6,z,P,48)} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke"/>}
  <Solid paths={cylinder(x,y,R+2,z,1.8,P,40,.4)} tone="mid"/>
  <Solid paths={cylinder(x,y,R,z+1.8,5.8,P,44,.6)} tone="hi" lit={active} inner={<Line d={knurl(x,y,R,z+2.2,z+7.2,54,P,.2)} tone="faint"/>}/>
  <Line d={ring(x,y,R*.62,top,P,36)} tone="faint"/>
  <path d={`M${f1(c[0])} ${f1(c[1])}L${f1(tip[0])} ${f1(tip[1])}`} stroke="var(--accent)" strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
  <circle cx={f1(tip[0])} cy={f1(tip[1])} r={1.8} fill="var(--accent)"/>
  {children}
 </g>;
}
/** The value change for a drag along a part's screen path: tip(v) is where the part's handle is drawn for value v. */
export function alongPath(tip:(v:number)=>Flat,v0:number,dx:number,dy:number,eps=.01){
 const a=tip(v0),b=tip(v0+eps),gx=(b[0]-a[0])/eps,gy=(b[1]-a[1])/eps,g2=gx*gx+gy*gy||1;
 return v0+(dx*gx+dy*gy)/g2;
}
/** A see-through hit target that is a real control (focus, arrow keys, screen readers). r is in screen px. */
export function Hit({id,c,r,label,value,min,max,text,d}:{id:string;c?:Flat;r?:number;d?:string;label:string;value:number;min:number;max:number;text:string}){
 const common={'data-ctl':id,role:'slider',tabIndex:0,'aria-label':label,'aria-valuemin':min,'aria-valuemax':max,'aria-valuenow':Math.round(value*100)/100,'aria-valuetext':text,className:'iso-hit','data-hit':id};
 return d?<path d={d} {...common}/>:<circle cx={f1(c![0])} cy={f1(c![1])} r={r} {...common}/>;
}
/** A turned post (a cylinder on a collar) — the stand for gauges, staffs and rails. */
export function Post({x,y,z,r,h,P,tone='hi'}:{x:number;y:number;z:number;r:number;h:number;P:Projection;tone?:'hi'|'mid'}){
 return <g><Solid paths={cylinder(x,y,r*1.7,z,1.2,P,24,.3)} tone="mid"/><Solid paths={cylinder(x,y,r,z+1.2,h-1.2,P,20)} tone={tone} inner={<Line d={sideArc(x,y,r,z+h*.5,P,12)} tone="faint"/>}/></g>;
}
export const kScale=(P:Projection)=>cameraOf(P).k;
export {lineOnTop};
