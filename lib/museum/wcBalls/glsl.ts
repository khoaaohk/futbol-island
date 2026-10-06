/**
 * World Cup ball gallery (Oct 5 2026): the shared GLSL every ball design is written against. Each ball is drawn procedurally on
 * the unit sphere (no photos, no maker logos): a design is one GLSL function `Surf design(vec3 p)` that returns the colour, the
 * seam groove and the gloss at the unit-sphere point `p` (ball-local space). The viewer (ballViewer.ts) adds studio lighting,
 * the groove bump (panelGroove gives stitched panels their puffed shoulder), leather/PU sheen and the spin motion blur on top, so designs only describe the surface.
 *
 * Helpers available to every design (all colours are LINEAR; write them with hex(0xRRGGBB)):
 *  - hex(int), mix3(a,b,c,t)
 *  - hash3, vnoise, fbm (value noise, 4 octaves)
 *  - rotY/rotX/rotZ(p,a), rotAxis(p,axis,a)
 *  - polyhedral cells: icoCell, dodCell, cubeCell, octCell, tetCell, truncIcoCell (each returns a Cell: face index, the
 *    centre, the second-nearest face and `edge`, the angular distance in radians to the nearest panel edge)
 *  - seamLine(edge,width) → 0..1 groove profile; stitches(p,cell,edge,spacing,width) → 0..1 stitch dashes along the edge
 *  - laceSlot(p,axis,len,width) → 0..1 criss-cross laces on a slot (the pre-1950s balls)
 */
export const BALL_GLSL_PRELUDE=/* glsl */`
#define PI 3.14159265359
struct Surf{vec3 col;float groove;float gloss;};
struct Cell{int id;int id2;vec3 c;vec3 c2;float edge;};
vec3 hex(int h){vec3 s=vec3(float((h>>16)&255),float((h>>8)&255),float(h&255))/255.0;return pow(s,vec3(2.2));}
vec3 mix3(vec3 a,vec3 b,vec3 c,float t){return t<.5?mix(a,b,t*2.):mix(b,c,t*2.-1.);}
float hash3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vnoise(p);p*=2.03;a*=.5;}return s;}
vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rotX(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
vec3 rotZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
vec3 rotAxis(vec3 p,vec3 k,float a){float c=cos(a),s=sin(a);return p*c+cross(k,p)*s+k*dot(k,p)*(1.-c);}
float seamLine(float edge,float w){return 1.-smoothstep(w*.35,w,edge);}
/** A seam with the panel's puffed shoulder: a sharp groove of width w plus a soft dip over 'shoulder' (pillowed panels). */
float panelGroove(float edge,float w,float shoulder){return max(seamLine(edge,w),.32*(1.-smoothstep(0.,shoulder,edge)));}
`;

/** Panel sets the designs share. Each becomes a const array plus a `Cell <name>Cell(vec3 p)` function. `weight` scales a
 *  face's score (central projection of a polyhedron whose faces sit at different distances: score = dot(p,n)/distance). */
