/**
 * Team kits + deterministic bean looks for match players and islander NPCs
 * (docs/bean-characters/CONTRACT.md, lane C). Pure data: no three.js, safe in tests.
 *
 * Teaching purpose: a match reads like real football. Every player on a team wears the identical
 * kit (shirt, trim, shorts, socks, boots), and each goalkeeper wears colours that differ from both
 * teams, as Law 4 of the Laws of the Game requires, so a child can tell teams and keepers apart at
 * a glance. Players differ only by who they are: body colour, face tone, eyes, mouth, hair, build.
 */
import {
  BEAN_BUILDS,BEAN_EYES,BEAN_MOUTHS,DEFAULT_HOME_KIT,DEFAULT_AWAY_KIT,DEFAULT_KEEPER_KIT,
  type BeanLook,type BeanHairStyle,type BeanHeadwear,type Outfit,
} from '../graphics/beanLook';

export type TeamSide='home'|'away';
export type KitColours=Omit<Outfit,'kind'|'number'>;
export type TeamPalette={id:string;name:string;kit:KitColours};
export type MatchKits={home:KitColours;away:KitColours;homeKeeper:KitColours;awayKeeper:KitColours};
export type BeanDress={look:BeanLook;outfit:Outfit};

const strip=({kind:_k,number:_n,...kit}:Outfit):KitColours=>kit;

/** The island's club palettes. Gold vs teal is the live match's default pair. */
export const TEAM_PALETTES:readonly TeamPalette[]=[
  {id:'gold',name:'Old Town Gold',kit:strip(DEFAULT_HOME_KIT)},
  {id:'teal',name:'Harbour Teal',kit:strip(DEFAULT_AWAY_KIT)},
  {id:'coral',name:'Palm Coast Coral',kit:{shirt:'#e8674f',shirt2:'#fff1dc',shorts:'#fff1dc',socks:'#e8674f',socks2:'#fff1dc',boots:'#2b2b30'}},
  {id:'navy',name:'Library Square Navy',kit:{shirt:'#23315e',shirt2:'#ffc83d',shorts:'#23315e',socks:'#23315e',socks2:'#ffc83d',boots:'#f2eee2'}},
  {id:'plum',name:'West Market Plum',kit:{shirt:'#7a4a8f',shirt2:'#f6d8ff',shorts:'#2f2238',socks:'#7a4a8f',socks2:'#f6d8ff',boots:'#26262b'}},
  {id:'cream',name:'South Pier Cream',kit:{shirt:'#f4efe2',shirt2:'#c8734f',shorts:'#c8734f',socks:'#f4efe2',socks2:'#c8734f',boots:'#3a2e28'}},
  {id:'crimson',name:'Eleven Park Crimson',kit:{shirt:'#b8323f',shirt2:'#ffffff',shorts:'#ffffff',socks:'#b8323f',socks2:'#ffffff',boots:'#1f1f24'}},
];
/** Keeper kits, chosen per match so they never clash with either team (or the other keeper). */
export const KEEPER_PALETTES:readonly TeamPalette[]=[
  {id:'keeper-green',name:'Keeper green',kit:strip(DEFAULT_KEEPER_KIT)},
  {id:'keeper-volt',name:'Keeper volt',kit:{shirt:'#d9ec3a',shirt2:'#2c3b33',shorts:'#2c3b33',socks:'#d9ec3a',socks2:'#2c3b33',boots:'#1f2724'}},
  {id:'keeper-pink',name:'Keeper pink',kit:{shirt:'#f06fb0',shirt2:'#2b2238',shorts:'#2b2238',socks:'#f06fb0',socks2:'#2b2238',boots:'#1f1f24'}},
  {id:'keeper-violet',name:'Keeper violet',kit:{shirt:'#6b4fc9',shirt2:'#e8f04a',shorts:'#1f1a33',socks:'#6b4fc9',socks2:'#e8f04a',boots:'#1f1f24'}},
  {id:'keeper-orange',name:'Keeper orange',kit:{shirt:'#ff8a2a',shirt2:'#1f2724',shorts:'#1f2724',socks:'#ff8a2a',socks2:'#1f2724',boots:'#1f2724'}},
  {id:'keeper-black',name:'Keeper black',kit:{shirt:'#26262b',shirt2:'#e8f04a',shorts:'#26262b',socks:'#26262b',socks2:'#e8f04a',boots:'#e8f04a'}},
];
export const DEFAULT_HOME_PALETTE='gold', DEFAULT_AWAY_PALETTE='teal';

