/**
 * The lesson opener (G-18, Sep 30 2026): when a lesson opens, the child sees its title and one line "You'll learn: …" before
 * the play starts. The 7v7 starter path is the first path (lib/paths/pathContinue.ts), so its twelve lessons have kid-simple
 * goals written here (short words, one idea each), and the first lesson explains the few terms its narration uses. Every other
 * lesson falls back to its catalog `concept` line. Narration audio is untouched: the step text and voice files stay as recorded.
 *
 * Football checked: 7v7 youth teams play a goalkeeper + 6 (e.g. 2-3-1); the build-out line (US Youth Soccer / AYSO small-sided
 * rules) makes opponents wait behind it on a goal kick until the ball is in play; "goal side" = between the attacker and your goal.
 */
export type LessonGoal={goal:string;words?:{term:string;meaning:string}[]};
export const LESSON_GOALS:Record<string,LessonGoal>={
 '7v7:learn7_roles':{goal:'Meet your seven players, then find a helpful spot as the ball moves.',words:[
  {term:'Outfield players',meaning:'everyone on your team except the goalkeeper.'},
  {term:'2-3-1',meaning:'2 defenders, 3 midfielders and 1 forward, counted from your goal.'},
  {term:'Passing angle',meaning:'a spot where a teammate can pass the ball to you.'}]},
 '7v7:learn7_shape':{goal:'See the job of each line of players and fill the gap your team is missing.'},
 '7v7:learn7_buildout':{goal:'Learn the build-out line: on your goal kick, the other team waits behind it until the ball is played.'},
 '7v7:learn7_receive':{goal:'Look over your shoulder before the ball arrives, then turn or pass it back.'},
 '7v7:learn7_carry':{goal:'Carry the ball or pass it? Watch which way the defender leaves open.'},
 '7v7:prn_7_spread':{goal:'Spread out so the player with the ball has more ways to pass.'},
 '7v7:prn_7_support':{goal:'Step out from behind a defender so your teammate can pass to you.'},
 '7v7:s_onetwo':{goal:'Use a wall pass (a one-two) to get around a defender.'},
 '7v7:bld_7_usekeeper':{goal:'Your goalkeeper can help you keep the ball when the pass back is clear.'},
 '7v7:def_7_goalside':{goal:'Defend by staying between the attacker and your goal.'},
 '7v7:dbz_7_dontballwatch':{goal:'Don’t just watch the ball: keep an eye on the runner too.'},
 '7v7:gap7_lostball':{goal:'Lost the ball? First protect the way to your goal.'},
};
/** The opener's goal line for a lesson, or null when there is nothing to say. */
export function lessonGoal(format:string,lesson:{id:string;concept?:string;desc?:string}):LessonGoal|null{
 const own=LESSON_GOALS[`${format}:${lesson.id}`];if(own)return own;
 const fallback=(lesson.concept??lesson.desc??'').trim();return fallback?{goal:fallback}:null;
}
