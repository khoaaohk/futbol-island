import {SHAPES_8V8} from './tools/shapes8';
import {PITCH,place,type Arrow,type GuideFormat,type Placed} from './pitch';
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
// Nov 20 2026 (owner: "go with your recommendations" on giving the share cards the light look): the Library pictures' light
// palette (lib/site/sectionImage.tsx COL): a pale mint field with pitch-green lines on the home paper, gold players with an ink
// outline, ink opponents with a white outline, a white ball, ink arrows (runs dashed), the offside line dashed in dark gold, a
// pale gold zone; title in ink, subtitle in the soft ink (--ink2). Contrast on the mint: lines 4.7:1, the offside line 4.1:1.
export const CARD={INK:'#14221d',INK2:'#5b675f',WHITE:'#ffffff',GOLD:'#e9c16b',GOLD_INK:'#85621f',LINE:'#1d6b55',FIELD:'#c9e4d4',TINT:'#f4d58a',GROUND:'#fbf7ee'};
const {INK,INK2,WHITE:PAPER,GOLD,GOLD_INK,LINE,FIELD,TINT,GROUND}=CARD;
export const IMAGE_SIZE={width:1200,height:630};
type XY=readonly [number,number];
/** The moves as one SVG overlay (ink, as the Library pictures): passes solid, runs dashed, dribbles a zig-zag, each with a head.
 *  `at` maps scene coordinates (percent of width, of length) to pixels in the box of size w x h. */
