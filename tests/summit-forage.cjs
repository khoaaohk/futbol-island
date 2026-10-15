// Summit Isle fruit trees (Oct 13 2026; orchard, eight fruit kinds, daily fruiting, ride/fly shake, trunk grip, GPU sway and ball
// hits Oct 14 2026). Covers: the orchard's placement rules (trail verges, the summit ring, clear zones, no steep ground) and its draw
// and triangle budget; the fruit trees are reachable on foot; each day ~60% fruit (stable all day, different tomorrow) and picked
// fruit stays gone until tomorrow; the prompt on foot, riding and flying low (not too high, not in traffic); the hop-off and the
// land-then-shake sequence; hands-on contact per form; the shake sways only that tree and settles to rest; a hard kicked ball knocks
// fruit down (a soft one doesn't, a bare tree drops none, the daily cap holds); pickups go into the basket; every kind sells; nothing
// runs at rest; dispose. Rules: lib/town/summitForage.ts, lib/town/summitOrchard.ts; runtime: lib/graphics/fruitTrees.ts.
// usage: node tests/summit-forage.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const timers={raf:0,timeout:0,interval:0},winListeners=new Map();
const fakeWindow={addEventListener:(t,fn)=>{if(!winListeners.has(t))winListeners.set(t,new Set());winListeners.get(t).add(fn);},removeEventListener:(t,fn)=>winListeners.get(t)?.delete(fn),
 requestAnimationFrame:()=>{timers.raf++;return 1;},setTimeout:()=>{timers.timeout++;return 1;},setInterval:()=>{timers.interval++;return 1;}};
