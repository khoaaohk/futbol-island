import type {ReactNode} from 'react';
import type {FishSpecies} from '@/lib/town/fishing/fishCatalog';

/**
 * Flat island-style drawings of every catchable animal (inline SVG, no images to load). `hidden` draws a not-yet-caught
 * silhouette (one flat colour, no eyes, glow or markings).
 *
 * Oct 5 2026 (user: "they all need to look like their names"): every species now has its own drawing built from small
 * shared parts (body / fin / tail paths, ribbons for arms and tails) plus the anatomy that identifies it: a haddock's
 * thumbprint, a cod's chin barbel, a thresher's tail, a whale shark's spots, a shrimp's curled segments, a squid's two
 * clubbed tentacles. Heads face left. Shapes not listed per id fall back to a drawing for their `shape`.
 * Cost: a few dozen static paths per card; arm / ribbon geometry is computed once at module load.
 */
type R=ReactNode;type Pt=[number,number];
type X={h:boolean;b0:string;l0:string;c:(col:string)=>string;k:string};
const W='#fff8e8',D='#1d3a32',INK='#244d40',SIL='#b9b39c',SIL2='#a39c84';
const r1=(v:number)=>Math.round(v*10)/10;
const hx=(c:string)=>{const n=parseInt(c.slice(1),16);return [n>>16,n>>8&255,n&255];};
const mix=(a:string,b:string,t:number)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const dark=(c:string,t=.18)=>mix(c,'#1a2626',t);

// ---- Shared geometry ----
type BO={x0:number;xp:number;cy:number;ht:number;hb:number;mx:number;ph:number;bl?:number;my?:number};
const ctrl=(o:BO)=>{const {x0,xp,mx}=o;return {a:mx-(mx-x0)*.62,b:mx+(xp-mx)*.5,c:xp-(xp-mx)*.25,bl:o.bl??.5,my:o.my??0};};
const topD=(o:BO)=>{const {x0,xp,cy,ht,mx,ph}=o,{a,b,c,bl,my}=ctrl(o);return `M${x0} ${cy+my}C${x0} ${r1(cy-ht*bl)} ${r1(a)} ${cy-ht} ${mx} ${cy-ht}C${r1(b)} ${cy-ht} ${r1(c)} ${cy-ph} ${xp} ${cy-ph}`;};
/** Fish body: snout at x0 (bl 0 = pointed, 1 = blunt), deepest at mx, tail stalk at xp. */
const bodyD=(o:BO)=>{const {x0,xp,cy,hb,mx,ph}=o,{a,b,c,bl,my}=ctrl(o);return `${topD(o)}L${xp} ${cy+ph}C${r1(c)} ${cy+ph} ${r1(b)} ${cy+hb} ${mx} ${cy+hb}C${r1(a)} ${cy+hb} ${x0} ${r1(cy+hb*bl)} ${x0} ${cy+my}Z`;};
/** The darker back (countershading) above a line `lo` units below the midline. */
const backD=(o:BO,lo=0)=>{const {x0,xp,cy}=o,{a,b,my}=ctrl(o);return `${topD(o)}L${xp} ${cy}C${r1(b)} ${cy+lo} ${r1(a)} ${cy+lo} ${x0+.6} ${cy+my}Z`;};
const cub=(p:number[],t:number)=>{const u=1-t;return u*u*u*p[0]+3*u*u*t*p[1]+3*u*t*t*p[2]+t*t*t*p[3];};
/** y of the body's top (or bottom) edge at x. */
function edgeY(o:BO,x:number,top=true){const {x0,xp,cy,ht,hb,mx,ph}=o,{a,b,c,bl,my}=ctrl(o),h=top?-ht:hb,s=top?-1:1;
 const segs=[[[x0,x0,a,mx],[cy+my,cy+s*Math.abs(h)*bl,cy+h,cy+h]],[[mx,b,c,xp],[cy+h,cy+h,cy+s*ph,cy+s*ph]]];
 for(const [xs,ys] of segs){if(x<xs[0]||x>xs[3])continue;let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2;if(cub(xs,m)<x)lo=m;else hi=m;}return cub(ys,(lo+hi)/2);}
 return cy;}
type Tr='c'|'s'|'r';
/** A fin with its base on the body (drawn behind it) and its tip at (tx,ty): trailing edge concave, straight or rounded. */
const finD=(x1:number,y:number,x2:number,tx:number,ty:number,tr:Tr='c')=>{
 const lx=x1+(tx-x1)*.25,ly=y+(ty-y)*.85;
 const [cx,cy]=tr==='c'?[x2,y+(ty-y)*.6]:tr==='s'?[(x2+tx)/2,(y+ty)/2]:[Math.max(x2,tx)+2.5,ty+(y-ty)*.2];
 return `M${x1} ${y}Q${r1(lx)} ${r1(ly)} ${tx} ${ty}Q${r1(cx)} ${r1(cy)} ${x2} ${y}Z`;};
type Fin=[number,number,number,number,number,Tr?,string?];
/** The outer part of a fin (white / black fin tips). */
const tipD=(f:Fin,t=.62)=>{const [x1,y,x2,tx,ty,tr]=f;return finD(x1+(tx-x1)*t,y+(ty-y)*t,x2+(tx-x2)*t,tx,ty,tr);};
const tailFork=(xp:number,cy:number,ph:number,L:number,H:number,n=.35)=>`M${xp-2} ${cy-ph}Q${r1(xp+L*.5)} ${r1(cy-H*.5)} ${xp+L} ${cy-H}Q${r1(xp+L*n)} ${cy} ${xp+L} ${cy+H}Q${r1(xp+L*.5)} ${r1(cy+H*.5)} ${xp-2} ${cy+ph}Z`;
const tailLunate=(xp:number,cy:number,ph:number,L:number,H:number)=>`M${xp-2} ${cy-ph}Q${r1(xp+L*.5)} ${r1(cy-H*.45)} ${xp+L} ${cy-H}Q${r1(xp+L*.5)} ${r1(cy-H*.3)} ${r1(xp+L*.35)} ${cy}Q${r1(xp+L*.5)} ${r1(cy+H*.3)} ${xp+L} ${cy+H}Q${r1(xp+L*.5)} ${r1(cy+H*.45)} ${xp-2} ${cy+ph}Z`;
const tailRound=(xp:number,cy:number,ph:number,L:number,H:number)=>`M${xp-2} ${cy-ph}L${r1(xp+L*.7)} ${cy-H}Q${r1(xp+L*1.18)} ${cy} ${r1(xp+L*.7)} ${cy+H}L${xp-2} ${cy+ph}Z`;
/** Shark tail: upper lobe tip (ux,uy) longer than the lower (lx,ly). */
const tailShark=(xp:number,cy:number,ph:number,ux:number,uy:number,lx:number,ly:number,nx=xp+(ux-xp)*.38,ny=cy+1)=>
 `M${xp-3} ${cy-ph-1}Q${r1(xp+(ux-xp)*.45)} ${r1(cy-ph-(cy-uy)*.35)} ${ux} ${uy}Q${r1(nx+(ux-nx)*.15)} ${r1((uy+ny)/2+2)} ${r1(nx)} ${r1(ny)}L${lx} ${ly}Q${xp+3} ${r1(cy+ph+2)} ${xp-3} ${cy+ph}Z`;
function curlPts(x:number,y:number,deg:number,len:number,k:number,n=22):Pt[]{const p:Pt[]=[[x,y]];let h=deg*Math.PI/180;const s=len/n;
 for(let i=1;i<=n;i++){const t=i/n;h+=k*t*t*t;x+=Math.cos(h)*s;y+=Math.sin(h)*s;p.push([x,y]);}return p;}
const nrm=(p:Pt[],i:number)=>{const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;return [-dy/m,dx/m];};
/** A tapering ribbon (arms, tails, eels) around a centre line; w(t) is the full width. */
function ribbon(p:Pt[],w:(t:number)=>number){const L:string[]=[],Rr:string[]=[];p.forEach((q,i)=>{const [nx,ny]=nrm(p,i),h=w(i/(p.length-1))/2;
 L.push(`${r1(q[0]+nx*h)} ${r1(q[1]+ny*h)}`);Rr.unshift(`${r1(q[0]-nx*h)} ${r1(q[1]-ny*h)}`);});return `M${L.join('L')}L${Rr.join('L')}Z`;}
/** Points along one side of a ribbon (suckers, spots). */
const along=(p:Pt[],w:(t:number)=>number,side:number,every=2,upto=.85):[number,number,number][]=>p.flatMap((q,i)=>{const t=i/(p.length-1);if(i%every||t>upto||i===0)return [];const [nx,ny]=nrm(p,i),h=w(t)/2*side;return [[r1(q[0]+nx*h),r1(q[1]+ny*h),w(t)]];});
const poly=(p:Pt[])=>'M'+p.map(q=>`${r1(q[0])} ${r1(q[1])}`).join('L');

// ---- Small drawing parts ----
const Eye=({x,cx,cy,r=3,iris}:{x:X;cx:number;cy:number;r?:number;iris?:string})=>x.h?null:<>{iris&&<circle cx={cx} cy={cy} r={r+.9} fill={iris}/>}<circle cx={cx} cy={cy} r={r} fill={W}/><circle cx={cx-r*.18} cy={cy} r={r*.52} fill={D}/></>;
const SharkEye=({x,cx,cy,r=1.9}:{x:X;cx:number;cy:number;r?:number})=>x.h?null:<><circle cx={cx} cy={cy} r={r} fill={D}/><circle cx={cx-r*.35} cy={cy-r*.35} r={r*.32} fill={W}/></>;
const Ln=({d,c,w=1.2,o}:{d:string;c:string;w?:number;o?:number})=><path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o}/>;
const Dots=({pts,r,c}:{pts:number[][];r:number;c:string})=><>{pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={p[2]??r} fill={c}/>)}</>;

type Spec={o:BO;tail:string;tailCol?:string;lo?:number;back?:string;belly?:string;fin?:string;
 behind?:Fin[];front?:Fin[];eye?:[number,number,number,string?];shark?:boolean;gill?:[number,number,number];mouth?:string;
 /** Structural extras drawn in silhouette too. */under?:R;extra?:R;
 /** Markings: skipped in hidden mode. */over?:R;top?:R};
function draw(x:X,s:Spec){const o=s.o,backRaw=s.back??x.b0,back=x.c(backRaw),belly=x.c(s.belly??x.l0),fin=x.c(s.fin??dark(backRaw,.12));
 const g=s.gill;
 return <g>{s.under}{(s.behind||[]).map((f,i)=><path key={i} d={finD(f[0],f[1],f[2],f[3],f[4],f[5])} fill={f[6]?x.c(f[6]):fin}/>)}
  <path d={s.tail} fill={s.tailCol?x.c(s.tailCol):fin}/><path d={bodyD(o)} fill={belly}/><path d={backD(o,s.lo??0)} fill={back}/>
  {!x.h&&s.over}{s.extra}
  {(s.front||[]).map((f,i)=><path key={i} d={finD(f[0],f[1],f[2],f[3],f[4],f[5])} fill={f[6]?x.c(f[6]):fin}/>)}
  {g&&(s.shark?<Ln d={[0,1,2,3,4].map(i=>`M${g[0]+i*1.6} ${g[1]}q.8 ${r1((g[2]-g[1])/2)} 0 ${g[2]-g[1]}`).join('')} c={x.k} w={.9} o={.6}/>
   :<Ln d={`M${g[0]} ${g[1]}Q${g[0]+3.2} ${r1((g[1]+g[2])/2)} ${g[0]} ${g[2]}`} c={x.k} w={1.1} o={.55}/>)}
  {s.mouth&&<Ln d={s.mouth} c={x.k} w={1.1}/>}
  {s.eye&&(s.shark?<SharkEye x={x} cx={s.eye[0]} cy={s.eye[1]} r={s.eye[2]}/>:<Eye x={x} cx={s.eye[0]} cy={s.eye[1]} r={s.eye[2]} iris={s.eye[3]}/>)}
  {!x.h&&s.top}</g>;}

