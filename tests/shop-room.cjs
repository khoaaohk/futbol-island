// Kit Shop (Oct 12 2026): the merged CLUB GROUNDS + COMMUNITY HALL flagship and its walk-in room.
//  1. Door, exit and departure: inside the island's flight bounds, in front of the door, facing out; Enter zone at the door only.
//  2. The exterior (lib/town/kitShopExterior.ts) built headless: one footprint across both old lots, gameplay kept (the Club Grounds
//     high target's ball spot and approach, the Community Hall grass hatch, the shop exit), every solid in the shared palette batch
//     (only the one lettering material is extra), a paved path from the sidewalk to the door, roof rails for the sign and fin.
//  3. Purchases through the REAL arcade wallet: coins only, one charge per design (double tap / retry / buying again), not enough
//     coins says how many more, ownership and "your pick" recorded under fi2-shop-owned-v1 (a synced key).
//  4. Static guards: the room sleeps (no idle loop), disposes its renderer, lazy-loads its scene and the studios, and the
//     island ↔ shop boundary follows the museum's (/shop, /?from=shop rewritten to /island-return).
//  7. Walk-in (Oct 12 2026, "player should be able to walk inside … npcs here along with clerk"): the floor plan in node (door →
//     every wall, the clerk's corner closed, nobody stuck behind the counter, every shopper's walk clear), the cast (clerk + a
//     capped number of shoppers, kid-friendly kit lines, no brands), and the room's wiring (player, joystick, prompts, chat, exit).
// usage: node tests/shop-room.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const T=require('three');
const D=require('../lib/shop/shopDoors.ts');
const {validIslandReturnPosition}=require('../lib/arcade/islandReturnPosition.ts');
const {COIN_QUEST}=require('../lib/town/coinQuest.ts');
const {SYNC_KEYS}=require('../lib/saves/snapshot.ts');
const S=require('../lib/shop/shopPurchases.ts');
const {createArcadeWallet}=require('../lib/arcade/arcadeWalletCore.ts');
const L=require('../lib/shop/shopLayout.ts');
const C=require('../lib/shop/shopCast.ts');

// 1. Doors.
{const {KIT_SHOP:K,SHOP_DOOR:door}=D;
 assert.equal(K.x-K.w/2,151.5,'west wall = the old CLUB GROUNDS west wall');assert.equal(K.x+K.w/2,188.5,'east wall = the old COMMUNITY HALL east wall');
 assert.equal(K.z,-177);assert.equal(K.d,13);assert.equal(door.front,K.z+K.d/2,'door on the south (street) face');
 const exit=D.shopExitPoint();assert.equal(exit.yaw,0,'faces out (+z)');assert(exit.z>door.front&&exit.z<-165,'exit stands on the forecourt, short of the street');
 const dep=D.shopDeparture('jetpack');assert.equal(dep.ride,'walk','never leaves on a jetpack');assert(validIslandReturnPosition(dep),'a valid island return record');
 assert(D.shopDoorNear(exit.x,exit.z),'Enter shows at the door');assert(!D.shopDoorNear(exit.x+12,exit.z),'not along the far shopfront');assert(!D.shopDoorNear(exit.x,-150),'not across the street');
 assert.equal(D.KIT_SHOP_GLOW.length,5,'outline: volume, roof slab, rooftop sign, canopy, fin');
 const b=D.KIT_SHOP_BOUNDS;assert(b.min.x<=151.5&&b.max.x>=188.5&&b.max.y>=D.SHOP_ROOF_SIGN.y0+D.SHOP_ROOF_SIGN.h,'hover box covers the whole building and its rooftop sign');}

