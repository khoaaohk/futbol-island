/**
 * Soccer team name generator (Nov 22 2026; /tools/soccer-team-name-generator and its Spanish twin). Pure and import-free
 * (tests/more-tools.cjs). Names are built ONLY from the curated word lists below (no free text is generated; the place is the
 * user's own word and is cleaned to letters, spaces and hyphens), so every name is safe for a team of seven-year-olds. The
 * same seed always gives the same names (mulberry32), so a shared link shows the same list.
 *
 * WHERE CLUB NAMES COME FROM (each note below names its club; all read on the clubs' Wikipedia articles, Nov 22 2026, which cite
 * the clubs' own histories):
 *  - Wanderers: Wanderers F.C. (founded 1859 as Forest F.C., renamed 1864) had no home ground; it won the first FA Cup in 1872.
 *  - United: Newcastle United, chosen on 9 December 1892 "to signify the unification" of East End and West End.
 *  - Albion: West Bromwich Albion (1878, first West Bromwich Strollers) took the name of Albion, a district where players lived or worked.
 *  - Athletic: Athletic Club of Bilbao (1898) used the English spelling; football reached Bilbao with British workers and students.
 *  - Real: Real Madrid since 1920, when King Alfonso XIII gave the club the title Real (royal).
 *  - Inter: Internazionale (1908): the founders wanted to accept foreign players as well as Italians.
 *  - Hotspur: Tottenham Hotspur (1882, first Hotspur F.C.), after Harry Hotspur of the Northumberland family.
 *  - Fire: Chicago Fire (founded 8 October 1997, the 126th anniversary of the Great Chicago Fire of 1871), named after that fire.
 *  - Rovers: Blackburn Rovers was founded on 5 November 1875; a rover is someone who travels (the article gives no other origin).
 *  - Wednesday (a note only, never a suffix): Sheffield Wednesday (1867) grew from a cricket club whose members had Wednesday
 *    afternoons off work. Arsenal (a note only): founded 1886 as Dial Square by workers at the Royal Arsenal in Woolwich.
 */
export type Lang='en'|'es';
export type AgeBand='u6-u8'|'u9-u12'|'u13-up';
export type Style='mix'|'animal'|'classic'|'nature';
export type Word={id:string;en:string;es:string;f?:true};
/** es: masculine and feminine singular, then masculine and feminine plural. */
export type Colour={id:string;en:string;es:readonly [string,string,string,string]};
export type NameIdea={name:string;note:string;key:string};

