import {getSoundVolume,isSoundEnabled} from '../games/sound';
/**
 * Konbini one-shot sounds: the door chime (a generic two-note ding-dong, not any chain's jingle), the register, a bite and
 * the layer "tick" used by the purchase reveal. Oscillators only, created on demand and stopped within a second; no loop,
 * no scheduler, no assets. Respects the island's mute and volume settings.
 */
let shared:AudioContext|null=null;
/** The page's one AudioContext (door chime, register, bites, reveal ticks and the in-store music). */
export function konbiniAudioContext(){return context();}
function context(){if(!isSoundEnabled())return null;try{if(shared?.state==='closed')shared=null;shared??=new AudioContext();if(shared.state==='suspended')void shared.resume().catch(()=>{});return shared.state==='closed'?null:shared;}catch{return null;}}
function tone(freq:number,start:number,dur:number,gain=.12,type:OscillatorType='sine'){
 const c=context();if(!c)return;const t=c.currentTime+start,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
 const peak=gain*getSoundVolume()*2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
}
export const konbiniTick=(step=0)=>tone(880+step*70,0,.08,.06,'triangle');
/** A short filtered-noise burst (steam hiss, page riffle, paper flick, whoosh). One-shot, stopped within its length. */
function noise(start:number,dur:number,gain:number,freq:number,q=1,sweepTo?:number){
 const c=context();if(!c)return;const t=c.currentTime+start,len=Math.max(1,Math.round(c.sampleRate*dur)),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let seed=len;
 for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/2147483648-1)*(1-i/len);}
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;f.type='bandpass';f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q;
 g.gain.setValueAtTime(gain*getSoundVolume()*2,t);src.connect(f);f.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur+.02);
}
/** Delight one-shots (review top 10, Sep 29 2026): all ≤ 0.6 s, no loops, no timers. */
export const konbiniSfx={
 whoosh:()=>noise(0,.28,.05,600,.8,2400),
 flick:()=>{noise(0,.06,.06,3200,2);tone(1400,.01,.05,.025,'triangle');},
 thunk:()=>{tone(110,0,.18,.14,'sine');noise(0,.08,.06,300,1.2);},
 correct:()=>{tone(784,0,.14,.07,'triangle');tone(988,.09,.14,.07,'triangle');tone(1319,.18,.22,.07,'triangle');},
 wrong:()=>{tone(330,0,.16,.05,'triangle');tone(294,.12,.2,.05,'triangle');},
 finish:()=>{tone(1047,0,.25,.07,'sine');tone(1319,.1,.25,.07,'sine');tone(1568,.2,.4,.08,'sine');},
 kaching:()=>{noise(0,.05,.05,2500,3);tone(2093,.04,.28,.06,'triangle');tone(2637,.1,.35,.05,'triangle');},
 coin:(i=0)=>tone(1760+i*90,i*.07,.07,.03,'square'),
 crumb:()=>noise(0,.05,.025,1800,1.5),
 section:(poi:string)=>{switch(poi){
  case 'drinks':tone(70,0,.22,.1,'sine');noise(.02,.12,.03,500,1);tone(120,.1,.5,.015,'sine');break;// fridge door shunk + hum burst
  case 'hot':noise(0,.55,.04,5000,.6,3000);break;// steam hiss
  case 'magazines':for(let i=0;i<5;i++)noise(i*.045,.04,.035,2600+i*200,2);break;// page riffle
  case 'gear':tone(140,0,.12,.1,'sine');tone(140,.22,.08,.05,'sine');break;// ball thok-thok
  case 'counter':tone(1320,0,.08,.03,'triangle');break;
  default:noise(0,.18,.03,1400,1.2);// paper rustle
 }},
};
export function createKonbiniSound(){
 let muted=false;
 return {
  unlock(){context();},
  chime(){if(muted)return;tone(988,0,.55,.1);tone(784,.28,.7,.1);},
  register(){if(muted)return;tone(1320,0,.12,.08,'square');tone(1760,.09,.18,.07,'triangle');},
  bite(){if(muted)return;for(let i=0;i<3;i++)tone(240+i*20,.35+i*.42,.07,.07,'triangle');},
  tick:konbiniTick,
  setMuted(v:boolean){muted=v;},
  dispose(){muted=true;},
 };
}
