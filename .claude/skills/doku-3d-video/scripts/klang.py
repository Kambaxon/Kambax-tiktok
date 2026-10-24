#!/usr/bin/env python3
"""Hintergrundmusik + Atmo-Effekte synthetisch erzeugen (keine Musik-/SFX-Quellen erreichbar).

Musik: ruhiger Ambient-Teppich (Pads aus verstimmten Saegezaehnen, Tiefpass, Hall), Abschnitte mit
eigenem Akkord und Energie. Effekte: Wind, Grollen, Radiorauschen, Uhr, Schritte, Marsch, Sirene,
Glocke, Herzschlag, Suchscheinwerfer-Brummen.

  python3 klang.py musik plan.json assets/music/musik.wav
  python3 klang.py sfx assets/sfx
plan.json: {"dauer": 75.5, "abschnitte": [{"t": 0, "akkord": ["D2","A2","D3","F3"], "energie": 0.6, "puls": 0}, ...],
            "klavier": [[t, "D4"], ...]}
Deterministisch (feste Seeds). Alles 48 kHz.
"""
import json, sys, os
import numpy as np
from scipy import signal
SR = 48000
rng = np.random.default_rng(7)

def hz(n):
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
    p, o = n[:-1], int(n[-1]); return 440.0 * 2 ** ((names[p] + 12 * (o + 1) - 69) / 12)
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "low"); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "high"); return signal.lfilter(b, a, x)
def bp(x, f1, f2, o=2): b, a = signal.butter(o, [f1 / (SR / 2), f2 / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def reverb(x, sec=2.8, mix=0.35):
    n = int(sec * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6.9 / sec); ir = lp(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return (1 - mix) * x + mix * wet * 0.9
def saw(f, t, det=0.0):
    ph = (f * (1 + det) * t) % 1.0; return 2 * ph - 1
def env_lin(points, n):  # points [(t, v)]
    ts = np.array([p[0] for p in points]) * SR; vs = np.array([p[1] for p in points])
    return np.interp(np.arange(n), ts, vs)
def norm(x, peak=0.89): return x / (np.abs(x).max() + 1e-9) * peak
def write(path, x):
    import wave
    x = np.clip(x, -1, 1); st = np.stack([x, x], -1) if x.ndim == 1 else x
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())

def musik(plan, out):
    dur = plan["dauer"]; n = int(dur * SR); t = np.arange(n) / SR
    secs = plan["abschnitte"]; L = np.zeros(n); R = np.zeros(n)
    for i, s in enumerate(secs):
        t0 = s["t"]; t1 = secs[i + 1]["t"] if i + 1 < len(secs) else dur
        a0, a1 = int(max(0, t0 - 1.2) * SR), int(min(dur, t1 + 1.2) * SR)
        tt = t[a0:a1]; m = np.zeros_like(tt); m2 = np.zeros_like(tt)
        for k, note in enumerate(s["akkord"]):
            f = hz(note)
            v = (saw(f, tt, -0.004) + saw(f, tt, 0.0035) + 0.6 * np.sin(2 * np.pi * f * tt)) / 2.6
            m += v * (0.9 if k == 0 else 0.55); m2 += (saw(f, tt + 0.011, 0.002) + saw(f, tt, -0.0025)) / 2 * (0.9 if k == 0 else 0.55)
        extra = np.zeros_like(tt); extra2 = np.zeros_like(tt)
        if s.get("luft"):  # schwebende Obertoene + Hauch (Projekt 3+)
            top = hz(s["akkord"][-1]); trem = 0.6 + 0.4 * np.sin(2 * np.pi * tt * 0.23 + i)
            air = (np.sin(2 * np.pi * top * 2 * tt) * 0.25 + np.sin(2 * np.pi * top * 3.01 * tt) * 0.12) * trem
            hiss = bp(rng.standard_normal(len(tt)), 2500, 7000) * 0.05 * trem
            extra = air * s["luft"] * 3 + hiss * s["luft"]; extra2 = air * s["luft"] * 3 + hiss[::-1] * s["luft"]
        if s.get("sub"):
            subw = np.sin(2 * np.pi * hz(s["akkord"][0]) / 2 * tt) * s["sub"]; extra = extra + subw; extra2 = extra2 + subw
        cut = 380 + 900 * s.get("hell", 0.3)
        m = lp(m, cut, 2) + extra; m2 = lp(m2, cut, 2) + extra2
        # langsames Atmen der Pads
        breath = 0.82 + 0.18 * np.sin(2 * np.pi * tt / 7.3 + i)
        e = s.get("energie", 0.5)
        if s.get("puls"):  # tiefer Puls (Herzschlag-artig) in BPM
            bpm = s["puls"]; ph = (tt * bpm / 60) % 1.0
            kick = np.exp(-ph * 18) * np.sin(2 * np.pi * 48 * tt) + 0.6 * np.exp(-((ph - 0.28) % 1.0) * 22) * np.sin(2 * np.pi * 44 * tt)
            kick = lp(kick * (1 - np.exp(-ph * 300)), 110, 4)  # weicher Anschlag, keine Klicks
            m += kick * 1.6; m2 += kick * 1.6
        # Uebergang: 1.2 s Kreuzblende an den Grenzen
        fade = env_lin([(0, 0), (min(1.2, t0) if t0 > 0 else 0.001, 1), ((a1 - a0) / SR - (1.2 if t1 < dur else 0.001), 1), ((a1 - a0) / SR, 0)], len(tt))
        L[a0:a1] += m * breath * e * fade; R[a0:a1] += m2 * breath * e * fade
    # Klavier-Toene (sanft, mit Obertoenen)
    for tk, note in plan.get("klavier", []):
        f = hz(note); a = int(tk * SR); ln = int(3.5 * SR); tt = np.arange(ln) / SR
        tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 1.3) * (1 - np.exp(-tt * 300))
        b = min(n, a + ln); L[a:b] += tone[: b - a] * 0.22; R[a:b] += tone[: b - a] * 0.2
    L = reverb(hp(L, 35), 3.2, 0.4); R = reverb(hp(R, 35), 3.4, 0.4)
    master = env_lin([(0, 0), (1.5, 1), (dur - 3, 1), (dur, 0)], n)
    for a0, a1 in plan.get("stille", []):  # harte Stille-Fenster (z.B. direkt nach einer Explosion)
        master *= 1 - env_lin([(0, 0), (max(0, a0 - 0.15), 0), (a0, 1), (a1, 1), (a1 + 0.8, 0), (dur, 0)], n) * 0.95
    st = np.stack([L * master, R * master], -1); st = norm(st, 0.7)
    write(out, st)

def sfx(outdir):
    os.makedirs(outdir, exist_ok=True)
    def save(name, x, peak=0.85): write(os.path.join(outdir, name + ".wav"), norm(x, peak)); print(name)
    def T(sec): return np.arange(int(sec * SR)) / SR
    # Wind: Rauschen, bandpass, langsam wehend
    t = T(12); w = bp(np.cumsum(rng.standard_normal(len(t))) * 0.02 + rng.standard_normal(len(t)) * 0.3, 120, 900)
    w *= 0.55 + 0.45 * np.sin(2 * np.pi * t / 4.1) * np.sin(2 * np.pi * t / 2.3 + 1); save("wind", w * env_lin([(0, 0), (1, 1), (11, 1), (12, 0)], len(t)))
    # Entferntes Grollen / Einschlag
    t = T(4); g = lp(rng.standard_normal(len(t)), 140, 4) * np.exp(-t * 1.4) * (1 - np.exp(-t * 40)); save("grollen", reverb(g, 2.5, 0.5))
    # Radiorauschen mit Knistern
    t = T(2.5); r = bp(rng.standard_normal(len(t)), 900, 4200) * 0.5; cr = (rng.random(len(t)) > 0.9993) * rng.standard_normal(len(t)) * 6
    r = (r + lp(cr, 3000)) * env_lin([(0, 0), (0.05, 1), (2.2, 1), (2.5, 0)], len(t)); save("radio", r)
    # Uhr: tick-tack, 1 Hz, 8 s
    t = T(8); u = np.zeros(len(t))
    for k in range(8):
        a = int(k * SR); ln = int(0.03 * SR); tt = np.arange(ln) / SR; f = 2600 if k % 2 == 0 else 2100
        u[a:a + ln] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 260) + bp(rng.standard_normal(ln), 1500, 6000) * np.exp(-tt * 400) * 0.5
    save("uhr", reverb(u, 0.6, 0.25), 0.6)
    # Schritte draussen (6 Stueck)
    t = T(4); s = np.zeros(len(t))
    for k in range(6):
        a = int((0.2 + k * 0.55) * SR); ln = int(0.12 * SR); tt = np.arange(ln) / SR
        s[a:a + ln] += lp(rng.standard_normal(ln), 500, 2) * np.exp(-tt * 45) * (0.8 + 0.2 * (k % 2))
    save("schritte", reverb(s, 1.2, 0.35))
    # Marsch/Kolonne: viele Schritte, unregelmaessig
    t = T(7); s = np.zeros(len(t))
    for k in range(140):
        a = int(rng.random() * 6.8 * SR); ln = int(0.1 * SR); tt = np.arange(ln) / SR
        if a + ln < len(t): s[a:a + ln] += lp(rng.standard_normal(ln), 600, 2) * np.exp(-tt * 50) * (0.3 + 0.7 * rng.random())
    s += bp(rng.standard_normal(len(t)), 200, 1200) * 0.05; save("kolonne", reverb(s * env_lin([(0, 0), (1, 1), (6, 1), (7, 0)], len(t)), 1.5, 0.3))
    # Sirene (fern), steigt und faellt
    t = T(6); f = 420 + 380 * (0.5 - 0.5 * np.cos(2 * np.pi * t / 6)); ph = 2 * np.pi * np.cumsum(f) / SR
    si = np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph); si = lp(si, 1800) * env_lin([(0, 0), (0.8, 1), (5, 1), (6, 0)], len(t)); save("sirene", reverb(si, 3.0, 0.55))
    # Glocke (tief, unharmonische Teiltoene)
    t = T(7); f0 = 98; gl = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 0.5), (2.0, 0.6, 0.7), (2.4, 0.5, 0.9), (3.0, 0.35, 1.1), (4.2, 0.25, 1.6), (5.4, 0.15, 2.2)])
    save("glocke", reverb(gl * (1 - np.exp(-t * 200)), 3.5, 0.45))
    # Herzschlag (4 Schlaege)
    t = T(4); h = np.zeros(len(t))
    for k in range(4):
        for off, amp in [(0, 1.0), (0.26, 0.7)]:
            a = int((0.2 + k * 0.95 + off) * SR); ln = int(0.18 * SR); tt = np.arange(ln) / SR
            h[a:a + ln] += np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 28) * amp
    save("herz", lp(h, 200))
    # Brummen (Scheinwerfer / Lager), 8 s
    t = T(8); b = (np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t) + 0.2 * np.sin(2 * np.pi * 150 * t)) * 0.4 + bp(rng.standard_normal(len(t)), 80, 400) * 0.15
    save("brummen", b * env_lin([(0, 0), (1.5, 1), (6.5, 1), (8, 0)], len(t)), 0.5)
    # Einschlag fern (fuer Atombombe): tiefer Boom + langes Nachgrollen
    t = T(6); bo = lp(rng.standard_normal(len(t)), 90, 4) * np.exp(-t * 0.9) * (1 - np.exp(-t * 25)) + np.sin(2 * np.pi * 38 * t) * np.exp(-t * 1.5) * 0.6
    save("boom", reverb(bo, 3.0, 0.5))


