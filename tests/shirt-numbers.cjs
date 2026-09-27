const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.endsWith('.json')?require(path.resolve(path.dirname(file),n)):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {DIGIT_GLYPHS,DIGIT_HEIGHT}=load('lib/graphics/shirtDigits.ts');
const S=load('lib/graphics/shirtNumbers.ts'),dec=c=>{const d=S.decodeShirtNumber(c);return {number:d.number,ink:d.ink};};
const {createPlayer}=load('lib/graphics/player.ts'),{playerBatch}=load('lib/graphics/playerBatch.ts'),{acquireSpineSurfaces,applySpineSurface}=load('lib/graphics/spineSurface.ts');
const {DEFAULT_CUSTOMIZATION:D}=load('lib/town/customization.ts');

// ---- Glyph data: ten Barlow Condensed Bold figures, nonzero fill, counters really open.
function contours(d){
 const tokens=d.match(/[MLHVQZ]|-?\d*\.?\d+/g),out=[];let cur=null,x=0,y=0,cmd='',i=0;
 const num=()=>parseFloat(tokens[i++]);
 while(i<tokens.length){
  if(/[MLHVQZ]/.test(tokens[i]))cmd=tokens[i++];
  if(cmd==='M'){x=num();y=num();cur=[[x,y]];out.push(cur);cmd='L';}
  else if(cmd==='L'){x=num();y=num();cur.push([x,y]);}
  else if(cmd==='H'){x=num();cur.push([x,y]);}
  else if(cmd==='V'){y=num();cur.push([x,y]);}
  else if(cmd==='Q'){const cx=num(),cy=num(),ex=num(),ey=num();for(let k=1;k<=6;k++){const t=k/6,a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;cur.push([a*x+b*cx+c*ex,a*y+b*cy+c*ey]);}x=ex;y=ey;}
  else if(cmd==='Z'){cmd='';}
  else throw new Error('unexpected path token '+tokens[i]);
 }
 return out;
}
const area=c=>{let s=0;for(let i=0;i<c.length;i++){const [x0,y0]=c[i],[x1,y1]=c[(i+1)%c.length];s+=x0*y1-x1*y0;}return s/2;};
function winding(cs,px,py){let w=0;for(const c of cs)for(let i=0;i<c.length;i++){const [x0,y0]=c[i],[x1,y1]=c[(i+1)%c.length];if(y0<=py){if(y1>py&&(x1-x0)*(py-y0)-(px-x0)*(y1-y0)>0)w++;}else if(y1<=py&&(x1-x0)*(py-y0)-(px-x0)*(y1-y0)<0)w--;}return w;}
{
 assert.equal(DIGIT_GLYPHS.length,10);assert.equal(DIGIT_HEIGHT,700);
 const holes={0:1,6:1,8:2,9:1};
 DIGIT_GLYPHS.forEach((g,d)=>{
  const cs=contours(g.path);assert.equal(cs.length,g.contours,`digit ${d} contour count`);
  assert.equal(cs.length-1,holes[d]??0,`digit ${d} counters`);
  const outer=cs.reduce((a,b)=>Math.abs(area(b))>Math.abs(area(a))?b:a),sign=Math.sign(area(outer));
  for(const c of cs)if(c!==outer)assert.equal(Math.sign(area(c)),-sign,`digit ${d}: counter winds against the outline (nonzero leaves it open)`);
  assert(g.xMin>=0&&g.xMax<=g.advance+2&&g.yMin>-20&&g.yMax<720,`digit ${d} bounds`);
  assert(g.yMax-g.yMin>=690,`digit ${d} is full figure height`);
 });
 // Counter centres are empty under the nonzero rule; the strokes beside them are ink.
 const probe=(d,x,y)=>winding(contours(DIGIT_GLYPHS[d].path),x,y)!==0;
 assert(!probe(0,226,350)&&probe(0,60,350),'0: open counter, solid sides');
 assert(!probe(8,220,190)&&!probe(8,220,540)&&probe(8,220,352),'8: two open bowls, solid waist');
 assert(!probe(6,225,560)&&!probe(9,215,150),'6 and 9 bowls are open');
 assert(DIGIT_GLYPHS[1].xMax-DIGIT_GLYPHS[1].xMin<DIGIT_GLYPHS[0].xMax-DIGIT_GLYPHS[0].xMin,'proportional figures: the 1 is narrow');
 console.log('SHIRT_GLYPHS_PASS');
}

