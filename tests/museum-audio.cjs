// Museum hall & exhibit MUSIC (Oct 13 2026, user: "for the museum, give background music that fits with the museum"):
// lib/museum/museumSound.ts — a calm, curious gallery theme (soft mallet/piano motifs over warm pads, 78 bpm, D major, a
// faint football-heritage hint) that cross-fades to a lighter, more rhythmic activity variant inside an exhibit (104 bpm,
// same key), with a chiptune-flavoured variant for the penalty-1891 cabinet. Plays through the walk-in rooms' one shared
// AudioContext (lib/konbini/konbiniSound.ts), the same context museumSfx/konbiniSfx already use. Modelled on
// tests/shop-audio.cjs (the Kit Shop's ambience controller test) and tests/book-audio.cjs / tests/idle-audio.cjs (lazy
// context, fake timers, bounded voices, mute/hidden/idle/dispose).
// usage: node tests/museum-audio.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');

// ---- A tiny Web Audio + DOM stand-in (konbiniSound.ts's context() calls the bare `AudioContext`, not `window.AudioContext`). ----
const contexts=[],oscillators=[],sources=[],gains=[];
const param=()=>({value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}});
const node=()=>({connect(){},disconnect(){}});
class AudioContext{
 constructor(){contexts.push(this);this.state='suspended';this.currentTime=0;this.sampleRate=22050;this.destination={};}
 createBuffer(ch,len,rate){const data=new Float32Array(len);return {length:len,sampleRate:rate,getChannelData:()=>data};}
 createGain(){const g={...node(),gain:param()};gains.push(g);return g;}
 createOscillator(){const o={...node(),type:'sine',frequency:param(),start(){this.started=true;},stop(){this.stopped=true;}};oscillators.push(o);return o;}
 createBiquadFilter(){return {...node(),type:'bandpass',frequency:param(),Q:param()};}
 createBufferSource(){const s={...node(),buffer:null,loop:false,start(){this.started=true;},stop(){if(this.stopped)throw new Error('already stopped');this.stopped=true;}};sources.push(s);return s;}
 resume(){this.state='running';return Promise.resolve();}
 suspend(){this.state='suspended';return Promise.resolve();}
 close(){this.state='closed';return Promise.resolve();}
}
global.AudioContext=AudioContext;// konbiniAudioContext()'s context() calls `new AudioContext()` bare, like the rest of the walk-in rooms
global.window={AudioContext};

// Fake timers: the controller only ever uses bare setTimeout/clearTimeout, so a controllable clock lets the idle/hidden/
// cross-fade schedules (30 s idle, 220 ms hidden-suspend, ~1.1 s cross-fade…) be exercised without a real wait.
let clock=0,timerId=1;const timers=[];
global.setTimeout=(fn,ms)=>{const id=timerId++;timers.push({id,fn,due:clock+(ms||0)});return id;};
global.clearTimeout=(id)=>{const i=timers.findIndex(t=>t.id===id);if(i>=0)timers.splice(i,1);};
function advance(ms){const target=clock+ms;
 for(;;){let idx=-1;for(let i=0;i<timers.length;i++)if(timers[i].due<=target&&(idx<0||timers[i].due<timers[idx].due))idx=i;
  if(idx<0)break;const [t]=timers.splice(idx,1);clock=t.due;t.fn();}
 clock=target;
}
global.performance={now:()=>clock};
global.navigator={};

const lsStore=new Map();
global.localStorage={getItem:k=>lsStore.has(k)?lsStore.get(k):null,setItem:(k,v)=>lsStore.set(k,String(v)),removeItem:k=>lsStore.delete(k)};
const docListeners=new Map();
global.document={hidden:false,addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:(k)=>docListeners.delete(k)};

require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..');
// Loading the module must not allocate any audio: every render function is pure, and the controller is a factory.
assert.equal(contexts.length,0);
const S=require(path.join(root,'lib/museum/museumSound.ts'));
assert.equal(contexts.length,0,'requiring museumSound.ts must not allocate an AudioContext');

const live=arr=>arr.filter(s=>s.started&&!s.stopped).length;

