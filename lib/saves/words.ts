/**
 * Save-code words (docs/accounts-design.md §5.1; easy list Oct 10 2026). A save code is three of these words plus a number
 * 1000–9999: 781 words × 780 × 779 × 9,000 numbers ≈ 42.0 bits (4.3 × 10¹²).
 *
 * Rules (tests/game-saves.cjs checks them):
 *  - EASY words for kids aged 6–12: short (3–7 lowercase letters a–z), common, concrete, easy to read, spell and picture.
 *    Football words first, then colours, food, animals, nature, toys and sport, vehicles, music and school, home things,
 *    people and fun words. No rare or regional words and no hard spellings;
 *  - unique in their first 4 letters, so autocomplete is certain after 4 letters (a 3-letter word is its own prefix);
 *  - no homophones of common words (sea/see, pear/pair, sun/son, bee/be, rain/rein…) and no near-twins that are easy to
 *    misread (couch/coach, jingle/jungle, doodle/noodle…); nothing rude, scary, violent, religious or sad, and no rude
 *    adjacent pair (PAIR_BLOCK in code.ts is checked when a code is made);
 *  - the list was REPLACED on Oct 10 2026 (the old 1,024 harder words, the user's call while there were very few saves). The
 *    old words live on in legacyWords.ts ONLY so old codes still restore: they are matched when typed but never used to
 *    make a code, and a new word always wins a tie. From now on this list is APPEND ONLY: a code is hashed as its words
 *    (code.ts normaliseCode), so a word that was ever handed out must stay, spelled the same.
 * PICTURES: a small picture (emoji, drawn by the device's own font: nothing to download) as a memory aid for slow readers. The
 * picture is never part of the secret: codes are typed, parsed and hashed as words only.
 *  - every word in WORDS has exactly one picture; a word appended later must get one too;
 *  - an obvious picture (frog 🐸, cake 🎂, kite 🪁), unique where a clear one exists; close relatives may share one (birds,
 *    trophies…), since the word under it tells them apart. Fun words get the most evocative one (brave 🦁, think 💭);
 *  - one emoji only, from Unicode/Emoji 13.0 or earlier (older iPhones and Androids draw it); no country flags, skin tones,
 *    gender variants or ZWJ sequences; nothing rude, scary or religious. A text-style symbol carries U+FE0F so it draws as emoji;
 *  - the number part always shows NUMBER_PICTURE.
 */
