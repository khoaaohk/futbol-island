// Fishing polish pass (Oct 14 2026, user: "spend more time polishing up the fishing experience. subtle animations and improve water,
// coral, and fish"): the motion hooks exist in the shaders, the sway / extra life / particles follow the heat tiers, nothing runs at
// rest outside fishing, the draw count went DOWN (splash rings and drops moved into the overlay's one draw), the per-spot seabed
// stays within +15 % of its triangles before the pass, and the biter still swims continuously (no teleports).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const ROOT=path.resolve(__dirname,'..');
function environment(){
 const cache=new Map();
 const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,structuredClone,queueMicrotask,
  Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
 function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));
  cache.set(file,mod.exports);return mod.exports;}
 return {load};
}
const e=environment(),src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};

// ---- 1. The heat gate: sway, extra life and particles only on the cool tiers, never with reduced motion or still water ----
{const {fishingLife}=e.load('lib/town/fishing/fishingLife.ts');
 for(const t of [0,1]){const l=fishingLife(t,false,1);ok(l.sway&&l.life&&l.particles,`tier ${t}: sway, life and particles on (phones too, detail 1)`);ok(fishingLife(t,false,2).sway,`tier ${t}: desktop sway`);}
 for(const t of [2,3,4]){const l=fishingLife(t,false,2);ok(!l.sway&&!l.life&&!l.particles,`tier ${t}: sway, life and particles off`);}
 for(const t of [0,1,2]){const l=fishingLife(t,true,2);ok(!l.sway&&!l.life&&!l.particles,`reduced motion at tier ${t}: calm`);}
 ok(!fishingLife(0,false,0).sway&&!fishingLife(0,false,0).life,'still water (governor slow / static ambience): no sway, no extra life');
 const vis=src('lib/town/fishing/fishingVisuals.ts');
 ok(/life=fishingLife\(effectiveTier\(\),reduced,WATER_UNIFORMS\.uWaterDetail\.value\);UW_UNIFORMS\.uUwSway\.value=life\.sway\?1:0;overlay\.setLife\(life\.particles\);schools\.setLife\(life\.life\);/.test(vis),'visuals apply the gate every fishing frame (uniform writes only)');}

