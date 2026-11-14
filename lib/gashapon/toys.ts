/**
 * The 84 gashapon toys (owner request, Nov 8 2026; docs/gashapon-design.md): six per machine, every id unique, nothing shared
 * across machines. Pure data, no React and no three.js.
 *
 * Every toy links to football, the island or Japan (owner, Nov 8 2026): `link.kind` is 'soccer' | 'island' | 'japan' (Konbini food
 * counts as island or japan) and `link.note` says how. Kid-level names, no real brands, no real people; good-luck figures are cute
 * figurines, never jokes. Rarity is a simple weight per toy (RARITY_WEIGHT): three common, two uncommon and one rare per machine,
 * so each machine's weights sum to 100 (common 22 % each, uncommon 12 %, rare 10 %). No pity counter and no guaranteed-new rule.
 *
 * `touch` is what the toy does in the viewer (next round): squeeze, poke and a tap on the head. `sound` is a plain-words recipe for
 * the synthesised voice (Web Audio oscillators + a noise burst, no audio files). `colors` are [body, accent] for its small mesh.
 */
import {gashaponSetOf,type GashaponMachineId} from './machines';

export type ToyRarity='common'|'uncommon'|'rare';
export const RARITY_WEIGHT:Record<ToyRarity,number>={common:22,uncommon:12,rare:10};
export const RARITY_MIX:Record<ToyRarity,number>={common:3,uncommon:2,rare:1};
export type ToyLinkKind='soccer'|'island'|'japan';
export type GashaponToy={id:string;machine:GashaponMachineId;name:string;rarity:ToyRarity;personality:string;
 link:{kind:ToyLinkKind;note:string};touch:{squeeze:string;poke:string;tap:string};sound:string;colors:[string,string]};