// ---- Sharks ----
type SP={x0:number;xp:number;cy:number;ht:number;hb:number;mx:number;bl:number;ph:number;my:number;
 d1:Fin;d2:Fin|null;pec:Fin;pel:Fin|null;anal:Fin|null;ut:Pt;lt:Pt;nt?:Pt;eye:[number,number,number];gill:number|null;mouth:string|null;
 back?:string;belly?:string;fin?:string;lo:number;tail?:string;under?:R;extra?:R;over?:R;top?:R};
const SD:SP={x0:8,xp:68,cy:30,ht:9,hb:7,mx:32,bl:.3,ph:2.4,my:0,d1:[30,30,44,42,9,'c'],d2:[58,30,63,64,22.5,'c'],pec:[20,33,27,34,43,'c'],
 pel:[48,30,53,55,40,'c'],anal:[58,30,62,63.5,38,'c'],ut:[86,11],lt:[79,40],eye:[15,28,1.9],gill:22,mouth:'M11 33.5q4 2.2 9 .8',lo:2};
function shark(x:X,p:Partial<SP>){const s={...SD,...p},o:BO={x0:s.x0,xp:s.xp,cy:s.cy,ht:s.ht,hb:s.hb,mx:s.mx,ph:s.ph,bl:s.bl,my:s.my};
 const behind=[s.d1,s.d2,s.pel,s.anal].filter(Boolean) as Fin[];
 return draw(x,{o,shark:true,lo:s.lo,back:s.back,belly:s.belly,fin:s.fin,behind,front:[s.pec],eye:s.eye,gill:s.gill==null?undefined:[s.gill,s.cy-3.2,s.cy+1.6],
  mouth:s.mouth??undefined,tail:s.tail??tailShark(s.xp,s.cy,s.ph,s.ut[0],s.ut[1],s.lt[0],s.lt[1],s.nt?.[0],s.nt?.[1]),under:s.under,extra:s.extra,over:s.over,top:s.top});}
/** White or black fin tips. */
const Tips=({x,fins,c,t}:{x:X;fins:Fin[];c:string;t?:number})=>x.h?null:<>{fins.map((f,i)=><path key={i} d={tipD(f,t)} fill={c}/>)}</>;

// ---- Static, colour-free geometry (computed once) ----
const OCTO_ARMS=[[37,26,172,24,.55],[39,28,148,24,.7],[42,29,118,22,-.6],[45,30,98,22,.65],[48,30,82,22,-.65],[51,29,62,22,.6],[54,28,32,24,-.7],[56,26,8,24,-.55]]
 .map(([x,y,a,l,k])=>curlPts(x,y,a,l,k*1.6));
const ARM_W=(t:number)=>5.2*(1-t)+.9;
const SQUID_ARMS=[[36,22,202,17,-.25],[36,23,195,19,-.2],[36,24,188,20,-.15],[36,25,181,21,.1],[36,27,175,21,.12],[36,28,168,20,.15],[36,29,161,19,.2],[36,30,154,17,.25]]
 .map(([x,y,a,l,k])=>curlPts(x,y,a,l,k));
const SQUID_TENT=[curlPts(36,24,190,33,.08,26),curlPts(36,28,172,33,-.08,26)];
const EEL=(()=>{const p:Pt[]=[];for(let i=0;i<=40;i++){const t=i/40;p.push([12+t*74,28+Math.sin(t*Math.PI*2.1+.3)*7*(0.5+t*.6)]);}return p;})();
const SEAHORSE=curlPts(47,17,96,46,.52,30);
const SH_W=(t:number)=>t<.42?8+5.5*Math.sin(Math.PI*Math.min(1,t/.42)*.85):Math.max(1.2,9.4*Math.max(0,1-(t-.42)/.58)**1.25);
const SHRIMP=(()=>{const cx=47,cy=31,R=11.5,segs:string[]=[],lines:string[]=[];const n=6,a0=-128,a1=88;const ang=(i:number)=>(a0+(a1-a0)*i/n)*Math.PI/180;
 const w=(i:number)=>11-i*1.05;
 for(let i=0;i<n;i++){const A=ang(i),B=ang(i+1)+.04,wa=w(i)/2,wb=w(i+1)/2;const pt=(a:number,r:number)=>`${r1(cx+Math.cos(a)*r)} ${r1(cy+Math.sin(a)*r)}`;
  segs.push(`M${pt(A,R+wa)}A${R+wa} ${R+wa} 0 0 1 ${pt(B,R+wb)}L${pt(B,R-wb)}A${R-wb} ${R-wb} 0 0 0 ${pt(A,R-wa)}Z`);
  if(i)lines.push(`M${pt(A,R+wa)}L${pt(A,R-wa+.6)}`);}
 const e=ang(n),ex=cx+Math.cos(e)*R,ey=cy+Math.sin(e)*R;
 return {segs,lines,end:[r1(ex),r1(ey)] as Pt};})();
const frill=(cx:number,cy:number,rx:number,ry:number,seed:number,amp=.07)=>{const p:Pt[]=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2,f=1+amp*Math.sin(a*7+seed)+amp*.7*Math.sin(a*13+seed*2.3)+(i%2?amp*.5:0);
 p.push([cx+Math.cos(a)*rx*f,cy+Math.sin(a)*ry*f]);}return poly(p)+'Z';};
const OYSTER=[frill(46,29,30,19,1,.09),frill(48,29.5,23,14,2.2,.08),frill(50,30,16,9.5,3.1,.08)];

// ---- Per-species drawings ----
type Art=(x:X)=>R;
const finlets=(o:BO,xs:number[],col:string,x:X)=><>{xs.map(v=>{const t=edgeY(o,v)+.6,b=edgeY(o,v,false)-.6;return <g key={v} fill={x.c(col)}><path d={`M${v} ${r1(t)}L${v+3.4} ${r1(t-.4)}L${v+3} ${r1(t-2.6)}Z`}/><path d={`M${v} ${r1(b)}L${v+3.4} ${r1(b+.4)}L${v+3} ${r1(b+2.6)}Z`}/></g>;})}</>;
const backStripes=(o:BO,xs:number[],f:(x:number,t:number)=>string,c:string,w=1.3)=><Ln d={xs.map(v=>f(v,edgeY(o,v)+1.2)).join('')} c={c} w={w}/>;

