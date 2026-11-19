/**
 * Squad Snake sound (Nov 10 2026): mallets, hand percussion and a small brass stab for the comic world, synthesised, no audio files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination. The limiter is connected to the
 * destination only (never back into itself or the master: tests/snake-core.cjs greps this wiring, and
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed there, so
 * nothing plays before a gesture. No loops or timers: every cue is a one-shot that frees its nodes when it ends.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** The squad tune: one note per team-mate, keeper to last forward (semitones above G4). A full line plays the whole phrase. */
export const SQUAD_TUNE=[0,4,7,4,7,9,7,9,12,14,16] as const;
const hz=(semi:number,base=392)=>base*Math.pow(2,semi/12);
export type SnakeAudio=ReturnType<typeof createSnakeAudio>;
export function createSnakeAudio(){
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
   const len=Math.floor(ctx.sampleRate*.5);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=7654321;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 /** A small random detune (about a third of a semitone either way) so a cue heard many times in a row never sounds stamped. */
 const vary=(f:number)=>f*(1+(Math.random()-.5)*.04);
 /** The crowd, as one-shots (no loop): a band of noise that swells and falls. up = a cheer (the band rises), down = a gasp. */
 function crowd(at:number,dur:number,gain:number,up:boolean){
  if(!ctx||!master||!noise||voices>24)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;src.loop=true;bq.type='bandpass';bq.Q.value=.6;bq.frequency.setValueAtTime(up?700:1100,t);bq.frequency.exponentialRampToValueAtTime(up?1500:600,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+dur*.3);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*3.1)%.3);src.stop(t+dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*7.3)%.3,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** Marimba-like bar: sine + a quiet 4th partial, quick decay. */
 const bar=(f:number,at:number,gain=.2,dur=.28)=>{tone('sine',f,f,at,dur,gain,.003);tone('sine',f*3.98,f*3.98,at,dur*.35,gain*.28,.002);};
 /** A short brass-like stab: two detuned saws through the limiter, with a sine body. */
 const stab=(f:number,at:number,dur:number,gain=.09)=>{tone('sawtooth',f,f,at,dur,gain,.012);tone('sawtooth',f*1.006,f*1.006,at,dur,gain*.8,.012);tone('sine',f,f,at,dur*1.1,gain*1.6,.01);};
 return {
  unlock,
  get context(){return ctx;},
  /** A team-mate joins: the next note of the squad tune (n = 1 keeper ... 11), a skin tap under it. */
  pick(n:number){if(!on())return;const f=hz(SQUAD_TUNE[Math.min(SQUAD_TUNE.length,Math.max(1,n))-1]);bar(f,0,.24,.3);bar(f*2,.004,.07,.16);tone('triangle',170,80,0,.07,.2,.002);burst('bandpass',2200,1.1,0,.035,.16);},
  /** FULL SQUAD: the tune's top answered by a brass fanfare and two claps. */
  squad(called:boolean){if(!on())return;stab(hz(0),0,.16);stab(hz(4),.13,.16);stab(hz(7),.26,.16);stab(hz(12),.39,.55,.11);if(called)stab(hz(16),.39,.55,.07);
   tone('triangle',98,98,.39,.5,.22);burst('bandpass',1500,.9,.39,.08,.3);burst('bandpass',1700,.9,.55,.07,.24);crowd(.3,1.1,called?.13:.09,true);for(let i=0;i<5;i++)bar(hz(12+SQUAD_TUNE[i*2],784),.62+i*.05,.09,.25);},
  level(){if(!on())return;bar(hz(7,523),0,.16,.18);bar(hz(12,523),.1,.18,.3);},
  /** The kick-off beat: two blocks and a clap. */
  ready(){if(!on())return;bar(hz(0,523),0,.18,.16);bar(hz(7,523),.14,.2,.22);burst('bandpass',1600,.9,.14,.07,.2);},
  /** A turn taken: one very soft wood tick (pitched by direction so a U-turn is two different ticks). */
  turn(d:number){if(!on())return;const f=vary(620+d*70);tone('sine',f,f*.9,0,.035,.045,.002);},
  /** AAA pass (Nov 18 2026). Quick call: a bright answer above the squad note, one step higher for every call in the chain. */
  chain(n:number){if(!on())return;const k=Math.min(7,Math.max(2,n)),f=hz([0,4,7,9,12,14,16,19][k],1047);bar(f,.07,.13,.16);bar(f*1.5,.13,.1,.22);burst('highpass',7500,.7,.07,.12,.03+k*.005);},
  /** The chain ran out: one soft falling tick. */
  chainEnd(){if(!on())return;tone('sine',700,420,0,.09,.05,.004);},
  /** A finished line is named (BACK FOUR!): two firm blocks. */
  line(){if(!on())return;bar(hz(7,392),.1,.16,.14);bar(hz(12,392),.2,.18,.24);},
  /** The loose ball drops in: two small bounces. */
  ballIn(){if(!on())return;tone('triangle',vary(230),120,0,.07,.14,.002);tone('triangle',vary(260),140,.13,.05,.08,.002);},
  /** The golden boot left: a small falling pair. */
  bootGone(){if(!on())return;tone('sine',1319,1319,0,.08,.04);tone('sine',988,880,.07,.14,.04);},
  /** The through pass is over: the whoosh settles. */
  dashEnd(){if(!on())return;burst('bandpass',2600,.8,0,.2,.07,600);},
  /** A cone knocked flying: hollow plastic. */
  cone(){if(!on())return;const f=vary(330);tone('triangle',f,f*.55,0,.09,.22,.002);tone('square',f*2.02,f*1.4,0,.04,.05,.002);burst('bandpass',1800,2,0,.05,.14);},
  /** Sliding tackle warning: two sharp low peeps and a drum, unlike anything else in the game. */
  slideWarn(){if(!on())return;for(const at of [0,.16]){tone('square',466,466,at,.09,.07,.004);tone('sine',233,233,at,.1,.16,.004);}tone('sine',110,60,.32,.16,.3,.003);},
  /** He goes: grass tearing under the slide. */
  slideGo(){if(!on())return;burst('bandpass',500,.7,0,.5,.16,2400);tone('sine',90,50,0,.2,.2,.004);},
  /** Dodged: a little rising pair and the crowd's cheer. */
  dodge(){if(!on())return;bar(hz(9,523),0,.12,.14);bar(hz(14,523),.08,.14,.22);crowd(0,.5,.05,true);},
  /** A close shave: the crowd gasps. */
  near(){if(!on())return;crowd(0,.4,.09,false);tone('sine',vary(520),380,0,.1,.05,.01);},
  /** A team-mate is sent back: after the whistle, a sad falling pair. */
  lost(){if(!on())return;bar(hz(4,330),.3,.16,.22);bar(hz(0,330),.44,.16,.34);crowd(.25,.5,.06,false);},
  /** Loose ball: leather thump, then a rising whoosh for the through pass. */
  ball(){if(!on())return;tone('triangle',200,70,0,.1,.32,.002);burst('bandpass',700,.8,.03,.42,.16,4200);bar(hz(12,523),.05,.14,.2);bar(hz(19,523),.13,.14,.3);},
  /** Golden boot: a bright run of three bars and a shimmer. */
  boot(){if(!on())return;for(let i=0;i<4;i++)bar(hz([7,12,16,19][i],784),i*.045,.13,.32);burst('highpass',7000,.7,0,.35,.06);},
  bootIn(){if(!on())return;tone('sine',1568,1568,0,.09,.05);tone('sine',2093,2093,.08,.14,.05);},
  /** Head-on: the captain skids. A brush scrape. */
  skid(){if(!on())return;burst('bandpass',vary(3200),.7,0,.16,.2,900);tone('sine',vary(240),160,0,.12,.1,.004);},
  /** Last-ditch save: glove thump and a relieved two-note answer. */
  save(){if(!on())return;tone('sine',150,60,0,.2,.42,.003);burst('lowpass',700,.8,0,.1,.25);bar(hz(4,523),.12,.16,.2);bar(hz(9,523),.2,.18,.3);},
  /** The referee: a pea-whistle trill. */
  card(){if(!on()||!ctx||!master)return;const t=ctx.currentTime,o1=ctx.createOscillator(),o2=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o1.type='sine';o2.type='sine';o1.frequency.value=2850;o2.frequency.value=3180;lfo.type='square';lfo.frequency.value=38;lg.gain.value=160;lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.16*vol(),t+.015);g.gain.setValueAtTime(.16*vol(),t+.22);g.gain.exponentialRampToValueAtTime(.0001,t+.32);
   o1.connect(g);o2.connect(g);g.connect(master);o1.start(t);o2.start(t);lfo.start(t);o1.stop(t+.35);o2.stop(t+.35);lfo.stop(t+.35);
   o1.onended=()=>{voices-=2;o1.disconnect();o2.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};},
  /** Ran past a presser in a dash. */
  knock(){if(!on())return;tone('square',520,500,0,.08,.08);tone('sine',130,60,0,.14,.3,.003);bar(hz(16,523),.04,.14,.2);},
  /** The crash: a cracked panel. Low thud, splintering noise, a falling three-bar phrase. */
  crash(){if(!on())return;crowd(.05,.7,.1,false);tone('sine',130,38,0,.42,.5,.003);burst('lowpass',900,.7,0,.22,.4);burst('highpass',3800,.8,.02,.14,.18);bar(hz(7,262),.16,.2,.3);bar(hz(3,262),.32,.2,.3);bar(hz(0,262),.48,.24,.6);},
  medal(n:number){if(!on())return;const k=2+Math.min(4,Math.max(1,n));for(let i=0;i<k;i++)bar(hz([0,4,7,12,16,19][i],523),.5+i*.09,.22,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;bar(hz(12,392),0,.12,.09);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
