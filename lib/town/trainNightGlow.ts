/** Island Line night lights (POLISH 3, owner shot 59, Nov 24 2026): every train's night glow in ONE additive instanced draw that
 *  reuses the street lamps' light-pool material (world.ts poolMaterial: the 32 px warm radial texture, additive, no depth write).
 *  Per car: a warm wash over each side's window band and a warm spill on the ground (or the platform top at a station) beside it.
 *  Per train: two bright headlamp halos and three beam pools on the track 9-19 m ahead of the leading cab (each on the track's own
 *  tangent, so the beam follows the curve), the beam on both tunnel walls while it is inside the tunnel, two red tail lamps on the rear
 *  cab and an amber halo over each destination board. Only quads: no scene light, no shadow caster, no new shader (the material's
 *  instanceColor variant). Every colour is scaled by the shared night factor (MACHINE_NIGHT, eased), so the lights come up through
 *  dusk; by day the mesh is hidden (0 draws). Night: +1 draw for all trains together. */
import * as T from 'three';
import {HALF_W} from './trainCarModel';

/** Car-local window glow quads: z centres along the car, the band's height and centre (m). */
const WIN_Z=[-4.3,-1.45,1.45,4.3],WIN_LEN=3.9,WIN_H=1.35,WIN_Y=2.6;
/** Instances per train: windows (4 × 2 sides × 2 cars) + spill (2 × 2) + head 2 + tail 2 + boards 2 + beam 3 + tunnel walls 6. */
export const GLOW_PER_TRAIN=4*2*2+4+2+2+2+3+6;
/** Colours (linear, before the night factor; additive, so > 1 saturates toward white in the halo's core). */
const C={win:[1.3,.8,.38],spill:[.95,.66,.36],platform:[1.1,.76,.42],head:[2.6,2.35,1.9],beam:[1.25,1.1,.85],wall:[1.05,.92,.7],tail:[2.4,.18,.1],board:[1.4,.8,.25]} as const;
const Y_UP=new T.Vector3(0,1,0);

