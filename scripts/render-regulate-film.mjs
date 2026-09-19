// Sequential offline renders. Runtime loads only one closest-aspect 720p movie.
import {execFileSync} from 'node:child_process';
import {readFileSync,renameSync} from 'node:fs';
const {duration}=JSON.parse(readFileSync('public/stories/films/regulate/timeline.json','utf8'));
const supportFix=process.argv.includes('--support-fix');
const contactFix=process.argv.includes('--contact-fix');
const preserveAudio=supportFix||contactFix||process.argv.includes('--preserve-audio');
const frames=Array.from({length:Math.ceil(duration*12)*2},(_,i)=>i).filter(i=>(!supportFix||(i>=1160&&i<=1480))&&(!contactFix||(i>=180&&i<=230))).join(',');
for(const [name,width,ar] of [['portrait',720,'9:16'],['square',720,'1:1'],['landscape',1280,'16:9']]){
 if(process.env.REGULATE_FORMAT&&name!==process.env.REGULATE_FORMAT)continue;
 const out='/tmp/fi2-regulate-'+name;
 execFileSync(process.execPath,['scripts/render-story-smooth.mjs','public/stories/films/regulate-film.html','--only',frames,'--out',out],{env:{...process.env,STORY_URL:`http://localhost:8092/stories/films/regulate-film.html?bare=1&w=${width}&ar=${ar}`},stdio:'inherit'});
 const target=`public/stories/films/regulate/${name}`;
 execFileSync('ffmpeg',['-v','error','-y','-framerate','24','-i',out+'/regulate-film-frames/%04d.png','-i',preserveAudio?target+'.mp4':'public/stories/films/regulate/narration.mp3','-map','0:v:0','-map','1:a:0','-c:v','libx264','-threads','2','-crf','22','-preset','fast','-pix_fmt','yuv420p','-maxrate','2500k','-bufsize','5000k','-c:a',preserveAudio?'copy':'aac','-b:a','96k','-movflags','+faststart','-shortest',target+'.next.mp4'],{stdio:'inherit'});
 renameSync(target+'.next.mp4',target+'.mp4');
 execFileSync('ffmpeg',['-v','error','-y','-i',out+'/regulate-film-frames/0000.png','-frames:v','1','-q:v','2',`public/stories/films/regulate/poster-${name}.jpg`],{stdio:'inherit'});
 console.log('Installed',name);
}
