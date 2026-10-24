#!/usr/bin/env bash
# Einmalig pro Container: alle Werkzeuge + Assets fuer Geo-Karten-Videos in ~/.cache/geo-karten
set -euo pipefail
C="$HOME/.cache/geo-karten"; mkdir -p "$C" "$HOME/.cache/geo-voice"
cd "$C"
[ -f package.json ] || npm init -y >/dev/null
# NASA Blue Marble Kacheln (z0-7), OpenMoji-Icons, Schriften, GSAP lokal (CDN ist evtl. blockiert)
npm i --silent @freetiler/nasa-bluemarble openmoji @fontsource/kalam @fontsource/montserrat gsap@3.14.2
# Laendergrenzen (Natural Earth 10m)
[ -f ne10m.geojson ] || curl -sS -o ne10m.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
[ -f ne10m_states.geojson ] || curl -sS -o ne10m_states.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson || true
# Deutsche Stimme (Piper, Thorsten) - HuggingFace ist blockiert, daher GitHub-Release
if [ ! -f "$HOME/.cache/geo-voice/de-thorsten-low.onnx" ]; then
  curl -sSL -o /tmp/thorsten.tgz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
  tar xzf /tmp/thorsten.tgz -C "$HOME/.cache/geo-voice" && rm /tmp/thorsten.tgz
fi
pip install -q piper-tts onnx numpy pillow 2>&1 | grep -v -i warn || true
echo "OK: $C"
