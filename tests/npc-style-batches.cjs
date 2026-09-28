// NPC style views (docs/performance-guide.md, budget-reallocation pass): individually rendered bean rigs (townsfolk) draw only
// their own hair/hat style's index range, in the colour and the shadow pass (same mesh geometry), from a view that shares the
// base buffers; playerBatch still groups exactly as before; picking still tests the whole base; hidden/costume/classic unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const CS=load('lib/graphics/characterStyle.ts'),{createPlayer}=load('lib/graphics/player.ts'),{playerBatch,styleIndexRange}=load('lib/graphics/playerBatch.ts');
const B=load('lib/graphics/beanSkin.ts'),L=load('lib/graphics/beanLook.ts'),{npcDress}=load('lib/town/beanLooks.ts'),{NPC_DIALOGUES}=load('lib/town/npcDialogues.ts');
const {DEFAULT_CUSTOMIZATION}=load('lib/town/customization.ts');
const bean=(id,team='home')=>{CS.setCharacterStyle('bean');const r=createPlayer(id,team,false);CS.setCharacterStyle(undefined);return r;};
const geos=B.beanGeometries(),baseOf={'bean-hair':geos.hair,'bean-hat':geos.hat},texelOf={'bean-hair':B.BD.hair,'bean-hat':B.BD.hat1};
const styleOf=(skin,mesh)=>Math.round(skin.data[texelOf[mesh.name]*4+3]);
/** The mesh draws exactly its style's whole range (nothing of another style, nothing of its own left out). */
function checkOwnRange(mesh,style,label){
 const base=baseOf[mesh.name],g=mesh.geometry,idx=base.index,anchor=base.getAttribute('beanAnchor'),full=idx.count;
 if(style<=0){assert.equal(g,base,`${label}: no style → the base geometry (mesh hidden)`);assert.equal(mesh.visible,false,`${label}: hidden`);return 0;}
 assert.notEqual(g,base,`${label}: a style view, not the whole geometry`);assert.equal(g.userData.beanStyleBase,base);assert.equal(g.userData.beanStyle,style);
 assert.equal(g.name,base.name,'same name (playerBatch style texel lookup)');assert.equal(g.index,base.index,'shares the index buffer');
 for(const k of Object.keys(base.attributes))assert.equal(g.attributes[k],base.attributes[k],`shares attribute ${k} (no copy, no upload)`);
 assert(g.boundingSphere.equals(base.boundingSphere)&&g.boundingBox.equals(base.boundingBox),'same bounds (same frustum culling)');
 const {start,count}=g.drawRange;assert(count>0&&count<full,`${label}: draws ${count} of ${full} indices`);
 for(let i=0;i<full;i++){const own=Math.round(anchor.getW(idx.getX(i)))===style,inside=i>=start&&i<start+count;assert.equal(inside,own,`${label}: index ${i} ${own?'of':'not of'} style ${style} is ${inside?'inside':'outside'} the range`);}
 {const r=styleIndexRange(base,style);assert(r&&r.start===start&&r.count===count,'the same range playerBatch uses');}return count;
}

