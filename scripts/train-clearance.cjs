// Island Line clearance envelope (Nov 24 2026, owner shot 34: "palm trees are in the way of the train"). The swept volume of a
// car along the whole loop, following the bed (bridge, trestles, tunnel, cuttings): 2.8 m wide + 0.6 m each side (|lateral| <= 2.0 m)
// from just over the rail top to the roof, AC and pantograph (bed + 0.45 ... bed + 4.95 m), plus the catenary zone over the middle
// (|lateral| <= 1.2 m, up to bed + 5.8 m). Every mesh the island builds (before the batching pass merges them, so the line's own
// pieces are still tagged userData.train) is tested in 3D: every vertex and points every 0.4 m along every triangle edge, so a
// leaning trunk, a palm frond, an eave, a cable or a bridge deck crossing the line is caught, not only a base near the rails.
// The line's own pieces (rails, catenary poles / wire, platforms, station houses, crossing decks) are exempt.
// Run: node scripts/train-clearance.cjs            (lists every hit, grouped by object; exit 1 when any)
// Used by tests/train-clearance.cjs.
const path=require('path');
const HALF=1.4+.6,LOW=.45,ROOF=4.95,WIRE_HALF=1.2,WIRE_TOP=5.8,STEP=.4;
// Looks 2 (Nov 24 2026, owner shot 37: the train showed over the hill behind the east portal): the DRAWN Summit ground over the tube,
// sampled every COVER_STEP m along it (a ray down onto the ground sheets): over the pantograph band (|lateral| <= COVER_HALF) at least
// rail top + COVER_PANTO + COVER_MIN over the bed; across the whole tube at least the tube's own crown + COVER_MIN. From the portal
// planes inward (the headwall leans back over the first metre).
const COVER_STEP=2,COVER_HALF=1,COVER_PANTO=4.8,COVER_MIN=.5,COVER_RAIL=.34;
module.exports={scanClearance:base=>scanWith(base),HALF,LOW,ROOF,WIRE_HALF,WIRE_TOP,COVER_STEP,COVER_HALF,COVER_PANTO,COVER_MIN};
async function scanWith(base=path.join(__dirname,'..')){
 // first pass gives L (module cache of the island build); the scan runs on that same module instance at the pause
 const mod=require('./island-world-load.cjs');let hits=null,cover=null,prev=-1,L=null;
 const r=await mod.loadIslandWorld(base,{onStep(scene,i,Lh){L=Lh;let m=0,tr=0;scene.traverse(o=>{if(o.isMesh){m++;if(o.userData.train)tr++;}});
  if(!hits&&tr>0&&m===prev){const T=require(path.join(base,'node_modules/three'));hits=scanScene(scene,T,L);cover=scanCover(scene,T,L);}prev=m;}});
 if(!hits)throw new Error('clearance: no pause before the batching pass');
 return {hits,cover,...r};
}
/** The drawn ground over the Summit tube (see COVER_*): every sample under its need, and the closest one. */
function scanCover(scene,T,L){
 const tt=L('lib/town/trainTrack.ts'),W=tt.TUNNEL.west,E=tt.TUNNEL.east,R=tt.TUNNEL_HALF_WIDTH,B=tt.TUNNEL_BED,ground=[];
 scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&/^summit-isle-ground/.test(o.name))ground.push(o);});
 const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),o=new T.Vector3(),fails=[];let worst=null,n=0;
 for(const m of ground){m.material=m.material.clone();m.material.side=T.DoubleSide;}// the top surface from above, whatever its winding
 const s0=W.s+tt.MOUTH_LIFT+.1,s1=E.s-tt.MOUTH_LIFT-.1;// from just behind each mouth plane (the headwall stands over the first .5 m)
 for(let s=s0;s<=s1+COVER_STEP-1e-6;s+=COVER_STEP){if(s>s1)s=s1;const a=tt.trackAt(s);
  for(let v=-R;v<=R+1e-6;v+=.5){o.set(a.x+a.tz*v,B+80,a.z-a.tx*v);ray.set(o,down);const hit=ray.intersectObjects(ground,false)[0];n++;
   const y=hit?hit.point.y-B:-99,need=Math.abs(v)<=COVER_HALF?COVER_RAIL+COVER_PANTO+COVER_MIN:2.4+Math.sqrt(R*R-v*v)+COVER_MIN,gap=y-need;
   if(!worst||gap<worst.gap)worst={s:+s.toFixed(1),v,y:+y.toFixed(2),need:+need.toFixed(2),gap:+gap.toFixed(2)};
   if(gap<0)fails.push({s:+s.toFixed(1),in:+Math.min(s-W.s,E.s-s).toFixed(1),v,y:+y.toFixed(2),need:+need.toFixed(2)});}}
 return {fails,worst,n,meshes:ground.length};
}
/** The placed thing a mesh belongs to: its nearest named / grouped ancestor under the town root (a palm's trunk and fronds share it). */
function ownerOf(o){const q=o.parent&&o.parent.parent&&o.parent.parent.type!=='Scene'?o.parent:o;
 const w=new (o.position.constructor)();q.getWorldPosition(w);return {id:q.id,name:q.name||q.type,x:+w.x.toFixed(1),z:+w.z.toFixed(1)};}
