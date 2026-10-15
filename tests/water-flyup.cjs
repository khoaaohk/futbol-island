// Fly up near the shore (user, Oct 15 2026: "flying from the swimming makes you automatically land near the shore and guides you
// there. remove that"). A land / out-of-fuel during a Fly up's climb over the sea drops in where the player is (the normal fall +
// splash-down), never a findLanding-guided glide to the beach; over the sea the landing ring is not drawn on the beach.
// Run: node tests/water-flyup.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const J=createLoader()('lib/town/jetpackActions.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const town=fs.readFileSync('components/Town.tsx','utf8');

ok('Drop in over the sea is not gated on the take-off climb',()=>{
 assert.match(town,/if\(truckLanding===null&&canSplashDown\(location\.x,location\.z\)\)\{pendingRide\.current='walk';splashSource='dropin';jetActions\.crash\(flight\.height\);return;\}/);
 assert.doesNotMatch(town,/takeoffTime>=1\.05&&canSplashDown/);
});
ok('Fly up starts a plain flight: no pending ride, any landing cancelled',()=>{
 const fly=town.slice(town.indexOf('const flyUp=()=>'),town.indexOf('waterActions.press='));
 assert.match(fly,/pendingRide\.current=null;cancelLanding\.current=true;rideRef\.current='jetpack'/);
 assert.doesNotMatch(fly,/findLanding|flight\.landing=/);
});
ok('over the sea the landing ring is not aimed at the beach',()=>{
 assert.match(town,/landingPreview=canSplashDown\(location\.x,location\.z\)\?null:rooftop\.findLanding\(location\.x,location\.z\)/);
});
ok('a drop-in fall from a low climb splashes down in place (no move toward land)',()=>{
 const a=J.createJetpackActions(),p={x:5,z:-8};a.crash(3);let r;
 for(let i=0;i<600;i++){r=a.update(1/60,p,r?r.height:3,{blocked:()=>false,floor:()=>-1,findLanding:()=>({x:0,z:0}),splash:()=>true});if(r.landed)break;}
 assert.ok(r.landed&&r.splash,'splashed');assert.deepEqual(p,{x:5,z:-8});
});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('water-flyup: all ok');
