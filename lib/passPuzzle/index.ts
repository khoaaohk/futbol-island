/**
 * Pass Puzzle engine (lane C): pure TypeScript, no DOM / three.js, fixed step 1/120, deterministic.
 * See docs/pass-puzzle/CONTRACT.md ("Lane C — status") for the API notes.
 */
export * from './types';
export {STEP,geoOf} from './physics';
export {windupSeconds} from './sim';
export {createPuzzle,predict,replay} from './world';
export {readStroke} from './stroke';
