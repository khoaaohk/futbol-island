/** 1934 Federale 102 (Italy, ECAS): 13 panels = 12 polygonal panels plus a separate lace panel (museodefutbol.com, worldcupballs.info). Built on the 18-strip cube layout as interlocking Ts: each face's middle strip is halved and each half is one piece with the neighbouring face's outer strip, with a triangular gusset filling each inner corner of the T, which cuts the strips beside the stem into the angled, house-shaped ends of the photo (12 panels); on the lace face the middle strip carries a separate lens-shaped lace panel between the two stems (13). Dark red-brown leather, tan cotton laces in straight bars (Commons "Federale 102.jpg", MDBR, CC BY-SA 3.0). */
export default /* glsl */`
// Distance from x to the segment ab.
float fe_sd(vec2 x,vec2 a,vec2 b){vec2 pa=x-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
const float fe_C=.26,fe_C2=.42,fe_AL=.66,fe_RB=.1;
float fe_del(int i,float s,float sa,float b){return 0.;}
// The T's stem and its gussets are one piece with the neighbour's crossbar: no seam there.
float fe_gap(int i,float s,float sa,float b){return max(0.,.3333+fe_C2-abs(b));}
bool fe_isLace(int i,float s){return i==2&&s>0.;}
float fe_inner(int i,float s,float sa,float a,float b,vec2 X,float ka,float kb){
 float t=1.-fe_C,d=9.;
 for(int m=0;m<2;m++){float sb=m==0?1.:-1.;
  d=min(d,fe_sd(X,vec2(-t*ka,sb*.3333*kb),vec2(t*ka,sb*.3333*kb)));
  d=min(d,fe_sd(X,vec2(t*ka,sb*.3333*kb),vec2(ka,sb*(.3333+fe_C2)*kb)));
  d=min(d,fe_sd(X,vec2(-t*ka,sb*.3333*kb),vec2(-ka,sb*(.3333+fe_C2)*kb)));}
 if(fe_isLace(i,s)){if(abs(b)<.3333)d=min(d,abs(abs(a)-fe_AL-fe_RB*(1.-9.*b*b))*ka);}
 else d=min(d,fe_sd(X,vec2(0,-.3333*kb),vec2(0,.3333*kb)));
 return d;}
float fe_pid(int i,float s,float sa,float a,float b){
 float ab=abs(b);int j=(i+1)%3;float stem=(float(j*2)+(sa<0.?1.:0.))*4.+(s>0.?2.:0.);
 if(ab>.3333){if(ab<.3333+fe_C2&&(ab-.3333)*fe_C<fe_C2*(abs(a)-1.+fe_C))return stem;return (float(i*2)+(s<0.?1.:0.))*4.+(b>0.?2.:0.);}
 if(fe_isLace(i,s)&&abs(a)<fe_AL+fe_RB*(1.-9.*b*b))return 99.;
 return stem;}

// Volleyball cube frame: face (axis i, sign s) has strips running along axis j=(i+1)%3 (they end on faces ±j) and lying side by
// side across axis k=(i+2)%3; equal-angle chart a=atan(p_j/|p_i|), b=atan(p_k/|p_i|) in units of 45° (|a|,|b|=1 at the cube edges).
const float fe_K=1.2732395;
struct fe_L{int i;float s;float sa;float a;float b;float edge;float id;};
fe_L fe_layout(vec3 p){
 vec3 A=abs(p)+1e-6;bool w[3];
 for(int c=0;c<3;c++){int j=(c+1)%3,k=(c+2)%3;float sc=p[c]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.;
  w[c]=atan(A[j],A[c])*fe_K<1.+fe_del(c,sc,sa,atan(p[k],A[c])*fe_K);}
 int o=-1;for(int c=0;c<3;c++){if(w[c]&&!w[(c+2)%3])o=c;}
 if(o<0)o=A.x>=A.y&&A.x>=A.z?0:(A.y>=A.z?1:2);
 int j=(o+1)%3,k=(o+2)%3;float s=p[o]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.,sk=p[k]>=0.?1.:-1.;
 float a=atan(p[j],A[o])*fe_K,b=atan(p[k],A[o])*fe_K,ri=length(vec2(A[o],A[j])),rk=length(vec2(A[o],A[k]));
 float dl=fe_del(o,s,sa,b),dd=(fe_del(o,s,sa,b+.01)-fe_del(o,s,sa,b-.01))*50.;
 float e1=abs(1.+dl-abs(a))/(fe_K*sqrt(1./(ri*ri)+dd*dd/max(rk*rk,.25)));e1=length(vec2(e1,fe_gap(o,s,sa,b)*rk/fe_K));
 float ak=atan(A[o],A[k])*fe_K,bk=atan(p[j],A[k])*fe_K,rik=length(vec2(A[k],A[o])),rkk=length(vec2(A[k],A[j]));
 float dk=fe_del(k,sk,s,bk),ddk=(fe_del(k,sk,s,bk+.01)-fe_del(k,sk,s,bk-.01))*50.;
 float e2=abs(ak-1.-dk)/(fe_K*sqrt(1./(rik*rik)+ddk*ddk/max(rkk*rkk,.25)));e2=length(vec2(e2,fe_gap(k,sk,s,bk)*rkk/fe_K));
 float ka=ri/fe_K,kb=rk/fe_K;
 float e3=fe_inner(o,s,sa,a,b,vec2(a*ka,b*kb),ka,kb);
 return fe_L(o,s,sa,a,b,min(min(e1,e2),e3),fe_pid(o,s,sa,a,b));}

// Leather: per-panel tone, mottling, pebble grain, darker oiled seams, light scuffs; 'crk' adds dried craquelure.
vec3 fe_leather(vec3 p,vec3 tone,float id,float edge,float wear,float crk,float gr){
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
float fe_stitch(vec3 p,float edge){float d=1.-smoothstep(.003,.005,abs(edge-.016));return d*smoothstep(.5,.8,vnoise(p*140.))*.6;}

// Lace slot in radians: a along the slot, b across. x: lace mask, y: lace shade, z: slot/hole depth.
// style 0 = straight bars across the slot, 1 = slanted bars, 2 = empty holes only (laces gone).
vec3 fe_lace(float a,float b,float len,float cnt,float style,float hw){float LW=max(.011,hw*.16),SW=style>1.5?max(.012,hw*.3):.012;const float HR=0.011;
 if(abs(a)>len+.08||abs(b)>hw+.06)return vec3(0);
 float s=2.*len/(cnt-1.);
 float ai=clamp(floor((a+len)/s+.5),0.,cnt-1.)*s-len;
 float hole=1.-smoothstep(HR*.75,HR*1.2,length(vec2(a-ai,abs(b)-hw)));
 float slot=(1.-smoothstep(SW*.6,SW,abs(b)))*(1.-smoothstep(len,len+.03,abs(a)));
 float lm=0.,sh=0.;
 if(style<.5){float d=abs(a-ai);lm=(1.-smoothstep(LW,LW+.004,d))*step(abs(b),hw+.004);sh=sqrt(max(0.,1.-d*d/(LW*LW*1.4)));}
 else if(style<1.5){float a2=a-b/hw*s*.55;float aj=clamp(floor((a2+len)/s+.5),0.,cnt-1.)*s-len;float d=abs(a2-aj)*.8;
  lm=(1.-smoothstep(.01,.014,d))*step(abs(b),hw+.004);sh=sqrt(max(0.,1.-d*d/.00018));}
 return vec3(lm,sh,max(hole,slot*.9));}

Surf design(vec3 p){
 vec3 q=normalize(p+0.0120*(vec3(vnoise(p*2.3),vnoise(p*2.3+7.1),vnoise(p*2.3+13.7))-.5));
 q=rotX(rotX(rotY(rotZ(q,.08),-.5),.32),.1222);// the gallery camera's frame at the rest pose (it sits 7° above): +z toward the viewer, +y up; the photos and decals are placed in it
 vec3 r=mat3(vec3(0.0000,0.0000,1.0000),vec3(1.0000,0.0000,0.0000),vec3(0.0000,1.0000,0.0000))*vec3(dot(q,vec3(0.0000,0.0700,0.9975)),dot(q,vec3(1.0000,0.0000,0.0000)),dot(q,vec3(0.0000,0.9975,-0.0700)));// the pattern turned to the reference photo's view
 fe_L L=fe_layout(r);vec3 tone=hex(0x84502f);
 float gr=fbm(p*48.);vec3 col=fe_leather(p,tone,L.id,L.edge,1.0000,0.2500,gr);
 float g=panelGroove(L.edge,.011,.085);g+=(1.-g)*.07*gr;float st=fe_stitch(p,L.edge);col*=1.-.2*st;g=max(g,st*.35);

 if(L.i==2&&L.s*1.0000>0.){float la=(L.a-0.0000)*.7854,lb=(L.b-0.0000)*.7854;
  vec3 lc=fe_lace(la,lb,0.3700,6.0000,0.0000,0.1200);
  col=mix(col,tone*.18,lc.z*(1.-lc.x));g=max(g,lc.z*.85*(1.-lc.x));
  vec3 lcol=hex(0xd9a85a)*(.7+.4*fbm(p*70.));col=mix(col,lcol*(.55+.5*lc.y),lc.x);g=mix(g,.05,lc.x);
  float rim=(1.-smoothstep(.0,.03,abs(lb)-0.1300))*step(abs(la),0.4200)*(1.-lc.x);col*=1.-.15*rim;}
 return Surf(col,g,0.1600+.06*gr);}
`;
