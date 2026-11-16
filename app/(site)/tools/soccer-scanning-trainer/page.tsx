import ScanTrainerPage from '@/components/site/tools/ScanTrainerPage';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd} from '@/lib/site/GuideParts';
import {pageMeta} from '@/lib/site/seo';
import {toolCrumbs} from '@/lib/site/tools/registry';
import {SCAN_APP_PATH,SCAN_EN as P,SCAN_IMAGE,SCAN_PATH,SCAN_RELATED_EN} from '@/lib/site/tools/scanTrainer';
/**
 * /tools/soccer-scanning-trainer (Nov 16 2026; docs/scan-trainer/HANDOFF.md): the SEO front door of Scan Trainer (/scan). Words in
 * lib/site/tools/scanTrainer.ts; the body is shared with the Spanish page (components/site/tools/ScanTrainerPage.tsx).
 */
export const dynamic='force-static';
export const metadata=pageMeta(P.title,P.description,SCAN_PATH,{whole:true,type:'website',image:{url:SCAN_IMAGE,alt:'Scan Trainer on two phones: a blue color cue and a pass to teammate 3 on the right'}});
export default function ScanTrainerFrontDoor(){
 const crumbs=toolCrumbs({name:P.crumb,path:SCAN_PATH});
 return <ScanTrainerPage p={P} path={SCAN_PATH} crumbs={crumbs} lang="en" related={SCAN_RELATED_EN}
  intro={<ToolIntro crumbs={crumbs} h1={P.h1} lead={P.lead} app={{href:SCAN_APP_PATH,label:P.openLabel,line:P.openLine}}/>}
  end={<GuideEnd sticky={false}/>}/>;
}