// ---------------------------------------------------------------- colour distance (CIE76 ΔE in Lab)
function lab(hex:string):[number,number,number]{
  const n=parseInt(hex.replace('#','').padEnd(6,'0').slice(0,6),16);
  const lin=(v:number)=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
  const r=lin(n>>16&255),g=lin(n>>8&255),b=lin(n&255);
  const f=(t:number)=>t>.008856?Math.cbrt(t):7.787*t+16/116;
  const x=f((r*.4124+g*.3576+b*.1805)/.95047),y=f(r*.2126+g*.7152+b*.0722),z=f((r*.0193+g*.1192+b*.9505)/1.08883);
  return [116*y-16,500*(x-y),200*(y-z)];
}
export function colourDistance(a:string,b:string){const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);}
/** Hue-weighted ΔE (lightness counts 1/2.5): a light cyan body still reads as "teal team" from afar, so bodies are checked with this. */
export function hueDistance(a:string,b:string){const p=lab(a),q=lab(b);return Math.hypot((p[0]-q[0])/2.5,p[1]-q[1],p[2]-q[2]);}
/** Minimum shirt ΔE for two kits on the same pitch to read as different teams. */
export const KIT_CLASH_MIN=35;
/** Two kits clash when either their shirts or their team body colours (teamBodyColour) are too close. */
export const kitsClash=(a:KitColours,b:KitColours)=>Math.min(colourDistance(a.shirt,b.shirt),colourDistance(teamBodyColour(a),teamBodyColour(b)))<KIT_CLASH_MIN;

function mixHex(a:string,b:string,t:number){const p=parseInt(a.slice(1),16),q=parseInt(b.slice(1),16);const c=(s:number)=>Math.round((p>>s&255)*(1-t)+(q>>s&255)*t);return '#'+((c(16)<<16)|(c(8)<<8)|c(0)).toString(16).padStart(6,'0');}
/**
 * The body colour every player of a team shares (user direction, Sep 25): a lighter tint of the
 * shirt, so the whole bean reads as one team colour from the match camera while the kit trim,
 * shorts and socks still show. Dark shirts lift more so faces and limbs stay readable.
 */
export function teamBodyColour(kit:KitColours){const L=lab(kit.shirt)[0];return mixHex(kit.shirt,'#ffffff',L<45?.3:L<70?.14:.06);}

const palette=(id:string,list:readonly TeamPalette[])=>list.find(p=>p.id===id);
/** Resolve a home/away pair plus two keeper kits; a clashing away pick falls back to the next palette that doesn't clash. */
export function matchKits(homeId=DEFAULT_HOME_PALETTE,awayId=DEFAULT_AWAY_PALETTE):MatchKits{
  const home=(palette(homeId,TEAM_PALETTES)??TEAM_PALETTES[0]).kit;
  let away=(palette(awayId,TEAM_PALETTES)??TEAM_PALETTES[1]).kit;
  if(kitsClash(home,away))away=TEAM_PALETTES.find(p=>!kitsClash(home,p.kit))!.kit;
  const pickKeeper=(avoid:KitColours[])=>(KEEPER_PALETTES.find(p=>avoid.every(k=>!kitsClash(k,p.kit)))??KEEPER_PALETTES[0]).kit;
  const homeKeeper=pickKeeper([home,away]),awayKeeper=pickKeeper([home,away,homeKeeper]);
  return {home,away,homeKeeper,awayKeeper};
}
export const DEFAULT_MATCH_KITS:MatchKits=matchKits();
/**
 * Beach soccer kits for the live match on Coral Cay's court (FIFA Beach Soccer Laws 2024-25, Law 4: footwear is not
 * allowed). Sunshine Gold vs Ocean Blue, so the feed's "Gold" and "Blue" still read true. Barefoot: the socks and boots
 * take the team body colour (the bean's legs), so the shins and feet read bare, with only the pale sole showing; every
 * player of a team still wears the identical kit. Keepers keep their own colours (Law 4), barefoot as well.
 */
