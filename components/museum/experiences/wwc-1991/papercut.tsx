/**
 * Paper-cut (剪纸 jianzhi) motifs for wwc-1991, generated as SVG paths (Oct 9 2026 restyle). Original artwork, built from the
 * craft's real techniques rather than copied pictures:
 *  - every shape is ONE sheet with holes cut out (fill-rule evenodd), and every island stays joined to the sheet by a bridge,
 *    the way a real cut has to hold together when you lift it;
 *  - 锯齿纹 sawtooth: rows of thin triangular cuts and toothed edges;
 *  - 月牙纹 crescent ("moon tooth"): small moon-shaped cuts, the basic mark of the scissors;
 *  - folded symmetry: a window-flower (窗花) medallion is one wedge repeated around the centre, as if cut from paper folded n times.
 * Sheets sit on a cream ground with a soft shadow between layers (CSS), like stacked paper. All static: drawn once, no loop.
 */
import type {CSSProperties} from 'react';

const f=(n:number)=>Math.round(n*100)/100;
const pt=(x:number,y:number)=>`${f(x)} ${f(y)}`;

/** A closed toothed ring (the outer edge of a sheet): n teeth between radius r and r - depth. */
export function sawRing(cx:number,cy:number,r:number,depth:number,n:number){
 let d='';for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2,rr=i%2?r-depth:r;d+=(i?'L':'M')+pt(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}return d+'Z';
}
/** A crescent cut: centre (cx, cy), radius r, bulging toward angle `ang`; t = how thick the moon is (0..1). */
export function crescent(cx:number,cy:number,r:number,ang:number,t=.45){
 const px=-Math.sin(ang),py=Math.cos(ang),s=(1-t)*r,R=(r*r+s*s)/(2*s);
 const a=pt(cx+px*r,cy+py*r),b=pt(cx-px*r,cy-py*r);
 return `M${a}A${f(r)} ${f(r)} 0 0 0 ${b}A${f(R)} ${f(R)} 0 0 1 ${a}Z`;
}
/** A lens (two arcs) between radius r0 and r1 along angle `ang`, `w` wide: the petal cut. */
function lens(cx:number,cy:number,r0:number,r1:number,ang:number,w:number){
 const c=Math.cos(ang),s=Math.sin(ang),a=pt(cx+c*r0,cy+s*r0),b=pt(cx+c*r1,cy+s*r1),L=(r1-r0)/2,R=(L*L+w*w/4)/w;
 return `M${a}A${f(R)} ${f(R)} 0 0 1 ${b}A${f(R)} ${f(R)} 0 0 1 ${a}Z`;
}
/** A small triangle cut pointing outward (one tooth of a sawtooth row). */
function tooth(cx:number,cy:number,r:number,ang:number,h:number,w:number){
 const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c;
 return `M${pt(cx+c*r+px*w/2,cy+s*r+py*w/2)}L${pt(cx+c*(r+h),cy+s*(r+h))}L${pt(cx+c*r-px*w/2,cy+s*r-py*w/2)}Z`;
}
function circle(cx:number,cy:number,r:number){return `M${pt(cx-r,cy)}a${f(r)} ${f(r)} 0 1 0 ${f(r*2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r*2)} 0Z`;}
function pentagon(cx:number,cy:number,r:number,rot=-Math.PI/2){let d='';for(let i=0;i<5;i++){const a=rot+i/5*Math.PI*2;d+=(i?'L':'M')+pt(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}return d+'Z';}

/** The window-flower medallion: n-fold, a toothed rim, crescents, petal lenses, a sawtooth row and a football cut at the heart. */
export function medallionPath(r:number,n=12){
 const parts=[sawRing(0,0,r,r*.05,n*5)];
 for(let k=0;k<n;k++){const a=k/n*Math.PI*2-Math.PI/2,h=a+Math.PI/n;
  parts.push(crescent(Math.cos(a)*r*.8,Math.sin(a)*r*.8,r*.075,a,.5));
  parts.push(circle(Math.cos(h)*r*.83,Math.sin(h)*r*.83,r*.022));
  parts.push(lens(0,0,r*.43,r*.66,a,r*.1));
  parts.push(tooth(0,0,r*.3,a,r*.07,r*.06),tooth(0,0,r*.3,h,r*.07,r*.06));}
 parts.push(...ballCut(r*.22));
 return parts.join('');
}
/** A football drawn by cutting: a centre pentagon and five half-pentagons at the rim (no loose islands). */
export function ballCut(r:number){
 const out=[pentagon(0,0,r*.36)];
 for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*Math.PI*2+Math.PI/5;out.push(pentagon(Math.cos(a)*r*.86,Math.sin(a)*r*.86,r*.2,a+Math.PI));}
 return out;
}
/** A five-point paper star with a crescent and a dot cut into it. */
export function starPath(r:number){
 let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*Math.PI*2,rr=i%2?r*.45:r;d+=(i?'L':'M')+pt(Math.cos(a)*rr,Math.sin(a)*rr);}d+='Z';
 return d+crescent(0,r*.02,r*.22,-Math.PI/2,.42)+circle(0,r*.2,r*.07);
}

