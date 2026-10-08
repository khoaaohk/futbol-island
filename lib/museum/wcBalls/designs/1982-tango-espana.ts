import type {Decal} from '../decals';
/**
 * 1982 Tango España (Spain): the 1978 Tango's 32 panels and 20 black triads (12 white 'circles' round the pentagons) on
 * leather with rubber-inlaid, water-resistant seams: a glossier coat and tighter seams. The triad, gap, ring line, seam
 * margin and the ® at the clockwise end of every arc are the same as the 1978 ball; checked against the CC BY 4.0 photo
 * 'Fútbol Diseñando una pasión - 03' (ProtoplasmaKid), rectified onto the panel net.
 * Printing (photo decals): 'Tango® España' on a pentagon with its text pointing at a neighbouring pentagon; 'Official World
 * Cup Ball 1982 / Ballon Officiel Coupe du Monde 1982' on the pentagon 216° clockwise round from that text's up; the adidas
 * trefoil and wordmark on the pentagon 144° round (positions from the CC BY photo and Warren Rohner's photo).
 */
export default /* glsl */`
float te_seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
/** The registered-trademark sign: ring + R, q in units of the ring radius. */
float te_reg(vec2 q,float px){
 float w=.13,r=abs(length(q)-.86);float d=r-w*.8;
 vec2 s=q*1.35;float R=min(te_seg(s,vec2(-.32,-.5),vec2(-.32,.5)),te_seg(s,vec2(-.32,.5),vec2(.08,.5)));
 R=min(R,abs(length(s-vec2(.08,.25))-.25)+max(-(s.x-.08),0.)*9.);R=min(R,te_seg(s,vec2(-.32,0.),vec2(.08,0.)));R=min(R,te_seg(s,vec2(.0,0.),vec2(.34,-.5)));
 d=min(d,R/1.35-w*.75);return 1.-smoothstep(-px,px,d);}
/** Signed distance (rad) outside the slightly lobed circle round pentagon P (>0 = in the triad); also the signed angle round P. */
vec2 te_arc(vec3 p,vec3 P,vec3 Q,vec3 H){
 float a=acos(clamp(dot(p,P),-1.,1.));
 vec3 tp=normalize(p-P*dot(p,P)+1e-6),tq=normalize(Q-P*dot(Q,P)),th=normalize(H-P*dot(H,P));
 float phi=acos(clamp(dot(tp,tq),-1.,1.));
 float sgn=atan(dot(cross(th,tp),P),dot(th,tp));
 return vec2(a-(.5145-.0055*cos(5.*phi)),sgn);}
Surf design(vec3 p){
 Cell c=truncIcoCell(p);bool pent=c.id<12;
 float grain=fbm(p*50.);
 vec3 white=hex(0xf7f6f2)*(.96+.05*grain),ink=hex(0x101012)*(.96+.06*grain);
 vec3 col=white;
 if(!pent){
  Cell v=icoCell(p);vec3 H=c.c;
  vec2 A=te_arc(p,v.c,v.c2,H),B=te_arc(p,v.c2,v.c,H);
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
  float reg=length(q)<1.2?te_reg(q,.09):0.;
  col=mix(col,ink,clip*max(max(tri,ring),reg));
 }
 col*=1.-.04*(1.-smoothstep(.0,.04,c.edge));
 float g=panelGroove(c.edge,.009,.055);
 float st=stitches(p,c,.026,.005);col=mix(col,col*.78+.03,st*.35);
 return Surf(col,g,.44);}
`;

export const decals:Decal[]=[
 {src:'/museum/wcballs/decals/1982-tango-espana-1.webp',dir:[-0.0300,0.5686,0.8221],up:[-0.9696,-0.2165,0.1143],w:0.299,h:0.151,credit:"Adidas Tango Espa\u00f1a (Wikimedia Commons, Warren Rohner, CC BY-SA 2.0); this crop CC BY-SA 2.0"},
 {src:'/museum/wcballs/decals/1982-tango-espana-2.webp',dir:[0.8773,0.0009,0.4799],up:[-0.4798,-0.0218,0.8771],w:0.288,h:0.264,credit:"Adidas Tango Espa\u00f1a (Wikimedia Commons, Warren Rohner, CC BY-SA 2.0); this crop CC BY-SA 2.0"},
 {src:'/museum/wcballs/decals/1982-tango-espana-3.webp',dir:[0.5423,0.8395,-0.0331],up:[-0.6380,0.4371,0.6340],w:0.273,h:0.235,credit:"1982 TangoEspana (Wikimedia Commons, Chong Fat, public domain)"}
];
