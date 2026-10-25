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

## Fallen

- `cam()` hat nur 400 m Sichtweite. Für alles, was weiter weg steht (Horizont, Kraftwerk, Bögen), `camFar(3000+)` nehmen und den Nebel weit genug setzen, sonst ist es unsichtbar.
- Portrait-Fenster: Hintergrundobjekte genau durch die Öffnung planen (Winkel = atan(Höhe/Entfernung)).

- **Qualität vor Tempo** (Wunsch des Users): immer 1080×1920, `-q delivery`, volle Schatten und Kantenglättung. Ein 70-s-Render dauert in der Cloud (CPU-WebGL) etwa 40–60 Min. Das vorher ansagen und nicht herunterregeln.

- `pkill -f <muster>` trifft die eigene Shell, wenn das Muster im Befehl steht. Prozesse stattdessen per PID beenden.
- Die Piper-Stimme klingt synthetisch (16 kHz). Biete eine eigene Aufnahme oder eine ElevenLabs-Datei an.
- Bei Zeilen mit unbekanntem Phonem gibt es kein Alignment. `voice.py` verteilt die Wörter dann nach Energie und Silbenlänge; Timing im Snapshot prüfen.
- Szenen-Ids müssen eindeutig sein (Präfixe `er-`, `ti-`, `ut-`).
- Der Container ist flüchtig: Videos sofort schicken. Skill und Projekte bleiben nur erhalten, wenn sie in ein Git-Repo gepusht werden.
- PMREM (`umgebung`) sieht nur bis 100 m. Deshalb wird die Himmelskuppel dort verkleinert, sonst bleibt die Umgebung schwarz.
- Render-Ziele ohne Stencil haben nur 16-bit-Tiefe. Dann zeigen Kanten weit weg Treppen. `nachbearbeitung` setzt deshalb `stencilBuffer: true`.
- Bei `sed`/Python-Ersetzungen keine `//`-Kommentare mitten in einzeilige Blöcke setzen, sonst wird der Rest der Zeile auskommentiert.