export const WORDS=`
 goal kick ball striker volley corner pass score team coach cup trophy medal keeper save header
 dribble whistle referee captain jersey shirt boots socks shorts penalty throw bench flag stadium pitch fans
 tackle final win champ sprint jog dive spin bounce juggle flick trick skill squad club badge
 scarf drum chant banner bib ladder hurdle futsal lob curve assist rebound wall kit net offside
 replay timeout card gold silver bronze extra shield target catch field sneaker yellow green orange purple
 pink white black brown rainbow apple banana grape lemon mango melon kiwi cherry coconut carrot potato
 tomato onion pepper cabbage pickle avocado peanut honey butter cheese bread bagel muffin cookie cake cupcake
 donut waffle pancake pretzel popcorn candy jelly pudding milk juice soup noodle pasta pizza taco sushi
 rice burger salad egg bacon sausage fries toast jam water lunch dinner picnic snack olive garlic
 fudge cone shake drink spoon fork bowl mug pan kettle teapot salt ham stew cream sugar
 cracker bun nugget curry raisin ketchup feast bake sour spicy yummy burrito tasty clam cat dog
 puppy kitten fox lion tiger panda koala monkey gorilla zebra giraffe hippo rhino llama alpaca horse
 pony donkey cow pig sheep lamb goat rabbit bunny hamster mouse beaver otter bison sloth owl
 eagle parrot penguin swan duck goose chicken hen rooster turkey pigeon robin bird frog turtle lizard
 gecko snake croc dragon dino whale dolphin shark seal walrus octopus crab lobster shrimp squid snail
 fish beetle ladybug bug worm fly unicorn mammoth orca bat yak buffalo bull calf piglet peacock
 dodo ostrich leopard panther skunk poodle pet paw feather cub canary seagull hawk toucan tree leaf
 tulip daisy lily cactus palm clover maple acorn forest pine jungle island beach ocean wave river
 lake pond hill volcano stone pebble sand cloud snow ice igloo moon star comet planet sky
 sunset sunrise storm breeze fog log drop splash fire camp tent earth world globe garden bloom
 bamboo seed grass fern wheat shell farm barn nest bone sunny summer winter day light space
 galaxy orbit ufo alien glow wish swirl zigzag wool yarn park pumpkin cold hot frosty kite
 yoyo puzzle robot teddy doll dice game toy skate scooter bike tennis golf hockey rugby cricket
 hoop darts chess judo karate ski sled surf swim climb jump run race sport yoga gym
 paddle arcade coaster circus flip goggles stretch award bingo pool magic wand marble train car bus
 taxi truck tractor van jet rocket boat ship canoe kayak tram cart crane station anchor airport
 stop turbo motor wagon piano guitar trumpet violin banjo bell horn music song dance sing party
 gift ribbon crayon pencil pen paint brush paper book ruler magnet note art picture quiz learn
 school ticket movie video photo camera comic letter chat idea clock watch phone radio laptop lamp
 key lock door window house home castle tower bridge shop bed sofa chair box bag basket
 bucket map compass coin gem crown ring hat cap coat shoe glasses rope hammer tools brick
 wrench soap bath shower mirror dress purse pin clip battery plug sponge broom gear lantern money
 bank hotel city town hut museum library zoo slipper mitten jacket hoodie plate bottle recycle diamond
 crystal jewel pocket king queen hero wizard ninja mermaid elf genie baby buddy cowboy family smile
 laugh giggle grin hug wink happy lucky brave dream think wonder cool silly funny sleepy nap
 shiny sparkle fluffy tiny super epic wow yay love heart kind calm proud clever smart bright
 jolly quiet secret busy speedy fast strong top yes good joke yawn quack hide look walk
 ride float zoom explore hike help clap play build draw fix step hand foot leg ear
 mouth tooth thumb brain dot plus soccer lime celery chips soda straw loaf fruit hotdog gumball
 mint eat food chef bark buzz chirp piggy doggy hatch animal meteor saturn jupiter solar drizzle
 autumn lava bush wheel palace fort pilot doctor prince scout sailor snorkel acrobat actor drama artist
 blanket bedtime tablet marker pack jetpack zip prize clue class film alarm air arm arena block
 glitter maze loop jazz best first big hello hope guess grow relax wash drive shout loud
 slow quick cute comfy cuddle joy face finger fun awesome amazing clean blink boost dash ace
 beard blaze bonfire cabin canyon cape click crawl crunch curly disco easy echo elbow energy engine
 fancy fetch fizzy flame flash fossil frame frozen gallop glide gobble group holiday honk hooray hungry
 icing insect invent jumbo kitchen lazy leap lullaby memory munch nature nibble oink okay parade petal
 pillow power quest riddle rodeo roof royal safari sketch slice slurp snooze sound spiral squeak stage
 sweep tag tall thrill treat trunk tune twist veggie vroom wiggle woof zap
`.trim().split(/\s+/);
/** The number tile's picture (the same for every code, so it carries nothing secret). */
export const NUMBER_PICTURE='🔢';
export const PICTURES:Readonly<Record<string,string>>={
 goal:"🥅",kick:"🦶",ball:"⚽",striker:"⚽",volley:"🏐",corner:"🚩",pass:"🤝",score:"💯",team:"👥",coach:"📋",
 cup:"🥤",trophy:"🏆",medal:"🏅",keeper:"🧤",save:"🧤",header:"🙆",dribble:"⚽",whistle:"📢",referee:"🟨",captain:"©️",
 jersey:"👕",shirt:"👚",boots:"👢",socks:"🧦",shorts:"🩳",penalty:"🎯",throw:"🤾",bench:"🪑",flag:"🎌",stadium:"🏟️",
 pitch:"🏟️",fans:"🙌",tackle:"💥",final:"🏁",win:"✌️",champ:"🥇",sprint:"🏃",jog:"🏃",dive:"🤿",spin:"🔄",
 bounce:"⛹️",juggle:"🤹",flick:"👆",trick:"🎩",skill:"🌟",squad:"🫂",club:"♣️",badge:"📛",scarf:"🧣",drum:"🥁",
 chant:"🗣️",banner:"🪧",bib:"🎽",ladder:"🪜",hurdle:"🚧",futsal:"⚽",lob:"⤴️",curve:"↪️",assist:"👉",rebound:"↩️",
 wall:"🧱",kit:"👕",net:"🥅",offside:"🚩",replay:"🔁",timeout:"⏲️",card:"🃏",gold:"🥇",silver:"🥈",bronze:"🥉",
 extra:"➕",shield:"🛡️",target:"🎯",catch:"🧤",field:"🌾",sneaker:"👟",yellow:"🟨",green:"🟩",orange:"🟧",purple:"🟪",
 pink:"💖",white:"⬜",black:"⬛",brown:"🟫",rainbow:"🌈",apple:"🍎",banana:"🍌",grape:"🍇",lemon:"🍋",mango:"🥭",
 melon:"🍈",kiwi:"🥝",cherry:"🍒",coconut:"🥥",carrot:"🥕",potato:"🥔",tomato:"🍅",onion:"🧅",pepper:"🫑",cabbage:"🥬",
 pickle:"🥒",avocado:"🥑",peanut:"🥜",honey:"🍯",butter:"🧈",cheese:"🧀",bread:"🍞",bagel:"🥯",muffin:"🧁",cookie:"🍪",
 cake:"🎂",cupcake:"🧁",donut:"🍩",waffle:"🧇",pancake:"🥞",pretzel:"🥨",popcorn:"🍿",candy:"🍬",jelly:"🍮",pudding:"🍮",
 milk:"🥛",juice:"🧃",soup:"🍲",noodle:"🍜",pasta:"🍝",pizza:"🍕",taco:"🌮",sushi:"🍣",rice:"🍚",burger:"🍔",
 salad:"🥗",egg:"🥚",bacon:"🥓",sausage:"🌭",fries:"🍟",toast:"🍞",jam:"🍓",water:"💧",lunch:"🍱",dinner:"🍽️",
 picnic:"🧺",snack:"🥨",olive:"🫒",garlic:"🧄",fudge:"🍫",cone:"🍦",shake:"🥤",drink:"🥤",spoon:"🥄",fork:"🍴",
 bowl:"🥣",mug:"☕",pan:"🍳",kettle:"🫖",teapot:"🫖",salt:"🧂",ham:"🍖",stew:"🍲",cream:"🍦",sugar:"🍬",
 cracker:"🍘",bun:"🍔",nugget:"🍗",curry:"🍛",raisin:"🍇",ketchup:"🍅",feast:"🍽️",bake:"🥧",sour:"🍋",spicy:"🌶️",
 yummy:"😋",burrito:"🌯",tasty:"😋",clam:"🦪",cat:"🐱",dog:"🐶",puppy:"🐕",kitten:"🐈",fox:"🦊",lion:"🦁",
 tiger:"🐯",panda:"🐼",koala:"🐨",monkey:"🐒",gorilla:"🦍",zebra:"🦓",giraffe:"🦒",hippo:"🦛",rhino:"🦏",llama:"🦙",
 alpaca:"🦙",horse:"🐴",pony:"🐎",donkey:"🐴",cow:"🐮",pig:"🐷",sheep:"🐑",lamb:"🐏",goat:"🐐",rabbit:"🐰",
 bunny:"🐇",hamster:"🐹",mouse:"🐭",beaver:"🦫",otter:"🦦",bison:"🦬",sloth:"🦥",owl:"🦉",eagle:"🦅",parrot:"🦜",
 penguin:"🐧",swan:"🦢",duck:"🦆",goose:"🦆",chicken:"🐔",hen:"🐔",rooster:"🐓",turkey:"🦃",pigeon:"🕊️",robin:"🐦",
 bird:"🐦",frog:"🐸",turtle:"🐢",lizard:"🦎",gecko:"🦎",snake:"🐍",croc:"🐊",dragon:"🐉",dino:"🦕",whale:"🐳",
 dolphin:"🐬",shark:"🦈",seal:"🦭",walrus:"🦭",octopus:"🐙",crab:"🦀",lobster:"🦞",shrimp:"🦐",squid:"🦑",snail:"🐌",
 fish:"🐟",beetle:"🪲",ladybug:"🐞",bug:"🐛",worm:"🪱",fly:"🪰",unicorn:"🦄",mammoth:"🦣",orca:"🐋",bat:"🦇",
 yak:"🐃",buffalo:"🐃",bull:"🐂",calf:"🐄",piglet:"🐖",peacock:"🦚",dodo:"🦤",ostrich:"🦤",leopard:"🐆",panther:"🐆",
 skunk:"🦨",poodle:"🐩",pet:"🐾",paw:"🐾",feather:"🪶",cub:"🐻",canary:"🐤",seagull:"🐦",hawk:"🦅",toucan:"🦜",
 tree:"🌳",leaf:"🍃",tulip:"🌷",daisy:"🌼",lily:"🌺",cactus:"🌵",palm:"🌴",clover:"🍀",maple:"🍁",acorn:"🌰",
 forest:"🌲",pine:"🌲",jungle:"🌴",island:"🏝️",beach:"🏖️",ocean:"🌊",wave:"👋",river:"🏞️",lake:"🏞️",pond:"🐸",
 hill:"⛰️",volcano:"🌋",stone:"🪨",pebble:"🪨",sand:"⌛",cloud:"☁️",snow:"❄️",ice:"🧊",igloo:"🧊",moon:"🌙",
 star:"⭐",comet:"☄️",planet:"🪐",sky:"🌤️",sunset:"🌅",sunrise:"🌄",storm:"⛈️",breeze:"🌬️",fog:"🌫️",log:"🪵",
 drop:"💧",splash:"💦",fire:"🔥",camp:"🏕️",tent:"⛺",earth:"🌍",world:"🌎",globe:"🌐",garden:"🌻",bloom:"🌸",
 bamboo:"🎋",seed:"🌱",grass:"🌿",fern:"🌿",wheat:"🌾",shell:"🐚",farm:"🚜",barn:"🐄",nest:"🐣",bone:"🦴",
 sunny:"☀️",summer:"😎",winter:"☃️",day:"🌞",light:"💡",space:"🌌",galaxy:"🌌",orbit:"🛰️",ufo:"🛸",alien:"👽",
 glow:"🌟",wish:"🌠",swirl:"🌀",zigzag:"〰️",wool:"🧶",yarn:"🧶",park:"🏞️",pumpkin:"🎃",cold:"🥶",hot:"🌶️",
 frosty:"⛄",kite:"🪁",yoyo:"🪀",puzzle:"🧩",robot:"🤖",teddy:"🧸",doll:"🪆",dice:"🎲",game:"🎮",toy:"🪀",
 skate:"🛼",scooter:"🛴",bike:"🚲",tennis:"🎾",golf:"⛳",hockey:"🏒",rugby:"🏉",cricket:"🏏",hoop:"🏀",darts:"🎯",
 chess:"♟️",judo:"🥋",karate:"🥋",ski:"🎿",sled:"🛷",surf:"🏄",swim:"🏊",climb:"🧗",jump:"🦘",run:"🏃",
 race:"🏁",sport:"🏅",yoga:"🧘",gym:"🏋️",paddle:"🏓",arcade:"🕹️",coaster:"🎢",circus:"🎪",flip:"🤸",goggles:"🥽",
 stretch:"🧘",award:"🏆",bingo:"🎱",pool:"🎱",magic:"🪄",wand:"🪄",marble:"🔮",train:"🚂",car:"🚗",bus:"🚌",
 taxi:"🚕",truck:"🚚",tractor:"🚜",van:"🚐",jet:"✈️",rocket:"🚀",boat:"⛵",ship:"🚢",canoe:"🛶",kayak:"🛶",
 tram:"🚋",cart:"🛒",crane:"🏗️",station:"🚉",anchor:"⚓",airport:"🛫",stop:"🛑",turbo:"🏎️",motor:"🏍️",wagon:"🚃",
 piano:"🎹",guitar:"🎸",trumpet:"🎺",violin:"🎻",banjo:"🪕",bell:"🔔",horn:"📯",music:"🎵",song:"🎶",dance:"💃",
 sing:"🎤",party:"🎉",gift:"🎁",ribbon:"🎀",crayon:"🖍️",pencil:"✏️",pen:"🖊️",paint:"🎨",brush:"🖌️",paper:"📄",
 book:"📕",ruler:"📏",magnet:"🧲",note:"📝",art:"🎨",picture:"🖼️",quiz:"❓",learn:"🎓",school:"🏫",ticket:"🎟️",
 movie:"🎬",video:"📹",photo:"📸",camera:"📷",comic:"💬",letter:"✉️",chat:"💬",idea:"💡",clock:"⏰",watch:"⌚",
 phone:"📱",radio:"📻",laptop:"💻",lamp:"💡",key:"🔑",lock:"🔒",door:"🚪",window:"🪟",house:"🏠",home:"🏡",
 castle:"🏰",tower:"🗼",bridge:"🌉",shop:"🏪",bed:"🛏️",sofa:"🛋️",chair:"🪑",box:"📦",bag:"👜",basket:"🧺",
 bucket:"🪣",map:"🗺️",compass:"🧭",coin:"🪙",gem:"💎",crown:"👑",ring:"💍",hat:"👒",cap:"🧢",coat:"🧥",
 shoe:"👞",glasses:"👓",rope:"🪢",hammer:"🔨",tools:"🧰",brick:"🧱",wrench:"🔧",soap:"🧼",bath:"🛁",shower:"🚿",
 mirror:"🪞",dress:"👗",purse:"👛",pin:"📌",clip:"📎",battery:"🔋",plug:"🔌",sponge:"🧽",broom:"🧹",gear:"⚙️",
 lantern:"🏮",money:"💰",bank:"🏦",hotel:"🏨",city:"🏙️",town:"🏘️",hut:"🛖",museum:"🏛️",library:"📚",zoo:"🐘",
 slipper:"🥿",mitten:"🧤",jacket:"🧥",hoodie:"🧥",plate:"🍽️",bottle:"🍼",recycle:"♻️",diamond:"💎",crystal:"💎",jewel:"💍",
 pocket:"👝",king:"🤴",queen:"👸",hero:"🦸",wizard:"🧙",ninja:"🥷",mermaid:"🧜",elf:"🧝",genie:"🧞",baby:"👶",
 buddy:"🤝",cowboy:"🤠",family:"👪",smile:"😊",laugh:"😂",giggle:"😄",grin:"😁",hug:"🤗",wink:"😉",happy:"😀",
 lucky:"🍀",brave:"🦁",dream:"💫",think:"💭",wonder:"🤔",cool:"😎",silly:"🤪",funny:"😆",sleepy:"😴",nap:"💤",
 shiny:"✨",sparkle:"✨",fluffy:"☁️",tiny:"🤏",super:"🦸",epic:"🤩",wow:"😮",yay:"🥳",love:"❤️",heart:"❤️",
 kind:"💗",calm:"😌",proud:"🦚",clever:"🧠",smart:"🤓",bright:"🔆",jolly:"😃",quiet:"🤫",secret:"🤫",busy:"🐝",
 speedy:"⚡",fast:"⚡",strong:"💪",top:"🔝",yes:"✅",good:"👍",joke:"😂",yawn:"🥱",quack:"🦆",hide:"🙈",
 look:"👀",walk:"🚶",ride:"🏇",float:"🎈",zoom:"💨",explore:"🧭",hike:"🥾",help:"🙋",clap:"👏",play:"▶️",
 build:"🔨",draw:"✏️",fix:"🔧",step:"👣",hand:"✋",foot:"🦶",leg:"🦵",ear:"👂",mouth:"👄",tooth:"🦷",
 thumb:"👍",brain:"🧠",dot:"🔵",plus:"➕",soccer:"⚽",lime:"🍋",celery:"🥬",chips:"🍟",soda:"🥤",straw:"🥤",
 loaf:"🥖",fruit:"🍉",hotdog:"🌭",gumball:"🍬",mint:"🌿",eat:"🍽️",food:"🍽️",chef:"🍳",bark:"🐕",buzz:"🐝",
 chirp:"🐦",piggy:"🐷",doggy:"🐶",hatch:"🐣",animal:"🐾",meteor:"☄️",saturn:"🪐",jupiter:"🪐",solar:"☀️",drizzle:"🌦️",
 autumn:"🍂",lava:"🌋",bush:"🌳",wheel:"🎡",palace:"🏰",fort:"🏰",pilot:"✈️",doctor:"🩺",prince:"🤴",scout:"🧭",
 sailor:"⚓",snorkel:"🤿",acrobat:"🤸",actor:"🎭",drama:"🎭",artist:"🎨",blanket:"🛌",bedtime:"🛌",tablet:"📱",marker:"🖊️",
 pack:"🎒",jetpack:"🚀",zip:"🤐",prize:"🏆",clue:"🔍",class:"🏫",film:"🎬",alarm:"⏰",air:"💨",arm:"💪",
 arena:"🏟️",block:"🧱",glitter:"✨",maze:"🌀",loop:"➰",jazz:"🎷",best:"🥇",first:"🥇",big:"🐘",hello:"👋",
 hope:"🤞",guess:"❓",grow:"🌱",relax:"😌",wash:"🧼",drive:"🚗",shout:"📢",loud:"📢",slow:"🐢",quick:"⚡",
 cute:"🥰",comfy:"🛋️",cuddle:"🤗",joy:"😊",face:"🙂",finger:"☝️",fun:"🎈",awesome:"🤩",amazing:"🤩",clean:"🧼",
 blink:"😉",boost:"🚀",dash:"💨",ace:"🅰️",beard:"🧔",blaze:"🔥",bonfire:"🔥",cabin:"🛖",canyon:"🏜️",cape:"🦸",
 click:"🖱️",crawl:"🐛",crunch:"🍪",curly:"➰",disco:"🕺",easy:"✅",echo:"🔊",elbow:"💪",energy:"⚡",engine:"🚂",
 fancy:"🎩",fetch:"🐕",fizzy:"🥤",flame:"🔥",flash:"📸",fossil:"🦴",frame:"🖼️",frozen:"🥶",gallop:"🐎",glide:"🛩️",
 gobble:"🦃",group:"👥",holiday:"🏖️",honk:"📯",hooray:"🥳",hungry:"😋",icing:"🧁",insect:"🐞",invent:"💡",jumbo:"🐘",
 kitchen:"🍳",lazy:"🦥",leap:"🐸",lullaby:"🌙",memory:"🧠",munch:"😋",nature:"🌿",nibble:"🐭",oink:"🐷",okay:"👌",
 parade:"🎉",petal:"🌸",pillow:"🛏️",power:"⚡",quest:"🗺️",riddle:"❓",rodeo:"🤠",roof:"🏠",royal:"👑",safari:"🦓",
 sketch:"✏️",slice:"🍰",slurp:"😋",snooze:"😴",sound:"🔊",spiral:"🌀",squeak:"🐭",stage:"🎭",sweep:"🧹",tag:"🏷️",
 tall:"🦒",thrill:"🎢",treat:"🍬",trunk:"🐘",tune:"🎵",twist:"🌀",veggie:"🥦",vroom:"🏎️",wiggle:"🐛",woof:"🐶",
 zap:"⚡"
};
