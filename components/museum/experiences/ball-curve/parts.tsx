'use client';
import {iso,pathOf,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
import {Ball} from '../anatomy/paper-kit';
import {ballLines,sphereRadius,type Keep,type Spin} from './ballgeom';

/**
 * ball-curve · drawn parts shared by the three figures (Oct 14 2026 redo): the 32-panel ball (a shaded sphere, its seams and
 * its dark pentagons, turned by its spin) and a flat accent arrow lying on a horizontal plane (the push on the ball).
 */
export function BigBall({c,r,P,spin,keep,edge='hi',shade=true}:{c:Point3;r:number;P:Projection;spin:Spin;keep?:Keep;edge?:'hi'|'lit'|'mid';shade?:boolean}){
 const [cx,cy]=iso(c,P),R=sphereRadius(r,P),L=ballLines(c,r,P,spin,{keep,steps:R>40?8:5});
 return <g data-big-ball>
  {shade&&<Ball cx={cx} cy={cy} r={R} seams={false} edge={edge}/>}
  <path d={L.pentagons} fill="#3a3a3c" opacity={.88}/>
  <path d={L.seams} className="iso-line" data-tone="mid" fill="none"/>
  {shade&&<circle cx={cx-R*.34} cy={cy-R*.36} r={R*.22} fill="#ffffff" opacity={.35}/>}
 </g>;
}
/** A flat arrow on the plane z, from a to b (world), `w` world units wide: the push on the ball, or the way the air goes. */
export function FlatArrow({a,b,z,w,P,className='bc-push'}:{a:[number,number];b:[number,number];z:number;w:number;P:Projection;className?:string}){
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<.5)return null;
 const ux=dx/l,uy=dy/l,nx=-uy,ny=ux,head=Math.min(l*.55,w*2.6),hw=w*1.5,s=l-head;
 const P3=(u:number,v:number):Flat=>iso([a[0]+ux*u+nx*v,a[1]+uy*u+ny*v,z],P);
 return <path className={className} d={pathOf([P3(0,-w/2),P3(s,-w/2),P3(s,-hw),P3(l,0),P3(s,hw),P3(s,w/2),P3(0,w/2)],true)}/>;
}
