import * as T from 'three';
import type {TennisState} from '@/lib/games/soccerTennis';

/** Futbol Tennis arena dressing (Oct 25 2026): court paint, light pools under both players, corner
 * floodlight glows and a pooled confetti burst. No crowd, stands or umpire (Oct 27 2026, owner: the court is the
 * focus; it also saves 3 draws on desktop). Draw budget: paint 1 + floodlights 1 + player pools 2 + confetti 1
 * (only while alive). Nothing allocates per frame; all state lives in
 * preallocated typed arrays and every mesh sits in the stage scene so stage.dispose() frees it. */
type Stage={scene:T.Scene;reduced:boolean;mobile:boolean;burst?:(x:number,y:number,z:number,power?:number)=>void};
export const TENNIS_ARENA={confetti:40,serviceZ:4.4,cheer:1.4} as const;
/** Painted court marks as [x0,z0,x1,z1] rectangles: both service lines, the centre service line, baseline centre marks. */
export function tennisCourtMarks(){const z=TENNIS_ARENA.serviceZ,h=.035;return [[-5,-z-h,5,-z+h],[-5,z-h,5,z+h],[-h,-z,h,z],[-h,7.68,h,8],[-h,-8,h,-7.68]] as const;}
/** Floodlight warm-up (extra pool opacity) for a rally of `rally` touches: 0 below 4, up to 0.2 at 20+. */
export const tennisRallyGlow=(rally:number)=>Math.max(0,Math.min(.2,(rally-3)*.0118));
const hash=(i:number)=>((Math.imul(i+11,2654435761)>>>0)%1000)/1000;

