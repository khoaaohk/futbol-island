// Mowing stripes (Oct 9 2026, docs/performance-guide.md "Mowing stripes"): light/dark bands on the grass pitches, baked into the
// vertex colours of the one slab each pitch already draws. Checks: stripes on the grass grounds (even band count, halfway on a band
// edge, Eleven Park's box edges on band edges, subtle contrast), none on futsal or sand; still one mesh and one material per pitch,
// the same mesh count as a plain box, a vertex-colour standard material (the program the batched island paint already uses), the
// night blend still drives the shared material colour; the rooftop turf and the arcade pitches batch into single draws.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict'),T=require('three'),ts=require('typescript');
(async()=>{
const utils=await import('three/examples/jsm/utils/BufferGeometryUtils.js'),cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
function load(file){file=path.resolve(__dirname,'..',file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float32Array,Set,Map,document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const src=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const S=load('lib/graphics/pitchStripes.ts'),{VENUES,BEACH_VENUE}=load('lib/town/venues.ts');

// 1. Subtle contrast: a few % either side of the pitch colour; the cross-mown pass is fainter still.
assert(S.STRIPE_LIGHT>1&&S.STRIPE_LIGHT<=1.08&&S.STRIPE_DARK<1&&S.STRIPE_DARK>=.92,'stripes are subtle');
assert(S.CROSS_LIGHT-1<S.STRIPE_LIGHT-1,'cross-mowing is fainter than the main bands');

// 2. Island pitches: one slab mesh, one material, same scene mesh count as before (BoxGeometry slab), stripes on grass only.
const scene=new T.Scene(),fields=load('lib/town/fields.ts').buildFormatFields(scene),plans={};
const meshes=root=>{let n=0;root.traverse(o=>{if(o.isMesh||o.isLine)n++;});return n;};
for(const v of VENUES){
 const root=fields.roots.get(v.id),surfaces=root.children.filter(o=>o.name==='pitch-surface');
 assert.equal(surfaces.length,1,`${v.id}: one ground slab`);const slab=surfaces[0],g=slab.geometry,m=slab.material;
 assert(m.isMeshStandardMaterial&&!Array.isArray(m)&&!m.map&&!m.transparent,`${v.id}: plain opaque standard material, no texture`);
 // goals (2 frames + 2 nets) + markings + slab + 2 floodlight meshes: unchanged by the stripes.
 assert.equal(meshes(root),8,`${v.id}: no extra meshes`);
 if(v.id==='futsal'){assert(!m.vertexColors&&g.type==='BoxGeometry','futsal is hard court: no stripes, unchanged geometry');continue;}
 assert(m.vertexColors,`${v.id}: stripes in vertex colours`);
 const plan=g.userData.stripes;plans[v.id]=plan;assert(plan.bands%2===0&&plan.bands>=8,`${v.id}: even band count (${plan.bands})`);
 assert(Math.abs(plan.bands*plan.bandLength-v.length)<1e-6,`${v.id}: whole bands goal line to goal line`);
 assert(plan.bandLength>=4.5&&plan.bandLength<=6.5,`${v.id}: about 5 m per band (${plan.bandLength.toFixed(2)})`);
 // Top-face colours: both shades present, light/dark alternate across the halfway line, sides plain.
 const pos=g.getAttribute('position'),col=g.getAttribute('color'),nor=g.getAttribute('normal'),top=[];
 for(let i=0;i<pos.count;i++)if(nor.getY(i)>.5)top.push({z:pos.getZ(i),x:pos.getX(i),k:col.getX(i)});else assert.equal(col.getX(i),1,'slab sides keep the pitch colour');
 const ks=new Set(top.map(t=>+t.k.toFixed(4)));assert(ks.size>=2,`${v.id}: light and dark bands`);
 assert(top.some(t=>Math.abs(t.z)<1e-6),`${v.id}: halfway line is a band edge`);
 const near=d=>{const q=top.filter(t=>t.z>d-1e-3&&t.z<d+plan.bandLength-1e-3);return q.length?q[0].k:null;};
 assert.notEqual(+near(0).toFixed(4),+near(-plan.bandLength).toFixed(4),`${v.id}: bands alternate across halfway`);
 assert.equal(g.getIndex().count/3<1200,true,`${v.id}: a few hundred triangles at most (${g.getIndex().count/3})`);
}
// Eleven Park: the 6-yard and 18-yard box edges land on band edges (within 15 cm); a cross-mown second pass.
{const p=plans['11v11'],v=VENUES.find(v=>v.id==='11v11');for(const d of [5.5,16.5]){const r=d/p.bandLength;assert(Math.abs(r-Math.round(r))*p.bandLength<.15,`box edge ${d} m on a band edge`);}
 assert(p.lanes>=8&&p.lanes%2===0,'Eleven Park cross-mown lanes');assert(!plans['7v7'].lanes&&!plans['9v9'].lanes,'plain stripes on 7v7 and 9v9');void v;}
// Night: the floodlight blend still moves the one shared material colour, and the stripes ride on it.
{const v=VENUES.find(v=>v.id==='7v7'),m=fields.roots.get('7v7').children.find(o=>o.name==='pitch-surface').material,camera=new T.PerspectiveCamera(50,1,.1,500);
 camera.position.set(v.x,40,v.z+40);camera.lookAt(v.x,0,v.z);camera.updateMatrixWorld();
 for(let i=0;i<200;i++)fields.updateLighting('night',camera,null,.1,false,false,{x:v.x,y:.105,z:v.z});assert(m.emissiveIntensity>0,'night grade still reaches the striped pitch');}
fields.dispose();
// Sand and futsal elsewhere stay plain: the beach court is sand (no grass slab), the pocket court is a futsal cage.
assert(BEACH_VENUE.sand,'beach court is sand');assert(!/pitchStripes|stripe/i.test(src('lib/town/coralCayWorld.ts').match(/---- Beach soccer court[\s\S]*?---- Coral Cay Farm/)[0]),'no stripes on the beach court');
assert(/Pocket futsal court[\s\S]{0,400}box\(16,\.012,9,'#648c72'/.test(src('lib/town/world.ts')),'pocket futsal turf unchanged (one plain box)');

// 3. Rooftop knockout turf: eight bands as palette boxes (they batch into the existing chunk draw), two shades of the old turf colour.
{const w=src('lib/town/world.ts');assert(/for\(let i=0;i<8;i\+\+\)box\(24,\.035,5\.5,i%2\?light:dark/.test(w),'rooftop turf in eight 5.5 m bands');
 assert(!/box\(24,\.035,44,'#648c72'/.test(w),'the single turf box was replaced, not overlaid');
 assert.equal(S.shadeHex('#648c72',1),'#648c72');assert.notEqual(S.shadeHex('#648c72',S.STRIPE_LIGHT),S.shadeHex('#648c72',S.STRIPE_DARK));}

// 4. Arcade: Island Strikers and the pass puzzles draw their bands as ONE two-group mesh (2 draws; were one mesh per band), same
// band layout and colours, plain standard materials (no vertex-colour shader variant in the arcade).
{const g=S.stripedPlaneGeometry(28,50,10,'x'),pos=g.getAttribute('position');
 assert.equal(pos.count,40);assert.equal(g.getIndex().count,60);assert.deepEqual(g.groups.map(x=>[x.count,x.materialIndex]),[[30,0],[30,1]]);assert(!g.getAttribute('color'));
 const first=g.getIndex().array.slice(0,6),xs=[...first].map(i=>pos.getX(i));assert.equal(Math.min(...xs),-25,'band 0 (material 0) starts at the west goal line');assert.equal(Math.max(...xs),-20);
 const st=src('lib/arcade/strikerScene.ts'),pp=src('lib/arcade/passPuzzleScene.ts');
 assert(/stripedPlaneGeometry\(28,50,10,'x'\),\['#193440','#203f4c'\]\.map/.test(st)&&!/for\(let i=0;i<10;i\+\+\)\{const patch/.test(st),'Strikers: one grass mesh');
 assert(/stripedPlaneGeometry\(hw\*2,L,stripes\),stripeMaterials/.test(pp)&&!/new T\.PlaneGeometry\(hw\*2,L\/stripes\)/.test(pp),'pass puzzles: one grass mesh');
 assert(/stripeMaterials\.forEach\(m=>m\.dispose\(\)\)/.test(pp),'pass puzzle stripe materials are released on rebuild');
 assert(!/vertexColors/.test(st)&&!/vertexColors/.test(pp),'no vertex-colour variant in the arcade');}

// 5. No textures, overlays or shader patches were added for the stripes.
for(const f of ['lib/graphics/pitchStripes.ts','lib/town/fields.ts'])assert(!/onBeforeCompile|CanvasTexture|DataTexture|transparent:true/.test(src(f).replace(/netMaterial=new T\.LineBasicMaterial\(\{[^}]*\}\)/,'')),`${f}: no shader patch, texture or overlay`);
console.log('pitch stripes passed',JSON.stringify(Object.fromEntries(Object.entries(plans).map(([k,p])=>[k,{bands:p.bands,band:+p.bandLength.toFixed(2),lanes:p.lanes}]))));
})().catch(e=>{console.error(e);process.exit(1);});
