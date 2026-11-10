import {toSvgString,type Sheet} from './sheet';
/**
 * A sheet (lib/site/tools/sheet.ts) as the element tree for Next's ImageResponse: the static PNG route of the printables
 * (app/(site)/tools/soccer-field-diagrams/files/[file]/route.tsx). The shapes are the sheet's own SVG, handed over as one
 * picture (a data URI: the renderer draws SVG pictures but not SVG text, and it does not expand components inside an inline
 * <svg>); every text item is a positioned box on top, at the same spot and size.
 */
export const SHEET_SCALE=1.5;
/** The sheet's drawing without its words, as a data URI. */
export const shapesDataUri=(s:Sheet)=>`data:image/svg+xml;base64,${Buffer.from(toSvgString({...s,items:s.items.filter(i=>i.t!=='text')})).toString('base64')}`;
export function sheetImage(s:Sheet,scale=SHEET_SCALE){
 const W=Math.round(s.w*scale),H=Math.round(s.h*scale);
 return {width:W,height:H,tree:<div style={{position:'relative',display:'flex',width:W,height:H,background:s.bg}}>
  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- an ImageResponse tree, not a page */}
  <img src={shapesDataUri(s)} width={W} height={H} style={{position:'absolute',left:0,top:0}}/>
  {s.items.map((i,n)=>{if(i.t!=='text')return null;const size=i.size*scale,box=1200,a=i.anchor??'start';
   return <div key={n} style={{position:'absolute',display:'flex',top:(i.y-i.size*.92)*scale,left:(a==='middle'?i.x*scale-box/2:a==='end'?i.x*scale-box:i.x*scale),width:box,
    justifyContent:a==='middle'?'center':a==='end'?'flex-end':'flex-start',fontSize:size,lineHeight:1.15,fontWeight:i.weight??400,color:i.fill,whiteSpace:'nowrap'}}>{i.text}</div>;})}
 </div>};
}
