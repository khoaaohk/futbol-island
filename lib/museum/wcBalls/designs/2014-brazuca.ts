/**
 * 2014 Brazuca (Brazil), rebuilt Oct 5 2026 from US D696,737 S / D696,738 S (line drawings) and D702,301 S (the colour
 * drawing, FIG. 1 seen square-on to one panel), by J. Otto for adidas. 6 identical thermally bonded panels on a cube: each
 * panel is a four-armed 'plus' whose arms swing past the 4 straight cube edges, so every one of the 12 seams is an S-curve
 * (each half wraps one panel's arm), 8 three-panel corners, and the layout keeps only the cube's 24 rotations (chiral).
 *
 * Seam geometry: each panel = its cube face, plus an arm on each of its 4 edges (filleted on), minus the 4 arms of its
 * neighbours (filleted off). Each arm crosses its edge a quarter of the way from the midpoint and reaches deep into the
 * neighbour's notch, so the panel is the patent's four-armed plus; the arm size, offset and fillets were fitted to the seam
 * lines of D696,737 FIG. 1 (seen square-on to one panel).
 *
 * Print (Commons photos, the user's IMG_9132): along every seam, on each panel's side, a dark navy swoosh, then a coloured
 * band (orange, green or blue, one pair per panel), on white PU with a fine pimple texture; at the 8 corners the swooshes of
 * the three panels gather into a dark navy core. BZ_CORE is shared with the Final Rio and the two Conext15 balls.
 */
type V3=number[];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a:V3,b:V3)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=(a:V3)=>{const l=Math.hypot(a[0],a[1],a[2]);return a.map(x=>x/l);};
const CUBE=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
/** Arm lobe fitted to D696,737 FIG. 1 (chamfer fit of the model seams to the drawing, mean 3.6 px at 200 px): on each seam,
 *  each panel's arm is an ellipse A0 along the seam from its midpoint and B0 across it into the neighbour, semi-axes EA (along)
 *  × EB (across); K1 fillets the arms on, K2 the neighbours' arms off. */
const A0=-.247,B0=.256,EA=.183,EB=.323,K1=.15,K2=.05;
/** 12 edges with their frames: M midpoint, T along, N across (toward the first panel). */
const edges:{a:number;b:number;M:V3;T:V3;N:V3}[]=[];
for(let a=0;a<6;a++)for(let b=a+1;b<6;b++){if(Math.abs(dot(CUBE[a],CUBE[b]))>.5)continue;
 const M=nrm(CUBE[a].map((x,i)=>x+CUBE[b][i])),N=nrm(CUBE[a].map((x,i)=>x-CUBE[b][i]));edges.push({a,b,M,T:cross(M,N),N});}
