const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/arcadePlayerMotion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math,Float64Array});
const {createArcadePlayerMotion:create,stepArcadePlayerMotion:step}=m.exports;
for(const hz of [30,60,120]){
 const s=create();step(s,1/hz,0,Math.PI-.02);step(s,1/hz,7,-Math.PI+.02);assert(Math.abs(s.yaw-Math.PI)<.05,'turn follows shortest arc');
 for(let n=0;n<hz*2;n++){step(s,1/hz,7,0,0,0,0,{vx:0,vz:7});for(let i=0;i<2;i++){const footY=s.bodyY+.65-.28*Math.cos(s.hips[i])-.26*Math.cos(s.hips[i]+s.knees[i]);assert(footY>=.094&&footY<.22,'walking foot remains above ground with bounded recovery lift');}}
 const frozen=JSON.stringify(s);step(s,0,0,0,1,1,1,{slide:1});assert.equal(JSON.stringify(s),frozen,'sleep freezes articulation');
 for(let n=0;n<hz;n++)step(s,1/hz,0,0,0,0,0,{slide:1});assert(s.bodyY<-.3,'slide lowers pelvis');
 for(let n=0;n<hz*2;n++)step(s,1/hz,0,0);assert(s.slide<1e-6&&s.effort<1e-6,'recovery settles');assert(Number.isFinite(s.knees[0]));
}
console.log('PASS articulated motion: ground clearance, shortest turn, zero-dt freeze, slide and recovery at 30/60/120Hz');
