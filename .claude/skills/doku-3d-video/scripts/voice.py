#!/usr/bin/env python3
"""Deutsches Voiceover mit Piper + Wort-Zeitstempel fuer Untertitel.

Eingabe: Skriptdatei, eine Zeile pro Satz/Beat. Optional pro Wort eine
Untertitel-Ueberschreibung mit "gesprochen{ANZEIGE}", z.B. "sechsundvierzig{46}".
Ausgabe: <out>/voice.wav (48 kHz) und <out>/words.json
  {"duration": s, "lines": [{"start","end","text"}], "words": [{"id","text","start","end","line"}]}

  python3 voice.py skript.txt assets/audio --voice ~/.cache/geo-voice/de-thorsten-low.onnx
"""
import argparse, json, re, subprocess, wave, os
import numpy as np
from piper import PiperVoice, SynthesisConfig

ap = argparse.ArgumentParser()
ap.add_argument("script"); ap.add_argument("out")
ap.add_argument("--voice", default=os.path.expanduser("~/.cache/geo-voice/de-thorsten-low.onnx"))
ap.add_argument("--gap", type=float, default=0.32, help="Pause zwischen Zeilen (s)")
ap.add_argument("--lead", type=float, default=0.12, help="Stille am Anfang (s)")
ap.add_argument("--speed", type=float, default=1.0, help=">1 = langsamer (length_scale)")
a = ap.parse_args()

voice = PiperVoice.load(a.voice, include_alignments=True)
_phon = voice.phonemize  # unbekannte Phoneme (z.B. Cedille) entfernen, sonst faellt das Alignment aus
voice.phonemize = lambda text: [[p for p in sent if p in voice.config.phoneme_id_map] for sent in _phon(text)]
cfg = SynthesisConfig(length_scale=a.speed)
SR = voice.config.sample_rate
lines = [l.strip() for l in open(a.script, encoding="utf-8") if l.strip() and not l.startswith("#")]

audio = [np.zeros(int(a.lead * SR), np.int16)]
t = a.lead; words = []; line_meta = []
for li, raw in enumerate(lines):
    tokens = raw.split()
    spoken = " ".join(re.sub(r"\{.*?\}", "", w) for w in tokens)
    shown = []; spoken_len = []
    for w in tokens:
        m = re.search(r"\{(.*?)\}", w)
        txt = m.group(1) if m else w
        txt = re.sub(r"[^\wÄÖÜäöüß0-9€%.,-]", "", txt).strip(".,")
        if txt: shown.append(txt); spoken_len.append(len(re.sub(r"\{.*?\}|[^\w]", "", w)) or 1)
    chunks = list(voice.synthesize(spoken, syn_config=cfg, include_alignments=True))
    pcm = np.concatenate([c.audio_int16_array for c in chunks])
    # Wortgrenzen aus Phonem-Alignment (Leerzeichen trennt Woerter)
    groups = []; cur = None; pos = 0
    for c in chunks:
        for al in (c.phoneme_alignments or []):
            n = int(al.num_samples)
            is_sep = al.phoneme in (" ", "^", "$", "_")
            is_punct = al.phoneme in list(",.?!:;—–-")
            if is_sep or is_punct:
                if cur: groups.append(cur); cur = None
            else:
                if cur is None: cur = [pos, pos + n]
                else: cur[1] = pos + n
            pos += n
    if cur: groups.append(cur)
    scale = len(pcm) / max(pos, 1)
    if len(groups) != len(shown):
        # Fallback: proportional nach Zeichenanzahl ueber den gesprochenen Bereich
        if groups: s0, e0 = groups[0][0] * scale, groups[-1][1] * scale
        else:
            # kein Alignment (z.B. unbekanntes Phonem): Sprechbereich per Energie finden
            fr = SR // 100; env = np.array([np.abs(pcm[i:i+fr]).mean() for i in range(0, len(pcm), fr)])
            on = np.where(env > env.max() * 0.06)[0]
            s0, e0 = on[0] * fr, (on[-1] + 1) * fr
        scale = 1.0
        tot = sum(spoken_len); acc = s0; groups = []
        for n in spoken_len:
            d = (e0 - s0) * n / tot; groups.append([acc, acc + d]); acc += d
        print(f"  Zeile {li+1}: Fallback-Timing ({len(shown)} Woerter)")
    for w, (s, e) in zip(shown, groups):
        words.append({"id": f"w{len(words)}", "text": w.upper(), "start": round(t + s * scale / SR, 3),
                      "end": round(t + e * scale / SR, 3), "line": li})
    line_meta.append({"start": round(t, 3), "end": round(t + len(pcm) / SR, 3), "text": re.sub(r"\{.*?\}", "", raw)})
    audio.append(pcm); t += len(pcm) / SR
    if li < len(lines) - 1:
        audio.append(np.zeros(int(a.gap * SR), np.int16)); t += a.gap

os.makedirs(a.out, exist_ok=True)
tmp = os.path.join(a.out, "_voice_raw.wav")
with wave.open(tmp, "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(np.concatenate(audio).tobytes())
# Etwas Waerme + Praesenz, Lautheit fuer Social (-15 LUFS), 48 kHz
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af",
                "highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3,loudnorm=I=-15:TP=-1.5:LRA=7",
                "-ar", "48000", os.path.join(a.out, "voice.wav")], check=True)
os.remove(tmp)
json.dump({"duration": round(t, 3), "lines": line_meta, "words": words},
          open(os.path.join(a.out, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"voice.wav {t:.2f}s, {len(words)} Woerter, {len(lines)} Zeilen")
