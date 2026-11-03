import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {LearnGroupId} from './learnFeatures';
/**
 * The /learn page's pictures and clips (Nov 2 2026), resolved once at build time (the page is force-static).
 * Stills: public/learn/<imageKey>.webp. Clips: public/learn/video/<imageKey>.{webm,mp4}. Alt text and sizes: public/learn/manifest.json.
 * Everything is optional: a missing manifest, a missing still or a missing clip never breaks the page. A file only counts when it is
 * really on disk, so a manifest that lists a shot nobody committed yet still falls back cleanly. Without a still the page draws a
 * deterministic illustrated card in the feature's group colours (components/learn/LearnMedia.tsx).
 * Pure Node (fs, no env reads, no client code), like lib/site/lessons.ts.
 */
export type LearnImage={src:string;width:number;height:number;/** a smaller still for phones (<= 640px wide, 4:5 shots only) */m?:{src:string;width:number;height:number}};
export type LearnClip={webm?:string;mp4?:string;/** a smaller mp4 for narrow viewports: 1280px slides (<= 1280px), 720x900 4:5 clips (<= 640px) */mp4m?:string};
export type LearnAsset={key:string;alt?:string;image?:LearnImage;clip?:LearnClip;focus?:string};

/** Group colours (from the island palette: sea, pink, deep green, gold) and the plain glyph drawn on fallback art. */
export const LEARN_THEME:Record<LearnGroupId,{c1:string;c2:string;ink:string;glyph:LearnGlyph}>={
 learn:{c1:'#1d6b55',c2:'#4fa47a',ink:'#fff8e7',glyph:'pitch'},
 explore:{c1:'#2b53e5',c2:'#4fb0d9',ink:'#fff8e7',glyph:'compass'},
 play:{c1:'#d9692f',c2:'#e9c16b',ink:'#2a1a08',glyph:'ball'},
 together:{c1:'#c94f9f',c2:'#ef8fd0',ink:'#fff8e7',glyph:'friends'},
 collect:{c1:'#6a46b8',c2:'#a98be6',ink:'#fff8e7',glyph:'cards'},
 yours:{c1:'#c8394f',c2:'#f08a6b',ink:'#fff8e7',glyph:'shirt'},
 safe:{c1:'#1f6f78',c2:'#7cc7b4',ink:'#fff8e7',glyph:'shield'},
};
export type LearnGlyph='pitch'|'compass'|'ball'|'friends'|'cards'|'shirt'|'shield';

const PUB=path.join(process.cwd(),'public');
const exists=(rel:string)=>{try{return fs.statSync(path.join(PUB,rel)).isFile();}catch{return false;}};
/**
 * Cache-busting URL for a /learn still or clip (Nov 3 2026). next.config serves these files for a week under names a re-capture
 * keeps, so a browser that had the old file went on showing it (the owner still saw the long HUD bar in the hero after the
 * compact-bar re-record). `?v=` + 10 hex of the file's content hash gives every re-capture a new URL; hashed once per file.
 */
const vCache=new Map<string,string>();
/** Optional media origin, e.g. https://futbol-media.khoa0aohk.workers.dev (no trailing slash). */
const MEDIA_BASE=(process.env.LEARN_MEDIA_BASE||'').replace(/\/+$/,'');
export function learnUrl(src:string):string{
 let v=vCache.get(src);
 if(v===undefined){try{v=createHash('sha1').update(fs.readFileSync(path.join(PUB,src))).digest('hex').slice(0,10);}catch{v='';}vCache.set(src,v);}
 // Big clips can live on Cloudflare R2 (docs/learn-media-r2.md): with LEARN_MEDIA_BASE set, /learn/video/*.mp4 are served from there
 // (same path, same ?v=<hash>); unset = served by the site itself, exactly as before.
 const base=MEDIA_BASE&&/^\/learn\/video\/[a-z0-9_]+\.mp4$/.test(src)?MEDIA_BASE:'';
 return v?`${base}${src}?v=${v}`:`${base}${src}`;
}

