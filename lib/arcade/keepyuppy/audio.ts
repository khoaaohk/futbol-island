/**
 * Keepy-Uppy Beat sound (Nov 21 2026): the music and the touches. The music is ORIGINAL and written as data (charts.ts patterns ->
 * music.ts events); this file only turns each event into a synthesised voice at an exact AudioContext time. No audio files, no samples.
 * Timing: `pump(songNow)` is called from the game loop and schedules every event of the next 0.25 s on the AudioContext clock
 * (look-ahead scheduling: the audio thread plays them sample-accurately, whatever the frame rate does). Nothing is timed with timers.
 * Graph: every voice -> (music bus ->) master gain -> ONE limiter (DynamicsCompressor) -> destination (tests/keepyuppy-core.cjs greps
 * this wiring; scripts/check-arcade-audio.cjs measures real output). The context is made on the first tap (unlock) and only when sound
 * is on: with sound off there is no context at all and the game runs on the performance clock (music.ts createSongClock).
 * Pause / hidden tab: the context is SUSPENDED (the song clock stops with it, scheduled notes wait) and resumed on resume.
 */
import {isSoundEnabled,getSoundVolume} from '../../games/sound';
import {musicEvents,type MusicEvent} from './music';
import type {Music} from './charts';

const mtof=(m:number)=>440*Math.pow(2,(m-69)/12),LOOK=.25;
export type KeepySong={music:Music;bars:number;mode:'full'|'drums'|'click';timeOf:(beat:number)=>number;beatAt:(t:number)=>number};
export type KeepyAudio=ReturnType<typeof createKeepyAudio>;
export function createKeepyAudio(){
 let ctx:AudioContext|null=null,master:GainNode|null=null,limiter:DynamicsCompressorNode|null=null,bus:GainNode|null=null,noise:AudioBuffer|null=null,voices=0,quiet=false,scheduled=0;
 let song:(KeepySong&{t0:number;until:number;live?:boolean})|null=null;
 const wanted=()=>isSoundEnabled()&&getSoundVolume()>0;
 const on=()=>!!ctx&&ctx.state==='running'&&wanted()&&!(typeof document!=='undefined'&&document.hidden);
 /** Call from a pointer / key handler. Creates the context once (only when sound is on) and resumes it (the iOS / Safari path). */
 function unlock(){
  if(typeof window==='undefined'||!wanted())return;
  if(!ctx){const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AC)return;
   try{ctx=new AC({latencyHint:'interactive'});}catch{ctx=null;return;}
   master=ctx.createGain();master.gain.value=.85;bus=ctx.createGain();bus.gain.value=.8;
   limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=4;limiter.ratio.value=14;limiter.attack.value=.002;limiter.release.value=.14;
   bus.connect(master);master.connect(limiter);limiter.connect(ctx.destination);
   const len=Math.floor(ctx.sampleRate*.7);noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);let seed=13579;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1;}}
  if(ctx.state==='suspended'&&!quiet)void ctx.resume().catch(()=>{});
 }
 const vol=()=>getSoundVolume()*1.6;
 /** an oscillator voice at absolute context time t */
 function tone(type:OscillatorType,f0:number,f1:number,t:number,dur:number,gain:number,attack=.004,out:AudioNode|null=master){
  if(!ctx||!out||voices>44)return;const o=ctx.createOscillator(),g=ctx.createGain();voices++;scheduled++;
  o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*vol(),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.02);o.onended=()=>{voices--;o.disconnect();g.disconnect();};
 }
 function burst(filter:BiquadFilterType,f:number,q:number,t:number,dur:number,gain:number,out:AudioNode|null=master){
  if(!ctx||!out||!noise||voices>44)return;const src=ctx.createBufferSource(),bq=ctx.createBiquadFilter(),g=ctx.createGain();voices++;scheduled++;
  src.buffer=noise;bq.type=filter;bq.frequency.value=f;bq.Q.value=q;g.gain.setValueAtTime(gain*vol(),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bq);bq.connect(g);g.connect(out);src.start(t,(t*5.1)%.5,dur+.03);src.onended=()=>{voices--;src.disconnect();bq.disconnect();g.disconnect();};
 }
 /** One music event at context time t. Each track's lead has its own timbre. */
 function voice(e:MusicEvent,t:number,m:Music){
  switch(e.voice){
   case 'click':tone('square',e.v?1480:1110,e.v?1480:1110,t,.05,.11,.001,bus);break;
   case 'kick':tone('sine',e.v?150:132,44,t,.2,e.v?.5:.4,.002,bus);break;
   case 'clap':burst('bandpass',1500,1.1,t,.09,.26,bus);burst('bandpass',1700,1.4,t+.012,.07,.18,bus);break;
   case 'shaker':burst('highpass',6200,.7,t,e.v?.06:.035,e.v?.1:.055,bus);break;
   case 'bass':tone('triangle',mtof(e.v),mtof(e.v),t,.24,.3,.006,bus);break;
   case 'crash':burst('highpass',3800,.5,t,.6,.2,bus);tone('sine',mtof(m.root-12),mtof(m.root-12),t,.5,.35,.004,bus);tone('triangle',mtof(m.root+12),mtof(m.root+12),t,.45,.14,.004,bus);break;
   default:{const f=mtof(e.v);
    if(m.lead==='whistle')tone('sine',f*.985,f,t,.26,.13,.03,bus);
    else if(m.lead==='tri')tone('triangle',f,f,t,.2,.16,.005,bus);
    else if(m.lead==='square')tone('square',f,f,t,.13,.05,.004,bus);
    else if(m.lead==='steel'){tone('sine',f,f,t,.3,.14,.003,bus);tone('sine',f*2,f*2,t,.14,.06,.003,bus);tone('sine',f*3.01,f*3.01,t,.07,.03,.003,bus);}
    else if(m.lead==='pluck'){tone('sawtooth',f,f,t,.11,.045,.002,bus);tone('triangle',f,f,t,.18,.1,.002,bus);}
    else{tone('sine',f,f,t,.32,.13,.002,bus);tone('sine',f*2.76,f*2.76,t,.12,.045,.002,bus);}}}
 }
 const now=()=>ctx?ctx.currentTime:0,hz=(semi:number)=>659.25*Math.pow(2,semi/12);
 const glock=(f:number,at:number,dur:number,gain=.18)=>{const t=now()+at;tone('sine',f,f,t,dur,gain,.002);tone('sine',f*2.76,f*2.76,t,dur*.4,gain*.3,.002);};
 return {
  unlock,
  get running(){return !!ctx&&ctx.state==='running';},
  /** seconds between a scheduled sound and the speaker, as the browser reports it (0 when unknown or sound is off) */
  get latency(){if(!ctx||!on())return 0;const c=ctx as AudioContext&{outputLatency?:number};return Math.max(0,Math.min(.25,(c.outputLatency||0)+(c.baseLatency||0)));},
  /** voices started since the page loaded (scripts/check-keepyuppy-browser.cjs reads it to see the scheduler work) */
  get scheduled(){return scheduled;},
  /** The song starts: song time `at` (the count-in is negative) is the context's time now. */
  startSong(s:KeepySong,at:number){if(!ctx){song=null;return;}song={...s,t0:ctx.currentTime+.04-at,until:s.beatAt(at)};},
  stopSong(){song=null;},
  /** Verifier fix (Nov 21 2026): the browser suspended the context in the middle of a song (iOS on a call, a system sound, a Bluetooth
   *  switch). The audio clock stands still while the picture would go on, so the shell pauses the run; resume restarts the song. */
  get lost(){return !!song&&!!song.live&&!!ctx&&ctx.state!=='running'&&!quiet&&wanted();},
  /** Song time by the audio clock (null with sound off, before the first tap, or while the context is not running). */
  songTime():number|null{return song&&ctx&&ctx.state==='running'?ctx.currentTime-song.t0:null;},
  /** Look-ahead scheduling: queue every music event up to 0.25 s ahead on the AudioContext clock. Called from the game loop. */
  pump(songNow:number){
   if(!song||!ctx||ctx.state!=='running')return;song.live=true;const to=song.beatAt(songNow+LOOK);if(to<=song.until)return;
   if(on())for(const e of musicEvents(song.music,song.until,to,song.bars,song.mode)){const t=song.t0+song.timeOf(e.beat);if(t>=ctx.currentTime-.02)voice(e,Math.max(t,ctx.currentTime),song.music);}
   song.until=to;
  },
  /** After a pause the context's clock has stood still; if it did move (a late suspend), the song is put back where it was held. */
  hold(songNow:number){if(song&&ctx){song.t0=ctx.currentTime-songNow;if(song.beatAt(songNow)>song.until)song.until=song.beatAt(songNow);}},
  /** a card button: the context rests on the cards, so the first tap wakes it and then clicks */
  tap(){if(ctx&&ctx.state==='suspended'&&!quiet&&wanted()){void ctx.resume().then(()=>{if(on())glock(hz(5),0,.09,.1);}).catch(()=>{});return;}if(!on())return;glock(hz(5),0,.09,.1);},
  /** the cards (start, stage cards, results): no song, and the context is suspended so the audio thread sleeps too */
  rest(){song=null;if(ctx&&ctx.state==='running')void ctx.suspend().catch(()=>{});},
  /** the ball on a boot, a thigh or a forehead (lane 0-3); a Sweet touch rings a little */
  touch(lane:number,sweet:boolean){if(!on())return;const t=now();
   if(lane===1){tone('sine',150,80,t,.12,.3,.003);burst('lowpass',600,.7,t,.06,.2);}
   else if(lane===2){tone('sine',330,210,t,.09,.22,.002);burst('bandpass',1500,1.5,t,.035,.14);}
   else{tone('sine',lane===0?205:230,105,t,.11,.3,.002);burst('lowpass',1100,.8,t,.05,.24);}
   if(sweet)tone('sine',hz(lane===2?12:lane===1?4:7),hz(lane===2?12:lane===1?4:7),t,.12,.07,.002);},
  /** a tap with no ball near, or the wrong pad: a dull knock */
  knock(){if(!on())return;burst('lowpass',380,.7,now(),.05,.14);},
  drop(){if(!on())return;const t=now();tone('sine',170,52,t,.3,.32,.004);burst('lowpass',500,.6,t+.02,.12,.2);tone('triangle',330,160,t+.05,.3,.08,.01);},
  trick(){if(!on())return;glock(hz(7),0,.12,.14);glock(hz(12),.06,.12,.14);glock(hz(16),.12,.24,.16);},
  life(){if(!on())return;glock(hz(0),0,.1,.12);glock(hz(7),.08,.2,.14);},
  combo(n:number){if(!on())return;const k=n>=50?4:n>=25?3:2;for(let i=0;i<k;i++)glock(hz([4,7,12,16][i]),i*.05,.14,.12);},
  over(done:boolean,stars:number){if(!on())return;if(done){for(let i=0;i<2+stars;i++)glock(hz([0,4,7,12,16][i]),.1+i*.1,.3,.18);}else{glock(hz(-5),0,.16);glock(hz(-9),.18,.16);glock(hz(-12),.36,.4);}},
  /** pause: the master fades and the context is suspended (the song clock stops with it); resume brings both back */
  hush(v:boolean){quiet=v;if(!ctx||!master)return;if(v){master.gain.setTargetAtTime(0,ctx.currentTime,.015);void ctx.suspend().catch(()=>{});}else{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.85,ctx.currentTime,.02);if(wanted())void ctx.resume().catch(()=>{});}},
  get hushed(){return quiet;},
  get state(){return ctx?ctx.state:'none';},
  dispose(){const c=ctx;ctx=null;song=null;try{bus?.disconnect();master?.disconnect();limiter?.disconnect();}catch{/* already gone */}master=null;limiter=null;bus=null;noise=null;if(c&&c.state!=='closed')void c.close().catch(()=>{});},
 };
}
