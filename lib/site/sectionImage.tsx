import type {CSSProperties,ReactElement} from 'react';
import {PITCH,place,type Arrow,type GuideFormat,type Placed} from './pitch';
import {formationBySlug} from './formations';
import {ruleBySlug} from './rules';
import {termBySlug} from './terms';
import {drillBySlug} from './drills';
import {planBySlug} from './plans';
import type {GridScene} from './grid';
import type {Scene} from './scenes';
import a from '@/components/site/sectionPic.module.css';
/**
 * Text-free section pictures (Nov 20 2026, owner: "the visuals need to match more with the title of the section"): the Library's
 * diagram sections and the /games guide cards show a picture of THE SECTION (several rules, several moves, a drill grid, the
 * numbered positions, three shapes, a practice in order, the four field sizes, a coach's lineup sheet), drawn from the same data
 * as the guide diagrams (lib/site/pitch.ts, scenes.ts, grid.ts). Labels appear only where they are the content (shirt numbers,
 * "4-3-3", "7v7").
 *
 * Nov 20 2026 night (owner: "change these to light colors to match with the marketing side. also if these could animate that would
 * be nice"): ONE implementation, plain SVG. The Library renders it inline (<SectionSvg>, server HTML already in the final state) and
 * components/site/SectionPicPlayer.tsx plays it once as it enters view; scripts/build-section-pictures.cjs screenshots the same SVG
 * into the static webp files in public/learn/sections/ (the /games guide cards and any fallback). Light palette from the home page
 * (components/learn/learn.module.css): the frame takes the band's opposite tone (var(--card): paper on sage bands, sage on paper
 * bands), the field is pale mint with pitch-green lines, gold and ink players, a white ball, ink arrows.
 * Motion (components/site/sectionPic.module.css): every moving part carries a class and its start time (--t, seconds); the
 * animations exist only while the svg has [data-play], so without the script nothing moves and nothing is hidden.
 */