const ART:Record<string,Art>={
 // ---------- Bony fish ----------
 sardine:x=>{const o:BO={x0:10,xp:70,cy:28,ht:8,hb:8.5,mx:32,ph:2.6,bl:.35};return draw(x,{o,tail:tailFork(70,28,2.6,14,10),lo:-.5,behind:[[38,28,48,44,17],[44,28,48,49,39],[58,28,62,64,35]],front:[[23,31,27,31,36]],eye:[17,26.6,3],gill:[22,21.5,33],mouth:'M10.4 28.6l4 .6',
  over:<><Dots pts={[[26,25.2],[31,25],[36,25.2],[41,25.6],[46,26],[51,26.4]]} r={1.25} c="#22384a"/><Ln d="M24 28.6C40 29.4 56 29 68 28" c="#ffffff" w={1} o={.8}/></>});},
 herring:x=>{const o:BO={x0:9,xp:70,cy:28,ht:8.5,hb:9.5,mx:33,ph:2.6,bl:.3};return draw(x,{o,tail:tailFork(70,28,2.6,14,10.5,.3),back:mix(x.b0,'#2f7a78',.45),lo:-.5,behind:[[38,28,47,43,16.5],[44,28,48,49,40],[58,28,62,64,35]],front:[[23,31,27,31,36]],eye:[16.5,26.4,3],gill:[22,21.5,33],mouth:'M9.2 27.2l4.4 1.6',
  over:<Ln d="M24 27.6C40 28.6 56 28.4 68 27.6" c="#cfe3ea" w={1.4} o={.9}/>});},
 anchovy:x=>{const o:BO={x0:11,xp:70,cy:28,ht:6,hb:6.2,mx:34,ph:2.2,bl:.55};return draw(x,{o,tail:tailFork(70,28,2.2,13,8.5,.3),back:mix(x.b0,'#2f6a70',.3),lo:-1,behind:[[40,28,47,44,19],[56,28,60,61,33]],front:[[22,30,25,29,33]],eye:[16,26.4,2.6],gill:[21,23.5,32.5],
  mouth:'M12.5 30.2L25 31.6',over:<><Ln d="M21 28.4C40 28.4 56 28.4 69 28" c="#f4fbfc" w={2.4}/><Ln d="M21 26.9C40 26.8 56 27 69 27" c="#3f5f6e" w={.7} o={.7}/></>});},
 mackerel:x=>{const o:BO={x0:8,xp:70,cy:28,ht:8.5,hb:8,mx:34,ph:2,bl:.25};return draw(x,{o,tail:tailFork(70,28,2,14,11,.25),behind:[[29,28,39,35,16.5],[46,28,51,50,18.5],[48,28,53,53,37.5]],front:[[23,30,27,32,34.5]],eye:[16,26.2,3],gill:[21,21.5,33],mouth:'M8.6 28.6l5 .6',
  extra:finlets(o,[55,58.5,62,65.5],x.b0,x),over:backStripes(o,[24,28,32,36,40,44,48,52,56,60,64],(v,t)=>`M${v} ${r1(t)}q2.2 ${r1((28-t)/3)} 0 ${r1((28-t)*.55)}q-2.2 ${r1((28-t)/4)} 0 ${r1((28-t)*.4)}`,'#16302e',1.4)});},
 'short-mackerel':x=>{const o:BO={x0:12,xp:66,cy:28,ht:11,hb:10.5,mx:35,ph:2,bl:.35};return draw(x,{o,tail:tailFork(66,28,2,15,12,.25),behind:[[30,28,40,36,13],[46,28,51,50,15.5],[47,28,52,52,40.5]],front:[[25,30,29,34,35]],eye:[19.5,25.6,3.1],gill:[25,19,35],mouth:'M12.6 28.8l5 .6',
  extra:finlets(o,[53,56.4,59.8],x.b0,x),over:<>{backStripes(o,[30,35,40,45,50,55],(v,t)=>`M${v} ${r1(t)}q1.6 ${r1((27-t)/3)} 0 ${r1((27-t)*.55)}q-1.6 ${r1((27-t)/4)} 0 ${r1((27-t)*.4)}`,'#2a4a52',1)}
   <Ln d="M26 30.5C40 31.5 54 31 64 29.4M27 33C40 34 52 33.4 62 31" c="#9fb8bf" w={.8}/></>});},
 'horse-mackerel':x=>{const o:BO={x0:10,xp:70,cy:28,ht:8.5,hb:8,mx:32,ph:2,bl:.4};return draw(x,{o,tail:tailFork(70,28,2,14,10.5,.25),behind:[[29,28,39,36,15.5],[41,28,64,46,19.5,'s'],[44,28,64,48,37,'s']],front:[[23,30,27,31,35]],eye:[17,25.8,4],gill:[23,20.5,33.5],mouth:'M10.4 28.6l4.4 1',
  over:<><circle cx={23.5} cy={22.8} r={1.5} fill="#22343a"/><Ln d="M24 24.2C32 22.6 38 23.2 42 24.6C45 25.8 47 28 50 28.4L69 28.4" c="#eef2ee" w={2.6}/>
   <Ln d={[26,29,32,35,38,41,44,46.5,49,52,55,58,61,64,67].map(v=>{const y=v<42?23.6+(v-26)*.06:v<50?24.6+(v-42)*.47:28.4;return `M${v} ${r1(y-1.3)}l0 2.6`;}).join('')} c="#56707a" w={.7}/></>});},
 tuna:x=>{const o:BO={x0:10,xp:70,cy:28,ht:12,hb:11,mx:36,ph:1.8,bl:.3};return draw(x,{o,tail:tailLunate(70,28,1.8,17,16),back:mix(x.b0,'#14284a',.35),lo:1,behind:[[30,28,42,37,13,'s'],[46,28,52,51,13.5],[48,28,54,53,42.5]],front:[[24,30,30,37,32.5]],eye:[18,25,2.8],gill:[24,19,36],mouth:'M10.6 28.6l4.6.6',
  extra:<>{finlets(o,[55,58.4,61.8,65],'#f0c43c',x)}<ellipse cx={69} cy={28} rx={3} ry={1.4} fill={x.c('#24344a')}/></>,over:<Ln d={[32,36,40,44,48,52,56].map(v=>`M${v} 31l0 1.5M${v} 34l0 1.5`).join('')} c="#ffffff" w={.9} o={.75}/>});},
 'yellowfin-tuna':x=>{const o:BO={x0:10,xp:70,cy:28,ht:10.5,hb:10,mx:36,ph:1.8,bl:.28};return draw(x,{o,tail:tailLunate(70,28,1.8,17,16),back:mix(x.b0,'#14284a',.3),belly:'#e3e8ea',lo:.5,behind:[[30,28,42,36,15,'s'],[45,28,51,60,2,'c','#f2c230'],[47,28,53,62,54,'c','#f2c230']],front:[[24,30,30,44,33]],eye:[18,25,2.8],gill:[24,19.5,35.5],mouth:'M10.6 28.6l4.6.6',
  extra:<>{finlets(o,[55,58.4,61.8,65],'#f2c230',x)}<ellipse cx={69} cy={28} rx={3} ry={1.4} fill={x.c('#24344a')}/></>,over:<Ln d="M20 26.6C34 27 50 27.2 66 27.6" c="#f2c230" w={2}/>});},
 bonito:x=>{const o:BO={x0:10,xp:70,cy:28,ht:10,hb:9.5,mx:36,ph:1.8,bl:.28};return draw(x,{o,tail:tailLunate(70,28,1.8,16,14),back:mix(x.b0,'#2d4a6e',.2),lo:1,behind:[[26,28,48,30,15.5,'s'],[50,28,54,54,17.5],[50,28,55,55,38.5]],front:[[24,30,29,35,33]],eye:[18,25,2.7],gill:[24,19.5,35],mouth:'M10.6 28.6l4.6.6',
  extra:finlets(o,[57,60.4,63.8],x.b0,x),over:backStripes(o,[28,32.5,37,41.5,46,50.5,55,59.5,64],(v,t)=>`M${v} ${r1(t)}L${r1(v-(28-t)*.8)} 28.4`,'#16294a',1.5)});},
 cod:x=>{const o:BO={x0:10,xp:68,cy:28,ht:10.5,hb:11,mx:34,ph:3,bl:.75,my:1};return draw(x,{o,tail:tailFork(68,28,3,12,10,.9),lo:1.5,
  behind:[[25,28,36,30,15,'r'],[39,28,52,44,15.5,'r'],[55,28,64,58,19.5,'r'],[39,28,52,44,40.5,'r'],[55,28,63,58,36.5,'r'],[18,31,22,19,41,'s']],front:[[23,31,28,31,36,'r']],eye:[17,24.6,2.8],gill:[23,19.5,35],mouth:'M10.4 29.4l6.6.8',
  extra:<Ln d="M14 34.4q.6 3 -.4 5.4" c={x.c('#d9cfa4')} w={1.3}/>,
  over:<><Dots pts={[[20,21],[26,19.5],[31,21.5],[36,19],[41,22],[46,20.5],[51,23],[56,22],[61,25],[29,25.5],[39,25.8],[48,26.4],[57,26.8],[34,30],[44,30.6],[24,27.4]]} r={1.05} c="#5c4a26"/>
   <Ln d="M22 25C34 20.6 48 22.8 67 27.4" c="#f3ecd2" w={1.3}/></>});},
 haddock:x=>{const o:BO={x0:10,xp:68,cy:28,ht:10,hb:10,mx:34,ph:2.6,bl:.65,my:1};return draw(x,{o,tail:tailFork(68,28,2.6,12,10,.6),lo:1,
  behind:[[23,28,32,27,7,'c'],[37,28,51,43,15.5,'r'],[54,28,63,58,19.5,'r'],[38,28,51,43,40.5,'r'],[54,28,62,58,36.5,'r']],front:[[23,30.5,28,31,35.5,'r']],eye:[17,24.6,2.8],gill:[23,19.5,35],mouth:'M10.4 29.4l6 .7',
  extra:<Ln d="M13.6 33.6q.4 2 -.2 3.4" c={x.k} w={1.1}/>,
  over:<><Ln d="M21 24.6C34 20.6 48 22.4 67 27.4" c="#151f22" w={1.4}/><ellipse cx={31} cy={25.4} rx={2.9} ry={2.3} fill="#151f22"/></>});},
 'sea-bass':x=>{const o:BO={x0:9,xp:68,cy:28,ht:10,hb:9,mx:34,ph:2.8,bl:.35};return draw(x,{o,tail:tailFork(68,28,2.8,13,11,.5),lo:.5,
  behind:[[42,28,55,47,15.5,'r'],[46,28,55,51,40,'s'],[32,28,36,35,40,'s']],front:[[23,30.5,28,32,35]],eye:[16.5,25.4,2.9],gill:[22.5,19.5,34],mouth:'M9.4 28.6l6.6 1.4',
  extra:<path d="M23 21.4L25 12.4L27.4 19L29.6 11.6L32 18.6L34.4 12.2L36.6 19L38.8 13.6L41 19.6L42.4 21Z" fill={x.c(dark(x.b0,.18))}/>,
  over:<><ellipse cx={22.6} cy={24.6} rx={1.4} ry={1.8} fill="#3a4448"/><Ln d="M23 23.6C36 21.6 50 23.4 67 27.2" c="#5e6e74" w={.8}/></>});},
 'red-snapper':x=>{const o:BO={x0:10,xp:66,cy:28,ht:13,hb:10,mx:36,ph:2.8,bl:.55,my:2};return draw(x,{o,tail:tailFork(66,28,2.8,13,12,.55),lo:2,
  behind:[[44,28,58,52,13,'r'],[46,28,56,54,43,'s'],[30,30,35,34,42,'s']],front:[[24,31,29,36,35,'c',mix(x.b0,'#f6c3a8',.4)]],eye:[20,23.2,2.7,'#c8343a'],gill:[26,17,36],mouth:'M10.4 30.2l5.6 .4',
  extra:<path d="M24 18L26.4 9.4L29 15.6L31.6 8.6L34.2 15L36.8 9.4L39.4 15.4L42 11L44.6 16.4L46 18Z" fill={x.c(dark(x.b0,.12))}/>});},
 'red-mullet':x=>{const o:BO={x0:12,xp:68,cy:28,ht:9,hb:9,mx:34,ph:2.6,bl:1,my:3};return draw(x,{o,tail:tailFork(68,28,2.6,13,11,.3),lo:1.5,
  behind:[[29,28,38,33,14.5,'s'],[46,28,54,50,18.5],[46,28,54,51,38.5],[26,30,30,30,40,'s']],front:[[24,30.5,28,31,35]],eye:[19.5,23.2,2.6],gill:[24.5,20,34.5],mouth:'M12.2 31.2l3.6 .4',
  extra:<><Ln d="M14.6 32.6q1.2 5 -.8 10M16 32.8q2.2 5 .8 10.2" c={x.c('#f6e2a8')} w={1.4}/></>,over:<Ln d="M24 28.4C38 29.4 52 29 66 28" c="#f2b94a" w={1.6} o={.85}/>});},
 hake:x=>{const o:BO={x0:6,xp:72,cy:28,ht:7.5,hb:7.5,mx:28,ph:2.2,bl:.15,my:.5};const dt=(v:number)=>r1(edgeY(o,v)),db=(v:number)=>r1(edgeY(o,v,false));
  return draw(x,{o,tail:tailFork(72,28,2.2,9.5,7.5,.92),lo:.5,behind:[[23,28,31,27,14.5,'s'],[20,30,24,22,36,'s']],front:[[20,29.5,24,27,33]],eye:[14,25.6,3],gill:[19,22,33],mouth:'M6.6 28.8L16.4 30.6',
   under:<g fill={x.c(dark(x.b0,.14))}><path d="M6 28.8L4.6 30.4Q10 32.4 16.4 30.6Z" fill={x.c(x.b0)}/><path d={`M33 ${dt(33)+1}Q35 ${dt(36)-3.4} 40 ${dt(40)-2.4}L58 ${dt(58)-2}Q64 ${dt(64)-3.2} 69 ${dt(69)+.6}Z`}/><path d={`M36 ${db(36)-1}Q38 ${db(38)+3.2} 42 ${db(42)+2.4}L58 ${db(58)+2}Q64 ${db(64)+3} 69 ${db(69)-.6}Z`}/></g>,
});},
 barracuda:x=>{const o:BO={x0:4,xp:72,cy:28,ht:6,hb:6,mx:36,ph:2,bl:.05,my:.4};return draw(x,{o,tail:tailFork(72,28,2,13,10,.3),tailCol:dark(x.b0,.3),lo:.5,
  behind:[[30,28,35,33,18.5,'c'],[58,28,62,62,20.5,'c'],[58,28,62,62,35.5,'c'],[38,28,42,42,35]],front:[[20,29.5,23,26,33]],eye:[13.5,26,2.4],gill:[18,23.4,32.6],mouth:'M5 28.8L15 29.8',
  under:<path d="M2.6 29.6L15 29.8L15 31.6Q8 31.4 2.6 29.6Z" fill={x.c(x.b0)}/>,
  over:<>{backStripes(o,[24,30,36,42,48,54,60,66],(v,t)=>`M${v} ${r1(t)}L${v-1.6} 29`,'#3d4852',2.3)}<Dots pts={[[50,31],[56,31.4],[62,30.6],[44,31.6]]} r={.9} c="#2b343b"/></>,
  top:<path d="M7 29.2l.7 1.8.8-1.7M10 29.5l.7 1.9.8-1.8M12.8 29.7l.6 1.6.7-1.5" fill="#ffffff"/>});},
 dorado:x=>{const back=mix(x.b0,'#1f7f8a',.35);return <g>
  <path d="M14 16C16 9 24 6.6 32 7.4C46 9 60 16 70 25.4L62 27L20 20Z" fill={x.c(mix(x.b0,'#1d5a8a',.35))}/>
  <path d="M40 38C50 39 62 36 70 30.6L66 30L40 33Z" fill={x.c(mix(x.b0,'#1d5a8a',.35))}/>
  <path d={tailFork(70,28.5,2,16,13,.12)} fill={x.c('#e3c23a')}/>
  <path d="M12 31C11 24 11.4 17 15 14.2C26 12.4 50 18 70 26.5L70 30.5C52 37 32 41 19 40C14 38.6 12.4 35 12 31Z" fill={x.c(x.l0)}/>
  <path d="M12 30C11.2 23 11.6 17 15 14.2C26 12.4 50 18 70 26.5L70 28.5C54 27 32 30 12 30Z" fill={x.c(back)}/>
  {!x.h&&<><Dots pts={[[26,25],[32,23.6],[38,25.6],[44,24.4],[50,26.6],[56,26],[30,30],[42,30.6],[54,30.4],[22,28]]} r={1.1} c="#2f6fb8"/><Ln d="M20 29.8C34 30.8 52 30.6 68 28.6" c="#f5e46a" w={1.2} o={.8}/></>}
  <path d={finD(24,32,29,35,36)} fill={x.c(mix(x.b0,'#e3c23a',.4))}/>
  <Ln d="M12.4 31.6l4.4 .4" c={x.k} w={1.1}/><Eye x={x} cx={17.6} cy={25.6} r={2.7}/></g>;},
 arowana:x=>{const o:BO={x0:8,xp:68,cy:28,ht:8,hb:9,mx:34,ph:3.2,bl:.1,my:-3};return draw(x,{o,tail:tailRound(68,28,3.2,15,8),lo:1,
  behind:[[50,28,67,63,17.5,'r'],[44,28,67,61,40.5,'r'],[24,32,28,30,40,'s']],front:[[18,30,22,26,35]],eye:[15,24.2,2.7],gill:[20,20,35],mouth:'M8.2 25L15.2 29.4',
  extra:<Ln d="M9 26.4l-6.4-4.4M9.6 27l-6.6-2.4" c={x.c(dark(x.b0,.25))} w={1.1}/>,
  over:<Ln d={[[24,22],[29,21],[34,20.6],[39,21],[44,21.8],[49,22.8],[54,24],[22,26.4],[27,25.6],[32,25.4],[37,25.6],[42,26],[47,26.4],[52,27],[57,27],[62,27.6],[24,30.6],[29,30.6],[34,30.8],[39,30.8],[44,30.8],[49,30.6],[54,30.4],[59,30.2],[27,34.8],[32,35.2],[37,35.2],[42,35],[47,34.6],[52,33.6]].map(([a,b])=>`M${a} ${b-1.9}a2.1 2.1 0 0 1 0 3.8`).join('')} c="#7f6c2c" w={.8} o={.75}/>});},
 piranha:x=>{const o:BO={x0:14,xp:66,cy:28,ht:13,hb:13,mx:36,ph:3,bl:.75,my:2};return draw(x,{o,tail:tailFork(66,28,3,12,11.5,.85),lo:2,
  behind:[[36,28,48,43,13,'r'],[44,28,58,52,43.5,'s'],[30,32,34,32,44,'s']],front:[[24,30.5,28,31,35,'c',mix(x.b0,'#d9573f',.3)]],eye:[22,23.6,2.8,'#c8343a'],gill:[27,17,39],
  under:<path d="M12.2 31L20 33.2L22 38.6Q14 38.6 12.2 31Z" fill={x.c(x.l0)}/>,
  extra:<path d="M55 16.8L60 16.4L59.4 19.8Z" fill={x.c(dark(x.b0,.1))}/>,
  over:<><Dots pts={[[30,20],[36,18.6],[42,20],[48,22],[33,24.6],[40,25],[47,26.2],[54,26]]} r={.9} c="#c9d0cc"/><path d="M66 22.6L69 23.4L69 32.6L66 33.4Z" fill="#2c3330"/></>,
  top:<><path d="M13.2 31l1.2-2 1 2.3 1.3-2.1 1 2.5 1.3-2 .9 2.6" fill="#ffffff"/><Ln d="M12.4 30.8L19 33" c={INK} w={1}/></>});},
 coelacanth:x=>{const o:BO={x0:10,xp:68,cy:28,ht:11,hb:11,mx:36,ph:4.5,bl:.6,my:1};const lobe=mix(x.b0,'#1c2a4a',.2);
  const lf=(bx:number,by:number,ex:number,ey:number,k:string)=>{const a=Math.atan2(ey-by,ex-bx),px=-Math.sin(a),py=Math.cos(a);
   return <g key={k}><path d={`M${bx} ${by}L${ex} ${ey}`} stroke={x.c(lobe)} strokeWidth={4.4} strokeLinecap="round"/><path d={`M${r1(ex+px*2.6)} ${r1(ey+py*2.6)}Q${r1(ex+Math.cos(a)*9)} ${r1(ey+Math.sin(a)*9)} ${r1(ex-px*2.6)} ${r1(ey-py*2.6)}Z`} fill={x.c(lobe)}/></g>;};
  return draw(x,{o,lo:1,back:x.b0,belly:mix(x.b0,'#8ea0c0',.35),behind:[[34,28,44,40,10,'s']],eye:[19,24.4,2.8,'#3a6a8a'],gill:[26,18.5,37],mouth:'M10.6 29.6l6 .8',
   tail:`M64 22.4L79 11Q78 20 76.4 25.6L84 25.4L91 28L84 30.6L76.4 30.4Q78 36 79 45L64 33.6Z`,tailCol:mix(x.b0,'#1c2a4a',.15),
   under:<>{lf(52,22,55,13,'d')}{lf(52,34,55,43,'a')}{lf(40,37,40,46,'p')}</>,extra:lf(27,32,32,40,'pc'),
   over:<Dots pts={[[24,20,1.6],[32,18.4,1.4],[44,21.6,1.7],[56,24,1.3],[28,29,1.4],[38,27.4,1.9],[50,30,1.5],[60,29,1.2],[34,34,1.3],[46,35,1.5],[22,33,1.1]]} r={1.4} c="#e8eef6"/>});},
 grouper:x=>{const o:BO={x0:10,xp:64,cy:29,ht:12,hb:12,mx:34,ph:4,bl:.6,my:2};return draw(x,{o,tail:tailRound(64,29,4,15,11),lo:2,
  behind:[[44,29,58,52,15.5,'r'],[44,29,56,52,43,'r'],[28,33,33,32,44,'r']],front:[[25,31,31,35,38,'r']],eye:[20,22.6,2.4],gill:[27,18,40],
  under:<path d="M8.6 31.6Q12 36.6 22 33.4L22 31.6Q14 33.4 10 30.6Z" fill={x.c(mix(x.l0,x.b0,.3))}/>,
  extra:<path d="M24 18L26 11.4L28.6 16L31 10L33.6 15L36 9.6L38.6 14.6L41 10.4L43.6 15L46 15.6L46 19Z" fill={x.c(dark(x.b0,.15))}/>,mouth:'M10 30.6Q15 32.4 21 31.2',
  over:<Dots pts={[[22,26,2],[30,20,2.4],[38,18.6,2],[46,21,2.5],[54,24,2],[28,27.6,2.2],[36,26,2.6],[44,28,2.2],[52,30,2],[33,34,2],[41,35,2.3],[24,33,1.6],[58,28.6,1.6],[48,35,1.8],[60,33,1.4]]} r={2} c={dark(x.b0,.3)}/>});},
 lanternfish:x=>{const o:BO={x0:24,xp:62,cy:28,ht:6,hb:6,mx:36,ph:2,bl:.85};const pts=[30,33.4,36.8,40.2,43.6,47,50.4,53.8,57.2].map(v=>[v,r1(edgeY(o,v,false)-1.4)]);
  return draw(x,{o,tail:tailFork(62,28,2,10,7,.3),lo:1,behind:[[40,28,46,44,19.5],[44,28,50,49,36]],front:[[30,29.5,33,36,32]],eye:[28.4,26.4,3.4],gill:[32.4,23.4,32.8],mouth:'M24.4 28.8l3 .2',
   extra:<path d={`M55 ${r1(edgeY(o,55))}L58 ${r1(edgeY(o,58))}L57.4 ${r1(edgeY(o,57)-2.2)}Z`} fill={x.c(dark(x.b0,.1))}/>,
   top:<><Dots pts={pts} r={1.9} c="#9fe8ff40"/><Dots pts={pts} r={.95} c="#bff4ff"/><Dots pts={[[34,29.2],[40,29.6],[46,29.8],[52,29.6]]} r={.75} c="#bff4ff"/><circle cx={25.6} cy={29.4} r={.9} fill="#bff4ff"/></>});},
 // ---------- Billfish ----------
 swordfish:x=>{const o:BO={x0:22,xp:70,cy:28,ht:9.5,hb:8,mx:38,ph:1.8,bl:.4};return draw(x,{o,tail:tailLunate(70,28,1.8,17,17),back:mix(x.b0,'#3a2f4a',.25),lo:1,
  behind:[[30,28,38,37,5.6,'c'],[64,28,66,67,24],[52,28,58,60,38.5,'c']],front:[[27,31,31,40,38,'c']],eye:[27.6,25.2,3.2],gill:[32,20,35],
  under:<path d="M25 25.6L1.6 27.6Q.8 28.4 1.6 29.2L25 30.6Z" fill={x.c(dark(x.b0,.22))}/>,extra:<ellipse cx={69} cy={28} rx={3} ry={1.3} fill={x.c(dark(x.b0,.3))}/>});},
 'blue-marlin':x=>{const o:BO={x0:18,xp:70,cy:28,ht:9,hb:8,mx:36,ph:1.8,bl:.2};const fin=dark(mix(x.b0,'#14284a',.3),.1);return draw(x,{o,tail:tailLunate(70,28,1.8,17,17),back:mix(x.b0,'#14284a',.3),lo:1,
  behind:[[54,28,58,58,39,'c'],[64,28,66,67,24]],front:[[25,30.5,29,38,36,'c']],eye:[24,25.6,2.6],gill:[29,20.6,35],
  under:<><path d="M20 26.4L.6 28Q0 28.4.6 28.8L20 30.2Z" fill={x.c(dark(x.b0,.2))}/><path d="M24 22L30 6.6L34 18L60 21.4L62 26L24 28Z" fill={x.c(fin)}/></>,
  extra:<Ln d="M29 34.6L40 44.6" c={x.c(fin)} w={1.6}/>,over:<Ln d={[32,36,40,44,48,52,56,60,64].map(v=>`M${v} ${r1(edgeY(o,v)+1.6)}L${v} ${r1(Math.min(33,edgeY(o,v,false)-2))}`).join('')} c="#a8d4f2" w={1.1} o={.9}/>});},
 sailfish:x=>{const o:BO={x0:18,xp:70,cy:28,ht:7.5,hb:7,mx:36,ph:1.8,bl:.2};const sail=mix(x.b0,'#1d3f7a',.3);return draw(x,{o,tail:tailLunate(70,28,1.8,16,15),back:mix(x.b0,'#14284a',.25),lo:1,
  behind:[[54,28,58,58,37.5,'c'],[64,28,66,67,23.6]],front:[[25,30,29,37,35,'c']],eye:[24,25.8,2.6],gill:[29,21.6,34],
  under:<><path d="M20 26.6L.6 28Q0 28.4.6 28.8L20 30Z" fill={x.c(dark(x.b0,.2))}/><path d="M23 24C22 12 28 2.6 38 1.6C50 1 58 9 62 24Z" fill={x.c(sail)}/></>,
  extra:<Ln d="M29 33.8L44 46" c={x.c(sail)} w={1.4}/>,
  over:<><Ln d="M28 22L28 8M33 22L34 4.6M38 22L39.6 3.4M43 22L45.6 4M48 22L51 6.6M53 23L55.4 11.6" c="#163262" w={.6} o={.6}/><Dots pts={[[30,13],[35,10],[40,8],[45,9.4],[50,11.6],[36,16],[42,14.6],[48,16.4],[54,17.6],[31,18.6]]} r={1.1} c="#13254a"/>
   <Dots pts={[32,36,40,44,48,52,56,60].flatMap(v=>[[v,26],[v,29]])} r={.75} c="#b6dcf6"/></>});},
 // ---------- Sharks ----------
 shark:x=>shark(x,{}),
 'blue-shark':x=>shark(x,{x0:4,xp:70,ht:6.5,hb:5.6,mx:30,bl:.12,back:mix(x.b0,'#1f3f9a',.4),belly:mix(x.l0,'#ffffff',.3),d1:[36,30,46,46,16,'c'],d2:[60,30,64,65,25,'c'],pec:[22,32,28,47,46,'c'],pel:[50,30,54,56,38],anal:[60,30,63,64,36],
  ut:[89,14],lt:[80,36],eye:[12.6,28.6,2.3],gill:20,mouth:'M8 32.4q3.6 1.6 8 .6',over:<Ln d="M14 31C30 31.6 50 31.4 68 30" c={mix(x.b0,'#7fb0ff',.4)} w={1.6} o={.7}/>}),
 'great-white':x=>shark(x,{x0:6,xp:68,ht:12,hb:10,mx:30,bl:.35,lo:2.5,d1:[28,30,42,39,3,'s'],d2:[59,30,63,64,23.6],pec:[20,34,28,37,47,'c'],pel:[48,30,53,55,42],anal:[58,30,62,63.5,38.5],
  ut:[87,9],lt:[85,48],nt:[77,30.6],eye:[14.6,26.6,2],gill:21,mouth:null,
  extra:<><path d="M8.6 33.4Q14 39.6 23 36.4Q15.4 36 8.6 33.4Z" fill={x.c('#7d2f36')}/>{!x.h&&<path d="M10 34.2l1 2 .9-1.6 1 2.1 1-1.8 1.1 2.1 1-1.8 1.2 1.9 1-1.6 1.2 1.6 1-1.3" fill="#ffffff"/>}</>,
  over:<><Ln d="M8 32.4L14 33.4L19 32L24 33.4L30 32L36 33.6L42 32.4L50 33L58 31.6L66 31" c="#ffffff" w={1.4}/><path d={tipD([20,34,28,37,47,'c'],.72)} fill="#1d2626"/></>}),
 mako:x=>shark(x,{x0:3,xp:70,ht:8,hb:7,mx:32,bl:.04,back:mix(x.b0,'#1d3f8f',.35),d1:[32,30,44,42,11,'c'],d2:[61,30,64,65,24.8],pec:[22,33,28,36,43,'c'],pel:[50,30,54,56,38],anal:[61,30,64,65,36],
  ut:[88,10],lt:[87,49],nt:[77,30],eye:[13,28,2.4],gill:21,mouth:'M7 32.6q5 2.2 11 .6',
  extra:<ellipse cx={69} cy={30} rx={3.4} ry={1.4} fill={x.c(dark(x.b0,.3))}/>,top:<path d="M9.4 33l.7 2.4.7-2.2M12.4 33.6l.7 2.4.7-2.2M15.4 33.8l.6 2.2.7-2" fill="#ffffff"/>}),
 thresher:x=>shark(x,{x0:6,xp:50,ht:9,hb:8,mx:23,bl:.4,ph:2.2,d1:[22,30,32,30,12,'c'],d2:[44,30,47,47.6,25.6],pec:[15,33,21,28,44,'c'],pel:[36,30,40,42,39],anal:[44,30,47,48,36],eye:[12.4,27.6,2.8],gill:17,mouth:'M9.4 33q3 1.6 7 .6',
  tail:'M46 26.6C60 22 74 10 91 2.6C82 10 68 24 57 31L55 38.6L46 32.4Z'}),
 'whale-shark':x=>shark(x,{x0:4,xp:66,ht:11,hb:9,mx:30,bl:.95,my:1,lo:1.5,d1:[34,30,46,44,13,'c'],d2:[58,30,62,63,23],pec:[18,33,26,32,46,'c'],pel:[46,30,51,52,41],anal:[58,30,61,62,38],
  ut:[86,7],lt:[82,47],nt:[75,30],eye:[11,28.6,1.4],gill:18,mouth:null,
  extra:<Ln d="M4.4 31.6Q9 33.4 15 31.8" c={x.k} w={1.3}/>,
  over:<><Ln d="M14 25.6C30 23 48 25 64 28.6M16 21.6C30 19.8 44 21 58 25" c={dark(x.b0,.25)} w={.9}/>
   <Dots pts={[[16,24],[20,22.8],[24,21.6],[28,20.6],[32,20],[36,20.4],[40,21],[48,22.4],[52,23.4],[56,24.6],[60,26],[18,28],[22,27.2],[26,26.6],[30,26.2],[34,26],[38,26.2],[42,26.6],[46,27],[50,27.6],[54,28.2],[58,28.8],[20,31.4],[25,31],[30,30.6],[35,30.6],[40,30.8],[45,31],[50,31],[55,31]]} r={1} c="#f2f5f5"/>
   <Ln d="M27 22v8.4M33 21v9.6M39 21.4v9.4M45 22.6v8.6M51 23.6v7.4M57 25v5.6" c="#e8eef0" w={.6} o={.8}/></>}),
 'oceanic-whitetip':x=>{const d1:Fin=[28,30,44,37,6.6,'r'],pec:Fin=[21,33,29,41,50,'r'],ut:Pt=[86,11],lt:Pt=[79,40];
  return shark(x,{x0:7,bl:.55,ht:10,hb:8,mx:31,d1,pec,ut,lt,eye:[14.4,27.6,1.9],
   top:<><Tips x={x} fins={[d1,pec,[48,30,53,55,40,'c']]} c="#f6f4ec" t={.6}/><path d="M81 13.6L86 11L83.6 16Z M77 36.6L79 40L80.4 35.6Z" fill="#f6f4ec"/></>});},
 blacktip:x=>{const d1:Fin=[30,30,42,40,9,'c'],pec:Fin=[20,33,27,34,43,'c'];
  return shark(x,{x0:7,bl:.45,d1,pec,top:<><Tips x={x} fins={[d1,pec,[58,30,63,64,22.5,'c'],[48,30,53,55,40,'c']]} c="#141c1c" t={.62}/><path d="M76 34.4L79 40L81.6 33.2Z M82.6 14.6L86 11L85 17.6Z" fill="#141c1c"/></>,
   over:<Ln d="M30 34C40 33.6 50 33 60 32" c="#ffffff" w={1.6} o={.8}/>});},
 sawshark:x=>shark(x,{x0:27,xp:74,ht:6,hb:5,mx:44,bl:.2,ph:2,lo:1.5,d1:[46,30,54,54,18],d2:[60,30,65,65,21.4],pec:[34,32,38,46,40,'c'],pel:[56,30,60,62,37],anal:null,ut:[88,20],lt:[81,34],nt:[79,30.6],eye:[31,28.4,1.6],gill:36,mouth:'M28.6 32.6q2.2 1 4.4.4',
  under:<path d="M29 28.2L3 29.2Q1.6 30 3 30.8L29 31.6Z" fill={x.c(dark(x.b0,.08))}/>,
  extra:<><Ln d={[4,7,10,13,16,19,22,25].map(v=>`M${v} ${r1(29.2-(v-3)*.04)}l-.9-1.6M${v+1.5} ${r1(30.8+(v-3)*.03)}l-.9 1.6`).join('')} c={x.c('#f0ecd8')} w={.9}/>
   <Ln d="M15 31q.6 3 -.4 6M17 31q1 3 .4 6" c={x.k} w={.9}/></>}),
 'nurse-shark':x=>shark(x,{x0:8,xp:64,ht:8,hb:7,mx:30,bl:.9,lo:2.5,d1:[42,30,54,50,16.5,'r'],d2:[56,30,63,60,19.5,'r'],pec:[19,33,27,30,44,'r'],pel:[42,30,48,48,40,'r'],anal:[54,30,60,58,38,'r'],
  ut:[90,24],lt:[71,36],nt:[69,32],eye:[15.4,27.4,1.4],gill:21,mouth:'M8.4 32.6q3 .8 6 0',extra:<Ln d="M9.6 31.4q-.4 2.4-2 4M11.4 31.6q-.2 2.4-1.2 4.2" c={x.k} w={1}/>}),
 'port-jackson':x=>shark(x,{x0:10,xp:66,ht:10,hb:7,mx:30,bl:1,my:2,d1:[28,30,38,34,12,'s'],d2:[50,30,59,55,16,'s'],pec:[18,34,26,30,45,'r'],pel:[44,30,50,50,40,'r'],anal:[56,30,61,60,37,'r'],ut:[86,18],lt:[77,38],eye:[17,24.8,1.8],gill:22,mouth:'M10.6 34q3 1 6.4 0',
  extra:<><path d="M12.6 22.6Q16 16.6 22 19.6Q17 20 13.6 23.6Z" fill={x.c(dark(x.b0,.12))}/>{!x.h&&<Ln d="M28.6 29.4L34 12.4M50.6 29.4L55 16.4" c="#f2ead6" w={.9}/>}</>,
  over:<><path d="M18 22L22 22L17 32L13.6 31.4Z" fill="#4a3826"/><path d="M30 21.4L35.6 21.6L30 36.4L24.6 35.6Z" fill="#4a3826"/><path d="M44 22L49 23L46 33L41 33Z" fill="#4a3826"/><path d="M58 25.4L62 26.4L61 31L57 31Z" fill="#4a3826"/></>}),
 'sand-tiger':x=>shark(x,{x0:6,ht:10,hb:8,mx:32,bl:.22,d1:[34,30,44,40,14.5],d2:[50,30,60,56,15.5],pel:[44,30,49,50,40],anal:[52,30,60,57,40],ut:[88,14],lt:[80,38],eye:[14,27.4,1.8],mouth:'M9 33.4q4 2.6 11 1',
  top:<Ln d="M10 33.6l-.4 2.6M12 34.4l.4 2.8M14 35l-.6 2.6M16 35.2l.5 2.6M18 35l-.3 2.4M11 33.2l.6-1.6M15 34.2l-.4-1.6" c="#ffffff" w={.8}/>,
  over:<Dots pts={[[30,24],[36,22.6],[42,24.6],[48,23.4],[54,25.4],[60,26.6],[34,27.6],[46,28],[24,25.6],[52,28.8]]} r={1.2} c="#6e4a2c"/>}),
 wobbegong:x=>shark(x,{x0:8,xp:66,cy:33,ht:5.6,hb:4,mx:30,bl:.6,ph:2,lo:2,d1:[44,33,52,51,23.4,'r'],d2:[55,33,62,61,24.6,'r'],pec:[17,35,27,32,43,'r'],pel:[38,33,46,46,41,'r'],anal:[58,33,62,62,38,'r'],
  ut:[88,29],lt:[76,36],nt:[75,34],eye:[16,30.2,1.3],gill:null,mouth:'M9 35.6q3 .8 6 0',
  extra:<path d="M7.6 34.4l-2.4 1.4 2 .8-1.4 2 2.4-.6.2 2.2 1.6-1.8 1.4 2 .6-2.4 1.8 1.6.2-2.4 2 1.2-.4-2.2 2.2.6-1.2-2 2.2-.2-2-1.4 1.6-1.2-12.4 1.4Z M18 32.4l1.6 2.6 1-2 1.6 2.4 .8-2.2Z" fill={x.c(dark(x.b0,.1))}/>,
  over:<>{[[20,29.6],[28,28.4],[36,28.6],[44,29.8],[52,30.6],[60,31.6],[24,33],[32,32.6],[40,33],[48,33.6],[56,33.6]].map(([a,b],i)=><g key={i}><ellipse cx={a} cy={b} rx={2.8} ry={1.7} fill="#5c4628"/><ellipse cx={a} cy={b} rx={1.4} ry={.8} fill="#efe0b8"/></g>)}</>}),
 'gummy-shark':x=>shark(x,{x0:6,ht:7.5,hb:6,mx:31,bl:.45,d1:[30,30,40,38,16],d2:[52,30,60,58,18.5],pel:[44,30,49,50,38],anal:[56,30,60,61,36],ut:[87,17],lt:[79,37],eye:[13.6,28,2.4],
  over:<Dots pts={[[22,25],[28,24],[34,23.4],[40,24.2],[46,24.6],[52,25],[58,26],[25,28.6],[31,28],[37,28],[43,28.4],[49,28.6],[55,29],[62,28.4]]} r={.85} c="#f4f2ea"/>}),
 'lemon-shark':x=>shark(x,{x0:7,ht:9.5,hb:7.5,mx:32,bl:.7,back:mix(x.b0,'#c9b048',.3),belly:mix(x.l0,'#fff3b0',.3),d1:[30,30,42,38,11],d2:[51,30,61,58,13],pel:[44,30,49,50,40],anal:[54,30,61,60,39],ut:[86,13],lt:[79,40],eye:[14.6,27.4,1.9]}),
 'sandbar-shark':x=>shark(x,{x0:7,ht:10,hb:7.5,mx:32,bl:.4,d1:[24,30,40,35,-.6,'s'],eye:[14.4,27.2,1.9],ut:[86,13],lt:[79,40]}),
 'bull-shark':x=>shark(x,{x0:9,ht:12,hb:10,mx:32,bl:.9,lo:2.5,d1:[29,30,44,41,5,'c'],pec:[20,34,28,36,46,'c'],pel:[48,30,53,55,42],anal:[58,30,62,63.5,39.5],ut:[86,12],lt:[80,44],eye:[15.6,27,1.5],gill:22,mouth:'M10.6 34q4 1.6 9 .4'}),
 'tope-shark':x=>shark(x,{x0:2,ht:7.5,hb:6,mx:32,bl:.15,d1:[32,30,42,40,15.5],d2:[60,30,63,64,24],anal:[60,30,63,64,36],ut:[89,17],lt:[80,37],eye:[12.4,28.2,1.9],gill:20,mouth:'M7 32.4q4 1.6 9 .4',
  extra:<path d="M83 20.6L89 17L88.6 22.6Z" fill={x.c(dark(x.b0,.2))}/>}),
 'dusky-shark':x=>shark(x,{d1:[31,30,44,42,11,'c'],eye:[15,28,1.8]}),
 'reef-shark':x=>{const pec:Fin=[20,33,27,34,43,'c'];return shark(x,{ht:9.5,d1:[30,30,43,41,9,'c'],pec,top:<><Tips x={x} fins={[pec,[48,30,53,55,40,'c'],[58,30,62,63.5,38,'c']]} c={dark(x.b0,.45)} t={.6}/><Ln d="M86 11Q81 18 75.6 31L79 40" c={dark(x.b0,.45)} w={1.2}/></>});},
 hammerhead:x=>shark(x,{x0:16,ht:8,hb:6.5,mx:34,bl:.5,d1:[30,30,44,42,1,'c'],eye:undefined,gill:24,mouth:'M16 32.6q3 1.4 7 .4',ut:[87,10],lt:[80,39],
  under:<path d="M7.4 15C9.6 12.6 13 13 14 15.4L20 30L18.6 34L16.6 47.4C15 50 11 49.6 10.6 46.6L13 31Z" fill={x.c(x.b0)}/>,
  top:<><circle cx={10.4} cy={15.4} r={1.4} fill={D}/><circle cx={13.6} cy={46.8} r={1.6} fill={D}/></>}),
 // ---------- Other deep-sea fish ----------
 anglerfish:x=>{const glow=x.h?SIL:'#ffe292';return <g>
  <path d="M70 30L84 20Q80 30 84 40Z" fill={x.c(dark(x.b0,.1))}/><path d="M50 13L56 9L60 16Z" fill={x.c(dark(x.b0,.1))}/>
  <path d="M14 22C18 10 38 6 52 12C64 17 72 24 72 31C72 42 58 48 44 48C30 48 18 44 14 38L26 33L14 34Z" fill={x.c(x.b0)}/>
  <path d="M14 38C22 42 34 44 46 42" fill="none" stroke={x.c(x.l0)} strokeWidth={4} strokeLinecap="round"/>
  <path d="M14 22L28 31L14 36Q10 30 14 22Z" fill={x.c('#2a1f1a')}/>
  {!x.h&&<path d="M15 23l2 3.6 1-3 2 4 1-3 2 3.8 1.4-2.6M14.6 35.4l2-3.8 1.4 3.2 1.6-4 1.6 3.4 1.6-3.8 1.6 2.8" fill="none" stroke="#fff8e8" strokeWidth={1.1} strokeLinejoin="round"/>}
  <path d="M32 12C30 4 20 2 14 7" fill="none" stroke={x.k} strokeWidth={1.4} strokeLinecap="round"/>
  {!x.h&&<circle cx={13.4} cy={8.6} r={5} fill="#ffe29255"/>}<circle cx={13.4} cy={8.6} r={2.8} fill={glow}/>
  <path d={finD(46,34,52,56,42,'r')} fill={x.c(dark(x.b0,.1))}/>
  {!x.h&&<><circle cx={34} cy={19} r={1.8} fill={W}/><circle cx={33.7} cy={19} r={.9} fill={D}/><Dots pts={[[44,20],[52,24],[48,30],[58,28],[40,26],[62,34]]} r={.7} c="#6c5c4c"/></>}</g>;},
 'ocean-sunfish':x=>{const fin=x.c(dark(x.b0,.12));return <g>
  <path d="M52 14Q56 2 64 1Q62 10 64 17Z" fill={fin}/><path d="M52 42Q56 54 64 55Q62 46 64 39Z" fill={fin}/>
  <path d="M18 28C18 14 30 8 44 8C56 8 66 14 70 20Q74 28 70 36C66 42 56 48 44 48C30 48 18 42 18 28Z" fill={x.c(x.b0)}/>
  <path d="M20 32C26 42 40 46 56 44C62 43 66 40 69 36" fill={x.c(x.l0)} opacity={.55}/>
  <path d="M69 18Q75 18 74 22Q77 24 74.6 27Q77.4 30 74.6 33Q76.6 37 72.4 38.6L69 37Q72 28 69 18Z" fill={x.c(mix(x.b0,x.l0,.35))}/>
  <path d={finD(33,28,36,41,33,'r')} fill={fin}/>
  {!x.h&&<><Dots pts={[[34,16],[46,14],[56,18],[40,22],[52,24],[60,28],[46,32]]} r={1.4} c={mix(x.b0,'#ffffff',.3)}/><circle cx={26} cy={24} r={2.8} fill={W}/><circle cx={25.5} cy={24} r={1.4} fill={D}/></>}
  <Ln d="M18.6 29.6q1.4 1 3 .4" c={x.k} w={1.3}/></g>;},
};

