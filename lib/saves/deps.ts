/**
 * Server wiring for the save routes: the store, the pepper and the email provider from the environment (server only; none of
 * these is ever prefixed NEXT_PUBLIC_). docs/save-codes.md lists the variables.
 */
import {emailProvider} from './email';
import {getSaveStore} from './store';
import type {SaveDeps} from './server';

export function saveDeps():SaveDeps{
 return {store:getSaveStore(),pepper:process.env.SAVE_CODE_PEPPER,
  email:emailProvider({RESEND_API_KEY:process.env.RESEND_API_KEY,SAVE_EMAIL_FROM:process.env.SAVE_EMAIL_FROM,SAVE_EMAIL_LOG:process.env.SAVE_EMAIL_LOG,VERCEL:process.env.VERCEL})};
}