type Row=[id:string,name:string,rarity:ToyRarity,personality:string,kind:ToyLinkKind,note:string,squeeze:string,poke:string,tap:string,sound:string,body:string,accent:string];
/** Every machine that owns a set (the DRIP FC Stadium four share sets, machines.ts `set`). */
const rows:Record<Exclude<GashaponMachineId,`gs-stadium-${string}`>,Row[]>={
 'gs-square-snacks':[
  ['onigiri-ollie','Onigiri Ollie','common','A calm rice ball who never drops a pass.','japan','A Konbini rice ball wrapped in seaweed','squishes flat, then puffs back round','wobbles and giggles','bows a tiny bow','a soft "mm-hm" bloop, low then high','#f7f4ea','#1d2b24'],
  ['melon-pan-mimi','Melon Pan Mimi','common','A sweet bun with a crunchy grid on top, always cheerful.','japan','The Konbini melon bread bun','crackles like a crust','spins once','sprinkles sugar sparkles','three crispy clicks and a bright "pip"','#f4d36a','#8bbf4a'],
  ['nikuman-nico','Nikuman Nico','common','A steamy bun who is warm-hearted and a bit sleepy.','japan','The steamed bun from the Konbini counter','lets out a puff of steam','yawns','wakes with a hop','a breathy "fwoo" puff then a yawn slide','#fbf3e4','#c98a56'],
  ['karaage-kai','Karaage Kai','uncommon','A golden crispy bite who loves a quick one-two.','island','Hot food from the Island Square Konbini','crunches and bounces','sizzles','does a little kick-up','a short sizzle hiss and a pop','#d98c2b','#fff0b8'],
  ['oden-odie','Oden Odie','uncommon','A cosy stick of oden friends who never leaves a teammate.','japan','Konbini oden pot snack on a stick','the three pieces sway','one piece waves','they all cheer together','three warm boops, one after another','#c79a5b','#f1e3c2'],
  ['golden-onigiri','Golden Onigiri','rare','The shiniest rice ball on the island, rare and lucky.','island','A Konbini rice ball, in shiny gold','glows and chimes','twinkles','rings like a little bell','a sparkly chime run going up','#ffd447','#fff8d6'],
 ],
 'gs-square-lucky':[
  ['daruma-dash','Daruma Dash','common','A round wish-doll who always gets back up after a tumble.','japan','A daruma wish doll: fall down, get up','rocks and rolls upright','tips over and pops back','winks one painted eye','a wooden "tok" then a wobbly roll','#d8342c','#fff1d6'],
  ['maneki-mika','Maneki Mika','common','A beckoning cat who waves friends over for a match.','japan','A maneki-neko waving cat figurine','paw waves faster','purrs','rings her collar bell','a tiny bell "ting" and a purr rumble','#fffaf2','#e94b3c'],
  ['origami-orin','Origami Orin','common','A paper crane who folds into a new shape when happy.','japan','An origami crane folded from paper','wings fold and flap','paper rustle','takes a short glide','a soft paper rustle and a flap-flap','#7ec8e3','#ffffff'],
  ['koinobori-koi','Koi Kite Kaito','uncommon','A carp streamer who swims in the wind like a winger.','japan','A koinobori carp streamer','tail ripples','flutters','swims a loop in the air','a whoosh of wind and a bubbly blip','#2f6fd6','#ff6b6b'],
  ['ema-emi','Ema Emi','uncommon','A wooden wish plaque who hopes for a team win.','japan','A small ema wish plaque, as a cute figurine','creaks gently','its string swings','shows a drawn football','a wooden knock and a hopeful hum','#d9a066','#5a3a1a'],
  ['torii-tomo','Torii Tomo','rare','A little red gate figure who welcomes everyone in.','japan','A torii gate shape, as a cute figurine','stands tall and proud','glows warmly','a petal floats down','a calm low bell and a soft breeze','#e2452f','#2b2b2b'],
 ],
 'gs-cay-sweets':[
  ['taiyaki-tai','Taiyaki Tai','common','A fish-shaped cake who swims through defences.','japan','The fish-shaped sweet cake','flips its tail','blows a bubble','swims a wiggle','a bubbly "blub-blub" and a tail flick','#d8913a','#6b3a1e'],
  ['mochi-momo','Mochi Momo','common','A stretchy rice cake, the bounciest keeper on the cay.','japan','A soft mochi rice cake','stretches long and snaps back','boings','bounces three times','a rubbery "boing" going up','#fff4f8','#f6a9c2'],
  ['dango-trio','Dango Trio','common','Three sweet dumplings on a stick who pass in a triangle.','japan','Three-colour dango on a stick','all three squish in turn','the top one giggles','they spin like a passing triangle','three rising "doo-dee-dah" notes','#f6a9c2','#8bc34a'],
  ['ramune-rin','Ramune Rin','uncommon','A fizzy bottle with a marble that rattles when she laughs.','japan','A fizzy marble-topped soda bottle (generic)','fizz bubbles rise','the marble rattles','pops her cap with a fizz','a glass marble clink and a fizzy hiss','#7fd6ff','#e8fbff'],
  ['dorayaki-doug','Dorayaki Doug','uncommon','Two pancakes and a sweet middle, solid like a back two.','japan','The pancake sandwich sweet from the Konbini','squeezes sweet filling a peek','pats his tummy','claps his two halves','a soft double "pat-pat" and a chuckle','#b8742c','#5a2b1a'],
  ['kakigori-kiki','Kakigori Kiki','rare','A shaved-ice mountain who keeps cool under pressure.','island','Shaved ice for hot Coral Cay days','crunchy ice crackle','drips a tiny drop','sparkles in rainbow syrup','an icy tinkle and a crunchy shuffle','#e8f7ff','#ff5f8f'],
 ],
 'gs-cay-bento':[
  ['bento-ben','Bento Ben','common','A tidy lunch box who brings a balanced snack to every match.','island','The Coral Cay Konbini lunch box','lid pops up','rattles his chopsticks','opens to show a smile','a lid "pop" and a chopstick click','#3f8f6c','#f8e7b0'],
  ['tamago-tama','Tamago Tama','common','A rolled-egg slice, sunny and quick on the turn.','japan','Tamagoyaki rolled egg from a bento','rolls up and unrolls','wobbles','does a sunny spin','a buttery "flop" and a happy "ta-da"','#ffd54a','#f3a712'],
  ['curry-bun-cooper','Curry Bun Cooper','common','A crispy bun with a warm heart and a big shot.','japan','The Konbini curry bun','crunch and a warm puff','says "hot hot!"','blows on himself to cool down','a crunchy "krsh" then a puff of air','#c8862e','#7a3d12'],
  ['banana-bolt','Banana Bolt','uncommon','A banana who fuels up the team after the final whistle.','island','The Konbini’s after-game snack tip: a banana','peels a little and zips back','bends like a curler','points to the goal','a springy "boing" and a zip','#ffe14d','#6b4f1d'],
  ['juice-box-jun','Juice Box Jun','uncommon','A little fruit-juice box who reminds you to drink water too.','island','The drink machines’ hydration lessons','slurps from his straw','gurgles','raises his straw like a flag','a straw slurp and a bubbly gurgle','#ff9a3c','#ffffff'],
  ['sushi-roll-sora','Sushi Roll Sora','rare','A seaweed roll who keeps every ingredient together, like a captain.','japan','A rolled sushi snack (veggie)','rolls in a circle','spins on the spot','unrolls a tiny captain band','a rolling drum patter and a cheer','#1d2b24','#ff7f50'],
 ],
 'gs-arcade-heroes':[
  ['striker-sparky','Striker Sparky','common','The Island Strikers hero who celebrates every goal with a slide.','soccer','The Island Strikers cabinet','does a knee-slide','flexes','scores a tiny goal','an arcade "ding-ding" and a crowd cheer burst','#ff65c8','#ffffff'],
  ['breakaway-bolt','Breakaway Bolt','common','The Breakaway Run runner who dodges every tackle.','soccer','The Breakaway Run cabinet','sprints on the spot','side-steps','jumps a sliding tackle','fast footsteps and a whoosh','#60e9f2','#19152e'],
  ['tennis-tess','Tennis Tess','common','A Futbol Tennis ace who controls every first touch.','soccer','The Futbol Tennis cabinet','juggles a ball','heads it back','volleys over a net','a "pok" bounce, two times','#b991ff','#e8ff6b'],
  ['flipper-finn','Flipper Finn','uncommon','A Futbol Pinball flipper who reads every rebound.','soccer','The Futbol Pinball cabinet','flips up','boings a ball away','lights his bumpers','a pinball "clack" and a bumper bong','#60e9f2','#ff65c8'],
  ['puzzle-pip','Puzzle Pip','uncommon','A Pass Puzzles tile who always sees the space.','soccer','The Pass Puzzles cabinet','slides into place','draws a passing line','clicks a perfect pass','a tile slide and a "click" chime','#ff65c8','#ffe14d'],
  ['claw-club-bean','Claw Club Bean','rare','The lucky bean buddy who escaped the claw machine.','island','The Arcade’s Claw Club machine','gets grabbed and wriggles free','dangles','waves from the prize chute','a claw whirr and a happy "yay"','#e8b654','#447d89'],
 ],
 'gs-arcade-pixel':[
  ['pixel-ball','Pixel Ball','common','A blocky 8-bit football who bounces in squares.','soccer','A retro pixel football','squashes into a smaller square','blinks','bounces in a square path','an 8-bit "bip" bounce','#ffffff','#19152e'],
  ['pixel-keeper','Pixel Keeper','common','An 8-bit goalkeeper who dives left, then right.','soccer','A retro pixel goalkeeper','dives to the side','catches a pixel','punches the ball away','a chiptune dive "bwip" and a save "ta"','#7b5cff','#60e9f2'],
  ['pixel-ref','Pixel Ref','common','A fair 8-bit referee with a beeping whistle.','soccer','A retro pixel referee','blows his whistle','shows a green card for kindness','points to the centre spot','a square-wave whistle "freeet"','#19152e','#e8b654'],
  ['ticket-twirl','Ticket Twirl','uncommon','A curly prize ticket who loves the prize counter.','island','The Arcade’s ticket rolls and prize counter','unrolls a ticket','curls up','prints a little ticket','a ticket printer chatter','#a34f87','#c8b5d1'],
  ['puck-pal','Puck Pal','uncommon','An air hockey puck who glides and never stops smiling.','island','The Arcade’s air hockey table','spins flat','slides away and back','glows at the rail','an air-hockey "clack" and a glide hum','#19152e','#60e9f2'],
  ['high-score-hero','High Score Hero','rare','A golden trophy with a blinking score screen.','soccer','The arcade high-score tables','flashes NEW RECORD','counts up points','does a victory spin','a fast chiptune fanfare going up','#e8b654','#ff65c8'],
 ],
 'gs-westbeach':[
  ['beachball-bea','Beach Ball Bea','common','A bouncy beach ball who plays every game barefoot.','soccer','Beach soccer on soft sand','squishes and boings','rolls in the sand','bounces off your head','a hollow "bonk" and a sandy shuffle','#ff6b6b','#ffe14d'],
  ['sandcastle-sam','Sandcastle Sam','common','A sandcastle with goal posts for towers.','soccer','A beach goal built from sand','loses a little sand, then fixes it','a flag pops up','his door opens with a goal','a soft sand pour and a tiny cheer','#e8c98a','#3ec6e0'],
  ['flip-flop-flo','Flip-Flop Flo','common','A beach sandal who slaps the sand at kick-off.','island','West beach by the surf shop','flaps up and down','slaps','does a little dance step','a "flip-flop" slap rhythm','#3ec6e0','#ff9a3c'],
  ['surfboard-sid','Surfboard Sid','uncommon','A surfboard who rides every wave like a winger down the line.','island','The surf shop on the west beach','bends like a wave','tilts','surfs a small wave','a wave swish and a "woo!"','#ffb347','#2f86d6'],
  ['sunhat-sunny','Sunhat Sunny','uncommon','A sunhat who reminds everyone about shade and water breaks.','island','Sunny beach days and water breaks','brim flops','tips her hat','spins in the breeze','a warm breezy hum and a "pip"','#f6d36b','#ff6b6b'],
  ['lifeguard-lou','Lifeguard Lou','rare','A tiny lifeguard tower who watches over every swim.','island','The lifeguard tower on the beach','its flag waves','blows a soft whistle','raises a safety flag','a short whistle and a seagull call','#ff4d4d','#ffffff'],
 ],
 'gs-northbeach':[
  ['starfish-stella','Starfish Stella','common','A five-armed starfish who points to every open teammate.','island','Starfish found while beachcombing','curls all five arms in','points one arm','spins like a star','a squishy "blip" and a twinkle','#ff8a5c','#ffd0b5'],
  ['hermit-hank','Hermit Hank','common','A hermit crab wearing tiny football boots.','island','Hermit crabs on the beachcombing sand','hides in his shell','peeks out','scuttles sideways','a shell "clack" and tiny tip-taps','#d97b4a','#ffffff'],
  ['sand-dollar-dee','Sand Dollar Dee','common','A flat white sand dollar who rolls like a coin.','island','Empty sand dollars on the beach','gets a tiny crack sound, then is fine','rolls on her edge','flips heads-up','a coin roll and a soft "ting"','#f3eee2','#c9bfa5'],
  ['conch-connie','Conch Connie','uncommon','A spiral shell who toots a kick-off horn.','island','The conch shell beach find','toots','echoes','plays a little tune','a breathy horn "toooo" with an echo','#f7c6b0','#e98a6b'],
  ['seagull-sully','Seagull Sully','uncommon','A cheeky seagull who heads every high ball.','island','Seagulls along the North Beach','flaps and squawks','ruffles feathers','does a header','a "kyaa" squawk and a flap','#ffffff','#ffb03b'],
  ['sea-glass-gem','Sea Glass Gem','rare','A smooth green sea-glass pebble who glows in sunlight.','island','Sea glass from beachcombing','glows','clinks','shines a rainbow spot','a glassy clink and a soft shimmer','#7ad6a6','#d8fff0'],
 ],
 'gs-eleven':[
  ['golden-boot-gus','Golden Boot Gus','common','A shiny boot who laces up for every match.','soccer','Football boots and the top-scorer award','laces wiggle','taps his toe','does a keepy-up','a lace "zip" and a ball "tok"','#ffd447','#23407e'],
  ['shin-pad-shay','Shin Pad Shay','common','A brave shin pad who always keeps legs safe.','soccer','Shin pads keep players safe','bends and pops back','knocks like armour','stands proud','a padded "thump" and a "ready!" beep','#ffffff','#23407e'],
  ['glove-frog','Goalie Glove Frog','common','A frog in big keeper gloves who loves a diving save.','soccer','A goalkeeper’s gloves','ribbits and claps his gloves','leaps','catches a fly ball','a "ribbit" and a glove clap','#4caf50','#ff9a3c'],
  ['armband-andi','Armband Andi','uncommon','A captain’s armband who helps the team speak up.','soccer','The captain’s armband','stretches','says "together!"','glows a bright C','a rubbery stretch and a rally "hup!"','#ffd447','#e94b3c'],
  ['kit-shirt-kip','Kit Shirt Kip','uncommon','A tiny team shirt who swaps with friends after the match.','soccer','The Kit Shop’s jerseys','waves his sleeves','shows his number','spins to show his back','a fabric flap and a cheer','#e94b3c','#ffffff'],
  ['corner-flag-cora','Corner Flag Cora','rare','The corner flag of Eleven Park, who waves for every corner kick.','soccer','The 11v11 pitch’s corner flags','bends and springs back','flutters','waves her flag wide','a springy "twang" and a flag flutter','#ff4d4d','#ffd447'],
 ],
 'gs-oldtown':[
  ['cup-captain','Cup Captain','common','A little trophy who loves a team photo.','soccer','A football cup trophy','its handles wiggle','rings like a bell','lifts itself high','a bright trophy "ting" and a crowd "hooray"','#d4af37','#ffffff'],
  ['medal-milo','Medal Milo','common','A shiny medal who is proud of every teammate.','soccer','Winners’ and runners-up medals','swings on his ribbon','spins','shines','a medal clink and a ribbon swish','#c9a227','#3d8f4f'],
  ['whistle-wyn','Whistle Wyn','common','A friendly referee’s whistle who keeps the game fair.','soccer','The referee’s whistle','toots','rattles his pea','blows full time','a two-tone whistle toot','#c0c0c0','#19152e'],
  ['scarf-skye','Scarf Skye','uncommon','A striped supporters’ scarf who sings in the stands.','soccer','Matchday scarves at Old Town Ground','twirls overhead','waves','sings a chant','a soft "la-la-la" hum and a swish','#3d8f4f','#ffffff'],
  ['tv-ball-tico','TV Ball Tico','uncommon','A black-and-white panel ball from long ago, made for TV.','soccer','The 1970 TV-style ball in the Konbini history lesson','spins his panels','bounces','shows black and white panels','an old radio crackle and a bounce','#ffffff','#19152e'],
  ['stadium-stan','Stadium Stan','rare','A tiny stadium whose floodlights blink on at kick-off.','soccer','Old Town Ground and its 7v7 pitch','crowd wave ripples','floodlights blink','plays a kick-off cheer','a stadium roar swell and a whistle','#3d8f4f','#ffe9a8'],
 ],
 'gs-jetty':[
  ['scooter-skip','Scooter Skip','common','A zippy kick scooter who loves the jetty boards.','island','Scooters from the vending machines','rolls forward and back','dings his bell','does a tail-whip','a wheel whirr and a bell "ding"','#2fa4a9','#ff7a45'],
  ['bike-bram','Bike Bram','common','A bicycle who always signals before turning.','island','Island bikes from the vending machines','pedals spin','rings his bell','pops a tiny wheelie','a chain tick-tick and a bell ring','#3ec6e0','#19152e'],
  ['moped-mo','Moped Mo','common','A little moped who putters around the island roads.','island','Mopeds from the vending machines','putters','beeps','does a lap','a putt-putt engine and a "meep"','#ff7a45','#ffffff'],
  ['jetpack-jo','Jetpack Jo','uncommon','A jetpack who lifts off for an overhead kick.','island','The jetpack ride','hovers up a little','sputters','zooms a loop','a soft whoosh and a sparkle trail','#c0c0c0','#ff4d4d'],
  ['ferry-fern','Ferry Fern','uncommon','The island ferry who carries everyone to match day.','island','The ferry and its boarding dock','horn toots','bobs on water','sails in a circle','a deep "boo-oop" horn and wave lapping','#ffffff','#2f6fd6'],
  ['lighthouse-lumi','Lighthouse Lumi','rare','The East Jetty lighthouse who guides boats home at night.','island','The East Jetty lighthouse','lamp sweeps around','blinks','beams a big light','a low foghorn and a soft hum','#ffffff','#e94b3c'],
 ],
 'gs-cayplaza':[
  ['ladybug-libby','Ladybug Libby','common','A spotty ladybug in goalie gloves.','island','The island bugs in the Bug book','opens her wing cases','counts her spots','flies a short hop','a tiny buzz and a click','#e2452f','#19152e'],
  ['grasshopper-gil','Grasshopper Gil','common','A full-back grasshopper who jumps into every tackle.','island','Grasshoppers in the Bug book','legs spring','chirps','hops high','a springy chirp-chirp','#7fb13c','#ffd84a'],
  ['ant-ace','Ant Ace','common','A strong little ant who carries the team’s water bottles.','island','Ants in the Bug book','lifts a crumb','waves her antennae','marches in place','a tiny tap-tap march','#5a3a1a','#ff9a3c'],
  ['dragonfly-dax','Dragonfly Dax','uncommon','A quick midfield dragonfly who changes direction in a blink.','island','Dragonflies in the Bug book','wings buzz','hovers','darts left and right','a fast wing buzz and a zip','#3ec6e0','#7ad6a6'],
  ['firefly-fia','Firefly Fia','uncommon','A firefly who lights up night matches.','island','Fireflies in the Bug book','glows brighter','blinks','flashes a little pattern','a soft twinkle chime','#ffd84a','#2f3b2a'],
  ['monarch-mara','Monarch Mara','rare','A butterfly captain with orange wings.','island','The monarch butterfly in the Bug book','wings fold together','flutters','opens her wings wide','a light flutter and a high glissando','#ff8f1f','#19152e'],
 ],
 'gs-sharks':[
  ['reef-shark-remi','Reef Shark Remi','common','A friendly reef shark who only chases footballs.','island','Sharks Beach and its reef sharks','swishes his tail','grins','circles once','an underwater "bwomm" and bubbles','#7fa3c2','#ffffff'],
  ['clownfish-coco','Clownfish Coco','common','A stripy clownfish who hides in the anemone between plays.','island','Reef fish around Coral Cay','wiggles','blows bubbles','darts into a hiding spot','a bubbly "blip-blop"','#ff7f2a','#ffffff'],
  ['octo-otto','Octo Otto','common','An octopus who can juggle eight balls at once.','island','Octopuses on the reef dives','curls his arms','squirts a tiny ink puff','juggles four balls','a squelchy "bloop" and a pop','#c45ab3','#ffd0f0'],
  ['manta-maya','Manta Maya','uncommon','A gentle manta ray who glides like a long pass.','island','The manta rays that loop by the reef','flaps her wings','glides','does a slow loop','a long low whoosh','#2b3a55','#f3f6fb'],
  ['turtle-tali','Turtle Tali','uncommon','A sea turtle who takes her time and never panics.','island','Sea turtles near the Turtle Sandbar','tucks into her shell','blinks slowly','paddles','a slow "plip-plop" paddle','#4f8a4b','#d9c27a'],
  ['whale-wendell','Whale Wendell','rare','A big gentle whale who sings the island to sleep.','island','The whales off the island coast','spouts water','hums','sings a whale song','a deep rising whale call and a spout hiss','#3b5f8a','#bfe3ff'],
 ],
 'gs-summit':[
  ['mango-max','Mango Max','common','A ripe mango who never stops running.','island','The Summit Isle fruit trees','squishes juicy','wobbles','rolls downhill a little','a juicy "splorp" and a bounce','#ffb03b','#5ca83a'],
  ['papaya-pia','Papaya Pia','common','A papaya who shares her seeds like assists.','island','Summit Isle papaya trees','opens to show seeds','giggles','spins','a soft "pop" and seeds rattling','#ff8a4c','#2b2b2b'],
  ['avo-kicker','Avo Kicker','common','An avocado who kicks with his round seed.','island','Summit Isle avocado trees','his seed pops out and back','rocks','does a bicycle kick','a hollow "tunk" and a whoosh','#6aa84f','#8b5a2b'],
  ['orange-orbit','Orange Orbit','uncommon','A round orange who curls shots around the wall.','island','Summit Isle orange trees','squirts a zesty mist','spins','curls through the air','a zesty spray hiss and a "wheee"','#ff9a1f','#3c8d2f'],
  ['cairn-carl','Cairn Carl','uncommon','A stack of stones from the lookout who never topples.','island','The summit lookout’s flag and cairn','stones wobble but stay','clacks','his flag waves on top','stone clacks and a breezy whistle','#9a9a9a','#e94b3c'],
  ['summit-goal-gigi','Summit Goal Gigi','rare','The little goal from the Summit 5s, the highest pitch on the island.','soccer','The Summit 5s pitch on top of the mountain','net ripples','posts ping','a ball flies into her net','a net swish and a post "ping" echo','#ffffff','#6a5acd'],
 ],
};

