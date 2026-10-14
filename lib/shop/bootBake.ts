import * as T from 'three';
import {QUILT_SP,BAND_SP,RIB_SP} from './bootGeometry';
import {NATURAL_ROUGHNESS as NR} from './bootMaterials';

/**
 * The boot's design layer, baked on the GPU (Oct 12 2026). The upper mesh is drawn once in UV space (gl_Position = uv) into two
 * render targets: the albedo (rgb + a "finish mask" in alpha: 1 = the chosen finish applies, 0 = matte fabric like the lining)
 * and a tangent-space normal map (knit stitches, synthetic grip dots, leather grain and quilting, seams with stitching, eyelets,
 * the embroidered name). Every pixel knows its 3D position, so:
 *  - zone colours and patterns are computed from the shape (seamless across the heel seam and the toe), and
 *  - stickers, flags and quotes are PROJECTED onto the upper from their zone's direction, like a projector (no stretching
 *    from the UV layout, no DecalGeometry draw calls). Their pixels come from one small atlas CanvasTexture (bootScene.ts),
 *    which is re-uploaded only when the set of stickers changes; moving or resizing one only changes uniforms.
 * The bake runs only after an edit (two draws), never per frame; the boot's own material just samples the result.
 * Silhouettes (Oct 12 2026): the lacing (offset, rows, width) and the era features arrive as uniforms (uLace, uFeat, uToeCap):
 * a quilted toe, a rubber strike pad, a grip texture, a plain stitched side panel, a stitched toe cap with perforations; the
 * fins, the lace cover and a fold-over tongue's flap are geometry, painted here by their part id.
 */
export const MAX_DECALS=12;
export const MAX_EYELETS=14;

const VERT=/* glsl */`
attribute vec4 aZone;attribute vec2 aSurf;attribute float aAO;
varying vec3 vPos;varying vec3 vNor;varying vec4 vZone;varying vec2 vSurf;varying float vAO;
void main(){vPos=position;vNor=normal;vZone=aZone;vSurf=aSurf;vAO=aAO;gl_Position=vec4(uv*2.-1.,0.,1.);}`;

/*
 * Natural materials (Oct 13 2026; user: "all the boots look plastic and shiny, they need to look more natural"): the normal
 * target's alpha carries a per-texel ROUGHNESS (the boot material reads it, bootScene.ts): soft matte leather with a slight sheen
 * only on the toe, satin synthetic, matte knit, matte rubber fins and pads, rough lining and thread. The albedo carries the
 * occlusion baked from the geometry (aAO: seams, quilting grooves, where the upper meets the plate) and the stitching colour.
 */
