/**
 * Outdoor drink machines (user, Sep 29 2026: "Outside, add a vending machine next to the stores for different types of drinks.
 * The drinks will show how hydration helps the body ... There should only be two drink vending machines.").
 *
 * Pure data + rules, no React and no three.js (safe for tests and any page):
 * - exactly TWO machines, each standing side by side with its Konbini's vending machine (same facing, a small gap), placed from
 *   that machine's spot, never from fixed coordinates (`drinkSpotBeside`, used by lib/town/vendingCatalog.ts);
 * - six drinks per machine (all ids unique; water and a sports drink are on both menus but each machine has its own can), each
 *   with its Japanese name and ONE short, kid-level hydration line checked against the sources below (DRINK_SOURCES);
 * - drinks are Konbini consumables (lib/konbini/food.ts STABLE API): repeat-purchasable with an idempotent wallet key, their own
 *   daily limit (DRINKS_PER_DAY, separate from the food "tummy full" limit), the Snacks pouch, and a "Drink machines" group on the
 *   backpack's Konbini Collection. `registerDrinks()` runs at module load and is idempotent.
 * Prices and the collection pace: docs/economy/ECONOMY_UPDATE_2026-09-29.md §"Drink machines"; tests/drink-machines.cjs and
 * tests/economy.cjs. Visuals: lib/graphics/drinkArt.ts (bottles/cans, reveal layers) and the shared machine mesh.
 *
 * Wording rule: only what the sources say, in kid words. No medical claims, no weight talk, no "energy drink" anything, generic
 * names only (no real brands).
 */
import {registerConsumables,registerCollectionGroup,type Consumable,type Source} from '../konbini/food';
// Reveal/tile art for the Backpack pouch and the Konbini Collection (code review finding 6). Both are plain canvas painters
// (no three.js, no DOM at import); drinkArt only imports types from here and foodArt, so there is no runtime cycle.
import {registerFoodLayers,drinkCellShadow} from '../konbini/foodArt';
import {drinkRevealLayers} from '../graphics/drinkArt';

export type DrinkMachineId='drinksplaza'|'drinkscay';
export const DRINK_MACHINE_IDS:readonly DrinkMachineId[]=['drinksplaza','drinkscay'];
export const isDrinkMachine=(id:string):id is DrinkMachineId=>(DRINK_MACHINE_IDS as readonly string[]).includes(id);

