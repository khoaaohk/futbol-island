'use client';
/** Browser instances: island jobs + farmers market paying into the shared arcade wallet (lib/arcade/arcadeWallet.ts). */
import {ARCADE_COIN_CAPS,creditRun,readArcadeWallet,type ArcadeCoinGame} from '@/lib/arcade/arcadeWallet';
import {createJobWallet} from './jobWallet';
import {createMarket,MARKET_STORAGE_KEY} from '../market/market';
export const islandJobWallet=createJobWallet({
 creditRun:(id,game,target,reason)=>creditRun(id,game as ArcadeCoinGame,target,reason),
 // Vending purchases and arcade plays now debit the same wallet.
 balance:()=>readArcadeWallet().balance,
 caps:ARCADE_COIN_CAPS as unknown as Record<string,number>,
});
export const islandMarket=createMarket({
 read:()=>JSON.parse(localStorage.getItem(MARKET_STORAGE_KEY)??'null'),
 write:v=>localStorage.setItem(MARKET_STORAGE_KEY,JSON.stringify(v)),
 credit:(id,amount,reason)=>islandJobWallet.credit(id,amount,reason),
});
