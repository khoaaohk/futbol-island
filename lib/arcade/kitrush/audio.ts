/**
 * Kit Rush sound (Nov 10 2026): hand percussion and mallets for the comic world, synthesised, no audio files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination. The limiter is connected to the
 * destination only (never back into itself or the master: tests/kitrush-core.cjs greps this wiring, and
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed there, so
 * nothing plays before a gesture. No loops or timers: every cue is a one-shot that frees its nodes when it ends.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

const SCALE=[0,2,4,7,9,12,14,16,19,21,24];// major pentatonic steps: a swipe climbs it
const hz=(semi:number,base=392)=>base*Math.pow(2,semi/12);
export type KitRushAudio=ReturnType<typeof createKitRushAudio>;
export function createKitRushAudio(){
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
   const len=Math.floor(ctx.sampleRate*.5);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=1234567;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>22)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>22)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*7.3)%.3,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** Marimba-like bar: sine + a quiet 4th partial, quick decay. */
 const bar=(f:number,at:number,gain=.2,dur=.28)=>{tone('sine',f,f,at,dur,gain,.003);tone('sine',f*3.98,f*3.98,at,dur*.35,gain*.28,.002);};
 return {
  unlock,
  get context(){return ctx;},
  /** A kit item leaves the bag: a soft skin "whup", pitched by where it starts (0-100). */
  toss(x:number){if(!on())return;tone('sine',150+x*1.1,95+x*.5,0,.11,.1,.006);burst('lowpass',900,.6,0,.05,.035);},
  /** Struck: leather crack + wood block; `place` (1, 2, 3 ...) climbs the scale through a swipe. */
  slice(place:number,golden=false){if(!on())return;const f=hz(SCALE[Math.min(SCALE.length-1,Math.max(0,place-1))]);
   burst('bandpass',2600,1.1,0,.045,.34);tone('triangle',190,70,0,.09,.3,.002);bar(f*(golden?2:1),.005,golden?.2:.17,golden?.34:.2);
   if(golden)tone('sine',f*4,f*4,.01,.3,.05);},
  /** The named call at the end of a swipe: a mallet run up, longer for a bigger combo. */
  call(n:number){if(!on())return;const k=Math.min(6,Math.max(2,n));for(let i=0;i<k;i++)bar(hz(SCALE[i+2],523),i*.055,.2,.3);burst('highpass',6000,.7,k*.055,.16,.07);},
  /** Hit the other team's kit: a flat cowbell clank and a floor thud. */
  rival(){if(!on())return;tone('square',540,520,0,.16,.12);tone('square',800,790,0,.12,.07);tone('sine',120,48,0,.22,.4,.003);burst('lowpass',500,.8,0,.12,.2);},
  /** The referee's whistle: two close tones with a pea trill, then the thud of a stopped game. */
  whistle(){if(!on()||!ctx||!master)return;const t=ctx.currentTime,o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o1.type='sine';o2.type='sine';o1.frequency.value=2850;o2.frequency.value=3180;lfo.type='square';lfo.frequency.value=38;lg.gain.value=160;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2*vol(),t+.015);g.gain.setValueAtTime(.2*vol(),t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+.42);
   o1.connect(g);o2.connect(g);g.connect(master);o1.start(t);o2.start(t);lfo.start(t);o1.stop(t+.45);o2.stop(t+.45);lfo.stop(t+.45);
   o1.onended=()=>{voices-=2;o1.disconnect();o2.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};
   burst('bandpass',3000,2,0,.4,.05);tone('sine',110,45,.02,.25,.35,.003);},
  /** Team switch: a two-note whistle call and a hand clap. */
  switchTeam(){if(!on())return;tone('sine',1760,1760,0,.12,.13);tone('sine',2349,2349,.14,.2,.13);burst('bandpass',1500,.9,.3,.08,.3);burst('bandpass',1700,.9,.32,.07,.22);},
  /** The kick-off beat: two blocks and a clap. */
  ready(){if(!on())return;bar(hz(0,523),0,.18,.16);bar(hz(7,523),.14,.2,.22);burst('bandpass',1600,.9,.14,.07,.2);},
  special(kind:'golden'|'stopwatch'|'armband'){if(!on())return;
   if(kind==='golden'){for(let i=0;i<6;i++)tone('sine',hz(SCALE[i+3],1046),hz(SCALE[i+3],1046),i*.04,.5,.07);burst('highpass',7000,.7,0,.5,.06);}
   else if(kind==='stopwatch'){tone('sawtooth',880,160,0,.5,.1,.01);tone('sine',440,110,0,.55,.2,.01);}
   else{bar(hz(0,392),0,.22,.3);bar(hz(7,392),.09,.22,.3);bar(hz(12,392),.18,.24,.45);tone('triangle',98,98,.18,.35,.2);}},
  effectEnd(){if(!on())return;tone('sine',660,440,0,.16,.08);},
  /** Super sub: a life comes back. */
  sub(){if(!on())return;bar(hz(4,523),0,.2,.2);bar(hz(9,523),.08,.2,.2);bar(hz(16,523),.16,.22,.4);},
  miss(){if(!on())return;tone('sine',210,120,0,.12,.07,.01);},
  over(){if(!on())return;bar(hz(7,262),0,.22,.3);bar(hz(4,262),.16,.22,.3);bar(hz(0,262),.32,.26,.6);tone('sine',90,40,.32,.5,.35,.004);},
  medal(n:number){if(!on())return;const k=2+Math.min(4,Math.max(1,n));for(let i=0;i<k;i++)bar(hz(SCALE[i*2],523),.5+i*.09,.22,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;bar(hz(12,392),0,.12,.09);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
