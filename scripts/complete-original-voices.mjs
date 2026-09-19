// Fill only source catalog gaps using the original local Kokoro worker/model/voice/speed.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
const source=resolve(process.argv[2]??'../project-archives/restored/futbol-island');
await import(pathToFileURL(resolve(source,'scripts/register-local-ts.mjs')));
const {cleanNarration}=await import(pathToFileURL(resolve(source,'lib/voice.ts')));
const audit=JSON.parse(readFileSync('public/lessons/voice-audit.json','utf8'));
const metadata=existsSync('public/lessons/generated-voice.json')?JSON.parse(readFileSync('public/lessons/generated-voice.json','utf8')):{};
await Promise.all(Object.entries(audit.voices).map(async([tag,report])=>{
 const dir=`/tmp/fi2-voice-${tag}`;mkdirSync(dir,{recursive:true});
 const jobs=Object.fromEntries(report.missing.filter(x=>!metadata[tag]?.[x.hash]).map(x=>[x.hash,cleanNarration(x.text)]));
 const pending=Object.fromEntries(Object.entries(jobs).filter(([hash])=>!existsSync(`${dir}/${hash}.wav`)));
 writeFileSync(`${dir}/jobs.json`,JSON.stringify(pending));
 if(Object.keys(pending).length)await new Promise((resolveJob,reject)=>{const worker=spawn(resolve(source,'scripts/.venv/bin/python'),[resolve(source,'scripts/genvoice_tts.py'),`${dir}/jobs.json`,dir,tag.slice(7),'1.0'],{stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',GENVOICE_THREADS:'2'}});worker.on('exit',code=>code===0?resolveJob():reject(Error(`${tag}: ${code}`)));worker.on('error',reject);});
 metadata[tag]??={};
 for(const hash of Object.keys(jobs)){
 const dest=`public/voice/${tag}/${hash}.m4a`;
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`${dir}/${hash}.wav`,'-ac','1','-c:a','aac','-b:a','32000',dest]);
 const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',dest],{encoding:'utf8'}));
 metadata[tag][hash]={src:`/voice/${tag}/${hash}.m4a`,duration};
 }
 writeFileSync('public/lessons/generated-voice.json',JSON.stringify(metadata,null,2));
}));
