/**
 * The "For grown-ups" words and partner links, in one plain module (Oct 16 2026) so the client sheet
 * (components/about/AboutGrownUps.tsx, components/landing/Donate.tsx, components/DonationLinks.tsx) and the static /about page
 * say exactly the same thing. Pure data: no React, no 'use client', so server components can read it.
 */
export const GROWN_UPS={
 whyTitle:'Why we built Futbol Island',
 why:'Many young players learn best by seeing it. Yet a lot of the basics, like where to stand, when to pass and how a team keeps its shape, rarely get taught at club or recreational practice, where time goes to drills and games. Futbol Island closes that gap: every idea is shown on the pitch, explained and checked with a quick quiz.',
 learnsTitle:'What your child learns',
 learns:'Positions, team shape and decisions in 7v7, 9v9, 11v11 and futsal, through short lessons and quizzes, plus the history and culture of the game in the museum.',
 privacyTitle:'Privacy',
 privacy:'No ads, no free-text chat, no contact details. A save code (three words and a number) instead of an account. The Play with friends feature asks a grown-up to type a first name, which is shown only to the friends in the same party and is not kept.',
 privacyLink:'Read the privacy policy',
 free:'Free, always.',
 freeWhy:'Learning the game shouldn’t cost money. Club soccer already prices too many kids out.',
 partnerTitle:'In partnership with',
 partnerLead:'Futbol Island is built in partnership with ',
 partnerName:'White Sports Ventures',
 partnerRest:', founded by former U.S. Men’s National Team player Jeremiah White III. White Sports Ventures works to make soccer clearer and fairer for families, clubs and players, so that access never depends on insider knowledge.',
 nonprofitsTitle:'Local non-profits',
 nonprofitsLead:'We also work with local non-profits growing the game in our community. Every dollar donated goes straight to them. We’re proud to support ',
} as const;
export const WSV_LINKS=[{href:'https://www.whitesportsventures.com/about',label:'whitesportsventures.com',track:'wsv'},{href:'https://www.instagram.com/jeremiahwhiteiii/',label:'@jeremiahwhiteiii on Instagram',track:'instagram'}] as const;
/** The local non-profits donations go to (shared with the title screen's For grown-ups sheet). */
export const NONPROFITS=[{name:'FC YAP',href:'https://www.instagram.com/fc_yap/'},{name:'Street Soccer San Diego',href:'https://www.instagram.com/streetsoccersd/'},{name:'Ronin Futsal',href:'https://www.instagram.com/roninfutsal/'}] as const;
