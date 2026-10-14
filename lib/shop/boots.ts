/**
 * Boot studio data (Oct 12 2026): the design a kid builds in components/shop/BootStudio.tsx, its validation, the price in coins,
 * the curated words and the local saves. Pure data, no three.js: tests/shop-boots.cjs loads it straight from the TypeScript.
 *
 * Learning purpose (AGENTS.md): every stud type says which pitch it is made for, so choosing studs teaches surfaces (firm grass,
 * wet grass, artificial turf, sports halls), and the quotes are team values ("Team first", "Play fair").
 *
 * No real brands: original stickers (bootStickers.ts), no logos, no stripes trademarks, no model names. Flags are flag-icons
 * (MIT, public/shop/flags/LICENSE.txt, docs/third-party/flag-icons.md).
 */

export const BOOTS_KEY='fi2-shop-boots-v1';
/** Stickers, flags and quotes a kid can place. The name, number and flag badge are separate (personal) and do not count. */
export const DECAL_LIMIT=8;
export const SLOT_COUNT=3;
export const NAME_MAX=12;

export type UpperMaterial='knit'|'synthetic'|'leather';
export type Collar='low'|'mid'|'sock';
export type Laces='visible'|'covered'|'laceless';
/**
 * Boot models (Oct 12 2026, user: "need different variations of boots ... it needs variation in shape"): each one is a different
 * 3D silhouette (lib/shop/bootGeometry.ts SHAPES), inspired by a famous boot ERA or style, never a real product: original names,
 * no logos, stripes, wordmarks or signature colourways (research notes: docs/shop-boot-silhouettes.md).
 * `collar`/`laces` fixed = part of the model's shape; the modern speed boot leaves both to the player. Old saves load as 'speed'.
 */
export type BootModel='speed'|'retro'|'classic'|'feather'|'fins'|'track'|'longflap'|'cage'|'offset'|'wrap'|'pro'|'knit'|'sock'|'laceless'|'indoor';
/** Today's boot first, then the eras oldest → newest, then the indoor shoe. */
export const MODEL_IDS:readonly BootModel[]=['speed','retro','classic','feather','fins','track','longflap','offset','cage','wrap','pro','knit','sock','laceless','indoor'];
export type Finish='matte'|'glossy'|'metallic'|'iridescent';
export type StudType='fg'|'blade'|'hybrid'|'chevron'|'sg'|'sgmix'|'ag'|'turf'|'indoor'|'futsal'|'split'|'carbon';
export const STUD_TYPES:readonly StudType[]=['fg','blade','hybrid','chevron','sg','sgmix','ag','turf','indoor','futsal','split','carbon'];
/** How the studs are finished; the colour is colors.studs (and colors.tips for contrast tips). */
export type StudFinish='matte'|'glossy'|'translucent'|'chrome'|'tipped';
export const STUD_FINISH_IDS:readonly StudFinish[]=['matte','glossy','translucent','chrome','tipped'];
export type PatternKind='solid'|'fade'|'speckle'|'stripes'|'camo'|'zigzag';
export type ColourZone='toe'|'mid'|'heel'|'collar'|'laces'|'soleplate'|'studs'|'tips'|'accent';
export type DecalZone='toe'|'outside'|'inside'|'heel'|'tongue';
export type DecalKind='sticker'|'flag'|'quote';

export type BootDecal={
 /** Unique within the design (undo and selection use it). */
 id:string;
 kind:DecalKind;
 /** Sticker id, flag code or quote id. */
 ref:string;
 zone:DecalZone;
 /** Position inside the zone's safe area, −1…1 on both axes (0,0 is the zone centre). */
 x:number;y:number;
 /** 0.5…1.6 of the zone's default size. */
 size:number;
 /** Degrees, −60…60. */
 rot:number;
 /** Text colour for quotes (hex); stickers and flags ignore it. */
 tint?:string;
};

export type BootDesign={
 v:1;
 /** The silhouette (added Oct 12 2026; older saves get 'speed', the shape they were made with). */
 model:BootModel;
 upper:UpperMaterial;
 collar:Collar;
 laces:Laces;
 finish:Finish;
 studs:StudType;
 /** Added Oct 12 2026; older saves get the default. */
 studFinish:StudFinish;
 pattern:PatternKind;
 colors:Record<ColourZone,string>;
 decals:BootDecal[];
 /** Stitched on the heel; filtered by cleanName/nameAllowed. */
 name:string;
 /** 0–99 or null. */
 number:number|null;
 /** What the heel stitching shows. */
 heelText:'name'|'number';
 /** Flag badge (a flag code) and where it sits. */
 flag:string|null;
 flagSpot:'tongue'|'heel';
};