// ---- Sources (checked 29 Sep 2026) -----------------------------------------------------------------------------------------
export const DRINK_SOURCES={
 nhs:{title:'NHS · Water, drinks and hydration',url:'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/'},
 nhsDehydration:{title:'NHS · Dehydration (symptoms)',url:'https://www.nhs.uk/conditions/dehydration/'},
 aap:{title:'American Academy of Pediatrics, HealthyChildren.org · Choose Water for Healthy Hydration',url:'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Choose-Water-for-Healthy-Hydration.aspx'},
 sda:{title:'Sports Dietitians Australia · Hydration in Junior Sport',url:'https://www.sportsdietitians.com.au/factsheets/children/hydration-junior-sport/'},
 fifa:{title:'FIFA · Nutrition for Football',url:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 cleveland:{title:'Cleveland Clinic · The health benefits of coconut water',url:'https://health.clevelandclinic.org/the-health-benefits-of-coconut-water'},
} satisfies Record<string,Source>;
export type DrinkSourceId=keyof typeof DRINK_SOURCES;

// ---- Drinks -----------------------------------------------------------------------------------------------------------------
export type DrinkShape='bottle'|'can'|'carton'|'tallcan';
/** Generic package art (lib/graphics/drinkArt.ts): body/liquid colour, label band, cap, and a short label word. */
export type DrinkArt={shape:DrinkShape;body:string;label:string;ink:string;cap:string;word:string};
export type Drink=Consumable&{jp:string;
 /** Hiragana reading of a kanji name, for kids learning it ('' when the name is already katakana). */
 reading:string;machine:DrinkMachineId;
 /** Japanese machines mark every button: つめた～い (cold, blue) or あったか～い (hot, red). */
 temp:'cold'|'hot';art:DrinkArt;
 /** The hydration line (also `note`, so eating it from the Snacks pouch repeats the lesson). */
 lesson:string;sources:DrinkSourceId[]};
/** Separate from the Konbini food limit (FOOD_PER_DAY): three drinks a day across both machines. */
export const DRINKS_PER_DAY=3;
export const DRINK_LIMIT={key:'drinks',perDay:DRINKS_PER_DAY} as const;
export const DRINKS_FULL="You've had plenty to drink from the machines today. Top up with free tap water, and come back tomorrow!";
export const DRINK_PRICE_RANGE={min:3,max:6} as const;

type Row=Omit<Drink,'limit'|'note'|'id'|'machine'>&{key:string};
const d=(machine:DrinkMachineId,suffix:string,rows:Row[]):Drink[]=>rows.map(({key,...r})=>({...r,id:`drink-${key}-${suffix}`,machine,note:r.lesson,limit:{...DRINK_LIMIT}}));

export const DRINKS:Drink[]=[
 // Island Square: a classic Japanese street machine. The bottom-right button is the warm row (あったか～い).
 ...d('drinksplaza','square',[
  {key:'water',label:'Water',jp:'水',reading:'みず',price:3,group:'hydration',temp:'cold',blurb:'Cold, plain water in a clear bottle.',
   lesson:'Water keeps your blood flowing and your body cool. Drink before, during and after you play.',sources:['sda','aap'],
   art:{shape:'bottle',body:'#cfeefe',label:'#2a86d1',ink:'#ffffff',cap:'#2a86d1',word:'WATER'}},
  {key:'greentea',label:'Green tea',jp:'緑茶',reading:'りょくちゃ',price:3,group:'hydration',temp:'cold',blurb:'Unsweetened bottled green tea.',
   lesson:'Sip before you feel thirsty. Pack a full bottle in your kit bag and top it up at every break.',sources:['aap','sda'],
   art:{shape:'bottle',body:'#bcd98a',label:'#2f7a3c',ink:'#f4ffe6',cap:'#2f7a3c',word:'TEA'}},
  {key:'mugicha',label:'Barley tea',jp:'麦茶',reading:'むぎちゃ',price:3,group:'hydration',temp:'cold',blurb:'Mugicha: roasted barley tea, a Japanese summer favourite.',
   lesson:'When you don’t drink enough, running feels harder and it gets tough to concentrate. Keep sipping.',sources:['sda','nhsDehydration'],
   art:{shape:'bottle',body:'#c98a4b',label:'#f3d27a',ink:'#5a3310',cap:'#8a5424',word:'BARLEY'}},
  {key:'milk',label:'Milk',jp:'牛乳',reading:'ぎゅうにゅう',price:4,group:'protein',temp:'cold',blurb:'A small carton of cold milk.',
   lesson:'Water and milk are the best drinks for kids. After a game, milk gives you fluid plus protein for your muscles.',sources:['nhs','aap','fifa'],
   art:{shape:'carton',body:'#f7f7f2',label:'#3d7fd6',ink:'#ffffff',cap:'#3d7fd6',word:'MILK'}},
  {key:'sports',label:'Sports drink',jp:'スポーツドリンク',reading:'',price:5,group:'hydration',temp:'cold',blurb:'A generic sports drink with a little sugar and salt.',
   lesson:'Sports drinks are for long, hot, hard sessions over an hour. For everyday training, water is all you need.',sources:['aap','sda'],
   art:{shape:'bottle',body:'#dff3ff',label:'#1d5fb8',ink:'#ffffff',cap:'#ffffff',word:'SPORT'}},
  {key:'cocoa',label:'Hot cocoa',jp:'ホットココア',reading:'',price:5,group:'treat',temp:'hot',blurb:'A warm can of cocoa milk from the あったか～い (hot) row.',
   lesson:'Cocoa is milk with added sugar: a warm treat on a cold day. Plain milk and water are the everyday drinks.',sources:['aap','nhs'],
   art:{shape:'can',body:'#7a4a2c',label:'#e8b36a',ink:'#4a2512',cap:'#c9ced4',word:'COCOA'}},
 ]),
 // Coral Cay: a tropical beach machine.
 ...d('drinkscay','cay',[
  {key:'coconut',label:'Coconut water',jp:'ココナッツウォーター',reading:'',price:5,group:'hydration',temp:'cold',blurb:'Light coconut water in a tall can.',
   lesson:'Coconut water has potassium, a mineral your body uses. Still, plain water is the best way to hydrate every day.',sources:['cleveland','aap'],
   art:{shape:'tallcan',body:'#f1f5ee',label:'#6b4a2f',ink:'#ffffff',cap:'#c9ced4',word:'COCO'}},
  {key:'water',label:'Water',jp:'水',reading:'みず',price:3,group:'hydration',temp:'cold',blurb:'Cold, plain water in a clear bottle.',
   lesson:'Check your pee: pale yellow means you’re well hydrated. Dark yellow means drink some water.',sources:['nhs','aap'],
   art:{shape:'bottle',body:'#d3f5f2',label:'#1a9e97',ink:'#ffffff',cap:'#1a9e97',word:'WATER'}},
  {key:'sports',label:'Sports drink',jp:'スポーツドリンク',reading:'',price:5,group:'hydration',temp:'cold',blurb:'A generic sports drink with a little sugar and salt.',
   lesson:'Sweat takes water and a little salt out of your body. On a hot day of play over an hour, a sports drink plus water can help.',sources:['aap','sda'],
   art:{shape:'bottle',body:'#fff6c9',label:'#f08a24',ink:'#ffffff',cap:'#ffffff',word:'SPORT'}},
  {key:'pineapple',label:'Pineapple juice',jp:'パイナップルジュース',reading:'',price:4,group:'treat',temp:'cold',blurb:'A small carton of 100% pineapple juice.',
   lesson:'Juice is sweet and sugary. Keep it to one small glass a day with a meal, and make water your main drink.',sources:['nhs','aap'],
   art:{shape:'carton',body:'#ffe066',label:'#3d9a4a',ink:'#ffffff',cap:'#3d9a4a',word:'PINE'}},
  {key:'lemon',label:'Lemon water',jp:'レモン水',reading:'れもんすい',price:4,group:'hydration',temp:'cold',blurb:'Plain water with a squeeze of lemon, no added sugar.',
   lesson:'Sweating cools you down, so drink to replace that water. A slice of lemon adds flavour without sugar.',sources:['sda','nhs','aap'],
   art:{shape:'bottle',body:'#f7fbd6',label:'#e3c21a',ink:'#4b4200',cap:'#e3c21a',word:'LEMON'}},
  {key:'yogurtsoda',label:'Yoghurt soda',jp:'ヨーグルトソーダ',reading:'',price:6,group:'treat',temp:'cold',blurb:'A fizzy, sweet, yoghurt-flavoured soda.',
   lesson:'Fizzy sweet drinks are a sometimes treat: the sugar is hard on your teeth. Water is what refills you after play.',sources:['nhs','sda'],
   art:{shape:'can',body:'#e9f0ff',label:'#5b7fe0',ink:'#ffffff',cap:'#c9ced4',word:'SODA'}},
 ]),
];
export const drink=(id:string)=>DRINKS.find(x=>x.id===id);
export const drinksAt=(machine:DrinkMachineId)=>DRINKS.filter(x=>x.machine===machine);
export const drinkSources=(x:Drink)=>x.sources.map(s=>DRINK_SOURCES[s]);

// ---- Machines ---------------------------------------------------------------------------------------------------------------
/** The machine sheet, merged into VENDING_MACHINES by lib/town/vendingCatalog.ts. `beside` is the id of the store's machine. */
export const DRINK_MACHINE_INFO:Record<DrinkMachineId,{beside:'plaza'|'caykonbini';name:string;shop:string;place:string;color:string;light:string;ink:string;lesson:string}>={
 drinksplaza:{beside:'plaza',name:'Drinks · Island Square',shop:'Island Square Konbini',place:'beside the Konbini’s vending machine, under the east end of the canopy',
  color:'#2d6fc7',light:'#eef6ff',ink:'#0b2a52',lesson:'Hydration helps you play: drink before, during and after the game.'},
 drinkscay:{beside:'caykonbini',name:'Drinks · Coral Cay',shop:'Coral Cay Konbini',place:'beside the Coral Cay Konbini’s vending machine, by the roundabout',
  color:'#1b9ad0',light:'#e6f8ff',ink:'#06324a',lesson:'Hot island days mean more sweat: water first, and check your pee is pale.'},
};
/** Cabinet width on the ground (VENDING_SIZE.w × VENDING_SCALE = 1.3 × 1.3) and the gap between the two cabinets. */
export const CABINET_WIDTH=1.69,DRINK_GAP=.12;
/**
 * The drink machine's spot: side by side with the store's machine, on your right as you face its glass (east for the
 * south-facing Konbinis, away from the sliding doors), with the same facing and a 12 cm gap.
 */
export function drinkSpotBeside(machine:{x:number;z:number;yaw:number}):{x:number;z:number;yaw:number}{
 // The glass faces (sin yaw, cos yaw); a player standing at the glass has (cos yaw, −sin yaw) on their right: +x for yaw 0.
 const step=CABINET_WIDTH+DRINK_GAP,rx=Math.cos(machine.yaw),rz=-Math.sin(machine.yaw);
 const r=(v:number)=>Math.round(v*100)/100;
 return {x:r(machine.x+rx*step),z:r(machine.z+rz*step),yaw:machine.yaw};
}

// ---- Konbini consumables + collection (idempotent) -------------------------------------------------------------------------
export const DRINK_COLLECTION_GROUP={id:'drink-machines',label:'Drink machines',
 items:DRINKS.map(x=>({id:x.id,label:x.label,jp:x.jp,hint:`From the ${DRINK_MACHINE_INFO[x.machine].name} machine, outside the ${DRINK_MACHINE_INFO[x.machine].shop}`}))};
let registered=false;
export function registerDrinks(){
 if(registered)return;registered=true;
 registerConsumables(DRINKS.map(({id,label,jp,price,group,blurb,note,limit})=>({id,label,jp,price,group,blurb,note,limit})));
 registerCollectionGroup(DRINK_COLLECTION_GROUP);
 for(const d of DRINKS)registerFoodLayers(d.id,drinkRevealLayers(d.art),drinkCellShadow(d.art));
}
registerDrinks();
