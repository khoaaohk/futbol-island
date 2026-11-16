import type {Metadata} from 'next';
import ScanApp from '@/components/scan/ScanApp';
import {abs} from '@/lib/site/seo';
import {SCAN_EN,SCAN_PATH} from '@/lib/site/tools/scanTrainer';
import site from '../../(site)/site.module.css';
/**
 * /embed/soccer-scanning-trainer (Nov 16 2026; docs/scan-trainer/HANDOFF.md): Scan Trainer for a club's own website, next to the
 * lineup and planner embeds (app/embed/[tool]). A static segment, so the [tool] route and its tests are unchanged. The app runs
 * with `embed` (no service worker, no manifest, no counters), then one privacy line and ONE "Made with Futbol Island" link.
 * noindex (meta + X-Robots-Tag from the /embed/* header rule) with the canonical on the front door.
 */
export const dynamic='force-static';
export const metadata:Metadata={title:'Soccer scanning trainer | Futbol Island',description:SCAN_EN.description,alternates:{canonical:abs(SCAN_PATH)},robots:{index:false,follow:true},openGraph:null,twitter:null};
export default function ScanEmbed(){
 return <>
  <div data-embed="/embed/soccer-scanning-trainer"><ScanApp embed/></div>
  <p className={site.caption}>{SCAN_EN.privacy} <a href={SCAN_PATH} target="_blank" rel="noopener">Made with Futbol Island</a></p>
 </>;
}
