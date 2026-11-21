/**
 * FootGolf Island sound (Nov 21 2026): an afternoon on the links. A leather thump for every kick (deeper with power), a soft inside-foot
 * tick for a putt, a turf thud on landing, a sand puff, a splash, a rustle of leaves, a wall knock, the rim rattle, the cup's hollow
 * "clonk", a rising whistle for a birdie or better, and gulls at the tee.
 * Synthesised, no files (shape of the voices copied from Flick It's audio, branch game-flickit; nothing imported). Graph: every voice
 * -> master gain -> ONE limiter (DynamicsCompressor) -> destination. The context is made on the first tap (unlock), so nothing plays
 * before a gesture. No loops or timers: every cue is a one-shot.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
export type FootgolfAudio=ReturnType<typeof createFootgolfAudio>;
export function createFootgolfAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,noise:AudioBuffer|null=null,voices=0,quiet=false;
 const on=()=>!!ctx&&ctx.state==='running'&&isSoundEnabled()&&getSoundVolume()>0&&!(typeof document!=='undefined'&&document.hidden);
 function unlock(){
  if(typeof window==='undefined')return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC();}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.8);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=13579;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*3.7)%.6,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 const j=()=>1+(Math.random()-.5)*.1;
 return {
  unlock,
  get running(){return !!ctx&&ctx.state==='running';},
  hush(v:boolean){quiet=v;if(ctx&&master)master.gain.setTargetAtTime(v?0:.85,ctx.currentTime,.025);},
  get hushed(){return quiet;},
  /** The boot on the ball. kind: 0 long (laces), 1 chip, 2 pass, 3 putt. */
  kick(power:number,kind:number){if(!on())return;const p=Math.max(0,Math.min(1,power));
   if(kind===3){tone('sine',420*j(),300,0,.05,.18+p*.12,.002);burst('bandpass',1800,2,0,.03,.12);return;}
   tone('sine',(kind===0?160:kind===1?210:240)-p*50,46,0,.15+p*.08,.45+p*.35,.002);burst('lowpass',900+p*1000,.8,0,.07,.32+p*.25);
   if(kind<=1)burst('bandpass',600,1.2,.04,.4+p*.3,.06+p*.08,1700);},
  thud(a:number,surf:number){if(!on())return;const k=Math.min(1,a/14);
   if(surf===3){burst('lowpass',600,.7,0,.22,.25+k*.25,200);burst('highpass',3000,.6,.02,.16,.08+k*.08);return;}
   if(surf===4||surf===5){tone('triangle',260*j(),140,0,.07,.18+k*.2);burst('bandpass',2000,2,0,.04,.12);return;}
   tone('sine',110*j(),55,0,.12,.18+k*.3,.002);burst('lowpass',380,1,0,.08,.1+k*.2);},
  splash(){if(!on())return;burst('lowpass',1600,.6,0,.5,.5,300);burst('bandpass',700,1,.05,.4,.3,2400);tone('sine',380,160,.02,.18,.14);for(let i=0;i<3;i++)tone('sine',900+i*260,1300+i*200,.16+i*.07,.06,.06);},
  leaves(){if(!on())return;for(let i=0;i<3;i++)burst('highpass',3600+i*600,.8,i*.05,.16,.18);burst('bandpass',900,1,0,.2,.12);},
  wall(kind:number){if(!on())return;if(kind===2){burst('highpass',3200,.8,0,.2,.2);return;}if(kind===1||kind===11){tone('triangle',220*j(),120,0,.1,.26);burst('bandpass',800,3,0,.06,.2);return;}tone('sine',140*j(),80,0,.12,.4);burst('bandpass',1400,2,0,.05,.2);},
  rim(){if(!on())return;for(let i=0;i<5;i++)tone('triangle',hz(14+(i%2))*j(),hz(13),i*.07,.05,.08);},
  lip(){if(!on())return;tone('triangle',hz(16),hz(12),0,.08,.2);tone('triangle',hz(11),hz(7),.06,.12,.16);burst('bandpass',2400,3,0,.05,.1);},
  /** The ball drops: a hollow plastic clonk, a rattle, then the crowd's little "oh". */
  cup(){if(!on())return;tone('sine',210,150,0,.22,.55,.002);tone('triangle',420,300,0,.1,.22);burst('bandpass',800,4,.08,.12,.3);burst('bandpass',1000,4,.18,.08,.2);burst('bandpass',300,.7,.3,.6,.12,600);},
  /** Birdie or better: a rising whistle and two quick marimba notes; par: one bright note; worse: a low one. */
  result(toPar:number){if(!on())return;if(toPar<0){tone('sine',hz(0),hz(19),0,.5,.16,.02);for(let i=0;i<(toPar<=-2?4:3);i++)tone('sine',hz([7,12,16,19][i]),hz([7,12,16,19][i]),.45+i*.09,.22,.26,.003);}
   else if(toPar===0){tone('sine',hz(7),hz(7),0,.3,.26,.003);tone('sine',hz(12),hz(12),.12,.36,.26,.003);}else{tone('sine',hz(-5),hz(-7),0,.4,.22);}},
  /** The tee: gulls and the breeze. */
  tee(windy:number){if(!on())return;tone('sine',hz(19)*j(),hz(14),0,.18,.05,.02);tone('sine',hz(21),hz(15),.2,.16,.04,.02);burst('bandpass',500,.6,0,.9,.04+windy*.03,900);},
  tick(){if(!on())return;tone('triangle',hz(12),hz(12),0,.04,.06);},
  tap(){if(!on())return;tone('sine',hz(7),hz(7),0,.08,.12,.003);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
