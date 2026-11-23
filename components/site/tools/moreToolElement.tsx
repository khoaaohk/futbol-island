import TeamNameGenerator from './TeamNameGenerator';
import PracticePlanner from './PracticePlanner';
import FieldSizeGuide from './FieldSizeGuide';
import JugglingTracker from './JugglingTracker';
import StatsTracker from './StatsTracker';
import {planCatalog} from '@/lib/site/tools/practicePlanDrills';
/** The tool itself for each second-batch page (Nov 22 2026), in English or Spanish; used by app/(site)/tools/<slug> and components/es/pages/ToolsEs.tsx. */
export function moreToolElement(slug:string,lang:'en'|'es'){
 const es=lang==='es'?'es' as const:undefined;
 switch(slug){
  case 'soccer-team-name-generator':return <TeamNameGenerator lang={es}/>;
  case 'soccer-practice-plan-generator':return <PracticePlanner catalog={planCatalog(lang)} lang={es}/>;
  case 'youth-soccer-field-size-guide':return <FieldSizeGuide lang={es}/>;
  case 'soccer-juggling-challenge':return <JugglingTracker lang={es} gamePath={`${es?'/es':''}/games/soccer-juggling-game`}/>;
  case 'youth-soccer-stats-tracker':return <StatsTracker lang={es}/>;
  default:return null;
 }
}
