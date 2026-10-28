# Second by Second (Akte Sekunde) — Style Prompt

Based on Visual Investigation (visual-investigation) from Lemo-Opuscar.
Default size: 1080×1920.

> A cold investigation desk, turned upright for a vertical feed: footage, photographs, documents, sound and maps from one real event, stacked on one shared clock so they check each other. The master clock is the countdown title in the top-left corner (`Noch 4 Min.` → `T+12,4 s` → `Tag 3`); inside the evidence, timestamps, a playhead on a data chart and a stopwatch over the decisive seconds keep it honest. Frozen frames are circled and magnified; quotes are highlighted on the page they come from; a plan shows where cameras stood and where they looked; what is known and what is not are kept apart; at the end every piece of evidence is pulled into one map. German, spoken to "du", cut at feed tempo.
> References (grammar only): newspaper visual-investigation videos, forensic-architecture reconstructions, broadcast verification units. Never copy them, quote their names or use their branding.

## 1. Essence, and what it is not

1. **Sources meet at one moment.** The payoff of every section is two or more independent sources (a frame, a photo, a testimony, a report line, a sound) pointing at the same place or the same second. Cut points are sync points.
2. **One clock, read in the picture.** The countdown title top-left is the master readout and changes form with the story's scale at section cuts (`Noch 30 Min.` → `T+0,6 s` → `Tag 3`); inside the evidence, the timestamp on each card, a playhead with its clock on the data chart and a `T+xx,x` stopwatch over the decisive seconds agree with it. A permanent timeline band under every shot is **optional and usually wrong**: it eats the frame, adds a layer of small labels and goes empty once the story leaves the clock.
3. **One finding per layout.** Each section says one thing; a heading is part of the layout, never a page header.
4. **Uncertainty is drawn, not apologised for.** `≈`, *erschlossen*, *Schema*, dashed boxes. Known and unknown are separate rows. A source that does not cover a stretch simply is not on screen yet (it lights up late in its row); never an empty "no footage" box, which reads as a broken render.
5. **Restraint.** Real disasters and real people: no slow motion of the catastrophe, no music that tells you to feel; fire only inside evidence frames; casualties as counted dots and numbers.

Not **Satellite Briefing** (no orbital imagery, no zoom from space). Not **Archive Light Table** (no paper on glass, loupes or hands: documents are flat evidence frames). Not **Halftone Dossier** (no print texture, stamps or collage). Not a newsreel package (no channel bug, ticker or anchor voice). Not a keynote: no centred title slides, no page turns. Not the 3D documentary style of the same channel: no 3D scenes, no camera flights.

## 2. Materials & rendering

- **Three kinds of source at least**: moving image (newsreel, CCTV, phone video, launch camera), documents (testimony, memo, telegram/teletype, report page), photographs. Add sound (original commentary, radio, recordings), data (weather, telemetry, counts) and maps whenever they exist.
- **Documents**: a scanned page is shown as a strip or a page, never re-drawn; only the decisive line is highlighted (red, `multiply`, α ≈ 0.6, wiped left to right). Text that exists only as a transcription (a report, radiograms) is re-typeset by code and labelled as a transcription (`Abschrift`).
- **Archival picture pipeline** (pre-1950 film, max ≈ 2.5×): deinterlace (`bwdif=0`) → crop borders → deblock (`hqdn3d=2:2:3:3`) → lanczos upscale → light unsharp (`5:5:0.5`) → greyscale; one grain for everything. Modern footage: ≤ 1.5×. Never colourised or "restored" copies. Landscape sources are cropped to their evidence, never stretched; a vertical frame is filled by stacking, not by upscaling one source beyond these limits.
- **One grade** (canvas `ctx.filter`): footage and photos `grayscale(1) contrast(1.22) brightness(0.94)`; paper `grayscale(1) contrast(1.05) brightness(0.86)` (white pages pressed to light grey); maps greyscale, inverted, `brightness(.62)` so they read as dark line drawings.
- **One grain**: six 256² Gaussian tiles rotated per frame, `overlay`, α 0.22 on footage/photos, 0.10 on paper. Grain only on sources, never on type, lines, the title block or the subtitles (`mux.sh … 0`).
- **Drawn evidence** (plan, side schematic, charts, dot matrix) is thin line work on the panel colour, marked *Schema* when it is not measured.
- Remove channel bugs, watermarks and the source's own title cards; never generate an image to stand in for a historical one.

## 3. Colour logic

