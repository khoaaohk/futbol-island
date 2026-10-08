#!/usr/bin/env node
/**
 * Lesson voice packs (Oct 7 2026, docs/performance-guide.md "Lesson voice packs").
 *
 * A lesson used to fetch every spoken line as its own file (public/voice/kokoro_<coach>/<fnv-of-text>.m4a, ~26 requests for
 * one lesson). This joins one lesson's core lines for one coach into ONE m4a: the steps in order, then each question's prompt
 * and explanation (the correct-answer feedback). Wrong-answer explanations stay as single files: most runs never play them,
 * and packing them would add ~45% to every pack.
 *
 * No re-encode: the AAC packets of each line file are copied byte for byte (all lines share one AudioSpecificConfig), with
 * constant silent AAC frames between lines. Each line keeps its own priming frame in front of it, so the decoder state at
 * the line's first real frame is exactly what it was in the single file and the line decodes bit-identically. The pack is
 * written by the small MP4 writer below (moov before mdat, fixed times), so the same inputs always give the same bytes,
 * and the name carries sha256(bytes)[:12] (never rewritten in place).
 *
 * The offset maps live beside the packs, one small file per coach and format (public/voice/packs/<coach>/<format>.json:
 * {lessonId: {src, lines: {<line hash[:8]>: [start, end]}}}, seconds on the pack's clock to the millisecond; end - start is
 * the line's own duration). They are not in the lesson catalogs, so voice-off players and the other three coaches' maps
 * cost nothing; the lesson screen fetches the chosen coach's map for its format (~5-8 KB gzipped) once. lib/town/lessonVoicePack.ts seeks inside the pack and falls back to the line file
 * when a line is missing, its duration no longer matches, or the pack fails to load.
 *
 *   node scripts/build-lesson-packs.cjs            rebuild packs + offset maps, delete unreferenced packs
 *   node scripts/build-lesson-packs.cjs --check    exit 1 if anything would change (no writes)
 *   node scripts/build-lesson-packs.cjs --verify   also decode packs with ffmpeg and compare every line sample by sample
 *
 * Run it after anything that changes lesson voices (scripts/plays/kokoro-lessons.py, import-lessons.mjs, link-generated-voices.mjs).
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const FORMATS = ['futsal', '7v7', '9v9', '11v11'];
const COACHES = ['kokoro_af_bella', 'kokoro_af_heart', 'kokoro_am_michael', 'kokoro_af_sarah'];
const PACK_DIR = '/voice/packs';
const FRAME = 1024;
/** Silent frames between lines (and after the last): 24 × 1024 / 24 kHz = 1.024 s, so a stop timer delayed by a busy main
 * thread never reaches the next line (headless Chromium under load stopped up to 0.31 s late). A silent frame is 4 bytes
 * (+4 in stsz), so the margin is almost free. One silent AAC-LC mono raw frame: SCE, global_gain 160, long window,
 * max_sfb 0, no tools, END. */
const GAP_FRAMES = 24;
const SILENT_FRAME = Buffer.from([0x01, 0x40, 0x20, 0x07]);
const LINE_RE = /\/([0-9a-f]{16})\.m4a$/;

// ------------------------------------------------------------------------------------------------ minimal MP4 reading
function boxes(buf, start = 0, end = buf.length) {
  const out = [];
  for (let at = start; at + 8 <= end;) {
    let size = buf.readUInt32BE(at); const type = buf.toString('latin1', at + 4, at + 8); let header = 8;
    if (size === 1) { size = Number(buf.readBigUInt64BE(at + 8)); header = 16; } else if (size === 0) size = end - at;
    if (size < header || at + size > end) throw new Error(`bad box ${type}`);
    out.push({ type, start: at, body: at + header, end: at + size }); at += size;
  }
  return out;
}
const child = (buf, box, type) => boxes(buf, box.body, box.end).find(b => b.type === type);
function walk(buf, box, ...types) { let b = box; for (const t of types) { b = child(buf, b, t); if (!b) return null; } return b; }

