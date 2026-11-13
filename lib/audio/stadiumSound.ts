// DRIP FC Stadium soundscape (Nov 13 2026; owner: the stadium should "feel alive and rumbling", like a big European club ground).
// It follows the crowd's shared mood (lib/town/stadiumMood.ts: bpm, beat, chant, phase, excitement, wave, sinceGoal / sinceNearMiss),
// so what you hear is what the crowd shader shows. Everything is SYNTHESISED here (no recordings, nothing downloaded): a crowd of
// detuned sawtooth "voices" through vowel formant filters, noise-burst crowd claps and stomps, and a synthesised bass drum, each
// rendered by an OfflineAudioContext (native code, off the main thread) with the reverb baked in.
// Terrace shouts and reactions (owner, Nov 13 2026, after the first samples: "more oohs and chants, less singing"): eight of the ten
// chants are short shouted chants ("Drip-F-C!", "Hey!", "Let's go!", "Ol-é!", stand-to-stand calls) on claps and the drum; only the
// scarf song is sung, and briefly. The crowd REACTS to the match (reactions(): stadiumMood and the sim's touch ring): "ooh" + "aah"
// on a near miss, "ooh" on a shot or a save, the rising swell as an attack nears the box and a groan when it fizzles, applause for
// tackles, interceptions and long balls, whistles for a big challenge, and small ripples from a section every 3-14 s.
// Songs, not loops (owner, Nov 13 2026: "more detailed and like singing along, not repeating"): each chant is a
// SONG (SONGS: verse lines, chorus lines and a build, 2 bars a phrase). planSong() lays out one performance to fit the mood's chant
// phase: a lead section starts the line, the rest of the stadium swells in, verses and choruses alternate (each chorus ending in a
// build with a drum roll), with random orders, a harmony a third up, a percussion break where the singing drops out, the last
// chorus up a whole tone, and a fade-out. Every phrase is rendered fresh just before it is needed (own seed: new pitch spread,
// ±30 ms per section, new claps), so no phrase is ever heard twice; its reverb tail rings over the next one.
// The live graph is a small fixed pool: murmur (always near the stadium, low between matches) · roar (excitement) · sub rumble
// (inside the bowl, under the stands) · two song slots (crossfade on a chant change; up to 6 phrase sources, scheduled ~1 s ahead
// on the mood's bar lines) · the olé roll (follows the Mexican wave round the bowl, panned) · two one-shots (goal roar, "ooh").
// Distance: presence 1 inside the bowl, ~0.45 in the plaza, 0 past EDGE m; quantised with a dead band (no pumping at an edge) and
// ramped over ~2.4 s (setTargetAtTime, time constant TC). The island music fades by the same presence (islandMusic.setStadiumFade).
// Gating: nothing exists before the first gesture (the shared context does not exist yet), nothing plays while muted, at volume 0,
// idle-faded or hidden (host.ok()); the island sound's silence() / idle stop it (host.bind).
// Heat: Town calls update() each frame, but the work runs at 10 Hz (a distance, a few compares and a handful of param targets only
// when a value moved); the renders run once on approach (the beds) and one phrase every ~4-7 s while a song is on (one at a time,
// the next two ahead; a buffer is dropped once scheduled, ~0.2 MB each); after TEARDOWN s away everything is dropped. Lite (heat
// tier 2+, Battery saver): half the voices, no harmony or key change, no olé-roll layer, no positional panning.
// All chants, titles and words are original and kid-safe (tests/stadium-sound.cjs checks a list of real club songs and anthems).
import {STADIUM} from '../town/westParkLayout';
import {CHANTS,type ChantId,type StadiumMood} from '../town/stadiumMood';

export type StadiumSoundLink={active():boolean;stop(now?:boolean):void};
/** The island sound's side (createIslandSound().stadiumHost()): its context and effects bus, and its gates. */
export type StadiumSoundHost={ctx:()=>AudioContext|null;master:()=>AudioNode|null;
 /** the context runs and nothing silences effects (mute, volume 0, idle fade, hidden, disposed) */ok:()=>boolean;
 /** effects can be heard at all (not muted, volume above 0): the music only fades for the stadium when it is */sfxOn:()=>boolean;
 changed:()=>void;/** resume a context the idle timer suspended (never while idle-faded or hidden) */wake:()=>void;bind?:(s:StadiumSoundLink)=>void};
/** One frame's input (Town fills one object, no allocation). h = height above the ground (flight or a stand); rx/rz = the camera's
 *  right vector on the ground (pans); lite = heat tier 2+ or Battery saver. */
export type StadiumSoundFrame={x:number;z:number;h:number;rx:number;rz:number;lite:boolean;mood:Readonly<StadiumMood>|null;
 /** The stadium match's sim while awake (matchSim's touch ring: tackles, interceptions, saves, kicks, receptions), for the reactions. */
 sim?:StadiumTouches|null};
export type StadiumTouches={readonly touches:readonly {readonly serial:number;readonly kind:string;readonly team:string;readonly height:number;readonly other:string|null}[];readonly touchSerial:number};

/** Distances are metres outside the bowl's footprint (0 inside it). */
export const STADIUM_SOUND={fullD:3,plazaD:30,edgeD:110,plazaLevel:.5,roofH:28,deadband:.08,quantum:.05,tc:.8,tick:.1,stopAfter:4,
 teardown:30,chantFade:2,chantIn:1.2,rate:22050,goalHold:3,tail:1.8} as const;
/** Live mix (before the island effects bus). */
export const STADIUM_MIX={out:1,murmur:.2,roar:.3,rumble:.35,chant:.75,wave:.2,goal:.75,react:.42,lite:.85} as const;

export type ChantKind='clap'|'ole'|'scarf'|'drum'|'call'|'stomp'|'shout';
/** The mood's chant ids, as heard. Titles and words are the stadium's own (original, kid-safe). */
export const STADIUM_CHANTS:Readonly<Record<ChantId,{title:string;kind:ChantKind;words:string}>>={
 'drip-drip-clap':{title:'Drip-F-C Clap',kind:'clap',words:'Drip-F-C! (clap clap clap) Hey! Hey!'},
 'lets-go':{title:'Let\'s Go Drip',kind:'shout',words:'Let\'s go! (clap clap) Let\'s go, Drip!'},
 'island-anthem':{title:'Scarves Up Over the Island',kind:'scarf',words:'Ohh, oh-oh-ah, ohhh (the one sung tune, a slow sway with scarves up)'},
 'hey-hey-hey':{title:'Hey Hey Hey',kind:'shout',words:'Hey! Hey! Hey! (stomp) Hey-hey-hey, Drip!'},
 'here-we-go':{title:'Drip-FC Call and Answer',kind:'call',words:'West stand: Drip-F-C! East stand: Drip-F-C!'},
 'ole-ole':{title:'Shouted Olé',kind:'ole',words:'Ol-é! Ol-é! (clap) Hey!'},
 'clap-clap-shout':{title:'Clap Clap Shout',kind:'shout',words:'(clap clap) Drip! (clap clap) Hey!'},
 'stand-up-song':{title:'Stomp Round the Bowl',kind:'stomp',words:'(stomps rolling round the stands) Hey! Drip!'},
 'stand-to-stand':{title:'Stand to Stand',kind:'call',words:'West: Hey! East: Ho! West: Drip! East: F-C!'},
 'drum-march':{title:'Big Drum March',kind:'drum',words:'(the supporters\' drum) Oh! Hey! Oh! Hey!'},
};

// ---- distance → presence (pure; tests) ----
const smooth=(t:number)=>{const k=Math.max(0,Math.min(1,t));return k*k*(3-2*k);};
/** Metres outside the bowl's footprint, with height above the roof counted (flying over it). */
export function bowlDistance(x:number,z:number,h=0){const dx=Math.max(0,Math.abs(x-STADIUM.x)-STADIUM.bowlW/2),dz=Math.max(0,Math.abs(z-STADIUM.z)-STADIUM.bowlL/2);
 return Math.hypot(dx,dz,Math.max(0,h-STADIUM_SOUND.roofH));}
/** The raw presence at distance d: 1 in the bowl, easing to plazaLevel at plazaD, to 0 at edgeD. */
export function presenceAt(d:number){const S=STADIUM_SOUND;if(!(d>S.fullD))return 1;if(d>=S.edgeD)return 0;
 if(d<=S.plazaD)return 1-(1-S.plazaLevel)*smooth((d-S.fullD)/(S.plazaD-S.fullD));return S.plazaLevel*(1-smooth((d-S.plazaD)/(S.edgeD-S.plazaD)));}
/** Hysteresis: the held level moves only when the raw one is a dead band away (then to the nearest quantum); the ends snap. */
export function presenceStep(prev:number,raw:number){const S=STADIUM_SOUND;if(raw>=1)return 1;if(raw<=0)return 0;
 return Math.abs(raw-prev)>=S.deadband?Math.min(.95,Math.max(S.quantum,Math.round(raw/S.quantum)/Math.round(1/S.quantum))):prev;}
/** The rumble's place factor: under the stands / in the concourse 1, up in the seats .85, on the pitch .7, outside by presence. */
export function rumbleZone(x:number,z:number,h:number,presence:number){
 if(bowlDistance(x,z,0)>0)return presence*.45;const onPitch=Math.abs(x-STADIUM.x)<STADIUM.pitchW/2+6&&Math.abs(z-STADIUM.z)<STADIUM.pitchL/2+6;
 return onPitch?.7:h<3?1:.85;}
/** What the chant slots should play: the mood's chant while a match is awake, else nothing. */
export const chantFor=(m:Readonly<StadiumMood>|null):ChantId|null=>m&&m.live?m.chant:null;
/** Seconds from now to the next bar line of the mood's beat clock (4 beats a bar; at least `lead` s ahead). */
export function nextBarIn(beat:number,bpm:number,lead=.05){const spb=60/Math.max(30,bpm),need=beat+lead/spb,bar=Math.ceil(need/4-1e-9)*4;return (bar-beat)*spb;}

// ---- goal feel: the camera shake and the buzz (Town) ----
export const SHAKE={time:1.1,amp:.14,hx:23,hy:31} as const;
/** A short, subtle camera shake on a goal near the stadium; never under reduced motion or while flying. apply() after the camera is
 *  placed, restore() before the next placement (the follow camera never keeps the offset). */