// 1. Every townsperson (islandNpcs: createPlayer + setBeanLook(npcDress(definition))) draws only its own hair and hat range.
{
 const src=fs.readFileSync('lib/graphics/islandNpcs.ts','utf8');assert.match(src,/const dress=npcDress\(definition\);rig\.setBeanLook\(dress\.look,dress\.outfit\)/,'townsfolk dress through setBeanLook');
 let drawn=0,full=0,views=0;const used=new Set();
 for(const d of NPC_DIALOGUES){const r=bean('town-npc-'+d.id);r.setAppearance({...DEFAULT_CUSTOMIZATION,character:d.character,face:d.face,clothing:d.clothing,body:d.body??'balanced'});const dress=npcDress(d);r.setBeanLook(dress.look,dress.outfit);
  const skin=B.beanSkinOf(r);assert(skin.active,'townsfolk never wear a costume');
  for(const mesh of skin.meshes.slice(2)){const st=styleOf(skin,mesh),n=checkOwnRange(mesh,st,`${d.id} ${mesh.name}`);if(st>0){views++;drawn+=n;full+=baseOf[mesh.name].index.count;used.add(mesh.name+st);}
   // Shadow pass: three draws object.geometry with customDepthMaterial, so the hat shadow uses the same range; hair casts none (as before).
   assert.equal(mesh.castShadow,mesh.name==='bean-hat');assert(mesh.customDepthMaterial);}
  r.dispose();}
 assert(views>NPC_DIALOGUES.length,'most townsfolk have hair and/or a hat');
 // Views are cached per style: rigs with the same style share one view (one VAO per style, not per rig).
 const a=bean('va'),b=bean('vb');for(const r of [a,b])r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'long',color:'#333'},headwear:'bucket'},L.DEFAULT_CASUAL_OUTFIT);
 assert.equal(B.beanSkinOf(a).meshes[2].geometry,B.beanSkinOf(b).meshes[2].geometry);assert.equal(B.beanSkinOf(a).meshes[3].geometry,B.beanSkinOf(b).meshes[3].geometry);a.dispose();b.dispose();
 console.log(`NPC_STYLE_RANGES_PASS ${NPC_DIALOGUES.length} townsfolk, ${views} hair/hat meshes draw ${drawn} of ${full} indices (${(100-drawn/full*100).toFixed(0)}% fewer), ${used.size} styles in use`);
}

// 2. Look changes swap the view; a covering hat hides short hair (base, hidden); every style of both geometries has a view.
{
 const r=bean('swap'),skin=B.beanSkinOf(r),[,,hair,hat]=skin.meshes;
 for(const [style,id] of Object.entries(B.HAIR_IDS)){r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style,color:'#222'},headwear:'none'},L.DEFAULT_CASUAL_OUTFIT);assert.equal(styleOf(skin,hair),id);checkOwnRange(hair,id,'hair '+style);}
 for(const [hw,id] of Object.entries(B.HAT_IDS)){r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'long',color:'#222'},headwear:hw},L.DEFAULT_CASUAL_OUTFIT);assert.equal(styleOf(skin,hat),id);checkOwnRange(hat,id,'hat '+hw);}
 r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'crop',color:'#222'},headwear:'beanie'},L.DEFAULT_CASUAL_OUTFIT);checkOwnRange(hair,0,'crop under a beanie');checkOwnRange(hat,B.HAT_IDS.beanie,'beanie');
 // Costume (classic body shows, skin sleeps) and back: the view stays, only visibility changes, as before.
 r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'puffs',color:'#222'},headwear:'cap'},L.DEFAULT_CASUAL_OUTFIT);const hv=hair.geometry,kv=hat.geometry;
 r.setAppearance({...DEFAULT_CUSTOMIZATION,character:'male',costume:'lion'});assert(!skin.active&&!hair.visible&&!hat.visible);assert.equal(hair.geometry,hv);
 r.setAppearance({...DEFAULT_CUSTOMIZATION,character:'male',costume:'none'});assert(skin.active&&hair.visible&&hat.visible);assert.equal(hair.geometry,hv);assert.equal(hat.geometry,kv);
 r.dispose();
 // Classic style: untouched (no bean meshes, no views).
 CS.setCharacterStyle('classic');const c=createPlayer('classic-npc','home',false);CS.setCharacterStyle(undefined);let beanMeshes=0;c.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('bean-'))beanMeshes++;});assert.equal(beanMeshes,0);c.dispose();
 console.log('NPC_STYLE_SWAP_PASS');
}

