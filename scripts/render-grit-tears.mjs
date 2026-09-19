// Re-render only changed narration frames, then encode a bounded 720p playback asset.
import {execFileSync} from 'node:child_process';
import {renameSync} from 'node:fs';
const full=process.argv.includes('--full');
const only=Array.from({length:full?1834:245},(_,i)=>i+(full?0:1178)).join(',');
for(const [name,width,ar] of [['portrait',1080,'9:16'],['square',1080,'1:1'],['landscape',1920,'16:9']]){
 if(process.env.GRIT_FORMAT&&process.env.GRIT_FORMAT!==name)continue;
 const dir='/tmp/fi2-grit-immersive-'+name;
 execFileSync(process.execPath,['scripts/render-story-smooth.mjs','public/stories/films/grit-film.html','--only',only,'--out',dir],{env:{...process.env,STORY_URL:`http://localhost:8092/stories/films/grit-film.html?bare=1&w=${width}&ar=${ar}`},stdio:'inherit'});
 const target=`public/stories/films/grit/${name}`;
 execFileSync('ffmpeg',['-v','error','-y','-framerate','24','-i',dir+'/grit-film-frames/%04d.png','-i','public/stories/films/grit/narration.mp3','-vf',name==='landscape'?'scale=1280:720':name==='portrait'?'scale=720:1280':'scale=720:720','-c:v','libx264','-threads','2','-crf','22','-preset','fast','-pix_fmt','yuv420p','-maxrate','2500k','-bufsize','5000k','-c:a','aac','-b:a','96k','-movflags','+faststart','-shortest',target+'.next.mp4'],{stdio:'inherit'});
 renameSync(target+'.next.mp4',target+'.mp4');
 if(full)execFileSync('ffmpeg',['-v','error','-y','-i',dir+'/grit-film-frames/0000.png','-frames:v','1','-q:v','2',`public/stories/films/grit/poster-${name}.jpg`],{stdio:'inherit'});
 console.log('Installed',name);
}
