import type {TravelMode} from '../town/travelModes';

const OCEAN_STARTS=[.6,5.7,11.1],OCEAN_LENGTHS=[4.5,4.8,4.2];
export type BottleOceanSample={wash:number;froth:number};
/** Shared 16-second swell envelope for the bottle intro's water and buoyancy (visual only: the island has no ocean sound). */
export function sampleBottleOcean(time:number,out:BottleOceanSample){
 const t=((time%16)+16)%16;out.wash=0;out.froth=0;
 for(let i=0;i<3;i++){const u=(t-OCEAN_STARTS[i])/OCEAN_LENGTHS[i];if(u>0&&u<1){const attack=Math.min(1,u/.2),recede=Math.max(0,1-(u-.2)/.8),envelope=attack*attack*(3-2*attack)*recede*recede;out.wash+=envelope;out.froth+=envelope*Math.sin(Math.PI*Math.min(1,u/.55))**2;}}
 return out;
}
/** The island effects bus level (× the effects volume). */
export const ISLAND_SFX_MASTER=.64;
/** The one UI "click" (Enter / Go / Done / any button): a short rising sine. Shared with the Konbini page (lib/konbini/konbiniSound.ts
 *  konbiniSfx.click), which has no island runtime, so its buttons sound the same. `level` is before the bus (ISLAND_SFX_MASTER). */
