const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {createPointerFilter,filterPointer}=require('../lib/passPuzzle/drawing.ts');
const {readStroke}=require('../lib/passPuzzle/stroke.ts');
const {createPuzzle}=require('../lib/passPuzzle/index.ts');
const w=createPuzzle({id:'gesture',pack:'test',title:'Gesture',concept:'passing',brief:{},hint:{},pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,attackers:[{x:0,z:0},{x:0,z:20}],defenders:[],attempts:3,require:{minPasses:1,finish:'goal'}});
const stroke=(n=32,bow=0)=>Array.from({length:n+1},(_,i)=>({x:Math.sin(Math.PI*i/n)*bow,z:20*i/n,t:.5*i/n}));
let f=createPointerFilter(0,0,0),noise=0;
for(let i=1;i<=120;i++){filterPointer(f,i%2?.8:-.8,0,i*1000/60);if(i>30)noise+=f.x*f.x;}
assert(Math.sqrt(noise/90)<.3,'subpixel tremor is suppressed');
f=createPointerFilter(0,0,0);for(let i=1;i<=30;i++)filterPointer(f,i*10,0,i*1000/60);
assert(300-f.x<6,'deliberate fast sweep stays responsive');
const sparse=readStroke(stroke(16,2),w),dense=readStroke(stroke(128,2),w);
assert(Math.abs(sparse.curl-dense.curl)<.01,'curve is stable across event sampling rates');
const glitch=stroke(128);glitch[64].x=5;
assert.equal(readStroke(glitch,w).curl,0,'single pointer outlier cannot invent curl');
const held=stroke();held.push({...held.at(-1),t:1.4});
assert.equal(readStroke(held,w,{mode:'ground'}).loft,0);
assert.equal(readStroke(stroke(),w,{mode:'lift'}).loft,.65);
for(const points of [stroke(16),stroke(64,3)])assert.equal(readStroke(points,w,{power:.65}).power,.65,'manual power ignores drawing length and curve');
const shot=readStroke(stroke(),w,{mode:'shoot',power:1});assert.equal(shot.kind,'shot');assert.equal(shot.receiver,undefined);assert.equal(shot.target.z,30);assert.equal(shot.power,1);
console.log('PASS pointer jitter/response, resampled curves, outlier rejection, explicit flight and power controls');

// Coalesced batches often repeat their newest sample on the outer event.
const once=createPointerFilter(0,0,0),duplicate=createPointerFilter(0,0,0);
for(let i=1;i<=80;i++){
 const x=i*2+Math.sin(i*.2),y=Math.sin(i*.08)*20,t=i*1000/120;
 filterPointer(once,x,y,t);filterPointer(duplicate,x,y,t);
 filterPointer(duplicate,x,y,t);filterPointer(duplicate,x-50,y+20,t-1);
 assert.deepEqual(duplicate,once,'duplicate/stale event cannot alter the filtered gesture');
}
const valid={...duplicate};filterPointer(duplicate,NaN,0,1000);assert.deepEqual(duplicate,valid,'invalid coordinate cannot poison later samples');
console.log('PASS coalesced event invariance and stale/invalid sample rejection');
