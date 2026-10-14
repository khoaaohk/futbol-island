import * as T from 'three';
import {BOOT_L,HEEL_BREAST,PLATE_V,buildLacesGeometry,buildSoleGeometry,buildStudsGeometry,buildUpperGeometry,eyeletPoints,isFlatSole,plan,shape,studGround,studLayout,sx,clamp,useShape,PART,type PlateArt,type UpperGeometry} from './bootGeometry';
import {NATURAL_ROUGHNESS,plateFinish,studFinishParams,upperFinish} from './bootMaterials';
import {ZONE_SIZE,decalPart,paintAt,zoneAt,zoneParams,zoneRay,type ZoneCtx} from './bootZones';
import {createBaker,MAX_DECALS,MAX_EYELETS} from './bootBake';
import {FLAGS,QUOTES,flagUrl,type BootDecal,type BootDesign,type BootModel,type ColourZone,type DecalZone,type StickerId,type StudFinish,type StudType} from './boots';
import {STICKERS,stickerDataUrl} from './bootStickers';
import {frameCapSlot,studioFrameMs} from './studioFrameCap';

/**
 * The boot studio's three.js scene (Oct 12 2026). Loaded on demand by BootStudio (dynamic import), disposed on close.
 *
 * Heat rules (AGENTS.md, docs/performance-guide.md):
 *  - Render on demand: no loop at rest. A frame is drawn only for an edit, a resize, a drag, a throw's inertia, a view tween or
 *    the short opening turn (one turn, then it stops). `stats.rafs` counts animation frames, so a test can prove 0 at rest.
 *  - Phones: pixel ratio ≤ 1.5, 1024² textures, fewer rows in the mesh. Desktops: ≤ 2, 2048² bake.
 *  - Touch devices: ≤ 30 fps while spinning, dragging or coasting (lib/shop/studioFrameCap.ts, the island's 33.3 ms slots; dt
 *    runs from the last rendered frame, so the inertia is frame-rate independent). Desktop: uncapped.
 *  - A handful of draw calls: upper, sole (+ heel counter and toe wrap), studs (one merged mesh per layout, metal tips and
 *    contrast tips included: the stud shader colours them from aStud), laces, contact shadow. The mirrored pair doubles the boot
 *    (it is a toggle, off by default). Twelve stud layouts and five stud finishes never add a draw call.
 *  - The design texture is baked on the GPU only after an edit (bootBake.ts); the sticker atlas is a CanvasTexture uploaded only
 *    when the set of stickers changes. Hidden tab: nothing runs; the next visible frame redraws once.
 * Measured Oct 12 2026 (production build, headless Chrome/Metal on a Mac, 390×844 @3× → 1.5×, 4× CPU throttle, GPU timer
 * queries): 0 rAF calls in 2 s at rest; while spinning 0.30 ms GPU median (0.64 p90), 0.7–0.8 ms CPU per frame, 5 draw calls;
 * iridescent knit SG 0.34 ms GPU; mirrored pair 10 calls, 0.47 ms GPU. Desktop emulation only: not an iPhone thermal claim.
 * Re-measured after the sleek reshape + 12 stud layouts (same probe, same profile): 0 rAF at rest; spinning 0.56 ms GPU median
 * (0.65 p90, was 0.60/0.67 in this run's before build), 5 draw calls, 18.4k triangles (was 22.0k); carbon + see-through studs
 * 0.58 ms; pair 10 calls, 0.82 ms GPU. An edit that changes the stud layout rebuilds the merged studs and the plate once
 * (≈ 12–16 ms CPU at 4× throttle, one frame); other edits stay under 1 ms.
 * Silhouettes (Oct 12 2026): fifteen models (side profiles fitted to traced reference photos, docs/shop-boot-silhouettes.md). Each
 * upper (+ its laces) is built once per model/collar/laces and kept in a small cache (SHAPE_CACHE), plate + studs + plate art per
 * model/studs (STUD_CACHE): a first visit costs 40–90 ms CPU at 4× throttle (one frame, on a tap), a switch back ≈ 1.5 ms. Fins and
 * the lace cover are merged into the upper: still 5 draw calls. Measured (same probe/profile): 0 rAF at rest; spinning 0.57–0.71 ms
 * GPU median, 0.5–0.7 ms render CPU, 14.9k–18.8k triangles.
 * Soles, sides and natural materials (Oct 13 2026; docs/shop-boot-silhouettes.md): same probe, 0 rAF at rest, spinning 0.67–0.74 ms
 * GPU median, 0.7–0.8 ms render CPU, 5 draw calls, 18.2k–23.0k triangles; a first model build 85–130 ms at 4× throttle.
 */
export type BootView='hero'|'side'|'inside'|'top'|'heel'|'sole'|'front'|'tongue';
export type DecalPatch=Pick<BootDecal,'x'|'y'|'size'|'rot'|'zone'>;
export type BootSceneOptions={
 coarse:boolean;reducedMotion:boolean;
 /** A tap on the boot (no drag): the zone and spot under the finger, and the decal there if any. */
 onTap?(hit:{zone:DecalZone;x:number;y:number;decal:string|null;paint:ColourZone}|null):void;
 /** A decal was dragged, pinched or twisted; `done` on release. */
 onDecalMove?(id:string,patch:DecalPatch,done:boolean):void;
 /** The view changed by hand (drag): the UI drops its view highlight. */
 onManualTurn?():void;
};
export type BootScene={
 setDesign(d:BootDesign):void;setSelected(id:string|null):void;setEditing(on:boolean):void;
 setView(v:BootView,animate?:boolean):void;setPair(on:boolean):void;resetView():void;
 /** Test/screenshot hook: hold an exact orientation. */
 pose(yaw:number,pitch:number):void;
 resize():void;dispose():void;
 readonly stats:{rafs:number;frames:number;bakes:number;atlasUploads:number;calls:number;triangles:number};
 readonly renderer:T.WebGLRenderer;
 /** Lab/debug only. */
 readonly debug:{scene:T.Scene;camera:T.PerspectiveCamera;shadows:T.Mesh[];pivot:T.Group;uniforms:Record<string,T.IUniform>;placed:string[];rects:string[]};
};

/* ---------- zones: bootZones.ts (per shape) ---------- */
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

/* ---------- atlas ---------- */
type AtlasItem={key:string;w:number;h:number;draw(g:CanvasRenderingContext2D,x:number,y:number):void|Promise<void>};
const loadImage=(src:string)=>new Promise<HTMLImageElement>((ok,fail)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=()=>fail(new Error('image '+src.slice(0,40)));i.src=src;});
function fitText(g:CanvasRenderingContext2D,text:string,font:(px:number)=>string,maxW:number,maxPx:number){let px=maxPx;g.font=font(px);while(px>12&&g.measureText(text).width>maxW){px-=4;g.font=font(px);}return px;}

/* ---------- textures for the plate ---------- */
/**
 * The plate's art (Oct 13 2026; second pass Oct 13, user: "the soles still look too similar"): four canvases in the plate's UV
 * layout, the underside (v 0–.8, a top-down projection) and the edge strip (v .8–1, along the boot):
 *  - colour: a white base the soleplate colour tints (darker grooves, stitches, twill);
 *  - height → the normal map (Sobel), with ROUGHNESS in its alpha (a DataTexture, so the alpha is exact);
 *  - ZONES (a third texture, read by the plate shader): red = the plate's second colour (two-tone plates, spines, heel cups,
 *    welts), green = dark open windows, blue = see-through (frosted, translucent) sections.
 * Each model draws its own underside (PLATE_ART below, keyed by bootGeometry.ts SOLES[...].plate.art): heel construction,
 * windows (count, shape, size), shanks, spines, tread and two-tone zoning. The research is in docs/shop-boot-silhouettes.md
 * ("Soles, second pass"). Shapes only: no marks, words or logos are drawn.
 */
