import {PITCH,place,type GuideFormat,type Placed} from './pitch';
import {formationBySlug} from './formations';
import {positionBySlug} from './positions';
import {ruleBySlug} from './rules';
import {termBySlug} from './terms';
import {CHARTS} from './sizes';
import type {Scene} from './scenes';
/**
 * The same pitch diagram as a 1200 x 630 picture (Nov 10 2026): the element tree for Next's ImageResponse, used by the static
 * image route app/(site)/learn/diagrams/[file]/route.tsx. It is each guide page's Open Graph image and a real image URL for
 * image search. Plain flex boxes only (the renderer has no SVG text), drawn from lib/site/pitch.ts like the inline SVG.
 */
// Nov 10 2026: the home page's palette, as lib/site/PitchDiagram.tsx (white lines on pitch green, on the home paper).
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55',GROUND='#fbf7ee';
export const IMAGE_SIZE={width:1200,height:630};
export function pitchImage({format,spots,title,sub,mark,scene}:{format:GuideFormat;spots:readonly Placed[];title:string;sub:string;mark?:string;scene?:Scene}){
 const p=PITCH[format],H=566,k=H/p.l,W=Math.round(p.w*k),M=12,R=22;
 const abs=(left:number,top:number,width:number,height:number,extra:Record<string,string|number>={})=>({position:'absolute' as const,left,top,width,height,display:'flex' as const,...extra});
 const line=`3px solid ${PAPER}`;
 const end=(top:boolean)=>{const out=[];
  if(p.box)out.push(<div key="b" style={abs(M+(W-p.box[0]*k)/2,top?M:M+H-p.box[1]*k,p.box[0]*k,p.box[1]*k,{border:line})}/>);
  if(p.six)out.push(<div key="s" style={abs(M+(W-p.six[0]*k)/2,top?M:M+H-p.six[1]*k,p.six[0]*k,p.six[1]*k,{border:line})}/>);
  if(p.arc){const w=(p.goal+2*p.arc)*k,h=p.arc*k;out.push(<div key="a" style={abs(M+(W-w)/2,top?M:M+H-h,w,h,{border:line,borderRadius:top?`0 0 ${h}px ${h}px`:`${h}px ${h}px 0 0`})}/>);}
  if(p.buildOut)out.push(<div key="o" style={abs(M,top?M+p.buildOut*k:M+H-p.buildOut*k,W,0,{borderTop:`3px dashed ${PAPER}`})}/>);
  out.push(<div key="g" style={abs(M+(W-p.goal*k)/2,top?M-8:M+H,p.goal*k,8,{background:PAPER})}/>);
  return out;};
 return <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',background:GROUND,color:INK,padding:20}}>
  <div style={{position:'relative',display:'flex',width:W+2*M,height:H+2*M,background:GRASS,borderRadius:18,flexShrink:0}}>
   <div style={abs(M,M,W,H,{border:line})}/>
   <div style={abs(M,M+H/2-1,W,0,{borderTop:line})}/>
   <div style={abs(M+W/2-p.circle*k,M+H/2-p.circle*k,2*p.circle*k,2*p.circle*k,{border:line,borderRadius:p.circle*k})}/>
   {end(true)}{end(false)}
   {scene?.zone&&<div style={abs(M+scene.zone[0]/100*W,M+H-scene.zone[3]/100*H,(scene.zone[2]-scene.zone[0])/100*W,(scene.zone[3]-scene.zone[1])/100*H,{background:GOLD,opacity:.34})}/>}
   {scene?.lineY!==undefined&&<div style={abs(M,M+H-scene.lineY/100*H-2,W,0,{borderTop:`4px dashed ${GOLD}`})}/>}
   {spots.map((s,i)=>{const on=!mark||s.pos===mark,x=M+s.x/100*W,y=M+H-s.y/100*H;
    return <div key={i} style={abs(x-R,y-R,2*R,2*R,{alignItems:'center',justifyContent:'center',borderRadius:R,border:`3px solid ${scene&&s.team==='opp'?PAPER:INK}`,background:scene?(s.team==='opp'?INK:GOLD):mark?(on?GOLD:PAPER):i===0?PAPER:GOLD,color:scene&&s.team==='opp'?PAPER:INK,opacity:on?1:.5,fontSize:s.n.length>1?20:24,fontWeight:700})}>{s.n}</div>;})}
   {scene?.ball&&<div style={abs(M+scene.ball[0]/100*W-9,M+H-scene.ball[1]/100*H-9,18,18,{borderRadius:9,border:`3px solid ${INK}`,background:PAPER})}/>}
  </div>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',marginLeft:56,flex:1}}>
   <div style={{display:'flex',fontSize:title.length>22?64:84,fontWeight:700,lineHeight:1.05}}>{title}</div>
   <div style={{display:'flex',fontSize:36,marginTop:20,lineHeight:1.25}}>{sub}</div>
   <div style={{display:'flex',fontSize:28,marginTop:48,opacity:.8}}>Futbol Island · futbolisland.app</div>
  </div>
 </div>;
}
/** The element tree for one file name (the image route; also rendered by tests/seo-formations-positions.cjs). */
export function diagramFor(file:string){
 const c=CHARTS.find(x=>x.picture===file);
 if(c)return pitchImage({format:c.slug==='soccer-field-size-by-age'?'7v7':'11v11',spots:[],title:c.pictureTitle,sub:c.pictureSub});
 const m=/^(.+)-(formation|position|rule|term)\.png$/.exec(file);if(!m)return null;
 if(m[2]==='rule'){const r=ruleBySlug(m[1]);if(!r)return null;const sc=r.scenes[r.scenes.length-1];
  return pitchImage({format:sc.format,spots:sc.spots,scene:sc,title:r.name,sub:r.slug==='futsal-rules'?'Futsal rules for kids, with a diagram':'Soccer rule for kids, with a diagram'});}
 if(m[2]==='term'){const t=termBySlug(m[1]);if(!t)return null;
  return pitchImage({format:t.scene.format,spots:t.scene.spots,scene:t.scene,title:t.name,sub:'Soccer term for kids, with a diagram'});}
 if(m[2]==='formation'){const f=formationBySlug(m[1]);if(!f)return null;
  return pitchImage({format:f.format,spots:place(f.lines),title:f.format==='futsal'?f.name.replace(' (futsal)',''):f.shape,sub:f.format==='futsal'?'Futsal formation for kids':`${f.format} soccer formation for kids`});}
 const p=positionBySlug(m[1]),f=p&&formationBySlug(p.diagram);if(!p||!f)return null;
 return pitchImage({format:f.format,spots:place(f.lines),mark:p.slug,title:p.name,sub:`Soccer position for kids, shown in a ${f.shape}`});
}
