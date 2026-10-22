import type {BootSpec,PartId,StudKind} from './boot';
/**
 * boots · "Boots through time": every fact, material and number the exhibit shows, with where it comes from (Oct 12 2026; the
 * exhibit replaces the back-pass rule). Kept simple and true for 7–12 year olds. Where sources disagree or a number is only
 * "commonly said", the wording says so ("about", "often", "many boots", "for example"). No sales figures, no rankings, no prices:
 * boot lines are named in plain text and drawn as generic Paper boots with no logos, stripes or other brand marks.
 */
export const BEST_KEY='fi2-museum-boots-best';
export const ACCENT='#2a5bd7';

// ── Materials ──────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Every material a layer can be made of: its colour in the drawing and one line for a kid. */
export const MATS:Record<string,{name:string;color:string;line:string}>={
 cowhide:{name:'Thick cowhide leather',color:'#7b4b2a',line:'Strong and stiff. It soaked up rain and got heavy.'},
 calf:{name:'Thinner, softer leather',color:'#3a2a20',line:'Lighter and bends more easily than the old thick leather.'},
 kangaroo:{name:'Kangaroo or calf leather',color:'#232325',line:'Kangaroo leather is thin, light and soft, so you feel the ball.'},
 synthetic:{name:'Synthetic leather',color:'#c9372c',line:'Man-made. It soaks up less water and comes in any colour.'},
 knit:{name:'Knit or microfibre',color:'#2f9e8f',line:'Knitted like a sock, often with a thin coating so it keeps its shape.'},
 linen:{name:'Cotton or linen lining',color:'#e2d6bd',line:'Cloth inside, against your sock.'},
 leatherlining:{name:'Leather lining',color:'#c9a47c',line:'Soft leather inside, against your sock.'},
 mesh:{name:'Textile lining',color:'#d9d9d3',line:'Thin fabric inside that lets your foot breathe.'},
 leathersole:{name:'Leather sole',color:'#a7744d',line:'A thick leather sole, nailed and stitched on.'},
 leathermid:{name:'Leather midsole',color:'#bb8c60',line:'A middle layer of leather that the upper is stitched to.'},
 rubber:{name:'Rubber sole',color:'#3a3a3d',line:'Rubber bends and grips, and does not soak up water.'},
 tpu:{name:'TPU plastic plate',color:'#d8dbd1',line:'A light, springy plastic plate with the studs moulded on.'},
 carbon:{name:'Carbon-fibre plate',color:'#2c2e33',line:'Some top boots use carbon fibre: very light and very stiff.'},
 nylon:{name:'Plastic plate',color:'#e8e3d6',line:'A stiff plastic plate that the blades are moulded onto.'},
 gum:{name:'Flat gum-rubber sole',color:'#b98d5c',line:'Flat rubber with a pattern of grooves, for hall floors.'},
 board:{name:'Thin inner board',color:'#d9cbb0',line:'A thin layer stitched under the upper, so the plate can be glued on.'},
 insoleleather:{name:'Leather insole',color:'#c49a6c',line:'A leather layer your foot stands on.'},
 eva:{name:'Foam insole',color:'#ebe5d5',line:'A thin foam insole: soft, and you can take it out.'},
 counterleather:{name:'Stiff leather heel counter',color:'#9f7650',line:'A stiff cup that holds your heel still.'},
 countertpu:{name:'Plastic heel counter',color:'#cfd6dc',line:'A light plastic cup that locks your heel in place.'},
 foam:{name:'Foam padding',color:'#f0dcae',line:'Soft foam around the heel and ankle, for comfort.'},
 hardcap:{name:'Hard toe-cap',color:'#5b3a20',line:'A hard cap over the toes. Some old boots even used steel.'},
 softcap:{name:'Leather toe-cap',color:'#2c2119',line:'A softer leather cap, stitched over the toes.'},
 toebox:{name:'Thin toe box',color:'#d7d2c3',line:'Today there is no hard cap, just a thin layer that keeps the toe’s shape.'},
 leatherstud:{name:'Nailed leather studs',color:'#8b5a36',line:'Little stacks of leather, nailed into the sole.'},
 alu:{name:'Screw-in studs',color:'#b7bbc2',line:'Studs that screw in and out, so you can change them.'},
 studrubber:{name:'Moulded rubber studs',color:'#2f2f31',line:'Studs made in one piece with the sole.'},
 bladetpu:{name:'Plastic blades',color:'#e5e1d2',line:'Long, flat studs instead of round ones.'},
 metal:{name:'Metal-tipped studs',color:'#a9aeb6',line:'Long screw-in studs, often with metal tips, for soft mud.'},
 steel:{name:'Steel',color:'#8f949b',line:'The metal screw thread or nails inside the sole.'},
 cotton:{name:'Cotton laces',color:'#ece6d6',line:'Long laces through holes called eyelets.'},
 grip:{name:'Grip coating',color:'#8f99a4',line:'A bumpy coating on the inside of the foot, to help control the ball.'},
 sock:{name:'Knitted sock collar',color:'#2b2b2e',line:'A stretchy sock around the ankle, so the boot fits like a sock.'},
 paper:{name:'',color:'paper',line:''},
};