export const COLOUR_ZONES:readonly {id:ColourZone;label:string;hint:string}[]=[
 {id:'toe',label:'Toe',hint:'The front where you strike the ball'},
 {id:'mid',label:'Middle',hint:'The sides of the boot'},
 {id:'heel',label:'Heel',hint:'The back that holds your heel'},
 {id:'collar',label:'Collar',hint:'Around your ankle'},
 {id:'laces',label:'Laces',hint:'Laces or the laceless cover'},
 {id:'soleplate',label:'Soleplate',hint:'The hard plate under your foot'},
 {id:'studs',label:'Studs',hint:'The grip on the bottom'},
 {id:'tips',label:'Stud tips',hint:'The tips of the studs (pick “Contrast tips” in Studs)'},
 {id:'accent',label:'Pattern',hint:'The colour of your pattern (and the fins or strike pad)'},
];

/** Big, kid-friendly swatches. Bright, but each one still reads on a boot. */
export const PALETTE:readonly {hex:string;name:string}[]=[
 {hex:'#f6f3ea',name:'White'},{hex:'#efe2c2',name:'Cream'},{hex:'#c9ccd2',name:'Silver'},{hex:'#5d6168',name:'Steel'},{hex:'#18191d',name:'Black'},
 {hex:'#d7262e',name:'Red'},{hex:'#ff6a4d',name:'Coral'},{hex:'#ff8a1f',name:'Orange'},{hex:'#e8b33a',name:'Gold'},{hex:'#ffe14a',name:'Lemon'},
 {hex:'#b8f03c',name:'Volt'},{hex:'#2fa65a',name:'Green'},{hex:'#7fd8bd',name:'Mint'},{hex:'#14a3a8',name:'Teal'},{hex:'#53b8f2',name:'Sky'},
 {hex:'#2253d6',name:'Royal'},{hex:'#17295e',name:'Navy'},{hex:'#7d4bd8',name:'Purple'},{hex:'#ff7cc8',name:'Pink'},{hex:'#8a2340',name:'Maroon'},
];

export const UPPERS:readonly {id:UpperMaterial;label:string;note:string}[]=[
 {id:'knit',label:'Knit',note:'Soft and stretchy, like a sock'},
 {id:'synthetic',label:'Synthetic',note:'Light with a grippy skin'},
 {id:'leather',label:'Leather look',note:'Classic touch with stitched lines'},
];
/**
 * The models, oldest style first after today's boot. `blurb` is the kid-friendly line about the era and what the shape was good
 * for (generic and true; no brands, no players). `collar`/`laces` set = fixed by the shape. `studs`/`upper` = the era's default
 * (presets use them; switching model keeps the player's choices).
 */
