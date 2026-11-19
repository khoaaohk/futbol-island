/**
 * Ball Blaster sound (Nov 17 2026): a training-ground toy box. A leather boot thump for every kick (deeper with charge), a whoosh for a
 * curl, wooden crate splinters, a glass tinkle, a hollow plastic clonk for cone towers, a wet pop for water barrels, tin-toy robot
 * clanks with a wind-down spring, a shield "tonk", a goal-horn for the boss and a marimba for waves and medals.
 * Synthesised, no files. Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/ballblaster-core.cjs
 * greps this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and resumed
 * there, so nothing plays before a gesture. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** Combos climb this marimba scale (semitones above C5). */
export const COMBO_SCALE=[0,2,4,7,9,12,14,16,19] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
export type BallblasterAudio=ReturnType<typeof createBallblasterAudio>;
export function createBallblasterAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,murmur:AudioBuffer|null=null,voices=0,quiet=false;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once and resumes it (the iOS / Safari suspended path). */
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=97531;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}
   // the crowd: 3.4 s of soft low noise (a running average of white noise), played as one-shot swells that overlap
   const ml=Math.floor(ctx.sampleRate*3.4);murmur=ctx.createBuffer(1,ml,ctx.sampleRate);const md=murmur.getChannelData(0);let acc=0;for(let i=0;i<ml;i++){seed=(seed*1664525+1013904223)>>>0;acc+=((seed/2147483648-1)-acc)*.12;md[i]=acc*3;}}
  if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 function tone(type:OscillatorType,f0:number,f1:number,at:number,dur:number,gain:number,attack=.004){
  if(!ctx||!master||voices>28)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,at:number,dur:number,gain:number,sweepTo=0){
  if(!ctx||!master||!noise||voices>28)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at;voices++;
  src.buffer=noise;bq.type=filter;bq.frequency.setValueAtTime(f,t);bq.Q.value=q;if(sweepTo)bq.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);
  g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.5,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** A crowd swell: the murmur buffer through a band-pass that can sweep, with a slow attack and release (never looped). */
 function swell(f0:number,f1:number,at:number,dur:number,gain:number,attack:number){
  if(!ctx||!master||!murmur||voices>28)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain(),t=ctx.currentTime+at,d=Math.min(3.3,dur);voices++;
  src.buffer=murmur;bq.type='bandpass';bq.Q.value=.6;bq.frequency.setValueAtTime(f0,t);if(f1!==f0)bq.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.setValueAtTime(gain*vol(),t+d*.55);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,0,d);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** repeats never sound the same twice: a few percent of pitch either way */
 const j=()=>1+(Math.random()-.5)*.1;
 /** Marimba: a sine with a quick fourth-partial knock. */
 const mar=(f:number,at:number,gain=.16,dur=.32)=>{tone('sine',f,f,at,dur,gain,.002);tone('sine',f*3.93,f*3.9,at,dur*.18,gain*.35,.001);};
 return {
  unlock,
  get context(){return ctx;},
  /** the kick: a leather thump, deeper and longer with charge; a curl adds a spin whoosh */
  kick(power:number,curl:number,sup=false){if(!on())return;const k=j();tone('sine',(160-power*50)*k,48,0,.13+power*.06,.42+power*.2,.002);burst('lowpass',(1300+power*700)*k,.8,0,.05,.22);
   if(power>=.9)tone('triangle',420*k,90,0,.1,.12,.001);
   if(sup){tone('sine',70,34,0,.5,.5,.003);tone('sawtooth',240,960,.02,.42,.07,.03);burst('bandpass',700,1.2,.02,.5,.22,3600);}
   if(Math.abs(curl)>.05)burst('bandpass',900,2.2,.02,.34,.09,3200);},
  bounce(soft:boolean){if(!on())return;tone('sine',210*j(),120,0,.07,soft?.06:.14,.002);},
  board(){if(!on())return;burst('bandpass',420,1.4,0,.14,.22);tone('square',95,70,0,.1,.06);},
  /** a hit that does not break: a tin clank */
  clank(){if(!on())return;const k=j();tone('square',680*k,520*k,0,.06,.06,.001);tone('triangle',1240*k,1100*k,0,.12,.07,.001);},
  /** what broke: each material its own sound; `combo` climbs the marimba */
  smash(kind:number,combo:number){if(!on())return;
   if(kind===10){burst('bandpass',1500,.9,0,.18,.3,600);burst('highpass',3800,.8,.03,.1,.12);tone('sine',140,80,0,.1,.2);}// crate splinters
   else if(kind===11){for(let i=0;i<5;i++)tone('sine',2600+i*530,2500+i*500,i*.025,.22,.05,.001);burst('highpass',6200,.6,0,.25,.14);}// glass
   else if(kind===12){tone('triangle',330,190,0,.18,.18,.002);tone('triangle',250,150,.08,.18,.14,.002);}// hollow cones
   else if(kind===13){tone('sine',120,70,0,.2,.28);burst('lowpass',500,.9,0,.16,.2);}// rubber tyres
   else if(kind===15){burst('bandpass',900,.7,0,.4,.3,300);tone('square',220,90,0,.3,.07);}// a scoreboard
   else if(kind===8){tone('sawtooth',220,60,0,.8,.2,.01);burst('lowpass',1200,.6,0,.7,.4,200);}// the boss
   else if(kind===16){const k=j();tone('sine',1568*k,1568*k,0,.3,.14,.001);tone('sine',2349*k,2349*k,.01,.22,.07,.001);burst('highpass',5200,.7,0,.06,.1);}// a target: a bright bell
   else if(kind<10){const k=j();tone('square',900*k,240,0,.16,.08,.001);burst('bandpass',2400*k,1.5,0,.14,.16);tone('triangle',1800*k,300,.06,.32,.06);}// a robot: clank + wind-down spring
   const i=Math.min(COMBO_SCALE.length-1,Math.max(0,combo-1));if(combo>=2)mar(hz(COMBO_SCALE[i]),.04,.12,.26);},
  /** a water barrel bursting */
  boom(){if(!on())return;tone('sine',95,38,0,.4,.5,.003);burst('lowpass',1800,.7,0,.42,.42,240);burst('bandpass',3000,1,.05,.3,.12,900);},
  topple(){if(!on())return;tone('triangle',260,110,0,.3,.14);burst('bandpass',700,1,0,.3,.14);},
  block(){if(!on())return;tone('triangle',520,500,0,.18,.18,.001);tone('sine',1560,1500,0,.12,.06,.001);},
  dodge(){if(!on())return;burst('bandpass',2000,2,0,.12,.07,800);},
  trick(n:number){if(!on())return;for(let i=0;i<Math.min(5,n+1);i++)mar(hz([0,4,7,12,16][i]),i*.07,.14,.3);},
  power(){if(!on())return;for(let i=0;i<4;i++)mar(hz(i*4+7),i*.05,.13,.28);burst('highpass',7000,.7,.18,.3,.07);},
  /** a machine got to the goal line: a referee's short whistle and a low buzz */
  leak(){if(!on()||!ctx||!master)return;tone('sawtooth',110,90,0,.4,.16,.01);
   const t=ctx.currentTime+.02,o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();voices+=2;
   o.type='sine';o.frequency.value=2800;lfo.type='square';lfo.frequency.value=30;lg.gain.value=130;lfo.connect(lg);lg.connect(o.frequency);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09*vol(),t+.012);g.gain.setValueAtTime(.09*vol(),t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+.26);
   o.connect(g);g.connect(master);o.start(t);lfo.start(t);o.stop(t+.28);lfo.stop(t+.28);o.onended=()=>{voices-=2;o.disconnect();lfo.disconnect();lg.disconnect();g.disconnect();};},
  empty(){if(!on())return;tone('sine',300,260,0,.06,.06);},
  /** the charge is full: a tick (two rising notes when the super shot is ready to go with it) */
  ready(sup:boolean){if(!on())return;mar(hz(sup?12:19),0,.09,.1);if(sup)mar(hz(19),.07,.11,.16);},
  superReady(){if(!on())return;for(let i=0;i<5;i++)mar(hz([7,12,16,19,24][i]),i*.055,.13,.3);burst('highpass',7000,.7,.25,.35,.06);},
  /** a rocket-bot winds up: a rising whine with three ticks; then the dash roars past */
  tell(){if(!on())return;tone('sawtooth',170,700,0,1.1,.06,.08);for(let i=0;i<3;i++)tone('square',980,980,i*.3,.05,.05,.001);},
  dash(){if(!on())return;burst('bandpass',500,1.2,0,.5,.2,2600);tone('sawtooth',300,110,0,.42,.08,.01);},
  /** a machine is close to the goal line: two low beeps (the shell repeats them while the danger lasts) */
  danger(){if(!on())return;tone('square',196,196,0,.08,.06,.002);tone('square',196,196,.13,.08,.06,.002);},
  /** a close call or a stopped rocket-bot: two quick notes up */
  close(){if(!on())return;mar(hz(12),0,.12,.14);mar(hz(17),.06,.13,.2);},
  /** a set piece steps on: a short drum roll on the boards */
  setPiece(){if(!on())return;for(let i=0;i<5;i++)burst('bandpass',260+i*30,1.2,i*.07,.08,.1+i*.02);tone('sine',110,70,.35,.16,.2,.002);},
  bonus(){if(!on())return;for(let i=0;i<6;i++)mar(hz([0,4,7,4,7,12][i]),i*.08,.13,.22);},
  heart(){if(!on())return;tone('sine',392,392,0,.2,.16,.01);tone('sine',523,523,.12,.2,.16,.01);tone('sine',784,784,.24,.5,.18,.01);burst('highpass',6500,.7,.3,.4,.06);},
  /** the stands: a soft murmur the shell asks for every few seconds while play runs (louder as the game heats up) */
  crowd(level:number){if(!on())return;swell(520,640,0,3.3,.02+Math.max(0,Math.min(1,level))*.035,1);},
  /** a cheer from the stands (a wave cleared, a trick, the boss down) and a groan (a machine got through) */
  cheer(big:boolean){if(!on())return;swell(600,1500,0,big?2.6:1.5,big?.2:.12,.12);swell(1100,2200,.05,big?2.2:1.2,big?.1:.06,.2);},
  groan(){if(!on())return;swell(900,360,0,1.1,.12,.08);},
  /** pause: the master fades out so no tail rings on; resume brings it back */
  hush(v:boolean){quiet=v;if(ctx&&master)master.gain.setTargetAtTime(v?0:.85,ctx.currentTime,.025);},
  get hushed(){return quiet;},
  wave(boss:boolean){if(!on())return;if(boss){tone('sawtooth',180,180,0,.5,.12,.02);tone('sawtooth',227,227,0,.5,.1,.02);tone('sawtooth',180,180,.55,.6,.12,.02);}else{mar(hz(0),0,.12);mar(hz(7),.1,.12);}},
  clear(){if(!on())return;mar(hz(0),0,.13);mar(hz(4),.08,.13);mar(hz(7),.16,.13);mar(hz(12),.24,.16,.5);},
  over(){if(!on())return;tone('sine',140,40,0,.5,.4,.003);burst('lowpass',800,.7,0,.24,.26);mar(hz(-5),.18,.14);mar(hz(-9),.36,.14);mar(hz(-12),.54,.16,.6);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)mar(hz([0,4,7,12,16][i]),.5+i*.09,.16,.4);burst('highpass',6500,.7,.5+k*.09,.4,.08);},
  tap(){if(!on())return;mar(hz(7),0,.08,.12);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;murmur=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
