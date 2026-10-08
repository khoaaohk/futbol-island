import type {Decal} from '../decals';
/**
 * 1978 Tango (Argentina), the 'Tango Durlast / River Plate' match ball: 32 hand-stitched leather panels (12 pentagons, 20
 * hexagons). Each hexagon carries a black 'triad', the part of the hexagon outside three 12-circle arcs centred on its
 * neighbouring pentagons, edged by a thin white gap and a thin black ring line. The arc geometry is measured from the Commons
 * PD photo 'Adidas Tango Argentina (River Plate) 1978 cup Official ball.jpg' (Zac allan), rectified onto the panel net:
 *  - triad edge 0.520 rad from the pentagon centre toward the hexagon centre, 0.509 toward the arm (slightly lobed circle);
 *  - white gap 0.017, black ring line 0.043 wide inside it;
 *  - the print stops ~0.035 rad short of every stitched seam (the seam allowance), so arms end in a straight cut and the
 *    ring lines break at each hexagon edge, exactly as on the ball;
 *  - a small ® just inside each ring near the clockwise end of every arc (60 in all).
 * The 'Tango® River Plate', 'Official World Cup 1978' and 'Durlast adidas' marks are photo decals on the three pentagons
 * round one triad.
 */
export default /* glsl */`
float tg_seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
/** The registered-trademark sign: ring + R, q in units of the ring radius. */
float tg_reg(vec2 q,float px){
 float w=.13,r=abs(length(q)-.86);float d=r-w*.8;
 vec2 s=q*1.35;float R=min(tg_seg(s,vec2(-.32,-.5),vec2(-.32,.5)),tg_seg(s,vec2(-.32,.5),vec2(.08,.5)));
 R=min(R,abs(length(s-vec2(.08,.25))-.25)+max(-(s.x-.08),0.)*9.);R=min(R,tg_seg(s,vec2(-.32,0.),vec2(.08,0.)));R=min(R,tg_seg(s,vec2(.0,0.),vec2(.34,-.5)));
 d=min(d,R/1.35-w*.75);return 1.-smoothstep(-px,px,d);}
/** Signed distance (rad) outside the slightly lobed circle round pentagon P (>0 = in the triad); also the signed angle round P. */
vec2 tg_arc(vec3 p,vec3 P,vec3 Q,vec3 H){
 float a=acos(clamp(dot(p,P),-1.,1.));
 vec3 tp=normalize(p-P*dot(p,P)+1e-6),tq=normalize(Q-P*dot(Q,P)),th=normalize(H-P*dot(H,P));
 float phi=acos(clamp(dot(tp,tq),-1.,1.));
 float sgn=atan(dot(cross(th,tp),P),dot(th,tp));
 return vec2(a-(.5145-.0055*cos(5.*phi)),sgn);}
Surf design(vec3 p){
 Cell c=truncIcoCell(p);bool pent=c.id<12;
 float grain=fbm(p*42.);
 vec3 white=hex(0xf4f2ec)*(.95+.07*grain),ink=hex(0x141414)*(.95+.08*grain);
 vec3 col=white;
 if(!pent){
  Cell v=icoCell(p);vec3 H=c.c;
  vec2 A=tg_arc(p,v.c,v.c2,H),B=tg_arc(p,v.c2,v.c,H);
  vec2 m=A.x<B.x?A:B;vec3 P=A.x<B.x?v.c:v.c2;
  float d=m.x,aa=.0022;
  float clip=smoothstep(.034-aa,.034+aa,c.edge);// print stops short of the stitched seams
  float tri=smoothstep(-aa,aa,d);
  float ring=smoothstep(-aa,aa,d+.060)*(1.-smoothstep(-aa,aa,d+.017));
  // ® just inside the ring, at the clockwise end of the arc (angle +0.47 round the pentagon from the hexagon direction).
  vec3 th=normalize(H-P*dot(H,P)),tb=cross(P,th);
  float ang=.47,rad=.432;vec3 C=normalize(P*cos(rad)+(th*cos(ang)+tb*sin(ang))*sin(rad));
  vec3 e1=normalize(C-P*dot(C,P));e1=normalize(e1-C*dot(e1,C));vec3 e2=cross(C,e1);
  // the R stands upright for a reader looking from the pentagon side: its up points away from the pentagon centre.
  vec2 q=vec2(dot(p-C,-e2),dot(p-C,e1))/.0165;
  float reg=length(q)<1.2?tg_reg(q,.09):0.;
  col=mix(col,ink,clip*max(max(tri,ring),reg));
 }
 col*=1.-.05*(1.-smoothstep(.0,.045,c.edge));
 float g=panelGroove(c.edge,.011,.07);
 float st=stitches(p,c,.03,.006);col=mix(col,col*.72+.04,st*.5);
 return Surf(col,g,.38);}
`;

export const decals:Decal[]=[
 {src:'/museum/wcballs/decals/1978-tango-1.webp',dir:[0.0252,0.5299,0.8477],up:[-0.0160,-0.8476,0.5303],w:0.261,h:0.147,credit:"Adidas Tango Argentina (River Plate) 1978 cup Official ball (Wikimedia Commons, Zac allan, public domain)"},
 {src:'/museum/wcballs/decals/1978-tango-2.webp',dir:[0.5233,0.8515,0.0329],up:[0.1402,-0.1241,0.9823],w:0.233,h:0.216,credit:"1978 - Tango (Argentina) (4171468378).jpg (Wikimedia Commons, Shine 2010, CC BY 2.0)"},
 {src:'/museum/wcballs/decals/1978-tango-3.webp',dir:[-0.4311,0.8989,0.0782],up:[-0.1148,-0.1406,0.9833],w:0.298,h:0.144,credit:"1978 TangoDurlast.jpg (Wikimedia Commons, Chong Fat, public domain)"}
];
