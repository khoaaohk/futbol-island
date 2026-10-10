import {isSoundEnabled,getSoundVolume} from '../games/sound';

/**
 * Island Strikers sound: all synthesized on the game's own AudioContext, with no files or timers.
 * - One shared noise buffer feeds the crowd, roar, scuffs and whistle breath.
 * - The crowd bed is a single looping source. It runs only while a match is playing, and its
 *   gain/filter follow attack energy from the existing game loop.
 * - Stadium drums are scheduled from the same loop (lookahead), only during big attacks and only
 *   with music on.
 * - Voices are capped; every node disconnects when it ends.
 */
export type StrikerCue='pass'|'shot'|'touch'|'tackle'|'hit'|'save'|'post'|'miss'|'board'|'goal'|'concede'|'intercept'|'focus'|'switch'|'kickoff'|'fulltime'|'charge'|'perfect'|'skill'|'beat'|'foul'|'spirit'|'special'|'star'|'call'|'chain';
const MAX_VOICES=14;
export function createStrikerAudio(){
 let ctx:AudioContext|null=null,out:GainNode|null=null,noise:AudioBuffer|null=null,voices=0;
 let crowd:{src:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode}|null=null,crowdTarget=-1;
 let nextBeat=0,beat=0,music=true;
 const jitter=(amount:number)=>1+(Math.random()*2-1)*amount;
 const musicOn=()=>{try{return localStorage.getItem('fi2-music-enabled')!=='false';}catch{return true;}};
 function attach(next:AudioContext|null){if(!next||next===ctx)return;ctx=next;out=next.createGain();out.gain.value=1;out.connect(next.destination);
  const length=Math.floor(next.sampleRate*1.3),buffer=next.createBuffer(1,length,next.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;noise=buffer;}
 function live(){return ctx&&out&&ctx.state==='running'&&isSoundEnabled()&&typeof document!=='undefined'&&!document.hidden?ctx:null;}
 function end(nodes:AudioNode[]){voices=Math.max(0,voices-1);for(const n of nodes)try{n.disconnect();}catch{}}
 /** Pitch-swept oscillator with a fast attack and exponential decay. */
 function tone(at:number,hz:number,toHz:number,duration:number,level:number,type:OscillatorType='sine',lowpass=0){const c=ctx!;if(voices>=MAX_VOICES)return;voices++;
  const osc=c.createOscillator(),gain=c.createGain(),filter=lowpass?c.createBiquadFilter():null;osc.type=type;osc.frequency.setValueAtTime(hz,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,toHz),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(level,at+.006);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  if(filter){filter.type='lowpass';filter.frequency.value=lowpass;osc.connect(filter);filter.connect(gain);}else osc.connect(gain);gain.connect(out!);
  osc.start(at);osc.stop(at+duration+.02);osc.onended=()=>end(filter?[osc,filter,gain]:[osc,gain]);}
 /** Filtered noise burst, optionally sweeping the filter (whoosh, roar, scuff). */
 function hiss(at:number,duration:number,level:number,type:BiquadFilterType,hz:number,toHz=hz,q=1,attack=.004){const c=ctx!;if(voices>=MAX_VOICES||!noise)return;voices++;
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=noise;src.loop=duration>1.2;filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(hz,at);filter.frequency.exponentialRampToValueAtTime(Math.max(30,toHz),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(level,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);src.connect(filter);filter.connect(gain);gain.connect(out!);
  src.start(at,Math.random()*.5);src.stop(at+duration+.02);src.onended=()=>end([src,filter,gain]);}
 /** Crowd vowel: two formant bands over noise. "ooh" for near misses, "ahh" for saves. */
 function vowel(at:number,duration:number,level:number,f1:number,f2:number,rise=1.2){hiss(at,duration,level,'bandpass',f1,f1*rise,5,duration*.3);hiss(at,duration,level*.6,'bandpass',f2,f2*rise,6,duration*.3);}
 /** Referee whistle: a pea-whistle trill (fast vibrato) plus breath. */
 function whistle(at:number,duration:number,level:number){const c=ctx!;if(voices>=MAX_VOICES-1)return;voices++;
  const osc=c.createOscillator(),lfo=c.createOscillator(),depth=c.createGain(),gain=c.createGain();osc.type='sine';osc.frequency.value=2650*jitter(.02);lfo.frequency.value=34;depth.gain.value=170;lfo.connect(depth);depth.connect(osc.frequency);
  gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(level,at+.02);gain.gain.setValueAtTime(level,at+duration-.05);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(out!);
  osc.start(at);lfo.start(at);osc.stop(at+duration+.02);lfo.stop(at+duration+.02);osc.onended=()=>end([osc,lfo,depth,gain]);hiss(at,duration,level*.25,'bandpass',3200,3000,2,.02);}
 function cue(kind:StrikerCue,power=.5){const c=live();if(!c)return;const v=getSoundVolume();if(v<=0)return;const at=c.currentTime+.005,j=jitter(.07);
  switch(kind){
   case 'pass':tone(at,190*j,85,.09,v*.32);hiss(at,.035,v*.09,'highpass',2600*j);break;
   case 'touch':tone(at,230*j,130,.06,v*.16);break;
   case 'shot':{const p=Math.max(0,Math.min(1,power));tone(at,125*j,42,.17,v*(.36+p*.3));hiss(at,.05,v*.16,'bandpass',1300*j,900,1.4);if(p>.6)hiss(at+.01,.32+p*.15,v*.12*p,'bandpass',700,2600,1.6,.03);break;}
   case 'tackle':hiss(at,.2,v*.16,'lowpass',700*j,250,.8,.02);break;
   case 'hit':tone(at,92*j,48,.15,v*.42);hiss(at,.11,v*.15,'lowpass',950,300);break;
   case 'save':tone(at,150*j,70,.1,v*.32);hiss(at,.05,v*.22,'bandpass',1900*j,1500,1.2);vowel(at+.06,1,v*.13,720,1150,.85);break;
   case 'post':for(const [hz,l] of [[1180,.13],[1730,.08],[2550,.05]] as const)tone(at,hz*j,hz*.995,.55,v*l,'sine');tone(at,140,60,.1,v*.3);vowel(at+.08,1.1,v*.15,360,820,1.25);break;
   case 'miss':vowel(at,1.05,v*.15,340,800,1.3);break;
   case 'board':tone(at,135*j,68,.1,v*.22);hiss(at,.06,v*.08,'lowpass',420);break;
   case 'goal':whistle(at,.32,v*.09);hiss(at,2.4,v*.24,'bandpass',480,1100,.7,.22);hiss(at+.05,1.8,v*.1,'highpass',2400,3400,.5,.3);
    // Short brass-like stinger (the only "music" a goal needs): a rising triad through a lowpass.
    [[233,0],[294,.09],[349,.18],[466,.3]].forEach(([hz,d])=>tone(at+d,hz,hz*1.01,.5,v*.06,'sawtooth',1500));break;
   case 'concede':whistle(at,.28,v*.08);vowel(at+.1,1.3,v*.12,300,700,.8);break;
   case 'intercept':tone(at,210*j,110,.07,v*.2);vowel(at+.05,.7,v*.07,320,760,.85);break;
   case 'focus':tone(at,880,885,.12,v*.07);tone(at+.08,1320,1325,.18,v*.06);break;
   case 'switch':tone(at,620*j,700,.05,v*.06,'triangle');break;
   case 'kickoff':whistle(at,.55,v*.1);break;
   case 'fulltime':whistle(at,.18,v*.1);whistle(at+.28,.18,v*.1);whistle(at+.56,.75,v*.1);hiss(at+.6,2.2,v*.12,'bandpass',600,900,.7,.4);break;
   case 'charge':tone(at,260*j,520,.12,v*.05,'triangle');break;
   // Perfect first touch: a bright two-note sparkle on top of the contact.
   case 'perfect':tone(at,990,995,.1,v*.08,'triangle');tone(at+.06,1480,1490,.2,v*.07,'triangle');tone(at,220*j,120,.06,v*.18);break;
   // Skill move: a quick scuff-whoosh; "beat" adds the crowd's delighted rise when it beats a tackle.
   case 'skill':hiss(at,.16,v*.1,'bandpass',900*j,2200,1.5,.02);tone(at+.05,240*j,150,.05,v*.12);break;
   case 'beat':hiss(at,.18,v*.1,'bandpass',900*j,2400,1.5,.02);vowel(at+.08,.9,v*.12,420,1050,1.3);break;
   case 'foul':whistle(at,.22,v*.1);whistle(at+.3,.22,v*.1);break;
   // Team spirit full: a rising arpeggio. Special strike: long charged whoosh under the kick.
   case 'spirit':[[523,0],[659,.07],[784,.14],[1046,.21]].forEach(([hz,d])=>tone(at+d,hz,hz*1.01,.25,v*.06,'triangle'));break;
   case 'special':hiss(at,.7,v*.2,'bandpass',300,3200,1.4,.05);tone(at,90,40,.4,v*.4);break;
   case 'star':tone(at,1175,1180,.25,v*.07,'sine');tone(at+.12,1568,1575,.35,v*.07,'sine');break;
   case 'call':tone(at,700*j,940,.08,v*.07,'square',2000);break;
   // Pass chain (Oct 9 2026): each completed Gold pass in a move rings one step higher on a major pentatonic, so a
   // passing move is heard building. power = passes in the chain (2..); the scale tops out after six.
   case 'chain':{const step=Math.max(0,Math.min(5,Math.round(power)-2)),hz=[523,587,659,784,880,1047][step];tone(at,hz,hz*1.005,.16,v*.06,'triangle');if(step>=2)tone(at+.05,hz*1.5,hz*1.505,.2,v*.035,'sine');break;}
  }}
 /** Start the crowd bed when play starts; stop it on pause, hide or full time. */
 function startCrowd(){const c=live();if(!c||crowd||!noise)return;const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=noise;src.loop=true;filter.type='bandpass';filter.Q.value=.55;filter.frequency.value=520;gain.gain.value=.0001;src.connect(filter);filter.connect(gain);gain.connect(out!);src.start();crowd={src,filter,gain};crowdTarget=-1;music=musicOn();}
 function stopCrowd(){if(!crowd)return;const c=ctx!,{src,filter,gain}=crowd;crowd=null;try{gain.gain.setTargetAtTime(.0001,c.currentTime,.12);src.stop(c.currentTime+.5);}catch{}src.onended=()=>{for(const n of [src,filter,gain])try{n.disconnect();}catch{}};}
 /** Called from the game loop only while playing: energy 0..1.6. Starts the bed lazily once the context is running; writes automation only when the level changes. */
 function setCrowd(energy:number){const c=live();if(!c)return;if(!crowd)startCrowd();if(!crowd)return;const v=getSoundVolume();
  // Stadium drums join only when an attack builds; a short lookahead from the game loop, no timer.
  if(energy>.55&&music){if(nextBeat<c.currentTime)nextBeat=c.currentTime+.05;while(nextBeat<c.currentTime+.25){if([1,0,1,0,1,1,1,0][beat%8])tone(nextBeat,98*jitter(.03),46,.2,v*.16*Math.min(1,energy));if(beat%8===6)hiss(nextBeat,.07,v*.05,'bandpass',1500,1400,1.2);nextBeat+=.2;beat++;}}else beat=0;
  const target=v*(.016+Math.min(1.6,energy)*.05);if(Math.abs(target-crowdTarget)<.003)return;crowdTarget=target;
  crowd.gain.gain.setTargetAtTime(target,c.currentTime,energy>1?.08:.35);crowd.filter.frequency.setTargetAtTime(430+Math.min(1.6,energy)*420,c.currentTime,.3);}
 function dispose(){stopCrowd();try{out?.disconnect();}catch{}ctx=null;out=null;noise=null;voices=0;}
 return{attach,cue,startCrowd,stopCrowd,setCrowd,dispose};
}
