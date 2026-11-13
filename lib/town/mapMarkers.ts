/**
 * Travel-map marks (V vending, F fishing, J jobs, E reefs to explore; was D for dive spots before Oct 20 2026): the map key's tap tooltips and where the J marks sit.
 * The marks on the map are plain drawings (not buttons); the key explains them in general, not per place (tests/map-markers.cjs).
 */
export type MapMarkKind='vending'|'fishing'|'job'|'dive'|'far'|'friend'|'players'|'gashapon';
type Point={x:number;z:number};

/** The key's tooltips, one per kind, in words a child can read: shown as "<title>: <text>". */
export const LEGEND_TIPS:Record<MapMarkKind,{title:string;text:string}>={
 vending:{title:'Vending machines:',text:'spend coins on books, packs and gear'},
 fishing:{title:'Fishing spots:',text:'catch fish to sell at Rosa’s market'},
 job:{title:'Jobs:',text:'help out to earn coins'},
 // Nov 9 2026 (owner: "add the gashapon to the map"): the capsule machines, one mark per spot (a Konbini pair shares one).
 gashapon:{title:'Gashapon:',text:'spin a capsule machine for a surprise toy'},
 dive:{title:'Reefs to explore:',text:'swim out to the flag and explore the shallow coral reef'},
 // Oct 21 2026 (reefDiscovery.ts): the jetpack badge on the E marks whose reef is beyond the 60 m swim range.
 far:{title:'Fly there:',text:'too far to swim, so take your jetpack to these reefs'},
 // Oct 23 2026: party friends' dots (components/FriendMapDots.tsx), keyed only while a party is live.
 friend:{title:'Friends:',text:'your party, each in their own colour. Tap a dot to see who it is'},
 // Nov 13 2026: other players in my public world (components/PlayerMapDots.tsx): rough, unnamed spots, keyed only while there are some.
 players:{title:'Players:',text:'other kids on the island right now. A number means a few are together'},
};
/** One entry of the map key. `ring` = the You marker, `friend` = the party dots' mark, `players` = the other players' soft dot. */
export type LegendItem={mark:string;fill:string;label:string;ring?:boolean;friend?:boolean;players?:boolean;tip?:MapMarkKind};
const BASE_LEGEND:readonly LegendItem[]=[
 {mark:'V',fill:'#fff8e5',label:'Vending',tip:'vending'},{mark:'F',fill:'#b9e1df',label:'Fishing',tip:'fishing'},{mark:'J',fill:'#f4cc7c',label:'Jobs',tip:'job'},{mark:'gasha',fill:'#ffe1ef',label:'Gashapon',tip:'gashapon'},{mark:'E',fill:'#a9dcf5',label:'Explore',tip:'dive'},{mark:'jet',fill:'#f4cc7c',label:'Fly there',tip:'far'},
 {mark:'',fill:'#7b4fd6',label:'You',ring:true}];
const FRIEND_LEGEND:readonly LegendItem[]=[...BASE_LEGEND,{mark:'',fill:'#D62828',label:'Friends',friend:true,tip:'friend'}];
const PLAYERS_LEGEND:readonly LegendItem[]=[...BASE_LEGEND,{mark:'',fill:'#fff7db',label:'Players',players:true,tip:'players'}];
/** The travel map's key (G-13): "Friends" is listed ONLY while a party is live with someone in it (no party = the key as before).
 *  Phones lay 7 entries out 4 + 3 and 8 entries 4 + 4 (the Gashapon entry joined the key on Nov 9 2026). */
/** `players`: "Players" joins only in a public world while the map has other players' dots (a party and a world never overlap). */
export const mapLegend=(friends:boolean,players=false):readonly LegendItem[]=>friends?FRIEND_LEGEND:players?PLAYERS_LEGEND:BASE_LEGEND;
export const legendTipText=(kind:MapMarkKind)=>`${LEGEND_TIPS[kind].title} ${LEGEND_TIPS[kind].text}`;