// ── The layers ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Each layer's name and one kid line about what it does (the material line is per boot). */
export const LAYERS:Record<PartId,{name:string;does:string}>={
 upper:{name:'Upper',does:'The part that wraps over your foot.'},
 lining:{name:'Lining',does:'The inside layer, against your sock.'},
 laces:{name:'Laces',does:'Pull the upper tight around your foot.'},
 counter:{name:'Heel counter',does:'A stiff cup that holds your heel.'},
 foam:{name:'Padding',does:'Foam around the heel and ankle.'},
 insole:{name:'Insole',does:'What your foot stands on.'},
 midsole:{name:'Midsole',does:'The middle layer between the upper and the sole.'},
 sole:{name:'Sole',does:'The bottom of the boot, which the studs are fixed to.'},
 studs:{name:'Studs',does:'They dig into the ground so you don’t slip.'},
 toecap:{name:'Toe-cap',does:'Protects and shapes the toe.'},
 grip:{name:'Grip zone',does:'A coated patch where you touch and strike the ball.'},
 collar:{name:'Sock collar',does:'A stretchy knitted collar around the ankle.'},
 tongue:{name:'Tongue',does:'A soft flap under the laces, so they don’t press on your foot.'},
};
/** Build mode stacks the layers from the ground up (this order); real boot makers work around a foot-shaped mould called a last. */
export const BUILD_ORDER:PartId[]=['studs','sole','midsole','insole','counter','foam','lining','upper','tongue','grip','toecap','collar','laces'];
export const BUILD_NOTE='Here you stack the layers from the ground up. Real boot makers often build around a foot-shaped mould called a last, and many steps are glued or stitched.';

