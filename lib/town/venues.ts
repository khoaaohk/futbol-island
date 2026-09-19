export type Format='futsal'|'7v7'|'9v9'|'11v11';
export type Venue={id:Format;name:string;x:number;z:number;width:number;length:number;players:number;goalWidth:number;goalHeight:number;surface:string;shape:string;elevation?:number};
export const VENUES:Venue[]=[
 {id:'futsal',name:'Palm Coast Rooftop',x:11,z:18,elevation:6,width:20*250/270,length:40*380/400,players:5,goalWidth:3,goalHeight:2,surface:'#737c75',shape:'3 + 1'},
 {id:'7v7',name:'Old Town Ground',x:11,z:-80,width:37*250/270,length:55*380/400,players:7,goalWidth:4.9,goalHeight:2.13,surface:'#6e9678',shape:'2–3–1'},
 {id:'9v9',name:'Club Grounds',x:160,z:-110,width:45.7*250/270,length:73.2*380/400,players:9,goalWidth:6.4,goalHeight:2.13,surface:'#6e9678',shape:'3–2–3'},
 {id:'11v11',name:'Eleven Park',x:135,z:100,width:68*250/270,length:105*380/400,players:11,goalWidth:7.32,goalHeight:2.44,surface:'#6e9678',shape:'4–3–3'},
];
export const venueById=(id:Format)=>VENUES.find(v=>v.id===id)!;
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
