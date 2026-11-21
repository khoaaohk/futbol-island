/**
 * Keepy-Uppy Beat music as data (Nov 21 2026): a track's patterns (charts.ts) -> the list of sound events for a span of beats. Pure,
 * so tests/keepyuppy-core.cjs can check that every event sits exactly on its sixteenth for every tempo; audio.ts turns the beats into
 * AudioContext times and plays them. Arrangement: the count-in is four clicks; the kick is there from bar 1 so the beat is never
 * unclear; clap, shaker and bass come in over the first bars; the lead motif plays on every second four-bar phrase and to the end.
 */
import type {Music} from './charts';
export type Voice='click'|'kick'|'clap'|'shaker'|'bass'|'lead'|'crash';
export type MusicEvent={beat:number;voice:Voice;/** MIDI note for bass / lead; 1 = accent for drums */v:number};
const at=(pat:string,bar:number,step:number)=>pat[(bar*16+step)%pat.length];
export const degreeToMidi=(m:Music,deg:number,octave=0)=>m.root+octave*12+m.scale[deg%m.scale.length]+12*Math.floor(deg/m.scale.length);
/** `mode` 'full' = the arrangement, 'drums' = kick and clap only (lessons), 'click' = a click on every beat (the tap-timing check). */
export function musicEvents(m:Music,fromBeat:number,toBeat:number,bars:number,mode:'full'|'drums'|'click'='full'):MusicEvent[]{
 // sixteenth k is in the span when from <= k/4 < to; the same rounding at both ends, so back-to-back spans never repeat or skip one
 const out:MusicEvent[]=[],edge=(b:number)=>Math.ceil(b*4-1e-9)+0,first=edge(fromBeat),stop=Math.min(edge(toBeat),bars*16);
 for(let k=first;k<stop;k++){const beat=k/4;
  if(k<0){if(k%4===0)out.push({beat,voice:'click',v:k===-16?1:0});continue;}
  if(mode==='click'){if(k%4===0)out.push({beat,voice:'click',v:1});continue;}
  const bar=Math.floor(k/16),step=k%16;
  if(at(m.kick,bar,step)!=='.')out.push({beat,voice:'kick',v:step===0?1:0});
  if((bar>=1||mode==='drums')&&at(m.clap,bar,step)!=='.')out.push({beat,voice:'clap',v:0});
  if(mode==='drums')continue;
  if(bar>=2){const c=at(m.shaker,bar,step);if(c!=='.')out.push({beat,voice:'shaker',v:c==='X'?1:0});}
  if(bar>=2){const c=at(m.bass,bar,step);if(c!=='.')out.push({beat,voice:'bass',v:degreeToMidi(m,parseInt(c,16),-1)});}
  if(bar>=4&&(Math.floor(bar/4)%2===1||bar>=bars-4)){const c=at(m.motif,bar,step);if(c!=='.')out.push({beat,voice:'lead',v:degreeToMidi(m,parseInt(c,16),1)});}}
 if(mode==='full'&&first<=bars*16&&edge(toBeat)>bars*16)out.push({beat:bars*4,voice:'crash',v:1});
 return out;
}
/** A steady clock for the game from two unsteady ones. `audio()` is AudioContext.currentTime minus the song's start (null when sound
 *  is off or the context is not running); `perf()` is performance.now() in seconds. The song time follows the smooth perf clock and is
 *  pulled back onto the audio clock whenever the two drift more than 12 ms, so taps (timed with perf) are judged against what is heard. */
export function createSongClock(perf:()=>number,audio:()=>number|null){
 let off=0,running=false,held=0;
 return {
  /** start (or restart) the song so that `now()` reads `at` */
  start(at:number){off=perf()-at;running=true;held=at;},
  now(){if(!running)return held;let t=perf()-off;const a=audio();if(a!==null&&Math.abs(a-t)>.012){off=perf()-a;t=a;}return t;},
  /** the song time of an event stamped with performance time `p` (seconds) */
  at(p:number){return running?p-off:held;},
  pause(){if(running){held=this.now();running=false;}},
  resume(){if(!running){off=perf()-held;running=true;}},
  get running(){return running;},
 };
}
