// Needs `npm run dev` on :8092 (QA11): it relies on the /splash-lab page, which production builds switch off. Fails fast otherwise (scripts/requireDevServer.cjs).
const {requireDevServer}=require('./requireDevServer.cjs');
// Bakes the loading-screen cast (public/splash/*.webp) from the REAL bean rig: opens the dev page /splash-lab on the
// running dev server (:8092), poses each character with the preview move driver, renders one transparent still per
// character (cropped), then encodes two WebP sizes with cwebp (brew install webp).
//
//   node scripts/render-splash-characters.cjs            all characters
//   node scripts/render-splash-characters.cjs hero-kick  one character (by id)
//   SPLASH_PNG=1 …                                        also keep the raw PNGs in test-results/splash/ for review
//   node scripts/render-splash-characters.cjs --encode   no browser: re-encode public/splash/*.avif from those raw PNGs
//
// The main splash also gets AVIF twins (avifenc, brew install libavif): q50 / alpha q75 measured ~27 % smaller than the
// WebP with a HIGHER SSIM against the raw render for all five stills (Oct 1 2026, docs/performance-guide.md). The
// component serves them through <picture> and preloads only the ones the layout shows; WebP stays as the fallback.
//
// Heights on the loading screen come from IslandLoading.module.css; keep each image's aspect when re-rendering (the
// component's width/height attributes are read from public/splash/cast.json, written here).
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('@playwright/test'));}
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const arcade=process.argv.includes('--arcade'),encodeOnly=process.argv.includes('--encode');
const OUT=path.join(__dirname,'..','public',arcade?'arcade-loading':'splash'),RAW=path.join(__dirname,'..','test-results','splash');

/** The cast. `at` = seconds into the preview move; `yaw` turns the stage; `azimuth` swings the camera. */
const CAST=[
 // Main male character (builder preset: coral body, caramel face) in the home kit, mid-volley with the ball.
 {id:'hero-kick',spec:{custom:{character:'male',eyes:'happy',mouth:'grin'},number:10,move:'volley',at:1.18,yaw:.9,expression:'happy'}},
 // Main female character (sky body, honey face, ponytail) in the home kit, jumping for joy.
 {id:'hero-cheer',spec:{custom:{character:'female',eyes:'happy',mouth:'grin'},number:9,move:'celebrate',at:.35,yaw:-.35,ball:false}},
 // Keeper diving to save.
 {id:'keeper',spec:{match:{key:'splash-gk',side:'home',keeper:true,number:1,look:{skin:'#5c3a28',eyes:'ovals',mouth:'o',hair:{style:'curls',color:'#1a1210'},headwear:'keeper',headwearColor:'#3d8f5a',headwearColor2:'#e8f04a',build:'wide'}},move:'keeperDive',at:1.1,yaw:1.0,expression:'determined'}},
 // Club costume: the Barcelona cat, airplane celebration.
 {id:'cat',spec:{custom:{character:'male',costume:'barcelona',skinTone:'peach',eyes:'happy',mouth:'grin',build:'short'},number:7,move:'airplane',at:1.1,yaw:-.5,ball:false}},
 // Other team (Harbour Teal), rainbow flick.
 {id:'rival',spec:{match:{key:'splash-away',side:'away',number:11,look:{skin:'#fde6d2',eyes:'ticks',mouth:'smirk',hair:{style:'long',color:'#b04a2a'},build:'tall'}},move:'rainbow',at:1.0,yaw:-.6,expression:'happy'}},
];