export const UI_CLICK={from:520,to:760,duration:.095,level:.1,attack:.009} as const;
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
  const debug={water:null as unknown,unlocked:false,volume,muted,hidden,disposed:false,contextState:'locked',idleSuspends:0,idle:false,rush:false,counts:{} as Record<string,number>};
  function getContext(){
    if(disposed)return null;
    try{
      if(!context){
        try{const session=(navigator as Navigator&{audioSession?:{type:string}}).audioSession;if(session)session.type='playback';}catch{}
        const Audio=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
        if(!Audio)return null;
        context=new Audio();master=context.createGain();master.gain.value=muted?0:ISLAND_SFX_MASTER*volume;master.connect(context.destination);
        noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        context.onstatechange=()=>{if(context)debug.contextState=context.state;};
      }
      return context;
    }catch{return null;}
  }
  /** Heat pass 4 (user decision Sep 26 2026): the shared context suspends 2 s after nothing is audible (no music, one-shot, engine or
   * ride hum), so the audio thread sleeps; any input unlock, or a sound the game wants to play, resumes it. */
  // The sea (lib/audio/islandSound.ts (createWaterSound)): swim wash + strokes, the dive plunge, the muffled underwater bed; nothing exists until the swimmer is in the water.
  const water=createWaterSound({ctx:()=>context,master:()=>master,noise:()=>noise,ok:()=>!!context&&!!master&&context.state==='running'&&!muted&&!idleFaded&&volume>0&&!hidden&&!disposed,changed:()=>{if(!audible())scheduleIdle();}});
  debug.water=water.debug;
  const IDLE_SUSPEND_MS=2000;let musicAudible=false,idleSuspended=false,idleTimer:ReturnType<typeof setTimeout>|undefined;
  const audible=()=>musicAudible||sources.size>0||!!engine||!!travelHum||!!rush||water.active();
  function scheduleIdle(){if(typeof setTimeout!=='function')return;if(idleTimer!==undefined)clearTimeout(idleTimer);idleTimer=setTimeout(checkIdle,IDLE_SUSPEND_MS);}
  function checkIdle(){idleTimer=undefined;if(disposed||!context||context.state!=='running')return;if(audible())return;idleSuspended=true;debug.idleSuspends++;void context.suspend().catch(()=>{});}
  function wakeIdle(){if(!idleSuspended||!context||hidden||muted||disposed)return;idleSuspended=false;if(context.state==='suspended')void context.resume().catch(()=>{});}
  function setMusicAudible(on:boolean){musicAudible=on;if(on)wakeIdle();else scheduleIdle();}
  /** Island idle (driven by islandMusic's one idle controller): fade the whole mix out over 1.5 s, stop the ride hums and suspend;
   * nothing is scheduled while idle, so waking replays nothing. Waking resumes with a short fade-in. */
  let idleFaded=false,idleFadeTimer:ReturnType<typeof setTimeout>|undefined;
  const IDLE_FADE=1.5,WAKE_FADE=.25,level=()=>muted||idleFaded?0:ISLAND_SFX_MASTER*volume;
  function setIdle(on:boolean){
    if(on===idleFaded||disposed)return;idleFaded=on;debug.idle=on;if(idleFadeTimer!==undefined)clearTimeout(idleFadeTimer);idleFadeTimer=undefined;
    const c=context,g=master;
    if(on){
      stopEngine();stopTravelHum();stopRush();water.stop(false);
      if(c&&g&&c.state==='running'){const t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+IDLE_FADE);}
      idleFadeTimer=setTimeout(()=>{idleFadeTimer=undefined;if(!idleFaded||!context)return;silence(true);if(context.state==='running'){idleSuspended=true;void context.suspend().catch(()=>{});}},IDLE_FADE*1000+100);
      return;
    }
    if(!c||!g||hidden)return;
    idleSuspended=false;if(c.state==='suspended')void c.resume().catch(()=>{});
    const t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level(),t+WAKE_FADE);
    resumeRush();
  }
  function unlock(){
    if(disposed||hidden||muted)return;
    const current=getContext();if(!current)return;
    debug.unlocked=true;debug.contextState=current.state;idleSuspended=false;
    if(current.state!=='running'&&current.state!=='closed')void current.resume().catch(()=>{});
    resumeRush();if(!audible())scheduleIdle();
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
  // A binder page turning (components/CardCollection.tsx): a soft papery swish, one noise band swept down (one source,
  // one filter: cheap at the turn's first frame), quieter and longer than the card's sleeve slide.
  function pageTurn(){
    const c=context!,source=c.createBufferSource(),filter=c.createBiquadFilter(),t=c.currentTime;source.buffer=noise;
    filter.type='bandpass';filter.Q.value=.8;filter.frequency.setValueAtTime(2600,t);filter.frequency.exponentialRampToValueAtTime(900,t+.22);
    source.connect(filter);voice(source,filter,.24,.085,0,.035);
  }
  function ui(kind:'hover'|'slide'|'click'|'expand'|'collapse'|'dock'|'undock'|'swipe-right'|'swipe-left'|'path-pop'|'page'){
    // Keyboard activation can click in the same task that first resumes audio.
    if(kind!=='hover'&&kind!=='slide'&&context&&context.state!=='running'&&context.state!=='closed'&&!muted&&!hidden&&!disposed){
      const requested=performance.now();
      void context.resume().then(()=>{if(context?.state==='running'&&performance.now()-requested<300)ui(kind);}).catch(()=>{});return;
    }
    if((kind==='hover'||kind==='slide')&&performance.now()-lastInput>HOVER_INPUT_MS)return;
    if(kind==='slide'){if(ready('slide',.09))slide();return;}
    if(!ready(kind,kind==='hover'?.075:.04))return;
    if(kind==='page'){pageTurn();return;}
    if(kind==='path-pop'){tone(660,980,.085,.038,'sine',0,.006);return;}
    if(kind==='dock'||kind==='undock'){tone(kind==='dock'?420:640,kind==='dock'?640:420,.11,.055,'triangle');return;}
    if(kind==='swipe-right'||kind==='swipe-left'){tone(kind==='swipe-right'?300:900,kind==='swipe-right'?900:300,.16,.047,'sine');return;}
    if(kind==='expand'||kind==='collapse'){tone(kind==='expand'?430:680,kind==='expand'?680:430,.15,.065,'sine');return;}
    if(kind==='click'){tone(UI_CLICK.from,UI_CLICK.to,UI_CLICK.duration,UI_CLICK.level,'sine',0,UI_CLICK.attack);return;}
    tone(750,920,.055,.045,'sine');
  }
  // Story cues reuse the island context and persisted effects mix; no extra audio loop.
  /** A cue fired by the same tap that wakes the context (the 2 s idle suspend, or a first gesture) used to be dropped: resume()
   *  is async, so ready() still saw 'suspended' (Oct 3 2026 play-through: quiz and job cues went missing after a pause). Same rule
   *  as ui() above: resume, then replay the cue once if it lands within 300 ms. One promise per dropped cue; no loop. */
  function deferUntilAwake(replay:()=>void){
    const c=context;if(!c||c.state==='running'||c.state==='closed'||muted||hidden||disposed||idleFaded)return false;
    idleSuspended=false;const requested=performance.now();
    void c.resume().then(()=>{if(c.state==='running'&&performance.now()-requested<300)replay();}).catch(()=>{});return true;
  }
  function storyCue(event:Event){
    unlock();if(deferUntilAwake(()=>storyCue(event)))return;if(!ready('story',.09))return;
    const done=(event as CustomEvent).detail==='finish';
    tone(523,523,.075,.055,'square');tone(done?784:659,done?784:659,.09,.04,'square',.085);
    if(done)tone(1047,1047,.13,.035,'square',.18);
  }
  document.addEventListener('fi2-story-cue',storyCue);
  const pathCue=(event:Event)=>{const kind=(event as CustomEvent).detail;if(kind==='dock'||kind==='undock'||kind==='swipe-right'||kind==='swipe-left'||kind==='path-pop'||kind==='page')ui(kind);};
  document.addEventListener('fi2-path-cue',pathCue);
  // Island job actions (Sep 30 2026, lib/town/jobs/jobScene.ts 'fi2-job-cue'): one short voice per action, from the same tone/noise kit.
  const jobCue=(event:Event):void=>{if(rideCue(event))return;if(deferUntilAwake(()=>jobCue(event)))return;const d=(event as CustomEvent).detail as string|{cue:string;gain?:number};
    // Oct 15 2026 (user: "increase the sound if they crank it faster"): a cue may carry a gain (the fishing reel's ratchet sends 0.5…1.5 with the spin rate).
    const kind=typeof d==='string'?String(d):String(d?.cue),gain=typeof d==='object'&&d&&typeof d.gain==='number'?Math.max(.2,Math.min(2,d.gain)):1;if(!ready('job:'+kind,kind==='rustle'||kind==='tap'?.07:kind==='snip'?.06:kind.startsWith('splash')?.2:.1))return;
    switch(kind){
      case 'rustle':hiss(2600,.18,.1);hiss(1400,.12,.05,.04);return;          // leaves shaking
      case 'swish':hiss(1800,.22,.09);return;                                   // rake / broom sweep
      case 'thud':tone(140,70,.12,.12);hiss(300,.06,.08);return;               // something lands on grass
      case 'pop':tone(320,900,.08,.09);hiss(900,.08,.07,.02);return;           // root pops out of the soil
      case 'spring':tone(500,180,.18,.06,'triangle');return;                   // root springs back
      case 'tug':hiss(500,.14,.06);return;
      case 'twist':tone(700,420,.1,.05,'triangle');tone(980,980,.05,.04,'sine',.09);return;
      // Oct 15 2026 (user: "make the crash landing into water sound more like water"): a synthesized splash, three sizes (waterHud.ts
      // SPLASH_CUES): a low bloop as the body goes under, a slap of noise, the water mass, a spray tail, two bubbles. No samples.
      case 'splash-soft':case 'splash':case 'splash-big':{const g=kind==='splash-soft'?.7:kind==='splash-big'?1.4:1;
        // Oct 15 2026 (user): no low bloop; a bigger slap and water mass, more spray, bigger bubbles.
        hiss(1300,.14,.34*g);hiss(700,.5,.26*g,.03);hiss(3200,.85,.13*g,.08);hiss(5200,.6,.07*g,.2);
        tone(480,860,.16,.09*g,'sine',.18);tone(620,1040,.14,.08*g,'sine',.33);tone(740,1180,.12,.06*g,'sine',.5);return;}
      case 'snip':tone(2400*(.85+.3*gain),1800*(.85+.3*gain),.035,.05*gain,'square');return;    // the reel's ratchet: louder and brighter the faster it is cranked
      case 'cut':tone(2400,1700,.035,.05,'square');hiss(3000,.12,.07,.03);return;
      case 'pick':tone(660,990,.07,.045);return;
      case 'bag':hiss(700,.14,.1);tone(180,120,.08,.06,'sine',.05);return;
      case 'place':tone(420,300,.08,.07,'triangle');return;
      case 'tap':tone(900,500,.05,.07,'square');return;                        // hammer on a peg
      case 'clank':tone(1200,1150,.2,.07,'square');tone(1800,1750,.16,.04,'square',.02);return;
      case 'paint':hiss(4000,.2,.05);return;
      case 'throw':hiss(1200,.2,.07);return;
      case 'thunk':tone(180,110,.08,.11);return;                               // ball off the rebound wall
      // Oct 15 2026 (user: "add animation when kicking the ball against the fish stall"; propReactions 'stall'): a wooden thunk off
      // the counter, then a wet slap (a short noise burst) and two little drip blips off the ice. Synthesized, no samples.
      case 'stall':tone(170,72,.14,.14,'sine',0,.004);hiss(380,.05,.06);hiss(1700,.09,.11,.05);tone(900,1300,.05,.03,'sine',.16);tone(1100,1600,.045,.025,'sine',.27);return;
      case 'ding':tone(880,880,.09,.06);tone(1320,1320,.14,.05,'sine',.08);return;
      case 'nope':tone(300,220,.14,.06,'triangle');return;
      case 'whistle':tone(2600,2500,.28,.05,'square');tone(2750,2650,.28,.03,'square');return;
      case 'pump':hiss(900,.1,.07);tone(240,300,.08,.04);return;
      case 'squeak':tone(1500,2100,.12,.05,'triangle');return;
      case 'hiss':hiss(5000,.35,.08);return;
      case 'sting':tone(110,108,.34,.13,'triangle');tone(116.5,115,.5,.13,'triangle',.4);return; // water P1a: the sharks' two-note "da-dum" (a semitone up)
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
  /** A hop's touchdown on Summit Isle's slopes (rooftopTravel / slopeHop): a soft thud, fuller for a harder landing (0…1). */
  function land(power:number){if(ready('land',.18)){const p=Math.max(0,Math.min(1,power));tone(150,62,.1+.08*p,.07+.1*p,'triangle');hiss(420,.07+.06*p,.05+.07*p);}}
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
  /** Riding a manta or the whale shark (Oct 15 2026, user: "change the sounds when riding to sound more like fast moving through
   *  the water"; lib/town/water/animalRides.ts): 'fi2-job-cue' 'ride-start' (detail {cue, gain}: the manta 1, the whale shark a
   *  deeper 0.8) / 'ride-dart' (Let go or the lap's end: a short rush as the animal shoots off, then a fade) / 'ride-stop' (a
   *  0.25 s fade: a map trip, the page closing). ONE looped noise source → one band-pass → one gain on the effects bus, so the
   *  mute, volume, idle fade and page-hide silence all apply. The water bed rises with the ride's ease-up (the animal's
   *  RIDE_EASE: the filter, the playback rate and the level glide up by audio-param automation, no per-frame calls), and the
   *  soft surge is baked into its own 1 s noise loop (a swell every RUSH_SURGE s, the pace of the wake's rings), so nothing is
   *  scheduled from JS while it plays: no timer, no oscillator, no samples. A hide / mute / idle cuts it; while the ride lasts it
   *  comes back on the next unlock. */
  let rush:{source:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode}|null=null,rushBuffer:AudioBuffer|null=null,rushWant=0;
  const RUSH_SURGE=.5,RUSH_FADE=.25,RUSH_EASE=1/1.6;
  function rushNoise(c:AudioContext){
    if(rushBuffer)return rushBuffer;const n=c.sampleRate,b=c.createBuffer(1,n,n),d=b.getChannelData(0),surges=Math.round(1/RUSH_SURGE);let lp=0;
    // Brown-ish noise (water mass) plus a little white (spray), with a periodic swell that loops seamlessly (whole surges per loop).
    // The low-passed part runs round the loop twice (the second pass starts from the first's end), so the seam does not click.
    for(let i=0;i<n;i++){d[i]=Math.random()*2-1;lp=lp*.97+d[i]*.03;}
    for(let i=0;i<n;i++){const w=d[i];lp=lp*.97+w*.03;const ph=i/n*surges%1,swell=.62+.38*Math.sin(Math.PI*ph)**2;d[i]=(lp*5+w*.35)*swell;}
    return rushBuffer=b;
  }
  function startRush(gainScale:number){
    if(rush||muted||idleFaded||volume===0||hidden||disposed||!getContext()||!master)return;
    const c=context!,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),t=c.currentTime,deep=gainScale<.95;
    source.buffer=rushNoise(c);source.loop=true;filter.type='bandpass';filter.Q.value=.7;
    // Grab-on: a low swish that brightens and swells as the animal gets up to speed (≈ the ride's ease, 1.6/s).
    source.playbackRate.setValueAtTime(deep?.8:.9,t);source.playbackRate.setTargetAtTime(deep?.95:1.1,t,RUSH_EASE);
    filter.frequency.setValueAtTime(deep?320:420,t);filter.frequency.setTargetAtTime(deep?780:1100,t,RUSH_EASE);
    gain.gain.setValueAtTime(.0001,t);gain.gain.setTargetAtTime(.2*gainScale,t,RUSH_EASE);
    source.connect(filter);filter.connect(gain);gain.connect(master);source.start(t);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(rush?.source===source)rush=null;if(!audible())scheduleIdle();};
    rush={source,filter,gain};debug.rush=true;debug.counts['ride-start']=(debug.counts['ride-start']??0)+1;
  }
  /** Ends the rush: `fade` s, after an optional short `swell` (the dart: louder and brighter for a moment as the animal goes). */
  function stopRush(fade=RUSH_FADE,swell=false){
    const r=rush;if(!r)return;rush=null;debug.rush=false;const c=context;
    if(!c||c.state!=='running'){try{r.source.stop();}catch{}return;}
    const t=c.currentTime,g=r.gain.gain,f=r.filter.frequency;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);f.cancelScheduledValues(t);f.setValueAtTime(f.value,t);
    if(swell){g.linearRampToValueAtTime(Math.min(.4,g.value*1.7+.02),t+.18);f.linearRampToValueAtTime(1700,t+.18);r.source.playbackRate.setTargetAtTime(1.25,t,.1);g.linearRampToValueAtTime(0,t+.18+fade);f.linearRampToValueAtTime(500,t+.18+fade);try{r.source.stop(t+.2+fade);}catch{}return;}
    g.linearRampToValueAtTime(0,t+fade);try{r.source.stop(t+fade+.01);}catch{}
  }
  function resumeRush(){if(rushWant&&!rush)startRush(rushWant);}
  function rideCue(event:Event){
    const d=(event as CustomEvent).detail as string|{cue:string;gain?:number},kind=typeof d==='string'?d:String(d?.cue);
    if(kind!=='ride-start'&&kind!=='ride-stop'&&kind!=='ride-dart')return false;
    debug.counts['cue:'+kind]=(debug.counts['cue:'+kind]??0)+1;
    if(kind==='ride-start'){rushWant=typeof d==='object'&&d&&typeof d.gain==='number'?Math.max(.5,Math.min(1.2,d.gain)):1;stopRush(.05);startRush(rushWant);if(context&&context.state!=='running'&&!hidden&&!muted)wakeIdle();return true;}
    rushWant=0;if(kind==='ride-dart')stopRush(1.3,true);else stopRush();return true;
  }
  /** Fades live sources out (blur, mute). `now` = hard stop: the page is hiding and the context suspends at once anyway. */
  function silence(now=false){water.stop(now);stopEngine();stopTravelHum();stopRush(now?0:RUSH_FADE);for(const [source,gain] of sources){release(source,now?null:gain);sources.delete(source);}}
  function setVolume(value:number){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));debug.volume=volume;if(volume===0)silence();else resumeRush();if(master&&context)master.gain.setTargetAtTime(level(),context.currentTime,.04);}
  function setMuted(value:boolean){muted=value;debug.muted=value;silence();if(master&&context)master.gain.setTargetAtTime(level(),context.currentTime,.04);if(!value)unlock();}
  function visibility(){hidden=document.hidden||mediaPaused;debug.hidden=hidden;silence(hidden);if(hidden){if(context?.state==='running')void context.suspend().catch(()=>{});}else if(debug.unlocked)unlock();}
  function dispose(){water.dispose();if(idleFadeTimer!==undefined)clearTimeout(idleFadeTimer);if(idleTimer!==undefined&&typeof clearTimeout==='function')clearTimeout(idleTimer);for(const type of INPUT_EVENTS)document.removeEventListener(type,markInput,{capture:true});document.removeEventListener('fi2-path-cue',pathCue);document.removeEventListener('fi2-job-cue',jobCue);document.removeEventListener('fi2-bottle-pop',bottlePop);document.removeEventListener('fi2-vending-cue',vendingCue);document.removeEventListener('fi2-story-cue',storyCue);disposed=true;debug.disposed=true;silence();if(context){context.onstatechange=null;void context.close().catch(()=>{});}debug.contextState='closed';}
  /** The sea, once per frame while swimming (a frame with `in:false` winds everything down). */
  function swim(dt:number,frame:WaterSoundFrame){if(frame.in&&idleSuspended&&context?.state==='suspended')wakeIdle();water.update(dt,frame);}
  return {swim,waterPlunge:()=>water.plunge(),waterSurface:()=>water.surface(),setMediaPaused(value:boolean){mediaPaused=value;visibility();},debug,getContext,unlock,setMusicAudible,setIdle,ui,sceneHover,ride,move,stair,boundary,fall,land,impact,ball,boost,honk,truck,setVolume,setMuted,visibility,silence,dispose};
}

