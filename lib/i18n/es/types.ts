/**
 * The shapes of the Spanish translations (Spanish round 1, Nov 15 2026). English data (lib/site/*.ts) stays the source of truth:
 * each Spanish record holds ONLY the words of its English record, keyed by the same slug, and the page merges it over the English
 * one (diagram coordinates, lesson ids, paths and dates come from English). Arrays line up 1:1 with the English arrays (same
 * length, same order); tests/es-pages.cjs checks that, plus lengths, banned words and leftover English.
 * Glossary: lib/i18n/es-glossary.ts.
 */
export type Faq={q:string;a:string};
/** A scene's words: the title (shown over the diagram), the caption (its text alternative) and the line label drawn on it. */
export type SceneEs={title:string;caption:string;lineWord?:string};
export type CoachNotesEs={coach:string;match:string;ages:readonly (readonly [string,string])[];mistakes?:readonly string[]};
export type RuleEs={name:string;title:string;h1:string;desc:string;answer:string;law:string;scenes:readonly SceneEs[];refs:readonly string[];
 mixups:readonly {said:string;truth:string}[];formats:readonly (readonly [string,string])[];faq:readonly Faq[];notes:CoachNotesEs};
export type RulesHubEs={crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;more:string;basics:readonly string[];
 groups:readonly {title:string;line:string}[];faq:readonly Faq[];leagueLine:string;sourceLine:string;
 futsalVsSoccer:{title:string;head:readonly string[];rows:readonly (readonly string[])[];note:string}};
export type TermEs={name:string;also?:string;title:string;h1:string;desc:string;short:string;answer:string;scene:SceneEs;howTitle:string;
 how:readonly string[];mistakes:readonly string[];formats:string;faq:readonly Faq[];notes:CoachNotesEs};
export type GlossaryEs={term:string;def:string};
export type TermsHubEs={crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;more?:string;faq:readonly Faq[];
 /** The A-Z list, keyed by the English GLOSSARY entry id. */
 glossary:Readonly<Record<string,GlossaryEs>>};
export type HabitEs={name:string;how:string};
export type PositionEs={name:string;short:string;numberLine:string;title:string;h1:string;desc:string;answer:string;job:string;suits:string;
 where:string;withBall:readonly string[];withoutBall:readonly string[];habits:readonly HabitEs[];small:string;faq:readonly Faq[];notes:CoachNotesEs};
export type PositionsHubEs={crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;faq:readonly Faq[];
 /** 1:1 with the English POSITIONS_HUB.lines / .numbers / .formats, and NUMBERS (the 1-11 table rows, name + job line). */
 lines:readonly {name:string;text:string}[];numbers:readonly string[];formats:readonly {text:string}[];futsal:string;numberRows:readonly {name:string;line:string}[]};
/** Formations (Spanish round 2, Nov 16 2026): the words of one lib/site/formations.ts record; roles/strengths/weak/faq 1:1. */
export type FormationEs={best:string;watch:string;desc:string;answer:string;roles:readonly {title:string;job:string}[];strengths:readonly string[];
 weak:readonly {spot:string;cover:string}[];attack:string;defend:string;suits:string;faq:readonly Faq[];notes:CoachNotesEs};
export type FormatGuideEs={crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;basics:readonly string[];pickTitle:string;pick:readonly string[];faq:readonly Faq[]};
export type FormationsHubEs={crumb:string;blurb:string;title:string;description:string;h1:string;lead:string;what:readonly string[];
 groups:Readonly<Record<'7v7'|'9v9'|'11v11'|'futsal',string>>;faq:readonly Faq[]};
/** Comparison pages: the table cells come from the Spanish position / formation records. */
export type ComparisonEs={title:string;h1:string;desc:string;answer:string;fit:readonly string[];switching:readonly string[]};