// ---- Atlas: one texture of ten cells; every glyph plus keyline fits inside its own cell.
{
 assert(S.ATLAS_W<=1024&&S.ATLAS_H<=256,`atlas ${S.ATLAS_W}x${S.ATLAS_H} stays small`);
 for(let d=0;d<10;d++){
  const g=DIGIT_GLYPHS[d],cell=S.atlasCell(d),a=S.atlasUv(d,g.xMin-S.SHIRT_OUTLINE,g.yMin-S.SHIRT_OUTLINE),b=S.atlasUv(d,g.xMax+S.SHIRT_OUTLINE,g.yMax+S.SHIRT_OUTLINE);
  const margin=2/S.ATLAS_W;
  assert(a.u>=cell.u0+margin&&b.u<=cell.u1-margin,`digit ${d} ink+outline inside its cell horizontally`);
  assert(a.v>=cell.v0+2/S.ATLAS_H&&b.v<=cell.v1-2/S.ATLAS_H,`digit ${d} inside vertically`);
  if(d)assert.equal(cell.u0,S.atlasCell(d-1).u1,'cells tile without overlap');
 }
 assert.equal(S.atlasCell(9).u1,1);
 const px=(S.atlasUv(0,0,700).v-S.atlasUv(0,0,0).v)*S.ATLAS_H;assert(px>=96&&px<=128,`digit is ${px.toFixed(0)}px tall in the atlas`);
 assert.equal(S.shirtDigitAtlas(),S.shirtDigitAtlas(),'one shared atlas');
 console.log('SHIRT_ATLAS_PASS',S.ATLAS_W+'x'+S.ATLAS_H);
}

// ---- Ink contrast rule (flicco): sRGB luminance > .62 → #23232a, else white.
{
 const lum=h=>{const c=new T.Color(h).getRGB({r:0,g:0,b:0},T.SRGBColorSpace);return .2126*c.r+.7152*c.g+.0722*c.b;};
 for(const [hex,ink] of [['#edb957','#23232a'],['#356478','#ffffff'],['#c8734f','#ffffff'],['#ffffff','#23232a'],['#000000','#ffffff'],['#e53935','#ffffff'],['#fff4cd','#23232a']]){
  assert.equal(S.shirtInk(hex),ink,hex);assert.equal(lum(hex)>.62,ink==='#23232a');
 }
 // Code colours round-trip exactly (instance colour slots are Float32).
 for(let n=1;n<=99;n++)for(const ink of ['#ffffff','#23232a']){const c=S.encodeShirtNumber(n,ink);const f=new T.Color(Math.fround(c.r),Math.fround(c.g),Math.fround(c.b));assert.deepEqual(dec(f),{number:n,ink});}
 console.log('SHIRT_INK_PASS');
}

// ---- Layout: two digits at ×0.9, tight tracking, centred, tens on the viewer's left.
{
 const one=S.shirtNumberLayout(7),two=S.shirtNumberLayout(10);
 assert.equal(one.height,S.SHIRT_DIGIT_HEIGHT);assert(Math.abs(two.height/one.height-.9)<1e-12,'two digits are 0.9x');
 assert.deepEqual([...two.digits],[1,0]);assert(two.boxes[0].x1<two.boxes[1].x0,'tens left of ones, from behind');
 const unit=two.height/DIGIT_HEIGHT,gap=two.boxes[1].x0-two.boxes[0].x1;
 assert(Math.abs(gap-S.SHIRT_TRACKING*unit)<1e-12&&gap<.1*two.height,'tight tracking: gap is under a tenth of the digit height');
 for(const n of [1,7,10,11,23,88,99]){const l=S.shirtNumberLayout(n);assert(Math.abs(l.boxes[0].x0+l.boxes.at(-1).x1)<1e-12,`${n} centred`);assert(Math.abs((l.boxes[0].y0+l.boxes[0].y1)/2-S.SHIRT_NUMBER_Y)<1e-12);}
 const wide=S.shirtNumberLayout(88),widest=wide.width;
 // Even on the slimmest torso (x scale .88 body × .9 build, compensated in the shader) the widest number stays on the panel.
 for(const female of [false,true]){const p=S.shirtNumberPanel(female).getAttribute('position'),half=new Map();let cols=1;while(Math.abs(p.getY(cols)-p.getY(0))<.003)cols++;for(let r=0;r*cols<p.count;r++){let y=0,h=0;for(let c=0;c<cols;c++){y+=p.getY(r*cols+c)/cols;h=Math.max(h,Math.abs(p.getX(r*cols+c)));}half.set(+y.toFixed(3),h);}
  for(const [y,h] of half)if(y>=wide.boxes[0].y0-.01&&y<=wide.boxes[0].y1+.01)assert(widest/2/(.88*.9)+.012<h,`88 fits the panel at y=${y} (female=${female})`);}
 console.log('SHIRT_LAYOUT_PASS',`88 is ${(widest*100).toFixed(1)}cm wide`);
}