// ---------- Invertebrates, rays, eels, seahorses, shells ----------
function octopus(x:X){const b=x.c(x.b0),pale=mix(x.l0,'#ffffff',.25);return <g>
 {OCTO_ARMS.map((p,i)=><path key={i} d={ribbon(p,ARM_W)} fill={i%2?b:x.c(dark(x.b0,.08))}/>)}
 {!x.h&&OCTO_ARMS.map((p,i)=><Dots key={i} pts={along(p,ARM_W,i<4?1:-1,2,.8).map(([a,c,w])=>[a,c,Math.max(.5,w*.17)])} r={.8} c={pale}/>)}
 <path d="M30 22C28 10 36 2 47 2C58 2 64 10 62 20C61 27 54 30 46 30C38 30 31 28 30 22Z" fill={b}/>
 {!x.h&&<><ellipse cx={42} cy={9} rx={5} ry={3} fill="#ffffff" opacity={.2}/><Dots pts={[[38,15],[50,12],[55,17],[44,19],[36,22]]} r={.9} c={dark(x.b0,.2)}/></>}
 {!x.h&&<><circle cx={39} cy={24} r={3.2} fill={W}/><circle cx={53} cy={24} r={3.2} fill={W}/><rect x={37} y={23.3} width={4} height={1.6} rx={.8} fill={D}/><rect x={51} y={23.3} width={4} height={1.6} rx={.8} fill={D}/></>}
</g>;}
function squid(x:X){const b=x.c(x.b0),d=x.c(dark(x.b0,.1)),aw=(t:number)=>3*(1-t)+.7,tw=(t:number)=>t>.8?3.6*Math.sin(Math.PI*Math.min(1,(t-.8)/.2*.85+.15)):1.3;return <g>
 {SQUID_TENT.map((p,i)=><path key={i} d={ribbon(p,tw)} fill={d}/>)}
 {SQUID_ARMS.map((p,i)=><path key={i} d={ribbon(p,aw)} fill={i%2?b:d}/>)}
 <path d="M62 25L80 11L90 26L80 41L62 28Z" fill={d}/>
 <path d="M44 20C56 17 72 19 84 24Q88 26 84 28C72 33 56 35 44 32Z" fill={b}/>
 <path d="M34 22C36 19 42 19 46 20L46 32C42 33 36 33 34 30Z" fill={b}/>
 {!x.h&&<><Dots pts={[[50,23],[56,22],[62,23],[68,24],[74,25],[53,27],[60,28],[67,27],[46,26],[78,26]]} r={.9} c={dark(x.b0,.25)}/><Ln d="M46 31C58 31 70 29 82 26.4" c={x.l0} w={1.6} o={.7}/>
  <circle cx={40.4} cy={25.4} r={3.4} fill={W}/><circle cx={40} cy={25.4} r={1.8} fill={D}/></>}
</g>;}
function shrimp(x:X){const b=x.c(x.b0),pale=x.c(x.l0),seg=x.h?SIL2:dark(x.b0,.3),[ex,ey]=SHRIMP.end;return <g opacity={x.h?1:.96}>
 <Ln d="M15 20C8 12 14 3 34 4C54 5 70 8 86 16M16 21C6 18 4 8 18 6C34 4 56 10 74 22" c={x.k} w={.8}/>
 <Ln d="M14 22L4 18M14 23L5 22" c={x.k} w={.9}/>
 <Ln d="M22 30.6l-2 7M25 31.4l-1 7.2M28 31.6l0 7M31 31.4l1 6.6M34 31l1.6 6" c={x.c(dark(x.b0,.1))} w={1.1}/>
 <Ln d="M44 39l-2.6 3.4M49 39.6l-1.4 3.6M54 37.6l.6 3.6" c={x.c(dark(x.b0,.05))} w={1.2}/>
 <path d={`M${ex} ${ey}L${r1(ex-11)} ${r1(ey-6)}Q${r1(ex-13)} ${r1(ey)} ${r1(ex-11.4)} ${r1(ey+5)}Z`} fill={pale}/>
 <path d={`M${ex} ${ey}L${r1(ex-9)} ${r1(ey-3.4)}L${r1(ex-10)} ${r1(ey+2)}Z`} fill={b}/>
 {SHRIMP.segs.map((d,i)=><path key={i} d={d} fill={i%2?b:x.c(mix(x.b0,x.l0,.18))}/>)}
 <path d="M38 19.6C30 16 20 17 14 20.4L6 21.4L13 23C18 30 30 33 39 30Z" fill={b}/>
 <path d="M20 29C26 31 32 31.4 38 30" fill="none" stroke={pale} strokeWidth={2} strokeLinecap="round" opacity={.8}/>
 <Ln d={SHRIMP.lines.join('')+'M38 19.6Q36 25 39 30'} c={seg} w={.9}/>
 {!x.h&&<><Ln d="M42 18.6C50 17.4 58 21 60 28" c="#ffffff" w={1} o={.45}/><Ln d="M17 20.6l2.4-3.4" c={INK} w={1.2}/><circle cx={19.8} cy={16.8} r={1.8} fill={D}/><circle cx={19.3} cy={16.3} r={.5} fill={W}/></>}
</g>;}
const claw=(x:X,cx:number,cy:number,deg:number,s:number,col:string,tip:string|null,key:string)=><g key={key} transform={`translate(${cx} ${cy}) rotate(${deg}) scale(${s})`}>
 <ellipse cx={0} cy={0} rx={1.1} ry={.78} fill={x.c(col)}/><path d="M.5 -.62Q1.7 -1 2.2 -.15Q1.5 -.38 .7 -.12Z" fill={x.c(col)}/><path d="M.6 .08Q1.6 .02 2.1 .3Q1.4 .74 .5 .62Z" fill={x.c(col)}/>
 {tip&&!x.h&&<><path d="M1.55 -.72Q2 -.6 2.2 -.15Q1.85 -.3 1.5 -.28Z" fill={tip}/><path d="M1.5 .12L2.1 .3Q1.8 .55 1.45 .6Z" fill={tip}/></>}</g>;
