// Arcade chrome tokens for source tests (consistency audit, Oct 27 2026, docs/ARCADE_CHROME_OCT27.md). Reads the one token sheet,
// components/arcade/arcadeChrome.css, so tests that check sizes and gaps work in px without pinning copies of the numbers.
// tokens.tall = :root values; tokens.short = with the (max-height:520px) overrides (phones sideways).
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','..','components/arcade/arcadeChrome.css'),'utf8');
const parse=block=>{const o={};for(const m of block.matchAll(/--(arcade-[\w-]+):([^;}]+)/g))o[m[1]]=m[2].trim();return o;};
const rootAt=src.indexOf(':root{'),root=src.slice(rootAt,src.indexOf('}',rootAt));
const short=src.match(/@media \(max-height:520px\)\{\s*:root\{([^}]*)\}/);
if(rootAt<0||!short)throw new Error('arcadeChrome.css: :root block and the (max-height:520px) override are required');
const tokens={tall:parse(root),short:{...parse(root),...parse(short[1])}};
/** A plain px token (e.g. px('short','arcade-edge-x') -> 16). */
function px(mode,name){const v=tokens[mode][name],m=/^(-?\d+(?:\.\d+)?)px$/.exec(v||'');if(!m)throw new Error(`--${name} is not a px value: ${v}`);return Number(m[1]);}
/** The stick ring diameter for a viewport height (clamp(min, 100dvh - k, max)). */
function stick(vh){const m=tokens.tall['arcade-stick'].match(/^clamp\((\d+)px,calc\(100dvh - (\d+)px\),(\d+)px\)$/);if(!m)throw new Error('--arcade-stick shape');return Math.min(+m[3],Math.max(+m[1],vh-+m[2]));}
/** Space kept under the score bar: edge-top + bar + 6 px (plus the top inset at the point of use). */
const barClear=mode=>px(mode,'arcade-edge-top')+px(mode,'arcade-bar-h')+6;
/** Replace var(--arcade-*) px tokens in a CSS string with the chosen mode's values. */
const resolve=(css,mode='short')=>css.replace(/var\(--(arcade-[\w-]+)\)/g,(s,n)=>/^-?\d+(\.\d+)?px$/.test(tokens[mode][n]||'')?tokens[mode][n]:s);
module.exports={src,tokens,px,stick,barClear,resolve};
