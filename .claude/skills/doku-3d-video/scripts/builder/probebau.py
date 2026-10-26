import sys
s=open("compositions/welt.html").read()
inner=s.split("<template>",1)[1].rsplit("</template>",1)[0]
a='window.__timelines["welt"] = tl;'
assert a in inner
inner=inner.replace(a, a+' window.__b = { renderAt, POST, W, SHOTS, POST_STANDARD, wind, renderer };')
open("probe.html","w").write('<!doctype html><html><head><meta charset="UTF-8"><script src="assets/vendor/gsap.min.js"></script></head><body><script>window.__timelines={};</script>'+inner+'</body></html>')
