/**
 * Clear the Box sound (Nov 17 2026): studs on grass, a quick dust whoosh for a run, a body bump and a sharp referee whistle for a
 * foul, a clock tick in the last five seconds, a snare roll and crowd swell for a cleared box; synthesised, no files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/clearbox-core.cjs greps this wiring;
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed there, so nothing
 * plays before a gesture. No loops or timers: every cue is a one-shot (the shell calls tick() once a second at most).
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** A clean-box streak climbs this scale (semitones above C5). */
export const BOX_SCALE=[0,2,4,7,9,12,14,16,19] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
export type ClearboxAudio=ReturnType<typeof createClearboxAudio>;
export function createClearboxAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.9;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.12;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.6);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=2468013;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>24)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>24)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.4,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** A plucked note: a sine and a quiet octave partial. */
 const pluck=(f:number,at:number,gain=.18,dur=.24)=>{tone('sine',f,f,at,dur,gain,.003);tone('triangle',f*2,f*2,at,dur*.4,gain*.3,.002);};
 /** A pea whistle: two close sines wobbled by a fast square. long: the full-time blast. */
 function whistle(at:number,dur:number,gain:number){if(!ctx||!master)return;const t=ctx.currentTime+at,o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
  o1.type='sine';o2.type='sine';o1.frequency.value=2900;o2.frequency.value=3240;lfo.type='square';lfo.frequency.value=42;lg.gain.value=170;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+.012);g.gain.setValueAtTime(gain*vol(),t+dur-.06);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o1.connect(g);o2.connect(g);g.connect(master);o1.start(t);o2.start(t);lfo.start(t);o1.stop(t+dur+.03);o2.stop(t+dur+.03);lfo.stop(t+dur+.03);
  o1.onended=()=>{voices-=2;o1.disconnect();o2.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};}
 return {
  unlock,
  get context(){return ctx;},
  /** A bean sprints out: studs scuff, a dust whoosh that is longer for a longer lane, a rising pluck. */
  run(lane:number,count:number){if(!on())return;const d=.12+Math.min(6,lane)*.03;burst('bandpass',2400,1.4,0,.035,.2);burst('bandpass',900,.7,.01,d,.18,3600);
   pluck(hz(BOX_SCALE[Math.min(BOX_SCALE.length-1,count%BOX_SCALE.length)]),.02,.14,.2);},
  /** A blocked run: a body bump (low thump + slap) and a short sharp whistle. */
  foul(){if(!on())return;tone('sine',140,60,0,.16,.5,.002);burst('lowpass',1300,.8,0,.08,.4);whistle(.08,.28,.14);},
  /** A turner turns: a light felt click. */
  turn(){if(!on())return;tone('triangle',1250,1500,0,.04,.05,.002);},
  /** The last seconds of a box: a wood tick (higher in the last two). */
  tick(secs:number){if(!on())return;tone('square',secs<=2?1600:1200,secs<=2?1600:1200,0,.025,.05,.001);},
  /** Box cleared: a snare roll, a rising chord that climbs with the clean streak, a crowd swell. */
  box(clean:number){if(!on())return;const lift=Math.min(BOX_SCALE.length-4,Math.max(0,clean-1));for(let i=0;i<6;i++)burst('highpass',3200,.7,i*.03,.03,.14);
   for(let i=0;i<4;i++)pluck(hz(BOX_SCALE[lift+i]),.16+i*.06,.2,.36);burst('bandpass',800,.5,.1,.8,.12);tone('triangle',130,80,.16,.2,.3);},
  /** A whistle won back: two bright notes and a short peep. */
  whistleBack(){if(!on())return;pluck(hz(12),0,.16,.2);pluck(hz(19),.08,.16,.3);whistle(.18,.12,.08);},
  /** A new box slides in: a soft whoosh. */
  slide(){if(!on())return;burst('bandpass',500,.6,0,.3,.12,1800);},
  /** The run is over: the full-time whistle, three blasts, then a low thud. */
  over(){if(!on())return;whistle(0,.22,.15);whistle(.3,.22,.15);whistle(.6,.6,.15);tone('sine',120,40,.6,.5,.4,.003);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)pluck(hz([0,4,7,12,16][i]),.5+i*.09,.22,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;pluck(hz(12,392),0,.12,.09);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
