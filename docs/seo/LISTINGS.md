# Listings kit: where to post Futbol Island, and what to paste (Nov 10 2026)

Why: links from other sites are what gets a new domain crawled and trusted by Google. This is a ready-to-paste kit for the
owner. Every claim below comes from the About page (`app/(site)/about/page.tsx`, `lib/site/aboutCopy.ts`), the home page and
the privacy facts (`lib/site/safety.ts`). Wording rules from `safety.ts` apply: say "no open chat" (never "no chat"), never
"COPPA compliant", "certified" or "no data collected".

Numbers used below were counted from the repo on Nov 10 2026: 96 lessons, 450 player and coach cards, 22 museum exhibits,
150 sea animals, 5 arcade games. They grow; check `/learn/lessons`, `/cards`, `/exhibits` and `/fish` before posting.

How each place was checked: with a web search and a fetch of the page on Nov 10 2026. Where a page could not be read
(Reddit blocks automated reading), it says **not verified** and tells you what to read yourself before posting.

---

## A. The copy (use these everywhere)

**Name:** Futbol Island

**Link:** https://futbolisland.app (the game itself: https://futbolisland.app/play)

**Title (under 60 characters):** Futbol Island: learn football (soccer) on an island

**One-line pitch:** A free browser game where kids 7 to 12 learn football (soccer) positions, passing, rules and history by exploring an island.

**Short description (100 words):**

Futbol Island is a free football (soccer) learning game for kids aged 7 to 12. It runs in the web browser on phones, tablets
and computers, with nothing to download and no sign-up. Kids explore an island and learn where to stand, when to pass and how
a team keeps its shape, through short lessons for 7v7, 9v9, 11v11 and futsal. Each lesson plays out on a pitch with moving
players, a coach explains every step, and a quick quiz checks the idea. There is also a museum of football history, player
cards to collect and fishing. No ads, no accounts, no open chat.

**Long description (300 words):**

Futbol Island is a free football (soccer) learning game for kids aged 7 to 12. It runs in the web browser on phones, tablets
and computers. There is nothing to download and no sign-up.

Many young players learn best by seeing it. Yet a lot of the basics, like where to stand, when to pass and how a team keeps
its shape, rarely get taught at club or recreational practice, where time goes to drills and games. Futbol Island is made to
close that gap. Every idea is shown on a pitch with moving players, a coach voice explains it step by step, and a quick quiz
checks it.

There are 96 short lessons for 7v7, 9v9, 11v11 and futsal. They cover positions and team shape, getting open for a pass,
wall passes, switching play, defending, and restarts such as goal kicks, the build-out line, kick-ins, corners and free
kicks. The lesson pages on the website list each quiz question but never mark the right answer, so kids answer on the pitch.

Around the lessons is an island to explore. A history museum has 22 exhibits, from the first Laws of the Game in 1863 to the
video assistant referee. A card binder holds 450 player and coach cards, each with the player's position, strengths and
clubs. Fishing doubles as a goalkeeper lesson: stay set, do not bite on a feint, then react fast. Each of the 150 sea animals
is linked to a real club, team or football story. An arcade has five football games that practise one skill at a time.

It is built for children, so it has no ads, no accounts and no open chat. Progress is kept with a save code of football
words and a number. Friends can play together in a private party that a grown-up starts, and they can only use preset emotes.

**Tags:** football, soccer, kids, educational, learning, sports, browser game, HTML5, free, no ads, youth soccer, coaching,
futsal, 7v7, 9v9, 11v11, quiz, tactics, positions

**What it is, who made it, and how it treats children (paste this where people ask "what's the catch?"):**

Futbol Island is a free learning game, built in San Diego in partnership with White Sports Ventures, which was founded by
former U.S. Men's National Team player Jeremiah White III. There are no ads, no accounts and no open chat: no free-text chat
and no voice chat, and friends in a private party can only use preset emotes. The game never asks a child for a last name,
age, email, photo, school or location. The one exception is the optional Play with friends feature, where a grown-up types a
first name that is shown only to that party and is not kept. It uses no tracking or advertising cookies and no third-party
analytics. It does count anonymous usage totals (visits, play time, which lessons are used) to run and improve the game and
to show sponsors combined totals that help keep it free. Nothing is sold and nothing about one child is shared. Coins in the
game are earned by playing, never bought. There is an optional donation link behind a grown-up check, and donations go to
local non-profits that grow the game. Privacy policy: https://futbolisland.app/privacy. Parents' guide:
https://futbolisland.app/safe-football-game-for-kids.

