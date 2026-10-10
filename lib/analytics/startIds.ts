/**
 * Start-page counters (Oct 9 2026): the ONLY ids the /start title screen may put on the beat's counter channel (`k:{id:n}`,
 * lib/analytics/countIds.ts). Fixed buckets, totals only: which button or link was tapped, never typed text, a code, an order of
 * taps or an id of anyone. Pure and tiny: the tracker bundle (countIds.ts), the click listener (startEvents.ts), the server
 * report (startReport.ts) and the tests import it. Labels live on the server (startReport.ts).
 *
 *   st:<step>      the title screen: view, Start, code made / saved, "I have a save code", restored, Play from each card, tilt
 *   sg:<step>      For grown-ups: sheet opened, each link in it, Donate → grown-up check → amount tier, donation completed
 *   sp:open        the Privacy link in the bottom row (sg:privacy is the "Read the privacy policy" link inside For grown-ups)
 *   sp:<section>   a table-of-contents entry of the privacy policy (components/privacy/PrivacyPolicy.tsx, #pp-<section>)
 */
export const START_TITLE_IDS=['view','start','created','word','word_ok','saved','play_ready','have','restored','restore_fail','play_restored',
 'returning','play_returning','other_code','break','play_break','tilt'] as const;
/** The non-profits (components/DonationLinks.tsx NONPROFITS, slugged: lower case, non-letters → _) and the Stripe tiers. */
export const START_NONPROFITS=['fc_yap','street_soccer_san_diego','ronin_futsal'] as const;
export const START_AMOUNTS=[5,10,15,25] as const;
export const START_GROWN_IDS=['open','wsv','instagram',...START_NONPROFITS,'privacy','donate','gate_ok','gate_no',...START_AMOUNTS.map(a=>'amt_'+a),'paid'] as const;
/** The privacy policy's table of contents, in order (tests check it matches PrivacyPolicy.tsx). */
export const PRIVACY_SECTION_IDS=['short','children','device','codes','plan','email','visits','tech','never','use','cookies','services','sharing',
 'retention','security','rights','regions','changes','contact'] as const;
export const START_COUNT_IDS:readonly string[]=[...START_TITLE_IDS.map(s=>'st:'+s),...START_GROWN_IDS.map(s=>'sg:'+s),'sp:open',...PRIVACY_SECTION_IDS.map(s=>'sp:'+s)];
const SET=new Set(START_COUNT_IDS);
export const isStartId=(id:unknown):id is string=>typeof id==='string'&&SET.has(id);
/** The slug a non-profit's name becomes in its `sg:` id. */
export const nonprofitSlug=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
