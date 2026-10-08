// Outdoor drink machines (user, Sep 29 2026; lib/town/drinkMachines.ts, docs/vending-machines.md "Drink machines"): exactly two
// machines, six drinks each with verified hydration lines and sources, prices and the daily limit, repeat-safe Konbini consumable
// purchases (one wallet charge per purchase id), the Snacks pouch, the "Drink machines" collection group, and heat rules.
// Placement next to the Konbini machines is checked in tests/vending-machines.cjs (2b). usage: node tests/drink-machines.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Promise,Error,console,
  require:id=>{if(!id.startsWith('.'))return require(id);const base=path.resolve(path.dirname(file),id);for(const f of [base+'.ts',base])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);throw new Error('Cannot resolve '+id);}});
 return mod.exports;
}
const D=load(path.join(root,'lib/town/drinkMachines.ts')),F=load(path.join(root,'lib/konbini/food.ts'));

// 1. Exactly two machines, six drinks each, unique ids that never clash with the Konbini menu.
{
 same([...D.DRINK_MACHINE_IDS],['drinksplaza','drinkscay']);
 for(const m of D.DRINK_MACHINE_IDS){assert.equal(D.drinksAt(m).length,6,m+' sells six drinks');assert(D.DRINK_MACHINE_INFO[m].lesson.length>20);}
 const ids=D.DRINKS.map(d=>d.id);assert.equal(new Set(ids).size,ids.length,'unique item ids');assert.equal(ids.length,12);
 for(const id of ids){assert(/^[a-z0-9-]{2,60}$/.test(id),id);assert(!F.foodItem(id),id+' does not clash with the Konbini menu');}
 // The requested menus (generic names only).
 const menu=m=>D.drinksAt(m).map(d=>d.label);
 same(menu('drinksplaza'),['Water','Green tea','Barley tea','Milk','Sports drink','Hot cocoa']);
 same(menu('drinkscay'),['Coconut water','Water','Sports drink','Pineapple juice','Lemon water','Yoghurt soda']);
 assert.equal(D.DRINKS.filter(d=>d.temp==='hot').map(d=>d.id).join(),'drink-cocoa-square','one warm can (the あったか～い row) at Island Square');
 const JP={'Water':'水','Green tea':'緑茶','Barley tea':'麦茶','Milk':'牛乳','Sports drink':'スポーツドリンク','Hot cocoa':'ホットココア','Coconut water':'ココナッツウォーター','Pineapple juice':'パイナップルジュース','Lemon water':'レモン水','Yoghurt soda':'ヨーグルトソーダ'};
 for(const d of D.DRINKS){assert.equal(d.jp,JP[d.label],d.id+' Japanese name');if(/[一-龯]/.test(d.jp))assert(/^[぀-ゟ]+$/.test(d.reading),d.id+' has a hiragana reading for its kanji');else assert.equal(d.reading,'');}
 const brands=/pocari|aquarius|calpis|coca|pepsi|gatorade|powerade|milo|ito ?en|oi ocha|suntory|kirin|asahi|vita ?coco|dole|yakult|georgia|boss|nestl|lipton|evian|volvic/i;
 for(const d of D.DRINKS)assert(!brands.test(`${d.label} ${d.blurb} ${d.art.word} ${d.lesson}`),d.id+' uses generic names only');
}
// 2. Teaching: one short kid-level hydration line per drink, each with reputable sources; no medical or weight claims.
{
 const hosts=['www.nhs.uk','www.healthychildren.org','www.sportsdietitians.com.au','digitalhub.fifa.com','health.clevelandclinic.org'];
 for(const s of Object.values(D.DRINK_SOURCES)){assert(s.url.startsWith('https://')&&hosts.includes(new URL(s.url).host),s.url);assert(s.title.length>5);}
 const lessons=new Set();
 for(const d of D.DRINKS){
  assert(d.lesson.length>=40&&d.lesson.length<=130,d.id+' hydration line is one short sentence or two: '+d.lesson.length);
  assert(!lessons.has(d.lesson),d.id+' teaches its own line');lessons.add(d.lesson);
  assert(d.sources.length>=1&&d.sources.every(s=>D.DRINK_SOURCES[s]),d.id+' cites its sources');
  assert(!/\b(cure|disease|weight|diet|calorie|medicine|prevents?)\b/i.test(d.lesson),d.id+' makes no medical or weight claims');
  assert.equal(d.note,d.lesson,'the pouch repeats the same lesson');
 }
 // The candidate facts the feature is built around are all taught somewhere.
 const all=[...lessons].join(' ');
 for(const re of [/before, during and after/,/cool/,/harder|concentrate/,/pale yellow/,/water is all you need/,/protein/,/potassium/])assert(re.test(all),'teaches '+re);
 const doc=read('docs/vending-machines.md');for(const s of Object.values(D.DRINK_SOURCES))assert(doc.includes(s.url),'doc cites '+s.url);
}
// 3. Prices, the separate daily limit, Konbini consumable registration and the collection group.
{
 for(const d of D.DRINKS){assert(Number.isInteger(d.price)&&d.price>=D.DRINK_PRICE_RANGE.min&&d.price<=D.DRINK_PRICE_RANGE.max,d.id+' price 3–6');
  same({...d.limit},{key:'drinks',perDay:3},'separate 3-a-day drinks bucket');
  const c=F.consumable(d.id);assert(c,d.id+' registered as a Konbini consumable');assert.equal(c.price,d.price);assert.equal(F.foodNote(d.id),d.lesson);}
 const g=F.collectionGroups().find(x=>x.id==='drink-machines');assert(g,'Drink machines group on the Konbini Collection page');assert.equal(g.label,'Drink machines');assert.equal(g.items.length,12);
 for(const i of g.items)assert(i.jp&&/machine/.test(i.hint),i.id+' has a where-to-find hint');
 D.registerDrinks();assert.equal(F.collectionGroups().filter(x=>x.id==='drink-machines').length,1,'registration is idempotent');
}
// 4. Repeat-safe purchases through the Konbini ledger: one charge per purchase id, 3 drinks a day (food keeps its own limit),
//    first purchase joins the collection, the Snacks pouch.
(async()=>{
 const DAY=86400000;let now=10*DAY+3600000,saved=null,coll=null,balance=100;const spends=new Map();
 const ledger=F.createKonbiniLedger({read:()=>saved,write:s=>{saved=JSON.parse(JSON.stringify(s));},now:()=>now,day:t=>String(Math.floor(t/DAY)),
  readCollection:()=>coll,writeCollection:s=>{coll=JSON.parse(JSON.stringify(s));},reward:async()=>0,lock:fn=>Promise.resolve().then(fn),
  spend:async(id,cost)=>{if(spends.has(id))return {ok:true};if(balance<cost)return {ok:false,reason:'Not enough coins'};balance-=cost;spends.set(id,cost);return {ok:true};}});
 const water=D.DRINKS.find(d=>d.id==='drink-water-square'),milk=D.DRINKS.find(d=>d.id==='drink-milk-square'),coco=D.DRINKS.find(d=>d.id==='drink-coconut-cay');
 let r=await ledger.buy(water.id,'p1');assert.equal(r.ok,true);assert.equal(r.firstTime,true,'first purchase joins the collection');assert.equal(balance,97);
 r=await ledger.buy(water.id,'p1');assert.equal(r.ok,true);assert.equal(balance,97,'a double tap / retry with the same purchase id is charged once');
 assert(coll.items[water.id],'collected');
 r=await ledger.buy(water.id,'p2');assert.equal(r.ok,true);assert.equal(r.firstTime,false,'repeat purchase: consumable, bought again, not re-collected');assert.equal(balance,94);
 assert.equal([...spends.keys()].every(k=>k.startsWith('konbini:food:drink-water-square:')),true,'idempotent wallet key per purchase');
 r=await ledger.buy(milk.id,'p3');assert.equal(r.ok,true);
 assert.equal(ledger.resolve('p3','pouch').ok,true,'Save to the Snacks pouch');assert.equal(ledger.resolve('p3','eat').ok,false,'already chosen');
 r=await ledger.buy(coco.id,'p4');assert.equal(r.ok,false,'a fourth drink today is refused');assert.equal(r.limit,true);assert.equal(balance,90,'refused drink costs nothing');
 r=await ledger.buy('onigiri-ume','f1','main');assert.equal(r.ok,true,'food keeps its own "tummy full" bucket');
 assert.equal(F.boughtToday(saved,now,t=>String(Math.floor(t/DAY)),'drinks'),3);
 // Backstop only (the tab closed mid-reveal): a drink still in hand settles into the pouch on the next purchase.
 assert.equal(saved.purchases.find(p=>p.id==='p1').fate,'pouch','an unchosen drink ends up in the Snacks pouch');
 now+=DAY;r=await ledger.buy(coco.id,'p5');assert.equal(r.ok,true,'the limit resets tomorrow');
 assert.equal(ledger.resolve('p5','pouch').ok,false,'the pouch holds three');assert.equal(ledger.resolve('p5','eat').note,coco.lesson,'drinking it now repeats its hydration line');
 // Dismissing the reveal without choosing (Done, Escape, another slot, closing the machine) resolves it AT ONCE (code review
 // finding 5): drunk now with its lesson when the pouch is full, otherwise saved to the pouch. Never left invisible "in hand".
 r=await ledger.buy(water.id,'p6');assert(r.ok);const full=ledger.keep('p6');
 assert.equal(full.fate,'eaten','pouch full: drunk now');assert.equal(full.note,water.lesson,'with its hydration line');assert.equal(saved.purchases.find(p=>p.id==='p6').fate,'eaten');
 assert(ledger.eatFromPouch('p2').ok);r=await ledger.buy(milk.id,'p7');assert(r.ok);const kept=ledger.keep('p7');
 assert.equal(kept.fate,'pouch','room in the pouch: saved');assert(F.pouch(saved).some(p=>p.id==='p7'),'the dismissed drink is in the Backpack pouch right away (no next purchase needed)');
 assert.equal(ledger.keep('p7').ok,false,'kept once');assert.equal(F.pouch(saved).length,3);
 const ctlSrc=read('components/DrinkMachine.tsx');
 assert.match(ctlSrc,/function dismissReveal\(\)\{const kept=keepInHand\(\)/,'the reveal dismiss keeps the drink');assert.match(ctlSrc,/keepDrink\(h\.purchaseId\)/);
 assert.match(ctlSrc,/return\(\)=>\{[^}]*keepInHand\(\);\};/,'closing the machine mid-purchase keeps it too');
 // The drinks have art in the Backpack pouch and the Konbini Collection (code review finding 6): foodArt.ts registers the drink layers when it loads.
 {const A=load(path.join(root,'lib/konbini/foodArt.ts'));for(const d of D.DRINKS){assert(A.FOOD_LAYERS[d.id]&&A.FOOD_LAYERS[d.id].length===4,d.id+' reveal layers registered');assert(A.finishedLayers(d.id,false).length>=3,d.id+' has a drawable tile');}}
 const poor=F.createKonbiniLedger({read:()=>null,write:()=>{},now:()=>now,day:t=>String(Math.floor(t/DAY)),readCollection:()=>null,writeCollection:()=>{},reward:async()=>0,lock:fn=>Promise.resolve().then(fn),spend:async()=>({ok:false,reason:'Not enough coins yet.'})});
 r=await poor.buy(water.id,'x');assert.equal(r.ok,false);assert.match(r.reason,/coins/);

 // 5. Wiring and heat: the drink face is only mounted while in use, no loops, the adapter is the only Konbini touch point.
 const ctl=read('components/DrinkMachine.tsx'),css=read('components/DrinkMachine.module.css'),shop=read('lib/town/drinkShop.ts'),town=read('components/Town.tsx');
 assert.match(ctl,/if\(!open\)return null;/,'nothing mounted while not in use');assert(!/setInterval|requestAnimationFrame\(loop/.test(ctl),'no loops');assert(!/infinite/.test(css),'no looping CSS');
 assert.match(ctl,/<KonbiniReveal /,'reuses the Konbini layered reveal');assert.match(read('lib/graphics/drinkArt.ts'),/'label wrap'[\s\S]*'condensation sparkle'/,'bottle → label wrap → cap → sparkle');
 assert.match(ctl,/newPurchaseId\(\)/,'one purchase id per deliberate buy');assert.match(shop,/from '..\/konbini\/foodStore'/);
 assert(!/konbini\/foodStore/.test(ctl),'the controller goes through the adapter');
 assert.match(town,/isDrinkMachine\(vendingId\)&&<DrinkMachine /,'Town opens drink machines with the drink controller');
 assert.match(town,/<VendingMachine [^\n]*open=\{storeOpen&&!isDrinkMachine\(vendingId\)\}/,'and never the shop face');
 console.log('PASS drink machines: 2 machines × 6 drinks (unique ids, Japanese names, generic art), verified hydration lines with sources, prices 3–6, 3 drinks/day (separate from food), repeat-safe purchases, pouch + collection group, no loops');
})().catch(e=>{console.error(e);process.exit(1);});
