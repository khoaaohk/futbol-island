#!/usr/bin/env node
/**
 * IndexNow submission (Nov 10 2026, docs/seo/DISCOVERY.md): tells Bing, Yandex, Seznam and Naver which URLs are new or changed
 * (Bing's index also feeds DuckDuckGo, Yahoo, Ecosia and Copilot). No account: the proof of ownership is the key file
 * public/<key>.txt, served at https://futbolisland.app/<key>.txt.
 *
 *   node scripts/indexnow.mjs                              every URL of the live sitemap
 *   node scripts/indexnow.mjs --changed-since 2026-11-08   only URLs whose <lastmod> is on or after that day
 *   node scripts/indexnow.mjs --dry-run                    read and count, send nothing
 *   --sitemap <url|file>   another sitemap (a local file for tests)        --quiet-exit   exit 0 even when a batch fails
 *
 * Reads the LIVE sitemap, so run it AFTER the deploy is live. Before sending it checks that the key file answers on the live
 * site with the key (IndexNow rejects a submission whose key file is missing: HTTP 403). Prints a short summary only.
 * IndexNow statuses: 200 OK, 202 accepted (key check pending), 400 bad request, 403 key not valid, 422 URLs not of this host,
 * 429 too many requests.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const HOST='futbolisland.app';
export const ENDPOINT='https://api.indexnow.org/indexnow';
export const MAX_BATCH=10000;
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');

/** The key is the one public/<32 hex>.txt file whose content is its own name. */
export function readKey(publicDir=path.join(ROOT,'public')){
 const found=fs.readdirSync(publicDir).filter(f=>/^[0-9a-f]{32}\.txt$/.test(f)).filter(f=>fs.readFileSync(path.join(publicDir,f),'utf8').trim()===f.slice(0,32));
 if(found.length!==1)throw new Error(`expected exactly one IndexNow key file in public/, found ${found.length}`);
 return found[0].slice(0,32);
}
/** <url><loc>…</loc><lastmod>…</lastmod></url> pairs of a sitemap (lastmod may be missing). */
export function parseSitemap(xml){
 const out=[];
 for(const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)){
  const loc=m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/),mod=m[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/);
  if(loc)out.push({url:loc[1].replace(/&amp;/g,'&'),lastmod:mod?mod[1]:null});
 }
 return out;
}
/** Only this host's https URLs; with `since` (YYYY-MM-DD), only entries whose lastmod day is on or after it. */
export function selectUrls(entries,{since=null,host=HOST}={}){
 const seen=new Set();
 return entries.filter(e=>{
  let u;try{u=new URL(e.url);}catch{return false;}
  if(u.protocol!=='https:'||u.hostname!==host||seen.has(e.url))return false;
  if(since&&!(e.lastmod&&e.lastmod.slice(0,10)>=since))return false;
  seen.add(e.url);return true;
 }).map(e=>e.url);
}
export const batches=(urls,size=MAX_BATCH)=>Array.from({length:Math.ceil(urls.length/size)},(_,i)=>urls.slice(i*size,(i+1)*size));
export const payload=(key,urlList,host=HOST)=>({host,key,keyLocation:`https://${host}/${key}.txt`,urlList});

async function main(argv){
 const arg=n=>{const i=argv.indexOf(n);return i<0?null:argv[i+1]??'';};
 const dry=argv.includes('--dry-run'),since=arg('--changed-since'),src=arg('--sitemap')||`https://${HOST}/sitemap.xml`;
 if(since!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(since)){console.error('indexnow: --changed-since needs a date like 2026-11-08');return 2;}
 const key=readKey();
 const xml=/^https?:/.test(src)?await fetch(src).then(r=>{if(!r.ok)throw new Error(`sitemap HTTP ${r.status}`);return r.text();}):fs.readFileSync(src,'utf8');
 const all=parseSitemap(xml),urls=selectUrls(all,{since});
 const head=`indexnow: ${urls.length} of ${all.length} sitemap URLs${since?` changed since ${since}`:''}, key file /${key}.txt`;
 if(dry){console.log(`${head}; dry run, nothing sent (${batches(urls).length} batch${batches(urls).length===1?'':'es'}).`);return 0;}
 if(!urls.length){console.log(`${head}; nothing to send.`);return 0;}
 const live=await fetch(`https://${HOST}/${key}.txt`).then(async r=>r.ok&&(await r.text()).trim()===key).catch(()=>false);
 if(!live){console.error(`${head}; NOT sent: https://${HOST}/${key}.txt does not answer with the key yet (deploy first).`);return 1;}
 const statuses=[];
 for(const list of batches(urls)){
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify(payload(key,list))});
  statuses.push(r.status);
 }
 const ok=statuses.every(s=>s===200||s===202);
 console.log(`${head}; sent in ${statuses.length} batch${statuses.length===1?'':'es'}: HTTP ${statuses.join(', ')} (${ok?'accepted':'FAILED'}).`);
 return ok||argv.includes('--quiet-exit')?0:1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main(process.argv.slice(2)).then(c=>process.exit(c),e=>{console.error('indexnow: '+(e&&e.message||e));process.exit(1);});
