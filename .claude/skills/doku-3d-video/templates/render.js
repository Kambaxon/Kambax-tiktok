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

      // HDR-Nachbearbeitung: Szene linear in HalfFloat-MSAA-Ziel, Bloom (3 Stufen), ACES, Farbkorrektur, Vignette.
      // Optionen (alle optional, 0 = aus): strahlen (Lichtstrahlen durch Wolken/Gebäude), flare (Linsenreflexe), anamorph (horizontale Lichtstreifen),
      //   tiefe: { fokus: Meter, blende: 0.2..2 } (Tiefenschärfe mit Bokeh-Unschärfe), tiltshift: 0..1 (Miniatur-Look), tiltMitte: 0..1 (Bildhöhe der Schärfe)
      // Zur Laufzeit änderbar: POST.uniforms.uFokus.value = ..., POST.uniforms.uStrahlen.value = ...
      function nachbearbeitung(rend = renderer, o = {}) {
        const Wd = 1080, Ht = 1920;
        const opt = Object.assign({ bloom: 0.55, schwelle: 1.0, belichtung: rend.toneMappingExposure || 0.62, saettigung: 1.08, kontrast: 1.05,
          vignette: 0.28, tint: [1, 1, 1], schattenBlau: 0.012, samples: 4, strahlen: 0, flare: 0, anamorph: 0, tiltshift: 0, tiltMitte: 0.45 }, o);
        const mk = (w, h, s = 0, typ = THREE.HalfFloatType, tiefe = false) => new THREE.WebGLRenderTarget(w, h, { type: typ, samples: s, depthBuffer: s > 0 || tiefe, stencilBuffer: s > 0 || tiefe, // mit Stencil -> 24-bit-Tiefe statt 16 bit (sonst Treppen an Kanten)
          minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
        const haupt = mk(Wd, Ht, opt.samples);
        const stufen = [2, 4, 8].map((f) => ({ a: mk(Wd / f, Ht / f), b: mk(Wd / f, Ht / f), w: Wd / f, h: Ht / f }));
        const brauchtUnschaerfe = !!opt.tiefe || opt.tiltshift > 0;
        const unscharf = brauchtUnschaerfe ? { a: mk(Wd / 3, Ht / 3), b: mk(Wd / 3, Ht / 3), w: Wd / 3, h: Ht / 3 } : null;
        const tiefeRT = opt.tiefe ? mk(Wd / 2, Ht / 2, 0, THREE.UnsignedByteType, true) : null;
        const tiefeM = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false;
        const qs = new THREE.Scene(); qs.add(quad); const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const sm = (u, fs) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS_QUAD, fragmentShader: fs, depthTest: false, depthWrite: false, toneMapped: false });
        const hellM = sm({ tSrc: { value: null }, uS: { value: opt.schwelle } }, `
          uniform sampler2D tSrc; uniform float uS; varying vec2 vUv;
          void main(){ vec3 c = texture2D(tSrc, vUv).rgb; float l = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(c * smoothstep(uS, uS * 1.6, l), 1.0); }`);
        const blurM = sm({ tSrc: { value: null }, uDir: { value: new THREE.Vector2() } }, `
          uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
          void main(){ vec3 c = texture2D(tSrc, vUv).rgb * 0.227027;
            c += texture2D(tSrc, vUv + uDir * 1.3846).rgb * 0.3162162; c += texture2D(tSrc, vUv - uDir * 1.3846).rgb * 0.3162162;
            c += texture2D(tSrc, vUv + uDir * 3.2308).rgb * 0.0702703; c += texture2D(tSrc, vUv - uDir * 3.2308).rgb * 0.0702703;
            gl_FragColor = vec4(c, 1.0); }`);
        const tO = opt.tiefe || {};
        const endM = sm({
          tSzene: { value: haupt.texture }, tB1: { value: stufen[0].a.texture }, tB2: { value: stufen[1].a.texture }, tB3: { value: stufen[2].a.texture },
          tUnscharf: { value: unscharf ? unscharf.a.texture : null }, tTiefe: { value: tiefeRT ? tiefeRT.texture : null },
          uBloom: { value: opt.bloom }, uBel: { value: opt.belichtung }, uSat: { value: opt.saettigung }, uKon: { value: opt.kontrast },
          uVig: { value: opt.vignette }, uTint: { value: new THREE.Vector3(...opt.tint) }, uBlau: { value: opt.schattenBlau },
          uStrahlen: { value: opt.strahlen }, uFlare: { value: opt.flare }, uAnamorph: { value: opt.anamorph }, uSonnePos: { value: new THREE.Vector2(0.5, 0.8) }, uSicht: { value: 0 },
          uTilt: { value: opt.tiltshift }, uTiltMitte: { value: opt.tiltMitte }, uDof: { value: opt.tiefe ? 1 : 0 }, uFokus: { value: tO.fokus ?? 10 }, uBlende: { value: tO.blende ?? 0.6 },
          uNear: { value: 0.1 }, uFar: { value: 400 }, uUnscharfAn: { value: brauchtUnschaerfe ? 1 : 0 },
        }, `
          #include <packing>
          uniform sampler2D tSzene, tB1, tB2, tB3, tUnscharf, tTiefe; uniform float uBloom, uBel, uSat, uKon, uVig, uBlau, uStrahlen, uFlare, uAnamorph, uSicht, uTilt, uTiltMitte, uDof, uFokus, uBlende, uNear, uFar, uUnscharfAn;
          uniform vec3 uTint; uniform vec2 uSonnePos; varying vec2 vUv;
          vec3 fit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
          vec3 aces(vec3 c){
            const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
            const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
            c *= uBel / 0.6; return clamp(O * fit(I * c), 0.0, 1.0); }
          vec3 srgb(vec3 c){ return mix(pow(c, vec3(0.41666)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }
          void main(){
            vec3 c = texture2D(tSzene, vUv).rgb;
            // Tiefenschärfe / Tilt-Shift: Mischung mit vorgefilterter, unscharfer Szene
            if (uUnscharfAn > 0.5) { float coc = 0.0;
              if (uDof > 0.5) { float tz = unpackRGBAToDepth(texture2D(tTiefe, vUv)); float dist = -perspectiveDepthToViewZ(tz, uNear, uFar); coc = clamp(abs(dist - uFokus) / max(0.1, uFokus * uBlende), 0.0, 1.0); }
              if (uTilt > 0.0) coc = max(coc, smoothstep(0.08, 0.42, abs(vUv.y - uTiltMitte)) * uTilt);
              c = mix(c, texture2D(tUnscharf, vUv).rgb, coc); }
            vec3 b = texture2D(tB1, vUv).rgb * 0.5 + texture2D(tB2, vUv).rgb * 0.3 + texture2D(tB3, vUv).rgb * 0.35;
            c += b * uBloom;
            // Lichtstrahlen (radiale Unschärfe der hellen Bereiche zur Sonne hin)
            if (uStrahlen > 0.0 && uSicht > 0.0) { vec2 dl = (vUv - uSonnePos) / 48.0; vec2 tc = vUv; float dec = 1.0; vec3 acc = vec3(0.0);
              for (int i = 0; i < 48; i++) { tc -= dl; acc += texture2D(tB2, tc).rgb * dec; dec *= 0.962; } c += acc / 48.0 * uStrahlen * uSicht * 2.5; }
            // Linsenreflexe (Geister + Halo, gespiegelt durch die Bildmitte)
            if (uFlare > 0.0) { vec2 uvf = vec2(1.0) - vUv; vec2 gv = (vec2(0.5) - uvf) * 0.34; vec3 fl = vec3(0.0);
              for (int i = 0; i < 5; i++) { vec2 off = fract(uvf + gv * float(i)); float w = pow(1.0 - length(vec2(0.5) - off) / 0.7071, 8.0);
                vec3 tint = vec3(0.6 + 0.4 * sin(float(i) * 1.7), 0.6 + 0.4 * sin(float(i) * 1.7 + 2.1), 0.6 + 0.4 * sin(float(i) * 1.7 + 4.2)); fl += texture2D(tB3, off).rgb * w * tint; }
              vec2 hv = normalize(gv + 1e-5) * 0.42; float hw = pow(1.0 - length(vec2(0.5) - fract(uvf + hv)) / 0.7071, 6.0); fl += texture2D(tB3, fract(uvf + hv)).rgb * hw * vec3(0.7, 0.8, 1.0) * 0.6;
              c += fl * uFlare; }
            // Anamorphe Streifen (horizontal, leicht blau)
            if (uAnamorph > 0.0) { vec3 an = vec3(0.0); for (int k = -10; k <= 10; k++) an += texture2D(tB2, vUv + vec2(float(k) * 0.014, 0.0)).rgb * (1.0 - abs(float(k)) / 11.0);
              c += an * 0.05 * uAnamorph * vec3(0.45, 0.65, 1.35); }
            c *= uTint;
            c = aces(c);
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            c = mix(vec3(l), c, uSat);
            c = (c - 0.5) * uKon + 0.5;
            c += vec3(-0.3, 0.1, 1.0) * uBlau * (1.0 - smoothstep(0.0, 0.35, l));
            vec2 q = vUv - 0.5; q.x *= 0.5625;
            c *= 1.0 - uVig * smoothstep(0.25, 0.85, length(q) * 1.25);
            gl_FragColor = vec4(srgb(clamp(c, 0.0, 1.0)), 1.0);
          }`);
        const pass = (m, ziel) => { quad.material = m; rend.setRenderTarget(ziel); rend.render(qs, qc); };
        const tmp = new THREE.Vector3(), blick = new THREE.Vector3();
        return {
          opt, uniforms: endM.uniforms,
          render(scene, camera) {
            const h = scene.userData.himmel; if (h) h.dome.position.copy(camera.position);
            rend.setRenderTarget(haupt); rend.render(scene, camera);
            if (tiefeRT && endM.uniforms.uDof.value > 0.5) { const vis = h ? h.dome.visible : true; if (h) h.dome.visible = false; const bg = scene.background; scene.background = null; scene.overrideMaterial = tiefeM;
              rend.setClearColor(0xffffff, 1); rend.setRenderTarget(tiefeRT); rend.clear(); rend.render(scene, camera); scene.overrideMaterial = null; scene.background = bg; if (h) h.dome.visible = vis; rend.setClearColor(0x000000, 1);
              endM.uniforms.uNear.value = camera.near; endM.uniforms.uFar.value = camera.far; }
            let src = haupt.texture;
            stufen.forEach((s, i) => {
              if (i === 0) { hellM.uniforms.tSrc.value = src; pass(hellM, s.a); }
              else { blurM.uniforms.tSrc.value = src; blurM.uniforms.uDir.value.set(0, 0); pass(blurM, s.a); }
              blurM.uniforms.tSrc.value = s.a.texture; blurM.uniforms.uDir.value.set(1 / s.w, 0); pass(blurM, s.b);
              blurM.uniforms.tSrc.value = s.b.texture; blurM.uniforms.uDir.value.set(0, 1 / s.h); pass(blurM, s.a);
              src = s.a.texture;
            });
            if (unscharf && endM.uniforms.uUnscharfAn.value > 0.5) { blurM.uniforms.tSrc.value = haupt.texture; blurM.uniforms.uDir.value.set(0, 0); pass(blurM, unscharf.a);
              for (let k = 0; k < 2; k++) { blurM.uniforms.tSrc.value = unscharf.a.texture; blurM.uniforms.uDir.value.set(1.6 / unscharf.w, 0); pass(blurM, unscharf.b); blurM.uniforms.tSrc.value = unscharf.b.texture; blurM.uniforms.uDir.value.set(0, 1.6 / unscharf.h); pass(blurM, unscharf.a); } }
            // Sonnenposition auf dem Bildschirm (für Strahlen); ausblenden, wenn hinter der Kamera oder weit außerhalb
            if (h && (endM.uniforms.uStrahlen.value > 0)) { camera.getWorldDirection(blick); const dot = blick.dot(h.sonne); tmp.copy(camera.position).addScaledVector(h.sonne, 100).project(camera);
              endM.uniforms.uSonnePos.value.set(tmp.x * 0.5 + 0.5, tmp.y * 0.5 + 0.5); const rand = Math.max(Math.abs(tmp.x), Math.abs(tmp.y)); endM.uniforms.uSicht.value = dot > 0 ? Math.max(0, Math.min(1, (1.6 - rand) / 0.6)) : 0; }
            pass(endM, null);
          },
        };
      }
      // Benutzung:
      //   const POST = nachbearbeitung(renderer, { bloom: 0.6 });
      //   in renderAt():  POST.render(w.scene, w.camera)   statt renderer.render(...)
      //   Glühende Objekte (Lampen, Feuer, Scheinwerfer) mit Farbwerten > 1 (z. B. color.multiplyScalar(4)) und toneMapped:false -> sie blühen.
