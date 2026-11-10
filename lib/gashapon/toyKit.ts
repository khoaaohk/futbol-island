/**
 * The gashapon toy builder kit (round 3A, Nov 8 2026; docs/gashapon-design.md "Round 3A"). Pure three.js, no DOM, no React.
 *
 * A toy is a small function `(k:ToyKit)=>ToyBehaviour` (lib/gashapon/toyModels/<machine-id>.ts, keyed by toy id). It declares a
 * few NAMED PARTS (pivots), drops low-poly primitives into them in ONE model space (metres-ish: the toy stands on y = 0 and is
 * about 1 tall, front +z), and returns which shared reactions (lib/gashapon/toyReactions.ts) play on squeeze / poke / tap-head and
 * which synth voices (lib/gashapon/toySound.ts) speak. `finish()` merges every part's primitives into ONE vertex-coloured mesh
 * per part (two if the part has shiny pieces), so draw calls = parts (≈ 5–12 per toy), with one toon material per toy (a 3-step
 * gradient map) and an optional shiny material. Everything is built when the viewer opens and `dispose()` frees all of it.
 *
 *   k.part(name,{at,parent})       a pivot (model-space point; rotations and squashes happen around it), child of `parent`
 *   k.sphere/capsule/box/rbox/cyl/cone/torus/lathe/extrude/roundTri(...dims, {at,rot,scale,color,part,shine})
 *   k.face(part,{at,gap,size,mouth,blush,sphere,prefix})   two eyes (parts `eyeL`/`eyeR` under `eyes`, or `<prefix>eyes`…), a mouth, cheeks
 *   k.c.body / k.c.accent / k.c.ink / k.c.white / k.shade(hex,amount)
 * Positions are MODEL space everywhere (the kit converts to part-local), so an author never does pivot arithmetic.
 */
import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {GashaponToy} from './toys';

export type V3=readonly [number,number,number];
/**
 * HD surface finishes (round 3B, Nov 9 2026; only toys built with `{hd:true}`, see toyModels/index.ts HD_MACHINES). Each finish
 * is one MeshPhysicalMaterial per toy (vertex colours), so draws = parts × finishes used:
 *  vinyl  glossy painted soft vinyl (clearcoat)      matte  unpainted PVC         soft   bun / rice / fabric (sheen, no gloss)
 *  nori   seaweed (dark, low sheen)                  ink    glossy painted eyes   jelly  translucent jelly (transmission-lite:
 *  clear  capsule plastic (see-through, no depth)    gold   polished metal-look          transparent + clearcoat, no extra pass)
 *  glitter metal flecks (a tiny noise normal map)    pearl  iridescent rare finish
 */
export type Finish='vinyl'|'matte'|'soft'|'nori'|'ink'|'jelly'|'clear'|'gold'|'glitter'|'pearl';
export type PieceOpts={at?:V3;rot?:V3;scale?:number|V3;color?:string;part?:string;shine?:boolean;
 /** HD toys: the surface finish (default 'vinyl'; `shine` means 'gold' there). Ignored by round 3A toys. */
 mat?:Finish};
/** A reaction reference: `name` (its default target) or `name:partA+partB` (lib/gashapon/toyReactions.ts REACTIONS). */
export type ReactionRef=string;
/** A voice reference: `preset` or `preset:pitch` (lib/gashapon/toySound.ts VOICES), e.g. 'bell:1.5'. */
export type VoiceRef=string;
export type OneOrMany<X>=X|readonly X[];
export type ToyBehaviour={
 /** Plays when a press-and-hold is let go (the hold itself always squashes the toy and squeaks). */
 squeeze:OneOrMany<ReactionRef>;
 /** A tap on the head region. */
 tap:OneOrMany<ReactionRef>;
 /** A tap anywhere else: one reaction set, or per part name (falls back to the part's parents, then `default`). */
 poke:OneOrMany<ReactionRef>|Readonly<Record<string,OneOrMany<ReactionRef>>>;
 /** The head region: a part name (it and its children), or every hit above a model-space height. Default 'head'. */
 head?:string|{above:number};
 voice:{squeeze:readonly VoiceRef[];poke:readonly VoiceRef[];tap:readonly VoiceRef[]};
};
export type ToyBuilder=(k:ToyKit)=>ToyBehaviour&ToyKindBehaviour;