// ---- lib/audio/waterSound (kept in this file: the tests load islandSound.ts alone) ----
// The sea's sound (user, Oct 19 2026: "change the sounds for diving and swimming beneath the water" and "also change the sound for
// swimming"). Fully procedural on the island sound's shared context and master gain (no files, no new context), so mute, the
// volume setting, hide / idle / suspend all apply unchanged. Replaces the old swim sound (nothing but splash-downs) with:
//   surface: one looping "wash" bed (a baked lap-swell noise loop whose filter, rate and level glide with the stroke effort; a
//            stronger rush on Swim fast; a calm quiet lap while treading), a bright watery slap + a few droplets per arm stroke,
//            an occasional soft lap while treading;
//   diving:  a plunge (low whoosh + muffled splash + three bubbles) and a "whoosh up" on surfacing (one-shots);
//   under:   a low-pass on the whole SFX bus (master -> lowpass -> destination, eased in ~0.4 s, out ~0.3 s), the same bed re-tuned
//            to a slow deep swell, one soft ~85 Hz hum, rounder muffled stroke whooshes on the swim pose's stroke clock and a
//            small pitched bubble gurgle every 1.5-4 s. At most 3 steady underwater voices (bed + hum + one one-shot at a time).
// Heat / battery: nothing is created until the swimmer is in the sea, no per-frame allocation (a counter and a few comparisons;
// param glides every 0.1 s), lite (heat tier 2+, battery saver, slow governor, reduced motion) drops droplets, treading laps and
// thins the bubbles 2.2x; reduced motion also drops the bubbles (the decorative twin of the bubble rings). Leaving the sea (or a
// mute / hide / idle) fades the loops, stops pending one-shots and restores the master's route.
export type WaterSoundHost={ctx:()=>AudioContext|null;master:()=>GainNode|null;noise:()=>AudioBuffer|null;ok:()=>boolean;changed:()=>void};
export type WaterSoundFrame={in:boolean;under:number;kind:string;phase:number;speed:number;fast:boolean;lite:boolean;reduced:boolean};
export const WATER_SOUND={muffleHz:760,openHz:18000,muffleTc:.12,openTc:.08,openMs:400,tick:.1,voiceCap:3,subOn:.4,subOff:.25,bubbleMin:1.5,bubbleSpan:2.5,liteBubble:2.2,hum:84} as const;
export function createWaterSound(host:WaterSoundHost){
 type Bed={src:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode};
 type Hum={osc:OscillatorNode;gain:GainNode};
 let bed:Bed|null=null,hum:Hum|null=null,lp:BiquadFilterNode|null=null,lpTimer:ReturnType<typeof setTimeout>|undefined,buf:AudioBuffer|null=null;
 let live=0,submerged=false,tick=0,bubbleIn=2,lapIn=1,last=-1;
 const shots=new Set<AudioScheduledSourceNode>();
 const debug={bed:false,hum:false,muffled:false,live:0,created:0,disconnected:0,plunges:0,surfaces:0,strokes:0,bubbles:0};
 const active=()=>!!bed||!!hum||live>0||!!lp;
 const underVoices=()=>(bed?1:0)+(hum?1:0)+live;
 const ep=(p:AudioParam,v:number,t:number,tc:number)=>{p.cancelScheduledValues(t);p.setTargetAtTime(v,t,tc);};
 /** A 4 s loop of soft low noise with a lap swell every second (4 whole swells, so the loop is seamless); played slower it is a deep slow swell. */
 function bedBuffer(c:AudioContext){
  if(buf)return buf;const rate=11025,n=rate*4,b=c.createBuffer(1,n,rate),d=b.getChannelData(0);let lp1=0;
  for(let i=0;i<n;i++){d[i]=Math.random()*2-1;lp1=lp1*.9+d[i]*.1;}
  for(let i=0;i<n;i++){const w=d[i];lp1=lp1*.9+w*.1;const ph=i/n*4%1,swell=.55+.45*Math.sin(Math.PI*ph)**2;d[i]=(lp1*2.4+w*.18)*swell;}
  return buf=b;
 }
 function muffle(on:boolean){
  const c=host.ctx(),m=host.master();if(!c||!m)return;const t=c.currentTime;
  if(on){
   if(lpTimer!==undefined){clearTimeout(lpTimer);lpTimer=undefined;}
   if(!lp){lp=c.createBiquadFilter();debug.created++;lp.type='lowpass';lp.Q.value=.5;lp.frequency.value=WATER_SOUND.openHz;m.disconnect();m.connect(lp);lp.connect(c.destination);}
   ep(lp.frequency,WATER_SOUND.muffleHz,t,WATER_SOUND.muffleTc);debug.muffled=true;return;
  }
  if(!lp||lpTimer!==undefined)return;
  ep(lp.frequency,WATER_SOUND.openHz,t,WATER_SOUND.openTc);debug.muffled=false;lpTimer=setTimeout(unmuffle,WATER_SOUND.openMs);
 }
 function unmuffle(){
  if(lpTimer!==undefined){clearTimeout(lpTimer);lpTimer=undefined;}debug.muffled=false;
  const f=lp;if(!f)return;lp=null;const m=host.master(),c=host.ctx();
  try{m?.disconnect();f.disconnect();}catch{}debug.disconnected++;if(m&&c)m.connect(c.destination);
 }
 function startBed(c:AudioContext,m:GainNode){
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),t=c.currentTime;
  src.buffer=bedBuffer(c);src.loop=true;filter.type='bandpass';filter.Q.value=.6;filter.frequency.value=420;src.playbackRate.value=.8;
  gain.gain.setValueAtTime(.0001,t);src.connect(filter);filter.connect(gain);gain.connect(m);src.start(t,Math.random()*3);debug.created+=3;
  src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();debug.disconnected+=3;if(bed?.src===src)bed=null;host.changed();};
  bed={src,filter,gain};debug.bed=true;
 }
 function stopBed(fade:number){
  const b=bed,c=host.ctx();if(!b)return;bed=null;debug.bed=false;
  if(!c){try{b.src.stop();}catch{}return;}
  const t=c.currentTime;b.gain.gain.cancelScheduledValues(t);b.gain.gain.setValueAtTime(b.gain.gain.value,t);b.gain.gain.linearRampToValueAtTime(0,t+fade);try{b.src.stop(t+fade+.02);}catch{}
 }
 function startHum(c:AudioContext,m:GainNode){
  const osc=c.createOscillator(),gain=c.createGain(),t=c.currentTime;osc.type='sine';osc.frequency.value=WATER_SOUND.hum;
  gain.gain.setValueAtTime(.0001,t);gain.gain.setTargetAtTime(.014,t,.25);osc.connect(gain);gain.connect(m);osc.start(t);debug.created+=2;
  osc.onended=()=>{osc.disconnect();gain.disconnect();debug.disconnected+=2;if(hum?.osc===osc)hum=null;host.changed();};
  hum={osc,gain};debug.hum=true;
 }
 function stopHum(fade:number){
  const h=hum,c=host.ctx();if(!h)return;hum=null;debug.hum=false;
  if(!c){try{h.osc.stop();}catch{}return;}
  const t=c.currentTime;h.gain.gain.cancelScheduledValues(t);h.gain.gain.setValueAtTime(h.gain.gain.value,t);h.gain.gain.linearRampToValueAtTime(0,t+fade);try{h.osc.stop(t+fade+.02);}catch{}
 }
 /** A short noise burst through one filter swept hz0 -> hz1: one source, one filter, one gain. */
 function shot(type:BiquadFilterType,hz0:number,hz1:number,dur:number,vol:number,attack=.01,delay=0,q=1){
  const c=host.ctx(),m=host.master(),noise=host.noise();if(!c||!m||!noise)return;
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),t=c.currentTime+delay;
  src.buffer=noise;filter.type=type;filter.Q.value=q;filter.frequency.setValueAtTime(hz0,t);filter.frequency.exponentialRampToValueAtTime(Math.max(40,hz1),t+dur);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+attack);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(filter);filter.connect(gain);gain.connect(m);src.start(t,Math.random()*Math.max(0,1-dur-.05));src.stop(t+dur+.02);
  live++;debug.live=live;debug.created+=3;shots.add(src);
  src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();shots.delete(src);live--;debug.live=live;debug.disconnected+=3;host.changed();};
 }
 /** A soft sine blip (a bubble or droplet) gliding hz0 -> hz1. */
 function blip(hz0:number,hz1:number,dur:number,vol:number,delay=0,wobble=false){
  const c=host.ctx(),m=host.master();if(!c||!m)return;
  const osc=c.createOscillator(),gain=c.createGain(),t=c.currentTime+delay;osc.type='sine';
  osc.frequency.setValueAtTime(hz0,t);
  if(wobble){osc.frequency.exponentialRampToValueAtTime(hz0*1.6,t+dur*.3);osc.frequency.exponentialRampToValueAtTime(hz0*1.2,t+dur*.55);osc.frequency.exponentialRampToValueAtTime(hz1,t+dur);}
  else osc.frequency.exponentialRampToValueAtTime(hz1,t+dur);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);
  osc.connect(gain);gain.connect(m);osc.start(t);osc.stop(t+dur+.02);
  live++;debug.live=live;debug.created+=2;shots.add(osc);
  osc.onended=()=>{osc.disconnect();gain.disconnect();shots.delete(osc);live--;debug.live=live;debug.disconnected+=2;host.changed();};
 }
 function leave(hard:boolean){
  stopBed(hard?.02:.12);stopHum(hard?.02:.12);
  for(const s of shots){try{s.stop(hard?undefined:(host.ctx()?.currentTime??0)+.1);}catch{}}// Oct 19 2026: no swim tail over a take-off
  if(hard)unmuffle();else muffle(false);
  submerged=false;last=-1;tick=0;
 }
 const lowRoom=()=>underVoices()<WATER_SOUND.voiceCap;
 return {
  debug,active,
  /** Called every frame while swimming (cheap: a few comparisons; the audio params move every 0.1 s). */
  update(dt:number,f:WaterSoundFrame){
   if(!f.in){if(active())leave(false);return;}
   const c=host.ctx(),m=host.master();
   if(!host.ok()||!c||!m){if(active())leave(true);return;}
   const sub=f.under>(submerged?WATER_SOUND.subOff:WATER_SOUND.subOn);
   if(sub!==submerged){submerged=sub;muffle(sub);bubbleIn=1+Math.random()*1.5;}
   if(!bed)startBed(c,m);
   if(sub){if(!hum)startHum(c,m);}else if(hum)stopHum(.4);
   tick+=dt;
   if(tick>=WATER_SOUND.tick&&bed){
    tick=0;const t=c.currentTime,b=bed,e=Math.max(0,Math.min(1,f.speed));
    if(sub){ep(b.filter.frequency,170,t,.2);ep(b.src.playbackRate,.3,t,.3);ep(b.gain.gain,.05,t,.25);}
    else if(f.kind==='crawl'){const fast=f.fast;ep(b.filter.frequency,fast?1500:480+700*e,t,.15);ep(b.src.playbackRate,fast?1.2:.9+.3*e,t,.15);ep(b.gain.gain,fast?.1:.015+.045*e,t,.15);}
    else{ep(b.filter.frequency,400,t,.25);ep(b.src.playbackRate,.75,t,.25);ep(b.gain.gain,.016,t,.25);}
   }
   // The arm strokes ride the swim pose's stroke clock (one per π, the same cadence swimRipples.ts uses); a still clock is silent.
   if(f.kind==='crawl'){
    const idx=Math.floor(f.phase/Math.PI);
    if(idx!==last){const first=last<0;last=idx;if(!first)stroke(idx%2,sub,f);}
   }else{
    last=-1;
    if(!sub&&!f.lite&&f.kind==='tread'){lapIn-=dt;if(lapIn<=0){lapIn=1.6+Math.random()*1.1;shot('bandpass',900,420,.4,.02,.08,0,.8);}}
   }
   if(sub&&!f.reduced){bubbleIn-=dt;if(bubbleIn<=0){bubbleIn=(WATER_SOUND.bubbleMin+Math.random()*WATER_SOUND.bubbleSpan)*(f.lite?WATER_SOUND.liteBubble:1);if(lowRoom()){debug.bubbles++;blip(380+Math.random()*420,900,.2,.026,0,true);}}}
  },
  /** Going under: a low whoosh, a muffled splash and a quick bubble burst (about 0.6 s), distinct from the surface splash-down. */
  plunge(){
   if(!host.ok())return;debug.plunges++;
   shot('bandpass',700,170,.6,.18,.05,0,.7);shot('bandpass',1250,480,.3,.1,.012,.02);
   blip(380+Math.random()*120,760,.1,.034,.1);blip(480+Math.random()*160,980,.09,.03,.2);blip(560+Math.random()*200,1100,.08,.026,.32);
  },
  /** Coming up: a soft "whoosh up" and a few droplets (no gasp). */
  surface(){
   if(!host.ok())return;debug.surfaces++;
   shot('bandpass',260,1400,.38,.13,.09,0,.8);shot('bandpass',2800,1300,.4,.055,.02,.14);blip(1500,2300,.045,.016,.22);blip(1900,2800,.04,.014,.3);
  },
  stop(hard=true){if(active())leave(hard);},
  dispose(){leave(true);},
 };
 function stroke(side:number,sub:boolean,f:WaterSoundFrame){
  debug.strokes++;const e=.7+.5*Math.max(0,Math.min(1,f.speed)),g=f.fast?1.5:1;
  if(sub){if(lowRoom())shot('lowpass',520,240,.3,.07*e,.07,0,.5);return;}
  // Surface: a bright slap of the hand on the water, a rounder lap under it and two or three tiny droplets.
  shot('bandpass',side?2500:2100,side?1500:1300,.14,.045*e*g,.008,0,1.2);shot('bandpass',560,330,.24,.03*e*g,.02,.01,.7);
  if(!f.lite){blip(1800+Math.random()*1400,2400+Math.random()*1800,.035,.007,.05+Math.random()*.05);if(f.fast)blip(2200+Math.random()*1200,3200,.03,.011,.12+Math.random()*.06);}
 }
}
