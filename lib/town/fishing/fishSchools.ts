import * as T from 'three';
import {patchUnderwater,reefTheme,uwDepthAt,UW_SURFACE,type ReefTheme} from './underwater';

/**
 * Sea life in the fishing view (Oct 12 2026: "more fish", then "see the coral and the fish and not just shadows").
 *
 * Coloured low-poly fish in three schools that turn together and scatter from the float, solo cruisers, a couple of crabs scuttling
 * near the shore and, at Coral Cay and on the causeway, an occasional ray or turtle gliding past. Each animal has a soft shadow on
 * the seabed under it. Decoration only: the catchable fish is driven by fishingCore.ts (fishingVisuals.ts draws it).
 *
 * Cost: ONE InstancedMesh draw for everything. The geometry holds every body (fish, crab, ray, turtle) plus a shadow quad; the vertex
 * shader keeps the instance's own body (the others collapse to a point), bends the tail / legs / wings / flippers, and drops the
 * shadow onto the seabed. Species colours and patterns (silver, striped, blue, yellow, orange, clownfish bands, two-tone parrotfish)
 * are per-instance attributes painted in the fragment shader, tinted by depth like the coral (underwater.ts). Steering at 10 Hz,
 * positions per rendered frame. Phones get a 4-sided body and fewer fish. Exists only with the fishing visuals; hidden when idle.
 *
 * Oct 14 2026:
 * - No pop-in ("the fish sometimes teleport in"): at the start of a session every fish rises from the seabed haze as it fades in
 *   (never appears at its swimming depth), the glider and the deep silhouettes start outside the view and fade at both ends.
 * - DEEP MODE (a theme with `deep`, the deep-sea boats): no crabs, no seabed shadows; the schools become ONE bait ball swirling
 *   round a slowly moving centre (it follows the boat's bait-ball hotspot when there is one, `setBait`), two cruisers become big
 *   tuna / marlin silhouettes crossing far below, and the glider is a manta or turtle deep down. Same one draw.
 */
const STEER_DT=.1;
type Look={a:string;b:string;pattern:number;shape:[number,number,number];size:[number,number]};
/** Ambient species looks (exported for tests/fishing.cjs: every reef theme's fish must exist here). */
export const LOOKS:Record<string,Look>={
 sardine:{a:'#4f7896',b:'#e9f0f4',pattern:0,shape:[.8,.75,1.1],size:[.36,.46]},
 bream:{a:'#d8cc8e',b:'#2a2a30',pattern:1,shape:[1,1.15,1],size:[.42,.52]},
 blueTang:{a:'#2c5ee8',b:'#ffd23a',pattern:2,shape:[.9,1.35,.9],size:[.4,.5]},
 yellowTang:{a:'#ffd21f',b:'#fff0a0',pattern:2,shape:[.9,1.45,.85],size:[.38,.48]},
 clown:{a:'#ff7414',b:'#ffffff',pattern:3,shape:[1,1.1,.95],size:[.3,.38]},
 garibaldi:{a:'#ff6400',b:'#ffa528',pattern:4,shape:[1,1.2,1],size:[.62,.76]},
 parrot:{a:'#22c4a2',b:'#a066ea',pattern:4,shape:[1,1.05,1.1],size:[.72,.88]},
 mackerel:{a:'#2f6f6a',b:'#e6eef0',pattern:5,shape:[.85,.8,1.15],size:[.6,.74]},
 bass:{a:'#7f8c96',b:'#eef2f4',pattern:0,shape:[1,1,1.05],size:[.74,.9]},
 // Oct 13 2026 ("colourful tropical fish"): reef species for the per-spot casts (underwater.ts REEF_THEMES `fish`).
 butterfly:{a:'#fff6e0',b:'#ffd21f',pattern:4,shape:[.75,1.5,.8],size:[.3,.4]},
 damsel:{a:'#1f8bff',b:'#7fd8ff',pattern:0,shape:[.85,1.05,.9],size:[.22,.3]},
 wrasse:{a:'#2fd27a',b:'#ff5fa8',pattern:4,shape:[.8,.8,1.2],size:[.4,.52]},
 queenAngel:{a:'#2a7fff',b:'#ffd21f',pattern:4,shape:[.8,1.55,.85],size:[.45,.56]},
 royalGramma:{a:'#a040ff',b:'#ffd21f',pattern:4,shape:[.85,1,1],size:[.24,.32]},
 sergeant:{a:'#f2e46a',b:'#1d1d22',pattern:1,shape:[.9,1.2,.95],size:[.3,.4]},
 parrotPink:{a:'#ff6fae',b:'#3fd6ff',pattern:4,shape:[1,1.05,1.1],size:[.7,.86]},
 snapper:{a:'#ff4a3a',b:'#ffd0c0',pattern:0,shape:[1,1.05,1.05],size:[.5,.64]},
 grouper:{a:'#8a5a3a',b:'#e0b080',pattern:6,shape:[1.1,1.1,1.1],size:[.8,1]},
 barracuda:{a:'#9fb4c2',b:'#eef4f8',pattern:5,shape:[.65,.6,1.5],size:[.8,1]},
 anthias:{a:'#ff7a3a',b:'#ff3fa0',pattern:4,shape:[.85,1.05,1],size:[.24,.32]},
 // Oct 14 2026, the deep-sea boats (deep mode below): a silver bait-ball fish and the big pelagic silhouettes far below.
 baitfish:{a:'#8fb2c8',b:'#f2f7fa',pattern:0,shape:[.7,.7,1.15],size:[.26,.32]},
 tuna:{a:'#10243e',b:'#2a4258',pattern:0,shape:[1,.95,1.35],size:[1.5,1.8]},
 marlin:{a:'#102a4e',b:'#26405a',pattern:0,shape:[.55,.7,2],size:[1.6,2]},
};
const KIND={fish:0,crab:1,ray:2,turtle:3,shadow:9};

