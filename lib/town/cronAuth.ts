// Server only. Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when the CRON_SECRET env var is set on the project.
// No secret configured -> every request is refused (the route never runs unauthenticated).
import {timingSafeEqual} from 'node:crypto';
export function isCronAuthorized(header:string|null,secret=process.env.CRON_SECRET):boolean{
 if(!secret||!header)return false;
 const expected=Buffer.from(`Bearer ${secret}`),given=Buffer.from(header);
 return given.length===expected.length&&timingSafeEqual(given,expected);
}
