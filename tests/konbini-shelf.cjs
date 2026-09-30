// Konbini 3D shelf products (Sep 29 2026, user: "the items on the shelf need to be isometric too, to give more depth and
// volume"): every food, drink and shelf-stock key has a low-poly product geometry that merges with the store's static boxes
// (position/normal/color/uv + index), fits its shelf slot, stays under a per-item triangle cap, is deterministic, and a whole
// store's stock stays inside the heat budget (docs/performance-guide.md, "Walk-in Konbini"). usage: node tests/konbini-shelf.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const P=require('../lib/konbini/productMeshes.ts'),F=require('../lib/konbini/food.ts'),A=require('../lib/konbini/konbiniAtlas.ts'),V=require('../lib/konbini/konbiniVariants.ts');
const verbose=process.argv.includes('--verbose');
// 1. Coverage: every menu item, every shelf decor key and every gear ball style.
const SHELF_DECOR=['ball','pack','goal','shinpads','bagA','bagB','crackers','banana','cans','noodles','cone','bottleRow'];
for(const k of SHELF_DECOR)assert(k in A.DECOR,k+' is a real atlas decor key');
const keys=[...F.FOOD_MENU.map(f=>f.id),...SHELF_DECOR,...new Set([...V.KONBINI_VARIANTS.main.gear,...V.KONBINI_VARIANTS.cay.gear].filter(g=>g.startsWith('ball:')))];
const tris={};
for(const key of keys){assert(P.hasProduct(key),key+' has a product');const g=P.buildProduct(key);
 for(const a of ['position','normal','color','uv'])assert(g.attributes[a],key+' has '+a);assert(g.index&&g.index.count===g.attributes.position.count,key+' trivially indexed (merges with BoxGeometry)');
 const n=P.productTriangles(g);assert(n>=8,key+' is not empty');tris[key]=n;
 const cap=key.startsWith('ball')?80:key==='sweet-dorayaki'||key==='bottleRow'||key==='cans'?130:100;assert(n<=cap,`${key}: ${n} tris ≤ ${cap}`);
 const b=g.boundingBox;assert(b.min.y>=-1e-6,key+' base at y=0');assert(b.max.y<=.36,`${key} height ${b.max.y.toFixed(3)} ≤ 0.36`);
 assert(b.max.x-b.min.x<=.32&&b.max.z-b.min.z<=.3,`${key} footprint ${(b.max.x-b.min.x).toFixed(3)}×${(b.max.z-b.min.z).toFixed(3)}`);
 for(const v of g.attributes.color.array)assert(v>=0&&v<=1.2,key+' colour in range');
 // No NaNs, flat normals (all three vertices of a face share one normal).
 const nrm=g.attributes.normal.array;for(let i=0;i<nrm.length;i+=9){assert(Number.isFinite(nrm[i]));assert(Math.abs(nrm[i]-nrm[i+3])<1e-5&&Math.abs(nrm[i+1]-nrm[i+7])<1e-5,key+' flat shaded');}
 // Deterministic.
 const g2=P.buildProduct(key);assert.deepEqual([...g2.attributes.position.array],[...g.attributes.position.array],key+' deterministic');
 // Faces point outward-ish and are visible from the store camera (front/up): most faces have normal.z or normal.y ≥ 0.
 let visible=0;for(let i=0;i<nrm.length;i+=9)if(nrm[i+1]>-.05||nrm[i+2]>-.05)visible++;assert(visible/(nrm.length/9)>.6,key+' mostly faces the camera');}
assert.equal(P.buildProduct('ball:sunset').attributes.color.array.join()!==P.buildProduct('ball:frost').attributes.color.array.join(),true,'ball styles differ');
// 2. The cache builds each key once and disposes.
{const c=P.createProductCache();const a=c.get('drink-water'),b=c.get('drink-water');assert.equal(a,b);assert.equal(c.size,1);c.dispose();assert.equal(c.size,0);}
// 3. Jitter is seeded, small and deterministic.
for(let s=1;s<200;s++){const j=P.stockJitter(s),k=P.stockJitter(s);assert.deepEqual(j,k);assert(Math.abs(j.yaw)<=.12&&Math.abs(j.x)<=.02);}
// 4. Heat budget: a whole store's stock (every fixture's fronts × depth at the mean of what it can hold) stays under 26k product
// triangles (measured in the browser: +23–26k on top of the ~15k room; docs/performance-guide.md).
const avg=Object.values(tris).reduce((a,b)=>a+b,0)/Object.values(tris).length;
for(const shop of ['main','cay']){const v=V.KONBINI_VARIANTS[shop];const menu=F.shopMenu(shop);
 const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,heaviest=kind=>kind==='fridgeWall'?mean([...menu.filter(f=>f.section==='drinks').map(f=>tris[f.id]),tris.bottleRow,tris.cans]):kind==='gondola'?mean([...menu.filter(f=>f.section==='sweets').map(f=>tris[f.id]),tris.bagA,tris.bagB,tris.crackers,tris.banana,tris.noodles,tris.cans]):mean(menu.filter(f=>f.section!=='drinks').map(f=>tris[f.id]));
 let count=0,total=0;for(const fx of v.fixtures){const n=P.fixtureProductCount(fx.kind,fx.len);count+=n;total+=n*heaviest(fx.kind);}
 if(verbose)console.log(shop,{products:count,estTris:Math.round(total)});
 assert(count>=300,shop+' is generously stocked ('+count+' products)');assert(total<=26000,`${shop}: estimated product triangles ${Math.round(total)} ≤ 26000`);}
if(verbose)console.log({avg:+avg.toFixed(1),tris});
assert(avg<=45,'average product ≤ 45 triangles ('+avg.toFixed(1)+')');
console.log(`konbini-shelf: ${keys.length} products ok (avg ${avg.toFixed(1)} tris)`);
