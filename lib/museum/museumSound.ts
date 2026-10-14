import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {konbiniAudioContext,konbiniSfx,unlockKonbiniAudio,KONBINI_UNLOCK_EVENTS} from '../konbini/konbiniSound';

/**
 * History Museum one-shots (Oct 3 2026). Original synth, no samples, no loop and no music: the gallery hush is the point (and it
 * keeps the phone cool). Everything plays through the walk-in rooms' one shared AudioContext (lib/konbini/konbiniSound.ts, also
 * unlocked on the same iOS gesture events) and respects the island's mute and volume settings.
 *  - footstep: a soft filtered tick on wood, one per stride, only while walking;
 *  - hush: a gentle "shh" on arrival; bell: the soft entrance bell;
 *  - whistle: the referee's whistle (the penalty case), a two-tone pea-whistle trill;
 *  - card: a paper flick as a yellow/red card is held up; reveal: the VAR "decision" chord; turn: the timeline/zoom whoosh.
 */
const ctx=()=>konbiniAudioContext();
function tone(freq:number,start:number,dur:number,gain=.08,type:OscillatorType='sine',vibrato=0){
 const c=ctx();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
 let lfo:OscillatorNode|null=null;if(vibrato){lfo=c.createOscillator();const lg=c.createGain();lfo.frequency.value=vibrato;lg.gain.value=freq*.06;lfo.connect(lg);lg.connect(o.frequency);lfo.start(t);lfo.stop(t+dur+.02);}
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.012);g.gain.setValueAtTime(peak,t+Math.max(.02,dur*.6));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
function noise(start:number,dur:number,gain:number,freq:number,q=1,type:BiquadFilterType='bandpass',attack=0){
 const c=ctx();if(!c)return;const t=c.currentTime+start,len=Math.max(1,Math.round(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let seed=len;
 for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const env=attack?Math.min(1,i/(attack*c.sampleRate)):1;d[i]=(seed/2147483648-1)*(1-i/len)*env;}
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;f.type=type;f.frequency.value=freq;f.Q.value=q;
 g.gain.setValueAtTime(gain*getSoundVolume()*2,t);src.connect(f);f.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur+.02);
}
let step=0;
export const museumSfx={
 click:konbiniSfx.click,
 footstep:()=>{step++;noise(0,.06,.022,step%2?520:460,1.6,'bandpass');tone(step%2?118:104,0,.05,.02,'sine');},
 hush:()=>noise(0,.75,.035,3800,.7,'highpass',.25),
 bell:()=>{tone(660,0,.9,.05,'sine');tone(660*2.76,0,.3,.012,'sine');tone(990,.18,1,.035,'sine');},
 whistle:()=>{tone(2950,0,.32,.05,'sine',38);tone(3120,.36,.5,.05,'sine',38);noise(0,.86,.012,3000,2);},
 card:()=>{noise(0,.07,.05,2800,1.8);tone(1300,.02,.06,.02,'triangle');},
 reveal:()=>{tone(523,0,.35,.05,'triangle');tone(659,.08,.35,.05,'triangle');tone(784,.16,.5,.05,'triangle');},
 turn:konbiniSfx.whoosh,
 look:()=>noise(0,.16,.025,1500,1.2),
 /** Storytelling exhibits: a split-flap flutter tick, the zoetrope's frame click, a net swish + thump, a rubber stamp, a soft
  *  crowd "ooh-ahh" swell (filtered noise), and a book flap. All one-shots ≤ 1 s. */
 flap:()=>{noise(0,.025,.03,3400,3);tone(2200,0,.02,.008,'square');},
 tick:()=>noise(0,.02,.018,2600,4),
 net:()=>{noise(0,.22,.05,900,.9);tone(95,.05,.18,.07,'sine');},
 stamp:()=>{tone(80,0,.16,.12,'sine');noise(0,.06,.06,400,1.2);},
 crowd:()=>{noise(0,1.1,.03,700,.6,'bandpass',.35);noise(.15,.9,.02,1300,.7,'bandpass',.3);},
 flapBook:()=>noise(0,.05,.03,2000,1.6),
 kick:()=>konbiniSfx.kick(5),
 spin:()=>noise(0,.12,.02,900,1.4),
};
export {unlockKonbiniAudio as unlockMuseumAudio,KONBINI_UNLOCK_EVENTS as MUSEUM_UNLOCK_EVENTS};
/** The island's UI click for every button, except the ones with their own cue (cards, whistle, spin). */
export const MUSEUM_OWN_CUE='[data-museum-own-cue]';
export function museumClickTarget(target:EventTarget|null):Element|null{
 const b=target instanceof Element?target.closest('button:not(:disabled),a[href],[role=button]:not([aria-disabled=true])'):null;
 return b&&!b.matches(MUSEUM_OWN_CUE)?b:null;
}

