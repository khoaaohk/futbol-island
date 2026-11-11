import {isSoundEnabled,getSoundVolume} from '../games/sound';

/** Futbol Tennis sound: synthesized one-shots on the game's own AudioContext.
 * No assets and no timers; the only looping sources are noise voices with a scheduled stop. Every voice is scheduled at the event and
 * disconnects itself when it ends. Layers:
 * - a touch sound for each contact grade (perfect rings, an early or late touch sounds dull);
 * - bounce, net thud and net-cord (tape) ping;
 * - no crowd (Oct 27 2026: the court is the focus; no murmur, gasp, cheer or applause);
 * - an adaptive bassline: from the 3rd touch, each touch plays the next note.
 * Comic house style (Nov 10 2026): the palette moves to Breakaway's hand-percussion world while tennis stays readable by ear.
 * A light surf-and-breeze bed (finite swells scheduled only while cues keep arriving: still no timers and no loops, it dies away
 * by itself a few seconds after play stops); a different drum per shot (kick = cajon slap, lob = open conga with air, drop =
 * wood block, header = high bongo, scissor / slam = cajon bass with a rim crack, trap = muted tom); a bounce that sounds like
 * the floor of the tour stop (clay, sand, hard, wood, grass); the point call on a steel pan; applause as hand claps in rhythm
 * that last longer after a long rally; palm-muted nylon plucks for the rally line. */
const noiseBuffers=new WeakMap<AudioContext,AudioBuffer>(),voices=new WeakMap<AudioContext,number>();
const BASS=[110,130.81,146.83,164.81,196,164.81,146.83,130.81]; // A minor pentatonic walk
/** Tour combo chime notes (×1…×4): C5 E5 G5 C6, so a growing combo is heard as a climbing line. */
export const TENNIS_COMBO_NOTES=[523.25,659.25,783.99,1046.5] as const;
/** Voice pool cap (shared by every tennis one-shot): a busy rally never stacks more than this many live nodes. */
export const TENNIS_MAX_VOICES=14;
const MAX_VOICES=TENNIS_MAX_VOICES;
/** Makeup gain in front of the one limiter (threshold -9 dB, ratio 14): raises the mix to the level of the other cabinets without clipping. */
export const TENNIS_MIX_LIFT=2.3;
let lastHaptic=0;

/** One output bus per context (final polish, Nov 10 2026): every tennis voice sums into a single limiter before the speakers, so a
 * busy point (thwack + bounce + applause + bell + surf, up to TENNIS_MAX_VOICES) cannot clip. Falls back to the destination where
 * a compressor is missing. */
const buses=new WeakMap<AudioContext,AudioNode>();
function out(ctx:AudioContext):AudioNode{let b=buses.get(ctx);if(!b){b=ctx.destination;try{if(typeof ctx.createDynamicsCompressor==='function'){const c=ctx.createDynamicsCompressor();c.threshold.value=-9;c.knee.value=6;c.ratio.value=14;c.attack.value=.003;c.release.value=.22;c.connect(ctx.destination);/* NOTE: this one connect must stay on ctx.destination (pointing it at out() recursed and silenced the game for a few minutes on Nov 10) */const lift=ctx.createGain();lift.gain.value=TENNIS_MIX_LIFT;lift.connect(c);b=lift;/* makeup gain into the limiter: the club mix measured about half of pinball's level before it */}}catch{b=ctx.destination;}buses.set(ctx,b);}return b;}
/** The surf-and-breeze bed's live voices, so it can be hushed the moment the game sleeps or pauses (`tennis:hush`). */
type Bed={g:GainNode;src:AudioBufferSourceNode};const beds=new WeakMap<AudioContext,Set<Bed>>();
function bedOf(ctx:AudioContext){let b=beds.get(ctx);if(!b){b=new Set();beds.set(ctx,b);}return b;}
function hush(ctx:AudioContext){const now=ctx.currentTime;nextSwell.delete(ctx);for(const b of bedOf(ctx)){try{b.g.gain.cancelScheduledValues(now);b.g.gain.setTargetAtTime(.0001,now,.09);b.src.stop(now+.5);}catch{/* already stopped (older Safari throws on a second stop) */}}}
function musicOn(){try{return localStorage.getItem('fi2-music-enabled')!=='false';}catch{return true;}}
function noiseBuffer(ctx:AudioContext){let b=noiseBuffers.get(ctx);if(!b){b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseBuffers.set(ctx,b);}return b;}
const jitter=(amount:number)=>1+(Math.random()*2-1)*amount;
function claim(ctx:AudioContext){const n=voices.get(ctx)??0;if(n>=MAX_VOICES)return false;voices.set(ctx,n+1);return true;}
function free(ctx:AudioContext){voices.set(ctx,Math.max(0,(voices.get(ctx)??1)-1));}

