/**
 * Kit Shop purchases (Oct 12 2026). Designs from the three studios (lib/shop/jersey.ts, boots.ts, ball.ts) are bought with in-game
 * coins only, through the shared wallet's idempotent spend (lib/arcade/arcadeWallet.ts, never real money). One spend id per design
 * (`shop:<kind>:<hash of the design>`), so a double tap, a retry or buying the same design again can never charge twice.
 *
 * Owned designs live under SHOP_OWNED_KEY (synced with the save code, lib/saves/snapshot.ts): the last bought design of each kind
 * is the one "wearing". Owner decision Oct 26 2026 (replacing Oct 12's "Don't show on player"): what you wear shows on the
 * island player and ball, read only through lib/shop/islandGear.ts. "Take off" clears a kind (wearing[kind] absent).
 * Pure apart from the injected storage and spend, so tests/shop-room.cjs runs it in Node.
 */
export const SHOP_OWNED_KEY='fi2-shop-owned-v1';
export const OWNED_LIMIT=36;
export type ShopKind='jersey'|'boots'|'ball';
export const SHOP_KINDS:readonly ShopKind[]=['jersey','boots','ball'];
export const KIND_LABEL:Record<ShopKind,string>={jersey:'Jersey',boots:'Boots',ball:'Ball'};
export type OwnedItem={id:string;kind:ShopKind;name:string;price:number;design:unknown;at:number};
export type ShopOwned={v:1;items:OwnedItem[];wearing:Partial<Record<ShopKind,string>>};
type KV=Pick<Storage,'getItem'|'setItem'>;
export type SpendFn=(id:string,cost:number,reason:string)=>Promise<{ok:true}|{ok:false;reason:string}>;

const ls=():KV|null=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export const emptyOwned=():ShopOwned=>({v:1,items:[],wearing:{}});
const isKind=(k:unknown):k is ShopKind=>k==='jersey'||k==='boots'||k==='ball';
/** FNV-1a over the design's JSON: a short, stable id for the same design on every device. */
export function designHash(design:unknown):string{const s=JSON.stringify(design)??'';let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return (h>>>0).toString(36);}
export const purchaseId=(kind:ShopKind,design:unknown)=>`shop:${kind}:${designHash(design)}`;

export function parseOwned(raw:string|null):ShopOwned{
 try{const v=JSON.parse(raw??'null') as Partial<ShopOwned>|null;if(!v||v.v!==1||!Array.isArray(v.items))return emptyOwned();
  const items=v.items.filter((i):i is OwnedItem=>!!i&&typeof i.id==='string'&&i.id.length<180&&isKind(i.kind)&&Number.isInteger(i.price)&&i.price>0&&typeof i.at==='number')
   .map(i=>({id:i.id,kind:i.kind,name:String(i.name??KIND_LABEL[i.kind]).slice(0,24),price:i.price,design:i.design,at:i.at})).slice(-OWNED_LIMIT);
  const wearing:ShopOwned['wearing']={};for(const k of SHOP_KINDS){const id=(v.wearing as Record<string,unknown>|undefined)?.[k];if(typeof id==='string'&&items.some(i=>i.id===id))wearing[k]=id;}
  return {v:1,items,wearing};}catch{return emptyOwned();}
}
export function loadOwned(store:KV|null=ls()):ShopOwned{try{return parseOwned(store?.getItem(SHOP_OWNED_KEY)??null);}catch{return emptyOwned();}}
/**
 * Size budget (Oct 12 2026): designs can carry drawings, and the save sync stops syncing a key over 256 KB (lib/saves/snapshot.ts).
 * Keep the list under OWNED_BUDGET characters by dropping the oldest items that are not being worn; the newest always stay.
 */
export const OWNED_BUDGET=160_000;
export function fitOwned(owned:ShopOwned):ShopOwned{
 let items=owned.items.slice();const worn=new Set(Object.values(owned.wearing));
 const size=()=>JSON.stringify({...owned,items}).length;
 while(items.length>1&&size()>OWNED_BUDGET){const i=items.findIndex(x=>!worn.has(x.id));if(i<0||i===items.length-1)break;items.splice(i,1);}
 const wearing:ShopOwned['wearing']={};for(const [k,id] of Object.entries(owned.wearing))if(items.some(x=>x.id===id))(wearing as Record<string,string>)[k]=id as string;
 return {...owned,items,wearing};
}
/** Same-tab "what you wear changed" signal for the island (lib/shop/islandGear.ts); storage events only reach other tabs. */
export const SHOP_GEAR_EVENT='fi-shop-gear';
export function writeOwned(owned:ShopOwned,store:KV|null=ls()):boolean{try{store?.setItem(SHOP_OWNED_KEY,JSON.stringify(fitOwned(owned)));
 try{if(typeof window!=='undefined'&&typeof Event!=='undefined')window.dispatchEvent(new Event(SHOP_GEAR_EVENT));}catch{/* no window (tests) */}
 return !!store;}catch{return false;}}
export const ownsDesign=(owned:ShopOwned,kind:ShopKind,design:unknown)=>owned.items.some(i=>i.id===purchaseId(kind,design));

export type BuyResult={ok:true;item:OwnedItem;already:boolean}|{ok:false;reason:string};
/**
 * Buy a design: validate the price, spend the coins (idempotent per design), then record it as owned and wearing.
 * Already owned: no charge, it just becomes the one you wear.
 */
export async function buyDesign(kind:ShopKind,design:unknown,price:number,spend:SpendFn,{name,store=ls(),now=Date.now()}:{name?:string;store?:KV|null;now?:number}={}):Promise<BuyResult>{
 if(!isKind(kind))return {ok:false,reason:'That is not something the Kit Shop sells.'};
 if(!Number.isInteger(price)||price<1||price>10000)return {ok:false,reason:'That price does not look right.'};
 const id=purchaseId(kind,design),owned=loadOwned(store),had=owned.items.find(i=>i.id===id);
 if(had){writeOwned({...owned,wearing:{...owned.wearing,[kind]:id}},store);return {ok:true,item:had,already:true};}
 const paid=await spend(id,price,`Kit Shop · ${KIND_LABEL[kind]}`);
 if(!paid.ok)return paid;
 const item:OwnedItem={id,kind,name:(name??'').trim().slice(0,24)||`My ${KIND_LABEL[kind].toLowerCase()}`,price,design,at:now};
 const latest=loadOwned(store);
 const items=[...latest.items.filter(i=>i.id!==id),item].slice(-OWNED_LIMIT);
 writeOwned({v:1,items,wearing:{...latest.wearing,[kind]:id}},store);
 return {ok:true,item,already:false};
}
