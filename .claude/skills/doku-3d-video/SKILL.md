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

## STANDARD: Master-Look und Effekt-Abfrage (Wunsch des Users, gilt für JEDES Projekt)

**1. Immer nachfragen.** Vor dem Szenenbau, spätestens zusammen mit dem Skript, kurz fragen, welche Effekte und Looks das Thema braucht. Dazu passende Vorschläge machen:
- Wetter und Tageszeit, Nebel, Strahlen
- Spiegelungen
- Tiefenschärfe und Fokuszüge
- Bokeh
- Grading-Look
- Hitzeflimmern, Rauch, Feuer, Partikel
- Kamerastil
- Besondere Momente: Blitz, Zeitlupe, Abblende

Eine knappe Liste mit Empfehlung genügt. Wenn der User „mach einfach“ sagt, gilt der Master-Look unten.

**2. Master-Look ist der Standard.** Jedes Projekt startet mit dem Effekt-Kit aus ZUSAMMEN und Hudson, nie mit „neutral“ und flachen Farben. Grundwerte für `post`:
```js
const KLAR = { uSSAA: 1, uBloom: 0.35, uHalation: 0.03, uChroma: 0, uKorn: 0, uVig: 0.32, uAO: 0,
  uSplit: 0.12, uSplitSchatten: [0.22, 0.42, 0.5], uBokehOval: 0.55, uBokeh: 0.4, uAnamorph: 0.06,
  uStrahlen: 0.25, uFlare: 0.05, uSchaerfe: 0.3, uKlarheit: 0.2, uRolloff: 0.2 };
// look: "tealOrange" (kühle Schatten, warme Lichter)
// Außen/Luft: uNebel + uNebelHoehe (Straße ≈ 0.08/3, Kilometer-Skala ≈ 0.002/90) und uNebelFarbe passend zur Szene
```
- Wasser oder nasse Flächen bekommen immer `spiegelflaeche`.
- Himmel mit Wolkenart passend zum Thema, God Rays über `uStrahlen`.
- Glanz für Lack, Metall und Glas (`envMapIntensity` ≈ 1.8).
- Tiefenschärfe mit Fokuszug bei nahen Motiven (Fenster, Gesichter, Details).
- Feine Strukturen (Seile, Gitter) bekommen `uSSAA: 2` nur in diesem Shot.
- Nie Filmkorn.
- Das Tempo-Profil bleibt aktiv. Die Kosten der Effekte vor dem Render ansagen.

**3. Realismus-Strukturen sind Standard** (`materialien.js`, mit eigenen Höhen-, Rauheits- und Metallkarten). Schmutz reagiert matt, Feuchte und Bitumen glänzend. Statt glatter Einheitsfarben immer einsetzen, wo es passt:
- **Verfall und Patina:**
  - `beton_verwittert`: Schalungsbeton mit Mikroporen, Schalungsfugen und Ankerlöchern, Wasserläufern, Haarrissen und Salzausblühungen. Trockene Flächen rau, Poren, Risse und Läufer feucht glänzend. Für Brutalismus, Industrie, Brückenpfeiler, Kaimauern.
  - `stahl_rost`: Metall 1.0, gebürstete Grundstruktur, Plattenfelder mit Nietreihen. Rost konzentrisch um die Niete wirkt stumpf, Ölschmutz in den Fugen und Kratzer bis aufs blanke Metall glänzen. Für Brücken, alte Fahrzeuge, Industrie.
  - `asphalt_alt` / `asphalt_spur`: tiefes Splitt-Relief, Asphalt stumpf. Bitumenrisse und Ölflecken hochglänzend, abgefahrener Mittelstrich.
- **Organisch:**
  - `moosstein_feucht`: Moos stumpf mit Samtschimmer als Ersatz für Subsurface Scattering, Krustenflechten, nasse dunkle Fugen glänzend. Für Ufer, Mauern, Treppen.
  - `raureif`: dendritische Frostnadeln von den Kanten über altem Metall. Klarlack und Irisieren erzeugen Mikro-Refraktion in der tiefen Sonne. Für Fensterrahmen und Geländer im Winter.
- **Interieur:**
  - `kabinenteppich`: Schlingenflor mit Rautenmuster, Faserglanz (Sheen) und Laufspur bei u = 0,5. Mit `wiederholen: [1, n]` entlang des Gangs legen.
  - `alu_eloxiert`: diagonale Bürstrillen mit gestrecktem Glanz. Echte Anisotropie gibt es erst ab Three r153, hier entsteht der Effekt über die Rillen-Rauheit. Für Cockpit, Konsolen, Geräte.
- **Eigene Strukturen:** Neue Materialien mit `matMitLayout()` bauen. Der Farb-Maler legt die Merkmale einmal fest (Risse, Flecken, Niete), und die Maler in `def[6] = { hoehe, rau, metall }` zeichnen genau dieselben Stellen. Sonst passen Glanz und Farbe nicht zusammen. Graustufen: hell = hoch, rau, metallisch. Dazu in `def[4]` `aufl: 512` für feine Details.

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

## Bildqualität, Figuren & Welt (Feedback nach Projekt 4)

- **Kein Filmkorn** (rauscht, TikTok macht Matsch daraus). Die Look-Ebene behält nur Vignette, Blitze und Abblenden. TikTok-Export in zwei Durchgängen mit 12 Mbit/s und −15 LUFS.
- **Figuren v3** aus `templates/figuren.js` (ersetzt den alten Gliederpuppen-Block in den Basis-Helfern):
  - Gesicht mit Iris, Pupille, Glanzpunkt, Wimpern (f), Brauen, Nase, Lippen, Ohren; Blinzeln.
  - Hände mit 4 Fingern und Daumen, Ellbogen und Knie.
  - Kleidung: `top` tshirt/langarm/hemd (Kragen + Knöpfe)/hoodie (Kapuze, Tasche, Kordeln)/pulli (Bündchen), `jacke`, `unten` hose/shorts/rock/kleid, `schuhe` sneaker/stiefel/halbschuh.
  - Frisuren: kurz, seitenscheitel, pony, lang, bob, pferdeschwanz, dutt, locken, afro, undercut, glatze.
  - Bärte: vollbart, dreitage, schnurrbart, kinnbart. Dazu `brille`.
  - Körper: `oberweite` 0..1 (dezent, eingebettet), `bauch` 0..1, Breite und Größe variieren.
  - In Szenen immer gemischt besetzen: Alter, Hauttöne, Geschlechter, Stile.
