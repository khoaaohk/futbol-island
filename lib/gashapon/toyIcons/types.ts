/**
 * Toy icon helpers (Nov 10 2026, owner: "update all these icons to the art style we talked about and match each to their toys").
 * Every icon is the INNER markup of an `<svg viewBox="0 0 16 16" shape-rendering="crispEdges">` (components/ToyIcon.tsx adds the
 * svg). Static strings only, built once at module load from these helpers: no user data ever reaches them. The guide is at the
 * top of ./index.ts.
 */
/** The island's outline ink (FuelIcon, FruitArt, PocketFishIcon). */
export const INK='#244d40';
/** The one small highlight per icon. */
export const LIGHT='#fff6e4';
/** Inner markup for one 16 x 16 icon. */
export type ToyIconMarkup=string;
export type ToyIconSet=Readonly<Record<string,ToyIconMarkup>>;

/** Fill + the standard outline (1.2 wide; 1.4 for big simple silhouettes, 1 for small parts). */
export const ol=(fill:string,w=1.2)=>`fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
/** A filled, outlined path. */
export const shape=(d:string,fill:string,w=1.2)=>`<path d="${d}" ${ol(fill,w)}/>`;
/** A filled, outlined circle. */
export const dot=(cx:number,cy:number,r:number,fill:string,w=1.2)=>`<circle cx="${cx}" cy="${cy}" r="${r}" ${ol(fill,w)}/>`;
/** An unoutlined fill (inner patches, spots). */
export const fill=(d:string,color:string)=>`<path d="${d}" fill="${color}"/>`;
/** A plain stroke (details: seams, grids, stripes). */
export const line=(d:string,color:string,w=1)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** The highlight: a short light stroke on the upper-left of the main shape. */
export const hl=(d:string,w=1)=>line(d,LIGHT,w);
/** The outline only (re-drawn over inner fills so they never cover the ink). */
export const edge=(d:string,w=1.2)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** Mirror a run of elements left-right across the 16-wide box (elements must not carry their own transform). */
export const flipX=(m:string)=>m.replace(/\/>/g,' transform="matrix(-1 0 0 1 16 0)"/>');
const r2=(n:number)=>Math.round(n*100)/100;
/**
 * A classic football: white, a centre pentagon and five edge patches (bright stand-in colour, never black), seams to the rim.
 * Reads as a ball from about r = 1.6 up.
 */
export function ball(cx:number,cy:number,r:number,patch='#4d5f86',w=1):ToyIconMarkup{
 const p=(a:number,k:number)=>`${r2(cx+Math.cos(a)*r*k)} ${r2(cy+Math.sin(a)*r*k)}`,rad=(deg:number)=>deg*Math.PI/180;
 let pent='',seams='',caps='';
 for(let i=0;i<5;i++){const a=rad(-90+i*72),b=rad(-90+i*72+36);
  pent+=(i?'L':'M')+p(a,.36);seams+=`M${p(a,.36)}L${p(a,.62)}`;
  caps+=`M${p(b-rad(17),1)}A${r2(r)} ${r2(r)} 0 0 1 ${p(b+rad(17),1)}L${p(b,.7)}Z`;}
 return dot(cx,cy,r,'#ffffff',w)+fill(caps,patch)+fill(pent+'Z',patch)+line(seams,'#7f93a6',Math.max(.4,r*.14))
  +`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="${w}"/>`;
}

/**
 * Pixel art (the Pixel Pitch machine): rows of one character per 1 x 1 cell, '.' empty, other characters looked up in `pal`.
 * Every empty cell touching a filled one (up, down, left, right) becomes an INK outline cell, so pixel icons get the same outline
 * as the vector ones. Leave a one-cell margin. Runs of one colour merge into one rect.
 */
export function pix(rows:readonly string[],pal:Readonly<Record<string,string>>):ToyIconMarkup{
 const at=(x:number,y:number)=>{const c=rows[y]?.[x];return c&&c!=='.'?c:'';};
 const grid:string[][]=[];
 for(let y=0;y<16;y++){grid[y]=[];for(let x=0;x<16;x++){const c=at(x,y);
  grid[y][x]=c?pal[c]??'':(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))?INK:'';}}
 let out='';
 for(let y=0;y<16;y++)for(let x=0;x<16;){const col=grid[y][x];if(!col){x++;continue;}let w=1;while(x+w<16&&grid[y][x+w]===col)w++;
  out+=`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${col}"/>`;x+=w;}
 return out;
}
