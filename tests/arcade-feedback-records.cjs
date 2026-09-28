const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
const saved=new Map();global.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
const {readArcadeRecord,saveArcadeRecord}=require('../lib/arcade/arcadeRecords.ts');
assert.deepEqual(readArcadeRecord('tennis'),{best:0,unlocked:1});saveArcadeRecord('tennis',20,3);saveArcadeRecord('tennis',4,1);assert.deepEqual(readArcadeRecord('tennis'),{best:20,unlocked:3});saved.set('fi2-arcade-record-runner-v1','broken');assert.equal(readArcadeRecord('runner').best,0);
let clock=1000,reduced=false,pulses=[];global.document={hidden:false};Object.defineProperty(global,'performance',{value:{now:()=>clock}});global.matchMedia=()=>({matches:reduced});Object.defineProperty(global,'navigator',{value:{vibrate:p=>pulses.push(p)},configurable:true});
const {arcadeFeedback}=require('../lib/arcade/arcadeFeedback.ts');
arcadeFeedback(null,'goal');assert.equal(pulses.length,1);arcadeFeedback(null,'shot');assert.equal(pulses.length,1,'rate limits contact storms');clock+=200;reduced=true;arcadeFeedback(null,'goal');assert.equal(pulses.length,1);reduced=false;saved.set('fi2-sound-muted','true');arcadeFeedback(null,'goal');assert.equal(pulses.length,1,'mute suppresses feedback');saved.delete('fi2-sound-muted');document.hidden=true;arcadeFeedback(null,'goal');assert.equal(pulses.length,1,'hidden content stays quiet');document.hidden=false;delete navigator.vibrate;arcadeFeedback(null,'goal');
console.log('PASS saved progression, best records, haptic bounds, mute, reduced motion and unsupported devices');