const cache=new Map();
function load(file){
 file=path.isAbsolute(file)?file:path.resolve(ROOT,file);
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 if(file.endsWith('.json'))return mod.exports=JSON.parse(fs.readFileSync(file,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
  window:fakeWindow,requestAnimationFrame:fakeWindow.requestAnimationFrame,setTimeout:fakeWindow.setTimeout,setInterval:fakeWindow.setInterval,navigator:undefined,document:undefined,
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return id==='react'?{useSyncExternalStore:(_s,get)=>get()}:require(id);
   const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const T=require('three');
const S=load('lib/town/summitIsle.ts'),W=load('lib/town/summitIsleWorld.ts'),F=load('lib/town/summitForage.ts'),Sim=load('lib/town/simulation.ts');
const RT=load('lib/graphics/fruitTrees.ts'),goods=load('lib/town/market/goods.ts'),pocket=load('lib/town/market/pocket.ts'),O=load('lib/town/summitOrchard.ts');

// ---- Build the island (stub tools, like tests/summit-isle.cjs) to get its trees, palms and colliders.
const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
 sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[]};
W.buildSummitIsle(tools);
const sites=W.SUMMIT_TREE_SITES.map(s=>({...s,top:{...s.top}}));
assert(sites.some(s=>s.kind==='tree')&&sites.some(s=>s.kind==='palm'),'the build lists its trees and palms (SUMMIT_TREE_SITES)');
const obstacles=tools.obstacles,blockedAt=(x,z)=>Sim.blocked(x,z,obstacles,.32),ground=(x,z)=>S.summitGround(x,z)-S.SUMMIT_VISUAL_DROP;

// ---- 1. The pool of fruit trees: every orchard plant + the island's own trees and palms; all eight kinds; deterministic.
const world={walkable:S.onSummitIsle,blocked:blockedAt,ground,paths:S.SUMMIT_PATHS,landing:S.SUMMIT_LANDMARKS.sandbarLanding,beach:(x,z)=>S.beachPoint(Math.atan2(z-S.SUMMIT_CENTER.z,x-S.SUMMIT_CENTER.x),.5),view:(x,z,y)=>S.summitCameraPull(x,z,y,x+F.FOLLOW_CAMERA.x,y+F.FOLLOW_CAMERA.y,z+F.FOLLOW_CAMERA.z)};
const picks=F.pickFruitTrees(sites,world),BEFORE=10;// Oct 13 2026: 7 mango/orange trees + 3 coconut palms
assert(picks.length>=BEFORE*4,`roughly 4–7× the old ${BEFORE} fruit trees (${picks.length})`);assert(picks.length<=90,'but bounded');
assert.deepEqual(F.pickFruitTrees(sites,world).map(t=>t.id),picks.map(t=>t.id),'deterministic: the same trees on every device');
assert.equal(new Set(picks.map(t=>t.id)).size,picks.length,'unique ids');
const kinds=new Set(picks.map(t=>t.fruit));for(const k of F.FRUIT_KINDS)assert(kinds.has(k),'grows '+k);
const forms=new Set(picks.map(t=>t.form??t.kind));for(const f of [...O.ORCHARD_FORMS,'tree','palm'])assert(forms.has(f),'has the form '+f);
for(const t of picks){
 assert(goods.goodById(t.fruit)&&pocket.pocketCategory(goods.goodById(t.fruit))==='fruit',`${t.fruit} is a basket good in the Fruit pocket`);
 if(t.fruit==='coconut')assert(t.kind==='palm'&&t.y<1,'coconut palms stand on the beach');
 if(t.form)assert(O.FORM_FRUIT[t.form].includes(t.fruit),`${t.id}: a ${t.form} bears ${t.fruit}`);
 assert(S.onSummitIsle(t.x,t.z),`${t.id} roots on walkable Summit Isle ground (not a cliff)`);
 assert(world.view(t.stand.x,t.stand.z,ground(t.stand.x,t.stand.z))>=F.MIN_VIEW,`${t.id}: the follow camera sees it`);
 assert(S.onSummitIsle(t.stand.x,t.stand.z)&&!blockedAt(t.stand.x,t.stand.z),`${t.id}: its grip spot is walkable and clear of every collider`);
 assert(t.sides.length>=1,`${t.id}: a side to grip it from`);
 const others=obstacles.filter(o=>Sim.insideObstacle(t.x,t.z,o,0));assert.equal(others.length,1,`${t.id}: only its own trunk collider is there`);}
// Spread: any 60 m stretch of the island has a mix (no single-kind orchard).
{let mixed=0,areas=0;for(const t of picks){const near=picks.filter(u=>Math.hypot(u.x-t.x,u.z-t.z)<60);if(near.length<4)continue;areas++;if(new Set(near.map(u=>u.fruit)).size>=3)mixed++;}
 assert(mixed/areas>=.9,`any area has a mix of fruit (${mixed}/${areas})`);}
const L=S.SUMMIT_LANDMARKS.sandbarLanding,welcome=picks.filter(t=>t.welcome);
assert.equal(welcome.length,1,'one welcome tree');assert(Math.hypot(welcome[0].x-L.x,welcome[0].z-L.z)<60,'the welcome tree is near the sandbar landing');

// ---- 2. The orchard's placement: trail verges both sides, a summit ring, clear zones, never steep, never on a trail.
const orchard=sites.filter(s=>s.form),zones=O.orchardClearZones();
{const plan=O.planOrchard((x,z,r)=>false,[]);
 assert.deepEqual(O.planOrchard((x,z,r)=>false,[]).map(p=>[p.x,p.z,p.form]),plan.map(p=>[p.x,p.z,p.form]),'the plan is deterministic');}
assert(orchard.length>=50,`the orchard plants ${orchard.length} fruit trees and plants`);
const zoneOf=t=>{const d=S.summitTrailDistance(t.x,t.z);if(Math.hypot(t.x-S.TERRACE.x,t.z-S.TERRACE.z)<S.summitEdgeRadius(Math.atan2(t.z-S.TERRACE.z,t.x-S.TERRACE.x))+8)return 'top';return d<9?'trail':'other';};
const trailTrees=orchard.filter(t=>zoneOf(t)==='trail'),topTrees=orchard.filter(t=>zoneOf(t)==='top');
assert(trailTrees.length>=15,`an orchard walk along the trails (${trailTrees.length})`);assert(topTrees.length>=8,`a cluster round the summit (${topTrees.length})`);
// Both verges: trees on the left and on the right of the climb.
{const climb=S.SUMMIT_PATHS[1];let left=0,right=0;for(const t of trailTrees){let best=Infinity,side=0;for(let i=1;i<climb.length;i++){const a=climb[i-1],b=climb[i],d=Math.hypot((a.x+b.x)/2-t.x,(a.z+b.z)/2-t.z);if(d<best){best=d;side=Math.sign((b.x-a.x)*(t.z-a.z)-(b.z-a.z)*(t.x-a.x));}}if(best<12){if(side>0)left++;else right++;}}
 assert(left>=3&&right>=3,`both sides of the climb (${left} left, ${right} right)`);}
for(const t of orchard){
 assert(S.summitTrailDistance(t.x,t.z)>=O.TRAIL_CLEAR,`${t.form} at ${t.x.toFixed(0)},${t.z.toFixed(0)} stands ${O.TRAIL_CLEAR} m clear of every trail`);
 assert(S.summitSlope(t.x,t.z)<=O.ORCHARD_MAX_SLOPE,'never on steep ground or a cliff');
 assert(!O.nearPitch(t.x,t.z)&&S.terraceWeight(t.x,t.z)===0,'off the pitch, its fence and the walkway');
 for(const c of zones)assert(Math.hypot(c.x-t.x,c.z-t.z)>=c.r,`clear of the ${c.what}`);}
// The lookout and the zipline's tower (Oct 14 2026: on the removed telescope's spot; the same clear circles, so the orchard is
// planned exactly as before): ≥ 4 m of open grass round each.
{const Lk=S.SUMMIT_LANDMARKS.lookout,Z=load('lib/town/zipline.ts');
 for(const [what,p] of [['lookout',Lk],['zipline tower',Z.ZIP_TOWER],['zipline tower seaward grass',{x:Lk.x-9.2,z:Lk.z-2}],['lookout walkway',{x:Lk.x-2.4,z:Lk.z}]])
  for(const t of sites)if(t.form)assert(Math.hypot(t.x-p.x,t.z-p.z)>=O.ORCHARD_CLEAR,`no orchard tree within ${O.ORCHARD_CLEAR} m of the ${what}`);
 const kick=load('lib/town/summitKick.ts').kickLayout(),snack=load('lib/town/vendingPlaces.ts').summitSnackSpot();
 for(const t of orchard){assert(Math.hypot(t.x-kick.post.x,t.z-kick.post.z)>=O.ORCHARD_CLEAR,'clear of Summit Kick');assert(Math.hypot(t.x-snack.x,t.z-snack.z)>=O.ORCHARD_CLEAR,'clear of the kiosk');}}

// ---- 3. Heat: no new draw call per tree, the triangle budget, and the fruit mesh sized to today's fruit.
{const props=town.children.filter(m=>/^summit-isle(-summit)?-props/.test(m.name));
 assert(props.length<=9,`the orchard is baked into the island's existing prop meshes (${props.length} meshes, one per sector + the summit)`);
 assert(!town.children.some(m=>/orchard|fruit/i.test(m.name)),'no orchard or fruit mesh in the island build');
 const tris=O.planOrchard(()=>false,[]).map(O.orchardTriangles),total=tris.reduce((a,b)=>a+b,0);
 assert(Math.max(...tris)<=160,`≤ 160 triangles a plant (${Math.max(...tris)})`);assert(total<=9000,`orchard ≤ 9k triangles on every tier (${total})`);
 const withTree=props.filter(m=>m.geometry.getAttribute('aTree'));assert(withTree.length>=8,'the props carry the per-tree sway id');
 const ids=new Set();for(const m of withTree){const a=m.geometry.getAttribute('aTree');for(let i=0;i<a.count;i++)ids.add(a.getX(i));}
 for(const t of sites)assert(ids.has(t.tid),`tree ${t.tid} is tagged for its sway`);
 console.log(`  orchard: ${orchard.length} plants, ${total} triangles baked into ${props.length} existing meshes (0 new draws); per plant ≤ ${Math.max(...tris)}`);}

// ---- 4. The day's fruit: ~60% of the trees, stable all day, different tomorrow; the welcome tree always.
{const days=['2026-10-13','2026-10-14','2026-10-15','2026-11-02','2027-01-01'],sets=days.map(d=>F.fruitingToday(picks,d));
 for(const [i,set] of sets.entries()){const share=set.size/picks.length;assert(share>=.5&&share<=2/3+1e-9,`${days[i]}: ${(share*100).toFixed(0)}% of the trees fruit`);
  assert(set.has(welcome[0].id),'the welcome tree fruits every day');
  assert.deepEqual([...F.fruitingToday(picks,days[i])].sort(),[...set].sort(),'stable within a day');}
 for(let i=1;i<sets.length;i++){const a=sets[i-1],b=sets[i],same=[...a].filter(x=>b.has(x)).length;assert(same<a.size*.85,`${days[i]} differs from ${days[i-1]} (${same}/${a.size} shared)`);}
 for(const t of picks){const n=F.fruitToday(days[0],t.id);assert(n>=2&&n<=F.FORAGE.perTree);}
 const h0=RT.hangPoint(picks[0],0,days[0]),h1=RT.hangPoint(picks[0],0,days[1]);assert(h0.distanceTo(h1)>.05||RT.hangPoint(picks[0],1,days[0]).distanceTo(RT.hangPoint(picks[0],1,days[2]))>.05,'the fruit hangs in different spots on different days');}

// ---- 5. Pure rules: drop counts, ball drops, picked fruit gone until tomorrow, daily cap, save sanitising.
{const R=F.FORAGE;
 for(let r=0;r<1;r+=.05){const n=F.dropCount(r,3,99);assert(n>=1&&n<=3,'a shake drops 1–3');}
 assert.equal(F.dropCount(.99,1,99),1,'never more than hang there');assert.equal(F.dropCount(.99,3,2),2,'never past today’s cap');assert.equal(F.dropCount(.5,3,0),0,'none once the cap is reached');
 assert.equal(F.ballDropCount(3,3,9),0,'a gentle roll drops nothing');assert.equal(F.ballDropCount(6,3,9),1,'a firm kick drops one');assert.equal(F.ballDropCount(12,3,9),2,'a hard one two');assert.equal(F.ballDropCount(12,3,0),0,'the cap holds');
 const t0=new Date(2026,9,13,10,0,0).getTime(),id='tree-593-45';let s=F.emptyForage(t0);
 assert.equal(F.hangingNow(s,id,t0,3),3,'a fruiting tree starts with its dawn fruit');
 s=F.recordPick(s,id,t0);s=F.recordPick(s,id,t0+1000);assert.equal(F.hangingNow(s,id,t0+1000,3),1);assert.equal(s.today,2);
 assert.equal(F.hangingNow(s,id,t0+6*3600e3,3),1,'picked fruit stays gone all day (no regrow)');
 const tomorrow=new Date(2026,9,14,8,0,0).getTime();assert.equal(F.hangingNow(s,id,tomorrow,3),3,'a new day, the tree is full again');
 assert.equal(Object.keys(F.sanitizeForage(JSON.parse(JSON.stringify(s)),tomorrow).trees).length,0,'yesterday’s picks are forgotten');
 assert(R.dailyCap>=5&&R.dailyCap<=12,'a sensible daily cap');
 const best=Math.max(...F.FRUIT_KINDS.map(g=>goods.goodById(g).price));const M=load('lib/town/market/market.ts');
 assert(R.dailyCap*best<=M.MARKET_FULL_PRICE_COINS,`a day's fruit (${R.dailyCap*best} coins) fits in the market's full-price allowance`);
 let c=F.emptyForage(t0);for(let i=0;i<R.dailyCap;i++)c=F.recordPick(c,'palm-569-27',t0+i);assert.equal(F.capLeft(c,t0+10),0,'cap reached');
 assert.equal(F.capLeft(c,tomorrow),R.dailyCap,'a new day, a new allowance');assert.equal(F.recordPick(c,'palm-569-27',tomorrow).today,1);
 const dirty=F.sanitizeForage({version:1,day:F.localForageDay(t0),today:99,tip:'yes',trees:{'tree-1-2':{n:9,t:t0},'__proto__':{n:1,t:1},'bad':{n:1,t:1},'palm-3-4':{n:1,t:t0+9e9},'tree-600--3':{n:1,t:t0}}},t0);
 assert.equal(dirty.today,R.dailyCap);assert.equal(dirty.tip,false);assert.deepEqual(Object.keys(dirty.trees).sort(),['palm-3-4','tree-1-2','tree-600--3']);assert.equal(dirty.trees['tree-1-2'].n,R.perTree);assert.equal(dirty.trees['palm-3-4'].t,t0,'no future clocks');
 assert.deepEqual(F.sanitizeForage('nonsense',t0),F.emptyForage(t0));}

// ---- 6. Hands on the trunk: per form, the chest is trunk radius + 0.25 m from the grip axis; the root clear of the collider.
{const byForm=new Map();for(const t of picks){const f=t.form??t.kind;if(!byForm.has(f))byForm.set(f,t);}
 assert.equal(F.TRUNK_CLEARANCE,Sim.TRUNK_CLEARANCE,'the trunk clearance matches simulation.ts');
 for(const [form,t] of byForm){const g=t.rig.grip;assert(g.r>.05&&g.r<.3,`${form}: a trunk radius at grip height (${g.r.toFixed(2)})`);assert(Math.abs(g.y-t.y-O.GRIP_HEIGHT)<.02,`${form}: grip at chest height`);
  for(const a of t.sides){const c=F.contactAt(t,a);
   assert(Math.abs(Math.hypot(c.contact.x-g.x,c.contact.z-g.z)-(g.r+F.FORAGE.contact))<1e-9,`${form}: contact = trunk radius + ${F.FORAGE.contact} m`);
   const own=obstacles.find(o=>Sim.insideObstacle(t.x,t.z,o,0));assert(!Sim.insideObstacle(c.root.x,c.root.z,own,F.WALKER_RADIUS),`${form}: the root stays outside the trunk collider`);
   assert(c.lean>=0&&c.lean<.75,`${form}: the body leans the last ${c.lean.toFixed(2)} m`);
   const yaw=Math.atan2(g.x-c.root.x,g.z-c.root.z);assert(Math.abs(Math.atan2(Math.sin(yaw-c.face),Math.cos(yaw-c.face)))<1e-6,`${form}: faces the trunk`);}}
 // A leaning palm: the grip follows its lean, not the base.
 const palm=picks.find(t=>t.kind==='palm');assert(Math.hypot(palm.rig.grip.x-palm.x,palm.rig.grip.z-palm.z)>.01,'a leaning palm’s grip follows its trunk');}

// ---- 6b. Each kind reads as itself: a banana is a long, slim crescent; pears taper to the stem; a mango is a curved oval.
{const ext=L=>{const pts=[];for(let i=0;i<=24;i++){const y=-1+i/12,rr=Math.sqrt(Math.max(0,1-y*y));for(let a=0;a<8;a++)pts.push(RT.fruitPoint(L,rr*Math.cos(a*Math.PI/4),y,rr*Math.sin(a*Math.PI/4)));}
  const box=new T.Box3().setFromPoints(pts),size=box.getSize(new T.Vector3());return {pts,size};};
 const LK=F.FRUIT_LOOK,B=ext(LK.banana);
 const len=Math.hypot(B.size.x,B.size.y),thick=B.size.z;assert(len/thick>=3.5,`a banana finger is long and slim (${(len/thick).toFixed(1)}:1)`);
 // Curved: the middle of its axis sits well off the chord between its two ends.
 const tip=RT.fruitPoint(LK.banana,0,1,0),end=RT.fruitPoint(LK.banana,0,-1,0),mid=RT.fruitPoint(LK.banana,0,0,0),chord=tip.distanceTo(end);
 const off=new T.Vector3().subVectors(mid,end).cross(new T.Vector3().subVectors(tip,end).normalize()).length();
 assert(off/chord>=.12,`a banana is curved (sagitta ${(off/chord*100).toFixed(0)}% of its length)`);
 for(const k of ['orange','lime','coconut']){const s=ext(LK[k]).size;assert(Math.max(s.x,s.y,s.z)/Math.min(s.x,s.y,s.z)<1.2,`${k} is round`);}
 for(const k of ['papaya','avocado','guava']){const top=RT.fruitPoint(LK[k],1,.6,0).x,bottom=RT.fruitPoint(LK[k],1,-.4,0).x;assert(top<bottom*.9,`${k} is a pear, narrower toward the stem`);}
 assert(ext(LK.papaya).size.y>ext(LK.papaya).size.x*1.5,'a papaya is long');assert(ext(LK.mango).size.y>ext(LK.mango).size.x*1.2&&LK.mango.bend>0,'a mango is a curved oval');
 assert(LK.lime.r<LK.orange.r,'a lime is smaller than an orange');
 const rgb=h=>{const n=parseInt(h.slice(1),16),c={r:(n>>16&255)/255,g:(n>>8&255)/255,b:(n&255)/255};c.getHSL=()=>{const o=new T.Color();o.r=c.r;o.g=c.g;o.b=c.b;return o.getHSL({},T.LinearSRGBColorSpace);};return c;};
 const g=rgb(LK.avocado.color),y=rgb(LK.banana.color),cn=rgb(LK.coconut.color),lm=rgb(LK.lime.color);
 assert(g.g>g.r&&g.g>g.b&&g.getHSL({}).l<.3,'an avocado is dark green');assert(lm.g>lm.r&&lm.g>lm.b,'a lime is green');assert(y.r>.8&&y.g>.7&&y.b<.4,'a banana is yellow');
 const hsl=cn.getHSL({});assert(hsl.h>.03&&hsl.h<.12&&hsl.l<.45,'a coconut is brown');
 // The banana hand: 4–6 fingers pointing out and up; fallen ones lie flat (long axis horizontal).
 for(let n=RT.BANANA.hand[0];n<=RT.BANANA.hand[1];n++){const hand=RT.bananaLayout(n,false);assert.equal(hand.length,n);
  for(const m of hand){const ax=new T.Vector3(0,1,0).transformDirection(m);assert(ax.y>.3&&Math.hypot(ax.x,ax.z)>.5,'each finger points out and up from the stalk');}}
 for(let n=RT.BANANA.fallen[0];n<=RT.BANANA.fallen[1];n++)for(const m of RT.bananaLayout(n,true)){const ax=new T.Vector3(0,1,0).transformDirection(m),up=new T.Vector3(0,0,1).transformDirection(m),bend=new T.Vector3(1,0,0).transformDirection(m);
  assert(Math.abs(ax.y)<1e-9&&Math.abs(bend.y)<1e-9&&Math.abs(up.y-1)<1e-9,'a fallen banana lies on its side: its long axis and its curve flat on the ground');}}

// ---- 7. The runtime.
const sway={tree:{value:0},pivot:{value:new T.Vector3()},axis:{value:new T.Vector3()},angle:{value:0},height:{value:5},bend:{value:1}};
function rig(opts={}){
 const store=new Map(opts.store??[]),calls={pose:[],gather:[],cue:[],dismount:[],touchdown:0};let clock=opts.now??new Date(2026,9,13,10,0,0).getTime(),seed=7;
 const scene=new T.Scene();
 const f=RT.createSummitForage(scene,{obstacles,sites:()=>sites,sway,budgetMs:opts.budgetMs??Infinity,pose:(p,how)=>calls.pose.push({p,how}),gather:id=>{if(opts.full)return 0;calls.gather.push(id);return 1;},cue:k=>calls.cue.push(k),
  dismount:(how,spot)=>{calls.dismount.push({how,spot});return opts.dismount??true;},touchdown:()=>{calls.touchdown++;},
  now:()=>clock,random:()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},read:()=>store.get(F.FORAGE_SAVE_KEY)??null,write:v=>store.set(F.FORAGE_SAVE_KEY,v)});
 const el={hidden:true,placed:0},camera=new T.PerspectiveCamera(50,390/844,.1,500);
 const ctx=(x,z,extra={})=>({dt:1/60,x,z,onFoot:true,canEnter:true,frozen:false,reduced:!!opts.reduced,camera,width:390,height:844,focusKey:'forage',ui:()=>el,place:()=>{el.placed++;},hide:(e,h)=>{e.hidden=h;},...extra});
 const aim=(x,z)=>{camera.position.set(x+18,ground(x,z)+23,z+30);camera.lookAt(x,ground(x,z),z);camera.updateMatrixWorld();};
 return {f,scene,store,calls,el,ctx,aim,tick:ms=>{clock+=ms;},get now(){return clock;}};
}
const run=(r,x,z,frames,extra)=>{for(let i=0;i<frames;i++){r.tick(1000/60);r.f.update(r.ctx(x,z,typeof extra==='function'?extra(i):extra));}};
{const r=rig(),f=r.f;
 assert.equal(f.update(r.ctx(103,-8)),null);assert.equal(f.stats.built,false,'built only near Summit Isle');assert.equal(r.scene.children.length,0);
 const L0=picks[0];r.aim(L0.stand.x,L0.stand.z);f.update(r.ctx(L0.stand.x,L0.stand.z));
 const v0=f.view();assert.equal(v0.pool.length,picks.length,'the whole pool');assert.equal(v0.trees.length,F.fruitingToday(picks,v0.day).size,'today’s fruiting trees only');
 const fruitMesh=f.root.children.find(o=>o.isInstancedMesh&&o.name==='summit-fruit'),dawnTotal=v0.trees.reduce((n,t)=>n+t.dawn,0);
 // One instance a fruit, a banana hand's fingers for each banana (4–6).
 const bananaSlots=v0.trees.filter(t=>t.fruit==='banana').reduce((n,t)=>n+t.dawn,0);
 assert(fruitMesh&&fruitMesh.count>=dawnTotal+bananaSlots*(RT.BANANA.hand[0]-1)&&fruitMesh.count<=dawnTotal+bananaSlots*(RT.BANANA.hand[1]-1),'ALL of today’s fruit is one instanced mesh, sized to the fruiting trees only');
 assert.equal(fruitMesh.castShadow,false);
 const fruitTris=fruitMesh.geometry.index.count/3;assert(fruitTris<=80,`the shared fruit shape is ≤ 80 triangles (the old icosahedron) (${fruitTris})`);
 assert(fruitMesh.count*fruitTris<=16000,`fruit ≤ 16k triangles (${fruitMesh.count} instances, ${dawnTotal} fruit)`);
 assert(fruitMesh.geometry.getAttribute('aForm')?.isInstancedBufferAttribute&&fruitMesh.geometry.getAttribute('aPattern')?.isInstancedBufferAttribute,'the shape is per instance (bent in the vertex shader, no extra draw)');
 assert.equal(f.root.children.filter(o=>o.isMesh&&!o.isPoints&&/fruit/.test(o.name)).length,1,'one draw call for every fruit kind');
 console.log(`  fruit: ${dawnTotal} fruit today (${bananaSlots} banana hands) → ${fruitMesh.count} instances × ${fruitTris} triangles in 1 draw`);
 assert(fruitMesh.boundingSphere&&fruitMesh.boundingSphere.center.x>400,'a fixed bounding sphere over Summit Isle');
 const bare=picks.find(p=>!v0.trees.some(t=>t.id===p.id));
 // A bare tree: no prompt.
 {r.aim(bare.stand.x,bare.stand.z);assert.equal(f.update(r.ctx(bare.stand.x,bare.stand.z)),null,'no prompt at a bare tree today');}
 // On foot at a fruiting tree.
 const t=v0.trees.find(x=>x.hanging>=2&&picks.find(p=>p.id===x.id).kind==='tree'&&!picks.find(p=>p.id===x.id).form)??v0.trees.find(x=>x.hanging>=2),T0=picks.find(p=>p.id===t.id);r.aim(t.stand.x,t.stand.z);
 const want=f.update(r.ctx(t.stand.x,t.stand.z));assert(want&&want.key==='forage','walking up to a fruiting tree offers the prompt');
 assert.equal(r.el.hidden,false,'"Shake the tree" shows');assert.equal(F.forageStore.get().label,`Shake the ${F.FRUIT_LOOK[T0.fruit].tree}`);
 // Shake: walk to the grip spot, grip, two pushes; the sway marks just this tree in the shader and settles to rest.
 const from={x:t.stand.x+1.5,z:t.stand.z+.4};f.update(r.ctx(from.x,from.z));
 assert.equal(f.shake(),true,'tap: shake');const p=r.calls.pose[0];
 assert(Math.abs(p.p.x-T0.rig.grip.x)<1e-9&&Math.abs(p.p.z-T0.rig.grip.z)<1e-9,'the pose targets the trunk at grip height');
 assert(p.how.lead>0&&Math.abs(p.how.lead-Math.hypot(p.how.stand.x-from.x,p.how.stand.z-from.z)/3.5)<1e-6,'walks the last step first');
 assert.equal(f.shake(),false,'one shake at a time');
 let sawSway=false,others=false,maxBounces=0;
 for(let i=0;i<60*3;i++){r.tick(1000/60);f.update(r.ctx(p.how.stand.x,p.how.stand.z));if(sway.angle.value!==0){sawSway=true;if(sway.tree.value!==T0.tid)others=true;}for(const q of f.view().fallen)maxBounces=Math.max(maxBounces,q.bounces);}
 assert(sawSway,'the tree sways in the vertex shader');assert(!others,'only the shaken tree is marked');assert(sway.pivot.value.x===T0.x&&sway.pivot.value.z===T0.z,'about its trunk base');
 assert.equal(r.calls.cue.filter(k=>k==='rustle').length,load('lib/graphics/jobPoses.ts').TREE_SHAKE_PUSHES.length,'a rustle on each push');
 assert(f.stats.dropped>=1&&f.stats.dropped<=3,`1–3 fruit drop (${f.stats.dropped})`);assert(r.calls.cue.includes('thud'));assert(maxBounces>=1,'it bounces');
 run(r,p.how.stand.x,p.how.stand.z,60*3);
 assert.equal(sway.angle.value,0,'the sway settles to exactly 0');assert.equal(sway.tree.value,0,'and unmarks the tree');assert.equal(f.view().swaying,false);
 for(const q of f.view().fallen)assert(q.mode==='ground'&&Math.abs(q.y-ground(q.x,q.z))<.4&&S.onSummitIsle(q.x,q.z),'resting on walkable ground');
 for(let guard=0;f.view().fallen.length&&guard<20;guard++){const q=f.view().fallen[0];run(r,q.x+.3,q.z,40);}
 assert.equal(f.view().fallen.length,0,'every fallen fruit picked up');
 assert.equal(r.calls.gather.length,f.stats.dropped,'each pickup = +1 in the basket');for(const g of r.calls.gather)assert.equal(g,T0.fruit);
 const save=JSON.parse(r.store.get(F.FORAGE_SAVE_KEY));assert.equal(save.today,f.stats.dropped);assert.equal(save.tip,true);
 const left=f.view().trees.find(x=>x.id===t.id).hanging;assert.equal(left,t.dawn-f.stats.dropped,'the tree is lighter');
 r.tick(5*3600e3);run(r,p.how.stand.x,p.how.stand.z,2);assert.equal(f.view().trees.find(x=>x.id===t.id).hanging,left,'and stays lighter all day');
 // At rest: no rAF, no timers, no instance writes, no per-frame work.
 const iv=fruitMesh.instanceMatrix.version,b0=f.stats.busyFrames;run(r,p.how.stand.x,p.how.stand.z,300);
 assert.equal(fruitMesh.instanceMatrix.version,iv,'nothing animates at rest');assert.equal(f.stats.busyFrames,b0,'no per-frame work at rest');
 assert.deepEqual(timers,{raf:0,timeout:0,interval:0},'no rAF and no timers of its own');
 const keys=winListeners.get('keydown');assert(keys&&keys.size===1,'one keydown listener');
 f.dispose();assert.equal(f.root.parent,null);assert.equal(winListeners.get('keydown').size,0);assert.equal(F.forageStore.get().note,'','store reset');}

// The prompt riding and flying low; the hop-off and land-then-shake sequence.
{const r=rig(),f=r.f,fr=()=>f.view().trees;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));
 const lone=x=>fr().every(u=>u.id===x.id||Math.hypot(u.x-x.x,u.z-x.z)>10),t=fr().find(x=>x.hanging>=1&&lone(x)),T0=picks.find(p=>p.id===t.id),off={x:T0.x+3.8,z:T0.z+1};r.aim(off.x,off.z);
 assert.equal(f.update(r.ctx(off.x,off.z)),null,'on foot 3.9 m away: out of reach');
 assert(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'ride'})),'on a bike 3.9 m away: the prompt shows');
 assert.equal(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:null})),null,'in street traffic or the truck: no prompt');
 assert(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'fly',air:()=>4})),'parachuting 4 m up: the prompt shows');
 assert(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'fly',air:()=>15.8})),'the jetpack’s low hover over Summit Isle (15.8 m): the prompt shows');
 assert(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'fly',air:()=>21})),'and over a foothill (21 m)');
 assert.equal(f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'fly',air:()=>27.5})),null,'at the 28 m cruise over the sand: too high');
 // Ride: tap → hop off (the host's switch to walking), then walk in and shake.
 f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'ride'}));assert.equal(f.shake(),true);assert.equal(r.calls.dismount[0].how,'ride','hops off the ride');
 assert.equal(r.calls.pose.length,0,'no shake until on foot');assert(f.view().arriving,'waiting to be on foot');
 f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'ride'}));assert.equal(f.shake(),false,'input locked during the sequence');
 r.tick(16);f.update(r.ctx(off.x,off.z));assert.equal(r.calls.pose.length,1,'on foot: walks in and shakes');assert.equal(r.calls.touchdown,0,'no landing dust for a hop-off');
 const lead=r.calls.pose[0].how.lead;assert(lead>.3&&lead<=1.4,`a short walk to the trunk (${lead.toFixed(2)} s)`);
 assert(lead+1<=2.6,'the whole sequence is ~1–2.5 s');run(r,off.x,off.z,60*6);f.dispose();}
{const r=rig(),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const t=f.view().trees.find(x=>x.hanging>=1),T0=picks.find(p=>p.id===t.id),off={x:T0.x+2,z:T0.z-4};
 r.aim(off.x,off.z);f.update(r.ctx(off.x,off.z,{onFoot:false,arrival:'fly',air:()=>5}));assert.equal(f.shake(),true);
 const d=r.calls.dismount[0];assert.equal(d.how,'fly','lands from the air');
 assert(Math.hypot(d.spot.x-T0.x,d.spot.z-T0.z)<3.5&&S.onSummitIsle(d.spot.x,d.spot.z)&&!blockedAt(d.spot.x,d.spot.z),'on a clear spot beside the trunk');
 run(r,off.x,off.z,30,{onFoot:false,arrival:'fly',air:()=>3});assert.equal(r.calls.pose.length,0,'still landing');
 r.tick(16);f.update(r.ctx(d.spot.x,d.spot.z));assert.equal(r.calls.touchdown,1,'touchdown: the landing dust');assert.equal(r.calls.pose.length,1,'then walks in and shakes');
 run(r,d.spot.x,d.spot.z,60*5);assert(f.stats.dropped>=1,'fruit drops as usual');f.dispose();}
{const r=rig({dismount:false}),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const t=f.view().trees.find(x=>x.hanging>=1),T0=picks.find(p=>p.id===t.id);
 f.update(r.ctx(T0.x+2,T0.z,{onFoot:false,arrival:'ride'}));assert.equal(f.shake(),false,'nothing when the host can’t hop off');assert.equal(f.view().arriving,null);f.dispose();}