- **Welt-Bausteine** aus `templates/bausteine.js`:
  - `auto(seed, "limo"|"kleinwagen"|"transporter"|"lkw"|"bus")` mit Felgen, Lichtern, Spiegeln und extrudierter Karosserie; `fahrrad()`.
  - `altbau(seed, breite, etagen, {geschaeft, licht})`: Fenster mit Rahmen, Sprossen, Fensterbänken, Läden und Blumenkästen, Balkone mit Geländer, Gesimse, Ziegeldach, Schornstein, Fallrohr. Dazu `einfamilienhaus()` mit Zaun und Briefkasten.
  - `strasse(s, länge)` (Asphalt mit Rissen, Markierungen, Zebrastreifen, Bordstein, Pflaster, Gullys), `laterne`, `schild`, `bank`, `muelleimer`.
  - `laubbaum`, `nadelbaum`, `birke`, `busch` (organische Blätter mit Farbverlauf), `gras` (InstancedMesh-Halme), `blumen`.
  - Fassaden zeigen nach +z: für Straßenzeilen `rotation.y = ±π/2`.
- **Requisiten und Posen** (`figuren.js`): `regenschirm(p, farbe)`, `zigarette(p)` (glühende Spitze; Rauch mit `particles(p, …)` am Mund), `handy(p)`; danach in jedem Frame `pose(p, t)` aufrufen. Kinder mit `person(seed, { alter: "kind" })`, Bewegung mit `rennen(p, t)`, dazu `ball(s)`.
- **Boden nie einfarbig flach!** In der Natur immer `gelaende(s, w, d, seed, { weg, amp, erde, kiesFlecken })` (uneben, gemalter Rasen mit Erde- und Kiesflecken, optional Kiesweg) plus `grasAufGelaende` (Halme folgen der Höhe), `kies(...)` (Steinchen), Steine, Büsche und Blumen. Objekte mit `ter.h(x, z)` auf die Höhe setzen. In der Stadt Pflaster/Asphalt-Texturen, Pfützen mit `pfuetze()`.
- **Kleine Lebewesen:** `schmetterlinge(...)` und `schwarm(...)` (Bienen/Fliegen) mit `update(t)`.
- **Fahrzeuge:** Autos haben getönte, durchsichtige Scheiben mit Innenraum (Sitze, Lenkrad, Armaturenbrett), Dachsäulen, Türfugen und Griffe; dazu `motorrad(seed)` und `fahrrad(seed)`.
- **Nacht:** `laterne(s, x, z, seite, true)` leuchtet mit Lichtschein, Lichtkegel und PointLight; `altbau(…, { licht: true })` mit beleuchteten Fenstern; Regen als Streifen mit `regen(s, x0, x1, z0, z1, h, n)` und `update(t)`.
- Alle runden Teile mit ≥ 16–24 Segmenten, sonst entstehen gezackte Gelenknähte.
- Detail-Regel: Jede Einstellung braucht Vorder-, Mittel- und Hintergrund mit echten Objekten (Fahrzeuge, Pflanzen, Straßenmöbel, Menschen), keine leeren Flächen.

## Realismus-Stufe 2 (Feedback nach den Figuren-Tests): HDR, Fassaden, Effekte, Tiere

Gilt ab dem nächsten Video. Reihenfolge der Bausteine im `<script>`: Basis-Helfer → fx-helpers → `figuren.js` → `bausteine.js` → `render.js` → `fassaden.js` → `effekte.js` → `tiere.js`. Vorlage für den Zusammenbau: `scripts/builder/mkreal.py` (baut die Testszene in `projekte/_figurentest`).

- **HDR-Render** (`render.js`): `const POST = nachbearbeitung(renderer, { bloom: 0.6 })`. In `renderAt()` steht dann `POST.render(w.scene, w.camera)` statt `renderer.render(...)`. Das Ziel ist HalfFloat mit 4× MSAA und 24-bit-Tiefe. Danach folgen Bloom in 3 Stufen, ACES (wie Three, Belichtung 0.62), Sättigung, Kontrast, kühle Schatten und Vignette. Glühende Dinge (Lampen, Feuer, Scheinwerfer, Blinklicht) bekommen Farbwerte > 1 und `toneMapped: false`, dann blühen sie.
- **Himmel** statt `skyTex`: `himmelShader(s, { zeit: "tag"|"abend"|"nacht"|"dunst", wolken: 0..1, sonne: [x,y,z], stadtLicht })`.
  - Das ist eine Kuppel mit Verlauf, Sonne bzw. Mond, ziehenden fbm-Wolken, funkelnden farbigen Sternen und Milchstraße.
  - In `update` muss `him.update(T)` laufen. Die Sonnenrichtung = Richtung des DirectionalLight.
- **Spiegelungen:** `umgebung(s, him)` legt den Himmel als PMREM-Umgebung in `scene.environment`. Glas, Autolack und nasse Straße spiegeln dann. Ohne diesen Aufruf ist Glas schwarz.
- **Hochhäuser** (`fassaden.js`): `hochhaus(seed, { typ: "glas"|"beton"|"ziegel"|"platte"|"modern", w, d, etagen, nacht, licht: Anteil heller Fenster, aufl })`.
  - Jede Seite hat eigene Canvas-Karten: Farbe, Leuchten, Rauheit/Metall.
  - Fenster mit Rahmen, Sprossen, Himmelsspiegelung, Vorhängen und Jalousien. Nachts beleuchtete Zimmer in verschiedenen Lichtfarben mit Deckenlampe, Möbel-Silhouetten und TV-Blau.
  - Echte Geometrie: Geschossbänder, Lisenen, Balkone/Loggien (Instanzen), Lobby mit Vordach, Attika, Dachtechnik, Wassertank, Antenne mit Blinklicht (`h.userData.update(T)`).
  - Hintergrund: `skyline(s, n, seed, { nacht, aufl: 0.35, a0, a1, r0, r1 })`.
  - Speicher: Straßenhäuser `aufl` 1, Hintergrund 0.3–0.4.
- **Autos** (`effekte.js`): `autoPlus(auto(...), { licht, bremse, fern, spot, seed })` ergänzt:
  - Klarlack (MeshPhysical) und spiegelnde Scheiben
  - Scheinwerfer mit Glühen, weichem Lichtkegel und SpotLight auf der Straße
  - leuchtende Rücklichter, deutsche Kennzeichen (fiktiv)
  - Speichenfelgen mit Bremsscheibe, Scheibenwischer, Antenne
