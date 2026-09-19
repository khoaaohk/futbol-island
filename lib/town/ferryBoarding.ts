/** Fixed boarding footprint; the moored ferry only sways a few centimetres. */
export const FERRY_RAMP={x:239,z:205.6,w:10,d:3.2};
export const FERRY_DECK={x:246,z:199,w:8.3,d:17.3,height:1.5};
export function onFerryBoarding(x:number,z:number){return [FERRY_RAMP,FERRY_DECK].some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2);}
