// Dive shoals see-through (Oct 20 2026; user: "these dive spots need to look more like the shore where it's see through", then
// "blend in more on the edges ... it needs to feel like a shallow coral area"; lib/graphics/divePreview.ts, waterSurface.ts DIVE_SHOAL):
// the ocean's patch dissolves over a wide noise-broken band (no rim line), turns see-through only in the blended program over the
// capped seabed preview (sand shelf, coral heads, the wreck), and the preview is bounded, gated by heat tier / range / diving.
// Run: node tests/dive-see-through.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt,Infinity,NaN};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const D=load('lib/town/water/diveSpots.ts'),WS=load('lib/graphics/waterSurface.ts'),P=load('lib/graphics/divePreview.ts'),UW=load('lib/town/fishing/underwater.ts');

ok('the ocean patch: a wide soft noise-broken edge (no rim line), see-through only by uDiveClear, light net over the shoal; still 2 slots',()=>{
 const ws=read('lib/graphics/waterSurface.ts');
 assert(!ws.includes('smoothstep(.8,.92,q)'),'the old bright rim band is gone');
 assert(ws.includes('uniform float uDiveClear[${DIVE_SLOTS}]')&&WS.WATER_UNIFORMS.uDiveClear.value.length===D.DIVE_SLOTS&&D.DIVE_SLOTS===2,'one float per slot, 2 slots');
 assert(WS.DIVE_SHOAL.fade-WS.DIVE_SHOAL.inner>=1,'the edge dissolves over a wide band (q '+WS.DIVE_SHOAL.inner+' to '+WS.DIVE_SHOAL.fade+')');
 assert(/clearWinW\(vWaterXZ,[^)]*\)-\.5\)\*\$\{DIVE_SHOAL\.wobble/.test(ws),'the edge is broken by low-frequency noise (ALU, no texture read)');
 assert(ws.includes('mix(1.,clearWinAlpha(1.,dd),diveClr)'),'the blended program clears the shoal by uDiveClear, as the shore window at that shore distance');
 // The shoal is the shore's shallows: the depth colour, the light net and the alpha read the shoal's shore distance dd.
 // The heart reads as the shore's sandy shallows only where the preview is on (diveClr); off (tier 3-4, Battery saver, far) it is a
 // flat muted turquoise (SHOAL_OPAQUE_D), never a khaki sandbar.
 assert(ws.includes('float dd=min(d,mix(d,mix(${SHOAL_OPAQUE_D.toFixed(1)},${DIVE_SHOAL.heart.toFixed(1)},clamp(diveClr/max(diveK,1e-3),0.,1.)),diveK));'),'never deeper than the shore (no ring over the shallows)');assert(/diveClr\*=smoothstep\(/.test(ws),'the see-through part eases out at grazing views (Fresnel)');
 const TK=load('lib/graphics/waterTokens.ts');assert(TK.SHOAL_OPAQUE_D>=6&&TK.SHOAL_OPAQUE_D<=12,'the opaque heart is turquoise water, not the sandy shallows');assert.equal(WS.DIVE_SHOAL.heart,TK.SHOAL_HEART_D);
 for(const k of ['smoothstep(.3,5.,dd)','1.-smoothstep(3.,24.,dd)','smoothstep(25.,110.,dd)','float nearS=1.-smoothstep(10.,45.,dd);','smoothstep(1.5,7.,dd)'])assert(ws.includes(k),k);
 assert(!/uDiveTint\[i\]/.test(ws.split('#include <map_fragment>')[1]||''),'no milky tint of its own');
 assert.equal(WS.diveShoreD(40,1),WS.DIVE_SHOAL.heart);assert.equal(WS.diveShoreD(40,0),40);
});
ok('the seabed preview per zone: bounded triangles, under the surface, shoaling to the heart, rim under the shore bed floor; wrecks drawn',()=>{
 for(const s of D.DIVE_SPOTS){const g=P.buildDivePreview(s),pos=g.getAttribute('position'),tris=pos.count/3;
  assert(tris<=P.DIVE_PREVIEW.maxTris,'cap '+s.id+' '+tris);let top=-Infinity;for(let i=0;i<pos.count;i++)top=Math.max(top,pos.getY(i));
  assert(top<UW.UW_SURFACE-.1,'all under the water (a stranded hull reaches up to just under it) '+s.id+' '+top);g.dispose();}
 assert(P.previewDepth(0)<P.previewDepth(.6)&&P.previewDepth(.6)<P.previewDepth(1),'deeper toward the edge');assert(P.previewDepth(0)>1.2&&P.previewDepth(0)<2.2,'a sandy heart a metre or two down');
 assert(P.previewDepth(P.DIVE_PREVIEW.reach)>4.2,'the rim sinks below the shore window floor (CLEAR_BED.floor)');
 const wreck=D.DIVE_SPOTS.find(s=>s.theme.wreck),plain=D.DIVE_SPOTS.find(s=>!s.theme.wreck&&s.radius===wreck.radius);
 if(plain){const a=P.buildDivePreview(wreck),b=P.buildDivePreview(plain);assert(a.getAttribute('position').count>b.getAttribute('position').count-200,'the wreck adds geometry');a.dispose();b.dispose();}
 // Near a beach the shore bed may be shallower: the shelf rides over it inside the outline.
 const s=D.diveSpotById('pauls-grotto'),g=P.buildDivePreview(s,()=>2),pos=g.getAttribute('position');let inside=0,over=0;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);if(Math.hypot(x-s.x,z-s.z)<s.radius*.5){inside++;if(UW.UW_SURFACE-pos.getY(i)<=1.86)over++;}}
 assert(inside>50&&over/inside>.8,'the shelf (coral bases aside) rides over the shore bed '+over+'/'+inside);g.dispose();
});
ok('gating: off at heat tier 3-4 / Battery saver, out of range and while diving; at most 2 draws; holds then releases the ocean blend; dispose clean',()=>{
 const scene=new T.Scene(),ocean=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial());ocean.name='surrounding-ocean';scene.add(ocean);
 const near=[];D.nearestDiveSpots(342,-282,near);WS.setDiveSpots(near);
 const pv=P.createDivePreview(scene),CL=WS.WATER_UNIFORMS.uDiveClear.value;
 pv.update(1,342,-282,3);assert.equal(pv.stats.draws,0);assert.equal(CL[0],0);assert.equal(ocean.material.blending,T.NormalBlending,'tier 3: opaque sea');
 pv.update(1,342,-282,0);assert(pv.stats.draws>=1&&pv.stats.draws<=2);assert.equal(CL[0],1);assert.equal(ocean.material.blending,T.CustomBlending,'blended over the shoal');
 assert(pv.stats.triangles<=2*P.DIVE_PREVIEW.maxTris);
 pv.update(1,342,-282,0,false);assert.equal(pv.stats.draws,0,'diving: off');assert.equal(ocean.material.blending,T.NormalBlending,'released');
 pv.update(1,-400,-282,0);assert.equal(pv.stats.draws,0,'out of range');
 pv.update(1,342,-282,4);assert.equal(pv.stats.draws,0,'Battery saver');
 pv.update(1,342,-282,0);pv.dispose();assert.equal(scene.children.length,1,'only the ocean left');assert.equal(ocean.material.blending,T.NormalBlending);assert.equal(CL[0],0);
});
ok('Town wires it: per frame after the shore window with the effective tier, off while diving, the shore bed depth, disposed',()=>{
 const t=read('components/Town.tsx');
 assert(/divePreview\.update\(dt,player\.root\.position\.x,player\.root\.position\.z,heat\.tier\+\(quality\.phone&&heat\.tier>=2\?1:0\),!dive\.diving\)/.test(t));
 assert(t.includes('createDivePreview(scene,(x,z)=>{const f=world.islandShore.field;return f?clearBedDepthAt(f,x,z):Infinity;},clearWin.shoalMaterial())'),'the shore seabed material (caustic light lines, depth look)');
 const cw=read('lib/town/water/clearWindow.ts');assert(cw.includes("kind==='bed'||kind==='shoal'?CLEAR_UNDER(.7,1.5,'1.,.7',.25,1)"),'the shoal seabed is shaded exactly as the shore bed');
 assert(t.includes('divePreview.dispose()'));
});
if(failed){console.log(failed+' failed');process.exit(1);}
