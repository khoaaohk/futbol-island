// Tropical water pass (Oct 26 2026, docs/TROPICAL_WATER_OCT26.md): turquoise shallows, sun glitter, shallow caustics and a wet
// sheen were added WITHOUT more heat. Owner rule: per render path the fragment cost must be equal or LOWER than before, on phone and
// desktop. This pins it: the static GLSL estimate (tests/water-tropical-glslcost.cjs) of every path against the frozen baseline of
// fa7d217d, no new texture / mesh / material / draw, the glitter's LOD + heat + reduced-motion gates, and no per-frame allocation.
// Run: node --expose-gc tests/water-tropical-cost.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');
const {waterPaths}=require('./water-tropical-glslcost.cjs');
const load=createLoader();
const W=load('lib/graphics/waterSurface.ts');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// Baseline (fa7d217d, before the pass), same estimator: ALU ops / texture reads per fragment.
const BASE={
 ocean:{far:{alu:767,tex:4},nearPhone:{alu:1262,tex:4},nearPhoneHot:{alu:1262,tex:4},nearDesk:{alu:1723,tex:5},still:{alu:1124,tex:4}},
 shore:{still:{alu:333,tex:1},far:{alu:564,tex:1},nearPhone:{alu:568,tex:2},nearPhoneHot:{alu:568,tex:2},nearDesk:{alu:589,tex:2}},
};
// Nov 10 2026 (owner: "enhance the oceans ... without major heat"; docs/performance-guide.md "Ocean, land and buildings look"):
// wind lanes (2 sin) and the night tint (1 mul) were added on purpose; far whitecaps were removed the same day (owner's call).
// Allowance on the two tier-0 phone ocean paths that had no headroom left; every other path still sits at or under its baseline.
BASE.ocean.far.alu+=25;BASE.ocean.nearPhone.alu+=20;// measured 790 and 1280 (+3 % / +1.4 %)
// Nov 11 2026 sea state (docs/performance-guide.md "Sea state"): swell trains, per-coast shore swell and swash, two-way chop, paid
// for by moving work to the vertex shaders and cheaper per-wave hashing. Ratchet: the paths that went DOWN are pinned at the new figures.
Object.assign(BASE.ocean.far,{alu:788});Object.assign(BASE.ocean.nearPhone,{alu:1254});Object.assign(BASE.ocean.nearDesk,{alu:1568});
for(const [k,v] of Object.entries({still:301,far:432,nearPhone:473,nearPhoneHot:436,nearDesk:473}))BASE.shore[k].alu=v;
const now=waterPaths(src('lib/graphics/waterSurface.ts'),src('lib/graphics/islandShore.ts'));

ok('fragment cost per path is not higher than before (ALU and texture reads; ocean + shore strip; phone, desktop, hot, still, far)',()=>{
 const rows=[];
 for(const part of ['ocean','shore'])for(const p of Object.keys(BASE[part])){const a=BASE[part][p],b=now[part][p];rows.push(`${part}.${p} ${a.alu}/${a.tex} -> ${b.alu}/${b.tex}`);
  assert(b.alu<=a.alu,`${part}.${p}: ALU ${b.alu} > baseline ${a.alu}`);assert(b.tex<=a.tex,`${part}.${p}: texture reads ${b.tex} > baseline ${a.tex}`);}
 console.log('     '+rows.join('\n     '));
 // the strip lost its per-fragment field read everywhere; hot phones (glitter off) and the still path got cheaper, not equal
 assert(now.shore.nearPhone.tex<BASE.shore.nearPhone.tex&&now.shore.far.tex<BASE.shore.far.tex&&now.shore.still.tex<BASE.shore.still.tex);
 assert(now.ocean.nearPhoneHot.alu<BASE.ocean.nearPhoneHot.alu&&now.ocean.still.alu<BASE.ocean.still.alu);});