const legs=(x:X,col:string,pts:string[],w=2.4)=><Ln d={pts.join('')} c={x.c(col)} w={w}/>;
function crab(x:X,id:string){const b=x.b0,ink=x.k;
 const eyes=x.h?null:<><Ln d="M42 18.6l-1-3.4M50 18.6l1-3.4" c={INK} w={1.2}/><circle cx={40.8} cy={14.6} r={1.6} fill={id==='swimming-crab'?'#c8343a':D}/><circle cx={51.2} cy={14.6} r={1.6} fill={id==='swimming-crab'?'#c8343a':D}/></>;
 const walk=(col:string,w=2.4,last?:R)=><>{legs(x,col,['M28 31L17 32L11 38','M29 34L18 38L14 45','M31 37L22 43L20 50','M64 31L75 32L81 38','M63 34L74 38L78 45','M61 37L70 43L72 50'],w)}{last}</>;
 if(id==='coconut-crab'){const b2=x.c(b);return <g>
  {legs(x,b,['M36 22L22 16L12 22','M36 26L20 26L8 34','M38 30L24 36L16 46','M56 22L70 16L80 22','M56 26L72 26L84 34','M54 30L68 36L76 46'],3)}
  {!x.h&&<Ln d="M22 16l-.4 .1M70 16l.4 .1M20 26h.1M72 26h.1" c="#e4793a" w={3}/>}
  <ellipse cx={46} cy={40} rx={9} ry={8} fill={x.c(mix(x.l0,b,.15))}/><Ln d="M38 39q8 3 16 0M39 43.4q7 2.6 14 0" c={ink} w={.8} o={.5}/>
  <path d="M33 26C33 16 40 12 46 12C52 12 59 16 59 26C59 32 53 35 46 35C39 35 33 32 33 26Z" fill={b2}/>
  {!x.h&&<Ln d="M38 21Q46 17 54 21M40 27Q46 29 52 27" c={mix(b,'#ffffff',.35)} w={1} o={.7}/>}
  <Ln d="M37 16L27 12M55 15L62 11" c={x.c(b)} w={4}/>{claw(x,21,10,205,8.4,b,null,'L')}{claw(x,65,9,-30,5,b,null,'R')}
  {!x.h&&<><Ln d="M43 12.4l-1.4-4M49 12.4l1.4-4" c={INK} w={1}/><circle cx={41.5} cy={8} r={1.4} fill={D}/><circle cx={50.5} cy={8} r={1.4} fill={D}/><Ln d="M44 12C40 6 34 4 30 3M48 12C52 6 58 4 62 3" c={INK} w={.7}/></>}</g>;}
 if(id==='blue-crab'){const shell=mix(b,'#7a8a5a',.5);return <g>
  {walk(shell,2.4,<>{legs(x,shell,['M33 38L30 46','M59 38L62 46'],2)}<ellipse cx={28.6} cy={48.6} rx={3} ry={2} fill={x.c(shell)} transform="rotate(-30 28.6 48.6)"/><ellipse cx={63.4} cy={48.6} rx={3} ry={2} fill={x.c(shell)} transform="rotate(30 63.4 48.6)"/></>)}
  {legs(x,b,['M34 24L24 18L20 12','M58 24L68 18L72 12'],3)}{claw(x,18,10,-120,4.6,b,'#d0583a','L')}{claw(x,74,10,-60,4.6,b,'#d0583a','R')}
  <path d="M4 26L30 22C36 18 56 18 62 22L88 26L62 31C56 38 36 38 30 31Z" fill={x.c(shell)}/>
  {!x.h&&<Ln d="M32 22.6l1.8 2 1.6-2.2 1.8 2 1.6-2.2 1.8 2 1.6-2.2M60 22.6l-1.8 2-1.6-2.2-1.8 2-1.6-2.2-1.8 2-1.6-2.2" c={dark(shell,.3)} w={.8}/>}{eyes}</g>;}
 const swim=id==='swimming-crab';const shellD=swim?'M24 27L28 20C36 15 56 15 64 20L68 27C64 36 56 40 46 40C36 40 28 36 24 27Z':'M23 29C23 20 34 15 46 15C58 15 69 20 69 29C69 37 58 42 46 42C34 42 23 37 23 29Z';
 return <g>
  {walk(b,2.6,swim?<>{legs(x,b,['M34 39L30 47','M58 39L62 47'],2)}<ellipse cx={28.6} cy={49.4} rx={3.2} ry={2.1} fill={x.c(b)} transform="rotate(-30 28.6 49.4)"/><ellipse cx={63.4} cy={49.4} rx={3.2} ry={2.1} fill={x.c(b)} transform="rotate(30 63.4 49.4)"/></>:null)}
  {legs(x,b,['M33 24L24 19L19 13','M59 24L68 19L73 13'],3.4)}{claw(x,17,11,-118,5.2,b,id==='edible-crab'?'#1a1a1a':null,'L')}{claw(x,75,11,-62,5.2,b,id==='edible-crab'?'#1a1a1a':null,'R')}
  <path d={shellD} fill={x.c(b)}/>
  {id==='edible-crab'&&<path d={Array.from({length:13},(_,i)=>{const a=Math.PI*(1.03+i*.075),cx=46+Math.cos(a)*22.6,cy=29+Math.sin(a)*13.6;return `M${r1(cx-2.2)} ${r1(cy)}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0`;}).join('')} fill={x.c(dark(b,.08))}/>}
  {swim&&<path d="M24 27l-3.4-2.4 4-.6-2.4-2.8 4 .2-1.6-3 3.6 1M68 27l3.4-2.4-4-.6 2.4-2.8-4 .2 1.6-3-3.6 1" fill={x.c(b)}/>}
  {!x.h&&<><path d={id==='edible-crab'?'M30 30C30 23 38 20 46 20C54 20 62 23 62 30C62 35 55 38 46 38C37 38 30 35 30 30Z':'M30 28C32 22 40 20 46 20C52 20 60 22 62 28C60 34 54 36 46 36C38 36 32 34 30 28Z'} fill={mix(b,'#ffffff',.14)}/><Ln d="M38 26Q46 30 54 26" c={dark(b,.25)} w={.9}/>{swim&&<Ln d="M18 42h.1M74 42h.1" c="#3a6ab0" w={0}/>}</>}
  {eyes}</g>;}
