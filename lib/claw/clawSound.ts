/**
 * Claw Club sounds (Nov 21 2026), synthesised with Web Audio (no files): a motor hum that follows the carriage's speed, the cable
 * whirr while the claw drops or lifts, clicks, the prong clack, toy thumps, the chute clunk, the flap tick, the coin and the win
 * tune. The context opens on the first tap (Play), suspends when the machine closes, and is closed on dispose. Muted with the room.
 */
type Ctx=AudioContext;
export function createClawSound(){
 let ctx:Ctx|null=null,muted=false,master:GainNode|null=null,motor:GainNode|null=null,motorOsc:OscillatorNode|null=null,whirr:GainNode|null=null,whirrOsc:OscillatorNode|null=null,noise:AudioBuffer|null=null;
 function open(){
  if(ctx||typeof window==='undefined')return ctx;
  const C=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!C)return null;
  try{ctx=new C();}catch{return null;}
  master=ctx.createGain();master.gain.value=muted?0:.5;master.connect(ctx.destination);
  // motor: a low buzzy saw through a lowpass, gain driven by speed
  motorOsc=ctx.createOscillator();motorOsc.type='sawtooth';motorOsc.frequency.value=62;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;
  motor=ctx.createGain();motor.gain.value=0;motorOsc.connect(lp).connect(motor).connect(master);motorOsc.start();
  // cable whirr: a triangle a little higher, with a fast wobble
  whirrOsc=ctx.createOscillator();whirrOsc.type='triangle';whirrOsc.frequency.value=210;const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=23;lfoGain.gain.value=18;lfo.connect(lfoGain).connect(whirrOsc.frequency);lfo.start();
  whirr=ctx.createGain();whirr.gain.value=0;whirrOsc.connect(whirr).connect(master);whirrOsc.start();
  const n=ctx.sampleRate*.25|0;noise=ctx.createBuffer(1,n,ctx.sampleRate);const d=noise.getChannelData(0);let s=7;for(let i=0;i<n;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=s/2147483648-1;}
  return ctx;
 }
 const now=()=>ctx!.currentTime;
 function burst(at:number,dur:number,freq:number,q:number,gain:number,type:BiquadFilterType='bandpass'){
  if(!ctx||!noise||!master)return;const src=ctx.createBufferSource();src.buffer=noise;const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=ctx.createGain();
  g.gain.setValueAtTime(gain,at);g.gain.exponentialRampToValueAtTime(.0005,at+dur);src.connect(f).connect(g).connect(master);src.start(at);src.stop(at+dur+.02);
 }
 function tone(at:number,dur:number,freq:number,gain:number,type:OscillatorType='sine',to?:number){
  if(!ctx||!master)return;const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,at);if(to)o.frequency.exponentialRampToValueAtTime(to,at+dur);
  const g=ctx.createGain();g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.005);g.gain.exponentialRampToValueAtTime(.0005,at+dur);o.connect(g).connect(master);o.start(at);o.stop(at+dur+.02);
 }
 return {
  unlock(){const c=open();if(c&&c.state==='suspended')void c.resume().catch(()=>{});},
  suspend(){if(ctx&&ctx.state==='running')void ctx.suspend().catch(()=>{});},
  setMuted(v:boolean){muted=v;if(master&&ctx)master.gain.setTargetAtTime(v?0:.5,ctx.currentTime,.03);},
  /** Continuous layers, called each frame while the machine is zoomed: carriage speed 0…1, cable speed 0…1. */
  levels(carriage:number,cable:number){if(!ctx||!motor||!whirr||ctx.state!=='running')return;const t=now();
   motor.gain.setTargetAtTime(Math.min(1,carriage)*.16,t,.05);motorOsc!.frequency.setTargetAtTime(58+carriage*22,t,.08);
   whirr.gain.setTargetAtTime(Math.min(1,cable)*.07,t,.04);whirrOsc!.frequency.setTargetAtTime(170+cable*90,t,.06);},
  click(v=.5){if(!ctx)return;burst(now(),.03,2600,4,.18*v);},
  bump(v=.5){if(!ctx)return;const t=now();tone(t,.09,110,.25*v,'square',70);burst(t,.05,900,2,.18*v);},
  clack(v=1){if(!ctx)return;const t=now();burst(t,.035,3400,6,.3*v);burst(t+.045,.03,2900,6,.22*v);tone(t,.05,1800,.05*v,'square',900);},
  thump(v=.5){if(!ctx)return;const t=now();tone(t,.16,140,.35*v,'sine',60);burst(t,.06,500,1.2,.18*v,'lowpass');},
  clunk(v=.7){if(!ctx)return;const t=now();tone(t,.22,95,.45*v,'sine',48);burst(t,.09,320,1,.3*v,'lowpass');burst(t+.01,.04,1500,3,.12*v);},
  flap(v=.5){if(!ctx)return;burst(now(),.05,1300,5,.2*v);},
  coin(){if(!ctx)return;const t=now();tone(t,.12,2400,.12,'triangle');tone(t+.09,.18,3100,.1,'triangle');burst(t+.22,.06,700,2,.15);},
  win(){if(!ctx)return;const t=now();[523,659,784,1047,784,1047].forEach((f,i)=>tone(t+i*.11,.24,f,.13,'square'));},
  miss(){if(!ctx)return;const t=now();tone(t,.22,392,.1,'triangle',330);tone(t+.2,.3,330,.09,'triangle',262);},
  dispose(){try{motorOsc?.stop();whirrOsc?.stop();}catch{/* already stopped */}void ctx?.close().catch(()=>{});ctx=null;master=motor=whirr=null;motorOsc=whirrOsc=null;},
 };
}
export type ClawSound=ReturnType<typeof createClawSound>;
