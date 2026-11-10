#!/usr/bin/env node
/**
 * lib/site/cardPlays.generated.json (Nov 10 2026, SEO): the title and theme of each player's iconic-play film, read from the
 * film sources (lib/plays/riso/registry.ts → lib/plays/riso/<file>.ts, `title:'…',theme:'…'`) so the card reading pages
 * (/cards/<n>) can name the play and the football idea it teaches without importing 400 film modules. Words only, copied as
 * written; nothing is invented. Re-run after adding or renaming a film:  node scripts/gen-card-plays.mjs
 * `--check` exits 1 when the file is out of date (tests/seo-discovery.cjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),DIR=path.join(ROOT,'lib/plays/riso'),OUT=path.join(ROOT,'lib/site/cardPlays.generated.json');
const lit=k=>new RegExp(`\\b${k}:('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`);
const unq=s=>s.slice(1,-1).replace(/\\(['"\\])/g,'$1').replace(/\s+/g,' ').trim();
export function build(){
 const reg=fs.readFileSync(path.join(DIR,'registry.ts'),'utf8'),pending=new Set([...(reg.match(/const PENDING=new Set<string>\(\[(.*?)\]\)/s)?.[1]??'').matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map(m=>(m[1]??m[2]).replace(/\\(['"\\])/g,'$1')));
 const out={};
 for(const m of reg.matchAll(/^ ('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"):\(\)=>import\('\.\/([a-z0-9-]+)'\),/gm)){
  const name=unq(m[1]);if(pending.has(name))continue;
  const src=fs.readFileSync(path.join(DIR,m[2]+'.ts'),'utf8'),t=src.match(lit('title')),th=src.match(lit('theme'));
  if(t&&th)out[name]={title:unq(t[1]),theme:unq(th[1])};
 }
 return JSON.stringify(Object.fromEntries(Object.entries(out).sort(([a],[b])=>a<b?-1:a>b?1:0)),null,1)+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const next=build(),cur=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8'):'';
 if(process.argv.includes('--check')){if(cur!==next){console.error('cardPlays.generated.json is out of date: run node scripts/gen-card-plays.mjs');process.exit(1);}console.log('card plays: up to date');}
 else{fs.writeFileSync(OUT,next);console.log(`card plays: ${Object.keys(JSON.parse(next)).length} written`);}
}