function lobster(x:X){const b=x.c(x.b0),d=x.c(dark(x.b0,.15)),k=x.k;return <g>
 <Ln d="M20 21C10 14 6 4 22 2C40 0 60 4 90 10M21 23C8 22 0 12 6 6C12 0 30 2 44 6" c={d} w={1.9}/>
 {!x.h&&<Ln d="M13 12.4l-1.6-1M9 9l-1.6-.4M18 6.4l-.6-1.6M28 3.2l-.4-1.6M40 2.6l0-1.6M52 3.4l.4-1.6M64 5l.6-1.6M76 7.4l.6-1.6M8.6 15l-1.6.4M5 9.6l-1.6-.2" c={INK} w={.8}/>}
 <Ln d="M19 24L11 21M19 24.6L12 25.4" c={k} w={.9}/>
 <Ln d="M24 33l-3 8 -3 3M29 34l-2 8 -2 4M34 34.6l-1 8 -1 4M39 34.6l0 8 1 3.6M44 34l1 7.4 2 3" c={d} w={1.4}/>
 <path d="M70 28L86 20L84 28.6L88 30L84 31.4L86 40L70 32Z" fill={d}/>
 <path d="M42 22C50 21 62 22 72 25L72 34C62 36 50 36 42 35Z" fill={b}/>
 <Ln d="M48 21.6v13.6M54 21.8v13.6M60 22.4v12.8M66 23.4v11" c={x.h?SIL2:dark(x.b0,.3)} w={1}/>
 <path d="M18 26C18 20 28 17 36 18C40 18.4 44 20 44 22L44 34C40 36 30 36 22 34C19 32 18 30 18 26Z" fill={b}/>
 <path d="M18 24L14 22.6L18 22Z" fill={b}/>
 <path d="M22 18l1-3 1.6 2.6M27 17.2l1-3.2 1.4 3M32 17l1.2-3.2 1.2 3.2M37 17.6l1.4-2.8 .8 3.2" fill={b}/>
 {!x.h&&<><Dots pts={[[50,26],[57,27],[63,28],[52,31],[61,31.6],[30,24],[36,26],[26,28]]} r={1.1} c={mix(x.l0,'#ffffff',.3)}/><circle cx={21} cy={21.4} r={1.6} fill={D}/></>}
</g>;}
function ray(x:X,id:string){const b=x.c(x.b0),d=x.c(dark(x.b0,.18));
 if(id==='cownose-ray')return <g>
  <Ln d="M60 28C70 28 80 30 90 27" c={d} w={1.3}/>
  <path d="M13 22.4Q7 21.6 7.4 25.2Q7.8 27.2 10.6 28Q7.8 28.8 7.4 30.8Q7 34.4 13 33.6Q11 33.4 13 33.6Q16 36 22 38C32 44 40 50 48 53C46 44 50 36 62 30Q64 28 62 26C50 20 46 12 48 3C40 6 32 12 22 18Q16 20 13 22.4Z" fill={b}/>
  <path d="M56 25L60 23L62 26ZM56 31L60 33L62 30Z" fill={d}/>
  {!x.h&&<><Ln d="M18 22Q26 28 18 34" c={dark(x.b0,.25)} w={.9}/><circle cx={17} cy={23.4} r={1.3} fill={D}/><circle cx={17} cy={32.6} r={1.3} fill={D}/><Ln d="M24 28C34 28 46 28 58 28" c={mix(x.b0,'#ffffff',.2)} w={1.4} o={.6}/></>}</g>;
 return <g>
  <path d="M56 28C66 28 78 29 91 27" fill="none" stroke={d} strokeWidth={1.8} strokeLinecap="round"/>
  {!x.h?<Ln d="M66 26.6l1.4 1.4M68 26.6l1.4 1.4M70 26.6l1.4 1.4M72 26.8l1.4 1.4M66 26.8L76 26.8" c="#e8e0c8" w={.8}/>:<path d="M64 27L76 26.4L76 27.6Z" fill={SIL2}/>}
  <path d="M10 28C10 18 22 8 36 5C48 6 58 18 62 28C58 38 48 50 36 51C22 48 10 38 10 28Z" fill={b}/>
  <path d="M56 22L64 25.6L58 28L64 30.4L56 34Z" fill={d}/>
  {!x.h&&<><ellipse cx={30} cy={28} rx={12} ry={9} fill="#ffffff" opacity={.1}/><circle cx={21} cy={23.4} r={1.5} fill={D}/><circle cx={21} cy={32.6} r={1.5} fill={D}/><circle cx={24.6} cy={22.6} r={1} fill={dark(x.b0,.3)}/><circle cx={24.6} cy={33.4} r={1} fill={dark(x.b0,.3)}/>
   <Dots pts={[[30,24],[30,32],[34,22],[34,34]]} r={.9} c="#f2ead6"/><Ln d="M42 28L56 28" c={dark(x.b0,.25)} w={1} o={.5}/></>}</g>;}