export const GASHAPON_TOYS:readonly GashaponToy[]=Object.entries(rows).flatMap(([machine,list])=>list.map(([id,name,rarity,personality,kind,note,squeeze,poke,tap,sound,body,accent])=>({
 id,machine:machine as GashaponMachineId,name,rarity,personality,link:{kind,note},touch:{squeeze,poke,tap},sound,colors:[body,accent] as [string,string]})));
const BY_ID=new Map(GASHAPON_TOYS.map(t=>[t.id,t]));
export const gashaponToy=(id:string)=>BY_ID.get(id);
/** A machine's six toys: its own, or (the stadium machines, machines.ts `set`) the set it shares. */
export const toysIn=(machine:string)=>{const set=gashaponSetOf(machine);return GASHAPON_TOYS.filter(t=>t.machine===set);};
export const toyWeight=(t:Pick<GashaponToy,'rarity'>)=>RARITY_WEIGHT[t.rarity];
/** Pick a toy from a machine with a 0 ≤ u < 1 roll, by rarity weight. */
export function pickToy(machine:string,u:number):GashaponToy|null{
 const list=toysIn(machine);if(!list.length)return null;const total=list.reduce((n,t)=>n+toyWeight(t),0);
 let x=Math.min(Math.max(Number.isFinite(u)?u:0,0),.999999)*total;for(const t of list){x-=toyWeight(t);if(x<0)return t;}return list[list.length-1];
}
/** Toy Shelf counts (round 3A): found toys over all machines ("N / 84") and per machine ("n / 6"). */
export function shelfCounts(owned:Readonly<Record<string,unknown>>){
 const per:Record<string,number>={};let found=0;for(const t of GASHAPON_TOYS){per[t.machine]??=0;if(owned[t.id]){per[t.machine]++;found++;}}
 return {found,total:GASHAPON_TOYS.length,per};
}
