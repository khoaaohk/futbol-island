// Local copies of the original island's Towball's Crossing Deluxe soundtrack.
const TRACK='01-welcome';
/** Heat pass 4 (user decision Sep 26 2026): the music fades out (~1 s) after 30 s with no player input and fades back in on the next
 * input; `onAudible` tells the shared sound context when music stops, so it can suspend while nothing is audible. */
export const MUSIC_IDLE_MS=30000;
/** The island's one idle controller (user decision Sep 26 2026): after MUSIC_IDLE_MS with no real input, and nothing the child
 * started still playing (`active`: an open lesson/play, a card or story film, a voice line), the whole mix fades out: the music
 * here, and `onIdle(true)` lets the sound context fade its master and suspend. The next trusted pointer/touch/key input undoes it. */
export type IslandIdleHooks={active?:()=>boolean;onIdle?:(idle:boolean)=>void};
export const IDLE_FADE_SECONDS=1.5;
const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
const timers=typeof setTimeout==='function'&&typeof window!=='undefined'&&typeof window.addEventListener==='function';
export function createIslandMusic(initialEnabled=true,initialVolume=.04,sharedContext?:()=>AudioContext|null,onAudible?:(audible:boolean)=>void,idleHooks:IslandIdleHooks={}){
  const audio=new Audio();audio.preload='none';audio.loop=true;
  let context:AudioContext|null=null,gain:GainNode|null=null,source:MediaElementAudioSourceNode|null=null;
  let volume=Math.max(0,Math.min(1,initialVolume));
  let mediaPaused=false,bottleOpen=false,sceneActive=true,pageActive=true;
  let enabled=initialEnabled,ducked=false,unlocked=false,disposed=false,idle=false,lastInput=clock(),audibleNow=false;
  let idleTimer:ReturnType<typeof setTimeout>|undefined;
  const audible=(on:boolean)=>{if(on===audibleNow)return;audibleNow=on;onAudible?.(on);};
  let pauseTimer:ReturnType<typeof setTimeout>|undefined;
  let resumePending:Promise<void>|null=null,suspendPending:Promise<void>|null=null,playPending:Promise<void>|null=null,gainTarget=0,retryPlay=false;
  const allowed=()=>enabled&&!bottleOpen&&!mediaPaused&&!ducked&&!idle&&sceneActive&&pageActive&&!(typeof window!=='undefined'&&/^\/arcade(?:\/|$)/.test(window.location?.pathname??''))&&!document.hidden&&!disposed;
  const clear=()=>{if(pauseTimer!==undefined)clearTimeout(pauseTimer);pauseTimer=undefined;};
  // Anything that starts the element while music is not allowed (iOS resuming it after an interruption, a lock-screen play) stops at once.
  if(typeof audio.addEventListener==='function')audio.addEventListener('play',()=>{if(!allowed())audio.pause();});
  function fade(target:number,seconds:number){
    if(!gain||!context||gainTarget===target)return;
    gainTarget=target;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setTargetAtTime(target,context.currentTime,seconds);
  }
  function pause(immediate=false,fadeSeconds=.06){
    clear();
    fade(0,fadeSeconds);
    const stop=()=>{
      audio.pause();audible(false);
      if(!sharedContext&&context?.state==='running'&&!suspendPending)suspendPending=context.suspend().catch(()=>{}).finally(()=>{
        suspendPending=null;
        if(allowed())play();
      });
    };
    if(immediate)stop();else pauseTimer=setTimeout(stop,fadeSeconds>.1?Math.round(fadeSeconds*3600):260);
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
      fade(volume,.3);audible(true);
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
    // The first real gesture always unlocks, even while music isn't allowed yet (the arrival replay, a menu, a duck): the old
    // early return threw those taps away, so music only started on a later tap that happened to land at an allowed moment
    // (e.g. the Paths icon). Unlocked, it starts as soon as it is allowed, including on the first move (Sep 30 2026).
    if(!enabled||disposed)return;
    try{
      if(!context){
        const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
        if(!AC)return;
        context=sharedContext?sharedContext():new AC();if(!context)return;gain=context.createGain();gain.gain.value=0;
        source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(context.destination);
      }
      const first=!unlocked;unlocked=true;
      if(allowed()){play(true);return;}
      // Not allowed right now: prime the element inside this gesture (iOS only lets media start from a tap) at zero gain; the
      // 'play' listener pauses it again at once, and a later play() without a gesture is then permitted.
      if(first&&audio.paused){if(!audio.getAttribute('src'))audio.src=`/music/${TRACK}.mp3`;try{void audio.play().then(()=>{if(!allowed())audio.pause();}).catch(()=>{});}catch{}}
    }catch{/* Keep exploration working when audio is unavailable. */}
  }
  // Idle pause: one timer, re-armed only when it fires (inputs just stamp the time). Any pointer/key/wheel input resumes in the gesture.
  // Playback the child started counts as activity: the fade waits until MUSIC_IDLE_MS after it ends.
  const checkIdle=()=>{idleTimer=undefined;if(disposed)return;if(!idle&&idleHooks.active?.())lastInput=clock();const quiet=clock()-lastInput;if(quiet<MUSIC_IDLE_MS){idleTimer=setTimeout(checkIdle,Math.min(MUSIC_IDLE_MS-quiet,5000));return;}
    if(!idle){idle=true;if(!audio.paused||playPending)pause(false,IDLE_FADE_SECONDS/3.6);idleHooks.onIdle?.(true);}};
  // Only real input (isTrusted): a synthetic or programmatic event never wakes the mix.
  const input=(event:Event)=>{if(event&&event.isTrusted===false)return;lastInput=clock();if(idleTimer===undefined&&!disposed)idleTimer=setTimeout(checkIdle,MUSIC_IDLE_MS);if(idle){idle=false;idleHooks.onIdle?.(false);play(true);}};
  const INPUTS=['pointerdown','pointermove','keydown','wheel','touchstart'] as const;
  if(timers){for(const type of INPUTS)window.addEventListener(type,input,{capture:true,passive:true});idleTimer=setTimeout(checkIdle,MUSIC_IDLE_MS);}
  const bottle=(event:Event)=>{bottleOpen=Boolean((event as CustomEvent).detail);if(bottleOpen)pause();else play();};
  document.addEventListener('fi2-bottle-ocean',bottle);
  const pageHide=()=>{pageActive=false;pause(true);};
  const pageShow=()=>{pageActive=true;play();};
  if(timers){window.addEventListener('pagehide',pageHide);window.addEventListener('pageshow',pageShow);}
  return {
    unlock,
    setSceneActive(value:boolean){sceneActive=value;if(value)play();else pause(true);},
    setMediaPaused(value:boolean){mediaPaused=value;if(value)pause(true);else play();},
    setVolume(value:number){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));if(allowed())fade(volume,.08);},
    setEnabled(value:boolean){enabled=value;if(value)unlock();else pause();},
    setDucked(value:boolean){if(ducked===value)return;ducked=value;if(value)pause();else play();},
    visibility(){if(document.hidden)pause(true);else play();},
    getState(){return {sceneActive,pageActive,idle,enabled,ducked,unlocked,paused:audio.paused,time:audio.currentTime,track:TRACK,level:volume,volume:gain?.gain.value??0,contextState:context?.state??'locked',disposed,sharedContext:!!sharedContext,error:audio.error?.code??null};},
    dispose(){if(disposed)return;if(timers){window.removeEventListener('pagehide',pageHide);window.removeEventListener('pageshow',pageShow);}document.removeEventListener('fi2-bottle-ocean',bottle);if(timers){for(const type of INPUTS)window.removeEventListener(type,input,{capture:true});if(idleTimer!==undefined)clearTimeout(idleTimer);}disposed=true;clear();audible(false);audio.pause();audio.removeAttribute('src');audio.load();source?.disconnect();gain?.disconnect();if(context&&!sharedContext)void context.close().catch(()=>{});},
  };
}