/** AVIF twins of the two WebP sizes (main splash only), from the lossless render. */
function encodeAvif(png,id,h2){
 const tmp=path.join(OUT,id+'.sm.tmp.png');
 execFileSync('avifenc',['-q','50','--qalpha','75','-s','3','-j','4',png,path.join(OUT,id+'.avif')],{stdio:'ignore'});
 // Half size: same Lanczos-style downscale cwebp does, via sips (macOS) to a temp PNG.
 execFileSync('sips',['--resampleHeight',String(h2),png,'--out',tmp],{stdio:'ignore'});
 execFileSync('avifenc',['-q','50','--qalpha','75','-s','3','-j','4',tmp,path.join(OUT,id+'-sm.avif')],{stdio:'ignore'});fs.unlinkSync(tmp);
}
if(encodeOnly){
 const manifest=JSON.parse(fs.readFileSync(path.join(OUT,'cast.json'),'utf8'));
 for(const c of CAST){const png=path.join(RAW,c.id+'.png');if(!fs.existsSync(png))throw new Error(`missing ${png}: render with SPLASH_PNG=1 first`);
  encodeAvif(png,c.id,manifest[c.id].sm[1]);const kb=f=>(fs.statSync(path.join(OUT,f)).size/1024).toFixed(1);
  console.log(`${c.id}: avif ${kb(c.id+'.avif')} KB / sm ${kb(c.id+'-sm.avif')} KB (webp ${kb(c.id+'.webp')} / ${kb(c.id+'-sm.webp')})`);}
 process.exit(0);
}

(async()=>{await requireDevServer(BASE);
 if(arcade){const poses=[['thankPasser',1.45,.35],['walk',.75,-.5],['celebrate',.4,.3],['thankPasser',1.45,-.4],['airplane',1.1,-.7]];CAST.forEach((c,i)=>Object.assign(c.spec,{move:poses[i][0],at:poses[i][1],yaw:poses[i][2],ball:false,outfit:{shirt:['#ff45b5','#4fe5f2','#ad7dff','#4fe5f2','#ff62c6'][i],shirt2:'#e7fcff',shorts:'#191329',socks:['#4fe5f2','#ff45b5','#60e9f2','#ff62c6','#ad7dff'][i],socks2:'#191329',boots:'#191329'}}));CAST[3].spec.custom={character:'female',costume:'none',bodyColor:'lilac',eyes:'happy',mouth:'grin',hair:'puffs'};}
 const only=arcade?null:process.argv[2];fs.mkdirSync(OUT,{recursive:true});if(process.env.SPLASH_PNG)fs.mkdirSync(RAW,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const manifestPath=path.join(OUT,'cast.json');const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{};
 try{
  const page=await browser.newPage({viewport:{width:800,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'/splash-lab',{timeout:240000});await page.waitForFunction(()=>window.__fiSplash,null,{timeout:180000});
  for(const c of CAST){
   if(only&&c.id!==only)continue;
   const r=await page.evaluate(spec=>window.__fiSplash.render(spec),c.spec);
   const png=path.join(OUT,c.id+'.tmp.png');fs.writeFileSync(png,Buffer.from(r.url.split(',')[1],'base64'));
   if(process.env.SPLASH_PNG)fs.copyFileSync(png,path.join(RAW,c.id+'.png'));
   // Two sizes: the full crop (2x on large screens) and a half-size (2x on phones). Height drives the resize.
   const h2=Math.round(r.height*.5);
   execFileSync('cwebp',['-quiet','-q','80','-alpha_q','85','-m','6','-sharp_yuv',png,'-o',path.join(OUT,c.id+'.webp')]);
   execFileSync('cwebp',['-quiet','-q','78','-alpha_q','85','-m','6','-sharp_yuv','-resize','0',String(h2),png,'-o',path.join(OUT,c.id+'-sm.webp')]);
   if(!arcade)encodeAvif(png,c.id,h2);
   fs.unlinkSync(png);
   manifest[c.id]={width:r.width,height:r.height,sm:[Math.round(r.width*h2/r.height),h2]};
   const kb=f=>(fs.statSync(path.join(OUT,f)).size/1024).toFixed(1);
   console.log(`${c.id}: ${r.width}x${r.height}  ${kb(c.id+'.webp')} KB / sm ${kb(c.id+'-sm.webp')} KB`);
  }
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,1)+'\n');
  if(arcade){const inline={};for(const c of CAST){const tmp=path.join(OUT,c.id+'.inline.tmp.webp');execFileSync('cwebp',['-quiet','-q','65','-resize','0','150',path.join(OUT,c.id+'-sm.webp'),'-o',tmp]);inline[c.id]='data:image/webp;base64,'+fs.readFileSync(tmp).toString('base64');fs.unlinkSync(tmp);}fs.writeFileSync(path.join(__dirname,'..','components','arcadeLoadingInline.json'),JSON.stringify(inline));}
  if(errors.length)console.warn('page errors:',errors);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