export function createTrainNightGlow(trains:number){
 const cap=trains*GLOW_PER_TRAIN,geo=new T.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
 const mesh=new T.InstancedMesh<T.PlaneGeometry,T.Material>(geo,new T.MeshBasicMaterial({visible:false}),cap);mesh.name='train-night-glow';
 mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(cap*3),3).setUsage(T.DynamicDrawUsage);
 mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;mesh.visible=false;mesh.count=0;mesh.renderOrder=3;
 let n=0,k=0,ready=false;const cam=new T.Vector3(),m=new T.Matrix4(),l=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3(),d=new T.Vector3(),ax=new T.Vector3();
 const col=mesh.instanceColor.array as Float32Array;
 const put=(mat:T.Matrix4,c:readonly number[],w:number)=>{if(n>=cap||w<=.003)return;mesh.setMatrixAt(n,mat);const o=n*3,f=k*w;col[o]=c[0]*f;col[o+1]=c[1]*f;col[o+2]=c[2]*f;n++;};
 /** Rotation taking the plane's normal (+y) to the car-local side x = sg. */
 const SIDE=[new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI/2)];
 /** A halo facing the camera at car-local (x, y, z), pulled 0.35 m toward the camera (never through the cab face); `face`: how much the
  *  lamp looks at the camera along the car's local +z (a lamp is not seen from behind). */
 const halo=(cm:T.Matrix4,x:number,y:number,z:number,size:number,c:readonly number[],w:number)=>{
  p.set(x,y,z).applyMatrix4(cm);d.subVectors(cam,p);const dist=d.length();if(dist<.5)return;d.multiplyScalar(1/dist);
  const e=cm.elements;ax.set(e[8],e[9],e[10]).normalize();const f=d.dot(ax),face=Math.max(0,Math.min(1,(f+.15)/.55));if(face<=0)return;
  p.addScaledVector(d,.35);q.setFromUnitVectors(Y_UP,d);s.set(size,1,size);m.compose(p,q,s);put(m,c,w*face*face);};
 return {mesh,
  /** The street lamps' light-pool material (world.ts), set once after it exists; until then nothing is drawn. */
  use(mat:T.Material){(mesh.material as T.Material).dispose();mesh.material=mat;ready=true;},
  get ready(){return ready;},
  /** Start a frame: night 0 … 1 (eased), the camera's world position. False: nothing to draw (day, or no material yet). */
  begin(night:number,camPos:T.Vector3){n=0;k=night;cam.copy(camPos);return ready&&night>.01;},
  /** One car (its matrix, origin on the rail top): the window washes both sides, the ground spill (platformSide: −1 / +1 car-local
   *  side with a platform beside it, 0 none; platformY / groundY car-local heights), boards and lamps on its outer cab (z = +6). */
  car(cm:T.Matrix4,groundY:number,platformSide:number,platformY:number,lead:boolean,rear:boolean,spill:boolean){
   for(let sg=0;sg<2;sg++){const sx=sg?-1:1;
    for(const z of WIN_Z){l.compose(p.set(sx*(HALF_W+.045),WIN_Y,z),SIDE[sg],s.set(WIN_H,1,WIN_LEN));m.multiplyMatrices(cm,l);put(m,C.win,.95);}
    if(spill){const plat=platformSide===sx,y=plat?platformY:groundY;l.compose(p.set(sx*(HALF_W+(plat?1.3:1.7)),y+.03,0),q.identity(),s.set(plat?3.2:4,1,13));m.multiplyMatrices(cm,l);put(m,plat?C.platform:C.spill,plat?.75:.6);}}
   if(lead){halo(cm,-.86,3.42,6,2.2,C.head,1);halo(cm,.86,3.42,6,2.2,C.head,1);}
   if(rear){halo(cm,-1.06,1.45,6,1.05,C.tail,1);halo(cm,1.06,1.45,6,1.05,C.tail,1);}
   if(lead||rear)halo(cm,0,3.43,6,1.1,C.board,.55);
  },
  /** The beam pool on the track ahead (world x, y, z, tangent tx, tz), weight w (nearer = brighter). */
  beam(x:number,y:number,z:number,tx:number,tz:number,w:number){q.setFromAxisAngle(Y_UP,Math.atan2(tx,tz));m.compose(p.set(x,y+.06,z),q,s.set(3.4,1,7.5));put(m,C.beam,w);},
  /** The beam on a tunnel wall: a vertical wash at lateral offset v (signed, m) from the centre line at (x, z), floor height y. */
  wall(x:number,y:number,z:number,tx:number,tz:number,v:number,w:number){
   const sg=Math.sign(v),ix=-tz*sg,iz=tx*sg;/* inward normal (the track's right normal is (tz, −tx)) */
   // basis: local y = the inward normal (the lit face), local z = along the track, local x = y × z (vertical)
   d.set(ix,0,iz);ax.set(tx,0,tz);s.crossVectors(d,ax);m.makeBasis(s.multiplyScalar(2.4),d,ax.multiplyScalar(7));m.setPosition(x+tz*v,y+1.25,z-tx*v);put(m,C.wall,w);},
  end(){if(mesh.count!==n)mesh.count=n;const v=n>0;if(mesh.visible!==v)mesh.visible=v;if(v){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor!.needsUpdate=true;}},
  /** Warm-up (Town's compile pass): one instance under the island so the program exists before the first night. */
  warm(on:boolean){if(!ready)return;mesh.visible=on;mesh.count=on?1:0;if(on){m.makeTranslation(0,-600,0);mesh.setMatrixAt(0,m);col[0]=col[1]=col[2]=0;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor!.needsUpdate=true;}},
  dispose(){geo.dispose();if(!ready)(mesh.material as T.Material).dispose();mesh.dispose();},
 };
}
export type TrainNightGlow=ReturnType<typeof createTrainNightGlow>;
