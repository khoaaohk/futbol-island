// Offline mix only: one native media stream at runtime, narration stays in front.
// Source license/attribution: docs/story-film-review/STORY-MUSIC.md.
import {readFileSync,existsSync,copyFileSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const story=process.argv[2],music=process.argv[3]??(story==='regulate'?'/tmp/fi2-ascension.mp3':'/tmp/fi2-wildflowers.mp3');
if(!['grit','regulate'].includes(story))throw Error('Specify grit or regulate');
const base=`public/stories/films/${story}`;
const dry=`${base}/narration.mp3`;
if(!existsSync(dry)||!existsSync(music))throw Error('Missing dry narration or licensed music source');
const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',`${base}/portrait.mp4`],{encoding:'utf8'}));
const mix=`/tmp/fi2-${story}-music-mix.m4a`;
const ff=args=>execFileSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});
// Gentle opening excerpt, normalize score before turning down, with voice-driven ducking.
ff(['-i',dry,'-i',music,'-filter_complex',`[0:a]apad,atrim=duration=${duration},asplit=2[voice][side];[1:a]atrim=duration=${duration},asetpts=PTS-STARTPTS,loudnorm=I=-20:TP=-3:LRA=9,volume=0.22,afade=t=in:d=3,afade=t=out:st=${Math.max(0,duration-5)}:d=5[music];[music][side]sidechaincompress=threshold=0.025:ratio=3:attack=30:release=700[bed];[voice][bed]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false[out]`,'-map','[out]','-ar','48000','-ac','2','-c:a','aac','-b:a','128k',mix]);
for(const name of ['portrait','square','landscape'])ff(['-i',`${base}/${name}.mp4`,'-i',mix,'-map','0:v:0','-map','1:a:0','-c','copy','-t',String(duration),'-movflags','+faststart',`${base}/${name}.music.mp4`]);
for(const name of ['portrait','square','landscape'])renameSync(`${base}/${name}.music.mp4`,`${base}/${name}.mp4`);
console.log(`Mixed ${story==='regulate'?'Ascension':'Wildflowers'} under ${story}, ${duration}s; copied all video streams.`);
