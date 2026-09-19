// Link existing generated recordings without reimporting or changing lesson content.
import {readFileSync,writeFileSync,statSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const audit=read('public/lessons/voice-audit.json'),generated=read('public/lessons/generated-voice.json');
const catalogs=Object.fromEntries(['7v7','9v9','11v11','futsal'].map(f=>[f,read(`public/lessons/${f}.json`)]));
const lessons=new Map(Object.values(catalogs).flat().map(l=>[l.id,l]));let linked=0;
for(const [tag,report] of Object.entries(audit.voices)){
 for(const item of report.missing){const [id,kind,index,choice]=item.context.split(':'),lesson=lessons.get(id),clip=generated[tag]?.[item.hash];if(!lesson||!clip||!(clip.duration>0)||statSync(`public${clip.src}`).size<100)throw Error(`Missing generated audio: ${tag} ${item.context}`);
  const q=lesson.questions[Number(index)],s=lesson.steps[Number(index)];let text,voices;
  if(kind==='step'){text=s.say??s.desc;voices=s.voice??={};}
  else if(kind==='question'){text=q.q;voices=q.voice??={};}
  else if(kind==='explain'){text=q.explain;voices=q.explainVoice??={};}
  else if(kind==='choice'){text=q.choiceExplanations[Number(choice)];q.choiceVoices??=[];voices=q.choiceVoices[Number(choice)]??={};}
  else throw Error(`Unknown context ${item.context}`);
  if(text!==item.text)throw Error(`Narration text changed: ${item.context}`);
  if(!voices[tag]){voices[tag]=clip;linked++;}
 }
 report.generated=Object.keys(generated[tag]??{}).length;report.missing=[];
}
for(const [format,catalog] of Object.entries(catalogs))writeFileSync(`public/lessons/${format}.json`,JSON.stringify(catalog));
writeFileSync('public/lessons/voice-audit.json',JSON.stringify(audit,null,2));console.log(`Linked ${linked} existing generated narration references.`);
