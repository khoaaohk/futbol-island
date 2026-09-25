const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/truckRampPose.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
for(const hz of [30,60,120])for(const yaw of [0,Math.PI/2,Math.PI]){
 const ramp={x:0,z:0,yaw,width:3.4,length:6,height:1.35},p=m.exports.createTruckRampPose([ramp]);let max=0,air=false;
 for(let i=0;i<hz*3;i++){const d=-3+i/hz*8,s=p.update(Math.sin(yaw)*d,Math.cos(yaw)*d,yaw,1/hz);max=Math.max(max,s.height);air ||=s.airborne;assert(s.height>=0&&Number.isFinite(s.pitch));if(d>2&&d<4)assert(s.pitch<-.1,'uphill pitch');}
 assert(max>1&&air,'climb and leave lip');assert.equal(p.state.height,0,'land');
 const q=m.exports.createTruckRampPose([ramp]);q.update(Math.sin(yaw)*3,Math.cos(yaw)*3,yaw,1/hz);for(let i=0;i<hz;i++)q.update(Math.sin(yaw)*3,Math.cos(yaw)*3,yaw,1/hz);assert(Math.abs(q.state.height-.675)<1e-9,'stationary support');const before=JSON.stringify(q.state);q.update(99,99,0,0);assert.equal(JSON.stringify(q.state),before,'pause');
 for(let i=0;i<hz*3;i++){const d=3-i/hz*2;q.update(Math.sin(yaw)*d,Math.cos(yaw)*d,yaw,1/hz);}assert.equal(q.state.height,0,'reverse down ramp');
}
console.log('PASS truck ramp climb, launch, landing, stop, pause and reverse at 30/60/120Hz');
