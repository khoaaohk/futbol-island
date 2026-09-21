// Contact sheets + seam pixel diffs for riso stories. Usage: node scripts/review-riso-story.mjs [--id chalk-line] [--out dir]
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ts=require('typescript');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const sources={},links={};
function gather(file){
 file=path.resolve(file);if(sources[file])return file;
 if(file.endsWith('.json')){sources[file]=`module.exports=${readFileSync(file,'utf8')}`;links[file]={};return file;}
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 sources[file]=code;links[file]={};
 for(const match of code.matchAll(/require\(["']([^"']+)["']\)/g)){const name=match[1];assert.ok(name.startsWith('.'),`unexpected external browser dependency ${name}`);const base=path.resolve(path.dirname(file),name),resolved=[base,`${base}.ts`,`${base}.json`].find(existsSync);assert.ok(resolved,`missing dependency ${base}`);links[file][name]=gather(resolved);}
 return file;
}
export const loaderScript=(entries)=>`(()=>{const sources=${JSON.stringify(sources)},links=${JSON.stringify(links)},cache={};function load(id){if(cache[id])return cache[id].exports;const module={exports:{}};cache[id]=module;new Function('module','exports','require',sources[id])(module,module.exports,name=>load(links[id][name]));return module.exports;}window.__load=load;${entries}})();`;
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const requested=arg('--id'),out=arg('--out',process.env.RISO_REVIEW_DIR||path.join('/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso','review'));
const storiesDir=path.join(root,'lib/paths/riso/stories'),ids=readdirSync(storiesDir).filter(f=>f.endsWith('.ts')).map(f=>f.slice(0,-3)).filter(id=>!requested||id===requested);
assert.ok(ids.length,`No riso story ${requested??''} in ${storiesDir}`);
const storyLib=gather(path.join(root,'lib/paths/riso/story.ts')),sheetLib=gather(path.join(root,'lib/paths/riso/sheet.ts')),timing=JSON.parse(readFileSync(path.join(root,'lib/paths/riso/data/narrationTiming.json'),'utf8'));
const files=Object.fromEntries(ids.map(id=>[id,gather(path.join(storiesDir,`${id}.ts`))]));
mkdirSync(out,{recursive:true});
// The page renders stories exactly like StoryFilmPlayer.paint(): acquireSheet → story.draw → press(chapter).
const pageSetup=`window.riso={storyLib:load(${JSON.stringify(storyLib)}),sheetLib:load(${JSON.stringify(sheetLib)}),timing:${JSON.stringify(timing)},files:${JSON.stringify(files)}};
window.riso.story=id=>{let story=load(window.riso.files[id]).story;const t=window.riso.timing[id];if(story.audio.mode==='chapters'&&t)story={...story,chapters:story.chapters.map((c,i)=>({...c,seconds:t[i]??c.seconds}))};return story;};
window.riso.render=(story,canvas,ctx,dpr,chapter,chapterTime,tray)=>{const {storyLib,sheetLib}=window.riso;const play=storyLib.visualStory(story);const starts=storyLib.chapterStarts(play);const time=starts[chapter]+chapterTime;const f=storyLib.resolveFrame(story,time,chapter);const w=canvas.width/dpr,h=canvas.height/dpr;const sheet=sheetLib.acquireSheet(ctx,w,h,dpr,story.spec,tray);ctx.setTransform(1,0,0,1,0,0);story.draw({sheet,time,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:false,width:w,height:h,captionChapter:f.captionChapter});sheet.press(f.chapter);return {ops:sheet._ops,...f};};`;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent('<body style="margin:0;padding:14px;background:#22366b;color:#f0ece2;font:14px sans-serif"><main></main></body>');
 await page.addScriptTag({content:loaderScript(pageSetup)});
 const report=[];
 for(const id of ids){
  const result=await page.evaluate(({id})=>{
   const main=document.querySelector('main');main.replaceChildren();const story=window.riso.story(id),play=window.riso.storyLib.visualStory(story),chapters=play.chapters,starts=window.riso.storyLib.chapterStarts(play);
   const views=[{w:390,h:850,tray:{bottom:212,right:0},tw:180},{w:1440,h:850,tray:{bottom:170,right:0},tw:300}].map(v=>{const c=document.createElement('canvas');c.width=v.w;c.height=v.h;return{...v,canvas:c,ctx:c.getContext('2d',{willReadFrequently:true})};});
   const h1=document.createElement('h1');h1.textContent=`${story.title} — ${story.id}`;main.append(h1);
   let samples=0,maxOps=0,drawErrors=[];
   const shot=(row,label,chapter,chapterTime)=>{for(const v of views){let info;try{info=window.riso.render(story,v.canvas,v.ctx,1,chapter,chapterTime,v.tray);maxOps=Math.max(maxOps,info.ops);}catch(e){drawErrors.push(`${id} ch${chapter+1} t=${chapterTime.toFixed(2)} ${v.w}: ${e.message}`);}
    const card=document.createElement('div');card.style.cssText='display:flex;flex-direction:column;gap:4px';const cap=document.createElement('small');cap.style.cssText='height:34px;width:'+v.tw+'px';cap.textContent=`${chapterTime.toFixed(2)}s ${label}`+(info?` · ${info.ops} ops`:'');const thumb=document.createElement('canvas');thumb.width=v.tw;thumb.height=Math.round(v.tw*v.h/v.w);thumb.getContext('2d').drawImage(v.canvas,0,0,thumb.width,thumb.height);card.append(cap,thumb);row.append(card);}samples++;};
   chapters.forEach((ch,i)=>{const seconds=window.riso.storyLib.chapterSeconds(play,i);const h2=document.createElement('h2');h2.textContent=`${i+1}. ${ch.label}${ch.headline?` · “${typeof ch.headline==='string'?ch.headline:ch.headline.text}”`:''} (${seconds}s)`;main.append(h2);const p=document.createElement('p');p.textContent=ch.narration;main.append(p);
    const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start';main.append(row);
    shot(row,'start',i,0);ch.cues.forEach(c=>shot(row,`cue +0.9 “${c.words}”`,i,Math.min(c.at+.9,seconds-.8)));shot(row,'settled',i,Math.max(0,seconds-1));
    if(i<chapters.length-1){shot(row,'mid-passage',i,seconds-.3);shot(row,'seam end',i,seconds);shot(row,'seam next start',i+1,0);}});
   // seam pixel diffs: end of chapter N (passage progress 1) must equal chapter N+1 at chapterTime 0
   const seams=[];const v=views[0];
   const diff=(a,b)=>{let max=0,changed=0;for(let k=0;k<a.length;k++){const d=Math.abs(a[k]-b[k]);if(d>max)max=d;if(d>10)changed++;}return{max,changed};};
   for(let i=0;i<chapters.length-1;i++){const seconds=window.riso.storyLib.chapterSeconds(play,i);window.riso.render(story,v.canvas,v.ctx,1,i,seconds,v.tray);const a=v.ctx.getImageData(0,0,v.w,v.h).data;window.riso.render(story,v.canvas,v.ctx,1,i+1,0,v.tray);const b=v.ctx.getImageData(0,0,v.w,v.h).data;
    // the frame normal playback holds while narration finishes (chapterTime = seconds − .001) must also match the next chapter's frame 0
    window.riso.render(story,v.canvas,v.ctx,1,i,seconds-.001,v.tray);const h=v.ctx.getImageData(0,0,v.w,v.h).data;const held=diff(h,b);
    let alpha=0;for(let k=3;k<b.length;k+=4)if(b[k]<255)alpha++;
    seams.push({chapter:i,...diff(a,b),heldMax:held.max,heldChangedPct:+(held.changed/(v.w*v.h*4)*100).toFixed(3),transparent:alpha});}
   return{id,title:story.title,mode:story.audio.mode,samples,maxOps,seams,drawErrors,starts};
  },{id});
  await page.screenshot({path:path.join(out,`${id}.png`),fullPage:true});report.push(result);
  console.log(id,'samples',result.samples,'maxOps',result.maxOps,'seams',JSON.stringify(result.seams),result.drawErrors.length?result.drawErrors:'');
 }
 writeFileSync(path.join(out,'report.json'),JSON.stringify({errors,report},null,2));
 // held seams (chapterTime = seconds − .001, what the chapters-mode player holds while narration finishes) must match too; track mode never holds a frame
const seamFailures=report.flatMap(r=>r.seams.filter(s=>s.max>0||(r.mode==='chapters'&&s.heldChangedPct>.5)||s.transparent>0).map(s=>({id:r.id,...s}))),drawErrors=report.flatMap(r=>r.drawErrors);
 console.log(JSON.stringify({stories:report.length,out,errors,seamFailures,drawErrors}));
 assert.deepEqual(errors,[],'page errors');assert.deepEqual(drawErrors,[],'draw errors');assert.deepEqual(seamFailures,[],'Chapter seams must match pixel for pixel');
}finally{await browser.close();}