- **Licht-Effekte:** `lichtKegel(länge, radius, farbe, stärke)` für alle Lichtstrahlen, `glanzPunkt(farbe, größe)` für Lichtquellen.
- **Feuer:** `feuer(s, x, y, z, { breite, hoehe, kraft, licht, glut, rauch, seed })` mit `update(T, kamera)`.
  - Rausch-Shader-Flammen drehen sich zur Kamera. Dazu Glut, Rauch und flackerndes Licht.
  - Bei brennenden Autos `y` auf Dachhöhe legen, sonst verdeckt die Karosserie die Flammen.
- **Regen komplett:**
  - `regen(...)` + `regenSpritzer(s, x0, x1, z0, z1, n)` (Einschlag-Ringe)
  - `nass(material, 0.85)` für Asphalt und Gehweg, dazu `pfuetze()`
  - Regenschirme an Figuren. Nachts spiegeln sich Laternen und Scheinwerfer auf der Straße.
- **Tiere** (`tiere.js`): passend zum Thema einsetzen, z. B. Hund an der Leine in der Stadt, Tauben auf Plätzen, Katze am Fenster, Vögel im Park.
  - Hunde: `hund(seed, { rasse: "labrador"|"schaeferhund"|"dackel"|"mops"|"husky"|"pudel"|"beagle", hecheln })`.
  - Katzen: `katze(seed, { fell: "rot"|"grau"|"schwarz"|"getigert"|"weiss" })`.
  - Tauben: `taube(seed)`.
  - Bewegung: `tierLaufen(t, T, tempo)`, `tierIdle(t, T)` (Kopf, Schwanzwedeln, Atmen), `tierSitzen(t)`, `taubePicken(t, T)`, `taubeFliegen(t, T)`.
- **Figuren v4:**
  - Gelenke ohne Stufen (Hüftkugel = Oberschenkelradius, Schritt-Füllung).
  - Hosen mit Stofftextur (Jeans/Stoff), Steppnähten, Kniefalten, Saum, Gesäßtaschen und Hosenschlitz, Gürtel zum Hemd.
  - Schuhe mit Sohle in Fußform, Zehenkappe, Schnürung, Zunge und Fersenkappe. Sneaker mit Seitenstreifen, Halbschuh/Stiefel mit Absatz.
  - Oberteile mit Stricktextur.
- **Thema zuerst:** Tageszeit, Wetter, Gebäudetyp (Platte im Osten, Glas im Bankenviertel, Ziegel im Altbauviertel), Tiere und Effekte immer aus der Geschichte ableiten, nicht wahllos alles einbauen.

## Realismus-Stufe 3: Menschen, Fahrzeuge, Stadt, Natur, Flugzeuge, Tiere

**Zusammenbau:** `python3 <skill>/scripts/builder/bauen.py <szenen.js>` im Projektordner. Das Skript baut `compositions/welt.html` aus allen Vorlagen. Die Szenen-Datei definiert `SHOTS`, `DUR` und `W.<id>`. Gerendert wird mit `POST.render`. Beispiel mit allen Bausteinen: `scripts/builder/szenen-test.js`.

### Menschen (`figuren.js` v5)

- **Herkunft:** `herkunft: "europaeisch"|"afrikanisch"|"asiatisch"|"arabisch"|"suedasiatisch"|"lateinamerikanisch"`. Ohne Angabe wird gemischt (Deutschland-typisch).
  - Pro Herkunft passen Hauttöne, Haar- und Augenfarben, Nasenform (Breite/Rücken/Länge), Lippenvolumen, Lidform, Wangenknochen und typische Frisuren.
  - Darstellung immer respektvoll und ohne Karikatur.
- **Individuelle Gesichter:**
  - Kopfform (`kopfform`: oval/rund/eckig/herz/lang).
  - Augenabstand und -größe, Mundbreite, Ohrgröße und -abstand, Kinn.
  - Augen mit Iris-Rand, Pupille, Glanz, Lidkante und Wimpern. Nase mit Flügeln und Löchern, Ober- und Unterlippe.
  - Männer mit Kieferwinkeln und Adamsapfel. Frauen mit weicheren Zügen, breiterem Becken und schmalerer Taille.
- **Haut:** eigene Gesichtskarte mit Poren, Wangenröte und Augenschatten.
  - Optional: `sommersprossen`, `unrein`, Bartschatten, Falten (`alter: "alt"`).
  - `behaart` 0..1: Armbehaarung bei Männern.
- **Frisuren:**
  - Männer: kurz, buzz, seitenscheitel, pony, mittel, manbun, undercut, glatze, halbglatze, locken, afro, dreads.
  - Frauen: lang, wellig, bob, pixie, pferdeschwanz, dutt, zoepfe, locken, afro, pony.
  - Ältere Menschen bekommen graues Haar und häufiger eine Brille.
- **Kleidung zum Thema:**
  - `stil: "alltag"|"business"` (Anzug, Krawatte, Halbschuhe) `|"sport"|"traditionell"`.
  - Traditionell: Thobe und Ghutra mit Agal, Abaya, Hidschab, Dashiki, Kufi, Gele, Kurta. Nur einsetzen, wenn es zum Thema passt.
  - Muster: streifen, karo, punkte, dashiki. Stoff-, Strick- und Jeansstruktur.
- **Schmuck nur vereinzelt** (automatisch selten): `uhr` (Armbanduhr links), `ringe`, `schmuck` (Kette, Ohrringe, Armreif).
- **Gangart:** jede Person hat eine eigene `userData.gang`.
  - Unterschiede in Schrittweite, Tempo, Wippen, Armschwung und Hüftschwung (Frauen mehr), Vorneigung bei Älteren, selten leichtes Hinken.
  - `walk()` addiert das Wippen auf die Grundhöhe. Personen auf dem Gehweg (y = 0.14) sinken also nicht mehr ein.

### Fahrzeuge (`fahrzeuge.js`)

- **Bauformen:** `fahrzeug(seed, typ, { farbe, felge, felgenFarbe })` mit `typ`:
  - Limousinen: stufenheck, fliessheck, steilheck.
  - Weitere: coupe, kombi, shooting, suv, gelaende, targa, minivan, stretch.
- **Details:**
  - Klarlack, Türfugen nach Türzahl, Griffe, Spiegel, Zierleisten.
  - Kühlergrill (Waben/Quer/Niere), LED-Tagfahrlicht, Nebelleuchten, Diffusor, Auspuff (einfach/doppelt), Haifischflossen-Antenne.
  - Dachreling, Kunststoffbeplankung (SUV/Gelände), Ersatzrad, Innenraum mit Sitzreihen, Display und Lenkrad.
