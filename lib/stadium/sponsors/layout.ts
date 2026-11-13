/**
 * Where the sponsor surfaces sit (Nov 12 2026). The stadium (phase 2) passes a SponsorLayout to createSponsorSurfaces; the
 * default one follows the concept plan (west-stadium/index.html): a 63 × 100 m pitch, long axis north-south.
 *
 * Coordinates are stadium-local metres: origin on the centre spot at grass level, +X east, +Z south, +Y up. The stadium places
 * the returned group (position / rotation) on the island. A quad is its CENTRE, its width and height, and `yaw`, the direction its
 * picture faces: 0 = towards +Z (south), π/2 = towards +X (east), π = north, -π/2 = west. Pure (no three.js).
 */
export type SponsorQuad={x:number;y:number;z:number;w:number;h:number;yaw:number};
export type SponsorLayout={
 /** The pitchside ring, in order round the pitch (16 in the concept; any count works). */
 boards:SponsorQuad[];
 /** The big screen at the south end (its picture face; the stadium builds the frame and the match score). */
 screen:SponsorQuad;
 /** The naming-partner board on the gate arch. */
 gate:SponsorQuad;
 /** Roof fascia banners on the long stands (2 in the concept). */
 fascia:SponsorQuad[];
 /** Plaza flags: each is drawn on both sides, reading the right way round from either side. */
 flags:SponsorQuad[];
 /** The centre-circle logo, flat on the grass: centre and radius (y = height above the grass, default 0.03). */
 centre:{x:number;z:number;r:number;y?:number};
};

const E=Math.PI/2;
/** The concept's layout. Boards 0.92 m tall sit 4 m outside the lines; the screen behind the south stand; the gate and flags east. */
export function defaultStadiumLayout():SponsorLayout{
 const boards:SponsorQuad[]=[],H=.92,y=H/2;
 for(let i=0;i<4;i++){const z=-37.5+i*25;boards.push({x:-35.5,y,z,w:22,h:H,yaw:E});}// west side, facing the pitch (east)
 for(let i=0;i<4;i++){const x=-22.5+i*15;boards.push({x,y,z:54,w:14,h:H,yaw:Math.PI});}// south end, facing north
 for(let i=0;i<4;i++){const z=37.5-i*25;boards.push({x:35.5,y,z,w:22,h:H,yaw:-E});}// east side, facing west
 for(let i=0;i<4;i++){const x=22.5-i*15;boards.push({x,y,z:-54,w:14,h:H,yaw:0});}// north end, facing south
 return {
  boards,
  screen:{x:0,y:14,z:72,w:16,h:9,yaw:Math.PI},
  gate:{x:58.5,y:7.5,z:0,w:12,h:3,yaw:E},
  fascia:[{x:-58,y:16,z:0,w:84,h:2.6,yaw:-E},{x:58,y:16,z:0,w:84,h:2.6,yaw:E}],
  flags:[-40,-31,-22,22,31,40].map(z=>({x:66,y:5.2,z,w:1.6,h:2.4,yaw:E})),
  centre:{x:0,z:0,r:4.6},
 };
}

/** How many times a picture of `aspect` repeats along a quad (whole repeats, so no picture is cut; ≥ 1). */
export const repeatsFor=(q:{w:number;h:number},aspect:number)=>Math.max(1,Math.round(q.w/(q.h*aspect)));

/** Sanity check for a layout from phase 2: finite numbers, positive sizes, a sane count. Returns the problems found. */
export function layoutProblems(l:SponsorLayout):string[]{
 const bad:string[]=[];const q=(name:string,v:SponsorQuad|undefined)=>{
  if(!v){bad.push(name+' missing');return;}
  for(const k of ['x','y','z','w','h','yaw'] as const)if(!Number.isFinite(v[k]))bad.push(`${name}.${k}`);
  if(!(v.w>0&&v.h>0))bad.push(name+' size');
 };
 if(!Array.isArray(l.boards)||l.boards.length>64)bad.push('boards');else l.boards.forEach((b,i)=>q('boards['+i+']',b));
 q('screen',l.screen);q('gate',l.gate);
 (l.fascia??[]).forEach((b,i)=>q('fascia['+i+']',b));(l.flags??[]).forEach((b,i)=>q('flags['+i+']',b));
 if(!l.centre||!(l.centre.r>0)||!Number.isFinite(l.centre.x)||!Number.isFinite(l.centre.z))bad.push('centre');
 return bad;
}
