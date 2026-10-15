/**
 * Painting easel sounds (Oct 14 2026): original synth, nothing downloaded. Through the walk-in rooms' one shared AudioContext
 * (lib/konbini/konbiniSound.ts, unlocked on the same gestures), and respecting the island's mute and volume.
 *  - sea(): a very quiet wash of surf while you sit at the easel: one 6 s looped noise buffer through a low-pass, its level breathing
 *    with a slow LFO (two nodes and one oscillator; stopped and released the moment you leave or mute);
 *  - brush(): a soft bristle swish when a stroke starts (a 0.12 s band-passed noise burst).
 * No timers, no loops of our own: the Web Audio graph does the work only while seated.
 */
import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {konbiniAudioContext,unlockKonbiniAudio} from '../konbini/konbiniSound';

let sea:{src:AudioBufferSourceNode;lfo:OscillatorNode;gain:GainNode}|null=null;
let swish:AudioBuffer|null=null;
function noiseBuffer(c:AudioContext,seconds:number,brown:boolean){
 const len=Math.max(1,Math.round(c.sampleRate*seconds)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let seed=12345,last=0;
 for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const w=seed/2147483648-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.2;}else d[i]=w*(1-i/len);}
 // Cross-fade the loop's ends so the wash has no click.
 if(brown){const f=Math.min(len>>2,c.sampleRate>>1);for(let i=0;i<f;i++){const t=i/f;d[i]=d[i]*t+d[len-f+i]*(1-t);}}
 return buf;
}
export const paintSound={
 seaStart(){
  if(sea||!isSoundEnabled())return;unlockKonbiniAudio();const c=konbiniAudioContext();if(!c)return;
  try{const src=c.createBufferSource();src.buffer=noiseBuffer(c,6,true);src.loop=true;
   const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=.4;
   const gain=c.createGain(),level=.05*getSoundVolume();gain.gain.value=0;gain.gain.setTargetAtTime(level,c.currentTime,1.2);
   // The swell: an 8 s LFO on the level (± a third), like waves arriving.
   const lfo=c.createOscillator(),depth=c.createGain();lfo.frequency.value=.125;depth.gain.value=level*.35;lfo.connect(depth);depth.connect(gain.gain);
   src.connect(lp);lp.connect(gain);gain.connect(c.destination);src.start();lfo.start();sea={src,lfo,gain};}catch{sea=null;}
 },
 seaStop(){
  const s=sea;sea=null;if(!s)return;const c=konbiniAudioContext();
  try{if(c){s.gain.gain.cancelScheduledValues(c.currentTime);s.gain.gain.setTargetAtTime(0,c.currentTime,.25);s.src.stop(c.currentTime+1.2);s.lfo.stop(c.currentTime+1.2);}else{s.src.stop();s.lfo.stop();}}catch{/* already stopped */}
 },
 brush(soft=false){
  if(!isSoundEnabled())return;const c=konbiniAudioContext();if(!c||c.state!=='running')return;
  try{swish??=noiseBuffer(c,.14,false);const src=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();src.buffer=swish;
   bp.type='bandpass';bp.frequency.value=soft?1800:2600;bp.Q.value=.8;g.gain.value=(soft?.022:.03)*getSoundVolume()*2;
   src.connect(bp);bp.connect(g);g.connect(c.destination);src.start();}catch{/* no audio */}
 },
};