const barefoot=(kit:KitColours):KitColours=>{const body=teamBodyColour(kit);return {...kit,socks:body,socks2:body,boots:body};};
export const BEACH_KITS={
  home:{shirt:'#f29a1c',shirt2:'#fff3cf',shorts:'#1d4f73'} as Pick<KitColours,'shirt'|'shirt2'|'shorts'>,
  away:{shirt:'#1f7fc4',shirt2:'#e9f7ff',shorts:'#f6f0dc'} as Pick<KitColours,'shirt'|'shirt2'|'shorts'>,
};
export const BEACH_MATCH_KITS:MatchKits=(()=>{
  const home=barefoot({...BEACH_KITS.home,socks:'',socks2:'',boots:''}),away=barefoot({...BEACH_KITS.away,socks:'',socks2:'',boots:''});
  const pickKeeper=(avoid:KitColours[])=>(KEEPER_PALETTES.find(p=>avoid.every(k=>!kitsClash(k,p.kit)))??KEEPER_PALETTES[0]).kit;
  const homeKeeper=barefoot(pickKeeper([home,away])),awayKeeper=barefoot(pickKeeper([home,away,homeKeeper]));
  return {home,away,homeKeeper,awayKeeper};
})();

// ---------------------------------------------------------------- deterministic picks
function hashOf(id:string){let h=2166136261;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619)>>>0;return h;}
function picker(id:string){const h=hashOf(id);return <V>(list:readonly V[],salt:number):V=>{let x=(h^Math.imul(salt+1,0x9e3779b1))>>>0;x=Math.imul(x^x>>>15,0x2c1b3c6d)>>>0;x^=x>>>13;return list[(x>>>0)%list.length];};}

export const BODY_COLOURS=['#ff7a6b','#6fcfb4','#b99af0','#e2578a','#5fb8f2','#9ad04a','#ffa24c','#f06fb0','#4fc3c7','#c9a0ff','#7fd67a','#ff9e8a','#ffd35c','#8fa8ff'] as const;
export const SKIN_TONES=['#fff3e4','#fde6d2','#f6d2b0','#e9b98f','#c98f63','#a86f48','#7a4b31','#5c3a28'] as const;
export const HAIR_COLOURS=['#1a1210','#2a1c16','#3a2518','#5a3a22','#8a5a2b','#c98a3a','#e3c07a','#b04a2a'] as const;
const MATCH_HAIR:readonly BeanHairStyle[]=['crop','tuft','puffs','bun','ponytail','curls','none','crop','tuft'];
/** Live-match slot ids: 'gk' is the home keeper, 'dgk' the away keeper (see shirtNumbers.classicShirtNumber). */
export const isKeeperSlot=(id:string)=>id.toLowerCase().replace(/^d/,'')==='gk';

/** Individual shape and character only (build, hair, face tone, eyes, mouth); the body colour is filled in by the caller. */
function baseLook(seed:string,body:string):BeanLook{
  const pick=picker(seed);
  const skin=pick(SKIN_TONES,2),light=SKIN_TONES.indexOf(skin as typeof SKIN_TONES[number])<4;
  return {body,skin,build:pick(BEAN_BUILDS,3),eyes:pick(BEAN_EYES,4),mouth:pick(BEAN_MOUTHS,5),
    ...(light&&pick([true,false],8)?{blush:'#ff8f8f'}:{}),hair:{style:pick(MATCH_HAIR,6),color:pick(HAIR_COLOURS,7)},headwear:'none'};
}