// 2. The exterior, built headless (a stub 2D canvas: the lettering is painted once).
{const ctx=new Proxy({},{get:(o,k)=>k==='measureText'?()=>({width:10}):k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});
 global.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
 const {buildKitShopExterior,KIT_SHOP_COLORS}=require('../lib/town/kitShopExterior.ts');
 const town=new T.Group(),obstacles=[],rails=[],buildings=[],surfaceAreas=[],textures=[],materials=[],nightSigns=[],palette=new Map();
 const mat=c=>{if(!palette.has(c))palette.set(c,new T.MeshStandardMaterial({color:c}));return palette.get(c);};
 const put=(g,c,x,y,z,p=town)=>{const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);p.add(m);return m;};
 const box=(w,h,d,c,x,y,z)=>put(new T.BoxGeometry(w,h,d),c,x,y,z);
 buildKitShopExterior({box,put,town,obstacles,rails,buildings,surfaceAreas,textures,materials,nightSigns});
 assert.equal(buildings.length,1,'ONE building across both lots');assert.equal(buildings[0].name,'KIT SHOP');assert.equal(buildings[0].height,8.23,'one roof at the old Club Grounds height');
 const inside=(o,x,z,pad=0)=>Math.abs(x-o.x)<o.w/2+pad&&Math.abs(z-o.z)<o.d/2+pad;
 const main=obstacles.find(o=>o.w===37&&o.d===13);assert(main,'the merged footprint is an obstacle');
 // Gameplay that lived on the two old buildings.
 const high=COIN_QUEST.find(s=>s.id==='high-clubgrounds');assert(high.wall.x>151.5&&high.wall.x<188.5,'the high target is still on the shop’s south face');
 assert(Math.abs(high.wall.z-D.SHOP_DOOR.front)<1.2,'…on the facade plane');assert(high.wall.y<8&&high.wall.y>5.4,'…on the plain upper facade, above the shopfront lip');
 for(const o of obstacles)assert(!inside(o,high.x,high.z,.4),'the high target’s ball spot stays clear');
 for(let z=high.z;z<-163;z+=.5)for(const o of obstacles)assert(!inside(o,high.x,z,.3),'a clear south approach to the high target');
 const grass=COIN_QUEST.find(s=>s.id==='grass-community');for(const o of obstacles.filter(o=>o!==main))assert(!inside(o,grass.x,grass.z,.5),'the grass hatch beside the east wall stays clear');
 assert(grass.x>188.5,'the grass hatch is still outside the east wall');
 const exit=D.shopExitPoint();for(const o of obstacles)assert(!inside(o,exit.x,exit.z,.35),'the shop exit is clear');
 for(let x=D.SHOP_DOOR.x-1.5;x<=D.SHOP_DOOR.x+1.5;x+=.5)for(let z=D.SHOP_DOOR.front+.2;z<-165;z+=.5)for(const o of obstacles.filter(o=>o!==main))assert(!inside(o,x,z,.2),'a clear walk from the sidewalk to the door');
 const forecourt=surfaceAreas.find(a=>a.kind==='path');assert(forecourt&&inside(forecourt,exit.x,exit.z)&&forecourt.z+forecourt.d/2>=-165.01,'a paved path from the sidewalk to the door');
 // Heat: plain palette paint everywhere (folds into the 50 m chunk batch), ONE lettering material, no lights, no new textures beyond it.
 const meshes=[];town.traverse(o=>{if(o.isMesh)meshes.push(o);});const extra=new Set(meshes.map(m=>m.material).filter(m=>![...palette.values()].includes(m)));
 assert.equal(extra.size,1,'one lettering material (one draw), everything else in the shared paint');assert.equal(textures.length,1,'one canvas texture');assert.equal(nightSigns.length,1,'the sign lights up at night');
 let lights=0;town.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,0,'no lights');
 const box3=new T.Box3();town.updateMatrixWorld(true);for(const m of meshes){box3.setFromObject(m);const cx=(box3.min.x+box3.max.x)/2,cz=(box3.min.z+box3.max.z)/2;
  assert(Math.floor(cx/50)===3&&Math.floor(cz/50)===-4,'every piece sits in the one existing 50 m chunk (x 150–200, z −200…−150): '+m.geometry.type+' at '+cx.toFixed(1)+','+cz.toFixed(1));}
 let tris=0;for(const m of meshes){const g=m.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}
 assert(tris<16000,'bounded detail: '+tris+' triangles');console.log('kit shop exterior:',meshes.length,'pieces,',Math.round(tris),'triangles, 1 extra material');
 assert(rails.some(r=>r.floor>8),'the rooftop sign is a roof obstacle');assert(rails.some(r=>r.floor===0&&r.top>11),'the fin is a rail');
 for(const c of Object.values(KIT_SHOP_COLORS))assert(/^#[0-9a-f]{6}$/.test(c));
 delete global.document;}

