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
export type LearnImage={src:string;width:number;height:number};
export type LearnClip={webm?:string;mp4?:string};
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
 * Konbini, quick challenges, news, jobs, Summit Kick, two friend steps, indoors, controls, costumes, jersey back, the safe group).
 */
export const LEARN_SHOT:Readonly<Record<string,string>>={
 learning_paths:'paths_screen',lesson_quiz:'lesson_field',path_stories:'stories_chapter',daily_warm_up:'quiz_question',
 reef_balls:'diving_reef',swim_dive:'animal_ride',fishing_fishbook:'fishing',history_museum:'museum',islanders_talk:'npc_chat',
 bubbles_banter:'npc_bubble',arcade:'arcade_room',keep_ups:'emotes',
 friends_party:'mp_party',friends_step_join:'mp_join',friends_kits:'mp_meet',friends_high_five:'mp_emotes',friends_ball_duet:'mp_ball',
 friends_ride:'mp_ride',card_binder:'player_cards',pop_up_books:'books',vending_machine:'vending',rides:'scooter_bike',
};

/** Crop focus (CSS object-position) for shots whose subject is not in the middle; upright shots default to the middle. */
const LEARN_FOCUS:Readonly<Record<string,string>>={kit_shop:'50% 22%',paths_screen:'50% 20%',save_code:'50% 42%',fishing:'50% 62%'};

let cache:Map<string,LearnAsset>|null=null;
/** The asset for one imageKey (always an object; `image` / `clip` only when the files exist). */
export function learnAsset(pageKey:string):LearnAsset{
 if(!cache)cache=new Map();
 const hit=cache.get(pageKey);if(hit)return hit;
 const key=LEARN_SHOT[pageKey]??pageKey;
 const m=readManifestOnce().get(key);
 const a:LearnAsset={key:pageKey,alt:typeof m?.alt==='string'&&m.alt.trim()?m.alt.trim():undefined,focus:LEARN_FOCUS[key]};
 const still=`learn/${key}.webp`;
 if(/^[a-z0-9_]+$/.test(key)&&exists(still)){
  let size:{width:number;height:number}|null=null;
  const w=m?.width??m?.w,h=m?.height??m?.h;
  if(typeof w==='number'&&typeof h==='number'&&w>0&&h>0)size={width:w,height:h};
  else{try{const fd=fs.openSync(path.join(PUB,still),'r');const b=Buffer.alloc(32);fs.readSync(fd,b,0,32,0);fs.closeSync(fd);size=webpSize(b);}catch{size=null;}}
  a.image={src:'/'+still,...(size??{width:1600,height:1000})};
 }
 const webm=`learn/video/${key}.webm`,mp4=`learn/video/${key}.mp4`;
 const clip:LearnClip={};if(exists(webm))clip.webm='/'+webm;if(exists(mp4))clip.mp4='/'+mp4;
 if(clip.webm||clip.mp4)a.clip=clip;
 cache.set(pageKey,a);
 return a;
}
let manifest:Map<string,RawEntry>|null=null;
const readManifestOnce=()=>manifest??(manifest=readManifest());

/** A small stable hash (FNV-1a) so each fallback card gets its own angle and pattern, the same on every build. */
export function learnHash(s:string):number{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;}
