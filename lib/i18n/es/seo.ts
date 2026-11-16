import type {Metadata} from 'next';
import {SITE_NAME} from '@/lib/site/seo';
import {languageAlternates,toEs} from '../esPaths';
/**
 * Metadata of a Spanish page (Spanish round 1): its own canonical (/es/…), hreflang en / es / x-default (the same set the English
 * page gets from lib/site/seo.ts pageMeta), Open Graph locale es_US. Titles and descriptions are written to fit (<= 60 and
 * 70-155 characters, tests/es-pages.cjs), so they are used as they are.
 */
export function esMeta(title:string,description:string,enPath:string,image?:{url:string;alt:string}):Metadata{
 const url=toEs(enPath),images=[image?{url:image.url,width:1200,height:630,alt:image.alt}:{url:'/opengraph-image.png',width:1200,height:630,alt:SITE_NAME}];
 return {title:{absolute:title},description,alternates:{canonical:url,languages:languageAlternates(enPath)},
  openGraph:{title,description,url,siteName:SITE_NAME,type:enPath==='/'?'website':'article',locale:'es_US',alternateLocale:['en_US'],images},
  twitter:{card:'summary_large_image',title,description,images:[images[0].url]}};
}