// ---- Classic numbers by slot (7v7 / 9v9 / 11v11 subsets), same for both teams.
{
 const slots={'11v11':['gk','lb','lcb','rcb','rb','lcm','cm','rcm','lw','st','rw'],'9v9':['gk','lcb','cb','rcb','lcm','rcm','lw','st','rw'],'7v7':['gk','lcb','rcb','lm','cm','rm','st'],futsal:['gk','cb','lm','rm','st']};
 for(const [format,ids] of Object.entries(slots)){
  const nums=ids.map(id=>S.classicShirtNumber(format,id));
  assert(nums.every(n=>Number.isInteger(n)&&n>=1&&n<=11),`${format} all numbered`);assert.equal(new Set(nums).size,ids.length,`${format} unique`);
  assert.deepEqual([...ids.map(id=>S.classicShirtNumber(format,'d'+id))],nums,`${format} away mirrors home`);
  assert.equal(S.classicShirtNumber(format,'gk'),1);assert.equal(S.classicShirtNumber(format,'st'),9);
 }
 assert.deepEqual([...['rb','lb','rcb','lcb','cm','rcm','lcm','rw','lw'].map(id=>S.classicShirtNumber('11v11',id))],[2,3,4,5,6,8,10,7,11]);
 assert.equal(S.classicShirtNumber('11v11','nobody'),null);assert.equal(S.DEFAULT_PLAYER_NUMBER,10);
 console.log('SHIRT_CLASSIC_PASS');
}

// ---- Panel geometry: on the jersey's facets + a few mm, bends with the jersey's morphs.
{
 const spine=acquireSpineSurfaces();
 for(const female of [false,true]){
  const jersey=female?spine.female:spine.male,panel=S.shirtNumberPanel(female);
  assert.equal(panel,S.shirtNumberPanel(female),'panel shared per body shape');
  assert.equal(panel.morphAttributes.position.length,jersey.morphAttributes.position.length,'same spine morph set');
  const jp=jersey.getAttribute('position'),pp=panel.getAttribute('position');
  const morphed=(g,i,w,out)=>{out.fromBufferAttribute(g.getAttribute('position'),i);g.morphAttributes.position.forEach((m,k)=>{out.x+=w[k]*m.getX(i);out.y+=w[k]*m.getY(i);out.z+=w[k]*m.getZ(i);});return out;};
  const poses=[new Array(12).fill(0),[1,0,0,0,0,0,1,0,0,0,0,0],[0,0,1,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,1],[0,1,0,1,0,0,0,1,0,1,.5,0]];
  let matched=0;const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),d=new T.Vector3();
  for(let i=0;i<pp.count;i++){
   c.fromBufferAttribute(pp,i);
   for(let j=0;j<jp.count;j++){d.fromBufferAttribute(jp,j);if(Math.abs(d.y-c.y)>.0025||d.z>0||Math.abs(Math.atan2(d.x,-d.z/.64)-Math.atan2(c.x,-c.z/.64))>.02)continue;
    for(const w of poses){morphed(jersey,j,w,a);morphed(panel,i,w,b);const lift=b.distanceTo(a);assert(lift>.002&&lift<.008,`panel lifts ${lift.toFixed(4)}m off the jersey (female=${female})`);const ang=Math.atan2(d.x,d.z/.64),n=new T.Vector3(Math.sin(ang)*.64,0,Math.cos(ang)).normalize();assert(b.clone().sub(a).dot(n)>.0015,'panel stays outside the back');}
    matched++;break;}
  }
  assert(matched>=30,`checked ${matched} panel vertices against jersey vertices`);
 }
 spine.dispose();
 console.log('SHIRT_PANEL_PASS');
}