export const MODELS:readonly {id:BootModel;label:string;era:string;blurb:string;collar?:Collar;laces?:Laces;studs:StudType;upper:UpperMaterial}[]=[
 {id:'speed',label:'Modern Speed',era:'2000s–today',blurb:'A slim, pointed boot with a thin, stiff plate and a light upper that hugs your foot. Built for sprinting into space.',studs:'sg',upper:'synthetic'},
 {id:'retro',label:'Retro Leather',era:'1960s–80s',blurb:'Low black leather, a long tongue flap over the laces and moulded studs. Simple boots for dribbling and touch.',collar:'low',laces:'visible',studs:'fg',upper:'leather'},
 {id:'classic',label:'Classic Kangaroo',era:'Late 1970s',blurb:'Soft leather, stitched lines on the toe and a big tongue that folds over the laces. Made for a soft first touch.',collar:'low',laces:'visible',studs:'sg',upper:'leather'},
 {id:'feather',label:'Featherlight Leather',era:'1980s–2000s',blurb:'A rounded toe, thin soft leather and stitched padding on the front, for a cushioned, barefoot feel on the ball.',collar:'low',laces:'visible',studs:'fg',upper:'leather'},
 {id:'fins',label:'Power Fins',era:'Mid 1990s',blurb:'Rubber fins on the front grip the ball, to help you curl it and control it. A huge tongue folds over the laces.',collar:'low',laces:'visible',studs:'blade',upper:'leather'},
 {id:'track',label:'Track Sprinter',era:'Late 1990s',blurb:'Shaped like a running spike: low, slim and light, so fast players could fly down the wing.',collar:'low',laces:'visible',studs:'fg',upper:'synthetic'},
 {id:'longflap',label:'Long Tongue Control',era:'Early 2000s',blurb:'An extra-long tongue folds right down over the laces, and rubbery pads on the front help you grip and curl the ball.',collar:'low',laces:'visible',studs:'blade',upper:'leather'},
 {id:'offset',label:'Off-Centre Striker',era:'2000s',blurb:'The laces sit off to one side, leaving a big clean area on top for shooting, with a grippy strike pad.',collar:'low',laces:'visible',studs:'hybrid',upper:'synthetic'},
 {id:'cage',label:'Speed Cage',era:'Late 2000s',blurb:'A cover hides the laces off to one side, giving a smooth area to strike the ball. A stiff heel keeps your foot steady.',collar:'low',laces:'covered',studs:'hybrid',upper:'synthetic'},
 {id:'wrap',label:'Ultralight Wrap',era:'Around 2010',blurb:'A paper-thin upper wraps your foot like tape over a tiny, stiff plate. Every gram saved was for pure speed.',collar:'low',laces:'visible',studs:'carbon',upper:'synthetic'},
 {id:'pro',label:'Pro Leather',era:'2010s',blurb:'Soft leather with stitched padding on the front and a firm, padded heel: a comfy, clean touch that lasts.',collar:'low',laces:'visible',studs:'fg',upper:'leather'},
 {id:'knit',label:'Knit Control',era:'Mid 2010s',blurb:'A knitted upper with a grippy texture and a sock collar, made to feel the ball on every touch.',collar:'sock',laces:'visible',studs:'fg',upper:'knit'},
 {id:'sock',label:'Sock Striker',era:'2010s',blurb:'A tall knitted sock collar hugs your ankle, so the boot feels like part of your leg.',collar:'sock',laces:'visible',studs:'hybrid',upper:'knit'},
 {id:'laceless',label:'Laceless Control',era:'Late 2010s',blurb:'No laces: stretchy bands wrap your foot like a sports bandage, holding it snug for quick turns and close control.',collar:'mid',laces:'laceless',studs:'chevron',upper:'knit'},
 {id:'indoor',label:'Indoor Classic',era:'Sports halls',blurb:'A flat gum-rubber sole and a tough toe cap, made for hard floors and quick passes in small spaces.',collar:'low',laces:'visible',studs:'indoor',upper:'leather'},
];
/** 'matte' is the natural look (soft leather, satin synthetic, matte knit) and the default; 'glossy' a thin clear coat. */
export const FINISHES:readonly {id:Finish;label:string}[]=[
 {id:'matte',label:'Matte'},{id:'glossy',label:'Glossy'},{id:'metallic',label:'Metallic'},{id:'iridescent',label:'Iridescent'},
];
export const PATTERNS:readonly {id:PatternKind;label:string}[]=[
 {id:'solid',label:'Solid'},{id:'fade',label:'Fade'},{id:'speckle',label:'Speckle'},{id:'stripes',label:'Pinstripes'},{id:'camo',label:'Camo'},{id:'zigzag',label:'Zigzag'},
];
/**
 * Stud types and the pitch each is for (the learning line shown in the Studs step). `group` sorts them in the picker. Every
 * type is one merged mesh in the scene (bootGeometry.ts), so more choice never adds draw calls.
 */
export const STUDS:readonly {id:StudType;label:string;short:string;group:'grass'|'wet'|'artificial'|'indoor'|'elite';pitch:string}[]=[
 {id:'fg',label:'Round studs',short:'FG',group:'grass',pitch:'Round studs for dry grass. They let your foot turn easily, so your knees stay happy.'},
 {id:'blade',label:'Bladed',short:'FG',group:'grass',pitch:'Long blades bite into firm grass for quick sprints and sharp cuts.'},
 {id:'hybrid',label:'Mix',short:'FG',group:'grass',pitch:'Round studs under the heel for turning, blades up front for pushing off. The best of both.'},
 {id:'chevron',label:'Arrowheads',short:'FG',group:'grass',pitch:'Arrow-shaped studs grip forwards and backwards, so you can stop and start fast.'},
 {id:'sg',label:'Soft ground',short:'SG',group:'wet',pitch:'Six long studs with metal tips for wet, muddy grass, where short studs slip.'},
 {id:'sgmix',label:'Soft ground mix',short:'SG',group:'wet',pitch:'Metal-tipped studs for mud plus shorter moulded ones for balance when the pitch dries out.'},
 {id:'ag',label:'Artificial grass',short:'AG',group:'artificial',pitch:'Lots of short, hollow studs for plastic grass: they grip without sticking in the rubber crumbs.'},
 {id:'turf',label:'Turf',short:'TF',group:'artificial',pitch:'Tiny rubber nubs for old-style turf and hard, dry ground.'},
 {id:'indoor',label:'Indoor',short:'IC',group:'indoor',pitch:'A flat gum-rubber sole with a zigzag tread for sports halls. Studs would skid on a wooden floor.'},
 {id:'futsal',label:'Futsal',short:'IC',group:'indoor',pitch:'Flat gum sole with pivot circles under the ball of the foot and heel, for spinning on the spot.'},
 {id:'split',label:'Split plate',short:'Elite',group:'elite',pitch:'The front and heel plates are separate, so the boot bends with your foot. Thin blades for speed.'},
 {id:'carbon',label:'Carbon speed',short:'Elite',group:'elite',pitch:'A stiff carbon plate springs you forward; sharp blades under the heel help you brake and turn.'},
];
/** Old or foreign stud names → the nearest type (older saves and hand-edited storage). */
const STUD_ALIAS:Record<string,StudType>={fg:'fg',round:'fg',conical:'fg',blade:'blade',blades:'blade',bladed:'blade',mixed:'hybrid',hybrid:'hybrid',chevron:'chevron',
 sg:'sg',soft:'sg',sgmix:'sgmix','sg-mix':'sgmix',ag:'ag',mg:'ag',turf:'turf',tf:'turf',indoor:'indoor',ic:'indoor',futsal:'futsal',split:'split',carbon:'carbon',elite:'carbon'};