// ---- Gallery ambience (Oct 3 2026, user: "a soft ambient loop inside the museum") ------------------------------------------
/**
 * A quiet, calm gallery-hall bed: an ORIGINAL procedural pad (a slow D major add9 chord breathing in and out) over a soft
 * low-passed room tone. Rendered ONCE per visit into a 16 s mono buffer at 22.05 kHz (~1.4 MB) and played as one looping buffer
 * source, the Konbini/Arcade music approach: no live oscillators, no sequencer, no timers but the idle one. Seamless: every pad
 * frequency and swell completes whole cycles in the loop, and the room tone's tail is cross-faded into its head.
 * Level: the island's music volume (fi2-music-volume) scaled down and capped below the footsteps' peak, so it never sits over
 * the one-shots; off when sound is muted (fi2-sound-muted) or music is off (fi2-music-enabled). Fades in ~2 s on entry, fades
 * out on Done, fades + suspends when the tab is hidden or after 30 s without input (the island's idle rule), and stops on leave.
 */
export const AMBIENCE_SECONDS=16,AMBIENCE_RATE=22050,AMBIENCE_FADE_IN=2,AMBIENCE_IDLE_MS=30000;
type ABuf={getChannelData:(c:number)=>Float32Array;length:number;sampleRate:number};
export function renderMuseumAmbience(context:{createBuffer:(ch:number,len:number,rate:number)=>ABuf}):ABuf{
 const rate=AMBIENCE_RATE,L=AMBIENCE_SECONDS,n=rate*L,buffer=context.createBuffer(1,n,rate),out=buffer.getChannelData(0);
 const whole=(f:number)=>Math.round(f*L)/L;// whole cycles per loop → seamless
 // D3, A3, E4, F#4, A4 (an add9 voicing), each with a slow swell of its own (2, 3, 4… cycles per loop) and a soft 2nd partial.
 const notes=[[146.83,.16,1],[220,.12,2],[329.63,.07,3],[369.99,.06,4],[440,.045,5]] as const;
 for(const [f0,level,sw] of notes){const f=whole(f0),p=Math.PI*2*f/rate,s=Math.PI*2*(sw/L)/rate,off=sw*1.3;
  for(let i=0;i<n;i++){const swell=.55+.45*Math.sin(i*s+off);out[i]+=(Math.sin(i*p)+.18*Math.sin(2*i*p))*level*swell;}}
 // Room tone: one-pole low-passed noise, tail cross-faded into the head.
 const fade=rate,tone=new Float32Array(n+fade);let seed=1863,lp=0;
 for(let i=0;i<n+fade;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;lp+=(.04)*((seed/2147483648-1)-lp);tone[i]=lp;}
 for(let i=0;i<fade;i++){const k=i/fade;tone[i]=tone[i]*k+tone[n+i]*(1-k);}
 for(let i=0;i<n;i++)out[i]+=tone[i]*.9;
 let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(out[i]));const scale=.6/Math.max(1e-6,peak);for(let i=0;i<n;i++)out[i]*=scale;
 return buffer;
}
/** The ambience gain: music volume × 0.3, never above half the footsteps' peak (0.022 × sound volume × 2 × 0.5); 0 when off. */
export function ambienceLevel(s:{soundOn:boolean;musicOn:boolean;musicVolume:number;soundVolume:number}){
 if(!s.soundOn||!s.musicOn)return 0;return Math.max(0,Math.min(s.musicVolume*.3,.022*s.soundVolume));
}
function readAmbienceSettings(){let musicOn=true,musicVolume=.04;try{musicOn=localStorage.getItem('fi2-music-enabled')!=='false';const raw=localStorage.getItem('fi2-music-volume'),v=raw===null?.04:Number(raw);if(Number.isFinite(v))musicVolume=Math.max(0,Math.min(1,v));}catch{/* defaults */}
 return {soundOn:isSoundEnabled(),musicOn,musicVolume,soundVolume:getSoundVolume()};}
