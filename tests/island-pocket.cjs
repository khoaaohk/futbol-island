// Island pocket (Sep 30 2026): every fish and produce good that can enter the basket shows in the pocket with the right group,
// name, count and value, matches the HUD counters, sells out of it, survives a reload, and new goods appear automatically.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
function environment(){
 const data=new Map(),cache=new Map();
 const localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const window={addEventListener(){},removeEventListener(){}};
 const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,localStorage,window,structuredClone,queueMicrotask});
 // A tiny jsx-runtime so the .tsx art can be rendered to a plain element tree.
 const jsx=(type,props)=>typeof type==='function'?type(props):{type,props};
 const runtime={jsx,jsxs:jsx,Fragment:'#fragment'};
 function resolve(from,id){
  const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
  for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
  throw new Error('cannot resolve '+id+' from '+from);
 }
 function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react/jsx-runtime'?runtime:id==='react'?{}:id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
  cache.set(file,mod.exports);return mod.exports;}
 return {load,data};
}
const walk=(node,fn)=>{if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(n=>walk(n,fn));return;}fn(node);walk(node.props?.children,fn);};

(async()=>{
const e=environment();
const G=e.load('lib/town/market/goods.ts'),M=e.load('lib/town/market/market.ts'),S=e.load('lib/town/market/marketStand.ts'),P=e.load('lib/town/market/pocket.ts');
const cat=e.load('lib/town/fishing/fishCatalog.ts'),share=e.load('lib/town/jobs/harvestShare.ts'),garden=e.load('lib/town/jobs/garden.ts');
const art=e.load('components/ProduceArt.tsx');
const t0=new Date(2026,8,30,10).getTime();
let stored=null;const credits=[];
const ports={read:()=>stored,write:v=>{stored=JSON.parse(JSON.stringify(v));},credit:async(id,amount)=>{credits.push({id,amount});return amount;},now:()=>t0};
const market=M.createMarket(ports),view=()=>P.pocketView(market.read());
const sellPorts={...ports,refresh:()=>market.refresh()};
const hudLikeIslandJobs=(s,kind)=>Object.entries(s.basket).reduce((n,[id,c])=>n+(G.goodById(id)?.kind===kind?c:0),0);

// ---- Inventory: every source feeds a registry good ----
const fishIds=new Set(G.FISH_GOODS.map(g=>g.id));
for(const f of cat.FISH)assert(fishIds.has(f.id),`${f.id} (${f.spots.join(', ')}) is a market good`);
const deep=cat.FISH.filter(f=>f.spots.includes('deep-sea-boat')),jetty=cat.FISH.filter(f=>f.spots.includes('east-pier'));
assert(deep.length>=8&&jetty.length>=5,'deep-sea boat and East Jetty catches are in the catalogue');
for(const s of garden.GARDEN_SPOTS)assert(G.isGood(s.good)&&G.goodById(s.good).kind==='produce',`garden ${s.good} is a produce good`);
for(const id of share.HARVEST_SHARE_CYCLE)assert(G.isGood(id)&&G.goodById(id).kind==='produce',`harvest share ${id} is a produce good`);

// ---- Every good: into the basket → pocket row + HUD counter; sell one → gone ----
const missingArt=[];
for(const good of G.GOODS){
 if(stored){stored={...stored,soldToday:0};market.refresh();}// keep full price so values are exact
 assert.equal(market.gather(good.id,2),2,`${good.id} fits in the basket`);
 const v=view(),cat_=P.pocketCategory(good),row=v[cat_].rows.find(r=>r.id===good.id);
 assert(row,`${good.id} shows in the pocket under ${cat_}`);
 assert.equal(row.count,2);assert.equal(row.name,good.plural);assert.equal(row.each,good.price);assert.equal(row.value,good.price*2,`${good.id} value`);
 assert.equal(v.hud.fish,good.kind==='fish'?2:0);assert.equal(v.hud.produce,good.kind==='produce'?2:0);
 assert.equal(v.hud.fish,hudLikeIslandJobs(market.read(),'fish'));assert.equal(v.hud.produce,hudLikeIslandJobs(market.read(),'produce'));
 assert.equal(v.fish.count+v.fruit.count+v.veg.count,v.total,'groups add up to the basket');
 if(good.kind==='fish'){assert(cat.fishById(good.id),`${good.id} has fish art data`);assert.equal(good.name,cat.fishById(good.id).name);}
 else{assert(cat_==='fruit'||cat_==='veg');const svg=art.default({good,size:38});assert.equal(svg.type,'svg');let shapes=0;walk(svg.props.children,n=>{if(['path','circle','ellipse'].includes(n.type))shapes++;});assert(shapes>0,`${good.id} icon draws`);if(!art.hasOwnProduceArt(good.id))missingArt.push(good.id);}
 const one=await S.sellOneGood(good.id,sellPorts);assert.equal(one.ok,true);
 assert.equal(view()[cat_].rows.find(r=>r.id===good.id).count,1,`${good.id}: selling one updates the pocket`);
 const all=await market.sell(good.kind);assert.equal(all.ok,true);
 assert.equal(view().total,0,`${good.id}: selling all empties the pocket`);
}
if(missingArt.length)console.warn('island pocket: produce with only the generic icon (add a drawing in components/ProduceArt.tsx):',missingArt.join(', '));
assert.equal(credits.length,G.GOODS.length*2,'every sale paid once');

// Fruit vs veggies (kitchen sense).
const catOf=id=>P.pocketCategory(G.goodById(id));
for(const id of ['orange','cherry','strawberry'])assert.equal(catOf(id),'fruit');
for(const id of ['tomato','carrot'])assert.equal(catOf(id),'veg');
for(const [id,c] of [['banana','fruit'],['mango','fruit'],['pepper','veg'],['greens','veg'],['sweet-potato','veg']])if(G.isGood(id))assert.equal(catOf(id),c);

// ---- Garden + farm share never double-count: same good id → one row ----
market.gather('orange',1);
const granted=market.grant('farm:2026-09-30:1',[{id:'orange',count:2},{id:G.isGood('mango')?'mango':'cherry',count:1}]);
assert.equal(granted.length,2);assert.equal(market.grant('farm:2026-09-30:1',[{id:'orange',count:2}]).length,0,'a shift share is granted once');
let v=view();assert.equal(v.fruit.rows.filter(r=>r.id==='orange').length,1);assert.equal(v.fruit.rows.find(r=>r.id==='orange').count,3);
market.gather('cod',1);market.gather('squid',1);market.gather('carrot',2);v=view();
assert.deepEqual([v.fish.count,v.fruit.count,v.veg.count,v.total],[2,4,2,8]);
assert(v.fish.rows.some(r=>r.id==='squid'&&r.name==='Squid'),'deep-sea squid shows by name');

// ---- Reload: a fresh market on the same storage (like a page reload) shows the same pocket ----
const again=M.createMarket({...ports}),reload=P.pocketView(again.read());
assert.deepEqual(reload.hud,v.hud);assert.deepEqual(reload.fish.rows.map(r=>[r.id,r.count]),v.fish.rows.map(r=>[r.id,r.count]));
assert.deepEqual(reload.fruit.rows.map(r=>[r.id,r.count]),v.fruit.rows.map(r=>[r.id,r.count]));
// A reload with a good that no longer exists drops it, the rest stay.
stored={...stored,basket:{...stored.basket,'not-a-good':3}};assert.equal(P.pocketView(M.createMarket({...ports}).read()).total,8);

// ---- Soft cap: values follow the stand's half price once today's allowance is used ----
const capped=P.pocketView({...market.read(),soldToday:M.MARKET_FULL_PRICE_COINS});
assert(capped.fish.rows.every(r=>r.each===Math.max(1,Math.floor(r.good.price/2))),'half price after the allowance');
assert.equal(capped.value,M.quoteSale({...market.read(),soldToday:M.MARKET_FULL_PRICE_COINS}).coins,'pocket total = stand "sell all"');

// ---- New goods from goods.ts appear automatically (registry-driven, no pocket edit) ----
G.GOODS.push({id:'test-pineapple',kind:'produce',name:'Pineapple',plural:'Pineapples',price:3,color:'#e8b83a',lesson:'x'},
 {id:'test-kale',kind:'produce',name:'Kale',plural:'Kale',price:2,color:'#4f8a3f',lesson:'x',category:'veg'},
 {id:'test-guava',kind:'produce',name:'Guava',plural:'Guavas',price:2,color:'#9bc25a',lesson:'x',category:'fruit'});
await market.sell();market.gather('test-pineapple',1);market.gather('test-kale',2);market.gather('test-guava',1);v=view();
assert.equal(v.veg.rows.find(r=>r.id==='test-kale').count,2,'an optional category on a good is honoured');
assert.equal(v.fruit.rows.find(r=>r.id==='test-guava').count,1);
assert(v.veg.rows.some(r=>r.id==='test-pineapple'),'unknown produce without a category defaults to veggies');
assert.equal(P.pocketCategory({id:'pineapple',kind:'produce'}),'fruit','tropical fruit are already listed as fruit');
assert.equal(v.hud.produce,4);assert.equal(art.default({good:G.goodById('test-kale')}).type,'svg','new goods get a generic icon');
G.GOODS.splice(-3,3);

// ---- The drawer is wired to the model (source checks) ----
const drawer=fs.readFileSync(path.join(ROOT,'components/IslandBalanceDrawer.tsx'),'utf8');
assert.match(drawer,/pocketView\(/);assert.match(drawer,/data-pocket-fish>\{pocket\.fish\.count\}/);assert.match(drawer,/Rosa’s market stand/);assert.match(drawer,/Backpack/);
console.log(`island pocket: ${G.GOODS.length} goods (${G.FISH_GOODS.length} fish, ${G.PRODUCE_GOODS.length} produce) show, count, sell and persist`);
})().catch(err=>{console.error(err);process.exit(1);});
