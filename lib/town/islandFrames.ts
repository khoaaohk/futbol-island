/** Heat pass 4: overlays that follow the live island (the pitch radar) update on Town's rendered frames instead of running their
 * own requestAnimationFrame chain, so they add no compositor frames of their own and sleep whenever the island sleeps. */
type Listener=(now:number)=>void;
const listeners=new Set<Listener>();
export function onIslandFrame(listener:Listener){listeners.add(listener);return ()=>{listeners.delete(listener);};}
export function emitIslandFrame(now:number){for(const listener of listeners)listener(now);}