/** A sheet of paper cut as a medallion. `className` sets fill / shadow (CSS). */
export function Medallion({r=50,n=12,className,style}:{r?:number;n?:number;className?:string;style?:CSSProperties}){
 return <svg className={className} style={style} viewBox={`${-r-2} ${-r-2} ${r*2+4} ${r*2+4}`} aria-hidden="true"><path d={medallionPath(r,n)} fillRule="evenodd"/></svg>;
}

/** A strip with toothed top and bottom edges and a row of crescents cut along it (the ban "shutters", the banners). */
export function stripPath(w:number,h:number,teeth=Math.max(4,Math.round(w/6))){
 const tw=w/teeth,dh=Math.min(h*.18,2.4);let d=`M0 ${f(dh)}`;
 for(let i=0;i<teeth;i++)d+=`L${f(i*tw+tw/2)} 0L${f((i+1)*tw)} ${f(dh)}`;
 d+=`L${f(w)} ${f(h-dh)}`;for(let i=teeth;i>0;i--)d+=`L${f(i*tw-tw/2)} ${f(h)}L${f((i-1)*tw)} ${f(h-dh)}`;d+='Z';
 const n=Math.max(1,Math.floor(w/(h*1.1)));for(let i=0;i<n;i++){const cx=(i+.5)*w/n;d+=crescent(cx,h/2,h*.22,i%2?Math.PI/2:-Math.PI/2,.5);}
 return d;
}

/** A bean character cut from paper (the game's proportions): head, body, a sawtooth collar and a cut number. `team` sets fill. */
export function BeanCut({fill,edge='#fff7e6',label}:{fill:string;edge?:string;label?:string}){
 // Drawn around the feet at (0, 0), about 5 units tall.
 const body='M-1.35 -.3C-1.5 -1.9 -1.25 -3.1 0 -3.15C1.25 -3.1 1.5 -1.9 1.35 -.3C1.2 .15 -1.2 .15 -1.35 -.3Z';
 const collar=[0,1,2,3].map(i=>tooth(-0.6+i*.4,-2.85,0,Math.PI/2,.32,.28)).join('');
 return <g>
  <ellipse cx={0} cy={.05} rx={1.5} ry={.45} fill="#3a1d0e" opacity={.22}/>
  <path d={body+circle(0,-3.95,1.02)} fill={edge} transform="translate(0 -2) scale(1.12) translate(0 2)"/>
  <path d={body+collar} fill={fill} fillRule="evenodd"/>
  <circle cx={0} cy={-3.95} r={1} fill={fill}/>
  <path d={crescent(-.36,-4.05,.17,Math.PI/2,.55)+crescent(.36,-4.05,.17,Math.PI/2,.55)} fill={edge}/>
  {label&&<text x={0} y={-1.15} textAnchor="middle" fontSize={1.35} fontFamily="var(--poster)" fill={edge}>{label}</text>}
 </g>;
}
