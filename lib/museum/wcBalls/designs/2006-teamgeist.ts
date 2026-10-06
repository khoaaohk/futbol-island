/**
 * 2006 Teamgeist (Germany): the first thermally bonded World Cup ball, 14 curved panels on a truncated-octahedron frame.
 * 6 'propeller' panels sit on the cube faces, each a long hourglass (narrow waist at the face centre, round lobes reaching
 * over two opposite cube edges) and turned 90° from its neighbours (pyritohedral: +z runs along y, +y along x, +x along z).
 * The 8 rounded triangles fill the cube corners and meet each other along short seams that lie on the coordinate planes
 * (from one propeller's waist to the next propeller's lobe tip), exactly the truncated octahedron's hexagon-hexagon edges.
 * Graphics: each propeller carries a black ribbon inside its outline with a thin gold trim; the triangles carry faint silver
 * contour lines. No logos, no emblem, no match text. TG_CORE is shared with the gold Berlin final ball.
 */
export const TG_CORE=/* glsl */`
const vec3 TG_N[6]=vec3[](vec3(1,0,0),vec3(-1,0,0),vec3(0,1,0),vec3(0,-1,0),vec3(0,0,1),vec3(0,0,-1));
const vec3 TG_A[6]=vec3[](vec3(0,0,1),vec3(0,0,1),vec3(1,0,0),vec3(1,0,0),vec3(0,1,0),vec3(0,1,0));
const float TG_UC=.70,TG_R=.33;
float tg_smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
/** Signed angular distance to dumbbell i's outline (negative inside); uv = (along the long axis, across it) in radians.
 *  The outline is measured off US D527,432 FIG. 1 (seen square-on to one dumbbell): half-width w(u) = 0.235 at the waist,
 *  0.32 across the lobes (u ≈ 0.6), closing in a round end (circle centre 0.70, radius 0.33) whose tip is 59° from the
 *  panel centre; the waist seams then run 13°–33° from each face centre, as drawn. */
float tg_prop(vec3 p,int i,out vec2 uv){vec3 n=TG_N[i],a=TG_A[i],b=cross(n,a);
 float u=atan(dot(p,a),dot(p,n)),v=asin(clamp(dot(p,b),-1.,1.));uv=vec2(u,v);float au=abs(u),u2=au*au;
 float w=.23468+u2*(.61905+u2*(-1.20573+u2*.51730)),dw=au*(2.*.61905+u2*(4.*-1.20573+u2*6.*.51730));
 float band=max((abs(v)-w)/sqrt(1.+dw*dw),au-.85);
 float lobe=length(vec2((au-TG_UC)*cos(v),v))-TG_R;
 return tg_smin(band,lobe,.04);}
Surf tg_surf(vec3 p,bool berlin){
 float dmin=9.;int pid=0;vec2 puv=vec2(0);
 for(int i=0;i<6;i++){vec2 uv;float d=tg_prop(p,i,uv);if(d<dmin){dmin=d;pid=i;puv=uv;}}
 vec3 white=hex(0xf4f4f1),black=hex(0x141414),gold=berlin?hex(0xb08a3a):hex(0xc3a35a),fill=berlin?hex(0xcfb46c):white;
 vec3 col;float edge;
 if(dmin<0.){
  edge=-dmin;
  float lobe=smoothstep(.15,.5,abs(puv.x));
  float trimIn=.011,blk=mix(.04,.09,lobe);
  col=fill;
  // Inside the round lobe ends: a few fine concentric rings (the 'eyes').
  float rl=length(vec2((abs(puv.x)-TG_UC),puv.y));
  float rings=(1.-smoothstep(.0,.004,abs(fract(rl/.035)-.5)*.035-.0))*lobe*step(rl,TG_R-.1);
  col=mix(col,berlin?hex(0x8a6a2a):hex(0xc9ccd0),rings*(berlin?.3:.55));
  col=mix(col,black,smoothstep(trimIn,trimIn+.003,edge)*(1.-smoothstep(blk,blk+.004,edge)));
  col=mix(col,gold,smoothstep(.003,.005,edge)*(1.-smoothstep(trimIn-.001,trimIn+.002,edge)));
 }else{
  vec3 a=abs(p);float plane=asin(min(a.x,min(a.y,a.z)));
  edge=min(dmin,plane);
  col=white;
  // Faint silver (gold on the final ball) contour lines running alongside each propeller.
  float c1=1.-smoothstep(.0015,.004,abs(dmin-.045)),c2=1.-smoothstep(.0015,.004,abs(dmin-.07)),c3=1.-smoothstep(.0015,.004,abs(dmin-.095));
  float fade=smoothstep(.2,.05,plane+.02)*.0+1.;
  col=mix(col,berlin?hex(0xcdb27a):hex(0xc4c8cd),max(c1,max(c2*.8,c3*.55))*.7*fade);
 }
 col*=.97+.05*fbm(p*36.);
 return Surf(col,seamLine(edge,.009),berlin&&dmin<0.?.62:.55);}
`;
export default TG_CORE+/* glsl */`
Surf design(vec3 p){return tg_surf(p,false);}
`;
