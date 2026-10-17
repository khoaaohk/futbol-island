/**
 * Open-space scan (Oct 17 2026, pure and deterministic): finds the big empty stretches of sand and lawn so the macro detail layer
 * (lib/town/macroDetail.ts) can fill them. A coarse grid (8 m cells) over an island's bounds; a cell is OPEN when it is mostly one
 * ground kind (sand or grass; 5 samples, >= 3 agree) and its centre is farther than `margin` (9 m) from every blocked rectangle
 * (the caller passes a RectIndex built over obstacles, buildings, roads, paths/surface areas, props and the fixed pitch rects with that
 * margin). Open cells are clustered (4-neighbour flood fill, per kind) into regions; a region's `weight` (0 for < 4 cells, up to 1 for
 * 32+ cells) scales how much detail it gets, so big empty spaces get more per area and small gaps stay clean. Existing small decals are
 * deliberately NOT part of the openness test (they are dense everywhere); they are what `openCoverage` measures.
 */
export type OpenKind='sand'|'grass';
export type Bounds={minX:number;maxX:number;minZ:number;maxZ:number};
export type OpenCell={i:number;j:number;x:number;z:number;kind:OpenKind;region:number;w:number};
export type OpenRegion={id:number;kind:OpenKind;cells:number;area:number;cx:number;cz:number;weight:number};
export type OpenScan={cell:number;margin:number;cells:OpenCell[];regions:OpenRegion[];openCells:number;openArea:number;largest:OpenRegion|null;cellAt:(x:number,z:number)=>OpenCell|null};
export const OPEN_CELL=8,OPEN_MARGIN=9;
/** 0 below 4 cells (a gap stays clean), 0.35 at 4 cells, 1 from 32 cells up. */
export const regionWeight=(n:number)=>n<4?0:.35+.65*Math.min(1,(n-4)/28);
export function scanOpenSpaces(o:{bounds:Bounds;groundAt:(x:number,z:number)=>OpenKind|null;blocked:(x:number,z:number)=>boolean;cell?:number}):OpenScan{
 const c=o.cell??OPEN_CELL,x0=Math.floor(o.bounds.minX/c),x1=Math.ceil(o.bounds.maxX/c),z0=Math.floor(o.bounds.minZ/c),z1=Math.ceil(o.bounds.maxZ/c),nx=x1-x0,nz=z1-z0;
 const grid:(OpenCell|null)[]=new Array(nx*nz).fill(null),cells:OpenCell[]=[],q=c*.375;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const x=(x0+i+.5)*c,z=(z0+j+.5)*c;if(o.blocked(x,z))continue;
  const kind=o.groundAt(x,z);if(!kind)continue; // centre decides; two opposite corners must agree at least once (a cell half in the sea is still fine)
  if(o.groundAt(x-q,z-q)!==kind&&o.groundAt(x+q,z+q)!==kind)continue;
  const cell:OpenCell={i,j,x,z,kind,region:-1,w:0};grid[j*nx+i]=cell;cells.push(cell);}
 const regions:OpenRegion[]=[];
 for(const start of cells){if(start.region>=0)continue;const id=regions.length,stack=[start];start.region=id;let n=0,sx=0,sz=0;
  while(stack.length){const a=stack.pop()!;n++;sx+=a.x;sz+=a.z;
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=a.i+di,jj=a.j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const b=grid[jj*nx+ii];if(b&&b.region<0&&b.kind===start.kind){b.region=id;stack.push(b);}}}
  regions.push({id,kind:start.kind,cells:n,area:n*c*c,cx:sx/n,cz:sz/n,weight:regionWeight(n)});}
 for(const a of cells)a.w=regions[a.region].weight;
 const largest=regions.reduce<OpenRegion|null>((m,r)=>!m||r.cells>m.cells?r:m,null);
 return {cell:c,margin:OPEN_MARGIN,cells,regions,openCells:cells.length,openArea:cells.length*c*c,largest,
  cellAt:(x,z)=>{const i=Math.floor(x/c)-x0,j=Math.floor(z/c)-z0;return i<0||j<0||i>=nx||j>=nz?null:grid[j*nx+i];}};
}
/** Share of the open area (4 m sub-cells inside open cells) that holds at least one detail instance. */
export function openCoverage(scan:OpenScan,points:{x:number;z:number}[],sub=4){
 const hit=new Set<string>();for(const p of points)hit.add(Math.floor(p.x/sub)+','+Math.floor(p.z/sub));
 let total=0,covered=0;const per=Math.round(scan.cell/sub);
 for(const c of scan.cells){const bx=Math.floor((c.x-scan.cell/2)/sub+.5),bz=Math.floor((c.z-scan.cell/2)/sub+.5);
  for(let a=0;a<per;a++)for(let b=0;b<per;b++){total++;if(hit.has((bx+a)+','+(bz+b)))covered++;}}
 return {covered,total,ratio:total?covered/total:0};
}
