/** The id of a hub card or row that the hub's in-page rail links to (layout batch 3, Nov 20 2026): `<prefix>-<last path segment>`,
 *  e.g. railId('rule','/learn/soccer-rules/offside') = 'rule-offside'. The prefix keeps it apart from the page's other ids. */
export const railId=(prefix:string,path:string)=>`${prefix}-${path.split('#')[0].split('/').filter(Boolean).pop()}`;
