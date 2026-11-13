/**
 * The ONE sponsor texture atlas (Nov 12 2026). Every stadium sponsor surface samples a cell of one canvas, composed once at
 * load from the sponsor pictures (or the placeholders), so all slots share one texture and one material: adding sponsors adds no
 * draw calls. Square, power of two, at most 1024² on phones (2048² only on desktop and only if 1024² cannot hold every cell at
 * full scale), mipmapped. Cells get a 4 px gutter filled with their own edge colours so mip levels do not bleed neighbours.
 *
 * packAtlas is pure (tests/stadium-sponsors.cjs); composeAtlas draws onto any 2D context.
 */
import {SLOT_SPECS,type SlotPick,type SponsorSlot} from './slots';

export type AtlasItem={key:string;w:number;h:number};
export type AtlasRect={x:number;y:number;w:number;h:number};
/** u,v = bottom-left in texture space (CanvasTexture flipY), w,h = size; all 0..1. */
export type UvRect={u:number;v:number;w:number;h:number};
export type AtlasPlan={size:number;scale:number;pad:number;rects:Record<string,AtlasRect>};

export const ATLAS_PAD=4;
export const PHONE_ATLAS_MAX=1024,DESKTOP_ATLAS_MAX=2048;
/** A small solid cell: the big screen when it shows the match instead of a sponsor card. */
export const BLANK_KEY='blank';

/** Shelf packing (tallest first) into the smallest power-of-two square that holds every item; shrinks the cells if needed. */
export function packAtlas(items:readonly AtlasItem[],maxSize=PHONE_ATLAS_MAX,pad=ATLAS_PAD):AtlasPlan{
 const sorted=[...items].sort((a,b)=>b.h-a.h||b.w-a.w||(a.key<b.key?-1:1));
 for(let scale=1;scale>=1/8;scale/=2){
  for(let size=64;size<=maxSize;size*=2){
   const rects=shelf(sorted,size,scale,pad);if(rects)return {size,scale,pad,rects};
  }
 }
 throw new Error('sponsor atlas: cells do not fit');
}
function shelf(items:readonly AtlasItem[],size:number,scale:number,pad:number):Record<string,AtlasRect>|null{
 // First fit over open shelves (a short cell can share a taller shelf), else a new shelf below.
 const rects:Record<string,AtlasRect>={},shelves:{y:number;h:number;x:number}[]=[];let top=0;
 for(const it of items){
  const w=Math.max(4,Math.round(it.w*scale)),h=Math.max(4,Math.round(it.h*scale)),W=w+pad*2,H=h+pad*2;
  if(W>size||H>size)return null;
  let s=shelves.find(sh=>sh.h>=H&&sh.x+W<=size);
  if(!s){if(top+H>size)return null;s={y:top,h:H,x:0};shelves.push(s);top+=H;}
  rects[it.key]={x:s.x+pad,y:s.y+pad,w,h};s.x+=W;
 }
 return rects;
}
export const uvOf=(r:AtlasRect,size:number):UvRect=>({u:r.x/size,v:1-(r.y+r.h)/size,w:r.w/size,h:r.h/size});

/** The atlas key of a pick: one cell per distinct picture per slot (the same sponsor on two slots gets two cells, two aspects). */
export const pickKey=(p:SlotPick)=>p.sponsor?`${p.slot}:s:${p.sponsor.id}`:`${p.slot}:p:${p.placeholder}`;

/** Every cell the stadium needs, with the slot's cell size, plus the blank cell. */
export function atlasItems(picks:Record<SponsorSlot,SlotPick[]>):AtlasItem[]{
 const out:AtlasItem[]=[{key:BLANK_KEY,w:16,h:16}];
 for(const slot of Object.keys(picks) as SponsorSlot[]){const [w,h]=SLOT_SPECS[slot].cell;for(const p of picks[slot])out.push({key:pickKey(p),w,h});}
 return out;
}

export type Ctx2D=Pick<CanvasRenderingContext2D,'drawImage'|'fillRect'|'fillStyle'|'save'|'restore'|'beginPath'|'arc'|'clip'|'fillText'|'font'|'textAlign'|'textBaseline'|'measureText'|'roundRect'|'fill'|'translate'|'rotate'|'moveTo'|'lineTo'|'closePath'|'stroke'|'strokeStyle'|'lineWidth'|'lineJoin'|'globalAlpha'|'rect'|'strokeText'|'quadraticCurveTo'|'setTransform'|'scale'|'imageSmoothingQuality'>;
export const INK='#231a2e',PAPER='#fff3d6';

/** The small "Sponsor" tag, bottom right of a sponsor cell (never on the placeholders, which are the game's own panels). */
export function drawSponsorLabel(c:Ctx2D,r:AtlasRect,round=false){
 const h=Math.max(9,Math.round(Math.min(r.h*.16,r.w*.09))),fs=Math.round(h*.72);
 c.save();c.font=`800 ${fs}px system-ui,-apple-system,"Segoe UI",sans-serif`;
 const w=Math.ceil(c.measureText('Sponsor').width)+h*.8;
 const x=round?r.x+(r.w-w)/2:r.x+r.w-w-h*.3,y=round?r.y+r.h*.8-h/2:r.y+r.h-h-h*.3;
 c.globalAlpha=.86;c.fillStyle=INK;c.beginPath();c.roundRect(x,y,w,h,h/2);c.fill();
 c.globalAlpha=1;c.fillStyle=PAPER;c.textAlign='center';c.textBaseline='middle';c.fillText('Sponsor',x+w/2,y+h/2+.5);
 c.restore();
}

export type CellSource=CanvasImageSource&{width:number;height:number};
/**
 * Draw every cell: a sponsor picture (fitted to its cell: uploads are already within 6% of the slot's aspect; its edge stretched into the gutter, then the label), or a
 * placeholder from `drawPlaceholder`. A centre-circle cell is clipped round (outside stays transparent: alpha-tested).
 */
export function composeAtlas(c:Ctx2D,plan:AtlasPlan,picks:Record<SponsorSlot,SlotPick[]>,images:Map<string,CellSource>,
 drawPlaceholder:(c:Ctx2D,slot:SponsorSlot,index:number,r:AtlasRect)=>void){
 const b=plan.rects[BLANK_KEY];c.fillStyle='#1b2430';c.fillRect(b.x-plan.pad,b.y-plan.pad,b.w+plan.pad*2,b.h+plan.pad*2);
 c.imageSmoothingQuality='high';
 for(const slot of Object.keys(picks) as SponsorSlot[])for(const p of picks[slot]){
  const r=plan.rects[pickKey(p)];if(!r)continue;
  const img=p.sponsor?images.get(p.sponsor.id):undefined;
  c.save();
  if(slot==='centre'){c.beginPath();c.arc(r.x+r.w/2,r.y+r.h/2,r.w/2,0,Math.PI*2);c.clip();}
  if(img){
   const pad=slot==='centre'?0:plan.pad;
   c.drawImage(img,r.x-pad,r.y-pad,r.w+pad*2,r.h+pad*2);// the gutter: the picture's own edges, stretched
   c.drawImage(img,r.x,r.y,r.w,r.h);
   if(SLOT_SPECS[slot].label)drawSponsorLabel(c,r,slot==='centre');
  }else drawPlaceholder(c,slot,p.placeholder??0,r);
  c.restore();
 }
}
