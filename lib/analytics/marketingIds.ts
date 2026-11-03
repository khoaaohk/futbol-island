/**
 * Marketing page counters (Nov 3 2026, owner: "show how well the home page performs"): the ONLY ids the tour page at `/`
 * (app/(site)/page.tsx, components/learn/*) may put on the beat's counter channel (`k:{id:n}`, lib/analytics/countIds.ts).
 * They ride the game's existing cookie-free pipeline (tracker.ts → /api/visit → analytics_beats.counts → daily rollups), so
 * no new table, request, cookie or id: fixed buckets and totals only. The browser side is components/learn/PageStats.tsx
 * (lib/analytics/marketingEvents.ts); the dashboard side is lib/analytics/marketingReport.ts and app/admin/MarketingSection.tsx.
 *
 * Privacy (a kids' game, though this page is mostly read by grown-ups): never text, a value typed, a URL, a referrer host, a
 * position, an order of events or an id of anyone. A referrer becomes one of a fixed list of names (or "other"), a device one
 * of three classes, a Web Vital one of three bands. Nothing at all is sent under Do-Not-Track / GPC (the tracker is off).
 *
 *   mk:view            the page was shown (one per page load)
 *   mk:play            any Play tap in the view (once per view; the CTR numerator)
 *   mk:engaged         the view lasted 10 s in the foreground or had a tracked tap (bounce = views without it)
 *   mk:sec10           foreground time on the page in 10-second units, rounded (capped at MAX_SEC10 per view) → average time
 *   mk:t_<band>        the time band of the view's first stint (until it was first hidden or left) → median time
 *   mk:s25 … s100      deepest scroll reached
 *   mk:v_<section>     a section was seen (half of it, or half the screen, in view)
 *   mk:c_<target>      a tap: nav links, menu, every Play, Watch it, carousel / slideshow / film controls, footer links
 *   mk:faq_<n>         FAQ question n (1-based, page order) opened
 *   mk:rc_<n> sl_<n> fs_<n>  carousel card / slideshow slide / friends step n became the active one while its section was seen
 *   mk:reached         the tab arrived at /play after a Play tap here (counted on /play by components/VisitTracker.tsx)
 *   mk:d_<class>       phone / tablet / desktop (coarse pointer and screen size)
 *   mk:src_<class> mk:ref_<name>  where the view came from: a class, and a fixed referrer name
 *   mk:ret_yes / ret_no  this device has played the game before (the game's own existing mark; nothing new is stored)
 *   mk:vid_ok mk:err_img mk:err_video  a clip played / a picture or a clip failed to load (once per view each)
 *   mk:lcp_<band> cls_<band> inp_<band>  Core Web Vitals, good / ni (needs improvement) / poor
 */
export const MK_SECTIONS=[['top','Hero'],['film','Island film'],['in_action','Carousel (See it in action)'],['learn','Learn'],['explore','Explore'],
 ['fuel','Fuel up'],['together','Play with friends'],['more','Slideshow (Even more)'],['safe','Safety'],['faq','FAQ'],['end','Closing Play chapter']] as const;
