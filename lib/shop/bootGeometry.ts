import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {BootModel,Collar,Laces,StudType} from './boots';
import {BOOT_PROFILES} from './bootProfiles';

/**
 * The procedural football boot (Oct 12 2026; reshaped the same day from a "bowling shoe" into a modern speed/control boot, then
 * given thirteen silhouettes, "models", the same day: user "need different variations of boots ... variation in shape").
 * Units are decimetres (a 27 cm boot is 2.7 long); x runs heel → toe, y is up, z is across with +z the outside (lateral) of a
 * right boot. Nothing is loaded: every part is computed from one analytic surface,
 *   P(s,φ)  s ∈ [0,1] heel → toe,  φ ∈ [0,π] from the inside sole edge, over the top, to the outside sole edge,
 * an elliptical section lofted along a foot-shaped plan (asymmetric: the toe points to the big-toe side) whose walls lean in as
 * they rise, lifted at the heel and sprung at the toe. Around the ankle the section is cut at the rim height R(s) and folds inward
 * into a lining pocket, so the upper is one continuous mesh with a real opening, padded rim and dark lining.
 *
 * Silhouettes: every number that makes the shape (plan, section height, collar line, toe spring and taper, lacing, tongue,
 * collars, heel counter, plate) lives in one Shape per model (SHAPES); `useShape(model)` makes one active and every function here
 * follows it. Real geometry makes the differences: fold-over tongues, rubber fins, a lace cover, sock and mid collars, a tall heel
 * clip; the bake (bootBake.ts) adds the flat ones (quilting, a strike pad, grip texture, a stitched panel, a toe cap).
 *
 * Draw calls: the upper (outer + lining + tongue or collar + fins or lace cover, merged; one baked texture), the soleplate (one
 * lofted mesh: edge, side walls, heel counter and toe bumper), the studs (ONE merged mesh per layout, metal tips included) and the
 * laces (merged flat tubes and eyelet rings).
 *
 * UV atlas (the bake in bootBake.ts paints it in this layout): u = arc length heel → toe; the inside wall fills v 0–.33 and the
 * outside wall .33–.66, meeting at the top centre; the lace cover .661–.672; the lining .675–.745; the fins .747–.758; the tongue
 * or the collar share v .76–1 (only one of them exists). `uvFlip` is the same atlas read for the mirrored left boot.
 */
export const BOOT_L=2.7;
export const S_THROAT=.4;
/** Asymmetric lacing on the modern shape: the lace line sits this far (dm, around the surface) toward the outside of the top
 * centre. Each shape has its own (shape().laceC): centred on the classics, far to the outside on the off-centre striker. */
export const LACE_C=.05;
const NY=2;
export const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
export const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** A smooth hump between a and b (0 outside, 1 in the middle). */
export const bump=(s:number,a:number,b:number)=>{const t=clamp((s-a)/(b-a),0,1);return Math.sin(Math.PI*t)**2;};

type Knots=readonly (readonly [number,number])[];
/** Monotone-ish Catmull-Rom through knots [s,value]. */
function spline(k:Knots,s:number){
 if(s<=k[0][0])return k[0][1];if(s>=k[k.length-1][0])return k[k.length-1][1];
 let i=0;while(i<k.length-2&&s>k[i+1][0])i++;
 const p0=k[Math.max(0,i-1)],p1=k[i],p2=k[i+1],p3=k[Math.min(k.length-1,i+2)];
 const t=(s-p1[0])/(p2[0]-p1[0]),t2=t*t,t3=t2*t;
 const m1=(p2[1]-p0[1])/(p2[0]-p0[0])*(p2[0]-p1[0]),m2=(p3[1]-p1[1])/(p3[0]-p1[0])*(p2[0]-p1[0]);
 return (2*t3-3*t2+1)*p1[1]+(t3-2*t2+t)*m1+(-2*t3+3*t2)*p2[1]+(t3-t2)*m2;
}
const scaleK=(k:Knots,f:number|((s:number)=>number)):Knots=>k.map(([s,v])=>[s,v*(typeof f==='number'?f:f(s))] as const);

/* ---------- Silhouettes ---------- */
export type TongueKind='slim'|'fold';
export type Shape={
 id:BootModel;
 lat:Knots;med:Knots;
 /** Toe taper: [start s, exponent] outside and inside; a lower exponent is a rounder, blunter toe. */
 taper:{lat:readonly [number,number];med:readonly [number,number]};
 hsec:Knots;rim:Knots;
 spring:number;heelLift:number;toeBack:number;lean:number;
 laceC:number;eyes:{n:number;s0:number;s1:number;hw:number};
 /** top = the tongue's top above the underside; a fold tongue turns forward over the laces down to s = flapTo, flapW wide. */
 tongue:{kind:TongueKind;top:number;w:number;flapTo:number;flapW:number};
 sockTop:number;midTop:number;
 /** Heel counter height (× the modern clip), toe wrap height (dm), plate thickness (dm). */
 heelCtr:number;toeWrap:number;soleT:number;
 fins:boolean;
 /** Bake features, 0–1: quilted toe, rubber strike pad, grip texture, stitched side panel, stitched toe cap, pebbled rubber pads on
  * both sides of the forefoot, a bandage-wrap relief. */
 feat:{quilt:number;grid:number;grip:number;panel:number;toecap:number;pads:number;wrap:number};
 /** The soleplate (research: docs/shop-boot-silhouettes.md "Soles"): its thickness, heel block, arch cut-out, side walls, edge. */
 plate:PlateSpec;
 /** The model's own stud positions ([s, f] with f −1 inside … 1 outside), heel and forefoot, and its era's blade style. */
 studSet:StudSet;
 /** Real 3D form of the upper's sides (dm along the outward normal; research: docs/shop-boot-silhouettes.md "Sides"). */
 relief:ReliefSpec;
 /** The heel colour block's front edge, s = a + b·yr + c·yr² + d·(1−yr)³ up the wall (yr 0 at the sole … 1 at the collar): upright,
  *  slanting forward, or a low crescent sweeping forward along the sole; a stitched wave line along the sides; a heel tab. */
 look:{heelLine:readonly [number,number,number,number];waveStitch:number;heelTab:number};
};
/**
 * t: plate thickness at the edge (dm); heel: how far the raised heel block stands below the plate; arch: how far the plate rises
 * under the midfoot (the arch cut-out); wallMid/wallToe/heelWrap: how high the plate's side wall wraps up the upper (dm above the
 * underside of the upper) along the sides, at the toe bumper and at the heel counter; flare: how far the edge stands out past
 * the upper; bevel: the edge's rounding; welt: a stitched sole edge (leather classics); rocker: the forefoot's curve.
 */
export type PlateKind='rubber'|'plate'|'chassis'|'frame'|'carbon'|'gum';
/**
 * Oct 13 2026 (second pass, user: "the soles still look too similar"): art = the model's own underside drawing (bootScene.ts
 * PLATE_ART: windows, spines, shanks, tread, two-tone zones); waist = how far the outline scoops in under the arch [inside,
 * outside] (dm: a slim racing waist vs a wide flat classic); wave = a scalloped plate edge (dm); heelIn = a narrower heel plate.
 */
export type PlateArt='stacked'|'ladder'|'wave'|'swirl'|'bridge'|'diagonal'|'gloss'|'spine'|'yspine'|'skeleton'|'cup'|'pods'|'chevron'|'rotor'|'gum';
export type PlateSpec={kind:PlateKind;t:number;heel:number;arch:number;wallMid:number;wallToe:number;heelWrap:number;flare:number;bevel:number;welt:boolean;rocker:number;wave:number;
 art:PlateArt;waist:readonly [number,number];heelIn:number};
/** Blade styles by era: rounded moulded (1960s–80s), slim (1990s), modern, the late-1990s small multi-directional cluster, triangles,
 *  chevrons, half-moons, and a cone/blade mix (mid-2000s power boots). */
export type BladeStyle='round'|'slim'|'modern'|'cluster'|'tri'|'chevron'|'halfmoon'|'mix';
type Pos=readonly [number,number];
/** [s, f, yaw: a number, 'e' along the edge, 't' tangent round the hub, 'r' pointing away from the hub, scale] */
export type StylePos=readonly [number,number,(number|'e'|'t'|'r')?,number?];
/**
 * A model's studs: heel and forefoot positions ([s, f], f −1 inside … 1 outside) for the round layouts; styleFore = its own
 * forefoot arrangement for the bladed layouts (a swirl cluster, a half-moon ring); fgFore = its own round-stud arrangement (a
 * rotational ring); round = cone or pod; hub = the centre the cluster turns round.
 */
export type StudSet={heel:readonly Pos[];fore:readonly Pos[];blade:BladeStyle;round?:'cone'|'pod';styleFore?:readonly StylePos[];fgFore?:readonly Pos[];hub?:Pos};
/**
 * overlay: toe and heel panels standing proud of the vamp; collar: padded ankle roll; cup: heel counter cup; seam: grooves at
 * the panel seams; puff: soft leather pillowing over the vamp; quilt: puffed rows between the toe's stitch lines; pad: a raised
 * strike pad; pads: pebbled rubber pads; panel: a stitched side saddle; toecap: an indoor toe cap; bands: bandage strips;
 * cage: a lace-cage edge; ribs: knit ridges over the instep; nz: section fullness [inside, outside] (the inside wall is flatter,
 * the outside rounder); bulge: forefoot volume; waist: the midfoot pinch.
 */
export type ReliefSpec={overlay:number;collar:number;cup:number;seam:number;puff:number;quilt:number;pad:number;pads:number;panel:number;toecap:number;bands:number;cage:number;ribs:number;nz:readonly [number,number];bulge:number;waist:number};
/** Half-widths of the plan (outside / inside): a slim heel, a pinched arch on the inside, the widest point at the big-toe joint. */
const LAT:Knots=[[0,.3],[.16,.31],[.3,.33],[.45,.385],[.6,.45],[.72,.482],[.85,.47],[1,.44]];
const MED:Knots=[[0,.3],[.16,.305],[.3,.3],[.45,.33],[.6,.415],[.72,.475],[.85,.48],[1,.47]];
/** Section height (the top above the underside of the upper); around the ankle it is the virtual top the rim cuts. */
const HSEC:Knots=[[0,.84],[.18,.84],[.3,.78],[.4,.655],[.5,.55],[.62,.44],[.74,.335],[.85,.24],[.93,.165],[1,.1]];
/** Rim (collar line) height above the underside, heel → throat: a small heel tab, dipping under the ankle bones. */
const RIM:Knots=[[0,.63],[.03,.635],[.1,.56],[.2,.47],[.28,.48],[.35,.55],[.4,.655]];
const NOFEAT={quilt:0,grid:0,grip:0,panel:0,toecap:0,pads:0,wrap:0};
/** The modern FG pattern: 4 round heel studs, 8 around the forefoot (plus a centre stud in some layouts). */
const HEEL4=[[.06,-.45],[.06,.45],[.17,-.66],[.17,.66]] as const;
const FORE8=[[.57,-.74],[.57,.74],[.69,-.76],[.69,.74],[.81,-.66],[.81,.6],[.92,-.32],[.92,.18]] as const;
const PLATE0:PlateSpec={kind:'chassis',t:.036,heel:.04,arch:.04,wallMid:.012,wallToe:.03,heelWrap:0,flare:.004,bevel:.009,welt:false,rocker:.006,wave:0,art:'gloss',waist:[.065,.022],heelIn:0};
const RELIEF0:ReliefSpec={overlay:.003,collar:.009,cup:.006,seam:.0015,puff:0,quilt:0,pad:0,pads:0,panel:0,toecap:0,bands:0,cage:0,ribs:0,nz:[2.75,2.05],bulge:.03,waist:.03};
const SPEED:Shape={plate:PLATE0,studSet:{heel:HEEL4,fore:FORE8,blade:'modern'},relief:RELIEF0,look:{heelLine:[.255,-.13,.03,0],waveStitch:0,heelTab:0},id:'speed',lat:LAT,med:MED,taper:{lat:[.6,.72],med:[.74,.66]},hsec:HSEC,rim:RIM,spring:.13,heelLift:.065,toeBack:.1,lean:.15,
 laceC:LACE_C,eyes:{n:6,s0:.43,s1:.68,hw:.078},tongue:{kind:'slim',top:.755,w:.1,flapTo:0,flapW:0},sockTop:1.08,midTop:.84,heelCtr:1,toeWrap:.032,soleT:.02,fins:false,feat:NOFEAT};
