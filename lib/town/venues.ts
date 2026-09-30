import {BEACH_COURT} from './coralCay';
export type Format='futsal'|'7v7'|'9v9'|'11v11';
export type Venue={id:Format;name:string;x:number;z:number;width:number;length:number;players:number;goalWidth:number;goalHeight:number;surface:string;shape:string;elevation?:number};
export const VENUES:Venue[]=[
 {id:'futsal',name:'Palm Coast Rooftop',x:11,z:18,elevation:6,width:20*250/270,length:40*380/400,players:5,goalWidth:3,goalHeight:2,surface:'#737c75',shape:'3 + 1'},
 {id:'7v7',name:'Old Town Ground',x:11,z:-80,width:37*250/270,length:55*380/400,players:7,goalWidth:4.9,goalHeight:2.13,surface:'#6e9678',shape:'2–3–1'},
 {id:'9v9',name:'Club Grounds',x:160,z:-110,width:45.7*250/270,length:73.2*380/400,players:9,goalWidth:6.4,goalHeight:2.13,surface:'#6e9678',shape:'3–2–3'},
 {id:'11v11',name:'Eleven Park',x:135,z:100,width:68*250/270,length:105*380/400,players:11,goalWidth:7.32,goalHeight:2.44,surface:'#6e9678',shape:'4–3–3'},
];
export const venueById=(id:Format)=>VENUES.find(v=>v.id===id)!;

// ---------------------------------------------------------------------------------------------------------------
// Live-match venues (Sep 29 2026): the four island pitches plus Coral Cay's beach-soccer court. The beach court is not
// one of VENUES (its sand, lines, goals, benches and walking obstacles are built by coralCayWorld.ts), so it has no
// island pitch mesh, goal barriers, lessons or quests; it only hosts a live 5-a-side match (fieldRuntime).
/** 'beach' = FIFA Beach Soccer, 5 a side including the keeper (lib/town/match/matchSim.ts). */
export type LiveFormat=Format|'beach';
/** `yaw` turns the pitch's long axis (sim y, goal to goal) from world +z; the island pitches all run north–south (0). */
export type LiveVenue=Omit<Venue,'id'>&{id:LiveFormat;yaw?:number;sand?:boolean};
/** Sharks Beach court at Coral Cay (BEACH_COURT, coralCay.ts): 36 × 27 m, 5.5 × 2.2 m goals, long axis east–west.
 *  Width/length are the drawn court (the sim's goal lines sit at ±length/2, as on the island pitches). */
export const BEACH_VENUE:LiveVenue={id:'beach',name:'Sharks Beach Court',x:BEACH_COURT.x,z:BEACH_COURT.z,width:BEACH_COURT.width,length:BEACH_COURT.length,players:5,goalWidth:BEACH_COURT.goalWidth,goalHeight:BEACH_COURT.goalHeight,surface:'#e8d5a3',shape:'1-2-1',yaw:Math.PI/2,sand:true};
export const LIVE_VENUES:readonly LiveVenue[]=[...VENUES,BEACH_VENUE];
export const liveVenueById=(id:LiveFormat):LiveVenue=>LIVE_VENUES.find(v=>v.id===id)!;
/** Sim field point (270 × 400, centre 135/200) → world x/z on a live venue, turned by its yaw. Unturned venues use the
 *  exact expressions fieldRuntime always used, so their numbers are unchanged. */
export function liveWorldX(v:Pick<LiveVenue,'x'|'width'|'length'|'yaw'>,x:number,y:number){
 if(!v.yaw)return v.x+(x-135)/250*v.width;
 return v.x+(x-135)/250*v.width*Math.cos(v.yaw)+(y-200)/380*v.length*Math.sin(v.yaw);
}
export function liveWorldZ(v:Pick<LiveVenue,'z'|'width'|'length'|'yaw'>,x:number,y:number){
 if(!v.yaw)return v.z+(y-200)/380*v.length;
 return v.z-(x-135)/250*v.width*Math.sin(v.yaw)+(y-200)/380*v.length*Math.cos(v.yaw);
}
/** Inverse of liveWorldX/liveWorldZ: world x/z → sim field point on a live venue (turned courts included; for yaw 0 it is the
 *  plain north–south mapping). Used where a world move is written back into the sim (a knocked-over player, code review
 *  finding 3). */
export function liveFieldPoint(v:Pick<LiveVenue,'x'|'z'|'width'|'length'|'yaw'>,x:number,z:number){
 const ox=x-v.x,oz=z-v.z,c=Math.cos(v.yaw??0),s=Math.sin(v.yaw??0);
 return {x:135+(ox*c-oz*s)/v.width*250,y:200+(ox*s+oz*c)/v.length*380};
}
/** World yaw (three.js rotation.y) of a sim-space direction (dx, dy) on a live venue. */
export function liveWorldYaw(v:Pick<LiveVenue,'width'|'length'|'yaw'>,dx:number,dy:number){return Math.atan2(dx*v.width/250,dy*v.length/380)+(v.yaw??0);}
/** World half-extents of a live venue on the x and z axes (a quarter-turned court swaps them). */
export const liveHalfX=(v:Pick<LiveVenue,'width'|'length'|'yaw'>)=>Math.abs(Math.sin(v.yaw??0))>.5?v.length/2:v.width/2;
export const liveHalfZ=(v:Pick<LiveVenue,'width'|'length'|'yaw'>)=>Math.abs(Math.sin(v.yaw??0))>.5?v.width/2:v.length/2;
export const venueEntrance=(v:Venue)=>({x:v.x,z:v.z+v.length/2+6});
export const fieldPoint=(v:Venue,p:{x:number;y:number})=>({x:v.x+(p.x-135)/250*v.width,z:v.z+(p.y-200)/380*v.length});
export function nearestVenue(x:number,z:number){return VENUES.reduce<Venue|null>((best,v)=>{const d=Math.hypot(Math.max(0,Math.abs(x-v.x)-v.width/2),Math.max(0,Math.abs(z-v.z)-v.length/2));if(d>16)return best;return !best||Math.hypot(x-v.x,z-v.z)<Math.hypot(x-best.x,z-best.z)?v:best;},null);}

/** Top of the raised playing slab, including its safety runoff. */
export const FIELD_SURFACE_Y=.105;
/** Walkable garage roof, upper landing and driveable ramp. */
export function parkingSurfaceHeight(x:number,z:number){
 if((x>=-3&&x<=25&&z>=-10&&z<=46)||(x>=22&&x<=34&&z>=-10&&z<=-5))return 6;
 if(x>=28&&x<=34&&z>=-5&&z<=45)return 6*(45-z)/50;
 return 0;
}
export function fieldSurfaceHeight(x:number,z:number,margin=0){
 const v=VENUES.find(v=>Math.abs(x-v.x)<=v.width/2+3+margin&&Math.abs(z-v.z)<=v.length/2+3+margin);
 return v?(v.elevation??0)+FIELD_SURFACE_Y:parkingSurfaceHeight(x,z);
}

export const ISLAND_SQUARE={x:95,z:-35};
export const ARCADE_DOOR={x:103,z:-48};
export const STORE_DOOR={x:85,z:-50};

/** Clear walkway in front of the Coaches Centre, north of the rebound wall. */
export const COACHES_DOOR={x:161,z:-33};
