/**
 * Shared sellable-goods registry for the East Coast Farmers Market (island jobs + fishing agents).
 * Each agent owns its own section below; keep the other sections intact when editing.
 * Prices are in-game coins (never real money). Selling rules and the daily soft cap live in ./market.ts.
 * Economy reference: docs/island-jobs.md ("Market prices").
 */
export type GoodKind='produce'|'fish';
export type Good={
 id:string;kind:GoodKind;name:string;plural:string;
 /** Coins per item at full price. */
 price:number;
 /** Swatch for HUD chips and 3D instances (hex). */
 color:string;
 /** One-line football lesson shown when the good is gathered or sold (AGENTS.md: every feature teaches football). */
 lesson:string;
 source?:string;
};

// --- Produce (island jobs agent: lib/town/jobs/*, community garden) ---
export const PRODUCE_GOODS:Good[]=[
 {id:'orange',kind:'produce',name:'Orange',plural:'Oranges',price:3,color:'#f08a2c',
  lesson:'Half-time oranges are mostly water, so they rehydrate you, plus quick natural sugar for energy.',
  source:'https://theconversation.com/how-and-why-did-half-time-oranges-in-junior-sports-become-a-tradition-234919'},
 {id:'cherry',kind:'produce',name:'Cherries',plural:'Cherries',price:3,color:'#b3263a',
  lesson:'Bournemouth are "the Cherries": cherry orchards grew beside their Dean Court ground.',
  source:'https://en.wikipedia.org/wiki/AFC_Bournemouth'},
 {id:'strawberry',kind:'produce',name:'Strawberry',plural:'Strawberries',price:2,color:'#e0413f',
  lesson:'Fruit is carbohydrate, your muscles\' main sprint fuel. Snack on it before training.'},
 {id:'tomato',kind:'produce',name:'Tomato',plural:'Tomatoes',price:2,color:'#d9502e',
  lesson:'Colourful veg gives vitamins and minerals that help you recover between matches.'},
 {id:'carrot',kind:'produce',name:'Carrot',plural:'Carrots',price:2,color:'#ee9a3a',
  lesson:'Recover after training with a real meal: veg, carbs, protein and water.'},
 // Coral Cay Farm (Sep 30 2026): the Harvest day crops; the farmer's share of each harvest goes to the basket (lib/town/jobs/harvestShare.ts). Lessons ≤ 85 chars, from the
 // FIFA nutrition guide the Harvest day job cites (carbohydrate = main fuel; fruit/veg = vitamins; drink water, more in the heat).
 {id:'banana',kind:'produce',name:'Banana',plural:'Bananas',price:2,color:'#f5d94a',
  lesson:'A banana is easy carbohydrate: a good small snack an hour or two before you play.',
  source:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 {id:'mango',kind:'produce',name:'Mango',plural:'Mangoes',price:3,color:'#f0a23a',
  lesson:'Mango gives carbs for running and vitamin C, which helps keep you fit to play.',
  source:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 {id:'pepper',kind:'produce',name:'Pepper',plural:'Peppers',price:2,color:'#d9534a',
  lesson:'Peppers are full of vitamin C, which helps keep your body healthy for training.',
  source:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 {id:'greens',kind:'produce',name:'Leafy greens',plural:'Leafy greens',price:2,color:'#6fae4f',
  lesson:'Leafy greens give iron, which helps your blood carry oxygen to running muscles.',
  source:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
 {id:'sweet-potato',kind:'produce',name:'Sweet potato',plural:'Sweet potatoes',price:2,color:'#b9774a',
  lesson:'Sweet potatoes are starchy carbs: great in your pre-match meal 3–4 hours before.',
  source:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'},
];

// --- Fish (fishing agent: lib/town/fishing/*) ---
// Generated from the fishing catalogue (species, fixed prices and the verified club fact each catch teaches).
import {FISH} from '../fishing/fishCatalog';
export const FISH_GOODS:Good[]=FISH.map(f=>({id:f.id,kind:'fish',name:f.name,plural:f.plural,price:f.price,color:f.color,lesson:`${f.club.name}: ${f.club.fact}`,source:f.club.source}));

export const GOODS:Good[]=[...PRODUCE_GOODS,...FISH_GOODS];
export const goodById=(id:string)=>GOODS.find(g=>g.id===id);
export const isGood=(id:unknown):id is string=>typeof id==='string'&&GOODS.some(g=>g.id===id);
