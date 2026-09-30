'use client';
/**
 * Browser adapter between the outdoor drink machines (lib/town/drinkMachines.ts) and the Konbini consumable ledger
 * (lib/konbini/foodStore.ts, the Konbini agent's STABLE API: repeat-safe purchases with one idempotent wallet spend per purchase
 * id, per-bucket daily limits, the Snacks pouch and the Konbini Collection). This file is the only place the drink machine
 * touches that module, so a rename there is a one-line change here.
 *
 * Drinks use their own daily bucket (DRINK_LIMIT: 3 a day), not the food "tummy full" bucket.
 */
import {buyFood,resolveFood,keepFood,readKonbini,newPurchaseId,useKonbini} from '../konbini/foodStore';
import {boughtToday,pouch,POUCH_SIZE,type BuyFoodResult} from '../konbini/food';
import {localPlayDay} from './dailyPlay';
import {DRINKS_FULL,DRINK_LIMIT,drink,registerDrinks} from './drinkMachines';

registerDrinks();
export {newPurchaseId,useKonbini,POUCH_SIZE};
/** Buys one drink. Pass the SAME purchase id for a retry or a double tap: the wallet charges it once. */
export async function buyDrink(id:string,purchaseId:string):Promise<BuyFoodResult>{
 if(!drink(id))return {ok:false,reason:'That drink isn’t in this machine.'};
 const result=await buyFood(id,purchaseId);
 return !result.ok&&result.limit?{...result,reason:DRINKS_FULL}:result;
}
/** After the reveal: drink it now, or keep it in the Snacks pouch (while there is room). */
export const chooseDrinkFate=(purchaseId:string,fate:'eat'|'pouch')=>resolveFood(purchaseId,fate);
/** The reveal was dismissed without a choice: the pouch if there is room, else drunk now (never lost). */
export const keepDrink=(purchaseId:string)=>keepFood(purchaseId);
export const drinksBoughtToday=(state=readKonbini())=>boughtToday(state,Date.now(),localPlayDay,DRINK_LIMIT.key);
export const pouchCount=(state=readKonbini())=>pouch(state).length;