// ── The timeline bench ─────────────────────────────────────────────────────────────────────────────────────────────────
export type EraId='early'|'fifties'|'seventies'|'nineties'|'today';
export type Era={id:EraId;when:string;title:string;spec:BootSpec;mats:Partial<Record<PartId,string>>;weight:string;facts:string[];what:string};
/** Each boot is sampled from the closest Kit Shop silhouette (`model`, lib/shop/bootProfiles.ts) and given the era's materials. */
const base={toecap:'stitched',laces:'laces',tongue:'plain',lacesColor:'#ece6d6'} as const;
export const ERAS:Era[]=[
 {id:'early',when:'Early 1900s',title:'The heavy work boot',what:'Thick leather over the ankle, a hard toe-cap, nailed leather studs.',
  spec:{...base,model:'classic',shaft:58,studs:'nailed',toecap:'hard',
   mats:{upper:'cowhide',lining:'linen',sole:'leathersole',mid:'leathermid',insole:'insoleleather',counter:'counterleather',toecap:'hardcap',studs:'leatherstud',laces:'cotton'},lacesColor:'#d9cfb8',stitch:'#2b1d12'},
  mats:{upper:'cowhide',lining:'linen',sole:'leathersole',midsole:'leathermid',insole:'insoleleather',counter:'counterleather',toecap:'hardcap',studs:'leatherstud',laces:'cotton'},
  weight:'About 500 g each, and even heavier when wet',
  facts:['Early boots were thick, heavy leather that came up over the ankle, with hard toe-caps.','The first football boots weighed about 500 grams each, and even more when they got wet.','The very first FA rules, in 1863, said no player could wear sticking-out nails or iron plates on his boots.']},
 {id:'fifties',when:'1950s',title:'Lighter and lower',what:'Thinner leather, a lower cut, screw-in studs.',
  spec:{...base,model:'retro',lower:.08,studs:'screw',
   mats:{upper:'calf',lining:'leatherlining',sole:'leathersole',mid:'leathermid',insole:'insoleleather',counter:'counterleather',toecap:'softcap',studs:'studrubber',tip:'alu',laces:'cotton'},lacesColor:'#ece6d6',stitch:'#e9e1cf'},
  mats:{upper:'calf',lining:'leatherlining',sole:'leathersole',midsole:'leathermid',insole:'insoleleather',counter:'counterleather',toecap:'softcap',studs:'alu',laces:'cotton'},
  weight:'Lighter than the old boots',
  facts:['At the 1950 World Cup in Brazil, England’s players were amazed by the South American players’ light, low boots.','West Germany wore boots with screw-in studs when they won the rainy 1954 World Cup final: they could put in longer studs for the wet pitch.','That boot made adidas famous for screw-in studs, but others had the idea too: a German inventor applied for a patent in 1949, and Puma says it sold screw-in studs in 1952.']},
 {id:'seventies',when:'1970s–80s',title:'Black leather, moulded studs',what:'Soft black kangaroo or calf leather, moulded rubber studs, a fold-over tongue.',
  spec:{...base,model:'classic',studs:'moulded',tongue:'fold',foam:true,
   mats:{upper:'kangaroo',lining:'leatherlining',sole:'rubber',mid:'rubber',insole:'insoleleather',counter:'counterleather',toecap:'softcap',studs:'studrubber',laces:'cotton',foam:'foam'},lacesColor:'#f2efe6',stitch:'#f2efe6'},
  mats:{upper:'kangaroo',lining:'leatherlining',sole:'rubber',midsole:'rubber',insole:'insoleleather',counter:'counterleather',foam:'foam',toecap:'softcap',studs:'studrubber',laces:'cotton'},
  weight:'Lighter again',
  facts:['For a long time football boots came only in black.','Kangaroo leather became popular for top boots because it is light and soft.','Moulded rubber studs, made in one piece with the sole, became common.']},
 {id:'nineties',when:'1990s',title:'Blades and bright colours',what:'Synthetic leather, plastic blades, bright colours, rubber fins.',
  spec:{...base,model:'fins',studs:'blade',tongue:'fold',foam:true,texture:'fins',
   mats:{upper:'synthetic',lining:'mesh',sole:'nylon',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'bladetpu',laces:'cotton',foam:'foam'},toecap:'box',lacesColor:'#f4f1e8',stitch:'#f4f1e8'},
  mats:{upper:'synthetic',lining:'mesh',sole:'nylon',midsole:'board',insole:'eva',counter:'countertpu',foam:'foam',toecap:'toebox',studs:'bladetpu',laces:'cotton'},
  weight:'Lighter again',
  facts:['In the 1990s boots came in bright colours, and new soles had bladed studs.','In 1994 the adidas Predator added rubber fins on top, to help grip the ball.','In 1998 the Nike Mercurial used synthetic leather, one of the first top boots to do so.']},
 {id:'today',when:'Today',title:'Knit, foam and a plate',what:'A knitted upper, a sock collar, foam padding, a light plate.',
  spec:{...base,model:'sock',studs:'fg',tongue:'none',laces:'cover',foam:true,sock:true,texture:'knit',toecap:'box',
   mats:{upper:'knit',lining:'mesh',sole:'tpu',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'tpu',laces:'knit',foam:'foam',grip:'grip',collar:'sock'},lacesColor:'#ece6d6',stitch:'#1d4f48'},
  mats:{upper:'knit',lining:'mesh',sole:'tpu',midsole:'board',insole:'eva',counter:'countertpu',foam:'foam',toecap:'toebox',studs:'tpu',laces:'knit',grip:'grip',collar:'sock'},
  weight:'Top speed boots: about 150–200 g',
  facts:['Since about 2014, many top boots have knitted uppers that fit like a sock.','The plate under the boot is light plastic (TPU), nylon or, on some top boots, carbon fibre.','Some top speed boots weigh only about 150 to 200 grams, lighter than a football.']},
];