export function createStadiumShake(){
 let left=0,age=0,k=1;const off={x:0,y:0,z:0};
 return {
  trigger(o:{reduced:boolean;flying:boolean;presence:number}){if(o.reduced||o.flying||o.presence<.5)return false;left=SHAKE.time;age=0;k=o.presence;return true;},
  apply(cam:{position:{x:number;y:number;z:number}},dt:number,o:{reduced:boolean;flying:boolean}){
   if(left<=0)return;if(o.reduced||o.flying){left=0;return;}left-=dt;age+=dt;const e=Math.max(0,left/SHAKE.time),a=SHAKE.amp*k*e*e;
   off.x=a*Math.sin(age*Math.PI*2*SHAKE.hx);off.y=a*.6*Math.sin(age*Math.PI*2*SHAKE.hy+1.3);off.z=a*Math.sin(age*Math.PI*2*SHAKE.hy*.8+.4);
   cam.position.x+=off.x;cam.position.y+=off.y;cam.position.z+=off.z;},
  restore(cam:{position:{x:number;y:number;z:number}}){if(!off.x&&!off.y&&!off.z)return;cam.position.x-=off.x;cam.position.y-=off.y;cam.position.z-=off.z;off.x=off.y=off.z=0;},
  get active(){return left>0;},
 };
}
/** A short buzz on a goal where the browser supports it (iOS has no navigator.vibrate: a no-op). Never under reduced motion or
 *  before the page had a user gesture (Chrome refuses and warns). */
export function goalBuzz(nav:Navigator|undefined,reduced:boolean){
 if(reduced||!nav)return false;try{const v=(nav as Navigator&{vibrate?:(p:number[])=>boolean}).vibrate;if(typeof v!=='function')return false;
  const ua=(nav as Navigator&{userActivation?:{hasBeenActive:boolean}}).userActivation;if(ua&&!ua.hasBeenActive)return false;return v.call(nav,[35,40,70])!==false;}catch{return false;}
}

// ---- the renders (OfflineAudioContext) ----
type Ctx=BaseAudioContext;
type Rnd=()=>number;
type OfflineCtor=new (channels:number,length:number,rate:number)=>OfflineAudioContext;
const offlineCtor=():OfflineCtor|null=>{const g=globalThis as unknown as {OfflineAudioContext?:OfflineCtor;webkitOfflineAudioContext?:OfflineCtor};return g.OfflineAudioContext??g.webkitOfflineAudioContext??null;};
/** The soundscape needs OfflineAudioContext (every current browser); without it Town keeps the old single crowd loop. */
export const stadiumSoundSupported=()=>!!offlineCtor();
const lcg=(s:number):Rnd=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
const midiHz=(m:number)=>440*Math.pow(2,(m-69)/12);
type Vowel='a'|'e'|'i'|'o'|'u'|'ih';
const FORMANTS:Readonly<Record<Vowel,readonly [number,number,number]>>={a:[730,1090,2440],e:[530,1840,2480],i:[300,2250,3000],o:[500,850,2400],u:[330,800,2240],ih:[400,1950,2550]};
const VOWELS:readonly Vowel[]=['a','e','i','o','u','ih'];
const FORM_GAIN=[1,.6,.3],FORM_Q=[5,8,11],BREATH=.09;
type Cons='d'|'f'|'s'|'h'|'l';
/** A consonant: a noise burst (band centre Hz, Q, level, decay s) just before the vowel. */
const CONS:Readonly<Record<Cons,readonly [number,number,number,number]>>={d:[520,.9,.55,.014],f:[4600,1.1,.35,.05],s:[6200,1.4,.5,.07],h:[1700,.6,.4,.05],l:[900,2,.15,.02]};
/** [beat, beats, semitones over the tonic, vowel, consonant, shout (a falling yell)] */
type Note=readonly [number,number,number,Vowel,(Cons|0)?,(1|0)?];
export type Rendered={buffer:AudioBuffer;loopEnd:number};

/** The white noise and the impulses are made once and shared by every render (an AudioBuffer is not tied to its context). */
const shared=new Map<string,AudioBuffer>();
function noiseBuffer(c:Ctx,rnd:Rnd){const id='n'+c.sampleRate,have=shared.get(id);if(have)return have;const b=noiseBufferNew(c,rnd);shared.set(id,b);return b;}
function noiseBufferNew(c:Ctx,rnd:Rnd){const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=rnd()*2-1;return b;}
/** A stadium-ish impulse: dark exponential tail (RT60 ~2 s) with a few slap echoes off the stands. */
function impulse(c:Ctx,ch:number,rnd:Rnd){const id='i'+ch+':'+c.sampleRate,have=shared.get(id);if(have)return have;const b=impulseNew(c,ch,rnd);shared.set(id,b);return b;}
function impulseNew(c:Ctx,ch:number,rnd:Rnd){const r=c.sampleRate,n=Math.round(1.7*r),b=c.createBuffer(ch,n,r);
 for(let k=0;k<ch;k++){const d=b.getChannelData(k);let y=0;for(let i=0;i<n;i++){const t=i/r,w=(rnd()*2-1)*Math.exp(-t/.33);y+=(w-y)*(.8-.6*Math.min(1,t/1.4));d[i]=y;}
  for(const [ms,a] of [[23+k*7,.5],[88+k*11,.4],[151+k*9,.28],[236+k*13,.16]] as const){const j=Math.round(ms/1000*r);if(j<n)d[j]+=k%2?-a:a;}}
 return b;}
type Sink=(n:AudioNode)=>void;
/** A bus into `sink`: low-pass (distance), dry + baked reverb. */
function bus(c:Ctx,sink:Sink,ir:AudioBuffer,wet:number,lp:number){
 const i=c.createGain(),f=c.createBiquadFilter(),dry=c.createGain(),v=c.createConvolver(),w=c.createGain();f.type='lowpass';f.frequency.value=lp;f.Q.value=.5;
 dry.gain.value=1-wet*.5;v.buffer=ir;w.gain.value=wet;i.connect(f);f.connect(dry);sink(dry);f.connect(v);v.connect(w);sink(w);return i;}
function panned(c:Ctx,dest:AudioNode,pan:number):AudioNode{if(!pan||typeof c.createStereoPanner!=='function')return dest;const p=c.createStereoPanner();p.pan.value=pan;p.connect(dest);return p;}
type Group={osc:OscillatorNode[];vg:GainNode[];base:number[];f:BiquadFilterNode[];cg:GainNode;cf:BiquadFilterNode;bg:GainNode;fs:number};
/** A section of the crowd: n sawtooth voices (own detune, one shared vibrato) → three formant band-passes → one out; a noise lane for consonants / breath. */
function group(c:Ctx,dest:AudioNode,noise:AudioBuffer,n:number,o:{pan:number;fs:number;level:number;vib:number;rnd:Rnd}):Group{
 const out=c.createGain();out.gain.value=o.level;out.connect(panned(c,dest,o.pan));
 const fin=c.createGain(),f:BiquadFilterNode[]=[];
 for(let k=0;k<3;k++){const bp=c.createBiquadFilter(),fg=c.createGain();bp.type='bandpass';bp.Q.value=FORM_Q[k];bp.frequency.value=FORMANTS.a[k]*o.fs;fg.gain.value=FORM_GAIN[k]*(1+k*.6);fin.connect(bp);bp.connect(fg);fg.connect(out);f.push(bp);}
 const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=4.4+o.rnd()*1.6;lg.gain.value=o.vib;lfo.connect(lg);lfo.start(0);
 const osc:OscillatorNode[]=[],vg:GainNode[]=[],base:number[]=[];
 for(let i=0;i<n;i++){const s=c.createOscillator(),g=c.createGain();s.type='sawtooth';s.detune.value=(o.rnd()-.5)*90;lg.connect(s.detune);g.gain.value=0;s.connect(g);g.connect(fin);s.start(0);osc.push(s);vg.push(g);base.push(0);}
 const src=c.createBufferSource(),cf=c.createBiquadFilter(),cg=c.createGain();src.buffer=noise;src.loop=true;cf.type='bandpass';cf.frequency.value=1200;cg.gain.value=0;src.connect(cf);cf.connect(cg);cg.connect(out);src.start(0,o.rnd());
 // Breath: noise through the same vowel filters while the section sings (a crowd is half voice, half shout).
 const br=c.createBufferSource(),bg=c.createGain();br.buffer=noise;br.loop=true;bg.gain.value=0;br.connect(bg);bg.connect(fin);br.start(0,o.rnd());
 return {osc,vg,base,f,cg,cf,bg,fs:o.fs};
}
function vowelAt(g:Group,v:Vowel,t:number,tc:number){const F=FORMANTS[v];for(let k=0;k<3;k++)g.f[k].frequency.setTargetAtTime(F[k]*g.fs,Math.max(0,t),tc);}
function consonant(g:Group,k:Cons,t:number,level=1){const [hz,q,a,d]=CONS[k],s=Math.max(0,t);g.cf.frequency.setValueAtTime(hz,s);g.cf.Q.setValueAtTime(q,s);g.cg.gain.setValueAtTime(0,s);g.cg.gain.linearRampToValueAtTime(a*level,s+.006);g.cg.gain.setTargetAtTime(0,s+.008,d);}
/** Sing notes (one loop, from t0): each voice a touch early or late, a small scoop up into the pitch; shouts fall away. */
function sing(g:Group,notes:readonly Note[],o:{t0:number;spb:number;tonic:number;octs:readonly number[];slow:boolean;rnd:Rnd;join?:number}){
 const jit=o.slow?.05:.022;
 for(const [b,d,semi,v,cons,shout] of notes){const ts=o.t0+b*o.spb,te=ts+d*o.spb*(o.slow?.96:.86);
  vowelAt(g,v,ts-.01,o.slow?.06:.025);if(cons)consonant(g,cons,ts-.016,shout?1.3:1);
  const br=(shout?2.6:o.slow?.5:.8)*BREATH*g.osc.length;g.bg.gain.setTargetAtTime(br,Math.max(0,ts),.02);g.bg.gain.setTargetAtTime(0,Math.max(0,ts+.05,te),o.slow?.12:.05);
  for(let i=0;i<g.osc.length;i++){const j=(o.rnd()-.5)*2*jit,a=Math.max(0,ts+j),e=Math.max(a+.05,te+j*.5),hz=midiHz(o.tonic+semi+12*o.octs[i%o.octs.length]+(shout?(o.rnd()-.5)*3:0))*(1+(o.rnd()-.5)*.014),p=g.osc[i].frequency,gg=g.vg[i].gain;
   p.setValueAtTime(hz*(shout?1.07:.965),a);p.setTargetAtTime(shout?hz*.8:hz,a,shout?.09:.03);
   const sw=o.join?Math.min(1,.12+.88*Math.max(0,a-o.t0)/o.join):1;gg.setTargetAtTime((shout?1:.8+.2*o.rnd())*sw,a,o.slow?.07:.012);gg.setTargetAtTime(0,e,o.slow?.12:.045);}}
}
/** Crowd claps / stomps: noise lanes (band-pass for claps, low-pass for stomps), each event a flutter of micro-onsets (many hands). */
type Lane={g:GainNode;p:StereoPannerNode|null};
function lanes(c:Ctx,dest:AudioNode,noise:AudioBuffer,pans:readonly number[],o:{type:BiquadFilterType;hz:number;q:number;rnd:Rnd;pan?:boolean}):Lane[]{
 return pans.map(pan=>{const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise;s.loop=true;f.type=o.type;f.frequency.value=o.hz;f.Q.value=o.q;g.gain.value=0;s.connect(f);f.connect(g);
  let p:StereoPannerNode|null=null;if((o.pan||pan)&&typeof c.createStereoPanner==='function'){p=c.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(dest);}else g.connect(dest);s.start(0,o.rnd());return {g,p};});}
