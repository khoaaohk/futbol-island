import type {Decal} from '../decals';
/** 1966 Slazenger Challenge 4-Star: 24 pieces as built and as the best photo shows (the NFM final ball, scratchpad ball1966.jpg; FIFA archive quoting Slazenger stitcher Malcolm Wainwright): 6 groups of 3 long strips in the cube layout, the centre strip of each cut by one crosswise seam. The NFM/University of Manchester CT scan says 25 panels; the 25th piece is not visible in any photo. Orange-amber leather; the catalogue ball's Slazenger / 25 / ★★★★ / CHALLENGE stamp (the final ball itself is unmarked). */
export default /* glsl */`
// Distance from x to the segment ab.
float ch_sd(vec2 x,vec2 a,vec2 b){vec2 pa=x-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}

float ch_del(int i,float s,float sa,float b){float ab=min(abs(b),1.);
 if(ab<.3333)return 0.0250*sqrt(max(0.,1.-pow(ab*3.,6.)));float u=(ab-.3333)*1.5;return 0.0150*(1.-pow(2.*u-1.,2.));}
float ch_gap(int i,float s,float sa,float b){return 0.;}
bool ch_isLace(int i,float s){return false;}
float ch_inner(int i,float s,float sa,float a,float b,vec2 X,float ka,float kb){
 float d=abs(abs(b)-.3333)*kb;d=min(d,ch_sd(X,vec2(0,-.3333*kb),vec2(0,.3333*kb)));return d;}
float ch_pid(int i,float s,float sa,float a,float b){
 float k=b<-.3333?0.:(b>.3333?2.:1.);return (float(i*2)+(s<0.?1.:0.))*8.+k+(k==1.&&a>0.?4.:0.);}

// Volleyball cube frame: face (axis i, sign s) has strips running along axis j=(i+1)%3 (they end on faces ±j) and lying side by
// side across axis k=(i+2)%3; equal-angle chart a=atan(p_j/|p_i|), b=atan(p_k/|p_i|) in units of 45° (|a|,|b|=1 at the cube edges).
const float ch_K=1.2732395;
struct ch_L{int i;float s;float sa;float a;float b;float edge;float id;};
ch_L ch_layout(vec3 p){
 vec3 A=abs(p)+1e-6;bool w[3];
 for(int c=0;c<3;c++){int j=(c+1)%3,k=(c+2)%3;float sc=p[c]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.;
  w[c]=atan(A[j],A[c])*ch_K<1.+ch_del(c,sc,sa,atan(p[k],A[c])*ch_K);}
 int o=-1;for(int c=0;c<3;c++){if(w[c]&&!w[(c+2)%3])o=c;}
 if(o<0)o=A.x>=A.y&&A.x>=A.z?0:(A.y>=A.z?1:2);
 int j=(o+1)%3,k=(o+2)%3;float s=p[o]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.,sk=p[k]>=0.?1.:-1.;
 float a=atan(p[j],A[o])*ch_K,b=atan(p[k],A[o])*ch_K,ri=length(vec2(A[o],A[j])),rk=length(vec2(A[o],A[k]));
 float dl=ch_del(o,s,sa,b),dd=(ch_del(o,s,sa,b+.01)-ch_del(o,s,sa,b-.01))*50.;
 float e1=abs(1.+dl-abs(a))/(ch_K*sqrt(1./(ri*ri)+dd*dd/max(rk*rk,.25)));e1=length(vec2(e1,ch_gap(o,s,sa,b)*rk/ch_K));
 float ak=atan(A[o],A[k])*ch_K,bk=atan(p[j],A[k])*ch_K,rik=length(vec2(A[k],A[o])),rkk=length(vec2(A[k],A[j]));
 float dk=ch_del(k,sk,s,bk),ddk=(ch_del(k,sk,s,bk+.01)-ch_del(k,sk,s,bk-.01))*50.;
 float e2=abs(ak-1.-dk)/(ch_K*sqrt(1./(rik*rik)+ddk*ddk/max(rkk*rkk,.25)));e2=length(vec2(e2,ch_gap(k,sk,s,bk)*rkk/ch_K));
 float ka=ri/ch_K,kb=rk/ch_K;
 float e3=ch_inner(o,s,sa,a,b,vec2(a*ka,b*kb),ka,kb);
 return ch_L(o,s,sa,a,b,min(min(e1,e2),e3),ch_pid(o,s,sa,a,b));}

// Leather: per-panel tone, mottling, pebble grain, darker oiled seams, light scuffs; 'crk' adds dried craquelure.
vec3 ch_leather(vec3 p,vec3 tone,float id,float edge,float wear,float crk,float gr){
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
float ch_stitch(vec3 p,float edge){float d=1.-smoothstep(.003,.005,abs(edge-.016));return d*smoothstep(.5,.8,vnoise(p*140.))*.6;}

Surf design(vec3 p){
 vec3 q=normalize(p+0.0060*(vec3(vnoise(p*2.3),vnoise(p*2.3+7.1),vnoise(p*2.3+13.7))-.5));
 q=rotX(rotX(rotY(rotZ(q,.08),-.5),.32),.1222);// the gallery camera's frame at the rest pose (it sits 7° above): +z toward the viewer, +y up; the photos and decals are placed in it
 vec3 r=mat3(vec3(0.0000,0.0000,1.0000),vec3(1.0000,0.0000,0.0000),vec3(0.0000,1.0000,0.0000))*vec3(dot(q,vec3(0.0000,0.0000,1.0000)),dot(q,vec3(1.0000,0.0000,0.0000)),dot(q,vec3(0.0000,1.0000,0.0000)));// the pattern turned to the reference photo's view
 ch_L L=ch_layout(r);vec3 tone=hex(0xd8601e);
 float gr=fbm(p*48.);vec3 col=ch_leather(p,tone,L.id,L.edge,0.3000,0.0000,gr);
 float g=panelGroove(L.edge,.011,.085);g+=(1.-g)*.07*gr;float st=ch_stitch(p,L.edge);col*=1.-.2*st;g=max(g,st*.35);
 return Surf(col,g,0.2600+.06*gr);}
`;

/** No printing: the real 1966 final ball (National Football Museum) is unmarked; the catalogue print is not on it. */
export const decals:Decal[]=[];