// A kicked ball: a hard hit knocks fruit down, a soft one doesn't, a bare tree only sways, the daily cap holds.
{const r=rig(),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const v=f.view(),t=v.trees.find(x=>x.hanging>=2),T0=picks.find(p=>p.id===t.id),at={x:t.x-T0.rig.baseR-.2,y:t.y+.5,z:t.z};
 r.aim(t.stand.x,t.stand.z);
 assert.equal(f.ballHit(at.x,at.y,at.z,3,0),false,'a gentle roll does nothing');assert.equal(f.view().fallen.length,0);
 assert.equal(f.ballHit(at.x,at.y,at.z,8,0),true,'a firm kick hits the tree');run(r,t.stand.x,t.stand.z,2);
 assert.equal(f.view().fallen.length,1,'one fruit falls');assert.equal(sway.tree.value,T0.tid,'the tree sways');
 r.tick(700);f.ballHit(at.x,at.y,at.z,13,0);run(r,t.stand.x,t.stand.z,2);assert.equal(f.view().fallen.length,Math.min(t.hanging,3),'a hard one drops two more (as many as hang)');
 run(r,t.stand.x+40,t.stand.z,5);// walk away: back up the tree, nothing lost
 const bare=picks.find(p=>!v.trees.some(x=>x.id===p.id)),before=f.view().fallen.length;
 assert.equal(f.ballHit(bare.x-bare.rig.baseR-.2,bare.y+.5,bare.z,12,0),true,'a bare tree is hit');run(r,bare.x,bare.z,2);
 assert.equal(sway.tree.value,bare.tid,'it sways');assert.equal(f.view().fallen.length,before,'but nothing falls');run(r,bare.x,bare.z,60*4);assert.equal(sway.angle.value,0,'and settles');
 f.dispose();}
{const t0=new Date(2026,9,13,15,0,0).getTime();let s=F.emptyForage(t0);for(let i=0;i<F.FORAGE.dailyCap;i++)s=F.recordPick(s,'palm-999-999',t0);
 const r=rig({now:t0+1000,store:[[F.FORAGE_SAVE_KEY,JSON.stringify(s)]]}),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const t=f.view().trees.find(x=>x.hanging>=1),T0=picks.find(p=>p.id===t.id);
 f.ballHit(t.x-T0.rig.baseR-.2,t.y+.5,t.z,13,0);run(r,t.x,t.z,2);assert.equal(f.view().fallen.length,0,'the daily cap holds for ball hits');
 r.aim(t.stand.x,t.stand.z);r.tick(700);f.update(r.ctx(t.stand.x,t.stand.z));assert.equal(f.shake(),true);run(r,t.stand.x,t.stand.z,60*2);
 assert.equal(f.stats.dropped,0,'nothing drops past the daily cap');assert.match(F.forageStore.get().note,/foraged \d+ fruit today/);f.dispose();}
