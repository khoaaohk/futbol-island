/**
 * Trophy Drop sound (Nov 17 2026): a glass trophy cabinet. Items land with a wooden clonk (deeper for bigger tiers), merges ring a
 * glass chime that climbs one step of a major scale per tier (a run of merges is a rising tune), the beach ball boings, and the
 * golden double is a bell peal. Synthesised, no audio files.
 * Graph: every voice -> master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/trophydrop-core.cjs greps this wiring;
 * scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock). No loops or timers.
 * AAA pass (Nov 18 2026): the pluck of a drop follows the item's size; landings and chimes detune a little each time so repeats do
 * not grate; a chain climbs the scale one step per link with a longer sparkle; the touch streak ticks upward and the fifth is a
 * rising run (shake earned); the shake is a low rumble with rattling glass; the warning pips get higher as the clock runs; a narrow
 * escape gets a "phew" slide; an empty shake button answers with a dull knock.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';

/** Semitones above C5 for the chime of each tier made (1 = size-3 ball ... 8 = golden trophy). */
export const TIER_STEPS=[0,0,2,4,5,7,9,11,12] as const;
const hz=(semi:number,base=523.25)=>base*Math.pow(2,semi/12);
/** Semitones a chain adds to the chime: link 1 none, then up a major scale (a run of merges reads as a rising tune). */
export const CHAIN_STEPS=[0,2,4,7,9,12] as const;
/** A small random detune so a repeated sound never lands twice on the same pitch. */
const wob=(amount=.03)=>1+(Math.random()*2-1)*amount;
export type TrophyAudio=ReturnType<typeof createTrophyAudio>;
export function createTrophyAudio(){
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
   const len=Math.floor(ctx.sampleRate*.5);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=2468013;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
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
  src.connect(bq);bq.connect(g);g.connect(master);src.start(t,(t*5.1)%.3,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** A struck glass: a sine with two inharmonic partials, long-ish ring. */
 const glass=(f:number,at:number,gain=.16,dur=.7)=>{tone('sine',f,f,at,dur,gain,.002);tone('sine',f*2.76,f*2.76,at,dur*.45,gain*.3,.002);tone('sine',f*5.4,f*5.4,at,dur*.18,gain*.14,.001);};
 /** Wood block clonk; lower and longer for bigger items. */
 const clonk=(f:number,gain:number)=>{tone('triangle',f,f*.6,0,.09,gain,.002);burst('bandpass',f*4,2.2,0,.03,gain*.6);};
 return {
  unlock,
  get context(){return ctx;},
  /** The held item lets go: a soft pluck, lower for bigger items (-1 = beach ball). */
  drop(tier=0){if(!on())return;const f=(tier<0?700:980-tier*70)*wob();tone('sine',f,f*.72,0,.07,.07,.002);burst('highpass',2400,.7,0,.03,.03);},
  /** An item lands: tier 0-8 (or -1 beach), speed in world units / s. */
  land(tier:number,speed:number){if(!on())return;const k=Math.min(1,speed/240);if(tier<0){tone('sine',260*wob(),420,0,.16,.12*k+.04);return;}clonk((420-tier*32)*wob(),.08+.16*k);if(tier>=5)tone('sine',90,60,0,.18,.18*k);if(tier>=7&&k>.5)burst('bandpass',2800,3,.02,.12,.05*k);},
  /** A merge made `tier`; chain >= 2 adds a sparkle an octave up. */
  merge(tier:number,chain:number){if(!on())return;const c=Math.max(1,Math.min(6,chain)),f=hz(TIER_STEPS[Math.max(1,Math.min(8,tier))]+CHAIN_STEPS[c-1])*(chain<2?wob(.006):1);burst('highpass',3000,.8,0,.05,.12);tone('sine',180,90,0,.08,.16+.02*c,.002);glass(f,.01,.17);glass(f*1.5,.07,.08,.45);
   if(tier>=5)tone('triangle',f/4,f/4,.01,.3,.1);// the big items ring with a low body under the chime
   if(chain>=2)for(let i=0;i<Math.min(5,chain+1);i++)glass(hz(12+i*4+TIER_STEPS[Math.min(8,tier)]+CHAIN_STEPS[c-1]),.12+i*.055,.06,.3);},
  /** Two golden trophies: a bell peal and a cheer of noise. */
  double(){if(!on())return;for(let i=0;i<6;i++)glass(hz([0,4,7,12,16,19][i]),i*.08,.15,.9);tone('triangle',131,131,0,.6,.2);burst('bandpass',1800,.6,.1,.6,.12);},
  /** The beach ball is hit (hits so far). */
  hit(n:number){if(!on())return;tone('sine',300+n*80,520+n*80,0,.14,.16,.003);},
  /** The beach ball deflates into a size-5 ball: hiss and a falling squeak. */
  pop(){if(!on())return;burst('highpass',2500,.7,0,.28,.16,6000);tone('square',900,300,.02,.2,.04);},
  level(){if(!on())return;glass(hz(7),0,.12,.4);glass(hz(12),.12,.14,.6);tone('triangle',110,80,.1,.4,.18);},
  /** Items over the top line: two short warning pips (the shell may repeat it while the line flashes). */
  warn(urgency=0){if(!on())return;const f=740*Math.pow(2,Math.max(0,Math.min(1,urgency))*5/12);tone('square',f,f,0,.07,.05,.002);tone('square',f,f,.12,.07,.05+.02*urgency,.002);},
  /** Back under the line; phew = it was close (a longer falling slide of relief). */
  safe(phew=false){if(!on())return;tone('sine',660,880,0,.12,.07);if(phew){tone('sine',988,494,.1,.32,.08,.01);burst('highpass',1800,.6,.1,.3,.05,600);}},
  /** Touch streak: n merging drops in a row; charge = pips toward the next shake (a rising tick). */
  streak(n:number,charge:number){if(!on()||n<2)return;const f=hz(12+Math.min(9,Math.max(1,charge||n))*2);tone('triangle',f,f,.05,.07,.06,.002);},
  /** The streak ended: a soft falling blip. */
  miss(){if(!on())return;tone('sine',420,300,0,.12,.05,.004);},
  /** A shake is earned: a quick rising run. */
  earn(){if(!on())return;for(let i=0;i<4;i++)glass(hz([7,12,16,19][i]),.1+i*.06,.11,.35);},
  /** The shake: a low rumble, the glass rattles, the items jump. */
  shake(){if(!on())return;tone('sine',70,45,0,.4,.3,.01);tone('triangle',110,60,0,.3,.14,.01);burst('bandpass',300,.8,0,.35,.2,120);for(let i=0;i<5;i++)burst('bandpass',2600+i*300,5,.03+i*.05,.05,.07);},
  /** The shake button with no shake held: a dull knock. */
  deny(){if(!on())return;tone('triangle',160,120,0,.07,.1,.002);},
  /** The run is over: the glass rattles, three falling chimes. */
  over(){if(!on())return;burst('bandpass',2600,1.4,0,.3,.18,900);glass(hz(7,262),.12,.18);glass(hz(3,262),.3,.18);glass(hz(0,262),.48,.2,1);},
  medal(n:number){if(!on())return;const k=2+Math.min(3,Math.max(1,n));for(let i=0;i<k;i++)glass(hz([0,4,7,12,16][i]),.5+i*.09,.16,.6);},
  tap(){if(!on())return;glass(hz(12),0,.08,.18);},
  dispose(){const c=ctx;ctx=null;try{master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
