      // ===== Figuren v3: Gesichter, Finger, Kleidung, Frisuren, Bärte, Körperformen =====
      // person(seed, {
      //   kind: "f"|"m", top: "tshirt"|"langarm"|"hemd"|"hoodie"|"pulli", unten: "hose"|"shorts"|"rock"|"kleid",
      //   schuhe: "sneaker"|"stiefel"|"halbschuh", jacke: bool, hair: "kurz"|"seitenscheitel"|"pony"|"lang"|"dutt"|"locken"|"glatze"|"pferdeschwanz"|"bob"|"afro"|"undercut",
      //   bart: "keiner"|"vollbart"|"dreitage"|"schnurrbart"|"kinnbart", brille: bool, oberweite: 0..1, bauch: 0..1,
      //   farbeOben, farbeUnten, skin, hairColor, scale })
      // userData: hipL, hipR, kneeL, kneeR, shL, shR, elL, elR, head, face, eyes, phase  (idle()/walk() kompatibel)
      const SKIN3 = [0xf6d6bf, 0xeec0a0, 0xe0aa82, 0xc88c64, 0xa86e48, 0x8a5636, 0x6a3e26, 0x4e2c1a];
      const HAIR3 = [0x14100c, 0x2a1c12, 0x4a2e1a, 0x6e4a2a, 0x9a6e3e, 0xc8a464, 0xe2cc98, 0xd8d4cc, 0x8a8682, 0x8e2e1a, 0xb04a24];
      const OBEN3 = [0x2f4f8f, 0xb8352e, 0x3f7d4f, 0xd8a838, 0x5a4a8a, 0x2b2b30, 0xeee8dc, 0x1f6f8b, 0xc8708a, 0x6a5038, 0x8a9aa8, 0xe07a2a, 0x2a6a6a, 0xf2f2f2, 0x9a2a4a];
      const UNTEN3 = [0x283246, 0x353535, 0x4f4232, 0x1f2f46, 0x5a5a5e, 0x6a5a40, 0x3a4a3a, 0x1a1a22, 0x7a6a5a];
      const JACKE3 = [0x2a2e36, 0x4a3a2a, 0x3a4a3a, 0x6a6a70, 0x7a2a22, 0x1e2a44, 0xb89a6a];
      const STOFF = {};
      function texStoff(art) { // weiß-graue Webstruktur, wird mit der Kleidungsfarbe multipliziert
        if (STOFF[art]) return STOFF[art];
        const t = canvasTex(128, 128, (g) => { const q = rng(art.length * 31); g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, 128, 128);
          if (art === "jeans") { for (let i = -128; i < 256; i += 3) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,255,255,.35" : "0,0,0,.12"})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); }
            for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${q() * 0.25})`; g.fillRect(q() * 128, q() * 128, 1 + q() * 4, 1); } }
          else if (art === "strick") { for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { g.fillStyle = `rgba(0,0,0,${0.04 + q() * 0.05})`; g.fillRect(x, y, 2, 3); } }
          else { for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.07})`; g.fillRect(q() * 128, q() * 128, 2, 2); } }
        });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); STOFF[art] = t; return t;
      }
      function person(seed, o = {}) {
        const r = rng(seed * 7919 + 13), g = new THREE.Group();
        const pick = (a) => a[Math.floor(r() * a.length)];
        const S = (c, rough = 0.75, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: rough, metalness: 0 }, extra));
        const kind = o.kind ?? (r() < 0.5 ? "f" : "m");
        const skinC = o.skin ?? pick(SKIN3), hairC = o.hairColor ?? pick(HAIR3);
        const skin = S(skinC, 0.55), hair = S(hairC, 0.85);
        const topType = o.top ?? pick(kind === "f" ? ["tshirt", "langarm", "pulli", "hemd", "hoodie", "tshirt"] : ["tshirt", "hemd", "pulli", "hoodie", "langarm", "tshirt"]);
        const unten = o.unten ?? (kind === "f" ? pick(["hose", "hose", "rock", "kleid", "shorts"]) : pick(["hose", "hose", "hose", "shorts"]));
        const topC = o.farbeOben ?? pick(OBEN3), untenC = unten === "kleid" ? topC : (o.farbeUnten ?? pick(UNTEN3));
        const top = S(topC, 0.8, { map: texStoff("strick") }), bottom = S(untenC, 0.85, { map: texStoff(unten === "hose" && r() < 0.6 ? "jeans" : "stoff") });
        const schuhe = o.schuhe ?? pick(["sneaker", "sneaker", "stiefel", "halbschuh"]);
        const shoeM = S(schuhe === "sneaker" ? pick([0xf2f2f2, 0x2a2a2a, 0x3a5a9a, 0xc43a2b]) : pick([0x1a1a1a, 0x3a2a1e, 0x5a3a28]), 0.5);
        const wide = (kind === "m" ? 1.0 + r() * 0.14 : 0.86 + r() * 0.1) * (1 + (o.bauch ?? 0) * 0.1);
        const bauch = o.bauch ?? (kind === "m" && r() < 0.2 ? 0.3 + r() * 0.5 : 0), oberweite = kind === "f" ? (o.oberweite ?? r()) : 0;
        const mk = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || g).add(m); return m; };
        const shortLeg = unten === "shorts" || unten === "rock" || unten === "kleid";
        // ---- Beine: Oberschenkel / Knie / Unterschenkel, Schuhe ----
        const hipL = new THREE.Group(), hipR = new THREE.Group(), kneeL = new THREE.Group(), kneeR = new THREE.Group();
        hipL.position.set(-0.095 * wide, 0.9, 0); hipR.position.set(0.095 * wide, 0.9, 0); g.add(hipL, hipR);
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
        mk(new THREE.CylinderGeometry(0.142 * wide, 0.165 * wide, 0.17, 18), unten === "kleid" ? top : bottom, 0, 0.94, 0).scale.z = 0.64;
        mk(new THREE.SphereGeometry(0.12 * wide, 24, 12), unten === "kleid" || unten === "rock" ? top : bottom, 0, 0.86, 0).scale.set(1, 0.55, 0.62); // Schritt: weicher Übergang zu den Beinen
        if (unten === "hose" || unten === "shorts") { // Gesäßtaschen, Hosenschlitz, Gürtel (bei Hemd)
          for (const sx of [-1, 1]) { const ta = box(0.075, 0.07, 0.006, S(dunkler(untenC, -0.05), 0.9), sx * 0.07 * wide, 0.9, -0.1 * wide, g); ta.rotation.y = Math.PI + sx * 0.3; }
          box(0.006, 0.09, 0.006, naht, 0.012, 0.9, 0.103 * wide, g);
          if (topType === "hemd") { const gu = mk(new THREE.CylinderGeometry(0.147 * wide, 0.149 * wide, 0.035, 24), S(0x2a1e16, 0.45), 0, 1.005, 0); gu.scale.z = 0.66; box(0.04, 0.03, 0.01, M(0xc8c8c0, { metalness: 0.9, roughness: 0.3 }), 0, 1.005, 0.1 * wide, g); }
        }
        const torso = mk(new THREE.CylinderGeometry(0.188 * wide, 0.152 * wide, 0.5, 20), top, 0, 1.24, 0); torso.scale.z = 0.6;
        const shoulders = mk(new THREE.SphereGeometry(0.207 * wide, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), top, 0, 1.455, 0); shoulders.scale.set(1, 0.44, 0.62);
        if (oberweite > 0.05) { const br = 0.052 + oberweite * 0.026; for (const sx of [-1, 1]) { const b = mk(new THREE.SphereGeometry(br, 24, 18), top, sx * 0.046 * wide, 1.325, 0.058 + oberweite * 0.018); b.scale.set(1.0, 0.9, 0.66 + oberweite * 0.12); } } // ueberlappend, weich eingebettet
        if (bauch > 0.15) { const bb = mk(new THREE.SphereGeometry(0.13, 24, 16), top, 0, 1.1, 0.01 + bauch * 0.05); bb.scale.set(1.25 * wide, 1.1, 0.55 + bauch * 0.3); }
        if (unten === "rock" || unten === "kleid") { const sk = mk(new THREE.CylinderGeometry(0.17 * wide, 0.27 * wide, unten === "kleid" ? 0.42 : 0.38, 24, 1, true), bottom, 0, 0.72, 0); sk.scale.z = 0.8; sk.material.side = THREE.DoubleSide; }
        // Oberteil-Details
        const lighter = S(new THREE.Color(topC).offsetHSL(0, 0, 0.1).getHex(), 0.8);
        if (topType === "hemd") {
          for (const sx of [-1, 1]) { const flap = mk(new THREE.BoxGeometry(0.07, 0.05, 0.01), lighter, sx * 0.04, 1.515, 0.075); flap.rotation.z = sx * 0.5; }
          for (let i = 0; i < 5; i++) mk(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), S(0xf2f2ee, 0.4), 0, 1.44 - i * 0.085, 0.118 - i * 0.003).rotation.x = Math.PI / 2;
        } else mk(new THREE.TorusGeometry(0.062, 0.015, 8, 20), lighter, 0, 1.53, 0).rotation.x = Math.PI / 2;
        if (topType === "hoodie") {
          const hood = mk(new THREE.SphereGeometry(0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), top, 0, 1.54, -0.09); hood.scale.set(1.1, 0.7, 0.8); hood.rotation.x = -1.2;
          mk(new THREE.BoxGeometry(0.2 * wide, 0.11, 0.02), lighter, 0, 1.07, 0.098 + bauch * 0.05);
          for (const sx of [-1, 1]) mk(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), S(0xeeeeee), sx * 0.03, 1.45, 0.112);
        }
        if (topType === "pulli") for (let i = 0; i < 3; i++) mk(new THREE.TorusGeometry(0.152 * wide - i * 0.001, 0.008, 6, 24), lighter, 0, 1.0 + i * 0.015, 0).scale.z = 0.62;
        const jacke = o.jacke ?? (r() < 0.25);
        let armMat = top;
        if (jacke) {
          const jc = S(pick(JACKE3), 0.7);
          const shell = mk(new THREE.CylinderGeometry(0.216 * wide, 0.175 * wide, 0.56, 22, 1, true, Math.PI * 0.6, Math.PI * 1.8), jc, 0, 1.22, 0); shell.scale.z = 0.68; shell.material.side = THREE.DoubleSide;
          for (const sx of [-1, 1]) { const rev = mk(new THREE.BoxGeometry(0.045, 0.2, 0.012), jc, sx * 0.075, 1.42, 0.125); rev.rotation.z = sx * 0.3; }
          armMat = jc;
        }
        // ---- Arme, Ellbogen, Hände mit Fingern ----
        const shL = new THREE.Group(), shR = new THREE.Group(); shL.position.set(-0.235 * wide, 1.44, 0); shR.position.set(0.235 * wide, 1.44, 0); g.add(shL, shR);
        const elL = new THREE.Group(), elR = new THREE.Group(); const kurzarm = topType === "tshirt" && !jacke; const hands = [];
        for (const [sh, el, sx] of [[shL, elL, -1], [shR, elR, 1]]) {
          mk(new THREE.SphereGeometry(0.062, 16, 12), armMat, 0, 0, 0, sh);
          if (kurzarm) { mk(new THREE.CylinderGeometry(0.064, 0.058, 0.15, 24), armMat, 0, -0.075, 0, sh); mk(new THREE.CylinderGeometry(0.05, 0.0465, 0.16, 24), skin, 0, -0.22, 0, sh); }
          else mk(new THREE.CylinderGeometry(0.056, 0.047, 0.3, 16), armMat, 0, -0.15, 0, sh);
          el.position.y = -0.3; sh.add(el);
          mk(new THREE.SphereGeometry(0.0465, 24, 16), kurzarm ? skin : armMat, 0, 0, 0, el);
          mk(new THREE.CylinderGeometry(0.046, 0.036, 0.25, 24), kurzarm ? skin : armMat, 0, -0.125, 0, el);
          if (!kurzarm) mk(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), lighter, 0, -0.245, 0, el); // Bündchen
          const hand = new THREE.Group(); hand.position.set(0, -0.27, 0.0); el.add(hand);
          const palm = mk(new THREE.BoxGeometry(0.06, 0.07, 0.025), skin, 0, -0.03, 0, hand); palm.geometry.translate(0, 0, 0);
          for (let f = 0; f < 4; f++) { const fl = 0.034 + (f === 1 || f === 2 ? 0.008 : 0); const fi = mk(new THREE.CapsuleGeometry(0.0075, fl, 3, 6), skin, -0.021 + f * 0.014, -0.07 - fl / 2, 0.002, hand); fi.rotation.x = 0.25 + (f % 2) * 0.08; }
          const th = mk(new THREE.CapsuleGeometry(0.0085, 0.03, 3, 6), skin, -sx * 0.034, -0.035, 0.012, hand); th.rotation.z = -sx * 0.7; th.rotation.x = 0.3;
          hand.rotation.y = sx * 0.15; hands.push(hand);
        }
        // ---- Hals, Kopf, Gesicht ----
        mk(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 12), skin, 0, 1.57, 0);
        const head = new THREE.Group(); head.position.set(0, 1.69, 0); g.add(head);
        const skull = mk(new THREE.SphereGeometry(0.12, 28, 22), skin, 0, 0, 0, head); skull.scale.set(kind === "m" ? 0.94 : 0.9, 1.1, 1.0);
        const jawM = mk(new THREE.SphereGeometry(0.085, 24, 16), skin, 0, -0.05, 0.012, head); jawM.scale.set(kind === "m" ? 1.02 : 0.92, 0.82, 0.92);
        for (const sx of [-1, 1]) { const ear = mk(new THREE.SphereGeometry(0.026, 10, 8), skin, sx * 0.108, -0.005, -0.005, head); ear.scale.set(0.45, 1, 0.8); }
        const face = new THREE.Group(); head.add(face);
        const white = S(0xf6f4ef, 0.3), iris = S(pick([0x3a5a8a, 0x5a3a20, 0x3a6a4a, 0x2a1a10, 0x6a6a7a, 0x8a6a3a]), 0.3), pupil = S(0x080808, 0.2);
        const eyes = [];
        for (const sx of [-1, 1]) {
          const e = new THREE.Group(); e.position.set(sx * 0.043, 0.02, 0.1); face.add(e);
          mk(new THREE.SphereGeometry(0.022, 16, 12), white, 0, 0, 0, e).scale.set(1.2, 0.95, 0.55);
          mk(new THREE.SphereGeometry(0.0125, 14, 10), iris, 0, -0.001, 0.0095, e).scale.z = 0.45;
          mk(new THREE.SphereGeometry(0.006, 10, 8), pupil, 0, -0.001, 0.0138, e).scale.z = 0.4;
          mk(new THREE.SphereGeometry(0.0028, 6, 4), S(0xffffff, 0.1), 0.004, 0.004, 0.0152, e);
          if (kind === "f") for (let l = 0; l < 3; l++) { const lash = mk(new THREE.BoxGeometry(0.003, 0.009, 0.002), S(0x111111), sx * (0.012 + l * 0.009), 0.019, 0.006, e); lash.rotation.z = sx * (0.3 + l * 0.25); }
          const brow = mk(new THREE.BoxGeometry(0.046, kind === "m" ? 0.013 : 0.009, 0.014), hair, sx * 0.045, 0.055, 0.106, face); brow.rotation.z = sx * -(0.06 + r() * 0.14);
          eyes.push(e);
        }
        const nose = mk(new THREE.SphereGeometry(kind === "m" ? 0.022 : 0.018, 14, 10), skin, 0, -0.016, 0.116, face); nose.scale.set(0.75, 1.05, 0.95);
        const lip = kind === "f" ? S(pick([0xa83a40, 0x8a3a34, 0xc85a5a]), 0.4) : S(new THREE.Color(skinC).offsetHSL(0, 0.1, -0.18).getHex(), 0.5);
        const mouth = mk(new THREE.CapsuleGeometry(kind === "f" ? 0.007 : 0.0055, 0.034, 4, 8), lip, 0, -0.062, 0.104, face); mouth.rotation.z = Math.PI / 2;
        // ---- Frisuren ----
        const style = o.hair ?? (kind === "f" ? pick(["lang", "lang", "pferdeschwanz", "bob", "dutt", "locken", "afro", "pony", "kurz"]) : pick(["kurz", "kurz", "seitenscheitel", "undercut", "glatze", "locken", "afro", "pony"]));
        const cap = (thetaLen = 0.47, rot = -0.38) => { const c = mk(new THREE.SphereGeometry(0.127, 26, 16, 0, Math.PI * 2, 0, Math.PI * thetaLen), hair, 0, 0.012, -0.004, head); c.scale.set(0.95, 1.12, 1.04); c.rotation.x = rot; return c; };
        if (style === "kurz") cap(0.47);
        if (style === "seitenscheitel") { cap(0.48); const f = mk(new THREE.BoxGeometry(0.17, 0.035, 0.07), hair, 0.012, 0.1, 0.07, head); f.rotation.set(0.35, 0, -0.18); }
        if (style === "pony") { cap(0.47); const f = mk(new THREE.BoxGeometry(0.19, 0.04, 0.05), hair, 0, 0.1, 0.085, head); f.rotation.x = 0.55; }
        if (style === "lang") { cap(0.47); const back = mk(new THREE.CapsuleGeometry(0.1, 0.2, 6, 14), hair, 0, -0.11, -0.06, head); back.scale.set(1.18, 1, 0.55); for (const sx of [-1, 1]) { const side = mk(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), hair, sx * 0.105, -0.07, 0.0, head); side.rotation.z = sx * 0.08; } }
        if (style === "bob") { cap(0.47); const b = mk(new THREE.SphereGeometry(0.135, 22, 14, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.4), hair, 0, 0.0, -0.01, head); b.scale.set(1.02, 1.0, 1.05); b.material = hair; const cut = mk(new THREE.BoxGeometry(0.2, 0.06, 0.02), skin, 0, -0.2, 0.2, head); cut.visible = false; }
        if (style === "pferdeschwanz") { cap(0.47); mk(new THREE.SphereGeometry(0.03, 10, 8), hair, 0, 0.06, -0.12, head); const pt = mk(new THREE.CapsuleGeometry(0.035, 0.18, 4, 10), hair, 0, -0.06, -0.16, head); pt.rotation.x = 0.25; }
        if (style === "dutt") { cap(0.47); mk(new THREE.SphereGeometry(0.055, 14, 10), hair, 0, 0.1, -0.1, head); }
        if (style === "locken" || style === "afro") { const n = style === "afro" ? 48 : 26, R = style === "afro" ? 0.15 : 0.12; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, b = r() * (style === "afro" ? 1.25 : 1.0); mk(new THREE.SphereGeometry((style === "afro" ? 0.045 : 0.035) + r() * 0.015, 8, 6), hair, Math.sin(b) * Math.cos(a) * R, 0.03 + Math.cos(b) * R * 0.95, Math.sin(b) * Math.sin(a) * R - 0.03, head); } }
        if (style === "undercut") { const c = cap(0.3, -0.25); c.scale.set(0.9, 1.25, 1.0); const top2 = mk(new THREE.BoxGeometry(0.12, 0.05, 0.2), hair, 0, 0.13, 0.0, head); top2.rotation.x = -0.15; const side = cap(0.5); side.material = S(new THREE.Color(hairC).lerp(new THREE.Color(skinC), 0.55).getHex(), 0.9); side.scale.multiplyScalar(0.985); }
        if (style === "glatze") { const c = cap(0.3); c.material = S(new THREE.Color(skinC).offsetHSL(0, 0, -0.04).getHex(), 0.45); }
        // ---- Bärte ----
        const bart = o.bart ?? (kind === "m" ? pick(["keiner", "keiner", "vollbart", "dreitage", "schnurrbart", "kinnbart"]) : "keiner");
        if (bart === "vollbart") { const b = mk(new THREE.SphereGeometry(0.093, 20, 14, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), hair, 0, -0.035, 0.02, head); b.scale.set(1.0, 0.95, 1.02); }
        if (bart === "dreitage") { const b = mk(new THREE.SphereGeometry(0.0875, 20, 14, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.42), S(new THREE.Color(skinC).lerp(new THREE.Color(hairC), 0.45).getHex(), 0.9), 0, -0.05, 0.014, head); b.scale.set(0.99, 0.84, 0.93); }
        if (bart === "schnurrbart") { const b = mk(new THREE.CapsuleGeometry(0.008, 0.045, 4, 8), hair, 0, -0.046, 0.109, face); b.rotation.z = Math.PI / 2; }
        if (bart === "kinnbart") { mk(new THREE.SphereGeometry(0.03, 12, 10), hair, 0, -0.105, 0.075, head).scale.set(1, 1.2, 0.8); const m2 = mk(new THREE.CapsuleGeometry(0.007, 0.04, 4, 8), hair, 0, -0.047, 0.108, face); m2.rotation.z = Math.PI / 2; }
        if (o.brille ?? r() < 0.18) { const gm = S(pick([0x1a1a1a, 0x6a4a2a, 0xb8b8c0]), 0.3); for (const sx of [-1, 1]) mk(new THREE.TorusGeometry(0.024, 0.0035, 6, 18), gm, sx * 0.042, 0.018, 0.112, face); mk(new THREE.BoxGeometry(0.03, 0.004, 0.004), gm, 0, 0.022, 0.114, face); }
        const kindlich = o.alter === "kind"; if (kindlich) head.scale.setScalar(1.28);
        const sc = o.scale ?? (kindlich ? 0.5 + r() * 0.14 : kind === "m" ? 0.96 + r() * 0.12 : 0.9 + r() * 0.1);
        g.scale.setScalar(sc);
        g.userData = { hipL, hipR, kneeL, kneeR, shL, shR, elL, elR, head, face, eyes, handL: hands[0], handR: hands[1], phase: r() * 6.28, r };
        return g;
      }
      function idle(p, t) { // Atmen, Gewicht verlagern, Blinzeln, Blick - nie synchron
        const u = p.userData, k = t * 1.3 + u.phase;
        u.shL.rotation.x = Math.sin(k) * 0.05; u.shR.rotation.x = -Math.sin(k * 0.9) * 0.05;
        u.elL.rotation.x = -0.12 - Math.sin(k * 0.7) * 0.04; u.elR.rotation.x = -0.12 - Math.cos(k * 0.6) * 0.04;
        u.head.rotation.y = Math.sin(k * 0.4) * 0.25; p.rotation.z = Math.sin(k * 0.5) * 0.012;
        const blink = ((t + u.phase) % 3.7) < 0.12; u.eyes.forEach((e) => (e.scale.y = blink ? 0.1 : 1));
      }
      function walk(p, t, speed = 1) {
        const u = p.userData, k = t * 6 * speed + u.phase, a = Math.sin(k) * 0.45;
        u.hipL.rotation.x = a; u.hipR.rotation.x = -a; u.kneeL.rotation.x = Math.max(0, -Math.cos(k)) * 0.6; u.kneeR.rotation.x = Math.max(0, Math.cos(k)) * 0.6;
        u.shL.rotation.x = -a * 0.8; u.shR.rotation.x = a * 0.8;
        u.elL.rotation.x = -0.3 - Math.max(0, -a) * 0.5; u.elR.rotation.x = -0.3 - Math.max(0, a) * 0.5;
        p.position.y = Math.abs(Math.cos(k)) * 0.03;
      }

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
      function rennen(p, t, speed = 1.6) { walk(p, t, speed); const u = p.userData; u.shL.rotation.x *= 1.4; u.shR.rotation.x *= 1.4; p.position.y = Math.abs(Math.cos(t * 6 * speed + u.phase)) * 0.07; }
