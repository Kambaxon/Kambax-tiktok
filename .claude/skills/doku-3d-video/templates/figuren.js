      // ===== Figuren v5: Herkunft, Kopfformen, genaue Gesichter, Hautstruktur, Schmuck, Trachten, Gangarten =====
      // person(seed, {
      //   kind: "f"|"m", herkunft: "europaeisch"|"afrikanisch"|"asiatisch"|"arabisch"|"suedasiatisch"|"lateinamerikanisch",
      //   alter: "kind"|"jung"|"mittel"|"alt", kopfform: "oval"|"rund"|"eckig"|"herz"|"lang",
      //   stil: "alltag"|"business"|"sport"|"traditionell", kopftuch: bool,
      //   top: "tshirt"|"langarm"|"hemd"|"hoodie"|"pulli", muster: "uni"|"streifen"|"karo"|"punkte"|"dashiki",
      //   unten: "hose"|"shorts"|"rock"|"kleid", schuhe: "sneaker"|"stiefel"|"halbschuh", jacke: bool,
      //   hair: "kurz"|"buzz"|"seitenscheitel"|"pony"|"mittel"|"manbun"|"undercut"|"glatze"|"halbglatze"|"locken"|"afro"|"dreads"|
      //         "lang"|"wellig"|"bob"|"pixie"|"pferdeschwanz"|"dutt"|"zoepfe",
      //   bart: "keiner"|"vollbart"|"dreitage"|"schnurrbart"|"kinnbart", brille, uhr, ringe, schmuck (bool, sonst selten zufällig),
      //   unrein, sommersprossen, behaart (0..1), augenfarbe, oberweite, bauch, farbeOben, farbeUnten, skin, hairColor, scale })
      // userData: hipL, hipR, kneeL, kneeR, shL, shR, elL, elR, head, face, eyes, handL, handR, phase, gang  (idle()/walk() kompatibel)
      const SKIN3 = [0xf6d6bf, 0xeec0a0, 0xe0aa82, 0xc88c64, 0xa86e48, 0x8a5636, 0x6a3e26, 0x4e2c1a];
      const HAIR3 = [0x14100c, 0x2a1c12, 0x4a2e1a, 0x6e4a2a, 0x9a6e3e, 0xc8a464, 0xe2cc98, 0xd8d4cc, 0x8a8682, 0x8e2e1a, 0xb04a24];
      const OBEN3 = [0x2f4f8f, 0xb8352e, 0x3f7d4f, 0xd8a838, 0x5a4a8a, 0x2b2b30, 0xeee8dc, 0x1f6f8b, 0xc8708a, 0x6a5038, 0x8a9aa8, 0xe07a2a, 0x2a6a6a, 0xf2f2f2, 0x9a2a4a];
      const UNTEN3 = [0x283246, 0x353535, 0x4f4232, 0x1f2f46, 0x5a5a5e, 0x6a5a40, 0x3a4a3a, 0x1a1a22, 0x7a6a5a];
      const JACKE3 = [0x2a2e36, 0x4a3a2a, 0x3a4a3a, 0x6a6a70, 0x7a2a22, 0x1e2a44, 0xb89a6a];
      // Herkunft: Hauttöne, Haarfarben, Augenfarben, Gesichtszüge (Faktoren), typische Frisuren
      const HERKUNFT = {
        europaeisch:        { haut: [0xf6d6bf, 0xf2cdb0, 0xeec0a0, 0xe8b898, 0xe0aa82], haar: [0x2a1c12, 0x4a2e1a, 0x6e4a2a, 0x9a6e3e, 0xc8a464, 0xe2cc98, 0x8e2e1a, 0xb04a24], augen: [0x3a6a9a, 0x5a8ab8, 0x4a7a5a, 0x6a7a7a, 0x7a5a2a, 0x4a2e18], nase: [1.0, 1.0, 1.05], lippe: 1.0, lid: 1.0, wange: 1.0, wM: ["kurz", "seitenscheitel", "undercut", "buzz", "mittel", "halbglatze", "pony"], wF: ["lang", "wellig", "bob", "pferdeschwanz", "dutt", "pixie", "zoepfe"] },
        afrikanisch:        { haut: [0x8a5636, 0x7a4a2c, 0x6a3e26, 0x5a3420, 0x4e2c1a, 0x3e2214], haar: [0x0e0a08, 0x14100c, 0x1e1610], augen: [0x2a1608, 0x3a2010, 0x1e1008], nase: [1.38, 0.72, 0.92], lippe: 1.55, lid: 1.0, wange: 1.05, wM: ["buzz", "afro", "dreads", "glatze", "kurz", "locken"], wF: ["afro", "zoepfe", "dreads", "locken", "dutt", "bob"] },
        asiatisch:          { haut: [0xf2d6b8, 0xeccaa6, 0xe4bc96, 0xdab08a], haar: [0x0e0a08, 0x14100c, 0x1e1610, 0x3a2414], augen: [0x2a1608, 0x3a2010, 0x24140a], nase: [1.12, 0.6, 0.9], lippe: 1.05, lid: 0.7, wange: 1.25, wM: ["kurz", "seitenscheitel", "pony", "undercut", "mittel"], wF: ["lang", "bob", "pony", "pferdeschwanz", "dutt", "pixie"] },
        arabisch:           { haut: [0xe2b48c, 0xd8a880, 0xcc9a72, 0xbc8a64], haar: [0x0e0a08, 0x14100c, 0x2a1c12], augen: [0x3a2010, 0x5a3a1a, 0x4a3a1a, 0x5a6a3a], nase: [1.02, 1.3, 1.15], lippe: 1.15, lid: 0.95, wange: 1.05, wM: ["kurz", "seitenscheitel", "undercut", "locken", "buzz"], wF: ["lang", "wellig", "locken", "dutt", "pferdeschwanz"] },
        suedasiatisch:      { haut: [0xbc8458, 0xac764e, 0x9c6a46, 0x8a5c3c], haar: [0x0e0a08, 0x14100c, 0x1e1610], augen: [0x2a1608, 0x3a2010, 0x4a3018], nase: [1.12, 1.0, 1.05], lippe: 1.2, lid: 0.95, wange: 1.0, wM: ["kurz", "seitenscheitel", "locken", "undercut"], wF: ["lang", "zoepfe", "dutt", "wellig", "pferdeschwanz"] },
        lateinamerikanisch: { haut: [0xdcae86, 0xcc9a72, 0xbc8a64, 0xac7a56], haar: [0x14100c, 0x2a1c12, 0x4a2e1a], augen: [0x3a2010, 0x5a3a1a, 0x4a5a3a], nase: [1.12, 0.92, 1.0], lippe: 1.25, lid: 0.95, wange: 1.1, wM: ["kurz", "locken", "undercut", "buzz", "seitenscheitel"], wF: ["lang", "wellig", "locken", "pferdeschwanz", "dutt"] },
      };
      const HERKUNFT_MIX = ["europaeisch", "europaeisch", "europaeisch", "europaeisch", "afrikanisch", "asiatisch", "arabisch", "arabisch", "suedasiatisch", "lateinamerikanisch"];

      const STOFF = {};
      function texStoff(art, farbe2) { // weiß-graue Webstruktur oder farbiges Muster (dann Materialfarbe = Grundfarbe)
        const key = art + (farbe2 ?? ""); if (STOFF[key]) return STOFF[key];
        const t = canvasTex(128, 128, (g) => { const q = rng(art.length * 31 + (farbe2 ?? 0) % 997); g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, 128, 128);
          const c2 = farbe2 != null ? "#" + new THREE.Color(farbe2).getHexString() : "#333";
          if (art === "jeans") { for (let i = -128; i < 256; i += 3) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,255,255,.35" : "0,0,0,.12"})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); }
            for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${q() * 0.25})`; g.fillRect(q() * 128, q() * 128, 1 + q() * 4, 1); } }
          else if (art === "strick") { for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { g.fillStyle = `rgba(0,0,0,${0.04 + q() * 0.05})`; g.fillRect(x, y, 2, 3); } }
          else if (art === "streifen") { g.fillStyle = c2; for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 128, 6); }
          else if (art === "karo") { g.globalAlpha = 0.45; g.fillStyle = c2; for (let i = 0; i < 128; i += 32) { g.fillRect(i, 0, 12, 128); g.fillRect(0, i, 128, 12); } g.globalAlpha = 0.8; g.fillRect(0, 0, 0, 0); for (let i = 0; i < 128; i += 32) { g.fillRect(i + 20, 0, 2, 128); g.fillRect(0, i + 20, 128, 2); } g.globalAlpha = 1; }
          else if (art === "punkte") { g.fillStyle = c2; for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 * 8; x < 128; x += 16) { g.beginPath(); g.arc(x + 4, y + 4, 2.6, 0, 7); g.fill(); } }
          else if (art === "dashiki") { const cs = ["#d8a020", "#1a1a1a", "#c43a2b", "#2a6a3a", "#f2ece0"]; for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { g.fillStyle = cs[(x / 32 + y / 32) % 5]; g.beginPath(); g.moveTo(x + 16, y); g.lineTo(x + 32, y + 16); g.lineTo(x + 16, y + 32); g.lineTo(x, y + 16); g.fill(); g.strokeStyle = "#1a1a1a"; g.lineWidth = 2; g.stroke(); g.fillStyle = cs[(x / 32 + y / 32 + 2) % 5]; g.beginPath(); g.arc(x + 16, y + 16, 5, 0, 7); g.fill(); } }
          if (art !== "jeans") for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.06})`; g.fillRect(q() * 128, q() * 128, 2, 2); } // Webstruktur
        });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); STOFF[key] = t; return t;
      }
      // Haut: Poren (+ Armbehaarung). Gesicht: eigene Karte mit Wangenröte, Augenschatten, Sommersprossen, Unreinheiten, Bartschatten, Falten.
      const HAUT = {};
      function texHaut(skinC, haare = 0) {
        const key = skinC + "_" + Math.round(haare * 4); if (HAUT[key]) return HAUT[key];
        const base = new THREE.Color(skinC);
        const t = canvasTex(128, 128, (g) => { const q = rng(skinC % 9973 + haare * 7); g.fillStyle = "#" + base.getHexString(); g.fillRect(0, 0, 128, 128);
          for (let i = 0; i < 1400; i++) { const v = (q() - 0.5) * 0.08; g.fillStyle = v > 0 ? `rgba(255,240,230,${v})` : `rgba(80,30,20,${-v})`; g.fillRect(q() * 128, q() * 128, 1.5, 1.5); }
          if (haare > 0) { g.strokeStyle = `rgba(30,20,12,${0.18 + haare * 0.25})`; g.lineWidth = 0.7; for (let i = 0; i < 380 * haare; i++) { const x = q() * 128, y = q() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 2, y + 3 + q() * 3); g.stroke(); } } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); HAUT[key] = t; return t;
      }
      function texGesicht(seed, skinC, o, teil) { // UV einer Kugel: Gesichtsmitte u=0.25, oben v=1 (Canvas oben)
        const W = 512, H = 256, base = new THREE.Color(skinC), q = rng(seed * 13 + (teil === "kiefer" ? 5 : 1));
        return canvasTex(W, H, (g) => {
          g.fillStyle = "#" + base.getHexString(); g.fillRect(0, 0, W, H);
          const fx = W * 0.25, dot = (x, y, rad, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); };
          const weich = (x, y, rad, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
          for (let i = 0; i < 6000; i++) { const v = (q() - 0.5) * 0.07; g.fillStyle = v > 0 ? `rgba(255,240,230,${v})` : `rgba(90,40,30,${-v})`; g.fillRect(q() * W, q() * H, 1.4, 1.4); } // Poren
          if (teil !== "kiefer") {
            for (const sx of [-1, 1]) { weich(fx + sx * 44, H * 0.57, 34, `rgba(200,60,60,${o.wangenrot})`); weich(fx + sx * 30, H * 0.45, 26, "rgba(70,35,30,.22)"); weich(fx + sx * 30, H * 0.5, 14, "rgba(60,30,40,.12)"); g.strokeStyle = "rgba(70,35,30,.3)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(fx + sx * 30, H * 0.44, 15, 7, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } // Wangen, Augenhöhlen, Lidfalte
            if (o.sommersprossen) for (let i = 0; i < 140; i++) dot(fx + (q() - 0.5) * 110, H * (0.47 + q() * 0.14), 0.7 + q() * 1.0, `rgba(130,70,30,${0.12 + q() * 0.18})`);
            if (o.falten) { g.strokeStyle = "rgba(70,35,25,.22)"; g.lineWidth = 1.1; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(fx - 40, H * (0.28 + k * 0.03)); g.quadraticCurveTo(fx, H * (0.27 + k * 0.03), fx + 40, H * (0.28 + k * 0.03)); g.stroke(); }
              for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(fx + sx * 34, H * 0.47); g.lineTo(fx + sx * 44, H * (0.44 + k * 0.03)); g.stroke(); g.beginPath(); g.moveTo(fx + sx * 12, H * 0.56); g.quadraticCurveTo(fx + sx * 20, H * 0.63, fx + sx * 18, H * 0.68); g.stroke(); } }
          }
          if (o.unrein) for (let i = 0; i < 10 + q() * 14; i++) { const x = fx + (q() - 0.5) * 120, y = H * (teil === "kiefer" ? 0.45 + q() * 0.3 : 0.3 + q() * 0.4); dot(x, y, 1.2 + q() * 1.6, `rgba(190,60,50,${0.35 + q() * 0.25})`); if (q() < 0.3) dot(x + 2, y + 1, 1, "rgba(110,50,35,.35)"); }
          if (o.bartschatten > 0) { const y0 = teil === "kiefer" ? H * 0.3 : H * 0.62; for (let i = 0; i < 9000 * o.bartschatten; i++) { const x = fx + (q() - 0.5) * (teil === "kiefer" ? 230 : 150), y = y0 + q() * (H * 0.95 - y0); if (teil !== "kiefer" && Math.abs(x - fx) < 14 && y < H * 0.66) continue; g.fillStyle = `rgba(30,24,22,${0.12 + q() * 0.18})`; g.fillRect(x, y, 1.2, 1.2); } }
        });
      }
      function person(seed, o = {}) {
        const r = rng(seed * 7919 + 13), g = new THREE.Group();
        const pick = (a) => a[Math.floor(r() * a.length)], vr = (k = 0.15) => 1 + (r() - 0.5) * 2 * k;
        const S = (c, rough = 0.75, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: rough, metalness: 0 }, extra));
        const kind = o.kind ?? (r() < 0.5 ? "f" : "m"), m = kind === "m";
        const herkunft = o.herkunft ?? pick(HERKUNFT_MIX), H = HERKUNFT[herkunft];
        const alter = o.alter ?? pick(["jung", "jung", "mittel", "mittel", "alt"]), alt = alter === "alt", kindlich = alter === "kind";
        const skinC = o.skin ?? pick(H.haut);
        let hairC = o.hairColor ?? (alt && r() < 0.8 ? pick([0xd8d4cc, 0xb8b4ae, 0x8a8682, 0xeae6e0]) : r() < 0.06 ? pick([0xb04a24, 0x8a5aa0, 0xd8b070]) : pick(H.haar));
        const behaart = o.behaart ?? (m && !kindlich ? (herkunft === "asiatisch" ? r() * 0.3 : r()) : 0);
        const skin = S(0xffffff, 0.55, { map: texHaut(skinC) }), armSkin = behaart > 0.35 ? S(0xffffff, 0.6, { map: texHaut(skinC, behaart) }) : skin;
        const hair = S(hairC, 0.7);
        const stil = o.stil ?? "alltag", trad = stil === "traditionell", business = stil === "business";
        const topType = o.top ?? (business ? "hemd" : stil === "sport" ? pick(["tshirt", "hoodie"]) : pick(m ? ["tshirt", "hemd", "pulli", "hoodie", "langarm", "tshirt"] : ["tshirt", "langarm", "pulli", "hemd", "hoodie", "tshirt"]));
        const unten = o.unten ?? (business ? (m ? "hose" : pick(["hose", "rock"])) : stil === "sport" ? pick(["hose", "shorts"]) : m ? pick(["hose", "hose", "hose", "shorts"]) : pick(["hose", "hose", "rock", "kleid", "shorts"]));
        const topC = o.farbeOben ?? (business ? pick([0xf2f2f0, 0xdce6f2, 0xf2ece4]) : pick(OBEN3));
        const untenC = unten === "kleid" ? topC : (o.farbeUnten ?? (business ? pick([0x22252c, 0x2a3040, 0x3a3a3e]) : pick(UNTEN3)));
        const muster = o.muster ?? (herkunft === "afrikanisch" && trad ? "dashiki" : r() < 0.22 && topType !== "hoodie" && !business ? pick(["streifen", "karo", "punkte"]) : "uni");
        const top = muster === "uni" ? S(topC, 0.8, { map: texStoff(topType === "pulli" ? "strick" : "stoff") }) : S(muster === "dashiki" ? 0xffffff : topC, 0.8, { map: texStoff(muster, muster === "dashiki" ? null : new THREE.Color(topC).offsetHSL(0.5, 0, r() < 0.5 ? 0.3 : -0.3).getHex()) });
        const bottom = S(untenC, 0.85, { map: texStoff(unten === "hose" && !business && r() < 0.6 ? "jeans" : "stoff") });
        const schuhe = o.schuhe ?? (business ? "halbschuh" : stil === "sport" ? "sneaker" : pick(["sneaker", "sneaker", "stiefel", "halbschuh"]));
        const shoeM = S(schuhe === "sneaker" ? pick([0xf2f2f2, 0x2a2a2a, 0x3a5a9a, 0xc43a2b]) : pick([0x1a1a1a, 0x3a2a1e, 0x5a3a28]), schuhe === "halbschuh" ? 0.35 : 0.5);
        // Geschlechtsdimorphismus: Männer breitere Schultern, Frauen breiteres Becken und schmalere Taille
        const wide = (m ? 1.0 + r() * 0.14 : 0.86 + r() * 0.1) * (1 + (o.bauch ?? 0) * 0.1), becken = m ? wide : wide * (1.12 + r() * 0.08);
        const bauch = o.bauch ?? (m && r() < 0.2 ? 0.3 + r() * 0.5 : !m && r() < 0.08 ? 0.3 : 0), oberweite = !m ? (o.oberweite ?? r()) : 0;
        const mk = (geo, mat, x, y, z, parent) => { const ms = new THREE.Mesh(geo, mat); ms.position.set(x, y, z); ms.castShadow = true; ms.receiveShadow = true; (parent || g).add(ms); return ms; };
        const shortLeg = unten === "shorts" || unten === "rock" || unten === "kleid";
        // ---- Beine: Oberschenkel / Knie / Unterschenkel, Schuhe ----
        const hipL = new THREE.Group(), hipR = new THREE.Group(), kneeL = new THREE.Group(), kneeR = new THREE.Group();
        hipL.position.set(-0.095 * becken, 0.9, 0); hipR.position.set(0.095 * becken, 0.9, 0); g.add(hipL, hipR);
        const dunkler = (c, k = -0.07) => new THREE.Color(c).offsetHSL(0, 0, k).getHex();
        const naht = S(unten === "hose" && new THREE.Color(untenC).b > new THREE.Color(untenC).r * 1.3 ? 0xc89048 : dunkler(untenC, -0.12), 0.9); // Jeans: orange Steppnaht
        for (const [hp, kn, aussen] of [[hipL, kneeL, -1], [hipR, kneeR, 1]]) {
          mk(new THREE.SphereGeometry(0.078, 28, 18), bottom, 0, 0, 0, hp); // gleicher Radius wie Oberschenkel -> keine Stufe
          mk(new THREE.CylinderGeometry(0.078, 0.061, 0.44, 28), unten === "rock" || unten === "kleid" ? skin : bottom, 0, -0.22, 0, hp);
          kn.position.y = -0.44; hp.add(kn);
          const kneeMat = unten === "hose" ? bottom : skin;
          mk(new THREE.SphereGeometry(0.0612, 28, 18), kneeMat, 0, 0, 0, kn);
          mk(new THREE.CylinderGeometry(0.06, unten === "hose" ? 0.05 : 0.04, 0.4, 28), kneeMat, 0, -0.2, 0, kn);
          if (!shortLeg) { // Hosen-Details: Seitennaht, Kniefalten, Saum
            box(0.006, 0.43, 0.012, naht, aussen * 0.072, -0.22, 0, hp); box(0.006, 0.38, 0.012, naht, aussen * 0.053, -0.2, 0, kn);
            for (let k = 0; k < 2; k++) { const f = mk(new THREE.TorusGeometry(0.0595 - k * 0.002, 0.0022, 6, 20, Math.PI * 0.7), S(dunkler(untenC, -0.06), 0.9), 0, -0.04 - k * 0.05, 0.002, kn); f.rotation.set(Math.PI / 2 + 0.25 - k * 0.4, 0, 0.5 + k * 0.6); } // weiche Kniefalten
            if (schuhe !== "stiefel") { const saum = mk(new THREE.CylinderGeometry(0.053, 0.054, 0.035, 28, 1, true), S(dunkler(untenC, -0.04), 0.9, { side: THREE.DoubleSide }), 0, -0.385, 0, kn); }
          } else if (unten === "shorts") { const saum = mk(new THREE.CylinderGeometry(0.066, 0.066, 0.03, 28), bottom, 0, -0.44, 0, hp); box(0.006, 0.4, 0.012, naht, aussen * 0.072, -0.22, 0, hp); }
          schuh(kn);
        }
        // Schuhe: Sohle als Fußabdruck-Form, Obermaterial, Zehenkappe, Schnürung, Fersenkappe
        function schuh(kn) {
          const fuss = new THREE.Shape(); fuss.moveTo(0, -0.1);
          fuss.bezierCurveTo(0.05, -0.1, 0.052, -0.02, 0.048, 0.04); fuss.bezierCurveTo(0.054, 0.13, 0.03, 0.175, 0, 0.175);
          fuss.bezierCurveTo(-0.03, 0.175, -0.05, 0.13, -0.046, 0.05); fuss.bezierCurveTo(-0.046, -0.02, -0.05, -0.1, 0, -0.1);
          const dick = schuhe === "sneaker" ? 0.024 : schuhe === "stiefel" ? 0.026 : 0.014;
          const sg = new THREE.ExtrudeGeometry(fuss, { depth: dick, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 16 }); sg.rotateX(Math.PI / 2);
          const sohleM = S(schuhe === "sneaker" ? 0xf4f2ec : 0x1a1614, schuhe === "sneaker" ? 0.6 : 0.7);
          mk(sg, sohleM, 0, -0.432, 0.02, kn);
          if (schuhe !== "sneaker") mk(new THREE.BoxGeometry(0.085, 0.022, 0.06), sohleM, 0, -0.45, -0.06, kn); // Absatz
          const ober = mk(new THREE.CapsuleGeometry(0.047, 0.16, 6, 16), shoeM, 0, -0.415, 0.045, kn); ober.rotation.x = Math.PI / 2; ober.scale.set(1.03, 1, schuhe === "halbschuh" ? 0.62 : 0.72);
          const kappe = mk(new THREE.SphereGeometry(0.046, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), schuhe === "sneaker" ? sohleM : S(dunkler(shoeM.color.getHex(), -0.04), 0.3), 0, -0.432, 0.13, kn); kappe.rotation.x = Math.PI / 2; kappe.scale.set(1.04, 0.9, 0.5);
          box(0.07, 0.04, 0.03, shoeM, 0, -0.395, -0.08, kn); // Fersenkappe
          const lace = S(schuhe === "sneaker" ? 0xf8f8f6 : 0x2a1e16, 0.8);
          for (let k = 0; k < 4; k++) box(0.05 - k * 0.003, 0.006, 0.008, lace, 0, -0.383 - k * 0.006, 0.0 + k * 0.026, kn);
          box(0.03, 0.01, 0.1, S(dunkler(shoeM.color.getHex(), 0.04), 0.8), 0, -0.386, 0.04, kn); // Zunge
          if (schuhe === "sneaker") for (const sx of [-1, 1]) { const st = box(0.004, 0.012, 0.09, S(pick([0x2a2a2a, 0xc43a2b, 0x3a6aa8, 0xd8d8d8]), 0.6), sx * 0.049, -0.41, 0.02, kn); st.rotation.x = -0.35; }
          if (schuhe === "stiefel") { mk(new THREE.CylinderGeometry(0.062, 0.06, 0.2, 20), shoeM, 0, -0.32, 0, kn); for (let k = 0; k < 5; k++) box(0.04, 0.005, 0.006, lace, 0, -0.23 - k * 0.03, 0.06, kn); }
        }
        // ---- Becken, Rumpf, Brust, Bauch ----
        mk(new THREE.CylinderGeometry(0.142 * becken, 0.165 * becken, 0.17, 24), unten === "kleid" ? top : bottom, 0, 0.94, 0).scale.z = 0.64;
        mk(new THREE.SphereGeometry(0.12 * becken, 24, 12), unten === "kleid" || unten === "rock" ? top : bottom, 0, 0.86, 0).scale.set(1, 0.55, 0.62); // Schritt: weicher Übergang zu den Beinen
        if (!m) for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.09, 20, 14), unten === "kleid" ? top : bottom, sx * 0.085 * becken, 0.91, -0.01).scale.set(0.9, 1.1, 0.95); // Hüften
        if (unten === "hose" || unten === "shorts") { // Gesäßtaschen, Hosenschlitz, Gürtel (bei Hemd)
          for (const sx of [-1, 1]) { const ta = box(0.075, 0.07, 0.006, S(dunkler(untenC, -0.05), 0.9), sx * 0.07 * becken, 0.9, -0.1 * becken - (m ? 0 : 0.012), g); ta.rotation.y = Math.PI + sx * 0.3; }
          box(0.006, 0.09, 0.006, naht, 0.012, 0.9, 0.103 * becken, g);
          if (topType === "hemd") { const gu = mk(new THREE.CylinderGeometry(0.147 * becken, 0.149 * becken, 0.035, 24), S(0x2a1e16, 0.45), 0, 1.005, 0); gu.scale.z = 0.66; box(0.04, 0.03, 0.01, M(0xc8c8c0, { metalness: 0.9, roughness: 0.3 }), 0, 1.005, 0.1 * becken, g); }
        }
        const taille = m ? 0.152 * wide : 0.13 * wide;
        const torso = mk(new THREE.CylinderGeometry(0.188 * wide * (m ? 1.04 : 0.95), taille, 0.5, 24), top, 0, 1.24, 0); torso.scale.z = 0.6;
        const shoulders = mk(new THREE.SphereGeometry(0.207 * wide * (m ? 1.04 : 0.95), 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), top, 0, 1.455, 0); shoulders.scale.set(1, 0.44, 0.62);
        if (oberweite > 0.05) { for (const sx of [-1, 1]) { const b = mk(new THREE.SphereGeometry(0.075, 32, 20), top, sx * 0.045 * wide, 1.33, 0.025 + oberweite * 0.022); b.scale.set(0.82, 0.8, 0.95); } }
        if (bauch > 0.15) { const bb = mk(new THREE.SphereGeometry(0.13, 24, 16), top, 0, 1.1, 0.01 + bauch * 0.05); bb.scale.set(1.25 * wide, 1.1, 0.55 + bauch * 0.3); }
        if (unten === "rock" || unten === "kleid") { const sk = mk(new THREE.CylinderGeometry(0.17 * becken, 0.27 * becken, unten === "kleid" ? 0.42 : 0.38, 28, 1, true), bottom, 0, 0.72, 0); sk.scale.z = 0.8; sk.material.side = THREE.DoubleSide; }
        // Oberteil-Details
        const lighter = S(new THREE.Color(topC).offsetHSL(0, 0, 0.1).getHex(), 0.8);
        if (topType === "hemd") {
          for (const sx of [-1, 1]) { const flap = mk(new THREE.BoxGeometry(0.07, 0.05, 0.01), lighter, sx * 0.04, 1.515, 0.075); flap.rotation.z = sx * 0.5; }
          for (let i = 0; i < 5; i++) mk(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), S(0xf2f2ee, 0.4), 0, 1.44 - i * 0.085, 0.118 - i * 0.003).rotation.x = Math.PI / 2;
          if (business && m) { const kr = S(pick([0x7a1a22, 0x1e2a4a, 0x2a2a2e, 0x3a5a3a]), 0.5); mk(new THREE.BoxGeometry(0.03, 0.03, 0.02), kr, 0, 1.5, 0.11); const kb = mk(new THREE.CylinderGeometry(0.032, 0.014, 0.3, 4), kr, 0, 1.34, 0.118); kb.scale.z = 0.25; kb.rotation.y = Math.PI / 4; } // Krawatte
        } else mk(new THREE.TorusGeometry(0.062, 0.015, 8, 20), lighter, 0, 1.53, 0).rotation.x = Math.PI / 2;
        if (topType === "hoodie") {
          const hood = mk(new THREE.SphereGeometry(0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), top, 0, 1.54, -0.09); hood.scale.set(1.1, 0.7, 0.8); hood.rotation.x = -1.2;
          mk(new THREE.BoxGeometry(0.2 * wide, 0.11, 0.02), lighter, 0, 1.07, 0.098 + bauch * 0.05);
          for (const sx of [-1, 1]) mk(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), S(0xeeeeee), sx * 0.03, 1.45, 0.112);
        }
        if (topType === "pulli") for (let i = 0; i < 3; i++) mk(new THREE.TorusGeometry(taille - i * 0.001, 0.008, 6, 24), lighter, 0, 1.0 + i * 0.015, 0).scale.z = 0.62;
        const jacke = o.jacke ?? (business ? true : r() < 0.25);
        let armMat = top;
        if (jacke) {
          const jc = S(business ? untenC : pick(JACKE3), business ? 0.6 : 0.7, { map: texStoff("stoff") });
          const shell = mk(new THREE.CylinderGeometry(0.216 * wide, (taille + 0.025), 0.56, 26, 1, true, Math.PI * 0.6, Math.PI * 1.8), jc, 0, 1.22, 0); shell.scale.z = 0.68; shell.material.side = THREE.DoubleSide;
          for (const sx of [-1, 1]) { const rev = mk(new THREE.BoxGeometry(0.045, 0.2, 0.012), jc, sx * 0.075, 1.42, 0.125); rev.rotation.z = sx * 0.3; }
          if (business) for (let i = 0; i < 2; i++) mk(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 10), S(0x1a1a1a, 0.4), 0.075, 1.12 + i * 0.08, 0.125).rotation.x = Math.PI / 2;
          armMat = jc;
        }
        // Trachten / Kleidung je Herkunft (nur mit stil: "traditionell" oder kopftuch: true)
        const robe = trad && (herkunft === "arabisch" || (herkunft === "suedasiatisch" && m));
        if (robe) { const farbe = herkunft === "arabisch" ? (m ? pick([0xf6f4ee, 0xece6da, 0xd8d2c4]) : 0x18181c) : pick([0xf2ece0, 0xd8c8a0, 0x9ab4c8]);
          const rb = S(farbe, 0.85, { map: texStoff("stoff"), side: THREE.DoubleSide }); const len = herkunft === "arabisch" ? 1.38 : 0.95;
          const kl = mk(new THREE.CylinderGeometry(0.2 * wide, 0.27 * wide, len, 32, 1, true), rb, 0, 1.5 - len / 2, 0); kl.scale.z = 0.72;
          if (m && herkunft === "arabisch") for (let i = 0; i < 4; i++) mk(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), S(0xe8e2d4), 0, 1.47 - i * 0.05, 0.118).rotation.x = Math.PI / 2; }
        // ---- Arme, Ellbogen, Hände mit Fingern ----
        const shX = 0.235 * wide * (m ? 1.04 : 0.95);
        const shL = new THREE.Group(), shR = new THREE.Group(); shL.position.set(-shX, 1.44, 0); shR.position.set(shX, 1.44, 0); g.add(shL, shR);
        const elL = new THREE.Group(), elR = new THREE.Group(); const kurzarm = topType === "tshirt" && !jacke && !robe; const hands = [];
        const armRobe = robe ? S(herkunft === "arabisch" && !m ? 0x18181c : 0xf2ece0, 0.85) : null;
        const uhr = o.uhr ?? r() < 0.22, ringe = o.ringe ?? r() < 0.12, schmuck = o.schmuck ?? (!m ? r() < 0.25 : r() < 0.06);
        const gold = S(pick([0xd8b04a, 0xc8c8cc, 0xe0c070]), 0.25, { metalness: 1 });
        for (const [sh, el, sx] of [[shL, elL, -1], [shR, elR, 1]]) {
          const aM = armRobe || armMat;
          mk(new THREE.SphereGeometry(0.062, 20, 14), aM, 0, 0, 0, sh);
          if (kurzarm) { mk(new THREE.CylinderGeometry(0.064, 0.058, 0.15, 24), aM, 0, -0.075, 0, sh); mk(new THREE.CylinderGeometry(0.05, 0.0465, 0.16, 24), armSkin, 0, -0.22, 0, sh); }
          else mk(new THREE.CylinderGeometry(0.056, 0.047, 0.3, 20), aM, 0, -0.15, 0, sh);
          el.position.y = -0.3; sh.add(el);
          mk(new THREE.SphereGeometry(0.0465, 24, 16), kurzarm ? armSkin : aM, 0, 0, 0, el);
          mk(new THREE.CylinderGeometry(0.046, 0.036, 0.25, 24), kurzarm ? armSkin : aM, 0, -0.125, 0, el);
          if (!kurzarm) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), robe ? aM : lighter, 0, -0.245, 0, el); // Bündchen
          if (uhr && sx < 0) { // Armbanduhr links
            const band = mk(new THREE.TorusGeometry(0.037, 0.007, 6, 24), S(pick([0x2a1e16, 0x1a1a1a, 0x8a8a8e]), 0.5, { metalness: 0.3 }), 0, -0.225, 0, el); band.rotation.x = Math.PI / 2; band.scale.z = 1.4;
            const gh = mk(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 20), gold, sx * 0.04, -0.225, 0, el); gh.rotation.z = Math.PI / 2;
            const zb = mk(new THREE.CircleGeometry(0.013, 20), S(pick([0xf2f0ea, 0x1a1a2a]), 0.2), sx * 0.0445, -0.225, 0, el); zb.rotation.y = sx * Math.PI / 2; }
          if (schmuck && !m && sx > 0 && r() < 0.6) { const ar = mk(new THREE.TorusGeometry(0.036, 0.004, 6, 24), gold, 0, -0.232, 0, el); ar.rotation.x = Math.PI / 2 + 0.2; } // Armreif
          const hand = new THREE.Group(); hand.position.set(0, -0.27, 0.0); el.add(hand);
          mk(new THREE.BoxGeometry(0.06, 0.07, 0.025), skin, 0, -0.03, 0, hand);
          for (let f = 0; f < 4; f++) { const fl = 0.034 + (f === 1 || f === 2 ? 0.008 : 0); const fi = mk(new THREE.CapsuleGeometry(0.0075, fl, 3, 8), skin, -0.021 + f * 0.014, -0.07 - fl / 2, 0.002, hand); fi.rotation.x = 0.25 + (f % 2) * 0.08;
            const ringFinger = sx < 0 ? f === 1 : f === 2;
            if (ringe && ringFinger) { const rg = mk(new THREE.TorusGeometry(0.009, 0.0022, 6, 16), gold, -0.021 + f * 0.014, -0.072, 0.004, hand); rg.rotation.x = Math.PI / 2 + 0.25; } }
          const th = mk(new THREE.CapsuleGeometry(0.0085, 0.03, 3, 8), skin, -sx * 0.034, -0.035, 0.012, hand); th.rotation.z = -sx * 0.7; th.rotation.x = 0.3;
          hand.rotation.y = sx * 0.15; hands.push(hand);
        }
        // ---- Hals, Adamsapfel, Kopf ----
        mk(new THREE.CylinderGeometry(m ? 0.054 : 0.046, m ? 0.06 : 0.052, 0.1, 18), skin, 0, 1.57, 0);
        if (m && !kindlich) mk(new THREE.SphereGeometry(0.013, 10, 8), skin, 0, 1.585, 0.05).scale.set(0.9, 1.3, 0.8);
        if (schmuck && r() < 0.6) { const kette = mk(new THREE.TorusGeometry(0.064, 0.0028, 6, 32), gold, 0, 1.53, 0.012); kette.rotation.x = Math.PI / 2 - 0.35; mk(new THREE.SphereGeometry(0.008, 10, 8), gold, 0, 1.505, 0.072); }
        const head = new THREE.Group(); head.position.set(0, 1.69, 0); g.add(head);
        // Kopfformen + individuelle Proportionen
        const form = o.kopfform ?? pick(["oval", "oval", "rund", "eckig", "herz", "lang"]);
        const KF = { oval: [0.92, 1.1, 1.0, 0.95, 0.82], rund: [0.99, 1.03, 1.0, 1.02, 0.78], eckig: [0.96, 1.06, 0.98, 1.1, 0.86], herz: [0.95, 1.08, 1.0, 0.84, 0.8], lang: [0.87, 1.17, 1.0, 0.9, 0.9] }[form];
        const fac = { wange: H.wange * vr(0.12), nB: H.nase[0] * vr(0.12), nP: H.nase[1] * vr(0.15), nL: H.nase[2] * vr(0.1), lippe: H.lippe * vr(0.15), lid: H.lid * vr(0.06),
          augAbst: 0.043 * vr(0.07), augGr: vr(0.1), mundB: vr(0.12), ohr: vr(0.15), ohrAb: (r() - 0.3) * 0.5, kinn: vr(0.15) };
        const gOpt = { wangenrot: !m ? 0.12 + r() * 0.1 : 0.05 + r() * 0.08, sommersprossen: o.sommersprossen ?? (herkunft === "europaeisch" && r() < 0.15), unrein: o.unrein ?? (!alt && r() < 0.18),
          bartschatten: m && !kindlich ? (behaart > 0.2 ? 0.4 + behaart * 0.6 : 0.2) : 0, falten: alt };
        const faceSkin = S(0xffffff, 0.5, { map: texGesicht(seed, skinC, gOpt, "kopf") }), jawSkin = S(0xffffff, 0.52, { map: texGesicht(seed, skinC, gOpt, "kiefer") });
        const skull = mk(new THREE.SphereGeometry(0.12, 40, 30), faceSkin, 0, 0, 0, head); skull.scale.set(KF[0] * (m ? 1.02 : 0.98) * (0.97 + fac.wange * 0.03), KF[1], KF[2]);
        const jawM = mk(new THREE.SphereGeometry(0.085, 32, 24), jawSkin, 0, -0.05 - (KF[4] - 0.82) * 0.1, 0.012 + (m ? 0.004 : 0) * fac.kinn); jawM.scale.set(KF[3] * (m ? 1.05 : 0.9), KF[4] * (m ? 1.04 : 0.98), 0.92 * fac.kinn); head.add(jawM);
        if (form === "eckig" || m) for (const sx of [-1, 1]) mk(new THREE.SphereGeometry(0.03, 14, 10), jawSkin, sx * 0.06 * KF[3], -0.075, 0.03, head).scale.set(0.8, 1, 1.2); // Kieferwinkel
        // Ohren: Muschel, Krempe, Läppchen; Größe und Abstand variieren
        const ohren = [];
        for (const sx of [-1, 1]) { const og = new THREE.Group(); og.position.set(sx * 0.11 * KF[0], -0.005, -0.005); og.rotation.y = sx * (0.15 + fac.ohrAb * 0.4); og.scale.setScalar(fac.ohr); head.add(og);
          mk(new THREE.SphereGeometry(0.026, 14, 10), skin, sx * 0.004, 0, 0, og).scale.set(0.35, 1, 0.75);
          const krempe = mk(new THREE.TorusGeometry(0.022, 0.0055, 8, 20, Math.PI * 1.3), skin, sx * 0.009, 0.004, -0.002, og); krempe.rotation.set(0, sx * Math.PI / 2, Math.PI * 0.35); krempe.scale.set(1, 1.25, 1);
          mk(new THREE.SphereGeometry(0.009, 10, 8), skin, sx * 0.008, -0.026, 0.004, og);
          mk(new THREE.SphereGeometry(0.008, 8, 6), S(new THREE.Color(skinC).offsetHSL(0, 0, -0.18).getHex(), 0.7), sx * 0.006, 0.0, 0.004, og).scale.set(0.5, 1, 0.8); // Ohröffnung
          ohren.push(og); }
        if (schmuck && !m) for (const og of ohren) { const ring = r() < 0.5; if (ring) { const h2 = mk(new THREE.TorusGeometry(0.009, 0.0016, 6, 16), gold, 0, -0.04, 0.004, og); } else mk(new THREE.SphereGeometry(0.004, 8, 6), gold, 0, -0.03, 0.006, og); }
        // Gesicht: Augen mit Lid, Iris in Herkunfts-Augenfarbe, Nase mit Flügeln und Löchern, Ober-/Unterlippe
        const face = new THREE.Group(); head.add(face);
        const white = S(0xf6f2ec, 0.25), irisC = o.augenfarbe ?? pick(H.augen), iris = S(irisC, 0.25), irisRand = S(new THREE.Color(irisC).multiplyScalar(0.45).getHex(), 0.3), pupil = S(0x050505, 0.15);
        const lidM = faceSkin, eyes = [];
        for (const sx of [-1, 1]) {
          const e = new THREE.Group(); e.position.set(sx * fac.augAbst, 0.02, 0.1); e.scale.setScalar(fac.augGr); face.add(e);
          const ball = new THREE.Group(); ball.scale.y = fac.lid; e.add(ball);
          mk(new THREE.SphereGeometry(0.022, 20, 14), white, 0, 0, 0, ball).scale.set(1.2, 0.95, 0.55);
          mk(new THREE.SphereGeometry(0.0128, 18, 12), irisRand, 0, -0.001, 0.0092, ball).scale.z = 0.42;
          mk(new THREE.SphereGeometry(0.0115, 18, 12), iris, 0, -0.001, 0.0099, ball).scale.z = 0.42;
          mk(new THREE.SphereGeometry(0.0055, 12, 8), pupil, 0, -0.001, 0.0138, ball).scale.z = 0.4;
          mk(new THREE.SphereGeometry(0.0026, 6, 4), S(0xffffff, 0.05), sx * 0.003 + 0.002, 0.004, 0.0152, ball);
          // Oberlid als Hautkappe (bei asiatischer Lidfalte tiefer), unten feine Lidkante
          const wimpern = mk(new THREE.TorusGeometry(0.0192, m ? 0.0014 : 0.002, 6, 22, Math.PI * 0.8), S(m ? 0x3a2a22 : 0x120c0a, 0.6), 0, 0.0, 0.0085, e); wimpern.rotation.set(-0.35, 0, Math.PI * 0.1); wimpern.scale.set(1.22, 0.95 * fac.lid, 1); // Lidkante mit Wimpern
          if (!m) for (let l = 0; l < 4; l++) { const lash = mk(new THREE.BoxGeometry(0.0025, 0.008, 0.0018), S(0x111111), sx * (0.008 + l * 0.0075), 0.018, 0.009, e); lash.rotation.z = sx * (0.25 + l * 0.22); }
          const brow = mk(new THREE.CapsuleGeometry(m ? 0.0062 : 0.0042, 0.038, 4, 10), alt ? S(new THREE.Color(hairC).lerp(new THREE.Color(0xd8d4cc), 0.5).getHex(), 0.9) : hair, sx * (fac.augAbst + 0.002), 0.054 + (m ? -0.002 : 0.004), 0.103, face);
          brow.rotation.z = Math.PI / 2 + sx * -(0.06 + r() * 0.16); brow.scale.z = 0.6;
          eyes.push(e);
        }
        // Nase
        const nb = 0.016 * fac.nB, np = fac.nP, nl = fac.nL;
        const ruecken = mk(new THREE.CapsuleGeometry(0.0085 * (0.85 + nb * 8), 0.04 * nl, 4, 12), faceSkin, 0, 0.012, 0.106 + 0.006 * np, face); ruecken.rotation.x = -0.32 - (np - 1) * 0.15; ruecken.scale.z = 0.8;
        const spitze = mk(new THREE.SphereGeometry(0.011 * (0.9 + (fac.nB - 1) * 0.6), 18, 14), faceSkin, 0, -0.02 * nl, 0.114 + 0.008 * np, face); spitze.scale.set(1.1, 0.9, 0.8);
        for (const sx of [-1, 1]) { mk(new THREE.SphereGeometry(0.0072, 14, 10), faceSkin, sx * nb * 0.78, -0.024 * nl, 0.104 + 0.005 * np, face).scale.set(1, 0.85, 0.9); // Nasenflügel
          mk(new THREE.SphereGeometry(0.0042, 8, 6), S(new THREE.Color(skinC).multiplyScalar(0.35).getHex(), 0.8), sx * nb * 0.45, -0.03 * nl, 0.11 + 0.006 * np, face).scale.set(1.1, 0.5, 0.8); } // Nasenlöcher
        // Mund: Ober- und Unterlippe, Philtrum, Mundwinkel
        const lipC = !m && r() < 0.4 ? pick([0xa8424a, 0x9a4a4a, 0xb85a62, 0x8a4a5a]) : new THREE.Color(skinC).lerp(new THREE.Color(0xa85a5a), 0.35).offsetHSL(0, 0, -0.04).getHex(), lip = S(new THREE.Color(lipC).convertSRGBToLinear(), 0.45); // Hex-Farben wie die Hautkarte (sRGB) behandeln
        const mb = 0.034 * fac.mundB, ld = fac.lippe;
        const ober = mk(new THREE.CapsuleGeometry(0.0038 * ld, mb, 4, 12), lip, 0, -0.0565, 0.105, face); ober.rotation.z = Math.PI / 2; ober.scale.set(1, 1, 0.8);
        const unterL = mk(new THREE.CapsuleGeometry(0.0046 * ld, mb * 0.82, 4, 12), lip, 0, -0.0565 - 0.0082 * ld, 0.103, face); unterL.rotation.z = Math.PI / 2; unterL.scale.set(1, 1, 0.85);
        box(mb * 0.9, 0.0016, 0.004, S(new THREE.Color(lipC).multiplyScalar(0.4).convertSRGBToLinear(), 0.6), 0, -0.0565 - 0.0041 * ld, 0.108, face); // Mundspalte
        // ---- Frisuren ----
        let style = o.hair ?? (kindlich ? pick(m ? ["kurz", "locken", "pony"] : ["pferdeschwanz", "zoepfe", "lang", "bob"]) : pick(m ? H.wM : H.wF));
        if (alt && m && !o.hair && r() < 0.5) style = pick(["halbglatze", "glatze", "kurz"]);
        const kopftuch = o.kopftuch ?? (trad && !m && (herkunft === "arabisch" || herkunft === "afrikanisch"));
        const cap = (thetaLen = 0.47, rot = -0.38, mat = hair) => { const c = mk(new THREE.SphereGeometry(0.127, 32, 18, 0, Math.PI * 2, 0, Math.PI * thetaLen), mat, 0, 0.012, -0.004, head); c.scale.set(0.95 * KF[0] / 0.92, 1.12 * KF[1] / 1.1, 1.04); c.rotation.x = rot; return c; };
        const straehnen = (n, rad, yy, len, dick, mat = hair) => { for (let i = 0; i < n; i++) { const a = Math.PI * 0.15 + (i / (n - 1)) * Math.PI * 1.7; const s2 = mk(new THREE.CapsuleGeometry(dick, len * vr(0.2), 4, 8), mat, Math.cos(a + Math.PI / 2) * rad, yy - len / 2, -Math.sin(a + Math.PI / 2) * rad * 0.9 - 0.01, head); s2.rotation.z = Math.cos(a + Math.PI / 2) * 0.12; } };
        if (!kopftuch) {
          if (style === "kurz") cap(0.47);
          if (style === "buzz") cap(0.5, -0.38, S(new THREE.Color(hairC).lerp(new THREE.Color(skinC), 0.35).getHex(), 0.9));
          if (style === "seitenscheitel") { cap(0.48); const f = mk(new THREE.BoxGeometry(0.17, 0.035, 0.07), hair, 0.012, 0.1, 0.07, head); f.rotation.set(0.35, 0, -0.18); box(0.004, 0.005, 0.1, S(new THREE.Color(hairC).lerp(new THREE.Color(skinC), 0.6).getHex()), -0.04, 0.128, 0.0, head); }
          if (style === "pony") { cap(0.47); const f = mk(new THREE.BoxGeometry(0.19, 0.04, 0.05), hair, 0, 0.1, 0.085, head); f.rotation.x = 0.55; }
          if (style === "mittel") { cap(0.5); straehnen(9, 0.112, 0.02, 0.1, 0.03); }
          if (style === "manbun") { cap(0.48, -0.42); mk(new THREE.SphereGeometry(0.04, 14, 10), hair, 0, 0.11, -0.095, head); }
          if (style === "lang") { cap(0.47); const back = mk(new THREE.CapsuleGeometry(0.1, 0.2, 6, 16), hair, 0, -0.11, -0.06, head); back.scale.set(1.18, 1, 0.55); for (const sx of [-1, 1]) { const side = mk(new THREE.CapsuleGeometry(0.035, 0.16, 4, 10), hair, sx * 0.105, -0.07, 0.0, head); side.rotation.z = sx * 0.08; } }
          if (style === "wellig") { cap(0.47); for (let i = 0; i < 5; i++) for (const sx of [-1, 0, 1]) mk(new THREE.SphereGeometry(0.05, 14, 10), hair, sx * 0.075 + Math.sin(i * 1.7) * 0.012, -0.03 - i * 0.05, -0.07 + (sx ? 0.03 : -0.01), head).scale.set(1, 0.9, 0.7); }
          if (style === "bob") { cap(0.47); const b = mk(new THREE.SphereGeometry(0.135, 26, 14, Math.PI * 0.8, Math.PI * 1.4, Math.PI * 0.25, Math.PI * 0.4), hair, 0, 0.0, -0.01, head); b.scale.set(1.02, 1.0, 1.05); }
          if (style === "pixie") { cap(0.47); const f = mk(new THREE.SphereGeometry(0.05, 12, 8), hair, 0.04, 0.09, 0.08, head); f.scale.set(1.4, 0.5, 0.8); }
          if (style === "pferdeschwanz") { cap(0.47); mk(new THREE.SphereGeometry(0.03, 10, 8), hair, 0, 0.06, -0.12, head); const pt = mk(new THREE.CapsuleGeometry(0.035, 0.18, 4, 12), hair, 0, -0.06, -0.16, head); pt.rotation.x = 0.25; }
          if (style === "dutt") { cap(0.47); mk(new THREE.SphereGeometry(0.055, 16, 12), hair, 0, 0.1, -0.1, head); }
          if (style === "zoepfe") { cap(0.47); for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) mk(new THREE.SphereGeometry(0.019 - i * 0.0008, 10, 8), hair, sx * 0.085, -0.06 - i * 0.032, -0.05 + i * 0.006, head).scale.set(1, 1.2, 1); }
          if (style === "dreads") { cap(0.5); straehnen(16, 0.115, 0.06, 0.2, 0.013); }
          if (style === "locken" || style === "afro") { const n = style === "afro" ? 56 : 30, R = style === "afro" ? 0.15 : 0.12; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, b = r() * (style === "afro" ? 1.25 : 1.0); mk(new THREE.SphereGeometry((style === "afro" ? 0.045 : 0.035) + r() * 0.015, 10, 8), hair, Math.sin(b) * Math.cos(a) * R, 0.03 + Math.cos(b) * R * 0.95, Math.sin(b) * Math.sin(a) * R - 0.03, head); } }
          if (style === "undercut") { const c = cap(0.3, -0.25); c.scale.set(0.9, 1.25, 1.0); const top2 = mk(new THREE.BoxGeometry(0.12, 0.05, 0.2), hair, 0, 0.13, 0.0, head); top2.rotation.x = -0.15; const side = cap(0.5, -0.38, S(new THREE.Color(hairC).lerp(new THREE.Color(skinC), 0.55).getHex(), 0.9)); side.scale.multiplyScalar(0.985); }
          if (style === "halbglatze") { const ring = mk(new THREE.SphereGeometry(0.128, 32, 14, 0, Math.PI * 2, Math.PI * 0.28, Math.PI * 0.24), hair, 0, 0.0, -0.01, head); ring.scale.set(0.97 * KF[0] / 0.92, 1.1, 1.04); ring.rotation.x = -0.5; }
          if (style === "glatze") { const c = cap(0.3, -0.38, S(new THREE.Color(skinC).offsetHSL(0, 0, -0.03).getHex(), 0.35)); }
        } else { // Kopftuch (Hidschab bzw. Gele) – Gesicht bleibt frei
          const tuchC = herkunft === "afrikanisch" ? 0xffffff : pick([0x1a1a22, 0x2a3a5a, 0x6a2a3a, 0xd8ccb8, 0x3a5a4a, 0x8a6a8a]);
          const tuch = S(tuchC, 0.8, { map: texStoff(herkunft === "afrikanisch" ? "dashiki" : "stoff"), side: THREE.DoubleSide });
          if (herkunft === "afrikanisch") { const gl = mk(new THREE.SphereGeometry(0.15, 22, 14), tuch, 0, 0.1, -0.03, head); gl.scale.set(1.05, 0.8, 1); const k2 = mk(new THREE.TorusGeometry(0.11, 0.035, 10, 24), tuch, 0, 0.06, -0.01, head); k2.rotation.x = Math.PI / 2 + 0.3; }
          else { const h1 = mk(new THREE.SphereGeometry(0.138, 30, 20, Math.PI * 0.71, Math.PI * 1.58), tuch, 0, 0.0, -0.004, head); h1.scale.set(KF[0] / 0.92, 1.12, 1.06);
            const drape = mk(new THREE.CylinderGeometry(0.1, 0.25 * wide, 0.28, 28, 1, true), tuch, 0, -0.17, -0.01, head); drape.scale.z = 0.75;
            const rahmen = mk(new THREE.TorusGeometry(0.1, 0.012, 8, 28, Math.PI * 1.25), tuch, 0, -0.005, 0.07, head); rahmen.rotation.z = -Math.PI * 0.125 + Math.PI / 2 - Math.PI * 0.5; rahmen.scale.set(0.95, 1.25, 1); }
        }
        // Kopfbedeckung arabischer Männer (Ghutra mit Agal)
        if (trad && m && herkunft === "arabisch") { const gt = S(r() < 0.5 ? 0xf6f4ee : 0xffffff, 0.8, { map: r() < 0.5 ? texStoff("karo", 0xc82a2a) : texStoff("stoff"), side: THREE.DoubleSide });
          const gh = mk(new THREE.SphereGeometry(0.14, 28, 18, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.62), gt, 0, 0.01, -0.005, head); gh.scale.set(1.0, 1.15, 1.05);
          const ru = mk(new THREE.CylinderGeometry(0.13, 0.2, 0.32, 26, 1, true, Math.PI * 0.75, Math.PI * 1.5), gt, 0, -0.17, -0.02, head); ru.scale.z = 0.8;
          const agal = mk(new THREE.TorusGeometry(0.115, 0.011, 8, 28), S(0x111111, 0.6), 0, 0.085, -0.01, head); agal.rotation.x = Math.PI / 2 + 0.2; }
        if (trad && herkunft === "afrikanisch" && m && r() < 0.5) mk(new THREE.CylinderGeometry(0.115, 0.12, 0.07, 24), S(0xffffff, 0.8, { map: texStoff("dashiki") }), 0, 0.11, -0.01, head); // Kufi
        // ---- Bärte ----
        const bart = o.bart ?? (m && !kindlich ? pick(herkunft === "asiatisch" ? ["keiner", "keiner", "keiner", "schnurrbart"] : herkunft === "arabisch" ? ["vollbart", "dreitage", "vollbart", "kinnbart", "keiner"] : ["keiner", "keiner", "vollbart", "dreitage", "schnurrbart", "kinnbart"]) : "keiner");
        const bartM = alt ? S(new THREE.Color(hairC).lerp(new THREE.Color(0xd8d4cc), 0.5).getHex(), 0.85) : hair;
        if (bart === "vollbart") { const b = mk(new THREE.SphereGeometry(0.094, 24, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), bartM, 0, -0.035, 0.022, head); b.scale.set(KF[3] * 1.05, 0.98, 1.02); const sb = mk(new THREE.CapsuleGeometry(0.008, 0.04, 4, 8), bartM, 0, -0.047, 0.11, face); sb.rotation.z = Math.PI / 2; }
        if (bart === "dreitage") { const b = mk(new THREE.SphereGeometry(0.0885, 24, 16, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.42), S(new THREE.Color(skinC).lerp(new THREE.Color(hairC), 0.4).getHex(), 0.9, { transparent: true, opacity: 0.55 }), 0, -0.05, 0.016, head); b.scale.set(KF[3] * 1.06, 0.86, 0.94); }
        if (bart === "schnurrbart") for (const sx of [-1, 1]) { const b = mk(new THREE.CapsuleGeometry(0.0055, 0.022, 4, 8), bartM, sx * 0.012, -0.046, 0.108, face); b.rotation.z = Math.PI / 2 + sx * 0.25; b.scale.z = 0.7; }
        if (bart === "kinnbart") { mk(new THREE.SphereGeometry(0.03, 14, 10), bartM, 0, -0.112, 0.075, head).scale.set(1, 1.2, 0.8); const m2 = mk(new THREE.CapsuleGeometry(0.007, 0.04, 4, 8), bartM, 0, -0.047, 0.108, face); m2.rotation.z = Math.PI / 2; }
        if (o.brille ?? (r() < (alt ? 0.45 : 0.16))) { const gm = S(pick([0x1a1a1a, 0x6a4a2a, 0xb8b8c0]), 0.3, { metalness: 0.4 }); for (const sx of [-1, 1]) { mk(new THREE.TorusGeometry(0.024, 0.0032, 6, 20), gm, sx * fac.augAbst, 0.018, 0.115, face); mk(new THREE.CircleGeometry(0.023, 20), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12, envMapIntensity: 2 }), sx * fac.augAbst, 0.018, 0.115, face); const b2 = box(0.003, 0.003, 0.1, gm, sx * 0.068, 0.02, 0.07, face); } mk(new THREE.BoxGeometry(0.026, 0.004, 0.004), gm, 0, 0.022, 0.117, face); }
        if (kindlich) head.scale.setScalar(1.28);
        const sc = o.scale ?? (kindlich ? 0.5 + r() * 0.14 : m ? 0.96 + r() * 0.12 : 0.9 + r() * 0.1) * (herkunft === "asiatisch" ? 0.97 : 1);
        g.scale.setScalar(sc);
        // Gangart: jeder Mensch geht anders (Schrittweite, Tempo, Wippen, Armschwung, Hüftschwung, Vorneigung, leichtes Hinken)
        const gang = { schritt: (m ? 0.42 : 0.38) * vr(0.2) * (alt ? 0.75 : 1), tempo: vr(0.15) * (alt ? 0.75 : 1), wippen: 0.028 * vr(0.45), arm: (m ? 0.8 : 0.7) * vr(0.3) * (alt ? 0.6 : 1),
          huefte: m ? 0.01 + r() * 0.015 : 0.03 + r() * 0.04, vor: alt ? 0.12 + r() * 0.12 : r() * 0.05, hinken: r() < 0.06 ? 0.3 : 0, kopfnick: 0.03 * vr(0.5) };
        g.userData = { hipL, hipR, kneeL, kneeR, shL, shR, elL, elR, head, face, eyes, handL: hands[0], handR: hands[1], phase: r() * 6.28, r, gang, herkunft, kind, alter, style };
        return g;
      }
      function idle(p, t) { // Atmen, Gewicht verlagern, Blinzeln, Blick - nie synchron
        const u = p.userData, k = t * 1.3 + u.phase;
        u.shL.rotation.x = Math.sin(k) * 0.05; u.shR.rotation.x = -Math.sin(k * 0.9) * 0.05;
        u.elL.rotation.x = -0.12 - Math.sin(k * 0.7) * 0.04; u.elR.rotation.x = -0.12 - Math.cos(k * 0.6) * 0.04;
        u.head.rotation.y = Math.sin(k * 0.4) * 0.25; u.head.rotation.x = (u.gang ? u.gang.vor * 0.5 : 0) + Math.sin(k * 0.33) * 0.04; p.rotation.z = Math.sin(k * 0.5) * 0.012;
        const blink = ((t + u.phase) % 3.7) < 0.12; u.eyes.forEach((e) => (e.scale.y = blink ? 0.1 : 1));
      }
      function walk(p, t, speed = 1) {
        const u = p.userData, G = u.gang || { schritt: 0.45, tempo: 1, wippen: 0.03, arm: 0.8, huefte: 0.015, vor: 0, hinken: 0, kopfnick: 0.03 };
        const k = t * 6 * speed * G.tempo + u.phase, s = Math.sin(k), a = s * G.schritt * (1 + (s > 0 ? G.hinken * 0.5 : -G.hinken * 0.3));
        u.hipL.rotation.x = a; u.hipR.rotation.x = -a; u.kneeL.rotation.x = Math.max(0, -Math.cos(k)) * 0.65 * (G.schritt / 0.42); u.kneeR.rotation.x = Math.max(0, Math.cos(k)) * 0.65 * (G.schritt / 0.42);
        u.shL.rotation.x = -s * G.arm * 0.5; u.shR.rotation.x = s * G.arm * 0.5; u.shL.rotation.z = -0.04; u.shR.rotation.z = 0.04;
        u.elL.rotation.x = -0.25 - Math.max(0, -s) * 0.45 * G.arm; u.elR.rotation.x = -0.25 - Math.max(0, s) * 0.45 * G.arm;
        u.head.rotation.x = G.vor * 0.6 + Math.sin(k * 2) * G.kopfnick; u.head.rotation.y = Math.sin(k) * 0.04;
        hoehe(p, Math.abs(Math.cos(k)) * G.wippen); p.rotation.z = Math.sin(k) * G.huefte;
        const blink = ((t + u.phase) % 3.9) < 0.12; u.eyes.forEach((e) => (e.scale.y = blink ? 0.1 : 1));
      }
      // Wippen beim Gehen auf die Grundhöhe addieren (auch wenn die Szene y jedes Frame neu setzt, z. B. auf Gelände/Gehweg)
      function hoehe(p, dy) { const u = p.userData; const base = u.lastY !== undefined && Math.abs(p.position.y - u.lastY) < 1e-9 ? u.lastBase : p.position.y; p.position.y = base + dy; u.lastBase = base; u.lastY = p.position.y; }


      // ---------- Requisiten & Posen ----------
      function regenschirm(p, farbe = 0x1e2a44) { // Schirm über dem Kopf, rechte Hand am Griff
        const u = p.userData, g = new THREE.Group(); p.add(g); const stoff = new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.55, side: THREE.DoubleSide });
        const dachS = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.26, 8, 1, true), stoff); dachS.position.set(0.1, 2.08, 0.12); dachS.castShadow = true; g.add(dachS);
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const rip = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.66, 4), new THREE.MeshStandardMaterial({ color: 0x2a2a2a })); rip.position.set(0.1 + Math.cos(a) * 0.3, 2.0, 0.12 + Math.sin(a) * 0.3); rip.rotation.set(Math.sin(a) * 1.15, 0, -Math.cos(a) * 1.15); g.add(rip); }
        const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6), new THREE.MeshStandardMaterial({ color: 0x9a9ea2, metalness: 0.7 })); stock.position.set(0.1, 1.62, 0.12); g.add(stock);
        const griff = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x3a2418 })); griff.position.set(0.1, 1.11, 0.12); griff.rotation.z = Math.PI; g.add(griff);
        u.pose = "schirm"; return g;
      }
      function zigarette(p) { // in der rechten Hand, glühende Spitze; rauchen(p,t) hebt sie zum Mund
        const u = p.userData, c = new THREE.Group(); u.handR.add(c); c.position.set(0.012, -0.075, 0.02);
        const papier = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.06, 6), new THREE.MeshStandardMaterial({ color: 0xf4f2ec })); papier.rotation.z = Math.PI / 2; c.add(papier);
        const glut = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff5a1a, toneMapped: false })); glut.position.x = 0.032; c.add(glut);
        u.zig = { c, glut }; u.pose = "rauchen"; return c;
      }
      function pose(p, t) { // nach idle()/walk() aufrufen
        const u = p.userData;
        if (u.pose === "schirm") { u.shR.rotation.x = -0.75; u.shR.rotation.z = 0.25; u.elR.rotation.x = -1.25; }
        if (u.pose === "rauchen") { const zug = Math.max(0, Math.sin((t + u.phase) * 0.9)) ** 6; u.shR.rotation.x = -0.4 - 0.95 * zug; u.shR.rotation.z = 0.12 + 0.2 * zug; u.elR.rotation.x = -1.2 - 0.95 * zug; u.zig.glut.material.color.setHSL(0.04, 1, 0.45 + 0.2 * zug); }
        if (u.pose === "handy") { u.shR.rotation.x = -0.5; u.elR.rotation.x = -1.3; u.head.rotation.x = 0.45; }
      }
      function handy(p) { const u = p.userData; const h = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.008), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x4a7aaa, emissiveIntensity: 0.6 })); u.handR.add(h); h.position.set(0, -0.09, 0.03); h.rotation.x = -0.6; u.pose = "handy"; return h; }
      function rennen(p, t, speed = 1.6) { walk(p, t, speed); const u = p.userData; u.shL.rotation.x *= 1.4; u.shR.rotation.x *= 1.4; hoehe(p, Math.abs(Math.cos(t * 6 * speed * (u.gang ? u.gang.tempo : 1) + u.phase)) * 0.07); }
