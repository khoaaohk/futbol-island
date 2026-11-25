// Island signs: posts never cover the words (Nov 25 2026, owner shots 78/79: the Island Line board's post ran up through
// "ISLAND LINE", the South name board's two posts passed in front of its text and arrows). "Audit all the signs on the island
// and make sure the poles don't run up into the sign and cover the text."
// Every textured board the island builds (a PlaneGeometry with a map: place / district / shop / station / teaching signs) is
// checked against every other mesh near it, before the batching pass merges them: each vertex and a point every 5 cm along
// every triangle edge is taken into the board's own frame (u across, v up, n out of the readable face). A point COVERS the
// sign when it lies over the text box (|u| <= w/2 - TEXT_MARGIN*w, |v| <= h/2 - TEXT_MARGIN_V*h) and not at least POST_GAP behind the face
// (n > -POST_GAP) and less than NEAR in front (attached hardware, not a tree across the street). Backing boards, walls, frame
// rails, awnings and canopies (a single box / panel / bar spanning >= 80% of the face's width in that frame) are the sign's own
// mounting, not a post; merged batches (a station's posts share one geometry) are tested point by point. Boards with no words
// drawn (glow cards behind neon) are skipped.
// Run: node scripts/sign-posts-scan.cjs [--all] [--json=<file>]   (lists every covered sign; exit 1 when any; --json writes every
// checked board's words, centre and face normal: scripts/shot-island-signs.cjs poses its cameras from it). Used by tests/island-signs.cjs.
const path=require('path');
const FOLIAGE=/^(Icosahedron|Sphere|Dodecahedron|Octahedron)Geometry$/;// crowns and shrubs: not posts
const POST_GAP=.02,TEXT_MARGIN=.06,TEXT_MARGIN_V=.15,NEAR=.5,STEP=.05;
module.exports={scanSigns:base=>scanWith(base),scanScene,POST_GAP,TEXT_MARGIN,TEXT_MARGIN_V,NEAR};
async function scanWith(base=path.join(__dirname,'..')){
 const mod=require('./island-world-load.cjs');let res=null,prev=-1;
 const r=await mod.loadIslandWorld(base,{onStep(scene){let m=0,tr=0;scene.traverse(o=>{if(o.isMesh){m++;if(o.userData.train)tr++;}});
  if(!res&&tr>0&&m===prev){const T=require(path.join(base,'node_modules/three'));res=scanScene(scene,T);}prev=m;}});
 if(!res)throw new Error('signs: no pause before the batching pass');
 return {...res,...r};
}
const textOf=m=>{const img=m.material&&m.material.map&&m.material.map.image;return img&&img.texts&&img.texts.length?img.texts.join(' / '):'';};
function scanScene(scene,T){
 scene.updateMatrixWorld(true);
 const faces=[],others=[];
 scene.traverse(o=>{if(!o.isMesh||!o.geometry)return;const g=o.geometry,P=g.parameters;
  if(g.type==='PlaneGeometry'&&o.material&&o.material.map&&P&&P.width<=30&&P.height<=12){faces.push(o);return;}others.push(o);});
 const inv=new T.Matrix4(),m4=new T.Matrix4(),im=new T.Matrix4(),box=new T.Box3(),fb=new T.Box3(),a=new T.Vector3(),b=new T.Vector3(),p=new T.Vector3(),q=new T.Vector3(),sc=new T.Vector3();
 const out=[],all=[];
 for(const f of faces){const w=f.geometry.parameters.width,h=f.geometry.parameters.height;f.matrixWorld.decompose(q,new T.Quaternion(),sc);
  const W=w*sc.x,H=h*sc.y;if(W<.3||H<.12||!textOf(f))continue;{const c=new T.Vector3(),nv=new T.Vector3(0,0,1).transformDirection(f.matrixWorld);f.getWorldPosition(c);all.push({text:textOf(f),train:!!f.userData.train,w:+W.toFixed(2),h:+H.toFixed(2),at:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)],nrm:[+nv.x.toFixed(3),+nv.y.toFixed(3),+nv.z.toFixed(3)]});}// labels, price tags and decals: not on posts
  inv.copy(f.matrixWorld).invert();fb.setFromObject(f);fb.expandByScalar(NEAR+.1);
  const ux=w/2-TEXT_MARGIN*w,vy=h/2-TEXT_MARGIN_V*h,gap=POST_GAP/Math.max(1e-6,sc.z||1);
  const hits=[];
  for(const o of others){const g=o.geometry,pos=g.getAttribute('position');if(!pos||FOLIAGE.test(g.type))continue;if(!g.boundingBox)g.computeBoundingBox();
   const n=o.isInstancedMesh?o.count:1;
   for(let k=0;k<n;k++){m4.copy(o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(k,im);m4.multiply(im);}
    box.copy(g.boundingBox).applyMatrix4(m4);if(!box.intersectsBox(fb))continue;
    // the part's extent in the face's frame: a backing board / wall / frame spans the face
    const lb=box.clone().applyMatrix4(inv);if(/^(Box|Plane|Cylinder)Geometry$/.test(g.type)&&lb.max.x-lb.min.x>=.8*w)continue;
    const idx=g.index,cnt=idx?idx.count:pos.count,vi=i=>idx?idx.getX(i):i;let worst=null,np=0;
    const check=v=>{p.copy(v).applyMatrix4(inv);if(Math.abs(p.x)<=ux&&Math.abs(p.y)<=vy&&p.z>-gap&&p.z<NEAR){np++;if(!worst||p.z>worst.n)worst={u:+p.x.toFixed(2),v:+p.y.toFixed(2),n:+p.z.toFixed(3)};}};
    for(let t=0;t+2<cnt;t+=3)for(let e=0;e<3;e++){a.fromBufferAttribute(pos,vi(t+e)).applyMatrix4(m4);check(a);
     b.fromBufferAttribute(pos,vi(t+(e+1)%3)).applyMatrix4(m4);const len=a.distanceTo(b);if(len>STEP){const k2=Math.min(400,Math.ceil(len/STEP));for(let j=1;j<k2;j++){p.lerpVectors(a,b,j/k2);check(p.clone());}}}
    if(worst){const bc=box.getCenter(new T.Vector3()),bs=box.getSize(new T.Vector3());worst.part=`${bc.x.toFixed(2)},${bc.y.toFixed(2)},${bc.z.toFixed(2)} size ${bs.x.toFixed(2)}x${bs.y.toFixed(2)}x${bs.z.toFixed(2)}`;}
    if(worst)hits.push({geo:g.type,colour:o.material&&o.material.color?'#'+o.material.color.getHexString():'',name:o.name||'',train:!!o.userData.train,pts:np,...worst});}}
  if(hits.length){const c=new T.Vector3();f.getWorldPosition(c);out.push({text:textOf(f),at:[+c.x.toFixed(1),+c.y.toFixed(1),+c.z.toFixed(1)],w:+W.toFixed(2),h:+H.toFixed(2),train:!!f.userData.train,hits});}}
 return {covered:out,faces:faces.length,checked:all};
}
if(require.main===module)scanWith().then(({covered,faces,checked})=>{
 {const j=process.argv.find(a=>a.startsWith('--json='));if(j)require('fs').writeFileSync(j.slice(7),JSON.stringify(checked,null,1));}
 if(process.argv.includes('--all'))for(const t of checked)console.log('  board:',t.text.slice(0,60));
 for(const s of covered){console.log(`"${s.text||'?'}" @ ${s.at.join(',')}  ${s.w}x${s.h}${s.train?' [train]':''}`);
  for(const h of s.hits.slice(0,4))console.log(`   ${h.geo} ${h.colour} ${h.name} pts ${h.pts} worst u ${h.u} v ${h.v} n ${h.n}  part ${h.part}`);}
 console.log(`island signs: ${faces} board face(s), ${covered.length} covered by a post or part`);process.exit(covered.length?1:0);
}).catch(e=>{console.error(e);process.exit(2);});
