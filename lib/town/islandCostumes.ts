/** Original island wardrobe identities. Keys preserve existing equipment saves;
 * real club/mascot names belong only to the separately sourced history lessons. */
export type IslandCostume={name:string;animalLabel:string;color:number;accent:number;kitColor:number;story:string};
const entries:[string,string,string,number,number,string][]=[
 ['barcelona','Cove','Wildcat',0xe9bc43,0x98264d,'finds a clear passing angle whenever a teammate is under pressure'],
 ['arsenal','Pebble','Dinosaur',0x68964f,0xf0d57d,'welcomes new teammates and makes sure everyone gets a turn'],
 ['liverpool','Skipper','Seabird',0xc94843,0xf0ba5c,'helps teammates communicate with a word, a gesture or a wave'],
 ['chelsea','Dune','Lion',0xedbd69,0x298e9e,'listens before leading and helps the team recover its shape'],
 ['leicester','Tumble','Fox',0xd58a45,0xf2e3c3,'checks both shoulders before receiving a pass'],
 ['bayern','Moss','Bear',0xb77b50,0xf0c877,'invites a new friend into every small-sided game'],
 ['dortmund','Pollen','Bee',0xe9ca40,0x343531,'keeps moving after a pass so a teammate always has support'],
 ['koln','Crag','Goat',0xf0dfbd,0x9770cc,'stays balanced when changing direction with the ball'],
 ['juventus','Zig','Zebra',0xe9e8df,0x313733,'spots the space between defenders before choosing a pass'],
 ['roma','Echo','Wolf',0xb78768,0xf3cd91,'calls early so teammates know where help is waiting'],
 ['benfica','Glint','Eagle',0x685480,0xf0ba45,'scans the whole pitch before deciding where to play'],
 ['psg','Fern','Lynx',0xe3b765,0xb8684d,'takes a first touch away from pressure'],
 ['flamengo','Drift','Vulture',0x354f75,0xf0b54e,'stays patient and watches for the right moment to intercept'],
 ['palmeiras','Truffle','Pig',0xeeaeaa,0xc96987,'protects the ball while waiting for a teammate to arrive'],
 ['atletico-mineiro','Dawn','Rooster',0x41433e,0xc6453c,'starts practice by checking that every teammate feels included'],
 ['santos','Ripple','Orca',0x363d40,0xf0e8d5,'changes direction to make an open passing lane'],
 ['botafogo','Scout','Dog',0xe8cb96,0x785b9f,'tracks back to help a teammate defend'],
 ['river-plate','Canopy','Lion',0xd6a550,0x9c5d38,'keeps a calm head and chooses the simple pass'],
 ['pumas','Flint','Puma',0xdba962,0xf4d49a,'curves a run to arrive in space at the right time'],
 ['kashima','Bramble','Deer',0xae7950,0xe6c394,'stays behind the attack to offer a safe return pass'],
 ['cerezo','Willow','Wolf',0x969acb,0xf1dcba,'moves with the team when possession changes'],
 ['nagoya','Swell','Orca',0x294f78,0xf1d49b,'draws a defender one way before a teammate runs the other'],
 ['matchday-fox','Matchday Fox','Fox',0xf2bb45,0xfff0c4,'checks both shoulders, looks for a teammate and chooses a clear passing lane. The gold outfit celebrates exploring the island’s hidden matchday soccer balls; it does not certify football mastery'],
 ['sutton','Lookout','Giraffe',0xd9b467,0x94633b,'looks up before receiving to find an unmarked teammate']
];
// Individual island training colors brighten the quieter animal palettes.
const trainingColors:Record<string,number>={'matchday-fox':0x237b70,chelsea:0xde785e,bayern:0x408fc9,koln:0xe48765,roma:0x3ba7bc,benfica:0x43b19b,psg:0x7463c7,flamengo:0xe17e65,palmeiras:0x42a993,botafogo:0x44a8bc,pumas:0x7867c9,cerezo:0xdd846b,nagoya:0xe38466};
export const ISLAND_COSTUMES:Record<string,IslandCostume>=Object.fromEntries(entries.map(([id,name,animalLabel,color,accent,action])=>[id,{name,animalLabel,color,accent,kitColor:trainingColors[id]??0x258b7a,story:`In our fictional island team, ${name} ${action}. Try that habit in your next football game.`}]));
export function getIslandCostume(id:string){const item=ISLAND_COSTUMES[id];if(!item)throw new Error(`Unknown island costume: ${id}`);return item;}