/** A take-apart piece: a part that lifts off. `after`: pieces that must be off first (they sit over this one). */
export type PuzzlePiece={part:string;name:string;after?:readonly string[]};
/** The main kind's own data (lib/gashapon/toyInteract.ts plays it; lib/gashapon/toyKinds.ts names the kinds). */
export type KindSpec=
 |{kind:'squish'|'jelly'}
 |{kind:'puzzle';pieces:readonly PuzzlePiece[]}
 |{kind:'windup';key:string;legs?:readonly string[];arms?:readonly string[];gait?:'walk'|'hop'}
 |{kind:'spintop'}
 |{kind:'bobble';head:string}
 |{kind:'capsule';top:string;bottom:string;inner:string}
 /** Working parts: the parts declared with k.hinge / k.slider / k.lever / k.crank / k.wheels (round 3C). */
 |{kind:'mechanism'}
 /** A keychain mascot: k.chain({mode:'hang'}) hangs the toy on a verlet ball chain; `chain` alone (round 3B) swings one part. */
 |{kind:'charm';chain?:string}
 /** A poseable figure: the poses declared with k.pose (round 3C). */
 |{kind:'figure'};
/* ---- Round 3C working parts, charms and poses (Nov 9 2026; docs/gashapon-design.md "Round 3C"). Axes are PART-LOCAL (= model
 * space when the part's parents are not rotated). Any kind may declare them (a bonus mechanism, a dangling bonus charm). */
export type Axis='x'|'y'|'z'|V3;
/** Another part that follows a working part: it turns `ratio` × the part's angle (or slides `ratio` × its travel) about / along `axis`. */
export type MechDrive={part:string;ratio:number;axis?:Axis;slide?:V3};
/** A pop-up a working part triggers past `at` (0..1 of its range): it rises by `lift`, grows by `scale` (a net bulge), or grows in from nothing (`hidden`), holds `hold` s, then sinks back. */
export type MechFire={part:string;at?:number;lift?:V3;scale?:number;hidden?:boolean;hold?:number};
export type MechType='hinge'|'slider'|'lever'|'crank'|'wheels';
export type MechSpec={type:MechType;part:string;axis:Axis;min:number;max:number;detents:readonly number[];
 /** hinge: let go within this of `min` and it snaps shut with a clack (rad). */
 shut:number;
 /** let go: 'return' springs to `min` (lever, plunger), 'stay' keeps the angle (friction + detents), 'coast' (crank, wheels) rolls on. */
 release:'return'|'stay'|'coast';
 label:string;hint:string;drives:readonly MechDrive[];fires:MechFire|null;
 /** wheels: the wheel parts, their radius and the model-space direction the toy rolls. */
 wheels?:readonly string[];radius?:number;dir?:V3};
/** A ball chain: 'hang' (the whole toy hangs from it; main charm kind) or 'dangle' (a short chain + `tag` part hanging off `from`). */
export type ChainSpec={mode:'hang'|'dangle';links:number;length:number;bead:'ball'|'ring';color:string;
 /** hang: the model point on the toy the chain holds (default its top). dangle: where on `from` the chain starts. */
 attach:V3;from:string;tag:string|null};
export type PoseSpec={name:string;label:string;parts:Readonly<Record<string,{rot?:V3;at?:V3}>>;voice:string|null;
 /** Parts that, dragged or tapped, move the figure into this pose. */
 grab:readonly string[]};
export type ToyExtras={mechs:MechSpec[];chains:ChainSpec[];poses:PoseSpec[]};
export type MechOpts={axis?:Axis;min?:number;max?:number;detents?:readonly number[];release?:MechSpec['release'];label?:string;hint?:string;drives?:readonly MechDrive[];fires?:MechFire};
/** Soft-body settings: `soft` 0..1 (how deep a squeeze goes), `slow` slow-rising foam (it holds the dent, then rises over ~2 s, no wobble), `crackle` a crust that crackles on poke. */
export type SoftSpec={soft?:number;slow?:boolean;crackle?:boolean;jelly?:boolean};
/** A springy part (bobble head, top knot, dangling charm): it swings on its pivot when the toy is bumped, spun or walks. */
export type SpringSpec={part:string;k?:number;c?:number;amp?:number};
export type ToyKindBehaviour={kind?:KindSpec;soft?:SoftSpec;springs?:readonly SpringSpec[];
 /** The bonus spin: a flick on the toy spins it about itself (spin-top style) instead of turning the table. */
 flick?:boolean};
export type ToyModelSet=Readonly<Record<string,ToyBuilder>>;

export type ToyRig={
 toy:GashaponToy;behaviour:ToyBehaviour&ToyKindBehaviour;
 /** Built with the HD kit (physical materials, more segments, shadows). */
 hd:boolean;
 /** Model-space pivot of every part (rest pose), and invisible enlarged hit spheres for small grab targets (never drawn). */
 pivots:Map<string,V3>;proxies:T.Mesh[];
 /** The pose root (stands on y = 0); parts hang under it. */
 root:T.Group;parts:Map<string,T.Object3D>;meshes:T.Mesh[];materials:T.Material[];
 height:number;radius:number;stats:{draws:number;triangles:number};
 /** Round 3C: working parts, chains and poses declared through the kit (empty for most toys). */
 extras:ToyExtras;
 dispose():void;
};

