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
 // Start-screen trick pair (Oct 9 2026), posed with the island freestylers' tricks (lib/graphics/freestyleTricks.ts, SplashSpec.trick):
 // `at` = seconds into the trick. The still, the optional `frames` (trick-boy-f0.webp …, a 4-frame loop) and the `strip` share ONE canvas
 // (the union crop: the stage never moves), so any frame lines up with the still.
 // `strip` = a seamless loop packed as ONE horizontal sprite strip per size (<id>-strip.avif/.webp, <id>-strip-sm.*): `n` cells of exactly
 // the still's canvas (-sm: the -sm canvas), sampled evenly over one cycle [t0, period] of the trick after the rig has settled on that
 // cycle (SplashSpec.trick.cycle), played with a CSS steps(n) translate at fps = n / period (real-time speed).
 // Boy (male starter look, home kit): thigh juggles, the ball resting on the raised right thigh (contact at 2.38 s).
 {id:'trick-boy',extra:true,spec:{custom:{character:'male',eyes:'happy',mouth:'grin'},number:10,move:'idle',trick:{id:'kneeJuggles',side:1},at:2.36,yaw:1.3,expression:'happy'},
  frames:{trick:{id:'kneeJuggles',side:1},at:[1.78,2.08,2.38,2.68],frameMs:300},
  // One cycle = right-thigh touch (1.18 s), left-thigh touch (1.78 s), back to the right (2.38 s).
  strip:{trick:{id:'kneeJuggles',side:1,cycle:[1.18,1.2]},n:16}},
 // Girl (female starter look: sky body, ponytail, home kit): alternating-foot keep-ups, the ball on her left laces (contact).
 {id:'trick-girl',extra:true,spec:{custom:{character:'female',eyes:'happy',mouth:'grin'},number:9,move:'idle',trick:{id:'keepUps',side:1,cycle:[2.18,.96]},at:.48,yaw:-.45,expression:'happy'},
  // One cycle = right laces (2.18 s), left laces (2.66 s), back to the right (3.14 s): the two identical .48 s beats of keepUps.
  strip:{trick:{id:'keepUps',side:1,cycle:[2.18,.96]},n:16}},
];
// The loading-screen cast proper (the arcade palette and --encode index into it); the start-screen extras render only on the main splash.
const MAIN=CAST.filter(c=>!c.extra);

/** AVIF twins of the two WebP sizes (main splash only), from the lossless render. */
function encodeAvif(png,id,h2){
 const tmp=path.join(OUT,id+'.sm.tmp.png');
 execFileSync('avifenc',['-q','50','--qalpha','75','-s','3','-j','4',png,path.join(OUT,id+'.avif')],{stdio:'ignore'});
 // Half size: same Lanczos-style downscale cwebp does, via sips (macOS) to a temp PNG.
 execFileSync('sips',['--resampleHeight',String(h2),png,'--out',tmp],{stdio:'ignore'});
 execFileSync('avifenc',['-q','50','--qalpha','75','-s','3','-j','4',tmp,path.join(OUT,id+'-sm.avif')],{stdio:'ignore'});fs.unlinkSync(tmp);
}
/** The two WebP sizes: the full crop (2x on large screens) and a half-size (2x on phones). Height drives the resize. */
function encodeWebp(png,id,h2){
 execFileSync('cwebp',['-quiet','-q','80','-alpha_q','85','-m','6','-sharp_yuv',png,'-o',path.join(OUT,id+'.webp')]);
 execFileSync('cwebp',['-quiet','-q','78','-alpha_q','85','-m','6','-sharp_yuv','-resize','0',String(h2),png,'-o',path.join(OUT,id+'-sm.webp')]);
}
if(encodeOnly){
 const manifest=JSON.parse(fs.readFileSync(path.join(OUT,'cast.json'),'utf8'));
 for(const c of MAIN){const png=path.join(RAW,c.id+'.png');if(!fs.existsSync(png))throw new Error(`missing ${png}: render with SPLASH_PNG=1 first`);
  encodeAvif(png,c.id,manifest[c.id].sm[1]);const kb=f=>(fs.statSync(path.join(OUT,f)).size/1024).toFixed(1);
  console.log(`${c.id}: avif ${kb(c.id+'.avif')} KB / sm ${kb(c.id+'-sm.avif')} KB (webp ${kb(c.id+'.webp')} / ${kb(c.id+'-sm.webp')})`);}
 process.exit(0);
}

