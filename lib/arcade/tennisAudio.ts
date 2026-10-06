import {isSoundEnabled,getSoundVolume} from '../games/sound';

/** Futbol Tennis sound: synthesized one-shots on the game's own AudioContext.
 * No assets, no timers and no loops. Every voice is scheduled at the event and
 * disconnects itself when it ends. Layers:
 * - a touch sound for each contact grade (perfect rings, an early or late touch sounds dull);
 * - bounce, net thud and net-cord (tape) ping;
 * - a crowd that grows with rally length (murmur, gasp, cheer, applause);
 * - an adaptive bassline: from the 3rd touch, each touch plays the next note. */
const noiseBuffers=new WeakMap<AudioContext,AudioBuffer>(),voices=new WeakMap<AudioContext,number>();
const MAX_VOICES=14;
const BASS=[110,130.81,146.83,164.81,196,164.81,146.83,130.81]; // A minor pentatonic walk
let lastHaptic=0;

function musicOn(){try{return localStorage.getItem('fi2-music-enabled')!=='false';}catch{return true;}}
function noiseBuffer(ctx:AudioContext){let b=noiseBuffers.get(ctx);if(!b){b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseBuffers.set(ctx,b);}return b;}
const jitter=(amount:number)=>1+(Math.random()*2-1)*amount;
function claim(ctx:AudioContext){const n=voices.get(ctx)??0;if(n>=MAX_VOICES)return false;voices.set(ctx,n+1);return true;}
function free(ctx:AudioContext){voices.set(ctx,Math.max(0,(voices.get(ctx)??1)-1));}

