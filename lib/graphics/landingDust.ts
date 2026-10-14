import * as T from 'three';
/**
 * A small dust puff where a hop lands (Oct 13 2026, user: "when going down the mountain, have it jump off ledges and animate the
 * landing"). One instanced mesh of PUFFS low-poly puffs (one draw call, only while a puff plays, ~0.6 s), pooled: a new landing
 * reuses the oldest slots. Tinted for grass or sand; size and spread grow with the landing's strength (0…1). No per-frame work
 * once the puffs have faded (update returns at once).
 */
const PUFFS=24,PER_LANDING=8,LIFE=.6;
export function createLandingDust(){
 const geometry=new T.IcosahedronGeometry(.45,0),material=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.7,depthWrite:false});
 const mesh=new T.InstancedMesh(geometry,material,PUFFS);mesh.name='landing-dust';mesh.frustumCulled=false;mesh.visible=false;mesh.count=PUFFS;
 mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(PUFFS*3),3);
 const puffs=Array.from({length:PUFFS},()=>({age:LIFE,x:0,y:0,z:0,vx:0,vy:0,vz:0,size:1}));
 const M=new T.Matrix4(),Q=new T.Quaternion(),P=new T.Vector3(),S=new T.Vector3(),C=new T.Color(),GRASS=new T.Color('#b9b48a'),SAND=new T.Color('#f3e3bd');
 let cursor=0,live=0;
 return {root:mesh,
  /** A landing at (x, y, z): strength 0…1, sand true on a beach. Reduced motion: a smaller, slower puff. */
  trigger(x:number,y:number,z:number,strength:number,sand:boolean,reduced=false){
   const s=Math.max(.2,Math.min(1,strength)),n=reduced?4:PER_LANDING;C.copy(sand?SAND:GRASS);
   for(let i=0;i<n;i++){const slot=cursor,p=puffs[slot];cursor=(cursor+1)%PUFFS;const a=i/n*Math.PI*2+Math.random()*.5,sp=(1.2+2.6*s)*(reduced?.5:1)*(.7+Math.random()*.5);
    Object.assign(p,{age:0,x:x+Math.cos(a)*.3,y:y+.1,z:z+Math.sin(a)*.3,vx:Math.cos(a)*sp,vy:(.6+1.2*s)*(reduced?.5:1),vz:Math.sin(a)*sp,size:.5+.7*s});
    mesh.setColorAt(slot,C);}
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;live=LIFE;mesh.visible=true;},
  update(dt:number){
   if(live<=0)return;live-=dt;let any=false;
   for(let i=0;i<PUFFS;i++){const p=puffs[i];
    if(p.age>=LIFE){M.makeScale(0,0,0);mesh.setMatrixAt(i,M);continue;}
    p.age+=dt;any=true;const k=Math.exp(-dt*5);p.vx*=k;p.vz*=k;p.vy*=k;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
    const t=Math.min(1,p.age/LIFE),grow=p.size*(.5+1.1*t)*(1-t*t);
    M.compose(P.set(p.x,p.y,p.z),Q.identity(),S.set(grow,grow*.7,grow));mesh.setMatrixAt(i,M);}
   mesh.instanceMatrix.needsUpdate=true;material.opacity=.7;
   if(!any||live<=0){mesh.visible=false;live=0;}},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();mesh.dispose();}};
}