export const STUD_FINISHES:readonly {id:StudFinish;label:string;note:string}[]=[
 {id:'matte',label:'Matte',note:'Soft rubbery look'},{id:'glossy',label:'Glossy',note:'Shiny plastic'},{id:'translucent',label:'See-through',note:'Like coloured glass'},
 {id:'chrome',label:'Chrome',note:'Shiny metal look'},{id:'tipped',label:'Contrast tips',note:'Tips in another colour'},
];
export const DECAL_ZONES:readonly {id:DecalZone;label:string}[]=[
 {id:'outside',label:'Outside'},{id:'inside',label:'Inside'},{id:'toe',label:'Toe'},{id:'heel',label:'Heel'},{id:'tongue',label:'Tongue'},
];

/** Curated quotes: short, positive, about effort and teammates. Kids pick; they never type free text here. */
export const QUOTES:readonly {id:string;text:string}[]=[
 {id:'never-give-up',text:'Never give up'},{id:'team-first',text:'Team first'},{id:'dream-big',text:'Dream big'},{id:'play-fair',text:'Play fair'},
 {id:'work-hard',text:'Work hard'},{id:'be-brave',text:'Be brave'},{id:'have-fun',text:'Have fun'},{id:'believe',text:'Believe'},
 {id:'keep-going',text:'Keep going'},{id:'one-team',text:'One team'},{id:'pass-and-move',text:'Pass and move'},{id:'heads-up',text:'Heads up'},
 {id:'practice',text:'Practice pays'},{id:'respect',text:'Respect'},{id:'goal',text:'GOAL!'},{id:'island-made',text:'Island made'},
];

/** Original stickers (art in bootStickers.ts). */
export const STICKER_IDS=['star','stars','ball','bolt','heart','crown','flame','palm','wave','paw','wings','rocket','shield','badge-7','badge-9','badge-10','badge-11'] as const;
export type StickerId=typeof STICKER_IDS[number];

/** Flags bundled from flag-icons (MIT): public/shop/flags/<code>.svg. Saudi Arabia is left out (its flag carries religious text). */
export const FLAGS:readonly {code:string;name:string}[]=[
 {code:'ar',name:'Argentina'},{code:'au',name:'Australia'},{code:'at',name:'Austria'},{code:'be',name:'Belgium'},{code:'br',name:'Brazil'},
 {code:'cm',name:'Cameroon'},{code:'ca',name:'Canada'},{code:'cl',name:'Chile'},{code:'cn',name:'China'},{code:'co',name:'Colombia'},
 {code:'cr',name:'Costa Rica'},{code:'ci',name:'Côte d’Ivoire'},{code:'hr',name:'Croatia'},{code:'dk',name:'Denmark'},{code:'ec',name:'Ecuador'},
 {code:'eg',name:'Egypt'},{code:'gb-eng',name:'England'},{code:'fr',name:'France'},{code:'de',name:'Germany'},{code:'gh',name:'Ghana'},
 {code:'gr',name:'Greece'},{code:'in',name:'India'},{code:'ie',name:'Ireland'},{code:'it',name:'Italy'},{code:'jm',name:'Jamaica'},
 {code:'jp',name:'Japan'},{code:'mx',name:'Mexico'},{code:'ma',name:'Morocco'},{code:'nl',name:'Netherlands'},{code:'nz',name:'New Zealand'},
 {code:'ng',name:'Nigeria'},{code:'no',name:'Norway'},{code:'pe',name:'Peru'},{code:'ph',name:'Philippines'},{code:'pl',name:'Poland'},
 {code:'pt',name:'Portugal'},{code:'qa',name:'Qatar'},{code:'gb-sct',name:'Scotland'},{code:'sn',name:'Senegal'},{code:'za',name:'South Africa'},
 {code:'kr',name:'South Korea'},{code:'es',name:'Spain'},{code:'se',name:'Sweden'},{code:'ch',name:'Switzerland'},{code:'tn',name:'Tunisia'},
 {code:'tr',name:'Türkiye'},{code:'ua',name:'Ukraine'},{code:'us',name:'United States'},{code:'uy',name:'Uruguay'},{code:'vn',name:'Vietnam'},
 {code:'gb-wls',name:'Wales'},{code:'dz',name:'Algeria'},
];
export const flagUrl=(code:string)=>`/shop/flags/${code}.svg`;