// ---- Hall & exhibit MUSIC (Oct 13 2026, user: "give background music that fits with the museum") -------------------------
/**
 * Real music, not just the room-tone pad above: a calm, curious gallery theme (soft piano/mallet motifs over warm pads, 78
 * bpm, D major) with a faint hint of football heritage (a distant crowd swell, a soft brass motif) baked in a few times
 * across a ≈98 s loop so it never feels like it tiles. Stepping inside an exhibit cross-fades to a lighter, more rhythmic
 * "activity" variant in the same key and palette (104 bpm); the penalty-1891 arcade cabinet gets its own subtle
 * chiptune-flavoured variant (same chords, square/triangle voices). All three are ORIGINAL procedural buffers (no samples,
 * no downloads), rendered once per AudioContext with plain math into a Float32Array (the arcadeRoomMusic.ts / shopSound.ts
 * convention — no OfflineAudioContext needed, since nothing here is a live node graph to render). `createMuseumAmbience()`
 * below plays one of the three through the walk-in rooms' one shared AudioContext and cross-fades between them; the plain
 * room-tone pad (renderMuseumAmbience, above) is kept for its own test but is no longer what plays.
 */
const D_SCALE=[0,2,4,5,7,9,11];// D E F# G A B C#: degree() turns any integer scale step into a semitone offset from D
const ROOT=50;// D3 — the hall/exhibit/pixel themes' shared root
const CHORDS=[{semi:0,minor:false},{semi:7,minor:false},{semi:9,minor:true},{semi:5,minor:false}];// D (I) – A (V) – Bm (vi) – G (IV)
const hz=(m:number)=>440*Math.pow(2,(m-69)/12);
const degree=(step:number)=>{const oct=Math.floor(step/7),idx=((step%7)+7)%7;return D_SCALE[idx]+12*oct;};
type MusicKind='pad'|'mallet'|'bass'|'brass'|'square'|'tri';
/** One note, written with wrap-around indexing so a tail past the buffer's end bleeds into its head (the arcadeRoomMusic.ts
 *  seamless-loop trick). */
function voice(out:Float32Array,rate:number,start:number,dur:number,midi:number,level:number,kind:MusicKind){
 const s0=Math.round(start*rate),count=Math.round(dur*rate),f=hz(midi);
 for(let n=0;n<count;n++){const t=n/rate,p=n/count,ph=2*Math.PI*f*t;let w=0,env=1;
  switch(kind){
   case 'pad':env=Math.min(1,t/.35)*Math.pow(1-p,.5);w=Math.sin(ph)+.28*Math.sin(2*ph)+.1*Math.sin(3*ph);break;// slow-attack warm pad
   case 'mallet':env=Math.min(1,t/.006)*Math.exp(-t*2.6);w=Math.sin(ph)+.22*Math.sin(ph*3.98)*Math.exp(-t*7);break;// soft marimba/vibraphone
   case 'bass':env=Math.min(1,t/.05)*Math.pow(1-p,.7);w=Math.sin(ph)+.12*Math.sin(2*ph);break;
   case 'brass':env=Math.min(1,t/.4)*Math.pow(1-p,.4);w=Math.sin(ph)+.22*Math.sin(2*ph)+.12*Math.sin(3*ph)+.05*Math.sin(4*ph);break;// faint football-heritage brass
   case 'square':env=Math.min(1,t/.004)*Math.pow(1-p,1.4);w=Math.sign(Math.sin(ph))*.7+.3*Math.sin(ph);break;// chiptune lead
   case 'tri':env=Math.min(1,t/.008)*Math.pow(1-p,1.1);w=(2/Math.PI)*Math.asin(Math.sin(ph));break;// chiptune bass
  }
  out[(s0+n)%out.length]+=w*env*level;}
}
/** A distant stadium roar: one-pole low-passed noise under a rise-fall swell, baked right into the loop (the football hint). */
function crowdSwell(out:Float32Array,rate:number,at:number,dur:number,level:number){
 const s0=Math.round(at*rate),count=Math.round(dur*rate);let seed=(Math.round(at*1000)+401)>>>0,lp=0;
 for(let n=0;n<count;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;lp+=.05*((seed/2147483648-1)-lp);
  const swell=Math.sin(Math.PI*Math.min(1,n/count));out[(s0+n)%out.length]+=lp*swell*swell*level;}
}
function shaker(out:Float32Array,rate:number,at:number,level:number){let seed=(Math.round(at*997)+13)>>>0;const n=Math.round(rate*.03),s0=Math.round(at*rate);
 for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;out[(s0+i)%out.length]+=(seed/2147483648-1)*Math.exp(-i/rate*180)*level;}}
