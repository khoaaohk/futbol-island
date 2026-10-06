/**
 * An original test card (drawn here, not a copy of any broadcaster's card): a grey grid, colour bars that turn to a grey
 * ramp on a black-and-white set, and in the middle the Telstar 1 satellite, the ball-shaped satellite of 1962 covered in
 * flat solar panels. Static SVG: costs nothing once drawn.
 */
export default function TestCard(){
 const bars=['#f2f2f2','#e8e02a','#2fd6dc','#2fbf3a','#d33fc4','#d9322c','#2d3fd0','#151515'];
 // Satellite facets: rows of flat panels on a sphere (darker solar cells, lighter gaps), seen from the side.
 const rows=[-.78,-.52,-.26,0,.26,.52,.78];
 return <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden="true" focusable="false">
  <rect width="400" height="300" fill="#7d7d7d"/>
  <g stroke="#a9a9a9" strokeWidth="1.2">{Array.from({length:13},(_,i)=><line key={'v'+i} x1={i*33.3} y1="0" x2={i*33.3} y2="300"/>)}{Array.from({length:10},(_,i)=><line key={'h'+i} x1="0" y1={i*33.3} x2="400" y2={i*33.3}/>)}</g>
  <g>{bars.map((c,i)=><rect key={c} x={40+i*40} y="196" width="40" height="46" fill={c}/>)}</g>
  <g>{Array.from({length:8},(_,i)=><rect key={'s'+i} x={40+i*40} y="242" width="40" height="18" fill={`hsl(0 0% ${12+i*11}%)`}/>)}</g>
  <circle cx="200" cy="128" r="92" fill="#1c1c1c" stroke="#f2f2f2" strokeWidth="4"/>
  <circle cx="200" cy="128" r="84" fill="#0d2a4a"/>
  {/* stars */}
  <g fill="#fff">{[[140,80],[262,70],[150,170],[258,178],[178,58],[236,196],[128,128],[272,124]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3?1.2:1.8}/>)}</g>
  {/* the Telstar 1 satellite: a faceted sphere with an antenna on top and a ring of antennas round its middle */}
  <g transform="translate(200 132)">
   <line x1="0" y1="-38" x2="0" y2="-62" stroke="#ddd" strokeWidth="3"/>
   <path d="M-6 -58 h12 M-6 -53 h12 M-6 -48 h12 M-6 -43 h12" stroke="#bbb" strokeWidth="2"/>
   <circle r="38" fill="#cfcfcf"/>
   {rows.map((y,i)=>{const w=Math.sqrt(1-y*y)*38,n=Math.max(3,Math.round(w/6));return <g key={i}>{Array.from({length:n},(_,j)=>{const x=-w+(j+.5)*(2*w/n);return <rect key={j} x={x-2*w/n*.42} y={y*38-4} width={2*w/n*.84} height="8" fill={(i+j)%2?'#1f2a44':'#2d3b5e'}/>;})}</g>;})}
   <rect x="-40" y="-3" width="80" height="6" fill="#e9e9e9"/>
   <circle r="38" fill="none" stroke="#f4f4f4" strokeWidth="2"/>
   <ellipse cx="-14" cy="-16" rx="12" ry="7" fill="#fff" opacity=".22"/>
  </g>
  <rect x="120" y="22" width="160" height="22" fill="#151515"/>
  <text x="200" y="38" textAnchor="middle" fill="#f2f2f2" fontFamily="ui-monospace,Menlo,Consolas,monospace" fontSize="15" fontWeight="700" letterSpacing="3">TELSTAR</text>
  <rect x="96" y="270" width="208" height="20" fill="#151515"/>
  <text x="200" y="285" textAnchor="middle" fill="#f2f2f2" fontFamily="ui-monospace,Menlo,Consolas,monospace" fontSize="11" letterSpacing="1.5">MEXICO 70 · VIA SATELLITE</text>
 </svg>;
}