/** Width and height from a WebP header (VP8 / VP8L / VP8X), so every <img> has its real size without a manifest. */
export function webpSize(buf:Buffer):{width:number;height:number}|null{
 if(buf.length<30||buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP')return null;
 const kind=buf.toString('ascii',12,16);
 if(kind==='VP8X')return {width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3)};
 if(kind==='VP8 ')return {width:buf.readUInt16LE(26)&0x3fff,height:buf.readUInt16LE(28)&0x3fff};
 if(kind==='VP8L'){const b=buf.readUInt32LE(21);return {width:1+(b&0x3fff),height:1+((b>>14)&0x3fff)};}
 return null;
}

type RawEntry={key?:string;imageKey?:string;id?:string;alt?:string;width?:number;height?:number;w?:number;h?:number};
/** The manifest may be an array of entries, {items|shots|entries:[…]}, or an object keyed by imageKey; anything else is ignored. */
function readManifest():Map<string,RawEntry>{
 const out=new Map<string,RawEntry>();
 let raw:unknown;
 try{raw=JSON.parse(fs.readFileSync(path.join(PUB,'learn/manifest.json'),'utf8'));}catch{return out;}
 const r=raw as Record<string,unknown>;
 const list=Array.isArray(raw)?raw:Array.isArray(r?.items)?r.items:Array.isArray(r?.shots)?r.shots:Array.isArray(r?.entries)?r.entries:null;
 if(list){for(const e of list as RawEntry[]){const k=e&&(e.imageKey??e.key??e.id);if(typeof k==='string')out.set(k,e);}return out;}
 if(r&&typeof r==='object')for(const [k,v] of Object.entries(r))if(v&&typeof v==='object'&&!Array.isArray(v))out.set(k,v as RawEntry);
 return out;
}

/**
 * The capture pass (Nov 2 2026) named its shots after what they show, not after the page's imageKeys. This maps a page imageKey
 * to the shot that really shows that feature (checked by eye against each still and its manifest alt text). Keys not listed here
 * use their own name; features with no matching shot keep the drawn card on purpose (live matches, graduation, bugs, beachcombing,
 * Konbini, quick challenges, news, jobs, Summit Kick, indoors, controls, costumes, jersey back, the safe group).
 */
export const LEARN_SHOT:Readonly<Record<string,string>>={
 learning_paths:'paths_screen',lesson_quiz:'lesson_field',path_stories:'stories_chapter',daily_warm_up:'quiz_question',
 reef_balls:'diving_reef',swim_dive:'animal_ride',fishing_fishbook:'fishing',history_museum:'museum',islanders_talk:'npc_chat',
 bubbles_banter:'npc_bubble',arcade:'arcade_room',keep_ups:'emotes',
 friends_party:'mp_party',friends_step_join:'mp_join',friends_kits:'mp_meet',friends_high_five:'mp_emotes',friends_ball_duet:'mp_ball',
 friends_ride:'mp_ride',card_binder:'player_cards',friends_step_start:'friend_step1',friends_step_code:'friend_step2',pop_up_books:'books',vending_machine:'vending',rides:'scooter_bike',
};

/**
 * The 4:5 re-captures (Nov 3 2026, owner: the upright 390x844 recordings sat skinny in a wide column). Recorded on a 600x750 CSS
 * px touch "device" at DPR 3, so they fill a phone's content width without stretching or cropping. Each shot key maps to its
 * `<key>_45` manifest entry: still public/learn/<key>_45.webp (1080x1350) + <key>_45_m.webp (720x900), clip
 * public/learn/video/<key>_45.mp4 (1080x1350) + <key>_45_m.mp4 (720x900, served to viewports <= 640px wide).
 * A missing `_45` entry or still falls back to the old shot.
 */
