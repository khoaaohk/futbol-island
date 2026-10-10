/**
 * Save-code words (docs/accounts-design.md §5.1; Oct 9 2026). A save code is three of these words plus a number 100–999:
 * 1,024 words = 10 bits each, so 3 words + 900 numbers ≈ 39.8 bits (9.4 × 10¹¹ codes).
 *
 * Rules (tests/game-saves.cjs checks them):
 *  - exactly 1,024 lowercase a–z words of 3–9 letters, mostly one or two syllables: football words first, then food, animals,
 *    island and nature words already in the game, toys, music and fun words;
 *  - unique in their first 4 letters, so autocomplete is certain after 4 letters (a 3-letter word is its own prefix);
 *  - no homophones of other common words (sea/see, pear/pair…), nothing rude or scary, and no rude adjacent pair
 *    (PAIR_BLOCK in code.ts is checked when a code is made);
 *  - APPEND ONLY. A code is hashed as its words (code.ts normaliseCode), and typing snaps to the nearest listed word, so a
 *    word that was ever handed out must stay, spelled the same. A future longer list bumps CODE_VERSION
 *    (game_saves.code_version) and old codes keep working.
 * PICTURES: a small picture (emoji, drawn by the device's own font: nothing to download) for a word where a clear one exists
 * and no other word already uses it, as a memory aid for slow readers. The picture is never part of the secret.
 */
