// Idle island audio: nothing may tick while the child gives no input, and looping voices never cut off mid-wave.
// (User report Sep 2026: "while sitting idle sometimes there's a clicking noise".)
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const listeners=new Map(),oscillators=[],gains=[];let context,now=0;
const param=()=>({value:0,events:[],setValueAtTime(v,t){this.events.push(['set',v,t]);this.value=v},linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);this.value=v},exponentialRampToValueAtTime(v,t){this.events.push(['exp',v,t])},cancelScheduledValues(t){this.events.push(['cancel',t])},setTargetAtTime(v,t){this.events.push(['target',v,t]);this.value=v}});
const node=()=>({gain:param(),frequency:param(),Q:param(),connect(dst){this.out=dst},disconnect(){this.out=null}});
class AudioContext{constructor(){context=this;this.state='running';this.currentTime=0;this.sampleRate=100;this.destination={}}
 createOscillator(){const o={...node(),start(at){this.startAt=at??0},stop(at){this.stopAt=at??this.stopAt??0}};oscillators.push(o);return o}
 createGain(){const g=node();gains.push(g);return g}createBiquadFilter(){return node()}createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)}}
 createBufferSource(){return {...node(),start(){},stop(at){this.stopAt=at??0}}}resume(){return Promise.resolve()}suspend(){this.state='suspended';return Promise.resolve()}close(){return Promise.resolve()}}
const m={exports:{}},doc={hidden:false,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/audio/islandSound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,window:{AudioContext},navigator:{},document:doc,performance:{now:()=>now},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},Math,Map,Set,Number});
const sound=m.exports.createIslandSound(false,.5);sound.unlock();
const started=()=>oscillators.filter(o=>o.startAt!==undefined).length;

// 1. Hover ticks answer the pointer/keyboard, never the world moving under a resting cursor
//    (a runner NPC crossing the cursor, a dialog handing focus to a button on its own).
now=5000;context.currentTime=5;
let before=started();sound.ui('hover');sound.ui('slide');
assert.equal(started(),before,'no hover tick without any pointer or key input');
listeners.get('pointermove')({type:'pointermove'});now+=16;context.currentTime+=.5;sound.ui('hover');
assert.ok(started()>before,'a real pointer move still gets its hover tick');
now+=5000;context.currentTime+=5;before=started();sound.ui('hover');
assert.equal(started(),before,'seconds after the last pointer move, a hover from the world moving is silent');
listeners.get('keydown')({type:'keydown'});now+=5;context.currentTime+=.5;sound.ui('hover');
assert.ok(started()>before,'keyboard focus (Tab) keeps its hover tick');
now+=5000;context.currentTime+=5;before=started();sound.ui('click');
assert.ok(started()>before,'clicks and other UI cues are untouched by the hover gate');

// 1b. 3D scene hover (NPC/building/ferry under the cursor) needs a pointer that just moved: held flight/walk keys sweep the
//     camera, and with it a resting cursor's ray, across the world. In flight it is off entirely (engine + music only).
now+=5000;context.currentTime+=5;before=started();
listeners.get('keydown')({type:'keydown'});now+=30;context.currentTime+=.5;sound.sceneHover(false);
assert.equal(started(),before,'held key + resting cursor: an NPC or building sweeping under it is silent');
listeners.get('pointermove')({type:'pointermove'});now+=16;context.currentTime+=.5;sound.sceneHover(true);
assert.equal(started(),before,'flying: scene hover silent even right after a pointer move');
sound.sceneHover(false);assert.ok(started()>before,'walking: moving the pointer onto an NPC still ticks');
// 1c. Flying idle for 2 minutes with keys held and scene hovers requested every frame: only the jetpack hum runs.
{let mark=oscillators.length;sound.move('jetpack',0,true);const hum=oscillators.length-mark;assert.equal(hum,2,'jetpack hum voices');mark=oscillators.length;
 for(let i=0;i<7200;i++){now+=1000/60;context.currentTime+=1/60;if(i%2===0)listeners.get('keydown')({type:'keydown'});sound.move('jetpack',i%600<300?0:3,true);sound.sceneHover(true);}
 assert.equal(oscillators.length,mark,'two minutes of flight start no sound besides the running jetpack hum');sound.move('walk',0,true);}

// 2. Parking the moped (and the truck engine stopping) fades the looping hum instead of cutting it mid-wave (a DC click).
const cutClean=(label)=>{
 const hum=oscillators.filter(o=>o.hum);
 for(const o of hum){
  assert.ok(o.stopAt>context.currentTime,label+': stop is scheduled after a release, not immediate');
  const g=gains.find(g=>g===o.out);assert.ok(g,label+': hum has its own gain');
  const last=g.gain.events.at(-1);assert.deepEqual([last[0],last[1]],['linear',0],label+': gain ramps to silence');
  assert.ok(Math.abs(last[2]-context.currentTime)>.01&&last[2]<=o.stopAt,label+': ramp finishes before the stop');
 }
};
context.currentTime=20;let mark=oscillators.length;
sound.move('moped',6,true);for(const o of oscillators.slice(mark))o.hum=true;assert.equal(oscillators.length-mark,2,'moped hum has two voices');
context.currentTime=21;sound.move('moped',.1,true);cutClean('moped parked');
for(const o of oscillators)o.hum=false;mark=oscillators.length;sound.move('jetpack',0,true);for(const o of oscillators.slice(mark))o.hum=true;
context.currentTime=22;sound.move('jetpack',0,false);cutClean('jetpack hum off');
for(const o of oscillators)o.hum=false;
mark=oscillators.length;sound.truck(6,true);for(const o of oscillators.slice(mark))o.hum=true;assert.equal(oscillators.length-mark,1,'truck engine is one voice');
context.currentTime=23;sound.truck(0,true);cutClean('truck stopped');
// A parked ride stays silent: no new voices while nothing moves.
for(const o of oscillators)o.hum=false;mark=oscillators.length;
for(let i=0;i<600;i++){context.currentTime+=1/60;now+=1000/60;sound.move('moped',0,true);sound.truck(0,true);sound.move('walk',0,true);}
assert.equal(oscillators.length,mark,'ten idle seconds on a parked moped/truck start no sound');
sound.dispose();
console.log('IDLE_AUDIO_PASS');
