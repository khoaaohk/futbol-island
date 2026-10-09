/**
 * Holo foil shader (card lab, Oct 8 2026), written from scratch for Futbol Island's cards.
 *
 * One full-face triangle. The canvas sits over the card's front face with CSS `mix-blend-mode: hard-light`, so the shader
 * outputs a "light" image where 0.5 grey leaves the art untouched, brighter values screen it (sheen, hotspot, glitter, bright
 * foil) and darker values multiply it (the foil's colour on the pale card stock, the gold etching). That lets one layer read
 * on the cream stock and on the dark picture window alike.
 *
 * Per pixel: the card-space position, the view vector (camera at the card's CSS perspective, 1400 px) and the light vector
 * (a point light that follows the pointer), both brought into the tilted card's frame on the CPU; the halfway vector; the
 * position's pattern piece (its own facet normal and id); a spectrum hue from the halfway vector, the facet and the id, so each
 * piece shifts colour as the card turns; a soft sheen and a sharp hotspot; frame-edge glitter facets (Icon); gold etching (Icon);
 * a rounded-rect alpha. The portrait is kept clear with the player's own riso mask (ink + tone, blurred by mip level).
 * Units: `u` is card-space with the face 100 wide, origin at the face centre, y down.
 */
export const HOLO_VERTEX=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){vUv=vec2(aPos.x*.5+.5,.5-aPos.y*.5);gl_Position=vec4(aPos,0.,1.);}`;

export const HOLO_FRAGMENT=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uSize;      // face, css px
uniform float uPx;       // device px per css px
uniform vec4 uRadii;     // inner corner radii: tl, tr, br, bl
uniform vec4 uWin;       // picture window x, y, w, h
uniform float uWinR;
uniform vec4 uText0;     // the text panel: name plate, role/nation, tag chip and bio (kept plain)
uniform vec4 uText1;     // spare text box (unused: off-card)
uniform vec4 uMaskRect;  // the portrait's ink layer box
uniform float uHasMask;
uniform vec2 uMaskShift; // parallax of the portrait plane
uniform vec4 uPaper;     // the portrait's cream paper arch (same plane)
uniform sampler2D uMask; // packed riso masks: ink (left half), tone (right half)
uniform vec3 uCam;       // camera, card frame (face widths)
uniform vec3 uLightPos;  // light, card frame (face widths)
uniform float uGlint;    // -1, or the arrival sweep 0..1
uniform int uPattern;    // 0 net, 1 shield, 2 lanes, 3 burst
uniform int uTier;       // 0 regular, 1 elite, 2 icon
uniform float uStrength;
uniform vec2 uCentre;    // pattern centre (the portrait), u units

const float TAU=6.2831853;
float h11(float n){return fract(sin(n*127.1)*43758.5453);}
float h21(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
vec2 h22(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
// Rounded box distance with a radius per corner (y down): r = tl, tr, br, bl.
float sdRound(vec2 p,vec2 b,vec4 r){float k=p.x<0.?(p.y<0.?r.x:r.w):(p.y<0.?r.y:r.z);vec2 q=abs(p)-b+k;return min(max(q.x,q.y),0.)+length(max(q,0.))-k;}
float sdRect(vec2 p,vec4 R){vec2 c=R.xy+R.zw*.5;vec2 q=abs(p-c)-R.zw*.5;return min(max(q.x,q.y),0.)+length(max(q,0.));}
// A line of half width w along the zero set of f (screen-space anti-aliased).
float stroke(float f,float w){float a=max(fwidth(f),1e-4);return 1.-smoothstep(w-a,w+a,abs(f));}
vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}

struct Pat{float line;float fill;float id;vec2 n;float etch;};

// Goalkeeper: a goal net. Diamond mesh of round cords, a knot at every crossing, hanging with a gentle sag.
Pat netPat(vec2 u){
 Pat P;u.y+=1.4*sin(u.x*.12)+.8*sin(u.x*.05+1.);
 vec2 r=vec2(u.x+u.y,u.y-u.x)*.70710678;float s=8.;vec2 g=r/s,id=floor(g),f=fract(g)-.5,a=.5-abs(f);
 bool vx=a.x<a.y;float off=(vx?-sign(f.x)*a.x:-sign(f.y)*a.y)*s;// signed distance across the nearest cord
 vec2 seg=vx?vec2(id.x+step(0.,f.x),id.y*2.+.5):vec2(id.x*2.+.5,id.y+step(0.,f.y));
 float w=.42,dl=min(a.x,a.y)*s,knot=length(a)*s;
 float cord=stroke(dl,w)*(.82+.18*sin((vx?g.y:g.x)*TAU*2.));// twisted rope
 float kn=1.-smoothstep(1.05-fwidth(knot),1.05+fwidth(knot),knot);
 P.line=max(cord,kn);P.fill=.1;P.id=kn>.5?h21(floor(g+.5)+7.):h21(seg);
 vec2 across=rot(vx?vec2(1.,0.):vec2(0.,1.),-.785398);// round cords: the normal turns across the cord
 P.n=kn>.5?normalize(a*sign(f)+1e-3)*.6:across*clamp(off/w,-1.,1.)*.75+(h22(seg)-.5)*.3;
 P.etch=stroke(dl-1.25,.16);return P;}

// Defender: a shield wall. Staggered heater shields, each tip tucked into the dip between two shields of the row below;
// every shield is cut into four shards (left/right of a centre ridge, above/below a chevron) that catch the light apart.
float shieldF(vec2 q){// q: half width 1; top peak y=-1, shoulders -.72, sides to .15, tip 1.3. Negative inside.
 float ax=abs(q.x),top=-.72-.28*(1.-ax);float t=clamp((q.y-.15)/1.15,0.,1.),w=q.y<.15?1.:1.-pow(t,1.55);
 return max(max(top-q.y,ax-w),q.y-1.3);}
Pat shieldPat(vec2 u){
 Pat P;float W=19.,H=19.5,hw=8.4;float row=floor(u.y/H);float best=1e9,bestRow=-1e9;vec2 cid=vec2(0.),cq=vec2(0.);
 for(int k=-1;k<=1;k++){float rr=row+float(k);float sh=mod(rr,2.)*.5;float ix=floor(u.x/W-sh+.5);
  for(int i=-1;i<=1;i++){float cx=(ix+float(i)+sh)*W;vec2 q=(u-vec2(cx,rr*H+H*.5-1.))/hw;float f=shieldF(q);
   if(f<.12&&rr>=bestRow){best=f;bestRow=rr;cid=vec2(ix+float(i),rr);cq=q;}}}// the lower row stands in front
 if(bestRow<-1e8){P.line=0.;P.fill=0.;P.id=0.;P.n=vec2(0.);P.etch=0.;return P;}
 float inside=step(best,0.);
 float ridge=inside*stroke(cq.x,.045),chev=inside*stroke(cq.y-.12-.38*abs(cq.x),.045);
 P.line=max(stroke(best,.085),max(ridge,chev)*.75);P.fill=inside*.3;
 float shard=(cq.x<0.?0.:1.)+(cq.y<.12+.38*abs(cq.x)?0.:2.);
 P.id=h21(cid*1.7+shard*.31);P.n=vec2(cq.x<0.?-.55:.55,shard>1.?.5:-.35)+(h22(cid)-.5)*.25;
 P.etch=inside*stroke(best+.2,.035);return P;}

// Midfielder: passing lanes. The centre circle and spot, the halfway line, and ten lanes (two edge lines and pass arrows)
// running out of the circle; the wedges between the lanes are the pieces.
Pat lanesPat(vec2 u){
 Pat P;vec2 d=u-uCentre;float r=length(d),R=37.;const float N=8.;float ang=atan(d.y,d.x)-.31;
 float k=floor(ang/(TAU/N)+.5),th=k*TAU/N+.31;vec2 dir=vec2(cos(th),sin(th)),per=vec2(-dir.y,dir.x);
 float al=dot(d,dir),ac=dot(d,per),out_=step(R+3.,al);
 float edges=out_*max(stroke(ac-3.4,.38),stroke(ac+3.4,.38));
 float arrows=out_*step(abs(ac),3.)*stroke(fract((al-abs(ac)*1.2)/9.)-.5,.075);
 float circle=stroke(r-R,1.3),spot=1.-smoothstep(1.6,1.6+fwidth(r),r),half_=stroke(d.y,.6);
 P.line=max(max(edges,arrows*.95),max(circle,max(spot,half_)));
 float sector=floor((ang+TAU)/(TAU/N));P.fill=r<R?.08:.16;P.id=h11(sector+1.)*.8+(r<R?.5:0.);
 float side=sign(ac);P.n=dir*.45+per*side*.3;if(r<R)P.n=-normalize(d+1e-3)*.25;
 P.etch=stroke(r-R-1.7,.14)+stroke(r-R+1.7,.14);return P;}

// Forward: starbursts. One big burst behind the player, small bursts over the card; every ray is bevelled (two facets).
float burstF(vec2 d,float n,float L,float w0,float rot0,out float ray,out float side){
 float r=length(d),a=atan(d.y,d.x)-rot0;float st=TAU/n;float k=floor(a/st+.5);ray=k;float da=a-k*st;side=sign(da);
 float len=mod(k,2.)<.5?L:L*.62;float hw=w0*(1.-r/len);return max(abs(da)*r-max(hw,0.),r-len);}
Pat burstPat(vec2 u){
 Pat P;float ray,side;vec2 d=u-uCentre;float f=burstF(d,16.,95.,4.2,.1,ray,side);
 float id=h11(ray+3.);vec2 dir=normalize(d+1e-3);
 P.n=dir*.3+vec2(-dir.y,dir.x)*side*.62;
 float lineF=f;float sid=0.;
 // Small bursts on a jittered grid, away from the big one's centre.
 vec2 cell=floor(u/24.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=cell+vec2(i,j);vec2 jt=h22(c);
  if(jt.x<.18)continue;vec2 cc=(c+.2+.6*jt)*24.;if(length(cc-uCentre)<34.)continue;
  float rs,ss;float sz=6.+5.*h21(c+5.);float g=burstF(u-cc,8.,sz,1.7,jt.y*3.,rs,ss);
  if(g<lineF){lineF=g;sid=1.;id=h11(rs+h21(c)*40.);vec2 dd=normalize(u-cc+1e-3);P.n=dd*.3+vec2(-dd.y,dd.x)*ss*.62;}}
 float inside=step(lineF,0.);
 P.line=max(stroke(lineF,.26),inside*(sid>.5?.95:.0));P.fill=inside*(sid>.5?.0:.62);P.id=id;
 P.etch=stroke(lineF+.9,.12)*inside;return P;}

Pat pattern(vec2 u){if(uPattern==0)return netPat(u);if(uPattern==1)return shieldPat(u);if(uPattern==2)return lanesPat(u);return burstPat(u);}

// A thin-film style spectrum, softened toward pastel so it sits with the riso palette.
vec3 spectrum(float t){vec3 c=.5+.5*cos(TAU*(t+vec3(0.,.33,.67)));return mix(c,vec3(dot(c,vec3(.333))),.04);}

void main(){
 vec2 p=vUv*uSize;// css px, y down
 float dEdge=-sdRound(p-uSize*.5,uSize*.5,uRadii);
 float edgeA=clamp(dEdge*uPx+.5,0.,1.);
 if(edgeA<=0.){outColor=vec4(0.);return;}
 float dWin=sdRound(p-(uWin.xy+uWin.zw*.5),uWin.zw*.5,vec4(uWinR));
 float inWin=1.-smoothstep(-1.,1.,dWin);
 float text=max(1.-smoothstep(0.,3.,sdRect(p,uText0)),1.-smoothstep(0.,3.,sdRect(p,uText1)));
 // The portrait: ink and tone at a blurred mip level, a soft silhouette that keeps foil off the player.
 float fig=0.;
 if(uHasMask>.5){vec2 m=(p-uMaskRect.xy-uMaskShift)/uMaskRect.zw;
  if(m.x>-.05&&m.x<1.05&&m.y>-.05&&m.y<1.05){vec2 mc=clamp(m,0.,1.);
   float ink=textureLod(uMask,vec2(mc.x*.5,mc.y),3.).a,tone=textureLod(uMask,vec2(.5+mc.x*.5,mc.y),3.).a;
   fig=smoothstep(.02,.16,max(ink,tone*.9));}}
 else{vec2 c=(p-(uWin.xy+vec2(uWin.z*.5,uWin.w*.62)))/(uWin.zw*vec2(.32,.42));fig=1.-smoothstep(.8,1.05,length(c));}
 if(uPaper.z>0.){vec2 pc=p-uMaskShift-(uPaper.xy+uPaper.zw*.5);float tr=min(uPaper.z*.5,uPaper.w*.42),br=uPaper.z*.18;
  fig=max(fig,(1.-smoothstep(-2.,4.,sdRound(pc,uPaper.zw*.5,vec4(tr,tr,br,br))))*.88);}
 fig*=inWin;

 vec2 u=(p-uSize*.5)/uSize.x*100.;
 Pat P=pattern(u);

 // Lighting in the tilted card's frame (face widths; card plane z = 0).
 vec3 pos=vec3((p-uSize*.5)/uSize.x,0.);
 vec3 V=normalize(uCam-pos),L=normalize(uLightPos-pos),Hv=normalize(V+L);
 vec3 N=normalize(vec3(P.n,1.));
 float ndh=max(dot(N,Hv),0.),flat_=max(Hv.z,0.);

 // Where the foil goes. Regular: only a band round the frame and round the inside of the picture window.
 float place=1.;
 if(uTier==0){float frameBand=1.-smoothstep(8.,30.,dEdge);float winBand=inWin*(1.-smoothstep(4.,26.,-dWin));place=max(frameBand,winBand);}
 float keep=(1.-.97*fig)*(1.-text);
 float lineC=P.line*place*keep,fillC=P.fill*place*keep;

 float hue=P.id*.83+2.1*(Hv.x*.9-Hv.y*.75)+1.6*dot(P.n,Hv.xy)+.35*vUv.y;
 vec3 col=spectrum(hue);
 float lift=.55+1.15*pow(ndh,9.);// pieces facing the light flare
 float glintBand=0.;
 if(uGlint>=0.){float x=(vUv.x+vUv.y*.55)-mix(-.6,2.,uGlint);glintBand=exp(-x*x*38.)*sin(3.14159*uGlint);lift+=glintBand*1.4;}
 // On the dark window the foil brightens (screen half); on the pale stock it tints (multiply half).
 vec3 delta=(((col-.5)*.95+vec3(.1))*lineC+(col-.5)*.42*fillC)*lift*uStrength;

 // Sheen (broad) and hotspot (sharp), off the flat card: everywhere but the portrait's face.
 float sheen=pow(flat_,22.)*.16+glintBand*.22;float hot=pow(flat_,420.)*.55;
 delta+=vec3(1.,.97,.9)*(sheen+hot)*(1.-.97*fig)*(uTier==0?.6:1.)*uStrength;

 if(uTier==2){
  // Gold etching: a double rule round the frame and a fine line inside every pattern piece, warm and metallic.
  float bd=dEdge;float rule=max(stroke(bd-4.5,.75),stroke(bd-8.5,.45))*(1.-inWin)*(1.-text);
  float etch=max(rule,P.etch*keep);
  float metal=.25+1.5*pow(ndh,16.)+glintBand;
  delta+=etch*(vec3(.02,-.1,-.32)+vec3(.55,.4,.1)*metal*.6);
  // Glitter: tiny facets in a band along the frame edge, each with its own normal, flashing as the angle changes.
  float band=(1.-smoothstep(11.,17.,dEdge))*(1.-inWin)*(1.-text);
  if(band>0.){vec2 gp=p*uPx/2.6;vec2 gc=floor(gp);vec2 rnd=h22(gc);vec2 fo=fract(gp)-.5;
   vec3 gn=normalize(vec3((rnd-.5)*.9,1.));float on=step(.3,h21(gc+9.1));
   float spark=pow(max(dot(gn,Hv),0.),140.)*on*(1.-smoothstep(.18,.5,length(fo)));
   delta+=band*spark*(.8*vec3(1.)+.5*spectrum(rnd.x+hue))*1.6;}}

 delta*=1.-text;// readability: nothing at all over the text panel (user, Oct 8 2026)
 vec3 outc=clamp(vec3(.5)+delta,0.,1.);
 outColor=vec4(outc*edgeA,edgeA);
}`;
