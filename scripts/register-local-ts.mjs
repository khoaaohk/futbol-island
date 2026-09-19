import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('.')){const u=new URL(s,c.parentURL);if(!/\.[a-z]+$/i.test(u.pathname)&&existsSync(new URL(u.href+'.ts')))return n(u.href+'.ts',c);}return n(s,c);}});