export const DEFAULT_BOOTS:BootDesign={
 v:1,model:'speed',upper:'synthetic',collar:'low',laces:'visible',finish:'matte',studs:'fg',studFinish:'glossy',pattern:'fade',
 colors:{toe:'#f6f3ea',mid:'#f6f3ea',heel:'#2253d6',collar:'#17295e',laces:'#f6f3ea',soleplate:'#2253d6',studs:'#f6f3ea',tips:'#2253d6',accent:'#53b8f2'},
 decals:[],name:'',number:10,heelText:'number',flag:null,flagSpot:'tongue',
};

/**
 * Ready-made looks: a model + an era-inspired colourway (generic colour pairs, never a real boot's signature colourway).
 * The labels say the model first, so the grid reads as "pick a shape".
 */
type PresetDesign=Omit<BootDesign,'decals'|'name'|'number'|'heelText'|'flag'|'flagSpot'>;
const C=(toe:string,mid:string,heel:string,collar:string,laces:string,soleplate:string,studs:string,tips:string,accent:string)=>({toe,mid,heel,collar,laces,soleplate,studs,tips,accent});
export const PRESETS:readonly {id:string;label:string;sub:string;design:PresetDesign}[]=[
 {id:'speed-golden',label:'Modern Speed',sub:'Gold rush',design:{v:1,model:'speed',upper:'synthetic',collar:'low',laces:'visible',finish:'metallic',studs:'blade',studFinish:'chrome',pattern:'solid',
  colors:C('#e8b33a','#e8b33a','#e8b33a','#18191d','#e8b33a','#18191d','#e8b33a','#18191d','#18191d')}},
 {id:'classic-black',label:'Classic Kangaroo',sub:'Black & white',design:{v:1,model:'classic',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'sg',studFinish:'glossy',pattern:'solid',
  colors:C('#18191d','#18191d','#18191d','#18191d','#f6f3ea','#18191d','#18191d','#f6f3ea','#f6f3ea')}},
 {id:'retro-cream',label:'Retro Leather',sub:'Black & cream',design:{v:1,model:'retro',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'fg',studFinish:'matte',pattern:'solid',
  colors:C('#18191d','#18191d','#18191d','#efe2c2','#efe2c2','#efe2c2','#18191d','#efe2c2','#efe2c2')}},
 {id:'fins-red',label:'Power Fins',sub:'Black & red',design:{v:1,model:'fins',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'blade',studFinish:'glossy',pattern:'solid',
  colors:C('#18191d','#18191d','#d7262e','#18191d','#f6f3ea','#18191d','#18191d','#d7262e','#d7262e')}},
 {id:'track-coral',label:'Track Sprinter',sub:'Coral & black',design:{v:1,model:'track',upper:'synthetic',collar:'low',laces:'visible',finish:'matte',studs:'fg',studFinish:'glossy',pattern:'fade',
  colors:C('#ff6a4d','#ff6a4d','#18191d','#18191d','#18191d','#18191d','#ff6a4d','#18191d','#ffe14a')}},
 {id:'longflap-cream',label:'Long Tongue Control',sub:'Cream & gold',design:{v:1,model:'longflap',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'blade',studFinish:'tipped',pattern:'solid',
  colors:C('#efe2c2','#efe2c2','#18191d','#18191d','#18191d','#efe2c2','#efe2c2','#e8b33a','#e8b33a')}},
 {id:'cage-lemon',label:'Speed Cage',sub:'Silver & lemon',design:{v:1,model:'cage',upper:'synthetic',collar:'low',laces:'covered',finish:'glossy',studs:'blade',studFinish:'tipped',pattern:'solid',
  colors:C('#c9ccd2','#f6f3ea','#ffe14a','#18191d','#ffe14a','#18191d','#c9ccd2','#ffe14a','#ffe14a')}},
 {id:'offset-orange',label:'Off-Centre Striker',sub:'White & orange',design:{v:1,model:'offset',upper:'synthetic',collar:'low',laces:'visible',finish:'matte',studs:'hybrid',studFinish:'glossy',pattern:'solid',
  colors:C('#f6f3ea','#f6f3ea','#ff8a1f','#17295e','#f6f3ea','#17295e','#f6f3ea','#ff8a1f','#ff8a1f')}},
 {id:'feather-white',label:'Featherlight Leather',sub:'Pearl & royal',design:{v:1,model:'feather',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'fg',studFinish:'glossy',pattern:'solid',
  colors:C('#f6f3ea','#f6f3ea','#17295e','#17295e','#f6f3ea','#f6f3ea','#17295e','#f6f3ea','#17295e')}},
 {id:'wrap-sky',label:'Ultralight Wrap',sub:'Sky & white',design:{v:1,model:'wrap',upper:'synthetic',collar:'low',laces:'visible',finish:'matte',studs:'carbon',studFinish:'glossy',pattern:'stripes',
  colors:C('#53b8f2','#53b8f2','#f6f3ea','#17295e','#f6f3ea','#f6f3ea','#53b8f2','#f6f3ea','#2253d6')}},
 {id:'pro-sky',label:'Pro Leather',sub:'White & sky',design:{v:1,model:'pro',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'fg',studFinish:'glossy',pattern:'solid',
  colors:C('#f6f3ea','#f6f3ea','#53b8f2','#17295e','#53b8f2','#f6f3ea','#18191d','#53b8f2','#53b8f2')}},
 {id:'knit-sunset',label:'Knit Control',sub:'Lemon & coral',design:{v:1,model:'knit',upper:'knit',collar:'sock',laces:'visible',finish:'matte',studs:'fg',studFinish:'matte',pattern:'speckle',
  colors:C('#ff6a4d','#ffe14a','#ffe14a','#ffe14a','#18191d','#ffe14a','#18191d','#ffe14a','#ff8a1f')}},
 {id:'sock-volt',label:'Sock Striker',sub:'Volt & teal',design:{v:1,model:'sock',upper:'knit',collar:'sock',laces:'visible',finish:'matte',studs:'hybrid',studFinish:'tipped',pattern:'fade',
  colors:C('#b8f03c','#14a3a8','#17295e','#17295e','#18191d','#b8f03c','#17295e','#b8f03c','#b8f03c')}},
 {id:'laceless-ocean',label:'Laceless Control',sub:'Ocean wave',design:{v:1,model:'laceless',upper:'knit',collar:'mid',laces:'laceless',finish:'matte',studs:'chevron',studFinish:'matte',pattern:'speckle',
  colors:C('#14a3a8','#53b8f2','#2253d6','#17295e','#14a3a8','#f6f3ea','#14a3a8','#f6f3ea','#f6f3ea')}},
 {id:'indoor-gum',label:'Indoor Classic',sub:'Navy & gum',design:{v:1,model:'indoor',upper:'leather',collar:'low',laces:'visible',finish:'matte',studs:'indoor',studFinish:'matte',pattern:'solid',
  colors:C('#efe2c2','#17295e','#17295e','#17295e','#f6f3ea','#e8b33a','#efe2c2','#e8b33a','#efe2c2')}},
 {id:'speed-night',label:'Modern Speed',sub:'Night sky',design:{v:1,model:'speed',upper:'synthetic',collar:'sock',laces:'laceless',finish:'iridescent',studs:'carbon',studFinish:'translucent',pattern:'camo',
  colors:C('#17295e','#17295e','#7d4bd8','#18191d','#17295e','#c9ccd2','#c9ccd2','#7d4bd8','#7d4bd8')}},
];

