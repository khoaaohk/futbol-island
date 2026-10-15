// Parachute descent smoothness and the high-altitude horizon (Oct 14 2026, user: "when parachuting down from the mountain. the
// view of the edge to the world is odd and parachuting down is a glitchy. it shakes").
// 1. Town's render pipeline replayed (fixed 60 Hz tick, x/z and now the flight height drawn interpolated, the camera locked to the
//    drawn height while a jet action runs) over real glides from the Summit 5s toward the main island, open sea and down onto the
//    island, at 20 / 30 / 60 / 120 fps with frame-time jitter: the frame-to-frame change of vertical velocity (player and camera)
//    stays small, and the player never moves against the camera. The old pipeline is measured too, so the metric is proven to see
//    the stair-stepping it replaced.
// 2. The parachute height itself: the blast arrives at rest with no deceleration jolt, the sink eases in and flares out, and a
//    re-aimed landing spot or a ledge never pops the canopy upward (rate-limited, never below the ground).
// 3. The horizon haze: the far-plane clip line fades into the sky colour (fog colour IS the background Color in every
//    time-of-day palette, fog far = camera far), the walk and cruise views never reach the haze, and the wiring has no extra draw.
// usage: node tests/parachute-smooth.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
const T=require('three');
const load=createLoader({three:T});
const S=load('lib/town/summitIsle.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts'),J=load('lib/town/jetpackActions.ts'),{flightRenderHeight}=load('lib/town/flightRender.ts');
const H=load('lib/graphics/horizonHaze.ts'),{createIslandLighting,ISLAND_LIGHT_PRESETS}=load('lib/graphics/islandLighting.ts');

// ---- 1. The render pipeline over real glides.
function glide({fps,jitterMs,steer,interpolate,seconds=45,seed=11}){
 let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
 const loc={...S.SUMMIT_LANDMARKS.pitch},roof=createRooftopTravel([],[],loc);roof.reset(loc.x,loc.z);
 const jet=J.createJetpackActions(),cam=S.createSummitCameraPull();
 let h=roof.surface(loc.x,loc.z)+2,prevH=h,acc=0,t=0;jet.start(1,h,0,roof.findLanding(loc.x,loc.z));
 const prev={...loc},camera={x:loc.x+16,y:h+23,z:loc.z+33},frames=[];
 while(t<seconds){const ms=1000/fps+(rnd()-.5)*2*jitterMs,dt=Math.min(ms/1000,.05);t+=dt;acc+=dt;
  while(acc>=1/60){prev.x=loc.x;prev.z=loc.z;prevH=h;if(jet.state.phase!=='idle')h=jet.update(1/60,loc,h,{blocked:(x,z)=>S.summitSolid(x,z,h),floor:roof.surface,steer:steer(t),scanHeld:false,reducedMotion:false,findLanding:roof.findLanding}).height;acc-=1/60;}
  const blend=acc*60,vx=prev.x+(loc.x-prev.x)*blend,vz=prev.z+(loc.z-prev.z)*blend,y=interpolate?flightRenderHeight(prevH,h,blend):h;
  // Town: flying → camGroundY = groundY; summit framing; x/z eased (14/s); y locked while a jet action runs.
  const tg={x:vx+16,y:23+y,z:vz+33};{const f=cam.update(vx,vz,y,tg.x,tg.y,tg.z,dt);if(f<1){tg.x=vx+(tg.x-vx)*f;tg.y=y+(tg.y-y)*f;tg.z=vz+(tg.z-vz)*f;}tg.y+=cam.lift;}
  const k=1-Math.exp(-dt*14);camera.x+=(tg.x-camera.x)*k;camera.z+=(tg.z-camera.z)*k;camera.y=tg.y;
  frames.push({dt,phase:jet.state.phase,py:y,cy:camera.y});if(jet.state.phase==='idle')break;}
 return frames;}
function jitter(frames){let p=0,c=0,rel=0;
 for(let i=2;i<frames.length;i++){const a=frames[i-2],b=frames[i-1],f=frames[i];if(a.phase!=='parachute'||f.phase!=='parachute')continue;
  p=Math.max(p,Math.abs((f.py-b.py)/f.dt-(b.py-a.py)/b.dt));c=Math.max(c,Math.abs((f.cy-b.cy)/f.dt-(b.cy-a.cy)/b.dt));rel=Math.max(rel,Math.abs((f.cy-f.py)-(b.cy-b.py)));}
 return {p,c,rel};}