type Look={shade?:string;height?:number;rough?:number;zone?:'p2'|'dark'|'frost'|'none'};
type PathFn=(ctx:CanvasRenderingContext2D)=>void;
type ArtKit={
 fill(p:PathFn,o:Look):void;stroke(p:PathFn,o:Look,w:number,dash?:number[]):void;
 hatch(clip:PathFn,step:number,deg:number,o:Look,w:number):void;dots(clip:PathFn,step:number,rad:number,o:Look):void;twill(clip:PathFn):void;
 outline(kk:number,s0?:number,s1?:number):PathFn;poly(pts:readonly (readonly [number,number])[],round?:number):PathFn;line(pts:readonly (readonly [number,number])[]):PathFn;
 ell(s:number,f:number,rx:number,rz?:number):PathFn;wavy(s0:number,s1:number,f:number,amp:number,period:number):PathFn;cross(s:number,f0:number,f1:number,amp?:number,period?:number):PathFn;
 edge(s0:number,s1:number,v0:number,v1:number,o:Look):void;
 studs:StudType;k:number;
};
const ZONE_RGB={p2:'#ff0000',dark:'#00ff00',frost:'#0000ff',none:'#000000'} as const;
/** The models' undersides. f −1 inside … 1 outside, s 0 heel … 1 toe; heights 128 = flat, more = raised, less = recessed. */
const PLATE_ART:Record<PlateArt,(a:ArtKit)=>void>={
 // 1968: a full flat outsole with a diamond tread, a smooth waist with two grooves, a separate stacked heel block (second colour,
 // layered edges), a stitch line all round
 stacked:a=>{
  a.hatch(a.outline(.93,.29,1),10,38,{height:80,shade:'rgba(0,0,0,.14)'},2.6);a.hatch(a.outline(.93,.29,1),10,-38,{height:80,shade:'rgba(0,0,0,.14)'},2.6);
  a.fill(a.outline(.62,.33,.54),{height:128,shade:'#ffffff'});for(const f of [-.25,.25])a.stroke(a.line([[.34,f],[.53,f]]),{height:70},3);
  a.fill(a.outline(1.06,0,HEEL_BREAST),{zone:'p2',height:150});
  for(const kk of [.78,.52])a.stroke(a.outline(kk,.025+(1-kk)*.08,HEEL_BREAST-.03-(1-kk)*.04),{height:96,shade:'rgba(0,0,0,.18)'},2.4);
  a.stroke(a.outline(.92),{height:100,shade:'rgba(0,0,0,.38)'},2.2,[6,5]);
  a.edge(0,1,PLATE_V.weltLo,PLATE_V.weltHi,{zone:'p2'});
 },
 // 1979: a recessed centre panel with ladder ribs, a lighter dual-density waist insert with ribs, crescent ribs in the heel, a
 // stitch line and welt piping in the second colour
 ladder:a=>{
  a.fill(a.poly([[.5,-.48],[.5,.42],[.94,.24],[.94,-.32]],10),{height:96,shade:'rgba(0,0,0,.1)'});
  for(let s=.53;s<.93;s+=.034)a.stroke(a.line([[s,-.44+(s-.5)*.3],[s,.38-(s-.5)*.3]]),{height:178},4.2);
  a.fill(a.outline(.78,.3,.56),{zone:'frost',height:140,rough:.5});for(const f of [-.32,0,.32])a.stroke(a.line([[.32,f*.7],[.54,f]]),{height:182},3.4);
  for(const kk of [.72,.46,.2])a.stroke(a.outline(kk,.03+(1-kk)*.06,HEEL_BREAST-.02),{height:176},3.6);
  a.stroke(a.outline(.93),{zone:'p2',height:100},2.4,[6,5]);
  a.edge(0,1,PLATE_V.weltLo,PLATE_V.weltHi,{zone:'p2'});
 },
 // 2002 lightweight: a see-through heel window with wave ribs, and the forefoot split into flexing segments by shallow moulded
 // grooves (plate colour, inside the edge). The scalloped edge is geometry (plate.wave). Fix pass Oct 13 2026 (user: dark wavy
 // lines ran across the Featherlight sole): the wavy second-colour lines along both edges echoed the upper's stitched wave line
 // and the flex gaps were dark windows reaching past the plate's edge; the wave line now lives on the upper only (bootBake.ts
 // uSide, outer upper above the plate) and the sole shows just its scalloped plate and wave window.
 wave:a=>{
  a.fill(a.poly([[.05,-.5],[.24,-.56],[.24,.5],[.05,.44]],14),{zone:'frost',height:108,rough:.28});
  for(const f of [-.28,0,.28])a.stroke(a.wavy(.06,.23,f,.1,.06),{height:172},3.4);
  for(const s of [.615,.715,.815])a.stroke(a.cross(s,-.8,.8,.008,1.1),{height:92,shade:'rgba(0,0,0,.06)'},4);
 },
 // 1998 power: a horseshoe heel in the second colour round a dark cavity, a see-through hourglass shank with ribs, a raised round
 // platform with radial grooves under the swirl of small blades
 swirl:a=>{
  a.fill(a.outline(1.06,0,.3),{zone:'p2',height:155});a.fill(a.outline(.46,.07,.21),{zone:'dark',height:100,shade:'rgba(0,0,0,.25)'});
  const shank=a.poly([[.28,-.62],[.43,-.22],[.58,-.62],[.58,.62],[.43,.22],[.28,.62]],8);a.fill(shank,{zone:'frost',height:112,rough:.3});a.hatch(shank,9,60,{height:168},2.6);
  a.stroke(a.ell(.7,-.04,.36,.3),{height:176},7);for(let i=0;i<10;i++){const t=i/10*Math.PI*2;a.stroke(a.line([[.7+.03*Math.cos(t),-.04+.08*Math.sin(t)],[.7+.12*Math.cos(t),-.04+.6*Math.sin(t)]]),{height:86},3);}
 },
 // 1998 speed: the arch bridge raised in the second colour across the slim waist, a long centre groove, a small dark heel window,
 // fine speed lines on the forefoot
 bridge:a=>{
  a.fill(a.outline(1.1,.27,.6),{zone:'p2',height:162});
  a.stroke(a.line([[.04,-.02],[.96,-.04]]),{height:60,shade:'rgba(0,0,0,.18)'},5);
  a.fill(a.ell(.12,0,.13,.1),{zone:'dark',height:96});
  a.hatch(a.outline(.84,.61,.97),11,14,{height:100,shade:'rgba(0,0,0,.12)'},2.2);
 },
 // 2002 power: a two-tone plate split corner to corner (outside toe and inside heel in the second colour), a see-through arch
 // backing crossed by a dark X brace
 diagonal:a=>{
  a.fill(a.poly([[.4,1.4],[1.05,1.4],[1.05,-1.4],[.96,-1.4]]),{zone:'p2',height:136});
  a.fill(a.poly([[-.05,-1.4],[.3,-1.4],[.12,1.4],[-.05,1.4]]),{zone:'p2',height:136});
  a.fill(a.outline(.74,.3,.57),{zone:'frost',height:110,rough:.3});
  for(const d of [1,-1])a.stroke(a.line([[.29,-.62*d],[.57,.62*d]]),{zone:'dark',height:172},13);
 },
 // 2004 speed: a glossy plate, a big dark open arch window with a see-through fin, a second-colour rim stripe, fine forefoot ribs
 gloss:a=>{
  const win=a.poly([[.3,-.52],[.3,.44],[.58,.56],[.58,-.62]],22);a.fill(win,{zone:'dark',height:88,rough:.2});
  a.stroke(a.line([[.31,-.04],[.57,-.04]]),{zone:'frost',height:170},6);
  a.stroke(a.outline(.9),{zone:'p2',height:150},5);
  for(const f of [-.5,-.25,0,.25,.5])a.stroke(a.line([[.6,f],[.9,f*.6]]),{height:168},3);
 },
 // 2004 power: a central spine in the second colour from heel to toe, rounded triangular windows either side (8)
 spine:a=>{
  for(const d of [-1,1]){for(const t of [[.6,.72,.66,.62],[.74,.86,.8,.56],[.33,.52,.43,.62],[.07,.21,.14,.52]] as const)
   a.fill(a.poly([[t[0],.16*d],[t[1],.16*d],[t[2],t[3]*d]],6),{zone:'dark',height:84,rough:.3});}
  a.stroke(a.line([[.03,0],[.96,-.04]]),{zone:'p2',height:178},17);
  a.edge(0,.24,PLATE_V.under,PLATE_V.top,{zone:'p2'});
 },
 // 2007 power: a Y-shaped spine, one big see-through triangle window between its arms, a solid second-colour heel, dark arch windows
 yspine:a=>{
  a.fill(a.outline(1.06,0,HEEL_BREAST),{zone:'p2',height:150});
  const tri=a.poly([[.6,-.03],[.9,-.36],[.9,.26]],10);a.fill(tri,{zone:'frost',height:100,rough:.25});a.hatch(tri,8,-50,{height:150},2);
  for(const d of [-1,1])a.fill(a.poly([[.31,.14*d],[.52,.14*d],[.49,.56*d],[.33,.56*d]],8),{zone:'dark',height:86,rough:.3});
  a.stroke(a.line([[.04,0],[.56,-.02],[.93,-.42]]),{zone:'p2',height:180},14);a.stroke(a.line([[.56,-.02],[.93,.32]]),{zone:'p2',height:180},14);
  a.edge(0,.3,PLATE_V.under,PLATE_V.top,{zone:'p2'});
 },
 // 2010 ultralight: a skeleton frame, five big open windows (two in the forefoot, one under the arch, two in the heel)
 skeleton:a=>{
  const wins=[a.poly([[.58,-.1],[.9,-.08],[.86,-.56],[.62,-.64]],12),a.poly([[.58,.1],[.9,.06],[.86,.44],[.62,.56]],12),a.poly([[.3,-.46],[.57,-.54],[.57,.44],[.3,.36]],14),
   a.poly([[.05,-.1],[.22,-.1],[.2,-.46],[.07,-.4]],8),a.poly([[.05,.1],[.22,.1],[.2,.46],[.07,.4]],8)];
  for(const w of wins){a.fill(w,{zone:'dark',height:78,rough:.3});if(a.studs==='carbon')a.twill(w);a.stroke(w,{height:178},4);}
 },
 // 2013 leather: a padded heel cupsole in the second colour with pebbled tread (it wraps up the heel), a ribbed shank, flex grooves
 cup:a=>{
  const cup=a.outline(1.06,0,.3);a.fill(cup,{zone:'p2',height:140,rough:.8});a.dots(cup,8,2.3,{height:180});
  a.fill(a.poly([[.33,-.22],[.55,-.22],[.55,.22],[.33,.22]],8),{zone:'frost',height:150,rough:.35});
  for(const s of [.63,.72,.81])a.stroke(a.cross(s,-1.1,1.1,.008,.5),{height:56,shade:'rgba(0,0,0,.2)'},6);
  a.edge(0,.32,PLATE_V.under,PLATE_V.top,{zone:'p2'});
 },
 // 2014 knit: a bubble texture all over, a dark textured panel under the arch, a groove ring through the round pods
 pods:a=>{
  a.dots(a.outline(.95),12,3.4,{height:166});
  const panel=a.outline(.72,.29,.58);a.fill(panel,{zone:'dark',height:118});a.twill(panel);
  a.stroke(a.ell(.71,-.04,.23,.25),{height:72,shade:'rgba(0,0,0,.25)'},5);
 },
 // 2016 knit: a dark textured (carbon-look) arrowhead panel, ridges across the waist, a second-colour rim stripe
 chevron:a=>{
  const arrow=a.poly([[.3,-.4],[.62,-.4],[.8,-.02],[.62,.36],[.3,.36],[.43,-.02]],6);a.fill(arrow,{zone:'dark',height:120});a.twill(arrow);
  for(let s=.3;s<.58;s+=.04)a.stroke(a.line([[s,-.38],[s+.05,-.02],[s,.34]]),{height:176},3);
  a.stroke(a.outline(.88),{zone:'p2',height:150},4.5);
 },
 // 2017 laceless: a see-through frame with ribs inside, a twin spine and a ring round the ball in the second colour
 rotor:a=>{
  const glass=a.outline(.84,.04,.97);a.fill(glass,{zone:'frost',height:112,rough:.26});a.hatch(glass,10,62,{height:152},3);
  for(const f of [-.13,.13])a.stroke(a.line([[.08,f],[.62,f*.8]]),{zone:'p2',height:176},8);
  a.stroke(a.ell(.72,-.04,.29,.3),{zone:'p2',height:176},7);
 },
 gum:()=>{},
};
function plateTextures(studs:StudType,detail:'phone'|'desktop'){
 const W=detail==='desktop'?768:512,UH=Math.round(W/2),SH=Math.round(UH*.25),H=UH+SH;
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return {c,x:c.getContext('2d',{willReadFrequently:true})!};};
 const C=mk(),HC=mk(),RC=mk(),ZC=mk(),g=C.x,h=HC.x,r=RC.x,z=ZC.x;
 const k=W/512,X=(x:number)=>(x+BOOT_L/2)/BOOT_L*W,Z=(z:number)=>SH+(1-(z+.62)/1.24)*UH,RX=W/BOOT_L,RZ=UH/1.24;
 const pk=shape().plate,flat=isFlatSole(studs),kind=flat?'gum':pk.kind,art:PlateArt=flat?'gum':pk.art,rubber=kind==='rubber'||kind==='gum';
 const R=(v:number)=>{const n=Math.round(v*255);return `rgb(${n},${n},${n})`;},grey=(v:number)=>`rgb(${v},${v},${v})`;
 g.fillStyle='#fff';g.fillRect(0,0,W,H);h.fillStyle='#808080';h.fillRect(0,0,W,H);z.fillStyle='#000';z.fillRect(0,0,W,H);
 r.fillStyle=R(rubber?(kind==='gum'?NATURAL_ROUGHNESS.gum:NATURAL_ROUGHNESS.rubberSole):art==='gloss'?.24:NATURAL_ROUGHNESS.plate);r.fillRect(0,0,W,H);
 const P=(s:number,f:number):[number,number]=>{const p=plan(clamp(s,0,1));return [X(sx(s)),Z(p.zc+(f<0?p.med:p.lat)*f)];};
 const xs=(s:number)=>X(sx(s));
 const layers=(o:Look):[CanvasRenderingContext2D,string][]=>{const out:[CanvasRenderingContext2D,string][]=[];
  if(o.shade)out.push([g,o.shade]);if(o.height!=null)out.push([h,grey(o.height)]);if(o.rough!=null)out.push([r,R(o.rough)]);if(o.zone)out.push([z,ZONE_RGB[o.zone]]);return out;};
 const underClip=(ctx:CanvasRenderingContext2D)=>{ctx.beginPath();ctx.rect(0,SH,W,UH);ctx.clip();};
 const outlinePath=(kk:number,s0=0,s1=1):PathFn=>ctx=>{for(let i=0;i<=60;i++){const s=s0+(s1-s0)*i/60,p=plan(s);const x=X(sx(s)),zz=Z(p.zc+p.lat*kk);i?ctx.lineTo(x,zz):ctx.moveTo(x,zz);}
  for(let i=60;i>=0;i--){const s=s0+(s1-s0)*i/60,p=plan(s);ctx.lineTo(X(sx(s)),Z(p.zc-p.med*kk));}ctx.closePath();};
 const kit:ArtKit={studs,k,
  fill(p,o){for(const [ctx,st] of layers(o)){ctx.save();underClip(ctx);ctx.beginPath();p(ctx);ctx.fillStyle=st;ctx.fill();ctx.restore();}},
  stroke(p,o,w,dash){for(const [ctx,st] of layers(o)){ctx.save();underClip(ctx);ctx.beginPath();p(ctx);ctx.strokeStyle=st;ctx.lineWidth=w*k;ctx.lineCap=ctx.lineJoin='round';if(dash)ctx.setLineDash(dash.map(d=>d*k));ctx.stroke();ctx.restore();}},
  hatch(clip,step,deg,o,w){const t=deg*Math.PI/180,dx=Math.cos(t),dy=Math.sin(t),L=W+H;
   for(const [ctx,st] of layers(o)){ctx.save();underClip(ctx);ctx.beginPath();clip(ctx);ctx.clip();ctx.strokeStyle=st;ctx.lineWidth=w*k;ctx.beginPath();
    for(let q=-L;q<L;q+=step*k){const cx=W/2-dy*q,cy=H/2+dx*q;ctx.moveTo(cx-dx*L,cy-dy*L);ctx.lineTo(cx+dx*L,cy+dy*L);}ctx.stroke();ctx.restore();}},
  dots(clip,step,rad,o){for(const [ctx,st] of layers(o)){ctx.save();underClip(ctx);ctx.beginPath();clip(ctx);ctx.clip();ctx.fillStyle=st;ctx.beginPath();
   for(let y=SH,row=0;y<H;y+=step*k*.866,row++)for(let x=(row%2)*step*k/2;x<W;x+=step*k){ctx.moveTo(x+rad*k,y);ctx.arc(x,y,rad*k,0,Math.PI*2);}ctx.fill();ctx.restore();}},
  // a carbon-look twill: small offset blocks, satin, in the colour and the height map
  twill(clip){const q=7*k;for(const ctx of [g,h,r]){ctx.save();underClip(ctx);ctx.beginPath();clip(ctx);ctx.clip();
   for(let x=0;x<W;x+=q)for(let y=SH;y<H;y+=q){const on=(Math.round(x/q)+Math.round(y/q)*2)%4<2;
    ctx.fillStyle=ctx===g?(on?'rgba(255,255,255,.22)':'rgba(0,0,0,.12)'):ctx===h?(on?'#8c8c8c':'#747474'):R(on?.28:.4);ctx.fillRect(x,y,q,q);}ctx.restore();}},
  outline:outlinePath,
  poly(pts,round=0){return ctx=>{const q=pts.map(([s,f])=>P(s,f)),n=q.length;if(!round){q.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();return;}
   const m=(a:[number,number],b:[number,number]):[number,number]=>[(a[0]+b[0])/2,(a[1]+b[1])/2];const s0=m(q[n-1],q[0]);ctx.moveTo(s0[0],s0[1]);
   for(let i=0;i<n;i++){const nx=m(q[i],q[(i+1)%n]);ctx.arcTo(q[i][0],q[i][1],nx[0],nx[1],round*k);}ctx.closePath();};},
  line(pts){return ctx=>{pts.forEach(([s,f],i)=>{const [x,y]=P(s,f);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});};},
  ell(s,f,rx,rz){return ctx=>{const [x,y]=P(s,f);ctx.moveTo(x+rx*RX,y);ctx.ellipse(x,y,rx*RX,(rz??rx)*RZ,0,0,Math.PI*2);};},
  wavy(s0,s1,f,amp,period){return ctx=>{for(let i=0;i<=48;i++){const s=s0+(s1-s0)*i/48,[x,y]=P(s,f+amp*Math.sin((s-s0)/period*Math.PI*2));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}};},
  cross(s,f0,f1,amp=0,period=.5){return ctx=>{for(let i=0;i<=24;i++){const f=f0+(f1-f0)*i/24,[x,y]=P(s+amp*Math.sin(f/period*Math.PI*2),f);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}};},
  edge(s0,s1,v0,v1,o){const vy=(v:number)=>(1-v)/(1-PLATE_V.under)*SH;for(const [ctx,st] of layers(o)){ctx.fillStyle=st;ctx.fillRect(s0*W,vy(v1),(s1-s0)*W,vy(v0)-vy(v1));}},
 };
 if(kind==='gum'){
  g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=2*k;h.strokeStyle='#202020';h.lineWidth=3*k;
  // gum-rubber herringbone (indoor) or a fine nubbed tread (futsal), and pivot circles under the ball of the foot and the heel
  if(studs==='futsal'){h.fillStyle='#9a9a9a';const st=9*k;for(let x=6*k;x<W;x+=st)for(let y=SH+10*k;y<H;y+=st){h.beginPath();h.arc(x+((Math.round(y/st))%2?4*k:0),y,2.2*k,0,Math.PI*2);h.fill();}}
  else{const st=11*k;for(let x=-UH;x<W+UH;x+=st){for(let y=SH+8*k;y<H;y+=st*2){for(const cx of [g,h]){cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+st,y+st);cx.lineTo(x,y+st*2);cx.stroke();}}}}
  for(const [s,rr,n] of (studs==='futsal'?[[.7,40,4],[.9,20,2],[.1,30,3]]:[[.7,46,4],[.12,30,3]]) as [number,number,number][]){const cx=xs(s),cz=Z(plan(s).zc+(s===.9?-.12:0));
   h.fillStyle='#808080';h.beginPath();h.arc(cx,cz,(rr+4)*k,0,Math.PI*2);h.fill();g.fillStyle='#fff';g.beginPath();g.arc(cx,cz,(rr+4)*k,0,Math.PI*2);g.fill();
   for(let q=0;q<n;q++){const rq=(rr-q*10)*k;h.lineWidth=5*k;h.beginPath();h.arc(cx,cz,rq,0,Math.PI*2);h.stroke();g.lineWidth=3*k;g.beginPath();g.arc(cx,cz,rq,0,Math.PI*2);g.stroke();}}
  for(const s of [.6,.66,.72]){h.strokeStyle='#3a3a3a';h.lineWidth=4*k;h.beginPath();h.moveTo(xs(s),SH);h.lineTo(xs(s+.02),H);h.stroke();}
  // a second-colour toe bumper and heel foxing on the cupsole wall
  kit.edge(.88,1,PLATE_V.under,PLATE_V.top,{zone:'p2'});kit.edge(0,.08,PLATE_V.under,PLATE_V.top,{zone:'p2'});
 }else{
  // the arch is a touch rougher (moulded, not polished), then the model's own underside
  kit.fill(outlinePath(1.2,HEEL_BREAST,.585),{rough:rubber?.86:Math.min(.6,NATURAL_ROUGHNESS.plate+.08)});
  if(studs==='split')kit.fill(outlinePath(1.2,HEEL_BREAST,.585),{shade:'#2b2d33',height:96,rough:.9,zone:'dark'});
  else{PLATE_ART[art](kit);
   // a carbon plate on any other model: a twill panel from the arch to the forefoot
   if(studs==='carbon'&&art!=='skeleton'){const pan=outlinePath(.66,.3,.68);kit.fill(pan,{zone:'dark',height:128});kit.twill(pan);kit.stroke(pan,{height:200},4);}}
  // the heel block's edge and the forefoot flex groove
  h.strokeStyle='#4a4a4a';h.lineWidth=4*k;h.beginPath();h.moveTo(xs(HEEL_BREAST),SH);h.lineTo(xs(HEEL_BREAST),H);h.stroke();
  h.lineWidth=5*k;h.beginPath();h.moveTo(xs(.635),SH);h.lineTo(xs(.635),H);h.stroke();
  if(kind==='rubber'){
   // moulded rubber: fine pebbles over everything
   const d=h.getImageData(0,SH,W,UH),a=d.data,sx0=new Float32Array(W),sy0=new Float32Array(UH);for(let x=0;x<W;x++)sx0[x]=Math.sin(x*1.9/k)*14;for(let y=0;y<UH;y++)sy0[y]=Math.sin(y*1.9/k);
   for(let y=0,i=0;y<UH;y++)for(let x=0;x<W;x++,i+=4){const v=a[i]+sx0[x]*sy0[y];a[i]=a[i+1]=a[i+2]=v<0?0:v>255?255:v;}h.putImageData(d,0,SH);
  }
  // stud bases: a raised collar pad round each stud (the pods get a second-colour ring)
  for(const st of studLayout(studs)){const rr=(st.shape==='nub'?7:st.shape==='ag'?11:st.shape==='sg'||st.shape==='sgShort'?20:st.shape==='pod'?19:16)*k*st.scale;
   g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.arc(X(st.x),Z(st.z),rr+7*k,0,Math.PI*2);g.fill();
   if(st.shape==='pod'){z.fillStyle=ZONE_RGB.p2;z.beginPath();z.arc(X(st.x),Z(st.z),rr+2*k,0,Math.PI*2);z.fill();}
   h.fillStyle='#a6a6a6';h.beginPath();h.arc(X(st.x),Z(st.z),rr+7*k,0,Math.PI*2);h.fill();h.strokeStyle='#c8c8c8';h.lineWidth=2*k;h.beginPath();h.arc(X(st.x),Z(st.z),rr+7*k,0,Math.PI*2);h.stroke();}
  // a groove inside the edge
  h.strokeStyle='#505050';h.lineWidth=3*k;h.beginPath();outlinePath(.86)(h);h.stroke();
 }
 // the edge strip (v .8 → 1 is canvas y SH → 0): stitches on a welt, fine vertical moulding lines on rubber
 const vy=(v:number)=>(1-v)/(1-PLATE_V.under)*SH;
 if(pk.welt&&kind!=='gum'){const y=vy((PLATE_V.weltLo+PLATE_V.weltHi)/2);g.strokeStyle='rgba(0,0,0,.45)';h.strokeStyle='#d0d0d0';g.lineWidth=h.lineWidth=2.4*k;g.setLineDash([7*k,5*k]);h.setLineDash([7*k,5*k]);
  for(const cx of [g,h]){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();cx.setLineDash([]);}
  h.strokeStyle='#5a5a5a';h.lineWidth=2*k;h.beginPath();h.moveTo(0,vy(PLATE_V.weltLo));h.lineTo(W,vy(PLATE_V.weltLo));h.stroke();}
 if(rubber){h.strokeStyle='#909090';h.lineWidth=1.5*k;for(let x=0;x<W;x+=5*k){h.beginPath();h.moveTo(x,vy(PLATE_V.face+.02));h.lineTo(x,vy(PLATE_V.bevel));h.stroke();}}
 // height → normal (Sobel) into an RGBA buffer, rows flipped for a DataTexture (v up); alpha = roughness
 const src=h.getImageData(0,0,W,H).data,rough=r.getImageData(0,0,W,H).data,data=new Uint8Array(W*H*4),kk=2.2;
 const f=kk/255;
 for(let y=0;y<H;y++){const row=(H-1-y)*W,yu=(y>0?y-1:0)*W,yd=(y<H-1?y+1:y)*W,yc=y*W;for(let x=0;x<W;x++){const xl=x>0?x-1:0,xr=x<W-1?x+1:x;
  const dx=(src[(yc+xr)<<2]-src[(yc+xl)<<2])*f,dy=(src[(yd+x)<<2]-src[(yu+x)<<2])*f,l=1/Math.sqrt(dx*dx+dy*dy+1),i=(row+x)<<2;
  data[i]=(-dx*l*.5+.5)*255;data[i+1]=(dy*l*.5+.5)*255;data[i+2]=(l*.5+.5)*255;data[i+3]=rough[(yc+x)<<2];}}
 const map=new T.CanvasTexture(C.c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const zone=new T.CanvasTexture(ZC.c);zone.colorSpace=T.NoColorSpace;zone.anisotropy=4;
 const normal=new T.DataTexture(data,W,H,T.RGBAFormat);normal.generateMipmaps=true;normal.minFilter=T.LinearMipmapLinearFilter;normal.magFilter=T.LinearFilter;normal.anisotropy=4;normal.needsUpdate=true;
 return {map,normal,zone,rubber};
}

