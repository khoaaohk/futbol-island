const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),T=require('three');
const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync('lib/graphics/umbrellaReaction.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,require);
const r=m.exports.createUmbrellaReaction(),mesh=new T.Mesh(new T.ConeGeometry(2,.65,8));mesh.position.set(10,2.6,20);r.register(mesh,0);
let writes=0;const update=mesh.updateMatrix.bind(mesh);mesh.updateMatrix=()=>{writes++;update()};
for(let i=0;i<60;i++)r.update(1/60,false);assert.equal(writes,0,'idle has no transform writes');
assert(!r.hit(10,.5,20,1,false));assert(!r.hit(10,8,20,8,false));assert(r.hit(10,.5,20,8,false));r.update(.25,false);assert(mesh.scale.x<.3,'canopy folds');
assert(!r.hit(10,.5,20,8,false),'no retrigger while folding');for(let i=0;i<150;i++)r.update(1/60,false);assert.equal(mesh.scale.x,1);assert.equal(mesh.position.y,2.6);const settled=writes;for(let i=0;i<60;i++)r.update(1/60,false);assert.equal(writes,settled);
assert(r.hit(10,.5,20,8,true));r.update(.1,true);assert.equal(mesh.scale.x,1);console.log('PASS umbrella fold, reopen, cooldown, reduced motion and idle sleep');

const tableReaction=m.exports.createUmbrellaReaction(),canopy=new T.Mesh(new T.ConeGeometry(2.35,.65,8));canopy.position.set(198,12.13,156);tableReaction.register(canopy,9.23);assert(!tableReaction.hit(198,.4,156,12,false),"street-level ball cannot hit a rooftop umbrella");assert(tableReaction.hit(199.75,9.55,156,12,false),"hit at the outside edge of table/chair blockers triggers canopy");tableReaction.update(.25,false);assert(canopy.scale.x<.3);console.log("PASS umbrella table-edge impact and rooftop floor exclusion");

const scene=new T.Group(),pop=m.exports.createUmbrellaReaction(),shade=new T.Mesh(new T.ConeGeometry(2,.65,8));shade.position.y=3;scene.add(shade);pop.register(shade,0);pop.hit(0,.5,0,10,false);pop.update(.12,false);assert(shade.scale.x<.2,"snaps shut");pop.update(.9,false);assert(shade.scale.x<.25,"stays folded during spring buildup");pop.update(.15,false);assert.equal(scene.children.length,11,"ten small particles at opening");for(let i=0;i<180;i++)pop.update(1/60,false);assert(scene.children.slice(1).every(p=>!p.visible),"particles sleep after burst");assert.equal(shade.scale.x,1);pop.dispose();assert.equal(scene.children.length,0);console.log("PASS spring buildup, bounded opening particles, cleanup");
// A mat is linked to its own canopy, including the rotated outer corners.
const grouped=m.exports.createUmbrellaReaction(),u=new T.Mesh(new T.ConeGeometry(2,.65,8)),mat=new T.Mesh(new T.BoxGeometry(1.1,.015,1.7));u.position.set(50,2.8,80);mat.position.set(53,.008,81);mat.rotation.y=.6;grouped.register(u,0,[mat]);
assert(!grouped.hit(56,.2,81,10,false),'unrelated surrounding sand does not trigger');
assert(grouped.hit(53.5,.2,81.5,10,false),'rotated mat edge triggers its umbrella');grouped.update(.12,false);assert(u.scale.x<.2);
assert(!grouped.hit(53,.2,81,10,false),'mat and pole share one reaction cooldown');grouped.update(3,false);
assert(grouped.hit(50,.4,80,10,false),'pole works again after the shared animation');grouped.dispose();mat.geometry.dispose();console.log('PASS linked mat edges, shared cooldown and unrelated ground exclusion');