// ---- Geometry: every body in one buffer. Head toward −Z, y up. Attributes: position, color (fins darker), aKind, aBend.
type Part={pos:number[];col:number[];kind:number[];bend:number[]};
const part=():Part=>({pos:[],col:[],kind:[],bend:[]});
function tri(p:Part,a:number[],b:number[],c:number[],col:number[],kind:number,bend:(v:number[])=>number){for(const v of [a,b,c]){p.pos.push(v[0],v[1],v[2]);p.col.push(...col);p.kind.push(kind);p.bend.push(bend(v));}}
/** A thin part (fin, leg, tail): both windings, so the batch can cull back faces of the closed bodies. */
const tri2=(p:Part,a:number[],b:number[],c:number[],col:number[],kind:number,bend:(v:number[])=>number)=>{tri(p,a,b,c,col,kind,bend);tri(p,a,c,b,col,kind,bend);};
function fromGeometry(p:Part,g:T.BufferGeometry,col:(y:number,x:number,z:number)=>number[],kind:number,bend:(v:number[])=>number){
 const geo=g.index?g.toNonIndexed():g,pos=geo.getAttribute('position');for(let i=0;i<pos.count;i++){const v=[pos.getX(i),pos.getY(i),pos.getZ(i)];p.pos.push(...v);p.col.push(...col(v[1],v[0],v[2]));p.kind.push(kind);p.bend.push(bend(v));}
 if(geo!==g)geo.dispose();g.dispose();
}
const tailBend=(v:number[])=>{const w=T.MathUtils.clamp((v[2]+.1)/.66,0,1);return w*w;};
function fishBody(p:Part,phone:boolean){
 const rings:[number,number][]=phone?[[-.5,0],[-.3,.8],[-.05,1],[.18,.66],[.32,.22]]:[[-.5,0],[-.42,.52],[-.28,.86],[-.1,1],[.08,.88],[.22,.55],[.32,.22]];
 const m=phone?4:6,ring=(i:number,j:number)=>{const [z,s]=rings[i],a=j/m*Math.PI*2+(phone?Math.PI/4:0);return [Math.cos(a)*.1*s,Math.sin(a)*.2*s-(s===0?.01:0),z];};
 const W=[1,1,1];
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<m;j++){const a=ring(i,j),b=ring(i,(j+1)%m),c=ring(i+1,j),d=ring(i+1,(j+1)%m);tri(p,a,b,c,W,0,tailBend);tri(p,b,d,c,W,0,tailBend);}
 // Close the tail end of the body.
 {const last=rings.length-1,end=[0,0,rings[last][0]+.02];for(let j=0;j<m;j++)tri(p,ring(last,j),ring(last,(j+1)%m),end,W,0,tailBend);}
 const F=[.82,.82,.82];
 // Forked tail, a dorsal fin and (desktop) a little belly fin.
 tri2(p,[0,.02,.3],[0,.2,.56],[0,.03,.44],F,0,tailBend);tri2(p,[0,-.02,.3],[0,-.03,.44],[0,-.2,.56],F,0,tailBend);
 tri2(p,[0,.03,.3],[0,.03,.44],[0,-.03,.44],F,0,tailBend);tri2(p,[0,.03,.3],[0,-.03,.44],[0,-.03,.3],F,0,tailBend);
 tri2(p,[0,.17,-.16],[0,.28,-.02],[0,.15,.12],F,0,tailBend);
 if(!phone)tri2(p,[0,-.16,-.05],[0,-.24,.06],[0,-.12,.12],F,0,tailBend);
}
const hex=(h:string)=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
function crabBody(p:Part){
 const shell=hex('#e5552c'),top=hex('#ff8a4a'),leg=hex('#c9472a');
 fromGeometry(p,new T.IcosahedronGeometry(.13,0).scale(1.25,.5,.9).translate(0,.07,0),y=>y>.08?top:shell,1,()=>0);
 for(const s of [-1,1]){
  for(let i=0;i<4;i++){const z=-.06+i*.05,b=[s*.12,.05,z],k=[s*.24,.1,z*1.25+.01],f=[s*.29,0,z*1.4+.02];
   tri2(p,b,k,[b[0],b[1],b[2]+.025],leg,1,()=>1);tri2(p,k,f,[k[0],k[1],k[2]+.025],leg,1,()=>1);}
  fromGeometry(p,new T.IcosahedronGeometry(.05,0).scale(1,.7,1.3).translate(s*.11,.07,-.19),()=>top,1,()=>.4);
  fromGeometry(p,new T.IcosahedronGeometry(.022,0).translate(s*.05,.13,-.1),()=>[.95,.95,.9],1,()=>0);
 }
}
function rayBody(p:Part){
 const top=hex('#4f6475'),edge=hex('#6f8798'),belly=hex('#d9e2e6');
 const nose=[0,0,-.42],l=[-.58,-.01,.02],r=[.58,-.01,.02],tail=[0,0,.32],hump=[0,.07,-.06],under=[0,-.04,-.04];
 const wing=(v:number[])=>Math.pow(Math.abs(v[0])/.58,1.5);
 tri(p,nose,l,hump,edge,2,wing);tri(p,l,tail,hump,top,2,wing);tri(p,tail,r,hump,top,2,wing);tri(p,r,nose,hump,edge,2,wing);
 tri(p,nose,under,l,belly,2,wing);tri(p,l,under,tail,belly,2,wing);tri(p,tail,under,r,belly,2,wing);tri(p,r,under,nose,belly,2,wing);
 tri2(p,[-.015,0,.3],[.015,0,.3],[0,.005,1.05],top,2,()=>0);
}
function turtleBody(p:Part){
 const shell=hex('#5d7a34'),shellTop=hex('#8a9a4a'),skin=hex('#a3b46a');
 fromGeometry(p,new T.SphereGeometry(.3,7,3,0,Math.PI*2,0,Math.PI/2).scale(1,.45,1.25).translate(0,.02,0),y=>y>.09?shellTop:shell,3,()=>0);
 fromGeometry(p,new T.IcosahedronGeometry(.085,0).scale(1,.8,1.2).translate(0,.04,-.45),()=>skin,3,()=>0);
 for(const s of [-1,1]){
  const flip=(v:number[])=>Math.min(1,Math.abs(v[0])/.5);
  tri(p,[s*.2,.04,-.25],[s*.62,0,-.12],[s*.26,.03,-.08],skin,3,flip);tri(p,[s*.2,.04,-.25],[s*.26,.03,-.08],[s*.62,0,-.12],skin,3,flip);
  tri(p,[s*.2,.02,.25],[s*.36,0,.42],[s*.14,.02,.33],skin,3,flip);tri(p,[s*.2,.02,.25],[s*.14,.02,.33],[s*.36,0,.42],skin,3,flip);
 }
}
function shadowQuad(p:Part){const a=[-.3,0,-.52],b=[.3,0,-.52],c=[-.3,0,.52],d=[.3,0,.52];tri(p,a,c,b,[0,0,0],9,()=>0);tri(p,b,c,d,[0,0,0],9,()=>0);}
function creatureGeometry(phone:boolean){
 const p=part();shadowQuad(p);fishBody(p,phone);crabBody(p);rayBody(p);turtleBody(p);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p.pos,3));g.setAttribute('color',new T.Float32BufferAttribute(p.col,3));
 g.setAttribute('aKind',new T.Float32BufferAttribute(p.kind,1));g.setAttribute('aBend',new T.Float32BufferAttribute(p.bend,1));g.computeVertexNormals();
 return g;
}
type Fish={x:number;z:number;vx:number;vz:number;heading:number;phase:number;scale:number;swim:number;alpha:number;school:number;slot:{x:number;z:number};panic:number;shape:[number,number,number]};
type Leader={x:number;z:number;vx:number;vz:number;tx:number;tz:number;speed:number;panic:number};
type Crab={x:number;z:number;heading:number;side:number;walk:number;wait:number;phase:number};
type Glider={kind:number;on:boolean;wait:number;x:number;z:number;vx:number;vz:number;phase:number;len:number;y:number;t:number;life:number};

