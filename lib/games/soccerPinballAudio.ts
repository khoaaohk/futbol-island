import {isSoundEnabled,getSoundVolume} from './sound';
import {plungerPull,type PinballState} from './soccerPinball';

/* Futbol Pinball voices (docs/arcade-aaa/pinball-direction.md), Nov 10 2026 comic pass: the table joins Breakaway Run's world, so the
 * machine is played by hand. A wood block and a rim-shot are the flippers, a cajon (low body + palm slap) is every bumper and sling,
 * steel-pan / kalimba notes on a C-major pentatonic carry every scoring cue (runs for build-ups), claps and a shaker answer the big
 * moments. Rubber stays for the ball into the keeper. Football stays as two voices through the cabinet speaker: the referee's
 * whistle and a small crowd. No assets and no timers. One-shots self-disconnect on end; a per-context cap bounds polyphony; one
 * short noise buffer is cached per context. Graph: every voice -> trim gain -> limiter -> ctx.destination (once, no cycles).
 * The only sustained voice is the ball rolling on wood (pinballRollSound): one looped noise source, made once and parked, that
 * stops itself about a second after the last frame that fed it, so a paused or finished game is silent and idle.
 * Bumper knock-downs still climb the pentatonic so a good rally plays a tune on the pans. */

type Voices={live:number;noise:AudioBuffer|null;last:Map<string,number>;chain:number;chainAt:number;/** Pass 3: the trim -> limiter bus every voice plays through, and when the last scheduled voice ends. */out:AudioNode|null;busyUntil:number};
const contexts=new WeakMap<AudioContext,Voices>();
const MAX_VOICES=14;
// C-major pentatonic, C5 upward: always consonant however the chain lands.
const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
let lastHaptic=0;

function state(ctx:AudioContext):Voices{let v=contexts.get(ctx);if(!v){v={live:0,noise:null,last:new Map(),chain:0,chainAt:-9,out:null,busyUntil:0};contexts.set(ctx,v);}return v;}
const jitter=(amount:number)=>1+(Math.random()*2-1)*amount;
/** Pass 3: one master trim and one limiter per AudioContext between every voice and the speaker: voice -> trim -> limiter ->
 * destination, built once, so the limiter is never fed back into itself. A goal stacks the pan fanfare, claps and the crowd (up to
 * 14 voices): summed straight into the destination they could clip on a phone speaker. If the browser has no compressor node the
 * voices fall back to the destination (nothing is connected before both nodes exist). */
function bus(ctx:AudioContext,v:Voices):AudioNode{
 if(v.out)return v.out;
 try{const trim=ctx.createGain(),c=ctx.createDynamicsCompressor();trim.gain.value=.9;c.threshold.value=-9;c.knee.value=6;c.ratio.value=14;c.attack.value=.002;c.release.value=.12;trim.connect(c);c.connect(ctx.destination);v.out=trim;}catch{v.out=ctx.destination;}
 return v.out;
}
/** Voice budget. `onended` is not guaranteed (WebKit drops it when the context is interrupted or suspended mid-voice), which used to
 * leak the counter until every cue went silent for the rest of the session: once the clock passes the last scheduled voice the
 * counter heals itself. */
function claim(ctx:AudioContext,v:Voices,end:number){if(ctx.currentTime>v.busyUntil+.2)v.live=0;if(v.live>=MAX_VOICES)return false;v.live++;v.busyUntil=Math.max(v.busyUntil,end);return true;}