/**
 * Finish → material settings (bootMaterials.ts holds the numbers). Only uniforms change: clearcoat and sheen stay enabled at a
 * tiny minimum so a finish switch never recompiles the shader (a recompile cost ~0.2 s of CPU on a phone). Roughness comes from
 * the baked texel roughness (normal map alpha) × roughK. "Iridescent" is a lite effect: a view-angle hue shift added in the
 * upper's shader (uIrid), not three's thin-film iridescence (1.4 ms GPU median vs 0.55).
 */
function applyFinish(m:T.MeshPhysicalMaterial,finish:BootDesign['finish'],upper:BootDesign['upper'],plate:boolean,rubberPlate=false){
 const f=plate?plateFinish(finish,rubberPlate):upperFinish(finish,upper);
 const u=m.userData as {irid?:{value:number};roughK?:{value:number}};
 if(u.roughK)u.roughK.value=f.roughK;
 m.metalness=f.metalness;m.clearcoat=Math.max(.001,f.clearcoat);m.clearcoatRoughness=f.clearcoatRoughness;
 m.sheen=Math.max(.001,f.sheen);m.sheenRoughness=f.sheenRoughness;m.specularIntensity=f.specularIntensity;
 if(u.irid)u.irid.value=finish==='iridescent'?1:0;
}
/** Roughness from the normal map's alpha × roughK (the bake and the plate texture write it per texel). */
function texelRoughness(m:T.MeshPhysicalMaterial,key:string){
 const roughK={value:1};m.userData.roughK=roughK;
 return (sh:T.WebGLProgramParametersWithUniforms)=>{sh.uniforms.uRoughK=roughK;
  sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform float uRoughK;\nvoid main() {')
   .replace('#include <roughnessmap_fragment>','float roughnessFactor=clamp(texture2D(normalMap,vNormalMapUv).a*uRoughK,.045,1.);');
  void key;};
}
const hexToV=(hex:string,out:T.Vector4)=>{const n=parseInt(hex.slice(1),16);return out.set((n>>16&255)/255,(n>>8&255)/255,(n&255)/255,1);};
const lumOf=(hex:string)=>{const n=parseInt(hex.slice(1),16);return ((n>>16&255)*.2126+(n>>8&255)*.7152+(n&255)*.0722)/255;};

/**
 * A photo studio for the reflections (built once, prefiltered by PMREM): a large soft gradient dome (warm floor bounce, neutral
 * walls, a bright ceiling) and three big softboxes (a key above front left, a tall strip behind right, a low front fill). Big,
 * soft sources give the wide, gentle highlights of a product photo instead of one hard specular blob.
 */
function studioScene(){
 const sc=new T.Scene(),geo=new T.SphereGeometry(10,32,16),pos=geo.getAttribute('position') as T.BufferAttribute,col=new Float32Array(pos.count*3);
 for(let i=0;i<pos.count;i++){const y=pos.getY(i)/10,t=y<0?0:y;const c=y<0?new T.Color(.6,.53,.45).multiplyScalar(.7+.3*(1+y)):new T.Color(.62,.62,.64).lerp(new T.Color(1.15,1.13,1.1),t*t);col.set([c.r,c.g,c.b],i*3);}
 geo.setAttribute('color',new T.BufferAttribute(col,3));sc.add(new T.Mesh(geo,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide})));
 const box=(w:number,h:number,p:[number,number,number],k:number,tint=0xffffff)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(tint).multiplyScalar(k),side:T.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);sc.add(m);};
 box(7,4.5,[-4.5,7,5],3.4,0xfff3e4);box(2.2,8,[7,3,-3.5],2.4,0xe8f0ff);box(9,3,[0,-.5,8.5],1.5);
 return sc;
}
function disposeScene(sc:T.Scene){sc.traverse(o=>{const m=o as T.Mesh;if(m.isMesh){m.geometry.dispose();(m.material as T.Material).dispose();}});}