/** A fuller forefoot: the instep and the toe box rise by `d` toward the toe. */
const fuller=(d:number):Knots=>HSEC.map(([s,v])=>[s,v+d*smooth(.3,.8,s)] as const);
export const SHAPES:Record<BootModel,Shape>={
 speed:SPEED,
 // a full, rounded leather boot: centred lacing in a wide row, a quilted toe, a big fold-over tongue, a thicker sole
 classic:{...SPEED,id:'classic',lat:scaleK(LAT,1.03),med:scaleK(MED,1.02),taper:{lat:[.66,.5],med:[.78,.45]},
  hsec:[[0,.86],[.18,.86],[.3,.8],[.4,.69],[.5,.6],[.62,.505],[.74,.405],[.85,.315],[.93,.235],[1,.15]],rim:[[0,.66],[.03,.665],[.1,.59],[.2,.5],[.28,.51],[.35,.58],[.4,.69]],
  spring:.08,toeBack:.07,lean:.12,laceC:0,eyes:{n:6,s0:.435,s1:.7,hw:.088},tongue:{kind:'fold',top:.84,w:.11,flapTo:.585,flapW:.2},
  heelCtr:.45,toeWrap:.018,soleT:.03,feat:{...NOFEAT,quilt:1}},
 // low and slim, a long tongue flap that covers most of the laces, a plain stitched side panel
 retro:{...SPEED,id:'retro',lat:scaleK(LAT,.99),med:scaleK(MED,.99),taper:{lat:[.62,.6],med:[.76,.55]},
  hsec:[[0,.8],[.18,.8],[.3,.74],[.4,.625],[.5,.525],[.62,.425],[.74,.33],[.85,.25],[.93,.18],[1,.11]],rim:[[0,.6],[.03,.605],[.1,.53],[.2,.45],[.28,.46],[.35,.53],[.4,.625]],
  spring:.1,toeBack:.08,laceC:0,eyes:{n:6,s0:.43,s1:.68,hw:.074},tongue:{kind:'fold',top:.8,w:.105,flapTo:.665,flapW:.2},
  heelCtr:.4,toeWrap:.018,soleT:.028,feat:{...NOFEAT,panel:1}},
 // chunky: a high instep, a round toe, a huge fold-over tongue and rubber fins over the strike zone
 fins:{...SPEED,id:'fins',lat:scaleK(LAT,1.06),med:scaleK(MED,1.05),taper:{lat:[.64,.55],med:[.78,.5]},
  hsec:[[0,.88],[.18,.88],[.3,.83],[.4,.72],[.5,.635],[.62,.535],[.74,.425],[.85,.325],[.93,.235],[1,.145]],rim:[[0,.68],[.03,.685],[.1,.61],[.2,.53],[.28,.54],[.35,.61],[.4,.72]],
  spring:.09,toeBack:.07,lean:.1,laceC:0,eyes:{n:6,s0:.435,s1:.69,hw:.088},tongue:{kind:'fold',top:.9,w:.13,flapTo:.6,flapW:.24},
  heelCtr:.85,toeWrap:.026,soleT:.03,fins:true},
 // a running-spike shape: slim, low, a long pointed toe, big toe spring, few eyelets
 track:{...SPEED,id:'track',lat:scaleK(LAT,s=>.97-.05*smooth(.4,1,s)),med:scaleK(MED,s=>.97-.04*smooth(.4,1,s)),taper:{lat:[.56,.95],med:[.7,.9]},
  hsec:scaleK(HSEC,s=>1-.1*smooth(.35,.9,s)),rim:scaleK(RIM,.95),spring:.16,toeBack:.13,lean:.18,laceC:0,eyes:{n:5,s0:.44,s1:.66,hw:.07},
  tongue:{kind:'slim',top:.8,w:.095,flapTo:0,flapW:0},heelCtr:1.1,toeWrap:.03,soleT:.018},
 // low and narrow with a sharp toe, a raised cover over the laces and a tall external heel clip
 cage:{...SPEED,id:'cage',lat:scaleK(LAT,.96),med:scaleK(MED,.97),taper:{lat:[.6,.82],med:[.73,.78]},hsec:scaleK(HSEC,s=>1-.06*smooth(.4,.9,s)),
  spring:.12,laceC:.1,eyes:{n:6,s0:.43,s1:.7,hw:.07},tongue:{kind:'slim',top:.74,w:.095,flapTo:0,flapW:0},heelCtr:1.3,toeWrap:.03},
 // lacing swept far toward the outside, a clean instep with a rubber strike pad, a padded tongue
 offset:{...SPEED,id:'offset',lat:scaleK(LAT,1.02),med:scaleK(MED,1.02),taper:{lat:[.62,.62],med:[.76,.58]},hsec:fuller(.03),
  rim:[[0,.65],[.03,.655],[.1,.58],[.2,.49],[.28,.5],[.35,.57],[.4,.67]],spring:.11,laceC:.13,eyes:{n:7,s0:.43,s1:.74,hw:.07},
  tongue:{kind:'slim',top:.82,w:.11,flapTo:0,flapW:0},heelCtr:1,feat:{...NOFEAT,grid:1}},
 // a rounded, padded leather boot: a full round toe, quilted stitching on the vamp, a tall tongue standing up, centred laces
 feather:{...SPEED,id:'feather',lat:scaleK(LAT,1.01),med:scaleK(MED,1.01),taper:{lat:[.64,.52],med:[.78,.48]},
  hsec:[[0,.84],[.18,.84],[.3,.78],[.4,.67],[.5,.575],[.62,.48],[.74,.38],[.85,.29],[.93,.21],[1,.13]],rim:[[0,.65],[.03,.655],[.1,.58],[.2,.49],[.28,.5],[.35,.57],[.4,.67]],
  spring:.09,toeBack:.08,lean:.12,laceC:0,eyes:{n:6,s0:.43,s1:.7,hw:.075},tongue:{kind:'slim',top:.92,w:.11,flapTo:0,flapW:0},heelCtr:.45,toeWrap:.016,soleT:.022,feat:{...NOFEAT,quilt:1}},
 // a long tongue folded right down over the laces, a full leather forefoot with pebbled rubber pads on both sides
 longflap:{...SPEED,id:'longflap',lat:scaleK(LAT,1.03),med:scaleK(MED,1.03),taper:{lat:[.63,.58],med:[.77,.52]},
  hsec:[[0,.87],[.18,.87],[.3,.82],[.4,.705],[.5,.615],[.62,.515],[.74,.41],[.85,.31],[.93,.225],[1,.14]],rim:[[0,.67],[.03,.675],[.1,.6],[.2,.52],[.28,.53],[.35,.6],[.4,.705]],
  spring:.1,toeBack:.08,lean:.12,laceC:0,eyes:{n:6,s0:.435,s1:.7,hw:.084},tongue:{kind:'fold',top:.9,w:.125,flapTo:.725,flapW:.22},heelCtr:.8,toeWrap:.024,soleT:.028,feat:{...NOFEAT,pads:1}},
 // the thinnest of all: a very low, sharp upper like tape, a tiny plate, asymmetric laces, a tall slim heel clip
 wrap:{...SPEED,id:'wrap',lat:scaleK(LAT,s=>.96-.03*smooth(.4,1,s)),med:scaleK(MED,s=>.96-.02*smooth(.4,1,s)),taper:{lat:[.58,.88],med:[.72,.84]},
  hsec:scaleK(HSEC,s=>1-.14*smooth(.3,.9,s)),rim:scaleK(RIM,.9),spring:.15,toeBack:.12,lean:.2,laceC:.065,eyes:{n:6,s0:.44,s1:.68,hw:.064},
  tongue:{kind:'slim',top:.66,w:.085,flapTo:0,flapW:0},heelCtr:1.25,toeWrap:.02,soleT:.014},
 // soft leather with quilted padding over the vamp, a rounded toe, centred laces, a padded heel
 pro:{...SPEED,id:'pro',lat:scaleK(LAT,1.01),med:scaleK(MED,1.01),taper:{lat:[.63,.56],med:[.77,.5]},spring:.1,toeBack:.08,lean:.12,laceC:.01,eyes:{n:6,s0:.43,s1:.7,hw:.075},
  tongue:{kind:'slim',top:.85,w:.11,flapTo:0,flapW:0},heelCtr:.6,toeWrap:.016,soleT:.024,feat:{...NOFEAT,quilt:1}},
 // a textured knit boot with a mid-high sock collar, a rounded point and laces close to the centre
 knit:{...SPEED,id:'knit',lat:scaleK(LAT,1.01),med:scaleK(MED,1.01),taper:{lat:[.62,.62],med:[.76,.58]},spring:.11,laceC:.02,eyes:{n:6,s0:.44,s1:.69,hw:.07},sockTop:1.1,heelCtr:.6,feat:{...NOFEAT,grip:.6}},
 // a knit sock boot: a tall collar, a close upper, a pointed toe
 sock:{...SPEED,id:'sock',taper:{lat:[.6,.78],med:[.74,.7]},laceC:.035,eyes:{n:6,s0:.44,s1:.68,hw:.07},sockTop:1.24,heelCtr:.8},
 // laceless: a slightly fuller upper wrapped in bandage-like bands (relief only), a fine grip texture and a mid knit collar
 laceless:{...SPEED,id:'laceless',lat:scaleK(LAT,1.02),med:scaleK(MED,1.02),taper:{lat:[.62,.6],med:[.76,.55]},hsec:fuller(.02),spring:.11,laceC:0,midTop:.88,heelCtr:.7,feat:{...NOFEAT,grip:.4,wrap:1}},
 // a flat indoor shoe: wide, a tall round toe box, little toe spring, a gum toe bumper and a stitched toe cap
 indoor:{...SPEED,id:'indoor',lat:scaleK(LAT,s=>1.05+.03*smooth(.4,1,s)),med:scaleK(MED,s=>1.05+.03*smooth(.4,1,s)),taper:{lat:[.66,.42],med:[.8,.4]},
  hsec:[[0,.82],[.18,.82],[.3,.78],[.4,.67],[.5,.585],[.62,.5],[.74,.42],[.85,.35],[.93,.28],[1,.18]],rim:[[0,.64],[.03,.645],[.1,.58],[.2,.5],[.28,.51],[.35,.58],[.4,.67]],
  spring:.05,toeBack:.06,lean:.1,laceC:0,eyes:{n:6,s0:.43,s1:.7,hw:.085},tongue:{kind:'slim',top:.88,w:.12,flapTo:0,flapW:0},heelCtr:.7,toeWrap:.075,soleT:.028,feat:{...NOFEAT,toecap:1}},
};
/*
 * Soles and sides per model (Oct 13 2026, user: "all the soles of the styles are so flat ... look at the sides of the boots too,
 * give more shape to it"). Research and sources: docs/shop-boot-silhouettes.md ("Soles" and "Sides"). The leather classics stand
 * on a thick moulded rubber or PU sole with a stitched edge and a ring of round studs; the 1990s–2000s boots on a nylon/TPU plate
 * with a raised heel block and an arch bridge; the elite plates (2010s) are thin frames with windows and an anatomical chassis.
 */
type SoleSide={plate:Partial<PlateSpec>;studs?:Partial<StudSet>;relief:Partial<ReliefSpec>};
const LEATHER:Partial<ReliefSpec>={overlay:.005,collar:.016,cup:.005,seam:.003,nz:[2.6,2.1],bulge:.045};
const KNIT:Partial<ReliefSpec>={overlay:0,collar:.006,cup:.006,seam:0,nz:[2.7,2.1],bulge:.035};
const RING13={heel:[[.05,-.42],[.05,.42],[.17,-.64],[.17,.64]],fore:[[.56,-.72],[.56,.72],[.67,-.76],[.67,.74],[.78,-.7],[.78,.64],[.88,-.5],[.88,.4],[.95,-.06]]} as const;
// [s, f] round the hub on an ellipse (ds along, df across), n studs from angle a0 (radians)
const ringAt=(hub:Pos,ds:number,df:number,n:number,a0=0,mode:'t'|'r'='t'):StylePos[]=>Array.from({length:n},(_,i)=>{const a=a0+i*Math.PI*2/n;return [hub[0]+ds*Math.cos(a),hub[1]+df*Math.sin(a),mode] as const;});
const SWIRL_HUB:Pos=[.7,-.04],ROTOR_HUB:Pos=[.72,-.04],POD_HUB:Pos=[.71,-.04];
const SOLES:Record<BootModel,SoleSide>={
 // 2004 speed: a glossy thin nylon plate, a big open arch window, fine ribs; modern blades, SG screw-ins shown off
 speed:{plate:{art:'gloss',waist:[.08,.03]},relief:{}},
 // 1968: a full flat rubber outsole stitched to the upper (welt all round), diamond tread, a separate stacked heel block, 13 studs
 retro:{plate:{kind:'rubber',art:'stacked',t:.055,heel:0.042,arch:0.022,wallMid:.016,wallToe:.03,heelWrap:.045,flare:.01,bevel:.013,welt:true,rocker:.004,waist:[.02,.004]},studs:{...RING13,blade:'round'},
  relief:{...LEATHER,panel:.004,puff:.003}},
 // 1979: a dual-density sole: a ribbed centre panel, a lighter waist insert, piped welt, a crescent-ribbed heel, ~15 round studs
 classic:{plate:{kind:'rubber',art:'ladder',t:.055,heel:0.036,arch:0.025,wallMid:.017,wallToe:.032,heelWrap:.05,flare:.011,bevel:.013,welt:true,rocker:.004,waist:[.03,.008]},
  studs:{heel:[[.05,-.42],[.05,.42],[.16,-.66],[.16,.66]],fore:[[.55,-.72],[.55,.72],[.64,-.78],[.64,.76],[.73,-.76],[.73,.72],[.82,-.68],[.82,.6],[.9,-.48],[.9,.36],[.66,-.05]],blade:'round'},
  relief:{...LEATHER,quilt:.003,puff:.004}},
 // 2002 lightweight: a scalloped (wave) plate edge, a forefoot split into flexing segments, a see-through wave window in the heel
 feather:{plate:{kind:'plate',art:'wave',t:.04,heel:0.034,arch:0.035,wallMid:.012,wallToe:.026,heelWrap:.09,flare:.007,bevel:.01,welt:false,rocker:.005,wave:.032,waist:[.06,.02]},studs:{...RING13,blade:'round'},
  relief:{...LEATHER,quilt:.003,puff:.008}},
 // 1998 power: a moulded horseshoe heel in a second colour, a see-through ribbed arch shank, a swirl cluster of small blades
 fins:{plate:{kind:'plate',art:'swirl',t:.045,heel:0.042,arch:0.035,wallMid:.014,wallToe:.03,heelWrap:0,flare:.006,bevel:.011,welt:false,rocker:.005,waist:[.07,.03]},
  studs:{heel:HEEL4,fore:RING13.fore,blade:'cluster',hub:SWIRL_HUB,styleFore:[[.55,-.76,'e'],[.55,.76,'e'],[.65,-.84,'e'],[.65,.8,'e'],[.77,-.8,'e'],[.77,.74,'e'],[.87,-.62,'e'],[.87,.5,'e'],[.95,-.16,'e'],...ringAt(SWIRL_HUB,.072,.42,6,Math.PI/6)]},relief:{...LEATHER,collar:.015}},
 // 1998 speed: the slimmest waist with a raised arch bridge in a second colour, a narrow heel, a central spine groove, round studs
 track:{plate:{kind:'plate',art:'bridge',t:0.034,heel:0.036,arch:0.038,wallMid:.01,wallToe:.026,heelWrap:0,flare:.004,bevel:.008,welt:false,rocker:.006,waist:[.12,.065],heelIn:.05},
  studs:{heel:[[.06,-.34],[.06,.34],[.19,-.46],[.19,.46]],fore:[[.58,-.68],[.58,.68],[.71,-.72],[.71,.66],[.84,-.5],[.84,.4],[.94,-.08]],blade:'modern'},relief:{collar:.008,bulge:.025}},
 // 2002 power: a two-tone plate split corner to corner, a dark X-braced arch shank, a deep heel block, slim blades
 longflap:{plate:{kind:'plate',art:'diagonal',t:.045,heel:0.046,arch:0.036,wallMid:.014,wallToe:.03,heelWrap:0,flare:.006,bevel:.011,welt:false,rocker:.005,waist:[.06,.02]},
  studs:{heel:RING13.heel,fore:[...RING13.fore,[.7,-.06]],blade:'slim'},relief:{...LEATHER,pads:.008}},
 // 2004 power: a wide plate, a central spine in a second colour with triangular windows each side, cones and blades mixed
 offset:{plate:{kind:'chassis',art:'spine',t:.045,heel:0.04,arch:0.04,wallMid:.014,wallToe:.03,heelWrap:.09,flare:.008,bevel:.011,welt:false,rocker:.006,waist:[.035,.008]},
  studs:{heel:HEEL4,fore:[[.56,-.74],[.56,.74],[.67,-.8],[.67,.76],[.78,-.72],[.78,.66],[.88,-.48],[.88,.36],[.63,-.04],[.76,-.06]],blade:'mix'},relief:{overlay:.004,collar:.012,pad:.007,bulge:.035}},
 // 2007 power: a Y-shaped spine, one big see-through triangle window in the forefoot, a solid second-colour heel, the tallest clip
 cage:{plate:{kind:'chassis',art:'yspine',t:.038,heel:0.04,arch:0.04,wallMid:.012,wallToe:.03,heelWrap:.13,flare:.006,bevel:.009,welt:false,rocker:.006,waist:[.05,.015]},
  studs:{heel:[[.05,-.4],[.05,.4],[.17,-.62],[.17,.62]],fore:[[.57,-.76],[.57,.76],[.69,-.8],[.69,.76],[.81,-.68],[.81,.6],[.92,-.3],[.92,.18],[.63,0],[.75,0]],blade:'mix'},relief:{collar:.01}},
 // 2010 ultralight: a skeleton frame with five big open windows, a very thin narrow heel, triangular blades
 wrap:{plate:{kind:'frame',art:'skeleton',t:0.032,heel:0.026,arch:0.048,wallMid:.008,wallToe:.022,heelWrap:0,flare:.003,bevel:.007,welt:false,rocker:.006,waist:[.11,.055],heelIn:.04},
  studs:{heel:[[.05,-.4],[.05,.4],[.16,-.58],[.16,.58]],fore:[[.57,-.74],[.57,.74],[.68,-.78],[.68,.74],[.79,-.68],[.79,.62],[.9,-.36],[.9,.22],[.64,0]],blade:'tri'},relief:{overlay:.002,collar:.006,cage:.004,bulge:.02,waist:.04}},
 // 2013 leather: a padded heel cupsole in a second colour with pebbled tread, flex grooves, fewer, smaller cones set inboard
 pro:{plate:{kind:'chassis',art:'cup',t:.04,heel:0.032,arch:0.03,wallMid:.013,wallToe:.028,heelWrap:.11,flare:.007,bevel:.012,welt:false,rocker:.005,waist:[.03,.008]},
  studs:{heel:[[.06,-.4],[.06,.4],[.18,-.56],[.18,.56]],fore:[[.58,-.6],[.58,.6],[.7,-.64],[.7,.58],[.82,-.52],[.82,.42],[.92,-.14],[.66,-.02]],blade:'round'},relief:{...LEATHER,quilt:.003,puff:.007}},
 // 2014 knit: round studs on raised pods in a rotational ring round the ball of the foot, a textured panel, a bubble texture
 knit:{plate:{kind:'plate',art:'pods',t:0.036,heel:0.036,arch:0.036,wallMid:.011,wallToe:.026,heelWrap:0,flare:.005,bevel:.009,welt:false,rocker:.006,waist:[.045,.012]},
  studs:{heel:HEEL4,fore:[[.56,-.74],[.56,.74],[.67,-.76],[.67,.74],[.78,-.68],[.78,.62],[.88,-.46],[.88,.32],[.62,0],[.74,-.04]],blade:'modern',round:'pod',hub:POD_HUB,
   fgFore:[[.55,-.72],[.55,.72],[.89,-.5],[.89,.36],POD_HUB,...ringAt(POD_HUB,.085,.5,6,0).map(([s,f])=>[s,f] as const)]},relief:{...KNIT,ribs:.003}},
 // 2016 knit: a slim chassis with a dark textured (carbon-look) arrowhead panel, ridged waist, chevron blades
 sock:{plate:{kind:'chassis',art:'chevron',t:0.034,heel:0.036,arch:0.042,wallMid:.01,wallToe:.026,heelWrap:0,flare:.003,bevel:.008,welt:false,rocker:.006,waist:[.1,.045],heelIn:.02},studs:{heel:HEEL4,fore:FORE8,blade:'chevron'},relief:{...KNIT,ribs:.006,bulge:.025}},
 // 2017 laceless: a see-through frame with ribs inside, a twin spine, 7 half-moon studs in a ring round the ball + 4 at the heel
 laceless:{plate:{kind:'frame',art:'rotor',t:0.035,heel:0.038,arch:0.042,wallMid:.011,wallToe:.026,heelWrap:0,flare:.004,bevel:.009,welt:false,rocker:.006,waist:[.07,.03]},
  studs:{heel:HEEL4,fore:FORE8,blade:'halfmoon',hub:ROTOR_HUB,styleFore:ringAt(ROTOR_HUB,.1,.6,7,0,'r')},relief:{...KNIT,bands:.006}},
 // a flat gum cupsole: a tall foxing wall and toe bumper, herringbone tread, a pivot circle
 indoor:{plate:{kind:'gum',art:'gum',t:.03,heel:0,arch:0,wallMid:.035,wallToe:.075,heelWrap:.07,flare:.004,bevel:.012,welt:false,rocker:0,waist:[0,0]},studs:{},relief:{...LEATHER,toecap:.004,collar:.014}},
};
for(const id of Object.keys(SOLES) as BootModel[]){const sh=SHAPES[id],o=SOLES[id];
 sh.plate={...PLATE0,...o.plate};sh.studSet={...sh.studSet,...o.studs} as StudSet;sh.relief={...RELIEF0,...o.relief};sh.soleT=sh.plate.t;}
