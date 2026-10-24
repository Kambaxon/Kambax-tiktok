---
name: geo-karten-video
description: NUR verwenden, wenn der User ausdruecklich den Karten-/Geopolitik-Stil (Satellitenkarte, eingefaerbte Laender, geomania99) verlangt. Standard fuer neue Videos ist doku-3d-video.
---

# Geo-Karten-Videos (TikTok, Deutsch)

Der User ist TikTok-Creator. Jedes Video wird **komplett im Code mit HyperFrames** gebaut (zuerst den `hyperframes`-Skill lesen: Render-Vertrag, `check`, `snapshot`, `render`).
**Sprache: immer Deutsch** - Skript, Voiceover, Untertitel, Labels, Antworten an den User.

## Ablauf (ohne Rueckfragen, wenn der User ein Thema nennt)

1. **Einmal pro Container:** `bash ~/.claude/skills/geo-karten-video/scripts/setup.sh`
   (Kacheln, Icons, Schriften, GSAP lokal, Grenzen, Piper-Stimme. Netzwerk: nur npm, PyPI und GitHub sind offen.
   Esri/NASA-GIBS/HuggingFace/jsdelivr sind blockiert, deshalb die Umwege hier.)
2. **Projekt:** `bash scripts/projekt.sh <slug>` -> `/home/user/videos/<slug>`
3. **Skript** (`skript.txt`, eine Zeile = ein Beat/Satz). Laenge: 30 s ~ 65-70 Woerter, 60-75 s ~ 150-170.
   Zahlen fuer die Stimme ausschreiben, Anzeige mit `{}`: `sechsundvierzig{46}`. Abkuerzungen ausschreiben (Lkw -> Laster).
   Fakten nur wenn belastbar; geschaetzte Werte mit "rund"/"etwa" und Konjunktiv bei Gedankenexperimenten.
4. **Voiceover + Wortzeiten:** `python3 scripts/voice.py skript.txt assets/audio --speed 1.05`
   -> `voice.wav` (48 kHz, -15 LUFS) + `words.json`. Hat der User eine eigene Aufnahme: die verwenden
   (Wortzeiten dann per `npx hyperframes transcribe --model small --language de`, falls Modelle erreichbar).
5. **Karte:** `python3 scripts/map.py assets/map --bbox lon0,lon1,lat0,lat1 --laender DEU,... --staedte "Berlin:13.40,52.52;..."`
   (Regionen/Bundeslaender: `--admin1 "Bayern;Sachsen-Anhalt"`). Bild <= ~5000 px Kante halten.
6. **Icons:** `python3 scripts/icons.py --suche "oil"` und `python3 scripts/icons.py assets/icons name=HEX ...`
7. **Szenen bauen** - Vorlage: `templates/beispiel-keiner-arbeitet/` (index.html, karte.html, skript.txt).
   Untertitel: `python3 scripts/captions.py assets/audio/words.json compositions/untertitel.html --duration <s>`
8. `npx hyperframes check --json` -> `npx hyperframes snapshot --at ... -o snap` (max. ~6 Zeitpunkte pro Aufruf,
   sonst wird der Prozess beendet) -> Bilder ansehen -> korrigieren.
9. **Render im Hintergrund:** `npx hyperframes render -o renders/<slug>.mp4 -q delivery -w 2 --quiet`
   (run_in_background). Danach mit ffprobe pruefen, Kontaktabzug ansehen, Datei an den User schicken.

## Der Look (aus 3 Referenzvideos analysiert - genau so bauen)

**Format:** 1080x1920, 30 fps, 30-75 s. Kein Intro, kein Logo, Frame 0 ist schon Hook (Land eingefaerbt + Figur/Icon).

**Karte = Buehne, eine durchgehende Kamerafahrt.** Satellitenbild, Meer dunkles Petrol, Land natuerlich gruen/beige.
Kaum harte Schnitte: Kamera zoomt/schwenkt zwischen Beats (0.8 s `power2.inOut`), dazwischen langsamer Drift.
Kamera = ein Wrapper `#k-cam` (transform-origin 0 0), Ziel per `cam(px, py, scale)` -> Kartenpixel auf Bildschirmmitte (540, 900).
Alles, was an Orten haengt (Icons, Labels, Laender), liegt IM Kamera-Wrapper in Kartenpixeln.
Grosse Zahlen und "TAG 1"-Labels liegen im Bildschirmraum.

