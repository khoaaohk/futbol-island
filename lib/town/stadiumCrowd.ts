// West Stadium, phase 3b (Nov 12 2026, docs/stadium/PLAN.md): a crowd in the stands, heat-first.
// One InstancedMesh (1 draw call, no shadow pass) of tiny low-poly fans (a body and a head, 20 triangles) at seat positions:
// about a third of the 5,030 seats on desktop, fewer on phones and under heat-tier pressure (Battery saver: a handful). Built lazily
// the first time the player comes near; hidden beyond CROWD_RADIUS and frustum-culled by three when the bowl is off screen.
// Animation: on a goal only, a short bounce driven by two shared uniforms (no per-instance CPU work, nothing at all between goals).
// The fans' seats are a fixed shuffled order (sorted by a per-seat key), so a lower fill is simply a smaller instance count; the
// seats at each span's ends (by the aisles and the stand ends) stay free, and a shader uniform clears the fans round the player
// (their own seat, or where they walk along a row), so nobody sits in a fan.
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {effectiveTier} from '../graphics/heatTier';
import {STANDS,ROWS,ROW_DEPTH,SEAT_DEPTH,SEAT_TOP,rowHeight,spanSeats,standSpans,standWorld,standYaw,SEAT_PITCH} from './stadiumSeats';

/** The highest fill key ever shown (desktop, tier 0: about 36 % of the seats); the instance buffer holds exactly these fans. */
export const CROWD_MAX_FILL=.5;
/** The crowd shows within this distance of the stadium centre (m): the bowl's far stand is ~85 m from the centre. */
export const CROWD_RADIUS=150;
/** Triangles per fan: a body and a head, each a box without its bottom (2 × 10). */
export const FAN_TRIS=20;
/** The goal bounce (s) and the fans cleared round the player (m). */
export const CHEER_TIME=2.6,CLEAR_RADIUS=1.1;
/** Seated friends whose seats the crowd keeps clear (more than this many seated friends in view: the rest may share a fan). */
export const CLEAR_FRIENDS=8;

/** The fill key for this device and heat tier (lib/graphics/heatTier: 0 default … 4 lowest / Battery saver). About 0.72 × the
 *  key is the share of seats filled: desktop ~36 %, phone ~22 %, tier 2 ~16 / 9 %, saver ~5 %. */
export function crowdFill(phone:boolean,tier:number){
 if(tier>=4)return .07;if(tier>=2)return phone?.13:.22;if(tier>=1)return phone?.2:.35;return phone?.3:CROWD_MAX_FILL;
}
export type Fan={x:number;y:number;z:number;yaw:number;key:number;colour:string};
const hash=(a:number,b:number,c:number)=>{const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return s-Math.floor(s);};
const NEUTRAL=['#f4f1e6','#2b3a42','#e9b949','#7a4fa0'];
/** The filled seats, fullest first (sorted by key: a fill f takes the fans with key < f). Middle blocks and lower rows fill first. */
export function crowdSeats():Fan[]{
 const out:Fan[]=[];
 STANDS.forEach((s,si)=>{const yaw=standYaw(s),reach=Math.max(Math.abs(s.from),Math.abs(s.to));
  for(const [a0,a1] of standSpans(s).seats){const {n,start}=spanSeats(a0,a1);
   for(let k=1;k<n-1;k++){const sa=start+k*SEAT_PITCH;// k 0 and n-1: the seats by the aisle / stand end stay free
    for(let i=0;i<ROWS;i++){
     const w=.45+.4*(1-Math.abs(sa)/reach)+.15*(1-i/ROWS),h=hash(si,i,sa),key=h/w;if(key>=CROWD_MAX_FILL)continue;
     const p=standWorld(s,s.inner+i*ROW_DEPTH+SEAT_DEPTH-.04,sa),c=hash(sa,i,si+7);
     out.push({x:p.x,y:rowHeight(i)+SEAT_TOP,z:p.z,yaw,key,colour:c<.68?s.team[0]:c<.9?s.team[1]:NEUTRAL[Math.floor(c*97)%NEUTRAL.length]});
    }
   }
  }
 });
 return out.sort((p,q)=>p.key-q.key);
}
/** How many of the sorted fans a fill shows. */
export function crowdCount(fans:readonly Fan[],fill:number){let lo=0,hi=fans.length;while(lo<hi){const m=(lo+hi)>>1;if(fans[m].key<fill)lo=m+1;else hi=m;}return lo;}

