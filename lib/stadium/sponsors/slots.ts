/**
 * Stadium sponsor slots (Nov 12 2026, phase 4 of the west stadium; concept: scratchpad west-stadium/index.html "Where sponsors
 * appear"). Pure data and rules, shared by the game (atlas + surfaces), the read API, the admin upload checks and the tests.
 *
 * Rules (owner): fixed pictures only. No links, no tracking, no calls to action. Every sponsor picture carries a small
 * "Sponsor" label, drawn into the atlas by the game (so an uploaded picture can never leave it out). Counts stay anonymous
 * totals (lib/analytics/sponsorEvents.ts stadium ids).
 */
export const SPONSOR_SLOTS=['board','screen','gate','fascia','flag','centre'] as const;
export type SponsorSlot=typeof SPONSOR_SLOTS[number];

export type SlotSpec={
 /** Shown in /admin. */
 name:string;
 /** What it is, for /admin. */
 note:string;
 /** Width / height of the picture. */
 aspect:number;
 /** Atlas cell size in pixels (desktop scale; phones may halve it). Its ratio equals `aspect` within 1%. */
 cell:[number,number];
 /** The smallest upload accepted, in pixels (width; height follows the aspect). */
 minWidth:number;
 /** How many different sponsors this slot shows at once or in turn (more active rows than this are ignored, newest kept). */
 maxSponsors:number;
 /** Rotate through the sponsors every this many ms (boards and big screen only). */
 rotateMs:number|null;
 /** The "Sponsor" label is readable here (false only where it would be a smudge of pixels). */
 label:boolean;
};

export const SLOT_SPECS:Record<SponsorSlot,SlotSpec>={
 board:{name:'Pitchside boards',note:'The ring of 16 LED boards round the pitch. Pictures scroll slowly and take turns.',aspect:8,cell:[496,62],minWidth:800,maxSponsors:8,rotateMs:9000,label:true},
 screen:{name:'Big screen',note:'South end. Shows a sponsor card between matches, in turn.',aspect:16/9,cell:[384,216],minWidth:640,maxSponsors:4,rotateMs:12000,label:true},
 gate:{name:'Gate arch',note:'The naming partner over the east entrance.',aspect:4,cell:[496,124],minWidth:800,maxSponsors:1,rotateMs:null,label:true},
 fascia:{name:'Roof fascia',note:'Banners along the roof of the two long stands, seen from far away.',aspect:8,cell:[640,80],minWidth:800,maxSponsors:2,rotateMs:null,label:true},
 flag:{name:'Plaza flags',note:'Vertical banners under the national flags lining Stadium Plaza on the walk in. Shown only while a flag sponsor is booked.',aspect:2/3,cell:[128,192],minWidth:200,maxSponsors:3,rotateMs:null,label:true},
 centre:{name:'Centre circle',note:'A round logo painted on the grass. Keep the art inside the circle.',aspect:1,cell:[256,256],minWidth:400,maxSponsors:1,rotateMs:null,label:true},
};

/** Upload limits (/admin): png, webp or jpg, at most 1 MB, the slot's aspect within 6%. */
export const SPONSOR_IMAGE_TYPES={'image/png':'png','image/webp':'webp','image/jpeg':'jpg'} as const;
export type SponsorImageType=keyof typeof SPONSOR_IMAGE_TYPES;
export const SPONSOR_MAX_BYTES=1_000_000;
export const SPONSOR_ASPECT_TOLERANCE=0.06;
export const SPONSOR_LABEL_MAX=60;
export const SPONSOR_BUCKET='stadium-sponsors';

export const isSponsorSlot=(s:unknown):s is SponsorSlot=>typeof s==='string'&&(SPONSOR_SLOTS as readonly string[]).includes(s);

export type ImageCheck={ok:true}|{ok:false;error:'type'|'size'|'empty'|'dimensions'|'aspect'|'small';message:string};
/** The upload rules for one picture: type, byte size, decoded dimensions and the slot's aspect. */
export function checkSponsorImage(slot:SponsorSlot,type:string,bytes:number,width:number,height:number):ImageCheck{
 const spec=SLOT_SPECS[slot];
 if(!(type in SPONSOR_IMAGE_TYPES))return {ok:false,error:'type',message:'Use a PNG, WebP or JPG picture.'};
 if(!(bytes>0))return {ok:false,error:'empty',message:'The file is empty.'};
 if(bytes>SPONSOR_MAX_BYTES)return {ok:false,error:'size',message:`The file is ${(bytes/1e6).toFixed(1)} MB; the limit is 1 MB.`};
 if(!(width>0&&height>0))return {ok:false,error:'dimensions',message:'The picture could not be read.'};
 const a=width/height;
 if(Math.abs(a/spec.aspect-1)>SPONSOR_ASPECT_TOLERANCE)return {ok:false,error:'aspect',message:`${spec.name} need a ${aspectText(spec.aspect)} picture; this one is ${width} × ${height}.`};
 if(width<spec.minWidth)return {ok:false,error:'small',message:`At least ${spec.minWidth} px wide for ${spec.name.toLowerCase()}; this one is ${width} px.`};
 return {ok:true};
}
export function aspectText(a:number):string{
 if(Math.abs(a-16/9)<.01)return '16:9';if(Math.abs(a-2/3)<.01)return '2:3';
 return Number.isInteger(a)?`${a}:1`:a.toFixed(2)+':1';
}