**Laender** als SVG-Pfad: Flaeche halbtransparent (`fill-opacity` ~0.66, Satellitentextur scheint durch),
heller Rand (~2.5 px), Schlagschatten `drop-shadow(0 10px 10px rgba(0,0,0,.45))`. Farbe per GSAP auf CSS-`fill`
tweenen (nicht `attr`, CSS schlaegt das Attribut). Feste Farben pro Land:
Deutschland #2f5bea (Royalblau), Tuerkei/Russland/Iran #e02424 (Rot), Ukraine #e5a82e (Gelborange),
USA #5aa9ff (Hellblau), Akzentregion #a8d82a (Limette), Partei/Region-Highlight #f2a41c (Orange).
Farbwechsel erzaehlen mit (z.B. blau -> grau -> rot bei Absturz).

**Laendernamen:** Schreibschrift *Kalam 700*, weiss, schraeg (-8 bis -14 Grad), gross, Schatten, gerne angeschnitten.

**Figuren/Personen:** Freisteller-PNG (vom User, da keine Bildgenerierung) oder OpenMoji-Figuren,
immer mit **weissem Sticker-Rand** + Schatten (Klasse `.st`:
`drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(5px 9px 7px rgba(0,0,0,.45))`).
Sie stehen auf ihrem Land, ploppen rein (`back.out(2.2)`, 0.45 s) und schrumpfen raus (0.22 s `power3.in`).

**Icons:** Flat mit dicker dunkler Kontur (OpenMoji): Zapfsaeule, Oelfass, Geld, Explosion, Schiffe, Flaggen, Wahlurne ...
Mengen = viele kleine Icons ueber Staedte verteilt, gestaffelt 40-70 ms.

**Zahlen:** Montserrat Black, weiss, riesig (170-230 px), harter Schatten, oben im Bild (top ~240 px),
zaehlen hoch (1.0 s `power2.out`). Datum/Tag-Labels 96 px.

**Untertitel:** EIN Wort pro Einblendung, GROSSBUCHSTABEN, Montserrat Black ~68 px, weiss mit dunklem Schatten,
zentriert bei y ~1400 (wie Referenz, unteres Drittel), kleiner Pop pro Wort. Wird von `captions.py` erzeugt.

**Belege:** Schlagzeilen-/Dokument-Screenshots als schraeg einfliegende "Zettel"; gelegentlich B-Roll-Foto (2-3 s), dann zurueck zur Karte.

**Sound:** Voiceover ist die Uhr. SFX sparsam (`assets/sfx`): pop bei wichtigen Stickern, whoosh bei Kamerafahrten,
error bei Kreuz/Stopp, impact-bass beim Wendepunkt. Musik nur, wenn der User eine Datei liefert (kein Musik-Zugang hier).

## Dramaturgie

1. Hook 0-3 s: Frage oder Eilmeldung + Gesicht/Land sofort sichtbar.
2. Kontext: konkrete Zahl/Datum/Quelle.
3. Eskalation in Schritten (Tag 1 / Tag 3 / Tag 7 oder Ereignis -> Reaktion -> Folge), alle 1-3 s ein neues Element.
4. Wendepunkt/Payoff (Zahl kippt, Land faerbt sich um, Shake + Impact).
5. Ende: rauszoomen + offene Frage an die Zuschauer (Kommentare). Kein Abspann.

## Technische Fallen (gemessen)

- GSAP lokal einbinden (`assets/vendor/gsap.min.js`), CDN ist blockiert.
- `snapshot` mit vielen Zeitpunkten wird beendet -> in Bloecken von ~6.
- Render mit `-w 2` (grosses Kartenbild + Filter brauchen RAM).
- Piper-Stimme klingt synthetisch (16 kHz) - dem User eine eigene Aufnahme oder ElevenLabs-Datei anbieten;
  dann `voice.wav` ersetzen und Wortzeiten neu bestimmen.
- Bildnachweis klein oben rechts: "Bild: NASA Blue Marble".
- Der Container ist fluechtig: fertige Videos sofort an den User schicken; Skill/Projekte nur dauerhaft,
  wenn in ein Git-Repo gepusht.
