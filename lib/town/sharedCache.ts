// Server only: a small key-value store shared by every function instance, for the score/news feeds that the cron route
// (app/api/cron/scores) refreshes and the user routes read.
//
// On Vercel it is the platform's Runtime Cache via getCache() from @vercel/functions (keys namespaced and hashed with djb2).
//
// Locally (next dev / next start), in tests, or if the Runtime Cache is not enabled, it degrades to a per-process Map,
// which behaves like the old per-instance cache.
import {getCache} from '@vercel/functions';
export type SharedStore={kind:'runtime'|'memory';get<T>(key:string):Promise<T|undefined>;set(key:string,value:unknown,ttlSeconds:number):Promise<void>};
type RuntimeCache={get(key:string):Promise<unknown>;set(key:string,value:unknown,options?:{ttl?:number;tags?:string[];name?:string}):Promise<unknown>};
const NAMESPACE='futbol-island',TAG='island-feeds';
/** djb2 (as in @vercel/functions' default key hash). */
function hashKey(key:string){let hash=5381;for(let i=0;i<key.length;i++)hash=hash*33^key.charCodeAt(i);return `${NAMESPACE}$${(hash>>>0).toString(16)}`;}
function runtimeCache():RuntimeCache|undefined{
 // Only on Vercel: off-platform getCache() hands back its own in-memory cache, which we already cover with memoryStore.
 if(!process.env.VERCEL)return undefined;
 try{return getCache({keyHashFunction:hashKey}) as RuntimeCache;}catch{return undefined;}
}
const memory=new Map<string,{value:unknown;expires:number}>();
const memoryStore:SharedStore={kind:'memory',
 async get<T>(key:string){const hit=memory.get(key);if(!hit)return undefined;if(hit.expires<=Date.now()){memory.delete(key);return undefined;}return hit.value as T;},
 async set(key:string,value:unknown,ttlSeconds:number){memory.set(key,{value,expires:Date.now()+ttlSeconds*1000});},
};
let override:SharedStore|undefined;
/** Tests: swap in a fake store (or pass nothing to go back to the automatic choice). */
export function setSharedStore(store?:SharedStore){override=store;}
/** Never throws: a store failure reads as a miss and a failed write is dropped, so callers fall back to a live fetch. */
export function sharedStore():SharedStore{
 if(override)return override;
 const cache=runtimeCache();if(!cache)return memoryStore;
 return {kind:'runtime',
  async get<T>(key:string){try{const value=await cache.get(key);return (value??undefined) as T|undefined;}catch{return undefined;}},
  async set(key:string,value:unknown,ttlSeconds:number){try{await cache.set(key,value,{ttl:ttlSeconds,tags:[TAG],name:key});}catch{}},
 };
}
