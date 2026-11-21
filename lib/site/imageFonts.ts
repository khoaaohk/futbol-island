import fs from 'node:fs';
import path from 'node:path';
/**
 * The typeface of the generated diagram pictures (Nov 20 2026, owner: "the font is off"): Inter (SIL Open Font License 1.1,
 * rsms/inter release v4.1, licence beside the files in lib/site/fonts/inter/), the open face closest to the site's system stack
 * (SF Pro on Apple devices). 800 for titles with tight tracking like the page H1, 600 for the other lines. Read from the repo, so
 * the build never fetches a font; the image routes are prerendered at build time, so the files never reach a phone.
 */
export type ImageFont={name:string;data:Buffer;style:'normal';weight:600|800};
let fonts:ImageFont[]|null=null;
export function imageFonts():ImageFont[]{
 const dir=path.join(process.cwd(),'lib/site/fonts/inter');
 return fonts??=[
  {name:'Inter',data:fs.readFileSync(path.join(dir,'Inter-SemiBold.ttf')),style:'normal',weight:600},
  {name:'Inter',data:fs.readFileSync(path.join(dir,'Inter-ExtraBold.ttf')),style:'normal',weight:800}];
}
