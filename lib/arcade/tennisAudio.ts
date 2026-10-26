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
/** A short voiced "hup!" (a buzzy source through one vowel formant): power shots get a little effort sound. */
function voice(ctx:AudioContext,at:number,f0:number,f1:number,formant:number,dur:number,vol:number){
 if(vol<=0||!claim(ctx))return;const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();osc.type='sawtooth';
 osc.frequency.setValueAtTime(f0,at);osc.frequency.exponentialRampToValueAtTime(f1,at+dur);filter.type='bandpass';filter.Q.value=4;filter.frequency.setValueAtTime(formant,at);filter.frequency.exponentialRampToValueAtTime(formant*.75,at+dur);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(vol,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+dur);
 osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+dur+.02);osc.onended=()=>{free(ctx);osc.disconnect();filter.disconnect();gain.disconnect();};
}
/** Rally pad chords (A minor family), one per 4 touches from the 8th: the long rally gets its own music. */
const PAD=[[220,261.63,329.63],[196,246.94,293.66],[174.61,220,261.63],[164.81,207.65,246.94]];
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
 if(typeof document==='undefined'||document.hidden||!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 const [,kind,a='',b='',c='',d='0',e='0',f='0',g='0']=cue.split(':');
 if(kind==='kick'&&a==='you'&&(b==='perfect'||c==='slam'||c==='scissor'||c==='shark'||c==='bicycle'))haptic(b==='perfect'?[9,24,12]:14);
 if(kind==='golden'||kind==='target')haptic(kind==='golden'?[12,30,20]:10);
 if((kind==='point'||kind==='match')&&a==='you')haptic(kind==='match'?[18,35,28,35,40]:[18,35,28]);
 if(!ctx||ctx.state!=='running')return;
 const t=ctx.currentTime+.005,v=volume;
 if(kind==='kick'){
  const side=a,grade=b,shot=c,rally=Number(d)||0,power=Number(e)||.4,far=side==='rival'?.72:1,p=jitter(.06)*(side==='rival'?.92:1);
  const dull=grade==='early'||grade==='late'||grade==='stretched'||grade==='heavy'||shot==='dive',streak=Number(f)||0,volley=g==='1';
  if(shot==='chest'){tone(ctx,t,'sine',118*p,68*p,.14,(dull?.1:.14)*v*far,.012);noise(ctx,t,.09,.05*v*far,'lowpass',420,260,.6,.01);} // soft cushioned chest thud
  else if(shot==='header'){tone(ctx,t,'sine',260*p,140*p,.11,.16*v*far);noise(ctx,t,.04,.05*v*far,'bandpass',1800,1200,1.2);}
  else{
   const heavy=shot==='slam'||shot==='scissor'||shot==='shark'||shot==='bicycle';
   tone(ctx,t,'sine',(heavy?135:dull?115:160)*p,(heavy?38:dull?55:62)*p,heavy?.2:.1,(heavy?.24:.17+power*.06)*v*far*jitter(.1));
   noise(ctx,t,dull?.07:.03,(dull?.07:.06)*v*far,dull?'lowpass':'bandpass',dull?700:2600*p,dull?400:1800,dull?.7:1.4);
   if(heavy)noise(ctx,t+.01,.28,.07*v*far,'bandpass',900,2600,.9,.03); // whoosh
   if(!heavy&&power>.76)noise(ctx,t,.06,Math.min(.1,(power-.7)*.4)*v*far,'highpass',2600,3400,.8); // a wound-up strike cracks louder with its power
  }
  // Perfect chime climbs a whole step per touch of a perfect streak (capped), so rhythm is audible.
  if(side==='you'&&grade==='perfect'){const up=Math.pow(2,Math.min(4,Math.max(0,streak-1))*2/12);tone(ctx,t+.03,'triangle',1046.5*up,1046.5*up,.16,.055*v);tone(ctx,t+.085,'triangle',1568*up,1568*up,.2,.05*v);}
  // Heavy touch: the ball skids off the boot (a longer scuff). Clean volley: a crisp, high snap.
  if(side==='you'&&grade==='heavy')noise(ctx,t+.02,.16,.05*v,'bandpass',900,500,1,.01);
  if(side==='you'&&volley)noise(ctx,t,.035,.05*v,'highpass',3200,3200,.9);
  // Adaptive rally bassline: the exchange itself plays the music, and it climbs as the rally grows.
  if(rally>=3&&musicOn()){const step=(rally-3)%BASS.length,octave=rally>=11?2:1;tone(ctx,t,'triangle',BASS[step]*octave,BASS[step]*octave,.26,.05*v,.02);if(rally>=8)tone(ctx,t+.01,'sine',BASS[step]*octave*1.5,BASS[step]*octave*1.5,.22,.022*v,.02);}
  // Effort voice on power shots and a rising whoosh under a lob (the ball climbs, so does the sound).
  if(c!=='drop'&&(power>.78||shot==='slam'||shot==='scissor'||shot==='bicycle'||shot==='shark'))voice(ctx,t+.005,(side==='rival'?190:250)*p,(side==='rival'?150:200)*p,side==='rival'?650:800,.11,.045*v*far);
  if(shot==='lob')noise(ctx,t+.02,.5,.035*v*far,'bandpass',450,1700,1.3,.12);
  // Pad chord every 4th touch from the 8th: a slow swell under the bassline.
  if(rally>=8&&rally%4===0&&musicOn()){const chord=PAD[(rally/4-2)%PAD.length];chord.forEach((hz,i)=>tone(ctx,t+i*.02,'sine',hz,hz,1.3,.016*v,.18));}
  // Crowd leans in as the rally gets long.
  if(rally>=6)noise(ctx,t+.05,.55,Math.min(.05,.012+(rally-6)*.004)*v,'bandpass',550+Math.min(rally,20)*12,700,.7,.18);
  if(rally>=5&&rally%5===0)noise(ctx,t+.08,.8,.06*v,'bandpass',420,760,1.1,.25); // "ooooh"
  return;
 }
 if(kind==='bounce'){const i=Math.max(.2,Number(a)||.4),far=b==='rival'?.7:1,rally=Number(d)||0;
  if(rally>=6&&musicOn())noise(ctx,t+.01,.035,(rally>=12?.03:.022)*v,'highpass',7000,7000,.7,.002);/* hi-hat on the bounce: the rally keeps the beat */if(c==='sand'){tone(ctx,t,'sine',70*jitter(.08),45,.09,.08*i*v*far);noise(ctx,t,.12,.05*i*v*far,'lowpass',900,300,.6);return;}tone(ctx,t,'sine',95*jitter(.08),55,.07,.1*i*v*far);noise(ctx,t,.025,.03*i*v*far,'highpass',1500);return;}
 if(kind==='skid'){const far=a==='rival'?.6:1,q=jitter(.08);tone(ctx,t,'sine',1900*q,2700*q,.06,.028*v*far,.004);tone(ctx,t+.05,'sine',2600*q,1800*q,.07,.022*v*far,.004);noise(ctx,t,.09,.03*v*far,'bandpass',2400,1600,1.6,.004);return;} // court-shoe squeak
 if(kind==='matchpoint'){for(const at of[0,.8])for(const k of[0,.22])tone(ctx,t+at+k,'sine',62,40,.14,(k?.09:.13)*v,.01); // heartbeat
  noise(ctx,t,.9,.03*v,'highpass',2600,1800,.6,.15);if(musicOn())tone(ctx,t+.1,'triangle',a==='rival'?311.13:440,a==='rival'?311.13:440,1.1,.025*v,.3);return;} // the crowd hushes
 if(kind==='streak'){const n=Math.min(6,Number(a)||3),up=Math.pow(2,(n-3)/12);if(musicOn())[523.25,659.25,783.99,1046.5,1318.5].forEach((hz,i)=>tone(ctx,t+i*.055,'triangle',hz*up,hz*up,i===4?.4:.14,.045*v));noise(ctx,t+.05,1,.07*v,'bandpass',1200,1700,.5,.06);return;}
 if(kind==='comeback'){if(musicOn()){tone(ctx,t+.25,'triangle',392,392,.18,.035*v,.02);tone(ctx,t+.42,'triangle',523.25,523.25,.3,.035*v,.02);}return;} // warm 'you've got this' after the point sound
 if(kind==='trap'){const far=a==='rival'?.7:1;tone(ctx,t,'sine',(b==='chest'?110:150)*jitter(.05),70,.12,.12*v*far,.015);noise(ctx,t,.08,.04*v*far,'lowpass',500,250,.6,.01);return;} // soft cushion
 if(kind==='goldready'){if(musicOn())[523.25,659.25,783.99,1046.5].forEach((hz,i)=>tone(ctx,t+i*.07,'triangle',hz,hz,.22,.045*v));return;}
 if(kind==='golden'){tone(ctx,t,'triangle',1318.5,1318.5,.35,.05*v,.01);tone(ctx,t+.04,'sine',1975.5,1975.5,.4,.035*v,.01);noise(ctx,t,.4,.05*v,'highpass',3000,5000,.7,.02);return;}
 if(kind==='out'){tone(ctx,t,'sine',660,520,.14,.04*v,.01);tone(ctx,t+.15,'sine',520,392,.18,.035*v,.01);return;} // a gentle 'uh-oh': it is going long
 if(kind==='tire'){noise(ctx,t,.7,.05*v,'bandpass',480,760,1,.2);tone(ctx,t+.05,'sine',392,262,.38,.03*v,.04);return;} // the crowd 'ooh' as the rival tires
 if(kind==='fake'){noise(ctx,t,.18,.05*v,'bandpass',600,1400,1.2,.02);return;} // a scuff of the sole on the ball
 if(kind==='hold'){tone(ctx,t,'sine',210,150,.05,.05*v,.003);noise(ctx,t,.03,.025*v,'lowpass',900,500,.7);return;} // feet plant: the press is heard at once while the touch waits for the ball
 if(kind==='coach'){tone(ctx,t,'triangle',659.25,659.25,.12,.035*v);tone(ctx,t+.1,'triangle',880,880,.16,.035*v);return;} // the coach's two-note 'look here'
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

/** Hold-to-power wind-up (Oct 26 2026): one triangle voice whose pitch climbs with the charge level, a bright tick
 * as the charge enters the gold SWEET window, and a fast wobble once it is OVERHIT. Haptics: a light tap on press,
 * a pulse at the sweet window, a double buzz at overhit and a thump on a sweet release. Lives only while held;
 * `set` writes AudioParams (no allocation) and `stop` frees the nodes. Muted sound still gives haptics. */
export function tennisChargeVoice(ctx:AudioContext|null){
 const volume=getSoundVolume(),on=!!ctx&&ctx.state==='running'&&isSoundEnabled()&&volume>0&&typeof document!=='undefined'&&!document.hidden;
 let osc:OscillatorNode|null=null,gain:GainNode|null=null,band=0,wobble=0;
 if(on&&ctx&&claim(ctx)){osc=ctx.createOscillator();gain=ctx.createGain();osc.type='triangle';osc.frequency.value=220;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.linearRampToValueAtTime(.045*volume,ctx.currentTime+.04);osc.connect(gain);gain.connect(ctx.destination);osc.start();}
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
