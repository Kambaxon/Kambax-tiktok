#!/usr/bin/env bash
# Einmal pro Container. Offen sind nur npm, PyPI, GitHub (kein HuggingFace, kein jsdelivr).
set -euo pipefail
C="$HOME/.cache/doku-3d"; mkdir -p "$C" "$HOME/.cache/geo-voice"; cd "$C"
[ -f package.json ] || npm init -y >/dev/null
npm i --silent three@0.149.0 gsap@3.14.2 @fontsource/open-sans openmoji
if [ ! -f "$HOME/.cache/geo-voice/de-thorsten-low.onnx" ]; then
  curl -sSL -o /tmp/thorsten.tgz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
  tar xzf /tmp/thorsten.tgz -C "$HOME/.cache/geo-voice" && rm /tmp/thorsten.tgz
fi
pip install -q piper-tts onnx numpy 2>&1 | grep -vi warn || true
echo "OK: $C"
