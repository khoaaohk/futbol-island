// Local copies of the original island's Towball's Crossing Deluxe soundtrack.
const TRACK='01-welcome';
export function createIslandMusic(initialEnabled=true,initialVolume=.04,sharedContext?:()=>AudioContext|null){
  const audio=new Audio();audio.preload='none';audio.loop=true;
  let context:AudioContext|null=null,gain:GainNode|null=null,source:MediaElementAudioSourceNode|null=null;
  let volume=Math.max(0,Math.min(1,initialVolume));
  let mediaPaused=false,bottleOpen=false;
  let enabled=initialEnabled,ducked=false,unlocked=false,disposed=false;
  let pauseTimer:ReturnType<typeof setTimeout>|undefined;
  let resumePending:Promise<void>|null=null,suspendPending:Promise<void>|null=null,playPending:Promise<void>|null=null,gainTarget=0,retryPlay=false;
  const allowed=()=>enabled&&!bottleOpen&&!mediaPaused&&!ducked&&!document.hidden&&!disposed;
  const clear=()=>{if(pauseTimer!==undefined)clearTimeout(pauseTimer);pauseTimer=undefined;};
  function fade(target:number,seconds:number){
    if(!gain||!context||gainTarget===target)return;
    gainTarget=target;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(target,context.currentTime,seconds);
  }
  function pause(immediate=false){
    clear();
    fade(0,.06);
    const stop=()=>{
      audio.pause();
      if(!sharedContext&&context?.state==='running'&&!suspendPending)suspendPending=context.suspend().catch(()=>{}).finally(()=>{
        suspendPending=null;
        if(allowed())play();
      });
    };
    if(immediate)stop();else pauseTimer=setTimeout(stop,260);
  }
  function play(userGesture=false){
    if(!unlocked||!allowed()||!context||!gain)return;
    clear();
    if(suspendPending)return;
    const current=context;
    const start=(allowSuspended=false)=>{
      if(!allowed()){if(!disposed)pause(true);return;}
      if(current.state!=='running'&&!allowSuspended)return;
      if(!audio.getAttribute('src'))audio.src=`/music/${TRACK}.mp3`;
      // Pointer events may unlock repeatedly while steering. Only real state
      // changes fade the music, and a loading play request is never duplicated.
      fade(volume,.3);
      if(audio.paused&&playPending){retryPlay=true;return;}
      if(audio.paused){
        try{
          retryPlay=false;
          playPending=audio.play().then(()=>{if(!allowed())audio.pause();}).catch(()=>{}).finally(()=>{
            playPending=null;
            if(retryPlay&&allowed()&&audio.paused){retryPlay=false;play();}
          });
        }catch{/* The next user gesture may retry a browser-blocked play. */}
      }
    };
    if(current.state==='running'){start();return;}
    if(!resumePending)resumePending=current.resume().then(()=>start()).catch(()=>{}).finally(()=>{resumePending=null;});
    // iOS requires media.play() in the actual tap, not after resume resolves.
    if(userGesture)start(true);
  }
  function unlock(){
    if(!allowed())return;
    try{
      if(!context){
        const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
        if(!AC)return;
        context=sharedContext?sharedContext():new AC();if(!context)return;gain=context.createGain();gain.gain.value=0;
        source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(context.destination);
      }
      unlocked=true;play(true);
    }catch{/* Keep exploration working when audio is unavailable. */}
  }
  const bottle=(event:Event)=>{bottleOpen=Boolean((event as CustomEvent).detail);if(bottleOpen)pause();else play();};
  document.addEventListener('fi2-bottle-ocean',bottle);
  return {
    unlock,
    setMediaPaused(value:boolean){mediaPaused=value;if(value)pause(true);else play();},
    setVolume(value:number){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));if(allowed())fade(volume,.08);},
    setEnabled(value:boolean){enabled=value;if(value)unlock();else pause();},
    setDucked(value:boolean){if(ducked===value)return;ducked=value;if(value)pause();else play();},
    visibility(){if(document.hidden)pause(true);else play();},
    getState(){return {enabled,ducked,unlocked,paused:audio.paused,time:audio.currentTime,track:TRACK,level:volume,volume:gain?.gain.value??0,contextState:context?.state??'locked',disposed,sharedContext:!!sharedContext,error:audio.error?.code??null};},
    dispose(){document.removeEventListener('fi2-bottle-ocean',bottle);disposed=true;clear();audio.pause();audio.removeAttribute('src');audio.load();source?.disconnect();gain?.disconnect();if(context&&!sharedContext)void context.close().catch(()=>{});},
  };
}