// A full basket: the fruit stays on the ground and the note says where to sell.
{const r=rig({full:true}),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const t=f.view().trees.find(x=>x.hanging>=1);r.aim(t.stand.x,t.stand.z);f.update(r.ctx(t.stand.x,t.stand.z));f.shake();
 run(r,t.stand.x,t.stand.z,60*3);const q=f.view().fallen[0];run(r,q.x,q.z,30);
 assert(f.view().fallen.length>=1,'the fruit waits on the ground');assert.match(F.forageStore.get().note,/basket is full/i);f.dispose();}
// Reduced motion: a small sway, no leaves; the fruit is on the ground at once.
{const r=rig({reduced:true}),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const t=f.view().trees.find(x=>x.hanging>=1);r.aim(t.stand.x,t.stand.z);f.update(r.ctx(t.stand.x,t.stand.z));f.shake();let maxAng=0;
 for(let i=0;i<90;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));maxAng=Math.max(maxAng,Math.abs(sway.angle.value));}
 assert(maxAng<.06,`a small sway with reduced motion (${maxAng.toFixed(3)} rad)`);assert(f.view().fallen.every(q=>q.mode==='ground'),'lands at once');f.dispose();}
// The first visit spreads the tree choice over frames and lands on the same trees.
{const r=rig({budgetMs:0});let frames=0;while(!r.f.stats.built&&frames<2000){r.f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));frames++;}
 assert(r.f.stats.built&&frames>5,`the choice is time-sliced (${frames} frames)`);assert.deepEqual(r.f.view().pool.join(),picks.map(x=>x.id).join(),'same trees');r.f.dispose();}
{const r=rig();r.f.update(r.ctx(picks[0].stand.x,picks[0].stand.z,{frozen:true}));assert.equal(r.f.stats.built,false,'nothing while the fishing focus holds the island still');r.f.dispose();}

