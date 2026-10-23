import * as T from 'three';
import {RIDE_SPLASH_DROP,RIDE_SPLASH_FOAM} from './waterTokens';

// Ride splash (owner, Oct 23 2026, from an iPhone screenshot of a bike in the swash along the beach: "add a proper water splash
// animation"). A scooter / bike / moped rolling through the shallows throws two fans of droplets off the wheels (sideways and
// back), leaves a small foam ring behind the rear wheel and a short wake V in the water. Scaled by speed (nothing when slow), only
// on the wet side of the drawn waterline (the island shore field's CPU copy: islandShore.ts IsleCpuField, the same 2 m signed
// distance the swash shader draws from, so the splash starts where the water visibly reaches), soft fade at the line.
// The tiny white dots that already trailed the bike there were the ride dust trail (rideTrail.ts, the variant's colour); this is
// separate and only draws in the water.
//
// Heat (AGENTS.md, owner: "will this add heat?"): ONE InstancedMesh of 2-triangle quads (RIDE_SPLASH.cap instances, one draw call,
// one shared ShaderMaterial, no texture: the dot and the ring are drawn in the fragment shader), no shadows, depthWrite off, one
// transparent object (no sorting between particles). All state is preallocated typed arrays: update() allocates nothing. Nobody
// riding in water and no particle alive = update() returns after a few comparisons and the mesh is hidden (no draw). Off in
// Battery saver and at heat tier >= 3; tier 2 halves the droplets; reduced motion keeps the foam ring only, at half rate.

export const RIDE_SPLASH={
 /** Pool size: live particles for all riders together (oldest recycled first). */
 cap:56,
 /** Riders fed per frame (the local player + the nearest friends). */
 maxRiders:3,friends:2,
 /** m/s: no splash below `minSpeed`, full strength at `fullSpeed` (scooter max 14, bike 20, moped 28; travelModes.ts). */
 minSpeed:2.5,fullSpeed:16,
 /** The drawn waterline's signed distance (m, + sea, − land): dry at `dryD`, fully wet at `wetD` (the swash runs ~1.2 m up the sand). */
 dryD:-1.4,wetD:-.35,
 /** Ground at least this high over the water in that 2 m cell (decks, kerbs, rocks, the pier) never splashes (the strip's `high`). */
 highLift:.38,
 /** Droplets per second per rider at full strength, foam ring and wake V intervals (s) at full strength. */
 dropRate:46,ringEvery:.16,wakeEvery:.24,
 /** Lives (s). */
 dropLife:.55,ringLife:.6,wakeLife:.7,
 /** The soft splash sound (islandSound 'splash-soft', low gain): at most once per `soundEvery` s while the local splash is at least `soundMin`. */
 soundEvery:1.3,soundMin:.35,
} as const;

