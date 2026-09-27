export type IslandPosition={x:number;z:number};
/** `publish` (~150 ms, React subscribers) and, since heat pass 3, `frame` (every rendered island frame, no React): the local minimap
 * writes its layer transform from `frame` so it moves on the island's own 30 fps frames instead of running a CSS transition at display
 * rate. `frame` costs one Set check when nothing listens. */
export function createPositionStore(initial:IslandPosition){let position={...initial};const listeners=new Set<()=>void>(),frameListeners=new Set<(x:number,z:number)=>void>();return {getSnapshot:()=>position,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},publish(next:IslandPosition){if(position.x===next.x&&position.z===next.z)return;position={...next};for(const listener of listeners)listener();},
 subscribeFrame:(listener:(x:number,z:number)=>void)=>{frameListeners.add(listener);return()=>{frameListeners.delete(listener);};},frame(x:number,z:number){for(const listener of frameListeners)listener(x,z);}};}
export type PositionStore=ReturnType<typeof createPositionStore>;
