import * as k from '../anatomy/iso-kit';
import {LAYERS,PITCH_LAYERS,type LayerId,type Stadium} from './data';

/**
 * stadiums · the model maker (Oct 12 2026, anatomy Paper style; the shared kit in ../anatomy/iso-kit). Pure: every stadium is
 * built from its numbers in data.ts and drawn to ONE SVG string for a camera, so tests render all seven in Node and the page
 * writes it straight into the card (no React per frame while the turntable turns).
 *
 * World: metres, x along the pitch, y across, z up; the stands start at the pitch's edge (offset d = 0) and step outwards.
 * A plan is a ring of points (an oval, or a rounded rectangle split edge by edge and corner by corner) with the SAME number of
 * points at every offset, so point i at one offset sits straight out from point i at the next: a "sector" is the slice between
 * points i and i + 1 and every step, roof panel and facade bay is one convex piece of one sector.
 *
 * Painter's order: bands, back to front (the turntable, the foundations, the far half of the outside, the pitch's four layers,
 * the stands, the roof, the near half of the outside, the arch), and inside a band by true depth (kit depthOf at the piece's
 * centre). A bowl sorted by depth paints right: on the far side the outer (higher) steps are further away, on the near side
 * nearer, so the near rim always covers the rows behind it. Turning the turntable is a new camera azimuth; the kit shades every
 * face by its facing to that camera, so the light stays put while the model turns.
 *
 * Explode: each layer rises by `dz` (and the outside also moves out by `push` metres), the pitch splits into its four layers.
 */
/** `sample` (pitch only, 0–1): a block cut from the pitch slides out to the front of the turntable with its four layers apart. */
export type Pose=Record<LayerId,{dz:number;push:number;show:boolean;split?:number;sample?:number}>;
/** The explode height unit (metres). */
export const EH=58;
/** The explode slider (0 = built, 1 = fully apart). */
export function explodePose(e:number):Pose{
 const t=Math.max(0,Math.min(1,e));
 return {ground:{dz:0,push:0,show:true},pitch:{dz:EH*.3*t,push:0,show:true,split:0,sample:t},stands:{dz:EH*1.5*t,push:0,show:true},
  roof:{dz:EH*2.4*t,push:0,show:true},outside:{dz:EH*1.5*t,push:40*t,show:true}};
}
/** Build mode: the first `built` layers in place, the next one (if dropping) `fall` metres above its place. */
export function buildPose(built:number,fall:number|null):Pose{
 const p=explodePose(0);LAYERS.forEach((id,i)=>{p[id]={...p[id],show:i<built||(i===built&&fall!=null),dz:i===built&&fall!=null?fall:0};});return p;
}

// ── Plan rings ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const MA=7,MB=5,KC=3,N_RECT=2*MA+2*MB+4*KC,N_OVAL=36;
export const sectorsOf=(S:Stadium)=>S.shape==='oval'?N_OVAL:N_RECT;
/** The plan ring `d` metres out from the stands' inner edge (counter-clockwise, same count at every d). */
export function ringAt(S:Stadium,d:number):k.Plane[]{
 const hx=S.ax+d,hy=S.ay+d;
 if(S.shape==='oval')return Array.from({length:N_OVAL},(_,i)=>{const t=i/N_OVAL*Math.PI*2;return [hx*Math.cos(t),hy*Math.sin(t)] as k.Plane;});
 const r=Math.max(2,Math.min(S.rc+d,hx-1,hy-1)),ex=hx-r,ey=hy-r,p:k.Plane[]=[];
 const edge=(x0:number,y0:number,x1:number,y1:number,n:number)=>{for(let i=0;i<n;i++){const f=i/n;p.push([x0+(x1-x0)*f,y0+(y1-y0)*f]);}};
 const arc=(cx:number,cy:number,a0:number)=>{for(let i=0;i<KC;i++){const a=a0+i/KC*Math.PI/2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}};
 edge(hx,-ey,hx,ey,MB);arc(ex,ey,0);edge(ex,hy,-ex,hy,MA);arc(-ex,ey,Math.PI/2);edge(-hx,ey,-hx,-ey,MB);arc(-ex,-ey,Math.PI);edge(-ex,-hy,ex,-hy,MA);arc(ex,-ey,Math.PI*1.5);
 return p;
}
/** The sector that faces the far long side (y < 0) at its middle: the players' tunnel. */
export const tunnelSector=(S:Stadium)=>S.shape==='oval'?Math.round(N_OVAL*.75)-1:MB+KC+MA+KC+MB+KC+MA/2-1;

// ── The stadium's shape, once per stadium ───────────────────────────────────────────────────────────────────────────────
export const PITCH_TOP=6,PITCH_SUB=1.5;
export type Step={d0:number;d1:number;zLo:number;zTop:number;tier:number;row:number;last:boolean};
export type Geo={S:Stadium;n:number;steps:Step[];dOuter:number;standsTop:number;roofZ:number;roofIn:number;roofOut:number;raftD:number;Rt:number;
 tops:Record<LayerId,number>;girder?:{x:number;y:number;z:number};pylons:k.Plane[];towers:{x:number;y:number;r:number;h:number}[]};