// 1. The hall theme: a loop of at least 90 s, seamless (declicked to ~silence at both edges), normalised, slower than the
//    activity variants, and genuinely varied across its phrases (not just the same bars tiled).
{const bufCtx={createBuffer:(ch,len,rate)=>{const data=new Float32Array(len);return {length:len,sampleRate:rate,getChannelData:()=>data};}};
 const hall=S.renderMuseumHallTheme(bufCtx);
 const seconds=hall.length/hall.sampleRate;assert.ok(seconds>=90,`hall theme is ${seconds.toFixed(1)}s, at least the requested 90s`);
 const d=hall.getChannelData(0);let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));
 assert.ok(peak<=.6001&&peak>.3,'normalised to at most 0.6, comfortably audible');
 assert.ok(Math.abs(d[0])<1e-6&&Math.abs(d[d.length-1])<1e-6,'declicked to silence at both edges: the wrap is seamless');
 // Phrase 0 (bars 0–7) and phrase 2 (bars 16–23) use different mallet motifs: the same relative offset into each phrase's
 // first chord segment should not be sample-identical, proving the loop is a varied sequence, not a tiled 8-bar loop.
 const segSamples=Math.round((60/S.HALL_BPM)*8*hall.sampleRate),offset=Math.round(.3*hall.sampleRate);
 let differs=false;for(let i=0;i<2000;i++)if(Math.abs(d[offset+i]-d[8*segSamples+offset+i])>1e-9){differs=true;break;}
 assert.ok(differs,'phrase 0 and phrase 2 differ: a sequenced progression with variation, not a tiled loop');
 assert.ok(S.EXHIBIT_BPM>S.HALL_BPM,'the activity variant is faster than the hall theme');
 console.log(`PASS hall theme: ${seconds.toFixed(1)}s, normalised to ${peak.toFixed(3)}, seamless, varied across phrases, ${S.HALL_BPM} bpm`);}

// 2. The exhibit (activity) and pixel (chiptune) variants: same chord grid, each its own normalised, bounded buffer, and
//    audibly different from one another (different voices) and from the hall theme (different length/register).
{const bufCtx={createBuffer:(ch,len,rate)=>{const data=new Float32Array(len);return {length:len,sampleRate:rate,getChannelData:()=>data};}};
 const exhibit=S.renderMuseumExhibitTheme(bufCtx),pixel=S.renderMuseumPixelTheme(bufCtx);
 for(const [name,buf] of [['exhibit',exhibit],['pixel',pixel]]){
  const d=buf.getChannelData(0);let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));
  assert.ok(peak<=.6001&&peak>.3,`${name} variant normalised, audible`);
  assert.ok(Math.abs(d[0])<1e-6&&Math.abs(d[d.length-1])<1e-6,`${name} variant: seamless wrap`);
 }
 assert.equal(exhibit.length,pixel.length,'the pixel variant shares the activity variant’s timing grid');
 const e=exhibit.getChannelData(0),p=pixel.getChannelData(0);let differs=false;
 for(let i=0;i<e.length;i+=37)if(Math.abs(e[i]-p[i])>1e-6){differs=true;break;}
 assert.ok(differs,'the chiptune (square/triangle) variant is audibly different from the mallet/pad activity variant');
 console.log(`PASS activity variants: exhibit ${(exhibit.length/exhibit.sampleRate).toFixed(1)}s and pixel ${(pixel.length/pixel.sampleRate).toFixed(1)}s, same grid, each normalised and distinct`);}

// 3. museumMusicLevel: respects the master mute, the separate music toggle and its volume, ducks (never to zero), and is
//    capped well below full volume (a gentle, background level under Ada's lines and an exhibit's own SFX).
{const lv=o=>S.museumMusicLevel({soundOn:true,musicOn:true,musicVolume:.04,soundVolume:.5,ducked:false,...o});
 assert.equal(lv({soundOn:false}),0,'sound muted → silent');
 assert.equal(lv({musicOn:false}),0,'music toggle off → silent (even with sound on)');
 assert.equal(lv({soundVolume:0}),0,'sound volume 0 → silent');
 assert.ok(lv({})>0,'otherwise audible');
 assert.ok(lv({musicVolume:1})<=.06+1e-9,'capped to a gentle background level even at full music volume');
 assert.ok(lv({ducked:true})>0&&lv({ducked:true})<lv({ducked:false}),'ducked is quieter, never silent');
 assert.ok(Math.abs(lv({ducked:true})-lv({ducked:false})*S.MUSIC_DUCK)<1e-9,'ducks by exactly MUSIC_DUCK');
 console.log('PASS museumMusicLevel: master mute, music toggle/volume, capped, ducks without silencing');}

