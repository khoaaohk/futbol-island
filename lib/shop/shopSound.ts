import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {ISLAND_SFX_MASTER,UI_CLICK} from '../audio/islandSound';

/**
 * Kit Shop audio (Oct 13 2026, user: "the boots studio needs audio for the background. provide audio for the store"). Follows the
 * Museum gallery's approach (lib/museum/museumSound.ts) exactly: one ORIGINAL procedural loop, rendered ONCE per visit into a mono
 * buffer and played as a looping buffer source (no live sequencer, no per-frame work), plus a handful of one-shot UI cues sharing
 * one lazily-created AudioContext. No downloads, no copyrighted music: every note is synthesised here, same as ballSound.ts's kick.
 *
 * The loop (renderShopAmbience, ~77 s so it never feels like it repeats): a warm, upbeat but low-key modern sports-store bed —
 * 100 bpm, C major, I–vi–IV–V, a soft "electric piano" pad holding each chord, a plucked guitar-ish arpeggio that varies every
 * 8 bars (4 different fills across the loop) with a light swing, a very soft kick, and a shaker on the off-beats — plus a subtle
 * store-room layer baked right into the same buffer: a faint low-passed crowd murmur, a couple of distant ball bounces and a
 * couple of hanger clinks. The register's own "cha-ching" is a separate one-shot (shopSfx.chaChing), fired once per purchase.
 *
 * Lifecycle (shared by every "walk-in document" room — Konbini, Museum, Arcade): the loop and the shared context are created lazily,
 * only from a real user gesture (SHOP_UNLOCK_EVENTS) — nothing is constructed on mount, so there is no audio before a tap. It fades
 * in over SHOP_AMBIENCE_FADE_IN, fades to SHOP_DUCK level while a studio is open (duck), fades out and suspends after
 * SHOP_IDLE_MS with no input (the island's idle rule) or when the tab is hidden, and fully stops + closes on dispose (leaving /shop).
 * It respects the island's mute (fi2-sound-muted) AND the separate music toggle/volume (fi2-music-enabled / fi2-music-volume):
 * muting either silences the bed; UI one-shots (click/whoosh/cha-ching) follow the sound mute + volume only, like every other
 * room's button click, so they still play with music off.
 */
export const SHOP_AMBIENCE_RATE=22050;
const SHOP_BPM=100,BEAT=60/SHOP_BPM,SHOP_BARS=32;
/** 32 bars × 4 beats × 0.6 s ≈ 76.8 s: comfortably inside the requested 60–90 s window. */
export const SHOP_AMBIENCE_SECONDS=BEAT*4*SHOP_BARS;
export const SHOP_AMBIENCE_FADE_IN=2,SHOP_IDLE_MS=30000,SHOP_IDLE_FADE=1.5,SHOP_DUCK=.4;

type Buf={getChannelData:(c:number)=>Float32Array;length:number;sampleRate:number};
type Ctx={createBuffer:(ch:number,len:number,rate:number)=>Buf};
const hz=(m:number)=>440*Math.pow(2,(m-69)/12);

/** One voice. `out` is written with wrap-around indexing ((start+n)%length): any note that would tail past the buffer's end
 *  bleeds into its head instead, the same trick arcadeRoomMusic.ts and konbiniMusic.ts use for a guaranteed seamless loop. */
function tone(out:Float32Array,rate:number,start:number,dur:number,midi:number,level:number,kind:'pad'|'pluck'|'bass'){
 const s0=Math.round(start*rate),count=Math.round(dur*rate),f=hz(midi);let ks:Float32Array|null=null,ki=0;
 if(kind==='pluck'){const period=Math.max(2,Math.round(rate/f));ks=new Float32Array(period);let seed=(Math.round(midi*7919))>>>0;
  for(let i=0;i<period;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ks[i]=seed/2147483648-1;}}
 for(let n=0;n<count;n++){const t=n/rate,p=n/count,ph=2*Math.PI*f*t;let w=0,env=1;
  switch(kind){
   case 'pad':env=Math.min(1,t/.09)*Math.pow(1-p,.55);w=Math.sin(ph)+.3*Math.sin(2*ph)+.12*Math.sin(3*ph);break;// slow-attack electric-piano-ish pad
   case 'bass':env=Math.min(1,t/.012)*Math.pow(1-p,1.3);w=Math.sin(ph)+.15*Math.sin(2*ph);break;
   case 'pluck':{const buf=ks!,i=ki%buf.length,nx=(ki+1)%buf.length;buf[i]=.497*(buf[i]+buf[nx]);w=buf[i];ki++;env=Math.min(1,t/.002)*Math.pow(1-p,.9);break;}// karplus-strong "guitar"
  }
  out[(s0+n)%out.length]+=w*env*level;}
}
/** Chord degrees (semitones above the C root) for I–vi–IV–V, two bars each; vi is the only minor triad. */
const DEGREES=[{root:0,minor:false},{root:9,minor:true},{root:5,minor:false},{root:7,minor:false}];
/** Plucked-arpeggio fills, one per 8-bar phrase (4 phrases round the 77 s loop) so it never feels static on repeat. */
const ARPS:number[][]=[[0,7,12,7,0,7,12,16],[0,12,7,16,12,7,4,0],[0,4,7,12,16,12,7,4],[12,7,4,0,7,12,16,12]];

