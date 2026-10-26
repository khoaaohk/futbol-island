/**
 * Where a closed Paths lesson goes back to (Oct 26 2026, owner): a lesson started from a pitch card (components/FieldPathCard.tsx)
 * returns to that pitch on the island; every other launch (Paths, onboarding, the IDP, a learning stage) reopens the Paths sheet.
 * A "Next lesson" chained from a pitch lesson keeps the pitch as its way back. Pure: no React, no browser globals.
 */
export type LessonSource={from?:'pitch'}|null|undefined;
export const lessonCloseTarget=(req:LessonSource):'pitch'|'paths'=>req?.from==='pitch'?'pitch':'paths';
/** The close button's title ('save') or the quiz end's quieter second button ('back'). */
export function lessonCloseLabel(req:LessonSource,kind:'save'|'back'):string{
 const pitch=lessonCloseTarget(req)==='pitch';
 return kind==='save'?(pitch?'Save and return to the pitch':'Save and return to Paths'):(pitch?'Back to the pitch':'Back to Paths');
}
/** Adds the launch source to a FORMAT_PATH_LAUNCH detail (left off entirely when there is none, so old details stay identical). */
export function withLaunchSource<T extends object>(detail:T,from?:'pitch'):T&{from?:'pitch'}{return from==='pitch'?{...detail,from}:detail;}
