import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parseSnapshot,SNAPSHOT_PATH,type SeoLoad} from './snapshot';

/** Server only (Nov 15 2026): reads data/seo/snapshot.json from the deployment (traced into the /admin function by
 *  next.config.mjs outputFileTracingIncludes). Called by app/admin/page.tsx after the session check. Never throws. */
export async function loadSeoSnapshot():Promise<SeoLoad>{
 let text:string|null=null;
 try{text=await readFile(path.join(process.cwd(),SNAPSHOT_PATH),'utf8');}catch{text=null;}
 return parseSnapshot(text);
}