const INK='#1d2b24',WHITE='#ffffff',BLUSH='#ff9bb0';
const v=new T.Vector3(),q=new T.Quaternion(),e=new T.Euler(),s=new T.Vector3(),m4=new T.Matrix4();
type Piece={part:string;geometry:T.BufferGeometry;color:string;shine:boolean;mat:Finish;
 /** HD: per-vertex colours already on the geometry (a blob's crust shading); kept instead of the flat colour. */
 own?:boolean};
type PartDef={name:string;at:V3;parent:string|null};

function place(g:T.BufferGeometry,o:PieceOpts){
 const sc=o.scale===undefined?[1,1,1]:typeof o.scale==='number'?[o.scale,o.scale,o.scale]:o.scale;
 m4.compose(v.set(...(o.at??[0,0,0])),q.setFromEuler(e.set(...(o.rot??[0,0,0]))),s.set(sc[0],sc[1],sc[2]));g.applyMatrix4(m4);return g;
}
function shapeOf(points:readonly (readonly [number,number])[]){const sh=new T.Shape();points.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();return sh;}
/** A rounded triangle outline (apex up), corner radius `round` of `r`. */
function roundTriShape(r:number,round:number){
 const sh=new T.Shape(),pts=[0,1,2].map(i=>{const a=Math.PI/2+i*2*Math.PI/3;return new T.Vector2(Math.cos(a)*r,Math.sin(a)*r);});
 const k=round;for(let i=0;i<3;i++){const p=pts[i],n=pts[(i+1)%3],pr=pts[(i+2)%3];
  const a=p.clone().lerp(pr,k),b=p.clone().lerp(n,k);if(i===0)sh.moveTo(a.x,a.y);else sh.lineTo(a.x,a.y);sh.quadraticCurveTo(p.x,p.y,b.x,b.y);}
 sh.closePath();return sh;
}
function roundRectShape(w:number,h:number,r:number){const sh=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);
 sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);return sh;}
function extruded(sh:T.Shape,depth:number,bevel:number,hd=false){
 const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.001,depth-2*bevel),bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:hd?6:2,curveSegments:hd?16:6});
 g.translate(0,0,-(depth-2*bevel)/2);return g;
}

/** Smooth 3D value noise and a 3-octave sum (−1 … 1), for blobs. */
function hash3(x:number,y:number,z:number){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,2147483647);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296*2-1;}
function vnoise(x:number,y:number,z:number){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const L=(a:number,b:number,t:number)=>a+(b-a)*t;
 return L(L(L(hash3(xi,yi,zi),hash3(xi+1,yi,zi),u),L(hash3(xi,yi+1,zi),hash3(xi+1,yi+1,zi),u),v),L(L(hash3(xi,yi,zi+1),hash3(xi+1,yi,zi+1),u),L(hash3(xi,yi+1,zi+1),hash3(xi+1,yi+1,zi+1),u),v),w);}
function fbm(x:number,y:number,z:number){return (vnoise(x,y,z)*.6+vnoise(x*2.1,y*2.1,z*2.1)*.28+vnoise(x*4.3,y*4.3,z*4.3)*.12)*1.3;}
/** Lighten (amount > 0) or darken (< 0) a hex colour, for shading a part without a new material. */
export function shade(hex:string,amount:number){const c=new T.Color(hex);const hsl={h:0,s:0,l:0};c.getHSL(hsl);c.setHSL(hsl.h,hsl.s,Math.min(1,Math.max(0,hsl.l+amount)));return '#'+c.getHexString();}