function flutter(l:Lane,t:number,o:{n:number;spread:number;amp:number;decay:number;rnd:Rnd}){
 let at=Math.max(0,t);for(let m=0;m<o.n;m++){at+=.003+o.rnd()*o.spread/o.n;l.g.gain.setValueAtTime(o.amp*(.45+.55*o.rnd()),at);l.g.gain.setTargetAtTime(0,at+.0015,o.decay);}}
type Drum={osc:OscillatorNode;g:GainNode;click:Lane};
function drum(c:Ctx,dest:AudioNode,noise:AudioBuffer,rnd:Rnd):Drum{const osc=c.createOscillator(),g=c.createGain();osc.type='sine';osc.frequency.value=60;g.gain.value=0;osc.connect(g);g.connect(panned(c,dest,-.2));osc.start(0);
 return {osc,g,click:lanes(c,dest,noise,[-.2],{type:'bandpass',hz:1900,q:.8,rnd})[0]};}
function hit(d:Drum,t:number,amp:number){const s=Math.max(0,t);d.osc.frequency.setValueAtTime(118,s);d.osc.frequency.exponentialRampToValueAtTime(46,s+.14);
 d.g.gain.setValueAtTime(0,s);d.g.gain.linearRampToValueAtTime(amp,s+.004);d.g.gain.setTargetAtTime(0,s+.02,.17);d.click.g.gain.setValueAtTime(amp*.3,s);d.click.g.gain.setTargetAtTime(0,s+.002,.009);}
/** Post: wrap the tail [L, end) onto the start (a seamless loop with the reverb ringing across the seam), then peak-normalise. */
function finish(b:AudioBuffer,loop:number,fade=0,peak=.9):Rendered{
 const L=Math.min(b.length,Math.round(loop*b.sampleRate));let top=0;
 for(let k=0;k<b.numberOfChannels;k++){const d=b.getChannelData(k),T=b.length-L;
  if(loop>0&&T>0){if(fade>0){const F=Math.min(T,L,Math.round(fade*b.sampleRate));for(let i=0;i<F;i++){const w=i/F;d[i]=d[i]*Math.sqrt(w)+d[L+i]*Math.sqrt(1-w);}}
   else for(let i=0;i<T&&i<L;i++)d[i]+=d[L+i];}
  const n=loop>0?L:b.length;for(let i=0;i<n;i++){const a=Math.abs(d[i]);if(a>top)top=a;}}
 if(peak<0||top>0&&peak>0){const s=peak<0?-peak:peak/top;for(let k=0;k<b.numberOfChannels;k++){const d=b.getChannelData(k);for(let i=0;i<d.length;i++)d[i]*=s;}}
 return {buffer:b,loopEnd:loop>0?L/b.sampleRate:b.length/b.sampleRate};
}
/** Group voicings: octave per group, formant scale (lower men's, higher kids'), level, pan. */
const VOICING=[{oct:-1,fs:.9,level:1,pan:-.55},{oct:0,fs:1.04,level:.95,pan:.35},{oct:0,fs:1,level:.9,pan:-.2},{oct:1,fs:1.16,level:.5,pan:.6}] as const;

/** Percussion for one phrase (beats 0..8): crowd claps (west / east for the call song), the supporters' drum, stomps, a drum roll into the next phrase. */
type Perc={claps?:readonly number[];claps2?:readonly number[];drum?:readonly number[];stomps?:readonly number[];roll?:boolean};
/** One song: tonic (MIDI) and scale, five 2-bar phrases (verse lines v1 / v2, chorus lines c1 / c2, the build b at the end of a
 *  chorus); the call song's verses are the west stand's call (v1 / v2) and the east stand's answer (e1 / e2). */
type Song={tonic:number;minor?:boolean;slow?:boolean;sweep?:boolean;call?:boolean;/** a sung tune (kept short) */sung?:boolean;v1:readonly Note[];v2:readonly Note[];e1?:readonly Note[];e2?:readonly Note[];
 c1:readonly Note[];c2:readonly Note[];b:readonly Note[];perc:{verse:Perc;chorus:Perc;build:Perc}};
