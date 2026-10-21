/**
 * The Bug squad's catch stage (Oct 21 2026; docs/island-jobs.md §15 "Catch stage"). User: "this needs to zoom in on the character
 * first then show the actual catching ... an isolated animation to show the catch, it doesn't need to have the background on it".
 *
 * A small sealed scene, built when a swing will connect and disposed when the catch ends (like the dive room, diveRoom.ts): a soft
 * gradient backdrop themed by the time of day (warm pastel by Day, peach at Sunset, deep blue at Night), a round floor that fades
 * into it with a soft contact shadow, a few floating pollen / star specks, two lights, one standalone model of the caught species
 * (bugModels.ts, the swarm's shader: flapping wings, walking legs) plus its glow sprite for a firefly, and a pooled star burst.
 * The runtime (lib/town/jobs/jobScene.ts) borrows the player's rig and the net into it for the shot and puts them back after.
 *
 * Heat: while it plays only this scene is drawn (≈ 6 draws + the rig and the net, instead of the island), no textures, nothing
 * allocated per frame; the island is neither stepped nor rendered. Everything here is disposed at the end.
 */
import * as T from 'three';
import {createBugModel} from './bugModels';
import {bugMaterial,glowMaterial} from './bugMaterial';
import {FLIGHT_PROFILES} from './bugFlight';
import type {BugSpecies} from '../town/jobs/bugSpecies';

export type StageLook='day'|'sunset'|'night';
/** Backdrop (top, horizon), floor (centre, edge = the horizon) and light colours per look. */
export const STAGE_COLORS:Record<StageLook,{top:string;horizon:string;floor:string;speck:string;sky:string;ground:string;sun:string}>={
 day:{top:'#bfe3f2',horizon:'#fff1d6',floor:'#e9f0c8',speck:'#fff7c2',sky:'#fdf6e3',ground:'#b9cf8f',sun:'#fff3dc'},
 sunset:{top:'#f6c39a',horizon:'#ffe4c4',floor:'#f3dcb8',speck:'#fff0b8',sky:'#ffe9cf',ground:'#d7b48a',sun:'#ffd9a8'},
 night:{top:'#0f1a3d',horizon:'#2b3d78',floor:'#2a3a6a',speck:'#e9ff8a',sky:'#9fb4ff',ground:'#24304f',sun:'#cfd8ff'},
};
const STARS=16,SPECKS=36;

