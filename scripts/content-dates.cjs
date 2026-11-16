#!/usr/bin/env node
/**
 * "Last checked" dates for the public reading pages (SEO content pass, Nov 15 2026) -> lib/site/contentDates.json.
 * For each content family, the date is the newest real check date its data files state in a comment ("SOURCES (checked Nov 10
 * 2026)", "Re-checked Nov 15 2026", "checked on 14 Nov 2026"); a file that states none counts its last git commit date instead.
 * Never "today": a rebuild never fakes freshness. In a shallow clone (Vercel) git dates are not trusted, so a file with no stated
 * date keeps the date already in the JSON. Cards and fish also carry a per-entry `checked` date, which the pages prefer.
 * Usage: node scripts/content-dates.cjs [--check]   (--check: exit 1 if the JSON is out of date, write nothing)
 */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..'),OUT=path.join(root,'lib/site/contentDates.json');
const FAMILIES={
 rules:['lib/site/rules.ts'],terms:['lib/site/terms.ts'],positions:['lib/site/positions.ts'],formations:['lib/site/formations.ts'],
 drills:['lib/site/drills.ts','lib/site/drillsA.ts','lib/site/drillsB.ts','lib/site/drillsC.ts','lib/site/drillsD.ts','lib/site/drillGuides.ts'],
 plans:['lib/site/plans.ts'],sizes:['lib/site/sizes.ts'],cards:['lib/site/cardNotes.ts','lib/site/cardNotes.json'],fish:['lib/site/fishNotes.ts','lib/site/fishNotes.json'],
 exhibits:['lib/site/exhibits.ts'],
};
const MON={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
const iso=(y,m,d)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
function stated(src){/* dates on comment lines that say "checked" */
 let best='';
 for(const line of src.split('\n')){if(!/^\s*(\/\/|\/?\*)/.test(line)||!/checked/i.test(line))continue;
  for(const m of line.matchAll(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (20\d\d)\b/g)){const d=iso(m[3],MON[m[2].toLowerCase()],m[1]);if(d>best)best=d;}
  for(const m of line.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (20\d\d)\b/g)){const d=iso(m[3],MON[m[1].toLowerCase()],m[2]);if(d>best)best=d;}}
 return best;}
const git=(...a)=>{try{return execFileSync('git',a,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return '';}};
const shallow=git('rev-parse','--is-shallow-repository')!=='false';
const old=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):{families:{}};
const families={};
for(const [k,files] of Object.entries(FAMILIES)){let date='',from='';
 for(const f of files){const src=fs.readFileSync(path.join(root,f),'utf8'),s=stated(src);
  const d=s||(shallow?'':git('log','-1','--format=%cs','--',f));
  if(d&&d>date){date=d;from=s?'stated':'git';}}
 if(!date&&old.families[k])({date,from}=old.families[k]);
 if(!date)throw new Error(`content-dates: no date for ${k}`);
 families[k]={date,from};}
const out=JSON.stringify({note:'Written by scripts/content-dates.cjs. Do not edit by hand.',families},null,1)+'\n';
if(process.argv.includes('--check')){const same=fs.existsSync(OUT)&&fs.readFileSync(OUT,'utf8')===out;if(!same){console.error('lib/site/contentDates.json is out of date: run node scripts/content-dates.cjs');process.exit(1);}}
else fs.writeFileSync(OUT,out);
