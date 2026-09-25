const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),os=require('node:os');
const output=path.join(os.tmpdir(),'fi-motion-study-regression.json');execFileSync(process.execPath,['scripts/audit-motion-study.cjs',output],{stdio:'pipe'});const {rows}=JSON.parse(fs.readFileSync(output));assert.equal(rows.length,216);assert(rows.every(r=>r.finite));
// Empirical regression budgets, not clinical ranges. Ground-level motion is a
// screening proxy which also includes low-clearance toe-off and landing frames.
for(const r of rows){
 if(r.id==='cut90')assert(r.footAcceleration<1550,`cut landing acceleration ${JSON.stringify(r)}`);
 assert(r.liftOffJump<.006,`toe-off height pop ${JSON.stringify(r)}`);
 if(['shuffle','start-stop','retreat-stop','retreat-chase','cut45','cut90'].includes(r.id))assert(r.lockedStep<.001,`planted support drift ${JSON.stringify(r)}`);
 if(r.id==='shuffle')assert(r.maxFlight<.15,`shuffle clearance gap ${JSON.stringify(r)}`);
 if(r.id==='start-stop'||r.id==='cut90')assert(r.pitchStep<9.5,`abrupt brake pitch ${JSON.stringify(r)}`);
 if(r.id==='retreat-chase')assert(r.groundStep<.08,`chase release skid ${JSON.stringify(r)}`);
 if(r.id==='receive-pass')assert(r.recoveryGroundStep<.07,`support release after pass ${JSON.stringify(r)}`);
 if(r.id==='shot')assert(r.recoveryGroundStep<.055,`support release after shot ${JSON.stringify(r)}`);
}
console.log('MOTION_STUDY_PASS 216 mirrored/profile/rate sequences; braking, chase and stationary strike recovery');
