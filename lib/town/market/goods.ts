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
  lesson:'Half-time oranges are a youth football tradition: they are mostly water, so they help you rehydrate, and their natural sugar gives quick energy for the second half.',
  source:'https://theconversation.com/how-and-why-did-half-time-oranges-in-junior-sports-become-a-tradition-234919'},
 {id:'cherry',kind:'produce',name:'Cherries',plural:'Cherries',price:3,color:'#b3263a',
  lesson:'AFC Bournemouth are nicknamed "the Cherries": cherry orchards grew beside their Dean Court ground when the club moved there in 1910, and they have long worn cherry-red stripes.',
  source:'https://en.wikipedia.org/wiki/AFC_Bournemouth'},
 {id:'strawberry',kind:'produce',name:'Strawberry',plural:'Strawberries',price:2,color:'#e0413f',
  lesson:'Fruit gives carbohydrates, the main fuel your muscles use for sprints, so a fruit snack before training helps you keep running.'},
 {id:'tomato',kind:'produce',name:'Tomato',plural:'Tomatoes',price:2,color:'#d9502e',
  lesson:'Colourful vegetables give vitamins and minerals that help your body recover and grow between matches.'},
 {id:'carrot',kind:'produce',name:'Carrot',plural:'Carrots',price:2,color:'#ee9a3a',
  lesson:'Players recover best with a real meal after training: vegetables, some carbohydrate and protein, plus water.'},
];

// --- Fish (fishing agent: lib/town/fishing/*) ---
// Generated from the fishing catalogue (species, fixed prices and the verified club fact each catch teaches).
import {FISH} from '../fishing/fishCatalog';
export const FISH_GOODS:Good[]=FISH.map(f=>({id:f.id,kind:'fish',name:f.name,plural:f.plural,price:f.price,color:f.color,lesson:`${f.club.name}: ${f.club.fact}`,source:f.club.source}));

export const GOODS:Good[]=[...PRODUCE_GOODS,...FISH_GOODS];
export const goodById=(id:string)=>GOODS.find(g=>g.id===id);
export const isGood=(id:unknown):id is string=>typeof id==='string'&&GOODS.some(g=>g.id===id);
