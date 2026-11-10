/**
 * Toy kinds (Nov 9 2026; docs/gashapon-design.md "Round 3B: toy kinds"). Real capsule toys are not all figurines: some are
 * squishy, some come apart and go back together, some wind up and walk, some spin, bobble, dangle on a chain, or hide a secret
 * mini inside a second capsule. Every one of the 84 toys has a main KIND (how you mostly play with it in the viewer) and a BONUS
 * (a second, smaller interaction), chosen to fit the toy's own identity, link and personality in lib/gashapon/toys.ts.
 *
 * Machine mix (tests/gashapon-viewer.cjs checks it): every machine has at least one take-apart puzzle, one or two squishy toys
 * (squish or jelly), at least one mechanical toy (wind-up, spin-top or mechanism), and its rare is a capsule-in-capsule secret with
 * a rare finish (gold, clear, glitter or pearl) and an extra part.
 *
 * Status: machines listed in KIND_LIVE play their kinds in the viewer (lib/gashapon/toyInteract.ts); the others keep their round
 * 3A tap / poke / squeeze reactions until their rollout batch. Pure data, no three.js.
 */
import type {GashaponMachineId} from './machines';

export type ToyKind='squish'|'jelly'|'puzzle'|'windup'|'spintop'|'bobble'|'capsule'|'mechanism'|'charm'|'figure';
export type RareFinish='gold'|'clear'|'glitter'|'pearl';
export type KindInfo={label:string;hint:string;action:string;keys:string;real:string};

/** The taxonomy: what each kind is in the real capsule-toy world, and how it plays here. `hint` is the first-use chip. */
export const TOY_KINDS:Record<ToyKind,KindInfo>={
 squish:{label:'Squishy',hint:'Squeeze me',action:'Squeeze',keys:'Hold S to squeeze, Space to poke',real:'Soft foam / mochi squeeze toys, often slow-rising: they keep the dent for a moment, then puff back.'},
 jelly:{label:'Jelly',hint:'Squeeze me',action:'Squeeze',keys:'Hold S to squeeze, Space to poke',real:'Clear, water-filled or translucent jelly figures; they wobble and catch the light, some change colour when warm.'},
 puzzle:{label:'Take-apart',hint:'Pull me apart',action:'Take a piece off',keys:'A takes a piece off, R puts one back',real:'Snap-together mini kits and layered miniature food: pieces come apart and click back without tools.'},
 windup:{label:'Wind-up',hint:'Wind me up',action:'Wind up',keys:'Hold W to wind, let go to run',real:'Zenmai wind-up walkers and pull-back rollers: turn the key, let go, it toddles off on its own.'},
 spintop:{label:'Spinner',hint:'Flick to spin',action:'Spin',keys:'F spins it',real:'Mini spinning tops and spinners: a flick, a long hum, a wobble as it slows, then it settles.'},
 bobble:{label:'Bobble',hint:'Bump my head',action:'Bump',keys:'B bumps it',real:'Bobbleheads on a spring neck: any bump sets the head nodding.'},
 capsule:{label:'Secret capsule',hint:'Twist me open',action:'Twist open',keys:'O twists it open',real:'Capsule-in-capsule and "secret" blind items: a second little capsule hides the rare one.'},
 mechanism:{label:'Working parts',hint:'Try my parts',action:'Work a part',keys:'M works the next part, Up and Down move it',real:'Miniatures with working parts: lids that open, wheels that roll, flaps and doors that flip.'},
 charm:{label:'Charm',hint:'Swing me',action:'Swing',keys:'C swings it, drag the ring to swing it yourself',real:'Keychain mascots on a ball chain: they swing and dangle from the bag strap.'},
 figure:{label:'Figure',hint:'Pose me',action:'Change pose',keys:'P changes the pose, V strikes the star pose, Space pokes it',real:'Classic posed figurines and mascots: a face, a pose, a little reaction.'},
};
export const TOY_KIND_NAMES=Object.keys(TOY_KINDS) as ToyKind[];
/** Kinds that count as "squishy" and "mechanical" for the machine mix. */
export const SQUISHY:readonly ToyKind[]=['squish','jelly'],MECHANICAL:readonly ToyKind[]=['windup','spintop','mechanism'];

