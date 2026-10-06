/**
 * Twelve football figures in Hairline's language (rules from hairline.lucasmarkes.com/inspo: one stroke weight, bright outside
 * and dim inside, round every corner then draw less, no words inside a figure, a designed resting pose, and a response to the
 * pointer that falls off with distance). Each is keyed by the museum case it stands for (lib/endgame/museum.ts).
 */
import {circ,clamp,fillet,hull,lerp,mk,open,poly,prism,put,r2,rad,rings,rrect,run,seg,solid,
 type Proj,type Pt,type RingPt,type Solid,type V3} from './engine';
import type {Ctx,FigureDef} from './figure';

// ---- shared shapes ----
const box=(P:Proj,front:(q:RingPt)=>boolean,x0:number,y0:number,x1:number,y1:number,z0:number,z1:number,r=1.4,b=.7):Solid=>{
 const [o,i]=rings(x0,y0,x1,y1,r,b);return prism(P,front,o,i,z0,z1);};
const cyl=(P:Proj,front:(q:RingPt)=>boolean,R:number,cx:number,cy:number,z0:number,z1:number,inset=0,n=40)=>
 prism(P,front,circ(R,n,cx,cy),inset?circ(R-inset,n,cx,cy):null,z0,z1);
/** A tapered solid: the hull of a ring at z0 and another at z1, with the inner ring's front run as the crease. */
function frustum(P:Proj,front:(q:RingPt)=>boolean,a:readonly RingPt[],za:number,b:readonly RingPt[],zb:number,inner?:readonly RingPt[]):Solid{
 return {sil:poly(hull(a.map(q=>P(q.u,q.v,za)).concat(b.map(q=>P(q.u,q.v,zb))))),crease:inner?open(run(inner,front).map(q=>P(q.u,q.v,zb))):''};
}
/** An upright panel in the x–z plane, from y0 (back) to y1 (the face toward the eye), rounded in its own plane. */
function panel(P:Proj,x0:number,z0:number,x1:number,z1:number,y0:number,y1:number,r=1.4,b=1.2):Solid{
 const ring=rrect(x0,z0,x1,z1,r),inner=rrect(x0+b,z0+b,x1-b,z1-b,Math.max(.3,r-b));
 return {sil:poly(hull(ring.map(q=>P(q.u,y0,q.v)).concat(ring.map(q=>P(q.u,y1,q.v))))),crease:poly(inner.map(q=>P(q.u,y1,q.v)))};
}
/** A thin cut-out (any outline in x–z) seen as two faces: the back peeks out as the plate's thickness. */
function cutout(P:Proj,outline:readonly Pt[],y0:number,y1:number){return {back:poly(outline.map(([x,z])=>P(x,y0,z))),face:poly(outline.map(([x,z])=>P(x,y1,z)))};}
const ring2=(c:Pt,rx:number,ry=rx,n=40):Pt[]=>Array.from({length:n},(_,k)=>{const a=k/n*Math.PI*2;return [c[0]+rx*Math.cos(a),c[1]+ry*Math.sin(a)];});
const lineOf=(P:Proj,pts:readonly V3[])=>open(pts.map(p=>P(p[0],p[1],p[2])));
const circleOn=(P:Proj,cx:number,cy:number,z:number,R:number,n=36)=>poly(Array.from({length:n},(_,k)=>{const a=k/n*Math.PI*2;return P(cx+R*Math.cos(a),cy+R*Math.sin(a),z);}));
/** A ball seen whole: a disc of radius R·S, and Hairline's dim gleam on its upper left. */
function ball(c:Ctx,center:V3,R:number){const q=c.P(...center),r=R*c.C.S;
 return {sil:poly(ring2(q,r,r,48)),gleam:open(Array.from({length:9},(_,k)=>{const a=rad(205+k*9);return [q[0]+r*.64*Math.cos(a),q[1]+r*.64*Math.sin(a)] as Pt;}))};}
const sparkle=(q:Pt,r:number)=>poly([[q[0],q[1]-r],[q[0]+r*.32,q[1]-r*.32],[q[0]+r,q[1]],[q[0]+r*.32,q[1]+r*.32],[q[0],q[1]+r],[q[0]-r*.32,q[1]+r*.32],[q[0]-r,q[1]],[q[0]-r*.32,q[1]-r*.32]]);

