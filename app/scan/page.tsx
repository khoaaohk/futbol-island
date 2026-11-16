import ScanApp from '@/components/scan/ScanApp';
/** /scan: one static page; everything happens in the client component (settings and scores stay on the device). */
export const dynamic='force-static';
export default function ScanPage(){return <ScanApp/>;}
