import type {KonbiniShop} from './food';
/**
 * In-store music (user, Sep 29 2026: "for the store, it needs to have its own music playing"). ORIGINAL loops composed for this
 * game (no real chain's jingle or chime, no copyrighted tracks), rendered ONCE per visit into a small mono buffer and played
 * as a looping buffer source, the same approach as the Arcade room (lib/audio/arcadeRoomMusic.ts): no live sequencer, no
 * scheduler timers.
 *  - Island Square: bright konbini pop, 100 bpm, C major, I–vi–IV–V, electric piano + marimba + soft bass + light shaker.
 *  - Coral Cay: a breezier tropical take, 88 bpm, F major, I–vi–IV–V with a lazy swing, plucked "ukulele" strums + steel-drum-ish
 *    lead + soft bass.
 * Behaviour (createKonbiniMusic): fades in ~0.8 s once audio is allowed, respects the island's music on/off, volume and mute,
 * fades out and suspends its context when the tab is hidden or after MUSIC_IDLE_MS without input (the island's idle rule),
 * ducks under the reveal / cashier chat, and stops + closes everything on dispose (leaving the store).
 */
export const KONBINI_MUSIC_IDLE_MS=30000,KONBINI_MUSIC_FADE_IN=.8,KONBINI_MUSIC_IDLE_FADE=1.5;
type Buf={getChannelData:(c:number)=>Float32Array;length:number;sampleRate:number};
type Ctx={createBuffer:(ch:number,len:number,rate:number)=>Buf};
const hz=(m:number)=>440*Math.pow(2,(m-69)/12);
export const KONBINI_TRACKS:Record<KonbiniShop,{bpm:number;swing:number;roots:number[];melody:(number|null)[];name:string}>={
 // Original melodies (8 bars, eighth notes; null = rest).
 main:{name:'Island Square · Bright konbini pop',bpm:100,swing:0,roots:[48,45,41,43,48,45,41,43],
  melody:[76,null,79,76,74,72,74,76, 72,null,76,72,69,null,72,74, 77,76,74,72,69,72,74,null, 71,null,74,79,77,76,74,71,
          76,79,81,79,76,null,74,76, 72,74,76,72,69,72,76,null, 77,null,81,77,74,72,69,72, 74,76,74,71,67,71,72,null]},
 cay:{name:'Coral Cay · Breezy tropical konbini',bpm:88,swing:.18,roots:[41,38,46,48,41,38,46,48],
  melody:[72,null,77,null,76,74,72,null, 69,72,74,null,74,72,69,null, 70,74,77,null,79,77,74,70, 72,null,76,79,null,76,74,72,
          77,null,81,79,77,null,76,74, 74,72,69,72,74,null,77,null, 79,77,74,70,74,77,79,null, 81,79,76,72,null,76,77,null]},
};
/** Render one loop into a buffer (mono, 22.05 kHz, ~19–22 s). Deterministic. */
export function renderKonbiniLoop(context:Ctx,shop:KonbiniShop):Buf{
 const T=KONBINI_TRACKS[shop],rate=22050,beat=60/T.bpm,bars=T.roots.length,length=beat*4*bars,buffer=context.createBuffer(1,Math.round(rate*length),rate),out=buffer.getChannelData(0);
 const at=(eighth:number)=>(eighth*.5+(eighth%2?T.swing*.5:0))*beat;
 function tone(start:number,dur:number,midi:number,level:number,kind:'epiano'|'marimba'|'bass'|'steel'|'pluck'){
  const s0=Math.round(start*rate),count=Math.round(dur*rate),f=hz(midi);let ks:Float32Array|null=null,ki=0;
  if(kind==='pluck'){const period=Math.max(2,Math.round(rate/f));ks=new Float32Array(period);let seed=midi*7919;for(let i=0;i<period;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ks[i]=seed/2147483648-1;}}
  for(let n=0;n<count;n++){const t=n/rate,p=n/count,ph=2*Math.PI*f*t;let w=0,env=1;
   switch(kind){
    case 'epiano':env=Math.min(1,t/.006)*Math.exp(-t*3.2);w=Math.sin(ph)+.35*Math.sin(2*ph)*Math.exp(-t*9)+.12*Math.sin(3*ph)*Math.exp(-t*14);break;
    case 'marimba':env=Math.min(1,t/.002)*Math.exp(-t*9);w=Math.sin(ph)+.25*Math.sin(4*ph)*Math.exp(-t*30);break;
    case 'bass':env=Math.min(1,t/.01)*Math.pow(1-p,1.3);w=Math.sin(ph)+.15*Math.sin(2*ph);break;
    case 'steel':env=Math.min(1,t/.004)*Math.exp(-t*4.5);w=Math.sin(ph)+.5*Math.sin(2.01*ph)*Math.exp(-t*6)+.22*Math.sin(3.97*ph)*Math.exp(-t*10);break;
    case 'pluck':{const buf=ks!,i=ki%buf.length,nx=(ki+1)%buf.length;buf[i]=.498*(buf[i]+buf[nx]);w=buf[i];ki++;env=Math.min(1,t/.002)*Math.pow(1-p,.8);break;}
   }
   out[(s0+n)%out.length]+=w*env*level;}
 }
 let seed=shop==='cay'?911:417;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let bar=0;bar<bars;bar++){const r=T.roots[bar],b0=bar*4*beat,third=[1,5].includes(bar%4)?3:4;// vi and its repeat are minor
  tone(b0,beat*1.8,r-12+12,.2,'bass');tone(b0+beat*2,beat*1.6,r+7-12+12,.16,'bass');
  const chord=[r+12,r+12+third,r+19];
  if(shop==='main'){for(const k of [0,2])chord.forEach((m,i)=>tone(b0+k*beat+i*.012,beat*1.6,m,.055,'epiano'));for(let e=1;e<8;e+=2)tone(b0+e*beat*.5,beat*.3,chord[e%3]+12,.035,'marimba');}
  else{for(const k of [0,1.5,2.5,3])chord.forEach((m,i)=>tone(b0+k*beat+i*.018,beat*.9,m,.05,'pluck'));}
  // shaker: soft deterministic noise on the off-beats
  for(let e=0;e<8;e++){if(e%2===0&&shop==='main')continue;const s=Math.round((b0+at(e))*rate);for(let n=0;n<rate*.03;n++)out[(s+n)%out.length]+=noise()*Math.exp(-n/rate*120)*.018;}
 }
 T.melody.forEach((m,i)=>{if(m===null)return;tone(at(i),beat*.45,m,i%8===0?.1:.075,shop==='cay'?'steel':'marimba');});
 let peak=0;for(let n=0;n<out.length;n++)peak=Math.max(peak,Math.abs(out[n]));const scale=.7/Math.max(.7,peak);
 for(let n=0;n<out.length;n++)out[n]*=scale*Math.min(1,n/(rate*.004),(out.length-1-n)/(rate*.004));
 return buffer;
}

