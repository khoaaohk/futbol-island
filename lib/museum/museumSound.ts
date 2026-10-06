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
let liveAmbience:{dispose:()=>void}|null=null;
export function createMuseumAmbience(){
 liveAmbience?.dispose();// one loop only (StrictMode double-mounts in dev)
 let c:AudioContext|null=null,gain:GainNode|null=null,source:AudioBufferSourceNode|null=null,disposed=false,idle=false,idleTimer:ReturnType<typeof setTimeout>|null=null;
 const debug={playing:false,level:0,starts:0,idle:false,disposed:false};
 function ramp(to:number,sec:number){if(!c||!gain)return;const t=c.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(to,t+sec);}
 function armIdle(){if(idleTimer)clearTimeout(idleTimer);idleTimer=setTimeout(()=>{idleTimer=null;idle=true;debug.idle=true;ramp(0,1.5);},AMBIENCE_IDLE_MS);}
 function start(){if(disposed)return;const level=ambienceLevel(readAmbienceSettings());debug.level=level;if(level<=0){if(source)ramp(0,.3);return;}
  c??=ctx();if(!c)return;if(c.state==='suspended')void c.resume().catch(()=>{});
  if(!source){gain=c.createGain();gain.gain.value=0;gain.connect(c.destination);source=c.createBufferSource();source.buffer=renderMuseumAmbience(c) as AudioBuffer;source.loop=true;source.connect(gain);source.start();debug.starts++;}
  debug.playing=true;ramp(level,AMBIENCE_FADE_IN);armIdle();}
 const api={
  /** Entry and every trusted input: start (once audio is unlocked) or wake from idle. */
  input(){if(disposed)return;if(idle||!debug.playing){idle=false;debug.idle=false;start();}else armIdle();},
  /** Tab hidden: fade out and suspend the page's audio; visible: resume and fade back in. */
  visibility(){if(!c||disposed)return;if(document.hidden){ramp(0,.15);const cc=c;setTimeout(()=>{if(document.hidden&&cc.state==='running')void cc.suspend().catch(()=>{});},220);}else if(!idle){void c.resume().catch(()=>{});start();}},
  /** Done pressed: fade out over `sec` (the doors closing). */
  fadeOut(sec=.4){ramp(0,sec);},
  /** Under the storytelling narration: drop to a third, then come back. */
  duck(on:boolean){if(!source||idle||disposed)return;ramp(on?debug.level*.35:debug.level,.3);},
  dispose(){if(disposed)return;disposed=true;debug.disposed=true;debug.playing=false;if(liveAmbience===api)liveAmbience=null;if(idleTimer)clearTimeout(idleTimer);try{source?.stop();}catch{/* stopped */}source?.disconnect();gain?.disconnect();source=null;gain=null;c=null;},
  get debug(){return {...debug};},
 };
 liveAmbience=api;return api;
}
export type MuseumAmbience=ReturnType<typeof createMuseumAmbience>;
