import * as T from 'three';
import {CASE_PLACES,CASE} from './museumLayout';
import {buildMuseumBoot} from './museumBoot';

/**
 * The hall's sculptures: one object per open case, on its white plinth, in the gallery palette (ink, white and the primaries).
 *
 * Oct 13 2026 (user: "for all the exhibits remove this info thing and btn, just have the full thing at the beginning" and, of the
 * boots case, "This doesn't look anything like a futbol boot"): the step-through stories are gone, so the sculptures no longer
 * perform. Each is a still, recognisable object instead of an abstract piece that only made sense mid-story:
 *
 *  - laws-1863      a stack of rule books, an open book on top, an ink pot and a quill;
 *  - penalty-1891   a goal with its net, the goal line, the penalty spot and a ball on it;
 *  - stadiums       a stadium bowl: an oval of two-tier stands round a striped pitch, a roof ring and a white arch over it;
 *  - boots          a real football boot (the Kit Shop's procedural boot, lib/museum/museumBoot.ts): black leather with a white
 *                   sole, white laces and moulded studs, standing on its studs three-quarters to the camera;
 *  - var-2018       a referee's review monitor on its stand, a goal-line replay on screen;
 *  - worldcup-1930  a winged gold cup on a blue octagonal base (the first World Cup's trophy);
 *  - wwc-1991       a globe on a stand;
 *  - futsal-1989    a tabletop indoor court with goals, lines and a small ball;
 *  - laced-leather  a brown laced leather ball beside a modern size 5 ball;
 *  - telstar-1970   an old television set with the black-and-white Telstar in front of it (the one piece that moves: drag to
 *                   spin it, MuseumExhibit's ⟲ ⟳ buttons);
 *  - shirts         three shirts on stands: green 1, red 9, blue 10;
 *  - hall-of-fame   the Trophy room: a two-handled gold cup on a stepped base, a shelf of small cups behind it.
 *
 * Heat: everything joins the room's ONE merged vertex-coloured mesh (`add`), so the sculptures cost no draw call of their own,
 * except two pieces with a mesh each on the room's material: the Telstar (so it can turn) and the boot (the shop geometry's phone
 * detail, ~20k triangles, kept indexed and frustum-culled instead of tripling its vertices in the merged mesh). One boot, not a
 * row: a second would double the hall's triangle count. Nothing animates on its own: the room's loop sleeps whenever you stop.
 */
type Add=(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx?:number,ry?:number,rz?:number,s?:number)=>unknown;
/** The gallery palette (docs/museum-modern-style.md). */
export const ART={ground:'#f6f4ef',ink:'#1d1d1b',muted:'#6b6a66',hair:'#d9d6cf',red:'#e4322b',blue:'#2a5bd7',yellow:'#f2c230',green:'#1f8a5b',white:'#f7f6f2',stone:'#e6e3dc',leather:'#8a5a33',gold:'#d9a92e',pitch:'#3f9a5a'} as const;
const TOP=CASE.plinthH+.04;
/** How tall each case's sculpture stands above its plinth top (the hall's zoom frames it). A case without an entry has no sculpture. */
export const SCULPTURE_TOP:Readonly<Record<string,number>>={'laws-1863':.32,'penalty-1891':.3,stadiums:.42,boots:.3,'var-2018':.6,'worldcup-1930':.52,'wwc-1991':.44,'futsal-1989':.2,'laced-leather':.34,'telstar-1970':.62,shirts:.36,'hall-of-fame':.46,
 'first-international-1872':.36,'floodlights-1878':.56,'copa-america-1916':.5,'offside-rules':.18,'formations-history':.5,'keeper-hands-1912':.24,'free-kick-wall':.22,'ball-curve':.38,'throw-in':.42,'ballon-dor':.46};
const {ink:K,white:W,red:R,blue:B,green:G,gold:AU,hair:H}=ART;
/** The boot on the boots plinth: the Kit Shop's 1960s–80s "Retro Leather" silhouette (lib/shop/boots.ts MODELS). */
const BOOT_MODEL='retro';