export function createBootScene(canvas:HTMLCanvasElement,opts:BootSceneOptions):BootScene{
 const coarse=opts.coarse,reduced=opts.reducedMotion,detail=coarse?'phone':'desktop';
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default',preserveDrawingBuffer:false});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0,0);
 const dpr=()=>Math.min(window.devicePixelRatio||1,coarse?1.5:2);
 const stats={rafs:0,frames:0,bakes:0,atlasUploads:0,calls:0,triangles:0};
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,1,.1,60);
 const pm=new T.PMREMGenerator(renderer);const studio=studioScene();const env=pm.fromScene(studio,.04).texture;pm.dispose();disposeScene(studio);
 scene.environment=env;scene.environmentIntensity=1;
 // a gentle key for form and a cool rim; the soft highlights come from the studio's big softboxes (no single hard blob)
 const key=new T.DirectionalLight(0xfff1e0,1.05);key.position.set(-3,6,5);scene.add(key);
 const rimL=new T.DirectionalLight(0xdfeeff,.45);rimL.position.set(5,2.5,-4);scene.add(rimL);

 /* ---- materials ---- */
 const BAKE=coarse?1024:2048;
 const baker=createBaker(renderer,BAKE);
 const upperMat=new T.MeshPhysicalMaterial({map:baker.albedo.texture,normalMap:baker.normal.texture,normalScale:new T.Vector2(1,1),clearcoat:.001,sheen:.001,sheenColor:new T.Color(1,1,1)});
 const upperRough=texelRoughness(upperMat,'upper');
 upperMat.onBeforeCompile=sh=>{
  upperRough(sh);
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 sampledDiffuseColor=texture2D(map,vMapUv);diffuseColor.rgb*=sampledDiffuseColor.rgb;float bootMask=sampledDiffuseColor.a;\n#else\n float bootMask=1.;\n#endif')
   .replace('#include <metalnessmap_fragment>','float metalnessFactor=metalness*bootMask;')
   .replace('#include <lights_physical_fragment>',T.ShaderChunk.lights_physical_fragment.replace('material.clearcoat = clearcoat;','material.clearcoat = clearcoat*bootMask;'))
   // iridescent-lite: a hue that slides with the viewing angle, strongest at grazing angles
   .replace('#include <opaque_fragment>','{float nv=clamp(dot(normal,normalize(vViewPosition)),0.,1.);float fr=pow(1.-nv,1.6);\n vec3 rainbow=.5+.5*cos(6.2831*(nv*.9+vec3(0.,.33,.67)));\n outgoingLight=mix(outgoingLight,outgoingLight*.6+rainbow*(.22+.5*fr),uIrid*bootMask*(.45+.55*fr));}\n#include <opaque_fragment>')
   .replace('void main() {','uniform float uIrid;\nvoid main() {');
  sh.uniforms.uIrid=irid;
 };
 const irid={value:0};upperMat.userData.irid=irid;
 upperMat.customProgramCacheKey=()=>'boot-upper-v3';
 /*
  * The plate: its colour (soleplate) tinted by the plate art, plus the zone texture (plateTextures): red mixes in the plate's
  * second colour, blue a see-through (smoky, frosted) look, green the dark open windows. Uniforms only: a colour change never
  * recompiles; the zone texture swaps with the model.
  */
 const soleMat=new T.MeshPhysicalMaterial({color:0xffffff,clearcoat:.001});const soleRough=texelRoughness(soleMat,'sole');
 const soleU={uZone:{value:null as T.Texture|null},uPlate2:{value:new T.Color()},uDark:{value:new T.Color()}};
 soleMat.onBeforeCompile=sh=>{soleRough(sh);Object.assign(sh.uniforms,soleU);
  sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform sampler2D uZone;uniform vec3 uPlate2,uDark;\nvoid main() {')
   .replace('#include <map_fragment>','#ifdef USE_MAP\n{vec3 zm=texture2D(uZone,vMapUv).rgb;vec3 c=mix(diffuseColor.rgb,uPlate2,zm.r);float lum=dot(c,vec3(.2126,.7152,.0722));\n vec3 fr=lum>.25?c*.5+vec3(.02):mix(c,vec3(.42,.45,.5),.45);c=mix(c,fr,zm.b);diffuseColor.rgb=mix(c,uDark,zm.g);}\n#endif\n#include <map_fragment>');};
 soleMat.customProgramCacheKey=()=>'boot-sole-v2';
 /*
  * Studs: one material for the body, the metal SG tips and contrast tips. aStud.x runs 0 (plate) → 1 (tip), aStud.y = 1 on metal
  * tips; the tip colour, metalness and roughness come from uniforms, so a stud finish change never recompiles (except the
  * one-off switch to see-through, which needs blending).
  */
 const studMat=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.6,clearcoat:.001,clearcoatRoughness:.3});
 const studU={uTipCol:{value:new T.Color(0xd9dde2)},uTipMetal:{value:1},uTipRough:{value:NATURAL_ROUGHNESS.metalTip as number},uTipOn:{value:0}};
 studMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,studU);
  sh.vertexShader=sh.vertexShader.replace('void main() {','attribute vec2 aStud;varying vec2 vStud;\nvoid main() {vStud=aStud;');
  sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform vec3 uTipCol;uniform float uTipMetal,uTipRough,uTipOn;varying vec2 vStud;\nvoid main() {')
   .replace('#include <color_fragment>','#include <color_fragment>\n float tipM=max(vStud.y,uTipOn*smoothstep(.6,.63,vStud.x));diffuseColor.rgb=mix(diffuseColor.rgb,uTipCol,tipM);diffuseColor.a=mix(diffuseColor.a,1.,tipM);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n metalnessFactor=mix(metalnessFactor,uTipMetal,tipM);')
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,uTipRough,tipM);');};
 studMat.customProgramCacheKey=()=>'boot-studs-v1';
 const METAL_TIP=new T.Color(0xd9dde2);
 function applyStudFinish(f:StudFinish,studs:string,tips:string,type:StudType){
  const metalTips=type==='sg'||type==='sgmix',m=studMat;
  const sp=studFinishParams(f);m.color.set(studs);m.metalness=sp.metalness;m.roughness=sp.roughness;m.clearcoat=Math.max(.001,sp.clearcoat);m.clearcoatRoughness=.4;
  const see=f==='translucent';if(m.transparent!==see){m.transparent=see;m.needsUpdate=true;}m.opacity=see?.66:1;m.depthWrite=true;
  // metal SG tips stay metal (a contrast colour anodises them); other layouts get a painted contrast tip on request
  studU.uTipOn.value=!metalTips&&f==='tipped'?1:0;
  (studU.uTipCol.value as T.Color).copy(f==='tipped'?new T.Color(tips):METAL_TIP);
  studU.uTipMetal.value=metalTips?1:f==='chrome'?1:0;studU.uTipRough.value=metalTips?NATURAL_ROUGHNESS.metalTip:f==='matte'?.75:.4;
 }
 // woven flat laces (matte) and the eyelet rings (vertex colour: a darker tone of the lace colour)
 const laceMat=new T.MeshStandardMaterial({color:0xffffff,roughness:NATURAL_ROUGHNESS.lace,vertexColors:true});

 /* ---- shadow ---- */
 const sc=document.createElement('canvas');sc.width=256;sc.height=128;const sg=sc.getContext('2d')!;
 /**
  * A soft contact shadow shaped to THIS boot's own footprint (fixed Oct 13 2026; user: "the shadow is impacting this view" — a
  * fixed-radius ambient pool used to flood almost the whole plane (nearly its full width and height) no matter how small the
  * footprint was, reading as a big dark blob detached from the boot — offset from the sole, at odds with its angle, darkening
  * the ground past the toe. Now: a soft halo sized to the footprint's own bounding box (so it never outgrows the sole it
  * belongs to) plus a tight, lighter core — stacked, growing footprint outlines, a cheap blur — right under the plate. No
  * mipmaps: seen at a grazing angle, the smaller mips would average the gradient away.
  */
 const shadowTex=new T.CanvasTexture(sc);
 const SHADOW_W=3.5,SHADOW_H=1.25;
 function drawShadow(){
  sg.setTransform(1,0,0,1,0,0);sg.clearRect(0,0,256,128);
  const X=(x:number)=>128+x/SHADOW_W*256,Zc=(z:number)=>64+z/SHADOW_H*128;
  // the sole outline in canvas space (also the i=0, tightest ring below)
  const outline:[number,number][]=[];
  for(let k=0;k<=40;k++){const s=k/40,p=plan(s);outline.push([X(sx(s)),Zc(p.zc+p.lat)]);}
  for(let k=40;k>=0;k--){const s=k/40,p=plan(s);outline.push([X(sx(s)),Zc(p.zc-p.med)]);}
  let minX=256,maxX=0,minZ=128,maxZ=0;for(const [x,z] of outline){if(x<minX)minX=x;if(x>maxX)maxX=x;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;}
  const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,rx=Math.max(4,(maxX-minX)/2),rz=Math.max(3,(maxZ-minZ)/2);
  // a soft halo sized to the footprint's own box (not the whole plane): grounds the boot without spilling past it
  sg.save();sg.translate(cx,cz);sg.scale(1,(rz*1.55)/(rx*1.22));
  const halo=sg.createRadialGradient(0,0,0,0,0,rx*1.22);
  halo.addColorStop(0,'rgba(30,24,14,.15)');halo.addColorStop(.55,'rgba(30,24,14,.06)');halo.addColorStop(1,'rgba(30,24,14,0)');
  sg.fillStyle=halo;sg.beginPath();sg.arc(0,0,rx*1.22,0,Math.PI*2);sg.fill();sg.restore();
  // the tight core: stacked, growing footprint outlines (a cheap blur), densest right under the sole, lighter overall than before
  for(let i=5;i>=0;i--){const g=1+i*.028;sg.beginPath();for(let k=0;k<=40;k++){const s=k/40,p=plan(s);const x=X(sx(s)*g),z=Zc((p.zc+p.lat)*g);k?sg.lineTo(x,z):sg.moveTo(x,z);}
   for(let k=40;k>=0;k--){const s=k/40,p=plan(s);sg.lineTo(X(sx(s)*g),Zc((p.zc-p.med)*g));}sg.closePath();sg.fillStyle=`rgba(26,20,12,${.03+.012*(5-i)})`;sg.fill();}
  shadowTex.needsUpdate=true;
 }shadowTex.colorSpace=T.SRGBColorSpace;shadowTex.generateMipmaps=false;shadowTex.minFilter=T.LinearFilter;
 // DoubleSide: the pair's left shadow is mirrored (negative z scale, matching the left boot's own mirroring below) which flips
 // its winding; without this it would cull itself away.
 const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const shadowGeo=new T.PlaneGeometry(SHADOW_W,SHADOW_H).rotateX(-Math.PI/2);
 const shadows=[new T.Mesh(shadowGeo,shadowMat),new T.Mesh(shadowGeo,shadowMat)];for(const s of shadows){s.renderOrder=-1;scene.add(s);}

 /* ---- boot meshes (right, and the mirrored left) ---- */
 const pivot=new T.Group();scene.add(pivot);
 type Boot={group:T.Group;upper:T.Mesh;sole:T.Mesh;studs:T.Mesh|null;laces:T.Mesh};
 const mkBoot=(left:boolean):Boot=>{const group=new T.Group();if(left)group.scale.z=-1;pivot.add(group);
  const upper=new T.Mesh(new T.BufferGeometry(),upperMat),sole=new T.Mesh(new T.BufferGeometry(),soleMat),laces=new T.Mesh(new T.BufferGeometry(),laceMat);
  group.add(upper,sole,laces);return {group,upper,sole,laces,studs:null};};
 const right=mkBoot(false),left=mkBoot(true);left.group.visible=false;
 type Built={upper:UpperGeometry;laces:T.BufferGeometry};
 let geoms:Built|null=null;
 /** Built uppers by model|collar|laces (least recently used first). */
 const SHAPE_CACHE=6,shapes=new Map<string,Built>();
 const pickMesh=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({side:T.DoubleSide}));pickMesh.updateMatrixWorld();
 let groundY=-.2,centre=new T.Vector3();

 /* ---- state ---- */
 let design:BootDesign|null=null,shapeKey='',studKey='',model:BootModel='speed',bakeKey='',atlasKey='',selected:string|null=null,editing=false,pair=false;
 let needBake=false,disposed=false,paused=document.hidden;
 const uni=baker.uniforms;
 // decal slots: design decals + personal ones (heel text, flag badge)
 type Placed={id:string;zone:DecalZone;x:number;y:number;size:number;rot:number;key:string;kind:0|1|2;tint:string|null;aspect:number};
 let placed:Placed[]=[],placedIds:string[]=[];
 const atlasCanvas=document.createElement('canvas');atlasCanvas.width=1024;atlasCanvas.height=1024;const ag=atlasCanvas.getContext('2d')!;
 const atlasTex=new T.CanvasTexture(atlasCanvas);atlasTex.colorSpace=T.NoColorSpace;atlasTex.premultiplyAlpha=true;atlasTex.anisotropy=4;atlasTex.generateMipmaps=true;atlasTex.minFilter=T.LinearMipmapLinearFilter;
 uni.uAtlas.value=atlasTex;
 const rects=new Map<string,T.Vector4>();let atlasJob=0,atlasTimer:ReturnType<typeof setTimeout>|undefined;
 const imgCache=new Map<string,Promise<HTMLImageElement>>();
 const img=(src:string)=>{let p=imgCache.get(src);if(!p){p=loadImage(src);imgCache.set(src,p);}return p;};

 function itemFor(p:Placed):AtlasItem{
  const [kind,ref]=p.key.split(':');
  if(kind==='sticker')return {key:p.key,w:256,h:256,draw:async(g,x,y)=>{const i=await img(stickerDataUrl(ref as StickerId));g.drawImage(i,x+12,y+12,232,232);}};
  if(kind==='flag'||kind==='badge')return {key:p.key,w:256,h:192,draw:async(g,x,y)=>{const i=await img(flagUrl(ref));
   const r=18,b=kind==='badge'?9:11,m=12,W=256-2*m,H=192-2*m;g.save();g.beginPath();g.roundRect(x+m,y+m,W,H,r);g.fillStyle=kind==='badge'?'#f4f1e8':'#fffaf0';g.fill();g.beginPath();g.roundRect(x+m+b,y+m+b,W-2*b,H-2*b,r-6);g.clip();g.drawImage(i,x+m+b,y+m+b,W-2*b,H-2*b);g.restore();}};
  if(kind==='num')return {key:p.key,w:256,h:256,draw:(g,x,y)=>{g.save();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';const px=fitText(g,ref,n=>`900 ${n}px "Arial Black",Arial,Helvetica,sans-serif`,220,200);g.font=`900 ${px}px "Arial Black",Arial,Helvetica,sans-serif`;g.fillText(ref,x+128,y+138);g.restore();}};
  // text: quotes in the island brush, the name in heavy capitals
  const text=kind==='quote'?(QUOTES.find(q=>q.id===ref)?.text??''):ref;
  return {key:p.key,w:512,h:128,draw:(g,x,y)=>{g.save();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
   if(kind==='quote'){const px=fitText(g,text,n=>`${n}px IslandBrush,"Arial Black",sans-serif`,480,96);g.font=`${px}px IslandBrush,"Arial Black",sans-serif`;g.fillText(text,x+256,y+70);}
   else{const t=text.toUpperCase();const font=(n:number)=>`900 ${n}px "Arial Black",Arial,Helvetica,sans-serif`;const px=fitText(g,t,font,490,96);g.font=font(px);
    (g as CanvasRenderingContext2D&{letterSpacing?:string}).letterSpacing='4px';g.fillText(t,x+256,y+68);}
   g.restore();}};
 }
 /** Repack the atlas when the set of images changes (debounced; text typing waits a beat). */
 function scheduleAtlas(){clearTimeout(atlasTimer);atlasTimer=setTimeout(rebuildAtlas,90);}
 async function rebuildAtlas(){
  const job=++atlasJob,items:AtlasItem[]=[],seen=new Set<string>();for(const p of placed)if(!seen.has(p.key)){seen.add(p.key);items.push(itemFor(p));}
  if(items.some(i=>i.key.startsWith('quote:')))await document.fonts?.load('80px IslandBrush').catch(()=>{});
  // 512×256 blocks: two squares side by side, or two text strips stacked.
  const next=new Map<string,T.Vector4>();const jobs:Promise<void|void[]>[]=[];
  ag.clearRect(0,0,1024,1024);
  let block=0,slot=0,slotKind:'sq'|'tx'|null=null;
  const blockXY=(b:number)=>({x:(b%2)*512,y:Math.floor(b/2)*256});
  for(const it of items){
   const kind=it.w===512?'tx':'sq';
   if(slotKind!==kind||slot>=2){if(slotKind!==null)block++;slot=0;slotKind=kind;}
   if(block>=8)break;
   const {x:bx,y:by}=blockXY(block),x=kind==='sq'?bx+slot*256:bx,y=kind==='sq'?by:by+slot*128;slot++;
   next.set(it.key,new T.Vector4(x/1024,1-(y+it.h)/1024,it.w/1024,it.h/1024));
   jobs.push(Promise.resolve(it.draw(ag,x,y)).catch(err=>console.warn('boot sticker',it.key,err)));
  }
  await Promise.all(jobs);if(job!==atlasJob||disposed)return;
  rects.clear();for(const [k,v] of next)rects.set(k,v);
  atlasTex.needsUpdate=true;stats.atlasUploads++;updateDecals();invalidate();
 }

 /* ---- geometry ---- */
 function rebuildShape(d:BootDesign){
  const k=d.model+'|'+d.collar+'|'+d.laces;if(k===shapeKey)return;shapeKey=k;
  let built=shapes.get(k);
  if(built)shapes.delete(k);
  else{built={upper:buildUpperGeometry({collar:d.collar,laces:d.laces,studs:d.studs,detail}),laces:buildLacesGeometry()};
   // evict the oldest shape that is not on screen
   while(shapes.size>=SHAPE_CACHE){const [ok,ob]=shapes.entries().next().value as [string,Built];shapes.delete(ok);if(ob!==geoms){ob.upper.geometry.dispose();ob.upper.flipGeometry.dispose();ob.laces.dispose();}}}
  shapes.set(k,built);geoms=built;
  right.upper.geometry=built.upper.geometry;left.upper.geometry=built.upper.flipGeometry;
  right.laces.geometry=left.laces.geometry=built.laces;
  pickMesh.geometry=built.upper.geometry;
  // the shape's lacing and features for the bake
  const sh=useShape(d.model),eyes=eyeletPoints();
  for(let i=0;i<MAX_EYELETS;i++)(uni.uEye.value as T.Vector3[])[i].copy(eyes[i]??new T.Vector3(99,99,99));
  (uni.uLace.value as T.Vector4).set(sh.laceC,sh.eyes.s0,sh.eyes.s1,sh.eyes.hw);(uni.uFeat.value as T.Vector4).set(sh.feat.quilt,sh.feat.grid,sh.feat.grip,sh.feat.panel);uni.uToeCap.value=sh.feat.toecap;(uni.uHeelL.value as T.Vector4).set(...sh.look.heelLine);(uni.uSide.value as T.Vector2).set(sh.look.waveStitch,sh.look.heelTab);(uni.uFeat2.value as T.Vector4).set(sh.feat.pads,sh.feat.wrap,sh.relief.ribs>0?1:0,sh.relief.cage>0?1:0);drawShadow();
  needBake=true;
 }
 /** Plate + studs + plate art by model|studs (least recently used first): a model or stud switch back costs nothing. */
 type StudBuilt={sole:T.BufferGeometry;studs:T.BufferGeometry|null;tex:{map:T.Texture;normal:T.Texture;zone:T.Texture;rubber:boolean};ground:number};
 const STUD_CACHE=6,studCache=new Map<string,StudBuilt>();let curStud:StudBuilt|null=null;
 const freeStud=(sb:StudBuilt)=>{sb.sole.dispose();sb.studs?.dispose();sb.tex.map.dispose();sb.tex.normal.dispose();sb.tex.zone.dispose();};
 function rebuildStuds(type:StudType){
  const k=type+'|'+model;if(k===studKey)return;studKey=k;
  for(const b of [right,left]){if(b.studs){b.group.remove(b.studs);b.studs=null;}}
  let sb=studCache.get(k);
  if(sb)studCache.delete(k);
  else{sb={sole:buildSoleGeometry(type,detail),studs:buildStudsGeometry(type,detail),tex:plateTextures(type,detail),ground:studGround(type)};
   while(studCache.size>=STUD_CACHE){const [ok,ob]=studCache.entries().next().value as [string,StudBuilt];studCache.delete(ok);if(ob!==curStud)freeStud(ob);}}
  studCache.set(k,sb);const prev=curStud;curStud=sb;if(prev&&prev!==sb&&![...studCache.values()].includes(prev))freeStud(prev);
  right.sole.geometry=left.sole.geometry=sb.sole;
  for(const b of [right,left])if(sb.studs){b.studs=new T.Mesh(sb.studs,studMat);b.group.add(b.studs);}
  soleMat.map=sb.tex.map;soleMat.normalMap=sb.tex.normal;soleU.uZone.value=sb.tex.zone;soleMat.needsUpdate=true;
  // ground = the lowest stud tip (or the flat sole)
  groundY=sb.ground;
  layout();
 }
 /** Centre the boot(s) in the pivot and place the shadows. */
 function layout(){
  centre.set(0,(groundY+.95)/2,0);
  right.group.position.set(-centre.x,-centre.y,pair?.62:0);
  left.group.position.set(-centre.x-.3,-centre.y,-.62);left.group.visible=pair;
  shadows[1].visible=pair;
 }

 /* ---- decals ---- */
 const ray=new T.Raycaster(),tmpV=new T.Vector3(),tmpN=new T.Vector3();
 const ctx=():ZoneCtx=>({collar:design?.collar??'low',laces:design?.laces??'visible'});
 function hitZone(zone:DecalZone,x:number,y:number){
  const r=zoneRay(zone,x,y,ctx());ray.set(r.o,r.d);ray.far=6;const hits=ray.intersectObject(pickMesh,false);
  const zA=pickMesh.geometry.getAttribute('aZone') as T.BufferAttribute;
  const h=hits.find(h=>decalPart(Math.round(zA.getW(h.face!.a)),zA.getY(h.face!.a),zA.getZ(h.face!.a)));
  return h?{p:h.point.clone(),d:r.d,up:r.up}:null;
 }
 function updateDecals(){
  const C=uni.uDC.value as T.Vector3[],A=uni.uDA.value as T.Vector3[],U=uni.uDU.value as T.Vector3[],S=uni.uDS.value as T.Vector4[],R=uni.uDR.value as T.Vector4[],TT=uni.uDT.value as T.Vector4[];
  let n=0,sel=-1;placedIds=[];
  for(const p of placed){if(n>=MAX_DECALS)break;const rect=rects.get(p.key);if(!rect)continue;const h=hitZone(p.zone,p.x,p.y);if(!h)continue;
   const base=ZONE_SIZE[p.zone]*p.size,hw=p.aspect>=1?base*Math.min(2.1,Math.sqrt(p.aspect)*1.05):base,hh=hw/p.aspect;
   C[n].copy(h.p);A[n].copy(h.d);const up=h.up.clone().applyAxisAngle(h.d,-p.rot*Math.PI/180);U[n].copy(up.sub(h.d.clone().multiplyScalar(up.dot(h.d))).normalize());
   S[n].set(hw,hh,p.kind,0);R[n].copy(rect);if(p.tint)hexToV(p.tint,TT[n]);else TT[n].set(1,1,1,0);
   if(p.id===selected&&editing)sel=n;placedIds.push(p.id);n++;}
  uni.uDCount.value=n;uni.uSel.value=sel;needBake=true;invalidate();
 }
 function placedFrom(d:BootDesign){
  const list:Placed[]=d.decals.map(x=>({id:x.id,zone:x.zone,x:x.x,y:x.y,size:x.size,rot:x.rot,kind:0,tint:x.kind==='quote'?(x.tint??'#f6f3ea'):null,
   key:`${x.kind}:${x.ref}`,aspect:x.kind==='quote'?4:x.kind==='flag'?4/3:1}));
  const heelHex=d.colors.heel,thread=lumOf(heelHex)>.55?'#18191d':'#f6f3ea';
  const flagHeel=d.flag&&d.flagSpot==='heel';
  if(d.heelText==='name'&&d.name)list.push({id:'__name',zone:'heel',x:0,y:flagHeel?-.6:-.1,size:1.35,rot:0,kind:1,tint:thread,key:`name:${d.name}`,aspect:4});
  if(d.heelText==='number'&&d.number!=null)list.push({id:'__num',zone:'heel',x:0,y:flagHeel?-.55:-.1,size:flagHeel?1:1.4,rot:0,kind:1,tint:thread,key:`num:${d.number}`,aspect:1});
  if(d.flag)list.push({id:'__flag',zone:d.flagSpot==='heel'?'heel':'tongue',x:0,y:d.flagSpot==='heel'?.5:0,size:d.flagSpot==='heel'?1.05:.8,rot:0,kind:2,tint:null,key:`badge:${d.flag}`,aspect:4/3});
  return list;
 }

 /* ---- design ---- */
 /** The plate's second colour: the first of the pattern, heel, stud, side and toe colours that stands apart from the soleplate
  *  (so a two-tone plate always reads), and the window tone: near black, or steel on a dark plate. */
 function plateColours(d:BootDesign){const sp=new T.Color(d.colors.soleplate),c=new T.Color();
  const far=(hex:string)=>{c.set(hex);return Math.hypot(c.r-sp.r,c.g-sp.g,c.b-sp.b)>.3;};
  const p2=[d.colors.accent,d.colors.heel,d.colors.studs,d.colors.mid,d.colors.toe,'#f6f3ea','#18191d'].find(far)!;
  soleU.uPlate2.value.set(p2);soleU.uDark.value.set(lumOf(d.colors.soleplate)<.2?'#4a4e56':'#16171b');}
 const col=(hex:string)=>new T.Color(hex),WHITE=new T.Color(1,1,1);
 function setDesign(d:BootDesign){
  design=d;model=d.model;useShape(d.model);rebuildShape(d);rebuildStuds(d.studs);
  (uni.uToe.value as T.Color).copy(col(d.colors.toe));(uni.uMid.value as T.Color).copy(col(d.colors.mid));(uni.uHeel.value as T.Color).copy(col(d.colors.heel));
  (uni.uCollar.value as T.Color).copy(col(d.colors.collar));(uni.uLaces.value as T.Color).copy(col(d.colors.laces));(uni.uAccent.value as T.Color).copy(col(d.colors.accent));
  uni.uPattern.value=['solid','fade','speckle','stripes','camo','zigzag'].indexOf(d.pattern);uni.uUpper.value=['knit','synthetic','leather'].indexOf(d.upper);uni.uLaced.value=d.laces==='visible'?1:d.laces==='covered'?-1:0;
  applyFinish(upperMat,d.finish,d.upper,false);applyFinish(soleMat,d.finish,d.upper,true,curStud?.tex.rubber);
  upperMat.sheenColor.set(d.colors.mid).lerp(WHITE,.45);
  soleMat.color.set(d.colors.soleplate);plateColours(d);applyStudFinish(d.studFinish,d.colors.studs,d.colors.tips,d.studs);laceMat.color.set(d.colors.laces);
  for(const b of [right,left])b.laces.visible=d.laces==='visible';
  placed=placedFrom(d);
  const ak=[...new Set(placed.map(p=>p.key))].join('|');if(ak!==atlasKey){atlasKey=ak;scheduleAtlas();}
  const bk=JSON.stringify([d.model,d.colors,d.pattern,d.upper,d.laces,d.collar,placed,selected,editing]);if(bk!==bakeKey){bakeKey=bk;updateDecals();}
  invalidate();
 }

 /* ---- camera, orientation, loop ---- */
 const q=new T.Quaternion(),omega=new T.Vector3(),tq=new T.Quaternion(),tv=new T.Vector3();
 const VIEWS:Record<BootView,[number,number,number?]>={hero:[-.5,.2],side:[0,.08],inside:[Math.PI,.08],top:[-.35,1.05],heel:[1.42,.14],sole:[-.25,-1.35,.15],front:[-1.25,.18],tongue:[-.9,.55]};
 const viewQ=(v:BootView)=>{const [yaw,pitch,roll=0]=VIEWS[v];return new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,roll,'XYZ'));};
 let tween:{from:T.Quaternion;to:T.Quaternion;t:number;dur:number}|null=null;
 let intro:{t:number;dur:number;start:T.Quaternion}|null=null;
 let zoom=1,zoomTarget=1,held=false,frame=0,last=0,slot=0;const capMs=studioFrameMs();
 q.copy(viewQ('hero'));
 if(!reduced){intro={t:0,dur:3.4,start:q.clone()};}
 function fit(){
  const w=canvas.clientWidth||1,h=canvas.clientHeight||1;camera.aspect=w/h;
  const span=(pair?3.7:3.15)*(coarse?.94:1),tH=Math.tan(T.MathUtils.degToRad(camera.fov/2));
  const distW=span/2/(tH*camera.aspect),distH=1.9/2/tH;const dist=Math.max(distW,distH)*1.08/zoom;
  camera.position.set(0,dist*.16,dist);camera.lookAt(0,-.05,0);camera.updateProjectionMatrix();
 }
 function resize(){const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);fit();invalidate();}
 function updateShadows(){
  const fwd=tv.set(1,0,0).applyQuaternion(q);const yaw=Math.atan2(-fwd.z,fwd.x);const upY=clamp(new T.Vector3(0,1,0).applyQuaternion(q).y,0,1);
  const op=upY**3;shadowMat.opacity=op;
  // also tighten the footprint as the boot tilts up (the Sole and Heel views, or any steep pose): a flat, yaw-only shadow would
  // otherwise keep its full length under a boot the camera now sees foreshortened, reading as an oversized smudge beside it
  const grow=.45+.55*upY;
  // the lowest point of the boot under the current turn
  const g=new T.Vector3(0,groundY-centre.y,0);
  [right,left].forEach((b,i)=>{const s=shadows[i];const p=new T.Vector3(0,0,b.group.position.z).applyQuaternion(q);s.position.set(p.x,g.y-.01,p.z);s.rotation.y=yaw;s.scale.set(grow,1,i?-grow:grow);s.visible=op>.01&&(i===0||pair);});
 }
 function render(){
  if(disposed||paused)return;
  if(needBake&&geoms){baker.bake(geoms.upper.geometry);needBake=false;stats.bakes++;}
  pivot.quaternion.copy(q);updateShadows();
  renderer.render(scene,camera);stats.frames++;stats.calls=renderer.info.render.calls;stats.triangles=renderer.info.render.triangles;
 }
 function step(now:number){
  frame=0;if(disposed||paused)return;stats.rafs++;
  // touch devices: 30 fps (an early vsync is skipped; nothing is scheduled once nothing moves)
  if(capMs){const next=frameCapSlot(now,slot,capMs);if(next<0){frame=requestAnimationFrame(step);return;}slot=next;}
  const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;let moving=held;
  if(intro){intro.t+=dt;const k=Math.min(1,intro.t/intro.dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
   q.copy(intro.start).premultiply(tq.setFromAxisAngle(tv.set(0,1,0),e*Math.PI*2));if(k>=1)intro=null;else moving=true;}
  if(tween){tween.t+=dt;const k=Math.min(1,tween.t/tween.dur),e=1-Math.pow(1-k,3);q.slerpQuaternions(tween.from,tween.to,e);if(k>=1)tween=null;else moving=true;}
  if(!held&&omega.lengthSq()>1e-6){const sp=omega.length();q.premultiply(tq.setFromAxisAngle(tv.copy(omega).normalize(),sp*dt));omega.multiplyScalar(Math.exp(-dt*3.2));if(omega.lengthSq()<4e-4)omega.set(0,0,0);else moving=true;}
  if(Math.abs(zoomTarget-zoom)>1e-3){zoom+=(zoomTarget-zoom)*Math.min(1,dt*14);fit();moving=true;}else if(zoom!==zoomTarget){zoom=zoomTarget;fit();}
  render();
  if(moving)frame=requestAnimationFrame(step);else last=0;
 }
 function kick(){if(!frame&&!disposed&&!paused){last=0;frame=requestAnimationFrame(step);}}
 /** One frame for a static change (batched into the next animation frame). */
 function invalidate(){kick();}
 const onVis=()=>{paused=document.hidden;if(paused){cancelAnimationFrame(frame);frame=0;}else invalidate();};
 document.addEventListener('visibilitychange',onVis);
 const ro=new ResizeObserver(()=>resize());ro.observe(canvas);

 /* ---- input ---- */
 const pointers=new Map<number,{x:number;y:number}>();
 let mode:'none'|'turn'|'decal'|'pinch'='none',downAt=0,downX=0,downY=0,moved=0,lastTap=0,lastMoveT=0;
 let vel={x:0,y:0},stepAcc={x:0,y:0};
 let pinch0:{d:number;a:number;zoom:number;size:number;rot:number}|null=null;
 let drag:{id:string;zone:DecalZone}|null=null;
 const ndc=new T.Vector2();
 function pick(cx:number,cy:number){
  const r=canvas.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  // into the right boot's local frame
  pivot.updateMatrixWorld();const inv=right.group.matrixWorld.clone().invert();const o=ray.ray.origin.clone().applyMatrix4(inv),d=ray.ray.direction.clone().transformDirection(inv);
  ray.set(o,d);ray.far=100;const hit=ray.intersectObject(pickMesh,false)[0];if(!hit)return null;
  const zA=pickMesh.geometry.getAttribute('aZone') as T.BufferAttribute,part=zA.getW(hit.face!.a);
  const nA=pickMesh.geometry.getAttribute('normal') as T.BufferAttribute;
  tmpN.fromBufferAttribute(nA,hit.face!.a).add(tmpV.fromBufferAttribute(nA,hit.face!.b)).add(tmpV.fromBufferAttribute(nA,hit.face!.c)).normalize();
  const zs=pickMesh.geometry.getAttribute('aSurf') as T.BufferAttribute,f=hit.face!.a;
  return {p:hit.point.clone(),n:tmpN.clone(),part:Math.round(part),s:zA.getX(f),yr:zA.getY(f),rimd:zA.getZ(f),across:zs.getY(f)};
 }
 /** The decal (if any) under a point: in its own projected frame. */
 function decalAt(p:T.Vector3){
  const C=uni.uDC.value as T.Vector3[],A=uni.uDA.value as T.Vector3[],U=uni.uDU.value as T.Vector3[],S=uni.uDS.value as T.Vector4[];
  const ids=placedIds;
  for(let i=(uni.uDCount.value as number)-1;i>=0;i--){const d=p.clone().sub(C[i]),R=new T.Vector3().crossVectors(A[i],U[i]).normalize();
   if(Math.abs(d.dot(R))<S[i].x*1.15&&Math.abs(d.dot(U[i]))<S[i].y*1.15+.02&&Math.abs(d.dot(A[i]))<.25)return ids[i]??null;}
  return null;
 }
 const sel=()=>placed.find(p=>p.id===selected&&!p.id.startsWith('__'));
 function onDown(e:PointerEvent){
  canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  intro=null;tween=null;
  if(pointers.size===2){const [a,b]=[...pointers.values()];const s=sel();pinch0={d:Math.hypot(a.x-b.x,a.y-b.y),a:Math.atan2(b.y-a.y,b.x-a.x),zoom:zoomTarget,size:s?.size??1,rot:s?.rot??0};mode='pinch';drag=null;held=false;return;}
  downAt=performance.now();downX=e.clientX;downY=e.clientY;moved=0;vel={x:0,y:0};stepAcc={x:0,y:0};lastMoveT=downAt;
  mode='turn';
  if(editing&&selected){const s=sel();const h=pick(e.clientX,e.clientY);if(s&&h&&decalAt(h.p)===s.id){mode='decal';drag={id:s.id,zone:s.zone};}}
  if(mode==='turn'){held=true;omega.set(0,0,0);}
  kick();
 }
 function onMove(e:PointerEvent){
  const prev=pointers.get(e.pointerId);if(!prev)return;const dx=e.clientX-prev.x,dy=e.clientY-prev.y;prev.x=e.clientX;prev.y=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
  const now=performance.now(),dtm=Math.max(1,now-lastMoveT);lastMoveT=now;
  if(mode==='pinch'&&pointers.size===2&&pinch0){const [a,b]=[...pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),ang=Math.atan2(b.y-a.y,b.x-a.x);
   const s=editing?sel():undefined;
   if(s){s.size=clamp(pinch0.size*d/pinch0.d,.5,1.6);s.rot=clamp(pinch0.rot+(ang-pinch0.a)*180/Math.PI,-60,60);updateDecals();opts.onDecalMove?.(s.id,{x:s.x,y:s.y,size:s.size,rot:s.rot,zone:s.zone},false);}
   else{zoomTarget=clamp(pinch0.zoom*d/pinch0.d,.6,1.7);kick();}
   return;}
  if(mode==='decal'&&drag){const h=pick(e.clientX,e.clientY);const s=sel();if(h&&s){const {x,y}=zoneParams(drag.zone,h.p,ctx());s.x=x;s.y=y;updateDecals();opts.onDecalMove?.(s.id,{x,y,size:s.size,rot:s.rot,zone:s.zone},false);}return;}
  if(mode==='turn'){
   const h=canvas.clientHeight||1,k=3.2/h;
   if(moved>6)opts.onManualTurn?.();
   if(reduced){stepAcc.x+=dx;stepAcc.y+=dy;const stepPx=h*.12,STEP=Math.PI/8;
    while(Math.abs(stepAcc.x)>stepPx){const sgn=Math.sign(stepAcc.x);q.premultiply(tq.setFromAxisAngle(tv.set(0,1,0),sgn*STEP));stepAcc.x-=sgn*stepPx;}
    while(Math.abs(stepAcc.y)>stepPx){const sgn=Math.sign(stepAcc.y);q.premultiply(tq.setFromAxisAngle(tv.set(1,0,0),sgn*STEP));stepAcc.y-=sgn*stepPx;}
    invalidate();return;}
   q.premultiply(tq.setFromAxisAngle(tv.set(0,1,0),dx*k));q.premultiply(tq.setFromAxisAngle(tv.set(1,0,0),dy*k));
   vel={x:lerp(vel.x,dx/dtm*1000,.5),y:lerp(vel.y,dy/dtm*1000,.5)};kick();
  }
 }
 function onUp(e:PointerEvent){
  if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
  if(mode==='pinch'){if(pointers.size<2){const s=editing?sel():undefined;if(s)opts.onDecalMove?.(s.id,{x:s.x,y:s.y,size:s.size,rot:s.rot,zone:s.zone},true);mode=pointers.size?'none':'none';pinch0=null;}return;}
  const tap=moved<8&&performance.now()-downAt<350;
  if(mode==='decal'&&drag){const s=sel();if(s)opts.onDecalMove?.(s.id,{x:s.x,y:s.y,size:s.size,rot:s.rot,zone:s.zone},true);drag=null;mode='none';if(!tap)return;}
  held=false;mode='none';
  if(tap){
   const now=performance.now();
   if(now-lastTap<320){lastTap=0;resetView();return;}
   lastTap=now;
   const h=pick(e.clientX,e.clientY);
   if(!h){opts.onTap?.(null);}else{const zone=zoneAt(h.p,h.n,h.part);const {x,y}=zoneParams(zone,h.p,ctx());opts.onTap?.({zone,x,y,decal:decalAt(h.p),paint:paintAt({...h,laced:design?.laces==='visible'})});}
   kick();return;}
  if(!reduced){const h=canvas.clientHeight||1,k=3.2/h;const stale=performance.now()-lastMoveT>90;if(!stale)omega.set(vel.y*k,vel.x*k,0);if(omega.length()>14)omega.setLength(14);}
  kick();
 }
 function onWheel(e:WheelEvent){e.preventDefault();zoomTarget=clamp(zoomTarget*Math.exp(-e.deltaY*.0012),.6,1.7);kick();}
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
 canvas.addEventListener('wheel',onWheel,{passive:false});

 function setView(v:BootView,animate=true){intro=null;omega.set(0,0,0);const to=viewQ(v);if(!animate||reduced){tween=null;q.copy(to);invalidate();return;}tween={from:q.clone(),to,t:0,dur:.65};kick();}
 function resetView(){zoomTarget=1;setView('hero');}
 resize();

 return {
  stats,renderer,
  get debug(){return {scene,camera,shadows,pivot,uniforms:uni,placed:placedIds,rects:[...rects.keys()]};},
  setDesign,
  setSelected(id){if(id===selected)return;selected=id;if(design)setDesign(design);},
  setEditing(on){if(on===editing)return;editing=on;if(design)setDesign(design);},
  setView,resetView,
  setPair(on){if(on===pair)return;pair=on;layout();fit();invalidate();},
  pose(yaw,pitch){intro=null;tween=null;omega.set(0,0,0);q.setFromEuler(new T.Euler(pitch,yaw,0,'XYZ'));invalidate();},
  resize,
  dispose(){
   disposed=true;cancelAnimationFrame(frame);clearTimeout(atlasTimer);ro.disconnect();document.removeEventListener('visibilitychange',onVis);
   canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);canvas.removeEventListener('wheel',onWheel);
   for(const sb of new Set([...studCache.values(),...(curStud?[curStud]:[])]))freeStud(sb);studCache.clear();
   for(const b of new Set([...shapes.values(),...(geoms?[geoms]:[])])){b.upper.geometry.dispose();b.upper.flipGeometry.dispose();b.laces.dispose();}shapes.clear();
   (pickMesh.material as T.Material).dispose();shadowGeo.dispose();
   for(const m of [upperMat,soleMat,studMat,laceMat,shadowMat])m.dispose();
   for(const t of [atlasTex,shadowTex,env])t.dispose();
   baker.dispose();renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();
  },
 };
}
/** For the picker thumbnails and tests. */
export {STICKERS,FLAGS};
