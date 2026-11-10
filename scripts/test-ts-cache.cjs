// On-disk cache for typescript.transpileModule / typescript.transpile (Nov 10 2026), preloaded by the test runner with
// `node -r ./scripts/test-ts-cache.cjs tests/x.cjs`. Most tests transpile the same lib/*.ts sources in every process;
// this keeps the output in node_modules/.cache/fi-ts-transpile/ keyed by sha1(TS version + options + source), so a
// warm run only hashes. Output is the uncached call's string, stored verbatim (verify: node scripts/test-ts-cache.cjs
// --verify). Calls with custom transformers, reported diagnostics or non-JSON options go straight to TypeScript.
// FI_TS_CACHE=0 turns it off. The `typescript` export object is frozen-ish (non-configurable getters), so the cached
// module entry is swapped for a Proxy that forwards everything except the two wrapped functions (and, until TypeScript
// is really needed, a snapshot of its enums).
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), Module = require('module');
const root = path.join(__dirname, '..');
const DIR = process.env.FI_TS_CACHE_DIR || path.join(root, 'node_modules', '.cache', 'fi-ts-transpile');

// Enums tests read on every call (ts.ModuleKind.CommonJS ...): served from a per-version snapshot so a warm run never
// loads the 9 MB typescript.js (~100 ms per process). Any other property loads the real module on first touch.
const SNAP_KEYS = ['version', 'ModuleKind', 'ScriptTarget', 'JsxEmit', 'ModuleResolutionKind', 'ModuleDetectionKind', 'NewLineKind', 'ScriptKind'];

function install() {
  let file, pkg;
  try { file = require.resolve('typescript', { paths: [root] }); pkg = require(path.join(path.dirname(file), '..', 'package.json')); } catch { return null; }
  const st = fs.statSync(file), tag = `${pkg.version}-${st.size}-${Math.floor(st.mtimeMs)}`;
  const snapFile = path.join(DIR, `enums-${tag}.json`);
  let ts = null, snap = null, proxy;
  const real = () => {
    if (ts) return ts;
    delete Module._cache[file];
    ts = require(file);
    Module._cache[file].exports = proxy;
    if (!snap) { snap = {}; for (const k of SNAP_KEYS) snap[k] = ts[k]; writeAtomic(snapFile, JSON.stringify(snap)); }
    return ts;
  };
  try { snap = JSON.parse(fs.readFileSync(snapFile, 'utf8')); } catch { snap = null; }
  const mem = new Map();
  const keyOf = (kind, input, opts) => {
    let o;
    try { o = JSON.stringify(opts === undefined ? null : opts); } catch { return null; }
    if (o === undefined) return null;
    return crypto.createHash('sha1').update(kind + '\0' + tag + '\0' + o + '\0').update(input).digest('hex');
  };
  const load = key => {
    if (mem.has(key)) return mem.get(key);
    try {
      const v = JSON.parse(fs.readFileSync(path.join(DIR, key.slice(0, 2), key + '.json'), 'utf8'));
      mem.set(key, v); return v;
    } catch { return null; }
  };
  const save = (key, v) => { mem.set(key, v); writeAtomic(path.join(DIR, key.slice(0, 2), key + '.json'), JSON.stringify(v)); };
  const plain = o => o == null || (typeof o === 'object' && !o.transformers && !o.reportDiagnostics);
  function transpileModule(input, options) {
    if (typeof input !== 'string' || !plain(options)) return real().transpileModule.apply(real(), arguments);
    const key = keyOf('m', input, options);
    if (!key) return real().transpileModule.apply(real(), arguments);
    const hit = load(key);
    if (hit) return { outputText: hit.o, diagnostics: [], sourceMapText: hit.m === null ? undefined : hit.m };
    const r = real().transpileModule.apply(real(), arguments);
    if (r && (!r.diagnostics || r.diagnostics.length === 0) && typeof r.outputText === 'string') save(key, { o: r.outputText, m: r.sourceMapText === undefined ? null : r.sourceMapText });
    return r;
  }
  function transpile(input, compilerOptions, fileName, diagnostics, moduleName) {
    if (typeof input !== 'string' || diagnostics !== undefined) return real().transpile.apply(real(), arguments);
    const key = keyOf('t', input, [compilerOptions, fileName, moduleName]);
    if (!key) return real().transpile.apply(real(), arguments);
    const hit = load(key);
    if (hit) return hit.o;
    const out = real().transpile.apply(real(), arguments);
    if (typeof out === 'string') save(key, { o: out, m: null });
    return out;
  }
  const wrapped = { transpileModule, transpile };
  proxy = new Proxy({}, {
    get: (_, k) => (k in wrapped ? wrapped[k] : (!ts && snap && typeof k === 'string' && k in snap) ? snap[k] : Reflect.get(real(), k)),
    has: (_, k) => k in wrapped || k in real(),
    ownKeys: () => Reflect.ownKeys(real()),
    getOwnPropertyDescriptor: (_, k) => { const d = Reflect.getOwnPropertyDescriptor(real(), k); return d && { value: k in wrapped ? wrapped[k] : real()[k], writable: false, enumerable: d.enumerable, configurable: true }; },
    set: () => false, defineProperty: () => false, deleteProperty: () => false,
  });
  const m = new Module(file, module); m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file)); m.loaded = true; m.exports = proxy;
  Module._cache[file] = m;
  return { proxy, real, file, get realLoaded() { return !!ts; } };
}

function writeAtomic(f, text) {
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = `${f}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmp, text); fs.renameSync(tmp, f);
  } catch { /* cache is best effort */ }
}

const enabled = process.env.FI_TS_CACHE !== '0';
const installed = enabled ? install() : null;
module.exports = { installed, DIR };

// Self-check: transpile every lib/**/*.ts(x) with the real call and through the cache (cold then warm), compare bytes.
if (require.main === module && process.argv.includes('--verify')) {
  if (!installed) { console.log('cache disabled or typescript missing'); process.exit(1); }
  const { real: getReal, proxy } = installed; const ts = getReal(), real = { transpileModule: ts.transpileModule, transpile: ts.transpile };
  const files = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.tsx?$/.test(e.name)) files.push(p); } })(path.join(root, 'lib'));
  const opts = [{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, sourceMap: true } }];
  let n = 0, bad = 0;
  for (const f of files.slice(0, Number(process.env.VERIFY_MAX || 400))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const o of opts) {
      const a = real.transpileModule(src, o), b = proxy.transpileModule(src, o), c = proxy.transpileModule(src, o);
      if (a.outputText !== b.outputText || a.outputText !== c.outputText || a.sourceMapText !== c.sourceMapText) { bad++; console.log('MISMATCH', f); }
      n++;
    }
    if (real.transpile(src, opts[0].compilerOptions) !== proxy.transpile(src, opts[0].compilerOptions)) { bad++; console.log('MISMATCH transpile', f); }
  }
  console.log(`${n} transpileModule + ${files.length} transpile checks, ${bad} mismatches`);
  process.exit(bad ? 1 : 0);
}
