export type IslandPosition={x:number;z:number};
export function createPositionStore(initial:IslandPosition){let position={...initial};const listeners=new Set<()=>void>();return {getSnapshot:()=>position,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},publish(next:IslandPosition){if(position.x===next.x&&position.z===next.z)return;position={...next};for(const listener of listeners)listener();}};}
export type PositionStore=ReturnType<typeof createPositionStore>;
