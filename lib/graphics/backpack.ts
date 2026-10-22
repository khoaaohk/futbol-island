import * as T from 'three';
import {beanBackExtent,beanStrapPaths,beanSurfaceOffset,DEFAULT_BEAN_SHAPE,gearState,BEAN_Y0,type BeanShape} from './beanGearFit';
import {BD} from './beanSkin';
import type {TravelMode} from '../town/travelModes';
import type {CharacterCustomization} from '../town/customization';

/**
 * The main character's backpack (user, Oct 20 2026: "the main character always wears a backpack … when flying it
 * transforms into a jetpack"). docs/backpack.md.
 *
 * One merged mesh with vertex colours (body, pocket, flap, pentagon patch, carry loop, straps on the bean's shell, plus
 * the folded jet parts) parented to the rig's `armor-torso` joint, so every pose (walk, kick, swim, rides, jobs) carries
 * it with no per-frame matrix work. The jet parts (two tanks with orange bands, nozzles, fins) live INSIDE the closed
 * pack in the base positions and in their flying places in a single morph target: `morphTargetInfluences[0]` (0 = backpack,
 * 1 = jetpack) is the whole transform, eased over MORPH_SECONDS (reduced motion: instant). Two small flame cones (the
 * classic jet's flames, now on the morphed nozzles) are the only other meshes. Draw calls: 1 walking / riding, 3 flying.
 *
 * Learning hook: the pentagon patch is the classic 32-panel ball's black pentagon (12 of them on a real ball), and the
 * pack takes the kit's shorts colour with shirt-colour trim, the way a club's travel kit matches its strip.
 */
export const MORPH_SECONDS=.35;
/** Pack body half extents (torso-local metres, before the rig's 1.12 town scale). */
export const PACK_SIZE={w:.3,h:.3,d:.13} as const;
/** Socket names (children of the backpack group, so `rig.getObjectByName(name)` finds them once attached). */
export const BACKPACK_SOCKETS={
  root:'player-backpack',
  /** Beside the pack at mid-pack height: where a net pole rests while riding (rig's left = -x). */
  sideLeft:'backpack-side-left',sideRight:'backpack-side-right',
  /** The two thruster nozzle mouths (flames hang from these). */
  nozzleLeft:'backpack-nozzle-left',nozzleRight:'backpack-nozzle-right',
} as const;
/** Socket offsets in pack-local space (origin = the pack body centre; +z points into the bean, -z away from its back). */
export const BACKPACK_SIDE_OFFSET={left:[-(PACK_SIZE.w/2+.075),-.02,-.01] as const,right:[PACK_SIZE.w/2+.075,-.02,-.01] as const};
/**
 * Hand / arm joints a two-handed prop can parent to (player.ts createPlayer): `left-shoulder`/`right-shoulder` (on
 * `player-chest`) → `left-elbow`/`right-elbow` (.28 below) → `left-hand`/`right-hand` (.265 below the elbow; the mitten's
 * middle is 2 cm further down, the zipline grip point). `articulatedHands` must be true (the town player is).
 */
export const HAND_JOINTS={left:{shoulder:'left-shoulder',elbow:'left-elbow',hand:'left-hand'},right:{shoulder:'right-shoulder',elbow:'right-elbow',hand:'right-hand'}} as const;
/**
 * Rider adjustments per vehicle. The pack rides the torso, so ride poses carry it; on the bean the pack's lowest point
 * stays above every saddle / cargo box (tests/backpack-wear.cjs checks it), so no seat or lean change is needed (0s). The
 * net pole guide is for the bug-catching carry: rest it on `backpack-side-right`, tilted back `poleTilt` rad from vertical.
 */
export const BACKPACK_RIDE_OFFSETS={
  scooter:{seatDy:0,leanAdd:0,poleTilt:.35},
  bike:{seatDy:0,leanAdd:0,poleTilt:.55},
  moped:{seatDy:0,leanAdd:0,poleTilt:.6},
} as const;