/** Render the Kit Shop's loop once: a warm, upbeat-but-low-key store bed plus a faint room tone, normalised and declicked at the
 *  wrap. Deterministic (same buffer every time), so a controller may safely cache it across re-renders. */
export function renderShopAmbience(context:Ctx):Buf{
 const rate=SHOP_AMBIENCE_RATE,bars=SHOP_BARS,length=BEAT*4*bars,buffer=context.createBuffer(1,Math.round(rate*length),rate),out=buffer.getChannelData(0);
 const ROOT=48;// C3
 let seed=2612;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let bar=0;bar<bars;bar++){
  const deg=DEGREES[Math.floor(bar/2)%4],phrase=Math.floor(bar/8)%4,b0=bar*4*BEAT,third=deg.minor?3:4,root=ROOT+deg.root;
  // Bass: a held root with a soft lift on the "and" of beat 3 (konbini's bass motif).
  tone(out,rate,b0,BEAT*2.7,root-12,.17,'bass');tone(out,rate,b0+BEAT*2,BEAT*1.6,root+7-12,.12,'bass');
  // Pad: the triad held through most of the bar.
  for(const m of [root+12,root+12+third,root+19])tone(out,rate,b0,BEAT*3.8,m,.05,'pad');
  // Plucked arpeggio, swung eighths, the fill varied by phrase.
  const pat=ARPS[phrase];
  for(let e=0;e<8;e++){const swing=e%2?BEAT*.09:0;tone(out,rate,b0+e*BEAT*.5+swing,BEAT*.4,root+12+pat[e%pat.length],e%4===0?.065:.045,'pluck');}
  // Light percussion: a shaker on the off-beats, a very soft kick on 1 and 3 — background, never driving.
  for(let e=0;e<8;e++){if(e%2===0)continue;const s=Math.round((b0+e*BEAT*.5+BEAT*.09)*rate);for(let n=0;n<rate*.025;n++)out[(s+n)%out.length]+=rnd()*Math.exp(-n/rate*170)*.014;}
  if(bar%2===0){const s=Math.round(b0*rate);for(let n=0;n<rate*.1;n++){const t=n/rate;out[(s+n)%out.length]+=Math.sin(2*Math.PI*58*t)*Math.exp(-t*26)*.05;}}
 }
 // Store-room Foley, baked into the loop, well under the music: a couple of distant ball bounces and hanger clinks.
 for(const at of [9.6,33.6,57.1]){const s=Math.round(at*rate);for(let n=0;n<rate*.22;n++){const t=n/rate;out[(s+n)%out.length]+=(Math.sin(2*Math.PI*(130-70*t)*t)*Math.exp(-t*9)+rnd()*Math.exp(-t*30))*.03;}}
 for(const at of [4.3,14.6,24.9,44.2]){const s=Math.round(at*rate);for(let n=0;n<rate*.3;n++){const t=n/rate;out[(s+n)%out.length]+=(Math.sin(2*Math.PI*1760*t)+.4*Math.sin(2*Math.PI*1760*2.76*t))*Math.exp(-t*7)*.018;}}
 // Faint crowd murmur: one-pole low-passed noise, its tail cross-faded into its head so the continuous bed loops seamlessly
 // (the same technique as the Museum's gallery room tone, lib/museum/museumSound.ts renderMuseumAmbience).
 const fade=rate,murmur=new Float32Array(out.length+fade);let mseed=733,lp=0;
 for(let i=0;i<murmur.length;i++){mseed=(Math.imul(mseed,1664525)+1013904223)>>>0;lp+=.03*((mseed/2147483648-1)-lp);murmur[i]=lp;}
 for(let i=0;i<fade;i++){const k=i/fade;murmur[i]=murmur[i]*k+murmur[out.length+i]*(1-k);}
 for(let i=0;i<out.length;i++)out[i]+=murmur[i]*.4;
 // Normalise and declick the wrap (arcadeRoomMusic.ts / konbiniMusic.ts's convention).
 let peak=0;for(let i=0;i<out.length;i++)peak=Math.max(peak,Math.abs(out[i]));const scale=.6/Math.max(.6,peak);
 for(let i=0;i<out.length;i++)out[i]*=scale*Math.min(1,i/(rate*.004),(out.length-1-i)/(rate*.004));
 return buffer;
}