export const WORDS=`
 striker volley corner goal keeper pitch header tackle cross pass dribble shot kick save whistle referee
 captain coach trophy medal jersey shirt boots socks shorts glove net penalty freekick throw offside winger
 defender midfield forward sweeper fullback center halftime extra golden silver bronze champion cup league derby final
 squad team club badge stadium fans chant scarf flag banner drum bench locker training cone bib
 ladder hurdle sprint jog warmup stretch futsal nutmeg lob curve swerve spin bounce trap control juggle
 flick backheel bicycle overhead dive wall huddle shape formation triangle diamond switch assist rebound rocket thunder
 laser timeout manager replay camera screen table points yellow green orange purple pink white black brown
 grey rainbow cyan teal coral navy maroon crimson indigo violet amber ruby jade olive peach cherry
 lemon mango melon apple banana grape kiwi coconut pineapple papaya guava lychee fig apricot raspberry blueberry
 pumpkin carrot potato tomato pepper onion garlic bean broccoli cabbage lettuce cucumber avocado mushroom peanut almond
 acorn chestnut walnut honey butter cheese bread bagel muffin cookie biscuit cake cupcake donut waffle pancake
 pretzel popcorn candy jelly pudding yogurt icecream sorbet sundae milk juice smoothie soup noodle pasta pizza
 taco burrito sushi rice onigiri dumpling sandwich burger salad omelet egg bacon sausage fries pickle ketchup
 mustard sugar spice cat dog puppy kitten fox wolf lion tiger panda koala monkey gorilla zebra
 giraffe hippo rhino llama alpaca horse pony donkey cow pig sheep lamb goat rabbit bunny hamster
 mouse squirrel hedgehog beaver otter raccoon bison kangaroo sloth lemur owl eagle hawk falcon parrot penguin
 puffin flamingo swan duck goose chicken hen rooster turkey pigeon dove robin sparrow crow seagull toucan
 pelican heron stork frog toad turtle tortoise lizard gecko snake croc dragon dino whale dolphin shark
 walrus octopus crab lobster shrimp clam oyster snail starfish urchin manta stingray eel fish salmon tuna
 trout cod sardine herring mackerel haddock clownfish ant beetle ladybug moth worm cricket firefly unicorn yeti
 mammoth orca narwhal beluga swordfish marlin island beach shell ocean surf reef lagoon bay harbour pier
 dock boat ship yacht canoe kayak raft paddle anchor compass map treasure coin pearl gem crystal
 jewel castle tower bridge cliff cave stone pebble boulder hill mountain volcano valley canyon desert forest
 jungle meadow field garden farm orchard pond lake river waterfall cloud snow ice frost breeze fog
 moon comet planet galaxy sky sunset sunrise dawn dusk light shadow tree palm oak maple willow
 birch cedar leaf branch twig seed sprout tulip daisy lily sunflower lotus ivy moss fern grass
 clover cactus bamboo vine wheat bloom petal blossom nectar pollen thorn ball kite yoyo puzzle robot
 teddy doll blocks lego marble dice domino game joystick arcade pinball tennis racket hoop skate scooter
 bike helmet wagon wheel tram bus car taxi truck tractor van jeep jet glider jetpack ferry
 engine motor gear wrench rope chain bucket shovel spade rake hose broom brush paint crayon pencil
 pen marker eraser ruler paper book notebook page stamp envelope parcel box basket bag pocket purse
 key door window roof house home hut tent cabin igloo barn shed garage school library museum
 shop bakery cafe kitchen sofa bed pillow blanket lamp clock watch phone radio piano guitar trumpet
 flute harp banjo bell horn music song dance party picnic gift present ribbon zipper hat cap
 coat jacket sweater mitten slipper sneaker apron mask cape costume wizard ninja alien mermaid fairy elf
 genie jump hop skip run race dash zoom swim fly float splash climb slide twirl wiggle
 wobble giggle smile laugh clap shout sing hum draw build dream wish hope think learn play
 win hug happy sunny lucky brave swift quick calm kind fresh bright shiny fuzzy fluffy jolly
 merry cozy tiny turbo epic magic mystic secret hidden wild bold proud clever smart wise noble
 royal grand fancy silly funny zany sleepy icy toasty sour crunchy crispy tasty yummy zesty minty
 umpire minute season winter summer autumn rival buddy mate legend icon rookie ace pro maestro chief
 leader guard shield fortress meteor orbit cosmic nova lunar solar tango acrobat album anthem arrow atlas
 attic avenue award axle bagpipe barrel basil bingo blimp blizzard bonfire bongo bubble buggy bumper camp
 canal caramel cargo carnival carousel cartoon cello chalk chimney chipmunk cinnamon circus citrus clarinet clipper comic
 condor confetti copper cottage cowboy coyote crane crumble cuckoo cymbal daffodil dingo dinner disco doodle drizzle
 dune dynamo eclipse elbow elk ember emerald emu falafel fable festival fiddle finch fjord flint flipper
 folder fountain frisbee fudge gadget gazelle geyser ginger glacier glitter globe gopher gondola gravy grizzly grotto
 gumball gumdrop gust harvest hazel helium hiker hockey holly hoodie hotdog hummus husky iceberg iris jaguar
 jamboree jasmine javelin jigsaw jingle journey jumbo karate kazoo kettle kingdom koi lantern lasso lava lavender
 lilac lodge lullaby lynx magnet mallet marina mascot meerkat minnow monsoon mosaic mural nacho nebula nest
 nickel nugget oasis oboe opal opera outfit owlet paprika parsley pecan pendant penny pesto piccolo pilot
 pinwheel pixel plaza plume pogo polka poncho poodle porch potion prairie prism quail quartz quest quill
 radar raisin ramen ranch rapids ravioli recess reindeer relay rhubarb riddle ripple rodeo roller rosemary rover
 rudder saddle safari sailor salsa samba sapphire satchel saturn savanna scallop scone sequin shamrock sherbet snorkel
 sonar spatula sponge spoon spruce staple stencil stilts swallow tabby tadpole teapot tempo thistle thimble ticket
 tinsel toffee topaz torch trinket trolley truffle tuba tugboat tundra turnip twinkle ukulele umbrella vanilla velvet
 veranda viking villa voyage waddle wander wasabi weasel wombat woodland yodel yak yonder zeppelin zigzag zipline
 zoo zucchini abacus airship alpine antler anvil aqua archer arena aspen athlete aurora azure barley beagle
 bento bistro blaze bobcat bonsai boogie bottle bramble brick buffalo bulldog bungalow cable caboose calico canvas
 capsule cardinal caribou cashew celery charm cheddar chef cinder cobalt cougar crater cruise custard dapple dazzle
 denim dewdrop diesel dough driftwood easel eggplant elm emblem evergreen fiesta flapjack flora fondue fossil frigate
 garnet gelato gemstone glade glow griffin guppy harmony hatch hopscotch horizon iguana inlet ivory jetty jubilee
 kelp kernel kimono knapsack lark lasagna lentil lumber lunchbox macaw magpie mandarin maraca mesa midnight mirror
 monarch morning mulberry needle oatmeal octave onyx origami ostrich panther patio perch petunia pheasant pioneer platypus
`.trim().split(/\s+/);
export const PICTURES:Readonly<Record<string,string>>={
 striker:"⚽",corner:"🚩",goal:"🥅",keeper:"🧤",pitch:"🏟️",shot:"🎯",kick:"🦶",whistle:"📣",referee:"🧑‍⚖️",captain:"©️",
 coach:"📋",trophy:"🏆",medal:"🏅",jersey:"👕",boots:"👟",socks:"🧦",shorts:"🩳",golden:"🌟",silver:"🥈",bronze:"🥉",
 team:"👥",club:"🛡️",chant:"🎶",scarf:"🧣",drum:"🥁",bench:"🪑",cone:"🔺",ladder:"🪜",sprint:"🏃",curve:"↪️",
 spin:"🌀",bounce:"⛹️",trap:"🪤",juggle:"🤹",flick:"👆",bicycle:"🚲",dive:"🤿",wall:"🧱",diamond:"💎",switch:"🔀",
 rocket:"🚀",thunder:"⛈️",laser:"🔦",replay:"🔁",camera:"📷",screen:"🖥️",yellow:"🟨",green:"🟩",orange:"🟧",purple:"🟪",
 pink:"🩷",white:"⬜",black:"⬛",brown:"🟫",grey:"🩶",rainbow:"🌈",teal:"🦆",coral:"🪸",violet:"🟣",amber:"🟠",
 jade:"💚",olive:"🫒",peach:"🍑",cherry:"🍒",lemon:"🍋",mango:"🥭",melon:"🍈",apple:"🍎",banana:"🍌",grape:"🍇",
 kiwi:"🥝",coconut:"🥥",pineapple:"🍍",blueberry:"🫐",pumpkin:"🎃",carrot:"🥕",potato:"🥔",tomato:"🍅",pepper:"🌶️",onion:"🧅",
 garlic:"🧄",bean:"🫘",broccoli:"🥦",cabbage:"🥬",cucumber:"🥒",avocado:"🥑",mushroom:"🍄",peanut:"🥜",acorn:"🌰",honey:"🍯",
 butter:"🧈",cheese:"🧀",bread:"🍞",bagel:"🥯",muffin:"🧁",cookie:"🍪",cake:"🍰",donut:"🍩",waffle:"🧇",pancake:"🥞",
 pretzel:"🥨",popcorn:"🍿",candy:"🍬",jelly:"🍮",icecream:"🍦",sundae:"🍨",milk:"🥛",juice:"🧃",smoothie:"🥤",soup:"🍲",
 noodle:"🍜",pasta:"🍝",pizza:"🍕",taco:"🌮",burrito:"🌯",sushi:"🍣",rice:"🍚",onigiri:"🍙",dumpling:"🥟",sandwich:"🥪",
 burger:"🍔",salad:"🥗",omelet:"🍳",egg:"🥚",bacon:"🥓",sausage:"🌭",fries:"🍟",cat:"🐱",dog:"🐶",fox:"🦊",
 wolf:"🐺",lion:"🦁",tiger:"🐯",panda:"🐼",koala:"🐨",monkey:"🐒",gorilla:"🦍",zebra:"🦓",giraffe:"🦒",hippo:"🦛",
 rhino:"🦏",llama:"🦙",horse:"🐴",donkey:"🫏",cow:"🐮",pig:"🐷",sheep:"🐑",goat:"🐐",rabbit:"🐰",hamster:"🐹",
 mouse:"🐭",squirrel:"🐿️",hedgehog:"🦔",beaver:"🦫",otter:"🦦",raccoon:"🦝",bison:"🦬",kangaroo:"🦘",sloth:"🦥",owl:"🦉",
 eagle:"🦅",parrot:"🦜",penguin:"🐧",flamingo:"🦩",swan:"🦢",goose:"🪿",chicken:"🐔",rooster:"🐓",turkey:"🦃",dove:"🕊️",
 robin:"🐦",crow:"🐦‍⬛",frog:"🐸",turtle:"🐢",lizard:"🦎",snake:"🐍",croc:"🐊",dragon:"🐉",dino:"🦕",whale:"🐳",
 dolphin:"🐬",shark:"🦈",octopus:"🐙",crab:"🦀",lobster:"🦞",shrimp:"🦐",oyster:"🦪",snail:"🐌",starfish:"⭐",manta:"🐟",
 clownfish:"🐠",ant:"🐜",beetle:"🪲",ladybug:"🐞",worm:"🪱",cricket:"🦗",unicorn:"🦄",mammoth:"🦣",orca:"🐋",island:"🏝️",
 beach:"🏖️",shell:"🐚",ocean:"🌊",surf:"🏄",harbour:"⚓",pier:"🌉",boat:"⛵",ship:"🚢",yacht:"🛥️",canoe:"🛶",
 compass:"🧭",map:"🗺️",treasure:"💰",coin:"🪙",crystal:"🔮",castle:"🏰",tower:"🗼",cave:"🕳️",stone:"🪨",hill:"⛰️",
 volcano:"🌋",desert:"🏜️",forest:"🌲",jungle:"🌴",field:"🌾",garden:"🌷",farm:"🚜",pond:"💧",lake:"🏞️",cloud:"☁️",
 snow:"❄️",ice:"🧊",breeze:"🍃",fog:"🌫️",moon:"🌙",comet:"☄️",planet:"🪐",galaxy:"🌌",sky:"🌤️",sunset:"🌅",
 sunrise:"🌄",light:"💡",tree:"🌳",maple:"🍁",seed:"🌱",daisy:"🌼",sunflower:"🌻",fern:"🌿",clover:"🍀",cactus:"🌵",
 bamboo:"🎋",bloom:"🌸",kite:"🪁",yoyo:"🪀",puzzle:"🧩",robot:"🤖",teddy:"🧸",dice:"🎲",game:"🎮",joystick:"🕹️",
 tennis:"🎾",racket:"🏸",hoop:"🏀",skate:"🛹",scooter:"🛴",helmet:"⛑️",wheel:"🛞",tram:"🚋",bus:"🚌",car:"🚗",
 taxi:"🚕",truck:"🚚",van:"🚐",jeep:"🚙",jet:"✈️",ferry:"⛴️",engine:"🚂",gear:"⚙️",wrench:"🔧",rope:"🪢",
 chain:"⛓️",bucket:"🪣",broom:"🧹",brush:"🖌️",paint:"🎨",crayon:"🖍️",pencil:"✏️",pen:"🖊️",ruler:"📏",paper:"📄",
 book:"📕",notebook:"📓",stamp:"📮",envelope:"✉️",parcel:"📦",basket:"🧺",bag:"👜",key:"🔑",door:"🚪",window:"🪟",
 roof:"🏠",home:"🏡",hut:"🛖",tent:"⛺",school:"🏫",library:"📚",museum:"🏛️",shop:"🏪",bakery:"🥖",cafe:"☕",
 sofa:"🛋️",bed:"🛏️",clock:"🕰️",watch:"⌚",phone:"📱",radio:"📻",piano:"🎹",guitar:"🎸",trumpet:"🎺",flute:"🪈",
 bell:"🔔",horn:"📯",music:"🎵",dance:"💃",party:"🎉",gift:"🎁",ribbon:"🎀",hat:"🧢",coat:"🧥",mask:"🎭",
 cape:"🦸",wizard:"🧙",ninja:"🥷",alien:"👽",mermaid:"🧜",fairy:"🧚",elf:"🧝",genie:"🧞",hop:"🐇",race:"🏁",
 dash:"💨",swim:"🏊",splash:"💦",climb:"🧗",giggle:"😄",smile:"😊",laugh:"😂",clap:"👏",sing:"🎤",dream:"💭",
 wish:"🌠",hug:"🤗",sunny:"☀️",quick:"⚡",calm:"😌",kind:"💗",bright:"✨",magic:"🪄",secret:"🤫",hidden:"🙈",
 bold:"💪",proud:"🦚",clever:"🧠",royal:"👑",fancy:"🎩",silly:"🤪",sleepy:"😴",toasty:"🔥",tasty:"😋",season:"🍂",
 rival:"⚔️",buddy:"🤝",rookie:"🐣",ace:"🅰️",maestro:"🎼",acrobat:"🤸",album:"💿",arrow:"🏹",avenue:"🛣️",barrel:"🛢️",
 bingo:"🎱",blimp:"🎈",blizzard:"🌨️",bongo:"🪘",bubble:"🫧",buggy:"🛻",camp:"🏕️",carnival:"🎡",carousel:"🎠",cartoon:"📺",
 cello:"🎻",circus:"🎪",citrus:"🍊",comic:"💬",confetti:"🎊",cowboy:"🤠",crane:"🏗️",dinner:"🍽️",disco:"🪩",drizzle:"🌦️",
 eclipse:"🌒",falafel:"🧆",fable:"📖",folder:"📁",fountain:"⛲",frisbee:"🥏",fudge:"🍫",ginger:"🫚",glacier:"🏔️",globe:"🌍",
 gondola:"🚠",hiker:"🥾",hockey:"🏒",husky:"🐕",jaguar:"🐆",jumbo:"🐘",karate:"🥋",kettle:"🫖",koi:"🎏",lantern:"🏮",
 lavender:"💜",lynx:"🐈",magnet:"🧲",mascot:"🐻",monsoon:"🌧️",mural:"🖼️",nest:"🪺",pilot:"🧑‍✈️",pixel:"👾",plume:"🪶",
 poodle:"🐩",potion:"🧪",radar:"📡",recess:"🛝",reindeer:"🦌",riddle:"❓",roller:"🎢",shamrock:"☘️",sponge:"🧽",spoon:"🥄",
 ticket:"🎟️",trolley:"🛒",ukulele:"🪕",umbrella:"☂️",yak:"🐃",zigzag:"〰️",abacus:"🧮",azure:"🔵",bento:"🍱",bonsai:"🪴",
 bottle:"🍼",chef:"🧑‍🍳",denim:"👖",eggplant:"🍆",fondue:"🫕",fossil:"🦴",kimono:"👘",maraca:"🪇",mirror:"🪞",monarch:"🦋",
 oatmeal:"🥣"
};
