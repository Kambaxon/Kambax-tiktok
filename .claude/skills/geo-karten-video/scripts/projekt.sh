#!/usr/bin/env bash
# Neues Video-Projekt anlegen: bash projekt.sh <name>   -> /home/user/videos/<name>
set -euo pipefail
N="$1"; C="$HOME/.cache/geo-karten"; D="/home/user/videos/$N"
mkdir -p /home/user/videos && cd /home/user/videos
[ -d "$D" ] || HYPERFRAMES_SKIP_SKILLS=1 npx hyperframes init "$N" --example blank --resolution portrait --non-interactive --skill hyperframes >/dev/null
mkdir -p "$D"/{compositions,renders} "$D"/assets/{map,icons,audio,fonts,sfx,vendor}
cp "$C/node_modules/gsap/dist/gsap.min.js" "$D/assets/vendor/"
cp "$C/node_modules/@fontsource/kalam/files/kalam-latin-700-normal.woff2" "$D/assets/fonts/kalam-700.woff2"
cp "$C/node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff2" "$D/assets/fonts/montserrat-900.woff2"
S=/home/user/.agents/skills/media-use/audio/assets/sfx
[ -d "$S" ] && cp "$S"/{pop,whoosh,whoosh-short,impact-bass-1,error,riser}.mp3 "$D/assets/sfx/" 2>/dev/null || true
echo "$D"