export const LEARN_45:Readonly<Record<string,string>>={
 town_overview:'town_overview_45',lesson_field:'lesson_field_45',diving_reef:'diving_reef_45',save_code:'save_code_45',
 mp_sidebyside:'mp_sidebyside_45',mp_join:'mp_join_45',friend_step1:'friend_step1_45',friend_step2:'friend_step2_45',
 // Nov 3 2026: the Explore chapter clip (swim the reef, kick a wall target to find a ball, a ball dropped from a Summit Isle mango tree)
 explore:'explore_45',
};

/** Crop focus (CSS object-position) for shots whose subject is not in the middle; upright shots default to the middle. */
const LEARN_FOCUS:Readonly<Record<string,string>>={kit_shop:'50% 22%',paths_screen:'50% 20%',save_code:'50% 42%',fishing:'50% 62%'};

let cache:Map<string,LearnAsset>|null=null;
/** The asset for one imageKey (always an object; `image` / `clip` only when the files exist). */
export function learnAsset(pageKey:string):LearnAsset{
 if(!cache)cache=new Map();
 const hit=cache.get(pageKey);if(hit)return hit;
 const base=LEARN_SHOT[pageKey]??pageKey,k45=LEARN_45[base];
 const key=k45&&readManifestOnce().has(k45)&&exists(`learn/${k45}.webp`)?k45:base;
 const m=readManifestOnce().get(key);
 const a:LearnAsset={key:pageKey,alt:typeof m?.alt==='string'&&m.alt.trim()?m.alt.trim():undefined,focus:LEARN_FOCUS[key]};
 const still=`learn/${key}.webp`;
 if(/^[a-z0-9_]+$/.test(key)&&exists(still)){
  let size:{width:number;height:number}|null=null;
  const w=m?.width??m?.w,h=m?.height??m?.h;
  if(typeof w==='number'&&typeof h==='number'&&w>0&&h>0)size={width:w,height:h};
  else{try{const fd=fs.openSync(path.join(PUB,still),'r');const b=Buffer.alloc(32);fs.readSync(fd,b,0,32,0);fs.closeSync(fd);size=webpSize(b);}catch{size=null;}}
  a.image={src:'/'+still,...(size??{width:1600,height:1000})};
  if(key===k45&&exists(`learn/${key}_m.webp`))a.image.m={src:`/learn/${key}_m.webp`,width:720,height:900};
 }
 const webm=`learn/video/${key}.webm`,mp4=`learn/video/${key}.mp4`;
 const clip:LearnClip={};if(exists(webm))clip.webm='/'+webm;if(exists(mp4))clip.mp4='/'+mp4;
 // A 16:9 chapter clip (e.g. fuel_konbini, Nov 3 2026) may ship a 1280px <key>_m.mp4 for viewports <= 1280px, like the slides.
 if(clip.mp4&&exists(`learn/video/${key}_m.mp4`))clip.mp4m=`/learn/video/${key}_m.mp4`;
 if(clip.webm||clip.mp4)a.clip=clip;
 cache.set(pageKey,a);
 return a;
}
/**
 * A "See it in action" carousel card's media (Nov 3 2026): manifest entry `wide_<key>` + poster public/learn/wide_<key>.webp
 * (both required, else null = the card is skipped), clip from the entry's own `video` paths or public/learn/video/wide_<key>.*
 * or public/learn/wide_<key>.* (whichever exist on disk). Nov 3 re-capture: a 1280x720 public/learn/video/wide_<key>_m.mp4
 * (`clip.mp4m`) is served to viewports <= 1280px wide through <source media>, like the slides.
 */
export function learnWideAsset(key:string):LearnAsset|null{
 if(!/^[a-z0-9_]+$/.test(key))return null;
 const a=prefixedAsset(`wide_${key}`);
 if(a?.clip?.mp4&&exists(`learn/video/wide_${key}_m.mp4`))a.clip.mp4m=`/learn/video/wide_${key}_m.mp4`;
 return a;
}
/**
 * An "Even more to explore" slide's media (Nov 3 2026): manifest entry `slide_<key>` + poster public/learn/slide_<key>.webp (both
 * required, else null = no slide), the clip as for the carousel, plus an optional 1280px public/learn/video/slide_<key>_m.mp4
 * (`clip.mp4m`) served to viewports <= 1280px wide through <source media>, so a phone never fetches the 1920px file.
 */
