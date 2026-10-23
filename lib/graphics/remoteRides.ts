import * as T from 'three';
import {createVehicle} from './vehicle';
import {gearState} from './beanGearFit';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {Mode} from '../../multiplayer/protocol';

/**
 * Friends' rides (Oct 23 2026): a friend on a scooter / bike / moped sat in the ride pose over the big ring with nothing under them,
 * because friend avatars (remoteAvatars.ts) only ever drew the body. This draws the vehicle under each SHOWN friend rig.
 *
 * Heat: the island's own ride models (vehicle.ts) are baked ONCE (lazily, on the first friend ride) into one vertex-coloured frame
 * geometry per ride x fit (classic / bean seat heights) plus one wheel geometry per ride, all on ONE shared material. Each is one
 * InstancedMesh (capacity = the friend rig batch), so a party of riders costs at most 2 draw calls per ride kind in use, none when
 * nobody rides (count 0 = not visible). No shadows, no per-frame allocation. Skin: the wire Look carries no ride skin, so every friend
 * rides the classic one (the protocol is unchanged).
 */
export const RIDE_KINDS=['scooter','bike','moped'] as const;
/** The town draws rides at 1.12 while the rider stays unit scale (vehicle.ts); a friend's rig root carries its own body scale on top. */
export const RIDE_SCALE=1.12;
/** Ride kind index (RIDE_KINDS) for a wire mode, -1 when the mode rides nothing on the ground. */
export function rideKindFor(mode:number):number{return mode===Mode.Scooter?0:mode===Mode.Bike?1:mode===Mode.Moped?2:-1;}

type Wheel={y:number;z:number;r:number};
type Baked={frame:T.BufferGeometry[]/* [kind*2+bean] */;wheel:T.BufferGeometry[];wheels:Wheel[][]};

const bakeColour=new T.Color();
function merge(parts:{g:T.BufferGeometry;m:T.Matrix4;c:T.Color}[]):T.BufferGeometry{
 const flat:T.BufferGeometry[]=[];let n=0;
 for(const p of parts){const g=p.g.index?p.g.toNonIndexed():p.g.clone();g.applyMatrix4(p.m);flat.push(g);n+=g.attributes.position.count;}
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
 flat.forEach((g,i)=>{
  const c=parts[i].c,cnt=g.attributes.position.count;
  pos.set(g.attributes.position.array as Float32Array,o*3);
  if(g.attributes.normal)nor.set(g.attributes.normal.array as Float32Array,o*3);
  for(let k=0;k<cnt;k++){col[(o+k)*3]=c.r;col[(o+k)*3+1]=c.g;col[(o+k)*3+2]=c.b;}
  o+=cnt;g.dispose();
 });
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('color',new T.BufferAttribute(col,3));
 out.computeBoundingSphere();return out;
}
const colourOf=(m:T.Material|T.Material[])=>{const mm=Array.isArray(m)?m[0]:m;return bakeColour.copy((mm as T.MeshStandardMaterial).color??bakeColour.set('#888888')).clone();};
function shownUnder(o:T.Object3D,top:T.Object3D){for(let p:T.Object3D|null=o;p&&p!==top;p=p.parent)if(!p.visible)return false;return true;}

