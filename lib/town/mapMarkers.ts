/**
 * Travel-map marks (V vending, F fishing, J jobs): the map key's tap tooltips and where the J marks sit.
 * The marks on the map are plain drawings (not buttons); the key explains them in general, not per place (tests/map-markers.cjs).
 */
export type MapMarkKind='vending'|'fishing'|'job';
type Point={x:number;z:number};

/** The key's tooltips, one per kind, in words a child can read: shown as "<title>: <text>". */
export const LEGEND_TIPS:Record<MapMarkKind,{title:string;text:string}>={
 vending:{title:'Vending machines:',text:'spend coins on books, packs and gear'},
 fishing:{title:'Fishing spots:',text:'catch fish to sell at Rosa’s market'},
 job:{title:'Jobs:',text:'help out to earn coins'},
};
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
