// Kit Shop audio (Oct 13 2026, user: "the boots studio needs audio for the background. provide audio for the store"):
// lib/shop/shopSound.ts — the store's original procedural loop (≥ 60 s, seamless, normalised), the shared lazy context, the
// UI click/whoosh/cha-ching one-shots (rate-limited, respecting mute/volume), and the ambience controller's full lifecycle
// (lazy start on a gesture, respects the music toggle/volume, ducks under a studio, pauses hidden, stops + disposes on leave,
// no leaked AudioContext across repeat visits). Modelled on tests/book-audio.cjs, tests/idle-audio.cjs and the Museum gallery
// ambience block in tests/museum-room.cjs.
// usage: node tests/shop-audio.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');

// ---- A tiny Web Audio + DOM stand-in, enough for shopSound.ts (and the games/sound.ts + islandSound.ts it imports from). ----
const contexts=[],oscillators=[],sources=[];
const param=()=>({value:0,setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}});
const node=()=>({connect(){},disconnect(){}});
class AudioContext{
 constructor(){contexts.push(this);this.state='suspended';this.currentTime=0;this.sampleRate=22050;this.destination={};}
 createBuffer(ch,len,rate){const data=new Float32Array(len);return {length:len,sampleRate:rate,getChannelData:()=>data};}
 createGain(){return {...node(),gain:param()};}
 createOscillator(){const o={...node(),type:'sine',frequency:param(),start(){this.started=true;},stop(){this.stopped=true;}};oscillators.push(o);return o;}
 createBiquadFilter(){return {...node(),type:'bandpass',frequency:param(),Q:param()};}
 createBufferSource(){const s={...node(),buffer:null,loop:false,start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;}
 resume(){this.state='running';return Promise.resolve();}
 suspend(){this.state='suspended';return Promise.resolve();}
 close(){this.state='closed';return Promise.resolve();}
}
// Fake timers: shopSound.ts only ever uses bare setTimeout/clearTimeout, so a small controllable clock lets the idle/hide/duck
// fades (30 s idle, 220 ms hidden-suspend…) be exercised without the test actually waiting on the wall clock.
let clock=0,timerId=1;const timers=[];
global.setTimeout=(fn,ms)=>{const id=timerId++;timers.push({id,fn,due:clock+(ms||0)});return id;};
global.clearTimeout=(id)=>{const i=timers.findIndex(t=>t.id===id);if(i>=0)timers.splice(i,1);};
/** Advances the fake clock to `clock+ms`, running due timers in due-order (earliest first), each at ITS OWN due time — so a
 *  setTimeout scheduled from inside a firing callback is relative to that true simulated moment, not to the final target. */
function advance(ms){const target=clock+ms;
 for(;;){let idx=-1;for(let i=0;i<timers.length;i++)if(timers[i].due<=target&&(idx<0||timers[i].due<timers[idx].due))idx=i;
  if(idx<0)break;const [t]=timers.splice(idx,1);clock=t.due;t.fn();}
 clock=target;
}

class FakeElement{constructor(tag,attrs={}){this.tag=tag;this.attrs=attrs;this.parentEl=null;}
 matches(sel){
  if(sel==='button:not(:disabled),a[href],[role=button]:not([aria-disabled=true])')
   return (this.tag==='button'&&!this.attrs.disabled)||(this.tag==='a'&&!!this.attrs.href)||(this.attrs.role==='button'&&this.attrs['aria-disabled']!=='true');
  if(sel.startsWith('[')&&sel.endsWith(']'))return sel.slice(1,-1) in this.attrs;
  return false;
 }
 closest(sel){let e=this;while(e){if(e.matches(sel))return e;e=e.parentEl;}return null;}
}
global.Element=FakeElement;
const el=(tag,attrs)=>new FakeElement(tag,attrs);

const lsStore=new Map();
global.localStorage={getItem:k=>lsStore.has(k)?lsStore.get(k):null,setItem:(k,v)=>lsStore.set(k,String(v)),removeItem:k=>lsStore.delete(k)};
const docListeners=new Map();
global.document={hidden:false,addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:(k)=>docListeners.delete(k)};
global.window={AudioContext};
global.performance={now:()=>clock};
global.navigator={};

require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..');
const S=require(path.join(root,'lib/shop/shopSound.ts'));

// 1. Requiring the module allocates nothing; the loop is a seamless 60–90 s buffer, normalised.
{assert.equal(contexts.length,0,'loading shopSound.ts must not allocate an AudioContext');
 // A bare createBuffer stand-in that, like the real Web Audio API, returns the SAME backing array on every getChannelData() call.
 const bufCtx={createBuffer:(ch,len,rate)=>{const data=new Float32Array(len);return {length:len,sampleRate:rate,getChannelData:()=>data};}};
 const buf=S.renderShopAmbience(bufCtx);
 const seconds=buf.length/buf.sampleRate;assert.ok(seconds>=60&&seconds<=90,`loop is ${seconds.toFixed(1)}s, within 60–90s`);
 const d=buf.getChannelData(0);let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));
 assert.ok(peak<=.6001&&peak>.15,'normalised to at most 0.6, comfortably audible (not silent)');
 assert.ok(Math.abs(d[0])<1e-9&&Math.abs(d[d.length-1])<1e-9,'declicked to silence at both edges: the wrap is seamless');
 console.log(`PASS loop: ${seconds.toFixed(1)}s, normalised to ${peak.toFixed(3)}, seamless at the wrap`);}