export function learnSlideAsset(key:string):LearnAsset|null{
 if(!/^[a-z0-9_]+$/.test(key))return null;
 const a=prefixedAsset(`slide_${key}`);
 if(a?.clip?.mp4&&exists(`learn/video/slide_${key}_m.mp4`))a.clip.mp4m=`/learn/video/slide_${key}_m.mp4`;
 return a;
}

/** One size of the /learn montage: its poster and its H.264 clip. */
export type LearnMontageSize={key:string;image:LearnImage;mp4?:string};
/**
 * The full-bleed montage after the /learn hero (Nov 3 2026): manifest entries `montage_s` (854), `montage_m` (1280) and `montage`
 * (1920) and the optional `montage_xl` (2560, for large and retina screens), each with its poster (public/learn/<key>.webp) and clip (the entry's video.mp4). The 1920 entry and its poster are
 * required (else null = no montage section); a missing smaller size just drops out of the ladder. Sizes are smallest first.
 */
export function learnMontage():{alt?:string;duration?:number;sizes:LearnMontageSize[]}|null{
 const man=readManifestOnce();
 const sizes:LearnMontageSize[]=[];let alt:string|undefined,duration:number|undefined;
 for(const key of ['montage_s','montage_m','montage','montage_xl']){
  const m=man.get(key) as (RawEntry&{video?:{mp4?:unknown;duration?:unknown}})|undefined;
  const still=`learn/${key}.webp`;
  if(!m||!exists(still))continue;
  const w=m.width??m.w,h=m.height??m.h,v=m.video?.mp4,d=m.video?.duration;
  const mp4=typeof v==='string'&&/^\/learn\/[a-z0-9_/]+\.mp4$/.test(v)&&exists(v.slice(1))?v:undefined;
  sizes.push({key,image:{src:'/'+still,...(typeof w==='number'&&typeof h==='number'&&w>0&&h>0?{width:w,height:h}:{width:1920,height:1080})},mp4});
  if(typeof m.alt==='string'&&m.alt.trim())alt=m.alt.trim();
  if(typeof d==='number'&&d>0)duration=d;
 }
 if(!sizes.some(x=>x.key==='montage'))return null;
 return {alt,duration,sizes};
}

function prefixedAsset(id:string):LearnAsset|null{
 const m=readManifestOnce().get(id) as (RawEntry&{video?:{mp4?:unknown;webm?:unknown}})|undefined;
 const still=`learn/${id}.webp`;
 if(!m||!exists(still))return null;
 const w=m.width??m.w,h=m.height??m.h;
 const image:LearnImage={src:'/'+still,...(typeof w==='number'&&typeof h==='number'&&w>0&&h>0?{width:w,height:h}:{width:1600,height:900})};
 const pick=(ext:'mp4'|'webm')=>{const v=m.video?.[ext];
  const c=[typeof v==='string'&&/^\/learn\/[a-z0-9_/]+\.(mp4|webm)$/.test(v)?v.slice(1):'',`learn/video/${id}.${ext}`,`learn/${id}.${ext}`];
  const hit=c.find(x=>x&&exists(x));return hit?'/'+hit:undefined;};
 const clip:LearnClip={mp4:pick('mp4'),webm:pick('webm')};
 return {key:id,alt:typeof m.alt==='string'&&m.alt.trim()?m.alt.trim():undefined,image,clip:clip.mp4||clip.webm?clip:undefined};
}

let manifest:Map<string,RawEntry>|null=null;
const readManifestOnce=()=>manifest??(manifest=readManifest());

/** A small stable hash (FNV-1a) so each fallback card gets its own angle and pattern, the same on every build. */
export function learnHash(s:string):number{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;}