export const teamKit=(kits:MatchKits,side:TeamSide,keeper:boolean)=>keeper?(side==='home'?kits.homeKeeper:kits.awayKeeper):side==='home'?kits.home:kits.away;

/**
 * A match player's look + outfit. Every player of a team shares the team body colour and the
 * identical kit (only the shirt number differs); each keeper has their own body + kit colour that
 * clashes with neither team. Players differ only in shape and character: build, hair, face tone,
 * eyes, mouth. Outfield players never wear hats; keepers wear gloves and sometimes a keeper cap.
 */
export function matchPlayerDress(playerKey:string,side:TeamSide,keeper:boolean,number:number|null=null,kits:MatchKits=DEFAULT_MATCH_KITS):BeanDress{
  const kit=teamKit(kits,side,keeper);
  const look=baseLook(playerKey,teamBodyColour(kit));
  if(keeper){look.gloves=kit.shirt2;if(picker(playerKey)([true,false],9)){look.headwear='keeper';look.headwearColor=kit.shirt;look.headwearColor2=kit.shorts;}}
  return {look,outfit:{kind:'kit',...kit,number}};
}

/**
 * The player's own character inside a team context: keeps their build, hair, face, eyes and mouth
 * but takes the team body colour and kit (their shirt number is kept when the dress has none).
 * Outfield: no headwear, as for every match player.
 */
export function teamedLook(own:BeanLook,dress:BeanDress,ownNumber:number|null=null):BeanDress{
  const keeper=!!dress.look.gloves;
  return {look:{...own,body:dress.look.body,headwear:keeper?dress.look.headwear:'none',headwearColor:keeper?dress.look.headwearColor:undefined,headwearColor2:keeper?dress.look.headwearColor2:undefined,gloves:dress.look.gloves},
    outfit:{...dress.outfit,number:dress.outfit.number??ownNumber}};
}

/**
 * The main player's dress in Town: their own look + outfit normally; team colours (home body +
 * kit, own shape/hair/face, own number) while a team activity is on (draw-the-pass lesson,
 * rooftop knockout). Switching back returns the untouched own look.
 */
export function mainPlayerDress(own:BeanLook,ownOutfit:Outfit,inTeam:boolean,number:number|null=null):BeanDress{
  return inTeam?teamedLook(own,sideGameDress('you','home'),number??ownOutfit.number??null):{look:own,outfit:ownOutfit};
}

/**
 * A field token (live match or taught play/quiz on the island pitches; see fieldRuntime). Offense
 * tokens are home, defense tokens away; a keeper is the 'gk'/'dgk' slot, a token labelled GK, or
 * the sim's isGK flag. Seeded by pitch + slot so each pitch has its own players.
 */
export function fieldTokenDress(pitchId:string,token:{id:string;label?:string;home:boolean},number:number|null,simKeeper=false,kits:MatchKits=DEFAULT_MATCH_KITS):BeanDress{
  return matchPlayerDress(pitchId+':'+token.id,token.home?'home':'away',simKeeper||isKeeperSlot(token.id)||token.label==='GK',number,kits);
}

