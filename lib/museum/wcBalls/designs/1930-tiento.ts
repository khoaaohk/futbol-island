/** 1930 Tiento (Argentina's ball, first half of the final): 12 long rectangular panels in the cube layout (6 pairs of parallel strips, each pair turned 90° from its neighbours; WSC/P. Brown 2018, balones-oficiales.com, FIFA archive), worn brown leather, an open lace slit with 6 hole pairs and the laces gone (NFM ball, Commons photo by Oldelpaso). */
export default /* glsl */`
// Distance from x to the segment ab.
float ti_sd(vec2 x,vec2 a,vec2 b){vec2 pa=x-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float ti_del(int i,float s,float sa,float b){return 0.;}
float ti_gap(int i,float s,float sa,float b){return 0.;}
float ti_inner(int i,float s,float sa,float a,float b,vec2 X,float ka,float kb){return abs(X.y);}
float ti_pid(int i,float s,float sa,float a,float b){return (float(i*2)+(s<0.?1.:0.))*4.+(b>0.?2.:0.);}

// Volleyball cube frame: face (axis i, sign s) has strips running along axis j=(i+1)%3 (they end on faces ±j) and lying side by
// side across axis k=(i+2)%3; equal-angle chart a=atan(p_j/|p_i|), b=atan(p_k/|p_i|) in units of 45° (|a|,|b|=1 at the cube edges).
const float ti_K=1.2732395;
struct ti_L{int i;float s;float sa;float a;float b;float edge;float id;};
ti_L ti_layout(vec3 p){
 vec3 A=abs(p)+1e-6;bool w[3];
 for(int c=0;c<3;c++){int j=(c+1)%3,k=(c+2)%3;float sc=p[c]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.;
  w[c]=atan(A[j],A[c])*ti_K<1.+ti_del(c,sc,sa,atan(p[k],A[c])*ti_K);}
 int o=-1;for(int c=0;c<3;c++){if(w[c]&&!w[(c+2)%3])o=c;}
 if(o<0)o=A.x>=A.y&&A.x>=A.z?0:(A.y>=A.z?1:2);
 int j=(o+1)%3,k=(o+2)%3;float s=p[o]>=0.?1.:-1.,sa=p[j]>=0.?1.:-1.,sk=p[k]>=0.?1.:-1.;
 float a=atan(p[j],A[o])*ti_K,b=atan(p[k],A[o])*ti_K,ri=length(vec2(A[o],A[j])),rk=length(vec2(A[o],A[k]));
 float dl=ti_del(o,s,sa,b),dd=(ti_del(o,s,sa,b+.01)-ti_del(o,s,sa,b-.01))*50.;
 float e1=abs(1.+dl-abs(a))/(ti_K*sqrt(1./(ri*ri)+dd*dd/max(rk*rk,.25)));e1=length(vec2(e1,ti_gap(o,s,sa,b)*rk/ti_K));
 float ak=atan(A[o],A[k])*ti_K,bk=atan(p[j],A[k])*ti_K,rik=length(vec2(A[k],A[o])),rkk=length(vec2(A[k],A[j]));
 float dk=ti_del(k,sk,s,bk),ddk=(ti_del(k,sk,s,bk+.01)-ti_del(k,sk,s,bk-.01))*50.;
 float e2=abs(ak-1.-dk)/(ti_K*sqrt(1./(rik*rik)+ddk*ddk/max(rkk*rkk,.25)));e2=length(vec2(e2,ti_gap(k,sk,s,bk)*rkk/ti_K));
 float ka=ri/ti_K,kb=rk/ti_K;
 float e3=ti_inner(o,s,sa,a,b,vec2(a*ka,b*kb),ka,kb);
 return ti_L(o,s,sa,a,b,min(min(e1,e2),e3),ti_pid(o,s,sa,a,b));}

// Leather: per-panel tone, mottling, pebble grain, darker oiled seams, light scuffs; 'crk' adds dried craquelure.
vec3 ti_leather(vec3 p,vec3 tone,float id,float edge,float wear,float crk,float gr){
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
float ti_stitch(vec3 p,float edge){float d=1.-smoothstep(.003,.005,abs(edge-.016));return d*smoothstep(.5,.8,vnoise(p*140.))*.6;}

// Lace slot in radians: a along the slot, b across. x: lace mask, y: lace shade, z: slot/hole depth.
// style 0 = straight bars across the slot, 1 = slanted bars, 2 = empty holes only (laces gone).
vec3 ti_lace(float a,float b,float len,float cnt,float style,float hw){float LW=max(.011,hw*.16),SW=style>1.5?max(.012,hw*.3):.012;const float HR=0.011;
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
 vec3 q=normalize(p+0.0060*(vec3(vnoise(p*2.3),vnoise(p*2.3+7.1),vnoise(p*2.3+13.7))-.5));
 q=rotX(rotX(rotY(rotZ(q,.08),-.5),.32),.1222);// the gallery camera's frame at the rest pose (it sits 7° above): +z toward the viewer, +y up; the photos and decals are placed in it
 vec3 r=mat3(vec3(0.0000,0.3827,0.9239),vec3(1.0000,0.0000,0.0000),vec3(0.0000,0.9239,-0.3827))*vec3(dot(q,vec3(-0.2190,0.1394,0.9657)),dot(q,vec3(0.8032,0.5877,0.0973)),dot(q,vec3(-0.5540,0.7970,-0.2407)));// the pattern turned to the reference photo's view
 ti_L L=ti_layout(r);vec3 tone=hex(0x8a7258);
 float gr=fbm(p*48.);vec3 col=ti_leather(p,tone,L.id,L.edge,0.9000,0.3000,gr);
 float g=panelGroove(L.edge,.011,.085);g+=(1.-g)*.07*gr;float st=ti_stitch(p,L.edge);col*=1.-.2*st;g=max(g,st*.35);

 if(L.i==2&&L.s*1.0000>0.){float la=(L.a-0.0000)*.7854,lb=(L.b-0.5000)*.7854;
  vec3 lc=ti_lace(la,lb,0.2700,6.0000,2.0000,0.0750);
  col=mix(col,tone*.18,lc.z*(1.-lc.x));g=max(g,lc.z*.85*(1.-lc.x));
  vec3 lcol=hex(0x8a7a58)*(.7+.4*fbm(p*70.));col=mix(col,lcol*(.55+.5*lc.y),lc.x);g=mix(g,.05,lc.x);
  float rim=(1.-smoothstep(.0,.03,abs(lb)-0.0850))*step(abs(la),0.3200)*(1.-lc.x);col*=1.-.15*rim;}
 return Surf(col,g,0.1000+.06*gr);}
`;
