// Island Line clearance (Nov 24 2026, owner shot 34: "palm trees are in the way of the train. Audit and make sure there are no trees
// or obstacles on the track that can hit it"). Run: node tests/train-clearance.cjs
//  0. the hill's cover over the Summit tube (scripts/train-clearance.cjs scanCover, Looks 2)
//  1. the 3D envelope (scripts/train-clearance.cjs): every island mesh (trunks as built, leaning or not, fronds, canopies, eaves,
//     signs, poles, cables, decks) tested vertex by vertex and every 0.4 m along every edge against the car's swept volume along the
//     whole loop (|lateral| <= 2.0 m, bed + 0.45 ... 4.95 m; the catenary zone |lateral| <= 1.2 m to bed + 5.8 m): no hit
//  2. the palm rule (lineClearSpot): a palm placed within PALM_LINE_CLEAR m steps back and leans away; far ones stay put
//  3. ball spots and islanders' homes: none stands on the line (a ball or an NPC in the envelope) outside a crossing or a platform
const assert=require('node:assert/strict'),path=require('node:path');
const {scanClearance}=require('../scripts/train-clearance.cjs');
(async()=>{
 const {hits,cover,L,world}=await scanClearance(path.join(__dirname,'..'));
 // 0. Looks 2 (owner shot 37): the drawn hill over the Summit tube, every 2 m from each portal: over rail top + 4.8 + 0.5 m above the
 //    pantograph band and over the tube's crown + 0.5 m across it (no train roof or pantograph showing over the hill)
 assert(cover.meshes>0&&cover.n>500,'the tunnel cover was sampled');
 assert.equal(cover.fails.length,0,`the hill over the tube is too low: ${cover.fails.slice(0,5).map(f=>JSON.stringify(f)).join('; ')}`);
 assert.equal(hits.length,0,`inside the train's envelope: ${hits.slice(0,6).map(h=>`${h.colour} ${h.name||h.geo} at ${h.at.join(',')} (s ${h.s}, ${h.d} m off, ${h.dy} m up)`).join('; ')}`);
 const tt=L('lib/town/trainTrack.ts'),tl=L('lib/town/trainLayout.ts');
 // 2. the palm rule
 {const p=tt.trackAt(2160),n=tt.leftNormal(p.tx,p.tz),c=tl.lineClearSpot(p.x+n.x*.5,p.z+n.z*.5);
  assert(c&&Math.abs(tt.trackNearest(c.x,c.z,12).d-tl.PALM_LINE_CLEAR)<.2,'a palm on the line steps back to PALM_LINE_CLEAR');
  assert(c.ux*n.x+c.uz*n.z>.99,'on its own side, leaning away');
  assert.equal(tl.lineClearSpot(p.x+n.x*7,p.z+n.z*7),null,'7 m off: stays');
  assert(tl.PALM_LINE_CLEAR>=tl.ENVELOPE_HALF+3.25,'the crown (3.25 m fronds) clears the envelope');
  for(const a of world.assets.filter(a=>a.kind==='palm')){const h=tt.trackNearest(a.x,a.z,tl.PALM_LINE_CLEAR-.01);assert(!h||tt.inTunnelS(h.s),`palm at ${a.x.toFixed(1)},${a.z.toFixed(1)} only ${h&&h.d.toFixed(2)} m off the line`);}}
 // 3. balls and islanders
 {const P=tl.trainLayout().profile,onLine=(x,y,z)=>{const h=tt.trackNearest(x,z,tl.ENVELOPE_HALF+.3);if(!h||tt.inTunnelS(h.s))return false;
   if(tt.TRAIN_CROSSINGS.some(c=>Math.abs(tt.wrapS(h.s-c.s+tt.TRACK.length/2)-tt.TRACK.length/2)<c.width/2+1))return false;
   const dy=y-tt.bedAt(P,h.s);return dy>-.6&&dy<tl.ENVELOPE_ROOF;};
  const Q=L('lib/town/coinQuest.ts').COIN_QUEST;for(const b of Q)assert(!onLine(b.x,b.y??0,b.z),`ball ${b.id} at ${b.x},${b.z} on the line`);
  const npcs=[...L('lib/town/coralCayNpcs.ts').CORAL_CAY_NPCS,...L('lib/town/eastPierNpcs.ts').EAST_PIER_NPCS,...L('lib/town/townsfolkCast.ts').TOWNSFOLK_CAST];
  for(const n of npcs)assert(!onLine(n.x,n.y??0,n.z),`islander ${n.id||n.name} at ${n.x},${n.z} stands on the line`);
  assert(Q.length>50&&npcs.length>20,'the data loaded');}
 console.log('train-clearance: ok');
})().catch(e=>{console.error(e);process.exit(1);});