const g=(v:V3)=>`vec3(${v.map(x=>x.toFixed(6)).join(',')})`;
const f=(x:number)=>x.toFixed(4);
export const BZ_CORE=/* glsl */`
const vec3 BZ_M[12]=vec3[](${edges.map(e=>g(e.M)).join(',')});
const vec3 BZ_T[12]=vec3[](${edges.map(e=>g(e.T)).join(',')});
const vec3 BZ_N[12]=vec3[](${edges.map(e=>g(e.N)).join(',')});
const int BZ_A[12]=int[](${edges.map(e=>e.a).join(',')});
const int BZ_B[12]=int[](${edges.map(e=>e.b).join(',')});
float bz_smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
/** The arm of the panel that sees (a,b) in (along, across toward itself). */
float bz_lobe(float a,float b){return (length(vec2((a-(${f(A0)}))/${f(EA)},(b+${f(B0)})/${f(EB)}))-1.)*${f(Math.min(EA,EB))};}
struct BzCell{int face;float edge;float lobe;float foe;float corner;};
BzCell bz_cell(vec3 p){
 float own[6];for(int i=0;i<6;i++)own[i]=9.;
 for(int e=0;e<12;e++){float cm=dot(p,BZ_M[e]);if(cm<.07)continue;float r=acos(min(cm,1.));vec3 t=(p-BZ_M[e]*cm)/max(sqrt(max(1.-cm*cm,0.)),1e-4);
  float a=r*dot(t,BZ_T[e]),b=r*dot(t,BZ_N[e]);
  // Panel A sees (a,b); panel B's frame is T→−T, N→−N, i.e. (−a,−b).
  own[BZ_A[e]]=min(own[BZ_A[e]],bz_lobe(a,b));own[BZ_B[e]]=min(own[BZ_B[e]],bz_lobe(-a,-b));}
 float d[6]=float[](p.x,-p.x,p.y,-p.y,p.z,-p.z);
 float s1=9.,s2=9.;int w=0;float wl=9.,wf=9.;
 for(int x=0;x<6;x++){float m=-9.,lf=9.;for(int y=0;y<6;y++){if(y==x)continue;m=max(m,d[y]);lf=min(lf,own[y]);}
  float base=asin(clamp((m-d[x])*.7071068,-1.,1.));
  float s=-bz_smin(-bz_smin(base,own[x],${f(K1)}),lf,${f(K2)});
  if(s<s1){s2=s1;s1=s;w=x;wl=own[x];wf=lf;}else if(s<s2)s2=s;}
 float corner=acos(clamp(dot(abs(p),vec3(.57735027)),-1.,1.));
 return BzCell(w,.5*(s2-s1),wl,wf,corner);}
/** style 0 Brazuca, 1 Final Rio (gold/black/green), 2 Conext15 (WWC 2015), 3 Conext15 Final Vancouver. */
Surf bz_surf(vec3 p,int style){
 BzCell c=bz_cell(p);float e=c.edge;
 vec3 col=hex(0xf7f7f5);
 // Arm factor: inside the panel's own arm lobes the swooshes swell, in the core they thin out.
 // Swooshes: thick where this panel wraps a neighbour's arm (the notch), thin along its own arms.
 float sw=smoothstep(.22,.0,c.foe)*(1.-.6*smoothstep(.05,-.1,c.lobe));
 vec3 navy=hex(0x0f1a48);
 vec3 C[3]=vec3[](hex(0xff6a10),hex(0x13a84a),hex(0x1f9be3));
 int k=c.face%3;vec3 c1=C[k],c2=C[(k+1)%3];
 if(style==1){navy=hex(0xc9a04a);c1=hex(0x2fbf4a);c2=hex(0x0c0d0c);}
 else if(style==2){navy=hex(0x111111);C=vec3[](hex(0xd42a2a),hex(0x27a046),hex(0x2a5bd7));c1=C[k];c2=C[(k+1)%3];}
 else if(style==3){navy=hex(0x0b1b3a);c1=hex(0xd8212a);c2=hex(0xc9cdd3);}
 float o0=.005,wN=o0+.008+.05*sw,o1=wN+.002,w1=o1+.006+.065*sw,o2=w1+.002,w2=o2+.004+.06*sw;
 float aa=.003;
 float bN=smoothstep(o0,o0+aa,e)*(1.-smoothstep(wN-aa,wN,e));
 float b1=smoothstep(o1,o1+aa,e)*(1.-smoothstep(w1-aa,w1,e));
 float b2=smoothstep(o2,o2+aa,e)*(1.-smoothstep(w2-aa,w2,e));
 float core=(1.-smoothstep(.07,.085,c.corner))*smoothstep(o0,o0+aa,e);
 col=mix(col,c2,b2);col=mix(col,c1,b1);col=mix(col,navy,bN);col=mix(col,style==1?hex(0x0c0d0c):navy,core);
 if(style==1)col=mix(col,c1,smoothstep(.006,.008,e)*(1.-smoothstep(o0-.002,o0,e)));
 else{vec3 q=p*150.;vec3 fq=fract(q)-.5;float star=(1.-smoothstep(.1,.2,length(fq)))*step(.86,hash3(floor(q)));
  col=mix(col,hex(0x4a68b8),star*max(bN,core)*.8);}
 float pim=vnoise(p*260.);
 return Surf(col*(.97+.04*pim),max(panelGroove(e,.012,.035),.06*pim),.58);}
`;
export default BZ_CORE+/* glsl */`
Surf design(vec3 p){return bz_surf(p,0);}
`;
