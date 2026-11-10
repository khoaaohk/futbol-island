import {gridDesc,gridSize,type GridScene} from './grid';
import type {Arrow} from './pitch';
/**
 * A practice grid as server-rendered inline SVG (drill pages, Nov 10 2026; data in lib/site/grid.ts). The sister of
 * lib/site/PitchDiagram.tsx, with the same palette (the home page's pitch green, white, ink and gold) and the same rules: no
 * client code, no canvas, no animation (AGENTS.md, phone heat), <title> and <desc> on every picture. What it adds for coaches:
 * an area of a given size in yards drawn in proportion (dashed outline, a cone on each corner, the size printed under it),
 * cones and gates, small goals, several balls, shaded zones, and three kinds of arrow that never look alike: a solid white
 * arrow is a pass, a dashed white arrow is a run without the ball, a wavy gold arrow is a dribble.
 */
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55';
export default function GridDiagram({id,scene:g,small}:{id:string;scene:GridScene;small?:boolean}){
 const k=Math.min(300/g.w,360/g.l),W=Math.round(g.w*k),H=Math.round(g.l*k),M=30,FOOT=22,VW=Math.max(W+2*M,small?220:280),VH=H+2*M+FOOT,ox=(VW-W)/2,r=small?10:12;
 const X=(x:number)=>ox+x/100*W,Y=(y:number)=>M+H-y/100*H;
 const cone=(x:number,y:number,key:string)=><path key={key} data-cone="" d={`M${X(x)} ${Y(y)-6}L${X(x)+5.5} ${Y(y)+4.5}H${X(x)-5.5}z`} fill={GOLD} stroke={INK} strokeWidth={1.5} strokeLinejoin="round"/>;
 const ends=(a:Arrow,gap:number)=>{const x1=X(a.from[0]),y1=Y(a.from[1]),x2=X(a.to[0]),y2=Y(a.to[1]),d=Math.hypot(x2-x1,y2-y1)||1,u=Math.max(0,(d-gap)/d);return {x1,y1,x2:x1+(x2-x1)*u,y2:y1+(y2-y1)*u};};
 /* a dribble: a wave along the line that straightens over the last few pixels, so the arrow head points the right way */
 const wave=(a:Arrow)=>{const {x1,y1,x2,y2}=ends(a,7),d=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/d,uy=(y2-y1)/d,pts:string[]=[];
  for(let t=0;t<=d;t+=2){const amp=t>d-9||t<3?0:3.2,s=Math.sin(t/11*Math.PI*2)*amp;pts.push(`${(x1+ux*t-uy*s).toFixed(1)} ${(y1+uy*t+ux*s).toFixed(1)}`);}
  pts.push(`${x2.toFixed(1)} ${y2.toFixed(1)}`);return `M${pts.join('L')}`;};
 const desc=gridDesc(g);
 return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} data-diagram="grid" fontFamily="Arial,Helvetica,sans-serif">
  <title id={`${id}-t`}>{g.title}</title>
  <desc id={`${id}-d`}>{desc}</desc>
  <defs>
   <marker id={`${id}-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={PAPER}/></marker>
   <marker id={`${id}-g`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={GOLD}/></marker>
  </defs>
  <rect x={0} y={0} width={VW} height={VH} rx={14} fill={GRASS}/>
  {g.zones.map((z,i)=><rect key={`z${i}`} data-zone="" x={X(z[0])} y={Y(z[3])} width={X(z[2])-X(z[0])} height={Y(z[1])-Y(z[3])} fill={GOLD} fillOpacity={.34}/>)}
  <rect data-grid={`${g.w}x${g.l}`} x={ox} y={M} width={W} height={H} fill="none" stroke={PAPER} strokeWidth={2} strokeOpacity={.75} strokeDasharray="3 6"/>
  {g.goals.map((o,i)=>{const len=o.size/100*(o.dir==='h'?W:H);
   return o.dir==='h'?<rect key={`o${i}`} data-goal="" x={X(o.x)-len/2} y={Y(o.y)-3.5} width={len} height={7} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.5}/>
    :<rect key={`o${i}`} data-goal="" x={X(o.x)-3.5} y={Y(o.y)-len/2} width={7} height={len} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.5}/>;})}
  {[[0,0],[100,0],[0,100],[100,100]].map(([x,y],i)=>cone(x,y,`k${i}`))}
  {g.cones.map(([x,y],i)=>cone(x,y,`c${i}`))}
  {g.passes.map((a,i)=>{const e=ends(a,8);return <line key={`p${i}`} data-pass="" {...e} stroke={PAPER} strokeWidth={2.5} markerEnd={`url(#${id}-a)`}/>;})}
  {g.runs.map((a,i)=>{const e=ends(a,8);return <line key={`r${i}`} data-run="" {...e} stroke={PAPER} strokeWidth={2} strokeOpacity={.85} strokeDasharray="5 4" markerEnd={`url(#${id}-a)`}/>;})}
  {g.dribbles.map((a,i)=><path key={`d${i}`} data-dribble="" d={wave(a)} fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="round" markerEnd={`url(#${id}-g)`}/>)}
  {g.dots.map((s,i)=><g key={`s${i}`} data-player={s.n}>
   <circle cx={X(s.x)} cy={Y(s.y)} r={r} fill={s.opp?INK:GOLD} stroke={s.opp?PAPER:INK} strokeWidth={2}/>
   <text x={X(s.x)} y={Y(s.y)+4} textAnchor="middle" fontSize={s.n.length>1?9.5:12} fontWeight={700} fill={s.opp?PAPER:INK}>{s.n}</text>
  </g>)}
  {g.balls.map(([x,y],i)=><circle key={`b${i}`} data-ball="" cx={X(x)} cy={Y(y)} r={5} fill={PAPER} stroke={INK} strokeWidth={2}/>)}
  <text data-size="" x={VW/2} y={VH-11} textAnchor="middle" fontSize={12} fontWeight={700} fill={PAPER}>{gridSize(g)}</text>
 </svg>;
}