def sfx2(outdir):
    """Erweiterte Effekte (Projekt 3+): Geiger, Alarm, Explosion, Feuer, Sirene2, Bus, Regen, Knarren."""
    os.makedirs(outdir, exist_ok=True)
    def save(name, x, peak=0.85): write(os.path.join(outdir, name + ".wav"), norm(x, peak)); print(name)
    def T(sec): return np.arange(int(sec * SR)) / SR
    # Geigerzaehler: Poisson-Klicks, Dichte pro Sekunde
    for name, rate, sec in [("geiger-wenig", 4, 10), ("geiger-mittel", 18, 10), ("geiger-viel", 70, 10)]:
        t = T(sec); g = np.zeros(len(t)); n = rng.poisson(rate * sec)
        for a in (rng.random(n) * (len(t) - 400)).astype(int):
            ln = 160; tt = np.arange(ln) / SR; g[a:a + ln] += (rng.standard_normal(ln) * 0.6 + np.sign(np.sin(2 * np.pi * 3200 * tt))) * np.exp(-tt * 1400) * (0.6 + 0.4 * rng.random())
        save(name, hp(g, 600), 0.7)
    # Alarm-Hupe (Kontrollraum): Rechteck 2 Toene, pulsierend
    t = T(6); f = np.where((t * 1.6) % 1 < 0.5, 520, 440); ph = 2 * np.pi * np.cumsum(f) / SR
    al = np.sign(np.sin(ph)) * 0.6 + np.sin(ph) * 0.4; al = lp(al, 2600) * (0.75 + 0.25 * np.sign(np.sin(2 * np.pi * 3.2 * t)))
    save("alarm", reverb(al * env_lin([(0, 0), (0.05, 1), (5.8, 1), (6, 0)], len(t)), 0.9, 0.3), 0.6)
    # Explosion: Druckwelle + tiefes Grollen + Truemmer-Prasseln
    t = T(9); bang = lp(rng.standard_normal(len(t)), 200, 4) * np.exp(-t * 1.1) * (1 - np.exp(-t * 300))
    sub = np.sin(2 * np.pi * (30 + 25 * np.exp(-t * 3)) * t) * np.exp(-t * 0.8)
    crack = hp(rng.standard_normal(len(t)), 2000) * (rng.random(len(t)) > 0.995) * np.exp(-((t - 1.5) ** 2) / 1.5) * 3
    debris = np.zeros(len(t))
    for k in range(60):
        a = int((0.8 + rng.random() * 5) * SR); ln = int(0.08 * SR); tt = np.arange(ln) / SR
        if a + ln < len(t): debris[a:a + ln] += bp(rng.standard_normal(ln), 300, 3000) * np.exp(-tt * 60) * rng.random() * 0.5
    save("explosion", reverb(bang * 1.2 + sub * 0.9 + lp(crack, 6000) + debris, 3.5, 0.45), 0.95)
    # Feuer: Rauschen + Knistern
    t = T(10); fi = lp(rng.standard_normal(len(t)), 700) * 0.4 * (0.8 + 0.2 * np.sin(2 * np.pi * t * 0.7))
    kn = (rng.random(len(t)) > 0.9985) * rng.standard_normal(len(t)) * 4; fi += bp(kn, 1500, 7000)
    save("feuer", fi * env_lin([(0, 0), (0.6, 1), (9.4, 1), (10, 0)], len(t)), 0.7)
    # Sirene (sowjetisch, auf- und abschwellend, lang)
    t = T(8); f = 300 + 500 * (0.5 - 0.5 * np.cos(2 * np.pi * t / 4)); ph = 2 * np.pi * np.cumsum(f) / SR
    si = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph) + 0.1 * np.sin(5 * ph)
    save("sirene2", reverb(lp(si, 2200) * env_lin([(0, 0), (1, 1), (7, 1), (8, 0)], len(t)), 4.0, 0.6), 0.7)
    # Dieselbus: tiefes Brummen mit Zuendrhythmus, langsam vorbeifahrend
    t = T(8); rpm = 18 + 2 * np.sin(2 * np.pi * t / 5); ph = 2 * np.pi * np.cumsum(rpm) / SR
    eng = (np.sign(np.sin(ph)) * 0.5 + np.sin(ph * 2) * 0.3) ; eng = lp(eng, 180, 3) + lp(rng.standard_normal(len(t)), 400) * 0.25
    save("bus", eng * env_lin([(0, 0.2), (4, 1), (8, 0.3)], len(t)), 0.7)
    # Regen
    t = T(12); ra = bp(rng.standard_normal(len(t)), 900, 9000) * 0.35
    drops = (rng.random(len(t)) > 0.9975) * rng.standard_normal(len(t)) * 2.5; ra += bp(drops, 2000, 8000)
    save("regen", ra * env_lin([(0, 0), (1, 1), (11, 1), (12, 0)], len(t)), 0.6)
    # Metall-Knarren (Riesenrad): langsame, verstimmte Reibung
    t = T(5); kr = np.zeros(len(t))
    for a0, d0 in [(0.3, 1.2), (2.4, 1.6)]:
        a = int(a0 * SR); ln = int(d0 * SR); tt = np.arange(ln) / SR
        f = 180 + 60 * np.sin(2 * np.pi * tt * 0.7) + 20 * np.sin(2 * np.pi * tt * 9); ph = 2 * np.pi * np.cumsum(f) / SR
        sq = np.sign(np.sin(ph)) * (0.5 + 0.5 * np.sin(2 * np.pi * tt * 23) ** 2)
        kr[a:a + ln] += bp(sq, 300, 2500) * np.sin(np.pi * tt / d0)
    save("knarren", reverb(kr, 2.5, 0.5), 0.6)

if __name__ == "__main__":
    if sys.argv[1] == "musik": musik(json.load(open(sys.argv[2])), sys.argv[3])
    elif sys.argv[1] == "sfx2": sfx2(sys.argv[2])
    else: sfx(sys.argv[2])
