/**
 * 2010 Jabulani (South Africa), rebuilt Oct 5 2026 from US 8,529,386 B2 (adidas; FIG. 2b, 3 and the unfolded net, FIG. 5):
 * 8 thermally bonded, pre-moulded panels on a truncated tetrahedron. 4 panels '30' are rounded triangles whose three sides
 * are convex; 4 panels '40' have six corners joined by alternating concave and nearly straight edges. The long curved seams
 * (12) join a triangle's convex side to a hexagon's concave edge; the short straight seams (6) join two hexagons; 12
 * three-panel corners (1 triangle + 2 hexagons). Built as a power diagram: triangle sites at the tetrahedron's faces, hexagon
 * sites opposite; the triangles' score is JAB_A·cos + JAB_K, which turns their sides into convex small-circle arcs. JAB_A/K
 * are set so that, as in the net (FIG. 5), a triangle is ~0.7 of a hexagon's area and the straight hexagon-hexagon seams
 * are ~0.3 of the curved ones.
 * Pseudo-seams 60 (shallower grooves, same profile): one closed loop parallel to each triangle's edge, and on each hexagon
 * three arcs that cut off a crescent along each of its concave edges (four sub-panels).
 * Print (Commons photos; the user's IMG_9137): each crescent carries the band of small triangles in the ball's 11 colours,
 * edged gold along the seam and black along the pseudo-seam; the three crescents of a hexagon ring its white centre (the
 * 'eye'), giving the 4 design elements, and the triangles stay white (the one carrying the logos sits between three elements); grip 'n' groove micro-ribs all over. JAB_CORE is shared with the Jo'bulani and SpeedCell.
 */
export const JAB_CORE=/* glsl */`
const float JAB_A=2.,JAB_K=-.85;
const vec3 JAB_C[8]=vec3[](vec3(1,1,1),vec3(1,-1,-1),vec3(-1,1,-1),vec3(-1,-1,1),vec3(-1,-1,-1),vec3(-1,1,1),vec3(1,-1,1),vec3(1,1,-1));
/** Scores (the winner is the panel): 0..3 triangles, 4..7 hexagons (hexagon 4+i is opposite triangle i). */
void jab_scores(vec3 p,out float s[8]){for(int i=0;i<8;i++)s[i]=i<4?JAB_A*dot(p,JAB_C[i])*.57735027+JAB_K:dot(p,JAB_C[i])*.57735027;}
struct JabCell{int id;vec3 c;float edge;float edgeT;int t;};
/** Panel, true angular distance to its outline, and (for hexagons) the distance to the nearest triangle seam and which. */
JabCell jab_cell(vec3 p){float S[8];jab_scores(p,S);
 int w=0;for(int i=1;i<8;i++)if(S[i]>S[w])w=i;
 float edge=9.,edgeT=9.;int ti=0;vec3 cw=JAB_C[w]*(w<4?JAB_A*.57735027:.57735027);
 for(int i=0;i<8;i++){if(i==w)continue;vec3 g=cw-JAB_C[i]*(i<4?JAB_A*.57735027:.57735027);vec3 gt=g-p*dot(p,g);float d=(S[w]-S[i])/max(length(gt),1e-4);
  edge=min(edge,d);if(i<4&&d<edgeT){edgeT=d;ti=i;}}
 return JabCell(w,normalize(JAB_C[w]),edge,edgeT,ti);}
vec3 jab_pal(float h){int i=int(floor(h*14.));
 if(i<3)return hex(0x1a1a1a);if(i==3)return hex(0x3b3b3b);if(i==4)return hex(0xc8102e);if(i==5)return hex(0xf47b20);
 if(i==6)return hex(0xf2c500);if(i==7)return hex(0x00843d);if(i==8)return hex(0x7ab648);if(i==9)return hex(0x0057a8);
 if(i==10)return hex(0x5ab4e5);if(i==11)return hex(0x6d2c1e);if(i==12)return hex(0x8b1e4f);return hex(0x0f5a3a);}
Surf jab_surf(vec3 p,bool gold){
 JabCell c=jab_cell(p);float e=c.edge;
 vec3 col=hex(0xf6f6f3);float pseudo=0.;
 float rib=0.;{vec3 q=p*120.;rib=max(max(smoothstep(.36,.5,abs(fract(q.x+q.y*.5)-.5)),smoothstep(.36,.5,abs(fract(q.y+q.z*.5)-.5))),smoothstep(.36,.5,abs(fract(q.z+q.x*.5)-.5)));}
 if(c.id<4){
  // Triangle panel: the white eye, a closed pseudo-seam parallel to its edge, fine grey contour lines inside it.
  pseudo=1.-smoothstep(.003,.007,abs(e-.075));
  float lf=fract((e-.075)/.022),lines=(1.-smoothstep(.0,.14,min(lf,1.-lf)))*step(.09,e);
  col=mix(col,hex(0xb9bcc0),lines*.35);
 }else if(c.edgeT<.30){
  // Hexagon: the crescent along this triangle side (widest mid-side, closing at the triangle's corners).
  vec3 n=normalize(JAB_C[c.t]),h=normalize(JAB_C[c.id]);vec3 u=normalize(h-n*dot(h,n)),v=cross(n,u);
  float psi=atan(dot(p,v),dot(p,u));float sd=clamp(psi/1.0472,-1.,1.);
  float W=.27*sqrt(max(1.-sd*sd,0.));float ea=c.edgeT;
  if(ea<W){
   vec3 m;
   if(gold)m=mix(hex(0xbf9b42),hex(0xdcbd68),.5+.5*sin(dot(p,vec3(260.,150.,90.))));
   else{vec3 q=p*34.;vec3 gi=floor(q+.5*floor(q.yzx));m=jab_pal(hash3(gi+float(c.t)*7.));m=mix(m,hex(0x161a18),.5);}
   col=m;
   col=mix(col,hex(0xe8b923),(1.-smoothstep(.016,.019,ea))*smoothstep(.006,.008,ea));// gold line along the seam
   col=mix(col,hex(0x111111),smoothstep(W-.014,W-.010,ea));// black along the pseudo-seam (the eye's rim)
  }
  pseudo=(1.-smoothstep(.003,.007,abs(ea-W)))*step(.02,W);
 }
 float fw=fwidth(p.x+p.y)*120.;rib*=1.-smoothstep(.15,.45,fw);// fade the micro-ribs before they alias
 col*=1.-.04*rib;
 return Surf(col,max(max(seamLine(e,.010),.4*pseudo),.07*rib),.55);}
`;
export default JAB_CORE+/* glsl */`
Surf design(vec3 p){return jab_surf(p,false);}
`;
