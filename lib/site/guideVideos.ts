import fs from 'node:fs';
import path from 'node:path';
import {learnUrl} from './learnMedia';
import {SITE_URL} from './seo';
/**
 * Short game clips on guide pages (seo-extras, Nov 15 2026): only REAL clips already in public/learn/video (the /learn tour's
 * captures, 5 to 8 seconds, silent, 50 to 175 KB), each on the guide whose topic it actually shows. No new binaries. The clip
 * plays only when tapped (components/site/GuideVideo.tsx), with its still as the poster. Sizes and durations come from
 * public/learn/manifest.json; uploadDate is the day the clip was first committed (git log --diff-filter=A, checked by
 * tests/seo-video.cjs). Pure Node at build time (fs), like lib/site/learnMedia.ts.
 */
export type GuideVideoDef={key:string;path:string;name:string;description:string;uploadDate:string};
export const GUIDE_VIDEOS:readonly GuideVideoDef[]=[
 {key:'pass_puzzles',path:'/learn/passing-and-support',name:'Pass puzzle: draw a pass around the defender',
  description:'A Futbol Island pass puzzle: the player draws a pass around the defender to find a teammate in space, the same idea as the passing and support lessons.',uploadDate:'2026-11-02T18:03:08-08:00'},
 {key:'quiz_question',path:'/learn/soccer-quiz-for-kids',name:'Soccer quiz for kids: tap the best spot on the pitch',
  description:'A Futbol Island quiz question: the child answers by tapping the best spot for a teammate on the pitch, then the coach explains the answer.',uploadDate:'2026-11-02T18:03:08-08:00'},
 {key:'lesson_field',path:'/learn/lessons',name:'A football lesson on the pitch with moving players',
  description:'A Futbol Island lesson: a play unfolds on the pitch with moving players while the coach card says what to look for.',uploadDate:'2026-11-02T18:03:08-08:00'},
];
export type GuideVideo=GuideVideoDef&{poster:string;webm?:string;mp4?:string;width:number;height:number;seconds:number};
type ManifestEntry={file?:string;width?:number;height?:number;video?:{mp4?:string;webm?:string;width?:number;height?:number;duration?:number}};
const PUB=path.join(process.cwd(),'public');
let manifest:Record<string,ManifestEntry>|null=null;
const readManifest=()=>{if(!manifest){try{manifest=JSON.parse(fs.readFileSync(path.join(PUB,'learn/manifest.json'),'utf8'));}catch{manifest={};}}return manifest!;};
const onDisk=(rel:string)=>{try{return fs.statSync(path.join(PUB,rel)).isFile();}catch{return false;}};
/** The clip for a guide page, or null (no clip, or its files are missing: the page simply has no video). */
export function guideVideo(pagePath:string):GuideVideo|null{
 const d=GUIDE_VIDEOS.find(v=>v.path===pagePath);if(!d)return null;
 const m=readManifest()[d.key],v=m?.video;
 const poster=`learn/${d.key}.webp`,mp4=`learn/video/${d.key}.mp4`,webm=`learn/video/${d.key}.webm`;
 if(!v?.duration||!onDisk(poster)||!onDisk(mp4))return null;
 return {...d,poster:'/'+poster,mp4:'/'+mp4,...(onDisk(webm)?{webm:'/'+webm}:{}),width:v.width??390,height:v.height??844,seconds:Math.max(1,Math.round(v.duration))/* Nov 20 2026: the nearest second, as the game clips do (7.04 s read as 8) */};
}
export const allGuideVideos=()=>GUIDE_VIDEOS.map(d=>guideVideo(d.path)).filter((v):v is GuideVideo=>!!v);
/** The clip file's absolute URL (learnUrl adds ?v=<hash>, or the R2 host when MEDIA_BASE is set). */
export const fullUrl=(u:string)=>/^https?:/.test(u)?u:SITE_URL+u;
/** Nov 18 2026: each clip's VideoObject and video sitemap entry moved to its own watch page, /videos/<slug> (lib/site/videos.ts);
 *  the guide page keeps the clip for readers and links to the watch page. */
