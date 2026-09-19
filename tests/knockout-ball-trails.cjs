const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),T=require('three'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/graphics/knockoutBallTrails.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,require,Math});
const parent=new T.Group(),trail=m.exports.createKnockoutBallTrails(parent),balls=Array.from({length:6},(_,i)=>({x:i,z:0,vx:15,vz:0,life:10,heldBy:-1}));
trail.update(1/30,balls,false);assert.equal(trail.mesh.count,0,'no trail bridge on first frame');
for(let i=0;i<30;i++){balls.forEach(b=>b.x+=.5);trail.update(1/30,balls,false);assert(trail.mesh.count<=72);}assert(trail.mesh.count>0,'moving shots have trails');
balls.forEach(b=>b.heldBy=0);for(let i=0;i<12;i++)trail.update(1/30,balls,false);assert.equal(trail.mesh.count,0,'pickup trails expire');const version=trail.mesh.instanceMatrix.version;trail.update(1/30,balls,false);assert.equal(trail.mesh.instanceMatrix.version,version,'idle trails do not upload');
trail.reset();balls.forEach(b=>{b.heldBy=-1;b.x+=20;});trail.update(1/30,balls,false);assert.equal(trail.mesh.count,0,'round reset does not join distant positions');
for(let i=0;i<10;i++){balls.forEach(b=>b.x+=.5);trail.update(1/30,balls,true);}assert.equal(trail.mesh.count,0,'reduced motion does not emit');trail.dispose();assert.equal(parent.children.length,0);
console.log('PASS bounded six-ball trails, pickup fade, idle sleep, reset and reduced motion');