// ---- 2. Shader hooks (patched onto three's real Lambert / Standard shaders, so a renamed include fails here) ----
const lam=()=>({uniforms:{},vertexShader:T.ShaderLib.lambert.vertexShader,fragmentShader:T.ShaderLib.lambert.fragmentShader});
const n=160,size=80,lift=new Float32Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++)lift[j*n+i]=-40+(j+.5)*size/n<-8?.3:-.5;
const field={box:new T.Vector4(-40,-40,size,size),n,size,lift,distance:(x,z)=>z+8};
const uw=e.load('lib/town/fishing/underwater.ts'),cat=e.load('lib/town/fishing/fishCatalog.ts'),sea=e.load('lib/town/fishing/fishSchools.ts');
{const reef=uw.buildSeabedProps(field,uw.reefTheme(cat.spotById('coral-garden')),{x:0,z:-9},{x:0,z:1},true,1,4.5,25),sh=lam();reef.mesh.material.onBeforeCompile(sh);
 ok(/if\(uUwSway>\.5&&uWaterDetail>\.5&&aSway>0\.\)/.test(sh.vertexShader),'reef sway gated by uUwSway (the heat gate) and the still path, on phones too');
 ok(/hp=fract\(sin\(dot\(floor\(position\.xz\*3\.\)/.test(sh.vertexShader),'reef sway is phase-varied per piece');
 ok(sh.uniforms.uUwSway&&uw.UW_UNIFORMS.uUwSway.value===0,'uUwSway shared, off until a fishing frame turns it on');
 ok(reef.mesh.geometry.getAttribute('aSway'),'sway weights per vertex');reef.dispose();}
{const scene=new T.Scene(),fs2=sea.createFishSchools(scene,true),sh=lam();fs2.mesh.material.onBeforeCompile(sh);
 ok(/uwKind=floor\(iMotion\.z\+\.01\),uwAmp=fract\(iMotion\.z\+\.01\)\/\.45/.test(sh.vertexShader),'fish: per-instance swim strength packed with the kind');
 ok(/sin\(ph-position\.z\*6\.\)\*\(\.085\*aBend\+\.012\)\*\(\.55\+\.9\*uwAmp\)/.test(sh.vertexShader),'fish: tail-driven S-curve scaled by speed');
 ok(!fs2.mesh.visible,'sea life hidden until a session begins');fs2.dispose();}
{const strip=src('lib/town/fishing/shoreWater.ts');
 ok(/float gust=\.5\+\.5\*sin\(/.test(strip)&&/lines=.*\(\.45\+\.95\*gust\)/.test(strip),'water: ripple lines come and go in drifting gusts');
 ok(/else if\(uWaterDetail>\.5\)glint=/.test(strip),'water: an ALU sparkle on phones');
 ok(/smoothstep\(\.74,1\.,sph\)\*\(\.5\+\.5\*smoothstep/.test(strip),'water: softer, broken swell crests');
 ok(/aniso=min\(pa,pb\)/.test(strip)&&/unsmear=smoothstep\(\.1,\.45,aniso\)/.test(strip)&&/caus=uwCaustic\(P\)\*uwCausticFade\(h\)\*unsmear/.test(strip),'water: no smeared caustic streaks under the swash');}
{const vis=src('lib/town/fishing/fishingVisuals.ts');
 ok(/pow\(rim,3\.\)/.test(vis)&&/fishing-catch-wag-under-v2/.test(vis),'the swimming catch has a rim (clearer biter silhouette)');
 ok(/lineSag=reduced\?sagTarget:lineSag\+/.test(vis),'the line sag eases between states');
 ok(/swellBob=/.test(vis)&&/bobber\.rotation\.z=reduced\?0:swellTilt/.test(vis),'the float rides the swell (still with reduced motion)');
 ok(/overlay\.burst\(bob\.x,SURFACE\+\.02,bob\.z,14,1\.1\)/.test(vis),'the catch leaving the water splashes');
 ok(/overlay\.drip\(/.test(vis),'the held catch drips');
 ok(!/RingGeometry|SphereGeometry\(\.035/.test(vis),'no separate ring or spray meshes any more');}
{const col=src('lib/town/fishing/deepSeaScene.ts');ok(/vPulse/.test(col)&&/sin\(uTime\*1\.3\+vSeed\*7\.\)/.test(col),'deep column: jelly glow pulse, plankton twinkle');}
{const st=src('lib/town/fishing/fishingStore.ts');ok(/navigator\.vibrate\(p\)/.test(st)&&/prefers-reduced-motion/.test(st)&&/plunge:14,fanfare:\[10,40,18\]/.test(st),'gentle haptics on bite and catch, none with reduced motion');
 ok(/reel:\[\['fi2-job-cue','snip'\]\]/.test(st)&&/cast:\[\['fi2-job-cue','throw'\]\]/.test(st),'cast whoosh and reel click reuse the island sound kit');}

// ---- 3. Nothing at rest: the overlay (rings, drops, bubbles) sleeps once its effects finish; no timers anywhere ----
{const {createFishingOverlay}=e.load('lib/town/fishing/fishingOverlay.ts'),scene=new T.Scene(),o=createFishingOverlay(scene,uw.UW_UNIFORMS);
 ok(!o.mesh.visible&&!o.busy,'overlay hidden before fishing');
 o.begin();o.setBubbleSources([{x:0,y:-3,z:5}]);o.setLife(true);o.ring(0,0,1,1);o.burst(0,-.4,0,10,1);for(let i=0;i<120;i++)o.frame(1/30,false,i/30);
 ok(o.mesh.count>0,'rings / drops / bubbles drawn while fishing');
 o.end();for(let i=0;i<200;i++)o.frame(1/30,false,4+i/30);ok(!o.mesh.visible&&!o.busy&&o.mesh.count===0,'overlay asleep after the session (no work at rest)');
 o.begin();o.setLife(false);o.burst(0,-.4,0,10,1);o.frame(1/30,false,0);
 ok(o.mesh.count===0,'no drops when the gate is off (tier 2+)');o.dispose();
 for(const f of ['fishingOverlay.ts','fishSchools.ts','fishingVisuals.ts','fishingLife.ts','deepSeaScene.ts','underwater.ts','shoreWater.ts'])ok(!/requestAnimationFrame|setInterval|setTimeout/.test(src('lib/town/fishing/'+f)),`${f}: no timers or own frame loop`);}

// ---- 4. Draw budget: the visuals create fewer drawables than before the pass (5 ring meshes + 1 spray mesh retired) ----
{const vis=src('lib/town/fishing/fishingVisuals.ts');const meshes=(vis.match(/new T\.(Mesh|InstancedMesh|Line)\(/g)||[]).length;
 // Before: rod, crank, line, bobber, shadow, held, reeled, catch, 5 rings (one material each), spray = 14 drawables.
 ok(meshes<=8,`fishing visuals own ${meshes} drawables (was 14)`);
 const ov=src('lib/town/fishing/fishingOverlay.ts');ok((ov.match(/new T\.(Mesh|InstancedMesh)\(/g)||[]).length===1,'rings, drops and bubbles share the overlay\'s ONE instanced draw');
 const fsh=src('lib/town/fishing/fishSchools.ts');ok((fsh.match(/new T\.(Mesh|InstancedMesh)\(/g)||[]).length===1,'darters share the sea life\'s ONE instanced draw');}

// ---- 5. Seabed triangles per spot within +15 % of before the pass (snapshot taken from the pre-polish tree, Oct 14 2026) ----
{const BEFORE={"south-pier":[4923,2745],"west-pier":[4347,2379],"harbour-wall":[3425,1744],"north-rocks":[4870,2946],"west-cove":[3676,1926],"east-pier":[3714,2182],"causeway-gate":[3744,2714],"causeway-channel":[3432,1776],"turtle-bank":[4160,2380],"coral-garden":[7228,4152],"sharks-beach":[8270,4340],"farm-beach":[6036,3334],"summit-cove":[2910,1664],"summit-palm":[4796,2752],"summit-lookout":[4970,3148],"summit-ledge":[3930,2388]};
 const kinds=new Set();
 for(const s of cat.FISH_SPOTS){if(s.deep)continue;const b=BEFORE[s.id];if(!b)continue;
  [false,true].forEach((phone,k)=>{const p=uw.buildSeabedProps(field,uw.reefTheme(s),{x:0,z:-9},{x:0,z:1},phone,uw.reefSeed(s.id),phone?4.5:9,25);
   ok(p.triangles<=b[k]*1.15,`${s.id} ${phone?'phone':'desktop'}: ${p.triangles} triangles (before ${b[k]}, cap +15 %)`);p.dispose();});
  for(const kd of Object.keys(uw.reefTheme(s).kinds))kinds.add(kd);}
 ok(['brain','branch','stag','fan','table','anemone','tube','soft','barrel','plate'].every(k=>kinds.has(k)),'ten coral shapes in use across the spots (barrel sponge and plate coral added)');}

// ---- 6. The biter's path stays continuous through approach, nibbles and the bite (no teleports) ----
{const core=e.load('lib/town/fishing/fishingCore.ts');let worst=0,runs=0;
 for(const spot of cat.FISH_SPOTS)for(let seed=1;seed<=4;seed++){let st=seed*99991;const r=()=>{st=(st*16807)%2147483647;return (st-1)/2147483646;};
  const stand={x:spot.x,z:spot.z},cast=core.castPoint(spot,stand),s=core.createSession();core.tapSession(s);let prev=null,steps=0;
  while(steps++<2400&&!['bite','scared','escaped'].includes(s.phase)){core.stepSession(s,spot,1/30,r,{easy:false,out:cast.dir,approach:(rr,f)=>core.planApproach(cast,rr,f)});
   if(s.shadow&&prev)worst=Math.max(worst,Math.hypot(s.shadow.x-prev.x,s.shadow.z-prev.z));prev=s.shadow?{x:s.shadow.x,z:s.shadow.z}:null;}
  runs++;}
 ok(worst<.25,`biter moves at most ${worst.toFixed(3)} m per 1/30 s frame (${runs} approaches)`);}

// ---- 7. The shark's surface fin is never a separate part (Oct 15 2026, user: "fish has fin that's separate") ----
// In the clear water the catch is drawn as its own species model (its dorsal fin is part of the body, fishModels) and the bite pose
// moves that body to the hook while fishingCore's silhouette stays put; the flat fin billboard anchored to the silhouette floated a
// fish-length from the shark. It is now the silhouette-only cue (A/B water), and the wake follows the drawn body.
{const vis=src('lib/town/fishing/fishingVisuals.ts');
 ok((vis.match(/overlay\.mark\('fin'/g)||[]).length===1,'one fin cue in the visuals');
 ok(/const bodyDrawn=catchFish\.visible,bx=bodyDrawn\?catchPos\.x:shWorld\.x,bz=bodyDrawn\?catchPos\.z:shWorld\.z;/.test(vis),'the fin / wake anchor is the drawn body when there is one, else the silhouette');
 ok(/if\(!bodyDrawn\)overlay\.mark\('fin',fx,SURFACE\+fs\*\.42,fz,fs,0,a\);/.test(vis),'the flat fin billboard shows only when the dark silhouette is the whole body (no species model drawn)');
 ok(/shWorld\.mode!=='nibble'&&shWorld\.mode!=='bite'\)overlay\.mark\('wake',fx-mx\*\.55\*L/.test(vis),'the wake trails the same anchor and stays off at the hook');
 const models=src('lib/town/fishing/fishModels.ts');ok(/function shark\(/.test(models)&&/fin\(b,L,\{t0:o\.dorsalT\?\?\.36/.test(models),'the shark species model carries its dorsal fin on the body');}

console.log(`PASS fishing polish: heat-gated sway / life / particles, shader hooks, overlay sleeps at rest, fewer draws, seabed ≤ +15 %, continuous biter, shark fin on the body (${checks} checks)`);