export const COL={INK:'#14221d',PAPER:'#fbf7ee',WHITE:'#ffffff',GOLD:'#e9c16b',GOLD_INK:'#85621f',LINE:'#1d6b55',FIELD:'#c9e4d4',TINT:'#f4d58a',SAGE:'#ecefdf',OFF:'#e4e0d2',BENCH:'#c9d3c6'};
const {INK,WHITE,GOLD,GOLD_INK,LINE,FIELD,TINT,OFF,BENCH}=COL;
type Pt=[number,number];
type Geo={w:number;l:number;box?:[number,number];six?:[number,number];circle?:number;spot?:number;goal?:number;arc?:number;buildOut?:number};
type Dot={x:number;y:number;opp?:boolean;n?:string;dim?:boolean};
type Draw={dots?:Dot[];ball?:Pt;lineY?:number;zone?:[number,number,number,number];passes?:readonly Arrow[];runs?:readonly Arrow[];dribbles?:readonly Arrow[];cones?:readonly Pt[];goals?:GridScene['goals'];grid?:boolean;zones?:GridScene['zones']};
/** pop: the players pop in one by one (shapes, positions, lineups) instead of the passes playing out */
type PanelOpt={geo:Geo;win?:[number,number];horiz?:boolean;margin?:number;draw?:Draw;dot?:number;stroke?:number;num?:number;pop?:number};
const GEO=(f:GuideFormat):Geo=>PITCH[f];
const r1=(n:number)=>Math.round(n*10)/10;
const pts=(p:Pt[])=>p.map(q=>`${r1(q[0])},${r1(q[1])}`).join(' ');
/** the start time of an animated part (seconds), plus any other custom properties */
const T=(t:number,extra:Record<string,string>={})=>({'--t':`${r1(t*100)/100}s`,...extra}) as CSSProperties;
/** One picture: its elements and when its last move ends (seconds). */
type Built={kids:ReactElement[];end:number};
/** The size a panel takes for a given box (the pitch keeps its proportions). */
function fit(o:PanelOpt,bw:number,bh:number){
 const m=o.margin??0,[a0,b0]=o.win??[0,100],gl=(b0-a0)/100*o.geo.l,gw=o.geo.w,along=gl+2*m,across=gw+2*m;
 const [W,H]=o.horiz?[along,across]:[across,along],k=Math.min(bw/W,bh/H);
 return {k,w:Math.round(W*k),h:Math.round(H*k)};
}
const PASS=.5,STEP=.45;
/** the id prefix of the panels' clip paths, unique per picture on a page (set by SectionSvg just before it draws) */
let PFX='sp';
/** One pitch or practice grid, centred in the box. t0: when its moves start. */
function panel(key:string,bx:number,by:number,bw:number,bh:number,o:PanelOpt,t0=0):Built{
 const {k,w,h}=fit(o,bw,bh),x0=bx+(bw-w)/2,y0=by+(bh-h)/2,m=o.margin??0,g=o.geo,[wa,wb]=o.win??[0,100],yBot=wa/100*g.l,yTop=wb/100*g.l;
 const TR=(xm:number,ym:number):Pt=>o.horiz?[(ym-yBot+m)*k,(xm+m)*k]:[(xm+m)*k,(yTop-ym+m)*k];
 const P=(x:number,y:number)=>TR(x/100*g.w,y/100*g.l);/* scene coordinates: percent of width and of length */
 const sw=r1(o.stroke??Math.max(2,k*.32)),dr=r1(o.dot??Math.max(8,k*1.5)),out:ReactElement[]=[];let end=t0;
 const poly=(p:Pt[],props:Record<string,unknown>,kk:string)=>out.push(<polygon key={kk} points={pts(p)} {...props}/>);
 const rect=(xa:number,ya:number,xb:number,yb:number,props:Record<string,unknown>,kk:string)=>poly([TR(xa,ya),TR(xb,ya),TR(xb,yb),TR(xa,yb)],props,kk);
 const pline=(p:Pt[],props:Record<string,unknown>,kk:string)=>out.push(<polyline key={kk} points={pts(p)} fill="none" {...props}/>);
 const box=(p:Pt,q:Pt,props:Record<string,unknown>,kk:string)=>out.push(<rect key={kk} x={r1(Math.min(p[0],q[0]))} y={r1(Math.min(p[1],q[1]))} width={r1(Math.abs(q[0]-p[0]))} height={r1(Math.abs(q[1]-p[1]))} {...props}/>);
 const rx=r1(Math.max(10,Math.min(w,h)*.04)),clip=`${PFX}-${key}`;
 const d=o.draw??{},fade={className:a.fade,style:T(t0)};
 if(!d.grid){
  const lines:ReactElement[]=[],lp=(p:Pt[],kk:string,extra:Record<string,unknown>={})=>lines.push(<polyline key={kk} points={pts(p)} {...extra}/>);
  const lr=(xa:number,ya:number,xb:number,yb:number,kk:string)=>lp([TR(xa,ya),TR(xb,ya),TR(xb,yb),TR(xa,yb),TR(xa,ya)],kk);
  lr(0,0,g.w,g.l,'o');lp([TR(0,g.l/2),TR(g.w,g.l/2)],'h');
  if(g.circle){const c=TR(g.w/2,g.l/2);lines.push(<circle key="c" cx={r1(c[0])} cy={r1(c[1])} r={r1(g.circle*k)}/>);}
  for(const e of [0,1]){const Y=(v:number)=>e?g.l-v:v,cx=g.w/2;
   if(g.box)lr(cx-g.box[0]/2,Y(0),cx+g.box[0]/2,Y(g.box[1]),`b${e}`);
   if(g.six)lr(cx-g.six[0]/2,Y(0),cx+g.six[0]/2,Y(g.six[1]),`s${e}`);
   if(g.goal)rect(cx-g.goal/2,Y(0),cx+g.goal/2,Y(-1.6),{fill:WHITE,stroke:LINE,strokeWidth:r1(sw*.6)},`g${e}`);
   if(g.spot){const s=TR(cx,Y(g.spot));out.push(<circle key={`p${e}`} cx={r1(s[0])} cy={r1(s[1])} r={r1(sw*1.3)} fill={LINE}/>);}
   if(g.box&&g.spot&&g.circle){const r=g.circle,dy=g.box[1]-g.spot;if(r>dy){const t=Math.acos(dy/r),arc:Pt[]=[];
    for(let i=0;i<=18;i++){const ang=-t+2*t*i/18;arc.push(TR(cx+r*Math.sin(ang),Y(g.spot+r*Math.cos(ang))));}lp(arc,`d${e}`);}}
   if(g.buildOut)lp([TR(0,Y(g.buildOut)),TR(g.w,Y(g.buildOut))],`u${e}`,{strokeDasharray:`${r1(sw*3)} ${r1(sw*2.5)}`});
  }
  out.push(<g key="lines" fill="none" stroke={LINE} strokeWidth={sw}>{lines}</g>);
 }else{
  for(const [i,z] of (d.zones??[]).entries())box(P(z[0],z[1]),P(z[2],z[3]),{fill:TINT,fillOpacity:.75,...fade},`z${i}`);
  rect(0,0,g.w,g.l,{fill:'none',stroke:LINE,strokeWidth:sw,strokeDasharray:`${r1(sw*3)} ${r1(sw*2.5)}`},'o');
 }
 if(d.zone&&!d.grid)box(P(d.zone[0],d.zone[1]),P(d.zone[2],d.zone[3]),{fill:TINT,fillOpacity:.75,...fade},'zone');
 if(d.lineY!==undefined)pline([P(0,d.lineY),P(100,d.lineY)],{stroke:GOLD_INK,strokeWidth:r1(sw*1.5),strokeDasharray:`${r1(sw*4)} ${r1(sw*2.6)}`,...fade},'line');
 for(const [i,go] of (d.goals??[]).entries()){const len=go.size/2,c=go.dir==='h'?[P(go.x-len,go.y),P(go.x+len,go.y)]:[P(go.x,go.y-len*g.w/g.l),P(go.x,go.y+len*g.w/g.l)];
  out.push(<line key={`go${i}`} x1={r1(c[0][0])} y1={r1(c[0][1])} x2={r1(c[1][0])} y2={r1(c[1][1])} stroke={INK} strokeWidth={r1(sw*2.6)} strokeLinecap="round"/>);}
 const ballR=r1(dr*.46),ballW=r1(Math.max(2,dr*.15));
 /** a copy that travels from one point to another and then fades (the ball along a pass, a runner along a run); hidden at rest */
 const traveller=(from:Pt,to:Pt,t:number,dur:number,kk:string,ball:boolean,opp?:boolean)=>out.push(<circle key={kk} className={a.mv} cx={r1(to[0])} cy={r1(to[1])} opacity={0}
  r={ball?ballR:dr} fill={ball?WHITE:opp?INK:GOLD} stroke={ball||!opp?INK:WHITE} strokeWidth={ball?ballW:r1(Math.max(2,dr*.17))}
  style={T(t,{'--dx':`${r1(from[0]-to[0])}px`,'--dy':`${r1(from[1]-to[1])}px`,'--d':`${dur}s`})}/>);
 const arrow=(ar:Arrow,kind:'pass'|'run'|'dribble',kk:string,t:number)=>{
  const [x1,y1]=P(...ar.from),[x2,y2]=P(...ar.to),L=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/L,uy=(y2-y1)/L,hs=sw*4.2,ex=x2-ux*hs*.9,ey=y2-uy*hs*.9;
  const wdt=r1(kind==='pass'?sw*1.7:sw*1.4),draw={className:kind==='run'?a.fade:a.draw,style:T(t),pathLength:1};
  if(kind==='dribble'){const p:Pt[]=[],n=Math.max(6,Math.round(L/(sw*7)));for(let i=0;i<=n;i++){const tt=i/n,amp=i===0||i===n?0:sw*1.8*Math.sin(tt*n*Math.PI);p.push([x1+(ex-x1)*tt-uy*amp,y1+(ey-y1)*tt+ux*amp]);}
   pline(p,{stroke:INK,strokeWidth:wdt,strokeLinejoin:'round',strokeLinecap:'round',...draw},kk);}
  else out.push(<line key={kk} x1={r1(x1)} y1={r1(y1)} x2={r1(ex)} y2={r1(ey)} stroke={INK} strokeWidth={wdt} strokeLinecap="round" strokeDasharray={kind==='run'?`${r1(sw*2.6)} ${r1(sw*2.2)}`:undefined} {...draw}/>);
  poly([[x2,y2],[x2-ux*hs-uy*hs*.62,y2-uy*hs+ux*hs*.62],[x2-ux*hs+uy*hs*.62,y2-uy*hs-ux*hs*.62]],{fill:INK,className:a.fade,style:T(t+(kind==='run'?.6:PASS*.8))},`${kk}h`);
 };
 /* the moves, in order: the passes one after another with the ball along each, the runs and dribbles while the first pass goes */
 const start=t0+.25,passes=d.passes??[],runs=d.runs??[],dribs=d.dribbles??[],dotAt=(p:Pt)=>(d.dots??[]).find(s=>Math.hypot(s.x-p[0],s.y-p[1])<4.5);
 runs.forEach((ar,i)=>{const t=start+.1+i*.15;arrow(ar,'run',`r${i}`,t);const who=dotAt(ar.from);traveller(P(...ar.from),P(...ar.to),t,.9,`rv${i}`,false,who?.opp);end=Math.max(end,t+.9);});
 passes.forEach((ar,i)=>{const t=start+i*STEP;arrow(ar,'pass',`a${i}`,t);if(d.ball&&!o.pop)traveller(P(...ar.from),P(...ar.to),t,PASS+.15,`av${i}`,true);end=Math.max(end,t+PASS+.15);});
 dribs.forEach((ar,i)=>{const t=start+i*.2;arrow(ar,'dribble',`w${i}`,t);end=Math.max(end,t+.7);});
 for(const [i,c] of (d.cones??[]).entries()){const [cx,cy]=P(...c),s=dr*.62;poly([[cx,cy-s],[cx+s*.95,cy+s*.7],[cx-s*.95,cy+s*.7]],{fill:GOLD,stroke:INK,strokeWidth:r1(sw*.8),strokeLinejoin:'round'},`k${i}`);}
 for(const [i,s] of (d.dots??[]).entries()){const [cx,cy]=P(s.x,s.y),pop=o.pop!==undefined?{className:a.pop,style:T(t0+i*o.pop)}:{};
  const dot=<circle cx={r1(cx)} cy={r1(cy)} r={dr} fill={s.opp?INK:GOLD} stroke={s.opp?WHITE:INK} strokeWidth={r1(Math.max(2,dr*.17))} opacity={s.dim?.45:undefined}/>;
  if(s.n&&o.num)out.push(<g key={`s${i}`} {...pop}>{dot}<text x={r1(cx)} y={r1(cy)} dy=".35em" textAnchor="middle" fontSize={r1(o.num*(s.n.length>1?.84:1))} fontWeight={800} letterSpacing={-1} fill={s.opp?WHITE:INK}>{s.n}</text></g>);
  else out.push(<g key={`s${i}`} {...pop}>{dot}</g>);
  if(o.pop!==undefined)end=Math.max(end,t0+i*o.pop+.45);}
 /* the ball rests at its start; while a copy travels along the passes it is hidden, and it comes back when the move is over */
 if(d.ball){const [cx,cy]=P(...d.ball);out.push(<circle key="ball" cx={r1(cx)} cy={r1(cy)} r={ballR} fill={WHITE} stroke={INK} strokeWidth={ballW} className={passes.length&&!o.pop?a.back:undefined} style={passes.length&&!o.pop?T(end):undefined}/>);}
 /* the field clips its lines (a cropped stretch of pitch is cut at the panel's rounded edge) */
 return {kids:[<g key={key} transform={`translate(${r1(x0)} ${r1(y0)})`}><clipPath id={clip}><rect width={w} height={h} rx={rx}/></clipPath>
  <rect width={w} height={h} rx={rx} fill={FIELD}/><g clipPath={`url(#${clip})`}>{out}</g></g>],end};
}
const fromScene=(s:Scene):Draw=>({dots:s.spots.map(p=>({x:p.x,y:p.y,opp:p.team==='opp'})),ball:s.ball,lineY:s.lineY,zone:s.zone,passes:s.passes,runs:s.runs});
const fromGrid=(g:GridScene):Draw=>({grid:true,dots:g.dots.map(p=>({x:p.x,y:p.y,opp:p.opp})),cones:g.cones,goals:g.goals,zones:g.zones,passes:g.passes,runs:g.runs,dribbles:g.dribbles,ball:g.balls[0]});
const gridGeo=(g:GridScene):Geo=>({w:g.w,l:g.l});
/** A scene's crop on the pitch: the stretch of the length (percent, from the gold team's goal line) that holds all of it. */
function windowFor(s:Scene,span:number):[number,number]{
 const ys=[...s.spots.map(p=>p.y),...(s.ball?[s.ball[1]]:[]),...s.passes.flatMap(q=>[q.from[1],q.to[1]]),...s.runs.flatMap(q=>[q.from[1],q.to[1]]),...(s.lineY!==undefined?[s.lineY]:[])];
 const mid=(Math.min(...ys)+Math.max(...ys))/2;let lo=mid-span/2,hi=mid+span/2;if(hi>100){lo-=hi-100;hi=100;}if(lo<0){hi-=lo;lo=0;}return [lo,hi];
}
const label=(text:string,x:number,y:number,w:number,size:number,t:number)=><text key={`l${text}${r1(x)}`} className={a.fade} style={T(t)} x={r1(x+w/2)} y={r1(y+size*.95)} textAnchor="middle" fontSize={r1(size)} fontWeight={800} letterSpacing={r1(-size*.03)} fill={INK}>{text}</text>;
const join=(parts:Built[]):Built=>({kids:parts.flatMap(p=>p.kids),end:Math.max(0,...parts.map(p=>p.end))});
/** A grid of scene panels (rules, terms), each cropped to the stretch of pitch its scene uses. */
function sceneGrid(W:number,H:number,scenes:Scene[],cols:number,span:number):Built{
 const rows=Math.ceil(scenes.length/cols),pad=Math.round(Math.min(W,H)*.045),gap=Math.round(Math.min(W,H)*.035),cw=(W-2*pad-(cols-1)*gap)/cols,ch=(H-2*pad-(rows-1)*gap)/rows;
 return join(scenes.map((s,i)=>{const c=i%cols,r=Math.floor(i/cols),geo=GEO(s.format);
  return panel(`p${i}`,pad+c*(cw+gap),pad+r*(ch+gap),cw,ch,{geo,win:windowFor(s,span),margin:2,draw:fromScene(s),dot:Math.min(cw,ch)*.052,stroke:Math.min(cw,ch)*.0095},i*.2);}));
}
const lastScene=(slug:string)=>{const r=ruleBySlug(slug);if(!r)throw new Error(`section picture: rule ${slug}`);return r.scenes[r.scenes.length-1];};
const termScene=(slug:string)=>{const t=termBySlug(slug);if(!t)throw new Error(`section picture: term ${slug}`);return t.scene;};
const grid=(slug:string)=>{const d=drillBySlug(slug);if(!d)throw new Error(`section picture: drill ${slug}`);return d.scene;};
const shape=(slug:string)=>{const f=formationBySlug(slug);if(!f)throw new Error(`section picture: formation ${slug}`);return f;};
const formationDots=(spots:readonly Placed[]):Dot[]=>spots.map(p=>({x:p.x,y:p.y,n:p.n}));

