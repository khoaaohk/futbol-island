import {abs,ogPath} from '../seo';
import {ALL_GUIDE_PAGES} from '../guides';
import {SITE_FISH,fishArtPath,fishPath} from '../fish';
import {SITE_CARDS,cardPath} from '../cards';
import {SITE_EXHIBITS,exhibitPath} from '../exhibits';
import {fileUrl,PRINTABLES,PRINTABLES_HUB_PATH} from './printables';
import {TOOL_PAGES} from './registry';
import {GAME_LISTINGS} from '../games';
/**
 * /sitemap-images.xml (Nov 10 2026): the pictures of each page for image search, as Google's image sitemap extension. Next
 * 14.2.15's MetadataRoute.Sitemap has no `images` field (it arrived in a later release), so this is its own static file,
 * named in robots.txt beside /sitemap.xml. Listed: every guide diagram PNG (formations, positions, rules, terms, size charts),
 * every printable PNG and SVG on its own page, the tool pages' pictures, each fish drawing and the share picture of every fish,
 * card and exhibit page. Every page here is also in /sitemap.xml (tests/seo-tools.cjs checks it).
 */
export type ImageEntry={path:string;images:string[]};
export function imageEntries():ImageEntry[]{
 const printable=new Map(PRINTABLES.map(p=>[p.path,p.files.flatMap(f=>[fileUrl(f.name,'png'),fileUrl(f.name,'svg')])]));
 return [
  ...ALL_GUIDE_PAGES.filter(g=>g.image).map(g=>({path:g.path,images:[g.image!]})),
  ...TOOL_PAGES.map(t=>({path:t.path,images:printable.get(t.path)??(t.path===PRINTABLES_HUB_PATH?PRINTABLES.map(p=>fileUrl(p.files[0].name,'png')):t.image?[t.image]:[])})).filter(e=>e.images.length>0),
  ...GAME_LISTINGS.map(g=>({path:g.path,images:g.images})),/* the arcade games' screenshots and share pictures (lib/site/games.ts) */
  ...SITE_FISH.map(f=>({path:fishPath(f.id),images:[fishArtPath(f.id),ogPath(fishPath(f.id))]})),
  ...SITE_CARDS.map(c=>({path:cardPath(c.number),images:[ogPath(cardPath(c.number))]})),
  ...SITE_EXHIBITS.map(e=>({path:exhibitPath(e.id),images:[ogPath(exhibitPath(e.id))]})),
 ];
}
const x=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function imageSitemapXml():string{
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`
  +imageEntries().map(e=>`<url><loc>${x(abs(e.path))}</loc>${e.images.map(i=>`<image:image><image:loc>${x(abs(i))}</image:loc></image:image>`).join('')}</url>`).join('\n')+'\n</urlset>\n';
}