export function createToyKit(toy:GashaponToy,opts:{hd?:boolean}={}){
 const hd=!!opts.hd,parts=new Map<string,PartDef>([['body',{name:'body',at:[0,0,0],parent:null}]]),pieces:Piece[]=[],proxies:{part:string;r:number;at:V3}[]=[];
 const add=(g:T.BufferGeometry,o:PieceOpts)=>{const part=o.part??'body';if(!parts.has(part))parts.set(part,{name:part,at:[0,0,0],parent:null});
  pieces.push({part,geometry:place(g,o),color:o.color??toy.colors[0],shine:!!o.shine,mat:o.mat??(o.shine?'gold':'vinyl')});};
 /** Segment counts: round 3A low-poly, HD about 2.5× (smooth silhouettes under the studio lights). */
 const S=(n:number)=>hd?Math.round(n*2.6):n;
 const kit={
  toy,hd,
  c:{body:toy.colors[0],accent:toy.colors[1],ink:INK,white:WHITE,blush:BLUSH},
  shade,
  /** Declare a part: its pivot in model space and its parent part (default: hangs off the pose root). */
  part(name:string,o:{at?:V3;parent?:string}={}){parts.set(name,{name,at:o.at??[0,0,0],parent:o.parent??null});},
  sphere(r:number,o:PieceOpts&{seg?:number}={}){const w=o.seg??(hd?Math.min(48,Math.max(12,Math.round(12+r*110))):18);add(new T.SphereGeometry(r,w,Math.max(4,Math.round(w*2/3))),o);},
  capsule(r:number,len:number,o:PieceOpts={}){add(new T.CapsuleGeometry(r,len,hd?Math.min(8,Math.max(3,Math.round(3+r*40))):5,hd?Math.min(32,Math.max(10,Math.round(10+r*120))):14),o);},
  box(w:number,h:number,d:number,o:PieceOpts={}){add(new T.BoxGeometry(w,h,d),o);},
  /** A box with rounded edges (rounded-rectangle front, bevelled). */
  rbox(w:number,h:number,d:number,round:number,o:PieceOpts={}){const b=Math.min(round,d/2.2);add(extruded(roundRectShape(w-2*b,h-2*b,round),d,b,hd),o);},
  cyl(rTop:number,rBottom:number,h:number,o:PieceOpts&{seg?:number}={}){add(new T.CylinderGeometry(rTop,rBottom,h,o.seg??S(16)),o);},
  cone(r:number,h:number,o:PieceOpts&{seg?:number}={}){add(new T.ConeGeometry(r,h,o.seg??S(14)),o);},
  torus(R:number,tube:number,o:PieceOpts&{arc?:number;seg?:number}={}){const arc=o.arc??Math.PI*2;add(new T.TorusGeometry(R,tube,hd?Math.min(16,Math.max(8,Math.round(6+tube*260))):8,o.seg??(hd?Math.max(12,Math.round((20+R*110)*arc/(Math.PI*2))):20),arc),o);},
  /** A turned profile: [radius, height] points from the bottom up. */
  lathe(points:readonly (readonly [number,number])[],o:PieceOpts&{seg?:number}={}){add(new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(Math.max(0,r),y)),o.seg??S(18)),o);},
  /** HD: a smooth turned profile, Catmull-Rom through the points (`steps` per span), for buns, bellies and domes. */
  smoothLathe(points:readonly (readonly [number,number])[],o:PieceOpts&{seg?:number;steps?:number}={}){
   const c=new T.SplineCurve(points.map(([r,y])=>new T.Vector2(Math.max(0,r),y))),n=(points.length-1)*(o.steps??(hd?8:3));
   add(new T.LatheGeometry(c.getPoints(n).map(p=>new T.Vector2(Math.max(0,p.x),p.y)),o.seg??S(18)),o);},
  /** A flat outline ([x, y] points, front +z) pushed `depth` deep with a soft bevel. */
  extrude(points:readonly (readonly [number,number])[],depth:number,o:PieceOpts&{bevel?:number}={}){add(extruded(shapeOf(points),depth,o.bevel??Math.min(.03,depth/4),hd),o);},
  /** A soft triangle (apex up) of circumradius r, `depth` deep (an onigiri, a hat). */
  roundTri(r:number,depth:number,o:PieceOpts&{round?:number;bevel?:number}={}){add(extruded(roundTriShape(r,o.round??.32),depth,o.bevel??Math.min(.06,depth/3),hd),o);},
  /** HD: a round tube through model-space points (Catmull-Rom): seams, grooves, pleats, laces. */
  tube(points:readonly V3[],r:number,o:PieceOpts={}){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
   add(new T.TubeGeometry(c,Math.max(8,points.length*(hd?3:2)),r,hd?6:4,false),o);},
  /**
   * HD: a lumpy blob (a fried crust, a cookie top, a rock): a sphere of radius r (scaled by `scale`) pushed out along its normals
   * by smooth 3D noise (`amp` deep, `freq` lumps per unit); hollows shade toward `dark`, peaks toward `light` (per-vertex colour).
   */
  blob(r:number,o:PieceOpts&{amp?:number;freq?:number;seed?:number;dark?:string;light?:string;seg?:number}={}){
   const seg=o.seg??(hd?72:20),g=new T.SphereGeometry(r,seg,Math.round(seg*.7)),pos=g.getAttribute('position'),n=pos.count,amp=o.amp??r*.12,f=o.freq??6,seed=o.seed??1;
   const base=new T.Color(o.color??toy.colors[0]),dk=new T.Color(o.dark??shade(o.color??toy.colors[0],-.18)),lt=new T.Color(o.light??shade(o.color??toy.colors[0],.08)),col=new Float32Array(n*3),c=new T.Color(),p=new T.Vector3();
   for(let i=0;i<n;i++){p.fromBufferAttribute(pos,i);const d=p.clone().normalize(),h=fbm(d.x*f+seed,d.y*f-seed*.7,d.z*f+seed*1.3);// −1 … 1
    p.addScaledVector(d,amp*h);pos.setXYZ(i,p.x,p.y,p.z);c.copy(base);if(h<0)c.lerp(dk,Math.min(1,-h*1.4));else c.lerp(lt,Math.min(1,h*1.2));c.toArray(col,i*3);}
   g.computeVertexNormals();g.setAttribute('color',new T.BufferAttribute(col,3));
   const part=o.part??'body';if(!parts.has(part))parts.set(part,{name:part,at:[0,0,0],parent:null});
   pieces.push({part,geometry:place(g,o),color:o.color??toy.colors[0],shine:!!o.shine,mat:o.mat??'vinyl',own:true});},
  /** HD: an invisible hit sphere on a part (never drawn): small grab targets (a key, a thin piece) stay ≥ 44 px to a finger. */
  proxy(part:string,r:number,at:V3){proxies.push({part,r,at});},
  /* ---- Round 3C working parts (lib/gashapon/toyInteract.ts plays them; any kind may use them). Declare the part (its pivot is
   * the hinge line / the wheel hub) BEFORE calling these. Angles in radians from the rest pose, travel in model units. */
  /** A lid / flap / door / wing: drag it open on a spring; detents tick and hold, an end stop clicks, let go near shut: clack. */
  hinge(part:string,o:MechOpts&{shut?:number}={}){mech('hinge',part,o,{axis:'x',min:0,max:1.9,release:'stay',label:'lid',hint:'Open me'},o.shut??.32);},
  /** A lever: pull it (it springs back on let-go); past `fires.at` it fires a pop-up (a flag, a goal net bulge). */
  lever(part:string,o:MechOpts={}){mech('lever',part,o,{axis:'x',min:0,max:.9,release:'return',label:'lever',hint:'Pull me'},0);},
  /** A slider / plunger along `axis` (a model direction): push it; a plunger (`release:'return'`, the default) springs back. */
  slider(part:string,o:MechOpts={}){mech('slider',part,o,{axis:[0,-1,0],min:0,max:.08,release:'return',label:'button',hint:'Push me'},0);},
  /** A crank / handle: turn it round its axis (drag in a circle); `drives` turns gears / other parts by a ratio; it coasts. */
  crank(part:string,o:MechOpts={}){mech('crank',part,o,{axis:'z',min:-1e9,max:1e9,release:'coast',label:'handle',hint:'Crank me'},0);},
  /** Wheels: push the toy, it rolls along `dir` on the turntable (the wheels turn by distance / radius), slows, rolls back home. */
  wheels(wheelParts:readonly string[],o:MechOpts&{radius?:number;dir?:V3;range?:number}={}){
   const r=o.range??.45;mech('wheels',wheelParts[0]??'body',o,{axis:'x',min:-r,max:r,release:'coast',label:'wheels',hint:'Push me'},0);
   const m=extras.mechs[extras.mechs.length-1];m.wheels=[...wheelParts];m.radius=o.radius??.1;m.dir=o.dir??[0,0,1];},
  /**
   * A ball chain. mode 'hang' (a charm): the toy hangs from a chain of `links` beads (≤ 12) `length` long above `attach` (default
   * its top), with a key ring at the top you can grab and swing. mode 'dangle': a short chain from `at` on part `from`, with the
   * part `tag` (declare it) hanging on its end.
   */
  chain(o:{mode?:'hang'|'dangle';links?:number;length?:number;bead?:'ball'|'ring';color?:string;at?:V3;from?:string;tag?:string;ring?:boolean}={}){
   const mode=o.mode??'hang',len=o.length??(mode==='hang'?.5:.22),at=o.at??[0,1,0],color=o.color??'#d9c27a';
   extras.chains.push({mode,links:Math.max(2,Math.min(12,Math.round(o.links??(mode==='hang'?10:5)))),length:len,bead:o.bead??'ball',color,attach:at,from:o.from??'body',tag:o.tag??null});
   if(mode==='hang'&&o.ring!==false){kit.part('ring',{at:[at[0],at[1]+len+.06,at[2]]});kit.torus(.075,.012,{part:'ring',at:[at[0],at[1]+len+.06,at[2]],color,mat:'gold'});kit.proxy('ring',.1,[at[0],at[1]+len+.06,at[2]]);}},
  /**
   * A pose for a figure (or any toy): per part an offset rotation (and optional offset position) from the rest pose. `grab`: the
   * parts that, dragged or tapped, move into this pose (default: the parts it moves). The first pose declared is the rest pose
   * unless one is named 'rest'; poses named 'star' and 'victory' get the Star pose button and the victory idle.
   */
  pose(name:string,parts:Readonly<Record<string,{rot?:V3;at?:V3}>>,o:{label?:string;voice?:string;grab?:readonly string[]}={}){
   extras.poses.push({name,label:o.label??name.charAt(0).toUpperCase()+name.slice(1),parts,voice:o.voice??null,grab:o.grab??Object.keys(parts)});},
  /**
   * A face on `part`: eyes (parts `eyeL` / `eyeR` under `eyes`, so blink and wink work), a mouth and optional cheeks.
   * `at` is the point between the eyes; `sphere` [cx,cy,cz,R] pushes every feature onto that sphere's surface.
   */
  face(part:string,o:{at:V3;gap?:number;size?:number;mouth?:'smile'|'open'|'cat'|'none';blush?:string|false;sphere?:readonly [number,number,number,number];eyes?:'dot'|'happy';prefix?:string}){
   const pre=o.prefix??'';
   const [x,y,z]=o.at,gap=o.gap??.13,size=o.size??.045,sp=o.sphere;
   const zOn=(px:number,py:number,dz:number)=>{if(!sp)return z+dz;const [cx,cy,cz,R]=sp,d=R*R-(px-cx)**2-(py-cy)**2;return (d>0?cz+Math.sqrt(d):z)+dz;};
   kit.part(pre+'eyes',{at:[x,y,zOn(x,y,0)],parent:part});
   for(const side of [-1,1] as const){const name=pre+(side<0?'eyeL':'eyeR'),ex=x+side*gap;kit.part(name,{at:[ex,y,zOn(ex,y,0)],parent:pre+'eyes'});
    if(o.eyes==='happy')kit.torus(size*.9,size*.32,{part:name,arc:Math.PI,at:[ex,y-size*.3,zOn(ex,y,.004)],color:INK,mat:'ink'});
    else{kit.sphere(size,{part:name,at:[ex,y,zOn(ex,y,-size*.25)],scale:[1,1.25,.55],color:INK,mat:'ink'});kit.sphere(size*.36,{part:name,at:[ex+size*.35,y+size*.45,zOn(ex,y,size*.12)],scale:[1,1,.5],color:WHITE,mat:'ink'});}}
   const my=y-size*2.1;
   if(o.mouth==='open')kit.sphere(size*.75,{part,at:[x,my,zOn(x,my,-size*.2)],scale:[1.2,1,.5],color:'#7a2630',mat:'ink'});
   else if(o.mouth==='cat'){for(const side of [-1,1])kit.torus(size*.55,size*.2,{part,arc:Math.PI,rot:[0,0,Math.PI],at:[x+side*size*.55,my+size*.25,zOn(x,my,.002)],color:INK,mat:'ink'});}
   else if(o.mouth!=='none')kit.torus(size*1.05,size*.26,{part,arc:Math.PI,rot:[0,0,Math.PI],at:[x,my+size*.5,zOn(x,my,.002)],color:INK,mat:'ink'});
   if(o.blush!==false){const bx=gap+size*1.5,by=y-size*1.6;for(const side of [-1,1])kit.sphere(size*.95,{part,at:[x+side*bx,by,zOn(x+side*bx,by,-size*.3)],scale:[1.3,.8,.35],color:o.blush??BLUSH,mat:'matte'});}
  },
  /** Merge the parts into meshes; the result belongs to the caller (dispose it). */
  finish(behaviour:ToyBehaviour&ToyKindBehaviour):ToyRig{const r=assemble(toy,behaviour,parts,pieces,hd,proxies);r.extras=extras;return r;},
 };
 const extras:ToyExtras={mechs:[],chains:[],poses:[]};
 function mech(type:MechType,part:string,o:MechOpts,d:{axis:Axis;min:number;max:number;release:MechSpec['release'];label:string;hint:string},shut:number){
  extras.mechs.push({type,part,axis:o.axis??d.axis,min:o.min??d.min,max:o.max??d.max,detents:o.detents??[],shut,release:o.release??d.release,label:o.label??d.label,hint:o.hint??d.hint,
   drives:o.drives??[],fires:o.fires??null});}
 return kit;
}
export type ToyKit=Omit<ReturnType<typeof createToyKit>,'finish'>;