function scanScene(scene,T,L){
 const tt=L('lib/town/trainTrack.ts'),tl=L('lib/town/trainLayout.ts'),prof=tl.trainLayout().profile,TR=tt.TRACK;
 const near=(minX,minZ,maxX,maxZ,pad)=>{for(let i=0;i<TR.n;i++){const x=TR.x[i],z=TR.z[i];if(x>=minX-pad&&x<=maxX+pad&&z>=minZ-pad&&z<=maxZ+pad)return true;}return false;};
 const out=[],box=new T.Box3(),m4=new T.Matrix4(),im=new T.Matrix4(),a=new T.Vector3(),b=new T.Vector3(),p=new T.Vector3(),c=new T.Vector3();
 // terrain = Summit Isle's ground sheets: inside the tunnel (between the portal planes) the hill's ramp up over the tube lies behind
 // the dark mouth and is seen only from below there (one-sided: culled), so the tube, the line's own, is the envelope's wall.
 let terrain=false;
 const test=(x,y,z)=>{const h=tt.trackNearest(x,z,HALF);if(!h)return null;if(terrain&&tt.inTunnelS(h.s))return null;const bed=tt.bedAt(prof,h.s),dy=y-bed;
  if(h.d<=HALF&&dy>LOW&&dy<=ROOF)return {s:h.s,d:h.d,dy};if(h.d<=WIRE_HALF&&dy>ROOF&&dy<=WIRE_TOP)return {s:h.s,d:h.d,dy,wire:true};return null;};
 scene.updateMatrixWorld(true);
 const meshes=[];scene.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(q.userData&&q.userData.train)return;meshes.push(o);});
 for(const o of meshes){const g=o.geometry,pos=g&&g.getAttribute('position');if(!pos)continue;if(!g.boundingBox)g.computeBoundingBox();
  const n=o.isInstancedMesh?o.count:1;
  for(let k=0;k<n;k++){m4.copy(o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(k,im);m4.multiply(im);}
   box.copy(g.boundingBox).applyMatrix4(m4);if(!near(box.min.x,box.min.z,box.max.x,box.max.z,HALF+.5))continue;
   const big=(box.max.x-box.min.x)>40||(box.max.z-box.min.z)>40;// ground / sea sheets: vertices only
   terrain=/^summit-isle-ground/.test(o.name);
   const idx=g.index,cnt=idx?idx.count:pos.count,vi=i=>idx?idx.getX(i):i;let worst=null,np=0;
   const check=v=>{const r=test(v.x,v.y,v.z);if(!r)return;np++;if(!worst||r.d<worst.d)worst={...r,x:v.x,y:v.y,z:v.z};};
   for(let t=0;t+2<cnt;t+=3)for(let e=0;e<3;e++){a.fromBufferAttribute(pos,vi(t+e)).applyMatrix4(m4);check(a);if(big)continue;
    b.fromBufferAttribute(pos,vi(t+(e+1)%3)).applyMatrix4(m4);const len=a.distanceTo(b);if(len>STEP){const k2=Math.ceil(len/STEP);for(let j=1;j<k2;j++){p.lerpVectors(a,b,j/k2);check(p);}}}
   if(worst){box.getCenter(c);out.push({name:o.name||'',parent:(o.parent&&o.parent.name)||'',inst:o.isInstancedMesh?k:-1,cx:+c.x.toFixed(1),cz:+c.z.toFixed(1),
    minY:+box.min.y.toFixed(2),maxY:+box.max.y.toFixed(2),s:Math.round(worst.s),d:+worst.d.toFixed(2),dy:+worst.dy.toFixed(2),wire:!!worst.wire,
    at:[+worst.x.toFixed(1),+worst.y.toFixed(1),+worst.z.toFixed(1)],n:np,colour:o.material&&o.material.color?'#'+o.material.color.getHexString():'',tag:typeof o.userData.propTag==='string'?o.userData.propTag:o.userData.propTag?JSON.stringify(o.userData.propTag).slice(0,60):'',geo:g.type,owner:ownerOf(o)});}}}
 return out;
}
if(require.main===module)scanWith().then(({hits,cover})=>{
 hits.sort((x,y)=>x.s-y.s);
 console.log(`tunnel cover: ${cover.n} samples on ${cover.meshes} ground sheet(s), ${cover.fails.length} under the need; closest ${JSON.stringify(cover.worst)}`);
 for(const f of cover.fails.slice(0,30))console.log('  cover low',JSON.stringify(f));
 if(process.argv.includes('--owners')){const by=new Map();for(const h of hits){const k=h.owner.id;const e=by.get(k)||{...h.owner,parts:0,s:h.s,d:9,dy:0,wire:0,colours:new Set()};e.parts++;e.d=Math.min(e.d,h.d);e.dy=Math.max(e.dy,h.dy);e.wire|=h.wire;e.colours.add(h.colour+(h.tag?' '+h.tag:''));by.set(k,e);}
  for(const e of [...by.values()].sort((a,b)=>a.s-b.s))console.log(`s ${String(e.s).padStart(4)}  ${e.name} @ ${e.x},${e.z}  parts ${e.parts}  min d ${e.d.toFixed(2)}  top dy ${e.dy.toFixed(2)}${e.wire?' WIRE':''}  ${[...e.colours].join(' | ')}`);
  console.log(`train clearance: ${by.size} owner(s), ${hits.length} mesh(es)`);process.exit(hits.length||cover.fails.length?1:0);}
 for(const h of hits)console.log(`s ${String(h.s).padStart(4)}  centre ${h.cx},${h.cz}  hit ${h.at.join(',')}  d ${h.d} dy ${h.dy}${h.wire?' WIRE':''}  y ${h.minY}..${h.maxY}  ${h.geo} ${h.colour} ${h.name}${h.parent?' <'+h.parent+'>':''}${h.tag?' ['+h.tag+']':''} pts ${h.n}`);
 console.log(`train clearance: ${hits.length} object(s) inside the envelope`);process.exit(hits.length||cover.fails.length?1:0);
}).catch(e=>{console.error(e);process.exit(2);});