// 2. shopMusicLevel respects the master mute, the separate music toggle and its volume, and ducks under a studio.
{const lv=o=>S.shopMusicLevel({soundOn:true,musicOn:true,musicVolume:.3,soundVolume:.5,ducked:false,...o});
 assert.equal(lv({soundOn:false}),0,'sound muted → silent');
 assert.equal(lv({musicOn:false}),0,'music toggle off → silent (even with sound on)');
 assert.equal(lv({soundVolume:0}),0,'sound volume 0 → silent');
 assert.ok(lv({})>0,'otherwise audible');
 assert.ok(lv({ducked:true})>0&&lv({ducked:true})<lv({ducked:false}),'a studio open ducks the bed, never to zero');
 console.log('PASS shopMusicLevel: master mute, music toggle/volume, duck');}

// 3. shopAudioContext is lazy: muted, it returns null and allocates nothing; unmuted, it lazily creates one shared context.
{lsStore.set('fi2-sound-muted','true');
 const before=contexts.length;assert.equal(S.shopAudioContext(),null);assert.equal(contexts.length,before,'muted: no context even when asked directly');
 lsStore.set('fi2-sound-muted','false');
 const c=S.shopAudioContext();assert.ok(c);assert.equal(contexts.length,before+1,'unmuted: exactly one new (lazy) context');
 assert.equal(S.shopAudioContext(),c,'a second call reuses the same shared context');
 console.log('PASS shopAudioContext: lazy, respects mute, one shared instance');}

// 4. One-shot cues: click / whoosh / cha-ching, rate-limited (bounded voices), following sound mute+volume (not the music toggle).
{const ctx=S.shopAudioContext();
 assert.equal(S.shopClickCue(el('div',{})),null,'a non-interactive element gets no cue');
 assert.equal(S.shopClickCue(el('button',{disabled:true})),null,'a disabled button is silent');
 assert.equal(S.shopClickCue(el('button',{})),'click','a plain button gets the click cue');
 assert.equal(S.shopClickCue(el('button',{'data-shop-own-cue':''})),null,'an own-cue button (ball studio pop/kick) gets no extra click');
 assert.equal(S.shopClickCue(el('button',{'data-shop-spin':''})),'whoosh','a spin button gets the whoosh cue instead of a click');

 let o0=oscillators.length;S.shopSfx.click();S.shopSfx.click();S.shopSfx.click();
 assert.equal(oscillators.length-o0,1,'rapid clicks are rate-limited to one voice');
 ctx.currentTime+=1;

 let s0=sources.length;for(let i=0;i<10;i++)S.shopSfx.whoosh();
 assert.equal(sources.length-s0,1,'ten quick spin flicks only whoosh once (subtle, rate-limited)');
 ctx.currentTime+=1;

 s0=sources.length;o0=oscillators.length;S.shopSfx.chaChing();
 assert.equal(sources.length-s0,1);assert.equal(oscillators.length-o0,2,'the register chime is a noise "chk" + two notes');
 S.shopSfx.chaChing();assert.equal(sources.length-s0,1,'a second cha-ching within the cooldown does not double the chime (once per purchase)');
 ctx.currentTime+=1;

 lsStore.set('fi2-music-enabled','false');
 o0=oscillators.length;S.shopSfx.click();assert.equal(oscillators.length-o0,1,'a UI click still sounds with music off: only the sound mute silences it');
 lsStore.set('fi2-music-enabled','true');ctx.currentTime+=1;

 lsStore.set('fi2-sound-muted','true');
 o0=oscillators.length;S.shopSfx.click();assert.equal(oscillators.length-o0,0,'muted: the click is silent');
 lsStore.set('fi2-sound-muted','false');
 ctx.close();// end of this shared context's life (simulates leaving /shop): the ambience test below gets a clean, fresh gesture.
 console.log('PASS one-shots: click/whoosh/cha-ching, rate-limited, mute respected, music toggle left alone');}