/* ---------- Name filter ---------- */
// ROT13 so the source stays readable for kids and grown-ups browsing it. Matched against the name with spaces and hyphens
// removed, so "b u m" and "bu-m" are caught. Brand words are blocked too: the boots carry no real brands.
const rot13=(s:string)=>s.replace(/[a-z]/gi,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b);});
const BLOCK_ROT13=['shpx','fuvg','ovgpu','phag','qvpx','pbpx','chffl','nff','nefr','fyhg','juber','onfgneq','jnax','gjng','cvff','penc','qnza','uryy','avttre','avttn','snt','snttbg','ergneq','cravf','intvan','frk','encr','xvyy','zheqre','qvr','fghcvq','vqvbg','ybfre','qhzo','obbo','ohz','cbb','abbo','cbea','anmv','avxr',
 'nqvqnf','chzn','zvmhab','arj onynapr','hzoeb','wbzn','qvnqben','haqre nezbhe','cerqngbe','cunagbz','zrephevny','pbcn','irabz','pbcn zhaqvny'];
const BLOCK=BLOCK_ROT13.map(w=>rot13(w).replace(/[\s-]/g,''));
/** Short words that are only blocked as a whole word (they hide inside ordinary names: "Cassidy", "Dieter", "Hattie"). */
const WHOLE_ONLY=new Set(['ass','arse','die','bum','poo','sex','fag','hell','kill','noob','dumb','boob','crap','damn','piss','dick','cock','copa']);

/** Letters (any alphabet), spaces and hyphens only, single spaces, at most 12 characters. */
export function cleanName(raw:string):string{
 return String(raw??'').normalize('NFC').replace(/[^\p{L}\s-]/gu,'').replace(/\s+/g,' ').replace(/-{2,}/g,'-').replace(/^[\s-]+/,'').slice(0,NAME_MAX);
}
/** True when the (already cleaned) name is fine to stitch. Empty is allowed (no name). */
export function nameAllowed(name:string):boolean{
 const n=cleanName(name).trim();if(!n)return true;
 const words=n.toLowerCase().split(/[\s-]+/).filter(Boolean),joined=words.join('');
 for(const w of BLOCK){
  if(WHOLE_ONLY.has(w)){if(words.includes(w)||joined===w)return false;}
  else if(joined.includes(w))return false;
 }
 return true;
}

