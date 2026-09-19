import type {TravelMode} from '../town/travelModes';

/** Quiet, self-contained game Foley. One gesture-unlocked context, no downloads. */
export function createIslandSound(initialMuted=false,initialVolume=.5){
  let context:AudioContext|null=null,master:GainNode|null=null,noise:AudioBuffer|null=null;
  let volume=Math.max(0,Math.min(1,initialVolume));
  let mediaPaused=false;
  let disposed=false,muted=initialMuted,hidden=document.hidden;
  const cooldown=new Map<string,number>();
  const sources=new Set<AudioScheduledSourceNode>();
  const debug={unlocked:false,volume,muted,hidden,disposed:false,contextState:'locked',counts:{} as Record<string,number>};
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
  function unlock(){
    if(disposed||hidden||muted)return;
    const current=getContext();if(!current)return;
    debug.unlocked=true;debug.contextState=current.state;
    if(current.state!=='running'&&current.state!=='closed')void current.resume().catch(()=>{});
  }
  function ready(key:string,interval:number){
    if(disposed||muted||volume===0||hidden||!context||context.state!=='running'||!master)return false;
    const now=context.currentTime;if(now-(cooldown.get(key)??-Infinity)<interval)return false;
    cooldown.set(key,now);debug.counts[key]=(debug.counts[key]??0)+1;return true;
  }
  function voice(source:AudioScheduledSourceNode,output:AudioNode,duration:number,volume:number,delay=0,attack=.009){
    const c=context!,gain=c.createGain(),t=c.currentTime+delay;
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+attack);
    gain.gain.exponentialRampToValueAtTime(.0001,t+duration);output.connect(gain);gain.connect(master!);
    sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();output.disconnect();gain.disconnect();};
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
  function ui(kind:'hover'|'click'|'expand'|'collapse'){
    // Keyboard activation can click in the same task that first resumes audio.
    if(kind!=='hover'&&context&&context.state!=='running'&&context.state!=='closed'&&!muted&&!hidden&&!disposed){
      const requested=performance.now();
      void context.resume().then(()=>{if(context?.state==='running'&&performance.now()-requested<300)ui(kind);}).catch(()=>{});return;
    }
    if(!ready(kind,kind==='hover'?.075:.04))return;
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
  function ride(mode:TravelMode){
    if(!ready('ride:'+mode,.15))return;
    if(mode==='walk'){hiss(380,.1,.22);tone(150,90,.1,.12);}
    if(mode==='scooter'){tone(760,1250,.15,.12);hiss(1800,.2,.1);}
    if(mode==='bike'){tone(1100,1085,.25,.035,'sine',0,.025);}
    if(mode==='moped'){tone(62,92,.65,.035,'sine',0,.17);tone(124,184,.6,.009,'triangle',.03,.18);}
    if(mode==='jetpack'){tone(240,350,.9,.012,'sine',0,.32);tone(480,700,1.05,.003,'sine',.08,.35);}
  }
  let travelHum:{mode:TravelMode;voices:{osc:OscillatorNode;gain:GainNode}[]}|null=null,humUpdate=-Infinity;
  function stopTravelHum(){if(!travelHum)return;for(const {osc,gain} of travelHum.voices){osc.stop();osc.disconnect();gain.disconnect();}travelHum=null;}
  function move(mode:TravelMode,speed:number,active:boolean){
    if(!active||muted||volume===0||hidden||disposed||!context||context.state!=='running'||!master||speed<.3&&mode!=='jetpack'){stopTravelHum();return;}
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
  function stopEngine(){if(!engine)return;engine.osc.stop();engine.osc.disconnect();engine.gain.disconnect();engine=null;}
  function truck(speed:number,active:boolean){
    if(!active||Math.abs(speed)<.2||muted||volume===0||hidden||disposed||!context||context.state!=='running'||!master){stopEngine();return;}
    if(!engine){const osc=context.createOscillator(),gain=context.createGain();osc.type='triangle';gain.gain.value=0;osc.connect(gain);gain.connect(master);osc.start();engine={osc,gain};engineUpdate=-Infinity;}
    // Reuse a single voice; update its pitch at 10 Hz instead of allocating per frame.
    if(context.currentTime-engineUpdate>.1){engineUpdate=context.currentTime;engine.osc.frequency.setTargetAtTime(48+Math.abs(speed)*5,context.currentTime,.12);engine.gain.gain.setTargetAtTime(.045+Math.min(Math.abs(speed),12)*.002,context.currentTime,.08);}
    if(speed<-.2&&ready('truck-reverse',.8))tone(850,850,.22,.09,'sine',0,.015);
  }
  function honk(){if(!ready('honk',.7))return;tone(350,345,.42,.1,'sawtooth',0,.012);tone(440,435,.42,.085,'sawtooth',0,.012);tone(700,690,.35,.025,'sine',0,.01);}
  let oceanSource:AudioBufferSourceNode|null=null,oceanGain:GainNode|null=null,oceanRequested=false,oceanVersion=0;
  let oceanBuffer:AudioBuffer|null=null;
  function bottleOcean(event:Event){
    oceanRequested=Boolean((event as CustomEvent<boolean>).detail);const version=++oceanVersion;
    if(oceanSource){const previous=oceanSource;try{if(!oceanRequested&&oceanGain&&context&&context.state==='running'){oceanGain.gain.cancelScheduledValues(context.currentTime);oceanGain.gain.setValueAtTime(oceanGain.gain.value,context.currentTime);oceanGain.gain.linearRampToValueAtTime(0,context.currentTime+1.25);previous.stop(context.currentTime+1.3);}else previous.stop();}catch{}oceanSource=null;oceanGain=null;}
    if(!oceanRequested||muted||volume===0||hidden||disposed)return;
    unlock();const c=getContext();if(!c||!master)return;
    const start=()=>{if(version!==oceanVersion||!oceanRequested||muted||volume===0||hidden||disposed||!master)return;const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
      const buffer=oceanBuffer??c.createBuffer(1,c.sampleRate*12,c.sampleRate);
      if(!oceanBuffer){const data=buffer.getChannelData(0);let smooth=0;
      for(let i=0;i<data.length;i++){smooth=smooth*.96+(Math.random()*2-1)*.12;const phase=i/data.length;data[i]=smooth*(.5+.5*Math.sin(Math.PI*phase)**2);}
      oceanBuffer=buffer;}
      source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1100;gain.gain.value=.35;source.connect(filter);filter.connect(gain);gain.connect(master);sources.add(source);oceanSource=source;oceanGain=gain;
      source.onended=()=>{sources.delete(source);source.disconnect();filter.disconnect();gain.disconnect();if(oceanSource===source){oceanSource=null;oceanGain=null;}};source.start();
    };if(c.state==='running')start();else void c.resume().then(start).catch(()=>{});
  }
  document.addEventListener('fi2-bottle-ocean',bottleOcean);
  const bottlePop=()=>{if(!ready('bottle-pop',.3))return;tone(420,170,.12,.14,'sine');hiss(1600,.08,.06);};
  document.addEventListener('fi2-bottle-pop',bottlePop);
  function silence(keepOcean=false){stopEngine();stopTravelHum();for(const source of sources){if(keepOcean&&source===oceanSource)continue;try{source.stop();}catch{}sources.delete(source);}}
  function setVolume(value:number){if(!Number.isFinite(value))return;const wasSilent=volume===0;volume=Math.max(0,Math.min(1,value));debug.volume=volume;if(volume===0)silence();if(master&&context)master.gain.setTargetAtTime(muted?0:.64*volume,context.currentTime,.04);if(wasSilent&&volume>0&&oceanRequested)bottleOcean(new CustomEvent('fi2-bottle-ocean',{detail:true}));}
  function setMuted(value:boolean){muted=value;debug.muted=value;silence();if(master&&context)master.gain.setTargetAtTime(value?0:.64*volume,context.currentTime,.04);if(!value){unlock();if(oceanRequested)bottleOcean(new CustomEvent('fi2-bottle-ocean',{detail:true}));}}
  function visibility(){hidden=document.hidden||mediaPaused;debug.hidden=hidden;silence();if(hidden){if(context?.state==='running')void context.suspend().catch(()=>{});}else if(debug.unlocked){unlock();if(oceanRequested)bottleOcean(new CustomEvent('fi2-bottle-ocean',{detail:true}));}}
  function dispose(){document.removeEventListener('fi2-bottle-pop',bottlePop);document.removeEventListener('fi2-bottle-ocean',bottleOcean);document.removeEventListener('fi2-story-cue',storyCue);disposed=true;debug.disposed=true;silence();if(context){context.onstatechange=null;void context.close().catch(()=>{});}debug.contextState='closed';}
  return {setMediaPaused(value:boolean){mediaPaused=value;visibility();},debug,getContext,unlock,ui,ride,move,stair,boundary,fall,impact,ball,boost,honk,truck,setVolume,setMuted,visibility,silence,dispose};
}
