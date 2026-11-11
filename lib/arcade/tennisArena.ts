import * as T from 'three';
import type {TennisState} from '@/lib/games/soccerTennis';

/** Futbol Tennis arena dressing (Oct 25 2026; comic house style Nov 10 2026): a flat contact disc under both players and a pooled
 * confetti burst in print colours. Draw budget: player discs 2 + confetti 1 (only while alive). The evening's lamp pools are part
 * of the comic shading now (lib/arcade/tennisWorld.ts), so nothing here glows. Nothing allocates per frame; all state lives in
 * preallocated typed arrays and every mesh sits in the stage scene so stage.dispose() frees it. */
type Stage={scene:T.Scene;reduced:boolean;mobile:boolean;burst?:(x:number,y:number,z:number,power?:number)=>void};
export const TENNIS_ARENA={confetti:40,serviceZ:4.4,cheer:1.4} as const;
/** Painted court marks as [x0,z0,x1,z1] rectangles: both service lines, the centre service line, baseline centre marks. */
export function tennisCourtMarks(){const z=TENNIS_ARENA.serviceZ,h=.035;return [[-5,-z-h,5,-z+h],[-5,z-h,5,z+h],[-h,-z,h,z],[-h,7.68,h,8],[-h,-8,h,-7.68]] as const;}
/** One 512x256 decal sheet (eight 128 px cells) shared by every flat tennis mark, drawn as ink: a flat disc with a dotted edge,
 * the ball smudge, the bounce spot, the first-touch ring, the broad ring, the ball's hard shadow, a gust line and a bounce puff.
 * White takes the material tint, the ink keyline stays ink. One GL texture. Stored on the scene so the world, the arena and the
 * marker modules share it; freed by whoever disposes the scene (tennisWorld.dispose / stage.dispose). */
export const TENNIS_ATLAS={dot:0,smudge:1,bounce:2,touch:3,ring:4,shadow:5,gust:6,puff:7} as const;
const INK='#231a2e';
export function tennisAtlas(scene:T.Scene):T.CanvasTexture{
 const had=scene.userData.tennisAtlas as T.CanvasTexture|undefined;if(had)return had;
 const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
 if(g){const cell=(i:number,fn:()=>void)=>{g.save();g.translate((i%4)*128,(i>>2)*128);g.beginPath();g.rect(0,0,128,128);g.clip();fn();g.restore();};g.clearRect(0,0,512,256);
  // A flat disc whose edge breaks into halftone dots (contact shade, ground dot): no soft gradient.
  const disc=(r:number)=>{g.fillStyle='#fff';g.beginPath();g.arc(64,64,r,0,Math.PI*2);g.fill();for(let i=0;i<26;i++){const a=i/26*Math.PI*2;g.beginPath();g.arc(64+Math.cos(a)*(r+5),64+Math.sin(a)*(r+5),3.4,0,Math.PI*2);g.fill();g.beginPath();g.arc(64+Math.cos(a+.12)*(r+12),64+Math.sin(a+.12)*(r+12),1.8,0,Math.PI*2);g.fill();}};
  cell(0,()=>disc(42));
  // Ball smudge: a hard-edged brush dab with dry gaps and a split tail.
  cell(1,()=>{g.fillStyle='#fff';g.beginPath();g.ellipse(64,58,34,46,0,0,Math.PI*2);g.fill();for(const[x,w]of[[44,9],[62,12],[82,8]])g.fillRect(x,92,w,26-((x*7)%11));g.globalCompositeOperation='destination-out';for(let i=0;i<46;i++){g.globalAlpha=.9;g.fillRect(34+hash(i)*60,14+hash(i*7)*96,1.6+hash(i*5)*2.4,6+hash(i*3)*16);}});
  // Bounce spot: a paper cross-hair ring with an ink keyline so it reads on clay, sand, lawn, timber and tiles.
  cell(2,()=>{g.lineCap='round';for(const[col,lw]of[[INK,19],['#ffffff',10]] as const){g.strokeStyle=col;g.fillStyle=col;g.lineWidth=lw;g.beginPath();g.arc(64,64,48,0,Math.PI*2);g.stroke();g.lineWidth=lw-3;for(const[x0,y0,x1,y1]of[[64,8,64,26],[64,102,64,120],[8,64,26,64],[102,64,120,64]]){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}g.beginPath();g.arc(64,64,col==='#ffffff'?11:15.5,0,Math.PI*2);g.fill();}});
  // First-touch ring: dashed paper with the same keyline.
  cell(3,()=>{for(const[col,lw]of[[INK,16],['#ffffff',8]] as const){g.strokeStyle=col;g.lineWidth=lw;g.setLineDash(col==='#ffffff'?[18,11]:[22,7]);g.lineDashOffset=col==='#ffffff'?0:2;g.beginPath();g.arc(64,64,52,0,Math.PI*2);g.stroke();}g.setLineDash([]);});
  // Broad ring: a paper band with an ink keyline on both sides (aim, landing, contact, countdown, lane marks).
  cell(4,()=>{g.strokeStyle=INK;g.lineWidth=22;g.beginPath();g.arc(64,64,49,0,Math.PI*2);g.stroke();g.strokeStyle='#fff';g.lineWidth=12;g.beginPath();g.arc(64,64,49,0,Math.PI*2);g.stroke();});
  // The ball's shadow: a hard disc, dotted at the rim.
  cell(5,()=>disc(46));
  // Gust line: two drawn wind strokes (paper with an ink edge), tapered.
  cell(6,()=>{g.lineCap='round';for(const[col,lw]of[[INK,30],['#ffffff',16]] as const){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();g.moveTo(18,46);g.lineTo(110,46);g.stroke();g.lineWidth=lw-6;g.beginPath();g.moveTo(40,92);g.lineTo(96,92);g.stroke();}});
  // Bounce puff: a small cut cloud with an ink edge.
  cell(7,()=>{for(const[col,k]of[[INK,7],['#ffffff',0]] as const){g.fillStyle=col;for(const[x,y,r]of[[44,74,24],[70,58,28],[90,78,20],[64,82,22]]){g.beginPath();g.arc(x,y,r+k,0,Math.PI*2);g.fill();}}});}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;scene.userData.tennisAtlas=t;return t;
}
/** Points a 0..1-mapped geometry (plane, ring drawn as a plane) at one atlas cell. */
export function tennisAtlasUv<G extends T.BufferGeometry>(geo:G,cell:number):G{const uv=geo.attributes.uv;if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,((cell%4)+.5+(uv.getX(i)-.5)*.97)/4,1-((cell>>2)+.5-(uv.getY(i)-.5)*.97)/2);return geo;}
const hash=(i:number)=>((Math.imul(i+11,2654435761)>>>0)%1000)/1000;

