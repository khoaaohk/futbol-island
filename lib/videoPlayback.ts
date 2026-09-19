// Event-driven ownership: overlapping player cleanup cannot resume another video.
const active=new Set<symbol>();
const listeners=new Set<(playing:boolean)=>void>();
export const isVideoPlaying=()=>active.size>0;
export function holdVideoPlayback(){const owner=Symbol();active.add(owner);if(active.size===1)listeners.forEach(fn=>fn(true));let released=false;return()=>{if(released)return;released=true;active.delete(owner);if(!active.size)listeners.forEach(fn=>fn(false));};}
export function subscribeVideoPlayback(listener:(playing:boolean)=>void){listeners.add(listener);listener(isVideoPlaying());return()=>{listeners.delete(listener);};}
