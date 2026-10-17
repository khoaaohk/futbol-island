/**
 * One <script type="application/ld+json"> (schema.org structured data) for search engines and AI assistants. Server-rendered,
 * no client JavaScript. `<` is escaped so text in the data can never close the script tag.
 */
export default function JsonLd({data}:{data:unknown}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