/** The 3-step toon ramp (one tiny texture per toy, disposed with it). */
function toonRamp(){const d=new Uint8Array([90,90,90,255,170,170,170,255,255,255,255,255]);const t=new T.DataTexture(d,3,1);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;}

function assemble(toy:GashaponToy,behaviour:ToyBehaviour&ToyKindBehaviour,parts:Map<string,PartDef>,pieces:Piece[],hd:boolean,proxyDefs:{part:string;r:number;at:V3}[]):ToyRig{
 if(hd)return assembleHD(toy,behaviour,parts,pieces,proxyDefs);
 const root=new T.Group();root.name=`toy-${toy.id}`;
 const ramp=toonRamp(),mat=new T.MeshToonMaterial({vertexColors:true,gradientMap:ramp,name:'toy-toon'});mat.emissive.set('#ffffff');mat.emissiveIntensity=0;
 let shiny:T.MeshPhongMaterial|null=null;const materials:T.Material[]=[mat];
 const groups=new Map<string,T.Object3D>();
 // Parts in declaration order; a parent declared later still resolves (two passes).
 for(const p of parts.values()){const g=new T.Group();g.name=p.name;groups.set(p.name,g);}
 for(const p of parts.values()){const g=groups.get(p.name)!,parent=p.parent?groups.get(p.parent):undefined,pp=p.parent?parts.get(p.parent)!.at:[0,0,0] as V3;
  (parent??root).add(g);g.position.set(p.at[0]-pp[0],p.at[1]-pp[1],p.at[2]-pp[2]);}
 const meshes:T.Mesh[]=[];let triangles=0;
 for(const name of parts.keys()){
  for(const glossy of [false,true]){
   const list=pieces.filter(x=>x.part===name&&x.shine===glossy);if(!list.length)continue;
   const pivot=new T.Vector3(...parts.get(name)!.at);// pivots are model space, so this is the part's origin
   const geos=list.map(x=>{let g=x.geometry.index?x.geometry.toNonIndexed():x.geometry;if(g!==x.geometry)x.geometry.dispose();
    for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
    g.translate(-pivot.x,-pivot.y,-pivot.z);const c=new T.Color(x.color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;});
   const merged=mergeGeometries(geos,false)!;geos.forEach(g=>g.dispose());merged.computeBoundingSphere();
   if(glossy&&!shiny){shiny=new T.MeshPhongMaterial({vertexColors:true,shininess:90,specular:new T.Color('#fff7d0'),name:'toy-shine'});shiny.emissive.set('#ffffff');shiny.emissiveIntensity=0;materials.push(shiny);}
   const mesh=new T.Mesh(merged,glossy?shiny!:mat);mesh.name=`${name}${glossy?'-shine':''}`;mesh.userData.part=name;groups.get(name)!.add(mesh);meshes.push(mesh);
   triangles+=merged.getAttribute('position').count/3;
  }
 }
 const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3());
 let disposed=false;
 return {toy,behaviour,hd:false,pivots:new Map([...parts].map(([k,p])=>[k,p.at])),proxies:[],root,parts:groups,meshes,materials,height:Math.max(.2,box.max.y),radius:Math.max(.2,Math.hypot(size.x,size.z)/2,size.y/2),stats:{draws:meshes.length,triangles},extras:{mechs:[],chains:[],poses:[]},
  dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const m of meshes)m.geometry.dispose();for(const m of materials)m.dispose();ramp.dispose();meshes.length=0;}};
}