/** Descriptor length (ISO 14496-1 expandable size). */
function descLen(buf, at) { let n = 0, i = 0, b; do { b = buf[at + i++]; n = (n << 7) | (b & 0x7f); } while (b & 0x80 && i < 4); return [n, i]; }
/** AudioSpecificConfig bytes out of an esds box. */
function ascFromEsds(buf, esds) {
  let at = esds.body + 4; // version/flags
  if (buf[at] !== 0x03) throw new Error('esds: no ES_Descriptor');
  let [, n] = descLen(buf, at + 1); at += 1 + n + 3; // ES_ID + flags
  if (buf[at] !== 0x04) throw new Error('esds: no DecoderConfigDescriptor');
  [, n] = descLen(buf, at + 1); at += 1 + n + 13;
  if (buf[at] !== 0x05) throw new Error('esds: no DecoderSpecificInfo');
  const [len, m] = descLen(buf, at + 1); at += 1 + m;
  return buf.subarray(at, at + len);
}

/** Parse an AAC-only m4a written by ffmpeg: packets, AudioSpecificConfig and the edit list (priming, content length). */
function readM4a(file) {
  const buf = fs.readFileSync(file);
  const top = boxes(buf), moov = top.find(b => b.type === 'moov');
  if (!moov) throw new Error(`${file}: no moov`);
  const mvhd = child(buf, moov, 'mvhd');
  const movieScale = buf.readUInt32BE(mvhd.body + (buf[mvhd.body] === 1 ? 20 : 12));
  const traks = boxes(buf, moov.body, moov.end).filter(b => b.type === 'trak');
  if (traks.length !== 1) throw new Error(`${file}: expected one track`);
  const trak = traks[0], mdia = child(buf, trak, 'mdia'), mdhd = child(buf, mdia, 'mdhd');
  const scale = buf.readUInt32BE(mdhd.body + (buf[mdhd.body] === 1 ? 20 : 12));
  const stbl = walk(buf, mdia, 'minf', 'stbl'), stsd = child(buf, stbl, 'stsd');
  const entry = boxes(buf, stsd.body + 8, stsd.end)[0];
  if (entry.type !== 'mp4a') throw new Error(`${file}: not AAC (${entry.type})`);
  const channels = buf.readUInt16BE(entry.body + 16), rate = buf.readUInt32BE(entry.body + 24) >>> 16;
  const esds = boxes(buf, entry.body + 28, entry.end).find(b => b.type === 'esds');
  const asc = Buffer.from(ascFromEsds(buf, esds));
  // sample sizes
  const stsz = child(buf, stbl, 'stsz'); const fixed = buf.readUInt32BE(stsz.body + 4), count = buf.readUInt32BE(stsz.body + 8);
  const sizes = []; for (let i = 0; i < count; i++) sizes.push(fixed || buf.readUInt32BE(stsz.body + 12 + 4 * i));
  // chunk offsets
  const co = child(buf, stbl, 'stco') || child(buf, stbl, 'co64'), wide = co.type === 'co64';
  const chunks = []; for (let i = 0, n = buf.readUInt32BE(co.body + 4); i < n; i++) chunks.push(wide ? Number(buf.readBigUInt64BE(co.body + 8 + 8 * i)) : buf.readUInt32BE(co.body + 8 + 4 * i));
  const stsc = child(buf, stbl, 'stsc'); const runs = [];
  for (let i = 0, n = buf.readUInt32BE(stsc.body + 4); i < n; i++) runs.push([buf.readUInt32BE(stsc.body + 8 + 12 * i), buf.readUInt32BE(stsc.body + 12 + 12 * i)]);
  const packets = []; let s = 0;
  for (let c = 0; c < chunks.length; c++) {
    let per = 0; for (const [first, n] of runs) if (c + 1 >= first) per = n;
    let off = chunks[c];
    for (let k = 0; k < per && s < count; k++, s++) { packets.push(buf.subarray(off, off + sizes[s])); off += sizes[s]; }
  }
  if (packets.length !== count) throw new Error(`${file}: sample table mismatch`);
  // timing: every frame is 1024 samples (the last stts delta may be shortened to the content end)
  const stts = child(buf, stbl, 'stts'); let mediaSamples = 0;
  for (let i = 0, n = buf.readUInt32BE(stts.body + 4); i < n; i++) mediaSamples += buf.readUInt32BE(stts.body + 8 + 8 * i) * buf.readUInt32BE(stts.body + 12 + 8 * i);
  const elst = walk(buf, trak, 'edts', 'elst');
  let priming = 0, content = mediaSamples;
  if (elst) {
    const v = buf[elst.body], n = buf.readUInt32BE(elst.body + 4); if (n !== 1) throw new Error(`${file}: ${n} edits`);
    const dur = v === 1 ? Number(buf.readBigUInt64BE(elst.body + 8)) : buf.readUInt32BE(elst.body + 8);
    priming = v === 1 ? Number(buf.readBigInt64BE(elst.body + 16)) : buf.readInt32BE(elst.body + 12);
    content = Math.round(dur * scale / movieScale);
  }
  if (content + priming > packets.length * FRAME) throw new Error(`${file}: edit beyond media`);
  return { file, asc, channels, rate, scale, packets, priming, content };
}

