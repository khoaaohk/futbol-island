// Offline voice replacement: user-paced script, custom warm British female style at 0.9x.
// Extend tight scene beats instead of speeding up the narrator to fit the old audio.
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const base='public/stories/films/grit',work='/tmp/fi2-grit-storyteller';
const {script,cues}=JSON.parse(readFileSync('lib/paths/gritScript.json','utf8'));
const words=text=>(text.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[]).join(' ');
if(words(script)!==words(cues.map(cue=>cue.text).join(' ')))throw Error('Spoken segments must preserve the complete user script');
const originalEnd=76.370431,closingStart=72;
mkdirSync(work,{recursive:true});
writeFileSync(`${work}/jobs.json`,JSON.stringify(Object.fromEntries(cues.map((cue,i)=>[i,cue.text.trim()]))));
if(!process.argv.includes('--use-generated'))execFileSync('../project-archives/restored/futbol-island/scripts/.venv/bin/python',['scripts/grit-storyteller-voice.py',resolve('../project-archives/restored/futbol-island/scripts/tts-models'),`${work}/jobs.json`,work],{stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
const ff=args=>execFileSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});
let next=0;
const timing=[],report=[],inputs=[],filters=[];
for(const [i,cue] of cues.entries()){
 const wav=`${work}/${i}.wav`;
 const length=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',wav],{encoding:'utf8'}));
 const oldEnd=cues[i+1]?.start??closingStart;
 const pause=cue.pause;
 const span=Math.max(oldEnd-cue.start,length+pause);
 timing.push({story:cue.start,media:next});
 report.push({text:cue.text.trim(),start:next,end:next+length,pause:span-length,speed:.9});
 inputs.push('-i',wav);
 filters.push(`[${i}:a]adelay=${Math.round(next*1000)}:all=1[a${i}]`);
 next+=span;
}
timing.push({story:closingStart,media:next});
const duration=next+originalEnd-closingStart;
timing.push({story:originalEnd,media:duration});
filters.push(cues.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${cues.length}:normalize=0,loudnorm=I=-18:TP=-2:LRA=7,apad,atrim=duration=${duration}[out]`);
ff([...inputs,'-filter_complex',filters.join(';'),'-map','[out]','-ar','48000','-ac','1','-c:a','libmp3lame','-b:a','128k',`${work}/storyteller-narration.mp3`]);
let expression=String(duration);
for(let i=timing.length-2;i>=0;i--){const a=timing[i],b=timing[i+1];expression=`if(lt(T,${b.story}),${a.media}+(T-${a.story})*${(b.media-a.media)/(b.story-a.story)},${expression})`;}
writeFileSync(`${work}/retime.filter`,`setpts='(${expression})/TB',fps=24`);
for(const name of ['portrait','square','landscape']){
 const original=`${work}/original-${name}.mp4`;
 if(!existsSync(original)||process.argv.includes('--refresh-video'))copyFileSync(`${base}/${name}.mp4`,original);
 ff(['-i',original,'-i',`${work}/storyteller-narration.mp3`,'-map','0:v:0','-map','1:a:0','-vf',readFileSync(`${work}/retime.filter`,'utf8'),'-c:v','libx264','-threads','2','-crf','22','-preset','fast','-pix_fmt','yuv420p','-maxrate','2500k','-bufsize','5000k','-c:a','aac','-b:a','96k','-t',String(duration),'-movflags','+faststart',`${base}/${name}.storyteller.mp4`]);
}
copyFileSync(`${work}/storyteller-narration.mp3`,`${base}/narration.mp3`);
for(const name of ['portrait','square','landscape'])renameSync(`${base}/${name}.storyteller.mp4`,`${base}/${name}.mp4`);
writeFileSync('lib/paths/gritNarrationTiming.json',JSON.stringify(timing,null,2)+'\n');
writeFileSync(`${work}/timing-report.json`,JSON.stringify(report,null,2));
console.log(`Installed warm storyteller, ${duration.toFixed(3)}s, user-paced script preserved.`);
