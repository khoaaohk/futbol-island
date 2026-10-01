import {notFound} from 'next/navigation';
/**
 * Developer review pages (G-16, Sep 30 2026). They exist for building and checking art and motion, not for players:
 *  - /motion-lab  movement review (components/MotionLab.tsx; scripts/check-motion-lab-browser.cjs, check-motion-support-browser.cjs)
 *  - /skill-lab   skill-move review (components/SkillLab.tsx; tests/preview-moves.cjs)
 *  - /splash-lab  splash cast renders (components/SplashLab.tsx; scripts/render-splash-characters.cjs)
 * Production builds answer 404 (Next's notFound), so a shared futbolisland.app link never reaches them. `next dev` keeps them.
 * Not labs: /controller (the phone-as-gamepad companion, linked by QR from the island) and /coffee (donations, parent-gated).
 */
export const LAB_ROUTES=['/motion-lab','/skill-lab','/splash-lab'] as const;
export const labRoutesAllowed=(nodeEnv:string|undefined=process.env.NODE_ENV)=>nodeEnv!=='production';
/** Call at the top of a lab page: 404 in production builds. */
export function guardLabRoute(){if(!labRoutesAllowed())notFound();}
