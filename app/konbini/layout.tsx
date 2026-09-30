/** The Konbini route paints the door light's colour from the first byte (review B4: no dark-green flash of the island's
 *  default page background between the island and the store). */
export default function KonbiniLayout({children}:{children:React.ReactNode}){
 return <><style>{'html,body{background:#fffbef}'}</style>{children}</>;
}