// ---- Geometry helpers: every piece is coloured, placed and flattened to position + normal + colour --------------------------
const m4=new T.Matrix4(),q=new T.Quaternion(),eu=new T.Euler(),pv=new T.Vector3(),sv=new T.Vector3(),cc=new T.Color(),nv=new T.Vector3();
type Paint=string|((n:T.Vector3,p:T.Vector3)=>string);
/** Colour (one hex, or per face from its normal/centre), transform (YXZ euler, then scale), and strip to the three attributes. */
function piece(geo:T.BufferGeometry,paint:Paint,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx){
 const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();
 if(!g.getAttribute('normal'))g.computeVertexNormals();
 for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='color')g.deleteAttribute(k);
 if(!g.getAttribute('color')){const pos=g.getAttribute('position'),n=pos.count,c=new Float32Array(n*3);
  if(typeof paint==='string'){cc.set(paint);for(let i=0;i<n;i++){c[i*3]=cc.r;c[i*3+1]=cc.g;c[i*3+2]=cc.b;}}
  else{const a=new T.Vector3(),b=new T.Vector3(),d=new T.Vector3(),ctr=new T.Vector3();
   for(let f=0;f<n;f+=3){a.fromBufferAttribute(pos,f);b.fromBufferAttribute(pos,f+1);d.fromBufferAttribute(pos,f+2);ctr.copy(a).add(b).add(d).divideScalar(3);
    nv.copy(ctr).normalize();cc.set(paint(nv,ctr));for(let k=0;k<3;k++){c[(f+k)*3]=cc.r;c[(f+k)*3+1]=cc.g;c[(f+k)*3+2]=cc.b;}}}
  g.setAttribute('color',new T.BufferAttribute(c,3));}
 q.setFromEuler(eu.set(rx,ry,rz,'YXZ'));m4.compose(pv.set(x,y,z),q,sv.set(sx,sy,sz));g.applyMatrix4(m4);return g;
}
/** Concatenate pieces (all non-indexed with position, normal, colour) into one geometry. */
function join(parts:readonly T.BufferGeometry[]){
 let n=0;for(const p of parts)n+=p.getAttribute('position').count;const out=new T.BufferGeometry();
 for(const name of ['position','normal','color']){const a=new Float32Array(n*3);let o=0;for(const p of parts){const s=p.getAttribute(name).array as ArrayLike<number>;a.set(s,o);o+=s.length;}out.setAttribute(name,new T.BufferAttribute(a,3));}
 for(const p of parts)p.dispose();return out;
}
const boxG=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d);
const cylG=(r0:number,r1:number,h:number,seg=20)=>new T.CylinderGeometry(r0,r1,h,seg);
/** A lathe from [radius, height] pairs, bottom to top (outside first, then back down the inside for a hollow cup). */
const latheG=(pts:readonly (readonly [number,number])[],seg=24)=>new T.LatheGeometry(pts.map(([r,y])=>new T.Vector2(r,y)),seg);
/** The 12 pentagon centres of a football (an icosahedron's corners). */
const PENTA=(()=>{const g=new T.IcosahedronGeometry(1,0),p=g.getAttribute('position'),out:T.Vector3[]=[];
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).normalize();if(!out.some(o=>o.distanceToSquared(v)<1e-4))out.push(v);}g.dispose();return out;})();
/** A black-and-white football (the Telstar pattern: 12 black pentagons on white). */
const football=(r:number,detail=3)=>piece(new T.IcosahedronGeometry(r,detail),n=>{let best=-1;for(const c of PENTA)best=Math.max(best,c.dot(n));return best>.936?K:W;});
/** A box frame of four bars (w × h, bar thickness t) facing +z. */
function frame(w:number,h:number,t:number,d:number,hex:string,x:number,y:number,z:number){
 return [piece(boxG(w,t,d),hex,x,y+h/2-t/2,z),piece(boxG(w,t,d),hex,x,y-h/2+t/2,z),piece(boxG(t,h,d),hex,x-w/2+t/2,y,z),piece(boxG(t,h,d),hex,x+w/2-t/2,y,z)];
}
/** Seven-segment digits (white boxes) for shirt numbers: width w, height h, bar t, at (x, y) on the plane z. */
const SEG:Record<string,string>={'0':'abcdef','1':'bc','9':'abcdfg'};
function digit(ch:string,x:number,y:number,z:number,w:number,h:number,t:number,hex:string){
 const out:T.BufferGeometry[]=[],hh=h/2,hw=w/2;
 for(const s of SEG[ch]??''){
  if(s==='a')out.push(piece(boxG(w,t,.002),hex,x,y+hh-t/2,z));if(s==='g')out.push(piece(boxG(w,t,.002),hex,x,y,z));if(s==='d')out.push(piece(boxG(w,t,.002),hex,x,y-hh+t/2,z));
  if(s==='b')out.push(piece(boxG(t,hh,.002),hex,x+hw-t/2,y+hh/2,z));if(s==='c')out.push(piece(boxG(t,hh,.002),hex,x+hw-t/2,y-hh/2,z));
  if(s==='f')out.push(piece(boxG(t,hh,.002),hex,x-hw+t/2,y+hh/2,z));if(s==='e')out.push(piece(boxG(t,hh,.002),hex,x-hw+t/2,y-hh/2,z));}
 return out;
}