function eel(x:X){const w=(t:number)=>t<.1?6+t*30:Math.max(1.2,9*Math.max(0,1-(t-.1)/.9)**.8);const fw=(t:number)=>t<.35?0:w(t)+Math.min(3.4,(t-.35)*12);const b=x.c(x.b0);return <g>
 <path d={ribbon(EEL.slice(13),t=>fw(.35+t*.65))} fill={x.c(dark(x.b0,.12))}/>
 <path d={ribbon(EEL,w)} fill={b}/><circle cx={12} cy={EEL[0][1]} r={3.1} fill={b}/>
 {!x.h&&<path d={ribbon(EEL.slice(2,30).map(([a,c])=>[a,c+1.6] as Pt),t=>2.2*(1-t)+.4)} fill={x.l0} opacity={.75}/>}
 <path d={finD(21,EEL[5][1]+1,23,25,EEL[5][1]+5,'r')} fill={x.c(dark(x.b0,.1))}/>
 {!x.h&&<><circle cx={14.4} cy={EEL[0][1]-1.4} r={1.4} fill={W}/><circle cx={14.2} cy={EEL[0][1]-1.4} r={.75} fill={D}/></>}
 <Ln d={`M9.6 ${r1(EEL[0][1]+.8)}l4 .6`} c={x.k} w={.9}/></g>;}