// The cream and white leather boots (Oct 13 2026, user bonus: "more distinguishable from the side"): a low crescent heel block
// sweeping forward along the sole with a stitched wave line (the 2002 lightweight), a tall heel block slanting forward with a heel tab
// (the 2013 leather boot), an upright block (the 2004 striker keeps the default).
SHAPES.feather.look={heelLine:[.165,-.02,0,.3],waveStitch:1,heelTab:0};
SHAPES.pro.look={heelLine:[.15,.2,-.02,0],waveStitch:0,heelTab:1};
// The side profiles come from the reference traces (bootProfiles.ts, fitted by the scratch fitter): they replace the hand-set
// section heights, collar lines, tongue and collar heights of each model that has one.
for(const [id,p] of Object.entries(BOOT_PROFILES) as [BootModel,typeof BOOT_PROFILES[BootModel]][]){const sh=SHAPES[id];if(!sh||!p)continue;
 sh.hsec=p.hsec;sh.rim=p.rim;sh.tongue={...sh.tongue,top:p.tongueTop};if(p.sockTop)sh.sockTop=p.sockTop;if(p.midTop)sh.midTop=p.midTop;if(p.spring!=null)sh.spring=p.spring;}
let cur:Shape=SPEED;
/** Make model `m` the active shape for every function in this module (and bootZones.ts). Cheap: nothing is built here. */
export function useShape(m:BootModel){cur=SHAPES[m]??SPEED;return cur;}
export const shape=()=>cur;
/** Where the heel colour block ends at height yr (the bake and the tap-to-paint zones share it). */
export const heelBorder=(yr:number)=>{const [a,b,c,d]=cur.look.heelLine;return a+b*yr+c*yr*yr+d*(1-yr)**3;};

export const heelRound=(s:number)=>s<.15?Math.sqrt(Math.max(0,1-((.15-s)/.15)**2)):1;
/** A two-entry memo per shape: the builders ask for the same row (and its neighbour for normals) many times in a row. */
type PlanW={lat:number;med:number;zc:number};
const planMemo:{shape:Shape|null;s:number;v:PlanW}[]=[{shape:null,s:-1,v:{lat:0,med:0,zc:0}},{shape:null,s:-1,v:{lat:0,med:0,zc:0}}];let planFlip=0;
export function plan(s:number):PlanW{
 for(const m of planMemo)if(m.s===s&&m.shape===cur)return m.v;
 const m=planMemo[planFlip^=1];m.shape=cur;m.s=s;m.v=planRaw(s);return m.v;
}
function planRaw(s:number){
 // A tapered toe: (1−t²)^p; p ≈ .7 runs to a point at a clear angle, p ≈ .45 is a round, blunt toe.
 const [l0,le]=cur.taper.lat,[m0,me]=cur.taper.med;
 const h=heelRound(s),tl=s>l0?Math.pow(Math.max(0,1-((s-l0)/(1-l0))**2),le):1,tm=s>m0?Math.pow(Math.max(0,1-((s-m0)/(1-m0))**2),me):1;
 return {lat:spline(cur.lat,s)*h*tl,med:spline(cur.med,s)*h*tm,zc:-.1*smooth(.55,1,s)};
}
/** Toe spring alone (the toe lifts off the ground). */
export const toeSpring=(s:number)=>cur.spring*smooth(.72,1,s)**2.2;
/** Height of the underside of the upper: a heel lift and the toe spring. */
export const base=(s:number)=>cur.heelLift*(1-smooth(.2,.62,s))+toeSpring(s);
const hsecMemo={shape:null as Shape|null,s:-1,v:0};
export const hsec=(s:number)=>{if(hsecMemo.s!==s||hsecMemo.shape!==cur){hsecMemo.shape=cur;hsecMemo.s=s;hsecMemo.v=spline(cur.hsec,s);}return hsecMemo.v;};
export const rim=(s:number)=>s<S_THROAT?Math.min(spline(cur.rim,s),hsec(s)):hsec(s);
export const isOpen=(s:number)=>s<S_THROAT&&rim(s)<hsec(s)-1e-4;
/** Walls lean in as they rise: the upper hugs the foot instead of standing up like a box. */
const lean=(yr:number)=>1-cur.lean*yr**1.6;
/** φ where the section reaches the rim (π/2 when the section is closed). */
export function rimPhi(s:number){if(!isOpen(s))return Math.PI/2;return Math.asin(clamp((rim(s)/hsec(s))**(NY/2),0,1));}
/**
 * u along the atlas: arc length of the plan outline from the heel seam, normalised (per shape). With u = s the heel and toe
 * (where the width grows like √s) got almost no texels and a name stitched across the heel seam went soft.
 */
const uTables=new Map<Shape,Float64Array>();
export function uOf(s:number){
 const N=800;let acc=uTables.get(cur);
 if(!acc){acc=new Float64Array(N+1);let px=0,pw=0;
  for(let i=0;i<=N;i++){const t=i/N,p=plan(t),w=(p.lat+p.med)/2,x=-1.35+2.7*t;if(i)acc[i]=acc[i-1]+Math.hypot(x-px,w-pw);px=x;pw=w;}
  uTables.set(cur,acc);}
 const L=acc[N],f=Math.min(N,Math.max(0,s*N)),i=Math.min(N-1,Math.floor(f)),t=f-i;return (acc[i]+(acc[i+1]-acc[i])*t)/L;
}
/** s → x (heel at −L/2), before the heel/toe shaping. */
export const sx=(s:number)=>-BOOT_L/2+s*BOOT_L;

/** The outer surface point. */
export function surface(s:number,phi:number,out=new T.Vector3()){
 const p=plan(s),H=hsec(s),c=Math.cos(phi),sn=Math.abs(Math.sin(phi));
 // the inside wall is flatter (a fuller exponent), the outside rounder; the forefoot bulges over the toes at mid height and the
 // waist pinches in under the arch (volume only: the side profile, the sole edge and the plan outline are unchanged)
 const yr=sn**(2/NY),rf=cur.relief,med=c>0,nz=med?rf.nz[0]:rf.nz[1],mid=Math.sin(Math.PI*Math.min(1,yr/.92));
 const vol=1+rf.bulge*bump(s,.48,.97)*mid*(med?.65:1)-rf.waist*bump(s,.26,.52)*mid*(med?1:.7);
 const z=p.zc+(med?-p.med:p.lat)*Math.abs(c)**(2/nz)*lean(yr)*vol,y=base(s)+H*yr;
 let x=sx(s);
 x-=cur.toeBack*smooth(.82,1,s)*yr**1.5;                         // the toe box rounds back as it rises
 const heel=1-smooth(0,.14,s);x-=.035*heel*Math.sin(Math.PI*clamp(yr/.8,0,1));x+=.05*(1-smooth(0,.2,s))*yr*yr; // sculpted heel cup, collar leans in
 x-=.035*(1-smooth(0,.05,s))*smooth(.6,.76,yr);                  // the heel tab flicks back at the Achilles
 return out.set(x,y,z);
}
/** Outward unit normal of the outer surface (finite differences). */
export function surfaceNormal(s:number,phi:number,out=new T.Vector3()){
 const e=1e-3,a=surface(clamp(s+e,0,1),phi),b=surface(clamp(s-e,0,1),phi),c=surface(s,clamp(phi+e,0,Math.PI)),d=surface(s,clamp(phi-e,0,Math.PI));
 const ds=a.sub(b),dp=c.sub(d);out.crossVectors(dp,ds).normalize();
 // φ grows from the inside (−z) over the top to the outside (+z): dp×ds points outward; guard the degenerate ends.
 if(!Number.isFinite(out.x)||out.lengthSq()<.5)out.set(s<.5?-1:1,0,0);return out;
}

/** The same normal from two one-sided differences around a point P already on the surface (half the cost; the upper's loop). */
const _a=new T.Vector3(),_c=new T.Vector3();
function normalAt(s:number,phi:number,P:T.Vector3,out:T.Vector3){
 const e=1e-3,ds=s+e<=1?e:-e,dp=phi+e<=Math.PI?e:-e;surface(s+ds,phi,_a).sub(P).multiplyScalar(Math.sign(ds));surface(s,phi+dp,_c).sub(P).multiplyScalar(Math.sign(dp));
 out.crossVectors(_c,_a).normalize();if(!Number.isFinite(out.x)||out.lengthSq()<.5)out.set(s<.5?-1:1,0,0);return out;
}
/** Row stations: denser at the heel and toe so both ends stay round. */
function rows(n:number){return Array.from({length:n},(_,i)=>{const t=i/(n-1);return .5-.5*Math.cos(Math.PI*t);});}

export type BootOptions={collar:Collar;laces:Laces;studs:StudType;detail?:'phone'|'desktop'};
export type EyeletRow={s:number;phiIn:number;phiOut:number};
/** φ at row s where the surface is `w` dm across the top from the top centre (+ outside, − inside). */
export function phiAcross(s:number,w:number){
 const top=surface(s,Math.PI/2),sg=Math.sign(w)||1;let lo=0,hi=1.2;
 if(Math.abs(w)<1e-6)return Math.PI/2;
 for(let i=0;i<30;i++){const m=(lo+hi)/2,p=surface(s,Math.PI/2+sg*m);if(Math.abs(p.z-top.z)<Math.abs(w))lo=m;else hi=m;}
 return Math.PI/2+sg*lo;
}
/** Eyelets (and lace crossings): the shape's rows in its throat, centred or offset toward the outside of the foot. */
export function eyeletRows():EyeletRow[]{
 const e=cur.eyes,c=cur.laceC;
 return Array.from({length:e.n},(_,k)=>{const s=lerp(e.s0,e.s1,k/(e.n-1));
  return {s,phiIn:phiAcross(s,c-e.hw),phiOut:phiAcross(s,c+e.hw)};});
}