// ── Today's soleplates ─────────────────────────────────────────────────────────────────────────────────────────────────
export type PlateId='fg'|'sg'|'ag'|'tf'|'ic';
export const PLATES:Record<PlateId,{code:string;name:string;studs:StudKind;mat:string;tip?:string;sole:string;line:string}>={
 fg:{code:'FG',name:'Firm ground',studs:'fg',mat:'tpu',sole:'tpu',line:'Moulded studs and blades for normal grass pitches, dry or a little damp.'},
 sg:{code:'SG',name:'Soft ground',studs:'sg',mat:'studrubber',tip:'metal',sole:'tpu',line:'Fewer, longer screw-in studs, often metal-tipped, that dig into soft, muddy grass.'},
 ag:{code:'AG',name:'Artificial grass',studs:'ag',mat:'tpu',sole:'tpu',line:'More, shorter, round studs, so they don’t stick in the plastic grass.'},
 tf:{code:'TF',name:'Turf',studs:'tf',mat:'studrubber',sole:'rubber',line:'Lots of tiny rubber nubs, for hard, short artificial turf.'},
 ic:{code:'IC',name:'Indoor court',studs:'ic',mat:'gum',sole:'gum',line:'A flat rubber sole with grooves, for sports-hall floors.'},
};

// ── The grip test (a practice model, not lab numbers) ──────────────────────────────────────────────────────────────────
export type Surface='mud'|'wet'|'dry'|'ag'|'indoor';
export type GripStud='nailed'|'sg'|'fg'|'blade'|'ag'|'tf'|'ic';
export const SURFACES:Record<Surface,{name:string;short:string;color:string;line:string}>={
 mud:{name:'Mud',short:'Mud',color:'#6f5034',line:'Soft and wet: studs need to sink in.'},
 wet:{name:'Wet grass',short:'Wet grass',color:'#4f8a4c',line:'Slippery on top, soft underneath.'},
 dry:{name:'Dry grass',short:'Dry grass',color:'#8ea85b',line:'Firm ground: studs only push in a little.'},
 ag:{name:'Artificial grass',short:'Artificial',color:'#3fa45a',line:'Plastic grass with rubber crumbs.'},
 indoor:{name:'Indoor court',short:'Indoor',color:'#d4ad78',line:'A hard, smooth floor.'},
};
export const GRIP_STUDS:Record<GripStud,{name:string;kind:StudKind;mat:string;sole:string;tip?:string}>={
 nailed:{name:'Nailed leather (1900s)',kind:'nailed',mat:'leatherstud',sole:'leathersole'},
 sg:{name:'Screw-in SG',kind:'sg',mat:'studrubber',tip:'metal',sole:'tpu'},
 fg:{name:'Moulded FG',kind:'fg',mat:'tpu',sole:'tpu'},
 blade:{name:'Blades',kind:'blade',mat:'bladetpu',sole:'nylon'},
 ag:{name:'AG studs',kind:'ag',mat:'tpu',sole:'tpu'},
 tf:{name:'Turf nubs',kind:'tf',mat:'studrubber',sole:'rubber'},
 ic:{name:'Flat indoor sole',kind:'ic',mat:'gum',sole:'gum'},
};
/** Grip out of 100 (a teaching model). `no`: often not allowed / not made for this surface. */
export const GRIP:Record<GripStud,Record<Surface,number>>={
 nailed:{mud:72,wet:70,dry:55,ag:35,indoor:8},
 sg:{mud:94,wet:86,dry:56,ag:40,indoor:5},
 fg:{mud:56,wet:74,dry:92,ag:70,indoor:10},
 blade:{mud:52,wet:76,dry:90,ag:60,indoor:8},
 ag:{mud:40,wet:62,dry:78,ag:93,indoor:18},
 tf:{mud:26,wet:46,dry:64,ag:80,indoor:44},
 ic:{mud:8,wet:16,dry:32,ag:42,indoor:95},
};
export const NOT_FOR:Partial<Record<GripStud,Partial<Record<Surface,string>>>>={
 sg:{ag:'Many artificial pitches don’t allow metal studs: they can damage the surface.',indoor:'Studs are not made for hall floors: they slip and can scratch them.'},
 blade:{ag:'Many artificial pitches don’t allow blades: they can cut the plastic grass.',indoor:'Studs are not made for hall floors: they slip and can scratch them.'},
 nailed:{ag:'Old nailed studs belong on grass, not on plastic.',indoor:'Studs are not made for hall floors: they slip and can scratch them.'},
 fg:{indoor:'Studs are not made for hall floors: they slip and can scratch them.'},
 ag:{indoor:'Studs are not made for hall floors: they slip and can scratch them.'},
};
export type Verdict='grips'|'ok'|'slips'|'not';
export function verdictOf(stud:GripStud,surf:Surface):{v:Verdict;grip:number;pts:number;say:string}{
 const grip=GRIP[stud][surf],no=NOT_FOR[stud]?.[surf];
 if(no)return {v:'not',grip,pts:0,say:no};
 if(grip>=75)return {v:'grips',grip,pts:2,say:stud==='ic'?'The flat rubber sole grips the smooth floor.':'The studs hold the ground.'};
 if(grip>=50)return {v:'ok',grip,pts:1,say:'It holds a bit, but it is not the best choice here.'};
 return {v:'slips',grip,pts:0,say:surf==='mud'||surf==='wet'?'The studs are too short to sink into the soft ground.':surf==='indoor'?'Nothing grips the smooth floor.':'Not enough grip here.'};
}
export const GRIP_ROUNDS:Surface[]=['mud','wet','dry','ag','indoor'];
export const GRIP_NOTE='The grip meter is a practice model to show the idea, not lab measurements. Pitches set their own rules, so always ask your coach.';

