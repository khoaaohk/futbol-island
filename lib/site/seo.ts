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
/** Page metadata: "X · Futbol Island" (or the title as given with `whole`, for the home page), description, canonical, Open Graph. */
export function pageMeta(title:string,description:string,path:string,o:{whole?:boolean;type?:'article'|'website'}={}):Metadata{
 const full=o.whole?title:`${title} · ${SITE_NAME}`;
 return {title:full,description,alternates:{canonical:path},
  openGraph:{title:full,description,url:path,siteName:SITE_NAME,type:o.type??'article',images:[{url:'/opengraph-image.png',width:1200,height:630,alt:SITE_NAME}]},
  twitter:{card:'summary_large_image',title:full,description,images:['/opengraph-image.png']}};
}
export type Crumb={name:string;path:string};
export const breadcrumbLd=(crumbs:readonly Crumb[])=>({'@context':'https://schema.org','@type':'BreadcrumbList',
 itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:abs(c.path)}))});
export const KIDS_AUDIENCE={'@type':'PeopleAudience',suggestedMinAge:7,suggestedMaxAge:12};
export const PUBLISHER={'@type':'Organization',name:SITE_NAME,url:SITE_URL+'/'};
/** The game itself (it runs at /play since Nov 3 2026), as a web app and a video game: on `/`, /play and /about. */
export const PLAY_PATH='/play';
export const siteLd=()=>({'@context':'https://schema.org','@type':['WebApplication','VideoGame'],
 name:SITE_NAME,url:abs(PLAY_PATH),
 description:'A free football learning game for kids aged 7 to 12. Explore an island, learn positions, tactics and the rules of 7v7, 9v9, 11v11 and futsal through short lessons and quizzes, and discover football history and culture.',
 applicationCategory:'GameApplication',operatingSystem:'Any (web browser, phone first)',genre:['Educational','Sports'],
 gamePlatform:'Web browser',playMode:'SinglePlayer',
 inLanguage:'en',isAccessibleForFree:true,offers:{'@type':'Offer',price:0,priceCurrency:'USD'},
 audience:KIDS_AUDIENCE,educationalUse:['Self-directed learning','Practice','Quiz'],
 learningResourceType:'Educational game',teaches:['Football positions','Team shape','Tactics','Laws of the Game','Football history','Futsal'],
 publisher:PUBLISHER,image:SITE_URL+'/opengraph-image.png'});
/** The home page `/` (the feature tour, Nov 3 2026): the site and its publisher. */
export const websiteLd=()=>({'@context':'https://schema.org','@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/',inLanguage:'en',
 description:'A free football learning game for kids aged 7 to 12, played in the web browser.',publisher:PUBLISHER});
export const organizationLd=()=>({'@context':'https://schema.org',...PUBLISHER,logo:SITE_URL+'/icon.png'});
/** A plain-text page about one thing (a fish, a card, an exhibit). */
export const creativeWorkLd=(o:{name:string;path:string;description:string;about:Record<string,unknown>|Record<string,unknown>[]})=>({'@context':'https://schema.org','@type':'CreativeWork',
 name:o.name,url:abs(o.path),description:o.description,inLanguage:'en',isAccessibleForFree:true,audience:KIDS_AUDIENCE,
 isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,about:o.about});
