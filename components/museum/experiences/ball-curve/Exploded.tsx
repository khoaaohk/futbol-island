'use client';
import {memo,useId,useMemo} from 'react';
import {cylinder,depthOf,iso,lineOnTop,pathOf,ring,sideArc,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
import {Line,Solid,basePlate,fit,labelPlate,painted,type Item} from '../anatomy/paper-kit';
import {Sphere} from '../anatomy/bench';
import {Post} from '../free-kick-wall/rig-parts';
import {ballLines,shellOutline,sphereRadius} from './ballgeom';

/**
 * ball-curve · Fig. 3, THE BALL TAKEN APART (Oct 14 2026 redo; the breakdown, like the stadiums). A big 32-panel ball on a
 * display stand comes apart in layers as you slide: the top half of the cover lifts away (its panels and seams), the rubber
 * bladder rises out of the bottom half, its valve rises above it, and a tape measure stays round the bowl (the size). Each part
 * is numbered with a leader line and one line of why (content.ts). Drag the ball to turn it.
 */
export type BallPart='panels'|'seams'|'bladder'|'valve'|'size';
export const BALL_PARTS:readonly BallPart[]=['panels','seams','bladder','valve','size'];
const R=40,C:Point3=[0,0,58],PLATE={x:-74,y:-74,w:148,d:148,r:16};
/** How far each layer rises (world units) when fully apart. */
export const LIFT={cap:116,bladder:30,valve:46};
export function useBallProjection(w:number,h:number,top:number,bottom:number,wide:boolean){
 return useMemo(()=>{if(!w||!h)return null;const right=wide?Math.min(330,w*.3):0;
  const pts:Point3[]=[[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[0,0,C[2]+R+LIFT.cap+4],[R,R,C[2]],[-R,-R,C[2]]];
  const P=fit(pts,w-right,h,{pad:wide?30:6,top,bottom:bottom+(wide?0:60),azimuth:45,elevation:wide?24:26});return P;},[w,h,top,bottom,wide]);
}
export function partAnchors(P:Projection,e:number,yaw:number):Record<BallPart,Flat>{
 const cap=C[2]+LIFT.cap*e,bl=C[2]+LIFT.bladder*e,Rs=sphereRadius(R,P);void yaw;
 const [cx,capY]=iso([0,0,cap],P),[,blY]=iso([0,0,bl],P),[,vY]=iso([0,0,C[2]+R*.9+LIFT.valve*e+4],P),rim=iso([0,R,C[2]],P);
 return {panels:[cx+Rs*.5,capY-Rs*.6],seams:[cx-Rs*.62,capY-Rs*.42],bladder:[cx+Rs*.62,blY+Rs*.1],valve:[cx+4,vY],size:[rim[0]-Rs*.2,rim[1]+Rs*.12]};
}
export function Exploded({P,w,h,e,yaw,focus}:{P:Projection;w:number;h:number;e:number;yaw:number;focus:BallPart|null}){
 const id=useId().replace(/:/g,'');
 const items:Item[]=[],spin={yaw,tilt:.36},Rs=sphereRadius(R,P);
 const capC:Point3=[0,0,C[2]+LIFT.cap*e],blC:Point3=[0,0,C[2]+LIFT.bladder*e],vz=C[2]+R*.9+LIFT.valve*e;
 // the bowl: its outside (seams on the lower half), its hollow inside, the rim, the tape measure round it
 const bowl=shellOutline(C,R,P,false),[bx,by]=iso(C,P),inner=Math.max(0,1-e*4);
 const lower=ballLines(C,R,P,spin,{keep:n=>n[2]<-.02});
 items.push({k:1,id:'bowl',n:<g data-layer="bowl">
  <clipPath id={id+'b'}><path d={bowl.d}/></clipPath>
  <g clipPath={`url(#${id}b)`}><Sphere c={[bx,by]} r={Rs} color="#f4f3ee" edge={false} glint={false}/></g>
  <ellipse cx={bowl.rim.cx} cy={bowl.rim.cy} rx={bowl.rim.rx} ry={bowl.rim.ry} fill="#cfcdc4" opacity={1-inner}/>
  <ellipse cx={bowl.rim.cx} cy={bowl.rim.cy} rx={bowl.rim.rx*.95} ry={bowl.rim.ry*.95} fill="#bdbab0" opacity={(1-inner)*.8}/>
  <path d={lower.pentagons} fill="#3a3a3c" opacity={.88} clipPath={`url(#${id}b)`}/><path d={lower.seams} className="iso-line" data-tone="mid" fill="none"/>
  <path d={bowl.d} className="iso-line" data-tone={focus==='size'?'lit':'hi'} fill="none"/>
  <path d={ringPath(C,R*1.01,P,true)} className="bc-tape" data-on={focus==='size'||undefined}/>
 </g>});
 // the bladder: a rubber sphere (latex or butyl), lifting out of the bowl
 const [blx,bly]=iso(blC,P);
 if(e>.02)items.push({k:2,id:'bladder',n:<g data-layer="bladder" opacity={Math.min(1,e*3)}><Sphere c={[blx,bly]} r={Rs*.9} color={focus==='bladder'?'#e2b07a':'#d9b083'} edge/>
  <path d={ringPath(blC,R*.9,P,false)} fill="none" stroke="#b58a5e" strokeWidth={.8} vectorEffect="non-scaling-stroke"/></g>});
 // the valve: a small rubber plug on the bladder's top, rising above it
 if(e>.02)items.push({k:3,id:'valve',n:<g data-layer="valve" opacity={Math.min(1,e*3)}>
  {e>.1&&<path d={pathOf([iso([0,0,C[2]+R*.9+LIFT.bladder*e],P),iso([0,0,vz],P)])} className="bc-valve-line"/>}
  <Solid paths={cylinder(0,0,4.4,vz,5,P,28,.6)} tone="hi" className={focus==='valve'?'acc':'dark'}/><Solid paths={cylinder(0,0,1.8,vz+5,3,P,16)} tone="hi" className="dark"/></g>});
 // the top cap: panels and seams, lifting away
 const cap=shellOutline(capC,R,P,true),[cx,cy]=iso(capC,P),upper=ballLines(capC,R,P,spin,{keep:n=>n[2]>.02});
 items.push({k:4,id:'cap',n:<g data-layer="cap">
  <clipPath id={id+'c'}><path d={cap.d}/></clipPath>
  <g clipPath={`url(#${id}c)`}><Sphere c={[cx,cy]} r={Rs} color="#f7f7f3" edge={false}/></g>
  <path d={upper.pentagons} fill={focus==='panels'?'var(--accent)':'#3a3a3c'} opacity={.9} clipPath={`url(#${id}c)`}/>
  <path d={upper.seams} className={focus==='seams'?'bc-seam-on':'iso-line'} data-tone="mid" fill="none"/>
  <path d={cap.d} className="iso-line" data-tone="hi" fill="none"/>
  {e>.02&&<ellipse cx={cap.rim.cx} cy={cap.rim.cy} rx={cap.rim.rx*.96} ry={cap.rim.ry*.96} fill="none" stroke="var(--anatomy-faint)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>}
 </g>});
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">
  <BallStand P={P}/>
  {painted(items)}
 </svg>;
}
/** The near half (front) or the whole of a horizontal ring round the ball at its centre height. */
function ringPath(c:Point3,r:number,P:Projection,front:boolean){const pts:Flat[]=[],n=48;
 // the front half faces the viewer: round the direction (cos 45°, sin 45°) ± 90° for this 45° camera
 for(let i=0;i<=n;i++){const a=front?-Math.PI/4+Math.PI*i/n:Math.PI*2*i/n;pts.push(iso([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,c[2]],P));}
 return pathOf(pts,!front);}
const BallStand=memo(function BallStand({P}:{P:Projection}){
 const items=useMemo(()=>{const out:Item[]=[...basePlate('plate',PLATE,P,{h:10,feet:8,inset:20})];
  const tk:string[]=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r1=54,r0=i%4===0?50:52;tk.push(lineOnTop([Math.cos(a)*r0,Math.sin(a)*r0],[Math.cos(a)*r1,Math.sin(a)*r1],2.2,P));}
  out.push({k:-5e6,id:'turn',n:<g><Solid paths={cylinder(0,0,56,0,2.2,P,72,.5)} tone="hi" inner={<Line d={sideArc(0,0,56,1.1,P,48)} tone="faint"/>}/><Line d={tk.join('')} tone="lo"/>
   <Line d={ring(0,0,46,2.2,P,64)} tone="faint"/></g>});
  out.push({k:-4e6,id:'post',n:<g><Post x={0} y={0} z={2.2} r={3} h={C[2]-R*.86-2.2} P={P}/><Solid paths={cylinder(0,0,14,C[2]-R*.93,2.4,P,48,.5)} tone="mid"/></g>});
  out.push(labelPlate('label',{x:30,y:44,w:24,d:10,r:1},0,P,-3e6));
  void depthOf;return out;},[P]);
 return <g data-static>{painted(items)}</g>;
});