export function createCatchStage(o:{at:{x:number;y:number;z:number};look:StageLook;species:BugSpecies|null;host?:HTMLElement|null}){
 const C=STAGE_COLORS[o.look],night=o.look==='night',owned:{dispose():void}[]=[];const own=<X extends {dispose():void}>(x:X)=>{owned.push(x);return x;};
 const scene=new T.Scene();scene.name='catch-stage';scene.background=new T.Color(C.horizon);
 const camera=new T.PerspectiveCamera(40,1.6,.05,120);
 const P=o.at;
 // Backdrop: a big sphere, vertex colours from the horizon up to the top (and the horizon below, so the floor's edge melts into it).
 {const g=own(new T.SphereGeometry(45,24,12)),pa=g.getAttribute('position'),col=new Float32Array(pa.count*3),top=new T.Color(C.top),hz=new T.Color(C.horizon),c=new T.Color();
  for(let i=0;i<pa.count;i++){const k=Math.max(0,pa.getY(i)/45);c.copy(hz).lerp(top,Math.pow(k,.7));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  g.setAttribute('color',new T.BufferAttribute(col,3));
  const m=new T.Mesh(g,own(new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,depthWrite:false,fog:false})));m.name='catch-stage-backdrop';m.position.set(P.x,P.y,P.z);m.renderOrder=-2;m.frustumCulled=false;scene.add(m);}
 // Floor: a disc whose colour fades into the horizon at its rim, darker in the middle (a soft contact shadow under the character).
 {const g=own(new T.RingGeometry(.001,6,40,10)),pa=g.getAttribute('position'),col=new Float32Array(pa.count*3),fl=new T.Color(C.floor),hz=new T.Color(C.horizon),sh=new T.Color(C.floor).multiplyScalar(night?.6:.72),c=new T.Color();
  for(let i=0;i<pa.count;i++){const r=Math.hypot(pa.getX(i),pa.getY(i));const shadow=1-Math.min(1,r/.75);c.copy(fl).lerp(hz,Math.min(1,Math.max(0,(r-2.2)/3.6)));c.lerp(sh,shadow*shadow*.9);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  g.setAttribute('color',new T.BufferAttribute(col,3));
  const m=new T.Mesh(g,own(new T.MeshBasicMaterial({vertexColors:true,fog:false})));m.name='catch-stage-floor';m.rotation.x=-Math.PI/2;m.position.set(P.x,P.y+.005,P.z);m.renderOrder=-1;scene.add(m);}
 // Specks: pollen by day, little stars at night, in a shell round the character; the cloud turns slowly (no per-frame writes).
 const specks=(()=>{const pos=new Float32Array(SPECKS*3);let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<SPECKS;i++){const a=rnd()*Math.PI*2,r=1.6+rnd()*3.4;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=.3+rnd()*3.2;pos[i*3+2]=Math.sin(a)*r;}
  const g=own(new T.BufferGeometry());g.setAttribute('position',new T.BufferAttribute(pos,3));
  const m=new T.Points(g,own(new T.PointsMaterial({color:C.speck,size:night?.07:.055,sizeAttenuation:true,transparent:true,opacity:.85,depthWrite:false,fog:false})));
  m.name='catch-stage-specks';m.position.set(P.x,P.y,P.z);m.frustumCulled=false;scene.add(m);return m;})();
 // Lights: a soft sky / ground fill and a key light from the camera's side, above.
 const hemi=new T.HemisphereLight(C.sky,C.ground,night?1.5:1.75);scene.add(hemi);
 const key=new T.DirectionalLight(C.sun,night?1.1:1.9);key.position.set(P.x+3,P.y+6,P.z+4);key.target.position.set(P.x,P.y+1,P.z);scene.add(key,key.target);
 // The caught bug: its own model with the swarm's shader (one instance), plus the firefly's glow sprite.
 const U={uTime:{value:0},uFade:{value:1}};
 const geo=own(createBugModel(o.species));geo.computeBoundingBox();const size=geo.boundingBox!.getSize(new T.Vector3()),longest=Math.max(size.x,size.y,size.z)||.3;
 const flap=new T.InstancedBufferAttribute(new Float32Array(4),4),pose=new T.InstancedBufferAttribute(new Float32Array(4),4);geo.setAttribute('iFlap',flap);geo.setAttribute('iPose',pose);
 const bug=new T.InstancedMesh(geo,own(bugMaterial(U)),1);bug.name='catch-stage-bug';bug.frustumCulled=false;scene.add(bug);
 const prof=FLIGHT_PROFILES[o.species?.move??'firefly-drift'];
 let glow:T.InstancedMesh|null=null;const lantern=new T.Vector3();
 if(!o.species){const pa=geo.getAttribute('position'),ma=geo.getAttribute('aMisc');let k=0;if(ma)for(let i=0;i<pa.count;i++)if(ma.getW(i)>0){lantern.x+=pa.getX(i);lantern.y+=pa.getY(i);lantern.z+=pa.getZ(i);k++;}if(k)lantern.multiplyScalar(1/k);
  const gg=own(new T.PlaneGeometry(1,1));gg.setAttribute('iPose',pose);glow=new T.InstancedMesh(gg,own(glowMaterial(U)),1);glow.name='catch-stage-glow';glow.frustumCulled=false;glow.renderOrder=3;scene.add(glow);}
 // The success burst: stars (and a few pentagons, by scale) from one instanced draw, pooled.
 const starShape=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,r=i%2?.42:1;const x=Math.cos(a)*r,y=-Math.sin(a)*r;if(i)starShape.lineTo(x,y);else starShape.moveTo(x,y);}
 const stars=new T.InstancedMesh(own(new T.ShapeGeometry(starShape)),own(new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide,transparent:true,depthWrite:false,toneMapped:false})),STARS);
 stars.name='catch-stage-stars';stars.frustumCulled=false;stars.count=0;stars.instanceMatrix.setUsage(T.DynamicDrawUsage);
 {const c=new T.Color(),pal=night?['#f4ff8a','#ffffff','#bfe7ff']:['#ffd84a','#ffffff','#ff8fb1','#8fe3ff'];for(let i=0;i<STARS;i++)stars.setColorAt(i,c.set(pal[i%pal.length]));}
 scene.add(stars);
 const sv=new Float32Array(STARS*4);// per star: direction x, y, z, spin
 for(let i=0;i<STARS;i++){const a=i/STARS*Math.PI*2+(i%3)*.4,u=.35+((i*7)%5)/7;sv[i*4]=Math.cos(a)*(1-u*.4);sv[i*4+1]=u;sv[i*4+2]=Math.sin(a)*(1-u*.4);sv[i*4+3]=(i%2?1:-1)*(2+i%4);}
 let burstT=-1;const burstAt=new T.Vector3(),m4=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(0,0,0,'YXZ'),pv=new T.Vector3(),sc=new T.Vector3(),camQ=new T.Quaternion(),q2=new T.Quaternion();
 // The species name over the net (a DOM label in the scene's host, projected each frame while shown).
 let label:HTMLDivElement|null=null;
 if(o.host&&typeof document!=='undefined'){label=document.createElement('div');label.className='catch-stage-label';label.dataset.catchLabel='';label.hidden=true;o.host.appendChild(label);}
 const api={scene,camera,bug,glow,longest,
  /** The bug this frame: where, which way, how big, and its wings / legs (wingAmp 0 and wingBase high = folded; open = wing cases). */
  setBug(x:number,y:number,z:number,yaw:number,pitch:number,roll:number,scale:number,w:{amp:number;base:number;open:number;legAmp:number;hz?:number}){
   e.set(pitch,yaw,roll);q.setFromEuler(e);bug.setMatrixAt(0,m4.compose(pv.set(x,y,z),q,sc.setScalar(scale)));bug.instanceMatrix.needsUpdate=true;
   flap.setXYZW(0,w.hz??prof.hz,w.amp,w.base,0);pose.setXYZW(0,w.open,0,w.legAmp,prof.legHz||9);flap.needsUpdate=true;pose.needsUpdate=true;
   if(glow){pv.copy(lantern).applyMatrix4(m4);glow.setMatrixAt(0,m4.compose(pv,q.identity(),sc.setScalar(Math.max(.35,scale*2.6))));glow.instanceMatrix.needsUpdate=true;}},
  /** The species' own flight wing beat (rate, amplitude, mid angle). */
  wings:{hz:prof.hz,amp:prof.amp,base:prof.base},
  /** Start the success burst round a point. */
  burst(x:number,y:number,z:number){burstAt.set(x,y,z);burstT=0;stars.count=STARS;},
  /** Per frame: the shader clock, the specks' slow turn, the burst. */
  update(dt:number,reduced:boolean){U.uTime.value=(U.uTime.value+dt)%600;if(!reduced)specks.rotation.y+=dt*.05;
   if(burstT>=0){burstT+=dt;const k=burstT/1.1;if(k>=1){burstT=-1;stars.count=0;}else{camera.getWorldQuaternion(camQ);
    for(let i=0;i<STARS;i++){const d=.25+.95*(1-(1-k)*(1-k)),s=(i%4===3?.07:.055)*(k<.15?k/.15:1-Math.max(0,(k-.6)/.4));
     pv.set(burstAt.x+sv[i*4]*d,burstAt.y+sv[i*4+1]*d*.9-k*k*.35,burstAt.z+sv[i*4+2]*d);q.copy(camQ);e.set(0,0,sv[i*4+3]*burstT);q.multiply(q2.setFromEuler(e));
     stars.setMatrixAt(i,m4.compose(pv,q,sc.setScalar(Math.max(0,s))));}stars.instanceMatrix.needsUpdate=true;}}},
  /** The name label at a world point (null hides it); `width`/`height` = the canvas size in CSS pixels. */
  label(text:string|null,x=0,y=0,z=0,width=0,height=0){if(!label)return;if(!text){if(!label.hidden)label.hidden=true;return;}
   if(label.textContent!==text)label.textContent=text;pv.set(x,y,z).project(camera);label.hidden=pv.z>1;
   label.style.transform=`translate(-50%,-100%) translate(${Math.round((pv.x+1)*width/2)}px,${Math.round((1-pv.y)*height/2)}px)`;},
  setAspect(aspect:number){if(Math.abs(camera.aspect-aspect)>1e-3){camera.aspect=aspect;camera.updateProjectionMatrix();}},
  /** Draw calls of the stage itself (backdrop, floor, specks, bug, glow, stars while bursting); the rig and the net come on top. */
  get draws(){return 4+(glow?1:0)+(stars.count>0?1:0);},
  dispose(){label?.remove();label=null;scene.clear();for(const x of owned)x.dispose();owned.length=0;stars.dispose();bug.dispose();glow?.dispose();},
 };
 return api;
}
export type CatchStage=ReturnType<typeof createCatchStage>;