// ---- Shared context (one per /shop visit; lazy — nothing is constructed before a real gesture) --------------------------------
let shared:AudioContext|null=null;
/** The page's one AudioContext (the loop and every one-shot cue). null while sound is muted or unavailable. */
export function shopAudioContext():AudioContext|null{
 if(!isSoundEnabled())return null;
 try{
  if(shared?.state==='closed')shared=null;
  if(!shared){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return null;shared=new AC();}
  if(shared.state==='suspended')void shared.resume().catch(()=>{});
  return shared.state==='closed'?null:shared;
 }catch{return null;}
}
/** The page's audio-unlock gestures (iOS: touchend/click; desktop: pointer and keys), the Konbini/Museum convention. */
export const SHOP_UNLOCK_EVENTS=['pointerdown','pointerup','touchstart','touchend','click','keydown'] as const;
export function unlockShopAudio(){const c=shopAudioContext();if(c?.state!=='running')void c?.resume().catch(()=>{});}

// ---- One-shot UI cues ------------------------------------------------------------------------------------------------------
function sfxTone(freq:number,start:number,dur:number,gain:number,type:OscillatorType='sine'){
 const c=shopAudioContext();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
function sfxSweep(f0:number,f1:number,start:number,dur:number,gain:number,attack=.01){
 const c=shopAudioContext();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
function sfxNoise(start:number,dur:number,gain:number,freq:number,q=1,sweepTo?:number){
 const c=shopAudioContext();if(!c)return;const t=c.currentTime+start,len=Math.max(1,Math.round(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let s=len;
 for(let i=0;i<len;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=(s/2147483648-1)*(1-i/len);}
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;f.type='bandpass';f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q;
 g.gain.setValueAtTime(gain*getSoundVolume()*2,t);src.connect(f);f.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur+.02);
}
const cooldown=new Map<string,number>();
/** A per-key cooldown measured on the shared context clock, so the throttle holds even across a muted/then-unmuted stretch. */
function allow(key:string,interval:number):boolean{const c=shopAudioContext();if(!c)return false;const now=c.currentTime;if(now-(cooldown.get(key)??-Infinity)<interval)return false;cooldown.set(key,now);return true;}
export const shopSfx={
 /** The island's UI click (islandSound UI_CLICK), the same cue every walk-in room uses for its buttons. Lightly rate-limited
  *  so a double-fired click handler never doubles the sound. */
 click(){if(!allow('click',.05))return;sfxSweep(UI_CLICK.from,UI_CLICK.to,0,UI_CLICK.duration,UI_CLICK.level*ISLAND_SFX_MASTER,UI_CLICK.attack);},
 /** A soft rising-noise whoosh for a spin flick. Subtle and rate-limited (≥ 350 ms) so a quick flurry of flicks doesn't buzz. */
 whoosh(){if(!allow('whoosh',.35))return;sfxNoise(0,.26,.045,650,.8,2300);},
 /** The till: a short noise "chk" and two bright triangle notes, the register chime. Once per purchase (openBuy/doBuy call it
  *  once); the cooldown just guards against an accidental double-tap on the confirm button. */
 chaChing(){if(!allow('cha-ching',.3))return;sfxNoise(0,.05,.05,2500,3);sfxTone(2093,.04,.28,.06,'triangle');sfxTone(2637,.1,.35,.05,'triangle');},
};
/** Buttons that already own a cue (ball studio's pop/kick/spin feedback) opt out with this; everything else gets the plain
 *  click, and an element marked data-shop-spin gets the whoosh instead. One capture-phase listener on the room's root covers
 *  every studio too (they render in the same tree), so individual buttons across Jersey/Boot/Ball need no sound wiring at all. */
export function shopClickCue(target:EventTarget|null):'click'|'whoosh'|null{
 const b=target instanceof Element?target.closest('button:not(:disabled),a[href],[role=button]:not([aria-disabled=true])'):null;
 if(!b||b.matches('[data-shop-own-cue]'))return null;
 return b.matches('[data-shop-spin]')?'whoosh':'click';
}

// ---- The store ambience loop -------------------------------------------------------------------------------------------------
export function shopMusicLevel(s:{soundOn:boolean;musicOn:boolean;musicVolume:number;soundVolume:number;ducked:boolean}):number{
 if(!s.soundOn||!s.musicOn||s.soundVolume<=0)return 0;
 return Math.max(0,Math.min(1,s.musicVolume))*(s.ducked?SHOP_DUCK:1);
}
function readShopMusicSettings(){
 let musicOn=true,musicVolume=.04;
 try{musicOn=localStorage.getItem('fi2-music-enabled')!=='false';const raw=localStorage.getItem('fi2-music-volume'),v=raw===null?.04:Number(raw);if(Number.isFinite(v))musicVolume=Math.max(0,Math.min(1,v));}catch{/* defaults */}
 return {soundOn:isSoundEnabled(),musicOn,musicVolume,soundVolume:getSoundVolume()};
}
/** Only one loop may ever exist (React StrictMode double-mounts in dev, or a fast remount): a new controller disposes the
 *  previous one first, so visiting /shop five times in a row never leaves a trailing AudioContext behind. */
let liveAmbience:{dispose:()=>void}|null=null;
export function createShopAmbience(){
 liveAmbience?.dispose();
 let c:AudioContext|null=null,gain:GainNode|null=null,source:AudioBufferSourceNode|null=null,buffer:AudioBuffer|null=null;
 let disposed=false,idle=false,ducked=false,idleTimer:ReturnType<typeof setTimeout>|null=null;
 const debug={playing:false,level:0,starts:0,idle:false,ducked:false,disposed:false,contextState:'locked'};
 function ramp(to:number,sec:number){if(!c||!gain)return;const t=c.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(to,t+sec);}
 function level(){return shopMusicLevel({...readShopMusicSettings(),ducked});}
 function armIdle(){
  if(idleTimer)clearTimeout(idleTimer);
  idleTimer=setTimeout(()=>{idleTimer=null;idle=true;debug.idle=true;ramp(0,SHOP_IDLE_FADE);
   setTimeout(()=>{if(idle&&c&&!disposed){void c.suspend().catch(()=>{});debug.contextState=c.state;}},SHOP_IDLE_FADE*1000+60);
  },SHOP_IDLE_MS);
 }
 function start(){
  if(disposed)return;const lv=level();debug.level=lv;
  if(lv<=0){if(source)ramp(0,.3);debug.contextState=c?.state??'locked';return;}
  c??=shopAudioContext();if(!c){debug.contextState='locked';return;}
  if(c.state==='suspended')void c.resume().catch(()=>{});
  if(!source){buffer??=renderShopAmbience(c) as AudioBuffer;gain=c.createGain();gain.gain.value=0;gain.connect(c.destination);
   source=c.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.start();debug.starts++;}
  debug.playing=true;debug.contextState=c.state;ramp(lv,SHOP_AMBIENCE_FADE_IN);armIdle();
 }
 const api={
  /** Entry and every trusted input: start (once audio is unlocked and settings allow it) or wake from idle. */
  input(){if(disposed)return;if(idle||!debug.playing){idle=false;debug.idle=false;start();}else armIdle();},
  /** Tab hidden: fade out and suspend; visible again (and not idle): resume and fade back in. */
  visibility(){if(!c||disposed)return;
   if(document.hidden){ramp(0,.15);const cc=c;setTimeout(()=>{if(document.hidden&&cc.state==='running'){void cc.suspend().catch(()=>{});debug.contextState=cc.state;}},220);}
   else if(!idle){void c.resume().catch(()=>{});debug.contextState=c.state;start();}
  },
  /** A studio opens/closes: duck the bed to SHOP_DUCK level (never a hard mute), or bring it back. */
  duck(on:boolean){if(ducked===on)return;ducked=on;debug.ducked=on;const lv=level();debug.level=lv;if(!idle)ramp(lv,.3);},
  /** Leaving the shop: fade out over `sec` while the door slides, before dispose() a beat later. */
  fadeOut(sec=.4){ramp(0,sec);},
  dispose(){
   if(disposed)return;disposed=true;debug.disposed=true;debug.playing=false;if(liveAmbience===api)liveAmbience=null;
   if(idleTimer)clearTimeout(idleTimer);
   try{source?.stop();}catch{/* already stopped */}source?.disconnect();gain?.disconnect();source=null;gain=null;
   const cc=c;c=null;if(cc){debug.contextState='closing';void cc.close().catch(()=>{}).then(()=>{debug.contextState=cc.state;});}
  },
  get debug(){if(c)debug.contextState=c.state;return {...debug};},
 };
 liveAmbience=api;return api;
}
export type ShopAmbience=ReturnType<typeof createShopAmbience>;