// Terrace shouts (owner, Nov 13 2026: "more oohs and chants, less singing"): short, punchy, near-unpitched shouts (the sing()
// shout flag: each voice off by up to ±1.5 semitones, mostly breath, falling away) locked to claps and the drum.
type Shout=(b:number,p?:number)=>Note[];
const DFC:Shout=(b,p=7)=>[[b,.25,p,'ih','d',1],[b+.5,.25,p,'e','f',1],[b+1,.45,p-3,'i','s',1]];// "Drip-F-C!"
const HEY:Shout=(b,p=7)=>[[b,.3,p,'e','h',1]];// "Hey!"
const HO:Shout=(b,p=4)=>[[b,.3,p,'o','h',1]];// "Ho!"
const DRIP:Shout=(b,p=7)=>[[b,.3,p,'ih','d',1]];// "Drip!"
const LG:Shout=(b,p=7)=>[[b,.22,p,'e','l',1],[b+.5,.4,p-5,'o','d',1]];// "Let's go!"
const OLE:Shout=(b,p=0)=>[[b,.3,p,'o',0,1],[b+.5,.45,p+4,'e','l',1]];// "Ol-é!"
const OH:Shout=(b,p=0)=>[[b,.45,p,'o',0,1]];// "Oh!"
const at=(...parts:Note[][]):readonly Note[]=>parts.flat();
const EVERY=(from:number,to:number,step:number)=>{const r:number[]=[];for(let b=from;b<to-1e-9;b+=step)r.push(b);return r;};
/** The ten songs (original, kid-safe). Only the scarf song is sung (and kept short); the rest are terrace shouts. A phrase is 8 beats. */
export const SONGS:Readonly<Record<ChantId,Song>>={
 // "Drip-F-C!" (clap clap clap), "Hey! Hey!"
 'drip-drip-clap':{tonic:62,v1:at(DFC(0),DFC(4)),v2:at(HEY(0),HEY(1),DFC(4)),c1:at(DFC(0),DFC(2,9),DFC(4),DFC(6,9)),c2:at(DFC(0),HEY(2,9),DFC(4,9),HEY(6,11)),
  b:at(DFC(0),DFC(2,9),DFC(4,11),HEY(6,12)),
  perc:{verse:{claps:[2,2.5,3,6,6.5,7],drum:[0,4]},chorus:{claps:[1.5,3.5,5.5,7.5],stomps:[0,2,4,6],drum:[0,2,4,6]},build:{claps:EVERY(0,6,.5),drum:[0,2,4],roll:true}}},
 // "Let's go!" (clap clap), "Let's go, Drip!"
 'lets-go':{tonic:60,v1:at(LG(0),LG(2),LG(4),DRIP(6)),v2:at(LG(0),DFC(2),LG(4),DFC(6)),c1:at(LG(0),LG(2,9),LG(4,11),LG(6,12)),c2:at(LG(0),DRIP(1),LG(4,9),DRIP(5,9)),
  b:at(LG(0),LG(1,9),LG(2,11),LG(3,12),HEY(6,14)),
  perc:{verse:{claps:[1,1.5,3,3.5,5,5.5],drum:[0,2,4,6]},chorus:{claps:[1,1.5,3,3.5,5,5.5,7,7.5],drum:[0,2,4,6]},build:{claps:EVERY(0,6,.5),drum:[0,1,2,3,4,5],roll:true}}},
 // The slow scarf song: the one sung tune, a legato sway in C (kept short: planSong caps it, then drums and claps carry on).
 'island-anthem':{tonic:60,slow:true,sung:true,
  v1:[[0,2,0,'o'],[2,1,4,'o'],[3,1,2,'a'],[4,3,7,'o'],[7,1,5,'a']],
  v2:[[0,2,4,'o'],[2,1,5,'o'],[3,1,4,'a'],[4,2,2,'o'],[6,2,0,'o']],
  c1:[[0,1.5,9,'a'],[1.5,.5,7,'o'],[2,2,5,'a'],[4,1.5,7,'o'],[5.5,.5,5,'a'],[6,2,4,'o']],
  c2:[[0,1.5,9,'a'],[1.5,.5,7,'o'],[2,2,5,'a'],[4,1,4,'o'],[5,1,2,'a'],[6,2,0,'o']],
  b:[[0,2,7,'o'],[2,2,9,'a'],[4,2,11,'a'],[6,2,12,'o']],
  perc:{verse:{drum:[0,4]},chorus:{drum:[0,4],claps:[2,6]},build:{drum:[0,2,4,6],claps:[1,3,5,7]}}},
 // "Hey! Hey! Hey!" (stomp), "Hey-hey-hey, Drip!"
 'hey-hey-hey':{tonic:62,v1:at(HEY(0),HEY(1),HEY(2),HEY(4,9),HEY(5,9),HEY(6,9)),v2:at(HEY(0),HEY(1),HEY(2),DRIP(3),HEY(4,9),HEY(5,9),HEY(6,9),DRIP(7,9)),
  c1:at(HEY(0,9),HEY(2,9),HEY(4,11),HEY(6,11)),c2:at(HEY(0),HEY(1,9),HEY(2,11),HEY(3,12),HEY(4),HEY(5,9),HEY(6,11),HEY(7,12)),b:at(...EVERY(0,6,.5).map((x,i)=>HEY(x,7+i/2)),HEY(6,14)),
  perc:{verse:{claps:[3,7],stomps:[0,4],drum:[0,4]},chorus:{claps:[1.5,3.5,5.5,7.5],stomps:[0,2,4,6],drum:[0,2,4,6]},build:{claps:EVERY(0,6,.5),drum:[0,2,4],roll:true}}},
 // Call and answer: the west stand calls "Drip-F-C!", the east stand answers; the chorus is both stands shouting together.
 'here-we-go':{tonic:62,call:true,v1:DFC(0),e1:DFC(4,4),v2:at(DFC(0,9),HEY(3)),e2:at(DFC(4,7),HEY(7)),
  c1:at(DFC(0),HEY(2),DFC(4,9),HEY(6,9)),c2:at(DFC(0,9),DFC(2,9),DFC(4,11),HEY(6,12)),b:at(DFC(0),DFC(2,9),DFC(4,11),HEY(6,12)),
  perc:{verse:{drum:[0,4],claps:[2,2.5,3],claps2:[6,6.5,7]},chorus:{drum:[0,2,4,6],claps:[1.5,3.5,5.5,7.5]},build:{drum:[0,1,2,3,4,5],claps:EVERY(0,6,.5),roll:true}}},
 // "Ol-é! Ol-é!": shouted, rising, claps between; the olé-roll layer follows the Mexican wave itself.
 'ole-ole':{tonic:62,v1:at(OLE(0),OLE(2),OLE(4),OLE(6,2)),v2:at(OLE(0),OLE(2,2),HEY(4,9),OLE(6,4)),c1:at(OLE(0),OLE(1),OLE(2,2),OLE(4,4),OLE(5,4),OLE(6,5)),
  c2:at(OLE(0,2),OLE(2,4),OLE(4,5),HEY(6,12)),b:at(OLE(0),OLE(1,2),OLE(2,4),OLE(3,5),OLE(4,7),OLE(6,7)),
  perc:{verse:{claps:[1.5,3.5,5.5,7.5],drum:[0,4]},chorus:{claps:[3,3.5,7,7.5],drum:[0,2,4,6]},build:{drum:[0,1,2,3,4,5],claps:EVERY(0,6,.5),roll:true}}},
 // Clap-clap-shout: two claps, a shout, round and round.
 'clap-clap-shout':{tonic:60,v1:at(DRIP(1),HEY(3),DRIP(5),HEY(7)),v2:at(DRIP(1),OLE(2.5,2),DRIP(5),HEY(7,9)),c1:at(HEY(1.5),HEY(3.5,9),HEY(5.5),DRIP(7.5,9)),
  c2:at(DFC(1),DFC(5,9)),b:at(...EVERY(0,6,1).map((x,i)=>DRIP(x,7+i)),HEY(6,14)),
  perc:{verse:{claps:[0,.5,2,2.5,4,4.5,6,6.5],drum:[0,4]},chorus:{claps:[0,.5,1,2,2.5,3,4,4.5,5,6,6.5,7],drum:[0,2,4,6]},build:{claps:EVERY(0,6,.5),drum:[0,2,4],roll:true}}},
 // Stomp round the bowl (slow): stamping travels round the stands, "Hey!" and "Drip!" answer it.
 'stand-up-song':{tonic:60,minor:true,slow:true,sweep:true,v1:at(HEY(3),HEY(7)),v2:at(HEY(1),HEY(3),HEY(5),HEY(7,10)),c1:at(DRIP(0),HEY(2),DRIP(4),HEY(6)),
  c2:at(DRIP(0,10),HEY(2,10),DRIP(4,12),HEY(6,12)),b:at(HEY(0),HEY(1,8),HEY(2,10),HEY(3,12),OH(4,12),HEY(6,15)),
  perc:{verse:{stomps:EVERY(0,8,1)},chorus:{stomps:EVERY(0,8,.5),claps:[1,3,5,7]},build:{stomps:EVERY(0,8,.5),claps:EVERY(.5,8,1),drum:[0,2,4,6],roll:true}}},
 // Stand to stand: the west shouts "Hey!", the east "Ho!"; then "Drip!" / "F-C!" across the pitch; together for the chorus.
 'stand-to-stand':{tonic:62,call:true,v1:at(HEY(0),HEY(2),DRIP(4,9)),e1:at(HO(1),HO(3),HEY(6,4)),v2:at(HEY(0,9),HEY(1,9),HEY(4)),e2:at(HO(2),HO(3),HO(5,7),DRIP(6)),
  c1:at(HEY(0),HO(1),HEY(2,9),HO(3,7),DFC(4,9),HEY(7,9)),c2:at(HEY(0,9),HO(1,9),HEY(2,11),HO(3,9),DFC(4,11),HEY(7,12)),b:at(...EVERY(0,6,.5).map((x,i)=>i%2?HO(x,4+i/2):HEY(x,7+i/2)),HEY(6,14)),
  perc:{verse:{drum:[0,4],claps:[1.5,3.5],claps2:[5.5,7.5]},chorus:{drum:[0,2,4,6],claps:[1.5,3.5,5.5,7.5]},build:{drum:[0,1,2,3,4,5],claps:EVERY(0,6,.5),roll:true}}},
 // The supporters' drum leads; the crowd answers "Oh!" and "Hey!" (A minor).
 'drum-march':{tonic:57,minor:true,v1:at(OH(0),HEY(2,7),OH(3,3),OH(4,7),HEY(6,7)),v2:at(OH(0,3),HEY(2,10),OH(3,7),OH(4,3),HEY(6,7)),
  c1:at(OH(0,7),OH(.5,7),HEY(1,10),OH(2,7),HEY(3,12),OH(4,5),OH(4.5,5),HEY(5,8),OH(6,7),HEY(7,12)),c2:at(OH(0,7),OH(.5,7),HEY(1,10),OH(2,7),HEY(3,12),OH(4,3),OH(4.5,2),HEY(5,3),OH(6,0),HEY(7,7)),
  b:at(HEY(0,7),HEY(1,7),HEY(2,8),HEY(3,8),HEY(4,10),HEY(5,10),HEY(6,12)),
  perc:{verse:{drum:[0,1,2,2.5,3,4,5,6,6.5,7]},chorus:{drum:[0,1,2,2.5,3,4,5,6,6.5,7],claps:[1.5,5.5]},build:{drum:EVERY(0,6,.5),roll:true}}},
};
/** The phrase kinds a song is built from: the lead line, the crowd joining in, verse lines, a percussion break (the singing drops
 *  out), chorus lines, the chorus with a harmony a third up, the build, the last chorus up a whole tone (k), the fading outro. */
export type PhraseKey='lead'|'v1j'|'v1'|'v2'|'perc'|'c1'|'c2'|'c1h'|'b'|'c1k'|'c2k'|'bk'|'c2f';
export const PHRASE_BEATS=8;
/** Phrases keep their own dynamics (a lead section is quieter than the whole stadium, the outro fades): one fixed scale, no normalising. */
const PHRASE_GAIN=.25;
/** A performance: the lead starts, the stadium joins, then verses and choruses (each chorus ending in a build) alternate, with
 *  random orders, harmonies and drop-outs, and the last chorus goes up a key before the crowd fades out. Fits `seconds`. */
export function planSong(id:ChantId,seconds:number,rnd:Rnd=Math.random,lite=false,fresh=true):PhraseKey[]{
 const bpm=CHANTS.find(ch=>ch.id===id)?.bpm??100,len=PHRASE_BEATS*60/bpm;let N=Math.max(3,Math.floor(seconds/len));
 // The sung tune stays short (owner: singing a minority): four phrases, then drums and claps only.
 if(SONGS[id].sung){if(!fresh)return Array<PhraseKey>(Math.min(N,4)).fill('perc');N=Math.min(N,4);return (['lead','v1j','c1','c2f'] as PhraseKey[]).slice(0,N);}
 // Short performances (slow songs, short phases) follow a fixed form with random lines; long ones alternate blocks.
 if(fresh&&N<11){const C=():PhraseKey=>rnd()<.5?'c2':'c1h',V=():PhraseKey=>rnd()<.6?(rnd()<.5?'v1':'v2'):'perc';
  const forms:Record<number,PhraseKey[]>={5:['lead','v1j','c1','b','c2f'],6:['lead','v1j','v2','c1','b','c2f'],7:['lead','v1j','v2','c1','c2','b','c2f'],8:['lead','v1j','v2','c1','c1h','c2','b','c2f'],
   9:['lead','v1j','v2','c1',C(),'b',V(),'c1h','c2f'],10:['lead','v1j','v2','c1',C(),'b',V(),'v2','c1h','c2f']};
  return forms[Math.max(5,N)]?.slice(0,N)??forms[5].slice(0,N);}
 const end:PhraseKey[]=N>=11&&!lite?['c1k','c2k','bk','c2f']:['c1','b','c2f'];
 const seq:PhraseKey[]=fresh?['lead','v1j','v2']:[rnd()<.5?'v1':'perc'];let chorus=true;
 while(seq.length+end.length<N){const room=N-end.length-seq.length,r=rnd();
  const verse:PhraseKey[]=r<.35?['v1','v2']:r<.7?['v2','v1']:['v1','perc'],block:PhraseKey[]=chorus&&room>=4?(rnd()<.5?['c1','c2','c1h','b']:['c1','c1h','c2','b']):verse;
  for(const k of block)if(seq.length+end.length<N)seq.push(k);chorus=!chorus;}
 return seq.concat(end).slice(0,N);
}
const MAJOR=[0,2,4,5,7,9,11],MINOR=[0,2,3,5,7,8,10];
/** The diatonic third above a scale note (the harmony line). */
export function thirdAbove(semi:number,minor=false){const sc=minor?MINOR:MAJOR,o=Math.floor(semi/12),r=((semi%12)+12)%12;let i=sc.indexOf(r);if(i<0)i=sc.findIndex(v=>v>r)-1;if(i<0)i=0;
 const j=i+2;return o*12+(j>=7?12+sc[j-7]:sc[j]);}