// ------------------------------------------------------------------------------------------------ minimal MP4 writing
const u8 = n => Buffer.from([n]), u16 = n => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const u32 = n => { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }, i32 = n => { const b = Buffer.alloc(4); b.writeInt32BE(n); return b; };
const box = (type, ...parts) => { const body = Buffer.concat(parts.flat()); return Buffer.concat([u32(body.length + 8), Buffer.from(type, 'latin1'), body]); };
const full = (type, version, flags, ...parts) => box(type, u8(version), Buffer.from([flags >> 16 & 255, flags >> 8 & 255, flags & 255]), ...parts);
const desc = (tag, ...parts) => { const body = Buffer.concat(parts.flat()); return Buffer.concat([u8(tag), Buffer.from([0x80, 0x80, 0x80, body.length]), body]); };
const MATRIX = Buffer.concat([0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000].map(u32));

/** One-track AAC m4a: ftyp, moov (one chunk), mdat. Edit list skips `priming` samples and shows `content` samples. */
function writeM4a({ asc, channels, rate, packets, priming, content }) {
  const total = packets.length * FRAME, sizes = packets.map(p => p.length), bytes = sizes.reduce((a, b) => a + b, 0);
  const seconds = total / rate, avg = Math.round(bytes * 8 / seconds);
  let peak = 0; for (let i = 0, win = 0; i < sizes.length; i++) { win += sizes[i] - (i >= 24 ? sizes[i - 24] : 0); peak = Math.max(peak, win); }
  const max = Math.round(peak * 8 * rate / (24 * FRAME)), buffer = Math.max(...sizes);
  const esds = full('esds', 0, 0, desc(0x03, u16(1), u8(0), desc(0x04, u8(0x40), u8(0x15), Buffer.from([buffer >> 16 & 255, buffer >> 8 & 255, buffer & 255]), u32(max), u32(avg), desc(0x05, asc)), desc(0x06, u8(0x02))));
  const mp4a = box('mp4a', Buffer.alloc(6), u16(1), Buffer.alloc(8), u16(channels), u16(16), u16(0), u16(0), u32(rate << 16 >>> 0), esds);
  const stbl = (offset) => box('stbl',
    full('stsd', 0, 0, u32(1), mp4a),
    full('stts', 0, 0, u32(1), u32(packets.length), u32(FRAME)),
    full('stsc', 0, 0, u32(1), u32(1), u32(packets.length), u32(1)),
    full('stsz', 0, 0, u32(0), u32(packets.length), sizes.map(u32)),
    full('stco', 0, 0, u32(1), u32(offset)),
    // AAC 'roll' sample group, as ffmpeg writes it in every line file: each frame needs the frame before it (roll -1).
    // Without it Apple's decoder (WebKit decodeAudioData) placed the pack's lines 2112 samples early.
    full('sgpd', 1, 0, Buffer.from('roll'), u32(2), u32(1), u16(0xffff)),
    full('sbgp', 0, 0, Buffer.from('roll'), u32(1), u32(packets.length), u32(1)));
  const moov = (offset) => box('moov',
    full('mvhd', 0, 0, u32(0), u32(0), u32(rate), u32(content), u32(0x00010000), u16(0x0100), Buffer.alloc(10), MATRIX, Buffer.alloc(24), u32(2)),
    box('trak',
      full('tkhd', 0, 3, u32(0), u32(0), u32(1), u32(0), u32(content), Buffer.alloc(8), u16(0), u16(0), u16(0x0100), u16(0), MATRIX, u32(0), u32(0)),
      box('edts', full('elst', 0, 0, u32(1), u32(content), i32(priming), u32(0x00010000))),
      box('mdia',
        full('mdhd', 0, 0, u32(0), u32(0), u32(rate), u32(total), u16(0x55c4), u16(0)),
        full('hdlr', 0, 0, u32(0), Buffer.from('soun'), Buffer.alloc(12), Buffer.from('SoundHandler\0')),
        box('minf', full('smhd', 0, 0, u16(0), u16(0)), box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))), stbl(offset)))));
  const ftyp = box('ftyp', Buffer.from('M4A '), u32(512), Buffer.from('M4A isomiso2'));
  const head = ftyp.length + moov(0).length + 8;
  return Buffer.concat([ftyp, moov(head), u32(bytes + 8), Buffer.from('mdat'), ...packets]);
}