export type MkSection=typeof MK_SECTIONS[number][0];
/** Taps, grouped for the dashboard. The id is `mk:c_<id>`. */
export const MK_CLICKS=[
 ['play_hero','Play','Hero Play'],['play_nav','Play','Top-bar Play'],['play_end','Play','Closing Play'],['play_other','Play','Other Play link'],
 ['watch','Hero','Watch it'],
 ['logo','Top bar','Logo'],['nav_learn','Top bar','Nav: Learn'],['nav_explore','Top bar','Nav: Explore'],['nav_together','Top bar','Nav: Friends'],['nav_safe','Top bar','Nav: Safety'],
 ['menu_open','Phone menu','Menu opened'],['menu_learn','Phone menu','Menu: Learn'],['menu_explore','Phone menu','Menu: Explore'],['menu_together','Phone menu','Menu: Friends'],['menu_safe','Phone menu','Menu: Safety'],
 ['reel_prev','Carousel','Carousel back'],['reel_next','Carousel','Carousel next'],['reel_play','Carousel','Carousel clip play'],['reel_pause','Carousel','Carousel clip pause'],
 ['slide_dot','Slideshow','Slide dot'],['slide_pause','Slideshow','Slideshow pause'],['slide_resume','Slideshow','Slideshow resume'],['slide_play','Slideshow','Slide clip play'],['slide_pause_clip','Slideshow','Slide clip pause'],
 ['film_play','Island film','Film play'],['film_pause','Island film','Film pause'],
 ['clip_play','Chapter clips','Chapter clip play'],['clip_pause','Chapter clips','Chapter clip pause'],
 ['grownups','Links','For grown-ups'],['privacy','Links','Privacy'],['about','Links','About'],['lessons','Links','Lessons'],['home','Links','Footer: What’s inside'],
 ['store','Links','App store'],['share','Links','Share'],['anchor','Links','Other on-page link'],['internal','Links','Other site page'],['external','Links','Other website'],
] as const;
export type MkClick=typeof MK_CLICKS[number][0];
/** Time bands for the first stint, in seconds: [id, label, lo, hi). */
export const MK_TIME_BANDS=[['0_10','Under 10 s',0,10],['10_30','10–30 s',10,30],['30_60','30 s – 1 min',30,60],['60_180','1–3 min',60,180],['180_600','3–10 min',180,600],['600','10 min or more',600,Infinity]] as const;
export const MAX_SEC10=90;// 15 minutes per view
export const MK_SCROLL=[25,50,75,100] as const;
export const MK_DEVICES=[['phone','Phone'],['tablet','Tablet'],['desktop','Desktop']] as const;
export const MK_SOURCES=[['direct','Direct (typed, bookmark, app)'],['search','Search engines'],['ai','AI assistants'],['social','Social and messaging'],['referral','Other websites'],
 ['campaign','Tagged links (utm / ?from=)'],['internal','Another page of this site']] as const;
/** Referrer names: [id, label, class, host suffixes]. The first match wins (gemini before google). */
export const MK_REFERRERS:readonly (readonly [string,string,'search'|'ai'|'social',readonly string[]])[]=[
 ['chatgpt','ChatGPT','ai',['chatgpt.com','chat.openai.com','openai.com']],['claude','Claude','ai',['claude.ai']],['perplexity','Perplexity','ai',['perplexity.ai']],
 ['gemini','Gemini','ai',['gemini.google.com','bard.google.com']],['copilot','Copilot','ai',['copilot.microsoft.com']],
 ['google','Google','search',['google.com','google.co.uk','google.ca','google.com.au','google.de','google.fr','google.es','google.com.mx','google.co.in','google']],
 ['bing','Bing','search',['bing.com']],['duckduckgo','DuckDuckGo','search',['duckduckgo.com']],['yahoo','Yahoo','search',['yahoo.com']],['ecosia','Ecosia','search',['ecosia.org']],
 ['brave','Brave Search','search',['search.brave.com']],
 ['facebook','Facebook','social',['facebook.com','fb.com','fb.me']],['instagram','Instagram','social',['instagram.com']],['tiktok','TikTok','social',['tiktok.com']],
 ['youtube','YouTube','social',['youtube.com','youtu.be']],['reddit','Reddit','social',['reddit.com']],['x','X / Twitter','social',['t.co','twitter.com','x.com']],
 ['linkedin','LinkedIn','social',['linkedin.com','lnkd.in']],['pinterest','Pinterest','social',['pinterest.com']],['whatsapp','WhatsApp','social',['whatsapp.com','wa.me']],
];
export const MK_VITALS=[['lcp','Largest Contentful Paint','2.5 s','4 s'],['cls','Cumulative Layout Shift','0.1','0.25'],['inp','Interaction to Next Paint','200 ms','500 ms']] as const;
export const MK_BANDS=['good','ni','poor'] as const;
/** Positions counted for the carousel, slideshow, FAQ and friends steps (1-based). */
export const MK_MAX={rc:9,sl:6,faq:10,fs:6} as const;

