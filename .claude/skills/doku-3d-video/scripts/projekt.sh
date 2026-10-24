#!/usr/bin/env bash
# Neues Doku-3D-Projekt: bash projekt.sh <slug>  -> /home/user/videos/<slug>
set -euo pipefail
N="$1"; C="$HOME/.cache/doku-3d"; D="/home/user/videos/$N"
mkdir -p "$D" && cd "$D"
[ -f hyperframes.json ] || HYPERFRAMES_SKIP_SKILLS=1 npx hyperframes init . --example blank --resolution portrait --non-interactive --skill hyperframes >/dev/null
mkdir -p compositions renders assets/{audio,fonts,sfx,vendor,icons}
cp "$C/node_modules/three/build/three.min.js" "$C/node_modules/gsap/dist/gsap.min.js" assets/vendor/
for f in 600-normal 700-normal 600-italic 700-italic; do cp "$C/node_modules/@fontsource/open-sans/files/open-sans-latin-$f.woff2" assets/fonts/; done
S=/home/user/.agents/skills/media-use/audio/assets/sfx
[ -d "$S" ] && cp "$S"/{pop,whoosh,whoosh-short,impact-bass-1,error,riser}.mp3 assets/sfx/ 2>/dev/null || true
echo "$D"
