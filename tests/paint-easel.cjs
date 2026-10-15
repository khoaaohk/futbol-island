// Summit Isle painting easel (Oct 14 2026; user: "an easel that is a place to paint the view … so the user can just relax and paint",
// then "the painting is supposed to be relaxing, to take in the views"). Run: node tests/paint-easel.cjs
//  1. placement: the circled grass left of the pitch fence (gentle, walkable, facing the main island); clear of the fence (≥ 3 m), the
//     trails (≥ 4 m), the lookout flag and cairn, the orchard and the island's trees, the hidden balls, huts,
//     caves and riddle board, the beaches, Summit Kick and the Ball Cannon; its colliders never block the trail
//  2. the static prop: built with the island's batched tools (no materials or meshes of its own), colliders for easel, stool and table
//  3. painting maths: palette, brush sizes, stamp spacing, flood fill, bounded undo
//  4. the save: newest first, at most 5, under the byte budget (oldest rotated out), junk refused, a full device handled; the key is
//     DEVICE-only (never synced) in lib/saves/snapshot.ts and docs/accounts-design.md table B
//  5. the 3D runtime: idle = no rAF/timers/meshes; the prompt through the HUD arbiter; sitting eases the same camera to the view,
//     holds the player, hides them; one snapshot render on arrival; the 20 fps cap and sleep-when-still; Just look; leaving restores
//     the camera; the saved painting on the board
//  6. heat + UI wiring: the island is NOT paused under the card (the view stays live) but held still (focus mode), capped and asleep
//     when nothing moves; the UI draws only on pointer events (rAF only while a finger is down), no timers; Back/Done/Just look;
//     44 px controls; the HUD steps aside; analytics counts; Town wiring
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader,runtime}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const E=load('lib/town/paintEasel.ts'),SI=load('lib/town/summitIsle.ts'),SB=load('lib/town/summitBalls.ts'),SK=load('lib/town/summitKick.ts');
const T=require('three');
const s=E.easelSpot();
const pieces=()=>[{x:s.x,z:s.z,what:'easel'},...['stand','stool','table'].map(k=>({...E.easelPoint(s,E.EASEL_LAYOUT[k].f,E.EASEL_LAYOUT[k].r),what:k}))];
// The island's own colliders (trees, palms, bushes, rocks, the fence, props) from the real build, and the easel's.
const islandObstacles=[],easelObstacles=[];
{const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
 const tools=obstacles=>({box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,8));m.position.set(x,y,z);return m;},
  put:(g,c,x,y,z)=>{const m=mk(g);m.position.set(x,y,z);return m;},sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles,assets:[],surfaceAreas:[]});
 load('lib/town/summitIsleWorld.ts').buildSummitIsle(tools(islandObstacles));load('lib/town/summitActivitiesWorld.ts').buildSummitActivityProps(tools(islandObstacles));
 globalThis.__easelBuild=load('lib/town/paintEaselWorld.ts').buildPaintEasel(tools(easelObstacles));globalThis.__easelMeshes=town.children.length;}

