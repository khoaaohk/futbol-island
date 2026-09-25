/** Arcade audio follows the same persisted island preferences, without a second settings store. */
export function isSoundEnabled(){try{return localStorage.getItem('fi2-sound-muted')!=='true';}catch{return true;}}
export function getSoundVolume(){try{const saved=localStorage.getItem('fi2-sound-volume');const value=saved===null?.5:Number(saved);return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.5;}catch{return .5;}}
export function playClick(){
 if(!isSoundEnabled()||getSoundVolume()===0)return;
 try{const context=new AudioContext(),gain=context.createGain(),osc=context.createOscillator();gain.gain.setValueAtTime(.025*getSoundVolume(),context.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.055);osc.frequency.setValueAtTime(560,context.currentTime);osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{void context.close();};void context.resume();osc.start();osc.stop(context.currentTime+.06);}catch{/* Sound is optional on platforms without Web Audio. */}
}

/** Path cues reuse the island's gesture-unlocked context, including during scrolling. */
function pathCue(kind:string){document.dispatchEvent(new CustomEvent('fi2-path-cue',{detail:kind}));}
export function playDock(){pathCue('dock');}
export function playUndock(){pathCue('undock');}
export function playSwipe(direction:1|-1=1){pathCue(direction>0?'swipe-right':'swipe-left');}

export function playPathPop(){pathCue('path-pop');}