export const AGE_BANDS:readonly AgeBand[]=['u6-u8','u9-u12','u13-up'];
export const STYLES:readonly Style[]=['mix','animal','classic','nature'];
/** Animals: friendly or brave, never scary to a small child (no snakes or spiders), no names of real people or brands. f = feminine in Spanish. */
export const ANIMALS:readonly Word[]=[
 {id:'lions',en:'Lions',es:'Leones'},{id:'tigers',en:'Tigers',es:'Tigres'},{id:'sharks',en:'Sharks',es:'Tiburones'},{id:'eagles',en:'Eagles',es:'Águilas',f:true},
 {id:'wolves',en:'Wolves',es:'Lobos'},{id:'bears',en:'Bears',es:'Osos'},{id:'falcons',en:'Falcons',es:'Halcones'},{id:'hawks',en:'Hawks',es:'Gavilanes'},
 {id:'panthers',en:'Panthers',es:'Panteras',f:true},{id:'dolphins',en:'Dolphins',es:'Delfines'},{id:'foxes',en:'Foxes',es:'Zorros'},{id:'owls',en:'Owls',es:'Lechuzas',f:true},
 {id:'otters',en:'Otters',es:'Nutrias',f:true},{id:'penguins',en:'Penguins',es:'Pingüinos'},{id:'rhinos',en:'Rhinos',es:'Rinocerontes'},{id:'cheetahs',en:'Cheetahs',es:'Guepardos'},
 {id:'jaguars',en:'Jaguars',es:'Jaguares'},{id:'pumas',en:'Pumas',es:'Pumas'},{id:'orcas',en:'Orcas',es:'Orcas',f:true},{id:'turtles',en:'Turtles',es:'Tortugas',f:true},
 {id:'bees',en:'Bees',es:'Abejas',f:true},{id:'hornets',en:'Hornets',es:'Avispas',f:true},{id:'badgers',en:'Badgers',es:'Tejones'},{id:'stallions',en:'Stallions',es:'Potros'},
 {id:'dragons',en:'Dragons',es:'Dragones'},{id:'gorillas',en:'Gorillas',es:'Gorilas'},{id:'koalas',en:'Koalas',es:'Koalas'},{id:'geckos',en:'Geckos',es:'Gecos'},
 {id:'mustangs',en:'Mustangs',es:'Mustangs'},{id:'lynx',en:'Lynx',es:'Linces'},{id:'pandas',en:'Pandas',es:'Pandas'},{id:'puffins',en:'Puffins',es:'Frailecillos'},
];
export const COLOURS:readonly Colour[]=[
 {id:'red',en:'Red',es:['Rojo','Roja','Rojos','Rojas']},{id:'blue',en:'Blue',es:['Azul','Azul','Azules','Azules']},{id:'green',en:'Green',es:['Verde','Verde','Verdes','Verdes']},
 {id:'yellow',en:'Yellow',es:['Amarillo','Amarilla','Amarillos','Amarillas']},{id:'orange',en:'Orange',es:['Naranja','Naranja','Naranjas','Naranjas']},{id:'purple',en:'Purple',es:['Morado','Morada','Morados','Moradas']},
 {id:'black',en:'Black',es:['Negro','Negra','Negros','Negras']},{id:'white',en:'White',es:['Blanco','Blanca','Blancos','Blancas']},{id:'gold',en:'Golden',es:['Dorado','Dorada','Dorados','Doradas']},
 {id:'silver',en:'Silver',es:['Plateado','Plateada','Plateados','Plateadas']},{id:'sky',en:'Sky Blue',es:['Celeste','Celeste','Celestes','Celestes']},{id:'pink',en:'Pink',es:['Rosa','Rosa','Rosas','Rosas']},
];
/** Weather, sky and sea words for the nature style. */
export const NATURE:readonly Word[]=[
 {id:'thunder',en:'Thunder',es:'Trueno'},{id:'lightning',en:'Lightning',es:'Relámpago'},{id:'storm',en:'Storm',es:'Tormenta',f:true},{id:'rockets',en:'Rockets',es:'Cohetes'},
 {id:'comets',en:'Comets',es:'Cometas'},{id:'stars',en:'Stars',es:'Estrellas',f:true},{id:'waves',en:'Waves',es:'Olas',f:true},{id:'tide',en:'Tide',es:'Marea',f:true},
 {id:'fire',en:'Fire',es:'Fuego'},{id:'blaze',en:'Blaze',es:'Llama',f:true},{id:'wind',en:'Wind',es:'Viento'},{id:'sun',en:'Sun',es:'Sol'},
 {id:'galaxy',en:'Galaxy',es:'Galaxia',f:true},{id:'meteors',en:'Meteors',es:'Meteoros'},{id:'avalanche',en:'Avalanche',es:'Avalancha',f:true},{id:'cyclones',en:'Cyclones',es:'Ciclones'},
];
/** Classic club words. `after` puts the word after the place (Riverside United), otherwise before (Real Riverside). */
export type ClubWord={id:string;en:string;es:string;after:{en:boolean;es:boolean}};
export const CLUB_WORDS:readonly ClubWord[]=[
 {id:'united',en:'United',es:'Unión',after:{en:true,es:false}},{id:'wanderers',en:'Wanderers',es:'Wanderers',after:{en:true,es:true}},
 {id:'rovers',en:'Rovers',es:'Rovers',after:{en:true,es:true}},{id:'albion',en:'Albion',es:'Albion',after:{en:true,es:true}},
 {id:'athletic',en:'Athletic',es:'Atlético',after:{en:true,es:false}},{id:'real',en:'Real',es:'Real',after:{en:false,es:false}},
 {id:'inter',en:'Inter',es:'Inter',after:{en:false,es:false}},{id:'hotspurs',en:'Hotspurs',es:'Hotspurs',after:{en:true,es:true}},
 {id:'fc',en:'FC',es:'Club',after:{en:true,es:false}},{id:'city',en:'City',es:'Deportivo',after:{en:true,es:false}},
];
/** The note under each idea: where the word comes from (sourced, see the header) or a short football tip. */
export const NOTES:Record<Lang,Record<string,string>>={
 en:{united:'United means joined together. Newcastle United took the name in 1892 to mark two clubs, East End and West End, becoming one.',
  wanderers:'Wanderers F.C. never had a home ground of its own, so it wandered. It won the very first FA Cup, in 1872.',
  rovers:'A rover is someone who travels. Blackburn Rovers, founded in 1875, is one of England’s oldest clubs.',
  albion:'West Bromwich Albion is named after Albion, a part of the town where some of its first players lived or worked.',
  athletic:'Athletic Club of Bilbao, founded in 1898, chose the English spelling: football reached Bilbao with British workers and students.',
  real:'Real is Spanish for royal. Madrid’s club became Real Madrid in 1920, when the king gave it the title.',
  inter:'Inter is short for Internazionale. Its founders, in 1908, wanted a club that welcomed players from every country.',
  hotspurs:'Tottenham Hotspur is named after Harry Hotspur, a knight who was said to dig in his spurs to ride faster into battle.',
  fc:'FC stands for Football Club. It is the plainest club name of all, and many of the oldest clubs use it.',
  city:'City or Town tells everyone where the team is from. A home name gives the whole neighbourhood a team to cheer.',
  fire:'Chicago Fire is named after the Great Chicago Fire of 1871. The club was founded on the fire’s anniversary, in 1997.',
  animal:'An animal name is easy to cheer. Pick one that plays like your team wants to: fast like a cheetah, clever like a fox, together like wolves.',
  nature:'A short, loud name works best on the field: one word everyone can shout when they need a teammate to look up.',
  colour:'Match the name to your shirts. Players spot a teammate by colour in a split second, so the name and the kit help each other.'},
 es:{united:'United significa unidos. El Newcastle United tomó el nombre en 1892 cuando dos clubes, East End y West End, se hicieron uno.',
  wanderers:'El Wanderers F.C. nunca tuvo campo propio, así que iba de un sitio a otro (wander es vagar). Ganó la primera FA Cup, en 1872.',
  rovers:'Rover, en inglés, es alguien que viaja. El Blackburn Rovers, fundado en 1875, es uno de los clubes más antiguos de Inglaterra.',
  albion:'El West Bromwich Albion lleva el nombre de Albion, un barrio de la ciudad donde vivían o trabajaban algunos de sus primeros jugadores.',
  athletic:'El Athletic Club de Bilbao, fundado en 1898, eligió la grafía inglesa: el fútbol llegó a Bilbao con trabajadores y estudiantes británicos.',
  real:'Real quiere decir de la realeza. El club de Madrid pasó a ser el Real Madrid en 1920, cuando el rey le dio el título.',
  inter:'Inter es la forma corta de Internazionale. Sus fundadores, en 1908, querían un club que aceptara a jugadores de todos los países.',
  hotspurs:'El Tottenham Hotspur lleva el nombre de Harry Hotspur, un caballero que, según se cuenta, clavaba las espuelas para cabalgar más rápido.',
  fc:'Club es la palabra más sencilla de todas, y muchos de los clubes más antiguos la usan.',
  city:'Deportivo dice que el equipo es de deporte, y el nombre del lugar dice de dónde es: todo el barrio tiene un equipo al que animar.',
  fire:'El Chicago Fire se llama así por el Gran Incendio de Chicago de 1871. El club se fundó en el aniversario del incendio, en 1997.',
  animal:'Un nombre de animal es fácil de corear. Elige uno que juegue como quiere tu equipo: rápido como un guepardo, listo como un zorro, unido como los lobos.',
  nature:'En la cancha funciona mejor un nombre corto y fuerte: una palabra que todos puedan gritar cuando necesitan que un compañero levante la vista.',
  colour:'Haz que el nombre combine con la camiseta. Los jugadores reconocen a un compañero por el color en un instante, así que el nombre y el uniforme se ayudan.'},
};