// ---------------------------------------------------------------- islander NPCs
const CASUAL_TOPS:Record<'classic'|'coast'|'sunset',readonly string[]>={
  classic:['#edb957','#f2d27a','#fff4cd','#e0a84a'],
  coast:['#356478','#4fc3c7','#bcd9d3','#5fa0c8'],
  sunset:['#c8734f','#e8674f','#ffb38a','#e2578a'],
};
const CASUAL_ACCENTS=['#f2eee2','#23315e','#ffffff','#ffc83d','#6fcfb4','#e2578a','#3a2e28'] as const;
const CASUAL_BOTTOMS=['#35507a','#2f3b36','#8a7a5a','#c9b48a','#5a3a4a','#26262b','#6a8a9a'] as const;
const CASUAL_SOCKS=['#f7f1e6','#ffffff','#e8674f','#35507a','#ffd35c'] as const;
const CASUAL_SHOES=['#6a4a3a','#f2eee2','#26262b','#e2578a','#4fc3c7','#b04a2a'] as const;
const HEADWEAR_COLOURS=['#23315e','#ff7a3c','#ffffff','#e2578a','#3d8f5a','#ffc83d','#35507a','#c8734f'] as const;

export type NpcLookInput={id:string;role?:string;character?:'male'|'female';face?:'warm'|'deep'|'light';clothing?:'classic'|'coast'|'sunset'};
/** Headwear that suits a role's wording (coach, keeper, reporter, beach, market...); falls back to a varied mix. */
export function roleHeadwear(role:string|undefined):readonly BeanHeadwear[]{
  const r=(role??'').toLowerCase();
  if(/coach|mentor|organis|organiz/.test(r))return ['cap','visor','cap','none'];
  if(/keeper/.test(r))return ['cap','keeper'];
  if(/reporter|news|transfer|tactics|fan/.test(r))return ['cap','beanie','none'];
  if(/beach|pier|volleyball|rally/.test(r))return ['bucket','visor','cap','headband'];
  if(/market|vendor|cafe|café|serv|shop|garden/.test(r))return ['bucket','cap','visor','none'];
  if(/practi|partner|winger|defender|midfielder|captain|regular|runner/.test(r))return ['headband','cap','none','beanie'];
  return ['none','cap','beanie','bucket','visor','none'];
}
const HAIR_BY_CHARACTER:Record<'male'|'female'|'any',readonly BeanHairStyle[]>={
  male:['crop','tuft','curls','none','crop'],
  female:['ponytail','bun','puffs','long','curls'],
  any:['crop','tuft','puffs','bun','ponytail','curls','long','none'],
};
const SKIN_BY_FACE:Record<'light'|'warm'|'deep',readonly string[]>={light:SKIN_TONES.slice(0,3),warm:SKIN_TONES.slice(2,6),deep:SKIN_TONES.slice(5)};

/** A stable casual look for an islander NPC: varied clothes and role-suited headwear, seeded by id. */
export function npcDress(input:NpcLookInput):BeanDress{
  const pick=picker('npc:'+input.id);
  const look=baseLook('npc:'+input.id,picker('npc:'+input.id)(BODY_COLOURS,1));
  if(input.face)look.skin=pick(SKIN_BY_FACE[input.face],12);
  look.hair={style:pick(HAIR_BY_CHARACTER[input.character??'any'],13),color:pick(HAIR_COLOURS,14)};
  const headwear=pick(roleHeadwear(input.role),15);
  look.headwear=headwear;
  if(headwear!=='none'){look.headwearColor=pick(HEADWEAR_COLOURS,16);look.headwearColor2=pick(CASUAL_ACCENTS,17);}
  const tops=CASUAL_TOPS[input.clothing??pick(['classic','coast','sunset'] as const,18)];
  const shirt=pick(tops,19);
  const outfit:Outfit={kind:'casual',shirt,shirt2:pick(CASUAL_ACCENTS.filter(c=>colourDistance(c,shirt)>=20),20),shorts:pick(CASUAL_BOTTOMS,21),socks:pick(CASUAL_SOCKS,22),boots:pick(CASUAL_SHOES,23),number:null};
  return {look,outfit};
}

/** Two-team side games (volleyball, rooftop knockout, town locals): identical team kits, varied players, no hats. */
export function sideGameDress(playerKey:string,side:TeamSide,number:number|null=null,kits:MatchKits=DEFAULT_MATCH_KITS):BeanDress{
  return matchPlayerDress(playerKey,side,false,number,kits);
}