type Builder={pos:number[];nor:number[];uv:number[];uvf:number[];zone:number[];surf:number[];ao:number[];idx:number[]};
const newBuilder=():Builder=>({pos:[],nor:[],uv:[],uvf:[],zone:[],surf:[],ao:[],idx:[]});
function toGeometry(b:Builder,computeNormals=true){
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(b.pos,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setAttribute('uvFlip',new T.Float32BufferAttribute(b.uvf,2));
 g.setAttribute('aZone',new T.Float32BufferAttribute(b.zone,4));g.setAttribute('aSurf',new T.Float32BufferAttribute(b.surf,2));
 while(b.ao.length<b.pos.length/3)b.ao.push(1);g.setAttribute('aAO',new T.Float32BufferAttribute(b.ao,1));
 g.setIndex(b.idx);
 if(computeNormals)g.computeVertexNormals();else g.setAttribute('normal',new T.Float32BufferAttribute(b.nor,3));
 return g;
}
/** Quads between consecutive rows of a (rows × cols) grid starting at vertex `o`. */
function gridIndex(b:Builder,o:number,nr:number,nc:number,flip=false){
 for(let i=0;i<nr-1;i++)for(let j=0;j<nc-1;j++){const a=o+i*nc+j,c=a+nc;
  if(flip)b.idx.push(a,a+1,c,a+1,c+1,c);else b.idx.push(a,c,a+1,a+1,c,c+1);}
}
/** One vertex with a computed normal (nor 0,0,0 = keep the computed one). */
function vert(b:Builder,P:T.Vector3,u:number,v:number,uf:number,zone:[number,number,number,number],surf:[number,number]){
 b.pos.push(P.x,P.y,P.z);b.nor.push(0,0,0);b.uv.push(u,v);b.uvf.push(uf,v);b.zone.push(...zone);b.surf.push(...surf);
}

/* Part ids carried in aZone.w for the bake (bootBake.ts) and the scene's picking. */
export const PART={outer:0,lining:1,tongue:2,tongueBack:3,collar:4,collarInner:5,fin:6,cover:7,coverIn:8} as const;

const V_IN=.33,V_LIN0=.675,V_LIN1=.745,V_OUT=.33,V_TOP=.76;
/** v for the outer walls by φ (inside 0–.33, outside .33–.66). */
const vOuter=(phi:number)=>phi<=Math.PI/2?V_IN*phi/(Math.PI/2):V_OUT+V_IN*(phi-Math.PI/2)/(Math.PI/2);

/* ---------- The sides: real relief on the upper ---------- */
/** Spacing of the quilted rows on the toe, the bandage strips and the knit ribs (dm); the bake (bootBake.ts) uses the same. */
export const QUILT_SP=.08,BAND_SP=.14,RIB_SP=.09;
const fract=(v:number)=>v-Math.floor(v);
/**
 * Relief that depends only on where a point is along the boot (s) and how high up the wall (yr): the toe and heel overlays
 * standing proud, sunken seams, the heel counter cup, soft leather pillows and the quilted toe's puffs. `cav` (cavity) feeds the
 * baked ambient occlusion. Things that sit on the upper (fins, the lace cover, laces) lift by this too.
 */
export function reliefSY(s:number,yr:number){
 const rf=cur.relief,L=BOOT_L,low=smooth(.02,.1,yr);let r=0,cav=0;
 const dToe=(s-(.705+.085*yr+.012*Math.sin(yr*9)))*L,dHeel=(.255-.13*yr+.03*yr*yr-s)*L;
 r+=rf.overlay*smooth(-.003,.007,dToe)*low+rf.overlay*1.2*smooth(-.003,.007,dHeel)*low;
 const sm=Math.exp(-1*((dToe-.002)/.005)**2)+Math.exp(-1*((dHeel-.002)/.005)**2);r-=rf.seam*sm*low;cav+=rf.seam*sm*low;
 r+=rf.cup*(1-smooth(.05,.16,s))*Math.sin(Math.PI*clamp(yr/.62,0,1));
 r+=rf.puff*bump(s,.42,1.02)*bump(yr,.06,1.1);
 if(rf.quilt>0&&dToe>.02){const pq=Math.abs(Math.cos(Math.PI*fract(dToe/QUILT_SP)))**.8,k=low*smooth(.02,.05,dToe);r+=rf.quilt*pq*k;cav+=rf.quilt*(1-pq)*k;}
 return {r,cav};
}
/** The full relief at a point of the outer upper: reliefSY + the collar roll, the lace facings and each era's raised features. */
function sideRelief(s:number,yr:number,around:number,rimd:number,x:number,laces:Laces,collar:Collar){
 const rf=cur.relief,e=cur.eyes,hw=e.hw,gap=Math.abs(around-cur.laceC);
 let {r,cav}=reliefSY(s,yr);
 if(rimd<.09&&collar==='low')r+=rf.collar*Math.sin(Math.PI*clamp(rimd/.085,0,1))**.6;
 const inL=smooth(e.s0-.03,e.s0-.012,s)*(1-smooth(e.s1+.02,e.s1+.035,s));
 if(laces==='visible'){
  // the eyelet row is a raised strip either side of a recessed tongue gap
  const facing=smooth(hw*.6,hw*.72,gap)*(1-smooth(hw*1.36,hw*1.5,gap)),tg=1-smooth(hw*.55,hw*.68,gap);
  r+=.008*facing*inL-.004*tg*inL;cav+=.004*tg*inL;
  if(rf.cage)r+=rf.cage*Math.exp(-1*((gap-hw*1.5-.05)/.009)**2)*smooth(e.s0-.06,e.s0,s)*(1-smooth(e.s1+.05,e.s1+.1,s));
 }else if(laces==='laceless')r+=.0025*smooth(.395,.405,s)*(1-smooth(.745,.755,s))*(1-smooth(.15,.16,gap));
 if(rf.pad)r+=rf.pad*smooth(.49,.52,s)*(1-smooth(.785,.81,s))*smooth(-.345,-.315,around)*(1-smooth(-.08,-.05,around))*smooth(.06,.1,yr);
 if(rf.pads){const qx=Math.abs((s-.71)/.13)-.7,qy=Math.abs((Math.abs(around)-.2)/.075)-.55,d=Math.hypot(Math.max(qx,0),Math.max(qy,0))-.3;r+=rf.pads*(1-smooth(-.06,.02,d))*smooth(.03,.06,yr);}
 if(rf.panel){const d=Math.max(Math.abs((s-.43)/.2)-1,Math.abs((yr-.4)/.2)-1)*.2*BOOT_L;r+=rf.panel*(1-smooth(-.006,.004,d));}
 if(rf.toecap)r+=rf.toecap*smooth(-.004,.004,(s-(.8+.04*yr-.02*yr*yr))*BOOT_L)*smooth(.04,.08,yr);
 if(rf.bands){const wz=smooth(.22,.3,s)*(1-smooth(.93,.98,s))*smooth(.05,.12,yr);
  const b1=Math.abs(fract((x*.82+around*.57)/BAND_SP)-.5)*2,b2=Math.abs(fract((x*.82-around*.57)/BAND_SP)-.5)*2;
  const s1=1-smooth(.5,.64,b1),s2=1-smooth(.5,.64,b2);r+=wz*rf.bands*Math.max(s1,.55*s2);cav+=wz*rf.bands*.5*(1-Math.max(s1,s2));}
 if(rf.ribs){const z=smooth(.42,.52,s)*(1-smooth(.9,.96,s))*smooth(.12,.25,yr)*(laces==='visible'?1-inL*(1-smooth(hw*1.4,hw*1.7,gap)):1);
  const q=Math.abs(fract((x*.85+Math.abs(around)*.55)/RIB_SP)-.5)*2;r+=rf.ribs*z*(1-smooth(.2,.55,q));}
 return {r,cav};
}
/** Height of the heel counter knots, normalised (1 at the heel centre). */
const HEEL_CTR_N:Knots=[[0,1],[.035,.976],[.07,.762],[.11,.452],[.16,.214],[.21,.086],[.25,.029]];
/** How high the plate's side wall reaches up the upper at s (dm above the upper's underside) for a stud choice. */
export function wallHeight(s:number,studs:StudType='fg'){
 const p=cur.plate,len=.25+.04*Math.max(0,cur.heelCtr-1),top=p.heelWrap>0?p.heelWrap:.21*cur.heelCtr;
 const heel=top*spline(HEEL_CTR_N,clamp(s*.25/len,0,.25)),toe=Math.max(p.wallToe,isFlatSole(studs)?.05:0)*smooth(.84,.96,s);
 let h=Math.max(heel,p.wallMid,toe);if(studs==='split')h*=1-.9*archGap(s);return h;
}

/**
 * The upper: inside wall, lining pocket and outside wall per row. Rows in front of the throat are closed: their lining columns
 * collapse onto the top centre (zero-area, invisible), so the grid stays one piece and the opening's front wall forms itself.
 * The outer walls carry the side relief (sideRelief) as real geometry along the outward normal; aAO is the baked occlusion.
 */
function buildUpper(b:Builder,detail:'phone'|'desktop',laces:Laces,collar:Collar){
 const NR=detail==='desktop'?112:84,NW=detail==='desktop'?28:22,NL=10,S=rows(NR),NC=NW*2+NL,o=b.pos.length/3;
 const P=new T.Vector3(),Q=new T.Vector3(),N=new T.Vector3();
 let wh=0;
 const outer=(s:number,phi:number,yb:number,H:number,open:boolean,around:number)=>{
  surface(s,phi,P);const yr=(P.y-yb)/H,rimd=open?rim(s)-(P.y-yb):9;normalAt(clamp(s,.003,.997),phi,P,N);
  const {r,cav}=sideRelief(s,yr,around,rimd,P.x,laces,collar),f=smooth(wh+.004,wh+.03,P.y-yb),h=P.y-yb-wh;
  Q.copy(P).addScaledVector(N,r*f);b.pos.push(Q.x,Q.y,Q.z);b.nor.push(0,0,0);
  // occlusion: in seams and quilting grooves, a soft band where the upper meets the plate wall, and a touch low on the walls
  b.ao.push(clamp(1-cav*f*70,.6,1)*(1-.28*Math.exp(-1*(h/.025)**2))*(.9+.1*smooth(0,.25,yr)));
  b.zone.push(s,yr,rimd,PART.outer);b.surf.push(P.x,around);
 };
 for(const s of S){
  const pr=rimPhi(s),open=isOpen(s),H=hsec(s),yb=base(s),u=uOf(s);wh=wallHeight(s);
  // Around arc length from the top centre (signed: − inside, + outside), for knit stitches and lace-gap tests.
  const phis:number[]=[];
  for(let j=0;j<NW;j++)phis.push(pr*j/(NW-1));
  for(let j=0;j<NW;j++)phis.push(Math.PI-pr+pr*j/(NW-1));
  let acc=0;const prev=surface(s,0,new T.Vector3());const arcIn:number[]=[0];
  for(let j=1;j<NW;j++){surface(s,phis[j],P);acc+=P.distanceTo(prev);arcIn.push(acc);prev.copy(P);}
  const topIn=open?acc+.02:acc;
  acc=0;surface(s,Math.PI,prev);const arcOut:number[]=[];arcOut[NW-1]=0;
  for(let j=NW-2;j>=0;j--){surface(s,phis[NW+j],P);acc+=P.distanceTo(prev);arcOut[j]=acc;prev.copy(P);}
  const topOut=open?acc+.02:acc;
  // inside wall
  for(let j=0;j<NW;j++){const phi=phis[j];b.uv.push(u,vOuter(phi));b.uvf.push(u,vOuter(Math.PI-phi));outer(s,phi,yb,H,open,arcIn[j]-topIn);}
  // lining: rim roll, inner wall, insole, inner wall, rim roll
  const mi=surface(s,pr,new T.Vector3()),la=surface(s,Math.PI-pr,new T.Vector3()),half=Math.abs(la.z-mi.z)/2,roll=Math.min(.03,half*.4);
  const insole=yb+.06,R=yb+rim(s);
  for(let k=0;k<NL;k++){
   const t=k/(NL-1);
   if(!open){surface(s,Math.PI/2,P);}
   else if(k===0)P.copy(mi);else if(k===NL-1)P.copy(la);
   else if(k===1)P.set(mi.x+.004,R-.004,mi.z+roll);else if(k===NL-2)P.set(la.x+.004,R-.004,la.z-roll);
   else{const tt=(k-2)/(NL-5),zin=lerp(mi.z+roll*1.25,la.z-roll*1.25,tt),depth=Math.pow(Math.sin(Math.PI*tt),.35);
    P.set(lerp(mi.x,la.x,tt)+.02*depth,lerp(R-.012,insole,depth),zin);}
   b.nor.push(0,0,0);b.pos.push(P.x,P.y,P.z);b.uv.push(u,lerp(V_LIN0,V_LIN1,t));b.uvf.push(u,lerp(V_LIN0,V_LIN1,1-t));b.ao.push(open?.85:1);
   b.zone.push(s,(P.y-yb)/H,0,open?PART.lining:PART.outer);b.surf.push(P.x,(t-.5)*half*2.4);}
  // outside wall
  for(let j=0;j<NW;j++){const phi=phis[NW+j];b.uv.push(u,vOuter(phi));b.uvf.push(u,vOuter(Math.PI-phi));outer(s,phi,yb,H,open,topOut-arcOut[j]);}
 }
 gridIndex(b,o,NR,NC,true);
 return {o,NR,NC,NW,NL};
}

/** Smooth the normals where the grid has coincident vertices that should not crease (closed top centre, toe tip). */
function weldNormals(g:T.BufferGeometry,groups:number[][]){
 // average the first two members (the real wall vertices) and give every member that normal
 const n=g.getAttribute('normal') as T.BufferAttribute,v=new T.Vector3(),w=new T.Vector3();
 for(const grp of groups){v.fromBufferAttribute(n,grp[0]).add(w.fromBufferAttribute(n,grp[1]));if(v.lengthSq()<1e-8)v.set(0,1,0);v.normalize();for(const i of grp)n.setXYZ(i,v.x,v.y,v.z);}
 n.needsUpdate=true;
}

/** A point on the lace line at row s, lifted `lift` dm off the surface. */
function laceLine(s:number,lift:number,out=new T.Vector3()){
 const phi=phiAcross(s,cur.laceC);surface(s,phi,out);return out.addScaledVector(surfaceNormal(s,phi),lift);
}
/**
 * The tongue's centre line. Slim: a thin flap under the laces that peeks above the throat. Fold: a long tongue that rises high
 * above the throat, folds forward and lies over the laces down to flapTo (the classic leather boots). `fold` is the fraction of
 * the arc length at the fold (the bake paints the flap's top face like the upper beyond it).
 */
export function tongueCurve():{curve:T.CatmullRomCurve3;fold:number}{
 const tg=cur.tongue,top=tg.top,e=cur.eyes,zAt=(s:number,k:number)=>plan(s).zc+cur.laceC*k;
 const A=laceLine(e.s0+.09,-.012),B=laceLine(e.s0+.02,.006);
 if(tg.kind==='slim'){
  const curve=new T.CatmullRomCurve3([A,B,new T.Vector3(sx(.392),base(.392)+top-.065,zAt(.392,.8)),new T.Vector3(sx(.355),base(.355)+top,zAt(.355,.7))],false,'catmullrom',.5);
  return {curve,fold:2};}
 // fold-over: up behind the throat, a tight fold, then down over the laces
 const apex=new T.Vector3(sx(.37),base(.37)+top+.025,zAt(.37,.5));
 const pts=[A,B,new T.Vector3(sx(.392),base(.392)+top-.14,zAt(.392,.8)),new T.Vector3(sx(.365),base(.365)+top-.04,zAt(.365,.6)),apex,
  new T.Vector3(sx(.395),base(.395)+top-.005,zAt(.395,.5)),new T.Vector3(sx(.42),base(.42)+hsec(.42)+.085,zAt(.42,.6))];
 const n=Math.max(2,Math.round((tg.flapTo-.44)/.04));
 for(let k=0;k<=n;k++){const s=lerp(.45,tg.flapTo,k/n);pts.push(laceLine(s,lerp(.052,.036,k/n)));}
 const curve=new T.CatmullRomCurve3(pts,false,'centripetal');
 // the arc fraction of the apex
 const L=curve.getLength(),lens=curve.getLengths(400);let best=0,bd=9;const q=new T.Vector3();
 for(let i=0;i<=400;i++){curve.getPoint(i/400,q);const d=q.distanceToSquared(apex);if(d<bd){bd=d;best=i;}}
 return {curve,fold:lens[best]/L};
}
function buildTongue(b:Builder){
 const tg=cur.tongue,fold=tg.kind==='fold',NA=11,NB=fold?32:16,o=b.pos.length/3,TH=fold?.026:.022,PAD=fold?.005:.008;// padded: thick, puffed in the middle
 const {curve,fold:fv}=tongueCurve();
 const front:T.Vector3[]=[],back:T.Vector3[]=[];
 const tan=new T.Vector3(),side=new T.Vector3(0,0,1),up=new T.Vector3(),inward=new T.Vector3();// up = tan × side: away from the leg
 for(let i=0;i<NB;i++){const bb=i/(NB-1);const c=curve.getPointAt(bb);curve.getTangentAt(bb,tan);up.crossVectors(tan,side).normalize();
  let w:number,bend=.05;
  if(!fold){w=lerp(tg.w,tg.w*1.15,bb);if(bb>.78)w*=Math.sqrt(Math.max(0,1-((bb-.78)/.22)**2))*.7+.3;}
  else{const f=smooth(fv-.06,fv+.12,bb);w=lerp(lerp(tg.w,tg.w*1.15,Math.min(1,bb/fv)),tg.flapW,f);bend=lerp(.05,.075,f);
   if(bb>.86)w*=Math.sqrt(Math.max(0,1-((bb-.86)/.14)**2))*.55+.45;}
  // the edges bend toward the foot: behind the leg on the upright part, down onto the laces on the flap (0 at the fold)
  inward.copy(up).multiplyScalar(-clamp(up.y*3,-1,1));
  for(let j=0;j<NA;j++){const a=-1+2*j/(NA-1);const P=c.clone().addScaledVector(side,a*w).addScaledVector(inward,bend*a*a).addScaledVector(up,(.006+PAD*(1-a*a)**.7)*Math.sign(up.y||1));
   front.push(P);back.push(P.clone().addScaledVector(up,-TH*(1-.5*a*a)));}}
 const zone=(vv:number,part:number):[number,number,number,number]=>[.3,vv,fv,part];
 // front (part tongue)
 for(let i=0;i<NB;i++)for(let j=0;j<NA;j++){const uu=j/(NA-1),vv=i/(NB-1);
  vert(b,front[i*NA+j],.01+.46*uu,V_TOP+.01+.22*vv,.01+.46*(1-uu),zone(vv,PART.tongue),[vv*.5,(uu-.5)*.26]);}
 gridIndex(b,o,NB,NA,false);
 const o2=b.pos.length/3;
 for(let i=0;i<NB;i++)for(let j=0;j<NA;j++){const uu=j/(NA-1),vv=i/(NB-1);
  vert(b,back[i*NA+j],.5+.46*uu,V_TOP+.01+.22*vv,.5+.46*(1-uu),zone(vv,PART.tongueBack),[vv*.5,(uu-.5)*.26]);}
 gridIndex(b,o2,NB,NA,true);
 // edges: left and right, and the tip of a flap
 const o3=b.pos.length/3;const edge=(j:number)=>{for(let i=0;i<NB;i++){const vv=i/(NB-1);
  vert(b,front[i*NA+j],.5,V_TOP+.02,.5,zone(vv,PART.tongueBack),[vv*.5,0]);vert(b,back[i*NA+j],.5,V_TOP+.02,.5,zone(vv,PART.tongueBack),[vv*.5,.03]);}};
 edge(0);edge(NA-1);
 gridIndex(b,o3,NB,2,true);gridIndex(b,o3+NB*2,NB,2,false);
 if(fold){const o4=b.pos.length/3;for(let j=0;j<NA;j++){const i=NB-1;vert(b,front[i*NA+j],.5,V_TOP+.02,.5,zone(1,PART.tongueBack),[.5,0]);vert(b,back[i*NA+j],.5,V_TOP+.02,.5,zone(1,PART.tongueBack),[.5,.03]);}
  for(let j=0;j<NA-1;j++){const a=o4+j*2;b.idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
}

/** The knit collar: a slim tube from the rim, nipping in above the ankle bones and rising up the leg, with a rolled lip. */
function buildCollar(b:Builder,height:number){
 // The rim loop, starting at the heel centre, forward along the inside, across the throat, back along the outside.
 const loop:T.Vector3[]=[];const N=26;
 for(let i=0;i<=N;i++){const s=lerp(.006,S_THROAT-.004,i/N);loop.push(surface(s,rimPhi(s)));}
 const front:T.Vector3[]=[];const sT=S_THROAT-.004,pr=rimPhi(sT);
 for(let i=1;i<10;i++){const phi=lerp(pr,Math.PI-pr,i/10);front.push(surface(sT+.012,phi).add(new T.Vector3(0,.02*Math.sin(Math.PI*i/10),0)));}
 const outside:T.Vector3[]=[];for(let i=N;i>=0;i--){const s=lerp(.006,S_THROAT-.004,i/N);outside.push(surface(s,Math.PI-rimPhi(s)));}
 const raw=[...loop,...front,...outside];
 // resample by arc length to M points (closed: the last equals the first's mirror at the heel)
 const M=56,len:number[]=[0];for(let i=1;i<raw.length;i++)len.push(len[i-1]+raw[i].distanceTo(raw[i-1]));const L=len[len.length-1];
 const ring:T.Vector3[]=[];for(let k=0;k<=M;k++){const d=L*k/M;let i=1;while(i<len.length-1&&len[i]<d)i++;const t=(d-len[i-1])/Math.max(1e-6,len[i]-len[i-1]);ring.push(raw[i-1].clone().lerp(raw[i],t));}
 const ctr=new T.Vector3();for(const p of ring)ctr.add(p);ctr.divideScalar(ring.length);
 // a lower (mid) collar sits a little wider, lower on the ankle
 const low=clamp((1.08-height)/.3,0,1),rx=.245+.02*low,rz=.215+.018*low;
 const ank=new T.Vector3(sx(.19),base(.19)+height,plan(.19).zc);
 const ROWS=13,NC=M+1,o=b.pos.length/3;
 const pts:T.Vector3[]=[];
 for(let r=0;r<ROWS;r++){const h=r/(ROWS-1);
  for(let k=0;k<=M;k++){const p=ring[k],a=Math.atan2(p.z-ctr.z,p.x-ctr.x);
   const top=new T.Vector3(ank.x+Math.cos(a)*rx,ank.y+.02*Math.cos(a),ank.z+Math.sin(a)*rz);
   const base0=p.clone().lerp(ctr,.03);base0.y-=.025;
   // the knit closes in quickly above the rim, then runs up the leg nearly straight, a touch narrower at the waist
   const e=1-(1-h)**3.4,P=base0.clone().lerp(top,e);P.y=lerp(base0.y,top.y,h*(2-h)*.55+h*.45);
   const waist=Math.sin(Math.PI*clamp((h-.25)/.6,0,1));P.x-=Math.cos(a)*.012*waist;P.z-=Math.sin(a)*.012*waist;
   pts.push(P);}}
 for(let r=0;r<ROWS;r++)for(let k=0;k<=M;k++){const P=pts[r*NC+k],uu=k/M,vv=r/(ROWS-1);
  b.pos.push(P.x,P.y,P.z);b.nor.push(0,0,0);b.uv.push(uu,V_TOP+.01+.17*vv);b.uvf.push(1-uu,V_TOP+.01+.17*vv);b.zone.push(uu,vv,0,PART.collar);b.surf.push(uu*L*1.08,P.y);}
 gridIndex(b,o,ROWS,NC,false);
 // lip and inner wall
 const o2=b.pos.length/3,IN=5;
 for(let r=0;r<IN;r++){const t=r/(IN-1);
  for(let k=0;k<=M;k++){const P=pts[(ROWS-1)*NC+k],a=Math.atan2(P.z-ank.z,P.x-ank.x);const inward=.022*Math.min(1,t*2.2),drop=t<.3?.008*t/.3:lerp(.008,.45,(t-.3)/.7);
   const Q=new T.Vector3(P.x-Math.cos(a)*inward,P.y+.007*Math.sin(Math.PI*Math.min(1,t*2))-drop,P.z-Math.sin(a)*inward);
   b.pos.push(Q.x,Q.y,Q.z);b.nor.push(0,0,0);b.uv.push(k/M,V_TOP+.185+.05*t);b.uvf.push(1-k/M,V_TOP+.185+.05*t);b.zone.push(k/M,1+t,0,t<.25?PART.collar:PART.collarInner);b.surf.push(k/M*L*1.08,Q.y);}}
 // join the last outer row to the lip
 for(let k=0;k<M;k++){const a=o+(ROWS-1)*NC+k,c=o2+k;b.idx.push(a,a+1,c,a+1,c+1,c);}
 gridIndex(b,o2,IN,NC,false);
}

/**
 * Rubber fins over the strike zone: low rounded ridges swept across the forefoot, slanting toward the toe as they rise. Beside
 * the laces they stop at the lace facing; past the last eyelet they run over the top from one side to the other.
 */
export const FIN_ROWS=12;
function buildFins(b:Builder){
 const e=cur.eyes,edge=e.hw+.04,NS=18,H=.02,W=.024;
 const P=new T.Vector3(),N=new T.Vector3(),Tg=new T.Vector3(),Bn=new T.Vector3(),prev=new T.Vector3(),next=new T.Vector3();
 const runs:{s:number;phi0:number;phi1:number}[]=[];
 for(let k=0;k<FIN_ROWS;k++){const s=lerp(.55,.9,k/(FIN_ROWS-1)),lo=Math.asin(.16);
  if(s>e.s1+.045)runs.push({s,phi0:lo,phi1:Math.PI-lo});
  else{runs.push({s,phi0:lo,phi1:phiAcross(s,cur.laceC-edge)});runs.push({s,phi0:Math.PI-lo,phi1:phiAcross(s,cur.laceC+edge)});}}
 const at=(r:typeof runs[number],t:number,out:T.Vector3)=>{const phi=lerp(r.phi0,r.phi1,t),yr=Math.abs(Math.sin(phi));return surface(clamp(r.s+.06*yr-.03,0,1),phi,out);};
 const prof=[[-1,-.3],[-.62,.85],[0,1],[.62,.85],[1,-.3]] as const;
 for(const r of runs){const o=b.pos.length/3;
  for(let i=0;i<=NS;i++){const t=i/NS;at(r,t,P);at(r,Math.max(0,t-.01),prev);at(r,Math.min(1,t+.01),next);Tg.subVectors(next,prev).normalize();
   const phi=lerp(r.phi0,r.phi1,t),s=clamp(r.s+.06*Math.abs(Math.sin(phi))-.03,0,1);surfaceNormal(s,phi,N);Bn.crossVectors(N,Tg).normalize();
   const h=H*Math.min(1,t/.1,(1-t)/.1)**.6,lift=reliefSY(s,Math.abs(Math.sin(phi))).r;
   for(let j=0;j<prof.length;j++){const [x,y]=prof[j];const Q=P.clone().addScaledVector(Bn,x*W*(y<0?1.15:1)).addScaledVector(N,y*h-.002+lift);
    vert(b,Q,.02+.96*t,.749+.008*j/4,.02+.96*t,[s,Math.abs(Math.sin(phi)),9,PART.fin],[Q.x,t]);}}
  gridIndex(b,o,NS+1,prof.length,false);}// (a run that goes the other way flips Tg and the profile with it: the winding stays outward)
}

/**
 * The lace cover: a smooth, flat-topped shell over the lacing (laces:'covered'), open at the throat like a tunnel, with a dark
 * underside and a thick back edge. Its sides sink into the upper; the front slopes down onto the vamp.
 */
function buildCover(b:Builder){
 const e=cur.eyes,W=e.hw+.095,s0=e.s0-.035,s1=e.s1+.035,NA=13,NS=20,P=new T.Vector3(),N=new T.Vector3();
 const top:T.Vector3[]=[],bot:T.Vector3[]=[];
 for(let i=0;i<NS;i++){const t=i/(NS-1),s=lerp(s0,s1,t),along=1-smooth(.72,1,t);
  for(let j=0;j<NA;j++){const a=-1+2*j/(NA-1),phi=phiAcross(s,cur.laceC+a*W);surface(s,phi,P);surfaceNormal(s,phi,N);
   const dome=.036*Math.pow(Math.max(0,1-a*a),.3)*along-.003+reliefSY(s,Math.abs(Math.sin(phi))).r;
   top.push(P.clone().addScaledVector(N,dome));bot.push(P.clone().addScaledVector(N,Math.max(-.004,dome-.008)));}}
 const o=b.pos.length/3;
 for(let i=0;i<NS;i++)for(let j=0;j<NA;j++){const t=i/(NS-1),a=j/(NA-1);vert(b,top[i*NA+j],.02+.96*t,.662+.009*a,.02+.96*t,[lerp(s0,s1,t),a,9,PART.cover],[top[i*NA+j].x,(a-.5)*W*2]);}
 gridIndex(b,o,NS,NA,true);
 const o2=b.pos.length/3;
 for(let i=0;i<NS;i++)for(let j=0;j<NA;j++){const t=i/(NS-1),a=j/(NA-1);vert(b,bot[i*NA+j],.5,.71,.5,[lerp(s0,s1,t),a,9,PART.coverIn],[0,0]);}// the underside samples a point in the dark lining: no texels of its own}
 gridIndex(b,o2,NS,NA,false);
 // the back edge (the tunnel's mouth)
 const o3=b.pos.length/3;for(let j=0;j<NA;j++){vert(b,top[j],.5,.664,.5,[s0,0,9,PART.cover],[0,0]);vert(b,bot[j],.5,.71,.5,[s0,0,9,PART.coverIn],[0,0]);}
 for(let j=0;j<NA-1;j++){const a=o3+j*2;b.idx.push(a,a+1,a+2,a+1,a+3,a+2);}
}

/** Where the tongue zone's decals sit and look from, for this shape and collar/laces (bootZones.ts). */
export function tongueAnchor(collar:Collar,laces:Laces):{t0:T.Vector3;d:T.Vector3;rx:number;ry:number}{
 const tg=cur.tongue;
 if(!hasTongue({collar,laces})){
  // no tongue: the front of a sock collar, or the top of the vamp (laceless, mid collar)
  if(collar==='sock')return {t0:new T.Vector3(sx(.4),base(.4)+.66,plan(.4).zc+cur.laceC*.8),d:new T.Vector3(-.78,-.62,0).normalize(),rx:.1,ry:.09};
  return {t0:laceLine(.5,0),d:new T.Vector3(-.55,-.83,0).normalize(),rx:.1,ry:.08};}
 if(tg.kind==='fold'){const {curve,fold}=tongueCurve();const c=curve.getPointAt(lerp(fold,1,.5));return {t0:c,d:new T.Vector3(-.38,-.92,0).normalize(),rx:.1,ry:.075};}
 // a slim tongue: a small zone that stays on the tongue at every corner (it tapers toward its top)
 return {t0:new T.Vector3(sx(.4),base(.4)+tg.top-.11,plan(.4).zc+cur.laceC*.8),d:new T.Vector3(-.78,-.62,0).normalize(),rx:Math.min(.07,tg.w*.68),ry:.055};
}

export type UpperGeometry={geometry:T.BufferGeometry;flipGeometry:T.BufferGeometry;tongueFold:number};
/** The tongue exists with laces under it and a low collar (a lace cover keeps a slim one at the throat). */
export const hasTongue=(o:{collar:Collar;laces:Laces})=>o.collar==='low'&&o.laces!=='laceless';
export function buildUpperGeometry(opt:BootOptions):UpperGeometry{
 const detail=opt.detail??'phone',b=newBuilder();
 const info=buildUpper(b,detail,opt.laces,opt.collar);
 const tongue=hasTongue(opt);
 if(tongue)buildTongue(b);
 if(opt.collar!=='low')buildCollar(b,opt.collar==='sock'?cur.sockTop:cur.midTop);
 if(cur.fins)buildFins(b);
 if(opt.laces==='covered')buildCover(b);
 const g=toGeometry(b);
 // Computed normals follow the relief; weld the seams the grid cannot see: the heel seam (first row: the inside and outside walls
 // meet), the toe tip (last row) and the closed rows' top centre (inside-wall end = outside-wall start, lining collapsed there).
 const groups:number[][]=[];const {o,NR,NC,NW,NL}=info;
 for(let i=0;i<NR;i++){const r=o+i*NC;const s=(b.zone[(r+NW)*4]);if(!isOpen(s)){const grp=[r+NW-1,r+NW+NL];for(let k=0;k<NL;k++)grp.push(r+NW+k);groups.push(grp);}}
 for(const r of [o,o+(NR-1)*NC])for(let j=0;j<NW;j++)groups.push([r+j,r+NC-1-j]);
 weldNormals(g,groups);
 g.computeBoundingSphere();g.computeBoundingBox();
 const f=new T.BufferGeometry();
 for(const name of ['position','normal','aZone','aSurf','aAO'])f.setAttribute(name,g.getAttribute(name));
 f.setAttribute('uv',g.getAttribute('uvFlip'));f.setIndex(g.getIndex());f.boundingSphere=g.boundingSphere;f.boundingBox=g.boundingBox;
 return {geometry:g,flipGeometry:f,tongueFold:tongue&&cur.tongue.kind==='fold'?tongueCurve().fold:2};
}

/* ---------- Soleplate ---------- */
/**
 * The soleplate (Oct 13 2026; user: "all the soles of the styles are so flat"). One lofted mesh per model and stud choice, row by
 * row heel → toe, each row one loop: the inside wall (standing off the upper, from its top lip down), the edge (an optional
 * stitched welt ledge, a vertical face, a rounded bevel), the underside across, and back up the outside. So the plate has a real
 * edge thickness, a side wall that wraps up the boot (tall at the heel counter and the toe bumper, low along the waist), a raised
 * heel block with a crisp front edge, an arch cut-out (a midfoot bridge, deepest on the inside), a flex groove across the forefoot
 * and a slight rocker under the ball, and it follows the boot's heel lift and toe spring. The flat detail (tread, ribs, windows,
 * stud collars, stitches) is the plate's normal map (bootScene.ts plateTextures).
 */
export const GUM_T=.036;
export const isFlatSole=(t:StudType)=>t==='indoor'||t==='futsal';
/** s for a given x along the boot (inverse of sx, clamped). */
export const sAt=(x:number)=>clamp((x+BOOT_L/2)/BOOT_L,0,1);
/** The split plate: the arch where the front and heel plates part. */
export const archGap=(s:number)=>smooth(.29,.33,s)*(1-smooth(.52,.56,s));
/** The raised heel block's front edge (the "heel breast"). */
export const HEEL_BREAST=.27;
export const heelBlock=(s:number)=>cur.plate.heel*(1-smooth(HEEL_BREAST-.014,HEEL_BREAST+.004,s));
/** The arch cut-out: the underside rises under the midfoot, more on the inside (f < 0); a split plate opens right up. */
export function archRise(s:number,f:number,studs:StudType){
 if(isFlatSole(studs))return 0;
 const p=cur.plate;
 if(studs==='split')return Math.max(0,p.t-.004)*archGap(s);
 // never through the plate: the bridge keeps at least 0.7 mm under the upper
 return Math.min(p.arch,p.t-.007)*(.8-.2*clamp(f,-1,1))*smooth(HEEL_BREAST-.002,.34,s)*(1-smooth(.5,.585,s));
}
const flexGroove=(s:number)=>.0045*Math.exp(-1*((s-.635)/.011)**2);
/** The plate's underside at s and across f (−1 inside edge … 1 outside edge). */
export function plateUnder(s:number,f:number,studs:StudType){
 if(isFlatSole(studs))return base(s)*.4+toeSpring(s)*.6-GUM_T+.004*smooth(.75,1,Math.abs(f));
 const p=cur.plate;
 return base(s)-p.t-heelBlock(s)+archRise(s,f,studs)+flexGroove(s)-p.rocker*bump(s,.5,.97);
}
/** Top and centre-line underside of the plate at s (kept for the tests and the stance). */
export function plateTop(s:number){return base(s)+.014;}
export function plateBottom(s:number,studs:StudType){return plateUnder(s,0,studs);}
/** f across the plate for a point (x, z). */
export function acrossF(x:number,z:number){const s=sAt(x),p=plan(s);return clamp(z>=p.zc?(z-p.zc)/Math.max(.02,p.lat):(z-p.zc)/Math.max(.02,p.med),-1,1);}
/** The underside under a point (x, z): studs stand here. */
export const underAt=(x:number,z:number,studs:StudType)=>plateUnder(sAt(x),acrossF(x,z),studs);
/** Height of the soleplate's underside on the centre line at x. */
export const soleBottom=(x:number,studs:StudType='fg')=>plateBottom(sAt(x),studs);
/** Outward normal of the plan outline (x, z) at s on one side (0 inside, 1 outside). */
function edgeNormal(s:number,side:0|1){
 if(s<=1e-4)return [-1,0];if(s>=1-1e-4)return [1,0];
 const e=.003,pt=(t:number)=>{const p=plan(t);return [sx(t),p.zc+(side?p.lat:-p.med)];},a=pt(Math.max(0,s-e)),c=pt(Math.min(1,s+e));
 const dx=c[0]-a[0],dz=c[1]-a[1],n=side?[-dz,dx]:[dz,-dx],l=Math.hypot(n[0],n[1])||1;return [n[0]/l,n[1]/l];
}
/** Row stations for the plate: dense at both ends (round heel and toe) and at the heel breast, the arch edges and the flex groove. */
function plateRows(n:number){
 const M=1200,acc=new Float64Array(M+1);
 const d=(s:number)=>1+5*Math.exp(-s/.03)+5*Math.exp(-1*(1-s)/.03)+4*Math.exp(-1*((s-HEEL_BREAST+.005)/.014)**2)+2*Math.exp(-1*((s-.635)/.016)**2)+1.2*Math.exp(-1*((s-.31)/.03)**2)+1.2*Math.exp(-1*((s-.545)/.03)**2);
 for(let i=1;i<=M;i++)acc[i]=acc[i-1]+d((i-.5)/M)/M;
 const out:number[]=[];let i=0;for(let k=0;k<n;k++){const t=acc[M]*k/(n-1);while(i<M-1&&acc[i+1]<t)i++;out.push(clamp((i+(t-acc[i])/Math.max(1e-9,acc[i+1]-acc[i]))/M,0,1));}
 out[0]=0;out[n-1]=1;return out;
}
/** UV v bands of the plate texture: the underside fills 0–.8, the edge and wall strip .8–1 (bootScene.ts plateTextures). */
export const PLATE_V={under:.8,bevel:.81,face:.84,weltLo:.87,weltHi:.9,wallLo:.92,top:1};
export function buildSoleGeometry(studs:StudType='fg',detail:'phone'|'desktop'='phone'):T.BufferGeometry{
 const p=cur.plate,NRW=detail==='desktop'?84:66,S=plateRows(NRW),KW=5,KU=detail==='desktop'?13:11;
 const pos:number[]=[],uv:number[]=[],idx:number[]=[],P=new T.Vector3(),N=new T.Vector3();let NC=0;
 const Lh=BOOT_L/2;
 for(const s of S){
  const yb=base(s),sn=clamp(s,.003,.997),cup=1-smooth(.02,.22,s);
  let h=wallHeight(s,studs);if(p.wave&&s<.32)h*=1+.28*Math.sin(s*Math.PI*2/.075)*smooth(.03,.08,s)*(1-smooth(.24,.32,s));
  // the scalloped edge (a wave plate): the underside's outline bulges out and in along the whole boot
  const wv=p.wave*(.5+.5*Math.sin(s*Math.PI*2/.083-1))*smooth(.02,.07,s)*(1-smooth(.93,.99,s));
  let lo=0,hi=Math.PI/2;for(let i=0;i<22;i++){const m=(lo+hi)/2;surface(s,m,P);if(P.y-yb<h)lo=m;else hi=m;}
  const pt=lo,pl=plan(s);
  const side=(sd:0|1)=>{const pts:number[][]=[];const [nx,nz]=edgeNormal(s,sd),sgn=sd?1:-1,yE=plateUnder(s,sgn,studs);
   // the wall, top lip first, flaring into a cup low at the heel
   for(let k=0;k<KW;k++){const t=k/(KW-1),phi=sd?Math.PI-pt*(1-t):pt*(1-t);surface(s,phi,P);surfaceNormal(sn,phi,N);
    const th=k===0?.0012:.0055+.007*cup*t*t;pts.push([P.x+N.x*th,P.y+N.y*th,P.z+N.z*th,s,k===0?PLATE_V.top:lerp(PLATE_V.top-.02,PLATE_V.wallLo,t)]);}
   const ex=sx(s),ez=pl.zc+sgn*(sd?pl.lat:pl.med),o0=.0055+.007*cup,fl=p.flare,thick=Math.max(.004,yb-yE),r=Math.min(p.bevel,thick*.45);
   // under the arch the edge is scooped in (more on the inside): the bridge is narrower than the footprint
   // the model's waist (a slim racing waist scoops in far, a classic hardly at all) and a narrower heel plate on the speed boots
   const inset=isFlatSole(studs)?0:(studs==='split'?0:p.waist[sd]*smooth(HEEL_BREAST,.35,s)*(1-smooth(.49,.585,s)))+p.heelIn*(1-smooth(.2,.3,s))-wv;
   const at=(o:number,y:number,v:number)=>pts.push([ex+nx*o,y,ez+nz*o,s,v]);
   at(o0+fl*.55,yb-.0015,PLATE_V.wallLo-.01);
   if(p.welt){const w=fl+.006;at(o0+w,yb-.004,PLATE_V.weltHi);at(o0+w-inset*.3,Math.max(yE+r+.002,yb-.013),PLATE_V.weltLo);}
   at(o0+fl-inset*.5,Math.max(yE+r+.001,yb-(p.welt?.016:.006)),PLATE_V.face);
   at(o0+fl-inset,yE+r,PLATE_V.bevel+.01);at(o0+fl-inset-r*.293,yE+r*.293,PLATE_V.bevel);
   const xo=ex+nx*(o0+fl-inset-r),zo=ez+nz*(o0+fl-inset-r);pts.push([xo,yE,zo,(xo+Lh)/BOOT_L,PLATE_V.under*(zo+.62)/1.24]);
   return pts;};
  const A=side(0),B=side(1),bm=A[A.length-1],bl=B[B.length-1],row=[...A];
  for(let k=1;k<KU;k++){const t=k/KU,x=lerp(bm[0],bl[0],t),z=lerp(bm[2],bl[2],t);row.push([x,plateUnder(s,-1+2*t,studs),z,(x+Lh)/BOOT_L,PLATE_V.under*(z+.62)/1.24]);}
  row.push(...B.reverse());NC=row.length;
  for(const q of row){pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);}
 }
 for(let i=0;i<S.length-1;i++)for(let j=0;j<NC-1;j++){const a=i*NC+j,c=a+NC;idx.push(a,c,a+1,a+1,c,c+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
 g.computeVertexNormals();
 // the heel and toe rows collapse onto a line: give each pair of coinciding vertices one normal
 const n=g.getAttribute('normal') as T.BufferAttribute,v=new T.Vector3(),w=new T.Vector3();
 for(const r of [0,(S.length-1)*NC])for(let j=0;j<NC/2;j++){const a=r+j,b=r+NC-1-j;v.fromBufferAttribute(n,a).add(w.fromBufferAttribute(n,b));if(v.lengthSq()<1e-8)continue;v.normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}
 g.computeBoundingSphere();return g;
}
/** Height of the heel counter at the heel centre (dm above the underside), for the heel decal band. */
export const heelCounterTop=()=>Math.max(cur.plate.heelWrap,.21*cur.heelCtr*(cur.plate.heelWrap>0?0:1));

/* ---------- Studs ---------- */
/** Stud shapes. Every layout is built into ONE merged mesh (one draw call), metal tips included. */
export type StudShape='cone'|'coneShort'|'pod'|'blade'|'bladeThin'|'bladeRound'|'slim'|'cluster'|'chevron'|'tri'|'halfmoon'|'sg'|'sgShort'|'ag'|'nub';
export type StudSpot={x:number;z:number;yaw:number;scale:number;shape:StudShape};
export type StudLayout=StudSpot[];
const at=(s:number,f:number)=>{const p=plan(s);return {x:sx(s),z:p.zc+(f<0?p.med:p.lat)*f};};
/** Outline tangent yaw at s on side f (blades follow the edge of the plate). */
const edgeYaw=(s:number,f:number)=>{const a=at(s-.01,f),b=at(s+.01,f);return -Math.atan2(b.z-a.z,b.x-a.x);};
/** The modern pattern (kept for reference by the tests): 4 heel + 8 forefoot. */
export const FG_SPOTS=[...HEEL4,...FORE8] as const;
const BLADE_OF:Record<BladeStyle,StudShape>={round:'bladeRound',slim:'slim',modern:'blade',cluster:'cluster',tri:'tri',chevron:'chevron',halfmoon:'halfmoon',mix:'blade'};
export function studLayout(type:StudType):StudLayout{
 const L:StudLayout=[];const add=(s:number,f:number,shape:StudShape,yaw=0,scale=1)=>{const q=at(s,f);L.push({x:q.x,z:q.z,yaw,scale,shape});};
 const set=cur.studSet,heel=set.heel,fore=set.fore,centre=fore.some(([,f])=>Math.abs(f)<.15),round:StudShape=set.round??'cone',hub=set.hub??[.7,-.04];
 const isRound=(sh:StudShape)=>sh==='cone'||sh==='coneShort'||sh==='pod';
 const bladeOf=BLADE_OF[set.blade],mix=set.blade==='mix';
 // a mid-2000s power plate mixes them: cones down the middle, blades round the edge
 const foreShape=(shape:StudShape)=>(s:number,f:number):StudShape=>mix&&Math.abs(f)<.5?round:shape;
 const heelAll=(shape:StudShape,yawK=1)=>{for(const [s,f] of heel)add(s,f,shape,isRound(shape)?0:edgeYaw(s,f)*yawK+(s<.1?f*1.5:0));};
 // a round, blunt toe keeps its front studs a little further back from the edge
 const toeF=(f:number,s:number)=>s>.9?f*Math.min(1,.8+.25*(cur.taper.lat[1]-.4)):f;
 const bladeYaw=(s:number,f:number)=>edgeYaw(s,f)+(s>.9?f*1.6:0);
 const yawOf=(s:number,f:number,m:StylePos[2])=>{if(typeof m==='number')return m;
  if(m==='t'||m==='r'){const a=at(s,f),c=at(hub[0],hub[1]),dx=a.x-c.x,dz=a.z-c.z;return m==='r'?-Math.atan2(dz,dx):-Math.atan2(dx,-dz);}return bladeYaw(s,f);};
 const foreAll=(shape:StudShape|((s:number,f:number)=>StudShape),yaw:(s:number,f:number)=>number,scale=1)=>{for(const [s,f] of fore){const c=Math.abs(f)<.15,sh=typeof shape==='function'?shape(s,f):shape;
  add(s,toeF(f,s),sh,isRound(sh)?0:c?1.4:yaw(s,f),c?scale*.85:scale);}};
 /** The model's own forefoot arrangement for the bladed layouts (a swirl cluster, a half-moon ring), else its stud ring. */
 const styled=(shape:StudShape|((s:number,f:number)=>StudShape),scale=1,yaw:(s:number,f:number)=>number=bladeYaw)=>{
  if(!set.styleFore){foreAll(shape,yaw,scale);return false;}
  for(const [s,f,m,sc] of set.styleFore){const sh=typeof shape==='function'?shape(s,f):shape;add(s,toeF(f,s),sh,isRound(sh)?0:m==null||m==='e'?yaw(s,f):yawOf(s,f,m),(sc??1)*scale);}return true;};
 switch(type){
  case 'fg':heelAll(round);
   if(set.fgFore)for(const [s,f] of set.fgFore)add(s,toeF(f,s),round,0,Math.abs(f-hub[1])<.05&&Math.abs(s-hub[0])<.02?.9:1);
   else{foreAll(round,()=>0);if(!centre)add(.69,0,round,0,.85);}break;
  case 'blade':for(const [s,f] of heel)add(s,f,bladeOf,edgeYaw(s,f)+(s<.1?f*1.8:0));
   if(!styled(foreShape(bladeOf))&&!centre){add(.66,-.08,mix?round:bladeOf,1.4,.7);add(.74,.12,mix?round:bladeOf,1.4,.7);}break;
  case 'hybrid':heelAll(round);if(!styled(foreShape(bladeOf),.95)&&!centre){add(.69,0,round,0,.85);add(.58,0,round,0,.75);}break;
  case 'chevron':heelAll('chevron',0);for(const sp of L)sp.yaw=Math.PI;
   if(!styled('chevron',.85,(s,f)=>edgeYaw(s,f)*.5)&&!centre)add(.7,0,'chevron',0,.85);break;
  case 'sg':for(const [s,f] of [[.07,-.5],[.07,.5],[.6,-.7],[.6,.7],[.84,-.56],[.84,.52]] as const)add(s,f,'sg');break;
  case 'sgmix':for(const [s,f] of [[.07,-.5],[.07,.5],[.6,-.72],[.6,.72],[.84,-.56],[.84,.52]] as const)add(s,f,'sg');
   for(const [s,f] of [[.18,-.6],[.18,.6],[.72,-.62],[.72,.6],[.71,0],[.93,-.2]] as const)add(s,f,'sgShort');break;
  case 'ag':for(let s=.05;s<.97;s+=.075){if(s>.29&&s<.47)continue;const row=Math.round(s/.075)%2;
    for(const f of row?[-.7,-.25,.25,.7]:[-.48,0,.48]){const h=heelRound(s)*(s>.85?Math.sqrt(Math.max(0,1-((s-.85)/.15)**2)):1);if(Math.abs(f)>h*.85)continue;add(s,f,'ag');}}break;
  case 'turf':for(let s=.035;s<.975;s+=.045)for(let f=-.84;f<=.85;f+=.22){const ff=f+((Math.round(s/.045)%2)?.1:0);if(Math.abs(ff)>.88)continue;if(s>.3&&s<.5&&Math.abs(ff)<.55)continue;
   const h=heelRound(s)*(s>.85?Math.sqrt(Math.max(0,1-((s-.85)/.16)**2)):1);if(Math.abs(ff)>h*.9)continue;add(s,ff,'nub');}break;
  case 'split':heelAll(round);foreAll('bladeThin',bladeYaw);if(!centre){add(.7,-.1,'bladeThin',1.35,.75);add(.78,.12,'bladeThin',1.35,.75);}break;
  case 'carbon':{const sh:StudShape=set.blade==='tri'||set.blade==='halfmoon'||set.blade==='chevron'?bladeOf:'chevron';
   for(const [s,f] of heel)add(s,f,'tri',edgeYaw(s,f)+Math.PI+(s<.1?f*1.6:0),1.05);
   if(!styled(sh,1,(s,f)=>edgeYaw(s,f)*.4)){add(.66,-.02,'tri',0,.8);add(.76,.02,'tri',0,.8);}break;}
  default:break;// indoor, futsal: a flat gum sole
 }
 return L;
}
/** How far each shape reaches below the plate (dm, scale 1), for the ground line and the stance. */
export const STUD_DEPTH:Record<StudShape,number>={cone:.13,coneShort:.1,pod:.125,blade:.128,bladeThin:.125,bladeRound:.12,slim:.122,cluster:.1,chevron:.12,tri:.13,halfmoon:.11,sg:.158,sgShort:.1,ag:.085,nub:.05};

/*
 * Moulded stud geometry (Oct 13 2026, user: "the blade studs look crude"). Every stud is LOFTED from a rounded plan outline: the
 * outline's corners are filleted (no sharp box edges), it is resampled to a fixed count so rings line up, and rings are stacked
 * from a flange that fillets into the plate, down a drafted body (wider base, narrower tip: each axis scales separately, so a
 * blade gets shorter AND thinner toward the tip), to a rounded tip (the last rings step in along the outline normal on a quarter
 * circle) closed by a domed fan. The ring index wraps, so computeVertexNormals gives smooth normals all round: soft highlights,
 * not facets. Blades bend slightly in plan (a banana curve). SG studs: a raised boss, a filleted HEX collar, a cylindrical body
 * with a rounded edge and a domed metal tip, all lofts too.
 */
type V2=[number,number];
type Piece={g:T.BufferGeometry;h:number;metal?:boolean};
/** Fillet every corner of a closed polygon (radius r, or r[i] per corner; clamped so neighbouring arcs never overlap). */
export function filletPoly(pts:readonly V2[],r:number|readonly number[],seg=4):V2[]{
 const out:V2[]=[],n=pts.length;
 for(let i=0;i<n;i++){const P=pts[i],A=pts[(i+n-1)%n],B=pts[(i+1)%n];
  const ux=A[0]-P[0],uy=A[1]-P[1],lu=Math.hypot(ux,uy),vx=B[0]-P[0],vy=B[1]-P[1],lv=Math.hypot(vx,vy);
  const u:V2=[ux/lu,uy/lu],v:V2=[vx/lv,vy/lv],th=Math.acos(clamp(u[0]*v[0]+u[1]*v[1],-1,1))/2;
  let R=typeof r==='number'?r:r[i],d=R/Math.tan(th);const dmax=Math.min(lu,lv)*.48;if(d>dmax){d=dmax;R=d*Math.tan(th);}
  const t1:V2=[P[0]+u[0]*d,P[1]+u[1]*d],t2:V2=[P[0]+v[0]*d,P[1]+v[1]*d],bx=u[0]+v[0],by=u[1]+v[1],bl=Math.hypot(bx,by)||1,hh=R/Math.sin(th);
  const C:V2=[P[0]+bx/bl*hh,P[1]+by/bl*hh];let a0=Math.atan2(t1[1]-C[1],t1[0]-C[0]),da=Math.atan2(t2[1]-C[1],t2[0]-C[0])-a0;
  while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  for(let k=0;k<=seg;k++){const a=a0+da*k/seg;out.push([C[0]+Math.cos(a)*R,C[1]+Math.sin(a)*R]);}}
 return out;
}
/** Resample a closed outline to n points evenly by arc length, counter-clockwise (x along the stud, y = its local z). turnK > 0
 *  also spends points on turning (dm per radian), so the tight rounded ends of a thin blade get enough points to stay smooth. */
function resample(pts:readonly V2[],n:number,turnK=0):V2[]{
 let area=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];area+=a[0]*b[1]-b[0]*a[1];}
 const P=area<0?[...pts].reverse():[...pts],m=P.length,acc=[0];
 const dir=(i:number)=>{const a=P[(i+m)%m],b=P[(i+1)%m];return Math.atan2(b[1]-a[1],b[0]-a[0]);};
 for(let i=0;i<m;i++){const a=P[i],b=P[(i+1)%m];let turn=0;if(turnK){turn=dir(i+1)-dir(i);while(turn>Math.PI)turn-=2*Math.PI;while(turn<-Math.PI)turn+=2*Math.PI;}
  acc.push(acc[i]+Math.hypot(b[0]-a[0],b[1]-a[1])+turnK*Math.abs(turn));}
 const L=acc[m],out:V2[]=[];let j=0;
 for(let k=0;k<n;k++){const t=L*k/n;while(j<m-1&&acc[j+1]<t)j++;const a=P[j],b=P[(j+1)%m],f=(t-acc[j])/Math.max(1e-9,acc[j+1]-acc[j]);out.push([lerp(a[0],b[0],f),lerp(a[1],b[1],f)]);}
 return out;
}
const circlePts=(r:number,n:number):V2[]=>Array.from({length:n},(_,i)=>[Math.cos(i/n*Math.PI*2)*r,Math.sin(i/n*Math.PI*2)*r] as V2);
/** One ring of a loft: y (below the plate is negative), the plan scaled about the centroid (sx along, sz across), then offset along
 *  the outline's normal (off > 0 out, < 0 in). */
type Ring={y:number;sx:number;sz:number;off:number};
/**
 * Loft rings over a rounded outline into one indexed, smooth-shaded mesh, capped at the bottom with a fan (`capDy` below the last
 * ring: a dome) unless cap is false. `bend` curves the plan (dm of bow over the length).
 */
function loft(outline:readonly V2[],rings:readonly Ring[],o:{bend?:number;cap?:boolean;capDy?:number}={}):T.BufferGeometry{
 const n=outline.length;let cx=0,cz=0;for(const p of outline){cx+=p[0];cz+=p[1];}cx/=n;cz/=n;
 let half=0;for(const p of outline)half=Math.max(half,Math.abs(p[0]-cx));half=half||1;
 const nrm=outline.map((p,i)=>{const a=outline[(i+n-1)%n],b=outline[(i+1)%n],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1;return [tz/l,-tx/l] as V2;});
 const pos:number[]=[],idx:number[]=[],bend=o.bend??0;
 for(const r of rings)for(let i=0;i<n;i++){const p=outline[i],x=cx+(p[0]-cx)*r.sx+nrm[i][0]*r.off,z=cz+(p[1]-cz)*r.sz+nrm[i][1]*r.off;
  pos.push(x,r.y,z+bend*(1-((x-cx)/half)**2));}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,c,b,b,c,d);}
 if(o.cap!==false){const last=rings[rings.length-1],ci=pos.length/3;pos.push(cx,last.y-(o.capDy??0),cz+bend);const base=(rings.length-1)*n;
  for(let i=0;i<n;i++)idx.push(base+i,ci,base+(i+1)%n);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 // winding check: a body vertex's normal must point away from the axis; flip once if the outline came out the other way round
 const nA=g.getAttribute('normal'),k=Math.min(rings.length-1,3)*n,dx=pos[k*3]-cx,dz=pos[k*3+2]-cz-bend*(1-((pos[k*3]-cx)/half)**2);
 if(nA.getX(k)*dx+nA.getZ(k)*dz<0){for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}g.setIndex(idx);g.computeVertexNormals();}
 return g;
}
/** Flange rings: the stud's root fillets out into the plate (fw wide), buried a little above the underside so no seam shows. */
/** Flange rings: a concave fillet (a quarter circle centred off the stud) from the plate down into the stud's side, fw wide and
 *  depth deep, starting a little above the underside so no seam shows. */