// ── Weighing ───────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The old boot: about 500 g (Wikipedia, Football boot). A modern speed boot: about 155 g (Nike, Mercurial Vapor 17, size 9 FG). */
export const OLD_G=500,NEW_G=155,MAX_NEW=4;
export const balanceOf=(n:number)=>{const d=n*NEW_G-OLD_G;return Math.max(-1,Math.min(1,d/OLD_G));};

// ── Compare the materials (a rough guide, 1–5) ─────────────────────────────────────────────────────────────────────────
export type CompareLayer='upper'|'sole'|'studs'|'insole';
export const COMPARE:Record<CompareLayer,{label:string;rows:{era:EraId;mat:string;heavy:number;dry:number;bend:number}[]}>={
 upper:{label:'Upper',rows:[{era:'early',mat:'cowhide',heavy:5,dry:1,bend:1},{era:'fifties',mat:'calf',heavy:4,dry:2,bend:3},{era:'seventies',mat:'kangaroo',heavy:2,dry:2,bend:5},{era:'nineties',mat:'synthetic',heavy:2,dry:4,bend:3},{era:'today',mat:'knit',heavy:1,dry:3,bend:5}]},
 sole:{label:'Sole',rows:[{era:'early',mat:'leathersole',heavy:5,dry:1,bend:1},{era:'fifties',mat:'leathersole',heavy:4,dry:1,bend:2},{era:'seventies',mat:'rubber',heavy:3,dry:5,bend:4},{era:'nineties',mat:'nylon',heavy:2,dry:5,bend:3},{era:'today',mat:'tpu',heavy:1,dry:5,bend:3}]},
 studs:{label:'Studs',rows:[{era:'early',mat:'leatherstud',heavy:4,dry:1,bend:2},{era:'fifties',mat:'alu',heavy:3,dry:5,bend:1},{era:'seventies',mat:'studrubber',heavy:2,dry:5,bend:3},{era:'nineties',mat:'bladetpu',heavy:2,dry:5,bend:2},{era:'today',mat:'tpu',heavy:1,dry:5,bend:2}]},
 insole:{label:'Insole',rows:[{era:'early',mat:'insoleleather',heavy:4,dry:1,bend:2},{era:'fifties',mat:'insoleleather',heavy:3,dry:1,bend:3},{era:'seventies',mat:'insoleleather',heavy:3,dry:1,bend:3},{era:'nineties',mat:'eva',heavy:1,dry:4,bend:5},{era:'today',mat:'eva',heavy:1,dry:4,bend:5}]},
};
export const COMPARE_NOTE='A rough guide for comparing, not lab measurements: 5 bars = the most.';

