// Kit Shop gear on the island (Oct 26 2026, owner decision): the worn jersey, boots and ball from the Kit Shop dress the island
// player and skin the walking ball (keep-ups, dribble). Checks lib/shop/islandGear.ts in Node and the wiring in Town / the shop.
// usage: node tests/island-gear-shop.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const G=require('../lib/shop/islandGear.ts'),S=require('../lib/shop/shopPurchases.ts');
const {DEFAULT_JERSEY}=require('../lib/shop/jersey.ts'),{DEFAULT_BALL}=require('../lib/shop/ball.ts');
const {panelAt}=require('../lib/shop/ballPanels.ts');
const {DEFAULT_HOME_KIT}=require('../lib/graphics/beanLook.ts');
const mem=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v))};};
const spend=async()=>({ok:true});
const base={...DEFAULT_HOME_KIT,kind:'kit',number:10};

(async()=>{
 // 1. Nothing worn: the island keeps its own kit and ball, with no new objects.
 {const store=mem();const g=G.readIslandGear(store);assert.equal(g,G.NO_GEAR);assert.equal(G.gearOutfit(base,g),base,'same outfit object when nothing is worn');
  assert.equal(G.readIslandGear({getItem:()=>{throw new Error('blocked');}}),G.NO_GEAR,'blocked storage = no gear');}

 // 2. Buy a jersey, boots and a ball: each becomes the worn one and shows on the island outfit.
 const store=mem();
 const jersey={...DEFAULT_JERSEY,primary:'#d62828',secondary:'#ffffff',accent:'#003049',number:7};
 const boots={...require('../lib/shop/boots.ts').validateBoots({}),};boots.colors={...boots.colors,mid:'#ff00aa'};
 const ball={...DEFAULT_BALL,layout:'classic32',colors:{a:'#112233',b:'#ffee00',c:'#00ff00'},pattern:{...DEFAULT_BALL.pattern,kind:'none'},art:{id:'',fills:[]}};
 for(const [kind,d] of [['jersey',jersey],['boots',boots],['ball',ball]]){const r=await S.buyDesign(kind,d,100,spend,{store});assert(r.ok,kind+' bought');}
 const g=G.readIslandGear(store);
 assert(g.jersey&&g.boots&&g.ball,'all three worn');assert(g.key.split('|').every(Boolean),'key names all three');
 const o=G.gearOutfit(base,g);
 assert.equal(o.shirt,'#d62828');assert.equal(o.shirt2,'#ffffff');assert.equal(o.shorts,'#003049');assert.equal(o.socks,'#d62828');assert.equal(o.socks2,'#003049');
 assert.equal(o.number,7,'shirt number from the jersey');assert.equal(o.boots,'#ff00aa','boots = the boot sides colour');assert.notEqual(o,base);assert.equal(base.shirt,DEFAULT_HOME_KIT.shirt,'base untouched');
 assert.equal(G.gearOutfit(base,{...g,jersey:{...g.jersey,number:null}}).number,null,'no number on the jersey = none on the player');
 // Team colours (lessons, knockout) keep your own boots.
 const team={...DEFAULT_HOME_KIT,shirt:'#000000'};assert.equal(G.teamOutfitWithBoots(team,g).boots,'#ff00aa');assert.equal(G.teamOutfitWithBoots(team,G.NO_GEAR),team);

 // 3. Wearing another design or taking one off changes the key; a broken design is re-validated, never thrown.
 {const owned=S.loadOwned(store);const next={...owned,wearing:{...owned.wearing}};delete next.wearing.boots;S.writeOwned(next,store);
  const g2=G.readIslandGear(store);assert.equal(g2.boots,null,'boots taken off');assert.notEqual(g2.key,g.key);assert.equal(G.gearOutfit(base,g2).boots,base.boots);
  const bad=G.gearFromOwned({v:1,items:[{id:'shop:jersey:x',kind:'jersey',name:'x',price:5,design:{primary:'red',number:'lots'},at:1}],wearing:{jersey:'shop:jersey:x'}});
  assert(/^#[0-9a-f]{6}$/i.test(bad.jersey.primary),'bad colour falls back to a safe hex');}

 // 4. The ball bake: panel colours, seams, filled panels and the pattern mask, on the SphereGeometry/painter chart.
 {const W=64,H=32,px=G.bakeBallPixels(ball,null,W,H);assert.equal(px.length,W*H*4);
  const at=(i,j)=>[px[(j*W+i)*4],px[(j*W+i)*4+1],px[(j*W+i)*4+2]];
  const dir=(i,j)=>{const ph=(i+.5)/W*Math.PI*2,th=(j+.5)/H*Math.PI,s=Math.sin(th);return [-Math.cos(ph)*s,Math.cos(th),Math.sin(ph)*s];};
  let a=0,b=0,seams=0;
  for(let j=1;j<H-1;j++)for(let i=0;i<W;i++){const c=at(i,j).join(),hit=panelAt('classic32',dir(i,j));
   if(c==='17,34,51'){a++;assert.equal(hit.grp,0);}else if(c==='255,238,0'){b++;assert.equal(hit.grp,1);}else seams++;}
  assert(a>50&&b>100&&seams>0&&seams<a+b,'both panel groups and thin seams show');
  const filled=G.bakeBallPixels({...ball,art:{id:'',fills:Array.from({length:32},()=>'#ff0000')}},null,W,H);
  assert(filled[(16*W+5)*4]>=140&&filled[(16*W+5)*4+1]===0,'filled panels cover the panel colour');
  const mask=new Uint8ClampedArray(W*H*4);for(let k=0;k<W*H;k++)mask[k*4]=255;
  const pat=G.bakeBallPixels({...ball,pattern:{kind:'stripes',c1:'#00ff00',c2:'#0000ff',on:'a',seed:1}},mask,W,H);
  let patA=0;for(let k=0;k<W*H;k++){const hit=panelAt('classic32',dir(k%W,Math.floor(k/W)));if(hit.grp===0&&pat[k*4+1]===255&&pat[k*4]===0)patA++;if(hit.grp===1)assert.notEqual(pat[k*4+1]===255&&pat[k*4]===0&&pat[k*4+2]===0,true,'pattern only on group A');}
  assert(patA>20,'pattern colour 1 painted where the mask is red');
  for(const f of ['gloss','matte','dimple','leather','holo','metal'])assert(G.FINISH_ROUGHNESS[f]>0&&G.FINISH_ROUGHNESS[f]<1);}

 // 5. Wiring: Town applies the gear only when it changes (inside the customization guard), the ball skin is cached and disposed,
 //    the shop offers Wear / Take off and signals the same tab; the island still reads the owned key only through lib/shop.
 {const town=read('components/Town.tsx'),skin=read('lib/graphics/shopBallSkin.ts'),room=read('components/shop/ShopRoom.tsx'),buy=read('lib/shop/shopPurchases.ts');
  assert(/const customizationChanged=appliedCustomization!==customizationRef\.current\|\|appliedGear!==gearRef\.current;\s*if\(customizationChanged\)\{[^\n]*gearOutfit\(playerOutfit\(appliedCustomization\),appliedGear\)/.test(town),'player dressed from the gear when it changes');
  assert(/shopBallSkin\.setDesign\(appliedGear\.ball\)/.test(town)&&/ballAppearance\.invalidate\(\)/.test(town)&&/patch\.visible=!shopBall/.test(town),'shop ball replaces the vending skin and hides the classic patches');
  assert(/shopBallSkin\.dispose\(\)/.test(town),'ball skin disposed with the island');
  assert(/addEventListener\('storage',onStorage\)/.test(town)&&/addEventListener\(SHOP_GEAR_EVENT,read\)/.test(town)&&/removeEventListener\(SHOP_GEAR_EVENT,read\)/.test(town),'live updates, listeners removed');
  assert(/teamOutfitWithBoots\(d\.outfit,g\)/.test(town),'team kit keeps your boots');
  assert(/cache\.get\(key\)/.test(skin)&&/tex\.dispose\(\)/.test(skin)&&/dispose\(\)\{disposed=true;for\(const tex of cache\.values\(\)\)tex\.dispose\(\)/.test(skin),'ball textures cached (2) and disposed');
  assert(!/requestAnimationFrame|setInterval/.test(skin),'no loops in the ball skin');
  assert(/onTakeOff=\{takeOff\}/.test(room)&&/>Take off</.test(room)&&/>Wear this</.test(room),'My kit: wear / take off');
  assert(/dispatchEvent\(new Event\(SHOP_GEAR_EVENT\)\)/.test(buy),'writeOwned signals the same tab');
  assert(!/shopPurchases|fi2-shop-owned-v1|SHOP_OWNED_KEY/.test(town),'Town reads the owned key only through lib/shop/islandGear.ts');}

 console.log('island-gear-shop: ok');
})().catch(e=>{console.error(e);process.exit(1);});
