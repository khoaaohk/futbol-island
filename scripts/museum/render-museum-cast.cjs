// Bakes the History Museum's storytelling cast (Oct 4 2026) from the REAL bean rig, the loading-screen pipeline
// (scripts/render-splash-characters.cjs): opens the dev page /splash-lab on the running dev server (:8092), poses each
// character with the preview move driver and renders one transparent still each. Raw PNGs go to test-results/museum-cast/;
// scripts/museum/pack-museum-cast.py packs them into ONE sprite sheet (public/museum/cast.webp + lib/museum/museumCast.json).
//   node scripts/render-museum-cast.cjs [id]
const fs=require('node:fs'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('@playwright/test'));}
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092',RAW=path.join(__dirname,'..','..','test-results','museum-cast');
const REF={shirt:'#24262c',shirt2:'#24262c',shorts:'#24262c',socks:'#24262c',socks2:'#f4efe2'};
const GENTS=[{shirt:'#b8443c',shirt2:'#f4efe2',shorts:'#2d2a33'},{shirt:'#2f5f9e',shirt2:'#f4efe2',shorts:'#2d2a33'},{shirt:'#2f7d4a',shirt2:'#f4efe2',shorts:'#2d2a33'},{shirt:'#c9921f',shirt2:'#2d2a33',shorts:'#2d2a33'}];
const GENT_LOOK=[{skin:'#f1c9a5',hair:{style:'crop',color:'#3b2a20'}},{skin:'#8a5a3c',hair:{style:'curls',color:'#1a1210'}},{skin:'#e8b48a',hair:{style:'tuft',color:'#a0522d'}},{skin:'#c68b5e',hair:{style:'crop',color:'#2a1c14'}}];
const CAST=[
 // 1891 penalty: keeper (front, gloves), taker (from behind), referee.
 {id:'gk-ready',spec:{match:{key:'museum-gk',side:'home',keeper:true,number:1},move:'idle',at:.4,yaw:0,azimuth:0,ball:false,expression:'neutral'}},
 {id:'gk-dive',spec:{match:{key:'museum-gk',side:'home',keeper:true,number:1},move:'keeperDive',at:1.15,yaw:0,azimuth:0,ball:false}},
 {id:'taker-stand',spec:{custom:{character:'male'},number:9,move:'idle',at:.4,yaw:0,azimuth:2.6,ball:false}},
 {id:'taker-kick',spec:{custom:{character:'male'},number:9,move:'finesseShot',at:.5,yaw:0,azimuth:2.6,ball:false}},
 {id:'ref',spec:{match:{key:'museum-ref',side:'away',number:null,look:{headwear:'none',skin:'#e8b48a'}},outfit:REF,move:'thankPasser',at:1.45,yaw:-.3,azimuth:.2,ball:false,expression:'neutral'}},
 // 1863 meeting: four club players in their colours, arguing, then playing together.
 ...GENTS.flatMap((o,i)=>[
  {id:`g${i}-argue`,spec:{match:{key:'museum-g'+i,side:'home',number:null,look:{...GENT_LOOK[i],headwear:'none'}},outfit:o,move:'thankPasser',at:1.45,yaw:[.4,-.4,.9,-.9][i],ball:false,expression:'neutral'}},
  {id:`g${i}-cheer`,spec:{match:{key:'museum-g'+i,side:'home',number:null,look:{...GENT_LOOK[i],headwear:'none'}},outfit:o,move:'celebrate',at:.35,yaw:[.4,-.4,.9,-.9][i],ball:false}},
  {id:`g${i}-kick`,spec:{match:{key:'museum-g'+i,side:'home',number:null,look:{...GENT_LOOK[i],headwear:'none'}},outfit:o,move:'toePoke',at:.42,yaw:[1.2,-1.2,1.4,-1.4][i],ball:false}}]),
 // 1992 zoetrope strip (side views): the team-mate's pass back, the keeper catching it, and the keeper's first touch.
 {id:'z-pass',spec:{match:{key:'museum-z',side:'home',number:4},move:'toePoke',at:.42,yaw:Math.PI/2,azimuth:0,ball:false}},
 {id:'z-gk-hands',spec:{match:{key:'museum-gk',side:'home',keeper:true,number:1},move:'keeperThrow',at:.9,yaw:-Math.PI/2,azimuth:0,ball:true}},
 {id:'z-gk-foot',spec:{match:{key:'museum-gk',side:'home',keeper:true,number:1},move:'toePoke',at:.42,yaw:-Math.PI/2,azimuth:0,ball:false}},
 {id:'z-gk-idle',spec:{match:{key:'museum-gk',side:'home',keeper:true,number:1},move:'idle',at:.4,yaw:-Math.PI/2,azimuth:0,ball:false}},
 // 1991: a striker and her celebration; 1989: the sole roll; the ball cabinet's three young players (small, medium, tall).
 {id:'w-striker',spec:{custom:{character:'female'},number:10,move:'finesseShot',at:.5,yaw:-.9,ball:false}},
 {id:'w-cheer',spec:{custom:{character:'female'},number:10,move:'celebrate',at:.35,yaw:-.3,ball:false}},
 {id:'f-sole',spec:{match:{key:'museum-futsal',side:'home',number:7},move:'soleRoll',at:.6,yaw:-.7,ball:true}},
 {id:'kid-s',spec:{custom:{character:'male',build:'short'},number:3,move:'idle',at:.4,yaw:-.2,ball:false}},
 {id:'kid-m',spec:{custom:{character:'female'},number:4,move:'idle',at:.4,yaw:0,ball:false}},
 {id:'kid-l',spec:{custom:{character:'male',build:'tall'},number:5,move:'idle',at:.4,yaw:.2,ball:false}},
 // Kit lockers: number 1 (keeper), 9 and 10, facing out.
 {id:'k1',spec:{match:{key:'museum-k1',side:'home',keeper:true,number:1},move:'idle',at:.4,yaw:0,azimuth:0,ball:false}},
 {id:'k9',spec:{match:{key:'museum-k9',side:'home',number:9},move:'idle',at:.4,yaw:0,azimuth:Math.PI,ball:false}},
 {id:'k10',spec:{match:{key:'museum-k10',side:'home',number:10},move:'idle',at:.4,yaw:0,azimuth:Math.PI,ball:false}},
 // The Hall of Fame podium: a graduate cheering.
 {id:'hero-cheer',spec:{custom:{character:'female',eyes:'happy',mouth:'grin'},number:9,move:'celebrate',at:.35,yaw:-.35,ball:false}},
];
(async()=>{fs.mkdirSync(RAW,{recursive:true});const only=process.argv[2];
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{const page=await browser.newPage({viewport:{width:800,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(BASE+'/splash-lab',{timeout:240000});await page.waitForFunction(()=>window.__fiSplash,null,{timeout:180000});
  const meta={};
  for(const c of CAST){if(only&&c.id!==only)continue;const r=await page.evaluate(spec=>window.__fiSplash.render(spec),c.spec);
   fs.writeFileSync(path.join(RAW,c.id+'.png'),Buffer.from(r.url.split(',')[1],'base64'));meta[c.id]={w:r.width,h:r.height};console.log(c.id,r.width+'x'+r.height);}
  const mp=path.join(RAW,'meta.json');const old=fs.existsSync(mp)?JSON.parse(fs.readFileSync(mp,'utf8')):{};fs.writeFileSync(mp,JSON.stringify({...old,...meta},null,1));
  if(errors.length)console.warn('page errors:',errors);}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
