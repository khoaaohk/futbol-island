import * as T from 'three';
import {DIVE_BALL_CHEST_Y,DIVE_BALL_FIND,DIVE_BALL_R,diveBallFor,type DiveBallLook} from '../town/water/diveBalls';
import {diveFloor,type DiveSpot} from '../town/water/diveSpots';

/**
 * The zone's hidden explore ball (Oct 21 2026; lib/town/water/diveBalls.ts): ONE small vertex-coloured mesh per room (one draw, no
 * textures), its look painted per vertex from the zone's `look`. It rests in the zone's open treasure chest (Oct 25 2026) with a slow roll and a soft shimmer (the
 * emissive breathes now and then: findable, not obvious; steady in lite / reduced motion), and when picked up it spins up, rises
 * and shrinks away into the bag (≈ 1 s). Nothing is allocated per frame. Built with the room, freed by the room's dispose (its
 * scene traverse), so it costs nothing between dives.
 */
const PHI=(1+Math.sqrt(5))/2;
/** The 12 icosahedron directions: a classic ball's pentagon centres. */
const ICO=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]].map(v=>new T.Vector3(...v as [number,number,number]).normalize());
const C=(h:string)=>new T.Color(h);
const hash=(x:number,y:number,z:number)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
/** The nearest and second-nearest pentagon centres' dot products (for panels and seams). */
function near2(n:T.Vector3){let a=-2,b=-2,ai=0;ICO.forEach((v,i)=>{const d=n.dot(v);if(d>a){b=a;a=d;ai=i;}else if(d>b)b=d;});return {a,b,ai};}

/** The look's colour at a unit normal. Each look is a different ball, all clearly footballs. */
export function diveBallPaint(look:DiveBallLook,n:T.Vector3,out:T.Color){
 const {a,b,ai}=near2(n),seam=a-b<.02,pent=a>.93;
 switch(look){
  case 'leather':{// an old brown leather ball: long panels, dark seams, a laced slot and two lighter patches
   const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z),s=Math.min(Math.abs(ax-ay),Math.abs(ay-az),Math.abs(ax-az));
   out.copy(C('#8a5a32')).multiplyScalar(.85+.2*hash(Math.round(n.x*6),Math.round(n.y*6),Math.round(n.z*6)));
   if(s<.05)out.set('#3e2614');if(n.y>.85&&Math.abs(n.x)<.08)out.set(Math.round(n.z*20)%2?'#e8d8b0':'#3e2614');
   if(n.distanceTo(new T.Vector3(.7,.1,.7).normalize())<.25||n.distanceTo(new T.Vector3(-.6,-.5,.62).normalize())<.2)out.set('#b07a48');return out;}
  case 'classic':// black-and-white panels with a faint green tint from the old pitch
   return out.set(pent?'#1d2420':seam?'#9aa8a0':'#f4f6f0');
  case 'barnacle':// sea-green panels crusted with pale barnacles
   out.set(pent?'#2f5a46':'#8fb89a');if(seam)out.set('#4f6f5a');if(hash(Math.round(n.x*14),Math.round(n.y*14),Math.round(n.z*14))>.86)out.set('#e8e2d2');return out;
  case 'meadow':// sand-coloured with a sweeping seagrass-green swirl
   out.set('#ead9b0');if(Math.sin(Math.atan2(n.z,n.x)*3+n.y*4)>.55)out.set('#5aa652');if(seam)out.set('#b9a87e');return out;
  case 'moon':// deep blue night with lavender pentagons and tiny star dots (it glows a little more)
   out.set(pent?'#c8b8ff':'#2a3a78');if(seam)out.set('#8f9ad8');if(!pent&&hash(Math.round(n.x*18),Math.round(n.y*18),Math.round(n.z*18))>.93)out.set('#ffffff');return out;
  case 'stitched':// a white hand-stitched ball: orange and navy pentagons, every seam a row of stitches
   if(pent)return out.set(ai%2?'#f08a24':'#1e3a78');
   if(a-b<.03)return out.set(Math.sin((n.x+n.y*1.3+n.z*.7)*90)>0?'#c8c8c8':'#ffffff');return out.set('#fbfbf6');
  case 'shell':// turtle-shell plates: green hexagons in two shades, golden seams
   if(seam)return out.set('#d9b34a');return out.set(pent?'#3f7f4a':ai%3===0?'#6aa543':'#5a9a50');
 }
 return out;
}

export function addDiveBall(scene:T.Scene,spot:DiveSpot,o:{found:readonly string[];lite:boolean;reduced:boolean}){
 const def=diveBallFor(spot.id);if(!def||o.found.includes(DIVE_BALL_FIND))return null;
 const g=new T.IcosahedronGeometry(DIVE_BALL_R,o.lite?3:4),pos=g.getAttribute('position'),cols=new Float32Array(pos.count*3),n=new T.Vector3(),c=new T.Color();
 for(let i=0;i<pos.count;i++){n.fromBufferAttribute(pos,i).normalize();diveBallPaint(def.look,n,c);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(cols,3));
 const glow=def.look==='moon'?.32:.16,mat=new T.MeshLambertMaterial({vertexColors:true,emissive:'#fff6d8',emissiveIntensity:glow});mat.name='dive-hidden-ball';
 const mesh=new T.Mesh(g,mat);mesh.name='dive-hidden-ball';
 const homeY=diveFloor(def.x,def.z,spot.floor)+DIVE_BALL_CHEST_Y;/* in the open treasure chest (diveRoom.ts draws it at the ball's x, z) */mesh.position.set(def.x,homeY,def.z);mesh.rotation.set(.4,def.x,.2);scene.add(mesh);
 const still=o.lite||o.reduced;let upT=-1;
 return {mesh,
  /** One frame: the slow roll and the shimmer (a brief brightening every few seconds), or the pick-up while it plays. */
  frame(t:number,dt:number){
   if(!mesh.visible)return;
   if(upT>=0){upT+=dt;const k=Math.min(1,upT/1.1);mesh.rotation.y+=dt*(4+14*k);mesh.position.y=homeY+k*k*1.3+Math.sin(k*Math.PI)*.25;mesh.scale.setScalar(Math.max(.01,1-k*k));
    mat.emissiveIntensity=glow+.9*Math.sin(k*Math.PI);if(k>=1){mesh.visible=false;upT=-1;}return;}
   if(still)return;
   mesh.rotation.y+=dt*.15;const p=Math.max(0,Math.sin(t*1.7+def.x));mat.emissiveIntensity=glow+.35*p*p*p*p*p*p;
  },
  /** Picked up: the spin-up into the bag. */
  collect(){if(mesh.visible&&upT<0)upT=0;},
 };
}
export type DiveHiddenBall=ReturnType<typeof addDiveBall>;
