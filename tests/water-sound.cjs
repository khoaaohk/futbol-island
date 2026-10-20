// Water sound (lib/audio/islandSound.ts): the underwater low-pass opens/closes, no residual nodes after leaving the sea, the voice cap,
// lite/reduced gating, nothing created while out of the water, and the integration wiring in islandSound/Town.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
let now=0,timers=[];
const param=()=>({value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},exponentialRampToValueAtTime(v){this.value=v},setTargetAtTime(v){this.target=v},cancelScheduledValues(){}});
const all=[];let ctxNow=0;
const mk=(extra={})=>{const n={gain:param(),frequency:param(),Q:param(),playbackRate:param(),conns:new Set(),connect(d){this.conns.add(d);return d},disconnect(d){if(d)this.conns.delete(d);else this.conns.clear();this.dead=true},started:false,start(){this.started=true},stop(){this.stopped=true},...extra};all.push(n);return n;};
const destination={},master=mk({}),ctx={get currentTime(){return ctxNow},destination,sampleRate:100,
 createBufferSource:()=>mk({loop:false}),createBiquadFilter:()=>mk({type:''}),createGain:()=>mk(),createOscillator:()=>mk({type:''}),createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
master.connect(destination);master.dead=false;
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/audio/islandSound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout:id=>{if(timers[id-1])timers[id-1].f=null}});
let ok=true;const noise={};
const w=m.exports.createWaterSound({ctx:()=>ctx,master:()=>master,noise:()=>noise,ok:()=>ok,changed(){}});
const frame=(o={})=>({in:true,under:0,kind:'tread',phase:0,speed:0,fast:false,lite:false,reduced:false,...o});
const liveNodes=()=>all.filter(n=>n!==master&&n.started&&!n.dead).length;
const flush=()=>{for(const t of timers.splice(0))t.f&&t.f();};

// 1. Out of the water: nothing is created, nothing runs.
for(let i=0;i<60;i++)w.update(.016,frame({in:false}));
assert.equal(all.length,1,'no nodes created while out of the sea');assert.equal(w.active(),false);

// 2. Surface swim: one wash bed, no hum, no low-pass, no per-frame node churn between ticks.
w.update(.016,frame({kind:'crawl',speed:.8}));assert.equal(w.debug.bed,true);assert.equal(w.debug.hum,false);assert.equal(master.conns.has(destination),true,'master straight to the speaker on the surface');
const before=all.length;for(let i=0;i<30;i++)w.update(.016,frame({kind:'crawl',speed:.8,phase:.1}));assert.equal(all.length,before,'no allocation per frame (same stroke)');
// a stroke at the surface makes at most 2 noise voices + 2 droplets, droplets drop out when lite
let c0=all.length;w.update(.016,frame({kind:'crawl',phase:Math.PI+.1,speed:.8}));assert.ok(all.length-c0>=6,'surface stroke: slap + lap + droplets');
c0=all.length;w.update(.016,frame({kind:'crawl',phase:2*Math.PI+.1,speed:.8,lite:true}));const liteNodes=all.length-c0;assert.equal(liteNodes,6,'lite: slap + lap only, no droplets');

// 3. Diving in: the plunge is a one-shot; submerging eases the master through a low-pass, hum starts.
c0=all.length;w.plunge();assert.ok(all.length-c0>=8,'plunge makes a whoosh, splash and bubbles');
w.update(.016,frame({under:.2}));assert.equal(w.debug.muffled,false);
w.update(.016,frame({under:.6}));assert.equal(w.debug.muffled,true);assert.equal(w.debug.hum,true);
const lp=[...master.conns].find(n=>n!==destination);assert.ok(lp&&lp.type==='lowpass'&&lp.conns.has(destination),'master -> lowpass -> destination');
assert.ok(lp.frequency.target>=600&&lp.frequency.target<=900,'muffle between 600 and 900 Hz');
// hysteresis: a wobble around the threshold does not flap
w.update(.016,frame({under:.3}));assert.equal(w.debug.muffled,true,'hysteresis keeps the muffle at 0.3');