- **Räder:** Reifen mit Profil und gewölbter Flanke. Felgen: speichen5, vielspeichen, doppelspeichen, stahl, turbine, offroad. Dazu Bremsscheibe, farbiger Sattel und Radmuttern.
- **Bewegung:**
  - `fahren(car, T, strecke, { kurve, bremsen, gas })`: Räder drehen sich passend zur Strecke, die Karosserie federt, nickt und wankt leicht.
  - `abgas(car, seed, { staerke })` erzeugt Abgaswölkchen; im Winter oder am Morgen stärker.
- Scheinwerfer und Lichtkegel weiter mit `autoPlus(fahrzeug(...), { licht })`.

### Stadt (`stadt2.js`)

- **Ampeln:** `ampel(s, x, z, ry, { phase })` mit `update(T)` für Rot, Rot-Gelb, Grün und Gelb, dazu Fußgängerampel und Taster.
- **Verkehrsschilder:** `verkehrsschild(s, x, z, typ, ry, { schief })` mit stop, vorfahrt, vorfahrtAchten, einbahn, parkverbot, halteverbot, tempo30, tempo50, fussgaenger, baustelle.
- **Müll und Schmutz:**
  - `muelltonne(s, x, z, { fuell: 0..1, typ: "korb"|"tonne" })`: volle Tonnen quellen über, Müll liegt daneben.
  - `muell(s, x, z, radius, n)`: Papier, Dosen, Flaschen, Kippen, Laub, Kaugummi- und Ölflecken.
- **„Nicht alles gerade“:** `strassenSchaeden(s, länge)` (Flickstellen, Schlaglöcher, Risse) und `schief(objekt, seed)` für Laternen, Schilder und Pfosten.
- **Möbel mit Details:** `zimmer(s, seed, { art: "wohnzimmer"|"schlafzimmer"|"kueche", licht, tv })`. Einzeln verfügbar:
  - Sitz- und Liegemöbel: `sofa` (Kissen, Armlehnen, Füße), `stuhl`, `bett` (Decke mit Falten, Kissen).
  - Tische und Stauraum: `tisch` (Holzmaserung, Vase, Tasse, Buch), `regal` (Bücher, Pflanzen), `schrank`.
  - Ausstattung: `stehlampe`, `fernseher`, `teppich`, `zimmerpflanze`, `bild`.

### Natur (`natur2.js`)

- **Berge:** `berge(s, { breite, tiefe, hoehe, schneegrenze, baumgrenze, baeume })` mit Graten, Farben nach Höhe und Steilheit (Wiese, Wald, Fels, Schnee) und Nadelwald unterhalb der Baumgrenze. Rückgabe `{ hoehe(x, z) }`.
- **Bergketten:** `bergkette(s, { lagen, abstand })` für ferne Silhouetten mit Luftperspektive. Mit `camFar()` arbeiten.
- **Nebel:**
  - `nebel(s, farbe, dichte)` (Dunst)
  - `bodenNebel(s, {...})` (ziehende Nebelbänke, `update(T)`)
  - `nebelSchwaden(s, {...})` (treibende Schwaden in Straßen, Wäldern und über Wasser)

### Flugzeuge (`flugzeuge.js`)

- `flugzeug(typ, { farbe, fahrwerk, kondens, nachbrenner })`, echte Maße in Metern, Nase nach +z:
  - Zivil: a320, a350, b747f, bizjet, atr72, cessna, segler, ul.
  - Militär: eurofighter, f35, b2, a400m, awacs.
  - Forschung: x15.
- Ausstattung: Turbofans mit Fanschaufeln, Turboprops mit Propellern, Positionslichter (rot links, grün rechts), Blitzlicht, Lackierung mit Fensterreihen, Kondensstreifen, Nachbrenner und Raketenflamme.
- `flugzeugUpdate(f, T)` in jedem Frame aufrufen. Große Szenen mit `camFar(4000)`.
- Keine echten Airline-Logos; die Lackierungen sind ausgedacht.

### Tiere (`tiere2.js`, zusätzlich zu Hund/Katze/Taube)

- **Säugetiere:** `saeugetier(seed, "pferd"|"kuh"|"reh"|"baer"|"fuchs"|"elefant"|"wal")`.
- **Vögel:** `vogel(seed, "spatz"|"adler"|"moewe"|"pinguin"|"rabe"|"ente", { bewegung: "picken"|"fliegen"|"gleiten"|"watscheln" })`.
- **Reptilien und Amphibien:** `reptil(seed, "eidechse"|"krokodil"|"schlange"|"schildkroete")`, `amphibie(seed, "frosch"|"molch")`.
- **Fische und Quallen:** `fisch(seed, "hai"|"forelle"|"thunfisch"|"goldfisch")`, `qualle(seed)`.
- **Wirbellose:** `insekt(seed, "kaefer"|"ameise"|"biene"|"libelle")`, `spinnentier(seed, "spinne"|"skorpion")`, `weichtier(seed, "schnecke"|"tintenfisch")`.
- **Animation:** jedes Tier hat `userData.anim(T)`. Unterwasserszenen: blauer `FogExp2`, Sandboden, Seegras und Steine (siehe Szene `wasser`).

### Angenehm zum Anschauen

- Weiche, ruhige Kamerafahrten.
- Nebel und Dunst für Tiefe, nie zu dicht (Stadt `FogExp2` ≈ 0.008).
- Warme Abendlichter.
- Keine Kamera, durch die Autos oder Figuren hindurchfahren: Fahrwege und Kamera vorher prüfen.

## Realismus-Stufe 4: Gebäude, Materialien, Himmel, Kamera, Gesichter, Pflanzen, Leben, Innenräume, Schrift

**Zusammenbau neu:** `python3 <skill>/scripts/builder/bauen.py <szenen.js>` im Projektordner.
- Die Reihenfolge der Bibliotheken übernimmt das Skript.
- Die Szenen-Datei definiert `SHOTS`, `DUR` und `W.<id> = { scene, camera, post: P({...}), update(t, T) }`. `t` ist die Shot-Zeit, `T` die Gesamtzeit.
- `post` setzt Nachbearbeitung pro Shot: `uStrahlen`, `uFlare`, `uAnamorph`, `uDof` + `uUnscharfAn` + `uFokus`/`uBlende`, `uTilt`.
- Vorlage mit allen Bausteinen: `scripts/builder/szenen-test.js`.

### Gebäude (`gebaeude.js`), passend zu Stadt oder Land

