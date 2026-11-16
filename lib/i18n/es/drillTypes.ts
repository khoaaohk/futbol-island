/**
 * Shapes of the Spanish drills and practice plans (Spanish round C, Nov 16 2026; docs/i18n/HANDOFF.md). Same recipe as
 * lib/i18n/es/types.ts: only words, keyed by the English slug, arrays 1:1 with the English ones (lib/site/drills*.ts,
 * drillGuides.ts, plans.ts, notesDrills.ts). Merged by lib/i18n/es/drillsRegistry.ts. Kept in its own file so the other
 * Spanish families can grow types.ts without merge conflicts.
 */
import type {Faq} from './types';
/** One drill: the words of a lib/site/drills{A-D}.ts record; `ages` = the coach's note for each age the drill lists (notesDrills.ts). */
export type DrillEs={name:string;h1?:string;title:string;desc:string;answer:string;players:string;equipment:string;time:string;spaceNote?:string;
 scene:{title:string;caption:string};steps:readonly string[];cues:readonly string[];easier:string;harder:string;mistakes:readonly string[];game:string;home?:string;
 faq:readonly Faq[];ages:readonly string[]};
export type GuideSectionEs={title:string;items:readonly string[]};
/** One age or skill guide (lib/site/drillGuides.ts): `picks` holds the line of each picked drill, 1:1. */
export type DrillGuideEs={name:string;title:string;h1:string;desc:string;blurb:string;lead:string;more:string;facts?:{label:string;rows:readonly (readonly [string,string])[];note:string};
 before:readonly GuideSectionEs[];picksTitle:string;picks:readonly string[];after:readonly GuideSectionEs[];faq:readonly Faq[]};
/** One practice plan (lib/site/plans.ts): `rows` = [activity, purpose] per clock row, 1:1. */
export type PlanEs={theme:string;title:string;desc:string;lead:string;goal:string;players:string;rows:readonly (readonly [string,string])[];
 equipment:readonly string[];notes:readonly string[];swap:{sign:string;instead:string};faq:readonly Faq[]};
