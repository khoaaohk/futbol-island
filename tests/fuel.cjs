// Fuel (30 Sep 2026, docs/economy/FUEL_2026-09-30.md): drain/refill rules, fly > rides > walk, walking always works at 0, learning
// never costs fuel, the zero-coin refuel path (garden fruit from the basket), persistence, no offline drain, gentle notes, the
// wiring (HUD tick, ride gate, coins bar, pocket, Konbini, toast lane) and the economy guard. usage: node tests/fuel.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const F=require('../lib/town/fuel.ts'),food=require('../lib/konbini/food.ts'),drinks=require('../lib/town/drinkMachines.ts');
const M=require('../lib/town/market/market.ts'),goods=require('../lib/town/market/goods.ts');

// 1. Rates: the easier the travel, the more fuel per second. Fly > moped > bike > scooter > sprint > walk.
{const R=F.FUEL_RATE,order=['jetpack','moped','bike','scooter','sprint','walk'];
 for(let i=1;i<order.length;i++)assert(R[order[i-1]]>R[order[i]],`${order[i-1]} costs more than ${order[i]}`);
 for(const ride of ['scooter','bike','moped'])assert(R.jetpack>R[ride]&&R[ride]>R.walk,`fly > ${ride} > walk`);
 const minute=m=>{let s=F.fullFuel('d');for(let i=0;i<120;i++)s=F.drain(s,m,.5);return F.FUEL_MAX-s.fuel;};
 assert(minute('jetpack')>minute('bike')&&minute('bike')>minute('walk'),'a minute of flying drains more than a minute of riding, more than walking');
 assert(F.FUEL_MAX/R.jetpack/60>=6,'a full tank flies for at least 6 minutes');assert(F.FUEL_MAX/R.walk/3600>=2,'walking: 2+ hours per tank');}

// 2. Walking always works at 0; the easy modes rest at 0 and return after any snack.
{assert(F.canUse('walk',0),'walk at 0');for(const m of ['jetpack','scooter','bike','moped','sprint'])assert(!F.canUse(m,0),`${m} rests at 0`);
 let s={version:1,fuel:0,day:'d'};s=F.drain(s,'walk',.5);assert.equal(s.fuel,0,'walking at 0 never goes negative');
 s=F.refill(s,F.produceFuel('banana','produce','fruit'));assert(F.canUse('jetpack',s.fuel),'one banana and you can fly again');
 assert.equal(F.fuelLevel(0),'empty');assert.equal(F.fuelLevel(.4),'empty');assert.equal(F.fuelShown(.4),0,'the bar reads 0 exactly when empty');
 assert.equal(F.fuelLevel(20),'low');assert.equal(F.fuelLevel(60),'ok');assert.equal(F.fuelLevel(100),'full');
 assert.equal(F.refill({version:1,fuel:95,day:'d'},30).fuel,100,'clamped at 100');assert.equal(F.drain({version:1,fuel:5,day:'d'},'jetpack',9).fuel,5-F.FUEL_RATE.jetpack*F.MAX_SAMPLE_SECONDS,'one sample counts at most MAX_SAMPLE_SECONDS');}

// 3. Learning never costs fuel: every learning activity is free, and a paused sample (lesson, field menu, truck) drains nothing.
{for(const a of ['lesson','quiz','play','path','book','story','review','ball-hunt'])assert.equal(F.activityCost(a),0,`${a} costs no fuel`);
 const sample=F.createTravelSampler();sample({now:0,mode:'jetpack',x:0,z:0,paused:true});
 assert.equal(sample({now:150,mode:'jetpack',x:4,z:0,paused:true}),0,'paused (a lesson) never drains, even moving');
 assert(sample({now:300,mode:'jetpack',x:8,z:0,paused:false})>0,'flying when not paused drains');
 assert.equal(sample({now:450,mode:'jetpack',x:8.02,z:0,paused:false}),0,'standing still drains nothing');
 assert.equal(sample({now:600,mode:'walk',x:400,z:0,paused:false}),0,'a teleport (map travel, ferry, field trip) is never charged');
 assert.equal(sample({now:600+3600e3,mode:'walk',x:401,z:0,paused:false}),0,'an hour asleep is not movement');
 assert.equal(sample({now:600+3600e3+150,mode:'walk',x:401.5,z:0,paused:false}),.15,'normal walking counts its 150 ms');
 const town=read('components/Town.tsx');
 assert(town.includes("!active||!!learning||!!lessonRef.current||fieldMenu.current||streetTraffic.rider.index>=0,"),'Town pauses fuel in lessons, field menus and truck beds');
 assert(town.includes("rideRef.current==='jetpack'&&flight.height>.5)"),'hovering on the jetpack is charged as flying');}

