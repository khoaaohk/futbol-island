import type {Decal} from '../decals';
/** 1974 Telstar Durlast (West Germany): the Telstar's 32 stitched panels (12 black pentagons, 20 white hexagons) with the
 *  glossier Durlast polyurethane coat. Black printing as on the match ball (Commons 'Fifaworldcup1974.JPG', Florian K, CC BY-SA
 *  2.5): 'TELSTAR durlast®' on the hexagon above a pentagon, 'official world cup 1974' on the two hexagons beside it (mirror
 *  tilts) and the adidas® wordmark with 'made in france' slanting across the two hexagons below it. */
export default /* glsl */`
Surf design(vec3 p){
 Cell c=truncIcoCell(p);bool pent=c.id<12;
 float grain=fbm(p*48.);
 vec3 col=pent?hex(0x121216):hex(0xf6f5f1);col*=.95+.06*grain;
 col*=1.-.05*(1.-smoothstep(.0,.045,c.edge));
 float g=panelGroove(c.edge,.010,.07);
 float st=stitches(p,c,.028,.0055);col=mix(col,pent?hex(0x34343a):hex(0xcfccc4),st*.45);
 return Surf(col,g,pent?.46:.42);}
`;

export const decals:Decal[]=[
 {src:'/museum/wcballs/decals/1974-telstar-durlast-1.webp',dir:[-0.0860,0.9329,0.3498],up:[0.0636,0.3555,-0.9325],w:0.298,h:0.169,credit:"Fifaworldcup1974.JPG (Wikimedia Commons, Florian K, CC BY-SA 2.5); this crop CC BY-SA 2.5"},
 {src:'/museum/wcballs/decals/1974-telstar-durlast-2.webp',dir:[0.5379,0.6306,0.5595],up:[-0.0126,0.6696,-0.7426],w:0.282,h:0.274,credit:"Fifaworldcup1974.JPG (Wikimedia Commons, Florian K, CC BY-SA 2.5); this crop CC BY-SA 2.5"},
 {src:'/museum/wcballs/decals/1974-telstar-durlast-2.webp',dir:[-0.5379,0.6306,0.5595],up:[0.0126,0.6696,-0.7426],w:0.282,h:0.274,credit:"Fifaworldcup1974.JPG (Wikimedia Commons, Florian K, CC BY-SA 2.5); this crop CC BY-SA 2.5"},
 {src:'/museum/wcballs/decals/1974-telstar-durlast-3.webp',dir:[0.1058,-0.0447,0.9934],up:[-0.1450,0.9876,0.0599],w:0.593,h:0.219,credit:"Fifaworldcup1974.JPG (Wikimedia Commons, Florian K, CC BY-SA 2.5); this crop CC BY-SA 2.5"}
];