// 4. The ambience controller: lazy on a gesture, bounded voices, ducks, hidden → paused, idle fades, cross-fades into an
//    exhibit variant and back (and into the penalty-1891 chiptune variant), and leaving fully stops + disposes.
{lsStore.set('fi2-music-enabled','true');lsStore.set('fi2-music-volume','.04');lsStore.set('fi2-sound-muted','false');lsStore.set('fi2-sound-volume','.5');
 const before=contexts.length;const a=S.createMuseumAmbience();
 assert.equal(contexts.length,before,'constructing the controller alone allocates nothing (no gesture yet)');
 assert.equal(live(sources),0,'…and starts no buffer source before a gesture');

 a.input();// the first real gesture
 assert.equal(contexts.length,before+1,'the first gesture lazily creates the one shared walk-in-room context');
 const ctx=contexts[contexts.length-1];assert.equal(ctx.state,'running');
 assert.equal(a.debug.playing,true);assert.ok(a.debug.level>0);assert.equal(a.debug.theme,'hall','starts on the hall theme');
 assert.equal(live(sources),1,'the hall theme plays as one looping buffer source, not a live sequencer');
 const loopSource=sources.find(s=>s.started&&!s.stopped);assert.equal(loopSource.loop,true);

 // Bounded voices: more trusted input only re-arms the idle timer, it never starts a second source.
 a.input();a.input();a.input();assert.equal(live(sources),1,'repeated input does not stack extra loop sources');

 // Ducking (Ada's guide panel / the arrival bell–hush, wired from MuseumRoom.tsx): quieter, never silent, restores exactly.
 const undocked=a.debug.level;a.duck(true);
 assert.ok(a.debug.ducked&&a.debug.level>0&&a.debug.level<undocked,'duck(true) lowers the bed under a voice-over, never to zero');
 a.duck(false);assert.ok(!a.debug.ducked&&a.debug.level===undocked,'duck(false) restores the exact level');

 // Hidden → paused; visible → resumed.
 global.document.hidden=true;a.visibility();
 advance(221);assert.equal(ctx.state,'suspended','hidden ≥ 220ms → the context suspends (paused)');
 global.document.hidden=false;a.visibility();assert.equal(ctx.state,'running','visible again → resumed');

 // Cross-fade into the exhibit (activity) variant and back: briefly two sources overlap, then the old one is retired.
 a.input();assert.equal(ctx.state,'running');
 assert.equal(live(sources),1);
 a.setExhibit(true);
 assert.equal(a.debug.theme,'exhibit','stepping inside an exhibit switches to the activity variant');
 assert.equal(live(sources),2,'the hall theme fades out while the activity variant fades in: a brief cross-fade overlap');
 advance(1.1*1000+150);
 assert.equal(live(sources),1,'the hall theme is fully retired once the cross-fade finishes');
 a.setExhibit(true);assert.equal(live(sources),1,'already on the activity variant: setExhibit(true) again is a no-op');

 // penalty-1891's cabinet: the chiptune-flavoured pixel variant, same cross-fade mechanics.
 a.setExhibit(true,true);
 assert.equal(a.debug.theme,'pixel','the penalty-1891 cabinet gets the chiptune-flavoured variant');
 assert.equal(live(sources),2,'cross-fading from the activity variant into the pixel variant');
 advance(1.1*1000+150);assert.equal(live(sources),1);

 // Exit: back to the hall theme.
 a.setExhibit(false);
 assert.equal(a.debug.theme,'hall','leaving the exhibit returns to the hall theme');
 assert.equal(live(sources),2);advance(1.1*1000+150);assert.equal(live(sources),1);

 // 30 s with no input fades the bed out and suspends it (the island's idle rule); it does not resume on its own.
 advance(S.AMBIENCE_IDLE_MS+1.5*1000+100);
 assert.ok(a.debug.idle,'30s silent → idle');assert.equal(ctx.state,'suspended','idle → the context suspends too');
 a.input();assert.equal(a.debug.idle,false);assert.equal(ctx.state,'running','the next input wakes it');

 // Leaving: fadeOut then dispose fully stops every voice and marks itself disposed (the MuseumRoom leave() sequence);
 // the shared context itself is NOT owned by the museum (konbini/arcade share it too), so it is left running, not closed.
 a.fadeOut(.1);a.dispose();
 assert.equal(a.debug.disposed,true);assert.equal(a.debug.playing,false);
 advance(300);assert.equal(live(sources),0,'every loop source is stopped on dispose');
 assert.equal(ctx.state,'running','dispose leaves the shared walk-in-room context open for other rooms');
 assert.equal(timers.length,0,'no idle/cross-fade timer is left pending after dispose');
 console.log('PASS ambience: lazy on gesture, bounded voices, ducks, hidden → paused, idle fades, cross-fades to the exhibit/pixel variant and back, leave → stopped + disposed');}

// 5. No leaked AudioContext or dangling timers/voices across repeat visits: five enter/exit cycles on the shared context.
{const before=contexts.length;
 for(let i=0;i<5;i++){const a=S.createMuseumAmbience();a.input();a.fadeOut(.1);a.dispose();advance(300);}
 assert.equal(contexts.length,before,'five visits reuse the one shared context (museum does not own or multiply it)');
 assert.equal(live(sources),0,'nothing left playing after five cycles');
 assert.equal(timers.length,0,'no idle timer left pending after five cycles');
 console.log('PASS 5 enter/exit cycles: the shared context is reused, nothing left playing or scheduled');}
