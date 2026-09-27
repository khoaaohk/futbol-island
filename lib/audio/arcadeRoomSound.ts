import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {createArcadeRoomMusicBuffer} from './arcadeRoomMusic';

/** Small positional arcade vignettes, driven by the room's existing clock. No assets or second scheduler. */
export function createArcadeRoomSound(){
 let context:AudioContext|null=null,master:GainNode|null=null,noise:AudioBuffer|null=null;
 let musicSource:AudioBufferSourceNode|null=null,musicGain:GainNode|null=null,musicBuffer:AudioBuffer|null=null,musicEnabled=true,musicVolume=.04;
 function readMusic(){try{musicEnabled=localStorage.getItem('fi2-music-enabled')!=='false';const raw=localStorage.getItem('fi2-music-volume'),value=raw===null?.04:Number(raw);musicVolume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.04;}catch{}}readMusic();
 let muted=!isSoundEnabled(),disposed=false,unlocked=false,elapsed=0,next=1.2,phrase=0,step=0;
 const voices=new Map<AudioScheduledSourceNode,{gain:GainNode;pan:StereoPannerNode;filter?:BiquadFilterNode}>();
 const debug={events:0,voices:0,muted,unlocked:false,disposed:false,contextState:'locked',musicEnabled,musicVolume,musicPlaying:false};
 const stations=[{x:-8,z:-7},{x:0,z:-10},{x:8,z:-7},{x:-9,z:4},{x:9,z:4},{x:-10,z:-1},{x:10,z:-10}];
 function stop(){for(const[source,nodes]of voices){try{source.stop();}catch{}source.disconnect();nodes.gain.disconnect();nodes.pan.disconnect();nodes.filter?.disconnect();}voices.clear();debug.voices=0;}
 function syncMusic(){
  debug.musicEnabled=musicEnabled;debug.musicVolume=musicVolume;if(!context)return;
  if(!musicEnabled||musicVolume===0){if(musicSource){try{musicSource.stop();}catch{}musicSource.disconnect();musicSource=null;}debug.musicPlaying=false;return;}
  if(!unlocked||document.hidden)return;
  if(!musicGain){musicGain=context.createGain();musicGain.connect(context.destination);}musicGain.gain.value=musicVolume;
  if(!musicSource){musicBuffer??=createArcadeRoomMusicBuffer(context);musicSource=context.createBufferSource();musicSource.buffer=musicBuffer;musicSource.loop=true;musicSource.connect(musicGain);musicSource.start();}debug.musicPlaying=true;
 }
 function unlock(){
  if(disposed||document.hidden)return;unlocked=true;debug.unlocked=true;readMusic();if((muted||getSoundVolume()===0)&&(!musicEnabled||musicVolume===0))return;
  try{
   if(!context){const Audio=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Audio)return;
    context=new Audio();master=context.createGain();master.gain.value=getSoundVolume()*.45;master.connect(context.destination);
    noise=context.createBuffer(1,Math.ceil(context.sampleRate*.5),context.sampleRate);const data=noise.getChannelData(0);let seed=7253;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/2147483648-1;}
    context.onstatechange=()=>{debug.contextState=context?.state??'closed';};
   }
   syncMusic();if(context.state==='suspended')void context.resume().catch(()=>{});
  }catch{/* An unavailable audio device must not prevent walking. */}
 }
 function tone(hz:number,end:number,duration:number,level:number,pan:number,delay=0,type:OscillatorType|'noise'='triangle'){
  if(!context||!master||context.state!=='running'||voices.size>=8||muted||disposed||document.hidden)return;
  const c=context,t=c.currentTime+delay,gain=c.createGain(),panner=c.createStereoPanner();panner.pan.value=Math.max(-.8,Math.min(.8,pan));
  let source:AudioScheduledSourceNode,filter:BiquadFilterNode|undefined;
  if(type==='noise'){const n=c.createBufferSource();n.buffer=noise;source=n;filter=c.createBiquadFilter();filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=.7;n.connect(filter);filter.connect(gain);}
  else{const osc=c.createOscillator();osc.type=type;osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);source=osc;osc.connect(gain);}
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,level),t+.009);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  gain.connect(panner);panner.connect(master);voices.set(source,{gain,pan:panner,filter});debug.voices=voices.size;
  source.onended=()=>{source.disconnect();gain.disconnect();panner.disconnect();filter?.disconnect();voices.delete(source);debug.voices=voices.size;};source.start(t);source.stop(t+duration+.02);
 }
 function visibility(){if(document.hidden){stop();if(context?.state==='running')void context.suspend().catch(()=>{});}else if(unlocked)unlock();}
 function preferences(){if(disposed)return;readMusic();syncMusic();if(master)master.gain.value=getSoundVolume()*.45;if(unlocked&&!document.hidden)unlock();else{debug.musicEnabled=musicEnabled;debug.musicVolume=musicVolume;syncMusic();}if(context&&(muted||getSoundVolume()===0)&&(!musicEnabled||musicVolume===0)&&context.state==='running')void context.suspend().catch(()=>{});}
 document.addEventListener('visibilitychange',visibility);window.addEventListener('storage',preferences);
 return {
  ball(kind:'kick'|'bounce'){tone(kind==='kick'?180:260,65,kind==='kick'?.09:.055,.045,0,0,'noise');},
  social(){tone(1250,600,.085,.06,0,0,'noise');tone(660,660,.11,.022,0,.035,'sine');},
  unlock,get muted(){return muted;},get debug(){return debug;},
  setMuted(value:boolean){muted=value;debug.muted=value;try{localStorage.setItem('fi2-sound-muted',String(value));}catch{}if(value){stop();if((!musicEnabled||musicVolume===0)&&context?.state==='running')void context.suspend().catch(()=>{});}else unlock();},
  setMusicEnabled(value:boolean){try{localStorage.setItem('fi2-music-enabled',String(value));}catch{}musicEnabled=value;preferences();},
  setMusicVolume(value:number){musicVolume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):.04;try{localStorage.setItem('fi2-music-volume',String(musicVolume));}catch{}preferences();},
  update(dt:number,x:number,z:number,speed:number){
   if(disposed||muted||!unlocked||document.hidden||context?.state!=='running')return;
   elapsed+=dt;
   if(speed>.3){step+=dt*speed;if(step>.95){step%=.95;tone(160,85,.065,.033,0,0,'noise');}}else step=0;
   if(elapsed<next)return;
   // Offset cabinet motifs leave quiet space; never a full soundtrack fighting the games.
   const index=(phrase*3)%stations.length,station=stations[index],dx=station.x-x,distance=Math.hypot(dx,station.z-z);
   const level=.15/(1+distance*.32),pan=dx/12;phrase++;debug.events++;
   next=elapsed+1.2+(phrase%4)*.23;
   if(index===3){tone(740,735,.28,level,pan,0,'sine');tone(1110,1100,.24,level*.6,pan,.14,'sine');tone(190,70,.09,level,pan,.38,'noise');}
   else if(index===5){tone(1000,300,.12,level,pan,0,'noise');tone(260,120,.055,level,pan,.2);}
   else if(index===6){tone(950,700,.26,level*.6,pan,0,'noise');tone(880,880,.18,level*.8,pan,.3,'sine');}
   else{const base=[220,330,440,262,294][index];tone(base,base,.13,level,pan);tone(base*1.5,base*1.5,.15,level*.8,pan,.16);tone(base*2,base*2,.22,level*.65,pan,.34);}
  },
  dispose(){if(disposed)return;disposed=true;debug.disposed=true;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('storage',preferences);stop();if(musicSource){try{musicSource.stop();}catch{}musicSource.disconnect();musicSource=null;}musicGain?.disconnect();musicGain=null;musicBuffer=null;debug.musicPlaying=false;master?.disconnect();if(context){context.onstatechange=null;void context.close().catch(()=>{});}context=null;noise=null;debug.contextState='closed';},
 };
}