type Variant=CharacterCustomization['jetpack'];
/** Jet variants that bring their own back gear or seat (the pack hides while they fly). */
const HIDES_PACK:readonly Variant[]=['helicopter','ironman','flying-car','mini-plane'];
/** Colour roles (rewritten on a kit change). */
export const BACKPACK_ROLE={body:0,trim:1,white:2,black:3,strap:4,metal:5,dark:6,band:7} as const;

type Part={geometry:T.BufferGeometry;role:number;fold:T.Matrix4;open?:T.Matrix4};
const m4=(x:number,y:number,z:number,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
/** Rounded "pillow box": a sphere pushed toward a box (low-poly, soft corners). */
function pillow(w:number,h:number,d:number,round=.55){
  const g=new T.SphereGeometry(1,12,8),p=g.attributes.position as T.BufferAttribute;
  for(let i=0;i<p.count;i++){const f=(v:number)=>Math.sign(v)*Math.pow(Math.abs(v),round);p.setXYZ(i,f(p.getX(i))*w/2,f(p.getY(i))*h/2,f(p.getZ(i))*d/2);}
  g.computeVertexNormals();return g;
}
/** Disc facing -z (the pack's outer face). */
const disc=(r:number,t:number,sides:number)=>{const g=new T.CylinderGeometry(r,r,t,sides);g.rotateX(Math.PI/2);return g;};

function jetParts():Part[]{
  const parts:Part[]=[];
  for(const side of [-1,1]){
    // Tanks lie hidden inside the closed pack, then slide out to the sides, nozzles under them, fins out to the side.
    parts.push({geometry:new T.CylinderGeometry(.058,.058,.3,10),role:BACKPACK_ROLE.metal,fold:m4(side*.05,0,0,.45,.4,.45),open:m4(side*.205,.0,-.015)});
    parts.push({geometry:new T.CylinderGeometry(.061,.061,.045,10),role:BACKPACK_ROLE.band,fold:m4(side*.05,.02,0,.45,.4,.45),open:m4(side*.205,.08,-.015)});
    parts.push({geometry:new T.SphereGeometry(.058,10,5,0,Math.PI*2,0,Math.PI/2),role:BACKPACK_ROLE.metal,fold:m4(side*.05,.04,0,.45,.4,.45),open:m4(side*.205,.15,-.015)});
    parts.push({geometry:new T.CylinderGeometry(.05,.068,.07,10),role:BACKPACK_ROLE.dark,fold:m4(side*.05,-.04,0,.4),open:m4(side*.205,-.185,-.015)});
    const fin=new T.BufferGeometry();fin.setAttribute('position',new T.Float32BufferAttribute([0,.06,-.006, 0,-.08,-.006, .07,-.1,-.006, 0,.06,.006, .07,-.1,.006, 0,-.08,.006, 0,.06,-.006, .07,-.1,-.006, .07,-.1,.006, 0,.06,-.006, .07,-.1,.006, 0,.06,.006],3));fin.computeVertexNormals();
    parts.push({geometry:fin,role:BACKPACK_ROLE.trim,fold:m4(side*.04,-.03,0,side*.1,.3,1),open:m4(side*.255,-.08,-.015,side,1,1,0,0,0)});
  }
  return parts;
}
function packParts(open:boolean):Part[]{
  const {w,h,d}=PACK_SIZE;
  return [
    {geometry:pillow(w,h,d),role:BACKPACK_ROLE.body,fold:m4(0,0,0),open:open?m4(0,0,-.005,1.06,1.04,1.08):undefined},
    // Front pocket (outer face) with the pentagon ball patch; it drops a little as the pack opens into a jet.
    {geometry:pillow(w*.74,h*.44,.05,.5),role:BACKPACK_ROLE.trim,fold:m4(0,-.055,-d/2+.005),open:m4(0,-.075,-d/2-.008)},
    {geometry:disc(.042,.008,14),role:BACKPACK_ROLE.white,fold:m4(0,-.05,-d/2-.02),open:m4(0,-.07,-d/2-.033)},
    {geometry:disc(.021,.01,5),role:BACKPACK_ROLE.black,fold:m4(0,-.05,-d/2-.025,1,1,1,0,0,Math.PI/2),open:m4(0,-.07,-d/2-.038,1,1,1,0,0,Math.PI/2)},
    // Top flap (team trim): lifts and tilts back when the pack opens.
    {geometry:pillow(w*1.02,.075,d*1.08,.45),role:BACKPACK_ROLE.trim,fold:m4(0,h/2-.03,-.004),open:m4(0,h/2+.012,-.03,1.04,1,1,-.55,0,0)},
    // Carry loop.
    {geometry:new T.TorusGeometry(.032,.008,4,8,Math.PI),role:BACKPACK_ROLE.strap,fold:m4(0,h/2+.006,.01),open:m4(0,h/2+.04,-.01)},
  ];
}

/** Flat strap ribbons over the bean's shoulders (beanGearFit.beanStrapPaths), in pack-local space. */
function strapParts(s:BeanShape,centre:T.Vector3):Part[]{
  const parts:Part[]=[];
  for(const {closed,stations} of beanStrapPaths()){
    const n=stations.length,pos:number[]=[],idx:number[]=[],tan=new T.Vector3(),side=new T.Vector3(),nrm=new T.Vector3(),B=new T.Vector3(),w=.034,t=.007;
    const outer=stations.map(([u,a])=>new T.Vector3(...beanSurfaceOffset(s,u,a,.004+t)).sub(centre)),inner=stations.map(([u,a])=>new T.Vector3(...beanSurfaceOffset(s,u,a,.004)).sub(centre));
    for(let i=0;i<n;i++){
      const prev=closed?(i+n-1)%n:Math.max(0,i-1),next=closed?(i+1)%n:Math.min(n-1,i+1);
      tan.subVectors(outer[next],outer[prev]).normalize();nrm.subVectors(outer[i],inner[i]).normalize();side.crossVectors(tan,nrm).normalize().multiplyScalar(w/2);
      for(const q of [outer[i],inner[i]]){B.copy(q).add(side);pos.push(B.x,B.y,B.z);B.copy(q).sub(side);pos.push(B.x,B.y,B.z);}
    }
    for(let i=0;i<(closed?n:n-1);i++){const a=i*4,b=((i+1)%n)*4;idx.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    parts.push({geometry:g,role:BACKPACK_ROLE.strap,fold:new T.Matrix4()});
  }
  return parts;
}

/** Bake parts into one non-indexed geometry: base = folded positions, morph target 0 = open positions. */
function bake(parts:Part[]){
  const pos:number[]=[],nor:number[]=[],mpos:number[]=[],mnor:number[]=[],roles:number[]=[],v=new T.Vector3(),nm=new T.Matrix3();
  for(const part of parts){
    const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry;if(!g.attributes.normal)g.computeVertexNormals();
    const p=g.attributes.position,n=g.attributes.normal,open=part.open??part.fold;
    for(const [m,P,N] of [[part.fold,pos,nor],[open,mpos,mnor]] as const){
      nm.getNormalMatrix(m);
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m);P.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);}
    }
    for(let i=0;i<p.count;i++)roles.push(part.role);
    if(g!==part.geometry)g.dispose();part.geometry.dispose();
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(roles.length*3),3));
  geometry.morphAttributes.position=[new T.Float32BufferAttribute(mpos,3)];geometry.morphAttributes.normal=[new T.Float32BufferAttribute(mnor,3)];
  geometry.morphTargetsRelative=false;geometry.computeBoundingSphere();geometry.computeBoundingBox();
  return {geometry,roles:Uint8Array.from(roles)};
}