const STEERS={'toward the main island':()=>({x:-1,z:-.3}),'toward open sea':()=>({x:1,z:.4}),'straight down onto the island':()=>({x:0,z:0})};
const JITTER_MAX=2.5;// m/s change of vertical velocity between two drawn frames (the old 120 Hz stairs: ~18)
const worst={};
for(const [name,steer] of Object.entries(STEERS))for(const [fps,jit] of [[20,0],[30,0],[30,4],[60,0],[60,1.5],[120,.5]]){
 const f=glide({fps,jitterMs:jit,steer,interpolate:true}),m=jitter(f);
 assert.equal(f[f.length-1].phase,'idle',`${name} @${fps} fps: lands`);
 assert(m.p<=JITTER_MAX&&m.c<=JITTER_MAX,`${name} @${fps}±${jit} ms: vertical jitter player ${m.p.toFixed(2)}, camera ${m.c.toFixed(2)} m/s per frame (≤ ${JITTER_MAX})`);
 assert(m.rel<1e-6,`${name} @${fps} fps: the camera holds the pilot still on screen (${m.rel})`);
 worst.p=Math.max(worst.p??0,m.p);worst.c=Math.max(worst.c??0,m.c);}
// The metric sees the old stairs: the latest tick's height drawn as-is at 120 Hz.
{const m=jitter(glide({fps:120,jitterMs:.5,steer:STEERS['toward the main island'],interpolate:false,seconds:8}));assert(m.p>10,`uninterpolated 120 Hz stairs are detected (${m.p.toFixed(1)})`);worst.old=m.p;}
// flightRenderHeight: interpolates, clamps the blend, and draws teleports at once.
assert.equal(flightRenderHeight(10,12,.25),10.5);assert.equal(flightRenderHeight(10,12,3),12);assert.equal(flightRenderHeight(NaN,12,.5),12);assert.equal(flightRenderHeight(0,40,.5),40,'a teleport is drawn at once');

// ---- 2. The parachute height.
{// Opening: the blast ends at rest (smootherstep) and the sink eases in; no tick changes vertical speed by more than 0.6 m/s.
 const jet=J.createJetpackActions(),p={x:0,z:0},env={blocked:()=>false,floor:()=>0,findLanding:()=>({x:0,z:0})};let h=2,prevV=0,worstDv=0,opened=false;jet.start(1,h,0,{x:0,z:0});
 for(let i=0;i<60*4;i++){const before=h;h=jet.update(1/60,p,h,env).height;const v=(h-before)*60;if(jet.state.phase==='parachute'){if(opened)worstDv=Math.max(worstDv,Math.abs(v-prevV));opened=true;}prevV=v;}// to touchdown (the landing itself is the landing animation's)
 assert(opened,'the canopy opens');assert(worstDv<.6,`the opening has no jolt (${worstDv.toFixed(2)} m/s in one tick)`);}
{// A re-aimed landing spot whose glide slope is above the canopy, and a ledge under it, raise it gently (never a pop) and never below ground.
 let k=0;const spots=[{x:60,z:0},{x:0,z:40}];
 const env={blocked:()=>false,floor:(x,z)=>x>20?4:0,findLanding:()=>spots[k++%2]},jet=J.createJetpackActions(),p={x:0,z:0};let h=6,maxUp=0,under=Infinity;
 jet.state.phase='parachute';jet.state.target={x:0,z:40};
 for(let i=0;i<60*12&&jet.state.phase==='parachute';i++){const before=h;h=jet.update(1/60,p,h,{...env,steer:{x:1,z:0}}).height;maxUp=Math.max(maxUp,h-before);under=Math.min(under,h-env.floor(p.x,p.z));}
 assert(maxUp<=J.PARACHUTE_RISE/60+1e-9,`never pops upward (largest rise ${maxUp.toFixed(3)} m in a tick)`);assert(under>=-1e-9,'never below the ground');}

