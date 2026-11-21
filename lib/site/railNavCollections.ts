import type {Rail,RailItem} from './railNav';
import {hubRail,pageRail,sec} from './railNavMore';
import {VIDEO_GROUPS,VIDEOS_PATH} from './videos';

/**
 * Rails for the collections and coach tools (layout batch 3, Nov 20 2026; owner: "it should list what's on that page to smooth
 * scroll down"; "there should be a back btn at the side nav to go back to the previous screen. on mobile the back btn is locked on
 * the left and everything scrolls under it"). Every rail here is Back + Overview (#top) + THAT page's own sections as in-page
 * anchors, in page order, never a list of sibling pages:
 *  - a hub (videos, coach tools, museum, story books, age groups, fishbook, player cards) goes Back to the Library and lists the
 *    groups or shelves shown on it;
 *  - a detail page goes Back to its hub and lists its own H2 sections.
 * Pass current="#top" to RailNav. Every target id is on the page and lands under the header (components/site/railTarget.module.css).
 */
export type Sec=readonly [id:string,name:string];
const items=(s:readonly Sec[]):RailItem[]=>s.map(([id,name])=>sec(id,name));
const hub=(label:string,s:readonly Sec[],es=false):Rail=>hubRail(label,[{items:items(s)}],es);
const page=(label:string,back:RailItem,s:readonly Sec[],es=false):Rail=>pageRail(label,back,items(s),es);

/* videos: /videos lists its three groups; a watch page its own sections */
export const videosHubRail=():Rail=>hub('Videos on this page',VIDEO_GROUPS.map(g=>[`g-${g.id}`,g.title] as const));
export const videoRail=(title:string,about:string):Rail=>page(`${title}: on this page`,{href:VIDEOS_PATH,name:'All videos'},
 [['about',about],['go','Where to go next'],['more','More videos']]);