// 3. Purchases through the real wallet.
(async()=>{
 let wallet={version:1,runs:Object.fromEntries(Array.from({length:8},(_,i)=>['grant-'+i,{game:'island',paid:20,reason:'grant',at:1}])),packs:[]},q=Promise.resolve();
 const W=createArcadeWallet({read:()=>structuredClone(wallet),write:s=>{wallet=structuredClone(s);},lock:fn=>{const p=q.then(fn);q=p.catch(()=>{});return p;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>1,id:()=>Math.random().toString(),random:()=>0});
 assert.equal(W.load().balance,160);
 const mem=new Map(),store={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v))};let charges=0;
 const spend=async(id,cost,reason)=>{charges++;return W.spend(id,cost,reason);};
 const jersey={v:1,primary:'#ef5a2f',secondary:'#ffffff',accent:'#1f2a44',name:'ALEX',number:10};
 const [a,b]=await Promise.all([S.buyDesign('jersey',jersey,120,spend,{store,name:'ALEX 10'}),S.buyDesign('jersey',jersey,120,spend,{store,name:'ALEX 10'})]);
 assert(a.ok&&b.ok,'a double tap succeeds');assert.equal(W.load().balance,40,'…and charges once (160 − 120)');
 const again=await S.buyDesign('jersey',jersey,120,spend,{store});assert(again.ok&&again.already,'buying the same design again is free');assert.equal(W.load().balance,40);
 const poor=await S.buyDesign('boots',{v:1,colors:{toe:'#000000'}},80,spend,{store});assert(!poor.ok&&/40 more coins/.test(poor.reason),'not enough coins says how many more: '+(poor.ok?'':poor.reason));
 assert.equal(W.load().balance,40,'a failed buy spends nothing');
 const ball=await S.buyDesign('ball',{v:1,colors:{a:'#ffffff',b:'#000000',c:'#ef5a2f'}},30,spend,{store});assert(ball.ok);assert.equal(W.load().balance,10);
 const owned=S.loadOwned(store);assert.deepEqual(owned.items.map(i=>i.kind),['jersey','ball']);assert.equal(owned.wearing.jersey,owned.items[0].id);assert.equal(owned.wearing.ball,owned.items[1].id);
 assert.equal(owned.items[0].name,'ALEX 10');
 assert(!(await S.buyDesign('jersey',jersey,0,spend,{store})).ok,'no free or negative prices');assert(!(await S.buyDesign('hat',{},10,spend,{store})).ok,'only jerseys, boots and balls');
 // Corrupt or hostile saved data is dropped, never trusted.
 assert.deepEqual(S.parseOwned('{"v":1,"items":[{"id":"x","kind":"hat","price":5,"at":1},{"id":"y","kind":"ball","price":-3,"at":1}],"wearing":{"ball":"y"}}').items,[]);
 assert.deepEqual(S.parseOwned('nope'),S.emptyOwned());
 for(const k of [S.SHOP_OWNED_KEY,'fi2-shop-jersey-v1','fi2-shop-boots-v1','fi2-shop-ball-v1'])assert(SYNC_KEYS.includes(k),k+' syncs with the save code');
 assert.equal(charges>=3,true);

 // 4. Static guards.
 const scene=read('lib/shop/shopScene.ts'),room=read('components/shop/ShopRoom.tsx'),studios=read('components/shop/studios.tsx');
 assert(/if\(settle>0\|\|crowd\|\|leaving\|\|remoteKeep\)frame=requestAnimationFrame\(tick\);else\{last=0;slot=0;remoteOnly=false;scheduleNpcs\(\);\}/.test(scene),'the room loop only continues while something moves (0 rAF at rest; the next shopper walk is a timer; a party friend moving here keeps frames: rooms Phase 4)');
 assert(/const needs=a\.mode==='walk'\|\|Math\.abs\(turn\)>\.01\|\|a\.wave>0\|\|a\.settle>0\|\|\(close&&youMoving\);\s*if\(!needs\)\{a\.elapsed=0;return false;\}/.test(scene),'a still person is never posed');
 assert(/if\(dYou>NEAR_POSE&&bucket===a\.bucket\)/.test(scene)&&/POSE_HZ=15/.test(scene),'far walkers pose at 15 Hz (the island’s far-pose rule)');
 assert(/if\(\(!walker\|\|walker===a\)&&t>=nextWalkAt\)/.test(scene)&&/WALK_GAP=12/.test(scene),'one shopper walks at a time, with a rest between walks');
 assert(/npcOnly\|\|remoteOnly\?Math\.max\(SHOP_REMOTE_FRAME_MS,baseFrameMs\(\)\)/.test(scene)&&/SHOP_REMOTE_FRAME_MS=50;/.test(scene),'only shoppers (or party friends) moving: 20 fps');
 // Idle rest (fix pass Oct 13 2026, heat audit): ~60 s with no input from you and the shoppers stop walking, no walk timer is
 // left, so the room reaches 0 rAF (like the Museum); any input or tap (keys, the stick, a tap, walkTo, closing a studio, any
 // pointer or key on the room's UI) restarts the clock and wakes them.
 assert(/const IDLE_REST=60;let lastInput=born;/.test(scene)&&/const resting=\(\)=>clock\(\)-lastInput>IDLE_REST;/.test(scene),'shoppers rest after 60 s without input');
 assert(/if\(resting\(\)\)\{[^}]*\}\s*else if\(\(!walker\|\|walker===a\)&&t>=nextWalkAt\)/.test(scene),'a resting shopper starts no new walk');
 assert(/if\(next<Infinity&&next<lastInput\+IDLE_REST\)npcTimer=setTimeout\(\(\)=>\{npcTimer=undefined;if\(!resting\(\)\)wake\(\);\}/.test(scene),'no walk timer past the rest: a resting room schedules nothing (0 rAF)');
 assert(/function poke\(\)\{const was=resting\(\);lastInput=clock\(\);if\(was\)wake\(\);\}/.test(scene),'any input wakes a resting room');
 for(const fn of ['setStick(a:number,b:number){if(leaving)return;poke();','pick(clientX:number,clientY:number):string|null{if(leaving||covered)return null;poke();','walkTo(id:string){poke();','e.preventDefault();poke();'])assert(scene.includes(fn),'input wakes the shoppers: '+fn.slice(0,24));
 assert(/else\{lastInput=clock\(\);wake\(\);\}\},/.test(scene),'closing a studio, My kit or a chat counts as input');
 {const m=room.match(/<main [^>]*onPointerDownCapture=\{([^}]+)\}[^>]*onKeyDownCapture=\{([^}]+)\}/);const pokes=h=>/room\.current\?\.poke\(\)/.test(h)||new RegExp('const '+h.trim()+'=\\(\\)=>\\{[^\\n]*room\\.current\\?\\.poke\\(\\)').test(room);
  assert(m&&pokes(m[1])&&pokes(m[2]),'any tap or key on the room wakes it (poke)');}
 assert(/resting:resting\(\)/.test(scene),'the state reports a resting room');
 assert(/mobile\?Math\.min\(1\.5,tierSettings\(\)\.maxPixelRatio\)/.test(scene),'phones: pixel ratio ≤ 1.5');
 assert(!/shadowMap\.enabled\s*=\s*true|castShadow\s*=\s*true/.test(scene)&&/new T\.InstancedMesh\(shadowGeo,shadowMat,people\)/.test(scene),'no shadow maps: one instanced blob shadow for everyone');
 assert(/setCovered\(value:boolean\)\{if\(value===covered\)return;covered=value;if\(value\)\{[^}]*cancelAnimationFrame\(frame\);frame=0;clearTimeout\(npcTimer\)/.test(scene),'covered: no frame and no shopper timer');
 assert(/renderer\.dispose\(\);renderer\.forceContextLoss\(\)/.test(scene),'dispose frees the WebGL context');
 assert(/import\('@\/lib\/shop\/shopScene'\)/.test(room),'the scene is lazy-loaded');
 assert(!/import [^;]*from '@\/lib\/shop\/shopScene'/.test(room.replace(/import type[^;]*;/g,'')),'…never statically');
 for(const s of ['BallStudio','JerseyStudio','BootStudio'])assert(new RegExp(`${s}=dynamic\\(`).test(studios),s+' is its own lazy chunk');
 assert(/const covered=!!studio\|\|myKit\|\|!!talking;/.test(room)&&/room\.current\?\.setCovered\(covered\)/.test(room),'the store stops drawing under a studio, My kit or a chat');
 assert(/spendArcadeCoins/.test(room)&&!/stripe|checkout|price_id/i.test(room),'coins only, never real money');
 assert(/'\^\(arcade\|konbini\|museum\|shop\)\$'/.test(read('next.config.mjs')),'/?from=shop returns to the island at the door');
 assert(/refreshShopDeparture\(\)/.test(room)&&/SHOP_RETURN_URL/.test(room),'Done saves the door departure and goes back');
 // 5. Island wiring (the museum's recipe): the world builds the merged shop instead of the two old houses (still drawing their
 //    paint and shape so every other building keeps its look), Town enters it from a tap, the door prompt and the map, and the
 //    building outline covers the whole flagship.
 const world=read('lib/town/world.ts'),town=read('components/Town.tsx'),map=read('components/IslandOverview.tsx');
 assert(/if\(label==='CLUB GROUNDS'\|\|label==='COMMUNITY HALL'\)\{if\(pickScheme\(label\)\)pickShape\(label,buildingRadius\(label\)\);return;\}/.test(world),'the two old houses are skipped but keep the paint/shape order');
 assert(/shift\(clubStart,-140,125\);\s*buildKitShopExterior\(\{box,put,town,obstacles,rails:museumRails,buildings,surfaceAreas,textures,materials,nightSigns\}\)/.test(world),'the shop is built in final coordinates after the Club Grounds shift');
 assert(/if\(pointsAtShop\(\)\)\{tapHaptic\(\);sound\.ui\('click'\);setShopOpen\(true\);return;\}/.test(town),'a tap on the building enters');
 assert(/data-shop-enter aria-label="Enter KIT SHOP"[^>]*onClick=\{\(\)=>setShopOpen\(true\)\}/.test(town),'the door prompt enters');
 assert(/\['shop',nearShop,SHOP_DOOR\.x,[\d.]+,SHOP_DOOR\.front,shopBounds\]/.test(town)&&/nearShop=canEnter[^;]*shopDoorNear\(location\.x,location\.z\)/.test(town),'Enter shows at the door');
 assert(/\{name:'shop',bounds:shopBounds/.test(town)&&/kind:'shop',x:KIT_SHOP\.x,z:KIT_SHOP\.z,active:overShop\|\|nearShop\|\|flightNear\(shopBounds\)/.test(town),'the green outline covers the whole shop');
 assert(/\{shopOpen&&<ShopDoorSlide mode="enter"\/>\}/.test(town)&&/museumOpen\|\|shopOpen\|\|ferryOpen/.test(town),'the doors slide and the island stops');
 assert(/travel\.current==='shop'\?shopExitPoint\(\)/.test(town)&&/destination==='shop'\)go\(destination\)/.test(town),'the map travels to the shop door');
 assert(/\{id:'shop',label:'KIT SHOP',point:SHOP_MAP_POINT/.test(map),'KIT SHOP on the map');
 // 6. Bought kit stays in the shop (user, Oct 12 2026: "Don't show on player"): only the shop and the save sync touch it.
 {const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
  const readers=['lib','components','app'].flatMap(walk).filter(f=>/shopPurchases|fi2-shop-owned-v1|SHOP_OWNED_KEY/.test(read(f)));
  assert.deepEqual(readers.filter(f=>!/^(lib\/shop\/|components\/shop\/|lib\/saves\/snapshot\.ts$)/.test(f)),[],'nothing outside the shop reads what you bought');}
 // 7. Walk-in.
 {const obs=L.shopObstacles(),blocked=(x,z)=>L.shopBlocked(x,z,obs);
  // The clerk's corner is closed: counter + side panels + back cabinet, and nobody can stand anywhere in it.
  const Z=L.CLERK_ZONE;for(let x=Z.minX;x<=Z.maxX;x+=.1)for(let z=Z.minZ;z<=Z.maxZ;z+=.1)assert(blocked(x,z),`the clerk's corner is blocked at ${x.toFixed(1)},${z.toFixed(1)}`);
  assert(blocked(L.CLERK.x,L.CLERK.z),'…including where the clerk stands');
  // Collision pushes you out of the counter, never into the clerk's corner.
  for(const [x,z] of [[0,.2],[-1.9,-1],[1.9,-2.4],[0,-2.5],[2.1,-2.65]]){const p=L.shopCollide({x,z},obs);assert(!blocked(p.x,p.z)||Math.hypot(p.x-x,p.z-z)>0,'pushed out');
   assert(!(p.x>Z.minX&&p.x<Z.maxX&&p.z>Z.minZ&&p.z<Z.maxZ),`never ends inside the clerk's corner (${x},${z} → ${p.x.toFixed(2)},${p.z.toFixed(2)})`);}
  // From the doors you can walk to every wall's stand point, the till and every shopper's spots.
  const door={x:L.DOOR.x,z:L.ROOM.front-1};assert(!blocked(door.x,door.z),'the entrance is clear');assert(!blocked(L.DOOR.x,L.ROOM.front+.3),'you can step out through the doors');
  assert(blocked(L.DOOR.x+L.DOOR.half+.4,L.ROOM.front+.3),'…but not through the sill beside them');
  const reach=(to,label)=>{assert(!blocked(to.x,to.z),label+' is clear');const path=L.findShopPath(door,to,blocked);assert(path.length>0,label+' has a path');
   const end=path[path.length-1];assert(Math.hypot(end.x-to.x,end.z-to.z)<.3,label+' is reached: '+JSON.stringify(end));
   let prev=door;for(const p of path){for(let k=0;k<=10;k++){const x=prev.x+(p.x-prev.x)*k/10,z=prev.z+(p.z-prev.z)*k/10;assert(!L.shopBlocked(x,z,obs,.2),label+': the path stays clear');}prev=p;}};
  const stations=L.stationPois();assert.deepEqual(stations.map(p=>p.station),['jersey','boots','ball']);
  assert.deepEqual(stations.map(p=>p.label),['Design a jersey','Design boots','Design a ball'],'the station prompts');
  for(const p of stations){reach(p.stand,p.id+' stand point');const s=L.segPoint(p,p.stand.x,p.stand.z);assert(Math.hypot(s.x-p.stand.x,s.z-p.stand.z)<L.NEAR_STATION,p.id+': standing there shows its prompt');}
  const cp=L.clerkPoi('Femi');assert.equal(cp.label,'Talk to Femi');reach(L.segPoint(cp,0,2),'the till');
  // The cast: a named clerk + at most the cap of shoppers, every chat partner talks kit, no brands, unique ids.
  const defs=C.shopNpcDefs();assert(C.SHOP_SHOPPERS.length<=C.SHOP_SHOPPER_CAP&&C.SHOP_SHOPPER_CAP<=5,'at most the clerk + 5 shoppers');assert(C.SHOP_SHOPPERS.length>=3,'3–5 shoppers');
  assert.equal(new Set(defs.map(d=>d.id)).size,defs.length,'unique ids');assert.equal(C.SHOP_CLERK.def.greeting,'Welcome to the Kit Shop! Want to design your own kit?');
  assert(C.SHOP_CLERK.def.lines.length>=3,'the clerk rotates kit lines');assert.deepEqual(Object.keys(C.SHOW_ME),['jersey','boots','ball'],'"Show me" a studio');
  const BRANDS=/\b(adidas|nike|puma|umbro|mizuno|kappa|reebok|new balance|under armour|jabulani|brazuca|telstar|tango|arsenal|chelsea|barcelona|madrid|united|liverpool|juventus|bayern|messi|ronaldo|pel[eé])\b/i;
  for(const d of defs){const text=[d.greeting,...(d.lines??[]),...d.topics.flatMap(t=>[t.question,t.answer,t.followUp.question,t.followUp.answer])].join(' ');
   assert(!BRANDS.test(text),d.name+': no brands, real clubs or players');assert(/kit|shirt|boot|stud|ball|number|shin|colour|panel|Law/i.test(text),d.name+' talks football kit');
   for(const l of [d.greeting,...(d.lines??[])])assert(l.length<=190,d.name+': short lines for 7–12 year olds');assert(d.topics.length>=1&&d.persona,d.name+' has a persona and a topic');}
  for(const s of C.SHOP_SHOPPERS){for(const p of s.spots)reach(p,s.def.name+' spot');
   for(let i=0;i<s.spots.length;i++){const a=s.spots[i],b=s.spots[(i+1)%s.spots.length];for(let k=0;k<=20;k++)assert(!L.shopBlocked(a.x+(b.x-a.x)*k/20,a.z+(b.z-a.z)*k/20,obs,.25),s.def.name+': the walk between displays is clear');}
   for(const p of stations)assert(Math.hypot(p.stand.x-s.spots[0].x,p.stand.z-s.spots[0].z)>.8,s.def.name+' never stands on a station’s stand point');
   if(s.with)assert(C.SHOP_SHOPPERS.some(o=>o.def.id===s.with),s.def.name+' walks with a parent');}
  assert(C.SHOP_SHOPPERS.some(s=>s.age==='kid'&&s.with),'a parent with a kid');assert(C.SHOP_SHOPPERS.some(s=>s.spots.some(p=>p.holdBoot)),'someone holds up a boot');
  assert(new Set(defs.map(d=>d.look?.skin)).size>=4,'a diverse cast');}
 // The room's wiring.
 assert(/createPlayer\('you','home',true,true\)/.test(scene)&&/player\.setBeanLook\(beanLookFor\(custom\),playerOutfit\(custom\)\)/.test(scene),'your own character walks in');
 assert(/npcDress\(def\)/.test(scene)&&/AGE_PROFILES\[age\]/.test(scene)&&/SHOP_SHOPPERS\.slice\(0,SHOP_SHOPPER_CAP\)/.test(scene),'shoppers on the townsfolk rig and looks, capped');
 assert(/className="joystick"[\s\S]{0,300}data-shop-joystick/.test(room)&&/room\.current\?\.setStick\(x\/36,y\/36\)/.test(room),'the joystick walks');
 assert(/Key\[WASD\]\|Arrow\(Up\|Down\|Left\|Right\)/.test(scene),'WASD and the arrow keys walk');
 assert(/data-shop-prompt=\{near\.id\} onClick=\{\(\)=>act\(near\)\}>\{near\.label\}/.test(room),'the prompt acts on the spot you stand at');
 assert(/\(e\.code==='Enter'\|\|e\.code==='KeyE'\)&&near/.test(room),'E or Enter acts too');
 assert(/if\(p\.kind==='station'&&p\.station\)\{open\(p\.station\);return;\}/.test(room),'a station spot opens its studio');
 assert(/<NpcConversation npc=\{talking\?\?lastTalk\.current\} open=\{!!talking\}[\s\S]{0,120}practice=\{false\} actions=\{clerkActions\}/.test(room),'the island’s NPC chat, with the clerk’s Show me replies');
 assert(/onExit:\(\)=>leave\(\)/.test(room)&&/if\(!leaving&&z>ROOM\.front-\.1&&Math\.abs\(x-DOOR\.x\)<DOOR\.half&&vz>\.15\)\{leaving=true;[^}]*callbacks\.onExit\?\.\(\);\}/.test(scene),'walking out of the doors leaves');
 assert(!/data-shop-station=/.test(room),'no studio cards along the bottom (removed at the user\'s request, Oct 12 2026)');

 // 8. Step pills (Oct 14 2026, user: "these 2 look different … use the design from ball studio and remove the bar"): Boot,
 // Jersey and Ball all render the one shared components/shop/StudioControls.tsx <StudioSteps> for their step nav, and none of
 // the three keeps its own duplicate pill CSS or a progress bar.
 {const controls=read('components/shop/StudioControls.tsx'),controlsCss=read('components/shop/StudioControls.module.css');
  assert(/export const StudioSteps=/.test(controls),'StudioControls exports the shared step pills');
  assert(/\.steps\{/.test(controlsCss)&&/\.stepBtn\{/.test(controlsCss),'the pill chrome lives once, in StudioControls.module.css');
  const studios=[['components/shop/BootStudio.tsx','components/shop/BootStudio.module.css'],
   ['components/shop/JerseyStudio.tsx','components/shop/JerseyStudio.module.css'],
   ['components/shop/BallStudio.tsx','components/shop/BallStudio.module.css']];
  for(const [tsxPath,cssPath] of studios){const tsx=read(tsxPath),css=read(cssPath);
   assert(/import\s*\{[^}]*StudioSteps[^}]*\}\s*from\s*'\.\/StudioControls'/.test(tsx),tsxPath+': imports the shared StudioSteps');
   assert(/<StudioSteps\b/.test(tsx),tsxPath+': renders <StudioSteps>');
   assert(!/\.stepTrack\{|\.progress\{|\.sparkle\{|\bstepTrack\b|\bstyles\.progress\b|\bstyles\.sparkle\b/.test(css+tsx),tsxPath+'/'+cssPath+': no progress-bar markup or CSS left behind');
   assert(!/\.stepBtn\{|^\.steps\{/m.test(css),cssPath+': no duplicate step-pill CSS (shared in StudioControls.module.css)');}}
 console.log('shop room: ok');
})().catch(e=>{console.error(e);process.exit(1);});
