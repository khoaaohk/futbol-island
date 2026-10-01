import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {ISLAND_SFX_MASTER,UI_CLICK} from '../audio/islandSound';
/**
 * Konbini one-shot sounds: the door chime (a generic two-note ding-dong, not any chain's jingle), the register, a bite and
 * the layer "tick" used by the purchase reveal. Oscillators only, created on demand and stopped within a second; no loop,
 * no scheduler, no assets. Respects the island's mute and volume settings.
 */
let shared:AudioContext|null=null;
/** The page's one AudioContext (door chime, register, bites, reveal ticks and the in-store music). */
export function konbiniAudioContext(){return context();}
function context(){if(!isSoundEnabled())return null;try{if(shared?.state==='closed')shared=null;shared??=new AudioContext();if(shared.state==='suspended')void shared.resume().catch(()=>{});return shared.state==='closed'?null:shared;}catch{return null;}}
function tone(freq:number,start:number,dur:number,gain=.12,type:OscillatorType='sine'){
 const c=context();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
/** A one-shot pitch sweep (the sip's gulp bubble, the UI click). */
function sweep(f0:number,f1:number,start:number,dur:number,gain=.06,attack=.01){
 const c=context();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
/** A bell strike: the note plus a soft inharmonic partial (2.76×), the door chime's timbre. */
function bell(freq:number,start:number,dur:number,gain:number){tone(freq,start,dur,gain,'sine');tone(freq*2.76,start,dur*.35,gain*.22,'sine');tone(freq*2,start,dur*.6,gain*.12,'triangle');}
/**
 * A contented "ahh" (Oct 1 2026, the end of eating): a voiced vowel, original synth. A soft sawtooth glides down a fifth through
 * two "ah" formant band-passes (≈ 750 and 1200 Hz) with a gentle swell and a slow fade, ≈ 0.75 s. One-shot, no samples.
 */
function vowel(start:number,dur:number,gain:number){
 const c=context();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain(),out=c.createGain();o.type='sawtooth';
 o.frequency.setValueAtTime(330,t);o.frequency.linearRampToValueAtTime(300,t+dur*.25);o.frequency.exponentialRampToValueAtTime(215,t+dur);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.09);g.gain.setValueAtTime(peak,t+dur*.45);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);for(const [f,q,l] of [[750,6,1],[1200,8,.55],[2600,10,.12]] as const){const b=c.createBiquadFilter(),bl=c.createGain();b.type='bandpass';b.frequency.value=f;b.Q.value=q;bl.gain.value=l;g.connect(b);b.connect(bl);bl.connect(out);}
 out.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
/** The door chime: an original, generic bell "ding-dong" (not any chain's jingle), ≈ 1 s. */
function doorChime(){bell(988,0,.6,.1);bell(784,.3,.8,.1);}
/**
 * Audio unlock (Oct 1 2026, user: "the Konbini is missing a sound when starting out"). The store is its own document, so on a
 * phone (iOS above all) its AudioContext starts locked and only a tap may start it. Arriving, the chime plays at once when audio
 * is already allowed; otherwise it waits for the first tap or key (walking in) for up to ARRIVAL_CHIME_MS, then is dropped.
 * `unlockKonbiniAudio` is called from the page's own pointerdown / pointerup / touchend / click / keydown listeners (touchend and
 * click are what iOS counts as a gesture), so every sound after that, button clicks included, plays inside the tap.
 */
export const ARRIVAL_CHIME_MS=8000;
let pendingChime=0;
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
function flushChime(c:AudioContext){if(!pendingChime||c.state!=='running')return;const due=now()-pendingChime<=ARRIVAL_CHIME_MS;pendingChime=0;if(due)konbiniSfx.chime();}
export function unlockKonbiniAudio(){const c=context();if(!c)return;if(c.state==='running'){flushChime(c);return;}void c.resume().then(()=>flushChime(c)).catch(()=>{});}
/** Arrival: chime now if audio may play, else on the first tap (see above). Plays once per call. */
export function konbiniArrivalChime(){const c=context();if(!c)return;if(c.state==='running'){konbiniSfx.chime();return;}pendingChime=now();void c.resume().then(()=>flushChime(c)).catch(()=>{});}

/** The page's audio-unlock gestures (iOS: touchend and click; desktop: pointer and keys). */
export const KONBINI_UNLOCK_EVENTS=['pointerdown','pointerup','touchstart','touchend','click','keydown'] as const;
/**
 * The island's button click (Town.tsx onClickCapture → islandSound ui('click')) for every button in the store: Done, Back, the
 * Look/Read/Talk prompt, Preview, Buy, Eat now, Save, the section arrows, Talk, stamp card… (user, Oct 1 2026: "the Konbini Done
 * button has no sound", "the food preview button has no sound"). Played in the click itself, so it is inside the tap on iOS.
 * Buttons with their own cue are left alone: the ball actions (kick / touch sounds), shelf products (the flick) and the bite toy.
 */
export const KONBINI_OWN_CUE='[data-konbini-action],[data-konbini-slot],[data-konbini-bite]';
export function konbiniClickTarget(target:EventTarget|null):Element|null{
 const b=target instanceof Element?target.closest('button:not(:disabled),a[href],[role=button]:not([aria-disabled=true])'):null;
 return b&&!b.matches(KONBINI_OWN_CUE)?b:null;}
/** Test hook: is an arrival chime still waiting for the first tap? */
export const konbiniChimePending=()=>pendingChime>0;
export const konbiniTick=(step=0)=>tone(880+step*70,0,.08,.06,'triangle');
/** A short filtered-noise burst (steam hiss, page riffle, paper flick, whoosh). One-shot, stopped within its length. */
function noise(start:number,dur:number,gain:number,freq:number,q=1,sweepTo?:number){
 const c=context();if(!c)return;const t=c.currentTime+start,len=Math.max(1,Math.round(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let seed=len;
 for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/2147483648-1)*(1-i/len);}
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;f.type='bandpass';f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q;
 g.gain.setValueAtTime(gain*getSoundVolume()*2,t);src.connect(f);f.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur+.02);
}
/** Delight one-shots (review top 10, Sep 29 2026): all ≤ 0.6 s, no loops, no timers. */
export const konbiniSfx={
 /** The island's UI click (islandSound UI_CLICK) at the same loudness: the store's Done, Back, Preview, Look, Buy… buttons. */
 click:()=>sweep(UI_CLICK.from,UI_CLICK.to,0,UI_CLICK.duration,UI_CLICK.level*ISLAND_SFX_MASTER/2,UI_CLICK.attack),
 /** The door chime, and the arrival chime (now, or on the first tap: konbiniArrivalChime). */
 chime:()=>doorChime(),
 arrive:()=>konbiniArrivalChime(),
 /** The end of eating: a satisfied "ahh" (vowel above). */
 ahh:()=>vowel(0,.75,.075),
 whoosh:()=>noise(0,.28,.05,600,.8,2400),
 flick:()=>{noise(0,.06,.06,3200,2);tone(1400,.01,.05,.025,'triangle');},
 thunk:()=>{tone(110,0,.18,.14,'sine');noise(0,.08,.06,300,1.2);},
 correct:()=>{tone(784,0,.14,.07,'triangle');tone(988,.09,.14,.07,'triangle');tone(1319,.18,.22,.07,'triangle');},
 wrong:()=>{tone(330,0,.16,.05,'triangle');tone(294,.12,.2,.05,'triangle');},
 finish:()=>{tone(1047,0,.25,.07,'sine');tone(1319,.1,.25,.07,'sine');tone(1568,.2,.4,.08,'sine');},
 kaching:()=>{noise(0,.05,.05,2500,3);tone(2093,.04,.28,.06,'triangle');tone(2637,.1,.35,.05,'triangle');},
 coin:(i=0)=>tone(1760+i*90,i*.07,.07,.03,'square'),
 crumb:()=>noise(0,.05,.025,1800,1.5),
 /** Ball actions (lib/konbini/konbiniBall.ts), original one-shots ≤ 0.2 s: a soft instep strike (louder with pace), a wall
  *  bounce, and a light keep-up tap that rises a little with the streak. Shelf hits use `thunk`. */
 kick:(speed=3)=>{const k=Math.min(1,speed/6);tone(150,0,.09,.06+.05*k,'sine');noise(0,.05,.04+.03*k,900,1.1);},
 bounce:(speed=2)=>{const k=Math.min(1,speed/6);tone(210,0,.07,.025+.04*k,'sine');noise(0,.03,.02+.02*k,1200,1.4);},
 touch:(streak=1)=>{tone(360+Math.min(12,streak)*14,0,.06,.045,'triangle');noise(0,.025,.025,1600,1.6);},
 /** The bite toy (lib/konbini/biteToy.ts), original synth: a soft jaw thump, then two crunchy noise snaps (≈0.15 s). */
 bite:()=>{tone(150,0,.07,.08,'sine');noise(.005,.05,.07,2600,1.4,1500);noise(.06,.07,.05,1900,1.2,1100);noise(.1,.04,.025,3200,2);},
 /** A sip: a small rising "gulp" bubble (two sine sweeps) with a wet noise tick (≈0.2 s). */
 sip:()=>{sweep(260,520,0,.1,.07);sweep(300,640,.1,.09,.05);noise(0,.04,.02,900,2);},
 /** All gone: a happy little two-note pop. */
 gone:()=>{tone(660,.14,.1,.05,'triangle');tone(990,.22,.16,.05,'triangle');},
 section:(poi:string)=>{switch(poi){
  case 'drinks':tone(70,0,.22,.1,'sine');noise(.02,.12,.03,500,1);tone(120,.1,.5,.015,'sine');break;// fridge door shunk + hum burst
  case 'hot':noise(0,.55,.04,5000,.6,3000);break;// steam hiss
  case 'magazines':for(let i=0;i<5;i++)noise(i*.045,.04,.035,2600+i*200,2);break;// page riffle
  case 'gear':tone(140,0,.12,.1,'sine');tone(140,.22,.08,.05,'sine');break;// ball thok-thok
  case 'counter':tone(1320,0,.08,.03,'triangle');break;
  default:noise(0,.18,.03,1400,1.2);// paper rustle
 }},
};
export function createKonbiniSound(){
 let muted=false;
 return {
  unlock(){unlockKonbiniAudio();},
  chime(){if(muted)return;konbiniSfx.chime();},
  /** Arriving through the doors: the chime now, or on the first tap if the page's audio is still locked. */
  arrive(){if(muted)return;konbiniSfx.arrive();},
  register(){if(muted)return;tone(1320,0,.12,.08,'square');tone(1760,.09,.18,.07,'triangle');},
  bite(){if(muted)return;for(let i=0;i<3;i++)tone(240+i*20,.35+i*.42,.07,.07,'triangle');},
  tick:konbiniTick,
  setMuted(v:boolean){muted=v;},
  dispose(){muted=true;},
 };
}
/** Test hook (scripts/check-konbini-sfx-browser.cjs): the cue table, so a muted browser run can spy on which cues fire and when. */
if(typeof window!=='undefined')(window as unknown as {__konbiniSfx?:typeof konbiniSfx}).__konbiniSfx=konbiniSfx;