/** mulberry32: a small, fast seeded generator; the same seed gives the same sequence everywhere. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/** The user's place word: letters (any alphabet), spaces, hyphens and apostrophes, at most 24 characters, each word capitalised. */
export function cleanPlace(s:string){
 const t=s.normalize('NFC').replace(/[^\p{L}\s'’-]/gu,'').replace(/\s+/g,' ').trim().slice(0,24).trim();
 return t.split(' ').filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
}
export type NameOptions={age:AgeBand;style:Style;colour?:string;animal?:string;place?:string;count?:number;lang?:Lang};
const pick=<T,>(r:()=>number,a:readonly T[])=>a[Math.floor(r()*a.length)];
/** Which kinds of name each age band and style draws from, with weights (young players get mostly animals and colours). */
function kinds(age:AgeBand,style:Style):[string,number][]{
 if(style==='animal')return [['colour-animal',3],['place-animal',2],['animal',1]];
 if(style==='classic')return [['club',1]];
 if(style==='nature')return [['colour-nature',2],['place-nature',2],['nature',1]];
 return age==='u6-u8'?[['colour-animal',5],['place-animal',2],['colour-nature',2],['club',1]]:age==='u9-u12'?[['colour-animal',3],['place-animal',2],['club',3],['colour-nature',1],['place-nature',1]]:[['club',5],['place-animal',2],['place-nature',1],['colour-animal',1]];
}
function weighted(r:()=>number,k:[string,number][]){const sum=k.reduce((a,x)=>a+x[1],0);let v=r()*sum;for(const [id,w] of k){if((v-=w)<0)return id;}return k[0][0];}
const esColour=(c:Colour,w:Word,plural=true)=>c.es[(plural?2:0)+(w.f?1:0)];
const article=(w:Word)=>w.f?'Las':'Los';
const singularNature=(w:Word)=>!/s$/.test(w.en);
function build(kind:string,r:()=>number,o:Required<Omit<NameOptions,'colour'|'animal'>>&{colour?:string;animal?:string}):NameIdea{
 const es=o.lang==='es',place=o.place||'Riverside';
 const animal=(o.animal&&ANIMALS.find(a=>a.id===o.animal))||pick(r,ANIMALS),colour=(o.colour&&COLOURS.find(c=>c.id===o.colour))||pick(r,COLOURS);
 const nature=pick(r,NATURE),club=pick(r,CLUB_WORDS);
 switch(kind){
  case 'colour-animal':return {name:es?`${article(animal)} ${animal.es} ${esColour(colour,animal)}`:`${colour.en} ${animal.en}`,note:NOTES[o.lang].colour,key:`ca:${colour.id}:${animal.id}`};
  case 'place-animal':return {name:es?`${article(animal)} ${animal.es} de ${place}`:`${place} ${animal.en}`,note:NOTES[o.lang].animal,key:`pa:${animal.id}`};
  case 'animal':return {name:es?`${article(animal)} ${animal.es}`:`The ${animal.en}`,note:NOTES[o.lang].animal,key:`a:${animal.id}`};
  case 'colour-nature':{const n=nature,one=singularNature(n);
   return {name:es?(one?`${n.es} ${esColour(colour,n,false)}`:`${article(n)} ${n.es} ${esColour(colour,n)}`):`${colour.en} ${n.en}`,note:NOTES[o.lang][n.id==='fire'?'fire':'nature'],key:`cn:${colour.id}:${n.id}`};}
  case 'place-nature':return {name:es?(singularNature(nature)?`${nature.es} de ${place}`:`${article(nature)} ${nature.es} de ${place}`):`${place} ${nature.en}`,note:NOTES[o.lang][nature.id==='fire'?'fire':'nature'],key:`pn:${nature.id}`};
  case 'nature':return {name:es?(singularNature(nature)?nature.es:`${article(nature)} ${nature.es}`):`The ${nature.en}`,note:NOTES[o.lang][nature.id==='fire'?'fire':'nature'],key:`n:${nature.id}`};
  default:return {name:es?(club.after.es?`${place} ${club.es}`:`${club.es} ${place}`):(club.after.en?`${place} ${club.en}`:`${club.en} ${place}`),note:NOTES[o.lang][club.id],key:`cl:${club.id}`};
 }
}
/** `count` different ideas for these options and this seed. */
export function generateNames(opts:NameOptions,seed:number):NameIdea[]{
 const o={count:8,lang:'en' as Lang,...opts,place:cleanPlace(opts.place??'')},r=rng(seed),k=kinds(o.age,o.style),out:NameIdea[]=[],seen=new Set<string>();
 for(let i=0;out.length<o.count&&i<o.count*30;i++){const n=build(weighted(r,k),r,o);if(seen.has(n.name))continue;seen.add(n.name);out.push(n);}
 return out;
}
/** Every word a name can be built from, for the safety test. */
export const ALL_WORDS=():string[]=>[...ANIMALS.flatMap(a=>[a.en,a.es]),...COLOURS.flatMap(c=>[c.en,...c.es]),...NATURE.flatMap(n=>[n.en,n.es]),...CLUB_WORDS.flatMap(c=>[c.en,c.es])];
