// DRIP FC Stadium crowd life (Nov 13 2026): the shared mood (stadiumMood.ts: beat clock, chant cycle, excitement, the wave) and
// the mini-bean crowd's uniforms it drives (stadiumCrowd.ts): one instanced draw, the tri budget, no per-instance CPU work,
// reduced motion calm, fewer effects on hot devices, the stand flags in one draw. usage: node tests/stadium-crowd-life.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const M=load('lib/town/stadiumMood.ts'),C=load('lib/town/stadiumCrowd.ts'),H=load('lib/graphics/heatTier.ts'),L=load('lib/town/westParkLayout.ts'),S=L.STADIUM;
const mid={x:S.x,z:S.z},step=(n,dt,o)=>{for(let i=0;i<n;i++)M.stepStadiumMood(dt,o);return M.stadiumMood();};

// 1. The mood rests with no match, wakes with one; the beat clock is continuous across bpm changes; phases last 40–90 s.
{M.resetStadiumMood();const m=M.stadiumMood();
 step(10,.1,{live:false,exhibition:false,goals:0,ball:null});assert(!m.live&&m.excitement===0&&m.beat===0,'no match: at rest');
 const live={live:true,exhibition:true,goals:0,ball:mid};step(1,.1,live);assert(m.live&&m.phase==='quiet');
 const phases=[];let prevBeat=m.beat,prev=m.phase,since=0,maxJump=0;
 for(let i=0;i<10*600;i++){M.stepStadiumMood(.1,live);since+=.1;maxJump=Math.max(maxJump,m.beat-prevBeat);prevBeat=m.beat;
  if(m.phase!==prev){phases.push({phase:prev,len:since,chant:m.chant});since=0;prev=m.phase;}}
 assert(maxJump<.1*130/60+1e-9,'beat clock never jumps');
 const chants=phases.filter(p=>p.phase!=='quiet');assert(chants.length>=5,'several chants in 10 minutes: '+chants.length);
 for(const p of chants)assert(p.len>=M.CHANT_PHASE_S[0]-.2&&p.len<=M.CHANT_PHASE_S[1]+.2,`a chant lasts 40–90 s (${p.len.toFixed(1)})`);
 assert(phases.some(p=>p.phase==='slow-song'),'a slow song in the cycle');
 assert(M.CHANTS.every(c=>typeof c.id==='string'&&c.bpm>=60&&c.bpm<=130),'chant ids + bpm for the audio');}

// 2. Scarves rise in a slow song; the wave runs now and then while calm; goals and near misses spike the excitement.
{M.resetStadiumMood();const m=M.stadiumMood(),live={live:true,exhibition:false,goals:0,ball:mid};
 let scarfMax=0,waveSeen=0,waveInSlow=0;for(let i=0;i<10*900;i++){M.stepStadiumMood(.1,live);if(m.phase==='slow-song')scarfMax=Math.max(scarfMax,m.scarves);if(m.wave.on>.9)waveSeen++;if(m.wave.on>0&&m.phase==='slow-song'&&m.wave.left>M.WAVE_LAP_S*M.WAVE_LAPS-1)waveInSlow++;}
 assert(scarfMax>.9,'scarves up in a slow song');assert(waveSeen>0,'a Mexican wave in 15 minutes');assert.equal(waveInSlow,0,'no wave starts in a slow song');
 const base=m.excitement;assert(base>.25&&base<.4,'a live match: the base excitement '+base.toFixed(2));
 step(30,.1,{...live,ball:{x:S.x,z:S.z+S.pitchL/2-8}});assert(m.excitement>base+.2,'the ball near a goal: a chance lifts it');
 assert(M.excitementTarget(true,true,mid)<M.excitementTarget(true,false,mid),'an exhibition is calmer than a match with players');
 step(200,.1,live);const seq=m.seq;M.stepStadiumMood(.1,{...live,goals:1});assert(m.excitement>.98&&m.sinceGoal<.2&&m.seq>seq,'a goal: full excitement, seq bumps');
 step(300,.1,{...live,goals:1});assert(m.excitement<.5,'and it eases back');
 // near miss: in the box, then just past the goal line beside the post, no goal
 const L2=S.pitchL/2;M.stepStadiumMood(.1,{...live,goals:1,ball:{x:S.x+5,z:S.z+L2-1}});M.stepStadiumMood(.1,{...live,goals:1,ball:{x:S.x+5,z:S.z+L2+1}});
 step(8,.1,{...live,goals:1,ball:{x:S.x+5,z:S.z+L2+1}});assert(m.sinceNearMiss<.5&&m.excitement>=.8,'a near miss: an "ooh" spike');
 assert(!M.crossedNearMiss({x:S.x+20,z:S.z+L2-1},{x:S.x+20,z:S.z+L2+1}),'far from the posts: just a goal kick');
 step(5,.1,{live:false,exhibition:false,goals:0,ball:null});assert(!m.live&&m.excitement===0&&m.chant===null,'match over: rest');}

