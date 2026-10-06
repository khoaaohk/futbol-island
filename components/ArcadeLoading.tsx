'use client';
import styles from './ArcadeLoading.module.css';

/**
 * The arcade loading room, drawn in the floor's own perspective (Oct 5 2026, user: "fix the perspective of these machines").
 * The floor quad is the room; every cabinet is a real box on that floor, projected through the same floor homography, with
 * vertical edges kept vertical and height scaled by the local depth. Visible faces only, painted back to front.
 * Floor coordinates: (a,b) in [0,1]², a from the back corner toward the right wall's end, b toward the left wall's end.
 */
type P=[number,number];
const BACK:P=[381,190],RIGHT:P=[719,274],LEFT:P=[56,270],FRONT:P=[409,407];
/** Homography from the unit square (0,0)=back,(1,0)=right,(0,1)=left,(1,1)=front to the floor quad. */
const H=(()=>{const [x0,y0]=BACK,[x1,y1]=RIGHT,[x2,y2]=FRONT,[x3,y3]=LEFT;
 const dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2,sx=x0-x1+x2-x3,sy=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
 const g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den;
 return {a:x1-x0+g*x1,b:x3-x0+h*x3,c:x0,d:y1-y0+g*y1,e:y3-y0+h*y3,f:y0,g,h};})();
const floor=(a:number,b:number):P=>{const w=H.g*a+H.h*b+1;return [(H.a*a+H.b*b+H.c)/w,(H.d*a+H.e*b+H.f)/w];};
/** Pixels per floor unit at a point (local scale), so a cabinet's height shrinks with distance like its footprint. */
const scaleAt=(a:number,b:number)=>{const e=.01,p=floor(a,b),pa=floor(a+e,b),pb=floor(a,b+e);return Math.sqrt(Math.abs((pa[0]-p[0])*(pb[1]-p[1])-(pa[1]-p[1])*(pb[0]-p[0])))/e;};
type V=[number,number,number];// (a, b, height in floor units)
const proj=([a,b,h]:V):P=>{const p=floor(a,b);return [p[0],p[1]-h*scaleAt(a,b)];};
const path=(pts:P[])=>'M'+pts.map(p=>p.map(n=>n.toFixed(1)).join(' ')).join('L')+'Z';
const lerp=(p:P,q:P,t:number):P=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
/** A point on a face quad (tl,tr,br,bl) at (u,v) in [0,1]² (bilinear: exact enough for these small faces). */
const onFace=(q:P[],u:number,v:number)=>lerp(lerp(q[0],q[1],u),lerp(q[3],q[2],u),v);
const sub=(q:P[],u0:number,v0:number,u1:number,v1:number)=>[onFace(q,u0,v0),onFace(q,u1,v0),onFace(q,u1,v1),onFace(q,u0,v1)];
/** SVG matrix that maps a 100×20 box onto a quad's top edge and left edge (for the marquee text). */
const textMatrix=(q:P[])=>{const [tl,tr,,bl]=q;return `matrix(${((tr[0]-tl[0])/100).toFixed(4)} ${((tr[1]-tl[1])/100).toFixed(4)} ${((bl[0]-tl[0])/20).toFixed(4)} ${((bl[1]-tl[1])/20).toFixed(4)} ${tl[0].toFixed(1)} ${tl[1].toFixed(1)})`;};

/**
 * A cabinet: footprint centred at (a,b), facing `face` (unit floor direction toward the visitor side), width w, depth d, height h.
 * Returns the projected faces: front (the screen side), the visible side and the top.
 */
function cabinet(a:number,b:number,face:[number,number],w:number,d:number,h:number){
 const [fa,fb]=face,ra=fb,rb=-fa;// right-hand direction along the front, seen from the front
 const c=(s:number,t:number,z:number):V=>[a+ra*s*w/2+fa*t*d/2,b+rb*s*w/2+fb*t*d/2,z];
 const front=[c(-1,1,h),c(1,1,h),c(1,1,0),c(-1,1,0)].map(proj);// tl,tr,br,bl as seen from the front
 const top=[c(-1,-1,h),c(1,-1,h),c(1,1,h),c(-1,1,h)].map(proj);
 // The side we can see: the one whose outward normal points more toward the front corner (+a,+b).
 const rightVisible=ra+rb>-(ra+rb)?true:false;
 const s=rightVisible?1:-1;
 const side=[c(s,1,h),c(s,-1,h),c(s,-1,0),c(s,1,0)].map(proj);
 return {front,top,side,depthKey:floor(a,b)[1]};
}
type Spec={title:string;color:string;a:number;b:number;face:[number,number]};
const R2=Math.SQRT1_2;
// Left machine against the left wall facing right (+a); middle one in the back corner facing the room; right one against the
// right wall facing left (+b). Footprints in floor units; height chosen so the cabinets read like the island's arcade.
const SPECS:Spec[]=[
 {title:'STRIKERS',color:'#ff65c8',a:.13,b:.58,face:[1,0]},
 {title:'TENNIS',color:'#b991ff',a:.17,b:.17,face:[R2,R2]},
 {title:'PINBALL',color:'#60e9f2',a:.58,b:.13,face:[0,1]},
];
const MACHINES=SPECS.map(s=>({...s,...cabinet(s.a,s.b,s.face,.17,.11,.62)})).sort((p,q)=>p.depthKey-q.depthKey);