// ------------------------------------------------------------------------------------------------ lessons → packs
/** The lines a pack holds, in play order: each step, then each question's prompt and explanation. Deduplicated by src. */
function packLines(lesson, coach) {
  const out = [], seen = new Set();
  const add = clips => { const c = clips && clips[coach]; if (!c || !(c.duration > 0) || !LINE_RE.test(c.src) || seen.has(c.src)) return; seen.add(c.src); out.push(c); };
  for (const step of lesson.steps || []) add(step.voice);
  for (const q of lesson.questions || []) { add(q.voice); add(q.explainVoice); }
  return out;
}
/** Every voiced clip of the lesson for this coach (also wrong-answer explanations), for coverage checks. */
function allClips(lesson, coach) {
  const out = [];
  const add = (clips, kind) => { const c = clips && clips[coach]; if (c) out.push({ ...c, kind }); };
  for (const step of lesson.steps || []) add(step.voice, 'step');
  for (const q of lesson.questions || []) { add(q.voice, 'prompt'); add(q.explainVoice, 'explain'); (q.choiceVoices || []).forEach(v => add(v, 'choice')); } // the right answer plays explainVoice (FieldLearning), so every choiceVoice is a wrong-answer line
  return out;
}
const lineHash = src => (LINE_RE.exec(src) || [])[1];
/** Map key: the first 8 hex digits of the line's hash (unique within a pack, checked below); times to the millisecond. The
 * maps ride in the lesson catalogs, so they are kept short (~25 bytes a line). */
const lineKey = src => lineHash(src).slice(0, 8);
const round3 = n => Math.round(n * 1e3) / 1e3;

