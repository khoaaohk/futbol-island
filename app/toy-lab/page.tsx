import {guardLabRoute} from '@/lib/dev/labRoutes';
import ToyLab from './ToyLab';
export const metadata={title:'Toy viewer · Toy lab',robots:{index:false,follow:false}};
/** Dev lab for the gashapon toy viewer (components/GashaponToyViewer.tsx): every toy owned, opened the way the shelf opens it. */
export default function Page(){guardLabRoute();return <ToyLab/>;}
