// Engine evidence: opt-in opening-shot rules, bounded long-range pace and replay parity.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {createPuzzle,predict,replay}=require('../lib/passPuzzle/index.ts');
const {kickLaunch}=require('../lib/passPuzzle/sim.ts');
const {geoOf,stepBall,R,F_GOAL,F_OUT}=require('../lib/passPuzzle/physics.ts');
const base={id:'direct-shot-test',pack:'test',title:'Direct shot',concept:'shooting',brief:{},hint:{},lesson:'Read the open goal.',pitch:{halfWidth:40,length:100,goalWidth:7.32},carrier:0,attackers:[{x:0,z:10}],defenders:[],attempts:3,require:{minPasses:2,finish:'goal'}};
const shot=(loft=0,power=1)=>({kind:'shot',target:{x:1.5,z:50},curl:0,loft,power});
function finish(w,hz){for(let n=0;n<10*hz&&['windup','flight'].includes(w.state.phase);n++)w.step(1/hz);return w.state;}
for(const hz of [30,60,120])for(const loft of [0,.65,1]){
 const strict=createPuzzle(structuredClone(base));assert(strict.kick(shot(loft)));assert.equal(finish(strict,hz).result.reason,'too-few-passes');
 const sc=structuredClone(base);sc.require.allowDirectShot=true;const w=createPuzzle(sc),before=w.snapshot(),pred=predict(w,shot(loft));assert.equal(pred.end,'goal');assert.deepEqual(w.snapshot(),before,'prediction is side-effect free');assert(w.kick(shot(loft)));finish(w,hz);assert.equal(w.state.phase,'success');assert.equal(w.state.passes,0);assert.equal(w.state.chain.length,1);
 const r=replay(w.attemptStart(),w.inputs(),.38);r.run();assert.deepEqual(r.world.state.result,w.state.result,'replay carries direct-shot rule');assert.equal(r.world.state.phase,'success');
}
for(const d of [25,40,60,80])for(const loft of [0,.65,1])for(const power of [.3,1]){
 const geo=geoOf(base),o={x:0,y:R,z:geo.goalZ-d},k=shot(loft,power),launch=kickLaunch(geo,o,k,false),speed=Math.hypot(launch.v.x,launch.v.y,launch.v.z);assert(speed<=18+20*power+1e-9,'shot solver cannot manufacture rocket speed');
 const b={p:{...o},v:{...launch.v},spin:launch.spin};let maxY=0,flag=0,seconds=0;
 for(let i=0;i<960;i++){maxY=Math.max(maxY,b.p.y);flag=stepBall(b,geo);seconds+=1/120;if(flag&(F_GOAL|F_OUT))break;}
 assert(maxY<6.6,'no long-range moonball');if(power===1&&d<=60){assert(flag&F_GOAL,`clear ${d}m loft ${loft} shot reaches goal`);assert(seconds<4,'long shots fit bounded prediction window');}
}
// Opening-shot exception never bypasses an authored reach-zone objective or a header finish.
for(const variant of ['zone','header']){const sc=structuredClone(base);sc.require.allowDirectShot=true;if(variant==='zone')sc.require.finish='reach-zone';const w=createPuzzle(sc);if(variant==='header')w.state.ball.atHead=true;w.kick(shot());finish(w,120);assert.notEqual(w.state.phase,'success',variant+' cannot use direct-shot exception');}
// Physical reach settles once the flight finishes; no permanently extended keeper collider.
const keeper=createPuzzle({...base,keeper:{x:0,z:49}});keeper.state.phase='fail';keeper.state.result={outcome:'fail',reason:'save',passes:0,bonus:false};keeper.state.keeper.dive=1;keeper.state.keeper.mode='dive';for(let i=0;i<60;i++)keeper.step(1/120);assert.equal(keeper.state.keeper.dive,0);assert.equal(keeper.state.keeper.mode,'set');
console.log('PASS opt-in opening goals, strict authored rules, bounded 25–80m shots, 30/60/120Hz prediction/replay, keeper recovery');
// Height selection changes the actual goal crossing, independently of shot pace.
for(const width of [5,6,7.32])for(const distance of [8,18,30])for(const side of [-1,1])for(const height of [0,.5,1]){
 const sc={...base,pitch:{...base.pitch,goalWidth:width},attackers:[{x:0,z:50-distance}],require:{...base.require,allowDirectShot:true}};
 const geo=geoOf(sc),k={...shot(0,1),target:{x:side*(geo.halfGoal-.4),z:geo.goalZ},shotHeight:height};
 const o={x:0,y:R,z:50-distance},launch=kickLaunch(geo,o,k,false),b={p:{...o},v:{...launch.v},spin:launch.spin};let flag=0;
 for(let i=0;i<960;i++){flag=stepBall(b,geo);if(flag&(F_GOAL|F_OUT))break;}
 assert(flag&F_GOAL,`corner goal width ${width}, distance ${distance}, height ${height}`);
 assert(Math.abs(b.p.y-(.3+height*(geo.barH-.55)))<.15,`ball reaches selected height ${width}/${distance}/${height}: ${b.p.y}`);
 const w=createPuzzle(sc),prediction=predict(w,k);assert.equal(prediction.end,'goal');w.kick(k);finish(w,60);assert.equal(w.state.phase,'success');
 const r=replay(w.attemptStart(),w.inputs(),.38);r.run();assert.equal(r.world.state.phase,'success');assert.equal(w.inputs()[0].kick.shotHeight,height);
}
console.log('PASS low, mid and top-corner shots at three goal sizes and 8–30m; prediction/replay retain height');

for(const distance of [40,60,80])for(const power of [.1,.5,1]){const geo=geoOf(base),o={x:0,y:R,z:50-distance},k={...shot(0,power),shotHeight:1},launch=kickLaunch(geo,o,k,false);assert(Math.hypot(launch.v.x,launch.v.y,launch.v.z)<=18+20*power+1e-9);assert(o.y+launch.v.y*launch.v.y/(2*9.81)<=6.51,'height controls cannot generate long-range moonballs');}