- **Stadt:**
  - `mehrfamilienhaus(seed, { fassade: "putz"|"klinker"|"vhf", etagen, balkone, licht, dach })`: Blockrand, Haustür mit Klingeln, Treppenhausfenster, Balkone (Glas, Stahl oder Beton), Gauben oder Dachfenster.
  - `reihenhaeuser(seed, { anzahl })` mit Vorgärten.
  - `loft()`: Industrie-Ziegelbau mit Stahlsprossenfenstern, Sheddach und Schornstein.
- **Land:**
  - `einfamilienhaus2(seed, { stil: "klassisch"|"modern"|"fachwerk" })`. Modern heißt Flachdach, Holz- oder VHF-Fassade und Hebeschiebetür.
  - `bungalow()` mit Walmdach und Terrasse.
  - `bauernhof()`: Fachwerk-Wohnhaus mit Fensterläden, Scheune mit Tor, Stall, Silo, Strohballen, Misthaufen und Zaun. `userData.rauchPos` gibt die Position für den Schornsteinrauch.
- **Hochhäuser:** `mixedTower()` (Ladensockel, Büroglas, Wohnteil) zusätzlich zu `hochhaus()`.
- **Fenster:** `fenster2(parent, x, y, z, w, h, { art, rahmen, kipp, licht, vorhang, rollladen })`.
  - `art`: "drehkipp" (zweiflügelig ab 1,3 m; `kipp: 1` = gekippt), "schiebe", "fest", "sprossen", "stahl".
  - `rahmen`: "kunststoff", "alu", "holz", "dunkel".
  - Dazu `gaube()`, `dachfenster()`, `fachwerk()` und `satteldach()` mit Giebeln und Dachrinne.
- **Fassaden** über `fassadeM(art)`: putz (WDVS), klinker, ziegel, holz, vhf (Faserzement), beton.

### Materialien (`materialien.js`)

- `material(name, { wiederholen: [x, y], farbe, nass })`: 101 prozedurale Oberflächen mit Relief, Rauheit und Metall, teils mit Klarlack oder Samtglanz.
- **Kleidung:** denim, wolle, baumwolle, seide, leder, wildleder, cord, leinen, nylon, fleece, samt, rippstrick, canvas, neopren, goretex, flanell, tweed, netzstoff, spitze, kunstfell, kunstleder, chiffon, mikrofaser, steppstoff, gummistoff, carbon.
- **Bau:** sichtbeton, waschbeton, ziegel, klinker, putzweiss, stuck, marmor, granit, schiefer, terrakotta, glasfassade, milchglas, getoentglas, wellblech, lochblech, edelstahl, chrom, alu, kupferpatina, zink, corten, keramikfliese, faserzement, dachschindel, sperrholz.
- **Boden:** asphalt, asphaltnass, kopfstein, betonplatten, verbundpflaster, blindenleitsystem, kiesbett, schotter, gullydeckel, abflussgitter, fallschutzmatte, bordstein, fahrbahnmarkierung, feldweg, schlamm, pfuetze, terrazzo, bodenfliese, holzdeck, sandstein, dehnungsfuge, rostblech, riffelblech, moosstein, gestreut.
- **Natur:** kiefernrinde, eichenrinde, birkenrinde, poliertesholz, holzbrett, altholz, rasen, wiese, stroh, flusskiesel, sand, erde, boden, schnee, eis, reif, blatt, hecke, fels, basalt, mulch, moos, lehmrisse, wasser, nassschlamm.

### Himmel und Nachbearbeitung (`render.js`)

- **Wolkenarten:** `himmelShader(s, { wolkenTyp: "cumulus"|"cirrus"|"stratus"|"altocumulus"|"gewitter", halo, zeit: ...|"gewitter" })`.
- **Nachbearbeitung:** `nachbearbeitung(renderer, { tiefe: { fokus, blende }, tiltshift, strahlen, flare, anamorph })`.
  - Lichtstrahlen zur Sonne (Gebäude und Wolken brechen sie).
  - Linsenreflexe.
  - Anamorphe Streifen für die Nacht.
  - Tiefenschärfe mit echter Tiefe; der Tiefenpass läuft nur, wenn `uDof` an ist.
  - Tilt-Shift.

### Kamera (`kamera.js`)

- `kamera(c, t, { art, dauer, weich, hand, fov, fovZu })` mit den Arten dollyIn, dollyOut, fahrt (Spline, `blick: "voraus"`), orbit, kran, schwenk, seitlich, vogel.
- `hand` 0..1 gibt organisches Handkamera-Wackeln. Brennweite über `fov`: 24 mm ≈ 62°, 35 mm ≈ 46°, 85 mm ≈ 20°.

### Gesichter (Figuren v5.1)

- **Haut:** wärmeres Material mit Subsurface-Schimmer und Pfirsichflaum-Glanz.
- **Männer:** größere Poren, mehr Hautglanz, Brauenwulst-Schatten, breiterer Kiefer, tiefere Falten.
- **Frauen:** feinere Poren, betonte Wangenknochen, weichere Stirn, schmaleres Kinn, feinere Falten.
- **Augen:** etwas größer (`augenGross`, Standard 1.1), gemalte Iris mit Fasern und Limbusring, glänzende Hornhaut mit Umgebungsspiegelung, zwei Lichtreflexe.
- **Lippen:** mit Glanz.

### Pflanzen (`natur3.js`)

- `baum(s, x, z, art, { hoehe, seed, y })` mit eiche, birke, kiefer, zypresse, kirsche, weide, olive, linde. Gebogener Stamm mit Rinde, Äste, weiche Kronen und Tausende Blattkarten (Instanzen).
- Weitere Pflanzen: `hecke()`, `bewuchs(s, x0, z0, w, d, n, "wildblumen"|"weizen"|"lavendel"|"farn"|"schilf", { hfn })`, `efeu(wand...)`, `zimmerpflanze2("monstera"|"ficus")`.
- **Wind:** `wind(T)` jedes Frame (macht `bauen.py` automatisch). `WIND.staerke.value` 0..4 pro Shot, zum Beispiel 3.5 bei Gewitter.
- Im Winter keine Laubbäume mit Blättern, nur Nadelbäume.

### Leben und Wetter (`leben.js`)

- **Wolkenschatten:** `wolkenSchatten(s, { licht: sonne })` als unsichtbare Schattenwerfer. Keine Multiply-Ebene, die hat alles schwarz gemacht.
- **Wetter:** `schnee()`, `niesel()`, `fensterTropfen(kamera|fenster, w, h)` (Tropfen laufen über die Scheibe).
- **Rauch, Dampf, Atem:** `dampf()` (Gully), `atem(person)` (kalte Luft), `schornsteinRauch()`.
- **Wind:** `laubWind()`, `papierTuete()`, `pusteblumen()`.
- **Licht und Wasser:** `staubLicht()` (Staub in Lichtstrahlen), `reifenSpritzer(auto)`.
- **Tiere:** `taubenFlucht(tauben, tStart)` (Tauben fliegen auf, wenn ein Auto kommt), `vogelFormation()`, `kopfHeben(tier, T, tStart)` (Hund lauscht).
- **Fensterlicht:** `lichtFlackern(material, T, basis, "warm"|"tv")`.

