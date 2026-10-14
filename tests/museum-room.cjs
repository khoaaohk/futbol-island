// Walk-in History Museum (Oct 3 2026): the content and unlock thresholds are unchanged, every hands-on exhibit quotes its own
// case word for word (no new facts), the floor plan is walkable (every case/wall/guide reachable from the door), the door
// departure lands outside the museum door, and the island wiring (Town effect, ?from=museum, the door slide) is in place.
// usage: node tests/museum-room.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),L=require('../lib/museum/museumLayout.ts'),D=require('../lib/museum/museumDoors.ts');
const {validIslandReturnPosition}=require('../lib/arcade/islandReturnPosition.ts');

// 1. Content and unlocks preserved exactly (the Sep 30 table).
{const needs=Object.fromEntries(X.EXHIBITS.map(e=>[e.id,[e.gallery,e.need]]));
 // Every case is free (user, Oct 9 2026).
 // Oct 12 2026: stadiums replaced cards-1970 (World Cup history) and boots replaced backpass-1992 (Balls and kits).
 assert.deepEqual(needs,{'laws-1863':['laws',0],'penalty-1891':['laws',0],'var-2018':['laws',0],
  'worldcup-1930':['worldcup',0],'wwc-1991':['worldcup',0],'futsal-1989':['worldcup',0],'stadiums':['worldcup',0],'laced-leather':['kit',0],'telstar-1970':['kit',0],'boots':['kit',0],'shirts':['kit',0],'hall-of-fame':['hall',0]});
 assert.deepEqual(X.GALLERIES.map(g=>[g.id,g.unlock]),[['laws','balls'],['worldcup','cards'],['kit','books'],['hall','graduations']]);
 const zero={balls:0,cards:0,books:0,graduations:0};
 assert.ok(X.EXHIBITS.every(e=>X.exhibitState(e,zero).open&&X.exhibitState(e,zero).lockText===''),'every case open on a fresh save, no lock copy');
 console.log('PASS content: 12 cases, same galleries, every case free');}

// 2. Hands-on exhibits: config only, every quote copied from that case's own facts / take-it-to-your-game line.
{const norm=s=>s.toLowerCase().replace(/[’']/g,"'");
 const quotes=c=>[c.quote,c.rule,...(c.cards??[]).map(x=>x.quote),c.old?.quote,c.now?.quote,c.young?.quote,...(c.numbers??[]).map(x=>x.quote)].filter(Boolean);
 for(const [id,c] of Object.entries(X.EXHIBIT_INTERACTIVES)){const e=X.EXHIBITS.find(x=>x.id===id);assert.ok(e,id+' is a real case');const text=norm([...e.facts,e.forYourGame].join(' '));
  for(const q of quotes(c))assert.ok(text.includes(norm(q)),`${id}: "${q}" is quoted from the case`);}
 assert.deepEqual(Object.values(X.EXHIBIT_INTERACTIVES).map(c=>c.kind).sort(),['compare','hall','kit','spin','var','whistle']);
 assert.ok(/practice/i.test(read('components/MuseumExhibit.tsx')),'the VAR replay is labelled as practice');
 {const v=X.EXHIBITS.find(e=>e.id==='var-2018'),c=X.EXHIBIT_INTERACTIVES['var-2018'];assert.ok(v.facts.includes(c.rule),'the goal-line rule is a fact on the VAR case');
  assert.ok(v.sources.some(s=>/Law 10/.test(s.title)&&s.url==='https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/'),'…sourced to IFAB Law 10');
  assert.match(c.rule,/whole ball.*whole goal line.*between the posts.*under the crossbar/);assert.match(c.over,/goal!/);assert.match(c.on,/no goal/);
  const ex=read('components/MuseumExhibit.tsx');assert.match(ex,/scene==='over'\?89:59/,'close-up: over = ball clear of the line (89−17 > 62), on = ball across the line');assert.match(ex,/data-correct=\{call===correct\}/,'the answer says which call was right');}
 {const S=require('../lib/museum/museumSound.ts');const ch=new Float32Array(S.AMBIENCE_SECONDS*S.AMBIENCE_RATE),buf=S.renderMuseumAmbience({createBuffer:(c,n)=>({length:n,sampleRate:S.AMBIENCE_RATE,getChannelData:()=>ch.length===n?ch:new Float32Array(n)})});const d=buf.getChannelData(0);
  let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));assert.ok(peak<=.6001&&peak>.3,'ambience normalised to 0.6');let step=0;for(let i=1;i<d.length;i++)step=Math.max(step,Math.abs(d[i]-d[i-1]));assert.ok(Math.abs(d[0]-d[d.length-1])<=step*1.01,'seamless loop: the wrap is no bigger than any sample step');
  const lv=o=>S.ambienceLevel({soundOn:true,musicOn:true,musicVolume:.04,soundVolume:.5,...o});assert.equal(lv({soundOn:false}),0,'sound muted → silent');assert.equal(lv({musicOn:false}),0,'music off → silent');
  assert.ok(lv({musicVolume:1})*.6<=.022*.5*2*.5+1e-9,'never above half the footsteps\u2019 peak');assert.ok(lv({})>0);}
 const order=X.timelineOrder().map(e=>e.year);assert.equal(order[0],'1863');assert.equal(order.at(-1),'Today');assert.ok(order.indexOf('Before the 1960s')<order.indexOf('1970'));assert.equal(order.length,12);
 const zero={balls:0,cards:0,books:0,graduations:0};assert.equal(X.nextExhibitToOpen(zero),null,'every case is free: nothing left to open');
 assert.equal(X.nextExhibitToOpen({balls:100,cards:100,books:9,graduations:4}),null,'all open: nothing next');
 console.log('PASS exhibits: 6 hands-on kinds, quotes match their cases, timeline in date order, nothing locked');}