// 3. crowdLife: the uniforms from a mood; reduced motion calm; hot tiers fewer effects; nothing moves with no match.
{const mood={live:true,exhibition:false,bpm:110,beat:37.5,phase:'chant',chant:'ole-ole',phaseLeft:20,excitement:.6,scarves:0,wave:{on:1,angle:1,next:0,left:5},sinceGoal:9,sinceNearMiss:9,seq:1};
 const cool=C.crowdLife(mood,false,0),calm=C.crowdLife(mood,true,0),hot=C.crowdLife(mood,false,2);
 assert(cool.sway>0&&cool.pump>0&&cool.wave===1&&cool.excite===.6&&cool.beat===37.5%16&&cool.moving,'cool: sway, pumping arms, the wave');
 assert(calm.sway===0&&calm.pump===0&&calm.wave===0&&calm.flagSwing===0&&!calm.moving,'reduced motion: calm');
 assert(hot.wave===0&&hot.pump===0&&hot.sway<cool.sway,'hot device: no wave or pumping, less sway');
 const rest=C.crowdLife({...mood,live:false},false,0);assert(!rest.moving&&rest.sway===0&&rest.excite===0,'no match: still');
 assert(C.crowdLife({...mood,phase:'slow-song',scarves:1},false,0).scarf===1,'slow song: scarves');}

// 4. The crowd: one instanced draw + one flags draw, tri budget, uniforms written from the mood, the instance buffers untouched.
{H.forceHeatTier(0);M.resetStadiumMood();const parent=new T.Group(),crowd=C.createStadiumCrowd(parent,true);
 crowd.update(60,S.x+30,S.z,false,1/60,false);const mesh=crowd.mesh,flags=crowd.flags;
 assert(mesh.isInstancedMesh&&parent.children.filter(o=>o.isInstancedMesh).length===1,'ONE instanced mesh');
 assert(flags&&flags.geometry.index.count/3===C.FLAG_TRIS*C.STAND_FLAGS.phone,'phone: the stand flags in one merged mesh ('+C.STAND_FLAGS.phone+')');
 assert(C.STAND_FLAGS.phone<=C.STAND_FLAGS.desktop&&C.standFlagSpots(8).length===8);
 const spots=C.standFlagSpots(8),fans=C.crowdSeats();for(const p of spots)assert(!fans.some(f=>Math.hypot(f.x-p.x,f.z-p.z)<.3),'a flag stands on a free aisle seat, not on a fan');
 const sh={uniforms:{},vertexShader:'#include <color_vertex>\n#include <beginnormal_vertex>\n#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};mesh.material.onBeforeCompile(sh);
 for(const u of ['uBeat','uSway','uPump','uExcite','uWave','uScarf','uCheer','uClear','uClearF','uBodyPal','uSkinPal'])assert(sh.uniforms[u],'shader uniform '+u);
 assert(/vFanSkin/.test(sh.fragmentShader)&&/fanScarf/.test(sh.vertexShader)&&/uWave/.test(sh.vertexShader),'face, scarf and wave in the shaders');
 const fsh={uniforms:{},vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};flags.material.onBeforeCompile(fsh);assert(fsh.uniforms.uClock&&/fArg/.test(fsh.vertexShader),'flag wave in the vertex shader');
 const v0=mesh.instanceMatrix.version,c0=mesh.instanceColor.version,U=crowd.uniforms;
 for(let i=0;i<120;i++){M.stepStadiumMood(1/60,{live:false,exhibition:false,goals:0,ball:null});crowd.update(60,S.x+30,S.z,false,1/60,false);}
 assert(U.uSway.value===0&&U.uExcite.value===0,'no match: the crowd rests');const t0=U.uTime.value;
 for(let i=0;i<600;i++){M.stepStadiumMood(1/60,{live:true,exhibition:false,goals:0,ball:mid});crowd.update(60,S.x+30,S.z,false,1/60,false);}
 assert(U.uExcite.value>.2&&U.uBeat.value>0&&U.uTime.value>t0,'a match: the mood reaches the shader');
 assert(mesh.instanceMatrix.version===v0&&mesh.instanceColor.version===c0,'no per-instance CPU work');
 crowd.update(60,S.x+30,S.z,false,1/60,true);assert(U.uSway.value===0&&U.uPump.value===0&&U.uWave.value.x===0,'reduced motion: calm uniforms');
 H.forceHeatTier(2);crowd.update(60,S.x+30,S.z,false,1/60,false);assert(!flags.visible&&U.uWave.value.x===0,'hot phone: no flags, no wave');
 H.forceHeatTier(null);crowd.update(400,0,0,false,1/60,false);assert(!mesh.visible&&!flags.visible);crowd.dispose();assert(parent.children.length===0,'disposed');}

// 5. stadiumSit steps the mood every frame before the crowd and hands the feed the score + the flags.
{const sit=fs.readFileSync(path.join(base,'lib/town/stadiumSit.ts'),'utf8');assert(/stepStadiumMood\(dt,\{live,exhibition,goals:score\.gold\+score\.blue,ball:live\?ball:null\}\);[\s\S]{0,80}crowd\.update\(/.test(sit),'stadiumSit steps the mood, then the crowd');}
console.log('stadium crowd life: ok');
})().catch(e=>{console.error(e);process.exit(1);});
