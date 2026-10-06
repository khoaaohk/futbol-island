/** The museum route paints the door light's colour from the first byte (no dark-green flash of the island's page background
 *  between the island and the hall; the Konbini route's fix). */
export default function MuseumLayout({children}:{children:React.ReactNode}){
 return <><style>{'html,body{background:#f6ecd6}'}</style>{children}</>;
}