// Bananas in the runtime: a hand of fingers on the plant up its stalk; shaken down, single fingers or hands of 2–3 lying flat at rest height.
{const r=rig(),f=r.f;f.update(r.ctx(picks[0].stand.x,picks[0].stand.z));const v=f.view(),t=v.trees.find(x=>x.fruit==='banana'&&x.hanging>=2),T0=picks.find(p=>p.id===t.id);
 assert(T0.rig.stalk,'a banana plant knows its bunch stalk');
 const mesh=f.root.children.find(o=>o.name==='summit-fruit'),mat=new T.Matrix4(),pos=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3(),ax=new T.Vector3();
 // The visible instances near this plant (the hand's fingers), before the shake.
 const near=(maxD)=>{const out=[];for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,mat);mat.decompose(pos,q,sc);if(sc.x>1e-6&&Math.hypot(pos.x-T0.x,pos.z-T0.z)<maxD)out.push({p:pos.clone(),ax:new T.Vector3(0,1,0).applyQuaternion(q),s:sc.x});}return out;};
 const hanging=near(1.5);assert(hanging.length>=t.hanging*RT.BANANA.hand[0],`each banana is a hand of ≥ ${RT.BANANA.hand[0]} fingers on the plant (${hanging.length} fingers, ${t.hanging} hands)`);
 for(const h of hanging){assert(h.p.y>T0.rig.crown.y-.5&&h.p.y<T0.rig.stalk.y+.6,'the hands hang up the bunch stalk, under the leaves');}
 r.aim(t.stand.x,t.stand.z);f.update(r.ctx(t.stand.x,t.stand.z));assert(f.shake());run(r,t.stand.x,t.stand.z,60*4);
 const down=f.view().fallen;assert(down.length>=1&&down.every(d=>d.mode==='ground'),'bananas fell');
 const lying=[];for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,mat);mat.decompose(pos,q,sc);if(sc.x<1e-6)continue;if(down.some(d=>Math.hypot(d.x-pos.x,d.z-pos.z)<.6&&Math.abs(d.y-pos.y)<.3))lying.push({y:pos.y,ax:new T.Vector3(0,1,0).applyQuaternion(q),x:pos.x,z:pos.z});}
 assert(lying.length>=down.length&&lying.length<=down.length*RT.BANANA.fallen[1],`fallen: single fingers or hands of 2–3 (${lying.length} fingers for ${down.length})`);
 const LB=F.FRUIT_LOOK.banana;
 for(const l of lying){assert(Math.abs(l.ax.y)<.02,'a landed banana lies flat (long axis horizontal)');const gy=ground(l.x,l.z);assert(l.y-gy>LB.r*LB.width*.6&&l.y-gy<LB.r*LB.width*1.4+RT.REST_LIFT,`on the grass, not floating or sunk (${(l.y-gy).toFixed(3)} m over it)`);}
 const col=new T.Color();mesh.getColorAt(0,col);f.dispose();}