const GEO=new Map<string,Geo>();
export function geoOf(S:Stadium):Geo{
 const hit=GEO.get(S.id);if(hit)return hit;
 const steps:Step[]=[];let d=0,z=PITCH_TOP;
 S.tiers.forEach((t,ti)=>{let d0=d,z0=z,lo=z;
  if(ti>0){d0=d-(t.overhang??0);z0=z+(t.gap??3);lo=z0-2.4;}
  for(let j=0;j<t.rows;j++){steps.push({d0:d0+j*t.run,d1:d0+(j+1)*t.run,zLo:j?z0+j*t.rise:lo,zTop:z0+(j+1)*t.rise,tier:ti,row:j,last:j===t.rows-1});}
  d=d0+t.rows*t.run;z=z0+t.rows*t.rise;});
 const dOuter=d,standsTop=z,roofZ=z+S.roof.lift,roofIn=S.roof.dIn,roofOut=dOuter+S.roof.over;
 const outsideD=dOuter+(S.outside==='tent'?20:S.outside==='cushions'?16:S.outside==='towers'||S.outside==='pylons'?18:5);
 const raftD=outsideD+8;
 const Rt=Math.max(...ringAt(S,raftD).map(([x,y])=>Math.hypot(x,y)))+8;
 // San Siro's girders sit on four corner towers; Dortmund's pylons stand round the outside.
 const Xo=S.ax+dOuter,Yo=S.ay+dOuter;
 const girder=S.girders?{x:Xo-6,y:Yo-4,z:roofZ+S.roof.rise+3}:undefined;
 const towers:Geo['towers']=[];
 if(S.outside==='towers'){const g=girder!,R=7;for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]])towers.push({x:sx*(g.x+R+3),y:sy*(g.y+R+3),r:R,h:g.z});
  const ring=ringAt(S,dOuter+10),n=ring.length;[3,7,11,17,21,25,31].forEach(i=>{const [x,y]=ring[Math.round(i/36*n)%n];towers.push({x,y,r:6,h:standsTop+2});});}
 const pylons:k.Plane[]=S.outside==='pylons'?[[-.5,-1],[.5,-1],[.5,1],[-.5,1]].map(([a,b])=>[a*Xo,b*(Yo+12)] as k.Plane).concat([[-1,-.5],[-1,.5],[1,-.5],[1,.5]].map(([a,b])=>[a*(Xo+12),b*Yo] as k.Plane)):[];
 const roofTop=roofZ+S.roof.rise+(S.arch?133-(roofZ+S.roof.rise):0)+(girder?6:0)+(S.slide?2:0);
 const outTop=S.outside==='pylons'?roofZ+24:S.outside==='towers'?(girder?.z??0)+1:S.outside==='tent'?roofZ+S.roof.rise+2:S.outside==='cushions'?roofZ+2:roofZ;
 const g:Geo={S,n:sectorsOf(S),steps,dOuter,standsTop,roofZ,roofIn,roofOut,raftD,Rt,girder,pylons,towers,
  tops:{ground:0,pitch:PITCH_TOP,stands:standsTop,roof:Math.max(roofTop,roofZ+S.roof.rise),outside:outTop}};
 GEO.set(S.id,g);return g;
}
/** World points a camera is fitted to (turn-proof: circles round the turntable and the top, so turning never rescales). */
export function fitPoints(S:Stadium,pose:Pose):k.Point3[]{
 const G=geoOf(S),top=Math.max(...LAYERS.map(id=>pose[id].show?G.tops[id]+pose[id].dz:0)),rTop=Math.max(S.ax,S.ay)+G.dOuter+(pose.outside.push>0?pose.outside.push*.7:0);
 const pts:k.Point3[]=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;pts.push([Math.cos(a)*(G.Rt+8),Math.sin(a)*(G.Rt+8),-20],[Math.cos(a)*rTop,Math.sin(a)*rTop,top]);}
 return pts;
}

// ── Faces ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
type V3=k.Point3;
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function newell(p:V3[]):V3{let x=0,y=0,z=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1]);}
 const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l];}