export type ToyKindPlan={kind:ToyKind;bonus:ToyKind;rare?:RareFinish};
/** id → [kind, bonus, rare finish]. Every toy has one; the rare of each machine is a secret capsule. */
const P=(kind:ToyKind,bonus:ToyKind,rare?:RareFinish):ToyKindPlan=>rare?{kind,bonus,rare}:{kind,bonus};
export const TOY_KIND_PLAN:Readonly<Record<string,ToyKindPlan>>={
 // Onigiri Pals: the pilot (live).
 'onigiri-ollie':P('puzzle','squish'),// nori wrap off, rice top lifts, a plum filling inside
 'melon-pan-mimi':P('squish','spintop'),// a crackly crust that dents, flick to spin
 'nikuman-nico':P('squish','bobble'),// a soft steamed bun, its top twist bobbles
 'karaage-kai':P('windup','squish'),// a wind-up walker on little legs
 'oden-odie':P('puzzle','bobble'),// three pieces off the stick, back in order
 'golden-onigiri':P('capsule','squish','gold'),// a gold mini capsule, twist to reveal
 // Lucky Little Japan.
 'daruma-dash':P('puzzle','bobble'),// a daruma-otoshi stack; rolls back upright
 'maneki-mika':P('squish','mechanism'),// soft vinyl cat, the paw lever beckons
 'origami-orin':P('mechanism','charm'),// wings fold and flap
 'koinobori-koi':P('spintop','charm'),// the streamer pole spins in the wind
 'ema-emi':P('charm','mechanism'),// swings on her string
 'torii-tomo':P('capsule','figure','pearl'),
 // Sweet Shop Treats.
 'taiyaki-tai':P('puzzle','squish'),// splits into halves with a bean filling
 'mochi-momo':P('squish','bobble'),// slow-rising mochi
 'dango-trio':P('puzzle','spintop'),// three dumplings off the stick
 'ramune-rin':P('jelly','mechanism'),// clear glass, press the marble down
 'dorayaki-doug':P('mechanism','squish'),// the two pancakes open on a hinge
 'kakigori-kiki':P('capsule','jelly','clear'),
 // Bento Box Buddies.
 'bento-ben':P('puzzle','mechanism'),// compartments lift out, the lid hinges
 'tamago-tama':P('squish','mechanism'),// rolled egg, unrolls
 'curry-bun-cooper':P('squish','bobble'),
 'banana-bolt':P('mechanism','bobble'),// the peel flaps open
 'juice-box-jun':P('bobble','mechanism'),// the straw bobbles, the box squeezes a slurp
 'sushi-roll-sora':P('capsule','puzzle','glitter'),
 // Cabinet Heroes.
 'striker-sparky':P('windup','bobble'),// a wind-up knee-slider
 'breakaway-bolt':P('bobble','windup'),
 'tennis-tess':P('squish','charm'),// a squeezy tennis-ball pal
 'flipper-finn':P('mechanism','spintop'),// the flipper lever flicks
 'puzzle-pip':P('puzzle','mechanism'),// sliding tiles
 'claw-club-bean':P('capsule','squish','glitter'),
 // Pixel Pitch.
 'pixel-ball':P('squish','spintop'),// squashes into a smaller square
 'pixel-keeper':P('puzzle','bobble'),// voxel blocks come apart
 'pixel-ref':P('windup','bobble'),// marches when wound
 'ticket-twirl':P('mechanism','charm'),// the ticket unrolls
 'puck-pal':P('spintop','mechanism'),
 'high-score-hero':P('capsule','puzzle','gold'),
 // Beach Day.
 'beachball-bea':P('squish','spintop'),
 'sandcastle-sam':P('puzzle','mechanism'),// towers lift off, the door opens
 'flip-flop-flo':P('mechanism','charm'),
 'surfboard-sid':P('windup','bobble'),// a pull-back surfer
 'sunhat-sunny':P('spintop','charm'),
 'lifeguard-lou':P('capsule','mechanism','pearl'),
 // Shell Seekers.
 'starfish-stella':P('squish','spintop'),
 'hermit-hank':P('puzzle','windup'),// leaves his shell and moves back in
 'sand-dollar-dee':P('spintop','mechanism'),// spins on her edge like a coin
 'conch-connie':P('charm','mechanism'),
 'seagull-sully':P('bobble','windup'),
 'sea-glass-gem':P('capsule','jelly','clear'),
 // Boots & Kits.
 'golden-boot-gus':P('windup','mechanism'),// a kicking walker
 'shin-pad-shay':P('squish','mechanism'),
 'glove-frog':P('bobble','squish'),
 'armband-andi':P('squish','charm'),// stretchy
 'kit-shirt-kip':P('puzzle','charm'),// shirt, number and shorts layers
 'corner-flag-cora':P('capsule','charm','glitter'),
 // Trophies & Legends.
 'cup-captain':P('puzzle','mechanism'),// lid, handles and base
 'medal-milo':P('charm','spintop'),
 'whistle-wyn':P('mechanism','charm'),// the pea rattles
 'scarf-skye':P('squish','charm'),
 'tv-ball-tico':P('spintop','puzzle'),
 'stadium-stan':P('capsule','mechanism','gold'),
 // Rides & Rollers.
 'scooter-skip':P('windup','mechanism'),// pull-back
 'bike-bram':P('mechanism','windup'),// pedals turn the wheels
 'moped-mo':P('bobble','windup'),
 'jetpack-jo':P('puzzle','spintop'),// tanks and flames come off
 'ferry-fern':P('squish','windup'),// a squeaky bath-toy ferry
 'lighthouse-lumi':P('capsule','mechanism','pearl'),
 // Bug Squad.
 'ladybug-libby':P('mechanism','windup'),// the wing cases open
 'grasshopper-gil':P('windup','squish'),// a pull-back hopper
 'ant-ace':P('puzzle','windup'),// head, thorax, abdomen
 'dragonfly-dax':P('spintop','charm'),
 'firefly-fia':P('jelly','charm'),// a glowing jelly lantern
 'monarch-mara':P('capsule','mechanism','glitter'),// a chrysalis capsule
 // Reef Friends.
 'reef-shark-remi':P('windup','bobble'),
 'clownfish-coco':P('squish','charm'),
 'octo-otto':P('jelly','squish'),
 'manta-maya':P('charm','spintop'),
 'turtle-tali':P('puzzle','windup'),// the shell lifts off
 'whale-wendell':P('capsule','squish','pearl'),
 // Summit Orchard.
 'mango-max':P('squish','spintop'),
 'papaya-pia':P('puzzle','squish'),// halves and seeds
 'avo-kicker':P('mechanism','bobble'),// the seed pops out
 'orange-orbit':P('spintop','squish'),
 'cairn-carl':P('puzzle','bobble'),// a stone stack
 'summit-goal-gigi':P('capsule','mechanism','gold'),
};
/** Machines whose toys already play their kinds in the viewer (the rest keep the round 3A reactions until their batch). */
export const KIND_LIVE:ReadonlySet<GashaponMachineId>=new Set<GashaponMachineId>(['gs-square-snacks','gs-cay-sweets','gs-cay-bento','gs-summit','gs-eleven','gs-oldtown','gs-jetty','gs-square-lucky','gs-northbeach','gs-sharks','gs-cayplaza','gs-arcade-heroes','gs-arcade-pixel','gs-westbeach']);
export const kindPlan=(id:string):ToyKindPlan|null=>TOY_KIND_PLAN[id]??null;