export const SECTION_SIZE={width:1440,height:900},GUIDE_SIZE={width:480,height:360};
type Size={width:number;height:number};
type Picture=(s:Size)=>Built;
/** Every section picture by name: name -> its drawing for a size. */
export const SECTION_PICTURES:Record<string,Picture>={
 /* Rules: four restarts and calls on their own stretch of pitch: offside (the line), a throw-in, a penalty, a free-kick wall */
 rules:({width:W,height:H})=>sceneGrid(W,H,[lastScene('offside'),lastScene('throw-in'),lastScene('penalty-kick'),lastScene('fouls-and-free-kicks')],2,40),
 /* Soccer terms: four moves with their passes and runs */
 terms:({width:W,height:H})=>sceneGrid(W,H,[termScene('give-and-go'),termScene('overlap'),termScene('through-ball'),termScene('switching-play')],2,40),
 /* Drills: two practice grids with cones, gates and movement arrows */
 drills:({width:W,height:H})=>{const g1=grid('cone-weave-dribbling'),g2=grid('partner-passing-through-gates'),pad=Math.round(H*.06),gap=Math.round(W*.035),bw=(W-2*pad-gap)/2;
  return join([panel('a',pad,pad,bw*.82,H-2*pad,{geo:gridGeo(g1),margin:2.8,draw:fromGrid(g1),dot:H*.03,stroke:H*.0055}),
   panel('b',pad+bw*.82+gap,pad,W-2*pad-gap-bw*.82,H-2*pad,{geo:gridGeo(g2),margin:2.4,draw:fromGrid(g2),dot:H*.03,stroke:H*.0055},.15)]);},
 /* Positions: one 11v11 pitch on its side, the eleven numbered positions of a 4-3-3 */
 positions:({width:W,height:H})=>{const f=shape('11v11-4-3-3'),pad=Math.round(H*.05);
  return panel('p',pad,pad,W-2*pad,H-2*pad,{geo:GEO('11v11'),horiz:true,margin:2.2,draw:{dots:formationDots(place(f.lines))},dot:H*.042,stroke:H*.0045,num:H*.04,pop:.1},.1);},
 /* Formations: three 11v11 shapes side by side, each with its shape under it */
 formations:({width:W,height:H})=>{const list=['11v11-4-3-3','11v11-4-4-2','11v11-3-5-2'].map(shape),pad=Math.round(H*.05),lab=H*.075,gap=W*.03,bw=(W-2*pad-2*gap)/3,bh=H-2*pad-lab*1.5;
  return join(list.map((f,i)=>{const x=pad+i*(bw+gap),{w}=fit({geo:GEO('11v11'),margin:1.5},bw,bh),t=.1+i*.4;
   const p=panel(`f${i}`,x,pad,bw,bh,{geo:GEO('11v11'),margin:1.5,draw:{dots:place(f.lines).map(q=>({x:q.x,y:q.y}))},dot:H*.02,stroke:H*.0035,pop:.045},t);
   return {kids:[...p.kids,label(f.shape,x+(bw-w)/2,pad+bh+lab*.3,w,lab,t+.5)],end:Math.max(p.end,t+1)};}));},
 /* Practice plans: a practice in order, its four activities as small grids left to right, each with a bar as long as its minutes */
 plans:({width:W,height:H})=>{const p=planBySlug('u8-passing-practice-plan');if(!p)throw new Error('section picture: plan');
  const rows=p.rows.filter(r=>r.drill).slice(0,4),pad=Math.round(W*.04),gap=W*.035,bw=(W-2*pad-3*gap)/4,bar=H*.045,most=Math.max(...rows.map(r=>r.minutes));
  const geo=(g:GridScene):Geo=>g.w>g.l?{w:g.l,l:g.w}:gridGeo(g),t=(q:Arrow):Arrow=>({from:[q.from[1],q.from[0]],to:[q.to[1],q.to[0]]}),turn=(g:GridScene):GridScene=>g.w>g.l?{...g,w:g.l,l:g.w,dots:g.dots.map(d=>({...d,x:d.y,y:d.x})),cones:g.cones.map(([x,y])=>[y,x]),balls:g.balls.map(([x,y])=>[y,x]),
   zones:g.zones.map(([z0,z1,z2,z3])=>[z1,z0,z3,z2]),goals:g.goals.map(o=>({...o,x:o.y,y:o.x,dir:o.dir==='h'?'v':'h'})),passes:g.passes.map(t),runs:g.runs.map(t),dribbles:g.dribbles.map(t)}:g;
  const sizes=rows.map(r=>fit({geo:geo(r.drill!.scene),margin:1.6},bw,H*.62)),ph=Math.max(...sizes.map(s=>s.h)),top=(H-ph-bar*2.2)/2;
  return join(rows.map((r,i)=>{const g=turn(r.drill!.scene),x=pad+i*(bw+gap),ti=i*.3,pn=panel(`d${i}`,x,top,bw,ph,{geo:geo(r.drill!.scene),margin:1.6,draw:fromGrid(g),dot:H*.024,stroke:H*.0042},ti);
   const kids=[...pn.kids,<rect key={`t${i}`} className={a.bar} style={T(ti+.2)} x={r1(x)} y={r1(top+ph+bar*1.2)} width={r1(bw*r.minutes/most)} height={r1(bar)} rx={r1(bar/2)} fill={i===rows.length-1?LINE:GOLD}/>];
   if(i<rows.length-1){const cx=x+bw+gap*.2,cy=top+ph/2-gap*.3,s=gap*.06;kids.push(<polygon key={`c${i}`} className={a.fade} style={T(ti+.5)} points={pts([[cx+2*s,cy+s],[cx+9*s,cy+5*s],[cx+2*s,cy+9*s]])} fill={INK} fillOpacity={.55}/>);}
   return {kids,end:Math.max(pn.end,ti+.9)};}));},
 /* Age groups: the four game sizes kids grow through, drawn to the same scale and standing on one line */
 ages:({width:W,height:H})=>{const sizes:{name:string;geo:Geo}[]=[{name:'4v4',geo:{w:20,l:30,goal:3.5}},{name:'7v7',geo:GEO('7v7')},{name:'9v9',geo:GEO('9v9')},{name:'11v11',geo:GEO('11v11')}];
  const pad=Math.round(H*.06),lab=H*.075,gap=W*.03,avail=W-2*pad-3*gap,tot=sizes.reduce((s,x)=>s+x.geo.w+3,0),k=Math.min(avail/tot,(H-2*pad-lab*1.6)/(105+3));
  let x=pad+(avail-tot*k)/2;const base=pad+(108)*k;
  return join(sizes.map(({name,geo},i)=>{const w=(geo.w+3)*k,h=(geo.l+3)*k,t=.1+i*.3,pn=panel(`a${i}`,x,base-h,w,h,{geo,margin:1.5,stroke:Math.max(2.4,k*.45)});
   const kids=[<g key={`ag${i}`} className={a.grow} style={T(t)}>{pn.kids}</g>,label(name,x-gap/2,base+lab*.35,w+gap,lab,t+.35)];x+=w+gap;return {kids,end:t+.9};}));},
 /* Coach tools: a printable lineup sheet: a 9v9 lineup on the pitch and a playing-time grid, one row per player */
 tools:({width:W,height:H})=>{const f=shape('9v9-3-2-3'),pad=Math.round(H*.07),sx=pad*1.6,sy=pad,sw=W-2*sx,sh=H-pad*1.4,inner=Math.round(H*.05);
  const pw=sw*.5,players=place(f.lines),rowsN=12,gx=sx+inner+pw+inner*1.4,gw=sx+sw-inner-gx,rh=(sh-2*inner)/rowsN,cell=Math.min(rh*.74,gw/6.2);
  const quarters=[[1,1,0,1],[1,0,1,1],[0,1,1,1],[1,1,1,0],[1,1,0,1],[1,0,1,1],[0,1,1,1],[1,1,1,0],[1,1,1,1],[0,1,0,1],[1,0,1,0],[0,0,1,1]];
  const pn=panel('pitch',sx+inner,sy+inner,pw,sh-2*inner,{geo:GEO('9v9'),margin:1.6,draw:{dots:formationDots(players)},dot:H*.03,stroke:H*.0035,num:H*.03,pop:.07},.1);
  const kids:ReactElement[]=[<rect key="sheet" x={sx} y={sy} width={r1(sw)} height={r1(sh)} rx={r1(H*.02)} fill={WHITE}/>,
   <rect key="clip" x={r1(sx+sw/2-W*.06)} y={r1(sy-H*.03)} width={r1(W*.12)} height={r1(H*.06)} rx={r1(H*.015)} fill={INK}/>,...pn.kids];
  const bw=Math.max(2,cell*.12),qw=(gw-cell*1.5)/4;
  for(let r=0;r<rowsN;r++){const y=sy+inner+r*rh+(rh-cell)/2,bench=r>=9,t=.3+r*.07;
   kids.push(<circle key={`d${r}`} cx={r1(gx+cell/2)} cy={r1(y+cell/2)} r={r1(cell/2-bw/2)} fill={bench?BENCH:GOLD} stroke={INK} strokeWidth={r1(bw)}/>);
   kids.push(<g key={`q${r}`} className={a.bar} style={T(t)}>{quarters[r].map((q,c)=><rect key={c} x={r1(gx+cell*1.5+c*qw)} y={r1(y)} width={r1(qw-cell*.25)} height={r1(cell)} rx={r1(cell*.2)} fill={q?LINE:OFF}/>)}</g>);}
  return {kids,end:Math.max(pn.end,.3+rowsN*.07+.6)};},
};
/** A page's own diagram without its title block (a /games guide card shows "The offside rule for kids" this way). */
export const PAGE_PICTURES:Record<string,Picture>={
 offside:({width:W,height:H})=>{const s=lastScene('offside'),pad=Math.round(H*.06);return panel('o',pad,pad,W-2*pad,H-2*pad,{geo:GEO(s.format),win:windowFor(s,46),draw:fromScene(s),dot:H*.04,stroke:H*.008});},
};
/**
 * The picture as one SVG. `frame` is the panel colour behind the pitches: the Library passes var(--card) so it takes the band's
 * opposite tone; the static files use paper. `label` is the picture's text alternative (role="img").
 */
