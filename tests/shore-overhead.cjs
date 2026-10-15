// Shore bake vs. things high overhead (Oct 14 2026, user: "not sure what this is to the left of the sand bar, remove this").
// The zipline cable is baked into the static island chunks, and the island shoreline's top-down height render read it as a dotted
// line of tall land across the sandbar channel: octagonal foam rings and pale shallow patches in open water, and a hard sand
// wedge where it crosses Summit Isle's north beach. lib/graphics/islandShore.ts dropOverheadLines() now reads a thin line of
// high cells as the ground round it (open sea under the cable), while buildings and the mountain keep their height.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Uint16Array,Float32Array,Float64Array,Int32Array,Array,Object,Number,Infinity,performance,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const {dropOverheadLines}=load('lib/graphics/islandShore.ts');
const Z=load('lib/town/zipline.ts'),{onLand}=load('lib/town/landmass.ts');
const WATER=-.42,HIGH=3;

// A window of the 1 m bake grid round the cable's sea crossing, built the way the bake reads it: the island ground where it is
// land (sand at 0.3 m over the water), nothing drawn over the sea, and the cable's cells (one per metre along it) on top.
function grid(x0,z0,w,h){
 const lift=new Float32Array(w*h).fill(-.5),high=new Uint8Array(w*h),drawn=new Uint8Array(w*h);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const k=z*w+x;if(onLand(x0+x+.5,z0+z+.5)){lift[k]=.3;drawn[k]=1;}}
 const cable=new Set();
 for(let t=0;t<=1;t+=.0005){const c=Z.cableAt(t),x=Math.floor(c.x-x0),z=Math.floor(c.z-z0);if(x<0||z<0||x>=w||z>=h)continue;
  const k=z*w+x,y=c.y-WATER;lift[k]=Math.min(1.5,y);drawn[k]=1;if(y>HIGH){high[k]=1;cable.add(k);}}
 return {lift,high,drawn,cable,w,h};
}
{const x0=550,z0=-110,G=grid(x0,z0,80,160);assert(G.cable.size>100,'the cable crosses the window');
 const before=G.lift.slice();dropOverheadLines(G.lift,G.high,G.drawn,G.w,G.h);
 let sea=0,beach=0;
 for(const k of G.cable){const x=x0+k%G.w+.5,z=z0+Math.floor(k/G.w)+.5;
  if(!onLand(x,z)){const nearLand=[-1,0,1].some(dz=>[-1,0,1].some(dx=>onLand(x+dx,z+dz)));
   // Water (under SHORE_LAND_LIFT); open sea (−0.5) away from the beach, part of the way up the sand slope next to it.
   assert(G.lift[k]<-.008,`water under the cable at ${x},${z} (${G.lift[k]}, was ${before[k]})`);if(!nearLand)assert.equal(G.lift[k],-.5);sea++;}
  else{assert(G.lift[k]<=.31&&G.lift[k]>=-.5,`the ground under the cable at ${x},${z}, not 1.5 (${G.lift[k]})`);beach++;}}
 assert(sea>40&&beach>20,`checked the channel (${sea}) and the beaches (${beach})`);
 // Nothing else in the window moved.
 for(let k=0;k<G.lift.length;k++)if(!G.cable.has(k))assert.equal(G.lift[k],before[k]);}

// Wide high ground keeps its height: a 6×5 building on land, and a mountain (a high disk with a ragged contour, its lower slope
// round it at the 1.5 m clamp) loses nothing, ragged cells included.
{const w=60,h=60,lift=new Float32Array(w*h).fill(-.5),high=new Uint8Array(w*h),drawn=new Uint8Array(w*h);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const k=z*w+x,r=Math.hypot(x-30,z-30);if(r<26){drawn[k]=1;lift[k]=r<20?1.5:.3;}
  // The 3 m contour: a disk of radius 12 with a ragged edge (single cells sticking out).
  if(r<12+((x*7+z*13)%3===0?1:0)){high[k]=1;lift[k]=1.5;}}
 for(let z=5;z<10;z++)for(let x=5;x<11;x++){const k=z*w+x;drawn[k]=1;high[k]=1;lift[k]=1.5;}
 const before=lift.slice();dropOverheadLines(lift,high,drawn,w,h);
 for(let k=0;k<lift.length;k++)assert.equal(lift[k],before[k],`unchanged at ${k%w},${Math.floor(k/w)}`);}

// Wiring: the bake marks high cells in the height render's blue channel and drops the lines before the distance fields.
{const src=fs.readFileSync('lib/graphics/islandShore.ts','utf8');
 assert(/const OVERHEAD=3;/.test(src)&&/vY-uWater>\$\{OVERHEAD\.toFixed\(1\)\}\?1\.:0\.,1\.\)/.test(src),'the height render flags overhead surfaces');
 assert(/setClearColor\(0x000000,0\)/.test(src),'cleared to alpha 0 so "nothing drawn" (open sea) reads as such');
 assert(/dropOverheadLines\(lift,high,drawn,NX,NZ\);\n return lift;/.test(src),'applied to the bake');
 assert(!/below\.position|readRenderTargetPixels\([^)]*under/.test(src),'one render: no second pass');}
console.log('shore-overhead: ok');