/* ---------- Validation ---------- */
const HEX=/^#[0-9a-f]{6}$/i;
const pick=<T extends string>(v:unknown,allowed:readonly T[],fallback:T):T=>allowed.includes(v as T)?v as T:fallback;
const clamp=(v:unknown,lo:number,hi:number,fallback:number)=>{const n=typeof v==='number'&&Number.isFinite(v)?v:fallback;return Math.min(hi,Math.max(lo,n));};
const ZONES:readonly DecalZone[]=['toe','outside','inside','heel','tongue'];
const COLLARS:readonly Collar[]=['low','mid','sock'],LACES:readonly Laces[]=['visible','covered','laceless'];
/** The model's metadata. */
export const modelOf=(m:BootModel)=>MODELS.find(x=>x.id===m)??MODELS[0];
const isRef=(kind:DecalKind,ref:unknown)=>typeof ref==='string'&&(kind==='sticker'?(STICKER_IDS as readonly string[]).includes(ref):kind==='flag'?FLAGS.some(f=>f.code===ref):QUOTES.some(q=>q.id===ref));

/** Anything (old saves, a hand-edited localStorage, a bad merge) → a safe design. Unknown values fall back to the defaults. */
export function validateBoots(input:unknown):BootDesign{
 const d=(input&&typeof input==='object'?input:{}) as Partial<BootDesign>&Record<string,unknown>;
 const D=DEFAULT_BOOTS;
 const colors={} as Record<ColourZone,string>;
 const c=(d.colors&&typeof d.colors==='object'?d.colors:{}) as Record<string,unknown>;
 for(const z of COLOUR_ZONES.map(z=>z.id))colors[z]=typeof c[z]==='string'&&HEX.test(c[z] as string)?(c[z] as string).toLowerCase():D.colors[z];
 const decals:BootDecal[]=[];const ids=new Set<string>();
 if(Array.isArray(d.decals))for(const raw of d.decals){
  if(decals.length>=DECAL_LIMIT)break;
  if(!raw||typeof raw!=='object')continue;const r=raw as Record<string,unknown>;
  const kind=pick<DecalKind>(r.kind,['sticker','flag','quote'],'sticker');if(!isRef(kind,r.ref))continue;
  let id=typeof r.id==='string'&&/^[\w-]{1,24}$/.test(r.id)?r.id:`d${decals.length}`;while(ids.has(id))id+='x';ids.add(id);
  const decal:BootDecal={id,kind,ref:r.ref as string,zone:pick(r.zone,ZONES,'outside'),x:clamp(r.x,-1,1,0),y:clamp(r.y,-1,1,0),size:clamp(r.size,.5,1.6,1),rot:clamp(r.rot,-60,60,0)};
  if(kind==='quote')decal.tint=typeof r.tint==='string'&&HEX.test(r.tint)?r.tint.toLowerCase():'#f6f3ea';
  decals.push(decal);
 }
 const name=cleanName(typeof d.name==='string'?d.name:'').trim();
 const model=pick(d.model,MODEL_IDS,'speed'),M=modelOf(model);
 const num=typeof d.number==='number'&&Number.isInteger(d.number)&&d.number>=0&&d.number<=99?d.number:null;
 return {v:1,model,
  upper:pick(d.upper,['knit','synthetic','leather'],D.upper),collar:M.collar??pick(d.collar,COLLARS,D.collar),laces:M.laces??pick(d.laces,LACES,D.laces),
  finish:pick(d.finish,['matte','glossy','metallic','iridescent'],D.finish),studs:typeof d.studs==='string'&&STUD_ALIAS[d.studs.toLowerCase()]?STUD_ALIAS[d.studs.toLowerCase()]:D.studs,
  studFinish:pick(d.studFinish,STUD_FINISH_IDS,D.studFinish),
  pattern:pick(d.pattern,['solid','fade','speckle','stripes','camo','zigzag'],D.pattern),colors,decals,
  name:nameAllowed(name)?name:'',number:num,heelText:pick(d.heelText,['name','number'],D.heelText),
  flag:typeof d.flag==='string'&&FLAGS.some(f=>f.code===d.flag)?d.flag:null,flagSpot:pick(d.flagSpot,['tongue','heel'],D.flagSpot)};
}

/* ---------- Price ---------- */
// Oct 12 2026 (user: "make them pricier"): about 2.5× the first prices, boots are something to save up for over a few days.
export const PRICE={base:200,finish:{matte:0,glossy:10,metallic:40,iridescent:50},collar:{low:0,mid:15,sock:25},laces:{visible:0,covered:15,laceless:25},
 // the shapes with extra parts (fins, a lace cover, a strike pad, a fold-over tongue) cost a little more
 model:{speed:0,retro:10,classic:15,feather:15,fins:30,track:10,longflap:25,cage:25,offset:20,wrap:15,pro:15,knit:15,sock:10,laceless:10,indoor:0},
 studs:{fg:0,blade:10,hybrid:15,chevron:15,sg:25,sgmix:30,ag:10,turf:0,indoor:0,futsal:5,split:40,carbon:50},
 studFinish:{matte:0,glossy:0,translucent:15,chrome:20,tipped:10},pattern:15,decal:5,name:10,flag:10} as const;