**Good pages to link besides the home page:** `/learn/lessons`, `/learn/football-rules-for-kids`, `/learn/soccer-quiz-for-kids`,
`/learn/futsal-for-kids`, `/learn/7v7-9v9-11v11`, `/safe-football-game-for-kids`, `/about`.

**Pictures:** the site's share picture `https://futbolisland.app/opengraph-image.png` (1200×630). Most places below also want
3 to 5 screenshots and a square icon (`app/icon.png`); take screenshots of a lesson on the pitch, the island, the museum and a
quiz. Do not use a picture with a real child in it.

---

## B. Game pages

### 1. itch.io (HTML5 game page)

- **Where:** https://itch.io/game/new (needs a free itch.io account). Docs: https://itch.io/docs/creators/html5
- **What it requires (checked):** an HTML5 project is an uploaded single HTML file or a ZIP that contains `index.html`, with
  relative paths only. Limits: 1,000 files, 500 MB extracted, 200 MB per file, 240 characters per path.
- **What that means for us:** Futbol Island is a hosted Next.js site, not a ZIP, and the site sends `X-Frame-Options:
  SAMEORIGIN`, so it cannot be shown inside itch.io's frame. Do not change that header for a listing. The honest option is a
  project page that points to the game: set **Pricing: No payments**, add screenshots, and put a clear "Play free in your
  browser: https://futbolisland.app/play" link at the top of the description. itch.io wants a file before a page can go
  public, so upload a one-file `index.html` (Kind of project: HTML) that says the game runs at futbolisland.app, with one
  link to it that opens in a new tab. **Not verified:** whether itch.io staff index a page whose game is only a link out;
  such pages can be left out of browse and search. Treat it as a link and a profile, not as a source of players.
- **Paste:** Title; one-line pitch as the "Short description or tagline"; the 300-word description; tags (itch.io allows up
  to 10: `football`, `soccer`, `educational`, `kids`, `sports`, `browser`, `quiz`, `free`, `learning`, `futsal`).
  Classification: Games. Genre: Educational. Add the "what it is" paragraph at the end.

### 2. CrazyGames (developer submission)

- **Where:** https://developer.crazygames.com/ . Requirements: https://docs.crazygames.com/requirements/intro/
- **What it requires (checked):** you upload the game build to them. Initial download 50 MB or less; total 50 MB without their
  SDK (250 MB with it); 1,500 files or fewer. A "Basic Launch" has their monetization off and no external login. A "Full
  Launch" needs the CrazyGames SDK, shows ads through that SDK ("Only ads served through our SDK are allowed") and ties
  progress to a CrazyGames account.
- **Owner decision before submitting:** this is an ad-funded portal. A full launch there would put ads next to a game whose
  promise is "no ads" and would add an account system. The game is also a hosted app with a server (save codes, parties),
  not a 50 MB static build. Recommendation: do **not** submit the full game. If a listing is still wanted, it would have to
  be a small stand-alone build (for example one arcade game or a set of lessons) as a Basic Launch with no ads, and the copy
  must not say "no ads" about a page that shows them. That is new build work, not a paste job.
- **Paste (only for a stand-alone build):** Title; 100-word description; tags `soccer`, `football`, `sports`, `educational`,
  `kids`; controls: "Tap or click. On a phone, use the on-screen stick and buttons."

### 3. Poki (developer submission)

- **Where:** https://developers.poki.com/ (Poki for Developers). Requirements page: https://developers.poki.com/guide/requirements-quality
- **What it requires:** **not verified from Poki's own page** (it redirected and was not read). Third-party guides say: a
  human team reviews every game, the Poki SDK is required, the first download should be very small (one guide says under
  8 MB), Poki usually asks for web exclusivity (the game could then not stay playable on futbolisland.app), and Poki's own
  site says developer access is in a closed beta. Read the requirements page yourself before spending time.
- **Owner decision:** the same as CrazyGames, and stronger: an ad-funded portal that asks for web exclusivity does not fit a
  free, ad-free game that lives on its own domain. Recommendation: skip Poki.
- **Paste (if you still apply with a stand-alone build):** one-line pitch; 100-word description; the "what it is" paragraph.

---

## C. Reviews and launches

### 4. Common Sense Media (review request)

- **Where:** Help Center https://commonsense.my.site.com/membersupport/s/ and its contact form
  https://commonsense.my.site.com/membersupport/s/contactsupport . Their FAQ: https://www.commonsensemedia.org/about-us/our-mission/faqs
- **What it requires (checked):** there is no public "submit your game" form on the FAQ. The site points review requests to
  the Help Center. They choose what to review themselves and do not promise a review. Their sister site for schools, Common
  Sense Education, says "We are not completing new reviews or review updates at this time" (checked Nov 10 2026), so do not
  send an education request now.
