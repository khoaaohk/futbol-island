/**
 * Server only: the names behind the marketing page's positional ids (mk:rc_<n>, sl_<n>, faq_<n>, fs_<n>), read from the page's
 * own content with the same filters the page uses (components/learn/LearnReel.tsx, LearnSlides.tsx, app/(site)/page.tsx), so
 * card n on /admin is card n on the page as it is deployed now.
 */
import {LEARN_CAROUSEL,LEARN_FAQ_TOP,LEARN_FEATURES,LEARN_SLIDES,learnPlain} from '@/lib/site/learnFeatures';
import {learnSlideAsset,learnWideAsset} from '@/lib/site/learnMedia';
import {nameMarketing,type MarketingReport,type MkLabels} from './marketingReport';

export function marketingLabels():MkLabels{
 try{
  return {
   reel:LEARN_CAROUSEL.filter(c=>!!learnWideAsset(c.key)).slice(0,9).map(c=>learnPlain(c.title)),
   slides:LEARN_SLIDES.filter(x=>!!learnSlideAsset(x.key)).slice(0,6).map(x=>learnPlain(x.title)),
   faq:[...LEARN_FAQ_TOP],
   steps:(LEARN_FEATURES.find(f=>f.id==='party-start')?.steps??[]).map(x=>learnPlain(x.line)),
  };
 }catch{return {reel:[],slides:[],faq:[],steps:[]};}
}

/** app/admin/page.tsx and app/api/admin/analytics/route.ts: name the carousel, slideshow, FAQ and step rows. */
export const labelMarketing=(r:MarketingReport|null|undefined)=>nameMarketing(r,marketingLabels());
