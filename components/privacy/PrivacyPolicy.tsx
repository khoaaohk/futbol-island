import PolicyToc from './PolicyToc';
import styles from './PrivacyPolicy.module.css';

/**
 * Futbol Island privacy policy (Oct 9 2026). One source of truth, rendered by /privacy (app/privacy/page.tsx) and by the
 * full-screen Privacy sheet on the title screen (components/landing/LegalSheets.tsx). Written from what the code actually does:
 * lib/analytics/* (visit counts), lib/saves/* + app/api/save/* (save codes, grown-up email), lib/coaches/idp/* (plan + QR links),
 * components/OfficialClipPlayer.tsx (YouTube privacy-enhanced clips on tap), app/coffee/* (Stripe donations behind the grown-up check).
 * COPPA 2025 notice items: internal operations (§312.5(c)(7)), retention policy (§312.10), security program summary (§312.8).
 * [LAWYER] Review before public launch: operator name/address, the YouTube-on-tap disclosure, state-law and UK/EU sections, and section 7a
 * (Play with friends: a typed FIRST NAME ONLY, asked for when a grown-up starts or joins a party and shown to the friends in the same party; added Oct 22 2026 at the owner's request).
 * [LAWYER] Oct 22 2026 DRAFT (owner: "fix the privacy policy to match that we do collect data, but only for sponsorship"): the policy now
 * says plainly that the game DOES collect anonymous usage data, for two purposes only (running / improving the game, and reporting
 * combined totals to sponsors so the game can be funded), and that sponsors only ever get combined totals with small groups left out.
 * Changed sections for the review to focus on: 1 (short version), 2, 4 (the code and the player number), 7 (what is collected, the
 * Play with friends and emote counts bullet from docs/analytics-multiplayer-plan.md §9, the two purposes), 7a (what we keep), 9 (never
 * collect), 10 (how we use it), 13 (sharing and selling: combined totals to sponsors), 14 (retention rows), 16 (questions / opt-out /
 * deletion), 17 (US state "sell / share" wording). This wording is a draft and must be reviewed by a lawyer (COPPA incl. the 2025
 * amendments, GDPR / UK GDPR and the Children's Code (GDPR-K), CCPA/CPRA and other US state laws) before any sponsor report leaves the team.
 * Keep this file in step with the code: if a feature starts collecting something new, it must be listed here first.
 */
export const POLICY_UPDATED='October 22, 2026';
/** Operator's legal name and postal address for the notice (COPPA §312.4(d)(1)). Set before launch. */
export const OPERATOR:{name:string;address:string|null}={name:'Futbol Island',address:null};
/** The address for privacy questions and requests. Set before launch (docs/save-codes.md). */
export const PRIVACY_CONTACT:string|null=null;

