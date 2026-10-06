# Kokoro (local TTS) setup

Every coach voice in the game (lessons, quizzes, play films, books, museum) is Kokoro-82M, run locally and offline.
The runtime lives **outside the repo and outside /tmp** so a reboot does not wipe it:

| What | Where |
|---|---|
| venv (Python 3.12) | `~/.venvs/futbol-kokoro` |
| PyTorch model (`hexgrad/Kokoro-82M`, used by `kokoro` / `KPipeline`) | Hugging Face cache, `~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M` (downloaded on the first run, offline after) |
| ONNX model (only for `build-path-narration.py`) | `~/.venvs/futbol-kokoro/onnx-models/{kokoro-v1.0.onnx,voices-v1.0.bin}` |
| espeak-ng (fallback phonemes) | Homebrew: `/opt/homebrew/share/espeak-ng-data`, `/opt/homebrew/lib/libespeak-ng.dylib` (the scripts patch `espeakng_loader` to use them) |
| Pronunciations | `scripts/plays/pronunciations.json`, installed by `scripts/plays/kokoro_lexicon.py` |

Default coach voice: **`af_bella`, speed 1.0**. Lesson coaches: `af_bella`, `af_heart`, `af_sarah`, `am_michael`.

## Rebuild (after a wipe)

The system `python3` is 3.14, which is too new for torch/kokoro. Use 3.12 (`~/.local/bin/python3.12`, or `brew install python@3.12`).

```sh
brew install espeak-ng ffmpeg            # if missing
/Users/khoado/.local/bin/python3.12 -m venv ~/.venvs/futbol-kokoro
~/.venvs/futbol-kokoro/bin/pip install --upgrade pip
~/.venvs/futbol-kokoro/bin/pip install kokoro soundfile numpy espeakng_loader kokoro-onnx onnxruntime
~/.venvs/futbol-kokoro/bin/python -m spacy download en_core_web_sm    # misaki needs it; otherwise it fetches it on first run
# ONNX model files for build-path-narration.py only
mkdir -p ~/.venvs/futbol-kokoro/onnx-models && cd ~/.venvs/futbol-kokoro/onnx-models
curl -fLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -fLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

Built Oct 6 2026 with Python 3.12.14, kokoro 0.9.4, misaki 0.9.4, torch 2.14.1, numpy 2.5.3, kokoro-onnx 0.6.1, onnxruntime 1.30.0.

Smoke test (the first run downloads the model; after that it works with `HF_HUB_OFFLINE=1`):

```sh
cd <repo>
~/.venvs/futbol-kokoro/bin/python -c "
from kokoro import KPipeline; import numpy as np, soundfile as sf
p = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
sf.write('kokoro-test.wav', np.concatenate([r.audio.numpy() for r in p('The fixo stays back.', voice='af_bella', speed=1.0)]), 24000)"
ffprobe -v error -show_entries format=duration -of default=nw=1 kokoro-test.wav
```

## Voicing scripts (run from the repo root)

Set `PY=~/.venvs/futbol-kokoro/bin/python`.

| Script | Command | Writes |
|---|---|---|
| Lesson and quiz lines | `$PY scripts/plays/kokoro-lessons.py [--voices af_bella,...] [--dry-run] [hash ...]` | `public/voice/kokoro_<voice>/<hash>.m4a` + durations in `public/lessons/*.json` and `generated-voice.json` |
| Visual quiz merge | `python3 scripts/quiz/merge-visual-questions.py <format>` (prints the hashes to pass to `kokoro-lessons.py`); validate first with `node scripts/quiz/check-authored.cjs <format>` | `public/lessons/<format>.json`, `lib/town/quizManifest.json`, `lib/paths/formatPaths.json` |
| Play film narration | `$PY scripts/plays/kokoro-narrate.py <film-id>` | `public/plays/narration/<id>/<n>.m4a` + `timing.json` |
| Books | `node scripts/build-book-narration.cjs [bookId]` (uses this venv by default; override with `KOKORO_PYTHON`; runs with `HF_HUB_OFFLINE=1`, so run the smoke test once after a rebuild) | `public/voice/books/<book>/` |
| Museum stories | `node scripts/museum/export-story-lines.cjs` then `$PY scripts/museum/kokoro-museum.py [--voice af_bella] [--force]` | `public/voice/museum/<hash>.m4a` + `manifest.json` |
| Path story chapters (kokoro-onnx, `af_heart`) | `node scripts/export-path-narration.cjs` then `$PY scripts/build-path-narration.py ~/.venvs/futbol-kokoro/onnx-models <jobs.json> [--only=id] [--sample]` | `public/stories/narration/...` (check with `node scripts/check-path-narration.cjs`) |

Pending lesson lines are listed in `scripts/quiz/revoice-pending.json` (slots carry `duration: 0` until voiced; `tests/learning-content.cjs` enforces it).
After voicing: `node tests/learning-content.cjs`, `node tests/visual-quiz.cjs`, `node tests/lesson-catalog.cjs`, `node tests/book-narration.cjs`.