/** 0 = off (Battery saver, heat tier >= 3), 1 = foam ring only at half rate (reduced motion), 2 = lite (tier 2: half the droplets), 3 = full. */
export type RideSplashMode=0|1|2|3;
export function rideSplashMode(tier:number,saver:boolean,reduced:boolean):RideSplashMode{
 if(saver||tier>=3)return 0;if(reduced)return 1;return tier>=2?2:3;
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Speed factor 0…1: 0 under RIDE_SPLASH.minSpeed (slow / stopped), eased up to 1 at fullSpeed. */
export function splashSpeed(speed:number){return speed<=RIDE_SPLASH.minSpeed?0:smooth(RIDE_SPLASH.minSpeed,RIDE_SPLASH.fullSpeed,speed);}
/** Wetness 0…1 from the drawn waterline distance `d` and the cell's highest ground `lift`: 0 on dry sand and on anything raised. */
export function shoreWet(d:number,lift:number){return lift>=RIDE_SPLASH.highLift||!(d>RIDE_SPLASH.dryD)?0:smooth(RIDE_SPLASH.dryD,RIDE_SPLASH.wetD,d);}
/** The shore field Town has after the bake (islandShore.ts IsleCpuField). */
export type ShoreField={distance(x:number,z:number):number;lift(x:number,z:number):number};

/** Friends riding this frame (remoteAvatars.ts fills it, preallocated; n = how many). */
export type RiderSpots={n:number;x:Float32Array;z:Float32Array;y:Float32Array;yaw:Float32Array;speed:Float32Array};
export function createRiderSpots(capacity:number):RiderSpots{return {n:0,x:new Float32Array(capacity),z:new Float32Array(capacity),y:new Float32Array(capacity),yaw:new Float32Array(capacity),speed:new Float32Array(capacity)};}
/** The `count` friend riders nearest to (cx, cz), written into `out` (indices into `spots`, nearest first); returns how many. No allocation. */
export function nearestRiders(spots:RiderSpots,cx:number,cz:number,count:number,out:Int32Array,dist:Float32Array){
 let k=0;
 for(let i=0;i<spots.n;i++){const dx=spots.x[i]-cx,dz=spots.z[i]-cz,d=dx*dx+dz*dz;
  let j=Math.min(k,count);if(j===count&&d>=dist[count-1])continue;
  while(j>0&&dist[j-1]>d){if(j<count){dist[j]=dist[j-1];out[j]=out[j-1];}j--;}
  dist[j]=d;out[j]=i;if(k<count)k++;}
 return k;
}

const KIND_DROP=0,KIND_RING=1,KIND_WAKE=2,GRAVITY=9.8;

/** The pooled splash: `begin()`, `rider(...)` for each rider this frame (slot 0 = local, 1.. = friends), then `end(dt)`. */
export function createRideSplash(field:()=>ShoreField|null){
 const cap=RIDE_SPLASH.cap,R=RIDE_SPLASH.maxRiders;
 const px=new Float32Array(cap),py=new Float32Array(cap),pz=new Float32Array(cap),vx=new Float32Array(cap),vy=new Float32Array(cap),vz=new Float32Array(cap);
 const age=new Float32Array(cap),life=new Float32Array(cap),size=new Float32Array(cap),kind=new Uint8Array(cap),stretch=new Float32Array(cap),angle=new Float32Array(cap),floor=new Float32Array(cap);
 const dropCredit=new Float32Array(R),ringT=new Float32Array(R),wakeT=new Float32Array(R),side=new Uint8Array(R);
 let cursor=0,alive=0,seed=20261023,mode:RideSplashMode=3,dt=0,emitted=0,wetRiders=0,soundT=0;
 const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;

 const geometry=new T.PlaneGeometry(1,1);
 const fx=new T.InstancedBufferAttribute(new Float32Array(cap*3),3);fx.setUsage(T.DynamicDrawUsage);geometry.setAttribute('aFx',fx);
 const material=new T.ShaderMaterial({
  uniforms:{uDrop:{value:new T.Color(RIDE_SPLASH_DROP)},uFoam:{value:new T.Color(RIDE_SPLASH_FOAM)}},
  transparent:true,depthWrite:false,fog:false,lights:false,side:T.DoubleSide,
  vertexShader:/* glsl */`attribute vec3 aFx;varying vec2 vUv;varying vec2 vFx;
void main(){vUv=uv-.5;vFx=aFx.xy;
 if(aFx.x<.5){vec4 c=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);c.xy+=position.xy*aFx.z;gl_Position=projectionMatrix*c;}
 else gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
  fragmentShader:/* glsl */`uniform vec3 uDrop;uniform vec3 uFoam;varying vec2 vUv;varying vec2 vFx;
void main(){float r=length(vUv)*2.,a;vec3 col;
 if(vFx.x<.5){a=1.-smoothstep(.35,1.,r);col=uDrop;}
 else{a=smoothstep(.55,.78,r)*(1.-smoothstep(.84,1.,r))+(1.-smoothstep(.2,.8,r))*.12;col=uFoam;}
 a*=vFx.y;if(a<.01)discard;gl_FragColor=vec4(col,a);
 #include <colorspace_fragment>
}`});
 const mesh=new T.InstancedMesh(geometry,material,cap);mesh.name='ride-splash';mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=false;
 mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.count=0;mesh.visible=false;mesh.renderOrder=2;
 const M=mesh.instanceMatrix.array as Float32Array,F=fx.array as Float32Array;

 function spawn(k:number,x:number,y:number,z:number,ux:number,uy:number,uz:number,l:number,s:number,st:number,an:number,fl:number){
  const i=cursor;cursor=(cursor+1)%cap;if(age[i]>=life[i])alive++;
  kind[i]=k;px[i]=x;py[i]=y;pz[i]=z;vx[i]=ux;vy[i]=uy;vz[i]=uz;age[i]=0;life[i]=l;size[i]=s;stretch[i]=st;angle[i]=an;floor[i]=fl;emitted++;
 }
 for(let i=0;i<cap;i++){age[i]=1;life[i]=0;}

 return {
  mesh,
  /** Live particles (tests / heat checks) and particles spawned so far. */
  get alive(){return alive;},get emitted(){return emitted;},
  /** Riders splashing this frame (tests / heat checks). */
  get wetRiders(){return wetRiders;},
  /** Feed the local rider's strength (rider()'s return): true when the soft splash sound is due (throttled; never in reduced motion / lite / off). */
  soundDue(strength:number){if(mode!==3||strength<RIDE_SPLASH.soundMin){soundT=Math.min(soundT,RIDE_SPLASH.soundEvery*.5);return false;}soundT+=dt;if(soundT<RIDE_SPLASH.soundEvery)return false;soundT=0;return true;},
  begin(frameDt:number,m:RideSplashMode){dt=Math.max(0,Math.min(frameDt,.1));mode=m;wetRiders=0;},
  /** A rider on wheels at (x, y = wheel contact height, z), facing `yaw`, moving `speed` m/s; `slot` 0…maxRiders-1 keeps its own emit clocks. */
  rider(slot:number,x:number,y:number,z:number,yaw:number,speed:number){
   if(slot<0||slot>=R)return 0;
   const sp=mode===0||dt<=0?0:splashSpeed(speed);
   let s=0;if(sp>0){const f=field();if(f)s=sp*shoreWet(f.distance(x,z),f.lift(x,z));}
   if(s<=.02){dropCredit[slot]=0;ringT[slot]=0;wakeT[slot]=0;return 0;}
   wetRiders++;
   const fx0=Math.sin(yaw),fz0=Math.cos(yaw),rx=fz0,rz=-fx0,y0=y+.04;
   // The foam ring behind the rear wheel (reduced motion: this only, half as often).
   ringT[slot]+=dt;const ringEvery=RIDE_SPLASH.ringEvery*(mode===1?2:1)/(.55+.45*s);
   if(ringT[slot]>=ringEvery){ringT[slot]=0;spawn(KIND_RING,x-fx0*.6,y0,z-fz0*.6,0,0,0,RIDE_SPLASH.ringLife,.32+.45*s,1,yaw,y0);}
   if(mode===1)return s;
   // The wake V: two rings stretched along the arms of a V, behind.
   wakeT[slot]+=dt;
   if(wakeT[slot]>=RIDE_SPLASH.wakeEvery&&s>.25){wakeT[slot]=0;const bx=x-fx0*1.1,bz=z-fz0*1.1;
    spawn(KIND_WAKE,bx+rx*.45,y0,bz+rz*.45,0,0,0,RIDE_SPLASH.wakeLife,.5+.5*s,2.4,Math.atan2(-fx0*.85+rx*.5,-fz0*.85+rz*.5),y0);
    spawn(KIND_WAKE,bx-rx*.45,y0,bz-rz*.45,0,0,0,RIDE_SPLASH.wakeLife,.5+.5*s,2.4,Math.atan2(-fx0*.85-rx*.5,-fz0*.85-rz*.5),y0);}
   // Two fans of droplets off the wheels (alternating sides, mostly the rear wheel), thrown sideways, back and up; carried a
   // little by the ride (world space: the rider leaves them behind).
   dropCredit[slot]+=dt*RIDE_SPLASH.dropRate*s*(mode===2?.5:1);
   let n=Math.floor(dropCredit[slot]);dropCredit[slot]-=n;if(n>6)n=6;
   for(let i=0;i<n;i++){const sd=(side[slot]^=1)?1:-1,rear=rand()<.7,along=rear?-.55:.45,out=(1.1+rand()*1.3)*(.5+.6*s),back=(.4+rand()*.9)*(.4+.6*s)+speed*.35,up=(1.4+rand()*1.2)*(.55+.55*s);
    spawn(KIND_DROP,x+fx0*along+rx*.12*sd,y0+.05,z+fz0*along+rz*.12*sd,rx*out*sd-fx0*back+fx0*speed*.45,up,rz*out*sd-fz0*back+fz0*speed*.45,RIDE_SPLASH.dropLife*(.7+.3*rand()),(.08+.08*s)*(.7+.5*rand()),1,0,y0-.02);}
   return s;
  },
  /** Ages the pool and writes the live instances (the only per-frame work, and only while something is alive). */
  end(){
   if(alive===0){if(mesh.visible){mesh.visible=false;mesh.count=0;}return;}
   let v=0;alive=0;
   for(let i=0;i<cap;i++){if(age[i]>=life[i])continue;age[i]+=dt;if(age[i]>=life[i])continue;
    const k=kind[i],t=age[i]/life[i],o=v*16;
    if(k===KIND_DROP){vy[i]-=GRAVITY*dt;px[i]+=vx[i]*dt;py[i]+=vy[i]*dt;pz[i]+=vz[i]*dt;vx[i]*=1-1.2*dt;vz[i]*=1-1.2*dt;
     if(py[i]<floor[i]&&vy[i]<0){age[i]=life[i];continue;}/* back in the water */
     M[o]=1;M[o+1]=0;M[o+2]=0;M[o+3]=0;M[o+4]=0;M[o+5]=1;M[o+6]=0;M[o+7]=0;M[o+8]=0;M[o+9]=0;M[o+10]=1;M[o+11]=0;
     F[v*3]=0;F[v*3+1]=.9*(1-t*t);F[v*3+2]=size[i]*(1-.4*t);}
    else{const r=size[i]*(.35+.65*(1-(1-t)*(1-t))),sx=r*stretch[i],sz=r,c=Math.cos(angle[i]),s=Math.sin(angle[i]);
     // A flat quad in the water plane: local x across, local y along `angle` (stretch: the wake's long arm).
     M[o]=sz*c;M[o+1]=0;M[o+2]=-sz*s;M[o+3]=0;M[o+4]=sx*s;M[o+5]=0;M[o+6]=sx*c;M[o+7]=0;M[o+8]=0;M[o+9]=1;M[o+10]=0;M[o+11]=0;
     F[v*3]=k;F[v*3+1]=(k===KIND_WAKE?.4:.55)*(1-t)*(1-t*.3);F[v*3+2]=0;}
    M[o+12]=px[i];M[o+13]=py[i];M[o+14]=pz[i];M[o+15]=1;v++;alive++;}
   mesh.count=v;mesh.visible=v>0;
   if(v){mesh.instanceMatrix.clearUpdateRanges();mesh.instanceMatrix.addUpdateRange(0,v*16);mesh.instanceMatrix.needsUpdate=true;fx.clearUpdateRanges();fx.addUpdateRange(0,v*3);fx.needsUpdate=true;}
  },
  clear(){for(let i=0;i<cap;i++)age[i]=life[i];alive=0;mesh.count=0;mesh.visible=false;dropCredit.fill(0);ringT.fill(0);wakeT.fill(0);},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();},
 };
}
export type RideSplash=ReturnType<typeof createRideSplash>;
