import type {Metadata} from 'next';
/**
 * The static reading pages (Oct 16 2026, "make the site easier to find through ChatGPT, Claude and search"): shared metadata
 * and JSON-LD helpers for app/(site)/*, app/sitemap.ts, app/robots.ts and the llms files. Pure data: no env reads, no client
 * code, so the pages build with no secrets set. Nothing here may carry personal data (docs/accounts-design.md).
 */
export const SITE_URL='https://futbolisland.app';
export const SITE_NAME='Futbol Island';
export const abs=(path:string)=>SITE_URL+(path==='/'?'/':path);
/** The first sentence of a text (for meta descriptions; a very short one takes the next sentence too), trimmed to ~160
 *  characters on a word boundary. */
export function firstSentence(text:string,max=160):string{
 const clean=text.replace(/\s+/g,' ').trim();
 const parts=clean.split(/(?<=[.!?])\s+/);
 let s='';for(const p of parts){s=(s+' '+p.trim()).trim();if(s.length>=50)break;}
 if(s.length>max)s=s.slice(0,max-1).replace(/\s+\S*$/,'')+'…';
 return s;
}
/** Titles stay <= 60 characters (search snippets): drop " · Futbol Island", then a trailing "(…)" label, then cut on a word. */
export function fitTitle(title:string,whole?:boolean):string{
 const full=whole?title:`${title} · ${SITE_NAME}`;
 if(full.length<=60)return full;
 if(title.length<=60)return title;
 const bare=title.replace(/\s*\([^)]*\)\s*$/,'');
 if(bare.length>0&&bare.length<=60)return bare;
 return title.slice(0,59).replace(/\s+\S*$/,'')+'…';
}
/** Descriptions stay 70-155 characters (Nov 8 2026: 155, the snippet length): a very short one gets a plain tail, a long one
 *  is cut on a word. */
export function fitDescription(d:string):string{
 let s=d.replace(/\s+/g,' ').trim();
 if(s.length<70)s=`${s} A page of Futbol Island, a free football learning game for kids.`;
 if(s.length>155)s=s.slice(0,154).replace(/\s+\S*$/,'')+'…';
 return s;
}
/** Page metadata: "X · Futbol Island" (or the title as given with `whole`, for the home page), description, canonical, Open Graph. */
export function pageMeta(title:string,description:string,path:string,o:{whole?:boolean;type?:'article'|'website';image?:{url:string;alt:string}}={}):Metadata{
 const full=fitTitle(title,o.whole);description=fitDescription(description);
 if(o.image)return {title:full,description,alternates:{canonical:path},/* a page with its own picture (guide diagrams, lib/site/guides.ts) */
  openGraph:{title:full,description,url:path,siteName:SITE_NAME,type:o.type??'article',images:[{url:o.image.url,width:1200,height:630,alt:o.image.alt}]},
  twitter:{card:'summary_large_image',title:full,description,images:[o.image.url]}};
 return {title:full,description,alternates:{canonical:path},
  openGraph:{title:full,description,url:path,siteName:SITE_NAME,type:o.type??'article',images:[{url:'/opengraph-image.png',width:1200,height:630,alt:SITE_NAME}]},
  twitter:{card:'summary_large_image',title:full,description,images:['/opengraph-image.png']}};
}
/** A page kept out of search (thin app screens: the game's rooms, the controller, the donation picker): its own canonical, never
 *  the root's, and robots noindex (links still followed). */
export function noindexMeta(title:string,description:string,path:string):Metadata{
 return {title,description,alternates:{canonical:path},robots:{index:false,follow:true}};
}
/** Home `/` (SEO, Nov 8 2026: "learn football (soccer) for kids, lessons and quizzes, fun and safe, free in your browser"). */
export const HOME_TITLE='Learn Football for Kids: Free Lessons and Quizzes';
export const HOME_DESC='Free football (soccer) lessons and quizzes for kids 7 to 12, on a fun island. No pop-up or tracking ads, no accounts, no open chat. Play in your browser.';
/** FAQPage JSON-LD: pass exactly the questions and answers the page shows. */
export const faqLd=(faq:readonly {q:string;a:string}[])=>({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))});
/** A collection page (the topic hubs) with real content dates (lib/site/updated.ts). */
export const collectionLd=(o:{name:string;path:string;description:string;published:string;modified:string;items:{name:string;path:string}[]})=>({'@context':'https://schema.org','@type':'CollectionPage',
 name:o.name,url:abs(o.path),description:o.description,inLanguage:'en',datePublished:o.published,dateModified:o.modified,isAccessibleForFree:true,audience:KIDS_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,
 mainEntity:{'@type':'ItemList',numberOfItems:o.items.length,itemListElement:o.items.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,url:abs(x.path)}))}});
