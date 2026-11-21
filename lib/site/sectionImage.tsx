import type {ReactElement} from 'react';
import {PITCH,place,type Arrow,type GuideFormat,type Placed} from './pitch';
import {formationBySlug} from './formations';
import {ruleBySlug} from './rules';
import {termBySlug} from './terms';
import {drillBySlug} from './drills';
import {planBySlug} from './plans';
import type {GridScene} from './grid';
import type {Scene} from './scenes';
/**
 * Text-free section pictures (Nov 20 2026, owner: "the visuals need to match more with the title of the section"): the Library's
 * diagram sections and the /games guide cards show a picture of THE SECTION (several rules, several moves, a drill grid, the
 * numbered positions, three shapes, a practice in order, the four field sizes, a coach's lineup sheet) instead of one page's
 * 1200 x 630 share card with its title baked in. Drawn from the same data as the guide diagrams (lib/site/pitch.ts, scenes.ts,
 * grid.ts) and the same palette, as element trees for Next's ImageResponse. They are rendered ONCE into static webp files by
 * scripts/build-section-pictures.cjs (public/learn/sections/), so nothing renders per request. Labels appear only where they are
 * the content (shirt numbers, "4-3-3", "7v7"), in the embedded Inter (lib/site/imageFonts.ts).
 */
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55',BG='#134a3a',SHEET='#fbf7ee';
type Pt=[number,number];
type Geo={w:number;l:number;box?:[number,number];six?:[number,number];circle?:number;spot?:number;goal?:number;arc?:number;buildOut?:number};
type Dot={x:number;y:number;opp?:boolean;n?:string;dim?:boolean};
type Draw={dots?:Dot[];ball?:Pt;lineY?:number;zone?:[number,number,number,number];passes?:readonly Arrow[];runs?:readonly Arrow[];dribbles?:readonly Arrow[];cones?:readonly Pt[];goals?:GridScene['goals'];grid?:boolean;zones?:GridScene['zones']};
type PanelOpt={geo:Geo;win?:[number,number];horiz?:boolean;margin?:number;draw?:Draw;dot?:number;stroke?:number;num?:number};
const GEO=(f:GuideFormat):Geo=>PITCH[f];
const abs=(left:number,top:number,width:number,height:number,extra:Record<string,string|number>={})=>({position:'absolute' as const,left,top,width,height,display:'flex' as const,...extra});
/** The size a panel takes for a given box (the pitch keeps its proportions). */
function fit(o:PanelOpt,bw:number,bh:number){
 const m=o.margin??0,[a,b]=o.win??[0,100],gl=(b-a)/100*o.geo.l,gw=o.geo.w,along=gl+2*m,across=gw+2*m;
 const [W,H]=o.horiz?[along,across]:[across,along],k=Math.min(bw/W,bh/H);
 return {k,w:Math.round(W*k),h:Math.round(H*k)};
}
/** One pitch or practice grid as an absolutely placed SVG panel, centred in the box, plus its HTML labels (shirt numbers). */
function panel(key:string,bx:number,by:number,bw:number,bh:number,o:PanelOpt):ReactElement{
 const {k,w,h}=fit(o,bw,bh),x0=bx+(bw-w)/2,y0=by+(bh-h)/2,m=o.margin??0,g=o.geo,[a,b]=o.win??[0,100],yBot=a/100*g.l,yTop=b/100*g.l;
 const T=(xm:number,ym:number):Pt=>o.horiz?[(ym-yBot+m)*k,(xm+m)*k]:[(xm+m)*k,(yTop-ym+m)*k];
 const P=(x:number,y:number)=>T(x/100*g.w,y/100*g.l);/* scene coordinates: percent of width and of length */
 const sw=o.stroke??Math.max(2,k*.32),dr=o.dot??Math.max(8,k*1.5),lineC='rgba(255,255,255,.72)',out:ReactElement[]=[],nums:ReactElement[]=[];
 const poly=(pts:Pt[],props:Record<string,string|number>,kk:string)=>out.push(<polygon key={kk} points={pts.map(p=>p.join(',')).join(' ')} {...props}/>);
 const rect=(xa:number,ya:number,xb:number,yb:number,props:Record<string,string|number>,kk:string)=>poly([T(xa,ya),T(xb,ya),T(xb,yb),T(xa,yb)],props,kk);
 const pline=(pts:Pt[],props:Record<string,string|number>,kk:string)=>out.push(<polyline key={kk} points={pts.map(p=>p.join(',')).join(' ')} fill="none" {...props}/>);
 const stroke={fill:'none',stroke:lineC,strokeWidth:sw};
 if(!o.draw?.grid){
  rect(0,0,g.w,g.l,stroke,'o');pline([T(0,g.l/2),T(g.w,g.l/2)],stroke,'h');
  if(g.circle){const c=T(g.w/2,g.l/2);out.push(<circle key="c" cx={c[0]} cy={c[1]} r={g.circle*k} {...stroke}/>);}
  for(const end of [0,1]){const Y=(d:number)=>end?g.l-d:d,cx=g.w/2;
   if(g.box)rect(cx-g.box[0]/2,Y(0),cx+g.box[0]/2,Y(g.box[1]),stroke,`b${end}`);
   if(g.six)rect(cx-g.six[0]/2,Y(0),cx+g.six[0]/2,Y(g.six[1]),stroke,`s${end}`);
   if(g.goal)rect(cx-g.goal/2,Y(0),cx+g.goal/2,Y(-1.6),{fill:PAPER},`g${end}`);
   if(g.spot){const s=T(cx,Y(g.spot));out.push(<circle key={`p${end}`} cx={s[0]} cy={s[1]} r={sw*1.3} fill={lineC}/>);}
   if(g.box&&g.spot&&g.circle){const r=g.circle,dy=g.box[1]-g.spot;if(r>dy){const t=Math.acos(dy/r),pts:Pt[]=[];
    for(let i=0;i<=18;i++){const ang=-t+2*t*i/18;pts.push(T(cx+r*Math.sin(ang),Y(g.spot+r*Math.cos(ang))));}pline(pts,stroke,`d${end}`);}}
   if(g.buildOut)pline([T(0,Y(g.buildOut)),T(g.w,Y(g.buildOut))],{...stroke,strokeDasharray:`${sw*3} ${sw*2.5}`},`u${end}`);
  }
 }else{
  const d=o.draw;for(const [i,z] of (d.zones??[]).entries()){const [p,q]=[P(z[0],z[1]),P(z[2],z[3])];out.push(<rect key={`z${i}`} x={Math.min(p[0],q[0])} y={Math.min(p[1],q[1])} width={Math.abs(q[0]-p[0])} height={Math.abs(q[1]-p[1])} fill={GOLD} fillOpacity={.3}/>);}
  rect(0,0,g.w,g.l,{...stroke,strokeDasharray:`${sw*3} ${sw*2.5}`},'o');
 }
 const d=o.draw??{};
 if(d.zone&&!d.grid){const [p,q]=[P(d.zone[0],d.zone[1]),P(d.zone[2],d.zone[3])];out.push(<rect key="zone" x={Math.min(p[0],q[0])} y={Math.min(p[1],q[1])} width={Math.abs(q[0]-p[0])} height={Math.abs(q[1]-p[1])} fill={GOLD} fillOpacity={.3}/>);}
 if(d.lineY!==undefined)pline([P(0,d.lineY),P(100,d.lineY)],{stroke:GOLD,strokeWidth:sw*1.6,strokeDasharray:`${sw*4} ${sw*2.6}`},'line');
 for(const [i,go] of (d.goals??[]).entries()){const len=go.size/2,c=go.dir==='h'?[P(go.x-len,go.y),P(go.x+len,go.y)]:[P(go.x,go.y-len*g.w/g.l),P(go.x,go.y+len*g.w/g.l)];
  out.push(<line key={`go${i}`} x1={c[0][0]} y1={c[0][1]} x2={c[1][0]} y2={c[1][1]} stroke={PAPER} strokeWidth={sw*3.2} strokeLinecap="round"/>);}
 const arrow=(a:Arrow,kind:'pass'|'run'|'dribble',kk:string)=>{
  const [x1,y1]=P(...a.from),[x2,y2]=P(...a.to),L=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/L,uy=(y2-y1)/L,hs=sw*4.2,ex=x2-ux*hs*.9,ey=y2-uy*hs*.9;
  const col=PAPER,wdt=kind==='pass'?sw*1.7:sw*1.4;
  if(kind==='dribble'){const pts:Pt[]=[],n=Math.max(6,Math.round(L/(sw*7)));for(let i=0;i<=n;i++){const t=i/n,amp=i===0||i===n?0:sw*1.8*Math.sin(t*n*Math.PI);pts.push([x1+(ex-x1)*t-uy*amp,y1+(ey-y1)*t+ux*amp]);}
   pline(pts,{stroke:col,strokeWidth:wdt,strokeLinejoin:'round'},kk);}
  else out.push(<line key={kk} x1={x1} y1={y1} x2={ex} y2={ey} stroke={col} strokeWidth={wdt} strokeLinecap="round" strokeDasharray={kind==='run'?`${sw*2.6} ${sw*2.2}`:undefined}/>);
  poly([[x2,y2],[x2-ux*hs-uy*hs*.62,y2-uy*hs+ux*hs*.62],[x2-ux*hs+uy*hs*.62,y2-uy*hs-ux*hs*.62]],{fill:col},`${kk}h`);
 };
 (d.runs??[]).forEach((a,i)=>arrow(a,'run',`r${i}`));(d.passes??[]).forEach((a,i)=>arrow(a,'pass',`a${i}`));(d.dribbles??[]).forEach((a,i)=>arrow(a,'dribble',`w${i}`));
 for(const [i,c] of (d.cones??[]).entries()){const [cx,cy]=P(...c),s=dr*.62;poly([[cx,cy-s],[cx+s*.95,cy+s*.7],[cx-s*.95,cy+s*.7]],{fill:GOLD,stroke:INK,strokeWidth:sw*.8,strokeLinejoin:'round'},`k${i}`);}
 for(const [i,s] of (d.dots??[]).entries()){const [cx,cy]=P(s.x,s.y);
  out.push(<circle key={`s${i}`} cx={cx} cy={cy} r={dr} fill={s.opp?INK:GOLD} stroke={s.opp?PAPER:INK} strokeWidth={Math.max(2,dr*.17)} opacity={s.dim?.45:1}/>);
  if(s.n&&o.num)nums.push(<div key={`n${i}`} style={abs(x0+cx-dr,y0+cy-dr,2*dr,2*dr,{alignItems:'center',justifyContent:'center',fontSize:o.num*(s.n.length>1?.84:1),fontWeight:800,letterSpacing:-1,color:s.opp?PAPER:INK})}>{s.n}</div>);}
 if(d.ball){const [cx,cy]=P(...d.ball);out.push(<circle key="ball" cx={cx} cy={cy} r={dr*.46} fill={PAPER} stroke={INK} strokeWidth={Math.max(2,dr*.15)}/>);}
 return <div key={key} style={abs(0,0,0,0,{overflow:'visible'})}>
  <div style={abs(x0,y0,w,h,{background:GRASS,borderRadius:Math.max(10,Math.min(w,h)*.04),overflow:'hidden'})}>
   <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">{out}</svg></div>
  {nums}
 </div>;
}
const fromScene=(s:Scene):Draw=>({dots:s.spots.map(p=>({x:p.x,y:p.y,opp:p.team==='opp'})),ball:s.ball,lineY:s.lineY,zone:s.zone,passes:s.passes,runs:s.runs});
const fromGrid=(g:GridScene):Draw=>({grid:true,dots:g.dots.map(p=>({x:p.x,y:p.y,opp:p.opp})),balls:undefined,cones:g.cones,goals:g.goals,zones:g.zones,passes:g.passes,runs:g.runs,dribbles:g.dribbles,ball:g.balls[0]} as Draw);
const gridGeo=(g:GridScene):Geo=>({w:g.w,l:g.l});
/** A scene's crop on the pitch: the stretch of the length (percent, from the gold team's goal line) that holds all of it. */
function windowFor(s:Scene,span:number):[number,number]{
 const ys=[...s.spots.map(p=>p.y),...(s.ball?[s.ball[1]]:[]),...s.passes.flatMap(a=>[a.from[1],a.to[1]]),...s.runs.flatMap(a=>[a.from[1],a.to[1]]),...(s.lineY!==undefined?[s.lineY]:[])];
 const mid=(Math.min(...ys)+Math.max(...ys))/2;let a=mid-span/2,b=mid+span/2;if(b>100){a-=b-100;b=100;}if(a<0){b-=a;a=0;}return [a,b];
}
const label=(text:string,x:number,y:number,w:number,size:number,color=PAPER)=><div key={`l${text}${x}`} style={abs(x,y,w,size*1.2,{justifyContent:'center',alignItems:'center',fontSize:size,fontWeight:800,letterSpacing:-size*.03,color,fontFamily:'Inter'})}>{text}</div>;
const frame=(W:number,H:number,kids:ReactElement[],bg=BG)=><div style={{width:W,height:H,display:'flex',position:'relative',background:bg,fontFamily:'Inter'}}>{kids}</div>;
/** A grid of scene panels (rules, terms), each cropped to the stretch of pitch its scene uses. */
function sceneGrid(W:number,H:number,scenes:Scene[],cols:number,span:number){
 const rows=Math.ceil(scenes.length/cols),pad=Math.round(Math.min(W,H)*.045),gap=Math.round(Math.min(W,H)*.035),cw=(W-2*pad-(cols-1)*gap)/cols,ch=(H-2*pad-(rows-1)*gap)/rows;
 return frame(W,H,scenes.map((s,i)=>{const c=i%cols,r=Math.floor(i/cols),geo=GEO(s.format);
  return panel(`p${i}`,pad+c*(cw+gap),pad+r*(ch+gap),cw,ch,{geo,win:windowFor(s,span),margin:2,draw:fromScene(s),dot:Math.min(cw,ch)*.052,stroke:Math.min(cw,ch)*.0095});}));
}
const lastScene=(slug:string)=>{const r=ruleBySlug(slug);if(!r)throw new Error(`section picture: rule ${slug}`);return r.scenes[r.scenes.length-1];};
const termScene=(slug:string)=>{const t=termBySlug(slug);if(!t)throw new Error(`section picture: term ${slug}`);return t.scene;};
const grid=(slug:string)=>{const d=drillBySlug(slug);if(!d)throw new Error(`section picture: drill ${slug}`);return d.scene;};
const shape=(slug:string)=>{const f=formationBySlug(slug);if(!f)throw new Error(`section picture: formation ${slug}`);return f;};
const formationDots=(spots:readonly Placed[]):Dot[]=>spots.map(p=>({x:p.x,y:p.y,n:p.n}));