function Machine({m,index}:{m:typeof MACHINES[number];index:number}){
 const f=m.front,marquee=sub(f,.07,.05,.93,.16),bezel=sub(f,.08,.21,.92,.52),screen=sub(f,.16,.26,.84,.47);
 const panel=sub(f,.04,.55,.96,.66),door=sub(f,.2,.74,.8,.88),slot=sub(f,.42,.79,.58,.81);
 const sc=(u:number,v:number)=>onFace(screen,u,v),stick=onFace(panel,.25,.45),b1=onFace(panel,.62,.55),b2=onFace(panel,.8,.5);
 return <g className={styles.machine} data-arcade-loading-machine={index}>
  <path d={path(m.side)} fill="#102022"/>
  <path d={path(m.top)} fill="#1b3336"/>
  <path d={path(f)} fill="#21162e" stroke={m.color} strokeWidth="2" strokeLinejoin="round"/>
  <path d={path(marquee)} fill="#162e31"/>
  <g transform={textMatrix(marquee)}><text x="50" y="14" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff0cb">{m.title}</text></g>
  <path d={path(bezel)} fill="#071e23" stroke={m.color} strokeWidth="2.5" strokeLinejoin="round"/>
  <path d={path(screen)} fill="#4c8072"/>
  <path d={`M${sc(.5,.1).join(' ')}L${sc(.48,.9).join(' ')}M${sc(.1,.55).join(' ')}L${sc(.9,.45).join(' ')}`} fill="none" stroke="#b6d6aa" strokeWidth="1.3"/>
  <circle cx={sc(.35,.6)[0]} cy={sc(.35,.6)[1]} r="3.4" fill="#ebc35d"/><circle cx={sc(.68,.3)[0]} cy={sc(.68,.3)[1]} r="3.4" fill="#e59a83"/><circle cx={sc(.5,.72)[0]} cy={sc(.5,.72)[1]} r="1.8" fill="#fff2d2"/>
  <path d={path(panel)} fill="#655076"/>
  <path d={`M${stick[0]} ${stick[1]}v-11`} stroke="#182a2e" strokeWidth="3.5"/><circle cx={stick[0]} cy={stick[1]-12} r="4.5" fill="#e78c77"/>
  <circle cx={b1[0]} cy={b1[1]} r="3.6" fill="#df906c"/><circle cx={b2[0]} cy={b2[1]} r="3.6" fill="#749ba9"/>
  <path d={path(door)} fill="#1d3839"/><path d={path(slot)} fill="#e4c369"/>
 </g>;
}
/** Static SVG illustration: no game engine, audio, preview scenes or animation loop. No characters (user, Oct 4 2026). */
export default function ArcadeLoading({exiting=false}:{exiting?:boolean}){
 return <div className={`${styles.screen} ${exiting?styles.exiting:''}`} data-arcade-loading role="status" aria-label="Loading the arcade">
  <div className={styles.copy}><h2>Arcade</h2><span className="island-loading-track" aria-hidden="true"><span/></span></div>
  <svg className={styles.art} viewBox="0 0 760 440" role="img" aria-label="Colorful football arcade machines" xmlns="http://www.w3.org/2000/svg">
   <g className={styles.scenery}><path d="M56 270 381 190 719 274 409 407Z" fill="#251a3b"/><path d="m56 270 353 137v18L56 288Zm353 137 310-133v17L409 425Z" fill="#122c30"/>
   <path d="m120 288 280 100m-195-126 280 90m-192-112 280 86m-191-108 280 83" stroke="#563b70" strokeWidth="2"/>
   </g>
   {MACHINES.map(m=><Machine key={m.title} m={m} index={SPECS.findIndex(s=>s.title===m.title)}/>)}
   <g className={styles.scenery}><path d="m92 90 112-27m299 0 127 32" stroke="#60e9f2" strokeWidth="4" strokeLinecap="round" opacity=".55"/>
   <g fill="#f2d086"><circle cx="257" cy="87" r="4"/><circle cx="465" cy="87" r="4"/><circle cx="86" cy="135" r="3"/><circle cx="650" cy="145" r="3"/></g></g>
  </svg>
 </div>;
}
