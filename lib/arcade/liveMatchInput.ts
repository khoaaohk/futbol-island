export type LiveInput={mx:number;my:number;pass:boolean;shoot:boolean;through:boolean;switchPlayer:boolean;sprint:boolean;jockey:boolean;power:number};
export const neutralLiveInput=():LiveInput=>({mx:0,my:0,pass:false,shoot:false,through:false,switchPlayer:false,sprint:false,jockey:false,power:1});
export function matchAxes(mx:number,my:number){const x=Number.isFinite(mx)?mx:0,y=Number.isFinite(my)?my:0,length=Math.max(1,Math.hypot(x,y));return {x:x/length,y:-y/length};}
export const MATCH_DURATION_SECONDS=180;
