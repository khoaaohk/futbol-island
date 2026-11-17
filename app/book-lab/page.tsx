import {guardLabRoute} from '@/lib/dev/labRoutes';
import BookLab from './BookLab';
export const metadata={title:'Book spreads · Book lab',robots:{index:false,follow:false}};
/** Dev lab: one player pop-up book in the game reader (site mode), for scripts/capture-book-spreads.cjs (the /books chapter pictures). */
export default function Page(){guardLabRoute();return <BookLab/>;}
