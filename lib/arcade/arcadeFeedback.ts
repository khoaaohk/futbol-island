import {isSoundEnabled,getSoundVolume} from '../games/sound';

/** Tiny event voices on the game's existing context. No assets, timers or loops. */
const voices=new WeakMap<AudioContext,number>();
let lastHaptic=0;
export function arcadeFeedback(ctx:AudioContext|null,cue:string){
 if(typeof document==='undefined'||document.hidden||!isSoundEnabled())return;
 const volume=getSoundVolume();if(volume<=0)return;
 const reward=['goal','perfect','level','skill','combo'].includes(cue);
 const heavy=['shot','slam','scissor','clear','hit','nudge','charge3','attack'].includes(cue);
 const nowMs=performance.now();
 if((reward||heavy)&&nowMs-lastHaptic>150&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof navigator.vibrate==='function'){
  lastHaptic=nowMs;navigator.vibrate(cue==='goal'?[18,35,28]:cue==='perfect'?[9,24,12]:heavy?14:8);
 }
 if(!ctx||ctx.state!=='running'||(voices.get(ctx)??0)>=6)return;
 const tones=cue==='goal'||cue==='level'?[523,659,784]:cue==='perfect'?[784,1047]:[cue.startsWith('charge')?160+Number(cue.slice(-1))*90:cue==='collect'?880:cue==='pass'?350:cue==='control'?290:cue==='header'?420:cue==='lob'?320:cue==='drop'?280:cue==='save'||cue==='block'?145:heavy?110:230];
 tones.slice(0,Math.max(0,6-(voices.get(ctx)??0))).forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+i*.065,duration=reward?.18:heavy?.14:.075;
  voices.set(ctx,(voices.get(ctx)??0)+1);osc.type=heavy?'triangle':'sine';osc.frequency.setValueAtTime(hz,at);osc.frequency.exponentialRampToValueAtTime(hz*(reward?1.02:heavy?.4:.72),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(volume*(heavy?.09:.055),at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.01);osc.onended=()=>{voices.set(ctx,Math.max(0,(voices.get(ctx)??1)-1));osc.disconnect();gain.disconnect();};
 });
}
