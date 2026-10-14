/**
 * Football shop · Ball studio shader (Oct 12 2026). One ShaderMaterial draws the whole ball in a single draw call:
 *  - the panel construction is computed per pixel on the unit sphere (no panel meshes): the classic truncated icosahedron
 *    (12 pentagons + 20 hexagons), a rhombicuboctahedron (26), a truncated octahedron (14), a 6-panel "propeller" cube with
 *    S-curved seams, an 8-panel octant ball with wavy bonded seams, and the vintage 18-strip laced leather ball. The
 *    polyhedron/central-projection maths and the leather strip chart are reused from the museum's World Cup ball gallery
 *    (lib/museum/wcBalls/glsl.ts); the layouts themselves are generic geometry, not any maker's design;
 *  - seams are real grooves (a bump from the seam distance, with a puffed panel shoulder), plus stitches on stitched balls;
 *  - colours per panel group (uniforms), the pattern layer (an equirectangular red/green coverage mask, recoloured here),
 *    up to 8 decals projected from one atlas (premultiplied alpha, so mipmaps have no dark fringes), and a selection outline;
 *  - finishes: glossy PU, matte, micro-dimples (procedural normal perturbation), leather grain, holo foil, metallic accents;
 *  - the kid's own art (Draw step, Oct 12 2026): per-panel fill colours (uFill, indexed by the panel id that layoutAt()
 *    computes; lib/shop/ballPanels.ts mirrors it in JS for the fill tool) over the panels and pattern, then the hand-drawn
 *    layer (uDraw: an equirect, premultiplied RGBA texture, lib/shop/ballPaint.ts) over that, both under the stickers;
 *  - studio lighting: key/fill/rim lights plus an analytic studio environment (two rectangular softboxes over a floor/ceiling
 *    gradient) for the gloss, so no cube map or PMREM pass is needed.
 * Each layout compiles its own small program (#define LAYOUT), cached by the stage; phones also drop the motion-blur path.
 */
import {BALL_GLSL_PRELUDE,POLY_SETS} from '../museum/wcBalls/glsl';
import type {BallLayout} from './ball';

export const LAYOUT_INDEX:Record<BallLayout,number>={classic32:0,panel26:1,panel14:2,propeller6:3,panel8:4,leather18:5};
export const MAX_SHADER_DECALS=8;
/** Panel-fill slots (the most panels any layout has: classic32). */
export const MAX_FILLS=32;

type Poly={name:string;faces:number[][];weights:number[]};
const norm=(v:number[])=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
const trunc=POLY_SETS.find(p=>p.name==='truncIco')!;
const AXES=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const EDGES=[[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],[1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1],[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1]].map(norm);
const CORNERS=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]].map(norm);
/** Central projection weights = 1/(face distance), relative. Rhombicuboctahedron: squares at 1+√2, triangles at (3+√2)/√3. */
const RHOMBI_TRI=(1+Math.SQRT2)/((3+Math.SQRT2)/Math.sqrt(3));
/** Truncated octahedron (vertices = perms of (0,±1,±2)): squares at 2, hexagons at √3. */
const TOCT_HEX=2/Math.sqrt(3);
const POLYS:Poly[]=[
 {name:'tIco',faces:trunc.faces,weights:trunc.weights??trunc.faces.map(()=>1)},
 {name:'rhombi',faces:[...AXES,...EDGES,...CORNERS],weights:[...AXES.map(()=>1),...EDGES.map(()=>1),...CORNERS.map(()=>RHOMBI_TRI)]},
 {name:'tOct',faces:[...AXES,...CORNERS],weights:[...AXES.map(()=>1),...CORNERS.map(()=>TOCT_HEX)]},
];
const f6=(x:number)=>x.toFixed(6);
function polyGlsl({name,faces,weights}:Poly){
 const n=faces.length,U=name.toUpperCase(),arr=faces.map((v,i)=>`vec3(${f6(v[0]*weights[i])},${f6(v[1]*weights[i])},${f6(v[2]*weights[i])})`).join(',');
 return `const vec3 ${U}_F[${n}]=vec3[](${arr});
Cell ${name}Cell(vec3 p){int b=0,b2=0;float s=-9.,s2=-9.;for(int i=0;i<${n};i++){float d=dot(p,${U}_F[i]);if(d>s){s2=s;b2=b;s=d;b=i;}else if(d>s2){s2=d;b2=i;}}
 float e=9.;vec3 cb=${U}_F[b];for(int i=0;i<${n};i++){if(i==b)continue;vec3 dn=cb-${U}_F[i];e=min(e,(s-dot(p,${U}_F[i]))/length(dn));}
 return Cell(b,b2,normalize(cb),normalize(${U}_F[b2]),e);}
`;}
const POLY_USED:Record<number,string>={0:'tIco',1:'rhombi',2:'tOct'};

