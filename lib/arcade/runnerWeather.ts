import * as T from 'three';
import type {ArcadeStage} from './arcadeStage';
import type {RunnerGame} from './runnerGame';
import {RUNNER_MODES} from './runnerModes';
import {TERRAINS,type TerrainId} from '../../components/games/runnerRoute';

/**
 * Breakaway Run scenery for round 3 (Oct 26 2026): route skies, storm rain and lightning, the stadium run-in gate,
 * the goal-line finish arch, and the pooled meshes for rolling balls, the magnet power-up and the boss keeper ring.
 *
 * Heat budget (all built once; nothing allocates per frame):
 *  - Sky: the existing dome and lights are retinted (uniform/colour lerps), no new draw.
 *  - Rain: ONE LineSegments buffer (70 streaks on phones, 140 on desktop), drawn only on the Storm route.
 *  - Gates: one shared post/banner/line geometry set; the kick-off gate (4 meshes) shows only for the first
 *    ~40 m, the finish arch (4 meshes) only within 150 m of a finite route's goal line.
 *  - Rollers: two single-mesh balls (one draw each, vertex-coloured), magnet: one glow orb + its ring.
 * Reduced motion: no rain, no lightning flash (no flashing light), rollers do not spin.
 */
type SkyPalette={top:string;horizon:string;hills:string;towers:string;hemi:string;hemiI:number;sunI:number;glowK:number};
const SKIES:Record<'arcade'|'night'|'storm',SkyPalette>={
 arcade:{top:'#05061a',horizon:'#150f36',hills:'#0f0b2c',towers:'#151236',hemi:'#b7eaff',hemiI:1.55,sunI:2.1,glowK:1},
 night:{top:'#010210',horizon:'#080a20',hills:'#05061a',towers:'#0b0c26',hemi:'#8fa8ff',hemiI:1.05,sunI:1.55,glowK:.55},
 storm:{top:'#0a0d16',horizon:'#1d2433',hills:'#121722',towers:'#161c2a',hemi:'#a6b6cc',hemiI:1.1,sunI:1.1,glowK:.4},
};
/** Horizon glow per terrain: the time of day drifts along the route (sunset on the beach and roofs, blue hour on the bridge). */
const GLOW:Record<TerrainId,string>={grass:'#5a2a7a',sand:'#c2552e',cobbles:'#6a3a6a',snow:'#6f8fc0',mud:'#5a3a2a',neon:'#a02a8a',rooftop:'#d0603a',bridge:'#2a6a9a'};
type SkyTarget={uTop:{value:T.Color};uHorizon:{value:T.Color};uGlow:{value:T.Color};uHills:{value:T.Color};uTowers:{value:T.Color}};

function bannerTexture(text:string,bg:string,fg:string){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');if(!g)return null;
 g.fillStyle=bg;g.fillRect(0,0,512,96);g.fillStyle=fg;g.font='900 58px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,52);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function checkerTexture(){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=64;c.height=8;const g=c.getContext('2d');if(!g)return null;
 for(let x=0;x<16;x++)for(let y=0;y<2;y++){g.fillStyle=(x+y)%2?'#111111':'#ffffff';g.fillRect(x*4,y*4,4,4);}
 const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.colorSpace=T.SRGBColorSpace;return t;
}

