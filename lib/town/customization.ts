import {COIN_REWARD_ID,costumeEarned} from './coinQuest';
import {readCoinProgress} from './coinProgress';
import {getIslandCostume} from './islandCostumes';
import {CLUB_COSTUMES} from './costumes';
import {DEFAULT_HOME_KIT,DEFAULT_AWAY_KIT,type BeanLook,type Outfit,type BeanBuild,type BeanEyes,type BeanMouth,type BeanHairStyle,type BeanHeadwear} from '../graphics/beanLook';
export type CharacterCustomization = {
  costume:string;
  character:'male'|'female'|'captain'|'explorer';
  face:'warm'|'deep'|'light'; body:'balanced'|'strong'|'slim'; clothing:'classic'|'coast'|'sunset';
  ball:'classic'|'sunset'|'neon'|'frost'|'solar'|'cosmic'; scooter:'classic'|'coast'|'sunset'|'mint'|'stunt'|'comet'; bike:'classic'|'coast'|'sunset'|'bmx'|'road'|'mountain'; moped:'classic'|'coast'|'sunset'|'retro'|'delivery'|'sport'; jetpack:'classic'|'flying-car'|'helicopter'|'ironman'|'rocketboard'|'mini-plane';
  /** Bean builder (docs/bean-characters/CONTRACT.md, lane D). Colour fields hold palette ids, not raw hex, so saves sanitise. */
  bodyColor:string; skinTone:string; eyes:BeanEyes; mouth:BeanMouth; hair:BeanHairStyle; hairColor:string; build:BeanBuild; headwear:BeanHeadwear; headwearColor:string;
};
export type CustomizationKey=keyof CharacterCustomization;
export type CustomizationOption={id:string;label:string;color:string;unlock?:number|'all';equipment?:boolean;coinReward?:boolean;color2?:string};
/** The bean-builder keys, in the order the builder shows them. */
export const BEAN_KEYS=['bodyColor','skinTone','eyes','mouth','hair','hairColor','build','headwear','headwearColor'] as const;
export type BeanKey=typeof BEAN_KEYS[number];
export const CUSTOMIZATION_OPTIONS:Record<CustomizationKey,CustomizationOption[]>={
  costume:[{id:'none',label:'No costume',color:'#e8d8b0'},{id:COIN_REWARD_ID,label:'Matchday Fox · Gold fox',color:'#f2bb45',coinReward:true},...CLUB_COSTUMES.map(item=>({id:item.id,coinReward:true,label:`${getIslandCostume(item.id).name} · ${getIslandCostume(item.id).animalLabel}`,color:`#${getIslandCostume(item.id).color.toString(16).padStart(6,'0')}`}))],
  character:[{id:'male',label:'Male',color:'#edb957'},{id:'female',label:'Female',color:'#356478'},{id:'captain',label:'Captain',color:'#f0d27b'},{id:'explorer',label:'Explorer',color:'#85966a'}],
  face:[{id:'warm',label:'Warm',color:'#bc8562'},{id:'deep',label:'Deep',color:'#765039'},{id:'light',label:'Light',color:'#d4a17c'}],
  body:[{id:'balanced',label:'Balanced',color:'#819574'},{id:'strong',label:'Strong',color:'#526f58'},{id:'slim',label:'Slim',color:'#b2b386'}],
  clothing:[{id:'classic',label:'Classic kit',color:'#edb957'},{id:'coast',label:'Coast stripes',color:'#356478'},{id:'sunset',label:'Sunset jacket',color:'#c8734f'}],
  ball:[{id:'classic',label:'Classic',color:'#eee4c4'},{id:'sunset',label:'Sunset',color:'#e89154'},{id:'neon',label:'Glow',color:'#b9e18b'},{id:'frost',label:'Frost',color:'#91dfff'},{id:'solar',label:'Solar',color:'#ffd166'},{id:'cosmic',label:'Cosmic',color:'#bd8aff'}],
  scooter:[{id:'classic',label:'Street',color:'#c68853'},{id:'coast',label:'Coast cruiser',color:'#589aa0'},{id:'sunset',label:'Sunset sport',color:'#c8734f'},{id:'mint',label:'Mint',color:'#65dfc5'},{id:'stunt',label:'Stunt',color:'#ed78b8'},{id:'comet',label:'Comet',color:'#ff9b55'}],
  bike:[{id:'classic',label:'City',color:'#c68853'},{id:'coast',label:'Basket cruiser',color:'#589aa0'},{id:'sunset',label:'Trail bike',color:'#c8734f'},{id:'bmx',label:'BMX',color:'#a786ef'},{id:'road',label:'Road',color:'#5bbdeb'},{id:'mountain',label:'Mountain',color:'#8bcc70'}],
  moped:[{id:'classic',label:'Classic',color:'#c68853'},{id:'coast',label:'Coast tourer',color:'#589aa0'},{id:'sunset',label:'Sunset racer',color:'#c8734f'},{id:'retro',label:'Retro',color:'#ecb878'},{id:'delivery',label:'Delivery',color:'#63c5b6'},{id:'sport',label:'Sport',color:'#f36c77'}],
  jetpack:[{id:'classic',label:'Twin jet',color:'#c68853'},{id:'helicopter',label:'Helicopter pack',color:'#9464c4'},{id:'rocketboard',label:'Rocket surfboard',color:'#ed9446'},{id:'mini-plane',label:'Mini airplane',color:'#57a8d4'},{id:'flying-car',label:'Flying car',color:'#c94f4d'},{id:'ironman',label:'Iron Man suit',color:'#c8443c'}],
  bodyColor:[{id:'coral',label:'Coral',color:'#ff7a6b'},{id:'sky',label:'Sky',color:'#5fb8f2'},{id:'mint',label:'Mint',color:'#6fcfb4'},{id:'lilac',label:'Lilac',color:'#b99af0'},{id:'berry',label:'Berry',color:'#e2578a'},{id:'lime',label:'Lime',color:'#9ad04a'},{id:'tangerine',label:'Tangerine',color:'#ffa24c'},{id:'bubblegum',label:'Bubblegum',color:'#f06fb0'},{id:'lagoon',label:'Lagoon',color:'#4fc3c7'},{id:'sunflower',label:'Sunflower',color:'#f5c542'}],
  skinTone:[{id:'porcelain',label:'Porcelain',color:'#fff3e4'},{id:'fair',label:'Fair',color:'#fde6d2'},{id:'peach',label:'Peach',color:'#f6d2b0'},{id:'honey',label:'Honey',color:'#e9b98f'},{id:'caramel',label:'Caramel',color:'#c98f63'},{id:'bronze',label:'Bronze',color:'#a86f48'},{id:'cocoa',label:'Cocoa',color:'#7a4b31'},{id:'espresso',label:'Espresso',color:'#5c3a28'}],
  eyes:[{id:'dots',label:'Dots',color:'#294a3e'},{id:'ovals',label:'Ovals',color:'#294a3e'},{id:'happy',label:'Happy',color:'#294a3e'},{id:'ticks',label:'Sparkle',color:'#294a3e'},{id:'sleepy',label:'Sleepy',color:'#294a3e'}],
  mouth:[{id:'smile',label:'Smile',color:'#294a3e'},{id:'grin',label:'Grin',color:'#294a3e'},{id:'smirk',label:'Smirk',color:'#294a3e'},{id:'o',label:'Wow',color:'#294a3e'}],
  hair:[{id:'crop',label:'Crop',color:'#3a2518'},{id:'tuft',label:'Tuft',color:'#3a2518'},{id:'curls',label:'Curls',color:'#3a2518'},{id:'ponytail',label:'Ponytail',color:'#3a2518'},{id:'bun',label:'Bun',color:'#3a2518'},{id:'puffs',label:'Puffs',color:'#3a2518'},{id:'long',label:'Long',color:'#3a2518'},{id:'none',label:'None',color:'#3a2518'}],
  hairColor:[{id:'black',label:'Black',color:'#1a1210'},{id:'dark',label:'Dark brown',color:'#3a2518'},{id:'brown',label:'Brown',color:'#5a3a22'},{id:'chestnut',label:'Chestnut',color:'#8a5a2b'},{id:'ginger',label:'Ginger',color:'#b04a2a'},{id:'golden',label:'Golden',color:'#c98a3a'},{id:'blonde',label:'Blonde',color:'#e3c07a'},{id:'blue',label:'Blue dye',color:'#3f6fd8'},{id:'pink',label:'Pink dye',color:'#ef7fb8'}],
  build:[{id:'regular',label:'Regular',color:'#819574'},{id:'tall',label:'Tall',color:'#819574'},{id:'short',label:'Short',color:'#819574'},{id:'wide',label:'Wide',color:'#819574'}],
  headwear:[{id:'none',label:'None',color:'#e8d8b0'},{id:'cap',label:'Cap',color:'#23315e'},{id:'beanie',label:'Beanie',color:'#ff7a3c'},{id:'headband',label:'Headband',color:'#ffffff'},{id:'bucket',label:'Bucket hat',color:'#ffffff'},{id:'visor',label:'Visor',color:'#ffc83d'},{id:'keeper',label:'Keeper cap',color:'#3d8f5a'}],
  headwearColor:[{id:'navy',label:'Navy',color:'#23315e',color2:'#ffc83d'},{id:'red',label:'Red',color:'#e0453d',color2:'#ffffff'},{id:'orange',label:'Orange',color:'#ff7a3c',color2:'#ffffff'},{id:'gold',label:'Gold',color:'#ffc83d',color2:'#23315e'},{id:'white',label:'White',color:'#f7f3ea',color2:'#ff6b5e'},{id:'green',label:'Green',color:'#3d8f5a',color2:'#e8f04a'},{id:'pink',label:'Pink',color:'#ff5d8f',color2:'#ffffff'},{id:'teal',label:'Teal',color:'#2f9c9a',color2:'#fff4cd'}]
};
/** Balls are free; costumes follow the ball hunt. Rides unlock one per finished path: lib/town/rideUnlocks.ts (Town applies
 *  enforceRideUnlocks after sanitising), and ride options are listed here in that unlock order. */
