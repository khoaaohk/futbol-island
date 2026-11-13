"""Trim, normalise and loop-prepare the stadium recordings, then encode small AAC (.m4a).
usage: prep.py <download dir> <pa dir> <work dir> <out dir>
Loops: a 1 s equal-power crossfade makes the region seamless, then PAD s of wrap-around audio go on both ends so the
runtime loops [PAD, PAD+L] (decoder priming / edit-list differences between browsers cannot open a gap)."""
import sys, subprocess, json, numpy as np, soundfile as sf
dl, pa, work, out = sys.argv[1:5]
R = 32000; PAD = .25

def load(f, ch=2, sr=R):
    pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', f, '-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).reshape(-1, ch).copy()

def rms_db(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)

def norm(x, target):  # RMS to target dBFS, then a soft peak cap at -1 dBFS
    x = x * 10 ** ((target - rms_db(x)) / 20); cap = 10 ** (-1 / 20); k = .7 * cap; a = np.abs(x)
    soft = k + (cap - k) * np.tanh((a - k) / (cap - k))  # a soft knee above 0.7 of the cap, never past it
    return np.where(a > k, np.sign(x) * soft, x).astype(np.float32)

def fades(x, fin, fout):
    n = len(x); a = int(fin * R); b = int(fout * R)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None] ** 2
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None] ** 2
    return x

def loopify(x, L, X=1.0):
    """x holds L+X s; the last X s cross into the first X s (equal power): a seamless L s loop, then wrap padding."""
    n = int(L * R); m = int(X * R); y = x[:n].copy(); w = np.linspace(0, 1, m)[:, None]
    y[:m] = x[:m] * np.sqrt(w) + x[n:n + m] * np.sqrt(1 - w)
    p = int(PAD * R); return np.concatenate([y[n - p:], y, y[:p]])

def seg(f, a, b, ch=2): x = load(f, ch); return x[int(a * R):int(b * R)]

# tannoy: the chime and the announcer line through a PA horn (band-limited, a touch of drive) with the bowl's slap echoes
def tannoy(f, gain_db=0):
    y = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', f, '-ac', '1', '-ar', str(R), '-af',
        f'volume={gain_db}dB,highpass=f=330,highpass=f=330,lowpass=f=3700,lowpass=f=3700,equalizer=f=1800:t=q:w=1.2:g=5,'
        'acompressor=threshold=0.2:ratio=4:attack=5:release=80,aecho=0.85:0.75:190|410|690|1050:0.38|0.26|0.16|0.08',
        '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(y, dtype=np.float32).reshape(-1, 1).copy()

S = lambda i: f'{dl}/fs{i}.mp3'
assets = {}
# 1. bed: the Viking Stadion ambience (Vogyik, ORTF take), a steady match-day hum, 18 s loop
assets['bed'] = (loopify(seg(S(868982), 25.0, 44.2), 18.0), -20, 'loop', 60000)
# 2. roar: thousands roaring after a goal, the steady part (D.jones), 16 s loop, before the singing starts at ~42 s
assets['roar'] = (loopify(seg(S(528799), 15.0, 32.2), 16.0), -18, 'loop', 64000)
# 3. goal: the eruption and the first ten seconds (D.jones)
assets['goal'] = (fades(seg(S(528799), 3.4, 14.4), .03, 2.2), -16, 'shot', 64000)
# 4. goal2: a second goal eruption (Sandermotions, Cambuur Stadion), from the build-up
assets['goal2'] = (fades(seg(S(494352), 4.7, 14.8), .03, 2.0), -16, 'shot', 64000)
# 5. ooh: a near miss "oehh" (Sandermotions) and a second one from Hanover (ckater), mono
assets['ooh'] = (fades(seg(S(494362), 1.6, 8.6, 1), .25, 1.6), -18, 'shot', 40000)
assets['ooh2'] = (fades(seg(S(353418), 3.4, 9.6, 1), .3, 1.6), -18, 'shot', 40000)
# 6. groan: a crowd sighing in disappointment (ShangusBurger), mono
assets['groan'] = (fades(seg(S(763880), .7, 5.6, 1), .05, 1.2), -20, 'shot', 40000)
# 7. applause with whistles (craigsmith), mono
assets['applause'] = (fades(seg(S(480692), .3, 7.3, 1), .3, 1.8), -20, 'shot', 40000)
# 8. the referee's whistle (SpliceSound), one blow, mono
assets['whistle'] = (fades(seg(S(218318), 0, 1.4, 1), .003, .5), -16, 'shot', 48000)
# 9-10. PA: the ding-dong (Streety) then the announcer (Kokoro-82M bm_george, rendered offline) through the tannoy
chime = tannoy(S(31133), -2)
for k in ['welcome', 'goal']:
    v = tannoy(f'{pa}/{k}.wav', 2)
    x = np.concatenate([chime[:int(1.25 * R)] * .8, np.zeros((int(.15 * R), 1), np.float32), v])
    x = fades(x[:int(min(len(x) / R, 9.0) * R)], .005, .6)
    assets['pa-' + k] = (x, -19, 'shot', 40000)

info = {}
for k, (x, tgt, kind, br) in assets.items():
    x = norm(x.astype(np.float32), tgt); w = f'{work}/{k}.wav'; o = f'{out}/{k}.m4a'
    sf.write(w, x, R, subtype='PCM_16')
    ch = x.shape[1]
    subprocess.run(['afconvert', '-f', 'm4af', '-d', f'aac@{R}', '-c', str(ch), '-b', str(br * (1 if ch == 1 else 1)), '-s', '0', w, o], check=True)
    size = len(open(o, 'rb').read())
    info[k] = {'s': round(len(x) / R, 3), 'ch': ch, 'kind': kind, 'bytes': size, 'loop': [PAD, round(len(x) / R - PAD, 3)] if kind == 'loop' else None}
    print(f'{k:10s} {len(x) / R:5.2f} s ch{ch} {kind:4s} {size / 1024:6.1f} KB  rms {rms_db(x):.1f}')
print('total', round(sum(v['bytes'] for v in info.values()) / 1024, 1), 'KB')
json.dump(info, open(f'{work}/info.json', 'w'), indent=1)
