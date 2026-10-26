// node probe.cjs <projektordner> '<json: [{id, T, pos?, ziel?, fov?, out, js?}]>'  -> PNGs; js = Code, der vor dem Render im Seitenkontext läuft
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const root = process.argv[2]; const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.end(d); } }); }).listen(8770);
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (/rror|PROBE/.test(m.text())) console.log('CON', m.text().slice(0, 400)); });
  await p.goto('http://localhost:8770/probe.html', { timeout: 600000 }); await p.waitForFunction(() => window.__b, null, { timeout: 600000 }); await p.evaluate(() => Promise.all(Object.values((window.__hf || {}).buildReady || {})));
  for (const spec of JSON.parse(process.argv[3])) {
    const info = await p.evaluate((sp) => { const B = window.__b; const sh = B.SHOTS.find((x) => x.id === sp.id); const w = B.W[sp.id];
      Object.entries(B.POST_STANDARD).forEach(([k, v]) => (B.POST.uniforms[k].value = v)); B.POST.look(w.look ?? "neutral"); Object.entries(w.post || {}).forEach(([k, v]) => { if (Array.isArray(v)) B.POST.uniforms[k].value.set(...v); else B.POST.uniforms[k].value = v; });
      B.wind(sp.T); w.update(sp.T - sh.t0, sp.T); const c = w.camera; if (sp.pos) { c.position.set(...sp.pos); c.lookAt(new THREE.Vector3(...sp.ziel)); if (sp.fov) { c.fov = sp.fov; c.updateProjectionMatrix(); } }
      let out = ""; if (sp.js) out = String(eval(sp.js)); c.updateMatrixWorld(); B.POST.render(w.scene, c, sp.T, null); return out; }, spec);
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.85)); fs.writeFileSync(spec.out, Buffer.from(data.split(',')[1], 'base64')); console.log('bild', spec.out, info); }
  await b.close(); srv.close(); })();