function tone(ctx:AudioContext,at:number,type:OscillatorType,f0:number,f1:number,dur:number,vol:number,attack=.006){
 if(vol<=0||!claim(ctx))return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;
 osc.frequency.setValueAtTime(f0,at);if(f1!==f0)osc.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+dur+.02);osc.onended=()=>{free(ctx);osc.disconnect();gain.disconnect();};
}
function noise(ctx:AudioContext,at:number,dur:number,vol:number,type:BiquadFilterType,f0:number,f1=f0,q=.8,attack=.004){
 if(vol<=0||!claim(ctx))return;const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=noiseBuffer(ctx);filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(f0,at);if(f1!==f0)filter.frequency.exponentialRampToValueAtTime(f1,at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(at,Math.random()*.6,dur+.05);src.onended=()=>{free(ctx);src.disconnect();filter.disconnect();gain.disconnect();};
}
function haptic(pattern:number|number[]){
 const now=performance.now();if(now-lastHaptic<150||typeof navigator.vibrate!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;lastHaptic=now;navigator.vibrate(pattern);
}

/** cue grammar (from tennisFeel):
 *  tennis:kick:<side>:<grade|serve>:<shot>:<rally>:<power>
 *  tennis:bounce:<intensity>:<half> · tennis:net:<net|over|back>
 *  tennis:point:<winner>:<rally>:<kind> · tennis:match:<winner>:<rally>:<kind>
 *  tennis:trap:<side>:<chest|thigh> · tennis:golden:<shot> · tennis:goldready · tennis:fake · tennis:target · tennis:tempo:<step> */
export function tennisSound(ctx:AudioContext|null,cue:string){
 if(typeof document==='undefined'||document.hidden||!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 const [,kind,a='',b='',c='',d='0',e='0']=cue.split(':');
 if(kind==='kick'&&a==='you'&&(b==='perfect'||c==='slam'||c==='scissor'||c==='shark'||c==='bicycle'))haptic(b==='perfect'?[9,24,12]:14);
 if(kind==='golden'||kind==='target')haptic(kind==='golden'?[12,30,20]:10);
 if((kind==='point'||kind==='match')&&a==='you')haptic(kind==='match'?[18,35,28,35,40]:[18,35,28]);
 if(!ctx||ctx.state!=='running')return;
 const t=ctx.currentTime+.005,v=volume;
 if(kind==='kick'){
  const side=a,grade=b,shot=c,rally=Number(d)||0,power=Number(e)||.4,far=side==='rival'?.72:1,p=jitter(.06)*(side==='rival'?.92:1);
  const dull=grade==='early'||grade==='late'||grade==='stretched'||shot==='dive';
  if(shot==='chest'){tone(ctx,t,'sine',118*p,68*p,.14,(dull?.1:.14)*v*far,.012);noise(ctx,t,.09,.05*v*far,'lowpass',420,260,.6,.01);} // soft cushioned chest thud
  else if(shot==='header'){tone(ctx,t,'sine',260*p,140*p,.11,.16*v*far);noise(ctx,t,.04,.05*v*far,'bandpass',1800,1200,1.2);}
  else{
   const heavy=shot==='slam'||shot==='scissor'||shot==='shark'||shot==='bicycle';
   tone(ctx,t,'sine',(heavy?135:dull?115:160)*p,(heavy?38:dull?55:62)*p,heavy?.2:.1,(heavy?.24:.17+power*.06)*v*far*jitter(.1));
   noise(ctx,t,dull?.07:.03,(dull?.07:.06)*v*far,dull?'lowpass':'bandpass',dull?700:2600*p,dull?400:1800,dull?.7:1.4);
   if(heavy)noise(ctx,t+.01,.28,.07*v*far,'bandpass',900,2600,.9,.03); // whoosh
  }
  if(side==='you'&&grade==='perfect'){tone(ctx,t+.03,'triangle',1046.5,1046.5,.16,.055*v);tone(ctx,t+.085,'triangle',1568,1568,.2,.05*v);}
  // Adaptive rally bassline: the exchange itself plays the music, and it climbs as the rally grows.
  if(rally>=3&&musicOn()){const step=(rally-3)%BASS.length,octave=rally>=11?2:1;tone(ctx,t,'triangle',BASS[step]*octave,BASS[step]*octave,.26,.05*v,.02);if(rally>=8)tone(ctx,t+.01,'sine',BASS[step]*octave*1.5,BASS[step]*octave*1.5,.22,.022*v,.02);}
  // Crowd leans in as the rally gets long.
  if(rally>=6)noise(ctx,t+.05,.55,Math.min(.05,.012+(rally-6)*.004)*v,'bandpass',550+Math.min(rally,20)*12,700,.7,.18);
  if(rally>=5&&rally%5===0)noise(ctx,t+.08,.8,.06*v,'bandpass',420,760,1.1,.25); // "ooooh"
  return;
 }
 if(kind==='bounce'){const i=Math.max(.2,Number(a)||.4),far=b==='rival'?.7:1;if(c==='sand'){tone(ctx,t,'sine',70*jitter(.08),45,.09,.08*i*v*far);noise(ctx,t,.12,.05*i*v*far,'lowpass',900,300,.6);return;}tone(ctx,t,'sine',95*jitter(.08),55,.07,.1*i*v*far);noise(ctx,t,.025,.03*i*v*far,'highpass',1500);return;}
 if(kind==='trap'){const far=a==='rival'?.7:1;tone(ctx,t,'sine',(b==='chest'?110:150)*jitter(.05),70,.12,.12*v*far,.015);noise(ctx,t,.08,.04*v*far,'lowpass',500,250,.6,.01);return;} // soft cushion
 if(kind==='goldready'){if(musicOn())[523.25,659.25,783.99,1046.5].forEach((hz,i)=>tone(ctx,t+i*.07,'triangle',hz,hz,.22,.045*v));return;}
 if(kind==='golden'){tone(ctx,t,'triangle',1318.5,1318.5,.35,.05*v,.01);tone(ctx,t+.04,'sine',1975.5,1975.5,.4,.035*v,.01);noise(ctx,t,.4,.05*v,'highpass',3000,5000,.7,.02);return;}
 if(kind==='fake'){noise(ctx,t,.18,.05*v,'bandpass',600,1400,1.2,.02);return;} // a scuff of the sole on the ball
 if(kind==='target'){tone(ctx,t,'triangle',880,880,.16,.06*v);tone(ctx,t+.08,'triangle',1318.5,1318.5,.22,.05*v);return;}
 if(kind==='tempo'){const step=Number(a)||1;if(musicOn())tone(ctx,t,'triangle',BASS[0]*(1+step*.25),BASS[0]*(1+step*.25),.3,.05*v,.02);noise(ctx,t+.05,.6,.04*v,'bandpass',500,800,.9,.2);return;}
 if(kind==='net'){
  if(a==='net'){tone(ctx,t,'sine',80,45,.14,.13*v);noise(ctx,t,.22,.06*v,'lowpass',900,300,.7);noise(ctx,t+.12,.6,.035*v,'bandpass',380,300,1,.12);} // thud, then a disappointed murmur
  else{tone(ctx,t,'sine',1318,1290,.13,.06*v);tone(ctx,t+.005,'triangle',1976,1950,.09,.03*v);noise(ctx,t+.06,.7,.055*v,'bandpass',360,680,1.2,.2);} // tape "tick", crowd gasp
  return;
 }
 if(kind==='point'||kind==='match'){
  const you=a==='you',rally=Number(b)||0,match=kind==='match',lift=Math.min(1,.45+rally*.05);
  if(you){noise(ctx,t,match?1.6:.9,(match?.1:.07)*lift*v,'bandpass',1100,1500,.5,.08);
   const notes=match?[523.25,659.25,783.99,1046.5]:[523.25,659.25,783.99];if(musicOn())notes.forEach((hz,i)=>tone(ctx,t+i*.09,'triangle',hz,hz,match&&i===notes.length-1?.5:.18,.05*v));
   if(match)for(let i=0;i<12;i++)noise(ctx,t+.2+Math.random()*1.3,.05,.05*v,'bandpass',1800+Math.random()*900,1600,1.5,.002); // applause
  }else{noise(ctx,t,.7,.045*lift*v,'bandpass',700,380,1,.1);if(musicOn())[392,329.63].forEach((hz,i)=>tone(ctx,t+i*.14,'triangle',hz,hz,.2,.035*v));}
 }
}