// 3. playerBatch groups exactly as before: keyed and cloned by the view's base, one batch per style drawing only that range.
{
 const scene=new T.Scene(),batch=playerBatch(scene),rigs=[];
 for(let i=0;i<24;i++){const r=bean('bb'+i,i%2?'away':'home');const look=L.defaultBeanLookFor('bb'+i);r.setBeanLook({...look,headwear:i%3===0?'cap':i%3===1?'bucket':'none'},L.DEFAULT_CASUAL_OUTFIT);rigs.push(r);}
 const frame=t=>{batch.begin();rigs.forEach((r,i)=>{r.update(i*.9,0,1/30,t,false,{runIntensity:.6});batch.draw(r.root);});batch.end();};frame(0);frame(1/30);
 const groups=scene.children.filter(o=>o.isInstancedMesh&&o.visible),skins=rigs.map(B.beanSkinOf);
 const hairStyles=new Set(skins.map(s=>styleOf(s,s.meshes[2])).filter(s=>s>0)),hatStyles=new Set(skins.map(s=>styleOf(s,s.meshes[3])).filter(s=>s>0));
 assert.equal(groups.length,2+hairStyles.size+hatStyles.size,'body + limbs + one batch per hair/hat style in use (no split per view or rig)');
 for(const g of groups.filter(o=>/bean-(hair|hat)/.test(o.geometry.name))){const base=baseOf[g.geometry.name];assert.equal(g.geometry.index.count,base.index.count,'batch owns a clone of the base');
  const st=Math.round(base.getAttribute('beanAnchor').getW(base.index.getX(g.geometry.drawRange.start)));{const r=styleIndexRange(base,st);assert(r&&g.geometry.drawRange.start===r.start&&g.geometry.drawRange.count===r.count,'batch draws its style range');}
  assert.equal(g.count,skins.filter(s=>{const m=g.geometry.name==='bean-hair'?s.meshes[2]:s.meshes[3];return m.visible&&styleOf(s,m)===st;}).length,'every rig of that style, and only those');}
 // A style change mid-game rebinds to the other style's existing batch (no new batch).
 const before=scene.children.length;rigs[0].setBeanLook({...L.defaultBeanLookFor('bb0'),headwear:'bucket'},L.DEFAULT_CASUAL_OUTFIT);frame(2/30);assert.equal(scene.children.length,before);
 batch.dispose();rigs.forEach(r=>r.dispose());
 console.log('NPC_STYLE_BATCH_PASS',groups.length,'batches');
}

// 4. Picking (NPC taps) still tests the whole base geometry, so tap targets are unchanged.
{
 const r=bean('pick'),skin=B.beanSkinOf(r),hair=skin.meshes[2];r.setBeanLook({...L.DEFAULT_BEAN_LOOK,hair:{style:'crop',color:'#222'},headwear:'none'},L.DEFAULT_CASUAL_OUTFIT);r.root.updateMatrixWorld(true);
 const probe=new T.Mesh(geos.hair,new T.MeshBasicMaterial());probe.matrixWorld.copy(hair.matrixWorld);let rays=0,same=0,extra=0;
 const center=new T.Vector3().setFromMatrixPosition(hair.matrixWorld).add(new T.Vector3(0,.8,0));
 for(let a=0;a<24;a++)for(let y=-.4;y<=.4;y+=.1){const o=new T.Vector3(Math.sin(a/24*Math.PI*2)*3,y,Math.cos(a/24*Math.PI*2)*3).add(center),rc=new T.Raycaster(o,center.clone().sub(o).normalize());
  const got=[],want=[];hair.raycast(rc,got);probe.raycast(rc,want);rays++;if(got.length===want.length&&got.every((h,i)=>Math.abs(h.distance-want[i].distance)<1e-9))same++;
  const own=[];T.Mesh.prototype.raycast.call(hair,rc,own);if(own.length!==want.length)extra++;}
 assert.equal(same,rays,'hair picking identical to the whole base geometry');assert(extra>0,'(the view alone would pick differently, so the override matters)');
 assert.equal(hair.geometry.drawRange.count<geos.hair.index.count,true,'and the view is restored after picking');r.dispose();
 console.log('NPC_STYLE_PICK_PASS',rays,'rays');
}
console.log('PASS npc style batches: townsfolk hair/hat draw only their style range (colour + hat shadow), shared buffers, batches unchanged, picking unchanged');
