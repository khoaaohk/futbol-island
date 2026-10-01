/**
 * The farmer's share (Sep 30 2026, docs/island-jobs.md §6): unloading a Harvest day basket at the Coral Cay farm stand pays the
 * job as usual AND puts a small share of what you picked into your market basket, to sell at the farm stand or at Rosa's.
 * Economy: the job pay stays the main reward. The share follows the job's pay tier (3 / 2 / 1 items, ≈ 7 / 5 / 2 coins at full
 * price), and selling it goes through the market's daily allowance and the Training meter like any produce
 * (docs/economy/ECONOMY_UPDATE_2026-09-29.md §8). Pure: no storage; the market grants it once per shift key.
 */
import type {JobId,PayTier} from './jobEconomy';
export type ShareLine={id:string;count:number};
/** Used when a shift's picks are unknown (e.g. an old save or a test): the farm's crops in rotation. */
export const HARVEST_SHARE_CYCLE=['mango','banana','orange','sweet-potato','tomato','pepper','greens'] as const;
export const HARVEST_SHARE_COUNT:Record<PayTier,number>={full:3,half:2,tip:1};
/** The gardener's share (Garden shift, 30 Sep 2026, docs/island-jobs.md §13): smaller than the farm's, because the garden is also
 *  free to pick outside a shift. 2 / 1 / 1 items (≤ 6 coins at full price, under the 10-coin pay). */
export const GARDEN_SHARE_COUNT:Record<PayTier,number>={full:2,half:1,tip:1};
export const GARDEN_SHARE_CYCLE=['strawberry','tomato','orange','carrot','cherry'] as const;
const SHARES:Partial<Record<JobId,{count:Record<PayTier,number>;cycle:readonly string[]}>>={'farm-harvest':{count:HARVEST_SHARE_COUNT,cycle:HARVEST_SHARE_CYCLE},'garden-shift':{count:GARDEN_SHARE_COUNT,cycle:GARDEN_SHARE_CYCLE}};
/**
 * The goods a finished shift adds to the basket: `count` of the items actually picked (`bag`, in pick order), spread across the
 * bag so the share is a mix, rotated by `lifetimeBefore` (shifts finished before this one) so repeat shifts vary.
 */
export function jobShare(id:JobId,tier:PayTier,lifetimeBefore:number,bag:readonly string[]=[]):ShareLine[]{
 const kind=SHARES[id];if(!kind)return [];
 const n=kind.count[tier],pool=bag.length?bag:kind.cycle,life=Math.max(0,Math.floor(lifetimeBefore)),out:ShareLine[]=[];
 // Walk the bag from a rotating start and prefer goods not in the share yet, so it is a mix (at most 8 coins at full price).
 const order=pool.map((_,k)=>pool[(life*kind.count.full+k)%pool.length]),picks:string[]=[];
 for(const good of order)if(picks.length<n&&!picks.includes(good))picks.push(good);
 for(const good of order)if(picks.length<n)picks.push(good);
 for(const good of picks){const line=out.find(l=>l.id===good);if(line)line.count++;else out.push({id:good,count:1});}
 return out;
}