/** Build one pack in memory: bytes, name and the offset map. `read` lets tests feed parsed line files. */
function buildPack(lessonId, coach, lines, read = src => readM4a(path.join(PUBLIC, src.split('?')[0]))) {
  const parsed = lines.map(c => read(c.src));
  const first = parsed[0];
  for (const p of parsed) {
    if (!p.asc.equals(first.asc) || p.rate !== first.rate || p.scale !== first.rate || p.channels !== first.channels) throw new Error(`${p.file}: audio config differs from ${first.file}`);
  }
  const rate = first.rate, packets = [], map = {};
  const gap = () => { for (let i = 0; i < GAP_FRAMES; i++) packets.push(SILENT_FRAME); };
  // The pack's own edit list skips the first line's priming, so pack time 0 = media sample `prime0`.
  const prime0 = first.priming;
  parsed.forEach((p, i) => {
    if (i) gap();
    const media = packets.length * FRAME + p.priming;
    const start = (media - prime0) / rate, end = start + p.content / rate;
    const key = lineKey(lines[i].src); if (map[key]) throw new Error(`${lessonId}/${coach}: two lines share key ${key}`);
    map[key] = [round3(start), round3(end)];
    packets.push(...p.packets);
  });
  gap();
  const content = packets.length * FRAME - prime0;
  const bytes = writeM4a({ asc: first.asc, channels: first.channels, rate, packets, priming: prime0, content });
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  return { bytes, src: `${PACK_DIR}/${coach}/${lessonId}-${hash}.m4a`, lines: map, parsed };
}

/** The offset maps for one coach and one format: public/voice/packs/<coach>/<format>.json = {lessonId: {src, lines}}. */
const indexPath = (coach, format) => `${PACK_DIR}/${coach}/${format}.json`;

function build({ write = true, verify = false, log = console.log } = {}) {
  const changes = [], keep = new Set(); const stats = { packs: 0, lines: 0, bytes: 0, lineBytes: 0, indexBytes: 0 };
  const put = (rel, data) => {
    const target = path.join(PUBLIC, rel), same = fs.existsSync(target) && fs.readFileSync(target).equals(data);
    keep.add(rel); if (same) return;
    changes.push(rel); if (write) { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data); }
  };
  for (const format of FORMATS) {
    const lessons = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'lessons', `${format}.json`), 'utf8'));
    const index = Object.fromEntries(COACHES.map(c => [c, {}]));
    for (const lesson of lessons) {
      for (const coach of COACHES) {
        const lines = packLines(lesson, coach); if (!lines.length) continue;
        const pack = buildPack(lesson.id, coach, lines);
        index[coach][lesson.id] = { src: pack.src, lines: pack.lines };
        stats.packs++; stats.lines += lines.length; stats.bytes += pack.bytes.length;
        stats.lineBytes += lines.reduce((a, c) => a + fs.statSync(path.join(PUBLIC, c.src)).size, 0);
        put(pack.src, pack.bytes);
        if (verify) verifyPack(path.join(PUBLIC, pack.src), pack, lines, log);
      }
    }
    for (const coach of COACHES) { const data = Buffer.from(JSON.stringify(index[coach])); stats.indexBytes += data.length; put(indexPath(coach, format), data); }
  }
  // anything else under public/voice/packs (an older build) is removed
  const dir = path.join(PUBLIC, PACK_DIR);
  if (fs.existsSync(dir)) for (const coach of fs.readdirSync(dir)) {
    const sub = path.join(dir, coach); if (!fs.statSync(sub).isDirectory()) continue;
    for (const name of fs.readdirSync(sub)) { const rel = `${PACK_DIR}/${coach}/${name}`; if (!keep.has(rel)) { changes.push(`delete ${rel}`); if (write) fs.unlinkSync(path.join(sub, name)); } }
  }
  return { changes, stats };
}

/**
 * Decode the pack and each line file with ffmpeg and compare. The packets are byte-identical (checked first), and the first
 * line decodes bit-exactly. Later lines match in time and level but not bit for bit: AAC noise substitution (PNS) fills
 * noise bands from a random generator whose state runs on through the whole stream (ffmpeg seeds it once per decoder), so
 * those bands get different noise of the same energy. Checked per line at lag 0: waveform SNR >= 10 dB (a line shifted by even a few
 * samples falls to ~0 dB), energy of every frame above -30 dBFS within 3 dB, and silent gaps between lines.
 */
