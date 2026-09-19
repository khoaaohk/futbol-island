const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/games/knockoutAnimation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {knockoutPose,HIT_RECOVERY,OUT_TELEPORT,OUT_ARRIVAL,SHIELD_DURATION}=m.exports;
const normal=age=>knockoutPose({alive:true,hitFlash:Math.max(0,HIT_RECOVERY-age),shield:SHIELD_DURATION-age,outAge:0});
assert(normal(.3).roll>1.3,'normal hit fully falls');assert(normal(1.2).roll>normal(1.6).roll,'get-up brings player upright');assert(normal(1.9).daze,'daze remains on getting up');assert.equal(normal(2.1).roll,0);assert(normal(2.1).daze);assert(!normal(3).daze);
const out=age=>knockoutPose({alive:false,hitFlash:0,outAge:age});assert(out(.5).roll>1.4);assert(out(2).scale>out(2.5).scale,'separate knockout dissolves before teleport');assert(!out(OUT_TELEPORT-.01).queued);assert(out(OUT_TELEPORT).queued);assert.equal(out(OUT_TELEPORT).scale,0);assert.equal(out(OUT_TELEPORT+OUT_ARRIVAL).scale,1);assert.equal(out(3).roll,0);
assert.equal(knockoutPose({alive:false,hitFlash:0,outAge:.25},true).turn,0,'reduced motion removes knockout spin');
console.log('PASS fall, stand-up, daze, distinct knockout dissolve, queue arrival and reduced motion');
