import type {Decal} from '../decals';
/** 1962 Crack (Custodio Zamora, Chile): 18 panels, 12 hexagonal and 6 rectangular (museodefutbol.com, worldcupballs.info, Wikipedia): a chamfered cube, one rectangle (about 64° by 48°, measured on the Commons photo) centred on each cube face and an elongated hexagon along each cube edge, three hexagons meeting at each cube corner (Commons photo: the CRACK rectangle framed by four hexagons whose pointed ends meet on the diagonals). Yellow-tan leather with the CRACK / ZAMORA / MODELO Nº607 stamps. */
export default /* glsl */`
// Distance from x to the segment ab.
float cr_sd(vec2 x,vec2 a,vec2 b){vec2 pa=x-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
struct cr_L{int i;float s;float sa;float a;float b;float edge;float id;};
// Weighted cells: 6 rectangles (axis normals, weight WS) and 12 hexagons, the one on cube edge (i, j=i+1) tilted 55.9° from
// axis i toward j, so each rectangle is longer toward its j neighbours (±32°) than toward its k neighbours (±24°), as in the photo.
const float cr_WS=1.0778;
vec3 cr_n(int m){if(m<6){vec3 v=vec3(0);v[m/2]=(m%2==0)?1.:-1.;return v*cr_WS;}
 int e=m-6,c=e/4,q=e%4;vec3 v=vec3(0);v[c]=((q%2==0)?1.:-1.)*.56;v[(c+1)%3]=((q/2==0)?1.:-1.)*.82858;return v;}
cr_L cr_layout(vec3 p){int bi=0;float bs=-9.;for(int m=0;m<18;m++){float d=dot(p,cr_n(m));if(d>bs){bs=d;bi=m;}}
 vec3 nb=cr_n(bi);float e=9.;for(int m=0;m<18;m++){if(m==bi)continue;vec3 dn=nb-cr_n(m);e=min(e,(bs-dot(p,cr_n(m)))/length(dn-p*dot(dn,p)+1e-5));}
 return cr_L(0,1.,1.,0.,0.,e,float(bi));}

// Leather: per-panel tone, mottling, pebble grain, darker oiled seams, light scuffs; 'crk' adds dried craquelure.
vec3 cr_leather(vec3 p,vec3 tone,float id,float edge,float wear,float crk,float gr){
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
float cr_stitch(vec3 p,float edge){float d=1.-smoothstep(.003,.005,abs(edge-.016));return d*smoothstep(.5,.8,vnoise(p*140.))*.6;}

Surf design(vec3 p){
 vec3 q=normalize(p+0.0060*(vec3(vnoise(p*2.3),vnoise(p*2.3+7.1),vnoise(p*2.3+13.7))-.5));
 q=rotX(rotX(rotY(rotZ(q,.08),-.5),.32),.1222);// the gallery camera's frame at the rest pose (it sits 7° above): +z toward the viewer, +y up; the photos and decals are placed in it
 vec3 r=mat3(vec3(0.0000,0.0000,1.0000),vec3(1.0000,0.0000,0.0000),vec3(0.0000,1.0000,0.0000))*vec3(dot(q,vec3(0.0000,0.0000,1.0000)),dot(q,vec3(1.0000,0.0000,0.0000)),dot(q,vec3(0.0000,1.0000,0.0000)));// the pattern turned to the reference photo's view
 cr_L L=cr_layout(r);vec3 tone=hex(0xc9a57a);
 float gr=fbm(p*48.);vec3 col=cr_leather(p,tone,L.id,L.edge,0.3500,0.0000,gr);
 float g=panelGroove(L.edge,.011,.085);g+=(1.-g)*.07*gr;float st=cr_stitch(p,L.edge);col*=1.-.2*st;g=max(g,st*.35);
 return Surf(col,g,0.2400+.06*gr);}
`;

export const decals:Decal[]=[{"src":"/museum/wcballs/decals/1962-crack-1.webp","dir":[0.4659,0.3937,0.7924],"up":[-0.1332,0.9165,-0.3771],"w":0.95,"h":0.95,"gloss":0.1,"credit":"Wikimedia Commons, File:Crack-1962.jpg (MDBR), CC BY-SA 3.0"}];