const flange=(fw:number,depth=.011,hi=true,dome=false):Ring[]=>{const out:Ring[]=[{y:.006,sx:1,sz:1,off:fw*1.05}];
 // dome: a convex pad instead (the raised pods), then a small fillet into the stud
 for(const t of hi?[0,.3,.58,.82,1]:[0,.45,1]){const a=t*Math.PI/2;out.push(dome?{y:-depth*Math.sin(a)*.85,sx:1,sz:1,off:fw*Math.cos(a)*.85+.004}:{y:-depth*(1-Math.cos(a)),sx:1,sz:1,off:fw*(1-Math.sin(a))});}
 if(dome)out.push({y:-depth,sx:1,sz:1,off:0});return out;};
/**
 * A moulded stud from an outline: flange, a drafted body (the plan scales to tip[0] along and tip[1] across by the tip, with a
 * slight convex belly), a rounded tip of radius rt (quarter-circle rings stepping in nearly to the vertical), a domed cap.
 * Sleeker studs (fix pass Oct 13 2026; user: "the cones and blades still read as little cups with flat ends"): the flange is
 * subtler (55 % of fw, 1.1 mm deep), the tip rounds further over (to 79°) and closes with a real dome (capK × rt high, not a
 * flat fan), and the whole stud still ends exactly h below the plate (the stance and STUD_DEPTH are unchanged).
 */
