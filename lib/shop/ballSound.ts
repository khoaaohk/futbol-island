/**
 * Football shop · Ball studio sounds (Oct 12 2026): a synthesised boot-on-ball "thock" for Kick!, softer thuds for each
 * bounce, and tiny pops for stickers, stamps and fills. WebAudio only (no downloads), one context created on the first
 * gesture, honouring the island's sound settings (lib/games/sound.ts: fi2-sound-muted / fi2-sound-volume). Nothing runs
 * between sounds; close() frees the context when the studio closes.
 */
import {getSoundVolume,isSoundEnabled} from '../games/sound';

export type BallSound={kick(strength:number):void;pop(pitch?:number):void;close():void};
export function createBallSound():BallSound{
 let ctx:AudioContext|null=null,noise:AudioBuffer|null=null;
 const ready=():AudioContext|null=>{
  if(!isSoundEnabled())return null;
  try{if(!ctx){const AC=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return null;ctx=new AC();}
   if(ctx.state==='suspended')void ctx.resume();return ctx;}catch{return null;}};
 const noiseBuf=(c:AudioContext)=>{if(noise)return noise;const n=Math.floor(c.sampleRate*.12);noise=c.createBuffer(1,n,c.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);return noise;};
 /** A pitched thump: a sine falling from f0 to f1 with a fast attack and a short decay, plus a filtered noise click. */
 function thump(c:AudioContext,level:number,f0:number,f1:number,dur:number,click:number){const t=c.currentTime+.005,vol=getSoundVolume()*level;if(vol<=0)return;
  const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02);
  if(click>0){const s=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain();s.buffer=noiseBuf(c);f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;
   gn.gain.setValueAtTime(vol*click,t);gn.gain.exponentialRampToValueAtTime(.0005,t+.05);s.connect(f).connect(gn).connect(c.destination);s.start(t);s.stop(t+.06);}}
 return {
  /** strength 1 = the kick itself (a punchy thock); below 1 = a bounce (quieter, duller as it dies away). */
  kick(strength){const c=ready();if(!c)return;if(strength>=1)thump(c,.55,190,58,.2,.5);else thump(c,.18+.3*strength,120+40*strength,52,.14,.15*strength);},
  pop(pitch=1){const c=ready();if(!c)return;const t=c.currentTime+.005,vol=getSoundVolume()*.16;if(vol<=0)return;const o=c.createOscillator(),g=c.createGain();o.type='triangle';
   o.frequency.setValueAtTime(520*pitch,t);o.frequency.exponentialRampToValueAtTime(980*pitch,t+.07);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0005,t+.12);
   o.connect(g).connect(c.destination);o.start(t);o.stop(t+.14);},
  close(){try{void ctx?.close();}catch{}ctx=null;noise=null;},
 };
}
