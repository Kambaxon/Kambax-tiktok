---
name: doku-3d-video
description: Standard für JEDES TikTok-Video des Users. Erzählt Geschichte, Ereignisse und Gedankenexperimente in stilisierten 3D-Szenen mit Three.js in HyperFrames, im Stil der Referenzen (Tsunami 2004, Titanic 1912, Fehlalarm 1983). Immer auf Deutsch und in der Du-Form, mit Countdown-Titel oben links, kursiven Wort-für-Wort-Untertiteln mit blauen Schlüsselwörtern und einem Erklärteil („Warum?“) als flache Schemagrafik. Gilt für jede Video-, Themen- oder Skriptanfrage für seinen Kanal.
---

# Doku-3D-Videos (TikTok, Deutsch)

Alles wird im Code gebaut: HyperFrames plus Three.js. Lies zuerst den Skill `hyperframes`, dort stehen Vertrag, `check`, `snapshot` und `render`.
**Sprache: immer Deutsch.** Das gilt für Skript, Stimme, Titel, Untertitel und für Antworten an den User.

## Das Format (aus drei Referenzvideos gemessen)

- **Technik:** 1080×1920, 30 fps.
- **Länge: STANDARD 60–90 Sekunden** (ausdrücklicher Wunsch des Users; ~150–200 Wörter, 10–14 Einstellungen). Kürzer nur auf ausdrücklichen Wunsch.
- **Perspektive:** Der Zuschauer bist DU. „Du gehst zum Strand.“ „Du sitzt in einem Bunker bei Moskau.“ „Dein Wecker klingelt.“
- **Countdown-Struktur:** Die Zeit ist das Rückgrat. „In 3 Stunden“ → „Noch 2,5 Std.“ → „Noch 30 Min.“ → „Stunde 0“ → „+40 Min.“. Alternativ „Minute 0/25/100/160“ oder „Tag 1/3/7/10“. Der Wendepunkt ist „Stunde 0“ bzw. „Minute 0“.
- **Aufbau:**
  1. Ruhiger Einstieg (idyllisch oder alltäglich), Datum und Ort in der Dachzeile.
  2. Zeichen und Eskalation, jede Einstellung ein Zeitsprung.
  3. Katastrophe oder Wendepunkt.
  4. Bilanz mit einer harten Zahl, gern auf einer stilisierten Karte („≈ 230.000“, rote Zahlen bei Alarm).
  5. **Erklärteil „… im Schnitt“ / „Warum?“** mit dunklem Panel und flacher Schemagrafik, Untertitel „SCHEMA, NICHT MASSSTABSGETREU“.
  6. Schluss: eine Lehre oder eine Frage an „dich“.
- **Schnitt:** harte Schnitte zwischen Einstellungen (alle 2–4 s). Innerhalb jeder Einstellung fährt die Kamera langsam, als Dolly oder Push-in, mit `smooth()` über die ganze Einstellung.

## Gestaltung

**3D-Welt (Three.js r149, `assets/vendor/three.min.js`, im Szenen-`<template>` laden):**
- Stilisierte, weiche Low-Poly-Welt mit glatten Materialien (roughness ~0.8), warmer Sonne und weichen Schatten (PCFSoft, 1024er-Map).
- Himmel als Verlaufstextur, dazu Nebel. Tonemapping ACES mit Belichtung ~0.62, sonst wirkt alles blass.
- **Figuren = Gliederpuppen:** Kapsel-Beine, -Torso und -Arme, Kugelkopf, Haarkappe, einfarbige Kleidung, keine Gesichter. Helfer `person(seed, {top, pants, scale})`, Animation mit `idle()` / `walk()`, Phasen nie synchron.
- Requisiten aus Box, Zylinder und Kugel, Details über `canvasTex()` (Zifferblatt, Schilder, Fenster).
- Nachtszenen mit Emissive-Fenstern; Licht aus = `emissiveIntensity` gestaffelt nach Entfernung.
- Jede Einstellung ist `W.<id> = {scene, camera, update(tLokal, T)}`, `SHOTS` legt die Zeiten fest. Gerendert wird über einen GSAP-Proxy (`onUpdate → renderAt`) und zusätzlich über `hf-seek`.
- Vorlage: `templates/beispiel-keiner-arbeitet/welt.html`, mit diesen Szenen: Schlafzimmer + Wecker, Großraumbüro, Bushaltestelle, Supermarkt, Krankenhausflur, Müllstraße + Ratten, Stadt bei Nacht (Licht aus), Küche mit Kerze, Fenster/Balkon. Helfer, Szenen und Renderer kopieren, Szenen wiederverwenden oder ersetzen.
- Portrait-Bildausschnitt ist schmal (~27° horizontal): Kamera weiter weg stellen, als man denkt, und Figuren in die Bildmitte setzen.
- Hold-Shots unter Panels: `{ id, t0, t1, hold: true }` rendert die Szene im Endzustand.

