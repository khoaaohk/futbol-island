const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Number});return m.exports;}
const {createBottleFloat,stepBottleFloat,bottleWaterHeight}=load('lib/graphics/bottleMotion.ts');
const {sampleBottleOcean}=load('lib/audio/islandSound.ts');
const runs=[];
for(const hz of [24,60,120]){const s=createBottleFloat(),wave={wash:0,froth:0};let maxX=0,maxY=0,maxAngle=0;for(let i=0;i<hz*64;i++){const time=i/hz;sampleBottleOcean(time,wave);stepBottleFloat(s,time,wave.wash,1/hz);assert(Object.values(s).every(Number.isFinite));maxX=Math.max(maxX,Math.abs(s.x));maxY=Math.max(maxY,Math.abs(s.y));maxAngle=Math.max(maxAngle,Math.abs(s.angle));}assert(maxX>5&&maxX<30);assert(maxY>5&&maxY<35);assert(maxAngle>1&&maxAngle<12);const before=JSON.stringify(s);stepBottleFloat(s,100,1,0);assert.equal(JSON.stringify(s),before,'paused physics does not advance');runs.push(s);}
assert(Math.abs(runs[0].y-runs[2].y)<1,'bounded timestep agreement');const a={wash:0,froth:0},b={wash:0,froth:0};sampleBottleOcean(1.5,a);sampleBottleOcean(17.5,b);assert.equal(a.wash,b.wash,'sound envelope loops');assert.notEqual(bottleWaterHeight(1,.5,0,0),bottleWaterHeight(1,.5,0,1),'audible swells change water height');console.log('PASS buoyancy/drag/rocking bounds at 24/60/120Hz, paused state, shared swell loop');

const {driftBottle}=load('lib/graphics/bottleMotion.ts');
const bounceCounts=[];
for(const mobile of [false,true]){const s=createBottleFloat(),bounds={x:70,y:130};let bounces=0,previous=0;for(let i=0;i<24*90;i++){driftBottle(s,i/24,.5,1/24,bounds,mobile);assert(Math.abs(s.x)<=bounds.x&&Math.abs(s.y)<=bounds.y);assert(Object.values(s).every(Number.isFinite));if(previous&&Math.sign(s.vx)!==previous)bounces++;previous=Math.sign(s.vx);}bounceCounts.push(bounces);assert(bounces>10,'bottle repeatedly crosses the water and rebounds');assert(s.angle>360*5,'bottle makes full rotations instead of only rocking');}
assert(bounceCounts[1]>bounceCounts[0],'mobile rebounds occur more frequently even at identical bounds');console.log('PASS edge rebounds and faster mobile pace',bounceCounts);
const {fitBottleToViewport}=load('lib/graphics/bottleMotion.ts');
// At a diagonal the SVG's empty rectangular corners must not cause early contact.
for(const angle of [8,38,53,98,188,278]){
 const v={width:320,height:568,bottleWidth:124,bottleHeight:252},s=createBottleFloat();s.angle=angle;s.x=1000;s.vx=40;
 assert.equal(fitBottleToViewport(s,v)&2,2);
 const rad=(angle-8)*Math.PI/180,points=[[69,26],[111,26],[111,78],[133,107],[146,142],[146,231],[130,253],[50,253],[34,231],[34,142],[47,107],[69,78],[73,13],[107,13],[107,43],[73,43]];
 const paintedRight=Math.max(...points.map(([x,y])=>(x-90)*Math.cos(rad)-(y-133)*Math.sin(rad)))+2;
 assert(Math.abs(160+s.x+paintedRight-320)<1e-8,'painted bottle reaches screen edge at rebound');assert(s.vx<0);
 if(angle===53){const oldBox=(124+252)*Math.SQRT1_2/2;assert(s.x>160-oldBox+10,'removed the diagonal transparent-corner gap');}
}
console.log('PASS silhouette edge contact at six rotations');
