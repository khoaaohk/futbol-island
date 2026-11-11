/**
 * Air Futbol sound (Nov 11 2026): hard plastic on a humming table, a two-tone goal horn and hand claps, synthesised, no audio
 * files. Its own voice in the arcade: Kit Rush slices, Squad Snake plays mallets; this one clacks.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination. The limiter is connected to the
 * destination only (never back into itself or the master: tests/airhockey-core.cjs greps this wiring, and
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed there, so
 * nothing plays before a gesture. One-shots free their nodes when they end. The table hum is the only held voice: it exists only
 * while the puck moves (hum(speed) makes it, hum(0) / quiet() stops and frees it), so a sleeping game is silent.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

export type AirAudio=ReturnType<typeof createAirAudio>;
export function createAirAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0;
 let humNodes:{a:OscillatorNode;b:OscillatorNode;n:AudioBufferSourceNode;f:BiquadFilterNode;g:GainNode;ng:GainNode}|null=null;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.9;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.12;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.5);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=2468135;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.003){
  if(!ctx||!master||voices>26)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>26)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.3,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** The goal horn: two square-ish reeds a fifth apart through the limiter. */
 const horn=(f:number,at:number,dur:number,gain=.1)=>{tone('square',f,f,at,dur,gain,.02);tone('sawtooth',f*1.498,f*1.498,at,dur,gain*.6,.02);tone('sine',f/2,f/2,at,dur,gain*1.3,.02);};
 const clap=(at:number,gain=.26)=>{burst('bandpass',1250,1.2,at,.05,gain);burst('bandpass',1900,1.4,at+.012,.06,gain*.7);};
 function stopHum(){const h=humNodes;if(!h)return;humNodes=null;try{h.a.stop();h.b.stop();h.n.stop();}catch{/* already stopped */}h.a.disconnect();h.b.disconnect();h.n.disconnect();h.f.disconnect();h.ng.disconnect();h.g.disconnect();}
 return {
  unlock,
  get context(){return ctx;},
  /** True while the table hum voice exists (tests and the browser check read it). */
  get humming(){return humNodes!==null;},
  /** Striker on puck: a sharp plastic clack. `impact` is the closing speed (table units a second): louder, brighter and with a
   *  low knock as it grows. Side 1 is a touch lower so the two strikers can be told apart by ear. */
  hit(impact:number,side=0){if(!on())return;const k=Math.max(.15,Math.min(1,impact/300)),f=(side?1500:1760)*(1+k*.25);
   burst('highpass',2600,.7,0,.022+k*.02,.2+k*.3);tone('square',f,f*.72,0,.03+k*.02,.07+k*.1,.001);tone('triangle',f*1.52,f*1.3,0,.025,.05+k*.06,.001);if(k>.45)tone('sine',190,90,0,.07,.2*k,.002);},
  /** Board rebound: a lighter tick, pitched by speed. */
  wall(speed:number){if(!on())return;const k=Math.max(.1,Math.min(1,speed/320));tone('triangle',700+k*900,560+k*700,0,.03,.05+k*.09,.001);burst('bandpass',3200+k*1800,2,0,.014,.05+k*.1);},
  /** Goal post: a ringing ping. */
  post(speed:number){if(!on())return;const k=Math.max(.2,Math.min(1,speed/300));tone('sine',1180,1170,0,.22,.1*k+.05,.001);tone('sine',2970,2950,0,.12,.05*k+.02,.001);},
  /** The low table hum: call every frame with the puck's speed. Made on the first moving frame, freed when the puck stops. */
  hum(speed:number){
   if(speed<=4||!on()||!ctx||!master||!noise){stopHum();return;}
   if(!humNodes){const a=ctx.createOscillator(),b=ctx.createOscillator(),n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),ng=ctx.createGain();
    a.type='sine';a.frequency.value=58;b.type='triangle';b.frequency.value=87.4;n.buffer=noise;n.loop=true;f.type='lowpass';f.frequency.value=420;f.Q.value=.6;ng.gain.value=.35;g.gain.value=.0001;
    a.connect(g);b.connect(g);n.connect(f);f.connect(ng);ng.connect(g);g.connect(master);a.start();b.start();n.start();humNodes={a,b,n,f,g,ng};}
   const k=Math.min(1,speed/300),t=ctx.currentTime;humNodes.g.gain.setTargetAtTime((.035+k*.07)*vol(),t,.05);humNodes.f.frequency.setTargetAtTime(320+k*900,t,.06);humNodes.b.frequency.setTargetAtTime(87.4+k*14,t,.08);
  },
  /** Everything held stops now (pause, sleep, results, leaving). */
  quiet(){stopHum();},
  /** Serve: a short pea-whistle chirp. */
  serve(){if(!on())return;tone('sine',2350,2900,0,.16,.11,.01);tone('sine',2610,3220,0,.16,.07,.01);burst('bandpass',2800,6,0,.14,.05);},
  /** A save: glove thump and one tick. */
  save(){if(!on())return;tone('sine',170,70,0,.14,.3,.002);burst('lowpass',600,.8,0,.07,.2);},
  /** Your goal: horn, horn, long horn, with claps on top (no crowd: the arcade's own cheer). */
  goal(big:boolean){if(!on())return;horn(233,0,.14);horn(233,.17,.14);horn(311,.34,.5,.12);for(let i=0;i<(big?7:5);i++)clap(.36+i*.085,.22);if(big){tone('triangle',932,932,.4,.3,.08);tone('triangle',1245,1245,.52,.4,.08);}},
  /** Their goal: the horn falls away. */
  conceded(){if(!on())return;horn(233,0,.2,.08);horn(196,.2,.2,.08);horn(156,.4,.45,.09);},
  /** Match won: a rising brass call and a held top note over claps. */
  win(){if(!on())return;const n=[233,294,349,466];for(let i=0;i<4;i++)horn(n[i],i*.14,i===3?.6:.13,i===3?.13:.1);for(let i=0;i<6;i++)clap(.5+i*.09,.2);tone('triangle',932,932,.56,.5,.09);},
  lose(){if(!on())return;horn(196,0,.22,.08);horn(175,.24,.22,.08);horn(131,.48,.6,.1);},
  /** The next opponent walks on: two knocks on the rail. */
  next(){if(!on())return;tone('square',440,430,0,.05,.07,.001);tone('square',587,580,.11,.07,.08,.001);burst('highpass',3000,.7,.11,.03,.1);},
  life(){if(!on())return;tone('triangle',784,784,0,.1,.1);tone('triangle',1175,1175,.09,.2,.1);},
  nudge(){if(!on())return;burst('bandpass',900,1,0,.08,.08,2400);},
  tap(){if(!on())return;tone('square',880,860,0,.035,.06,.001);burst('highpass',3200,.7,0,.015,.08);},
  dispose(){stopHum();const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