// ── Iconic boot lines (about 1995 to today; Copa Mundial is older but still made) ──────────────────────────────────────
export type Power='speed'|'control'|'power'|'touch';
export type Icon={id:string;name:string;year:string;special:string;suits:string;power?:Power;changed:string;spec:BootSpec;mats:Partial<Record<PartId,string>>};
const iconBase={...base,foam:true} as const;
export const ICONS:Icon[]=[
 {id:'copa',name:'adidas Copa Mundial',year:'1979',power:'touch',special:'Soft kangaroo leather. It is often called one of the best-selling football boots ever, and it is still made today.',suits:'Players who love a soft touch on the ball.',changed:'Still made in leather, much like the first one.',
  spec:{...iconBase,model:'classic',studs:'moulded',tongue:'fold',mats:{upper:'kangaroo',lining:'leatherlining',sole:'rubber',mid:'board',insole:'eva',counter:'counterleather',toecap:'softcap',studs:'studrubber',laces:'cotton',foam:'foam'},lacesColor:'#f2efe6',stitch:'#f2efe6'},
  mats:{upper:'kangaroo',sole:'rubber',studs:'studrubber'}},
 {id:'predator',name:'adidas Predator',year:'1994',power:'power',special:'Rubber fins and strips on top, to grip the ball for swerve and power. The idea came from ex-player Craig Johnston.',suits:'Players who strike the ball hard and curl it.',changed:'Kangaroo leather at first; later synthetics and knit.',
  spec:{...iconBase,model:'fins',studs:'blade',tongue:'fold',texture:'fins',mats:{upper:'kangaroo',lining:'mesh',sole:'nylon',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'bladetpu',laces:'cotton',foam:'foam'},toecap:'box',lacesColor:'#f2efe6',stitch:'#9b2b22'},
  mats:{upper:'kangaroo',sole:'nylon',studs:'bladetpu'}},
 {id:'mercurial',name:'Nike Mercurial',year:'1998',power:'speed',special:'Made for speed. The first one used synthetic leather and took ideas from racing cars.',suits:'Fast players who run with the ball.',changed:'Synthetic at first; now knitted, with a very thin plate.',
  spec:{...iconBase,model:'track',studs:'fg',tongue:'none',laces:'laces',sock:true,mats:{upper:'synthetic',lining:'mesh',sole:'tpu',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'tpu',laces:'cotton',foam:'foam',collar:'sock'},toecap:'box',lacesColor:'#f4f1e8',stitch:'#7a1e18'},
  mats:{upper:'synthetic',sole:'tpu',studs:'tpu'}},
 {id:'tiempo',name:'Nike Tiempo',year:'Early 1980s',power:'touch',special:'A classic leather boot, known for comfort and touch. At the 1994 World Cup final, almost half the players wore it.',suits:'Players who like a comfy, classic boot.',changed:'Leather for most of its life; newer ones mix leather and synthetics.',
  spec:{...iconBase,model:'pro',studs:'moulded',tongue:'plain',mats:{upper:'calf',lining:'leatherlining',sole:'rubber',mid:'board',insole:'eva',counter:'counterleather',toecap:'softcap',studs:'studrubber',laces:'cotton',foam:'foam'},lacesColor:'#f2efe6',stitch:'#e9e1cf'},
  mats:{upper:'calf',sole:'rubber',studs:'studrubber'}},
 {id:'king',name:'Puma King',year:'Late 1960s',power:'touch',special:'A soft, bendy leather boot. Pelé wore it in 1970 and Maradona in 1986.',suits:'Players who want a soft, classic feel.',changed:'Leather for decades; newer versions also use synthetics.',
  spec:{...iconBase,model:'retro',studs:'moulded',tongue:'fold',mats:{upper:'kangaroo',lining:'leatherlining',sole:'rubber',mid:'board',insole:'insoleleather',counter:'counterleather',toecap:'softcap',studs:'studrubber',laces:'cotton',foam:'foam'},lacesColor:'#f2efe6',stitch:'#f2efe6'},
  mats:{upper:'kangaroo',sole:'rubber',studs:'studrubber'}},
 {id:'f50',name:'adidas F50',year:'2004',special:'A speed boot with the laces hidden under a cover. One version in 2011 weighed about 145 g.',suits:'Fast attackers.',changed:'Thinner and lighter with each version; replaced by the X in 2015.',
  spec:{...iconBase,model:'cage',studs:'fg',tongue:'plain',laces:'cover',mats:{upper:'synthetic',lining:'mesh',sole:'nylon',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'tpu',laces:'synthetic',foam:'foam'},toecap:'box',lacesColor:'#f4f1e8',stitch:'#f4f1e8'},
  mats:{upper:'synthetic',sole:'nylon',studs:'tpu'}},
 {id:'x',name:'adidas X',year:'2015',power:undefined,special:'Took over from the F50 as a speed boot, with a thin woven upper.',suits:'Fast players.',changed:'Woven and synthetic uppers, some with a sock collar.',
  spec:{...iconBase,model:'knit',studs:'blade',tongue:'none',laces:'laces',sock:true,mats:{upper:'synthetic',lining:'mesh',sole:'nylon',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'bladetpu',laces:'cotton',foam:'foam',collar:'sock'},toecap:'box',lacesColor:'#f4f1e8',stitch:'#f4f1e8'},
  mats:{upper:'synthetic',sole:'nylon',studs:'bladetpu'}},
 {id:'phantom',name:'Nike Phantom',year:'2018',power:'control',special:'A grippy textured upper for control and accurate shots. It took over from two older lines in 2018 and 2019.',suits:'Players who control, pass and finish.',changed:'Knitted uppers with grip textures, some with a lace cover.',
  spec:{...iconBase,model:'laceless',studs:'fg',tongue:'none',laces:'cover',sock:true,texture:'dots',mats:{upper:'knit',lining:'mesh',sole:'tpu',mid:'board',insole:'eva',counter:'countertpu',toecap:'toebox',studs:'tpu',laces:'knit',foam:'foam',grip:'grip',collar:'sock'},toecap:'box',lacesColor:'#ece6d6',stitch:'#1d4f48'},
  mats:{upper:'knit',sole:'tpu',studs:'tpu'}},
];
export const ICON_NOTE='Boot lines are named in plain text and drawn as plain Paper boots in each line’s typical shape, with no logos or brand marks. Real sales numbers are rarely public, so we only say what the sources say.';
export const POWERS:Record<Power,string>={speed:'Speed',control:'Control',power:'Power',touch:'Touch'};
/** The superpower round: four lines whose sources describe a clear focus. */
export const MATCH_ROUND=['mercurial','copa','predator','phantom'] as const;