/** One phrase of a song, rendered once (mono, 8 beats + reverb tail; the tail rings over the next phrase). side: 0 west, 1 east,
 *  2 everyone. A fresh seed per render: no two phrases are identical. */
export function renderPhrase(id:ChantId,key:PhraseKey,side:0|1|2,lite=false,seed=1):Promise<Rendered>|null{
 const O=offlineCtor();if(!O)return null;const s=SONGS[id],bpm=CHANTS.find(ch=>ch.id===id)?.bpm??100,spb=60/bpm,L=PHRASE_BEATS*spb,R=STADIUM_SOUND.rate;
 const c=new O(1,Math.ceil((L+STADIUM_SOUND.tail)*R),R),rnd=lcg(seed*7919+id.length*131+key.length*17+side),noise=noiseBuffer(c,rnd),slow=!!s.slow;
 const verse=key==='lead'||key==='v1j'||key==='v1'||key==='v2',two=key==='v2'||key==='c2'||key==='c2k'||key==='c2f',build=key==='b'||key==='bk',up=key.endsWith('k')?2:0;
 const notes:readonly Note[]=key==='perc'?[]:verse?(side===1?(two?s.e2:s.e1)??[]:two?s.v2:s.v1):build?s.b:two?s.c2:s.c1;
 const harmony=!lite&&(key==='c1h'||up>0||build),lead=key==='lead';
 const out=c.createGain();out.connect(c.destination);if(key==='c2f'){out.gain.setValueAtTime(1,4*spb);out.gain.linearRampToValueAtTime(0,L+.6);}
 const mix=bus(c,x=>x.connect(out),impulse(c,1,rnd),lead?.28:slow?.5:.4,slow?4200:5200);
 const G=lead?1:lite?2:4,n=lead?5:lite?3:4;
 for(let gi=0;gi<G+(harmony?1:0);gi++){
  const h=gi===G,vc=lead?VOICING[1]:VOICING[h?1:lite?gi+1:gi],level=(lead?.55:vc.level)*(h?.55:1),g=group(c,mix,noise,n,{pan:0,fs:vc.fs*(1+(rnd()-.5)*.06),level,vib:slow?22:12,rnd});
  // The stadium joins in: every section but the first swells in over the phrase, a beat or so apart.
  const off=(rnd()-.5)*.06;// ±30 ms per section
  const line=h?notes.map(nt=>[nt[0],nt[1],thirdAbove(nt[2],s.minor),nt[3],nt[4],nt[5]] as Note):notes;
  sing(g,line,{t0:off,spb,tonic:s.tonic+up,octs:[vc.oct],slow,rnd,join:key==='v1j'&&gi>0?(1.5+gi*1.4)*spb:0});
 }
 const P=key==='perc'?{...s.perc.verse,claps:[...(s.perc.verse.claps??[]),...(s.perc.chorus.claps??[])]}:lead?{drum:s.perc.verse.drum}:verse?s.perc.verse:build?s.perc.build:s.perc.chorus;
 const claps=P.claps&&side!==1?P.claps:side===1?P.claps2??[]:[],cl={type:'bandpass' as const,hz:1500,q:1.1,rnd};
 if(claps.length){const ln=lanes(c,mix,noise,lite?[0]:[0,0],cl);for(const b of claps)for(const l of ln)flutter(l,b*spb+(rnd()-.5)*.02,{n:lite?10:14,spread:.045,amp:.55,decay:.012,rnd});}
 if(P.stomps&&side!==1){const st=lanes(c,mix,noise,[0],{type:'lowpass',hz:240,q:.7,rnd})[0],thump=drum(c,mix,noise,rnd);
  for(const b of P.stomps){const t=b*spb;flutter(st,t,{n:lite?8:12,spread:.07,amp:1.1,decay:.03,rnd});hit(thump,t+.01,.35);}}
 if((P.drum||P.roll)&&side!==1){const d=drum(c,mix,noise,rnd);for(const b of P.drum??[])hit(d,b*spb,slow?.55:.9);
  if(P.roll)for(let k=0;k<8;k++)hit(d,(6+k/4)*spb,.35+.6*k/7);}
 return c.startRendering().then(b=>finish(b,0,0,-PHRASE_GAIN));
}
/** The crowd's reactions (mono one-shots, panned live to a section): "ooh" (near miss, shot, save), "aah" (disappointment),
 *  the rising "ooo-OOH" swell (an attack near the box), a groan, an applause burst (a tackle, an interception, a good long pass),
 *  and whistles with a low "ooh" murmur (a big challenge; the sim has no fouls or offsides to hear). */
