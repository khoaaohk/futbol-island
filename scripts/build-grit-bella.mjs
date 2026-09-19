// Generate the existing Grit script with the same local af_bella voice as Coach Bella.
// Preserve phrase starts and the film timeline; video packets are copied, never re-rendered.
import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const work='/tmp/fi2-grit-bella',base='public/stories/films/grit';
const cues=JSON.parse(readFileSync(`${base}/narration-cues.json`,'utf8'));
const duration=76.370431;
mkdirSync(work,{recursive:true});
writeFileSync(`${work}/jobs.json`,JSON.stringify(Object.fromEntries(cues.map((cue,i)=>[i,cue.text.trim()]))));
const source=resolve('../project-archives/restored/futbol-island/scripts');
if(!process.argv.includes('--use-generated'))execFileSync(`${source}/.venv/bin/python`,[`${source}/genvoice_tts.py`,`${work}/jobs.json`,work,'af_bella','1.0'],{stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',GENVOICE_THREADS:'2'}});
const ff=(args)=>execFileSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});
const inputs=[],filters=[],report=[];
for(const [i,cue] of cues.entries()){
 const wav=`${work}/${i}.wav`;
 const length=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',wav],{encoding:'utf8'}));
 const speed=Math.max(.88,length/(cue.end-cue.start));
 inputs.push('-i',wav);
 filters.push(`[${i}:a]atempo=${speed.toFixed(6)},adelay=${Math.round(cue.start*1000)}:all=1[a${i}]`);
 report.push({start:cue.start,end:cue.start+length/speed,text:cue.text.trim(),speed});
}
filters.push(cues.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${cues.length}:normalize=0,loudnorm=I=-18:TP=-2:LRA=7,apad,atrim=duration=${duration}[out]`);
ff([...inputs,'-filter_complex',filters.join(';'),'-map','[out]','-ar','48000','-ac','1','-c:a','libmp3lame','-b:a','128k',`${work}/bella-narration.mp3`]);
writeFileSync(`${work}/timing-report.json`,JSON.stringify(report,null,2));
for(const name of ['portrait','square','landscape']){
 ff(['-i',`${base}/${name}.mp4`,'-i',`${work}/bella-narration.mp3`,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','96k','-t',String(duration),'-movflags','+faststart',`${base}/${name}.bella.mp4`]);
}
if(!existsSync(`${work}/previous-narration.mp3`))copyFileSync(`${base}/narration.mp3`,`${work}/previous-narration.mp3`);
copyFileSync(`${work}/bella-narration.mp3`,`${base}/narration.mp3`);
for(const name of ['portrait','square','landscape'])renameSync(`${base}/${name}.bella.mp4`,`${base}/${name}.mp4`);
console.log('Installed Coach Bella narration across all three Grit formats. Script unchanged.');