// ── Quick check ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const CHECK:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'It rained all night and the pitch is muddy. Which studs grip best?',options:['A flat indoor sole','Long screw-in studs','Tiny turf nubs'],answer:1,why:'Long studs sink into soft ground and hold. That is why players change studs for a wet pitch.'},
 {q:'Why do indoor shoes have flat rubber soles?',options:['Studs slip and scratch hard floors','To look cool','To be heavier'],answer:0,why:'On a hard, smooth floor, flat rubber grips best. Studs would slip and scratch it.'},
 {q:'How heavy were the first football boots?',options:['About 50 g','About 500 g','About 5 kg'],answer:1,why:'About 500 g each, and even heavier when wet. Some top boots today weigh about 150 to 200 g.'},
];

// ── Sources ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * "Run, plant, kick" (museum-figures-2, figure kit v2): what each part of the turnable boot says. Plain and verified (the sources
 * below: Wikipedia "Football boot", UEFA "Tools of the trade", DPMA screw-in studs, Sneaker Freaker): early boots were heavy
 * leather with studs or nails hammered into the sole; screw-in studs, swapped for the pitch, became famous at the 1954 World
 * Cup; boots got lighter and lower after the war; today most uppers are light synthetics or knit. No brands, no numbers.
 */
export const FIGURE_SAY:Record<string,string>={
 upper:'The upper wraps your foot and meets the ball. The first boots were heavy leather; today most uppers are light synthetics or knit.',
 laces:'Laces pull the upper snug, so your foot does not slide around inside the boot.',
 soleplate:'The soleplate is the stiff plate under your foot. It carries the studs and bends under the ball of your foot when you run.',
 studs:'Moulded studs are part of the sole, so they never come loose. The first boots had studs or nails hammered into the sole.',
 screw:'Screw-in studs can be swapped: longer ones for a soft, muddy pitch. They became famous at the 1954 World Cup.',
 insole:'The insole is the soft layer your foot stands on.',
 heel:'The heel counter is a stiff cup round your heel. It holds your heel steady when you plant your foot.',
 toebox:'The toe box keeps the front of the boot in shape, so your toes have room when you strike the ball.',
 run:'Run: the boot bends at the ball of your foot, where the soleplate flexes.',
 plant:'Plant: the studs bite into the grass so you do not slip, and the heel counter holds your heel steady.',
 kick:'Kick: the upper meets the ball, and the toe box keeps the front in shape.',
};
export const FIGURE_INTRO='Turn the boot all the way round. Tap See-through to see its layers, or press Run, plant, kick.';
export const SOURCES:{title:string;url:string}[]=[
 {title:'Wikipedia · Football boot',url:'https://en.wikipedia.org/wiki/Football_boot'},
 {title:'Wikisource · Laws of the Game (1863), Law 13',url:'https://en.wikisource.org/wiki/Laws_of_the_Game_(1863)_(as_submitted_for_adoption)'},
 {title:'UEFA · Tools of the trade (2020)',url:'https://www.uefa.com/insideuefa/about-uefa/news/newsid=2641357.html'},
 {title:'German Patent and Trade Mark Office · Screw-in studs (milestones)',url:'https://dpma.de/english/our_office/publications/milestones/inventionsthatmadehistory/screstudshoe'},
 {title:'PUMA newsroom · Rewriting football history (2006)',url:'https://about.puma.com/en/newsroom/corporate-news/2006/23-05-2006-puma-rewriting-football-history'},
 {title:'Sneaker Freaker · A history of the football boot',url:'https://sneakerfreaker.com/features/football-boot-soccer-history'},
 {title:'Wikipedia · Adidas Predator',url:'https://en.wikipedia.org/wiki/Adidas_Predator'},
 {title:'Wikipedia · Adidas Copa Mundial',url:'https://en.wikipedia.org/wiki/Adidas_Copa_Mundial'},
 {title:'Nike · Genealogy of speed (Mercurial)',url:'https://www.nike.com/ie/a/never-done-making-moves-genealogy-of-speed'},
 {title:'Nike · Mercurial Vapor (weight, size 9 FG)',url:'https://www.nike.com/mercurial/vapor'},
 {title:'SoccerBible · The evolution of the Nike Tiempo (2022)',url:'https://www.soccerbible.com/performance/football-boots/2022/04/the-ongoing-evolution-of-the-nike-tiempo/'},
 {title:'PUMA · The history of the King',url:'https://www.puma-catchup.com/the-history-of-pumas-iconic-football-boot-the-king/'},
 {title:'Footy Headlines · adidas discontinues the F50 (2015)',url:'https://www.footyheadlines.com/2015/05/say-goodbye-adidas-discontinues-f50-adizero.html'},
 {title:'Fútbol Emotion · The history of adidas X',url:'https://www.futbolemotion.com/gb/blogs/the-diary-of-futbol-emotion/the-history-of-adidas-x'},
 {title:'Footy Headlines · Nike Phantom VNM (2018)',url:'https://www.footyheadlines.com/2018/10/all-new-nike-phantom-vnm-tech-colorways-price-release-date.html'},
 {title:'V&A · Nike Magista Obra, knitted upper (2014)',url:'https://collections.vam.ac.uk/item/O1315196'},
 {title:'designboom · adidas Primeknit FS, a knitted football boot (2014)',url:'https://www.designboom.com/design/adidas-reveal-primeknit-fs-an-all-in-one-knitted-football-boot-and-sock-hybrid-03-07-2014/'},
 {title:'PUMA · Ultra 5 Carbon FG (carbon soleplate)',url:'https://eu.puma.com/se/en/pd/ultra-5-carbon-fg-football-boots-unisex/108157'},
 {title:'footballboots.co.uk · Soleplates explained',url:'https://www.footballboots.co.uk/soleplate.html'},
 {title:'Lancashire FA · 3G pitch footwear conditions',url:'https://www.thefa.com/-/media/cfa/lancashirefa/files/facilities/lfa-3g-pitch---all-year-round-training.ashx?la=en'},
 {title:'West Riding FA · Footwear on artificial pitches',url:'https://thefa.com/-/media/cfa/westridingfa/files/about/facilities/user-guide-footwear.ashx?la=en'},
 {title:'IFAB Laws of the Game · Law 4 The Players’ Equipment',url:'https://www.theifab.com/laws/latest/the-players-equipment/'},
];