/**
 * One J per job board (jobCatalog JOBS), nudged clear of the V/F marks, the big field names and Rosa's label that a board
 * often stands beside (a board usually sits next to a field's vending machine). Computed once at module load.
 */
export function placeJobMarkers(
 jobs:readonly {id:string;title:string;place:string;board:Point}[],
 marks:readonly Point[],
 venues:readonly Point[],
 market:Point|null,
 /** Place labels drawn on the map (centre, width and height in map units): a J never covers one; it moves just above. */
 labels:readonly {x:number;z:number;w:number;h:number}[]=[],
):{id:string;title:string;place:string;x:number;z:number}[]{
 const placed:{id:string;title:string;place:string;x:number;z:number}[]=[];
 for(const job of jobs){let x=job.board.x,z=job.board.z;
  const others=[...marks,...placed];
  for(let pass=0;pass<4;pass++){
   // Keep the big field names ("11v11") readable: a board painted at the centre circle moves just below the name.
   for(const v of venues)if(Math.abs(x-v.x)<34&&Math.abs(z-(v.z-3))<16)z=v.z+20;
   if(market&&x>market.x-136&&x<market.x-14&&Math.abs(z-market.z)<22)z=market.z+(z<market.z?-22:22);
   for(const l of labels)if(Math.abs(x-l.x)<l.w/2+11&&Math.abs(z-l.z)<l.h/2+11)z=l.z-l.h/2-12;
   for(const o of others){const dx=x-o.x,dz=z-o.z,d=Math.hypot(dx,dz);if(d<20){const k=d<.01?1:dx/d,l=d<.01?0:dz/d;x=o.x+k*20;z=o.z+l*20;}}
  }
  placed.push({id:job.id,title:job.title,place:job.place,x,z});}
 return placed;
}

/**
 * Gashapon marks (Nov 9 2026, owner: "add the gashapon to the map"): one per spot, machines standing side by side (each Konbini
 * pair, 0.9 m apart) share one, then nudged just clear of the V / F marks they often stand near (the Konbini's own V is a few
 * metres east of its pair). Static: computed once at module load.
 */
export function placeGashaponMarkers(
 machines:readonly {id:string;name:string;x:number;z:number}[],
 marks:readonly Point[],
):{id:string;ids:string[];names:string[];x:number;z:number}[]{
 const groups:{id:string;ids:string[];names:string[];x:number;z:number}[]=[];
 for(const m of machines){const g=groups.find(o=>Math.hypot(o.x-m.x,o.z-m.z)<6);
  if(g){g.x=(g.x*g.ids.length+m.x)/(g.ids.length+1);g.z=(g.z*g.ids.length+m.z)/(g.ids.length+1);g.ids.push(m.id);g.names.push(m.name);}
  else groups.push({id:m.id,ids:[m.id],names:[m.name],x:m.x,z:m.z});}
 for(const g of groups)for(let pass=0;pass<4;pass++)for(const o of marks){const dx=g.x-o.x,dz=g.z-o.z,d=Math.hypot(dx,dz);
  if(d<20){const k=d<.01?-1:dx/d,l=d<.01?0:dz/d;g.x=o.x+k*20;g.z=o.z+l*20;}}
 return groups.map(g=>({...g,x:Math.round(g.x*100)/100,z:Math.round(g.z*100)/100}));
}
/** The Gashapon mark's capsule (map + key): a red top half and a white bottom half split by a seam, centre (cx, cy), radius r. */
export function capsuleGlyph(cx:number,cy:number,r:number){const f=(v:number)=>Math.round(v*100)/100,a=f(cx-r),b=f(cx+r),y=f(cy);
 return {top:`M${a} ${y}A${f(r)} ${f(r)} 0 0 1 ${b} ${y}Z`,bottom:`M${a} ${y}A${f(r)} ${f(r)} 0 0 0 ${b} ${y}Z`,seam:`M${a} ${y}H${b}`};}