**Titelblock oben links** (`scripts/titel.py`, Daten in `titel.json`), Open Sans, weiß, weicher Schatten:
- Dachzeile, 32 px, 600, Großbuchstaben mit Sperrung, z. B. „26. DEZEMBER 2004, ≈ 10:00 UHR“.
- Titel, 132 px, 700, z. B. „Noch 30 Min.“, „Minute 0“, „Tag 7“. Bei Alarm darf er rot sein (`"farbe":"#ff4b3e"`).
- Unterzeile, 32 px, 600, Großbuchstaben, z. B. „DAS MEER ZIEHT SICH ZURÜCK“.
- Position: links 72 px, oben 228 px. Wechselt mit jedem Schnitt (Blur-in 0.2 s).

**Untertitel** (`scripts/untertitel.py`):
- Open Sans 700 *kursiv*, 54 px, zentriert bei y ≈ 1210.
- Eine Phrase (bis zum Satzzeichen bzw. max. 5 Wörter) steht da. Noch nicht gesprochene Wörter sind gedimmt (0.5) und leuchten beim Sprechen auf.
- Schlüsselwörter in Hellblau `#6cc0ff` (`--blau "Meer,Welle"`).

**Bilanz-Karte** (Vorlage `bilanz.html`, Pfade aus `europa-paths.json` bzw. Natural Earth):
- Flache Karte: Meer `#123f73`, Land beige `#e9dfc6`, Zielland heller mit weißem Rand, gelbe Stadtpunkte.
- Weiße Ringe pulsieren vom Zentrum, große Zahl im Titelblock zählt hoch und wird rot.

**Erklärteil** (Vorlagen `erklaerung.html` = Kette, `vorrat.html` = zwei Phasen im selben Streifen):
- Szene stark abgedunkelt (`rgba(20,26,38,.97)` oben, unten etwas Durchblick).
- Titelblock „DIE URSACHE / Warum? / SCHEMA, NICHT MASSSTABSGETREU“.
- Ein heller Bildstreifen (y 640–1040) mit flacher Illustration (Querschnitt, Kette, Kammern…) und Labels in Großbuchstaben.
- Status-Satz in Cyan `#5fd0e8` unter dem Streifen.
- Rotes Kreuz bzw. grüner Haken als Icons (OpenMoji).

**Ton:** Die Stimme ist die Uhr. SFX sparsam einsetzen:
- whoosh-short bei Schnitten
- impact-bass beim Wendepunkt
- error/pop bei Kreuz oder Alarm

Musik nur, wenn der User eine Datei liefert.

## Ablauf (ohne Rückfragen, wenn ein Thema genannt ist)

1. `bash scripts/setup.sh` (einmal pro Container), dann `bash scripts/projekt.sh <slug>`.
2. `skript.txt` schreiben: eine Zeile pro Einstellung, Du-Form, kurze Sätze.
   - Länge: 60 s ≈ 150 Wörter, 70 s ≈ 165, 90 s ≈ 210 (Piper ~2,5 Wörter/s inkl. Pausen).
   - Zahlen für die Stimme ausschreiben, Anzeige mit `zwölf{12}`.
   - Fakten nur, wenn belastbar; Schätzungen mit „rund“/„etwa“, Gedankenexperimente im Konjunktiv bzw. als Szenario.