/** One active sponsor row as the game receives it (GET /api/stadium-sponsors). */
export type SponsorEntry={id:string;slot:SponsorSlot;label:string;image:string;position:number};
export type SponsorFeed={placeholder:boolean;generatedAt:string;entries:SponsorEntry[]};

/** A stored row (the stadium_sponsors table). Dates are Pacific days, YYYY-MM-DD; ends_on null = no end. */
export type SponsorRow={id:string;slot:SponsorSlot;label:string;image_path:string;starts_on:string;ends_on:string|null;position:number;created_at?:string};
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/;
export const validDay=(d:unknown):d is string=>typeof d==='string'&&DAY_RE.test(d)&&!Number.isNaN(Date.parse(d+'T00:00:00Z'));
/** Active on `today` (inclusive both ends). The SQL policy is the same rule (tests/stadium-sponsors.cjs checks both). */
export const isActiveOn=(r:{starts_on:string;ends_on:string|null},today:string)=>r.starts_on<=today&&(r.ends_on===null||r.ends_on>=today);

/** The Pacific day (the admin's day everywhere else, lib/analytics/day.ts). */
export function pacificToday(nowMs:number):string{
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(nowMs));
}

/**
 * Which pictures each slot shows. Active rows only, per slot ordered by `position` then newest first, cut to `maxSponsors`.
 * A slot with no sponsor shows the Futbol Island placeholders (placeholders.ts), so the game works before the migration.
 */
export type SlotPick={slot:SponsorSlot;sponsor:SponsorEntry|null;placeholder:number|null};
export function pickSlots(entries:readonly SponsorEntry[],placeholderCount:(slot:SponsorSlot)=>number):Record<SponsorSlot,SlotPick[]>{
 const out={} as Record<SponsorSlot,SlotPick[]>;
 for(const slot of SPONSOR_SLOTS){
  const mine=entries.filter(e=>e.slot===slot).sort((a,b)=>a.position-b.position).slice(0,SLOT_SPECS[slot].maxSponsors);
  out[slot]=mine.length?mine.map(s=>({slot,sponsor:s,placeholder:null})):Array.from({length:Math.max(1,placeholderCount(slot))},(_,i)=>({slot,sponsor:null,placeholder:i}));
 }
 return out;
}

/** Board panel i at rotation step k shows pick (i + k) mod n: neighbours differ whenever there are two or more pictures. */
export const boardPick=(panel:number,step:number,n:number)=>n>0?((panel+step)%n+n)%n:0;
/** The rotation step at time t for a slot (0 for slots that do not rotate). */
export const rotationStep=(slot:SponsorSlot,tMs:number)=>{const r=SLOT_SPECS[slot].rotateMs;return r?Math.floor(Math.max(0,tMs)/r):0;};

/** Sanitise a feed from the network (the game never trusts it): known slots, short labels, https or same-origin images only. */
export function parseFeed(raw:unknown):SponsorFeed{
 const r=raw as Partial<SponsorFeed>|null;
 const entries:SponsorEntry[]=[];
 if(r&&Array.isArray(r.entries))for(const e of r.entries.slice(0,64)){
  if(!e||!isSponsorSlot(e.slot)||typeof e.image!=='string'||typeof e.id!=='string')continue;
  if(!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\//.test(e.image)&&!/^\/[a-z0-9/_.-]+$/i.test(e.image))continue;
  entries.push({id:e.id.slice(0,40),slot:e.slot,label:String(e.label??'').slice(0,SPONSOR_LABEL_MAX),image:e.image,position:Number.isFinite(e.position)?Number(e.position):0});
 }
 return {placeholder:!!r?.placeholder||!entries.length,generatedAt:typeof r?.generatedAt==='string'?r.generatedAt:'',entries};
}
