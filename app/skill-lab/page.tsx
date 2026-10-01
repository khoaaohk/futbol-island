import SkillLab from '@/components/SkillLab';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'Skill moves · Futbol Island',robots:{index:false,follow:false}};
export default function SkillLabPage(){guardLabRoute();return <SkillLab/>;}
