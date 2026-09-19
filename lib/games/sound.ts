/** Arcade audio follows the same persisted island preferences, without a second settings store. */
export function isSoundEnabled(){try{return localStorage.getItem('fi2-sound-muted')!=='true';}catch{return true;}}
export function getSoundVolume(){try{const saved=localStorage.getItem('fi2-sound-volume');const value=saved===null?.5:Number(saved);return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.5;}catch{return .5;}}
export function playClick(){
 if(!isSoundEnabled()||getSoundVolume()===0)return;
 try{const context=new AudioContext(),gain=context.createGain(),osc=context.createOscillator();gain.gain.setValueAtTime(.025*getSoundVolume(),context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.055);osc.frequency.setValueAtTime(560,context.currentTime);osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{void context.close();};void context.resume();osc.start();osc.stop(context.currentTime+.06);}catch{/* Sound is optional on platforms without Web Audio. */}
}