(async()=>{
await ok('placement: the circled grass left of the pitch fence, gentle, facing the view',()=>{
 const P=SI.SUMMIT_PITCH,F=SI.SUMMIT_FENCE,west=P.x-F.halfX;
 assert(SI.onSummitIsle(s.x,s.z),'walkable');
 assert(west-s.x>=10&&west-s.x<=14,`10–14 m west of the fence's west side (${(west-s.x).toFixed(1)} m)`);
 assert(Math.abs(s.z-P.z)<=6,`about level with the pitch's centre (${(s.z-P.z).toFixed(1)} m)`);
 assert(SI.summitSlope(s.x,s.z)<=E.EASEL_MAX_SLOPE,'gentle ground');assert(s.ground>SI.SUMMIT_HEIGHT*.85,'high on the upper slope (the view)');
 assert(SI.terraceWeight(s.x,s.z)===0,'off the summit terrace');
 // Facing the main island across the sea (west-south-west), and the line of sight is clear of the mountain.
 const V=load('lib/town/venues.ts'),sq=V.ISLAND_SQUARE,face=Math.atan2(sq.x-s.x,sq.z-s.z);assert(Math.abs(Math.atan2(Math.sin(face-s.yaw),Math.cos(face-s.yaw)))<1e-9,'faces the main island');
 assert(s.fx<-.9,'out to the west');
 const cam=E.easelCamera(s);for(let i=8;i<200;i++){const t=i/200,x=cam.x+(sq.x-cam.x)*t,z=cam.z+(sq.z-cam.z)*t,y=cam.y+(3-cam.y)*t;assert(SI.summitGround(x,z)<y,'the view to the main island is not hidden by the hill');}
 for(const p of pieces())for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])assert(SI.onSummitIsle(p.x+ax*.8,p.z+az*.8),`walkable round the ${p.what}`);
 const src=read('lib/town/paintEasel.ts');assert(/P\.x-F\.halfX\+EASEL_TARGET\.dx/.test(src)&&/const P=SUMMIT_PITCH,F=SUMMIT_FENCE/.test(src),'derived from the pitch fence (follows the island)');
});

await ok('clearances: fence, trails, lookout, orchard and trees, hunt spots, beaches, Summit Kick, Ball Cannon',()=>{
 const P=SI.SUMMIT_PITCH,F=SI.SUMMIT_FENCE,L=SI.SUMMIT_LANDMARKS.lookout;
 const all=[...pieces(),...easelObstacles.map(o=>({x:o.x,z:o.z,r:Math.max(o.w,o.d)/2,what:'collider'}))];
 for(const p of all){const r=p.r??0;
  const fence=Math.max(Math.abs(p.x-P.x)-F.halfX,Math.abs(p.z-P.z)-F.halfZ)-r;assert(fence>=3,`${p.what} ≥ 3 m from the pitch fence (${fence.toFixed(1)})`);
  assert(SI.summitTrailDistance(p.x,p.z)-r>=4+1,`${p.what} ≥ 4 m from the trail tread`);
  assert(Math.hypot(p.x-L.x,p.z-L.z)>=12&&Math.hypot(p.x-(L.x+3.6),p.z-L.z)>=12,`${p.what} clear of the lookout flag and cairn`);}
 // The orchard clear zones (lookout, Summit Kick, kiosk, fishing spots, hikers, sandbar landing): the easel sits in none.
 for(const z of load('lib/town/summitOrchard.ts').orchardClearZones().filter(z=>!/telescope/.test(z.what)))assert(Math.hypot(z.x-s.x,z.z-s.z)>=z.r,`outside the ${z.what} clear zone`);
 // Trees, palms, bushes and rocks (orchard included: they are the island's colliders): open grass round the easel.
 const near=islandObstacles.filter(o=>Math.hypot(o.x-s.x,o.z-s.z)<4.5);assert.deepEqual(near.map(o=>[o.x,o.z]),[],'no tree, bush, rock or prop within 4.5 m');
 for(const o of easelObstacles)for(const q of islandObstacles)assert(!(Math.abs(o.x-q.x)<(o.w+q.w)/2+.6&&Math.abs(o.z-q.z)<(o.d+q.d)/2+.6),'the easel\'s colliders keep clear of the island\'s');
 // The hidden balls, huts, caves and riddle board (summitBalls.ts, read as it is now).
 for(const b of SB.SUMMIT_BALL_SPOTS)assert(Math.hypot(b.x-s.x,b.z-s.z)>=10,`≥ 10 m from the hidden ball ${b.id}`);
 for(const h of SB.SUMMIT_HUTS)assert(Math.hypot(h.x-s.x,h.z-s.z)>=15,'clear of '+h.name);
 for(const c of SB.SUMMIT_CAVES)assert(Math.hypot(c.x-s.x,c.z-s.z)>=15,'clear of '+c.name);
 assert(Math.hypot(SB.RIDDLE_BOARD.x-s.x,SB.RIDDLE_BOARD.z-s.z)>=15,'clear of the riddle board');
 // The beaches (beach finds) are far below; Summit Kick's post and spot are on the other side of the fence.
 assert(SI.distanceToSummitShore(s.x,s.z)>40,'far above the beaches');
 const K=SK.kickLayout();assert(Math.hypot(K.post.x-s.x,K.post.z-s.z)>=15&&Math.hypot(K.spot.x-s.x,K.spot.z-s.z)>=15,'clear of Summit Kick');
 // The Ball Cannon by the sandbar landing (if it is built yet).
 if(fs.existsSync(path.join(ROOT,'lib/town/ballCannon.ts'))){const C=load('lib/town/ballCannon.ts').cannonLayout();for(const q of [C,C.seat,C.stand,C.trap])assert(Math.hypot(q.x-s.x,q.z-s.z)>=30,'clear of the Ball Cannon');}
 assert(Math.hypot(SI.SUMMIT_LANDMARKS.sandbarLanding.x-s.x,SI.SUMMIT_LANDMARKS.sandbarLanding.z-s.z)>60,'far from the sandbar landing');
 // The trail stays open to a ride (the easel's colliders, with a ride's 0.8 m radius, never touch a trail point).
 const {blocked}=load('lib/town/simulation.ts');for(const line of SI.SUMMIT_PATHS)for(const q of line)assert(!blocked(q.x,q.z,easelObstacles,.8),'the trail is never blocked');
});