/** Read the rig's live bean shape into `out` without allocating; false when it shows no bean body. */
function readShape(rig:T.Object3D,out:BeanShape):boolean{
  const cache=rig.userData as {beanGearBody?:T.Object3D|null};
  if(cache.beanGearBody===undefined)cache.beanGearBody=rig.getObjectByName('bean-body')??null;
  const body=cache.beanGearBody;if(!body||!body.visible)return false;
  const data=body.userData.beanData?.array as Float32Array|undefined,o=BD.shape0*4,p=BD.shape1*4;
  if(!data||!(data[o]>.3&&data[o+1]>.1)){Object.assign(out,DEFAULT_BEAN_SHAPE);return true;}
  out.H=data[o];out.W=data[o+1];out.D=data[o+2];out.taper=data[o+3];out.belly=data[p];out.leanX=data[p+1];out.leanZ=data[p+2];return true;
}

export type BackpackKit={shorts:string;shirt:string;shirt2?:string};
export function createBackpack(){
  const root=new T.Group();root.name=BACKPACK_SOCKETS.root;
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.04});
  const flameMaterial=new T.MeshBasicMaterial({color:'#ffc35a',toneMapped:false});
  const mesh=new T.Mesh(new T.BufferGeometry(),material);mesh.name='backpack-mesh';mesh.castShadow=true;mesh.receiveShadow=true;mesh.morphTargetInfluences=[0];mesh.userData.rigGear=true;root.add(mesh);
  let roles=new Uint8Array(0);
  const sockets:Record<'sideLeft'|'sideRight'|'nozzleLeft'|'nozzleRight',T.Object3D>={sideLeft:new T.Object3D(),sideRight:new T.Object3D(),nozzleLeft:new T.Object3D(),nozzleRight:new T.Object3D()};
  for(const k of Object.keys(sockets) as (keyof typeof sockets)[]){sockets[k].name=BACKPACK_SOCKETS[k];root.add(sockets[k]);}
  sockets.sideLeft.position.set(...BACKPACK_SIDE_OFFSET.left);sockets.sideRight.position.set(...BACKPACK_SIDE_OFFSET.right);
  sockets.nozzleLeft.position.set(-.205,-.22,-.015);sockets.nozzleRight.position.set(.205,-.22,-.015);
  // Flame cones: base at the nozzle mouth (socket origin), apex hanging down; scale.y stretches it from the nozzle.
  const flameGeometry=new T.ConeGeometry(.045,.24,8);flameGeometry.rotateX(Math.PI);flameGeometry.translate(0,-.12,0);
  const flames=[sockets.nozzleLeft,sockets.nozzleRight].map(s=>{const f=new T.Mesh(flameGeometry,flameMaterial);f.name='backpack-flame';f.userData.rigGear=true;f.castShadow=false;f.visible=false;s.add(f);return f;});
  const palette=[new T.Color(),new T.Color(),new T.Color('#fbf6e6'),new T.Color('#25282a'),new T.Color(),new T.Color('#c9d0c8'),new T.Color('#3a3f3d'),new T.Color('#f08a3c')];
  const kit:BackpackKit={shorts:'#26453e',shirt:'#edb957'};
  const paint=()=>{
    palette[BACKPACK_ROLE.body].set(kit.shorts);palette[BACKPACK_ROLE.trim].set(kit.shirt);palette[BACKPACK_ROLE.strap].set(kit.shorts).multiplyScalar(.72);
    // A very light body (white shorts) reads as a blank blob: lean it to the shirt-trim side a touch.
    if(palette[BACKPACK_ROLE.body].getHSL({h:0,s:0,l:0}).l>.82)palette[BACKPACK_ROLE.body].lerp(palette[BACKPACK_ROLE.trim],.18);
    const c=mesh.geometry.attributes.color as T.BufferAttribute|undefined;if(!c)return;
    for(let i=0;i<roles.length;i++){const col=palette[roles[i]];c.setXYZ(i,col.r,col.g,col.b);}c.needsUpdate=true;
  };
  const shape:BeanShape={...DEFAULT_BEAN_SHAPE},built:BeanShape={...DEFAULT_BEAN_SHAPE,H:-1};const centre=new T.Vector3();
  const rebuild=()=>{
    Object.assign(built,shape);
    // Centre ~44% up the shell (upper back, under the head's brim), flush on the deepest back point of its band.
    const yC=BEAN_Y0+.44*(shape.H-BEAN_Y0),zBack=beanBackExtent(shape,yC-PACK_SIZE.h*.45,yC+PACK_SIZE.h*.45);
    centre.set(0,yC,zBack-PACK_SIZE.d/2+.012);root.position.copy(centre);
    const parts=[...packParts(true),...jetParts(),...strapParts(shape,centre)],next=bake(parts);
    mesh.geometry.dispose();mesh.geometry=next.geometry;roles=next.roles;mesh.updateMorphTargets();mesh.morphTargetInfluences=[morph];paint();
  };
  let rig:T.Object3D|undefined,torso:T.Object3D|undefined,progress=0,morph=0,clock=0,shown=true;
  const ease=(t:number)=>t*t*(3-2*t);
  return {root,sockets,
    get morph(){return morph;},get mesh(){return mesh;},get roles(){return roles;},get drawCalls(){return root.visible&&root.parent?1+(flames[0].visible?2:0):0;},
    /** Parent the pack to a rig's `armor-torso` joint (the main character only). */
    attach(target:T.Object3D){
      rig=target;torso=target.getObjectByName('armor-torso')??undefined;if(!torso)return false;
      torso.add(root);if(!readShape(target,shape))Object.assign(shape,DEFAULT_BEAN_SHAPE);rebuild();return true;
    },
    setKit(value:BackpackKit){kit.shorts=value.shorts;kit.shirt=value.shirt;paint();},
    /**
     * Once a frame (no allocation). `mode`/`variant` pick the target (classic jet in flight = 1, else 0); `powered` is
     * false in the parachute / fall phases (the pack folds); `swim` (0..1) tucks the pack flatter; reduced = instant.
     */
    update(dt:number,mode:TravelMode,variant:Variant,powered:boolean,thrust:number,speed:number,swim:number,reduced:boolean){
      if(!rig||!torso)return;
      const hasBean=readShape(rig,shape);
      if(hasBean&&(shape.H!==built.H||shape.W!==built.W||shape.D!==built.D||shape.taper!==built.taper||shape.belly!==built.belly||shape.leanX!==built.leanX||shape.leanZ!==built.leanZ))rebuild();
      const flying=mode==='jetpack';
      shown=hasBean&&!(flying&&HIDES_PACK.includes(variant));root.visible=shown;
      const target=flying&&variant==='classic'&&powered?1:0;
      if(reduced)progress=target;else{const step=Math.max(0,Math.min(dt,.1))/MORPH_SECONDS;progress=target>progress?Math.min(target,progress+step):Math.max(target,progress-step);}
      morph=ease(progress);mesh.morphTargetInfluences![0]=morph;
      root.scale.set(1,1,1-.3*Math.max(0,Math.min(1,swim)));
      clock+=Math.max(0,Math.min(dt,.1));
      const burn=shown&&target===1&&morph>.92;
      for(let i=0;i<flames.length;i++){const f=flames[i];f.visible=burn;if(!burn)continue;
        f.scale.y=Math.max(.3,thrust*(.9+(reduced?0:Math.sin(clock*18+i*.9)*.16))+speed/90);}
      // The downwash leaves the morphed nozzles (jetExhaust: back = .34 + packBack, rig metres at the town's 1.12).
      if(burn)gearState.packBack=Math.max(0,(-(centre.z-.015))*1.12*torso.scale.z-.34);
    },
    dispose(){root.removeFromParent();mesh.geometry.dispose();flameGeometry.dispose();material.dispose();flameMaterial.dispose();rig=torso=undefined;},
  };
}
export type Backpack=ReturnType<typeof createBackpack>;
/**
 * The worn pack in a room or a portrait render (Oct 21 2026, user: "Backpack: not yet in the kit shop and other rooms"): one line
 * per room after the rig's bean look is set (docs/backpack.md). Folded (morph 0, never the jet, no flames), kit colours from
 * `playerOutfit`. `refresh(kit)` after a kit / build change (re-reads the bean shell, recolours; rebuilds only on a build change).
 * One draw call; nothing per frame.
 */
export function wearBackpack(rig:T.Object3D,kit:BackpackKit){
  const pack=createBackpack();if(!pack.attach(rig)){pack.dispose();return null;}
  const refresh=(k?:BackpackKit)=>{if(k)pack.setKit(k);pack.update(0,'walk','classic',false,0,0,0,true);};
  refresh(kit);
  return {pack,refresh,dispose:()=>pack.dispose()};
}
