/** Cabinet-world palette: cyan = pitch/targets, pink = impact, yellow = possession. */
const surfaces:Record<string,string>={
 '#dbbd8e':'#090b1c','#588f88':'#282047','#467f7b':'#282047','#427f6c':'#202039',
 '#338e7c':'#143947','#367f7b':'#192c42','#348a70':'#15303e','#459c7c':'#1d3a49',
 '#367e70':'#192b43','#4b9180':'#233650','#478673':'#193440','#4b8b75':'#203f4c','#4d8e77':'#203f4c',
 '#fff0cf':'#73fff1','#fff4da':'#73fff1','#fff1d5':'#73fff1','#fce8ba':'#73fff1','#e4edce':'#73fff1',
 '#eec55d':'#ffee68','#ed9f87':'#ff62c2','#bd7e69':'#34274f','#f1ce83':'#cd68ff',
 '#916949':'#343052','#307967':'#263454','#d68f74':'#292841','#eacb9a':'#8749bc',
 '#edbd65':'#ff62c2','#578b81':'#3b365d','#ffe3a0':'#ff62c2',
};
export const neonColor=(color:string)=>surfaces[color.toLowerCase()]??color;
export const neonEmissive=(color:string)=>['#73fff1','#cd68ff','#ff62c2','#ffee68'].includes(neonColor(color));
