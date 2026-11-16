import fs from 'node:fs';
import path from 'node:path';
import {learnUrl} from './learnMedia';
import {abs,SITE_URL} from './seo';
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
 return {...d,poster:'/'+poster,mp4:'/'+mp4,...(onDisk(webm)?{webm:'/'+webm}:{}),width:v.width??390,height:v.height??844,seconds:Math.ceil(v.duration)};
}
export const allGuideVideos=()=>GUIDE_VIDEOS.map(d=>guideVideo(d.path)).filter((v):v is GuideVideo=>!!v);
const full=(u:string)=>/^https?:/.test(u)?u:SITE_URL+u;
/** schema.org VideoObject, the same words as the visible caption. */
export const videoLd=(v:GuideVideo)=>({'@context':'https://schema.org','@type':'VideoObject',name:v.name,description:v.description,
 thumbnailUrl:[abs(v.poster)],uploadDate:v.uploadDate,duration:`PT${v.seconds}S`,contentUrl:full(learnUrl(v.mp4!)),
 width:v.width,height:v.height,isFamilyFriendly:true,inLanguage:'en',isAccessibleForFree:true,mainEntityOfPage:abs(v.path)});
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
/** /sitemap-video.xml (Google video sitemap): one <url> per guide page with a clip. */
export function videoSitemapXml():string{
 const urls=allGuideVideos().map(v=>`<url><loc>${esc(abs(v.path))}</loc><video:video><video:thumbnail_loc>${esc(abs(v.poster))}</video:thumbnail_loc><video:title>${esc(v.name)}</video:title><video:description>${esc(v.description)}</video:description><video:content_loc>${esc(full(learnUrl(v.mp4!)))}</video:content_loc><video:duration>${v.seconds}</video:duration><video:publication_date>${esc(v.uploadDate)}</video:publication_date><video:family_friendly>yes</video:family_friendly><video:requires_subscription>no</video:requires_subscription></video:video></url>`);
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}
