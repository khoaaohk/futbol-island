// Walk-in Konbini (Sep 29 2026): entry/exit state machine and door anchors, per-store menus and uniqueness, the food ledger
// through the REAL arcade wallet (one charge per purchase, no double charge on a double tap or retry, daily limit, Snacks
// pouch), the Konbini Collection (persists, rewards once), the layered reveal sequence for every item, lesson sources and the
// economy bounds (docs/economy/ECONOMY_UPDATE_2026-09-29.md §7). usage: node tests/konbini.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const F=require('../lib/konbini/food.ts'),A=require('../lib/konbini/foodArt.ts'),K=require('../lib/konbini/konbiniContent.ts'),D=require('../lib/konbini/konbiniDoors.ts'),V=require('../lib/konbini/konbiniVariants.ts');
const {createArcadeWallet}=require('../lib/arcade/arcadeWalletCore.ts');
const {CAY_KONBINI_DOOR}=require('../lib/town/coralCay.ts');
const {validIslandReturnPosition}=require('../lib/arcade/islandReturnPosition.ts');
const {LEARN_COINS}=require('../lib/town/learnCoins.ts');
const {BOOK_PRICE}=require('../lib/books/catalog.ts');

// 1. Doors and the entry/exit state machine.
{assert.equal(D.KONBINI_DOORS.cay.front,CAY_KONBINI_DOOR.z,'cay door follows the exported Coral Cay door anchor');assert.equal(D.KONBINI_DOORS.cay.x,CAY_KONBINI_DOOR.x);assert.equal(CAY_KONBINI_DOOR.yaw,0,'faces +z like ours');
 assert.deepEqual([D.KONBINI_DOORS.main.x,D.KONBINI_DOORS.main.front],[70.45,-53],'Island Square door (world.ts hub block, shifted)');
 for(const door of ['main','cay']){const d=D.KONBINI_DOORS[door],p=D.konbiniDeparture(door,'bike');
  assert(validIslandReturnPosition(p),door+' departure is a valid island return');assert.equal(p.yaw,0,'facing out (fronts face +z)');assert(p.z>d.front+2,'outside the glass');assert.equal(p.ride,'bike','keeps the ride');
  assert.equal(D.konbiniDeparture(door,'jetpack').ride,'walk','never returns in flight');
  assert(D.konbiniDoorNear(door,d.x,d.front+1.5));assert(!D.konbiniDoorNear(door,d.x,d.front+6));assert(!D.konbiniDoorNear(door,d.x+3.7,d.front+1),'the vending machine beside the door keeps its own prompt');
  assert.equal(D.nearestKonbiniDoor(d.x,d.front+1),door);}
 assert.equal(D.parseKonbiniDoor('?door=cay'),'cay');assert.equal(D.parseKonbiniDoor('?door=x'),'main');assert.equal(D.KONBINI_RETURN_URL,'/?from=konbini');
 let s={at:'outside',door:null};s=D.stepKonbini(s,{type:'enter'});assert.equal(s.at,'outside','no Enter away from a door');
 s=D.stepKonbini(s,{type:'near',door:'cay'});s=D.stepKonbini(s,{type:'enter'});assert.deepEqual(s,{at:'entering',door:'cay'});
 s=D.stepKonbini(s,{type:'near',door:'main'});assert.equal(s.door,'cay','walking past another door while entering changes nothing');
 s=D.stepKonbini(s,{type:'loaded',door:'cay'});assert.equal(s.at,'inside');s=D.stepKonbini(s,{type:'exit'});assert.equal(s.at,'exiting');
 s=D.stepKonbini(s,{type:'returned'});assert.deepEqual(s,{at:'outside',door:'cay'},'back outside the same door');}

// 2. Menus: unique per store (only staples shared), Japanese names, prices, notes, reveal layers.
{const main=F.shopMenu('main'),cay=F.shopMenu('cay'),shared=main.filter(f=>f.shops.includes('cay'));
 assert.deepEqual(shared.map(f=>f.id).sort(),['drink-sports','drink-water'],'only the water and sports drink are in both');
 assert(main.length>=15&&cay.length>=10,'each store has its own set');
 for(const id of ['musubi-classic','musubi-tamago','musubi-teriyaki','musubi-furikake','musubi-katsu','musubi-double','onigiri-salmon','onigiri-tuna','onigiri-ume','onigiri-kombu','sando-tamago','hot-karaage','hot-nikuman','hot-oden','hot-yakiimo','hot-cupnoodles','sweet-dorayaki','bento-small','sweet-melonpan','drink-water','drink-greentea','drink-milk'])assert(F.foodItem(id),id+' is on a menu');
 assert(F.foodItem('hot-yakiimo').shops.includes('main')&&F.foodItem('hot-cupnoodles').shops.includes('main')&&F.foodItem('sweet-dorayaki').shops.includes('cay'));
 const cells=new Set();
 for(const f of F.FOOD_MENU){assert(f.price>=3&&f.price<=12,f.id+' price 3–12');assert(f.jp&&/[぀-ヿ一-鿿]/.test(f.jp),f.id+' Japanese name');assert(F.foodNote(f.id).length>40,f.id+' nutrition note');
  assert(!/diet|weight|calorie|fat\b|bad food|junk/i.test(F.foodNote(f.id)+f.blurb),f.id+': food as fuel, no diet or weight talk');
  assert(!cells.has(f.cell),f.id+' own atlas cell');cells.add(f.cell);assert(!/spam\b.*can|hormel/i.test(f.blurb),'no can/brand');}
 // The layered reveal: every item has a named sequence (≥3 layers) and a drawable finish.
 for(const a of A.layerAudit()){assert(a.layers>=3,a.id+' has ≥3 layers');assert(a.names.every(n=>n.length>2),a.id+' named layers');assert(a.finished>=1,a.id+' finished stack');}
 const L=id=>A.FOOD_LAYERS[id].map(l=>l.name);
 assert.deepEqual(L('musubi-teriyaki'),['plastic tray','rice','grilled slice','teriyaki glaze','nori band']);assert(L('musubi-tamago').includes('rolled egg'));assert(L('musubi-furikake').includes('furikake sprinkle'));
 assert.equal(A.FOOD_LAYERS['onigiri-salmon'].at(-1).kind,'pull','onigiri film pulls away');assert.equal(A.FOOD_LAYERS['sando-tamago'].at(-1).kind,'replace','sando is cut to show the cross-section');
 assert(L('hot-cupnoodles').includes('hot water from the dispenser')&&L('hot-cupnoodles').includes('lid peeled back'));assert.deepEqual(L('hot-yakiimo').slice(0,3),['paper bag','sweet potato','split open']);
 assert.deepEqual(L('sweet-dorayaki'),['wooden board','bottom pancake','red bean filling','top pancake','a big bite']);assert.equal(A.FOOD_LAYERS['sweet-dorayaki'].at(-1).kind,'replace','the bite cross-fades in');
 assert.deepEqual(L('drink-water'),['bottle','label wrap','cap','condensation sparkle']);
 assert(!A.finishedLayers('hot-cupnoodles').some(l=>l.kind==='pour'||l.kind==='pull'),'pour and lid are gone from the finished item');}