3. `python3 scripts/voice.py skript.txt assets/audio --speed 1.08 --gap 0.45`
   - Ergebnis: `voice.wav` und `words.json`, Einstellungen nach `lines[].start` schneiden.
   - Eigene Aufnahme des Users hat Vorrang.
4. `titel.json` → `python3 scripts/titel.py titel.json compositions/titel.html`
5. `python3 scripts/untertitel.py assets/audio/words.json compositions/untertitel.html --blau "..."`
6. `compositions/welt.html` (3D) und `compositions/erklaerung.html` (Schema) bauen; `index.html` aus der Vorlage übernehmen (Ebenen: welt 1, erklaerung 2, titel 3, untertitel 4, Audio).
7. `npx hyperframes check --json` (Fehler müssen weg; Kontrastwarnungen über hellem Himmel sind stilbedingt).
   - Dann `npx hyperframes snapshot --at a,b,c,d,e,f --no-end -o snap`, maximal ca. 6 Zeitpunkte pro Aufruf.
   - Bilder ansehen und korrigieren.
8. Render im Hintergrund: `npx hyperframes render -o renders/<slug>.mp4 -q delivery -w 2 --quiet`.
   - WebGL läuft auf der CPU, das dauert einige Minuten.
   - Danach mit ffprobe prüfen, Kontaktabzug ansehen und die Datei an den User schicken.

## Stimme (Wunsch des Users: freundliche Frauenstimme)

- **Bevorzugt: ElevenLabs-Datei vom User** (bisher „Jessica – Playful, Bright, Warm“, eleven_v4). Ablauf:
  1. Dem User das Skript als Textblock zum Einsprechen geben (eine Zeile pro Einstellung).
  2. Referenz mit Wortzeiten erzeugen: `python3 scripts/voice.py skript.txt /tmp/ref --voice ~/.cache/geo-voice/vits-piper-de_DE-kerstin-low/de_DE-kerstin-low.onnx --gap 0.4`
  3. Ausrichten: `python3 scripts/align.py /tmp/ref assets/audio/<eleven>.mp3 assets/audio` (DTW über MFCC, Zeilenstarts auf echte Pausen gerastet).
     Ergebnis: `voice.wav` + `words.json`; Zeilengrenzen mit `silencedetect` gegenprüfen.
  4. Alle Zeiten (Schnitte, Titel, Effekte, Panels) aus den neuen Wortzeiten ableiten.
- Ersatz ohne Datei: weibliche Piper-Stimmen (Kerstin/Ramona/Eva, GitHub `k2-fsa/sherpa-onnx` Release `tts-models`). Die klingen synthetisch; nur als Notlösung, das dem User so sagen.
- Kein Voice-Cloning möglich (Modelle blockiert), keine fremden oder Promi-Stimmen nachbauen.

## Musik und Geräusche

Der User will immer eine leise Hintergrundmusik und Effektgeräusche. Openverse, Freesound, Pixabay, archive.org und HeyGen sind blockiert, deshalb wird beides synthetisch erzeugt mit `scripts/klang.py`.

- **Musik:** `python3 scripts/klang.py musik musik-plan.json assets/music/musik.wav`
  - `musik-plan.json` legt pro Abschnitt fest: Akkord, Energie, Helligkeit und optional einen Puls in BPM. Dazu kommen ein paar Klaviertöne.
  - Die Abschnitte folgen der Dramaturgie: düster → Anspannung (Puls) → Tiefpunkt fast still → warmer Dur-Akkord bei Hoffnung.
  - Ins Video mit `data-volume` ~0.22 unter der Stimme (Musikdatei ≈ −18 LUFS).
- **Effekte:** `python3 scripts/klang.py sfx assets/sfx` erzeugt wind, grollen, radio, uhr, schritte, kolonne, sirene, glocke, herz, brummen, boom.
  - Dazu kommen die mitgelieferten whoosh/impact/riser aus `media-use`.
  - Lautstärken 0.15–0.45, Dauerklänge mit `data-fade-in/out`.