export const SECTION_SIZE={width:1440,height:900},GUIDE_SIZE={width:480,height:360};
type Size={width:number;height:number};
/** Every section picture by name: name -> element tree for a size. */
export const SECTION_PICTURES:Record<string,(s:Size)=>ReactElement>={
 /* Rules: four restarts and calls on their own stretch of pitch: offside (the gold line), a throw-in, a penalty, a free-kick wall */
 rules:({width:W,height:H})=>sceneGrid(W,H,[lastScene('offside'),lastScene('throw-in'),lastScene('penalty-kick'),lastScene('fouls-and-free-kicks')],2,40),
 /* Soccer terms: four moves with their passes and runs */
 terms:({width:W,height:H})=>sceneGrid(W,H,[termScene('give-and-go'),termScene('overlap'),termScene('through-ball'),termScene('switching-play')],2,40),
 /* Drills: two practice grids with cones, gates and movement arrows */
 drills:({width:W,height:H})=>{const a=grid('cone-weave-dribbling'),b=grid('partner-passing-through-gates'),pad=Math.round(H*.06),gap=Math.round(W*.035),bw=(W-2*pad-gap)/2;
  return frame(W,H,[panel('a',pad,pad,bw*.82,H-2*pad,{geo:gridGeo(a),margin:2.8,draw:fromGrid(a),dot:H*.03,stroke:H*.0055}),
   panel('b',pad+bw*.82+gap,pad,W-2*pad-gap-bw*.82,H-2*pad,{geo:gridGeo(b),margin:2.4,draw:fromGrid(b),dot:H*.03,stroke:H*.0055})]);},
 /* Positions: one 11v11 pitch on its side, the eleven numbered positions of a 4-3-3 */
 positions:({width:W,height:H})=>{const f=shape('11v11-4-3-3'),pad=Math.round(H*.05);
  return frame(W,H,[panel('p',pad,pad,W-2*pad,H-2*pad,{geo:GEO('11v11'),horiz:true,margin:2.2,draw:{dots:formationDots(place(f.lines))},dot:H*.042,stroke:H*.0045,num:H*.04})]);},
 /* Formations: three 11v11 shapes side by side, each with its shape under it */
 formations:({width:W,height:H})=>{const list=['11v11-4-3-3','11v11-4-4-2','11v11-3-5-2'].map(shape),pad=Math.round(H*.05),lab=H*.075,gap=W*.03,bw=(W-2*pad-2*gap)/3,bh=H-2*pad-lab*1.5;
  return frame(W,H,list.flatMap((f,i)=>{const x=pad+i*(bw+gap),{w}=fit({geo:GEO('11v11'),margin:1.5},bw,bh);
   return [panel(`f${i}`,x,pad,bw,bh,{geo:GEO('11v11'),margin:1.5,draw:{dots:place(f.lines).map(p=>({x:p.x,y:p.y}))},dot:H*.02,stroke:H*.0035}),label(f.shape,x+(bw-w)/2,pad+bh+lab*.3,w,lab)];}));},
 /* Practice plans: a practice in order, its four activities as small grids left to right, each with a bar as long as its minutes */
 plans:({width:W,height:H})=>{const p=planBySlug('u8-passing-practice-plan');if(!p)throw new Error('section picture: plan');
  const rows=p.rows.filter(r=>r.drill).slice(0,4),pad=Math.round(W*.04),gap=W*.035,bw=(W-2*pad-3*gap)/4,bar=H*.045,most=Math.max(...rows.map(r=>r.minutes));
  const geo=(g:GridScene):Geo=>g.w>g.l?{w:g.l,l:g.w}:gridGeo(g),turn=(g:GridScene):GridScene=>g.w>g.l?{...g,w:g.l,l:g.w,dots:g.dots.map(d=>({...d,x:d.y,y:d.x})),cones:g.cones.map(([x,y])=>[y,x]),balls:g.balls.map(([x,y])=>[y,x]),
   zones:g.zones.map(([a,b,c,d])=>[b,a,d,c]),goals:g.goals.map(o=>({...o,x:o.y,y:o.x,dir:o.dir==='h'?'v':'h'})),passes:g.passes.map(t),runs:g.runs.map(t),dribbles:g.dribbles.map(t)}:g,t=(a:Arrow):Arrow=>({from:[a.from[1],a.from[0]],to:[a.to[1],a.to[0]]});
  const sizes=rows.map(r=>fit({geo:geo(r.drill!.scene),margin:1.6},bw,H*.62)),ph=Math.max(...sizes.map(s=>s.h)),top=(H-ph-bar*2.2)/2;
  return frame(W,H,rows.flatMap((r,i)=>{const g=turn(r.drill!.scene),x=pad+i*(bw+gap),kids=[panel(`d${i}`,x,top,bw,ph,{geo:geo(r.drill!.scene),margin:1.6,draw:fromGrid(g),dot:H*.024,stroke:H*.0042}),
   <div key={`t${i}`} style={abs(x,top+ph+bar*1.2,bw*r.minutes/most,bar,{background:i===rows.length-1?PAPER:GOLD,borderRadius:bar/2})}/>];
   if(i<rows.length-1)kids.push(<svg key={`c${i}`} style={abs(x+bw+gap*.2,top+ph/2-gap*.3,gap*.6,gap*.6)} width={gap*.6} height={gap*.6} viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9" fill={PAPER} fillOpacity={.8}/></svg>);
   return kids;}));},
 /* Age groups: the four game sizes kids grow through, drawn to the same scale and standing on one line */
 ages:({width:W,height:H})=>{const sizes:{name:string;geo:Geo}[]=[{name:'4v4',geo:{w:20,l:30,goal:3.5}},{name:'7v7',geo:GEO('7v7')},{name:'9v9',geo:GEO('9v9')},{name:'11v11',geo:GEO('11v11')}];
  const pad=Math.round(H*.06),lab=H*.075,gap=W*.03,avail=W-2*pad-3*gap,tot=sizes.reduce((s,x)=>s+x.geo.w+3,0),k=Math.min(avail/tot,(H-2*pad-lab*1.6)/(105+3));
  let x=pad+(avail-tot*k)/2;const base=pad+(108)*k;
  return frame(W,H,sizes.flatMap(({name,geo},i)=>{const w=(geo.w+3)*k,h=(geo.l+3)*k,kids=[panel(`a${i}`,x,base-h,w,h,{geo,margin:1.5,stroke:Math.max(2.4,k*.45)}),label(name,x-gap/2,base+lab*.35,w+gap,lab)];x+=w+gap;return kids;}));},
 /* Coach tools: a printable lineup sheet: a 9v9 lineup on the pitch and a playing-time grid, one row per player */
 tools:({width:W,height:H})=>{const f=shape('9v9-3-2-3'),pad=Math.round(H*.07),sx=pad*1.6,sy=pad,sw=W-2*sx,sh=H-pad*1.4,inner=Math.round(H*.05);
  const pw=sw*.5,players=place(f.lines),rowsN=12,gx=sx+inner+pw+inner*1.4,gw=sx+sw-inner-gx,rh=(sh-2*inner)/rowsN,cell=Math.min(rh*.74,gw/6.2);
  const quarters=[[1,1,0,1],[1,0,1,1],[0,1,1,1],[1,1,1,0],[1,1,0,1],[1,0,1,1],[0,1,1,1],[1,1,1,0],[1,1,1,1],[0,1,0,1],[1,0,1,0],[0,0,1,1]];
  const kids:ReactElement[]=[<div key="sheet" style={abs(sx,sy,sw,sh,{background:SHEET,borderRadius:H*.02})}/>,
   <div key="clip" style={abs(sx+sw/2-W*.06,sy-H*.03,W*.12,H*.06,{background:INK,borderRadius:H*.015})}/>,
   panel('pitch',sx+inner,sy+inner,pw,sh-2*inner,{geo:GEO('9v9'),margin:1.6,draw:{dots:formationDots(players)},dot:H*.03,stroke:H*.0035,num:H*.03})];
  for(let r=0;r<rowsN;r++){const y=sy+inner+r*rh+(rh-cell)/2,bench=r>=9;
   kids.push(<div key={`d${r}`} style={abs(gx,y,cell,cell,{borderRadius:cell/2,background:bench?'#c9d3c6':GOLD,border:`${Math.max(2,cell*.12)}px solid ${INK}`})}/>);
   quarters[r].forEach((q,c)=>kids.push(<div key={`q${r}${c}`} style={abs(gx+cell*1.5+c*(gw-cell*1.5)/4,y,(gw-cell*1.5)/4-cell*.25,cell,{borderRadius:cell*.2,background:q?GRASS:'#e4e0d2'})}/>));}
  return frame(W,H,kids);},
};
/** A page's own diagram without its title block (a /games guide card shows "The offside rule for kids" this way). */
export const PAGE_PICTURES:Record<string,(s:Size)=>ReactElement>={
 offside:({width:W,height:H})=>{const s=lastScene('offside'),pad=Math.round(H*.06);return frame(W,H,[panel('o',pad,pad,W-2*pad,H-2*pad,{geo:GEO(s.format),win:windowFor(s,46),draw:fromScene(s),dot:H*.04,stroke:H*.008})]);},
};
/** The files scripts/build-section-pictures.cjs writes: file name (in public/learn/sections/) -> [picture, size]. */
export const SECTION_FILES:readonly [string,(s:Size)=>ReactElement,Size][]=[
 ...Object.entries(SECTION_PICTURES).map(([n,f])=>[`${n}.webp`,f,SECTION_SIZE] as [string,(s:Size)=>ReactElement,Size]),
 ...(['formations','positions','drills','terms'] as const).map(n=>[`${n}-card.webp`,SECTION_PICTURES[n],GUIDE_SIZE] as [string,(s:Size)=>ReactElement,Size]),
 ['offside-card.webp',PAGE_PICTURES.offside,GUIDE_SIZE],
];