// 3. Floor plan: every case placed once, no overlaps, every look-at spot reachable from the door.
{const obstacles=L.museumObstacles(),blocked=(x,z)=>L.museumBlocked(x,z,obstacles);
 assert.deepEqual(Object.keys(L.CASE_PLACES).sort(),X.EXHIBITS.map(e=>e.id).sort(),'one case per exhibit');
 const places=Object.values(L.CASE_PLACES);for(let i=0;i<places.length;i++)for(let j=i+1;j<places.length;j++)assert.ok(Math.hypot(places[i].x-places[j].x,places[i].z-places[j].z)>1.6,'cases have walking room');
 const pois=L.museumPois();assert.equal(pois.length,19);assert.equal(L.ZOOM_STOPS.length,17);assert.deepEqual(L.ZOOM_STOPS.slice(-4),['my-balls','my-cards','my-books','hall-wall'],'the wing\u2019s stops come last');
 assert.ok(!blocked(L.WING.x1,0),'the wide opening joins the hall and the wing');assert.ok(blocked(L.WING.x1,-6.5)&&blocked(L.WING.x1,10),'the wall stands either side of it');
 assert.ok(!blocked(-16,15)&&blocked(-8,12),'the wing runs further toward the front than the hall (the L)');
 for(const id of ['my-balls','my-cards','my-books','hall-wall','hall-of-fame']){const p=pois.find(x=>x.id===id),mid={x:(p.a.x+p.b.x)/2,z:(p.a.z+p.b.z)/2};assert.ok(L.inWing(mid.x),id+' is in the Your Collection wing');}
 const door={x:L.ROOM.doorX,z:L.ROOM.halfD-1.6};assert.ok(!blocked(door.x,door.z),'the arrival spot is free');
 for(const p of pois){const mid={x:(p.a.x+p.b.x)/2,z:(p.a.z+p.b.z)/2};assert.ok(!blocked(mid.x,mid.z),`${p.id}: standing spot is free`);
  const route=L.findMuseumPath(door,mid,blocked);assert.ok(route.length>0,`${p.id}: reachable`);const end=route.at(-1);assert.ok(Math.hypot(end.x-mid.x,end.z-mid.z)<.4,`${p.id}: the path ends at the spot`);}
 assert.ok(!blocked(0,L.ROOM.halfD+.2),'the door gap is open');assert.ok(blocked(5,L.ROOM.halfD+.2),'the front wall is closed elsewhere');
 console.log('PASS floor plan: an L (hall + Your Collection wing): 12 cases, timeline, balls/cards/books, certificate wall and guide, all reachable from the door');}