export type ReactKind='ooh'|'aah'|'swell'|'groan'|'applause'|'jeer';
export const REACTIONS:readonly ReactKind[]=['ooh','aah','swell','groan','applause','jeer'];
/** Each reaction's voice contour: length s, base pitch scale, pitch points [t, ×], level points [t, level], release [t, tc], vowels [t, vowel]. */
const CONTOUR:Readonly<Record<Exclude<ReactKind,'applause'|'jeer'>,{len:number;base:number;p:readonly (readonly [number,number])[];g:readonly (readonly [number,number])[];rel:readonly [number,number];v:readonly (readonly [number,Vowel])[]}>>={
 ooh:{len:2.2,base:1,p:[[0,.95],[.35,1.22],[1.7,.78]],g:[[.3,.9]],rel:[1,.35],v:[[0,'u'],[.5,'o']]},
 aah:{len:2,base:1.05,p:[[0,1.25],[1.5,.7]],g:[[.12,.8]],rel:[.7,.4],v:[[0,'a'],[1,'o']]},
 swell:{len:2.8,base:1,p:[[0,.9],[1.6,1],[2.2,1.45]],g:[[1.4,.25],[2.1,1]],rel:[2.3,.2],v:[[0,'u'],[1.8,'o']]},
 groan:{len:1.6,base:.75,p:[[0,.95],[1.3,.7]],g:[[.15,.6]],rel:[.6,.35],v:[[0,'o'],[.6,'u']]},
};
type BedKind='murmur'|'roar'|'ole'|'goal'|ReactKind;
/** The beds and one-shots: murmur (chatter, loop), roar (a sustained "aah/ooh", loop), the olé roll (mono loop), the goal, the reactions. */
export function renderBed(kind:BedKind,lite=false,seed=1):Promise<Rendered>|null{
 const O=offlineCtor();if(!O)return null;const R=STADIUM_SOUND.rate,rnd=lcg(seed*104729+kind.length*977);
 const react=REACTIONS.includes(kind as ReactKind),len=react?(kind==='applause'?2.2:kind==='jeer'?2.4:CONTOUR[kind as keyof typeof CONTOUR].len):{murmur:6,roar:4,ole:3,goal:6}[kind as 'murmur'],
  extra=react?0:{murmur:.8,roar:.8,ole:STADIUM_SOUND.tail,goal:0}[kind as 'murmur'],ch=kind==='ole'||react?1:2;
 const c=new O(ch,Math.ceil((len+extra)*R),R),noise=noiseBuffer(c,rnd),G=lite?3:6,n=lite?3:4;
 const out=bus(c,x=>x.connect(c.destination),impulse(c,ch,rnd),kind==='murmur'?.55:.45,kind==='murmur'?2100:kind==='ole'?4200:4600);
 const end=len+extra;
 for(let gi=0;gi<(kind==='ole'?(lite?2:4):kind==='applause'?2:kind==='jeer'?3:G);gi++){
  const g=group(c,out,noise,n,{pan:ch===1?0:(gi/(G-1)-.5)*1.5,fs:.92+rnd()*.24,level:1,vib:kind==='murmur'?6:16,rnd});
  for(let i=0;i<n;i++)g.base[i]=kind==='murmur'?(rnd()<.5?95+rnd()*70:185+rnd()*110):150+rnd()*270;
  if(kind==='murmur'){// chatter: syllables of random vowels, voices gated on and off on their own
   let t=rnd()*.2;while(t<end){const d=.1+rnd()*.22;vowelAt(g,VOWELS[(rnd()*VOWELS.length)|0],t,.02);if(rnd()<.4)consonant(g,(['d','s','h','f'] as const)[(rnd()*4)|0],t-.01,.5);
    for(let i=0;i<n;i++)if(rnd()<.62){const a=t+rnd()*.03;g.osc[i].frequency.setTargetAtTime(g.base[i]*(1+(rnd()-.5)*.2),a,.04);g.vg[i].gain.setTargetAtTime(.3+.7*rnd(),a,.015);g.vg[i].gain.setTargetAtTime(0,a+d*.8,.03);}
    t+=d+(rnd()<.15?rnd()*.3:0);}}
  else if(kind==='roar'){// thousands holding "aah" / "ooh": slow pitch and level drift, a breath hiss under it
   g.cf.frequency.value=1100;g.cf.Q.value=.4;g.cg.gain.value=.35;let tv=0;while(tv<end){vowelAt(g,(['a','o','a','e'] as const)[(rnd()*4)|0],tv,.3);tv+=1+rnd();}
   for(let i=0;i<n;i++){g.osc[i].frequency.value=g.base[i];let t=0;while(t<end){g.osc[i].frequency.setTargetAtTime(g.base[i]*Math.pow(2,(rnd()-.5)*3/12),t,.25);g.vg[i].gain.setTargetAtTime(.45+.55*rnd(),t,.3);t+=.4+rnd()*.5;}}}
  else if(kind==='ole'){// a rolling "o-LÉÉ": sections staggered so the line never stops (the live layer pans it with the wave)
   const period=1.5,off=gi*period/(lite?2:4);for(let cyc=-1;cyc*period<end;cyc++){const t0=cyc*period+off;if(t0+1.3<0)continue;
    sing(g,[[0,.3,0,'o'],[.3,.9,4,'e','l']],{t0,spb:1,tonic:62+(gi%2?0:-12),octs:[0],slow:false,rnd});}}
  else if(kind==='goal'){// the roar: a burst of "OH" sweeping up into a long "AAH", easing off after three seconds
   for(let i=0;i<n;i++){const t0=.02+rnd()*.18,f0=g.base[i]+40,p=g.osc[i].frequency,gg=g.vg[i].gain;p.setValueAtTime(f0*.85,t0);p.exponentialRampToValueAtTime(f0*1.5,t0+.5);p.setTargetAtTime(f0*1.32,t0+.6,.4);
    gg.setValueAtTime(0,t0);gg.linearRampToValueAtTime(1,t0+.12);gg.setTargetAtTime(.7,t0+.8,.5);gg.setTargetAtTime(0,3+rnd()*.8,.9);}
   vowelAt(g,'o',0,.02);vowelAt(g,'a',.35,.08);vowelAt(g,rnd()<.5?'a':'e',1.6,.4);g.cf.frequency.value=1300;g.cf.Q.value=.4;g.cg.gain.setValueAtTime(0,0);g.cg.gain.linearRampToValueAtTime(.5,.15);g.cg.gain.setTargetAtTime(0,2.5,1);}
  else if(kind==='applause'){// a few "yeah!"s over the claps
   for(let i=0;i<n;i++){const t0=.05+rnd()*.5,f0=g.base[i]*1.1,p=g.osc[i].frequency,gg=g.vg[i].gain;p.setValueAtTime(f0,t0);p.exponentialRampToValueAtTime(f0*1.3,t0+.25);gg.setValueAtTime(0,t0);gg.linearRampToValueAtTime(.5,t0+.06);gg.setTargetAtTime(0,t0+.3,.15);}
   vowelAt(g,'e',0,.02);vowelAt(g,'a',.3,.1);}
  else if(kind==='jeer'){// a low "ooh" murmur under the whistles
   for(let i=0;i<n;i++){const t0=.1+rnd()*.3,f0=g.base[i]*.8,p=g.osc[i].frequency,gg=g.vg[i].gain;p.setValueAtTime(f0,t0);p.exponentialRampToValueAtTime(f0*.75,t0+1.8);gg.setValueAtTime(0,t0);gg.linearRampToValueAtTime(.5,t0+.3);gg.setTargetAtTime(0,1.4,.35);}
   vowelAt(g,'u',0,.02);}
  else{// a voice contour (CONTOUR): "ooh", "aah", the swell, a groan
   const k=CONTOUR[kind as keyof typeof CONTOUR];
   for(let i=0;i<n;i++){const t0=rnd()*.08,f0=g.base[i]*k.base,p=g.osc[i].frequency,gg=g.vg[i].gain;p.setValueAtTime(f0*k.p[0][1],t0);for(let j=1;j<k.p.length;j++)p.exponentialRampToValueAtTime(f0*k.p[j][1]*(1+(rnd()-.5)*.03),t0+k.p[j][0]);
    gg.setValueAtTime(0,t0);for(const [t,v] of k.g)gg.linearRampToValueAtTime(v*(.8+.2*rnd()),t0+t);gg.setTargetAtTime(0,t0+k.rel[0],k.rel[1]);}
   for(const [t,v] of k.v)vowelAt(g,v,t,t?.2:.02);g.cf.frequency.value=1200;g.cf.Q.value=.5;g.cg.gain.setValueAtTime(0,0);g.cg.gain.linearRampToValueAtTime(.25,k.g[0][0]);g.cg.gain.setTargetAtTime(0,k.rel[0],k.rel[1]);}
 }
 if(kind==='applause')for(const l of lanes(c,out,noise,[0,0,0],{type:'bandpass',hz:1600,q:.9,rnd})){let t=.02+rnd()*.05;while(t<2.1){const a=(.5+.5*rnd())*Math.exp(-t/.8);l.g.gain.setValueAtTime(a*.7,t);l.g.gain.setTargetAtTime(0,t+.0015,.01);t+=.01+rnd()*.03*(1+t);}}
 if(kind==='jeer')for(let w=0;w<(lite?2:4);w++){// whistles: a trilled sine each, on and off
  const o=c.createOscillator(),tr=c.createOscillator(),tg=c.createGain(),g=c.createGain(),f=2500+rnd()*900;o.frequency.value=f;tr.frequency.value=20+rnd()*9;tg.gain.value=90+rnd()*60;tr.connect(tg);tg.connect(o.frequency);g.gain.value=0;o.connect(g);g.connect(out);
  let t=rnd()*.3;while(t<2){const d=.18+rnd()*.5;g.gain.setTargetAtTime(.12,t,.01);g.gain.setTargetAtTime(0,t+d,.02);o.frequency.setValueAtTime(f*(.95+rnd()*.1),t);t+=d+.1+rnd()*.4;}o.start(0);tr.start(0);}
 if(kind==='goal'){// applause: dense random claps, three lanes, fading; and the stands' boom
  for(const l of lanes(c,out,noise,lite?[-.5,.5]:[-.7,0,.7],{type:'bandpass',hz:1600,q:.9,rnd})){let t=.6;while(t<5.8){const a=(.5+.5*rnd())*Math.exp(-(t-1)/2.2);l.g.gain.setValueAtTime(a*.6,t);l.g.gain.setTargetAtTime(0,t+.0015,.01);t+=.008+rnd()*.022*(1+t/2);}}
  hit(drum(c,out,noise,rnd),.05,.9);}
 return c.startRendering().then(b=>kind==='goal'||react?finish(b,0):finish(b,len,kind==='ole'?0:extra));
}
/** The sub rumble: brown noise (JS, 4 s at 11025 Hz, cross-faded loop) on the live context; low-passed live. */
function rumbleBuffer(c:Ctx){const r=11025,n=r*4,F=r/2,b=c.createBuffer(1,n+F,r),d=b.getChannelData(0);let y=0,top=0;
 for(let i=0;i<n+F;i++){y=(y+(Math.random()*2-1)*.02)*.996;d[i]=y;}
 for(let i=0;i<F;i++){const w=i/F;d[i]=d[i]*Math.sqrt(w)+d[n+i]*Math.sqrt(1-w);}for(let i=0;i<n;i++)top=Math.max(top,Math.abs(d[i]));if(top>0)for(let i=0;i<d.length;i++)d[i]*=.9/top;
 return {buffer:b,loopEnd:n/r};}


// ---- the live soundscape ----
type Bank={murmur:Rendered;roar:Rendered;ole:Rendered;goal:Rendered;lite:boolean}&Record<ReactKind,Rendered>;
type Pan=AudioNode&{pan?:AudioParam};
type Side={g:GainNode;p:Pan};
/** A song slot (two, for the crossfade): its gain, three sides (west, east, everyone), the phrase sources still sounding (their
 *  tails overlap the next phrase), the planned phrases and where the sequencer is. */
type Slot={g:GainNode;sides:[Side,Side,Side];srcs:(AudioBufferSourceNode|null)[];song:ChantId|null;steps:PhraseKey[];i:number;nextAt:number;run:number;played:number;ready:Map<string,Rendered|'r'>};
type Graph={c:AudioContext;out:GainNode;mur:AudioBufferSourceNode;gMur:GainNode;roar:AudioBufferSourceNode;fRoar:BiquadFilterNode;gRoar:GainNode;rum:AudioBufferSourceNode;fRum:BiquadFilterNode;gRum:GainNode;
 slots:[Slot,Slot];wave:AudioBufferSourceNode|null;gWave:GainNode;pWave:Pan;shots:{src:AudioBufferSourceNode|null;g:GainNode;p:Pan;at:number}[];nodes:AudioNode[]};
// Param indices for the "only when it moved" cache.
const P_OUT=0,P_MUR=1,P_ROAR=2,P_ROARF=3,P_RUM=4,P_SLOT0=5,P_SLOT1=6,P_WAVE=7,P_WAVEPAN=8,P_GA=9,P_GB=10,P_PA=11,P_PB=12,P_PC=13;
/** A random section of the bowl, as a pan. */
const side=()=>(Math.random()-.5)*1.6;
const isVerse=(k:PhraseKey)=>k==='lead'||k==='v1j'||k==='v1'||k==='v2';
/** Which sides a phrase is sung from: the call song's verses are a west call and an east answer (the lead is the west alone). */
export function phraseSides(id:ChantId,k:PhraseKey):readonly (0|1|2)[]{return SONGS[id].call&&isVerse(k)?(k==='lead'?[0]:[0,1]):[2];}
/** Schedule this far ahead of a phrase's bar line (s); a phrase not rendered `late` s before its bar is skipped (or, for the first, the song waits a bar). */
const AHEAD=1,LATE=.15;
const idle=(f:()=>void)=>{const w=globalThis as unknown as {requestIdleCallback?:(f:()=>void,o:{timeout:number})=>number};if(typeof w.requestIdleCallback==='function')w.requestIdleCallback(f,{timeout:400});else if(typeof setTimeout==='function')setTimeout(f,0);else f();};