await ok('the static prop: batched island tools, colliders for easel, stool and table',()=>{
 assert(globalThis.__easelMeshes>0,'pieces built');assert.equal(easelObstacles.length,3,'three colliders: stool, table, easel');
 const src=read('lib/town/paintEaselWorld.ts');assert(!/new T\.Mesh\(|Material\(|scene\.add|requestAnimationFrame/.test(src),'only the island\'s batched box/cylinder/put tools: no meshes, materials or loops of its own');
 assert(/buildPaintEasel\(\{box,cylinder,put,obstacles\}\)/.test(read('lib/town/world.ts')),'built inside buildTown with the shared tools');
 const C=E.canvasPose(s);assert(C.nx*s.fx+C.nz*s.fz<0&&C.ny>0,'the painted face looks back at the painter (and a little up), the easel faces the view');
 assert(Math.abs(C.w/C.h-E.PAINT_W/E.PAINT_H)<1e-9,'the board has the painting\'s 4:3 shape');
});

await ok('painting maths: palette, sizes, stamps, flood fill, bounded undo',()=>{
 assert.equal(E.PAINT_PALETTE.length,12,'twelve colours');for(const c of E.PAINT_PALETTE)assert(/^#[0-9a-f]{6}$/.test(c.hex)&&c.name);
 for(const id of ['sky','sea','sand','grass','sunset','pink','foam','ink'])assert(E.PAINT_PALETTE.some(c=>c.id===id),'has '+id);
 assert.deepEqual(E.PAINT_TOOLS.map(t=>t.id),['brush','water','fill','eraser','pick']);
 assert(E.brushRadius('brush',0)<E.brushRadius('brush',1)&&E.brushRadius('brush',1)<E.brushRadius('brush',2),'three sizes');
 assert(E.brushRadius('water',1)>E.brushRadius('brush',1)&&E.BRUSH.water.alpha<.2,'watercolour: wider, low opacity');
 // Stamps: even spacing across calls (the carry), none lost on a slow stroke.
 let carry=0,pts=[],a={x:0,y:0};for(let i=1;i<=50;i++){const b={x:i*.7,y:0},r=E.stampsAlong(a,b,4,carry);carry=r.carry;pts.push(...r.points);a=b;}
 assert(pts.length>=8&&pts.length<=9,'35 px at 4 px spacing: ~8 stamps');for(let i=1;i<pts.length;i++)assert(Math.abs(pts[i].x-pts[i-1].x-4)<1e-9,'even spacing');
 // Flood fill: fills the enclosed region only, with tolerance; filling with the same colour does nothing.
 const w=8,h=6,d=new Uint8ClampedArray(w*h*4);const px=(x,y,c)=>{const i=(y*w+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=c[3];};
 for(let y=0;y<h;y++)px(4,y,[0,0,0,255]);// a wall down the middle
 px(1,1,[20,0,0,10]);// near-transparent speck within tolerance
 const n=E.floodFill(d,w,h,0,0,[63,191,180,255]);assert.equal(n,4*h,'the left half only');
 assert.equal(d[(1*w+1)*4],63,'the near-colour speck is filled too (tolerance)');assert.equal(d[(0*w+6)*4+3],0,'the right half untouched');
 assert.equal(E.floodFill(d,w,h,0,0,[63,191,180,255]),0,'same colour: no change');assert.equal(E.floodFill(d,w,h,-1,0,[1,2,3,255]),0,'off the canvas: nothing');
 const u=E.createUndo(3);for(let i=1;i<=5;i++)u.push(i);assert.equal(u.size,3,'bounded');assert.equal(u.pop(),5);assert.equal(u.pop(),4);assert.equal(u.pop(),3);assert.equal(u.pop(),null);
 assert(E.UNDO_LIMIT>=5&&E.UNDO_LIMIT<=10,'a handful of undo steps (each a 512×384 snapshot, ~0.8 MB)');
 assert.equal(E.rgbToHex(...Object.values(E.hexToRgb('#3fbfb4'))),'#3fbfb4');
});

await ok('the save: newest first, ≤ 5, under the budget, junk refused, a full device handled',()=>{
 const img=n=>'data:image/webp;base64,'+'A'.repeat(n);
 let sv=E.emptyPaintSave();for(let i=0;i<7;i++){const r=E.addPainting(sv,{id:'p-'+i,at:1000+i,img:img(1000)});assert(r.added);sv=r.save;}
 assert.deepEqual(sv.items.map(p=>p.id),['p-6','p-5','p-4','p-3','p-2'],'the newest five, newest first');
 // Bigger pictures: the oldest rotate out until the total fits.
 let big=E.emptyPaintSave();for(let i=0;i<5;i++)big=E.addPainting(big,{id:'b-'+i,at:i,img:img(80*1024)}).save;
 assert(E.paintSaveBytes(big)<=E.PAINT_BUDGET.totalBytes,'under the total budget');assert.equal(big.items[0].id,'b-4','the newest kept');assert(big.items.length<5,'the oldest rotated out');
 assert.equal(E.addPainting(sv,{id:'x',at:9,img:img(E.PAINT_BUDGET.itemBytes)}).added,false,'a picture over the per-item budget is refused');
 assert.equal(E.addPainting(sv,{id:'x',at:9,img:'javascript:alert(1)'}).added,false,'not a picture: refused');
 assert.equal(E.addPainting(sv,{id:'BAD ID',at:9,img:img(10)}).added,false,'a bad id: refused');
 assert.deepEqual(E.sanitizePaintSave({items:[{id:'a',at:1,img:img(10)},{id:'a',at:2,img:img(10)},{id:'b',at:'x',img:img(10)},{id:'c',at:3,img:'data:text/html;base64,AA'},null,5]}).items.map(p=>p.id),['a'],'junk dropped, duplicates once');
 assert.deepEqual(E.sanitizePaintSave('junk'),E.emptyPaintSave());
 // Storage: read/write round trip; a full device drops the oldest and still saves the newest; a broken read is an empty save.
 const mem=new Map(),store={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
 assert.deepEqual(E.writePaintings(sv,store),sv);assert.deepEqual(E.readPaintings(store).items.map(p=>p.id),sv.items.map(p=>p.id));
 const full={getItem:()=>null,setItem:(k,v)=>{if(v.length>3000)throw new Error('QuotaExceededError');mem.set('full',v);}};
 const stored=E.writePaintings(sv,full);assert(stored&&stored.items.length===2&&stored.items[0].id==='p-6','full: the oldest dropped until it fits');
 assert.equal(E.writePaintings(sv,{getItem:()=>null,setItem:()=>{throw new Error('blocked');}}),null,'storage blocked: nothing (no throw)');
 assert.deepEqual(E.readPaintings({getItem:()=>{throw new Error('x');},setItem(){}}),E.emptyPaintSave());
 assert(/^p-[a-z0-9]+-[a-z0-9]+$/.test(E.newPaintingId(Date.now(),.5)));
});

await ok('the key is DEVICE-only: never synced, never sent',()=>{
 const S=load('lib/saves/snapshot.ts');assert.equal(E.PAINT_SAVE_KEY,'fi2-paintings-v1');
 assert(S.DEVICE_KEYS.includes(E.PAINT_SAVE_KEY),'in DEVICE_KEYS');assert(!S.SYNC_KEYS.includes(E.PAINT_SAVE_KEY)&&!S.isSyncKey(E.PAINT_SAVE_KEY),'never synced');
 const doc=read('docs/accounts-design.md'),b=doc.slice(doc.indexOf('**B. Device preferences'),doc.indexOf('**C. Never synced**'));assert(b.includes('`fi2-paintings-v1`'),'docs/accounts-design.md table B');
 // A snapshot of a device with paintings never carries them.
 const mem=new Map([[E.PAINT_SAVE_KEY,'{"version":1,"items":[]}'],['fi2-telescope-v1','{}']]),port={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k),get length(){return mem.size;},key:i=>[...mem.keys()][i]??null};
 assert(!(E.PAINT_SAVE_KEY in S.buildSnapshot(port,Date.now()).keys),'not in a save snapshot');
 for(const f of ['lib/town/paintEasel.ts','lib/graphics/paintEasel.ts','components/PaintEasel.tsx'])assert(!/fetch\(|sendBeacon|XMLHttpRequest/.test(read(f)),f+': no network');
});

await ok('3D runtime: prompt, seat, one snapshot, 20 fps and sleep, Just look, leave, the board',async()=>{
 const {env,T:T3,load:rl}=await runtime();
 const rt=rl('lib/graphics/paintEasel.ts'),store=rl('lib/town/paintEaselStore.ts');
 // Browser bits the runtime touches: an <img> that decodes at once, a fake WebGL canvas for the snapshot.
 globalThis.Image=class{set src(v){this._s=v;this.onload&&this.onload();}get src(){return this._s;}};
 const scene=new T3.Scene(),camera=new T3.PerspectiveCamera(40,390/844,1,500);camera.position.set(s.x+18,s.ground+23,s.z+30);camera.lookAt(s.x,s.ground,s.z);camera.updateMatrixWorld();
 let renders=0,wakes=0;const renderer={domElement:{width:390,height:844,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844})},render:()=>{renders++;}};
 const player=new T3.Group();scene.add(player);
 const easel=rt.createPaintEasel(scene,renderer,{wake:()=>{wakes++;},player:()=>player});const before=scene.children.length;
 const btn={hidden:true,dataset:{},style:{}};
 const ctx=(x,z,extra={})=>({x,z,onGround:true,canEnter:true,camera,width:390,height:844,focusKey:null,ui:()=>btn,place(){},hide(e,h){e.hidden=h;},...extra});
 await env.watchTimers(async()=>{for(let i=0;i<100;i++){easel.update(ctx(120,40));easel.applyCamera(camera,1/30,false);}});
 assert.equal(env.counts.raf+env.counts.timeout+env.counts.interval,0,'idle: no rAF or timers');assert.equal(scene.children.length,before,'idle: nothing added');
 assert.equal(easel.update(ctx(120,40)),null,'off Summit Isle: nothing (one compare)');assert.equal(easel.frameMs,0);assert.equal(easel.focused,false);
 const st=easel.stand;
 assert.equal(easel.update(ctx(st.x,st.z))?.key,'easel','"Paint the view" wants the focus beside the easel');
 assert.equal(easel.update(ctx(s.x+E.EASEL_REACH+1,s.z)),null,'not from further away');
 assert.equal(easel.update(ctx(st.x,st.z,{onGround:false})),null,'not while flying');
 easel.update(ctx(st.x,st.z,{focusKey:'telescope'}));assert.equal(btn.hidden,true,'another prompt has the focus: hidden');
 easel.update(ctx(st.x,st.z,{focusKey:'easel'}));assert.equal(btn.hidden,false,'Paint the view shows');
 assert(read('components/PaintEasel.tsx').includes('data-easel-open aria-label="Paint the view"'));
 // Sit down.
 store.easelActions.open();assert(store.easelStore.get().seated&&easel.seated,'seated');assert(wakes>0,'wakes the island loop');
 assert(env.counts.events.some(e=>e==='fi2-vending-cue:category'),'a soft cue');
 const input={x:1,z:0,kick:true,juggle:true,shotPower:.4};assert.equal(easel.holdPlayer(input),true);assert.equal(input.kick,false);assert.equal(input.shotPower,0);
 assert.equal(easel.update(ctx(st.x,st.z,{focusKey:'easel'})),null,'no prompt while seated');assert.equal(btn.hidden,true);
 store.easelActions.layout({bottom:.44,right:0});
 await env.watchTimers(async()=>{for(let i=0;i<20;i++)easel.applyCamera(camera,1/30,false);});
 assert(!easel.focused&&store.easelStore.get().arrived===false,'still easing in');assert.equal(renders,0,'no snapshot before arriving');
 await env.watchTimers(async()=>{for(let i=0;i<60;i++)easel.applyCamera(camera,1/30,false);});
 assert.equal(env.counts.raf+env.counts.timeout+env.counts.interval,0,'seated: no loops of its own');
 assert(store.easelStore.get().arrived&&easel.focused,'arrived: Town\'s focus mode holds the background still');
 const cam=E.easelCamera(s);assert(camera.position.distanceTo(new T3.Vector3(cam.x,cam.y,cam.z))<1e-6,'the camera behind the canvas');
 const dir=new T3.Vector3();camera.getWorldDirection(dir);assert(dir.x<-.85&&dir.y<0&&dir.y>-.2,'looking out west over the sea, a little down');
 assert.equal(camera.far,E.EASEL_CAMERA.far,'a longer far plane (the main island is ~500 m away)');
 assert(camera.view&&camera.view.enabled&&Math.abs(camera.view.offsetY-.22)<1e-3,'the view shifts up into the open part above the card');
 assert(camera.fov>=E.EASEL_CAMERA.fovMin&&camera.fov<=E.EASEL_CAMERA.fovMax,'a calm, wide framing');
 assert.equal(player.visible,false,'the painter is hidden (the camera stands at their head)');
 assert.equal(renders,1,'one snapshot render on arrival');const cap=store.easelStore.get().capture;assert(cap&&cap.rect.height===844*(1-.44),'the snapshot covers the view above the card');
 for(let i=0;i<30;i++)easel.applyCamera(camera,1/30,false);assert.equal(renders,1,'…and never again while nothing changes');
 assert.equal(easel.frameMs,1000/20,'the 20 fps idle cap while seated');
 assert.equal(easel.still(false),false,'water and life still move: keep drawing at 20 fps');assert.equal(easel.still(true),true,'nothing moving (reduced motion / static tier): the loop may sleep');
 const rev=easel.revision;
 // Just look: the card's room goes, the view drifts gently (not with reduced motion).
 store.easelActions.setMode('look');assert.equal(store.easelStore.get().mode,'look');assert(easel.revision!==rev,'a new sleep key (wakes one frame)');
 const q0=camera.quaternion.clone();for(let i=0;i<60;i++)easel.applyCamera(camera,1/20,false);
 assert(!camera.view.enabled||Math.abs(camera.view.offsetY)<1e-3,'no card: the view centred');assert(camera.quaternion.angleTo(q0)>1e-4,'a slow drift');assert.equal(easel.still(true),false,'drifting: keep drawing (at 20 fps)');
 const q1=camera.quaternion.clone();for(let i=0;i<20;i++)easel.applyCamera(camera,1/20,true);
 const q2=camera.quaternion.clone();easel.applyCamera(camera,1/20,true);assert(camera.quaternion.angleTo(q2)<1e-9,'reduced motion: no drift');void q1;
 assert.equal(easel.still(true),true,'reduced motion in Just look: still, may sleep');
 store.easelActions.setMode('paint');for(let i=0;i<40;i++)easel.applyCamera(camera,1/30,false);assert.equal(renders,1,'back to painting, same layout: the snapshot is reused');
 // A painting saved: it shows on the board (one textured quad, made only now).
 store.easelActions.saved('data:image/webp;base64,AAAA');const board=scene.getObjectByName('paint-easel-board');assert(board,'the board shows the painting');
 assert.equal(scene.children.filter(c=>c.name==='paint-easel-board').length,1,'one quad');
 // Leave: the camera eases back to the follow camera and the projection is restored.
 store.easelActions.exit();assert(!store.easelStore.get().seated&&!easel.seated);assert.equal(easel.holdPlayer({x:0,z:0,kick:true,juggle:false}),false,'free to walk');
 for(let i=0;i<40;i++){camera.position.set(s.x+18,s.ground+23,s.z+30);camera.lookAt(s.x,s.ground,s.z);easel.applyCamera(camera,1/30,false);}
 assert.equal(camera.fov,40,'the normal FOV is back');assert.equal(camera.far,500,'and the far plane');assert(!camera.view||!camera.view.enabled,'and no view offset');
 assert.equal(easel.frameMs,0,'no cap after leaving');assert.equal(easel.focused,false,'focus mode off');
 easel.dispose();assert.equal(scene.children.length,before,'nothing left behind');
});

await ok('heat and UI wiring: live view, capped and asleep when still, drawing only on pointer events, 44 px, HUD aside, counts, Town',()=>{
 const ui=read('components/PaintEasel.tsx'),code=ui.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');
 assert(!/setInterval|setTimeout/.test(code),'the painting UI starts no timers');
 const rafs=code.match(/requestAnimationFrame\(/g)||[];assert.equal(rafs.length,1,'one requestAnimationFrame call…');
 assert(/const move=[^;]*;[\s\S]*?if\(!s\.raf\)s\.raf=requestAnimationFrame\(flush\)/.test(code),'…only in the pointer-move handler, while a finger is down (coalesced)');
 assert(/getCoalescedEvents/.test(code)&&/cancelAnimationFrame\(s\.raf\);flush\(\)/.test(code),'coalesced points, flushed on lift');
 assert(/ResizeObserver/.test(code)&&!/animationend|scroll/.test(code.replace(/overscroll/g,'')),'the layout is measured on size changes only');
 assert(/<BackButton[^>]*onBack=\{leave\}/.test(ui)&&/<DoneButton[^>]*onDone=\{done\}/.test(ui)&&ui.indexOf('<BackButton')<ui.indexOf('<DoneButton'),'Back (left) and Done (right)');
 assert(/data-easel-just-look/.test(ui)&&/Just look/.test(ui)&&/data-easel-look-back/.test(ui)&&/Tap to paint again/.test(ui),'Just look and the way back');
 for(const id of ['data-easel-undo','data-easel-clear','data-easel-trace','data-easel-save','data-easel-size','data-easel-gallery'])assert(ui.includes(id),id);
 assert(/Tap again to clear/.test(ui),'clear asks for a second tap (no popup)');
 const css=read('components/PaintEasel.module.css');
 for(const sel of ['.tool,.act','.swatch','.look','.save'])assert(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\{[^}]*(var\\(--btn-icon\\)|var\\(--btn-height\\))').test(css),sel+' is at least 44 px');
 assert(/\.thumb\{[^}]*width:68px;height:51px/.test(css),'gallery thumbnails 68×51');
 assert(/@media \(max-width:600px\),\(pointer:coarse\)/.test(css),'the one phone query for the header anchors');
 assert(/@media \(prefers-reduced-motion:reduce\)\{[^@]*animation:none[^@]*transition:none/.test(css),'reduced motion: no animation or transition');
 assert(!/backdrop-filter/.test(css),'no backdrop blur over the live view');
 assert(/html\[data-easel=on\] \.town-app>:not\(\.town-scene\):not\(\[data-easel-ui\]\)\{visibility:hidden!important;pointer-events:none!important\}/.test(read('app/globals.css')),'the island HUD steps aside while painting');
 const ids=load('lib/analytics/countIds.ts');for(const e of ['easel_open','easel_save'])assert(ids.SUMMIT_COUNT_EVENTS.some(([k])=>k===e),'count id su:'+e);
 assert(/countEaselOpen\(\)/.test(read('lib/graphics/paintEasel.ts'))&&/countEaselSave\(\)/.test(ui),'counted where it happens');
 const town=read('components/Town.tsx');
 assert(/createPaintEasel\(scene,renderer,\{wake:\(\)=>wakeLoopRef\.current\(\),player:\(\)=>player\.root\}\)/.test(town),'created with a wake port');
 assert(/if\(easel\.holdPlayer\(input\.current\)\)\{velocity\.x=velocity\.z=0;return;\}/.test(town),'seated: no walking');
 assert(/const focusWanted=focusAllowed&&\(fishing\.focused\|\|easel\.focused\)/.test(town)&&/focus\.enter\(s\.x,s\.z,easel\.focused\?Infinity:/.test(town),'focus mode holds the background still (no chunks hidden: the view is far)');
 assert(/const easelStill=!paused&&!quizWaiting&&!aimWaiting&&easel\.still\(reduced\|\|heat\.staticAmbience\)/.test(town)&&/if\(!paused&&!quizWaiting&&!aimWaiting&&!easelStill\)\{idleSince=0;/.test(town)&&/easelStill\?`easel:\$\{easel\.revision\}`/.test(town),'sleeps when nothing moves; a command wakes it');
 assert(/if\(easel\.frameMs\)\{const slot=frameCapSlot\(now,easelSlot,Math\.max\(easel\.frameMs,heat\.frameMs\)\);if\(slot<0\)return;easelSlot=slot;\}/.test(town),'the 20 fps cap while seated');
 assert(/easel\.applyCamera\(camera,dt,reduced\)/.test(town)&&/const easelWant=easel\.update\(/.test(town)&&/if\(easelWant\)cands\.push\(\{kind:'enter',key:easelWant\.key/.test(town),'camera, prompt and the HUD arbiter');
 assert(/easel\.dispose\(\)/.test(town)&&/<PaintEasel\/>/.test(town),'disposed; the UI mounted');
 // The view is never paused under the card: the easel is not in the menu/pause list.
 assert(!/settingsRef\.current=[^;]*easel/i.test(town),'the island is not paused while painting (the view stays live)');
});
console.log(failed?`\npaint-easel: ${failed} failed`:'\npaint-easel: all passed');process.exit(failed?1:0);
})();