export type Crumb={name:string;path:string};
export const breadcrumbLd=(crumbs:readonly Crumb[])=>({'@context':'https://schema.org','@type':'BreadcrumbList',
 itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:abs(c.path)}))});
export const KIDS_AUDIENCE={'@type':'PeopleAudience',suggestedMinAge:7,suggestedMaxAge:12};
export const PUBLISHER={'@type':'Organization',name:SITE_NAME,url:SITE_URL+'/'};
/** The game itself (it runs at /play since Nov 3 2026), as a web app and a video game: on `/`, /play and /about. */
export const PLAY_PATH='/play';
export const siteLd=()=>({'@context':'https://schema.org','@type':['WebApplication','VideoGame'],
 name:SITE_NAME,url:abs(PLAY_PATH),
 description:'Futbol Island is a free football (soccer) learning game for kids aged 7 to 12. Explore an island, learn positions, tactics and the rules of 7v7, 9v9, 11v11 and futsal through short lessons and quizzes, and discover football history and culture.',
 applicationCategory:'GameApplication',operatingSystem:'Any (web browser, phone first)',genre:['Educational','Sports'],
 gamePlatform:'Web browser',playMode:'SinglePlayer',
 inLanguage:'en',isAccessibleForFree:true,offers:{'@type':'Offer',price:0,priceCurrency:'USD'},
 audience:KIDS_AUDIENCE,educationalUse:['Self-directed learning','Practice','Quiz'],
 learningResourceType:'Educational game',teaches:['Football positions','Team shape','Tactics','Laws of the Game','Football history','Futsal'],
 publisher:PUBLISHER,image:SITE_URL+'/opengraph-image.png'});
/** The home page `/` (the feature tour, Nov 3 2026): the site and its publisher. */
export const websiteLd=()=>({'@context':'https://schema.org','@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/',inLanguage:'en',
 description:'Futbol Island is a free football (soccer) learning game for kids aged 7 to 12, played in the web browser.',publisher:PUBLISHER});
/** No sameAs: Futbol Island has no social profile of its own yet (the Instagram on `/` is the partner founder's personal
 *  account, not the game's), and sameAs must name the same entity. Add its own profiles here when they exist. */
export const organizationLd=()=>({'@context':'https://schema.org',...PUBLISHER,logo:SITE_URL+'/icon.png',
 description:'Futbol Island makes a free football (soccer) learning game for kids aged 7 to 12, built in San Diego with White Sports Ventures.'});
/** A guide page (formations, positions and later clusters, lib/site/guides.ts): an Article for kids with real content dates. */
export const articleLd=(o:{headline:string;path:string;description:string;published:string;modified:string;about:string;teaches?:string;image?:string})=>({'@context':'https://schema.org','@type':'Article',
 headline:o.headline,name:o.headline,url:abs(o.path),mainEntityOfPage:abs(o.path),description:o.description,inLanguage:'en',isAccessibleForFree:true,
 datePublished:o.published,dateModified:o.modified,learningResourceType:'Guide',educationalLevel:'Beginner',audience:KIDS_AUDIENCE,
 about:{'@type':'Thing',name:o.about},...(o.teaches?{teaches:o.teaches}:{}),...(o.image?{image:abs(o.image)}:{}),
 author:PUBLISHER,publisher:PUBLISHER,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'}});
/** A plain-text page about one thing (a fish, a card, an exhibit). */
/** A long-tail page's own 1200×630 share picture (/cards/<n>/og.png, /exhibits/<id>/og.png, /fish/<id>/og.png; lib/site/ogImage.tsx, built statically). */
export const ogPath=(pagePath:string)=>`${pagePath}/og.png`;
export const creativeWorkLd=(o:{name:string;path:string;description:string;about:Record<string,unknown>|Record<string,unknown>[];image?:string})=>({'@context':'https://schema.org','@type':'CreativeWork',
 name:o.name,url:abs(o.path),description:o.description,...(o.image?{image:abs(o.image)}:{}),inLanguage:'en',isAccessibleForFree:true,audience:KIDS_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,about:o.about});
/** /play (Nov 10 2026): the same game entity with its own @id, the page it is the main thing of, and real screenshots (the
 *  home page's captures, public/learn). No ratings and no reviews: none exist, so none are stated. */
export const PLAY_SCREENSHOTS=['/learn/town_overview.webp','/learn/lesson_field.webp','/learn/quiz_question.webp'] as const;
export const playLd=()=>({...siteLd(),'@id':abs(PLAY_PATH)+'#game',mainEntityOfPage:abs(PLAY_PATH),
 screenshot:PLAY_SCREENSHOTS.map(s=>({'@type':'ImageObject',contentUrl:SITE_URL+s,encodingFormat:'image/webp'}))});
