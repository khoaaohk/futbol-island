import type {Decal} from '../decals';
/**
 * 2026 Trionda (USA, Mexico, Canada), rebuilt Oct 5 2026 from US D1,100,082 S (adidas, A. Galal), the Scientific American
 * tetrahedron graphic and the photos (Commons "Adidas Trionda ball.jpg", "Trionda.jpg"; the user's IMG_9135).
 *
 * Construction: 4 IDENTICAL thermally bonded panels on a tetrahedron. Each panel is a three-armed pinwheel: a hub at the
 * tetrahedron face centre and an arm toward each of its 3 corners, every arm ending in a round lobe that swings past the straight
 * tetrahedron edge into the neighbour's side. So each of the 6 seams is an S-wave (it wraps one panel's lobe, crosses, then
 * wraps the other panel's lobe), and at each of the 4 vertices three lobes swirl round a Y-junction. Chiral, 12 rotations.
 *
 * Print: every arm carries a colour field (12 in all: 4 red with the maple leaf, 4 blue with stars, 4 green with the eagle),
 * so each panel has red, blue and green, and each vertex is ringed by one field of each colour. Colour of the arm of panel x at
 * vertex v = (x XOR v) − 1, which also makes the two lobes facing each other across a seam the same colour (photo 1: two blue
 * fields across the white S). Each field has a gold, debossed outline (the patent's U-loops: 3 per panel, open toward the
 * seam), and a coloured tail runs from it along the seam toward the panel hub, where the three tails meet round a small
 * triangle. TR_CORE is shared with the Trionda Final; the logos are decals.
 */
const TET=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(x=>x/Math.sqrt(3)));
type V3=number[];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a:V3,b:V3)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=(a:V3)=>{const l=Math.hypot(a[0],a[1],a[2]);return a.map(x=>x/l);};
/** Lobe layout (radians). At each vertex the three panels' lobes split the neighbourhood into 120° sectors (the Y-junction),
 *  each sector's axis turned BETA from the vertex→own-hub direction; the lobe is that sector cut by an ellipse along the axis
 *  (centre A0 out and B0 across, semi-axes EA × EB), so its far end is round. */
export const TR_BETA=1.657,TR_A0=.654,TR_B0=-.215,TR_EA=.630,TR_EB=.448,TR_K1=.12,TR_K2=.44;
const lobes:{c:V3;u:V3;ax:V3;sd:V3}[]=[];
for(let x=0;x<4;x++)for(let v=0;v<4;v++){if(x===v){lobes.push({c:[0,0,1],u:[0,1,0],ax:[1,0,0],sd:[0,1,0]});continue;}
 const V=TET[v].map(a=>-a),F=TET[x],t0=nrm(F.map((a,i)=>a-V[i]*dot(F,V))),w=cross(V,t0);
 const ax=t0.map((a,i)=>a*Math.cos(TR_BETA)+w[i]*Math.sin(TR_BETA)),sd=cross(V,ax);
 // Ellipse centre on the sphere (azimuthal-equidistant offset (A0,B0) from the vertex) and its outward direction.
 const r=Math.hypot(TR_A0,TR_B0),dir=nrm(ax.map((a,i)=>a*TR_A0+sd[i]*TR_B0));
 const c=nrm(V.map((a,i)=>a*Math.cos(r)+dir[i]*Math.sin(r)));
 const u=nrm(ax.map((a,i)=>a-c[i]*dot(ax,c)));lobes.push({c,u,ax,sd});}
