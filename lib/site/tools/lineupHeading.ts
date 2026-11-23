import type {GuideFormat} from '@/lib/site/pitch';
/** Sent by the lineup builder whenever its format changes (detail: the GuideFormat); components/site/tools/LineupHeading.tsx listens. */
export const LINEUP_FORMAT_EVENT='fi:lineup-format';
/** "7v7 soccer lineup builder" / "Futsal lineup builder": the same words as the registry's h1 for each format landing. */
/* Nov 23 2026: the 11v11 landing's h1 became "Starting 11 maker: ..." (seo-deep); the heading keeps the same words so the page still uses it. */
export const lineupHeading=(f:GuideFormat)=>f==='futsal'?'Futsal lineup builder':f==='11v11'?'Starting 11 maker: 11v11 soccer lineup builder':`${f} soccer lineup builder`;
