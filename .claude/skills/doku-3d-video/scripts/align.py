#!/usr/bin/env python3
"""Fremdes Voiceover (z.B. ElevenLabs) auf das Skript ausrichten - ohne Spracherkennung.

Idee: voice.py erzeugt eine Piper-Referenz mit exakten Wortzeiten; DTW ueber MFCCs bildet die
Referenzzeit auf die echte Aufnahme ab. Danach werden Wortgrenzen an echte Pausen der Aufnahme gerastet.

  python3 voice.py skript.txt /tmp/ref --voice <weibl. Piper-Stimme> --gap 0.4
  python3 align.py /tmp/ref assets/audio/eleven.mp3 assets/audio
-> assets/audio/voice.wav (48 kHz, -15 LUFS) + words.json (gleiches Format wie voice.py)
"""
import json, subprocess, sys, os
import numpy as np, librosa
ref_dir, target, out = sys.argv[1:4]
HOP = 0.01; SR = 16000
def feats(path):
    y, _ = librosa.load(path, sr=SR, mono=True)
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=int(SR * HOP), n_fft=512)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
    rms = librosa.feature.rms(y=y, hop_length=int(SR * HOP))[0]
    return m, y, rms
fr, _, _ = feats(os.path.join(ref_dir, "voice.wav"))
ft, yt, rms_t = feats(target)
D, wp = librosa.sequence.dtw(X=fr, Y=ft, metric="cosine", step_sizes_sigma=np.array([[1, 1], [0, 1], [1, 0], [2, 1], [1, 2]]),
                             weights_add=np.array([0, 1, 1, 0, 0]), weights_mul=np.array([1, 1, 1, 1, 1]))
wp = wp[::-1]
m = {}
for i, j in wp: m.setdefault(i, []).append(j)
ref_idx = np.array(sorted(m)); tgt_idx = np.array([np.median(m[i]) for i in ref_idx])
f = lambda t: float(np.interp(t / HOP, ref_idx, tgt_idx) * HOP)
ref = json.load(open(os.path.join(ref_dir, "words.json"), encoding="utf-8"))
# Pausen der Zielaufnahme (fuer Zeilen- und Wortgrenzen)
silent = rms_t < max(rms_t.max() * 0.025, 1e-4)
words = []
for w in ref["words"]:
    words.append(dict(w, start=round(f(w["start"]), 3), end=round(f(w["end"]), 3)))
# Wortanfang nicht in Stille: auf erstes lautes Frame danach schieben
for w in words:
    k = int(w["start"] / HOP)
    while k < len(silent) - 1 and silent[k] and (k * HOP) < w["end"] - 0.05: k += 1
    w["start"] = round(k * HOP, 3)
for a, b in zip(words, words[1:]):
    if b["start"] < a["start"] + 0.05: b["start"] = round(a["start"] + 0.05, 3)
    a["end"] = round(min(a["end"], b["start"]), 3) if b["line"] == a["line"] else a["end"]
# Zeilenanfaenge an echte Pausen rasten (Ende einer Stille >= 0.25 s, max. 0.6 s entfernt)
gaps, k = [], 0
while k < len(silent):
    if silent[k]:
        j = k
        while j < len(silent) and silent[j]: j += 1
        if (j - k) * HOP >= 0.25: gaps.append(j * HOP)
        k = j
    else: k += 1
for li in range(1, len(ref["lines"])):
    ws = [w for w in words if w["line"] == li]
    near = [g for g in gaps if abs(g - ws[0]["start"]) <= 0.6]
    if near:
        g = min(near, key=lambda g: abs(g - ws[0]["start"]))
        if g < ws[0]["end"] - 0.05: ws[0]["start"] = round(g, 3)
lines = []
for li, l in enumerate(ref["lines"]):
    ws = [w for w in words if w["line"] == li]
    lines.append({"start": round(ws[0]["start"] - 0.05, 3), "end": round(ws[-1]["end"], 3), "text": l["text"]})
dur = len(yt) / SR
os.makedirs(out, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", target, "-af", "loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", "48000", os.path.join(out, "voice.wav")], check=True)
json.dump({"duration": round(dur, 3), "lines": lines, "words": words}, open(os.path.join(out, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(words)} Woerter ausgerichtet, Dauer {dur:.2f}s")
for l in lines: print(f"  {l['start']:6.2f}-{l['end']:6.2f}  {l['text'][:60]}")
