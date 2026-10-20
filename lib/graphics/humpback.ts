// The humpback whale (Oct 20 2026, user: "a humpback whale ... a gentle low-poly procedural humpback"): the open-sea whale in
// South Bay and off Summit Isle's south-east (lib/town/seaLifeAreas.ts OPEN_SEA_WHALE_LOOPS, kind 'humpback').
//
// Look: a long (14 m), dark, slender whale cruising with its back awash: a flat knobbly head, a small dorsal fin on a low hump,
// very long pale pectoral flippers (the humpback's signature) and wide horizontal flukes. Every so often (a slow ~46 s cycle) it
// tips its nose down and lifts its flukes clear of the water, then lowers them: a tail lift, never a breach (the body stays in).
//
// Heat: the whale-shark kit (whaleShark.ts createWhaleShark: the same loop follower, ride, caps, sleep and culling rules). ONE
// geometry (~300 triangles, no texture, vertex colours), ONE material shared by every humpback; the fluke beat and the tail lift
// are vertex-shader terms on the one time uniform, so the lift costs nothing on the CPU.
import * as T from 'three';

/** The humpback swims at the surface: its back WHALE-style depth below the water line (m), the hump fin breaks the surface. */
export const HUMP_DEPTH={mean:.14,bob:.1,backTop:.86,finTop:1.12,finX:-2.05,rate:.3} as const;
/** The tail lift's cycle (s on the shared clock): up over 5 s from the start, down by 14 s (ids in tests/sea-life-areas.cjs). */
export const HUMP_LIFT={cycle:46,rise:5,hold:9,fall:14,height:2.3} as const;
/** Body stations, nose (x 6.6) to the tail stock (x -5.3): half-width, back height, belly depth (m). Long and slender. */
const STATIONS:[x:number,w:number,ht:number,hb:number][]=[[6.6,.35,.18,.24],[6.15,.78,.4,.55],[5.3,1.08,.56,.8],[4.2,1.32,.7,1],[3,1.46,.8,1.1],[1.8,1.5,.86,1.12],[.6,1.45,.86,1.05],
 [-.6,1.3,.8,.95],[-1.8,1.06,.74,.8],[-3,.76,.6,.62],[-4,.5,.48,.45],[-4.8,.32,.38,.32],[-5.3,.22,.28,.22]];
const RING=10;
// Charcoal back to a paler grey belly (the belly hides in the sea); flippers pale, flukes dark.
const RING_COLOR=['#23272d','#272c33','#2f353d','#4a525b','#7d868e','#a3abb2','#7d868e','#4a525b','#2f353d','#272c33'];