// ---- 8. Wiring, goods and data.
{const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),town=read('components/Town.tsx'),art=read('components/ProduceArt.tsx');
 assert(town.includes('createSummitForage(')&&town.includes('forage.dispose()')&&town.includes('<ForagePrompt/>')&&town.includes("jobMoves.start(how.kind??'treeshake'"),'Town builds, shows and disposes it; the pose is a job pose (the push, or the kick: tests/summit-tree-kick.cjs)');
 assert(town.includes("cands.push({kind:'enter',key:forageWant.key"),'the prompt competes in the HUD stack (one prompt at a time)');
 assert(/dismount:\(how,spot\)=>\{if\(how==='ride'\)[^\n]*selectRide\('walk'\)/.test(town),'riding: the usual switch to walking');
 assert(/pendingRide\.current='walk';[^\n]*flight\.landing=/.test(town),'flying: the usual guided jetpack landing, aimed beside the trunk');
 assert(town.includes('landingDust.trigger(location.x,y,location.z')&&town.includes('touchdown:'),'landing dust on touchdown');
 assert(town.includes("arrival:")&&town.includes("air:()=>flight.height-rooftop.surface"),'Town reports ride / low flight');
 assert(town.includes('forage.ballHit(x,y,z,walkBall.state.vx,walkBall.state.vz)'),'a kicked ball reports its collisions');
 assert(town.includes('jobFrame.free?')&&town.includes('jobFrame.lean'),'the grip spot and the lean');
 assert(read('lib/graphics/jobPoses.ts').includes('treeshake:[')&&read('lib/town/jobs/jobMoves.ts').includes("'treeshake'"),'push-and-shake pose');
 assert(load('lib/saves/snapshot.ts').SYNC_KEYS.includes(F.FORAGE_SAVE_KEY),'the forage save syncs with the island');
 for(const k of F.FRUIT_KINDS){const g=goods.goodById(k);assert(g&&g.kind==='produce'&&g.price>=1&&g.price<=5&&g.lesson.length>40&&/^https:\/\//.test(g.source),`${k}: a fairly priced basket good that teaches`);if(['papaya','lime','guava','avocado'].includes(k))assert(g.lesson.length<=85,`${k}: a short lesson`);
  assert(new RegExp(`\\n ${k}:c=>`).test(art),`${k} has its own pocket icon`);assert(F.FRUIT_LOOK[k].tree.length>3,`${k}: prompt words`);
  assert(load('lib/town/fuel.ts').produceFuel(k,'produce','fruit')>0,`${k} can be eaten from the pocket`);}
 // Rosa's stand sells every kind (the market quotes any basket good from the registry).
 const M=load('lib/town/market/market.ts');const st={...M.emptyMarket('2026-10-13'),basket:Object.fromEntries(F.FRUIT_KINDS.map(k=>[k,1]))};
 const q=M.quoteSale(st);assert.equal(q.lines.length,F.FRUIT_KINDS.length,'every fruit kind has a sale line');assert(q.lines.every(l=>l.coins>=1),'and each sells for coins');}

console.log(`PASS Summit Isle fruit trees: ${BEFORE} → ${picks.length} fruit trees (${picks.filter(t=>t.form).length} of the ${orchard.length} orchard plants, ${O.ORCHARD_FORMS.length} forms + ${picks.filter(t=>!t.form&&t.kind==='tree').length} round trees + ${picks.filter(t=>t.kind==='palm').length} palms), ${F.FRUIT_KINDS.length} fruit kinds, ~${Math.round(F.FORAGE.fruiting*100)}% fruiting a day; shake on foot, riding or flying low; hands on the trunk; GPU sway; ball knocks fruit; idle = no work`);
