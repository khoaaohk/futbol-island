/**
 * Build-time facts for the /start title screen (Oct 9 2026). The page is prerendered static, so this runs once per build.
 */
import fs from 'node:fs';
import path from 'node:path';

/** /privacy is built by the save-code work (docs/accounts-design.md §7 step 8). Until it exists, the privacy link points at the
 *  grown-ups notes in this page's footer. Checked at build time, so the next build after /privacy lands links it. */
export const privacyPageExists=()=>['page.tsx','page.ts','page.mdx'].some(f=>fs.existsSync(path.join(process.cwd(),'app/privacy',f)));
