/**
 * The first save-code words (Oct 9 2026), replaced by the easy list in words.ts on Oct 10 2026. Kept ONLY so the few codes
 * made with them still restore: code.ts matches them when typed (after the new words, which always win a tie) and accepts them
 * in a stored code, but never uses them to make a new code. Old codes also keep their 3-digit number (100–999).
 * Never edit or remove a word here: a code is hashed as its words.
 */
export const LEGACY_WORDS:readonly string[]=`
 cross shot glove freekick winger defender midfield forward sweeper fullback center halftime golden champion league derby
 locker training warmup nutmeg swerve trap control backheel bicycle overhead huddle shape formation triangle switch thunder
 laser manager screen table points grey cyan teal coral navy maroon crimson indigo violet amber ruby
 jade peach pineapple papaya guava lychee fig apricot raspberry blueberry bean broccoli lettuce cucumber mushroom almond
 chestnut walnut biscuit yogurt icecream sorbet sundae smoothie onigiri dumpling sandwich omelet mustard spice wolf squirrel
 hedgehog raccoon kangaroo lemur falcon puffin flamingo dove sparrow crow pelican heron stork toad tortoise oyster
 starfish urchin manta stingray eel salmon tuna trout cod sardine herring mackerel haddock clownfish ant moth
 firefly yeti narwhal beluga swordfish marlin reef lagoon bay harbour pier dock yacht raft treasure pearl
 cliff cave boulder mountain valley desert meadow orchard waterfall frost dawn dusk shadow oak willow birch
 cedar branch twig sprout sunflower lotus ivy moss vine blossom nectar pollen thorn blocks lego domino
 joystick pinball racket helmet jeep glider ferry chain shovel spade rake hose eraser notebook page stamp
 envelope parcel shed garage bakery cafe flute harp present zipper sweater apron mask costume fairy hop
 skip slide twirl wobble hum swift fresh fuzzy merry cozy mystic hidden wild bold wise noble
 grand zany icy toasty crunchy crispy zesty minty umpire minute season rival mate legend icon rookie
 pro maestro chief leader guard fortress cosmic nova lunar tango album anthem arrow atlas attic avenue
 axle bagpipe barrel basil blimp blizzard bongo bubble buggy bumper canal caramel cargo carnival carousel cartoon
 cello chalk chimney chipmunk cinnamon citrus clarinet clipper condor confetti copper cottage coyote crumble cuckoo cymbal
 daffodil dingo doodle dune dynamo eclipse elk ember emerald emu falafel fable festival fiddle finch fjord
 flint flipper folder fountain frisbee gadget gazelle geyser ginger glacier gopher gondola gravy grizzly grotto gumdrop
 gust harvest hazel helium hiker holly hummus husky iceberg iris jaguar jamboree jasmine javelin jigsaw jingle
 journey kazoo kingdom koi lasso lavender lilac lodge lynx mallet marina mascot meerkat minnow monsoon mosaic
 mural nacho nebula nickel oasis oboe opal opera outfit owlet paprika parsley pecan pendant penny pesto
 piccolo pinwheel pixel plaza plume pogo polka poncho porch potion prairie prism quail quartz quill radar
 ramen ranch rapids ravioli recess reindeer relay rhubarb ripple roller rosemary rover rudder saddle salsa samba
 sapphire satchel savanna scallop scone sequin shamrock sherbet sonar spatula spruce staple stencil stilts swallow tabby
 tadpole tempo thistle thimble tinsel toffee topaz torch trinket trolley truffle tuba tugboat tundra turnip twinkle
 ukulele umbrella vanilla velvet veranda viking villa voyage waddle wander wasabi weasel wombat woodland yodel yonder
 zeppelin zipline zucchini abacus airship alpine antler anvil aqua archer aspen athlete aurora azure barley beagle
 bento bistro bobcat bonsai boogie bramble bulldog bungalow cable caboose calico canvas capsule cardinal caribou cashew
 charm cheddar cinder cobalt cougar crater cruise custard dapple dazzle denim dewdrop diesel dough driftwood easel
 eggplant elm emblem evergreen fiesta flapjack flora fondue frigate garnet gelato gemstone glade griffin guppy harmony
 hopscotch horizon iguana inlet ivory jetty jubilee kelp kernel kimono knapsack lark lasagna lentil lumber lunchbox
 macaw magpie mandarin maraca mesa midnight monarch morning mulberry needle oatmeal octave onyx origami patio perch
 petunia pheasant pioneer platypus
`.trim().split(/\s+/);
/** Their old pictures, so a restored old code still shows one under each word. */
export const LEGACY_PICTURES:Readonly<Record<string,string>>={
 cross:"✖️",shot:"🎯",glove:"🥊",freekick:"🆓",winger:"🛫",defender:"🛡️",midfield:"⭕",forward:"⏩",sweeper:"🧹",fullback:"🔙",
 center:"⏺️",halftime:"⏸️",golden:"🌟",champion:"🥇",league:"📊",derby:"🏇",locker:"🔒",training:"🏋️",warmup:"🌡️",nutmeg:"🦵",
 swerve:"⤵️",trap:"🪤",control:"🎛️",backheel:"👠",bicycle:"🚲",overhead:"🙃",huddle:"👐",shape:"🔷",formation:"♟️",triangle:"📐",
 switch:"🔀",thunder:"⛈️",laser:"🔦",manager:"👔",screen:"🖥️",table:"🏓",points:"💯",grey:"🔘",cyan:"💠",teal:"🟦",
 coral:"🐠",navy:"💙",maroon:"🟤",crimson:"❤️",indigo:"🌃",violet:"🟣",amber:"🟠",ruby:"♦️",jade:"💚",peach:"🧡",
 pineapple:"🍍",papaya:"🧡",guava:"🍏",lychee:"🍡",fig:"🍐",apricot:"🍊",raspberry:"🍓",blueberry:"🫐",bean:"🥫",broccoli:"🥦",
 lettuce:"🥬",cucumber:"🥒",mushroom:"🍄",almond:"🥜",chestnut:"🌰",walnut:"🌰",biscuit:"🥠",yogurt:"🥣",icecream:"🍦",sorbet:"🍧",
 sundae:"🍨",smoothie:"🥤",onigiri:"🍙",dumpling:"🥟",sandwich:"🥪",omelet:"🍳",mustard:"🟡",spice:"🌶️",wolf:"🐺",squirrel:"🐿️",
 hedgehog:"🦔",raccoon:"🦝",kangaroo:"🦘",lemur:"🐒",falcon:"🦅",puffin:"🐧",flamingo:"🦩",dove:"🕊️",sparrow:"🐦",crow:"🐦",
 pelican:"🐦",heron:"🐦",stork:"🍼",toad:"🐸",tortoise:"🐢",oyster:"🦪",starfish:"⭐",urchin:"🦔",manta:"🐟",stingray:"🐟",
 eel:"🐍",salmon:"🐟",tuna:"🍣",trout:"🐟",cod:"🐟",sardine:"🐟",herring:"🐟",mackerel:"🐟",haddock:"🐡",clownfish:"🐠",
 ant:"🐜",moth:"🦋",firefly:"💡",yeti:"⛄",narwhal:"🐋",beluga:"🐳",swordfish:"🐟",marlin:"🐟",reef:"🐠",lagoon:"🏝️",
 bay:"🏖️",harbour:"🚤",pier:"🎣",dock:"🛳️",yacht:"🛥️",raft:"🪵",treasure:"💰",pearl:"⚪",cliff:"🧗",cave:"🕳️",
 boulder:"🪨",mountain:"🗻",valley:"⛰️",desert:"🏜️",meadow:"🐄",orchard:"🍎",waterfall:"💧",frost:"🥶",dawn:"🌄",dusk:"🌆",
 shadow:"👤",oak:"🌳",willow:"🌳",birch:"🌳",cedar:"🌲",branch:"🌿",twig:"🌿",sprout:"🌱",sunflower:"🌻",lotus:"💮",
 ivy:"🌿",moss:"🟢",vine:"🍇",blossom:"🌸",nectar:"🐝",pollen:"🌼",thorn:"🌹",blocks:"🔠",lego:"🧱",domino:"🎲",
 joystick:"🕹️",pinball:"🎱",racket:"🏸",helmet:"⛑️",jeep:"🚙",glider:"🛩️",ferry:"⛴️",chain:"⛓️",shovel:"⛏️",spade:"♠️",
 rake:"🧹",hose:"🚿",eraser:"🧼",notebook:"📓",page:"📃",stamp:"📮",envelope:"✉️",parcel:"📦",shed:"🛠️",garage:"🅿️",
 bakery:"🥖",cafe:"☕",flute:"🎷",harp:"🎼",present:"🎁",zipper:"🤐",sweater:"🧶",apron:"🥼",mask:"🎭",costume:"🥸",
 fairy:"🧚",hop:"👣",skip:"⏭️",slide:"🛷",twirl:"🩰",wobble:"🥴",hum:"🐝",swift:"🚄",fresh:"🌱",fuzzy:"🐥",
 merry:"🥳",cozy:"🥰",mystic:"🔮",hidden:"🙈",wild:"🐗",bold:"💪",wise:"🧐",noble:"🎖️",grand:"🏰",zany:"😜",
 icy:"🧊",toasty:"🥵",crunchy:"🍘",crispy:"🍤",zesty:"🍋",minty:"🌿",umpire:"⚖️",minute:"⏱️",season:"📅",rival:"⚔️",
 mate:"🤜",legend:"📜",icon:"📸",rookie:"🔰",pro:"💼",maestro:"🎼",chief:"🔝",leader:"☝️",guard:"💂",fortress:"🏯",
 cosmic:"🛸",nova:"✴️",lunar:"🌕",tango:"🕺",album:"💿",anthem:"🎙️",arrow:"🏹",atlas:"🌐",attic:"🧳",avenue:"🛣️",
 axle:"🔩",bagpipe:"🎵",barrel:"🛢️",basil:"🌿",blimp:"🎈",blizzard:"🌨️",bongo:"🪘",bubble:"🛁",buggy:"🛻",bumper:"🚘",
 canal:"🛶",caramel:"🍬",cargo:"🚛",carnival:"🎡",carousel:"🎠",cartoon:"📺",cello:"🎻",chalk:"🖍️",chimney:"🏭",chipmunk:"🐿️",
 cinnamon:"🍥",citrus:"🍊",clarinet:"🎷",clipper:"✂️",condor:"🦅",confetti:"🎊",copper:"🔶",cottage:"🏡",coyote:"🐺",crumble:"🥧",
 cuckoo:"🕰️",cymbal:"🥁",daffodil:"🌼",dingo:"🐕",doodle:"📝",dune:"🏜️",dynamo:"🔋",eclipse:"🌒",elk:"🦌",ember:"🔥",
 emerald:"❇️",emu:"🦤",falafel:"🧆",fable:"📖",festival:"🎇",fiddle:"🎻",finch:"🐦",fjord:"⛰️",flint:"🪨",flipper:"🐬",
 folder:"📁",fountain:"⛲",frisbee:"🥏",gadget:"📟",gazelle:"🦌",geyser:"♨️",ginger:"🍪",glacier:"🏔️",gopher:"🐹",gondola:"🚠",
 gravy:"🍛",grizzly:"🐻",grotto:"🕳️",gumdrop:"🍬",gust:"🌬️",harvest:"🌾",hazel:"🌰",helium:"🎈",hiker:"🥾",holly:"🍒",
 hummus:"🥙",husky:"🐕",iceberg:"🧊",iris:"👀",jaguar:"🐆",jamboree:"🎉",jasmine:"🍵",javelin:"🎯",jigsaw:"🧩",jingle:"🎐",
 journey:"🛤️",kazoo:"🎺",kingdom:"🏰",koi:"🎏",lasso:"🪢",lavender:"💜",lilac:"💜",lodge:"🏨",lynx:"🐈",mallet:"🔨",
 marina:"⛵",mascot:"🐻",meerkat:"🦡",minnow:"🐟",monsoon:"🌧️",mosaic:"🔳",mural:"🖼️",nacho:"🧀",nebula:"🌌",nickel:"🪙",
 oasis:"🌴",oboe:"🎷",opal:"🌈",opera:"🎭",outfit:"👗",owlet:"🦉",paprika:"🌶️",parsley:"🌿",pecan:"🌰",pendant:"💍",
 penny:"🪙",pesto:"🍝",piccolo:"🎷",pinwheel:"🌀",pixel:"👾",plaza:"🏙️",plume:"🪶",pogo:"🦘",polka:"⚫",poncho:"🌂",
 porch:"🚪",potion:"🧪",prairie:"🌾",prism:"🌈",quail:"🐦",quartz:"💎",quill:"✒️",radar:"📡",ramen:"🍜",ranch:"🐂",
 rapids:"🌊",ravioli:"🥟",recess:"🧒",reindeer:"🦌",relay:"🏃",rhubarb:"🥬",ripple:"💧",roller:"🎢",rosemary:"🌿",rover:"🚙",
 rudder:"⚓",saddle:"🐎",salsa:"💃",samba:"🥁",sapphire:"🔹",satchel:"💼",savanna:"🦓",scallop:"🐚",scone:"🥐",sequin:"✨",
 shamrock:"☘️",sherbet:"🍧",sonar:"🔊",spatula:"🍳",spruce:"🌲",staple:"📎",stencil:"🖍️",stilts:"🎪",swallow:"🐦",tabby:"🐈",
 tadpole:"🐸",tempo:"🎚️",thistle:"🌵",thimble:"🧵",tinsel:"🎊",toffee:"🍬",topaz:"💛",torch:"🔦",trinket:"💍",trolley:"🛒",
 truffle:"🍫",tuba:"🎺",tugboat:"🚢",tundra:"🏔️",turnip:"🍠",twinkle:"🌟",ukulele:"🪕",umbrella:"☂️",vanilla:"🍦",velvet:"🎀",
 veranda:"🏡",viking:"🛡️",villa:"🏘️",voyage:"🛳️",waddle:"🐧",wander:"🚶",wasabi:"🍣",weasel:"🦦",wombat:"🐨",woodland:"🌳",
 yodel:"🏔️",yonder:"🔭",zeppelin:"🎈",zipline:"🚡",zucchini:"🥒",abacus:"🧮",airship:"🎈",alpine:"⛷️",antler:"🦌",anvil:"⚒️",
 aqua:"🚰",archer:"🏹",aspen:"🌳",athlete:"🏅",aurora:"🌌",azure:"🔵",barley:"🌾",beagle:"🐶",bento:"🍱",bistro:"🍽️",
 bobcat:"🐈",bonsai:"🪴",boogie:"🕺",bramble:"🫐",bulldog:"🐕",bungalow:"🏡",cable:"🔌",caboose:"🚃",calico:"🐈",canvas:"🖼️",
 capsule:"🚀",cardinal:"🐦",caribou:"🦌",cashew:"🥜",charm:"💝",cheddar:"🧀",cinder:"🔥",cobalt:"🔵",cougar:"🐆",crater:"🌑",
 cruise:"🛳️",custard:"🍮",dapple:"🐎",dazzle:"✨",denim:"👖",dewdrop:"💧",diesel:"⛽",dough:"🍞",driftwood:"🪵",easel:"🎨",
 eggplant:"🟣",elm:"🌳",emblem:"🏵️",evergreen:"🌲",fiesta:"🪅",flapjack:"🥞",flora:"💐",fondue:"🫕",frigate:"🚢",garnet:"♦️",
 gelato:"🍨",gemstone:"💎",glade:"🌳",griffin:"🦅",guppy:"🐠",harmony:"🎼",hopscotch:"👣",horizon:"🌇",iguana:"🦎",inlet:"🏞️",
 ivory:"🤍",jetty:"🎣",jubilee:"🎉",kelp:"🌿",kernel:"🌽",kimono:"👘",knapsack:"🎒",lark:"🐦",lasagna:"🍝",lentil:"🍲",
 lumber:"🪵",lunchbox:"🍱",macaw:"🦜",magpie:"🐦",mandarin:"🍊",maraca:"🥁",mesa:"🏜️",midnight:"🕛",monarch:"🦋",morning:"⏰",
 mulberry:"🍇",needle:"🪡",oatmeal:"🥣",octave:"🎹",onyx:"🖤",origami:"📄",patio:"⛱️",perch:"🐟",petunia:"🌸",pheasant:"🦃",
 pioneer:"🧭",platypus:"🦫"
};
