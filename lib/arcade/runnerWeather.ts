import * as T from 'three';
import type {ArcadeStage} from './arcadeStage';
import type {RunnerGame} from './runnerGame';
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
/* Nov 10 2026 (docs/arcade-aaa/runner-direction.md): every route sky is its own scene of the same comic coast, not a recolour.
 * 'arcade' golden hour (huge low sun, long shadows) · 'night' a moon, stars and lit street lamps that throw pools on the road ·
 * 'storm' a slate cloud shelf with the sunset burning in the slit under it, rain and lightning · 'final' magenta dusk afterglow,
 * lamps half lit · 'legend' a blood-red sun on violet. All of it is uniform values on the one dome, the one terrain mesh and the
 * comic shading pass: no new light, mesh or draw call. shade/light are the linear multipliers of the two print bands. */
type SkyPalette={top:string;mid:string;haze:string;sunCore:string;sunRing:string;cloudLit:string;cloudShade:string;headA:string;headB:string;seaNear:string;seaFar:string;glitter:string;sand:string;rim:string;lantern:string;
 shade:[number,number,number];light:[number,number,number];sunEl:number;sunR:number;stars:number;storm:number;lamp:number;glit:number;az:number;elev:number};
const SKIES:Record<'arcade'|'night'|'storm'|'final'|'legend',SkyPalette>={
 arcade:{top:'#3a67b0',mid:'#f39a62',haze:'#ffd386',sunCore:'#fff4bc',sunRing:'#ffb347',cloudLit:'#fff0c8',cloudShade:'#e88a78',headA:'#6f4a80',headB:'#b97a94',seaNear:'#1f9aa0',seaFar:'#eea56c',glitter:'#fff4bc',sand:'#f4d79c',rim:'#ffe09a',lantern:'#fff3d6',
  shade:[.56,.48,.76],light:[1,.97,.88],sunEl:.075,sunR:.085,stars:0,storm:0,lamp:0,glit:1,az:-.2,elev:.27},
 night:{top:'#0d1238',mid:'#1d2a6a',haze:'#33479a',sunCore:'#f4f1dc',sunRing:'#8fa3e6',cloudLit:'#4a5cae',cloudShade:'#1d2660',headA:'#0c1030',headB:'#18205a',seaNear:'#16347a',seaFar:'#101f58',glitter:'#dfe6ff',sand:'#6a70a8',rim:'#cfe0ff',lantern:'#ffd27a',
  shade:[.26,.3,.6],light:[.6,.68,1],sunEl:.135,sunR:.05,stars:1,storm:0,lamp:1,glit:.8,az:-.25,elev:.5},
 storm:{top:'#2b3446',mid:'#4a566a',haze:'#ffb35a',sunCore:'#fff1b0',sunRing:'#ff7a3a',cloudLit:'#66758c',cloudShade:'#39465a',headA:'#232a3a',headB:'#4a4f66',seaNear:'#2a6a72',seaFar:'#c98a5a',glitter:'#ffd9a0',sand:'#bfae8c',rim:'#ffc27a',lantern:'#ffd27a',
  shade:[.34,.38,.54],light:[.82,.8,.76],sunEl:.06,sunR:.07,stars:0,storm:1,lamp:.35,glit:.7,az:-.4,elev:.24},
 final:{top:'#2a1f6a',mid:'#c8457a',haze:'#ff9a6a',sunCore:'#ffe2a0',sunRing:'#ff6a5a',cloudLit:'#ff9aa0',cloudShade:'#8a3a8a',headA:'#3a1f5a',headB:'#8a4a8a',seaNear:'#3a5aa8',seaFar:'#d0708a',glitter:'#ffd0a0',sand:'#e0a890',rim:'#ffb0a0',lantern:'#ffd27a',
  shade:[.46,.38,.72],light:[1,.88,.84],sunEl:.055,sunR:.1,stars:.5,storm:0,lamp:.6,glit:.9,az:-.34,elev:.2},
 legend:{top:'#1c0f3e',mid:'#5a1f6a',haze:'#c83a5a',sunCore:'#ff5a3a',sunRing:'#ff2a4a',cloudLit:'#8a2f7a',cloudShade:'#3a1650',headA:'#140a2a',headB:'#4a1a52',seaNear:'#3a2a7a',seaFar:'#2a1a5a',glitter:'#ff8a6a',sand:'#a85a7a',rim:'#ff7a5a',lantern:'#ffd27a',
  shade:[.36,.28,.62],light:[1,.8,.82],sunEl:.1,sunR:.125,stars:.7,storm:0,lamp:.5,glit:1,az:-.25,elev:.26},
};
type U<V>={value:V};
/** What runnerTrack exposes for retinting (all mutated in place). */
type WorldTarget={sky:{uTop:U<T.Color>;uMid:U<T.Color>;uHaze:U<T.Color>;uSunCore:U<T.Color>;uSunRing:U<T.Color>;uCloudLit:U<T.Color>;uCloudShade:U<T.Color>;uHeadA:U<T.Color>;uHeadB:U<T.Color>;uSun:U<T.Vector3>;uStars:U<number>;uStorm:U<number>};
 ink:{uInkShade:U<T.Color>;uInkLight:U<T.Color>;uInkRim:U<T.Color>;uInkLamp:U<T.Vector4>};sea:{uSeaNear:U<T.Color>;uSeaFar:U<T.Color>;uGlitter:U<T.Color>;uSand:U<T.Color>;uSea:U<T.Vector4>};lantern:T.Color;sunAim:{az:number;elev:number};fogColor:T.Color};