- **Paste (contact form, topic: suggest a title for review):**

  > Subject: Review suggestion: Futbol Island, a free football (soccer) learning game for ages 7 to 12
  >
  > Hello. I would like to suggest Futbol Island (https://futbolisland.app) for a review. It is a free browser game where
  > kids aged 7 to 12 learn football (soccer) positions, passing, rules and history through short lessons and quizzes. It
  > has no ads, no accounts and no open chat, and it never asks a child for personal details. Our privacy policy is at
  > https://futbolisland.app/privacy and a parents' guide is at https://futbolisland.app/safe-football-game-for-kids. I am
  > part of the team that makes it and I am happy to answer any question. Thank you for considering it.

  Say that you are the maker. Do not ask for a rating or an age.

### 5. Product Hunt

- **Where:** https://www.producthunt.com/posts/new (needs a personal account; post as a maker, not a company account).
- **What it requires:** a name, a tagline of 60 characters or fewer, a link, a description of 260 characters or fewer, topics,
  a square thumbnail and at least two gallery pictures, and a first comment from the maker. **Not verified today** (from
  Product Hunt's long-standing launch form; check the form's own limits when you fill it in). Do not ask people for upvotes;
  asking for feedback is fine.
- **Paste:**
  - Name: `Futbol Island`
  - Tagline (54 characters): `A free browser game that teaches kids football tactics`
  - Description (235 characters): `Futbol Island is a free browser game for kids 7 to 12. They explore an island and learn football (soccer) positions, passing and rules through short lessons and quizzes for 7v7, 9v9, 11v11 and futsal. No ads, no accounts, no open chat.`
  - Topics: Education, Kids, Games, Sports
  - First comment: the "what it is" paragraph, then "I would love to hear from parents and coaches: which lesson was unclear, and what your players still get wrong on the pitch."

### 6. Hacker News "Show HN"

- **Where:** https://news.ycombinator.com/submit . Rules: https://news.ycombinator.com/showhn.html
- **What it requires (checked):** "Show HN is for something you've made that other people can play with." The title must
  begin with "Show HN". It must be easy to try, "ideally without barriers such as signups or emails" (we have none). Landing
  pages are off topic, so link the game, not the home page. Do not ask anyone to upvote or comment. Be there to answer
  questions for the first few hours.
- **Paste:**
  - Title: `Show HN: Futbol Island – a browser game that teaches kids football tactics`
  - URL: `https://futbolisland.app/play`
  - First comment (write it in your own words; this is a start): "I made Futbol Island with White Sports Ventures to teach
    kids 7 to 12 the parts of football (soccer) that practice often skips: where to stand, when to pass, how a team keeps
    its shape. Each lesson plays out on a pitch with moving players and ends with a short quiz. It is a Next.js app with a
    3D island, and it runs on phones. It is free, with no ads, no accounts and no
    open chat. It counts anonymous usage totals with its own cookie-free counter. I would value feedback on the lessons and
    on performance on older phones."

---

## D. Reddit

Reddit could not be read by an automated check on Nov 10 2026 (it blocks them), so **none of the three subreddits' rules are
verified here**. Before posting in each: open the rules page, read the pinned posts, and if self-promotion is not clearly
allowed, message the moderators first with the short note below. Across Reddit the usual expectation is that most of what
an account posts is not its own project; a new account that only posts its own link is treated as spam. Post from a personal
account with some history, say plainly that you made it, and post in one subreddit at a time.

| Subreddit | Rules page to read first | What was found |
|---|---|---|
| r/bootroom (players improving their game) | https://www.reddit.com/r/bootroom/about/rules | Not verified. No rule text could be read. Its readers are mostly teen and adult players, so a game for ages 7 to 12 may be off topic; ask the moderators before posting |
| r/SoccerCoachResources (coaches) | https://www.reddit.com/r/SoccerCoachResources/about/rules | Not verified from Reddit itself. A mirror of the sidebar says a post that "appears to be primarily marketing, brand building" may be removed and the poster banned. A free resource shared by a coach who takes part in the discussion is the safe shape; a launch announcement is not |
| r/youthsoccer (parents and coaches) | https://www.reddit.com/r/youthsoccer/about/rules | Not verified. No rule text could be read. Small community (about 3,000 members by one listing); ask the moderators first |

**Message to moderators (send before posting):**

> Hi mods. I help make a free browser game that teaches kids 7 to 12 football positions, passing and rules
> (futbolisland.app). No ads, no accounts, nothing to buy. Would a single post sharing it as a free resource be OK here, and
> is there a flair or a weekly thread you would prefer? If not, no problem, and thanks for running the sub.

**Post (r/SoccerCoachResources, r/youthsoccer), only after a yes:**

> Title: Free resource: short lessons and quizzes that teach U8 to U12 players where to stand and when to pass
>
> I help make Futbol Island, a free browser game for kids 7 to 12 (I am one of the makers, so remove this if it breaks a
> rule). Each lesson shows one idea on a pitch with moving players, then a short quiz: the build-out line in 7v7, getting
> out of the passing shadow, one presses and one covers, two options on a goal kick. There are lessons for 7v7, 9v9, 11v11
> and futsal. Coaches can read every lesson as a plain page first: https://futbolisland.app/learn/lessons
>
> No ads, no accounts, no open chat. I would like to know which ideas your players struggle with that are missing.

**Post (r/bootroom), only after a yes:** the same, with the title "Free lessons and quizzes on positioning and passing
decisions (made for kids 7 to 12, useful for younger siblings and players you coach)".

---

## E. Youth-coaching resource pages

Five pages that list resources for youth coaches, each fetched on Nov 10 2026. None of them promises to add anything.

| Page | Who runs it | How to suggest | Checked |
|---|---|---|---|
| U.S. Soccer "Soccer Forward" Resource Hub, https://www.ussoccer.com/soccer-forward/resource-hub | U.S. Soccer | Its own form, "Tell us about your resources here": https://fs9.formsite.com/mteeterussoccerorg/mfkraqamau/index | Page and form link read. The hub is for teachers, school leaders, coaches, parents and community advocates. This is the best fit of the five |
| Team Scoreboard coaching resources, https://sites.google.com/view/teamscoreboard/coaching-resources | Coach Carrie, North Austin Soccer | Email on the page: CoachCarrie@northaustinsoccer.org (given for coaching support; the page has no suggestion form) | Page read. It lists free outside resources for new grassroots coaches |
| TeamSnap blog, "Best Resources for Youth Soccer Coaches", https://www.teamsnap.com/blog/for-business/best-resources-youth-soccer-coaches-top-ways-soccer-administrators-streamline-coaching | TeamSnap (a company) | Contact page https://www.teamsnap.com/contact . The article does not invite suggestions | Page read. A list article from May 2024 that also sells TeamSnap's own product; a long shot |
| SoccerHelp, https://soccerhelp.com/Coaching_Soccer_Soccer_Coaching.shtml | SoccerHelp.com | Contact page https://soccerhelp.com/Contact_Us.shtml | Page read. A large free coaching site, but it has no page of outside links, so a link is unlikely; a note to the owner may still earn a mention |
| Colorado Soccer Association, coaches page, https://www.coloradosoccer.org/coaches | Colorado Soccer Association (a state association) | Staff contact on the site | Only the redirect was read (the old `/coaching-resources` address moves here); the page's content is **not verified**. Your own state association (Cal South for San Diego) is the better first ask |

Two more that the pages above link to and that publish their own material, not outside links: US Youth Soccer's resource
library and the Positive Coaching Alliance. They are partners to approach, not directories to submit to.

**Paste (form or email):**

> Subject: A free resource for your coaches: football (soccer) lessons and quizzes for ages 7 to 12
>
> Hello. I help make Futbol Island (https://futbolisland.app), a free browser game where kids aged 7 to 12 learn football
> (soccer) positions, passing and rules through short lessons and quizzes for 7v7, 9v9, 11v11 and futsal. Coaches can read
> every lesson as a plain page at https://futbolisland.app/learn/lessons and send players a link to try at home. It has no
> ads, no accounts and no open chat, and it never asks a child for personal details (privacy policy:
> https://futbolisland.app/privacy). It is built in San Diego in partnership with White Sports Ventures. If it fits your
> resource page, we would be grateful for a listing, and we would welcome your feedback on the lessons either way.

For the U.S. Soccer form, use the 100-word description as the summary and the "what it is" paragraph as the detail.

---

## F. Order of work

1. U.S. Soccer Resource Hub form and your own state association (real, relevant links).
2. Show HN (links to `/play`; be present for questions).
3. Common Sense Media contact form.
4. Reddit, one subreddit at a time, after a moderator says yes.
5. Product Hunt.
6. itch.io page as a profile and a link.
7. CrazyGames and Poki: skip unless the owner wants a separate, ad-supported stand-alone build.

Keep a list of where it was posted and on which day. In `/admin`, the "Top sources" card (Players tab) shows which of these
send visitors, and "Search arrivals" (Marketing tab) shows when search engines and AI assistants start to.