type PolySet={name:string;faces:number[][];weights?:number[]};
const PHI=(1+Math.sqrt(5))/2;
const norm=(v:number[])=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
function signs(a:number[]){const o:number[][]=[];for(const sx of [1,-1])for(const sy of [1,-1])for(const sz of [1,-1])o.push([a[0]*sx,a[1]*sy,a[2]*sz]);return o;}
const cyc=(a:number[])=>[[a[0],a[1],a[2]],[a[1],a[2],a[0]],[a[2],a[0],a[1]]];
function uniq(vs:number[][]){const m=new Map<string,number[]>();for(const v of vs)m.set(v.map(x=>(Math.abs(x)<1e-9?0:x).toFixed(5)).join(),v);return [...m.values()].map(norm);}
const ICO=uniq(signs([0,1,PHI]).flatMap(cyc));
/** The dodecahedron dual to ICO (its vertices are ICO's face centres; mind the chirality: (1/φ,0,φ), not (0,1/φ,φ)). */
const DOD=uniq([...signs([1,1,1]),...signs([1/PHI,0,PHI]).flatMap(cyc)]);
const CUBE=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const OCT=uniq(signs([1,1,1]));
const TET=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(norm);
/** The 1970 Telstar shape: 12 pentagons + 20 hexagons. Pentagon faces sit 1.0265× further out than hexagons. */
const TRUNC_W=4.534567884457026/4.654876873532654;
export const POLY_SETS:PolySet[]=[
 {name:'ico',faces:ICO},{name:'dod',faces:DOD},{name:'cube',faces:CUBE},{name:'oct',faces:OCT},{name:'tet',faces:TET},
 {name:'truncIco',faces:[...ICO,...DOD],weights:[...ICO.map(()=>TRUNC_W),...DOD.map(()=>1)]},
];
const f=(x:number)=>x.toFixed(6);
function polyGlsl({name,faces,weights}:PolySet){
 const n=faces.length,arr=faces.map((v,i)=>{const w=weights?.[i]??1;return `vec3(${f(v[0]*w)},${f(v[1]*w)},${f(v[2]*w)})`;}).join(',');
 const U=name.toUpperCase();
 return `const vec3 ${U}_F[${n}]=vec3[](${arr});
Cell ${name}Cell(vec3 p){int b=0,b2=0;float s=-9.,s2=-9.;for(int i=0;i<${n};i++){float d=dot(p,${U}_F[i]);if(d>s){s2=s;b2=b;s=d;b=i;}else if(d>s2){s2=d;b2=i;}}
 float e=9.;vec3 cb=${U}_F[b];for(int i=0;i<${n};i++){if(i==b)continue;vec3 dn=cb-${U}_F[i];e=min(e,(s-dot(p,${U}_F[i]))/length(dn));}
 return Cell(b,b2,normalize(cb),normalize(${U}_F[b2]),e);}
`;
}
export const BALL_GLSL_POLY=POLY_SETS.map(polyGlsl).join('\n')+/* glsl */`
/** Stitch dashes along the nearest edge of a cell (for stitched balls): a row of short marks just inside the seam. */
float stitches(vec3 p,Cell c,float spacing,float w){vec3 e1=normalize(c.c+c.c2),e2=normalize(cross(c.c,c.c2));float along=atan(dot(p,e2),dot(p,e1));
 float dash=smoothstep(.25,.0,abs(fract(along/spacing)-.5)-.18);return dash*(1.-smoothstep(w*.6,w,abs(c.edge-w*1.6)));}
/** Criss-cross laces on a slot centred on 'axis' (unit), the slot running along 'dir'. */
float laceSlot(vec3 p,vec3 axis,vec3 dir,float len,float w){vec3 side=normalize(cross(axis,dir));float a=dot(p,dir),b=dot(p,side);if(dot(p,axis)<.5)return 0.;
 if(abs(a)>len)return 0.;float slot=1.-smoothstep(w*.25,w*.35,abs(b));float t=a/len*5.;float x1=abs(b-(fract(t)-.5)*w*1.6),x2=abs(b+(fract(t)-.5)*w*1.6);
 float lace=(1.-smoothstep(.0,w*.18,min(x1,x2)))*step(abs(b),w*.85);return max(slot*.6,lace);}
/** Cube-face helpers: which face (0..5 = +x,−x,+y,−y,+z,−z), and the gnomonic (u,v) on it. */
int cubeFace(vec3 p){vec3 a=abs(p);if(a.x>=a.y&&a.x>=a.z)return p.x>0.?0:1;if(a.y>=a.z)return p.y>0.?2:3;return p.z>0.?4:5;}
vec2 cubeUV(vec3 p,int f){vec3 a=abs(p);if(f<2)return p.yz/a.x;if(f<4)return p.zx/a.y;return p.xy/a.z;}
/**
 * The classic laced leather ball (1930s–1950s): 6 groups of 3 parallel strips (18 panels, the volleyball layout: each cube
 * face's strips turn 90° from its neighbours'), stitched seams, a laced slot on the top face, tanned leather with grain and
 * per-panel tone. 'tone' is the leather colour; 'strips' 3 for 18 panels (2 gives the 12-panel look).
 */
Surf leatherStrips(vec3 p,vec3 tone,float strips,bool laces){
 int f=cubeFace(p);vec2 uv=cubeUV(p,f);float s=uv.x,t=uv.y;
 float w=2./strips,k=clamp(floor((s+1.)/w),0.,strips-1.),local=(s+1.)-k*w;
 float edgeCube=(1.-max(abs(s),abs(t)))*.62,edgeStrip=min(local,w-local)*.62*(1.-.25*abs(t));
 float edge=min(edgeCube,edgeStrip);
 float id=float(f)*strips+k,h=hash3(vec3(id*1.7,id*.31,3.));
 float grain=fbm(p*38.)*.5+fbm(p*9.+id)*.5;
 vec3 col=tone*(.82+.28*h)*(.86+.28*grain);
 col*=1.-.18*smoothstep(.0,.12,.12-edge);// panels darken toward the seams (worn, oiled edges)
 float g=seamLine(edge,.018);
 // Stitch marks just inside each seam.
 float along=edgeCube<edgeStrip?(abs(s)>abs(t)?t:s):t;float st=smoothstep(.3,.0,abs(fract(along*22.)-.5)-.12)*(1.-smoothstep(.004,.009,abs(edge-.024)));
 col=mix(col,tone*.42,st*.7);
 if(laces&&f==2&&k==floor(strips*.5)){float a=uv.y,b=local-w*.5;if(abs(a)<.42){float slot=1.-smoothstep(.022,.03,abs(b));float tt=fract(a*9.)-.5,x1=abs(b-tt*.11),x2=abs(b+tt*.11);
  float lace=(1.-smoothstep(.0,.012,min(x1,x2)))*step(abs(b),.06);col=mix(col,tone*.3,slot*.8);col=mix(col,hex(0xd9c49a)*(.8+.2*grain),lace);g=max(g,slot*.7);}}
 return Surf(col,g,.18+.1*grain);}
`;