// 4. Voice cap underwater: bed + hum + at most one shot at a time (the plunge's own one-shots finish first).
for(const n of all)if(typeof n.onended==='function'&&!n.loop&&n.type!=='lowpass'&&!n.dead&&n.type!=='sine-hum'&&n.frequency.value!==84){n.onended();n.dead=true;}
assert.equal(w.debug.live,0,'plunge voices have ended');
let fired=0,maxVoices=0;for(let i=0;i<40;i++){w.update(.016,frame({under:1,kind:'crawl',phase:Math.PI*(i+10)+.1,speed:.5}));maxVoices=Math.max(maxVoices,(w.debug.bed?1:0)+(w.debug.hum?1:0)+w.debug.live);fired=w.debug.strokes;}
assert.ok(fired>0&&maxVoices<=3,'underwater strokes sound, never more than 3 voices: '+maxVoices);
// 5. Bubbles: reduced motion and lite thin them out
function bubblesFor(opts){let from=all.length;const w2=m.exports.createWaterSound({ctx:()=>ctx,master:()=>mk(),noise:()=>noise,ok:()=>true,changed(){}});for(let i=0;i<3000;i++){w2.update(.02,frame({under:1,...opts}));
  for(let k=from;k<all.length;k++){const n=all[k];if(n.onended&&!n.dead&&n.started&&!n.loop&&n.frequency.value!==84){n.onended();n.dead=true;}}from=all.length;}const b=w2.debug.bubbles;w2.dispose();return b;}
const full=bubblesFor({}),lite=bubblesFor({lite:true}),reduced=bubblesFor({reduced:true});
assert.ok(full>=12&&full<=45,'~1 bubble every 1.5-4 s over 60 s: '+full);assert.ok(lite<full*.75,'lite thins bubbles: '+lite+' vs '+full);assert.equal(reduced,0,'reduced motion: no bubbles');

// 6. Surfacing: the muffle opens (route restored after ~0.4 s), loops fade, whoosh-up one-shot.
c0=all.length;w.surface();assert.ok(all.length-c0>=5,'surface whoosh + droplets');
w.update(.016,frame({under:0}));assert.equal(w.debug.muffled,false);assert.equal(w.debug.hum,false,'hum released at the surface');
assert.ok(timers.some(t=>t.f),'one pending timer restores the master route');flush();assert.equal(master.conns.has(destination),true);assert.equal(master.conns.size,1,'master back to the speaker only');

// 7. Leaving the sea: loops fade out; with a mute/hide (ok=false) everything is torn down at once.
w.update(.016,frame({in:false}));assert.equal(w.debug.bed,false);
w.update(.016,frame({under:1}));ok=false;w.update(.016,frame({under:1}));
for(const n of all)if(n.stopped&&n.onended&&!n.dead){n.onended();n.dead=true;}// the stopped sources fire their ended events
assert.equal(w.active(),false,'mute while diving tears everything down');assert.equal(master.conns.size,1);assert.equal(master.conns.has(destination),true,'route restored at once');
assert.equal(timers.filter(t=>t.f).length,0,'no timers left');
ok=true;w.update(.016,frame({in:false}));assert.equal(all.filter(n=>n!==master&&n.started&&!n.dead&&n.onended&&!n.stopped&&n.loop).length,0,'no looping source left running');

// 8. Wiring.
const isl=fs.readFileSync('lib/audio/islandSound.ts','utf8'),town=fs.readFileSync('components/Town.tsx','utf8');
assert.ok(/water\.stop\(now\)/.test(isl)&&/water\.dispose\(\)/.test(isl)&&/\|\|water\.active\(\)/.test(isl),'silence/dispose/audible wired');
assert.ok(/sound\.waterPlunge\(\)/.test(town)&&/sound\.waterSurface\(\)/.test(town)&&/sound\.swim\(dt,ss\)/.test(town),'Town drives the water sound');
console.log('water-sound ok');