(async()=>{await requireDevServer(BASE);
 if(arcade){const poses=[['thankPasser',1.45,.35],['walk',.75,-.5],['celebrate',.4,.3],['thankPasser',1.45,-.4],['airplane',1.1,-.7]];MAIN.forEach((c,i)=>Object.assign(c.spec,{move:poses[i][0],at:poses[i][1],yaw:poses[i][2],ball:false,outfit:{shirt:['#ff45b5','#4fe5f2','#ad7dff','#4fe5f2','#ff62c6'][i],shirt2:'#e7fcff',shorts:'#191329',socks:['#4fe5f2','#ff45b5','#60e9f2','#ff62c6','#ad7dff'][i],socks2:'#191329',boots:'#191329'}}));MAIN[3].spec.custom={character:'female',costume:'none',bodyColor:'lilac',eyes:'happy',mouth:'grin',hair:'puffs'};}
 const only=arcade?null:process.argv[2];fs.mkdirSync(OUT,{recursive:true});if(process.env.SPLASH_PNG)fs.mkdirSync(RAW,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-gl=angle','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const manifestPath=path.join(OUT,'cast.json');const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{};
 try{
  const page=await browser.newPage({viewport:{width:800,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'/splash-lab',{timeout:240000});await page.waitForFunction(()=>window.__fiSplash,null,{timeout:180000});
  for(const c of arcade?MAIN:CAST){
   if(only&&c.id!==only)continue;
   let r=await page.evaluate(spec=>window.__fiSplash.render(spec),c.spec);
   if(c.frames||c.strip){
    // Render the loop frames and strip cells, then pad the still and every frame onto their union crop.
    const shot=spec=>page.evaluate(sp=>window.__fiSplash.render(sp),spec);
    const frames=[];for(const at of c.frames?.at??[])frames.push(await shot({...c.spec,trick:c.frames.trick,at}));
    const cells=[];if(c.strip){const [,period]=c.strip.trick.cycle;for(let k=0;k<c.strip.n;k++)cells.push(await shot({...c.spec,trick:c.strip.trick,at:k*period/c.strip.n}));}
    const u=[r,...frames,...cells].reduce((a,s)=>[Math.min(a[0],s.box[0]),Math.min(a[1],s.box[1]),Math.max(a[2],s.box[2]),Math.max(a[3],s.box[3])],[1e9,1e9,-1e9,-1e9]);
    const W=u[2]-u[0]+1,H=u[3]-u[1]+1,h2=Math.round(H*.5),w2=Math.round(W*h2/H);
    const pad=s=>page.evaluate(async({url,dx,dy,w,h})=>{const im=new Image();im.src=url;await im.decode();const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,dx,dy);return cv.toDataURL('image/png');},{url:s.url,dx:s.box[0]-u[0],dy:s.box[1]-u[1],w:W,h:H});
    for(let k=0;k<frames.length;k++){const id=`${c.id}-f${k}`,png=path.join(OUT,id+'.tmp.png');fs.writeFileSync(png,Buffer.from((await pad(frames[k])).split(',')[1],'base64'));
     if(process.env.SPLASH_PNG)fs.copyFileSync(png,path.join(RAW,id+'.png'));encodeWebp(png,id,h2);encodeAvif(png,id,h2);fs.unlinkSync(png);}
    if(c.strip){
     // Pack the cells side by side: full size, and each cell resized on its own to the exact -sm cell (whole-pixel cells for steps()).
     const [full,sm]=await page.evaluate(async({urls,shots,W,H,w2,h2})=>{
      const ims=await Promise.all(urls.map(async(url,k)=>{const im=new Image();im.src=url;await im.decode();return {im,box:shots[k]};}));
      const pack=(cw,ch)=>{const cv=document.createElement('canvas');cv.width=cw*ims.length;cv.height=ch;const g=cv.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
       ims.forEach(({im,box},k)=>{const cell=document.createElement('canvas');cell.width=W;cell.height=H;cell.getContext('2d').drawImage(im,box[0],box[1]);g.drawImage(cell,0,0,W,H,k*cw,0,cw,ch);});return cv.toDataURL('image/png');};
      return [pack(W,H),pack(w2,h2)];
     },{urls:cells.map(s=>s.url),shots:cells.map(s=>[s.box[0]-u[0],s.box[1]-u[1]]),W,H,w2,h2});
     // A strip is 16 stills in one file: AVIF q42/q40 (alpha 60/55) keeps it near 120 KB / 60 KB with no visible loss against q50.
     for(const [suffix,url,q,aq,aa] of [['-strip',full,'72','42','60'],['-strip-sm',sm,'70','40','55']]){const id=c.id+suffix,png=path.join(OUT,id+'.tmp.png');fs.writeFileSync(png,Buffer.from(url.split(',')[1],'base64'));
      if(process.env.SPLASH_PNG)fs.copyFileSync(png,path.join(RAW,id+'.png'));
      execFileSync('cwebp',['-quiet','-q',q,'-alpha_q','80','-m','6','-sharp_yuv',png,'-o',path.join(OUT,id+'.webp')]);
      execFileSync('avifenc',['-q',aq,'--qalpha',aa,'-s','3','-j','4',png,path.join(OUT,id+'.avif')],{stdio:'ignore'});fs.unlinkSync(png);}
    }
    r={...r,url:await pad(r),width:W,height:H};
   }
   const png=path.join(OUT,c.id+'.tmp.png');fs.writeFileSync(png,Buffer.from(r.url.split(',')[1],'base64'));
   if(process.env.SPLASH_PNG)fs.copyFileSync(png,path.join(RAW,c.id+'.png'));
   // Two sizes: the full crop (2x on large screens) and a half-size (2x on phones). Height drives the resize.
   const h2=Math.round(r.height*.5);
   encodeWebp(png,c.id,h2);
   if(!arcade)encodeAvif(png,c.id,h2);
   fs.unlinkSync(png);
   manifest[c.id]={width:r.width,height:r.height,sm:[Math.round(r.width*h2/r.height),h2]};
   if(c.frames)Object.assign(manifest[c.id],{frames:c.frames.at.length,frameMs:c.frames.frameMs});
   if(c.strip)manifest[c.id].strip={frames:c.strip.n,fps:+(c.strip.n/c.strip.trick.cycle[1]).toFixed(2),cell:[r.width,r.height],smCell:manifest[c.id].sm};
   const kb=f=>(fs.statSync(path.join(OUT,f)).size/1024).toFixed(1);
   console.log(`${c.id}: ${r.width}x${r.height}  ${kb(c.id+'.webp')} KB / sm ${kb(c.id+'-sm.webp')} KB`);
  }
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,1)+'\n');
  if(arcade){const inline={};for(const c of MAIN){const tmp=path.join(OUT,c.id+'.inline.tmp.webp');execFileSync('cwebp',['-quiet','-q','65','-resize','0','150',path.join(OUT,c.id+'-sm.webp'),'-o',tmp]);inline[c.id]='data:image/webp;base64,'+fs.readFileSync(tmp).toString('base64');fs.unlinkSync(tmp);}fs.writeFileSync(path.join(__dirname,'..','components','arcadeLoadingInline.json'),JSON.stringify(inline));}
  if(errors.length)console.warn('page errors:',errors);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
