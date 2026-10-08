import type {Decal} from '../decals';
/** 1970 Telstar (Mexico): the first 32-panel World Cup ball, 12 black pentagons and 20 white hexagons, hand-stitched leather.
 *  Printing in gold, as on the Mexico 1970 official ball (Commons, Zac allan, PD): 'TELSTAR' (outlined, drop-shadowed capitals)
 *  on the hexagon above a pentagon, 'DURLAST' in the same style across that pentagon, 'OFFICIAL WORLDCUP MEXICO 1970' on the
 *  two hexagons beside it, and the adidas wordmark across the two hexagons below it. */

export default /* glsl */`
Surf design(vec3 p){
 Cell c=truncIcoCell(p);bool pent=c.id<12;
 float grain=fbm(p*42.),big=fbm(p*6.+float(c.id));
 vec3 col=pent?hex(0x161618):hex(0xf2efe6);col*=.93+.08*grain+.04*big;
 col*=1.-.07*(1.-smoothstep(.0,.05,c.edge));// slightly darker, oiled edges by the seams
 float g=panelGroove(c.edge,.011,.075);
 float st=stitches(p,c,.03,.006);col=mix(col,pent?hex(0x3a3a3a):hex(0xc9c3b4),st*.55);
 return Surf(col,g,pent?.4:.32);}
`;

export const decals:Decal[]=[
 {src:'/museum/wcballs/decals/1970-telstar-1.webp',dir:[-0.0476,0.9447,0.3244],up:[0.0260,0.3258,-0.9451],w:0.376,h:0.132,gloss:0.62,credit:"Adidas Telstar Mexico 1970 Official ball (Wikimedia Commons, Zac allan, public domain)"},
 {src:'/museum/wcballs/decals/1970-telstar-2.webp',dir:[0.0071,0.4876,0.8730],up:[0.0003,0.8731,-0.4876],w:0.306,h:0.087,gloss:0.62,credit:"Adidas Telstar Mexico 1970 Official ball (Wikimedia Commons, Zac allan, public domain)"},
 {src:'/museum/wcballs/decals/1970-telstar-3.webp',dir:[0.0217,0.0163,0.9996],up:[0.0067,0.9998,-0.0164],w:0.515,h:0.136,gloss:0.62,credit:"Adidas Telstar Mexico 1970 Official ball (Wikimedia Commons, Zac allan, public domain)"},
 {src:'/museum/wcballs/decals/1970-telstar-4.webp',dir:[0.6266,0.5270,0.5742],up:[0.1838,0.6160,-0.7660],w:0.219,h:0.264,gloss:0.62,credit:"1970 TelstarDurlast (Wikimedia Commons, public domain)"},
 {src:'/museum/wcballs/decals/1970-telstar-4.webp',dir:[-0.6266,0.5270,0.5742],up:[-0.1838,0.6160,-0.7660],w:0.219,h:0.264,gloss:0.62,credit:"1970 TelstarDurlast (Wikimedia Commons, public domain)"}
];
