import PolicyToc from './PolicyToc';
import styles from './PrivacyPolicy.module.css';

/**
 * Futbol Island privacy policy (Oct 9 2026). One source of truth, rendered by /privacy (app/privacy/page.tsx) and by the
 * full-screen Privacy sheet on /start (components/landing/LegalSheets.tsx). Written from what the code actually does:
 * lib/analytics/* (visit counts), lib/saves/* + app/api/save/* (save codes, grown-up email), lib/coaches/idp/* (plan + QR links),
 * components/OfficialClipPlayer.tsx (YouTube privacy-enhanced clips on tap), app/coffee/* (Stripe donations behind the grown-up check).
 * COPPA 2025 notice items: internal operations (§312.5(c)(7)), retention policy (§312.10), security program summary (§312.8).
 * [LAWYER] Review before public launch: operator name/address, the YouTube-on-tap disclosure, state-law and UK/EU sections.
 * Keep this file in step with the code: if a feature starts collecting something new, it must be listed here first.
 */
export const POLICY_UPDATED='October 9, 2026';
/** Operator's legal name and postal address for the notice (COPPA §312.4(d)(1)). Set before launch. */
export const OPERATOR:{name:string;address:string|null}={name:'Futbol Island',address:null};
/** The address for privacy questions and requests. Set before launch (docs/save-codes.md). */
export const PRIVACY_CONTACT:string|null=null;