// 4. Refills: every Konbini item and every machine drink refuels; carbs and meals most, treats least; sports drink > water.
{for(const f of food.FOOD_MENU)assert(F.foodFuel(f)>0,f.id);for(const d of drinks.DRINKS)assert(F.foodFuel(d)>0,d.id);
 const g=F.FUEL_BY_GROUP;assert(g.balanced>g.carb&&g.carb>g.protein&&g.protein>=g.hydration&&g.hydration>=g.treat,'meal > carbs > protein ≥ water ≥ treat');
 assert.equal(F.foodFuel({id:'drink-sports-drinksplaza',group:'hydration'}),30);assert.equal(F.foodFuel({id:'drink-water',group:'hydration'}),25);
 assert.equal(F.FUEL_BY_GROUP.balanced,F.FUEL_MAX,'one balanced meal fills the tank (kids game ease-up)');assert.equal(F.FUEL_NEW_DAY,F.FUEL_MAX,'a full tank every day');
 assert(F.foodFuel(food.foodItem('onigiri-ume'))/3>=F.foodFuel(food.foodItem('sweet-melonpan'))/4,'rice gives more fuel per coin than a sweet');
 for(const p of goods.PRODUCE_GOODS)if(p.id!=='sweet-potato')assert(F.produceFuel(p.id,'produce')>0,p.id+' is edible');
 assert.equal(F.produceFuel('sweet-potato','produce'),0,'sweet potato needs cooking');assert.equal(F.produceFuel('sardine','fish'),0,'no raw fish');
 assert(F.produceFuel('banana','produce')>F.produceFuel('tomato','produce'),'fruit carbs > veg');}

// 5. Zero-coin path: free garden fruit leaves the basket and refuels, with no wallet involved.
{const mem=new Map(),market=M.createMarket({read:()=>JSON.parse(mem.get('m')??'null'),write:v=>mem.set('m',JSON.stringify(v)),credit:async()=>{throw new Error('no coins needed');}});
 assert.equal(market.gather('banana',2),2);assert.equal(market.take('banana'),1,'eat one banana');assert.equal(market.read().basket.banana,1);
 assert.equal(market.take('banana',5),1,'only what is there');assert.equal(market.read().basket.banana,undefined);assert.equal(market.take('banana'),0);
 const store=memStore(),{s}=store;s.travel('jetpack',.5);for(let i=0;i<8000;i++)s.travel('jetpack',.5);
 assert.equal(s.read().fuel,0,'flown empty');assert(!s.canUse('jetpack'));assert(s.canUse('walk'),'walk at 0');
 assert(s.eat(F.produceFuel('banana','produce'))>0&&s.canUse('jetpack'),'a free banana refuels: no coins needed');}

// 6. Persistence (only when the shown number changes) and no offline drain (time away never lowers fuel; a new day is breakfast).
function memStore(start){const data=new Map(),clock={t:start??Date.UTC(2026,8,30,9)},writes={n:0};
 const ports={read:()=>JSON.parse(data.get(F.FUEL_STORAGE_KEY)??'null'),write:v=>{writes.n++;data.set(F.FUEL_STORAGE_KEY,JSON.stringify(v));},now:()=>clock.t,day:t=>new Date(t).toISOString().slice(0,10)};
 return {s:F.createFuelStore(ports),ports,data,clock,writes};}
{const m=memStore();assert.equal(m.s.read().fuel,100,'a new player starts full');
 for(let i=0;i<40;i++)m.s.travel('bike',.15);// 6 s of riding = 0.66 fuel: the shown number moves once at most
 assert(m.writes.n<=2,`saved ${m.writes.n} times for 40 ticks (only when the number on the bar changes)`);
 for(let i=0;i<400;i++)m.s.travel('jetpack',.5);const left=m.s.read().fuel;
 const again=F.createFuelStore(m.ports);assert(Math.abs(again.read().fuel-left)<1,'a reload keeps the tank (within the last unshown fraction)');
 m.clock.t+=6*3600e3;assert(Math.abs(F.createFuelStore(m.ports).read().fuel-left)<1,'six hours away, same day: no drain');
 m.clock.t+=3*86400e3;const next=F.createFuelStore(m.ports).read();assert(next.fuel>=F.FUEL_NEW_DAY&&next.fuel>=left-1,'days away: never lower, breakfast lifts to the new-day floor');
 const full=memStore();full.clock.t+=5*86400e3;assert.equal(full.s.read().fuel,100,'a full tank stays full while away');
 assert.deepEqual(F.sanitizeFuel({version:1,fuel:'x'},'d'),F.fullFuel('d'),'broken save → full');assert.equal(F.sanitizeFuel({version:1,fuel:250,day:'d'},'d').fuel,100);
 const src=read('lib/town/fuelStore.ts');assert(!/setInterval|requestAnimationFrame|setTimeout/.test(src),'the store has no timers or loops');
 assert(/typeof localStorage==='undefined'/.test(src)&&/\(\)=>100\)/.test(src),'SSR-safe: no storage at import, a full server snapshot');}