export function SectionSvg({draw,size,label:alt,frame=COL.PAPER,className,clipId}:{draw:Picture;size:Size;label:string;frame?:string;className?:string;/** unique on the page */clipId?:string}){
 PFX=`sp-${(clipId??alt).replace(/[^a-z0-9]+/gi,'').slice(0,10).toLowerCase()}`;const {kids,end}=draw(size);
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-label={alt} className={className?`${a.svg} ${className}`:a.svg} data-pic-anim={Math.ceil((end+.3)*10)/10}
  fontFamily="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif" preserveAspectRatio="xMidYMid slice">
  <rect width={size.width} height={size.height} style={{fill:frame}}/>{kids}</svg>;
}
/** The files scripts/build-section-pictures.cjs writes: file name (in public/learn/sections/) -> [picture, size]. */
export const SECTION_FILES:readonly [string,Picture,Size][]=[
 ...Object.entries(SECTION_PICTURES).map(([n,f])=>[`${n}.webp`,f,SECTION_SIZE] as [string,Picture,Size]),
 ...(['formations','positions','drills','terms'] as const).map(n=>[`${n}-card.webp`,SECTION_PICTURES[n],GUIDE_SIZE] as [string,Picture,Size]),
 ['offside-card.webp',PAGE_PICTURES.offside,GUIDE_SIZE],
];