### Auto-Innenraum (`fahrzeug()`)

- Optionen: `innen` ("leder", "stoff" oder "alcantara") mit Ziernähten, `innenFarbe`, `ambiente` (LED-Farbe), `holz`, `panorama`, `carbon`, `unterboden` (Leuchtfarbe) und `lackArt` ("metallic" mit Flakes, "matt", "uni").
- Ausstattung: OLED-Displays, Mittelkonsole in Edelstahl, Lüftungsdüsen, Fußmatten, Lederlenkrad.
- Glas wirft keinen Schatten mehr, sonst ist der Innenraum schwarz.
- Für Innenaufnahmen ein zusätzliches warmes PointLight in die Kabine setzen.

### Moderne Innenräume (`innen2.js`)

- Ganze Wohnung: `wohnung(s, seed, { art: "wohnen"|"essen"|"buero"|"schlafen", boden: "terrazzo"|"holzbrett"|"sichtbeton", licht })`. Dazu gehören eine bodentiefe Fensterfront mit Leinenvorhängen und Sonnenbahnen.
- Einzelmöbel:
  - Sitzen und Liegen: `modulSofa`, `sessel` (Bouclé), `designStuhl`, `bettRahmen`.
  - Tische: `marmorTisch`, `esstisch`, `kragtisch`.
  - Regale und Deko: `schwebeRegal`, `vase`, `kunstBild`.
  - Licht: `pendelleuchte`, `einbauSpot`, `ledLeiste`.
  - Wand: `akustikPaneele`, `wandSpiegel`.

### 3D-Schrift (`typo.js`)

- `text3d(s, "TEXT", { x, y, z, ry, hoehe, farbe, tiefe, neon, metall })` steht im Raum, wirft echte Schatten und kann als Neon leuchten.
- `update(T, { start, dauer, flackern })` blendet sanft ein und skaliert dabei leicht hoch.

## Realismus-Stufe 5: Effekt-Kit und Nachbearbeitung v3 (Szene „ZUSAMMEN“)

Beispielszene: `scripts/builder/szenen-zusammen.js` mit zwei Shots: Fahrt die Straße hinunter, dann eine flache Seitwärtsfahrt mit Rack-Fokus.

### Nachbearbeitung v3 (`render.js`, `nachbearbeitung`)

Jeder Shot setzt `post: { uName: wert }` und `look`. Vorher wird alles auf `POST_STANDARD` zurückgesetzt.

- **Kantenglättung:** `uSSAA` 1–8 (Jitter-Akkumulation, wirkt wie TAA ohne Schlieren). Jede Stufe kostet einen vollen Szenen-Render. In Videos immer 1, denn das MSAA ×4 reicht. 4 nur für Standbilder oder Thumbnails.
- **Tiefe und Licht:**
  - `uDof`, `uFokus`, `uBlende` (größer = mehr Schärfentiefe; 1.8–2.5 für Portrait), `uBokeh`
  - `uTilt`
  - `uAO` (SSAO)
  - `uNebel`, `uNebelHoehe`, `uNebelFarbe` (mit Sonnenstreuung)
  - `uBewegung` (Kamera-Bewegungsunschärfe)
  - `uStrahlen` (God Rays; sampeln nur den Himmel)
  - `uFlare`, `uAnamorph`
- **Bildgeometrie:**
  - `uVerzerrung`, `uChroma`, `uGlitch`
  - `uHitze` (Band)
  - `hitzePunkte(POST, cam, [{ pos, radius, staerke }])` für Hitzeflimmern über dem Auspuff oder über Feuer
- **Ton und Farbe:**
  - ACES und `uRolloff`, `uLift`/`uGamma`/`uGain`, Split-Toning, Cross-Process, Mono, Black Crush
  - Looks: neutral, tealOrange, noir, golden, cyberpunk, moody, pastell, kreuz
- **Stil:** `uKontur`, Toon, Halftone, Scanlines, VHS, Light Leaks, Kratzer. `uKorn` bleibt **0** (der User mag kein Rauschen).
- **Klarheit:** `uSchaerfe`, `uKlarheit`, `uBloom`, `uHalation`
- **Debug:** `uTon` (Clay-Render), `uDraht` (Drahtgitter darüber)
- **Rack-Fokus:** `fokusZug(POST, t, { von, nach, start, dauer })`
- **Tiefenpass:** Sprites, Punkte, Linien, transparente Objekte ohne depthWrite und `userData.keineTiefe` sind ausgeschlossen, sonst entstehen harte DOF-Kanten und Rechtecke. Alpha-getestete Flächen (Schrift) bekommen `userData.tiefeMat` (MeshDepthMaterial mit map und alphaTest). So haben sie echte Tiefe und werden nicht wie der Hintergrund vernebelt oder unscharf.

### Neue Bausteine

- `spiegelflaeche(s, w, d, { maske: pfuetzen|feucht|voll, staerke, rau, wiederholen, wasser })` (`effekte2.js`): echte planare Spiegelung für nasse Straßen, Pfützen und Wasser.
- `effekte2.js` enthält außerdem: `kaustik`, `fahne`, `aufloesen`, `morphMesh`, `fallendeKoerper`, `wirbel`, `zeitRampe`, `dreiPunktLicht`, `randLicht`.
- `kopfsteinStrasse(s, laenge, { breite, gehweg, uneben, flicken })` (`stadt2.js`): unebenes Pflaster mit Asphaltflicken, Bordstein und Gehweg.
- `fachwerkStadthaus(seed, { etagen })`: auskragendes Fachwerk; der Schornstein in `userData.schornstein` passt zu `schornsteinRauch`.
- `brutalismus(seed, { etagen, breite })`: Betonraster mit Lisenen.
- Fahrzeugtyp `oldtimer` (Chrom, runde Lampen, Weißwandreifen). `abgas(car, …)` und `hitzePunkte` zusammen ergeben einen Oldtimer im Leerlauf.

### Gelernt

