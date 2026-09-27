/**
 * Character rendering style (docs/bean-characters/CONTRACT.md). 'bean' is the default look; 'classic' renders the
 * original athlete meshes exactly as before (rollback and tests). The value is read when a rig is created.
 */
export type CharacterStyle = 'bean'|'classic';
export const CHARACTER_STYLE: CharacterStyle = 'bean';

let override: CharacterStyle|undefined;
/** Test/debug override (e.g. tests run both styles). Affects rigs created afterwards; undefined restores the default. */
export function setCharacterStyle(style: CharacterStyle|undefined) { override = style; }
/**
 * The style for new rigs. In the browser: CHARACTER_STYLE, or `?characters=classic|bean` for a quick comparison.
 * Headless Node (no real document/location, e.g. the geometry tests and DOM-mocking fixtures) keeps the classic body unless a test opts in with
 * setCharacterStyle or `globalThis.FI_CHARACTER_STYLE`, so the existing mesh-level tests keep their fixtures.
 */
export function characterStyle(): CharacterStyle {
  if (override) return override;
  const forced = (globalThis as {FI_CHARACTER_STYLE?: unknown}).FI_CHARACTER_STYLE;
  if (forced === 'bean' || forced === 'classic') return forced;
  // A real page has a document and a location; test fixtures that only mock `document`/`window` stay classic.
  if (typeof document === 'undefined' || typeof window === 'undefined' || typeof window.location?.search !== 'string') return 'classic';
  try {
    const q = new URLSearchParams(window.location.search).get('characters');
    if (q === 'classic' || q === 'bean') return q;
  } catch { /* ignore */ }
  return CHARACTER_STYLE;
}