| Use | Value |
|---|---|
| Ground | `#0B0C0E` |
| Panels | `#141619` |
| Hairlines, frames | `#2E3238` |
| Text, title block, spoken subtitle words | `#ECEAE4` |
| Secondary text, unspoken subtitle words (α 0.5) | `#8B9097` |
| Ticks, *uncertain* | `#4A4F57` |
| **The one accent in the picture: here / now / match** | `#FF4A2E` |
| Subtitle keywords only | `#6CC0FF` |
| Paper cards (typeset telegrams) | `#E4E0D4` with ink `#1D1D1B` |

Sources are greyscale; red is the only colour in the picture and it only ever points: circles, the chart playhead, sync lines, highlights, ✓ badges (a drawn tick in a red box, no words), the zone everything converges on, the *offen* row, a strike-through on a wrong claim, and the countdown title at the moment of the event (`T+0`) and on alarm. Blue lives only in the subtitles, on the one or two keywords of a phrase; it never appears in panels, links or the title.

## 4. Type & subtitles

- German throughout, spoken to "du". Headings, findings and the title block: Open Sans 700 (30–132 px). Tags, timecodes and ticks: IBM Plex Mono 400/600. Quotes: Source Serif 4 Italic for the original wording (usually English), Source Serif 4 400 for a German translation underneath in the secondary colour (only when the subtitles don't already say it). All OFL, subset to the words on screen.
- **Countdown title block** (top left, left 72 px, top 228 px; soft shadow, no panel): kicker 32 px 600, uppercase, tracked (`28. JANUAR 1986, 11:38 UHR`); title 132 px 700 (`Noch 6 Sek.`, `T+0,6 s`, `T+73 s`, `Tag 3`), red at the event moment; sub-line 32 px 600, uppercase (`RAUCH AM RECHTEN BOOSTER`). It changes on every section cut (blur-in 0.2 s) and is the film's master clock; keep the title short enough not to wrap (`Noch 3:30`, not `Noch 3:30 Min.`).
- **Few words per frame.** Each frame keeps only what this beat needs: the title block, the quoted original (the highlighted line), and one short source tag per piece of evidence. No eyebrow labels, no English twin under every German label, no archive numbers, dates or "Schätzung / nicht maßstabsgetreu" footnotes unless the beat is about them, nothing the subtitle is saying at the same moment.
- **Source tag**: a 6×12 chip + `type · source` in mono, ≤ about 16 characters (`Foto · NASA`, `Bericht · Rogers`), sitting just above its frame. Full credits go on the end card, not on the panels.
- **Lower third**: a red bar + place name (40 px bold) + one mono line (place code), only on the first location shot.
- **Subtitles** (the channel's own): Open Sans 700 *italic*, 54 px, centred at y ≈ 1210, 10 px black shadow. One phrase on screen (up to a punctuation mark, at most 5 words); words not yet spoken are dimmed to α 0.5 and light up word by word as they are spoken (word times from `words.json`); one or two keywords per phrase in `#6CC0FF`. One line only, measured in the page against 940 px. Original sound gets subtitles too, translated, opened by `[O-Ton]`.
- **Reading time**: every key text stays still and whole for characters ÷ 15 + 1.5 s (`readcheck.mjs`); verdict and comparison frames hold ≥ 2.5 s with every item fully in frame. Counters (the title clock, the stopwatch) and tick labels are exempt.

## 5. Motion quality

- 30 fps. Elements **cut in** (≤ 0.1 s opacity) with a 3–4-frame white flash, as if pulled from the evidence locker; nothing flies, bounces or scale-pops.
- **Feed tempo:** a new layout every 1.5–2.5 s on a 0.5 s grid; inside a layout something changes at least every 0.5 s (a circle draws, a source cuts in, a highlight wipes). Verdict and comparison frames still hold ≥ 2.5 s.
- **The hook:** the first 1.5 s are always the decisive frozen frame with its red circle drawing and the title block already showing the key readout; no logo, no title card, no slow start.
- Only things that are *drawn* are progressive: circles drawn clockwise in 0.4 s (ease-out cubic), leaders and links 0.3–0.6 s, plans stroke by stroke, highlights wiped, typewriter text for telegrams.
- Inside a frame: a slow push (≤ 1.9× on a map, ≤ 1.06× on a photo) is allowed; the "camera" itself never moves. Layouts change on cuts.
- The event clock (title, chart playhead, stopwatch) eases between keyframes and moves at constant speed inside a timed run (each tick = one real second).
- Scale changes (minutes → seconds → days) happen on section cuts, carried by the title changing form (`Noch …` → `T+` → `Tag …`), not by a zooming band.
- Holds are for verdicts and for the one silence before the event.

## 6. Shot & layout grammar

- 1080×1920. Margins 60 px. Zones, top to bottom: title block y 228–420 (left aligned, the right of it free for one small source tag at most); **evidence zone** y 460–1150; subtitles y ≈ 1170–1250; **lower evidence zone** y 1290–1580 for the second source of a pair, a chart, the stopwatch or the dots; nothing below y ≈ 1600 (feed caption) and nothing right of x ≈ 940 below y ≈ 1000 (feed buttons). Nothing lives in the subtitle band.
- Panels are hard-edged rectangles with 1 px frames; footage panels keep the source's aspect (landscape sources run full width, 960 px).
- Sources are **stacked**, not set side by side: at most three sources on screen at once.
- Typical layouts: **map → plan** (map top, plan bottom); **one big statement + one quote + one wide schematic**; **three-source board** (two evidence frames in the evidence zone, sound or report in the lower zone, red links converging on one schematic); **three-row sync stack** (report / photo / video stacked under the title clock, each row lighting up when its source begins); **document strip + verdict** (strip top, `belegt` / `offen` rows bottom); **claim card + fact-check card + dot matrix**; **evidence map** (plan, broken-axis mini timeline, schematic, thumbnails with links).
- Avoid centred layouts, page headers and slide-like page turns. Transitions are hard cuts on a 0.5 s grid, white flashes and the rewind; no dissolves.

## 7. Sound palette

1. **Bed**: low D held by contrabass and cellos; a filtered room tone about 30 dB under the voice.
2. **Clockwork**: a pendulum tick every 0.5 s in the minute-scale sections, louder than a background tick (about −18 dB under the voice, not −30); in a timed run one tick per **event** second (accent every 5) — the audible stopwatch.
3. **Harmony**: a pizzicato ostinato in eighths (Dm – B♭ – Gm – A) running **through the whole film**, thinning only in the silence; tremolo minor-second clusters for tension; slow sustained chords for the verdict rows; a resolving D minor add9 with vibraphone for the evidence map.
4. **Hits**: a short, dry low impact (sub ≈ 45 Hz + felt timpani) on every layout cut, −6 dB under the voice, varied in pitch so it never machine-guns; one deep thump for the moment of impact, louder than all the rest.
5. **The one silence**: ≈ 0.8–1.2 s of near-silence (room tone only, no music, no tick) directly before the decisive moment. Exactly one per film.
6. **Foley** (procedural): paper for documents, a shutter for photos, Morse "dits" and keystrokes for telegrams, teletype chatter, a rewind sweep, pencil scratches for plans.
7. **Original sound** (archival commentary, radio, mission audio): band-passed 180 Hz–5.5 kHz with sparse crackle, shown as a waveform with a red play-line and word-by-word lighting; music ducks −12 dB under it. Original sound and score alternate; never both loud.
8. **Voice**: German, "du", calm and matter-of-fact; the user's own ElevenLabs file first (aligned with `align.py`), a Piper German voice only as a stand-in. Music ducks about −9 dB under it; −14 LUFS, true peak ≤ −1.2 dB.

No hits, stings or effects on deaths.

## 8. Native moves (and how to code them)

- **Freeze, circle, magnify.** Freeze a frame with a white flash; draw a 2.5 px red circle clockwise; at 60 % a leader and a bold label appear; a ×2 loupe opens below it (vertical frame), cropped from the same source pixels (never beyond 1 source px per screen px). *Fits:* a licence plate in CCTV; a crack in a weld; the hook of every film.
- **Hard sync point.** Pick one instant every source can recognise (impact, flash, a public clock, a gunshot peak) and align each source to it. A source that starts late just appears late; if the gap matters, say it in the voice or a subtitle. *Fits:* which phone started filming first; when the launch camera lost the vehicle.
- **Three-row sync stack.** Document / photo / video stacked under the title clock running as a stopwatch; each row cuts in (white flash) at the moment its source begins, so the stack fills top to bottom as the clock runs; freeze on the sync point with a red dashed line down through the pictures at the matching instant. *Fits:* two dashcams and a police log.
- **The title changes scale.** The countdown title changes form at each section cut — `Noch 2 Std.` / `Noch 30 Min.` (minutes, with card timestamps and a chart playhead), `T+0,6 s` (seconds), `Tag 3` (days) — as the story narrows or widens. *Optional:* a timeline band with tracks per source kind, only for a film that stays on one clock throughout; keep it free of labels and drop it when the clock stops. *Fits:* a market crash from the week to the minute.
- **Rewind cold open.** Start on the decisive frozen frame (the hook), slam two more sources into a stack, sweep a sync line, then rewind (footage playing backwards, scan lines) to the start. *Fits:* any reconstruction.
- **Telegrams on the clock.** Typeset radiograms / messages land at their timestamps with Morse and keystrokes; red dashed leaders tie each card to a pin at its time on the data chart's axis in the lower zone. *Fits:* chat logs, ATC calls, emails.
- **Data chart with a playhead.** A chart (wind, speed, temperature) across the lower evidence zone with a time axis, event bands labelled with one word, the message pins, and a red playhead carrying the clock. *Fits:* power-grid load before a blackout.
- **Map → plan.** A real survey map pushes in to the site, then cuts to a measured plan with the subject's position, a bearing, a distance ring, a camera point and an inferred view cone; the map stays as a locator inset. *Fits:* where each witness stood.
- **Evidence → model links.** Every circle in every source sends a red dashed link to the same zone of one schematic; ✓ badges land 0.12 s apart with small mallet notes. *Fits:* which room a fire started in.
- **Damals vs. Akte.** Play a period claim as original sound, then a fact-check card; strike through the wrong words in the claim. *Fits:* a press release against the filed numbers.
- **Belegt / offen.** Two rows, ticked vs. dashed boxes, every item held whole for ≥ 2.5 s, one source tag for the board. *Fits:* any inquiry's conclusion.
- **Dots for people.** One dot per person; the dead become red open rings one by one; a single large number in the title block. *Fits:* passengers, workers, victims of any event.
- **Evidence map.** Plan, broken-axis mini timeline, schematic and thumbnails of every source, all links converging; the poster frame. *Fits:* the end of any investigation.

## 9. Pitfalls

- **Inference passed off as fact.** Camera positions, photo times and offsets need `≈ / erschlossen / nicht verortet` on screen and in `FACTS.md`.
- **Early reports as facts.** The first-day statements and period news often disagree with the final report; use them as images or as claims to check, never as the source of a number.
- **Faking a multi-camera event.** With one licensable film, do not borrow clips of unclear origin; cross-check film + photos + documents + sound instead. The structure still holds.
- **Seams in "continuous" shots.** An exposure jump or splice breaks timing; time durations from the official record and state the alignment error.
- **Time zones and clocks.** Old reports may use standard time while the place ran on daylight time; pick one and state it once in the title kicker (`11:38 UHR EST`).
- **Too much at once.** One layout, one finding; at most three sources on screen in the vertical frame, and the subtitle never repeats the title or heading word for word.
- **Too many words on screen.** Keep only what this beat needs (title block, the highlighted original, one short tag per source). Eyebrows, English twins of every label, archive numbers, footnotes and translations the subtitle already gives turn the frame into noise — worse on a phone.
- **Empty placeholder boxes for missing material.** A grey "no footage" or "waiting for photo" panel looks like a render error. Fill the slot with real material, change the layout, or let the source appear when it starts.
- **Feed UI.** The feed covers the bottom ≈ 320 px and a column of buttons on the right; a circle, loupe or quote placed there is lost. Check every frame against the safe zones in §6.
- **Tempo eating the evidence.** Fast cuts must not shorten a quote below its reading time; cut the quote shorter instead. A circle that is not finished before the cut was never seen.
- **Hits on everything.** A hit on every cut is the floor, not a licence: no hits on text cut-ins, none on deaths, and the event thump must stay the loudest sound.
- **Blue spreading.** Blue keywords belong to the subtitles only; a blue link or panel breaks the rule that red is the only pointer.
- **Landscape sources upscaled to fill.** A 4:3 newsreel blown up to fill 1920 px height is mush; stack it full width instead.
- **Catastrophe as spectacle.** No slow motion of fire or impact, no full-screen flames, no sound effects on deaths.

## 10. Footage (Material)

1. **Ask the user first.** Before searching: does the user have their own footage, photos, documents, recordings or data (dashcam files, a report PDF, a spreadsheet of readings)? Their own material always comes first.
2. **Where to look, and how to judge the licence.** Use `$LIB/styles/visual-investigation/demo/tools/footage.py` (copy it into the project): `search archive|commons|nasa`, `files`, `fetch` (records licence, author and page into `SOURCES.jsonl`), `used`, `md` (writes `SOURCES.md`). The hosts it needs (archive.org, commons.wikimedia.org, upload.wikimedia.org, images-api.nasa.gov, images-assets.nasa.gov) must be reachable from the machine; if they are blocked, say so and ask the user to allow them or to supply the files.
   - **Internet Archive**: the item's `licenseurl` and collection. The NARA-donated Universal Newsreels (1929–1967) are public domain; other newsreel companies (Hearst, Pathé, Movietone, Paramount) are not, even when uploaders tag them PD. "stock footage" and YouTube-ripped items: skip.
   - **Wikimedia Commons**: read the file page — author, source, licence template. U.S. federal work (Navy, NASA, NARA, NOAA, USGS, NTSB) = public domain. PD claims resting on "not renewed" agency photos (AP, INS, Wide World): treat as uncertain and skip. Download big files through the API thumbnail URL (3840 px) to avoid 429s.
   - **NASA** (images.nasa.gov): public domain except marked third-party items and logos.
   - **Library of Congress / national archives**: read each item's rights statement; "no known restrictions" is **not** a licence — skip it.
   - **USGS The National Map**: historical topographic maps as PDF (public domain); render the area you need with `pdftoppm -r 300 -x … -y … -W … -H …`.
   - **Government reports and FBI files**: U.S. federal works are public domain; quote them, typeset transcriptions, show scans only as evidence frames.
   - Allowed: public domain, CC0, CC BY (credited in full on the end card). Not allowed: CC BY-SA, "no known restrictions", unclear origin, colourised or restored copies.
3. **Tell the user before downloading**: what (title, length or pages), from where (page URL) and under which licence; keep `raw/` under about 1.5 GB.
4. **Topics without free material** (most non-U.S. events after 1950) don't fit this style; say so before the treatment and suggest the channel's 3D style instead.

## 11. Facts

Keep `FACTS.md` (claim on screen or in the voice → source URL → quoted wording), list every inference separately, and check the final script and subtitles against it before the last render.

## 12. Engine

- One Canvas-2D page (`index.html`) at 1080×1920, `window.render(t)` deterministic, `window.TEXTS(t)` for `readcheck.mjs` (key texts only; counters exempt), `window.SUBCHECK()` for the one-line subtitle check; all timing in `film.json` (sections, title states, voice starts and word times, original-sound clips, subtitles, cut hits), shared by the page, the mix (`audio/mix.py`) and the subtitles (`tools/cues.py`).
- Reusable parts in the page (from `$LIB/styles/visual-investigation/demo/index.html`): `plate()` (grade + grain + flash), `ring()` (circle + leader label), `cover()` (fill a panel without stretching, returns a source → screen map for circles), `badge()`, `wave()` (waveform with play-line), `playhead()` (event-clock keyframes shared with the mix), `planPanel()`, `schematic()`, `push()`; new for this style: `titleBlock(t)` (kicker / title / sub-line with blur-in, red at the event) and `subs(t)` (phrase, word-by-word lighting, blue keywords).
- Prep: `$LIB/styles/visual-investigation/demo/tools/prep.sh` (ffmpeg + pdftoppm + PIL), `wave.py` (waveform peaks), `fonts.py` (OFL subsets). Checks: `subcheck.mjs`, `final_asr.py` (speech check on the finished film, per line).

## 13. Variation space

The agent decides per film: the event, the sources, the sync point, which time scales the clock passes through, the layouts, the opening and the ending — always opening on the hook (§5).

- **Three structures:** a cold open on the decisive frame, then rewind and rebuild; one question ("Wo hat es angefangen?") answered source by source; a strict clock (`Noch 10 Min.` → `T+1 Std.`) with findings dropping in where they happen.
- **Three sync points:** an impact or flash frame; a sound peak heard in several recordings; a public clock or broadcast time signal.
- **Three endings:** the evidence map; the belegt/offen board left on screen; back to the opening frame, now fully annotated, with one question to "du".
- **Other subjects:** a traffic collision (dashcams, CCTV, police report), a disputed call in sport (camera angles, rulebook), a launch failure (tracking cameras, telemetry, accident report), an aviation incident (ATC audio, NTSB report, photos).

---

How the demo film was made (story, shots, score, build): [DEMO.md](DEMO.md). Read it after your treatment exists.
