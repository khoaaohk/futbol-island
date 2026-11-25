// Island stamp book (Nov 23 2026, lib/town/islandStamps.ts): eight eki-style stamps (5 Island Line stations + the Konbini cashier,
// Ada at the History Museum desk, Femi at the Kit Shop till). Headless:
//  1. the model: 8 stamps, each with one ink, a football fact and its source; collect → persist → read back; a second visit keeps
//     the first date; tilt ±4° and offset ±2 fixed at stamping; junk sanitised; "line complete" at 5 stations, "complete" on the 8th;
//  2. synced with a save code (SYNC_KEYS) and tiny; analytics ids allowlisted (is: family) with labels and call sites;
//  3. the art (v2, Nov 24 2026: more intricate): 8 original SVGs, triple ring with an ornament band + name + a football + the ink
//     filter, layered scenes (masks) shaded with hatch patterns, a date plate (the stamping date from the book), unique ids per
//     instance, each ≤ 20 KB;
//  3b. the stamp stands: a desk + pad + chained stamp + sign on every platform (signs in ONE mesh), pad + stamp at the counters;
//  4. the station houses' hover/tap boxes stand on the five stations; the prompt wants the HUD slot near a house and on hover;
//  5. the wiring: Town (glow + Collect stamp + tap), the three counters' "Can I get a stamp?", the backpack shelf, the host.
// usage: node tests/island-stamps.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
let passed=0;const ok=(c,m)=>{assert.ok(c,m);passed++;};
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 new Function('exports','module','require',code)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');