export function createFishSchools(scene:T.Scene,phone=false){
 const SCHOOLS=3,PER=phone?5:7,CRUISERS=phone?3:4,CRABS=2,GLIDERS=1,FISH=SCHOOLS*PER+CRUISERS,COUNT=FISH+CRABS+GLIDERS;
 const geometry=creatureGeometry(phone);
 const motion=new T.InstancedBufferAttribute(new Float32Array(COUNT*4),4);motion.setUsage(T.DynamicDrawUsage);geometry.setAttribute('iMotion',motion);
 const colA=new T.InstancedBufferAttribute(new Float32Array(COUNT*3),3),colB=new T.InstancedBufferAttribute(new Float32Array(COUNT*4),4);geometry.setAttribute('iColA',colA);geometry.setAttribute('iColB',colB);
 const material=new T.MeshLambertMaterial({vertexColors:true,flatShading:true,transparent:true});
 const uShadow={value:1};
 material.onBeforeCompile=sh=>patchUnderwater(sh,{uniforms:{uShadow},
  vertexHead:'attribute vec4 iMotion;attribute vec3 iColA;attribute vec4 iColB;attribute float aKind,aBend;varying vec3 vLocal,vColA;varying vec4 vColB;varying float vShadow,vAlpha;',
  vertexBody:/* glsl */`vLocal=position;vShadow=step(8.5,aKind);vColA=iColA;vColB=iColB;vAlpha=iMotion.y;
   if(aKind<8.5&&abs(aKind-iMotion.z)>.5)transformed=vec3(0.);
   else if(vShadow>.5)transformed.y-=iMotion.w;
   else{float ph=iMotion.x;
    if(aKind<.5)transformed.x+=sin(ph-position.z*6.)*.09*aBend;
    else if(aKind<1.5){float s=sin(ph+position.z*40.);transformed.y+=aBend*.03*max(0.,s);transformed.z+=aBend*.025*cos(ph+position.z*40.);}
    else if(aKind<2.5)transformed.y+=sin(ph-position.z*2.5)*.17*aBend;
    else{transformed.y+=sin(ph+position.z*4.)*.08*aBend;transformed.z+=cos(ph+position.z*4.)*.07*aBend;}}`,
  fragmentHead:'uniform float uShadow;varying vec3 vLocal,vColA;varying vec4 vColB;varying float vShadow,vAlpha;',
  colorBody:/* glsl */`
   if(vShadow>.5){diffuseColor=vec4(0.,0.,0.,(1.-smoothstep(.2,1.,length(vec2(vLocal.x/.3,vLocal.z/.52))))*.34*vAlpha*uShadow);}
   else{vec3 base=vec3(1.);float pat=vColB.a;
    if(pat>-.5){float belly=smoothstep(.02,-.1,vLocal.y);vec3 b=vColB.rgb;
     if(pat<.5)base=mix(vColA,b,belly);
     else if(pat<1.5)base=mix(mix(vColA,vColA*1.1+.06,belly),b,step(.58,fract((vLocal.z+.5)*4.2))*(1.-belly*.7)*step(vLocal.z,.3));
     else if(pat<2.5)base=mix(vColA,b,smoothstep(.27,.31,vLocal.z));
     else if(pat<3.5){float z=vLocal.z,band=max(step(abs(z+.2),.045),step(abs(z-.1),.04)),edge=max(step(abs(z+.2),.065),step(abs(z-.1),.06));base=mix(vColA,vec3(.03),edge);base=mix(base,b,band);}
     else if(pat<4.5)base=mix(vColA,b,smoothstep(-.35,.3,vLocal.z));
     else if(pat<5.5){float wav=step(.5,fract(vLocal.z*9.+sin(vLocal.y*30.)*.25))*smoothstep(-.02,.08,vLocal.y);base=mix(mix(vColA,b,belly),vColA*.35,wav);}
     else base=mix(vColA,b,step(.8,sin(vLocal.x*38.)*sin(vLocal.z*38.)));
     // Eyes: white with a dark pupil (fish only).
     if(pat<5.5){float e=length(vec2(vLocal.z+.36,vLocal.y-.04));base=mix(base,vec3(.95),step(e,.034));base=mix(base,vec3(.02),step(e,.019));}}
    diffuseColor.rgb*=base;diffuseColor.a*=vAlpha;}`,
  // Reef fish keep their colours in the shallows (Oct 13 2026, "colourful tropical fish"); since Oct 14 2026 ("more depth") they take
  // the theme's share of the water (0.4 shore, 0.8 the deep boats: the bait ball and the big silhouettes fade into the blue), so a
  // school down between the coral is bluer and fainter than one near the surface.
  absorb:'uUwFish',
 });
 material.customProgramCacheKey=()=>'fishing-sea-life-v3'+(phone?'p':'');
 const mesh=new T.InstancedMesh(geometry,material,COUNT);mesh.name='fishing-ambient-fish';mesh.renderOrder=.6;mesh.frustumCulled=false;mesh.visible=false;mesh.raycast=()=>{};scene.add(mesh);
 const fish:Fish[]=[],leaders:Leader[]=[],crabs:Crab[]=[],glider:Glider={kind:KIND.ray,on:false,wait:3,x:0,z:0,vx:0,vz:0,phase:0,len:1,y:0,t:0,life:1},dummy=new T.Object3D();
 // viewDepth (Oct 13 2026, farther casts): how far out schools and cruisers roam, in metres (default 11, the old fixed
 // reach); the caller passes the spot's real cast distance plus a margin, so the schools still turn around the float.
 let water:(x:number,z:number)=>number=()=>10,cx=0,cz=0,ux=0,uz=1,wide=5,steer=0,fade=0,target=0,theme:ReefTheme=reefTheme({id:''}),viewDepth=11;
 // Deep mode (the deep-sea boats): the bait ball's centre, where it heads (a hotspot or a wander point), and the big silhouettes.
 let deep=false,ballX=0,ballZ=0,ballTX=0,ballTZ=0,ballSpin=0,ballPanic=0,bait:{x:number;z:number}|null=null;
 type Big={on:boolean;wait:number;x:number;z:number;vx:number;vz:number;t:number;life:number;y:number;len:number;phase:number};
 const bigs:Big[]=[0,1].map(i=>({on:false,wait:1.5+i*5,x:0,z:0,vx:0,vz:0,t:0,life:1,y:5,len:2,phase:0}));
 // Anemones in view (underwater.ts `homes`): one or two cruisers become a clownfish pair living in the first one.
 let homes:{x:number;y:number;z:number}[]=[];const homeOf=new Map<number,{x:number;y:number;z:number}>();
 const inView=(x:number,z:number)=>{const a=(x-cx)*ux+(z-cz)*uz,b=(x-cx)*uz-(z-cz)*ux;return a>0&&a<viewDepth&&Math.abs(b)<wide*(.5+a/viewDepth*.5);};
 const inWater=(x:number,z:number,min=2.5,max=viewDepth*1.55)=>{const d=water(x,z);return d>min&&d<max&&inView(x,z);};
 const pick=(min=3,max=viewDepth*1.55)=>{for(let i=0;i<60;i++){const a=2+Math.random()*(viewDepth-2.5),b=(Math.random()*2-1)*wide*(.5+a/viewDepth*.5),x=cx+ux*a+uz*b,z=cz+uz*a-ux*b;if(inWater(x,z,min,max))return {x,z};}return {x:cx+ux*6,z:cz+uz*6};};
 const setColors=(i:number,look:Look|null,pattern=look?.pattern??-1)=>{const a=look?new T.Color(look.a):new T.Color(1,1,1),b=look?new T.Color(look.b):new T.Color(1,1,1);
  colA.setXYZ(i,a.r,a.g,a.b);colB.setXYZW(i,b.r,b.g,b.b,pattern);};
 function place(){
  fish.length=0;leaders.length=0;crabs.length=0;homeOf.clear();const cast=theme.fish;
  if(deep){// One bait ball (every school fish), two big silhouettes (the first two cruisers), the rest unused.
   const look=LOOKS[theme.deep!.bait]??LOOKS.baitfish,c=pick(5,1e9);ballX=ballTX=c.x;ballZ=ballTZ=c.z;ballSpin=0;ballPanic=0;
   for(let i=0;i<SCHOOLS*PER;i++){setColors(fish.length,look);
    // slot: orbit radius (m), height in the ball (m, + up), orbit phase; swim = angular speed (rad/s).
    const u=(i+.5)/(SCHOOLS*PER),h=(u*2-1)*.85,rr=Math.sqrt(1-h*h)*(.8+Math.random()*.5);
    fish.push({x:c.x,z:c.z,vx:0,vz:0,heading:0,phase:Math.random()*6.28,scale:T.MathUtils.lerp(look.size[0],look.size[1],Math.random()),swim:.8+Math.random()*.5,alpha:1,school:0,slot:{x:rr,z:h},panic:Math.random()*6.28,shape:look.shape});}
   for(let i=0;i<CRUISERS;i++){const look2=LOOKS[theme.deep!.big[i%2]]??LOOKS.tuna;setColors(fish.length,look2);fish.push({x:0,z:0,vx:0,vz:0,heading:0,phase:Math.random()*6.28,scale:T.MathUtils.lerp(look2.size[0],look2.size[1],Math.random()),swim:5,alpha:0,school:-1,slot:{x:0,z:0},panic:0,shape:look2.shape});}
   for(let i=0;i<CRABS;i++)setColors(FISH+i,null);
   bigs.forEach((b,i)=>{b.on=false;b.wait=1.5+i*6+Math.random()*3;});
   setColors(FISH+CRABS,null,6);glider.on=false;glider.wait=4+Math.random()*5;return;}
  // Depth layers (Oct 14 2026): one school near the surface, one mid-water, one down among the coral (each clamped to the
  // seabed below it in frame()), so fish pass over and behind the reef.
  for(let s=0;s<SCHOOLS;s++){const p=pick(3.5),t=pick(3.5),look=LOOKS[cast.schools[s]]??LOOKS.sardine,swim=[.35,.9,1.7][s]+Math.random()*.4;leaders.push({x:p.x,z:p.z,vx:0,vz:0,tx:t.x,tz:t.z,speed:.8+Math.random()*.5,panic:0});
   for(let i=0;i<PER;i++){const row=Math.floor(i/2),side=i%2?1:-1,slot={x:side*(.35+row*.18)+(Math.random()-.5)*.2,z:row*.55+(Math.random()-.5)*.2};
    setColors(fish.length,look);
    fish.push({x:p.x+slot.x,z:p.z+slot.z,vx:0,vz:0,heading:Math.random()*6.28,phase:Math.random()*6.28,scale:T.MathUtils.lerp(look.size[0],look.size[1],Math.random()),swim:swim+(Math.random()-.5)*.15,alpha:1,school:s,slot,panic:0,shape:look.shape});}}
  for(let i=0;i<CRUISERS;i++){const home=homes.length&&i<(phone?1:2)?homes[0]:null,p=home?{x:home.x+(Math.random()-.5)*.5,z:home.z+(Math.random()-.5)*.5}:pick(5);
   const look=LOOKS[home?'clown':cast.cruisers[i%cast.cruisers.length]]??LOOKS.sardine;setColors(fish.length,look);
   // A clownfish hovers just over its anemone's tentacles (swim depth from the surface).
   const swim=home?Math.max(.18,UW_SURFACE-home.y-.12):.5+Math.random()*1.4;if(home)homeOf.set(SCHOOLS+i,home);
   fish.push({x:p.x,z:p.z,vx:0,vz:0,heading:Math.random()*6.28,phase:Math.random()*6.28,scale:T.MathUtils.lerp(look.size[0],look.size[1],Math.random()),swim,alpha:1,school:-1,slot:{x:0,z:0},panic:0,shape:look.shape});
   leaders.push({x:p.x,z:p.z,vx:0,vz:0,...(()=>{const t=home?p:pick(5);return {tx:t.x,tz:t.z};})(),speed:home?.22:.45+Math.random()*.2,panic:0});}
  // Crabs on the sand just under the waterline, in view.
  for(let i=0;i<CRABS;i++){let p={x:cx+ux*2,z:cz+uz*2};for(let k=0;k<80;k++){const a=.5+Math.random()*7,b=(Math.random()*2-1)*wide*.8,x=cx+ux*a+uz*b,z=cz+uz*a-ux*b,d=water(x,z);if(d>.5&&d<2.4){p={x,z};break;}}
   setColors(FISH+i,null);crabs.push({x:p.x,z:p.z,heading:Math.random()*6.28,side:Math.random()<.5?-1:1,walk:0,wait:.5+Math.random()*2,phase:Math.random()*6});}
  setColors(FISH+CRABS,null,6);glider.on=false;glider.wait=2+Math.random()*4;
 }
 function steerAll(){
  // Leaders wander between targets in water; members hold their slot behind the leader (so a school turns together).
  for(let li=0;li<leaders.length;li++){const l=leaders[li],home=homeOf.get(li);let dx=l.tx-l.x,dz=l.tz-l.z,dist=Math.hypot(dx,dz);
   // A clownfish's leader potters round its anemone (within ~0.45 m) instead of roaming the view.
   if(home){if(dist<.15||Math.hypot(l.tx-home.x,l.tz-home.z)>.5){const a=Math.random()*6.28,rr=.1+Math.random()*.35;l.tx=home.x+Math.cos(a)*rr;l.tz=home.z+Math.sin(a)*rr;dx=l.tx-l.x;dz=l.tz-l.z;dist=Math.hypot(dx,dz)||1;}}
   else if(dist<1.2||!inWater(l.x+l.vx,l.z+l.vz,2)){const t=pick(3.5);l.tx=t.x;l.tz=t.z;dx=l.tx-l.x;dz=l.tz-l.z;dist=Math.hypot(dx,dz)||1;}
   const sp=l.speed*(1+l.panic*2.2),k=.25+l.panic*.5;l.vx+=(dx/dist*sp-l.vx)*k;l.vz+=(dz/dist*sp-l.vz)*k;l.panic=Math.max(0,l.panic-STEER_DT/1.4);}
  for(let i=0;i<fish.length;i++){const f=fish[i];const l=f.school>=0?leaders[f.school]:leaders[SCHOOLS+i-SCHOOLS*PER];
   let ax=0,az=0;
   if(f.school>=0&&f.panic<.3){// Slot: slot.z metres behind the leader, slot.x to its right.
    const h=Math.atan2(l.vx,l.vz)||0,c=Math.cos(h),s=Math.sin(h),tx=l.x+(f.slot.x*c)-(f.slot.z*s),tz=l.z-(f.slot.x*s)-(f.slot.z*c);ax+=(tx-f.x)*1.6+(l.vx-f.vx)*.8;az+=(tz-f.z)*1.6+(l.vz-f.vz)*.8;}
   else if(f.school<0){ax+=(l.x-f.x)*1.2+(l.vx-f.vx);az+=(l.z-f.z)*1.2+(l.vz-f.vz);}
   for(let j=0;j<fish.length;j++){if(j===i)continue;const o=fish[j],dx=f.x-o.x,dz=f.z-o.z,d2=dx*dx+dz*dz;if(d2<.16&&d2>1e-6){const d=Math.sqrt(d2);ax+=dx/d*(.4-d)*6;az+=dz/d*(.4-d)*6;}}
   // Stay in the water: push out to sea along the field's gradient.
   const d=water(f.x,f.z);if(d<2.2){const gx=water(f.x+.5,f.z)-water(f.x-.5,f.z),gz=water(f.x,f.z+.5)-water(f.x,f.z-.5),g=Math.hypot(gx,gz)||1;ax+=gx/g*(2.2-d)*4;az+=gz/g*(2.2-d)*4;}
   f.vx+=ax*STEER_DT;f.vz+=az*STEER_DT;const max=(f.school>=0?1.9:.9)*(1+f.panic*2),sp=Math.hypot(f.vx,f.vz);if(sp>max){f.vx*=max/sp;f.vz*=max/sp;}
   f.panic=Math.max(0,f.panic-STEER_DT/1.2);}
  for(let i=0;i<SCHOOLS;i++){const l=leaders[i];l.x+=l.vx*STEER_DT;l.z+=l.vz*STEER_DT;}
  for(let i=0;i<CRUISERS;i++){const l=leaders[SCHOOLS+i];l.x+=l.vx*STEER_DT;l.z+=l.vz*STEER_DT;}
  // Crabs: wait, then scuttle sideways for a moment; turn back before leaving the shallow sand.
  for(const c of crabs){if(c.walk>0){c.walk-=STEER_DT;if(c.walk<=0)c.wait=1+Math.random()*3;}else{c.wait-=STEER_DT;if(c.wait<=0){c.walk=.6+Math.random()*1.1;if(Math.random()<.35)c.heading+=(Math.random()-.5)*1.4;if(Math.random()<.4)c.side*=-1;}}
   const sx=Math.cos(c.heading)*c.side,sz=-Math.sin(c.heading)*c.side,d=water(c.x+sx*.4,c.z+sz*.4);if(c.walk>0&&(d<.35||d>2.8))c.side*=-1;}
 }
 const startGlider=()=>{
  // Across the view, further out, from one side to the other (and back next time). Scales with viewDepth like the rest
  // of the scatter, so a ray or turtle can still cross comfortably beyond a far-cast float.
  for(let k=0;k<20;k++){const a=(6+Math.random()*6)*(viewDepth/11),side=Math.random()<.5?-1:1,b0=-side*wide*1.7,b1=side*wide*1.7,x0=cx+ux*a+uz*b0,z0=cz+uz*a-ux*b0,x1=cx+ux*a+uz*b1,z1=cz+uz*a-ux*b1;
   if(water(x0,z0)<4||water(x1,z1)<4||water((x0+x1)/2,(z0+z1)/2)<4)continue;
   const g=theme.fish.glider;glider.kind=g==='turtle'?KIND.turtle:g==='both'?(Math.random()<.5?KIND.turtle:KIND.ray):KIND.ray;const len=Math.hypot(x1-x0,z1-z0),sp=glider.kind===KIND.turtle?.55:.85;
   glider.on=true;glider.x=x0;glider.z=z0;glider.vx=(x1-x0)/len*sp;glider.vz=(z1-z0)/len*sp;glider.t=0;glider.life=len/sp;glider.len=glider.kind===KIND.turtle?1.25:1.5;
   glider.y=glider.kind===KIND.ray?.3:.75;
   // Eagle-ray spots (pattern 6, brightened past white); the turtle keeps its own colours.
   colA.setXYZ(FISH+CRABS,1,1,1);colB.setXYZW(FISH+CRABS,2.4,2.4,2.4,glider.kind===KIND.ray?6:-1);colA.needsUpdate=true;colB.needsUpdate=true;return;}
  glider.wait=4;
 };
 /** Deep mode, per rendered frame (only while fishing at a boat): the bait ball, the big silhouettes and the deep glider. */
 function frameDeep(step:number){
  const fe=fade*fade*(3-2*fade);
  // Ball centre: toward the bait hotspot, else a slow wander between points in view, kept clear of the hull.
  if(bait){ballTX=bait.x;ballTZ=bait.z;}else if(Math.hypot(ballTX-ballX,ballTZ-ballZ)<.8){const t=pick(5,1e9);ballTX=t.x;ballTZ=t.z;}
  {const dx=ballTX-ballX,dz=ballTZ-ballZ,d=Math.hypot(dx,dz),sp=Math.min(d,.45*step);if(d>1e-4){ballX+=dx/d*sp;ballZ+=dz/d*sp;}}
  ballPanic=Math.max(0,ballPanic-step/1.6);ballSpin+=step;
  const ballY=UW_SURFACE-(1.5+3*(1-fe))-ballPanic*.6,spread=1+ballPanic*1.4;
  for(let i=0;i<SCHOOLS*PER;i++){const f=fish[i],w=f.swim*(1+ballPanic*1.5),a=f.phase+ballSpin*w,r=f.slot.x*spread;
   const x=ballX+Math.cos(a)*r,z=ballZ+Math.sin(a)*r,y=ballY+f.slot.z*spread+Math.sin(ballSpin*1.3+f.panic)*.08;
   // Swims along the orbit (tangent), tail beating.
   f.heading=Math.atan2(-Math.sin(a),Math.cos(a));f.x=x;f.z=z;
   write(i,x,y,z,f.heading,f.scale*f.shape[0],f.scale*f.shape[1],f.scale*f.shape[2],ballSpin*9+i,f.alpha*fe,KIND.fish,0);}
  // Big silhouettes: cross the view far below, from outside one side to outside the other, fading at both ends.
  for(let k=0;k<CRUISERS;k++){const i=SCHOOLS*PER+k,f=fish[i];
   if(k>=bigs.length){write(i,0,-50,0,0,0,0,0,0,0,KIND.fish,0);continue;}
   const b=bigs[k];
   if(!b.on){b.wait-=step;if(b.wait<=0){const a=(6+Math.random()*7)*(viewDepth/11),side=Math.random()<.5?-1:1,b0=-side*wide*2,b1=side*wide*2,len=Math.hypot(b1-b0,0),sp=.7+Math.random()*.4;
     b.on=true;b.t=0;b.x=cx+ux*a+uz*b0;b.z=cz+uz*a-ux*b0;b.vx=uz*side*sp;b.vz=-ux*side*sp;b.life=len/sp;b.y=4.2+Math.random()*2;b.len=f.scale;}}
   if(b.on){b.t+=step;b.x+=b.vx*step;b.z+=b.vz*step;b.phase+=step*3;if(b.t>=b.life){b.on=false;b.wait=6+Math.random()*10;}}
   const k2=b.on?Math.max(0,Math.min(1,b.t/3,(b.life-b.t)/3)):0;
   if(k2>0)write(i,b.x,UW_SURFACE-b.y,b.z,Math.atan2(b.vx,b.vz),f.scale*f.shape[0],f.scale*f.shape[1],f.scale*f.shape[2],b.phase,fe*k2*.6,KIND.fish,0);
   else write(i,0,-50,0,0,0,0,0,0,0,KIND.fish,0);}
  for(let i=0;i<CRABS;i++)write(FISH+i,0,-50,0,0,0,0,0,0,0,KIND.crab,0);
  // The glider: a manta (or turtle) gliding across far down.
  const gi=FISH+CRABS;
  if(!glider.on){glider.wait-=step;if(glider.wait<=0){startGlider();if(glider.on){glider.len*=2.2;glider.y=5.5+Math.random()*1.5;}}}
  if(glider.on){glider.t+=step;glider.x+=glider.vx*step;glider.z+=glider.vz*step;glider.phase+=step*(glider.kind===KIND.ray?1.6:2);if(glider.t>=glider.life){glider.on=false;glider.wait=10+Math.random()*12;}}
  if(glider.on){const k=Math.max(0,Math.min(1,glider.t/3,(glider.life-glider.t)/3));write(gi,glider.x,UW_SURFACE-glider.y,glider.z,Math.atan2(glider.vx,glider.vz),glider.len,glider.len,glider.len,glider.phase,fade*k*.85,glider.kind,0,glider.kind===KIND.ray?Math.sin(glider.phase)*.05:0);}
  else write(gi,0,-50,0,0,0,0,0,0,0,KIND.ray,0);
  mesh.instanceMatrix.needsUpdate=true;motion.needsUpdate=true;
 }
 const arr=motion.array as Float32Array;
 const write=(i:number,x:number,y:number,z:number,heading:number,sx:number,sy:number,sz:number,phase:number,alpha:number,kind:number,dropLocal:number,pitch=0)=>{
  dummy.position.set(x,y,z);dummy.rotation.set(pitch,heading+Math.PI,0,'YXZ');dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  arr[i*4]=phase;arr[i*4+1]=alpha;arr[i*4+2]=kind;arr[i*4+3]=dropLocal;
 };
 return {mesh,
  /** Start in the water in front of the angler at `stand`, casting along unit `dir`; `distance` is the shore field (m, + at sea);
   *  `wide` is the half-width of the visible water (smaller on portrait phones); `spotTheme` picks the species (underwater.ts REEF_THEMES),
   *  `homesIn` are the anemones a clownfish pair lives in.
   *  `viewDepthIn` (Oct 13 2026, farther casts): how far out schools and cruisers roam (the spot's real cast distance
   *  plus a margin), so they still turn around a float cast much farther than the old fixed 11 m. */
  begin(stand:{x:number;z:number},dir:{x:number;z:number},distance:((x:number,z:number)=>number)|null,_surfaceY:number,halfWidth=5,spotTheme:ReefTheme=reefTheme({id:''}),homesIn:{x:number;y:number;z:number}[]=[],viewDepthIn=11){
   water=distance??(()=>10);cx=stand.x;cz=stand.z;ux=dir.x;uz=dir.z;wide=halfWidth;theme=spotTheme;homes=homesIn;viewDepth=viewDepthIn;
   deep=!!spotTheme.deep;uShadow.value=deep?0:1;bait=null;
   // A new session fades in from zero (the fish rise out of the haze below, see frame()), never pops in at full strength.
   if(!mesh.visible)fade=0;
   place();colA.needsUpdate=true;colB.needsUpdate=true;target=1;steer=0;mesh.visible=true;},
  /** Deep mode: the bait ball heads for this point (the boat's bait-ball hotspot), or wanders when null. */
  setBait(p:{x:number;z:number}|null){bait=p;},
  end(){target=0;},
  get busy(){return mesh.visible;},
  /** Something hit the water at (x, z): nearby fish dart away, schools regroup after ~1 s; close crabs scuttle off. */
  scatter(x:number,z:number,strength=1){
   if(deep){if(Math.hypot(ballX-x,ballZ-z)<6*strength)ballPanic=1;return;}
   for(const f of fish){const dx=f.x-x,dz=f.z-z,d=Math.hypot(dx,dz);if(d>7*strength)continue;const k=(1-d/(7*strength))*3.2*strength;f.vx+=dx/(d||1)*k;f.vz+=dz/(d||1)*k;f.panic=1;}
   for(const l of leaders){const dx=l.x-x,dz=l.z-z,d=Math.hypot(dx,dz);if(d<8*strength){l.panic=1;const ux=dx/(d||1),uz=dz/(d||1);l.tx=l.x+ux*6;l.tz=l.z+uz*6;if(!inWater(l.tx,l.tz,3)){const t=pick(3.5);l.tx=t.x;l.tz=t.z;}}}
   for(const c of crabs)if(Math.hypot(c.x-x,c.z-z)<3*strength){c.walk=1.2;c.wait=0;}
  },
  frame(dt:number,reduced:boolean,float:{x:number;z:number}|null){
   if(!mesh.visible)return;
   fade=reduced?target:T.MathUtils.clamp(fade+Math.sign(target-fade)*Math.min(Math.abs(target-fade),dt/.9),0,1);if(fade<=0&&target===0){mesh.visible=false;return;}
   const step=reduced?0:Math.min(dt,.05);
   if(deep){frameDeep(step);return;}
   // Rise out of the haze while fading in (start of a session): never pop in at swimming depth.
   const riseIn=1-fade*fade*(3-2*fade);
   steer+=step;while(steer>=STEER_DT){steer-=STEER_DT;
    if(float)for(const f of fish){const dx=f.x-float.x,dz=f.z-float.z,d=Math.hypot(dx,dz);if(d<1.3){f.vx+=dx/(d||1)*.8;f.vz+=dz/(d||1)*.8;}}
    steerAll();}
   for(let i=0;i<fish.length;i++){const f=fish[i];f.x+=f.vx*step;f.z+=f.vz*step;const sp=Math.hypot(f.vx,f.vz);
    if(sp>.05){const h=Math.atan2(f.vx,f.vz);let dh=h-f.heading;dh=Math.atan2(Math.sin(dh),Math.cos(dh));f.heading+=dh*Math.min(1,step*6);}
    f.phase+=step*(4+sp*7);
    const d=water(f.x,f.z),depth=uwDepthAt(d),a=f.alpha*fade*T.MathUtils.smoothstep(d,1.6,2.6)*(1-T.MathUtils.smoothstep(d,14,19));
    const sy=f.scale*f.shape[1],floor=Math.max(.18,depth-.12-.2*sy),swim=Math.min(f.swim,floor)+(floor-Math.min(f.swim,floor))*riseIn,y=UW_SURFACE-swim-i*.0004;
    write(i,f.x,y,f.z,f.heading,f.scale*f.shape[0],sy,f.scale*f.shape[2],f.phase,a,KIND.fish,(y-(UW_SURFACE-depth))/sy);}
   for(let i=0;i<crabs.length;i++){const c=crabs[i];if(c.walk>0&&step>0){const sx=Math.cos(c.heading)*c.side,sz=-Math.sin(c.heading)*c.side;c.x+=sx*.45*step;c.z+=sz*.45*step;c.phase+=step*16;}
    const d=water(c.x,c.z),y=UW_SURFACE-uwDepthAt(d);write(FISH+i,c.x,y,c.z,c.heading,.85,.85,.85,c.phase,fade*T.MathUtils.smoothstep(d,.25,.55),KIND.crab,.004);}
   const gi=FISH+CRABS;
   if(theme.fish.glider){
    if(!glider.on){glider.wait-=step;if(glider.wait<=0)startGlider();}
    if(glider.on){glider.t+=step;glider.x+=glider.vx*step;glider.z+=glider.vz*step;glider.phase+=step*(glider.kind===KIND.ray?2.3:2.6);
     if(glider.t>=glider.life){glider.on=false;glider.wait=7+Math.random()*12;}}
   }
   if(glider.on){const d=water(glider.x,glider.z),depth=uwDepthAt(d),y=UW_SURFACE-Math.max(.25,depth-glider.y),k=Math.min(1,glider.t/2,(glider.life-glider.t)/2);
    write(gi,glider.x,y,glider.z,Math.atan2(glider.vx,glider.vz),glider.len,glider.len,glider.len,glider.phase,fade*Math.max(0,k)*(1-T.MathUtils.smoothstep(d,14,19)),glider.kind,(y-(UW_SURFACE-depth))/glider.len,glider.kind===KIND.ray?Math.sin(glider.phase)*.05:0);}
   else write(gi,0,-50,0,0,0,0,0,0,0,KIND.ray,0);
   mesh.instanceMatrix.needsUpdate=true;motion.needsUpdate=true;
  },
  dispose(){mesh.removeFromParent();mesh.dispose();geometry.dispose();material.dispose();},
 };
}