// ---- a turning sphere (laced ball, Telstar) ----
type U3=[number,number,number];
const norm=(v:U3):U3=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};
const dot3=(a:U3,b:U3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
/** Turn about z by `spin`, then tip toward the eye about the screen's horizontal axis (camera azimuth `az`) by `tip`. */
function turner(spin:number,tip:number,az:number){
 const cs=Math.cos(spin),ss=Math.sin(spin),h:U3=[Math.cos(az),-Math.sin(az),0],ct=Math.cos(tip),st=Math.sin(tip);
 return (v:U3):U3=>{const a:U3=[v[0]*cs-v[1]*ss,v[0]*ss+v[1]*cs,v[2]];const hv=dot3(h,a),cr:U3=[h[1]*a[2]-h[2]*a[1],h[2]*a[0]-h[0]*a[2],h[0]*a[1]-h[1]*a[0]];
  return [a[0]*ct+cr[0]*st+h[0]*hv*(1-ct),a[1]*ct+cr[1]*st+h[1]*hv*(1-ct),a[2]*ct+cr[2]*st+h[2]*hv*(1-ct)];};
}
/** The visible runs of curves drawn on a sphere's surface. */
function surface(P:Proj,center:V3,R:number,turn:(v:U3)=>U3,view:V3,curves:readonly U3[][],cut=.04){
 let d='';for(const cv of curves){let runPts:Pt[]=[];
  for(const u of cv){const n=turn(u);if(dot3(n,view as U3)>cut)runPts.push(P(center[0]+n[0]*R,center[1]+n[1]*R,center[2]+n[2]*R));else{if(runPts.length>1)d+=open(runPts);runPts=[];}}
  if(runPts.length>1)d+=open(runPts);}
 return d;
}
const arc=(a:U3,b:U3,n=6):U3[]=>Array.from({length:n+1},(_,k)=>norm([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n),lerp(a[2],b[2],k/n)]));

/** The 1970 ball: a truncated icosahedron (12 pentagons, 20 hexagons), on the unit sphere. */
const TELSTAR=(()=>{const f=(1+Math.sqrt(5))/2,V:U3[]=[];
 for(const s1 of [-1,1])for(const s2 of [-1,1]){V.push([0,s1,s2*f],[s1,s2*f,0],[s2*f,0,s1]);}
 const E:[number,number][]=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const d=Math.hypot(V[i][0]-V[j][0],V[i][1]-V[j][1],V[i][2]-V[j][2]);if(Math.abs(d-2)<1e-6)E.push([i,j]);}
 const near=(a:U3,b:U3):U3=>norm([a[0]+(b[0]-a[0])/3,a[1]+(b[1]-a[1])/3,a[2]+(b[2]-a[2])/3]);
 const pents=V.map((v,i)=>{const ring=E.filter(e=>e.includes(i)).map(e=>near(v,V[e[0]===i?e[1]:e[0]]));const c=norm(v);
  const r0=ring[0],k0=dot3(r0,c),ref=norm([r0[0]-c[0]*k0,r0[1]-c[1]*k0,r0[2]-c[2]*k0]),side:U3=[c[1]*ref[2]-c[2]*ref[1],c[2]*ref[0]-c[0]*ref[2],c[0]*ref[1]-c[1]*ref[0]];
  ring.sort((p,q)=>Math.atan2(dot3(p,side),dot3(p,ref))-Math.atan2(dot3(q,side),dot3(q,ref)));return {c,ring};});
 const seams:U3[][]=[];for(const p of pents)for(let k=0;k<5;k++)seams.push(arc(p.ring[k],p.ring[(k+1)%5],3));
 for(const [i,j] of E)seams.push(arc(near(norm(V[i]),V[j]),near(norm(V[j]),V[i]),4));
 return {pents,seams};})();
/** The old laced ball: eighteen leather strips in six groups of three (cube faces), and a laced slit on top. */
const LACED=(()=>{const P=(ax:number,s:number,t:number):U3=>norm(ax===0?[1,s,t]:ax===1?[t,1,s]:ax===2?[s,t,1]:ax===3?[-1,s,t]:ax===4?[t,-1,s]:[s,t,-1]);
 const line=(ax:number,from:[number,number],to:[number,number],n=10):U3[]=>Array.from({length:n+1},(_,k)=>P(ax,lerp(from[0],to[0],k/n),lerp(from[1],to[1],k/n)));
 const seams:U3[][]=[];
 for(let ax=0;ax<6;ax++){for(const e of [-1,1]){seams.push(line(ax,[e,-1],[e,1]));}
  // two dividers per face, turning a quarter on each face so the strips weave like the old balls
  for(const e of [-1/3,1/3])seams.push(ax%3===0?line(ax,[-1,e],[1,e]):ax%3===1?line(ax,[e,-1],[e,1]):line(ax,[-1,e],[1,e]));}
 const lace:U3[][]=[line(2,[-.62,0],[.62,0],8)];for(let k=0;k<7;k++){const s=-.5+k/6;lace.push(line(2,[s,-.13],[s,.13],2));}
 return {seams,lace};})();