export function createExhibitSculptures(opts:{open:Readonly<Record<string,boolean>>;add:Add;
 /** A soft contact shadow on a plinth top (world x, y, z, radius x/z). */
 shadow?:(x:number,y:number,z:number,rx:number,rz:number)=>void;
 /** A piece that reads as lit (world coordinates): the hall draws it unlit, in its one print mesh (no extra draw). */
 glow?:(geo:T.BufferGeometry)=>void}){
 const built=new Set<string>();
 /** Pieces with their own mesh (world placement): the Telstar, which spins, and the boot. */
 const solo:{name:string;geometry:T.BufferGeometry;x:number;y:number;z:number;rx:number;ry:number;s:number}[]=[];
 /** Build case `id`'s sculpture: `make` returns its pieces in plinth-top coordinates; they join the hall's merged mesh. */
 function sculpture(id:string,make:(shadow:(x:number,z:number,rx:number,rz?:number)=>void,p:{x:number;z:number})=>T.BufferGeometry[]){
  if(!SCULPTURE_TOP[id])return;// every sculpture declares its height (the zoom frames it)
  if(!opts.open[id])return;const p=CASE_PLACES[id];if(!p)return;
  const shadow=(x:number,z:number,rx:number,rz=rx)=>opts.shadow?.(p.x+x,TOP+.002,p.z+z,rx,rz);
  const parts=make(shadow,p);if(parts.length)opts.add(join(parts),p.x,TOP,p.z,'');built.add(id);
 }

 // ---- 1863 · The first Laws: a stack of rule books, an open book, an ink pot and a quill --------------------------------------
 sculpture('laws-1863',shadow=>{shadow(0,0,.36,.28);const out:T.BufferGeometry[]=[];
  /** A closed book lying flat: boards and spine in the cover colour, cream page edges between them. */
  const book=(w:number,h:number,d:number,cover:string,x:number,y:number,z:number,ry:number)=>{const c=Math.cos(ry),s=Math.sin(ry),at=(lx:number,ly:number,lz:number):[number,number,number]=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
   const b=.008;out.push(piece(boxG(w,b,d),cover,...at(0,b/2,0),0,ry),piece(boxG(w,b,d),cover,...at(0,h-b/2,0),0,ry),piece(boxG(.012,h,d),cover,...at(-w/2+.006,h/2,0),0,ry),
    piece(boxG(w-.02,h-2*b,d-.014),'#f1ece0',...at(.004,h/2,0),0,ry));};
  book(.5,.06,.36,B,0,0,0,.04);book(.44,.05,.32,K,.01,.06,.01,-.08);book(.4,.045,.3,R,-.01,.11,-.005,.1);
  // the open book on top: two page fans in a shallow V on a board
  {const y=.155,w=.17,d=.26;out.push(piece(boxG(2*w+.02,.008,d+.012),K,0,y+.004,0,0,.05));
   for(const s of [-1,1])out.push(piece(boxG(w,.018,d),'#fbf8f0',s*(w/2+.004),y+.02+.012,0,0,.05,s*-.1));
   out.push(piece(boxG(.004,.003,d*.9),H,0,y+.02,0,0,.05));}
  // ink pot and quill
  out.push(piece(cylG(.035,.04,.06),K,.31,.03,.12),piece(cylG(.022,.022,.012),K,.31,.066,.12));
  out.push(piece(new T.SphereGeometry(1,10,6),W,.27,.16,.08,0,-.6,.5,.012,.13,.03),piece(cylG(.002,.004,.12,6),K,.31,.1,.115,0,-.6,.45));
  return out;});

 // ---- 1891 · The penalty kick: a goal with its net, the goal line, the spot and the ball ---------------------------------------
 sculpture('penalty-1891',shadow=>{shadow(0,-.28,.4,.14);shadow(0,.2,.08);const out:T.BufferGeometry[]=[];
  const gw=.62,gh=.26,gz=-.24,back=-.42,r=.011;
  out.push(piece(boxG(.86,.003,.012),W,0,.0015,gz));// goal line
  for(const s of [-1,1]){out.push(piece(cylG(r,r,gh,12),W,s*gw/2,gh/2,gz));
   // back stanchions: from the crossbar back down to the ground bar
   const len=Math.hypot(gh,gz-back);out.push(piece(cylG(.005,.005,len,8),K,s*gw/2,gh/2,(gz+back)/2,Math.atan2(gz-back,gh)));
   // the side nets: a few strands
   for(let k=1;k<4;k++){const t=k/4;out.push(piece(boxG(.002,gh*(1-t),.002),H,s*gw/2,gh*(1-t)/2,gz+(back-gz)*t));}}
  out.push(piece(cylG(r,r,gw+2*r,12),W,0,gh,gz,0,0,Math.PI/2),piece(cylG(.005,.005,gw,8),K,0,.005,back,0,0,Math.PI/2));
  // the back net: strands down the slope and across it
  const slope=Math.hypot(gh,gz-back),tilt=Math.atan2(gz-back,gh);
  for(let k=1;k<8;k++)out.push(piece(boxG(.002,slope,.002),H,-gw/2+k*gw/8,gh/2,(gz+back)/2,tilt));
  for(let k=1;k<4;k++){const t=k/4;out.push(piece(boxG(gw,.002,.002),H,0,gh*(1-t),gz+(back-gz)*t));}
  out.push(piece(cylG(.022,.022,.003,20),W,0,.0015,.2),football(.055,5));out[out.length-1].translate(0,.058,.2);
  return out;});

 // ---- 1950 · Stadiums of the World: a stadium bowl round a pitch, with a white arch ------------------------------------------
 sculpture('stadiums',shadow=>{shadow(0,0,.46,.38);const out:T.BufferGeometry[]=[];const ox=1.15,oz=.86;
  const oval=(g:T.BufferGeometry)=>{g.scale(ox,1,oz);return g;};
  out.push(piece(oval(cylG(.4,.4,.012,40)),'#cfcac0',0,.006,0));
  // stands: a red lower tier, a white upper tier and the outer wall, all one oval lathe each
  out.push(piece(oval(latheG([[.215,.012],[.215,.03],[.29,.075]],40)),R));
  out.push(piece(oval(latheG([[.29,.075],[.29,.082],[.37,.135],[.385,.135],[.385,.012]],40)),W));
  out.push(piece(oval(latheG([[.345,.16],[.392,.152],[.392,.146],[.345,.154]],40)),'#cfcac0'));// the roof's thin rim
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;out.push(piece(cylG(.003,.003,.02,6),'#cfcac0',Math.cos(a)*.388*ox,.145,Math.sin(a)*.388*oz));}
  // the pitch: stripes and lines
  const pw=.4,pd=.28;for(let i=0;i<8;i++)out.push(piece(boxG(pw/8,.008,pd),i%2?ART.pitch:'#4aa766',-pw/2+pw/16+i*pw/8,.016,0));
  const ly=.0205,lt=.004;out.push(piece(boxG(pw-.02,.001,lt),W,0,ly,pd/2-.012),piece(boxG(pw-.02,.001,lt),W,0,ly,-pd/2+.012),piece(boxG(lt,.001,pd-.024),W,-pw/2+.012,ly,0),piece(boxG(lt,.001,pd-.024),W,pw/2-.012,ly,0),piece(boxG(lt,.001,pd-.024),W,0,ly,0));
  out.push(piece(new T.TorusGeometry(.04,.002,4,24),W,0,ly,0,Math.PI/2));
  // the penalty areas: three lines each
  for(const s of [-1,1]){const ex=s*(pw/2-.012),ix=s*(pw/2-.06);out.push(piece(boxG(lt,.001,.13),W,ix,ly,0),piece(boxG(.048,.001,lt),W,(ex+ix)/2,ly,.065),piece(boxG(.048,.001,lt),W,(ex+ix)/2,ly,-.065));}
  // Wembley's arch, leaning back over the bowl
  out.push(piece(new T.TorusGeometry(.43,.009,6,40,Math.PI),W,0,.012,-.03,-.55));
  return out;});

 // ---- 1900s · Boots through time: an old black leather boot and a modern speed boot (the Kit Shop's geometry) ---------------
 sculpture('boots',(shadow,p)=>{shadow(0,.02,.4,.2);const out:T.BufferGeometry[]=[];
  // the old boot on a low ink riser at the back, the modern boot in front, both turned three-quarters to the camera
  solo.push({name:'museum-boot',geometry:buildMuseumBoot({model:BOOT_MODEL,collar:'low',laces:'visible',studs:'fg',upper:'#242321',lining:'#5a544c',sole:'#f1ede4',studColor:'#2a2926',lace:'#f4f1ea'}),
   x:p.x,y:TOP,z:p.z+.02,rx:0,ry:-.12,s:.24});
  return out;});

 // ---- 2018 · The video assistant referee: a review monitor, a goal-line replay on screen -------------------------------------
 sculpture('var-2018',shadow=>{shadow(0,-.04,.32,.12);const out:T.BufferGeometry[]=[];
  const sw=.62,sh=.4,cy=.38,z=-.05;
  out.push(piece(boxG(.26,.014,.14),K,0,.007,z),piece(boxG(.04,cy-sh/2,.025),K,0,(cy-sh/2)/2+.01,z-.02));
  out.push(piece(boxG(sw,sh,.04),K,0,cy,z));
  // the replay: a pitch with the goal line, the post and the ball (the whole ball over the line), a red "live" dot
  const sz=z+.0205,iw=sw-.04,ih=sh-.04;out.push(piece(boxG(iw,ih,.002),'#2f7d4c',0,cy,sz));
  out.push(piece(boxG(iw,ih*.3,.002),'#1e2e4f',0,cy+ih*.35,sz+.0005));
  out.push(piece(boxG(.008,ih*.7,.002),W,.04,cy-ih*.15,sz+.001),piece(boxG(.016,ih*.5,.002),W,.04,cy+ih*.1,sz+.0015));
  out.push(piece(cylG(.032,.032,.002,24),W,-.05,cy-.08,sz+.0015,Math.PI/2),piece(cylG(.012,.012,.002,12),K,-.05,cy-.08,sz+.0025,Math.PI/2));
  out.push(piece(cylG(.012,.012,.002,12),R,-iw/2+.03,cy+ih/2-.03,sz+.002,Math.PI/2));
  // the referee's flag beside it
  out.push(piece(cylG(.004,.004,.26,8),K,.38,.13,.12),piece(boxG(.09,.06,.003),'#f2c230',.335,.22,.12),piece(boxG(.045,.03,.0035),R,.3125,.235,.12));
  return out;});

 // ---- 1930 · The first World Cup: a winged gold cup on a blue base, ringed by 13 cubes ----------------------------------------
 sculpture('worldcup-1930',shadow=>{shadow(0,0,.2,.2);const out:T.BufferGeometry[]=[];const k=1.35;
  // a blue octagonal base with a gold band, a slim gold figure whose swept wings hold an octagonal cup overhead
  out.push(piece(cylG(.07*k,.085*k,.09*k,8),B,0,.045*k,0,0,Math.PI/8),piece(cylG(.074*k,.074*k,.008*k,8),AU,0,.094*k,0,0,Math.PI/8));
  out.push(piece(latheG([[.04,0],[.03,.02],[.02,.08],[.024,.14],[.034,.18],[.06,.22],[.075,.26],[.07,.262],[.055,.23],[0,.215]].map(([r,y])=>[r*k,y*k] as [number,number]),8),AU,0,.098*k,0,0,Math.PI/8));
  for(const s of [-1,1])out.push(piece(boxG(.05*k,.13*k,.007*k),AU,s*.04*k,.28*k,-.012*k,0,s*.3,s*-.42));
  return out;});

 // ---- 1991 · The first Women's World Cup: a globe on a stand -----------------------------------------------------------------
 sculpture('wwc-1991',shadow=>{shadow(0,0,.2,.2);const out:T.BufferGeometry[]=[];
  out.push(piece(cylG(.07,.09,.025,28),K,0,.0125,0),piece(cylG(.012,.016,.06,12),K,0,.055,0));
  const gy=.085+.165,land=[[-.55,.5,.66,.5],[-.25,-.45,.85,.36],[.45,.3,.85,.42],[.55,-.25,.8,.3],[.95,.15,-.2,.4],[.1,.95,.2,.3]].map(([x,y,z,r])=>({d:new T.Vector3(x,y,z).normalize(),c:Math.cos(r)}));
  const wob=(n:T.Vector3)=>.08*Math.sin(n.x*9+n.y*5)*Math.cos(n.z*7-n.y*3);
  out.push(piece(new T.IcosahedronGeometry(.16,6),n=>Math.abs(n.y)>.9?W:land.some(l=>l.d.dot(n)>l.c+wob(n))?G:B,0,gy,0));
  // the meridian ring, tilted with the axis
  out.push(piece(new T.TorusGeometry(.18,.006,6,48,Math.PI),K,0,gy,0,0,-.75,-.41-Math.PI/2));
  return out;});

 // ---- 1989 · Futsal's World Cup: a tabletop indoor court ---------------------------------------------------------------------
 sculpture('futsal-1989',shadow=>{shadow(0,0,.44,.3);const out:T.BufferGeometry[]=[];
  const cw=.76,cd=.46,y=.016,lt=.006;
  out.push(piece(boxG(cw+.04,.012,cd+.04),K,0,.006,0),piece(boxG(cw,.006,cd),B,0,.015,0),piece(boxG(cw*.86,.0005,cd*.82),'#f08a3c',0,.0182,0));
  out.push(...frame(cw*.86,cd*.82,lt,.001,W,0,0,0).map(g=>{g.rotateX(-Math.PI/2);g.translate(0,y+.003,0);return g;}));
  out.push(piece(boxG(lt,.001,cd*.82),W,0,y+.003,0),piece(new T.TorusGeometry(.055,.003,4,28),W,0,y+.003,0,Math.PI/2));
  for(const s of [-1,1]){out.push(piece(new T.TorusGeometry(.09,.003,4,20,Math.PI),W,s*cw*.43,y+.003,0,Math.PI/2,0,s>0?Math.PI/2:-Math.PI/2));
   const gx=s*(cw*.43+.012);out.push(piece(cylG(.004,.004,.07,8),W,gx,y+.035,-.05),piece(cylG(.004,.004,.07,8),W,gx,y+.035,.05),piece(cylG(.004,.004,.104,8),W,gx,y+.07,0,Math.PI/2));
   out.push(piece(boxG(.002,.07,.1),H,gx+s*.03,y+.035,0,0,0,s*.4));}
  const ball=football(.028,3);ball.translate(.08,y+.031,.06);out.push(ball);
  return out;});

 // ---- Before the 1960s · Laced leather balls: an old laced ball and a modern size 5 --------------------------------------------
 sculpture('laced-leather',shadow=>{shadow(-.12,0,.2,.16);shadow(.2,.06,.13,.1);const out:T.BufferGeometry[]=[];
  const r=.15,cx=-.12;out.push(piece(new T.TorusGeometry(.07,.012,8,28),K,cx,.012,0,Math.PI/2));
  // eighteen-panel leather: three bands of panels whose seams run round the ball, darker where they meet
  out.push(piece(new T.IcosahedronGeometry(r,8),(n)=>{const seam=Math.min(Math.abs(n.x),Math.abs(n.y),Math.abs(n.z))<.035||(Math.abs(n.x)>Math.abs(n.y)&&Math.abs(n.x)>Math.abs(n.z)&&Math.abs(n.y-n.z)<.03)||(Math.abs(n.z)>Math.abs(n.y)&&Math.abs(n.z)>Math.abs(n.x)&&Math.abs(n.x-n.y)<.03);return seam?'#4a2e19':'#94603a';},cx,r+.008,0,.2,.3,0));
  // the lace: a slit across the top, stitched with cream thongs
  out.push(piece(boxG(.012,.004,.1),'#3b2414',cx,2*r+.008,0,0,.3));
  for(let i=0;i<6;i++){const t=-.04+i*.016;out.push(piece(boxG(.04,.006,.006),'#efe2c6',cx+Math.sin(.3)*t,2*r+.009-Math.abs(t)*.25,Math.cos(.3)*t,0,.3));}
  out.push(piece(new T.TorusGeometry(.05,.01,8,24),K,.2,.01,.06,Math.PI/2));const b5=football(.1,5);b5.translate(.2,.11,.06);out.push(b5);
  return out;});

 // ---- 1970 · The Telstar: an old television set, the ball in front of it (the ball is its own mesh: drag to spin it) ----------
 sculpture('telstar-1970',(shadow,p)=>{shadow(0,-.12,.26,.16);shadow(0,.2,.11,.08);const out:T.BufferGeometry[]=[];
  const tz=-.14,tw=.46,th=.32,td=.28,ty=.05+th/2;
  for(const sx of [-1,1])for(const sz of [-1,1])out.push(piece(cylG(.008,.006,.05,8),K,sx*(tw/2-.04),.025,tz+sz*(td/2-.04)));
  out.push(piece(boxG(tw,th,td),'#6b4a2f',0,ty,tz),piece(boxG(.32,.24,.01),K,-.05,ty,tz+td/2),piece(boxG(.29,.21,.006),'#8a948e',-.05,ty,tz+td/2+.004));
  out.push(piece(boxG(.002,.17,.003),'#a6aea9',-.07,ty,tz+td/2+.008));
  for(const ky of [.06,-.02])out.push(piece(cylG(.016,.016,.014,16),'#e8e2d4',tw/2-.055,ty+ky,tz+td/2+.006,Math.PI/2));
  out.push(piece(boxG(.06,.012,.004),'#e8e2d4',tw/2-.055,ty-.09,tz+td/2+.003));
  for(const s of [-1,1])out.push(piece(cylG(.003,.003,.24,6),K,s*.06,ty+th/2+.11,tz,0,0,s*-.45));
  out.push(piece(new T.SphereGeometry(.025,12,8),K,0,ty+th/2+.005,tz,0,0,0,1,.5,1));
  // the ball's cup
  out.push(piece(new T.TorusGeometry(.04,.008,8,24),K,0,.008,.2,Math.PI/2));
  solo.push({name:'museum-telstar',geometry:football(.09,7),x:p.x,y:TOP+.1,z:p.z+.2,rx:.35,ry:-.5,s:1});
  return out;});

 // ---- 1928 · Numbers and colours: three shirts on stands, 1 · 9 · 10 ---------------------------------------------------------
 sculpture('shirts',shadow=>{shadow(0,0,.42,.12);const out:T.BufferGeometry[]=[];
  const s=new T.Shape([[-.07,0],[.07,0],[.07,.15],[.115,.172],[.094,.222],[.04,.244],[.0,.226],[-.04,.244],[-.094,.222],[-.115,.172],[-.07,.15]].map(([x,y])=>new T.Vector2(x,y)));
  const shirts:[string,string,number,number,number][]=[[G,'1',-.28,.02,.25],[R,'9',0,-.03,0],[B,'10',.28,.02,-.25]];
  for(const [hex,num,x,z,ry] of shirts){const parts:T.BufferGeometry[]=[];
   parts.push(piece(new T.ExtrudeGeometry(s,{depth:.014,bevelEnabled:false}),hex,0,.09,-.007));
   parts.push(piece(new T.TorusGeometry(.035,.005,4,16,Math.PI),W,0,.09+.228,.008,0,0,Math.PI));
   const dw=.045,dh=.08,gap=.014,n=num.length,x0=-(n*dw+(n-1)*gap)/2+dw/2;[...num].forEach((ch,i)=>parts.push(...digit(ch,x0+i*(dw+gap),.09+.12,.008,dw,dh,.011,W)));
   parts.push(piece(cylG(.05,.055,.01,24),K,0,.005,0),piece(cylG(.004,.004,.1,8),K,0,.05,-.012));
   const g=join(parts);out.push(piece(g,'',x,0,z,0,ry));}
  return out;});

 // ---- Today · The Trophy room: a two-handled gold cup on a stepped base, a shelf of small cups behind -------------------------
 sculpture('hall-of-fame',shadow=>{shadow(0,.03,.24,.16);shadow(0,-.28,.34,.06);const out:T.BufferGeometry[]=[];
  out.push(piece(cylG(.1,.11,.05,32),K,0,.025,.04),piece(cylG(.075,.085,.04,32),K,0,.07,.04));
  const cup:[number,number][]=[[.065,0],[.06,.012],[.03,.03],[.016,.06],[.016,.12],[.03,.14],[.06,.165],[.09,.22],[.105,.29],[.11,.33],[.1,.332],[.095,.29],[.08,.225],[.05,.18],[0,.17]];
  out.push(piece(latheG(cup,32),AU,0,.09,.04));
  for(const s of [-1,1])out.push(piece(new T.TorusGeometry(.055,.01,8,20,Math.PI),AU,s*.1,.09+.255,.04,0,0,s>0?-Math.PI/2:Math.PI/2,1,1.15,1));
  // the shelf of your own cups
  out.push(piece(boxG(.62,.014,.1),W,0,.19,-.33),piece(boxG(.012,.19,.1),W,-.3,.095,-.33),piece(boxG(.012,.19,.1),W,.3,.095,-.33));
  const small:[number,number][]=[[.03,0],[.008,.02],[.008,.05],[.035,.065],[.042,.1],[.035,.102],[0,.07]];
  [-.18,0,.18].forEach((x,i)=>out.push(piece(latheG(small,16),i===1?G:'#c9c4b8',x,.197,-.33)));
  return out;});

 // ==== The west wing (Oct 14 2026, user: replace the Your Collection pieces "with other historical exhibits") =====================
 // Shared bits: a pitch slab, an abstract figure (rounded body + circle head, docs/museum-modern-style.md) and a goal frame.
 const slab=(w:number,d:number,out:T.BufferGeometry[],x=0,z=0)=>{out.push(piece(boxG(w+.03,.01,d+.03),K,x,.005,z),piece(boxG(w,.008,d),ART.pitch,x,.014,z));return .018;};
 const line=(out:T.BufferGeometry[],w:number,d:number,x:number,z:number,y=.0185)=>out.push(piece(boxG(w,.001,d),W,x,y,z));
 /** A figure standing at (x, z): body capsule and head, `h` tall overall. */
 const figure=(out:T.BufferGeometry[],x:number,z:number,hex:string,h=.2,y=.018)=>{const r=h*.16;out.push(piece(new T.CapsuleGeometry(r,h*.42,3,10),hex,x,y+r+h*.21,z),piece(new T.SphereGeometry(h*.13,10,7),hex,x,y+h*.87,z));};
 /** A goal frame (posts + crossbar) of width w and height h, its mouth facing `ry` (0 = +z). */
 const goal=(out:T.BufferGeometry[],x:number,z:number,w:number,h:number,ry:number,y=.018,t=.007)=>{const c=Math.cos(ry),sn=Math.sin(ry);
  for(const s of [-1,1])out.push(piece(cylG(t,t,h,10),W,x+s*w/2*c,y+h/2,z-s*w/2*sn));out.push(piece(cylG(t,t,w+2*t,10),W,x,y+h,z,0,ry,Math.PI/2));
  // a hint of net: a hairline back bar and two struts
  out.push(piece(boxG(w,.004,.004),H,x-sn*h*.55,y+.002,z-c*h*.55,0,ry));};

 // ---- 1872 · The first international: two goals facing each other across a pitch, a 0–0 board behind ---------------------------
 sculpture('first-international-1872',shadow=>{shadow(0,0,.44,.3);const out:T.BufferGeometry[]=[];const y=slab(.78,.44,out);
  line(out,.004,.4,0,0);out.push(piece(new T.TorusGeometry(.06,.0025,4,28),W,0,y+.001,0,Math.PI/2));
  goal(out,-.37,0,.16,.07,Math.PI/2,y);goal(out,.37,0,.16,.07,-Math.PI/2,y);
  // the score board on a slim stand: navy and white halves (the two teams), 0 – 0 in white seven-segment digits
  out.push(piece(cylG(.006,.006,.2,8),K,0,.1,-.27),piece(boxG(.3,.13,.02),K,0,.27,-.27));
  out.push(piece(boxG(.135,.11,.004),'#24365f',-.0725,.27,-.258),piece(boxG(.135,.11,.004),'#e8e4da',.0725,.27,-.258));
  out.push(...digit('0',-.07,.27,-.255,.045,.07,.011,W),...digit('0',.07,.27,-.255,.045,.07,.011,K));
  return out;});

 // ---- 1878 · Under the lights: a pitch with four slim floodlight towers, their heads glowing ---------------------------------------
 sculpture('floodlights-1878',(shadow,p)=>{shadow(0,0,.44,.32);const out:T.BufferGeometry[]=[];const y=slab(.6,.38,out);
  line(out,.004,.36,0,0);out.push(piece(new T.TorusGeometry(.05,.0025,4,24),W,0,y+.001,0,Math.PI/2));
  const ball=football(.022,2);ball.translate(.06,y+.022,.05);out.push(ball);
  for(const sx of [-1,1])for(const sz of [-1,1]){const tx=sx*.37,tz=sz*.25,th=.5;
   out.push(piece(cylG(.022,.026,.012,12),K,tx,.006,tz),piece(cylG(.006,.008,th,8),K,tx,th/2,tz));
   // the head: an ink frame, its lamp face turned in toward the centre spot, drawn unlit so it reads as lit
   const yaw=Math.atan2(-tx,-tz);out.push(piece(boxG(.1,.07,.016),K,tx,th+.02,tz,-.35,yaw));
   const lx=tx+Math.sin(yaw)*.0095,lz=tz+Math.cos(yaw)*.0095;
   if(opts.glow)opts.glow(piece(boxG(.088,.058,.004),'#fff4c2',p.x+lx,TOP+th+.02,p.z+lz,-.35,yaw));else out.push(piece(boxG(.088,.058,.004),'#fff4c2',lx,th+.02,lz,-.35,yaw));}
  return out;});

 // ---- 1916 · The oldest cup for nations: a silver cup on a South America map ------------------------------------------------------
 sculpture('copa-america-1916',shadow=>{shadow(0,0,.32,.36);const out:T.BufferGeometry[]=[];
  // South America as a standing ink plate, leaning back on the plinth so it faces the visitor (north up)
  const SA=[[-.1,.3],[0,.31],[.1,.28],[.18,.24],[.22,.18],[.3,.12],[.33,.06],[.26,-.02],[.21,-.1],[.13,-.16],[.07,-.22],[.03,-.3],[-.01,-.38],[-.04,-.46],[-.07,-.5],[-.1,-.44],[-.1,-.3],[-.1,-.15],[-.12,0],[-.16,.1],[-.19,.18],[-.13,.25]];
  const shape=new T.Shape(SA.map(([x,y])=>new T.Vector2(x,y)));
  const map=new T.ExtrudeGeometry(shape,{depth:.016,bevelEnabled:false});map.translate(0,.5,0);
  out.push(piece(map,K,-.06,.01,-.24,-.32,0,0,.62),piece(boxG(.36,.02,.08),K,-.06,.01,-.2));
  // the cup: a silver bowl on a stem, two side handles, on a dark wooden base
  const cup:[number,number][]=[[.05,0],[.045,.012],[.022,.03],[.012,.07],[.014,.12],[.04,.15],[.07,.2],[.078,.24],[.07,.242],[.06,.205],[.03,.165],[0,.16]];
  const cx=.14,cz=.14;out.push(piece(cylG(.055,.06,.05,6),'#5b4632',cx,.025,cz,0,Math.PI/6),piece(latheG(cup,28),'#c9ccd1',cx,.05,cz));
  for(const s of [-1,1])out.push(piece(new T.TorusGeometry(.035,.006,8,18,Math.PI),'#c9ccd1',cx+s*.075,.05+.19,cz,0,0,s>0?-Math.PI/2:Math.PI/2));
  return out;});

 // ---- 1863 · Offside: a strip of pitch, a row of figure pegs, and the offside line that slides on two rails ------------------------
 sculpture('offside-rules',shadow=>{shadow(0,0,.44,.24);const out:T.BufferGeometry[]=[];const y=slab(.8,.34,out);
  // the goal line at the right end, a small goal
  line(out,.004,.32,.38,0);goal(out,.4,0,.14,.06,-Math.PI/2,y);
  // the defenders (blue) and attackers (red); the second-last defender stands at x = .1
  const lineX=.1;figure(out,.33,.04,B,.13,y);figure(out,lineX,-.08,B,.15,y);figure(out,-.12,.07,B,.15,y);
  figure(out,.04,.08,R,.15,y);figure(out,-.25,-.06,R,.15,y);
  // the rails along both touchlines and the yellow line across, level with the second-last defender
  for(const s of [-1,1])out.push(piece(boxG(.78,.008,.012),K,0,y+.004,s*.165));
  out.push(piece(boxG(.012,.012,.36),'#f2c230',lineX,y+.012,0));
  for(const s of [-1,1])out.push(piece(boxG(.03,.02,.02),K,lineX,y+.012,s*.165));
  // the ball at the attacker's feet behind the line
  const b=football(.018,2);b.translate(-.2,y+.018,-.03);out.push(b);
  return out;});

 // ---- 1880s · Formations: a tactics board on an easel, eleven dots in the 2–3–5 of the 1880s ----------------------------------------
 sculpture('formations-history',shadow=>{shadow(0,0,.36,.22);const out:T.BufferGeometry[]=[];
  const bw=.62,bh=.42,parts:T.BufferGeometry[]=[];
  parts.push(piece(boxG(bw+.03,bh+.03,.012),K,0,0,-.008),piece(boxG(bw,bh,.004),ART.pitch,0,0,0));
  const L=(w:number,h:number,x:number,y2:number)=>parts.push(piece(boxG(w,h,.001),W,x,y2,.0025));
  L(bw-.04,.003,0,bh/2-.02);L(bw-.04,.003,0,-bh/2+.02);L(.003,bh-.04,-bw/2+.02,0);L(.003,bh-.04,bw/2-.02,0);L(bw-.04,.003,0,0);
  parts.push(piece(new T.TorusGeometry(.05,.0018,4,28),W,0,0,.0025));
  // the 2–3–5 "pyramid", goal at the bottom: keeper, two backs, three half-backs, five forwards (one team, in the gallery's blue)
  const rows:[number,number][]=[[1,-.17],[2,-.11],[3,-.03],[5,.09]];
  for(const [n,yy] of rows)for(let i=0;i<n;i++){const xx=(i-(n-1)/2)*(n===5?.11:n===3?.14:.16);parts.push(piece(cylG(.016,.016,.006,16),n===1?K:B,xx,yy,.004,Math.PI/2));}
  // turn the dots to lie on the board's face (their axis along +z)
  out.push(piece(join(parts),'',0,.3,-.02,-.42));
  // the easel: two front legs and a back leg, an ink ledge
  for(const s of [-1,1])out.push(piece(cylG(.006,.006,.42,8),K,s*.22,.2,.06,-.42));
  out.push(piece(cylG(.006,.006,.44,8),K,0,.2,-.17,.5),piece(boxG(.5,.012,.03),K,0,.11,.08,-.42));
  return out;});

 // ---- 1912 · The goalkeeper's hands: a pair of keeper gloves inside the penalty area's lines -------------------------------------
 sculpture('keeper-hands-1912',shadow=>{shadow(0,.02,.38,.26);const out:T.BufferGeometry[]=[];const y=slab(.74,.5,out);
  // the penalty area (the only place the keeper may handle since 1912) and the goal line behind
  line(out,.7,.004,0,-.22);line(out,.004,.3,-.22,-.07);line(out,.004,.3,.22,-.07);line(out,.44,.004,0,.08);
  goal(out,0,-.22,.2,.07,0,y);
  /** A glove standing upright: a white palm, blue back, ink cuff; four fingers and a thumb. */
  const glove=(x:number,z:number,ry:number,flip:number)=>{const g:T.BufferGeometry[]=[];
   g.push(piece(new T.CapsuleGeometry(.045,.05,3,10),W,0,.09,0,0,0,0,1,1,.42));
   g.push(piece(new T.CapsuleGeometry(.047,.05,3,10),B,0,.09,-.008,0,0,0,1,1,.3));
   g.push(piece(cylG(.042,.042,.045,12),K,0,.03,-.004,0,0,0,1,1,.5));
   [-.03,-.01,.01,.03].forEach((fx,i)=>g.push(piece(new T.CapsuleGeometry(.011,.045-Math.abs(i-1.5)*.008,2,6),W,fx,.175-Math.abs(i-1.5)*.006,0)));
   g.push(piece(new T.CapsuleGeometry(.012,.035,2,6),W,flip*.052,.11,.004,0,0,flip*.6));
   out.push(piece(join(g),'',x,y,z,0,ry));};
  glove(-.09,0,.25,-1);glove(.09,0,-.25,1);
  return out;});

 // ---- Free kicks and the wall: a ball on its spot, a three-figure wall 9.15 m away (the gap marked with a dashed line) ------------
 sculpture('free-kick-wall',shadow=>{shadow(0,0,.42,.3);const out:T.BufferGeometry[]=[];const y=slab(.76,.5,out);
  const bx=-.06,bz=.16,wz=-.12;
  out.push(piece(cylG(.012,.012,.002,16),W,bx,y+.001,bz));const b=football(.022,2);b.translate(bx,y+.022,bz);out.push(b);
  for(let i=0;i<5;i++)out.push(piece(boxG(.004,.001,.03),W,bx,y+.001,bz-.05-i*.045+.0));
  for(const dx of [-.06,0,.06])figure(out,bx+dx,wz,K,.2,y);
  goal(out,-.04,-.23,.26,.08,0,y);
  return out;});

 // ---- How a ball curves: a ball and the curved arc of its flight, bending round to a small goal ----------------------------------
 sculpture('ball-curve',shadow=>{shadow(0,0,.42,.24);const out:T.BufferGeometry[]=[];
  out.push(piece(boxG(.8,.008,.012),W,0,.004,.15));
  const curve=new T.CubicBezierCurve3(new T.Vector3(-.3,.06,.12),new T.Vector3(-.12,.34,.28),new T.Vector3(.18,.36,-.02),new T.Vector3(.3,.12,-.16));
  out.push(piece(new T.TubeGeometry(curve,32,.006,5,false),'#f2c230'));
  for(const t of [.25,.5,.75]){const p=curve.getPointAt(t);out.push(piece(new T.SphereGeometry(.012,10,8),'#f2c230',p.x,p.y,p.z));}
  out.push(piece(cylG(.035,.04,.012,20),K,-.3,.006,.12));const b=football(.05,4);b.translate(-.3,.06,.12);out.push(b);
  // the spin: a thin ring round the ball, tilted on its axis
  out.push(piece(new T.TorusGeometry(.07,.003,6,32),K,-.3,.06,.12,.2,0,.5));
  goal(out,.33,-.2,.18,.08,-Math.PI/4,0);
  return out;});

 // ---- The throw-in: a figure at the touchline, both hands holding the ball behind the head -----------------------------------------
 sculpture('throw-in',shadow=>{shadow(0,0,.36,.26);const out:T.BufferGeometry[]=[];const y=slab(.66,.44,out);
  // the touchline: a white strip across the slab, the pitch side in front
  line(out,.64,.012,0,-.02);
  const h=.34,r=h*.16,fx=0,fz=-.07;
  out.push(piece(new T.CapsuleGeometry(r,h*.42,3,10),K,fx,y+r+h*.21,fz,-.12),piece(new T.SphereGeometry(h*.13,10,7),K,fx,y+h*.87,fz-.015));
  // arms up and back, the ball held behind the head
  for(const s of [-1,1])out.push(piece(new T.CapsuleGeometry(.013,.13,2,6),K,fx+s*.062,y+h*.9,fz-.03,0,0,s*.32));
  const b=football(.04,3);b.translate(fx,y+h*1.12,fz-.045);out.push(b);
  return out;});

 // ---- 1956 · The Ballon d'Or: a golden ball on a stepped plinth ---------------------------------------------------------------------
 sculpture('ballon-dor',shadow=>{shadow(0,0,.22,.22);const out:T.BufferGeometry[]=[];
  out.push(piece(cylG(.13,.14,.05,32),K,0,.025,0),piece(cylG(.1,.11,.05,32),'#e6e3dc',0,.075,0),piece(cylG(.06,.08,.03,24),AU,0,.115,0));
  // the ball: gold panels, the pentagons a deeper gold
  out.push(piece(new T.IcosahedronGeometry(.16,4),n=>{let best=-1;for(const c of PENTA)best=Math.max(best,c.dot(n));return best>.936?'#b8861b':'#e3b43c';},0,.13+.16,0));
  return out;});

 return {
  /** Cases whose object is a sculpture (the scene skips their vitrine). */
  built,
  /** Pieces with their own mesh: 'museum-telstar' (it spins) and 'museum-boot'. */
  solo,
 };
}
export type ExhibitSculptures=ReturnType<typeof createExhibitSculptures>;
