import {COIN_REWARD_ID,coinRewardEarned,allCostumesEarned} from './coinQuest';
import {readCoinProgress} from './coinProgress';
import {getIslandCostume} from './islandCostumes';
import {CLUB_COSTUMES} from './costumes';
export type CharacterCustomization = {
  costume:string;
  character:'male'|'female'|'captain'|'explorer';
  face:'warm'|'deep'|'light'; body:'balanced'|'strong'|'slim'; clothing:'classic'|'coast'|'sunset';
  ball:'classic'|'sunset'|'neon'|'frost'|'solar'|'cosmic'; scooter:'classic'|'coast'|'sunset'|'mint'|'stunt'|'comet'; bike:'classic'|'coast'|'sunset'|'bmx'|'road'|'mountain'; moped:'classic'|'coast'|'sunset'|'retro'|'delivery'|'sport'; jetpack:'classic'|'flying-car'|'helicopter'|'ironman'|'rocketboard'|'mini-plane';
};
export type CustomizationKey=keyof CharacterCustomization;
export type CustomizationOption={id:string;label:string;color:string;unlock?:number|'all';equipment?:boolean;coinReward?:boolean};
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
  jetpack:[{id:'classic',label:'Twin jet',color:'#c68853'},{id:'flying-car',label:'Flying car',color:'#c94f4d'},{id:'helicopter',label:'Helicopter pack',color:'#9464c4'},{id:'ironman',label:'Iron Man suit',color:'#c8443c'},{id:'rocketboard',label:'Rocket surfboard',color:'#ed9446'},{id:'mini-plane',label:'Mini airplane',color:'#57a8d4'}]
};
/** Gear is available independently of Paths; only ball-hunt costumes require progress. */
export const STORE_FREE_PREVIEW=true;
for(const key of ['ball','scooter','bike','moped','jetpack'] as const)for(const option of CUSTOMIZATION_OPTIONS[key])option.equipment=true;
export const DEFAULT_CUSTOMIZATION:CharacterCustomization={costume:'none',character:'male',face:'warm',body:'balanced',clothing:'classic',ball:'classic',scooter:'classic',bike:'classic',moped:'classic',jetpack:'classic'};
export function selectCharacter(value:CharacterCustomization,character:CharacterCustomization['character']):CharacterCustomization {
 if(value.character===character)return value;
 return {...value,character,...(character==='female'?{face:'light' as const,clothing:'coast' as const}:character==='male'?{face:'warm' as const,clothing:'classic' as const}:{})};
}
export const BALL_COLORS={classic:'#eee4c4',sunset:'#e89154',neon:'#b9e18b',frost:'#91dfff',solar:'#ffd166',cosmic:'#bd8aff'};
export function isCustomizationUnlocked(option:CustomizationOption,completed:number,total:number){return option.coinReward?(option.id===COIN_REWARD_ID?coinRewardEarned(readCoinProgress()):allCostumesEarned(readCoinProgress())):true;}
export function sanitizeCustomization(value:unknown,completed=0,total=0):CharacterCustomization{
  const result={...DEFAULT_CUSTOMIZATION};
  if(!value||typeof value!=='object')return result;
  if((value as Record<string,unknown>).jetpack==='hovercraft')value={...value,jetpack:'helicopter'};
  for(const key of Object.keys(result) as CustomizationKey[]){const selected=CUSTOMIZATION_OPTIONS[key].find(option=>option.id===(value as Record<string,unknown>)[key]);if(selected&&isCustomizationUnlocked(selected,completed,total))(result as Record<string,string>)[key]=selected.id;}
  return result;
}
const STORAGE_KEY='futbol-island-customization-v1';
export function loadCustomization(completed=0,total=0){try{return sanitizeCustomization(JSON.parse(localStorage.getItem(STORAGE_KEY)??'null'),completed,total);}catch{return {...DEFAULT_CUSTOMIZATION};}}
export function saveCustomization(value:CharacterCustomization){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(value));}catch{/* Private browsing still supports this visit. */}}
