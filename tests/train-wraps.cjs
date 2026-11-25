// Kindness train wraps (Nov 24 2026; lib/town/trainWraps.ts + trainWrapArt.ts). Run: node tests/train-wraps.cjs
//  1. three distinct themes (Fair Play / Help Each Other Up / Cheer Everyone On), one per livery, their slogans, boarding notes and
//     Kenji lines; the boarding note names a theme once a session
//  2. the panels stay on the lower body band: clear of every door frame, under the window frames, on the straight side; the atlas
//     tiles fit and do not overlap; the tiles read left to right on both sides (never mirrored)
//  3. ONE mesh / draw for every wrap, its own material (the shared vehicle material keeps no map); written only in the near tier,
//     faded out before the far box tier (LOD hide), collapsed when a train is no longer drawn; original art (no images loaded)
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const W=L('lib/town/trainWraps.ts'),M=L('lib/town/trainCarModel.ts'),R=L('lib/town/trainRunning.ts'),S=L('lib/town/trainSchedule.ts'),LV=L('lib/town/trainLiveries.ts').LIVERIES;
const T=require('three');
// 1. themes
{const th=W.WRAP_THEMES;assert.equal(th.length,LV.length,'a theme per livery');assert.deepEqual(th.map(t=>t.name),['Fair Play','Help Each Other Up','Cheer Everyone On']);
 assert.deepEqual(th.map(t=>t.slogan.join(' ')),['Shake hands, play fair!','Help a friend up!','Cheer for everyone!']);
 assert.equal(new Set(th.map(t=>t.board)).size,3,'3 boarding notes');assert.equal(new Set(th.map(t=>t.kenji)).size,3,'3 Kenji lines');
 for(const t of th){assert(t.board.startsWith(`You're on the ${t.name} train!`),'the note names the theme: '+t.board);assert(t.kenji.includes(t.name),'Kenji names the theme');}
 for(let i=0;i<S.TRAIN_COUNT;i++)assert.equal(W.wrapThemeOf(i),th[i%LV.length],'train '+i+' wears its livery\'s theme');
 W.resetWrapNotes();assert.equal(W.wrapBoardNote(0,'usual'),th[0].board);assert.equal(W.wrapBoardNote(0,'usual'),'usual','once a theme');assert.equal(W.wrapBoardNote(1,'usual'),th[1].board);W.resetWrapNotes();
 const base={id:'train-kenji',name:'K',role:'r',greeting:'g',x:1,z:2,character:'male',face:'warm',clothing:'classic',topics:[{id:'a',question:'q',answer:'a',followUp:{question:'q',answer:'a'}}],lines:['l']};
 const k0=W.kenjiWrapNpc(0,base),k2=W.kenjiWrapNpc(2,base);assert(k0.greeting.includes('Fair Play')&&k2.greeting.includes('Cheer Everyone On'),'Kenji greets with the theme');
 assert.equal(k0.topics[0].id,'k-wrap');assert.equal(k0.topics.length,2);assert.equal(k0.lines[0],th[0].kenji);assert.equal(W.kenjiWrapNpc(-1,base),base,'no train: his usual talk');}
