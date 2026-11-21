// Share pictures (1200x630 JPEG) for the Library (/library, /es/library) and the game (/play) (SEO plan, Nov 20 2026, owner:
// "go with your recommendations"). Each is a plain HTML card drawn in headless Chrome from repo files only: Inter (lib/site/fonts/
// inter, SIL OFL) for the words, IslandBrush for the wordmark, and real captures from public/ (the Library hero pictures; the
// lead clip poster of /games). No network. Text sits inside a 64px safe margin.
//   node scripts/render-hub-og.cjs            writes public/og/learn-soccer-library-og.jpg and public/og/free-3d-soccer-game-og.jpg
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const ROOT=path.join(__dirname,'..');
const b64=(f)=>fs.readFileSync(path.join(ROOT,f)).toString('base64');
const font=(name,f,w)=>`@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${b64(f)}) format('truetype');font-weight:${w}}`;
const img=(f)=>`data:image/webp;base64,${b64(f)}`;
const FONTS=font('Inter','lib/site/fonts/inter/Inter-SemiBold.ttf',600)+font('Inter','lib/site/fonts/inter/Inter-ExtraBold.ttf',800)
 +font('IslandBrush','public/stories/films/assets/IslandBrush-Regular.ttf',400);
const BASE=`${FONTS}*{box-sizing:border-box;margin:0}html,body{width:1200px;height:630px;overflow:hidden}body{font-family:Inter;-webkit-font-smoothing:antialiased}`;

const library=`<style>${BASE}
body{display:flex;background:#fff8e7;color:#244d40}
.txt{width:520px;padding:64px 0 64px 64px;display:flex;flex-direction:column;justify-content:space-between}
.mark{font-family:IslandBrush;font-size:46px;line-height:1;color:#244d40;text-shadow:0 4px 0 #e9c16b}
.eyebrow{font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#7a5a1e}
h1{font-weight:800;font-size:76px;line-height:1;letter-spacing:-.035em;margin-top:18px}
p{font-weight:600;font-size:32px;line-height:1.25;color:#4f6259;margin-top:20px;letter-spacing:-.01em}
.foot{font-weight:600;font-size:22px;color:#4f6259}
.art{position:relative;flex:1;margin:40px 40px 40px 0}
.main{position:absolute;inset:0 0 0 0;width:100%;height:100%;object-fit:cover;border-radius:36px}
.inset{position:absolute;left:28px;bottom:28px;width:190px;height:238px;object-fit:cover;border-radius:24px;border:6px solid #fff8e7;box-shadow:0 10px 30px rgba(36,77,64,.25)}
</style>
<div class="txt"><div class="mark">Futbol Island</div>
<div><div class="eyebrow">The Library</div><h1>Learn soccer</h1><p>Lessons, rules and drills for kids 7 to 12</p></div>
<div class="foot">futbolisland.app/library</div></div>
<div class="art"><img class="main" src="${img('public/learn/montage.webp')}"><img class="inset" src="${img('public/learn/lesson_field_45.webp')}"></div>`;

const play=`<style>${BASE}
body{position:relative;background:#1d3a31;color:#fff}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(16,38,31,.88) 0%,rgba(16,38,31,.62) 38%,rgba(16,38,31,0) 66%)}
.txt{position:absolute;left:64px;top:64px;bottom:64px;width:560px;display:flex;flex-direction:column;justify-content:space-between}
.mark{font-family:IslandBrush;font-size:64px;line-height:1;color:#fff;text-shadow:0 5px 0 #e9a93b}
h1{font-weight:800;font-size:66px;line-height:1.02;letter-spacing:-.035em}
p{font-weight:600;font-size:26px;line-height:1.3;margin-top:18px;color:#e6f1ec;white-space:nowrap}
.pill{align-self:flex-start;padding:12px 26px;border-radius:999px;background:#f2c14e;color:#244d40;font-weight:800;font-size:24px}
</style>
<img class="bg" src="${img('public/games/clips/matchmix.webp')}"><div class="shade"></div>
<div class="txt"><div class="mark">Futbol Island</div>
<div><h1>Free 3D soccer game in your browser</h1><p>For kids 7 to 12 · no download, no account</p></div>
<div class="pill">futbolisland.app/play</div></div>`;

(async()=>{let b;try{b=await chromium.launch({args:['--mute-audio']});}catch{b=await chromium.launch({channel:'chrome',args:['--mute-audio']});}
 const out=path.join(ROOT,'public/og');fs.mkdirSync(out,{recursive:true});
 for(const [name,html] of [['learn-soccer-library-og.jpg',library],['free-3d-soccer-game-og.jpg',play]]){
  const p=await b.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await p.setContent(html,{waitUntil:'load'});
  await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const file=path.join(out,name);await p.screenshot({path:file,type:'jpeg',quality:84});await p.close();
  console.log(name,Math.round(fs.statSync(file).size/1024)+' KB');}
 await b.close();})();
