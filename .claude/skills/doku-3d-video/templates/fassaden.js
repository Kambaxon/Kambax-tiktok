      // ===== Fassaden v1: realistische Hochhäuser (braucht: rng, box, cyl, M, SOFT; Reflexionen über scene.environment) =====
      // hochhaus(seed, { typ: "glas"|"beton"|"ziegel"|"platte"|"modern", w, d, etagen, licht (Anteil heller Fenster 0..1), nacht (bool) })
      // Fassade = Canvas-Karten pro Seite (Farbe, Leuchten, Rauheit/Metall) + echte Geometrie (Geschossbänder, Lisenen, Balkone, Dach, Lobby).
      const FASS = {
        glas:   { glas: ["#2c4a66", "#2f5a58", "#5a4a3a", "#5e6874", "#3a4658", "#24384c"], rahmen: ["#2a2e33", "#9aa2aa", "#3c4248", "#c8ccd0"], eh: 3.7, bay: 1.6 },
        beton:  { wand: ["#b9b4aa", "#a6a49e", "#c8c2b4", "#8e8c88", "#cfc8b8"], glas: ["#2a3640", "#33404a"], rahmen: ["#3a3e44", "#d8d8d4"], eh: 3.5, bay: 1.5 },
        ziegel: { wand: ["#8a3e2a", "#9a5236", "#6e3426", "#a8664a", "#7a4a3a", "#5a4038"], glas: ["#28323a"], rahmen: ["#f0ece4", "#2a2a2a", "#4a5a4a"], eh: 3.3, bay: 2.4 },
        platte: { wand: ["#d8cdb4", "#c4c8c4", "#e0d4b0", "#cdbfa8", "#b8c0c8", "#d8c8c0"], akzent: ["#c87a3a", "#4a7a9a", "#8aa04a", "#b84a3a", "#d8b03a"], glas: ["#2a343c"], rahmen: ["#f2f0ea", "#8a6a4a"], eh: 2.8, bay: 3.0 },
        modern: { wand: ["#ecebe6", "#3a3d42", "#d8d4cc", "#5a5e64", "#f2efe8"], glas: ["#2a3a46", "#30404c"], rahmen: ["#2a2c30", "#e8e8e4"], holz: ["#9a6a40", "#b08050", "#7a5232"], eh: 3.2, bay: 2.8 },
      };
      const RAUM = ["#ffd9a0", "#ffcf8a", "#ffe6c0", "#fff0dc", "#d8e6ff", "#ffc878", "#ffe0b0"]; // Lichtfarben der Zimmer

      function fassadenKarten(seed, typ, w, etagen, o) {
        const P = FASS[typ], r = rng(seed), eh = P.eh, bays = Math.max(2, Math.round(w / P.bay));
        const bw = Math.max(8, Math.min(Math.round(40 * (o.aufl ?? 1)), Math.floor(1024 / bays))), fh = Math.min(Math.round(bw * eh / (w / bays)), Math.floor(2048 / etagen));
        const W = bays * bw, H = etagen * fh;
        const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
        const cA = mk(), cE = mk(), cR = mk(); const a = cA.getContext("2d"), e = cE.getContext("2d"), q = cR.getContext("2d");
        const pick = (arr) => arr[Math.floor(r() * arr.length)];
        const wand = o.wand || (P.wand ? pick(P.wand) : pick(P.rahmen)), glas = o.glasFarbe || pick(P.glas), rahmen = pick(P.rahmen);
        const akzent = P.akzent ? pick(P.akzent) : null, holz = P.holz ? pick(P.holz) : null;
        e.fillStyle = "#000"; e.fillRect(0, 0, W, H);
        // Rauheit (G) / Metall (B): Wand rau, nicht metallisch
        const rm = (rough, metal) => `rgb(0,${Math.round(rough * 255)},${Math.round(metal * 255)})`;
        q.fillStyle = rm(typ === "glas" ? 0.35 : 0.9, typ === "glas" ? 0.8 : 0); q.fillRect(0, 0, W, H);
        // Wandstruktur
        a.fillStyle = wand; a.fillRect(0, 0, W, H);
        for (let i = 0; i < W * H / 40; i++) { const v = (r() - 0.5) * 0.08; a.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; a.fillRect(r() * W, r() * H, 2, 2); }
        if (typ === "ziegel") { a.strokeStyle = "rgba(40,24,18,.35)"; a.lineWidth = 1; const zh = fh / 12; for (let y = 0; y < H; y += zh) { a.beginPath(); a.moveTo(0, y); a.lineTo(W, y); a.stroke(); for (let x = ((y / zh) % 2) * zh; x < W; x += zh * 2) { a.beginPath(); a.moveTo(x, y); a.lineTo(x, y + zh); a.stroke(); } }
          for (let i = 0; i < W * H / 900; i++) { a.fillStyle = `rgba(${r() < 0.5 ? "60,20,10" : "200,140,110"},${0.08 + r() * 0.12})`; a.fillRect(r() * W, Math.floor(r() * H / zh) * zh, zh * 2, zh); } }
        if (typ === "platte") { a.strokeStyle = "rgba(60,56,50,.45)"; a.lineWidth = 1.5; for (let y = 0; y <= H; y += fh) { a.beginPath(); a.moveTo(0, y); a.lineTo(W, y); a.stroke(); } for (let x = 0; x <= W; x += bw) { a.beginPath(); a.moveTo(x, 0); a.lineTo(x, H); a.stroke(); }
          if (akzent) { a.fillStyle = akzent; const sp = Math.floor(r() * bays); for (let y = 0; y < H; y += fh) a.fillRect(sp * bw + 2, y + 2, bw - 4, fh - 4); } }
        // Schmutz-/Regenspuren von oben nach unten
        for (let i = 0; i < bays * 1.5; i++) { const x = r() * W, l = H * (0.1 + r() * 0.5), y0 = r() * H * 0.6; const gr = a.createLinearGradient(0, y0, 0, y0 + l); gr.addColorStop(0, "rgba(30,28,24,0)"); gr.addColorStop(0.3, "rgba(30,28,24,.08)"); gr.addColorStop(1, "rgba(30,28,24,0)"); a.fillStyle = gr; a.fillRect(x, y0, 2 + r() * bw * 0.4, l); }

        // Ein Fenster: Glas (Tag mit Himmelsspiegelung + Innenraum-Ahnung), nachts beleuchtetes Zimmer
        const fensterZ = (x, y, fw, fhh, teil = 1) => {
          const an = r() < (o.licht ?? 0.35), raum = pick(RAUM), vorhang = r(), jal = r() < 0.3 ? r() * 0.7 : 0, tv = r() < 0.06;
          const gr = a.createLinearGradient(0, y, 0, y + fhh); gr.addColorStop(0, "#9aaabb"); gr.addColorStop(0.45, glas); gr.addColorStop(1, glas); a.fillStyle = gr; a.fillRect(x, y, fw, fhh);
          // schräge Spiegelstreifen
          a.save(); a.beginPath(); a.rect(x, y, fw, fhh); a.clip(); a.fillStyle = "rgba(255,255,255,.08)"; a.beginPath(); a.moveTo(x + fw * 0.2, y); a.lineTo(x + fw * 0.45, y); a.lineTo(x + fw * 0.1, y + fhh); a.lineTo(x - fw * 0.15, y + fhh); a.fill(); a.restore();
          if (vorhang < 0.5) { a.fillStyle = "rgba(230,220,200,.28)"; a.fillRect(x + 1, y + 1, fw * 0.22, fhh - 2); a.fillRect(x + fw * 0.78 - 1, y + 1, fw * 0.22, fhh - 2); }
          if (jal) { a.fillStyle = "rgba(210,210,205,.55)"; a.fillRect(x, y, fw, fhh * jal); }
          q.fillStyle = rm(0.04, 0.55); q.fillRect(x, y, fw, fhh);
          if (an) {
            const ge = e.createLinearGradient(0, y, 0, y + fhh); const c = new THREE.Color(tv ? "#8ab0ff" : raum);
            ge.addColorStop(0, "#" + c.clone().multiplyScalar(1.0).getHexString()); ge.addColorStop(1, "#" + c.clone().multiplyScalar(0.55).getHexString());
            e.fillStyle = ge; e.fillRect(x, y, fw, fhh);
            // Deckenlampe als heller Fleck
            const lx = x + fw * (0.3 + r() * 0.4), rg = e.createRadialGradient(lx, y + fhh * 0.15, 0, lx, y + fhh * 0.15, fw * 0.6); rg.addColorStop(0, "rgba(255,250,235,.9)"); rg.addColorStop(1, "rgba(255,250,235,0)"); e.fillStyle = rg; e.fillRect(x, y, fw, fhh);
            // Möbel-Silhouetten
            e.fillStyle = "rgba(20,12,6,.55)"; if (r() < 0.6) e.fillRect(x + fw * r() * 0.5, y + fhh * 0.62, fw * (0.25 + r() * 0.3), fhh * 0.38); if (r() < 0.3) e.fillRect(x + fw * (0.6 + r() * 0.2), y + fhh * 0.25, fw * 0.12, fhh * 0.75);
            if (vorhang < 0.5) { e.fillStyle = "rgba(60,40,20,.45)"; e.fillRect(x + 1, y + 1, fw * 0.22, fhh - 2); e.fillRect(x + fw * 0.78 - 1, y + 1, fw * 0.22, fhh - 2); }
            if (jal) { e.fillStyle = "rgba(0,0,0,.55)"; for (let k = 0; k < fhh * jal; k += 3) e.fillRect(x, y + k, fw, 1.4); }
          }
          // Rahmen + Sprossen
          a.strokeStyle = rahmen; a.lineWidth = Math.max(1.5, fw * 0.06); a.strokeRect(x, y, fw, fhh); e.strokeStyle = "#000"; e.lineWidth = a.lineWidth; e.strokeRect(x, y, fw, fhh);
          for (let k = 1; k < teil; k++) { const xx = x + fw * k / teil; a.beginPath(); a.moveTo(xx, y); a.lineTo(xx, y + fhh); a.stroke(); e.beginPath(); e.moveTo(xx, y); e.lineTo(xx, y + fhh); e.stroke(); }
          q.strokeStyle = rm(0.5, typ === "glas" ? 0.8 : 0.2); q.lineWidth = a.lineWidth; q.strokeRect(x, y, fw, fhh);
        };

        for (let f = 0; f < etagen; f++) {
          const y = H - (f + 1) * fh; if (f === 0 && o.lobby !== false) continue; // Erdgeschoss = Lobby-Geometrie
          for (let b = 0; b < bays; b++) {
            const x = b * bw;
            if (typ === "glas") { fensterZ(x + 1, y + fh * 0.2, bw - 2, fh * 0.8 - 1, 1); a.fillStyle = new THREE.Color(glas).lerp(new THREE.Color(0x8a929a), 0.5).getStyle(); a.fillRect(x + 1, y + 1, bw - 2, fh * 0.2 - 1); q.fillStyle = rm(0.3, 0.6); q.fillRect(x + 1, y + 1, bw - 2, fh * 0.2 - 1); }
            else if (typ === "beton") fensterZ(x + bw * 0.04, y + fh * 0.3, bw * 0.92, fh * 0.5, 2);
            else if (typ === "ziegel") { const fw = bw * 0.46, fx = x + (bw - fw) / 2, fy = y + fh * 0.22; fensterZ(fx, fy, fw, fh * 0.58, 2); a.fillStyle = "rgba(220,210,190,.9)"; a.fillRect(fx - 2, fy + fh * 0.58, fw + 4, fh * 0.05); a.fillStyle = "rgba(70,30,20,.6)"; a.fillRect(fx - 2, fy - fh * 0.06, fw + 4, fh * 0.06); }
            else if (typ === "platte") { fensterZ(x + bw * 0.12, y + fh * 0.28, bw * 0.34, fh * 0.48, 2); fensterZ(x + bw * 0.56, y + fh * 0.28, bw * 0.32, fh * 0.48, 1); }
            else if (typ === "modern") { const breit = (b + f) % 3 !== 0; if (breit) fensterZ(x + bw * 0.06, y + fh * 0.06, bw * 0.88, fh * 0.84, 3); else { fensterZ(x + bw * 0.3, y + fh * 0.06, bw * 0.4, fh * 0.84, 1); if (holz) { a.fillStyle = holz; for (let k = 0; k < 8; k++) { a.fillRect(x + bw * 0.03 + k * bw * 0.032, y + 2, bw * 0.02, fh - 4); a.fillRect(x + bw * 0.73 + k * bw * 0.032, y + 2, bw * 0.02, fh - 4); } } } }
          }
        }
        const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); t.encoding = srgb ? THREE.sRGBEncoding : THREE.LinearEncoding; t.anisotropy = 8; return t; };
        return { map: tex(cA, true), emissiveMap: tex(cE, true), rm: tex(cR, false), bays, fh, wand, rahmen, glas, akzent };
      }

      function hochhaus(seed, o = {}) {
        const r = rng(seed * 71 + 5), typ = o.typ || ["glas", "beton", "ziegel", "platte", "modern"][Math.floor(r() * 5)], P = FASS[typ];
        const w = o.w ?? 18 + Math.floor(r() * 14), d = o.d ?? 14 + Math.floor(r() * 8), etagen = o.etagen ?? 8 + Math.floor(r() * 18), eh = P.eh, H = etagen * eh;
        const g = new THREE.Group(); const nacht = !!o.nacht;
        const front = fassadenKarten(seed * 3 + 1, typ, w, etagen, o), seite = fassadenKarten(seed * 3 + 2, typ, d, etagen, Object.assign({}, o, { wand: front.wand, glasFarbe: front.glas, aufl: (o.aufl ?? 1) * 0.6 }));
        const mat = (k) => new THREE.MeshStandardMaterial({ map: k.map, emissiveMap: k.emissiveMap, emissive: 0xffffff, emissiveIntensity: nacht ? (o.leuchten ?? 1.6) : 0,
          roughnessMap: k.rm, metalnessMap: k.rm, roughness: 1, metalness: 1, envMapIntensity: o.spiegel ?? 1.0 });
        const mF = mat(front), mS = mat(seite), mDach = M(0x6a6a68, { roughness: 0.95 });
        const korpus = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [mS, mS, mDach, mDach, mF, mF]); korpus.position.y = H / 2; korpus.castShadow = korpus.receiveShadow = true; g.add(korpus);
        const wandM = M(new THREE.Color(front.wand).getHex(), { roughness: 0.85 }), rahmenM = M(new THREE.Color(front.rahmen).getHex(), { roughness: 0.4, metalness: typ === "glas" ? 0.8 : 0.1 });
        const inst = (geo, m, list) => { if (!list.length) return; const im = new THREE.InstancedMesh(geo, m, list.length); const mm = new THREE.Matrix4(), qq = new THREE.Quaternion();
          list.forEach((p, i) => { qq.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p[3] || 0); mm.compose(new THREE.Vector3(p[0], p[1], p[2]), qq, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, mm); }); im.castShadow = false; im.receiveShadow = true; g.add(im); return im; }; // kein Schattenwurf -> keine Treppen-Akne an dünnen Platten
        // Seiten: +z vorne, -z hinten, ±x
        const seiten = [[0, d / 2, 0, w], [0, -d / 2, Math.PI, w], [w / 2, 0, Math.PI / 2, d], [-w / 2, 0, -Math.PI / 2, d]];
        const auf = (s, u, y, n) => { const [cx, cz, ry] = s; const c = Math.cos(ry), sn = Math.sin(ry); return [cx + u * c + n * sn, y, cz - u * sn + n * c, ry]; };
        // Geschossbänder / Lisenen als echte Geometrie (Licht und Schatten auf der Fassade)
        const baender = [], lisenen = [];
        for (const s of seiten) {
          const L = s[3], bays = Math.max(2, Math.round(L / P.bay));
          if (typ === "glas" || typ === "beton" || typ === "modern") for (let f = 1; f <= etagen; f++) baender.push(auf(s, 0, f * eh - (typ === "glas" ? 0.02 : 0.1), 0.06));
          if (typ === "glas") for (let b = 0; b <= bays; b++) lisenen.push(auf(s, -L / 2 + b * L / bays, H / 2, 0.08));
          if (typ === "ziegel") for (let b = 0; b <= bays; b += 2) lisenen.push(auf(s, -L / 2 + b * L / bays, H / 2, 0.06));
        }
        // Bänder brauchen je Seite die passende Länge: zwei Instanz-Sätze
        const bandGeo = (L) => new THREE.BoxGeometry(L + 0.24, typ === "glas" ? 0.08 : 0.22, typ === "glas" ? 0.12 : 0.3);
        inst(bandGeo(w), typ === "glas" ? rahmenM : wandM, baender.filter((b) => Math.abs(Math.cos(b[3])) > 0.5));
        inst(bandGeo(d), typ === "glas" ? rahmenM : wandM, baender.filter((b) => Math.abs(Math.cos(b[3])) <= 0.5));
        inst(new THREE.BoxGeometry(typ === "glas" ? 0.08 : 0.35, H, typ === "glas" ? 0.16 : 0.12), typ === "glas" ? rahmenM : wandM, lisenen);
        // Balkone (Platte: Loggien mit Brüstung, Modern: Glasgeländer)
        if (typ === "platte" || typ === "modern") {
          const plat = [], bru = [], s0 = seiten[0], bays = Math.max(2, Math.round(w / P.bay)); const glasG = new THREE.MeshPhysicalMaterial({ color: 0x9ab4c4, roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.35, depthWrite: false });
          for (let f = 1; f < etagen; f++) for (let b = 0; b < bays; b++) { if (typ === "platte" ? b % 2 !== 0 : (b + f) % 3 !== 0) continue; const u = -w / 2 + (b + 0.5) * w / bays; plat.push(auf(s0, u, f * eh + 0.05, 0.7)); bru.push(auf(s0, u, f * eh + 0.6, 1.36)); }
          inst(new THREE.BoxGeometry(w / bays * 0.92, 0.16, 1.4), wandM, plat);
          inst(new THREE.BoxGeometry(w / bays * 0.92, 1.0, 0.06), typ === "platte" ? M(new THREE.Color(front.akzent || front.wand).offsetHSL(0, 0, -0.05).getHex(), { roughness: 0.8 }) : glasG, bru);
        }
        // Lobby: hohes Glas-Erdgeschoss mit Türen, Vordach, Hausnummer-Licht
        if (o.lobby !== false) {
          const lob = new THREE.MeshStandardMaterial({ color: 0x1e2830, roughness: 0.05, metalness: 0.7, emissive: nacht ? 0xffd8a0 : 0x000000, emissiveIntensity: nacht ? 0.6 : 0 });
          box(w - 0.6, eh - 0.4, 0.06, lob, 0, (eh - 0.4) / 2 + 0.1, d / 2 + 0.03, g);
          for (let k = 0; k <= 6; k++) box(0.08, eh - 0.4, 0.1, rahmenM, -w / 2 + 0.3 + k * (w - 0.6) / 6, (eh - 0.4) / 2 + 0.1, d / 2 + 0.06, g);
          box(w * 0.4, 0.18, 2.2, M(0x2e3236, { metalness: 0.6, roughness: 0.4 }), 0, eh - 0.2, d / 2 + 1.1, g);
          if (nacht && o.lobbyLicht) { const l = new THREE.PointLight(0xffd0a0, 1.2, 10, 2); l.position.set(0, eh - 0.6, d / 2 + 1.5); g.add(l); }
          box(w + 0.1, 0.3, d + 0.1, M(0x5a5a58, { roughness: 0.9 }), 0, 0.15, 0, g); // Sockel
        }
        // Dach: Attika, Technik, Antenne mit Blinklicht
        const atM = typ === "glas" ? rahmenM : wandM;
        box(w + 0.2, 0.9, 0.25, atM, 0, H + 0.45, d / 2, g); box(w + 0.2, 0.9, 0.25, atM, 0, H + 0.45, -d / 2, g); box(0.25, 0.9, d, atM, w / 2, H + 0.45, 0, g); box(0.25, 0.9, d, atM, -w / 2, H + 0.45, 0, g);
        const tech = M(0x8a8e92, { metalness: 0.5, roughness: 0.5 });
        for (let i = 0; i < 2 + Math.floor(r() * 4); i++) { const bw = 1.5 + r() * 3; box(bw, 1 + r() * 2, 1.5 + r() * 2, tech, (r() - 0.5) * (w - bw - 2), H + 1, (r() - 0.5) * (d - 4), g); }
        if (r() < 0.5) { const tk = cyl(1.2, 1.2, 2.4, M(0x6a5a4a, { roughness: 0.8 }), w * 0.25, H + 1.5, -d * 0.2, g, 20); }
        let blink = null;
        if (etagen > 14 || o.antenne) { cyl(0.06, 0.12, 8, M(0xd8d8d8, { metalness: 0.6 }), -w * 0.2, H + 4, 0, g, 8);
          blink = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a1a).multiplyScalar(4), toneMapped: false })); blink.position.set(-w * 0.2, H + 8.1, 0); g.add(blink); }
        g.userData = { w, d, H, typ, mats: [mF, mS], update(t) { if (blink) blink.visible = (t + seed * 0.37) % 1.6 < 0.5; },
          nacht(k) { [mF, mS].forEach((m) => (m.emissiveIntensity = k * (o.leuchten ?? 1.6))); } };
        return g;
      }

      // Skyline-Füller für den Hintergrund (billig: Kisten mit Fenster-Leuchtkarte, ohne Geometrie-Details)
      function skyline(s, n, seed, o = {}) {
        const r = rng(seed), grp = new THREE.Group(); s.add(grp); const list = [];
        for (let i = 0; i < n; i++) { const typ = ["glas", "beton", "platte", "modern"][Math.floor(r() * 4)];
          const h = hochhaus(seed * 100 + i, Object.assign({ typ, w: 14 + r() * 16, d: 12 + r() * 10, etagen: 6 + Math.floor(r() * (o.max ?? 26)), lobby: false }, o));
          const a = (o.a0 ?? -0.6) + ((o.a1 ?? 0.6) - (o.a0 ?? -0.6)) * (i + r() * 0.6) / n, R = (o.r0 ?? 90) + r() * (o.r1 ?? 60);
          h.position.set(Math.sin(a) * R + (o.x ?? 0), 0, -Math.cos(a) * R + (o.z ?? 0)); h.rotation.y = -a + (r() - 0.5) * 0.3; grp.add(h); list.push(h); }
        return { grp, list, update(t) { list.forEach((h) => h.userData.update(t)); } };
      }
