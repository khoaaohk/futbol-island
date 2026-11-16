/**
 * The admin SEO tab's data (Nov 15 2026): the committed Search Console snapshot data/seo/snapshot.json (docs/seo-snapshot.md).
 * Types here; the checks and the "What's happening" lines live in snapshotSchema.mjs so the CLI and the tests share them.
 * Safe for client files; the server-only reader is loadSnapshot.ts (fs), called by app/admin/page.tsx AFTER the admin session check.
 */
import {validateSnapshot as validateJs,summarize as summarizeJs,isQuickWin as isQuickWinJs,QUICK_WIN as QW} from './snapshotSchema.mjs';

export type SeoWindowCore={clicks:number;impressions:number;ctr:number;position:number|null};
export type SeoWindow=SeoWindowCore&{queries?:number;pages?:number;prev?:SeoWindowCore|null};
export type SeoRow={clicks:number|null;impressions:number;position:number};
export type SeoSnapshot={
 schemaVersion:1;site?:string;asOf:string;gscDataThrough:string;
 windows:{d7:SeoWindow|null;d28:SeoWindow|null};
 daily:{day:string;clicks:number;impressions:number}[];
 topQueries:(SeoRow&{query:string})[];
 topPages:(SeoRow&{path:string})[];
 index:{asOf:string;indexed:number;notIndexed:number;previous?:{asOf:string;indexed:number;notIndexed:number}|null;
  reasons:{reason:string;pages:number;validation:string|null;examples?:string[]}[]};
 sitemaps:{path:string;lastRead:string|null;status:string;discovered:number}[];
 workLog:{day:string;requested:string[];alreadyIndexed:number;note?:string}[];
 history:{day:string;clicks:number;impressions:number;ctr?:number|null;position:number|null;indexed?:number|null}[];
};
export type SeoLoad={status:'ok';data:SeoSnapshot;summary:string[];warnings:string[]}|{status:'missing'}|{status:'invalid';errors:string[]};

export const QUICK_WIN:{from:number;to:number}=QW;
export const isQuickWin=(position:number|null|undefined):boolean=>isQuickWinJs(position);
export const validateSnapshot=(x:unknown):{errors:string[];warnings:string[]}=>validateJs(x);
export const summarize=(s:SeoSnapshot):string[]=>summarizeJs(s);

/** Parse + check a snapshot's text: never throws. */
export function parseSnapshot(text:string|null):SeoLoad{
 if(text===null)return {status:'missing'};
 let x:unknown;
 try{x=JSON.parse(text);}catch(e){return {status:'invalid',errors:['not valid JSON: '+(e instanceof Error?e.message:String(e))]};}
 const {errors,warnings}=validateSnapshot(x);
 if(errors.length)return {status:'invalid',errors};
 const data=x as SeoSnapshot;
 return {status:'ok',data,summary:summarize(data),warnings};
}

export const SNAPSHOT_PATH='data/seo/snapshot.json';