// 2b. Isometric art (Sep 29 2026 redraw, lib/konbini/isoArt.ts): every item draws complete, inside its 64-unit atlas cell,
// deterministically, with a vessel first, a shadow, sane reveal sequences, and bounded caches.
{const D=require('../lib/town/drinkMachines.ts'),L=id=>A.FOOD_LAYERS[id].map(l=>l.name);
 // A recording 2D context that tracks the transform, so every drawn point can be checked against the cell.
 function mockCtx(){const ops=[];let m=[1,0,0,1,0,0];const stack=[];const pts=[];
  const ap=(x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];const mul=(a,b,c,d,e,f)=>{const [A,B,C,D,E,F]=m;m=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];};
  const pt=(x,y)=>{const p=ap(x,y);pts.push(p);return p;};
  const ctx={fillStyle:'#000',strokeStyle:'#000',lineWidth:1,lineCap:'butt',lineJoin:'miter',globalAlpha:1,font:'',textAlign:'start',textBaseline:'alphabetic',globalCompositeOperation:'source-over',
   save(){stack.push([m,this.globalAlpha,this.fillStyle]);},restore(){const s=stack.pop();if(s){m=s[0];this.globalAlpha=s[1];this.fillStyle=s[2];}},
   translate(x,y){mul(1,0,0,1,x,y);},scale(x,y){mul(x,0,0,y,0,0);},rotate(a){mul(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0);},transform(a,b,c,d,e,f){mul(a,b,c,d,e,f);},setTransform(a,b,c,d,e,f){m=[a,b,c,d,e,f];},
   beginPath(){ops.push('B');},closePath(){ops.push('Z');},moveTo(x,y){ops.push('M'+pt(x,y).map(v=>v.toFixed(2)));},lineTo(x,y){ops.push('L'+pt(x,y).map(v=>v.toFixed(2)));},
   bezierCurveTo(a,b,c,d,x,y){ops.push('C'+pt(x,y).map(v=>v.toFixed(2)));},quadraticCurveTo(a,b,x,y){ops.push('Q'+pt(x,y).map(v=>v.toFixed(2)));},arcTo(a,b,x,y){pt(x,y);ops.push('A');},
   rect(x,y,w,h){pt(x,y);pt(x+w,y+h);ops.push('R');},ellipse(x,y,rx,ry){pt(x-rx,y-ry);pt(x+rx,y+ry);ops.push('E'+x.toFixed(2));},arc(x,y,r){pt(x-r,y-r);pt(x+r,y+r);ops.push('O');},
   fill(){ops.push('F'+this.fillStyle);},stroke(){ops.push('S'+this.strokeStyle+this.lineWidth);},clip(){},fillRect(x,y,w,h){pt(x,y);pt(x+w,y+h);ops.push('r'+this.fillStyle+x.toFixed(2)+','+y.toFixed(2));},
   fillText(t,x,y){pt(x,y);ops.push('T'+t);},strokeRect(){},clearRect(){},createLinearGradient(){return {addColorStop(){}};},measureText:t=>({width:t.length*5})};
  return {ctx,ops,pts};}
 const ids=[...F.FOOD_MENU.map(f=>f.id),...D.DRINKS.map(d=>d.id)];
 for(const id of ids){const layers=A.FOOD_LAYERS[id];assert(layers&&layers.length>=3,id+' has iso layers');
  // Complete: every layer paints something and never throws; names are unique; the first layer is a plain drop (the vessel).
  assert.equal(new Set(layers.map(l=>l.name)).size,layers.length,id+' unique layer names');assert(!layers[0].kind,id+' starts with a vessel/base that drops in');
  assert(layers.filter(l=>l.kind==='replace').length<=1,id+' at most one replace');assert(layers.at(-1).kind!=='pour',id+' never ends on the pour');
  for(const l of layers){const r=mockCtx();l.draw(r.ctx,32,34,1);assert(r.ops.length>=2,`${id} · ${l.name} draws`);}
  assert(A.FOOD_SHADOW[id],id+' has a soft cast shadow');
  // Inside the cell: the finished art (vessel, food, shadow; steam excluded) stays within the 64 × 64 atlas cell.
  const f=mockCtx();A.drawFood(f.ctx,id,32,34);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of f.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  assert(x0>=-1&&y0>=-1&&x1<=65&&y1<=65,`${id} fits its atlas cell: ${[x0,y0,x1,y1].map(v=>v.toFixed(1))}`);
  assert(f.ops.filter(o=>o[0]==='r').length>=8,id+' has pixel-speckle detail');
  // Deterministic: painting twice gives the identical op stream (seeded speckles, no Math.random or time).
  const g=mockCtx();A.drawFood(g.ctx,id,32,34);assert.deepEqual(g.ops,f.ops,id+' paints deterministically');}
 assert(!/Math\.random\(|Date\.now\(|performance\.now\(/.test(fs.readFileSync(require.resolve('../lib/konbini/isoArt.ts'),'utf8')+fs.readFileSync(require.resolve('../lib/konbini/foodArt.ts'),'utf8')),'art code is seeded, not random');
 // Front mode (machine glass, slots, tray: a flat straight-on face): upright, symmetric about the base centre, standing on its
 // base line, deterministic; the iso mode stays for the reveal and tiles.
 {const DA=require('../lib/graphics/drinkArt.ts');for(const d of D.DRINKS){const f=mockCtx();DA.drawDrink(f.ctx,d.art,100,200,80,undefined,'front');let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of f.pts){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  assert(y1<=206&&y1>=198,d.id+' front: stands on its base line');assert(y0>=200-80*1.08,d.id+' front: fits its height');assert(x0>=100-80*.5&&x1<=100+80*.5,d.id+' front: fits its width');
  const g=mockCtx();DA.drawDrink(g.ctx,d.art,100,200,80,undefined,'front');assert.deepEqual(g.ops,f.ops,d.id+' front: deterministic');
  const s=DA.frontSize(d.art,80);assert(d.art.shape==='can'?s.h<80*.7:true,'cans are shorter than bottles');}}
 assert(/view='front'/.test(fs.readFileSync(require.resolve('../components/DrinkArt.tsx'),'utf8'))&&(fs.readFileSync(require.resolve('../lib/graphics/drinkArt.ts'),'utf8').match(/undefined,'front'\)/g)||[]).length>=2,'machine glass + slot pictures use the front mode');
 // Every shelf-stock item that isn't for sale opens a look-only card (Sep 30 2026: "not all the items are selectable").
 {const src=fs.readFileSync(require.resolve('../lib/konbini/konbiniScene.ts'),'utf8'),T2=require('../lib/konbini/konbiniAtlas.ts');
  for(const k of [...Object.keys(T2.DECOR).filter(k=>k!=='plant'),'surfboard']){const d=K.DECOR_INFO[k];assert(d&&d.label&&/[぀-ヿ一-鿿]/.test(d.jp)&&d.blurb.length>30,k+' has a look-only card');assert(!d.sources||d.sources.every(x=>/^https:\/\//.test(x.url)),k+' sources');}
  assert(/asFood=\(c:number\)=>foodOf\.has\(c\)\?'food' as const:decorKey\.has\(c\)\?'decor'/.test(src),'shelf stock gets a decor hit target');assert(!/item\(f,[^;]*,null,''/.test(src),'no front product is placed without a target');}
 // The requested natural layer sequences.
 assert.deepEqual(L('musubi-classic'),['plastic tray','rice','grilled slice','nori band']);
 assert.deepEqual(L('onigiri-tuna'),['bamboo leaf','rice triangle','filling','nori sheet','film pulled away']);
 assert.deepEqual(L('hot-cupnoodles'),['cup','noodle block','egg, shrimp and green onion','lid peeled back','hot water from the dispenser','broth','lid folded back','steam']);
 assert.deepEqual(A.FOOD_LAYERS['hot-cupnoodles'].map(l=>l.kind??'drop'),['drop','drop','drop','pull','pour','drop','drop','steam']);
 assert(L('hot-nikuman').includes('bamboo steamer')&&L('hot-nikuman').at(-1)==='steam'&&L('bento-small').at(-1)==='clear lid lifted'&&L('sweet-melonpan').includes('melon grid'));
 // Bounded memory: the shelf atlas stays 1024×512 RGBA (2 MiB, as before); the tile cache is capped.
 const T=require('../lib/konbini/konbiniAtlas.ts');assert(T.ATLAS_W*T.ATLAS_H*4<=2*1024*1024,'atlas ≤ 2 MiB');assert(A.FOOD_BITMAP_CACHE<=48,'tile cache capped');
 for(const f of F.FOOD_MENU){const r=T.cellRect(f.cell);assert(r.x+r.w<=T.ATLAS_W&&r.y+r.h<=T.ATLAS_H,f.id+' cell inside the atlas');}}

// 3. Teaching content has sources; each store has its own magazines, cashier and layout.
{for(const m of K.MAGAZINES){assert(m.sources.length>0&&m.sources.every(s=>/^https:\/\//.test(s.url)),m.id+' sources');assert(m.lesson.length>=2);assert(m.check.answer<m.check.options.length);}
 assert(K.shopMagazines('main').length>=4&&K.shopMagazines('cay').length>=4);assert.equal(new Set(K.MAGAZINES.map(m=>m.id)).size,K.MAGAZINES.length);
 for(const shop of ['main','cay']){const c=K.CASHIERS[shop];assert(/Irasshaimase/.test(c.greeting));assert(c.tips.filter(t=>t.kind!=='tip').every(t=>t.sources?.length),shop+' facts carry sources');}
 assert.notEqual(K.CASHIERS.main.name,K.CASHIERS.cay.name);assert(K.CASHIERS.cay.tips.some(t=>t.kind==='culture'&&/Hawaii/.test(t.text)));
 for(const l of Object.values(K.SHELF_LESSONS))if(l.title!=='Toys & gear')assert(l.sources.length>0,l.title+' sources');
 assert.equal(F.FOOD_SOURCES[0].url,'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf','same FIFA source as the Coral Cay farm');
 const m=V.KONBINI_VARIANTS.main,c=V.KONBINI_VARIANTS.cay;assert.equal(m.doorX,-c.doorX,'mirrored doors');assert(Math.sign(m.cashier.x)!==Math.sign(c.cashier.x),'counter on the other side');
 const fridge=v=>v.fixtures.find(f=>f.kind==='fridgeWall');assert(Math.sign(fridge(m).x)!==Math.sign(fridge(c).x),'fridge wall moved');assert(c.fixtures.some(f=>f.kind==='beachCorner')&&!m.fixtures.some(f=>f.kind==='beachCorner'));assert.notEqual(m.palette.floor,c.palette.floor);}

// 3b. The bite toy on the big item view (lib/konbini/biteToy.ts, Sep 30 2026): tap → bite / sip, BITES then all gone, then a
//     rebuild (tap or REBUILD_MS), forever; reduced motion skips the puff and haptic but still cuts; never touches saves.
{const B=require('../lib/konbini/biteToy.ts');
 const mk=(kind,reducedFlag=false)=>{const log=[],timers=[];let rebuilt=0;
  const toy=B.createBiteToy({kind,label:kind==='sip'?'Water':'Melon pan',reduced:()=>reducedFlag,render:(b,g,p)=>log.push(['render',b,g,p]),sound:s=>log.push(['sound',s]),vibrate:ms=>log.push(['vibrate',ms]),
   announce:t=>log.push(['say',t]),rebuild:()=>{rebuilt++;log.push(['rebuild']);},setTimer:(fn,ms)=>{const t={fn,ms,live:true};timers.push(t);return t;},clearTimer:t=>{t.live=false;}});
  return {toy,log,timers,rebuilt:()=>rebuilt};};
 // Food: taps before the build finishes do nothing; then 4 bites, the last is "all gone", the 5th tap rebuilds at once.
 {const {toy,log,timers,rebuilt}=mk('bite');assert.equal(toy.tap(),false,'no bite while the item is still building');assert.equal(log.length,0);
  toy.built();for(let i=1;i<=B.BITES;i++){assert(toy.tap());assert.equal(toy.state().bites,i);}
  assert.equal(B.BITES,4);assert(toy.state().gone,'all gone after BITES bites');
  const renders=log.filter(l=>l[0]==='render');assert.deepEqual(renders.map(r=>r.slice(1)),[[1,false,true],[2,false,true],[3,false,true],[4,true,true]],'one redraw (+ puff) per bite');
  assert.deepEqual(log.filter(l=>l[0]==='say').map(l=>l[1]),['Bite 1 of 4','Bite 2 of 4','Bite 3 of 4','All gone! Making another…']);
  assert.equal(log.filter(l=>l[0]==='sound'&&l[1]==='bite').length,4,'a bite sound every tap');assert(log.some(l=>l[0]==='sound'&&l[1]==='gone'));
  assert(log.filter(l=>l[0]==='vibrate').every(l=>l[1]>=12&&l[1]<=20)&&log.filter(l=>l[0]==='vibrate').length===4,'a short 12–20 ms haptic per bite');
  assert.equal(timers.length,1);assert.equal(timers[0].ms,B.REBUILD_MS);assert(B.REBUILD_MS>=400&&B.REBUILD_MS<=800,'a short beat');
  assert(toy.tap(),'the next tap rebuilds');assert.equal(rebuilt(),1);assert(!timers[0].live,'the auto-rebuild timer is cancelled (no double rebuild)');
  assert.equal(toy.tap(),false,'no bites while it rebuilds');toy.built();assert.deepEqual(toy.state(),{bites:0,gone:false,ready:true,rebuilds:1},'bites start again');
  // …or the automatic beat rebuilds it.
  for(let i=0;i<B.BITES;i++)toy.tap();timers.at(-1).fn();assert.equal(rebuilt(),2,'auto rebuild after the beat');toy.built();
  for(let loop=0;loop<3;loop++){for(let i=0;i<B.BITES;i++)toy.tap();toy.tap();toy.built();}assert.equal(toy.state().rebuilds,5,'loops forever, like a toy');
  toy.dispose();for(let i=0;i<B.BITES;i++)toy.tap();toy.dispose();assert(!timers.at(-1).live,'dispose cancels a pending rebuild');assert.equal(toy.tap(),false,'disposed with the view');}
 // Drinks sip; the level drops a notch each sip and the last empties it.
 {const {toy,log}=mk('sip');toy.built();toy.tap();toy.tap();assert.equal(log.filter(l=>l[0]==='sound')[0][1],'sip');assert.deepEqual(log.filter(l=>l[0]==='say').map(l=>l[1]),['Sip 1 of 4','Sip 2 of 4']);
  assert.deepEqual([0,1,2,3,4,5].map(B.drinkLevel),[1,.75,.5,.25,0,0]);assert.equal(B.biteLabel('sip','Water'),'Take a sip of Water');assert.equal(B.biteLabel('bite','Melon pan'),'Take a bite of Melon pan');}
 // Reduced motion: bites still cut (render), no puff animation, no haptic; the rebuild is instant (the reveal's reduced path).
 {const {toy,log}=mk('bite',true);toy.built();toy.tap();assert.deepEqual(log.find(l=>l[0]==='render'),['render',1,false,false],'reduced: still cuts, no crumb puff');assert(!log.some(l=>l[0]==='vibrate'),'reduced: no haptic');
  const rev=fs.readFileSync(require.resolve('../components/KonbiniReveal.tsx'),'utf8');
  assert(/if\(reduced\)\{draw\(layers\.length\);setStep\(layers\.length\);setBuilt\(true\);ready\(\);return;\}/.test(rev),'reduced-motion rebuild: the finished item at once, bites ready');
  assert(/if\(!puff\)\{paintEaten\(a,item,drink,geo,bites,gone,-1\);return;\}/.test(rev),'no puff: one static redraw');}
 // Geometry: on a round item the bites land right edge → top-left → top, each cutting in from an edge; the cut is scalloped (teeth).
 {const n=B.MASK,mask=new Uint8Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++)mask[y*n+x]=Math.hypot(x-24,y-26)<14?1:0;
  const b=B.maskBounds(mask,300),[s1,s2,s3]=B.biteSpots(mask,300);assert(Math.abs(b.cx-153)<4&&Math.abs(b.cy-165.6)<4,'centroid');
  assert(s1.x>b.cx+b.size*.35,'bite 1 on the right edge');assert(s2.x<b.cx&&s2.y<b.cy,'bite 2 top-left');assert(s3.y<b.cy-b.size*.3&&s3.r>s1.r,'bite 3: a bigger one from the top');
  for(const s of [s1,s2,s3]){const d=Math.hypot(s.x-b.cx,s.y-b.cy);assert(d-s.r<b.size/2&&d>b.size*.3,'overlaps the edge: takes a chunk, not air');}
  const pts=B.scallop(s1),rad=pts.map(([x,y])=>Math.hypot(x-s1.x,y-s1.y));assert(Math.max(...rad)-Math.min(...rad)>s1.r*.12,'scalloped tooth marks');
  assert.deepEqual(B.crumbsFor(0,s1,b),B.crumbsFor(0,s1,b),'crumbs are seeded (same picture each redraw)');
  assert.equal(B.biteSpots(new Uint8Array(n*n),300).length,3,'an empty mask still gives spots (never throws)');}
 // Never charges or changes saves: the toy has no imports (no ledger, wallet or storage) and its ports never reach them.
 {const src=fs.readFileSync(require.resolve('../lib/konbini/biteToy.ts'),'utf8');assert(!/^import\s/m.test(src)&&!/localStorage|sessionStorage|spend|ledger|wallet\.|collect\(/.test(src.replace(/\/\*\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'biteToy is self-contained');
  const rev=fs.readFileSync(require.resolve('../components/KonbiniReveal.tsx'),'utf8'),toyBlock=rev.slice(rev.indexOf('const t=createBiteToy('),rev.indexOf('toy.current=t;'));
  assert(toyBlock.length>100&&!/onEat|onSave|onBuy|onDone|localStorage|spend/.test(toyBlock),'the bite ports never eat, save, buy or close');
  assert(/const bite=\(\)=>\{toy\.current\?\.tap\(\);\};/.test(rev),'a tap only feeds the toy');
  const store=new Map([['fi2-konbini-v1','{"version":1}'],['fi2-arcade-wallet-v1','{"runs":{}}']]),before=JSON.stringify([...store]);let writes=0;
  const prevLS=globalThis.localStorage;globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:()=>{writes++;},removeItem:()=>{writes++;}};
  try{const {toy}=mk('bite');toy.built();for(let i=0;i<9;i++)toy.tap();}finally{globalThis.localStorage=prevLS;}
  assert.equal(writes,0,'no save writes while biting');assert.equal(JSON.stringify([...store]),before);}
 // Sound: original oscillator/noise one-shots, muted with the island's sound setting.
 {let made=0;const prevLS=globalThis.localStorage,prevAC=globalThis.AudioContext;globalThis.localStorage={getItem:k=>k==='fi2-sound-muted'?'true':null,setItem(){},removeItem(){}};globalThis.AudioContext=function(){made++;throw new Error('no audio in node');};
  try{const S=require('../lib/konbini/konbiniSound.ts');S.konbiniSfx.bite();S.konbiniSfx.sip();S.konbiniSfx.gone();assert.equal(made,0,'muted: no audio context at all');}finally{globalThis.localStorage=prevLS;globalThis.AudioContext=prevAC;}
  const snd=fs.readFileSync(require.resolve('../lib/konbini/konbiniSound.ts'),'utf8');assert(/bite:\(\)=>\{tone\(/.test(snd)&&/sip:\(\)=>\{sweep\(/.test(snd)&&!/\.mp3|\.wav|\.ogg|fetch\(/.test(snd),'synthesized, no samples');}
 // Heat: one static redraw per bite and a bounded puff; no loop left running.
 assert(B.PUFF_MS<=300,'crumb puff ≤ 300 ms');}

// 4. The food ledger through the real arcade wallet.
(async()=>{
 let wallet={version:1,runs:{'island-starter-coins:0':{game:'live',paid:20,reason:'Welcome coins',at:1},'grant':{game:'island',paid:20,reason:'grant',at:1}},packs:[]},q=Promise.resolve(),clock=Date.UTC(2026,8,29,10);
 const W=createArcadeWallet({read:()=>structuredClone(wallet),write:s=>{wallet=structuredClone(s);},lock:fn=>{const p=q.then(fn);q=p.catch(()=>{});return p;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>clock,id:()=>Math.random().toString(),random:()=>0});
 const start=W.load().balance;assert(start>=35,'funded');
 let store=null,col=null,spends=0,rewards=[];const day=t=>new Date(t).toISOString().slice(0,10);
 const ports={read:()=>store&&structuredClone(store),write:s=>{store=structuredClone(s);},readCollection:()=>col&&structuredClone(col),writeCollection:s=>{col=structuredClone(s);},now:()=>clock,day,
  spend:async(id,cost,reason)=>{spends++;return W.spend(id,cost,reason);},reward:async(id,coins)=>{rewards.push(id);return coins;},lock:fn=>Promise.resolve().then(fn)};
 const L=F.createKonbiniLedger(ports);
 assert(!(await L.buy('musubi-teriyaki','p0','main')).ok,'a Coral Cay item is not sold at Island Square');
 // Double tap: the same purchase id twice charges once.
 const [a1,a2]=await Promise.all([L.buy('musubi-classic','p1','main'),L.buy('musubi-classic','p1','main')]);assert(a1.ok&&a2.ok);
 assert.equal(W.load().balance,start-5,'one charge for a double tap');assert.equal(L.read().purchases.length,1);
 assert(a1.firstTime||a2.firstTime,'first purchase joins the collection');
 assert.equal(L.resolve('p1','eat').ok,true,'eat the first one now');assert.equal(L.resolve('p1','eat').ok,false,'can’t eat twice');
 const b=await L.buy('musubi-tamago','p2','main');assert(b.ok);assert.equal(L.resolve('p2','pouch').ok,true,'save one to the Snacks pouch');
 const c=await L.buy('musubi-furikake','p3','main');assert(c.ok);
 assert.equal(W.load().balance,start-5-6-5,'each purchase charged exactly once');
 const limit=await L.buy('onigiri-ume','p4','main');assert(!limit.ok&&limit.limit&&/fuelled up/i.test(limit.reason),'daily tummy-full limit');assert.equal(W.load().balance,start-16,'the refused buy costs nothing');
 // Eat one now, store one, the third defaults to the pouch.
 L.settle();assert.deepEqual(F.pouch(L.read()).map(p=>p.id),['p2','p3'],'Snacks pouch holds the saved snacks');
 const eaten=L.eatFromPouch('p2');assert(eaten.ok&&/carbohydrate/i.test(eaten.note));assert.equal(L.eatFromPouch('p2').ok,false);
 // Re-buying the same food the next day works (consumable, not owned-once) and charges again.
 clock+=86400000;const again=await L.buy('musubi-classic','p5','main');assert(again.ok&&!again.firstTime);assert.equal(W.load().balance,start-21);
 // Not enough coins: nothing recorded, nothing charged.
 assert((await L.buy('bento-small','p6','main')).ok);assert.equal(W.load().balance,start-31);
 const poor=await L.buy('bento-small','p7','main');assert(!poor.ok&&/more coin/.test(poor.reason),'not enough coins');assert.equal(W.load().balance,start-31,'nothing charged');assert(!L.read().purchases.some(p=>p.id==='p7'),'failed debit leaves no pending purchase');
 // Pouch capacity.
 {let w={version:1,runs:{'g':{game:'island',paid:60,reason:'grant',at:1}},packs:[]},wq=Promise.resolve(),now=Date.UTC(2026,9,1,9),st=null;
  const Wp=createArcadeWallet({read:()=>structuredClone(w),write:v=>{w=structuredClone(v);},lock:fn=>{const p=wq.then(fn);wq=p.catch(()=>{});return p;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>now,id:()=>Math.random().toString(),random:()=>0});
  const Lp=F.createKonbiniLedger({...ports,read:()=>st&&structuredClone(st),write:v=>{st=structuredClone(v);},now:()=>now,readCollection:()=>null,writeCollection:()=>{},spend:(id,cost,reason)=>Wp.spend(id,cost,reason)});
  for(const [i,id] of ['onigiri-ume','onigiri-kombu','onigiri-salmon'].entries()){assert((await Lp.buy(id,'q'+i,'main')).ok);assert(Lp.resolve('q'+i,'pouch').ok,'pouch slot '+(i+1));}
  assert.equal(F.pouch(Lp.read()).length,F.POUCH_SIZE,'the pouch holds POUCH_SIZE snacks');
  now+=86400000;assert((await Lp.buy('onigiri-tuna','q3','main')).ok);
  const over=Lp.resolve('q3','pouch');assert(!over.ok&&new RegExp('holds '+F.POUCH_SIZE).test(over.reason),'a fourth snack is refused by the full pouch');
  assert.equal(F.pouch(Lp.read()).length,F.POUCH_SIZE,'still full, nothing dropped');assert(Lp.resolve('q3','eat').ok,'it can be eaten now instead');
  assert(Lp.eatFromPouch('q0').ok);assert((await Lp.buy('onigiri-ume','q4','main')).ok);assert(Lp.resolve('q4','pouch').ok,'eating one frees a slot');
  // Trimming the save (code review finding 14): 250 old eaten records are trimmed, pouch snacks never are.
  const old=Array.from({length:250},(_,i)=>({id:'old'+i,item:'onigiri-ume',price:3,at:1000+i,paid:true,fate:'eaten'}));
  const saved=F.sanitizeKonbini({version:1,purchases:[{id:'keep-oldest',item:'onigiri-ume',price:3,at:1,paid:true,fate:'pouch'},...old],stamps:[],stampPaid:false});
  assert(saved.purchases.some(p=>p.id==='keep-oldest'),'the oldest record, still in the pouch, survives the trim');assert.equal(saved.purchases.length,200);}
 // A failure after the debit never says "your coins were not spent" (code review finding 14).
 {let st=null;const Lf=F.createKonbiniLedger({...ports,read:()=>st&&structuredClone(st),write:v=>{if(v.purchases.some(p=>p.paid))throw new Error('quota');st=structuredClone(v);},readCollection:()=>null,writeCollection:()=>{},spend:async()=>({ok:true})});
  const r=await Lf.buy('onigiri-ume','fail1','main');assert(!r.ok&&r.charged&&!/not spent/.test(r.reason),'charged failure is reported honestly: '+r.reason);
  const Lc=F.createKonbiniLedger({...ports,read:()=>null,write:()=>{},readCollection:()=>null,writeCollection:()=>{},spend:async()=>{throw new Error('offline');}});
  const r2=await Lc.buy('onigiri-ume','fail2','main');assert(!r2.ok&&!r2.charged&&/not spent/.test(r2.reason));
  const Lr=F.createKonbiniLedger({...ports,read:()=>st&&structuredClone(st),write:v=>{st=structuredClone(v);},readCollection:()=>null,writeCollection:()=>{throw new Error('quota');},spend:async()=>({ok:true})});
  st=null;assert((await Lr.buy('onigiri-ume','ok1','main')).ok,'a collection write failure after a good purchase still counts as bought');}
 // Collection persists across a reload (new ledger on the same saves) and rewards are due once.
 const L2=F.createKonbiniLedger(ports);assert.deepEqual(Object.keys(L2.readCollection().items).sort(),['bento-small','musubi-classic','musubi-furikake','musubi-tamago']);
 let colState=F.emptyCollection(),due=[];for(const f of F.shopMenu('main')){const r=F.collect(colState,f.id,1);colState=r.state;due.push(...r.due.map(d=>d.id));}
 assert.deepEqual(due,['konbini-set-main'],'finishing Island Square pays its set reward once');colState={...colState,rewards:due};
 for(const f of F.shopMenu('cay')){const r=F.collect(colState,f.id,1);colState=r.state;due.push(...r.due.map(d=>d.id));colState={...colState,rewards:[...new Set([...colState.rewards,...r.due.map(d=>d.id)])]};}
 assert.deepEqual(due,['konbini-set-main','konbini-set-cay','konbini-set-all']);assert.equal(F.collect(colState,'drink-water',2).due.length,0,'never again');
 assert.equal(F.sanitizeCollection(JSON.parse(JSON.stringify(colState))).rewards.length,3,'saved rewards survive a reload');
 // Extension API: a registered consumable + collection group (the drink machines' hook).
 F.registerConsumables([{id:'test-drink',label:'Test drink',price:3,group:'hydration',blurb:'x',limit:{key:'drinks',perDay:1}}]);
 F.registerCollectionGroup({id:'drink-machines',label:'Drink machines',items:[{id:'test-drink',label:'Test drink',hint:'Drink machine'}]});
 const d1=await L.buy('test-drink','d1');assert(d1.ok,'registered consumable buys through the same ledger');assert(!(await L.buy('test-drink','d2')).ok,'its own daily limit');
 assert(F.collectionProgress(F.collect(F.emptyCollection(),'test-drink',1).state).groups.some(g=>g.id==='drink-machines'&&g.have===1));

 // 5. Economy bounds (docs/economy/ECONOMY_UPDATE_2026-09-29.md §7): cheap, a 1–2 week collection, never a book rival.
 const CASUAL=81,total=F.FOOD_MENU.reduce((n,f)=>n+f.price,0),days=Math.ceil(F.FOOD_MENU.length/F.FOOD_PER_DAY),rewardsTotal=F.COLLECTION_REWARDS.reduce((n,r)=>n+r.coins,0);
 assert(total<=2*CASUAL,`collecting everything (${total}) costs under two days of casual income`);
 assert(days>=7&&days<=14,`${days} days at ${F.FOOD_PER_DAY}/day: a 1–2 week goal`);
 const maxDay=[...F.FOOD_MENU].sort((a,b)=>b.price-a.price).slice(0,F.FOOD_PER_DAY).reduce((n,f)=>n+f.price,0);
 assert(maxDay<=.45*CASUAL,`the most a day can cost (${maxDay}) stays under half a casual day`);assert(maxDay<BOOK_PRICE/2);
 assert(rewardsTotal<total/3,'set rewards give back only a small part');assert(rewardsTotal+LEARN_COINS.explore<=40,'collection + stamp card learning coins stay small');
 assert(Math.max(...F.FOOD_MENU.map(f=>f.price))<=12);
 // 6. Drinks from the outdoor machines (registered on the Konbini page too) never use up the food "tummy full" limit.
 {const DM=require('../lib/town/drinkMachines.ts');const drink=DM.DRINKS[0];assert(F.consumable(drink.id),'drinks register as consumables');
  let st=null;const L3=F.createKonbiniLedger({...ports,read:()=>st&&structuredClone(st),write:v=>{st=structuredClone(v);},readCollection:()=>null,writeCollection:()=>{}});
  for(let i=0;i<3;i++)await W.creditOnce('konbini-test-fund-'+i,'island',20,'test fund');
  clock+=86400000;const d=await L3.buy(drink.id,'dm1');assert(d.ok,'drink bought through the same ledger');
  assert.equal(F.boughtToday(L3.read(),clock,day,'food'),0,'a machine drink does not count toward the food limit');
  for(const [i,id] of ['musubi-classic','musubi-tamago','onigiri-ume'].entries())assert((await L3.buy(id,'df'+i,'main')).ok,'all three snacks still allowed after a drink');}
 // 7. Shelf zoom state machine and bays (the vending-machine pattern).
 {const Z=require('../lib/konbini/konbiniZoom.ts');const sec=[{poi:'drinks',label:'Drinks fridge',x:0,z:-5.5,yaw:0,len:7.7,height:2.7,cy:1.3,fz:.46,elev:.3,fi:0,lx:0},{poi:'hot',label:'Hot counter',x:5,z:1,yaw:-Math.PI/2,len:1.5,height:.9,cy:1.4,fz:.4,elev:.2,fi:1,lx:0}];
  const phone=Z.zoomTargets(sec,390/844),desk=Z.zoomTargets(sec,1280/800);assert(phone.length>desk.length,'portrait splits long shelves into narrower bays');
  assert(phone.every(t=>t.width<=Z.bayWidth(390/844)*1.09),'each phone bay stays about as narrow as the phone bay');assert.equal(phone.filter(t=>t.poi==='drinks').length,4);
  const near=Z.nearestTarget(phone,'drinks',3,-4);assert.equal(phone[near].bay,3,'Look picks the bay in front of you');
  let st2={mode:'walk'};st2=Z.stepZoom(st2,{type:'look',index:near},phone.length);assert.deepEqual(st2,{mode:'zoom',index:3});
  st2=Z.stepZoom(st2,{type:'step',dir:1},phone.length);assert.equal(st2.index,4,'→ moves to the neighbouring section');st2=Z.stepZoom(st2,{type:'step',dir:1},phone.length);assert.equal(st2.index,4,'clamped at the last section');
  st2=Z.stepZoom(st2,{type:'buy'},phone.length);assert.equal(st2.index,4,'buying keeps the zoom');st2=Z.stepZoom(st2,{type:'revealDone'},phone.length);assert.equal(st2.mode,'zoom','back to the zoomed shelf after the reveal');
  assert.deepEqual(Z.stepZoom(st2,{type:'back'},phone.length),{mode:'walk'});assert.equal(Z.easeZoom(0),0);assert.equal(Z.easeZoom(1),1);assert(Z.ZOOM_IN_SECONDS>=.8&&Z.ZOOM_IN_SECONDS<=1.2);
  const src=fs.readFileSync(require('node:path').join(__dirname,'../lib/konbini/konbiniScene.ts'),'utf8');
  assert(/setClip\(true\)/.test(src)&&/near=zoomed\?ZD-/.test(src),'zoom clips shelves in front of the target (no extra geometry)');
  assert(/const busy=ballMoving\|\|kb\.moving\|\|!!wobble\|\|!!zoom/.test(src),'the camera tween is the only extra work (ball actions only while moving), and idle zoomed views sleep');}
 // 8. In-store music: original per-store loops; start, idle, hidden, mute, dispose.
 {const Mu=require('../lib/konbini/konbiniMusic.ts');const fakeCtx=()=>({createBuffer:(c,len,rate)=>{const d=new Float32Array(len);return {getChannelData:()=>d,length:len,sampleRate:rate};}});
  const a=Mu.renderKonbiniLoop(fakeCtx(),'main').getChannelData(0),b=Mu.renderKonbiniLoop(fakeCtx(),'cay').getChannelData(0);
  const peak=x=>x.reduce((m,v)=>Math.max(m,Math.abs(v)),0),energy=x=>x.reduce((m,v)=>m+v*v,0)/x.length;
  assert(peak(a)<=.71&&peak(b)<=.71&&energy(a)>1e-4&&energy(b)>1e-4,'bounded, audible loops');assert.notEqual(a.length,b.length,'a distinct track per store (different tempo)');
  assert.notEqual(Mu.KONBINI_TRACKS.main.name,Mu.KONBINI_TRACKS.cay.name);
  const log=[];let timers=[];const ctx={state:'running',currentTime:0,destination:{},createBuffer:fakeCtx().createBuffer,createGain:()=>({gain:{value:0,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime:(v)=>log.push('ramp:'+v)},connect(){},disconnect:()=>log.push('gain-off')}),
   createBufferSource:()=>({buffer:null,loop:false,connect(){},disconnect:()=>log.push('src-off'),start:()=>log.push('start'),stop:()=>log.push('stop')}),resume:async()=>{ctx.state='running';},suspend:async()=>{ctx.state='suspended';log.push('suspend');},close:async()=>{ctx.state='closed';log.push('close');}};
  let settings={enabled:true,volume:.04},hidden=false;const ports={context:()=>ctx,settings:()=>settings,hidden:()=>hidden,now:()=>0,setTimer:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimer:()=>{}};
  const m=Mu.createKonbiniMusic('cay',ports);m.start();assert(log.includes('start'),'music starts on entry');assert.equal(m.debug.starts,1);m.input();assert.equal(m.debug.starts,1,'input does not restart it');
  hidden=true;m.visibility();await new Promise(r=>setTimeout(r,5));assert(log.includes('suspend'),'suspended while the tab is hidden');hidden=false;m.visibility();
  const idleTimer=timers.find(t=>t.ms===Mu.KONBINI_MUSIC_IDLE_MS);assert(idleTimer,'idle timer armed (island rule)');idleTimer.fn();assert(m.debug.idle,'idle after 30 s without input');
  // Idle, then a tab switch and back with no input (code review finding 8): it stays idle and suspended, no ramp back up.
  for(const t of timers.slice())if(t.ms!==Mu.KONBINI_MUSIC_IDLE_MS)t.fn();await new Promise(r=>setTimeout(r,5));assert.equal(ctx.state,'suspended','suspended after the idle fade');
  const armed=timers.filter(t=>t.ms===Mu.KONBINI_MUSIC_IDLE_MS).length,ramps=log.filter(x=>x.startsWith('ramp:')&&x!=='ramp:0').length;
  hidden=true;m.visibility();hidden=false;m.visibility();await new Promise(r=>setTimeout(r,5));
  assert(m.debug.idle&&ctx.state==='suspended','still idle after the tab comes back');assert.equal(log.filter(x=>x.startsWith('ramp:')&&x!=='ramp:0').length,ramps,'no fade back in');
  assert.equal(timers.filter(t=>t.ms===Mu.KONBINI_MUSIC_IDLE_MS).length,armed,'nothing re-armed while idle');
  m.input();assert(!m.debug.idle,'the next input wakes it');
  m.dispose();await new Promise(r=>setTimeout(r,5));assert(log.includes('stop')&&log.includes('close'),'stopped and closed on exit');assert.equal(ctx.state,'closed');
  settings={enabled:false,volume:.04};const log2=log.length;const muted=Mu.createKonbiniMusic('main',{...ports,context:()=>({...ctx,state:'running',close:async()=>{}})});muted.start();assert(!log.slice(log2).includes('start'),'muted: nothing plays');assert(muted.debug.muted);}
 // 9. Indoor dribble: the player's own ball follows the rig and stays out of shelves; the island's full-power shot never runs
 //    indoors (the Konbini's own capped shot and keep-ups are §13).
 {const src=fs.readFileSync(require('node:path').join(__dirname,'../lib/konbini/konbiniScene.ts'),'utf8');
  assert(/player\.dribbleContact\(ballAim\)/.test(src),'ball follows the rig’s dribble contact');assert(/ballLook\.setStyle\(custom\.ball\)/.test(src),'customised ball style (same as outside)');
  assert(/for\(const o of obstacles\)\{const r=\.2;if\(ballAim/.test(src),'ball kept out of aisles, counter and fridge');
  assert(!/createWalkBall/.test(src),'no island walkBall shot (38–60 m/s) indoors');assert(/createKonbiniBall\(obstacles,/.test(src),'the indoor ball uses the store’s own collision boxes');
  assert(!/onNudge|No kicking in the shop/.test(src+fs.readFileSync(require('node:path').join(__dirname,'../components/KonbiniRoom.tsx'),'utf8')),'the old "no kicking" nudge is gone');}
 // 10. Building highlight / from-the-air Enter: the footprints hold their doors.
 for(const door of ['main','cay']){const b=D.KONBINI_BUILDINGS[door],d=D.KONBINI_DOORS[door];assert(Math.abs(d.x-b.x)<b.w/2,'door on the facade');assert(Math.abs(b.z+b.d/2-d.front)<.01,door+' front face = door line');}
 {const town=fs.readFileSync(require('node:path').join(__dirname,'../components/Town.tsx'),'utf8');assert(/\{index:3,kind:'konbini'/.test(town)&&/\{index:4,kind:'caykonbini'/.test(town),'both Konbinis use the shared building highlight');
  assert(/flightNear\(konbiniBounds\.main\)/.test(town)&&/\['caykonbini',nearKonbiniCay,KONBINI_DOORS\.cay\.x,3\.1,KONBINI_DOORS\.cay\.front,konbiniBounds\.cay\]/.test(town),'flight Enter uses the building bounds');}
 // 11. Double tap through the UI's purchase gate (code review finding 1). Every Buy tap makes a DISTINCT purchase id (crypto
 //     randomUUID, as newPurchaseId does), so the wallet's idempotent spend can't merge them: KonbiniRoom holds one gate from the tap
 //     until the reveal closes. Two taps within the 900 ms receipt delay = one charge; after the reveal closes the next Buy charges.
 {const {createPurchaseGate}=require('../lib/konbini/purchaseGate.ts');
  let w={version:1,runs:{'grant-a':{game:'island',paid:40,reason:'grant',at:1}},packs:[]},wq=Promise.resolve(),now=Date.UTC(2026,9,5,10);
  const W2=createArcadeWallet({read:()=>structuredClone(w),write:v=>{w=structuredClone(v);},lock:fn=>{const p=wq.then(fn);wq=p.catch(()=>{});return p;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>now,id:()=>Math.random().toString(),random:()=>0});
  let st=null;const L4=F.createKonbiniLedger({...ports,read:()=>st&&structuredClone(st),write:v=>{st=structuredClone(v);},now:()=>now,readCollection:()=>null,writeCollection:()=>{},spend:(id,cost,reason)=>W2.spend(id,cost,reason)});
  const before=W2.load().balance,ids=new Set(),newId=()=>{const id=globalThis.crypto.randomUUID();ids.add(id);return id;};
  const gate=createPurchaseGate();
  // KonbiniRoom.buy: begin → buyFood(fresh id) → on failure end; on success the gate stays held through receipt + reveal.
  const tap=async item=>{if(!gate.begin())return null;const r=await L4.buy(item,newId(),'main');if(!r.ok)gate.end();return r;};
  const t1=await tap('onigiri-ume');assert(t1&&t1.ok,'first tap buys');
  const t2=await tap('onigiri-ume');// ~200 ms later, the receipt still on screen
  assert.equal(t2,null,'second tap during the receipt is ignored');
  assert.equal(W2.load().balance,before-3,'a double tap with distinct ids is one charge');assert.equal(L4.read().purchases.length,1);
  // Without the gate the same two taps WOULD charge twice (the reason the gate exists).
  const g1=await L4.buy('onigiri-ume',newId(),'main'),g2=await L4.buy('onigiri-ume',newId(),'main');assert(g1.ok&&g2.ok&&ids.size===3,"the refused tap made no purchase id");
  assert.equal(W2.load().balance,before-9,'distinct ids are separate charges at the ledger');
  gate.end();// the reveal closed
  assert(gate.begin(),'the next deliberate Buy may start after the reveal');gate.end();
  const room=fs.readFileSync(require('node:path').join(__dirname,'../components/KonbiniRoom.tsx'),'utf8');
  assert.equal((room.match(/if\(!f\|\|!gate\.begin\(\)\)return/g)||[]).length,1,'food Buy uses the gate');assert(/if\(!gate\.begin\(\)\)return;setBusy\(item\.id\)/.test(room),'gear/pack Buy uses the gate');
  assert(/setReveal\(null\);release\(\);/.test(room)&&/setPackReveal\(null\);release\(\);/.test(room),'released only when the reveal / pack reveal closes');
  assert(/e\.repeat\|\|/.test(room),'a held Enter (key repeat) never buys again');}
 // 12. Tap-to-walk behind the counter (code review finding 4): an unreachable goal walks to the closest reachable spot (never
 //     into the counter), and a target that stops getting closer is dropped after 0.5 s, so the scene loop can idle.
 {const P=require('../lib/konbini/konbiniPath.ts');
  const obstacles=[{minX:3.8,maxX:4.2,minZ:-2.2,maxZ:2.2},{minX:3.8,maxX:7.7,minZ:-2.2,maxZ:-1.8},{minX:3.8,maxX:7.7,minZ:1.8,maxZ:2.2}];// a closed counter pen against the east wall
  const blocked=(px,pz,r=.3)=>{if(px<-7.7+r||px>7.7-r||pz< -5.9+r||pz>6.4)return true;for(const o of obstacles)if(px>o.minX-r&&px<o.maxX+r&&pz>o.minZ-r&&pz<o.maxZ+r)return true;return false;};
  const t0=performance.now(),behind=P.findFloorPath({x:0,z:0},{x:6,z:0},blocked),ms=performance.now()-t0;
  assert(behind.length>0,'walks toward the counter');const last=behind.at(-1);
  assert(last.x<3.8&&last.x>3,'stops at the closest reachable spot in front of the counter, not behind it: '+JSON.stringify(last));
  assert(behind.every(p=>!blocked(p.x,p.z)),'never routes through the counter');
  const open=P.findFloorPath({x:0,z:0},{x:-4,z:3},blocked);assert.deepEqual(open.at(-1),{x:-4,z:3},'a reachable goal is reached exactly');
  assert.deepEqual(P.findFloorPath({x:3.5,z:0},{x:3.5,z:0},blocked),[],'already there: no path');
  const w=P.createStuckWatch(.5),tg={x:6,z:0};let frames=0;w.step(tg,2.5,1/30);while(!w.step(tg,2.5,1/30)&&frames<100)frames++;
  assert(frames>=13&&frames<=16,'no progress → dropped after ~0.5 s ('+frames+' frames)');
  const w2=P.createStuckWatch(.5);let d=3;for(let i=0;i<60;i++){assert(!w2.step(tg,d,1/30),'steady walking is never "stuck"');d-=.1;}
  const scene=fs.readFileSync(require('node:path').join(__dirname,'../lib/konbini/konbiniScene.ts'),'utf8');
  assert(/findFloorPath\(\{x,z\}/.test(scene)&&/stuck\.step\(target,d,dt\)\)\{target=null;route=\[\];arrivePoi=null;/.test(scene),'the scene uses both');
  console.log('konbini path: unreachable goal search',ms.toFixed(1),'ms');}
 // 13. Ball actions (Sep 30 2026, lib/konbini/konbiniBall.ts): a capped soft shot that rebounds off the store's collision boxes and
 //     returns to the feet; tap-timed keep-ups with a saved best; no coins, purchases or other saves touched; buttons hidden when
 //     zoomed, in dialogs, the reveal/preview and the exit walk; the ball is only stepped while it's off the feet.
 {const B=require('../lib/konbini/konbiniBall.ts'),W=require('../lib/town/walkBall.ts'),path=require('node:path');
  // Capped power: the island's hold curve, a fraction of the island's shot speed.
  assert.equal(B.holdPower(0),0);assert.equal(B.holdPower(180),0,'0.18 s dead zone like the island');assert.equal(B.holdPower(10000),1);assert.equal(B.holdPower(1080),.5);
  const lo=B.indoorLaunch(0),hi=B.indoorLaunch(1),over=B.indoorLaunch(5);assert(hi.speed<=6&&over.speed===hi.speed,'full charge capped at 6 m/s');assert(hi.speed*6<W.SHOT_SPEED,'well under the island shot ('+W.SHOT_SPEED+' m/s)');
  assert(lo.speed>=2&&lo.speed<hi.speed,'a tap is a soft pass');assert(hi.lift<=2.5&&hi.lift*hi.lift/(2*B.INDOOR_SHOT.gravity)<.3,'a low skip (apex under 30 cm), never into the ceiling');
  // A full-power shot at a shelf bay 2 m ahead: strike ≤ 6 m/s, hits fixture 3, rebounds, rolls to rest, then the island's recall.
  const shelf={minX:-1,maxX:1,minZ:2,maxZ:2.8,fi:3},ev=[],ball=B.createKonbiniBall([shelf],e=>ev.push(e)),p={x:0,z:0,yaw:0};
  assert(ball.beginCharge(p));assert(!ball.beginCharge(p),'no second charge while charging');for(let i=0;i<30;i++)ball.update(1/30,p);assert(ball.state.charge>0&&ball.state.charge<1);
  assert(ball.release(p,5000));let t=0,maxSpeed=0,maxY=0,inside=0;
  while(ball.state.mode!=='feet'&&t<8){ball.update(1/30,p);t+=1/30;maxSpeed=Math.max(maxSpeed,Math.hypot(ball.state.vx,ball.state.vz));maxY=Math.max(maxY,ball.state.y);
   if(ball.state.x>shelf.minX&&ball.state.x<shelf.maxX&&ball.state.z>shelf.minZ&&ball.state.z<shelf.maxZ)inside++;}
  const strike=ev.find(e=>e.type==='strike'),hit=ev.find(e=>e.type==='hit');
  assert(strike&&strike.speed<=6,'strike capped');assert(maxSpeed<=6.01,'never faster than the cap');assert(maxY<.6,'stays low indoors');
  assert(hit&&hit.fi===3,'the shot reports the shelf bay it hit');assert.equal(inside,0,'never passes into the shelf');
  assert.equal(ev.at(-1).type,'returned','the ball comes back');assert.equal(ball.state.mode,'feet');assert(t<5,'back at the feet within 5 s ('+t.toFixed(2)+' s)');
  assert(Math.hypot(ball.state.x-p.x,ball.state.z-p.z)<.7,'at the player’s feet');
  // Walls: a shot into the back wall rebounds (fi −1) and still returns; the doors count as a wall (the ball never leaves the store).
  {const e2=[],b2=B.createKonbiniBall([],e=>e2.push(e)),q={x:0,z:5,yaw:0};b2.beginCharge(q);b2.release(q,5000);let u=0,maxZ=0;while(b2.state.mode!=='feet'&&u<8){b2.update(1/30,q);u+=1/30;maxZ=Math.max(maxZ,b2.state.z);}
   assert(e2.some(e=>e.type==='hit'&&e.fi===-1),'the front glass rebounds it');assert(maxZ<B.BALL_ROOM.maxZ,'stays inside');assert.equal(b2.state.mode,'feet');}
  // A shot started facing a shelf from close by never starts inside it.
  {const b3=B.createKonbiniBall([shelf]),q={x:0,z:1.5,yaw:0};b3.beginCharge(q);b3.release(q,0);assert(!b3.blockedAt(b3.state.x,b3.state.z),'release point pulled out of the shelf');}
  // Keep-ups: tap from the feet starts the streak; taps count only while the ball drops through the touch window.
  const kev=[],k=B.createKonbiniBall([],e=>kev.push(e)),me={x:0,z:0,yaw:0},step=()=>k.update(1/60,me);
  assert(k.tap(me));assert.equal(k.state.streak,1);assert(!k.tap(me),'an early tap (ball rising) does not count');assert.equal(kev.at(-1).type,'early');
  for(let n=2;n<=7;n++){let guard=0;while(!(k.state.vy<0&&k.state.y<=B.KEEPUP.window-.05)&&guard++<200)step();assert(k.tap(me),'touch '+n);assert.equal(k.state.streak,n);}
  assert(kev.filter(e=>e.type==='touch').map(e=>e.streak).join()==='1,2,3,4,5,6,7');
  let guard=0;while(k.state.mode==='keepup'&&guard++<400)step();const drop=kev.find(e=>e.type==='drop');assert(drop&&drop.streak===7&&drop.reason==='missed','a missed touch drops the ball and ends the streak at 7');
  while(k.state.mode!=='feet'&&guard++<800)step();assert.equal(k.state.mode,'feet','the dropped ball comes back to the feet');
  assert(B.keepUpTip(5)&&B.keepUpTip(10)&&B.keepUpTip(20)&&!B.keepUpTip(7),'milestone tips at 5, 10 and 20');assert(/laces/i.test(B.keepUpTip(5)));
  // Walking into a shelf mid keep-ups drops the ball (it stays in the aisle).
  {const e4=[],b4=B.createKonbiniBall([shelf],e=>e4.push(e)),q={x:0,z:.8,yaw:0};assert(b4.tap(q));q.z=1.6;b4.update(1/60,q);assert(e4.some(e=>e.type==='drop'&&e.reason==='shelf'),'walking into a shelf drops it');
   const b5=B.createKonbiniBall([shelf]);assert(!b5.tap({x:0,z:1.4,yaw:0}),'no keep-ups nose-to-shelf');}
  // The best streak persists per player (versioned localStorage record), and only that key is written.
  const mem=new Map(),st={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
  assert.deepEqual(B.readBallRecord(st),{v:1,best:0,shotTip:false});
  assert.deepEqual(B.recordStreak(7,st),{best:7,newBest:true});assert.deepEqual(B.recordStreak(4,st),{best:7,newBest:false});assert.equal(B.readBallRecord(st).best,7,'persists');
  assert.deepEqual(B.recordStreak(12,st),{best:12,newBest:true});assert(B.takeShotTip(st));assert(!B.takeShotTip(st),'the shot tip shows once');assert.equal(B.readBallRecord(st).best,12,'the tip flag keeps the best');
  assert.deepEqual([...mem.keys()],[B.BALL_RECORD_KEY]);assert.equal(JSON.parse(mem.get(B.BALL_RECORD_KEY)).v,1);
  mem.set(B.BALL_RECORD_KEY,'{bad');assert.equal(B.readBallRecord(st).best,0,'corrupt → fresh');mem.set(B.BALL_RECORD_KEY,'{"v":2,"best":99}');assert.equal(B.readBallRecord(st).best,0,'other version ignored');
  assert.equal(B.readBallRecord(null).best,0,'no storage (private mode) still works');
  // No charge or save changes: the module and the room's ball handler never touch coins, purchases, stamps or collections.
  const ballSrc=fs.readFileSync(path.join(__dirname,'../lib/konbini/konbiniBall.ts'),'utf8'),room=fs.readFileSync(path.join(__dirname,'../components/KonbiniRoom.tsx'),'utf8');
  assert(!/wallet|spend|ledger|buyFood|buyVending|stamp|collection|purchase/i.test(ballSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')),'konbiniBall has no economy access');
  const handler=room.slice(room.indexOf('ballEvent.current=e=>'),room.indexOf('};',room.indexOf('ballEvent.current=e=>')));
  assert(handler.length>50&&!/buy|pay|wallet|stamp|resolveFood|credit|recordExplore/i.test(handler),'the room’s ball handler only shows bubbles and saves the best');
  // Controls: island keys (Space hold / J), buttons hidden when zoomed, covered, previewing, leaving; ≥ 44 px targets.
  const scene=fs.readFileSync(path.join(__dirname,'../lib/konbini/konbiniScene.ts'),'utf8');
  assert(/e\.code==='Space'\)\{if\(e\.type==='keydown'&&!e\.repeat\)beginShot\(\);else if\(e\.type==='keyup'\)endShot\(\);\}/.test(scene),'Space: hold to charge, release to shoot');assert(/e\.code==='KeyJ'/.test(scene),'J: keep-ups');
  assert(/const actionsOn=ready&&!failed&&!zoom&&!overlay&&!reveal&&!preview&&!packReveal&&!talking&&!walkingOut&&!leaving;/.test(room),'buttons hidden zoomed, in dialogs, reveal/preview and the exit walk');
  assert(/\{actionsOn&&<div className=\{`travel-actions \$\{styles\.ballActions\}`\}/.test(room)&&/className="touch-shoot"/.test(room)&&/className="touch-juggle"/.test(room),'the island’s round action buttons');
  assert(/const ballFree=\(\)=>!leaving&&!leaveStarted&&!covered&&!disposed&&zoomIndex===null&&!zoom&&!eat;/.test(scene),'the scene refuses ball actions when zoomed/covered/leaving');
  assert(/function zoomToIndex[^\n]*settleBall\(\)/.test(scene)&&/setCovered\(value:boolean\)\{covered=value;if\(value\)\{settleBall\(\)/.test(scene),'zoom and dialogs bring the ball home');
  const css=fs.readFileSync(path.join(__dirname,'../components/KonbiniRoom.module.css'),'utf8');for(const m of css.matchAll(/--action-size:(\d+)px/g))assert(Number(m[1])>=44,'action buttons ≥ 44 px');
  // Heat: stepped only while off the feet; the store's busy flag covers the ball and the wobble, so an idle store still sleeps.
  assert(/if\(kb\.moving\)kb\.update\(dt,bp\(\)\);/.test(scene)&&/const busy=ballMoving\|\|kb\.moving\|\|!!wobble\|\|!!zoom/.test(scene),'ball physics only while moving');
  assert(/if\(!bay\?\.length\|\|reduced\|\|hidden\)return false;/.test(scene),'reduced motion: no shelf wobble');
  assert(B.BALL_SOURCES.some(s=>/englandfootball\.com/.test(s.url))&&B.BALL_SOURCES.some(s=>/fifatrainingcentre\.com/.test(s.url)),'coaching points cite The FA and FIFA Training Centre');
  assert(/middle of the ball/.test(B.SHOT_TIP)&&/inside of your foot/.test(B.SHOT_TIP));
  console.log('konbini ball: shot',t.toFixed(2),'s round trip, max',maxSpeed.toFixed(2),'m/s, apex',maxY.toFixed(2),'m; keep-ups streak 7 saved');}
 console.log('KONBINI_PASS',JSON.stringify({items:F.FOOD_MENU.length,main:F.shopMenu('main').length,cay:F.shopMenu('cay').length,total,days,maxDay,rewardsTotal,spends}));
})().catch(e=>{console.error(e);process.exit(1);});
