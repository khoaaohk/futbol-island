const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/games/knockoutAnimation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {knockoutPose,HIT_RECOVERY,OUT_TELEPORT,OUT_ARRIVAL,SHIELD_DURATION}=m.exports;
const normal=age=>knockoutPose({alive:true,hitFlash:Math.max(0,HIT_RECOVERY-age),shield:SHIELD_DURATION-age,outAge:0});
assert(normal(.3).roll>1.3,'normal hit fully falls');assert(normal(.55).roll>normal(.85).roll,'get-up brings player upright');assert(normal(1.05).daze,'daze remains on getting up');assert.equal(normal(HIT_RECOVERY+.05).roll,0);assert(normal(HIT_RECOVERY+.3).daze);assert(!normal(3).daze);assert(HIT_RECOVERY<=1.2,'a hit is a short knock-down, not a stun-lock');
const out=age=>knockoutPose({alive:false,hitFlash:0,outAge:age});assert(out(.5).roll>1.4);assert(out(2).scale>out(2.5).scale,'separate knockout dissolves before teleport');assert(!out(OUT_TELEPORT-.01).queued);assert(out(OUT_TELEPORT).queued);assert.equal(out(OUT_TELEPORT).scale,0);assert.equal(out(OUT_TELEPORT+OUT_ARRIVAL).scale,1);assert.equal(out(3).roll,0);
assert.equal(knockoutPose({alive:false,hitFlash:0,outAge:.25},true).turn,0,'reduced motion removes knockout spin');
console.log('PASS fall, stand-up, daze, distinct knockout dissolve, queue arrival and reduced motion');