export default function PrivacyPolicy(){
 return <article className={styles.policy}>
  <p className={styles.lede}>Futbol Island is a free game that teaches children how football is played. Because it is made for children, it is built to collect as little as possible. It does collect anonymous usage data (counts and totals, never a name), for two reasons only: to run and improve the game, and to show sponsors who help pay for it combined totals such as how many players visited and how long they played. This policy explains, in plain words, what the game keeps, why, where, for how long, and what you can do about it.</p>
  <p className={styles.updated}>Last updated {POLICY_UPDATED}.</p>

  <nav className={styles.toc} aria-label="On this page"><ol>
   <li><PolicyToc href="#pp-short">The short version</PolicyToc></li>
   <li><PolicyToc href="#pp-children">Children and grown-ups</PolicyToc></li>
   <li><PolicyToc href="#pp-device">What stays on the device</PolicyToc></li>
   <li><PolicyToc href="#pp-codes">Save codes</PolicyToc></li>
   <li><PolicyToc href="#pp-plan">The football plan and QR links</PolicyToc></li>
   <li><PolicyToc href="#pp-email">Sending a code to a grown-up</PolicyToc></li>
   <li><PolicyToc href="#pp-visits">Anonymous usage data (visit counts and statistics)</PolicyToc></li>
   <li><PolicyToc href="#pp-friends">Play with friends (optional)</PolicyToc></li>
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
   <li><b>No accounts and no contact details.</b> We never ask a child for a last name, age, birthday, email, phone number, photo, voice, school or location. The one exception is the <i>Play with friends</i> feature, which asks a grown-up to type a <b>first name only</b> so friends can tell each other apart; it is shown only to that party and is never stored, logged or counted (section 7a).</li>
   <li><b>No ads, no free-text chat with other players, no tracking cookies, and no third-party analytics or advertising tools.</b> Friends in a party can only use preset emotes.</li>
   <li><b>A save code instead of an account.</b> Three easy words and a number (for example <i>striker · volley · corner · 4271</i>) keep a copy of game progress so it can be opened on another device. The code is not linked to anyone’s identity.</li>
   <li><b>We do collect anonymous usage data.</b> Things like how many visits there are, how long the game is played, which lessons and parts of the game are used, party sizes and how often emotes are used, and the kind of device. It is counted without names, and it is used for two things only: to run and improve the game, and to give sponsors <b>combined totals</b> (for example “players spent 18,000 minutes on the island this week”) so the game can stay free (section 7).</li>
   <li><b>Sponsors never get anything about one child.</b> No names or first names, no save codes or party codes, no internet addresses, and no small groups: only overall numbers.</li>
   <li><b>Links that leave the game, donations and grown-up tools sit behind a grown-up check.</b></li>
   <li><b>We never sell or rent information,</b> there are no ads, and we do not use information for targeted advertising or to build profiles of children.</li>
   <li><b>Grown-ups can see and delete a save at any time,</b> right in the game, without contacting us.</li>
  </ul></section>

  <section id="pp-children"><h2 tabIndex={-1}>2. Children and grown-ups</h2>
   <p>Futbol Island is designed for children, including children under 13, and for the parents, carers and coaches who help them. We follow the principles of the US Children’s Online Privacy Protection Act (COPPA) and the UK Age Appropriate Design Code: we collect only what the game needs to work plus the anonymous usage totals described in section 7, we keep privacy-protective settings on by default, and we do not nudge children to share more.</p>
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
   <p><b>What the code is used for:</b> only to open the player’s own saved progress on a device where the code is typed, and to keep that progress up to date while they play. These are “support for internal operations” uses. The code is not used for advertising, profiling, or contacting anyone, is never sent with visit counts (only a one-way number made from it, see “Players” in section 7), and is never shared or sold.</p>
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

  <section id="pp-visits"><h2 tabIndex={-1}>7. Anonymous usage data (visit counts and statistics)</h2>
   <p>Yes, the game collects usage data. We run our own counter (no third-party analytics), and it does not use cookies or identify anyone. We use what it collects for <b>two purposes only</b>:</p><ul>
    <li><b>to run and improve the game:</b> to see whether it works, fix problems, and learn which parts help children learn football;</li>
    <li><b>to report combined totals to sponsors</b> who help fund the game: for example how many players visited in a week, how many minutes were played, how many lessons were watched, or how many parties were played. Sponsors only ever receive overall numbers; groups too small to stay anonymous are left out (section 13).</li>
   </ul>
   <p><b>For each visit we record:</b></p><ul>
    <li>a visitor code: a scrambled value made from the network address, browser type and a random key that is replaced every day, so the same visitor can’t be recognised on another day. The network address itself is not stored;</li>
    <li>the country and, at most, the state or province, worked out by our host from the network address (never the city or a precise location);</li>
    <li>the kind of device (phone, tablet or computer), worked out from the browser type, which is then discarded;</li>
    <li>how the visitor arrived: the name of the website that linked to us (not the full address), or a campaign tag in our own links;</li>
    <li>which part of the game was opened first, from a fixed list;</li>
    <li>time spent while the game is on screen, in total and by area (for example the island, the arcade or the museum), by place on the island, by activity (such as walking, fishing or a lesson), and by 20-metre square of the island map. These are totals; we never record a route or the order in which places were visited (only, for a visit still under way, the part of the game it is in now and the one before);</li>
    <li>counts of learning steps from fixed lists: lessons opened and finished, which answer was chosen first on each quiz question, steps of the welcome walkthrough, football-plan actions, and broad progress bands (such as “1–3 lessons done”);</li>
    <li>counts of play from fixed lists: arcade games started, designs saved by their pattern or boot model (never the colours, name, number or drawing), cards added to the binder (how they were found and which footballer’s card), card films and pop-up books opened, finished or bought, and how long a book stayed open in broad bands (such as “1–3 minutes”);</li>
    <li>counts of island activities from fixed lists, such as fish caught, swims started, rides and Kit Shop designs saved (never a position, a route or a drawing);</li>
    <li>counts from Play with friends, from fixed lists: how often a party is opened, started or joined (and why a join did not work), party sizes and lengths in broad bands (such as “3–4 friends” or “15–30 minutes”), minutes played in a party, invite links shared or opened, and which preset emotes are used and where (such as on a scooter or near a townsperson). Never the party code, a name or first name, or who played with whom;</li>
    <li>which buttons and links on the start page are tapped (for example Start, For grown-ups or Donate), counted as totals;</li>
    <li>a few settings at the start of a visit, such as whether sound or the coach’s voice is switched off;</li>
    <li>whether the device has played before and whether a save code is in use on it: a yes or no each, never the code.</li>
   </ul>
   <p>We never record typed text, names or first names, save codes, party codes, network addresses or the order of a visitor’s actions. Small numbers are hidden in our day-by-day reports, and anything shown to a sponsor is a combined total with small groups left out.</p>
   <p><b>Visits under way:</b> we see each visit happening now as an anonymous session: the country and region it connects from, the website that linked to the game or our campaign tag, the part of the game it is in, and its time and counts so far, and we can look back at each day’s visits the same way for the 14 days we keep them. Never a name, an account, a network address or a precise location.</p>
   <p><b>Players:</b> the game keeps a random player number on the device (and, when a save code is in use, a number made one-way from the code), so our own reports can tell visits from the same player apart over time. It is not a name, an account, an email, a network address or a location, and it is never shared. Deleting the save or clearing this site’s data in the browser removes it from the device; the visits we already counted are deleted after 14 days.</p>
   <p><b>Do Not Track:</b> if the browser sends a “Do Not Track” or “Global Privacy Control” signal, the counter sends nothing at all.</p>
  </section>

  <section id="pp-friends"><h2 tabIndex={-1}>7a. Play with friends (optional)</h2>
   <p>Play with friends lets a small group of friends see each other on the island. It works only after a grown-up passes the grown-up check, and a grown-up can switch it off in Settings.</p>
   <p><b>What the other players in a party can see:</b> a colour chosen by the game (such as Red or Blue), the <b>first name only</b> that the player typed when starting or joining (letters only, 2 to 12 letters, needed to play with friends so friends can tell each other apart), their outfit, where they are on the island, and simple preset emotes such as a wave. There is no free-text chat, no voice, no photos, and no way to send a link or a message. Please type only a first name: never a last name, school, address or contact details.</p>
   <p><b>What we keep:</b> nothing about who the players are. We do count, as anonymous totals from fixed lists, how Play with friends is used (section 7): for example how many parties started and their sizes in broad bands, never a code, a name or who played with whom. A party exists only while it is in use (an invite code works for 8 hours and a party lasts at most 12 hours). The first name is not saved on our servers once the party ends, is not kept on the device after the visit, and is never added to visit counts, save codes or reports. Like any website, the party service sees the internet address a connection comes from; it keeps only a short-lived scrambled version in memory to stop abuse.</p>
   <p><b>Controls:</b> whoever starts a party can remove a player, lock the party, change the code, reset a player’s name back to their colour, or end the party. Any player can leave, or hide or mute another player. If you see a name that should not be there, tell a grown-up.</p>
  </section>
  <section id="pp-tech"><h2 tabIndex={-1}>8. Technical information</h2>
   <p>Like every website, our host receives standard technical information with each request (such as the network address, browser type and the page asked for) so it can deliver the page and protect the site from abuse. Our host keeps these logs for a short time under its own policy; we use them only to keep the service running and secure, and we do not combine them with save codes or visit counts.</p>
  </section>

  <section id="pp-never"><h2 tabIndex={-1}>9. What we never collect</h2>
   <p>Last names, usernames, ages or birthdays, email addresses or phone numbers (other than the one-time email in section 6; and other than the first name described in section 7a, which is never stored or counted), home or school addresses, photos, video, voice recordings, precise location, contacts, chat messages, or advertising identifiers.</p>
   <p>The anonymous usage data in section 7 is collected, but it never includes any of the things above, and nothing that identifies a child is ever given to a sponsor.</p>
  </section>

  <section id="pp-use"><h2 tabIndex={-1}>10. How we use information</h2><ul>
   <li>To run the game and keep a player’s progress (save codes).</li>
   <li>To send a code to a grown-up who asks for it, once.</li>
   <li>To understand, in totals, how the game is used, so we can fix problems and make lessons clearer.</li>
   <li>To show sponsors who help fund the game combined, anonymous totals of how it is used (section 13).</li>
   <li>To keep the site secure and prevent abuse (for example, limiting code guessing).</li>
  </ul>
  <p>We do not show ads, and we do not use information for targeted advertising, for profiling children, or to send marketing.</p></section>

  <section id="pp-cookies"><h2 tabIndex={-1}>11. Cookies and browser storage</h2>
   <p>The game does not use tracking or advertising cookies. It uses the browser’s local storage to keep the game on the device (section 3), and a per-tab session value for the visit counter that disappears when the tab is closed. Our administrators’ own sign-in uses a cookie that is never set for players.</p>
  </section>

  <section id="pp-services"><h2 tabIndex={-1}>12. Services that help run the game</h2>
   <p>These companies process information only to provide their service to us, under contracts or terms that limit their use of it:</p><ul>
    <li><b>Vercel</b> hosts the website and works out the country and region for visit counts.</li>
    <li><b>Supabase</b> stores saves and visit counts.</li>
    <li><b>Cloudflare</b> runs the party service for <i>Play with friends</i>: messages pass through it while a party is in use and are not stored afterwards.</li>
    <li><b>Resend</b> sends the one email a grown-up asks for, only when they ask.</li>
    <li><b>YouTube</b> (in its privacy-enhanced mode) plays official football clips, only when a player taps a clip to play it. When a clip plays, YouTube receives the request and may collect information under its own policies. Nothing loads from YouTube until a clip is tapped.</li>
    <li><b>Stripe</b> processes donations, which only a grown-up can start after the grown-up check. Payment details go directly to Stripe; we do not receive card numbers.</li>
    <li><b>football-data.org</b> and <b>ESPN</b> provide public match scores and news. Our server fetches these; no information about players is sent to them.</li>
   </ul>
   <p>Pictures of players and historical images are stored on our own site, so viewing them does not contact other websites. Links that open other websites are behind the grown-up check.</p>
  </section>

  <section id="pp-sharing"><h2 tabIndex={-1}>13. Sharing and selling</h2>
   <p><b>We do not sell or rent personal information, and we never share anything that identifies a child.</b> We share information only with the services above to run the game, or if the law requires it (for example, a valid legal order).</p>
   <p><b>Sponsors:</b> we do share combined, anonymous totals with sponsors and supporters who help fund the game (for example, “players spent 18,000 minutes on the island this week” or “400 parties were played”). These totals never describe any one player: they contain no names or first names, save codes, party codes, internet addresses, player numbers or anything about an individual child, and groups too small to stay anonymous are left out. Sponsors do not get access to our systems and cannot use these totals to reach or advertise to any child.</p>
   <p> If Futbol Island ever changed hands, this policy would continue to apply to information already collected, and we would tell you about any change in advance.</p>
  </section>

  <section id="pp-retention"><h2 tabIndex={-1}>14. How long we keep things (our retention policy)</h2>
   <div className={styles.tableWrap}><table>
    <thead><tr><th>Information</th><th>Why</th><th>How long</th></tr></thead>
    <tbody>
     <tr><td>Saved game progress (with a save code)</td><td>So the player can continue on any device</td><td>Until deleted, or automatically 12 months after it was last used. Backups roll off within 7 days of deletion.</td></tr>
     <tr><td>Code-guessing limits (scrambled network fingerprint)</td><td>Security</td><td>At most 1 day</td></tr>
     <tr><td>The one-time email address</td><td>To send the code once</td><td>Not kept: discarded after sending</td></tr>
     <tr><td>Visit-count details</td><td>Understanding use, fixing problems</td><td>14 days, then only daily totals are kept</td></tr>
     <tr><td>Daily totals (no visitor codes)</td><td>Long-term trends, and the combined totals shown to sponsors</td><td>Kept long-term, as they contain no information about any one visitor</td></tr>
     <tr><td>Totals reported to sponsors</td><td>Funding the game</td><td>Kept in reports; they describe no one and leave out small groups</td></tr>
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
    <li><b>stop usage counting:</b> turn on “Do Not Track” or Global Privacy Control in the browser, and the counter sends nothing at all from that browser;</li>
    <li><b>clear everything on a device:</b> clear this site’s data in the browser settings.</li>
   </ul>
   <p>Because we hold no names or emails, we can find a save only from its code. If you contact us with a request, please include the save code so we can act on it, and we will then delete our copy of your message.</p>
   <p><b>Usage data:</b> the details of each visit are deleted automatically after 14 days. Because they carry no name or contact details, we cannot pick out one child’s visits to delete them sooner; the daily and sponsor totals describe no one. You can ask us any question about this data using the contact in section 19.</p>
  </section>

  <section id="pp-regions"><h2 tabIndex={-1}>17. If you live in the UK, EU or a US state with privacy laws</h2>
   <p>Depending on where you live, you may have rights to access, correct, delete or move information about you or your child, to object to or restrict how it is used, and to complain to a regulator (in the UK, the Information Commissioner’s Office). We use the information described here because it is necessary to provide the game you asked for, and for our legitimate interest in keeping it working, safe and useful for learning, in ways children would reasonably expect. We do not sell or “share” personal information as those terms are used in US state laws, and we do not use it for targeted advertising or profiling. The totals we give sponsors are combined, de-identified figures that do not describe any person.</p>
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