function tone(ctx:AudioContext,at:number,type:OscillatorType,f0:number,f1:number,dur:number,vol:number,attack=.006){
 if(vol<=0||!claim(ctx))return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;
 osc.frequency.setValueAtTime(f0,at);if(f1!==f0)osc.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 osc.connect(gain);gain.connect(out(ctx));osc.start(at);osc.stop(at+dur+.02);osc.onended=()=>{free(ctx);osc.disconnect();gain.disconnect();};
}
function noise(ctx:AudioContext,at:number,dur:number,vol:number,type:BiquadFilterType,f0:number,f1=f0,q=.8,attack=.004):Bed|undefined{
 if(vol<=0||!claim(ctx))return;const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=noiseBuffer(ctx);filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(f0,at);if(f1!==f0)filter.frequency.exponentialRampToValueAtTime(f1,at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 src.connect(filter);filter.connect(gain);gain.connect(out(ctx));/* the noise buffer is 1 s: anything longer loops, and every source gets an explicit stop (older Safari ignores start()'s duration on a looping source, which would never end) */if(dur>.38)src.loop=true;src.start(at,Math.random()*.6);try{src.stop(at+dur+.05);}catch{}src.onended=()=>{free(ctx);src.disconnect();filter.disconnect();gain.disconnect();};return{g:gain,src};
}
/** A short voiced "hup!" (a buzzy source through one vowel formant): power shots get a little effort sound. */
function voice(ctx:AudioContext,at:number,f0:number,f1:number,formant:number,dur:number,vol:number){
 if(vol<=0||!claim(ctx))return;const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();osc.type='sawtooth';
 osc.frequency.setValueAtTime(f0,at);osc.frequency.exponentialRampToValueAtTime(f1,at+dur);filter.type='bandpass';filter.Q.value=4;filter.frequency.setValueAtTime(formant,at);filter.frequency.exponentialRampToValueAtTime(formant*.75,at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 osc.connect(filter);filter.connect(gain);gain.connect(out(ctx));osc.start(at);osc.stop(at+dur+.02);osc.onended=()=>{free(ctx);osc.disconnect();filter.disconnect();gain.disconnect();};
}
/** Rally pad chords (A minor family), one per 4 touches from the 8th: the long rally gets its own music. */
const PAD=[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[164.81,207.65,246.94]];
/** A plucked nylon string: a triangle body with a fast pick transient and a quiet octave. Replaces the synth bass. */
function pluck(ctx:AudioContext,at:number,hz:number,dur:number,vol:number){tone(ctx,at,'triangle',hz*1.01,hz,dur,vol,.003);tone(ctx,at,'sine',hz*2,hz*2,dur*.45,vol*.35,.002);}
/** A steel-pan note (the point call): the fundamental with a strong octave, a hard mallet attack and a short ring. */
function pan(ctx:AudioContext,at:number,hz:number,dur:number,vol:number){tone(ctx,at,'sine',hz*1.012,hz,dur,vol,.002);tone(ctx,at,'sine',hz*2.004,hz*2,dur*.6,vol*.55,.002);noise(ctx,at,.012,vol*.5,'bandpass',hz*3,hz*3,2,.001);}
/** A hand drum: a pitched skin (sine drop) under a slap of filtered noise. `slap` 0..1 = how much hand, `hz` = the drum's size. */
function drum(ctx:AudioContext,at:number,hz:number,dur:number,vol:number,slap:number,slapHz=2300){tone(ctx,at,'sine',hz*1.5,hz,dur,vol,.002);if(slap>0)noise(ctx,at,.035,vol*slap,'bandpass',slapHz,slapHz*.7,1.3,.001);}
/** Tour stop sound state (set by the `tennis:venue` / `tennis:wind` cues from the runtime). */
const venueSound={surf:.6,bounce:'clay',breeze:.15,wind:0};
const nextSwell=new WeakMap<AudioContext,number>(),clapBuffers=new WeakMap<AudioContext,AudioBuffer>();
/** One surf swell (a slow filtered-noise wave that breaks and draws back) plus the breeze, scheduled ahead whenever a cue arrives and
 * the previous swell is nearly done: continuous while a rally is live, silent a few seconds after the last cue. One voice. */
function surf(ctx:AudioContext,now:number,v:number){
 const due=nextSwell.get(ctx)??0;if(due>now+1.2)return;const at=Math.max(now,due-.6),dur=4.2+Math.random()*1.4,level=venueSound.surf*.05*v,wind=Math.max(venueSound.breeze,venueSound.wind/1.5);
 nextSwell.set(ctx,at+dur*.82);
 if(claim(ctx)){const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noiseBuffer(ctx);src.loop=true;f.type='lowpass';f.Q.value=.4;
  f.frequency.setValueAtTime(260,at);f.frequency.linearRampToValueAtTime(1500+Math.random()*500,at+dur*.42);f.frequency.exponentialRampToValueAtTime(380,at+dur);
  g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(level,at+dur*.4);g.gain.linearRampToValueAtTime(level*.55,at+dur*.55);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
  const bed={g,src},set=bedOf(ctx);set.add(bed);src.connect(f);f.connect(g);g.connect(out(ctx));src.start(at,Math.random()*.5);try{src.stop(at+dur+.05);}catch{}src.onended=()=>{set.delete(bed);free(ctx);src.disconnect();f.disconnect();g.disconnect();};}
 if(wind>.25){const air=noise(ctx,at,dur,Math.min(.04,wind*.03)*v,'bandpass',500+wind*300,900+wind*500,.5,dur*.4);if(air){const set=bedOf(ctx);set.add(air);const end=air.src.onended;air.src.onended=function(this:AudioScheduledSourceNode,e:Event){set.delete(air);end?.call(this,e);};}} // the breeze rises with the wind chip
}
/** Applause as hand claps in rhythm: one cached 2.6 s buffer of a clapped phrase (eleven beats, each a handful of hands landing a
 * few milliseconds apart, the off-beats lighter), played once with a size-shaped envelope: a short point gets three or four claps,
 * a long rally or the match the whole phrase. One voice. */
function applause(ctx:AudioContext,at:number,size:number,vol:number){
 if(vol<=0||!claim(ctx))return;let b=clapBuffers.get(ctx);
 if(!b){const sr=ctx.sampleRate,n=Math.floor(sr*2.6);b=ctx.createBuffer(1,n,sr);const d=b.getChannelData(0),BEAT=.218,ACCENT=[1,.55,1,.55,1,1,1,.55,1,.7,1];
  for(let k=0;k<ACCENT.length;k++)for(let hand=0;hand<7;hand++){const t=.02+k*BEAT+(Math.random()-.5)*.03,start=Math.floor(t*sr),len=Math.floor(sr*(.009+Math.random()*.01)),amp=ACCENT[k]*(.45+Math.random()*.55);let lp=0;const kf=.4+Math.random()*.35;
   for(let i=0;i<len&&start+i<n;i++){lp+=(Math.random()*2-1-lp)*kf;d[start+i]+=lp*amp*Math.exp(-i/(len*.35));}}
  clapBuffers.set(ctx,b);}
 const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),dur=.7+Math.min(1,size)*1.8;src.buffer=b;if(src.playbackRate)src.playbackRate.value=.94+Math.random()*.12;f.type='bandpass';f.frequency.setValueAtTime(1500,at);f.Q.value=.7;
 g.gain.setValueAtTime(vol,at);g.gain.setValueAtTime(vol,at+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
 src.connect(f);f.connect(g);g.connect(out(ctx));src.start(at,0,dur+.05);src.onended=()=>{free(ctx);src.disconnect();f.disconnect();g.disconnect();};
}
function haptic(pattern:number|number[]){
 const now=performance.now();if(now-lastHaptic<150||typeof navigator.vibrate!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;lastHaptic=now;navigator.vibrate(pattern);
}

/** cue grammar (from tennisFeel):
 *  tennis:kick:<side>:<grade|serve>:<shot>:<rally>:<power>:<perfect streak>:<volley 0|1>
 *  tennis:out (the incoming ball is flying out: let it go)
 *  tennis:bounce:<intensity>:<half> · tennis:net:<net|over|back>
 *  tennis:point:<winner>:<rally>:<kind> · tennis:match:<winner>:<rally>:<kind>
 *  tennis:hold (a pressed kick waits for the ball) · tennis:coach (aim nudge)
 *  tennis:trap:<side>:<chest|thigh> · tennis:golden:<shot> · tennis:goldready · tennis:fake · tennis:target · tennis:tempo:<step> · tennis:tire
 *  Oct 25: tennis:bounce:<i>:<half>:<sand|hard>:<rally> · tennis:skid:<side> · tennis:matchpoint:<you|rival|both>
 *  tennis:streak:<n> · tennis:comeback */
export function tennisSound(ctx:AudioContext|null,cue:string){
 const [,kind,a='',b='',c='',d='0',e='0',f='0',g='0']=cue.split(':');
 if(kind==='venue'){venueSound.surf=Number(a)||0;venueSound.bounce=b||'clay';venueSound.breeze=Number(c)||0;venueSound.wind=0;return;}
 if(kind==='wind'){venueSound.wind=Number(a)||0;return;}
 if(kind==='hush'){if(ctx)hush(ctx);return;} // the game slept or paused: the surf bed stops now, not when its swell runs out
 if(typeof document==='undefined'||document.hidden||!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 if(kind==='kick'&&a==='you'&&(b==='perfect'||c==='slam'||c==='scissor'||c==='shark'||c==='bicycle'))haptic(b==='perfect'?[9,24,12]:14);
 if(kind==='golden'||kind==='target')haptic(kind==='golden'?[12,30,20]:10);
 if((kind==='point'||kind==='match')&&a==='you')haptic(kind==='match'?[18,35,28,35,40]:[18,35,28]);
 if(!ctx||ctx.state!=='running')return;
 const t=ctx.currentTime+.005,v=volume;
 surf(ctx,t,v);
 if(kind==='kick'){
  const side=a,grade=b,shot=c,rally=Number(d)||0,power=Math.min(1,Number(e)||.4)/* the cue carries the rig's kick power, which runs past 1 on serves and big volleys: unclamped it drove the strike straight into the limiter */,far=side==='rival'?.72:1,p=jitter(.06)*(side==='rival'?.92:1);
  const dull=grade==='early'||grade==='late'||grade==='stretched'||grade==='heavy'||shot==='dive',streak=Number(f)||0,volley=g==='1';
  if(shot==='chest'){tone(ctx,t,'sine',118*p,68*p,.14,(dull?.1:.14)*v*far,.012);noise(ctx,t,.09,.05*v*far,'lowpass',420,260,.6,.01);} // muted tom: a soft cushioned chest thud
  else if(shot==='header'){drum(ctx,t,330*p,.09,.15*v*far,.35,1500);tone(ctx,t,'sine',495*p,440*p,.06,.07*v*far,.003);} // high bongo: a hollow knock off the forehead
  else if(shot==='drop'){tone(ctx,t,'triangle',940*p,820*p,.05,.1*v*far,.001);tone(ctx,t,'sine',1410*p,1300*p,.03,.045*v*far,.001);} // wood block: a dry tick, the foot takes the pace off
  else if(shot==='lob'||shot==='flick'){drum(ctx,t,196*p,.24,.16*v*far,.18,900);} // open conga: a round lifted tone (its air follows below)
  else{
   const heavy=shot==='slam'||shot==='scissor'||shot==='shark'||shot==='bicycle';
   // cajon: a bass hit for the big volleys (with a rim crack), a slap for a clean kick, a dead thud for a poor touch
   tone(ctx,t,'sine',(heavy?150:dull?115:175)*p,(heavy?38:dull?55:68)*p,heavy?.2:.085,(heavy?.24:.17+power*.06)*v*far*jitter(.1),.003);if(heavy)noise(ctx,t,.028,.13*v*far,'highpass',2800,4200,.7,.001);
   noise(ctx,t,dull?.07:.04,(dull?.07:.075)*v*far,dull?'lowpass':'bandpass',dull?700:2300*p,dull?400:1600,dull?.7:1.3);
   if(heavy)noise(ctx,t+.01,.28,.07*v*far,'bandpass',900,2600,.9,.03); // whoosh
   if(!heavy&&power>.76)noise(ctx,t,.06,Math.min(.1,(power-.7)*.4)*v*far,'highpass',2600,3400,.8); // a wound-up strike cracks louder with its power
  }
  // Perfect chime climbs a whole step per touch of a perfect streak (capped), so rhythm is audible.
  if(side==='you'&&grade==='perfect'){const up=Math.pow(2,Math.min(4,Math.max(0,streak-1))*2/12);tone(ctx,t+.03,'triangle',1046.5*up,1046.5*up,.16,.055*v);tone(ctx,t+.085,'triangle',1568*up,1568*up,.2,.05*v);}
  // Heavy touch: the ball skids off the boot (a longer scuff). Clean volley: a crisp, high snap.
  if(side==='you'&&grade==='heavy')noise(ctx,t+.02,.16,.05*v,'bandpass',900,500,1,.01);
  if(side==='you'&&volley)noise(ctx,t,.035,.05*v,'highpass',3200,3200,.9);
  // Adaptive rally bassline: the exchange itself plays the music, and it climbs as the rally grows.
  if(rally>=3&&musicOn()){const step=(rally-3)%BASS.length,octave=rally>=11?4:2;pluck(ctx,t+.02,BASS[step]*octave,.34,.05*v);if(rally>=8)pluck(ctx,t+.11,BASS[step]*octave*1.5,.26,.026*v);}
  // Nov 11 2026: the members' mid-rally clap ripple is gone with the members (TENNIS_CLUB_CROWD=false, owner "remove crowd").
  // Effort voice on power shots and a rising whoosh under a lob (the ball climbs, so does the sound).
  if(c!=='drop'&&(power>.78||shot==='slam'||shot==='scissor'||shot==='bicycle'||shot==='shark'))voice(ctx,t+.005,(side==='rival'?190:250)*p,(side==='rival'?150:200)*p,side==='rival'?650:800,.11,.045*v*far);
  if(shot==='lob')noise(ctx,t+.02,.5,.035*v*far,'bandpass',450,1700,1.3,.12);
  // Pad chord every 4th touch from the 8th: a slow swell under the bassline.
  if(rally>=8&&rally%4===0&&musicOn()){const chord=PAD[(rally/4-2)%PAD.length];chord.forEach((hz,i)=>tone(ctx,t+i*.02,'sine',hz,hz,1.3,.016*v,.18));}
  return;
 }
 if(kind==='bounce'){const i=Math.max(.2,Number(a)||.4),far=b==='rival'?.7:1,rally=Number(d)||0;
  if(rally>=6&&musicOn())noise(ctx,t+.01,.035,(rally>=12?.03:.022)*v,'highpass',7000,7000,.7,.002);/* hi-hat on the bounce: the rally keeps the beat */const floor=venueSound.bounce;if(c==='sand'||floor==='sand'){tone(ctx,t,'sine',70*jitter(.08),45,.09,.08*i*v*far);noise(ctx,t,.14,.06*i*v*far,'lowpass',900,300,.6);return;} // a scuff into soft sand
  if(floor==='wood'){tone(ctx,t,'sine',190*jitter(.06),120,.09,.11*i*v*far,.003);tone(ctx,t,'sine',310*jitter(.06),240,.05,.05*i*v*far,.003);noise(ctx,t,.02,.03*i*v*far,'highpass',1800);return;} // hollow deck boards
  if(floor==='grass'){tone(ctx,t,'sine',82*jitter(.08),50,.08,.09*i*v*far);noise(ctx,t,.06,.03*i*v*far,'lowpass',1400,500,.6);return;}
  if(floor==='clay'){tone(ctx,t,'sine',98*jitter(.08),56,.07,.1*i*v*far);noise(ctx,t,.07,.05*i*v*far,'bandpass',1900,900,.9,.003);return;} // a tick and a spit of grit
  tone(ctx,t,'sine',95*jitter(.08),55,.07,.1*i*v*far);noise(ctx,t,.025,.03*i*v*far,'highpass',1500);return;}
 if(kind==='skid'){const far=a==='rival'?.6:1,q=jitter(.08);tone(ctx,t,'sine',1900*q,2700*q,.06,.028*v*far,.004);tone(ctx,t+.05,'sine',2600*q,1800*q,.07,.022*v*far,.004);noise(ctx,t,.09,.03*v*far,'bandpass',2400,1600,1.6,.004);return;} // court-shoe squeak
 if(kind==='matchpoint'){for(const at of[0,.8])for(const k of[0,.22])tone(ctx,t+at+k,'sine',62,40,.14,(k?.09:.13)*v,.01); // heartbeat
  if(musicOn())tone(ctx,t+.1,'triangle',a==='rival'?311.13:440,a==='rival'?311.13:440,1.1,.025*v,.3);return;}
 if(kind==='streak'){const n=Math.min(6,Number(a)||3),up=Math.pow(2,(n-3)/12);if(musicOn())[523.25,659.25,783.99,1046.5,1318.5].forEach((hz,i)=>tone(ctx,t+i*.055,'triangle',hz*up,hz*up,i===4?.4:.14,.045*v));applause(ctx,t+.05,.8,.08*v);return;}
 if(kind==='comeback'){if(musicOn()){tone(ctx,t+.25,'triangle',392,392,.18,.035*v,.02);tone(ctx,t+.42,'triangle',523.25,523.25,.3,.035*v,.02);}return;} // warm 'you've got this' after the point sound
 if(kind==='trap'){const far=a==='rival'?.7:1;tone(ctx,t,'sine',(b==='chest'?110:150)*jitter(.05),70,.12,.12*v*far,.015);noise(ctx,t,.08,.04*v*far,'lowpass',500,250,.6,.01);return;} // soft cushion
 if(kind==='goldready'){if(musicOn())[523.25,659.25,783.99,1046.5].forEach((hz,i)=>tone(ctx,t+i*.07,'triangle',hz,hz,.22,.045*v));return;}
 if(kind==='golden'){tone(ctx,t,'triangle',1318.5,1318.5,.35,.05*v,.01);tone(ctx,t+.04,'sine',1975.5,1975.5,.4,.035*v,.01);noise(ctx,t,.4,.05*v,'highpass',3000,5000,.7,.02);return;}
 if(kind==='out'){tone(ctx,t,'sine',660,520,.14,.04*v,.01);tone(ctx,t+.15,'sine',520,392,.18,.035*v,.01);return;} // a gentle 'uh-oh': it is going long
 if(kind==='tire'){tone(ctx,t+.05,'sine',392,262,.38,.03*v,.04);return;} // a falling note as the rival tires
 if(kind==='fake'){noise(ctx,t,.18,.05*v,'bandpass',600,1400,1.2,.02);return;} // a scuff of the sole on the ball
 if(kind==='hold'){tone(ctx,t,'sine',210,150,.05,.05*v,.003);noise(ctx,t,.03,.025*v,'lowpass',900,500,.7);return;} // feet plant: the press is heard at once while the touch waits for the ball
 if(kind==='coach'){tone(ctx,t,'triangle',659.25,659.25,.12,.035*v);tone(ctx,t+.1,'triangle',880,880,.16,.035*v);return;} // the coach's two-note 'look here'
 if(kind==='target'){tone(ctx,t,'triangle',880,880,.16,.06*v);tone(ctx,t+.08,'triangle',1318.5,1318.5,.22,.05*v);return;}
 if(kind==='tempo'){const step=Number(a)||1;if(musicOn())tone(ctx,t,'triangle',BASS[0]*(1+step*.25),BASS[0]*(1+step*.25),.3,.05*v,.02);noise(ctx,t+.05,.6,.04*v,'bandpass',500,800,.9,.2);return;}
 // Nov 8 2026 (tours + chrome): combo chime climbing the C-major pentatonic with the combo step (a second, brighter note for
 // a ×3/×4 touch), a level-up sweep with a crowd-like swell, a soft falling knock when a ball is lost, the new-best fanfare and a UI tap.
 if(kind==='mult'){const mult=Number(a)||1,combo=Math.max(1,Math.min(TENNIS_COMBO_NOTES.length,Number(b)||1)),hz=TENNIS_COMBO_NOTES[combo-1]*jitter(.004);
  if(mult>=2||combo>=2)tone(ctx,t+.11,'triangle',hz,hz,.13,(.028+combo*.006)*v,.004);if(mult>=3)tone(ctx,t+.17,'sine',hz*2,hz*2,.16,.022*v,.004);return;}
 if(kind==='rampup'){[392,523.25,659.25].forEach((hz,i)=>tone(ctx,t+i*.06,'triangle',hz,hz*1.01,.16,.04*v,.006));noise(ctx,t+.04,.7,.05*v,'bandpass',600,1500,.6,.18);return;}
 if(kind==='next'){drum(ctx,t+.5,150,.16,.1*v,.5);drum(ctx,t+.66,200,.14,.09*v,.6);tone(ctx,t+.84,'triangle',659.25,659.25,.1,.04*v);tone(ctx,t+.96,'triangle',880,880,.22,.04*v);haptic([14,30,20]);return;} // endless play: match won, the next opponent walks on (two hand-drum hits, a rising wood-block pair)
 if(kind==='life'){tone(ctx,t+.2,'sine',220,165,.2,.05*v,.01);tone(ctx,t+.36,'sine',165,110,.26,.045*v,.01);return;}
 if(kind==='best'){[523.25,659.25,783.99,1046.5,1318.5].forEach((hz,i)=>tone(ctx,t+i*.07,'triangle',hz,hz,i===4?.5:.15,.05*v));noise(ctx,t+.3,.6,.035*v,'highpass',5000,7000,.7,.05);haptic([14,30,20,30,30]);return;}
 if(kind==='ui'){tone(ctx,t,'sine',880*jitter(.03),660,.05,.035*v,.003);return;}
 if(kind==='net'){
  if(a==='net'){tone(ctx,t,'sine',80,45,.14,.13*v);noise(ctx,t,.22,.06*v,'lowpass',900,300,.7);} // net thud
  else{tone(ctx,t,'sine',1318,1290,.13,.06*v);tone(ctx,t+.005,'triangle',1976,1950,.09,.03*v);} // tape "tick"
  return;
 }
 if(kind==='point'||kind==='match'){
  const you=a==='you',match=kind==='match',rally=Number(b)||0;
  // A steel pan calls the point (two rising notes for yours, one low note against), a three-note run for the match;
  // then a light hand-clap phrase (a rhythm in the music, not a crowd; quieter since Nov 11 2026): longer the longer the rally was.
  if(you){(match?[659.25,783.99,1046.5]:[783.99,1046.5]).forEach((hz,i)=>pan(ctx,t+i*.15,hz,match&&i===2?1.1:.5,.085*v));}
  else pan(ctx,t,match?392:523.25,.55,.06*v);
  applause(ctx,t+(you?.36:.22),Math.min(1,(you?.3:.08)+rally/22+(match?.6:0)),(you?.07:.04)*v);
  if(you&&match&&musicOn())[523.25,659.25,783.99,1046.5].forEach((hz,i)=>pluck(ctx,t+.5+i*.1,hz,i===3?.6:.25,.045*v));
 }
}

/** Hold-to-power wind-up (Oct 26 2026): one triangle voice whose pitch climbs with the charge level, a bright tick
 * as the charge enters the gold SWEET window, and a fast wobble once it is OVERHIT. Haptics: a light tap on press,
 * a pulse at the sweet window, a double buzz at overhit and a thump on a sweet release. Lives only while held;
 * `set` writes AudioParams (no allocation) and `stop` frees the nodes. Muted sound still gives haptics. */
export function tennisChargeVoice(ctx:AudioContext|null){
 const volume=getSoundVolume(),on=!!ctx&&ctx.state==='running'&&isSoundEnabled()&&volume>0&&typeof document!=='undefined'&&!document.hidden;
 let osc:OscillatorNode|null=null,gain:GainNode|null=null,band=0,wobble=0;
 if(on&&ctx&&claim(ctx)){osc=ctx.createOscillator();gain=ctx.createGain();gain.gain.value=.0001;/* a quick tap stops the voice in the same audio quantum it started: stop() cancels the scheduled ramp and the gain falls back to this value (the node default of 1 sent a full-scale burst into the limiter on every tapped serve) */osc.type='triangle';osc.frequency.value=220;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.linearRampToValueAtTime(.045*volume,ctx.currentTime+.04);osc.connect(gain);gain.connect(out(ctx));osc.start();}
 haptic(8);
 return {
  set(level:number,dt:number){
   const next=level>1?2:level>=.8?1:0;
   if(next!==band){band=next;if(next===1){haptic(14);if(on&&ctx)tone(ctx,ctx.currentTime+.005,'sine',1318.5,1318.5,.09,.05*volume);}else if(next===2){haptic([10,30,10]);if(on&&ctx)tone(ctx,ctx.currentTime+.005,'square',180,120,.12,.025*volume);}}
   if(!osc||!ctx)return;wobble+=dt;const hz=220*Math.pow(2,Math.min(1,level)*1.25)*(band===2?1+Math.sin(wobble*44)*.035:1);osc.frequency.setTargetAtTime(hz,ctx.currentTime,.02);
  },
  stop(released:boolean,grade:string){
   if(released&&grade==='sweet')haptic([16,20,22]);else if(released&&grade==='over')haptic([10,40,10]);
   if(!osc||!gain||!ctx)return;const o=osc,g=gain,c=ctx,now=c.currentTime;osc=null;gain=null;g.gain.cancelScheduledValues(now);g.gain.setTargetAtTime(.0001,now,.02);o.stop(now+.09);o.onended=()=>{o.disconnect();g.disconnect();free(c);};
  },
 };
}