const range=(n:number)=>Array.from({length:n},(_,i)=>i+1);
export const MARKETING_COUNT_IDS:readonly string[]=[
 'mk:view','mk:play','mk:engaged','mk:sec10','mk:reached','mk:ret_yes','mk:ret_no','mk:vid_ok','mk:err_img','mk:err_video',
 ...MK_TIME_BANDS.map(b=>'mk:t_'+b[0]),...MK_SCROLL.map(s=>'mk:s'+s),...MK_SECTIONS.map(s=>'mk:v_'+s[0]),...MK_CLICKS.map(c=>'mk:c_'+c[0]),
 ...range(MK_MAX.faq).map(i=>'mk:faq_'+i),...range(MK_MAX.rc).map(i=>'mk:rc_'+i),...range(MK_MAX.sl).map(i=>'mk:sl_'+i),...range(MK_MAX.fs).map(i=>'mk:fs_'+i),
 ...MK_DEVICES.map(d=>'mk:d_'+d[0]),...MK_SOURCES.map(s=>'mk:src_'+s[0]),...MK_REFERRERS.map(r=>'mk:ref_'+r[0]),'mk:ref_other',
 ...MK_VITALS.flatMap(v=>MK_BANDS.map(b=>`mk:${v[0]}_${b}`)),
];
const SET=new Set(MARKETING_COUNT_IDS);
export const isMarketingId=(id:unknown):id is string=>typeof id==='string'&&SET.has(id);

/** The time band id for a first stint of `ms`. */
export function timeBand(ms:number):string{const s=Math.max(0,ms)/1000;return (MK_TIME_BANDS.find(b=>s>=b[2]&&s<b[3])??MK_TIME_BANDS[MK_TIME_BANDS.length-1])[0];}
/** good / ni / poor for one vital (LCP and INP in ms, CLS unitless). */
export function vitalBand(metric:'lcp'|'cls'|'inp',v:number):'good'|'ni'|'poor'{
 const [g,p]=metric==='lcp'?[2500,4000]:metric==='cls'?[0.1,0.25]:[200,500];return v<=g?'good':v<=p?'ni':'poor';
}
/** Where a view came from: its class and (for search / AI / social) the referrer's fixed name. Never the host itself. */
export function classifyReferrer(referrer:string|null|undefined,ownHost:string,search:string):{src:string;ref:string|null}{
 let host='';try{host=referrer?new URL(referrer).hostname.toLowerCase().replace(/^www\.|^m\.|^l\./,''):'';}catch{}
 const own=ownHost.toLowerCase().replace(/^www\./,'');
 if(host&&(host===own||host.endsWith('.'+own)))return {src:'internal',ref:null};
 let tagged=false;try{const q=new URLSearchParams(search);tagged=!!(q.get('utm_source')||q.get('utm_medium')||q.get('utm_campaign')||q.get('from'));}catch{}
 const named=host?MK_REFERRERS.find(r=>r[3].some(sfx=>sfx.includes('.')?host===sfx||host.endsWith('.'+sfx):host.split('.').includes(sfx))):undefined;
 if(tagged)return {src:'campaign',ref:host?(named?.[0]??'other'):null};
 if(!host)return {src:'direct',ref:null};
 if(named)return {src:named[2],ref:named[0]};
 return {src:'referral',ref:'other'};
}
/** Phone / tablet / desktop from a coarse pointer and the screen's short side (no user-agent parsing in the browser). */
export function deviceOf(coarse:boolean,shortSide:number):'phone'|'tablet'|'desktop'{
 return !coarse?'desktop':shortSide<600?'phone':'tablet';
}

/** sessionStorage key set by a Play tap on `/` (a timestamp; per tab, never sent). */
export const MK_PLAY_KEY='fi-mk-play';
const PLAY_FRESH_MS=10*60_000;
/** On /play (components/VisitTracker.tsx, after its pageview): the tab came here from a Play tap on `/` → mk:reached. Lives here,
 *  not in marketingEvents.ts, so the game's bundle does not carry the page tracker. */
export function countPlayArrival(session:Pick<Storage,'getItem'|'removeItem'>|null,nowMs:number,count:(id:string)=>void){
 try{const at=Number(session?.getItem(MK_PLAY_KEY));if(!at)return;session!.removeItem(MK_PLAY_KEY);if(nowMs-at>=0&&nowMs-at<PLAY_FRESH_MS)count('mk:reached');}catch{}
}
