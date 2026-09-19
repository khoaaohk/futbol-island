const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file){const code=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};new Function('exports','module',code)(mod.exports,mod);return mod.exports;}
const {COIN_QUEST}=load('lib/town/coinQuest.ts'),{BALL_HUNT_LESSONS,ballLessonFrame}=load('lib/town/ballHuntLessons.ts');
assert.equal(Object.keys(BALL_HUNT_LESSONS).length,COIN_QUEST.length);
for(const spot of COIN_QUEST){const lesson=BALL_HUNT_LESSONS[spot.id];assert(lesson,spot.id);assert.equal(lesson.steps.length,3);assert.equal(new Set(lesson.steps).size,3);assert.equal(lesson.actions.length,2);const frames=[];for(let step=0;step<3;step++){const f=ballLessonFrame(lesson.kind,step);frames.push(JSON.stringify(f));assert.equal(new Set(f.nodes.map(n=>n.id)).size,f.nodes.length);assert(f.nodes.length<=8,'bounded DOM nodes');for(const n of f.nodes){assert(Number.isFinite(n.x+n.y));assert(n.x>=20&&n.x<=310&&n.y>=20&&n.y<=220,`${spot.id} visible position`);}assert(f.paths.length<=5);}assert.notEqual(frames[0],frames[1],`${spot.id} interaction changes the visual`);assert.notEqual(frames[1],frames[2],`${spot.id} final explanation changes the visual`);}
// These concepts must not inherit an incompatible give-and-go/receiving diagram.
const back=ballLessonFrame(BALL_HUNT_LESSONS['dock-entry'].kind,2);assert(back.nodes.find(n=>n.id==='b').y>back.nodes.find(n=>n.id==='a').y,'support behind stays behind ball carrier');
const before=ballLessonFrame('onside',1),after=ballLessonFrame('onside',2);assert(before.nodes.find(n=>n.id==='b').y>=110);assert(after.nodes.find(n=>n.id==='b').y<110,'runner crosses line only after pass');
console.log('PASS ball hunt lessons: all 55 discoveries have bounded three-stage diagrams; support/onside semantics checked');

const depth=ballLessonFrame('depth',1);assert(depth.nodes.find(n=>n.id==='b').y<depth.nodes.find(n=>n.id==='a').y);assert(depth.nodes.find(n=>n.id==='c').y>depth.nodes.find(n=>n.id==='a').y);
const stagger=ballLessonFrame('stagger',1);assert.notEqual(stagger.nodes.find(n=>n.id==='b').y,stagger.nodes.find(n=>n.id==='c').y);
const compact=ballLessonFrame('compact',2);assert.equal(compact.nodes.find(n=>n.id==='b').label,'Press');assert.equal(compact.nodes.find(n=>n.id==='a').label,'Cover');
console.log('PASS spacing diagrams: depth ahead/behind, staggered options, defending press/cover switch');

// Detect relabelled duplicates across the complete three-stage visual sequence.
const signatures=new Map();
for(const [id,l] of Object.entries(BALL_HUNT_LESSONS)){
 const signature=JSON.stringify([0,1,2].map(step=>ballLessonFrame(l.kind,step)));
 assert(!signatures.has(signature),`${id} duplicates ${signatures.get(signature)}`);signatures.set(signature,id);
}
const node=(kind,step,id)=>ballLessonFrame(kind,step).nodes.find(n=>n.id===id);
assert.notEqual(node('rescan',1,'d').x,node('rescan',2,'d').x,'second scan changes pressure');
assert.equal(node('carrier-angle',0,'b').x,node('carrier-angle',2,'b').x,'receiver stays while carrier changes angle');
assert.notEqual(node('carrier-angle',0,'a').y,node('carrier-angle',1,'a').y);
assert.equal(node('support-after',1,'ball').x,node('support-after',2,'ball').x,'support does not force a return pass');
assert(node('pace',2,'a').y-node('pace',1,'a').y>node('pace',1,'a').y-node('pace',0,'a').y,'burst covers greater distance');
assert(node('goal-side',1,'a').y>node('goal-side',1,'b').y,'defender recovers between attacker and bottom goal');
assert.notEqual(node('vacate',0,'a').x,node('vacate',1,'a').x,'first player leaves pocket');
assert.notEqual(node('vacate',1,'b').x,node('vacate',2,'b').x,'second player arrives');
assert(node('weight',1,'ball').x<node('weight',2,'ball').x,'soft pass stops short');
const {BALL_HUNT_PRACTICE}=load('lib/town/ballHuntLessons.ts');
assert.equal(Object.keys(BALL_HUNT_PRACTICE).length,55);assert.equal(new Set(Object.values(BALL_HUNT_PRACTICE)).size,55);
for(const spot of COIN_QUEST)assert(BALL_HUNT_PRACTICE[spot.id]);
console.log('PASS 50 distinct visual sequences and prediction tasks; receiver/carrier, pace, scan, weight, recovery and pocket semantics');
const visualPatterns=new Map();
for(const [id,l] of Object.entries(BALL_HUNT_LESSONS)){
 const key=JSON.stringify([0,1,2].map(step=>{const f=ballLessonFrame(l.kind,step);return {nodes:f.nodes.map(n=>[n.id,n.x,n.y,n.angle??0,n.role]),paths:f.paths,run:f.run,zone:f.zone};}));
 assert(!visualPatterns.has(key),`${id} only relabels the pattern of ${visualPatterns.get(key)}`);visualPatterns.set(key,id);
}
assert.notDeepEqual(ballLessonFrame('curve',2).paths,ballLessonFrame('lane',2).paths,'curved run must not end in the same sideways-pass pattern');
assert.notDeepEqual(ballLessonFrame('first-time',2).paths,ballLessonFrame('third',2).paths,'one-touch relay differs from third-player combination');
console.log('PASS second audit: 50 visual patterns remain distinct with all labels and notes excluded');
