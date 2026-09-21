/** Arcade audio follows the same persisted island preferences, without a second settings store. */
export function isSoundEnabled(){try{return localStorage.getItem('fi2-sound-muted')!=='true';}catch{return true;}}
export function getSoundVolume(){try{const saved=localStorage.getItem('fi2-sound-volume');const value=saved===null?.5:Number(saved);return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.5;}catch{return .5;}}
export function playClick(){
 if(!isSoundEnabled()||getSoundVolume()===0)return;
 try{const context=new AudioContext(),gain=context.createGain(),osc=context.createOscillator();gain.gain.setValueAtTime(.025*getSoundVolume(),context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.055);osc.frequency.setValueAtTime(560,context.currentTime);osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{void context.close();};void context.resume();osc.start();osc.stop(context.currentTime+.06);}catch{/* Sound is optional on platforms without Web Audio. */}
}

/** Short synthesized UI cues sharing the click's gesture-unlocked, volume-scaled contract. */
function tone(steps:{at:number;hz:number}[],length:number,peak:number,type:OscillatorType='sine'){
 if(!isSoundEnabled()||getSoundVolume()===0)return;
 try{const context=new AudioContext(),gain=context.createGain(),osc=context.createOscillator();const t=context.currentTime;osc.type=type;
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(peak*getSoundVolume(),t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+length);
  steps.forEach((step,i)=>i?osc.frequency.exponentialRampToValueAtTime(step.hz,t+step.at):osc.frequency.setValueAtTime(step.hz,t+step.at));
  osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{void context.close();};void context.resume();osc.start(t);osc.stop(t+length+.02);}catch{/* Sound is optional. */}
}
/** The path chooser docking to the top of the scroll: a firm click-in. */
export function playDock(){tone([{at:0,hz:420},{at:.05,hz:640}],.11,.035,'triangle');}
/** The chooser releasing from the top: the same gesture, falling. */
export function playUndock(){tone([{at:0,hz:640},{at:.05,hz:420}],.11,.028,'triangle');}
/** A horizontal swipe between paths: a quick swish. */
export function playSwipe(direction:1|-1=1){tone(direction>0?[{at:0,hz:300},{at:.13,hz:900}]:[{at:0,hz:900},{at:.13,hz:300}],.16,.03,'sine');}
