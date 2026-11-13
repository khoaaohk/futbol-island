/**
 * /admin stadium sponsors (Nov 12 2026): the logic behind app/api/admin/stadium-sponsors/route.ts, which checks the admin
 * session and same origin first. Here: list every row, upload one picture to a slot with its dates, remove a row (and its file).
 * Every upload is checked from its BYTES (imageSize.ts): png / webp / jpg only, at most 1 MB, the slot's aspect within 6%, a
 * minimum width. The label is the sponsor's name for /admin only (the game shows the word "Sponsor", never a name or a link).
 */
import {randomUUID} from 'node:crypto';
import {imageInfo} from './imageSize';
import {SLOT_SPECS,SPONSOR_IMAGE_TYPES,SPONSOR_LABEL_MAX,SPONSOR_MAX_BYTES,checkSponsorImage,isActiveOn,isSponsorSlot,pacificToday,validDay,type SponsorRow} from './slots';
import type {SponsorStore} from './store';

export type AdminAnswer={status:number;body:Record<string,unknown>};
const err=(status:number,error:string,message?:string):AdminAnswer=>({status,body:{ok:false,error,...(message?{message}:{})}});
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The label: plain text, 1–60 characters, no web address (no links of any kind). */
export function cleanLabel(raw:unknown):string|null{
 if(typeof raw!=='string')return null;
 const s=raw.replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').trim();
 if(!s||s.length>SPONSOR_LABEL_MAX)return null;
 if(/https?:|www\.|\.[a-z]{2,6}(\/|$)/i.test(s))return null;
 return s;
}

export type UploadInput={slot:unknown;label:unknown;starts_on:unknown;ends_on:unknown;position?:unknown;file:{type:string;size:number;bytes:Uint8Array}|null};

export async function adminList(store:SponsorStore|null,nowMs=Date.now()):Promise<AdminAnswer>{
 const slots=Object.fromEntries(Object.entries(SLOT_SPECS).map(([k,v])=>[k,{name:v.name,note:v.note,aspect:v.aspect,minWidth:v.minWidth,maxSponsors:v.maxSponsors}]));
 const limits={maxBytes:SPONSOR_MAX_BYTES,types:Object.keys(SPONSOR_IMAGE_TYPES)};
 if(!store)return {status:200,body:{ok:true,status:'unconfigured',rows:[],slots,limits,today:pacificToday(nowMs)}};
 const r=await store.listAll(),today=pacificToday(nowMs);
 return {status:200,body:{ok:true,status:r.status,today,slots,limits,rows:r.rows.map(row=>({...row,url:store.publicUrl(row.image_path),active:isActiveOn(row,today)}))}};
}

export async function adminUpload(store:SponsorStore|null,input:UploadInput,nowMs=Date.now()):Promise<AdminAnswer>{
 if(!store)return err(503,'unconfigured','No database is set up on this server.');
 if(!isSponsorSlot(input.slot))return err(400,'slot','Pick a slot.');
 const label=cleanLabel(input.label);if(!label)return err(400,'label','Give the sponsor a name (plain text, up to 60 characters, no web address).');
 const starts=input.starts_on===''||input.starts_on==null?pacificToday(nowMs):input.starts_on;
 const ends=input.ends_on===''||input.ends_on==null?null:input.ends_on;
 if(!validDay(starts)||(ends!==null&&!validDay(ends)))return err(400,'dates','Dates must be real days.');
 if(ends!==null&&ends<starts)return err(400,'dates','The end date is before the start date.');
 const position=input.position===''||input.position==null?0:Number(input.position);
 if(!Number.isInteger(position)||position<0||position>99)return err(400,'position','Order must be a whole number from 0 to 99.');
 const f=input.file;if(!f)return err(400,'file','Choose a picture.');
 if(f.size>SPONSOR_MAX_BYTES||f.bytes.length>SPONSOR_MAX_BYTES)return err(413,'size','The file is over 1 MB.');
 const info=imageInfo(f.bytes);
 if(!info)return err(400,'type','Use a PNG, WebP or JPG picture.');
 if(f.type&&f.type!==info.type)return err(400,'type','The file is not the kind of picture its name says.');
 const check=checkSponsorImage(input.slot,info.type,f.bytes.length,info.width,info.height);
 if(!check.ok)return err(400,check.error,check.message);
 const path=`${input.slot}/${randomUUID()}.${SPONSOR_IMAGE_TYPES[info.type]}`;
 if(!await store.upload(path,f.bytes,info.type))return err(502,'storage','The picture could not be stored (has the migration been run?).');
 const row=await store.insert({slot:input.slot,label,image_path:path,starts_on:starts,ends_on:ends,position});
 if(!row){await store.removeObject(path);return err(502,'database','The row could not be saved (has the migration been run?).');}
 return {status:200,body:{ok:true,row:{...row,url:store.publicUrl(row.image_path),active:isActiveOn(row,pacificToday(nowMs))},width:info.width,height:info.height}};
}

export async function adminRemove(store:SponsorStore|null,id:unknown):Promise<AdminAnswer>{
 if(!store)return err(503,'unconfigured');
 if(typeof id!=='string'||!UUID_RE.test(id))return err(400,'id');
 const row:SponsorRow|null=await store.remove(id);if(!row)return err(404,'not-found');
 await store.removeObject(row.image_path);
 return {status:200,body:{ok:true,removed:row.id}};
}
