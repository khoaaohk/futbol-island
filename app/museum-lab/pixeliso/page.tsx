import Demo from '@/components/museum/experiences/pixeliso/demo/Demo';
import {guardLabRoute} from '@/lib/dev/labRoutes';
export const metadata={title:'pixeliso kit · Museum lab',robots:{index:false,follow:false}};
/** Dev lab for the shared pixel-iso kit (components/museum/experiences/pixeliso; docs/museum-pixel-iso.md). 404 in production. */
export default function Page(){guardLabRoute();return <Demo/>;}
