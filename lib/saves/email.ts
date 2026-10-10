/**
 * "Send my code to a grown-up" (docs/accounts-design.md §2 option 6, phase 2a; Oct 9 2026). Server only.
 *
 * One email to an address a grown-up types (behind the ParentGate), then the address is gone: it is never stored, logged,
 * cached or put in a URL. COPPA §312.5(c)(2)/(c)(3) one-time contact [LAWYER: confirm which one fits].
 * The email is plain text only (no HTML, so no tracking pixel) and has no links at all, so nothing in it can identify a
 * player or a save: the code, one line about what it is, and how to delete the save.
 *
 * Providers sit behind EmailProvider. The default is Resend's HTTPS API over fetch (no SDK). Configured by RESEND_API_KEY and
 * SAVE_EMAIL_FROM (e.g. `Futbol Island <codes@futbolisland.app>`); with either missing the option is hidden in the game.
 * SAVE_EMAIL_LOG=1 (never on Vercel) is a local test mode: it prints the email with the code masked and never the address.
 */
/** `secret`: the code as it appears in `text`, so log mode can mask it (it is never written to a log). */
export type OutgoingEmail={to:string;subject:string;text:string;secret?:string};
export interface EmailProvider{kind:'resend'|'log';send(mail:OutgoingEmail):Promise<boolean>}

export function resendProvider(apiKey:string,from:string,fetchImpl:typeof fetch=fetch):EmailProvider{
 return {kind:'resend',async send(mail){
  try{
   const res=await fetchImpl('https://api.resend.com/emails',{method:'POST',cache:'no-store',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({from,to:[mail.to],subject:mail.subject,text:mail.text})});
   // Only the status is looked at; the response body (which echoes nothing useful) is discarded.
   try{await res.arrayBuffer();}catch{}
   return res.ok;
  }catch{return false;}
 }};
}

/** Local test mode: the email's text with the code masked. The address is never printed. */
export function logProvider(print:(line:string)=>void=line=>console.log(line)):EmailProvider{
 return {kind:'log',async send(mail){
  // The code (and its picture line, which spells the same words) are the indented lines: every one is masked.
  const text=(mail.secret?mail.text.split(mail.secret).join('«code»'):mail.text).replace(/^ {4}\S.*$/gm,'    «code»');
  print(`[save-email] log mode, not sent. Subject: ${mail.subject}\n${text.replace(/^/gm,'  | ')}`);
  return true;
 }};
}

export type EmailEnv={RESEND_API_KEY?:string;SAVE_EMAIL_FROM?:string;SAVE_EMAIL_LOG?:string;VERCEL?:string};
export function emailProvider(env:EmailEnv):EmailProvider|null{
 if(env.RESEND_API_KEY&&env.SAVE_EMAIL_FROM)return resendProvider(env.RESEND_API_KEY,env.SAVE_EMAIL_FROM);
 if(env.SAVE_EMAIL_LOG==='1'&&!env.VERCEL)return logProvider();
 return null;
}

/** A plain address: one @, a dotted domain, no spaces or line breaks, ≤ 254 characters. */
export function validEmail(s:unknown):s is string{
 return typeof s==='string'&&s.length>=6&&s.length<=254&&!/[\s<>,;:"\\]/.test(s)&&/^[^@]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s);
}

export const EMAIL_SUBJECT='Your Futbol Island save code';
/** The whole email. `display` is the code as kids see it ("striker · volley · corner · 4271"); `pictures` (optional) is the same
 *  code with each word's picture ("⚽ striker · 🏐 volley · 🚩 corner · 🔢 4271", code.ts pictureLine), on its own line below. */
export function emailText(display:string,pictures=''):string{
 return [
  'Here is the Futbol Island save code you asked for:',
  '',
  `    ${display}`,
  ...(pictures?[`    ${pictures}`]:[]),
  '',
  'Type it into Futbol Island ("I have a save code") to open this island on any phone, tablet or computer. Keep it safe, like a key.',
  '',
  'To delete the save: in Futbol Island open Settings, then "My save code", then "Delete my save". Saves not used for 12 months are deleted automatically.',
  '',
  'We sent this one email because a grown-up asked for it in the game. We did not keep this email address and will not write again.',
 ].join('\n');
}