/** Bakes the classic skin of the three ground rides from the island's own vehicle (both fits), then disposes the template. */
function bake():Baked{
 const packBack=gearState.packBack;// applyFit(false) zeroes this shared value: the local player's pack must not move
 const v=createVehicle();v.setCustomization({...DEFAULT_CUSTOMIZATION});
 const frame:T.BufferGeometry[]=[],wheel:T.BufferGeometry[]=[],wheels:Wheel[][]=[];
 try{
  for(let kind=0;kind<RIDE_KINDS.length;kind++){
   const mode=RIDE_KINDS[kind];
   for(const bean of [false,true]){
    v.setFit(bean);v.update(mode,0,0,0,0,0);v.root.position.set(0,0,0);v.root.rotation.set(0,0,0);v.root.scale.setScalar(1);v.root.updateMatrixWorld(true);
    const group=v.root.children.find(c=>c.name===mode)!;
    const parts:{g:T.BufferGeometry;m:T.Matrix4;c:T.Color}[]=[],ws:Wheel[]=[];
    let wheelParts:{g:T.BufferGeometry;m:T.Matrix4;c:T.Color}[]|null=null;
    group.traverse(o=>{
     if(!(o instanceof T.Mesh)||!shownUnder(o,v.root)||o.name.startsWith('bike-pedal'))return;
     // The two tyres (tori straight under the ride group) spin: kept out of the frame, baked once about their own axle.
     if(o.parent===group&&o.geometry.type==='TorusGeometry'){
      ws.push({y:o.position.y,z:o.position.z,r:o.position.y});
      if(!wheelParts){wheelParts=[{g:o.geometry,m:new T.Matrix4(),c:colourOf(o.material)}];for(const s of o.children)if(s instanceof T.Mesh){s.updateMatrix();wheelParts.push({g:s.geometry,m:s.matrix.clone(),c:colourOf(s.material)});}}
      return;
     }
     if(o.parent instanceof T.Mesh&&o.parent.parent===group&&o.parent.geometry.type==='TorusGeometry')return;// a spoke
     parts.push({g:o.geometry,m:o.matrixWorld.clone(),c:colourOf(o.material)});
    });
    frame[kind*2+(bean?1:0)]=merge(parts);
    if(!bean){wheel[kind]=merge(wheelParts??[]);wheels[kind]=ws;}
   }
  }
 }finally{v.dispose();gearState.packBack=packBack;}
 return {frame,wheel,wheels};
}

export interface RemoteRides{
 root:T.Group;
 begin():void;
 /** A shown friend riding `kind` (rideKindFor): the ride follows `body`'s position + rotation (pose, flourish, bump wobble / skid), `scale` = the
  *  vehicle's world scale, `spin` = rolled distance (wheel angle = spin / radius). */
 add(kind:number,bean:boolean,body:T.Object3D,scale:number,spin:number):void;
 end():void;
 readonly drawn:number;
 dispose():void;
}

const M=new T.Matrix4(),W=new T.Matrix4(),S=new T.Vector3(),WP=new T.Vector3(),WQ=new T.Quaternion(),WE=new T.Euler(),ONE=new T.Vector3(1,1,1);

export function createRemoteRides(capacity:number):RemoteRides{
 const root=new T.Group();root.name='remote-rides';
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0});
 let baked:Baked|null=null,disposed=false,drawn=0;
 const frames:T.InstancedMesh[]=[],wheels:T.InstancedMesh[]=[];
 const mk=(g:T.BufferGeometry,cap:number,name:string)=>{const m=new T.InstancedMesh(g,mat,cap);m.name=name;m.count=0;m.visible=false;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.raycast=()=>{};root.add(m);return m;};
 function ensure(){
  if(baked)return;baked=bake();
  for(let i=0;i<baked.frame.length;i++)frames.push(mk(baked.frame[i],capacity,'remote-ride-'+RIDE_KINDS[i>>1]+(i&1?'-bean':'')));
  for(let k=0;k<baked.wheel.length;k++)wheels.push(mk(baked.wheel[k],capacity*2,'remote-ride-wheels-'+RIDE_KINDS[k]));
 }
 return {root,
  get drawn(){return drawn;},
  begin(){drawn=0;for(let i=0;i<frames.length;i++)frames[i].count=0;for(let i=0;i<wheels.length;i++)wheels[i].count=0;},
  add(kind,bean,body,scale,spin){
   if(disposed||kind<0||kind>=RIDE_KINDS.length||scale<=0)return;
   ensure();
   const f=frames[kind*2+(bean?1:0)],wm=wheels[kind],ws=baked!.wheels[kind];
   if(f.count>=capacity)return;
   S.set(scale,scale,scale);M.compose(body.position,body.quaternion,S);
   f.setMatrixAt(f.count++,M);
   for(let i=0;i<ws.length&&wm.count<capacity*2;i++){
    const w=ws[i];WP.set(0,w.y,w.z);WQ.setFromEuler(WE.set(0,Math.PI/2,-spin/w.r,'XYZ'));W.compose(WP,WQ,ONE).premultiply(M);
    wm.setMatrixAt(wm.count++,W);
   }
   drawn++;
  },
  end(){
   for(const m of frames){m.visible=m.count>0;if(m.count)m.instanceMatrix.needsUpdate=true;}
   for(const m of wheels){m.visible=m.count>0;if(m.count)m.instanceMatrix.needsUpdate=true;}
  },
  dispose(){
   if(disposed)return;disposed=true;root.removeFromParent();
   for(const m of [...frames,...wheels]){m.geometry.dispose();m.dispose();}
   mat.dispose();
  }};
}
