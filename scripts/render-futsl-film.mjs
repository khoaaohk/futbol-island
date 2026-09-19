// Bounded offline rendering: stream one PNG at a time to ffmpeg, no PNG accumulation.
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,renameSync,mkdirSync,writeFileSync} from 'node:fs';
import {once} from 'node:events';
const require=createRequire(new URL('../vendor/hand-drawn-canvas-animation/scripts/package.json',import.meta.url));
const puppeteer=require('puppeteer-core').default;
const {duration}=JSON.parse(readFileSync('public/stories/films/futsl/timeline.json'));
for(const [name,width,ar] of [['portrait',720,'9:16'],['square',720,'1:1'],['landscape',1280,'16:9']]){
 if(process.env.FUTSL_FORMAT&&name!==process.env.FUTSL_FORMAT)continue;
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage();await page.goto(`http://localhost:8092/stories/films/futsl-film.html?bare=1&w=${width}&ar=${ar}`);await page.waitForFunction('window.__ready===true');
 const target=`public/stories/films/futsl/${name}`;
 const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','24','-i','pipe:0','-i','public/stories/films/futsl/narration.mp3','-map','0:v:0','-map','1:a:0','-c:v','libx264','-threads','2','-crf','22','-preset','fast','-pix_fmt','yuv420p','-maxrate','2500k','-bufsize','5000k','-c:a','aac','-b:a','96k','-movflags','+faststart','-shortest',target+'.next.mp4'],{stdio:['pipe','inherit','inherit']});const closed=once(ff,'close');
 mkdirSync('/tmp/fi2-futsl-review',{recursive:true});
 for(let i=0;i<Math.ceil(duration*24);i++){
 const data=await page.evaluate(i=>window.__frame(i/2),i),png=Buffer.from(data.split(',')[1],'base64');
 if(i===0){writeFileSync(`/tmp/fi2-futsl-review/${name}-poster.png`,png);execFileSync('ffmpeg',['-v','error','-y','-i',`/tmp/fi2-futsl-review/${name}-poster.png`,'-frames:v','1','-q:v','2',`public/stories/films/futsl/poster-${name}.jpg`]);}
 if(!ff.stdin.write(png))await once(ff.stdin,'drain');if(i%240===0)console.log(name,i);
 }
 ff.stdin.end();const [code]=await closed;if(code!==0)throw Error('ffmpeg failed');renameSync(target+'.next.mp4',target+'.mp4');console.log('Installed',name);
 }finally{await browser.close()}
}
