import {drillBySlug} from './drills';
import {gridSize,type GridScene} from './grid';
/**
 * A drill's practice grid as a 1200 x 630 picture (Nov 10 2026): the element tree for Next's ImageResponse, served by the same
 * static route as the pitch pictures (app/(site)/learn/diagrams/[file]/route.tsx) at /learn/diagrams/<slug>-drill.png. It is
 * the drill page's Open Graph image and an image URL for image search. Plain flex boxes only, like lib/site/pitchImage.tsx
 * (the renderer has no SVG text), drawn from the same data as the inline SVG (lib/site/grid.ts): the area in proportion,
 * zones, cones, goals, players, balls and (Nov 20 2026) the moves as ink arrows.
 */
import {arrowLayer,CARD} from './pitchImage';
// Nov 20 2026: the Library pictures' light palette, as lib/site/pitchImage.tsx (mint field, pitch-green lines, pale gold zones, ink arrows).
const {INK,INK2,WHITE:PAPER,GOLD,LINE,FIELD,TINT,GROUND}=CARD;
export function gridImage({scene:g,title,sub}:{scene:GridScene;title:string;sub:string}){
 const BOX=566,PAD=56,k=Math.min((BOX-2*PAD)/g.w,(BOX-2*PAD)/g.l),W=Math.round(g.w*k),H=Math.round(g.l*k),ox=(BOX-W)/2,oy=(BOX-H)/2,R=20;
 const abs=(left:number,top:number,width:number,height:number,extra:Record<string,string|number>={})=>({position:'absolute' as const,left,top,width,height,display:'flex' as const,...extra});
 const X=(x:number)=>ox+x/100*W,Y=(y:number)=>oy+H-y/100*H;
 const cone=(x:number,y:number,key:string)=><div key={key} style={abs(X(x)-8,Y(y)-8,16,16,{background:GOLD,border:`3px solid ${INK}`,borderRadius:4})}/>;
 return <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',background:GROUND,color:INK,padding:32,fontFamily:'Inter'}}>
  <div style={{position:'relative',display:'flex',width:BOX,height:BOX,background:FIELD,borderRadius:18,flexShrink:0}}>
   {g.zones.map((z,i)=><div key={`z${i}`} style={abs(X(z[0]),Y(z[3]),X(z[2])-X(z[0]),Y(z[1])-Y(z[3]),{background:TINT})}/>)}
   <div style={abs(ox,oy,W,H,{border:`3px dashed ${LINE}`})}/>
   {g.goals.map((o,i)=>{const len=o.size/100*(o.dir==='h'?W:H);return o.dir==='h'?<div key={`o${i}`} style={abs(X(o.x)-len/2,Y(o.y)-6,len,12,{background:PAPER,border:`2px solid ${INK}`,borderRadius:3})}/>
    :<div key={`o${i}`} style={abs(X(o.x)-6,Y(o.y)-len/2,12,len,{background:PAPER,border:`2px solid ${INK}`,borderRadius:3})}/>;})}
   {arrowLayer(BOX,BOX,q=>[X(q[0]),Y(q[1])],g)}
   {[[0,0],[100,0],[0,100],[100,100]].map(([x,y],i)=>cone(x,y,`k${i}`))}
   {g.cones.map(([x,y],i)=>cone(x,y,`c${i}`))}
   {g.dots.map((s,i)=><div key={`s${i}`} style={abs(X(s.x)-R,Y(s.y)-R,2*R,2*R,{alignItems:'center',justifyContent:'center',borderRadius:R,border:`3px solid ${s.opp?PAPER:INK}`,background:s.opp?INK:GOLD,color:s.opp?PAPER:INK,fontSize:s.n.length>1?17:22,fontWeight:700})}>{s.n}</div>)}
   {g.balls.map(([x,y],i)=><div key={`b${i}`} style={abs(X(x)-8,Y(y)-8,16,16,{borderRadius:8,border:`3px solid ${INK}`,background:PAPER})}/>)}
  </div>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',marginLeft:56,flex:1}}>
   <div style={{display:'flex',fontSize:title.length>28?52:title.length>22?56:76,fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.04}}>{title}</div>
   <div style={{display:'flex',fontSize:32,fontWeight:600,letterSpacing:'-0.01em',marginTop:20,color:INK2,lineHeight:1.25}}>{sub}</div>
   <div style={{display:'flex',fontSize:28,fontWeight:600,marginTop:14,lineHeight:1.25,color:INK2}}>{gridSize(g)}</div>
   <div style={{display:'flex',fontSize:26,fontWeight:600,marginTop:40,opacity:.7}}>Futbol Island · futbolisland.app</div>
  </div>
 </div>;
}
/** The element tree for one `<slug>-drill.png` file name, or null (the image route; also rendered by tests/seo-drills-plans.cjs). */
export function drillDiagramFor(file:string){
 const m=/^(.+)-drill\.png$/.exec(file),d=m&&drillBySlug(m[1]);if(!d)return null;
 return gridImage({scene:d.scene,title:d.name,sub:`Soccer drill for ${d.ages.length>1?`${d.ages[0]} to ${d.ages[d.ages.length-1]}`:d.ages[0]}, with a setup diagram`});
}
