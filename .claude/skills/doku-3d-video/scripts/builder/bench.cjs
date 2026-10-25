const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const root = process.argv[2]; const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.end(d); } }); }).listen(8766);
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('ERR', e.message)); p.on('console', (m) => { if (/tempo|rror|gruende/.test(m.text())) console.log('CON', m.text().slice(0, 300)); }); const t0 = Date.now();
  await p.goto('http://localhost:8766/bench.html', { timeout: 600000 }); await p.waitForFunction(() => window.__b, null, { timeout: 600000 }); console.log('init s', (Date.now() - t0) / 1000);
  const configs = JSON.parse(process.argv[3]);
  for (const [name, ov] of configs) { const ms = await p.evaluate(([ov]) => { const B = window.__b; Object.values(B.W).forEach((w) => { w._p = w._p || Object.assign({}, w.post); w.post = Object.assign({}, w._p, ov.post || {}); }); if (ov.spiegel === false) Object.values(B.W).forEach((w) => { const sp = w.scene.userData.spiegel; if (sp && sp.length) { sp.forEach((x) => (x.m.visible = false)); w.scene.userData.spiegel = []; } });
      if (ov.schatten != null) B.renderer.shadowMap.enabled = ov.schatten; const gl = B.renderer.getContext(), px = new Uint8Array(4); const res = [];
      for (const T of [1.5, 5.5]) { B.renderAt(T); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const a = performance.now(); B.renderAt(T + 0.033); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); res.push(performance.now() - a); } return res; }, [ov]);
    console.log(name, ms.map((x) => (x / 1000).toFixed(2) + 's').join(' ')); }
  await b.close(); srv.close(); })();