function softKick(out:Float32Array,rate:number,at:number,level:number){const n=Math.round(rate*.11),s0=Math.round(at*rate);
 for(let i=0;i<n;i++){const t=i/rate;out[(s0+i)%out.length]+=Math.sin(2*Math.PI*56*t)*Math.exp(-t*24)*level;}}
function normalise(out:Float32Array,rate:number,peakTarget:number,declickSec=.01){
 let peak=0;for(let i=0;i<out.length;i++)peak=Math.max(peak,Math.abs(out[i]));const scale=peak>1e-6?peakTarget/peak:1,fade=Math.round(rate*declickSec);
 for(let i=0;i<out.length;i++)out[i]*=scale*Math.min(1,i/fade,(out.length-1-i)/fade);
}

export const HALL_BPM=78,HALL_RATE=AMBIENCE_RATE;
const HALL_BEAT=60/HALL_BPM;
/** 2-bar chord segments (D–A–Bm–G), 16 of them = 32 bars ≈ 98.5 s: comfortably over the requested 90 s floor. */
export const HALL_SECONDS=HALL_BEAT*8*16;
/** The gallery hall theme: a soft mallet motif (varied every 8-bar phrase) over a warm pad and a soft bass root, with a
 *  faint football-heritage hint — a couple of distant crowd swells and a two-spot soft brass motif — placed at distinct,
 *  non-repeating moments so the loop never feels like it tiles. Kid-friendly and gently in motion, never sleepy. */
export function renderMuseumHallTheme(context:{createBuffer:(ch:number,len:number,rate:number)=>ABuf}):ABuf{
 const rate=HALL_RATE,total=Math.round(rate*HALL_SECONDS),buffer=context.createBuffer(1,total,rate),out=buffer.getChannelData(0);
 const SEG=HALL_BEAT*8,MOTIFS:number[][]=[[7,9,11,14,11,9,7,4],[9,11,14,16,14,11,9,7],[11,14,16,18,16,14,11,9],[7,11,9,14,11,16,14,18]];
 for(let seg=0;seg<16;seg++){
  const phrase=Math.floor(seg/4)%4,chord=CHORDS[seg%CHORDS.length],root=ROOT+chord.semi,third=chord.minor?3:4,b0=seg*SEG;
  for(const m of [root+12,root+12+third,root+19])voice(out,rate,b0,SEG*.98,m,.03,'pad');
  voice(out,rate,b0,SEG*.95,root-12,.045,'bass');
  const pat=MOTIFS[phrase],times=[0,1.3,2.7,4,5.3,6.7];
  for(let i=0;i<times.length;i++)voice(out,rate,b0+times[i]*HALL_BEAT,HALL_BEAT*.9,ROOT+degree(pat[i]),phrase%2===0?.052:.045,'mallet');
 }
 for(const at of [16.4,52.1,83.6])crowdSwell(out,rate,at,3.2,.03);
 for(const [at,n0,n1,n2] of [[37.5,19,23,26],[90.2,14,19,21]] as [number,number,number,number][])
  [n0,n1,n2].forEach((iv,i)=>voice(out,rate,at+i*.5,1.4,ROOT+iv,.022,'brass'));
 normalise(out,rate,.6);
 return buffer;
}