export function createStadiumSound(host:StadiumSoundHost){
 const S=STADIUM_SOUND,M=STADIUM_MIX,last=new Float32Array(14).fill(-9);
 let acc=0,presence=0,musicFade=0,away=Infinity,quiet=0,g:Graph|null=null,bank:Bank|null=null,building=false,gen=0,rumble:Rendered|null=null;
 let active=0,lastGoal=Infinity,lastMiss=Infinity,holdUntil=0,waveOff=0,seed=1,renderSeed=1;
 let lastExc=0,swellAt=-99,swellOpen=false,touchSeen=-1,kickTeam='',kickLofted=false,kickAt=-99,rippleIn=6;const coolUntil=new Float64Array(REACTIONS.length);
 type Job={sl:Slot;run:number;key:string;id:ChantId;k:PhraseKey;side:0|1|2};
 const queue:Job[]=[];let rendering=false;
 const debug={ticks:0,builds:0,teardowns:0,graphs:0,renders:0,chant:null as ChantId|null,chantStarts:0,phrases:0,skipped:0,steps:[] as PhraseKey[],goals:0,oohs:0,reactions:{ooh:0,aah:0,swell:0,groan:0,applause:0,jeer:0} as Record<ReactKind,number>,wave:false,presence:0,stopped:0,lite:false};
 const to=(i:number,p:AudioParam,v:number,tc:number=S.tc)=>{if(!g||Math.abs(last[i]-v)<.008)return;last[i]=v;p.setTargetAtTime(v,g.c.currentTime,tc);};
 const playingSong=()=>g?g.slots[active].song:null;
 function stop(now=false){
  if(!g)return;const c=g.c,G=g;g=null;debug.chant=null;debug.wave=false;debug.stopped++;last.fill(-9);queue.length=0;rendering=false;gen++;
  const t=c.currentTime,f=now||c.state!=='running'?0:.3;
  try{G.out.gain.cancelScheduledValues(t);G.out.gain.setValueAtTime(G.out.gain.value,t);G.out.gain.linearRampToValueAtTime(0,t+f);}catch{}
  const srcs=[G.mur,G.roar,G.rum,G.wave,...G.shots.map(x=>x.src),...G.slots[0].srcs,...G.slots[1].srcs];
  for(const s of srcs){if(!s)continue;try{s.stop(f?t+f+.02:0);}catch{}}
  for(const sl of G.slots){sl.ready.clear();sl.song=null;}
  const drop=()=>{for(const s of srcs)try{s?.disconnect();}catch{}for(const n of G.nodes)try{n.disconnect();}catch{}host.changed();};
  if(f&&typeof setTimeout==='function')setTimeout(drop,(f+.1)*1000);else drop();
 }
 function teardown(){stop(true);bank=null;rumble=null;shared.clear();queue.length=0;gen++;building=false;rendering=false;debug.teardowns++;}
 /** The beds, rendered one after another on the first approach (after a gesture). */
 function build(lite:boolean){
  if(building||bank||!stadiumSoundSupported())return;building=true;debug.builds++;const my=gen,out:Partial<Bank>={lite};
  const kinds:BedKind[]=['murmur','roar','ole','goal',...REACTIONS];let i=0;
  const next=():void=>{if(my!==gen)return;if(i>=kinds.length){bank=out as Bank;building=false;debug.lite=lite;return;}
   const k=kinds[i++];idle(()=>{if(my!==gen)return;const p=renderBed(k,lite,seed);if(!p){building=false;return;}debug.renders++;
    p.then(r=>{(out as Record<string,Rendered>)[k]=r;next();},()=>{if(my===gen)building=false;});});};
  next();
 }
 /** Phrase renders: one at a time (bounded CPU), each with a fresh seed; a result for a superseded run is dropped. */
 function request(sl:Slot,j:number,lite:boolean){
  const id=sl.song;if(!id||j>=sl.steps.length)return;const k=sl.steps[j];
  for(const side of phraseSides(id,k)){const key=sl.run+':'+j+':'+side;if(sl.ready.has(key))continue;sl.ready.set(key,'r');queue.push({sl,run:sl.run,key,id,k,side});}
  pump(lite);
 }
 function pump(lite:boolean){
  if(rendering)return;const job=queue.shift();if(!job)return;const my=gen;rendering=true;
  // The render's setup (~2-3 ms of node and automation calls on desktop) runs in idle time, not inside the frame's tick.
  idle(()=>{if(my!==gen)return;const p=renderPhrase(job.id,job.k,job.side,lite,seed*1000+(renderSeed++));
  if(!p){rendering=false;job.sl.ready.delete(job.key);return;}debug.renders++;
  p.then(r=>{if(my!==gen)return;rendering=false;if(job.sl.run===job.run&&job.sl.song===job.id)job.sl.ready.set(job.key,r);pump(lite);},()=>{if(my!==gen)return;rendering=false;job.sl.ready.delete(job.key);pump(lite);});});
 }
 function loopSrc(c:AudioContext,r:Rendered,dest:AudioNode,at=0){const s=c.createBufferSource();s.buffer=r.buffer;s.loop=true;s.loopStart=0;s.loopEnd=r.loopEnd;s.connect(dest);s.start(at,Math.random()*r.loopEnd*.9);return s;}
 function pan(c:AudioContext,v:number):Pan{if(typeof c.createStereoPanner==='function'){const p=c.createStereoPanner();p.pan.value=v;return p;}return c.createGain();}
 function graph(c:AudioContext,master:AudioNode){
  const nodes:AudioNode[]=[],gain=(v=0)=>{const n=c.createGain();n.gain.value=v;nodes.push(n);return n;},filt=(type:BiquadFilterType,hz:number,q:number)=>{const f=c.createBiquadFilter();f.type=type;f.frequency.value=hz;f.Q.value=q;nodes.push(f);return f;};
  const b=bank!,out=gain(0);out.connect(master);rumble??=rumbleBuffer(c);
  const gMur=gain(),gRoar=gain(),fRoar=filt('lowpass',1200,.5),gRum=gain(),fRum=filt('lowpass',110,.8);gMur.connect(out);fRoar.connect(gRoar);gRoar.connect(out);fRum.connect(gRum);gRum.connect(out);
  const side=(sg:GainNode,v:number):Side=>{const gg=gain(1),p=pan(c,v);nodes.push(p);gg.connect(p);p.connect(sg);return {g:gg,p};};
  const slot=():Slot=>{const sg=gain(0);sg.connect(out);return {g:sg,sides:[side(sg,-.6),side(sg,.6),side(sg,0)],srcs:[null,null,null,null,null,null],song:null,steps:[],i:0,nextAt:0,run:0,played:0,ready:new Map()};};
  const gWave=gain(),pWave=pan(c,0);nodes.push(pWave);gWave.connect(pWave);pWave.connect(out);
  const shots=[0,1,2].map(()=>{const sg=gain(1),p=pan(c,0);nodes.push(p);sg.connect(p);p.connect(out);return {src:null as AudioBufferSourceNode|null,g:sg,p,at:0};});
  g={c,out,mur:loopSrc(c,b.murmur,gMur),gMur,roar:loopSrc(c,b.roar,fRoar),fRoar,gRoar,rum:loopSrc(c,rumble,fRum),fRum,gRum,slots:[slot(),slot()],wave:null,gWave,pWave,shots,nodes};
  last.fill(-9);debug.graphs++;active=0;
 }
 function startSong(G:Graph,id:ChantId,m:Readonly<StadiumMood>,lite:boolean){
  active^=1;const sl=G.slots[active],c=G.c,now=c.currentTime;stopSlot(sl,c,0);
  sl.song=id;sl.run++;sl.played=0;sl.i=0;sl.steps=planSong(id,Math.max(8,m.phaseLeft),Math.random,lite,true);sl.nextAt=now+nextBarIn(m.beat,m.bpm,.6);
  const lvl=M.chant*(.8+.4*m.excitement);sl.g.gain.cancelScheduledValues(now);sl.g.gain.setValueAtTime(0,now);sl.g.gain.setTargetAtTime(lvl,sl.nextAt,S.chantIn/3);last[P_SLOT0+active]=lvl;
  for(const sd of sl.sides){sd.g.gain.setTargetAtTime(1,now,.1);}if(sl.sides[0].p.pan)sl.sides[0].p.pan.setTargetAtTime(-.6,now,.1);if(sl.sides[1].p.pan)sl.sides[1].p.pan.setTargetAtTime(.6,now,.1);if(sl.sides[2].p.pan)sl.sides[2].p.pan.setTargetAtTime(0,now,.1);
  last[P_GA]=last[P_GB]=last[P_PA]=last[P_PB]=last[P_PC]=-9;
  debug.chant=id;debug.chantStarts++;debug.steps=sl.steps;request(sl,0,lite);request(sl,1,lite);
 }
 /** Fade a slot out over `fade` s (0 = at once) and forget its plan. */
 function stopSlot(sl:Slot,c:AudioContext,fade:number){
  const t=c.currentTime;sl.run++;sl.ready.clear();sl.song=null;
  if(fade>0){sl.g.gain.cancelScheduledValues(t);sl.g.gain.setValueAtTime(sl.g.gain.value,t);sl.g.gain.setTargetAtTime(0,t,fade/3);}
  for(let i=0;i<sl.srcs.length;i++){const s=sl.srcs[i];if(!s)continue;try{s.stop(fade>0?t+fade+.2:0);}catch{}if(!fade){s.disconnect();sl.srcs[i]=null;}}
 }
 /** The sequencer: phrases go out on bar lines up to AHEAD s early; the next two are rendered ahead; a finished plan re-plans
  *  (verses and choruses again, no lead) for what is left of the mood's chant phase. */
 function sequence(G:Graph,sl:Slot,m:Readonly<StadiumMood>,lite:boolean){
  const c=G.c,id=sl.song!,len=PHRASE_BEATS*60/(CHANTS.find(ch=>ch.id===id)?.bpm??100);
  for(let guard=0;guard<4&&sl.nextAt-c.currentTime<AHEAD;guard++){
   if(sl.i>=sl.steps.length){sl.steps=planSong(id,Math.max(len*2,m.phaseLeft-(sl.nextAt-c.currentTime)),Math.random,lite,false);sl.i=0;sl.run++;sl.ready.clear();debug.steps=sl.steps;request(sl,0,lite);}
   const k=sl.steps[sl.i],sides=phraseSides(id,k);let ok=true;
   for(const sd of sides){const r=sl.ready.get(sl.run+':'+sl.i+':'+sd);if(!r||r==='r')ok=false;}
   if(!ok){if(sl.nextAt-c.currentTime>LATE)break;// not rendered yet: wait, then skip it (the first phrase waits a bar instead)
    if(!sl.played){sl.nextAt+=len/2;continue;}debug.skipped++;}
   else for(const sd of sides){const key=sl.run+':'+sl.i+':'+sd,r=sl.ready.get(key) as Rendered;sl.ready.delete(key);
    let free=sl.srcs.indexOf(null);if(free<0){free=0;try{sl.srcs[0]!.stop();}catch{}sl.srcs[0]!.disconnect();}
    const src=c.createBufferSource();src.buffer=r.buffer;src.connect(sl.sides[sd].g);src.start(Math.max(c.currentTime,sl.nextAt));sl.srcs[free]=src;
    src.onended=()=>{src.disconnect();const j=sl.srcs.indexOf(src);if(j>=0)sl.srcs[j]=null;};sl.played++;debug.phrases++;}
   sl.i++;sl.nextAt+=len;request(sl,sl.i,lite);request(sl,sl.i+1,lite);
  }
 }
 /** A one-shot on the pool of three (the oldest gives way), panned to a section, optionally a little later. */
 function shot(G:Graph,r:Rendered,level:number,panTo=0,delay=0){const c=G.c,t=c.currentTime+delay;let s=G.shots[0];for(const x of G.shots){if(!x.src){s=x;break;}if(x.at<s.at)s=x;}
  if(s.src){try{s.src.stop();}catch{}s.src.disconnect();}const src=c.createBufferSource();src.buffer=r.buffer;src.connect(s.g);s.g.gain.setValueAtTime(level,t);if(s.p.pan)s.p.pan.setValueAtTime(panTo,t);src.start(t);s.src=src;s.at=t;src.onended=()=>{src.disconnect();if(s.src===src)s.src=null;};}
 /** A reaction, rate-limited per kind (cool s). */
 function react(G:Graph,k:ReactKind,level:number,panTo=0,delay=0,cool=0){const now=G.c.currentTime,i=REACTIONS.indexOf(k);if(now<coolUntil[i])return false;coolUntil[i]=now+cool;shot(G,bank![k],level*M.react,panTo,delay);debug.reactions[k]++;return true;}
 function goal(G:Graph,zone:number){
  const c=G.c,t=c.currentTime;shot(G,bank!.goal,M.goal);debug.goals++;swellOpen=false;holdUntil=t+S.goalHold+.6;
  const swell=(p:AudioParam,peak:number,rest:number)=>{p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(peak,t+.35);p.setTargetAtTime(rest,t+S.goalHold,1.3);};
  swell(G.gRoar.gain,M.roar*1.4,M.roar*.5);swell(G.fRoar.frequency,3400,1800);swell(G.gRum.gain,M.rumble*Math.max(.5,zone)*1.7,M.rumble*Math.max(.3,zone)*.6);
  for(const sl of G.slots){if(!sl.song)continue;const sg=sl.g.gain;sg.cancelScheduledValues(t);sg.setValueAtTime(sg.value,t);sg.setTargetAtTime(M.chant*.3,t,.15);sg.setTargetAtTime(M.chant,t+S.goalHold,1);}
  last.fill(-9);
 }
 /** The crowd reacting to the match: the swell as an attack nears the box (and a groan or "aah" when it fizzles), the touch ring
  *  (a save: "ooh" + applause; a shot: "ooh"; a tackle or interception: applause, now and then whistles for a big challenge in a
  *  dangerous area; a long ball well received: applause; a heavy touch: a groan), and small "ooh / aah" ripples from a section. */
 function reactions(G:Graph,f:StadiumSoundFrame,m:Readonly<StadiumMood>,e:number,step:number){
  const now=G.c.currentTime;
  if(e>.55&&lastExc<=.55&&now-swellAt>10){react(G,'swell',.9,side()*.5);swellAt=now;swellOpen=true;}
  else if(swellOpen&&now-swellAt>2.2&&e<.4){swellOpen=false;react(G,Math.random()<.5?'aah':'groan',.75,side()*.5);}
  lastExc=e;
  const sim=f.sim;
  if(sim){if(touchSeen<0||sim.touchSerial<touchSeen)touchSeen=sim.touchSerial;const ring=sim.touches.length;
   for(let n=Math.max(touchSeen+1,sim.touchSerial-ring+1);n<=sim.touchSerial;n++){const t=sim.touches[(n-1)%ring];if(!t||t.serial!==n)continue;
    if(t.kind==='parry'){react(G,'ooh',1,side(),0,2);react(G,'applause',.8,side(),.5,2);}
    else if(t.kind==='tackle'){if(e>.45&&Math.random()<.4)react(G,'jeer',.55,side(),0,8);else react(G,'applause',.45,side(),0,3);}
    else if(t.kind==='intercept')react(G,'applause',.4,side(),0,4);
    else if(t.kind==='kick'){kickTeam=t.team;kickLofted=t.height>.6;kickAt=now;if(!t.other&&e>.35)react(G,'ooh',.85,side()*.5,.15,3);}
    else if(t.kind==='receive'){if(kickLofted&&t.team===kickTeam&&now-kickAt<4)react(G,'applause',.4,side(),0,6);kickLofted=false;}
    else if(t.kind==='heavy')react(G,'groan',.35,side(),0,8);}
   touchSeen=sim.touchSerial;}else touchSeen=-1;
  // Ripples: a section somewhere goes "ooh" or "aah" (more often when the game is lively).
  rippleIn-=step;if(rippleIn<=0){rippleIn=(5+Math.random()*9)*(1-.45*e);const r=Math.random();react(G,r<.45?'ooh':r<.8?'aah':'applause',.22+.2*Math.random()+.2*e,side());}
 }
 function mix(G:Graph,f:StadiumSoundFrame,step:number){
  const c=G.c,m=f.mood,live=!!m&&m.live,e=live?m!.excitement:0,zone=rumbleZone(f.x,f.z,f.h,presence),lite=f.lite;
  // Goals and near misses (the mood's counters drop to 0 on the event).
  if(m){if(m.sinceGoal<lastGoal&&live)goal(G,zone);else if(m.sinceNearMiss<lastMiss&&live&&m.sinceGoal>1){react(G,'ooh',1.1);react(G,'aah',.7,0,1.15);debug.oohs++;swellOpen=false;}lastGoal=m.sinceGoal;lastMiss=m.sinceNearMiss;}
  if(live)reactions(G,f,m!,e,step);else{lastExc=0;swellOpen=false;touchSeen=-1;}
  to(P_OUT,G.out.gain,presence*M.out*(lite?M.lite:1));to(P_MUR,G.gMur.gain,M.murmur*(live?.7+.5*e:.45));
  if(c.currentTime>holdUntil){to(P_ROAR,G.gRoar.gain,live?M.roar*(.06+.94*e*e):0,.5);to(P_ROARF,G.fRoar.frequency,900+2600*e,.5);to(P_RUM,G.gRum.gain,M.rumble*zone*(live?.3+.7*e:.12),.6);}
  // The song: the mood's chant, crossfaded on a change; a new performance each time.
  const want=chantFor(m),sl=G.slots[active];
  if(want!==sl.song){if(sl.song)stopSlot(sl,c,S.chantFade);debug.chant=null;if(want)startSong(G,want,m!,lite);}
  const cur=G.slots[active];if(!cur.song)return;
  if(c.currentTime>holdUntil)to(P_SLOT0+active,cur.g.gain,M.chant*(.8+.4*e),.6);
  sequence(G,cur,m!,lite);
  const song=SONGS[cur.song];
  // Call and answer: each stand from where it is (pan by the camera's right, the nearer stand louder).
  if(song.call&&!lite){const ax=STADIUM.x-52-f.x,az=STADIUM.z-f.z,bx=STADIUM.x+52-f.x,bz=az,da=Math.hypot(ax,az),db=Math.hypot(bx,bz),w=db/(da+db);
   to(P_GA,cur.sides[0].g.gain,.4+.9*w,.3);to(P_GB,cur.sides[1].g.gain,.4+.9*(1-w),.3);
   if(cur.sides[0].p.pan)to(P_PA,cur.sides[0].p.pan,Math.max(-.9,Math.min(.9,(ax*f.rx+az*f.rz)/Math.max(12,da))),.3);if(cur.sides[1].p.pan)to(P_PB,cur.sides[1].p.pan,Math.max(-.9,Math.min(.9,(bx*f.rx+bz*f.rz)/Math.max(12,db))),.3);}
  // Stomp round the bowl: the stamping travels round the stands (one lap every 4 bars of the beat clock).
  if(song.sweep&&cur.sides[2].p.pan)to(P_PC,cur.sides[2].p.pan,lite?0:.75*Math.sin(Math.PI*2*m!.beat/16),.15);
  // The olé roll rides the Mexican wave round the bowl (not in the lite mix).
  const wv=live&&!lite?m!.wave.on:0;
  if(wv>.01){waveOff=0;if(!G.wave){G.wave=loopSrc(c,bank!.ole,G.gWave);debug.wave=true;}
   const wx=STADIUM.x+Math.cos(m!.wave.angle)*55-f.x,wz=STADIUM.z+Math.sin(m!.wave.angle)*70-f.z,dw=Math.hypot(wx,wz),la=Math.atan2(f.z-STADIUM.z,f.x-STADIUM.x),near=.35+.65*(1+Math.cos(m!.wave.angle-la))/2;
   to(P_WAVE,G.gWave.gain,M.wave*wv*near,.25);if(G.pWave.pan)to(P_WAVEPAN,G.pWave.pan,Math.max(-.9,Math.min(.9,(wx*f.rx+wz*f.rz)/Math.max(15,dw))),.25);}
  else if(G.wave){to(P_WAVE,G.gWave.gain,0,.3);waveOff+=step;if(waveOff>1.5){const w=G.wave;G.wave=null;debug.wave=false;try{w.stop();}catch{}w.disconnect();last[P_WAVE]=-9;}}
 }
 const api={
  /** Each frame (Town); the work runs at 10 Hz. */
  update(dt:number,f:StadiumSoundFrame){
   acc+=dt;if(acc<S.tick)return;const step=Math.min(1,acc);acc=0;debug.ticks++;
   presence=presenceStep(presence,presenceAt(bowlDistance(f.x,f.z,f.h)));debug.presence=presence;musicFade=host.sfxOn()?presence:0;
   if(presence>0){away=0;quiet=0;}else{away+=step;quiet+=step;}
   if(presence===0){if(g){to(P_OUT,g.out.gain,0);if(quiet>S.stopAfter)stop(false);}if(bank&&away>S.teardown)teardown();return;}
   const c=host.ctx();if(!c)return;// no gesture yet: nothing is built
   if(!bank){build(f.lite);return;}
   if(!host.ok()){if(g)stop(false);host.wake();return;}
   if(!g){const master=host.master();if(!master)return;graph(c,master);}
   mix(g!,f,step);
  },
  stop,dispose(){teardown();},
  /** 0..1, how far the stadium has faded the island music out (0 while effects are muted). */
  get musicFade(){return musicFade;},get presence(){return presence;},
  /** The live soundscape is playing (its own goal roar replaces the old cheer). */
  get ready(){return !!g;},
  get song(){return playingSong();},
  get supported(){return stadiumSoundSupported();},
  debug,
  /** Tests / the sample render: a different seed for the renders. */
  set seed(v:number){seed=v;},
 };
 host.bind?.({active:()=>!!g,stop:(now?:boolean)=>stop(!!now)});
 return api;
}
export type StadiumSound=ReturnType<typeof createStadiumSound>;