export function createTennisArena(stage:Stage,tennis:TennisState){
 const {scene,reduced}=stage,owned:T.Object3D[]=[];
 const add=<O extends T.Object3D>(o:O)=>{scene.add(o);owned.push(o);return o;};
 // The court marks themselves are baked into the court sheet (lib/arcade/tennisWorld.ts paintCourt, from tennisCourtMarks above).
 // Player discs: a flat violet-ink contact disc with a dotted edge under each player, so both read from above; a contact
 // deepens it for a moment.
 const sheet=tennisAtlas(scene),poolGeo=tennisAtlasUv(new T.PlaneGeometry(2.3,2.3),TENNIS_ATLAS.dot);poolGeo.rotateX(-Math.PI/2);
 const shadeMat=(opacity:number)=>new T.MeshBasicMaterial({map:sheet,color:'#3a2a5c',transparent:true,opacity,depthWrite:false});
 const pools=[add(new T.Mesh(poolGeo,shadeMat(.34))),add(new T.Mesh(poolGeo,shadeMat(.32)))];
 pools.forEach((p,i)=>{p.position.y=.014;p.scale.setScalar(.62);p.renderOrder=2;p.name=i?'tennis-pool-rival':'tennis-pool-you';});
 const poolBase=[.34,.32],flash=new Float32Array(2);
 // --- confetti: one instanced quad pool --------------------------------------------------------
 const N=TENNIS_ARENA.confetti,confetti=add(new T.InstancedMesh(new T.PlaneGeometry(.15,.09),new T.MeshBasicMaterial({side:T.DoubleSide,toneMapped:false}),N));
 confetti.name='tennis-confetti';confetti.frustumCulled=false;confetti.visible=false;
 const palette=['#fff3d6','#231a2e','#f0452e','#ffc83a','#ff8a3c','#19b5a5'].map(c=>new T.Color(c));
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
   if(flash[i]>0)flash[i]=Math.max(0,flash[i]-dt);(pool.material as T.MeshBasicMaterial).opacity=poolBase[i]+flash[i]*(reduced?.3:.8);pool.scale.setScalar(.62+flash[i]*(reduced?0:.5));}
  stepConfetti(dt);
  if(cheer>0)cheer=Math.max(0,cheer-dt/TENNIS_ARENA.cheer);
 }
 return{
  sync,
  /** A contact: that player's light pool flares for a moment. */
  flash(i:number){flash[i]=.25;},
  /** A point (or the match): confetti for your points. */
  cheer(winner:'you'|'rival',over:boolean){cheer=1;
   if(winner==='you'){const p=tennis.you;if(over)for(let k=0;k<4;k++)burstConfetti((k-1.5)*2.6,2.5+(k%2)*2.5,10,2.4,6.5);else burstConfetti(p.x,p.y,24,2.4,6.2);}},
  /** A hard plant or change of direction: a small dust puff at the feet. */
  plant(x:number,z:number){stage.burst?.(x,.06,z,.25);},
  /** Rally milestone: a few streamers fly on 10+. */
  roar(rally:number){cheer=Math.min(1,.45+rally/30);if(rally>=10)burstConfetti(0,0,Math.min(16,6+rally/2),2.2,5);},
  active(){return cAlive>0||cheer>0||flash[0]>0||flash[1]>0;},
  reset(){cheer=0;flash.fill(0);cLife.fill(0);cAlive=0;confetti.visible=false;},
  dispose(){for(const o of owned){o.removeFromParent();const m=o as T.Mesh;m.geometry?.dispose();const mat=m.material as T.Material|undefined;mat?.dispose();}owned.length=0;},
 };
}