function mouldedAt(outline:readonly V2[],h:number,tip:readonly [number,number],rt:number,o:{bend?:number;fw?:number;fd?:number;body?:number;belly?:number;hi?:boolean;dome?:boolean;capK?:number;rtx?:number;rtv?:number}={}):T.BufferGeometry{
 const hi=o.hi??true,fd=o.fd??.011,rings=flange(o.dome?o.fw??.05:(o.fw??.018)*.55,fd,hi,o.dome),nb=o.body??3,belly=o.belly??.0025;
 const rtv=o.rtv??rt,tipA=hi?[.4,.85,1.2,1.38]:[.55,1.02,1.38],cap=rt*(o.capK??.4),y1=-(h-rtv*Math.sin(tipA[tipA.length-1])-cap);
 for(let i=1;i<=nb;i++){const t=i/nb,e=t**.92;rings.push({y:lerp(-fd,y1,t),sx:lerp(1,tip[0],e),sz:lerp(1,tip[1],e),off:belly*Math.sin(Math.PI*t)});}
 // the tip rounds over by shrinking the plan toward its centre (not an inward offset, which folds over the tight rounded ends
 // of a thin blade): d in from the outline at each step, as a fraction of the half-length and half-width; rtx > rt rounds a
 // blade's bottom edge off along its length too, over rtv of height (a soft, elliptical end instead of a square corner)
 let cx=0,cz=0;for(const p of outline){cx+=p[0];cz+=p[1];}cx/=outline.length;cz/=outline.length;
 let hx=0,hz=0;for(const p of outline){hx=Math.max(hx,Math.abs(p[0]-cx));hz=Math.max(hz,Math.abs(p[1]-cz));}
 const rtx=o.rtx??rt;
 for(const a of tipA){const k=1-Math.cos(a);rings.push({y:y1-rtv*Math.sin(a),sx:Math.max(tip[0]*.15,tip[0]-rtx*k/hx),sz:Math.max(tip[1]*.15,tip[1]-rt*k/hz),off:0});}
 return loft(outline,rings,{bend:o.bend,capDy:cap});
}
/** A blade's plan: a superellipse w long and d thick (|x/a|^e + |z/b|^e = 1): gently convex sides that run into rounded ends,
 *  so the light rolls over it (e≈3: a soft blade; higher: squarer ends). Sampled densely, then evened out by arc length. */