// ---- 1. the model ----
const M=load('lib/town/islandStamps.ts');
ok(M.STAMPS.length===8&&new Set(M.STAMP_IDS).size===8,'eight stamps, unique ids');
ok(JSON.stringify(M.STATION_STAMP_IDS)==='["north","west","south","summit","cay"]','the five stations, in line order');
ok(['konbini','museum','shop'].every(id=>M.stampById(id)?.where==='counter'),'konbini, museum and Kit Shop stamps come from a counter');
ok(new Set(M.STAMPS.map(s=>s.ink)).size===8&&M.STAMPS.every(s=>/^#[0-9a-f]{6}$/i.test(s.ink)),'one distinct ink colour each');
ok(M.STAMPS.every(s=>s.fact.length>60&&s.fact.length<240&&s.source.length>8&&s.how.length>10),'every stamp has a football fact, its source and how to get it');
const src=read('lib/town/islandStamps.ts');ok((src.match(/^ \/\/ .+/gm)||[]).length>=8,'each fact has its source in a code comment');
const store=new Map(),port={get:()=>store.get('k')??null,set:v=>store.set('k',v)};
ok(M.stampCount(M.readStamps(port))===0,'an empty book reads as empty');
let n=0;const rand=()=>[0,1,.5,.25][n++%4];
const a=M.collectStamp('west',Date.UTC(2026,10,23,12),port,rand);
ok(a.first&&!a.completed&&a.save.stamps.west.tilt===-4&&a.save.stamps.west.dx===2,'first stamp: recorded with its tilt and offset');
const again=M.collectStamp('west',Date.UTC(2026,10,30),port,rand);
ok(!again.first&&M.readStamps(port).stamps.west.at===Date.UTC(2026,10,23,12),'a second visit keeps the first date');
ok(store.get('k').length<120,'one stamp is tiny on disk');
for(const id of ['north','south','summit','cay'])M.collectStamp(id,Date.UTC(2026,10,24),port);
const s5=M.readStamps(port);ok(M.lineComplete(s5)&&!M.bookComplete(s5),'five stations: the line is complete, the book is not');
M.collectStamp('konbini',Date.UTC(2026,10,24),port);M.collectStamp('museum',Date.UTC(2026,10,24),port);
const last=M.collectStamp('shop',Date.UTC(2026,10,25),port);ok(last.completed&&M.stampCount(last.save)===8,'the eighth stamp completes the book');
ok(M.readStamps(port).stamps.shop.tilt>=-4&&M.readStamps(port).stamps.shop.tilt<=4,'tilt within ±4°');
ok(store.get('k').length<640,'a full book stays under 640 bytes');
M.markStampReward(port);ok(M.readStamps(port).reward===true,'the completion reward is remembered');
const junk=M.sanitizeStamps({version:1,stamps:{west:{at:5,tilt:99,dx:-9,dy:'x'},nope:{at:3},north:{at:-1}},reward:'yes'});
ok(junk.stamps.west.tilt===4&&junk.stamps.west.dx===-2&&junk.stamps.west.dy===0&&!junk.stamps.north&&!('nope' in junk.stamps)&&junk.reward===false,'junk is sanitised');
ok(M.stampCount(M.sanitizeStamps({version:2,stamps:{west:{at:1}}}))===0&&M.stampCount(M.readStamps({get:()=>'{oops',set(){}}))===0,'wrong versions and broken JSON read as empty');
ok(M.stampDate(new Date(2026,10,3).getTime())==='3 Nov 2026','the date is written like a hand-written book date');
ok(M.STAMP_PAGES.length===10&&M.STAMP_PAGES[0]==='cover'&&M.STAMP_PAGES[9]==='back'&&M.stampPage('north')===1,'pages: cover, eight stamps, back');

// ---- 2. sync + analytics ----
const snap=load('lib/saves/snapshot.ts');ok(snap.SYNC_KEYS.includes(M.ISLAND_STAMPS_KEY),'the book follows a save code (SYNC_KEYS)');
const ids=load('lib/analytics/countIds.ts').FIXED_COUNT_IDS;
ok(['is:open','is:stamp','is:complete',...M.STAMP_IDS.map(id=>'is:stamp_'+id)].every(id=>ids.includes(id)),'analytics ids allowlisted');
ok(/addLabels\('is:',STAMP_COUNT_EVENTS\)/.test(read('lib/analytics/daily.ts')),'analytics ids labelled for /admin');
const ev=read('lib/analytics/stampEvents.ts');ok(/count\('is:open'\)/.test(ev)&&/count\('is:stamp_'\+id\)/.test(ev),'analytics call sites');
const host=read('components/StampBookHost.tsx');ok(/countStampCollected/.test(host)&&/countStampBookOpen/.test(host)&&/claimStamp/.test(host),'the host counts and pays');
const rew=read('lib/town/islandStampsReward.ts');ok(/learnCoins\.pay\('book',stampRewardId\(id\)/.test(rew)&&/creditOnce\(`learn:book:\$\{STAMP_BOOK_REWARD_ID\}`/.test(rew),'learning coins are once-ever ids');

// ---- 3. the art ----
const A=load('lib/town/stampArt.ts');
for(const s of M.STAMPS){const svg=A.stampSvg(s.id);
 ok(svg.startsWith('<svg')&&svg.includes('viewBox="0 0 200 200"')&&svg.includes(`color:${s.ink}`),`${s.id}: one-ink SVG`);
 ok(svg.includes(s.name.toUpperCase())&&svg.includes('feTurbulence')&&svg.includes('feDisplacementMap'),`${s.id}: name on the ring, ink texture`);
 ok((svg.match(/r="95"/g)||[]).length>=1&&(svg.match(/<circle[^>]*r="(?:[4-9]|1[0-3])(?:\.\d)?"/g)||[]).length>=1,`${s.id}: round ring and a football in the scene`);
 ok(svg.length<=20480,`${s.id}: small (${svg.length} bytes)`);
 ok((svg.match(/<pattern /g)||[]).length>=4&&(svg.match(/<mask /g)||[]).length>=2&&(svg.match(/url\(#st-[^)]*-[dbhxs]\)/g)||[]).length>=3,`${s.id}: layered scene shaded with hatching`);
 ok(/stroke-dasharray|M[\d.]+ [\d.]+L[\d.]+ [\d.]+M/.test(svg)&&(svg.match(/<circle cx="100" cy="100"/g)||[]).length>=4,`${s.id}: ornamental triple ring`);
 ok(!/id="st-/.test(svg.replace(new RegExp(`id="st-${s.id}-`,'g'),'')),`${s.id}: every id carries the instance prefix`);
 ok((s.where==='station')===svg.includes('ISLAND LINE'),`${s.id}: Island Line on the station stamps`);}
ok(A.stampSvg('west','w','24.11.26').includes('>24.11.26</text>')&&!A.stampSvg('west').includes('24.11.26'),'the date plate shows the stamping date (an empty date box without one)');
ok(M.stampPlateDate(new Date(2026,10,4,12).getTime())==='04.11.26','plate date reads dd.mm.yy');
ok(/stampSvg\(def\.id,`\$\{def\.id\}-\$\{slot\}`,stampPlateDate\(mark\.at\)\)/.test(read('components/StampBook.tsx')),'the book passes the stamping date');
const two=A.stampSvg('west','a')+A.stampSvg('west','b');ok(!two.match(/id="st-a-f"[\s\S]*id="st-a-f"/)&&two.includes('id="st-b-f"'),'unique filter ids per instance');

// ---- 4. station houses + prompt ----
const P=load('lib/graphics/stationStampPrompt.ts'),track=load('lib/town/trainTrack.ts');
const houses=P.stationHouses();ok(houses.length===5,'five station houses');
for(const h of houses){const st=track.TRAIN_STATIONS.find(x=>x.id===h.id),c=track.trackAt(st.s),d=Math.hypot(h.x-c.x,h.z-c.z);ok(d>4&&d<11,`${h.id}: the house stands ${d.toFixed(1)} m behind the platform`);}
const scene=new T.Scene(),prompt=P.createStationStampPrompt(scene),cam=new T.PerspectiveCamera(60,1.5,.1,2000);
const ui=()=>null,upd=(x,z,y)=>prompt.update({x,z,groundY:y,onFoot:true,canEnter:true,focusKey:null,camera:cam,width:1200,height:800,ui,place(){},hide(){}});
const W=houses.find(h=>h.id==='west');
ok(upd(W.x,W.z,W.y)?.key===P.STAMP_FOCUS_KEY,'standing at a station house wants the HUD slot');
ok(upd(W.x+40,W.z,W.y)===null,'away from it: nothing');
const ray=new T.Raycaster();ray.set(new T.Vector3(W.x-20,W.y+2,W.z+20),new T.Vector3(20,0,-20).normalize());
upd(W.x-20,W.z+20,W.y);ok(prompt.pick(ray)?.id==='west','a tap ray on the house picks its station');
prompt.hover(ray,0);ok(upd(W.x-20,W.z+20,W.y)?.distance===-1,'a hovered house wants the slot as explicit intent');
ok(scene.getObjectByName('station-stamp-selection')?.getObjectByName('building-outline-glow').visible===true,'the hovered house gets the green outline');
const far=new T.Raycaster();far.set(new T.Vector3(W.x-200,W.y+2,W.z),new T.Vector3(1,0,0));upd(W.x-200,W.z,W.y);ok(prompt.pick(far)===null,'too far away: no tap or hover');
// the platform's stamp stand: hovering / tapping it picks its station, standing at it shows the button
{const st=track.TRAIN_STATIONS.find(x=>x.id==='west'),L=load('lib/town/trainLayout.ts'),sp=L.stampStandSpot(st);
 ok(Math.hypot(sp.x-W.stand.x,sp.z-W.stand.z)<.01,'west: the stand spot is the house record\'s stand');
 const r2=new T.Raycaster();r2.set(new T.Vector3(sp.x-6,W.y+1,sp.z-6),new T.Vector3(6,0,6).normalize());upd(sp.x-6,sp.z-6,W.y);prompt.hover(null,1e6);
 const hitStand=prompt.pick(r2);ok(hitStand?.id==='west','a tap ray on the stamp stand picks its station');
 prompt.hover(null,2e6);const by=L.stationSpot(st,L.STAMP_STAND_U+2.3,L.stationHouseFront(st)-L.STAMP_STAND_BACK);
 ok(Math.hypot(by.x-W.x,by.z-W.z)>P.STAMP_REACH&&upd(by.x,by.z,W.y)?.key===P.STAMP_FOCUS_KEY,'standing by the stand (beyond the house reach) wants the HUD slot');
 const all=houses.map(h=>Math.hypot(h.stand.x-h.x,h.stand.z-h.z));ok(all.every(d=>d>4&&d<8),`each stand stands by its house (${all.map(d=>d.toFixed(1)).join(', ')} m)`);}
prompt.dispose();
// ---- 3b. the stands and counter props (source checks; the world build needs a DOM canvas) ----
{const w=read('lib/town/trainWorld.ts');
 ok(/STAMP_STAND_U/.test(w)&&/emit\(ink,inkHex/.test(w)&&/cap\.beam\(a,m/.test(w),'trainWorld: desk, inked pad and rubber, and the chain on every platform');
 ok(/name='station-stamp-signs'/.test(w)&&(w.match(/new T\.Mesh\(/g)||[]).length<=6,'the five stand signs are ONE mesh (+1 draw for the line)');
 ok(/SIGN_CELL/.test(w)&&/'STAMP'/.test(w),'the sign cells are painted into the station board atlas');
 for(const [f,ink] of [['lib/konbini/konbiniScene.ts','#d06a1e'],['lib/museum/museumScene.ts','#7a5a2e'],['lib/shop/shopScene.ts','#2d6fa8']])
  ok(read(f).includes('Island stamp book (Nov 24 2026)')&&read(f).includes(ink),`${f}: an ink pad and stamp in the stamp's ink at the counter`);}

// ---- 5. wiring ----
const town=read('components/Town.tsx');
ok(/data-stamp-go/.test(town)&&/stampPrompt\.update\(/.test(town)&&/if\(stampWant\)cands\.push/.test(town)&&/stampPrompt\.pick\(characterRay\)/.test(town)&&/<StampBookHost\/>/.test(town),'Town: outline, Collect stamp button, HUD slot, tap and the host');
ok(/'station'/.test(read('lib/graphics/buildingGlow.ts')),'the building glow knows the station house');
for(const [f,id] of [['components/KonbiniRoom.tsx','konbini'],['components/MuseumRoom.tsx','museum'],['components/shop/ShopRoom.tsx','shop']])
 ok(new RegExp(`Can I get a stamp\\?[\\s\\S]{0,200}stamp:'${id}'|stamp:'${id}'[\\s\\S]{0,200}Can I get a stamp\\?`).test(read(f)),`${f}: "Can I get a stamp?" stamps ${id}`);
ok(!/OPEN_STAMP_BOOK|islandStamps/.test(read('components/KonbiniStampCard.tsx')),'the Konbini loyalty stamp card stays separate');
ok(/data-backpack-stamp-book/.test(read('components/Backpack.tsx'))&&/kind:'stamp'/.test(read('lib/town/backpack.ts')),'the backpack opens the book');
const book=read('components/StampBook.tsx');ok(/showModal/.test(book)&&/fish-stamp/.test(book)&&/turnNext|leafRight/.test(book)&&/prefers-reduced-motion/.test(book),'the book: modal, thump, page turn, reduced motion');
ok(/"test":[^\n]*node tests\/island-stamps\.cjs/.test(read('package.json')),'named in the core test chain');
console.log(`island-stamps: ${passed} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