- **Kontrolle:** Spektrum per `showspectrumpic` ansehen (Klicks = senkrechte Linien). Ich kann nicht selbst hören, deshalb dem User sagen, dass der Mix gemessen und nicht gehört ist.
- Bei sensiblen Themen (Holocaust, Opfer) die Musik zurücknehmen; nur Wind oder Brummen.

## Sensible Geschichtsthemen

- Keine Hakenkreuze, SS-Runen oder andere NS-Symbole und keine Täter-Porträts mit Gesicht (TikTok sperrt das, auch im historischen Kontext). Fahnen und Uniformen abstrakt halten.
- Lager und Gewalt nur andeuten (Zaun, Wachturm, Nebel), keine Opfer zeigen. Ton sachlich und kritisch.
- Bei Was-wäre-wenn-Szenarien am Ende die Wirklichkeit einordnen („Die Realität“ / „Warum fast unmöglich“) und die Befreiung zeigen.

## Immer steigern (Wunsch des Users)

Jedes Projekt soll Atmosphäre, Effekte, Animation und Klang über das vorige heben. Der aktuelle Stand steht in `templates/beispiel-tschernobyl/`:

- **Partikel** `particles(scene, n, seed, {x,y,z,v,drift,grav,life,color,size,opacity,add,fog})`: deterministisch und immer mit der weichen Rund-Textur `SOFT` (ohne sie erscheinen Quadrate). Eingesetzt für Feuer, Glut, Rauch, Regen, Staub, Wasserstrahl und Laub.
- **Licht als Erzählung:** Alarmlampen blinken, Feuer-PointLights flackern, die Lichtsäule ist additiv, das Glühen am Horizont ist eine Gradient-Ebene (keine Kugel).
- **Kamera:** Wackeln bei Einschlägen (`exp(-u*2.2)`), langsame Dollys pro Einstellung.
- **Look-Ebene** `look.html` (z-index über der Welt, unter Titel/Untertiteln): Filmkorn (15 fps, deterministisch), Vignette, weißer Blitz bei Explosionen, Abblende ins Schwarze für Schweigemomente, Schluss-Abblende.
- **Klang:** `klang.py sfx2` für Geiger (3 Dichten), Alarm, Explosion, Feuer, Sirene2, Bus, Regen und Knarren. In `musik-plan.json` gibt es `luft` (Obertöne), `sub` (Tiefbass) und `stille` (harte Stille-Fenster, z. B. direkt nach dem Knall). Dazu ein Riser, der genau auf den Wendepunkt zuläuft (Start = Treffer − 10,03 s).
- **Struktur, die trägt:** Anfang und Ende spiegeln sich (du schläfst ↔ du stehst wach am Fenster), Karte und Schema dazwischen.

## Qualitäts-Checkliste vor jedem Render (Feedback des Users: „sauber arbeiten“)

- **Kein Flattern (Z-Fighting):** Keine zwei Flächen fast deckungsgleich. Böden, Sandflächen, Markierungen und Fensterplanes mindestens 0,02 m (nah) bzw. 0,2 m (weit) Abstand geben, oder `polygonOffset: true, polygonOffsetFactor: -1` auf dem oberen Material. Overlay-Planes (z. B. Alarm über Paneel) nie 1 cm davor.
- **Kein Schattenflimmern:** `shadow.bias` / `normalBias` setzen, die Schattenkamera eng um die Szene legen (`size` passend), bei großen Szenen `mapSize` 2048.
- **Bewegungs-Check:** Jede Einstellung mit `snapshot --range a,b --frames 8` in Bewegung prüfen, nicht nur Einzelbilder. Flackern, Springen und Durchdringen suchen.
- **Keine traurigen Szenen:** Jede Einstellung braucht Tiefe und Details (Vorder-, Mittel-, Hintergrund), lebendige Figuren (Gesten, versetzte Bewegung) und stimmiges Licht. Szenen wie der Spielplatz waren zu leer und flach. Mehr Requisiten (Bänke, Bäume, Zäune, Laternen, Wäscheleinen, Autos), Bodentextur statt Einheitsfarbe, Licht mit Richtung (Gegenlicht/Morgensonne) und mehr Figuren in Aktion einsetzen.
- Kontrastreiche Untertitel auf hellen Szenen prüfen.