// 5. The ambience controller: lazy start on a gesture, ducks for a studio, hidden → paused, idle fades, leaving → stopped + disposed.
{lsStore.set('fi2-music-enabled','true');lsStore.set('fi2-music-volume','.3');lsStore.set('fi2-sound-muted','false');lsStore.set('fi2-sound-volume','.5');
 const before=contexts.length;const a=S.createShopAmbience();
 assert.equal(contexts.length,before,'constructing the controller alone allocates nothing (no gesture yet)');
 a.input();// the first real gesture
 assert.equal(contexts.length,before+1,'the first gesture lazily creates the one loop context');
 const ctx=contexts[contexts.length-1];assert.equal(ctx.state,'running');assert.equal(a.debug.playing,true);assert.ok(a.debug.level>0);
 const loopSource=sources.find(s=>s.loop);assert.ok(loopSource&&loopSource.started,'the loop plays as one looping buffer source, not a live sequencer');

 const undocked=a.debug.level;a.duck(true);
 assert.ok(a.debug.ducked&&a.debug.level>0&&a.debug.level<undocked,'opening a studio ducks the bed below its normal level, never to zero');
 a.duck(false);assert.ok(!a.debug.ducked&&a.debug.level===undocked,'closing the studio brings it back');

 global.document.hidden=true;a.visibility();
 advance(221);assert.equal(ctx.state,'suspended','hidden ≥ 220ms → the context suspends (paused)');
 global.document.hidden=false;a.visibility();assert.equal(ctx.state,'running','visible again → resumed');

 // 30 s with no input fades the bed out and suspends it (the island's idle rule); it does not resume on its own.
 a.input();assert.equal(ctx.state,'running');
 advance(S.SHOP_IDLE_MS+S.SHOP_IDLE_FADE*1000+100);
 assert.ok(a.debug.idle,'30s silent → idle');assert.equal(ctx.state,'suspended','idle → the context suspends too');
 a.input();assert.equal(a.debug.idle,false);assert.equal(ctx.state,'running','the next input wakes it');

 // Leaving: fadeOut then dispose fully stops and closes the context (the ShopRoom leave() sequence).
 a.fadeOut(.1);a.dispose();
 assert.equal(a.debug.disposed,true);assert.equal(a.debug.playing,false);
 advance(50);assert.equal(ctx.state,'closed','dispose closes the shared context');
 console.log('PASS ambience: lazy on gesture, ducks, hidden → paused, 30s idle fades + suspends, leave → stopped + disposed');}

// 6. No leaked AudioContext across repeat visits: five enter/exit cycles, every context created ends up closed.
{const start=contexts.length;
 for(let i=0;i<5;i++){const a=S.createShopAmbience();a.input();a.fadeOut(.1);a.dispose();}
 const made=contexts.slice(start);assert.equal(made.length,5,'five visits → five (lazy) contexts, not zero and not more');
 assert.ok(made.every(c=>c.state==='closed'),'every one of the five is fully closed: no leaked AudioContext across visits');
 console.log('PASS 5 enter/exit cycles: one context per visit, all closed, nothing left running');}