const bladePlan=(w:number,d:number,e:number,n:number)=>resample(Array.from({length:96},(_,i)=>{const t=i/96*Math.PI*2,c=Math.cos(t),sn=Math.sin(t);
 return [w/2*Math.sign(c)*Math.abs(c)**(2/e),d/2*Math.sign(sn)*Math.abs(sn)**(2/e)] as V2;}),n,.07);
function studPieces(shape:StudShape,detail:'phone'|'desktop'):Piece[]{
 const hi=detail==='desktop',NB=hi?26:18,NC=hi?20:14,FS=hi?4:3;
 // one level of detail flag for every lofted stud (phones: fewer rings and outline points; the shape is the same)
 const moulded=(ol:readonly V2[],h:number,tip:readonly [number,number],rt:number,o:Parameters<typeof mouldedAt>[4]={})=>mouldedAt(ol,h,tip,rt,{...o,hi});
 switch(shape){
  // a conical stud: tapers to a tip 40 % of the base (35–45 % on real FG cones) that rounds over into a soft dome
  case 'cone':return [{g:moulded(circlePts(.054,NC),.13,[.4,.4],.012,{fw:.022,belly:.002}),h:.13}];
  case 'coneShort':return [{g:moulded(circlePts(.05,NC),.1,[.44,.44],.012,{fw:.02,belly:.002}),h:.1}];
  // a round stud on a raised round pod (the "3D pods" plates of the mid 2010s): a wide, low dome flange
  case 'pod':return [{g:moulded(circlePts(.05,NC),.125,[.44,.44],.012,{fw:.05,fd:.026,belly:.002,dome:true}),h:.125}];
  // modern blade: long and thin, rounded ends, a clear draft (66 % long and 34 % thick at the tip: a narrow edge whose bottom
  // rounds off along its length), a bow
  case 'blade':return [{g:moulded(bladePlan(.19,.044,2.8,NB),.128,[.66,.34],.0065,{bend:.016,fw:.016,capK:.4,rtx:.03,rtv:.016}),h:.128}];
  case 'bladeThin':return [{g:moulded(bladePlan(.18,.036,2.8,NB),.125,[.64,.36],.0055,{bend:.017,fw:.015,capK:.4,rtx:.028,rtv:.015}),h:.125}];
  // the older moulded blade: a fat stadium, little draft
  case 'bladeRound':return [{g:moulded(bladePlan(.15,.062,2.3,NB),.12,[.82,.7],.013,{fw:.02}),h:.12}];
  // the 1990s slim blade: long and thin, tapering to a narrow edge
  case 'slim':return [{g:moulded(bladePlan(.2,.034,2.6,NB),.122,[.6,.36],.0055,{bend:.013,fw:.015,capK:.4,rtx:.03,rtv:.016}),h:.122}];
  // the late 1990s multi-directional cluster: short, small blades
  case 'cluster':return [{g:moulded(bladePlan(.1,.032,2.6,NB),.1,[.64,.4],.006,{bend:.01,fw:.014,capK:.4,rtx:.016,rtv:.01}),h:.1}];
  case 'chevron':{// an arrowhead pointing to the toe (+x): crisper corners (still filleted, never a knife edge), a stronger draft
   const p:V2[]=[[.062,0],[-.026,.086],[-.062,.068],[.002,0],[-.062,-.068],[-.026,-.086]];
   return [{g:moulded(resample(filletPoly(p,[.009,.007,.007,.005,.007,.007],FS),NB+4),.12,[.64,.56],.008,{fw:.014,capK:.45,rtx:.012,rtv:.012}),h:.12}];}
  case 'tri':{const p:V2[]=[[.074,0],[-.05,.056],[-.05,-.056]];return [{g:moulded(resample(filletPoly(p,.011,FS+1),NB),.13,[.46,.4],.01,{fw:.016,capK:.5}),h:.13}];}
  // a half-moon (a D): the round side faces out from the ring's hub, the flat side in (the late-2010s rotational plates)
  case 'halfmoon':{const p:V2[]=[[-.018,-.05]];for(let i=1;i<8;i++){const a=-Math.PI/2+i*Math.PI/8;p.push([-.018+Math.cos(a)*.062,Math.sin(a)*.05]);}p.push([-.018,.05]);
   return [{g:moulded(resample(filletPoly(p,p.map((_,i)=>i===0||i===p.length-1?.012:0),FS),NB),.11,[.6,.54],.008,{fw:.015,capK:.35}),h:.11}];}
  case 'sg':case 'sgShort':{const short=shape==='sgShort',h=.1,r0=short?.052:.062,r1=short?.038:.05,H=short?.1:.158;
   // a raised threaded boss moulded into the plate, a filleted hex collar (flat faces, soft edges), a cylindrical body with a
   // rounded bottom edge, and (long studs) a domed metal tip
   const boss=moulded(circlePts(r0+.032,NC),.01,[1,1],.003,{fw:.012,fd:.004,body:1,belly:0});
   const hexR=r0+.02,hex=resample(filletPoly(Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3+Math.PI/6)*hexR,Math.sin(i*Math.PI/3+Math.PI/6)*hexR] as V2),.006,2),hi?36:24);
   const collar=loft(hex,[{y:-.006,sx:1,sz:1,off:-.003},{y:-.008,sx:1,sz:1,off:0},{y:-.019,sx:1,sz:1,off:0},{y:-.021,sx:1,sz:1,off:-.003},{y:-.0215,sx:.82,sz:.82,off:-.003}],{capDy:0});
   const bodyR:Ring[]=[{y:-.018,sx:1,sz:1,off:0}];for(let i=1;i<=3;i++){const t=i/3;bodyR.push({y:lerp(-.018,-h+.008,t),sx:lerp(1,r1/r0,t),sz:lerp(1,r1/r0,t),off:0});}
   bodyR.push({y:-h+.003,sx:r1/r0,sz:r1/r0,off:-.003},{y:-h,sx:r1/r0,sz:r1/r0,off:-.008});
   const body=loft(circlePts(r0,NC),bodyR,{capDy:0});
   if(short)return [{g:boss,h:H},{g:collar,h:H},{g:body,h:H}];
   const tr=.042,tipR:Ring[]=[{y:-h+.004,sx:1,sz:1,off:0},{y:-h-.012,sx:1,sz:1,off:0},{y:-h-.03,sx:.96,sz:.96,off:0}];
   for(const a of [.5,.95,1.3])tipR.push({y:-h-.03-.02*Math.sin(a),sx:.96,sz:.96,off:-tr*.96*(1-Math.cos(a))*.62});
   return [{g:boss,h:H},{g:collar,h:H},{g:body,h:H},{g:loft(circlePts(tr,NC),tipR,{capDy:.002}),h:H,metal:true}];}
  case 'ag':{const h=.085,r0=.044,r1=.035,ri=.017,seg=hi?12:10;// short, hollow cone
   const pts=[new T.Vector2(0,.006),new T.Vector2(r0+.016,.006),new T.Vector2(r0+.006,-.002),new T.Vector2(r0,-.01),new T.Vector2(lerp(r0,r1,.5),-h*.5),new T.Vector2(r1,-h+.006),new T.Vector2(r1-.006,-h),
    new T.Vector2(ri+.004,-h),new T.Vector2(ri,-h+.006),new T.Vector2(ri*.8,-h+.04),new T.Vector2(0,-h+.042)];
   return [{g:new T.LatheGeometry(pts.reverse(),seg),h}];}
  default:return [{g:new T.LatheGeometry([new T.Vector2(0,-.05),new T.Vector2(.018,-.048),new T.Vector2(.027,-.032),new T.Vector2(.031,.004),new T.Vector2(0,.004)],6),h:.05}];
 }
}
/** Shape metrics for the tests: the base and tip footprint of a stud (x along, z across) and whether its normals are smooth. */
export function studProfile(shape:StudShape){
 const pcs=studPieces(shape,'phone'),g=pcs[pcs.length-1].metal?pcs[pcs.length-2].g:pcs[pcs.length-1].g,p=g.getAttribute('position') as T.BufferAttribute,h=pcs[0].h;
 // footprint (x along, z across: max − min, so a blade's bow does not count as thickness) of the vertices between two heights
 const span=(y0:number,y1:number)=>{let x0=9,x1=-9,z0=9,z1=-9;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<=y0&&y>=y1){const x=p.getX(i),z=p.getZ(i);x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}}
  return x1<x0?{x:0,z:0}:{x:x1-x0,z:z1-z0};};
 let bottom=0;for(let i=0;i<p.count;i++)bottom=Math.min(bottom,p.getY(i));
 // base: the body where the (subtler, 1.1 mm deep) flange meets it
 const root=span(.007,.003),base=span(-.009,-.024),tip=span(bottom*.8,bottom*.97);void h;
 const tris=pcs.reduce((a,pc)=>a+(pc.g.index?pc.g.index.count:pc.g.getAttribute('position').count)/3,0);
 for(const pc of pcs)pc.g.dispose();
 return {root,base,tip,bottom,tris,indexed:!!g.index};
}
function plateSlope(x:number,z:number,studs:StudType){const e=.02;return (underAt(x+e,z,studs)-underAt(x-e,z,studs))/(2*e);}
/**
 * All the studs of a layout merged into one mesh in the boot's frame. aStud.x = how far down the stud a vertex is (0 at the
 * plate, 1 at the tip) for contrast tips; aStud.y = 1 on metal (SG) tips. Null for the flat indoor soles.
 */