// ---- Rig: attached to the jersey, reads unmirrored from behind, batches into one draw.
const attach=rig=>{
 if(rig.setShirtNumber)return rig.setShirtNumber;
 const jersey=rig.root.getObjectByName('player-jersey');const n=S.createShirtNumber(jersey,jersey.material);return v=>n.set(v);
};
{
 const rig=createPlayer('num-probe','home',false);const set=attach(rig);set(23);
 rig.update(0,0,1/60,0,false,{facing:.7});rig.root.updateMatrixWorld(true);
 const mesh=rig.root.getObjectByName('player-shirt-number'),jersey=rig.root.getObjectByName('player-jersey');
 assert(mesh&&mesh.visible&&mesh.parent===jersey,'number panel is a visible child of the jersey');
 assert.equal(mesh.morphTargetInfluences,jersey.morphTargetInfluences,'shares the jersey morph weights (bends/twists with it)');
 assert.equal(mesh.castShadow,false);assert.equal(mesh.userData.batchShadow,false);
 assert.deepEqual(dec(mesh.material.color),{number:23,ink:'#23232a'},'gold shirt → dark ink');
 // Camera 3 m behind the torso, looking along the player's facing.
 const torso=rig.root.getObjectByName('armor-torso'),centre=torso.localToWorld(new T.Vector3(0,.29,0)),forward=torso.localToWorld(new T.Vector3(0,.29,1)).sub(centre).normalize();
 const cam=new T.PerspectiveCamera(40,1,.1,50);cam.position.copy(centre).addScaledVector(forward,-3);cam.lookAt(centre);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 const g=mesh.geometry,pos=g.getAttribute('position'),uv=g.getAttribute('uv'),idx=g.getIndex(),screen=[];
 for(let i=0;i<pos.count;i++)screen.push(new T.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld).project(cam));
 let agree=0,pairs=0;for(let i=0;i<pos.count;i++)for(let j=i+1;j<pos.count;j+=7){const du=uv.getX(j)-uv.getX(i);if(Math.abs(du)<.01)continue;pairs++;if(Math.sign(du)===Math.sign(screen[j].x-screen[i].x))agree++;}
 assert.equal(agree,pairs,'panel x (viewer-right in the layout) runs left→right on screen from behind: not mirrored');
 let front=0;const bad=[];for(let t=0;t<idx.count;t+=3){const [p,q,r]=[0,1,2].map(k=>screen[idx.getX(t+k)]);const ar=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);if(ar>0)front++;else bad.push([idx.getX(t),ar.toExponential(1)]);}
 assert.equal(front,idx.count/3,'every panel triangle faces a camera behind the player');
 // From the front the panel is back-facing (and hidden by the torso): never a mirrored number.
 set(null);assert.equal(mesh.visible,false,'null hides the number');set(0);assert.equal(mesh.visible,false,'0 is not a shirt number');
 set(7);rig.setAppearance?.({...D,clothing:'coast'});
 if(rig.setShirtNumber)assert.deepEqual(dec(mesh.material.color),{number:7,ink:'#ffffff'},'appearance change re-inks (coast blue → white)');
 if(rig.setShirtNumber){rig.setAppearance({...D,character:'female'});assert.equal(mesh.geometry,S.shirtNumberPanel(true),'female jersey gets the female panel');}
 rig.dispose();
 console.log('SHIRT_RIG_PASS',rig.setShirtNumber?'(player.ts hook)':'(module attached manually)');
}
{
 const scene=new T.Scene(),batch=playerBatch(scene),rigs=[],setters=[];
 for(let i=0;i<22;i++){const rig=createPlayer('p'+i,i<11?'home':'away',false),set=attach(rig);set(i%11+1);rig.update(i,0,1/60,0,false,{});rigs.push(rig);setters.push(set);}
 const plain=createPlayer('unnumbered','home',false);plain.update(30,0,1/60,0,false,{});
 batch.begin();for(const r of [...rigs,plain])batch.draw(r.root);batch.end();
 const numberBatches=scene.children.filter(o=>o.isInstancedMesh&&o.material.isShirtNumberMaterial);
 assert.equal(numberBatches.length,1,'all back numbers share one instanced draw');
 const nb=numberBatches[0];assert.equal(nb.count,22,'22 numbers, the unnumbered rig adds none');assert.equal(nb.castShadow,false,'numbers do not cast shadows');
 assert.equal(nb.material.map,S.shirtDigitAtlas(),'batched clone keeps the shared atlas');assert.equal(typeof nb.material.onBeforeCompile,'function');assert.equal(nb.material.customProgramCacheKey(),'shirt-number-v1','clone keeps the number shader');
 const seen=[];for(let i=0;i<nb.count;i++){const c=new T.Color();nb.getColorAt(i,c);seen.push(S.decodeShirtNumber(c));}
 assert.deepEqual([...seen.map(s=>s.number)].sort((a,b)=>a-b),[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11]);
 assert.equal(seen.filter(s=>s.ink==='#ffffff').length,11,'blue team white ink, gold team dark ink');
 // Only one atlas texture, whatever numbers are used (no per-number canvases or textures).
 const maps=new Set();scene.traverse(o=>{if(o.material?.map)maps.add(o.material.map);});for(const r of rigs)r.root.traverse(o=>{if(o.material?.map)maps.add(o.material.map);});
 assert.equal(maps.size,1,'one texture for every number');
 // Existing batching unchanged: shadows still on for body parts.
 assert(scene.children.filter(o=>o.isInstancedMesh&&!o.material.isShirtNumberMaterial).every(o=>o.castShadow),'body batches still cast shadows');
 const before=scene.children.filter(o=>o.isInstancedMesh).length;
 for(const set of setters)set(null);batch.begin();for(const r of rigs)batch.draw(r.root);batch.end();
 assert.equal(nb.visible,false,'no numbers → the number batch is not drawn');assert.equal(scene.children.filter(o=>o.isInstancedMesh).length,before);
 // Two updates before one render: the first update's changed colour slots must still be uploaded.
 for(const set of setters)set(5);batch.begin();for(const r of rigs)batch.draw(r.root);batch.end();nb.instanceColor.clearUpdateRanges();// "rendered"
 setters[0](9);batch.begin();for(const r of rigs)batch.draw(r.root);batch.end();
 setters[21](8);batch.begin();for(const r of rigs)batch.draw(r.root);batch.end();
 const covered=slot=>nb.instanceColor.updateRanges.some(r=>r.start<=slot*3&&r.start+r.count>=slot*3+3);
 assert(covered(0)&&covered(21),'pending colour ranges survive a second update before the render');
 batch.dispose();for(const r of [...rigs,plain])r.dispose();
 console.log('SHIRT_BATCH_PASS');
}
// Material/shader text: the GLSL layout constants come from the same tables as shirtNumberLayout.
{
 const m=new S.ShirtNumberMaterial(),shader={uniforms:{},vertexShader:'#include <common>\n#include <project_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>\n#include <color_fragment>'};
 m.onBeforeCompile(shader);
 assert(shader.fragmentShader.includes('textureGrad')&&!shader.fragmentShader.includes('#include <color_fragment>'),'custom map sampling replaces the colour multiply');
 assert(/#ifdef USE_COLOR\s+shirtCode=vColor/.test(shader.fragmentShader),'instanced code arrives as vColor (three defines USE_COLOR, not USE_INSTANCING_COLOR, in fragments)');
 for(const g of DIGIT_GLYPHS)assert(shader.fragmentShader.includes(`vec2(${g.xMin.toFixed(1)},${(g.xMax-g.xMin).toFixed(1)})`),'glyph table in shader');
 assert(shader.vertexShader.includes('gl_Position=vec4(0.,0.,2.,1.)'),'LOD collapses tiny numbers in the vertex shader');
 assert.equal(shader.uniforms.uShirtViewport.value>0,true);
 assert.equal(m.clone().customProgramCacheKey(),'shirt-number-v1');m.dispose();
 console.log('SHIRT_SHADER_PASS');
}