- Bodennebel-Ebenen auf Augenhöhe erzeugen Streifen und Rechtecke. Stattdessen Tiefennebel (`uNebel`) plus `nebelSchwaden` sparsam einsetzen (dichte ≈ 0.07).
- God Rays verwischen helle Objekte radial und erzeugen dann Geisterbuchstaben. Deshalb sampeln sie nur noch den Himmel.
- Bei Gegenlicht nichts Großes in den Fluchtpunkt stellen, sonst verschwindet die Sonne. Die Strahlen in der Totalen nicht über 0.3 setzen, sonst wirkt das Bild milchig.
- Schrift in Portrait: Breite ≈ 5 × Höhe. Bei FOV 50 braucht man den Abstand ≥ 2 × Textbreite.

## Renderzeit und Tempo-Profil (Pflicht für 70-s-Videos)

Die Cloud rendert mit SwiftShader (CPU-WebGL, 4 Kerne, die bereits alle ausgelastet sind). Mehr Worker bringen deshalb nichts. Gemessen an der dichten Szene „ZUSAMMEN“ (8000 Meshes):

- Vorher: 24 s pro Bild mit SSAA 4, 9 s mit SSAA 1.
- Kostentreiber:
  - Pixelschattierung der PBR-Materialien: Mit MeshBasic dauert ein Bild 0,6 s, mit PBR 8 s. Overdraw und MSAA sind nicht die Ursache.
  - God Rays in voller Auflösung: 1,2 s.
  - Schattenkarte 4096²: mehrere Sekunden.
  - Anisotropie 8: +18 %.
  - Draw Calls spielen dagegen kaum eine Rolle.

Das Tempo-Profil ist im Builder automatisch aktiv:

- `tempoOptimieren(W, SHOTS, window.TEMPO || {})` läuft vor dem ersten Bild:
  - Verschmilzt statische Meshes pro Material und 24-m-Zelle (8006 → 3838).
  - Gibt die PMREM-Umgebung nur glänzenden Materialien und hebt dafür das Himmelslicht um ×1.6 an.
  - Begrenzt Schatten auf 2048 und Anisotropie auf 2.
  - Abschalten oder anpassen über `window.TEMPO = { envNurGlanz: false, schattenMax: 4096, ... }` in der Szenen-Datei.
  - Objekte, die sich nur selten bewegen (an den Probezeiten unverändert), bekommen `userData.dynamisch = true`, sonst werden sie eingefroren.
- `bauen.py <szenen.js> [skala]`: Die interne Renderauflösung ist standardmäßig 0.8. Sie sieht im Vergleich aus wie 1.0 und spart etwa 20 %.
- God Rays laufen in einem eigenen Pass mit 1/4 Auflösung.
- In Videos `uSSAA: 1`. `uAO` nur, wenn es wirklich sichtbar hilft.
- Szenen schlank bauen:
  - Detailreiche Gebäude nur nahe der Kamera, weiter hinten einfache Blöcke.
  - Spiegelflächen und Rauch nur dort, wo sie im Bild sind.
  - Lieber Shots mit Himmel oder Weite als volle Häuserschluchten.
- Vor dem Render messen: Ein Benchmark mit 2–3 Bildern zeigt die Zeit pro Bild. Mit 2100 multiplizieren und dem User ansagen.
- **Lange Renders (über 2 Stunden):** Hintergrundbefehle werden nach 2 Stunden beendet. Ein Prozess, der mit `setsid`/`nohup` gestartet wird, überlebt das Ende des Aufrufs nicht (Meldung `render_cancelled_parent_exited`).
  - Deshalb segmentiert rendern: `HF_SEGMENTED_CAPTURE=true npx hyperframes render … --resume`.
  - Nach einem Abbruch denselben Befehl erneut starten. Fertige Segmente werden wiederverwendet.
- Render-Aufruf für schwere Szenen: `npx hyperframes render -o renders/x.mp4 -q delivery -w 1 --low-memory-mode --player-ready-timeout 600000 --protocol-timeout 900000 --browser-timeout 600`. Sonst bricht der Render beim Laden nach 45 s ab.

## Gelernt in Projekt Hudson (Luftfahrt, Stadt im echten Maßstab)

Die Szenen-Datei `scripts/builder/szenen-hudson.js` ist eine Vorlage für Flugzeug-, Stadt- und Wasser-Szenen. Sie enthält: Flughafen, New York in Metern mit instanzierter Stadt, Hudson mit Spiegelung, Hängebrücke, Kabine mit echten Fensterausschnitten, Cockpit, Fähren und Rettungsinseln.

**Arbeitsweise**
- **Szenencode in eine IIFE kapseln:** `const SHOTS`/`DUR` gehören oben hin, alles andere in `(function () { … })();`. Sonst kollidieren eigene Namen mit Bibliotheksfunktionen wie `feuer`, `v3` oder `wackeln`.
- **Schnell prüfen:** `python3 scripts/builder/probebau.py` im Projektordner, dann `node scripts/builder/probe.cjs . '[{"id":"shot","T":12.5,"out":"/pfad/a.jpg","pos":[..],"ziel":[..],"js":"…"}]'`.
  - Das Werkzeug lädt die Szene einmal und rendert beliebige Zeitpunkte, Kameras oder Debug-Code.
  - Ein Durchgang dauert etwa 1–2 Minuten statt 4 Minuten pro Snapshot.
  - Danach `probe.html` löschen, sonst meldet `check` „multiple root compositions“.
- **Hold-Shots** (`{ id, t0, t1, hold: true }`) rendert `bauen.py` nur einmal. Unter Karte und Erklärpanel sparen sie Hunderte Bilder.
- **Zeit pro Bild vor dem Render messen** (Probe-Werkzeug, `renderAt` mit `performance.now`). Zur gemessenen Zeit kommen beim echten Render etwa +0,7 s pro Bild für die Bildaufnahme hinzu.

**Stadt im echten Maßstab**
- **Instanzierte Stadt** (`InstancedMesh` aus Einheitswürfeln mit `windowsTex`-Materialien): Tausende Gebäude kosten so kaum Draw Calls.
  - Unbedingt `frustumCulled = false` setzen, sonst verschwindet die Stadt. Gecullt wird sonst mit der Box eines einzelnen Würfels am Ursprung.
  - Schrittweiten `dx`/`dz` immer setzen. Ein fehlendes `dz` ergab NaN, und es entstanden nur 10 Gebäude.
- **Nebel bei Kilometer-Entfernungen:** `uNebel` der Nachbearbeitung wirkt pro Meter und macht bei 10 km alles weiß. Für Luftbilder `uNebel` auf 0 lassen und nur `scene.fog` weit setzen (7–42 km). Dazu `camFar(45000)`.
- **Tiefenpräzision:** Wasser und Land dürfen sich nicht überlappen. Der Boden unter allem liegt bei y = −30, und `near` ist bei Außenaufnahmen ≥ 1,5.
- **Spiegelwasser** (`spiegelflaeche` mit `wasser`) rendert die Szene ein zweites Mal. In Innenaufnahmen (Kabine, Cockpit) stattdessen eine einfache glänzende Fläche zeigen (`spiegelAn(false)`).