const COLOUR_KEYS=['top','mid','haze','sunCore','sunRing','cloudLit','cloudShade','headA','headB','seaNear','seaFar','glitter','sand','rim','lantern'] as const;

function bannerTexture(text:string,bg:string,fg:string){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');if(!g)return null;
 g.fillStyle='#231a2e';g.fillRect(0,0,512,96);g.fillStyle=bg;g.fillRect(7,7,498,82);g.font='italic 900 60px "Arial Black", Impact, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=9;g.strokeStyle='#231a2e';g.strokeText(text,256,51);g.fillStyle=fg;g.fillText(text,256,51);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}

export function createRunnerScenery(stage:ArcadeStage){
 const {scene,reduced,mobile}=stage;
 let hemi:T.HemisphereLight|null=null,sun:T.DirectionalLight|null=null;
 scene.traverse(o=>{if((o as T.HemisphereLight).isHemisphereLight)hemi=o as T.HemisphereLight;else if((o as T.DirectionalLight).isDirectionalLight)sun=o as T.DirectionalLight;});
 const hemiLight=hemi as T.HemisphereLight|null;

 // Every sky's colours are parsed once; a frame only lerps the live uniforms toward the current sky's set.
 const parsed=Object.fromEntries(Object.entries(SKIES).map(([id,p])=>[id,{...Object.fromEntries(COLOUR_KEYS.map(k=>[k,new T.Color(p[k])])),shade:new T.Color().setRGB(...p.shade),light:new T.Color().setRGB(...p.light)}])) as Record<string,Record<typeof COLOUR_KEYS[number]|'shade'|'light',T.Color>>;
 const tmp=new T.Color(),white=new T.Color('#ffffff');
 let pal:SkyPalette=SKIES.arcade,want=parsed.arcade,skyMode='',flash=0,nextBolt=6,elapsed=0,thunderPending=0;const HEMI=hemiLight?.intensity??.55;

 /* ---- gates: shared geometry, two banners ---- */
 const postGeo=new T.BoxGeometry(.32,5,.32),bannerGeo=new T.BoxGeometry(10.2,1.15,.18),lineGeo=new T.PlaneGeometry(8.8,.9,16,2).toNonIndexed();lineGeo.rotateX(-Math.PI/2);
 // Heat (pass 2): the chequered line is painted into the plane's vertices (one texture fewer).
 {const n=lineGeo.attributes.position.count,col=new Float32Array(n*3),ink=new T.Color('#231a2e'),paper=new T.Color('#fff3d6');for(let q=0;q<n/6;q++){const c=((q%16)+Math.floor(q/16))%2?ink:paper;for(let v=0;v<6;v++)col.set([c.r,c.g,c.b],(q*6+v)*3);}lineGeo.setAttribute('color',new T.BufferAttribute(col,3));}
 const postMat=new T.MeshLambertMaterial({color:'#fff3d6'}),glowMat=new T.MeshBasicMaterial({color:'#231a2e'});
 const lineMat=new T.MeshBasicMaterial({vertexColors:true});
 function gate(name:string,text:string,bg:string,fg:string){
  const g=new T.Group();g.name=name;g.visible=false;const map=bannerTexture(text,bg,fg);
  for(const side of[-1,1]){const p=new T.Mesh(postGeo,postMat);p.position.set(side*5.1,2.5,0);p.castShadow=true;g.add(p);}
  const banner=new T.Mesh(bannerGeo,map?new T.MeshBasicMaterial({map,toneMapped:false}):new T.MeshBasicMaterial({color:bg}));banner.position.set(0,5.1,0);g.add(banner);
  const line=new T.Mesh(lineGeo,lineMat);line.position.set(0,.03,0);g.add(line);
  const trim=new T.Mesh(bannerGeo,glowMat);trim.scale.set(1.02,.12,1.2);trim.position.set(0,4.45,0);g.add(trim);
  scene.add(g);return g;}
 const kickoff=gate('runner-kickoff','KICK-OFF','#f0452e','#fff3d6');
 const finish=gate('runner-finish','GOAL LINE','#ffc83a','#fff3d6');

 /* ---- rain: one buffer of streaks, storm only ---- */
 const DROPS=mobile?70:140,rainPos=new Float32Array(DROPS*6),rainSeed=new Float32Array(DROPS*3);
 for(let i=0;i<DROPS;i++){rainSeed[i*3]=-12+((i*37)%97)/97*24;rainSeed[i*3+1]=((i*53)%89)/89*11;rainSeed[i*3+2]=-44+((i*29)%83)/83*52;}
 const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPos,3).setUsage(T.DynamicDrawUsage));rainGeo.boundingSphere=new T.Sphere(new T.Vector3(0,5,-18),50);
 const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#eef3ff',transparent:true,opacity:.6,depthWrite:false}));rain.name='runner-rain';rain.visible=false;rain.frustumCulled=false;scene.add(rain);

 /* ---- rolling balls and the magnet orb ---- */
 const ballGeo=new T.IcosahedronGeometry(.32,1).toNonIndexed(),cols:number[]=[];
 for(let f=0;f<ballGeo.attributes.position.count/3;f++){const dark=f%5===0;for(let v=0;v<3;v++)cols.push(dark?.03:.98,dark?.02:.95,dark?.05:.86);}
 ballGeo.setAttribute('color',new T.Float32BufferAttribute(cols,3));
 const ballMat=new T.MeshLambertMaterial({vertexColors:true});ballMat.userData.runnerRim=true;
 const rollers=[0,1].map(i=>{const m=new T.Mesh(ballGeo,ballMat);m.name=`runner-roller-${i}`;m.castShadow=true;m.visible=false;scene.add(m);return m;});
 const orb=new T.Mesh(new T.IcosahedronGeometry(.34,1),new T.MeshBasicMaterial({color:'#19b5a5'}));orb.name='runner-magnet';orb.visible=false;scene.add(orb);
 const orbRing=stage.ring(0,0,.62,'#fff3d6');orbRing.name='runner-magnet-ring';orbRing.visible=false;
 const bossRing=stage.ring(0,0,1.1,'#ffc83a');bossRing.name='runner-boss-ring';bossRing.visible=false;

 let world:WorldTarget|null=null;
 /** Hook up the route's sky dome, shading and sea uniforms (created by runnerTrack after this module). */
 function attach(target:WorldTarget){world=target;skyMode='';}
 function apply(k:number){const w=world;if(!w)return;const c=want,y=w.sky;
  y.uTop.value.lerp(c.top,k);y.uMid.value.lerp(c.mid,k);y.uHaze.value.lerp(c.haze,k);y.uSunCore.value.lerp(c.sunCore,k);y.uSunRing.value.lerp(c.sunRing,k);y.uCloudLit.value.lerp(c.cloudLit,k);y.uCloudShade.value.lerp(c.cloudShade,k);y.uHeadA.value.lerp(c.headA,k);y.uHeadB.value.lerp(c.headB,k);
  y.uSun.value.y+=(pal.sunEl-y.uSun.value.y)*k;y.uSun.value.z+=(pal.sunR-y.uSun.value.z)*k;y.uStars.value+=(pal.stars-y.uStars.value)*k;y.uStorm.value+=(pal.storm-y.uStorm.value)*k;
  w.ink.uInkShade.value.lerp(c.shade,k);w.ink.uInkLight.value.lerp(c.light,k);w.ink.uInkRim.value.lerp(c.rim,k);
  w.sea.uSeaNear.value.lerp(c.seaNear,k);w.sea.uSeaFar.value.lerp(c.seaFar,k);w.sea.uGlitter.value.lerp(c.glitter,k);w.sea.uSand.value.lerp(c.sand,k);w.sea.uSea.value.y+=(pal.lamp-w.sea.uSea.value.y)*k;w.sea.uSea.value.z+=(pal.glit-w.sea.uSea.value.z)*k;
  w.lantern.lerp(c.lantern,k);w.sunAim.az+=(pal.az-w.sunAim.az)*k;w.sunAim.elev+=(pal.elev-w.sunAim.elev)*k;}

 function update(dt:number,s:RunnerGame){
  elapsed+=dt;
  // Endless play (Nov 10 2026): the sky is the ROUND's (s.sky: the route's own in round 1, the next one along after every goal line), so a
  // long run passes golden hour, dusk, night, storm and red sun. Same dome, same lights: only the targets the uniforms ease toward change.
  if(s.sky!==skyMode){const first=!skyMode;skyMode=s.sky;const id=s.sky in SKIES?s.sky:'arcade';pal=SKIES[id];want=parsed[id];
   // First frame of a run: snap, so the ready screen already shows the route's sky.
   if(first)apply(1);}
  const k=1-Math.exp(-dt*.8);apply(k);
  // Fog is the haze colour (same object in runnerTrack), so it follows automatically.
  // Storm: lightning every 6-10 s (two quick flickers), thunder a moment later. Never under reduced motion.
  const storm=s.sky==='storm',live=s.lives>0&&!s.finished;
  if(storm&&!reduced&&live){nextBolt-=dt;if(nextBolt<=0){nextBolt=6+((Math.floor(elapsed*7))%5);flash=1;thunderPending=.45;}}
  flash=Math.max(0,flash-dt*3.2);const flick=flash>0?(flash>.66||flash<.33&&flash>.15?1:.35)*flash:0;
  if(thunderPending>0){thunderPending-=dt;if(thunderPending<=0)s.thunder++;}
  // A lightning flick is a white panel: the fill light jumps (everything prints in its light band) and the cloud shelf whitens.
  if(hemiLight)hemiLight.intensity=HEMI+flick*2.4;
  // ...and every character gets a white rim for the flick (the comic shading pass reads uInkLamp.z).
  if(world)world.ink.uInkLamp.value.z=flick;
  if(world&&flick>0){world.sky.uCloudShade.value.lerp(white,flick*.6);world.sky.uTop.value.lerp(tmp.set('#c9d6f0'),flick*.6);world.ink.uInkLight.value.lerp(white,flick*.5);}

 const travel=s.speed*dt*(s.lives>0||s.outro>0?1:0);
  rain.visible=storm&&!reduced;
  if(rain.visible){for(let i=0;i<DROPS;i++){const j=i*3;rainSeed[j+1]-=dt*17;rainSeed[j+2]+=travel*.9;if(rainSeed[j+1]<0)rainSeed[j+1]+=11;if(rainSeed[j+2]>8)rainSeed[j+2]-=52;
    const x=rainSeed[j],y=rainSeed[j+1],z=rainSeed[j+2],q=i*6,len=.55+s.speed*.02;rainPos[q]=x;rainPos[q+1]=y;rainPos[q+2]=z;rainPos[q+3]=x+.06;rainPos[q+4]=y+len;rainPos[q+5]=z-len*.5;}
   rainGeo.attributes.position.needsUpdate=true;}

  // Gates: kick-off gate at 8 m (the run-in), finish arch on the goal line of finite routes.
  const kz=-(8-s.distance);kickoff.visible=kz<6&&kz>-60;if(kickoff.visible)kickoff.position.z=kz;
  // The arch of a goal line just cleared stays where it stood until it is behind the camera; then the one arch moves to the next goal line.
  const behind=s.lastFinish?s.distance-s.lastFinish:99,fz=s.finish?-((behind<8?s.lastFinish:s.finish)-s.distance):99;finish.visible=!!s.finish&&fz<4&&fz>-150;if(finish.visible)finish.position.z=fz;

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
 return{attach,update,reset,active:()=>flash>0||thunderPending>0,debug:()=>({rain:rain.visible,drops:DROPS,kickoff:kickoff.visible,finish:finish.visible,rollers:rollers.filter(m=>m.visible).length,orb:orb.visible,boss:bossRing.visible,flash,sky:skyMode,haze:world?'#'+world.sky.uHaze.value.getHexString():'',lamp:world?world.sea.uSea.value.y:0,storm:world?world.sky.uStorm.value:0})};
}
export type RunnerScenery=ReturnType<typeof createRunnerScenery>;
export const runnerTerrainName=(id:TerrainId)=>TERRAINS[id].name;