function seahorse(x:X,id:string){const b=x.c(x.b0),d=x.c(dark(x.b0,.15)),pac=id==='pacific-seahorse';return <g>
 <path d="M51 22Q60 23 60.6 30Q58 33.6 50.6 33Z" fill={d}/>
 <path d={ribbon(SEAHORSE,SH_W)} fill={b}/>
 {!x.h&&<path d={ribbon(SEAHORSE.slice(3,13).map(([a,c])=>[a-3.6,c] as Pt),t=>3.4*Math.sin(Math.PI*(t*.9+.05)))} fill={x.l0} opacity={.8}/>}
 <Ln d={SEAHORSE.slice(3,27).filter((_,i)=>i%2===0).map((q,j)=>{const i=3+j*2,[nx,ny]=nrm(SEAHORSE,i),h=SH_W(i/(SEAHORSE.length-1))/2;return `M${r1(q[0]+nx*h)} ${r1(q[1]+ny*h)}L${r1(q[0]-nx*h)} ${r1(q[1]-ny*h)}`;}).join('')} c={x.h?SIL2:dark(x.b0,.3)} w={.7} o={.7}/>
 <path d="M42 8C46 5 52 7 52 12C52 17 48 19 44 18L40 16Q35 16.6 28 18.6Q26.6 16.6 28 14.8Q35 13.4 39.6 12.6Z" fill={b}/>
 <path d="M43 7L44 2.6L45.6 5.6L47.4 2L48.4 6L50.6 3.6L50.4 8Z" fill={d}/>
 {!x.h&&<><circle cx={45} cy={11.4} r={1.9} fill={W}/><circle cx={44.6} cy={11.4} r={1} fill={D}/>{pac?<Ln d="M48 22l4 2M47 30l5 1M46 37l4 .4M50 16l3 1" c="#ffffff" w={.7} o={.8}/>:<Dots pts={[[50,22],[53,27],[49,31],[52,35],[46,40],[54,18]]} r={.75} c="#ffffff"/>}</>}
</g>;}
function shell(x:X,id:string){const b=x.c(x.b0),l=x.c(x.l0),k=x.k;
 if(id==='mussel')return <g>
  {!x.h&&<Ln d="M34 40q-2 6-6 10M36 40q0 6-2 10M38 40q2 5 2 9" c="#8a7a50" w={.7}/>}
  <path d="M12 32C14 24 30 13 54 10C70 8 84 14 82 23C80 31 64 40 40 42C24 44 11 40 12 32Z" fill={b}/>
  {!x.h&&<><Ln d="M16 32C20 26 34 18 52 15C66 13 76 16 77 22M22 34C28 28 40 23 54 21C64 20 70 22 71 25M30 36C36 32 46 29 56 28" c="#4a5a7a" w={.8} o={.8}/><Ln d="M20 30C30 22 46 16 62 14" c="#6f88b8" w={2} o={.45}/></>}
  <Ln d="M12 32C26 34 50 32 82 23" c={k} w={.9} o={.5}/></g>;
 if(id==='pearl-oyster')return <g>
  <path d="M18 26C16 12 30 2 46 3C62 4 76 12 74 24L46 28Z" fill={x.c(dark(x.b0,.1))}/>
  {!x.h&&<Ln d="M46 27L30 8M46 27L46 4M46 27L62 8M46 27L72 18M46 27L20 18" c={mix(x.b0,'#ffffff',.25)} w={.8} o={.7}/>}
  <path d="M16 32C16 44 30 53 46 53C62 53 76 44 76 32C76 28 70 26 46 26C22 26 16 28 16 32Z" fill={b}/>
  <path d="M21 32C21 41 32 48 46 48C60 48 71 41 71 32C71 30 64 29 46 29C28 29 21 30 21 32Z" fill={l}/>
  {!x.h&&<><path d="M24 33C26 40 36 45 46 45C56 45 66 40 68 33" fill="none" stroke="#c9d8ef" strokeWidth={2.2} opacity={.7}/><path d="M26 34C30 39 38 42 46 42" fill="none" stroke="#e8c9e8" strokeWidth={1.6} opacity={.7}/>
   <ellipse cx={46} cy={40.6} rx={5.6} ry={1.6} fill="#000000" opacity={.12}/><circle cx={46} cy={36.4} r={4.6} fill="#fbf8f2"/><circle cx={44.4} cy={34.8} r={1.4} fill="#ffffff"/><circle cx={47.4} cy={38} r={2.4} fill="#e9e1f2" opacity={.6}/></>}</g>;
 return <g><path d={OYSTER[0]} fill={x.c(dark(x.b0,.12))}/><path d={OYSTER[1]} fill={b}/><path d={OYSTER[2]} fill={x.c(mix(x.b0,x.l0,.45))}/>
  {!x.h&&<><Ln d="M18 30Q26 34 34 30M60 18q6 4 4 10M28 42q8 2 14-1M64 38q4-4 8-3" c={dark(x.b0,.25)} w={.9} o={.7}/><ellipse cx={52} cy={29} rx={6} ry={3.4} fill={x.l0} opacity={.7}/></>}
  <path d="M16 30L10 29L15 27Z" fill={x.c(dark(x.b0,.2))}/></g>;}

/** Fallback drawing per body shape (new species without their own art yet). */
function byShape(x:X,shape:string,id:string):R{
 switch(shape){
  case 'shrimp':return shrimp(x);
  case 'octopus':return octopus(x);
  case 'squid':return squid(x);
  case 'crab':return crab(x,id);
  case 'lobster':return lobster(x);
  case 'ray':return ray(x,id);
  case 'eel':return eel(x);
  case 'seahorse':return seahorse(x,id);
  case 'shell':return shell(x,id);
  case 'hammerhead':return ART.hammerhead(x);
  case 'shark':return ART.shark(x);
  case 'billfish':return ART.swordfish(x);
  case 'angler':return ART.anglerfish(x);
  case 'mola':return ART['ocean-sunfish'](x);
  case 'long':return ART.tuna(x);
  case 'round':return ART['sea-bass'](x);
  default:return ART.sardine(x);
 }
}
const BY_SHAPE_ONLY=new Set(['shrimp','octopus','squid','crab','lobster','ray','eel','seahorse','shell']);

export default function FishArt({fish,hidden=false,size=96}:{fish:FishSpecies;hidden?:boolean;size?:number}){
 const x:X={h:hidden,b0:fish.color,l0:fish.belly,c:col=>hidden?SIL:col,k:hidden?SIL2:INK};
 const own=BY_SHAPE_ONLY.has(fish.shape)?undefined:ART[fish.id];
 const art=own?own(x):byShape(x,fish.shape,fish.id);
 return <svg viewBox="0 0 92 56" width={size} height={size*56/92} role="img" aria-label={hidden?'Not caught yet':fish.name}>{art}</svg>;
}
