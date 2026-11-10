import fs from 'node:fs';
import path from 'node:path';
import {Children,Fragment,cloneElement,isValidElement,type ReactElement,type ReactNode} from 'react';
import {ImageResponse} from 'next/og';
/**
 * One share picture per long-tail reading page (SEO, Nov 10 2026, docs/seo/DISCOVERY.md): /cards/<n>/og.png, /exhibits/<id>/og.png,
 * /fish/<id>/og.png (and /fish/<id>/art.png, the drawing alone, shown on the page). Drawn at BUILD time by the route handlers
 * (force-static + generateStaticParams), so a visitor only ever downloads a PNG: no script, no canvas, nothing that animates.
 * The look is the reading pages' own (app/(site)/site.module.css): cream paper, green ink, the brush title with its gold
 * shadow, a flat gold band. Flat colour only. The two fonts are read from the repo: IslandBrush (the title face) and the Noto
 * Sans that ships inside Next's own og package, so the build never fetches a font. IslandBrush also carries the extended Latin
 * letters of the card names (Č š ć İ ğ ı ě); the og renderer falls back to it glyph by glyph where the Latin-only Noto has none.
 */
export const OG_SIZE={width:1200,height:630} as const;
const PAPER='#fff8e7',INK='#244d40',SOFT='#4f6259',ACCENT='#7a5a1e',GOLD='#e9c16b',PANEL='#e9f3ee';
let fonts:{name:string;data:Buffer;style:'normal';weight:400}[]|null=null;
function loadFonts(){
 return fonts??=[
  {name:'Noto Sans',data:fs.readFileSync(path.join(process.cwd(),'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf')),style:'normal',weight:400},
  {name:'IslandBrush',data:fs.readFileSync(path.join(process.cwd(),'public/stories/films/assets/IslandBrush-Regular.ttf')),style:'normal',weight:400}];
}
const HEADERS={'Cache-Control':'public, max-age=86400, stale-while-revalidate=604800'};
const titleSize=(t:string,narrow:boolean)=>{const n=t.length;return narrow?(n>26?52:n>16?64:80):(n>34?64:n>22?80:100);};

export function ogCard({eyebrow,title,lines,art}:{eyebrow:string;title:string;lines:string[];art?:ReactElement}):ImageResponse{
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',backgroundColor:PAPER,color:INK,fontFamily:'Noto Sans'}}>
   <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'56px 64px 40px'}}>
    <div style={{display:'flex',fontFamily:'IslandBrush',fontSize:40,color:INK}}>Futbol Island</div>
    <div style={{display:'flex',alignItems:'center',gap:48}}>
     <div style={{flex:1,display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',fontSize:24,letterSpacing:3,textTransform:'uppercase',color:ACCENT}}>{eyebrow}</div>
      <div style={{display:'flex',fontFamily:'IslandBrush',fontSize:titleSize(title,!!art),lineHeight:1.1,color:INK,textShadow:`0 5px 0 ${GOLD}`}}>{title}</div>
      {lines.filter(Boolean).slice(0,2).map(l=><div key={l} style={{display:'flex',fontSize:30,lineHeight:1.35,color:SOFT}}>{l}</div>)}
     </div>
     {art&&<div style={{width:440,height:340,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:PANEL,borderRadius:32}}>{plainSvg(art)}</div>}
    </div>
    <div style={{display:'flex',fontSize:24,color:SOFT}}>futbolisland.app · a free football (soccer) learning game for kids 7 to 12</div>
   </div>
   <div style={{display:'flex',height:20,backgroundColor:GOLD}}/>
  </div>,{...OG_SIZE,fonts:loadFonts(),headers:HEADERS});
}
/** The og renderer draws an inline <svg> only when it is plain elements all the way down: components are called and fragments
 *  opened here first (components/FishArt.tsx builds its drawings from small part functions and fragments). */
function flat(node:ReactNode):ReactNode[]{
 return Children.toArray(node).flatMap(ch=>{
  if(!isValidElement(ch))return [ch];
  const props=ch.props as {children?:ReactNode};
  if(ch.type===Fragment)return flat(props.children);
  if(typeof ch.type==='function')return flat((ch.type as (p:unknown)=>ReactNode)(ch.props));
  const kids=flat(props.children);
  return [kids.length?cloneElement(ch,undefined,...kids):ch];
 });
}
export const plainSvg=(el:ReactElement):ReactElement=>flat(el)[0] as ReactElement;
/** The drawing alone on the page's picture panel colour (the on-page <img> of a fish page). */
export function artCard(art:ReactElement,size:{width:number;height:number}):ImageResponse{
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:PANEL}}>{plainSvg(art)}</div>,{...size,fonts:loadFonts(),headers:HEADERS});
}