// 7. Gentle notes: low once when crossing the line, "time to walk" once at empty on a ride, a note when a ride is refused.
{const m=memStore();const seen=[];m.s.subscribe(()=>{const n=m.s.notice;if(n&&!seen.find(x=>x.id===n.id))seen.push(n);});
 for(let i=0;i<8000;i++)m.s.travel('jetpack',.5);
 assert.deepEqual(seen.map(n=>n.kind),['low','empty'],'one low note, then one empty note');
 m.s.blocked('jetpack');assert.equal(m.s.notice.kind,'blocked');assert.match(m.s.notice.title,/jetpack needs fuel/);
 for(const c of [F.FUEL_COPY.low,F.FUEL_COPY.empty,F.FUEL_COPY.blocked('Bike')])assert(/Konbini|fruit|banana|garden/i.test(c.detail),'every note names a way to refuel');
 assert(/half time/i.test(F.FUEL_COPY.low.detail),'teaches the half-time refuel');assert(/walking always works/i.test(F.FUEL_COPY.empty.detail));
 const all=JSON.stringify(F.FUEL_COPY);assert(!/hurry|now or|only today|buy now|weight|diet|calorie/i.test(all),'no pressure, no diet talk');}

// 8. Wiring (surgical hooks): HUD tick + ride gate + sprint in Town, the counter in the coins bar, the pocket's Fuel section with
//    Eat buttons, the Konbini eat paths, and low-fuel notes through the shared toast lane (no new floating element).
{const town=read('components/Town.tsx'),jobs=read('components/IslandJobs.tsx'),pocket=read('components/IslandBalanceDrawer.tsx'),toast=read('components/FuelToast.tsx'),store=read('lib/konbini/foodStore.ts');
 assert(/if\(hudTick&&fuelTravel\(/.test(town),'drain is sampled on the existing HUD tick, not a new loop');
 assert(/const selectRide=[^\n]*if\(!fuelAllowsRide\(mode\)\)return;/.test(town),'rides and the jetpack ask for fuel; walking never does');
 assert(/&&fuelCanSprint\(\)/.test(town),'sprint rests at 0 fuel');assert(/<FuelToast blocked=\{toastBlocked\}\/>/.test(town));
 assert(/<FuelCount className=\{styles\.basketCount\}\/>/.test(jobs),'fuel counter sits in the coins bar with the fish/fruit counter style');
 assert(/data-pocket-fuel-section/.test(pocket)&&/islandMarket\.take\(r\.id,1\)/.test(pocket)&&/eatFuel\(/.test(pocket),'pocket Fuel section eats from the basket');
 assert(/toastLane\.request\('fuel'\)/.test(toast)&&/<HudSlot>/.test(toast)&&/data-hud-slot="toast"/.test(toast),'fuel notes use the toast lane and slot');
 assert(/export const resolveFood=/.test(store)&&/export const keepFood=/.test(store)&&/export const eatFromPouch=/.test(store)&&/fuelFrom\(/.test(store),'every Konbini/drink eat path refuels');
 const count=read('components/FuelCount.tsx');assert(/data-fuel-level/.test(count)&&/Empty/.test(count)&&/Low/.test(count)&&/empty=\{level==='empty'\}/.test(count),'state by colour + icon + text');}

// 9. Economy guard (the full checks live in tests/economy.cjs §9): buying every refill stays a small share and keeps the 60–90 day target.
{const S=require('../scripts/economy-sim.cjs');const reg=S.averaged(S.FUEL_BUY,'regular',200,3),free=S.averaged(S.FUEL_FREE,'casual15',200,3);
 assert(reg.fuelSharePct<=12,`regular spends ${reg.fuelSharePct}% of income on fuel`);assert(reg.allBought>=60&&reg.allBought<=90,`regular owns everything by day ${reg.allBought}`);
 assert.equal(free.fuelShortDays,0,'a casual child with no coins to spare is never short of fuel');}

console.log('PASS fuel: fly > rides > walk, walking always works at 0, learning never costs fuel, free fruit refuels with 0 coins, saves only on change, no offline drain, gentle notes via the toast lane, economy guard');
// Sep 30 2026 (user): rates halved; hovering/climbing on the jetpack burns fuel, standing on foot still does not.
{const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/fuel.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:m.exports,module:m,require,Math,Number,Object,JSON});
 const F=m.exports,assert=require('node:assert/strict');assert.equal(F.FUEL_RATE.jetpack,.06);assert.equal(F.FUEL_RATE.walk,.003);assert(F.FUEL_MAX/F.FUEL_RATE.jetpack/60>=25,'25+ min of flying per tank');
 const hover=F.createTravelSampler();hover({now:0,mode:'jetpack',x:0,z:0,paused:false,airborne:true});assert(hover({now:300,mode:'jetpack',x:0,z:0,paused:false,airborne:true})>0,'hovering drains');
 const stand=F.createTravelSampler();stand({now:0,mode:'walk',x:0,z:0,paused:false});assert.equal(stand({now:300,mode:'walk',x:0,z:0,paused:false}),0,'standing still is free');
 console.log('fuel: halved rates, hover drains, standing free');}
