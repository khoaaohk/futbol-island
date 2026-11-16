import HtmlShell from '@/components/site/HtmlShell';
/** The Kit Shop route paints the door light's colour from the first byte (no dark flash between the island and the store; the
 *  Konbini and Museum routes' fix). */
export default function ShopLayout({children}:{children:React.ReactNode}){
 return <HtmlShell lang="en"><><style>{'html,body{background:#f4f2ed}'}</style>{children}</></HtmlShell>;
}