// ---- the figures ----
export const FIGURES:Readonly<Record<string,FigureDef>>={
 // 1863: a bound book of rules. The pointer's height lifts its cover; the pages inside are ruled, with no words.
 'laws-1863':{label:'A bound rulebook on a plate. Raise the pointer and its cover opens on ruled pages.',plate:[30,24],
  bounds:[[-25,-18,0],[25,18,0],[-25,-18,52],[25,18,9]],yaw:16,lift:6,shadow:22,
  build(g){const back=solid(g),pages=solid(g),edges=mk('path',{class:'nf lo'},g),rules=mk('path',{class:'nf'},g),ribbon=mk('path',{class:'nf'},g),
   cover=solid(g,'key'),panelEl=mk('path',{class:'nf lo'},g),seal=mk('path',{class:'nf key'},g);
   const cring=rrect(0,-18,50,18,1.6),cinner=rrect(5,-13,45,13,1.2);
   return c=>{const {P,front}=c;
    put(back,box(P,front,-25,-18,25,18,0,1.6,1.6,.6));put(pages,box(P,front,-24,-17,23.5,17,1.6,8,1,.5));
    edges.setAttribute('d',[2.9,4.2,5.5,6.8].map(z=>seg(P(23.5,-16,z),P(23.5,16,z))+seg(P(-23,17,z),P(22.5,17,z))).join(''));
    rules.setAttribute('d',[-12,-8,-4,0,4,8,12].map((y,i)=>seg(P(-19,y,8),P(i===6?2:18,y,8))).join(''));
    ribbon.setAttribute('d',lineOf(P,[[12,17.1,8],[12.6,17.2,1.2],[14,21,0]]));
    const th=rad(clamp(c.rise*6+c.near*(34-c.ay*40),0,78)),ct=Math.cos(th),st=Math.sin(th);
    const at=(u:number,y:number,dz:number):Pt=>P(-25+u*ct-dz*st,y,8+u*st+dz*ct);
    put(cover,{sil:poly(hull(cring.map(q=>at(q.u,q.v,0)).concat(cring.map(q=>at(q.u,q.v,1.6))))),crease:''});
    panelEl.setAttribute('d',poly(cinner.map(q=>at(q.u,q.v,1.6))));
    seal.setAttribute('d',poly(ring2([27,0],6.5).map(([u,y])=>at(u,y,1.6)))+poly(ring2([27,0],3.4).map(([u,y])=>at(u,y,1.6))));};}},

 // 1891: the penalty mark and a goal. The ball lifts from the mark and a dashed line aims where the pointer is.
 'penalty-1891':{label:'A goal, its net, and a ball on the penalty mark. The pointer aims the kick.',plate:[33,29],
  bounds:[[-26,-30,0],[26,18,0],[0,-20,17.2]],yaw:14,lift:5,shadow:0,
  build(g){const ground=mk('path',{class:'nf lo'},g),net=mk('path',{class:'nf lo'},g),postL=solid(g),postR=solid(g),bar=solid(g,'key'),
   spot=mk('path',{class:'dot'},g),aim=mk('path',{class:'nf dash key'},g),b=solid(g);
   return c=>{const {P,front}=c;
    ground.setAttribute('d',seg(P(-30,-20,0),P(30,-20,0))+open([P(-11,-20,0),P(-11,-13,0),P(11,-13,0),P(11,-20,0)])+open([P(-28,-20,0),P(-28,16,0),P(28,16,0),P(28,-20,0)])
     +open(Array.from({length:13},(_,k)=>{const a=rad(30+k*10);return P(10*Math.cos(a),8+10*Math.sin(a),0);})));
    let n='';for(let x=-16;x<=16;x+=6.4)n+=lineOf(P,[[x,-20,16],[x,-27,13],[x,-30,0]]);
    for(const z of [4,8,12]){const y=-30+3*z/13;n+=seg(P(-20,y,z),P(20,y,z));}
    n+=lineOf(P,[[-20,-30,0],[20,-30,0]])+lineOf(P,[[-20,-27,13],[20,-27,13]])+lineOf(P,[[-20,-20,16],[-20,-27,13],[-20,-30,0]])+lineOf(P,[[20,-20,16],[20,-27,13],[20,-30,0]]);
    net.setAttribute('d',n);
    put(postL,cyl(P,front,1.1,-20,-20,0,16));put(postR,cyl(P,front,1.1,20,-20,0,16));put(bar,box(P,front,-21.1,-21.1,21.1,-18.9,15,17.2,1.1,.4));
    spot.setAttribute('d',circleOn(P,0,8,0,1.3,20));
    const hop=2.6+c.near*3.2,from:V3=[0,8,hop],to:V3=[c.ax*17,-20,clamp(8-c.ay*7,2,14)],mid:V3=[(from[0]+to[0])/2,(from[1]+to[1])/2,Math.max(from[2],to[2])+7];
    aim.setAttribute('d',c.near>.04?lineOf(P,Array.from({length:17},(_,k)=>{const t=k/16,w=1-t;return [w*w*from[0]+2*w*t*mid[0]+t*t*to[0],w*w*from[1]+2*w*t*mid[1]+t*t*to[1],w*w*from[2]+2*w*t*mid[2]+t*t*to[2]] as V3;})):'');
    aim.style.opacity=String(r2(c.near));
    const bb=ball(c,from,2.6);put(b,{sil:bb.sil,crease:bb.gleam});};}},

 // 1928: a numbered shirt on a stand. It sways toward the pointer; the 9 is drawn, not written.
 'shirts':{label:'A shirt with a number on a stand. It turns toward the pointer.',plate:[24,20],
  bounds:[[-21,-6,0],[21,6,0],[0,-6,49],[-21,0,31],[21,0,31]],yaw:30,baseYaw:-12,lift:6,shadow:9,
  build(g){const foot=solid(g),post=solid(g),arm=mk('path',{class:'nf sil'},g),hanger=mk('path',{class:'nf sil'},g),back=mk('path',{class:'sil'},g),face=mk('path',{},g),
   trim=mk('path',{class:'nf lo'},g),num=mk('path',{class:'nf key'},g);
   const OUT=fillet([[-5,42],[-13,40],[-21,31],[-16,26.5],[-11,31],[-11,6],[11,6],[11,31],[16,26.5],[21,31],[13,40],[5,42],[0,38.4]],[1,1.4,1,.8,.8,1.2,1.2,.8,.8,1,1.4,1,1.6],3);
   return c=>{const {P,front}=c;
    put(foot,cyl(P,front,6,0,-6,0,1.6,1));put(post,cyl(P,front,1,0,-6,1.6,48));
    arm.setAttribute('d',lineOf(P,[[0,-6,48],[0,0,48],[0,0,44.5]]));
    hanger.setAttribute('d',lineOf(P,[[-13,0,39.6],[0,0,43.6],[13,0,39.6]])+lineOf(P,[[0,0,43.6],[0,0,44.5]]));
    const cut=cutout(P,OUT,-.8,.8);back.setAttribute('d',cut.back);face.setAttribute('d',cut.face);
    trim.setAttribute('d',lineOf(P,[[-5,.85,42],[0,.85,38.4],[5,.85,42]])+lineOf(P,[[-18.4,.85,28.6],[-14.2,.85,24.8]])+lineOf(P,[[18.4,.85,28.6],[14.2,.85,24.8]]));
    num.setAttribute('d',poly(ring2([0,26],4.2,4.6,28).map(([x,z])=>P(x,.9,z)))+lineOf(P,[[4.2,.9,26],[3.6,.9,18],[1.2,.9,14.6],[-3,.9,14.6]]));};}},

 // 1930: a cup on a winged stem, after the first World Cup trophy. It rises and turns to the pointer.
 'worldcup-1930':{label:'A trophy: a cup held up by wings on an eight-sided base.',plate:[20,20],
  bounds:[[-11,-11,0],[11,11,0],[-11,0,38],[11,0,38],[0,-11,38],[0,11,38]],yaw:28,lift:7,shadow:10,
  build(g){const base=solid(g),step=solid(g),stem=solid(g),wb=mk('path',{class:'sil'},g),wf=mk('path',{},g),cup=solid(g,'key'),lip=mk('path',{class:'nf lo'},g);
   const WL:Pt[]=fillet([[-1.4,16],[-5.5,21],[-10,29.5],[-9.4,34.5],[-6,31],[-2.2,25]],[.6,1.5,1.2,1.4,1.2,.8],3),WR=WL.map(([x,z]):Pt=>[-x,z]).reverse();
   return c=>{const {P,front}=c;
    put(base,frustum(P,front,circ(11,8),0,circ(9.4,8),5,circ(8.6,8)));
    put(step,cyl(P,front,6.6,0,0,5,7,.8,32));
    put(stem,frustum(P,front,circ(3.4,24),7,circ(2.2,24),22));
    const l=cutout(P,WL,-.7,.7),r=cutout(P,WR,-.7,.7);wb.setAttribute('d',l.back+r.back);wf.setAttribute('d',l.face+r.face);
    put(cup,frustum(P,front,circ(4.6,8),27,circ(10,8),38,circ(8.8,8)));
    lip.setAttribute('d',poly(circ(8.8,8).map(q=>P(q.u,q.v,38))));};}},

 // Before the 1960s: a laced leather ball of eighteen strips. It turns as the pointer moves across and tips as it moves down.
 'laced-leather':{label:'An old leather ball made of strips, with a laced slit on top. It turns with the pointer.',plate:[20,20],
  bounds:[[-15,-15,1],[15,15,1],[0,0,32]],yaw:0,lift:6,shadow:8,
  build(g){const stand=solid(g),disc=mk('path',{class:'sil'},g),seams=mk('path',{class:'nf'},g),lace=mk('path',{class:'nf key'},g),gleam=mk('path',{class:'nf lo'},g);
   return c=>{const {P,front}=c,center:V3=[0,0,16.2],turn=turner(rad(-20+c.ax*75),rad(-46+c.ay*22),c.C.az);
    put(stand,cyl(P,front,6,0,0,0,2.5,.9));const b=ball(c,center,15);disc.setAttribute('d',b.sil);gleam.setAttribute('d',b.gleam);
    seams.setAttribute('d',surface(P,center,15,turn,c.view,LACED.seams));lace.setAttribute('d',surface(P,center,15.2,turn,c.view,LACED.lace));};}},

 // 1970: two cards in a referee's stand. The one nearer the pointer rises.
 'cards-1970':{label:'A yellow card and a red card in a stand. The card nearer the pointer rises.',plate:[19,13],
  bounds:[[-14,-5,0],[14,5,0],[0,0,33]],yaw:14,baseYaw:-10,lift:5,shadow:0,
  build(g){const stand=solid(g),slots=mk('path',{class:'nf lo'},g),yc=solid(g,'cardY'),rc=solid(g,'cardR');
   const card=(P:Proj,x0:number,x1:number,y:number,top:number):Solid=>{const o=fillet([[x0,5],[x1,5],[x1,top],[x0,top]],[0,0,1.8,1.8],3),i=fillet([[x0+1.3,5],[x1-1.3,5],[x1-1.3,top-1.3],[x0+1.3,top-1.3]],[0,0,.8,.8],3);
    return {sil:poly(hull(o.map(([x,z])=>P(x,y-.35,z)).concat(o.map(([x,z])=>P(x,y+.35,z))))),crease:open(i.slice(4).map(([x,z])=>P(x,y+.4,z)))};};
   return c=>{const {P,front}=c;
    put(stand,box(P,front,-14,-5,14,5,0,5,1.6,.8));slots.setAttribute('d',seg(P(-11,-1.5,5),P(1,-1.5,5))+seg(P(-1,1.5,5),P(11,1.5,5)));
    const wy=lerp(1,clamp(.5-c.ax*1.1,0,1),c.near),wr=lerp(0,clamp(.5+c.ax*1.1,0,1),c.near),rise=.35+.65*c.rise;
    put(yc,card(P,-11,1,-1.5,5+rise*(7+wy*14)));put(rc,card(P,-1,11,1.5,5+rise*(7+wr*14)));};}},

 // 1970: the 32-panel ball made for black-and-white television. It turns with the pointer.
 'telstar-1970':{label:'A football of 12 pentagons and 20 hexagons. It turns with the pointer.',plate:[20,20],
  bounds:[[-15,-15,1],[15,15,1],[0,0,32]],yaw:0,lift:6,shadow:8,
  build(g){const stand=solid(g),disc=mk('path',{class:'sil'},g),pent=mk('path',{class:'pent'},g),seams=mk('path',{class:'nf'},g),gleam=mk('path',{class:'nf lo'},g);
   return c=>{const {P,front}=c,center:V3=[0,0,16.2],turn=turner(rad(c.ax*80),rad(-12+c.ay*30),c.C.az);
    put(stand,cyl(P,front,6,0,0,0,2.5,.9));const b=ball(c,center,15);disc.setAttribute('d',b.sil);gleam.setAttribute('d',b.gleam);
    let d='';for(const p of TELSTAR.pents){if(dot3(turn(p.c),c.view as U3)<.12)continue;
     const pts:Pt[]=[];for(let k=0;k<5;k++)for(const u of arc(p.ring[k],p.ring[(k+1)%5],3).slice(0,3)){const n=turn(u);pts.push(P(n[0]*15,n[1]*15,n[2]*15+16.2));}d+=poly(pts);}
    pent.setAttribute('d',d);seams.setAttribute('d',surface(P,center,15,turn,c.view,TELSTAR.seams));};}},

 // 1989: a futsal court with its two 6 m areas. The small ball follows the pointer across it: close control.
 'futsal-1989':{label:'A futsal court with a small ball that follows the pointer.',plate:[40,26],
  bounds:[[-35,-18,0],[35,18,0],[-35,0,6],[35,0,6]],yaw:0,lift:4,shadow:0,
  build(g){const court=solid(g),lines=mk('path',{class:'nf'},g),goals=mk('path',{class:'nf sil'},g),marks=mk('path',{class:'dot'},g),b=solid(g,'key');
   return c=>{const {P,front}=c,z=2,L=(pts:Pt[])=>open(pts.map(([x,y])=>P(x,y,z)));
    put(court,box(P,front,-34,-18,34,18,0,z,2,.8));
    const area=(s:number)=>{const gx=s*32.5,pts:Pt[]=[];for(let k=0;k<=8;k++){const a=rad(-90+k*90/8);pts.push([gx-s*10*Math.cos(a),-2.6+10*Math.sin(a)]);}
     for(let k=0;k<=8;k++){const a=rad(k*90/8);pts.push([gx-s*10*Math.cos(a),2.6+10*Math.sin(a)]);}return L(pts);};
    lines.setAttribute('d',L([[-32.5,-16.5],[32.5,-16.5],[32.5,16.5],[-32.5,16.5],[-32.5,-16.5]])+L([[0,-16.5],[0,16.5]])+L(Array.from({length:37},(_,k):Pt=>[5*Math.cos(k/36*Math.PI*2),5*Math.sin(k/36*Math.PI*2)]))+area(-1)+area(1));
    goals.setAttribute('d',[-1,1].map(s=>{const x=s*32.5,bx=s*35;return lineOf(P,[[x,-2.6,z],[x,-2.6,z+3.4],[x,2.6,z+3.4],[x,2.6,z]])+lineOf(P,[[x,-2.6,z+3.4],[bx,-2.6,z+1.4],[bx,-2.6,z],[x,-2.6,z]])+lineOf(P,[[x,2.6,z+3.4],[bx,2.6,z+1.4],[bx,2.6,z],[x,2.6,z]])+lineOf(P,[[bx,-2.6,z+1.4],[bx,2.6,z+1.4]]);}).join(''));
    marks.setAttribute('d',[[0,0],[-22.5,0],[22.5,0],[-15.5,0],[15.5,0]].map(([x,y])=>circleOn(P,x,y,z,.55,12)).join(''));
    const gp=c.ground(z+1.4),bx=gp?clamp(gp[0],-31,31):0,by=gp?clamp(gp[1],-15,15):0,R=1.5;
    const bb=ball(c,[lerp(4,bx,c.near),lerp(3,by,c.near),z+R],R);put(b,{sil:bb.sil,crease:bb.gleam});};}},

 // 1991: eleven stars in a team's shape. Stars near the pointer rise and brighten; the passing lines follow them.
 'wwc-1991':{label:'Eleven stars joined in the shape of a football team. Stars near the pointer rise.',plate:[34,28],
  bounds:[[-30,-22,0],[22,22,0],[0,0,30]],yaw:16,lift:4,shadow:0,
  build(g){const stems=mk('path',{class:'nf lo'},g),feet=mk('path',{class:'dot off'},g),links=mk('path',{class:'nf'},g),stars=mk('path',{class:'dot'},g),bright=mk('path',{class:'dot key'},g);
   const S:Pt[]=[[-28,0],[-15,-17],[-17,-6],[-17,6],[-15,17],[-1,-18],[-3,-6.5],[-3,6.5],[-1,18],[14,-6],[14,6]];
   const E=[[0,2],[0,3],[1,2],[2,3],[3,4],[1,5],[2,6],[3,7],[4,8],[5,6],[6,7],[7,8],[6,9],[7,10],[9,10],[5,9],[8,10]];
   const h0=S.map((_,i)=>12+4*Math.sin(i*1.7));
   return c=>{const {P}=c,gp=c.ground(14),hs=S.map(([x,y],i)=>{const d=gp?Math.hypot(x-gp[0],y-gp[1]):99;const f=d/16,fall=f<=0?1:f<=.42?1-f/.42*.69:f<=1?.31-(f-.42)/.58*.22:.09;return h0[i]+c.near*14*fall*c.rise+4*c.rise;});
    stems.setAttribute('d',S.map(([x,y],i)=>seg(P(x,y,0),P(x,y,hs[i]))).join(''));feet.setAttribute('d',S.map(([x,y])=>circleOn(P,x,y,0,.7,10)).join(''));
    links.setAttribute('d',E.map(([a,b])=>seg(P(S[a][0],S[a][1],hs[a]),P(S[b][0],S[b][1],hs[b]))).join(''));
    const top=Math.max(...hs);let lit='',dim='';S.forEach(([x,y],i)=>{const sp=sparkle(P(x,y,hs[i]),3.2+2.2*(hs[i]-h0[i])/18);if(hs[i]>top-1.5&&c.near>.2)lit+=sp;else dim+=sp;});
    stars.setAttribute('d',dim);bright.setAttribute('d',lit||sparkle(P(14,-6,hs[9]),4.4));};}},

 // 1992: a keeper in goal, hands down, and a back-pass rolling to the feet. Raise the pointer and the ball arrives.
 'backpass-1992':{label:'A goalkeeper with hands down, and a ball rolling back to the feet. The pointer rolls the ball.',plate:[24,27],
  bounds:[[-18,-26,0],[18,24,0],[0,-16,23.4]],yaw:18,baseYaw:-8,lift:5,shadow:0,
  build(g){const net=mk('path',{class:'nf lo'},g),frame=mk('path',{class:'nf sil'},g),legs=[solid(g),solid(g)],body=solid(g),arms=mk('path',{class:'nf sil'},g),gloves=[solid(g,'key'),solid(g,'key')],
   head=solid(g),path=mk('path',{class:'nf dash lo'},g),mark=mk('path',{class:'dot off'},g),b=solid(g);
   return c=>{const {P,front}=c;
    let n='';for(let x=-12;x<=12;x+=6)n+=lineOf(P,[[x,-16,13],[x,-22,10],[x,-24,0]]);n+=lineOf(P,[[-16,-22,10],[16,-22,10]])+lineOf(P,[[-16,-24,0],[16,-24,0]]);net.setAttribute('d',n);
    frame.setAttribute('d',lineOf(P,[[-16,-16,0],[-16,-16,13],[16,-16,13],[16,-16,0]])+lineOf(P,[[-16,-16,13],[-16,-22,10],[-16,-24,0]])+lineOf(P,[[16,-16,13],[16,-22,10],[16,-24,0]])+seg(P(-22,-16,0),P(22,-16,0)));
    put(legs[0],cyl(P,front,1.3,-1.9,-8,0,7.5));put(legs[1],cyl(P,front,1.3,1.9,-8,0,7.5));put(body,box(P,front,-3.6,-10,3.6,-6,7,17,1.6,.7));
    arms.setAttribute('d',lineOf(P,[[-3.8,-8,16.2],[-5.4,-7.6,12.6],[-6,-7,10.2]])+lineOf(P,[[3.8,-8,16.2],[5.4,-7.6,12.6],[6,-7,10.2]]));
    put(gloves[0],box(P,front,-7.2,-8.2,-4.8,-5.8,8.2,10.6,1,.4));put(gloves[1],box(P,front,4.8,-8.2,7.2,-5.8,8.2,10.6,1,.4));
    const hh=ball(c,[0,-8,20.4],2.8);put(head,{sil:hh.sil,crease:hh.gleam});
    const s=lerp(.18,clamp(.55-c.ay*.6,0,1),c.near),A:V3=[12,20,1.8],B:V3=[2,-3.6,1.8];
    path.setAttribute('d',lineOf(P,[A,B]));mark.setAttribute('d',circleOn(P,A[0],A[1],0,1.1,14));
    const bb=ball(c,[lerp(A[0],B[0],s),lerp(A[1],B[1],s),1.8],1.8);put(b,{sil:bb.sil,crease:bb.gleam});};}},

 // 2018: a replay screen. The pointer slides the check line; the whole ball is past the goal line.
 'var-2018':{label:'A replay screen showing a ball past the goal line. The pointer slides the check line.',plate:[26,20],
  bounds:[[-24,-8,0],[24,2,0],[-24,0,42],[24,0,42]],yaw:22,baseYaw:-14,lift:5,shadow:10,
  build(g){const foot=solid(g),neck=solid(g),mon=solid(g),scene=mk('path',{class:'nf lo'},g),goal=mk('path',{class:'nf'},g),bl=mk('path',{class:'sil'},g),check=mk('path',{class:'nf key'},g),rec=mk('path',{class:'dot key'},g);
   return c=>{const {P,front}=c,y=1.05,Q=(x:number,z:number)=>P(x,y,z);
    put(foot,box(P,front,-9,-8,9,2,0,1.6,2,.8));put(neck,cyl(P,front,1.4,0,-4,1.6,14));put(mon,panel(P,-24,12,24,42,-2,1,2,1.8));
    scene.setAttribute('d',seg(Q(-20.5,17),Q(20.5,17))+[[-19,38.5],[19,38.5],[-19,15.5],[19,15.5]].map(([x,z])=>open([Q(x,z-Math.sign(z-27)*2.6),Q(x,z),Q(x-Math.sign(x)*2.6,z)])).join(''));
    goal.setAttribute('d',open([Q(4,17),Q(4,33),Q(20.5,33)]));
    bl.setAttribute('d',poly(ring2([9.2,20.4],3.3,3.3,32).map(([x,z])=>Q(x,z))));
    const cx=c.near>.02?lerp(5.9,clamp(5.9+c.ax*12,-16,19),c.near):5.9;
    check.setAttribute('d',seg(Q(cx,15.5),Q(cx,35.5))+seg(Q(cx-1.2,35.5),Q(cx+1.2,35.5)));
    rec.setAttribute('d',poly(ring2([-15.4,36.6],.9,.9,12).map(([x,z])=>Q(x,z))));};}},

 // Today: a plinth with your certificate on top. It tilts its frame toward the pointer.
 'hall-of-fame':{label:'A plinth with a framed certificate on top. The frame tilts toward the pointer.',plate:[22,22],
  bounds:[[-16,-16,0],[16,16,0],[-11,0,43],[11,0,43],[0,-6,43]],yaw:24,lift:6,shadow:12,
  build(g){const tier=solid(g),col=solid(g),cap=solid(g),strut=mk('path',{class:'nf sil'},g),frame=solid(g),text=mk('path',{class:'nf lo'},g),seal=mk('path',{class:'nf key'},g);
   const ring=rrect(-11,0,11,18,1.4),inner=rrect(-9.4,1.6,9.4,16.4,.6);
   return c=>{const {P,front}=c,lean=rad(14-c.ay*10),cl=Math.cos(lean),sl=Math.sin(lean);
    const at=(x:number,h:number,d:number):Pt=>P(x,-h*sl+d*cl,23+h*cl+d*sl);
    put(tier,box(P,front,-16,-16,16,16,0,4,2.2,.9));put(col,box(P,front,-11,-11,11,11,4,20,1.6,.8));put(cap,box(P,front,-14,-14,14,14,20,23,2,.9));
    strut.setAttribute('d',open([at(0,14,-.6),P(0,-8,23)]));
    put(frame,{sil:poly(hull(ring.map(q=>at(q.u,q.v,-.6)).concat(ring.map(q=>at(q.u,q.v,.6))))),crease:poly(inner.map(q=>at(q.u,q.v,.6)))});
    text.setAttribute('d',[[-7,13,7],[-7,10.5,5],[-7,8,3],[-7,5.5,-1]].map(([x0,h,x1])=>seg(at(x0,h,.62),at(x1,h,.62))).join(''));
    seal.setAttribute('d',poly(ring2([5.6,5],2.4,2.4,20).map(([x,h])=>at(x,h,.62)))+open([at(4.6,3,.62),at(3.8,.8,.62)])+open([at(6.6,3,.62),at(7.4,.8,.62)]));};}},
};
