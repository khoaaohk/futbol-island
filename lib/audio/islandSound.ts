import type {TravelMode} from '../town/travelModes';

const OCEAN_STARTS=[.6,5.7,11.1],OCEAN_LENGTHS=[4.5,4.8,4.2];
export type BottleOceanSample={wash:number;froth:number};
/** Shared 16-second swell envelope for the bottle intro's water and buoyancy (visual only: the island has no ocean sound). */
export function sampleBottleOcean(time:number,out:BottleOceanSample){
 const t=((time%16)+16)%16;out.wash=0;out.froth=0;
 for(let i=0;i<3;i++){const u=(t-OCEAN_STARTS[i])/OCEAN_LENGTHS[i];if(u>0&&u<1){const attack=Math.min(1,u/.2),recede=Math.max(0,1-(u-.2)/.8),envelope=attack*attack*(3-2*attack)*recede*recede;out.wash+=envelope;out.froth+=envelope*Math.sin(Math.PI*Math.min(1,u/.55))**2;}}
 return out;
}
/** Quiet, self-contained game Foley. One gesture-unlocked context, no downloads. */
export function createIslandSound(initialMuted=false,initialVolume=.5){
  let context:AudioContext|null=null,master:GainNode|null=null,noise:AudioBuffer|null=null;
  let volume=Math.max(0,Math.min(1,initialVolume));
  let mediaPaused=false;
  let disposed=false,muted=initialMuted,hidden=document.hidden;
  const cooldown=new Map<string,number>();
  // Each live source with the gain that shapes it, so a forced stop can fade instead of cutting mid-wave.
  const sources=new Map<AudioScheduledSourceNode,GainNode|null>();
  /** Stopping a sounding oscillator or loop at a non-zero level is a DC step: an audible click. Fade it first. */
  const RELEASE=.04;
  function release(source:AudioScheduledSourceNode,gain:GainNode|null,after?:()=>void){
    const c=context;
    if(gain&&c&&c.state==='running'){
      try{const t=c.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(0,t+RELEASE);
        if(after)source.onended=after;source.stop(t+RELEASE+.01);return;}catch{/* fall through to a plain stop */}
    }
    try{source.stop();}catch{}after?.();
  }
  // Hover/slide ticks answer the pointer or keyboard. Without this, a runner NPC crossing a resting cursor, a live
  // label drifting under it or a dialog handing focus to a button on its own "clicks" while the child sits idle.
  const HOVER_INPUT_MS=400;let lastInput=-Infinity,lastPointer=-Infinity;
  const markInput=(event:Event)=>{lastInput=performance.now();if(event.type!=='keydown')lastPointer=lastInput;};
  const INPUT_EVENTS=['pointermove','pointerdown','keydown'];
  for(const type of INPUT_EVENTS)document.addEventListener(type,markInput,{capture:true,passive:true});
  /** 3D scene hover (character, NPC, building, ferry under the cursor). Only a pointer that just moved: a held key moving the
   * camera sweeps a resting cursor's ray across the world. Off in flight (camera always drifts; flight is engine + music only). */
  function sceneHover(flying=false){if(flying||performance.now()-lastPointer>HOVER_INPUT_MS)return;ui('hover');}
  const debug={unlocked:false,volume,muted,hidden,disposed:false,contextState:'locked',idleSuspends:0,idle:false,counts:{} as Record<string,number>};
  function getContext(){
    if(disposed)return null;
    try{
      if(!context){
        try{const session=(navigator as Navigator&{audioSession?:{type:string}}).audioSession;if(session)session.type='playback';}catch{}
        const Audio=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
        if(!Audio)return null;
        context=new Audio();master=context.createGain();master.gain.value=muted?0:.64*volume;master.connect(context.destination);
        noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        context.onstatechange=()=>{if(context)debug.contextState=context.state;};
      }
      return context;
    }catch{return null;}
  }
  /** Heat pass 4 (user decision Sep 26 2026): the shared context suspends 2 s after nothing is audible (no music, one-shot, engine or
   * ride hum), so the audio thread sleeps; any input unlock, or a sound the game wants to play, resumes it. */
  const IDLE_SUSPEND_MS=2000;let musicAudible=false,idleSuspended=false,idleTimer:ReturnType<typeof setTimeout>|undefined;
  const audible=()=>musicAudible||sources.size>0||!!engine||!!travelHum;
  function scheduleIdle(){if(typeof setTimeout!=='function')return;if(idleTimer!==undefined)clearTimeout(idleTimer);idleTimer=setTimeout(checkIdle,IDLE_SUSPEND_MS);}
  function checkIdle(){idleTimer=undefined;if(disposed||!context||context.state!=='running')return;if(audible())return;idleSuspended=true;debug.idleSuspends++;void context.suspend().catch(()=>{});}
  function wakeIdle(){if(!idleSuspended||!context||hidden||muted||disposed)return;idleSuspended=false;if(context.state==='suspended')void context.resume().catch(()=>{});}
  function setMusicAudible(on:boolean){musicAudible=on;if(on)wakeIdle();else scheduleIdle();}
  /** Island idle (driven by islandMusic's one idle controller): fade the whole mix out over 1.5 s, stop the ride hums and suspend;
   * nothing is scheduled while idle, so waking replays nothing. Waking resumes with a short fade-in. */
  let idleFaded=false,idleFadeTimer:ReturnType<typeof setTimeout>|undefined;
  const IDLE_FADE=1.5,WAKE_FADE=.25,level=()=>muted||idleFaded?0:.64*volume;
  function setIdle(on:boolean){
    if(on===idleFaded||disposed)return;idleFaded=on;debug.idle=on;if(idleFadeTimer!==undefined)clearTimeout(idleFadeTimer);idleFadeTimer=undefined;
    const c=context,g=master;
    if(on){
      stopEngine();stopTravelHum();
      if(c&&g&&c.state==='running'){const t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+IDLE_FADE);}
      idleFadeTimer=setTimeout(()=>{idleFadeTimer=undefined;if(!idleFaded||!context)return;silence(true);if(context.state==='running'){idleSuspended=true;void context.suspend().catch(()=>{});}},IDLE_FADE*1000+100);
      return;
    }
    if(!c||!g||hidden)return;
    idleSuspended=false;if(c.state==='suspended')void c.resume().catch(()=>{});
    const t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level(),t+WAKE_FADE);
  }
  function unlock(){
    if(disposed||hidden||muted)return;
    const current=getContext();if(!current)return;
    debug.unlocked=true;debug.contextState=current.state;idleSuspended=false;
    if(current.state!=='running'&&current.state!=='closed')void current.resume().catch(()=>{});
    if(!audible())scheduleIdle();
  }
  function ready(key:string,interval:number){
    if(disposed||muted||idleFaded||volume===0||hidden||!context||!master)return false;
    // A context we idle-suspended resumes on demand: the sound is scheduled now and plays as soon as the resume lands.
    if(context.state!=='running'){if(!(idleSuspended&&context.state==='suspended'))return false;wakeIdle();}
    const now=context.currentTime;if(now-(cooldown.get(key)??-Infinity)<interval)return false;
    cooldown.set(key,now);debug.counts[key]=(debug.counts[key]??0)+1;return true;
  }
  function voice(source:AudioScheduledSourceNode,output:AudioNode,duration:number,volume:number,delay=0,attack=.009){
    const c=context!,gain=c.createGain(),t=c.currentTime+delay;
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+attack);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);output.connect(gain);gain.connect(master!);
    sources.set(source,gain);source.onended=()=>{sources.delete(source);source.disconnect();output.disconnect();gain.disconnect();if(!audible())scheduleIdle();};
    source.start(t);source.stop(t+duration+.015);
  }
  function tone(hz:number,end:number,duration:number,volume:number,type:OscillatorType='sine',delay=0,attack=.009){
    const c=context!,osc=c.createOscillator(),t=c.currentTime+delay;osc.type=type;
    osc.frequency.setValueAtTime(hz,t);osc.frequency.exponentialRampToValueAtTime(end,t+duration);
    voice(osc,osc,duration,volume,delay,attack);
  }
  function hiss(hz:number,duration:number,volume:number,delay=0){
    const c=context!,source=c.createBufferSource(),filter=c.createBiquadFilter();source.buffer=noise;
    filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=.6;source.connect(filter);voice(source,filter,duration,volume,delay);
  }
  // A card sliding in its plastic sleeve: a short band of noise swept upward, with a faint low body. Hover-rate limited.
  function slide(){
    const c=context!,source=c.createBufferSource(),filter=c.createBiquadFilter(),t=c.currentTime;source.buffer=noise;
    filter.type='bandpass';filter.Q.value=1.1;filter.frequency.setValueAtTime(900,t);filter.frequency.exponentialRampToValueAtTime(3400,t+.13);
    source.connect(filter);voice(source,filter,.15,.16,0,.02);tone(210,260,.09,.012,'sine',0,.015);
  }
  function ui(kind:'hover'|'slide'|'click'|'expand'|'collapse'|'dock'|'undock'|'swipe-right'|'swipe-left'|'path-pop'){
    // Keyboard activation can click in the same task that first resumes audio.
    if(kind!=='hover'&&kind!=='slide'&&context&&context.state!=='running'&&context.state!=='closed'&&!muted&&!hidden&&!disposed){
      const requested=performance.now();
      void context.resume().then(()=>{if(context?.state==='running'&&performance.now()-requested<300)ui(kind);}).catch(()=>{});return;
    }
    if((kind==='hover'||kind==='slide')&&performance.now()-lastInput>HOVER_INPUT_MS)return;
    if(kind==='slide'){if(ready('slide',.09))slide();return;}
    if(!ready(kind,kind==='hover'?.075:.04))return;
    if(kind==='path-pop'){tone(660,980,.085,.038,'sine',0,.006);return;}
    if(kind==='dock'||kind==='undock'){tone(kind==='dock'?420:640,kind==='dock'?640:420,.11,.055,'triangle');return;}
    if(kind==='swipe-right'||kind==='swipe-left'){tone(kind==='swipe-right'?300:900,kind==='swipe-right'?900:300,.16,.047,'sine');return;}
    if(kind==='expand'||kind==='collapse'){tone(kind==='expand'?430:680,kind==='expand'?680:430,.15,.065,'sine');return;}
    tone(kind==='hover'?750:520,kind==='hover'?920:760,kind==='hover'?.055:.095,kind==='hover'?.045:.1,'sine');
  }
  // Story cues reuse the island context and persisted effects mix; no extra audio loop.
  function storyCue(event:Event){
    unlock();if(!ready('story',.09))return;
    const done=(event as CustomEvent).detail==='finish';
    tone(523,523,.075,.055,'square');tone(done?784:659,done?784:659,.09,.04,'square',.085);
    if(done)tone(1047,1047,.13,.035,'square',.18);
  }
  document.addEventListener('fi2-story-cue',storyCue);
  const pathCue=(event:Event)=>{const kind=(event as CustomEvent).detail;if(kind==='dock'||kind==='undock'||kind==='swipe-right'||kind==='swipe-left'||kind==='path-pop')ui(kind);};
  document.addEventListener('fi2-path-cue',pathCue);
  // Island job actions (Sep 30 2026, lib/town/jobs/jobScene.ts 'fi2-job-cue'): one short voice per action, from the same tone/noise kit.
  const jobCue=(event:Event)=>{const kind=String((event as CustomEvent).detail);if(!ready('job:'+kind,kind==='rustle'||kind==='tap'?.07:.1))return;
    switch(kind){
      case 'rustle':hiss(2600,.18,.1);hiss(1400,.12,.05,.04);return;          // leaves shaking
      case 'swish':hiss(1800,.22,.09);return;                                   // rake / broom sweep
      case 'thud':tone(140,70,.12,.12);hiss(300,.06,.08);return;               // something lands on grass
      case 'pop':tone(320,900,.08,.09);hiss(900,.08,.07,.02);return;           // root pops out of the soil
      case 'spring':tone(500,180,.18,.06,'triangle');return;                   // root springs back
      case 'tug':hiss(500,.14,.06);return;
      case 'twist':tone(700,420,.1,.05,'triangle');tone(980,980,.05,.04,'sine',.09);return;
      case 'snip':tone(2400,1800,.035,.05,'square');return;
      case 'cut':tone(2400,1700,.035,.05,'square');hiss(3000,.12,.07,.03);return;
      case 'pick':tone(660,990,.07,.045);return;
      case 'bag':hiss(700,.14,.1);tone(180,120,.08,.06,'sine',.05);return;
      case 'place':tone(420,300,.08,.07,'triangle');return;
      case 'tap':tone(900,500,.05,.07,'square');return;                        // hammer on a peg
      case 'clank':tone(1200,1150,.2,.07,'square');tone(1800,1750,.16,.04,'square',.02);return;
      case 'paint':hiss(4000,.2,.05);return;
      case 'throw':hiss(1200,.2,.07);return;
      case 'thunk':tone(180,110,.08,.11);return;                               // ball off the rebound wall
      case 'ding':tone(880,880,.09,.06);tone(1320,1320,.14,.05,'sine',.08);return;
      case 'nope':tone(300,220,.14,.06,'triangle');return;
      case 'whistle':tone(2600,2500,.28,.05,'square');tone(2750,2650,.28,.03,'square');return;
      case 'pump':hiss(900,.1,.07);tone(240,300,.08,.04);return;
      case 'squeak':tone(1500,2100,.12,.05,'triangle');return;
      case 'hiss':hiss(5000,.35,.08);return;
    }};
  document.addEventListener('fi2-job-cue',jobCue);
  function ride(mode:TravelMode){
    if(!ready('ride:'+mode,.15))return;
    if(mode==='walk'){hiss(380,.1,.22);tone(150,90,.1,.12);}
    if(mode==='scooter'){tone(760,1250,.15,.12);hiss(1800,.2,.1);}
    if(mode==='bike'){tone(1100,1085,.25,.035,'sine',0,.025);}
    if(mode==='moped'){tone(62,92,.65,.035,'sine',0,.17);tone(124,184,.6,.009,'triangle',.03,.18);}
    if(mode==='jetpack'){tone(240,350,.9,.012,'sine',0,.32);tone(480,700,1.05,.003,'sine',.08,.35);}
  }
  let travelHum:{mode:TravelMode;voices:{osc:OscillatorNode;gain:GainNode}[]}|null=null,humUpdate=-Infinity;
  function stopTravelHum(){if(!travelHum)return;for(const {osc,gain} of travelHum.voices)release(osc,gain,()=>{osc.disconnect();gain.disconnect();});travelHum=null;if(!audible())scheduleIdle();}
  function move(mode:TravelMode,speed:number,active:boolean){
    if(!active||muted||idleFaded||volume===0||hidden||disposed||!context||context.state!=='running'||!master||speed<.3&&mode!=='jetpack'){stopTravelHum();return;}
    if(mode==='jetpack'||mode==='moped'){
      if(travelHum?.mode!==mode){stopTravelHum();travelHum={mode,voices:[0,1].map(i=>{const osc=context!.createOscillator(),gain=context!.createGain();osc.type=mode==='moped'&&i===1?'triangle':'sine';gain.gain.value=0;osc.connect(gain);gain.connect(master!);osc.start();return {osc,gain};})};humUpdate=-Infinity;debug.counts['hum-start:'+mode]=(debug.counts['hum-start:'+mode]??0)+1;}
      if(context.currentTime-humUpdate>=.1){humUpdate=context.currentTime;const flying=mode==='jetpack',hum=flying?235+Math.min(speed,40)*.8+Math.sin(context.currentTime*.7)*2:66+Math.min(speed,28)*.8;travelHum.voices.forEach(({osc,gain},i)=>{osc.frequency.setTargetAtTime(hum*(i?(flying?2.005:2):1),context!.currentTime,.12);gain.gain.setTargetAtTime(i?(flying?.002:.007):(flying?.009:.026),context!.currentTime,.14);});}
      return;
    }
    stopTravelHum();
    if(!ready('move:'+mode,mode==='walk'?Math.max(.18,.95/Math.max(speed,1)):.22))return;
    if(mode==='walk'){hiss(330,.08,.12);tone(115,65,.075,.09);}
    if(mode==='scooter')hiss(1300,.2,.04+Math.min(speed/400,.04));
    if(mode==='bike'){hiss(850,.24,.016);tone(210,185,.065,.006,'sine',0,.02);}
  }
  function stair(mode:TravelMode,direction:'up'|'down'){
    if(mode==='jetpack'||!ready('stairs:'+direction,mode==='walk'?.15:.085))return;
    const down=direction==='down';
    if(mode==='walk'){
      tone(down?150:205,down?65:95,.09,down?.13:.1);
      hiss(down?1050:1500,.055,.08);
    }else{
      // Short paired wheel clacks, with a heavier descending tread impact.
      tone(down?175:240,90,.065,.08,'triangle');
      hiss(1700,.045,.07);hiss(1200,.035,.04,.035);
    }
  }
  function boundary(){if(ready('boundary',.7)){tone(170,65,.19,.22,'triangle');hiss(550,.14,.15);}}
  function fall(){if(ready('fall',1)){tone(760,150,.75,.14,'sine');}}
  function impact(){if(ready('impact',1)){hiss(750,.42,.4);tone(105,38,.28,.3);tone(420,780,.18,.09,'sine',.12);tone(600,240,.3,.08,'sine',.28);}}
  function ball(kind:'kick'|'bounce'|'receive'){
    if(!ready('ball-'+kind,.1))return;
    if(kind==='kick'){tone(175,65,.14,.16);hiss(1100,.055,.065);}
    else if(kind==='bounce'){tone(240,90,.11,.13);hiss(1700,.045,.08);}
    else{tone(130,75,.085,.07);hiss(650,.035,.025);}
  }
  function boost(direction:'forward'|'up'='forward'){
    if(!ready('boost:'+direction,.35))return;
    if(direction==='forward'){hiss(950,.4,.085);tone(190,95,.34,.075,'sine',0,.035);tone(310,180,.3,.022,'sine',.025,.045);}
    else{tone(160,600,.8,.11,'sine',0,.08);tone(260,900,.9,.04,'sine',.04,.1);hiss(600,.7,.045);}
  }
  let engine:{osc:OscillatorNode;gain:GainNode}|null=null,engineUpdate=-Infinity;
  function stopEngine(){if(!engine)return;const {osc,gain}=engine;release(osc,gain,()=>{osc.disconnect();gain.disconnect();});engine=null;if(!audible())scheduleIdle();}
  function truck(speed:number,active:boolean){
    if(!active||Math.abs(speed)<.2||muted||idleFaded||volume===0||hidden||disposed||!context||context.state!=='running'||!master){stopEngine();return;}
    if(!engine){const osc=context.createOscillator(),gain=context.createGain();osc.type='triangle';gain.gain.value=0;osc.connect(gain);gain.connect(master);osc.start();engine={osc,gain};engineUpdate=-Infinity;}
    // Reuse a single voice; update its pitch at 10 Hz instead of allocating per frame.
    if(context.currentTime-engineUpdate>.1){engineUpdate=context.currentTime;engine.osc.frequency.setTargetAtTime(48+Math.abs(speed)*5,context.currentTime,.12);engine.gain.gain.setTargetAtTime(.045+Math.min(Math.abs(speed),12)*.002,context.currentTime,.08);}
    if(speed<-.2&&ready('truck-reverse',.8))tone(850,850,.22,.09,'sine',0,.015);
  }
  function honk(){if(!ready('honk',.7))return;tone(350,345,.42,.1,'sawtooth',0,.012);tone(440,435,.42,.085,'sawtooth',0,.012);tone(700,690,.35,.025,'sine',0,.01);}
  const bottlePop=()=>{if(!ready('bottle-pop',.3))return;tone(420,170,.12,.14,'sine');hiss(1600,.08,.06);};
  document.addEventListener('fi2-bottle-pop',bottlePop);
  // Vending machine (components/VendingMachine.tsx): coin clink into the slot, item thunk into the tray, pop as it's taken, soft buzz for "not yet".
  const vendingCue=(event:Event)=>{const cue=(event as CustomEvent<string>).detail;if(!ready('vending-'+cue,.07))return;
    if(cue==='select'){tone(740,1040,.065,.035,'triangle');tone(1480,1480,.04,.015,'sine',.025);}
    else if(cue==='previous'){tone(660,520,.055,.035,'triangle');tone(440,390,.055,.025,'triangle',.045);}
    else if(cue==='next'){tone(520,660,.055,.035,'triangle');tone(780,880,.055,.025,'triangle',.045);}
    else if(cue==='category'){tone(440,440,.055,.03,'sine');tone(660,660,.06,.03,'sine',.05);tone(880,880,.075,.025,'sine',.10);}
    else if(cue==='insert'){hiss(1300,.035,.022);tone(240,160,.06,.035,'triangle');}
    else if(cue==='confirm'){tone(390,520,.09,.04,'triangle');tone(780,1040,.095,.03,'sine',.06);}
    else if(cue==='equip'){tone(660,660,.07,.035,'sine');tone(990,1320,.12,.03,'sine',.055);}
    else if(cue==='coin'){tone(2350,2100,.07,.05,'triangle');tone(3500,3300,.05,.02,'sine',.012);}
    else if(cue==='thunk'){tone(150,62,.16,.16,'sine',0,.004);hiss(420,.07,.05);}
    else if(cue==='pop'){tone(520,1040,.10,.05,'sine');tone(1320,1560,.13,.03,'sine',.065);}
    else if(cue==='buzz'){tone(170,160,.16,.04,'square');}};
  document.addEventListener('fi2-vending-cue',vendingCue);
  /** Fades live sources out (blur, mute). `now` = hard stop: the page is hiding and the context suspends at once anyway. */
  function silence(now=false){stopEngine();stopTravelHum();for(const [source,gain] of sources){release(source,now?null:gain);sources.delete(source);}}
  function setVolume(value:number){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));debug.volume=volume;if(volume===0)silence();if(master&&context)master.gain.setTargetAtTime(level(),context.currentTime,.04);}
  function setMuted(value:boolean){muted=value;debug.muted=value;silence();if(master&&context)master.gain.setTargetAtTime(level(),context.currentTime,.04);if(!value)unlock();}
  function visibility(){hidden=document.hidden||mediaPaused;debug.hidden=hidden;silence(hidden);if(hidden){if(context?.state==='running')void context.suspend().catch(()=>{});}else if(debug.unlocked)unlock();}
  function dispose(){if(idleFadeTimer!==undefined)clearTimeout(idleFadeTimer);if(idleTimer!==undefined&&typeof clearTimeout==='function')clearTimeout(idleTimer);for(const type of INPUT_EVENTS)document.removeEventListener(type,markInput,{capture:true});document.removeEventListener('fi2-path-cue',pathCue);document.removeEventListener('fi2-job-cue',jobCue);document.removeEventListener('fi2-bottle-pop',bottlePop);document.removeEventListener('fi2-vending-cue',vendingCue);document.removeEventListener('fi2-story-cue',storyCue);disposed=true;debug.disposed=true;silence();if(context){context.onstatechange=null;void context.close().catch(()=>{});}debug.contextState='closed';}
  return {setMediaPaused(value:boolean){mediaPaused=value;visibility();},debug,getContext,unlock,setMusicAudible,setIdle,ui,sceneHover,ride,move,stair,boundary,fall,impact,ball,boost,honk,truck,setVolume,setMuted,visibility,silence,dispose};
}
