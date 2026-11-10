// Event-driven ownership: overlapping player cleanup cannot resume another video.
const active=new Set<symbol>(),covers=new Set<symbol>();
const listeners=new Set<(playing:boolean)=>void>();
/** The island sleeps (no frames, world sound paused) while a film plays OR a full-screen cover is up. */
export const isVideoPlaying=()=>active.size>0||covers.size>0;
/** Only real films / pop-up books (the 'films' activity in analytics); a cover such as the gashapon toy viewer is not one. */
export const isFilmPlaying=()=>active.size>0;
// Listeners hear the combined state, and again whenever the film part of it changes (so Town can tell films from covers).
let lastAny=false,lastFilm=false;
function changed(){const any=isVideoPlaying(),film=isFilmPlaying();if(any===lastAny&&film===lastFilm)return;lastAny=any;lastFilm=film;listeners.forEach(fn=>fn(any));}
function hold(set:Set<symbol>){const owner=Symbol();set.add(owner);changed();let released=false;return()=>{if(released)return;released=true;set.delete(owner);changed();};}
export function holdVideoPlayback(){return hold(active);}
/** A full-screen overlay that hides the whole island (gashapon toy viewer, Nov 8 2026): the island loop and sounds sleep under it. */
export function holdIslandCover(){return hold(covers);}
export function subscribeVideoPlayback(listener:(playing:boolean)=>void){listeners.add(listener);listener(isVideoPlaying());return()=>{listeners.delete(listener);};}