/** A box without its bottom face (10 triangles), aHead marking the head for the skin tone. */
function part(w:number,h:number,d:number,y:number,head:number){
 const g=new T.BoxGeometry(w,h,d);g.translate(0,y+h/2,0);
 const idx=g.getIndex()!.array,keep:number[]=[];const bottom=g.groups[3];
 for(let i=0;i<idx.length;i++)if(i<bottom.start||i>=bottom.start+bottom.count)keep.push(idx[i]);
 g.setIndex(keep);g.clearGroups();g.deleteAttribute('uv');
 g.setAttribute('aHead',new T.Float32BufferAttribute(new Array(g.getAttribute('position').count).fill(head),1));return g;
}
export function fanGeometry(){const body=part(.4,.5,.3,0,0),head=part(.22,.24,.22,.52,1),g=mergeGeometries([body,head])!;body.dispose();head.dispose();return g;}

export function createStadiumCrowd(parent:T.Object3D,phone:boolean){
 let mesh:T.InstancedMesh|null=null,fans:Fan[]=[],cheer=0,shownFill=-1;
 const uniforms={uCheer:{value:0},uTime:{value:0},uClear:{value:new T.Vector3(0,0,-1)},uClearF:{value:Array.from({length:CLEAR_FRIENDS},()=>new T.Vector3(0,0,-1))}};
 function build(){
  fans=crowdSeats();
  const mat=new T.MeshLambertMaterial();
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,uniforms);
   sh.vertexShader=`attribute float aHead;\nuniform float uCheer;\nuniform float uTime;\nuniform vec3 uClear;\nuniform vec3 uClearF[${CLEAR_FRIENDS}];\n`+sh.vertexShader
    .replace('#include <color_vertex>',`#include <color_vertex>
 vec3 fanAt=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
 float fanH=fract(sin(dot(fanAt.xz,vec2(12.9898,78.233)))*43758.5453);
 vColor=mix(vColor,mix(vec3(.96,.78,.62),vec3(.42,.28,.2),fanH),aHead);`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
 transformed.y+=uCheer*max(0.,sin(uTime*13.+fanH*6.2832))*.3;
 transformed*=1.-step(distance(fanAt.xz,uClear.xy),uClear.z);
 for(int i=0;i<${CLEAR_FRIENDS};i++)transformed*=1.-step(distance(fanAt.xz,uClearF[i].xy),uClearF[i].z);`);
  };
  mat.customProgramCacheKey=()=>'stadium-crowd';
  mesh=new T.InstancedMesh(fanGeometry(),mat,fans.length);mesh.name='stadium-crowd';mesh.castShadow=mesh.receiveShadow=false;
  const m=new T.Matrix4(),q=new T.Quaternion(),one=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0),c=new T.Color();
  fans.forEach((f,i)=>{m.compose(new T.Vector3(f.x,f.y-.045,f.z),q.setFromAxisAngle(up,f.yaw),one);mesh!.setMatrixAt(i,m);mesh!.setColorAt(i,c.set(f.colour));});
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  // Bounds over every fan (the culling sphere covers the bowl; three culls the one draw when it is off screen).
  mesh.computeBoundingSphere();mesh.computeBoundingBox();mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  parent.add(mesh);
 }
 return {
  /** Each frame near the stadium: dc = the player's distance from the centre; (x, z, onStand) = where to keep fans away;
   *  friends = seats other players sit in (stadiumSeatShare remoteSeatSpots), kept clear too. */
  update(dc:number,x:number,z:number,onStand:boolean,dt:number,reduced:boolean,friends:readonly {x:number;z:number}[]=[]){
   const near=dc<CROWD_RADIUS;
   if(!near){if(mesh?.visible)mesh.visible=false;return;}
   if(!mesh)build();const me=mesh!;if(!me.visible)me.visible=true;
   const fill=crowdFill(phone,effectiveTier());if(fill!==shownFill){shownFill=fill;me.count=crowdCount(fans,fill);}
   const cl=uniforms.uClear.value;if(onStand){cl.set(x,z,CLEAR_RADIUS);}else if(cl.z>0)cl.z=-1;
   const cf=uniforms.uClearF.value;for(let i=0;i<CLEAR_FRIENDS;i++){const f=friends[i],v=cf[i];if(f)v.set(f.x,f.z,SEAT_PITCH*.75);else if(v.z>0)v.z=-1;}
   if(cheer>0){cheer=Math.max(0,cheer-dt);uniforms.uTime.value+=dt;uniforms.uCheer.value=reduced?0:Math.min(1,cheer/.6)*Math.min(1,(CHEER_TIME-cheer)/.15);}
   else if(uniforms.uCheer.value)uniforms.uCheer.value=0;
  },
  /** A goal: the stands bounce for CHEER_TIME (the frames run anyway: the match is on). */
  cheer(){cheer=CHEER_TIME;},
  get cheering(){return cheer>0;},
  get mesh(){return mesh;},get count(){return mesh?mesh.count:0;},
  dispose(){if(!mesh)return;mesh.removeFromParent();mesh.geometry.dispose();(mesh.material as T.Material).dispose();mesh.dispose();mesh=null;},
 };
}
export type StadiumCrowd=ReturnType<typeof createStadiumCrowd>;