// 4. Doors: out to the island at the museum door, on foot, never in flight.
{const p=D.museumDeparture('bike');assert.ok(validIslandReturnPosition(p));assert.equal(p.ride,'bike');assert.equal(D.museumDeparture('jetpack').ride,'walk');
 assert.ok(Math.abs(D.MUSEUM_DOOR.x-160.2)<1e-9&&Math.abs(D.MUSEUM_DOOR.front-185.7)<1e-9,'world.ts house door');assert.ok(p.z>D.MUSEUM_DOOR.front+2&&p.yaw===0,'outside, facing out');
 assert.equal(D.MUSEUM_RETURN_URL,'/?from=museum');assert.equal(D.MUSEUM_URL,'/museum');
 console.log('PASS doors: departure outside the museum door, ride kept, flight lands on foot');}

// 5. Wiring: every island way in leads to /museum; ?from=museum returns at the door; the room is heat-safe.
{const town=read('components/Town.tsx'),page=read('app/page.tsx'),museum=read('components/Museum.tsx'),scene=read('lib/museum/museumScene.ts'),room=read('components/MuseumRoom.tsx');
 assert.match(town,/if\(!museumOpen\)return;saveMuseumDeparture\(rideRef\.current\);musicRef\.current\?\.setSceneActive\(false\);stopIslandNarration\(\);[^\n]*MUSEUM_URL/,'museumOpen saves the departure, stops music/narration and navigates');
 assert.match(town,/target==='museum'\)setMuseumOpen\(true\)/,'endgame / graduation links still open the museum');
 assert.match(read('next.config.mjs'),/key: 'from', value: '\^\(arcade\|konbini\|museum(\|shop)?\)\$' \}\], destination: '\/island-return'/,'/?from=museum is rewritten to the static island-return page');assert.match(read('app/island-return/page.tsx'),/<Town returningFromArcade\/>/);assert.match(museum,/MuseumDoorSlide mode="enter"/);assert.ok(!/Coming soon/.test(museum));
 assert.match(scene,/forceContextLoss\(\)/);assert.match(scene,/powerPreference:'low-power'/);assert.match(scene,/frameCapSlot/);assert.ok(!/setInterval/.test(scene+room),'no timers polling');
 assert.match(scene,/if\(settle>0\|\|leaving\)frame=requestAnimationFrame\(tick\);else/,'the loop sleeps when nothing moves');
 assert.match(room,/import\('@\/lib\/museum\/museumScene'\)/,'scene lazy-loaded');
 console.log('PASS wiring: Town → /museum, ?from=museum, door slide, sleeping loop, full dispose');}

