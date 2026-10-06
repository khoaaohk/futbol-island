import type {Decal} from '../decals';
/** Ball id → its GLSL design (see ../glsl.ts) and optional printed decals. One file per ball; design agents own their files, not this index. */
import * as m_1930_tiento from './1930-tiento';
import * as m_1930_t_model from './1930-t-model';
import * as m_1934_federale_102 from './1934-federale-102';
import * as m_1938_allen from './1938-allen';
import * as m_1950_duplo_t from './1950-duplo-t';
import * as m_1954_swiss_world_champion from './1954-swiss-world-champion';
import * as m_1958_top_star from './1958-top-star';
import * as m_1962_crack from './1962-crack';
import * as m_1966_challenge_4_star from './1966-challenge-4-star';
import * as m_1970_telstar from './1970-telstar';
import * as m_1974_telstar_durlast from './1974-telstar-durlast';
import * as m_1978_tango from './1978-tango';
import * as m_1982_tango_espana from './1982-tango-espana';
import * as m_1986_azteca from './1986-azteca';
import * as m_1990_etrusco_unico from './1990-etrusco-unico';
import * as m_1994_questra from './1994-questra';
import * as m_1998_tricolore from './1998-tricolore';
import * as m_2002_fevernova from './2002-fevernova';
import * as m_2006_teamgeist from './2006-teamgeist';
import * as m_2006_teamgeist_berlin from './2006-teamgeist-berlin';
import * as m_2010_jabulani from './2010-jabulani';
import * as m_2010_jobulani from './2010-jobulani';
import * as m_2014_brazuca from './2014-brazuca';
import * as m_2014_brazuca_final_rio from './2014-brazuca-final-rio';
import * as m_2018_telstar_18 from './2018-telstar-18';
import * as m_2018_telstar_mechta from './2018-telstar-mechta';
import * as m_2022_al_rihla from './2022-al-rihla';
import * as m_2022_al_hilm from './2022-al-hilm';
import * as m_2026_trionda from './2026-trionda';
import * as m_2026_trionda_final from './2026-trionda-final';
import * as m_wwc_1999_icon from './wwc-1999-icon';
import * as m_wwc_2003_fevernova from './wwc-2003-fevernova';
import * as m_wwc_2007_teamgeist_blue from './wwc-2007-teamgeist-blue';
import * as m_wwc_2011_speedcell from './wwc-2011-speedcell';
import * as m_wwc_2015_conext15 from './wwc-2015-conext15';
import * as m_wwc_2015_conext15_final_vancouver from './wwc-2015-conext15-final-vancouver';
import * as m_wwc_2019_conext19 from './wwc-2019-conext19';
import * as m_wwc_2019_tricolore19 from './wwc-2019-tricolore19';
import * as m_wwc_2023_oceaunz from './wwc-2023-oceaunz';
import * as m_wwc_2023_oceaunz_final_pro from './wwc-2023-oceaunz-final-pro';
type DesignModule={default:string;decals?:readonly Decal[]};
const DESIGNS:Record<string,DesignModule>={
 '1930-tiento':m_1930_tiento as DesignModule,
 '1930-t-model':m_1930_t_model as DesignModule,
 '1934-federale-102':m_1934_federale_102 as DesignModule,
 '1938-allen':m_1938_allen as DesignModule,
 '1950-duplo-t':m_1950_duplo_t as DesignModule,
 '1954-swiss-world-champion':m_1954_swiss_world_champion as DesignModule,
 '1958-top-star':m_1958_top_star as DesignModule,
 '1962-crack':m_1962_crack as DesignModule,
 '1966-challenge-4-star':m_1966_challenge_4_star as DesignModule,
 '1970-telstar':m_1970_telstar as DesignModule,
 '1974-telstar-durlast':m_1974_telstar_durlast as DesignModule,
 '1978-tango':m_1978_tango as DesignModule,
 '1982-tango-espana':m_1982_tango_espana as DesignModule,
 '1986-azteca':m_1986_azteca as DesignModule,
 '1990-etrusco-unico':m_1990_etrusco_unico as DesignModule,
 '1994-questra':m_1994_questra as DesignModule,
 '1998-tricolore':m_1998_tricolore as DesignModule,
 '2002-fevernova':m_2002_fevernova as DesignModule,
 '2006-teamgeist':m_2006_teamgeist as DesignModule,
 '2006-teamgeist-berlin':m_2006_teamgeist_berlin as DesignModule,
 '2010-jabulani':m_2010_jabulani as DesignModule,
 '2010-jobulani':m_2010_jobulani as DesignModule,
 '2014-brazuca':m_2014_brazuca as DesignModule,
 '2014-brazuca-final-rio':m_2014_brazuca_final_rio as DesignModule,
 '2018-telstar-18':m_2018_telstar_18 as DesignModule,
 '2018-telstar-mechta':m_2018_telstar_mechta as DesignModule,
 '2022-al-rihla':m_2022_al_rihla as DesignModule,
 '2022-al-hilm':m_2022_al_hilm as DesignModule,
 '2026-trionda':m_2026_trionda as DesignModule,
 '2026-trionda-final':m_2026_trionda_final as DesignModule,
 'wwc-1999-icon':m_wwc_1999_icon as DesignModule,
 'wwc-2003-fevernova':m_wwc_2003_fevernova as DesignModule,
 'wwc-2007-teamgeist-blue':m_wwc_2007_teamgeist_blue as DesignModule,
 'wwc-2011-speedcell':m_wwc_2011_speedcell as DesignModule,
 'wwc-2015-conext15':m_wwc_2015_conext15 as DesignModule,
 'wwc-2015-conext15-final-vancouver':m_wwc_2015_conext15_final_vancouver as DesignModule,
 'wwc-2019-conext19':m_wwc_2019_conext19 as DesignModule,
 'wwc-2019-tricolore19':m_wwc_2019_tricolore19 as DesignModule,
 'wwc-2023-oceaunz':m_wwc_2023_oceaunz as DesignModule,
 'wwc-2023-oceaunz-final-pro':m_wwc_2023_oceaunz_final_pro as DesignModule,
};
export const DESIGN_IDS=Object.keys(DESIGNS);
export function ballDesign(id:string){return (DESIGNS[id]??DESIGNS['1970-telstar']).default;}
export function ballDecals(id:string):readonly Decal[]{return DESIGNS[id]?.decals??[];}