// ---- 3. The horizon haze.
{const far=500;
 // Depth (along the view axis) of the farthest ground the fixed follow view sees: camera pitched down atan(23/√(16²+33²)), 40° fov.
 const pitch=Math.atan2(23,Math.hypot(16,33)),top=pitch-20*Math.PI/180,deepest=y=>y/Math.sin(top)*Math.cos(20*Math.PI/180);
 for(const [label,y] of [['walk',23],['walk on the summit',73],['jetpack cruise',51]])assert(deepest(y)<H.hazeRange(y,far).near,`${label}: the view never reaches the haze`);
 for(const y of [120,180,250,320]){const r=H.hazeRange(y,far);assert.equal(r.far,far,'fully sky-coloured at the clip line');assert(r.near<r.far-50&&r.near>=far*.6,`a soft band at ${y} m (${r.near.toFixed(0)}…${r.far})`);
  assert(deepest(y)>far,`at ${y} m the clip line is in view (so the haze is what hides it)`);}
 assert.equal(H.hazeRange(60,1600).far,1600,'follows a raised far plane');
 // The fog colour is the background Color itself, in every palette and through the lighting lerp.
 const scene=new T.Scene();scene.background=new T.Color('#e8b98b');const fog=H.attachHorizonHaze(scene);assert(fog.color===scene.background,'fog shares the background Color');
 const r={toneMappingExposure:1},hemi=new T.HemisphereLight(),sun=new T.DirectionalLight(),light=createIslandLighting(scene,hemi,sun,r);
 for(const mode of Object.keys(ISLAND_LIGHT_PRESETS)){light.update(mode,0,true);H.updateHorizonHaze(scene,{position:{y:250},far:500});
  assert.equal(scene.fog.color.getHexString(),new T.Color(ISLAND_LIGHT_PRESETS[mode].sky).getHexString(),`${mode}: the haze is the sky colour`);}
 light.update('day',1/30);H.updateHorizonHaze(scene,{position:{y:250},far:500});assert(scene.fog.color===scene.background,'mid-transition too');
 // three.js applies fog after tone mapping in the unlit colour space, the same space the clear colour uses: an exact match.
 const frag=fs.readFileSync(require.resolve('three/src/renderers/shaders/ShaderLib/meshphysical.glsl.js'),'utf8');assert(frag.indexOf('#include <fog_fragment>')>frag.indexOf('#include <colorspace_fragment>'),'fog after colour conversion');
 // Wiring: attached before the first compile in both scene builders, updated before Town's render; nothing drawn for it.
 const town=fs.readFileSync('components/Town.tsx','utf8'),warm=fs.readFileSync('lib/town/islandWarm.ts','utf8'),src=fs.readFileSync('lib/graphics/horizonHaze.ts','utf8');
 assert(town.includes("scene.background=new T.Color('#e8b98b');attachHorizonHaze(scene);")&&warm.includes("scene.background=new T.Color('#e8b98b');attachHorizonHaze(scene);"),'both scene builders attach the haze');
 assert(/updateHorizonHaze\(scene,camera\);[^\n]*\n\s*if\(resolution\)\{renderer\.setPixelRatio/.test(town),'Town updates it right before the render');
 assert(!/Mesh|Geometry|Material/.test(src.replace(/\/\*\*[\s\S]*?\*\//g,'')),'the haze adds no mesh, geometry or material');
 // And the shake fixes are wired: drawn flight height interpolated, the flying camera locked to it (no hop-lag sawtooth).
 assert(town.includes('flightRenderHeight(previousFlightHeight,flight.height,blend)')&&town.includes('previousFlightHeight=flight.height;tick(1/60)'),'Town draws the flight height interpolated');
 assert(town.includes('if(flying)camGroundY=groundY;'),'the flying camera follows the drawn height');}
console.log(`PASS parachute smooth: glides to the main island, open sea and the summit at 20/30/60/120 fps (±jitter) — worst vertical jitter player ${worst.p.toFixed(2)}, camera ${worst.c.toFixed(2)} m/s per frame (old uninterpolated 120 Hz: ${worst.old.toFixed(1)}), pilot steady on screen; no opening jolt, no upward pops; horizon haze = sky colour in day/sunset/night, out of the walk and cruise views`);