/** Local +x forward, y up (0 = the body axis), z across. Non-indexed, vertex colours, smooth ring normals (the veil's fade). */
export function humpbackGeometry(){
 const pos:number[]=[],col:number[]=[],nor:number[]=[],c=new T.Color(),nA=new T.Vector3(),nB=new T.Vector3(),colors=RING_COLOR.map(h=>new T.Color(h));
 const v=(p:number[],cl:T.Color,n:number[])=>{pos.push(p[0],p[1],p[2]);col.push(cl.r,cl.g,cl.b);nor.push(n[0],n[1],n[2]);};
 const tri=(a:number[],b:number[],d:number[],color:string)=>{c.set(color);nA.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);nB.set(d[0]-a[0],d[1]-a[1],d[2]-a[2]);nA.cross(nB).normalize();const n=[nA.x,nA.y,nA.z];v(a,c,n);v(b,c,n);v(d,c,n);};
 const two=(a:number[],b:number[],d:number[],color:string)=>{tri(a,b,d,color);tri(a,d,b,color);};
 // A flatter top on the head (the humpback's long rostrum), rounder behind.
 const R=(i:number,k:number)=>{const [x,w,ht,hb]=STATIONS[i],a=k*Math.PI*2/RING,s=Math.sin(a),co=Math.cos(a),e=x>3.5?.7:.9;
  return [x,Math.sign(co)*Math.abs(co)**e*(co>=0?ht:hb),Math.sign(s)*Math.abs(s)**e*w];};
 const N=(i:number,k:number)=>{const [,w,ht,hb]=STATIONS[i],p=R(i,k),h=p[1]>=0?ht:hb;nA.set(0,p[1]/(h*h),p[2]/(w*w)).normalize();return [nA.x,nA.y,nA.z];};
 for(let i=0;i<STATIONS.length-1;i++)for(let k=0;k<RING;k++){const k2=(k+1)%RING,a=R(i,k),b=R(i,k2),d=R(i+1,k2),e=R(i+1,k);
  v(a,colors[k],N(i,k));v(d,colors[k2],N(i+1,k2));v(b,colors[k2],N(i,k2));v(a,colors[k],N(i,k));v(e,colors[k],N(i+1,k));v(d,colors[k2],N(i+1,k2));}
 for(let k=0;k<RING;k++){const k2=(k+1)%RING;v([6.85,-.05,0],colors[k],[1,0,0]);v(R(0,k2),colors[k2],N(0,k2));v(R(0,k),colors[k],N(0,k));}
 {const n=STATIONS.length-1;for(let k=0;k<RING;k++){const k2=(k+1)%RING;v([-5.4,0,0],colors[k],[-1,0,0]);v(R(n,k),colors[k],N(n,k));v(R(n,k2),colors[k2],N(n,k2));}}
 // The long pale flippers: a third of the body, swept back and a little down, with a scalloped leading edge (two panels).
 for(const s of [1,-1]){const root=[3.7,-.45,1.2*s],rootB=[2.5,-.55,1.22*s],mid=[1.6,-.95,3.1*s],tip=[-.4,-1.25,4.7*s],midB=[1.1,-.85,2.7*s];
  two(root,mid,rootB,'#d3d9dc');two(rootB,mid,midB,'#c4cbcf');two(mid,tip,midB,'#d3d9dc');}
 // The small dorsal fin on its low hump.
 two([-1.35,.74,0],[-1.95,HUMP_DEPTH.finTop,0],[-2.25,HUMP_DEPTH.finTop-.06,0],'#23272d');two([-1.35,.74,0],[-2.25,HUMP_DEPTH.finTop-.06,0],[-2.75,.64,0],'#272c33');
 // The flukes: wide and HORIZONTAL (a whale, not a fish), a notch in the middle of the trailing edge.
 for(const s of [1,-1]){const stock=[-5.2,0,0],lead=[-6,0,1.05*s],tip=[-7.05,.04,2.65*s],trail=[-7.35,0,2.05*s],notch=[-6.75,0,.18*s],mid=[-6.55,0,0];
  two(stock,lead,mid,'#2a2f36');two(lead,tip,trail,'#2a2f36');two(lead,trail,notch,'#30363e');two(lead,notch,mid,'#2a2f36');}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 // Room for the flippers' span and the lifted flukes (no per-frame bounds work).
 g.boundingSphere=new T.Sphere(new T.Vector3(-.3,.6,0),8.6);
 return g;
}

/** The vertex terms: an up-and-down fluke beat (whales beat vertically), and the tail lift on a slow cycle: the rear rises and
 *  the nose tips down a little, eased in and out (smoothsteps), the beat stilled while the flukes are up. */
export const HUMP_SWIM=`
vWhaleLocal=transformed;
float hbC=mod(uWhaleTime,${HUMP_LIFT.cycle.toFixed(1)});
float hbLift=smoothstep(0.,${HUMP_LIFT.rise.toFixed(1)},hbC)*smoothstep(${HUMP_LIFT.fall.toFixed(1)},${HUMP_LIFT.hold.toFixed(1)},hbC);
float hbBack=smoothstep(.5,-7.4,transformed.x);
transformed.y+=(1.-hbLift)*hbBack*hbBack*.32*sin(uWhaleTime*.9-transformed.x*.25);
transformed.y+=hbLift*(${HUMP_LIFT.height.toFixed(2)}*hbBack*hbBack-.55*smoothstep(1.5,6.8,transformed.x));
transformed.x+=hbLift*.35*hbBack;`;
/** The knobs on the head (pale tubercles, object space) and two small eyes; the rest is the vertex colours. */
export const HUMP_PATTERN=`
{
 vec3 p=vWhaleLocal;
 vec2 q=vec2(p.x,p.z)/.42,id=floor(q),f=fract(q)-.5;
 float knob=smoothstep(.22,.1,length(f))*step(.35,wsHash(id))*step(3.6,p.x)*step(.25,p.y);
 vec3 shade=mix(diffuseColor.rgb,vec3(.34,.37,.4),knob*.55);
 float eye=smoothstep(.13,.07,length(vec2(p.x-4.65,abs(p.z)-1.24)))*step(-.3,p.y)*step(p.y,.2);
 diffuseColor.rgb=mix(shade,vec3(.03,.03,.04),eye*.8);
}`;