function verifyPack(target, pack, lines, log) {
  const { execFileSync } = require('node:child_process');
  const pcm = f => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-'], { maxBuffer: 1 << 28 }); return new Int16Array(b.buffer, b.byteOffset, b.length >> 1); };
  const packed = readM4a(target), starts = [];
  let p = 0;
  pack.parsed.forEach((line, i) => {
    if (i) p += GAP_FRAMES;
    starts.push((p * FRAME + line.priming - packed.priming) / line.rate);
    line.packets.forEach((pkt, k) => { if (!packed.packets[p + k].equals(pkt)) throw new Error(`${pack.src}: packet ${k} of line ${i} differs`); });
    p += line.packets.length;
  });
  const all = pcm(target), rate = pack.parsed[0].rate; let gapPeak = 0, prevEnd = 0, minSnr = Infinity, maxFrameDb = 0, firstDiff = 0;
  lines.forEach((c, i) => {
    const one = pcm(path.join(PUBLIC, c.src)), [start, end] = pack.lines[lineKey(c.src)];
    // the map is rounded to 1 ms: the exact start is the frame position (verified against the packets above)
    const at = Math.round(starts[i] * rate);
    if (Math.abs(start - starts[i]) > 6e-4 || Math.abs((end - start) * rate - one.length) > 48) throw new Error(`${c.src}: ${one.length} samples, map says ${(end - start) * rate}`);
    let sig = 0, err = 0;
    for (let k = 0; k < one.length; k++) { sig += one[k] ** 2; err += (all[at + k] - one[k]) ** 2; if (!i) firstDiff = Math.max(firstDiff, Math.abs(all[at + k] - one[k])); }
    minSnr = Math.min(minSnr, err ? 10 * Math.log10(sig / err) : 99);
    for (let f = 0; f + 1024 <= one.length; f += 1024) {
      let a = 0, o = 0; for (let k = f; k < f + 1024; k++) { a += all[at + k] ** 2; o += one[k] ** 2; }
      if (o / 1024 > 1000 ** 2) maxFrameDb = Math.max(maxFrameDb, Math.abs(10 * Math.log10(a / o)));
    }
    for (let k = prevEnd + Math.round(0.05 * rate); k < at - Math.round(0.05 * rate); k++) gapPeak = Math.max(gapPeak, Math.abs(all[k]));
    prevEnd = at + one.length;
  });
  if (firstDiff > 1) throw new Error(`${pack.src}: first line differs by ${firstDiff}`);
  if (minSnr < 10 || maxFrameDb > 3) throw new Error(`${pack.src}: a line drifted (SNR ${minSnr.toFixed(1)} dB, frame energy ±${maxFrameDb.toFixed(2)} dB)`);
  if (gapPeak > 64) throw new Error(`${pack.src}: gap not silent (${gapPeak})`);
  log(`verified ${pack.src}: ${lines.length} lines, packets identical, first line bit-exact, min SNR ${minSnr.toFixed(1)} dB, frame energy ±${maxFrameDb.toFixed(2)} dB, gap peak ${gapPeak}`);
  return { minSnr, maxFrameDb, gapPeak };
}

module.exports = { readM4a, writeM4a, buildPack, packLines, allClips, lineHash, lineKey, indexPath, build, FORMATS, COACHES, GAP_FRAMES, PACK_DIR };

if (require.main === module) {
  const check = process.argv.includes('--check'), verify = process.argv.includes('--verify');
  const { changes, stats } = build({ write: !check, verify });
  console.log(`${stats.packs} packs, ${stats.lines} lines: ${stats.lineBytes} bytes of line files -> ${stats.bytes} bytes of packs (+ ${stats.indexBytes} bytes of offset maps)`);
  if (changes.length) console.log((check ? 'out of date:\n  ' : 'wrote:\n  ') + changes.slice(0, 20).join('\n  ') + (changes.length > 20 ? `\n  … ${changes.length - 20} more` : ''));
  if (check && changes.length) process.exit(1);
}
