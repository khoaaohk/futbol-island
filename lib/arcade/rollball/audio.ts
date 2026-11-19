/**
 * Roll It In sound (Nov 17 2026): a leather ball on the ground (a soft rumble whose pitch and loudness follow the speed and the
 * surface: hiss on sand, squeak on wet tiles, knock on planks), a thump on landing, a splash, a clunk for plates and gates, a bell
 * for stars, a referee whistle and a net swish for the goal; synthesised, no files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/rollball-core.cjs greps this wiring;
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed there, so nothing
 * plays before a gesture. No timers: the roll is one filtered-noise voice whose gain the shell sets each frame (rolling(speed,surf)),
 * silenced on pause / menus (quiet()); every other cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';
import type {Surf} from './core';

const SCALE=[0,2,4,7,9,12,14,16,19] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
const ROLL_TONE:Record<Surf,[BiquadFilterType,number,number]>={grass:['lowpass',420,.7],long:['lowpass',300,.6],sand:['bandpass',2600,.6],ice:['bandpass',1500,4],mud:['lowpass',180,.6],wood:['bandpass',700,2],metal:['bandpass',1900,3],rubber:['lowpass',350,.8],stone:['bandpass',900,1]};
export type RollballAudio=ReturnType<typeof createRollballAudio>;
export function createRollballAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0;
 let roll:{src:AudioBufferSourceNode;bq:BiquadFilterNode;g:GainNode}|null=null,rollSurf:Surf|'' ='';
 /** the bed (Nov 18 AAA pass): the same looped noise through a second filter, swelling slowly like surf (an LFO, no timers); wind on the roofs, a far crowd at night */
 let bed:{bq:BiquadFilterNode;g:GainNode;lfo:OscillatorNode;lg:GainNode}|null=null,bedOn=-1;
 /** repeats never sound the same twice: a small random detune */
 const jit=(f:number,w=.06)=>f*(1-w+Math.random()*w*2);
 const BED:[BiquadFilterType,number,number,number][]=[['lowpass',520,.5,.05],['lowpass',760,.5,.07],['bandpass',420,.7,.06],['bandpass',900,.4,.05]];
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.9;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.12;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*1.2);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=97531;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.6,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 const pluck=(f:number,at:number,gain=.18,dur=.24)=>{tone('sine',f,f,at,dur,gain,.003);tone('triangle',f*2,f*2,at,dur*.4,gain*.3,.002);};
 function whistle(at:number,dur:number,gain:number){if(!ctx||!master)return;const t=ctx.currentTime+at,o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
  o1.type='sine';o2.type='sine';o1.frequency.value=2800;o2.frequency.value=3150;lfo.type='square';lfo.frequency.value=38;lg.gain.value=150;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+.012);g.gain.setValueAtTime(gain*vol(),t+dur-.06);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o1.connect(g);o2.connect(g);g.connect(master);o1.start(t);o2.start(t);lfo.start(t);o1.stop(t+dur+.03);o2.stop(t+dur+.03);lfo.stop(t+dur+.03);
  o1.onended=()=>{voices-=2;o1.disconnect();o2.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};}
 /** The rolling voice: made once, looped noise through a filter; only its gain and filter move. */
 function voice(){if(!ctx||!master||!noise||roll)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noise;src.loop=true;g.gain.value=0;src.connect(bq);bq.connect(g);g.connect(master);src.start();roll={src,bq,g};
  const b2=ctx.createBiquadFilter(),g2=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();g2.gain.value=0;lfo.type='sine';lfo.frequency.value=.13;lg.gain.value=0;lfo.connect(lg);lg.connect(g2.gain);src.connect(b2);b2.connect(g2);g2.connect(master);lfo.start();bed={bq:b2,g:g2,lfo,lg};}
 /** The bed for a theme (0 pitch, 1 beach, 2 roofs, 3 stadium night); silenced by quiet(). */
 function ambience(theme:number){voice();if(!ctx||!bed)return;bedOn=Math.max(0,Math.min(3,theme));const [type,f,q]=BED[bedOn],t=ctx.currentTime;bed.bq.type=type;bed.bq.frequency.setTargetAtTime(f,t,.4);bed.bq.Q.value=q;}
 function rolling(speed:number,surf:Surf,grounded:boolean,fall=0){
  if(!ctx||!master||!noise)return;voice();if(!roll)return;
  if(bed){const k=on()&&bedOn>=0?BED[bedOn][3]*vol():0,t=ctx.currentTime;bed.g.gain.setTargetAtTime(k*.6,t,.4);bed.lg.gain.setTargetAtTime(k*.4,t,.4);}// the bed follows the mute setting every frame
  // in the air the same voice is the wind past the ball
  if(!grounded&&fall+speed>3&&on()){const t=ctx.currentTime;if(rollSurf!==''){roll.bq.type='bandpass';roll.bq.Q.setTargetAtTime(.8,t,.03);rollSurf='';}roll.bq.frequency.setTargetAtTime(900+Math.min(1600,(fall+speed)*120),t,.06);roll.g.gain.setTargetAtTime(Math.min(.1,(fall+speed)*.008)*vol(),t,.08);return;}
  const t=ctx.currentTime,[type,f,q]=ROLL_TONE[surf];if(rollSurf!==surf){roll.bq.type=type;roll.bq.Q.setTargetAtTime(q,t,.03);rollSurf=surf;}
  roll.bq.frequency.setTargetAtTime(f*(.7+Math.min(1.5,speed/7)),t,.05);
  const want=on()&&grounded?Math.min(.32,speed*.05)*vol()*(surf==='mud'?.6:1):0;roll.g.gain.setTargetAtTime(want,t,.06);
 }
 return {
  unlock,rolling,ambience,
  get context(){return ctx;},
  quiet(){if(ctx&&roll)roll.g.gain.setTargetAtTime(0,ctx.currentTime,.03);if(ctx&&bed){bed.g.gain.setTargetAtTime(0,ctx.currentTime,.03);bed.lg.gain.setTargetAtTime(0,ctx.currentTime,.03);}},
  /** A landing: a leather thump, louder for a bigger drop. */
  land(v:number,surf:Surf='grass'){if(!on())return;const k=Math.min(1,v/9),hard=surf==='wood'||surf==='metal'||surf==='stone'||surf==='ice';tone('sine',jit(hard?190:150),55,0,.14,.25+k*.35,.002);burst(hard?'bandpass':'lowpass',jit(hard?ROLL_TONE[surf][1]:900),hard?2:.7,0,hard?.09:.05,.12+k*.2);if(surf==='sand'||surf==='mud')burst('lowpass',jit(500),.5,.01,.16,.1+k*.1,160);},
  /** A wall or post knock. */
  knock(v:number,surf:Surf='grass'){if(!on())return;const g=Math.min(.3,.05+v*.03);tone('triangle',jit(320,.12),160,0,.06,g,.002);burst('lowpass',jit(surf==='metal'?2200:surf==='wood'?1100:600),1,0,.05,g*.7);if(surf==='metal')tone('sine',jit(1240),1180,0,.18,g*.25,.001);},
  /** A cone hit too softly: a hollow plastic bonk that climbs as the hit gets closer to enough. */
  wobble(share:number){if(!on())return;const f=240+Math.min(1,share)*300;tone('triangle',jit(f,.03),f*.72,0,.11,.2,.002);tone('sine',f*.5,f*.4,0,.14,.14,.002);burst('bandpass',1400,2,0,.04,.08);},
  /** A boost pad: a rising whoosh. */
  boost(){if(!on())return;burst('bandpass',500,1.2,0,.42,.3,3600);tone('sawtooth',jit(160),640,0,.3,.07,.01);tone('sine',330,990,.02,.28,.12,.01);},
  /** A sweeper knocks the ball away. */
  sweep(){if(!on())return;tone('sine',jit(210),80,0,.16,.34,.002);burst('lowpass',1300,.8,0,.07,.22);tone('square',jit(520),260,.03,.08,.05);},
  /** Through a closing gate with under a second left. */
  close(){if(!on())return;pluck(hz(12),0,.14,.14);pluck(hz(16),.06,.14,.16);pluck(hz(19),.12,.16,.26);},
  respawn(){if(!on())return;tone('sine',300,620,0,.12,.14,.004);burst('highpass',3000,.6,.02,.08,.05);},
  bumper(){if(!on())return;tone('sine',220,660,0,.12,.3,.002);tone('square',880,440,.02,.06,.05);},
  splash(){if(!on())return;burst('lowpass',2400,.5,0,.5,.4,300);burst('bandpass',700,.8,.04,.35,.25);tone('sine',300,90,0,.3,.2);},
  /** A plate goes down: a stone clunk, a bright note for a lit plate. */
  plate(lit:boolean,n=0){if(!on())return;tone('square',jit(110),80,0,.08,.12,.002);burst('bandpass',500,1.2,0,.06,.2);if(lit)pluck(hz(SCALE[Math.min(SCALE.length-1,n)]),.04,.16,.3);},
  wrong(){if(!on())return;tone('square',300,150,0,.22,.1);tone('square',240,120,.12,.22,.1);},
  /** A gate / bridge: a heavy slide. */
  gate(open:boolean){if(!on())return;burst('lowpass',open?380:260,.8,0,.55,.28,open?900:120);tone('sine',open?70:90,open?110:60,0,.5,.18);},
  cone(n=1){if(!on())return;const up=Math.pow(2,Math.min(7,Math.max(0,n-1))/12);/* each stack knocked in a run rings a little higher */for(let i=0;i<3;i++)tone('triangle',jit((700-i*90)*up,.03),300,i*.05,.09,.12,.002);burst('highpass',2400,.6,0,.12,.12);tone('sine',110,50,0,.12,.3,.002);},
  lever(on1:boolean){if(!on())return;tone('square',on1?900:600,on1?1300:400,0,.05,.08,.001);tone('sine',140,90,.03,.1,.2);},
  key(){if(!on())return;whistle(0,.16,.07);pluck(hz(12),.12,.14,.2);pluck(hz(16),.2,.14,.25);},
  lock(ok:boolean){if(!on())return;if(ok){tone('square',1200,1200,0,.03,.08,.001);tone('square',800,800,.06,.04,.08,.001);pluck(hz(7),.12,.16,.3);}else tone('square',200,180,0,.12,.08);},
  star(n:number){if(!on())return;pluck(hz(SCALE[Math.min(SCALE.length-2,n%SCALE.length)],1046.5),0,.16,.4);pluck(hz(SCALE[Math.min(SCALE.length-1,n%SCALE.length+1)],1046.5),.07,.14,.5);},
  module(){if(!on())return;pluck(hz(7),0,.12,.18);pluck(hz(12),.06,.12,.24);},
  /** Goal: whistle peep, net swish, a crowd swell and a rising chord that climbs with the streak. */
  goal(streak:number){if(!on())return;burst('highpass',3000,.6,0,.35,.25,8000);whistle(.05,.18,.1);const lift=Math.min(SCALE.length-4,Math.max(0,streak-1));for(let i=0;i<4;i++)pluck(hz(SCALE[lift+i]),.18+i*.07,.2,.4);burst('bandpass',800,.5,.15,1.1,.14);},
  heart(){if(!on())return;tone('sine',440,220,0,.3,.2);tone('sine',330,165,.15,.35,.18);},
  tick(){if(!on())return;tone('square',1300,1300,0,.025,.05,.001);},
  /** The run is over: the full-time whistle, three blasts. */
  over(){if(!on())return;whistle(0,.22,.14);whistle(.3,.22,.14);whistle(.6,.6,.14);tone('sine',120,40,.6,.5,.35,.003);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)pluck(hz([0,4,7,12,16][i]),.5+i*.09,.22,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;pluck(hz(12,392),0,.12,.09);},
  dispose(){const c=ctx;ctx=null;try{bed?.lfo.stop();bed?.lfo.disconnect();bed?.g.disconnect();bed=null;roll?.src.stop();roll?.src.disconnect();roll?.g.disconnect();master?.disconnect();limiter?.disconnect();}catch{/* already gone */}roll=null;master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
