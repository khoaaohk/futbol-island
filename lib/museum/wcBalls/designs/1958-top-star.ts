import type {Decal} from '../decals';
/** 1958 Top Star (Sweden): 24 panels (balones-oficiales.com, museodefutbol.com): 6 groups of 3 strips in the cube layout with the middle strip cut crosswise into two short pieces ("two short panels in the midst of two long panels", worldcupballs.info), the middle strips ending in a short tongue. Yellow leather, VMbollen / TOP-STAR stamps (Commons photo). */
export default /* glsl */`
// Distance from x to the segment ab.
float ts_sd(vec2 x,vec2 a,vec2 b){vec2 pa=x-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}

float ts_del(int i,float s,float sa,float b){float ab=min(abs(b),1.);
 if(ab<.3333)return 0.0600*sqrt(max(0.,1.-pow(ab*3.,6.)));float u=(ab-.3333)*1.5;return 0.0250*(1.-pow(2.*u-1.,2.));}
float ts_gap(int i,float s,float sa,float b){return 0.;}
bool ts_isLace(int i,float s){return false;}
float ts_inner(int i,float s,float sa,float a,float b,vec2 X,float ka,float kb){
 float d=abs(abs(b)-.3333)*kb;d=min(d,ts_sd(X,vec2(0,-.3333*kb),vec2(0,.3333*kb)));return d;}
float ts_pid(int i,float s,float sa,float a,float b){
 float k=b<-.3333?0.:(b>.3333?2.:1.);return (float(i*2)+(s<0.?1.:0.))*8.+k+(k==1.&&a>0.?4.:0.);}

// Volleyball cube frame: face (axis i, sign s) has strips running along axis j=(i+1)%3 (they end on faces ±j) and lying side by
// side across axis k=(i+2)%3; equal-angle chart a=atan(p_j/|p_i|), b=atan(p_k/|p_i|) in units of 45° (|a|,|b|=1 at the cube edges).
const float ts_K=1.2732395;
struct ts_L{int i;float s;float sa;float a;float b;float edge;float id;};
ts_L ts_layout(vec3 p){
 vec3 A=abs(p)+1e-6;bool w[3];
 for(int c=0;c<3;c++){int j=(c+1)%3,k=(c+2)%3;float sc=p[c]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.;
  w[c]=atan(A[j],A[c])*ts_K<1.+ts_del(c,sc,sa,atan(p[k],A[c])*ts_K);}
 int o=-1;for(int c=0;c<3;c++){if(w[c]&&!w[(c+2)%3])o=c;}
 if(o<0)o=A.x>=A.y&&A.x>=A.z?0:(A.y>=A.z?1:2);
 int j=(o+1)%3,k=(o+2)%3;float s=p[o]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.,sk=p[k]>=0.?1.:-1.;
 float a=atan(p[j],A[o])*ts_K,b=atan(p[k],A[o])*ts_K,ri=length(vec2(A[o],A[j])),rk=length(vec2(A[o],A[k]));
 float dl=ts_del(o,s,sa,b),dd=(ts_del(o,s,sa,b+.01)-ts_del(o,s,sa,b-.01))*50.;
 float e1=abs(1.+dl-abs(a))/(ts_K*sqrt(1./(ri*ri)+dd*dd/max(rk*rk,.25)));e1=length(vec2(e1,ts_gap(o,s,sa,b)*rk/ts_K));
 float ak=atan(A[o],A[k])*ts_K,bk=atan(p[j],A[k])*ts_K,rik=length(vec2(A[k],A[o])),rkk=length(vec2(A[k],A[j]));
 float dk=ts_del(k,sk,s,bk),ddk=(ts_del(k,sk,s,bk+.01)-ts_del(k,sk,s,bk-.01))*50.;
 float e2=abs(ak-1.-dk)/(ts_K*sqrt(1./(rik*rik)+ddk*ddk/max(rkk*rkk,.25)));e2=length(vec2(e2,ts_gap(k,sk,s,bk)*rkk/ts_K));
 float ka=ri/ts_K,kb=rk/ts_K;
 float e3=ts_inner(o,s,sa,a,b,vec2(a*ka,b*kb),ka,kb);
 return ts_L(o,s,sa,a,b,min(min(e1,e2),e3),ts_pid(o,s,sa,a,b));}

// Leather: per-panel tone, mottling, pebble grain, darker oiled seams, light scuffs; 'crk' adds dried craquelure.
vec3 ts_leather(vec3 p,vec3 tone,float id,float edge,float wear,float crk,float gr){
 float h=hash3(vec3(id*1.7,id*.31,3.)),m=fbm(p*4.+id*.37),gr2=vnoise(p*95.);
 vec3 col=tone*(.9+.16*h)*(1.-wear*.2+wear*.36*m)*(.9+.14*gr+.06*gr2);
 col*=1.-(.12+.22*wear)*(1.-smoothstep(.0,.075,edge));
 col*=.95+.08*smoothstep(.02,.2,edge);
 float bl=vnoise(p*3.1+id*.13+5.)*.6+vnoise(p*7.3+1.)*.4;
 col*=1.-wear*.38*smoothstep(.42,.72,bl);col*=1.-wear*.18*smoothstep(.5,.8,vnoise(p*17.+2.));
 float sc=smoothstep(.62,.8,vnoise(p*6.5+11.+id)*.7+m*.3)*wear;col=mix(col,tone*1.35+.012,sc*.35);
 if(crk>0.){float cr=(1.-smoothstep(.0,.03,abs(fbm(p*17.+3.)-.5)))*(.6+.4*vnoise(p*30.));
  float cr2=1.-smoothstep(.0,.04,abs(vnoise(p*38.)-.5));col=mix(col,tone*1.55+.03,crk*(cr*.55+cr2*.3));}
 return col;}
// Faint stitch dimples just inside the seam (hand-stitched inside out, so only the pull of the thread shows).
float ts_stitch(vec3 p,float edge){float d=1.-smoothstep(.003,.005,abs(edge-.016));return d*smoothstep(.5,.8,vnoise(p*140.))*.6;}

Surf design(vec3 p){
 vec3 q=normalize(p+0.0060*(vec3(vnoise(p*2.3),vnoise(p*2.3+7.1),vnoise(p*2.3+13.7))-.5));
 q=rotX(rotX(rotY(rotZ(q,.08),-.5),.32),.1222);// the gallery camera's frame at the rest pose (it sits 7° above): +z toward the viewer, +y up; the photos and decals are placed in it
 vec3 r=mat3(vec3(0.0000,0.0000,1.0000),vec3(1.0000,0.0000,0.0000),vec3(0.0000,1.0000,0.0000))*vec3(dot(q,vec3(0.0000,-0.1560,0.9878)),dot(q,vec3(1.0000,0.0000,0.0000)),dot(q,vec3(0.0000,0.9878,0.1560)));// the pattern turned to the reference photo's view
 ts_L L=ts_layout(r);vec3 tone=hex(0xe0c024);
 float gr=fbm(p*48.);vec3 col=ts_leather(p,tone,L.id,L.edge,0.1500,0.0000,gr);
 float g=panelGroove(L.edge,.011,.085);g+=(1.-g)*.07*gr;float st=ts_stitch(p,L.edge);col*=1.-.2*st;g=max(g,st*.35);
 return Surf(col,g,0.2400+.06*gr);}
`;

export const decals:Decal[]=[{"src":"/museum/wcballs/decals/1958-top-star-1.webp","dir":[0.5038,0.3352,0.7961],"up":[-0.1032,0.9384,-0.3299],"w":0.93,"h":0.66,"gloss":0.1,"credit":"Wikimedia Commons, File:Top Star-1958.jpg (MDBR), CC BY-SA 3.0"},
 {"src":"/museum/wcballs/decals/1958-top-star-2.webp","dir":[-0.2334,0.9315,0.2789],"up":[0.0799,0.3042,-0.9492],"w":0.22,"h":0.18,"gloss":0.1,"credit":"Wikimedia Commons, File:Top Star-1958.jpg (MDBR), CC BY-SA 3.0"},
 {"src":"/museum/wcballs/decals/1958-top-star-3.webp","dir":[0.5497,0.8173,-0.1729],"up":[-0.8056,0.4638,-0.3687],"w":0.22,"h":0.2,"gloss":0.1,"credit":"Wikimedia Commons, File:Top Star-1958.jpg (MDBR), CC BY-SA 3.0"}];