export const BALL_VERT=/* glsl */`
varying vec3 vObj;varying vec3 vPos;varying vec3 vN;varying vec2 vUv;
void main(){vObj=position;vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vPos=mv.xyz;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}`;

/** The fragment shader for one layout. `blur` adds the spin motion-blur path (desktop only). */
export function ballFrag(layout:BallLayout,blur:boolean){
 const L=LAYOUT_INDEX[layout],poly=POLY_USED[L];
 const P=POLYS.find(p=>p.name===poly);
 return /* glsl */`
#define LAYOUT ${L}
${blur?'#define BLUR 1':''}
uniform vec3 uColA,uColB,uColC;uniform int uFinish;
uniform sampler2D uPat;uniform vec3 uPatC1,uPatC2,uPatMask;uniform float uPatOn;
uniform sampler2D uDecalTex;uniform int uDecalN;uniform int uSel;
uniform vec3 uDDir[${MAX_SHADER_DECALS}];uniform vec3 uDUp[${MAX_SHADER_DECALS}];uniform vec4 uDSize[${MAX_SHADER_DECALS}];uniform vec4 uDRect[${MAX_SHADER_DECALS}];
uniform float uBlur;uniform vec3 uBlurAxis;uniform float uDetail;
uniform vec4 uFill[${MAX_FILLS}];uniform sampler2D uDraw;uniform float uDrawOn;uniform int uDebug;
varying vec3 vObj;varying vec3 vPos;varying vec3 vN;varying vec2 vUv;
${BALL_GLSL_PRELUDE}
${P?polyGlsl(P):''}
struct Pan{int grp;float id;float edge;float stitch;float lace;float slot;};
float stitchRow(vec3 p,Cell c,float spacing,float w){vec3 e1=normalize(c.c+c.c2),e2=normalize(cross(c.c,c.c2));float along=atan(dot(p,e2),dot(p,e1));
 float dash=smoothstep(.25,.0,abs(fract(along/spacing)-.5)-.18);return dash*(1.-smoothstep(w*.6,w,abs(c.edge-w*1.7)));}
int cubeFace(vec3 p){vec3 a=abs(p);if(a.x>=a.y&&a.x>=a.z)return p.x>0.?0:1;if(a.y>=a.z)return p.y>0.?2:3;return p.z>0.?4:5;}
vec2 cubeUV(vec3 p,int f){vec3 a=abs(p);if(f<2)return p.yz/a.x;if(f<4)return p.zx/a.y;return p.xy/a.z;}
Pan layoutAt(vec3 p){
#if LAYOUT==0
 Cell c=tIcoCell(p);return Pan(c.id<12?0:1,float(c.id),c.edge,stitchRow(p,c,.032,.0065),0.,0.);
#elif LAYOUT==1
 Cell c=rhombiCell(p);return Pan(c.id<6?0:(c.id<18?1:2),float(c.id),c.edge*1.1,0.,0.,0.);
#elif LAYOUT==2
 Cell c=tOctCell(p);return Pan(c.id<6?0:1,float(c.id),c.edge,0.,0.,0.);
#elif LAYOUT==3
 // Six identical panels on a cube frame whose seams bend into S-curves: face i beats face j when |p_i|-|p_j| > h_ij, with
 // h antisymmetric (h_ji = -h_ij), a sine along the shared edge so each seam swings one way then the other.
 vec3 a=abs(p),s=vec3(p.x>=0.?1.:-1.,p.y>=0.?1.:-1.,p.z>=0.?1.:-1.);const float A=.2,K=5.4414;
 float mxy=a.x-a.y-A*sin(K*p.z)*s.x*s.y,myz=a.y-a.z-A*sin(K*p.x)*s.y*s.z,mzx=a.z-a.x-A*sin(K*p.y)*s.z*s.x;
 int w;float e;
 if(mxy>0.&&mzx<0.){w=0;e=min(mxy,-mzx);}else if(myz>0.&&mxy<0.){w=1;e=min(myz,-mxy);}else if(mzx>0.&&myz<0.){w=2;e=min(mzx,-myz);}
 else{w=a.x>=a.y&&a.x>=a.z?0:(a.y>=a.z?1:2);e=0.;}
 float sw=w==0?s.x:(w==1?s.y:s.z);return Pan(w,float(w*2)+(sw>0.?0.:1.),e*.62,0.,0.,0.);
#elif LAYOUT==4
 // Eight octant panels with wavy heat-bonded seams (the octant planes pushed by a smooth warp).
 vec3 q=p+.15*vec3(sin(3.3*p.y+2.1*p.z+.5),sin(3.3*p.z+2.1*p.x+1.3),sin(3.3*p.x+2.1*p.y+2.2));
 vec3 aq=abs(q);vec3 sg=step(0.,q);return Pan(int(mod(sg.x+sg.y+sg.z,2.)),sg.x+sg.y*2.+sg.z*4.,min(aq.x,min(aq.y,aq.z))*.68,0.,0.,0.);
#else
 // 18 leather strips: 6 cube faces × 3 strips, each face's strips turned 90° from its neighbours' (the volleyball layout),
 // stitched seams, and a laced slot over the valve on the top face's middle strip.
 int f=cubeFace(p);vec2 uv=cubeUV(p,f);float s=uv.x,t=uv.y;const float strips=3.;
 float w=2./strips,k=clamp(floor((s+1.)/w),0.,strips-1.),local=(s+1.)-k*w;
 float edgeCube=(1.-max(abs(s),abs(t)))*.62,edgeStrip=min(local,w-local)*.62*(1.-.25*abs(t));float edge=min(edgeCube,edgeStrip);
 float along=edgeCube<edgeStrip?(abs(s)>abs(t)?t:s):t;
 float st=smoothstep(.3,.0,abs(fract(along*24.)-.5)-.12)*(1.-smoothstep(.004,.009,abs(edge-.026)));
 float lace=0.,slot=0.;
 if(f==2&&k==1.){float la=uv.y,lb=local-w*.5;if(abs(la)<.5){slot=(1.-smoothstep(.03,.04,abs(lb)))*(1.-smoothstep(.44,.5,abs(la)));
  float tt=fract(la*6.)-.5,x1=abs(lb-tt*.2),x2=abs(lb+tt*.2);lace=(1.-smoothstep(.012,.022,min(x1,x2)))*(1.-smoothstep(.085,.1,abs(lb)))*(1.-smoothstep(.42,.46,abs(la)));
  float hole=1.-smoothstep(.01,.016,length(vec2((fract(la*6.+.5)-.5)/6.,abs(lb)-.092)));slot=max(slot,hole*(1.-smoothstep(.44,.48,abs(la))));}}
 return Pan(k==1.?1:0,float(f)*3.+k,edge,st,lace,slot);
#endif
}
float groovePx(Pan L){
#if LAYOUT==0
 return panelGroove(L.edge,.012,.085);
#elif LAYOUT==5
 return panelGroove(L.edge,.016,.1);
#else
 return panelGroove(L.edge,.011,.06);
#endif
}
vec2 dirUV(vec3 d){float u=atan(d.z,-d.x)/(2.*PI);return vec2(u<0.?u+1.:u,1.-acos(clamp(d.y,-1.,1.))/PI);}
vec3 baseCol(Pan L){return L.grp==0?uColA:(L.grp==1?uColB:uColC);}
float grpMask(Pan L){return L.grp==0?uPatMask.x:(L.grp==1?uPatMask.y:uPatMask.z);}
/** Panel colour + pattern at p; 'cov' gets the pattern coverage. */
vec3 paint(vec3 p,Pan L,vec3 pm,out float cov){vec3 col=baseCol(L);
#if LAYOUT==5
 if(L.lace>0.)col=mix(col,uColC,L.lace);
#endif
 float g=grpMask(L)*uPatOn*(1.-L.lace),r1=pm.r*g,r2=pm.g*g;col=mix(col,uPatC1,r1);col=mix(col,uPatC2,r2);cov=max(r1,r2);
 // A filled panel (Draw step) covers its colour and pattern; laces stay laces.
 vec4 fl=uFill[int(L.id+.5)];float fa=fl.a*(1.-L.lace);col=mix(col,fl.rgb,fa);cov*=1.-fa;return col;}
/** The studio around the ball, seen in a reflection (view space): floor/ceiling gradient plus two rectangular softboxes. */
float softbox(vec3 R,vec3 k,vec3 up,vec2 hs,float soft){float d=dot(R,k);if(d<=0.)return 0.;vec3 r=normalize(cross(up,k)),u=cross(k,r);vec2 l=vec2(dot(R,r),dot(R,u))/d;
 return smoothstep(hs.x+soft,hs.x-soft*.5,abs(l.x))*smoothstep(hs.y+soft,hs.y-soft*.5,abs(l.y));}
vec3 studio(vec3 R,float gloss){float soft=mix(.55,.06,gloss);
 vec3 c=mix(vec3(.13,.12,.11),vec3(.78,.8,.84),smoothstep(-.35,.55,R.y))+vec3(.06,.05,.03)*(1.-smoothstep(-.2,0.,abs(R.y)));
 c+=vec3(2.6,2.5,2.35)*softbox(R,normalize(vec3(-.55,.62,.56)),vec3(0,1,0),vec2(.42,.3),soft);
 c+=vec3(1.3,1.35,1.45)*softbox(R,normalize(vec3(.88,.12,.3)),vec3(0,1,0),vec2(.1,.55),soft);
 c+=vec3(.9)*softbox(R,normalize(vec3(.1,.95,-.2)),vec3(0,0,1),vec2(.5,.2),soft*1.4);
 return c;}
vec3 bumpNormal(vec3 pos,vec3 n,float h){vec3 dx=dFdx(pos),dy=dFdy(pos);float hx=dFdx(h),hy=dFdy(h);
 vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);vec3 g=sign(det)*(hx*r1+hy*r2);return normalize(abs(det)*n-g);}
void main(){
 vec3 p=normalize(vObj);Pan L=layoutAt(p);
 // Test hook (stage.debugPanelIds): the raw panel id and group, so the JS mirror can be checked against the GPU.
 if(uDebug==1){gl_FragColor=vec4(float(int(L.id+.5))/255.,float(L.grp)/255.,0.,1.);return;}
 vec3 pm=texture2D(uPat,vUv).rgb;float cov;vec3 col=paint(p,L,pm,cov);
 float groove=groovePx(L);
#ifdef BLUR
 if(uBlur>.004){vec3 c=vec3(0);float g=0.;for(int i=0;i<6;i++){float t=(float(i)/5.-.5)*uBlur;vec3 q=rotAxis(p,uBlurAxis,t);Pan Q=layoutAt(q);float cv;
  c+=paint(q,Q,textureLod(uPat,dirUV(q),2.).rgb,cv);g+=groovePx(Q);}col=c/6.;groove=g/6.;}
#endif
 int fin=uFinish;float h=0.;
 // Panel-to-panel tone and a faint large-scale mottling: real panels are cut from different parts of the sheet.
 float pid=hash3(vec3(L.id*1.37,L.id*.21,4.1));col*=.975+.05*pid;
 float gloss=fin==0?.9:(fin==1?.22:(fin==2?.62:(fin==3?.3:(fin==4?.86:.8))));
 float metal=0.,holo=0.;
 if(fin==2){vec3 g=p*30.;vec3 fc=fract(g)-.5;float dd=length(fc);h-=smoothstep(.42,.12,dd)*.0016*uDetail;}
 if(fin==1){h+=(vnoise(p*90.)-.5)*.0006*uDetail;}
 if(fin==3){float gr=fbm(p*46.);col*=.84+.3*gr;col*=1.-.22*(1.-smoothstep(.0,.09,L.edge));h+=(gr-.5)*.0024*uDetail;gloss=.22+.16*gr;}
 if(fin==4)holo=L.grp==0?1.:0.;
 if(fin==5)metal=uPatOn>.5?cov:(L.grp==1?1.:0.);
#if LAYOUT==5
 // Leather ball: tanned grain whatever the finish, darker oiled seams, the lace slot sunk in.
 if(fin!=3){float gr=fbm(p*46.);col*=.9+.18*gr;h+=(gr-.5)*.0014*uDetail;}
 col=mix(col,col*.35,L.slot*(1.-L.lace));groove=max(groove,L.slot*.8*(1.-L.lace));
 h+=L.lace*.0035;
 col=mix(col,col*.55,L.stitch*.75);
#endif
#if LAYOUT==0
 col=mix(col,col*.72,L.stitch*.5);h-=L.stitch*.0006;
#endif
 // The kid's drawing (premultiplied, sRGB-decoded by the texture), sampled with the same equirect chart as the JS painter.
 float ink=0.;
 if(uDrawOn>.5){vec4 dr=texture2D(uDraw,vec2(dirUV(p).x,acos(clamp(p.y,-1.,1.))/PI));col=col*(1.-dr.a)+dr.rgb;ink=dr.a;
  metal*=1.-ink;holo*=1.-ink;gloss=mix(gloss,max(gloss*.9,.42),ink);}
 // The valve: a small rubber dot with a ring, on the back of every ball (under the laces on the leather one).
#if LAYOUT!=5
 {vec3 vd=normalize(vec3(.34,-.46,-.82));float va=acos(clamp(dot(p,vd),-1.,1.));
  col=mix(col,col*.42+.015,(1.-smoothstep(.009,.012,va)));col=mix(col,col*.75,(1.-smoothstep(.002,.004,abs(va-.017))));h-=(1.-smoothstep(.008,.013,va))*.0008;}
#endif
 // Decals (premultiplied atlas), with a dashed outline round the selected one.
 float dec=0.;
 for(int i=0;i<${MAX_SHADER_DECALS};i++){if(i>=uDecalN)break;vec3 d=uDDir[i];float cd=dot(p,d);if(cd<.15)continue;
  vec3 r=normalize(cross(uDUp[i],d)),u=cross(d,r);vec2 a=vec2(atan(dot(p,r),cd),atan(dot(p,u),cd));vec2 q=a/uDSize[i].xy*.5+.5;
  float inside=step(0.,q.x)*step(0.,q.y)*step(q.x,1.)*step(q.y,1.);
  vec2 cq=clamp(q,.001,.999);vec4 t=texture2D(uDecalTex,vec2(uDRect[i].x+cq.x*uDRect[i].z,uDRect[i].y+(1.-cq.y)*uDRect[i].w))*inside;
  col=col*(1.-t.a)+t.rgb;dec=max(dec,t.a);
  if(i==uSel){vec2 m=abs(a)-uDSize[i].xy-.025;float ring=1.-smoothstep(.006,.012,abs(max(m.x,m.y)));float dash=step(.5,fract((a.x-a.y)*18.));col=mix(col,mix(vec3(1.,.82,.25),vec3(.08,.2,.16),dash),ring);}}
 // Printed decals sit flat in the seams' bump and take a satin sheen.
 groove*=1.-dec*.85;gloss=mix(gloss,max(gloss*.85,.5),dec);metal*=1.-dec;holo*=1.-dec;
 h-=groove*.0075;
 vec3 N=normalize(vN);N=bumpNormal(vPos,N,h);
 vec3 V=normalize(-vPos);float ndv=max(dot(N,V),0.);
 if(holo>0.){vec3 ir=.5+.5*cos(6.2832*(vec3(0.,.33,.67)+ndv*1.4+p.y*.8+p.x*.5));col=mix(col,col*.55+ir*.6,.42*holo*(.55+.45*(1.-ndv)));}
 vec3 L1=normalize(vec3(-.5,.72,.55)),L2=normalize(vec3(.85,.12,.4)),L3=normalize(vec3(.25,.55,-.8));
 float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),hemi=.5+.5*N.y;
 float ao=1.-.62*groove;
 vec3 amb=mix(vec3(.2,.19,.18),vec3(.56,.6,.66),hemi);
 vec3 diff=col*(d1*1.0+d2*.32+amb*.62)*ao;
 float shin=mix(10.,260.,gloss*gloss);vec3 H1=normalize(L1+V),H2=normalize(L2+V);
 float spec=(pow(max(dot(N,H1),0.),shin)*1.2+pow(max(dot(N,H2),0.),shin)*.35)*mix(.03,1.,gloss)*(shin+8.)/60.;
 float F=.04+.96*pow(1.-ndv,5.);
 vec3 R=reflect(-V,N);vec3 env=studio(R,gloss);
 float rim=pow(1.-ndv,3.)*max(dot(N,L3)+.4,0.)*.35;
 vec3 outc=diff*(1.-F*gloss*.9)+env*F*mix(.25,1.,gloss)*ao+vec3(spec)*ao+rim*mix(vec3(.6),col,.3);
 if(metal>0.){vec3 m=env*col*1.15*ao+vec3(spec)*col*1.6+col*d1*.12;outc=mix(outc,m,metal);}
 if(holo>0.)outc+=vec3(spec)*.4*holo*(.5+.5*cos(6.2832*(vec3(0.,.33,.67)+ndv*2.)));
 gl_FragColor=vec4(outc,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;}