/** A 64² tangent-space noise normal map: glitter flecks catch the key light one by one as the toy turns (glitter finish only). */
function flecks(){const n=64,d=new Uint8Array(n*n*4);let s=7;const r=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 for(let i=0;i<n*n;i++){const on=r()<.35,a=r()*Math.PI*2,k=on?.75:0;d[i*4]=128+Math.cos(a)*k*127;d[i*4+1]=128+Math.sin(a)*k*127;d[i*4+2]=on?150:255;d[i*4+3]=255;}
 const t=new T.DataTexture(d,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);t.needsUpdate=true;return t;}
const FINISH:Record<Finish,T.MeshPhysicalMaterialParameters>={
 vinyl:{roughness:.38,clearcoat:.55,clearcoatRoughness:.28},
 matte:{roughness:.78},
 soft:{roughness:.74,sheen:1,sheenRoughness:.55,sheenColor:new T.Color('#fff8ee')},
 nori:{roughness:.52,clearcoat:.15,sheen:.6,sheenRoughness:.4,sheenColor:new T.Color('#5d7f55')},
 ink:{roughness:.16,clearcoat:1,clearcoatRoughness:.05},
 jelly:{roughness:.08,clearcoat:1,clearcoatRoughness:.04,transparent:true,opacity:.8,ior:1.4,specularIntensity:1},
 clear:{roughness:.04,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.26,depthWrite:false,ior:1.45},
 gold:{metalness:1,roughness:.24,clearcoat:.5,clearcoatRoughness:.12},
 glitter:{metalness:.7,roughness:.3,clearcoat:1,clearcoatRoughness:.08,normalScale:new T.Vector2(.9,.9)},
 pearl:{roughness:.22,clearcoat:1,clearcoatRoughness:.06,iridescence:1,iridescenceIOR:1.6,iridescenceThicknessRange:[160,480],sheen:.4,sheenColor:new T.Color('#ffffff')},
};
/** Round 3B HD assembly: one physical material per finish used, indexed geometry, shadows, hit proxies. */
function assembleHD(toy:GashaponToy,behaviour:ToyBehaviour&ToyKindBehaviour,parts:Map<string,PartDef>,pieces:Piece[],proxyDefs:{part:string;r:number;at:V3}[]):ToyRig{
 const root=new T.Group();root.name=`toy-${toy.id}`;const groups=new Map<string,T.Object3D>(),mats=new Map<Finish,T.MeshPhysicalMaterial>(),textures:T.Texture[]=[];
 for(const p of parts.values()){const g=new T.Group();g.name=p.name;groups.set(p.name,g);}
 for(const p of parts.values()){const g=groups.get(p.name)!,parent=p.parent?groups.get(p.parent):undefined,pp=p.parent?parts.get(p.parent)!.at:[0,0,0] as V3;
  (parent??root).add(g);g.position.set(p.at[0]-pp[0],p.at[1]-pp[1],p.at[2]-pp[2]);}
 const mat=(f:Finish)=>{let m=mats.get(f);if(m)return m;m=new T.MeshPhysicalMaterial({vertexColors:true,name:'toy-'+f,...FINISH[f]});m.emissive.set('#ffffff');m.emissiveIntensity=0;
  if(f==='glitter'){const t=flecks();textures.push(t);m.normalMap=t;}mats.set(f,m);return m;};
 const meshes:T.Mesh[]=[];let triangles=0;const order:Finish[]=['vinyl','matte','soft','nori','ink','gold','glitter','pearl','jelly','clear'];
 for(const name of parts.keys())for(const f of order){
  const list=pieces.filter(x=>x.part===name&&x.mat===f);if(!list.length)continue;const pivot=new T.Vector3(...parts.get(name)!.at);
  const geos=list.map(x=>{let g=x.geometry;for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&!(f==='glitter'&&k==='uv')&&!(x.own&&k==='color'))g.deleteAttribute(k);
   if(f==='glitter'&&!g.getAttribute('uv')){const n=g.getAttribute('position').count,a=new Float32Array(n*2),p=g.getAttribute('position');for(let i=0;i<n;i++){a[i*2]=p.getX(i)*4+p.getZ(i)*2;a[i*2+1]=p.getY(i)*4;}g.setAttribute('uv',new T.BufferAttribute(a,2));}
   if(!g.index){const m=mergeVertices(g,1e-5);if(m!==g){g.dispose();g=m;}}
   g.translate(-pivot.x,-pivot.y,-pivot.z);if(x.own&&g.getAttribute('color'))return g;const c=new T.Color(x.color),n=g.getAttribute('position').count,a=new Float32Array(n*3);
   for(let i=0;i<n;i++)c.toArray(a,i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;});
  // mergeGeometries needs one attribute set: glitter keeps uv on every piece (added above), the rest have none.
  const merged=mergeGeometries(geos,false)!;geos.forEach(g=>g.dispose());merged.computeBoundingSphere();
  const mesh=new T.Mesh(merged,mat(f));mesh.name=`${name}-${f}`;mesh.userData.part=name;mesh.userData.finish=f;mesh.castShadow=f!=='clear';
  if(f==='jelly'||f==='clear')mesh.renderOrder=f==='clear'?3:2;groups.get(name)!.add(mesh);meshes.push(mesh);
  triangles+=(merged.index?merged.index.count:merged.getAttribute('position').count)/3;}
 const proxyGeo=new T.SphereGeometry(1,8,6),proxyMat=new T.MeshBasicMaterial({visible:false}),proxies:T.Mesh[]=[];
 for(const d of proxyDefs){const g=groups.get(d.part);if(!g)continue;const pv=parts.get(d.part)!.at,m=new T.Mesh(proxyGeo,proxyMat);m.visible=false;m.userData.part=d.part;m.userData.proxy=true;m.userData.r=d.r;
  m.scale.setScalar(d.r);m.position.set(d.at[0]-pv[0],d.at[1]-pv[1],d.at[2]-pv[2]);g.add(m);proxies.push(m);}
 const box=new T.Box3();root.updateMatrixWorld(true);for(const m of meshes)box.expandByObject(m);const size=box.getSize(new T.Vector3());
 const materials:T.Material[]=[...mats.values()];let disposed=false;
 return {toy,behaviour,hd:true,pivots:new Map([...parts].map(([k,p])=>[k,p.at])),proxies,root,parts:groups,meshes,materials,height:Math.max(.2,box.max.y),radius:Math.max(.2,Math.hypot(size.x,size.z)/2,size.y/2),
  stats:{draws:meshes.length,triangles},extras:{mechs:[],chains:[],poses:[]},
  dispose(){if(disposed)return;disposed=true;root.removeFromParent();for(const m of meshes)m.geometry.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();proxyGeo.dispose();proxyMat.dispose();meshes.length=0;proxies.length=0;}};
}