/** For decals: the centre and outward (image-top) direction of the field of panel x at vertex v. */
export function trLobe(x:number,v:number){const l=lobes[x*4+v];return {dir:l.c as unknown as [number,number,number],up:l.u as unknown as [number,number,number]};}
const g=(v:V3)=>`vec3(${v.map(a=>a.toFixed(6)).join(',')})`;
export const TR_CORE=/* glsl */`
const vec3 TR_LC[16]=vec3[](${lobes.map(l=>g(l.c)).join(',')});
const vec3 TR_LU[16]=vec3[](${lobes.map(l=>g(l.u)).join(',')});
const vec3 TR_AX[16]=vec3[](${lobes.map(l=>g(l.ax)).join(',')});
const vec3 TR_SD[16]=vec3[](${lobes.map(l=>g(l.sd)).join(',')});
float tr_smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float tr_smax(float a,float b,float k){return -tr_smin(-a,-b,k);}
/** Field colour (0 red, 1 blue, 2 green) of lobe i (= x*4+v): one of each per panel and per vertex, and the two lobes on a
 *  seam match. Round every vertex, clockwise seen from outside: red, blue, green (Commons "Trionda.jpg" and the user's IMG_9135,
 *  both looking at a vertex). */
int tr_col(int i){int lx=i/4,lv=i-lx*4;return (lx^lv)-1;}
struct TrHit{int panel;float edge;int lobe;float lobeD;int foe;float foeD;float foe2D;};
/** Each panel x = its Voronoi third of the tetrahedron, plus its 3 lobes (filleted on), minus the other panels' 9 lobes
 *  (filleted off); signed angular distances, the panel is the smallest, the seam distance half the gap to the next. */
TrHit tr_hit(vec3 p){
 float d[4];for(int i=0;i<4;i++)d[i]=dot(p,TET_F[i]);
 float L[16];vec3 tv[4];float rv[4];
 for(int v=0;v<4;v++){float cv=-d[v];rv[v]=acos(clamp(cv,-1.,1.));tv[v]=(p+TET_F[v]*cv)/max(sqrt(max(1.-cv*cv,0.)),1e-4);}
 for(int i=0;i<16;i++){int lx=i/4,lv=i-lx*4;if(lx==lv||rv[lv]>1.9){L[i]=9.;continue;}
  float a=rv[lv]*dot(tv[lv],TR_AX[i]),b=rv[lv]*dot(tv[lv],TR_SD[i]);
  float ell=(length(vec2((a-${TR_A0.toFixed(3)})/${TR_EA.toFixed(3)},(b-(${TR_B0.toFixed(3)}))/${TR_EB.toFixed(3)}))-1.)*${TR_EB.toFixed(3)};
  float sec=max(-a*.8660254+b*.5,-a*.8660254-b*.5);L[i]=tr_smax(ell,sec,.03);}
 float s1=9.,s2=9.;TrHit h=TrHit(0,0.,0,9.,0,9.,9.);
 for(int x=0;x<4;x++){
  float m=-9.;for(int y=0;y<4;y++)if(y!=x)m=max(m,d[y]);float base=asin(clamp((m-d[x])/1.63299,-1.,1.));
  float lo=9.,lf=9.,lf2=9.;int io=0,iF=0;for(int i=0;i<16;i++){if(i/4==x){if(L[i]<lo){lo=L[i];io=i;}}else if(L[i]<lf){lf2=lf;lf=L[i];iF=i;}else if(L[i]<lf2)lf2=L[i];}
  float s=tr_smax(tr_smin(base,lo,${TR_K1.toFixed(3)}),-lf,${TR_K2.toFixed(3)});
  if(s<s1){s2=s1;s1=s;h=TrHit(x,0.,io,lo,iF,lf,lf2);}else if(s<s2)s2=s;}
 h.edge=.5*(s2-s1);return h;}
`;
const POLY=/* glsl */`
/** Motif outlines (unit box, padded): maple leaf (26), eagle head facing right (16), 5-point star (10+pad). */
const vec2 TR_MAPLE[26]=vec2[](vec2(0.000,0.500),vec2(0.080,0.340),vec2(0.170,0.390),vec2(0.130,0.120),vec2(0.290,0.280),vec2(0.330,0.190),vec2(0.460,0.220),vec2(0.400,0.040),vec2(0.460,0.000),vec2(0.250,-0.170),vec2(0.290,-0.270),vec2(0.030,-0.230),vec2(0.030,-0.480),vec2(-0.030,-0.480),vec2(-0.030,-0.230),vec2(-0.290,-0.270),vec2(-0.250,-0.170),vec2(-0.460,0.000),vec2(-0.400,0.040),vec2(-0.460,0.220),vec2(-0.330,0.190),vec2(-0.290,0.280),vec2(-0.130,0.120),vec2(-0.170,0.390),vec2(-0.080,0.340),vec2(-0.080,0.340));
const vec2 TR_EAGLE[16]=vec2[](vec2(0.460,0.060),vec2(0.300,0.200),vec2(0.100,0.310),vec2(-0.120,0.320),vec2(-0.300,0.220),vec2(-0.380,0.050),vec2(-0.440,-0.200),vec2(-0.300,-0.420),vec2(-0.180,-0.260),vec2(-0.060,-0.440),vec2(0.040,-0.240),vec2(0.140,-0.360),vec2(0.180,-0.100),vec2(0.300,-0.040),vec2(0.360,-0.160),vec2(0.420,-0.080));
const vec2 TR_STAR[16]=vec2[](vec2(0.000,0.480),vec2(0.112,0.154),vec2(0.457,0.148),vec2(0.181,-0.059),vec2(0.282,-0.388),vec2(0.000,-0.190),vec2(-0.282,-0.388),vec2(-0.181,-0.059),vec2(-0.457,0.148),vec2(-0.112,0.154),vec2(-0.112,0.154),vec2(-0.112,0.154),vec2(-0.112,0.154),vec2(-0.112,0.154),vec2(-0.112,0.154),vec2(-0.112,0.154));
#define TR_POLY_BODY(N) {bool ins=false;float d=9.;vec2 a=v[N-1];for(int i=0;i<N;i++){vec2 b=v[i];if((a.y>p.y)!=(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)ins=!ins;vec2 ab=b-a;float t=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-6),0.,1.);d=min(d,length(p-a-ab*t));a=b;}return vec2(ins?1.:0.,d);}
vec2 tr_poly(vec2 p,vec2 v[16])TR_POLY_BODY(16)
vec2 tr_poly26(vec2 p,vec2 v[26])TR_POLY_BODY(26)
`;
export const trGlsl=TR_CORE+POLY+/* glsl */`
vec3 tr_base(int c){return c==0?hex(0xd5281e):c==1?hex(0x1d4fc0):hex(0x17a043);}
vec3 tr_lite(int c){return c==0?hex(0xf2563c):c==1?hex(0x3f8fe8):hex(0x52c96a);}
vec3 tr_deep(int c){return c==0?hex(0x9a1610):c==1?hex(0x10287e):hex(0x0b6a2c);}
/** fin: the Trionda Final (black fields with gold print, gold ribbons). */
Surf tr_ball(vec3 p,bool fin){
 TrHit h=tr_hit(p);
 vec3 white=hex(0xf6f6f3),gold=hex(0xc19a4c),goldL=hex(0xe2c27a);
 int ci=tr_col(h.lobe);
 vec3 base=tr_base(ci),lite=tr_lite(ci),deep=tr_deep(ci);
 if(fin){base=hex(0x141414);lite=hex(0x2c2a26);deep=hex(0x080808);}
 vec3 col=white;float groove=0.;
 // Field frame: x across, y out along the lobe (away from its vertex).
 vec3 c=TR_LC[h.lobe],up=TR_LU[h.lobe];vec3 rt=normalize(cross(up,c));up=cross(c,rt);
 vec3 gq=p/max(dot(p,c),.3)-c;vec2 x=vec2(dot(gq,rt),dot(gq,up));
 // The field: the own lobe inset by the white, raised rim; its outline is a thin gold line on a debossed groove.
 float fd=tr_smax(h.lobeD+.04,.055-h.edge,.03);
 if(fd<0.){
  float zz=fract((x.y*.7+x.x*.7)*34.);float hatch=smoothstep(.0,.15,zz)*(1.-smoothstep(.35,.5,zz));
  vec3 fc=mix(base,lite,.12*hatch);
  fc=mix(fc,deep,.45*smoothstep(-.10,-.01,fd));// darker toward the outline
  float m=0.;
  if(ci==0)m=tr_poly26(x/.62,TR_MAPLE).x;
  else if(ci==2)m=tr_poly(vec2(x.x,x.y+.03)/.60,TR_EAGLE).x;
  else{m=tr_poly((x-vec2(.08,.06))/.55,TR_STAR).x;m=max(m,tr_poly((x-vec2(-.22,-.22))/.16,TR_STAR).x);m=max(m,tr_poly((x-vec2(.25,-.28))/.13,TR_STAR).x);}
  if(fin){
   // Final: rows of gold lettering (the host-city names; abstract strokes, the real words are not drawn).
   float row=floor(x.y*4.5),rf=fract(x.y*4.5);float gx=x.x*9.+x.y*2.+row*.37;float gi=floor(gx),cf=fract(gx);
   float gh=hash3(vec3(gi,row,float(h.lobe))),gk=hash3(vec3(gi*1.7,row+4.,float(h.lobe)+2.));
   float body=step(.2,rf)*step(rf,.8)*step(.14,gh);
   float v1=step(abs(cf-.25),.08),v2=step(abs(cf-.7),.08)*step(.35,gk);
   float hb=step(.15,cf)*step(cf,.8)*(step(abs(rf-.22),.06)*step(.5,gk)+step(abs(rf-.5),.06)*step(gk,.6)+step(abs(rf-.78),.06)*step(.3,gh));
   fc=mix(fc,mix(gold,goldL,gk),clamp(body*(v1+v2+hb),0.,1.)*(.55+.45*step(.5,fract(row*.5))));
  }else fc=mix(fc,mix(lite,deep,.15),.5*m);
  col=fc;
 }
 col=mix(col,fin?goldL:gold,1.-smoothstep(.003,.006,abs(fd)));
 groove=max(groove,.38*(1.-smoothstep(.004,.012,abs(fd-.009))));
 // Ribbons: in this panel, a band hugging each neighbour's lobe (the notch) in that lobe's colour: the tail of this panel's
 // own field on the same seam, running from the field round the notch to the hub, widening there until the three meet
 // round the small gold triangle at the panel centre.
 float td=h.foeD;int fc2=tr_col(h.foe);float hubA=acos(clamp(dot(p,TET_F[h.panel]),-1.,1.));
 if(td>0.&&fd>0.){vec3 tb=fin?gold:tr_base(fc2),tl=fin?goldL:tr_lite(fc2),tdp=fin?gold*.7:tr_deep(fc2);
  float W=mix(.095,.20,smoothstep(.50,.12,hubA));
  float split=h.foe2D-td;// 0 on the line between two ribbons
  float rib=smoothstep(.030,.034,h.edge)*(1.-smoothstep(W,W+.004,td))*smoothstep(.010,.014,split);
  float ch=abs(fract(td*40.+.6*abs(fract(dot(p,vec3(11.,7.,5.))*1.5)-.5))-.5);
  vec3 rc=mix(tb,tl,.30*step(.28,ch));rc=mix(rc,tdp,.35*smoothstep(.06,.0,td-.04));
  col=mix(col,rc,rib);
  float edgeL=(1.-smoothstep(.002,.0045,abs(td-W-.006)))*step(.016,split);
  col=mix(col,gold,edgeL*(1.-smoothstep(.1,.06,hubA)));}
 // The gold triangle at the panel centre.
 {vec3 F=TET_F[h.panel];vec3 e1=normalize(cross(F,vec3(0,0,1)+F.yzx*.1)),e2=cross(F,e1);
  float tri=-9.;for(int k=0;k<3;k++){int lv=k+(k>=h.panel?1:0);vec3 V=-TET_F[lv];vec3 dv=normalize(V-F*dot(V,F));tri=max(tri,-dot(p-F*dot(p,F),dv));}
  col=mix(col,fin?goldL:gold,smoothstep(.002,-.002,tri-.045));}
 col*=.975+.035*fbm(p*44.);
 float gr=max(panelGroove(h.edge,.020,.06),groove);
 return Surf(col,gr,fin?.62:.56);}
`;
export default trGlsl+/* glsl */`
Surf design(vec3 p){return tr_ball(p,false);}
`;
const PHOTO="Trionda.jpg (Wikimedia Commons, User34790, CC BY-SA 4.0)";
/** Printed marks, placed as on the photo (looking at a vertex: adidas on the red field, the FIFA World Cup 26 emblem on the
 *  blue one, TRIONDA on the green one). The adidas Badge of Sport and the TRIONDA wordmark are redrawn as clean vectors
 *  (bar and letter proportions matched to the photo); the 26 emblem is cut from the photo. */
export const decals:Decal[]=[
 {src:'/museum/wcballs/decals/2026-trionda-1.webp',dir:[-0.3827,-0.9098,-0.1608],up:[0.8764,-0.4126,0.2482],w:.34,h:.182,gloss:.6,credit:'adidas Badge of Sport, redrawn after '+PHOTO},
 {src:'/museum/wcballs/decals/2026-trionda-2.webp',dir:[0.0557,-0.3597,-0.9314],up:[0.6182,-0.7201,0.3151],w:.25,h:.35,gloss:.6,credit:'FIFA World Cup 26 emblem, cut from '+PHOTO},
 {src:'/museum/wcballs/decals/2026-trionda-3.webp',dir:[-0.8109,-0.1526,-0.565],up:[0.5846,-0.1669,-0.794],w:.25,h:.042,gloss:.6,credit:'TRIONDA wordmark, set after '+PHOTO},
];