const FRAG=/* glsl */`
precision highp float;
varying vec3 vPos;varying vec3 vNor;varying vec4 vZone;varying vec2 vSurf;varying float vAO;
uniform vec3 uToe,uMid,uHeel,uCollar,uLaces,uAccent;
uniform int uPattern,uUpper;uniform float uLaced,uFinishMetal,uToeCap;
uniform vec4 uLace;// lace line offset, first and last eyelet row (s), eyelet half-width
uniform vec4 uFeat;// quilted toe, strike pad, grip texture, stitched side panel (0–1)
uniform vec4 uFeat2;// pebbled rubber pads, bandage wrap, knit ribs, lace-cage edge
uniform vec4 uHeelL;// the heel block's front edge: a + b·yr + c·yr² + d·(1−yr)³
uniform vec2 uSide;// a stitched wave line along the sides, a heel tab
uniform vec3 uEye[${MAX_EYELETS}];
uniform vec3 uDC[${MAX_DECALS}];uniform vec3 uDA[${MAX_DECALS}];uniform vec3 uDU[${MAX_DECALS}];
uniform vec4 uDS[${MAX_DECALS}];uniform vec4 uDR[${MAX_DECALS}];uniform vec4 uDT[${MAX_DECALS}];
uniform int uDCount;uniform int uSel;uniform sampler2D uAtlas;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vnoise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
/* Leather grain: rounded pebbles (cellular), p in cells. */
float pebble(vec2 p){vec2 i=floor(p),f=fract(p);float d=9.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=vec2(hash(i+g),hash(i+g+5.3))*.8+.1;d=min(d,length(g+o-f));}
 return 1.-smoothstep(.15,.62,d);}

/* Knit: columns of V-shaped loops. p in stitches. */
float knit(vec2 p){float col=fract(p.x)-.5;float row=p.y+abs(col)*.9;float r=fract(row);
 float h=smoothstep(0.,.32,r)*smoothstep(1.,.55,r);h*=1.-pow(abs(col)*2.,3.)*.75;return h;}
/* Sock collar rib. */
float rib(vec2 p){float c=abs(fract(p.x)-.5)*2.;return (1.-c*c)*(.75+.25*knit(p*vec2(2.,1.)));}

struct Surf{vec3 col;float h;float mask;float r;float thread;};
float baseRough(){return uUpper==0?${NR.knit}:uUpper==1?${NR.synthetic}:${NR.leather};}

/*
 * Seam: a groove on the border line and a DOUBLE row of stitches beside it, each stitch a raised thread dash sunk at its ends.
 * d = signed distance to the border (dm), along = distance along it. Returns the height; thread() marks the stitch pixels.
 */
float stitchRow(float d,float along,float off){float line=1.-smoothstep(.0011,.0026,abs(d-off));float t=fract(along/.024);
 float dash=smoothstep(.06,.16,t)*(1.-smoothstep(.62,.74,t));return line*dash;}
float threadM=0.;
float seam(float d,float along){float g=1.-smoothstep(.0,.0055,abs(d));
 float a=stitchRow(d,along,.0105),b=stitchRow(d,along+.012,.0175);threadM=max(threadM,max(a,b));
 return -g*1.1+(a+b)*.75-(1.-smoothstep(.0,.0045,abs(d-.0105)))*.12-(1.-smoothstep(.0,.0045,abs(d-.0175)))*.12;}

Surf shade(vec3 P,vec2 surf,vec4 zone,vec3 nor){
 Surf o;o.mask=1.;o.h=0.;o.col=uMid;o.r=baseRough();o.thread=0.;threadM=0.;
 int p=int(zone.w+.5);float s=zone.x,yr=zone.y,rimd=zone.z;
 // a fold-over tongue: past the fold (zone.z) the back face is the flap's top and the front face is underneath
 bool flap=p==3&&zone.y>zone.z,under=p==2&&zone.y>zone.z;
 // ---- lining, the tongue's back, inner collar, under the lace cover: dark soft fabric ----
 if(p==1||(p==3&&!flap)||under||p==5||p==8){
  o.col=mix(vec3(.05,.055,.06),uCollar,.14);o.h=knit(surf/vec2(.03,.03))*.12;o.mask=0.;o.r=${NR.lining};
  if(p==1&&yr<.2){o.col=mix(vec3(.11,.11,.12),uCollar,.18);o.h=0.;} // insole
  return o;}
 // ---- rubber fins (the pattern colour): matte moulded rubber with a fine texture ----
 if(p==6){o.col=uAccent*(.92+.08*vnoise(surf*900.));o.h=vnoise(surf*700.)*.25;o.mask=.25;o.r=${NR.rubber};return o;}
 // ---- the lace cover: the laces colour, a smooth skin with a stitched edge ----
 if(p==7){o.col=uLaces;float e=abs(zone.y-.5)*2.;o.h=seam((.92-e)*.12,surf.x)*.8+vnoise(surf*500.)*.06;o.mask=1.;return o;}
 // ---- sock / mid collar: matte rib knit ----
 if(p==4){o.col=uCollar;o.h=rib(vec2(surf.x/.028,surf.y/.025))*.6;o.mask=.3;o.r=.93;
  if(zone.y>.88&&zone.y<1.){o.col=mix(uCollar,uAccent,.85);} // a contrast band at the top
  return o;}
 // ---- tongue front (or a flap's top): the upper's colour with a padded collar-coloured trim ----
 if(p==2||flap){float edge=max(smoothstep(.103,.107,abs(surf.y)),smoothstep(.45,.455,surf.x)*(flap?0.:1.));o.col=mix(uMid,uCollar,edge);
  float q=abs(fract(surf.x/.07)-.5);o.h=.25-.3*(1.-smoothstep(.0,.07,q))*(1.-edge)*(flap?0.:1.);
  o.h+=knit(surf/vec2(.03,.028))*.2*(uUpper==0?1.:.3)+seam(abs(surf.y)-.105,surf.x)*.8;
  if(flap){o.h+=seam(abs(surf.y)-.09,surf.x)*.6+pebble(surf/.011)*.22*(uUpper==2?1.:0.);}
  o.r=mix(o.r,.9,edge);o.mask=.7;o.thread=threadM;return o;}
 // ---- the outer upper ----
 float L=2.7;
 float toeB=.705+.085*yr+.012*sin(yr*9.);float dToe=(s-toeB)*L;
 float heelB=uHeelL.x+uHeelL.y*yr+uHeelL.z*yr*yr+uHeelL.w*pow(1.-yr,3.);float dHeel=(heelB-s)*L;
 vec3 c=uMid;
 c=mix(c,uToe,smoothstep(-.002,.002,dToe));
 c=mix(c,uHeel,smoothstep(-.002,.002,dHeel));
 float rough=baseRough();
 // micro surface
 float h=0.;
 if(uUpper==0){h=knit(vec2(surf.x/.032,surf.y/.026))*.7+vnoise(surf*1400.)*.12;c*=.94+.08*knit(vec2(surf.x/.032,surf.y/.026));}
 else if(uUpper==1){
  vec2 g=surf/.034;vec2 cell=fract(g)-.5;float dots=1.-smoothstep(.16,.24,length(cell));
  float grip=smoothstep(.5,.6,s)*(1.-smoothstep(.9,.95,s))*smoothstep(.12,.2,yr)*(1.-smoothstep(.62,.7,yr));
  h=dots*grip*.9+fbm(surf*90.)*.14+vnoise(surf*600.)*.05;rough+=grip*dots*.12;}
 else{float pb=pebble(surf/.0105);h=pb*.32+fbm(surf*38.)*.16;rough+=.06*(1.-pb);c*=.95+.06*pb;
  // a slight sheen on the toe only, where leather is worn smooth
  rough-=.17*smoothstep(-.02,.05,dToe)*smoothstep(.2,.45,yr);}
 // flex creases across the vamp behind the toe: soft wavy folds (knit stretches instead)
 if(uUpper!=0){float cz=smoothstep(.56,.6,s)*(1.-smoothstep(.72,.76,s))*smoothstep(.35,.6,yr);
  float w=(s+.012*sin(surf.y*38.+fbm(surf*20.)*3.))*L/.03;float cr=1.-smoothstep(.0,.16,abs(fract(w)-.5)-.32);
  h-=cr*cz*(uUpper==2?.55:.35)*(.6+.4*vnoise(vec2(floor(w),3.)));}
 // quilted stitch lines across the toe: every leather upper, and the classic shapes whatever the material
 float quilt=max(uUpper==2?1.:0.,uFeat.x);
 if(quilt>0.){float sp=${QUILT_SP};float q=dToe;float rowz=fract(q/sp);float on=step(.02,q)*min(1.,quilt*1.4);
  h+=(stitchRow((rowz-.5)*sp,surf.y,0.)*.75-(1.-smoothstep(.0,.009,abs(rowz-.5)*sp))*.35+pow(abs(cos(3.14159*rowz)),.8)*.18)*on;threadM=max(threadM,stitchRow((rowz-.5)*sp,surf.y,0.)*on);}
 // strike zone: fine raised ridges over the inside of the forefoot (knit and leather; synthetic has its grip dots)
 if(uUpper!=1){float zoneS=smoothstep(.52,.6,s)*(1.-smoothstep(.88,.94,s))*smoothstep(.1,.18,yr)*(1.-smoothstep(.58,.66,yr))*(1.-smoothstep(-.06,.0,surf.y));
  float rr=abs(fract((surf.x*.8-surf.y*.6)/.028)-.5)*2.;h=mix(h,h*.4+(1.-smoothstep(.0,.35,rr))*.75,zoneS*.7);}
 // a rubber strike pad on the inside of the instep: a grid of raised squares in the pattern colour (raised as geometry too)
 float padM=0.;
 if(uFeat.y>0.){padM=smoothstep(.5,.515,s)*(1.-smoothstep(.79,.805,s))*smoothstep(-.33,-.315,surf.y)*(1.-smoothstep(-.075,-.06,surf.y))*step(.08,yr);
  vec2 g=fract(vec2(surf.x*.8-surf.y*.6,surf.x*.6+surf.y*.8)/.03)-.5;float sq=1.-smoothstep(.26,.32,max(abs(g.x),abs(g.y)));h=mix(h,.2+sq*.9,padM);rough=mix(rough,.86,padM);padM*=.25+.75*sq;
  float d=max(max(.5-s,s-.795),max(-.32-surf.y,surf.y+.068));h+=seam(d*.5+.004,surf.x)*step(.08,yr)*.7;}
 // grip texture over the forefoot (laceless control): short raised ridges in staggered rows
 if(uFeat.z>0.){float gz=smoothstep(.42,.5,s)*(1.-smoothstep(.9,.95,s))*smoothstep(.12,.2,yr);vec2 g=surf/vec2(.024,.016);g.x+=.5*mod(floor(g.y),2.);
  vec2 f=fract(g)-.5;float r=(1.-smoothstep(.22,.3,abs(f.x)))*(1.-smoothstep(.12,.2,abs(f.y)));h=mix(h,h*.4+r*.85,gz*uFeat.z);}
 // a plain stitched side panel (retro): one raised saddle on each wall with a double stitch, same colour
 if(uFeat.w>0.){vec2 q=vec2((s-.43)/.2,(yr-.4)/.2);float d=(max(abs(q.x)-1.,abs(q.y)-1.))*.2*L;
  h+=seam(d,surf.x)*.9;}
 // a stitched toe cap with perforations behind it (indoor)
 if(uToeCap>0.){float cb=(s-(.8+.04*yr-.02*yr*yr))*L;h+=seam(cb,surf.y)*step(.05,yr);
  vec2 g=fract(surf/.03)-.5;float perf=(1.-smoothstep(.12,.18,length(g)))*smoothstep(.6,.62,s)*(1.-smoothstep(.75,.77,s))*smoothstep(.45,.5,yr)*step(abs(surf.y-uLace.x),.2)*step(.13,abs(surf.y-uLace.x));
  h-=perf*1.2;c=mix(c,c*.35,perf);}
 // pebbled rubber pads on both sides of the forefoot (long-tongue control boot), in the pattern colour, matte rubber
 if(uFeat2.x>0.){float side=abs(surf.y);vec2 q=vec2((s-.71)/.13,(side-.2)/.075);float d=length(max(abs(q)-vec2(.7,.55),0.))-.3;float m=(1.-smoothstep(-.02,.02,d))*step(.04,yr);
  vec2 g=fract(vec2(surf.x,surf.y)/.022)-.5;float peb=1.-smoothstep(.2,.32,length(g));h=mix(h,.3+peb*.7,m);c=mix(c,uAccent,m*uFeat2.x);rough=mix(rough,.87,m);h+=seam(d*.06,surf.x)*step(.04,yr)*.8;}
 // bandage wrap (laceless control): two families of overlapping strips (raised as geometry), each edge stitched, same colour
 if(uFeat2.y>0.){float wz=smoothstep(.22,.3,s)*(1.-smoothstep(.93,.98,s))*smoothstep(.05,.12,yr);
  float b1=abs(fract((surf.x*.82+surf.y*.57)/${BAND_SP})-.5)*2.,b2=abs(fract((surf.x*.82-surf.y*.57)/${BAND_SP})-.5)*2.;
  float e1=1.-smoothstep(.0,.05,abs(b1-.57)),e2=(1.-smoothstep(.0,.05,abs(b2-.57)))*smoothstep(.62,.7,b1);
  h+=(-e1*.5-e2*.35)*wz*uFeat2.y;c*=1.-.05*(1.-smoothstep(.5,.64,b1))*wz*uFeat2.y;}
 // knit speed ribs (sock striker): the ridges' flanks (raised as geometry)
 if(uFeat2.z>0.){float z=smoothstep(.42,.52,s)*(1.-smoothstep(.9,.96,s))*smoothstep(.12,.25,yr);float q=abs(fract((surf.x*.85+abs(surf.y)*.55)/${RIB_SP})-.5)*2.;
  h+=(1.-smoothstep(.2,.55,q))*.5*z;rough=mix(rough,.8,z*(1.-smoothstep(.2,.55,q)));}
 // pattern (accent)
 float acc=0.;
 if(uPattern==1){vec2 g=surf/.042;vec2 cell=fract(g)-.5;float a=clamp(1.25-yr*1.7-(1.-s)*.55,0.,1.);float r=sqrt(a)*.62;acc=1.-smoothstep(r-.05,r+.05,length(cell));}
 else if(uPattern==2){vec2 g=surf/.05;vec2 id=floor(g),f=fract(g)-.5;float rnd=hash(id);vec2 off=vec2(hash(id+3.1),hash(id+7.7))-.5;
  float r=mix(.05,.22,hash(id+1.3));acc=(rnd>.55?1.:0.)*(1.-smoothstep(r-.03,r+.03,length(f-off*.45)));
  vec2 g2=surf/.018;vec2 id2=floor(g2);acc=max(acc,step(.86,hash(id2+11.))*(1.-smoothstep(.12,.22,length(fract(g2)-.5))));}
 else if(uPattern==3){float q=(surf.x*.55+surf.y)/.055;float l=abs(fract(q)-.5);acc=1.-smoothstep(.07,.11,l);}
 else if(uPattern==4){float n=fbm(surf*5.2+vec2(3.,7.));float n2=fbm(surf*7.+vec2(11.,2.));acc=smoothstep(.53,.55,n);
  if(n2>.6)c=mix(c,c*.55,1.-acc);}
 else if(uPattern==5){float zz=abs(fract(surf.y/.11)-.5)*2.;float q=fract(surf.x/.13+zz*.42);acc=step(.82,1.-abs(q-.5)*2.);}
 c=mix(c,uAccent,acc);c=mix(c,uAccent,padM);
 // seams + double stitching on the zone borders (skip near the sole edge)
 float alongS=surf.y;
 h+=seam(dToe,alongS)*step(.04,yr);
 h+=seam(dHeel,alongS)*step(.04,yr);
 // a stitched wave line along both walls, from the heel block to the toe: the outer upper only, clear of the plate's wall
 // (never the sole: the plate art draws no copy of it, bootScene.ts PLATE_ART.wave)
 if(uSide.x>0.){float wy=.4+.07*sin(s*13.8+.6);float on=smoothstep(heelB,heelB+.02,s)*(1.-smoothstep(toeB-.02,toeB,s))*smoothstep(.2,.26,yr);h+=seam((yr-wy)*.55,surf.x)*on*uSide.x;}
 // a heel tab: a narrow collar-coloured strip up the back of the heel, stitched both sides
 if(uSide.y>0.&&s<.08){float tw=abs(P.z)-.032;float tab=(1.-smoothstep(-.002,.002,tw))*smoothstep(.12,.16,yr)*uSide.y;c=mix(c,uCollar,tab);h+=seam(tw,P.y)*smoothstep(.12,.16,yr)*uSide.y+tab*.25;}
 // the heel's centre seam (double stitched)
 if(s<.07)h+=seam(abs(P.z),P.y)*(1.-smoothstep(.04,.07,s));
 // collar band: padded (geometry), collar colour, with a stitched seam where it meets the upper
 if(rimd<.11){float band=1.-smoothstep(.065,.07,rimd);c=mix(c,uCollar,band);h=mix(h,.2+.2*knit(surf/vec2(.03,.03))+pebble(surf/.0105)*.15*(uUpper==2?1.:0.),band);rough=mix(rough,uUpper==1?.6:.8,band);
  h+=seam(rimd-.07,surf.x)*.8;}
 // lace area: the lace line sits uLace.x around the top from the centre (0 on the classics, far out on the off-centre boot);
 // the tongue gap, facings (a raised strip, geometry) and eyelets scale with the row's half-width uLace.w
 float gap=abs(surf.y-uLace.x),hw=uLace.w;
 if(uLaced>.5){
  float inLace=smoothstep(uLace.y-.02,uLace.y-.01,s)*(1.-smoothstep(uLace.z+.02,uLace.z+.03,s));
  if(inLace>0.){
   float tg=1.-smoothstep(hw*.615,hw*.667,gap);c=mix(c,mix(uCollar,uMid,.25)*.8,tg*inLace);h=mix(h,-.2+knit(surf/vec2(.03,.03))*.25,tg*inLace);rough=mix(rough,.9,tg*inLace);
   h+=seam(gap-hw*1.436,surf.x)*inLace;h+=seam(hw*.667-gap+.002,surf.x)*inLace*.6;
   for(int i=0;i<${MAX_EYELETS};i++){float d=distance(P,uEye[i]);
    float ring=1.-smoothstep(.017,.02,d);float hole=1.-smoothstep(.009,.011,d);
    c=mix(c,c*.7,ring*(1.-hole));c=mix(c,vec3(.03),hole);h+=ring*.5-hole*1.6;}}
  // lace-cage edge (ultralight wrap): a stitched ridge around the lacing
  if(uFeat2.w>0.){float cg=smoothstep(uLace.y-.06,uLace.y,s)*(1.-smoothstep(uLace.z+.05,uLace.z+.1,s));h+=seam(gap-hw*1.5-.05-.012,surf.x)*cg*.8;}
 }else if(uLaced>-.5){// laceless (a lace cover, uLaced −1, is geometry: nothing painted under it)
  float inPanel=smoothstep(.395,.405,s)*(1.-smoothstep(.745,.755,s))*(1.-smoothstep(.15,.155,gap));
  c=mix(c,uLaces,inPanel);h=mix(h,h*.35,inPanel);
  float edge=smoothstep(.395,.405,s)*(1.-smoothstep(.745,.755,s));h+=seam(gap-.152,surf.x)*edge*step(gap,.18);
 }
 // stitches: a slightly lighter or darker thread, rougher than the surface
 o.thread=threadM;rough=mix(rough,.85,threadM);
 o.col=c;o.h=h;o.r=clamp(rough,.08,1.);return o;}

void decals(inout Surf o,vec3 P,vec3 nor,vec4 zone){
 for(int i=0;i<${MAX_DECALS};i++){if(i>=uDCount)break;
  vec3 A=uDA[i],U=uDU[i],R=normalize(cross(A,U));vec3 d=P-uDC[i];
  float depth=dot(d,A);if(abs(depth)>.3)continue;if(dot(nor,-A)<.12)continue;
  vec2 q=vec2(dot(d,R),dot(d,U))/uDS[i].xy;
  if(i==uSel){vec2 aq=abs(q);float m=max(aq.x,aq.y);
   if(m>1.05&&m<1.16){vec2 pq=q*uDS[i].xy;float dash=step(.5,fract((pq.x+pq.y)/.035));o.col=mix(vec3(1.,.72,.05),vec3(.02,.16,.11),dash);o.h=.6;o.mask=0.;o.thread=0.;}}
  if(abs(q.x)>1.||abs(q.y)>1.)continue;
  vec2 uv=uDR[i].xy+(q*.5+.5)*uDR[i].zw;vec4 t=texture2D(uAtlas,uv);
  float a=t.a*smoothstep(1.,.94,max(abs(q.x),abs(q.y)));if(a<.002)continue;vec3 rgb=t.rgb/max(a,.001);
  if(uDT[i].w>.5)rgb=uDT[i].rgb;
  rgb=pow(rgb,vec3(2.2));
  o.col=mix(o.col,rgb,a);o.thread*=1.-a;
  float kind=uDS[i].z;
  if(kind>.5&&kind<1.5){ // embroidered: satin stitches
   float sat=.55+.45*abs(sin((q.x*uDS[i].x+q.y*uDS[i].y)*520.));o.h=mix(o.h,1.+sat*.9,smoothstep(.2,.7,a));o.mask=mix(o.mask,.15,a);o.r=mix(o.r,.7,a);}
  else if(kind>1.5){ // woven badge: raised, fine weave
   float weave=.5+.5*sin(q.x*uDS[i].x*900.)*sin(q.y*uDS[i].y*900.);o.h=mix(o.h,.9+.15*weave,a);o.mask=mix(o.mask,.25,a);o.r=mix(o.r,.8,a);}
  else{o.h=mix(o.h,.25,a);o.mask=mix(o.mask,1.,a);o.r=mix(o.r,.4,a);} // printed: a thin satin film
 }
}

Surf full(vec3 P,vec2 surf,vec4 zone,vec3 nor){Surf o=shade(P,surf,zone,nor);int p=int(zone.w+.5);
 // decals land on the outer upper, the collar, the tongue's face, and a fold-over tongue's flap (bootZones.ts decalPart)
 if(p==0||p==4||(p==2&&zone.y<=zone.z)||(p==3&&zone.y>zone.z))decals(o,P,nor,zone);return o;}

void main(){
 vec3 nor=normalize(vNor);
 #ifdef BAKE_NORMAL
  vec3 dPx=dFdx(vPos),dPy=dFdy(vPos);vec2 dSx=dFdx(vSurf),dSy=dFdy(vSurf);vec4 dZx=dFdx(vZone),dZy=dFdy(vZone);dZx.w=0.;dZy.w=0.;
  Surf s0=full(vPos,vSurf,vZone,nor);float h0=s0.h;
  float hx=full(vPos+dPx,vSurf+dSx,vZone+dZx,nor).h;
  float hy=full(vPos+dPy,vSurf+dSy,vZone+dZy,nor).h;
  float k=.0045;// height scale in dm (0.45 mm for h = 1)
  float lx=max(length(dPx),1e-5),ly=max(length(dPy),1e-5);
  vec3 n=normalize(vec3(-(hx-h0)*k/lx,-(hy-h0)*k/ly,1.));
  gl_FragColor=vec4(n*.5+.5,s0.r);// alpha: roughness
 #else
  Surf o=full(vPos,vSurf,vZone,nor);
  // occlusion baked from the geometry (seams, quilting, the plate's edge); a little more under the fins
  float ao=vAO;if(vZone.w>5.5&&vZone.w<6.5)ao*=mix(.8,1.,smoothstep(.1,.3,vZone.y));
  vec3 thread=mix(o.col,vec3(lum(o.col)>.45?.2:.86),.32);
  gl_FragColor=vec4(mix(o.col,thread,o.thread)*ao,o.mask);
 #endif
}`;

