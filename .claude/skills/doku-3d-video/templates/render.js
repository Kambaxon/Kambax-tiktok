      // ================= Render-System: Shader-Himmel, Reflexionen, HDR-Nachbearbeitung =================
      // Einbinden NACH dem Renderer-Block. Benutzt THREE (r149), rng() aus den Helfern.

      const VS_QUAD = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
      const GLSL_NOISE = `
        float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }`;

      // Himmel-Voreinstellungen. Farben sind linear (HDR), Werte >1 erlaubt.
      const HIMMEL = {
        tag:   { zen: [0.16, 0.36, 0.78], hor: [0.62, 0.78, 0.95], boden: [0.35, 0.36, 0.34], sonne: [1.0, 0.95, 0.85], sonnenKraft: 1.0, wolkenFarbe: [1.0, 1.0, 1.0], schatten: [0.55, 0.62, 0.75], sterne: 0, mond: false },
        abend: { zen: [0.12, 0.17, 0.42], hor: [1.0, 0.52, 0.26], boden: [0.22, 0.16, 0.14], sonne: [1.0, 0.62, 0.32], sonnenKraft: 1.2, wolkenFarbe: [1.0, 0.66, 0.45], schatten: [0.35, 0.28, 0.42], sterne: 0.15, mond: false },
        nacht: { zen: [0.004, 0.008, 0.03], hor: [0.03, 0.05, 0.11], boden: [0.01, 0.012, 0.02], sonne: [0.75, 0.82, 1.0], sonnenKraft: 0.5, wolkenFarbe: [0.12, 0.14, 0.2], schatten: [0.02, 0.025, 0.04], sterne: 1, mond: true },
        gewitter: { zen: [0.06, 0.07, 0.1], hor: [0.22, 0.22, 0.26], boden: [0.1, 0.1, 0.1], sonne: [0.8, 0.8, 0.9], sonnenKraft: 0.15, wolkenFarbe: [0.3, 0.3, 0.36], schatten: [0.05, 0.05, 0.07], sterne: 0, mond: false },
        dunst: { zen: [0.42, 0.45, 0.5], hor: [0.7, 0.68, 0.64], boden: [0.3, 0.29, 0.27], sonne: [1.0, 0.85, 0.65], sonnenKraft: 0.4, wolkenFarbe: [0.8, 0.78, 0.76], schatten: [0.45, 0.46, 0.5], sterne: 0, mond: false },
      };

      // Himmelskuppel mit Verlauf, Sonne/Mond, fbm-Wolken, funkelnden Sternen und Milchstraße.
      // o: { zeit: "tag"|"abend"|"nacht"|"dunst"|"gewitter", wolken (0..1 Bedeckung), wolkenTyp: "cumulus"|"cirrus"|"stratus"|"altocumulus"|"gewitter", halo (0..1, Cirrostratus-Ring um die Sonne),
      //     sonne:[x,y,z] Richtung, wind, stadtLicht (0..1 Lichtglocke am Horizont) }
      const WOLKENTYP = { cumulus: 0, cirrus: 1, stratus: 2, altocumulus: 3, gewitter: 4 };
      function himmelShader(scene, o = {}) {
        const P = Object.assign({}, HIMMEL[o.zeit || "tag"]);
        const dir = new THREE.Vector3(...(o.sonne || [0.4, 0.35, -0.8])).normalize();
        const v3 = (a) => new THREE.Vector3(...a);
        const mat = new THREE.ShaderMaterial({
          side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
          uniforms: {
            uZen: { value: v3(P.zen) }, uHor: { value: v3(P.hor) }, uBoden: { value: v3(P.boden) },
            uSonne: { value: dir }, uSonnenFarbe: { value: v3(P.sonne).multiplyScalar(P.sonnenKraft) },
            uWolkenFarbe: { value: v3(P.wolkenFarbe) }, uSchatten: { value: v3(P.schatten) },
            uBedeckung: { value: o.wolken ?? 0.45 }, uSterne: { value: P.sterne }, uMond: { value: P.mond ? 1 : 0 },
            uZeit: { value: 0 }, uWind: { value: o.wind ?? 0.004 }, uStadt: { value: o.stadtLicht ?? 0 }, uTyp: { value: WOLKENTYP[o.wolkenTyp ?? (o.zeit === "gewitter" ? "gewitter" : "cumulus")] ?? 0 }, uHalo: { value: o.halo ?? 0 },
          },
          vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            uniform vec3 uZen, uHor, uBoden, uSonne, uSonnenFarbe, uWolkenFarbe, uSchatten;
            uniform float uBedeckung, uSterne, uMond, uZeit, uWind, uStadt, uTyp, uHalo;
            varying vec3 vDir;
            ${GLSL_NOISE}
            vec3 h33(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
            void main(){
              vec3 d = normalize(vDir);
              float y = d.y;
              vec3 col = mix(uHor, uZen, pow(clamp(y, 0.0, 1.0), 0.55));
              if (y < 0.0) col = mix(uHor, uBoden, smoothstep(0.0, 0.12, -y));
              float sd = max(dot(d, uSonne), 0.0);
              // Lichtglocke einer Stadt am Horizont (nachts)
              col += vec3(0.32, 0.2, 0.1) * uStadt * exp(-abs(y) * 9.0) * 0.25;
              // Sterne: Zellgitter auf der Kugel, Größe, Farbe, Funkeln
              if (uSterne > 0.0 && y > 0.0) {
                vec3 g = d * 180.0; vec3 id = floor(g); vec3 f = fract(g) - 0.5;
                vec3 rnd = h33(id);
                float an = step(0.965, rnd.x);
                vec3 off = (h33(id + 7.1) - 0.5) * 0.6;
                float dist = length(f - off);
                float hell = step(0.995, rnd.x);
                float r = mix(0.06, 0.13, hell);
                float stern = an * smoothstep(r, 0.0, dist) * (0.35 + 0.65 * rnd.y);
                float funkeln = 0.65 + 0.35 * sin(uZeit * (2.0 + rnd.z * 5.0) + rnd.y * 40.0);
                vec3 farbe = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.85, 0.65), rnd.z);
                float hoehe = smoothstep(0.02, 0.25, y);
                col += farbe * stern * funkeln * (1.4 + hell * 6.0) * uSterne * hoehe;
                // Milchstraße: diagonales Band mit Wolkenstruktur
                vec3 ax = normalize(vec3(0.5, 0.3, 0.8));
                float band = exp(-pow(dot(d, ax) * 3.2, 2.0));
                float mw = fbm(vec2(atan(d.z, d.x) * 3.0, d.y * 6.0)) * fbm(d.xz * 9.0 + 3.0);
                col += vec3(0.5, 0.52, 0.65) * band * mw * 0.09 * uSterne * hoehe;
              }
              // Sonne bzw. Mond
              col += uSonnenFarbe * (pow(sd, 6.0) * 0.35 * (1.0 - uMond * 0.85) + pow(sd, 64.0) * 0.6);
              col += uSonnenFarbe * smoothstep(0.9993, 0.9997, sd) * mix(18.0, 1.6, uMond);
              // Wolken: Ebene in Höhe projiziert, Form je Wolkenart
              if (y > 0.0 && uBedeckung > 0.0) {
                vec2 wp = d.xz / (y + 0.12) * 1.6 + vec2(uZeit * uWind, uZeit * uWind * 0.4);
                float dichte, nl, n;
                if (uTyp < 0.5) { // Cumulus: Haufenwolken, helle Ränder, dunklere Basis
                  n = fbm(wp); float n2 = fbm(wp * 2.3 + 4.0); float form = n * 0.8 + n2 * 0.35;
                  dichte = smoothstep(1.0 - uBedeckung, 1.0 - uBedeckung + 0.2, form); nl = fbm(wp + uSonne.xz * 0.35);
                } else if (uTyp < 1.5) { // Cirrus: feine, gezogene Faserstreifen in großer Höhe
                  vec2 cp = vec2(wp.x * 0.3 + wp.y * 0.25, wp.y * 2.8 - wp.x * 0.4) * 1.2; n = fbm(cp + vec2(fbm(wp * 0.5) * 2.0, 0.0));
                  dichte = smoothstep(1.0 - uBedeckung * 0.85, 1.0 - uBedeckung * 0.85 + 0.3, n) * 0.65; nl = n - 0.12;
                } else if (uTyp < 2.5) { // Stratus: geschlossene graue Decke
                  n = fbm(wp * 0.6); dichte = clamp(0.72 + (n - 0.5) * 0.6 + uBedeckung * 0.25, 0.0, 1.0); nl = n;
                } else if (uTyp < 3.5) { // Altocumulus: Schäfchenwolken in Reihen
                  vec2 ap = wp * 3.2; float zell = vn(ap) * 0.6 + vn(ap * 2.1) * 0.4; float reihen = 0.5 + 0.5 * sin(wp.x * 5.0 + fbm(wp) * 4.0);
                  n = zell * 0.72 + reihen * 0.28; dichte = smoothstep(1.0 - uBedeckung, 1.0 - uBedeckung + 0.12, n) * smoothstep(0.25, 0.55, fbm(wp * 0.4) + 0.15); nl = vn(ap + uSonne.xz * 0.4);
                } else { // Gewitter (Cumulonimbus): dunkel, schwer, fast geschlossen
                  n = fbm(wp * 0.8); float n2 = fbm(wp * 2.0 + 7.0); dichte = smoothstep(0.25, 0.55, n * 0.8 + n2 * 0.4 + uBedeckung * 0.3); nl = fbm(wp * 0.8 + uSonne.xz * 0.3);
                }
                float rand = clamp(n - nl + 0.55, 0.0, 1.0);
                vec3 wolke = mix(uSchatten, uWolkenFarbe, rand);
                if (uTyp > 1.5 && uTyp < 2.5) wolke = mix(uSchatten, uWolkenFarbe, 0.45 + (n - 0.5) * 0.5);
                if (uTyp > 3.5) wolke = mix(uSchatten * 0.4, uWolkenFarbe, rand * 0.6);
                wolke += uSonnenFarbe * pow(sd, 8.0) * (1.0 - dichte) * 1.5;
                float fern = smoothstep(0.0, 0.18, y);
                col = mix(col, wolke, dichte * fern * 0.95);
              }
              if (uHalo > 0.0) col += uSonnenFarbe * exp(-pow((acos(clamp(sd, 0.0, 1.0)) - 0.38) * 22.0, 2.0)) * 0.2 * uHalo; // 22°-Halo
              gl_FragColor = vec4(col, 1.0);
            }`,
        });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), mat);
        dome.renderOrder = -10; dome.frustumCulled = false;
        scene.add(dome);
        if (!scene.fog) scene.fog = new THREE.Fog(new THREE.Color(...P.hor), 60, 280);
        const himmel = { dome, mat, sonne: dir, P, update(T) { mat.uniforms.uZeit.value = T; } };
        scene.userData.himmel = himmel;
        return himmel;
      }

      // Reflexionen: Himmel (+ grober Boden) als Umgebungskarte in scene.environment.
      // Danach spiegeln MeshStandard/MeshPhysical-Materialien (Glas, Lack, Pfützen) den Himmel.
      function umgebung(scene, himmel, rend = renderer, o = {}) {
        const env = new THREE.Scene();
        const d = himmel.dome.clone(); d.material = himmel.mat.clone(); d.material.uniforms = THREE.UniformsUtils.clone(himmel.mat.uniforms);
        d.material.uniforms.uSterne.value *= 0.5; d.scale.setScalar(0.15); env.add(d); // PMREM-Kamera sieht nur bis 100 m
        const boden = new THREE.Mesh(new THREE.CircleGeometry(40, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(...(o.boden || himmel.P.boden)) }));
        boden.rotation.x = -Math.PI / 2; boden.position.y = -2; env.add(boden);
        const pm = new THREE.PMREMGenerator(rend);
        const rt = pm.fromScene(env, 0.02);
        scene.environment = rt.texture; pm.dispose();
        return rt.texture;
      }

      // HDR-Nachbearbeitung v3: Szene linear in HalfFloat-MSAA-Ziel, dann ein Kompositions-Shader mit (fast) allen Kino-Effekten.
      // Alle Effekte sind Uniforms (0 = aus) und lassen sich pro Shot setzen: POST.uniforms.uName.value = ...  (in bauen.py: post: P({ uName: wert }))
      //  Licht/Tiefe: uStrahlen (Lichtstrahlen), uAO (Umgebungsverdeckung), uNebel + uNebelFarbe + uNebelHoehe (Höhen-/Tiefennebel mit Sonnenstreuung), uBewegung (Bewegungsunschärfe der Kamera)
      //  Optik:  uDof + uFokus + uBlende (Tiefenschärfe), uBokeh (runde Lichter in der Unschärfe), uTilt + uTiltMitte, uFlare, uAnamorph, uChroma (Farbsäume), uVerzerrung (+ Tonne / − Kissen), uVig, uHitze (Hitzeflimmern) + uHitzeY
      //  Farbe:  uSat, uKon, uBel, uLift/uGamma/uGain (vec3), uSplitSchatten/uSplitLicht (vec3) + uSplit, uMono (Schwarzweiß), uKreuz (Cross-Processing), uSchwarz (Schwarzwert), uRolloff (weiche Lichter), uTint
      //  Finish: uSchaerfe, uKlarheit, uHalation, uKorn (Filmkorn – Standard aus!), uBloom, uSchwelle
      //  Stil:   uKontur (Umrisslinien aus Tiefe), uToon (Farbstufen), uHalbton, uGlitch, uVHS, uScan (CRT-Zeilen), uLeck (Lichtlecks), uKratzer, uTon (Ton-/Clay-Look, Szene grau), uDraht (Drahtgitter-Overlay)
      // Farblooks: POST.look("tealOrange"|"noir"|"golden"|"cyberpunk"|"moody"|"pastell"|"neutral"|"kreuz")
      const LOOKS = {
        neutral:    { uSat: 1.08, uKon: 1.05, uLift: [0, 0, 0], uGamma: [1, 1, 1], uGain: [1, 1, 1], uSplit: 0, uMono: 0, uKreuz: 0, uSchwarz: 0, uTint: [1, 1, 1] },
        tealOrange: { uSat: 1.12, uKon: 1.1, uLift: [-0.01, 0.01, 0.03], uGamma: [1, 1, 1], uGain: [1.04, 1, 0.94], uSplitSchatten: [0.1, 0.45, 0.55], uSplitLicht: [1.0, 0.62, 0.32], uSplit: 0.22, uMono: 0, uKreuz: 0, uSchwarz: 0.01, uTint: [1, 1, 1] },
        noir:       { uSat: 1, uKon: 1.35, uLift: [0, 0, 0], uGamma: [0.95, 0.95, 0.95], uGain: [1.05, 1.05, 1.05], uSplit: 0, uMono: 1, uKreuz: 0, uSchwarz: 0.04, uTint: [1, 1, 1] },
        golden:     { uSat: 1.12, uKon: 1.06, uLift: [0.015, 0.008, -0.005], uGamma: [1, 1, 1.02], uGain: [1.08, 1.0, 0.86], uSplitSchatten: [0.3, 0.25, 0.4], uSplitLicht: [1.0, 0.75, 0.4], uSplit: 0.15, uMono: 0, uKreuz: 0, uSchwarz: 0, uTint: [1.04, 1.0, 0.94] },
        cyberpunk:  { uSat: 1.3, uKon: 1.15, uLift: [0.02, -0.01, 0.05], uGamma: [1, 1.02, 0.95], uGain: [1.05, 0.9, 1.12], uSplitSchatten: [0.1, 0.2, 0.7], uSplitLicht: [1.0, 0.3, 0.8], uSplit: 0.3, uMono: 0, uKreuz: 0, uSchwarz: 0.02, uTint: [1, 1, 1] },
        moody:      { uSat: 0.72, uKon: 1.12, uLift: [0.0, 0.01, 0.02], uGamma: [1.03, 1.03, 1.0], uGain: [0.95, 0.98, 1.0], uSplitSchatten: [0.2, 0.3, 0.4], uSplitLicht: [0.8, 0.75, 0.65], uSplit: 0.12, uMono: 0, uKreuz: 0, uSchwarz: 0.02, uTint: [1, 1, 1] },
        pastell:    { uSat: 0.82, uKon: 0.86, uLift: [0.06, 0.05, 0.07], uGamma: [0.95, 0.95, 0.95], uGain: [1.0, 0.98, 1.02], uSplitSchatten: [0.6, 0.5, 0.8], uSplitLicht: [1.0, 0.85, 0.85], uSplit: 0.2, uMono: 0, uKreuz: 0, uSchwarz: 0, uTint: [1, 1, 1] },
        kreuz:      { uSat: 1.2, uKon: 1.15, uLift: [0, 0.02, 0.04], uGamma: [1, 1, 1], uGain: [1, 1, 1], uSplit: 0, uMono: 0, uKreuz: 1, uSchwarz: 0.02, uTint: [1, 1, 1] },
      };
      function nachbearbeitung(rend = renderer, o = {}) {
        const Wd = 1080, Ht = 1920; rend.localClippingEnabled = true;
        const opt = Object.assign({ bloom: 0.55, schwelle: 1.0, belichtung: rend.toneMappingExposure || 0.62, vignette: 0.28, samples: 4, tiltMitte: 0.45 }, o);
        const mk = (w, h, s = 0, typ = THREE.HalfFloatType, tiefe = false) => new THREE.WebGLRenderTarget(w, h, { type: typ, samples: s, depthBuffer: s > 0 || tiefe, stencilBuffer: s > 0 || tiefe, // mit Stencil -> 24-bit-Tiefe statt 16 bit
          minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
        const sk = opt.skala ?? 1, RW = Math.round(Wd * sk), RH = Math.round(Ht * sk); // skala < 1: Szene intern kleiner rendern (Tempo), Post skaliert hoch
        const haupt = mk(RW, RH, opt.samples), akku = mk(RW, RH);
        const kopieM = new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null }, uW: { value: 1 } }, vertexShader: VS_QUAD, fragmentShader: `uniform sampler2D tSrc; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * uW, 1.0); }`, depthTest: false, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, transparent: true });
        const JITTER = [[0.25, 0.75], [0.75, 0.25], [0.375, 0.125], [0.875, 0.625], [0.125, 0.375], [0.625, 0.875], [0.5, 0.5], [0.0625, 0.9375]];
        const stufen = [2, 4, 8].map((f) => ({ a: mk(Wd / f, Ht / f), b: mk(Wd / f, Ht / f), w: Wd / f, h: Ht / f }));
        const unscharf = { a: mk(Wd / 3, Ht / 3), b: mk(Wd / 3, Ht / 3), w: Wd / 3, h: Ht / 3 };
        const tiefeRT = mk(RW / 2, RH / 2, 0, THREE.UnsignedByteType, true), strahlRT = mk(Wd / 4, Ht / 4);
        const tiefeM = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), tonM = new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 0.85 }), drahtM = new THREE.MeshBasicMaterial({ color: 0x8ab8ff, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false;
        const qs = new THREE.Scene(); qs.add(quad); const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const sm = (u, fs) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS_QUAD, fragmentShader: fs, depthTest: false, depthWrite: false, toneMapped: false });
        const hellM = sm({ tSrc: { value: null }, uS: { value: opt.schwelle } }, `
          uniform sampler2D tSrc; uniform float uS; varying vec2 vUv;
          void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uS, uS * 1.6, l), 1.0); }`);
        const blurM = sm({ tSrc: { value: null }, uDir: { value: new THREE.Vector2() } }, `
          uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
          void main(){ vec3 c = texture2D(tSrc, vUv).rgb * 0.227027;
            c += texture2D(tSrc, vUv + uDir * 1.3846).rgb * 0.3162162; c += texture2D(tSrc, vUv - uDir * 1.3846).rgb * 0.3162162;
            c += texture2D(tSrc, vUv + uDir * 3.2308).rgb * 0.0702703; c += texture2D(tSrc, vUv - uDir * 3.2308).rgb * 0.0702703;
            gl_FragColor = vec4(c, 1.0); }`);
        const v3 = (a) => new THREE.Vector3(...a), U = {
          tSzene: { value: haupt.texture }, tB1: { value: stufen[0].a.texture }, tB2: { value: stufen[1].a.texture }, tStrahlen: { value: strahlRT.texture }, tB3: { value: stufen[2].a.texture }, tUnscharf: { value: unscharf.a.texture }, tTiefe: { value: tiefeRT.texture },
          uBloom: { value: opt.bloom }, uBel: { value: opt.belichtung }, uSat: { value: 1.08 }, uKon: { value: 1.05 }, uVig: { value: opt.vignette }, uTint: { value: v3([1, 1, 1]) }, uBlau: { value: 0.012 },
          uStrahlen: { value: 0 }, uFlare: { value: 0 }, uAnamorph: { value: 0 }, uSonnePos: { value: new THREE.Vector2(0.5, 0.8) }, uSicht: { value: 0 }, uSonnenFarbe: { value: v3([1, 0.9, 0.75]) },
          uTilt: { value: 0 }, uTiltMitte: { value: opt.tiltMitte }, uDof: { value: 0 }, uFokus: { value: 10 }, uBlende: { value: 0.6 }, uBokeh: { value: 0 }, uNear: { value: 0.1 }, uFar: { value: 400 }, uUnscharfAn: { value: 0 },
          uAO: { value: 0 }, uNebel: { value: 0 }, uNebelFarbe: { value: v3([0.8, 0.85, 0.9]) }, uNebelHoehe: { value: 8 }, uBewegung: { value: 0 },
          uInvProj: { value: new THREE.Matrix4() }, uCamWelt: { value: new THREE.Matrix4() }, uPrevVP: { value: new THREE.Matrix4() }, uSonneDir: { value: new THREE.Vector3(0, 1, 0) },
          uChroma: { value: 0 }, uVerzerrung: { value: 0 }, uHitze: { value: 0 }, uHitzeY: { value: 0.45 },
          uLift: { value: v3([0, 0, 0]) }, uGamma: { value: v3([1, 1, 1]) }, uGain: { value: v3([1, 1, 1]) }, uSplitSchatten: { value: v3([0.2, 0.4, 0.6]) }, uSplitLicht: { value: v3([1, 0.7, 0.4]) }, uSplit: { value: 0 },
          uMono: { value: 0 }, uKreuz: { value: 0 }, uSchwarz: { value: 0 }, uRolloff: { value: 0 },
          uSchaerfe: { value: 0 }, uKlarheit: { value: 0 }, uHalation: { value: 0 }, uKorn: { value: 0 },
          uKontur: { value: 0 }, uToon: { value: 0 }, uHalbton: { value: 0 }, uGlitch: { value: 0 }, uVHS: { value: 0 }, uScan: { value: 0 }, uLeck: { value: 0 }, uKratzer: { value: 0 }, uTon: { value: 0 }, uDraht: { value: 0 },
          uZeit: { value: 0 }, uAufl: { value: new THREE.Vector2(RW, RH) }, uSSAA: { value: 1 }, uHitzePunkte: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
        };
        const endM = sm(U, `
          #include <packing>
          uniform sampler2D tSzene, tB1, tB2, tB3, tUnscharf, tTiefe, tStrahlen;
          uniform float uBloom, uBel, uSat, uKon, uVig, uBlau, uStrahlen, uFlare, uAnamorph, uSicht, uTilt, uTiltMitte, uDof, uFokus, uBlende, uBokeh, uNear, uFar, uUnscharfAn;
          uniform float uAO, uNebel, uNebelHoehe, uBewegung, uChroma, uVerzerrung, uHitze, uHitzeY, uSplit, uMono, uKreuz, uSchwarz, uRolloff, uSchaerfe, uKlarheit, uHalation, uKorn;
          uniform float uKontur, uToon, uHalbton, uGlitch, uVHS, uScan, uLeck, uKratzer, uZeit; uniform vec4 uHitzePunkte[4];
          uniform vec3 uTint, uSonnenFarbe, uNebelFarbe, uLift, uGamma, uGain, uSplitSchatten, uSplitLicht, uSonneDir; uniform vec2 uSonnePos, uAufl;
          uniform mat4 uInvProj, uCamWelt, uPrevVP; varying vec2 vUv;
          float h12(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
          float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h12(i), h12(i + vec2(1,0)), f.x), mix(h12(i + vec2(0,1)), h12(i + vec2(1,1)), f.x), f.y); }
          float tiefeRoh(vec2 uv){ return unpackRGBAToDepth(texture2D(tTiefe, uv)); }
          float linTiefe(vec2 uv){ return -perspectiveDepthToViewZ(tiefeRoh(uv), uNear, uFar); }
          vec3 weltPos(vec2 uv, float z){ vec4 ndc = vec4(uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0); vec4 vp = uInvProj * ndc; vp /= vp.w; return (uCamWelt * vp).xyz; }
          vec3 fit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
          vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
            const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); c *= uBel / 0.6; return clamp(O * fit(I * c), 0.0, 1.0); }
          vec3 srgb(vec3 c){ return mix(pow(c, vec3(0.41666)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }
          void main(){
            // ---- Bildgeometrie: Linsenverzerrung, Hitzeflimmern, Glitch-Versatz ----
            vec2 uv = vUv; vec2 zc = uv - 0.5;
            if (uVerzerrung != 0.0) { float r2 = dot(zc * vec2(0.5625, 1.0), zc * vec2(0.5625, 1.0)); uv = 0.5 + zc * (1.0 + uVerzerrung * r2 * 1.6) / (1.0 + uVerzerrung * 0.25); }
            if (uHitze > 0.0) { float band = smoothstep(0.25, 0.0, abs(uv.y - uHitzeY)); uv.x += sin(uv.y * 180.0 + uZeit * 7.0) * 0.0018 * uHitze * band; uv.y += sin(uv.x * 120.0 + uZeit * 5.0) * 0.0012 * uHitze * band; }
            for (int i = 0; i < 4; i++) { vec4 hp = uHitzePunkte[i]; if (hp.w > 0.0) { vec2 dv = (uv - hp.xy) * vec2(0.5625, 1.0); float infl = smoothstep(hp.z, 0.0, length(dv)) * step(hp.y - hp.z * 0.3, uv.y); uv += vec2(sin(uv.y * 260.0 - uZeit * 9.0), cos(uv.x * 210.0 + uZeit * 7.0)) * 0.0022 * hp.w * infl; } } // Hitzeflimmern über Auspuff/Feuer
            if (uGlitch > 0.0) { float zeile = floor(uv.y * 40.0); float ein = step(1.0 - uGlitch * 0.25, h12(vec2(zeile, floor(uZeit * 12.0)))); uv.x += (h12(vec2(zeile, uZeit)) - 0.5) * 0.08 * ein; }
            // ---- Szene mit chromatischer Aberration ----
            vec3 c; if (uChroma > 0.0) { vec2 d = (uv - 0.5) * uChroma * 0.012; c = vec3(texture2D(tSzene, uv + d).r, texture2D(tSzene, uv).g, texture2D(tSzene, uv - d).b); } else c = texture2D(tSzene, uv).rgb;
            if (uGlitch > 0.0) { float ein = step(0.92, h12(vec2(floor(uv.y * 25.0), floor(uZeit * 9.0)))) * uGlitch; c.r = mix(c.r, texture2D(tSzene, uv + vec2(0.01, 0.0)).r, ein); c.b = mix(c.b, texture2D(tSzene, uv - vec2(0.012, 0.0)).b, ein); }
            bool brauchtTiefe = uDof > 0.5 || uAO > 0.0 || uNebel > 0.0 || uBewegung > 0.0 || uKontur > 0.0;
            float zr = 1.0, dist = 1e5; vec3 wp = vec3(0.0); if (brauchtTiefe) { zr = tiefeRoh(uv); dist = -perspectiveDepthToViewZ(zr, uNear, uFar); wp = weltPos(uv, zr); }
            // ---- Bewegungsunschärfe der Kamera (Reprojektion mit der Kameramatrix des vorigen Frames) ----
            if (uBewegung > 0.0 && zr < 0.9999) { vec4 pc = uPrevVP * vec4(wp, 1.0); vec2 puv = pc.xy / pc.w * 0.5 + 0.5; vec2 vel = (uv - puv) * uBewegung; float l = length(vel); if (l > 0.0005) { vel *= min(1.0, 0.04 / l); vec3 acc = c; for (int i = 1; i < 10; i++) acc += texture2D(tSzene, uv - vel * float(i) / 9.0).rgb; c = acc / 10.0; } }
            // ---- Umgebungsverdeckung (SSAO aus der Tiefe) ----
            if (uAO > 0.0 && zr < 0.9999) { float occ = 0.0; float rad = clamp(0.6 / dist, 0.002, 0.03);
              for (int i = 0; i < 12; i++) { float a = float(i) * 2.399 + h12(uv * 731.0) * 6.28; float rr = rad * (0.3 + 0.7 * fract(float(i) * 0.618)); vec2 o2 = vec2(cos(a), sin(a)) * rr * vec2(1.0, 0.5625);
                float ds = linTiefe(uv + o2); float diff = dist - ds; occ += step(0.03, diff) * smoothstep(1.5, 0.0, diff); }
              c *= 1.0 - clamp(occ / 12.0 * 1.6, 0.0, 1.0) * uAO; }
            // ---- Tiefenschärfe / Tilt-Shift mit Bokeh-Lichtern ----
            if (uUnscharfAn > 0.5) { float coc = 0.0;
              if (uDof > 0.5) coc = clamp(abs(dist - uFokus) / max(0.1, uFokus * uBlende), 0.0, 1.0);
              if (uTilt > 0.0) coc = max(coc, smoothstep(0.08, 0.42, abs(uv.y - uTiltMitte)) * uTilt);
              vec3 bl = texture2D(tUnscharf, uv).rgb;
              if (uBokeh > 0.0 && coc > 0.05) { vec3 bk = vec3(0.0); float rr = coc * 0.022; for (int i = 0; i < 16; i++) { float a = float(i) / 16.0 * 6.2832; bk += texture2D(tB1, uv + vec2(cos(a), sin(a)) * rr * vec2(0.5625, 1.0)).rgb; } bl += bk / 16.0 * uBokeh * 2.0 * coc; }
              c = mix(c, bl, coc); }
            // ---- Höhen-/Tiefennebel mit Lichtstreuung zur Sonne ----
            if (uNebel > 0.0 && brauchtTiefe) { float hf = exp(-max(wp.y, 0.0) / max(0.1, uNebelHoehe)); float f = 1.0 - exp(-dist * 0.02 * uNebel * hf); if (zr >= 0.9999) f = uNebel * 0.25;
              vec3 vd = normalize(wp - uCamWelt[3].xyz); float streu = pow(max(dot(vd, normalize(uSonneDir)), 0.0), 8.0); c = mix(c, uNebelFarbe + uSonnenFarbe * streu * 1.2, clamp(f, 0.0, 1.0)); }
            // ---- Klarheit (lokaler Kontrast) & Schärfe ----
            if (uKlarheit != 0.0 && uUnscharfAn > 0.5) { vec3 bl = texture2D(tUnscharf, uv).rgb; c = max(c + (c - bl) * uKlarheit, 0.0); }
            if (uSchaerfe > 0.0) { vec2 px = 1.0 / uAufl; vec3 nb = texture2D(tSzene, uv + vec2(px.x, 0)).rgb + texture2D(tSzene, uv - vec2(px.x, 0)).rgb + texture2D(tSzene, uv + vec2(0, px.y)).rgb + texture2D(tSzene, uv - vec2(0, px.y)).rgb; c = max(c + (c - nb * 0.25) * uSchaerfe, 0.0); }
            // ---- Bloom, Halation, Lichtstrahlen, Flares, anamorphe Streifen ----
            vec3 b = texture2D(tB1, uv).rgb * 0.5 + texture2D(tB2, uv).rgb * 0.3 + texture2D(tB3, uv).rgb * 0.35; c += b * uBloom;
            if (uHalation > 0.0) c += texture2D(tB3, uv).rgb * vec3(1.0, 0.35, 0.15) * uHalation;
            if (uStrahlen > 0.0 && uSicht > 0.0) c += texture2D(tStrahlen, uv).rgb * uStrahlen * uSicht * 2.5 * uSonnenFarbe; // Strahlen kommen aus eigenem Pass in 1/4-Auflösung
            if (uFlare > 0.0) { vec2 uvf = vec2(1.0) - uv; vec2 gv = (vec2(0.5) - uvf) * 0.34; vec3 fl = vec3(0.0);
              for (int i = 0; i < 5; i++) { vec2 off = fract(uvf + gv * float(i)); float w = pow(1.0 - length(vec2(0.5) - off) / 0.7071, 8.0); vec3 tint = vec3(0.6 + 0.4 * sin(float(i) * 1.7), 0.6 + 0.4 * sin(float(i) * 1.7 + 2.1), 0.6 + 0.4 * sin(float(i) * 1.7 + 4.2)); fl += texture2D(tB3, off).rgb * w * tint; }
              vec2 hv = normalize(gv + 1e-5) * 0.42; float hw = pow(1.0 - length(vec2(0.5) - fract(uvf + hv)) / 0.7071, 6.0); fl += texture2D(tB3, fract(uvf + hv)).rgb * hw * vec3(0.7, 0.8, 1.0) * 0.6; c += fl * uFlare; }
            if (uAnamorph > 0.0) { vec3 an = vec3(0.0); for (int k = -10; k <= 10; k++) an += texture2D(tB2, uv + vec2(float(k) * 0.014, 0.0)).rgb * (1.0 - abs(float(k)) / 11.0); c += an * 0.05 * uAnamorph * vec3(0.45, 0.65, 1.35); }
            // ---- Tonemapping (HDR -> Bild) mit optional weicherem Lichter-Abfall ----
            c *= uTint; vec3 t = aces(c); if (uRolloff > 0.0) { vec3 soft = 1.0 - exp(-c * uBel / 0.6 * 1.3); t = mix(t, soft, uRolloff); } c = t;
            // ---- Farbkorrektur: Lift/Gamma/Gain, Split-Toning, Sättigung, Kontrast, Cross-Processing, Schwarz ----
            c = pow(max(c * uGain + uLift * (1.0 - c), 0.0), 1.0 / uGamma);
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            if (uSplit > 0.0) c = mix(c, c * mix(uSplitSchatten * 1.6, uSplitLicht * 1.25, smoothstep(0.1, 0.8, l)), uSplit);
            if (uKreuz > 0.0) { vec3 k = vec3(smoothstep(0.05, 0.95, c.r), c.g * 1.05 - 0.02 * sin(c.g * 6.28), c.b * 0.8 + 0.12); c = mix(c, k, uKreuz); }
            l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, uSat * (1.0 - uMono)); c = (c - 0.5) * uKon + 0.5;
            c += vec3(-0.3, 0.1, 1.0) * uBlau * (1.0 - smoothstep(0.0, 0.35, l)) * (1.0 - uMono);
            if (uSchwarz > 0.0) c = max(c - uSchwarz, 0.0) / (1.0 - uSchwarz);
            // ---- Stilisierung ----
            if (uKontur > 0.0 && brauchtTiefe) { vec2 px = 2.0 / uAufl; float d0 = dist; float e = abs(linTiefe(uv + vec2(px.x, 0)) - d0) + abs(linTiefe(uv - vec2(px.x, 0)) - d0) + abs(linTiefe(uv + vec2(0, px.y)) - d0) + abs(linTiefe(uv - vec2(0, px.y)) - d0);
              c *= 1.0 - smoothstep(0.04, 0.12, e / max(d0, 0.5)) * uKontur; }
            if (uToon > 0.0) { float st = 4.0; vec3 q = floor(c * st + 0.5) / st; c = mix(c, q, uToon); }
            if (uHalbton > 0.0) { vec2 g = uv * uAufl / 9.0; vec2 f = fract(g) - 0.5; float l2 = dot(c, vec3(0.299, 0.587, 0.114)); float pt = step(length(f), sqrt(1.0 - l2) * 0.62); c = mix(c, mix(vec3(0.96, 0.95, 0.9), c * 0.25, pt), uHalbton); }
            if (uScan > 0.0) { float s = 0.5 + 0.5 * sin(uv.y * uAufl.y * 1.5708); c *= 1.0 - uScan * 0.35 * s; vec2 cc = uv - 0.5; c *= 1.0 - uScan * dot(cc, cc) * 0.9; }
            if (uVHS > 0.0) { float band = step(0.985, fract(uv.y * 3.0 - uZeit * 0.4)); c += (h12(vec2(uv.y * 900.0, uZeit)) - 0.5) * 0.12 * uVHS + band * 0.15 * uVHS; c.r = mix(c.r, texture2D(tSzene, uv + vec2(0.004, 0)).r, uVHS * 0.5); }
            if (uLeck > 0.0) { vec2 p1 = vec2(0.1 + 0.15 * sin(uZeit * 0.3), 0.85); float lk = exp(-length((uv - p1) * vec2(1.4, 0.8)) * 3.0) + 0.6 * exp(-length((uv - vec2(0.95, 0.2 + 0.1 * sin(uZeit * 0.21))) * vec2(1.0, 0.6)) * 4.0); c += vec3(1.0, 0.45, 0.15) * lk * uLeck * 0.6; }
            if (uKratzer > 0.0) { float x = h12(vec2(floor(uZeit * 24.0), 3.1)); float kr = step(abs(uv.x - x), 0.0008) * step(0.6, h12(vec2(floor(uZeit * 24.0), 7.0))); float st = step(0.9993, h12(floor(uv * uAufl / 3.0) + floor(uZeit * 24.0))); c = mix(c, vec3(0.9), (kr * 0.6 + st) * uKratzer); }
            if (uKorn > 0.0) c += (h12(uv * uAufl + fract(uZeit) * 100.0) - 0.5) * 0.08 * uKorn;
            // ---- Vignette ----
            vec2 q = vUv - 0.5; q.x *= 0.5625; c *= 1.0 - uVig * smoothstep(0.25, 0.85, length(q) * 1.25);
            gl_FragColor = vec4(srgb(clamp(c, 0.0, 1.0)), 1.0);
          }`);
        const strahlM = sm({ tB2: { value: stufen[1].a.texture }, tTiefe: { value: tiefeRT.texture }, uSonnePos: { value: new THREE.Vector2() }, uMaske: { value: 0 } }, `#include <packing>
          uniform sampler2D tB2, tTiefe; uniform vec2 uSonnePos; uniform float uMaske; varying vec2 vUv;
          void main(){ vec2 dl = (vUv - uSonnePos) / 48.0; vec2 tc = vUv; float dec = 1.0; vec3 acc = vec3(0.0);
            for (int i = 0; i < 48; i++) { tc -= dl; float hm = uMaske > 0.5 ? step(0.9999, unpackRGBAToDepth(texture2D(tTiefe, tc))) : 1.0; acc += texture2D(tB2, tc).rgb * dec * hm; dec *= 0.962; }
            gl_FragColor = vec4(acc / 48.0, 1.0); }`);
        const pass = (m, ziel) => { quad.material = m; rend.setRenderTarget(ziel); rend.render(qs, qc); };
        const tmp = new THREE.Vector3(), blick = new THREE.Vector3();
        const P = {
          opt, uniforms: U,
          look(name) { const L = LOOKS[name] || LOOKS.neutral; Object.entries(L).forEach(([k, v]) => { if (!U[k]) return; if (Array.isArray(v)) U[k].value.set(...v); else U[k].value = v; }); },
          // vorigeKamera: Matrix (projection * view) des vorigen Frames für Bewegungsunschärfe (optional)
          render(scene, camera, T = 0, vorigeVP = null) {
            U.uZeit.value = T; const h = scene.userData.himmel; if (h) h.dome.position.copy(camera.position);
            (scene.userData.spiegel || []).forEach((sp) => sp.vorRender(rend, scene, camera)); // planare Spiegelungen zuerst
            scene.overrideMaterial = U.uTon.value > 0.5 ? tonM : null; const nS = Math.max(1, Math.min(8, Math.round(U.uSSAA.value)));
            if (nS > 1) { rend.setRenderTarget(akku); rend.setClearColor(0x000000, 1); rend.clear(); const au = rend.shadowMap.autoUpdate; // Supersampling: n leicht versetzte Bilder mitteln (glatte Kanten, auch bei Laub/Schrift)
              for (let i = 0; i < nS; i++) { const j = JITTER[i]; camera.setViewOffset(RW, RH, (j[0] - 0.5), (j[1] - 0.5), RW, RH); rend.setRenderTarget(haupt); rend.render(scene, camera); if (i === 0) rend.shadowMap.autoUpdate = false;
                kopieM.uniforms.tSrc.value = haupt.texture; kopieM.uniforms.uW.value = 1 / nS; quad.material = kopieM; rend.setRenderTarget(akku); const ac = rend.autoClear; rend.autoClear = false; rend.render(qs, qc); rend.autoClear = ac; }
              camera.clearViewOffset(); rend.shadowMap.autoUpdate = au; U.tSzene.value = akku.texture; } else { rend.setRenderTarget(haupt); rend.render(scene, camera); U.tSzene.value = haupt.texture; }
            scene.overrideMaterial = null;
            if (U.uDraht.value > 0) { drahtM.opacity = 0.35 * U.uDraht.value; const ac = rend.autoClear; rend.autoClear = false; const vis = h ? h.dome.visible : true; if (h) h.dome.visible = false; scene.overrideMaterial = drahtM; rend.render(scene, camera); scene.overrideMaterial = null; if (h) h.dome.visible = vis; rend.autoClear = ac; }
            const tiefeNoetig = U.uDof.value > 0.5 || U.uAO.value > 0 || U.uNebel.value > 0 || U.uBewegung.value > 0 || U.uKontur.value > 0;
            if (tiefeNoetig) { const vis = h ? h.dome.visible : true; if (h) h.dome.visible = false; const ohne = [], tausch = []; scene.traverse((o) => { if (!o.visible) return; const m = o.material; if (o.userData.keineTiefe || o.isSprite || o.isPoints || o.isLine || (m && !Array.isArray(m) && m.transparent && !m.depthWrite && !o.userData.tiefeMat)) { ohne.push(o); o.visible = false; return; } if (o.isMesh) { tausch.push([o, m]); o.material = o.userData.tiefeMat || tiefeM; } }); const bg = scene.background; scene.background = null;
              rend.setClearColor(0xffffff, 1); rend.setRenderTarget(tiefeRT); rend.clear(); rend.render(scene, camera); scene.overrideMaterial = null; scene.background = bg; if (h) h.dome.visible = vis; ohne.forEach((o) => (o.visible = true)); tausch.forEach(([o, m]) => (o.material = m)); rend.setClearColor(0x000000, 1);
              U.uNear.value = camera.near; U.uFar.value = camera.far; U.uInvProj.value.copy(camera.projectionMatrixInverse); U.uCamWelt.value.copy(camera.matrixWorld);
              if (vorigeVP) U.uPrevVP.value.copy(vorigeVP); else U.uPrevVP.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); }
            let src = U.tSzene.value;
            stufen.forEach((s, i) => {
              if (i === 0) { hellM.uniforms.tSrc.value = src; pass(hellM, s.a); }
              else { blurM.uniforms.tSrc.value = src; blurM.uniforms.uDir.value.set(0, 0); pass(blurM, s.a); }
              blurM.uniforms.tSrc.value = s.a.texture; blurM.uniforms.uDir.value.set(1 / s.w, 0); pass(blurM, s.b);
              blurM.uniforms.tSrc.value = s.b.texture; blurM.uniforms.uDir.value.set(0, 1 / s.h); pass(blurM, s.a);
              src = s.a.texture;
            });
            if (U.uUnscharfAn.value > 0.5) { blurM.uniforms.tSrc.value = U.tSzene.value; blurM.uniforms.uDir.value.set(0, 0); pass(blurM, unscharf.a);
              for (let k = 0; k < 2; k++) { blurM.uniforms.tSrc.value = unscharf.a.texture; blurM.uniforms.uDir.value.set(1.6 / unscharf.w, 0); pass(blurM, unscharf.b); blurM.uniforms.tSrc.value = unscharf.b.texture; blurM.uniforms.uDir.value.set(0, 1.6 / unscharf.h); pass(blurM, unscharf.a); } }
            if (h) { U.uSonneDir.value.copy(h.sonne); const sf = h.mat.uniforms.uSonnenFarbe.value; U.uSonnenFarbe.value.set(sf.x, sf.y, sf.z).normalize().multiplyScalar(1.2);
              if (U.uStrahlen.value > 0) { camera.getWorldDirection(blick); const dot = blick.dot(h.sonne); tmp.copy(camera.position).addScaledVector(h.sonne, 100).project(camera);
                U.uSonnePos.value.set(tmp.x * 0.5 + 0.5, tmp.y * 0.5 + 0.5); const rand = Math.max(Math.abs(tmp.x), Math.abs(tmp.y)); U.uSicht.value = dot > 0 ? Math.max(0, Math.min(1, (1.6 - rand) / 0.6)) : 0; } }
            if (U.uStrahlen.value > 0 && U.uSicht.value > 0) { strahlM.uniforms.uSonnePos.value.copy(U.uSonnePos.value); strahlM.uniforms.uMaske.value = (U.uDof.value > 0.5 || U.uAO.value > 0 || U.uNebel.value > 0 || U.uBewegung.value > 0 || U.uKontur.value > 0) ? 1 : 0; pass(strahlM, strahlRT); }
            pass(endM, null);
          },
        };
        if (o.look) P.look(o.look); return P;
      }
      // Hitzeflimmern an Weltpunkten (z. B. über Auspuffrohren): hitzePunkte(POST, kamera, [{ pos: Vector3, radius (Bildanteil), staerke }])
      function hitzePunkte(post, cam, punkte) { const v = new THREE.Vector3(); post.uniforms.uHitzePunkte.value.forEach((u, i) => { const p = punkte[i]; if (!p) { u.set(0, 0, 0, 0); return; } v.copy(p.pos).project(cam); const sicht = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2; u.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5, p.radius ?? 0.06, sicht ? (p.staerke ?? 1) : 0); }); }
      // Rack Focus (Schärfeverlagerung): fokusZug(POST, t, { von, nach, start, dauer })
      function fokusZug(post, t, o) { const k = Math.min(1, Math.max(0, (t - (o.start ?? 0)) / (o.dauer ?? 1))); const e = k * k * (3 - 2 * k); post.uniforms.uFokus.value = o.von + (o.nach - o.von) * e; }
      // Benutzung:
      //   const POST = nachbearbeitung(renderer, { bloom: 0.6 });
      //   in renderAt():  POST.render(w.scene, w.camera)   statt renderer.render(...)
      //   Glühende Objekte (Lampen, Feuer, Scheinwerfer) mit Farbwerten > 1 (z. B. color.multiplyScalar(4)) und toneMapped:false -> sie blühen.
      // ===== Tempo-Optimierung (wichtig für 70-s-Videos auf CPU-WebGL) =====
      // tempoOptimieren(W, SHOTS, { zelle, envNurGlanz, hemiPlus, schattenMax (Standard 2048), anisoMax (Standard 2) }) einmal vor dem ersten renderAt aufrufen.
      // 1) Statische Meshes (Matrix und Sichtbarkeit an 5 Probezeiten je Shot unverändert) werden pro Material und Raumzelle verschmolzen: Tausende Draw Calls weniger.
      // 2) envNurGlanz: Die PMREM-Umgebung bekommen nur glänzende/metallische Materialien (spart ~30 % Pixelzeit); hemiPlus hebt dafür das Himmelslicht an.
      function tempoOptimieren(W, SHOTS, o = {}) {
        const zelle = o.zelle ?? 24, std = THREE.Material.prototype.onBeforeCompile, stdBR = THREE.Object3D.prototype.onBeforeRender, szenen = new Map(), stat = { vorher: 0, nachher: 0, env: 0 };
        SHOTS.forEach((sh) => { const w = W[sh.id]; if (!w) return; if (!szenen.has(w.scene)) szenen.set(w.scene, []); szenen.get(w.scene).push([w, sh]); });
        const wert = (src, i, j) => (j === 0 ? src.getX(i) : j === 1 ? src.getY(i) : j === 2 ? src.getZ(i) : src.getW(i));
        szenen.forEach((liste, scene) => {
          const proben = new Map(); let erste = true;
          liste.forEach(([w, sh]) => { for (let k = 0; k <= 4; k++) { const T = sh.t0 + (sh.t1 - sh.t0 - 0.02) * k / 4; wind(T); w.update(T - sh.t0, T); scene.updateMatrixWorld(true);
            scene.traverse((m) => { if (!m.isMesh) return; let sicht = true; for (let p = m; p; p = p.parent) if (!p.visible) { sicht = false; break; }
              const e = proben.get(m); if (!e) proben.set(m, erste ? { mw: m.matrixWorld.clone(), sicht, ok: true } : { ok: false }); else if (e.ok && (!e.mw.equals(m.matrixWorld) || e.sicht !== sicht)) e.ok = false; }); erste = false; } });
          const gruppen = new Map();
          proben.forEach((e, m) => { stat.vorher++; if (!e.ok || !e.sicht) return; const mat = m.material, g = m.geometry;
            if (Array.isArray(mat) || m.isInstancedMesh || m.isSkinnedMesh || m.morphTargetInfluences || mat.isShaderMaterial || mat.transparent || mat.alphaTest > 0 || mat.onBeforeCompile !== std || m.customDepthMaterial || m.userData.tiefeMat || m.userData.keineTiefe || m.userData.dynamisch || m.renderOrder || !g.attributes.normal || m.onBeforeRender !== stdBR) return;
            const c = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld), A = g.attributes;
            const key = mat.id + "|" + (m.castShadow ? 1 : 0) + (m.receiveShadow ? 1 : 0) + (m.frustumCulled ? 1 : 0) + "|" + Math.floor(c.x / zelle) + "," + Math.floor(c.z / zelle) + "|" + ["uv", "uv2", "color", "tangent"].map((a) => (A[a] ? A[a].itemSize : 0)).join("");
            if (!gruppen.has(key)) gruppen.set(key, []); gruppen.get(key).push(m); });
          gruppen.forEach((ms) => { if (ms.length < 2) return; let n = 0;
            const teile = ms.map((m) => { const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); g.applyMatrix4(m.matrixWorld);
              if (m.matrixWorld.determinant() < 0) Object.values(g.attributes).forEach((at) => { for (let i = 0; i + 2 < at.count; i += 3) for (let j = 0; j < at.itemSize; j++) { const a = wert(at, i + 1, j), b = wert(at, i + 2, j); at.array[(i + 1) * at.itemSize + j] = b; at.array[(i + 2) * at.itemSize + j] = a; } });
              n += g.attributes.position.count; return g; });
            const namen = Object.keys(teile[0].attributes).filter((a) => ["position", "normal", "uv", "uv2", "color", "tangent"].includes(a) && teile.every((g) => g.attributes[a] && g.attributes[a].itemSize === teile[0].attributes[a].itemSize));
            const neu = new THREE.BufferGeometry();
            namen.forEach((a) => { const is = teile[0].attributes[a].itemSize, arr = new Float32Array(n * is); let off = 0;
              teile.forEach((g) => { const src = g.attributes[a]; for (let i = 0; i < src.count; i++) for (let j = 0; j < is; j++) arr[(off + i) * is + j] = wert(src, i, j); off += src.count; }); neu.setAttribute(a, new THREE.BufferAttribute(arr, is)); });
            neu.computeBoundingSphere(); neu.computeBoundingBox(); teile.forEach((g) => g.dispose());
            const mesh = new THREE.Mesh(neu, ms[0].material); mesh.castShadow = ms[0].castShadow; mesh.receiveShadow = ms[0].receiveShadow; mesh.frustumCulled = ms[0].frustumCulled; mesh.matrixAutoUpdate = false; mesh.updateMatrix(); scene.add(mesh);
            ms.forEach((m) => m.parent && m.parent.remove(m)); });
          const amax = o.anisoMax ?? 2; scene.traverse((m) => { if (m.isMesh) (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { for (const k in mt) { const t = mt[k]; if (t && t.isTexture && t.anisotropy > amax) { t.anisotropy = amax; t.needsUpdate = true; } } }); });
          const smax = o.schattenMax ?? 2048; scene.traverse((l) => { if (l.isLight && l.shadow && l.shadow.mapSize.x > smax) { l.shadow.mapSize.set(smax, smax); if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; } } });
          let nach = 0; scene.traverse((m) => { if (m.isMesh) nach++; }); stat.nachher += nach;
          if (o.envNurGlanz !== false && scene.environment) { const env = scene.environment; scene.environment = null;
            scene.traverse((m) => { if (!m.isMesh) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { if (mt.isMeshStandardMaterial && !mt.envMap && (mt.metalness > 0.3 || mt.roughness < 0.5 || mt.clearcoat > 0 || mt.transmission > 0)) { mt.envMap = env; mt.needsUpdate = true; stat.env++; } }); });
            scene.traverse((l) => { if (l.isHemisphereLight) l.intensity *= o.hemiPlus ?? 1.6; }); } });
        console.log("tempoOptimieren", JSON.stringify(stat)); return stat; }