export default function PrivacyPolicy(){
 return <article className={styles.policy}>
  <p className={styles.lede}>Futbol Island is a free game that teaches children how football is played. Because it is made for children, it is built to collect as little as possible. This policy explains, in plain words, what the game keeps, why, where, for how long, and what you can do about it.</p>
  <p className={styles.updated}>Last updated {POLICY_UPDATED}.</p>

  <nav className={styles.toc} aria-label="On this page"><ol>
   <li><PolicyToc href="#pp-short">The short version</PolicyToc></li>
   <li><PolicyToc href="#pp-children">Children and grown-ups</PolicyToc></li>
   <li><PolicyToc href="#pp-device">What stays on the device</PolicyToc></li>
   <li><PolicyToc href="#pp-codes">Save codes</PolicyToc></li>
   <li><PolicyToc href="#pp-plan">The football plan and QR links</PolicyToc></li>
   <li><PolicyToc href="#pp-email">Sending a code to a grown-up</PolicyToc></li>
   <li><PolicyToc href="#pp-visits">Visit counts and learning statistics</PolicyToc></li>
   <li><PolicyToc href="#pp-tech">Technical information</PolicyToc></li>
   <li><PolicyToc href="#pp-never">What we never collect</PolicyToc></li>
   <li><PolicyToc href="#pp-use">How we use information</PolicyToc></li>
   <li><PolicyToc href="#pp-cookies">Cookies and browser storage</PolicyToc></li>
   <li><PolicyToc href="#pp-services">Services that help run the game</PolicyToc></li>
   <li><PolicyToc href="#pp-sharing">Sharing and selling</PolicyToc></li>
   <li><PolicyToc href="#pp-retention">How long we keep things</PolicyToc></li>
   <li><PolicyToc href="#pp-security">How we protect it</PolicyToc></li>
   <li><PolicyToc href="#pp-rights">Your choices and rights</PolicyToc></li>
   <li><PolicyToc href="#pp-regions">If you live in the UK, EU or a US state with privacy laws</PolicyToc></li>
   <li><PolicyToc href="#pp-changes">Changes to this policy</PolicyToc></li>
   <li><PolicyToc href="#pp-contact">Contact</PolicyToc></li>
  </ol></nav>

  <section id="pp-short"><h2 tabIndex={-1}>1. The short version</h2><ul>
   <li><b>No accounts and no personal details.</b> We never ask a child for a name, age, birthday, email, phone number, photo, voice, school or location.</li>
   <li><b>No ads, no chat with other players, no tracking cookies, and no third-party analytics or advertising tools.</b></li>
   <li><b>A save code instead of an account.</b> Three football words and a number (for example <i>striker · volley · corner · 427</i>) keep a copy of game progress so it can be opened on another device. The code is not linked to anyone’s identity.</li>
   <li><b>We count visits without identifying anyone.</b> Totals only, with a scrambled visitor code that changes every day.</li>
   <li><b>Links that leave the game, donations and grown-up tools sit behind a grown-up check.</b></li>
   <li><b>We never sell or rent information,</b> and we do not use it for advertising or to build profiles of children.</li>
   <li><b>Grown-ups can see and delete a save at any time,</b> right in the game, without contacting us.</li>
  </ul></section>

  <section id="pp-children"><h2 tabIndex={-1}>2. Children and grown-ups</h2>
   <p>Futbol Island is designed for children, including children under 13, and for the parents, carers and coaches who help them. We follow the principles of the US Children’s Online Privacy Protection Act (COPPA) and the UK Age Appropriate Design Code: we collect only what the game needs to work, we keep privacy-protective settings on by default, and we do not nudge children to share more.</p>
   <p>Children are never asked to type personal information into the game. Places where a grown-up may type something (a note in the football plan, or an email address to receive a save code) are behind a grown-up check, and what is typed is handled as described below.</p>
  </section>

  <section id="pp-device"><h2 tabIndex={-1}>3. What stays on the device</h2>
   <p>Most of the game lives only in the web browser on the device being used (its “local storage”). This includes coins, cards, lessons and quiz progress, the character’s look, items, island jobs, fishing, museum visits, arcade best scores, the football plan, and settings such as sound, music, voice and controls.</p>
   <p>This information is not sent to us unless a save code is used (section 4). Clearing this site’s data in the browser deletes it from the device.</p>
   <p>Some things always stay on the device and are never uploaded, even with a save code: notes typed into the football plan or the coach tools, volume and control settings, and battery-saver settings.</p>
  </section>

  <section id="pp-codes"><h2 tabIndex={-1}>4. Save codes</h2>
   <p>To play, each player gets a save code (or types one they already have). The game makes the code at random; it does not come from anything about the player.</p>
   <p><b>What we keep on our server:</b> a copy of the game progress (the same game data listed in section 3, minus the device-only items), a revision number, the day the save was made and the day it was last used.</p>
   <p><b>What we don’t keep:</b> the code itself. We store only a keyed fingerprint of it (HMAC-SHA256, with a secret key kept separately from the database), so the code cannot be read back from our records. We do not keep names, emails, photos, voice, location, IP addresses or device details with a save.</p>
   <p><b>What the code is used for:</b> only to open the player’s own saved progress on a device where the code is typed, and to keep that progress up to date while they play. These are “support for internal operations” uses. The code is not used for advertising, profiling, or contacting anyone, is not linked with visit counts, and is never shared or sold.</p>
   <p><b>Two devices:</b> if a player has played on two devices, the game asks which island to keep. The one not chosen stays on that device for 7 days so the choice can be undone in Settings.</p>
   <p><b>If saving is unavailable</b> (for example during maintenance), a player can still play; progress stays on the device and the game offers the save code again later.</p>
   <p><b>Protecting codes from guessing:</b> wrong guesses are limited per network and across the whole site, and the game gives the same answer whether a code exists or not. To apply these limits, a scrambled, day-specific fingerprint of the network address is kept for at most one day.</p>
  </section>

  <section id="pp-plan"><h2 tabIndex={-1}>5. The football plan and QR links</h2>
   <p>The football plan helps a player choose one or two “I can…” goals, practise them, and talk about how it’s going. The plan is made of choices from fixed lists: goal and mission identifiers, dates, and picture choices such as a face for “how it felt”. With a save code, these choices are saved with the game progress. Typed notes are never uploaded.</p>
   <p><b>Fridge cards and coach QR codes</b> carry a plan or a goal inside the link itself, after the “#” sign. Browsers do not send that part of a link to any server, so opening a fridge card or a coach’s goal on a phone shares nothing with us. Opening any page on our site does make a normal web request (see section 8).</p>
   <p>The plan never scores, ranks or compares children.</p>
  </section>

  <section id="pp-email"><h2 tabIndex={-1}>6. Sending a code to a grown-up</h2>
   <p>After the grown-up check, a grown-up can ask us to email the save code once. The email address is used only to send that one email and is then discarded: it is not stored, logged, shared, or used to write again. The email contains the code, what it is for, and how to delete the save. It has no links, images or tracking.</p>
  </section>

  <section id="pp-visits"><h2 tabIndex={-1}>7. Visit counts and learning statistics</h2>
   <p>We run our own visit counter so we can see whether the game is working and which parts help children learn. It does not use cookies and does not identify anyone.</p>
   <p><b>For each visit we record:</b></p><ul>
    <li>a visitor code: a scrambled value made from the network address, browser type and a random key that is replaced every day, so the same visitor can’t be recognised on another day. The network address itself is not stored;</li>
    <li>the country and, at most, the state or province, worked out by our host from the network address (never the city or a precise location);</li>
    <li>the kind of device (phone, tablet or computer), worked out from the browser type, which is then discarded;</li>
    <li>how the visitor arrived: the name of the website that linked to us (not the full address), or a campaign tag in our own links;</li>
    <li>which part of the game was opened first, from a fixed list;</li>
    <li>time spent while the game is on screen, in total and by area (for example the island, the arcade or the museum), by place on the island, by activity (such as walking, fishing or a lesson), and by 20-metre square of the island map. These are totals; we never record a route or the order in which places were visited;</li>
    <li>counts of learning steps from fixed lists: lessons opened and finished, which answer was chosen first on each quiz question, steps of the welcome walkthrough, football-plan actions, and broad progress bands (such as “1–3 lessons done”);</li>
    <li>which buttons and links on the start page are tapped (for example Start, For grown-ups or Donate), counted as totals;</li>
    <li>a few settings at the start of a visit, such as whether sound or the coach’s voice is switched off.</li>
   </ul>
   <p>We never record typed text, names, save codes, the order of a visitor’s actions, or anything that would let us follow one child. Small numbers (fewer than 5 visits) are hidden in our own reports.</p>
   <p><b>Do Not Track:</b> if the browser sends a “Do Not Track” or “Global Privacy Control” signal, the counter sends nothing at all.</p>
  </section>

  <section id="pp-tech"><h2 tabIndex={-1}>8. Technical information</h2>
   <p>Like every website, our host receives standard technical information with each request (such as the network address, browser type and the page asked for) so it can deliver the page and protect the site from abuse. Our host keeps these logs for a short time under its own policy; we use them only to keep the service running and secure, and we do not combine them with save codes or visit counts.</p>
  </section>

  <section id="pp-never"><h2 tabIndex={-1}>9. What we never collect</h2>
   <p>Names, usernames, ages or birthdays, email addresses or phone numbers (other than the one-time email in section 6), home or school addresses, photos, video, voice recordings, precise location, contacts, chat messages, or advertising identifiers.</p>
  </section>

  <section id="pp-use"><h2 tabIndex={-1}>10. How we use information</h2><ul>
   <li>To run the game and keep a player’s progress (save codes).</li>
   <li>To send a code to a grown-up who asks for it, once.</li>
   <li>To understand, in totals, how the game is used, so we can fix problems and make lessons clearer.</li>
   <li>To keep the site secure and prevent abuse (for example, limiting code guessing).</li>
  </ul>
  <p>We do not use information for advertising, for profiling children, or to send marketing.</p></section>

  <section id="pp-cookies"><h2 tabIndex={-1}>11. Cookies and browser storage</h2>
   <p>The game does not use tracking or advertising cookies. It uses the browser’s local storage to keep the game on the device (section 3), and a per-tab session value for the visit counter that disappears when the tab is closed. Our administrators’ own sign-in uses a cookie that is never set for players.</p>
  </section>

  <section id="pp-services"><h2 tabIndex={-1}>12. Services that help run the game</h2>
   <p>These companies process information only to provide their service to us, under contracts or terms that limit their use of it:</p><ul>
    <li><b>Vercel</b> hosts the website and works out the country and region for visit counts.</li>
    <li><b>Supabase</b> stores saves and visit counts.</li>
    <li><b>Resend</b> sends the one email a grown-up asks for, only when they ask.</li>
    <li><b>YouTube</b> (in its privacy-enhanced mode) plays official football clips, only when a player taps a clip to play it. When a clip plays, YouTube receives the request and may collect information under its own policies. Nothing loads from YouTube until a clip is tapped.</li>
    <li><b>Stripe</b> processes donations, which only a grown-up can start after the grown-up check. Payment details go directly to Stripe; we do not receive card numbers.</li>
    <li><b>football-data.org</b> and <b>ESPN</b> provide public match scores and news. Our server fetches these; no information about players is sent to them.</li>
   </ul>
   <p>Pictures of players and historical images are stored on our own site, so viewing them does not contact other websites. Links that open other websites are behind the grown-up check.</p>
  </section>

  <section id="pp-sharing"><h2 tabIndex={-1}>13. Sharing and selling</h2>
   <p>We do not sell, rent or share information for money or advertising. We share information only with the services above to run the game, or if the law requires it (for example, a valid legal order). If Futbol Island ever changed hands, this policy would continue to apply to information already collected, and we would tell you about any change in advance.</p>
  </section>

  <section id="pp-retention"><h2 tabIndex={-1}>14. How long we keep things (our retention policy)</h2>
   <div className={styles.tableWrap}><table>
    <thead><tr><th>Information</th><th>Why</th><th>How long</th></tr></thead>
    <tbody>
     <tr><td>Saved game progress (with a save code)</td><td>So the player can continue on any device</td><td>Until deleted, or automatically 12 months after it was last used. Backups roll off within 7 days of deletion.</td></tr>
     <tr><td>Code-guessing limits (scrambled network fingerprint)</td><td>Security</td><td>At most 1 day</td></tr>
     <tr><td>The one-time email address</td><td>To send the code once</td><td>Not kept: discarded after sending</td></tr>
     <tr><td>Visit-count details</td><td>Understanding use, fixing problems</td><td>14 days, then only daily totals are kept</td></tr>
     <tr><td>Daily totals (no visitor codes)</td><td>Long-term trends</td><td>Kept, as they contain no information about any one visitor</td></tr>
     <tr><td>The daily random key for visitor codes</td><td>Making visitor codes unlinkable between days</td><td>Deleted the next day</td></tr>
     <tr><td>Information on the device</td><td>Playing the game</td><td>Until the browser’s site data is cleared</td></tr>
    </tbody>
   </table></div>
  </section>

  <section id="pp-security"><h2 tabIndex={-1}>15. How we protect it</h2><ul>
   <li>Saves and visit counts can be reached only by our server with a secret key; the database refuses every other request.</li>
   <li>The key used to fingerprint save codes is kept apart from the database.</li>
   <li>Every uploaded save is checked against a fixed list of game data and capped in size, so nothing else can be stored.</li>
   <li>All connections use encryption (HTTPS).</li>
   <li>Code guessing is rate-limited, and a firewall watches for unusual traffic.</li>
   <li>Access to our systems is limited to the people who run the game.</li>
  </ul></section>

  <section id="pp-rights"><h2 tabIndex={-1}>16. Your choices and rights</h2>
   <p><b>Parents and carers</b> can, at any time and without asking us:</p><ul>
    <li><b>see</b> what is saved: For grown-ups shows a summary of the saved progress, and “Show my code” shows the code;</li>
    <li><b>delete</b> the save: Settings → My save code → Delete my save, or For grown-ups → Saving progress. It is removed from our server immediately;</li>
    <li><b>stop further saving:</b> after deleting the save, that device won’t upload anything until a code is made or typed again;</li>
    <li><b>stop visit counting:</b> turn on “Do Not Track” or Global Privacy Control in the browser;</li>
    <li><b>clear everything on a device:</b> clear this site’s data in the browser settings.</li>
   </ul>
   <p>Because we hold no names or emails, we can find a save only from its code. If you contact us with a request, please include the save code so we can act on it, and we will then delete our copy of your message.</p>
  </section>

  <section id="pp-regions"><h2 tabIndex={-1}>17. If you live in the UK, EU or a US state with privacy laws</h2>
   <p>Depending on where you live, you may have rights to access, correct, delete or move information about you or your child, to object to or restrict how it is used, and to complain to a regulator (in the UK, the Information Commissioner’s Office). We use the information described here because it is necessary to provide the game you asked for, and for our legitimate interest in keeping it working, safe and useful for learning, in ways children would reasonably expect. We do not sell or “share” personal information as those terms are used in US state laws, and we do not use it for targeted advertising or profiling.</p>
   <p>Our service providers may process information in the United States and other countries. Where required, they use recognised safeguards for international transfers.</p>
  </section>

  <section id="pp-changes"><h2 tabIndex={-1}>18. Changes to this policy</h2>
   <p>If we change this policy, we will update the date at the top. If a change would mean collecting more information or using it in a new way, we will not do so for children’s information until the change is clearly shown in the game and on this page, and, where the law requires, a parent has agreed.</p>
  </section>

  <section id="pp-contact"><h2 tabIndex={-1}>19. Contact</h2>
   <p>{OPERATOR.name}{OPERATOR.address?<>, {OPERATOR.address}</>:null}.</p>
   <p>{PRIVACY_CONTACT?<>Privacy questions and requests: <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>.</>:<>A contact address for privacy questions will be listed here. Meanwhile, “Delete my save” in the game removes a save straight away.</>}</p>
  </section>
 </article>;
}
