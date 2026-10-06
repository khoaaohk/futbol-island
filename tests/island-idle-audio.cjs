// Island idle fade + narration ownership (user reports Sep 26 2026: "plays audio is leaking when just standing there on the island",
// "it will just sometimes play automatically"; decision: after 30 s without input, fade all island sound out).
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=(file,globals,requires={})=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>requires[n],Math,Map,Set,Number,Promise,...globals});return m.exports;};
// Fake clock + timers shared by every module under test.
let now=0;const timers=[];
const setTimeout_=(fn,ms)=>{const t={at:now+ms,fn};timers.push(t);return t;},clearTimeout_=t=>{const i=timers.indexOf(t);if(i>=0)timers.splice(i,1);};
const advance=ms=>{const end=now+ms;for(;;){timers.sort((a,b)=>a.at-b.at);const t=timers[0];if(!t||t.at>end)break;timers.shift();now=t.at;t.fn();}now=end;};
const param=()=>({value:1,events:[],setValueAtTime(v,t){this.events.push(['set',v,t]);this.value=v},linearRampToValueAtTime(v,t){this.events.push(['linear',v,t]);this.value=v},exponentialRampToValueAtTime(){},cancelScheduledValues(t){this.events.push(['cancel',t])},setTargetAtTime(v,t){this.events.push(['target',v,t]);this.value=v}});
const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){}});
const started=[],gains=[];let ctx;
class AudioContext{constructor(){ctx=this;this.state='running';this.currentTime=0;this.sampleRate=100;this.destination={};this.suspends=0;this.resumes=0;}
 createOscillator(){return {...node(),start(){started.push(this)},stop(){}}}createGain(){const g=node();gains.push(g);return g}createBiquadFilter(){return node()}createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)}}
 createBufferSource(){return {...node(),start(){started.push(this)},stop(){}}}createMediaElementSource(){return node()}
 resume(){this.resumes++;this.state='running';return Promise.resolve()}suspend(){this.suspends++;this.state='suspended';return Promise.resolve()}close(){return Promise.resolve()}}
class FakeAudio{constructor(src=''){this.src=src;this.currentSrc=src;this.paused=true;this.ended=false;this.handlers=new Map();this.attrs=new Map(src?[['src',src]]:[]);this.loads=0;}
 play(){this.paused=false;this.fire('play');return Promise.resolve()}pause(){this.paused=true}load(){this.loads++;this.currentSrc=this.attrs.get('src')??''}
 getAttribute(k){return this.attrs.get(k)??null}setAttribute(k,v){this.attrs.set(k,v)}removeAttribute(k){this.attrs.delete(k)}
 addEventListener(k,f){this.handlers.set(k,f)}removeEventListener(k){this.handlers.delete(k)}fire(k){this.handlers.get(k)?.({currentTarget:this,type:k})}}
const winListeners=new Map(),docListeners=new Map();
const win={AudioContext,location:{pathname:'/'},addEventListener:(k,f)=>winListeners.set(k,f),removeEventListener:k=>winListeners.delete(k)};
const doc={hidden:false,addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:k=>docListeners.delete(k)};
const globals={window:win,document:doc,navigator:{},performance:{now:()=>now},setTimeout:setTimeout_,clearTimeout:clearTimeout_,Audio:FakeAudio,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o?.detail}}};

