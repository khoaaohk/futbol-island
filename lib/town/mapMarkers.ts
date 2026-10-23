/**
 * Travel-map marks (V vending, F fishing, J jobs, E reefs to explore; was D for dive spots before Oct 20 2026): the map key's tap tooltips and where the J marks sit.
 * The marks on the map are plain drawings (not buttons); the key explains them in general, not per place (tests/map-markers.cjs).
 */
export type MapMarkKind='vending'|'fishing'|'job'|'dive'|'far'|'friend';
type Point={x:number;z:number};

/** The key's tooltips, one per kind, in words a child can read: shown as "<title>: <text>". */
export const LEGEND_TIPS:Record<MapMarkKind,{title:string;text:string}>={
 vending:{title:'Vending machines:',text:'spend coins on books, packs and gear'},
 fishing:{title:'Fishing spots:',text:'catch fish to sell at Rosa’s market'},
 job:{title:'Jobs:',text:'help out to earn coins'},
 dive:{title:'Reefs to explore:',text:'swim out to the flag and explore the shallow coral reef'},
 // Oct 21 2026 (reefDiscovery.ts): the jetpack badge on the E marks whose reef is beyond the 60 m swim range.
 far:{title:'Fly there:',text:'too far to swim, so take your jetpack to these reefs'},
 // Oct 23 2026: party friends' dots (components/FriendMapDots.tsx), keyed only while a party is live.
 friend:{title:'Friends:',text:'your party, each in their own colour. Tap a dot to see who it is'},
};
/** One entry of the map key. `ring` = the You marker, `friend` = the party dots' mark. */
export type LegendItem={mark:string;fill:string;label:string;ring?:boolean;friend?:boolean;tip?:MapMarkKind};
const BASE_LEGEND:readonly LegendItem[]=[
 {mark:'V',fill:'#fff8e5',label:'Vending',tip:'vending'},{mark:'F',fill:'#b9e1df',label:'Fishing',tip:'fishing'},{mark:'J',fill:'#f4cc7c',label:'Jobs',tip:'job'},{mark:'E',fill:'#a9dcf5',label:'Explore',tip:'dive'},{mark:'jet',fill:'#f4cc7c',label:'Fly there',tip:'far'},
 {mark:'',fill:'#7b4fd6',label:'You',ring:true}];
const FRIEND_LEGEND:readonly LegendItem[]=[...BASE_LEGEND,{mark:'',fill:'#D62828',label:'Friends',friend:true,tip:'friend'}];
/** The travel map's key (G-13): "Friends" is listed ONLY while a party is live with someone in it (no party = the key as before).
 *  Phones lay 6 entries out 3 + 3 and 7 entries 4 + 3 (Fly there, You and Friends share the second row). */
export const mapLegend=(friends:boolean):readonly LegendItem[]=>friends?FRIEND_LEGEND:BASE_LEGEND;
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
