import {CUSTOMIZATION_OPTIONS,type CharacterCustomization,type CustomizationOption} from './customization';
import type {TravelMode} from './travelModes';
export {STORE_FREE_PREVIEW} from './customization';
export type StoreCategory='ball'|'scooter'|'bike'|'moped'|'jetpack';
export type StoreItem={id:string;category:StoreCategory;option:CustomizationOption;mode:TravelMode;description:string};
export const STORE_CATEGORIES:{id:StoreCategory;label:string}[]=[{id:'ball',label:'Balls'},{id:'scooter',label:'Scooters'},{id:'bike',label:'Bikes'},{id:'moped',label:'Mopeds'},{id:'jetpack',label:'Flight'}];
const descriptions:Record<StoreCategory,string>={ball:'Take it out for a dribble, juggle or shot.',scooter:'A light ride for cruising the island streets.',bike:'Pedal through the neighborhoods and try a wheelie.',moped:'A quick seated ride for the longer way home.',jetpack:'Take off above the rooftops. Land before switching rides.'};
const itemDescriptions:Record<string,string>={
 'ball:frost':'An icy panelled ball with pale blue shard trails and a freezing slide impact.',
 'ball:solar':'A golden sun ball with expanding flare rings and a rising impact.',
 'ball:cosmic':'A star-patterned ball with violet spiral trails and a curved knockback.',
 'scooter:mint':'A mint cruiser with a broad deck and a fresh turquoise trail.',
 'scooter:stunt':'A compact trick scooter with gold sparks and playful spins.',
 'scooter:comet':'A sporty scooter with an lavender comet trail.',
 'bike:bmx':'A compact BMX with coral trail effects and airborne tricks.',
 'bike:road':'A slim road racer with a bright blue trail.',
 'bike:mountain':'A rugged mountain bike with a leafy green trail.',
 'moped:retro':'A vintage moped with a peach trail.',
 'moped:delivery':'An island delivery ride with a cargo box and a turquoise trail.',
 'moped:sport':'A sporty moped with a pink trail and sharp tricks.',
 'jetpack:helicopter':'A compact backpack with an overhead rotor. Fly, spin and glide above the island.',
 'jetpack:ironman':'Red-and-gold armor with an oversized glowing-eyed helmet and hand and boot repulsors. Surge forward or launch skyward.',
 'jetpack:rocketboard':'Surf above the rooftops with a rocket trail, forward flip and climbing corkscrew.',
 'jetpack:mini-plane':'A miniature propeller plane with wing trails, barrel rolls and a looping climb.'
};
/** Stable IDs reference the existing equipment slots; there is no second inventory save. */
export const STORE_ITEMS:StoreItem[]=STORE_CATEGORIES.flatMap(({id:category})=>CUSTOMIZATION_OPTIONS[category].map(option=>({id:`${category}:${option.id}`,category,option,mode:category==='ball'?'walk':category,description:itemDescriptions[`${category}:${option.id}`]??descriptions[category]})));
export function equipStoreItem(value:CharacterCustomization,id:string):{value:CharacterCustomization;mode:TravelMode}|null{
 const item=STORE_ITEMS.find(item=>item.id===id);if(!item)return null;
 return {value:{...value,[item.category]:item.option.id},mode:item.mode};
}