// --- Sound + music wired as Town wires them ---
const {createIslandSound}=load('lib/audio/islandSound.ts',globals);
const {createIslandMusic,MUSIC_IDLE_MS}=load('lib/audio/islandMusic.ts',globals);
const sound=createIslandSound(false,.5);sound.unlock();
let active=false;const idleEvents=[];
const music=createIslandMusic(true,.04,sound.getContext,sound.setMusicAudible,{active:()=>active,onIdle:v=>{idleEvents.push(v);sound.setIdle(v);}});
music.unlock();
const input=(type,trusted=true)=>winListeners.get(type)?.({type,isTrusted:trusted});
const masterGain=gains[0];
// 1. 30 s with no input: the whole mix fades out (1.5 s linear master ramp), the music pauses, the context suspends.
input('pointerdown');advance(MUSIC_IDLE_MS-100);assert.equal(idleEvents.length,0,'no fade before 30 s');
advance(200);assert.deepEqual(idleEvents,[true],'idle after 30 s');{const last=masterGain.gain.events.at(-1);assert.deepEqual([last[0],last[1]],['linear',0],'master ramps to silence');assert.ok(Math.abs(last[2]-ctx.currentTime-1.5)<1e-6,'over 1.5 s');}assert.equal(sound.debug.idle,true);
advance(1700);assert.equal(ctx.state,'suspended','context suspended after the fade');assert.ok(ctx.suspends>=1);
assert.equal(music.getState().idle,true);
// 2. Nothing queues while idle, so waking replays nothing.
const before=started.length;sound.ui('click');sound.ball('kick');sound.move('moped',6,true);
assert.equal(started.length,before,'no sound is scheduled while idle');
// 3. Synthetic / programmatic events do not wake it; a real input does, with a short fade-in and no replays.
input('pointerdown',false);input('keydown',false);assert.deepEqual(idleEvents,[true],'untrusted input ignored');
input('touchstart');assert.deepEqual(idleEvents,[true,false],'real input wakes');{const last=masterGain.gain.events.at(-1);assert.equal(last[0],'linear');assert.ok(last[1]>0,'fades back in');}assert.equal(ctx.state,'running');assert.equal(started.length,before,'waking replays nothing');
assert.equal(sound.debug.idle,false);sound.ui('click');assert.ok(started.length>before,'sounds play again after waking');
// 4. Playback the child started (film / lesson / voice line) keeps the island awake; the fade starts 30 s after it ends.
active=true;advance(MUSIC_IDLE_MS*3);assert.deepEqual(idleEvents,[true,false],'no fade during an open film or lesson');
active=false;advance(MUSIC_IDLE_MS-6000);assert.deepEqual(idleEvents,[true,false],'still awake right after playback ends');
advance(12000);assert.deepEqual(idleEvents,[true,false,true],'fades 30 s after playback ended');
input('pointerdown');
music.dispose();sound.dispose();

// --- Lesson voice ownership: the shared element only sounds for an open lesson that asked it to ---
const react={useCallback:f=>f,useEffect:()=>{},useRef:v=>({current:v}),useState:v=>[v,()=>{}]};
const narration={registerIslandNarration:()=>()=>{},islandNarrationAllowed:()=>true};
const voice=load('lib/town/useLessonVoice.ts',globals,{react,'../audio/islandNarration':narration});
const shared=voice.primeLessonVoice();assert.ok(shared,'primed in the gesture');assert.equal(shared.paused,false,'silent primer plays');
shared.pause();shared.src=shared.currentSrc='/voice/kokoro_af_bella/line.m4a';
shared.play();assert.equal(shared.paused,true,'a play nobody asked for (iOS resume, lock screen, stray call) is stopped at once');
assert.equal(voice.lessonVoiceSpeaking(),false);
// --- Oct 3 2026 play-through: a job/quiz cue fired by the tap that wakes a suspended context was dropped (resume() is async) ---
(async()=>{
 const s2=createIslandSound(false,.5);s2.unlock();const c2=ctx;advance(2100);assert.equal(c2.state,'suspended','idle-suspended after 2 s of silence');
 let finish;c2.resume=function(){this.resumes++;return new Promise(r=>{finish=()=>{this.state='running';r();};});};// a real resume lands later
 s2.unlock();// Town's pointerdown unlock: resume requested, state still 'suspended'
 const n0=started.length;docListeners.get('fi2-job-cue')({detail:'ding'});assert.equal(started.length,n0,'nothing plays before the resume lands');
 finish();await Promise.resolve();await Promise.resolve();assert.ok(started.length>n0,'the cue plays once the context is running');
 assert.equal(s2.debug.counts['job:ding'],1,'played exactly once');
 const n1=started.length;docListeners.get('fi2-story-cue')({detail:'finish'});assert.ok(started.length>n1,'a running context plays at once');
 s2.dispose();console.log('ISLAND_CUE_WAKE_PASS a cue on the waking tap is replayed once, not dropped');
})().catch(e=>{console.error(e);process.exit(1);});
console.log('ISLAND_IDLE_AUDIO_PASS 30 s idle fades + suspends, no queue, real input wakes without replays, active playback holds, stray lesson voice blocked');
