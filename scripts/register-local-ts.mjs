// Lets the .mjs sim tests import lib/**/*.ts directly (QA 4, Oct 26 2026: also on the repo's default Node 20).
// Node 22.18+ strips TypeScript types itself and has the synchronous module.registerHooks; there we only add the missing ".ts" to
// extensionless relative imports. Older Node (20.x) gets async loader hooks (scripts/local-ts-hooks.mjs) that do the same resolve
// and transpile .ts with the repo's `typescript` package. Tests must import .ts files dynamically (await import), after this runs.
import * as mod from 'node:module';
import {existsSync} from 'node:fs';
if(typeof mod.registerHooks==='function'&&process.features?.typescript){
 mod.registerHooks({resolve(s,c,n){if(s.startsWith('.')){const u=new URL(s,c.parentURL);if(!/\.[a-z]+$/i.test(u.pathname)&&existsSync(new URL(u.href+'.ts')))return n(u.href+'.ts',c);}return n(s,c);}});
}else mod.register('./local-ts-hooks.mjs',import.meta.url);
