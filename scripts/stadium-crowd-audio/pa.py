import sys, numpy as np, soundfile as sf
from kokoro import KPipeline
# usage: pa.py outdir voice : the stadium announcer lines (Kokoro-82M, Apache-2.0), raw 24 kHz wavs
out, voice = sys.argv[1], sys.argv[2]
lines = {
 'welcome': 'Good afternoon, and welcome to Drip F C Stadium!',
 'goal': 'Gooaal! What a strike! What a goal, here at Drip F C Stadium!',
}
p = KPipeline(lang_code=voice[0], repo_id='hexgrad/Kokoro-82M')
for k, t in lines.items():
    a = np.concatenate([np.asarray(r.audio) for r in p(t, voice=voice, speed=0.92)])
    sf.write(f'{out}/{k}.wav', a, 24000)
    print(k, round(len(a) / 24000, 2))
