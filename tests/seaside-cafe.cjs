// Café by the Sea + butterfly garden on Coral Cay (Nov 24 2026; lib/town/seasideCafe.ts, seasideCafeWorld.ts, graphics/cafePrompt.ts,
// graphics/cafeButterflies.ts). Builds the real island in Node and checks: the Island Line envelope stays ≥ 3 m clear of everything the
// café adds, the walk surfaces chain (beach → steps → deck, ≤ .35 m a step) and the deck is walkable ground (over the sea too), the
// swim rules (posts, deck wall, ladder), the moved beach props, one signs draw, Malia's facts all sourced, the map label clear of the
// other labels, the chalkboard's fixture lines, and the butterflies' species / rest points. usage: node tests/seaside-cafe.cjs
const assert=require('node:assert/strict'),path=require('node:path');
const base=path.resolve(__dirname,'..');
(async()=>{
 const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
 const {T,L,world,sim,scene,obstacles}=await loadIslandWorld(base);
 const C=L('lib/town/seasideCafe.ts'),tt=L('lib/town/trainTrack.ts'),land=L('lib/town/landmass.ts'),cay=L('lib/town/coralCay.ts');
 // 1. Built: the café's building entry, its signs atlas (the one extra draw) and the chalkboard hook.
 assert.ok(world.cafe&&typeof world.cafe.drawFixtures==='function','world.cafe built');
 const signs=[];scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='half-time-cafe-signs')signs.push(o);});
 assert.equal(signs.length,1,'one signs-atlas mesh (one draw)');
 // 2. Island Line clearance: every vertex in the café's area is ≥ 3 m outside the envelope (2.0 m half-width → 5 m from the line).
 scene.updateMatrixWorld(true);const v=new T.Vector3();let worst=Infinity,n=0;
 const X0=C.CAFE_CLEAR.x0-1,X1=C.CAFE_CLEAR.x1+1,Z0=C.CAFE_CLEAR.z0-1,Z1=C.CAFE_CLEAR.z1+3;
 scene.traverse(o=>{if(!o.isMesh||!o.geometry)return;for(let q=o;q;q=q.parent)if(q.userData&&q.userData.train)return;const pos=o.geometry.getAttribute('position');if(!pos)return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(bb.max.x<X0||bb.min.x>X1||bb.max.z<Z0||bb.min.z>Z1||bb.max.x-bb.min.x>60)return;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(v.x<X0||v.x>X1||v.z<Z0||v.z>Z1)continue;n++;const h=tt.trackNearest(v.x,v.z,8);if(h&&h.d<worst)worst=h.d;}});
 assert.ok(n>1000,`café vertices found (${n})`);
 assert.ok(worst>=5,`café ≥ 3 m outside the train envelope (closest ${worst.toFixed(2)} m from the line, need ≥ 5)`);
 // 3. Moved props: no beach-ring palm or umbrella collider left on the café / garden footprint (only the café's own).
 const inside=(x,z,b)=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2;
 const trunks=obstacles.filter(o=>o.w<=.6&&o.d<=.6&&inside(o.x,o.z,{x:707,z:-95,w:30,d:18}));
 for(const o of trunks){const ours=C.CAFE_POSTS.some(p=>Math.hypot(p.x-o.x,p.z-o.z)<.5)||C.onCafeDeck(o.x,o.z);assert.ok(ours||o.w<.3||o.d<.3,`stray collider on the café at ${o.x.toFixed(1)}, ${o.z.toFixed(1)}`);}
 // 4. Walk surfaces: beach → step .23 → step .47 → deck .7 (each rise ≤ .35), adjacent; deck and water deck are walkable ground.
 const ws=world.walkSurfaces.filter(s=>s.stepAccess&&s.x>=697&&s.x<=722.5&&s.z>=-105&&s.z<=-87);
 assert.ok(ws.length>=C.CAFE_DECKS.length+C.CAFE_STEPS.length,'café walk surfaces registered');
 const chain=[0,...[...C.CAFE_STEPS].sort((a,b)=>a.height-b.height).map(s=>s.height),C.CAFE.floor];for(let i=1;i<chain.length;i++)assert.ok(chain[i]-chain[i-1]<=.35,`step ${i} rise ${(chain[i]-chain[i-1]).toFixed(2)} ≤ .35`);
 const steps=[...C.CAFE_STEPS].sort((a,b)=>a.x-b.x);assert.ok(Math.abs(steps[0].x+steps[0].w/2-(steps[1].x-steps[1].w/2))<.01&&Math.abs(steps[1].x+steps[1].w/2-(C.CAFE_DECKS[0].x-C.CAFE_DECKS[0].w/2))<.01,'steps touch each other and the deck');
 for(const [x,z] of [[707,-91.5],[716.5,-99.7],[718.5,-97],[718.5,-105],[C.CAFE_LADDER.x,C.CAFE_LADDER.z]]){assert.ok(land.onLand(x,z),`deck at ${x}, ${z} is land`);}
 assert.ok(!land.onLand(721.5,-99),'open sea beside the deck is not land');
 assert.ok(sim.blocked(C.CAFE.x,C.CAFE.z,obstacles),'the café walls block');
 const free=(x,z)=>!obstacles.some(o=>!o.stepAccess&&Math.abs(x-o.x)<o.w/2+.32&&Math.abs(z-o.z)<o.d/2+.32);
 for(const [x,z] of [[705,-89.2],[710,-89.4],[713,-94],[713.6,-97],[718,-101.5]])assert.ok(free(x,z),`deck walkway clear at ${x}, ${z}`);
 assert.ok(free(C.CAFE_OWNER.x,C.CAFE_OWNER.z)&&C.onCafeDeck(C.CAFE_OWNER.x,C.CAFE_OWNER.z),'Malia stands free on the deck');
 assert.equal(C.CAFE_OWNER.floor(),C.CAFE.floor,'Malia stands on the deck floor');
 // 5. Swim rules: posts block, the deck is a wall to a swimmer except at the ladder, open water is free.
 for(const p of C.CAFE_POSTS){assert.ok(C.cafeSwimBlocked(p.x+.2,p.z),'post blocks a swimmer');assert.ok(!land.onLand(p.x,p.z+1.6)||C.onCafeDeck(p.x,p.z+1.6)||cay.onCay(p.x,p.z+1.6),'posts stand in the water');}
 assert.ok(!C.cafeSwimBlocked(717.4,-99.2),'a swimmer passes between the posts');
 assert.ok(C.cafeDeckSwimWall(717.5,-104)&&!C.cafeDeckSwimWall(C.CAFE_LADDER.x,C.CAFE_LADDER.z)&&!C.cafeDeckSwimWall(724,-92),'deck wall, ladder open, sea free');
 const waterPosts=C.CAFE_POSTS.filter(p=>!cay.onCay(p.x,p.z));assert.ok(waterPosts.length>=C.CAFE_POSTS.length-2,'posts are over the water');
 // 6. Malia: on the island cast, every topic sourced, news = today's fixtures.
 const npcs=L('lib/town/npcDialogues.ts').NPC_DIALOGUES;const m=npcs.find(x=>x.id===C.CAFE_OWNER_ID);assert.ok(m,'Malia is on the island cast');
 assert.equal(m.news,'scores','Malia shows the fixtures (scores feed)');
 assert.ok(npcs.filter(x=>x.id===C.CAFE_OWNER_ID).length===1,'one Malia');
 for(const tp of m.topics){const f=C.CAFE_FACTS.find(x=>x.id===tp.id);assert.ok(f,`topic ${tp.id} has a fact`);const s=C.CAFE_SOURCES[f.source];assert.ok(s&&/^https:\/\//.test(s.url),`fact ${f.id} has a source`);assert.ok(tp.answer.length>40&&tp.followUp&&tp.followUp.answer.length>20,`topic ${tp.id} answered`);}
 for(const f of C.CAFE_FACTS)assert.ok(C.CAFE_SOURCES[f.source],`fact ${f.id} source listed`);
 assert.ok(/winger/.test(m.topics.find(t=>t.id==='butterflies').answer),'the garden links to a winger');
 // 7. Map: the café label clears every other top-layer label (station labels, BEACH SOCCER, HOSTEL, CORAL CAY place label).
 const box=(cx,cy,w,h)=>({x0:cx-w/2,x1:cx+w/2,y0:cy-h/2,y1:cy+h/2}),hit=(a,b)=>a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
 const me=box(C.CAFE_MAP.labelX,C.CAFE_MAP.labelZ,C.CAFE_MAP.w,18);
 const others=[...tt.TRAIN_STATIONS.map(st=>{const c=tt.trackAt(st.s);return box(c.x+c.tz*st.side*22,c.z-c.tx*st.side*22,72,18);}),
  box(cay.BEACH_COURT.x,cay.BEACH_COURT.z-cay.BEACH_COURT.width/2-10,110,16),box(cay.HOSTEL.x,cay.HOSTEL.z-cay.HOSTEL.d/2-10,64,16),box(cay.CORAL_CAY_ARRIVAL.x,cay.CORAL_CAY_ARRIVAL.z-32,90,22)];
 for(const o of others)assert.ok(!hit(me,o),'café map label overlaps another label');
 assert.ok(!hit(me,box(C.CAFE_MAP.x,C.CAFE_MAP.z,9,9)),'label clear of its own pin');
 // 8. Chalkboard: live games first, then today's kick-offs; results when there is nothing today; nothing when the feed is down.
 const now=new Date(2026,10,24,15,0).getTime(),iso=(h,mi=0)=>new Date(2026,10,24,h,mi).toISOString(),it=(id,state,home,away,hs,as,when)=>({id,title:'',url:'',source:'ESPN',publishedAt:when,detail:'',match:{home,away,homeScore:hs,awayScore:as,state,goals:[],goalsComplete:true}});
 const feed={kind:'scores',fetchedAt:iso(15),unavailable:false,partial:false,items:[it('a','pre','Arsenal','Chelsea','0','0',iso(17,30)),it('b','in','Liverpool','Everton','1','0',iso(14)),it('c','pre','Real Madrid','Barcelona','0','0',new Date(2026,10,26,20).toISOString()),it('d','post','Lyon','Lille','2','2',iso(12))]};
 const b=C.chalkFixtures(feed,now);assert.equal(b.title,'TODAY’S FIXTURES');assert.equal(b.lines.length,2);assert.ok(b.lines[0].live&&/1-0/.test(b.lines[0].left)&&b.lines[0].right==='LIVE');assert.equal(b.lines[1].right,'17:30');
 const r=C.chalkFixtures({...feed,items:[feed.items[3]]},now);assert.equal(r.title,'LATEST RESULTS');assert.equal(r.lines[0].right,'FT');
 assert.equal(C.chalkFixtures({...feed,unavailable:true},now).lines.length,0);assert.equal(C.chalkFixtures(null,now).lines.length,0);
 world.cafe.drawFixtures(b.title,b.lines);// redraw runs without a DOM canvas
 // 9. Butterflies: the Bug book's monarch (a butterfly), rest points on the garden beds, counts within the budget.
 const sp=L('lib/town/jobs/bugSpecies.ts').bugSpeciesById(C.CAFE_BUTTERFLY_ID);assert.ok(sp&&sp.look.body==='butterfly','monarch is a Bug book butterfly');
 const rest=L('lib/graphics/cafeButterflies.ts').cafeRestPoints(),A=C.CAFE_GARDEN_AREA;assert.ok(rest.length>=C.CAFE_BUTTERFLIES.count[0],'a flower each');
 for(const p of rest)assert.ok(p.x>=A.x0&&p.x<=A.x1&&p.z>=A.z0&&p.z<=A.z1,'rest point in the garden');
 assert.ok(C.CAFE_BUTTERFLIES.count[0]<=12&&C.CAFE_BUTTERFLIES.count[1]<=C.CAFE_BUTTERFLIES.count[0],'8-12 butterflies');
 for(const bed of C.CAFE_GARDEN){assert.ok(cay.onCay(bed.x,bed.z),'garden on the cay');assert.ok(!(bed.x+bed.w/2>C.CAFE_STEPS[1].x-C.CAFE_STEPS[1].w/2&&Math.abs(bed.z-C.CAFE_STEPS[1].z)<bed.d/2+C.CAFE_STEPS[1].d/2),'garden clear of the steps');}
 const bf=L('lib/graphics/cafeButterflies.ts').createCafeButterflies(new T.Scene(),false);const cam=new T.PerspectiveCamera(40,1,.1,500);cam.position.set(A.cx+10,15,A.cz+20);cam.lookAt(A.cx,0,A.cz);cam.updateMatrixWorld(true);
 for(let i=0;i<120;i++)bf.update(1/60,{x:A.cx+3,z:A.cz,speed:0,camera:cam,reduced:false,night:false,tier:0,phone:false});
 assert.ok(bf.active,'drawn near the garden');const k=bf.nearFly(A.cx,A.cz,20);assert.ok(k>=0&&bf.netFly(k)&&!bf.netFly(k),'net once, then gone');
 bf.update(1/60,{x:0,z:0,speed:0,camera:cam,reduced:false,night:false,tier:0,phone:false});assert.ok(!bf.active,'not drawn far away');bf.dispose();
 console.log(`seaside café: ok (${n} vertices checked, closest ${worst.toFixed(1)} m from the line; ${ws.length} walk surfaces; ${m.topics.length} sourced topics)`);
})().catch(e=>{console.error(e);process.exit(1);});