export const STORE_FREE_PREVIEW=true;
for(const key of ['ball','scooter','bike','moped','jetpack'] as const)for(const option of CUSTOMIZATION_OPTIONS[key])option.equipment=true;
type BeanFields=Pick<CharacterCustomization,BeanKey>;
/** Male and female presets set sensible starting points; every option stays open to both. */
export const BEAN_PRESETS:Record<'male'|'female',BeanFields>={
  male:{bodyColor:'coral',skinTone:'caramel',eyes:'dots',mouth:'smile',hair:'crop',hairColor:'dark',build:'regular',headwear:'none',headwearColor:'navy'},
  female:{bodyColor:'sky',skinTone:'honey',eyes:'ovals',mouth:'smile',hair:'ponytail',hairColor:'dark',build:'regular',headwear:'none',headwearColor:'pink'},
};
export const DEFAULT_CUSTOMIZATION:CharacterCustomization={costume:'none',character:'male',face:'warm',body:'balanced',clothing:'classic',ball:'classic',scooter:'classic',bike:'classic',moped:'classic',jetpack:'classic',...BEAN_PRESETS.male};
const LEGACY_SKIN:Record<CharacterCustomization['face'],string>={warm:'caramel',deep:'cocoa',light:'peach'};
const LEGACY_BUILD:Record<CharacterCustomization['body'],BeanBuild>={balanced:'regular',strong:'wide',slim:'tall'};
/** Bean defaults for a save made before the builder existed, so returning players keep a similar look. */
export function migrateBeanFields(legacy:Pick<CharacterCustomization,'character'|'face'|'body'>):BeanFields{
  const base={...BEAN_PRESETS[legacy.character==='female'?'female':'male'],skinTone:LEGACY_SKIN[legacy.face],build:LEGACY_BUILD[legacy.body]};
  if(legacy.character==='captain')return {...base,headwear:'headband',headwearColor:'gold'};
  if(legacy.character==='explorer')return {...base,headwear:'bucket',headwearColor:'green'};
  return base;
}
const hex=(key:CustomizationKey,id:string)=>CUSTOMIZATION_OPTIONS[key].find(option=>option.id===id)?.color??CUSTOMIZATION_OPTIONS[key][0].color;
const channel=(value:string)=>[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
/** Keeps the classic body (costumes, classic style) close to the bean choices. */
function legacyFromBean(value:CharacterCustomization):Pick<CharacterCustomization,'face'|'body'>{
  const tone=channel(hex('skinTone',value.skinTone));let face:CharacterCustomization['face']='warm',best=Infinity;
  for(const option of CUSTOMIZATION_OPTIONS.face){const c=channel(option.color),d=c.reduce((sum,v,i)=>sum+(v-tone[i])**2,0);if(d<best){best=d;face=option.id as CharacterCustomization['face'];}}
  return {face,body:value.build==='wide'?'strong':value.build==='tall'?'slim':'balanced'};
}
/** Applies one builder choice, keeping the legacy classic fields in step. */
export function applyCustomization(value:CharacterCustomization,key:CustomizationKey,id:string):CharacterCustomization{
  if(key==='character')return selectCharacter(value,id as CharacterCustomization['character']);
  if(!CUSTOMIZATION_OPTIONS[key].some(option=>option.id===id))return value;
  const next={...value,[key]:id} as CharacterCustomization;
  return key==='skinTone'||key==='build'?{...next,...legacyFromBean(next)}:next;
}
/** Male/female presets set hair, eyes and body colour defaults but keep the player's face tone, build, kit and gear. */
export function selectCharacter(value:CharacterCustomization,character:CharacterCustomization['character']):CharacterCustomization {
 if(value.character===character)return value;
 if(character!=='male'&&character!=='female')return {...value,character};
 const preset=BEAN_PRESETS[character];
 return {...value,character,clothing:character==='female'?'coast':'classic',bodyColor:preset.bodyColor,eyes:preset.eyes,mouth:preset.mouth,hair:preset.hair,hairColor:preset.hairColor,headwear:preset.headwear,headwearColor:preset.headwearColor};
}
/** Ready-made looks, four per main character: kids pick one, then tweak. They keep face tone, kit, gear and costume. */
export type LookPreset={id:string;label:string;character:'male'|'female';fields:Omit<BeanFields,'skinTone'>};
export const LOOK_PRESETS:LookPreset[]=[
  {id:'sunny',label:'Sunny',character:'male',fields:{bodyColor:'coral',eyes:'dots',mouth:'smile',hair:'crop',hairColor:'dark',build:'regular',headwear:'none',headwearColor:'navy'}},
  {id:'striker',label:'Striker',character:'male',fields:{bodyColor:'lime',eyes:'ticks',mouth:'grin',hair:'tuft',hairColor:'black',build:'tall',headwear:'none',headwearColor:'navy'}},
  {id:'chill',label:'Chill',character:'male',fields:{bodyColor:'lilac',eyes:'sleepy',mouth:'smirk',hair:'curls',hairColor:'brown',build:'regular',headwear:'beanie',headwearColor:'orange'}},
  {id:'wall',label:'The Wall',character:'male',fields:{bodyColor:'tangerine',eyes:'happy',mouth:'grin',hair:'crop',hairColor:'black',build:'wide',headwear:'keeper',headwearColor:'green'}},
  {id:'breeze',label:'Breeze',character:'female',fields:{bodyColor:'sky',eyes:'ovals',mouth:'smile',hair:'ponytail',hairColor:'dark',build:'regular',headwear:'none',headwearColor:'pink'}},
  {id:'spark',label:'Spark',character:'female',fields:{bodyColor:'berry',eyes:'happy',mouth:'grin',hair:'puffs',hairColor:'black',build:'short',headwear:'none',headwearColor:'pink'}},
  {id:'captain',label:'Captain',character:'female',fields:{bodyColor:'mint',eyes:'dots',mouth:'smirk',hair:'bun',hairColor:'chestnut',build:'tall',headwear:'headband',headwearColor:'gold'}},
  {id:'sunset',label:'Sunset',character:'female',fields:{bodyColor:'sunflower',eyes:'ticks',mouth:'smile',hair:'long',hairColor:'golden',build:'regular',headwear:'cap',headwearColor:'teal'}},
];
export function applyLook(value:CharacterCustomization,id:string):CharacterCustomization{
  const look=LOOK_PRESETS.find(item=>item.id===id);if(!look)return value;
  const next={...value,character:look.character,...look.fields};
  return {...next,...legacyFromBean(next)};
}
/** The ready-made look the current choices match exactly, if any. */
export function matchingLook(value:CharacterCustomization){return LOOK_PRESETS.find(look=>look.character===value.character&&(Object.keys(look.fields) as (keyof LookPreset['fields'])[]).every(key=>look.fields[key]===value[key]));}
/** Eyes + mouth combined into one "face" choice; the separate eyes/mouth pickers live under More. */
export const FACE_STYLES:{id:string;label:string;eyes:BeanEyes;mouth:BeanMouth}[]=[
  {id:'smiley',label:'Smiley',eyes:'dots',mouth:'smile'},{id:'happy',label:'Happy',eyes:'happy',mouth:'grin'},{id:'cheeky',label:'Cheeky',eyes:'ticks',mouth:'smirk'},
  {id:'wow',label:'Wow',eyes:'ovals',mouth:'o'},{id:'calm',label:'Calm',eyes:'ovals',mouth:'smile'},{id:'sleepy',label:'Sleepy',eyes:'sleepy',mouth:'smile'},
];
export function applyFace(value:CharacterCustomization,id:string):CharacterCustomization{const face=FACE_STYLES.find(item=>item.id===id);return face?{...value,eyes:face.eyes,mouth:face.mouth}:value;}
/** The bean look for the main character (lane A renders it with setBeanLook). */
export function beanLookFor(value:CharacterCustomization):BeanLook{
  const trim=CUSTOMIZATION_OPTIONS.headwearColor.find(option=>option.id===value.headwearColor)??CUSTOMIZATION_OPTIONS.headwearColor[0];
  return {body:hex('bodyColor',value.bodyColor),skin:hex('skinTone',value.skinTone),build:value.build,eyes:value.eyes,mouth:value.mouth,blush:value.character==='female'?'#ff8fae':'#ff8f8f',
    hair:{style:value.hair,color:hex('hairColor',value.hairColor)},headwear:value.headwear,headwearColor:trim.color,headwearColor2:trim.color2};
}
/** The main player's shirt number: the classic playmaker's 10. */
export const MAIN_PLAYER_NUMBER=10;
/** The player's own kit, from the current clothing choice. */
export function playerOutfit(value:CharacterCustomization):Outfit{
  const kit=value.clothing==='coast'?DEFAULT_AWAY_KIT:value.clothing==='sunset'?{...DEFAULT_HOME_KIT,shirt:'#c8734f',shirt2:'#ffe2b8',shorts:'#655549',socks:'#c8734f',socks2:'#655549',boots:'#3a2f28'}:DEFAULT_HOME_KIT;
  return {...kit,kind:'kit',number:MAIN_PLAYER_NUMBER};
}
/** Classic 1–11 numbering, linked to positionReference.json roles for the builder's learning hook. */
export const SHIRT_NUMBER_ROLES:{number:number;position:string;title:string}[]=[
  {number:1,position:'GK',title:'Goalkeeper'},{number:2,position:'RB',title:'Right back'},{number:3,position:'LB',title:'Left back'},{number:4,position:'RCB',title:'Centre-back'},{number:5,position:'LCB',title:'Centre-back'},{number:6,position:'CM',title:'Holding midfielder'},{number:7,position:'RW',title:'Right winger'},{number:8,position:'RCM',title:'Box-to-box midfielder'},{number:9,position:'ST',title:'Striker'},{number:10,position:'LCM',title:'Playmaker'},{number:11,position:'LW',title:'Left winger'}
];
export const BALL_COLORS={classic:'#eee4c4',sunset:'#e89154',neon:'#b9e18b',frost:'#91dfff',solar:'#ffd166',cosmic:'#bd8aff'};
export function isCustomizationUnlocked(option:CustomizationOption,completed:number,total:number){return option.coinReward?costumeEarned(readCoinProgress(),option.id):true;}
const LEGACY_KEYS=['costume','character','face','body','clothing','ball','scooter','bike','moped','jetpack'] as const;
export function sanitizeCustomization(value:unknown,completed=0,total=0):CharacterCustomization{
  const result={...DEFAULT_CUSTOMIZATION};
  if(!value||typeof value!=='object')return result;
  if((value as Record<string,unknown>).jetpack==='hovercraft')value={...value,jetpack:'helicopter'};
  const pick=(key:CustomizationKey)=>{const selected=CUSTOMIZATION_OPTIONS[key].find(option=>option.id===(value as Record<string,unknown>)[key]);if(selected&&isCustomizationUnlocked(selected,completed,total))(result as Record<string,string>)[key]=selected.id;};
  LEGACY_KEYS.forEach(pick);
  // Missing or unknown bean fields fall back to defaults derived from the legacy character/face/body.
  Object.assign(result,migrateBeanFields(result));
  BEAN_KEYS.forEach(pick);
  return result;
}
const STORAGE_KEY='futbol-island-customization-v1';
export function loadCustomization(completed=0,total=0){try{return sanitizeCustomization(JSON.parse(localStorage.getItem(STORAGE_KEY)??'null'),completed,total);}catch{return {...DEFAULT_CUSTOMIZATION};}}
export function saveCustomization(value:CharacterCustomization){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value));}catch{/* Private browsing still supports this visit. */}}