**Flugzeug**
- **Rechte Tragfläche des Flugzeugmodells:** Sie ist gespiegelt und rendert auf der Unterseite schwarz. Fensterblicke deshalb über die linke Tragfläche planen, also die Rollrichtung entsprechend drehen.
- **Kabine:** Seitenwände als `ShapeGeometry` mit echten ovalen Löchern (`form.holes`), dazu Fensterrahmen-Ringe. Die Texturlösung mit Alpha auf einem Zylinder hat nicht funktioniert.
- **Fans:** Die Drehung der Triebwerksschaufeln über `f.userData.fanWinkel` langsam halten, sonst flackert es wie ein Stroboskop.
- **Feuer und Rauch:** Additives Orange verschwindet vor hellem Himmel. Flammen deckend (normal blending) direkt am Auslass setzen, Rauch dunkel mit Größe ≥ 8.

**Figuren und Kamera**
- **Sitzende Figuren:** Mit `sitzend()` (Pivot an der Hüfte, Beine kompensiert) funktioniert die Brace-Haltung.
  - Arme nach vorn auf die Lehne legen, nicht nach oben, das wirkt wie „Hände hoch“.
  - Die Vorbeugung von vorn gefilmt sieht aus wie aufrecht und kopflos. Im Profil filmen.
- **Kamera nie in eine Figur oder direkt vor eine Lehne setzen:** Den eigenen Sitz und den Nachbarplatz frei lassen.

**Ton und Titel**
- **Luftfahrt-Ton:** `klang.py sfx4` erzeugt triebwerk, abheben, vogelschlag, auslaufen, fahrtwind, warnton, gaense, aufprall, wasser, kabine und faehrhorn.
- **Titel kurz halten:** „Noch 3:30 Min.“ bricht bei 132 px um, „Noch 3:30“ passt.

## Fallen

- **Nicht-numerische Post-Uniforms** (Arrays/Vektoren wie `uHitzePunkte`) setzt `POST_STANDARD` nicht zurück. Ohne Reset verzerrt das Hitzeflimmern aus einem Shot alle folgenden Shots, sodass Seile und Kanten wellig und schwammig wirken. `bauen.py` setzt `uHitzePunkte` deshalb jedes Bild auf 0.
- **Schärfe wie bei ZUSAMMEN:**
  - Skala 1 bei Szenen mit feinen Linien.
  - Keine Bewegungsunschärfe in Luft- und Wassershots.
  - Spiegelauflösung (`aufl`) ≥ 0.5, Wasserwellen ≤ 0.4.
  - Tiefenschärfe nur dort, wo sie gewollt ist, und nie so stark, dass das Hauptmotiv weich wird.
- **Vor jedem Render dem User Prüfbilder zeigen** (Snapshots aller Shots) und auf sein OK warten.

- `cam()` hat nur 400 m Sichtweite. Für alles, was weiter weg steht (Horizont, Kraftwerk, Bögen), `camFar(3000+)` nehmen und den Nebel weit genug setzen, sonst ist es unsichtbar.
- Portrait-Fenster: Hintergrundobjekte genau durch die Öffnung planen (Winkel = atan(Höhe/Entfernung)).

- **Renderzeit-Budget** (Wunsch des Users: „ne das zu lange, will ja immer 70 sekunden videos“): Ein 70-s-Video (2100 Bilder) muss in etwa 1 Stunde fertig sein, also höchstens ~1,5–2 s pro Bild. Immer 1080×1920 und `-q delivery`, aber mit dem Tempo-Profil (siehe unten). Die Dauer vorher grob ansagen.

- `pkill -f <muster>` trifft die eigene Shell, wenn das Muster im Befehl steht. Prozesse stattdessen per PID beenden.
- Die Piper-Stimme klingt synthetisch (16 kHz). Biete eine eigene Aufnahme oder eine ElevenLabs-Datei an.
- Bei Zeilen mit unbekanntem Phonem gibt es kein Alignment. `voice.py` verteilt die Wörter dann nach Energie und Silbenlänge; Timing im Snapshot prüfen.
- Szenen-Ids müssen eindeutig sein (Präfixe `er-`, `ti-`, `ut-`).
- Der Container ist flüchtig: Videos sofort schicken. Skill und Projekte bleiben nur erhalten, wenn sie in ein Git-Repo gepusht werden.
- PMREM (`umgebung`) sieht nur bis 100 m. Deshalb wird die Himmelskuppel dort verkleinert, sonst bleibt die Umgebung schwarz.
- Render-Ziele ohne Stencil haben nur 16-bit-Tiefe. Dann zeigen Kanten weit weg Treppen. `nachbearbeitung` setzt deshalb `stencilBuffer: true`.
- Bei `sed`/Python-Ersetzungen keine `//`-Kommentare mitten in einzeilige Blöcke setzen, sonst wird der Rest der Zeile auskommentiert.
- Hex-Farben in Materialien ohne Textur werden (Three r149, legacy) linear behandelt, Canvas-Texturen als sRGB. Farben, die zu Hautkarten passen müssen (Lippen, Lidschatten), deshalb mit `new THREE.Color(hex).convertSRGBToLinear()` setzen.
- Fehlersuche bei einem schwarzen Snapshot: Script mit Playwright im Browser laden und `pageerror` ausgeben (Vorlage `dbg.cjs` im Scratchpad-Muster: kleiner HTTP-Server, `three.min.js` und `gsap` laden, dann das Script).
- Multiply-Ebenen (Blending) über dem Boden vermeiden: mit HalfFloat-Ziel und Nebel wird der Boden schwarz. Für Schatten echte Schattenwerfer nehmen.
- `blobGeo()` ist nicht indiziert und wirkt deshalb facettiert. Für weiche Kronen `blob2()` aus `natur3.js` nehmen.
- Kamera nie direkt hinter Sitzlehnen oder in Lichtbahnen setzen. Vorher die Maße prüfen: Sitzhöhe ≈ 0.55 m, Dach ≈ 1.45 m.
- Nach jeder Python-Ersetzung prüfen, dass kein Kommentar in eine Einzeilen-Funktion gerutscht ist (`titel.update` hinter `//` blieb einmal unbemerkt). Syntaxcheck allein findet das nicht.
