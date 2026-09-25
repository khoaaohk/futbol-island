// Offline reference inspection. Reuse the existing importer without running its asset writes.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),T=require('three');
const directory=process.argv[2];if(!directory)throw Error('Provide the four original CMU source files');
const importer=fs.readFileSync('scripts/bake-motion-reference.mjs','utf8');
const start=importer.indexOf('const radians='),end=importer.indexOf('const rows=');if(start<0||end<start)throw Error('Importer layout changed');
const {skeleton,frames,pose}=vm.runInNewContext(importer.slice(start,end)+';({skeleton,frames,pose})',{T,Math});
const selections=JSON.parse(fs.readFileSync('docs/body-mechanics/motion-reference-analysis.json'));
const result=[];
for(const selection of selections){const subject=selection.trial.slice(0,2),raw=fs.readFileSync(path.join(directory,selection.trial+'.amc'),'utf8'),hash=crypto.createHash('sha256').update(raw).digest('hex');if(hash!==selection.sha256)throw Error('Source mismatch: '+selection.trial);const bones=skeleton(fs.readFileSync(path.join(directory,subject+'.asf'),'utf8')),input=frames(raw),rows=[];
 for(let i=selection.start;i<=selection.end;i++){const p=pose(bones,input[i]),bend=side=>180-p[side+'hipjoint'].clone().sub(p[side+'femur']).angleTo(p[side+'tibia'].clone().sub(p[side+'femur']))*180/Math.PI;rows.push({frame:i,leftKnee:bend('l'),rightKnee:bend('r'),leftAnkleY:p.ltibia.y,rightAnkleY:p.rtibia.y});}
 const range=key=>({min:Math.min(...rows.map(r=>r[key])),max:Math.max(...rows.map(r=>r[key]))});
 result.push({trial:selection.trial,sourceHash:hash,frameStart:selection.start,frameEnd:selection.end,durationSeconds:(selection.end-selection.start)/selection.rate,leftKneeDegrees:range('leftKnee'),rightKneeDegrees:range('rightKnee'),rootRelativeLeftAnkleY:range('leftAnkleY'),rootRelativeRightAnkleY:range('rightAnkleY')});
}
const report={note:'Single selected trials; existing ASF importer assumptions retained. Root-relative ankle height is not ground clearance. Knee ranges are reference observations, not targets or normative limits. Sampling rate is the existing 120Hz assumption. No shuffle/cut or ball-contact annotation.',clips:result};
const output=process.argv[3]||'/tmp/fi-reference-observations.json';fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