## Gelernt in Projekt 4 (Asteroid)

- **Glühende Objekte** (Feuerkugel, Lichterketten, Lichtsäulen) brauchen `toneMapped: false`, sonst macht ACES sie grau.
- **Schweife/Streifen** entlang der Flugbahn: Kegel nach +Y verschieben und die Gruppe mit `quaternion.setFromUnitVectors(Y, -Flugrichtung)` drehen.
- **Rauchsäulen/Pilze** aus Partikeln bauen (heißer Kern additiv + dunkler Rauch normal), nie aus Zylinder/Kugel (sieht aus wie ein UFO-Strahl).
- **Figuren ins Bild rechnen:** Portrait hat nur ±13,5° horizontal. Vor jedem Kamerawechsel den Winkel Kamera→Figur prüfen.
- **Tiere im Profil zeigen** (seitlich zur Blickachse), von hinten werden sie zu Klumpen.
- **Stadtkulisse:** keine Gebäude in den ersten 70–150 m vor der Kamera, sonst blockiert ein Hochhaus das Bild. Vordere Gebäude höher, damit eine Skyline entsteht.
- **Texturen von GitHub raw** (z. B. NASA Blue Marble aus `vasturiano/three-globe`) mit `window.__hf.buildReady` laden.

## Bildqualität & Figuren (Feedback nach Projekt 4: „rauscht“, Figuren zu simpel)

- **Kein Filmkorn mehr.** Es rauscht und wird von TikTok zu Matsch komprimiert. Die Look-Ebene behält nur Vignette, Blitze und Abblenden (Korn-Canvas weglassen).
- **Figuren v2** aus `templates/figuren.js` statt der alten Gliederpuppe (Block aus den Basis-Helfern ersetzen):
  - Gesicht: Augen mit Iris, Pupille und Glanzpunkt, Brauen, Nase, Mund, Ohren.
  - Frisuren (kurz, seitenscheitel, pony, lang, dutt, locken, glatze), Bart, Brille, Jacke, Kragen und Schuhe.
  - Ellbogen-Gelenke, Blinzeln in `idle()`.
  - Optionen: `person(seed, { kind: "f"|"m", hair, beard, glasses, jacket, top, pants, skin, hairColor, scale })`.
  - Für Nahaufnahmen von Gesichtern: Kamera ~1 m vor dem Kopf, Schatten `normalBias` ≥ 0,04.
- Alle runden Teile mit genug Segmenten (≥ 16), sonst entstehen Zacken an den Gelenken.
- TikTok-Export ohne Korn: zwei Durchgänge mit 12 Mbit/s, Lautheit −15 LUFS.

## Fallen

- `cam()` hat nur 400 m Sichtweite. Für alles, was weiter weg steht (Horizont, Kraftwerk, Bögen), `camFar(3000+)` nehmen und den Nebel weit genug setzen, sonst ist es unsichtbar.
- Portrait-Fenster: Hintergrundobjekte genau durch die Öffnung planen (Winkel = atan(Höhe/Entfernung)).

- **Qualität vor Tempo** (Wunsch des Users): immer 1080×1920, `-q delivery`, volle Schatten und Kantenglättung. Ein 70-s-Render dauert in der Cloud (CPU-WebGL) etwa 40–60 Min. Das vorher ansagen und nicht herunterregeln.

- `pkill -f <muster>` trifft die eigene Shell, wenn das Muster im Befehl steht. Prozesse stattdessen per PID beenden.
- Die Piper-Stimme klingt synthetisch (16 kHz). Biete eine eigene Aufnahme oder eine ElevenLabs-Datei an.
- Bei Zeilen mit unbekanntem Phonem gibt es kein Alignment. `voice.py` verteilt die Wörter dann nach Energie und Silbenlänge; Timing im Snapshot prüfen.
- Szenen-Ids müssen eindeutig sein (Präfixe `er-`, `ti-`, `ut-`).
- Der Container ist flüchtig: Videos sofort schicken. Skill und Projekte bleiben nur erhalten, wenn sie in ein Git-Repo gepusht werden.
