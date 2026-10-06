import {isSoundEnabled,getSoundVolume} from './sound';
import {plungerPull,type PinballState} from './soccerPinball';

/* Futbol Pinball voices: layered, synthesized one-shots on the game's own
 * AudioContext. No assets, no timers, no loops. Every voice self-disconnects
 * on end; a per-context cap bounds polyphony; one short noise buffer is cached
 * per context (garbage-collected with it when the game closes the context).
 * Pitch and level jitter keep repeated hits from sounding machine-gunned, and
 * bumper knock-downs climb a pentatonic scale so a good rally plays a tune. */

type Voices={live:number;noise:AudioBuffer|null;last:Map<string,number>;chain:number;chainAt:number};
const contexts=new WeakMap<AudioContext,Voices>();
const MAX_VOICES=14;
// C-major pentatonic, C5 upward: always consonant however the chain lands.
const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
let lastHaptic=0;

function state(ctx:AudioContext):Voices{let v=contexts.get(ctx);if(!v){v={live:0,noise:null,last:new Map(),chain:0,chainAt:-9};contexts.set(ctx,v);}return v;}
const jitter=(amount:number)=>1+(Math.random()*2-1)*amount;

function tone(ctx:AudioContext,v:Voices,type:OscillatorType,from:number,to:number,at:number,duration:number,peak:number){
 if(v.live>=MAX_VOICES||peak<=0)return;
 const osc=ctx.createOscillator(),gain=ctx.createGain();v.live++;
 osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(peak,at+Math.min(.01,duration*.25));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.02);
 osc.onended=()=>{v.live=Math.max(0,v.live-1);osc.disconnect();gain.disconnect();};
}
function noise(ctx:AudioContext,v:Voices,at:number,duration:number,peak:number,filter:BiquadFilterType,from:number,to=from,q=.8){
 if(v.live>=MAX_VOICES||peak<=0)return;
 if(!v.noise){const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.8),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;v.noise=buffer;}
 const src=ctx.createBufferSource(),biquad=ctx.createBiquadFilter(),gain=ctx.createGain();v.live++;
 src.buffer=v.noise;src.playbackRate.value=jitter(.08);biquad.type=filter;biquad.Q.value=q;biquad.frequency.setValueAtTime(from,at);biquad.frequency.exponentialRampToValueAtTime(Math.max(30,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(peak,at+Math.min(.012,duration*.3));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 src.connect(biquad);biquad.connect(gain);gain.connect(ctx.destination);src.start(at,Math.random()*Math.max(0,.77-duration),duration+.03);
 src.onended=()=>{v.live=Math.max(0,v.live-1);src.disconnect();biquad.disconnect();gain.disconnect();};
}
function arpeggio(ctx:AudioContext,v:Voices,notes:readonly number[],at:number,step:number,peak:number,type:OscillatorType='triangle',hold=.16){
 notes.forEach((hz,i)=>{tone(ctx,v,type,hz,hz*1.004,at+i*step,hold+(i===notes.length-1?.18:0),peak);tone(ctx,v,'sine',hz*2,hz*2,at+i*step,hold*.6,peak*.25);});
}
function haptic(pattern:number|number[]){
 if(typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
 const now=performance.now();if(now-lastHaptic<150)return;
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 lastHaptic=now;navigator.vibrate(pattern);
}

/** Throttle per cue so the same event arriving from two paths (or a rattle of
 * wall contacts) plays once. */
function throttled(v:Voices,cue:string,now:number,gap:number){const last=v.last.get(cue)??-9;if(now-last<gap)return true;v.last.set(cue,now);return false;}

export function playPinballCue(ctx:AudioContext|null,cue:string,s?:PinballState|null){
 if(typeof document!=='undefined'&&document.hidden)return;
 if(!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 if(cue==='goal'||cue==='level')haptic(cue==='goal'?[18,35,28]:[10,30,10]);
 else if(cue==='dazed'||cue==='save'||cue==='nudge'||cue==='attack'||cue==='pb-wallDown'||cue==='pb-block'||cue==='pb-saver'||cue==='pb-modeDone')haptic(12);
 if(!ctx||ctx.state!=='running')return;
 const v=state(ctx),now=ctx.currentTime,vol=volume;
 switch(cue){
  case 'left':case 'right':{
   // Solenoid: a low body thunk plus a bright mechanical click.
   const base=(cue==='left'?142:160)*jitter(.05);
   tone(ctx,v,'triangle',base,base*.45,now,.075,.15*vol);
   noise(ctx,v,now,.022,.05*vol*jitter(.2),'highpass',2600);
   break;
  }
  case 'launch':{
   const power=s?plungerPull(s.plunger):.68;
   noise(ctx,v,now,.22+power*.12,(.05+power*.06)*vol,'bandpass',380,2600*(.6+power*.4),1.2);
   tone(ctx,v,'sine',190*jitter(.04),520+power*380,now,.16,.07*vol);
   tone(ctx,v,'triangle',95,60,now,.09,.1*vol);
   break;
  }
  case 'strike':{
   // Ball off the boot: a rounded "pock" that brightens with contact speed
   // and climbs a step for each alternating-foot combination.
   const speed=Math.min(1,(s?.sfx.flipperV??400)/700),step=Math.max(0,Math.min(4,(s?.combination??1)-1));
   const hz=PENTA[step]*.5*jitter(.03);
   tone(ctx,v,'sine',hz*1.6,hz,now,.07,(.05+.07*speed)*vol);
   noise(ctx,v,now,.03,(.025+.04*speed)*vol,'bandpass',1500,900,1.4);
   break;
  }
  case 'pb-wall':{
   if(throttled(v,cue,now,.045))return;
   const hit=Math.min(1,(s?.sfx.wallV??200)/900),hz=780*jitter(.08);
   tone(ctx,v,'triangle',hz,hz*.6,now,.035,(.012+.04*hit)*vol);
   if(hit>.5)noise(ctx,v,now,.03,.025*hit*vol,'bandpass',2200,1600,2);
   break;
  }
  case 'pb-gate':if(!throttled(v,cue,now,.08))tone(ctx,v,'square',1250*jitter(.05),900,now,.025,.018*vol);break;
  case 'dazed':{
   // Bumper knock-down: pop + ringing note, climbing the scale on a chain.
   v.chain=now-v.chainAt<2.2?Math.min(PENTA.length-1,v.chain+1):0;v.chainAt=now;
   const hz=PENTA[v.chain]*jitter(.01);
   noise(ctx,v,now,.06,.09*vol,'lowpass',2400,500);
   tone(ctx,v,'triangle',hz,hz,now,.2,.08*vol);tone(ctx,v,'sine',hz*1.5,hz*1.5,now+.012,.14,.035*vol);
   tone(ctx,v,'sine',120,55,now,.11,.12*vol);
   break;
  }
  case 'block':
   tone(ctx,v,'triangle',190*jitter(.06),85,now,.1,.11*vol);noise(ctx,v,now,.045,.05*vol,'bandpass',850,600,1.2);break;
  case 'save':{
   // Keeper's gloves: a padded slap and a body thud.
   const hit=Math.min(1,(s?.sfx.keeperV??300)/700);
   noise(ctx,v,now,.08,(.06+.06*hit)*vol,'bandpass',1150*jitter(.06),700,1);
   tone(ctx,v,'sine',150,62,now,.13,(.08+.06*hit)*vol);
   break;
  }
  case 'control':tone(ctx,v,'sine',300*jitter(.04),240,now,.08,.05*vol);noise(ctx,v,now,.04,.025*vol,'lowpass',900);break;
  case 'pass':tone(ctx,v,'sine',340*jitter(.04),430,now,.08,.05*vol);break;
  case 'attack':
   // Readable telegraph: a falling minor third, "watch out".
   tone(ctx,v,'triangle',392,388,now,.09,.07*vol);tone(ctx,v,'triangle',330,326,now+.1,.12,.07*vol);break;
  case 'pb-lit':
   // The goal lights up: quick rising arpeggio, the game's musical sting.
   arpeggio(ctx,v,[523.25,659.25,783.99,1046.5],now,.065,.07*vol);break;
  case 'goal':{
   const corner=s?.cue==='corner',bonus=(s?.lastGoalBonus??0)>0;
   arpeggio(ctx,v,corner?[587.33,739.99,880,1174.66]:[523.25,659.25,783.99,1046.5],now,.085,.085*vol,'triangle',.2);
   tone(ctx,v,'sine',corner?293.66:261.63,corner?293.66:261.63,now+.34,.5,.06*vol);
   if(bonus)arpeggio(ctx,v,[1318.51,1567.98],now+.42,.07,.04*vol,'sine',.12);
   // Crowd swell: wide filtered noise rising then falling, under the fanfare.
   noise(ctx,v,now+.05,.75,.045*vol,'bandpass',500,1400,.5);
   tone(ctx,v,'sine',130,48,now,.24,.13*vol);
   break;
  }
  case 'level':arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5],now+.05,.07,.06*vol);break;
  case 'pb-drain':
   // Soft and kind: a gentle falling glide, no buzz.
   tone(ctx,v,'sine',392,196,now,.45,.065*vol);tone(ctx,v,'sine',110,58,now,.25,.07*vol);noise(ctx,v,now,.3,.02*vol,'lowpass',700,200);break;
  case 'concede':
   tone(ctx,v,'sine',330,165,now,.5,.06*vol);tone(ctx,v,'triangle',196,98,now+.08,.45,.045*vol);break;
  case 'rescue':
   tone(ctx,v,'sine',330,660,now,.24,.07*vol);tone(ctx,v,'sine',1318.51,1318.51,now+.2,.18,.035*vol);break;
  case 'nudge':
   if(throttled(v,cue,now,.12))return;
   tone(ctx,v,'sine',95*jitter(.05),48,now,.14,.15*vol);noise(ctx,v,now,.09,.06*vol,'lowpass',380,150);break;
  case 'pb-whistle':
   // Referee whistle as the next defender jogs on: two short trilled blasts.
   for(const [at,len] of [[0,.13],[.19,.24]] as const){tone(ctx,v,'sine',2350,2310,now+at,len,.025*vol);tone(ctx,v,'sine',2440,2400,now+at,len,.018*vol);}
   break;
  // ---- playfield features -------------------------------------------------
  case 'pb-sling':
   // Kickboard: a springy rubber "thwack" with a short bright tail.
   if(throttled(v,cue,now,.06))return;
   noise(ctx,v,now,.05,.07*vol,'bandpass',1700*jitter(.08),900,1.6);tone(ctx,v,'square',420*jitter(.05),210,now,.05,.035*vol);break;
  case 'pb-cone':{
   // Training cone: hollow plastic "tock", pitch walks a pentatonic step.
   if(throttled(v,cue,now,.05))return;
   v.chain=now-v.chainAt<1.6?(v.chain+1)%5:0;v.chainAt=now;const hz=PENTA[v.chain]*.75*jitter(.01);
   tone(ctx,v,'triangle',hz,hz*.92,now,.09,.06*vol);noise(ctx,v,now,.025,.03*vol,'highpass',3000);break;
  }
  case 'pb-drop':tone(ctx,v,'sine',160*jitter(.06),70,now,.12,.1*vol);noise(ctx,v,now,.06,.05*vol,'lowpass',800,300);break;
  case 'pb-wallDown':
   tone(ctx,v,'sine',140,55,now,.2,.12*vol);arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5],now+.08,.055,.06*vol);break;
  case 'pb-flag':{
   // Corner flag: a cheerful ping, a step higher for every letter lit.
   const n=Math.min(4,(s?.table.flags.toString(2).split('1').length??1)-1);const hz=PENTA[2+n]*jitter(.01);
   tone(ctx,v,'sine',hz,hz,now,.16,.06*vol);tone(ctx,v,'sine',hz*2,hz*2,now+.01,.08,.02*vol);break;
  }
  case 'pb-word':arpeggio(ctx,v,[587.33,739.99,880,1174.66],now,.07,.065*vol);break;
  case 'pb-lane':if(!throttled(v,cue,now,.1))tone(ctx,v,'sine',1046.5*jitter(.02),1046.5,now,.07,.04*vol);break;
  case 'pb-crest':arpeggio(ctx,v,[783.99,987.77,1174.66],now,.06,.06*vol,'sine');break;
  case 'pb-skill':arpeggio(ctx,v,[659.25,783.99,1046.5,1318.51,1567.98],now,.05,.06*vol);break;
  case 'pb-spin':if(!throttled(v,cue,now,.045))tone(ctx,v,'square',1900*jitter(.06),1700,now,.018,.012*vol);break;
  case 'pb-dugout':
   // The ball drops into the dugout: a wooden knock and a soft hum.
   tone(ctx,v,'triangle',220,110,now,.12,.09*vol);noise(ctx,v,now,.08,.04*vol,'lowpass',600,200);tone(ctx,v,'sine',330,330,now+.12,.35,.03*vol);break;
  case 'pb-mode':
   for(const [at,len] of [[0,.11],[.15,.11],[.3,.3]] as const){tone(ctx,v,'sine',2350,2310,now+at,len,.022*vol);tone(ctx,v,'sine',2440,2400,now+at,len,.016*vol);}
   arpeggio(ctx,v,[523.25,659.25,783.99],now+.5,.06,.05*vol);break;
  case 'pb-modeDone':arpeggio(ctx,v,[523.25,659.25,783.99,1046.5,1318.51],now,.07,.075*vol,'triangle',.18);noise(ctx,v,now+.05,.6,.04*vol,'bandpass',500,1400,.5);break;
  case 'pb-modeEnd':tone(ctx,v,'sine',523.25,392,now,.3,.045*vol);break;
  case 'pb-block':
   // Great block: a solid boot thump, then a rising "go!" for the fast break.
   tone(ctx,v,'sine',110,50,now,.14,.14*vol);noise(ctx,v,now,.06,.07*vol,'bandpass',900,500,1.2);arpeggio(ctx,v,[659.25,880,1174.66],now+.1,.05,.055*vol);break;
  case 'pb-saver':tone(ctx,v,'sine',220,880,now,.2,.08*vol);noise(ctx,v,now,.05,.05*vol,'bandpass',1400,900);break;
  case 'pb-final':
   for(const [at,len] of [[0,.4]] as const){tone(ctx,v,'sine',2350,2310,now+at,len,.025*vol);tone(ctx,v,'sine',2440,2400,now+at,len,.018*vol);}
   arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5,1318.51],now+.45,.07,.07*vol,'triangle',.2);noise(ctx,v,now+.4,.9,.05*vol,'bandpass',500,1400,.5);break;
  case 'pb-over':arpeggio(ctx,v,[783.99,659.25,523.25,392],now+.15,.12,.05*vol,'sine',.22);break;
  default:tone(ctx,v,'sine',240*jitter(.05),180,now,.06,.04*vol);
 }
}