// 2. layout
{const holes=M.DOORS.map(d=>[d-M.DOOR_HALF-.06,d+M.DOOR_HALF+.06]);
 for(const [z0,z1] of W.PANELS){assert(z1-z0>1,'a panel over 1 m long');assert(z0>=-5.9&&z1<=5.62,'on the straight side');
  for(const [a,b] of holes)assert(z1<=a-.1||z0>=b+.1,`panel ${z0.toFixed(2)}…${z1.toFixed(2)} clear of the door frame ${a.toFixed(2)}…${b.toFixed(2)}`);}
 assert(W.WRAP_Y1<=M.WIN_Y0-.045-.02,'under the window frames (passengers stay visible)');assert(W.WRAP_Y0>=M.BODY_Y0,'on the body');
 assert(W.BADGE.y-W.BADGE.r>=1.66+.22&&W.BADGE.y+W.BADGE.r<=2.22,'the cab badge over the headmark, under the windscreen');
 const rects=[];for(let t=0;t<3;t++){for(let k=0;k<W.PANELS.length;k++)rects.push(W.tileRect(t,k));rects.push(W.badgeRect(t));}
 for(const r of rects)assert(r.x>=0&&r.y>=0&&r.x+r.w<=W.ATLAS_W&&r.y+r.h<=W.ATLAS_H,'tile inside the atlas');
 for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'tiles never overlap');}
 for(let k=0;k<W.PANELS.length;k++){const r=W.tileRect(0,k),[z0,z1]=W.PANELS[k];assert(Math.abs(r.w/r.h-(z1-z0)/(W.WRAP_Y1-W.WRAP_Y0))<.02,'tile aspect = panel aspect (no stretch)');}
 assert(W.ATLAS_W*W.ATLAS_H<=2048*1024,'a small atlas');
 // reading direction: the viewer's right is −z on the +x side, +z on the −x side; u grows to the right
 for(const q of [0,W.PANELS.length]){const l=W.quadLocal(q,0),side=l.n[0],dz=l.p[5]-l.p[2],du=l.uv[2]-l.uv[0];assert(du>0&&Math.sign(dz)===-side,'tile reads left to right from outside');}}
// 3. one draw, LOD, no shared-material change
{const w=W.createTrainWraps();assert(w.mesh instanceof T.Mesh&&!(w.mesh instanceof T.InstancedMesh),'one mesh');assert.equal(w.mesh.geometry.index.count,W.WRAP_QUADS*6);
 const idm=new T.Matrix4();w.begin();w.car(0,0,idm,.3);w.car(0,1,idm,.3);w.end(0);assert(w.mesh.visible&&w.drawn===2*W.QUADS_PER_CAR,'near tier: drawn');
 const p=w.mesh.geometry.attributes.position.array;assert(Math.abs(p[0])>M.HALF_W,'proud of the skin');
 w.begin();w.car(1,0,idm,R.LOD_NEAR_OUT);w.end(.5);assert(!w.mesh.visible&&w.drawn===0,'faded to nothing at the far-tier threshold');assert(p.slice(0,W.QUADS_PER_CAR*2*12).every(v=>v===0),'a train no longer drawn is collapsed');
 assert(Math.abs(w.material.emissiveIntensity-.5*W.NIGHT_GLOW)<1e-9,'night glow from the shared night factor');
 assert.equal(W.wrapAlpha(R.LOD_NEAR_OUT),0);assert.equal(W.wrapAlpha(R.LOD_FAR_IN),0);assert(W.FADE_ZERO>=R.LOD_NEAR_OUT,'gone before the box tier');assert.equal(W.wrapAlpha(.3),1);
 assert(w.material.polygonOffset&&w.material.map,'own material, polygon offset');w.dispose();
 const Rn=read('lib/town/trainRunning.ts');assert.equal((Rn.match(/createTrainWraps\(\)/g)||[]).length,1,'one wraps mesh for all trains');
 assert(/if\(far\)\{writeInside\(i,c,m4,false,0\);continue;\}[^\n]*wraps\.car\(i,c,m4,size\)/.test(Rn),'written only in the near tier');
 assert(/wraps\.end\(night\)/.test(Rn)&&/wraps\.prime\(m4\)/.test(Rn)&&/wraps\.dispose\(\)/.test(Rn)&&/plates,wraps\.mesh/.test(Rn),'hooks: end / prime / warm / dispose');
 assert(!/trainWrap|\.map=/.test(read('lib/graphics/trafficVehicles.ts')),'the shared vehicle material keeps no map');
 const art=read('lib/town/trainWrapArt.ts');assert(!/drawImage|new Image|https?:|fetch\(/.test(art),'original vector art, nothing loaded');}
console.log('train-wraps: ok');
