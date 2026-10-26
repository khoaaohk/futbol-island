// QA audit 3 (Oct 25 2026, docs/QA_AUDIT3_OCT25.md): regressions for the outdoor island / play-side fixes.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),ts=require('typescript'),T=require('three');
const load=(file,deps={})=>{const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const m={exports:{}};new Function('require','module','exports',code)(id=>deps[id]??require(id),m,m.exports);return m.exports;};
const town=fs.readFileSync('components/Town.tsx','utf8');

// #1 Pitch card inside Eleven Park: standing mid-pitch, a corner of the 63 x 99 m pitch is behind the camera, so the clipped
// projection says Infinity. Town must still pick the pitch the player stands in (finite fallback score).
{
 const {createPitchVisibility}=load('lib/town/pitchVisibility.ts');const vis=createPitchVisibility();
 const cam=new T.PerspectiveCamera(55,390/844,.1,800);cam.position.set(135,7,108);cam.lookAt(135,1,96);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 assert.equal(vis(cam,135,.2,100,68*250/270,105*380/400),Infinity,'fixture: the raw projection drops the big pitch from mid-pitch');
 assert.ok(Number.isFinite(vis(cam,135,.2,60,20,20)),'fixture: a small pitch ahead projects');
 assert.match(town,/const score=Math\.min\(pitchVisibility\(camera,v\.x,[^;]*\),1e3\);/,'Town clamps the pitch score so the pitch you stand in still shows its card');
}
// #2 Swim edge note: pushing into the edge of the swimmable sea is detected (and only then), and Town shows the note.
{
 const W=require('./summit-harness.cjs').createLoader()('lib/town/water/waterDepth.ts'),H=require('./summit-harness.cjs').createLoader()('lib/town/water/waterHud.ts');
 const allowed=(x)=>x<60,land=(x)=>x<0;
 assert.equal(W.swimEdgePush(59,0,{x:1,z:0},allowed,land),true,'pushing out at the edge');
 assert.equal(W.swimEdgePush(59,0,{x:-1,z:0},allowed,land),false,'swimming home');
 assert.equal(W.swimEdgePush(30,0,{x:1,z:0},allowed,land),false,'open water ahead');
 assert.equal(W.swimEdgePush(59,0,{x:.2,z:0},allowed,land),false,'a light touch of the stick does not count');
 assert.equal(W.swimEdgePush(1,0,{x:-1,z:0},allowed,land),false,'land ahead is a climb-out, not the edge');
 assert.match(H.SWIM_EDGE_NOTE,/Swim back to the island/);
 assert.match(town,/swimEdgePush\(location\.x,location\.z,\{x:mx,z:mz\},waterWalk\.allow,onLand\)/,'Town checks the push every swim frame');
 assert.match(town,/fuelStore\.say\(SWIM_EDGE_TITLE,SWIM_EDGE_NOTE\)/,'Town shows the note');
}
console.log('qa-audit3-play: ok');
