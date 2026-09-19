// Shared contract for the Plays-island mini-games. Every game is a self-contained full-screen
// React component that fills its host overlay and calls onExit() to return to the games menu.
// Keep games backend-free (localStorage only), mobile-first + desktop-friendly, and styled in the
// app's low-poly / pixel aesthetic (peachy/gold palette, dark glass panels, pixel-corner buttons).
export interface GameProps {
  onExit: () => void;
}
