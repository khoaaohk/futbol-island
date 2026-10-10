import * as ReactDOM from 'react-dom';

/** The island's brush face (titles, loaders). One URL everywhere, so a preload is the request a stylesheet's @font-face uses. */
export const ISLAND_BRUSH_URL='/stories/films/assets/IslandBrush-Regular.ttf';
/**
 * Preloads the brush face on the routes that paint it straight away: the title/island (`/`, /island-return), the Arcade, the
 * Konbini and /privacy. It used to sit in the root layout, so routes that never use it at once (the museum, admin, the labs) got
 * Chrome's "preloaded but not used within a few seconds" warning (QA Oct 10 2026). Call from a server component's render;
 * ReactDOM.preload (React canary in Next 14's app router) hoists one <link rel="preload"> into <head>.
 */
export function preloadIslandBrush(){
 (ReactDOM as unknown as {preload?:(href:string,options:{as:'font';type:string;crossOrigin:string})=>void}).preload?.(ISLAND_BRUSH_URL,{as:'font',type:'font/ttf',crossOrigin:'anonymous'});
}