function tone(ctx:AudioContext,v:Voices,type:OscillatorType,from:number,to:number,at:number,duration:number,peak:number,attack=.01){
 if(peak<=0||!(duration>0)||!(from>0)||!claim(ctx,v,at+duration+.05))return;
 try{// a context closed or interrupted under us (Safari) must never throw into the frame loop
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(peak,at+Math.min(attack,duration*.25));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(bus(ctx,v));osc.start(at);osc.stop(at+duration+.02);
 osc.onended=()=>{v.live=Math.max(0,v.live-1);try{osc.disconnect();gain.disconnect();}catch{}};
 }catch{v.live=Math.max(0,v.live-1);}
}
function noise(ctx:AudioContext,v:Voices,at:number,duration:number,peak:number,filter:BiquadFilterType,from:number,to=from,q=.8,attack=.012){
 if(peak<=0||!(duration>0)||!claim(ctx,v,at+duration+.06))return;
 try{
 if(!v.noise){const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.8),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;v.noise=buffer;}
 const src=ctx.createBufferSource(),biquad=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=v.noise;src.playbackRate.value=jitter(.08);biquad.type=filter;biquad.Q.value=q;biquad.frequency.setValueAtTime(from,at);biquad.frequency.exponentialRampToValueAtTime(Math.max(30,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(peak,at+Math.min(attack,duration*.3));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 src.connect(biquad);biquad.connect(gain);gain.connect(bus(ctx,v));src.start(Math.max(at,ctx.currentTime),Math.random()*Math.max(0,.77-duration),duration+.03);
 src.onended=()=>{v.live=Math.max(0,v.live-1);try{src.disconnect();biquad.disconnect();gain.disconnect();}catch{}};
 }catch{v.live=Math.max(0,v.live-1);}
}
/** Steel pan / kalimba note: the fundamental, the pan's strong octave ringing shorter, and (bright) the stick's quick strike a twelfth up. Two voices, three when bright. */
function pan(ctx:AudioContext,v:Voices,hz:number,at:number,peak:number,ring=.34,bright=false){
 tone(ctx,v,'sine',hz,hz*.996,at,ring,peak,.004);tone(ctx,v,'sine',hz*2.01,hz*2.005,at,ring*.42,peak*.42,.003);
 if(bright)tone(ctx,v,'triangle',hz*3,hz*3,at,.045,peak*.14,.002);
}
/** A run on the pans (every scoring flourish and build-up). The last note rings longer. */
function arpeggio(ctx:AudioContext,v:Voices,notes:readonly number[],at:number,step:number,peak:number,_type:OscillatorType='triangle',hold=.16){
 notes.forEach((hz,i)=>pan(ctx,v,hz,at+i*step,peak,hold*2+(i===notes.length-1?.45:0)));
}
/** Wood block: a hollow tuned knock and its short upper mode, struck dry (2 ms attack). `pitch` 1 = the flipper block. Two voices. */
function woodBlock(ctx:AudioContext,v:Voices,at:number,vol:number,pitch=1){
 tone(ctx,v,'triangle',920*pitch,780*pitch,at,.05,.11*vol,.002);tone(ctx,v,'sine',2480*pitch,2300*pitch,at,.022,.035*vol,.001);
}
/** Rim-shot: the stick across the rim, one dry band of crack. One voice. */
function rim(ctx:AudioContext,v:Voices,at:number,vol:number,pitch=1){
 noise(ctx,v,at,.035,.075*vol*jitter(.15),'bandpass',2600*pitch,1700*pitch,1.6,.001);
}
/** Cajon: the box's low body dropping as it speaks, a breath of box air, and the palm's slap on the tapa (slap 0 = a dull thud).
 * `hz` and `len` set the body: low and long for a bumper, high and tight for a sling. Up to three voices. */
function cajon(ctx:AudioContext,v:Voices,at:number,vol:number,hz=96,slap=1,len=.16){
 tone(ctx,v,'sine',hz*jitter(.02),hz*.48,at,len,.16*vol,.002);noise(ctx,v,at,.05,.07*vol,'lowpass',380,160,.7,.002);
 if(slap>0)noise(ctx,v,at,.06,.09*vol*slap*jitter(.12),'bandpass',2300,1500,1.7,.002);
}
/** Hand clap: a short band of noise, flammed by the second palm. One voice, two with the flam. */
function clap(ctx:AudioContext,v:Voices,at:number,vol:number,flam=true){
 noise(ctx,v,at,.08,.075*vol*jitter(.15),'bandpass',1350*jitter(.05),1050,1.3,.002);
 if(flam)noise(ctx,v,at+.012,.08,.055*vol,'bandpass',1700*jitter(.05),1200,1.3,.002);
}
/** Shaker: `n` grains of seed rattle, high-passed, alternating strong and soft. */
function shaker(ctx:AudioContext,v:Voices,at:number,vol:number,n=3,gap=.034){
 for(let i=0;i<n;i++)noise(ctx,v,at+i*gap,i%2?.028:.045,(i%2?.03:.05)*vol*jitter(.2),'highpass',6400*jitter(.05),6400,.7,.004);
}
/** Rubber: the ball into a post ring or the keeper. Dull and short. */
function rubber(ctx:AudioContext,v:Voices,at:number,vol:number,hz=170){
 tone(ctx,v,'sine',hz*jitter(.05),hz*.5,at,.07,.1*vol);noise(ctx,v,at,.035,.05*vol,'lowpass',900,380);
}
function haptic(pattern:number|number[]){
 if(typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;
 const now=performance.now();if(now-lastHaptic<150)return;
 if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 lastHaptic=now;navigator.vibrate(pattern);
}

/** The referee's pea whistle, through the cabinet speaker: two slightly detuned sines per blast. */
function whistle(ctx:AudioContext,v:Voices,now:number,blasts:readonly (readonly [number,number])[],vol:number){
 for(const [at,len] of blasts){tone(ctx,v,'sine',2350,2310,now+at,len,.022*vol);tone(ctx,v,'sine',2440,2400,now+at,len,.015*vol);}
}
/** Crowd "ooooh" through a small speaker: one band-limited vowel sliding down. */
function ooh(ctx:AudioContext,v:Voices,at:number,vol:number){
 noise(ctx,v,at,.5,.045*vol,'bandpass',720,460,3.2);
}
/** Crowd roar for a goal, band-limited like a 4-inch cabinet speaker (one voice). */
function roar(ctx:AudioContext,v:Voices,at:number,vol:number,size=1){
 noise(ctx,v,at,Math.min(.77,.62*size),.05*vol,'bandpass',620,1150,1.1); // the cached noise buffer is .8 s
}
/** The pan fanfare for a goal: four rising notes, the last one held, two hand claps and a cajon hit under the top note.
 * Priority order matters under the 14-voice cap: pans (8), claps (2), the crowd (1), the cajon body (1), then any bonus note. */
function fanfare(ctx:AudioContext,v:Voices,at:number,vol:number,notes:readonly number[],step=.085){
 notes.forEach((hz,i)=>pan(ctx,v,hz,at+i*step,.07*vol,i===notes.length-1?1.1:.26));
 const top=at+(notes.length-1)*step;clap(ctx,v,top,vol,false);clap(ctx,v,top+.16,vol,false);return top;
}
/** Throttle per cue so the same event arriving from two paths (or a rattle of
 * wall contacts) plays once. */
function throttled(v:Voices,cue:string,now:number,gap:number){const last=v.last.get(cue)??-9;if(now-last<gap)return true;v.last.set(cue,now);return false;}

export function playPinballCue(ctx:AudioContext|null,cue:string,s?:PinballState|null){
 if(typeof document!=='undefined'&&document.hidden)return;
 if(!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 if(cue==='goal'||cue==='level')haptic(cue==='goal'?[18,35,28]:[10,30,10]);
 else if(cue==='dazed'||cue==='save'||cue==='nudge'||cue==='attack'||cue==='pb-wallDown'||cue==='pb-block'||cue==='pb-saver'||cue==='pb-modeDone')haptic(12);
 else if(cue==='pb-perfect'||cue==='pb-read')haptic(8);
 // Oct 26 2026: a tiny tick under the thumb on each flipper press (Android; throttled, off for reduced motion).
 else if(cue==='left'||cue==='right')haptic(5);
 if(!ctx||ctx.state!=='running')return;
 const v=state(ctx),now=ctx.currentTime,vol=volume;
 switch(cue){
  // Flippers: a wood block and a rim-shot, both struck at `now` (same frame as the press), dry. Left a touch lower than right.
  case 'left':case 'right':{const p=cue==='left'?.95:1.06;woodBlock(ctx,v,now,vol,p);rim(ctx,v,now,vol,p);break;}
  case 'launch':{
   // Plunger: the shaker winds up with the pull, the air whooshes up the lane, a rim-shot cracks the ball off the tip over a cajon hit.
   const power=s?plungerPull(s.plunger):.68;
   shaker(ctx,v,now,vol*(.6+power*.5),2,.05);
   noise(ctx,v,now,.16+power*.1,(.04+power*.05)*vol,'bandpass',420,2400*(.6+power*.4),2.2);
   rim(ctx,v,now+.03,vol*(.8+power*.4),.85);cajon(ctx,v,now+.03,vol*(.6+power*.3),70,0,.12);
   break;
  }
  case 'strike':{
   // Ball off the flipper rubber, harder with contact speed; each alternating-foot step rings the next pan note up,
   // and the cajon answers on the off-beat (2x: body, 3x: body + slap, 4x: plus a low bass pan).
   const speed=Math.min(1,(s?.sfx.flipperV??400)/700),step=Math.max(0,Math.min(4,(s?.combination??1)-1));
   rubber(ctx,v,now,vol*(.5+.6*speed),190);
   pan(ctx,v,PENTA[step]*jitter(.004),now+.012,(.03+.03*speed)*vol,.4);
   if(step>=1)cajon(ctx,v,now+.11,vol*.6,110,step>=2?1:0,.14);
   if(step>=3)tone(ctx,v,'sine',PENTA[step]*.25,PENTA[step]*.25,now+.11,.3,.05*vol);
   break;
  }
  case 'pb-wall':{
   // The ball along a guide: a small dry wood tick, a palm-slap crack when it is hit hard.
   if(throttled(v,cue,now,.045))return;
   const hit=Math.min(1,(s?.sfx.wallV??200)/900),hz=1800*jitter(.1);
   tone(ctx,v,'triangle',hz,hz*.9,now,.035,(.008+.022*hit)*vol,.002);
   if(hit>.5)noise(ctx,v,now,.025,.03*hit*vol,'bandpass',2100,1400,1.7,.002);
   break;
  }
  // Timing coach. PERFECT: one clean high pan note that climbs with the streak; READ adds a second note a fifth up.
  // EARLY/LATE: a dull low wood knock, an honest nudge rather than a fail buzzer.
  case 'pb-perfect':case 'pb-read':{
   const step=Math.max(0,Math.min(4,(s?.timing.streak??1)-1)),hz=PENTA[step+2];
   pan(ctx,v,hz,now+.01,.055*vol,.45);
   if(cue==='pb-read')pan(ctx,v,hz*1.5,now+.09,.035*vol,.45);
   break;
  }
  case 'pb-early':case 'pb-late':if(!throttled(v,'pb-timing',now,.4))woodBlock(ctx,v,now,vol*.55,cue==='pb-early'?.26:.21);break;
  case 'pb-gate':if(!throttled(v,cue,now,.08)){shaker(ctx,v,now,vol*.6,1);tone(ctx,v,'triangle',1250*jitter(.05),1000,now,.02,.014*vol,.001);}break;
  case 'dazed':{
   // Defender knock-down: a big cajon hit and the pans climb a step for every knock-down in the chain.
   v.chain=now-v.chainAt<2.2?Math.min(PENTA.length-1,v.chain+1):0;v.chainAt=now;
   cajon(ctx,v,now,vol,88,1.1,.18);pan(ctx,v,PENTA[v.chain]*jitter(.004),now+.01,.07*vol,.5);
   break;
  }
  case 'block':rubber(ctx,v,now,vol*1.1,150);noise(ctx,v,now,.03,.03*vol,'bandpass',2300,1500,1.7,.002);break;
  case 'save':{
   // The keeper figure: a padded rubber slap and the mechanism's thud.
   const hit=Math.min(1,(s?.sfx.keeperV??300)/700);
   rubber(ctx,v,now,vol*(.7+.6*hit),150);noise(ctx,v,now,.06,(.04+.05*hit)*vol,'bandpass',1150*jitter(.06),700,1);
   if(hit>.45&&!throttled(v,'ooh',now,1.2))ooh(ctx,v,now+.08,vol);
   break;
  }
  case 'control':rubber(ctx,v,now,vol*.5,260);break;
  case 'pass':tone(ctx,v,'sine',1567.98*jitter(.01),1560,now,.05,.02*vol,.003);rubber(ctx,v,now,vol*.35,300);break;
  case 'attack':
   // Readable telegraph on the pans: a falling minor third, "watch out".
   pan(ctx,v,392,now,.06*vol,.3);pan(ctx,v,329.63,now+.1,.06*vol,.4);break;
  case 'pb-lit':arpeggio(ctx,v,[523.25,659.25,783.99,1046.5],now,.065,.06*vol);break;
  case 'goal':{
   // A hand-played fanfare: four pan notes up (the last held), two claps, the crowd, a cajon hit; a bonus adds one high note.
   const corner=s?.cue==='corner',bonus=(s?.lastGoalBonus??0)>0;
   const top=fanfare(ctx,v,now,vol,corner?[587.33,739.99,880,1174.66]:[523.25,659.25,783.99,1046.5]);
   roar(ctx,v,now+.05,vol,corner?1.2:1);
   tone(ctx,v,'sine',96,46,top,.2,.15*vol,.002);
   if(bonus)pan(ctx,v,1567.98,now+.6,.035*vol,.5);
   break;
  }
  case 'level':arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5],now+.05,.07,.055*vol);clap(ctx,v,now+.33,vol);break;
  case 'pb-drain':
   // Soft and kind: a kalimba falls away down the pentatonic, the trough rumbles, and the cajon lands dull at the bottom.
   [783.99,659.25,587.33,523.25,392].forEach((hz,i)=>tone(ctx,v,'sine',hz,hz*.97,now+i*.055,.22+i*.04,(.05-i*.005)*vol,.004));
   noise(ctx,v,now,.45,.035*vol,'lowpass',520,140);cajon(ctx,v,now+.36,vol*.9,82,0,.2);break;
  case 'concede':pan(ctx,v,329.63,now,.055*vol,.5);pan(ctx,v,196,now+.14,.055*vol,.7);break;
  case 'rescue':woodBlock(ctx,v,now,vol,1.1);pan(ctx,v,659.25,now+.05,.05*vol,.4);pan(ctx,v,1318.51,now+.16,.04*vol,.5);break;
  case 'nudge':
   // A shove: the cabinet's wooden knock, then the shaker rattles.
   if(throttled(v,cue,now,.12))return;
   tone(ctx,v,'sine',88*jitter(.05),42,now,.16,.16*vol,.002);woodBlock(ctx,v,now,vol*.7,.45);shaker(ctx,v,now+.03,vol);break;
  case 'pb-whistle':whistle(ctx,v,now,[[0,.13],[.19,.24]],vol);break;
  // ---- playfield features -------------------------------------------------
  case 'pb-sling':
   // Slingshot: a tighter cajon slap, higher and shorter than a bumper.
   if(throttled(v,cue,now,.06))return;
   cajon(ctx,v,now,vol*.85,160,1.4,.07);break;
  case 'pb-cone':{
   // Pop bumper (the rondo cones): a cajon thump, and the pan walks a pentatonic step an octave down.
   if(throttled(v,cue,now,.05))return;
   v.chain=now-v.chainAt<1.6?(v.chain+1)%5:0;v.chainAt=now;
   cajon(ctx,v,now,vol*.9,120,1,.13);pan(ctx,v,PENTA[v.chain]*.5*jitter(.004),now+.008,.05*vol,.4,true);break;
  }
  case 'pb-drop':woodBlock(ctx,v,now,vol,.6);pan(ctx,v,783.99,now+.02,.035*vol,.3);rim(ctx,v,now+.05,vol*.5,1.2);/* the target clacks onto its stop */break;
  case 'pb-wallDown':
   cajon(ctx,v,now,vol,80,1.2,.2);arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5],now+.08,.055,.05*vol);break;
  case 'pb-flag':{
   // Corner flag: one pan note, a step higher for every letter lit.
   const n=Math.min(4,(s?.table.flags.toString(2).split('1').length??1)-1);
   pan(ctx,v,PENTA[2+n]*jitter(.004),now,.055*vol,.45,true);break;
  }
  case 'pb-word':arpeggio(ctx,v,[587.33,739.99,880,1174.66],now,.07,.055*vol);clap(ctx,v,now+.3,vol*.8);clap(ctx,v,now+.44,vol*.8,false);break;
  // Round 3 hot zone ("in the space"): a quick rising three-note pan run.
  case 'hotZone':[784,987.8,1318.5].forEach((hz,i)=>pan(ctx,v,hz,now+i*.06,.045*vol,.3));break;
  case 'pb-lane':if(!throttled(v,cue,now,.1)){shaker(ctx,v,now,vol*.5,1);pan(ctx,v,1046.5*jitter(.01),now,.03*vol,.25);}break;
  case 'pb-crest':arpeggio(ctx,v,[783.99,987.77,1174.66],now,.06,.05*vol,'sine');break;
  case 'pb-skill':arpeggio(ctx,v,[659.25,783.99,1046.5,1318.51,1567.98],now,.05,.05*vol);break;
  case 'pb-spin':if(!throttled(v,cue,now,.045)){noise(ctx,v,now,.01,.022*vol,'highpass',6400);tone(ctx,v,'triangle',1900*jitter(.06),1700,now,.014,.01*vol,.001);}break;
  case 'pb-dugout':
   // The ball drops into the scoop: a cajon knock, the box air, then one low pan note as the eject cocks.
   cajon(ctx,v,now,vol*.8,130,.5,.12);pan(ctx,v,329.63,now+.12,.03*vol,.5);break;
  case 'pb-mode':
   whistle(ctx,v,now,[[0,.11],[.15,.11],[.3,.3]],vol);
   arpeggio(ctx,v,[523.25,659.25,783.99],now+.5,.06,.045*vol);break;
  case 'pb-modeDone':arpeggio(ctx,v,[523.25,659.25,783.99,1046.5,1318.51],now,.07,.06*vol,'triangle',.18);roar(ctx,v,now+.05,vol*.8);clap(ctx,v,now+.4,vol*.7);break;
  case 'pb-modeEnd':pan(ctx,v,523.25,now,.04*vol,.3);pan(ctx,v,392,now+.12,.04*vol,.5);break;
  case 'pb-block':
   // Great block: a solid rubber thump, then a rising "go!" on the pans for the fast break.
   rubber(ctx,v,now,vol*1.3,120);arpeggio(ctx,v,[659.25,880,1174.66],now+.1,.05,.05*vol);break;
  case 'pb-saver':rim(ctx,v,now,vol,1.3);tone(ctx,v,'sine',523.25,1046.5,now,.16,.05*vol,.004);break;
  case 'pb-final':
   whistle(ctx,v,now,[[0,.4]],vol);
   arpeggio(ctx,v,[392,523.25,659.25,783.99,1046.5],now+.45,.07,.06*vol,'triangle',.2);roar(ctx,v,now+.4,vol);break;
  // ---- match flow, keeper parry, wall pass and the 2v1 multiball -----------
  case 'pb-parry':
   // The keeper punches it clear: a hard rubber slap that flicks upward.
   rubber(ctx,v,now,vol*1.2,220);noise(ctx,v,now,.05,.07*vol,'bandpass',1500*jitter(.05),2400,1.2);
   if(!throttled(v,'ooh',now,1.2))ooh(ctx,v,now+.07,vol);break;
  case 'pb-streak':{
   // Switch-feet streak: two (or three) rising pan notes over a cajon body-and-slap.
   const four=(s?.combination??3)>=4;
   arpeggio(ctx,v,four?[783.99,1046.5,1318.51]:[659.25,880],now+.04,.09,.05*vol,'triangle',.14);
   cajon(ctx,v,now,vol*.6,110,1,.14);
   break;
  }
  case 'wallPass':arpeggio(ctx,v,[659.25,987.77],now,.07,.055*vol,'triangle',.12);break;
  case 'multiball':
   whistle(ctx,v,now,[[0,.12],[.16,.12]],vol);
   arpeggio(ctx,v,[523.25,659.25,783.99,1046.5],now+.32,.055,.06*vol);cajon(ctx,v,now+.3,vol,90,1,.16);roar(ctx,v,now+.3,vol*.8);break;
  case 'mbGoal':{
   const top=fanfare(ctx,v,now,vol,[587.33,739.99,880,1174.66],.07);
   roar(ctx,v,now+.05,vol);tone(ctx,v,'sine',96,46,top,.2,.15*vol,.002);break;
  }
  case 'mbSave':cajon(ctx,v,now,vol*.8,120,.8,.12);pan(ctx,v,659.25,now+.04,.04*vol,.4);break;
  case 'mbEnd':pan(ctx,v,659.25,now,.035*vol,.3);pan(ctx,v,523.25,now+.1,.035*vol,.5);break;
  case 'halfTime':whistle(ctx,v,now,[[0,.18],[.26,.3]],vol);break;
  case 'stoppage':whistle(ctx,v,now,[[0,.12]],vol);break;
  // Nov 8 2026: a new personal best (any board): a rising pan run, then two flammed claps (the hand-played free-game call),
  // once per run (pooled voices).
  case 'pb-best':if(!throttled(v,cue,now,2)){arpeggio(ctx,v,[PENTA[2],PENTA[4],PENTA[5],PENTA[7]],now+.05,.09,.045*vol);clap(ctx,v,now+.45,vol);clap(ctx,v,now+.6,vol);}break;
  // The referee's full-time whistle: short, short, long.
  case 'fullTime':whistle(ctx,v,now,[[0,.16],[.24,.16],[.48,.6]],vol);break;
  // Endless play: a milestone ball (a bright rising run and a clap).
  case 'extraBall':arpeggio(ctx,v,[523.25,659.25,783.99,1046.5],now+.02,.06,.05*vol);clap(ctx,v,now+.28,vol);break;
  case 'pb-over':arpeggio(ctx,v,[783.99,659.25,523.25,392],now+.15,.14,.045*vol,'sine',.3);break;
  default:woodBlock(ctx,v,now,vol*.3,.3);
 }
}