// ---- Controller ------------------------------------------------------------------------------------------------------------
type Gain={gain:{value:number;cancelScheduledValues:(t:number)=>void;setValueAtTime:(v:number,t:number)=>void;linearRampToValueAtTime:(v:number,t:number)=>void};connect:(n:unknown)=>void;disconnect:()=>void};
type Source={buffer:unknown;loop:boolean;connect:(n:unknown)=>void;disconnect:()=>void;start:()=>void;stop:()=>void};
export type MusicContext=Ctx&{state:string;currentTime:number;destination:unknown;createGain:()=>Gain;createBufferSource:()=>Source;resume:()=>Promise<void>;suspend:()=>Promise<void>;close?:()=>Promise<void>};
export type MusicPorts={context:()=>MusicContext|null;settings:()=>{enabled:boolean;volume:number};hidden:()=>boolean;now:()=>number;
 setTimer:(fn:()=>void,ms:number)=>unknown;clearTimer:(id:unknown)=>void};
/** Only one store loop may ever exist (React StrictMode double-mounts in dev): a new controller disposes the previous one. */
let live:{dispose:()=>void}|null=null;
export function createKonbiniMusic(shop:KonbiniShop,ports:MusicPorts){
 live?.dispose();
 let ctx:MusicContext|null=null,gain:Gain|null=null,source:Source|null=null,buffer:Buf|null=null,disposed=false,idle=false,ducked=false,idleTimer:unknown=null;
 const debug={track:KONBINI_TRACKS[shop].name,shop,playing:false,idle:false,hidden:false,muted:false,ducked:false,contextState:'none',starts:0,disposed:false};
 const level=()=>{const s=ports.settings();return s.enabled?s.volume*(ducked?.3:1):0;};
 function ramp(to:number,seconds:number){if(!ctx||!gain)return;const t=ctx.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(to,t+seconds);}
 function sync(){if(!ctx)return;debug.contextState=ctx.state;debug.hidden=ports.hidden();debug.idle=idle;debug.ducked=ducked;debug.muted=!ports.settings().enabled;}
 function start(){
  if(disposed)return;const s=ports.settings();debug.muted=!s.enabled;if(!s.enabled||s.volume<=0){sync();return;}
  ctx??=ports.context();if(!ctx)return;if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
  if(!source){buffer??=renderKonbiniLoop(ctx,shop);gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.start();debug.starts++;}
  debug.playing=true;ramp(level(),KONBINI_MUSIC_FADE_IN);armIdle();sync();
 }
 function armIdle(){if(idleTimer!==null)ports.clearTimer(idleTimer);idleTimer=ports.setTimer(()=>{idleTimer=null;idle=true;ramp(0,KONBINI_MUSIC_IDLE_FADE);ports.setTimer(()=>{if(idle&&ctx&&!disposed)void ctx.suspend().catch(()=>{}).then(sync);},KONBINI_MUSIC_IDLE_FADE*1000+60);sync();},KONBINI_MUSIC_IDLE_MS);}
 const controller={
  /** Start (or resume after idle) on entry and on every trusted input. */
  input(){if(disposed)return;if(idle||!debug.playing){idle=false;start();}else armIdle();},
  start,
  /** Tab hidden: fade out and suspend; visible again: resume. */
  visibility(){if(!ctx||disposed)return;if(ports.hidden()){ramp(0,.15);void ctx.suspend().catch(()=>{}).then(sync);}else if(!idle){void ctx.resume().catch(()=>{});ramp(level(),.4);armIdle();}sync();},// already idle: stay suspended until the next input (code review finding 8)
  /** Duck under the layered reveal and the cashier's chat. */
  duck(on:boolean){if(ducked===on)return;ducked=on;if(!idle)ramp(level(),.25);sync();},
  dispose(){if(disposed)return;disposed=true;if(live===controller)live=null;debug.disposed=true;debug.playing=false;if(idleTimer!==null)ports.clearTimer(idleTimer);try{source?.stop();}catch{/* already stopped */}source?.disconnect();gain?.disconnect();source=null;gain=null;
   const c=ctx;ctx=null;if(c){debug.contextState='closing';void (c.close?c.close():c.suspend()).catch(()=>{}).then(()=>{debug.contextState=c.state;});}},
  get debug(){if(ctx)debug.contextState=ctx.state;return {...debug};},
 };
 live=controller;return controller;
}
export type KonbiniMusic=ReturnType<typeof createKonbiniMusic>;