export function arrowLayer(w:number,h:number,at:(p:XY)=>[number,number],{passes=[],runs=[],dribbles=[]}:{passes?:readonly Arrow[];runs?:readonly Arrow[];dribbles?:readonly Arrow[]},sw=4){
 if(!passes.length&&!runs.length&&!dribbles.length)return null;
 const r1=(n:number)=>Math.round(n*10)/10,out:JSX.Element[]=[];
 const one=(ar:Arrow,kind:'pass'|'run'|'dribble',key:string)=>{
  const [x1,y1]=at(ar.from),[x2,y2]=at(ar.to),L=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/L,uy=(y2-y1)/L,hs=sw*4,ex=x2-ux*hs*.9,ey=y2-uy*hs*.9;
  if(kind==='dribble'){const n=Math.max(6,Math.round(L/(sw*7))),p:string[]=[];for(let i=0;i<=n;i++){const t=i/n,amp=i===0||i===n?0:sw*1.8*Math.sin(t*n*Math.PI);p.push(`${r1(x1+(ex-x1)*t-uy*amp)},${r1(y1+(ey-y1)*t+ux*amp)}`);}
   out.push(<polyline key={key} points={p.join(' ')} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"/>);}
  else out.push(<line key={key} x1={r1(x1)} y1={r1(y1)} x2={r1(ex)} y2={r1(ey)} stroke={INK} strokeWidth={kind==='pass'?sw*1.2:sw} strokeLinecap="round" strokeDasharray={kind==='run'?`${r1(sw*2.6)} ${r1(sw*2.2)}`:undefined}/>);
  out.push(<polygon key={`${key}h`} fill={INK} points={[[x2,y2],[x2-ux*hs-uy*hs*.62,y2-uy*hs+ux*hs*.62],[x2-ux*hs+uy*hs*.62,y2-uy*hs-ux*hs*.62]].map(q=>`${r1(q[0])},${r1(q[1])}`).join(' ')}/>);
 };
 runs.forEach((a,i)=>one(a,'run',`r${i}`));dribbles.forEach((a,i)=>one(a,'dribble',`d${i}`));passes.forEach((a,i)=>one(a,'pass',`p${i}`));
 return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:'absolute',left:0,top:0}}>{out}</svg>;
}
export function pitchImage({format,spots,title,sub,mark,scene}:{format:GuideFormat;spots:readonly Placed[];title:string;sub:string;mark?:string;scene?:Scene}){
 const p=PITCH[format],H=566,k=H/p.l,W=Math.round(p.w*k),M=12,R=22;
 const abs=(left:number,top:number,width:number,height:number,extra:Record<string,string|number>={})=>({position:'absolute' as const,left,top,width,height,display:'flex' as const,...extra});
 const line=`3px solid ${LINE}`;
 const end=(top:boolean)=>{const out=[];
  if(p.box)out.push(<div key="b" style={abs(M+(W-p.box[0]*k)/2,top?M:M+H-p.box[1]*k,p.box[0]*k,p.box[1]*k,{border:line})}/>);
  if(p.six)out.push(<div key="s" style={abs(M+(W-p.six[0]*k)/2,top?M:M+H-p.six[1]*k,p.six[0]*k,p.six[1]*k,{border:line})}/>);
  if(p.arc){const w=(p.goal+2*p.arc)*k,h=p.arc*k;out.push(<div key="a" style={abs(M+(W-w)/2,top?M:M+H-h,w,h,{border:line,borderRadius:top?`0 0 ${h}px ${h}px`:`${h}px ${h}px 0 0`})}/>);}
  if(p.buildOut)out.push(<div key="o" style={abs(M,top?M+p.buildOut*k:M+H-p.buildOut*k,W,0,{borderTop:`3px dashed ${LINE}`})}/>);
  out.push(<div key="g" style={abs(M+(W-p.goal*k)/2,top?M-8:M+H,p.goal*k,8,{background:INK,borderRadius:3})}/>);
  return out;};
 return <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',background:GROUND,color:INK,padding:20,fontFamily:'Inter'}}>
  <div style={{position:'relative',display:'flex',width:W+2*M,height:H+2*M,background:FIELD,borderRadius:18,flexShrink:0}}>
   {scene?.zone&&<div style={abs(M+scene.zone[0]/100*W,M+H-scene.zone[3]/100*H,(scene.zone[2]-scene.zone[0])/100*W,(scene.zone[3]-scene.zone[1])/100*H,{background:TINT})}/>}
   <div style={abs(M,M,W,H,{border:line})}/>
   <div style={abs(M,M+H/2-1,W,0,{borderTop:line})}/>
   <div style={abs(M+W/2-p.circle*k,M+H/2-p.circle*k,2*p.circle*k,2*p.circle*k,{border:line,borderRadius:p.circle*k})}/>
   {end(true)}{end(false)}
   {scene?.lineY!==undefined&&<div style={abs(M,M+H-scene.lineY/100*H-2,W,0,{borderTop:`4px dashed ${GOLD_INK}`})}/>}
   {scene&&arrowLayer(W+2*M,H+2*M,q=>[M+q[0]/100*W,M+H-q[1]/100*H],scene)}
   {spots.map((s,i)=>{const on=!mark||s.pos===mark,x=M+s.x/100*W,y=M+H-s.y/100*H;
    return <div key={i} style={abs(x-R,y-R,2*R,2*R,{alignItems:'center',justifyContent:'center',borderRadius:R,border:`3px solid ${scene&&s.team==='opp'?PAPER:INK}`,background:scene?(s.team==='opp'?INK:GOLD):mark?(on?GOLD:PAPER):i===0?PAPER:GOLD,color:scene&&s.team==='opp'?PAPER:INK,opacity:on?1:.5,fontSize:s.n.length>1?20:24,fontWeight:700})}>{s.n}</div>;})}
   {scene?.ball&&<div style={abs(M+scene.ball[0]/100*W-9,M+H-scene.ball[1]/100*H-9,18,18,{borderRadius:9,border:`3px solid ${INK}`,background:PAPER})}/>}
  </div>
  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',marginLeft:56,flex:1}}>
   <div style={{display:'flex',fontSize:title.length>28?58:title.length>22?64:84,fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.04}}>{title}</div>
   <div style={{display:'flex',fontSize:34,fontWeight:600,letterSpacing:'-0.01em',marginTop:22,color:INK2,lineHeight:1.25}}>{sub}</div>
   <div style={{display:'flex',fontSize:26,fontWeight:600,marginTop:48,opacity:.7}}>Futbol Island · futbolisland.app</div>
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
 if(m[2]==='formation'){const f=formationBySlug(m[1]);
  /* round 4D: the fútbol 8 shapes (no lesson pages yet) have a picture for the 8v8 lineup builder */
  const e=f?null:SHAPES_8V8.find(x=>x.slug===m[1]);if(e)return pitchImage({format:'8v8',spots:place(e.lines),title:e.shape,sub:'Fútbol 8 (8v8) formation for kids'});
  if(!f)return null;
  return pitchImage({format:f.format,spots:place(f.lines),title:f.format==='futsal'?f.name.replace(' (futsal)',''):f.shape,sub:f.format==='futsal'?'Futsal formation for kids':`${f.format} soccer formation for kids`});}
 const p=positionBySlug(m[1]),f=p&&formationBySlug(p.diagram);if(!p||!f)return null;
 return pitchImage({format:f.format,spots:place(f.lines),mark:p.slug,title:p.name,sub:`Soccer position for kids, shown in a ${f.shape}`});
}