export function createRunnerScenery(stage:ArcadeStage){
 const {scene,reduced,mobile}=stage;
 let hemi:T.HemisphereLight|null=null,sun:T.DirectionalLight|null=null;
 scene.traverse(o=>{if((o as T.HemisphereLight).isHemisphereLight)hemi=o as T.HemisphereLight;else if((o as T.DirectionalLight).isDirectionalLight)sun=o as T.DirectionalLight;});
 const hemiLight=hemi as T.HemisphereLight|null,sunLight=sun as T.DirectionalLight|null;

 const want={top:new T.Color(),horizon:new T.Color(),glow:new T.Color(),hills:new T.Color(),towers:new T.Color(),hemi:new T.Color()},tmp=new T.Color();
 let hemiI=1.55,sunI=2.1,skyMode='',skyTerrain='',flash=0,nextBolt=6,elapsed=0,thunderPending=0;

 /* ---- gates: shared geometry, two banners ---- */
 const postGeo=new T.BoxGeometry(.32,5,.32),bannerGeo=new T.BoxGeometry(10.2,1.15,.18),lineGeo=new T.PlaneGeometry(8.8,.9);lineGeo.rotateX(-Math.PI/2);
 const postMat=new T.MeshLambertMaterial({color:'#e8eef7'}),glowMat=new T.MeshBasicMaterial({color:'#73fff1',toneMapped:false});
 const lineMap=checkerTexture(),lineMat=new T.MeshBasicMaterial({map:lineMap,color:lineMap?'#ffffff':'#dddddd'});
 function gate(name:string,text:string,bg:string,fg:string){
  const g=new T.Group();g.name=name;g.visible=false;const map=bannerTexture(text,bg,fg);
  for(const side of[-1,1]){const p=new T.Mesh(postGeo,postMat);p.position.set(side*5.1,2.5,0);p.castShadow=true;g.add(p);}
  const banner=new T.Mesh(bannerGeo,map?new T.MeshBasicMaterial({map,toneMapped:false}):new T.MeshBasicMaterial({color:bg}));banner.position.set(0,5.1,0);g.add(banner);
  const line=new T.Mesh(lineGeo,lineMat);line.position.set(0,.03,0);g.add(line);
  const trim=new T.Mesh(bannerGeo,glowMat);trim.scale.set(1.02,.12,1.2);trim.position.set(0,4.45,0);g.add(trim);
  scene.add(g);return g;}
 const kickoff=gate('runner-kickoff','KICK-OFF','#1d2a52','#ffe07a');
 const finish=gate('runner-finish','GOAL LINE','#ffd36e','#1a1030');

 /* ---- rain: one buffer of streaks, storm only ---- */
 const DROPS=mobile?70:140,rainPos=new Float32Array(DROPS*6),rainSeed=new Float32Array(DROPS*3);
 for(let i=0;i<DROPS;i++){rainSeed[i*3]=-12+((i*37)%97)/97*24;rainSeed[i*3+1]=((i*53)%89)/89*11;rainSeed[i*3+2]=-44+((i*29)%83)/83*52;}
 const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPos,3).setUsage(T.DynamicDrawUsage));rainGeo.boundingSphere=new T.Sphere(new T.Vector3(0,5,-18),50);
 const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#a9bfe0',transparent:true,opacity:.42,depthWrite:false}));rain.name='runner-rain';rain.visible=false;rain.frustumCulled=false;scene.add(rain);

 /* ---- rolling balls and the magnet orb ---- */
 const ballGeo=new T.IcosahedronGeometry(.32,1).toNonIndexed(),cols:number[]=[];
 for(let f=0;f<ballGeo.attributes.position.count/3;f++){const dark=f%5===0;for(let v=0;v<3;v++)cols.push(dark?.12:.98,dark?.14:.96,dark?.18:.9);}
 ballGeo.setAttribute('color',new T.Float32BufferAttribute(cols,3));
 const ballMat=new T.MeshLambertMaterial({vertexColors:true});
 const rollers=[0,1].map(i=>{const m=new T.Mesh(ballGeo,ballMat);m.name=`runner-roller-${i}`;m.castShadow=true;m.visible=false;scene.add(m);return m;});
 const orb=new T.Mesh(new T.IcosahedronGeometry(.34,1),new T.MeshBasicMaterial({color:'#ff62c2',toneMapped:false}));orb.name='runner-magnet';orb.visible=false;scene.add(orb);
 const orbRing=stage.ring(0,0,.62,'#ffd36e');orbRing.name='runner-magnet-ring';orbRing.visible=false;
 const bossRing=stage.ring(0,0,1.1,'#ffd36e');bossRing.name='runner-boss-ring';bossRing.visible=false;

 let sky:SkyTarget|null=null,fogColor:T.Color|null=null;
 /** Hook up the route's sky dome uniforms and fog colour (created by runnerTrack after this module). */
 function attach(target:{sky:SkyTarget;fogColor:T.Color}){sky=target.sky;fogColor=target.fogColor;skyMode='';}
 function setTargets(s:RunnerGame){const pal=SKIES[RUNNER_MODES[s.mode]?.sky??'arcade'];
  want.top.set(pal.top);want.horizon.set(pal.horizon);want.hills.set(pal.hills);want.towers.set(pal.towers);want.hemi.set(pal.hemi);
  want.glow.set(GLOW[s.terrain]??GLOW.grass).multiplyScalar(pal.glowK);hemiI=pal.hemiI;sunI=pal.sunI;}

 function update(dt:number,s:RunnerGame){
  elapsed+=dt;
  if(s.mode!==skyMode||s.terrain!==skyTerrain){const first=!skyMode;skyMode=s.mode;skyTerrain=s.terrain;setTargets(s);
   // First frame of a run: snap, so the ready screen already shows the route's sky.
   if(first&&sky){sky.uTop.value.copy(want.top);sky.uHorizon.value.copy(want.horizon);sky.uGlow.value.copy(want.glow);sky.uHills.value.copy(want.hills);sky.uTowers.value.copy(want.towers);}}
  const k=1-Math.exp(-dt*.8);
  if(sky){sky.uTop.value.lerp(want.top,k);sky.uHorizon.value.lerp(want.horizon,k);sky.uGlow.value.lerp(want.glow,k);sky.uHills.value.lerp(want.hills,k);sky.uTowers.value.lerp(want.towers,k);}
  // Fog is the horizon colour (same object in runnerTrack), so it follows automatically.
  void fogColor;
  // Storm: lightning every 6-10 s (two quick flickers), thunder a moment later. Never under reduced motion.
  const storm=RUNNER_MODES[s.mode]?.sky==='storm',live=s.lives>0&&!s.finished;
  if(storm&&!reduced&&live){nextBolt-=dt;if(nextBolt<=0){nextBolt=6+((Math.floor(elapsed*7))%5);flash=1;thunderPending=.45;}}
  flash=Math.max(0,flash-dt*3.2);const flick=flash>0?(flash>.66||flash<.33&&flash>.15?1:.35)*flash:0;
  if(thunderPending>0){thunderPending-=dt;if(thunderPending<=0)s.thunder++;}
  if(hemiLight){hemiLight.color.lerp(want.hemi,k);hemiLight.intensity+=(hemiI+flick*2.6-hemiLight.intensity)*(flick>0?1:k);}
  if(sunLight)sunLight.intensity+=(sunI-sunLight.intensity)*k;
  if(sky&&flick>0)sky.uTop.value.lerp(tmp.set('#8fa3c8'),flick*.5);

  const travel=s.speed*dt*(s.lives>0||s.outro>0?1:0);
  rain.visible=storm&&!reduced;
  if(rain.visible){for(let i=0;i<DROPS;i++){const j=i*3;rainSeed[j+1]-=dt*17;rainSeed[j+2]+=travel*.9;if(rainSeed[j+1]<0)rainSeed[j+1]+=11;if(rainSeed[j+2]>8)rainSeed[j+2]-=52;
    const x=rainSeed[j],y=rainSeed[j+1],z=rainSeed[j+2],q=i*6,len=.55+s.speed*.02;rainPos[q]=x;rainPos[q+1]=y;rainPos[q+2]=z;rainPos[q+3]=x+.06;rainPos[q+4]=y+len;rainPos[q+5]=z-len*.5;}
   rainGeo.attributes.position.needsUpdate=true;}

  // Gates: kick-off gate at 8 m (the run-in), finish arch on the goal line of finite routes.
  const kz=-(8-s.distance);kickoff.visible=kz<6&&kz>-60;if(kickoff.visible)kickoff.position.z=kz;
  const fz=s.finish?-(s.finish-s.distance):99;finish.visible=!!s.finish&&fz<4&&fz>-150;if(finish.visible)finish.position.z=fz;

  // Rollers, magnet orb, boss ring.
  let r=0;orb.visible=orbRing.visible=false;bossRing.visible=false;
  for(const o of s.objects){
   if(o.kind==='roller'&&!o.passed&&r<rollers.length){const m=rollers[r++];m.visible=true;m.position.set(o.x??0,.32,o.z);if(!reduced)m.rotation.z-=(o.roll??0)*dt/.32;}
   else if(o.kind==='magnet'&&!o.passed){orb.visible=orbRing.visible=true;const bob=reduced?0:Math.sin(elapsed*5)*.12;orb.position.set(o.lane*2.4,.7+bob,o.z);orb.rotation.y=elapsed*2;orbRing.position.set(o.lane*2.4,.04,o.z);orbRing.scale.setScalar(reduced?1:1+Math.sin(elapsed*6)*.1);}
   else if(o.kind==='goal'&&o.final&&o.keeper&&!o.scored&&o.z<1){bossRing.visible=true;bossRing.position.set(o.kx??0,.05,o.z+.55);bossRing.scale.setScalar(reduced?1:1+Math.sin(elapsed*4)*.08);}
  }
  for(;r<rollers.length;r++)rollers[r].visible=false;
 }
 function reset(){skyMode='';flash=0;nextBolt=6;thunderPending=0;rain.visible=kickoff.visible=finish.visible=orb.visible=orbRing.visible=bossRing.visible=false;for(const m of rollers)m.visible=false;}
 return{attach,update,reset,active:()=>flash>0||thunderPending>0,debug:()=>({rain:rain.visible,drops:DROPS,kickoff:kickoff.visible,finish:finish.visible,rollers:rollers.filter(m=>m.visible).length,orb:orb.visible,boss:bossRing.visible,flash,sky:skyMode+'|'+skyTerrain,glow:sky?'#'+sky.uGlow.value.getHexString():''})};
}
export type RunnerScenery=ReturnType<typeof createRunnerScenery>;
export const runnerTerrainName=(id:TerrainId)=>TERRAINS[id].name;