/** Coins, with the lines the Done step shows. The shop owns the numbers in PRICE; the studio only ever reads bootPrice(). */
const isFlat=(t:StudType)=>t==='indoor'||t==='futsal';
export function bootPriceLines(design:BootDesign):{label:string;coins:number}[]{
 const d=validateBoots(design),L:{label:string;coins:number}[]=[{label:'Boots',coins:PRICE.base}];
 const add=(label:string,coins:number)=>{if(coins)L.push({label,coins});};
 add('Model: '+modelOf(d.model).label,PRICE.model[d.model]);
 add(FINISHES.find(f=>f.id===d.finish)!.label+' finish',PRICE.finish[d.finish]);
 add(d.collar==='sock'?'Sock collar':'Knit mid collar',PRICE.collar[d.collar]);add(d.laces==='covered'?'Lace cover':'Laceless',PRICE.laces[d.laces]);
 add('Studs: '+STUDS.find(s=>s.id===d.studs)!.label,PRICE.studs[d.studs]);
 add('Stud finish: '+STUD_FINISHES.find(f=>f.id===d.studFinish)!.label,isFlat(d.studs)?0:PRICE.studFinish[d.studFinish]);
 add(PATTERNS.find(p=>p.id===d.pattern)!.label+' pattern',d.pattern==='solid'?0:PRICE.pattern);
 add(`${d.decals.length} sticker${d.decals.length===1?'':'s'}`,d.decals.length*PRICE.decal);
 add('Heel stitching',(d.heelText==='name'?d.name:d.number!=null)?PRICE.name:0);
 add('Flag badge',d.flag?PRICE.flag:0);
 return L;
}
export function bootPrice(design:BootDesign):number{return bootPriceLines(design).reduce((a,l)=>a+l.coins,0);}

/* ---------- Random ---------- */
export function randomBoots(rand:()=>number=Math.random,keep?:Pick<BootDesign,'name'|'number'|'heelText'|'flag'|'flagSpot'|'decals'>):BootDesign{
 const one=<T,>(a:readonly T[])=>a[Math.floor(rand()*a.length)%a.length];
 const sw=PALETTE.map(p=>p.hex),base=one(sw),contrast=one(sw.filter(h=>h!==base)),third=one(sw.filter(h=>h!==base&&h!==contrast));
 const twoTone=rand()<.5;
 return validateBoots({v:1,model:one(MODEL_IDS),upper:one(UPPERS).id,collar:one(COLLARS),laces:one(LACES),finish:one(FINISHES).id,
  studs:one(STUDS).id,studFinish:one(STUD_FINISH_IDS),pattern:one(PATTERNS).id,
  colors:{toe:twoTone?contrast:base,mid:base,heel:twoTone?contrast:third,collar:one([base,contrast,'#18191d']),laces:one([contrast,'#f6f3ea',base]),
   soleplate:one([contrast,third,'#f6f3ea','#18191d']),studs:one([base,contrast,'#f6f3ea']),tips:one([contrast,third,'#18191d']),accent:third},
  ...(keep??{decals:[],name:'',number:null,heelText:'number',flag:null,flagSpot:'tongue'})});
}

/* ---------- Saves ---------- */
export type BootSlot={name:string;design:BootDesign;at:number}|null;
export type BootSaves={v:1;current:BootDesign;slots:BootSlot[]};
type Store=Pick<Storage,'getItem'|'setItem'>;
const storage=():Store|null=>{try{return typeof window!=='undefined'?window.localStorage:null;}catch{return null;}};
export function loadBootSaves(store:Store|null=storage()):BootSaves{
 let raw:unknown=null;try{raw=JSON.parse(store?.getItem(BOOTS_KEY)??'null');}catch{raw=null;}
 const r=(raw&&typeof raw==='object'?raw:{}) as Partial<BootSaves>;
 const slots:BootSlot[]=Array.from({length:SLOT_COUNT},(_,i)=>{const s=Array.isArray(r.slots)?r.slots[i]:null;
  if(!s||typeof s!=='object')return null;const n=cleanName(String((s as {name?:unknown}).name??'')).trim();
  return {name:n&&nameAllowed(n)?n:`Boots ${i+1}`,design:validateBoots((s as {design?:unknown}).design),at:Number((s as {at?:unknown}).at)||0};});
 return {v:1,current:r.current?validateBoots(r.current):DEFAULT_BOOTS,slots};
}
export function storeBootSaves(saves:BootSaves,store:Store|null=storage()){try{store?.setItem(BOOTS_KEY,JSON.stringify(saves));}catch{/* full or blocked: the studio keeps working */}}
