/**
 * The /admin status line for save codes (Oct 10 2026): is the table installed, is the grown-up email set up, how many saves
 * exist. Counts only: never a code, a hash or a save's contents. Server only; called after the admin session check.
 */
import {saveDeps} from './deps';
import {pepperOk} from './server';

export async function saveAdminLine():Promise<string>{
 const {store,pepper,email}=saveDeps();
 if(!store)return 'Save codes: not configured (no Supabase key).';
 let version=0;try{version=await store.schemaVersion();}catch{}
 if(version<1)return 'Save codes: table not installed. Run supabase/migrations/20261010_game_saves.sql (docs/save-codes.md).';
 let count='?';try{count=(await store.stats()).saves.toLocaleString('en-US');}catch{}
 const mail=email?.kind==='resend'?'grown-up email on':email?.kind==='log'?'grown-up email in log mode':'grown-up email off (no RESEND_API_KEY / SAVE_EMAIL_FROM)';
 return `Save codes: table installed · ${pepperOk(pepper)?'pepper set':'SAVE_CODE_PEPPER missing, saving is off'} · ${mail} · ${count} saves`;
}