ok('no new texture, mesh, material or draw call; the noise / field textures are reused',()=>{
 const shore=src('lib/graphics/islandShore.ts'),ws=src('lib/graphics/waterSurface.ts');
 assert.equal((shore.match(/new T\.DataTexture\(/g)||[]).length,2,'field + lace only');
 assert.equal((ws.match(/new T\.DataTexture\(/g)||[]).length,1,'the 1x1 empty placeholder only');
 assert.equal((shore.match(/new T\.Mesh\(/g)||[]).length,1);assert.equal((shore.match(/new T\.\w*Material\(/g)||[]).length,2,'strip material + the bake-only height material');
 assert(!/new T\.(Mesh|Points|InstancedMesh|\w*Material|DataTexture|WebGLRenderTarget)\b/.test(ws.slice(ws.indexOf('export const WATER_GLIMMER_GLSL'))),'no GPU objects in the glitter / ocean patch');
 // the strip reads the island field once per VERTEX (not per fragment); its fragment reads only the lace, near the camera
 const strip=shore.slice(shore.indexOf('const STRIP_GLSL='),shore.indexOf('/** The island shoreline: call'));
 assert(!/isleSample\(|shoreEdge\(/.test(strip),'no field read / box edge per strip fragment');
 assert(/vSh=vec4\(sh\.gba,1\.-uShore\*shoreEdge\(vWaterXZ\)\)/.test(shore),'field + fishing fade per vertex');
 assert.equal((strip.match(/texture(2D|Grad)?\(/g)||[]).length,1,'one lace fetch');});

ok('LOD: glitter only in the near-camera light-net branch, fading with the pixel footprint; strip caustics / glints only inside the near lace branch',()=>{
 const ws=src('lib/graphics/waterSurface.ts'),map=ws.slice(ws.indexOf("#include <map_fragment>',"));
 const reach=map.indexOf('if(reachS>0.)'),call=map.indexOf('waterGlitter(');assert(reach>0&&call>reach,'called inside if(reachS>0.)');
 assert.equal((ws.match(/waterGlitter\(/g)||[]).length,2,'defined once, called once');
 const g=W.WATER_GLIMMER_GLSL;
 assert.match(g,/float k=uSunGlitter\*\(1\.-smoothstep\(\.055,\.11,pxm\)\);if\(k<=0\.\)return vec3\(0\.\);/,'fades out by the pixel footprint (core never under ~1.5 px), early out');
 assert(!/texture2D|texture\(/.test(g),'glitter: ALU only');
 const shore=src('lib/graphics/islandShore.ts');
 assert(/if\(vFar<\.999\)\{lz=[^\n]*\n(?:\s*\/\/[^\n]*\n)*\s*if\(uSunGlitter>0\.\)\{[^}]*cau=[^}]*sparkle=/.test(shore),'caustics + glints inside the near lace branch, on the glitter gate');});

ok('heat / Battery saver / reduced motion gates: glitter + caustics off at tier >= 2, governor slow, saver, reduced motion; still path draws none',()=>{
 const L=W.sunGlitterLevel;
 assert.equal(L(0,false,false,false),1);assert.equal(L(1,false,false,false),1);
 for(const t of [2,3,4])assert.equal(L(t,false,false,false),0,'tier '+t);
 assert.equal(L(0,true,false,false),0,'saver');assert.equal(L(0,false,true,false),0,'governor slow');assert.equal(L(0,false,false,true),0,'reduced motion');
 assert.match(W.WATER_GLIMMER_GLSL,/if\(uWaterDetail<\.5\)return vec3\(0\.\);/,'still path (tiers 3-4, reduced, slow): none');
 const town=src('components/Town.tsx');
 assert(/setWaterDetail\(stillWater\?0:quality\.phone\?1:2\);setSunGlitter\(sunGlitterLevel\(heat\.tier,heat\.saver,heat\.governor\.last\.state==='slow',reduced\)\)/.test(town),'Town sets the gate next to the detail level, once per frame');
 // no flashing: every speck's twinkle is a smooth cosine under 1 Hz (owner: nothing faster than 3 Hz)
 const m=/tw=\.5-\.5\*cos\(6\.2832\*\(uWaterTime\*\(([\d.]+)\+([\d.]+)\*h2\)\+h3\)\)/.exec(W.WATER_GLIMMER_GLSL);assert(m,'smooth cosine twinkle');assert(+m[1]+ +m[2]<1,'max '+(+m[1]+ +m[2])+' Hz');
 const shore=src('lib/graphics/islandShore.ts'),s=/sin\(t\*([\d.]+)\+lz\.r/.exec(shore);assert(s&&+s[1]/(2*Math.PI)<1,'strip glints under 1 Hz');});

ok('no per-frame allocation: the gate + clock step keep the heap flat',()=>{
 const U=W.WATER_UNIFORMS;const run=n=>{for(let i=0;i<n;i++){W.setSunGlitter(W.sunGlitterLevel(i%5,false,i%7===0,false));W.stepWaterTime(1/60,false);}};
 run(5000);
 if(typeof global.gc!=='function'){console.log('     (run with --expose-gc for the heap check; skipped)');return;}
 global.gc();const h0=process.memoryUsage().heapUsed;run(200000);global.gc();const h1=process.memoryUsage().heapUsed;
 assert(h1-h0<256*1024,'heap grew '+(h1-h0)+' bytes');assert(U.uSunGlitter.value===0||U.uSunGlitter.value===1);});

ok('sea state (Nov 11 2026): exposure bake (cove < open coast), work per vertex, seamless train speeds, swash per strip vertex',()=>{
 const S=load('lib/graphics/islandShore.ts'),w=200,h=200,sdf=new Float32Array(w*h);
 // land everywhere x < 60, plus a cove: land walls z < 80 and z > 120 for x < 140 (water between them opens east at x 60..140)
 const land=(x,z)=>x<60||(x<140&&(z<80||z>120));
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){let best=1e9;for(let r=0;r<=60&&best>r;r+=1)for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r]]){const xx=x+dx,zz=z+dz;if(xx>=0&&zz>=0&&xx<w&&zz<h&&land(xx,zz)!==land(x,z))best=Math.min(best,r);}sdf[z*w+x]=land(x,z)?-best:best;}
 const E=S.seaExposure(sdf,w,h,w/2,h/2),at=(x,z)=>E[Math.floor(z/2)*(w/2)+Math.floor(x/2)];
 assert(at(70,100)<at(180,100)-.25,'cove '+at(70,100).toFixed(2)+' vs open '+at(180,100).toFixed(2));
 const ws=src('lib/graphics/waterSurface.ts'),shore=src('lib/graphics/islandShore.ts');
 assert(/void oceanVaryings\(vec2 p\)/.test(ws)&&/oceanVaryings\(vWaterXZ\)/.test(ws),'ocean: phases, look point and dive hit per vertex');
 for(const t of W.SEA_STATE.trains)assert(Number.isInteger(t.cycles),'whole cycles per wrap');
 assert(/swashVertex\(sh,/.test(shore)&&/e=vSw\.x;rush=vSw\.y;/.test(shore),'swash per strip vertex');
 assert(/data\[i\*4\+3\]=h16\(expo\[i\]\)/.test(shore),'field A = exposure (no new texture)');});

if(failed){console.log(failed+' failed');process.exit(1);}
