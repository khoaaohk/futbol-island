/** Original, finite music-box score and paper foley. No downloads, timer or sequencer.
 * The island audio is separately suspended by the reader's playback ownership. */
export function createBookAudio(initialMuted=false,volume=1){
 let context:AudioContext|null=null,muted=initialMuted,disposed=false,request=0,lastAction=-Infinity;
 const voices=new Set<{source:AudioBufferSourceNode;gain:GainNode}>(),themes=new Map<number,AudioBuffer>();
 let paper:AudioBuffer|null=null,chime:AudioBuffer|null=null;
 const rate=24000,hz=(m:number)=>440*Math.pow(2,(m-69)/12);
 function stop(){request++;if(!context)return;for(const v of voices){v.source.onended=null;try{v.source.stop();}catch{}v.source.disconnect();v.gain.disconnect();}voices.clear();void context.suspend().catch(()=>{});}
 function tone(out:Float32Array,at:number,length:number,midi:number,level:number){
  const start=Math.round(at*rate),count=Math.round(length*rate),f=hz(midi);
  for(let n=0;n<count&&start+n<out.length;n++){const t=n/rate,p=n/count,env=Math.min(1,t/.025)*Math.pow(1-p,2.4),a=t*f*Math.PI*2;
   out[start+n]+=(Math.sin(a)+.13*Math.sin(a*2)+.045*Math.sin(a*4))*env*level;}
 }
 function theme(page:number){
  const key=Math.max(0,Math.min(5,page));const cached=themes.get(key);if(cached)return cached;
  const buffer=context!.createBuffer(1,rate*13,rate),out=buffer.getChannelData(0);
  // A gentle original pentatonic motif; later chapters resolve upward, never a borrowed tune.
  const root=[60,62,57,60,65,67][key],steps=[0,7,12,9,7,4,2,7,9,12,7,0];
  for(let i=0;i<steps.length;i++){tone(out,.12+i*.9,1.7,root+steps[i],.065);if(i%3===0){tone(out,.1+i*.9,2.5,root-12,.042);tone(out,.15+i*.9,2.2,root-5,.023);}}
  // Retain at most two decoded spreads, about 2.5MB total.
  if(themes.size>=2)themes.delete(themes.keys().next().value!);themes.set(key,buffer);return buffer;
 }
 function effect(kind:'paper'|'chime'){
  const cached=kind==='paper'?paper:chime;if(cached)return cached;
  const duration=kind==='paper'?.65:.8,buffer=context!.createBuffer(1,Math.ceil(rate*duration),rate),out=buffer.getChannelData(0);
  if(kind==='paper'){let seed=147,low=0;for(let i=0;i<out.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.14*(noise-low);const p=i/out.length;out[i]=(noise-low)*Math.pow(Math.sin(p*Math.PI),1.7)*(.028+.016*Math.sin(p*33));}paper=buffer;}
  else{tone(out,0,.65,81,.085);tone(out,.09,.65,88,.042);chime=buffer;}
  return buffer;
 }
 function start(buffer:AudioBuffer){
  if(!context||disposed||muted||document.hidden)return;
  const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.6*Math.max(0,Math.min(1,Number.isFinite(volume)?volume:0));source.connect(gain);gain.connect(context.destination);const voice={source,gain};voices.add(voice);
  source.onended=()=>{voices.delete(voice);source.disconnect();gain.disconnect();if(!voices.size&&context&&!disposed)void context.suspend().catch(()=>{});};source.start();
 }
 async function play(page:number,cue:'open'|'turn'|'action'){
  if(disposed||muted||document.hidden)return;
  const now=performance.now();if(cue==='action'&&now-lastAction<180)return;if(cue==='action')lastAction=now;
  if(!context){try{const C=window.AudioContext??(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;context=new C();}catch{return;}}
  if(cue!=='action')stop();const token=request;
  try{await context.resume();}catch{return;}
  if(token!==request||disposed||muted||document.hidden)return;
  if(cue!=='action'){start(theme(page));if(cue==='turn')start(effect('paper'));}
  else if(voices.size<4)start(effect('chime'));
 }
 const visibility=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',visibility);
 return{play,setMuted(value:boolean){muted=value;if(value)stop();},
  dispose(){disposed=true;stop();document.removeEventListener('visibilitychange',visibility);if(context)void context.close().catch(()=>{});context=null;themes.clear();paper=chime=null;},
  inspect:()=>({muted,voices:voices.size,state:context?.state??'uncreated'})};
}