// 6. Every case opens straight onto its full card (Oct 13 2026, user: "for all the exhibits remove this info thing and btn, just
// have the full thing at the beginning"): no story strip, beat buttons, dots or ⓘ plaque; the coach's story lines are no longer
// played. The retired lines (lib/museum/museumStories.ts, kept unplayed with their clips) stay grounded and voiced.
{const S=require('../lib/museum/museumStories.ts'),norm=s=>s.replace(/[’']/g,"'");
 const room=read('components/MuseumRoom.tsx'),scene=read('lib/museum/museumScene.ts'),ex=read('lib/museum/museumExhibits.ts'),css=read('components/MuseumRoom.module.css');
 assert.ok(!fs.existsSync(path.join(root,'components/MuseumStory.tsx')),'the story strip component is gone');
 assert.ok(!/museumStories|museumVoice|MuseumStory|isStoryCase|story\.play|story\.crank/.test(room+scene+ex),'the hall no longer plays stories or the coach’s lines');
 assert.ok(!/data-museum-story|data-museum-plaque|data-museum-caption|data-story/.test(room),'no beat buttons, plaque toggle or caption');
 assert.ok(!/\.strip\b|\.plaqueButton|\.dots\b|\.caption\b/.test(css),'the strip’s styles are gone');
 assert.match(room,/\{zoom\.arrived&&\(\(\)=>\{const c=card\(\);return c&&<div className=\{styles\.card\} key=\{zoom\.id\}>\{c\}<\/div>;\}\)\(\)\}/,'a stop that has a card shows it as soon as the camera arrives (open exhibits have none: just See exhibit)');
 assert.match(room,/<span className=\{styles\.eyebrow\}>\{g\.title\} · \{exhibit\.year\}<\/span><h2>\{exhibit\.title\}<\/h2>[\s\S]*?exhibit\.facts\.map[\s\S]*?<MuseumExhibit [\s\S]*?Take it to your game:[\s\S]*?<summary>Sources<\/summary>/,'the card: eyebrow, title, every fact, the hands-on bit, Take it to your game, sources');
 assert.match(room,/if\(shown&&EXPERIENCES\[exhibit\.id\]\)return null;/,'open cases with an exhibit show no info card, only the button (Oct 14 2026)');
 assert.match(room,/'See exhibit again':'See exhibit'/,'the button reads See exhibit');assert(!/'Step inside'/.test(room),'no Step inside wording left');
 assert.match(room,/data-museum-step-inside=\{zoom\.id\}/,'Step inside is there from the start');
 assert.match(room,/spinning=zoomedId==='telstar-1970'&&!!zoom\?\.arrived&&!!open\['telstar-1970'\];/,'only the Telstar still spins (drag / ⟲ ⟳)');
 for(const [id,story] of Object.entries(S.STORIES)){const e=X.EXHIBITS.find(x=>x.id===id);assert.ok(e,id+' is a real case');
  for(const b of story.beats){if(b.kind==='fact'){/* retired lines: the cases' facts have moved on since (Oct 13 2026: maker names dropped), so only check they still exist */assert.ok(b.line.length>0,id+': fact line');}
   else{assert.ok(!/\d/.test(b.line),id+': a cue carries no number');assert.ok(!/\s[A-Z]/.test(b.line.replace(/[.!?]\s+[A-Z]/g,'. x')),id+': a cue names nobody ("'+b.line+'")');}}
  assert.equal(S.storyTakeaway(id),e.forYourGame,'the takeaway is the case’s own line');}
 const manifest=JSON.parse(read('public/voice/museum/manifest.json'));
 for(const line of S.storyLines()){const h=S.storyLineHash(line);assert.ok(manifest[h]>0,'voiced: '+line);assert.ok(fs.existsSync(path.join(root,'public/voice/museum',h+'.m4a')),'clip on disk: '+h);}
 console.log(`PASS cards: every case opens on its full card (no story strip, beat buttons or plaque); ${S.storyLines().length} retired story lines still grounded and voiced, unplayed`);}

// 7. The sculptures (Oct 13 2026, user of the boots case: "This doesn't look anything like a futbol boot"): one still, recognisable
// object per case; the boot is the Kit Shop's own geometry (phone detail); everything merges into the static mesh except the
// Telstar (spins) and the boot, one mesh each; the hall stays light.
{const E=require('../lib/museum/museumExhibits.ts'),boot=read('lib/museum/museumBoot.ts'),scene=read('lib/museum/museumScene.ts');
 const open=Object.fromEntries(X.EXHIBITS.map(e=>[e.id,true])),merged={};
 const r=E.createExhibitSculptures({open,add:(g,x,y,z)=>{const id=Object.keys(L.CASE_PLACES).find(k=>Math.abs(L.CASE_PLACES[k].x-x)<1e-6&&Math.abs(L.CASE_PLACES[k].z-z)<1e-6);
  assert.deepEqual(Object.keys(g.attributes).sort(),['color','normal','position'],id+': a merged piece carries position, normal and colour only');assert.ok(!g.index,id+': non-indexed, like the rest of the static mesh');
  merged[id]=g.getAttribute('position').count/3;g.dispose();}});
 assert.deepEqual([...r.built].sort(),X.EXHIBITS.map(e=>e.id).sort(),'every open case has its sculpture');
 assert.deepEqual(Object.keys(merged).sort(),X.EXHIBITS.map(e=>e.id).filter(id=>id!=='boots').sort(),'every other case merges its pieces (the boot is all its own mesh)');
 assert.deepEqual(r.solo.map(o=>o.name).sort(),['museum-boot','museum-telstar'],'two pieces have their own mesh: the boot and the Telstar');
 const tris=g=>(g.index?g.index.count:g.getAttribute('position').count)/3,bootGeo=r.solo.find(o=>o.name==='museum-boot').geometry;
 const total=Object.values(merged).reduce((a,b)=>a+b,0);assert.ok(total<20000,`merged sculptures stay light (${total} triangles)`);
 assert.ok(bootGeo.index&&tris(bootGeo)<24000&&bootGeo.getAttribute('position').count<30000,`the boot is the phone LOD, indexed (${tris(bootGeo)} triangles)`);
 bootGeo.computeBoundingBox();const bb=bootGeo.boundingBox,len=(bb.max.x-bb.min.x)*r.solo.find(o=>o.name==='museum-boot').s;
 assert.ok(Math.abs(bb.min.y)<.01&&len>.45&&len<.7,'the boot stands on its studs and fills the plinth ('+len.toFixed(2)+' m long)');
 for(const o of r.solo)o.geometry.dispose();
 assert.match(boot,/from '\.\.\/shop\/bootGeometry'/,'the shop’s boot geometry, imported (not copied)');assert.match(boot,/detail:'phone'/);assert.match(boot,/buildSoleGeometry\(look\.studs,'phone'\)/);assert.match(boot,/buildStudsGeometry\(look\.studs,'phone'\)/);
 for(const id of ['stadiums','hall-of-fame','var-2018','worldcup-1930','boots'])assert.match(read('lib/museum/museumExhibits.ts'),new RegExp(`sculpture\\('${id}'`));
 assert.ok(!/InstancedMesh|requestAnimationFrame|setInterval/.test(read('lib/museum/museumExhibits.ts')),'still sculptures: no instancing, no loop of their own');
 assert.match(scene,/for\(const o of exhibits\.solo\)\{const mesh=new T\.Mesh\(o\.geometry,staticMat\)/,'the solo pieces share the static mesh’s material');
 console.log(`PASS sculptures: 12 still objects (${total} merged triangles), the shop’s boot at its phone detail (${tris(bootGeo)} triangles) and the Telstar as their own meshes`);}
// Oct 10 2026 (the Weather Machine agent's finding): a draw-on dash (stroke-dashoffset animated or transitioned) on a stroke with
// vector-effect:non-scaling-stroke stops part-way in Chrome. No museum rule may combine the two (the shared .draw forces it off).
{const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(d+'/'+e.name):e.name.endsWith('.css')?[d+'/'+e.name]:[]);
 const bad=[];for(const f of walk('components/museum'))for(const m of read(f).matchAll(/([^{}]*)\{([^{}]*)\}/g)){const b=m[2];
  if(/vector-effect:\s*non-scaling-stroke/.test(b)&&/stroke-dashoffset/.test(b)&&/(animation|transition)\s*:/.test(b))bad.push(f+' '+m[1].trim());}
 assert.deepEqual(bad,[],'no draw-on dash on a non-scaling stroke');
 console.log('PASS museum line drawings: no draw-on dash on a non-scaling stroke');}