export type BakeUniforms={[k:string]:T.IUniform};
export function bakeUniforms():BakeUniforms{
 const v3=(n:number)=>Array.from({length:n},()=>new T.Vector3()),v4=(n:number)=>Array.from({length:n},()=>new T.Vector4());
 return {uToe:{value:new T.Color()},uMid:{value:new T.Color()},uHeel:{value:new T.Color()},uCollar:{value:new T.Color()},uLaces:{value:new T.Color()},uAccent:{value:new T.Color()},
  uPattern:{value:0},uUpper:{value:0},uLaced:{value:1},uFinishMetal:{value:0},uToeCap:{value:0},uLace:{value:new T.Vector4(.05,.43,.68,.078)},uFeat:{value:new T.Vector4()},uFeat2:{value:new T.Vector4()},uHeelL:{value:new T.Vector4(.255,-.13,.03,0)},uSide:{value:new T.Vector2()},
  uEye:{value:v3(MAX_EYELETS)},uDC:{value:v3(MAX_DECALS)},uDA:{value:v3(MAX_DECALS)},uDU:{value:v3(MAX_DECALS)},
  uDS:{value:v4(MAX_DECALS)},uDR:{value:v4(MAX_DECALS)},uDT:{value:v4(MAX_DECALS)},uDCount:{value:0},uSel:{value:-1},uAtlas:{value:null}};
}

