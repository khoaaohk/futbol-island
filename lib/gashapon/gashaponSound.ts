/**
 * Gashapon sounds (round 2, Nov 8 2026): original synth, no audio files. Through the page's one shared AudioContext
 * (lib/konbini/konbiniSound.ts, which returns null while the island is muted), at the island's volume. Each call schedules a
 * handful of oscillators / one short noise burst that stop within a second; nothing loops and nothing runs between spins.
 *  - crank(): three ratchet clicks as the handle turns;
 *  - clunk(): the capsule dropping into the tray;
 *  - pop(): the capsule opening;
 *  - jingle(rarity): a short rising jingle (common 2 notes, uncommon 3, rare 5 with a sparkle).
 */
import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {konbiniAudioContext,unlockKonbiniAudio} from '../konbini/konbiniSound';
import type {ToyRarity} from './toys';

let click:AudioBuffer|null=null;
function ctx(){if(!isSoundEnabled())return null;const c=konbiniAudioContext();return c&&c.state!=='closed'?c:null;}
function tone(c:AudioContext,hz:number,end:number,at:number,dur:number,vol:number,type:OscillatorType='sine'){
 try{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at,v=vol*getSoundVolume()*2;o.type=type;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);}catch{/* no audio */}
}
function tick(c:AudioContext,at:number,vol:number,hz:number){
 try{if(!click){const n=Math.round(c.sampleRate*.025),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let seed=7;for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/2147483648-1)*Math.pow(1-i/n,3);}click=b;}
  const src=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+at;src.buffer=click;bp.type='bandpass';bp.frequency.value=hz;bp.Q.value=2;g.gain.value=vol*getSoundVolume()*2;
  src.connect(bp);bp.connect(g);g.connect(c.destination);src.start(t);}catch{/* no audio */}
}
export const gashaponSound={
 /** Call from the Spin tap (a user gesture) so the context may start. */
 unlock(){if(isSoundEnabled())unlockKonbiniAudio();},
 crank(){const c=ctx();if(!c)return;for(let i=0;i<3;i++){tick(c,i*.16,.09,2600-i*150);tone(c,900-i*60,700-i*60,i*.16,.03,.012,'square');}},
 clunk(){const c=ctx();if(!c)return;tone(c,190,70,0,.18,.11);tick(c,0,.05,700);tone(c,300,150,.12,.08,.03,'triangle');},
 pop(){const c=ctx();if(!c)return;tick(c,0,.06,1800);tone(c,480,1150,0,.11,.05);},
 jingle(r:ToyRarity){const c=ctx();if(!c)return;const notes=r==='rare'?[784,988,1175,1568,1976]:r==='uncommon'?[659,880,1109]:[659,988];
  notes.forEach((hz,i)=>tone(c,hz,hz,.04+i*.085,.22,r==='rare'?.035:.03,'triangle'));if(r==='rare')for(let i=0;i<4;i++)tone(c,2640+i*220,2900+i*220,.5+i*.05,.09,.012);},
 buzz(){const c=ctx();if(!c)return;tone(c,170,150,0,.16,.035,'square');},
};