export function buildStudsGeometry(type:StudType,detail:'phone'|'desktop'='phone'):T.BufferGeometry|null{
 const lay=studLayout(type);if(!lay.length)return null;
 const cache=new Map<StudShape,Piece[]>();const parts:T.BufferGeometry[]=[];
 const M=new T.Matrix4(),Q=new T.Quaternion(),Qz=new T.Quaternion(),S=new T.Vector3(),P=new T.Vector3(),Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
 for(const st of lay){let pcs=cache.get(st.shape);if(!pcs){pcs=studPieces(st.shape,detail);cache.set(st.shape,pcs);}
  Q.setFromAxisAngle(Y,st.yaw);Qz.setFromAxisAngle(Z,Math.atan(plateSlope(st.x,st.z,type)));Q.premultiply(Qz);S.setScalar(st.scale);P.set(st.x,underAt(st.x,st.z,type)+.003,st.z);M.compose(P,Q,S);
  for(const pc of pcs){const g=(pc.g.index?pc.g.toNonIndexed():pc.g.clone());if(g.getAttribute('uv'))g.deleteAttribute('uv');
   const pp=g.getAttribute('position') as T.BufferAttribute,a=new Float32Array(pp.count*2);
   for(let i=0;i<pp.count;i++){a[i*2]=clamp(-pp.getY(i)/pc.h,0,1);a[i*2+1]=pc.metal?1:0;}
   g.setAttribute('aStud',new T.BufferAttribute(a,2));g.applyMatrix4(M);parts.push(g);}}
 for(const pcs of cache.values())for(const pc of pcs)pc.g.dispose();
 const g=mergeGeometries(parts,false)!;for(const p of parts)p.dispose();g.computeBoundingSphere();return g;
}
/** Lowest point of a layout (the ground line). */
export function studGround(type:StudType){
 const lay=studLayout(type);
 if(!lay.length){let m=9;for(let s=0;s<=1;s+=.02)m=Math.min(m,plateBottom(s,type));return m-.002;}
 return Math.min(...lay.map(s=>underAt(s.x,s.z,type)+.003-STUD_DEPTH[s.shape]*s.scale*Math.cos(Math.atan(plateSlope(s.x,s.z,type)))));
}

/* ---------- Laces and eyelets ---------- */
/** How far the lacing sits off the upper: the raised eyelet strip (sideRelief) plus its own height. */
const FACING=.008;
/** A flat lace: a tube squashed against the boot (wide and low with a real thickness, like a woven flat lace). */
function flatLace(curve:T.Curve<T.Vector3>,seg:number,nrm:(t:number)=>T.Vector3,shade=1){
 const r=.0115,rad=6,g=new T.TubeGeometry(curve,seg,r,rad,false),p=g.getAttribute('position') as T.BufferAttribute,c=new T.Vector3(),v=new T.Vector3();
 for(let i=0;i<=seg;i++){const t=i/seg;curve.getPointAt(t,c);const n=nrm(t);
  for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.fromBufferAttribute(p,k).sub(c);const d=v.dot(n);v.addScaledVector(n,-d*.45).add(c);p.setXYZ(k,v.x,v.y,v.z);}}
 g.computeVertexNormals();g.deleteAttribute('uv');
 const col=new Float32Array(p.count*3).fill(shade);g.setAttribute('color',new T.BufferAttribute(col,3));return g;
}
/** A point on the upper at (s, φ) lifted off the lacing strip. */
function onLacing(s:number,phi:number,lift:number,out=new T.Vector3()){const N=surfaceNormal(s,phi);return surface(s,phi,out).addScaledVector(N,FACING+lift);}
/**
 * The laces of the active shape, criss-crossed between the eyelet rows (a straight bar at the toe end), dipping into each eyelet,
 * and the eyelets themselves: small raised rings (darker: vertex colour) on the eyelet strip. A fold-over tongue hides the knot.
 */
export function buildLacesGeometry():T.BufferGeometry{
 const parts:T.BufferGeometry[]=[];const rows=eyeletRows(),n=rows.length;
 const seg=(a:{s:number;phi:number},b:{s:number;phi:number},hi:number)=>{
  const pts:T.Vector3[]=[onLacing(a.s,a.phi,-.016)];
  for(let i=0;i<=8;i++){const t=i/8;pts.push(onLacing(lerp(a.s,b.s,t),lerp(a.phi,b.phi,t),.004+(.009+hi)*Math.sin(Math.PI*t)**.6));}
  pts.push(onLacing(b.s,b.phi,-.016));
  const mid=surfaceNormal((a.s+b.s)/2,(a.phi+b.phi)/2,new T.Vector3());
  parts.push(flatLace(new T.CatmullRomCurve3(pts,false,'centripetal'),14,()=>mid));};
 // the toe end: a straight bar; then each pair of rows crossed (the over-strand a touch higher)
 seg({s:rows[n-1].s,phi:rows[n-1].phiIn},{s:rows[n-1].s,phi:rows[n-1].phiOut},0);
 for(let k=n-1;k>0;k--){const a=rows[k],b=rows[k-1];seg({s:a.s,phi:a.phiIn},{s:b.s,phi:b.phiOut},.004);seg({s:a.s,phi:a.phiOut},{s:b.s,phi:b.phiIn},0);}
 // eyelets
 const N=new T.Vector3(),P=new T.Vector3(),Zv=new T.Vector3(0,0,1),q=new T.Quaternion();
 for(const r of rows)for(const phi of [r.phiIn,r.phiOut]){surface(r.s,phi,P);surfaceNormal(r.s,phi,N);P.addScaledVector(N,FACING-.001);
  const t=new T.TorusGeometry(.0135,.0042,4,10);q.setFromUnitVectors(Zv,N);t.applyQuaternion(q);t.translate(P.x,P.y,P.z);t.deleteAttribute('uv');
  t.setAttribute('color',new T.BufferAttribute(new Float32Array(t.getAttribute('position').count*3).fill(.42),3));parts.push(t.index?t.toNonIndexed():t);}
 if(cur.tongue.kind!=='fold'){
  // A small, neat bow at the top row with two short ends, tucked toward the outside.
  const top=rows[0],cphi=(top.phiIn+top.phiOut)/2,c=surface(top.s,cphi,new T.Vector3()),nn=surfaceNormal(top.s,cphi,new T.Vector3());
  const o=c.clone().addScaledVector(nn,.03);
  const loop=(dir:number)=>new T.CatmullRomCurve3([o.clone(),o.clone().add(new T.Vector3(-.02,.035,.065*dir)),o.clone().add(new T.Vector3(-.07,.04,.095*dir)),o.clone().add(new T.Vector3(-.085,.012,.055*dir)),o.clone().add(new T.Vector3(-.035,0,.012*dir)),o.clone()],false,'catmullrom',.5);
  parts.push(flatLace(loop(1),22,()=>nn),flatLace(loop(-1),22,()=>nn));
  const end=(dir:number)=>{const pts:T.Vector3[]=[o.clone()];for(let i=1;i<=5;i++){const t=i/5;const s=lerp(top.s,top.s-.07,t),phi=cphi+dir*lerp(.04,.5,t);pts.push(onLacing(s,phi,.006+.012*(1-t)));}
   return flatLace(new T.CatmullRomCurve3(pts),16,()=>nn);};
  parts.push(end(1),end(-.6));
  const knot=new T.SphereGeometry(.017,8,6).scale(1,.6,1).translate(o.x,o.y,o.z);knot.deleteAttribute('uv');knot.setAttribute('color',new T.BufferAttribute(new Float32Array(knot.getAttribute('position').count*3).fill(.95),3));parts.push(knot.toNonIndexed());
 }
 const flat=parts.map(p=>p.index?p.toNonIndexed():p);
 const g=mergeGeometries(flat,false)!;for(const p of new Set([...parts,...flat]))p.dispose();
 return g;
}

/** World-space eyelet centres (inside and outside of each row) for the bake. */
export function eyeletPoints(){const out:T.Vector3[]=[];for(const r of eyeletRows()){out.push(surface(r.s,r.phiIn),surface(r.s,r.phiOut));}return out;}
