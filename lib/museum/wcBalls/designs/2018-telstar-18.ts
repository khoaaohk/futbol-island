/** 2018 Telstar 18 (Russia): 6 thermally bonded panels (warped cube layout); each panel carries two elongated pixel-mosaic
 *  patches (12 in all, where the 1970 pentagons sat) in black and greys, a digital nod to the 1970 Telstar's black panels. No logos or wordmarks. */
export const ts18Glsl=/* glsl */`
vec3 ts_warp(vec3 p){vec3 q=p;q=rotX(q,.7*q.x);q=rotY(q,.7*q.y);q=rotZ(q,.7*q.z);return normalize(q);}
/** Telstar 18 surface with a 5-colour mosaic palette (c0 most common … c3 lightest, used where the mosaic fades; cw the white base). */
Surf ts_ball(vec3 p,vec3 cw,vec3 c0,vec3 c1,vec3 c2,vec3 c3){
 vec3 q=ts_warp(p);int f=cubeFace(q);vec2 uv=cubeUV(q,f);
 float edge=(1.-max(abs(uv.x),abs(uv.y)))*.55;
 // Two mosaics per panel, sitting where the 1970 Telstar's pentagons were (the 12 icosahedron vertices land at uv=(0,±.62)
 // on each cube face). Each is a slanted trapezoid, long axis along uv.x, the pair point-symmetric about the panel centre.
 float sg=uv.y<0.?-1.:1.;
 float s=uv.x*sg,t=abs(uv.y)-.56;s+=.35*t;
 float px=.058;vec2 cell=floor(vec2(s,t)/px);vec2 cc=(cell+.5)*px;
 float pid=float(f)*2.+(sg>0.?1.:0.);
 float h=hash3(vec3(cell,pid*7.13+1.)),h2=hash3(vec3(cell.yx+3.1,pid*3.7));
 // Trapezoid: a long straight edge on the seam side (t=+.27), a shorter one inward (t=-.27), ends cut at ~45° in pixel steps.
 float tt=(.27-cc.y)/.54;// 0 at the long edge, 1 at the short edge
 float halfLen=.76-.32*tt;
 float endD=halfLen-abs(cc.x);
 float inside=step(0.,endD)*step(0.,tt)*step(tt,1.);
 // Pixels drop out and turn lighter toward the ends and the short edge (the pixel gradient).
 float dis=max(1.-smoothstep(.0,.2,endD),.6*smoothstep(.7,1.,tt));
 float keep=inside*step(dis*.9,h2);
 vec3 pix=h<.42?c0:(h<.7?c1:(h<.88?c2:c3));
 pix=mix(pix,h2<.5?c2:c3,dis*step(.4,h));
 vec3 col=cw*(.97+.04*fbm(p*30.));
 col=mix(col,pix,keep);
 float g=seamLine(edge,.011);
 // Fine raised texture of the PU skin.
 float tex=step(.5,fract(dot(q,vec3(150.,141.,163.))))*.04;
 return Surf(col*(1.-tex),g,.56);}
`;
export default ts18Glsl+/* glsl */`
Surf design(vec3 p){return ts_ball(p,hex(0xf4f4f2),hex(0x14181d),hex(0x2b323b),hex(0x4d5763),hex(0x8f9aa6));}
`;