export type Baker={albedo:T.WebGLRenderTarget;normal:T.WebGLRenderTarget;uniforms:BakeUniforms;bake(geometry:T.BufferGeometry):void;dispose():void};
export function createBaker(renderer:T.WebGLRenderer,size:number):Baker{
 const uniforms=bakeUniforms();
 const mk=(normal:boolean)=>new T.ShaderMaterial({vertexShader:VERT,fragmentShader:FRAG,uniforms,defines:normal?{BAKE_NORMAL:''}:{},side:T.DoubleSide,depthTest:false,depthWrite:false});
 const albedoMat=mk(false),normalMat=mk(true);
 const rt=(srgb:boolean)=>{const r=new T.WebGLRenderTarget(size,size,{depthBuffer:false,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter,magFilter:T.LinearFilter,colorSpace:srgb?T.SRGBColorSpace:T.NoColorSpace});
  r.texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return r;};
 const albedo=rt(true),normal=rt(false);
 const scene=new T.Scene(),cam=new T.OrthographicCamera(-1,1,1,-1,0,1),mesh=new T.Mesh(new T.BufferGeometry(),albedoMat);mesh.frustumCulled=false;scene.add(mesh);
 const clearN=new T.Color(.5,.5,1);
 return {albedo,normal,uniforms,
  bake(geometry){
   const prevTarget=renderer.getRenderTarget(),prevClear=renderer.getClearColor(new T.Color()),prevAlpha=renderer.getClearAlpha(),prevTone=renderer.toneMapping;
   renderer.toneMapping=T.NoToneMapping;mesh.geometry=geometry;
   mesh.material=albedoMat;renderer.setRenderTarget(albedo);renderer.setClearColor(uniforms.uCollar.value as T.Color,1);renderer.clear(true,false,false);renderer.render(scene,cam);
   mesh.material=normalMat;renderer.setRenderTarget(normal);renderer.setClearColor(clearN,1);renderer.clear(true,false,false);renderer.render(scene,cam);
   renderer.setRenderTarget(prevTarget);renderer.setClearColor(prevClear,prevAlpha);renderer.toneMapping=prevTone;},
  dispose(){albedo.dispose();normal.dispose();albedoMat.dispose();normalMat.dispose();}};
}