export const EXHIBIT_BPM=104,EXHIBIT_RATE=AMBIENCE_RATE;
const EXHIBIT_BEAT=60/EXHIBIT_BPM;
/** 1-bar chord segments, 16 of them ≈ 37 s: short enough that it is only ever heard while an exhibit is open. */
export const EXHIBIT_SECONDS=EXHIBIT_BEAT*4*16;
/** The activity variant: same key and chords as the hall theme, a touch faster and lightly rhythmic (a soft shaker and a
 *  gentle kick), thinner pad and a quicker mallet figure — playful under an exhibit's own SFX, never driving. */
export function renderMuseumExhibitTheme(context:{createBuffer:(ch:number,len:number,rate:number)=>ABuf}):ABuf{
 const rate=EXHIBIT_RATE,total=Math.round(rate*EXHIBIT_SECONDS),buffer=context.createBuffer(1,total,rate),out=buffer.getChannelData(0);
 const SEG=EXHIBIT_BEAT*4,MOTIFS:number[][]=[[7,9,11,9],[9,11,14,11],[11,14,16,14],[14,16,18,16]];
 for(let seg=0;seg<16;seg++){
  const phrase=Math.floor(seg/4)%4,chord=CHORDS[seg%CHORDS.length],root=ROOT+chord.semi,third=chord.minor?3:4,b0=seg*SEG,pat=MOTIFS[phrase];
  for(const m of [root+12,root+12+third])voice(out,rate,b0,SEG*.95,m,.02,'pad');
  voice(out,rate,b0,SEG*.9,root-12,.04,'bass');
  for(let i=0;i<4;i++)voice(out,rate,b0+i*EXHIBIT_BEAT,EXHIBIT_BEAT*.55,ROOT+degree(pat[i]),.05,'mallet');
  shaker(out,rate,b0+EXHIBIT_BEAT*.5,.016);shaker(out,rate,b0+EXHIBIT_BEAT*2.5,.016);
  if(seg%2===0)softKick(out,rate,b0,.05);
 }
 normalise(out,rate,.6);
 return buffer;
}

export const PIXEL_RATE=AMBIENCE_RATE,PIXEL_SECONDS=EXHIBIT_SECONDS;
/** penalty-1891's arcade cabinet: the same ≈37 s chord grid in chiptune voices (a triangle bass, a square-wave lead) —
 *  subtle under its own gameplay SFX, but recognisably the same piece as the hall and activity themes. */
export function renderMuseumPixelTheme(context:{createBuffer:(ch:number,len:number,rate:number)=>ABuf}):ABuf{
 const rate=PIXEL_RATE,total=Math.round(rate*PIXEL_SECONDS),buffer=context.createBuffer(1,total,rate),out=buffer.getChannelData(0);
 const SEG=EXHIBIT_BEAT*4,MOTIFS:number[][]=[[7,11,14,11],[9,14,16,14],[11,16,18,16],[14,18,21,18]];
 for(let seg=0;seg<16;seg++){
  const phrase=Math.floor(seg/4)%4,chord=CHORDS[seg%CHORDS.length],root=ROOT+chord.semi,b0=seg*SEG,pat=MOTIFS[phrase];
  voice(out,rate,b0,SEG*.92,root-12,.045,'tri');
  for(let i=0;i<8;i++)voice(out,rate,b0+i*EXHIBIT_BEAT*.5,EXHIBIT_BEAT*.28,ROOT+degree(pat[i%pat.length]),i%2===0?.04:.028,'square');
  shaker(out,rate,b0+EXHIBIT_BEAT*.5,.014);shaker(out,rate,b0+EXHIBIT_BEAT*2.5,.014);
  if(seg%2===0)softKick(out,rate,b0,.045);
 }
 normalise(out,rate,.55);
 return buffer;
}

