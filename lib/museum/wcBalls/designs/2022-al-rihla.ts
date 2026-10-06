/** 2022 Al Rihla (Qatar): 20 thermally bonded panels on a truncated rhombic dodecahedron (soccerpost; adidas "20-piece
 *  panel shape"; the construction drawn in US D1,105,320): 8 triangles and 12 long kite panels, four of which meet tip to
 *  tip at each of the 6 octahedral points. Kite weight set so a triangle is ~0.9 of a kite's area (D1,105,320 FIG. 1–3).
 *  Print (Commons "Al-Rihla.jpg", the user's IMG_9134): white triangles with a faint lattice; on the kites, rows of
 *  tapering 'feather' streaks standing on every triangle seam, blue at the seam then red, orange and yellow. Logos are
 *  decals when added. Seam curvature ('drumstick' shape) is not modelled: the seams are great-circle arcs. */
export const arGlsl=/* glsl */`
const vec3 AR_F[20]=vec3[](
 vec3(.57735,.57735,.57735),vec3(.57735,.57735,-.57735),vec3(.57735,-.57735,.57735),vec3(.57735,-.57735,-.57735),
 vec3(-.57735,.57735,.57735),vec3(-.57735,.57735,-.57735),vec3(-.57735,-.57735,.57735),vec3(-.57735,-.57735,-.57735),
 vec3(.6859,.6859,0.),vec3(.6859,-.6859,0.),vec3(-.6859,.6859,0.),vec3(-.6859,-.6859,0.),
 vec3(.6859,0.,.6859),vec3(.6859,0.,-.6859),vec3(-.6859,0.,.6859),vec3(-.6859,0.,-.6859),
 vec3(0.,.6859,.6859),vec3(0.,.6859,-.6859),vec3(0.,-.6859,.6859),vec3(0.,-.6859,-.6859));
/** Pinwheel twist about the 6 octahedron vertices (cubic in each coordinate, so it is smooth and dies off between them). */
vec3 ar_warp(vec3 p){return p;}
Cell ar_cell(vec3 p){int b=0,b2=0;float s=-9.,s2=-9.;for(int i=0;i<20;i++){float d=dot(p,AR_F[i]);if(d>s){s2=s;b2=b;s=d;b=i;}else if(d>s2){s2=d;b2=i;}}
 float e=9.;vec3 cb=AR_F[b];for(int i=0;i<20;i++){if(i==b)continue;vec3 dn=cb-AR_F[i];e=min(e,(s-dot(p,AR_F[i]))/length(dn));}
 return Cell(b,b2,normalize(cb),normalize(AR_F[b2]),e);}
/** One colour from a 5-colour cycle (k = 0..4). */
vec3 ar_pick(float k,vec3 a,vec3 b,vec3 c,vec3 d,vec3 e){return k<1.?a:(k<2.?b:(k<3.?c:(k<4.?d:e)));}
/** base: panel colour; s0..s4: streak colours (s0 dominant mid-propeller, s4 the propeller ends). */
Surf ar_ball(vec3 p,vec3 base,vec3 s0,vec3 s1,vec3 s2,vec3 s3,vec3 s4,float gloss){
 vec3 q=ar_warp(p);Cell c=ar_cell(q);
 vec3 col=base;
 // Distance to the nearest triangle (for kites) and which side.
 if(c.id>=8){
  float et=9.;int ti=0;vec3 cb=AR_F[c.id];float sb=dot(q,cb);
  for(int i=0;i<8;i++){vec3 dn=cb-AR_F[i];float d=(sb-dot(q,AR_F[i]))/length(dn);if(d<et){et=d;ti=i;}}
  // Feathers: rows of tapering streaks standing on each triangle seam, pointing into the kite (blue at the seam, then red,
  // orange and yellow toward the tips), longest mid-seam.
  vec3 n=normalize(AR_F[ti]);vec3 u=normalize(cb-n*dot(cb,n)),v=cross(n,u);float psi=atan(dot(q,v),dot(q,u));
  float side=clamp(1.-abs(psi)/1.0,0.,1.);
  float reach=.06+.30*side*side;
  float k=psi*32.;float fi=floor(k),ff=fract(k);float h=hash3(vec3(fi,float(c.id),float(ti)));
  float len=reach*(.6+.4*h);float wdt=.46*sqrt(max(1.-et/max(len,1e-3),0.));
  float on=step(et,len)*step(abs(ff-.5),wdt);
  float t=et/max(reach,1e-3);
  vec3 fc=t<.25?s3:(t<.5?s4:(t<.75?s0:(t<.9?s1:s2)));
  col=mix(col,fc,on);
  col=mix(col,s4,(1.-smoothstep(.022,.03,et))*smoothstep(.05,.25,side));
 }else{
  // Triangle: white with a fine blue lattice fading in from its corners.
  vec3 qq=q*60.;float lat=step(.9,max(abs(fract(qq.x+qq.y)-.5),abs(fract(qq.y-qq.z)-.5))*2.);
  col=mix(col,s4,.18*lat*smoothstep(.12,.0,c.edge));
 }
 vec3 qq=q*90.;float tex=abs(fract(qq.x+qq.y)-.5)+abs(fract(qq.y-qq.z)-.5);
 col*=.97+.04*tex;
 float g=seamLine(c.edge,.0105);
 return Surf(col,g,gloss);}
`;
export default arGlsl+/* glsl */`
Surf design(vec3 p){return ar_ball(p,hex(0xf6f6f8),hex(0xd7263d),hex(0xf26b3a),hex(0xf2d43a),hex(0x4aa3ff),hex(0x1f4fbf),.6);}
`;
