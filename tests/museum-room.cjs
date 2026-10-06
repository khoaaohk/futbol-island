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
 assert.deepEqual(needs,{'laws-1863':['laws',0],'penalty-1891':['laws',10],'cards-1970':['laws',25],'backpass-1992':['laws',50],'var-2018':['laws',80],
  'worldcup-1930':['worldcup',10],'wwc-1991':['worldcup',30],'futsal-1989':['worldcup',60],'laced-leather':['kit',2],'telstar-1970':['kit',3],'shirts':['kit',4],'hall-of-fame':['hall',1]});
 assert.deepEqual(X.GALLERIES.map(g=>[g.id,g.unlock]),[['laws','balls'],['worldcup','cards'],['kit','books'],['hall','graduations']]);
 const zero={balls:0,cards:0,books:0,graduations:0};
 assert.equal(X.exhibitState(X.EXHIBITS[1],{...zero,balls:3}).lockText,'Collect 7 more hidden balls to open this case (3/10).');
 console.log('PASS content: 12 cases, same galleries, thresholds and lock copy');}

// 2. Hands-on exhibits: config only, every quote copied from that case's own facts / take-it-to-your-game line.
{const norm=s=>s.toLowerCase().replace(/[’']/g,"'");
 const quotes=c=>[c.quote,c.rule,...(c.cards??[]).map(x=>x.quote),c.old?.quote,c.now?.quote,c.young?.quote,...(c.numbers??[]).map(x=>x.quote)].filter(Boolean);
 for(const [id,c] of Object.entries(X.EXHIBIT_INTERACTIVES)){const e=X.EXHIBITS.find(x=>x.id===id);assert.ok(e,id+' is a real case');const text=norm([...e.facts,e.forYourGame].join(' '));
  for(const q of quotes(c))assert.ok(text.includes(norm(q)),`${id}: "${q}" is quoted from the case`);}
 assert.deepEqual(Object.values(X.EXHIBIT_INTERACTIVES).map(c=>c.kind).sort(),['cards','compare','hall','kit','spin','var','whistle']);
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
 const zero={balls:0,cards:0,books:0,graduations:0};assert.equal(X.nextExhibitToOpen({...zero,books:1}).id,'laced-leather','the guide points at the nearest case');
 assert.equal(X.nextExhibitToOpen({balls:100,cards:100,books:9,graduations:4}),null,'all open: nothing next');
 console.log('PASS exhibits: 7 hands-on kinds, quotes match their cases, timeline in date order, guide picks the nearest case');}

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
 assert.match(page,/from==='museum'/);assert.match(museum,/MuseumDoorSlide mode="enter"/);assert.ok(!/Coming soon/.test(museum));
 assert.match(scene,/forceContextLoss\(\)/);assert.match(scene,/powerPreference:'low-power'/);assert.match(scene,/frameCapSlot/);assert.ok(!/setInterval/.test(scene+room),'no timers polling');
 assert.match(scene,/if\(settle>0\|\|leaving\)frame=requestAnimationFrame\(tick\);else/,'the loop sleeps when nothing moves');
 assert.match(room,/import\('@\/lib\/museum\/museumScene'\)/,'scene lazy-loaded');
 console.log('PASS wiring: Town → /museum, ?from=museum, door slide, sleeping loop, full dispose');}

// 6. Storytelling exhibits (Oct 4 2026): every beat is grounded, the engine can't skip, every line is voiced.
{const S=require('../lib/museum/museumStories.ts'),norm=s=>s.replace(/[’']/g,"'");const exhibitsSrc=read('lib/museum/museumExhibits.ts')+read('lib/museum/museumExhibits2.ts');
 for(const [id,story] of Object.entries(S.STORIES)){const e=X.EXHIBITS.find(x=>x.id===id);assert.ok(e,id+' is a real case');
  assert.ok(story.beats.length+1>=3&&story.beats.length+1<=6,id+': 3–6 beats including the takeaway');
  for(const b of story.beats){assert.ok(b.prompt.length>2,id+' beat has a prompt');assert.ok(new RegExp(`\\b${b.anim}\\s*:`).test(exhibitsSrc),id+': animation '+b.anim+' exists');
   if(b.kind==='fact')assert.ok(e.facts.some(f=>norm(f).includes(norm(b.line))),`${id}: "${b.line}" is copied from the case's facts`);
   else{assert.ok(!/\d/.test(b.line),id+': a cue carries no number');assert.ok(!/\s[A-Z]/.test(b.line.replace(/[.!?]\s+[A-Z]/g,'. x')),id+': a cue names nobody ("'+b.line+'")');}}
  assert.equal(S.storyTakeaway(id),e.forYourGame,'the takeaway is the case’s own line');
  let st=S.startStory(id),n=0;for(;;){const r=S.beginBeat(st);if(!r)break;assert.equal(S.beginBeat(r.state),null,'no second beat while one plays');st=S.endBeat(r.state);n++;}
  assert.equal(n,story.beats.length+1);assert.ok(st.done);}
 assert.deepEqual(Object.keys(S.STORIES).sort(),X.EXHIBITS.map(e=>e.id).sort(),'every case is a storytelling exhibit (no case opens a card)');assert.ok(!S.isStoryCase('timeline'));
 const manifest=JSON.parse(read('public/voice/museum/manifest.json'));
 for(const line of S.storyLines()){const h=S.storyLineHash(line);assert.ok(manifest[h]>0,'voiced: '+line);assert.ok(fs.existsSync(path.join(root,'public/voice/museum',h+'.m4a')),'clip on disk: '+h);}
 const room=read('components/MuseumRoom.tsx');assert.match(room,/storyCase&&exhibit\?<MuseumStory/,'story cases show the caption strip, not the card');
 assert.ok(!/useModalFocus|aria-modal/.test(read('components/MuseumStory.tsx')),'the strip and plaque are not modal');
 console.log(`PASS stories: ${Object.keys(S.STORIES).length} storytelling exhibits, every beat grounded in its case, ${S.storyLines().length} voiced lines, no skipping`);}
