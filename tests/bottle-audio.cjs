const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const listeners=new Map(),sources=[],buffers=[],started=[];let context;
const param=()=>({value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});
const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){}});
class AudioContext{constructor(){context=this;this.state='running';this.currentTime=0;this.sampleRate=100;this.destination={}}createOscillator(){return {...node(),start(){started.push(this)},stop(){this.onended?.()}}}createGain(){return node()}createBiquadFilter(){return node()}createBuffer(ch,n){const b={getChannelData:()=>new Float32Array(n)};buffers.push(b);return b}createBufferSource(){const s={...node(),start(){this.started=true},stop(at){this.stopAt=at??0;this.onended?.()}};sources.push(s);return s}resume(){return Promise.resolve()}suspend(){this.state='suspended';return Promise.resolve()}close(){return Promise.resolve()}}
const m={exports:{}},doc={hidden:false,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/audio/islandSound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,window:{AudioContext},navigator:{},document:doc,performance:{now:()=>0},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},Math,Map,Set,Number});
const sound=m.exports.createIslandSound(false,0),ocean=v=>listeners.get('fi2-bottle-ocean')?.({detail:v}),pop=()=>listeners.get('fi2-bottle-pop')();
// The island has no ocean/wave sound (user request Sep 2026): the bottle intro's open/close event allocates nothing at any volume.
assert.equal(listeners.has('fi2-bottle-ocean'),false,'island sound no longer listens for the ocean loop');
assert.equal(m.exports.fillBottleOcean,undefined,'no ocean synthesis');assert.equal(m.exports.readBottleOceanTime,undefined,'no audio-driven water clock');
ocean(true);sound.setVolume(.5);sound.setMuted(true);sound.setMuted(false);ocean(true);ocean(false);
assert.equal(sources.length,0,'no looping buffer source');assert.equal(buffers.length,1,'only the shared one-second noise buffer');
// The rest of the bottle audio stays: the cork pop still plays.
const oscillatorsBefore=started.length;pop();assert.ok(started.length>oscillatorsBefore,'bottle pop still plays');
// The visual swell envelope is kept for the water and bottle float.
const swell=m.exports.sampleBottleOcean(1.5,{wash:0,froth:0});assert.ok(swell.wash>0,'visual swell envelope kept');
doc.hidden=true;sound.visibility();sound.dispose();assert.equal(listeners.size,0);console.log('PASS bottle: no ocean loop at any volume, cork pop kept, visual swell kept, listeners cleaned');