/** The ball rolling on the playfield: one looped noise source through a low-pass, level and brightness following ball speed
 * (table units per second). Call every frame while the ball is live.
 * Pass 2 (Safari): the voice no longer leans on repeated stop() calls (WebKit throws on a second stop() and ignores a moved stop
 * time). The source, filter and gain are created ONCE per AudioContext and never stopped; loudness is only a gain envelope that
 * decays by itself ~0.2 s after the last call. When the calls stop (drain, pause, results, a sleeping table) one timer parks the
 * voice by disconnecting it from the destination, so a silent table pulls no audio graph; the next call plugs it back in. */
type Roll={src:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode;live:boolean;until:number;timer:ReturnType<typeof setTimeout>|null};
const rolls=new WeakMap<AudioContext,Roll>();
export function pinballRollSound(ctx:AudioContext|null,speed:number){
 if(!ctx||ctx.state!=='running'||typeof ctx.createBufferSource!=='function')return;
 const now=ctx.currentTime,volume=isSoundEnabled()&&!(typeof document!=='undefined'&&document.hidden)?getSoundVolume():0;let r=rolls.get(ctx);
 const level=Math.min(1,Math.max(0,(speed-40)/900))*volume;
 if(!r){if(level<=0)return;
  const v=state(ctx);if(!v.noise){const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.8),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;v.noise=buffer;}
  try{const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=v.noise;src.loop=true;src.playbackRate.value=.55;filter.type='lowpass';filter.Q.value=1.4;filter.frequency.value=240;gain.gain.value=0;
   src.connect(filter);filter.connect(gain);src.start(now);r={src,filter,gain,live:false,until:0,timer:null};rolls.set(ctx,r);}catch{return;}}
 const voice=r;
 try{if(!voice.live){if(level<=0)return;voice.gain.connect(bus(ctx,state(ctx)));voice.live=true;}
  voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(.075*level,now,.05);voice.gain.gain.setTargetAtTime(0,now+.14,.09);
  voice.filter.frequency.setTargetAtTime(210+level*820,now,.07);voice.until=now+.9;
  if(voice.timer===null){const park=()=>{voice.timer=null;const left=voice.until-ctx.currentTime;if(left>0&&ctx.state==='running'){voice.timer=setTimeout(park,left*1000+40);return;}try{voice.gain.disconnect();}catch{}voice.live=false;};voice.timer=setTimeout(park,940);}
 }catch{/* a closed context: drop the voice, the next call on a live context rebuilds it */rolls.delete(ctx);}
}

