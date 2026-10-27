// QA audit 4 gaps (Oct 26 2026): the ferry preview and the foot ring on the East Pier were never covered.
// Headless check (390x844 phone + 1280x800 desktop, own dev server): tapping the framed ferry opens the Matchday Ferry
// preview (locked: "Opening soon · finish your paths!", four path rows, Open Paths); on the East Pier the foot ring is
// visible, flat (tilt 0) and 10 cm over the deck (walkway top 2 cm) on the straight jetty and the plaza. This test pins the
// pieces those checks rely on. Run: node tests/ferry-pier-ring.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,
  {module:mod,exports:mod.exports,Math,Number,Object,Array,Set,Map,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(id.endsWith('.json')?'':'.ts'))):require(id)});return mod.exports;}
const town=read('components/Town.tsx'),world=read('lib/town/world.ts'),ferry=read('components/FerryPreview.tsx');

{// Ferry: the tap ray tests the hull's box, the box holds the drawn hull (8 × 17 m at (246, 199), bobbing ±.22 m), and a hit opens the preview.
 const fb=/ferryBounds:new T\.Box3\(new T\.Vector3\(([^)]*)\),new T\.Vector3\(([^)]*)\)\)/.exec(world);assert(fb,'ferryBounds');const [x0,y0,z0]=fb[1].split(',').map(Number),[x1,y1,z1]=fb[2].split(',').map(Number);
 assert(/ferry\.position\.set\(246,0,199\)/.test(world),'the ferry sits at (246, 199)');
 assert(x0<=246-4.15-.12&&x1>=246+4.15+.12&&z0<=199-8.65-.22&&z1>=199+8.65+.22&&y0<=0&&y1>=4.6,'the tap box covers the whole bobbing hull and cabin');
 assert(/const ferryHit=new T\.Vector3\(\),pointsAtFerry=\(\)=>characterRay\.ray\.intersectBox\(world\.ferryLockBounds,ferryHit\)!==null\|\|characterRay\.ray\.intersectBox\(world\.ferryBounds,ferryHit\)!==null/.test(town),'one scratch vector, the lock and the hull boxes');
 assert(/if\(pointsAtFerry\(\)\)\{tapHaptic\(\);sound\.ui\('click'\);setFerryOpen\(true\);return;\}/.test(town),'a tap on the ferry opens the preview');
 assert(/<FerryPreview open=\{ferryOpen\} onOpenChange=\{setFerryOpen\}\/>/.test(town),'the preview is mounted with its open state');
 assert(/ferryOpen\|\|playsPickerOpen\?'menu'/.test(town),'an open ferry counts as a menu (the island pauses under it)');
 assert(/data-ferry=\{unlocked\?'open':'locked'\}/.test(ferry)&&/OPENING_SOON_LABEL/.test(ferry)&&/Open Paths/.test(ferry),'locked: Opening soon, the path rows and Open Paths');
 assert(/MatchdayFinale=dynamic\(/.test(ferry),'the finale loads only on boarding');}

{// East Pier foot ring: the jetty is flat at deckY 0 and fieldSurfaceHeight reads 0 on all of it, so the slope fix (ringNormal /
 // ringFace) keeps the ring flat there (no tilt from a height step at the deck edge) and it sits .10 m up, over the .02 m walkway.
 const P=load('lib/town/eastPier.ts'),V=load('lib/town/venues.ts'),E=P.EAST_PIER;assert.equal(E.deckY,0);
 let n=0;for(const s of P.JETTY_PATH)for(const off of [-E.walkHalf,0,E.walkHalf]){const x=s.x+s.tz*off,z=s.z-s.tx*off,R=.54*2.3;// the widest ring (moped)
  for(const [dx,dz] of [[0,0],[R,0],[-R,0],[0,R],[0,-R]])assert.equal(V.fieldSurfaceHeight(x+dx,z+dz),0,`flat ground under the ring at (${(x+dx).toFixed(1)}, ${(z+dz).toFixed(1)})`);n++;}
 assert(n>300,'every metre of the jetty');
 assert(/ring\.position\.set\(visualLocation\.x,\.10\+groundY,visualLocation\.z\)/.test(town),'the ring sits .10 m over the ground (deck)');
 assert(/if\(sl>\.02\)\{ringNormal\.set\(-hx,1,-hz\)\.normalize\(\);ring\.quaternion\.setFromUnitVectors\(ringFace,ringNormal\)/.test(town),'slope tilt only past 2 %');
 assert(/ringFace=new T\.Vector3\(0,0,1\)/.test(town)&&/ring\.rotation\.x=-Math\.PI\/2/.test(town),'RingGeometry faces +z; flat = rotation.x −π/2');
 assert(/band\(start,last,-P\.kerbHalf,\.02,P\.kerbHalf,\.02,WALK/.test(read('lib/town/eastPierWorld.ts')),'the walkway top is 2 cm: under the ring');}
console.log('PASS ferry + pier ring: ferry tap box and preview wiring, East Pier ring flat over the deck');