/** The music's own level: the island's music volume, gently capped (never loud under Ada's lines or an exhibit's own SFX),
 *  ducked further by duck() (Ada's guide panel, the arrival bell/hush); silent when sound is muted or music is off. */
export const MUSIC_DUCK=.3;
export function museumMusicLevel(s:{soundOn:boolean;musicOn:boolean;musicVolume:number;soundVolume:number;ducked:boolean}){
 if(!s.soundOn||!s.musicOn||s.soundVolume<=0)return 0;
 return Math.max(0,Math.min(s.musicVolume,.06))*(s.ducked?MUSIC_DUCK:1);
}

export type MuseumMusicTheme='hall'|'exhibit'|'pixel';
let liveAmbience:{dispose:()=>void}|null=null;
// One looping buffer per AudioContext (lazy, rendered once and reused for the rest of the visit).
let bufferCtx:AudioContext|null=null,hallBuffer:AudioBuffer|null=null,exhibitBuffer:AudioBuffer|null=null,pixelBuffer:AudioBuffer|null=null;
function themeBuffer(c:AudioContext,theme:MuseumMusicTheme):AudioBuffer{
 if(bufferCtx!==c){bufferCtx=c;hallBuffer=exhibitBuffer=pixelBuffer=null;}
 if(theme==='pixel')return pixelBuffer??=renderMuseumPixelTheme(c) as AudioBuffer;
 if(theme==='exhibit')return exhibitBuffer??=renderMuseumExhibitTheme(c) as AudioBuffer;
 return hallBuffer??=renderMuseumHallTheme(c) as AudioBuffer;
}
export function createMuseumAmbience(){
 liveAmbience?.dispose();// one loop only (StrictMode double-mounts in dev)
 let disposed=false,idle=false,ducked=false,idleTimer:ReturnType<typeof setTimeout>|null=null;
 let slot:{source:AudioBufferSourceNode;gain:GainNode;theme:MuseumMusicTheme}|null=null;
 let fading:{source:AudioBufferSourceNode;gain:GainNode}[]=[];
 // The shared context, cached the moment it is actually obtained (startSlot/switchTheme/start below): konbiniAudioContext()
 // resumes a suspended context as a side effect of merely being called, so every PASSIVE read (idle fade-out, the hidden
 // branch of visibility(), fadeOut(), duck()) uses this cached reference instead of calling ctx() again and waking it back up.
 let held:AudioContext|null=null;
 const debug={playing:false,level:0,starts:0,idle:false,disposed:false,ducked:false,theme:'hall' as MuseumMusicTheme,contextState:'locked'};
 function ramp(gain:GainNode,c:AudioContext,to:number,sec:number){const t=c.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(to,t+sec);}
 // resume() is genuinely asynchronous in real browsers: debug.contextState is set here optimistically (so a synchronous
 // peek right after isn't stuck on a stale 'locked'), then corrected once the promise actually settles.
 function wake(c:AudioContext){debug.contextState=c.state;void c.resume().then(()=>{debug.contextState=c.state;}).catch(()=>{});}
 function sleep(c:AudioContext){void c.suspend().then(()=>{debug.contextState=c.state;}).catch(()=>{});}
 function level(){return museumMusicLevel({...readAmbienceSettings(),ducked});}
 function armIdle(){if(idleTimer)clearTimeout(idleTimer);idleTimer=setTimeout(()=>{idleTimer=null;idle=true;debug.idle=true;
   if(held&&slot)ramp(slot.gain,held,0,1.5);
   setTimeout(()=>{if(!idle||!held)return;if(held.state==='running')sleep(held);},1560);
  },AMBIENCE_IDLE_MS);}
 function startSlot(theme:MuseumMusicTheme){
  const c=ctx();if(!c)return;held=c;
  const gain=c.createGain();gain.gain.value=0;gain.connect(c.destination);
  const source=c.createBufferSource();source.buffer=themeBuffer(c,theme);source.loop=true;source.connect(gain);source.start();
  slot={source,gain,theme};debug.starts++;debug.theme=theme;
 }
 function retire(old:{source:AudioBufferSourceNode;gain:GainNode},sec:number){
  if(held)ramp(old.gain,held,0,sec);fading.push(old);
  setTimeout(()=>{try{old.source.stop();}catch{/* already stopped */}old.source.disconnect();old.gain.disconnect();fading=fading.filter(f=>f!==old);},sec*1000+120);
 }
 /** Cross-fade to a different theme (hall ↔ exhibit ↔ pixel); a no-op if it is already playing. */
 function switchTheme(theme:MuseumMusicTheme,sec=1.1){
  if(disposed||slot?.theme===theme)return;debug.theme=theme;idle=false;debug.idle=false;const prev=slot;
  const c=ctx();if(c){held=c;if(c.state==='suspended')wake(c);}
  startSlot(theme);if(c&&slot)ramp(slot.gain,c,level(),sec);
  if(prev)retire(prev,sec);
  armIdle();
 }
 function start(){
  if(disposed)return;const lv=level();debug.level=lv;
  if(lv<=0){if(slot&&held)ramp(slot.gain,held,0,.3);debug.contextState=held?.state??'locked';return;}
  const c=ctx();if(!c){debug.contextState='locked';return;}
  held=c;if(c.state==='suspended')wake(c);else debug.contextState=c.state;
  if(!slot)startSlot(debug.theme);
  if(slot)ramp(slot.gain,c,lv,AMBIENCE_FADE_IN);
  debug.playing=true;armIdle();
 }
 const api={
  /** Entry and every trusted input: start (once audio is unlocked) or wake from idle. */
  input(){if(disposed)return;if(idle||!debug.playing){idle=false;debug.idle=false;start();}else armIdle();},
  /** Tab hidden: fade out and suspend the page's audio (without waking it first); visible: resume and fade back in. */
  visibility(){if(disposed)return;
   if(document.hidden){if(held){if(slot)ramp(slot.gain,held,0,.15);const cc=held;setTimeout(()=>{if(document.hidden&&cc.state==='running')sleep(cc);},220);}}
   else if(!idle){const c=ctx();if(c){held=c;wake(c);}start();}},
  /** Done pressed: fade out over `sec` (the doors closing). */
  fadeOut(sec=.4){if(!held)return;if(slot)ramp(slot.gain,held,0,sec);for(const f of fading)ramp(f.gain,held,0,sec);},
  /** Under a voice-over (Ada's guide panel, the arrival bell/hush): drop to MUSIC_DUCK, then come back. */
  duck(on:boolean){if(disposed||ducked===on)return;ducked=on;debug.ducked=on;debug.level=level();if(!idle&&slot&&held)ramp(slot.gain,held,debug.level,.3);},
  /** Step inside / out of an exhibit: cross-fade to its activity variant (or back to the hall theme). `pixel` picks the
   *  penalty-1891 cabinet's chiptune-flavoured variant. */
  setExhibit(active:boolean,pixel=false){if(disposed)return;switchTheme(active?(pixel?'pixel':'exhibit'):'hall');},
  dispose(){
   if(disposed)return;disposed=true;debug.disposed=true;debug.playing=false;if(liveAmbience===api)liveAmbience=null;
   if(idleTimer)clearTimeout(idleTimer);
   const kill=(s:{source:AudioBufferSourceNode;gain:GainNode})=>{try{s.source.stop();}catch{/* already stopped */}s.source.disconnect();s.gain.disconnect();};
   if(slot)kill(slot);for(const f of fading)kill(f);slot=null;fading=[];
  },
  // Note: this never calls ctx() itself — konbiniAudioContext() resumes a suspended context as a side effect of being read,
  // so a passive debug peek must only report the state already tracked at the points that actually changed it.
  get debug(){return {...debug};},
 };
 liveAmbience=api;return api;
}
export type MuseumAmbience=ReturnType<typeof createMuseumAmbience>;
