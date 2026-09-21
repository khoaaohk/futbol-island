// Frame-time sample for a riso story at 390×850, DPR 1.5. Usage: node scripts/riso-perf.mjs chalk-line [--frames 120]
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ts=require('typescript');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const sources={},links={};
function gather(file){file=path.resolve(file);if(sources[file])return file;if(file.endsWith('.json')){sources[file]=`module.exports=${readFileSync(file,'utf8')}`;links[file]={};return file;}
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;sources[file]=code;links[file]={};
 for(const match of code.matchAll(/require\(["']([^"']+)["']\)/g)){const name=match[1];assert.ok(name.startsWith('.'),`unexpected external dependency ${name}`);const base=path.resolve(path.dirname(file),name),resolved=[base,`${base}.ts`,`${base}.json`].find(existsSync);assert.ok(resolved,`missing dependency ${base}`);links[file][name]=gather(resolved);}return file;}
const id=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'chalk-line',frames=Number(process.argv.includes('--frames')?process.argv[process.argv.indexOf('--frames')+1]:120);
const storyFile=gather(path.join(root,`lib/paths/riso/stories/${id}.ts`)),storyLib=gather(path.join(root,'lib/paths/riso/story.ts')),sheetLib=gather(path.join(root,'lib/paths/riso/sheet.ts')),timing=JSON.parse(readFileSync(path.join(root,'lib/paths/riso/data/narrationTiming.json'),'utf8'));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1.5});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<body style="margin:0;background:#f0ece2"><canvas id="c" style="width:390px;height:850px"></canvas></body>');
 await page.addScriptTag({content:`(()=>{const sources=${JSON.stringify(sources)},links=${JSON.stringify(links)},cache={};function load(id){if(cache[id])return cache[id].exports;const module={exports:{}};cache[id]=module;new Function('module','exports','require',sources[id])(module,module.exports,name=>load(links[id][name]));return module.exports;}window.__load=load;window.riso={storyLib:load(${JSON.stringify(storyLib)}),sheetLib:load(${JSON.stringify(sheetLib)}),story:load(${JSON.stringify(storyFile)}).story,timing:${JSON.stringify(timing)}};})();`});
 const result=await page.evaluate(({frames,id})=>{
  const {storyLib,sheetLib,timing}=window.riso;let story=window.riso.story;const t=timing[id];if(story.audio.mode==='chapters'&&t)story={...story,chapters:story.chapters.map((c,i)=>({...c,seconds:t[i]??c.seconds}))};
  const dpr=1.5,w=390,h=850,canvas=document.getElementById('c');canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');const duration=storyLib.storyDuration(story),tray={bottom:212,right:0};
  const render=time=>{const f=storyLib.resolveFrame(story,time);const sheet=sheetLib.acquireSheet(ctx,w,h,dpr,story.spec,tray);ctx.setTransform(1,0,0,1,0,0);story.draw({sheet,time,chapter:f.chapter,chapterTime:f.chapterTime,progress:f.progress,seconds:f.seconds,cue:f.cue,cueTime:f.cueTime,reducedMotion:false,width:w,height:h,captionChapter:f.captionChapter});sheet.press(f.chapter);return sheet._ops;};
  for(let i=0;i<6;i++)render(i*duration/6);// warm the caches (plates, halftone tiles, grain) like the first frames of playback
  const times=[],ops=[];for(let i=0;i<frames;i++){const time=(i+.5)/frames*duration;const t0=performance.now();const o=render(time);ctx.getImageData(0,0,1,1);times.push(performance.now()-t0);ops.push(o);}
  const sorted=[...times].sort((a,b)=>a-b);const q=p=>sorted[Math.min(sorted.length-1,Math.floor(p*sorted.length))];
  return{frames,median:+q(.5).toFixed(2),p95:+q(.95).toFixed(2),max:+sorted[sorted.length-1].toFixed(2),opsMax:Math.max(...ops),opsMedian:[...ops].sort((a,b)=>a-b)[Math.floor(ops.length/2)],duration};
 },{frames,id});
 console.log(JSON.stringify({id,viewport:'390x850@1.5',...result,errors}));
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