const hexRgb=(h:string)=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
export const mixHex=(a:string,b:string,t:number)=>{const A=hexRgb(a),B=hexRgb(b);return '#'+A.map((v,i)=>Math.round(Math.max(0,Math.min(255,v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('');};
const cx3=(p:V3[]):V3=>{let x=0,y=0,z=0;for(const q of p){x+=q[0];y+=q[1];z+=q[2];}return [x/p.length,y/p.length,z/p.length];};

/** Draw context for one render. */
type Item={band:number;depth:number;layer:LayerId|'base';svg:string};
class Draw{
 items:Item[]=[];V:V3;l:k.Plane;
 constructor(public P:k.Projection,public lite=false){const c=k.cameraOf(P);this.V=[c.cosA*c.cosE,c.sinA*c.cosE,c.sinE];this.l=[-c.sinA,c.cosA];}
 put(band:number,layer:Item['layer'],at:V3,svg:string,bias=0){if(svg)this.items.push({band,depth:k.depthOf(at,this.P)+bias,layer,svg});}
 xy=(p:V3)=>k.iso(p,this.P);
 path=(p:V3[],closed=true)=>k.pathOf(p.map(this.xy),closed);
 /** A flat face: shaded by its facing (top tone when it looks up), or a real colour. `hint` = roughly its outward normal; a face
  *  turned away from the camera is skipped (two-sided when no hint). */
 face(p:V3[],{hint,tint,edge='lo',edges,cls}:{hint?:V3;tint?:string;edge?:k.LineTone|'none';edges?:[number,number][];cls?:string}={}):string{
  let n=newell(p);if(hint&&dot(n,hint)<0)n=[-n[0],-n[1],-n[2]];
  if(dot(n,this.V)<=1e-6){if(hint)return '';n=[-n[0],-n[1],-n[2]];}
  const d=this.path(p);let fill:string;
  if(n[2]>.6)fill=tint?`<path d="${d}" fill="${mixHex(tint,'#ffffff',.06)}"/>`:`<path class="iso-top" d="${d}"/>`;
  else{const h=Math.hypot(n[0],n[1])||1,lit=((n[0]/h)*this.l[0]+(n[1]/h)*this.l[1]+1)/2,s=Math.min(3,Math.max(0,Math.floor(lit*4)));
   fill=tint?`<path d="${d}" fill="${mixHex(tint,'#000000',[.3,.22,.14,.07][s])}"/>`:`<path class="iso-shade" data-shade="${s}" d="${d}"/>`;}
  let line='';if(edge!=='none'){const ln=edges?edges.map(([a,b])=>this.path([p[a],p[b]],false)).join(''):d;line=k.lineSvg(ln,{tone:edge});}
  return cls?`<g class="${cls}">${fill}${line}</g>`:fill+line;
 }
 line(p:V3[],tone:k.LineTone='lo',free=false,style?:string){if(this.lite&&tone==='faint')return '';const d=this.path(p,false);return style?`<path class="iso-line" data-tone="${tone}" style="${style}" d="${d}"${free?' data-free=""':''}/>`:k.lineSvg(d,{tone,free});}
 solid(paths:k.SolidPaths,o:k.SolidStyle={},tint?:string){
  if(!tint)return k.solidSvg(paths,o);
  return `<g class="iso-solid" data-tint=""><path d="${paths.fill}" fill="${mixHex(tint,'#000000',.12)}"/>${paths.shades.map((d,i)=>d?`<path d="${d}" fill="${mixHex(tint,'#000000',[.3,.22,.14,.07][i])}"/>`:'').join('')}<path d="${paths.top}" fill="${mixHex(tint,'#ffffff',.08)}"/><path class="iso-line iso-edge" data-tone="${o.tone??'hi'}" d="${paths.outline}"/></g>`;
 }
}
/** A small box centred on (x, y), turned to `ang`, from z up h. */
function boxAt(x:number,y:number,w:number,dd:number,ang:number,z:number,h:number,P:k.Projection){
 const c=Math.cos(ang),s=Math.sin(ang),pts:k.Plane[]=[[-w/2,-dd/2],[w/2,-dd/2],[w/2,dd/2],[-w/2,dd/2]].map(([a,b])=>[x+a*c-b*s,y+a*s+b*c]);
 return k.extrude(pts,z,h,P);
}
const ang2=(a:k.Plane,b:k.Plane)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const lerp2=(a:k.Plane,b:k.Plane,t:number):k.Plane=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const P3=(p:k.Plane,z:number):V3=>[p[0],p[1],z];

// ── The render ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export type Render={svg:string;anchors:Partial<Record<LayerId,k.Flat>>;count:number};
/** `lite`: while the turntable turns or the layers move, the faint texture lines (seat rows, purlins, gravel) are left out. */
export type RenderOpts={glow?:string;cables?:boolean;lite?:boolean};
const BAND={base:0,ground:1,outFar:2,pitch:3,stands:4,roof:5,outNear:6,top:7};

export function renderStadium(S:Stadium,P:k.Projection,pose:Pose,opts:RenderOpts={}):Render{
 const G=geoOf(S),D=new Draw(P,!!opts.lite),n=G.n,rings=new Map<number,k.Plane[]>();
 const R=(d:number)=>{let r=rings.get(d);if(!r){r=ringAt(S,d);rings.set(d,r);}return r;};
 const at=(d:number,i:number)=>R(d)[((i%n)+n)%n];
 const tow=k.towardViewer(P);const isFar=(x:number,y:number)=>x*tow[0]+y*tow[1]<0;

 // 0. The turntable: a plinth that never turns, the turning disc with a degree scale, a front index mark.
 {const c=k.cameraOf(P),R0=G.Rt;
  D.put(BAND.base,'base',[0,0,-30],`<path class="iso-halo" d="${k.cylinder(0,0,R0+10,-24,4,P,72).fill}"/>`+k.solidSvg(k.cylinder(0,0,R0+10,-22,6,P,96,1.2),{tone:'mid'}),-1e6);
  D.put(BAND.base,'base',[0,0,-16],k.solidSvg(k.cylinder(0,0,R0,-16,8,P,120,1),{tone:'mid',inner:k.lineSvg(k.sideArc(0,0,R0,-12,P,80),{tone:'faint'})}),-9e5);
  const t=k.radialTicks(0,0,R0-1,72,6,-8,[4,9],P);
  D.put(BAND.base,'base',[0,0,-8],k.lineSvg(k.ring(0,0,R0-12,-8,P,96),{tone:'faint'})+k.lineSvg(t.minor,{tone:'lo'})+k.lineSvg(t.major,{tone:'mid'}),-8e5);
  const fx=c.cosA*(R0+5),fy=c.sinA*(R0+5);
  D.put(BAND.base,'base',[fx,fy,-16],k.solidSvg(k.cylinder(fx,fy,2.6,-16,3,P,16),{tone:'hi',lit:true}),-7e5);}

 // 1. Foundations: piles under a concrete raft, pile caps and column stubs on top where the stands' frames stand.
 if(pose.ground.show){const z0=pose.ground.dz;
  const pts:k.Plane[]=[];for(const d of [G.steps[0].d1+2,Math.max(6,G.dOuter*.5),G.dOuter-2])for(let i=0;i<n;i+=2)pts.push(at(d,i));
  const piles=[...pts].sort((a,b)=>k.depthOf(P3(a,0),P)-k.depthOf(P3(b,0),P));
  D.put(BAND.ground,'ground',[0,0,z0-8],piles.map(([x,y])=>k.solidSvg(k.cylinder(x,y,1.3,z0-8,6,P,12),{tone:'lo',crease:'none'})).join(''),-2e5);
  const raft=R(G.raftD);
  D.put(BAND.ground,'ground',[0,0,z0-2],k.solidSvg(k.extrude(raft,z0-2,2,P,{bevel:.6}),{tone:'mid'})+k.lineSvg(k.onTop(R(G.raftD-4),z0,P,true),{tone:'faint'})
   +k.lineSvg(k.onTop(R(-1),z0,P,true),{tone:'faint'}),-1e5);
  // drawn on the raft: caps (every pile), stubs on the outer ring
  D.put(BAND.ground,'ground',[0,0,z0],piles.map(([x,y])=>k.solidSvg(k.cylinder(x,y,2.4,z0,1,P,14),{tone:'mid'})).join('')
   +[...R(G.dOuter-2)].filter((_,i)=>i%2===0).sort((a,b)=>k.depthOf(P3(a,0),P)-k.depthOf(P3(b,0),P)).map(([x,y])=>k.solidSvg(k.cylinder(x,y,1,z0+1,3,P,12),{tone:'hi'})).join(''),0);}

 // 2. The pitch: drains, gravel (with the warm pipes), sand, grass. Each layer a slab cut to the bowl's floor.
 if(pose.pitch.show){const sp=pose.pitch.split??0,base=pose.pitch.dz,foot=R(-.8);
  PITCH_LAYERS.forEach((L,i)=>{const z=base+i*(PITCH_SUB+sp),top=z+PITCH_SUB;let s=D.solid(k.extrude(foot,z,PITCH_SUB,P),{tone:'mid'},L.color);
   if(L.id==='drains'){const lines:V3[][]=[[[-58,0,top],[58,0,top]]];for(let x=-54;x<=54-Math.min(36,S.ay-8)*.8;x+=9){lines.push([[x,0,top],[x+Math.min(36,S.ay-8)*.8,Math.min(36,S.ay-8),top]],[[x,0,top],[x+Math.min(36,S.ay-8)*.8,-Math.min(36,S.ay-8),top]]);}
    s+=lines.map(l=>D.line(l,'mid')).join('')+k.dotsSvg(lines.slice(1).map(l=>D.xy(l[1])),{size:.9,tone:'hi'});}
   if(L.id==='gravel'){const g:k.Flat[]=[];for(let x=-60;x<=60;x+=6)for(let y=-38;y<=38;y+=6)g.push(D.xy([x+((y*7)%5),y,top]));if(!opts.lite)s+=k.dotsSvg(g,{size:.7,tone:'lo'});
    const hp:V3[]=[];for(let j=0,y=-34;y<=34;y+=4,j++){const a=j%2?56:-56;hp.push([-a,y,top+.05],[a,y,top+.05]);}
    s+=`<path class="iso-line st-heat" d="${D.path(hp,false)}"/>`;}
   if(L.id==='sand'){const g:k.Flat[]=[];for(let x=-58;x<=58;x+=9)for(let y=-36;y<=36;y+=9)g.push(D.xy([x,y+((x*3)%4),top]));if(!opts.lite)s+=k.dotsSvg(g,{size:.55,tone:'faint'});}
   if(L.id==='grass'){// mowing stripes, the lines, then the goals and dugouts on top
    for(let b=0;b<10;b+=2){const x0=-52.5+b*10.5;s+=`<path d="${D.path([[x0,-34,top],[x0+10.5,-34,top],[x0+10.5,34,top],[x0,34,top]])}" fill="${mixHex(L.color,'#ffffff',.12)}"/>`;}
    const T=(pts:[number,number][],closed=false)=>k.onTop(pts,top+.02,P,closed);
    const box=(x:number,w:number,h:number)=>T([[x,-h],[x+w,-h],[x+w,h],[x,h]],true);
    const ln=[T([[-52.5,-34],[52.5,-34],[52.5,34],[-52.5,34]],true),T([[0,-34],[0,34]]),k.ring(0,0,9.15,top+.02,P,40),box(-52.5,16.5,20.16),box(36,16.5,20.16),box(-52.5,5.5,9.16),box(47,5.5,9.16)].join('');
    s+=`<path class="iso-line st-chalk" d="${ln}"/>`+k.dotsSvg([D.xy([0,0,top]),D.xy([-41.5,0,top]),D.xy([41.5,0,top])],{size:1.1,tone:'hi'});
    const goals:string[]=[];for(const gx of [-52.5,52.5]){const back=gx+Math.sign(gx)*2;
     goals.push(`<path class="iso-line st-net" d="${D.path([[gx,-3.66,top+2.44],[back,-3.66,top+1.4],[back,3.66,top+1.4],[gx,3.66,top+2.44]],false)+D.path([[back,-3.66,top],[back,-3.66,top+1.4]],false)+D.path([[back,3.66,top],[back,3.66,top+1.4]],false)}"/>`
      +`<path class="iso-line st-post" d="${D.path([[gx,-3.66,top],[gx,-3.66,top+2.44],[gx,3.66,top+2.44],[gx,3.66,top]],false)}"/>`);}
    s+=goals.join('');
    const dy=-(Math.min(S.ay-3,38));for(const x of [-14,6])s+=k.solidSvg(boxAt(x+4,dy,9,2.4,0,top,2.2,P),{tone:'mid'});}
   D.put(BAND.pitch,'pitch',[0,0,z],s,i*1e5);});}
 // 2b. The pitch sample: a block cut from the pitch, out at the front of the turntable, its layers lifted apart (the cutaway).
 const sam=pose.pitch.show?pose.pitch.sample??0:0;
 if(sam>.04){const c=sampleAt(G,P),w=19,h=13,lay=4,gap=8*sam,op=Math.min(1,(sam-.04)/.3);let s='';
  const plan:k.Plane[]=[[c[0]-w,c[1]-h],[c[0]+w,c[1]-h],[c[0]+w,c[1]+h],[c[0]-w,c[1]+h]];
  s+=`<path class="iso-halo" d="${k.extrude(plan,0,2,P).fill}"/>`;
  PITCH_LAYERS.forEach((L,i)=>{const z=i*(lay+gap),top=z+lay;s+=D.solid(k.extrude(plan,z,lay,P),{tone:'hi'},L.color);
   const T=(pts:k.Plane[])=>k.onTop(pts,top+.02,P);
   if(L.id==='drains')s+=k.solidSvg(k.extrude([[c[0]-w,c[1]-1.2],[c[0]+w,c[1]-1.2],[c[0]+w,c[1]+1.2],[c[0]-w,c[1]+1.2]],top,1.6,P),{tone:'hi',lit:true});
   if(L.id==='gravel'){const hp:k.Plane[]=[];for(let j=0,y=-h+2;y<=h-2;y+=3.5,j++){const a=j%2?w-2:-(w-2);hp.push([c[0]-a,c[1]+y],[c[0]+a,c[1]+y]);}s+=`<path class="iso-line st-heat" d="${T(hp)}"/>`;
    const g:k.Flat[]=[];for(let x=-w+1.5;x<w;x+=2.6)for(let y=-h+1.3;y<h;y+=2.6)g.push(k.iso([c[0]+x+((y*7)%1.3),c[1]+y,top],P));s+=k.dotsSvg(g,{size:.9,tone:'mid'});}
   if(L.id==='sand'){const g:k.Flat[]=[];for(let x=-w+1;x<w;x+=1.9)for(let y=-h+1;y<h;y+=1.9)g.push(k.iso([c[0]+x+((y*3)%1),c[1]+y,top],P));s+=k.dotsSvg(g,{size:.6,tone:'lo'});}
   if(L.id==='grass'){for(let b=-w;b<w;b+=6.5)s+=`<path d="${k.onTop([[c[0]+b,c[1]-h],[c[0]+Math.min(w,b+3.25),c[1]-h],[c[0]+Math.min(w,b+3.25),c[1]+h],[c[0]+b,c[1]+h]],top+.01,P,true)}" fill="${mixHex(L.color,'#ffffff',.12)}"/>`;
    s+=`<path class="iso-line st-chalk" d="${T([[c[0]-w,c[1]+h-3],[c[0]+w,c[1]+h-3]])}"/>`;}});
  D.put(BAND.top,'pitch',[c[0],c[1],0],`<g opacity="${op.toFixed(2)}" data-sample="">${s}</g>`,-1e6);}

 // 3. The stands: one piece per step per sector: its tread (the seats), its riser (when it faces you), and the back wall.
 if(pose.stands.show){const dz=pose.stands.dz,tun=tunnelSector(S);
  for(const st of G.steps)for(let i=0;i<n;i++){
   const a0=at(st.d0,i),b0=at(st.d0,i+1),a1=at(st.d1,i),b1=at(st.d1,i+1),zt=st.zTop+dz,zl=st.zLo+dz;
   const mid=lerp2(lerp2(a0,b0,.5),lerp2(a1,b1,.5),.5);
   const wall=S.wall&&mid[0]<-(S.ax-4)?S.wall.color:undefined,tint=wall??S.tiers[st.tier].tint;
   const tread:V3[]=[P3(a0,zt),P3(b0,zt),P3(b1,zt),P3(a1,zt)];
   let s=D.face([P3(a0,zl),P3(b0,zl),P3(b0,zt),P3(a0,zt)],{hint:[-mid[0],-mid[1],0],edges:[[2,3]],edge:'mid',tint});
   if(st.tier===0&&i===tun&&st.row<3){const m0=lerp2(a0,b0,.32),m1=lerp2(a0,b0,.68);s+=D.face([P3(m0,zl),P3(m1,zl),P3(m1,zt-.3),P3(m0,zt-.3)],{hint:[-mid[0],-mid[1],0],tint:'#2b2b2d',edge:'hi'});}
   else if(st.row===2&&i%6===3){const m0=lerp2(a0,b0,.38),m1=lerp2(a0,b0,.62);s+=D.face([P3(m0,zl),P3(m1,zl),P3(m1,zt-.4),P3(m0,zt-.4)],{hint:[-mid[0],-mid[1],0],tint:'#4a4a48',edge:'mid'});}
   s+=D.face(tread,{hint:[0,0,1],tint,edges:[[0,1]],edge:'lo'});
   const r0=lerp2(a0,a1,.5),r1=lerp2(b0,b1,.5);s+=D.line([P3(r0,zt),P3(r1,zt)],'faint');
   if(i%4===0)s+=D.line([P3(a0,zt),P3(a1,zt)],'mid');
   if(st.last){s+=D.face([P3(a1,dz),P3(b1,dz),P3(b1,zt),P3(a1,zt)],{hint:[mid[0],mid[1],0],edges:[[0,1],[2,3]],edge:'mid',tint:wall});}
   D.put(BAND.stands,'stands',[mid[0],mid[1],zt],s);}}

 // 4. The roof: panels from the inner edge to past the stands' back, rising outwards; fascia, trusses, lights, screens.
 if(pose.roof.show){const dz=pose.roof.dz,zi=G.roofZ+dz,zo=zi+S.roof.rise,th=2.4;
  const top=S.roof.kind==='membrane'?'#f4f1ea':S.roof.kind==='cushion'?'#e9eef0':undefined;
  for(let i=0;i<n;i++){const a0=at(G.roofIn,i),b0=at(G.roofIn,i+1),a1=at(G.roofOut,i),b1=at(G.roofOut,i+1),mid=lerp2(lerp2(a0,b0,.5),lerp2(a1,b1,.5),.5);
   let s=D.face([P3(a0,zi-th),P3(b0,zi-th),P3(b0,zi),P3(a0,zi)],{hint:[-mid[0],-mid[1],0],edges:[[0,1]],edge:'mid'});
   s+=D.face([P3(a1,zo-th),P3(b1,zo-th),P3(b1,zo),P3(a1,zo)],{hint:[mid[0],mid[1],0],edges:[[0,1]],edge:'mid'});
   s+=D.face([P3(a0,zi),P3(b0,zi),P3(b1,zo),P3(a1,zo)],{hint:[0,0,1],tint:top,edges:[[0,1],[2,3]],edge:'hi'});
   // trusses / cables across the panel, a purlin ring along it, cushions as diamonds
   const tr=(f:number)=>[P3(lerp2(a0,b0,f),zi),P3(lerp2(a1,b1,f),zo)] as V3[];
   if(S.roof.kind==='cushion'){const q=(u:number,v:number):V3=>{const p=lerp2(lerp2(a0,b0,u),lerp2(a1,b1,u),v);return P3(p,zi+(zo-zi)*v);};
    s+=D.line([q(0,.5),q(.5,0),q(1,.5),q(.5,1),q(0,.5)],'faint');}
   else{s+=D.line(tr(0),i%2?'faint':'mid');s+=D.line(tr(.5),'faint');}
   const pr=(v:number)=>[P3(lerp2(a0,a1,v),zi+(zo-zi)*v),P3(lerp2(b0,b1,v),zi+(zo-zi)*v)] as V3[];
   s+=D.line(pr(.33),'faint')+D.line(pr(.66),'faint');
   D.put(BAND.roof,'roof',[mid[0],mid[1],zi],s);
   // floodlights on the front edge; a big screen at each end
   if(i%3===1){const p=lerp2(at(G.roofIn+1.6,i),at(G.roofIn+1.6,i+1),.5);D.put(BAND.roof,'roof',[p[0],p[1],zi-th],k.solidSvg(boxAt(p[0],p[1],6,1.6,ang2(a0,b0),zi-th-1.6,1.6,P),{tone:'hi',lit:true}),.5);}
   const endA=S.shape==='oval'?[0,n/2]:[Math.floor(MB/2),MB+KC+MA+KC+Math.floor(MB/2)];
   if(endA.includes(i)){const p=lerp2(at(G.roofIn+2.4,i),at(G.roofIn+2.4,i+1),.5);D.put(BAND.roof,'roof',[p[0],p[1],zi-th],D.solid(boxAt(p[0],p[1],16,1.4,ang2(a0,b0),zi-th-8,7,P),{tone:'hi'},'#3a3a3c'),.6);}
   }
  // retractable panels over the pitch (Al Bayt): two plates half closed on rails
  if(S.slide){const z=zo+.6,x0=S.ax-G.roofIn-2,y0=S.ay-G.roofIn+4;
   for(const sx of [-1,1]){const plan:k.Plane[]=[[sx*x0,-y0],[sx*x0*.42,-y0],[sx*x0*.42,y0],[sx*x0,y0]];
    const ps=k.extrude(plan,z,1.4,P);const rails=D.line([[sx*x0,-y0+6,z+1.4],[sx*x0*.42,-y0+6,z+1.4]],'lo')+D.line([[sx*x0,y0-6,z+1.4],[sx*x0*.42,y0-6,z+1.4]],'lo');
    D.put(BAND.roof,'roof',[sx*x0*.7,0,z],k.solidSvg(ps,{tone:'hi'})+rails,5e5);}}
  // San Siro: four red box girders on the corner towers
  if(G.girder){const g=G.girder,z=g.z+dz,H=5;
   const beams:[k.Plane[],V3][]=[[[[-g.x-4,-g.y-2],[g.x+4,-g.y-2],[g.x+4,-g.y+2],[-g.x-4,-g.y+2]],[0,-g.y,z]],[[[-g.x-4,g.y-2],[g.x+4,g.y-2],[g.x+4,g.y+2],[-g.x-4,g.y+2]],[0,g.y,z]],
    [[[-g.x-2,-g.y-4],[-g.x+2,-g.y-4],[-g.x+2,g.y+4],[-g.x-2,g.y+4]],[-g.x,0,z]],[[[g.x-2,-g.y-4],[g.x+2,-g.y-4],[g.x+2,g.y+4],[g.x-2,g.y+4]],[g.x,0,z]]];
   for(const [plan,c] of beams){let s=D.solid(k.extrude(plan,z,H,P),{tone:'hi'},S.color);
    const along=Math.abs(plan[1][0]-plan[0][0])>Math.abs(plan[2][1]-plan[1][1]);const L=along?g.x*2:g.y*2,stepN=Math.round(L/14);
    const zigs:V3[]=[];for(let j=0;j<=stepN;j++){const f=-1+2*j/stepN,x=along?f*g.x:c[0],y=along?c[1]:f*g.y;zigs.push([x+(along?0:Math.sign(c[0]||1)*2.05)*(c[0]?1:0),y+(along?Math.sign(c[1]||1)*2.05:0)*(c[1]?1:0),z+(j%2?H:0)]);}
    s+=D.line(zigs,'lo');D.put(BAND.roof,'roof',c,s,6e5);}}}

 // 5. The outside: drawn in two halves (behind the stands / in front of the roof), at its own explode offset.
 if(pose.outside.show){const dz=pose.outside.dz,pu=pose.outside.push;
  const put=(c:V3,svg:string,bias=0)=>D.put(isFar(c[0],c[1])?BAND.outFar:BAND.outNear,'outside',c,svg,bias);
  const zr=G.roofZ+dz;
  if(S.outside==='columns'||S.outside==='fins'||S.outside==='glass'){const dW=G.dOuter+2+pu,dC=dW+3,fins=S.outside==='fins';
   for(let i=0;i<n;i++){const a=at(dW,i),b=at(dW,i+1),mid=lerp2(a,b,.5),out:V3=[mid[0],mid[1],0];
    let s='';
    if(S.outside==='glass'){const z1=zr-1;s+=D.face([P3(a,dz),P3(b,dz),P3(b,z1),P3(a,z1)],{hint:out,tint:'#e3e8ec',edges:[[0,1],[2,3]],edge:'mid'});
     for(const f of [.25,.5,.75])s+=D.line([P3(lerp2(a,b,f),dz),P3(lerp2(a,b,f),z1)],'faint');
     for(const h of [.3,.6])s+=D.line([P3(a,dz+(z1-dz)*h),P3(b,dz+(z1-dz)*h)],'lo');
     put([mid[0],mid[1],dz],s);continue;}
    const z1=fins?zr-2:G.standsTop+dz-1;
    s+=D.face([P3(a,dz),P3(b,dz),P3(b,dz+5),P3(a,dz+5)],{hint:out,edges:[[2,3]],edge:'mid'});
    const ringZ=fins?dz+(z1-dz)*.55:z1-3;
    s+=D.face([P3(a,ringZ),P3(b,ringZ),P3(b,ringZ+2.4),P3(a,ringZ+2.4)],{hint:out,edges:[[0,1],[2,3]],edge:'mid'});
    put([mid[0],mid[1],dz],s,-1);
    const c=at(dC,i),ang=ang2(a,b);
    for(const off of fins?[-.22,.22]:[0]){const p=lerp2(c,at(dC,i+1),.5);const q=fins?[p[0]+Math.cos(ang)*off*8,p[1]+Math.sin(ang)*off*8] as k.Plane:c;
     put([q[0],q[1],dz],k.solidSvg(boxAt(q[0],q[1],fins?1.4:2.2,fins?3.4:2.2,ang,dz,z1-dz,P),{tone:'mid'}),2);}}}
  if(S.outside==='cushions'||S.outside==='tent'){const tent=S.outside==='tent',dB=G.dOuter+(tent?20:8)+pu,dM=G.dOuter+(tent?12:16)+pu,dT=G.dOuter+(tent?1:3)+pu;
   const zM=tent?dz+(G.roofZ+S.roof.rise)*.45:dz+G.standsTop*.45,zT=tent?zr+S.roof.rise+2:zr+2;
   const glow=opts.glow??S.color??'#e4322b';
   for(let i=0;i<n;i++){const A=at(dB,i),B=at(dB,i+1),Cm=at(dM,i),Dm=at(dM,i+1),Et=at(dT,i),Ft=at(dT,i+1),mid=lerp2(A,B,.5),out:V3=[mid[0],mid[1],0];
    let s='';const bands:[V3[],string|undefined][]=[[[P3(A,dz),P3(B,dz),P3(Dm,zM),P3(Cm,zM)],undefined],[[P3(Cm,zM),P3(Dm,zM),P3(Ft,zT),P3(Et,zT)],undefined]];
    for(const [q] of bands){
     if(tent){s+=D.face(q,{hint:out,tint:'#efe8da',edges:[[0,1],[2,3]],edge:'mid'});}
     else{s+=D.face(q,{hint:out,tint:glow==='#ffffff'?'#f2f2ee':mixHex(glow,'#ffffff',.18),edges:[[0,1],[2,3]],edge:'mid'});
      const m=(u:number,v:number):V3=>{const lo=lerp2([q[0][0],q[0][1]],[q[1][0],q[1][1]],u),hi=lerp2([q[3][0],q[3][1]],[q[2][0],q[2][1]],u);const zA=q[0][2]+(q[3][2]-q[0][2])*v;return [lo[0]+(hi[0]-lo[0])*v,lo[1]+(hi[1]-lo[1])*v,zA];};
      s+=D.line([m(0,.5),m(.5,0),m(1,.5),m(.5,1),m(0,.5)],'faint');}}
    if(tent){// the sadu band low on the tent: dark red, black and cream stripes with a zigzag
     const m=(u:number,v:number):V3=>{const lo=lerp2(A,B,u),hi=lerp2(Cm,Dm,u);return [lo[0]+(hi[0]-lo[0])*v,lo[1]+(hi[1]-lo[1])*v,dz+(zM-dz)*v];};
     const strip=(v0:number,v1:number,c:string)=>D.face([m(0,v0),m(1,v0),m(1,v1),m(0,v1)],{hint:out,tint:c,edge:'none'});
     s+=strip(.06,.22,S.color??'#8e2b2b')+strip(.22,.34,'#2b2b2d')+strip(.42,.5,'#2b2b2d');
     s+=D.line([m(0,.28),m(.25,.24),m(.5,.32),m(.75,.24),m(1,.28)],'faint');
     s+=D.line([P3(A,dz),P3(Cm,zM),P3(Et,zT)],'lo');}
    put([mid[0],mid[1],dz],s);}}
  if(S.outside==='pylons'){const H=G.roofZ+24,cab=opts.cables!==false&&Math.abs(pose.roof.dz-dz)<.5;
   for(const [x0,y0] of G.pylons){const r=Math.hypot(x0,y0),x=x0*(1+pu/r),y=y0*(1+pu/r);
    const ring:k.Plane[]=[[x-2.2,y-2.2],[x+2.2,y-2.2],[x+2.2,y+2.2],[x-2.2,y+2.2]];
    let s=D.solid(k.extrude(ring,dz,H,P),{tone:'hi'},S.color);
    for(let z=12;z<H-2;z+=12)s+=k.lineSvg(k.ringSeam(ring,dz+z,P),{tone:'lo'});
    if(cab){const edge=edgePoint(R(G.roofOut),[x0,y0]),mid=edgePoint(R((G.roofIn+G.roofOut)/2),[x0,y0]);
     s+=D.line([[x,y,dz+H-1],[edge[0],edge[1],G.roofZ+S.roof.rise+pose.roof.dz]],'mid')+D.line([[x,y,dz+H-1],[mid[0],mid[1],G.roofZ+S.roof.rise*.5+pose.roof.dz]],'lo');}
    put([x,y,dz],s+k.dotsSvg([D.xy([x,y,dz+H])],{size:1.1,tone:'hi'}));}}
  if(S.outside==='towers'){for(const t of G.towers){const r=Math.hypot(t.x,t.y)||1,x=t.x*(1+pu/r),y=t.y*(1+pu/r),z0=dz,H=t.h;
    let s=k.solidSvg(k.cylinder(x,y,t.r,z0,H,P,36,.4),{tone:'mid',inner:helix(D,x,y,t.r,z0,H)});
    s+=k.lineSvg(k.ring(x,y,t.r-1.6,z0+H,P,28),{tone:'faint'});put([x,y,z0],s);}}}

 // 6. On top: Wembley's arch (with its cables down to the north roof edge).
 if(pose.roof.show&&S.arch){const dz=pose.roof.dz,span=315,lean=22*Math.PI/180,y0=-(S.ay+G.dOuter*.45),pts:V3[]=[];
  for(let j=0;j<=48;j++){const s=j/48,x=-span/2+s*span,h=133*(1-(2*s-1)**2);pts.push([x,y0-h*Math.sin(lean),dz+h*Math.cos(lean)]);}
  const w=Math.max(1.4,k.cameraOf(P).k*7.4),roofTop=G.roofZ+S.roof.rise+dz+2;
  // The arch in runs: where it is lower than the roof it stands outside the bowl (behind or in front of it, by side); above the
  // roof it is drawn last. Each run is one path, so the tube has no seams except where a run meets the next.
  const bandOf=(j:number)=>{const m=(pts[j][2]+pts[j+1][2])/2;if(m>roofTop)return BAND.top;const x=(pts[j][0]+pts[j+1][0])/2,y=(pts[j][1]+pts[j+1][1])/2;return isFar(x,y)?BAND.outFar:BAND.outNear;};
  const tube=(seg:V3[],lat:boolean)=>{const d=D.path(seg,false);let t=`<path class="st-arch-edge" d="${d}" style="stroke-width:${(w+1.6).toFixed(1)}px"/><path class="st-arch" d="${d}" style="stroke-width:${w.toFixed(1)}px"/>`;
   if(lat){const ties:string[]=[];for(let j=1;j<seg.length-1;j+=2)ties.push(D.path([seg[j],seg[j+1]],false));t+=`<path class="iso-line st-arch-lattice" d="${ties.join('')}"/>`;}return t;};
  for(let j=0;j<48;){const bd=bandOf(j);let e=j;while(e<48&&bandOf(e)===bd)e++;const seg=pts.slice(j,e+1),m=seg[Math.floor(seg.length/2)];
   let sv=tube(seg,true);if(j===0)sv=k.solidSvg(boxAt(pts[0][0],pts[0][1],10,10,0,dz-4,4,P),{tone:'mid'})+sv;if(e===48)sv=k.solidSvg(boxAt(pts[48][0],pts[48][1],10,10,0,dz-4,4,P),{tone:'mid'})+sv;
   D.put(bd,'roof',m,sv,bd===BAND.top?0:5e5);j=e;}
  let c='';const roofEdge=R(G.roofOut);for(let j=8;j<=40;j+=4){const p=pts[j],e=edgePoint(roofEdge,[p[0],-200]);c+=D.path([p,[e[0],e[1],G.roofZ+S.roof.rise+dz]],false);}
  D.put(BAND.top,'roof',[0,y0,dz],`<path class="iso-line" data-tone="lo" d="${c}"/>`,-1e6);}

 // Sort and emit, grouping runs of one layer so the page can light or fade a layer with one CSS rule.
 D.items.sort((a,b)=>a.band-b.band||a.depth-b.depth);
 let out='',cur='',count=0;for(const it of D.items){if(it.layer!==cur){if(cur)out+='</g>';out+=`<g data-l="${it.layer}">`;cur=it.layer;}out+=it.svg;count++;}
 if(cur)out+='</g>';
 return {svg:out,anchors:anchorsOf(S,G,P,pose),count};
}
/** Where the pitch sample sits: on the raft's rim, toward you and a little to the left (it turns with the camera). */
export function sampleAt(G:Geo,P:k.Projection):k.Plane{const c=k.cameraOf(P),a=Math.atan2(c.sinA,c.cosA)-32*Math.PI/180,r=G.Rt-30;return [Math.cos(a)*r,Math.sin(a)*r];}
/** The point of a ring nearest a direction (its outer edge toward `p`). */
function edgePoint(ring:k.Plane[],p:k.Plane):k.Plane{const a=Math.atan2(p[1],p[0]);let best=ring[0],bd=Infinity;
 for(const q of ring){const d=Math.abs(Math.atan2(Math.sin(Math.atan2(q[1],q[0])-a),Math.cos(Math.atan2(q[1],q[0])-a)));if(d<bd){bd=d;best=q;}}return best;}
/** A spiral ramp on a tower: two helix lines a ramp apart, only on the half that faces you. */
function helix(D:Draw,x:number,y:number,r:number,z0:number,H:number){
 const tw=k.towardViewer(D.P),turn=9,segs:string[]=[];
 for(const off of [0,2.2]){let run:V3[]=[];for(let t=0;t<=H/turn*28;t++){const a=t/28*Math.PI*2,z=z0+off+t/28*turn;if(z>z0+H-.5)break;
   const cx=Math.cos(a),cy=Math.sin(a),vis=cx*tw[0]+cy*tw[1]>.05;if(vis)run.push([x+cx*(r+.05),y+cy*(r+.05),z]);else if(run.length){if(run.length>1)segs.push(D.path(run,false));run=[];}}
  if(run.length>1)segs.push(D.path(run,false));}
 return `<path class="iso-line" data-tone="lo" d="${segs.join('')}"/>`;
}
/** Where each layer's label leader starts: the layer's right-most point on screen (the label column is on the right). */
function anchorsOf(S:Stadium,G:Geo,P:k.Projection,pose:Pose){
 const pick=(pts:V3[])=>{let best:k.Flat|null=null;for(const p of pts){const q=k.iso(p,P);if(!best||q[0]>best[0])best=q;}return best!;};
 const ring=(d:number,z:number)=>ringAt(S,d).filter((_,i)=>i%2===0).map(([x,y])=>[x,y,z] as V3);
 const a:Partial<Record<LayerId,k.Flat>>={};
 if(pose.ground.show)a.ground=pick(ring(G.raftD-3,pose.ground.dz));
 if(pose.pitch.show){const sam=pose.pitch.sample??0;if(sam>.04){const c=sampleAt(G,P);{const z=(4+8*sam)*2;a.pitch=pick([[c[0]+19,c[1]-13,z],[c[0]+19,c[1]+13,z],[c[0]-19,c[1]+13,z],[c[0]-19,c[1]-13,z]]);}}
  else a.pitch=pick(ring(-6,pose.pitch.dz+PITCH_TOP));}
 if(pose.stands.show)a.stands=pick(ring(G.dOuter-3,pose.stands.dz+G.standsTop*.75));
 if(pose.roof.show)a.roof=pick(ring(G.roofOut-4,pose.roof.dz+G.roofZ+S.roof.rise));
 if(pose.outside.show)a.outside=pick(ring(G.dOuter+8+pose.outside.push,pose.outside.dz+G.standsTop*.4));
 return a;
}
