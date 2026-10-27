// Strikers upright: the coach pill never covers either goal mouth or box (QA 4, Oct 26 2026). It used to float above the right-hand
// buttons, over the right half of the box above Gold's goal, until it faded. This projects both boxes (and goal frames) with the
// scene's own portrait camera maths (strikerScene.ts fit() + follow cam pan limits, arcadeStage.ts fov) at every pan and zoom step,
// and checks the pill's rect from LiveArcadeMatch.module.css stays clear of them on several portrait screens.
// Run: node tests/strikers-portrait-tip.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),T=require('three');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=read('components/LiveArcadeMatch.module.css'),scene=read('lib/arcade/strikerScene.ts'),stageSrc=read('lib/arcade/arcadeStage.ts');
// The scene numbers this model copies; if one changes, re-check the pill's band.
assert.match(stageSrc,/new T\.PerspectiveCamera\(38,1,/,'fov 38');
assert.match(scene,/const PORTRAIT_LIFT=\.1;/);
assert.match(scene,/FOLLOW_ZOOM_PORTRAIT=stage\.mobile\?1\.5:/);
assert.ok(scene.includes('const limX=27*(1-1/followZoom)+.6,limZ=14*(1-1/followZoom)+.4'),'pan limits');
assert.ok(scene.includes('const panX=wide?limX*LANDSCAPE_PAN:limX;')&&scene.includes('Math.max(-panX-(portrait?2:0),Math.min(panX+(portrait?4:0),'),'portrait pan overshoot (portrait is never `wide`)');
assert.ok(scene.includes('camera.position.set(portrait?-d*.52:0,d,portrait?0:d*.78)'),'portrait camera angle');
assert.ok(scene.includes('(stage.mobile?[-14.6,14.6]:[-18,18])')&&scene.includes('Math.abs(corner.x)>(wide?LANDSCAPE_X:.94)||Math.abs(corner.y)>.91'),'fit bounds');
assert.ok(scene.includes('for(const z of [-5,5])stage.box(side*21,.04,z,8,')&&scene.includes('stage.box(side*17,.04,0,.09,.025,10,'),'box lines x 17..25, z -5..5');
// The pill rule (last portrait block): right-aligned, vertically centred at a share of the root height plus a header share.
const blocks=[...css.matchAll(/@media\(pointer:coarse\) and \(orientation:portrait\) and \(max-width:500px\)\{([\s\S]*?)\n\}/g)].map(m=>m[1]);
const last=blocks[blocks.length-1],i=last.lastIndexOf('.root .footer>p{'),pill=last.slice(i,last.indexOf('}',i));
const top=pill.match(/top:calc\(([\d.]+)% \+ (\d+)px/);assert.ok(top,'pill top is calc(% + px)');assert.match(pill,/bottom:auto;transform:translateY\(-50%\)/);
assert.match(pill,/max-height:4em;overflow:hidden/,'three lines at most');assert.match(pill,/font-size:11px/);
const share=Number(top[1])/100,offset=Number(top[2]),HEADER=70,LINES=3,PILL_H=Math.ceil(11*1.3*LINES+10);
function boxes(W,V){
 const w=W,h=V-HEADER,cam=new T.PerspectiveCamera(38,w/h,.1,180);cam.setViewOffset(w,h,0,h*.1,w,h);cam.updateProjectionMatrix();
 const c=new T.Vector3();let low=10,high=200;
 for(let k=0;k<24;k++){const d=(low+high)/2;cam.position.set(-d*.52,d,0);cam.lookAt(0,0,0);cam.updateMatrixWorld();let fits=true;for(const x of [-27,27])for(const z of [-14.6,14.6]){c.set(x,0,z).project(cam);if(Math.abs(c.x)>.94||Math.abs(c.y)>.91)fits=false;}if(fits)high=d;else low=d;}
 const home=new T.Vector3(-high*.52,high,0),FZ=1.5,limX=27*(1-1/FZ)+.6,limZ=14*(1-1/FZ)+.4,rects=[];
 const pts=side=>[17,25].flatMap(x=>[-5,5].flatMap(z=>[0,2.5].map(y=>new T.Vector3(side*x,y,z))));
 for(let lead=0;lead<=1.0001;lead+=.05)for(let px=-limX-2;px<=limX+4+1e-6;px+=.25)for(const pz of [-limZ,-limZ/2,0,limZ/2,limZ]){
  cam.position.copy(home);cam.position.x+=px*lead;cam.position.z+=pz*lead;cam.lookAt(px*lead,0,pz*lead);cam.zoom=1+(FZ-1)*lead;cam.updateProjectionMatrix();cam.updateMatrixWorld();
  for(const side of [-1,1]){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of pts(side)){c.copy(p).project(cam);const sx=(c.x+1)/2*w,sy=HEADER+(1-c.y)/2*h;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}rects.push({side,x0,x1,y0,y1});}
 }
 return rects;
}
for(const [W,V] of [[360,740],[375,667],[390,844],[430,932],[600,960],[820,1180]]){
 const centre=share*V+offset,pTop=centre-PILL_H/2,pBottom=centre+PILL_H/2,pRight=W-8,pLeft=pRight-Math.min(220,W-170);
 const hits=boxes(W,V).filter(r=>r.x1>pLeft&&r.x0<pRight&&r.y1>pTop&&r.y0<pBottom);
 assert.equal(hits.length,0,`${W}x${V}: the pill (${pLeft|0}-${pRight}, ${pTop|0}-${pBottom|0}) clears both boxes; first hit ${JSON.stringify(hits[0])}`);
 assert.ok(pBottom<V-30-170,`${W}x${V}: the pill stays above the thumb buttons`);
}
console.log('strikers-portrait-tip ok: the coach pill clears both boxes and goal mouths at every follow-cam pan');
