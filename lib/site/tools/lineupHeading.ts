import type {GuideFormat} from '@/lib/site/pitch';
/** Sent by the lineup builder whenever its format changes (detail: the GuideFormat); components/site/tools/LineupHeading.tsx listens. */
export const LINEUP_FORMAT_EVENT='fi:lineup-format';
/** "7v7 soccer lineup builder" / "Futsal lineup builder": the same words as the registry's h1 for each format landing. */
export const lineupHeading=(f:GuideFormat)=>f==='futsal'?'Futsal lineup builder':`${f} soccer lineup builder`;
