// Bake the vending glass-front product pictures once; no extra runtime renderers.
// - public/vending/products/ball-<style>.png: one picture per ball item (`ball:<style>`), taken from the vending face's own
//   StorePreview snapshots (components/StorePreviews.tsx), i.e. the real in-game ball: same sphere, skin
//   (lib/graphics/ballAppearance.ts + specialBallSkins.ts), material and lights. Cropped to the ball and its contact shadow so the atlas slot stays tiny.
//   Keyed by ball, not by machine, so every machine selling a ball shows the same picture. Re-run after changing a ball skin.
// - public/vending/products/pack.png: the mystery-pack card back.
// usage (dev server on :8092): node scripts/capture-vending-products.cjs [--pack | --pack-only]
//   The pack picture is taken at 2× once the card back has painted (Sep 29 2026: the old 41×57 capture was a blurry green tile
//   with stray label text).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const out=path.join(__dirname,'..','public/vending/products');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1280,height:800},deviceScaleFactor:2});const packOnly=process.argv.includes('--pack-only');await p.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');/* the face skips baked balls unless baking (StorePreviews.tsx) */window.__fi2BakeBallPictures=true;});await p.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092/');await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await p.waitForTimeout(4000);fs.mkdirSync(out,{recursive:true});
 await p.evaluate(id=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===id);f.location.x=e.front.x+e.dir.x*1.5;f.location.z=e.front.z+e.dir.z*1.5;f.rideRef.current='walk';f.flight.height=e.machine.y;},'plaza');await p.waitForTimeout(1800);
 await p.evaluate(()=>{const g=document.querySelector('[data-vending-go]');g.dataset.vending='plaza';g.click();});await p.waitForSelector('[data-vending-face]');await p.locator('[data-vending-item]').first().locator('img').waitFor();
 // The face renders every store item once (useStorePreviews, over idle time after the zoom); read that snapshot map from
 // VendingMachine's hook state once it is published.
 const balls=packOnly?{}:await p.evaluate(async()=>{
  const find=()=>{const el=document.querySelector('[data-vending-face]'),key=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));let fiber=el[key];
   for(;fiber;fiber=fiber.return)for(let h=fiber.memoizedState;h&&typeof h==='object'&&'next' in h;h=h.next){const s=h.memoizedState;if(s&&typeof s==='object'&&typeof s['ball:classic']==='string')return s;}return null;};
  let gear=find();for(let i=0;!gear&&i<100;i++){await new Promise(r=>setTimeout(r,200));gear=find();}
  if(!gear)throw new Error('store previews not found');
  const result={},src=document.createElement('canvas'),dst=document.createElement('canvas'),r=src.getContext('2d',{willReadFrequently:true}),d=dst.getContext('2d');
  for(const [id,url] of Object.entries(gear)){if(!id.startsWith('ball:'))continue;const img=new Image();img.src=url;await img.decode();
   src.width=img.width;src.height=img.height;r.clearRect(0,0,src.width,src.height);r.drawImage(img,0,0);const px=r.getImageData(0,0,src.width,src.height).data;
   // The ball itself is opaque; its soft contact shadow is not. Crop to the ball (2px margin) plus a strip below for the shadow:
   // width = diameter + 4, height = width + round(0.14 × diameter). lib/graphics/vendingMachines.ts relies on this framing.
   let l=src.width,t=src.height,rr=-1,bb=-1;for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++)if(px[(y*src.width+x)*4+3]>200){l=Math.min(l,x);rr=Math.max(rr,x);t=Math.min(t,y);bb=Math.max(bb,y);}
   const D=Math.max(rr-l,bb-t)+1,cx=(l+rr+1)/2,top=(t+bb+1)/2-D/2,w=D+4,h=w+Math.round(D*.14);dst.width=w;dst.height=h;d.clearRect(0,0,w,h);d.drawImage(src,cx-w/2,top-2,w,h,0,0,w,h);
   result[id]=dst.toDataURL('image/png');}
  return result;});
 for(const [id,url] of Object.entries(balls)){fs.writeFileSync(path.join(out,`ball-${id.slice(5)}.png`),Buffer.from(url.split(',')[1],'base64'));console.log(id);}
 if(process.argv.includes('--pack')||packOnly){const card=p.locator('[data-vending-item^="pack:"]').first().locator('[class*=packCard]');await card.waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);await card.screenshot({path:path.join(out,'pack.png'),omitBackground:true});console.log('pack');}
 await b.close();})().catch(e=>{console.error(e);process.exit(1)});