export function createTennisArena(stage:Stage,tennis:TennisState){
 const {scene,reduced}=stage,owned:T.Object3D[]=[];
 const add=<O extends T.Object3D>(o:O)=>{scene.add(o);owned.push(o);return o;};
 // --- court paint: one merged, non-indexed quad list -----------------------------------------
 const marks=tennisCourtMarks(),paintPos=new Float32Array(marks.length*18);
 marks.forEach(([x0,z0,x1,z1],i)=>{paintPos.set([x0,0,z0,x0,0,z1,x1,0,z0, x1,0,z0,x0,0,z1,x1,0,z1],i*18);});
 const paintGeo=new T.BufferGeometry();paintGeo.setAttribute('position',new T.BufferAttribute(paintPos,3));
 const paint=add(new T.Mesh(paintGeo,new T.MeshBasicMaterial({color:'#efe3c4',transparent:true,opacity:.82,depthWrite:false,side:T.DoubleSide})));
 paint.position.y=.031;paint.name='tennis-court-paint';paint.renderOrder=1;
 // --- soft glow texture shared by the floodlight pools and the player pools -------------------
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
 {const g=glowCanvas.getContext('2d');if(g){const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.45,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}}
 const glow=new T.CanvasTexture(glowCanvas);glow.colorSpace=T.SRGBColorSpace;
 const glowMat=(color:string,opacity:number)=>{const m=new T.MeshBasicMaterial({map:glow,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});m.userData.arcadeSpill=true;return m;};
 // Floodlights: four warm pools at the corners, merged into one quad list (one draw).
 const flood=new T.PlaneGeometry(1,1),floodPos:number[]=[],floodUv:number[]=[];const fp=flood.getAttribute('position'),fu=flood.getAttribute('uv'),fi=flood.getIndex();
 for(const [cx,cz] of [[-4.6,-7.4],[4.6,-7.4],[-4.6,7.4],[4.6,7.4]])for(let k=0;k<(fi?.count??0);k++){const v=fi!.getX(k);floodPos.push(cx+fp.getX(v)*5.2,0,cz-fp.getY(v)*5.2);floodUv.push(fu.getX(v),fu.getY(v));}
 flood.dispose();
 const floodGeo=new T.BufferGeometry();floodGeo.setAttribute('position',new T.Float32BufferAttribute(floodPos,3));floodGeo.setAttribute('uv',new T.Float32BufferAttribute(floodUv,2));
 const floodMat=glowMat('#ffd9a0',.16),floodlights=add(new T.Mesh(floodGeo,floodMat));let glowLevel=0,roarFlash=0,floodOpacity=.16;floodlights.position.y=.036;floodlights.name='tennis-floodlights';floodlights.renderOrder=1;
 // Player pools: a soft yellow light under you, pink under the rival, so both read from straight above.
 const poolGeo=new T.PlaneGeometry(2.3,2.3);poolGeo.rotateX(-Math.PI/2);
 const pools=[add(new T.Mesh(poolGeo,glowMat('#ffe084',.38))),add(new T.Mesh(poolGeo,glowMat('#ff83d3',.34)))];
 pools.forEach((p,i)=>{p.position.y=.038;p.renderOrder=2;p.name=i?'tennis-pool-rival':'tennis-pool-you';});
 const poolBase=[.38,.34],flash=new Float32Array(2);
 // --- confetti: one instanced quad pool --------------------------------------------------------
 const N=TENNIS_ARENA.confetti,confetti=add(new T.InstancedMesh(new T.PlaneGeometry(.15,.09),new T.MeshBasicMaterial({side:T.DoubleSide,toneMapped:false}),N));
 confetti.name='tennis-confetti';confetti.frustumCulled=false;confetti.visible=false;
 const palette=['#ffe084','#73fff1','#ff83d3','#ffc93c','#ffffff','#9dff8a'].map(c=>new T.Color(c));
 for(let i=0;i<N;i++)confetti.setColorAt(i,palette[i%palette.length]);
 const cPos=new Float32Array(N*3),cVel=new Float32Array(N*3),cRot=new Float32Array(N*2),cLife=new Float32Array(N);let cCursor=0,cAlive=0;
 const M=new T.Matrix4(),P=new T.Vector3(),S=new T.Vector3(),Q=new T.Quaternion(),E=new T.Euler(),ZERO=new T.Vector3(0,0,0);
 /** Throws `count` pieces up from (x,z); `spread` is the sideways speed. */
 function burstConfetti(x:number,z:number,count:number,spread:number,up=5.5){if(reduced)return;
  for(let k=0;k<count;k++){const i=cCursor++%N,r=hash(cCursor*3),a=hash(cCursor*7)*Math.PI*2;
   cPos[i*3]=x+(r-.5)*.8;cPos[i*3+1]=1.2+r*.6;cPos[i*3+2]=z+(hash(cCursor*5)-.5)*.8;
   cVel[i*3]=Math.cos(a)*spread*(.4+r);cVel[i*3+1]=up*(.7+hash(cCursor*13)*.5);cVel[i*3+2]=Math.sin(a)*spread*(.4+r);
   cRot[i*2]=a;cRot[i*2+1]=6+r*8;cLife[i]=1.5+r*.6;}
  cAlive=1;confetti.visible=true;if(confetti.instanceColor)confetti.instanceColor.needsUpdate=true;}
 function stepConfetti(dt:number){if(!cAlive)return;let live=0;
  for(let i=0;i<N;i++){if(cLife[i]<=0){M.makeScale(0,0,0);confetti.setMatrixAt(i,M);continue;}live++;cLife[i]-=dt;
   const j=i*3;cVel[j+1]-=7*dt;const drag=Math.max(0,1-2.4*dt);cVel[j]*=drag;cVel[j+2]*=drag;if(cVel[j+1]<-1.6)cVel[j+1]=-1.6; // paper flutters, it does not fall like a stone
   cPos[j]+=cVel[j]*dt+Math.sin(cRot[i*2]*1.7)*.4*dt;cPos[j+1]=Math.max(.04,cPos[j+1]+cVel[j+1]*dt);cPos[j+2]+=cVel[j+2]*dt;cRot[i*2]+=cRot[i*2+1]*dt;
   if(cPos[j+1]<=.04){cVel[j]=cVel[j+2]=0;cRot[i*2+1]=0;}
   P.set(cPos[j],cPos[j+1],cPos[j+2]);E.set(cRot[i*2],cRot[i*2]*1.3,0);Q.setFromEuler(E);S.setScalar(Math.min(1,cLife[i]*2.5));confetti.setMatrixAt(i,M.compose(P,Q,S));}
  confetti.instanceMatrix.needsUpdate=true;if(!live){cAlive=0;confetti.visible=false;}}
 let cheer=0;
 /** Per-frame (only while the game loop runs): pools follow the players, confetti flies. */
 function sync(dt:number){
  for(let i=0;i<2;i++){const p=i?tennis.rival:tennis.you,pool=pools[i];pool.position.x=p.x;pool.position.z=p.y;
   if(flash[i]>0)flash[i]=Math.max(0,flash[i]-dt);(pool.material as T.MeshBasicMaterial).opacity=poolBase[i]+flash[i]*(reduced?.6:1.6);}
  stepConfetti(dt);
  if(cheer>0)cheer=Math.max(0,cheer-dt/TENNIS_ARENA.cheer);
  // Round 3: the floodlights warm up as a rally grows (and flare on a milestone roar), then settle between points.
  const want=tennis.phase==='rally'?tennisRallyGlow(tennis.rally):0;glowLevel+=(want-glowLevel)*Math.min(1,dt*2.5);if(roarFlash>0)roarFlash=Math.max(0,roarFlash-dt);
  const fo=.16+(reduced?glowLevel*.5:glowLevel+roarFlash*.35);if(Math.abs(fo-floodOpacity)>.004){floodOpacity=fo;floodMat.opacity=fo;}
 }
 return{
  sync,
  /** A contact: that player's light pool flares for a moment. */
  flash(i:number){flash[i]=.25;},
  /** A point (or the match): confetti for your points. */
  cheer(winner:'you'|'rival',over:boolean){cheer=1;
   if(winner==='you'){const p=tennis.you;if(over)for(let k=0;k<4;k++)burstConfetti((k-1.5)*2.6,2.5+(k%2)*2.5,10,2.4,6.5);else burstConfetti(p.x,p.y,14,1.6);}},
  /** A hard plant or change of direction: a small dust puff at the feet. */
  plant(x:number,z:number){stage.burst?.(x,.06,z,.25);},
  /** Rally milestone: the lights flare, a few streamers fly on 10+. */
  roar(rally:number){cheer=Math.min(1,.45+rally/30);roarFlash=reduced?0:.6;if(rally>=10)burstConfetti(0,0,Math.min(16,6+rally/2),2.2,5);},
  active(){return cAlive>0||cheer>0||flash[0]>0||flash[1]>0||roarFlash>0||Math.abs(glowLevel-(tennis.phase==='rally'?tennisRallyGlow(tennis.rally):0))>.01;},
  reset(){cheer=0;roarFlash=0;glowLevel=0;floodOpacity=.16;floodMat.opacity=.16;flash.fill(0);cLife.fill(0);cAlive=0;confetti.visible=false;},
  dispose(){for(const o of owned){o.removeFromParent();const m=o as T.Mesh;m.geometry?.dispose();const mat=m.material as T.Material|undefined;mat?.dispose();}glow.dispose();owned.length=0;},
 };
}
