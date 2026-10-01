// Manta rays round the smaller islands (Sep 30 2026, user: "Add manta rays swimming around the smaller islands").
// Pure data (no three.js): closed, smooth glide loops in open water round Coral Cay and both sandbars. The 3D build and its
// heat rules live in lib/graphics/cayMantas.ts; tests/manta-rays.cjs checks every loop stays in open water, clear of the
// islands' shallows, the causeway and its sharks, the buoy and the Deep Sea Boat, and inside the flight zone.
import {CAY_CENTER,CAY_SHORE,SANDBARS,type CayPoint} from './coralCay';

export type MantaIsland='cay'|'starfish'|'turtle';
export type MantaLoop={id:string;island:MantaIsland;points:CayPoint[];speed:number;
 /** Dropped on phones (heat): each island keeps at least 2 mantas everywhere. */desktopOnly?:boolean};

/** Farthest distance from (cx, cz) to the outline along the ray at angle `a` (the island's edge in that direction). */
function rayRadius(poly:CayPoint[],cx:number,cz:number,a:number){
 const dx=Math.cos(a),dz=Math.sin(a);let best=0;
 for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],ex=q.x-p.x,ez=q.z-p.z,den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
  const t=((p.x-cx)*ez-(p.z-cz)*ex)/den,u=((p.x-cx)*dz-(p.z-cz)*dx)/den;if(t>0&&u>=0&&u<=1)best=Math.max(best,t);}
 return best;
}
/** Closed Catmull-Rom ring through the anchors, `seg` samples per span. */
function ring(anchors:CayPoint[],seg:number):CayPoint[]{
 const n=anchors.length,out:CayPoint[]=[],g=(k:number)=>anchors[(k+n)%n];
 for(let i=0;i<n;i++)for(let j=0;j<seg;j++){const t=j/seg,p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
  const at=(k:'x'|'z')=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
  out.push({x:at('x'),z:at('z')});}
 return out;
}
/**
 * A long, lazy glide loop hugging one stretch of coast: out along the near offset `dIn` (metres beyond the island's edge,
 * smoothed over ±`window` radians so coves don't pull it in and headlands never clip it), round a wide turn, and back
 * along the far offset `dOut`. Angles a0 → a1 are bearings from the island centre (atan2(z, x)).
 */
function coastLoop(id:string,island:MantaIsland,poly:CayPoint[],c:CayPoint,a0:number,a1:number,dIn:number,dOut:number,speed:number,window=.22,desktopOnly=false):MantaLoop{
 const edge=(a:number)=>{let r=0;for(let k=-4;k<=4;k++)r=Math.max(r,rayRadius(poly,c.x,c.z,a+k*window/4));return r;};
 const at=(a:number,d:number)=>{const r=edge(a)+d;return {x:c.x+Math.cos(a)*r,z:c.z+Math.sin(a)*r};};
 const steps=Math.max(3,Math.round(Math.abs(a1-a0)/.16)),anchors:CayPoint[]=[];
 for(let i=0;i<=steps;i++)anchors.push(at(a0+(a1-a0)*i/steps,dIn+.8*Math.sin(i*1.3)));
 const over=(a1>a0?1:-1)*.05;anchors.push(at(a1+over,(dIn+dOut)/2));
 for(let i=steps;i>=0;i--)anchors.push(at(a0+(a1-a0)*i/steps,dOut+1*Math.sin(i*.9+1)));
 anchors.push(at(a0-over,(dIn+dOut)/2));
 return {id,island,points:ring(anchors,4),speed,desktopOnly};
}
const D=Math.PI/180;
/** Sandbar loops wrap the seaward side, away from the causeway (the road bends away from both sandbars there). */
function sandbarLoops(index:0|1){
 const s=SANDBARS[index],far=s.side>0?90*D:-90*D,c={x:s.x,z:s.z},island=s.id as MantaIsland;
 return [coastLoop(`${s.id}-inner`,island,s.outline,c,far-78*D,far+78*D,11,16,1.35,.3),
  coastLoop(`${s.id}-outer`,island,s.outline,c,far+68*D,far-68*D,27,33,1.55,.3)];
}
/**
 * Coral Cay: three stretches of coast, never the west side where the causeway lands. North shore, Sharks Beach (the
 * north-east bay by the court) and the south cove. Phones keep two (heat): Sharks Beach and the south cove.
 */
export const MANTA_LOOPS:MantaLoop[]=[
 coastLoop('cay-north','cay',CAY_SHORE,CAY_CENTER,-132*D,-88*D,16,24,1.5,.22,true),
 coastLoop('cay-sharks-beach','cay',CAY_SHORE,CAY_CENTER,-14*D,-66*D,15,23,1.4),
 coastLoop('cay-south','cay',CAY_SHORE,CAY_CENTER,48*D,112*D,15,23,1.6),
 ...sandbarLoops(0),...sandbarLoops(1),
];
export const MANTA_ISLANDS:MantaIsland[]=['cay','starfish','turtle'];
/** Mantas drawn per island: every loop on desktop, desktop-only loops dropped on phones. */
export const mantaLoopsFor=(island:MantaIsland,phone:boolean)=>MANTA_LOOPS.filter(l=>l.island===island&&!(phone&&l.desktopOnly));
